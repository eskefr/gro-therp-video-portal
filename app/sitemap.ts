import type { MetadataRoute } from "next";
import { PUBLIC_SITE_URL } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    {
      url: `${PUBLIC_SITE_URL}/archive`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${PUBLIC_SITE_URL}/apply`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
