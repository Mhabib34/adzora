"use client";

import React, { useEffect, useRef, memo, useState } from "react";
import { ScheduleEngine } from "../../engines/ScheduleEngine";
import { useThemeStore } from "../../stores/useThemeStore";
import { useMosqueStore } from "../../stores/useMosqueStore";
import { useAdminStore } from "../../stores/useAdminStore";
import { useRouter } from "next/navigation";
import { DigitalClock } from "./DigitalClock";
import { HijriCalendar } from "./HijriCalendar";
import { PrayerSchedule } from "./PrayerSchedule";
import { IqomahCountdown } from "./IqomahCountdown";
import { RunningText } from "./RunningText";
import { Slideshow } from "./Slideshow";
import { AdzanOverlay } from "./AdzanOverlay";
import { useDisplayStore } from "../../stores/useDisplayStore";
import { DisplayErrorBoundary } from "./DisplayErrorBoundary";
import { RotatingBackground } from "./RotatingBackground";
import { QuranOverlay } from "./QuranOverlay";
// ─── Main component ───────────────────────────────────────────────────────────

/**
 * DisplayRootInner uses a clean layout:
 *
 *  Row Top (fixed, rapat ke atas/kiri/kanan, bg putih gradient solid):
 *                                    Adzora (kiri) | Nama Masjid (tengah) | DigitalClock (kanan)
 *  Main Center Content:              Slideshow / Media Area
 *  Row B:                           PrayerSchedule
 *  Row C (fixed, nempel bawah):     RunningText (full width)
 *  Overlays:                        QuranOverlay (15s tiap 5 mnt), IqomahCountdown, AdzanOverlay
 */
