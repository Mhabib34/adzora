"use client";

import { memo } from "react";
import { useContentStore } from "../../stores/useContentStore";
import { useMosqueStore } from "../../stores/useMosqueStore";

/**
 * Horizontal ticker / running text component.
 * Loops through all active running text items.
 * Speed controlled via tickerSpeed (px/s equivalent via CSS duration).
 */
export const RunningText = memo(function RunningText() {
  const runningTexts = useContentStore((s) => s.runningTexts);
  const tickerSpeed = useMosqueStore((s) => s.display.tickerSpeed);

  const activeTexts = runningTexts
    .filter((t) => t.isActive)
    .sort((a, b) => a.order - b.order);

  if (!activeTexts.length) return null;

  // Join all texts with a separator for seamless loop
  const combined = activeTexts.map((t) => t.text).join("   ·   ");

  return (
    <div className="overflow-hidden border-t border-surface bg-surborder-surface py-3">
      <div
        className="whitespace-nowrap"
        style={{
          animation: `ticker-scroll ${tickerSpeed}s linear infinite`,
          fontSize: "var(--text-display-sm)",
          color: "var(--color-secondary)",
          willChange: "transform",
        }}
      >
        {combined}
      </div>
    </div>
  );
});
