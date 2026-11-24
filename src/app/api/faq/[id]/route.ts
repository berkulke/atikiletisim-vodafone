import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { faqItemSchema } from "@/lib/validators";
import { invalidateCacheKeys } from "@/lib/redis";

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
    const parsed = faqItemSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Geçersiz güncelleme" },
        { status: 400 }
      );
    }

    const d = parsed.data;
    const item = await prisma.faqItem.update({
      where: { id },
      data: {
        ...(d.question !== undefined ? { question: d.question } : {}),
        ...(d.answer !== undefined ? { answer: d.answer } : {}),
        ...(d.category !== undefined ? { category: d.category } : {}),
        ...(d.sortOrder !== undefined ? { sortOrder: d.sortOrder } : {}),
        ...(d.isActive !== undefined ? { isActive: d.isActive } : {}),
      },
    });

    await invalidateCacheKeys(["faq:active:v1"]);
    return NextResponse.json({ item });
  } catch {
    return NextResponse.json({ error: "Soru güncellenemedi" }, { status: 500 });
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
    await prisma.faqItem.delete({ where: { id } });
    await invalidateCacheKeys(["faq:active:v1"]);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Soru silinemedi" }, { status: 500 });
  }
}
