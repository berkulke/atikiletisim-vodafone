"use client";

import React, { useMemo, useState } from "react";
import { Search, PackageOpen } from "lucide-react";
import { ProductCard, type ProductDto } from "@/components/products/ProductCard";

const CATEGORIES = [
  { key: "ALL", label: "Tümü" },
  { key: "DEVICE", label: "Telefonlar & Cihazlar" },
  { key: "TARIFF", label: "Faturalı Tarifeler" },
  { key: "HOME_INTERNET", label: "Ev İnterneti" },
  { key: "ACCESSORY", label: "Aksesuarlar" },
];

export function ProductCatalog({
  initialProducts,
  initialCategory = "ALL",
  initialQuery = "",
}: {
  initialProducts: ProductDto[];
  initialCategory?: string;
  initialQuery?: string;
}) {
  const [category, setCategory] = useState(initialCategory);
  const [query, setQuery] = useState(initialQuery);
  const [sortBy, setSortBy] = useState<"featured" | "price_asc" | "price_desc">("featured");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = initialProducts.filter((p) => {
      if (category !== "ALL" && p.category !== category) return false;
      if (
        q &&
        !p.title.toLowerCase().includes(q) &&
        !p.brand.toLowerCase().includes(q) &&
        !(p.subtitle ?? "").toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });

    if (sortBy === "price_asc") {
      return [...list].sort((a, b) => a.price - b.price);
    }
    if (sortBy === "price_desc") {
      return [...list].sort((a, b) => b.price - a.price);
    }
    return list;
  }, [initialProducts, category, query, sortBy]);

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-10">
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-[#e60000]">
          Vodafone Online Mağaza
        </p>
        <h1 className="mt-1 text-3xl font-extrabold text-[#0d0d0d]">
          Cihazlar, Tarifeler ve Ev İnterneti
        </h1>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => setCategory(c.key)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                category === c.key
                  ? "bg-[#e60000] text-white"
                  : "bg-white text-[#333333] border border-neutral-200 hover:border-[#e60000]"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as "featured" | "price_asc" | "price_desc")
            }
            aria-label="Sıralama"
            className="rounded-full border border-neutral-300 bg-white px-4 py-2 text-xs font-semibold text-[#333333] outline-none focus:border-[#e60000]"
          >
            <option value="featured">Önerilen Sıralama</option>
            <option value="price_asc">Fiyat: Artan</option>
            <option value="price_desc">Fiyat: Azalan</option>
          </select>

          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Model, marka veya tarife ara..."
              className="w-60 rounded-full border border-neutral-300 bg-white pl-9 pr-4 py-2 text-xs text-[#333333] outline-none focus:border-[#e60000]"
            />
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-white py-16 px-6 text-center">
          <PackageOpen className="mx-auto h-10 w-10 text-neutral-400 mb-3" />
          <h2 className="text-lg font-bold text-[#0d0d0d]">Ürün bulunamadı</h2>
          <p className="mt-1 text-sm text-[#666666]">
            Farklı bir kategori veya arama kelimesi deneyebilirsiniz.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
