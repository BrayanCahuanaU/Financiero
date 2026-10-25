import { NextResponse } from "next/server";
import { syncBank } from "@/lib/data";
import { apiError, badRequest, getApiUser, unauthorized } from "@/lib/api";
import { bankProviderSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  const user = await getApiUser();
  if (!user) return unauthorized();
  try {
    const data = bankProviderSchema.parse(await request.json());
    const result = await syncBank(user.id, data.provider);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    if (error instanceof Error && error.message.includes("conectado")) {
      return badRequest(error.message, 400);
    }
    return apiError(error);
  }
}
