export type PrayerName =
  | "Subuh"
  | "Syuruq"
  | "Dhuha"
  | "Dzuhur"
  | "Ashar"
  | "Maghrib"
  | "Isya";
export type PrayerKey =
  | "fajr"
  | "sunrise"
  | "dhuha"
  | "dhuhr"
  | "asr"
  | "maghrib"
  | "isha";

export const PRAYER_KEY_TO_NAME: Record<PrayerKey, PrayerName> = {
  fajr: "Subuh",
  sunrise: "Syuruq",
  dhuha: "Dhuha",
  dhuhr: "Dzuhur",
  asr: "Ashar",
  maghrib: "Maghrib",
  isha: "Isya",
};

export const PRAYER_KEYS: PrayerKey[] = [
  "fajr",
  "sunrise",
  "dhuha",
  "dhuhr",
  "asr",
  "maghrib",
  "isha",
];

export interface PrayerTime {
  key: PrayerKey;
  name: PrayerName;
  time: Date;
  iqomahTime: Date | null;
}

export interface DailyPrayerSchedule {
  date: string; // "YYYY-MM-DD"
  prayers: PrayerTime[];
}

export interface PrayerCalculationConfig {
  method: CalculationMethodKey;
  asrMethod: AsrMethodKey;
  offsets: Record<PrayerKey, number>;
  /** Menit setelah Syuruq untuk menghitung waktu Dhuha. Default: 20 */
  dhuhaMinutesAfterSunrise: number;
}

export type CalculationMethodKey =
  | "MoonsightingCommittee"
  | "Kemenag"
  | "MuslimWorldLeague"
  | "ISNA";
export type AsrMethodKey = "Shafi" | "Hanafi";

export interface IqomahConfig {
  durations: Record<Exclude<PrayerKey, "sunrise" | "dhuha">, number>;
}

export interface NextPrayer {
  prayer: PrayerTime;
  remainingSeconds: number;
  status: "normal" | "adzan" | "iqomah";
}
