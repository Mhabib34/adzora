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
      className={`grid gap-4 flex-1 min-h-0 items-center px-4 py-2 rounded-lg transition-all ${isNext ? "bg-primary" : "bg-transparent"}`}
      style={{
        gridTemplateColumns: "10rem 1fr 1fr",
        borderLeft: isNext
          ? "8px solid var(--color-secondary)"
          : "8px solid transparent",
      }}
    >
      {/* Prayer name: Indonesian + Arabic */}
      <span
        className={`font-semibold text-4xl ${isNext ? "text-white" : "text-white/80"}`}
      >
        {prayer.name}
      </span>

      {/* Adzan time */}
      <span
        className={`tabular-nums text-center font-bold ${isNext ? "text-white" : "text-white/80"}`}
        style={{ fontSize: "var(--text-display-sm)" }}
      >
        {formatTime(prayer.time, false)}
      </span>

      {/* Iqomah */}
      <div className="flex flex-col items-center">
        {prayer.iqomahTime ? (
          <>
            <span
              className={`tabular-nums font-bold ${isNext ? "text-white" : "text-white/60"}`}
              style={{ fontSize: "var(--text-display-sm)" }}
            >
              {formatTime(prayer.iqomahTime, false)}
            </span>
          </>
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
    <div className="flex flex-col rounded-2xl overflow-hidden h-full bg-surface">
      {/* Table header */}
      <div
        className="grid px-4 py-2 shrink-0"
        style={{ gridTemplateColumns: "10rem 1fr 1fr", gap: "0 1rem" }}
      >
        <span className="font-semibold tracking-widest uppercase text-secondary text-xl">
          Waktu
        </span>
        <span className="text-center font-semibold tracking-widest uppercase text-secondary text-xl">
          Adzan
        </span>
        <span className="text-center font-semibold tracking-widest uppercase text-secondary text-xl">
          Iqomah
        </span>
      </div>

      {/* Divider */}
      <div className="mx-4 mb-1 h-px opacity-20 bg-secondary shrink-0" />

      {/* Prayer rows */}
      <div className="flex flex-col gap-0.5 pb-2 flex-1 min-h-0">
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
