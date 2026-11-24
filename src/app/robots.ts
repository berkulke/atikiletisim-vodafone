import type { MetadataRoute } from "next";
import { getSiteSettings } from "@/lib/settings";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getSiteSettings();
  const baseUrl = settings.siteUrl.replace(/\/$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/kampanyalar", "/urunler", "/iletisim", "/sayfa/"],
        disallow: ["/admin", "/api/", "/sepet"],
      },
      {
        userAgent: ["GPTBot", "Google-Extended", "PerplexityBot", "ClaudeBot"],
        allow: ["/", "/kampanyalar", "/urunler", "/iletisim", "/llms.txt"],
        disallow: ["/admin", "/api/", "/sepet"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
