import { NextResponse } from "next/server";
import { pool } from "@/db";
import { ensureDb } from "@/db/bootstrap";
import { isSameOrigin, requirePermission } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { rowToJson } from "@/lib/crud";
import { saveMediaBlob } from "@/lib/storage";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Maximum accepted upload size.
 *
 * Serverless platforms cap the request body before the function even runs:
 * Vercel rejects anything over 4.5 MB with a platform-level 413. Set
 * MAX_UPLOAD_MB=4 there so the user gets a clear French message from the
 * application instead of an opaque platform error.
 */
const MAX_MB = Number(process.env.MAX_UPLOAD_MB ?? 12);
const MAX_BYTES = MAX_MB * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"]);

/** Verifies the real file type from magic bytes, not the declared MIME type. */
function sniff(buffer: Buffer): string | null {
  if (buffer.length < 12) return null;
  const hex = buffer.subarray(0, 12).toString("hex");
  if (hex.startsWith("ffd8ff")) return "image/jpeg";
  if (hex.startsWith("89504e470d0a1a0a")) return "image/png";
  if (hex.startsWith("47494638")) return "image/gif";
  if (
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) return "image/webp";
  if (buffer.subarray(4, 12).toString("ascii").startsWith("ftyp")) return "image/avif";
  return null;
}

const safeName = (name: string) =>
  name
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-").replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "").slice(0, 60) || "image";

/**
 * Sharp is a native binary. It is present on Node hosts but unavailable on
 * some edge runtimes, so it is imported lazily and the upload degrades to a
 * validated pass-through rather than failing outright.
 */
async function loadSharp() {
  try {
    const mod = await import("sharp");
    return mod.default;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const session = await requirePermission(request, "media.read");
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  await ensureDb();
  const { rows } = await pool.query("SELECT * FROM media ORDER BY id DESC LIMIT 300");
  return NextResponse.json({ items: rows.map(rowToJson) });
}

export async function POST(request: Request) {
  const session = await requirePermission(request, "media.write");
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 403 });
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "invalid origin" }, { status: 403 });
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Aucun fichier reçu." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      {
        error: `Fichier trop volumineux (maximum ${MAX_MB} Mo). Réduisez l'image puis réessayez.`,
      },
      { status: 413 },
    );
  }

  const input = Buffer.from(await file.arrayBuffer());
  const detected = sniff(input);
  if (!detected || !ALLOWED.has(detected)) {
    return NextResponse.json(
      { error: "Format non pris en charge. Utilisez JPG, PNG, WebP ou AVIF." },
      { status: 400 },
    );
  }

  const folder = String(form?.get("folder") ?? "general").replace(/[^a-z0-9-]/gi, "") || "general";
  const stem = `${Date.now().toString(36)}-${safeName(file.name).replace(/\.[^.]+$/, "")}`;

  let main = input;
  let thumb: Buffer | null = null;
  let width = 0;
  let height = 0;
  let originalDimensions = "—";
  let ext = detected === "image/png" ? "png" : detected === "image/jpeg" ? "jpg" : "webp";
  let format = detected.replace("image/", "").toUpperCase();

  const sharp = await loadSharp();
  if (sharp) {
    try {
      const pipeline = sharp(input, { failOn: "error" }).rotate(); // applies EXIF orientation
      const meta = await pipeline.metadata();
      if (!meta.width || !meta.height) throw new Error("no dimensions");
      originalDimensions = `${meta.width}×${meta.height}`;

      // Metadata is dropped by default, which strips EXIF (incl. GPS).
      main = await pipeline.clone()
        .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 82 }).toBuffer();
      thumb = await pipeline.clone()
        .resize({ width: 400, height: 300, fit: "cover" })
        .webp({ quality: 72 }).toBuffer();

      const out = await sharp(main).metadata();
      width = out.width ?? 0;
      height = out.height ?? 0;
      ext = "webp";
      format = "WebP";
    } catch {
      return NextResponse.json({ error: "Image illisible ou corrompue." }, { status: 400 });
    }
  }

  const key = `${folder}/${stem}.${ext}`;
  const thumbKey = `${folder}/${stem}-thumb.${ext}`;
  const contentType = ext === "webp" ? "image/webp" : detected;

  await saveMediaBlob(key, main, contentType);
  if (thumb) await saveMediaBlob(thumbKey, thumb, contentType);

  await ensureDb();
  const { rows } = await pool.query(
    `INSERT INTO media (filename, url, thumbnail_url, mime_type, width, height,
                        original_size, optimized_size, alt, folder, uploaded_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
    [
      `${stem}.${ext}`, `/uploads/${key}`, thumb ? `/uploads/${thumbKey}` : `/uploads/${key}`,
      contentType, width, height, file.size, main.length,
      String(form?.get("alt") ?? ""), folder, session.id,
    ],
  );

  await logActivity(session, "upload", "média", rows[0].id, `${stem}.${ext}`, request);

  return NextResponse.json(
    {
      item: rowToJson(rows[0]),
      optimization: {
        originalSize: file.size,
        optimizedSize: main.length,
        savedPercent: Math.max(0, Math.round((1 - main.length / file.size) * 100)),
        originalDimensions,
        optimizedDimensions: width ? `${width}×${height}` : "—",
        format,
        optimized: Boolean(sharp),
      },
    },
    { status: 201 },
  );
}
