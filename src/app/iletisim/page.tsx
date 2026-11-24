import React, { Suspense } from "react";
import { connection } from "next/server";
import { Clock, ExternalLink, Mail, MapPin, MessageSquare, Phone } from "lucide-react";
import { getSiteSettings } from "@/lib/settings";
import { ContactForm } from "@/components/contact/ContactForm";

async function IletisimContent() {
  await connection();
  const settings = await getSiteSettings();
  const waHref = `https://wa.me/${settings.whatsappPhone.replace(/\D/g, "")}?text=${encodeURIComponent(
    settings.whatsappMessage
  )}`;

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-12">
      <div className="mb-10">
        <p className="text-xs font-bold uppercase tracking-widest text-[#e60000]">
          {settings.brandName}
        </p>
        <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold text-[#0d0d0d]">
          İletişim &amp; Mağaza Bilgileri
        </h1>
        <p className="mt-2 text-sm text-[#666666]">{settings.tagline}</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl bg-white p-6 vdf-card-shadow border border-neutral-100 space-y-4">
            <h2 className="text-lg font-extrabold text-[#0d0d0d]">
              Bize Doğrudan Ulaşın
            </h2>

            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-full bg-[#25D366] py-3.5 text-sm font-bold text-white hover:bg-[#1ebe5d] transition-colors"
            >
              <MessageSquare className="h-5 w-5 fill-white" />
              <span>WhatsApp ile Hemen Yaz</span>
            </a>

            <div className="space-y-3 pt-2 text-sm">
              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-[#e60000] mt-1 shrink-0" />
                <div>
                  <p className="text-xs text-[#666666]">Telefon</p>
                  <p className="font-bold text-[#0d0d0d]">{settings.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-[#e60000] mt-1 shrink-0" />
                <div>
                  <p className="text-xs text-[#666666]">E-posta</p>
                  <p className="font-bold text-[#0d0d0d]">{settings.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-[#e60000] mt-1 shrink-0" />
                <div>
                  <p className="text-xs text-[#666666]">Mağaza Adresi</p>
                  <p className="font-bold text-[#0d0d0d]">
                    {settings.address} ({settings.district} / {settings.city})
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-[#e60000] mt-1 shrink-0" />
                <div>
                  <p className="text-xs text-[#666666]">Çalışma Saatleri</p>
                  <p className="font-bold text-[#0d0d0d]">{settings.workingHours}</p>
                </div>
              </div>
              {settings.instagramUrl && (
                <div className="flex items-start gap-3">
                  <ExternalLink className="h-4 w-4 text-[#e60000] mt-1 shrink-0" />
                  <div>
                    <p className="text-xs text-[#666666]">Instagram</p>
                    <a
                      href={settings.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-[#e60000] hover:underline"
                    >
                      @atikiletisim
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 rounded-2xl bg-white p-6 sm:p-8 vdf-card-shadow border border-neutral-100">
          <h2 className="text-xl font-extrabold text-[#0d0d0d] mb-2">
            Bize Mesaj Bırakın
          </h2>
          <p className="text-xs text-[#666666] mb-6">
            Sorularınız, cihaz veya tarife talepleriniz için formu doldurabilirsiniz.
          </p>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}

export default function IletisimPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1280px] px-4 py-12">
          <div className="h-80 rounded-2xl bg-white animate-pulse" />
        </div>
      }
    >
      <IletisimContent />
    </Suspense>
  );
}
