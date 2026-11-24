import React, { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { Clock, MapPin, MessageSquare, Navigation, Phone, Store } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getOrSetCache } from "@/lib/redis";
import { getSiteSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Şubelerimiz | Atik İletişim Gaziantep",
  description:
    "Atik İletişim Gaziantep şubeleri: Balıklı, Heykel, Karagöz, Düztepe, Karşıyaka, Kayaönü, Gazikent, Cumhuriyet, Karataş ve Primemall şubelerimiz.",
};

async function BranchesContent() {
  await connection();
  let branches: Array<{
    id: string;
    name: string;
    city: string;
    district: string;
    address: string;
    phone: string;
    whatsappPhone: string;
    workingHours: string;
    mapUrl: string;
  }> = [];

  try {
    branches = await getOrSetCache("branches:active:v1", 180, async () =>
      prisma.branch.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      })
    );
  } catch {
    branches = [];
  }

  const settings = await getSiteSettings();

  return (
    <div className="min-h-screen bg-[#f4f4f4]">
      <div className="bg-gradient-to-r from-[#0d0d0d] via-[#4a0000] to-[#e60000] text-white">
        <div className="mx-auto max-w-[1280px] px-4 py-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1 text-xs font-bold uppercase tracking-wider">
            <Store className="h-3.5 w-3.5" />
            <span>{settings.brandName}</span>
          </div>
          <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold">
            Gaziantep Şubelerimiz
          </h1>
          <p className="mt-2 max-w-2xl text-sm sm:text-base text-white/85">
            Size en yakın {settings.brandName} Vodafone satış ve destek noktalarımızı ziyaret edebilir veya WhatsApp üzerinden doğrudan ulaşabilirsiniz.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[1280px] px-4 py-12">
        {branches.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-300 bg-white py-16 px-6 text-center">
            <MapPin className="mx-auto h-10 w-10 text-neutral-400 mb-3" />
            <p className="text-base font-bold text-[#0d0d0d]">
              Henüz aktif şube bulunmuyor
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {branches.map((branch) => {
              const waNumber = (branch.whatsappPhone || settings.whatsappPhone).replace(/\D/g, "");
              const waHref = `https://wa.me/${waNumber}?text=${encodeURIComponent(
                `Merhaba, ${branch.name} şubeniz hakkında bilgi almak istiyorum.`
              )}`;
              return (
                <div
                  key={branch.id}
                  className="flex flex-col justify-between rounded-2xl bg-white p-6 vdf-card-shadow border border-neutral-100 hover:-translate-y-1 transition-transform"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-[#e60000]">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{branch.city}</span>
                      </span>
                      <span className="text-xs font-semibold text-[#666666]">
                        {branch.district}
                      </span>
                    </div>

                    <h2 className="mt-4 text-lg font-extrabold text-[#0d0d0d]">
                      {branch.name}
                    </h2>

                    <div className="mt-3 space-y-2 text-xs text-[#666666]">
                      {branch.address && (
                        <p className="flex items-start gap-2">
                          <MapPin className="h-3.5 w-3.5 text-[#e60000] shrink-0 mt-0.5" />
                          <span>{branch.address}</span>
                        </p>
                      )}
                      {branch.phone && (
                        <p className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5 text-[#e60000] shrink-0" />
                          <span>{branch.phone}</span>
                        </p>
                      )}
                      <p className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-[#e60000] shrink-0" />
                        <span>{branch.workingHours}</span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-neutral-100 flex items-center gap-2">
                    <a
                      href={waHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-[#25D366] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#1ebe5d]"
                    >
                      <MessageSquare className="h-3.5 w-3.5 fill-white" />
                      <span>WhatsApp</span>
                    </a>
                    {branch.mapUrl && (
                      <a
                        href={branch.mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 rounded-full border border-neutral-300 px-4 py-2.5 text-xs font-bold text-[#333333] hover:border-[#0d0d0d]"
                      >
                        <Navigation className="h-3.5 w-3.5 text-[#e60000]" />
                        <span>Yol Tarifi</span>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SubelerimizPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1280px] px-4 py-12">
          <div className="h-64 rounded-2xl bg-white animate-pulse" />
        </div>
      }
    >
      <BranchesContent />
    </Suspense>
  );
}
