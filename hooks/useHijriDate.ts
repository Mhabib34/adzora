import { useMemo } from "react";
import {
  toHijri,
  formatHijriDate,
  type HijriDate,
} from "../lib/hijri/converter";
import { dateToKey } from "../lib/utils/time";
import { useDisplayStore } from "../stores/useDisplayStore";

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

  // Stable string key — changes only when calendar date rolls over
  const dateKey = dateToKey(now);

  return useMemo(
    () => ({
      hijri: toHijri(now),
      formatted: formatHijriDate(now),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dateKey],
  );
}
