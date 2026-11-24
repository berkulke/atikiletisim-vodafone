"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, ShoppingBag, Sparkles } from "lucide-react";
import { useCart, type PurchaseMode } from "@/context/CartContext";
import { formatTry } from "@/lib/slug";

export interface ProductDto {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string;
  category: "DEVICE" | "TARIFF" | "HOME_INTERNET" | "ACCESSORY";
  brand: string;
  price: number;
  installmentPrice: number | null;
  installmentMonths: number | null;
  specs: Record<string, string | number | boolean>;
  imageUrl: string;
  stock: number;
  isFeatured: boolean;
  isActive?: boolean;
}

const CATEGORY_LABELS: Record<ProductDto["category"], string> = {
  DEVICE: "Akıllı Telefon",
  TARIFF: "Mobil Tarife",
  HOME_INTERNET: "Ev İnterneti",
  ACCESSORY: "Aksesuar",
};

export function ProductCard({ product }: { product: ProductDto }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const defaultMode: PurchaseMode =
    product.installmentPrice && product.category === "DEVICE" ? "INSTALLMENT" : "CASH";

  const handleAdd = () => {
    addItem(
      {
        productId: product.id,
        slug: product.slug,
        title: product.title,
        imageUrl: product.imageUrl,
        brand: product.brand,
        category: product.category,
        cashPrice: product.price,
        installmentPrice: product.installmentPrice,
        installmentMonths: product.installmentMonths,
        purchaseMode: defaultMode,
      },
      1
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  const specEntries = Object.entries(product.specs).slice(0, 3);

  return (
    <div className="group flex flex-col justify-between rounded-xl bg-white p-5 vdf-card-shadow border border-neutral-100 transition-all duration-200 hover:-translate-y-1">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-semibold text-[#333333]">
            {CATEGORY_LABELS[product.category]}
          </span>
          {product.isFeatured && (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-bold text-[#e60000]">
              <Sparkles className="h-3 w-3" />
              Öne Çıkan
            </span>
          )}
        </div>

        <Link href={`/urunler/${product.slug}`} className="block">
          <div className="relative mb-4 flex h-44 items-center justify-center overflow-hidden rounded-lg bg-[#f8f8f8] p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.imageUrl}
              alt={product.title}
              className="max-h-full w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#666666]">
            {product.brand}
          </p>
          <h3 className="mt-1 text-base font-bold text-[#0d0d0d] group-hover:text-[#e60000] transition-colors line-clamp-2">
            {product.title}
          </h3>
        </Link>

        {product.subtitle && (
          <p className="mt-1 text-xs text-[#666666] line-clamp-1">{product.subtitle}</p>
        )}

        {specEntries.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {specEntries.map(([key, val]) => (
              <span
                key={key}
                className="rounded-md bg-[#f4f4f4] px-2 py-1 text-[11px] font-medium text-[#333333]"
              >
                {String(val)}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-5 border-t border-neutral-100 pt-4">
        {product.installmentPrice && product.installmentMonths ? (
          <div className="mb-3">
            <p className="text-[11px] font-medium text-[#666666]">
              Faturaya Ek {product.installmentMonths} Ay
            </p>
            <p className="text-xl font-extrabold text-[#e60000]">
              {formatTry(product.installmentPrice)}
              <span className="text-xs font-semibold text-[#666666]"> / ay</span>
            </p>
            <p className="text-[11px] text-[#666666]">
              Peşin: {formatTry(product.price)}
            </p>
          </div>
        ) : (
          <div className="mb-3">
            <p className="text-[11px] font-medium text-[#666666]">
              {product.category === "TARIFF" || product.category === "HOME_INTERNET"
                ? "Aylık Sabit Ücret"
                : "Peşin Satış Fiyatı"}
            </p>
            <p className="text-xl font-extrabold text-[#e60000]">
              {formatTry(product.price)}
              {(product.category === "TARIFF" || product.category === "HOME_INTERNET") && (
                <span className="text-xs font-semibold text-[#666666]"> / ay</span>
              )}
            </p>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={product.stock <= 0}
            onClick={handleAdd}
            className={`flex-1 inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold transition-colors ${
              product.stock <= 0
                ? "bg-neutral-200 text-neutral-500 cursor-not-allowed"
                : added
                  ? "bg-[#009900] text-white"
                  : "bg-[#e60000] text-white hover:bg-[#bd0000]"
            }`}
          >
            {added ? (
              <>
                <Check className="h-4 w-4" />
                <span>Sepete Eklendi</span>
              </>
            ) : (
              <>
                <ShoppingBag className="h-4 w-4" />
                <span>{product.stock <= 0 ? "Tükendi" : "Sepete Ekle"}</span>
              </>
            )}
          </button>
          <Link
            href={`/urunler/${product.slug}`}
            className="rounded-full border border-neutral-300 px-3.5 py-2.5 text-xs font-semibold text-[#333333] hover:border-[#0d0d0d] hover:text-[#0d0d0d]"
          >
            İncele
          </Link>
        </div>
      </div>
    </div>
  );
}
