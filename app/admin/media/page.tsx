"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Upload,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Image as ImageIcon,
  Music,
  Volume2,
  AlertCircle,
  CheckCircle,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { useContentStore } from "../../../stores/useContentStore";
import {
  db,
  saveMediaFile,
  getMediaBlobUrl,
  deleteMediaFile,
} from "../../../db/MasjidDB";
import type { AdzanAudioSource } from "../../../types/content";
import { ADZAN_AUDIO_LABELS } from "../../../types/content";
import type { StoredSlideshowImage } from "../../../db/schema";

/** Local display type — adds resolved blobUrl on top of stored data */
interface DisplayImage extends StoredSlideshowImage {
  blobUrl: string | null;
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
const AUDIO_SOURCES: AdzanAudioSource[] = [
  "adzan-makkah",
  "adzan-madinah",
  "adzan-jakarta",
];

/**
 * Media management page — upload/manage slideshow images and adzan audio config.
 * Images stored as blobs in IndexedDB via MasjidDB helper functions.
 */
export default function MediaPage() {
  const { adzanAudio, setAdzanAudio } = useContentStore();

  const [images, setImages] = useState<DisplayImage[]>([]);
  const [loadingImages, setLoadingImages] = useState(true);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "done" | "error"
  >("idle");
  const [uploadError, setUploadError] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [volumeSaving, setVolumeSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /** Load all slideshow images from IndexedDB on mount, hydrate blob URLs */
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const all = await db.slideshowImages.toArray();
        const sorted = all.sort((a, b) => a.order - b.order);
        const withUrls: DisplayImage[] = await Promise.all(
          sorted.map(async (img) => {
            const blobUrl = await getMediaBlobUrl(img.id);
            return { ...img, blobUrl };
          }),
        );
        if (!cancelled) setImages(withUrls);
      } catch (e) {
        console.error("[MediaPage] Failed to load images:", e);
      } finally {
        if (!cancelled) setLoadingImages(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  /** Handle image file selection and persist to IndexedDB */
  const handleImageUpload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      setUploadStatus("uploading");
      setUploadError("");
      try {
        const newImages: DisplayImage[] = [];
        for (const file of Array.from(files)) {
          if (!file.type.startsWith("image/")) continue;
          if (file.size > MAX_IMAGE_SIZE) {
            setUploadError(`File "${file.name}" melebihi batas 5 MB.`);
            setUploadStatus("error");
            return;
          }
          const id = `img-${Date.now()}-${Math.random().toString(36).slice(2)}`;
          const createdAt = new Date().toISOString();

          // Save to mediaFiles + mediaBlobs via helper
          await saveMediaFile(
            {
              id,
              type: "image",
              filename: file.name,
              mimeType: file.type,
              size: file.size,
              createdAt,
            },
            file,
          );

          // Also register in slideshowImages table
          const stored: StoredSlideshowImage = {
            id,
            filename: file.name,
            order: images.length + newImages.length,
            isActive: true,
            createdAt,
            size: file.size,
          };
          await db.slideshowImages.put(stored);

          const blobUrl = URL.createObjectURL(file);
          newImages.push({ ...stored, blobUrl });
        }
        setImages((prev) => [...prev, ...newImages]);
        setUploadStatus("done");
        setTimeout(() => setUploadStatus("idle"), 2000);
      } catch (e) {
        console.error("[MediaPage] Upload failed:", e);
        setUploadError("Gagal menyimpan gambar. Coba lagi.");
        setUploadStatus("error");
      }
    },
    [images.length],
  );

  /** Toggle image active state in IndexedDB */
  const handleToggleImage = useCallback(
    async (id: string, current: boolean) => {
      try {
        await db.slideshowImages.update(id, { isActive: !current });
        setImages((prev) =>
          prev.map((img) =>
            img.id === id ? { ...img, isActive: !current } : img,
          ),
        );
      } catch (e) {
        console.error("[MediaPage] Toggle failed:", e);
      }
    },
    [],
  );

  /** Delete image from slideshowImages + mediaBlobs tables */
  const handleDeleteImage = useCallback(async (id: string) => {
    try {
      await db.slideshowImages.delete(id);
      await deleteMediaFile(id);
      setImages((prev) => {
        const img = prev.find((i) => i.id === id);
        if (img?.blobUrl) URL.revokeObjectURL(img.blobUrl);
        return prev.filter((i) => i.id !== id);
      });
      setDeleteConfirmId(null);
    } catch (e) {
      console.error("[MediaPage] Delete failed:", e);
    }
  }, []);

  /** Update volume in store with brief saving indicator */
  const handleVolumeChange = useCallback(
    async (val: number) => {
      setAdzanAudio({ volume: val });
      setVolumeSaving(true);
      await new Promise((r) => setTimeout(r, 500));
      setVolumeSaving(false);
    },
    [setAdzanAudio],
  );

  const activeCount = images.filter((i) => i.isActive).length;

  return (
    <div className="min-h-screen bg-[--color-background] text-white p-6">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-[--color-primary]">Media</h1>
          <p className="text-sm text-white/50 mt-1">
            Upload foto slideshow dan atur audio adzan.
          </p>
        </div>

        {/* ── SLIDESHOW IMAGES ── */}
        <div className="bg-[--color-surface] rounded-2xl p-5 border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[--color-secondary]" />
              <h2 className="text-sm font-bold text-white/70 uppercase tracking-wider">
                Foto Slideshow
              </h2>
            </div>
            <span className="text-xs text-white/30">
              {activeCount} aktif / {images.length} total
            </span>
          </div>

          {/* Upload zone */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadStatus === "uploading"}
            className="w-full border-2 border-dashed border-white/10 hover:border-[--color-primary]/40 rounded-xl py-8 flex flex-col items-center gap-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploadStatus === "uploading" ? (
              <Loader2 className="w-8 h-8 text-[--color-primary] animate-spin" />
            ) : uploadStatus === "done" ? (
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            ) : (
              <Upload className="w-8 h-8 text-white/25" />
            )}
            <div className="text-center">
              <p className="text-sm font-semibold text-white/50">
                {uploadStatus === "uploading"
                  ? "Mengunggah..."
                  : uploadStatus === "done"
                    ? "Berhasil diunggah!"
                    : "Klik untuk pilih foto"}
              </p>
              <p className="text-xs text-white/25 mt-0.5">
                JPG, PNG, WebP — maks 5 MB per file
              </p>
            </div>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleImageUpload(e.target.files)}
          />

          {uploadStatus === "error" && (
            <div className="flex items-start gap-2 text-xs text-red-400 bg-red-400/10 rounded-lg px-3 py-2">
              <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              {uploadError}
            </div>
          )}

          {/* Image list */}
          {loadingImages ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-5 h-5 text-white/30 animate-spin" />
            </div>
          ) : images.length === 0 ? (
            <p className="text-center text-xs text-white/25 py-4">
              Belum ada foto yang diunggah.
            </p>
          ) : (
            <div className="space-y-2">
              {images.map((img) => (
                <div
                  key={img.id}
                  className={`flex items-center gap-3 rounded-xl p-3 border transition-colors ${
                    img.isActive
                      ? "border-white/8 bg-white/3"
                      : "border-white/3 bg-white/1 opacity-50"
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="w-12 h-12 rounded-lg bg-white/5 overflow-hidden shrink-0">
                    {img.blobUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={img.blobUrl}
                        alt={img.filename}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-white/20" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white/70 truncate">
                      {img.filename}
                    </p>
                    <p className="text-xs text-white/30 mt-0.5">
                      {(img.size / 1024).toFixed(0)} KB
                    </p>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleToggleImage(img.id, img.isActive)}
                      className={`text-xs rounded-lg px-2 py-1.5 font-semibold transition-colors ${
                        img.isActive
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-white/5 text-white/30"
                      }`}
                    >
                      {img.isActive ? (
                        <ToggleRight className="w-4 h-4" />
                      ) : (
                        <ToggleLeft className="w-4 h-4" />
                      )}
                    </button>

                    {deleteConfirmId === img.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDeleteImage(img.id)}
                          className="text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg px-2 py-1 font-semibold transition-colors"
                        >
                          Hapus
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="text-xs bg-white/5 text-white/40 rounded-lg px-2 py-1 transition-colors"
                        >
                          Batal
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(img.id)}
                        className="w-7 h-7 rounded-lg bg-white/5 hover:bg-red-500/15 flex items-center justify-center transition-colors group"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-white/40 group-hover:text-red-400" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── ADZAN AUDIO ── */}
        <div className="bg-[--color-surface] rounded-2xl p-5 border border-white/5 space-y-4">
          <div className="flex items-center gap-2">
            <Music className="w-4 h-4 text-[--color-secondary]" />
            <h2 className="text-sm font-bold text-white/70 uppercase tracking-wider">
              Audio Adzan
            </h2>
          </div>

          {/* Source selection */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wide">
              Sumber Audio
            </label>
            <div className="relative">
              <select
                value={adzanAudio.source}
                onChange={(e) =>
                  setAdzanAudio({ source: e.target.value as AdzanAudioSource })
                }
                className="w-full appearance-none rounded-xl px-4 py-3 pr-10 text-sm bg-white/5 border border-white/10 text-white focus:border-[--color-primary]/60 outline-none transition-colors cursor-pointer"
              >
                {AUDIO_SOURCES.map((src) => (
                  <option key={src} value={src} className="bg-gray-900">
                    {ADZAN_AUDIO_LABELS[src]}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
            </div>
          </div>

          {/* Volume slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-white/50 uppercase tracking-wide">
                Volume
              </label>
              <div className="flex items-center gap-1.5">
                {volumeSaving && (
                  <Loader2 className="w-3 h-3 text-white/30 animate-spin" />
                )}
                <span className="text-xs font-mono text-white/50">
                  {Math.round(adzanAudio.volume * 100)}%
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Volume2 className="w-4 h-4 text-white/30 shrink-0" />
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={adzanAudio.volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="flex-1 accent-[--color-primary]"
              />
            </div>
          </div>

          {/* Fajr adzan toggle */}
          <div className="flex items-center justify-between py-2 border-t border-white/5">
            <div>
              <p className="text-sm font-semibold text-white/80">
                Adzan Subuh Khusus
              </p>
              <p className="text-xs text-white/40 mt-0.5">
                Gunakan adzan Fajr terpisah untuk waktu Subuh
              </p>
            </div>
            <button
              onClick={() =>
                setAdzanAudio({
                  useFajrAdzanForSubuh: !adzanAudio.useFajrAdzanForSubuh,
                })
              }
              className={`flex items-center gap-1.5 text-xs rounded-xl px-3 py-2 font-semibold transition-colors ${
                adzanAudio.useFajrAdzanForSubuh
                  ? "bg-emerald-500/15 text-emerald-400"
                  : "bg-white/5 text-white/35"
              }`}
            >
              {adzanAudio.useFajrAdzanForSubuh ? (
                <ToggleRight className="w-5 h-5" />
              ) : (
                <ToggleLeft className="w-5 h-5" />
              )}
              {adzanAudio.useFajrAdzanForSubuh ? "Aktif" : "Nonaktif"}
            </button>
          </div>
        </div>

        <div className="pb-4" />
      </div>
    </div>
  );
}
