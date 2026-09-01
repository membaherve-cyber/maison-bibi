import { NextResponse } from "next/server";
import { pool } from "@/db";
import { ensureDb } from "@/db/bootstrap";
import { isSameOrigin, requirePermission } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { logActivity } from "@/lib/activity";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, ctx: Ctx) {
  const session = await requirePermission(request, "users.write");
  if (!session) {
    return NextResponse.json(
      { error: "Seule la direction peut modifier un utilisateur." },
      { status: 403 },
    );
  }
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "invalid origin" }, { status: 403 });
  }
  const { id } = await ctx.params;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  await ensureDb();

  const { rows } = await pool.query("SELECT id, username, role FROM users WHERE id = $1", [
    Number(id),
  ]);
  const target = rows[0];
  if (!target) return NextResponse.json({ error: "Introuvable." }, { status: 404 });

  const sets: string[] = [];
  const values: unknown[] = [];
  const push = (col: string, val: unknown) => {
    values.push(val);
    sets.push(`${col} = $${values.length}`);
  };

  if (typeof body.name === "string") push("name", body.name);
  if (typeof body.email === "string") push("email", body.email);
  if (typeof body.phone === "string") push("phone", body.phone);
  if (typeof body.password === "string") {
    if (body.password.length < 8) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins 8 caractères." },
        { status: 400 },
      );
    }
    push("password_hash", hashPassword(body.password));
  }
  if (typeof body.role === "string") {
    if (!["manager", "admin", "agent"].includes(body.role)) {
      return NextResponse.json({ error: "Rôle invalide." }, { status: 400 });
    }
    if (target.id === session.id && body.role !== "manager") {
      return NextResponse.json(
        { error: "Vous ne pouvez pas retirer votre propre rôle de direction." },
        { status: 400 },
      );
    }
    push("role", body.role);
  }
  if (typeof body.active === "boolean") {
    if (target.id === session.id && !body.active) {
      return NextResponse.json(
        { error: "Vous ne pouvez pas désactiver votre propre compte." },
        { status: 400 },
      );
    }
    push("active", body.active);
  }
  if (!sets.length) return NextResponse.json({ error: "Aucune donnée." }, { status: 400 });

  values.push(Number(id));
  await pool.query(`UPDATE users SET ${sets.join(",")} WHERE id = $${values.length}`, values);
  await logActivity(session, "update", "utilisateur", id, target.username, request);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request, ctx: Ctx) {
  const session = await requirePermission(request, "users.write");
  if (!session) {
    return NextResponse.json(
      { error: "Seule la direction peut supprimer un utilisateur." },
      { status: 403 },
    );
  }
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "invalid origin" }, { status: 403 });
  }
  const { id } = await ctx.params;
  await ensureDb();
  const { rows } = await pool.query("SELECT id, username FROM users WHERE id = $1", [Number(id)]);
  if (!rows[0]) return NextResponse.json({ ok: true });
  if (rows[0].id === session.id) {
    return NextResponse.json(
      { error: "Vous ne pouvez pas supprimer votre propre compte." },
      { status: 400 },
    );
  }
  await pool.query("DELETE FROM users WHERE id = $1", [Number(id)]);
  await logActivity(session, "delete", "utilisateur", id, rows[0].username, request);
  return NextResponse.json({ ok: true });
}
