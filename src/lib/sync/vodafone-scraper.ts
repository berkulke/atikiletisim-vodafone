import * as cheerio from "cheerio";
import { slugifyTr } from "@/lib/slug";

export interface VodafoneCategorySource {
  url: string;
  categorySlug: string;
  categoryName: string;
}

export interface ScrapedCampaign {
  externalId: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  imageUrl: string;
  targetUrl: string;
  categorySlug: string;
  categoryName: string;
  badgeLabel: string | null;
  badgeColor: string | null;
  tags: string[];
  isFeatured: boolean;
}

export const VODAFONE_CAMPAIGN_SOURCES: VodafoneCategorySource[] = [
  {
    url: "https://www.vodafone.com.tr/kampanyalar",
    categorySlug: "faturali-kampanyalar",
    categoryName: "Faturalı Kampanyalar",
  },
  {
    url: "https://www.vodafone.com.tr/kampanyalar/red-marka-ayricaliklari",
    categorySlug: "red-marka-ayricaliklari",
    categoryName: "Red Marka Ayrıcalıkları",
  },
  {
    url: "https://www.vodafone.com.tr/kampanyalar/freezone-guzellikleri",
    categorySlug: "freezone-guzellikleri",
    categoryName: "FreeZone Güzellikleri",
  },
  {
    url: "https://www.vodafone.com.tr/kampanyalar/kupon-kodu-kampanyalari",
    categorySlug: "kupon-kodu-kampanyalari",
    categoryName: "Kupon Kodu Kampanyaları",
  },
  {
    url: "https://www.vodafone.com.tr/kampanyalar/faturasiz-kampanyalar",
    categorySlug: "faturasiz-kampanyalar",
    categoryName: "Faturasız Kampanyalar",
  },
  {
    url: "https://www.vodafone.com.tr/kampanyalar/ev-interneti-kampanyalari",
    categorySlug: "ev-interneti-kampanyalari",
    categoryName: "Ev İnterneti Kampanyaları",
  },
];

const BROWSER_USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

function normalizeAbsoluteUrl(href: string): string {
  const cleaned = href.replace(/\s+/g, "").trim();
  if (!cleaned) {
    return "https://www.vodafone.com.tr/kampanyalar";
  }
  if (cleaned.startsWith("http://") || cleaned.startsWith("https://")) {
    return cleaned;
  }
  if (cleaned.startsWith("//")) {
    return `https:${cleaned}`;
  }
  return `https://www.vodafone.com.tr${cleaned.startsWith("/") ? "" : "/"}${cleaned}`;
}

function detectBadgeColor(classList: string): string | null {
  if (classList.includes("bg-green")) return "green";
  if (classList.includes("bg-orange")) return "orange";
  if (classList.includes("bg-blue")) return "blue";
  if (classList.includes("bg-red")) return "red";
  return null;
}

function inferTagsFromContent(title: string, categoryName: string): string[] {
  const lower = title.toLowerCase();
  const tags: string[] = [];

  if (lower.includes("red")) tags.push("Tüm Red'lilere Özel");
  if (lower.includes("freezone") || lower.includes("genç")) tags.push("FreeZone");
  if (
    lower.includes("yemek") ||
    lower.includes("iskender") ||
    lower.includes("kahve") ||
    lower.includes("coffy") ||
    lower.includes("restoran") ||
    lower.includes("burger") ||
    lower.includes("pizza")
  ) {
    tags.push("Yeme&İçme");
  }
  if (
    lower.includes("migros") ||
    lower.includes("indirim") ||
    lower.includes("hediye") ||
    lower.includes("alışveriş") ||
    lower.includes("market")
  ) {
    tags.push("Alışveriş");
  }
  if (
    lower.includes("seyahat") ||
    lower.includes("otel") ||
    lower.includes("uçak") ||
    lower.includes("bilet") ||
    lower.includes("transfer")
  ) {
    tags.push("Seyahat");
  }
  if (
    lower.includes("sinema") ||
    lower.includes("oyun") ||
    lower.includes("müzik") ||
    lower.includes("eğlence") ||
    lower.includes("youtube") ||
    lower.includes("spotify")
  ) {
    tags.push("Eğlence");
  }
  if (lower.includes("happy")) tags.push("Happy");
  if (tags.length === 0) {
    tags.push(categoryName.includes("Red") ? "Tüm Red'lilere Özel" : "Vodafone'lulara Özel");
  }
  return Array.from(new Set(tags));
}

