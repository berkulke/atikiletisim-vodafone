"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export function AdminDialog({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className={`h-full w-full flex flex-col bg-white shadow-2xl border-l border-neutral-200 transition-all duration-200 ${
          expanded ? "max-w-5xl" : "max-w-xl"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50 shrink-0">
          <h3 className="text-lg font-extrabold text-[#0d0d0d]">{title}</h3>
          <div className="flex items-center gap-1.5">
            <Tooltip text={expanded ? "Küçült" : "Genişlet"}>
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                aria-label={expanded ? "Dialogu küçült" : "Dialogu genişlet"}
                className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-200 hover:text-[#0d0d0d]"
              >
                {expanded ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </button>
            </Tooltip>
            <Tooltip text="Kapat (ESC)">
              <button
                type="button"
                onClick={onClose}
                aria-label="Dialogu kapat"
                className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-200 hover:text-[#0d0d0d]"
              >
                <X className="h-5 w-5" />
              </button>
            </Tooltip>
          </div>
        </div>
        <div className="flex-1 p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

export function ToggleSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <Tooltip text={checked ? "Pasife Al" : "Aktif Et"}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ${
          checked ? "bg-emerald-600" : "bg-neutral-300"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </Tooltip>
  );
}

export function Tooltip({
  text,
  children,
}: {
  text: string;
  children: React.ReactNode;
}) {
  return (
    <span className="relative inline-flex group/tip">
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap rounded-lg bg-[#0d0d0d] px-2.5 py-1 text-[11px] font-semibold text-white opacity-0 shadow-md transition-opacity duration-150 group-hover/tip:opacity-100 z-50"
      >
        {text}
      </span>
    </span>
  );
}

export function Pagination({
  totalItems,
  pageSize,
  currentPage,
  onPageChange,
}: {
  totalItems: number;
  pageSize: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  if (totalItems <= pageSize) return null;

  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(totalItems, currentPage * pageSize);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 border-t border-neutral-200 bg-neutral-50 text-xs">
      <p className="text-neutral-600 font-medium">
        Toplam <span className="font-bold text-[#0d0d0d]">{totalItems}</span> kayıttan{" "}
        <span className="font-bold text-[#0d0d0d]">
          {start}-{end}
        </span>{" "}
        arası gösteriliyor
      </p>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Önceki sayfa"
          className="inline-flex items-center gap-1 rounded-lg border border-neutral-300 bg-white px-2.5 py-1.5 font-semibold text-neutral-700 hover:bg-neutral-100 disabled:opacity-40"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span>Önceki</span>
        </button>
        <span className="px-2.5 font-bold text-[#0d0d0d]">
          {currentPage} / {totalPages}
        </span>
        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Sonraki sayfa"
          className="inline-flex items-center gap-1 rounded-lg border border-neutral-300 bg-white px-2.5 py-1.5 font-semibold text-neutral-700 hover:bg-neutral-100 disabled:opacity-40"
        >
          <span>Sonraki</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

export interface ToastItem {
  id: string;
  type: "ok" | "err";
  msg: string;
}

export function ToastStack({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed top-5 right-5 z-[60] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-start justify-between gap-3 rounded-xl px-4 py-3 text-sm font-semibold shadow-xl border ${
            t.type === "ok"
              ? "bg-[#0d0d0d] text-white border-emerald-500/40"
              : "bg-[#e60000] text-white border-red-300"
          }`}
        >
          <div className="flex items-start gap-2.5">
            {t.type === "ok" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-4 w-4 text-white shrink-0 mt-0.5" />
            )}
            <span className="text-xs leading-relaxed">{t.msg}</span>
          </div>
          <button
            type="button"
            onClick={() => onDismiss(t.id)}
            aria-label="Bildirimi kapat"
            className="text-white/70 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
