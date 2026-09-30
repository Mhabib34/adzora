"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import {
  Monitor,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Radio,
  Image as ImageIcon,
  ChevronRight,
  Info,
} from "lucide-react";
import { useMosqueStore } from "../../stores/useMosqueStore";
import { useContentStore } from "../../stores/useContentStore";
import { usePrayerStore } from "../../stores/usePrayerStore";
import { PrayerEngine } from "../../engines/PrayerEngine";
import { PRAYER_KEY_TO_NAME } from "../../types/prayer";
import type { PrayerTime, NextPrayer } from "../../types/prayer";

/**
 * Admin Dashboard — ringkasan status masjid, waktu sholat, dan konten aktif.
 * Quick action buttons untuk navigasi ke display dan setup.
 */
export default function AdminDashboardPage() {
  const { config } = useMosqueStore();
  const { runningTexts } = useContentStore();
  const { calculationConfig, iqomahConfig } = usePrayerStore();

  const [now, setNow] = useState(new Date());
  const [todayPrayers, setTodayPrayers] = useState<PrayerTime[]>([]);
  const [nextPrayer, setNextPrayer] = useState<NextPrayer | null>(null);

  useEffect(() => {
    if (!config.isSetupComplete) return;

    const engine = new PrayerEngine(calculationConfig, iqomahConfig, {
      latitude: config.latitude,
      longitude: config.longitude,
    });

    let isMounted = true;
    let currentPrayers: PrayerTime[] = [];

    engine.getTodaySchedule().then((schedule) => {
      if (!isMounted) return;
      // Filter out sunrise for the display purposes
      currentPrayers = schedule.prayers.filter(p => p.key !== "sunrise");
      setTodayPrayers(currentPrayers);
      setNextPrayer(engine.getNextPrayer(new Date(), currentPrayers));
    });

    const interval = setInterval(() => {
      const d = new Date();
      setNow(d);
      if (currentPrayers.length > 0) {
        setNextPrayer(engine.getNextPrayer(d, currentPrayers));
      }
    }, 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [config, calculationConfig, iqomahConfig]);

  /** Hitung jumlah running text yang aktif */
  const activeTextsCount = useMemo(
    () => runningTexts.filter((t) => t.isActive).length,
    [runningTexts],
  );

  /** Format waktu sholat berikutnya */
  const nextPrayerLabel = useMemo(() => {
    if (!nextPrayer) return "Memuat...";
    const name = PRAYER_KEY_TO_NAME[nextPrayer.prayer.key];
    const h = nextPrayer.prayer.time.getHours().toString().padStart(2, "0");
    const m = nextPrayer.prayer.time.getMinutes().toString().padStart(2, "0");
    return `${name} — ${h}:${m}`;
  }, [nextPrayer]);

  /** Format sisa waktu ke sholat berikutnya */
  const timeRemainingLabel = useMemo(() => {
    if (!nextPrayer) return "";
    const s = nextPrayer.remainingSeconds;
    if (s <= 0) return "Sekarang";
    const hours = Math.floor(s / 3600);
    const minutes = Math.floor((s % 3600) / 60);
    if (hours > 0) return `${hours} jam ${minutes} menit lagi`;
    return `${minutes} menit lagi`;
  }, [nextPrayer]);

  /** Format jam sekarang */
  const currentTimeLabel = useMemo(() => {
    const h = now.getHours().toString().padStart(2, "0");
    const m = now.getMinutes().toString().padStart(2, "0");
    return `${h}:${m}`;
  }, [now]);

  /** Jumlah waktu sholat yang terkonfigurasi hari ini */
  const todayPrayersCount = todayPrayers.length;

  const setupComplete = config.isSetupComplete;

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold font-display text-white tracking-wide">
              Dashboard Overview
            </h1>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Sistem Aktif
            </span>
          </div>
          <p className="text-sm font-sans text-white/60 mt-1">
            Pusat kendali dan status sistem digital signage masjid Adzora
          </p>
        </div>
        <div className="flex items-center gap-3 bg-[--color-surface]/60 backdrop-blur-xl border border-[--color-secondary]/25 rounded-2xl px-5 py-3 shadow-lg">
          <Clock className="w-5 h-5 text-[--color-secondary]" />
          <span className="font-mono text-xl font-bold text-white tracking-tight">
            {currentTimeLabel}
          </span>
        </div>
      </div>

      {/* Setup Warning Banner */}
      {!setupComplete && (
        <Link
          href="/admin/setup"
          className="flex items-center gap-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 hover:bg-amber-500/15 transition-all duration-300 group shadow-lg"
        >
          <AlertCircle className="w-6 h-6 text-amber-400 shrink-0" />
          <div className="flex-1">
            <p className="text-base font-bold font-display text-amber-400">
              Konfigurasi Awal Belum Lengkap
            </p>
            <p className="text-xs font-sans text-amber-400/80 mt-0.5">
              Lengkapi informasi lokasi dan zona waktu masjid agar jadwal sholat otomatis terhitung dengan akurat.
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-amber-400 group-hover:translate-x-1 transition-transform" />
        </Link>
      )}

      {/* Info Remote TV Shortcut Banner */}
      <div className="flex items-start gap-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl p-5 backdrop-blur-md">
        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0">
          <Info className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <p className="text-base font-bold font-display text-blue-400">
            Akses Cepat dari Remote TV
          </p>
          <p className="text-xs font-sans text-blue-400/80 mt-1 leading-relaxed">
            Tekan tombol <strong className="text-blue-300">OK / Enter 3 kali cepat</strong> pada remote TV, atau klik mouse <strong className="text-blue-300">5 kali di sudut kanan bawah</strong> layar display untuk langsung masuk ke panel admin ini.
          </p>
        </div>
      </div>

      {/* Grid Status Utama */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mosque Info Card */}
        <div className="bg-[--color-surface]/60 backdrop-blur-2xl rounded-3xl p-6 border border-[--color-secondary]/20 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[--color-primary]/40 to-[--color-secondary]/20 flex items-center justify-center shrink-0 border border-[--color-secondary]/30 shadow-md">
              <MapPin className="w-6 h-6 text-[--color-secondary]" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold tracking-widest uppercase text-[--color-secondary]">
                Informasi Masjid
              </span>
              <h2 className="font-bold font-display text-xl leading-tight truncate text-white mt-0.5">
                {config.name}
              </h2>
              {config.address && (
                <p className="text-xs font-sans text-white/60 mt-1 truncate">
                  {config.address}
                  {config.city ? `, ${config.city}` : ""}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-6 pt-4 border-t border-white/5">
            {setupComplete ? (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20">
                <CheckCircle className="w-3.5 h-3.5" />
                Setup Siap
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
                <AlertCircle className="w-3.5 h-3.5" />
                Belum Dikunci
              </span>
            )}
            {config.latitude !== 0 && (
              <span className="text-xs font-mono text-white/40 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                GPS: {config.latitude.toFixed(4)}, {config.longitude.toFixed(4)}
              </span>
            )}
          </div>
        </div>

        {/* Next Prayer Card */}
        <div className="bg-gradient-to-br from-[--color-primary]/30 via-[--color-surface]/60 to-[--color-background] backdrop-blur-2xl rounded-3xl p-6 border border-[--color-secondary]/30 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-widest uppercase text-[--color-secondary]">
                Jadwal Sholat Berikutnya
              </span>
              <Radio className="w-4 h-4 text-[--color-secondary] animate-pulse" />
            </div>
            <p className="text-3xl font-extrabold font-display text-[--color-secondary] mt-2 tracking-wide">
              {nextPrayerLabel}
            </p>
            {timeRemainingLabel && (
              <p className="text-sm font-sans font-medium text-white/70 mt-1">
                {timeRemainingLabel}
              </p>
            )}
          </div>

          <div className="mt-4">
            {nextPrayer?.status === "adzan" && (
              <span className="inline-flex items-center gap-2 text-xs font-bold text-[--color-secondary] bg-[--color-secondary]/20 border border-[--color-secondary]/40 px-3.5 py-1.5 rounded-full animate-pulse shadow-md">
                <Radio className="w-3.5 h-3.5" />
                Waktu Adzan Berlangsung
              </span>
            )}
            {nextPrayer?.status === "iqomah" && (
              <span className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-400/20 border border-emerald-400/40 px-3.5 py-1.5 rounded-full animate-pulse shadow-md">
                <Radio className="w-3.5 h-3.5" />
                Waktu Iqomah Berlangsung
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <StatCard
          icon={<Radio className="w-6 h-6 text-[--color-secondary]" />}
          label="Running Text Aktif"
          value={String(activeTextsCount)}
          sub={`dari total ${runningTexts.length} pengumuman`}
          href="/admin/content"
        />
        <StatCard
          icon={<ImageIcon className="w-6 h-6 text-[--color-secondary]" />}
          label="Waktu Sholat Hari Ini"
          value={String(todayPrayersCount)}
          sub="terkalkulasi otomatis sesuai koordinat"
          href="/admin/prayer"
        />
      </div>

      {/* Quick Actions */}
      <div className="space-y-4 pt-2">
        <h3 className="text-xs font-bold tracking-widest uppercase text-white/40">
          Menu Navigasi Cepat
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickAction
            href="/display"
            icon={<Monitor className="w-5 h-5" />}
            label="Buka Tampilan TV"
            desc="Tampilkan layar utama digital signage masjid"
            accent
          />
          <QuickAction
            href="/admin/setup"
            icon={<MapPin className="w-5 h-5" />}
            label="Setup Profil Masjid"
            desc="Nama, alamat, & koordinat GPS"
          />
          <QuickAction
            href="/admin/prayer"
            icon={<Clock className="w-5 h-5" />}
            label="Jadwal & Iqomah"
            desc="Atur metode hitung & pewaktu iqomah"
          />
          <QuickAction
            href="/admin/content"
            icon={<Radio className="w-5 h-5" />}
            label="Kelola Running Text"
            desc="Tambah & urutkan pengumuman berjalan"
          />
          <QuickAction
            href="/admin/media"
            icon={<ImageIcon className="w-5 h-5" />}
            label="Upload Galeri & Audio"
            desc="Foto slideshow & file adzan MP3"
          />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  href: string;
}

/** Card statistik konten dengan link ke halaman terkait */
function StatCard({ icon, label, value, sub, href }: StatCardProps) {
  return (
    <Link
      href={href}
      className="bg-[--color-surface]/60 backdrop-blur-2xl rounded-3xl p-6 border border-[--color-secondary]/20 hover:border-[--color-secondary]/40 transition-all duration-300 group shadow-xl hover:-translate-y-1"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[--color-secondary]/20 to-[--color-primary]/20 border border-[--color-secondary]/30 flex items-center justify-center shadow-md">
          {icon}
        </div>
        <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-[--color-secondary] group-hover:translate-x-1 transition-all" />
      </div>
      <p className="text-3xl font-bold font-mono text-white tracking-tight">{value}</p>
      <p className="text-sm font-bold font-display text-[--color-secondary] mt-1 leading-tight">
        {label}
      </p>
      <p className="text-xs font-sans text-white/40 mt-1">{sub}</p>
    </Link>
  );
}

interface QuickActionProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  desc: string;
  accent?: boolean;
}

/** Tombol navigasi cepat menuju halaman admin atau display */
function QuickAction({ href, icon, label, desc, accent }: QuickActionProps) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-4 rounded-2xl p-4 border transition-all duration-300 group shadow-lg hover:-translate-y-0.5 ${
        accent
          ? "bg-gradient-to-r from-[--color-primary]/30 via-[--color-primary]/20 to-[--color-surface]/60 border-[--color-secondary]/40 hover:border-[--color-secondary]/60"
          : "bg-[--color-surface]/50 backdrop-blur-xl border-white/5 hover:border-[--color-secondary]/30 hover:bg-white/5"
      }`}
    >
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${
          accent
            ? "bg-[--color-secondary]/20 border-[--color-secondary]/40 text-[--color-secondary]"
            : "bg-white/5 border-white/10 text-white/70 group-hover:text-[--color-secondary] group-hover:border-[--color-secondary]/30"
        }`}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-bold font-display leading-tight ${
            accent ? "text-[--color-secondary]" : "text-white group-hover:text-[--color-secondary] transition-colors"
          }`}
        >
          {label}
        </p>
        <p className="text-xs font-sans text-white/50 mt-0.5 truncate">{desc}</p>
      </div>
      <ChevronRight
        className={`w-5 h-5 shrink-0 group-hover:translate-x-1 transition-transform ${
          accent ? "text-[--color-secondary]" : "text-white/30 group-hover:text-[--color-secondary]"
        }`}
      />
    </Link>
  );
}
