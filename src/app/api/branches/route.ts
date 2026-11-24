import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { branchInputSchema } from "@/lib/validators";
import { getOrSetCache, invalidateCacheKeys } from "@/lib/redis";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const includeInactive = searchParams.get("includeInactive") === "true";
  const session = includeInactive ? await getAdminSession() : null;

  if (includeInactive && session) {
    const branches = await prisma.branch.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
    return NextResponse.json({ branches });
  }

  const branches = await getOrSetCache("branches:active:v1", 180, async () =>
    prisma.branch.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    })
  );

  return NextResponse.json({ branches });
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  try {
    const body: unknown = await request.json();
    const parsed = branchInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Geçersiz şube verisi" },
        { status: 400 }
      );
    }

    const d = parsed.data;
    const branch = await prisma.branch.create({
      data: {
        name: d.name,
        city: d.city,
        district: d.district,
        address: d.address,
        phone: d.phone,
        whatsappPhone: d.whatsappPhone,
        workingHours: d.workingHours,
        mapUrl: d.mapUrl ?? "",
        sortOrder: d.sortOrder,
        isActive: d.isActive,
      },
    });

    await invalidateCacheKeys(["branches:active:v1"]);
    return NextResponse.json({ branch }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Şube oluşturulamadı" }, { status: 500 });
  }
}
