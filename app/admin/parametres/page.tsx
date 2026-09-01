"use client";

import { useCallback, useEffect, useState } from "react";
import { apiJson } from "@/lib/backoffice-client";
import { useAdmin } from "@/components/admin/AdminShell";
import { ErrorState, TableSkeleton, toast } from "@/components/admin/ui";

type Group = Record<string, unknown>;

const FIELDS: Record<string, { label: string; fields: [string, string, string?][] }> = {
  general: { label: "Général", fields: [
    ["businessName", "Nom de l'entreprise"], ["tagline", "Slogan"],
    ["founder", "Fondatrice / Fondateur"], ["description", "Description", "textarea"],
    ["email", "E-mail"], ["address", "Adresse"], ["region", "Région d'intervention"],
  ] },
  whatsapp: { label: "WhatsApp", fields: [
    ["primary", "Numéro principal (format international sans +)"],
    ["secondary", "Numéro secondaire"],
    ["defaultMessage", "Message par défaut", "textarea"],
    ["propertyMessage", "Message pour une propriété", "textarea"],
    ["appointmentMessage", "Message pour un rendez-vous", "textarea"],
  ] },
  social: { label: "Réseaux sociaux", fields: [
    ["facebook", "Facebook"], ["instagram", "Instagram"], ["linkedin", "LinkedIn"],
  ] },
  seo: { label: "SEO", fields: [
    ["defaultTitle", "Titre par défaut"], ["defaultDescription", "Description par défaut", "textarea"],
    ["defaultImage", "Image Open Graph"], ["robots", "Robots"],
  ] },
  ai: { label: "Assistant IA", fields: [
    ["assistantName", "Nom de l'assistante"], ["welcomeMessage", "Message d'accueil", "textarea"],
    ["escalationMessage", "Message d'orientation WhatsApp", "textarea"],
  ] },
};

export function SettingsPanels({ only }: { only?: string[] }) {
  const { can } = useAdmin();
  const mayWrite = can("settings.write");
  const [settings, setSettings] = useState<Record<string, Group>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const { ok, data, error } = await apiJson<{ settings: Record<string, Group> }>("/api/settings");
    if (ok) { setSettings(data.settings ?? {}); setError(""); } else setError(error);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const save = async (key: string) => {
    setSaving(key);
    const { ok, error } = await apiJson("/api/settings", {
      method: "PATCH", body: JSON.stringify({ key, value: settings[key] ?? {} }),
    });
    setSaving("");
    if (!ok) { toast(error, "error"); return; }
    toast("Paramètres enregistrés.");
  };

  const setField = (group: string, field: string, value: string) =>
    setSettings((s) => ({ ...s, [group]: { ...(s[group] ?? {}), [field]: value } }));

  if (loading) return <TableSkeleton rows={4} />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const groups = Object.entries(FIELDS).filter(([k]) => !only || only.includes(k));

  return (
    <div className="space-y-6">
      {groups.map(([key, def]) => (
        <section key={key} className="card">
          <h2 className="font-display text-lg text-slate-deep">{def.label}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {def.fields.map(([field, label, kind]) => (
              <div key={field} className={kind === "textarea" ? "sm:col-span-2" : ""}>
                <label className="label" htmlFor={`${key}-${field}`}>{label}</label>
                {kind === "textarea" ? (
                  <textarea id={`${key}-${field}`} rows={2} className="input" disabled={!mayWrite}
                    value={String((settings[key] as Group)?.[field] ?? "")}
                    onChange={(e) => setField(key, field, e.target.value)} />
                ) : (
                  <input id={`${key}-${field}`} className="input" disabled={!mayWrite}
                    value={String((settings[key] as Group)?.[field] ?? "")}
                    onChange={(e) => setField(key, field, e.target.value)} />
                )}
              </div>
            ))}
          </div>
          {key === "whatsapp" ? (
            <p className="mt-3 text-xs text-slate-500">
              Variables disponibles dans les messages : <code>{"{titre}"}</code>, <code>{"{reference}"}</code>.
            </p>
          ) : null}
          {mayWrite ? (
            <div className="mt-4">
              <button type="button" onClick={() => save(key)} disabled={saving === key} className="btn-primary">
                {saving === key ? "Enregistrement…" : "Enregistrer"}
              </button>
            </div>
          ) : (
            <p className="mt-3 text-xs text-slate-500">Lecture seule : vous n&apos;avez pas les droits de modification.</p>
          )}
        </section>
      ))}
    </div>
  );
}

export default function Page() {
  return (
    <div>
      <h1 className="font-display text-2xl text-slate-deep sm:text-3xl">Paramètres</h1>
      <p className="mt-1 text-sm text-slate-500">Informations de l&apos;entreprise, WhatsApp, réseaux sociaux et assistant.</p>
      <div className="mt-6"><SettingsPanels /></div>
    </div>
  );
}