import { NextResponse } from "next/server";
import { pool } from "@/db";
import { ensureDb } from "@/db/bootstrap";
import { getSessionFrom } from "@/lib/auth";
import { rowToJson } from "@/lib/crud";

export const dynamic = "force-dynamic";

/** Public endpoint: a visitor submits a request from the site. */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";

  if (!name) return NextResponse.json({ error: "Le nom est obligatoire." }, { status: 400 });
  if (!phone && !email) {
    return NextResponse.json(
      { error: "Indiquez un téléphone ou une adresse e-mail." },
      { status: 400 },
    );
  }
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: "Adresse e-mail invalide." }, { status: 400 });
  }
  if (phone && !/^[+\d][\d\s().-]{5,}$/.test(phone)) {
    return NextResponse.json({ error: "Numéro de téléphone invalide." }, { status: 400 });
  }

  try {
    await ensureDb();

    // Attach to an existing customer when the phone or e-mail already exists.
    let customerId: number | null = null;
    if (phone || email) {
      const { rows } = await pool.query(
        "SELECT id FROM customers WHERE (phone <> '' AND phone = $1) OR (email <> '' AND email = $2) LIMIT 1",
        [phone, email],
      );
      customerId = rows[0]?.id ?? null;
      if (!customerId) {
        const created = await pool.query(
          "INSERT INTO customers (name, phone, email) VALUES ($1,$2,$3) RETURNING id",
          [name, phone, email],
        );
        customerId = created.rows[0].id;
      }
    }

    const propertyId = body.propertyId ? Number(body.propertyId) : null;
    let reference = "";
    let propertyTitle = typeof body.propertyTitle === "string" ? body.propertyTitle : "";
    if (propertyId) {
      const { rows } = await pool.query(
        "SELECT reference, title FROM properties WHERE id = $1",
        [propertyId],
      );
      reference = rows[0]?.reference ?? "";
      propertyTitle = propertyTitle || (rows[0]?.title ?? "");
    }

    const { rows } = await pool.query(
      `INSERT INTO requests (name, phone, email, message, request_type, property_id,
                             property_title, property_reference, customer_id, source, source_page)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id`,
      [
        name, phone, email,
        typeof body.message === "string" ? body.message : "",
        typeof body.requestType === "string" ? body.requestType : "information",
        propertyId, propertyTitle, reference, customerId,
        typeof body.source === "string" ? body.source : "site",
        typeof body.sourcePage === "string" ? body.sourcePage : "",
      ],
    );
    return NextResponse.json({ ok: true, id: rows[0].id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Envoi impossible pour le moment." }, { status: 500 });
  }
}

/** Backoffice inbox. Agents only see the leads assigned to them. */
export async function GET(request: Request) {
  const session = await getSessionFrom(request);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  await ensureDb();

  const isAgent = session.role === "agent";
  const { rows } = await pool.query(
    isAgent
      ? `SELECT r.*, u.name AS agent_name FROM requests r
           LEFT JOIN users u ON u.id = r.agent_id
          WHERE r.agent_id = $1 ORDER BY r.id DESC`
      : `SELECT r.*, u.name AS agent_name FROM requests r
           LEFT JOIN users u ON u.id = r.agent_id
          ORDER BY r.id DESC`,
    isAgent ? [session.id] : [],
  );
  return NextResponse.json({ items: rows.map(rowToJson), scope: isAgent ? "assigned" : "all" });
}
