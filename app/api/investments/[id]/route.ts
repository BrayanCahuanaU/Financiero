import { NextResponse } from "next/server";
import { deleteInvestment, updateInvestmentValue } from "@/lib/data";
import { apiError, getApiUser, unauthorized } from "@/lib/api";
import { investmentUpdateSchema } from "@/lib/schemas";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getApiUser();
  if (!user) return unauthorized();
  try {
    const { id } = await params;
    const deleted = await deleteInvestment(user.id, id);
    if (!deleted) return NextResponse.json({ error: "La inversión no existe." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getApiUser();
  if (!user) return unauthorized();
  try {
    const { id } = await params;
    const data = investmentUpdateSchema.parse(await request.json());
    const updated = await updateInvestmentValue(user.id, id, data.current_value);
    if (!updated) return NextResponse.json({ error: "La inversión no existe." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
