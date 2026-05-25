"use client";

import React from "react";
import { useDisplayStore } from "../../stores/useDisplayStore";
import { VERSES } from "../../data/verses";

export function QuranPanel() {
  const nextPrayer = useDisplayStore((s) => s.nextPrayer);
  
  const verse = React.useMemo(() => {
    // Generate a deterministic index based on the day of the year and the next prayer key
    const date = new Date();
    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
    
    // Hash the prayer key to an integer
    let prayerHash = 0;
    if (nextPrayer?.prayer.key) {
      for (let i = 0; i < nextPrayer.prayer.key.length; i++) {
        prayerHash += nextPrayer.prayer.key.charCodeAt(i);
      }
    }
    
    const index = (dayOfYear + prayerHash) % VERSES.length;
    return VERSES[index];
  }, [nextPrayer?.prayer.key]);

  return (
    <div className="flex flex-col items-end justify-center rounded-2xl px-6 py-4 bg-surface">
      {verse.arabic && (
        <p
          className="font-arabic text-right leading-relaxed text-secondary mb-3"
          style={{
            fontSize: "clamp(1.4rem, 2.2vw, 2.2rem)",
            direction: "rtl",
          }}
        >
          {verse.arabic}
        </p>
      )}
      <p
        className="text-right italic text-white/70"
        style={{ fontSize: "clamp(0.9rem, 1.2vw, 1.2rem)" }}
      >
        &ldquo;{verse.translation}&rdquo;
      </p>
      <p
        className="mt-1 text-right text-secondary"
        style={{
          fontSize: "clamp(0.8rem, 1vw, 1rem)",
        }}
      >
        — {verse.source}
      </p>
    </div>
  );
}
