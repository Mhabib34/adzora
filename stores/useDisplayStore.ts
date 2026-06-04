/**
 * Zustand store for display runtime state.
 * Tracks current time, next prayer, adzan/iqomah status.
 * NOT persisted — rebuilt fresh on every page load.
 */

import { create } from "zustand";
import type { NextPrayer, PrayerTime } from "../types/prayer";

interface DisplayState {
  /** Current time — updated every second by DigitalClock engine */
  now: Date;
  /** Today's prayer times */
  todayPrayers: PrayerTime[];
  /** Next prayer info including countdown */
  nextPrayer: NextPrayer | null;
  /** Whether adzan overlay is showing */
  isAdzanPlaying: boolean;
  /** Whether iqomah countdown is active */
  isIqomahActive: boolean;
  /** Whether display is in fullscreen mode */
  isFullscreen: boolean;
  // Actions
  setNow: (date: Date) => void;
  setTodayPrayers: (prayers: PrayerTime[]) => void;
  setNextPrayer: (next: NextPrayer | null) => void;
  setAdzanPlaying: (playing: boolean) => void;
  setIqomahActive: (active: boolean) => void;
  setFullscreen: (fullscreen: boolean) => void;
}

export const useDisplayStore = create<DisplayState>()((set) => ({
  now: new Date(),
  todayPrayers: [],
  nextPrayer: null,
  isAdzanPlaying: false,
  isIqomahActive: false,
  isFullscreen: false,

  setNow: (date) => set({ now: date }),
  setTodayPrayers: (prayers) => set({ todayPrayers: prayers }),
  setNextPrayer: (next) => set({ nextPrayer: next }),
  setAdzanPlaying: (playing) => set({ isAdzanPlaying: playing }),
  setIqomahActive: (active) => set({ isIqomahActive: active }),
  setFullscreen: (fullscreen) => set({ isFullscreen: fullscreen }),
}));
