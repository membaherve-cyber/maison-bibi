import { pool } from "./index";
import { seedProperties } from "./seed-data";
import { MANAGED_ACCOUNTS } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/password";

/**
 * SQLite-compatible reference data. Mirrors the source's bootstrap seed
 * constants exactly, only the SQL dialect changes.
 */
const CATEGORIES = [
  "Appartement", "Villa", "Maison", "Duplex", "Terrain",
  "Bureau", "Local commercial", "Immeuble", "Entrepôt",
];

const NEIGHBORHOODS = [
  "Bonapriso", "Bonanjo", "Akwa", "Bonamoussadi", "Deido",
  "Bali", "Makepe", "Logbessou", "Logpom", "Youpwe", "Bonabéri",
  "Yassa", "Zone portuaire",
];

const SERVICES = [
  ["Vente de biens", "🏷️", "Estimation, mise en valeur, diffusion et négociation jusqu'à la signature chez le notaire."],
  ["Location", "🔑", "Recherche de locataires solvables, visites organisées, rédaction du bail et état des lieux."],
  ["Gestion locative", "📋", "Encaissement des loyers, suivi technique, entretien et reporting régulier aux propriétaires."],
  ["Conseil en investissement", "📈", "Analyse du rendement, arbitrage entre quartiers et accompagnement des investisseurs de la diaspora."],
  ["Sécurisation juridique", "⚖️", "Vérification des titres fonciers, des documents de propriété et coordination avec le notaire."],
  ["Visites accompagnées", "🎥", "Visites physiques ou en visioconférence pour les clients installés hors du Cameroun."],
];

const TEAM = [
  ["Paolina Bertrand Essukan", "Fondatrice"],
  ["Aurélie Ngo Mbappé", "Courtière immobilière"],
  ["Junior Tchoumi Fokou", "Courtier immobilier"],
  ["Nadège Eboumbou Dikongué", "Responsable gestion locative"],
];

const AI_KNOWLEDGE = [
  ["Zone d'intervention", "La Maison Bibi intervient principalement à Douala, dans la région du Littoral. Les quartiers couverts incluent Bonapriso, Bonanjo, Akwa, Bali, Bonabéri, Yassa, Youpwe et Logpom.", ["zone", "secteur", "ou", "quartier", "douala", "littoral"]],
  ["Prise de rendez-vous", "Pour organiser une visite, nos courtiers proposent un créneau sous 24 heures ouvrées. La demande peut être faite par téléphone, par WhatsApp ou via le formulaire du site.", ["rendez-vous", "visite", "visiter", "rdv"]],
  ["Frais et honoraires", "Les honoraires dépendent du type de transaction et du bien concerné. Nos conseillers communiquent le détail exact avant tout engagement. Aucune information tarifaire n'est confirmée sans validation de La Maison Bibi.", ["frais", "honoraire", "commission", "tarif"]],
  ["Horaires", "Nos équipes sont disponibles du lundi au samedi, de 8h à 19h.", ["horaire", "ouvert", "disponible", "heure"]],
];

let ready: Promise<void> | null = null;

async function run() {
  // The schema is created by Prisma (`prisma db push`), so we only seed here.
  await syncAccounts();
  await seedReferenceData();
  await seedPropertiesOnce();
  await assertNoSharedImages();
}

/** Recreates the four operational accounts and keeps passwords in sync. */
async function syncAccounts() {
  for (const account of MANAGED_ACCOUNTS) {
    const { rows } = await pool.query<{ id: number; password_hash: string }>(
      "SELECT id, password_hash FROM users WHERE username = ?",
      [account.username],
    );
    const existing = rows[0] as { id: number; password_hash: string } | undefined;
    if (!existing) {
      await pool.query(
        `INSERT INTO users (username, email, name, password_hash, role)
         VALUES (?, ?, ?, ?, ?) ON CONFLICT (username) DO NOTHING`,
        [account.username, account.email, account.name, hashPassword(account.password), account.role],
      );
      continue;
    }
    const inSync = verifyPassword(account.password, existing.password_hash);
    await pool.query(
      `UPDATE users SET name = ?, email = ?, role = ?, active = 1,
              password_hash = CASE WHEN ? THEN password_hash ELSE ? END
        WHERE id = ?`,
      [account.name, account.email, account.role, inSync ? 1 : 0, hashPassword(account.password), existing.id],
    );
  }
}

const slugify = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 120);

