import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AdminState {
  /** PIN disimpan di localStorage — bisa diubah user dari halaman settings */
  pin: string;
  /** Flag session — true selama tab browser tidak ditutup */
  isUnlocked: boolean;
  setPin: (newPin: string) => void;
  unlock: () => void;
  lock: () => void;
}

/**
 * Admin authentication store.
 *
 * Strategy:
 * - `pin`        → localStorage (persist across refresh, changeable)
 * - `isUnlocked` → sessionStorage (persist across navigation, reset on tab close)
 *
 * Zustand hanya persist `pin`. `isUnlocked` dibaca ulang dari sessionStorage
 * saat store diinisialisasi via onRehydrateStorage.
 */
export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      pin: "123456",
      isUnlocked: false,
      setPin: (newPin) => set({ pin: newPin }),
      unlock: () => {
        set({ isUnlocked: true });
        sessionStorage.setItem("adzora-admin-unlocked", "1");
      },
      lock: () => {
        set({ isUnlocked: false });
        sessionStorage.removeItem("adzora-admin-unlocked");
      },
    }),
    {
      name: "adzora-admin",
      // Hanya simpan PIN ke localStorage, bukan isUnlocked
      partialize: (s) => ({ pin: s.pin }),
      // Saat rehydrate, cek sessionStorage untuk restore session
      onRehydrateStorage: () => (s) => {
        if (!s) return;
        const session = sessionStorage.getItem("adzora-admin-unlocked");
        if (session === "1") {
          s.isUnlocked = true;
        }
      },
    },
  ),
);
