import { NextResponse } from "next/server";
import { pool } from "@/db";
import { ensureDb } from "@/db/bootstrap";
import { getSessionFrom, isSameOrigin, requirePermission } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { revalidatePublicPages } from "@/lib/revalidate";

export const dynamic = "force-dynamic";

const PUBLIC_KEYS = ["general", "whatsapp", "social", "seo", "ai"];

export async function GET(request: Request) {
  await ensureDb();
  const session = await getSessionFrom(request);
  const { rows } = await pool.query("SELECT key, value FROM site_settings");
  const settings: Record<string, unknown> = {};
  for (const row of rows) {
    if (session || PUBLIC_KEYS.includes(row.key)) settings[row.key] = row.value;
  }
  return NextResponse.json({ settings });
}

export async function PATCH(request: Request) {
  const session = await requirePermission(request, "settings.write");
  if (!session) {
    return NextResponse.json(
      { error: "Vous n'avez pas les droits pour modifier les paramètres." },
      { status: 403 },
    );
  }
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "invalid origin" }, { status: 403 });
  }
  const body = (await request.json().catch(() => ({}))) as {
    key?: string;
    value?: Record<string, unknown>;
  };
  if (!body.key || typeof body.value !== "object" || body.value === null) {
    return NextResponse.json({ error: "Données invalides." }, { status: 400 });
  }
  await ensureDb();
  await pool.query(
    `INSERT INTO site_settings (key, value, updated_at) VALUES ($1,$2::jsonb, now())
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
    [body.key, JSON.stringify(body.value)],
  );
  await logActivity(session, "update", "paramètres", body.key, "", request);
  revalidatePublicPages();
  return NextResponse.json({ ok: true });
}
