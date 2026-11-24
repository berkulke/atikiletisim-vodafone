import type { Campaign, Product } from "@prisma/client";
import type { ProductDto } from "@/components/products/ProductCard";
import type { CampaignDto } from "@/components/campaigns/CampaignCard";

export function serializeProduct(p: Product): ProductDto {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    subtitle: p.subtitle,
    description: p.description,
    category: p.category,
    brand: p.brand,
    price: Number(p.price),
    installmentPrice: p.installmentPrice ? Number(p.installmentPrice) : null,
    installmentMonths: p.installmentMonths,
    specs:
      typeof p.specs === "object" && p.specs !== null && !Array.isArray(p.specs)
        ? (p.specs as Record<string, string | number | boolean>)
        : {},
    imageUrl: p.imageUrl,
    stock: p.stock,
    isFeatured: p.isFeatured,
    isActive: p.isActive,
  };
}

export function serializeCampaign(c: Campaign): CampaignDto {
  return {
    id: c.id,
    slug: c.slug,
    title: c.title,
    summary: c.summary,
    description: c.description,
    imageUrl: c.imageUrl,
    targetUrl: c.targetUrl,
    categorySlug: c.categorySlug,
    categoryName: c.categoryName,
    badgeLabel: c.badgeLabel,
    badgeColor: c.badgeColor,
    tags: c.tags,
    source: c.source,
    isFeatured: c.isFeatured,
    isActive: c.isActive,
    lastSyncedAt: c.lastSyncedAt ? c.lastSyncedAt.toISOString() : null,
  };
}
