"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MessageCircle, X, ArrowRight } from "lucide-react";

export function TobiWidget() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="mb-3 w-80 rounded-2xl bg-white shadow-2xl border border-neutral-200 overflow-hidden">
          <div className="flex items-center justify-between bg-[#e60000] px-4 py-3 text-white">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#e60000] font-black text-sm">
                T
              </span>
              <div>
                <p className="text-sm font-bold leading-tight">TOBi Asistan</p>
                <p className="text-[11px] text-white/80">Size nasıl yardımcı olabilirim?</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="TOBi penceresini kapat"
              className="rounded-full p-1 hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="p-4 space-y-2.5 text-sm">
            <p className="text-xs text-[#666666]">
              Hızlı erişmek istediğiniz işlemi seçebilirsiniz:
            </p>
            <Link
              href="/kampanyalar"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between rounded-xl border border-neutral-200 px-3.5 py-2.5 font-medium text-[#0d0d0d] hover:border-[#e60000] hover:text-[#e60000]"
            >
              <span>Güncel Kampanyaları Gör</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/urunler?category=DEVICE"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between rounded-xl border border-neutral-200 px-3.5 py-2.5 font-medium text-[#0d0d0d] hover:border-[#e60000] hover:text-[#e60000]"
            >
              <span>Faturaya Ek Telefonlar</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/siparis-takip"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between rounded-xl border border-neutral-200 px-3.5 py-2.5 font-medium text-[#0d0d0d] hover:border-[#e60000] hover:text-[#e60000]"
            >
              <span>Sipariş Durumu Sorgula</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="TOBi Asistan"
        className="flex items-center gap-2 rounded-full bg-[#e60000] px-4 py-3 text-sm font-bold text-white shadow-lg hover:bg-[#bd0000] transition-transform hover:scale-105"
      >
        <MessageCircle className="h-5 w-5" />
        <span>TOBi</span>
      </button>
    </div>
  );
}
