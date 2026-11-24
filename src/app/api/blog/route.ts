import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { blogPostSchema } from "@/lib/validators";
import { slugifyTr } from "@/lib/slug";
import { getOrSetCache, invalidateCacheKeys } from "@/lib/redis";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const includeAll = searchParams.get("all") === "true";
  const session = includeAll ? await getAdminSession() : null;

  if (includeAll && session) {
    const posts = await prisma.blogPost.findMany({
      orderBy: { publishedAt: "desc" },
    });
    return NextResponse.json({ posts });
  }

  const posts = await getOrSetCache("blog:published:v1", 180, async () =>
    prisma.blogPost.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: "desc" },
    })
  );

  return NextResponse.json({ posts });
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  try {
    const body: unknown = await request.json();
    const parsed = blogPostSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Geçersiz blog verisi" },
        { status: 400 }
      );
    }

    const d = parsed.data;
    const baseSlug = d.slug?.trim() ? slugifyTr(d.slug) : slugifyTr(d.title);
    const slug = `${baseSlug || "yazi"}-${Date.now().toString(36)}`;

    const post = await prisma.blogPost.create({
      data: {
        slug,
        title: d.title,
        excerpt: d.excerpt,
        content: d.content,
        coverImageUrl: d.coverImageUrl ?? "",
        category: d.category,
        author: d.author,
        metaTitle: d.metaTitle ?? null,
        metaDescription: d.metaDescription ?? null,
        isPublished: d.isPublished,
      },
    });

    await invalidateCacheKeys(["blog:published:v1"]);
    return NextResponse.json({ post }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Blog yazısı oluşturulamadı" }, { status: 500 });
  }
}
