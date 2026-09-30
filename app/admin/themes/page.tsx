"use client";

import { useState, useCallback, useEffect } from "react";
import { Check, Palette, Save, CheckCircle, Loader2, Sparkles } from "lucide-react";
import { useThemeStore, THEME_PRESETS } from "../../../stores/useThemeStore";
import type { ThemePreset } from "../../../types/mosque";

const PRESET_META: Record<
  ThemePreset,
  { label: string; desc: string; emoji: string }
> = {
  "hijau-klasik": {
    label: "Emerald Luxury",
    desc: "Nuansa hijau zamrud Islami bernuansa tenang & elegan",
    emoji: "🌿",
  },
  "biru-langit": {
    label: "Midnight Sapphire",
    desc: "Biru safir malam hari yang kontras & modern",
    emoji: "🌙",
  },
  "ungu-malam": {
    label: "Royal Amethyst",
    desc: "Ungu keemasan yang megah dengan suasana spiritual mendalam",
    emoji: "✨",
  },
  "emas-gelap": {
    label: "Imperial Gold",
    desc: "Kemewahan emas murni di atas latar permukaan gelap",
    emoji: "🏛️",
  },
  "monokrom-elegan": {
    label: "Monochrome Elite",
    desc: "Hitam pekat dan abu-abu dengan teks putih terang minimalis",
    emoji: "⬛",
  },
  custom: {
    label: "Warna Kustom",
    desc: "Kombinasi warna yang disesuaikan secara bebas",
    emoji: "🎨",
  },
};

/**
 * Theme selection page — choose from 4 color presets or set custom colors.
 * Redesigned with Islamic Dark Luxury aesthetic.
 */
