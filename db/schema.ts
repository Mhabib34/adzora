/**
 * IndexedDB schema definitions for Dexie.js.
 * Defines all table structures and their indexed fields.
 */

import type {
  SlideshowImage,
  RunningTextItem,
  MediaFile,
} from "../types/content";
import type { DailyPrayerSchedule } from "../types/prayer";

/** Stored media blob — raw binary data, separate from metadata. */
export interface StoredMediaBlob {
  /** Matches MediaFile.id */
  id: string;
  blob: Blob;
}

/**
 * Stored prayer schedule row.
 * Pre-computed for 365 days on first setup.
 * Date objects are serialized to JSON string for reliable IndexedDB storage.
 */
export interface StoredPrayerSchedule extends Omit<
  DailyPrayerSchedule,
  "prayers"
> {
  prayersJson: string;
}

/**
 * Stored slideshow image metadata.
 * blobUrl excluded (generated at runtime), createdAt stored as ISO string.
 */
export interface StoredSlideshowImage extends Omit<
  SlideshowImage,
  "blobUrl" | "createdAt"
> {
  createdAt: string;
}

/**
 * Stored running text item.
 * createdAt stored as ISO string.
 */
export interface StoredRunningTextItem extends Omit<
  RunningTextItem,
  "createdAt"
> {
  createdAt: string;
}

/**
 * Stored media file metadata.
 * createdAt stored as ISO string.
 */
export interface StoredMediaFile extends Omit<MediaFile, "createdAt"> {
  createdAt: string;
}

/** App settings stored as key-value pairs. */
export interface StoredSetting {
  key: string;
  value: string; // JSON stringified
}

/** All table names in MasjidDB */
export type TableName =
  | "prayerSchedules"
  | "slideshowImages"
  | "mediaBlobs"
  | "mediaFiles"
  | "runningTexts"
  | "settings";
