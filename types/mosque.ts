/**
 * Core data types for mosque configuration.
 * Persisted via Zustand store to localStorage.
 */

export interface MosqueConfig {
  /** Full mosque name */
  name: string;
  /** Mosque address */
  address: string;
  /** City name (for display) */
  city: string;
  /** Latitude coordinate */
  latitude: number;
  /** Longitude coordinate */
  longitude: number;
  /** Timezone string, e.g. "Asia/Jakarta" */
  timezone: string;
  /** Whether initial setup has been completed */
  isSetupComplete: boolean;
}

export interface MosqueTheme {
  /** Primary color (hex) */
  colorPrimary: string;
  /** Secondary / accent color (hex) */
  colorSecondary: string;
  /** Background color (hex) */
  colorBackground: string;
  /** Surface / card color (hex) */
  colorSurface: string;
  /** Selected theme preset */
  preset: ThemePreset;
}

export type ThemePreset =
  | "hijau-klasik"
  | "biru-langit"
  | "ungu-malam"
  | "emas-gelap"
  | "custom";

export interface MosqueDisplay {
  /** Show seconds on digital clock */
  showSeconds: boolean;
  /** Show Hijri calendar */
  showHijriCalendar: boolean;
  /** Show running text ticker */
  showRunningText: boolean;
  /** Show image slideshow */
  showSlideshow: boolean;
  /** Duration per slide in seconds */
  slideDuration: number;
  /** Ticker speed in seconds (duration for one full pass) */
  tickerSpeed: number;
  /** Active display layout */
  layout: DisplayLayout;
}

export type DisplayLayout = "default" | "minimalis" | "penuh";
