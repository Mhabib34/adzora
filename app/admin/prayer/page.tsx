"use client";

import { useState, useCallback } from "react";
import {
  Clock,
  Save,
  CheckCircle,
  Loader2,
  RotateCcw,
  Info,
} from "lucide-react";
import { usePrayerStore } from "../../../stores/usePrayerStore";
import { useMosqueStore } from "../../../stores/useMosqueStore";
import { clearPrayerSchedules } from "../../../db/MasjidDB";
import type {
  PrayerKey,
  CalculationMethodKey,
  AsrMethodKey,
} from "../../../types/prayer";
import { PRAYER_KEY_TO_NAME, PRAYER_KEYS } from "../../../types/prayer";

const CALCULATION_METHODS: {
  key: CalculationMethodKey;
  label: string;
  desc: string;
}[] = [
    {
      key: "MoonsightingCommittee",
      label: "Moonsighting Committee",
      desc: "Umum dipakai di Indonesia",
    },
    {
      key: "Kemenag",
      label: "Kemenag Indonesia",
      desc: "Kementerian Agama RI (Fajr 20°)",
    },
    {
      key: "MuslimWorldLeague",
      label: "Muslim World League",
      desc: "Standar internasional MWL",
    },
    {
      key: "ISNA",
      label: "ISNA (Amerika Utara)",
      desc: "Islamic Society of North America",
    },
  ];

const IQOMAH_KEYS: Exclude<PrayerKey, "imsak" | "sunrise">[] = [
  "fajr",
  "dhuhr",
  "asr",
  "maghrib",
  "isha",
];

/**
 * Prayer configuration page — calculation method, asr madhab,
 * per-prayer time offsets, and iqomah durations.
 */
