import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { contactMessageSchema } from "@/lib/validators";
import { checkRateLimit } from "@/lib/rate-limit";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ messages });
}

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";
    const rl = await checkRateLimit(`contact:${ip}`, 10, 600);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Çok sık mesaj gönderildi. Lütfen biraz bekleyin." },
        { status: 429 }
      );
    }

    const body: unknown = await request.json();
    const parsed = contactMessageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Geçersiz iletişim formu" },
        { status: 400 }
      );
    }

    const d = parsed.data;
    const msg = await prisma.contactMessage.create({
      data: {
        name: d.name,
        phone: d.phone,
        email: d.email || null,
        subject: d.subject,
        message: d.message,
      },
    });

    return NextResponse.json({ message: msg }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Mesaj gönderilemedi" },
      { status: 500 }
    );
  }
}
