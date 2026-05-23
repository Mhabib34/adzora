import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Waktu Sholat",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
