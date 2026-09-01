import { pool } from "@/db";
import type { Session } from "./auth";

/**
 * Records an administrative action. Never throws: an audit failure must not
 * roll back the business operation that already succeeded.
 */
export async function logActivity(
  session: Session | null,
  action: string,
  resource: string,
  resourceId: string | number = "",
  detail = "",
  request?: Request,
) {
  try {
    const ip =
      request?.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "";
    await pool.query(
      `INSERT INTO activity_log (user_id, username, action, resource, resource_id, detail, ip)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [
        session?.id ?? null,
        session?.username ?? "",
        action,
        resource,
        String(resourceId),
        detail,
        ip,
      ],
    );
  } catch {
    // ignore
  }
}
