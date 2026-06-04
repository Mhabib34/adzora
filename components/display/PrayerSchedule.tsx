"use client";

import { memo } from "react";
import { useDisplayStore } from "../../stores/useDisplayStore";
import { formatTime } from "../../lib/utils/time";
import type { PrayerTime } from "../../types/prayer";

const PrayerRow = memo(function PrayerRow({
  prayer,
  isNext,
}: {
  prayer: PrayerTime;
  isNext: boolean;
}) {
  return (
    <div
      className={`relative grid gap-4 flex-1 min-h-0 items-center px-6 mx-4 rounded-xl transition-all overflow-hidden ${
        isNext ? "bg-primary" : "bg-transparent"
      }`}
      style={{
        gridTemplateColumns: "10rem 1fr 1fr",
      }}
    >
      {/* Active Indicator */}
      {isNext && (
        <div className="absolute left-0 top-0 bottom-0 w-2 bg-secondary" />
      )}

      {/* Prayer name: Indonesian + Arabic */}
      <span
        className={`font-semibold text-4xl z-10 ${isNext ? "text-white" : "text-white/80"}`}
      >
        {prayer.name}
      </span>

      {/* Adzan time */}
      <span
        className={`tabular-nums text-center font-bold z-10 ${isNext ? "text-white" : "text-white/80"}`}
        style={{ fontSize: "var(--text-display-sm)" }}
      >
        {formatTime(prayer.time, false)}
      </span>

      {/* Iqomah */}
      <div className="flex flex-col items-center z-10">
        {prayer.iqomahTime ? (
          <span
            className={`tabular-nums font-bold ${isNext ? "text-white" : "text-white/60"}`}
            style={{ fontSize: "var(--text-display-sm)" }}
          >
            {formatTime(prayer.iqomahTime, false)}
          </span>
        ) : (
          <span
            className="text-white/30"
            style={{ fontSize: "var(--text-display-sm)" }}
          >
            —
          </span>
        )}
      </div>
    </div>
  );
});

export const PrayerSchedule = memo(function PrayerSchedule() {
  const prayers = useDisplayStore((s) => s.todayPrayers);
  const nextPrayer = useDisplayStore((s) => s.nextPrayer);

  if (!prayers.length) {
    return (
      <div
        className="opacity-40"
        style={{ fontSize: "var(--text-display-sm)" }}
      >
        Memuat jadwal sholat...
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-2xl overflow-hidden h-full bg-surface py-4 shadow-lg border border-white/5">
      {/* Table header */}
      <div
        className="grid px-10 shrink-0 mb-2"
        style={{ gridTemplateColumns: "10rem 1fr 1fr", gap: "1rem" }}
      >
        <span className="font-semibold tracking-widest uppercase text-secondary/90 text-xl">
          Waktu
        </span>
        <span className="text-center font-semibold tracking-widest uppercase text-secondary/90 text-xl">
          Adzan
        </span>
        <span className="text-center font-semibold tracking-widest uppercase text-secondary/90 text-xl">
          Iqomah
        </span>
      </div>

      {/* Divider */}
      <div className="mx-10 mb-3 h-px opacity-20 bg-secondary shrink-0" />

      {/* Prayer rows */}
      <div className="flex flex-col gap-1 pb-2 flex-1 min-h-0">
        {prayers.map((prayer) => (
          <PrayerRow
            key={prayer.key}
            prayer={prayer}
            isNext={prayer.key === nextPrayer?.prayer.key}
          />
        ))}
      </div>
    </div>
  );
});
