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
    <div className="min-h-screen bg-[--color-background] text-white p-6">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[--color-primary]">
              Jadwal Sholat
            </h1>
            <p className="text-sm text-white/50 mt-1">
              Konfigurasi metode kalkulasi, offset waktu, dan durasi iqomah.
            </p>
          </div>
          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors py-2 px-3 rounded-lg hover:bg-white/5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>

        {/* Reset Confirm */}
        {showResetConfirm && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
            <Info className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-400">
                Reset ke default?
              </p>
              <p className="text-xs text-red-400/70 mt-0.5">
                Semua offset dan durasi iqomah akan dikembalikan ke nilai awal.
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleReset}
                  className="text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg px-3 py-1.5 font-semibold transition-colors"
                >
                  Ya, Reset
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="text-xs bg-white/5 hover:bg-white/10 text-white/60 rounded-lg px-3 py-1.5 transition-colors"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Calculation Method */}
        <Section icon={<Clock className="w-4 h-4" />} title="Metode Kalkulasi">
          <div className="space-y-2">
            {CALCULATION_METHODS.map((m) => (
              <button
                key={m.key}
                onClick={() => setMethod(m.key)}
                className={`w-full text-left rounded-xl px-4 py-3 border transition-colors ${method === m.key
                  ? "border-[--color-primary]/60 bg-[--color-primary]/20"
                  : "border-white/8 bg-white/3 hover:border-white/15"
                  }`}
              >
                <p
                  className={`text-sm font-semibold ${method === m.key ? "text-[--color-secondary]" : "text-white"}`}
                >
                  {m.label}
                </p>
                <p className="text-xs text-white/40 mt-0.5">{m.desc}</p>
              </button>
            ))}
          </div>
        </Section>

        {/* Asr Method */}
        <Section icon={<Clock className="w-4 h-4" />} title="Metode Ashar">
          <div className="grid grid-cols-2 gap-3">
            {(["Shafi", "Hanafi"] as AsrMethodKey[]).map((k) => (
              <button
                key={k}
                onClick={() => setAsrMethod(k)}
                className={`rounded-xl px-4 py-3 border text-sm font-semibold transition-colors ${asrMethod === k
                  ? "border-[--color-primary]/60 bg-[--color-primary]/20 text-[--color-secondary]"
                  : "border-white/8 bg-white/3 text-white/60 hover:border-white/15"
                  }`}
              >
                {k === "Shafi" ? "Syafi'i / Maliki" : "Hanafi"}
              </button>
            ))}
          </div>
          <p className="text-xs text-white/30">
            Syafi&apos;i: bayangan = panjang objek. Hanafi: bayangan = 2×
            panjang objek.
          </p>
        </Section>

        {/* Time Offsets */}
        <Section
          icon={<Clock className="w-4 h-4" />}
          title="Koreksi Waktu (menit)"
        >
          <p className="text-xs text-white/40 -mt-1 mb-3">
            Nilai positif = mundurkan, negatif = majukan. Rentang: −60 s/d +60
            menit.
          </p>
          <div className="space-y-3">
            {PRAYER_KEYS.map((key) => (
              <div key={key} className="flex items-center gap-3">
                <span className="w-20 text-sm font-semibold text-white/70 shrink-0">
                  {PRAYER_KEY_TO_NAME[key]}
                </span>
                <div className="flex items-center gap-2 flex-1">
                  <button
                    onClick={() =>
                      handleOffsetChange(key, String(offsets[key] - 1))
                    }
                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 font-bold transition-colors"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={-60}
                    max={60}
                    value={offsets[key]}
                    onChange={(e) => handleOffsetChange(key, e.target.value)}
                    className="flex-1 text-center rounded-xl px-2 py-2 text-sm bg-white/5 border border-white/10 text-white focus:border-[--color-primary]/60 outline-none transition-colors font-mono"
                  />
                  <button
                    onClick={() =>
                      handleOffsetChange(key, String(offsets[key] + 1))
                    }
                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 font-bold transition-colors"
                  >
                    +
                  </button>
                  <span className="text-xs text-white/30 w-8 text-right shrink-0">
                    mnt
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Imsak Minutes */}
        <Section icon={<Clock className="w-4 h-4" />} title="Waktu Imsak">
          <p className="text-xs text-white/40 -mt-1 mb-3">
            Imsak dihitung otomatis: Subuh − menit di bawah.
          </p>
          <div className="flex items-center gap-3">
            <span className="w-40 text-sm font-semibold text-white/70 shrink-0">
              Menit sebelum Subuh
            </span>
            <div className="flex items-center gap-2 flex-1">
              <button
                onClick={() => setImsakMinutes((v) => Math.max(5, v - 5))}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 font-bold transition-colors"
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
                className="flex-1 text-center rounded-xl px-2 py-2 text-sm bg-white/5 border border-white/10 text-white focus:border-[--color-primary]/60 outline-none transition-colors font-mono"
              />
              <button
                onClick={() => setImsakMinutes((v) => Math.min(60, v + 5))}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 font-bold transition-colors"
              >
                +
              </button>
              <span className="text-xs text-white/30 w-8 text-right shrink-0">
                mnt
              </span>
            </div>
          </div>
        </Section>

        {/* Hijri Offset */}
        <Section icon={<Clock className="w-4 h-4" />} title="Koreksi Hari Hijriah">
          <p className="text-xs text-white/40 -mt-1 mb-3">
            Koreksi penanggalan Hijriah jika meleset (misal karena rukyatul hilal). Rentang: -2 s/d +2 hari.
          </p>
          <div className="flex items-center gap-3">
            <span className="w-40 text-sm font-semibold text-white/70 shrink-0">
              Koreksi Hari
            </span>
            <div className="flex items-center gap-2 flex-1">
              <button
                onClick={() => setHijriOffset((v) => Math.max(-2, v - 1))}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 font-bold transition-colors"
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
                className="flex-1 text-center rounded-xl px-2 py-2 text-sm bg-white/5 border border-white/10 text-white focus:border-[--color-primary]/60 outline-none transition-colors font-mono"
              />
              <button
                onClick={() => setHijriOffset((v) => Math.min(2, v + 1))}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 font-bold transition-colors"
              >
                +
              </button>
              <span className="text-xs text-white/30 w-8 text-right shrink-0">
                hari
              </span>
            </div>
          </div>
        </Section>

        {/* Iqomah Durations */}
        <Section
          icon={<Clock className="w-4 h-4" />}
          title="Durasi Iqomah (menit)"
        >
          <p className="text-xs text-white/40 -mt-1 mb-3">
            Jeda antara adzan dan iqomah. Syuruq tidak memiliki iqomah.
          </p>
          <div className="space-y-3">
            {IQOMAH_KEYS.map((key) => (
              <div key={key} className="flex items-center gap-3">
                <span className="w-20 text-sm font-semibold text-white/70 shrink-0">
                  {PRAYER_KEY_TO_NAME[key]}
                </span>
                <div className="flex items-center gap-2 flex-1">
                  <button
                    onClick={() =>
                      handleIqomahChange(key, String(iqomah[key] - 1))
                    }
                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 font-bold transition-colors"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={iqomah[key]}
                    onChange={(e) => handleIqomahChange(key, e.target.value)}
                    className="flex-1 text-center rounded-xl px-2 py-2 text-sm bg-white/5 border border-white/10 text-white focus:border-[--color-primary]/60 outline-none transition-colors font-mono"
                  />
                  <button
                    onClick={() =>
                      handleIqomahChange(key, String(iqomah[key] + 1))
                    }
                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 font-bold transition-colors"
                  >
                    +
                  </button>
                  <span className="text-xs text-white/30 w-8 text-right shrink-0">
                    mnt
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Save */}
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
              : "Simpan Konfigurasi"}
        </button>

        <p className="text-center text-xs text-white/25 pb-4">
          Perubahan akan langsung mempengaruhi tampilan jadwal sholat.
        </p>
      </div>
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
