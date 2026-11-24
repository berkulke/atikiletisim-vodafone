import { prisma } from "@/lib/prisma";
import { invalidateCacheKeys } from "@/lib/redis";
import { fetchAllVodafoneCampaigns } from "./vodafone-scraper";

export interface SyncResultSummary {
  logId: string;
  status: "SUCCESS" | "PARTIAL" | "FAILED";
  fetchedCount: number;
  createdCount: number;
  updatedCount: number;
  errors: string[];
}

export async function syncVodafoneCampaigns(): Promise<SyncResultSummary> {
  const startedAt = new Date();
  const log = await prisma.campaignSyncLog.create({
    data: {
      status: "RUNNING",
      startedAt,
    },
  });

  try {
    const { campaigns, errors } = await fetchAllVodafoneCampaigns();

    if (campaigns.length === 0 && errors.length > 0) {
      await prisma.campaignSyncLog.update({
        where: { id: log.id },
        data: {
          status: "FAILED",
          errorMessage: errors.join(" | "),
          finishedAt: new Date(),
        },
      });
      return {
        logId: log.id,
        status: "FAILED",
        fetchedCount: 0,
        createdCount: 0,
        updatedCount: 0,
        errors,
      };
    }

    let createdCount = 0;
    let updatedCount = 0;
    const now = new Date();

    for (const item of campaigns) {
      const existing = await prisma.campaign.findFirst({
        where: {
          OR: [{ externalId: item.externalId }, { slug: item.slug }],
        },
        select: { id: true, source: true },
      });

      if (existing) {
        if (existing.source === "ADMIN_MANUAL") {
          continue;
        }
        await prisma.campaign.update({
          where: { id: existing.id },
          data: {
            externalId: item.externalId,
            title: item.title,
            summary: item.summary,
            description: item.description,
            imageUrl: item.imageUrl,
            targetUrl: item.targetUrl,
            categorySlug: item.categorySlug,
            categoryName: item.categoryName,
            badgeLabel: item.badgeLabel,
            badgeColor: item.badgeColor,
            tags: item.tags,
            isFeatured: item.isFeatured,
            isActive: true,
            lastSyncedAt: now,
          },
        });
        updatedCount += 1;
      } else {
        await prisma.campaign.create({
          data: {
            externalId: item.externalId,
            slug: item.slug,
            title: item.title,
            summary: item.summary,
            description: item.description,
            imageUrl: item.imageUrl,
            targetUrl: item.targetUrl,
            categorySlug: item.categorySlug,
            categoryName: item.categoryName,
            badgeLabel: item.badgeLabel,
            badgeColor: item.badgeColor,
            tags: item.tags,
            source: "VODAFONE_SYNC",
            isFeatured: item.isFeatured,
            isActive: true,
            lastSyncedAt: now,
          },
        });
        createdCount += 1;
      }
    }

    const finalStatus = errors.length > 0 ? "PARTIAL" : "SUCCESS";
    await prisma.campaignSyncLog.update({
      where: { id: log.id },
      data: {
        status: finalStatus,
        fetchedCount: campaigns.length,
        createdCount,
        updatedCount,
        errorMessage: errors.length > 0 ? errors.join(" | ") : null,
        finishedAt: new Date(),
      },
    });

    await invalidateCacheKeys(["home:campaigns:v1"]);

    return {
      logId: log.id,
      status: finalStatus,
      fetchedCount: campaigns.length,
      createdCount,
      updatedCount,
      errors,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bilinmeyen senkronizasyon hatası";
    await prisma.campaignSyncLog.update({
      where: { id: log.id },
      data: {
        status: "FAILED",
        errorMessage: message,
        finishedAt: new Date(),
      },
    });
    await invalidateCacheKeys(["home:campaigns:v1"]);

    return {
      logId: log.id,
      status: "FAILED",
      fetchedCount: 0,
      createdCount: 0,
      updatedCount: 0,
      errors: [message],
    };
  }
}
