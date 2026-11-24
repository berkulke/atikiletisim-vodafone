"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function VisitorTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;

    const ref = document.referrer ? document.referrer : "Doğrudan";
    const controller = new AbortController();

    void fetch("/api/analytics/visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname, referrer: ref }),
      signal: controller.signal,
    }).catch(() => {
      // ignore tracking errors
    });

    return () => controller.abort();
  }, [pathname]);

  return null;
}
