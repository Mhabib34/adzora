"use client";

import { useEffect, useState, useRef, memo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { db, getActiveSlideshowImages } from "../../db/MasjidDB";
import { useMosqueStore } from "../../stores/useMosqueStore";
import { Image as ImageIcon } from "lucide-react";

interface SlideshowSlide {
  id: string;
  blobUrl: string;
}

const DEFAULT_SLIDES: SlideshowSlide[] = [
  { id: "def-1", blobUrl: "/images/backgrounds/bg_mecca.png" },
  { id: "def-2", blobUrl: "/images/backgrounds/bg_medina.jpg" },
  { id: "def-3", blobUrl: "/images/backgrounds/bg_mosque.jpg" },
  { id: "def-4", blobUrl: "/images/backgrounds/bg_praying.jpg" },
];

/**
 * Slideshow component.
 * Loads active images from IndexedDB as blob URLs,
 * auto-advances based on slideDuration setting.
 * Falls back to high-res Islamic backgrounds if no custom images exist.
 */
export const Slideshow = memo(function Slideshow() {
  const slideDuration = useMosqueStore((s) => s.display.slideDuration);

  const [slides, setSlides] = useState<SlideshowSlide[]>(DEFAULT_SLIDES);
  const [currentIndex, setIndex] = useState(0);
  const blobUrlsRef = useRef<string[]>([]);

  // Load images from IndexedDB on mount
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const images = await getActiveSlideshowImages();
        if (cancelled) return;

        if (!images.length) {
          setSlides(DEFAULT_SLIDES);
          return;
        }

        const loaded: SlideshowSlide[] = [];

        for (const img of images) {
          const stored = await db.mediaBlobs.get(img.id);
          if (!stored) continue;

          const url = URL.createObjectURL(stored.blob);
          blobUrlsRef.current.push(url);
          loaded.push({ id: img.id, blobUrl: url });
        }

        if (!cancelled) {
          setSlides(loaded.length ? loaded : DEFAULT_SLIDES);
        }
      } catch (error) {
        console.error("[Slideshow] Failed to load images:", error);
        if (!cancelled) setSlides(DEFAULT_SLIDES);
      }
    };

    void load();

    return () => {
      cancelled = true;
      // Revoke all blob URLs to free memory
      blobUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      blobUrlsRef.current = [];
    };
  }, []);

  // Auto-advance timer
  useEffect(() => {
    if (slides.length <= 1) return;

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, Math.max(3, slideDuration) * 1000);

    return () => clearInterval(timer);
  }, [slides.length, slideDuration]);

  const current = slides[currentIndex] || DEFAULT_SLIDES[0];

  return (
    <div className="relative h-full w-full overflow-hidden bg-black flex items-center justify-center">
      {/* Top Overlay Badge */}
      <div className="absolute top-8 left-8 z-20 flex items-center gap-2.5 px-5 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white font-bold text-xs uppercase tracking-widest shadow-lg">
        <ImageIcon className="w-4 h-4 text-amber-400" />
        <span>Galeri Foto Masjid</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.img
          key={current.id}
          src={current.blobUrl}
          alt="Mosque Slideshow"
          className="h-full w-full object-cover"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 1, ease: "easeInOut" }}
        />
      </AnimatePresence>

      {/* Slide Counter Dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2 p-2 rounded-full bg-black/50 backdrop-blur-md border border-white/10">
          {slides.map((s, idx) => (
            <div
              key={s.id}
              className={`h-2 rounded-full transition-all duration-500 ${
                idx === currentIndex
                  ? "w-8 bg-amber-400"
                  : "w-2 bg-white/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
});

