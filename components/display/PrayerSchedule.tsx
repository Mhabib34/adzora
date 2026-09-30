"use client";

import { memo } from "react";
import { useDisplayStore } from "../../stores/useDisplayStore";
import { useMosqueStore } from "../../stores/useMosqueStore";
import { formatTime } from "../../lib/utils/time";
import type { PrayerTime } from "../../types/prayer";

const PrayerCard = memo(function PrayerCard({
  prayer,
  isNext,
}: {
  prayer: PrayerTime;
  isNext: boolean;
}) {
  return (
    <div
      className={`relative flex flex-col items-center justify-center py-4 px-6 rounded-2xl transition-all duration-500 flex-1 min-w-0 overflow-hidden ${
        isNext
          ? "scale-105 z-10 border border-[--color-secondary]/70"
          : "border border-white/10"
      }`}
      style={{
        background: isNext
          ? "linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 55%, transparent) 0%, color-mix(in srgb, var(--color-secondary) 20%, transparent) 100%)"
          : "linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 22%, transparent) 0%, color-mix(in srgb, var(--color-surface) 30%, transparent) 100%)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        boxShadow: isNext
          ? "0 8px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.18)"
          : "0 4px 16px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.08)",
      }}
    >
      {/* Glow top accent bar for active card */}
      {isNext && (
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-0.5 rounded-b-full"
          style={{ background: "var(--color-secondary)" }}
        />
      )}

      {/* Prayer Name */}
      <span
        className={`text-xl font-display font-bold tracking-widest uppercase ${
          isNext ? "text-[--color-secondary]" : "text-white/75"
        }`}
      >
        {prayer.name}
      </span>

      {/* Adzan Time */}
      <span className="text-4xl font-mono font-extrabold tabular-nums mt-2 leading-none text-white drop-shadow-sm">
        {formatTime(prayer.time, false)}
      </span>

      {/* Iqomah */}
      <span
        className={`text-sm font-medium mt-3 ${
          isNext ? "text-white/80" : "text-white/35"
        }`}
      >
        {prayer.iqomahTime
          ? `Iqomah: ${formatTime(prayer.iqomahTime, false)}`
          : "Tanpa Iqomah"}
      </span>
    </div>
  );
});

export const PrayerSchedule = memo(function PrayerSchedule() {
  const prayers = useDisplayStore((s) => s.todayPrayers);
  const nextPrayer = useDisplayStore((s) => s.nextPrayer);
  const layout = useMosqueStore((s) => s.display.layout);

  if (!prayers.length) {
    return (
      <div
        className="opacity-40 text-center py-6 w-full"
        style={{ fontSize: "var(--text-display-sm)" }}
      >
        Memuat jadwal sholat...
      </div>
    );
  }

  const isMinimalis = layout === "minimalis";
  const displayedPrayers = isMinimalis && nextPrayer
    ? [nextPrayer.prayer]
    : prayers;

  return (
    <div className={`flex flex-row gap-4 w-full items-stretch py-2 ${isMinimalis ? 'justify-center max-w-3xl mx-auto' : 'justify-between'}`}>
      {displayedPrayers.map((prayer) => (
        <PrayerCard
          key={prayer.key}
          prayer={prayer}
          isNext={prayer.key === nextPrayer?.prayer.key}
        />
      ))}
    </div>
  );
});
