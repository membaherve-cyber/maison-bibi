"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { apiJson } from "@/lib/backoffice-client";
import { useAdmin } from "@/components/admin/AdminShell";
import {
  ConfirmDialog, EmptyState, ErrorState, StatusBadge, TableSkeleton, toast,
} from "@/components/admin/ui";

type Request = {
  id: number; name: string; phone: string; email: string; message: string;
  requestType: string; propertyTitle: string; propertyReference: string;
  status: string; agentId: number | null; agentName: string | null;
  internalNotes: string; source: string; createdAt: string;
};

const STATUSES = [
  ["nouvelle", "Nouvelle"], ["contactee", "Contactée"], ["qualifiee", "Qualifiée"],
  ["visite-planifiee", "Visite planifiée"], ["offre", "Offre"],
  ["convertie", "Convertie"], ["terminee", "Terminée"], ["annulee", "Annulée"],
];

export default function RequestsPage() {
  const { session, can } = useAdmin();
  const isManager = can("requests.delete");

  const [items, setItems] = useState<Request[]>([]);
  const [agents, setAgents] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Request | null>(null);
  const [notes, setNotes] = useState("");
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { ok, data, error } = await apiJson<{ items: Request[] }>("/api/requests");
    if (ok) { setItems(data.items ?? []); setError(""); } else setError(error);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    if (isManager) {
      apiJson<{ items: { id: number; name: string; role: string }[] }>("/api/users").then(({ ok, data }) => {
        if (ok) setAgents((data.items ?? []).filter((u) => u.role === "agent"));
      });
    }
  }, [load, isManager]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((r) => {
      if (filter && r.status !== filter) return false;
      if (q && !`${r.name} ${r.phone} ${r.email} ${r.propertyTitle}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [items, filter, query]);

  const patch = async (id: number, values: Record<string, unknown>) => {
    const { ok, error } = await apiJson(`/api/requests/${id}`, {
      method: "PATCH", body: JSON.stringify(values),
    });
    if (!ok) { toast(error, "error"); return; }
    toast("Demande mise à jour.");
    load();
    if (open?.id === id) setOpen(null);
  };

  const remove = async (id: number) => {
    setConfirmId(null);
    const { ok, error } = await apiJson(`/api/requests/${id}`, { method: "DELETE" });
    if (!ok) { toast(error, "error"); return; }
    toast("Demande supprimée."); load();
  };

  const wa = (r: Request) =>
    `https://wa.me/${r.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
      `Bonjour ${r.name}, La Maison Bibi vous contacte au sujet de votre demande${r.propertyReference ? ` (réf. ${r.propertyReference})` : ""}.`,
    )}`;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-slate-deep sm:text-3xl">Demandes</h1>
          <p className="mt-1 text-sm text-slate-500">
            {filtered.length} demande(s){session.role === "agent" ? " qui vous sont assignées" : ""}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un client…" aria-label="Rechercher" className="input max-w-xs" />
        <select value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Statut" className="input max-w-[14rem]">
          <option value="">Tous les statuts</option>
          {STATUSES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>

      <div className="mt-4">
        {loading ? <TableSkeleton /> : error ? <ErrorState message={error} onRetry={load} /> :
          filtered.length === 0 ? (
            <EmptyState
              title="Aucune demande pour le moment."
              hint={session.role === "agent" ? "Les demandes qui vous seront assignées apparaîtront ici." : "Les demandes envoyées depuis le site apparaîtront ici."}
            />
          ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full min-w-[880px] text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Client</th><th className="px-4 py-3">Bien</th>
                  <th className="px-4 py-3">Statut</th><th className="px-4 py-3">Courtier</th>
                  <th className="px-4 py-3">Reçue</th><th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-deep">{r.name}</p>
                      <p className="text-xs text-slate-500">{r.phone} {r.email ? `· ${r.email}` : ""}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {r.propertyTitle ? (
                        <>
                          <span className="block max-w-[16rem] truncate">{r.propertyTitle}</span>
                          <span className="text-xs text-slate-400">{r.propertyReference}</span>
                        </>
                      ) : <span className="text-slate-400">Demande générale</span>}
                    </td>
                    <td className="px-4 py-3">
                      <select value={r.status} onChange={(e) => patch(r.id, { status: e.target.value })}
                        aria-label={`Statut de ${r.name}`} className="rounded-lg border border-slate-200 px-2 py-1 text-xs">
                        {STATUSES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      {isManager ? (
                        <select value={r.agentId ?? ""} onChange={(e) => patch(r.id, { agentId: e.target.value || null })}
                          aria-label={`Courtier pour ${r.name}`} className="rounded-lg border border-slate-200 px-2 py-1 text-xs">
                          <option value="">Non assignée</option>
                          {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                      ) : (
                        <span className="text-slate-500">{r.agentName ?? "—"}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {new Date(r.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        <button type="button" onClick={() => { setOpen(r); setNotes(r.internalNotes ?? ""); }} className="btn-ghost-sm">
                          Détails
                        </button>
                        {r.phone ? (
                          <>
                            <a href={wa(r)} target="_blank" rel="noopener noreferrer" className="btn-ghost-sm">WhatsApp</a>
                            <a href={`tel:${r.phone.replace(/\s/g, "")}`} className="btn-ghost-sm">Appeler</a>
                          </>
                        ) : null}
                        {isManager ? (
                          <button type="button" onClick={() => setConfirmId(r.id)} className="btn-danger-sm">Supprimer</button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {open ? (
        <div className="fixed inset-0 z-[150] overflow-y-auto bg-slate-950/60 p-4" role="dialog" aria-modal="true"
          aria-label="Détail de la demande" onClick={() => setOpen(null)}>
          <div className="lmdb-pop mx-auto my-8 w-full max-w-lg rounded-2xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display text-xl text-slate-deep">{open.name}</h2>
            <p className="mt-1 text-sm text-slate-500">{open.phone} {open.email ? `· ${open.email}` : ""}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <StatusBadge value={open.status} />
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">Source : {open.source}</span>
              {open.propertyReference ? (
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">{open.propertyReference}</span>
              ) : null}
            </div>
            {open.propertyTitle ? (
              <p className="mt-4 text-sm font-semibold text-gold-dark">{open.propertyTitle}</p>
            ) : null}
            <p className="mt-3 whitespace-pre-line rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
              {open.message || "Aucun message."}
            </p>

            <label className="label mt-5" htmlFor="notes">Notes internes</label>
            <textarea id="notes" rows={4} className="input" value={notes} onChange={(e) => setNotes(e.target.value)} />

            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setOpen(null)} className="btn-ghost">Fermer</button>
              <button type="button" onClick={() => patch(open.id, { internalNotes: notes })} className="btn-primary">
                Enregistrer la note
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmDialog open={confirmId !== null} title="Supprimer cette demande ?"
        message="Cette action est définitive." confirmLabel="Supprimer"
        onCancel={() => setConfirmId(null)} onConfirm={() => confirmId !== null && remove(confirmId)} />
    </div>
  );
}
