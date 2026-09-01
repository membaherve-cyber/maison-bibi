import { NextResponse } from "next/server";
import { pool } from "@/db";
import { ensureDb } from "@/db/bootstrap";
import { getSessionFrom } from "@/lib/auth";
import { rowToJson } from "@/lib/crud";

export const dynamic = "force-dynamic";

/** Every figure below is counted from the database; nothing is fabricated. */
export async function GET(request: Request) {
  const session = await getSessionFrom(request);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  await ensureDb();

  const isAgent = session.role === "agent";
  const agentFilter = isAgent ? "WHERE agent_id = ?" : "";
  const args = isAgent ? [session.id] : [];

  const [props, requests, appts, articles, customers, media, activity, views] =
    await Promise.all([
      pool.query(`SELECT
          SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END)                AS published,
          count(*)                                                               AS total,
          SUM(CASE WHEN availability = 'disponible' THEN 1 ELSE 0 END)          AS disponible,
          SUM(CASE WHEN availability = 'vendu' THEN 1 ELSE 0 END)               AS vendu,
          SUM(CASE WHEN availability = 'loue' THEN 1 ELSE 0 END)                AS loue,
          SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END)                     AS brouillon,
          coalesce(sum(views), 0)                                                AS views
        FROM properties`),
      pool.query(`SELECT
          count(*)                                                          AS total,
          SUM(CASE WHEN status = 'nouvelle' THEN 1 ELSE 0 END)             AS nouvelles,
          SUM(CASE WHEN status NOT IN ('terminee','annulee','convertie') THEN 1 ELSE 0 END) AS en_cours,
          SUM(CASE WHEN status = 'convertie' THEN 1 ELSE 0 END)            AS converties
        FROM requests ${agentFilter}`, args),
      pool.query(`SELECT
          count(*)                                                                 AS total,
          SUM(CASE WHEN scheduled_at >= datetime('now') AND status <> 'annule' THEN 1 ELSE 0 END) AS a_venir
        FROM appointments ${agentFilter}`, args),
      pool.query(`SELECT
          SUM(CASE WHEN status = 'publie' THEN 1 ELSE 0 END)     AS publies,
          SUM(CASE WHEN status = 'brouillon' THEN 1 ELSE 0 END)  AS brouillons,
          count(*)                                                 AS total
        FROM articles`),
      pool.query("SELECT count(*) AS total FROM customers"),
      pool.query("SELECT count(*) AS total FROM media"),
      pool.query(
        `SELECT id, username, action, resource, resource_id, detail, created_at
           FROM activity_log ORDER BY id DESC LIMIT 12`,
      ),
      pool.query(
        `SELECT event_type, count(*) AS total FROM analytics_events
          WHERE created_at > datetime('now', '-30 days') GROUP BY event_type`,
      ),
    ]);

  const events = Object.fromEntries(
    views.rows.map((r) => [r.event_type, Number(r.total)]),
  ) as Record<string, number>;

  // Requests per day for the last 14 days, for the dashboard chart.
  // SQLite recursive CTE replaces Postgres generate_series.
  const trend = await pool.query(
    `WITH RECURSIVE days(d) AS (
        SELECT date(datetime('now', '-13 days'))
        UNION ALL
        SELECT date(d, '+1 day') FROM days WHERE d < date(datetime('now'))
      )
      SELECT strftime('%Y-%m-%d', d) AS day,
             count(r.id) AS total
        FROM days
        LEFT JOIN requests r ON date(r.created_at) = d ${isAgent ? "AND r.agent_id = ?" : ""}
       GROUP BY d ORDER BY d`,
    args,
  );

  const n = (v: unknown) => Number(v ?? 0);
  const p = props.rows[0], rq = requests.rows[0], ap = appts.rows[0], ar = articles.rows[0];

  return NextResponse.json({
    scope: isAgent ? "assigned" : "all",
    properties: {
      total: n(p.total), published: n(p.published), draft: n(p.brouillon),
      disponible: n(p.disponible), vendu: n(p.vendu), loue: n(p.loue),
      views: n(p.views),
    },
    requests: {
      total: n(rq.total), nouvelles: n(rq.nouvelles),
      enCours: n(rq.en_cours), converties: n(rq.converties),
    },
    appointments: { total: n(ap.total), aVenir: n(ap.a_venir) },
    articles: { total: n(ar.total), publies: n(ar.publies), brouillons: n(ar.brouillons) },
    customers: n(customers.rows[0].total),
    media: n(media.rows[0].total),
    engagement: {
      whatsapp: events.whatsapp ?? 0,
      phone: events.phone ?? 0,
      propertyView: events.property_view ?? 0,
    },
    trend: trend.rows.map((r) => ({ day: r.day, total: Number(r.total) })),
    activity: activity.rows.map(rowToJson),
  });
}
