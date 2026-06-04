"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminStore } from "../stores/useAdminStore";
import { useMosqueStore } from "../stores/useMosqueStore";

/**
 * Root page — handles initial routing for first-time setup or display.
 */
export default function RootPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const hasSetPin = useAdminStore((s) => s.hasSetPin);
  const hasHydrated = useAdminStore((s) => s._hasHydrated);
  const isSetupComplete = useMosqueStore((s) => s.config.isSetupComplete);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !hasHydrated) return;
    
    if (!hasSetPin) {
      // User belum buat PIN -> Arahkan ke panel admin untuk buat PIN
      router.replace("/admin");
    } else if (!isSetupComplete) {
      // PIN sudah dibuat tapi info masjid belum diisi
      router.replace("/admin/setup");
    } else {
      // Semua beres, masuk ke layar display
      router.replace("/display");
    }
  }, [mounted, hasHydrated, hasSetPin, isSetupComplete, router]);

  // Loading state yang menyatu dengan warna tema
  return (
    <div className="flex h-screen w-full items-center justify-center bg-[--color-background] text-white/50">
      Memuat aplikasi...
    </div>
  );
}
