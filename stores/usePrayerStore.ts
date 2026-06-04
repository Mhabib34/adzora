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
  setCalculationConfig: (c: Partial<PrayerCalculationConfig>) => void;
  setOffset: (key: PrayerKey, minutes: number) => void;
  setIqomahDuration: (
    key: Exclude<PrayerKey, "imsak" | "sunrise">,
    minutes: number,
  ) => void;
  resetCalculationConfig: () => void;
}

const defaultCalc: PrayerCalculationConfig = {
  method: "MoonsightingCommittee",
  asrMethod: "Shafi",
  offsets: {
    imsak: 0,
    fajr: 0,
    sunrise: 0,
    dhuhr: 0,
    asr: 0,
    maghrib: 0,
    isha: 0,
  },
  imsakMinutesBeforeFajr: 10,
};

const defaultIqomah: IqomahConfig = {
  durations: { fajr: 10, dhuhr: 10, asr: 10, maghrib: 5, isha: 10 },
};

export const usePrayerStore = create<PrayerState>()(
  persist(
    (set) => ({
      calculationConfig: defaultCalc,
      iqomahConfig: defaultIqomah,
      setCalculationConfig: (p) =>
        set((s) => ({
          calculationConfig: { ...s.calculationConfig, ...p },
        })),
      setOffset: (key, min) =>
        set((s) => ({
          calculationConfig: {
            ...s.calculationConfig,
            offsets: { ...s.calculationConfig.offsets, [key]: min },
          },
        })),
      setIqomahDuration: (key, min) =>
        set((s) => ({
          iqomahConfig: {
            durations: { ...s.iqomahConfig.durations, [key]: min },
          },
        })),
      resetCalculationConfig: () =>
        set({
          calculationConfig: defaultCalc,
          iqomahConfig: defaultIqomah,
        }),
    }),
    { name: "adzora-prayer" },
  ),
);
