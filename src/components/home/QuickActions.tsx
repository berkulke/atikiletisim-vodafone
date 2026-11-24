import React from "react";
import Link from "next/link";
import {
  Smartphone,
  Wifi,
  Gift,
  Signal,
  PackageSearch,
  Headphones,
} from "lucide-react";

const QUICK_ACTIONS = [
  {
    label: "Tarifeler",
    sub: "Red & FreeZone",
    href: "/urunler?category=TARIFF",
    icon: Signal,
  },
  {
    label: "Telefonlar",
    sub: "Faturaya Ek 12 Ay",
    href: "/urunler?category=DEVICE",
    icon: Smartphone,
  },
  {
    label: "Ev İnterneti",
    sub: "1000 Mbps Fiber",
    href: "/urunler?category=HOME_INTERNET",
    icon: Wifi,
  },
  {
    label: "Kampanyalar",
    sub: "Dinamik Fırsatlar",
    href: "/kampanyalar",
    icon: Gift,
  },
  {
    label: "Aksesuarlar",
    sub: "Akıllı Saat & Kulaklık",
    href: "/urunler?category=ACCESSORY",
    icon: Headphones,
  },
  {
    label: "Sipariş Takip",
    sub: "Anlık Durum Sorgula",
    href: "/siparis-takip",
    icon: PackageSearch,
  },
];

export function QuickActions() {
  return (
    <section className="-mt-6 relative z-10 mx-auto max-w-[1280px] px-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {QUICK_ACTIONS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className="group flex flex-col items-center justify-center rounded-xl bg-white p-4 text-center vdf-card-shadow transition-transform duration-200 hover:-translate-y-1 border border-neutral-100"
            >
              <div className="mb-2.5 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-[#e60000] group-hover:bg-[#e60000] group-hover:text-white transition-colors">
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-sm font-bold text-[#0d0d0d] group-hover:text-[#e60000] transition-colors">
                {item.label}
              </span>
              <span className="mt-0.5 text-[11px] text-[#666666]">{item.sub}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
