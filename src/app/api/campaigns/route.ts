import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { campaignInputSchema } from "@/lib/validators";
import { slugifyTr } from "@/lib/slug";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const tag = searchParams.get("tag");
    const source = searchParams.get("source");
    const q = searchParams.get("q")?.trim();
    const includeInactive = searchParams.get("includeInactive") === "true";

    const session = includeInactive ? await getAdminSession() : null;
    const onlyActive = !(includeInactive && session);

    const campaigns = await prisma.campaign.findMany({
      where: {
        ...(onlyActive ? { isActive: true } : {}),
        ...(category && category !== "all" ? { categorySlug: category } : {}),
        ...(source === "VODAFONE_SYNC" || source === "ADMIN_MANUAL" ? { source } : {}),
        ...(tag && tag !== "Tümü" ? { tags: { has: tag } } : {}),
        ...(q
          ? {
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { summary: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: [{ isFeatured: "desc" }, { source: "desc" }, { updatedAt: "desc" }],
    });

    return NextResponse.json({ campaigns });
  } catch {
    return NextResponse.json(
      { error: "Kampanyalar yüklenemedi" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  try {
    const body: unknown = await request.json();
    const parsed = campaignInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Geçersiz kampanya verisi" },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const baseSlug = slugifyTr(data.title) || "kampanya";
    const slug = `manual-${baseSlug}-${Date.now().toString(36)}`;

    const created = await prisma.campaign.create({
      data: {
        slug,
        title: data.title,
        summary: data.summary,
        description: data.description,
        imageUrl: data.imageUrl,
        targetUrl: data.targetUrl || null,
        categorySlug: data.categorySlug,
        categoryName: data.categoryName,
        badgeLabel: data.badgeLabel || null,
        badgeColor: data.badgeColor || null,
        tags: data.tags,
        source: "ADMIN_MANUAL",
        isFeatured: data.isFeatured,
        isActive: data.isActive,
        startsAt: data.startsAt ? new Date(data.startsAt) : null,
        endsAt: data.endsAt ? new Date(data.endsAt) : null,
      },
    });

    return NextResponse.json({ campaign: created }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Kampanya oluşturulamadı" },
      { status: 500 }
    );
  }
}
