import React, { Suspense } from "react";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeCampaign } from "@/lib/serializers";
import { CampaignExplorer } from "@/components/campaigns/CampaignExplorer";

async function CampaignsContent({
  searchParamsPromise,
}: {
  searchParamsPromise: Promise<{ category?: string }>;
}) {
  await connection();
  const params = await searchParamsPromise;

  let campaigns: ReturnType<typeof serializeCampaign>[] = [];
  let lastSyncTime: string | null = null;

  try {
    const [dbCampaigns, latestLog] = await Promise.all([
      prisma.campaign.findMany({
        where: { isActive: true },
        orderBy: [{ isFeatured: "desc" }, { source: "desc" }, { updatedAt: "desc" }],
      }),
      prisma.campaignSyncLog.findFirst({
        where: { status: { in: ["SUCCESS", "PARTIAL"] } },
        orderBy: { finishedAt: "desc" },
      }),
    ]);
    campaigns = dbCampaigns.map(serializeCampaign);
    lastSyncTime = latestLog?.finishedAt ? latestLog.finishedAt.toISOString() : null;
  } catch {
    // Database fallback if not initialized
  }

  return (
    <CampaignExplorer
      initialCampaigns={campaigns}
      initialCategory={params.category || "all"}
      lastSyncTime={lastSyncTime}
    />
  );
}

export default function KampanyalarPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1280px] px-4 py-12">
          <div className="h-40 rounded-2xl bg-neutral-200 animate-pulse mb-8" />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-72 rounded-xl bg-white animate-pulse" />
            ))}
          </div>
        </div>
      }
    >
      <CampaignsContent searchParamsPromise={searchParams} />
    </Suspense>
  );
}
