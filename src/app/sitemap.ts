import type { MetadataRoute } from "next";
import { listedProperties, propertyPath } from "@/config/site";
import { siteUrl } from "@/lib/url";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["/", "/stays", "/experiences", "/share", "/extended-stays", "/policies", ...listedProperties.map((p) => propertyPath(p.slug))];
  return pages.map((path) => ({ url: siteUrl(path), changeFrequency: "weekly", priority: path === "/" ? 1 : 0.7 }));
}
