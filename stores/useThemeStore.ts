/**
 * Zustand store for theme configuration.
 * Persisted to localStorage. Also applies CSS variables to <html> on hydration.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MosqueTheme, ThemePreset } from "../types/mosque";

interface ThemeState {
  theme: MosqueTheme;
  // Actions
  setTheme: (theme: Partial<MosqueTheme>) => void;
  applyPreset: (preset: ThemePreset) => void;
  applyCSSVariables: () => void;
}

export const THEME_PRESETS: Record<ThemePreset, Omit<MosqueTheme, "preset">> = {
  "hijau-klasik": {
    colorPrimary: "#1a6b3c",
    colorSecondary: "#d4a017",
    colorBackground: "#0d1f13",
    colorSurface: "#132d1c",
  },
  "biru-langit": {
    colorPrimary: "#1a4a8a",
    colorSecondary: "#e8c84a",
    colorBackground: "#0a1628",
    colorSurface: "#112040",
  },
  "ungu-malam": {
    colorPrimary: "#5b2d8e",
    colorSecondary: "#c9a227",
    colorBackground: "#120a1e",
    colorSurface: "#1e1030",
  },
  "emas-gelap": {
    colorPrimary: "#8b6914",
    colorSecondary: "#e8e8d0",
    colorBackground: "#1a1408",
    colorSurface: "#261e0c",
  },
  custom: {
    colorPrimary: "#1a6b3c",
    colorSecondary: "#d4a017",
    colorBackground: "#0d1f13",
    colorSurface: "#132d1c",
  },
};

const defaultTheme: MosqueTheme = {
  ...THEME_PRESETS["hijau-klasik"],
  preset: "hijau-klasik",
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: defaultTheme,

      setTheme: (partial) =>
        set((state) => {
          const updated = {
            ...state.theme,
            ...partial,
            preset: "custom" as ThemePreset,
          };
          return { theme: updated };
        }),

      applyPreset: (preset) => {
        const colors = THEME_PRESETS[preset];
        const updated: MosqueTheme = { ...colors, preset };
        set({ theme: updated });
        // Apply to DOM immediately
        get().applyCSSVariables();
      },

      applyCSSVariables: () => {
        const { theme } = get();
        const root = document.documentElement;
        root.style.setProperty("--color-primary", theme.colorPrimary);
        root.style.setProperty("--color-secondary", theme.colorSecondary);
        root.style.setProperty("--color-background", theme.colorBackground);
        root.style.setProperty("--color-surface", theme.colorSurface);
      },
    }),
    {
      name: "adzora-theme",
      onRehydrateStorage: () => (state) => {
        // Re-apply CSS variables after store is rehydrated from localStorage
        if (state) {
          state.applyCSSVariables();
        }
      },
    },
  ),
);
