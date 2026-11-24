import React, { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrSetCache } from "@/lib/redis";
import { getSiteSettings } from "@/lib/settings";
import { KurumsalTabs } from "@/components/kurumsal/KurumsalTabs";
import { FaqAccordion } from "@/components/kurumsal/FaqAccordion";

export const metadata: Metadata = {
  title: "Sıkça Sorulan Sorular | Atik İletişim",
  description:
    "Vodafone tarifeleri, faturaya ek cihazlar, sipariş teslimatı ve Atik İletişim şubeleri hakkında sıkça sorulan sorular.",
};

async function SssContent() {
  await connection();
  let items: Array<{ id: string; question: string; answer: string; category: string }> = [];
  try {
    items = await getOrSetCache("faq:active:v1", 180, async () =>
      prisma.faqItem.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      })
    );
  } catch {
    items = [];
  }
  const settings = await getSiteSettings();

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "QAPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-[#f4f4f4]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="bg-gradient-to-r from-[#0d0d0d] via-[#4a0000] to-[#e60000] text-white">
        <div className="mx-auto max-w-[1280px] px-4 py-12">
          <p className="text-xs font-bold uppercase tracking-widest text-white/80">
            Kurumsal • {settings.brandName}
          </p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold">
            Sıkça Sorulan Sorular
          </h1>
          <p className="mt-2 max-w-2xl text-sm sm:text-base text-white/85">
            Tarifeler, faturaya ek cihaz satışı, kurye teslimatı ve şubelerimiz hakkında merak edilenler.
          </p>
        </div>
      </div>

      <KurumsalTabs activeHref="/kurumsal/sss" />

      <div className="mx-auto max-w-4xl px-4 py-12">
        <FaqAccordion items={items} />
      </div>
    </div>
  );
}

export default function SssPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-4xl px-4 py-12 h-64 bg-white rounded-2xl animate-pulse" />}>
      <SssContent />
    </Suspense>
  );
}
