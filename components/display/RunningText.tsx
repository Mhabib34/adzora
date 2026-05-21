"use client";

import { memo } from "react";
import { useContentStore } from "../../stores/useContentStore";
import { useMosqueStore } from "../../stores/useMosqueStore";
import { formatDate } from "../../lib/utils/time";

export const RunningText = memo(function RunningText() {
  const runningTexts = useContentStore((s) => s.runningTexts);
  const tickerSpeed = useMosqueStore((s) => s.display.tickerSpeed);

  const activeTexts = runningTexts
    .filter((t) => t.isActive)
    .sort((a, b) => a.order - b.order);

  if (!activeTexts.length) return null;

  const combined = activeTexts.map((t) => `${formatDate(new Date(t.createdAt))} - ${t.text}`).join("   ✦   ");

  return (
    <div className="overflow-hidden rounded-xl px-0 py-0 flex items-center bg-primary h-16">
      {/* Label badge */}
      <div className="shrink-0 flex items-center justify-center px-5 h-full font-bold tracking-widest bg-secondary uppercase text-background min-w-36 text-xl">
        Info Masjid
      </div>

      {/* Scrolling text */}
      <div className="flex-1 overflow-hidden">
        <div
          className="whitespace-nowrap text-2xl text-white pl-4 transform font-semibold"
          style={{
            animation: `ticker-scroll ${tickerSpeed}s linear infinite`,
          }}
        >
          {combined}
        </div>
      </div>
    </div>
  );
});
