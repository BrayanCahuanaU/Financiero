import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { registerSchema } from "@/lib/schemas";
import { apiError, badRequest } from "@/lib/api";
import { uid } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const data = registerSchema.parse(await request.json());
    const db = await getDb();

    const existing = await db
      .prepare("SELECT id FROM users WHERE email = ?")
      .bind(data.email)
      .first<{ id: string }>();
    if (existing) {
      return badRequest("Ya existe una cuenta con ese correo. Inicia sesión.", 409);
    }

    const userId = uid("usr_");
    const accountId = uid("acc_");
    const now = new Date().toISOString();

    try {
      await db.batch([
        db
          .prepare(
            "INSERT INTO users (id, name, email, password_hash, currency, created_at) VALUES (?, ?, ?, ?, 'PEN', ?)",
          )
          .bind(userId, data.name, data.email, hashPassword(data.password), now),
        db
          .prepare(
            `INSERT INTO accounts (id, user_id, name, type, institution, number, initial_balance, currency, color, created_at)
             VALUES (?, ?, 'Efectivo', 'cash', NULL, NULL, 0, 'PEN', '#fbbf24', ?)`,
          )
          .bind(accountId, userId, now),
      ]);
    } catch (error) {
      // Otra petición pudo registrar el mismo correo entre la consulta y el insert.
      const raced = await db
        .prepare("SELECT id FROM users WHERE email = ?")
        .bind(data.email)
        .first<{ id: string }>()
        .catch(() => null);
      if (raced) {
        return badRequest("Ya existe una cuenta con ese correo. Inicia sesión.", 409);
      }
      throw error;
    }

    await createSession(userId, true);
    return NextResponse.json({ ok: true, userId }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
