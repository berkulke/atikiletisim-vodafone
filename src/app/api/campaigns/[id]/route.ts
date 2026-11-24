import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { campaignInputSchema } from "@/lib/validators";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  const { id } = await context.params;
  try {
    const body: unknown = await request.json();
    const parsed = campaignInputSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Geçersiz güncelleme verisi" },
        { status: 400 }
      );
    }

    const d = parsed.data;
    const updated = await prisma.campaign.update({
      where: { id },
      data: {
        ...(d.title !== undefined ? { title: d.title } : {}),
        ...(d.summary !== undefined ? { summary: d.summary } : {}),
        ...(d.description !== undefined ? { description: d.description } : {}),
        ...(d.imageUrl !== undefined ? { imageUrl: d.imageUrl } : {}),
        ...(d.targetUrl !== undefined ? { targetUrl: d.targetUrl || null } : {}),
        ...(d.categorySlug !== undefined ? { categorySlug: d.categorySlug } : {}),
        ...(d.categoryName !== undefined ? { categoryName: d.categoryName } : {}),
        ...(d.badgeLabel !== undefined ? { badgeLabel: d.badgeLabel } : {}),
        ...(d.badgeColor !== undefined ? { badgeColor: d.badgeColor } : {}),
        ...(d.tags !== undefined ? { tags: d.tags } : {}),
        ...(d.isFeatured !== undefined ? { isFeatured: d.isFeatured } : {}),
        ...(d.isActive !== undefined ? { isActive: d.isActive } : {}),
      },
    });

    return NextResponse.json({ campaign: updated });
  } catch {
    return NextResponse.json({ error: "Kampanya güncellenemedi" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  const { id } = await context.params;
  try {
    await prisma.campaign.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Kampanya silinemedi" }, { status: 500 });
  }
}
