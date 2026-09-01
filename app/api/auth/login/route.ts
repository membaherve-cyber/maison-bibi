import { NextResponse } from "next/server";
import { pool } from "@/db";
import { ensureDb } from "@/db/bootstrap";
import {
  AUTH_COOKIE,
  MANAGED_ACCOUNTS,
  makeToken,
  sessionCookieOptions,
  type Role,
} from "@/lib/auth";
import { verifyPassword } from "@/lib/password";
import { logActivity } from "@/lib/activity";

export const dynamic = "force-dynamic";

const NO_STORE = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
};

/** Simple in-memory rate limit: 8 attempts per identifier per 10 minutes. */
const attempts = new Map<string, { count: number; first: number }>();
const WINDOW = 10 * 60 * 1000;
const MAX_ATTEMPTS = 8;

function rateLimited(key: string) {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || now - entry.first > WINDOW) {
    attempts.set(key, { count: 1, first: now });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
}

const invalid = () =>
  NextResponse.json(
    { ok: false, error: "Identifiants incorrects." },
    { status: 401, headers: NO_STORE },
  );

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    username?: string;
    email?: string;
    password?: string;
  };
  // Accept either field name; the login form sends `username`.
  const identifier = (body.username ?? body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";
  if (!identifier || !password) return invalid();

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "local";
  if (rateLimited(`${ip}:${identifier}`)) {
    return NextResponse.json(
      { ok: false, error: "Trop de tentatives. Réessayez dans quelques minutes." },
      { status: 429, headers: NO_STORE },
    );
  }

  let session: { id: number; username: string; name: string; role: Role } | null = null;

  try {
    await ensureDb();
    const { rows } = await pool.query<{
      id: number; username: string; name: string; role: Role;
      password_hash: string; active: boolean;
    }>(
      "SELECT id, username, name, role, password_hash, active FROM users WHERE lower(username) = $1 OR lower(email) = $1",
      [identifier],
    );
    const row = rows[0];
    if (row && row.active && verifyPassword(password, row.password_hash)) {
      session = { id: row.id, username: row.username, name: row.name, role: row.role };
      await pool.query("UPDATE users SET last_login_at = now() WHERE id = $1", [row.id]);
    }
  } catch {
    // Database unavailable: fall back to the configured accounts so the
    // backoffice stays reachable for recovery.
    const fallback = MANAGED_ACCOUNTS.find(
      (a) => a.username.toLowerCase() === identifier && a.password === password,
    );
    if (fallback) {
      session = { id: 0, username: fallback.username, name: fallback.name, role: fallback.role };
    }
  }

  if (!session) return invalid();

  attempts.delete(`${ip}:${identifier}`);
  const token = makeToken(session);
  await logActivity(session, "login", "session", session.id, "", request);

  const res = NextResponse.json(
    { ok: true, user: session, token },
    { headers: NO_STORE },
  );
  res.cookies.set(AUTH_COOKIE, token, sessionCookieOptions(request));
  return res;
}
