"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, PackageOpen } from "lucide-react";
import { ProductCard, type ProductDto } from "@/components/products/ProductCard";

const TABS: Array<{ key: ProductDto["category"]; label: string }> = [
  { key: "DEVICE", label: "Telefonlar & Cihazlar" },
  { key: "TARIFF", label: "Faturalı Tarifeler" },
  { key: "HOME_INTERNET", label: "Ev İnterneti" },
  { key: "ACCESSORY", label: "Aksesuarlar" },
];

export function ProductShowcase({ products }: { products: ProductDto[] }) {
  const [activeTab, setActiveTab] = useState<ProductDto["category"]>("DEVICE");

  const filtered = products.filter((p) => p.category === activeTab).slice(0, 4);

  return (
    <section className="mx-auto max-w-[1280px] px-4 py-14">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#e60000]">
            Vodafone Online Mağaza
          </p>
          <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold text-[#0d0d0d]">
            Öne Çıkan Cihazlar ve Tarifeler
          </h2>
        </div>
        <Link
          href={`/urunler?category=${activeTab}`}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-[#e60000] hover:underline"
        >
          <span>Tümünü Gör</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-8 border-b border-neutral-200 scrollbar-hide">
        {TABS.map((tab) => {
          const active = tab.key === activeTab;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`whitespace-nowrap px-5 py-2.5 text-sm font-bold transition-colors border-b-2 -mb-[9px] ${
                active
                  ? "border-[#e60000] text-[#e60000]"
                  : "border-transparent text-[#666666] hover:text-[#0d0d0d]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-white py-14 px-6 text-center">
          <PackageOpen className="h-10 w-10 text-neutral-400 mb-3" />
          <p className="text-base font-bold text-[#0d0d0d]">
            Bu kategoride henüz ürün bulunmuyor
          </p>
          <p className="mt-1 text-sm text-[#666666]">
            Admin panelinden yeni ürün veya tarife ekleyerek vitrini güncelleyebilirsiniz.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
