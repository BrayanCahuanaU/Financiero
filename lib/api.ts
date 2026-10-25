import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getSessionUser, type SessionUser } from "./auth";

export async function getApiUser(): Promise<SessionUser | null> {
  return getSessionUser();
}

export function unauthorized() {
  return NextResponse.json({ error: "Tu sesión expiró. Vuelve a iniciar sesión." }, { status: 401 });
}

export function badRequest(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function apiError(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: error.issues[0]?.message ?? "Revisa los datos ingresados." },
      { status: 422 },
    );
  }
  console.error("[api]", error);
  return NextResponse.json(
    { error: "Ocurrió un error inesperado. Intenta nuevamente." },
    { status: 500 },
  );
}
