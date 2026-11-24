import React from "react";
import Link from "next/link";
import { ArrowRight, RefreshCw, Gift } from "lucide-react";
import { CampaignCard, type CampaignDto } from "@/components/campaigns/CampaignCard";

export function FeaturedCampaigns({ campaigns }: { campaigns: CampaignDto[] }) {
  return (
    <section className="bg-white py-14 border-y border-neutral-200">
      <div className="mx-auto max-w-[1280px] px-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#e60000]">
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Dinamik Kampanya Motoru</span>
            </div>
            <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold text-[#0d0d0d]">
              Vodafone&apos;lulara Özel Güncel Kampanyalar
            </h2>
            <p className="mt-1 text-sm text-[#666666]">
              Vodafone Türkiye kampanyaları ile otomatik senkronize edilir ve admin özel fırsatlarıyla zenginleştirilir.
            </p>
          </div>
          <Link
            href="/kampanyalar"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#e60000] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#bd0000] transition-colors shrink-0"
          >
            <span>Tüm Kampanyalar</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {campaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-[#f4f4f4] py-14 px-6 text-center">
            <Gift className="h-10 w-10 text-neutral-400 mb-3" />
            <p className="text-base font-bold text-[#0d0d0d]">
              Henüz senkronize edilmiş kampanya bulunmuyor
            </p>
            <p className="mt-1 text-sm text-[#666666]">
              Admin panelinden Vodafone Kampanya Senkronizasyonunu başlatabilir veya manuel kampanya ekleyebilirsiniz.
            </p>
            <Link
              href="/admin"
              className="mt-4 rounded-full bg-[#e60000] px-5 py-2 text-xs font-bold text-white hover:bg-[#bd0000]"
            >
              Admin Paneline Git
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {campaigns.slice(0, 6).map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
