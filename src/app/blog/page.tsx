import React, { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { ArrowRight, BookOpen, Calendar } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getOrSetCache } from "@/lib/redis";

export const metadata: Metadata = {
  title: "Blog & Teknoloji Rehberi | Atik İletişim",
  description:
    "Akıllı telefonlar, 5G, fiber ev interneti ve Vodafone kampanyaları hakkında güncel rehberler ve haberler.",
};

async function BlogListContent() {
  await connection();
  let posts: Array<{
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    coverImageUrl: string;
    category: string;
    publishedAt: Date;
  }> = [];

  try {
    posts = await getOrSetCache("blog:published:v1", 180, async () =>
      prisma.blogPost.findMany({
        where: { isPublished: true },
        orderBy: { publishedAt: "desc" },
      })
    );
  } catch {
    posts = [];
  }

  return (
    <div className="min-h-screen bg-[#f4f4f4]">
      <div className="bg-gradient-to-r from-[#0d0d0d] via-[#4a0000] to-[#e60000] text-white">
        <div className="mx-auto max-w-[1280px] px-4 py-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1 text-xs font-bold uppercase tracking-wider">
            <BookOpen className="h-3.5 w-3.5" />
            <span>Atik İletişim Blog</span>
          </div>
          <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold">
            Teknoloji, Tarife ve Fiber Rehberi
          </h1>
          <p className="mt-2 max-w-2xl text-sm sm:text-base text-white/85">
            En yeni cihaz incelemeleri, tarife ipuçları ve Gaziantep şubelerimizden haberler.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[1280px] px-4 py-12">
        {posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-300 bg-white py-16 px-6 text-center">
            <BookOpen className="mx-auto h-10 w-10 text-neutral-400 mb-3" />
            <p className="text-base font-bold text-[#0d0d0d]">
              Henüz yayınlanmış blog yazısı bulunmuyor
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group flex flex-col justify-between rounded-2xl bg-white p-5 vdf-card-shadow border border-neutral-100 hover:-translate-y-1 transition-transform"
              >
                <div>
                  {post.coverImageUrl && (
                    <div className="mb-4 overflow-hidden rounded-xl aspect-[16/10] bg-neutral-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={post.coverImageUrl}
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <span className="inline-block rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-bold text-[#e60000]">
                    {post.category}
                  </span>
                  <h2 className="mt-2 text-lg font-extrabold text-[#0d0d0d] group-hover:text-[#e60000] transition-colors line-clamp-2">
                    {post.title}
                  </h2>
                  <p className="mt-2 text-sm text-[#666666] line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-[#666666]">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(post.publishedAt).toLocaleDateString("tr-TR")}
                  </span>
                  <span className="inline-flex items-center gap-1 font-bold text-[#e60000]">
                    <span>Oku</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function BlogPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-[1280px] px-4 py-12 h-64 bg-white rounded-2xl animate-pulse" />}>
      <BlogListContent />
    </Suspense>
  );
}
