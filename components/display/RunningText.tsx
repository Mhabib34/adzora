"use client";

import { memo } from "react";
import { useContentStore } from "../../stores/useContentStore";
import { useMosqueStore } from "../../stores/useMosqueStore";
import { formatDate, formatDateShort } from "../../lib/utils/time";

export const RunningText = memo(function RunningText() {
  const runningTexts = useContentStore((s) => s.runningTexts);
  const tickerSpeed = useMosqueStore((s) => s.display.tickerSpeed);

  const activeTexts = runningTexts
    .filter((t) => t.isActive)
    .sort((a, b) => a.order - b.order);

  if (!activeTexts.length) return null;

  const combined = activeTexts
    .map((t) => `${formatDate(new Date(t.createdAt))} - ${t.text}`)
    .join("   ✦   ");

  const todayStr = formatDateShort(new Date());

  return (
    <div
      className="overflow-hidden flex items-center h-16 border-t border-[--color-secondary]/30"
      style={{
        background:
          "linear-gradient(135deg, #F8FAFC 0%, color-mix(in srgb, var(--color-primary) 35%, #FFFFFF) 100%)",
        boxShadow: "0 -4px 20px rgba(0,0,0,0.25)",
      }}
    >
      {/* Label badge — tanggal hari ini (Masehi) */}
      <div
        className="shrink-0 flex items-center justify-center px-6 h-full font-display font-bold tracking-wider uppercase text-xl min-w-40"
        style={{
          background:
            "linear-gradient(135deg, var(--color-secondary) 0%, color-mix(in srgb, var(--color-secondary) 75%, black) 100%)",
          color: "var(--color-background)",
          textShadow: "0 1px 2px rgba(0,0,0,0.2)",
        }}
      >
        <span className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[--color-background] animate-pulse" />
          {todayStr}
        </span>
      </div>

      {/* Scrolling text */}
      <div className="flex-1 overflow-hidden px-4">
        <div
          className="whitespace-nowrap text-2xl font-sans font-semibold text-slate-900 tracking-wide"
          style={{
            animation: `ticker-scroll ${110 - tickerSpeed}s linear infinite`,
            fontFeatureSettings: '"cv02", "cv03", "cv04", "cv11"',
          }}
        >
          {combined}
        </div>
      </div>
    </div>
  );
});