import React from "react";
import Link from "next/link";

const KURUMSAL_LINKS = [
  { href: "/kurumsal/hakkimizda", label: "Hakkımızda" },
  { href: "/kurumsal/misyon-vizyon", label: "Misyon & Vizyon" },
  { href: "/kurumsal/sss", label: "Sıkça Sorulan Sorular" },
  { href: "/subelerimiz", label: "Şubelerimiz" },
];

export function KurumsalTabs({ activeHref }: { activeHref: string }) {
  return (
    <div className="bg-white border-b border-neutral-200">
      <div className="mx-auto max-w-[1280px] px-4 flex items-center gap-2 overflow-x-auto py-3 scrollbar-hide">
        {KURUMSAL_LINKS.map((item) => {
          const active = item.href === activeHref;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                active
                  ? "bg-[#e60000] text-white"
                  : "bg-[#f4f4f4] text-[#333333] hover:bg-neutral-200"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
