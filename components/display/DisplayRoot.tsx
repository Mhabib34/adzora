"use client";

import React, { useEffect, useRef, memo } from "react";
import { ScheduleEngine } from "../../engines/ScheduleEngine";
import { useThemeStore } from "../../stores/useThemeStore";
import { useMosqueStore } from "../../stores/useMosqueStore";
import { useAdminStore } from "../../stores/useAdminStore";
import { useRouter } from "next/navigation";
import { DigitalClock } from "./DigitalClock";
import { PrayerSchedule } from "./PrayerSchedule";
import { IqomahCountdown } from "./IqomahCountdown";
import { HijriCalendar } from "./HijriCalendar";
import { RunningText } from "./RunningText";
import { Slideshow } from "./Slideshow";
import { AdzanOverlay } from "./AdzanOverlay";
import { VERSES } from "../../data/verses";
import { useDisplayStore } from "../../stores/useDisplayStore";
import { useContentStore } from "../../stores/useContentStore";

// ─── Error Boundary ──────────────────────────────────────────────────────────

class DisplayErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; message: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: "" };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error.message };
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[DisplayRoot] Uncaught error:", error, info);
  }
  componentDidUpdate() {
    if (this.state.hasError) {
      setTimeout(() => window.location.reload(), 10_000);
    }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div
          className="flex h-full w-full flex-col items-center justify-center text-white"
          style={{ background: "var(--color-background)" }}
        >
          <p className="text-2xl opacity-60">
            Terjadi kesalahan. Layar akan dimuat ulang dalam 10 detik.
          </p>
          <p className="mt-4 font-mono text-sm opacity-30">
            {this.state.message}
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── Decorative helpers ───────────────────────────────────────────────────────

/** Subtle Islamic hexagonal tiling as background texture */
function GeometricBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0"
      style={{
        opacity: 0.06,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='56' height='100' viewBox='0 0 56 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M28 66L0 50V16L28 0l28 16v34L28 66zm0-18L8 36V20l20-12 20 12v16L28 48z' fill='%23ffffff' fill-opacity='1'/%3E%3C/svg%3E")`,
        backgroundSize: "56px 100px",
      }}
    />
  );
}

/** Dynamic Quran/Hadith panel */
function QuranPanel() {
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

/** Event card panel */
function EventCard() {
  const eventItem = useContentStore((s) => s.eventItem);

  if (!eventItem?.isActive) return null;

  return (
    <div
      className="flex items-center gap-4 rounded-2xl px-5 py-3 bg-surface"
      style={{
        borderLeft: "3px solid var(--color-secondary)",
      }}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-primary">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="h-6 w-6"
          style={{ color: "var(--color-secondary)" }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21"
          />
        </svg>
      </div>
      <div>
        <p className="font-semibold tracking-widest uppercase text-sm text-secondary">
          {eventItem.title || "Info Acara"}
        </p>
        <p className="mt-0.5 text-white/80 text-lg">{eventItem.description}</p>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

/**
 * DisplayRootInner uses a strict 3-row layout:
 *
 *  Row A (fixed ~30%): Clock+Date+Hijri | Slideshow
 *  Row B (fixed ~58%): PrayerSchedule  | QuranPanel + EventCard
 *  Row C (fixed ~8%):  RunningText (full width)
 *
 * All heights are expressed in vh so they never overflow.
 */
const DisplayRootInner = memo(function DisplayRootInner() {
  const engineRef = useRef<ScheduleEngine | null>(null);
  const applyCSSVars = useThemeStore((s) => s.applyCSSVariables);
  const display = useMosqueStore((s) => s.display);
  const isSetupComplete = useMosqueStore((s) => s.config.isSetupComplete);
  const hasSetPin = useAdminStore((s) => s.hasSetPin);
  const hasHydrated = useAdminStore((s) => s._hasHydrated);
  const router = useRouter();

  useEffect(() => {
    if (!hasHydrated) return;
    if (!hasSetPin) {
      router.replace("/admin");
    } else if (!isSetupComplete) {
      router.replace("/admin/setup");
    }
  }, [hasHydrated, hasSetPin, isSetupComplete, router]);

  useEffect(() => {
    applyCSSVars();
  }, [applyCSSVars]);

  useEffect(() => {
    if (!isSetupComplete || !hasSetPin) return;

    const engine = new ScheduleEngine();
    engineRef.current = engine;
    void engine.init();
    
    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, [isSetupComplete, hasSetPin]);

  if (!hasHydrated || !isSetupComplete || !hasSetPin) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[--color-background]">
        <div className="text-center text-white/50 space-y-4">
          <p>Mengarahkan ke halaman pengaturan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background text-white px-4 gap-6 box-border relative">
      <GeometricBackground />

      <div className="flex flex-row flex-1 min-h-0 gap-4 z-10 w-full">
        {/* ── Left Column ── */}
        <div className="flex flex-col gap-4 w-1/2 min-h-0">
          {/* Clock + Hijri */}
          <div className="flex flex-col justify-center shrink-0">
            <DigitalClock />
            {display.showHijriCalendar && <HijriCalendar />}
          </div>

          {/* Prayer schedule */}
          <div className="flex-1 min-h-0">
            <PrayerSchedule />
          </div>
        </div>

        {/* ── Right Column ── */}
        <div className="flex flex-col gap-4 w-1/2 min-h-0">
          {display.showSlideshow && (
            <div className="flex-1 min-h-0 rounded-2xl overflow-hidden relative">
              <Slideshow />
            </div>
          )}
          <div className="shrink-0 flex flex-col gap-4">
            <QuranPanel />
            <EventCard />
          </div>
        </div>
      </div>

      {/* ── ROW C: Running text ── */}
      {display.showRunningText && (
        <div className="shrink-0 z-10 w-full">
          <RunningText />
        </div>
      )}

      {/* Overlays */}
      <IqomahCountdown />
      <AdzanOverlay />
    </div>
  );
});

export function DisplayRoot() {
  return (
    <DisplayErrorBoundary>
      <DisplayRootInner />
    </DisplayErrorBoundary>
  );
}
