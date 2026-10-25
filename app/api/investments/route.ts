import { NextResponse } from "next/server";
import { createInvestment } from "@/lib/data";
import { apiError, getApiUser, unauthorized } from "@/lib/api";
import { investmentSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  const user = await getApiUser();
  if (!user) return unauthorized();
  try {
    const data = investmentSchema.parse(await request.json());
    const investment = await createInvestment(user.id, data);
    return NextResponse.json({ ok: true, investment }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
