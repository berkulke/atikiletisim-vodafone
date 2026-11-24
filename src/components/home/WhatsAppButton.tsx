import React from "react";
import { MessageSquare } from "lucide-react";

export function WhatsAppButton({
  phone,
  message,
  brandName,
}: {
  phone: string;
  message: string;
  brandName: string;
}) {
  const cleanPhone = phone.replace(/\D/g, "");
  if (!cleanPhone) return null;

  const href = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${brandName} WhatsApp ile İletişim`}
      className="fixed bottom-20 right-5 z-50 flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-bold text-white shadow-lg hover:bg-[#1ebe5d] transition-transform hover:scale-105"
    >
      <MessageSquare className="h-5 w-5 fill-white" />
      <span className="hidden sm:inline">WhatsApp Destek</span>
    </a>
  );
}
