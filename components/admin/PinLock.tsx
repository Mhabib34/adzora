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
  const { pin, isUnlocked, hasSetPin, setPin, setHasSetPin, unlock, lock, _hasHydrated } = useAdminStore();
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const [setupStep, setSetupStep] = useState<"enter" | "confirm">("enter");
  const [tempPin, setTempPin] = useState("");
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
        if (!hasSetPin) {
          // Setup flow
          if (setupStep === "enter") {
            setTempPin(next);
            setSetupStep("confirm");
            setInput("");
          } else {
            if (next === tempPin) {
              setPin(next);
              setHasSetPin(true);
              unlock();
              setInput("");
            } else {
              setError(true);
              setShake(true);
              setTimeout(() => {
                setSetupStep("enter");
                setTempPin("");
                setInput("");
                setError(false);
                setShake(false);
              }, 600);
            }
          }
        } else {
          // Normal login flow
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
      }
    },
    [input, pin, unlock, hasSetPin, setupStep, tempPin, setPin, setHasSetPin],
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

  /** Render loading if not hydrated yet */
  if (!_hasHydrated) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[--color-background]">
        <div className="text-white/30 animate-pulse text-sm">Memuat sesi...</div>
      </div>
    );
  }

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
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-[--color-background] text-white overflow-hidden">
      {/* Ambient background glow circles */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none opacity-20 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, var(--color-secondary) 0%, var(--color-primary) 50%, transparent 70%)",
        }}
      />

      {/* Main Glassmorphic Card */}
      <div className="z-10 flex flex-col items-center px-10 py-12 rounded-3xl border border-[--color-secondary]/20 bg-[--color-surface]/60 backdrop-blur-2xl shadow-2xl max-w-md w-full mx-4">
        {/* Icon */}
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-linear-to-br from-[--color-secondary]/20 to-[--color-primary]/20 border border-[--color-secondary]/30 shadow-lg shadow-[--color-secondary]/10">
          <Lock size={36} className="text-[--color-secondary] drop-shadow-sm" />
        </div>

        {/* Title */}
        <h1 className="mb-2 text-2xl font-bold font-display tracking-wide text-white text-center">
          {!hasSetPin
            ? setupStep === "enter"
              ? "Buat PIN Baru"
              : "Konfirmasi PIN"
            : "Panel Admin Adzora"}
        </h1>
        <p className="mb-8 text-xs font-sans text-white/60 text-center max-w-xs leading-relaxed">
          {!hasSetPin
            ? setupStep === "enter"
              ? "Masukkan 6 digit PIN untuk melindungi akses panel admin"
              : "Masukkan kembali PIN yang baru saja Anda buat"
            : "Masukkan 6 digit PIN keamanan untuk mengelola sistem"}
        </p>

        {/* PIN dots */}
        <div
          className={`mb-6 flex gap-4 ${shake ? "animate-[shake_0.5s_ease-in-out]" : ""}`}
        >
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <div
              key={i}
              className={`h-4 w-4 rounded-full border-2 transition-all duration-200 ${
                i < input.length
                  ? error
                    ? "border-red-500 bg-red-500 shadow-md shadow-red-500/50 scale-110"
                    : "border-[--color-secondary] bg-[--color-secondary] shadow-md shadow-[--color-secondary]/50 scale-110"
                  : "border-white/20 bg-white/5"
              }`}
            />
          ))}
        </div>

        {/* Error message */}
        <div className="h-6 mb-2">
          <p
            className={`text-xs font-semibold text-red-400 transition-opacity ${error ? "opacity-100" : "opacity-0"}`}
          >
            {!hasSetPin ? "PIN tidak cocok. Ulangi kembali." : "PIN salah. Silakan coba lagi."}
          </p>
        </div>

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-3.5 w-full max-w-[260px]">
          {DIGITS.flat().map((digit, i) => {
            if (digit === "") return <div key={i} />;
            if (digit === "del") {
              return (
                <button
                  key={i}
                  onClick={handleDelete}
                  className="flex h-16 w-full items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white/70 transition-all hover:bg-white/10 hover:text-white hover:border-white/20 focus:outline-none active:scale-95 shadow-sm"
                  aria-label="Hapus digit terakhir"
                >
                  <Delete size={22} />
                </button>
              );
            }
            return (
              <button
                key={i}
                onClick={() => handleDigit(digit)}
                className="flex h-16 w-full items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-xl font-bold font-mono text-white transition-all hover:bg-[--color-primary]/30 hover:border-[--color-secondary]/40 hover:text-[--color-secondary] focus:outline-none active:scale-95 shadow-sm"
              >
                {digit}
              </button>
            );
          })}
        </div>

        <p className="mt-8 text-[11px] font-sans text-white/30 text-center">
          Sesi otomatis terkunci setelah 30 menit tidak ada aktivitas
        </p>
      </div>
    </div>
  );
});
