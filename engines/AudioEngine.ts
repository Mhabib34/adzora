import { Howl, Howler } from "howler";
import { getMediaBlobUrl } from "../db/MasjidDB";
import type { AdzanAudioSource } from "../types/content";

/** Maps built-in audio source keys to public asset paths. */
const BUILTIN_AUDIO_PATHS: Record<
  Exclude<AdzanAudioSource, "custom">,
  string
> = {
  "adzan-makkah": "/audio/adzan-makkah.mp3",
  "adzan-madinah": "/audio/adzan-madinah.mp3",
  "adzan-jakarta": "/audio/adzan-jakarta.mp3",
};

/**
 * Singleton audio engine for adzan playback.
 * Uses Howler.js for cross-browser audio support.
 */
export class AudioEngine {
  private static instance: AudioEngine | null = null;
  private currentHowl: Howl | null = null;
  private blobUrl: string | null = null;

  private constructor() {}

  /** Returns the singleton instance. */
  static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine();
    }
    return AudioEngine.instance;
  }

  /**
   * Sets the global Howler volume (0.0 – 1.0).
   */
  setVolume(volume: number): void {
    Howler.volume(Math.max(0, Math.min(1, volume)));
  }

  /**
   * Plays the adzan audio.
   * @param source  - Which audio source to use.
   * @param isFajr  - If true and source is custom, uses Fajr-specific audio
   *                  (future extension point; currently identical).
   * @param customFileId - Required when source === "custom".
   * @param onEnd   - Optional callback fired when audio finishes.
   */
  async playAdzan(
    source: AdzanAudioSource,
    isFajr: boolean,
    customFileId?: string,
    onEnd?: () => void,
  ): Promise<void> {
    // Stop any currently playing audio first
    this.stop();

    let src: string;

    if (source === "custom") {
      if (!customFileId) {
        console.warn(
          "[AudioEngine] Custom source requested but no fileId provided",
        );
        return;
      }

      const url = await getMediaBlobUrl(customFileId);
      if (!url) {
        console.warn("[AudioEngine] Could not retrieve custom audio blob");
        return;
      }

      // Track blob URL so we can revoke it on stop
      this.blobUrl = url;
      src = url;
    } else {
      src = BUILTIN_AUDIO_PATHS[source];
    }

    this.currentHowl = new Howl({
      src: [src],
      html5: true, // Required for long audio files on mobile
      onend: () => {
        this.cleanup();
        onEnd?.();
      },
      onloaderror: (_id, error) => {
        console.error("[AudioEngine] Failed to load audio:", error);
        this.cleanup();
        // Fallback: biarkan overlay adzan tampil selama 5 menit tanpa suara
        setTimeout(() => {
          onEnd?.();
        }, 5 * 60 * 1000);
      },
    });

    this.currentHowl.play();
  }

  /**
   * Stops and unloads the currently playing audio.
   */
  stop(): void {
    if (this.currentHowl) {
      this.currentHowl.stop();
      this.currentHowl.unload();
      this.currentHowl = null;
    }
    this.cleanup();
  }

  /** Returns true if audio is currently playing. */
  get isPlaying(): boolean {
    return this.currentHowl?.playing() ?? false;
  }

  /** Revokes any tracked blob URL to free memory. */
  private cleanup(): void {
    if (this.blobUrl) {
      URL.revokeObjectURL(this.blobUrl);
      this.blobUrl = null;
    }
  }
}
