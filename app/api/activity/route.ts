import { NextResponse } from "next/server";
import { pool } from "@/db";
import { ensureDb } from "@/db/bootstrap";
import { requirePermission } from "@/lib/auth";
import { rowToJson } from "@/lib/crud";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await requirePermission(request, "activity.read");
  if (!session) {
    return NextResponse.json(
      { error: "Journal réservé à la direction." },
      { status: 403 },
    );
  }
  await ensureDb();
  const url = new URL(request.url);
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 100), 300);
  const { rows } = await pool.query(
    "SELECT * FROM activity_log ORDER BY id DESC LIMIT $1",
    [limit],
  );
  return NextResponse.json({ items: rows.map(rowToJson) });
}
