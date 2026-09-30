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
  Compass,
} from "lucide-react";
import { useMosqueStore } from "../../../stores/useMosqueStore";

/**
 * Setup Wizard page — configure mosque name, address, city, and coordinates.
 * Redesigned with Islamic Dark Luxury aesthetic.
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
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[--color-secondary]/15 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[--color-secondary]/15 text-[--color-secondary] border border-[--color-secondary]/30 flex items-center gap-1.5 w-fit">
              <Compass className="w-3.5 h-3.5" /> Konfigurasi Awal
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-serif">
            Setup Informasi Masjid
          </h1>
          <p className="text-sm text-emerald-100/60 mt-1">
            Atur nama, alamat, dan titik koordinat geografis untuk akurasi perhitungan jadwal sholat.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mosque Info Section */}
        <Section
          icon={<Building2 className="w-4 h-4" />}
          title="Profil & Alamat Masjid"
        >
          <Field label="Nama Masjid" error={errors.name} required>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Masjid Raya Al-Falah"
              className={inputClass(!!errors.name)}
            />
          </Field>
          <Field label="Alamat Lengkap">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Contoh: Jl. Sudirman No. 45"
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
        <Section icon={<MapPin className="w-4 h-4" />} title="Koordinat & Waktu">
          <p className="text-xs text-emerald-100/60 -mt-1 mb-2">
            Diperlukan untuk presisi posisi matahari dan penentuan jadwal adzan.
          </p>

          {/* Auto-detect button */}
          <button
            type="button"
            onClick={handleUseMyLocation}
            disabled={geoStatus === "loading"}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-[--color-secondary]/40 bg-[--color-secondary]/10 hover:bg-[--color-secondary]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all py-2.5 text-xs font-bold text-[--color-secondary] shadow-md hover:shadow-[0_0_15px_rgba(234,179,8,0.2)] mb-3"
          >
            {geoStatus === "loading" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Navigation className="w-4 h-4" />
            )}
            {geoStatus === "loading"
              ? "Mendeteksi Lokasi GPS..."
              : "Deteksi Lokasi Otomatis (GPS)"}
          </button>

          {/* Geo feedback */}
          {geoStatus === "success" && (
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 rounded-xl px-3 py-2 mb-3">
              <CheckCircle className="w-3.5 h-3.5 shrink-0" />
              Koordinat GPS berhasil terdeteksi.
            </div>
          )}
          {geoStatus === "error" && (
            <div className="flex items-start gap-2 text-xs text-red-300 bg-red-950/60 border border-red-500/30 rounded-xl px-3 py-2 mb-3">
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

          <Field label="Zona Waktu (Timezone)" error={errors.timezone} required>
            <input
              type="text"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              placeholder="Asia/Jakarta"
              className={inputClass(!!errors.timezone)}
            />
          </Field>
        </Section>
      </div>

      {/* Indonesia Timezone Quick Picker */}
      <div className="bg-[--color-surface]/60 backdrop-blur-2xl rounded-3xl p-6 border border-[--color-secondary]/20 shadow-xl space-y-3">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-[--color-secondary]" />
          <p className="text-xs font-bold text-[--color-secondary] uppercase tracking-wider">
            Pilihan Cepat Zona Waktu Indonesia
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "WIB (Waktu Indonesia Barat)", value: "Asia/Jakarta" },
            { label: "WITA (Waktu Indonesia Tengah)", value: "Asia/Makassar" },
            { label: "WIT (Waktu Indonesia Timur)", value: "Asia/Jayapura" },
          ].map((tz) => (
            <button
              key={tz.value}
              type="button"
              onClick={() => setTimezone(tz.value)}
              className={`text-xs rounded-2xl p-3 border transition-all text-center ${
                timezone === tz.value
                  ? "border-[--color-secondary] bg-[--color-secondary]/20 text-[--color-secondary] font-bold shadow-md"
                  : "border-emerald-500/20 bg-emerald-950/30 text-emerald-100/70 hover:border-emerald-500/40 hover:text-white"
              }`}
            >
              <span className="block font-bold">{tz.label.split(" ")[0]}</span>
              <span className="block text-[10px] text-emerald-100/50 truncate">
                {tz.value}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Action Footer */}
      <div className="bg-[--color-surface]/60 backdrop-blur-2xl rounded-3xl p-6 border border-[--color-secondary]/20 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-xs text-emerald-100/50">
          * Seluruh pengaturan lokasi disimpan di memori lokal peramban peranti ini.
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
            ? "Menyimpan Data..."
            : saveStatus === "saved"
              ? "Tersimpan! Mengalihkan..."
              : "Simpan Konfigurasi"}
        </button>
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
      <div className="flex items-center gap-2 border-b border-[--color-secondary]/15 pb-3">
        <span className="text-[--color-secondary]">{icon}</span>
        <h2 className="text-sm font-bold text-white uppercase tracking-wider font-serif">
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}

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
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-emerald-100/70 uppercase tracking-wide flex items-center justify-between">
        <span>
          {label}
          {required && <span className="text-[--color-secondary] ml-1">*</span>}
        </span>
      </label>
      {children}
      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1 mt-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
}

function inputClass(hasError: boolean): string {
  return [
    "w-full rounded-xl px-4 py-2.5 text-sm bg-emerald-950/40 text-white placeholder-emerald-100/30 font-medium",
    "border outline-none transition-all",
    "focus:border-[--color-secondary] focus:ring-1 focus:ring-[--color-secondary]",
    hasError
      ? "border-red-500/50 bg-red-950/30"
      : "border-emerald-500/20 hover:border-emerald-500/40",
  ].join(" ");
}

