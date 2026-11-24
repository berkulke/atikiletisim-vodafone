"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, ShieldCheck, ShoppingBag, Truck } from "lucide-react";
import { useCart, type PurchaseMode } from "@/context/CartContext";
import { formatTry } from "@/lib/slug";
import type { ProductDto } from "./ProductCard";

export function ProductDetailClient({ product }: { product: ProductDto }) {
  const { addItem } = useCart();
  const hasInstallment = Boolean(product.installmentPrice && product.installmentMonths);
  const [mode, setMode] = useState<PurchaseMode>(
    hasInstallment ? "INSTALLMENT" : "CASH"
  );
  const [added, setAdded] = useState(false);

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
        purchaseMode: mode,
      },
      1
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-10">
      <Link
        href="/urunler"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#666666] hover:text-[#e60000] mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Tüm Ürünlere Dön</span>
      </Link>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 rounded-2xl bg-white p-6 sm:p-10 vdf-card-shadow border border-neutral-100">
        {/* Image */}
        <div className="lg:col-span-5 flex items-center justify-center rounded-xl bg-[#f8f8f8] p-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.imageUrl}
            alt={product.title}
            className="max-h-96 w-auto object-contain"
          />
        </div>

        {/* Details */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#e60000]">
              {product.brand}
            </p>
            <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-[#0d0d0d]">
              {product.title}
            </h1>
            {product.subtitle && (
              <p className="mt-2 text-base font-medium text-[#666666]">
                {product.subtitle}
              </p>
            )}
            <p className="mt-4 text-sm text-[#333333] leading-relaxed">
              {product.description}
            </p>

            {/* Purchase Mode Selector */}
            <div className="mt-6 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-[#666666]">
                Ödeme Seçeneği
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {hasInstallment && (
                  <button
                    type="button"
                    onClick={() => setMode("INSTALLMENT")}
                    className={`rounded-xl border-2 p-4 text-left transition-colors ${
                      mode === "INSTALLMENT"
                        ? "border-[#e60000] bg-red-50/50"
                        : "border-neutral-200 hover:border-neutral-300"
                    }`}
                  >
                    <p className="text-xs font-semibold text-[#666666]">
                      Faturaya Ek {product.installmentMonths} Ay
                    </p>
                    <p className="mt-1 text-2xl font-extrabold text-[#e60000]">
                      {formatTry(product.installmentPrice ?? 0)}
                      <span className="text-xs font-normal text-[#666666]"> / ay</span>
                    </p>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setMode("CASH")}
                  className={`rounded-xl border-2 p-4 text-left transition-colors ${
                    mode === "CASH"
                      ? "border-[#e60000] bg-red-50/50"
                      : "border-neutral-200 hover:border-neutral-300"
                  }`}
                >
                  <p className="text-xs font-semibold text-[#666666]">
                    {product.category === "TARIFF" || product.category === "HOME_INTERNET"
                      ? "Aylık Sabit Ücret"
                      : "Peşin Fiyat"}
                  </p>
                  <p className="mt-1 text-2xl font-extrabold text-[#0d0d0d]">
                    {formatTry(product.price)}
                  </p>
                </button>
              </div>
            </div>

            {/* Specs */}
            {Object.keys(product.specs).length > 0 && (
              <div className="mt-6">
                <p className="text-xs font-bold uppercase tracking-wider text-[#666666] mb-3">
                  Özellikler
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {Object.entries(product.specs).map(([k, v]) => (
                    <div
                      key={k}
                      className="rounded-lg bg-[#f4f4f4] px-3 py-2 text-xs"
                    >
                      <span className="block text-[#666666]">{k}</span>
                      <span className="font-bold text-[#0d0d0d]">{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-neutral-100 pt-5 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={product.stock <= 0}
                onClick={handleAdd}
                className={`flex-1 min-w-[200px] inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-bold transition-colors ${
                  product.stock <= 0
                    ? "bg-neutral-200 text-neutral-500 cursor-not-allowed"
                    : added
                      ? "bg-[#009900] text-white"
                      : "bg-[#e60000] text-white hover:bg-[#bd0000]"
                }`}
              >
                {added ? (
                  <>
                    <Check className="h-5 w-5" />
                    <span>Sepete Eklendi</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-5 w-5" />
                    <span>{product.stock <= 0 ? "Stokta Yok" : "Sepete Ekle"}</span>
                  </>
                )}
              </button>
              <Link
                href="/sepet"
                className="rounded-full border border-[#0d0d0d] px-6 py-3.5 text-sm font-bold text-[#0d0d0d] hover:bg-[#0d0d0d] hover:text-white transition-colors"
              >
                Sepete Git
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs text-[#666666]">
              <span className="inline-flex items-center gap-1.5">
                <Truck className="h-4 w-4 text-[#e60000]" />
                Ücretsiz Kurye Teslimatı
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-[#e60000]" />
                Vodafone Türkiye Garantili (Stok: {product.stock})
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
