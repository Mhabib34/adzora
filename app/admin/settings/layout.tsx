import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pengaturan Utama",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
