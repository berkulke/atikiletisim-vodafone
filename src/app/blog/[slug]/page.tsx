import React, { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ArrowLeft, Calendar, User } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/settings";
import { sanitizeRichHtml } from "@/lib/security";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [post, settings] = await Promise.all([
    prisma.blogPost.findUnique({ where: { slug } }),
    getSiteSettings(),
  ]);
  if (!post || !post.isPublished) {
    return { title: "Yazı Bulunamadı" };
  }
  return {
    title: post.metaTitle || `${post.title} | ${settings.brandName}`,
    description: post.metaDescription || post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      ...(post.coverImageUrl ? { images: [{ url: post.coverImageUrl }] } : {}),
    },
  };
}

async function BlogDetailContent({
  paramsPromise,
}: {
  paramsPromise: Promise<{ slug: string }>;
}) {
  await connection();
  const { slug } = await paramsPromise;
  const post = await prisma.blogPost.findUnique({ where: { slug } });
  if (!post || !post.isPublished) {
    notFound();
  }

  return (
    <article className="mx-auto max-w-4xl px-4 py-12">
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#666666] hover:text-[#e60000] mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Tüm Blog Yazılarına Dön</span>
      </Link>

      <div className="rounded-2xl bg-white overflow-hidden vdf-card-shadow border border-neutral-100">
        {post.coverImageUrl && (
          <div className="aspect-[21/9] bg-neutral-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.coverImageUrl}
              alt={post.title}
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <div className="p-8 sm:p-10 space-y-5">
          <div className="flex flex-wrap items-center gap-4 text-xs text-[#666666]">
            <span className="rounded-full bg-red-50 px-3 py-1 font-bold text-[#e60000]">
              {post.category}
            </span>
            <span className="inline-flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              {post.author}
            </span>
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(post.publishedAt).toLocaleDateString("tr-TR")}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#0d0d0d]">
            {post.title}
          </h1>
          <p className="text-base font-medium text-[#666666]">{post.excerpt}</p>

          <div
            className="vdf-rich-content border-t border-neutral-100 pt-6 text-sm sm:text-base text-[#333333] leading-relaxed"
            dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(post.content) }}
          />
        </div>
      </div>
    </article>
  );
}

export default function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense fallback={<div className="mx-auto max-w-4xl px-4 py-12 h-80 bg-white rounded-2xl animate-pulse" />}>
      <BlogDetailContent paramsPromise={params} />
    </Suspense>
  );
}
