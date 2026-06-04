"use client";

import { useEffect, useRef, memo } from "react";
import { useDisplayStore } from "../../stores/useDisplayStore";
import { useMosqueStore } from "../../stores/useMosqueStore";
import { formatTime, formatDate } from "../../lib/utils/time";

export const DigitalClock = memo(function DigitalClock() {
  const setNow = useDisplayStore((s) => s.setNow);
  const now = useDisplayStore((s) => s.now);
  const showSeconds = useMosqueStore((s) => s.display.showSeconds);

  const rafRef = useRef<number | null>(null);
  const lastSecRef = useRef<number>(-1);

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
      {/* Big time */}
      <span
        className="font-bold tabular-nums leading-none text-white"
        style={{ fontSize: "var(--text-display-xl)" }}
      >
        {timeStr}
      </span>

      {/* Date row: Indonesian date | divider | Hijri (hijri rendered separately in DisplayRoot) */}
      <span
        className="mt-2 capitalize"
        style={{
          fontSize: "var(--text-display-sm)",
          color: "var(--color-secondary)",
        }}
      >
        {dateStr}
      </span>
    </div>
  );
});
