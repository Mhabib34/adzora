import { PrayerEngine } from "./PrayerEngine";
import { AudioEngine } from "./AudioEngine";
import { dateToKey } from "../lib/utils/time";
import { useMosqueStore } from "../stores/useMosqueStore";
import { usePrayerStore } from "../stores/usePrayerStore";
import { useContentStore } from "../stores/useContentStore";
import { useDisplayStore } from "../stores/useDisplayStore";
import type { PrayerTime } from "../types/prayer";

const ADZAN_WINDOW_SECONDS = 30;
const AUTO_RESTART_HOUR = 3; // 03:00 AM

/**
 * Top-level orchestrator that ties together prayer calculation,
 * audio playback, and display state updates.
 *
 * Lifecycle:
 *  1. Call `init()` once on app mount (inside DisplayRoot).
 *  2. Call `destroy()` on unmount to clean up the tick loop.
 */
export class ScheduleEngine {
  private prayerEngine: PrayerEngine | null = null;
  private audioEngine: AudioEngine;
  private rafId: number | null = null;
  private lastTickDate: string = "";
  private adzanFiredForPrayer: string = ""; // "YYYY-MM-DD:prayerKey"
  private iqomahTimerHandle: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.audioEngine = AudioEngine.getInstance();
  }

  /**
   * Initializes the engine: checks pre-computation, builds PrayerEngine,
   * loads today's schedule, then starts the tick loop.
   */
  async init(): Promise<void> {
    this.buildPrayerEngine();

    if (!this.prayerEngine) return;

    if (await this.prayerEngine.needsPrecomputation()) {
      await this.prayerEngine.calculateYear(new Date());
    }

    await this.loadTodaySchedule();
    this.startTick();
  }

  /**
   * Rebuilds PrayerEngine using current store values.
   * Call this after config changes (location, method, etc.).
   */
  buildPrayerEngine(): void {
    const { config } = useMosqueStore.getState();
    const { calculationConfig, iqomahConfig } = usePrayerStore.getState();

    this.prayerEngine = new PrayerEngine(calculationConfig, iqomahConfig, {
      latitude: config.latitude,
      longitude: config.longitude,
    });
  }

  /**
   * Loads today's prayer schedule into the display store.
   */
  async loadTodaySchedule(): Promise<void> {
    if (!this.prayerEngine) return;

    try {
      const schedule = await this.prayerEngine.getTodaySchedule();
      useDisplayStore.getState().setTodayPrayers(schedule.prayers);
      this.lastTickDate = schedule.date;
    } catch (error) {
      console.error("[ScheduleEngine] Failed to load today schedule:", error);
    }
  }

  /**
   * Starts the requestAnimationFrame tick loop.
   * Updates clock, next prayer, and triggers adzan/iqomah.
   */
  private startTick(): void {
    let lastSecond = -1;

    const tick = () => {
      const now = new Date();
      const currentSecond =
        now.getSeconds() + now.getMinutes() * 60 + now.getHours() * 3600;

      // Only process once per second to avoid unnecessary renders
      if (currentSecond !== lastSecond) {
        lastSecond = currentSecond;
        this.onSecondTick(now);
      }

      this.rafId = requestAnimationFrame(tick);
    };

    this.rafId = requestAnimationFrame(tick);
  }

  /**
   * Called exactly once per second by the RAF loop.
   */
  private onSecondTick(now: Date): void {
    const displayStore = useDisplayStore.getState();
    displayStore.setNow(now);

    // Auto-restart at 03:00 AM to refresh for new day
    if (
      now.getHours() === AUTO_RESTART_HOUR &&
      now.getMinutes() === 0 &&
      now.getSeconds() === 0
    ) {
      this.handleMidnightRollover();
      return;
    }

    // Reload schedule if date has changed
    const todayKey = dateToKey(now);
    if (todayKey !== this.lastTickDate && this.lastTickDate !== "") {
      void this.loadTodaySchedule();
    }

    const { todayPrayers } = displayStore;
    if (!todayPrayers.length || !this.prayerEngine) return;

    // Update next prayer
    const next = this.prayerEngine.getNextPrayer(now, todayPrayers);
    displayStore.setNextPrayer(next);

    // Check adzan trigger
    this.checkAdzanTrigger(now, todayPrayers);
  }

  /**
   * Checks whether it's time to fire adzan for any prayer.
   * Fires at most once per prayer per day.
   */
  private checkAdzanTrigger(now: Date, prayers: PrayerTime[]): void {
    const { adzanAudio } = useContentStore.getState();
    const displayStore = useDisplayStore.getState();

    for (const prayer of prayers) {
      // Syuruq has no adzan
      if (prayer.key === "sunrise") continue;

      const diffSeconds = Math.floor(
        (now.getTime() - prayer.time.getTime()) / 1000,
      );

      // Within the adzan window (0 to +30 seconds after prayer time)
      if (diffSeconds < 0 || diffSeconds > ADZAN_WINDOW_SECONDS) continue;

      const fireKey = `${dateToKey(now)}:${prayer.key}`;
      if (this.adzanFiredForPrayer === fireKey) continue;

      this.adzanFiredForPrayer = fireKey;
      displayStore.setAdzanPlaying(true);

      const isFajr = prayer.key === "fajr";
      const source =
        isFajr && adzanAudio.useFajrAdzanForSubuh
          ? adzanAudio.source
          : adzanAudio.source;

      void this.audioEngine.playAdzan(
        source,
        isFajr,
        adzanAudio.customFileId,
        () => {
          displayStore.setAdzanPlaying(false);
          this.scheduleIqomah(prayer);
        },
      );

      break;
    }
  }

  /**
   * Schedules the iqomah countdown to start after adzan ends.
   * The iqomah starts at the prayer's pre-calculated iqomahTime.
   */
  private scheduleIqomah(prayer: PrayerTime): void {
    if (!prayer.iqomahTime) return;

    const now = new Date();
    const delayMs = Math.max(0, prayer.iqomahTime.getTime() - now.getTime());
    const displayStore = useDisplayStore.getState();

    this.iqomahTimerHandle = setTimeout(() => {
      displayStore.setIqomahActive(true);

      // Iqomah lasts until iqomahTime + 5 minutes (display only)
      const durationMs = 5 * 60 * 1000;
      this.iqomahTimerHandle = setTimeout(() => {
        displayStore.setIqomahActive(false);
      }, durationMs);
    }, delayMs);
  }

  /**
   * Handles the 03:00 AM auto-restart:
   * reloads today's schedule and clears adzan state.
   */
  private handleMidnightRollover(): void {
    this.adzanFiredForPrayer = "";

    if (this.iqomahTimerHandle) {
      clearTimeout(this.iqomahTimerHandle);
      this.iqomahTimerHandle = null;
    }

    useDisplayStore.getState().setIqomahActive(false);
    useDisplayStore.getState().setAdzanPlaying(false);

    void this.loadTodaySchedule();
  }

  /**
   * Reconfigures and re-computes after settings change.
   * Call this from admin panel when location/method is saved.
   */
  async reconfigure(): Promise<void> {
    this.buildPrayerEngine();
    if (!this.prayerEngine) return;
    await this.prayerEngine.recompute();
    await this.loadTodaySchedule();
  }

  /** Stops the tick loop and cleans up all timers. */
  destroy(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.iqomahTimerHandle) {
      clearTimeout(this.iqomahTimerHandle);
      this.iqomahTimerHandle = null;
    }
    this.audioEngine.stop();
  }
}
