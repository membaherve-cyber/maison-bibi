import { revalidatePath } from "next/cache";

/**
 * Flushes the cached public pages after a backoffice mutation.
 *
 * The public pages are statically rendered with ISR, so without an explicit
 * invalidation a newly created, edited, unpublished or deleted property stays
 * invisible (or stays visible) for the length of the revalidate window. Calling
 * this from every mutating route makes the backoffice feel immediate.
 */
export function revalidatePublicPages(slugs: (string | undefined | null)[] = []) {
  try {
    revalidatePath("/");
    revalidatePath("/proprietes");
    revalidatePath("/sitemap.xml");

    // Clears every prerendered instance of the property route. Without this a
    // deleted or unpublished listing keeps being served from the static cache
    // instead of returning 404.
    revalidatePath("/proprietes/[slug]", "page");

    for (const slug of slugs) {
      if (slug) revalidatePath(`/proprietes/${slug}`);
    }
  } catch {
    // Revalidation must never break the write that just succeeded.
  }
}
