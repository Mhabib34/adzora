"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Building2,
  Navigation,
  Save,
  CheckCircle,
  AlertCircle,
  Loader2,
  Globe,
} from "lucide-react";
import { useMosqueStore } from "../../../stores/useMosqueStore";

/**
 * Setup Wizard page — configure mosque name, address, city, and coordinates.
 * Supports manual coordinate input and automatic geolocation detection.
 * Sets isSetupComplete: true on save and redirects to dashboard.
 */
export default function SetupPage() {
  const router = useRouter();
  const { config, setConfig } = useMosqueStore();

  const [name, setName] = useState(config.name);
  const [address, setAddress] = useState(config.address);
  const [city, setCity] = useState(config.city);
  const [latitude, setLatitude] = useState(String(config.latitude));
  const [longitude, setLongitude] = useState(String(config.longitude));
  const [timezone, setTimezone] = useState(
    config.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
  );

  const [geoStatus, setGeoStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [geoError, setGeoError] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle",
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  /** Validate form fields before saving */
  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Nama masjid wajib diisi.";
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (isNaN(lat) || lat < -90 || lat > 90)
      newErrors.latitude = "Latitude harus antara -90 dan 90.";
    if (isNaN(lng) || lng < -180 || lng > 180)
      newErrors.longitude = "Longitude harus antara -180 dan 180.";
    if (!timezone.trim()) newErrors.timezone = "Timezone wajib diisi.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [name, latitude, longitude, timezone]);

  /** Use browser Geolocation API to auto-fill coordinates */
  const handleUseMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoError("Browser tidak mendukung geolokasi.");
      setGeoStatus("error");
      return;
    }
    setGeoStatus("loading");
    setGeoError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude.toFixed(6));
        setLongitude(pos.coords.longitude.toFixed(6));
        // Auto-detect timezone from browser
        setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
        setGeoStatus("success");
      },
      (err) => {
        const msg =
          err.code === 1
            ? "Akses lokasi ditolak. Izinkan lokasi di pengaturan browser."
            : err.code === 2
              ? "Lokasi tidak tersedia. Coba lagi atau isi manual."
              : "Timeout. Coba lagi atau isi koordinat secara manual.";
        setGeoError(msg);
        setGeoStatus("error");
      },
      { timeout: 10000, enableHighAccuracy: true },
    );
  }, []);

  /** Save configuration to mosque store */
  const handleSave = useCallback(async () => {
    if (!validate()) return;
    setSaveStatus("saving");

    setConfig({
      name: name.trim(),
      address: address.trim(),
      city: city.trim(),
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      timezone: timezone.trim(),
      isSetupComplete: true,
    });

    // Small delay for UX feedback
    await new Promise((r) => setTimeout(r, 600));
    setSaveStatus("saved");
    await new Promise((r) => setTimeout(r, 800));
    router.push("/admin");
  }, [
    validate,
    setConfig,
    name,
    address,
    city,
    latitude,
    longitude,
    timezone,
    router,
  ]);

  return (
    <div className="min-h-screen bg-[--color-background] text-white p-6">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-[--color-primary]">
            Setup Masjid
          </h1>
          <p className="text-sm text-white/50 mt-1">
            Konfigurasi informasi dasar masjid untuk menghitung jadwal sholat
            yang akurat.
          </p>
        </div>

        {/* Mosque Info Section */}
        <Section
          icon={<Building2 className="w-4 h-4" />}
          title="Informasi Masjid"
        >
          <Field label="Nama Masjid" error={errors.name} required>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Masjid Al-Ikhlas"
              className={inputClass(!!errors.name)}
            />
          </Field>
          <Field label="Alamat">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Contoh: Jl. Merdeka No. 12"
              className={inputClass(false)}
            />
          </Field>
          <Field label="Kota / Kabupaten">
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Contoh: Jakarta Selatan"
              className={inputClass(false)}
            />
          </Field>
        </Section>

        {/* Location Section */}
        <Section icon={<MapPin className="w-4 h-4" />} title="Koordinat Lokasi">
          <p className="text-xs text-white/40 -mt-1 mb-3">
            Diperlukan untuk menghitung jadwal sholat yang tepat berdasarkan
            posisi matahari.
          </p>

          {/* Auto-detect button */}
          <button
            onClick={handleUseMyLocation}
            disabled={geoStatus === "loading"}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-[--color-primary]/40 bg-[--color-primary]/10 hover:bg-[--color-primary]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors py-3 text-sm font-semibold text-[--color-secondary] mb-4"
          >
            {geoStatus === "loading" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Navigation className="w-4 h-4" />
            )}
            {geoStatus === "loading"
              ? "Mendeteksi lokasi..."
              : "Gunakan Lokasi Saya"}
          </button>

          {/* Geo feedback */}
          {geoStatus === "success" && (
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-400/10 rounded-lg px-3 py-2 mb-3">
              <CheckCircle className="w-3.5 h-3.5 shrink-0" />
              Koordinat berhasil dideteksi secara otomatis.
            </div>
          )}
          {geoStatus === "error" && (
            <div className="flex items-start gap-2 text-xs text-red-400 bg-red-400/10 rounded-lg px-3 py-2 mb-3">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              {geoError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Field label="Latitude" error={errors.latitude} required>
              <input
                type="number"
                step="0.000001"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="-6.2088"
                className={inputClass(!!errors.latitude)}
              />
            </Field>
            <Field label="Longitude" error={errors.longitude} required>
              <input
                type="number"
                step="0.000001"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="106.8456"
                className={inputClass(!!errors.longitude)}
              />
            </Field>
          </div>

          <Field label="Timezone" error={errors.timezone} required>
            <input
              type="text"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              placeholder="Asia/Jakarta"
              className={inputClass(!!errors.timezone)}
            />
            <p className="text-xs text-white/30 mt-1">
              Contoh: Asia/Jakarta, Asia/Makassar, Asia/Jayapura
            </p>
          </Field>
        </Section>

        {/* Common Indonesia Timezone Reference */}
        <div className="bg-[--color-surface] rounded-xl p-4 border border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-4 h-4 text-white/30" />
            <p className="text-xs font-semibold text-white/40 uppercase tracking-wide">
              Referensi Timezone Indonesia
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "WIB", value: "Asia/Jakarta" },
              { label: "WITA", value: "Asia/Makassar" },
              { label: "WIT", value: "Asia/Jayapura" },
            ].map((tz) => (
              <button
                key={tz.value}
                onClick={() => setTimezone(tz.value)}
                className={`text-xs rounded-lg px-3 py-2 border transition-colors text-center ${
                  timezone === tz.value
                    ? "border-[--color-primary]/60 bg-[--color-primary]/20 text-[--color-secondary] font-semibold"
                    : "border-white/10 bg-white/5 text-white/50 hover:border-white/20"
                }`}
              >
                <span className="block font-bold">{tz.label}</span>
                <span className="block text-[10px] opacity-60 truncate">
                  {tz.value.replace("Asia/", "")}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Save Button */}
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
              ? "Tersimpan! Mengalihkan..."
              : "Simpan Konfigurasi"}
        </button>

        <p className="text-center text-xs text-white/25 pb-4">
          Semua data disimpan secara lokal di perangkat ini.
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Section card wrapper with icon and title */
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

/** Form field with label and optional error message */
function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-white/50 uppercase tracking-wide">
        {label}
        {required && <span className="text-[--color-secondary] ml-1">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
}

/** Returns Tailwind input classes based on error state */
function inputClass(hasError: boolean): string {
  return [
    "w-full rounded-xl px-4 py-3 text-sm bg-white/5 text-white placeholder-white/20",
    "border outline-none transition-colors",
    "focus:border-[--color-primary]/60 focus:bg-white/8",
    hasError
      ? "border-red-500/50 bg-red-500/5"
      : "border-white/10 hover:border-white/20",
  ].join(" ");
}
