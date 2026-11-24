import React, { Suspense } from "react";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeCampaign, serializeProduct } from "@/lib/serializers";
import { getOrSetCache } from "@/lib/redis";
import { HeroSlider } from "@/components/home/HeroSlider";
import { QuickActions } from "@/components/home/QuickActions";
import { ProductShowcase } from "@/components/home/ProductShowcase";
import { FeaturedCampaigns } from "@/components/home/FeaturedCampaigns";
import { InfoCards } from "@/components/home/InfoCards";

async function HomeDynamicSections() {
  await connection();

  let products: ReturnType<typeof serializeProduct>[] = [];
  let campaigns: ReturnType<typeof serializeCampaign>[] = [];

  try {
    [products, campaigns] = await Promise.all([
      getOrSetCache("home:products:v1", 120, async () => {
        const dbProducts = await prisma.product.findMany({
          where: { isActive: true },
          orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
          take: 24,
        });
        return dbProducts.map(serializeProduct);
      }),
      getOrSetCache("home:campaigns:v1", 120, async () => {
        const dbCampaigns = await prisma.campaign.findMany({
          where: { isActive: true },
          orderBy: [{ isFeatured: "desc" }, { updatedAt: "desc" }],
          take: 6,
        });
        return dbCampaigns.map(serializeCampaign);
      }),
    ]);
  } catch {
    // Database may not be initialized during initial build
  }

  return (
    <>
      <ProductShowcase products={products} />
      <FeaturedCampaigns campaigns={campaigns} />
    </>
  );
}

function SectionsSkeleton() {
  return (
    <div className="mx-auto max-w-[1280px] px-4 py-14 space-y-6">
      <div className="h-8 w-64 rounded-lg bg-neutral-200 animate-pulse" />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="h-80 rounded-xl bg-white p-5 animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div>
      <HeroSlider />
      <QuickActions />
      <Suspense fallback={<SectionsSkeleton />}>
        <HomeDynamicSections />
      </Suspense>
      <InfoCards />
    </div>
  );
}
