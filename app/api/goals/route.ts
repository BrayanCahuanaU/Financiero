import { NextResponse } from "next/server";
import { createGoal } from "@/lib/data";
import { apiError, getApiUser, unauthorized } from "@/lib/api";
import { goalSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  const user = await getApiUser();
  if (!user) return unauthorized();
  try {
    const data = goalSchema.parse(await request.json());
    const goal = await createGoal(user.id, data);
    return NextResponse.json({ ok: true, goal }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
