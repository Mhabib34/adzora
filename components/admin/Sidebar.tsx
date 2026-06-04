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
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
  { href: "/admin/setup", label: "Setup Awal", icon: <Settings size={20} /> },
  { href: "/admin/prayer", label: "Waktu Sholat", icon: <Clock size={20} /> },
  {
    href: "/admin/content",
    label: "Running Text",
    icon: <FileText size={20} />,
  },
  { href: "/admin/media", label: "Media", icon: <ImageIcon size={20} /> },
  { href: "/admin/themes", label: "Tema", icon: <Palette size={20} /> },
  {
    href: "/admin/settings",
    label: "Pengaturan",
    icon: <Settings size={20} />,
  },
];

/**
 * Admin sidebar navigation.
 * Highlights the current active route.
 */
export const Sidebar = memo(function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-56 flex-col border-r border-surface bg-background">
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-surface px-5 py-5">
        <Tv size={24} className="text-secondary" />
        <span
          className="font-bold text-primary-foreground"
          style={{ fontSize: "1.25rem" }}
        >
          Adzora
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex flex-col gap-1 px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors focus-visible:outline-[3px] ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-primary-foreground opacity-60 hover:bg-surface hover:opacity-100"
              }`}
              style={{ fontSize: "0.95rem" }}
            >
              <span className="shrink-0">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer — link ke display */}
      <div className="mt-auto border-t border-surface px-3 py-4">
        <Link
          href="/display"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-secondary opacity-70 transition-colors hover:opacity-100 focus-visible:outline-[3px]"
          style={{ fontSize: "0.9rem" }}
        >
          <Tv size={18} />
          <span>Lihat Display</span>
        </Link>
      </div>
    </aside>
  );
});
