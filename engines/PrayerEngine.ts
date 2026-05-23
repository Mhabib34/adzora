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
 * Imsak dihitung sebagai fajr - imsakMinutesBeforeFajr menit.
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

  /** Calculates prayer times for a single day including Imsak. */
  calculateDay(date: Date): DailyPrayerSchedule {
    const coords = new Coordinates(this.coords.latitude, this.coords.longitude);
    const params = getCalculationMethod(this.calculationConfig.method);
    params.madhab = getAsrMethod(this.calculationConfig.asrMethod);

    const pt = new PrayerTimes(coords, date, params);
    const offsets = this.calculationConfig.offsets;
    const iqomahDurations = this.iqomahConfig.durations;
    const imsakOffset = this.calculationConfig.imsakMinutesBeforeFajr ?? 10;

    // Hitung waktu dasar dari adhan
    const rawTimes: Record<string, Date> = {
      fajr: pt.fajr,
      sunrise: pt.sunrise,
      dhuhr: pt.dhuhr,
      asr: pt.asr,
      maghrib: pt.maghrib,
      isha: pt.isha,
    };

    // Imsak = fajr - imsakOffset menit + offset kustom imsak
    const fajrWithOffset = addMinutes(
      rawTimes.fajr,
      offsets["fajr"] ?? 0,
    );
    rawTimes["imsak"] = addMinutes(fajrWithOffset, -imsakOffset);

    const ORDERED_KEYS: PrayerKey[] = [
      "imsak",
      "fajr",
      "sunrise",
      "dhuhr",
      "asr",
      "maghrib",
      "isha",
    ];

    const prayers: PrayerTime[] = ORDERED_KEYS.map((key) => {
      const base = rawTimes[key];
      // Untuk imsak, offset sudah dimasukkan saat hitung, tapi tetap tambah offset kustom
      const time =
        key === "imsak"
          ? addMinutes(base, offsets["imsak"] ?? 0)
          : addMinutes(base, offsets[key] ?? 0);

      // Syuruq dan Imsak tidak punya iqomah
      const iqomahTime =
        key !== "sunrise" && key !== "imsak" && key in iqomahDurations
          ? addMinutes(
            time,
            iqomahDurations[key as Exclude<PrayerKey, "imsak" | "sunrise">],
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

  async getTodaySchedule(): Promise<DailyPrayerSchedule> {
    const key = dateToKey(new Date());
    try {
      const stored = await getPrayerSchedule(key);
      if (stored) {
        const schedule = deserializeSchedule(stored);
        // Migrasi/Invalidasi otomatis jika cache lama masih mengandung "dhuha"
        if (schedule.prayers.some((p) => p.key === ("dhuha" as any))) {
          await clearPrayerSchedules();
          return this.calculateDay(new Date());
        }
        return schedule;
      }
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
   * Imsak tidak trigger adzan — skip saat cek adzan window.
   */
  getNextPrayer(now: Date, prayers: PrayerTime[]): NextPrayer | null {
    const nowMs = now.getTime();

    // Pastikan array selalu urut berdasarkan waktu aktual 
    // (Sangat penting jika user memberikan offset ekstrem untuk testing yang mengubah urutan natural sholat)
    const sortedPrayers = [...prayers].sort((a, b) => a.time.getTime() - b.time.getTime());

    const lastPrayer = [...sortedPrayers]
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

    const upcoming = sortedPrayers.find((p) => p.time.getTime() > nowMs);

    if (upcoming) {
      return {
        prayer: upcoming,
        remainingSeconds: Math.floor((upcoming.time.getTime() - nowMs) / 1000),
        status: "normal",
      };
    }

    // Jika semua waktu sholat hari ini sudah lewat (biasanya setelah Isya),
    // maka kita cari waktu sholat pertama di hari esok.
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Hitung jadwal hari esok secara live (tanpa DB lookup agar tetap synchronous)
    const tomorrowSchedule = this.calculateDay(tomorrow);
    
    // Filter jadwal esok hari agar sama dengan daftar parameter prayers (misal: membuang Syuruq)
    const allowedKeys = new Set(prayers.map((p) => p.key));
    const tomorrowAllowed = tomorrowSchedule.prayers.filter((p) => allowedKeys.has(p.key));
    
    // Urutkan jadwal esok hari dan ambil yang pertama
    const tomorrowSorted = tomorrowAllowed.sort((a, b) => a.time.getTime() - b.time.getTime());
    const tomorrowNext = tomorrowSorted[0];

    if (tomorrowNext) {
      return {
        prayer: tomorrowNext,
        remainingSeconds: Math.floor((tomorrowNext.time.getTime() - nowMs) / 1000),
        status: "normal",
      };
    }

    return null;
  }
}