const DisplayRootInner = memo(function DisplayRootInner() {
  const engineRef = useRef<ScheduleEngine | null>(null);
  const applyCSSVars = useThemeStore((s) => s.applyCSSVariables);
  const display = useMosqueStore((s) => s.display);
  const mosqueName = useMosqueStore((s) => s.config.name);
  const isSetupComplete = useMosqueStore((s) => s.config.isSetupComplete);
  const hasSetPin = useAdminStore((s) => s.hasSetPin);
  const hasHydrated = useAdminStore((s) => s._hasHydrated);
  const router = useRouter();

  const isAdzanPlaying = useDisplayStore((s) => s.isAdzanPlaying);
  const isIqomahActive = useDisplayStore((s) => s.isIqomahActive);

  const [isFullScreenPhoto, setIsFullScreenPhoto] = useState(false);
  const [isQuranOverlayActive, setIsQuranOverlayActive] = useState(false);

  // Auto-hide cursor on inactivity (3 seconds)
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const showCursor = () => {
      document.body.classList.remove("hide-cursor");
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        document.body.classList.add("hide-cursor");
      }, 3000);
    };

    // Show cursor initially
    showCursor();

    window.addEventListener("mousemove", showCursor);
    window.addEventListener("keydown", showCursor);
    window.addEventListener("click", showCursor);

    return () => {
      window.removeEventListener("mousemove", showCursor);
      window.removeEventListener("keydown", showCursor);
      window.removeEventListener("click", showCursor);
      clearTimeout(timeout);
      document.body.classList.remove("hide-cursor"); // cleanup
    };
  }, []);

  // Magic click for pointer devices (5 clicks)
  const clickCountRef = useRef(0);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMagicClick = () => {
    clickCountRef.current += 1;
    if (clickCountRef.current >= 5) {
      router.push("/admin");
    }
    if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    clickTimeoutRef.current = setTimeout(() => {
      clickCountRef.current = 0;
    }, 2500); // Waktu yang cukup untuk 5 klik
  };

  // Keyboard shortcut for TV remotes (Enter 3 times fast)
  useEffect(() => {
    let enterCount = 0;
    let lastEnterTime = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        const now = Date.now();
        if (now - lastEnterTime > 1500) {
          enterCount = 0;
        }
        enterCount++;
        lastEnterTime = now;

        if (enterCount >= 3) {
          router.push("/admin");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  // Full Screen Photo Timer (Setiap 5 menit, diselang-seling 2.5 menit setelah Quran Overlay)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    // Start with a 2.5 minute offset delay so it alternates nicely with Quran Overlay
    const startTimeout = setTimeout(() => {
      const cycle = () => {
        setIsFullScreenPhoto(true);
        timeoutId = setTimeout(() => {
          setIsFullScreenPhoto(false);
          timeoutId = setTimeout(() => {
            cycle();
          }, 300000); // 5 menit jeda
        }, 90000); // 90 detik full screen
      };

      cycle();
    }, 150000); // 2.5 menit initial offset delay

    return () => {
      clearTimeout(startTimeout);
      clearTimeout(timeoutId);
    };
  }, []);

  // Periodic Full-Screen Quran Overlay Timer (Setiap 5 menit tampil 15 detik)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const cycle = () => {
      setIsQuranOverlayActive(false);
      timeoutId = setTimeout(() => {
        setIsQuranOverlayActive(true);
        timeoutId = setTimeout(() => {
          cycle();
        }, 15000); // 15 detik tampil full screen
      }, 300000); // 5 menit jeda
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

  const isMinimalis = display.layout === "minimalis";
  const isPenuh = display.layout === "penuh";

  return (
    <div 
      className="flex flex-col h-full overflow-hidden bg-transparent text-white px-4 gap-6 box-border relative"
      style={isPenuh ? { zoom: 1.15 } as React.CSSProperties : undefined}
    >
      <RotatingBackground />

      {/* ── ROW TOP: satu card putih gradient, rapat ke atas/kiri/kanan, tanpa padding luar ── */}
      <div className="fixed top-0 left-0 right-0 z-20">
        <div
          className="w-full flex flex-row items-center justify-between px-8 py-4"
          style={{
            background:
              "linear-gradient(135deg, #F5F5F5 0%, color-mix(in srgb, var(--color-primary) 50%, white) 100%)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
          }}
        >
          {/* Kiri: nama app */}
          <div className="shrink-0">
            <span className="text-5xl font-bold tracking-widest uppercase text-slate-500 font-display">
              Adzora
            </span>
          </div>

          {/* Tengah: nama masjid */}
          <div className="flex-1 flex items-center justify-center px-8 min-w-0">
            <span className="text-5xl font-bold uppercase tracking-wide text-slate-900 text-center truncate font-display">
              {mosqueName}
            </span>
          </div>

          {/* Kanan: digital clock & hijri calendar */}
          <div className="shrink-0 flex flex-col items-end gap-1">
            <DigitalClock />
            {display.showHijriCalendar && <HijriCalendar />}
          </div>
        </div>
      </div>

      <div className="flex flex-col flex-1 min-h-0 gap-4 z-10 w-full justify-end pt-32 pb-20">
        {/* ── Middle row: Horizontal Prayer Schedule ── */}
        <div className="shrink-0 w-full">
          <PrayerSchedule />
        </div>
      </div>

      {/* ── ROW C: Running text — fixed nempel di bawah layar ── */}
      {display.showRunningText && !isMinimalis && (
        <div className="fixed bottom-0 left-0 right-0 z-20">
          <RunningText />
        </div>
      )}

      {/* Full Screen Photo Overlay (setiap 5 menit tampil 1 menit) */}
      {isFullScreenPhoto && display.showSlideshow && !isMinimalis && !isAdzanPlaying && !isIqomahActive && !isQuranOverlayActive && (
        <div className="fixed inset-0 z-40 bg-black">
          <Slideshow />
        </div>
      )}

      {/* Overlays */}
      <QuranOverlay isActive={isQuranOverlayActive && !isAdzanPlaying && !isIqomahActive} />
      <IqomahCountdown />
      <AdzanOverlay />

      {/* Hidden Magic Button to Open Admin (Bottom Right Corner) */}
      <div
        onClick={handleMagicClick}
        className="fixed bottom-0 right-0 w-32 h-32 z-9999 cursor-pointer"
        title="Secret Admin Menu (Click 5x)"
      />
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