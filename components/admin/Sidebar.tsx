"use client";

import { memo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Clock,
  FileText,
  Image as ImageIcon,
  Palette,
  Settings,
  Tv,
  Sparkles,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: <LayoutDashboard size={19} /> },
  { href: "/admin/setup", label: "Setup Awal", icon: <Settings size={19} /> },
  { href: "/admin/prayer", label: "Waktu Sholat", icon: <Clock size={19} /> },
  {
    href: "/admin/content",
    label: "Running Text",
    icon: <FileText size={19} />,
  },
  { href: "/admin/media", label: "Media & Audio", icon: <ImageIcon size={19} /> },
  { href: "/admin/themes", label: "Tema & Warna", icon: <Palette size={19} /> },
  {
    href: "/admin/settings",
    label: "Pengaturan",
    icon: <Settings size={19} />,
  },
];

/**
 * Admin sidebar navigation.
 * Highlights active route with Islamic Dark Luxury glassmorphic styling.
 */
export const Sidebar = memo(function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-[--color-secondary]/15 bg-[--color-surface]/60 backdrop-blur-2xl text-white shrink-0 z-30 shadow-2xl">
      {/* Brand Header */}
      <div className="flex items-center gap-3.5 border-b border-white/5 px-6 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[--color-secondary]/30 to-[--color-primary]/30 border border-[--color-secondary]/30 shadow-md">
          <Tv size={22} className="text-[--color-secondary]" />
        </div>
        <div className="flex flex-col">
          <span className="font-display text-xl font-bold tracking-wider text-white">
            Adzora
          </span>
          <span className="text-[10px] font-semibold tracking-widest uppercase text-[--color-secondary]">
            Digital Signage
          </span>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex flex-col gap-1.5 px-4 py-6 flex-1 overflow-y-auto">
        <p className="px-3 text-[10px] font-bold tracking-widest uppercase text-white/40 mb-1">
          Menu Utama
        </p>
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3.5 rounded-xl px-3.5 py-3 transition-all duration-200 focus-visible:outline-none ${
                isActive
                  ? "bg-gradient-to-r from-[--color-primary] to-[--color-primary]/80 text-white font-semibold shadow-lg shadow-[--color-primary]/20 border border-[--color-secondary]/40"
                  : "text-white/60 hover:text-white hover:bg-white/5 hover:translate-x-1"
              }`}
              style={{ fontSize: "0.925rem" }}
            >
              <span
                className={`shrink-0 transition-colors ${
                  isActive ? "text-[--color-secondary]" : "text-white/50"
                }`}
              >
                {item.icon}
              </span>
              <span className="truncate">{item.label}</span>
              {isActive && (
                <Sparkles className="w-3.5 h-3.5 ml-auto text-[--color-secondary] animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer — Link ke Display */}
      <div className="border-t border-white/5 p-4">
        <Link
          href="/display"
          className="flex items-center justify-between rounded-xl bg-gradient-to-r from-[--color-secondary]/20 to-transparent border border-[--color-secondary]/30 px-4 py-3 text-secondary font-display font-semibold transition-all hover:bg-[--color-secondary]/30 hover:shadow-lg focus-visible:outline-none group"
          style={{ fontSize: "0.875rem" }}
        >
          <div className="flex items-center gap-3">
            <Tv size={18} className="text-[--color-secondary]" />
            <span>Tampilan Display</span>
          </div>
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
        </Link>
      </div>
    </aside>
  );
});
