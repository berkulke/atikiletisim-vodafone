"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  MapPin,
  Search,
  ShoppingBag,
  User,
  Menu,
  X,
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  Phone,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import type { SiteSettingsDto } from "@/lib/settings";

export interface NavPageItem {
  id: string;
  slug: string;
  title: string;
  showInHeader: boolean;
  showInFooter: boolean;
}

const STATIC_NAV_LINKS = [
  { label: "Mobil", href: "/urunler?category=TARIFF" },
  { label: "Ev İnterneti", href: "/urunler?category=HOME_INTERNET" },
  { label: "Telefonlar & Cihazlar", href: "/urunler?category=DEVICE" },
  { label: "Kampanyalar", href: "/kampanyalar", highlight: true },
  { label: "Blog", href: "/blog" },
  { label: "İletişim", href: "/iletisim" },
];

const KURUMSAL_DROPDOWN = [
  { label: "Hakkımızda", href: "/kurumsal/hakkimizda" },
  { label: "Misyon & Vizyon", href: "/kurumsal/misyon-vizyon" },
  { label: "Sıkça Sorulan Sorular", href: "/kurumsal/sss" },
  { label: "Şubelerimiz", href: "/subelerimiz" },
];

export function Header({
  settings,
  customPages = [],
}: {
  settings: SiteSettingsDto;
  customPages?: NavPageItem[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { totalCount } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const headerPages = customPages
    .filter((p) => p.showInHeader)
    .map((p) => ({ label: p.title, href: `/sayfa/${p.slug}`, highlight: false }));

  const navLinks = [...STATIC_NAV_LINKS, ...headerPages];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    setSearchOpen(false);
    router.push(`/urunler?q=${encodeURIComponent(q)}`);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
      {/* Top Utility Bar */}
      <div className="bg-[#0d0d0d] text-white text-xs">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-4 py-2">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="font-semibold text-white border-b-2 border-[#e60000] pb-0.5"
            >
              Bireysel
            </Link>
            <Link
              href="/urunler?category=TARIFF"
              className="text-neutral-300 hover:text-white transition-colors"
            >
              Kurumsal
            </Link>
            <span className="hidden md:inline text-neutral-400">
              {settings.tagline}
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-5 text-neutral-300">
            <a
              href={`tel:${settings.phone.replace(/\s+/g, "")}`}
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <Phone className="h-3.5 w-3.5 text-[#e60000]" />
              <span>{settings.phone}</span>
            </a>
            <Link
              href="/siparis-takip"
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <MapPin className="h-3.5 w-3.5 text-[#e60000]" />
              <span>Sipariş Takip</span>
            </Link>
            <Link
              href="/admin"
              className="flex items-center gap-1 text-neutral-200 hover:text-white transition-colors"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-[#e60000]" />
              <span>Admin Paneli</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-4 h-[68px]">
          <div className="flex items-center gap-7">
            <Link
              href="/"
              className="flex items-center gap-2.5 shrink-0"
              aria-label={`${settings.brandName} Ana Sayfa`}
            >
              {settings.logoUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={settings.logoUrl}
                  alt={settings.brandName}
                  className="h-10 w-auto max-w-[160px] object-contain"
                />
              ) : (
                <>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e60000] text-white font-black text-xl shadow-sm">
                    {settings.brandName.charAt(0).toUpperCase()}
                  </span>
                  <div className="flex flex-col leading-none">
                    <span className="text-[18px] font-extrabold tracking-tight text-[#0d0d0d]">
                      {settings.brandName}
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-[#e60000]">
                      vodafone
                    </span>
                  </div>
                </>
              )}
            </Link>

            <nav className="hidden lg:flex items-center gap-5">
              {navLinks.map((item) => {
                const isActive =
                  item.href === "/kampanyalar"
                    ? pathname.startsWith("/kampanyalar")
                    : pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative text-[14px] font-medium transition-colors py-2 ${
                      isActive
                        ? "text-[#e60000] font-semibold"
                        : item.highlight
                          ? "text-[#0d0d0d] hover:text-[#e60000] font-semibold"
                          : "text-[#333333] hover:text-[#e60000]"
                    }`}
                  >
                    {item.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#e60000] rounded-full" />
                    )}
                  </Link>
                );
              })}

              {/* Kurumsal Dropdown */}
              <div className="relative group">
                <button
                  type="button"
                  className={`inline-flex items-center gap-1 text-[14px] font-medium py-2 transition-colors ${
                    pathname.startsWith("/kurumsal") || pathname.startsWith("/subelerimiz")
                      ? "text-[#e60000] font-semibold"
                      : "text-[#333333] hover:text-[#e60000]"
                  }`}
                >
                  <span>Kurumsal</span>
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-150 absolute left-0 top-full w-56 rounded-xl bg-white shadow-xl border border-neutral-200 py-2 z-50">
                  {KURUMSAL_DROPDOWN.map((sub) => (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      className="block px-4 py-2.5 text-sm font-medium text-[#333333] hover:bg-red-50 hover:text-[#e60000]"
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
              </div>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSearchOpen((v) => !v)}
              aria-label="Site içi arama"
              className="flex h-10 w-10 items-center justify-center rounded-full text-[#333333] hover:bg-neutral-100 transition-colors"
            >
              <Search className="h-5 w-5" />
            </button>

            <Link
              href="/sepet"
              aria-label="Sepetim"
              className="relative flex h-10 items-center gap-2 rounded-full border border-neutral-200 px-3.5 text-sm font-semibold text-[#0d0d0d] hover:border-[#e60000] hover:text-[#e60000] transition-colors"
            >
              <ShoppingBag className="h-4 w-4 text-[#e60000]" />
              <span className="hidden sm:inline">Sepet</span>
              {totalCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#e60000] px-1.5 text-[11px] font-bold text-white">
                  {totalCount}
                </span>
              )}
            </Link>

            <Link
              href="/admin"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[#e60000] px-4 py-2 text-sm font-semibold text-white hover:bg-[#bd0000] transition-colors"
            >
              <User className="h-4 w-4" />
              <span>Yönetim</span>
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Menüyü aç"
              className="flex lg:hidden h-10 w-10 items-center justify-center rounded-full text-[#333333] hover:bg-neutral-100"
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Search Drawer */}
        {searchOpen && (
          <div className="border-t border-neutral-200 bg-[#f4f4f4] py-3 px-4">
            <form
              onSubmit={handleSearch}
              className="mx-auto flex max-w-[720px] items-center gap-2"
            >
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Telefon, tarife, ev interneti veya marka ara..."
                className="flex-1 rounded-full border border-neutral-300 bg-white px-5 py-2.5 text-sm text-[#333333] outline-none focus:border-[#e60000]"
              />
              <button
                type="submit"
                className="rounded-full bg-[#e60000] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#bd0000]"
              >
                Ara
              </button>
            </form>
          </div>
        )}

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-neutral-200 bg-white px-4 py-4 space-y-1">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between rounded-lg px-3 py-3 text-sm font-medium text-[#333333] hover:bg-neutral-100 hover:text-[#e60000]"
              >
                <span>{item.label}</span>
                <ChevronRight className="h-4 w-4 text-neutral-400" />
              </Link>
            ))}
            <div className="pt-2 pb-1 px-3 text-xs font-bold uppercase tracking-wider text-neutral-400">
              Kurumsal
            </div>
            {KURUMSAL_DROPDOWN.map((sub) => (
              <Link
                key={sub.href}
                href={sub.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-[#333333] hover:bg-neutral-100 hover:text-[#e60000]"
              >
                <span>{sub.label}</span>
                <ChevronRight className="h-4 w-4 text-neutral-400" />
              </Link>
            ))}
            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between rounded-lg px-3 py-3 text-sm font-semibold text-[#e60000] bg-red-50"
            >
              <span>Admin Paneli</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
