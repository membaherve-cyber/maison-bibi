"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
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
import {
  IconArea,
  IconArrowLeft,
  IconArrowRight,
  IconBath,
  IconBed,
  IconCheck,
  IconClose,
  IconPhone,
  IconPin,
  IconWhatsapp,
} from "./icons";

export function PropertyQuickView({
  property,
  onClose,
  onPrevProperty,
  onNextProperty,
}: {
  property: Property;
  onClose: () => void;
  onPrevProperty?: () => void;
  onNextProperty?: () => void;
}) {
  const { lang, t } = useI18n();
  const [index, setIndex] = useState(0);
  const dialogRef = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);

  const images = property.images.length ? property.images : ["/logo-mark.svg"];
  const title = propertyTitle(property, lang);

  const next = useCallback(
    () => setIndex((i) => (i + 1) % images.length),
    [images.length],
  );
  const prev = useCallback(
    () => setIndex((i) => (i - 1 + images.length) % images.length),
    [images.length],
  );

  useEffect(() => setIndex(0), [property.id]);

  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, onClose]);

  const amenities = propertyAmenities(property, lang);
  const description = propertyDescription(property, lang);

  const specs = [
    property.bedrooms
      ? { icon: <IconBed size={16} />, label: t("prop.bedrooms"), value: property.bedrooms }
      : null,
    property.bathrooms
      ? { icon: <IconBath size={16} />, label: t("prop.bathrooms"), value: property.bathrooms }
      : null,
    property.livingArea
      ? {
          icon: <IconArea size={16} />,
          label: t("prop.livingArea"),
          value: formatArea(property.livingArea),
        }
      : null,
    property.landArea
      ? {
          icon: <IconArea size={16} />,
          label: t("prop.landArea"),
          value: formatArea(property.landArea),
        }
      : null,
  ].filter(Boolean) as { icon: React.ReactNode; label: string; value: React.ReactNode }[];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/80 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="lmdb-pop relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={t("gallery.close")}
          className="absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-slate-900/70 text-white transition-colors hover:bg-gold hover:text-slate-deep"
        >
          <IconClose size={20} />
        </button>

        <div className="overflow-y-auto overscroll-contain">
          <div
            className="relative bg-slate-900"
            onTouchStart={(e) => {
              touchX.current = e.touches[0].clientX;
            }}
            onTouchEnd={(e) => {
              if (touchX.current === null) return;
              const delta = e.changedTouches[0].clientX - touchX.current;
              if (Math.abs(delta) > 45) (delta < 0 ? next : prev)();
              touchX.current = null;
            }}
          >
            <div className="relative aspect-[4/3] w-full sm:aspect-[16/9]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={images[index]}
                src={images[index]}
                alt={`${title} — ${index + 1}/${images.length}`}
                className="lmdb-fade-up absolute inset-0 h-full w-full object-cover"
              />
            </div>

            {images.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={prev}
                  aria-label={t("gallery.prev")}
                  className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-slate-deep shadow-lg transition-all hover:bg-gold sm:left-4 sm:h-12 sm:w-12"
                >
                  <IconArrowLeft size={22} />
                </button>
                <button
                  type="button"
                  onClick={next}
                  aria-label={t("gallery.next")}
                  className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-slate-deep shadow-lg transition-all hover:bg-gold sm:right-4 sm:h-12 sm:w-12"
                >
                  <IconArrowRight size={22} />
                </button>
                <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-slate-900/75 px-3 py-1 text-xs font-semibold text-white">
                  {index + 1} / {images.length}
                </span>
              </>
            ) : null}

            <div className="absolute left-3 top-3 flex gap-2">
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
                  property.transactionType === "location"
                    ? "bg-white text-slate-deep"
                    : "bg-gold text-slate-deep"
                }`}
              >
                {transactionLabel(property, lang)}
              </span>
              <span className="rounded-full bg-slate-900/70 px-2.5 py-1 text-[11px] font-semibold text-white">
                {property.propertyType}
              </span>
            </div>
          </div>

          {images.length > 1 ? (
            <div className="no-scrollbar flex gap-2 overflow-x-auto bg-slate-50 px-4 py-3">
              {images.map((img, i) => (
                <button
                  key={img}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Image ${i + 1}`}
                  aria-current={i === index}
                  className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                    i === index
                      ? "border-gold opacity-100"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          ) : null}

          <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1.6fr_1fr]">
            <div>
              <h2 className="font-display text-2xl leading-tight text-slate-deep sm:text-[28px]">
                {title}
              </h2>
              <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
                <IconPin size={16} className="text-gold" />
                {property.address || locationLabel(property)}
              </p>
              <p className="mt-4 font-display text-2xl font-semibold text-gold-dark">
                {formatPrice(property, lang)}
              </p>

              {specs.length ? (
                <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {specs.map((s, i) => (
                    <li
                      key={i}
                      className="rounded-xl border border-slate-200 bg-slate-50/70 p-3"
                    >
                      <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-slate-500">
                        {s.icon}
                        {s.label}
                      </span>
                      <span className="mt-1 block font-semibold text-slate-deep">
                        {s.value}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}

              <div className="mt-6">
                <h3 className="font-display text-lg text-slate-deep">
                  {t("prop.description")}
                </h3>
                <div className="mt-2 space-y-3 text-sm leading-relaxed text-slate-600">
                  {description.split("\n\n").map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </div>

              {amenities.length ? (
                <div className="mt-6">
                  <h3 className="font-display text-lg text-slate-deep">
                    {t("prop.amenities")}
                  </h3>
                  <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {amenities.map((a) => (
                      <li
                        key={a}
                        className="flex items-start gap-2 text-sm text-slate-600"
                      >
                        <IconCheck size={16} className="mt-0.5 text-gold" />
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>

            <aside className="lg:sticky lg:top-0">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  {t("prop.reference")} {reference(property)}
                </p>
                <h3 className="mt-2 font-display text-lg text-slate-deep">
                  {t("prop.contactTitle")}
                </h3>
                <p className="mt-1 text-sm text-slate-600">{t("prop.contactSub")}</p>

                <div className="mt-4 flex flex-col gap-2">
                  <Link
                    href={`/proprietes/${property.slug}`}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-deep px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-gold hover:text-slate-deep"
                  >
                    {t("prop.fullPage")}
                    <IconArrowRight size={16} />
                  </Link>
                  <a
                    href={propertyWhatsapp(property, lang)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 py-3 text-sm font-semibold text-slate-900 transition-transform hover:-translate-y-0.5"
                  >
                    <IconWhatsapp size={18} /> WhatsApp
                  </a>
                  <a
                    href={telHref(site.phones[0])}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-deep transition-colors hover:border-gold hover:text-gold-dark"
                  >
                    <IconPhone size={16} /> {site.phones[0]}
                  </a>
                </div>
              </div>

              {(onPrevProperty || onNextProperty) && (
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={onPrevProperty}
                    disabled={!onPrevProperty}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-gold hover:text-gold-dark disabled:opacity-40"
                  >
                    <IconArrowLeft size={16} />
                    {lang === "en" ? "Previous" : "Précédent"}
                  </button>
                  <button
                    type="button"
                    onClick={onNextProperty}
                    disabled={!onNextProperty}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-gold hover:text-gold-dark disabled:opacity-40"
                  >
                    {lang === "en" ? "Next" : "Suivant"}
                    <IconArrowRight size={16} />
                  </button>
                </div>
              )}
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
