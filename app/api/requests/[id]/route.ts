import { NextResponse } from "next/server";
import { pool } from "@/db";
import { ensureDb } from "@/db/bootstrap";
import { getSessionFrom, isSameOrigin, requirePermission } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { rowToJson } from "@/lib/crud";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

const STATUSES = [
  "nouvelle", "contactee", "qualifiee", "visite-planifiee",
  "offre", "convertie", "terminee", "annulee",
];

export async function PATCH(request: Request, ctx: Ctx) {
  const session = await getSessionFrom(request);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "invalid origin" }, { status: 403 });
  }
  const { id } = await ctx.params;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  await ensureDb();

  const { rows: existing } = await pool.query(
    "SELECT agent_id FROM requests WHERE id = $1",
    [Number(id)],
  );
  if (!existing[0]) return NextResponse.json({ error: "Introuvable." }, { status: 404 });

  // An agent may only work on leads assigned to them, and may never reassign.
  if (session.role === "agent") {
    if (existing[0].agent_id !== session.id) {
      return NextResponse.json(
        { error: "Cette demande ne vous est pas assignée." },
        { status: 403 },
      );
    }
    if (body.agentId !== undefined) {
      return NextResponse.json(
        { error: "Seule la direction peut réassigner une demande." },
        { status: 403 },
      );
    }
  }

  const sets: string[] = [];
  const values: unknown[] = [];
  const push = (col: string, val: unknown) => {
    values.push(val);
    sets.push(`${col} = $${values.length}`);
  };

  if (typeof body.status === "string") {
    if (!STATUSES.includes(body.status)) {
      return NextResponse.json({ error: "Statut invalide." }, { status: 400 });
    }
    push("status", body.status);
  }
  if (typeof body.internalNotes === "string") push("internal_notes", body.internalNotes);
  if (body.agentId !== undefined) {
    push("agent_id", body.agentId === null || body.agentId === "" ? null : Number(body.agentId));
  }
  if (!sets.length) return NextResponse.json({ error: "Aucune donnée." }, { status: 400 });
  push("updated_at", new Date());

  values.push(Number(id));
  const { rows } = await pool.query(
    `UPDATE requests SET ${sets.join(",")} WHERE id = $${values.length} RETURNING *`,
    values,
  );
  await logActivity(session, "update", "demande", id, String(body.status ?? ""), request);
  return NextResponse.json({ item: rowToJson(rows[0]) });
}

export async function DELETE(request: Request, ctx: Ctx) {
  const session = await requirePermission(request, "requests.delete");
  if (!session) {
    return NextResponse.json(
      { error: "Seule la direction peut supprimer une demande." },
      { status: 403 },
    );
  }
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "invalid origin" }, { status: 403 });
  }
  const { id } = await ctx.params;
  await ensureDb();
  await pool.query("DELETE FROM requests WHERE id = $1", [Number(id)]);
  await logActivity(session, "delete", "demande", id, "", request);
  return NextResponse.json({ ok: true });
}
