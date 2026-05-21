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
 * Core prayer time calculation engine.
 * Dhuha dihitung sebagai sunrise + dhuhaMinutesAfterSunrise menit.
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

  /** Calculates prayer times for a single day including Dhuha. */
  calculateDay(date: Date): DailyPrayerSchedule {
    const coords = new Coordinates(this.coords.latitude, this.coords.longitude);
    const params = getCalculationMethod(this.calculationConfig.method);
    params.madhab = getAsrMethod(this.calculationConfig.asrMethod);

    const pt = new PrayerTimes(coords, date, params);
    const offsets = this.calculationConfig.offsets;
    const iqomahDurations = this.iqomahConfig.durations;
    const dhuhaOffset = this.calculationConfig.dhuhaMinutesAfterSunrise ?? 20;

    // Hitung waktu dasar dari adhan
    const rawTimes: Record<string, Date> = {
      fajr: pt.fajr,
      sunrise: pt.sunrise,
      dhuhr: pt.dhuhr,
      asr: pt.asr,
      maghrib: pt.maghrib,
      isha: pt.isha,
    };

    // Dhuha = sunrise + dhuhaOffset menit + offset kustom dhuha
    const sunriseWithOffset = addMinutes(
      rawTimes.sunrise,
      offsets["sunrise"] ?? 0,
    );
    rawTimes["dhuha"] = addMinutes(sunriseWithOffset, dhuhaOffset);

    const ORDERED_KEYS: PrayerKey[] = [
      "fajr",
      "sunrise",
      "dhuha",
      "dhuhr",
      "asr",
      "maghrib",
      "isha",
    ];

    const prayers: PrayerTime[] = ORDERED_KEYS.map((key) => {
      const base = rawTimes[key];
      // Untuk dhuha, offset sudah dimasukkan saat hitung, tapi tetap tambah offset kustom
      const time =
        key === "dhuha"
          ? addMinutes(base, offsets["dhuha"] ?? 0)
          : addMinutes(base, offsets[key] ?? 0);

      // Syuruq dan Dhuha tidak punya iqomah
      const iqomahTime =
        key !== "sunrise" && key !== "dhuha" && key in iqomahDurations
          ? addMinutes(
            time,
            iqomahDurations[key as Exclude<PrayerKey, "sunrise" | "dhuha">],
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

  /** Pre-computes prayer schedules for 365 days. */
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

  /** Returns today's schedule, falling back to live calculation. */
  async getTodaySchedule(): Promise<DailyPrayerSchedule> {
    const key = dateToKey(new Date());
    try {
      const stored = await getPrayerSchedule(key);
      if (stored) return deserializeSchedule(stored);
    } catch {
      /* fall through */
    }
    return this.calculateDay(new Date());
  }

  async needsPrecomputation(): Promise<boolean> {
    const count = await getPrayerScheduleCount();
    return count < 300;
  }

  async recompute(): Promise<void> {
    await clearPrayerSchedules();
    await this.calculateYear(new Date());
  }

  /**
   * Returns the next upcoming prayer and its status.
   * Dhuha tidak trigger adzan — skip saat cek adzan window.
   */
  getNextPrayer(now: Date, prayers: PrayerTime[]): NextPrayer | null {
    const nowMs = now.getTime();

    const lastPrayer = [...prayers]
      .reverse()
      .find((p) => p.time.getTime() <= nowMs);

    if (lastPrayer) {
      const secondsSince = Math.floor(
        (nowMs - lastPrayer.time.getTime()) / 1000,
      );

      if (secondsSince <= 30) {
        return { prayer: lastPrayer, remainingSeconds: 0, status: "adzan" };
      }

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
    }

    const upcoming = prayers.find((p) => p.time.getTime() > nowMs);

    if (upcoming) {
      return {
        prayer: upcoming,
        remainingSeconds: Math.floor((upcoming.time.getTime() - nowMs) / 1000),
        status: "normal",
      };
    }

    return null;
  }
}
