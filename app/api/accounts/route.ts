import { NextResponse } from "next/server";
import { createAccount } from "@/lib/data";
import { apiError, getApiUser, unauthorized } from "@/lib/api";
import { accountSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  const user = await getApiUser();
  if (!user) return unauthorized();
  try {
    const data = accountSchema.parse(await request.json());
    const account = await createAccount(user.id, data);
    return NextResponse.json({ ok: true, account }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
