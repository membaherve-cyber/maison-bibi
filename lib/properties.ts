import { pool } from "@/db";
import { ensureDb } from "@/db/bootstrap";
import { seedProperties } from "@/db/seed-data";
import type { Property, TransactionType } from "./types";

/**
 * Parses a value that may be a JSON string or already-parsed array.
 * SQLite stores JSON columns as TEXT, so raw query results come back as
 * strings and must be parsed before use.
 */
function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value as string[];
  if (typeof value === "string" && value.length > 0) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed as string[];
    } catch {
      // fall through
    }
  }
  return [];
}

/** Normalises a raw database row (snake_case columns) into the Property type. */
function rowToProperty(row: Record<string, unknown>): Property {
  const r = row as Record<string, unknown> & {
    id: number;
    slug: string;
    title: string;
    title_en: string | null;
    description: string | null;
    description_en: string | null;
    city: string | null;
    neighborhood: string | null;
    address: string | null;
    property_type: string;
    transaction_type: string | null;
    price: number | null;
    currency: string | null;
    price_period: string | null;
    bedrooms: number | null;
    bathrooms: number | null;
    living_rooms: number | null;
    living_area: number | null;
    land_area: number | null;
    floor: string | null;
    parking_spaces: number | null;
    amenities: unknown;
    amenities_en: unknown;
    images: unknown;
    featured: number | boolean | null;
    verified_land_title: number | boolean | null;
    status: string | null;
    condition: string | null;
    source: string | null;
    source_url: string | null;
    source_reference: string | null;
    reference: string | null;
    availability: string | null;
    region: string | null;
    short_description: string | null;
    agent_id: number | null;
    views: number | null;
    seo_title: string | null;
    seo_description: string | null;
  };

  const toBool = (v: unknown) => v === true || v === 1 || v === "1";

  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    titleEn: r.title_en || r.title,
    description: r.description ?? "",
    descriptionEn: r.description_en || r.description || "",
    city: r.city ?? "Douala",
    neighborhood: r.neighborhood ?? "",
    address: r.address ?? "",
    propertyType: r.property_type,
    transactionType: (r.transaction_type as TransactionType) ?? "vente",
    price: r.price ?? 0,
    currency: r.currency ?? "FCFA",
    pricePeriod: r.price_period ?? "",
    bedrooms: r.bedrooms ?? null,
    bathrooms: r.bathrooms ?? null,
    livingRooms: r.living_rooms ?? null,
    livingArea: r.living_area ?? null,
    landArea: r.land_area ?? null,
    floor: r.floor ?? "",
    parkingSpaces: r.parking_spaces ?? null,
    amenities: asStringArray(r.amenities),
    amenitiesEn: asStringArray(r.amenities_en),
    images: asStringArray(r.images),
    featured: toBool(r.featured),
    verifiedLandTitle: toBool(r.verified_land_title),
    status: r.status ?? "published",
    condition: r.condition ?? "",
    source: r.source ?? "",
    sourceUrl: r.source_url ?? "",
    sourceReference: r.source_reference ?? "",
    reference: r.reference ?? `LMB-${String(r.id).padStart(4, "0")}`,
    availability: r.availability ?? "disponible",
    region: r.region ?? "Littoral",
    shortDescription: r.short_description ?? "",
    agentId: r.agent_id ?? null,
    views: r.views ?? 0,
    seoTitle: r.seo_title ?? "",
    seoDescription: r.seo_description ?? "",
  };
}

/** Offline fallback so the site always renders, even without a database. */
function fallbackProperties(): Property[] {
  return seedProperties.map((p, index) =>
    rowToProperty({
      id: index + 1,
      slug: p.slug,
      title: p.title,
      title_en: p.titleEn ?? "",
      description: p.description ?? "",
      description_en: p.descriptionEn ?? "",
      city: p.city ?? "Douala",
      neighborhood: p.neighborhood ?? "",
      address: p.address ?? "",
      property_type: p.propertyType,
      transaction_type: p.transactionType ?? "vente",
      price: p.price ?? 0,
      currency: p.currency ?? "FCFA",
      price_period: p.pricePeriod ?? "",
      bedrooms: p.bedrooms ?? null,
      bathrooms: p.bathrooms ?? null,
      living_rooms: p.livingRooms ?? null,
      living_area: p.livingArea ?? null,
      land_area: p.landArea ?? null,
      floor: p.floor ?? "",
      parking_spaces: p.parkingSpaces ?? null,
      amenities: p.amenities ?? [],
      amenities_en: p.amenitiesEn ?? [],
      images: p.images ?? [],
      featured: p.featured ?? false,
      verified_land_title: p.verifiedLandTitle ?? false,
      status: p.status ?? "published",
      condition: p.condition ?? "",
      source: p.source ?? "",
      source_url: p.sourceUrl ?? "",
      source_reference: p.sourceReference ?? "",
      reference: `LMB-${String(index + 1).padStart(4, "0")}`,
      availability: "disponible",
      region: "Littoral",
      short_description: "",
      agent_id: null,
      views: 0,
      seo_title: p.seoTitle ?? "",
      seo_description: p.seoDescription ?? "",
    }),
  );
}

export { rowToProperty };

export async function getAllProperties(includeDrafts = false): Promise<Property[]> {
  try {
    await ensureDb();
    const { rows } = await pool.query(
      "SELECT * FROM properties ORDER BY featured DESC, id ASC",
    );
    const list = rows.map(rowToProperty);
    return includeDrafts ? list : list.filter((p) => p.status === "published");
  } catch {
    return fallbackProperties();
  }
}

export async function getPropertyBySlug(slug: string): Promise<Property | null> {
  try {
    await ensureDb();
    const { rows } = await pool.query(
      "SELECT * FROM properties WHERE slug = ? LIMIT 1",
      [slug],
    );
    if (rows[0]) return rowToProperty(rows[0]);
  } catch {
    // ignore and use fallback below
  }
  return fallbackProperties().find((p) => p.slug === slug) ?? null;
}

export function relatedProperties(all: Property[], current: Property, limit = 3) {
  const scored = all
    .filter((p) => p.id !== current.id && p.status === "published")
    .map((p) => {
      let score = 0;
      if (p.neighborhood === current.neighborhood) score += 3;
      if (p.propertyType === current.propertyType) score += 2;
      if (p.transactionType === current.transactionType) score += 1;
      return { p, score };
    })
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.p);
}
