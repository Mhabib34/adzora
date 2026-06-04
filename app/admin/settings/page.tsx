"use client";

import { useState, useCallback } from "react";
import {
  Settings,
  Save,
  CheckCircle,
  Loader2,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  RefreshCw,
  Monitor,
  Clock,
  KeyRound,
  Eye,
  EyeOff,
} from "lucide-react";
import { useMosqueStore } from "../../../stores/useMosqueStore";
import { usePrayerStore } from "../../../stores/usePrayerStore";
import { useAdminStore } from "../../../stores/useAdminStore";
import type { DisplayLayout } from "../../../types/mosque";

const LAYOUT_OPTIONS: { key: DisplayLayout; label: string; desc: string }[] = [
  {
    key: "default",
    label: "Default",
    desc: "Jam besar, jadwal sholat, running text, dan slideshow",
  },
  {
    key: "minimalis",
    label: "Minimalis",
    desc: "Hanya jam dan jadwal sholat berikutnya",
  },
  {
    key: "penuh",
    label: "Penuh",
    desc: "Semua elemen, layout diperbesar untuk TV besar",
  },
];

/**
 * Settings page — display feature toggles, slide/ticker speed,
 * layout selector, and data reset options.
 */
export default function SettingsPage() {
  const { display, setDisplay, resetConfig } = useMosqueStore();
  const { resetCalculationConfig } = usePrayerStore();
  const { pin, setPin } = useAdminStore();

  // PIN change state
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [pinError, setPinError] = useState("");
  const [pinSuccess, setPinSuccess] = useState(false);

  const [showSeconds, setShowSeconds] = useState(display.showSeconds);
  const [showHijri, setShowHijri] = useState(display.showHijriCalendar);
  const [showRunningText, setShowRunningText] = useState(
    display.showRunningText,
  );
  const [showSlideshow, setShowSlideshow] = useState(display.showSlideshow);
  const [slideDuration, setSlideDuration] = useState(display.slideDuration);
  const [tickerSpeed, setTickerSpeed] = useState(display.tickerSpeed);
  const [layout, setLayout] = useState<DisplayLayout>(display.layout);

  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle",
  );
  const [resetConfirm, setResetConfirm] = useState<"none" | "prayer" | "all">(
    "none",
  );

  /** Validate and save new PIN */
  const handleChangePin = useCallback(() => {
    setPinError("");
    setPinSuccess(false);
    if (currentPin !== pin) {
      setPinError("PIN saat ini salah.");
      return;
    }
    if (newPin.length !== 6 || !/^\d{6}$/.test(newPin)) {
      setPinError("PIN baru harus 6 digit angka.");
      return;
    }
    if (newPin !== confirmPin) {
      setPinError("Konfirmasi PIN tidak cocok.");
      return;
    }
    setPin(newPin);
    setCurrentPin("");
    setNewPin("");
    setConfirmPin("");
    setPinSuccess(true);
    setTimeout(() => setPinSuccess(false), 3000);
  }, [currentPin, newPin, confirmPin, pin, setPin]);

  /** Persist all display settings */
  const handleSave = useCallback(async () => {
    setSaveStatus("saving");
    setDisplay({
      showSeconds,
      showHijriCalendar: showHijri,
      showRunningText,
      showSlideshow,
      slideDuration,
      tickerSpeed,
      layout,
    });
    await new Promise((r) => setTimeout(r, 600));
    setSaveStatus("saved");
    await new Promise((r) => setTimeout(r, 1200));
    setSaveStatus("idle");
  }, [
    showSeconds,
    showHijri,
    showRunningText,
    showSlideshow,
    slideDuration,
    tickerSpeed,
    layout,
    setDisplay,
  ]);

  /** Reset prayer config only */
  const handleResetPrayer = useCallback(() => {
    resetCalculationConfig();
    setResetConfirm("none");
  }, [resetCalculationConfig]);

  /** Reset all mosque config */
  const handleResetAll = useCallback(() => {
    resetConfig();
    resetCalculationConfig();
    setResetConfirm("none");
    // Reset local state to defaults
    setShowSeconds(true);
    setShowHijri(true);
    setShowRunningText(true);
    setShowSlideshow(true);
    setSlideDuration(10);
    setTickerSpeed(30);
    setLayout("default");
  }, [resetConfig, resetCalculationConfig]);

  return (
    <div className="min-h-screen bg-[--color-background] text-white p-6">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-[--color-primary]">
            Pengaturan
          </h1>
          <p className="text-sm text-white/50 mt-1">
            Konfigurasi tampilan layar dan opsi data.
          </p>
        </div>

        {/* Display Toggles */}
        <Section icon={<Monitor className="w-4 h-4" />} title="Tampilan">
          <ToggleRow
            label="Tampilkan Detik"
            desc="Jam digital menampilkan angka detik"
            value={showSeconds}
            onChange={setShowSeconds}
          />
          <ToggleRow
            label="Kalender Hijriah"
            desc="Tampilkan tanggal Hijriah di layar"
            value={showHijri}
            onChange={setShowHijri}
          />
          <ToggleRow
            label="Running Text"
            desc="Teks berjalan di bagian bawah layar"
            value={showRunningText}
            onChange={setShowRunningText}
          />
          <ToggleRow
            label="Slideshow Foto"
            desc="Tampilkan slideshow gambar masjid"
            value={showSlideshow}
            onChange={setShowSlideshow}
          />
        </Section>

        {/* Speed Controls */}
        <Section icon={<Clock className="w-4 h-4" />} title="Kecepatan">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wide">
                  Durasi Slide
                </label>
                <span className="text-xs font-mono text-white/50">
                  {slideDuration} detik
                </span>
              </div>
              <input
                type="range"
                min={5}
                max={60}
                step={5}
                value={slideDuration}
                onChange={(e) => setSlideDuration(parseInt(e.target.value, 10))}
                className="w-full accent-[--color-primary]"
              />
              <div className="flex justify-between text-[10px] text-white/25">
                <span>5 dtk</span>
                <span>60 dtk</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wide">
                  Kecepatan Ticker
                </label>
                <span className="text-xs font-mono text-white/50">
                  {tickerSpeed} px/s
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={100}
                step={5}
                value={tickerSpeed}
                onChange={(e) => setTickerSpeed(parseInt(e.target.value, 10))}
                className="w-full accent-[--color-primary]"
              />
              <div className="flex justify-between text-[10px] text-white/25">
                <span>Lambat</span>
                <span>Cepat</span>
              </div>
            </div>
          </div>
        </Section>

        {/* Layout */}
        <Section icon={<Settings className="w-4 h-4" />} title="Layout Display">
          <div className="space-y-2">
            {LAYOUT_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setLayout(opt.key)}
                className={`w-full text-left rounded-xl px-4 py-3 border transition-colors ${
                  layout === opt.key
                    ? "border-[--color-primary]/60 bg-[--color-primary]/20"
                    : "border-white/8 bg-white/3 hover:border-white/15"
                }`}
              >
                <p
                  className={`text-sm font-semibold ${layout === opt.key ? "text-[--color-secondary]" : "text-white"}`}
                >
                  {opt.label}
                </p>
                <p className="text-xs text-white/40 mt-0.5">{opt.desc}</p>
              </button>
            ))}
          </div>
        </Section>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saveStatus === "saving" || saveStatus === "saved"}
          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[--color-primary] hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-opacity py-4 text-base font-bold text-white"
        >
          {saveStatus === "saving" && (
            <Loader2 className="w-5 h-5 animate-spin" />
          )}
          {saveStatus === "saved" && <CheckCircle className="w-5 h-5" />}
          {saveStatus === "idle" && <Save className="w-5 h-5" />}
          {saveStatus === "saving"
            ? "Menyimpan..."
            : saveStatus === "saved"
              ? "Tersimpan!"
              : "Simpan Pengaturan"}
        </button>

        {/* PIN Change */}
        <div className="bg-[--color-surface] rounded-2xl p-5 border border-white/5 space-y-4">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-[--color-secondary]" />
            <h2 className="text-sm font-bold text-white/70 uppercase tracking-wider">
              Ganti PIN Admin
            </h2>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-white/50 uppercase tracking-wide">
                PIN Saat Ini
              </label>
              <div className="relative">
                <input
                  type={showPin ? "text" : "password"}
                  inputMode="numeric"
                  maxLength={6}
                  value={currentPin}
                  onChange={(e) =>
                    setCurrentPin(e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="••••••"
                  className="w-full rounded-xl px-4 py-3 pr-10 text-sm bg-white/5 border border-white/10 text-white placeholder-white/20 focus:border-[--color-primary]/60 outline-none transition-colors font-mono tracking-widest"
                />
                <button
                  type="button"
                  onClick={() => setShowPin((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                >
                  {showPin ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-white/50 uppercase tracking-wide">
                PIN Baru (6 digit)
              </label>
              <input
                type={showPin ? "text" : "password"}
                inputMode="numeric"
                maxLength={6}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
                placeholder="••••••"
                className="w-full rounded-xl px-4 py-3 text-sm bg-white/5 border border-white/10 text-white placeholder-white/20 focus:border-[--color-primary]/60 outline-none transition-colors font-mono tracking-widest"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-white/50 uppercase tracking-wide">
                Konfirmasi PIN Baru
              </label>
              <input
                type={showPin ? "text" : "password"}
                inputMode="numeric"
                maxLength={6}
                value={confirmPin}
                onChange={(e) =>
                  setConfirmPin(e.target.value.replace(/\D/g, ""))
                }
                placeholder="••••••"
                className="w-full rounded-xl px-4 py-3 text-sm bg-white/5 border border-white/10 text-white placeholder-white/20 focus:border-[--color-primary]/60 outline-none transition-colors font-mono tracking-widest"
              />
            </div>

            {pinError && <p className="text-xs text-red-400">{pinError}</p>}
            {pinSuccess && (
              <p className="text-xs text-emerald-400">PIN berhasil diubah!</p>
            )}

            <button
              onClick={handleChangePin}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[--color-primary]/20 hover:bg-[--color-primary]/30 border border-[--color-primary]/30 transition-colors py-3 text-sm font-semibold text-[--color-secondary]"
            >
              <KeyRound className="w-4 h-4" />
              Simpan PIN Baru
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-[--color-surface] rounded-2xl p-5 border border-red-500/15 space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <h2 className="text-sm font-bold text-red-400/80 uppercase tracking-wider">
              Zona Berbahaya
            </h2>
          </div>

          {/* Reset prayer */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-white/70">
                Reset Konfigurasi Sholat
              </p>
              <p className="text-xs text-white/35 mt-0.5">
                Kembalikan metode kalkulasi, offset, dan iqomah ke default.
              </p>
            </div>
            {resetConfirm === "prayer" ? (
              <div className="flex gap-1.5 shrink-0">
                <button
                  onClick={handleResetPrayer}
                  className="text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg px-3 py-1.5 font-semibold transition-colors"
                >
                  Ya
                </button>
                <button
                  onClick={() => setResetConfirm("none")}
                  className="text-xs bg-white/5 text-white/40 rounded-lg px-3 py-1.5 transition-colors"
                >
                  Batal
                </button>
              </div>
            ) : (
              <button
                onClick={() => setResetConfirm("prayer")}
                className="flex items-center gap-1.5 text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg px-3 py-1.5 font-semibold transition-colors shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset
              </button>
            )}
          </div>

          <div className="border-t border-white/5" />

          {/* Reset all */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-white/70">
                Reset Semua Data
              </p>
              <p className="text-xs text-white/35 mt-0.5">
                Hapus semua konfigurasi masjid dan kembali ke awal.
              </p>
            </div>
            {resetConfirm === "all" ? (
              <div className="flex gap-1.5 shrink-0">
                <button
                  onClick={handleResetAll}
                  className="text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg px-3 py-1.5 font-semibold transition-colors"
                >
                  Ya, Hapus
                </button>
                <button
                  onClick={() => setResetConfirm("none")}
                  className="text-xs bg-white/5 text-white/40 rounded-lg px-3 py-1.5 transition-colors"
                >
                  Batal
                </button>
              </div>
            ) : (
              <button
                onClick={() => setResetConfirm("all")}
                className="flex items-center gap-1.5 text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg px-3 py-1.5 font-semibold transition-colors shrink-0"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Reset
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-white/20 pb-4">
          Adzora v1.0 — Semua data tersimpan lokal di perangkat ini.
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[--color-surface] rounded-2xl p-5 border border-white/5 space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-[--color-secondary]">{icon}</span>
        <h2 className="text-sm font-bold text-white/70 uppercase tracking-wider">
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}

interface ToggleRowProps {
  label: string;
  desc: string;
  value: boolean;
  onChange: (v: boolean) => void;
}

/** Row with label, description, and toggle button */
function ToggleRow({ label, desc, value, onChange }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 py-1">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white/80">{label}</p>
        <p className="text-xs text-white/35 mt-0.5">{desc}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`flex items-center gap-1.5 text-xs rounded-xl px-3 py-2 font-semibold transition-colors shrink-0 ${
          value
            ? "bg-emerald-500/15 text-emerald-400"
            : "bg-white/5 text-white/35"
        }`}
      >
        {value ? (
          <ToggleRight className="w-5 h-5" />
        ) : (
          <ToggleLeft className="w-5 h-5" />
        )}
        {value ? "Aktif" : "Nonaktif"}
      </button>
    </div>
  );
}
