"use client";

import React, { useEffect, useState } from "react";
import Script from "next/script";
import { Cookie, Settings2, X } from "lucide-react";

interface ConsentPreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
}

const CONSENT_KEY = "vdf_cookie_consent_v1";

export function CookieConsentBanner({ cookiebotId }: { cookiebotId?: string }) {
  const [visible, setVisible] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem(CONSENT_KEY);
        if (!saved) {
          setVisible(true);
        }
      } catch {
        setVisible(true);
      }
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  const saveConsent = (prefs: Omit<ConsentPreferences, "updatedAt">) => {
    const payload: ConsentPreferences = {
      ...prefs,
      updatedAt: new Date().toISOString(),
    };
    try {
      window.localStorage.setItem(CONSENT_KEY, JSON.stringify(payload));
      document.cookie = `${CONSENT_KEY}=${encodeURIComponent(
        JSON.stringify(payload)
      )}; path=/; max-age=${60 * 60 * 24 * 180}; SameSite=Lax`;
    } catch {
      // ignore storage errors
    }
    setVisible(false);
    setManageOpen(false);
  };

  return (
    <>
      {cookiebotId && cookiebotId.trim().length > 0 && (
        <Script
          id="Cookiebot"
          src="https://consent.cookiebot.com/uc.js"
          data-cbid={cookiebotId.trim()}
          data-blockingmode="auto"
          strategy="afterInteractive"
        />
      )}

      {visible && (
        <div
          role="dialog"
          aria-label="Çerez Tercihleri"
          className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md z-50 rounded-2xl bg-[#0d0d0d] text-white p-5 shadow-2xl border border-white/15"
        >
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#e60000] text-white">
              <Cookie className="h-5 w-5" />
            </span>
            <div className="space-y-2 text-xs leading-relaxed">
              <p className="text-sm font-extrabold text-white">
                Çerez Kullanımı ve Gizlilik (KVKK)
              </p>
              <p className="text-neutral-300">
                Deneyiminizi iyileştirmek, sepetinizi korumak ve kampanyaları kişiselleştirmek için çerezler kullanıyoruz.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() =>
                    saveConsent({ necessary: true, analytics: true, marketing: true })
                  }
                  className="rounded-full bg-[#e60000] px-4 py-2 text-xs font-bold text-white hover:bg-[#bd0000]"
                >
                  Tümünü Kabul Et
                </button>
                <button
                  type="button"
                  onClick={() =>
                    saveConsent({ necessary: true, analytics: false, marketing: false })
                  }
                  className="rounded-full border border-white/25 px-4 py-2 text-xs font-semibold text-white hover:bg-white/10"
                >
                  Sadece Zorunlular
                </button>
                <button
                  type="button"
                  onClick={() => setManageOpen(true)}
                  className="inline-flex items-center gap-1 px-2 py-2 text-xs font-semibold text-neutral-300 hover:text-white"
                >
                  <Settings2 className="h-3.5 w-3.5" />
                  <span>Tercihler</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {manageOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 text-[#0d0d0d] shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold">Çerez Tercihlerini Yönet</h3>
              <button type="button" onClick={() => setManageOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <label className="flex items-center justify-between rounded-xl bg-[#f4f4f4] p-3">
                <div>
                  <p className="font-bold">Zorunlu Çerezler</p>
                  <p className="text-xs text-[#666666]">Sepet ve oturum güvenliği için gereklidir.</p>
                </div>
                <input type="checkbox" checked disabled />
              </label>
              <label className="flex items-center justify-between rounded-xl border border-neutral-200 p-3 cursor-pointer">
                <div>
                  <p className="font-bold">Performans &amp; Analitik</p>
                  <p className="text-xs text-[#666666]">Site hızını ve sayfa deneyimini ölçer.</p>
                </div>
                <input
                  type="checkbox"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                />
              </label>
              <label className="flex items-center justify-between rounded-xl border border-neutral-200 p-3 cursor-pointer">
                <div>
                  <p className="font-bold">Pazarlama &amp; Kampanyalar</p>
                  <p className="text-xs text-[#666666]">Size uygun tarife ve cihaz teklifleri sunar.</p>
                </div>
                <input
                  type="checkbox"
                  checked={marketing}
                  onChange={(e) => setMarketing(e.target.checked)}
                />
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() =>
                  saveConsent({ necessary: true, analytics, marketing })
                }
                className="rounded-full bg-[#e60000] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#bd0000]"
              >
                Tercihleri Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
