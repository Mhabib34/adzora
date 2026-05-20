/**
 * Data types for prayer times, calculation methods, and iqomah config.
 */

export type PrayerName =
  | "Subuh"
  | "Syuruq"
  | "Dzuhur"
  | "Ashar"
  | "Maghrib"
  | "Isya";

/** Internal adhan-js keys — different from display names */
export type PrayerKey =
  | "fajr"
  | "sunrise"
  | "dhuhr"
  | "asr"
  | "maghrib"
  | "isha";

export const PRAYER_KEY_TO_NAME: Record<PrayerKey, PrayerName> = {
  fajr: "Subuh",
  sunrise: "Syuruq",
  dhuhr: "Dzuhur",
  asr: "Ashar",
  maghrib: "Maghrib",
  isha: "Isya",
};

export const PRAYER_KEYS: PrayerKey[] = [
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
  /** Prayer time as a Date object */
  time: Date;
  /** Iqomah time as a Date object (null for Syuruq) */
  iqomahTime: Date | null;
}

export interface DailyPrayerSchedule {
  /** Format: "YYYY-MM-DD" */
  date: string;
  prayers: PrayerTime[];
}

export interface PrayerCalculationConfig {
  /** Prayer time calculation method */
  method: CalculationMethodKey;
  /** Madhab used for Asr calculation */
  asrMethod: AsrMethodKey;
  /** Manual offset per prayer in minutes */
  offsets: Record<PrayerKey, number>;
}

export type CalculationMethodKey =
  | "MoonsightingCommittee"
  | "Kemenag"
  | "MuslimWorldLeague"
  | "ISNA";

export type AsrMethodKey = "Shafi" | "Hanafi";

export interface IqomahConfig {
  /** Iqomah duration in minutes per prayer (excludes Syuruq) */
  durations: Record<Exclude<PrayerKey, "sunrise">, number>;
}

export interface NextPrayer {
  prayer: PrayerTime;
  /** Remaining time in seconds */
  remainingSeconds: number;
  /** Current status of this prayer slot */
  status: "normal" | "adzan" | "iqomah";
}
