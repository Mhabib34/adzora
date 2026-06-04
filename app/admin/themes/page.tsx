"use client";

import { useState, useCallback, useEffect } from "react";
import { Check, Palette, Save, CheckCircle, Loader2 } from "lucide-react";
import { useThemeStore, THEME_PRESETS } from "../../../stores/useThemeStore";
import type { ThemePreset } from "../../../types/mosque";

const PRESET_META: Record<
  ThemePreset,
  { label: string; desc: string; emoji: string }
> = {
  "hijau-klasik": {
    label: "Hijau Klasik",
    desc: "Hijau alam yang menenangkan, cocok untuk masjid tradisional",
    emoji: "🌿",
  },
  "biru-langit": {
    label: "Biru Langit",
    desc: "Biru langit malam yang elegan dan modern",
    emoji: "🌙",
  },
  "ungu-malam": {
    label: "Ungu Malam",
    desc: "Ungu mewah dengan aksen emas, nuansa spiritual yang kuat",
    emoji: "✨",
  },
  "emas-gelap": {
    label: "Emas Gelap",
    desc: "Emas tua di atas latar gelap, klasik dan berwibawa",
    emoji: "🏛️",
  },
  custom: {
    label: "Kustom",
    desc: "Warna kustom yang Anda pilih sendiri",
    emoji: "🎨",
  },
};

/**
 * Theme selection page — choose from 4 color presets or set custom colors.
 * Applies CSS variables immediately via useThemeStore.applyCSSVariables.
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
    <div className="min-h-screen bg-[--color-background] text-white p-6">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-[--color-primary]">Tema</h1>
          <p className="text-sm text-white/50 mt-1">
            Pilih tampilan warna untuk layar masjid.
          </p>
        </div>

        {/* Preset grid */}
        <div className="bg-[--color-surface] rounded-2xl p-5 border border-white/5 space-y-4">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-[--color-secondary]" />
            <h2 className="text-sm font-bold text-white/70 uppercase tracking-wider">
              Preset Tema
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {presets.map((preset) => {
              const colors = THEME_PRESETS[preset];
              const meta = PRESET_META[preset];
              const isActive = selected === preset;

              return (
                <button
                  key={preset}
                  onClick={() => handleSelectPreset(preset)}
                  className={`relative rounded-2xl p-4 border text-left transition-all ${isActive
                      ? "border-white/30 ring-2 ring-white/20"
                      : "border-white/5 hover:border-white/15"
                    }`}
                  style={{ backgroundColor: colors.colorBackground }}
                >
                  {/* Color swatches */}
                  <div className="flex gap-1.5 mb-3">
                    <div
                      className="w-6 h-6 rounded-full border border-white/10"
                      style={{ backgroundColor: colors.colorPrimary }}
                    />
                    <div
                      className="w-6 h-6 rounded-full border border-white/10"
                      style={{ backgroundColor: colors.colorSecondary }}
                    />
                    <div
                      className="w-6 h-6 rounded-full border border-white/10"
                      style={{ backgroundColor: colors.colorSurface }}
                    />
                  </div>

                  {/* Fake UI preview */}
                  <div
                    className="rounded-lg p-2 mb-3"
                    style={{ backgroundColor: colors.colorSurface }}
                  >
                    <div
                      className="h-1.5 rounded w-3/4 mb-1.5"
                      style={{
                        backgroundColor: colors.colorSecondary,
                        opacity: 0.7,
                      }}
                    />
                    <div
                      className="h-1 rounded w-1/2"
                      style={{
                        backgroundColor: colors.colorPrimary,
                        opacity: 0.5,
                      }}
                    />
                  </div>

                  <p
                    className="text-xs font-bold"
                    style={{ color: colors.colorSecondary }}
                  >
                    {meta.emoji} {meta.label}
                  </p>
                  <p
                    className="text-[10px] mt-0.5 leading-tight"
                    style={{ color: colors.colorSecondary, opacity: 0.5 }}
                  >
                    {meta.desc}
                  </p>

                  {isActive && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom colors */}
        <div className="bg-[--color-surface] rounded-2xl p-5 border border-white/5 space-y-4">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-[--color-secondary]" />
            <h2 className="text-sm font-bold text-white/70 uppercase tracking-wider">
              Warna Kustom
            </h2>
          </div>
          <p className="text-xs text-white/40 -mt-2">
            Pilih warna sendiri. Preview langsung diterapkan.
          </p>

          <div className="space-y-3">
            {[
              {
                key: "colorPrimary" as const,
                label: "Warna Utama (Primary)",
                value: customPrimary,
              },
              {
                key: "colorSecondary" as const,
                label: "Warna Aksen (Secondary)",
                value: customSecondary,
              },
              {
                key: "colorBackground" as const,
                label: "Latar Belakang",
                value: customBg,
              },
              {
                key: "colorSurface" as const,
                label: "Permukaan / Card",
                value: customSurface,
              },
            ].map(({ key, label, value }) => (
              <div key={key} className="flex items-center gap-3">
                <input
                  type="color"
                  value={value}
                  onChange={(e) => {
                    setSelected("custom");
                    handleCustomColor(key, e.target.value);
                  }}
                  className="w-10 h-10 rounded-xl border border-white/10 cursor-pointer bg-transparent p-0.5"
                />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-white/60">{label}</p>
                  <p className="text-xs text-white/30 font-mono">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

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
              ? "Tema tersimpan!"
              : "Simpan Perubahan Tema"}
        </button>

        <div className="pb-4" />
      </div>
    </div>
  );
}