async function seedReferenceData() {
  for (const [i, name] of CATEGORIES.entries()) {
    await pool.query(
      `INSERT INTO property_categories (name, slug, position) VALUES (?, ?, ?)
       ON CONFLICT (slug) DO NOTHING`, [name, slugify(name), i]);
  }
  for (const [i, n] of NEIGHBORHOODS.entries()) {
    await pool.query(
      `INSERT INTO locations (neighborhood, slug, position) VALUES (?, ?, ?)
       ON CONFLICT (slug) DO NOTHING`, [n, slugify(n), i]);
  }
  for (const [i, [name, icon, desc]] of SERVICES.entries()) {
    await pool.query(
      `INSERT INTO services (slug, name, icon, short_description, description, position)
       VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT (slug) DO NOTHING`,
      [slugify(name), name, icon, desc, desc, i]);
  }
  for (const [i, [name, role]] of TEAM.entries()) {
    const { rows } = await pool.query("SELECT 1 FROM team_members WHERE name = ?", [name]);
    if (!rows.length) {
      await pool.query(
        `INSERT INTO team_members (name, role, position) VALUES (?, ?, ?)`, [name, role, i]);
    }
  }
  for (const [i, [title, content, keywords]] of AI_KNOWLEDGE.entries()) {
    const { rows } = await pool.query("SELECT 1 FROM ai_knowledge WHERE title = ?", [title]);
    if (!rows.length) {
      await pool.query(
        `INSERT INTO ai_knowledge (title, content, keywords, position)
         VALUES (?, ?, ?, ?)`,
        [title, content, JSON.stringify(keywords), i]);
    }
  }
  await pool.query(
    `INSERT INTO article_categories (name, slug, position) VALUES
       ('Marché immobilier','marche-immobilier',0),
       ('Conseils','conseils',1),
       ('Actualités','actualites',2)
     ON CONFLICT (slug) DO NOTHING`);

  const defaults: [string, Record<string, unknown>][] = [
    ["general", {
      businessName: "La Maison Bibi",
      tagline: "Votre courtier immobilier",
      founder: "Paolina Bertrand Essukan",
      description: "Cabinet de courtage immobilier à Douala, région du Littoral.",
      email: "lamaisonbibi@gmail.com",
      phones: ["+237 691 39 91 91", "+237 683 20 70 70", "+237 699 92 00 13"],
      address: "Douala, Cameroun",
      region: "Littoral",
    }],
    ["whatsapp", {
      primary: "237691399191",
      secondary: "237683207070",
      defaultMessage: "Bonjour La Maison Bibi, je souhaite obtenir des informations.",
      propertyMessage: "Bonjour La Maison Bibi, je suis intéressé(e) par le bien {titre} (réf. {reference}). Pourriez-vous me communiquer plus de détails ?",
      appointmentMessage: "Bonjour La Maison Bibi, je souhaite organiser une visite pour {titre} (réf. {reference}).",
    }],
    ["social", { facebook: "", instagram: "", linkedin: "" }],
    ["seo", {
      defaultTitle: "La Maison Bibi — Courtier immobilier à Douala",
      defaultDescription: "Villas, appartements, terrains, bureaux et locaux commerciaux à vendre et à louer à Douala et dans le Littoral.",
      robots: "index,follow",
    }],
    ["ai", {
      assistantName: "Bibi",
      welcomeMessage: "Bonjour, je suis Bibi. Dites-moi ce que vous recherchez : un appartement à louer à Akwa, une villa à vendre à Bonapriso, un entrepôt à Bonabéri…",
      escalationMessage: "Souhaitez-vous poursuivre avec La Maison Bibi sur WhatsApp pour obtenir davantage de détails ou organiser un rendez-vous ?",
    }],
  ];
  for (const [key, value] of defaults) {
    await pool.query(
      `INSERT INTO site_settings (key, value) VALUES (?, ?) ON CONFLICT (key) DO NOTHING`,
      [key, JSON.stringify(value)]);
  }
}

async function seedPropertiesOnce() {
  for (const p of seedProperties) {
    await pool.query(
      `INSERT INTO properties
        (slug,title,title_en,description,description_en,city,neighborhood,address,property_type,
         transaction_type,price,price_period,bedrooms,bathrooms,living_rooms,living_area,land_area,
         floor,parking_spaces,amenities,amenities_en,images,featured,condition,source,source_url,
         seo_title,seo_description,source_reference)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
       ON CONFLICT (slug) DO UPDATE SET
         source = EXCLUDED.source, source_url = EXCLUDED.source_url,
         source_reference = EXCLUDED.source_reference`,
      [p.slug, p.title, p.titleEn ?? "", p.description ?? "", p.descriptionEn ?? "",
       p.city ?? "Douala", p.neighborhood ?? "", p.address ?? "", p.propertyType,
       p.transactionType ?? "vente", p.price ?? 0, p.pricePeriod ?? "",
       p.bedrooms ?? null, p.bathrooms ?? null, p.livingRooms ?? null,
       p.livingArea ?? null, p.landArea ?? null, p.floor ?? "", p.parkingSpaces ?? null,
       JSON.stringify(p.amenities ?? []), JSON.stringify(p.amenitiesEn ?? []),
       JSON.stringify(p.images ?? []), p.featured ?? false ? 1 : 0, p.condition ?? "",
       p.source ?? "", p.sourceUrl ?? "", p.seoTitle ?? "", p.seoDescription ?? "",
       p.sourceReference ?? ""]);
  }
  // SQLite equivalent of `lpad(id::text, 4, '0')`: printf('%04d', id).
  await pool.query(
    `UPDATE properties SET reference = 'LMB-' || printf('%04d', id) WHERE reference = '' OR reference IS NULL`);
}

/** No image may belong to two properties (spec: premium imagery rule). */
async function assertNoSharedImages() {
  const { rows } = await pool.query<{ id: number; images: string }>(
    "SELECT id, images FROM properties ORDER BY id");
  const owner = new Map<string, number>();
  for (const row of rows) {
    const raw = row.images as unknown;
    const images = Array.isArray(raw) ? raw : (() => {
      try { return JSON.parse(String(raw)) as string[]; } catch { return []; }
    })();
    const cleaned = images.filter((url) => {
      const key = imageKey(url);
      const existing = owner.get(key);
      if (existing !== undefined && existing !== row.id) return false;
      owner.set(key, row.id);
      return true;
    });
    if (cleaned.length !== images.length) {
      await pool.query("UPDATE properties SET images = ? WHERE id = ?",
        [JSON.stringify(cleaned), row.id]);
    }
  }
}

export function imageKey(url: string) {
  return url.split("?")[0].trim().toLowerCase();
}

export function ensureDb(): Promise<void> {
  if (!ready) {
    ready = run().catch((error) => {
      ready = null;
      throw error;
    });
  }
  return ready;
}
