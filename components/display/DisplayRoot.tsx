"use client";

import React, { useEffect, useRef, memo } from "react";
import { ScheduleEngine } from "../../engines/ScheduleEngine";
import { useThemeStore } from "../../stores/useThemeStore";
import { useMosqueStore } from "../../stores/useMosqueStore";
import { DigitalClock } from "./DigitalClock";
import { PrayerSchedule } from "./PrayerSchedule";
import { IqomahCountdown } from "./IqomahCountdown";
import { HijriCalendar } from "./HijriCalendar";
import { RunningText } from "./RunningText";
import { Slideshow } from "./Slideshow";
import { AdzanOverlay } from "./AdzanOverlay";

/**
 * Error boundary for the display screen.
 * Catches runtime errors in any display sub-component
 * and shows a minimal fallback so the screen never goes blank.
 */
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

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-screen flex-col items-center justify-center bg-background text-primary-foreground">
          <p className="text-[(--text-display-sm)] opacity-60">
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

  componentDidMount() {
    // Auto-reload after 10s if error occurs
    if (this.state.hasError) {
      setTimeout(() => window.location.reload(), 10_000);
    }
  }
}

/**
 * Root display component.
 * Initializes ScheduleEngine, applies theme CSS variables,
 * and mounts all display sub-components.
 */
const DisplayRootInner = memo(function DisplayRootInner() {
  const engineRef = useRef<ScheduleEngine | null>(null);
  const applyCSSVars = useThemeStore((s) => s.applyCSSVariables);
  const display = useMosqueStore((s) => s.display);
  const isSetupComplete = useMosqueStore((s) => s.config.isSetupComplete);

  // Apply theme CSS variables on mount and whenever theme changes
  useEffect(() => {
    applyCSSVars();
  }, [applyCSSVars]);

  // Init ScheduleEngine once on mount
  useEffect(() => {
    if (!isSetupComplete) return;

    const engine = new ScheduleEngine();
    engineRef.current = engine;

    void engine.init();

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, [isSetupComplete]);

  // Setup not complete — show minimal prompt
  if (!isSetupComplete) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <p
          className="text-center text-primary-foreground opacity-60"
          style={{ fontSize: "var(--text-display-sm)" }}
        >
          Silakan selesaikan pengaturan awal di panel admin.
        </p>
      </div>
    );
  }

  return (
    <div className="relative flex h-screen w-screen flex-col overflow-hidden bg-background text-primary-foreground">
      {/* ── Top bar: clock + hijri ── */}
      <div className="flex items-start justify-between">
        <DigitalClock />
        {display.showHijriCalendar && <HijriCalendar />}
      </div>

      {/* ── Main content: prayer schedule + slideshow ── */}
      <div className="flex flex-1 gap-6 overflow-hidden">
        <div className="flex flex-col justify-center">
          <PrayerSchedule />
        </div>

        {display.showSlideshow && (
          <div className="flex flex-1 items-center justify-center overflow-hidden rounded-xl">
            <Slideshow />
          </div>
        )}
      </div>

      {/* ── Bottom: running text ── */}
      {display.showRunningText && (
        <div className="mt-auto">
          <RunningText />
        </div>
      )}

      {/* ── Overlays (always rendered, visibility managed internally) ── */}
      <IqomahCountdown />
      <AdzanOverlay />
    </div>
  );
});

/**
 * Exported display root — wraps inner component with error boundary.
 */
export function DisplayRoot() {
  return (
    <DisplayErrorBoundary>
      <DisplayRootInner />
    </DisplayErrorBoundary>
  );
}
