import { useMemo } from "react";
import { useDisplayStore } from "../stores/useDisplayStore";
import { secondsToMMSS } from "../lib/utils/time";

export interface IqomahCountdownResult {
  /** Formatted countdown string, e.g. "04:30" */
  display: string;
  /** Raw remaining seconds */
  remainingSeconds: number;
  /** Whether iqomah countdown is currently active */
  isActive: boolean;
}

/**
 * Returns the current iqomah countdown state derived from the display store.
 * The actual countdown seconds come from nextPrayer.remainingSeconds
 * when status === "iqomah".
 */
export function useIqomahCountdown(): IqomahCountdownResult {
  const isIqomahActive = useDisplayStore((s) => s.isIqomahActive);
  const nextPrayer = useDisplayStore((s) => s.nextPrayer);

  const remainingSeconds = useMemo(() => {
    if (!isIqomahActive) return 0;
    if (nextPrayer?.status === "iqomah") return nextPrayer.remainingSeconds;
    return 0;
  }, [isIqomahActive, nextPrayer]);

  const display = useMemo(
    () => secondsToMMSS(remainingSeconds),
    [remainingSeconds],
  );

  return {
    display,
    remainingSeconds,
    isActive: isIqomahActive,
  };
}
