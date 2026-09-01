"use client";

import { useState } from "react";
import { apiJson } from "@/lib/backoffice-client";
import { useAdmin } from "@/components/admin/AdminShell";
import { toast } from "@/components/admin/ui";

const ROLE_LABEL: Record<string, string> = {
  manager: "Super Admin — contrôle total du site",
  admin: "Administrateur — accès opérationnel complet",
  agent: "Agent — dossiers assignés",
};

export default function ProfilePage() {
  const { session, permissions } = useAdmin();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const change = async () => {
    setError("");
    if (password.length < 8) { setError("Le mot de passe doit contenir au moins 8 caractères."); return; }
    if (password !== confirm) { setError("Les deux mots de passe ne correspondent pas."); return; }
    setSaving(true);
    const { ok, error } = await apiJson(`/api/users/${session.id}`, {
      method: "PATCH", body: JSON.stringify({ password }),
    });
    setSaving(false);
    if (!ok) { setError(error); return; }
    toast("Mot de passe modifié.");
    setPassword(""); setConfirm("");
  };

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl text-slate-deep sm:text-3xl">Profil</h1>

      <section className="card mt-6">
        <h2 className="font-display text-lg text-slate-deep">Mon compte</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between border-b border-slate-100 py-2">
            <dt className="text-slate-500">Nom</dt><dd className="font-semibold text-slate-deep">{session.name}</dd>
          </div>
          <div className="flex justify-between border-b border-slate-100 py-2">
            <dt className="text-slate-500">Identifiant</dt><dd className="font-semibold text-slate-deep">{session.username}</dd>
          </div>
          <div className="flex justify-between py-2">
            <dt className="text-slate-500">Rôle</dt><dd className="font-semibold text-slate-deep">{ROLE_LABEL[session.role]}</dd>
          </div>
        </dl>
      </section>

      <section className="card mt-5">
        <h2 className="font-display text-lg text-slate-deep">Modifier le mot de passe</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label className="label" htmlFor="pw">Nouveau mot de passe</label>
            <input id="pw" type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
          </div>
          <div>
            <label className="label" htmlFor="pw2">Confirmer</label>
            <input id="pw2" type="password" className="input" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
          </div>
          {error ? <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
          <button type="button" onClick={change} disabled={saving} className="btn-primary">
            {saving ? "Enregistrement…" : "Modifier le mot de passe"}
          </button>
          <p className="text-xs text-slate-500">
            Note : les comptes gérés par la configuration d&apos;hébergement sont resynchronisés au
            redémarrage. Pour un mot de passe permanent, modifiez-le dans les variables
            d&apos;environnement.
          </p>
        </div>
      </section>

      <section className="card mt-5">
        <h2 className="font-display text-lg text-slate-deep">Mes autorisations</h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          {permissions.map((p) => (
            <li key={p} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">{p}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
