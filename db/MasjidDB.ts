/**
 * Dexie.js database instance for Adzora.
 * Handles all persistent local storage beyond what Zustand covers.
 *
 * Tables:
 *  - prayerSchedules  : pre-computed prayer times for 365 days
 *  - slideshowImages  : image metadata (blobs stored in mediaBlobs)
 *  - mediaBlobs       : raw binary data for images and audio
 *  - mediaFiles       : audio file metadata
 *  - runningTexts     : running text / ticker items
 *  - settings         : misc key-value app settings
 */

import Dexie, { type EntityTable } from "dexie";
import type {
  StoredPrayerSchedule,
  StoredSlideshowImage,
  StoredMediaBlob,
  StoredMediaFile,
  StoredRunningTextItem,
  StoredSetting,
} from "./schema";

class MasjidDB extends Dexie {
  prayerSchedules!: EntityTable<StoredPrayerSchedule, "date">;
  slideshowImages!: EntityTable<StoredSlideshowImage, "id">;
  mediaBlobs!: EntityTable<StoredMediaBlob, "id">;
  mediaFiles!: EntityTable<StoredMediaFile, "id">;
  runningTexts!: EntityTable<StoredRunningTextItem, "id">;
  settings!: EntityTable<StoredSetting, "key">;

  constructor() {
    super("MasjidDB");

    this.version(1).stores({
      // Primary key first, then indexed fields
      prayerSchedules: "date",
      slideshowImages: "id, order, isActive",
      mediaBlobs: "id",
      mediaFiles: "id, type",
      runningTexts: "id, order, isActive",
      settings: "key",
    });
  }
}

/** Singleton DB instance — import this everywhere */
export const db = new MasjidDB();

// ---------------------------------------------------------------------------
// Prayer Schedule helpers
// ---------------------------------------------------------------------------

/**
 * Save a batch of pre-computed prayer schedules.
 * Uses bulkPut so it's safe to call multiple times (upsert behavior).
 */
export async function savePrayerSchedules(
  schedules: StoredPrayerSchedule[],
): Promise<void> {
  try {
    await db.prayerSchedules.bulkPut(schedules);
  } catch (error) {
    console.error("[MasjidDB] Failed to save prayer schedules:", error);
    throw error;
  }
}

/**
 * Get prayer schedule for a specific date.
 * @param date - Format: "YYYY-MM-DD"
 */
export async function getPrayerSchedule(
  date: string,
): Promise<StoredPrayerSchedule | undefined> {
  try {
    return await db.prayerSchedules.get(date);
  } catch (error) {
    console.error("[MasjidDB] Failed to get prayer schedule:", error);
    return undefined;
  }
}

/**
 * Get the total count of stored prayer schedules.
 * Used to check if pre-computation has been done.
 */
export async function getPrayerScheduleCount(): Promise<number> {
  try {
    return await db.prayerSchedules.count();
  } catch (error) {
    console.error("[MasjidDB] Failed to count prayer schedules:", error);
    return 0;
  }
}

/**
 * Clear all stored prayer schedules.
 * Called when recalculation is needed (e.g. location changed).
 */
export async function clearPrayerSchedules(): Promise<void> {
  try {
    await db.prayerSchedules.clear();
  } catch (error) {
    console.error("[MasjidDB] Failed to clear prayer schedules:", error);
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Media helpers
// ---------------------------------------------------------------------------

/**
 * Save a media file metadata + its blob in a single transaction.
 */
export async function saveMediaFile(
  metadata: StoredMediaFile,
  blob: Blob,
): Promise<void> {
  try {
    await db.transaction("rw", db.mediaFiles, db.mediaBlobs, async () => {
      await db.mediaFiles.put(metadata);
      await db.mediaBlobs.put({ id: metadata.id, blob });
    });
  } catch (error) {
    console.error("[MasjidDB] Failed to save media file:", error);
    throw error;
  }
}

/**
 * Get a media blob by its ID and return a temporary object URL.
 * Caller is responsible for calling URL.revokeObjectURL() when done.
 */
export async function getMediaBlobUrl(id: string): Promise<string | null> {
  try {
    const stored = await db.mediaBlobs.get(id);
    if (!stored) return null;
    return URL.createObjectURL(stored.blob);
  } catch (error) {
    console.error("[MasjidDB] Failed to get media blob:", error);
    return null;
  }
}

/**
 * Delete a media file and its blob in a single transaction.
 */
export async function deleteMediaFile(id: string): Promise<void> {
  try {
    await db.transaction("rw", db.mediaFiles, db.mediaBlobs, async () => {
      await db.mediaFiles.delete(id);
      await db.mediaBlobs.delete(id);
    });
  } catch (error) {
    console.error("[MasjidDB] Failed to delete media file:", error);
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Slideshow helpers
// ---------------------------------------------------------------------------

/**
 * Get all active slideshow images sorted by order.
 * Uses filter() instead of .where("isActive") because
 * Dexie boolean indexing is unreliable across browsers.
 */
export async function getActiveSlideshowImages(): Promise<
  StoredSlideshowImage[]
> {
  try {
    const all = await db.slideshowImages.toArray();
    return all.filter((img) => img.isActive).sort((a, b) => a.order - b.order);
  } catch (error) {
    console.error("[MasjidDB] Failed to get slideshow images:", error);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Running text helpers
// ---------------------------------------------------------------------------

/**
 * Get all active running text items sorted by order.
 * Uses filter() for the same reason as getActiveSlideshowImages.
 */
export async function getActiveRunningTexts(): Promise<
  StoredRunningTextItem[]
> {
  try {
    const all = await db.runningTexts.toArray();
    return all
      .filter((item) => item.isActive)
      .sort((a, b) => a.order - b.order);
  } catch (error) {
    console.error("[MasjidDB] Failed to get running texts:", error);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Settings helpers
// ---------------------------------------------------------------------------

/**
 * Get a setting value by key, with a fallback default.
 */
export async function getSetting<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const stored = await db.settings.get(key);
    if (!stored) return defaultValue;
    return JSON.parse(stored.value) as T;
  } catch (error) {
    console.error(`[MasjidDB] Failed to get setting "${key}":`, error);
    return defaultValue;
  }
}

/**
 * Save a setting value by key.
 */
export async function saveSetting(key: string, value: unknown): Promise<void> {
  try {
    await db.settings.put({ key, value: JSON.stringify(value) });
  } catch (error) {
    console.error(`[MasjidDB] Failed to save setting "${key}":`, error);
    throw error;
  }
}
