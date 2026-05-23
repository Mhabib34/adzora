import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Konten & Acara",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
