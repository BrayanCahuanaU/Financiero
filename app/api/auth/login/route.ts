import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { ensureDemoUser, getDb } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { verifyPassword } from "@/lib/password";
import { loginSchema } from "@/lib/schemas";
import { apiError, badRequest } from "@/lib/api";
import { rateLimit, resetRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const data = loginSchema.parse(await request.json());
    const requestHeaders = await headers();
    const ip =
      requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      requestHeaders.get("x-real-ip") ??
      "local";
    const limitKey = `login:${ip}:${data.email}`;
    const limit = rateLimit(limitKey, 8, 10 * 60 * 1000);
    if (!limit.allowed) {
      return badRequest(
        "Demasiados intentos. Espera unos minutos antes de volver a intentar.",
        429,
      );
    }

    // La cuenta demo se crea la primera vez que se intenta usar, sin retrasar
    // el login de las cuentas reales.
    if (data.email === "demo@yupay.pe") {
      await ensureDemoUser();
    }

    const db = await getDb();
    const user = await db
      .prepare("SELECT id, password_hash FROM users WHERE email = ?")
      .bind(data.email)
      .first<{ id: string; password_hash: string }>();

    if (!user || !verifyPassword(data.password, user.password_hash)) {
      return badRequest("Correo o contraseña incorrectos.", 401);
    }

    await createSession(user.id, Boolean(data.remember));
    resetRateLimit(limitKey);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
