"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Header, type NavPageItem } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/home/WhatsAppButton";
import { TobiWidget } from "@/components/home/TobiWidget";
import { CookieConsentBanner } from "@/components/layout/CookieConsentBanner";
import { VisitorTracker } from "@/components/layout/VisitorTracker";
import type { SiteSettingsDto } from "@/lib/settings";

export function StorefrontShell({
  settings,
  customPages,
  children,
}: {
  settings: SiteSettingsDto;
  customPages: NavPageItem[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");

  if (isAdminRoute) {
    return <div className="min-h-screen bg-[#f1f3f5]">{children}</div>;
  }

  return (
    <>
      <Header settings={settings} customPages={customPages} />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} customPages={customPages} />
      <WhatsAppButton
        phone={settings.whatsappPhone}
        message={settings.whatsappMessage}
        brandName={settings.brandName}
      />
      <TobiWidget />
      <CookieConsentBanner cookiebotId={settings.cookiebotId} />
      <VisitorTracker />
    </>
  );
}
