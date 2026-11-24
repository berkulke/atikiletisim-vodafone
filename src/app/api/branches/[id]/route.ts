import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { branchInputSchema } from "@/lib/validators";
import { invalidateCacheKeys } from "@/lib/redis";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  const { id } = await context.params;
  try {
    const body: unknown = await request.json();
    const parsed = branchInputSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Geçersiz şube güncellemesi" },
        { status: 400 }
      );
    }

    const d = parsed.data;
    const branch = await prisma.branch.update({
      where: { id },
      data: {
        ...(d.name !== undefined ? { name: d.name } : {}),
        ...(d.city !== undefined ? { city: d.city } : {}),
        ...(d.district !== undefined ? { district: d.district } : {}),
        ...(d.address !== undefined ? { address: d.address } : {}),
        ...(d.phone !== undefined ? { phone: d.phone } : {}),
        ...(d.whatsappPhone !== undefined ? { whatsappPhone: d.whatsappPhone } : {}),
        ...(d.workingHours !== undefined ? { workingHours: d.workingHours } : {}),
        ...(d.mapUrl !== undefined ? { mapUrl: d.mapUrl ?? "" } : {}),
        ...(d.sortOrder !== undefined ? { sortOrder: d.sortOrder } : {}),
        ...(d.isActive !== undefined ? { isActive: d.isActive } : {}),
      },
    });

    await invalidateCacheKeys(["branches:active:v1"]);
    return NextResponse.json({ branch });
  } catch {
    return NextResponse.json({ error: "Şube güncellenemedi" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  const { id } = await context.params;
  try {
    await prisma.branch.delete({ where: { id } });
    await invalidateCacheKeys(["branches:active:v1"]);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Şube silinemedi" }, { status: 500 });
  }
}
