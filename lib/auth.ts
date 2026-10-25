import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import { cache } from "react";
import { getDb } from "./db";

const SESSION_COOKIE = "yupay_session";
const DAY = 60 * 60 * 24;

/** Solo se usa en desarrollo local si no hay AUTH_SECRET configurado. */
const DEV_SECRET = "yupay-desarrollo-local-no-usar-en-produccion-2026";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  currency: string;
  created_at: string;
};

function getSecret() {
  const fromEnv = process.env.AUTH_SECRET;
  if (fromEnv && fromEnv.length >= 32) return new TextEncoder().encode(fromEnv);

  if (process.env.NODE_ENV !== "production") {
    return new TextEncoder().encode(DEV_SECRET);
  }

  throw new Error(
    "AUTH_SECRET no está configurado. En Cloudflare ejecuta: npx wrangler secret put AUTH_SECRET",
  );
}

export async function createSession(userId: string, remember: boolean) {
  const maxAge = remember ? 180 * DAY : 30 * DAY;
  const token = await new SignJWT({ scope: "app" })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + maxAge)
    .sign(getSecret());

  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "";
  const isLocal = host.startsWith("localhost") || host.startsWith("127.0.0.1") || host.startsWith("[::1]");

  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: !isLocal && process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  });

  return maxAge;
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: ["HS256"] });
    if (!payload.sub) return null;
    const db = await getDb();
    const user = await db
      .prepare("SELECT id, name, email, currency, created_at FROM users WHERE id = ?")
      .bind(payload.sub)
      .first<SessionUser>();
    return user ?? null;
  } catch {
    return null;
  }
});

/** Igual que getSessionUser, pero redirige al login si la sesión no es válida. */
export async function requireSessionUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}
