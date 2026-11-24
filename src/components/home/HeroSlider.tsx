"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from "lucide-react";

const SLIDES = [
  {
    id: "red-tarifeler",
    badge: "VODAFONE RED AYRICALIKLARI",
    title: "Sınırsız Sosyal Medya ve Bol GB’lı Red Tarifeleri",
    subtitle:
      "Numaranızı taşıyın veya yeni hat alın; ilk 3 ay ekstra indirim ve marka ayrıcalıklarından hemen yararlanın.",
    ctaLabel: "Tarifeleri İncele",
    ctaHref: "/urunler?category=TARIFF",
    secondaryLabel: "Kampanyaları Gör",
    secondaryHref: "/kampanyalar?category=red-marka-ayricaliklari",
    accent: "from-[#0d0d0d] via-[#4a0000] to-[#e60000]",
  },
  {
    id: "cihaz-firsati",
    badge: "FATURAYA EK 12 AY TAKSİT",
    title: "En Yeni Akıllı Telefonlar Vodafone Güvencesiyle",
    subtitle:
      "iPhone 16 Pro, Samsung Galaxy S25 ve Xiaomi amiral gemisi modellerini peşin veya faturaya ek ödeme ile hemen satın alın.",
    ctaLabel: "Cihazları Keşfet",
    ctaHref: "/urunler?category=DEVICE",
    secondaryLabel: "Sepete Git",
    secondaryHref: "/sepet",
    accent: "from-[#1a0505] via-[#7a0000] to-[#bd0000]",
  },
  {
    id: "fiber-internet",
    badge: "1000 MBPS’E VARAN FİBER HIZ",
    title: "Vodafone Ev İnterneti ile 30 Gün İade Garantisi",
    subtitle:
      "Mobil faturalı müşterilere özel ek indirim ve ücretsiz kurulum avantajıyla fiber dünyasına adım atın.",
    ctaLabel: "Ev İnterneti Paketleri",
    ctaHref: "/urunler?category=HOME_INTERNET",
    secondaryLabel: "Ev İnterneti Kampanyaları",
    secondaryHref: "/kampanyalar?category=ev-interneti-kampanyalari",
    accent: "from-[#0d0d0d] via-[#003b46] to-[#007c92]",
  },
];

export function HeroSlider() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[active];

  return (
    <section className={`relative overflow-hidden bg-gradient-to-r ${slide.accent} text-white transition-colors duration-500`}>
      <div className="mx-auto max-w-[1280px] px-4 py-14 sm:py-20 lg:py-24">
        <div className="max-w-2xl space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1 text-xs font-bold tracking-wider uppercase backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            <span>{slide.badge}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight">
            {slide.title}
          </h1>

          <p className="text-base sm:text-lg text-white/85 leading-relaxed">
            {slide.subtitle}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href={slide.ctaHref}
              className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-[#e60000] shadow-md hover:bg-neutral-100 transition-colors"
            >
              <span>{slide.ctaLabel}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={slide.secondaryHref}
              className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white hover:bg-white/20 transition-colors"
            >
              <span>{slide.secondaryLabel}</span>
            </Link>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {SLIDES.map((s, index) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setActive(index)}
                aria-label={`Slayt ${index + 1}`}
                className={`h-2 rounded-full transition-all ${
                  index === active ? "w-8 bg-white" : "w-2 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActive((prev) => (prev - 1 + SLIDES.length) % SLIDES.length)}
              aria-label="Önceki slayt"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-black/20 text-white hover:bg-black/40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setActive((prev) => (prev + 1) % SLIDES.length)}
              aria-label="Sonraki slayt"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-black/20 text-white hover:bg-black/40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
