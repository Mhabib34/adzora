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
    <div className="space-y-8">
      {/* Top Header */}
      <div className="border-b border-white/5 pb-6">
        <h1 className="text-3xl font-bold font-display text-white tracking-wide">
          Media Galeri & Audio Adzan
        </h1>
        <p className="text-sm font-sans text-white/60 mt-1">
          Kelola koleksi foto slideshow layar display dan nada pengingat adzan
        </p>
      </div>

      {/* ── SLIDESHOW IMAGES ── */}
      <div className="bg-[--color-surface]/60 backdrop-blur-2xl rounded-3xl p-6 border border-[--color-secondary]/20 shadow-xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[--color-secondary]/20 border border-[--color-secondary]/30 flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-[--color-secondary]" />
            </div>
            <div>
              <h2 className="text-base font-bold font-display text-white">
                Galeri Foto Slideshow
              </h2>
              <p className="text-xs text-white/50">
                Foto yang akan tampil full-screen secara otomatis di layar TV
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold font-mono text-[--color-secondary] bg-[--color-secondary]/10 border border-[--color-secondary]/20 px-3 py-1 rounded-full">
            {activeCount} Aktif / {images.length} Total
          </span>
        </div>

        {/* Upload Dropzone */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadStatus === "uploading"}
          className="w-full border-2 border-dashed border-[--color-secondary]/30 hover:border-[--color-secondary]/60 bg-white/5 hover:bg-white/10 rounded-2xl py-10 flex flex-col items-center justify-center gap-3 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group shadow-inner"
        >
          {uploadStatus === "uploading" ? (
            <Loader2 className="w-10 h-10 text-[--color-secondary] animate-spin" />
          ) : uploadStatus === "done" ? (
            <CheckCircle className="w-10 h-10 text-emerald-400" />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-[--color-secondary]/10 border border-[--color-secondary]/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Upload className="w-7 h-7 text-[--color-secondary]" />
            </div>
          )}
          <div className="text-center">
            <p className="text-sm font-bold font-display text-white">
              {uploadStatus === "uploading"
                ? "Mengunggah Gambar..."
                : uploadStatus === "done"
                  ? "Berhasil Diunggah!"
                  : "Klik untuk Memilih Foto Gambar"}
            </p>
            <p className="text-xs font-sans text-white/40 mt-1">
              Format yang didukung: JPG, PNG, WebP — Maksimal 5 MB per foto
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
          <div className="flex items-start gap-2 text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl p-3">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            {uploadError}
          </div>
        )}

        {/* Image Grid List */}
        {loadingImages ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 text-[--color-secondary] animate-spin" />
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-10 text-white/30 border border-white/5 rounded-2xl">
            <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Belum ada foto yang diunggah.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {images.map((img) => (
              <div
                key={img.id}
                className={`flex flex-col justify-between rounded-2xl overflow-hidden border transition-all duration-300 shadow-md ${
                  img.isActive
                    ? "border-white/10 bg-white/5 hover:border-[--color-secondary]/40"
                    : "border-white/5 bg-black/20 opacity-40"
                }`}
              >
                {/* Thumbnail */}
                <div className="h-36 w-full bg-black/40 relative overflow-hidden group">
                  {img.blobUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={img.blobUrl}
                      alt={img.filename}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-white/20" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-mono text-white/80">
                    {(img.size / 1024).toFixed(0)} KB
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="p-3 flex items-center justify-between gap-2 border-t border-white/5">
                  <p className="text-xs font-semibold font-sans text-white/80 truncate flex-1">
                    {img.filename}
                  </p>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleToggleImage(img.id, img.isActive)}
                      className={`text-xs rounded-lg px-2 py-1 font-semibold transition-all border ${
                        img.isActive
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                          : "bg-white/5 text-white/40 border-white/10"
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
                          className="text-[11px] bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40 rounded-lg px-2 py-1 font-semibold transition-all"
                        >
                          Ya
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="text-[11px] bg-white/5 text-white/40 rounded-lg px-2 py-1 transition-all"
                        >
                          Batal
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(img.id)}
                        className="w-7 h-7 rounded-lg bg-white/5 hover:bg-red-500/20 flex items-center justify-center border border-white/5 transition-all group"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-white/50 group-hover:text-red-400" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── ADZAN AUDIO ── */}
      <div className="bg-[--color-surface]/60 backdrop-blur-2xl rounded-3xl p-6 border border-[--color-secondary]/20 shadow-xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[--color-secondary]/20 border border-[--color-secondary]/30 flex items-center justify-center">
            <Music className="w-5 h-5 text-[--color-secondary]" />
          </div>
          <div>
            <h2 className="text-base font-bold font-display text-white">
              Pengaturan Audio Adzan
            </h2>
            <p className="text-xs text-white/50">
              Pilih suara lantunan adzan & tingkat volume suara pengingat
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Source selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold tracking-widest uppercase text-white/60">
              Sumber Audio Adzan
            </label>
            <div className="relative">
              <select
                value={adzanAudio.source}
                onChange={(e) =>
                  setAdzanAudio({ source: e.target.value as AdzanAudioSource })
                }
                className="w-full appearance-none rounded-2xl px-4 py-3.5 pr-10 text-sm bg-white/5 border border-white/10 text-white font-semibold focus:border-[--color-secondary]/60 outline-none transition-all cursor-pointer"
              >
                {AUDIO_SOURCES.map((src) => (
                  <option key={src} value={src} className="bg-gray-900">
                    {ADZAN_AUDIO_LABELS[src]}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
            </div>
          </div>

          {/* Volume slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold tracking-widest uppercase text-white/60">
                Tingkat Volume
              </label>
              <div className="flex items-center gap-2">
                {volumeSaving && (
                  <Loader2 className="w-3 h-3 text-[--color-secondary] animate-spin" />
                )}
                <span className="text-xs font-mono font-bold text-[--color-secondary] bg-[--color-secondary]/10 border border-[--color-secondary]/20 px-2.5 py-0.5 rounded-full">
                  {Math.round(adzanAudio.volume * 100)}%
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Volume2 className="w-5 h-5 text-[--color-secondary] shrink-0" />
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={adzanAudio.volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="flex-1 accent-[--color-secondary] h-2 bg-white/10 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Fajr adzan toggle */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
          <div>
            <p className="text-sm font-bold font-display text-white">
              Gunakan Adzan Subuh Khusus
            </p>
            <p className="text-xs text-white/50 mt-0.5">
              Mengumandangkan nada khusus &quot;Ash-Shalatu Khairum Minan Naum&quot; saat waktu Subuh tiba
            </p>
          </div>
          <button
            onClick={() =>
              setAdzanAudio({
                useFajrAdzanForSubuh: !adzanAudio.useFajrAdzanForSubuh,
              })
            }
            className={`flex items-center gap-2 text-xs rounded-full px-4 py-2 font-semibold transition-all border ${
              adzanAudio.useFajrAdzanForSubuh
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                : "bg-white/5 text-white/40 border-white/10"
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
    </div>
  );
}
