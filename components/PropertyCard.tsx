"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import type { Property } from "@/lib/types";
import {
  formatArea,
  formatPrice,
  locationLabel,
  propertyTitle,
  propertyWhatsapp,
  transactionLabel,
} from "@/lib/site";
import {
  IconArea,
  IconArrowRight,
  IconBath,
  IconBed,
  IconExpand,
  IconPin,
  IconWhatsapp,
} from "./icons";

export function PropertyCard({
  property,
  onQuickView,
  priority = false,
}: {
  property: Property;
  onQuickView?: (p: Property) => void;
  priority?: boolean;
}) {
  const { lang, t } = useI18n();
  const router = useRouter();
  const title = propertyTitle(property, lang);
  const isRent = property.transactionType === "location";
  const href = `/proprietes/${property.slug}`;

  // Spec: the image opens the quick view, the rest of the card opens the page.
  const openPage = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("a,button")) return;
    router.push(href);
  };

  return (
    <article
      onClick={openPage}
      className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-gold/40 hover:shadow-[0_18px_40px_-18px_rgba(15,23,42,0.35)]">
      <div className="relative">
        <button
          type="button"
          onClick={() => onQuickView?.(property)}
          aria-label={`${t("card.quickView")} — ${title}`}
          className="block w-full cursor-zoom-in overflow-hidden bg-slate-100"
        >
          <span className="relative block aspect-[4/3] w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={property.images[0]}
              alt={title}
              loading={priority ? "eager" : "lazy"}
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-105"
            />
            <span className="absolute inset-0 bg-gradient-to-t from-slate-900/55 via-slate-900/0 to-slate-900/10" />
            <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-deep opacity-0 shadow-sm transition-opacity duration-300 group-hover:opacity-100">
              <IconExpand size={14} /> {t("card.quickView")}
            </span>
          </span>
        </button>

        <div className="pointer-events-none absolute left-3 top-3 flex flex-wrap gap-2">
          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide shadow-sm ${
              isRent ? "bg-slate-deep text-white" : "bg-gold text-slate-deep"
            }`}
          >
            {transactionLabel(property, lang)}
          </span>
          <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-sm">
            {property.propertyType}
          </span>
        </div>

        {property.images.length > 1 ? (
          <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-slate-900/70 px-2.5 py-1 text-[11px] font-semibold text-white">
            {property.images.length} {t("card.photos")}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <Link href={href} className="group/link">
          <h3 className="line-clamp-2 font-display text-lg leading-snug text-slate-deep transition-colors group-hover/link:text-gold-dark">
            {title}
          </h3>
        </Link>

        <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
          <IconPin size={15} className="text-gold" />
          {locationLabel(property)}
        </p>

        <p className="mt-3 font-display text-xl font-semibold text-slate-deep">
          {formatPrice(property, lang)}
        </p>

        <ul className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-100 pt-4 text-sm text-slate-600">
          {property.bedrooms ? (
            <li className="flex items-center gap-1.5">
              <IconBed size={16} className="text-slate-400" />
              {property.bedrooms}
              <span className="sr-only"> {t("prop.bedrooms")}</span>
            </li>
          ) : null}
          {property.bathrooms ? (
            <li className="flex items-center gap-1.5">
              <IconBath size={16} className="text-slate-400" />
              {property.bathrooms}
              <span className="sr-only"> {t("prop.bathrooms")}</span>
            </li>
          ) : null}
          {property.livingArea ? (
            <li className="flex items-center gap-1.5">
              <IconArea size={16} className="text-slate-400" />
              {formatArea(property.livingArea)}
            </li>
          ) : null}
        </ul>

        <div className="mt-5 flex items-center gap-2 pt-1">
          <Link
            href={href}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-slate-deep px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold hover:text-slate-deep"
          >
            {t("card.view")}
            <IconArrowRight size={16} />
          </Link>
          <a
            href={propertyWhatsapp(property, lang)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`WhatsApp — ${title}`}
            className="inline-flex h-10 w-11 items-center justify-center rounded-lg border border-slate-200 text-[#128C7E] transition-colors hover:border-[#25D366] hover:bg-[#25D366] hover:text-white"
          >
            <IconWhatsapp size={18} />
          </a>
        </div>
      </div>
    </article>
  );
}
