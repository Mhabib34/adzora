/**
 * Data types for admin-configurable content:
 * running text, slideshow images, and adzan audio.
 */

export interface RunningTextItem {
  id: string;
  text: string;
  /** Display order */
  order: number;
  isActive: boolean;
  createdAt: Date;
}

export interface SlideshowImage {
  id: string;
  /** Original filename */
  filename: string;
  /** Temporary blob URL created when loading from IndexedDB */
  blobUrl?: string;
  /** Display order */
  order: number;
  isActive: boolean;
  createdAt: Date;
  /** File size in bytes */
  size: number;
}

export interface AdzanAudioConfig {
  /** Audio source to use */
  source: AdzanAudioSource;
  /** Custom file ID if source === "custom" */
  customFileId?: string;
  /** Volume level 0–1 */
  volume: number;
  /** Whether Fajr uses a special Fajr adzan */
  useFajrAdzanForSubuh: boolean;
}

export type AdzanAudioSource =
  | "adzan-makkah"
  | "adzan-madinah"
  | "adzan-jakarta"
  | "custom";

export const ADZAN_AUDIO_LABELS: Record<AdzanAudioSource, string> = {
  "adzan-makkah": "Adzan Makkah",
  "adzan-madinah": "Adzan Madinah",
  "adzan-jakarta": "Adzan Jakarta",
  custom: "Audio Custom",
};

/** Media types stored in IndexedDB */
export type MediaType = "image" | "audio";

export interface MediaFile {
  id: string;
  type: MediaType;
  filename: string;
  mimeType: string;
  size: number;
  createdAt: Date;
}
