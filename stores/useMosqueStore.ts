/**
 * Zustand store for mosque configuration.
 * Persisted to localStorage via persist middleware.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MosqueConfig, MosqueDisplay } from "../types/mosque";

interface MosqueState {
  config: MosqueConfig;
  display: MosqueDisplay;
  // Actions
  setConfig: (config: Partial<MosqueConfig>) => void;
  setDisplay: (display: Partial<MosqueDisplay>) => void;
  resetConfig: () => void;
}

const defaultConfig: MosqueConfig = {
  name: "Masjid Al-Ikhlas",
  address: "",
  city: "",
  latitude: -6.2088,
  longitude: 106.8456,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  isSetupComplete: false,
};

const defaultDisplay: MosqueDisplay = {
  showSeconds: true,
  showHijriCalendar: true,
  showRunningText: true,
  showSlideshow: true,
  slideDuration: 10,
  tickerSpeed: 30,
  layout: "default",
};

export const useMosqueStore = create<MosqueState>()(
  persist(
    (set) => ({
      config: defaultConfig,
      display: defaultDisplay,

      setConfig: (partial) =>
        set((state) => ({
          config: { ...state.config, ...partial },
        })),

      setDisplay: (partial) =>
        set((state) => ({
          display: { ...state.display, ...partial },
        })),

      resetConfig: () =>
        set({ config: defaultConfig, display: defaultDisplay }),
    }),
    {
      name: "adzora-mosque",
    },
  ),
);
