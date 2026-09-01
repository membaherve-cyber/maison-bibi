import type { Property } from "./types";
import type { Lang } from "./i18n";

/**
 * Public base URL of the deployment, used for canonical links, Open Graph tags,
 * JSON-LD and the sitemap. Resolved from the environment so the site follows
 * the host it is actually served from instead of a hardcoded domain.
 *
 * In-app API calls never use this value: they use relative paths (`/api/...`)
 * which always resolve against the current origin, whatever the port or host.
 */
function resolveSiteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");

  const host =
    process.env.NEXT_PUBLIC_VERCEL_URL?.trim() || process.env.VERCEL_URL?.trim();
  if (host) {
    return `https://${host.replace(/^https?:\/\//, "").replace(/\/+$/, "")}`;
  }

  return "https://lamaisonbibi.com";
}

export const site = {
  name: "La Maison Bibi",
  tagline: "Votre courtier immobilier",
  email: "bibi.fructus@gmail.com",
  emails: ["bibi.fructus@gmail.com", "lamaisonbibi01@gmail.com"],
  phones: ["+237 691 39 91 91", "+237 683 20 70 70", "+237 699 92 00 13"],
  whatsapp: "237691399191",
  city: "Bonanjo, vallée des Généraux, Douala Cameroun",
  url: resolveSiteUrl(),
};

export const telHref = (phone: string) => `tel:${phone.replace(/\s/g, "")}`;

export function whatsappHref(message: string) {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;
}

export function propertyWhatsapp(p: Property, lang: Lang = "fr") {
  const title = lang === "en" ? p.titleEn : p.title;
  const message =
    lang === "en"
      ? `Hello La Maison Bibi, I am interested in "${title}" (ref. LMB-${String(p.id).padStart(4, "0")}). Could you give me more information?`
      : `Bonjour La Maison Bibi, je suis intéressé(e) par « ${title} » (réf. LMB-${String(p.id).padStart(4, "0")}). Pourriez-vous m'envoyer plus d'informations ?`;
  return whatsappHref(message);
}

export const reference = (p: Property) => `LMB-${String(p.id).padStart(4, "0")}`;

export function formatPrice(p: Property, lang: Lang = "fr") {
  if (!p.price) return lang === "en" ? "Price on request" : "Prix sur demande";
  const amount = new Intl.NumberFormat(lang === "en" ? "en-US" : "fr-FR")
    .format(p.price)
    .replace(/\u202f|\u00a0/g, " ");
  const period = p.pricePeriod
    ? lang === "en"
      ? " / month"
      : " / mois"
    : "";
  return `${amount} ${p.currency}${period}`;
}

export function formatArea(value: number | null | undefined) {
  if (!value) return null;
  return `${new Intl.NumberFormat("fr-FR").format(value).replace(/\u202f|\u00a0/g, " ")} m²`;
}

export function propertyTitle(p: Property, lang: Lang) {
  return lang === "en" ? p.titleEn || p.title : p.title;
}

export function propertyDescription(p: Property, lang: Lang) {
  return lang === "en" ? p.descriptionEn || p.description : p.description;
}

export function propertyAmenities(p: Property, lang: Lang) {
  return lang === "en" && p.amenitiesEn.length ? p.amenitiesEn : p.amenities;
}

export function transactionLabel(p: Property, lang: Lang) {
  if (p.transactionType === "location") return lang === "en" ? "For rent" : "À louer";
  return lang === "en" ? "For sale" : "À vendre";
}

export function locationLabel(p: Property) {
  return [p.neighborhood, p.city].filter(Boolean).join(", ");
}
