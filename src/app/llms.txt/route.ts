import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/settings";

export async function GET() {
  const settings = await getSiteSettings();
  const baseUrl = settings.siteUrl.replace(/\/$/, "");

  let products: Array<{ title: string; slug: string; price: unknown; category: string }> = [];
  let campaigns: Array<{ title: string; categoryName: string }> = [];

  try {
    [products, campaigns] = await Promise.all([
      prisma.product.findMany({
        where: { isActive: true },
        select: { title: true, slug: true, price: true, category: true },
        take: 15,
      }),
      prisma.campaign.findMany({
        where: { isActive: true },
        select: { title: true, categoryName: true },
        take: 15,
      }),
    ]);
  } catch {
    // Fallback when DB is unavailable
  }

  const lines = [
    `# ${settings.brandName}`,
    "",
    `> ${settings.seoDescription}`,
    "",
    "## İletişim ve Konum (GEO)",
    `- Web Sitesi: ${baseUrl}`,
    `- Telefon: ${settings.phone}`,
    `- E-posta: ${settings.email}`,
    `- Adres: ${settings.address} (${settings.district} / ${settings.city})`,
    `- Instagram: ${settings.instagramUrl}`,
    `- Çalışma Saatleri: ${settings.workingHours}`,
    "",
    "## Öne Çıkan Ürünler ve Tarifeler",
    ...products.map(
      (p) => `- [${p.title}](${baseUrl}/urunler/${p.slug}) (${p.category}) — ${String(p.price)} TL`
    ),
    "",
    "## Güncel Kampanyalar",
    ...campaigns.map((c) => `- ${c.title} (${c.categoryName})`),
  ];

  return new NextResponse(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
