import { isAllowedMediaKey, readMediaBlob } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Serves uploaded media.
 *
 * Files added after the build are not picked up by the static `public/`
 * handler, and on serverless platforms they are not on disk at all, so this
 * route resolves them through the storage layer (disk, then database).
 */
export async function GET(
  _request: Request,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await ctx.params;
  const key = segments.join("/");

  // Rejects traversal attempts and any non-image extension.
  if (!isAllowedMediaKey(key)) {
    return new Response("Not found", { status: 404 });
  }

  const blob = await readMediaBlob(key);
  if (!blob) return new Response("Not found", { status: 404 });

  return new Response(new Uint8Array(blob.data), {
    headers: {
      "Content-Type": blob.contentType,
      "Content-Length": String(blob.data.length),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
