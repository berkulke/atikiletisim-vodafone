import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const ADMIN_COOKIE_NAME = "vdf_admin_session";

export interface AdminSessionPayload {
  sub: string;
  email: string;
  name: string;
  role: "ADMIN";
}

function getJwtSecret(): Uint8Array {
  const secret =
    process.env.ADMIN_JWT_SECRET ??
    "vodafone-dev-fallback-secret-change-in-production-min-32-chars";
  return new TextEncoder().encode(secret);
}

export async function signAdminToken(payload: AdminSessionPayload): Promise<string> {
  return new SignJWT({
    email: payload.email,
    name: payload.name,
    role: payload.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(getJwtSecret());
}

export async function verifyAdminToken(
  token: string
): Promise<AdminSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    if (!payload.sub || typeof payload.email !== "string") {
      return null;
    }
    return {
      sub: payload.sub,
      email: payload.email,
      name: typeof payload.name === "string" ? payload.name : "Admin",
      role: "ADMIN",
    };
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }
  return verifyAdminToken(token);
}
