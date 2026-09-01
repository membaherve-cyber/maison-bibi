"use client";

import { useMemo, useState } from "react";
import { PropertyCard } from "./PropertyCard";
import { PropertyQuickView } from "./PropertyQuickView";
import { useI18n } from "@/lib/i18n";
import {
  AMENITY_FILTERS,
  CITIES,
  NEIGHBORHOODS,
  PROPERTY_TYPES,
  type Property,
} from "@/lib/types";

type Filters = {
  transaction: string;
  type: string;
  city: string;
  neighborhood: string;
  q: string;
  priceMin: string;
  priceMax: string;
  surfaceMin: string;
  bedrooms: string;
  bathrooms: string;
  amenities: string[];
  sort: string;
};

const emptyFilters: Filters = {
  transaction: "",
  type: "",
  city: "",
  neighborhood: "",
  q: "",
  priceMin: "",
  priceMax: "",
  surfaceMin: "",
  bedrooms: "",
  bathrooms: "",
  amenities: [],
  sort: "selection",
};

const selectCls =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-deep outline-none transition-colors focus:border-gold";
const labelCls =
  "mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500";

export type InitialFilters = Partial<
  Pick<Filters, "transaction" | "type" | "city" | "neighborhood" | "q">
>;

export function PropertyExplorer({
  properties,
  withFilters = true,
  initialFilters,
}: {
  properties: Property[];
  withFilters?: boolean;
  /**
   * Filters resolved on the server from the URL query string.
   *
   * They are passed as props rather than read with useSearchParams: that hook
   * opts the whole subtree out of server rendering, which left the property
   * grid missing from the initial HTML (bad for SEO and first paint).
   */
  initialFilters?: InitialFilters;
}) {
  const { lang, t } = useI18n();
  const [filters, setFilters] = useState<Filters>({
    ...emptyFilters,
    ...initialFilters,
  });
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const set = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    setFilters((f) => ({ ...f, [key]: value }));

  const results = useMemo(() => {
    const f = filters;
    const q = f.q.trim().toLowerCase();
    let list = properties.filter((p) => {
      if (f.transaction && p.transactionType !== f.transaction) return false;
      if (f.type && p.propertyType !== f.type) return false;
      if (f.city && p.city !== f.city) return false;
      if (f.neighborhood && p.neighborhood !== f.neighborhood) return false;
      if (f.priceMin && p.price < Number(f.priceMin)) return false;
      if (f.priceMax && p.price > Number(f.priceMax)) return false;
      if (f.surfaceMin && (p.livingArea ?? 0) < Number(f.surfaceMin)) return false;
      if (f.bedrooms && (p.bedrooms ?? 0) < Number(f.bedrooms)) return false;
      if (f.bathrooms && (p.bathrooms ?? 0) < Number(f.bathrooms)) return false;
      if (f.amenities.length) {
        const hay = [...p.amenities, ...p.amenitiesEn].join(" ").toLowerCase();
        const ok = f.amenities.every((key) => {
          const def = AMENITY_FILTERS.find((a) => a.fr === key);
          return def ? def.match.some((m) => hay.includes(m)) : true;
        });
        if (!ok) return false;
      }
      if (q) {
        const hay = [
          p.title,
          p.titleEn,
          p.neighborhood,
          p.city,
          p.address,
          p.propertyType,
          p.description,
        ]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    if (f.sort === "priceAsc") list = [...list].sort((a, b) => a.price - b.price);
    if (f.sort === "priceDesc") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [filters, properties]);

  const activeCount =
    (filters.transaction ? 1 : 0) +
    (filters.type ? 1 : 0) +
    (filters.city ? 1 : 0) +
    (filters.neighborhood ? 1 : 0) +
    (filters.q ? 1 : 0) +
    (filters.priceMin ? 1 : 0) +
    (filters.priceMax ? 1 : 0) +
    (filters.surfaceMin ? 1 : 0) +
    (filters.bedrooms ? 1 : 0) +
    (filters.bathrooms ? 1 : 0) +
    filters.amenities.length;

  const neighborhoods = filters.city
    ? (NEIGHBORHOODS[filters.city] ?? [])
    : Array.from(new Set(Object.values(NEIGHBORHOODS).flat()));

  const current = openIndex !== null ? results[openIndex] : null;

  return (
    <div>
      {withFilters ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className={labelCls} htmlFor="f-transaction">
                {t("search.transaction")}
              </label>
              <select
                id="f-transaction"
                className={selectCls}
                value={filters.transaction}
                onChange={(e) => set("transaction", e.target.value)}
              >
                <option value="">{t("search.all")}</option>
                <option value="vente">{t("tx.sale")}</option>
                <option value="location">{t("tx.rent")}</option>
              </select>
            </div>
            <div>
              <label className={labelCls} htmlFor="f-type">
                {t("search.type")}
              </label>
              <select
                id="f-type"
                className={selectCls}
                value={filters.type}
                onChange={(e) => set("type", e.target.value)}
              >
                <option value="">{t("search.allTypes")}</option>
                {PROPERTY_TYPES.map((ty) => (
                  <option key={ty} value={ty}>
                    {ty}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls} htmlFor="f-city">
                {t("search.city")}
              </label>
              <select
                id="f-city"
                className={selectCls}
                value={filters.city}
                onChange={(e) => {
                  set("city", e.target.value);
                  set("neighborhood", "");
                }}
              >
                <option value="">{t("search.allCities")}</option>
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls} htmlFor="f-neighborhood">
                {t("search.neighborhood")}
              </label>
              <select
                id="f-neighborhood"
                className={selectCls}
                value={filters.neighborhood}
                onChange={(e) => set("neighborhood", e.target.value)}
              >
                <option value="">{t("search.allNeighborhoods")}</option>
                {neighborhoods.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div
            className={`grid gap-4 overflow-hidden transition-all duration-300 md:grid-cols-2 lg:grid-cols-4 ${
              showAdvanced ? "mt-4 max-h-[60rem]" : "max-h-0"
            }`}
          >
            <div>
              <label className={labelCls} htmlFor="f-priceMin">
                {t("search.priceMin")}
              </label>
              <input
                id="f-priceMin"
                type="number"
                min={0}
                inputMode="numeric"
                className={selectCls}
                value={filters.priceMin}
                onChange={(e) => set("priceMin", e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls} htmlFor="f-priceMax">
                {t("search.priceMax")}
              </label>
              <input
                id="f-priceMax"
                type="number"
                min={0}
                inputMode="numeric"
                className={selectCls}
                value={filters.priceMax}
                onChange={(e) => set("priceMax", e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls} htmlFor="f-surface">
                {t("search.surfaceMin")}
              </label>
              <input
                id="f-surface"
                type="number"
                min={0}
                inputMode="numeric"
                className={selectCls}
                value={filters.surfaceMin}
                onChange={(e) => set("surfaceMin", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls} htmlFor="f-bedrooms">
                  {t("search.bedrooms")}
                </label>
                <select
                  id="f-bedrooms"
                  className={selectCls}
                  value={filters.bedrooms}
                  onChange={(e) => set("bedrooms", e.target.value)}
                >
                  <option value="">—</option>
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>
                      {n}+
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls} htmlFor="f-bathrooms">
                  {t("search.bathrooms")}
                </label>
                <select
                  id="f-bathrooms"
                  className={selectCls}
                  value={filters.bathrooms}
                  onChange={(e) => set("bathrooms", e.target.value)}
                >
                  <option value="">—</option>
                  {[1, 2, 3, 4].map((n) => (
                    <option key={n} value={n}>
                      {n}+
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="lg:col-span-4">
              <span className={labelCls}>{t("search.amenities")}</span>
              <div className="flex flex-wrap gap-2">
                {AMENITY_FILTERS.map((a) => {
                  const active = filters.amenities.includes(a.fr);
                  return (
                    <button
                      key={a.fr}
                      type="button"
                      aria-pressed={active}
                      onClick={() =>
                        set(
                          "amenities",
                          active
                            ? filters.amenities.filter((x) => x !== a.fr)
                            : [...filters.amenities, a.fr],
                        )
                      }
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                        active
                          ? "border-gold bg-gold text-slate-deep"
                          : "border-slate-200 text-slate-600 hover:border-gold/60"
                      }`}
                    >
                      {lang === "en" ? a.en : a.fr}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setShowAdvanced((v) => !v)}
                aria-expanded={showAdvanced}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-gold hover:text-gold-dark"
              >
                {t("search.filters")}
                {activeCount ? (
                  <span className="rounded-full bg-gold px-1.5 text-[11px] font-bold text-slate-deep">
                    {activeCount}
                  </span>
                ) : null}
              </button>
              {activeCount > 0 ? (
                <button
                  type="button"
                  onClick={() => setFilters({ ...emptyFilters })}
                  className="text-sm font-semibold text-gold-dark underline-offset-4 hover:underline"
                >
                  {t("search.reset")}
                </button>
              ) : null}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500">
                <strong className="text-slate-deep">{results.length}</strong>{" "}
                {t("search.results")}
              </span>
              <select
                aria-label={t("search.sort")}
                className="rounded-lg border border-slate-200 px-2.5 py-2 text-sm text-slate-600 outline-none focus:border-gold"
                value={filters.sort}
                onChange={(e) => set("sort", e.target.value)}
              >
                <option value="selection">{t("search.sortRecent")}</option>
                <option value="priceAsc">{t("search.sortPriceAsc")}</option>
                <option value="priceDesc">{t("search.sortPriceDesc")}</option>
              </select>
            </div>
          </div>
        </div>
      ) : null}

      {results.length ? (
        <div
          className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-3 ${
            withFilters ? "mt-8" : ""
          }`}
        >
          {results.map((p, i) => (
            <PropertyCard
              key={p.id}
              property={p}
              priority={i < 3}
              onQuickView={() => setOpenIndex(i)}
            />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
          <svg
            width="56"
            height="56"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#94a3b8"
            strokeWidth="1.3"
            className="mx-auto"
            aria-hidden="true"
          >
            <path d="M3 21V8l6-4 6 4v13" />
            <path d="M15 21V11l6 4v6" />
            <path d="M3 21h18" />
          </svg>
          <p className="mt-4 font-display text-xl text-slate-deep">
            {t("search.noResults")}
          </p>
          <p className="mt-2 text-sm text-slate-500">{t("search.noResultsHint")}</p>
          <button
            type="button"
            onClick={() => setFilters({ ...emptyFilters })}
            className="mt-6 inline-flex items-center rounded-lg bg-slate-deep px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold hover:text-slate-deep"
          >
            {t("search.reset")}
          </button>
        </div>
      )}

      {current ? (
        <PropertyQuickView
          property={current}
          onClose={() => setOpenIndex(null)}
          onPrevProperty={
            openIndex !== null && openIndex > 0
              ? () => setOpenIndex((i) => (i ?? 0) - 1)
              : undefined
          }
          onNextProperty={
            openIndex !== null && openIndex < results.length - 1
              ? () => setOpenIndex((i) => (i ?? 0) + 1)
              : undefined
          }
        />
      ) : null}
    </div>
  );
}
