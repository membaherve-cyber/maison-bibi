"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { BackButton } from "./BackButton";
import { PropertyGallery } from "./PropertyGallery";
import { ContactForm } from "./ContactForm";
import { FeaturedGrid } from "./FeaturedGrid";
import {
  IconArea,
  IconBath,
  IconBed,
  IconCar,
  IconCheck,
  IconPhone,
  IconPin,
  IconWhatsapp,
} from "./icons";
import type { Property } from "@/lib/types";
import {
  formatArea,
  formatPrice,
  locationLabel,
  propertyAmenities,
  propertyDescription,
  propertyTitle,
  propertyWhatsapp,
  reference,
  site,
  telHref,
  transactionLabel,
} from "@/lib/site";

export function PropertyDetailView({
  property,
  related,
}: {
  property: Property;
  related: Property[];
}) {
  const { lang, t } = useI18n();
  const title = propertyTitle(property, lang);
  const amenities = propertyAmenities(property, lang);
  const description = propertyDescription(property, lang);

  const details = [
    { label: t("prop.type"), value: property.propertyType },
    { label: t("prop.transaction"), value: transactionLabel(property, lang) },
    { label: t("prop.location"), value: property.address || locationLabel(property) },
    property.bedrooms
      ? { label: t("prop.bedrooms"), value: String(property.bedrooms) }
      : null,
    property.bathrooms
      ? { label: t("prop.bathrooms"), value: String(property.bathrooms) }
      : null,
    property.livingRooms
      ? { label: t("prop.livingRooms"), value: String(property.livingRooms) }
      : null,
    property.livingArea
      ? { label: t("prop.livingArea"), value: formatArea(property.livingArea)! }
      : null,
    property.landArea
      ? { label: t("prop.landArea"), value: formatArea(property.landArea)! }
      : null,
    property.floor ? { label: t("prop.floor"), value: property.floor } : null,
    property.parkingSpaces
      ? {
          label: t("prop.parking"),
          value: `${property.parkingSpaces} ${t("prop.spaces")}`,
        }
      : null,
    property.condition
      ? { label: t("prop.condition"), value: property.condition }
      : null,
    { label: t("prop.reference"), value: reference(property) },
  ].filter(Boolean) as { label: string; value: string }[];

  const quickStats = [
    property.bedrooms
      ? { icon: <IconBed size={18} />, label: t("prop.bedrooms"), value: property.bedrooms }
      : null,
    property.bathrooms
      ? {
          icon: <IconBath size={18} />,
          label: t("prop.bathrooms"),
          value: property.bathrooms,
        }
      : null,
    property.livingArea
      ? {
          icon: <IconArea size={18} />,
          label: t("prop.livingArea"),
          value: formatArea(property.livingArea),
        }
      : null,
    property.parkingSpaces
      ? {
          icon: <IconCar size={18} />,
          label: t("prop.parking"),
          value: property.parkingSpaces,
        }
      : null,
  ].filter(Boolean) as { icon: React.ReactNode; label: string; value: React.ReactNode }[];

  return (
    <>
      <div className="border-b border-slate-100 bg-sand">
        <div className="container-page py-6">
          <nav aria-label="Fil d'Ariane" className="text-xs text-slate-500">
            <Link href="/" className="transition-colors hover:text-gold-dark">
              {t("common.home")}
            </Link>
            <span className="mx-2 text-slate-300">/</span>
            <Link href="/proprietes" className="transition-colors hover:text-gold-dark">
              {t("nav.properties")}
            </Link>
            <span className="mx-2 text-slate-300">/</span>
            <span className="text-slate-700">{property.neighborhood}</span>
          </nav>
          <div className="mt-4">
            <BackButton fallback="/proprietes" />
          </div>
        </div>
      </div>

      <article className="container-page py-8 sm:py-10">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${
              property.transactionType === "location"
                ? "bg-slate-deep text-white"
                : "bg-gold text-slate-deep"
            }`}
          >
            {transactionLabel(property, lang)}
          </span>
          <span className="rounded-full border border-slate-200 px-3 py-1 text-[11px] font-semibold text-slate-600">
            {property.propertyType}
          </span>
          {property.condition ? (
            <span className="rounded-full border border-slate-200 px-3 py-1 text-[11px] font-semibold text-slate-600">
              {property.condition}
            </span>
          ) : null}
        </div>

        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="max-w-3xl font-display text-3xl leading-tight text-slate-deep sm:text-4xl">
              {title}
            </h1>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
              <IconPin size={16} className="text-gold" />
              {property.address || locationLabel(property)}
            </p>
          </div>
          <p className="font-display text-3xl font-semibold text-gold-dark">
            {formatPrice(property, lang)}
          </p>
        </div>

        <div className="mt-7">
          <PropertyGallery images={property.images} title={title} />
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.7fr_1fr]">
          <div>
            {quickStats.length ? (
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {quickStats.map((s, i) => (
                  <li
                    key={i}
                    className="rounded-xl border border-slate-200 bg-white p-4 text-center"
                  >
                    <span className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-sand text-slate-deep">
                      {s.icon}
                    </span>
                    <span className="mt-2 block font-display text-lg text-slate-deep">
                      {s.value}
                    </span>
                    <span className="text-[11px] uppercase tracking-wide text-slate-500">
                      {s.label}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}

            <section className="mt-10">
              <h2 className="font-display text-2xl text-slate-deep">
                {t("prop.description")}
              </h2>
              <span className="mt-2 block h-px w-12 bg-gold" />
              <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-slate-600">
                {description.split("\n\n").map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </section>

            <section className="mt-10">
              <h2 className="font-display text-2xl text-slate-deep">
                {t("prop.details")}
              </h2>
              <span className="mt-2 block h-px w-12 bg-gold" />
              <dl className="mt-4 grid gap-x-8 gap-y-0 sm:grid-cols-2">
                {details.map((d) => (
                  <div
                    key={d.label}
                    className="flex items-start justify-between gap-4 border-b border-slate-100 py-3 text-sm"
                  >
                    <dt className="text-slate-500">{d.label}</dt>
                    <dd className="text-right font-semibold text-slate-deep">
                      {d.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>

            {amenities.length ? (
              <section className="mt-10">
                <h2 className="font-display text-2xl text-slate-deep">
                  {t("prop.amenities")}
                </h2>
                <span className="mt-2 block h-px w-12 bg-gold" />
                <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                  {amenities.map((a) => (
                    <li
                      key={a}
                      className="flex items-start gap-2.5 rounded-lg bg-sand px-3.5 py-2.5 text-sm text-slate-700"
                    >
                      <IconCheck size={16} className="mt-0.5 shrink-0 text-gold" />
                      {a}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-display text-xl text-slate-deep">
                {t("prop.contactTitle")}
              </h2>
              <p className="mt-1 text-sm text-slate-500">{t("prop.contactSub")}</p>

              <div className="mt-5 flex flex-col gap-2">
                <a
                  href={propertyWhatsapp(property, lang)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 py-3 text-sm font-bold text-slate-900 transition-transform hover:-translate-y-0.5"
                >
                  <IconWhatsapp size={18} /> WhatsApp
                </a>
                {site.phones.slice(0, 2).map((p) => (
                  <a
                    key={p}
                    href={telHref(p)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-deep transition-colors hover:border-gold hover:text-gold-dark"
                  >
                    <IconPhone size={16} /> {p}
                  </a>
                ))}
              </div>

              <div className="mt-6 border-t border-slate-100 pt-6">
                <h3 className="font-display text-lg text-slate-deep">
                  {t("prop.requestVisit")}
                </h3>
                <div className="mt-4">
                  <ContactForm
                    compact
                    propertyId={property.id}
                    propertyTitle={property.title}
                  />
                </div>
              </div>
            </div>
          </aside>
        </div>

        {related.length ? (
          <section className="mt-16">
            <h2 className="font-display text-2xl text-slate-deep sm:text-3xl">
              {t("section.related")}
            </h2>
            <span className="mt-2 block h-px w-12 bg-gold" />
            <div className="mt-8">
              <FeaturedGrid properties={related} />
            </div>
          </section>
        ) : null}
      </article>
    </>
  );
}
