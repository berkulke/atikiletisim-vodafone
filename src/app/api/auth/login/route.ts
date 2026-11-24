import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validators";
import { ADMIN_COOKIE_NAME, signAdminToken } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";
    const rl = await checkRateLimit(`login:${ip}`, 10, 900);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Çok fazla başarısız giriş denemesi. Lütfen 15 dakika sonra tekrar deneyin." },
        { status: 429 }
      );
    }

    const body: unknown = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Geçersiz giriş bilgileri" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email.toLowerCase() },
    });

    if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
      return NextResponse.json(
        { error: "E-posta veya şifre hatalı" },
        { status: 401 }
      );
    }

    const token = await signAdminToken({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: "ADMIN",
    });

    const response = NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });

    response.cookies.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Giriş işlemi sırasında bir hata oluştu" },
      { status: 500 }
    );
  }
}
