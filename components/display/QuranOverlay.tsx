"use client";

import { memo, useMemo, useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { VERSES } from "../../data/verses";
import { BookOpen, Sparkles } from "lucide-react";

interface QuranOverlayProps {
  isActive: boolean;
}

/**
 * Full-screen Quran Verse Overlay.
 * Appears periodically (every 5 mins) for 15 seconds.
 * Features rich Islamic Dark Luxury design aesthetics: glassmorphism, golden ambient glows,
 * Amiri calligraphic typography, and a 15-second progress countdown bar.
 */
export const QuranOverlay = memo(function QuranOverlay({
  isActive,
}: QuranOverlayProps) {
  const [verseIndex, setVerseIndex] = useState(0);

  // Pick a new verse whenever overlay becomes active
  useEffect(() => {
    if (isActive) {
      setVerseIndex((prev) => (prev + 1) % VERSES.length);
    }
  }, [isActive]);

  const verse = useMemo(() => {
    return VERSES[verseIndex] ?? VERSES[0];
  }, [verseIndex]);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          key="quran-overlay"
          className="fixed inset-0 z-50 flex flex-col items-center justify-between p-6 md:p-12 overflow-hidden bg-slate-950/90 backdrop-blur-2xl"
          style={{
            background:
              "radial-gradient(circle at center, rgba(13, 45, 28, 0.92) 0%, rgba(5, 18, 12, 0.98) 100%)",
          }}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Ambient decorative glow circles */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] rounded-full pointer-events-none opacity-25 blur-3xl"
            style={{
              background:
                "radial-gradient(circle, var(--color-secondary, #d4a017) 0%, var(--color-primary, #1a6b3c) 60%, transparent 80%)",
            }}
          />

          {/* Top Header Label Badge */}
          <motion.div
            className="z-10 flex items-center gap-2.5 px-6 py-2.5 rounded-full border border-[--color-secondary]/50 bg-emerald-950/80 shadow-[0_0_20px_rgba(212,160,23,0.2)] backdrop-blur-md"
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.5 }}
          >
            <BookOpen className="w-5 h-5 text-[--color-secondary]" />
            <span className="font-display font-bold text-sm md:text-base tracking-widest uppercase text-[--color-secondary]">
              Mutiara Al-Qur&apos;an & Hadits
            </span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </motion.div>

          {/* Center Verse Card */}
          <motion.div
            className="z-10 max-w-5xl w-full my-auto flex flex-col items-center text-center px-8 md:px-14 py-10 md:py-14 rounded-3xl border border-[--color-secondary]/35 bg-emerald-950/60 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] relative"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.6 }}
          >
            {/* Corner Decorative Ornaments */}
            <div className="absolute top-4 left-5 text-[--color-secondary]/60 font-arabic text-2xl select-none">
              ❖
            </div>
            <div className="absolute top-4 right-5 text-[--color-secondary]/60 font-arabic text-2xl select-none">
              ❖
            </div>
            <div className="absolute bottom-4 left-5 text-[--color-secondary]/60 font-arabic text-2xl select-none">
              ❖
            </div>
            <div className="absolute bottom-4 right-5 text-[--color-secondary]/60 font-arabic text-2xl select-none">
              ❖
            </div>

            {/* Arabic Text */}
            <p
              className="font-arabic leading-[2.3] text-[--color-secondary] mb-8 drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] select-none font-bold"
              style={{
                fontSize: "clamp(2.2rem, 4.5vw, 4.2rem)",
                direction: "rtl",
              }}
            >
              {verse.arabic}
            </p>

            {/* Glowing Golden Divider */}
            <div className="w-40 h-0.5 my-3 bg-linear-to-r from-transparent via-[--color-secondary] to-transparent shadow-[0_0_10px_rgba(212,160,23,0.8)]" />

            {/* Indonesian Translation */}
            <p
              className="font-sans font-medium text-emerald-50 leading-relaxed max-w-3xl mt-6 italic drop-shadow-sm"
              style={{ fontSize: "clamp(1.1rem, 2vw, 1.7rem)" }}
            >
              &ldquo;{verse.translation}&rdquo;
            </p>

            {/* Source Reference Badge */}
            <div className="mt-8 px-6 py-2 rounded-full bg-[--color-secondary]/15 border border-[--color-secondary]/40 text-[--color-secondary] font-display font-bold text-base md:text-lg tracking-wide shadow-md">
              {verse.source}
            </div>
          </motion.div>

          {/* Bottom Countdown Progress Bar (15s duration) */}
          <div className="z-10 w-full max-w-xl flex flex-col items-center gap-2">
            <span className="font-display text-xs md:text-sm tracking-wider uppercase text-emerald-100/70 font-semibold">
              Kembali ke Tampilan Utama dalam 15 Detik
            </span>
            <div className="w-full h-2 rounded-full bg-emerald-950/80 border border-emerald-500/20 overflow-hidden relative shadow-inner">
              <motion.div
                className="h-full bg-linear-to-r from-[--color-primary] via-[--color-secondary] to-amber-300 shadow-[0_0_12px_rgba(234,179,8,0.8)]"
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 15, ease: "linear" }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

