"use client";

import React from "react";
import { useDisplayStore } from "../../stores/useDisplayStore";
import { VERSES } from "../../data/verses";

export function QuranPanel() {
  const nextPrayer = useDisplayStore((s) => s.nextPrayer);

  const verse = React.useMemo(() => {
    const date = new Date();
    const dayOfYear = Math.floor(
      (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) /
        1000 / 60 / 60 / 24
    );
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
    <div
      className="flex flex-col items-end justify-center rounded-2xl px-6 py-5 border border-[--color-secondary]/20"
      style={{
        background:
          "linear-gradient(135deg, color-mix(in srgb, var(--color-secondary) 18%, transparent) 0%, color-mix(in srgb, var(--color-primary) 25%, transparent) 100%)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        boxShadow:
          "0 4px 24px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.10)",
      }}
    >
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
        className="text-right italic text-white/80"
        style={{ fontSize: "clamp(0.9rem, 1.2vw, 1.2rem)" }}
      >
        &ldquo;{verse.translation}&rdquo;
      </p>
      <p
        className="mt-1 text-right text-secondary/80"
        style={{ fontSize: "clamp(0.8rem, 1vw, 1rem)" }}
      >
        — {verse.source}
      </p>
    </div>
  );
}
