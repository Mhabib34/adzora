import { PrayerEngine } from "./PrayerEngine";
import { AudioEngine } from "./AudioEngine";
import { dateToKey } from "../lib/utils/time";
import { useMosqueStore } from "../stores/useMosqueStore";
import { usePrayerStore } from "../stores/usePrayerStore";
import { useContentStore } from "../stores/useContentStore";
import { useDisplayStore } from "../stores/useDisplayStore";
import type { PrayerTime } from "../types/prayer";

const ADZAN_WINDOW_SECONDS = 30;
const AUTO_RESTART_HOUR = 3;

/** Waktu-waktu yang tidak punya adzan */
const NO_ADZAN_KEYS = new Set(["imsak", "sunrise"]);

/**
 * Top-level orchestrator — prayer calculation, audio, display state.
 */
export class ScheduleEngine {
  private prayerEngine: PrayerEngine | null = null;
  private audioEngine: AudioEngine;
  private rafId: number | null = null;
  private lastTickDate: string = "";
  private adzanFiredForPrayer: string = "";
  private iqomahTimerHandle: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.audioEngine = AudioEngine.getInstance();
  }

  async init(): Promise<void> {
    this.buildPrayerEngine();
    if (!this.prayerEngine) return;
    if (await this.prayerEngine.needsPrecomputation()) {
      await this.prayerEngine.calculateYear(new Date());
    }
    await this.loadTodaySchedule();
    this.startTick();
  }

  buildPrayerEngine(): void {
    const { config } = useMosqueStore.getState();
    const { calculationConfig, iqomahConfig } = usePrayerStore.getState();
    this.prayerEngine = new PrayerEngine(calculationConfig, iqomahConfig, {
      latitude: config.latitude,
      longitude: config.longitude,
    });
  }

  async loadTodaySchedule(): Promise<void> {
    if (!this.prayerEngine) return;
    try {
      const schedule = await this.prayerEngine.getTodaySchedule();
      // Filter out Syuruq (sunrise) from the displayed schedule
      const displayPrayers = schedule.prayers.filter(p => p.key !== "sunrise");
      useDisplayStore.getState().setTodayPrayers(displayPrayers);
      this.lastTickDate = schedule.date;
    } catch (error) {
      console.error("[ScheduleEngine] Failed to load today schedule:", error);
    }
  }

  private startTick(): void {
    let lastSecond = -1;
    const tick = () => {
      const now = new Date();
      const currentSecond =
        now.getSeconds() + now.getMinutes() * 60 + now.getHours() * 3600;
      if (currentSecond !== lastSecond) {
        lastSecond = currentSecond;
        this.onSecondTick(now);
      }
      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  private onSecondTick(now: Date): void {
    const displayStore = useDisplayStore.getState();
    displayStore.setNow(now);

    if (
      now.getHours() === AUTO_RESTART_HOUR &&
      now.getMinutes() === 0 &&
      now.getSeconds() === 0
    ) {
      this.handleMidnightRollover();
      return;
    }

    const todayKey = dateToKey(now);
    if (todayKey !== this.lastTickDate && this.lastTickDate !== "") {
      void this.loadTodaySchedule();
    }

    const { todayPrayers } = displayStore;
    if (!todayPrayers.length || !this.prayerEngine) return;

    const next = this.prayerEngine.getNextPrayer(now, todayPrayers);
    displayStore.setNextPrayer(next);

    this.checkAdzanTrigger(now, todayPrayers);
  }

  private checkAdzanTrigger(now: Date, prayers: PrayerTime[]): void {
    const { adzanAudio } = useContentStore.getState();
    const displayStore = useDisplayStore.getState();

    for (const prayer of prayers) {
      // Imsak dan Syuruq tidak punya adzan
      if (NO_ADZAN_KEYS.has(prayer.key)) continue;

      const diffSeconds = Math.floor(
        (now.getTime() - prayer.time.getTime()) / 1000,
      );
      if (diffSeconds < 0 || diffSeconds > ADZAN_WINDOW_SECONDS) continue;

      const fireKey = `${dateToKey(now)}:${prayer.key}`;
      if (this.adzanFiredForPrayer === fireKey) continue;

      this.adzanFiredForPrayer = fireKey;
      displayStore.setAdzanPlaying(true);

      const isFajr = prayer.key === "fajr";
      void this.audioEngine.playAdzan(
        adzanAudio.source,
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

  private scheduleIqomah(prayer: PrayerTime): void {
    if (!prayer.iqomahTime) return;
    const now = new Date();
    const delayMs = Math.max(0, prayer.iqomahTime.getTime() - now.getTime());
    const displayStore = useDisplayStore.getState();

    this.iqomahTimerHandle = setTimeout(() => {
      displayStore.setIqomahActive(true);
      this.iqomahTimerHandle = setTimeout(
        () => {
          displayStore.setIqomahActive(false);
        },
        5 * 60 * 1000,
      );
    }, delayMs);
  }

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

  async reconfigure(): Promise<void> {
    this.buildPrayerEngine();
    if (!this.prayerEngine) return;
    await this.prayerEngine.recompute();
    await this.loadTodaySchedule();
  }

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
