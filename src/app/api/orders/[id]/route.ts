import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { updateOrderStatusSchema } from "@/lib/validators";

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
    const parsed = updateOrderStatusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Geçersiz sipariş durumu" },
        { status: 400 }
      );
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status: parsed.data.status },
      include: { items: true },
    });

    return NextResponse.json({ order });
  } catch {
    return NextResponse.json(
      { error: "Sipariş güncellenemedi" },
      { status: 500 }
    );
  }
}
