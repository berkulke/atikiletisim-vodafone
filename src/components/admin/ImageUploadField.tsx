"use client";

import React, { useState } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";

export function ImageUploadField({
  label,
  value,
  onChange,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  required?: boolean;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = (await res.json()) as { error?: string; url?: string };
      if (!res.ok || !data.url) {
        setError(data.error ?? "Görsel MinIO'ya yüklenemedi");
        return;
      }
      onChange(data.url);
    } catch {
      setError("MinIO yükleme sunucusuna bağlanılamadı");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-bold text-neutral-700">
        {label} {required && <span className="text-[#e60000]">*</span>}
      </label>

      {value ? (
        <div className="relative rounded-xl border border-neutral-200 bg-neutral-50 p-3 flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt={label}
            className="h-16 w-24 rounded-lg object-cover border border-neutral-200 bg-white shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-emerald-700">
              MinIO&apos;ya Yüklendi
            </p>
            <label className="mt-1 inline-flex cursor-pointer items-center gap-1 text-xs font-bold text-[#e60000] hover:underline">
              <Upload className="h-3.5 w-3.5" />
              <span>{uploading ? "Yükleniyor..." : "Görseli Değiştir"}</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/svg+xml,image/avif,image/x-icon,.ico"
                className="hidden"
                onChange={(e) => void handleFile(e.target.files?.[0])}
              />
            </label>
          </div>
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Görseli kaldır"
            className="p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-200 hover:text-[#e60000]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <label
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            void handleFile(e.dataTransfer.files?.[0]);
          }}
          className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 px-4 py-5 text-center cursor-pointer hover:border-[#e60000] hover:bg-red-50/30 transition-colors"
        >
          <ImageIcon className="h-7 w-7 text-neutral-400 mb-1.5" />
          <span className="text-xs font-bold text-neutral-700">
            {uploading
              ? "MinIO'ya yükleniyor..."
              : "Görsel dosyası seçin veya sürükleyip bırakın"}
          </span>
          <span className="mt-0.5 text-[11px] text-neutral-500">
            PNG, JPG, WEBP, SVG, AVIF (Maks. 5 MB)
          </span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/svg+xml,image/avif"
            className="hidden"
            onChange={(e) => void handleFile(e.target.files?.[0])}
          />
        </label>
      )}

      {error && (
        <p className="text-xs font-semibold text-[#e60000]">{error}</p>
      )}
    </div>
  );
}
