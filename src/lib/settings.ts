import { prisma } from "@/lib/prisma";
import { getOrSetCache } from "@/lib/redis";

export interface SiteSettingsDto {
  id: string;
  brandName: string;
  tagline: string;
  siteUrl: string;
  logoUrl: string;
  faviconUrl: string;
  phone: string;
  whatsappPhone: string;
  whatsappMessage: string;
  email: string;
  instagramUrl: string;
  address: string;
  city: string;
  district: string;
  geoRegion: string;
  geoLatitude: string;
  geoLongitude: string;
  workingHours: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  ogImageUrl: string;
  cookiebotId: string;
}

export const DEFAULT_SITE_SETTINGS: SiteSettingsDto = {
  id: "default",
  brandName: "Atik İletişim",
  tagline: "Vodafone Yetkili Satış & İletişim Merkezi",
  siteUrl: "https://atikiletisim.com",
  logoUrl: "",
  faviconUrl: "",
  phone: "+90 542 000 00 00",
  whatsappPhone: "905420000000",
  whatsappMessage:
    "Merhaba Atik İletişim, cihaz ve tarife kampanyaları hakkında bilgi almak istiyorum.",
  email: "iletisim@atikiletisim.com",
  instagramUrl: "https://www.instagram.com/atikiletisim/",
  address: "Atik İletişim Mağazası, Türkiye",
  city: "İstanbul",
  district: "Merkez",
  geoRegion: "TR-34",
  geoLatitude: "41.0082",
  geoLongitude: "28.9784",
  workingHours: "Hafta içi & Cumartesi: 09:00 - 20:00",
  seoTitle: "Atik İletişim | Vodafone Türkiye Tarifeler, Cihazlar ve Kampanyalar",
  seoDescription:
    "Atik İletişim güvencesiyle en yeni akıllı telefonlar, faturalı Vodafone tarifeleri, fiber ev interneti ve güncel kampanyalar.",
  seoKeywords:
    "Atik İletişim, Vodafone, faturalı tarifeler, telefon kampanyaları, ev interneti",
  ogImageUrl: "",
  cookiebotId: "",
};

export async function getSiteSettings(): Promise<SiteSettingsDto> {
  return getOrSetCache("site_settings:default", 300, async () => {
    try {
      const existing = await prisma.siteSettings.findUnique({
        where: { id: "default" },
      });
      if (existing) {
        return existing;
      }
      return await prisma.siteSettings.upsert({
        where: { id: "default" },
        update: {},
        create: DEFAULT_SITE_SETTINGS,
      });
    } catch {
      return DEFAULT_SITE_SETTINGS;
    }
  });
}

export async function getPublishedNavPages(): Promise<
  Array<{ id: string; slug: string; title: string; showInHeader: boolean; showInFooter: boolean }>
> {
  try {
    return await prisma.customPage.findMany({
      where: { isPublished: true },
      select: {
        id: true,
        slug: true,
        title: true,
        showInHeader: true,
        showInFooter: true,
      },
      orderBy: { createdAt: "asc" },
    });
  } catch {
    return [];
  }
}
