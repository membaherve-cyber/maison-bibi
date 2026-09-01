"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { BuildingLoader } from "./BuildingLoader";
import { apiFetch, clearToken } from "@/lib/backoffice-client";
import { formatPrice } from "@/lib/site";
import { PROPERTY_TYPES, type Property } from "@/lib/types";

type Enquiry = {
  id: number;
  name: string;
  email: string;
  phone: string;
  message: string;
  propertyTitle: string;
  handled: boolean;
  createdAt: string;
};

type Draft = Partial<Property> & { imagesText?: string; amenitiesText?: string };

type Session = { email: string; name: string };

const input =
  "w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-gold";
const label =
  "mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500";

const emptyDraft: Draft = {
  title: "",
  titleEn: "",
  slug: "",
  description: "",
  descriptionEn: "",
  city: "Douala",
  neighborhood: "",
  address: "",
  propertyType: "Appartement",
  transactionType: "vente",
  price: 0,
  pricePeriod: "",
  status: "published",
  featured: false,
  imagesText: "",
  amenitiesText: "",
  seoTitle: "",
  seoDescription: "",
};

export function AdminDashboard() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [tab, setTab] = useState<"properties" | "enquiries">("properties");
  const [properties, setProperties] = useState<Property[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const [p, e] = await Promise.all([
      apiFetch("/api/properties").then((r) => r.json()),
      apiFetch("/api/enquiries").then((r) =>
        r.ok ? r.json() : { enquiries: [] },
      ),
    ]);
    setProperties(p.properties ?? []);
    setEnquiries(e.enquiries ?? []);
  }, []);

  useEffect(() => {
    (async () => {
      const res = await apiFetch("/api/auth/session");
      const data = await res.json().catch(() => ({ authenticated: false }));
      if (!data.authenticated) {
        // Send the user back with a reason instead of bouncing silently.
        router.replace("/connexion?session=expired");
        return;
      }
      setSession(data.user as Session);
      await load();
      setReady(true);
    })();
  }, [router, load]);

  const logout = async () => {
    await apiFetch("/api/auth/logout", { method: "POST" });
    router.replace("/connexion");
  };

  const startEdit = (p: Property) =>
    setDraft({
      ...p,
      imagesText: p.images.join("\n"),
      amenitiesText: p.amenities.join(", "),
    });

  const save = async () => {
    if (!draft?.title) return;
    setSaving(true);
    const payload = {
      ...draft,
      images: (draft.imagesText ?? "")
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      amenities: (draft.amenitiesText ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };
    const res = await apiFetch(
      draft.id ? `/api/properties/${draft.id}` : "/api/properties",
      {
        method: draft.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
      },
    );
    setSaving(false);
    if (res.ok) {
      setDraft(null);
      await load();
      router.refresh();
    }
  };

  const patch = async (id: number, values: Record<string, unknown>) => {
    await apiFetch(`/api/properties/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
    });
    await load();
    router.refresh();
  };

  const remove = async (id: number) => {
    if (!window.confirm("Supprimer définitivement cette propriété ?")) return;
    await apiFetch(`/api/properties/${id}`, {
      method: "DELETE",
    });
    await load();
    router.refresh();
  };

  if (!ready) return <BuildingLoader label="Chargement du backoffice…" fullscreen />;

  return (
    <section className="bg-sand py-10">
      <div className="container-page">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl text-slate-deep">Backoffice</h1>
            <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
              <span>
                Connecté en tant que{" "}
                <strong className="text-slate-deep">
                  {session?.name || session?.email}
                </strong>
              </span>
              <span className="rounded-full bg-gold px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-slate-deep">
                Accès complet
              </span>
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/"
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-deep transition-colors hover:border-gold"
            >
              Voir le site
            </Link>
            <button
              type="button"
              onClick={logout}
              className="rounded-lg bg-slate-deep px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold hover:text-slate-deep"
            >
              Déconnexion
            </button>
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          {(
            [
              ["properties", `Propriétés (${properties.length})`],
              ["enquiries", `Demandes (${enquiries.length})`],
            ] as const
          ).map(([key, labelText]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key as typeof tab)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                tab === key
                  ? "bg-slate-deep text-white"
                  : "bg-white text-slate-600 hover:text-slate-deep"
              }`}
            >
              {labelText}
            </button>
          ))}
        </div>

        {tab === "properties" ? (
          <>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setDraft({ ...emptyDraft })}
                className="rounded-lg bg-gold px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-slate-deep transition-colors hover:bg-gold-dark hover:text-white"
              >
                + Nouvelle propriété
              </button>
            </div>

            <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Bien</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Prix</th>
                    <th className="px-4 py-3">Statut</th>
                    <th className="px-4 py-3">À la une</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {properties.map((p) => (
                    <tr key={p.id} className="border-b border-slate-50 last:border-0">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={p.images[0]}
                            alt=""
                            className="h-11 w-16 rounded-lg object-cover"
                            loading="lazy"
                          />
                          <div>
                            <p className="font-semibold text-slate-deep">{p.title}</p>
                            <p className="text-xs text-slate-500">
                              {p.neighborhood}, {p.city}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{p.propertyType}</td>
                      <td className="px-4 py-3 text-slate-600">{formatPrice(p)}</td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() =>
                            patch(p.id, {
                              status: p.status === "published" ? "draft" : "published",
                            })
                          }
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            p.status === "published"
                              ? "bg-green-100 text-green-800"
                              : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {p.status === "published" ? "Publié" : "Brouillon"}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => patch(p.id, { featured: !p.featured })}
                          aria-pressed={p.featured}
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            p.featured
                              ? "bg-gold text-slate-deep"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {p.featured ? "Oui" : "Non"}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/proprietes/${p.slug}`}
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-gold"
                          >
                            Voir
                          </Link>
                          <button
                            type="button"
                            onClick={() => startEdit(p)}
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-gold"
                          >
                            Modifier
                          </button>
                          <button
                            type="button"
                            onClick={() => remove(p.id)}
                            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                          >
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="mt-6 space-y-3">
            {enquiries.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-500">
                Aucune demande pour le moment.
              </p>
            ) : (
              enquiries.map((e) => (
                <article
                  key={e.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-deep">{e.name}</p>
                      <p className="text-xs text-slate-500">
                        {e.phone} {e.email ? `· ${e.email}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">
                        {new Date(e.createdAt).toLocaleString("fr-FR")}
                      </span>
                      <button
                        type="button"
                        onClick={async () => {
                          await apiFetch(`/api/enquiries/${e.id}`, {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ handled: !e.handled }),
                          });
                          await load();
                        }}
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          e.handled
                            ? "bg-green-100 text-green-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {e.handled ? "Traitée" : "À traiter"}
                      </button>
                    </div>
                  </div>
                  {e.propertyTitle ? (
                    <p className="mt-2 text-xs font-semibold text-gold-dark">
                      {e.propertyTitle}
                    </p>
                  ) : null}
                  <p className="mt-2 whitespace-pre-line text-sm text-slate-600">
                    {e.message}
                  </p>
                </article>
              ))
            )}
          </div>
        )}
      </div>

      {draft ? (
        <div
          className="fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto bg-slate-950/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Éditeur de propriété"
        >
          <div className="lmdb-pop my-6 w-full max-w-3xl rounded-2xl bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl text-slate-deep">
                {draft.id ? "Modifier la propriété" : "Nouvelle propriété"}
              </h2>
              <button
                type="button"
                onClick={() => setDraft(null)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
              >
                Annuler
              </button>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={label} htmlFor="a-title">
                  Titre (FR) *
                </label>
                <input
                  id="a-title"
                  className={input}
                  value={draft.title ?? ""}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={label} htmlFor="a-titleEn">
                  Titre (EN)
                </label>
                <input
                  id="a-titleEn"
                  className={input}
                  value={draft.titleEn ?? ""}
                  onChange={(e) => setDraft({ ...draft, titleEn: e.target.value })}
                />
              </div>
              <div>
                <label className={label} htmlFor="a-type">
                  Type
                </label>
                <select
                  id="a-type"
                  className={input}
                  value={draft.propertyType ?? "Appartement"}
                  onChange={(e) => setDraft({ ...draft, propertyType: e.target.value })}
                >
                  {PROPERTY_TYPES.map((ty) => (
                    <option key={ty} value={ty}>
                      {ty}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={label} htmlFor="a-transaction">
                  Transaction
                </label>
                <select
                  id="a-transaction"
                  className={input}
                  value={draft.transactionType ?? "vente"}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      transactionType: e.target.value as Property["transactionType"],
                    })
                  }
                >
                  <option value="vente">À vendre</option>
                  <option value="location">À louer</option>
                </select>
              </div>
              <div>
                <label className={label} htmlFor="a-city">
                  Ville
                </label>
                <input
                  id="a-city"
                  className={input}
                  value={draft.city ?? ""}
                  onChange={(e) => setDraft({ ...draft, city: e.target.value })}
                />
              </div>
              <div>
                <label className={label} htmlFor="a-neighborhood">
                  Quartier
                </label>
                <input
                  id="a-neighborhood"
                  className={input}
                  value={draft.neighborhood ?? ""}
                  onChange={(e) => setDraft({ ...draft, neighborhood: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={label} htmlFor="a-address">
                  Adresse
                </label>
                <input
                  id="a-address"
                  className={input}
                  value={draft.address ?? ""}
                  onChange={(e) => setDraft({ ...draft, address: e.target.value })}
                />
              </div>
              <div>
                <label className={label} htmlFor="a-price">
                  Prix (FCFA)
                </label>
                <input
                  id="a-price"
                  type="number"
                  className={input}
                  value={draft.price ?? 0}
                  onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className={label} htmlFor="a-period">
                  Périodicité (mois si location)
                </label>
                <input
                  id="a-period"
                  className={input}
                  value={draft.pricePeriod ?? ""}
                  onChange={(e) => setDraft({ ...draft, pricePeriod: e.target.value })}
                />
              </div>
              {(
                [
                  ["bedrooms", "Chambres"],
                  ["bathrooms", "Salles de bains"],
                  ["livingRooms", "Salons"],
                  ["livingArea", "Surface habitable (m²)"],
                  ["landArea", "Terrain (m²)"],
                  ["parkingSpaces", "Places de parking"],
                ] as const
              ).map(([key, labelText]) => (
                <div key={key}>
                  <label className={label} htmlFor={`a-${key}`}>
                    {labelText}
                  </label>
                  <input
                    id={`a-${key}`}
                    type="number"
                    className={input}
                    value={(draft[key] as number | null) ?? ""}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        [key]: e.target.value === "" ? null : Number(e.target.value),
                      })
                    }
                  />
                </div>
              ))}
              <div className="sm:col-span-2">
                <label className={label} htmlFor="a-description">
                  Description (FR)
                </label>
                <textarea
                  id="a-description"
                  rows={5}
                  className={input}
                  value={draft.description ?? ""}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={label} htmlFor="a-descriptionEn">
                  Description (EN)
                </label>
                <textarea
                  id="a-descriptionEn"
                  rows={4}
                  className={input}
                  value={draft.descriptionEn ?? ""}
                  onChange={(e) =>
                    setDraft({ ...draft, descriptionEn: e.target.value })
                  }
                />
              </div>
              <div className="sm:col-span-2">
                <label className={label} htmlFor="a-images">
                  Images (une URL par ligne)
                </label>
                <textarea
                  id="a-images"
                  rows={4}
                  className={input}
                  value={draft.imagesText ?? ""}
                  onChange={(e) => setDraft({ ...draft, imagesText: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={label} htmlFor="a-amenities">
                  Commodités (séparées par des virgules)
                </label>
                <input
                  id="a-amenities"
                  className={input}
                  value={draft.amenitiesText ?? ""}
                  onChange={(e) => setDraft({ ...draft, amenitiesText: e.target.value })}
                />
              </div>
              <div>
                <label className={label} htmlFor="a-source">
                  Source
                </label>
                <input
                  id="a-source"
                  className={input}
                  value={draft.source ?? ""}
                  onChange={(e) => setDraft({ ...draft, source: e.target.value })}
                />
              </div>
              <div>
                <label className={label} htmlFor="a-sourceRef">
                  Référence source
                </label>
                <input
                  id="a-sourceRef"
                  className={input}
                  value={draft.sourceReference ?? ""}
                  onChange={(e) =>
                    setDraft({ ...draft, sourceReference: e.target.value })
                  }
                />
              </div>
              <div className="sm:col-span-2">
                <label className={label} htmlFor="a-sourceUrl">
                  URL source (interne)
                </label>
                <input
                  id="a-sourceUrl"
                  className={input}
                  value={draft.sourceUrl ?? ""}
                  onChange={(e) => setDraft({ ...draft, sourceUrl: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={label} htmlFor="a-seoTitle">
                  Titre SEO
                </label>
                <input
                  id="a-seoTitle"
                  className={input}
                  value={draft.seoTitle ?? ""}
                  onChange={(e) => setDraft({ ...draft, seoTitle: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={label} htmlFor="a-seoDescription">
                  Meta description
                </label>
                <textarea
                  id="a-seoDescription"
                  rows={2}
                  className={input}
                  value={draft.seoDescription ?? ""}
                  onChange={(e) =>
                    setDraft({ ...draft, seoDescription: e.target.value })
                  }
                />
              </div>
              <div className="flex items-center gap-6 sm:col-span-2">
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={Boolean(draft.featured)}
                    onChange={(e) => setDraft({ ...draft, featured: e.target.checked })}
                  />
                  Mettre à la une
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={draft.status !== "draft"}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        status: e.target.checked ? "published" : "draft",
                      })
                    }
                  />
                  Publié
                </label>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDraft(null)}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="rounded-lg bg-slate-deep px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-gold hover:text-slate-deep disabled:opacity-60"
              >
                {saving ? "Enregistrement…" : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
