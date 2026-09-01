import { pool } from "@/db";
import { ensureDb } from "@/db/bootstrap";
import { authConfigStatus } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const config = authConfigStatus();

  try {
    await pool.query("select 1");
  } catch {
    return Response.json({ ok: false, database: "unreachable" }, { status: 500 });
  }

  // Reported for diagnostics but never fatal: the healthcheck reflects whether
  // the server is live, not whether seeding succeeded.
  let bootstrap = "ok";
  try {
    await ensureDb();
  } catch (e) {
    bootstrap = e instanceof Error ? e.message : String(e);
  }

  return Response.json({
    ok: true,
    database: "connected",
    bootstrap,
    backoffice: {
      sessionSecretConfigured: config.sessionSecret,
      usingBuiltinDefaults: config.usingBuiltinDefaults,
    },
  });
}
