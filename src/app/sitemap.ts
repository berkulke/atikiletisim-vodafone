import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/settings";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settings = await getSiteSettings();
  const baseUrl = settings.siteUrl.replace(/\/$/, "");

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/kampanyalar`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${baseUrl}/urunler`, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/subelerimiz`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/blog`, changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/kurumsal/hakkimizda`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/kurumsal/misyon-vizyon`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/kurumsal/sss`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/iletisim`, changeFrequency: "monthly", priority: 0.7 },
  ];

  try {
    const [products, pages] = await Promise.all([
      prisma.product.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
      }),
      prisma.customPage.findMany({
        where: { isPublished: true },
        select: { slug: true, updatedAt: true },
      }),
    ]);

    const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
      url: `${baseUrl}/urunler/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    const pageRoutes: MetadataRoute.Sitemap = pages.map((pg) => ({
      url: `${baseUrl}/sayfa/${pg.slug}`,
      lastModified: pg.updatedAt,
      changeFrequency: "monthly",
      priority: 0.6,
    }));

    return [...staticRoutes, ...productRoutes, ...pageRoutes];
  } catch {
    return staticRoutes;
  }
}
