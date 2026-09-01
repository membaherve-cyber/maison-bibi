"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { HeroSearch } from "@/components/HeroSearch";
import { FeaturedGrid } from "@/components/FeaturedGrid";
import { IconArrowRight, IconCheck } from "@/components/icons";
import type { Property } from "@/lib/types";

const serviceKeys = [
  { key: "sale", icon: "🏷️" },
  { key: "rent", icon: "🔑" },
  { key: "management", icon: "📋" },
  { key: "advisory", icon: "📈" },
  { key: "legal", icon: "⚖️" },
  { key: "visit", icon: "🎥" },
];

export function HomeView({
  featured,
  districts,
  counts,
}: {
  featured: Property[];
  districts: { name: string; count: number; image: string }[];
  counts: { total: number; districts: number };
}) {
  const { t } = useI18n();

  return (
    <>
      {/* HERO */}
      <section className="relative isolate overflow-hidden bg-white">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/hero-douala.jpg"
            alt="Quartier résidentiel haut de gamme à Douala au coucher du soleil"
            className="h-full w-full object-cover"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-white/35" />
        </div>

        <div className="container-page relative py-16 sm:py-24 lg:py-28">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-white/5 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-gold">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-gold" />
            {t("hero.badge")}
          </span>

          <h1 className="mt-6 max-w-3xl font-display text-4xl leading-[1.1] text-slate-deep sm:text-5xl lg:text-6xl">
            {t("hero.title")}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-deep/75 sm:text-lg">
            {t("hero.subtitle")}
          </p>

          <div className="mt-9 max-w-5xl">
            <HeroSearch />
          </div>

          <dl className="mt-10 grid max-w-2xl grid-cols-3 gap-6">
            {[
              { v: `${counts.total}+`, l: t("hero.stat1") },
              { v: `${counts.districts}`, l: t("hero.stat2") },
              { v: "7j/7", l: t("hero.stat3") },
            ].map((s) => (
              <div key={s.l}>
                <dt className="font-display text-3xl text-gold">{s.v}</dt>
                <dd className="mt-1 text-xs uppercase tracking-wide text-slate-deep/65">
                  {s.l}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* PROPRIÉTÉS SÉLECTIONNÉES */}
      <section className="container-page py-16 sm:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold">
              {t("eyebrow.selection")}
            </span>
            <h2 className="mt-2 font-display text-3xl text-slate-deep sm:text-4xl">
              {t("section.selected")}
            </h2>
            <p className="mt-2 max-w-xl text-sm text-slate-500">
              {t("section.selectedSub")}
            </p>
          </div>
          <Link
            href="/proprietes"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-deep transition-colors hover:border-gold hover:text-gold-dark"
          >
            {t("section.viewAll")}
            <IconArrowRight size={16} />
          </Link>
        </div>

        <div className="mt-10">
          <FeaturedGrid properties={featured} />
        </div>
      </section>

      {/* QUARTIERS */}
      <section className="bg-sand py-16 sm:py-20">
        <div className="container-page">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold">
            {t("eyebrow.districts")}
          </span>
          <h2 className="mt-2 font-display text-3xl text-slate-deep sm:text-4xl">
            {t("section.neighborhoods")}
          </h2>
          <p className="mt-2 max-w-xl text-sm text-slate-500">
            {t("section.neighborhoodsSub")}
          </p>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {districts.map((d) => (
              <Link
                key={d.name}
                href={`/proprietes?neighborhood=${encodeURIComponent(d.name)}`}
                className="group relative block overflow-hidden rounded-2xl"
              >
                <span className="relative block aspect-[4/5] w-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={d.image}
                    alt={`Immobilier à ${d.name}`}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </span>
                <span className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />
                <span className="absolute inset-x-4 bottom-4">
                  <span className="block font-display text-xl text-white">
                    {d.name}
                  </span>
                  <span className="mt-1 block text-xs text-gold">
                    {d.count} {d.count > 1 ? "biens" : "bien"}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="container-page py-16 sm:py-20">
        <div className="max-w-2xl">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold">
            {t("eyebrow.services")}
          </span>
          <h2 className="mt-2 font-display text-3xl text-slate-deep sm:text-4xl">
            {t("section.services")}
          </h2>
          <p className="mt-2 text-sm text-slate-500">{t("section.servicesSub")}</p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {serviceKeys.map((s) => (
            <div
              key={s.key}
              className="rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-gold/50 hover:shadow-[0_18px_40px_-24px_rgba(15,23,42,0.4)]"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sand text-xl">
                {s.icon}
              </span>
              <h3 className="mt-4 font-display text-lg text-slate-deep">
                {t(`services.${s.key}`)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                {t(`services.${s.key}Text`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* POURQUOI */}
      <section className="bg-bibi py-16 text-white sm:py-20">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold">
              {t("eyebrow.why")}
            </span>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl">
              {t("section.why")}
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/70">
              {t("footer.about")}
            </p>
            <Link
              href="/contact"
              className="mt-7 inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-3 text-sm font-bold uppercase tracking-wide text-slate-deep transition-colors hover:bg-white"
            >
              {t("nav.contact")}
              <IconArrowRight size={16} />
            </Link>
          </div>

          <ul className="space-y-4">
            {["local", "verified", "service"].map((k) => (
              <li
                key={k}
                className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-5"
              >
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold text-slate-deep">
                  <IconCheck size={18} />
                </span>
                <div>
                  <h3 className="font-display text-lg">{t(`why.${k}`)}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-white/70">
                    {t(`why.${k}Text`)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
