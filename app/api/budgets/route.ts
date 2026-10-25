import { NextResponse } from "next/server";
import { upsertBudget } from "@/lib/data";
import { apiError, getApiUser, unauthorized } from "@/lib/api";
import { budgetSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  const user = await getApiUser();
  if (!user) return unauthorized();
  try {
    const data = budgetSchema.parse(await request.json());
    await upsertBudget(user.id, data.category, data.monthly_limit);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
