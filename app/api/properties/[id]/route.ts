import { NextResponse } from "next/server";
import { pool } from "@/db";
import { ensureDb } from "@/db/bootstrap";
import { isSameOrigin, requirePermission } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { revalidatePublicPages } from "@/lib/revalidate";
import { rowToJson } from "@/lib/crud";
import { rowToProperty } from "@/lib/properties";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

const TEXT: [string, string][] = [
  ["title", "title"], ["title_en", "titleEn"], ["short_description", "shortDescription"],
  ["description", "description"], ["description_en", "descriptionEn"],
  ["region", "region"], ["city", "city"], ["neighborhood", "neighborhood"],
  ["address", "address"], ["property_type", "propertyType"],
  ["transaction_type", "transactionType"], ["availability", "availability"],
  ["price_period", "pricePeriod"], ["floor", "floor"], ["condition", "condition"],
  ["status", "status"], ["seo_title", "seoTitle"], ["seo_description", "seoDescription"],
  ["source", "source"], ["source_url", "sourceUrl"], ["source_reference", "sourceReference"],
  ["slug", "slug"], ["og_image", "ogImage"],
];
const NUMS: [string, string][] = [
  ["bedrooms", "bedrooms"], ["bathrooms", "bathrooms"], ["living_rooms", "livingRooms"],
  ["rooms", "rooms"], ["living_area", "livingArea"], ["land_area", "landArea"],
  ["parking_spaces", "parkingSpaces"], ["build_year", "buildYear"], ["agent_id", "agentId"],
];

export async function PATCH(request: Request, ctx: Ctx) {
  const session = await requirePermission(request, "properties.write");
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 403 });
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "invalid origin" }, { status: 403 });
  }
  const { id } = await ctx.params;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  await ensureDb();

  const sets: string[] = [];
  const values: unknown[] = [];
  const push = (col: string, val: unknown, cast = "") => {
    values.push(val);
    sets.push(`${col} = $${values.length}${cast}`);
  };

  for (const [col, key] of TEXT) {
    if (typeof body[key] === "string") push(col, body[key]);
  }
  for (const [col, key] of NUMS) {
    if (body[key] !== undefined) {
      const v = body[key];
      push(col, v === "" || v === null ? null : Number(v));
    }
  }
  if (body.price !== undefined) {
    const price = Number(body.price);
    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json({ error: "Prix invalide." }, { status: 400 });
    }
    push("price", price);
  }
  for (const [col, key] of [["amenities", "amenities"], ["amenities_en", "amenitiesEn"], ["images", "images"]] as [string, string][]) {
    if (Array.isArray(body[key])) push(col, JSON.stringify(body[key]), "::jsonb");
  }
  for (const [col, key] of [["featured", "featured"], ["verified_land_title", "verifiedLandTitle"], ["noindex", "noindex"]] as [string, string][]) {
    if (body[key] !== undefined) push(col, Boolean(body[key]));
  }
  if (!sets.length) return NextResponse.json({ error: "Aucune donnée." }, { status: 400 });
  push("updated_at", new Date());

  const [previous] = (
    await pool.query("SELECT slug FROM properties WHERE id = $1", [Number(id)])
  ).rows;

  values.push(Number(id));
  const { rows } = await pool.query(
    `UPDATE properties SET ${sets.join(",")} WHERE id = $${values.length} RETURNING *`,
    values,
  );
  if (!rows[0]) return NextResponse.json({ error: "Introuvable." }, { status: 404 });

  await logActivity(session, "update", "propriété", id, String(rows[0].title), request);
  revalidatePublicPages([rows[0].slug, previous?.slug]);
  return NextResponse.json({ property: rowToProperty(rowToJson(rows[0]) as never) });
}

export async function DELETE(request: Request, ctx: Ctx) {
  const session = await requirePermission(request, "properties.delete");
  if (!session) {
    return NextResponse.json(
      { error: "Seule la direction peut supprimer une propriété." },
      { status: 403 },
    );
  }
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "invalid origin" }, { status: 403 });
  }
  const { id } = await ctx.params;
  await ensureDb();
  const [previous] = (
    await pool.query("SELECT slug, title FROM properties WHERE id = $1", [Number(id)])
  ).rows;
  await pool.query("DELETE FROM properties WHERE id = $1", [Number(id)]);
  await logActivity(session, "delete", "propriété", id, previous?.title ?? "", request);
  revalidatePublicPages([previous?.slug]);
  return NextResponse.json({ ok: true });
}
