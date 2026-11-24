"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export interface FaqItemDto {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export function FaqAccordion({ items }: { items: FaqItemDto[] }) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-12 text-center text-sm text-[#666666]">
        Henüz sıkça sorulan soru eklenmedi.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div
            key={item.id}
            className="rounded-2xl bg-white border border-neutral-200 vdf-card-shadow overflow-hidden"
          >
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : item.id)}
              aria-expanded={isOpen}
              className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left"
            >
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#e60000]">
                  {item.category}
                </span>
                <p className="mt-0.5 text-base font-bold text-[#0d0d0d]">
                  {item.question}
                </p>
              </div>
              <ChevronDown
                className={`h-5 w-5 shrink-0 text-neutral-500 transition-transform duration-200 ${
                  isOpen ? "rotate-180 text-[#e60000]" : ""
                }`}
              />
            </button>
            {isOpen && (
              <div className="px-6 pb-5 pt-1 text-sm text-[#333333] leading-relaxed border-t border-neutral-100">
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
