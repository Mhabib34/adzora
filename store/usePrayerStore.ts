/**
 * Zustand store for prayer calculation config and iqomah settings.
 * Persisted to localStorage via persist middleware.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  PrayerCalculationConfig,
  IqomahConfig,
  PrayerKey,
} from "../types/prayer";

interface PrayerState {
  calculationConfig: PrayerCalculationConfig;
  iqomahConfig: IqomahConfig;
  // Actions
  setCalculationConfig: (config: Partial<PrayerCalculationConfig>) => void;
  setOffset: (key: PrayerKey, minutes: number) => void;
  setIqomahDuration: (
    key: Exclude<PrayerKey, "sunrise">,
    minutes: number,
  ) => void;
  resetCalculationConfig: () => void;
}

const defaultOffsets: Record<PrayerKey, number> = {
  fajr: 0,
  sunrise: 0,
  dhuhr: 0,
  asr: 0,
  maghrib: 0,
  isha: 0,
};

const defaultIqomahDurations: Record<Exclude<PrayerKey, "sunrise">, number> = {
  fajr: 10,
  dhuhr: 10,
  asr: 10,
  maghrib: 5,
  isha: 10,
};

const defaultCalculationConfig: PrayerCalculationConfig = {
  method: "MoonsightingCommittee",
  asrMethod: "Shafi",
  offsets: defaultOffsets,
};

const defaultIqomahConfig: IqomahConfig = {
  durations: defaultIqomahDurations,
};

export const usePrayerStore = create<PrayerState>()(
  persist(
    (set) => ({
      calculationConfig: defaultCalculationConfig,
      iqomahConfig: defaultIqomahConfig,

      setCalculationConfig: (partial) =>
        set((state) => ({
          calculationConfig: {
            ...state.calculationConfig,
            ...partial,
          },
        })),

      setOffset: (key, minutes) =>
        set((state) => ({
          calculationConfig: {
            ...state.calculationConfig,
            offsets: {
              ...state.calculationConfig.offsets,
              [key]: minutes,
            },
          },
        })),

      setIqomahDuration: (key, minutes) =>
        set((state) => ({
          iqomahConfig: {
            durations: {
              ...state.iqomahConfig.durations,
              [key]: minutes,
            },
          },
        })),

      resetCalculationConfig: () =>
        set({
          calculationConfig: defaultCalculationConfig,
          iqomahConfig: defaultIqomahConfig,
        }),
    }),
    {
      name: "adzora-prayer",
    },
  ),
);
