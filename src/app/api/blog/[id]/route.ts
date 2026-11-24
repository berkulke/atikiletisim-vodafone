import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { blogPostSchema } from "@/lib/validators";
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
    const parsed = blogPostSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Geçersiz güncelleme" },
        { status: 400 }
      );
    }

    const d = parsed.data;
    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        ...(d.title !== undefined ? { title: d.title } : {}),
        ...(d.excerpt !== undefined ? { excerpt: d.excerpt } : {}),
        ...(d.content !== undefined ? { content: d.content } : {}),
        ...(d.coverImageUrl !== undefined ? { coverImageUrl: d.coverImageUrl ?? "" } : {}),
        ...(d.category !== undefined ? { category: d.category } : {}),
        ...(d.author !== undefined ? { author: d.author } : {}),
        ...(d.metaTitle !== undefined ? { metaTitle: d.metaTitle } : {}),
        ...(d.metaDescription !== undefined ? { metaDescription: d.metaDescription } : {}),
        ...(d.isPublished !== undefined ? { isPublished: d.isPublished } : {}),
      },
    });

    await invalidateCacheKeys(["blog:published:v1"]);
    return NextResponse.json({ post });
  } catch {
    return NextResponse.json({ error: "Blog yazısı güncellenemedi" }, { status: 500 });
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
    await prisma.blogPost.delete({ where: { id } });
    await invalidateCacheKeys(["blog:published:v1"]);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Blog yazısı silinemedi" }, { status: 500 });
  }
}
