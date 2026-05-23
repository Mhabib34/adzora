import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tema & Tampilan",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
