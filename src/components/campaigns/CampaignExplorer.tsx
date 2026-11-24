"use client";

import React, { useMemo, useState } from "react";
import { RefreshCw, Search, X, ExternalLink, Sparkles, Tag } from "lucide-react";
import { CampaignCard, type CampaignDto } from "@/components/campaigns/CampaignCard";

const CATEGORY_TABS = [
  { slug: "all", label: "Tüm Kampanyalar" },
  { slug: "red-marka-ayricaliklari", label: "Red Marka Ayrıcalıkları" },
  { slug: "freezone-guzellikleri", label: "FreeZone Güzellikleri" },
  { slug: "faturali-kampanyalar", label: "Faturalı Kampanyalar" },
  { slug: "kupon-kodu-kampanyalari", label: "Kupon Kodu Kampanyaları" },
  { slug: "faturasiz-kampanyalar", label: "Faturasız Kampanyalar" },
  { slug: "ev-interneti-kampanyalari", label: "Ev İnterneti Kampanyaları" },
];

export function CampaignExplorer({
  initialCampaigns,
  initialCategory = "all",
  lastSyncTime,
}: {
  initialCampaigns: CampaignDto[];
  initialCategory?: string;
  lastSyncTime: string | null;
}) {
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [activeTag, setActiveTag] = useState("Tümü");
  const [sourceFilter, setSourceFilter] = useState<"ALL" | "VODAFONE_SYNC" | "ADMIN_MANUAL">("ALL");
  const [query, setQuery] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignDto | null>(null);

  const availableTags = useMemo(() => {
    const tagSet = new Set<string>(["Tümü"]);
    for (const c of initialCampaigns) {
      if (activeCategory !== "all" && c.categorySlug !== activeCategory) continue;
      for (const t of c.tags) {
        tagSet.add(t);
      }
    }
    return Array.from(tagSet);
  }, [initialCampaigns, activeCategory]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return initialCampaigns.filter((c) => {
      if (activeCategory !== "all" && c.categorySlug !== activeCategory) return false;
      if (sourceFilter !== "ALL" && c.source !== sourceFilter) return false;
      if (activeTag !== "Tümü" && !c.tags.includes(activeTag)) return false;
      if (
        q &&
        !c.title.toLowerCase().includes(q) &&
        !c.summary.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [initialCampaigns, activeCategory, sourceFilter, activeTag, query]);

  return (
    <div className="min-h-screen bg-[#f4f4f4]">
      {/* Vodafone Kampanyalar Hero Banner */}
      <div className="bg-gradient-to-r from-[#0d0d0d] via-[#4a0000] to-[#e60000] text-white">
        <div className="mx-auto max-w-[1280px] px-4 py-10 sm:py-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wider">
                <RefreshCw className="h-3.5 w-3.5 text-emerald-300" />
                <span>Otomatik Güncellenen Vodafone Kampanyaları</span>
              </div>
              <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold">
                Vodafone&apos;lulara Özel Kampanyalar
              </h1>
              <p className="mt-2 max-w-2xl text-sm sm:text-base text-white/85">
                Red marka ayrıcalıkları, FreeZone güzellikleri, faturalı/faturasız fırsatlar ve ev interneti kampanyaları otomatik senkronize edilir.
              </p>
            </div>
            <div className="rounded-xl bg-black/30 px-4 py-3 text-xs backdrop-blur-sm border border-white/15 shrink-0">
              <p className="text-white/70">Toplam Aktif Kampanya</p>
              <p className="text-2xl font-extrabold text-white">{initialCampaigns.length}</p>
              <p className="mt-1 text-[11px] text-emerald-300">
                {lastSyncTime
                  ? `Son güncelleme: ${new Date(lastSyncTime).toLocaleString("tr-TR")}`
                  : "Dinamik senkronizasyon hazır"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Navigation Tabs (cmp-nav) */}
      <div className="bg-white border-b border-neutral-200 sticky top-[68px] z-30">
        <div className="mx-auto max-w-[1280px] px-4">
          <div className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-hide">
            {CATEGORY_TABS.map((tab) => {
              const active = activeCategory === tab.slug;
              return (
                <button
                  key={tab.slug}
                  type="button"
                  onClick={() => {
                    setActiveCategory(tab.slug);
                    setActiveTag("Tümü");
                  }}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    active
                      ? "bg-[#e60000] text-white shadow-sm"
                      : "bg-[#f4f4f4] text-[#333333] hover:bg-neutral-200"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filters & Grid */}
      <div className="mx-auto max-w-[1280px] px-4 py-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          {/* Tag Pills (cmp-filter-container) */}
          <div className="flex flex-wrap items-center gap-2">
            {availableTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setActiveTag(tag)}
                className={`inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 text-xs font-semibold border transition-colors ${
                  activeTag === tag
                    ? "border-[#e60000] bg-red-50 text-[#e60000]"
                    : "border-neutral-300 bg-white text-[#666666] hover:border-neutral-400"
                }`}
              >
                <Tag className="h-3 w-3" />
                <span>{tag}</span>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={sourceFilter}
              onChange={(e) =>
                setSourceFilter(e.target.value as "ALL" | "VODAFONE_SYNC" | "ADMIN_MANUAL")
              }
              aria-label="Kaynak filtresi"
              className="rounded-full border border-neutral-300 bg-white px-4 py-2 text-xs font-semibold text-[#333333] outline-none focus:border-[#e60000]"
            >
              <option value="ALL">Tüm Kaynaklar</option>
              <option value="VODAFONE_SYNC">Vodafone Canlı Sync</option>
              <option value="ADMIN_MANUAL">Admin Özel Kampanyalar</option>
            </select>

            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Kampanya ara..."
                className="w-56 rounded-full border border-neutral-300 bg-white pl-9 pr-4 py-2 text-xs text-[#333333] outline-none focus:border-[#e60000]"
              />
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-300 bg-white py-16 px-6 text-center">
            <Sparkles className="mx-auto h-10 w-10 text-neutral-400 mb-3" />
            <h2 className="text-lg font-bold text-[#0d0d0d]">
              Seçili kriterlere uygun kampanya bulunamadı
            </h2>
            <p className="mt-1 text-sm text-[#666666]">
              Filtreleri sıfırlayabilir veya Admin panelinden Vodafone kampanyalarını senkronize edebilirsiniz.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                onSelect={(c) => setSelectedCampaign(c)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Campaign Detail Modal */}
      {selectedCampaign && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
          onClick={() => setSelectedCampaign(null)}
        >
          <div
            className="w-full max-w-xl rounded-2xl bg-white overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[640/360] bg-neutral-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedCampaign.imageUrl}
                alt={selectedCampaign.title}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => setSelectedCampaign(null)}
                aria-label="Kapat"
                className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#007c92]">
                  {selectedCampaign.categoryName}
                </span>
                <span className="rounded-full bg-neutral-100 px-3 py-1 text-[11px] font-semibold text-[#333333]">
                  {selectedCampaign.source === "VODAFONE_SYNC"
                    ? "Vodafone Canlı Senkronizasyon"
                    : "Admin Özel Kampanya"}
                </span>
              </div>

              <h2 className="text-xl font-extrabold text-[#0d0d0d]">
                {selectedCampaign.title}
              </h2>
              <p className="text-sm text-[#333333] leading-relaxed">
                {selectedCampaign.description}
              </p>

              <div className="flex flex-wrap gap-1.5">
                {selectedCampaign.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-[#f4f4f4] px-3 py-1 text-xs font-medium text-[#666666]"
                  >
                    {t}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setSelectedCampaign(null)}
                  className="rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-semibold text-[#333333] hover:bg-neutral-100"
                >
                  Kapat
                </button>
                {selectedCampaign.targetUrl && (
                  <a
                    href={selectedCampaign.targetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-[#e60000] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#bd0000]"
                  >
                    <span>Kampanya Sayfasına Git</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
