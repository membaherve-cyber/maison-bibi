import { pool } from "@/db";

/**
 * Portable media storage.
 *
 * The backoffice must run identically on a classic Node server (Namecheap,
 * VPS) and on serverless platforms (Netlify, Cloudflare) where the filesystem
 * is read-only or wiped between invocations. Writing uploads to `public/`
 * therefore cannot be the only strategy: the bytes are always persisted in
 * PostgreSQL, and additionally mirrored to disk when the filesystem happens to
 * be writable so a self-hosted deployment still serves them as static files.
 */

let filesystemWritable: boolean | null = null;

/** Cheap one-off probe; serverless platforms fail this and fall back to the DB. */
async function canWriteFiles(dir: string) {
  if (filesystemWritable !== null) return filesystemWritable;
  try {
    const { mkdir, writeFile, unlink } = await import("fs/promises");
    const path = await import("path");
    await mkdir(dir, { recursive: true });
    const probe = path.join(dir, ".write-probe");
    await writeFile(probe, "ok");
    await unlink(probe);
    filesystemWritable = true;
  } catch {
    filesystemWritable = false;
  }
  return filesystemWritable;
}

export async function saveMediaBlob(
  key: string,
  data: Buffer,
  contentType: string,
) {
  // Always store in the database: this is the source of truth everywhere.
  await pool.query(
    `INSERT INTO media_blobs (key, content_type, data)
     VALUES ($1, $2, $3)
     ON CONFLICT (key) DO UPDATE SET content_type = EXCLUDED.content_type, data = EXCLUDED.data`,
    [key, contentType, data],
  );

  // Best-effort mirror to disk for self-hosted static serving.
  try {
    const path = await import("path");
    const dir = path.join(process.cwd(), "public", "uploads", path.dirname(key));
    if (await canWriteFiles(dir)) {
      const { writeFile } = await import("fs/promises");
      await writeFile(path.join(process.cwd(), "public", "uploads", key), data);
    }
  } catch {
    // Database copy already succeeded; nothing further is required.
  }
}

export async function readMediaBlob(
  key: string,
): Promise<{ data: Buffer; contentType: string } | null> {
  // Disk first (fast path on self-hosted), then the database.
  try {
    const path = await import("path");
    const { readFile } = await import("fs/promises");
    const abs = path.join(process.cwd(), "public", "uploads", key);
    const root = path.join(process.cwd(), "public", "uploads");
    if (abs === root || abs.startsWith(root + path.sep)) {
      const data = await readFile(abs);
      return { data, contentType: contentTypeFor(key) };
    }
  } catch {
    // fall through to the database
  }

  try {
    const { rows } = await pool.query<{ content_type: string; data: Buffer }>(
      "SELECT content_type, data FROM media_blobs WHERE key = $1",
      [key],
    );
    if (!rows[0]) return null;
    return { data: rows[0].data, contentType: rows[0].content_type };
  } catch {
    return null;
  }
}

export async function deleteMediaBlob(key: string) {
  try {
    await pool.query("DELETE FROM media_blobs WHERE key = $1", [key]);
  } catch {
    /* ignore */
  }
  try {
    const path = await import("path");
    const { unlink } = await import("fs/promises");
    await unlink(path.join(process.cwd(), "public", "uploads", key));
  } catch {
    /* file may not exist on this instance */
  }
}

const TYPES: Record<string, string> = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".avif": "image/avif",
  ".gif": "image/gif",
};

export function contentTypeFor(key: string) {
  const ext = key.slice(key.lastIndexOf(".")).toLowerCase();
  return TYPES[ext] ?? "application/octet-stream";
}

export function isAllowedMediaKey(key: string) {
  if (key.includes("..") || key.startsWith("/")) return false;
  return Object.keys(TYPES).some((ext) => key.toLowerCase().endsWith(ext));
}
