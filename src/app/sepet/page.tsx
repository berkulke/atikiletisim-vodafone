"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatTry } from "@/lib/slug";

export default function SepetPage() {
  const { items, totalAmount, updateQuantity, removeItem, clearCart, isHydrated } =
    useCart();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [tcIdentityLast4, setTcIdentityLast4] = useState("");
  const [city, setCity] = useState("İstanbul");
  const [district, setDistrict] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<
    "ADD_TO_BILL" | "CREDIT_CARD" | "ON_DELIVERY"
  >("ADD_TO_BILL");
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<{
    orderNumber: string;
    totalAmount: number;
  } | null>(null);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerPhone,
          customerEmail,
          tcIdentityLast4,
          city,
          district,
          addressLine,
          paymentMethod,
          notes: notes || undefined,
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            purchaseMode: i.purchaseMode,
          })),
        }),
      });

      const data = (await res.json()) as {
        error?: string;
        order?: { orderNumber: string; totalAmount: string | number };
      };

      if (!res.ok || !data.order) {
        setError(data.error ?? "Sipariş tamamlanamadı");
        return;
      }

      setCompletedOrder({
        orderNumber: data.order.orderNumber,
        totalAmount: Number(data.order.totalAmount),
      });
      clearCart();
    } catch {
      setError("Sunucu ile bağlantı kurulamadı");
    } finally {
      setSubmitting(false);
    }
  };

  if (completedOrder) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <div className="rounded-2xl bg-white p-8 sm:p-10 text-center vdf-card-shadow border border-neutral-100 space-y-5">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-[#009900]">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0d0d0d]">
            Siparişiniz Alındı!
          </h1>
          <p className="text-sm text-[#666666]">
            Vodafone Online Mağaza siparişiniz başarıyla oluşturuldu ve işleme alındı.
          </p>
          <div className="rounded-xl bg-[#f4f4f4] p-5 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#666666]">
              Sipariş Takip Numaranız
            </p>
            <p className="text-2xl font-black text-[#e60000]">
              {completedOrder.orderNumber}
            </p>
            <p className="text-sm font-bold text-[#0d0d0d] pt-1">
              Toplam Tutar: {formatTry(completedOrder.totalAmount)}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href={`/siparis-takip?orderNumber=${encodeURIComponent(
                completedOrder.orderNumber
              )}`}
              className="rounded-full bg-[#e60000] px-6 py-3 text-sm font-bold text-white hover:bg-[#bd0000]"
            >
              Siparişi Takip Et
            </Link>
            <Link
              href="/"
              className="rounded-full border border-neutral-300 px-6 py-3 text-sm font-bold text-[#333333] hover:bg-neutral-100"
            >
              Ana Sayfaya Dön
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!isHydrated) {
    return (
      <div className="mx-auto max-w-[1280px] px-4 py-12">
        <div className="h-64 rounded-2xl bg-white animate-pulse" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <div className="rounded-2xl bg-white p-10 text-center vdf-card-shadow border border-neutral-100 space-y-4">
          <ShoppingBag className="mx-auto h-12 w-12 text-neutral-400" />
          <h1 className="text-2xl font-extrabold text-[#0d0d0d]">
            Sepetiniz Şu An Boş
          </h1>
          <p className="text-sm text-[#666666]">
            En yeni akıllı telefonlar, faturalı tarifeler ve fiber ev interneti paketlerini keşfetmeye başlayın.
          </p>
          <Link
            href="/urunler"
            className="inline-flex items-center gap-2 rounded-full bg-[#e60000] px-6 py-3 text-sm font-bold text-white hover:bg-[#bd0000]"
          >
            <span>Mağazaya Git</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-10">
      <h1 className="text-3xl font-extrabold text-[#0d0d0d] mb-8">
        Sepetim ve Sipariş Tamamlama
      </h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Cart Items */}
        <div className="lg:col-span-7 space-y-4">
          {items.map((item) => {
            const unitPrice =
              item.purchaseMode === "INSTALLMENT" && item.installmentPrice
                ? item.installmentPrice
                : item.cashPrice;
            return (
              <div
                key={`${item.productId}-${item.purchaseMode}`}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl bg-white p-5 vdf-card-shadow border border-neutral-100"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-[#f8f8f8] p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="max-h-full w-auto object-contain"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-[#666666]">
                      {item.brand}
                    </p>
                    <Link
                      href={`/urunler/${item.slug}`}
                      className="text-base font-bold text-[#0d0d0d] hover:text-[#e60000]"
                    >
                      {item.title}
                    </Link>
                    <p className="mt-1 text-xs font-medium text-[#007c92]">
                      {item.purchaseMode === "INSTALLMENT" && item.installmentMonths
                        ? `Faturaya Ek ${item.installmentMonths} Ay Taksit`
                        : "Peşin / Aylık Ödeme"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-center">
                  <div className="flex items-center rounded-full border border-neutral-300">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.productId, item.purchaseMode, item.quantity - 1)
                      }
                      aria-label="Adet azalt"
                      className="p-2 text-[#333333] hover:text-[#e60000]"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="px-3 text-sm font-bold">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.productId, item.purchaseMode, item.quantity + 1)
                      }
                      aria-label="Adet artır"
                      className="p-2 text-[#333333] hover:text-[#e60000]"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <p className="min-w-[90px] text-right text-base font-extrabold text-[#e60000]">
                    {formatTry(unitPrice * item.quantity)}
                  </p>

                  <button
                    type="button"
                    onClick={() => removeItem(item.productId, item.purchaseMode)}
                    aria-label="Sepetten kaldır"
                    className="p-2 text-neutral-400 hover:text-[#e60000]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Checkout Form */}
        <div className="lg:col-span-5">
          <form
            onSubmit={handleCheckout}
            className="rounded-2xl bg-white p-6 vdf-card-shadow border border-neutral-100 space-y-4"
          >
            <h2 className="text-xl font-extrabold text-[#0d0d0d]">
              Teslimat ve Başvuru Bilgileri
            </h2>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-xs font-semibold text-[#e60000]">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#333333] mb-1">
                  Ad Soyad *
                </label>
                <input
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Örn: Ahmet Yılmaz"
                  className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm outline-none focus:border-[#e60000]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#333333] mb-1">
                    GSM Numarası *
                  </label>
                  <input
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="05421234567"
                    className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm outline-none focus:border-[#e60000]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#333333] mb-1">
                    E-posta *
                  </label>
                  <input
                    required
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="ahmet@ornek.com"
                    className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm outline-none focus:border-[#e60000]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#333333] mb-1">
                    İl *
                  </label>
                  <input
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm outline-none focus:border-[#e60000]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#333333] mb-1">
                    İlçe *
                  </label>
                  <input
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="Kadıköy"
                    className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm outline-none focus:border-[#e60000]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#333333] mb-1">
                    TC Son 4 Hane
                  </label>
                  <input
                    maxLength={4}
                    value={tcIdentityLast4}
                    onChange={(e) => setTcIdentityLast4(e.target.value)}
                    placeholder="1234"
                    className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm outline-none focus:border-[#e60000]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#333333] mb-1">
                  Açık Teslimat Adresi *
                </label>
                <textarea
                  required
                  rows={2}
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  placeholder="Mahalle, cadde, sokak, bina ve daire no..."
                  className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm outline-none focus:border-[#e60000]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#333333] mb-1">
                  Ödeme Yöntemi
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) =>
                    setPaymentMethod(
                      e.target.value as "ADD_TO_BILL" | "CREDIT_CARD" | "ON_DELIVERY"
                    )
                  }
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#e60000]"
                >
                  <option value="ADD_TO_BILL">Vodafone Faturasına Ek</option>
                  <option value="CREDIT_CARD">Kredi / Banka Kartı ile Ödeme</option>
                  <option value="ON_DELIVERY">Kurye ile Kapıda Ödeme</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#333333] mb-1">
                  Sipariş Notu (Opsiyonel)
                </label>
                <input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Teslimat veya hat aktivasyon notu"
                  className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm outline-none focus:border-[#e60000]"
                />
              </div>
            </div>

            <div className="border-t border-neutral-200 pt-4 space-y-2">
              <div className="flex items-center justify-between text-sm text-[#666666]">
                <span>Kargo / Kurye</span>
                <span className="font-semibold text-[#009900]">Ücretsiz</span>
              </div>
              <div className="flex items-center justify-between text-lg font-extrabold text-[#0d0d0d]">
                <span>Toplam Tutar</span>
                <span className="text-[#e60000]">{formatTry(totalAmount)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-[#e60000] py-3.5 text-sm font-bold text-white hover:bg-[#bd0000] disabled:opacity-60 transition-colors"
            >
              {submitting ? "Siparişiniz Oluşturuluyor..." : "Siparişi Onayla ve Satın Al"}
            </button>

            <p className="flex items-center justify-center gap-1.5 text-[11px] text-[#666666]">
              <ShieldCheck className="h-3.5 w-3.5 text-[#009900]" />
              <span>256-bit SSL güvencesiyle siparişiniz PostgreSQL veritabanına kaydedilir.</span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
