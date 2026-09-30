"use client";

import { useEffect, useRef, memo } from "react";
import { useDisplayStore } from "../../stores/useDisplayStore";
import { formatTime } from "../../lib/utils/time";
import { useMosqueStore } from "../../stores/useMosqueStore";

export const DigitalClock = memo(function DigitalClock() {
  const setNow = useDisplayStore((s) => s.setNow);
  const now = useDisplayStore((s) => s.now);

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

  const showSeconds = useMosqueStore((s) => s.display.showSeconds);
  const timeStr = formatTime(now, showSeconds);

  return (
    <span
      className="font-mono font-extrabold tabular-nums leading-none text-slate-900 tracking-tight"
      style={{ fontSize: "var(--text-display-lg)" }}
    >
      {timeStr}
    </span>
  );
});