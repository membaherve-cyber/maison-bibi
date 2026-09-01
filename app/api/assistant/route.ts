import { NextResponse } from "next/server";
import { getAllProperties } from "@/lib/properties";
import { formatPrice, locationLabel, propertyTitle, site } from "@/lib/site";
import type { Lang } from "@/lib/i18n";
import type { Property } from "@/lib/types";

export const dynamic = "force-dynamic";

const TYPES: Record<string, string[]> = {
  Villa: ["villa", "maison", "house"],
  Appartement: ["appartement", "apartment", "studio", "flat"],
  Duplex: ["duplex"],
  Immeuble: ["immeuble", "building", "r+"],
  Entrepôt: ["entrepot", "entrepôt", "warehouse", "hangar", "stockage", "logistique"],
  Bureau: ["bureau", "office"],
  "Local commercial": ["local commercial", "commerce", "shop", "boutique"],
  Terrain: ["terrain", "land", "parcelle"],
};

const AREAS = [
  "bonapriso",
  "bonanjo",
  "akwa",
  "bonabéri",
  "bonaberi",
  "yassa",
  "bonamoussadi",
  "makepe",
  "bastos",
  "douala",
  "yaoundé",
  "yaounde",
];

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/**
 * Whole-word keyword match.
 *
 * A plain `includes()` produced false positives: "warehouse" contains "house",
 * so a warehouse enquiry was answered with villas. Matching on word boundaries
 * keeps multi-word keys such as "local commercial" working while preventing
 * one keyword from being swallowed by a longer word.
 */
function hasWord(haystack: string, needle: string) {
  const escaped = normalize(needle).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`).test(haystack);
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    message?: string;
    lang?: Lang;
  };
  const lang: Lang = body.lang === "en" ? "en" : "fr";
  const raw = (body.message ?? "").trim();
  const msg = normalize(raw);
  const all = (await getAllProperties()).filter((p) => p.status === "published");

  const wantsContact =
    /(conseiller|advisor|contact|appeler|call|telephone|whatsapp|rendez|visite|viewing|agent|parler|speak)/.test(
      msg,
    );

  if (!raw) {
    return NextResponse.json({
      reply:
        lang === "en"
          ? "Tell me what you are looking for and I will find matching properties."
          : "Dites-moi ce que vous cherchez et je vous propose des biens correspondants.",
    });
  }

  if (wantsContact && !/(villa|appartement|apartment|maison|entrepot|immeuble|duplex|terrain|bureau)/.test(msg)) {
    return NextResponse.json({
      reply:
        lang === "en"
          ? `Our advisors answer every day, 8am to 7pm. Call ${site.phones[0]} or ${site.phones[1]}, WhatsApp us, or write to ${site.email}. You can also use the contact form and we will call you back.`
          : `Nos conseillers vous répondent chaque jour de 8h à 19h. Appelez le ${site.phones[0]} ou le ${site.phones[1]}, écrivez-nous sur WhatsApp, ou par email à ${site.email}. Vous pouvez aussi remplir le formulaire de contact et nous vous rappelons.`,
    });
  }

  let list: Property[] = all;
  const filtersApplied: string[] = [];

  const isRent = /(louer|location|rent|rental|mensuel|loyer)/.test(msg);
  const isSale = /(vendre|vente|achat|acheter|buy|sale|purchase|investir)/.test(msg);
  if (isRent && !isSale) {
    list = list.filter((p) => p.transactionType === "location");
    filtersApplied.push(lang === "en" ? "for rent" : "à louer");
  } else if (isSale && !isRent) {
    list = list.filter((p) => p.transactionType === "vente");
    filtersApplied.push(lang === "en" ? "for sale" : "à vendre");
  }

  for (const [type, keys] of Object.entries(TYPES)) {
    if (keys.some((k) => hasWord(msg, k))) {
      const filtered = list.filter((p) => p.propertyType === type);
      if (filtered.length) {
        list = filtered;
        filtersApplied.push(type.toLowerCase());
      }
      break;
    }
  }

  const area = AREAS.find((a) => hasWord(msg, a));
  if (area) {
    const filtered = list.filter(
      (p) =>
        normalize(p.neighborhood).includes(normalize(area)) ||
        normalize(p.city).includes(normalize(area)),
    );
    if (filtered.length) {
      list = filtered;
      filtersApplied.push(area);
    }
  }

  const bedroomsMatch = msg.match(/(\d+)\s*(chambre|bedroom|piece|room)/);
  if (bedroomsMatch) {
    const n = Number(bedroomsMatch[1]);
    const filtered = list.filter((p) => (p.bedrooms ?? 0) >= n);
    if (filtered.length) {
      list = filtered;
      filtersApplied.push(lang === "en" ? `${n}+ bedrooms` : `${n}+ chambres`);
    }
  }

  const budgetMatch = msg.match(/(\d[\d\s.]{4,})/);
  if (budgetMatch) {
    const budget = Number(budgetMatch[1].replace(/[\s.]/g, ""));
    if (budget > 100000) {
      const filtered = list.filter((p) => p.price <= budget);
      if (filtered.length) {
        list = filtered;
        filtersApplied.push(
          lang === "en"
            ? `budget ${budget.toLocaleString("en-US")} FCFA`
            : `budget ${budget.toLocaleString("fr-FR")} FCFA`,
        );
      }
    }
  }

  const suggestions = list.slice(0, 3).map((p) => ({
    slug: p.slug,
    title: propertyTitle(p, lang),
    price: formatPrice(p, lang),
    location: locationLabel(p),
  }));

  if (!suggestions.length) {
    return NextResponse.json({
      reply:
        lang === "en"
          ? `I have no listing matching that request right now. Our inventory changes every week: tell me your budget and preferred district, or reach an advisor on ${site.phones[0]}.`
          : `Je n'ai pas de bien correspondant pour le moment. Notre portefeuille évolue chaque semaine : indiquez-moi votre budget et le quartier souhaité, ou joignez un conseiller au ${site.phones[0]}.`,
    });
  }

  const criteria = filtersApplied.length
    ? filtersApplied.join(", ")
    : lang === "en"
      ? "our current selection"
      : "notre sélection actuelle";

  const reply =
    lang === "en"
      ? `Here ${suggestions.length > 1 ? "are" : "is"} ${suggestions.length} propert${suggestions.length > 1 ? "ies" : "y"} matching ${criteria}. Tap a card to open the full page, or ask me for a viewing.`
      : `Voici ${suggestions.length} propriété${suggestions.length > 1 ? "s" : ""} correspondant à ${criteria}. Touchez une carte pour ouvrir la fiche complète, ou demandez-moi une visite.`;

  return NextResponse.json({ reply, suggestions });
}
