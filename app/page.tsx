import { redirect } from "next/navigation";

/**
 * Root page — immediately redirects to the display screen.
 * The display screen is the default view for mosque TV/monitor usage.
 */
export default function RootPage() {
  redirect("/display");
}
