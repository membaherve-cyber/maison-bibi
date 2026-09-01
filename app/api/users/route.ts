import { NextResponse } from "next/server";
import { pool } from "@/db";
import { ensureDb } from "@/db/bootstrap";
import { isSameOrigin, requirePermission } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { logActivity } from "@/lib/activity";
import { rowToJson } from "@/lib/crud";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await requirePermission(request, "users.read");
  if (!session) {
    return NextResponse.json(
      { error: "Seule la direction peut gérer les utilisateurs." },
      { status: 403 },
    );
  }
  await ensureDb();
  const { rows } = await pool.query(
    `SELECT id, username, email, name, role, phone, active, last_login_at, created_at
       FROM users ORDER BY
         CASE role WHEN 'manager' THEN 0 WHEN 'admin' THEN 1 ELSE 2 END, id`,
  );
  return NextResponse.json({ items: rows.map(rowToJson) });
}

export async function POST(request: Request) {
  const session = await requirePermission(request, "users.write");
  if (!session) {
    return NextResponse.json(
      { error: "Seule la direction peut créer un utilisateur." },
      { status: 403 },
    );
  }
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "invalid origin" }, { status: 403 });
  }
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const username = String(body.username ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const role = String(body.role ?? "agent");

  if (!/^[a-z0-9._-]{3,40}$/.test(username)) {
    return NextResponse.json(
      { error: "Identifiant invalide (3 à 40 caractères, sans espace)." },
      { status: 400 },
    );
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: "Le mot de passe doit contenir au moins 8 caractères." },
      { status: 400 },
    );
  }
  if (!["manager", "admin", "agent"].includes(role)) {
    return NextResponse.json({ error: "Rôle invalide." }, { status: 400 });
  }

  await ensureDb();
  const { rows: dupe } = await pool.query("SELECT 1 FROM users WHERE username = $1", [username]);
  if (dupe.length) {
    return NextResponse.json({ error: "Cet identifiant existe déjà." }, { status: 409 });
  }

  const { rows } = await pool.query(
    `INSERT INTO users (username, email, name, password_hash, role, phone)
     VALUES ($1,$2,$3,$4,$5,$6)
     RETURNING id, username, email, name, role, phone, active`,
    [
      username,
      String(body.email ?? ""),
      String(body.name ?? username),
      hashPassword(password),
      role,
      String(body.phone ?? ""),
    ],
  );
  await logActivity(session, "create", "utilisateur", rows[0].id, username, request);
  return NextResponse.json({ item: rowToJson(rows[0]) }, { status: 201 });
}
