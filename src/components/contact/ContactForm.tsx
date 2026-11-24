"use client";

import React, { useState } from "react";
import { CheckCircle2, Send } from "lucide-react";

export function ContactForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, email, subject, message }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Mesaj gönderilemedi");
        return;
      }
      setSent(true);
      setName("");
      setPhone("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch {
      setError("Bağlantı hatası");
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-8 text-center space-y-3">
        <CheckCircle2 className="mx-auto h-10 w-10 text-[#009900]" />
        <h3 className="text-lg font-extrabold text-[#0d0d0d]">
          Mesajınız Alındı!
        </h3>
        <p className="text-sm text-[#333333]">
          Atik İletişim ekibimiz en kısa sürede size dönüş yapacaktır.
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="rounded-full bg-[#e60000] px-5 py-2 text-xs font-bold text-white hover:bg-[#bd0000]"
        >
          Yeni Mesaj Gönder
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-xs font-semibold text-[#e60000]">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-[#333333] mb-1">
            Ad Soyad *
          </label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Adınız Soyadınız"
            className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm outline-none focus:border-[#e60000]"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-[#333333] mb-1">
            Telefon *
          </label>
          <input
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="05XX XXX XX XX"
            className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm outline-none focus:border-[#e60000]"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-[#333333] mb-1">
            E-posta
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ornek@email.com"
            className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm outline-none focus:border-[#e60000]"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-[#333333] mb-1">
            Konu *
          </label>
          <input
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Tarife, Cihaz veya Ev İnterneti"
            className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm outline-none focus:border-[#e60000]"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-bold text-[#333333] mb-1">
          Mesajınız *
        </label>
        <textarea
          required
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Size nasıl yardımcı olabiliriz?"
          className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm outline-none focus:border-[#e60000]"
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="inline-flex items-center gap-2 rounded-full bg-[#e60000] px-7 py-3 text-sm font-bold text-white hover:bg-[#bd0000] disabled:opacity-60"
      >
        <Send className="h-4 w-4" />
        <span>{submitting ? "Gönderiliyor..." : "Mesaj Gönder"}</span>
      </button>
    </form>
  );
}
