import React, { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/settings";
import { sanitizeRichHtml } from "@/lib/security";
import { KurumsalTabs } from "@/components/kurumsal/KurumsalTabs";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  try {
    const page = await prisma.customPage.findUnique({ where: { slug: "misyon-vizyon" } });
    return {
      title: page?.metaTitle || `Misyon & Vizyon | ${settings.brandName}`,
      description: page?.metaDescription || page?.summary || settings.seoDescription,
    };
  } catch {
    return {
      title: `Misyon & Vizyon | ${settings.brandName}`,
      description: settings.seoDescription,
    };
  }
}

async function MisyonVizyonContent() {
  await connection();
  const settings = await getSiteSettings();
  let page: { title: string; summary: string | null; content: string } | null = null;
  try {
    page = await prisma.customPage.findUnique({ where: { slug: "misyon-vizyon" } });
  } catch {
    page = null;
  }

  return (
    <div className="min-h-screen bg-[#f4f4f4]">
      <div className="bg-gradient-to-r from-[#0d0d0d] via-[#4a0000] to-[#e60000] text-white">
        <div className="mx-auto max-w-[1280px] px-4 py-12">
          <p className="text-xs font-bold uppercase tracking-widest text-white/80">
            Kurumsal • {settings.brandName}
          </p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold">
            {page?.title ?? "Misyon & Vizyon"}
          </h1>
          {page?.summary && (
            <p className="mt-2 max-w-2xl text-sm sm:text-base text-white/85">
              {page.summary}
            </p>
          )}
        </div>
      </div>

      <KurumsalTabs activeHref="/kurumsal/misyon-vizyon" />

      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="rounded-2xl bg-white p-8 sm:p-10 vdf-card-shadow border border-neutral-100">
          {page ? (
            <div
              className="vdf-rich-content text-sm sm:text-base text-[#333333] leading-relaxed"
              dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(page.content) }}
            />
          ) : (
            <p className="text-sm text-[#666666]">
              Misyon &amp; Vizyon içeriği henüz oluşturulmadı. Admin panelindeki Sayfa Oluşturucu üzerinden &quot;misyon-vizyon&quot; sayfasını ekleyebilirsiniz.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MisyonVizyonPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-4xl px-4 py-12 h-64 bg-white rounded-2xl animate-pulse" />}>
      <MisyonVizyonContent />
    </Suspense>
  );
}
