import type { Metadata } from "next";
import { PinLock } from "../../components/admin/PinLock";
import { Sidebar } from "../../components/admin/Sidebar";

export const metadata: Metadata = {
  title: "Adzora Admin",
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
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </PinLock>
  );
}
