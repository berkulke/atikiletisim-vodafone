import React from "react";
import Link from "next/link";
import { ExternalLink, Mail, MapPin, Phone } from "lucide-react";
import type { SiteSettingsDto } from "@/lib/settings";
import type { NavPageItem } from "./Header";

export function Footer({
  settings,
  customPages = [],
}: {
  settings: SiteSettingsDto;
  customPages?: NavPageItem[];
}) {
  const footerPages = customPages.filter((p) => p.showInFooter);

  return (
    <footer className="bg-[#0d0d0d] text-neutral-300 mt-auto">
      <div className="mx-auto max-w-[1280px] px-4 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand & Contact */}
          <div className="space-y-3">
            <h3 className="text-base font-extrabold text-white">
              {settings.brandName}
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              {settings.tagline}
            </p>
            <div className="space-y-2 pt-2 text-xs text-neutral-400">
              <p className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-[#e60000]" />
                <span>{settings.phone}</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-[#e60000]" />
                <span>{settings.email}</span>
              </p>
              <p className="flex items-start gap-2">
                <MapPin className="h-3.5 w-3.5 text-[#e60000] shrink-0 mt-0.5" />
                <span>
                  {settings.address} ({settings.district} / {settings.city})
                </span>
              </p>
              {settings.instagramUrl && (
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-white hover:text-[#e60000] pt-1 font-semibold"
                >
                  <ExternalLink className="h-4 w-4 text-[#e60000]" />
                  <span>Instagram: @atikiletisim</span>
                </a>
              )}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">
              Ürün ve Hizmetler
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/urunler?category=TARIFF" className="text-neutral-400 hover:text-white">
                  Faturalı Tarifeler
                </Link>
              </li>
              <li>
                <Link href="/urunler?category=DEVICE" className="text-neutral-400 hover:text-white">
                  Telefonlar &amp; Cihazlar
                </Link>
              </li>
              <li>
                <Link href="/urunler?category=HOME_INTERNET" className="text-neutral-400 hover:text-white">
                  Ev İnterneti
                </Link>
              </li>
              <li>
                <Link href="/urunler?category=ACCESSORY" className="text-neutral-400 hover:text-white">
                  Aksesuarlar
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">
              Kampanyalar &amp; Sayfalar
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/kampanyalar" className="text-neutral-400 hover:text-white">
                  Tüm Kampanyalar
                </Link>
              </li>
              <li>
                <Link href="/kampanyalar?category=red-marka-ayricaliklari" className="text-neutral-400 hover:text-white">
                  Red Marka Ayrıcalıkları
                </Link>
              </li>
              <li>
                <Link href="/kampanyalar?category=freezone-guzellikleri" className="text-neutral-400 hover:text-white">
                  FreeZone Güzellikleri
                </Link>
              </li>
              {footerPages.map((p) => (
                <li key={p.id}>
                  <Link href={`/sayfa/${p.slug}`} className="text-neutral-400 hover:text-white">
                    {p.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">
              Kurumsal &amp; Blog
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/kurumsal/hakkimizda" className="text-neutral-400 hover:text-white">
                  Hakkımızda
                </Link>
              </li>
              <li>
                <Link href="/kurumsal/misyon-vizyon" className="text-neutral-400 hover:text-white">
                  Misyon &amp; Vizyon
                </Link>
              </li>
              <li>
                <Link href="/kurumsal/sss" className="text-neutral-400 hover:text-white">
                  Sıkça Sorulan Sorular
                </Link>
              </li>
              <li>
                <Link href="/subelerimiz" className="text-neutral-400 hover:text-white">
                  Şubelerimiz
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-neutral-400 hover:text-white">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/iletisim" className="text-neutral-400 hover:text-white">
                  İletişim &amp; Mağaza
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-neutral-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
          <div className="flex items-center gap-3">
            {settings.logoUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={settings.logoUrl}
                alt={settings.brandName}
                className="h-7 w-auto max-w-[120px] object-contain"
              />
            ) : (
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#e60000] text-white font-black text-sm">
                {settings.brandName.charAt(0).toUpperCase()}
              </span>
            )}
            <span>
              © 2026 {settings.brandName} — {settings.siteUrl}
            </span>
          </div>
          <div className="flex items-center gap-5">
            <span>{settings.workingHours}</span>
            <span>Dinamik Kampanya Senkronizasyonu Aktif</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
