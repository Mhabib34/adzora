"use client";

import { memo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useDisplayStore } from "../../stores/useDisplayStore";

/**
 * Full-screen overlay displayed while adzan is playing.
 * Shows prayer name in Arabic and Indonesian.
 */
export const AdzanOverlay = memo(function AdzanOverlay() {
  const isPlaying = useDisplayStore((s) => s.isAdzanPlaying);
  const nextPrayer = useDisplayStore((s) => s.nextPrayer);

  const prayerName = nextPrayer?.prayer.name ?? "";

  return (
    <AnimatePresence>
      {isPlaying && (
        <motion.div
          key="adzan-overlay"
          className="fixed inset-0 z-50 w-full h-screen flex flex-col items-center justify-center bg-background"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Arabic calligraphy-style label */}
          <motion.p
            className="font-arabic text-secondary"
            style={{ fontSize: "var(--text-display-lg)" }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            الصلاة
          </motion.p>

          {/* Indonesian prayer name */}
          <motion.p
            className="mt-4 font-semibold text-primary-foreground"
            style={{ fontSize: "var(--text-display-md)" }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Waktu {prayerName}
          </motion.p>

          {/* Subtitle */}
          <motion.p
            className="mt-2 text-primary-foreground opacity-50"
            style={{ fontSize: "var(--text-display-sm)" }}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            Segera tunaikan sholat
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
