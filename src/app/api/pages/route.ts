import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { customPageSchema } from "@/lib/validators";
import { slugifyTr } from "@/lib/slug";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const includeAll = searchParams.get("all") === "true";
  const session = includeAll ? await getAdminSession() : null;

  const pages = await prisma.customPage.findMany({
    where: includeAll && session ? {} : { isPublished: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ pages });
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  try {
    const body: unknown = await request.json();
    const parsed = customPageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Geçersiz sayfa verisi" },
        { status: 400 }
      );
    }

    const d = parsed.data;
    const rawSlug = d.slug ? slugifyTr(d.slug) : slugifyTr(d.title);
    const slug = rawSlug || `sayfa-${Date.now().toString(36)}`;

    const existing = await prisma.customPage.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: "Bu URL (slug) ile başka bir sayfa zaten var" },
        { status: 409 }
      );
    }

    const page = await prisma.customPage.create({
      data: {
        slug,
        title: d.title,
        summary: d.summary ?? null,
        content: d.content,
        metaTitle: d.metaTitle ?? null,
        metaDescription: d.metaDescription ?? null,
        showInHeader: d.showInHeader,
        showInFooter: d.showInFooter,
        isPublished: d.isPublished,
      },
    });

    revalidatePath("/", "layout");
    return NextResponse.json({ page }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Sayfa oluşturulamadı" },
      { status: 500 }
    );
  }
}
