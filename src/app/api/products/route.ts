import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { productInputSchema } from "@/lib/validators";
import { slugifyTr } from "@/lib/slug";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const featured = searchParams.get("featured") === "true";
    const q = searchParams.get("q")?.trim();
    const includeInactive = searchParams.get("includeInactive") === "true";

    const session = includeInactive ? await getAdminSession() : null;
    const onlyActive = !(includeInactive && session);

    const products = await prisma.product.findMany({
      where: {
        ...(onlyActive ? { isActive: true } : {}),
        ...(category &&
        ["DEVICE", "TARIFF", "HOME_INTERNET", "ACCESSORY"].includes(category)
          ? { category: category as "DEVICE" | "TARIFF" | "HOME_INTERNET" | "ACCESSORY" }
          : {}),
        ...(featured ? { isFeatured: true } : {}),
        ...(q
          ? {
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { brand: { contains: q, mode: "insensitive" } },
                { subtitle: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ products });
  } catch {
    return NextResponse.json({ error: "Ürünler yüklenemedi" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  try {
    const body: unknown = await request.json();
    const parsed = productInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Geçersiz ürün verisi" },
        { status: 400 }
      );
    }

    const d = parsed.data;
    const slug = `${slugifyTr(d.title) || "urun"}-${Date.now().toString(36)}`;

    const product = await prisma.product.create({
      data: {
        slug,
        title: d.title,
        subtitle: d.subtitle ?? null,
        description: d.description,
        category: d.category,
        brand: d.brand,
        price: d.price,
        installmentPrice: d.installmentPrice ?? null,
        installmentMonths: d.installmentMonths ?? null,
        specs: d.specs,
        imageUrl: d.imageUrl,
        stock: d.stock,
        isFeatured: d.isFeatured,
        isActive: d.isActive,
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Ürün oluşturulamadı" }, { status: 500 });
  }
}
