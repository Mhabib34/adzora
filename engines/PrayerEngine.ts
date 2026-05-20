import { PrayerTimes, Coordinates } from "adhan";
import { getCalculationMethod, getAsrMethod } from "../lib/prayer/methods";
import { dateToKey, addMinutes } from "../lib/utils/time";
import {
  savePrayerSchedules,
  getPrayerSchedule,
  getPrayerScheduleCount,
  clearPrayerSchedules,
} from "../db/MasjidDB";
import {
  PRAYER_KEY_TO_NAME,
  PRAYER_KEYS,
  type PrayerKey,
  type PrayerTime,
  type DailyPrayerSchedule,
  type NextPrayer,
  type PrayerCalculationConfig,
  type IqomahConfig,
} from "../types/prayer";
import type { StoredPrayerSchedule } from "../db/schema";

interface CoordinatesInput {
  latitude: number;
  longitude: number;
}

/** Deserializes a StoredPrayerSchedule back into a DailyPrayerSchedule. */
function deserializeSchedule(
  stored: StoredPrayerSchedule,
): DailyPrayerSchedule {
  const prayers = JSON.parse(stored.prayersJson) as Array<{
    key: PrayerKey;
    name: string;
    time: string;
    iqomahTime: string | null;
  }>;

  return {
    date: stored.date,
    prayers: prayers.map((p) => ({
      key: p.key,
      name: p.name as PrayerTime["name"],
      time: new Date(p.time),
      iqomahTime: p.iqomahTime ? new Date(p.iqomahTime) : null,
    })),
  };
}

/**
 * Core prayer time calculation and persistence engine.
 * Uses adhan-js for calculation and Dexie for storage.
 */
export class PrayerEngine {
  private calculationConfig: PrayerCalculationConfig;
  private iqomahConfig: IqomahConfig;
  private coords: CoordinatesInput;

  constructor(
    calculationConfig: PrayerCalculationConfig,
    iqomahConfig: IqomahConfig,
    coords: CoordinatesInput,
  ) {
    this.calculationConfig = calculationConfig;
    this.iqomahConfig = iqomahConfig;
    this.coords = coords;
  }

  /**
   * Calculates prayer times for a single day.
   * Applies manual minute offsets from calculationConfig.
   * Attaches iqomah times to each prayer (except Syuruq).
   */
  calculateDay(date: Date): DailyPrayerSchedule {
    const coords = new Coordinates(this.coords.latitude, this.coords.longitude);

    const params = getCalculationMethod(this.calculationConfig.method);
    params.madhab = getAsrMethod(this.calculationConfig.asrMethod);

    const pt = new PrayerTimes(coords, date, params);
    const offsets = this.calculationConfig.offsets;
    const iqomahDurations = this.iqomahConfig.durations;

    const prayers: PrayerTime[] = PRAYER_KEYS.map((key) => {
      const rawTime: Date =
        pt[
          key === "fajr"
            ? "fajr"
            : key === "sunrise"
              ? "sunrise"
              : key === "dhuhr"
                ? "dhuhr"
                : key === "asr"
                  ? "asr"
                  : key === "maghrib"
                    ? "maghrib"
                    : "isha"
        ];

      const time = addMinutes(rawTime, offsets[key]);

      // Syuruq (sunrise) has no iqomah
      const iqomahTime =
        key !== "sunrise" && key in iqomahDurations
          ? addMinutes(
              time,
              iqomahDurations[key as Exclude<PrayerKey, "sunrise">],
            )
          : null;

      return {
        key,
        name: PRAYER_KEY_TO_NAME[key],
        time,
        iqomahTime,
      };
    });

    return { date: dateToKey(date), prayers };
  }

  /**
   * Pre-computes prayer schedules for 365 days starting from startDate.
   * Saves all results to IndexedDB in a single bulkPut call.
   * Should be called once when setup is complete or location changes.
   */
  async calculateYear(startDate: Date): Promise<void> {
    const schedules: StoredPrayerSchedule[] = [];

    for (let i = 0; i < 365; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);

      const daily = this.calculateDay(date);

      schedules.push({
        date: daily.date,
        prayersJson: JSON.stringify(
          daily.prayers.map((p) => ({
            key: p.key,
            name: p.name,
            time: p.time.toISOString(),
            iqomahTime: p.iqomahTime?.toISOString() ?? null,
          })),
        ),
      });
    }

    await savePrayerSchedules(schedules);
  }

  /**
   * Returns the prayer schedule for today.
   * Falls back to live calculation if IndexedDB has no entry for today.
   */
  async getTodaySchedule(): Promise<DailyPrayerSchedule> {
    const key = dateToKey(new Date());

    try {
      const stored = await getPrayerSchedule(key);
      if (stored) return deserializeSchedule(stored);
    } catch {
      // fall through to live calculation
    }

    // Fallback: calculate on the fly (offline, no pre-computed data)
    return this.calculateDay(new Date());
  }

  /**
   * Checks if 365-day pre-computation is needed.
   * Returns true if the DB has fewer than 300 entries
   * (allows for partial data / year rollover).
   */
  async needsPrecomputation(): Promise<boolean> {
    const count = await getPrayerScheduleCount();
    return count < 300;
  }

  /**
   * Clears all stored schedules and re-computes from today.
   * Called when location or calculation method changes.
   */
  async recompute(): Promise<void> {
    await clearPrayerSchedules();
    await this.calculateYear(new Date());
  }

  /**
   * Given the current time and today's prayer list, returns the next prayer
   * along with remaining seconds and current status.
   *
   * Status:
   *  - "adzan"   → within 0–30s after prayer time (adzan window)
   *  - "iqomah"  → between adzan end and iqomah time
   *  - "normal"  → countdown to next prayer
   */
  getNextPrayer(now: Date, prayers: PrayerTime[]): NextPrayer | null {
    const nowMs = now.getTime();

    // Find the next prayer whose time is still in the future
    const upcoming = prayers.find((p) => p.time.getTime() > nowMs);

    if (upcoming) {
      const remainingSeconds = Math.floor(
        (upcoming.time.getTime() - nowMs) / 1000,
      );
      return {
        prayer: upcoming,
        remainingSeconds,
        status: "normal",
      };
    }

    // All prayers have passed — find the last one and check adzan/iqomah window
    const lastPrayer = [...prayers]
      .reverse()
      .find((p) => p.time.getTime() <= nowMs);

    if (!lastPrayer) return null;

    const secondsSincePrayer = Math.floor(
      (nowMs - lastPrayer.time.getTime()) / 1000,
    );

    // Adzan window: 0–30 seconds after prayer time
    if (secondsSincePrayer <= 30) {
      return {
        prayer: lastPrayer,
        remainingSeconds: 0,
        status: "adzan",
      };
    }

    // Iqomah window: after adzan, before iqomah time
    if (lastPrayer.iqomahTime) {
      const iqomahMs = lastPrayer.iqomahTime.getTime();
      if (nowMs < iqomahMs) {
        return {
          prayer: lastPrayer,
          remainingSeconds: Math.floor((iqomahMs - nowMs) / 1000),
          status: "iqomah",
        };
      }
    }

    // Past last prayer and iqomah — nothing next today
    return null;
  }
}
