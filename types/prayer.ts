export type PrayerName =
  | "Imsak"
  | "Subuh"
  | "Syuruq"
  | "Dzuhur"
  | "Ashar"
  | "Maghrib"
  | "Isya";
export type PrayerKey =
  | "imsak"
  | "fajr"
  | "sunrise"
  | "dhuhr"
  | "asr"
  | "maghrib"
  | "isha";

export const PRAYER_KEY_TO_NAME: Record<PrayerKey, PrayerName> = {
  imsak: "Imsak",
  fajr: "Subuh",
  sunrise: "Syuruq",
  dhuhr: "Dzuhur",
  asr: "Ashar",
  maghrib: "Maghrib",
  isha: "Isya",
};

export const PRAYER_KEYS: PrayerKey[] = [
  "imsak",
  "fajr",
  "sunrise",
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
  /** Menit sebelum Subuh untuk menghitung waktu Imsak. Default: 10 */
  imsakMinutesBeforeFajr: number;
}

export type CalculationMethodKey =
  | "MoonsightingCommittee"
  | "Kemenag"
  | "MuslimWorldLeague"
  | "ISNA";
export type AsrMethodKey = "Shafi" | "Hanafi";

export interface IqomahConfig {
  durations: Record<Exclude<PrayerKey, "imsak" | "sunrise">, number>;
}

export interface NextPrayer {
  prayer: PrayerTime;
  remainingSeconds: number;
  status: "normal" | "adzan" | "iqomah";
}
