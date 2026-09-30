import type { Metadata } from "next";
import { PinLock } from "../../components/admin/PinLock";
import { Sidebar } from "../../components/admin/Sidebar";

export const metadata: Metadata = {
  title: {
    template: "%s | Adzora Admin",
    default: "Dashboard | Adzora Admin",
  },
};

/**
 * Admin layout — wraps all admin pages with PIN protection and sidebar nav.
 * PinLock renders a blocking overlay until the correct PIN is entered.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PinLock>
      <div className="flex h-screen overflow-hidden bg-[--color-background] text-white relative">
        {/* Background Ambient Glow Accent */}
        <div
          className="fixed top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none opacity-15 blur-3xl z-0"
          style={{
            background:
              "radial-gradient(circle, var(--color-primary) 0%, var(--color-secondary) 60%, transparent 80%)",
          }}
        />
        <div
          className="fixed bottom-0 left-64 w-[400px] h-[400px] rounded-full pointer-events-none opacity-10 blur-3xl z-0"
          style={{
            background:
              "radial-gradient(circle, var(--color-secondary) 0%, transparent 70%)",
          }}
        />

        <Sidebar />
        <main className="flex-1 overflow-y-auto p-8 relative z-10 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-8 pb-12">
            {children}
          </div>
        </main>
      </div>
    </PinLock>
  );
}
