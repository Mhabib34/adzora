import type { Metadata } from "next";
import { DisplayRoot } from "../../components/display/DisplayRoot";

export const metadata: Metadata = {
  title: "Adzora Display",
};

/**
 * Display page — fullscreen TV view.
 * Applies display-mode class to suppress cursor and scrollbars.
 */
export default function DisplayPage() {
  return (
    <main className="display-mode tv-safe-zone min-h-screen w-full">
      <DisplayRoot />
    </main>
  );
}
