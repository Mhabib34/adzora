import { toHijri as _toHijri } from "hijri-converter";

/** Represents a Hijri (Islamic) date. */
export interface HijriDate {
  day: number;
  month: number;
  year: number;
}

/** Hijri month names in Indonesian/Arabic transliteration. */
const HIJRI_MONTH_NAMES: Record<number, string> = {
  1: "Muharram",
  2: "Safar",
  3: "Rabiul Awal",
  4: "Rabiul Akhir",
  5: "Jumadil Awal",
  6: "Jumadil Akhir",
  7: "Rajab",
  8: "Syaban",
  9: "Ramadan",
  10: "Syawal",
  11: "Dzulqaidah",
  12: "Dzulhijjah",
};

/**
 * Converts a Gregorian Date to a Hijri date.
 * hijri-converter uses Um Alqura calendar system.
 */
export function toHijri(date: Date): HijriDate {
  const result = _toHijri(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
  );
  return {
    day: result.hd,
    month: result.hm,
    year: result.hy,
  };
}

/**
 * Returns the Indonesian/Arabic name for a given Hijri month number (1–12).
 * Falls back to the number string if out of range.
 */
export function getHijriMonthName(month: number): string {
  return HIJRI_MONTH_NAMES[month] ?? String(month);
}

/**
 * Returns a fully formatted Hijri date string.
 * Example: "15 Ramadan 1446 H"
 */
export function formatHijriDate(date: Date): string {
  const { day, month, year } = toHijri(date);
  return `${day} ${getHijriMonthName(month)} ${year} H`;
}
