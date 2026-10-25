import { NextResponse } from "next/server";
import { getProfile, updatePassword } from "@/lib/data";
import { hashPassword, verifyPassword } from "@/lib/password";
import { apiError, badRequest, getApiUser, unauthorized } from "@/lib/api";
import { passwordSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  const user = await getApiUser();
  if (!user) return unauthorized();
  try {
    const data = passwordSchema.parse(await request.json());
    const profile = await getProfile(user.id);
    if (!profile) return unauthorizatedSafe();
    if (!verifyPassword(data.current_password, profile.password_hash)) {
      return badRequest("La contraseña actual no es correcta.", 401);
    }
    await updatePassword(user.id, hashPassword(data.new_password));
    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}

function unauthorizatedSafe() {
  return NextResponse.json({ error: "Sesión no válida." }, { status: 401 });
}
