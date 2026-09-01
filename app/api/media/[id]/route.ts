import { NextResponse } from "next/server";
import { pool } from "@/db";
import { ensureDb } from "@/db/bootstrap";
import { isSameOrigin, requirePermission } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { deleteMediaBlob } from "@/lib/storage";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, ctx: Ctx) {
  const session = await requirePermission(request, "media.write");
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 403 });
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "invalid origin" }, { status: 403 });
  }
  const { id } = await ctx.params;
  const body = (await request.json().catch(() => ({}))) as { alt?: string };
  await ensureDb();
  await pool.query("UPDATE media SET alt = $1 WHERE id = $2", [body.alt ?? "", Number(id)]);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request, ctx: Ctx) {
  const session = await requirePermission(request, "media.delete");
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 403 });
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "invalid origin" }, { status: 403 });
  }
  const { id } = await ctx.params;
  await ensureDb();
  const { rows } = await pool.query("SELECT url, thumbnail_url FROM media WHERE id = $1", [
    Number(id),
  ]);
  const row = rows[0];
  if (row) {
    // Remove both the database copy and any on-disk mirror.
    for (const rel of [row.url, row.thumbnail_url].filter(Boolean)) {
      await deleteMediaBlob(String(rel).replace(/^\/uploads\//, ""));
    }
    await pool.query("DELETE FROM media WHERE id = $1", [Number(id)]);
    await logActivity(session, "delete", "média", id, "", request);
  }
  return NextResponse.json({ ok: true });
}
