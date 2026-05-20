"use client";

import { useState, useCallback, useEffect, useRef, memo } from "react";
import { Lock, Delete } from "lucide-react";

const CORRECT_PIN = "123456"; // TODO: bisa dijadikan setting di DB nanti
const PIN_LENGTH = 6;
const LOCK_TIMEOUT_MS = 5 * 60 * 1000; // 5 menit tidak aktif → lock lagi

/**
 * PIN lock overlay for the admin panel.
 * Blocks all children until the correct 6-digit PIN is entered.
 * Auto-locks after 5 minutes of inactivity.
 */
export const PinLock = memo(function PinLock({
  children,
}: {
  children: React.ReactNode;
}) {
  const [unlocked, setUnlocked] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset inactivity timer on any user interaction
  const resetTimer = useCallback(() => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(() => {
      setUnlocked(false);
      setInput("");
    }, LOCK_TIMEOUT_MS);
  }, []);

  useEffect(() => {
    if (!unlocked) return;
    resetTimer();

    const events = ["mousemove", "keydown", "pointerdown", "touchstart"];
    events.forEach((e) => window.addEventListener(e, resetTimer));

    return () => {
      events.forEach((e) => window.removeEventListener(e, resetTimer));
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, [unlocked, resetTimer]);

  const handleDigit = useCallback(
    (digit: string) => {
      if (input.length >= PIN_LENGTH) return;
      setError(false);

      const next = input + digit;
      setInput(next);

      if (next.length === PIN_LENGTH) {
        if (next === CORRECT_PIN) {
          setUnlocked(true);
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
    [input],
  );

  const handleDelete = useCallback(() => {
    setInput((prev) => prev.slice(0, -1));
    setError(false);
  }, []);

  // Keyboard support
  useEffect(() => {
    if (unlocked) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") handleDigit(e.key);
      if (e.key === "Backspace") handleDelete();
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [unlocked, handleDigit, handleDelete]);

  if (unlocked) return <>{children}</>;

  const DIGITS = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["", "0", "del"],
  ];

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background text-primary-foreground">
      {/* Icon */}
      <div className="mb-6 rounded-full bg-surface p-5">
        <Lock size={40} className="text-secondary" />
      </div>

      {/* Title */}
      <h1
        className="mb-2 font-semibold text-primary-foreground"
        style={{ fontSize: "1.5rem" }}
      >
        Panel Admin
      </h1>
      <p
        className="mb-8 text-primary-foreground opacity-50"
        style={{ fontSize: "1rem" }}
      >
        Masukkan PIN untuk melanjutkan
      </p>

      {/* PIN dots */}
      <div
        className={`mb-8 flex gap-4 transition-transform ${
          shake ? "animate-[shake_0.5s_ease-in-out]" : ""
        }`}
      >
        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
          <div
            key={i}
            className={`h-4 w-4 rounded-full border-2 transition-colors ${
              i < input.length
                ? error
                  ? "border-red-500 bg-red-500"
                  : "border-sectext-secondary bg-sectext-secondary"
                : "border-prtext-primary-foreground border-opacity-30 bg-transparent"
            }`}
          />
        ))}
      </div>

      {/* Error message */}
      <p
        className={`mb-4 text-red-400 transition-opacity ${
          error ? "opacity-100" : "opacity-0"
        }`}
        style={{ fontSize: "0.9rem" }}
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
                className="flex h-16 w-16 items-center justify-center rounded-xl bg-surface text-primary-foreground transition-opacity hover:opacity-70 focus-visible:outline-[3px] active:scale-95"
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
              className="flex h-16 w-16 items-center justify-center rounded-xl bg-surface text-primary-foreground transition-opacity hover:opacity-70 focus-visible:outline-[3px] active:scale-95"
              style={{ fontSize: "1.5rem", fontWeight: 600 }}
            >
              {digit}
            </button>
          );
        })}
      </div>
    </div>
  );
});
