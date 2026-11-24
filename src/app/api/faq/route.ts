import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { faqItemSchema } from "@/lib/validators";
import { getOrSetCache, invalidateCacheKeys } from "@/lib/redis";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const includeInactive = searchParams.get("includeInactive") === "true";
  const session = includeInactive ? await getAdminSession() : null;

  if (includeInactive && session) {
    const items = await prisma.faqItem.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
    return NextResponse.json({ items });
  }

  const items = await getOrSetCache("faq:active:v1", 180, async () =>
    prisma.faqItem.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    })
  );

  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  try {
    const body: unknown = await request.json();
    const parsed = faqItemSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Geçersiz soru verisi" },
        { status: 400 }
      );
    }

    const item = await prisma.faqItem.create({
      data: parsed.data,
    });

    await invalidateCacheKeys(["faq:active:v1"]);
    return NextResponse.json({ item }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Soru eklenemedi" }, { status: 500 });
  }
}
