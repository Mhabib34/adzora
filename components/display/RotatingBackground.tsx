"use client";

import { useEffect, useState, memo } from "react";
import { AnimatePresence, motion } from "framer-motion";

const BACKGROUND_IMAGES = [
  "/images/backgrounds/bg_mecca.png",
  "/images/backgrounds/bg_medina.jpg",
  "/images/backgrounds/bg_mosque.jpg",
  "/images/backgrounds/bg_praying.jpg",
  "/images/backgrounds/islamic_bg_1.png",
  "/images/backgrounds/islamic_bg_2.png",
  "/images/backgrounds/islamic_bg_3.png",
  "/images/backgrounds/islamic_bg_4.png",
  "/images/backgrounds/islamic_bg_5.png",
];

export const RotatingBackground = memo(function RotatingBackground() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % BACKGROUND_IMAGES.length);
    }, 20000); // Ganti gambar setiap 20 detik

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-black">
      <AnimatePresence mode="wait">
        <motion.img
          key={BACKGROUND_IMAGES[currentIndex]}
          src={BACKGROUND_IMAGES[currentIndex]}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ opacity: 0, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
      </AnimatePresence>
      {/* Overlay gelap transparan untuk menjaga keterbacaan teks utama */}
      <div className="absolute inset-0 bg-black/25 z-10" />
    </div>
  );
});
