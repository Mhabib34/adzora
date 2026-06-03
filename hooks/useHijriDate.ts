import { useMemo } from "react";
import {
  toHijri,
  formatHijriDate,
  type HijriDate,
} from "../lib/hijri/converter";
import { dateToKey } from "../lib/utils/time";
import { useDisplayStore } from "../stores/useDisplayStore";

import { useMosqueStore } from "../stores/useMosqueStore";

export interface HijriDateResult {
  hijri: HijriDate;
  /** e.g. "15 Ramadan 1446 H" */
  formatted: string;
}

/**
 * Returns the current Hijri date derived from the display store clock.
 * Recomputes only when the calendar date (YYYY-MM-DD) changes, not every second.
 */
export function useHijriDate(): HijriDateResult {
  const now = useDisplayStore((s) => s.now);
  const hijriOffset = useMosqueStore((s) => s.config.hijriOffset ?? 0);

  // Stable string key — changes only when calendar date rolls over
  const dateKey = dateToKey(now) + "_" + hijriOffset;

  return useMemo(
    () => {
      const adjustedDate = new Date(now.getTime() + hijriOffset * 24 * 60 * 60 * 1000);
      return {
        hijri: toHijri(adjustedDate),
        formatted: formatHijriDate(adjustedDate),
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dateKey],
  );
}
