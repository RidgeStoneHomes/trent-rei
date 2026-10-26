import type { Metadata } from "next";
import "./globals.css";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: { default: `${site.brand} — ${site.tagline}`, template: `%s · ${site.brand}` },
  description: `Book direct and save. ${site.tagline}, with private partner perks for our guests.`,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
