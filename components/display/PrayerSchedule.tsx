"use client";

import { memo } from "react";
import { useDisplayStore } from "../../stores/useDisplayStore";
import { formatTime } from "../../lib/utils/time";
import type { PrayerTime } from "../../types/prayer";

/**
 * Returns true if the given prayer is the next upcoming prayer.
 */
function isNextPrayer(
  prayer: PrayerTime,
  nextKey: string | undefined,
): boolean {
  return prayer.key === nextKey;
}

/**
 * Single row in the prayer schedule table.
 */
const PrayerRow = memo(function PrayerRow({
  prayer,
  isNext,
}: {
  prayer: PrayerTime;
  isNext: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-8 rounded-lg px-4 py-2 transition-colors ${
        isNext
          ? "bg-primary text-primary-foreground"
          : "text-primary-foreground opacity-80"
      }`}
    >
      {/* Prayer name */}
      <span
        className="w-28 font-semibold"
        style={{ fontSize: "var(--text-display-sm)" }}
      >
        {prayer.name}
      </span>

      {/* Adzan time */}
      <span
        className="tabular-nums"
        style={{ fontSize: "var(--text-display-sm)" }}
      >
        {formatTime(prayer.time, false)}
      </span>

      {/* Iqomah time — only for prayers that have it */}
      <span
        className="tabular-nums opacity-70"
        style={{ fontSize: "var(--text-display-sm)" }}
      >
        {prayer.iqomahTime ? formatTime(prayer.iqomahTime, false) : "—"}
      </span>
    </div>
  );
});

/**
 * Full prayer schedule table for the display screen.
 * Highlights the next upcoming prayer.
 */
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
    <div className="flex flex-col gap-1">
      {/* Header */}
      <div className="mb-2 flex items-center justify-between gap-8 px-4 opacity-50">
        <span style={{ fontSize: "var(--text-display-sm)", width: "7rem" }}>
          Waktu
        </span>
        <span style={{ fontSize: "var(--text-display-sm)" }}>Adzan</span>
        <span style={{ fontSize: "var(--text-display-sm)" }}>Iqomah</span>
      </div>

      {prayers.map((prayer) => (
        <PrayerRow
          key={prayer.key}
          prayer={prayer}
          isNext={isNextPrayer(prayer, nextPrayer?.prayer.key)}
        />
      ))}
    </div>
  );
});
