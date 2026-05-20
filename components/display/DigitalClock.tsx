"use client";

import { useEffect, useRef, memo } from "react";
import { useDisplayStore } from "../../stores/useDisplayStore";
import { useMosqueStore } from "../../stores/useMosqueStore";
import { formatTime, formatDate } from "../../lib/utils/time";

/**
 * Digital clock component.
 * Drives the global clock via requestAnimationFrame — not setInterval.
 * Updates useDisplayStore.now every second; all other components
 * read from the store rather than running their own timers.
 */
export const DigitalClock = memo(function DigitalClock() {
  const setNow = useDisplayStore((s) => s.setNow);
  const now = useDisplayStore((s) => s.now);
  const showSeconds = useMosqueStore((s) => s.display.showSeconds);

  const rafRef = useRef<number | null>(null);
  const lastSecRef = useRef<number>(-1);

  // RAF loop — single source of truth for the clock
  useEffect(() => {
    const tick = () => {
      const date = new Date();
      const sec = date.getSeconds();

      if (sec !== lastSecRef.current) {
        lastSecRef.current = sec;
        setNow(date);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [setNow]);

  const timeStr = formatTime(now, showSeconds);
  const dateStr = formatDate(now);

  return (
    <div className="flex flex-col">
      {/* Time — minimum 8rem per spec */}
      <span
        className="font-bold tabular-nums leading-none text-primary-foreground"
        style={{ fontSize: "var(--text-display-xl)" }}
      >
        {timeStr}
      </span>

      {/* Date */}
      <span
        className="mt-1 text-secondary capitalize"
        style={{ fontSize: "var(--text-display-sm)" }}
      >
        {dateStr}
      </span>
    </div>
  );
});
