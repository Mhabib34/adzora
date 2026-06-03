"use client";

import { memo } from "react";
import { useHijriDate } from "../../hooks/useHijriDate";

/**
 * Hijri date display — shown inline next to the Gregorian date
 * with a vertical divider separator.
 */
export const HijriCalendar = memo(function HijriCalendar() {
  const { hijri, formatted } = useHijriDate();

  // Arabic numerals for the date
  const arabicDate = `${hijri.day} ${getArabicMonthName(hijri.month)} ${hijri.year} هـ`;

  return (
    <div className="flex gap-3 items-center whitespace-nowrap">
      {/* Latin version */}
      <span
        className="text-secondary"
        style={{ fontSize: "var(--text-display-sm)" }}
      >
        {formatted.toUpperCase()}
      </span>

      {/* Divider */}
      <div className="h-5 w-px opacity-40 bg-secondary" />

      {/* Arabic version */}
      <span
        className="font-arabic text-secondary"
        style={{
          direction: "rtl",
          fontSize: "var(--text-display-sm)",
        }}
      >
        {arabicDate}
      </span>
    </div>
  );
});

const ARABIC_MONTHS: Record<number, string> = {
  1: "مُحَرَّم",
  2: "صَفَر",
  3: "رَبِيعُ ٱلْأَوَّل",
  4: "رَبِيعُ ٱلثَّانِي",
  5: "جُمَادَىٰ ٱلْأُولَىٰ",
  6: "جُمَادَىٰ ٱلثَّانِيَة",
  7: "رَجَب",
  8: "شَعْبَان",
  9: "رَمَضَان",
  10: "شَوَّال",
  11: "ذُو ٱلْقَعْدَة",
  12: "ذُو ٱلْحِجَّة",
};

function getArabicMonthName(month: number): string {
  return ARABIC_MONTHS[month] ?? "";
}
