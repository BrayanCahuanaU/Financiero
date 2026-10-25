import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getApiUser, unauthorized } from "@/lib/api";
import { todayISO } from "@/lib/utils";

function escapeCsv(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

export async function GET() {
  const user = await getApiUser();
  if (!user) return unauthorized();

  const db = await getDb();
  const { results = [] } = await db
    .prepare(
      `SELECT t.date, t.type, t.category, t.description, t.amount, a.name AS account
       FROM transactions t JOIN accounts a ON a.id = t.account_id
       WHERE t.user_id = ? ORDER BY t.date DESC, t.created_at DESC`,
    )
    .bind(user.id)
    .all<{
      date: string;
      type: string;
      category: string;
      description: string;
      amount: number;
      account: string;
    }>();

  const header = ["Fecha", "Tipo", "Categoria", "Descripcion", "Cuenta", "Monto", "Origen"];
  const lines = results.map((row) =>
    [
      row.date,
      row.type === "income" ? "Ingreso" : "Gasto",
      row.category,
      row.description,
      row.account,
      row.amount.toFixed(2),
      "Manual",
    ]
      .map((value) => escapeCsv(String(value)))
      .join(","),
  );

  const csv = [header.join(","), ...lines].join("\r\n");
  return new NextResponse(`\uFEFF${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="yupay-movimientos-${todayISO()}.csv"`,
    },
  });
}
