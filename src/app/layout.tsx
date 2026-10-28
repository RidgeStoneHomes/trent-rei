import type { Metadata } from "next";
import "./globals.css";
import { site } from "@/config/site";
import { siteUrl } from "@/lib/url";

const description = `Two private luxury homes on Lake Texoma. Book direct for the best rate, no platform fees, and private perks with local partners.`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: `${site.brand} · Luxury Lake Texoma Vacation Rentals`, template: `%s · ${site.brand}` },
  description,
  openGraph: { type: "website", siteName: site.brand, title: `${site.brand} · Luxury Lake Texoma Vacation Rentals`, description, locale: "en_US" },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Marks JS as available before first paint, so scroll-reveal content can start hidden */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
