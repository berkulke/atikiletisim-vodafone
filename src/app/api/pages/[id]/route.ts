import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { customPageSchema } from "@/lib/validators";
import { slugifyTr } from "@/lib/slug";

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
    const parsed = customPageSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Geçersiz güncelleme" },
        { status: 400 }
      );
    }

    const d = parsed.data;
    const page = await prisma.customPage.update({
      where: { id },
      data: {
        ...(d.title !== undefined ? { title: d.title } : {}),
        ...(d.slug !== undefined && d.slug.trim() ? { slug: slugifyTr(d.slug) } : {}),
        ...(d.summary !== undefined ? { summary: d.summary } : {}),
        ...(d.content !== undefined ? { content: d.content } : {}),
        ...(d.metaTitle !== undefined ? { metaTitle: d.metaTitle } : {}),
        ...(d.metaDescription !== undefined ? { metaDescription: d.metaDescription } : {}),
        ...(d.showInHeader !== undefined ? { showInHeader: d.showInHeader } : {}),
        ...(d.showInFooter !== undefined ? { showInFooter: d.showInFooter } : {}),
        ...(d.isPublished !== undefined ? { isPublished: d.isPublished } : {}),
      },
    });

    revalidatePath("/", "layout");
    return NextResponse.json({ page });
  } catch {
    return NextResponse.json({ error: "Sayfa güncellenemedi" }, { status: 500 });
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
    await prisma.customPage.delete({ where: { id } });
    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Sayfa silinemedi" }, { status: 500 });
  }
}
