import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/url";

// Keep private guest, booking and admin pages out of search results.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/trip", "/reservation", "/book", "/verify", "/go", "/r/", "/insider", "/api"] },
    sitemap: siteUrl("/sitemap.xml"),
  };
}
