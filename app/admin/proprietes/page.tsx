"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { apiJson } from "@/lib/backoffice-client";
import { useAdmin } from "@/components/admin/AdminShell";
import { GalleryEditor } from "@/components/admin/MediaPicker";
import {
  ConfirmDialog, EmptyState, ErrorState, StatusBadge, TableSkeleton, toast,
} from "@/components/admin/ui";

type Property = Record<string, unknown> & {
  id: number; slug: string; title: string; reference: string;
  propertyType: string; transactionType: string; availability: string;
  price: number; pricePeriod: string; neighborhood: string; city: string;
  status: string; featured: boolean; images: string[]; agentId: number | null;
};

const TYPES = ["Appartement", "Villa", "Maison", "Duplex", "Terrain", "Bureau", "Local commercial", "Immeuble", "Entrepôt"];
const AVAILABILITY = [
  ["disponible", "Disponible"], ["sous-offre", "Sous offre"],
  ["vendu", "Vendu"], ["loue", "Loué"], ["archive", "Archivé"],
];

const money = (n: number) =>
  new Intl.NumberFormat("fr-FR").format(n).replace(/\u202f|\u00a0/g, " ");

export default function PropertiesAdminPage() {
  const { can } = useAdmin();
  const mayWrite = can("properties.write");
  const mayDelete = can("properties.delete");

  const [items, setItems] = useState<Property[]>([]);
  const [agents, setAgents] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sort, setSort] = useState("recent");
  const [page, setPage] = useState(1);
  const [draft, setDraft] = useState<Partial<Property> | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [advanced, setAdvanced] = useState(false);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { ok, data, error } = await apiJson<{ properties: Property[] }>("/api/properties");
    if (ok) { setItems(data.properties ?? []); setError(""); } else setError(error);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    apiJson<{ items: { id: number; name: string; role: string }[] }>("/api/users").then(({ ok, data }) => {
      if (ok) setAgents((data.items ?? []).filter((u) => u.role === "agent"));
    });
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = items.filter((p) => {
      if (filterType && p.propertyType !== filterType) return false;
      if (filterStatus && p.status !== filterStatus) return false;
      if (q && !`${p.title} ${p.reference} ${p.neighborhood}`.toLowerCase().includes(q)) return false;
      return true;
    });
    if (sort === "priceAsc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "priceDesc") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "title") list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    return list;
  }, [items, query, filterType, filterStatus, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / 10));
  const visible = filtered.slice((page - 1) * 10, page * 10);

  const patch = async (id: number, values: Record<string, unknown>) => {
    const { ok, error } = await apiJson(`/api/properties/${id}`, {
      method: "PATCH", body: JSON.stringify(values),
    });
    if (!ok) { toast(error, "error"); return; }
    toast("Propriété mise à jour.");
    load();
  };

  const save = async () => {
    if (!draft) return;
    if (!String(draft.title ?? "").trim()) { setFormError("Le titre est obligatoire."); return; }
    setSaving(true); setFormError("");
    const { ok, error } = await apiJson(
      draft.id ? `/api/properties/${draft.id}` : "/api/properties",
      { method: draft.id ? "PATCH" : "POST", body: JSON.stringify(draft) },
    );
    setSaving(false);
    if (!ok) { setFormError(error); return; }
    toast(draft.id ? "Propriété enregistrée." : "Propriété créée.");
    setDraft(null); load();
  };

  const duplicate = async (p: Property) => {
    const copy = { ...p } as Record<string, unknown>;
    delete copy.id; delete copy.slug; delete copy.reference;
    copy.title = `${p.title} (copie)`;
    copy.status = "draft";
    const { ok, error } = await apiJson("/api/properties", { method: "POST", body: JSON.stringify(copy) });
    if (!ok) { toast(error, "error"); return; }
    toast("Propriété dupliquée en brouillon.");
    load();
  };

  const remove = async (id: number) => {
    setConfirmId(null);
    const { ok, error } = await apiJson(`/api/properties/${id}`, { method: "DELETE" });
    if (!ok) { toast(error, "error"); return; }
    toast("Propriété supprimée."); load();
  };

  const newDraft = () => {
    setDraft({
      title: "", propertyType: "Appartement", transactionType: "vente",
      availability: "disponible", city: "Douala", region: "Littoral",
      neighborhood: "", price: 0, status: "draft", images: [], amenities: [],
    });
    setAdvanced(false); setFormError("");
  };

  const set = (k: string, v: unknown) => setDraft((d) => ({ ...(d ?? {}), [k]: v }));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-slate-deep sm:text-3xl">Propriétés</h1>
          <p className="mt-1 text-sm text-slate-500">{filtered.length} bien(s)</p>
        </div>
        {mayWrite ? <button type="button" onClick={newDraft} className="btn-primary">+ Ajouter une propriété</button> : null}
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <input type="search" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }}
          placeholder="Rechercher (titre, référence, quartier)…" aria-label="Rechercher" className="input max-w-xs" />
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} aria-label="Type" className="input max-w-[12rem]">
          <option value="">Tous les types</option>
          {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} aria-label="Statut" className="input max-w-[12rem]">
          <option value="">Tous les statuts</option>
          <option value="published">Publié</option>
          <option value="draft">Brouillon</option>
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Trier" className="input max-w-[12rem]">
          <option value="recent">Tri : sélection</option>
          <option value="priceAsc">Prix croissant</option>
          <option value="priceDesc">Prix décroissant</option>
          <option value="title">Titre A→Z</option>
        </select>
      </div>

      <div className="mt-4">
        {loading ? <TableSkeleton /> : error ? <ErrorState message={error} onRetry={load} /> :
          filtered.length === 0 ? <EmptyState hint={query ? "Aucun résultat." : undefined} /> : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Bien</th><th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Prix</th><th className="px-4 py-3">Disponibilité</th>
                  <th className="px-4 py-3">Publication</th><th className="px-4 py-3">À la une</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((p) => (
                  <tr key={p.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.images?.[0] ?? "/logo-mark.svg"} alt="" loading="lazy"
                          className="h-11 w-16 shrink-0 rounded-lg object-cover" />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-deep">{p.title}</p>
                          <p className="text-xs text-slate-500">
                            {p.reference} · {p.neighborhood}, {p.city} · {p.images?.length ?? 0} photo(s)
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{p.propertyType}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {money(p.price)} FCFA{p.pricePeriod ? " /mois" : ""}
                    </td>
                    <td className="px-4 py-3"><StatusBadge value={p.availability} /></td>
                    <td className="px-4 py-3">
                      {mayWrite ? (
                        <button type="button"
                          onClick={() => patch(p.id, { status: p.status === "published" ? "draft" : "published" })}>
                          <StatusBadge value={p.status} />
                        </button>
                      ) : <StatusBadge value={p.status} />}
                    </td>
                    <td className="px-4 py-3">
                      {mayWrite ? (
                        <button type="button" onClick={() => patch(p.id, { featured: !p.featured })}
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${p.featured ? "bg-gold text-slate-deep" : "bg-slate-100 text-slate-500"}`}>
                          {p.featured ? "Oui" : "Non"}
                        </button>
                      ) : (p.featured ? "Oui" : "Non")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        <Link href={`/proprietes/${p.slug}`} target="_blank" className="btn-ghost-sm">Aperçu</Link>
                        {mayWrite ? (
                          <>
                            <button type="button" onClick={() => { setDraft({ ...p }); setAdvanced(false); setFormError(""); }} className="btn-ghost-sm">Modifier</button>
                            <button type="button" onClick={() => duplicate(p)} className="btn-ghost-sm">Dupliquer</button>
                          </>
                        ) : null}
                        {mayDelete ? <button type="button" onClick={() => setConfirmId(p.id)} className="btn-danger-sm">Supprimer</button> : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pages > 1 ? (
        <div className="mt-4 flex items-center justify-center gap-2">
          <button type="button" disabled={page === 1} onClick={() => setPage((v) => v - 1)} className="btn-ghost-sm">Précédent</button>
          <span className="text-sm text-slate-500">Page {page} / {pages}</span>
          <button type="button" disabled={page === pages} onClick={() => setPage((v) => v + 1)} className="btn-ghost-sm">Suivant</button>
        </div>
      ) : null}

      {draft ? (
        <div className="fixed inset-0 z-[150] overflow-y-auto bg-slate-950/60 p-4" role="dialog" aria-modal="true"
          aria-label="Éditeur de propriété" onClick={() => setDraft(null)}>
          <div className="lmdb-pop mx-auto my-6 w-full max-w-4xl rounded-2xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display text-xl text-slate-deep">
              {draft.id ? "Modifier la propriété" : "Nouvelle propriété"}
            </h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="label" htmlFor="p-title">Titre <span className="text-red-500">*</span></label>
                <input id="p-title" className="input" value={String(draft.title ?? "")} onChange={(e) => set("title", e.target.value)} />
              </div>
              <div>
                <label className="label" htmlFor="p-type">Type de bien</label>
                <select id="p-type" className="input" value={String(draft.propertyType ?? "")} onChange={(e) => set("propertyType", e.target.value)}>
                  {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="p-transaction">Transaction</label>
                <select id="p-transaction" className="input" value={String(draft.transactionType ?? "vente")} onChange={(e) => set("transactionType", e.target.value)}>
                  <option value="vente">À vendre</option><option value="location">À louer</option>
                </select>
              </div>
              <div>
                <label className="label" htmlFor="p-price">Prix (FCFA)</label>
                <input id="p-price" type="number" min={0} className="input" value={Number(draft.price ?? 0)} onChange={(e) => set("price", Number(e.target.value))} />
              </div>
              <div>
                <label className="label" htmlFor="p-period">Périodicité</label>
                <select id="p-period" className="input" value={String(draft.pricePeriod ?? "")} onChange={(e) => set("pricePeriod", e.target.value)}>
                  <option value="">Prix global (vente)</option><option value="mois">Par mois (location)</option>
                </select>
              </div>
              <div>
                <label className="label" htmlFor="p-neigh">Quartier</label>
                <input id="p-neigh" className="input" value={String(draft.neighborhood ?? "")} onChange={(e) => set("neighborhood", e.target.value)} />
              </div>
              <div>
                <label className="label" htmlFor="p-city">Ville</label>
                <input id="p-city" className="input" value={String(draft.city ?? "")} onChange={(e) => set("city", e.target.value)} />
              </div>
              {(["bedrooms", "bathrooms", "livingArea", "landArea"] as const).map((k) => (
                <div key={k}>
                  <label className="label" htmlFor={`p-${k}`}>
                    {{ bedrooms: "Chambres", bathrooms: "Salles de bains", livingArea: "Surface habitable (m²)", landArea: "Terrain (m²)" }[k]}
                  </label>
                  <input id={`p-${k}`} type="number" min={0} className="input"
                    value={draft[k] === null || draft[k] === undefined ? "" : String(draft[k])}
                    onChange={(e) => set(k, e.target.value === "" ? null : Number(e.target.value))} />
                </div>
              ))}
              <div className="sm:col-span-2">
                <label className="label" htmlFor="p-desc">Description</label>
                <textarea id="p-desc" rows={6} className="input" value={String(draft.description ?? "")} onChange={(e) => set("description", e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <span className="label">Photos du bien</span>
                <GalleryEditor images={Array.isArray(draft.images) ? (draft.images as string[]) : []} onChange={(v) => set("images", v)} />
              </div>
              <div>
                <label className="label" htmlFor="p-avail">Disponibilité</label>
                <select id="p-avail" className="input" value={String(draft.availability ?? "disponible")} onChange={(e) => set("availability", e.target.value)}>
                  {AVAILABILITY.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="p-agent">Courtier assigné</label>
                <select id="p-agent" className="input" value={draft.agentId ? String(draft.agentId) : ""} onChange={(e) => set("agentId", e.target.value ? Number(e.target.value) : null)}>
                  <option value="">Non assigné</option>
                  {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-6 sm:col-span-2">
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" checked={Boolean(draft.featured)} onChange={(e) => set("featured", e.target.checked)} /> Mettre à la une
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" checked={draft.status !== "draft"} onChange={(e) => set("status", e.target.checked ? "published" : "draft")} /> Publié
                </label>
              </div>
            </div>

            <div className="mt-5">
              <button type="button" onClick={() => setAdvanced((v) => !v)} aria-expanded={advanced} className="btn-ghost-sm">
                {advanced ? "Masquer" : "Afficher"} les options avancées
              </button>
              {advanced ? (
                <div className="mt-4 grid gap-4 rounded-xl bg-slate-50 p-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="label" htmlFor="p-amen">Commodités (séparées par des virgules)</label>
                    <input id="p-amen" className="input"
                      value={Array.isArray(draft.amenities) ? (draft.amenities as string[]).join(", ") : ""}
                      onChange={(e) => set("amenities", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} />
                  </div>
                  <div><label className="label" htmlFor="p-address">Adresse</label>
                    <input id="p-address" className="input" value={String(draft.address ?? "")} onChange={(e) => set("address", e.target.value)} /></div>
                  <div><label className="label" htmlFor="p-cond">État</label>
                    <input id="p-cond" className="input" value={String(draft.condition ?? "")} onChange={(e) => set("condition", e.target.value)} /></div>
                  <div className="sm:col-span-2"><label className="label" htmlFor="p-seot">Titre SEO</label>
                    <input id="p-seot" className="input" value={String(draft.seoTitle ?? "")} onChange={(e) => set("seoTitle", e.target.value)}
                      placeholder="Généré automatiquement si vide" /></div>
                  <div className="sm:col-span-2"><label className="label" htmlFor="p-seod">Meta description</label>
                    <textarea id="p-seod" rows={2} className="input" value={String(draft.seoDescription ?? "")} onChange={(e) => set("seoDescription", e.target.value)} /></div>
                </div>
              ) : null}
            </div>

            {formError ? <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p> : null}

            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setDraft(null)} className="btn-ghost">Annuler</button>
              <button type="button" onClick={save} disabled={saving} className="btn-primary">
                {saving ? "Enregistrement…" : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmDialog open={confirmId !== null} title="Supprimer cette propriété ?"
        message="Le bien sera retiré du site public et de la base de données."
        confirmLabel="Supprimer" onCancel={() => setConfirmId(null)}
        onConfirm={() => confirmId !== null && remove(confirmId)} />
    </div>
  );
}
