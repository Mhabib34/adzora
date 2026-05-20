"use client";

import { useEffect, useState, useRef, memo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { db } from "../../db/MasjidDB";
import { getActiveSlideshowImages } from "../../db/MasjidDB";
import { useMosqueStore } from "../../stores/useMosqueStore";

interface SlideshowSlide {
  id: string;
  blobUrl: string;
}

/**
 * Slideshow component.
 * Loads active images from IndexedDB as blob URLs,
 * auto-advances based on slideDuration setting.
 */
export const Slideshow = memo(function Slideshow() {
  const slideDuration = useMosqueStore((s) => s.display.slideDuration);

  const [slides, setSlides] = useState<SlideshowSlide[]>([]);
  const [currentIndex, setIndex] = useState(0);
  const blobUrlsRef = useRef<string[]>([]);

  // Load images from IndexedDB on mount
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const images = await getActiveSlideshowImages();
        if (cancelled || !images.length) return;

        const loaded: SlideshowSlide[] = [];

        for (const img of images) {
          const stored = await db.mediaBlobs.get(img.id);
          if (!stored) continue;

          const url = URL.createObjectURL(stored.blob);
          blobUrlsRef.current.push(url);
          loaded.push({ id: img.id, blobUrl: url });
        }

        if (!cancelled) setSlides(loaded);
      } catch (error) {
        console.error("[Slideshow] Failed to load images:", error);
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
    }, slideDuration * 1000);

    return () => clearInterval(timer);
  }, [slides.length, slideDuration]);

  if (!slides.length) {
    return (
      <div className="flex h-full w-full items-center justify-center opacity-20">
        <span style={{ fontSize: "var(--text-display-sm)" }}>
          Tidak ada gambar
        </span>
      </div>
    );
  }

  const current = slides[currentIndex];

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl">
      <AnimatePresence mode="wait">
        <motion.img
          key={current.id}
          src={current.blobUrl}
          alt=""
          className="h-full w-full object-cover"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        />
      </AnimatePresence>
    </div>
  );
});