export default function ThemesPage() {
  const { theme, applyPreset, setTheme, applyCSSVariables } = useThemeStore();

  const [selected, setSelected] = useState<ThemePreset>(theme.preset);
  const [customPrimary, setCustomPrimary] = useState(theme.colorPrimary);
  const [customSecondary, setCustomSecondary] = useState(theme.colorSecondary);
  const [customBg, setCustomBg] = useState(theme.colorBackground);
  const [customSurface, setCustomSurface] = useState(theme.colorSurface);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle",
  );

  // Sync local state when store hydrates or theme changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelected(theme.preset);
    setCustomPrimary(theme.colorPrimary);
    setCustomSecondary(theme.colorSecondary);
    setCustomBg(theme.colorBackground);
    setCustomSurface(theme.colorSurface);
  }, [theme]);

  const handleSelectPreset = useCallback(
    (preset: ThemePreset) => {
      setSelected(preset);
      if (preset !== "custom") {
        const colors = THEME_PRESETS[preset];
        setCustomPrimary(colors.colorPrimary);
        setCustomSecondary(colors.colorSecondary);
        setCustomBg(colors.colorBackground);
        setCustomSurface(colors.colorSurface);
        applyPreset(preset);
      }
    },
    [applyPreset],
  );

  /** Update a single custom color and preview */
  const handleCustomColor = useCallback(
    (
      key:
        | "colorPrimary"
        | "colorSecondary"
        | "colorBackground"
        | "colorSurface",
      val: string,
    ) => {
      if (key === "colorPrimary") setCustomPrimary(val);
      if (key === "colorSecondary") setCustomSecondary(val);
      if (key === "colorBackground") setCustomBg(val);
      if (key === "colorSurface") setCustomSurface(val);
      // Live preview
      setTheme({ [key]: val, preset: "custom" });
      applyCSSVariables();
    },
    [setTheme, applyCSSVariables],
  );

  /** Persist theme */
  const handleSave = useCallback(async () => {
    setSaveStatus("saving");
    if (selected === "custom") {
      setTheme({
        colorPrimary: customPrimary,
        colorSecondary: customSecondary,
        colorBackground: customBg,
        colorSurface: customSurface,
        preset: "custom",
      });
    } else {
      applyPreset(selected);
    }
    applyCSSVariables();
    await new Promise((r) => setTimeout(r, 600));
    setSaveStatus("saved");
    await new Promise((r) => setTimeout(r, 1200));
    setSaveStatus("idle");
  }, [
    selected,
    customPrimary,
    customSecondary,
    customBg,
    customSurface,
    setTheme,
    applyPreset,
    applyCSSVariables,
  ]);

  const presets = (Object.keys(THEME_PRESETS) as ThemePreset[]).filter(
    (p) => p !== "custom",
  );

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[--color-secondary]/15 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[--color-secondary]/15 text-[--color-secondary] border border-[--color-secondary]/30 flex items-center gap-1.5 w-fit">
              <Palette className="w-3.5 h-3.5" /> Personalisasi Tampilan
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-serif">
            Tema Warna Layar Display
          </h1>
          <p className="text-sm text-emerald-100/60 mt-1">
            Pilih preset skema warna Islami atau sesuaikan warna custom sesuai preferensi masjid Anda.
          </p>
        </div>
      </div>

      {/* Preset grid */}
      <div className="bg-[--color-surface]/60 backdrop-blur-2xl rounded-3xl p-6 border border-[--color-secondary]/20 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-[--color-secondary]/15 pb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[--color-secondary]" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-serif">
              Preset Tema Pilihan
            </h2>
          </div>
          <span className="text-xs text-emerald-100/50">Klik kartu untuk pratinjau langsung</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {presets.map((preset) => {
            const colors = THEME_PRESETS[preset];
            const meta = PRESET_META[preset];
            const isActive = selected === preset;

            return (
              <button
                key={preset}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`relative rounded-3xl p-5 border text-left transition-all duration-300 flex flex-col justify-between ${
                  isActive
                    ? "border-[--color-secondary] bg-[--color-surface] shadow-[0_0_25px_rgba(234,179,8,0.25)] ring-2 ring-[--color-secondary]/50 scale-[1.02]"
                    : "border-emerald-500/20 bg-emerald-950/40 hover:border-[--color-secondary]/50 hover:bg-[--color-surface]/40"
                }`}
              >
                <div>
                  {/* Top Swatches */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-2">
                      <div
                        className="w-6 h-6 rounded-full border border-white/20 shadow-md"
                        style={{ backgroundColor: colors.colorPrimary }}
                        title="Primary Color"
                      />
                      <div
                        className="w-6 h-6 rounded-full border border-white/20 shadow-md"
                        style={{ backgroundColor: colors.colorSecondary }}
                        title="Secondary Color"
                      />
                      <div
                        className="w-6 h-6 rounded-full border border-white/20 shadow-md"
                        style={{ backgroundColor: colors.colorSurface }}
                        title="Surface Color"
                      />
                    </div>
                    {isActive && (
                      <div className="w-6 h-6 rounded-full bg-[--color-secondary] text-emerald-950 flex items-center justify-center font-bold shadow-md">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>

                  {/* Fake Display UI preview */}
                  <div
                    className="rounded-2xl p-3 mb-4 border border-white/10 shadow-inner overflow-hidden"
                    style={{ backgroundColor: colors.colorBackground }}
                  >
                    <div
                      className="rounded-xl p-2.5 space-y-1.5"
                      style={{ backgroundColor: colors.colorSurface }}
                    >
                      <div
                        className="h-2 rounded-full w-3/4"
                        style={{ backgroundColor: colors.colorSecondary }}
                      />
                      <div
                        className="h-1.5 rounded-full w-1/2 opacity-70"
                        style={{ backgroundColor: colors.colorPrimary }}
                      />
                      <div className="flex gap-1 pt-1">
                        <div
                          className="h-3 rounded-md w-full opacity-40"
                          style={{ backgroundColor: colors.colorSecondary }}
                        />
                        <div
                          className="h-3 rounded-md w-full opacity-40"
                          style={{ backgroundColor: colors.colorSecondary }}
                        />
                      </div>
                    </div>
                  </div>

                  <p className="text-sm font-bold text-white font-serif flex items-center gap-1.5">
                    <span>{meta.emoji}</span>
                    <span>{meta.label}</span>
                  </p>
                  <p className="text-xs text-emerald-100/60 mt-1 leading-relaxed">
                    {meta.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Colors */}
      <div className="bg-[--color-surface]/60 backdrop-blur-2xl rounded-3xl p-6 border border-[--color-secondary]/20 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-[--color-secondary]/15 pb-4">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-[--color-secondary]" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-serif">
              Pengaturan Warna Kustom
            </h2>
          </div>
          <span className="text-xs text-emerald-100/50">Ubah nilai hex untuk warna khusus</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              key: "colorPrimary" as const,
              label: "Warna Utama (Primary)",
              value: customPrimary,
              desc: "Warna teks judul & aksen utama",
            },
            {
              key: "colorSecondary" as const,
              label: "Warna Aksen (Secondary)",
              value: customSecondary,
              desc: "Warna keemasan / sorotan jadwal",
            },
            {
              key: "colorBackground" as const,
              label: "Latar Belakang (BG)",
              value: customBg,
              desc: "Latar belakang paling belakang",
            },
            {
              key: "colorSurface" as const,
              label: "Permukaan / Kartu",
              value: customSurface,
              desc: "Latar belakang kartu komponen",
            },
          ].map(({ key, label, value, desc }) => (
            <div
              key={key}
              className="bg-emerald-950/40 border border-emerald-500/20 rounded-2xl p-4 flex flex-col justify-between gap-3 hover:border-[--color-secondary]/40 transition-all"
            >
              <div>
                <p className="text-xs font-bold text-white">{label}</p>
                <p className="text-[11px] text-emerald-100/50 mt-0.5">{desc}</p>
              </div>

              <div className="flex items-center gap-3 pt-2 border-t border-emerald-500/10">
                <input
                  type="color"
                  value={value}
                  onChange={(e) => {
                    setSelected("custom");
                    handleCustomColor(key, e.target.value);
                  }}
                  className="w-10 h-10 rounded-xl border border-white/20 cursor-pointer bg-transparent p-0.5 shadow-md"
                />
                <div>
                  <span className="text-xs font-mono font-bold text-[--color-secondary] uppercase bg-black/30 px-2.5 py-1 rounded-lg border border-white/10 block">
                    {value}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Save Button Footer */}
      <div className="bg-[--color-surface]/60 backdrop-blur-2xl rounded-3xl p-6 border border-[--color-secondary]/20 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-xs text-emerald-100/50">
          * Perubahan warna tema akan langsung tersimpan di IndexedDB dan diterapkan ke layar display utama secara realtime.
        </p>
        <button
          type="button"
          onClick={handleSave}
          disabled={saveStatus === "saving" || saveStatus === "saved"}
          className="w-full md:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[--color-secondary] via-amber-400 to-[--color-secondary] text-emerald-950 font-bold hover:shadow-[0_0_25px_rgba(234,179,8,0.3)] disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg flex items-center justify-center gap-2"
        >
          {saveStatus === "saving" && (
            <Loader2 className="w-5 h-5 animate-spin" />
          )}
          {saveStatus === "saved" && <CheckCircle className="w-5 h-5" />}
          {saveStatus === "idle" && <Save className="w-5 h-5" />}
          {saveStatus === "saving"
            ? "Menyimpan Tema..."
            : saveStatus === "saved"
              ? "Tema Tersimpan!"
              : "Simpan Perubahan Tema"}
        </button>
      </div>
    </div>
  );
}
