import { NextResponse } from "next/server";
import { disconnectBank } from "@/lib/data";
import { apiError, getApiUser, unauthorized } from "@/lib/api";
import { z } from "zod";

const providerSchema = z.enum(["bcp", "bn", "yape"]);

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ provider: string }> },
) {
  const user = await getApiUser();
  if (!user) return unauthorized();
  try {
    const { provider } = await params;
    const parsed = providerSchema.parse(provider);
    const deleted = await disconnectBank(user.id, parsed);
    if (!deleted) return NextResponse.json({ error: "La conexión no existe." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
