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
    <div className="space-y-8">
      {/* Top Header */}
      <div className="border-b border-white/5 pb-6">
        <h1 className="text-3xl font-bold font-display text-white tracking-wide">
          Pengaturan Sistem & Fitur
        </h1>
        <p className="text-sm font-sans text-white/60 mt-1">
          Atur elemen tampilan layar, kecepatan animasi, ganti PIN admin, dan opsi reset data
        </p>
      </div>

      {/* Display Toggles */}
      <Section icon={<Monitor className="w-5 h-5" />} title="Fitur Elemen Tampilan Display">
        <div className="space-y-2 divide-y divide-white/5">
          <ToggleRow
            label="Tampilkan Angka Detik"
            desc="Jam digital utama menampilkan detik di layar"
            value={showSeconds}
            onChange={setShowSeconds}
          />
          <ToggleRow
            label="Kalender Penanggalan Hijriah"
            desc="Tampilkan tanggal Hijriah di samping tanggal Masehi"
            value={showHijri}
            onChange={setShowHijri}
          />
          <ToggleRow
            label="Running Text Pengumuman"
            desc="Tampilkan pita teks berjalan di bagian bawah layar"
            value={showRunningText}
            onChange={setShowRunningText}
          />
          <ToggleRow
            label="Slideshow Foto Galeri"
            desc="Tampilkan animasi galeri foto masjid secara periodik"
            value={showSlideshow}
            onChange={setShowSlideshow}
          />
        </div>
      </Section>

      {/* Speed Controls */}
      <Section icon={<Clock className="w-5 h-5" />} title="Kecepatan Animasi & Slide">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
          <div className="space-y-3 bg-white/5 p-4 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold tracking-widest uppercase text-white/70">
                Durasi Berganti Slide Foto
              </label>
              <span className="text-xs font-mono font-bold text-[--color-secondary] bg-[--color-secondary]/10 border border-[--color-secondary]/20 px-3 py-1 rounded-full">
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
              className="w-full accent-[--color-secondary] h-2 bg-white/10 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] font-mono text-white/40">
              <span>5 Detik</span>
              <span>60 Detik</span>
            </div>
          </div>

          <div className="space-y-3 bg-white/5 p-4 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold tracking-widest uppercase text-white/70">
                Kecepatan Running Text
              </label>
              <span className="text-xs font-mono font-bold text-[--color-secondary] bg-[--color-secondary]/10 border border-[--color-secondary]/20 px-3 py-1 rounded-full">
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
              className="w-full accent-[--color-secondary] h-2 bg-white/10 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] font-mono text-white/40">
              <span>Perlahan</span>
              <span>Sangat Cepat</span>
            </div>
          </div>
        </div>
      </Section>

      {/* Layout */}
      <Section icon={<Settings className="w-5 h-5" />} title="Pilihan Tata Letak Layout">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          {LAYOUT_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setLayout(opt.key)}
              className={`text-left rounded-2xl p-4 border transition-all duration-300 ${
                layout === opt.key
                  ? "border-[--color-secondary]/60 bg-[--color-primary]/30 text-white shadow-xl shadow-[--color-primary]/10"
                  : "border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20 text-white/60"
              }`}
            >
              <p
                className={`text-sm font-bold font-display ${
                  layout === opt.key ? "text-[--color-secondary]" : "text-white"
                }`}
              >
                {opt.label}
              </p>
              <p className="text-xs font-sans text-white/40 mt-1">{opt.desc}</p>
            </button>
          ))}
        </div>
      </Section>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={saveStatus === "saving" || saveStatus === "saved"}
        className="w-full flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[--color-primary] to-[--color-primary]/80 hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-all py-4 text-base font-bold font-display text-white shadow-2xl border border-[--color-secondary]/40"
      >
        {saveStatus === "saving" && (
          <Loader2 className="w-5 h-5 animate-spin" />
        )}
        {saveStatus === "saved" && <CheckCircle className="w-5 h-5 text-emerald-400" />}
        {saveStatus === "idle" && <Save className="w-5 h-5" />}
        {saveStatus === "saving"
          ? "Menyimpan Pengaturan..."
          : saveStatus === "saved"
            ? "Berhasil Tersimpan!"
            : "Simpan Semua Pengaturan Tampilan"}
      </button>

      {/* PIN Change */}
      <div className="bg-[--color-surface]/60 backdrop-blur-2xl rounded-3xl p-6 border border-[--color-secondary]/20 shadow-xl space-y-5">
        <div className="flex items-center gap-3 border-b border-white/5 pb-3">
          <div className="w-9 h-9 rounded-xl bg-[--color-secondary]/20 border border-[--color-secondary]/30 flex items-center justify-center text-[--color-secondary]">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold font-display text-white">
              Ganti PIN Keamanan Admin
            </h2>
            <p className="text-xs text-white/50">
              PIN 6 digit digunakan untuk mengunci akses panel konfigurasi admin
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold tracking-widest uppercase text-white/60">
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
                className="w-full rounded-2xl px-4 py-3.5 pr-10 text-sm bg-white/5 border border-white/10 text-white placeholder-white/20 focus:border-[--color-secondary]/60 outline-none transition-all font-mono tracking-widest text-center"
              />
              <button
                type="button"
                onClick={() => setShowPin((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70"
              >
                {showPin ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold tracking-widest uppercase text-white/60">
              PIN Baru (6 Digit)
            </label>
            <input
              type={showPin ? "text" : "password"}
              inputMode="numeric"
              maxLength={6}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
              placeholder="••••••"
              className="w-full rounded-2xl px-4 py-3.5 text-sm bg-white/5 border border-white/10 text-white placeholder-white/20 focus:border-[--color-secondary]/60 outline-none transition-all font-mono tracking-widest text-center"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold tracking-widest uppercase text-white/60">
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
              className="w-full rounded-2xl px-4 py-3.5 text-sm bg-white/5 border border-white/10 text-white placeholder-white/20 focus:border-[--color-secondary]/60 outline-none transition-all font-mono tracking-widest text-center"
            />
          </div>
        </div>

        {pinError && <p className="text-xs font-semibold text-red-400">{pinError}</p>}
        {pinSuccess && (
          <p className="text-xs font-semibold text-emerald-400">PIN Keamanan Berhasil Diperbarui!</p>
        )}

        <button
          onClick={handleChangePin}
          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all py-3.5 text-sm font-bold font-display text-[--color-secondary]"
        >
          <KeyRound className="w-4 h-4" />
          Simpan Perubahan PIN Baru
        </button>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-500/5 backdrop-blur-2xl rounded-3xl p-6 border border-red-500/20 shadow-xl space-y-4">
        <div className="flex items-center gap-3 border-b border-red-500/20 pb-3">
          <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold font-display text-red-400">
              Zona Bahaya & Reset Data
            </h2>
            <p className="text-xs text-red-400/60">
              Tindakan ini tidak dapat dibatalkan kembali
            </p>
          </div>
        </div>

        {/* Reset prayer */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-2xl bg-white/5 border border-white/5">
          <div>
            <p className="text-sm font-bold font-display text-white">
              Reset Konfigurasi Jadwal Sholat
            </p>
            <p className="text-xs text-white/50 mt-0.5">
              Mengembalikan metode hitung, offset menit, dan durasi iqomah ke nilai awal pabrik
            </p>
          </div>
          {resetConfirm === "prayer" ? (
            <div className="flex gap-2 shrink-0">
              <button
                onClick={handleResetPrayer}
                className="text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40 rounded-xl px-4 py-2 font-semibold transition-all"
              >
                Ya, Reset
              </button>
              <button
                onClick={() => setResetConfirm("none")}
                className="text-xs bg-white/5 text-white/50 border border-white/10 rounded-xl px-4 py-2 transition-all"
              >
                Batal
              </button>
            </div>
          ) : (
            <button
              onClick={() => setResetConfirm("prayer")}
              className="flex items-center gap-2 text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl px-4 py-2 font-semibold transition-all shrink-0"
            >
              <RefreshCw className="w-4 h-4" />
              Reset Jadwal
            </button>
          )}
        </div>

        {/* Reset all */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-2xl bg-white/5 border border-white/5">
          <div>
            <p className="text-sm font-bold font-display text-white">
              Reset Seluruh Sistem & Data Masjid
            </p>
            <p className="text-xs text-white/50 mt-0.5">
              Menghapus semua profil masjid, koordinat, running text, media, dan pengaturan tampilan
            </p>
          </div>
          {resetConfirm === "all" ? (
            <div className="flex gap-2 shrink-0">
              <button
                onClick={handleResetAll}
                className="text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40 rounded-xl px-4 py-2 font-semibold transition-all"
              >
                Ya, Hapus Semua
              </button>
              <button
                onClick={() => setResetConfirm("none")}
                className="text-xs bg-white/5 text-white/50 border border-white/10 rounded-xl px-4 py-2 transition-all"
              >
                Batal
              </button>
            </div>
          ) : (
            <button
              onClick={() => setResetConfirm("all")}
              className="flex items-center gap-2 text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl px-4 py-2 font-semibold transition-all shrink-0"
            >
              <AlertTriangle className="w-4 h-4" />
              Reset Total
            </button>
          )}
        </div>
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
    <div className="bg-[--color-surface]/60 backdrop-blur-2xl rounded-3xl p-6 border border-[--color-secondary]/20 shadow-xl space-y-4">
      <div className="flex items-center gap-3 border-b border-white/5 pb-3">
        <div className="w-9 h-9 rounded-xl bg-[--color-secondary]/20 border border-[--color-secondary]/30 flex items-center justify-center text-[--color-secondary]">
          {icon}
        </div>
        <h2 className="text-base font-bold font-display text-white">
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
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold font-display text-white">{label}</p>
        <p className="text-xs font-sans text-white/50 mt-0.5">{desc}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`flex items-center gap-2 text-xs rounded-full px-4 py-2 font-semibold transition-all border shrink-0 ${
          value
            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-md shadow-emerald-500/10"
            : "bg-white/5 text-white/40 border-white/10"
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
