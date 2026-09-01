"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { CITIES, NEIGHBORHOODS, PROPERTY_TYPES } from "@/lib/types";

const field =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-deep outline-none transition-colors focus:border-gold";
const label =
  "mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500";

export function HeroSearch() {
  const { t } = useI18n();
  const router = useRouter();
  const [transaction, setTransaction] = useState("");
  const [type, setType] = useState("");
  const [city, setCity] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [q, setQ] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (transaction) params.set("transaction", transaction);
    if (type) params.set("type", type);
    if (city) params.set("city", city);
    if (neighborhood) params.set("neighborhood", neighborhood);
    if (q.trim()) params.set("q", q.trim());
    router.push(`/proprietes${params.toString() ? `?${params}` : ""}`);
  };

  const neighborhoods = city
    ? (NEIGHBORHOODS[city] ?? [])
    : Array.from(new Set(Object.values(NEIGHBORHOODS).flat()));

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-white/40 bg-white/95 p-4 shadow-2xl shadow-slate-900/25 backdrop-blur sm:p-5"
      aria-label={t("hero.search")}
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <label className={label} htmlFor="h-transaction">
            {t("search.transaction")}
          </label>
          <select
            id="h-transaction"
            className={field}
            value={transaction}
            onChange={(e) => setTransaction(e.target.value)}
          >
            <option value="">{t("search.all")}</option>
            <option value="vente">{t("tx.sale")}</option>
            <option value="location">{t("tx.rent")}</option>
          </select>
        </div>
        <div>
          <label className={label} htmlFor="h-type">
            {t("search.type")}
          </label>
          <select
            id="h-type"
            className={field}
            value={type}
            onChange={(e) => setType(e.target.value)}
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
          <label className={label} htmlFor="h-city">
            {t("search.city")}
          </label>
          <select
            id="h-city"
            className={field}
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              setNeighborhood("");
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
          <label className={label} htmlFor="h-neighborhood">
            {t("search.neighborhood")}
          </label>
          <select
            id="h-neighborhood"
            className={field}
            value={neighborhood}
            onChange={(e) => setNeighborhood(e.target.value)}
          >
            <option value="">{t("search.allNeighborhoods")}</option>
            {neighborhoods.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label className={label} htmlFor="h-q">
            {t("search.keyword")}
          </label>
          <div className="flex gap-2">
            <input
              id="h-q"
              type="search"
              className={field}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Bonapriso, villa…"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gold px-6 py-3 text-sm font-bold uppercase tracking-wide text-slate-deep transition-all hover:bg-gold-dark hover:text-white sm:w-auto"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        {t("hero.search")}
      </button>
    </form>
  );
}
