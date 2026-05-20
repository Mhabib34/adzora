"use client";

import { memo } from "react";
import { useHijriDate } from "../../hooks/useHijriDate";

/**
 * Displays the current Hijri date in the top-right corner of the display screen.
 */
export const HijriCalendar = memo(function HijriCalendar() {
  const { formatted } = useHijriDate();

  return (
    <div className="flex flex-col items-end">
      <span
        className="font-arabic text-right text-secondary"
        style={{ fontSize: "var(--text-display-sm)" }}
      >
        {formatted}
      </span>
    </div>
  );
});
