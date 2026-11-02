import type { MetadataRoute } from "next";
import { properties } from "@/config/site";
import { siteUrl } from "@/lib/url";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["/", "/stays", "/experiences", "/share", "/policies", ...properties.map((p) => `/stays/${p.slug}`)];
  return pages.map((path) => ({ url: siteUrl(path), changeFrequency: "weekly", priority: path === "/" ? 1 : 0.7 }));
}
