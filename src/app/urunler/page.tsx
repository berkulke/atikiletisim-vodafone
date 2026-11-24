import React, { Suspense } from "react";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/serializers";
import { ProductCatalog } from "@/components/products/ProductCatalog";

async function ProductsContent({
  searchParamsPromise,
}: {
  searchParamsPromise: Promise<{ category?: string; q?: string }>;
}) {
  await connection();
  const params = await searchParamsPromise;

  let products: ReturnType<typeof serializeProduct>[] = [];
  try {
    const dbProducts = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    });
    products = dbProducts.map(serializeProduct);
  } catch {
    // Database fallback
  }

  return (
    <ProductCatalog
      initialProducts={products}
      initialCategory={params.category || "ALL"}
      initialQuery={params.q || ""}
    />
  );
}

export default function UrunlerPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1280px] px-4 py-12">
          <div className="h-10 w-64 rounded-lg bg-neutral-200 animate-pulse mb-6" />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-80 rounded-xl bg-white animate-pulse" />
            ))}
          </div>
        </div>
      }
    >
      <ProductsContent searchParamsPromise={searchParams} />
    </Suspense>
  );
}
