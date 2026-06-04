"use client";

import { memo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useIqomahCountdown } from "../../hooks/useIqomahCountdown";
import { useDisplayStore } from "../../stores/useDisplayStore";

/**
 * Full-screen overlay displayed during iqomah countdown.
 * Uses Framer Motion for smooth enter/exit transitions.
 */
export const IqomahCountdown = memo(function IqomahCountdown() {
  const { display, isActive } = useIqomahCountdown();
  const nextPrayer = useDisplayStore((s) => s.nextPrayer);

  const prayerName = nextPrayer?.prayer.name ?? "";

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          key="iqomah-overlay"
          className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-secondary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Prayer name */}
          <motion.p
            className="text-secondary font-semibold"
            style={{ fontSize: "var(--text-display-md)" }}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {prayerName}
          </motion.p>

          {/* Label */}
          <motion.p
            className="mt-2 text-primary-foreground opacity-60"
            style={{ fontSize: "var(--text-display-sm)" }}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Iqomah dalam
          </motion.p>

          {/* Countdown */}
          <motion.span
            className="mt-4 tabular-nums font-bold text-primary-foreground"
            style={{ fontSize: "var(--text-display-2xl)" }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          >
            {display}
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
