"use client";

import { memo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useDisplayStore } from "../../stores/useDisplayStore";

/**
 * Full-screen Adzan Overlay displayed while adzan is playing.
 * Islamic Dark Luxury theme — arabesque ornaments, golden glows,
 * Amiri calligraphy, and animated star particles.
 */
export const AdzanOverlay = memo(function AdzanOverlay() {
  const isPlaying = useDisplayStore((s) => s.isAdzanPlaying);
  const nextPrayer = useDisplayStore((s) => s.nextPrayer);

  const prayerName = nextPrayer?.prayer.name ?? "";

  // Floating star/particle positions (fixed for no hydration mismatch)
  const STARS = [
    { x: "8%",  y: "12%", size: 3,   delay: 0 },
    { x: "88%", y: "8%",  size: 2.5, delay: 0.4 },
    { x: "5%",  y: "55%", size: 2,   delay: 0.8 },
    { x: "94%", y: "45%", size: 3.5, delay: 0.2 },
    { x: "18%", y: "85%", size: 2,   delay: 1.1 },
    { x: "78%", y: "82%", size: 3,   delay: 0.6 },
    { x: "45%", y: "5%",  size: 2.5, delay: 1.4 },
    { x: "55%", y: "92%", size: 2,   delay: 0.9 },
    { x: "92%", y: "70%", size: 1.5, delay: 1.6 },
    { x: "12%", y: "35%", size: 1.5, delay: 1.2 },
  ];

  return (
    <AnimatePresence>
      {isPlaying && (
        <motion.div
          key="adzan-overlay"
          className="fixed inset-0 z-50 w-full h-screen flex flex-col items-center justify-center overflow-hidden"
          style={{
            background:
              "radial-gradient(ellipse at center top, rgba(26, 107, 60, 0.35) 0%, rgba(5, 18, 12, 0.97) 60%, rgba(3, 10, 7, 1) 100%)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* ── Deep ambient glow behind center ── */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 50% 40%, rgba(212, 160, 23, 0.18) 0%, rgba(26, 107, 60, 0.12) 40%, transparent 70%)",
            }}
          />

          {/* ── Floating Star Particles ── */}
          {STARS.map((star, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-amber-300 pointer-events-none"
              style={{
                left: star.x,
                top: star.y,
                width: star.size,
                height: star.size,
                boxShadow: `0 0 ${star.size * 3}px ${star.size}px rgba(251,191,36,0.6)`,
              }}
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 2.5,
                delay: star.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}

          {/* ── Top Corner Arabesque Ornaments ── */}
          <motion.div
            className="absolute top-6 left-8 text-[--color-secondary]/40 select-none pointer-events-none leading-none"
            style={{ fontSize: "clamp(3rem, 6vw, 6rem)", fontFamily: "serif" }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            ❧
          </motion.div>
          <motion.div
            className="absolute top-6 right-8 text-[--color-secondary]/40 select-none pointer-events-none leading-none scale-x-[-1]"
            style={{ fontSize: "clamp(3rem, 6vw, 6rem)", fontFamily: "serif" }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            ❧
          </motion.div>
          <motion.div
            className="absolute bottom-6 left-8 text-[--color-secondary]/30 select-none pointer-events-none leading-none scale-y-[-1]"
            style={{ fontSize: "clamp(2.5rem, 5vw, 5rem)", fontFamily: "serif" }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            ❧
          </motion.div>
          <motion.div
            className="absolute bottom-6 right-8 text-[--color-secondary]/30 select-none pointer-events-none leading-none scale-x-[-1] scale-y-[-1]"
            style={{ fontSize: "clamp(2.5rem, 5vw, 5rem)", fontFamily: "serif" }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            ❧
          </motion.div>

          {/* ── Top Badge ── */}
          <motion.div
            className="absolute top-10 flex items-center gap-3 px-7 py-2.5 rounded-full border border-[--color-secondary]/40 bg-emerald-950/70 backdrop-blur-md shadow-[0_0_25px_rgba(212,160,23,0.2)]"
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <span
              className="w-3 h-3 rounded-full bg-[--color-secondary] shadow-[0_0_8px_4px_rgba(212,160,23,0.6)]"
              style={{ animation: "pulse 1.5s ease-in-out infinite" }}
            />
            <span className="font-display font-bold text-sm md:text-base tracking-[0.3em] uppercase text-[--color-secondary]">
              Waktu Adzan
            </span>
            <span
              className="w-3 h-3 rounded-full bg-[--color-secondary] shadow-[0_0_8px_4px_rgba(212,160,23,0.6)]"
              style={{ animation: "pulse 1.5s ease-in-out infinite 0.75s" }}
            />
          </motion.div>

          {/* ── Main Content Card ── */}
          <div className="relative z-10 flex flex-col items-center text-center max-w-4xl w-full px-8 md:px-16">

            {/* Arabic الصلاة */}
            <motion.p
              className="font-arabic text-[--color-secondary] select-none font-bold"
              style={{
                fontSize: "clamp(5rem, 14vw, 14rem)",
                lineHeight: 1.1,
                direction: "rtl",
                textShadow:
                  "0 0 40px rgba(212, 160, 23, 0.6), 0 0 80px rgba(212, 160, 23, 0.3)",
              }}
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              الصلاة
            </motion.p>

            {/* Golden Divider */}
            <motion.div
              className="w-48 md:w-64 h-0.5 my-6 bg-gradient-to-r from-transparent via-[--color-secondary] to-transparent shadow-[0_0_12px_rgba(212,160,23,0.8)]"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            />

            {/* Prayer Name */}
            <motion.p
              className="font-display font-black text-white tracking-wide uppercase"
              style={{
                fontSize: "clamp(3rem, 8vw, 8rem)",
                textShadow: "0 4px 24px rgba(0,0,0,0.8)",
                letterSpacing: "0.12em",
              }}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              {prayerName}
            </motion.p>

            {/* Subtitle */}
            <motion.p
              className="mt-6 font-sans font-semibold text-emerald-100/75 tracking-[0.2em] uppercase"
              style={{ fontSize: "clamp(1.2rem, 2.5vw, 2.2rem)" }}
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.85, duration: 0.6 }}
            >
              Segera tunaikan sholat
            </motion.p>
          </div>

          {/* ── Horizontal Golden Border Lines ── */}
          <motion.div
            className="absolute left-12 right-12 h-px bg-gradient-to-r from-transparent via-[--color-secondary]/40 to-transparent"
            style={{ top: "20%" }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.9 }}
          />
          <motion.div
            className="absolute left-12 right-12 h-px bg-gradient-to-r from-transparent via-[--color-secondary]/40 to-transparent"
            style={{ top: "80%" }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.9 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
});

