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
  Wifi,
<<<<<<< HEAD
=======
  Info,
>>>>>>> bc14fcc (feat: add magic click admin panel)
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
    <div className="min-h-screen bg-[--color-background] text-white p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[--color-primary]">
            Dashboard
          </h1>
          <p className="text-sm text-white/50 mt-0.5">
            Panel kontrol Adzora Digital Signage
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm bg-white/5 rounded-lg px-3 py-2">
          <Clock className="w-4 h-4 text-[--color-secondary]" />
          <span className="font-mono font-semibold text-[--color-secondary]">
            {currentTimeLabel}
          </span>
        </div>
      </div>

      {/* Setup Warning Banner */}
      {!setupComplete && (
        <Link
          href="/admin/setup"
          className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 hover:bg-amber-500/15 transition-colors group"
        >
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-400">
              Setup belum selesai
            </p>
            <p className="text-xs text-amber-400/70 mt-0.5">
              Lengkapi informasi masjid agar jadwal sholat dapat dihitung dengan
              benar.
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      )}

<<<<<<< HEAD
=======
      {/* Magic Click Info Banner */}
      <div className="flex items-start gap-3 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
          <Info className="w-4 h-4 text-blue-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-blue-400">
            Cara masuk ke Admin dari layar Display TV
          </p>
          <p className="text-xs text-blue-400/80 mt-1 leading-relaxed">
            Tekan tombol <strong>OK / Enter 3 kali</strong> secara cepat pada remote TV Anda, atau arahkan mouse ke <strong>pojok kanan bawah layar lalu klik 5 kali</strong>.
          </p>
        </div>
      </div>

>>>>>>> bc14fcc (feat: add magic click admin panel)
      {/* Mosque Info Card */}
      <div className="bg-[--color-surface] rounded-2xl p-5 border border-white/5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[--color-primary]/20 flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5 text-[--color-primary]" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-lg leading-tight truncate">
              {config.name}
            </h2>
            {config.address && (
              <p className="text-sm text-white/50 mt-0.5 truncate">
                {config.address}
                {config.city ? `, ${config.city}` : ""}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2">
              {setupComplete ? (
                <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                  <CheckCircle className="w-3 h-3" />
                  Setup selesai
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
                  <AlertCircle className="w-3 h-3" />
                  Belum dikonfigurasi
                </span>
              )}
              {config.latitude !== 0 && (
                <span className="text-xs text-white/30 font-mono">
                  {config.latitude.toFixed(4)}, {config.longitude.toFixed(4)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Next Prayer Card */}
      <div className="bg-linear-to-br from-[--color-primary]/30 to-[--color-primary]/10 rounded-2xl p-5 border border-[--color-primary]/20">
        <p className="text-xs text-white/50 uppercase tracking-widest font-semibold mb-1">
          Waktu Sholat Berikutnya
        </p>
        <p className="text-2xl font-bold text-[--color-secondary]">
          {nextPrayerLabel}
        </p>
        {timeRemainingLabel && (
          <p className="text-sm text-white/60 mt-1">{timeRemainingLabel}</p>
        )}
        {nextPrayer?.status === "adzan" && (
          <span className="inline-flex items-center gap-1 mt-2 text-xs text-[--color-secondary] bg-[--color-secondary]/10 px-2 py-0.5 rounded-full animate-pulse">
            <Radio className="w-3 h-3" />
            Adzan berlangsung
          </span>
        )}
        {nextPrayer?.status === "iqomah" && (
          <span className="inline-flex items-center gap-1 mt-2 text-xs text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full animate-pulse">
            <Radio className="w-3 h-3" />
            Iqomah berlangsung
          </span>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={<Radio className="w-5 h-5 text-[--color-secondary]" />}
          label="Running Text Aktif"
          value={String(activeTextsCount)}
          sub={`dari ${runningTexts.length} total`}
          href="/admin/content"
        />
        <StatCard
          icon={<ImageIcon className="w-5 h-5 text-[--color-secondary]" />}
          label="Jadwal Hari Ini"
          value={String(todayPrayersCount)}
          sub="waktu sholat terhitung"
          href="/admin/prayer"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-xs text-white/40 uppercase tracking-widest font-semibold mb-3">
          Aksi Cepat
        </h3>
        <div className="space-y-2">
          <QuickAction
            href="/display"
            icon={<Monitor className="w-5 h-5" />}
            label="Buka Tampilan Masjid"
            desc="Tampilkan di TV / layar masjid"
            accent
          />
          <QuickAction
            href="/admin/setup"
            icon={<MapPin className="w-5 h-5" />}
            label="Setup Masjid"
            desc="Nama, lokasi, dan koordinat"
          />
          <QuickAction
            href="/admin/prayer"
            icon={<Clock className="w-5 h-5" />}
            label="Konfigurasi Jadwal Sholat"
            desc="Metode kalkulasi, offset, iqomah"
          />
          <QuickAction
            href="/admin/content"
            icon={<Radio className="w-5 h-5" />}
            label="Kelola Running Text"
            desc="Tambah, edit, dan urutkan teks berjalan"
          />
          <QuickAction
            href="/admin/media"
            icon={<ImageIcon className="w-5 h-5" />}
            label="Upload Media"
            desc="Foto slideshow dan audio adzan"
          />
        </div>
      </div>

      {/* Footer status */}
      <div className="flex items-center justify-center gap-2 text-xs text-white/20 pt-2">
        <Wifi className="w-3 h-3" />
        <span>Adzora v1.0 — Digital Signage Masjid</span>
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
      className="bg-[--color-surface] rounded-2xl p-4 border border-white/5 hover:border-[--color-primary]/30 transition-colors group"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="w-9 h-9 rounded-lg bg-[--color-secondary]/10 flex items-center justify-center">
          {icon}
        </div>
        <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/40 group-hover:translate-x-0.5 transition-all" />
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs font-semibold text-white/60 mt-0.5 leading-tight">
        {label}
      </p>
      <p className="text-xs text-white/30 mt-0.5">{sub}</p>
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
      className={`flex items-center gap-4 rounded-xl px-4 py-3 border transition-colors group ${
        accent
          ? "bg-[--color-primary]/20 border-[--color-primary]/30 hover:bg-[--color-primary]/30"
          : "bg-[--color-surface] border-white/5 hover:border-white/10"
      }`}
    >
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
          accent
            ? "bg-[--color-primary]/30 text-[--color-secondary]"
            : "bg-white/5 text-white/60"
        }`}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-semibold leading-tight ${
            accent ? "text-[--color-secondary]" : "text-white"
          }`}
        >
          {label}
        </p>
        <p className="text-xs text-white/40 mt-0.5 truncate">{desc}</p>
      </div>
      <ChevronRight
        className={`w-4 h-4 shrink-0 group-hover:translate-x-0.5 transition-transform ${
          accent ? "text-[--color-secondary]/60" : "text-white/20"
        }`}
      />
    </Link>
  );
}
