import type { MetadataRoute } from "next";
import { getAllProperties } from "@/lib/properties";
import { site } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const properties = await getAllProperties();
  const now = new Date();

  const staticRoutes = ["", "/proprietes", "/services", "/contact"].map((path) => ({
    url: `${site.url}${path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  return [
    ...staticRoutes,
    ...properties.map((p) => ({
      url: `${site.url}/proprietes/${p.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
