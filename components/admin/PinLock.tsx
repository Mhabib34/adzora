"use client";

import { useState, useCallback, useEffect, useRef, memo } from "react";
import { Lock, Delete, LogOut } from "lucide-react";
import { useAdminStore } from "../../stores/useAdminStore";

const PIN_LENGTH = 6;
const LOCK_TIMEOUT_MS = 30 * 60 * 1000; // 30 menit tidak aktif → lock

/**
 * PIN lock overlay for the admin panel.
 *
 * - PIN disimpan di localStorage via useAdminStore (bisa diubah dari settings)
 * - Session (isUnlocked) disimpan di sessionStorage — persist selama navigasi,
 *   tapi reset saat tab/browser ditutup
 * - Auto-lock setelah 30 menit tidak ada interaksi
 */
export const PinLock = memo(function PinLock({
  children,
}: {
  children: React.ReactNode;
}) {
  const { pin, isUnlocked, unlock, lock } = useAdminStore();
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Reset inactivity timer on any user interaction */
  const resetTimer = useCallback(() => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(() => {
      lock();
    }, LOCK_TIMEOUT_MS);
  }, [lock]);

  useEffect(() => {
    if (!isUnlocked) return;
    resetTimer();
    const events = ["mousemove", "keydown", "pointerdown", "touchstart"];
    events.forEach((e) => window.addEventListener(e, resetTimer));
    return () => {
      events.forEach((e) => window.removeEventListener(e, resetTimer));
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, [isUnlocked, resetTimer]);

  const handleDigit = useCallback(
    (digit: string) => {
      if (input.length >= PIN_LENGTH) return;
      setError(false);
      const next = input + digit;
      setInput(next);
      if (next.length === PIN_LENGTH) {
        if (next === pin) {
          unlock();
          setInput("");
        } else {
          setError(true);
          setShake(true);
          setTimeout(() => {
            setInput("");
            setError(false);
            setShake(false);
          }, 600);
        }
      }
    },
    [input, pin, unlock],
  );

  const handleDelete = useCallback(() => {
    setInput((prev) => prev.slice(0, -1));
    setError(false);
  }, []);

  /** Keyboard support */
  useEffect(() => {
    if (isUnlocked) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") handleDigit(e.key);
      if (e.key === "Backspace") handleDelete();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isUnlocked, handleDigit, handleDelete]);

  /** Render children + tombol lock jika sudah unlock */
  if (isUnlocked) {
    return (
      <>
        {children}
        {/* Tombol lock manual — muncul sebagai floating button */}
        <button
          onClick={lock}
          title="Kunci panel admin"
          className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs text-white/30 hover:text-white/60 hover:bg-white/10 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Kunci
        </button>
      </>
    );
  }

  const DIGITS = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["", "0", "del"],
  ];

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-[--color-background] text-white">
      {/* Icon */}
      <div className="mb-6 rounded-full bg-[--color-surface] p-5">
        <Lock size={40} className="text-[--color-secondary]" />
      </div>

      {/* Title */}
      <h1 className="mb-2 text-2xl font-semibold">Panel Admin</h1>
      <p className="mb-8 text-sm text-white/50">
        Masukkan PIN untuk melanjutkan
      </p>

      {/* PIN dots */}
      <div
        className={`mb-8 flex gap-4 ${shake ? "animate-[shake_0.5s_ease-in-out]" : ""}`}
      >
        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
          <div
            key={i}
            className={`h-4 w-4 rounded-full border-2 transition-colors ${
              i < input.length
                ? error
                  ? "border-red-500 bg-red-500"
                  : "border-[--color-secondary] bg-[--color-secondary]"
                : "border-white/20 bg-transparent"
            }`}
          />
        ))}
      </div>

      {/* Error */}
      <p
        className={`mb-4 text-sm text-red-400 transition-opacity ${error ? "opacity-100" : "opacity-0"}`}
      >
        PIN salah. Coba lagi.
      </p>

      {/* Numpad */}
      <div className="grid grid-cols-3 gap-3">
        {DIGITS.flat().map((digit, i) => {
          if (digit === "") return <div key={i} />;
          if (digit === "del") {
            return (
              <button
                key={i}
                onClick={handleDelete}
                className="flex h-16 w-16 items-center justify-center rounded-xl bg-[--color-surface] text-white transition-opacity hover:opacity-70 focus-visible:outline active:scale-95"
                aria-label="Hapus digit terakhir"
              >
                <Delete size={24} />
              </button>
            );
          }
          return (
            <button
              key={i}
              onClick={() => handleDigit(digit)}
              className="flex h-16 w-16 items-center justify-center rounded-xl bg-[--color-surface] text-xl font-semibold text-white transition-opacity hover:opacity-70 focus-visible:outline active:scale-95"
            >
              {digit}
            </button>
          );
        })}
      </div>

      <p className="mt-8 text-xs text-white/20">
        Session terkunci otomatis setelah 30 menit tidak aktif
      </p>
    </div>
  );
});
