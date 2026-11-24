import React, { Suspense } from "react";
import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { StorefrontShell } from "@/components/layout/StorefrontShell";
import { Footer } from "@/components/layout/Footer";
import {
  DEFAULT_SITE_SETTINGS,
  getPublishedNavPages,
  getSiteSettings,
} from "@/lib/settings";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: settings.seoTitle,
    description: settings.seoDescription,
    keywords: settings.seoKeywords.split(",").map((k) => k.trim()),
    alternates: {
      canonical: settings.siteUrl,
    },
    ...(settings.faviconUrl
      ? {
          icons: {
            icon: settings.faviconUrl,
            shortcut: settings.faviconUrl,
            apple: settings.faviconUrl,
          },
        }
      : {}),
    openGraph: {
      title: settings.seoTitle,
      description: settings.seoDescription,
      url: settings.siteUrl,
      siteName: settings.brandName,
      locale: "tr_TR",
      type: "website",
      ...(settings.ogImageUrl ? { images: [{ url: settings.ogImageUrl }] } : {}),
    },
    other: {
      "geo.region": settings.geoRegion,
      "geo.placename": `${settings.district}, ${settings.city}`,
      "geo.position": `${settings.geoLatitude};${settings.geoLongitude}`,
      ICBM: `${settings.geoLatitude}, ${settings.geoLongitude}`,
    },
  };
}

async function ShellLayout({ children }: { children: React.ReactNode }) {
  const [settings, customPages] = await Promise.all([
    getSiteSettings(),
    getPublishedNavPages(),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: settings.brandName,
    description: settings.seoDescription,
    url: settings.siteUrl,
    telephone: settings.phone,
    email: settings.email,
    sameAs: settings.instagramUrl ? [settings.instagramUrl] : [],
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.address,
      addressLocality: settings.district,
      addressRegion: settings.city,
      addressCountry: "TR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: settings.geoLatitude,
      longitude: settings.geoLongitude,
    },
  };

  return (
    <CartProvider>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <StorefrontShell settings={settings} customPages={customPages}>
        {children}
      </StorefrontShell>
    </CartProvider>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${plusJakarta.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#f4f4f4] text-[#333333]">
        <Suspense
          fallback={
            <CartProvider>
              <div className="h-[104px] bg-white border-b border-neutral-200" />
              <main className="flex-1">{children}</main>
              <Footer settings={DEFAULT_SITE_SETTINGS} />
            </CartProvider>
          }
        >
          <ShellLayout>{children}</ShellLayout>
        </Suspense>
      </body>
    </html>
  );
}
