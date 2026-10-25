import { NextResponse } from "next/server";
import { addContribution } from "@/lib/data";
import { apiError, getApiUser, unauthorized } from "@/lib/api";
import { contributionSchema } from "@/lib/schemas";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getApiUser();
  if (!user) return unauthorized();
  try {
    const { id } = await params;
    const data = contributionSchema.parse(await request.json());
    await addContribution(user.id, id, data);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
