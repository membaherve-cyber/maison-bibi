import { NextResponse } from "next/server";
import { pool } from "@/db";
import { ensureDb } from "@/db/bootstrap";
import { getSessionFrom, isSameOrigin, requirePermission } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { revalidatePublicPages } from "@/lib/revalidate";
import { rowToJson, slugify } from "@/lib/crud";
import { rowToProperty } from "@/lib/properties";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  await ensureDb();
  const session = await getSessionFrom(request);
  const { rows } = await pool.query(
    "SELECT * FROM properties ORDER BY featured DESC, id ASC",
  );
  const all = rows.map((r) => rowToProperty(rowToJson(r) as never));
  return NextResponse.json({
    properties: session ? all : all.filter((p) => p.status === "published"),
  });
}

const NUM = ["bedrooms", "bathrooms", "livingRooms", "rooms", "livingArea", "landArea", "parkingSpaces", "buildYear", "agentId"] as const;

export async function POST(request: Request) {
  const session = await requirePermission(request, "properties.write");
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 403 });
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "invalid origin" }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body || typeof body.title !== "string" || !body.title.trim()) {
    return NextResponse.json({ error: "Le titre est obligatoire." }, { status: 400 });
  }
  if (body.price !== undefined && Number(body.price) < 0) {
    return NextResponse.json({ error: "Le prix ne peut pas être négatif." }, { status: 400 });
  }
  await ensureDb();

  const num = (v: unknown) => (v === "" || v === null || v === undefined ? null : Number(v));
  const nums = Object.fromEntries(NUM.map((k) => [k, num(body[k])]));

  const { rows } = await pool.query(
    `INSERT INTO properties
       (slug,title,title_en,short_description,description,description_en,region,city,neighborhood,
        address,property_type,transaction_type,availability,price,price_period,bedrooms,bathrooms,
        living_rooms,rooms,living_area,land_area,floor,build_year,parking_spaces,condition,
        amenities,amenities_en,images,featured,status,agent_id,seo_title,seo_description,
        source,source_url,source_reference)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,
             $24,$25,$26::jsonb,$27::jsonb,$28::jsonb,$29,$30,$31,$32,$33,$34,$35,$36)
     RETURNING *`,
    [
      (typeof body.slug === "string" && body.slug.trim()) ||
        `${slugify(body.title)}-${Date.now().toString(36).slice(-5)}`,
      body.title, body.titleEn ?? "", body.shortDescription ?? "", body.description ?? "",
      body.descriptionEn ?? "", body.region ?? "Littoral", body.city ?? "Douala",
      body.neighborhood ?? "", body.address ?? "", body.propertyType ?? "Appartement",
      body.transactionType ?? "vente", body.availability ?? "disponible",
      Number(body.price) || 0, body.pricePeriod ?? "",
      nums.bedrooms, nums.bathrooms, nums.livingRooms, nums.rooms,
      nums.livingArea, nums.landArea, body.floor ?? "", nums.buildYear, nums.parkingSpaces,
      body.condition ?? "",
      JSON.stringify(Array.isArray(body.amenities) ? body.amenities : []),
      JSON.stringify(Array.isArray(body.amenitiesEn) ? body.amenitiesEn : []),
      JSON.stringify(Array.isArray(body.images) ? body.images : []),
      Boolean(body.featured), body.status ?? "published", nums.agentId,
      body.seoTitle ?? "", body.seoDescription ?? "",
      body.source ?? "", body.sourceUrl ?? "", body.sourceReference ?? "",
    ],
  );

  const row = rows[0];
  await pool.query("UPDATE properties SET reference = $1 WHERE id = $2",
    [`LMB-${String(row.id).padStart(4, "0")}`, row.id]);

  await logActivity(session, "create", "propriété", row.id, String(body.title), request);
  revalidatePublicPages([row.slug]);
  return NextResponse.json(
    { property: rowToProperty(rowToJson(row) as never) },
    { status: 201 },
  );
}