export default function PrayerPage() {
  const {
    calculationConfig,
    iqomahConfig,
    setCalculationConfig,
    setOffset,
    setIqomahDuration,
    resetCalculationConfig,
  } = usePrayerStore();

  const { config, setConfig } = useMosqueStore();

  const [method, setMethod] = useState<CalculationMethodKey>(
    calculationConfig.method,
  );
  const [asrMethod, setAsrMethod] = useState<AsrMethodKey>(
    calculationConfig.asrMethod,
  );
  const [offsets, setOffsets] = useState<Record<PrayerKey, number>>(
    calculationConfig.offsets
  );
  const [iqomah, setIqomah] = useState<
    Record<Exclude<PrayerKey, "imsak" | "sunrise">, number>
  >(iqomahConfig.durations);
  const [imsakMinutes, setImsakMinutes] = useState(
    calculationConfig.imsakMinutesBeforeFajr ?? 10,
  );
  const [hijriOffset, setHijriOffset] = useState(config.hijriOffset ?? 0);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle",
  );
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  /** Update local offset state */
  const handleOffsetChange = useCallback((key: PrayerKey, val: string) => {
    const n = parseInt(val, 10);
    const clamped = isNaN(n) ? 0 : Math.max(-60, Math.min(60, n));
    setOffsets((prev) => ({ ...prev, [key]: clamped }));
  }, []);

  /** Update local iqomah state */
  const handleIqomahChange = useCallback(
    (key: Exclude<PrayerKey, "imsak" | "sunrise">, val: string) => {
      const n = parseInt(val, 10);
      const clamped = isNaN(n) ? 5 : Math.max(1, Math.min(60, n));
      setIqomah((prev) => ({ ...prev, [key]: clamped }));
    },
    [],
  );

  /** Persist all changes to store */
  const handleSave = useCallback(async () => {
    setSaveStatus("saving");
    setCalculationConfig({
      method,
      asrMethod,
      offsets,
      imsakMinutesBeforeFajr: imsakMinutes,
    });
    setConfig({ hijriOffset });
    PRAYER_KEYS.forEach((k) => setOffset(k, offsets[k]));
    IQOMAH_KEYS.forEach((k) => setIqomahDuration(k, iqomah[k]));

    // Clear DB cache so the engine recalculates the new offsets immediately
    await clearPrayerSchedules();

    await new Promise((r) => setTimeout(r, 600));
    setSaveStatus("saved");
    await new Promise((r) => setTimeout(r, 1200));
    setSaveStatus("idle");
  }, [
    method,
    asrMethod,
    offsets,
    iqomah,
    imsakMinutes,
    hijriOffset,
    setCalculationConfig,
    setConfig,
    setOffset,
    setIqomahDuration,
  ]);

  /** Reset to defaults */
  const handleReset = useCallback(() => {
    resetCalculationConfig();
    setMethod("MoonsightingCommittee");
    setAsrMethod("Shafi");
    setOffsets({
      fajr: 0,
      sunrise: 0,
      imsak: 0,
      dhuhr: 0,
      asr: 0,
      maghrib: 0,
      isha: 0,
    });
    setImsakMinutes(10);
    setIqomah({ fajr: 10, dhuhr: 10, asr: 10, maghrib: 5, isha: 10 });
    setShowResetConfirm(false);
  }, [resetCalculationConfig]);

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-bold font-display text-white tracking-wide">
            Jadwal Sholat & Iqomah
          </h1>
          <p className="text-sm font-sans text-white/60 mt-1">
            Konfigurasi metode kalkulasi, koreksi waktu sholat, dan pewaktu iqomah
          </p>
        </div>
        <button
          onClick={() => setShowResetConfirm(true)}
          className="flex items-center gap-2 text-xs font-semibold text-white/50 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl px-4 py-2.5 transition-all shrink-0"
        >
          <RotateCcw className="w-4 h-4" />
          Reset Default
        </button>
      </div>

      {/* Reset Confirm */}
      {showResetConfirm && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-3xl p-5 flex items-start gap-4 shadow-xl">
          <Info className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-base font-bold font-display text-red-400">
              Reset ke Konfigurasi Awal?
            </p>
            <p className="text-xs font-sans text-red-400/80 mt-1">
              Semua pengaturan offset menit, durasi iqomah, dan koreksi Hijriah akan dikembalikan ke setelan pabrik.
            </p>
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleReset}
                className="text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40 rounded-xl px-4 py-2 font-semibold transition-all"
              >
                Ya, Reset Sekarang
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="text-xs bg-white/5 hover:bg-white/10 text-white/60 border border-white/10 rounded-xl px-4 py-2 transition-all"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Calculation Method */}
      <Section icon={<Clock className="w-5 h-5" />} title="Metode Kalkulasi Waktu Sholat">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {CALCULATION_METHODS.map((m) => (
            <button
              key={m.key}
              onClick={() => setMethod(m.key)}
              className={`w-full text-left rounded-2xl p-4 border transition-all duration-300 ${
                method === m.key
                  ? "border-[--color-secondary]/60 bg-[--color-primary]/30 text-white shadow-lg shadow-[--color-primary]/10"
                  : "border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20 text-white/60"
              }`}
            >
              <p
                className={`text-sm font-bold font-display ${
                  method === m.key ? "text-[--color-secondary]" : "text-white"
                }`}
              >
                {m.label}
              </p>
              <p className="text-xs font-sans text-white/40 mt-1">{m.desc}</p>
            </button>
          ))}
        </div>
      </Section>

      {/* Asr Method */}
      <Section icon={<Clock className="w-5 h-5" />} title="Metode Kalkulasi Ashar (Madzhab)">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {(["Shafi", "Hanafi"] as AsrMethodKey[]).map((k) => (
            <button
              key={k}
              onClick={() => setAsrMethod(k)}
              className={`rounded-2xl p-4 border text-sm font-bold font-display transition-all ${
                asrMethod === k
                  ? "border-[--color-secondary]/60 bg-[--color-primary]/30 text-[--color-secondary] shadow-lg"
                  : "border-white/5 bg-white/5 text-white/60 hover:bg-white/10 hover:border-white/20"
              }`}
            >
              {k === "Shafi" ? "Syafi'i / Maliki / Hanbali" : "Hanafi"}
            </button>
          ))}
        </div>
        <p className="text-xs font-sans text-white/40 pt-1">
          * Syafi&apos;i: Bayangan sama panjang dengan objek. Hanafi: Bayangan 2× panjang objek.
        </p>
      </Section>

      {/* Time Offsets */}
      <Section
        icon={<Clock className="w-5 h-5" />}
        title="Koreksi Waktu Per Sholat (Menit)"
      >
        <p className="text-xs font-sans text-white/50 -mt-2 mb-4">
          Sesuaikan waktu sholat dengan jadwal resmi lokal (+ menambah, - mengurangi)
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PRAYER_KEYS.map((key) => (
            <div key={key} className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-sm font-bold font-display text-white/90">
                {PRAYER_KEY_TO_NAME[key]}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    handleOffsetChange(key, String(offsets[key] - 1))
                  }
                  className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/15 flex items-center justify-center text-white font-bold transition-all border border-white/10"
                >
                  −
                </button>
                <input
                  type="number"
                  min={-60}
                  max={60}
                  value={offsets[key]}
                  onChange={(e) => handleOffsetChange(key, e.target.value)}
                  className="w-16 text-center rounded-xl px-2 py-2 text-sm bg-black/30 border border-white/10 text-[--color-secondary] font-mono font-bold focus:border-[--color-secondary]/60 outline-none"
                />
                <button
                  onClick={() =>
                    handleOffsetChange(key, String(offsets[key] + 1))
                  }
                  className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/15 flex items-center justify-center text-white font-bold transition-all border border-white/10"
                >
                  +
                </button>
                <span className="text-xs text-white/40 w-6 font-mono text-center">
                  mnt
                </span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Imsak & Hijri Offset Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Imsak Minutes */}
        <Section icon={<Clock className="w-5 h-5" />} title="Waktu Imsak">
          <p className="text-xs font-sans text-white/50 -mt-2 mb-4">
            Imsak dihitung otomatis: Subuh dikurangi menit di bawah
          </p>
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-sm font-bold font-display text-white">
              Jeda Sebelum Subuh
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setImsakMinutes((v) => Math.max(5, v - 5))}
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/15 flex items-center justify-center text-white font-bold transition-all border border-white/10"
              >
                −
              </button>
              <input
                type="number"
                min={5}
                max={60}
                value={imsakMinutes}
                onChange={(e) => {
                  const n = parseInt(e.target.value, 10);
                  setImsakMinutes(isNaN(n) ? 10 : Math.max(5, Math.min(60, n)));
                }}
                className="w-16 text-center rounded-xl px-2 py-2 text-sm bg-black/30 border border-white/10 text-[--color-secondary] font-mono font-bold focus:border-[--color-secondary]/60 outline-none"
              />
              <button
                onClick={() => setImsakMinutes((v) => Math.min(60, v + 5))}
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/15 flex items-center justify-center text-white font-bold transition-all border border-white/10"
              >
                +
              </button>
              <span className="text-xs text-white/40 w-6 font-mono text-center">
                mnt
              </span>
            </div>
          </div>
        </Section>

        {/* Hijri Offset */}
        <Section icon={<Clock className="w-5 h-5" />} title="Koreksi Tanggal Hijriah">
          <p className="text-xs font-sans text-white/50 -mt-2 mb-4">
            Penyesuaian tanggal Hijriah jika meleset (karena keputusan Rukyat Hilal)
          </p>
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-sm font-bold font-display text-white">
              Koreksi Hari
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setHijriOffset((v) => Math.max(-2, v - 1))}
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/15 flex items-center justify-center text-white font-bold transition-all border border-white/10"
              >
                −
              </button>
              <input
                type="number"
                min={-2}
                max={2}
                value={hijriOffset}
                onChange={(e) => {
                  const n = parseInt(e.target.value, 10);
                  setHijriOffset(isNaN(n) ? 0 : Math.max(-2, Math.min(2, n)));
                }}
                className="w-16 text-center rounded-xl px-2 py-2 text-sm bg-black/30 border border-white/10 text-[--color-secondary] font-mono font-bold focus:border-[--color-secondary]/60 outline-none"
              />
              <button
                onClick={() => setHijriOffset((v) => Math.min(2, v + 1))}
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/15 flex items-center justify-center text-white font-bold transition-all border border-white/10"
              >
                +
              </button>
              <span className="text-xs text-white/40 w-6 font-mono text-center">
                hari
              </span>
            </div>
          </div>
        </Section>
      </div>

      {/* Iqomah Durations */}
      <Section
        icon={<Clock className="w-5 h-5" />}
        title="Durasi Countdown Iqomah (Menit)"
      >
        <p className="text-xs font-sans text-white/50 -mt-2 mb-4">
          Waktu hitung mundur dari Kumandang Adzan menuju Dimulainya Iqomah
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {IQOMAH_KEYS.map((key) => (
            <div key={key} className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-sm font-bold font-display text-white/90">
                {PRAYER_KEY_TO_NAME[key]}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    handleIqomahChange(key, String(iqomah[key] - 1))
                  }
                  className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/15 flex items-center justify-center text-white font-bold transition-all border border-white/10"
                >
                  −
                </button>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={iqomah[key]}
                  onChange={(e) => handleIqomahChange(key, e.target.value)}
                  className="w-14 text-center rounded-xl px-2 py-2 text-sm bg-black/30 border border-white/10 text-[--color-secondary] font-mono font-bold focus:border-[--color-secondary]/60 outline-none"
                />
                <button
                  onClick={() =>
                    handleIqomahChange(key, String(iqomah[key] + 1))
                  }
                  className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/15 flex items-center justify-center text-white font-bold transition-all border border-white/10"
                >
                  +
                </button>
                <span className="text-xs text-white/40 w-6 font-mono text-center">
                  mnt
                </span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Save Button */}
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
          ? "Menyimpan Konfigurasi..."
          : saveStatus === "saved"
            ? "Berhasil Tersimpan!"
            : "Simpan Semua Pengaturan Jadwal"}
      </button>
    </div>
  );
}

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
