import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Setup Awal",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
