import React, { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/serializers";
import { getSiteSettings } from "@/lib/settings";
import { ProductDetailClient } from "@/components/products/ProductDetailClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [product, settings] = await Promise.all([
    prisma.product.findUnique({ where: { slug } }),
    getSiteSettings(),
  ]);
  if (!product || !product.isActive) {
    return { title: "Ürün Bulunamadı" };
  }
  return {
    title: `${product.title} | ${settings.brandName}`,
    description: product.subtitle || product.description.slice(0, 155),
    openGraph: {
      title: product.title,
      description: product.description.slice(0, 155),
      images: [{ url: product.imageUrl }],
    },
  };
}

async function ProductDetailContent({
  paramsPromise,
}: {
  paramsPromise: Promise<{ slug: string }>;
}) {
  await connection();
  const { slug } = await paramsPromise;

  const [product, settings] = await Promise.all([
    prisma.product.findUnique({ where: { slug } }),
    getSiteSettings(),
  ]);

  if (!product || !product.isActive) {
    notFound();
  }

  const dto = serializeProduct(product);
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: dto.title,
    description: dto.description,
    image: dto.imageUrl,
    brand: { "@type": "Brand", name: dto.brand },
    offers: {
      "@type": "Offer",
      url: `${settings.siteUrl.replace(/\/$/, "")}/urunler/${dto.slug}`,
      priceCurrency: "TRY",
      price: dto.price,
      availability:
        dto.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <ProductDetailClient product={dto} />
    </>
  );
}

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1280px] px-4 py-12">
          <div className="h-96 rounded-2xl bg-white animate-pulse" />
        </div>
      }
    >
      <ProductDetailContent paramsPromise={params} />
    </Suspense>
  );
}
