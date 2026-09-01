"use client";

import { useCallback, useEffect, useState } from "react";
import { apiJson } from "@/lib/backoffice-client";
import { useAdmin } from "@/components/admin/AdminShell";
import { ConfirmDialog, EmptyState, ErrorState, TableSkeleton, toast } from "@/components/admin/ui";

type User = {
  id: number; username: string; name: string; email: string;
  role: "manager" | "admin" | "agent"; active: boolean; lastLoginAt: string | null;
};

const ROLES = [["manager", "Super Admin (contrôle total)"], ["admin", "Administrateur (accès opérationnel complet)"], ["agent", "Agent (dossiers assignés)"]];

export default function UsersPage() {
  const { session } = useAdmin();
  const [items, setItems] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState<Record<string, string> | null>(null);
  const [formError, setFormError] = useState("");
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { ok, data, error } = await apiJson<{ items: User[] }>("/api/users");
    if (ok) { setItems(data.items ?? []); setError(""); } else setError(error);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const patch = async (id: number, values: Record<string, unknown>) => {
    const { ok, error } = await apiJson(`/api/users/${id}`, { method: "PATCH", body: JSON.stringify(values) });
    if (!ok) { toast(error, "error"); return; }
    toast("Utilisateur mis à jour."); load();
  };

  const create = async () => {
    if (!draft) return;
    setFormError("");
    const { ok, error } = await apiJson("/api/users", { method: "POST", body: JSON.stringify(draft) });
    if (!ok) { setFormError(error); return; }
    toast("Utilisateur créé."); setDraft(null); load();
  };

  const remove = async (id: number) => {
    setConfirmId(null);
    const { ok, error } = await apiJson(`/api/users/${id}`, { method: "DELETE" });
    if (!ok) { toast(error, "error"); return; }
    toast("Utilisateur supprimé."); load();
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-slate-deep sm:text-3xl">Utilisateurs</h1>
          <p className="mt-1 text-sm text-slate-500">{items.length} compte(s)</p>
        </div>
        <button type="button" onClick={() => { setDraft({ username: "", name: "", email: "", password: "", role: "agent" }); setFormError(""); }} className="btn-primary">
          + Ajouter un utilisateur
        </button>
      </div>

      <div className="mt-5">
        {loading ? <TableSkeleton /> : error ? <ErrorState message={error} onRetry={load} /> :
          items.length === 0 ? <EmptyState /> : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Utilisateur</th><th className="px-4 py-3">Rôle</th>
                  <th className="px-4 py-3">Statut</th><th className="px-4 py-3">Dernière connexion</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((u) => (
                  <tr key={u.id} className="border-b border-slate-50 last:border-0">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-deep">{u.name || u.username}</p>
                      <p className="text-xs text-slate-500">{u.username}{u.email ? ` · ${u.email}` : ""}</p>
                    </td>
                    <td className="px-4 py-3">
                      <select value={u.role} onChange={(e) => patch(u.id, { role: e.target.value })}
                        aria-label={`Rôle de ${u.username}`} className="rounded-lg border border-slate-200 px-2 py-1 text-xs">
                        {ROLES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <button type="button" onClick={() => patch(u.id, { active: !u.active })}
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${u.active ? "bg-green-100 text-green-800" : "bg-slate-200 text-slate-600"}`}>
                        {u.active ? "Actif" : "Désactivé"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString("fr-FR") : "Jamais"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        <button type="button" onClick={() => {
                          const pwd = window.prompt(`Nouveau mot de passe pour ${u.username} (8 caractères minimum)`);
                          if (pwd) patch(u.id, { password: pwd });
                        }} className="btn-ghost-sm">Mot de passe</button>
                        {u.id !== session.id ? (
                          <button type="button" onClick={() => setConfirmId(u.id)} className="btn-danger-sm">Supprimer</button>
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

      {draft ? (
        <div className="fixed inset-0 z-[150] flex items-start justify-center overflow-y-auto bg-slate-950/60 p-4"
          role="dialog" aria-modal="true" aria-label="Nouvel utilisateur" onClick={() => setDraft(null)}>
          <div className="lmdb-pop my-8 w-full max-w-lg rounded-2xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display text-xl text-slate-deep">Nouvel utilisateur</h2>
            <div className="mt-5 space-y-4">
              {([["username", "Identifiant de connexion"], ["name", "Nom affiché"], ["email", "E-mail"]] as const).map(([k, label]) => (
                <div key={k}>
                  <label className="label" htmlFor={`u-${k}`}>{label}{k === "username" ? " *" : ""}</label>
                  <input id={`u-${k}`} className="input" value={draft[k]} onChange={(e) => setDraft({ ...draft, [k]: e.target.value })} />
                </div>
              ))}
              <div>
                <label className="label" htmlFor="u-password">Mot de passe * (8 caractères minimum)</label>
                <input id="u-password" className="input" value={draft.password} onChange={(e) => setDraft({ ...draft, password: e.target.value })} />
              </div>
              <div>
                <label className="label" htmlFor="u-role">Rôle</label>
                <select id="u-role" className="input" value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value })}>
                  {ROLES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            </div>
            {formError ? <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p> : null}
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setDraft(null)} className="btn-ghost">Annuler</button>
              <button type="button" onClick={create} className="btn-primary">Créer</button>
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmDialog open={confirmId !== null} title="Supprimer cet utilisateur ?"
        message="Le compte n'aura plus accès au backoffice." confirmLabel="Supprimer"
        onCancel={() => setConfirmId(null)} onConfirm={() => confirmId !== null && remove(confirmId)} />
    </div>
  );
}
