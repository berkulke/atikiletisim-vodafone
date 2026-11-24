import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { getOrSetCache } from "@/lib/redis";

interface GeoResult {
  country: string;
  city: string;
  region: string;
  isp: string;
}

function extractClientIp(request: Request): string {
  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "127.0.0.1";
}

function detectDeviceType(userAgent: string): string {
  const ua = userAgent.toLowerCase();
  if (/ipad|tablet|playbook|silk/.test(ua)) return "Tablet";
  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/.test(ua)) {
    return "Mobil";
  }
  return "Masaüstü";
}

function isLocalIp(ip: string): boolean {
  return (
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip.startsWith("192.168.") ||
    ip.startsWith("10.") ||
    ip.startsWith("::ffff:127.")
  );
}

async function resolveGeoFromIp(ip: string, request: Request): Promise<GeoResult> {
  const headerCity =
    request.headers.get("x-vercel-ip-city") || request.headers.get("cf-ipcity");
  const headerCountry =
    request.headers.get("x-vercel-ip-country") || request.headers.get("cf-ipcountry");

  if (headerCity || headerCountry) {
    return {
      country: headerCountry ? decodeURIComponent(headerCountry) : "Türkiye",
      city: headerCity ? decodeURIComponent(headerCity) : "Bilinmiyor",
      region: "",
      isp: "",
    };
  }

  if (isLocalIp(ip)) {
    return {
      country: "Türkiye",
      city: "Yerel Ağ (Localhost)",
      region: "Local",
      isp: "Geliştirme Ortamı",
    };
  }

  return getOrSetCache(`geoip:${ip}`, 60 * 60 * 24, async () => {
    try {
      const res = await fetch(
        `http://ip-api.com/json/${encodeURIComponent(ip)}?lang=tr&fields=status,country,regionName,city,isp`,
        { signal: AbortSignal.timeout(2500) }
      );
      if (!res.ok) {
        return { country: "Bilinmiyor", city: "Bilinmiyor", region: "", isp: "" };
      }
      const data = (await res.json()) as {
        status?: string;
        country?: string;
        regionName?: string;
        city?: string;
        isp?: string;
      };
      if (data.status !== "success") {
        return { country: "Bilinmiyor", city: "Bilinmiyor", region: "", isp: "" };
      }
      return {
        country: data.country || "Bilinmiyor",
        city: data.city || "Bilinmiyor",
        region: data.regionName || "",
        isp: data.isp || "",
      };
    } catch {
      return { country: "Bilinmiyor", city: "Bilinmiyor", region: "", isp: "" };
    }
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      path?: string;
      referrer?: string;
    };

    const rawPath = typeof body.path === "string" && body.path.startsWith("/") ? body.path : "/";
    if (rawPath.startsWith("/admin")) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const ipAddress = extractClientIp(request);
    const userAgent = request.headers.get("user-agent") || "";
    const deviceType = detectDeviceType(userAgent);
    const referrer =
      typeof body.referrer === "string" && body.referrer.trim().length > 0
        ? body.referrer.trim().slice(0, 300)
        : "Doğrudan";

    const geo = await resolveGeoFromIp(ipAddress, request);

    await prisma.visitorLog.create({
      data: {
        ipAddress,
        country: geo.country,
        city: geo.city,
        region: geo.region,
        isp: geo.isp,
        path: rawPath.slice(0, 300),
        referrer,
        userAgent: userAgent.slice(0, 400),
        deviceType,
      },
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();

  const logs = await prisma.visitorLog.findMany({
    where: q
      ? {
          OR: [
            { ipAddress: { contains: q, mode: "insensitive" } },
            { city: { contains: q, mode: "insensitive" } },
            { path: { contains: q, mode: "insensitive" } },
            { referrer: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 300,
  });

  const uniqueIps = new Set(logs.map((l) => l.ipAddress)).size;
  const cityCounts = new Map<string, number>();
  const referrerCounts = new Map<string, number>();

  for (const log of logs) {
    cityCounts.set(log.city, (cityCounts.get(log.city) ?? 0) + 1);
    referrerCounts.set(log.referrer, (referrerCounts.get(log.referrer) ?? 0) + 1);
  }

  const topCity =
    Array.from(cityCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "-";
  const topReferrer =
    Array.from(referrerCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "-";

  return NextResponse.json({
    logs,
    stats: {
      totalVisits: logs.length,
      uniqueIps,
      topCity,
      topReferrer,
    },
  });
}
