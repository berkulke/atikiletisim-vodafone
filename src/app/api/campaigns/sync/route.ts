import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { syncVodafoneCampaigns } from "@/lib/sync/campaign-sync";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  const logs = await prisma.campaignSyncLog.findMany({
    orderBy: { startedAt: "desc" },
    take: 15,
  });

  return NextResponse.json({ logs });
}

export async function POST() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  const result = await syncVodafoneCampaigns();
  return NextResponse.json(result, {
    status: result.status === "FAILED" ? 502 : 200,
  });
}