export function parseVodafoneCampaignHtml(
  html: string,
  source: VodafoneCategorySource
): ScrapedCampaign[] {
  const $ = cheerio.load(html);
  const results: ScrapedCampaign[] = [];
  const seenKeys = new Set<string>();

  const tagNameById = new Map<string, string>();
  $(".cmp-filter-container .filter-tag").each((_, el) => {
    const tagId = $(el).attr("data-tag-id");
    const tagLabel = $(el).text().replace(/\s+/g, " ").trim();
    if (tagId && tagId !== "0" && tagLabel) {
      tagNameById.set(tagId, tagLabel);
    }
  });

  $("a.cmp-card").each((index, el) => {
    const card = $(el);
    const rawHref = card.attr("href") ?? "";
    const targetUrl = normalizeAbsoluteUrl(rawHref);

    const img = card.find("img").first();
    const rawImgSrc = img.attr("src") || img.attr("data-src") || "";
    const imageUrl = rawImgSrc ? normalizeAbsoluteUrl(rawImgSrc) : "";

    const rawTitle =
      card.find(".text-content").text().replace(/\s+/g, " ").trim() ||
      img.attr("alt")?.replace(/\s+/g, " ").trim() ||
      card.attr("title")?.replace(/\s+/g, " ").trim() ||
      "";

    if (!rawTitle || !imageUrl || imageUrl.endsWith("/content/")) {
      return;
    }

    const shortDesc =
      card.find(".short-description").text().replace(/\s+/g, " ").trim() ||
      `${rawTitle} — ${source.categoryName} kapsamında Vodafone Türkiye ayrıcalığı.`;

    const itemId = card.attr("data-item_id")?.trim();
    const pathSlug = slugifyTr(
      rawHref.split("?")[0].split("/").filter(Boolean).pop() || rawTitle
    );
    const externalId = itemId ? `vdf-${source.categorySlug}-${itemId}` : `vdf-${source.categorySlug}-${pathSlug}`;
    const slug = `${source.categorySlug}-${pathSlug}`.slice(0, 120);

    if (seenKeys.has(externalId) || seenKeys.has(slug)) {
      return;
    }
    seenKeys.add(externalId);
    seenKeys.add(slug);

    const badgeEl = card.find(".card-head-label, .head-date-note").first();
    const badgeLabel = badgeEl.text().replace(/\s+/g, " ").trim() || null;
    const badgeColor = detectBadgeColor(badgeEl.attr("class") ?? "");

    const rawTagIds = (card.attr("data-tag-ids") || card.attr("data-tags") || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const mappedTags = rawTagIds
      .map((id) => tagNameById.get(id))
      .filter((t): t is string => Boolean(t));

    const tags = mappedTags.length > 0 ? mappedTags : inferTagsFromContent(rawTitle, source.categoryName);

    results.push({
      externalId,
      slug,
      title: rawTitle,
      summary: shortDesc,
      description: `${shortDesc} Detaylı katılım koşulları ve geçerlilik bilgileri Vodafone Türkiye (${source.categoryName}) üzerinden otomatik olarak senkronize edilmiştir.`,
      imageUrl,
      targetUrl,
      categorySlug: source.categorySlug,
      categoryName: source.categoryName,
      badgeLabel,
      badgeColor,
      tags,
      isFeatured: index < 3 && source.categorySlug === "faturali-kampanyalar",
    });
  });

  return results;
}

export async function fetchAllVodafoneCampaigns(): Promise<{
  campaigns: ScrapedCampaign[];
  errors: string[];
}> {
  const campaigns: ScrapedCampaign[] = [];
  const errors: string[] = [];

  const responses = await Promise.allSettled(
    VODAFONE_CAMPAIGN_SOURCES.map(async (source) => {
      const response = await fetch(source.url, {
        headers: {
          "User-Agent": BROWSER_USER_AGENT,
          "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8",
          Accept: "text/html,application/xhtml+xml",
        },
        signal: AbortSignal.timeout(15000),
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error(`${source.url} HTTP ${response.status}`);
      }
      const html = await response.text();
      return parseVodafoneCampaignHtml(html, source);
    })
  );

  for (const result of responses) {
    if (result.status === "fulfilled") {
      campaigns.push(...result.value);
    } else {
      errors.push(
        result.reason instanceof Error ? result.reason.message : String(result.reason)
      );
    }
  }

  return { campaigns, errors };
}
