import { NextResponse } from "next/server";
import { connectBank } from "@/lib/data";
import { apiError, badRequest, getApiUser, unauthorized } from "@/lib/api";
import { bankConnectSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  const user = await getApiUser();
  if (!user) return unauthorized();
  try {
    const data = bankConnectSchema.parse(await request.json());
    const result = await connectBank(user.id, data.provider);
    return NextResponse.json({ ok: true, ...result }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.includes("conectado")) {
      return badRequest(error.message, 409);
    }
    return apiError(error);
  }
}
