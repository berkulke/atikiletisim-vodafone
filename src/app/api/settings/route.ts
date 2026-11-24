import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { getSiteSettings } from "@/lib/settings";
import { siteSettingsSchema } from "@/lib/validators";
import { invalidateCacheKeys } from "@/lib/redis";

export async function GET() {
  const settings = await getSiteSettings();
  return NextResponse.json({ settings });
}

export async function PUT(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  try {
    const body: unknown = await request.json();
    const parsed = siteSettingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Geçersiz ayar verisi" },
        { status: 400 }
      );
    }

    const d = parsed.data;
    const settings = await prisma.siteSettings.upsert({
      where: { id: "default" },
      update: {
        brandName: d.brandName,
        tagline: d.tagline,
        siteUrl: d.siteUrl,
        logoUrl: d.logoUrl ?? "",
        faviconUrl: d.faviconUrl ?? "",
        phone: d.phone,
        whatsappPhone: d.whatsappPhone,
        whatsappMessage: d.whatsappMessage,
        email: d.email,
        instagramUrl: d.instagramUrl ?? "",
        address: d.address,
        city: d.city,
        district: d.district,
        geoRegion: d.geoRegion,
        geoLatitude: d.geoLatitude,
        geoLongitude: d.geoLongitude,
        workingHours: d.workingHours,
        seoTitle: d.seoTitle,
        seoDescription: d.seoDescription,
        seoKeywords: d.seoKeywords,
        ogImageUrl: d.ogImageUrl ?? "",
        cookiebotId: d.cookiebotId ?? "",
      },
      create: {
        id: "default",
        brandName: d.brandName,
        tagline: d.tagline,
        siteUrl: d.siteUrl,
        logoUrl: d.logoUrl ?? "",
        faviconUrl: d.faviconUrl ?? "",
        phone: d.phone,
        whatsappPhone: d.whatsappPhone,
        whatsappMessage: d.whatsappMessage,
        email: d.email,
        instagramUrl: d.instagramUrl ?? "",
        address: d.address,
        city: d.city,
        district: d.district,
        geoRegion: d.geoRegion,
        geoLatitude: d.geoLatitude,
        geoLongitude: d.geoLongitude,
        workingHours: d.workingHours,
        seoTitle: d.seoTitle,
        seoDescription: d.seoDescription,
        seoKeywords: d.seoKeywords,
        ogImageUrl: d.ogImageUrl ?? "",
        cookiebotId: d.cookiebotId ?? "",
      },
    });

    await invalidateCacheKeys(["site_settings:default"]);
    revalidatePath("/", "layout");
    return NextResponse.json({ settings });
  } catch {
    return NextResponse.json(
      { error: "Ayarlar kaydedilemedi" },
      { status: 500 }
    );
  }
}
