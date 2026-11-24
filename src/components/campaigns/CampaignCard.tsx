import React from "react";
import Link from "next/link";
import { ArrowRight, RefreshCw, Sparkles } from "lucide-react";

export interface CampaignDto {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  imageUrl: string;
  targetUrl: string | null;
  categorySlug: string;
  categoryName: string;
  badgeLabel: string | null;
  badgeColor: string | null;
  tags: string[];
  source: "VODAFONE_SYNC" | "ADMIN_MANUAL";
  isFeatured: boolean;
  isActive: boolean;
  lastSyncedAt: string | null;
}

const BADGE_BG: Record<string, string> = {
  green: "bg-[#009900]",
  orange: "bg-[#eb9700]",
  blue: "bg-[#007c92]",
  red: "bg-[#e60000]",
};

export function CampaignCard({
  campaign,
  onSelect,
}: {
  campaign: CampaignDto;
  onSelect?: (campaign: CampaignDto) => void;
}) {
  const badgeClass = BADGE_BG[campaign.badgeColor ?? "red"] ?? "bg-[#e60000]";

  const content = (
    <div className="group relative flex h-full flex-col justify-between rounded-[6px] bg-white p-4 vdf-card-shadow border border-neutral-100 transition-all duration-200 hover:-translate-y-1">
      {campaign.badgeLabel && (
        <span
          className={`absolute -top-3 left-4 rounded-t-[6px] px-3.5 py-1 text-xs font-semibold text-white shadow-sm ${badgeClass}`}
        >
          {campaign.badgeLabel}
        </span>
      )}

      <div>
        <div className="relative overflow-hidden rounded-[6px] bg-neutral-100 aspect-[640/427]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={campaign.imageUrl}
            alt={campaign.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute top-2.5 right-2.5">
            {campaign.source === "VODAFONE_SYNC" ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
                <RefreshCw className="h-2.5 w-2.5 text-emerald-400" />
                Vodafone Canlı
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#e60000] px-2.5 py-1 text-[10px] font-semibold text-white shadow-sm">
                <Sparkles className="h-2.5 w-2.5" />
                Admin Özel
              </span>
            )}
          </div>
        </div>

        <div className="mt-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#007c92]">
            {campaign.categoryName}
          </p>
          <h3 className="mt-1 text-base font-bold text-[#333333] group-hover:text-[#e60000] transition-colors line-clamp-2">
            {campaign.title}
          </h3>
          <p className="mt-1.5 text-sm text-[#666666] line-clamp-2">
            {campaign.summary}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-3">
        <div className="flex flex-wrap gap-1">
          {campaign.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-[#f4f4f4] px-2 py-0.5 text-[10px] font-medium text-[#666666]"
            >
              {tag}
            </span>
          ))}
        </div>
        <span className="inline-flex items-center gap-1 text-sm font-bold text-[#e60000]">
          <span>Detay</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </div>
  );

  if (onSelect) {
    return (
      <button
        type="button"
        onClick={() => onSelect(campaign)}
        className="w-full text-left h-full"
      >
        {content}
      </button>
    );
  }

  return (
    <Link href={`/kampanyalar?highlight=${encodeURIComponent(campaign.slug)}`} className="block h-full">
      {content}
    </Link>
  );
}
