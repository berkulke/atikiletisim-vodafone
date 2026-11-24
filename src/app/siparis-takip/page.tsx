"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PackageSearch, Search } from "lucide-react";
import { formatTry } from "@/lib/slug";

interface TrackedOrder {
  orderNumber: string;
  status: string;
  paymentMethod: string;
  totalAmount: string | number;
  city: string;
  district: string;
  createdAt: string;
  items: Array<{
    id: string;
    title: string;
    quantity: number;
    unitPrice: string | number;
    purchaseMode: string;
  }>;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Onay Bekliyor", color: "bg-amber-100 text-amber-800" },
  CONFIRMED: { label: "Onaylandı / Hazırlanıyor", color: "bg-blue-100 text-blue-800" },
  SHIPPED: { label: "Kuryeye Verildi", color: "bg-indigo-100 text-indigo-800" },
  COMPLETED: { label: "Teslim Edildi", color: "bg-emerald-100 text-emerald-800" },
  CANCELLED: { label: "İptal Edildi", color: "bg-red-100 text-red-800" },
};

function SiparisTakipInner() {
  const searchParams = useSearchParams();
  const initialNumber = searchParams.get("orderNumber") ?? "";
  const [orderNumber, setOrderNumber] = useState(initialNumber);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<TrackedOrder | null>(null);

  const lookup = async (num: string) => {
    const clean = num.trim();
    if (!clean) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/orders?orderNumber=${encodeURIComponent(clean)}`
      );
      const data = (await res.json()) as { error?: string; order?: TrackedOrder };
      if (!res.ok || !data.order) {
        setOrder(null);
        setError(data.error ?? "Sipariş bulunamadı");
        return;
      }
      setOrder(data.order);
    } catch {
      setError("Sorgulama sırasında bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialNumber) return;
    const id = window.setTimeout(() => {
      void lookup(initialNumber);
    }, 0);
    return () => window.clearTimeout(id);
  }, [initialNumber]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void lookup(orderNumber);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="rounded-2xl bg-white p-6 sm:p-8 vdf-card-shadow border border-neutral-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-[#e60000]">
            <PackageSearch className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-[#0d0d0d]">
              Sipariş Takibi
            </h1>
            <p className="text-xs text-[#666666]">
              Sipariş numaranızı girerek güncel durumunuzu sorgulayabilirsiniz.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 mt-6">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="Örn: VDF-2026-123456"
              className="w-full rounded-full border border-neutral-300 pl-10 pr-4 py-3 text-sm outline-none focus:border-[#e60000]"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-[#e60000] px-7 py-3 text-sm font-bold text-white hover:bg-[#bd0000] disabled:opacity-60"
          >
            {loading ? "Sorgulanıyor..." : "Sorgula"}
          </button>
        </form>

        {error && (
          <div className="mt-5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm font-medium text-[#e60000]">
            {error}
          </div>
        )}

        {order && (
          <div className="mt-8 border-t border-neutral-200 pt-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs text-[#666666]">Sipariş Numarası</p>
                <p className="text-xl font-black text-[#0d0d0d]">{order.orderNumber}</p>
              </div>
              <span
                className={`rounded-full px-3.5 py-1.5 text-xs font-bold ${
                  STATUS_LABELS[order.status]?.color ?? "bg-neutral-100 text-neutral-800"
                }`}
              >
                {STATUS_LABELS[order.status]?.label ?? order.status}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 rounded-xl bg-[#f4f4f4] p-4 text-xs">
              <div>
                <span className="block text-[#666666]">Teslimat Bölgesi</span>
                <span className="font-bold text-[#0d0d0d]">
                  {order.district} / {order.city}
                </span>
              </div>
              <div>
                <span className="block text-[#666666]">Sipariş Tarihi</span>
                <span className="font-bold text-[#0d0d0d]">
                  {new Date(order.createdAt).toLocaleString("tr-TR")}
                </span>
              </div>
              <div>
                <span className="block text-[#666666]">Toplam Tutar</span>
                <span className="font-extrabold text-[#e60000]">
                  {formatTry(Number(order.totalAmount))}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-[#666666]">
                Sipariş Kalemleri
              </p>
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-xl border border-neutral-200 px-4 py-3 text-sm"
                >
                  <div>
                    <p className="font-bold text-[#0d0d0d]">{item.title}</p>
                    <p className="text-xs text-[#666666]">
                      Adet: {item.quantity} •{" "}
                      {item.purchaseMode === "INSTALLMENT" ? "Faturaya Ek" : "Peşin"}
                    </p>
                  </div>
                  <p className="font-bold text-[#0d0d0d]">
                    {formatTry(Number(item.unitPrice) * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SiparisTakipPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-3xl px-4 py-12">
          <div className="h-64 rounded-2xl bg-white animate-pulse" />
        </div>
      }
    >
      <SiparisTakipInner />
    </Suspense>
  );
}
