import React, { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { sanitizeRichHtml } from "@/lib/security";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await prisma.customPage.findUnique({ where: { slug } });
  if (!page || !page.isPublished) {
    return { title: "Sayfa Bulunamadı" };
  }
  return {
    title: page.metaTitle || page.title,
    description: page.metaDescription || page.summary || undefined,
  };
}

async function DynamicPageContent({
  paramsPromise,
}: {
  paramsPromise: Promise<{ slug: string }>;
}) {
  await connection();
  const { slug } = await paramsPromise;
  const page = await prisma.customPage.findUnique({ where: { slug } });

  if (!page || !page.isPublished) {
    notFound();
  }

  return (
    <article className="mx-auto max-w-4xl px-4 py-12">
      <div className="rounded-2xl bg-white p-8 sm:p-10 vdf-card-shadow border border-neutral-100 space-y-4">
        <h1 className="text-3xl font-extrabold text-[#0d0d0d]">{page.title}</h1>
        {page.summary && (
          <p className="text-base font-medium text-[#666666]">{page.summary}</p>
        )}
        <div
          className="vdf-rich-content border-t border-neutral-100 pt-6 text-sm sm:text-base text-[#333333] leading-relaxed"
          dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(page.content) }}
        />
      </div>
    </article>
  );
}

export default function DynamicCustomPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-4xl px-4 py-12">
          <div className="h-64 rounded-2xl bg-white animate-pulse" />
        </div>
      }
    >
      <DynamicPageContent paramsPromise={params} />
    </Suspense>
  );
}
