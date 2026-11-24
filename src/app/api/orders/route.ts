import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { createOrderSchema } from "@/lib/validators";

function generateOrderNumber(): string {
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `VDF-${new Date().getFullYear()}-${rand}`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderNumber = searchParams.get("orderNumber")?.trim();

  if (orderNumber) {
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: { items: true },
    });
    if (!order) {
      return NextResponse.json({ error: "Sipariş bulunamadı" }, { status: 404 });
    }
    return NextResponse.json({
      order: {
        orderNumber: order.orderNumber,
        status: order.status,
        paymentMethod: order.paymentMethod,
        totalAmount: order.totalAmount,
        city: order.city,
        district: order.district,
        createdAt: order.createdAt,
        items: order.items,
      },
    });
  }

  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ orders });
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = createOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Geçersiz sipariş bilgileri" },
        { status: 400 }
      );
    }

    const input = parsed.data;
    const productIds = input.items.map((i) => i.productId);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
    });

    const productMap = new Map(dbProducts.map((p) => [p.id, p]));

    let totalAmount = 0;
    const resolvedItems: Array<{
      productId: string;
      title: string;
      quantity: number;
      unitPrice: number;
      purchaseMode: string;
    }> = [];

    for (const item of input.items) {
      const product = productMap.get(item.productId);
      if (!product) {
        return NextResponse.json(
          { error: "Sepetinizdeki ürünlerden biri artık mevcut değil" },
          { status: 400 }
        );
      }
      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `${product.title} için yeterli stok bulunmamaktadır` },
          { status: 400 }
        );
      }

      const unitPrice =
        item.purchaseMode === "INSTALLMENT" && product.installmentPrice
          ? Number(product.installmentPrice)
          : Number(product.price);

      totalAmount += unitPrice * item.quantity;
      resolvedItems.push({
        productId: product.id,
        title: product.title,
        quantity: item.quantity,
        unitPrice,
        purchaseMode: item.purchaseMode,
      });
    }

    const order = await prisma.$transaction(async (tx) => {
      for (const item of resolvedItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          customerName: input.customerName,
          customerPhone: input.customerPhone,
          customerEmail: input.customerEmail,
          tcIdentityLast4: input.tcIdentityLast4 || null,
          city: input.city,
          district: input.district,
          addressLine: input.addressLine,
          paymentMethod: input.paymentMethod,
          totalAmount,
          notes: input.notes ?? null,
          items: {
            create: resolvedItems,
          },
        },
        include: { items: true },
      });
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Sipariş oluşturulurken bir hata oluştu" },
      { status: 500 }
    );
  }
}
