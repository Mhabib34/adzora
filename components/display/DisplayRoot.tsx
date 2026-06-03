"use client";

import React, { useEffect, useRef, memo, useState } from "react";
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
import { useDisplayStore } from "../../stores/useDisplayStore";
import { DisplayErrorBoundary } from "./DisplayErrorBoundary";
import { GeometricBackground } from "./GeometricBackground";
import { QuranPanel } from "./QuranPanel";
import { EventCard } from "./EventCard";
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

  const isAdzanPlaying = useDisplayStore((s) => s.isAdzanPlaying);
  const isIqomahActive = useDisplayStore((s) => s.isIqomahActive);

  const [isFullScreenPhoto, setIsFullScreenPhoto] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const cycle = () => {
      setIsFullScreenPhoto(false);
      timeoutId = setTimeout(() => {
        setIsFullScreenPhoto(true);
        timeoutId = setTimeout(() => {
          cycle();
        }, 60000); // 1 menit full screen
      }, 300000); // 5 menit normal
    };

    cycle();

    return () => clearTimeout(timeoutId);
  }, []);

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

  // Reload display automatically when settings are changed in another tab (Admin)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // If any of our stores change, reload to apply new settings & schedule
      if (e.key && e.key.startsWith("adzora-")) {
        window.location.reload();
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

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

      {/* Full Screen Photo Overlay (setiap 5 menit tampil 1 menit) */}
      {isFullScreenPhoto && display.showSlideshow && !isAdzanPlaying && !isIqomahActive && (
        <div className="fixed inset-0 z-40 bg-black">
          <Slideshow />
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
