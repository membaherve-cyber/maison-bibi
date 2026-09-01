"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { apiJson } from "@/lib/backoffice-client";
import { EmptyState, ErrorState, TableSkeleton } from "@/components/admin/ui";

type Entry = {
  id: number; username: string; action: string; resource: string;
  resourceId: string; detail: string; ip: string; createdAt: string;
};

const ACTIONS: Record<string, string> = {
  login: "Connexion", logout: "Déconnexion", create: "Création",
  update: "Modification", delete: "Suppression", upload: "Téléversement",
};

export default function JournalPage() {
  const [items, setItems] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const { ok, data, error } = await apiJson<{ items: Entry[] }>("/api/activity?limit=200");
    if (ok) { setItems(data.items ?? []); setError(""); } else setError(error);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? items.filter((e) => `${e.username} ${e.action} ${e.resource} ${e.detail}`.toLowerCase().includes(q)) : items;
  }, [items, query]);

  return (
    <div>
      <h1 className="font-display text-2xl text-slate-deep sm:text-3xl">Journal d&apos;activité</h1>
      <p className="mt-1 text-sm text-slate-500">{filtered.length} entrée(s) — 200 plus récentes</p>

      <input type="search" value={query} onChange={(e) => setQuery(e.target.value)}
        placeholder="Rechercher…" aria-label="Rechercher" className="input mt-5 max-w-xs" />

      <div className="mt-4">
        {loading ? <TableSkeleton /> : error ? <ErrorState message={error} onRetry={load} /> :
          filtered.length === 0 ? <EmptyState title="Aucune activité enregistrée." /> : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Date</th><th className="px-4 py-3">Utilisateur</th>
                  <th className="px-4 py-3">Action</th><th className="px-4 py-3">Ressource</th>
                  <th className="px-4 py-3">Détail</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <tr key={e.id} className="border-b border-slate-50 last:border-0">
                    <td className="px-4 py-3 text-xs text-slate-500">{new Date(e.createdAt).toLocaleString("fr-FR")}</td>
                    <td className="px-4 py-3 font-semibold text-slate-deep">{e.username || "système"}</td>
                    <td className="px-4 py-3 text-slate-600">{ACTIONS[e.action] ?? e.action}</td>
                    <td className="px-4 py-3 text-slate-600">{e.resource}{e.resourceId ? ` #${e.resourceId}` : ""}</td>
                    <td className="px-4 py-3 text-slate-500">{e.detail || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}