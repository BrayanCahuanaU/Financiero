import { NextResponse } from "next/server";
import { createTransaction } from "@/lib/data";
import { getApiUser, apiError, unauthorized } from "@/lib/api";
import { transactionSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  const user = await getApiUser();
  if (!user) return unauthorized();
  try {
    const data = transactionSchema.parse(await request.json());
    const transaction = await createTransaction(user.id, data);
    return NextResponse.json({ ok: true, transaction }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
