"use client";

import { memo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useIqomahCountdown } from "../../hooks/useIqomahCountdown";
import { useDisplayStore } from "../../stores/useDisplayStore";

/**
 * Full-screen Iqomah Countdown Overlay.
 * Islamic Dark Luxury theme — emerald dark background, golden glow countdown,
 * arabesque ornaments, and animated star particles.
 */
export const IqomahCountdown = memo(function IqomahCountdown() {
  const { display, isActive } = useIqomahCountdown();
  const nextPrayer = useDisplayStore((s) => s.nextPrayer);

  const prayerName = nextPrayer?.prayer.name ?? "";

  const STARS = [
    { x: "10%", y: "10%", size: 2.5, delay: 0 },
    { x: "85%", y: "7%",  size: 3,   delay: 0.5 },
    { x: "4%",  y: "60%", size: 2,   delay: 0.9 },
    { x: "93%", y: "50%", size: 3.5, delay: 0.2 },
    { x: "20%", y: "88%", size: 2,   delay: 1.2 },
    { x: "75%", y: "85%", size: 2.5, delay: 0.7 },
    { x: "50%", y: "4%",  size: 2,   delay: 1.5 },
    { x: "60%", y: "94%", size: 1.5, delay: 1 },
  ];

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          key="iqomah-overlay"
          className="fixed inset-0 z-40 flex flex-col items-center justify-center overflow-hidden"
          style={{
            background:
              "radial-gradient(ellipse at center bottom, rgba(26, 107, 60, 0.4) 0%, rgba(5, 18, 12, 0.96) 55%, rgba(3, 10, 7, 1) 100%)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* ── Ambient glow ── */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 50% 60%, rgba(212, 160, 23, 0.15) 0%, rgba(26, 107, 60, 0.1) 45%, transparent 65%)",
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
                boxShadow: `0 0 ${star.size * 3}px ${star.size}px rgba(251,191,36,0.5)`,
              }}
              animate={{ opacity: [0.2, 0.9, 0.2], scale: [1, 1.6, 1] }}
              transition={{
                duration: 2.2,
                delay: star.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}

          {/* ── Corner Ornaments ── */}
          <motion.div
            className="absolute top-6 left-8 text-[--color-secondary]/35 select-none pointer-events-none leading-none"
            style={{ fontSize: "clamp(2.5rem, 5vw, 5rem)", fontFamily: "serif" }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
          >
            ❧
          </motion.div>
          <motion.div
            className="absolute top-6 right-8 text-[--color-secondary]/35 select-none pointer-events-none leading-none scale-x-[-1]"
            style={{ fontSize: "clamp(2.5rem, 5vw, 5rem)", fontFamily: "serif" }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
          >
            ❧
          </motion.div>
          <motion.div
            className="absolute bottom-6 left-8 text-[--color-secondary]/25 select-none pointer-events-none leading-none scale-y-[-1]"
            style={{ fontSize: "clamp(2rem, 4vw, 4rem)", fontFamily: "serif" }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
          >
            ❧
          </motion.div>
          <motion.div
            className="absolute bottom-6 right-8 text-[--color-secondary]/25 select-none pointer-events-none leading-none scale-x-[-1] scale-y-[-1]"
            style={{ fontSize: "clamp(2rem, 4vw, 4rem)", fontFamily: "serif" }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
          >
            ❧
          </motion.div>

          {/* ── Top Badge ── */}
          <motion.div
            className="absolute top-10 flex items-center gap-3 px-7 py-2.5 rounded-full border border-emerald-400/40 bg-emerald-950/70 backdrop-blur-md shadow-[0_0_20px_rgba(52,211,153,0.15)]"
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.6 }}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
            <span className="font-display font-bold text-sm md:text-base tracking-[0.3em] uppercase text-emerald-300">
              Iqomah
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
          </motion.div>

          {/* ── Main Content ── */}
          <div className="relative z-10 flex flex-col items-center text-center">
            {/* Prayer Name (Arabic-style large) */}
            <motion.p
              className="font-arabic text-[--color-secondary] select-none font-bold"
              style={{
                fontSize: "clamp(3rem, 8vw, 7rem)",
                lineHeight: 1.2,
                textShadow:
                  "0 0 30px rgba(212, 160, 23, 0.5), 0 0 60px rgba(212, 160, 23, 0.2)",
              }}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.7 }}
            >
              {prayerName}
            </motion.p>

            {/* Label */}
            <motion.p
              className="mt-4 font-display font-semibold text-emerald-100/70 tracking-[0.25em] uppercase"
              style={{ fontSize: "clamp(1rem, 2.5vw, 2rem)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.5 }}
            >
              Iqomah dalam
            </motion.p>

            {/* Countdown Number — super large */}
            <motion.span
              key={display}
              className="font-mono tabular-nums font-black text-[--color-secondary] select-none"
              style={{
                fontSize: "clamp(8rem, 22vw, 22rem)",
                lineHeight: 0.9,
                textShadow:
                  "0 0 60px rgba(212, 160, 23, 0.7), 0 0 120px rgba(212, 160, 23, 0.3), 0 8px 40px rgba(0,0,0,0.8)",
              }}
              initial={{ scale: 0.75, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
            >
              {display}
            </motion.span>

            {/* Detik label */}
            <motion.p
              className="mt-4 font-display font-semibold text-emerald-100/60 tracking-[0.3em] uppercase"
              style={{ fontSize: "clamp(1rem, 2vw, 1.8rem)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Detik Lagi
            </motion.p>
          </div>

          {/* ── Horizontal Golden Lines ── */}
          <motion.div
            className="absolute left-12 right-12 h-px"
            style={{
              top: "18%",
              background:
                "linear-gradient(to right, transparent, rgba(212, 160, 23, 0.35), transparent)",
            }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.9 }}
          />
          <motion.div
            className="absolute left-12 right-12 h-px"
            style={{
              top: "82%",
              background:
                "linear-gradient(to right, transparent, rgba(212, 160, 23, 0.35), transparent)",
            }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.9 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
});

