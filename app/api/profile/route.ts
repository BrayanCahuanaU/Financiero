import { NextResponse } from "next/server";
import { updateProfile } from "@/lib/data";
import { apiError, getApiUser, unauthorized } from "@/lib/api";
import { profileSchema } from "@/lib/schemas";

export async function PATCH(request: Request) {
  const user = await getApiUser();
  if (!user) return unauthorized();
  try {
    const data = profileSchema.parse(await request.json());
    await updateProfile(user.id, data);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
