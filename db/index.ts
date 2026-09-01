import { PrismaClient } from "@prisma/client";

/**
 * Prisma client for the La Maison Bibi SQLite database.
 *
 * This replaces the source's Drizzle/Postgres client so the project runs in
 * environments where Postgres is not available, while keeping the same schema
 * shape and letting the existing API routes keep their raw SQL via the
 * `pool` shim exported below.
 */

const globalForPrisma = globalThis as typeof globalThis & {
  __lmbPrisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.__lmbPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "production" ? ["error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__lmbPrisma = prisma;
}

/* ------------------------------------------------------------------ */
/* Postgres → SQLite SQL adapter                                       */
/* ------------------------------------------------------------------ */

/**
 * Strips Postgres-specific syntax that SQLite does not understand.
 * Parameter placeholders (`$1`, `$2`, …) are handled separately in `query`
 * because Postgres allows reusing the same `$N` while SQLite needs one `?`
 * per occurrence.
 */
function toSqlite(sql: string): string {
  return sql
    // Remove Postgres type casts (e.g. `$1::jsonb`, `id::text`).
    .replace(/::\w+/g, "")
    // Postgres `now()` → SQLite `datetime('now')`.
    .replace(/\bnow\(\)/gi, "datetime('now')");
}

type QueryResult = { rows: Record<string, unknown>[] };

/**
 * Shim that mimics the `pg` Pool API the source code expects, while routing
 * every query through Prisma's `$queryRawUnsafe` against the SQLite database.
 *
 * Two placeholder styles are supported:
 *  - Postgres positional parameters (`$1`, `$2`, …): each occurrence is
 *    rewritten to `?`, and the parameter list is expanded so reused indices
 *    receive the same value multiple times.
 *  - SQLite native `?` placeholders: the parameter list is forwarded as-is.
 */
export const pool = {
  async query(sql: string, params: unknown[] = []): Promise<QueryResult> {
    const stripped = toSqlite(sql);

    if (/\$\d{1,2}\b/.test(stripped)) {
      // Postgres-style $N placeholders — expand and remap.
      const indices: number[] = [];
      const sqliteSql = stripped.replace(/\$(\d{1,2})\b/g, (_, n) => {
        indices.push(parseInt(n, 10) - 1);
        return "?";
      });
      const sqliteParams = indices.map((i) => params[i]);
      const rows = (await prisma.$queryRawUnsafe(
        sqliteSql,
        ...sqliteParams,
      )) as Record<string, unknown>[];
      return { rows: rows as Record<string, unknown>[] };
    }

    // SQLite native ? placeholders — forward params as-is.
    const rows = (await prisma.$queryRawUnsafe(
      stripped,
      ...params,
    )) as Record<string, unknown>[];
    return { rows: rows as Record<string, unknown>[] };
  },
};

export type { QueryResult };
