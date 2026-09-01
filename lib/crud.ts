import { NextResponse } from "next/server";
import { pool } from "@/db";
import { ensureDb } from "@/db/bootstrap";
import { isSameOrigin, requirePermission, type Session } from "./auth";
import { logActivity } from "./activity";
import { revalidatePublicPages } from "./revalidate";

type Field = {
  /** column name in snake_case */
  column: string;
  /** payload key in camelCase */
  key: string;
  type: "text" | "int" | "bool" | "json" | "date";
  required?: boolean;
};

export type Resource = {
  table: string;
  fields: Field[];
  readPermission: string;
  writePermission: string;
  deletePermission?: string;
  orderBy?: string;
  /** Auto-generate a slug from this payload key when slug is empty. */
  slugFrom?: string;
  label: string;
};

export const slugify = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 160);

const camel = (s: string) => s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());

export function rowToJson(row: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) out[camel(k)] = v;
  return out;
}

function coerce(field: Field, value: unknown) {
  if (value === undefined) return undefined;
  switch (field.type) {
    case "int": {
      if (value === "" || value === null) return null;
      const n = Number(value);
      return Number.isFinite(n) ? Math.trunc(n) : null;
    }
    case "bool":
      return Boolean(value);
    case "json":
      return JSON.stringify(Array.isArray(value) || typeof value === "object" ? value : []);
    case "date":
      return value ? new Date(String(value)) : null;
    default:
      return value === null || value === undefined ? "" : String(value);
  }
}

/** Validates and normalises an incoming payload against the resource fields. */
export function buildValues(resource: Resource, body: Record<string, unknown>, partial: boolean) {
  const columns: string[] = [];
  const values: unknown[] = [];
  const errors: string[] = [];

  for (const field of resource.fields) {
    let raw = body[field.key];

    if (field.column === "slug" && resource.slugFrom && !raw) {
      const base = body[resource.slugFrom];
      if (typeof base === "string" && base.trim()) {
        raw = `${slugify(base)}-${Date.now().toString(36).slice(-4)}`;
      }
    }

    if (raw === undefined) {
      if (!partial && field.required) errors.push(`Le champ « ${field.key} » est obligatoire.`);
      continue;
    }
    if (field.required && field.type === "text" && !String(raw).trim()) {
      errors.push(`Le champ « ${field.key} » est obligatoire.`);
      continue;
    }
    columns.push(field.column);
    values.push(coerce(field, raw));
  }
  return { columns, values, errors };
}

export function makeCollectionHandlers(resource: Resource) {
  return {
    async GET(request: Request) {
      const session = await requirePermission(request, resource.readPermission);
      if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
      await ensureDb();
      const order = resource.orderBy ?? "id DESC";
      const { rows } = await pool.query(`SELECT * FROM ${resource.table} ORDER BY ${order}`);
      return NextResponse.json({ items: rows.map(rowToJson) });
    },

    async POST(request: Request) {
      const session = await requirePermission(request, resource.writePermission);
      if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 403 });
      if (!isSameOrigin(request)) {
        return NextResponse.json({ error: "invalid origin" }, { status: 403 });
      }
      const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
      await ensureDb();

      const { columns, values, errors } = buildValues(resource, body, false);
      if (errors.length) return NextResponse.json({ error: errors[0], errors }, { status: 400 });
      if (!columns.length) return NextResponse.json({ error: "Aucune donnée." }, { status: 400 });

      const placeholders = columns.map((_, i) => `$${i + 1}`);
      const casts = columns.map((c, i) =>
        resource.fields.find((f) => f.column === c)?.type === "json"
          ? `${placeholders[i]}::jsonb`
          : placeholders[i],
      );
      try {
        const { rows } = await pool.query(
          `INSERT INTO ${resource.table} (${columns.join(",")}) VALUES (${casts.join(",")}) RETURNING *`,
          values,
        );
        await logActivity(session, "create", resource.label, rows[0].id, "", request);
        revalidatePublicPages();
        return NextResponse.json({ item: rowToJson(rows[0]) }, { status: 201 });
      } catch (e) {
        return NextResponse.json({ error: dbMessage(e) }, { status: 400 });
      }
    },
  };
}

export function makeItemHandlers(resource: Resource) {
  type Ctx = { params: Promise<{ id: string }> };
  return {
    async PATCH(request: Request, ctx: Ctx) {
      const session = await requirePermission(request, resource.writePermission);
      if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 403 });
      if (!isSameOrigin(request)) {
        return NextResponse.json({ error: "invalid origin" }, { status: 403 });
      }
      const { id } = await ctx.params;
      const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
      await ensureDb();

      const { columns, values, errors } = buildValues(resource, body, true);
      if (errors.length) return NextResponse.json({ error: errors[0], errors }, { status: 400 });
      if (!columns.length) return NextResponse.json({ error: "Aucune donnée." }, { status: 400 });

      const sets = columns.map((c, i) => {
        const isJson = resource.fields.find((f) => f.column === c)?.type === "json";
        return `${c} = $${i + 1}${isJson ? "::jsonb" : ""}`;
      });
      try {
        const { rows } = await pool.query(
          `UPDATE ${resource.table} SET ${sets.join(",")} WHERE id = $${columns.length + 1} RETURNING *`,
          [...values, Number(id)],
        );
        if (!rows[0]) return NextResponse.json({ error: "Introuvable." }, { status: 404 });
        await logActivity(session, "update", resource.label, id, "", request);
        revalidatePublicPages();
        return NextResponse.json({ item: rowToJson(rows[0]) });
      } catch (e) {
        return NextResponse.json({ error: dbMessage(e) }, { status: 400 });
      }
    },

    async DELETE(request: Request, ctx: Ctx) {
      const permission = resource.deletePermission ?? resource.writePermission;
      const session = await requirePermission(request, permission);
      if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 403 });
      if (!isSameOrigin(request)) {
        return NextResponse.json({ error: "invalid origin" }, { status: 403 });
      }
      const { id } = await ctx.params;
      await ensureDb();
      await pool.query(`DELETE FROM ${resource.table} WHERE id = $1`, [Number(id)]);
      await logActivity(session, "delete", resource.label, id, "", request);
      revalidatePublicPages();
      return NextResponse.json({ ok: true });
    },
  };
}

function dbMessage(e: unknown) {
  const msg = e instanceof Error ? e.message : String(e);
  if (msg.includes("duplicate key")) return "Cette valeur existe déjà (slug ou identifiant en double).";
  if (msg.includes("violates foreign key")) return "Référence liée invalide.";
  return "Enregistrement impossible. Vérifiez les données saisies.";
}

export type { Session };
