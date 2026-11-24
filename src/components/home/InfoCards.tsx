import React from "react";
import Link from "next/link";
import { ShieldCheck, Truck, Zap, RefreshCw } from "lucide-react";

const CARDS = [
  {
    icon: Zap,
    title: "5G & Fiber Hızında",
    description: "Türkiye'nin dört bir yanında kesintisiz mobil ve fiber ev interneti deneyimi.",
    href: "/urunler?category=HOME_INTERNET",
  },
  {
    icon: Truck,
    title: "Hızlı ve Ücretsiz Teslimat",
    description: "Online mağazadan alınan tüm telefon ve aksesuarlarda ücretsiz kurye teslimatı.",
    href: "/urunler?category=DEVICE",
  },
  {
    icon: RefreshCw,
    title: "Otomatik Kampanya Güncelleme",
    description: "Vodafone Türkiye kampanyaları sistemimizde her zaman güncel olarak listelenir.",
    href: "/kampanyalar",
  },
  {
    icon: ShieldCheck,
    title: "Güvenli Sipariş Takibi",
    description: "Sipariş numaranızla cihaz ve tarife başvurularınızın durumunu anlık takip edin.",
    href: "/siparis-takip",
  },
];

export function InfoCards() {
  return (
    <section className="mx-auto max-w-[1280px] px-4 py-14">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              href={card.href}
              className="group rounded-xl bg-white p-6 vdf-card-shadow border border-neutral-100 transition-transform hover:-translate-y-1"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-[#e60000] group-hover:bg-[#e60000] group-hover:text-white transition-colors">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-[#0d0d0d]">{card.title}</h3>
              <p className="mt-1.5 text-sm text-[#666666] leading-relaxed">
                {card.description}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
