import { NextResponse } from "next/server";
import { deleteGoal } from "@/lib/data";
import { apiError, getApiUser, unauthorized } from "@/lib/api";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getApiUser();
  if (!user) return unauthorized();
  try {
    const { id } = await params;
    const deleted = await deleteGoal(user.id, id);
    if (!deleted) return NextResponse.json({ error: "La meta no existe." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
