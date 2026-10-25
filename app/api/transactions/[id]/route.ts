import { NextResponse } from "next/server";
import { deleteTransaction } from "@/lib/data";
import { apiError, getApiUser, unauthorized } from "@/lib/api";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getApiUser();
  if (!user) return unauthorized();
  try {
    const { id } = await params;
    const deleted = await deleteTransaction(user.id, id);
    if (!deleted) return NextResponse.json({ error: "El movimiento no existe." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
