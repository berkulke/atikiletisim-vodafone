import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { productInputSchema } from "@/lib/validators";

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
    const parsed = productInputSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Geçersiz ürün güncellemesi" },
        { status: 400 }
      );
    }

    const d = parsed.data;
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(d.title !== undefined ? { title: d.title } : {}),
        ...(d.subtitle !== undefined ? { subtitle: d.subtitle } : {}),
        ...(d.description !== undefined ? { description: d.description } : {}),
        ...(d.category !== undefined ? { category: d.category } : {}),
        ...(d.brand !== undefined ? { brand: d.brand } : {}),
        ...(d.price !== undefined ? { price: d.price } : {}),
        ...(d.installmentPrice !== undefined ? { installmentPrice: d.installmentPrice } : {}),
        ...(d.installmentMonths !== undefined ? { installmentMonths: d.installmentMonths } : {}),
        ...(d.specs !== undefined ? { specs: d.specs } : {}),
        ...(d.imageUrl !== undefined ? { imageUrl: d.imageUrl } : {}),
        ...(d.stock !== undefined ? { stock: d.stock } : {}),
        ...(d.isFeatured !== undefined ? { isFeatured: d.isFeatured } : {}),
        ...(d.isActive !== undefined ? { isActive: d.isActive } : {}),
      },
    });

    return NextResponse.json({ product });
  } catch {
    return NextResponse.json({ error: "Ürün güncellenemedi" }, { status: 500 });
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
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Ürün silinemedi" }, { status: 500 });
  }
}
