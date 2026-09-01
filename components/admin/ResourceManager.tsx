"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { apiJson } from "@/lib/backoffice-client";
import { useAdmin } from "./AdminShell";
import {
  ConfirmDialog, EmptyState, ErrorState, StatusBadge, TableSkeleton, toast,
} from "./ui";
import { MediaPicker } from "./MediaPicker";

export type FieldDef = {
  key: string;
  label: string;
  type: "text" | "textarea" | "richtext" | "number" | "bool" | "select" | "image" | "tags" | "date";
  options?: { value: string; label: string }[];
  required?: boolean;
  help?: string;
  advanced?: boolean;
  full?: boolean;
};

export type ColumnDef<T> = {
  header: string;
  render: (item: T) => ReactNode;
  sortKey?: string;
};

type Item = Record<string, unknown> & { id: number };

export function ResourceManager<T extends Item>({
  endpoint,
  title,
  singular,
  fields,
  columns,
  writePermission,
  deletePermission,
  searchKeys = ["name", "title"],
  defaults = {},
  pageSize = 12,
}: {
  endpoint: string;
  title: string;
  singular: string;
  fields: FieldDef[];
  columns: ColumnDef<T>[];
  writePermission: string;
  deletePermission?: string;
  searchKeys?: string[];
  defaults?: Record<string, unknown>;
  pageSize?: number;
}) {
  const { can } = useAdmin();
  const mayWrite = can(writePermission);
  const mayDelete = can(deletePermission ?? writePermission);

  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [draft, setDraft] = useState<Record<string, unknown> | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { ok, data, error } = await apiJson<{ items: T[] }>(endpoint);
    if (ok) {
      setItems(data.items ?? []);
      setError("");
    } else setError(error);
    setLoading(false);
  }, [endpoint]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) =>
      searchKeys.some((k) => String(it[k] ?? "").toLowerCase().includes(q)),
    );
  }, [items, query, searchKeys]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);

  const save = async () => {
    if (!draft) return;
    setSaving(true);
    setFormError("");
    const id = draft.id as number | undefined;
    const { ok, error } = await apiJson(id ? `${endpoint}/${id}` : endpoint, {
      method: id ? "PATCH" : "POST",
      body: JSON.stringify(draft),
    });
    setSaving(false);
    if (!ok) { setFormError(error); return; }
    toast(id ? `${singular} mis à jour.` : `${singular} créé.`);
    setDraft(null);
    load();
  };

  const remove = async (id: number) => {
    setConfirmId(null);
    const { ok, error } = await apiJson(`${endpoint}/${id}`, { method: "DELETE" });
    if (!ok) { toast(error, "error"); return; }
    toast(`${singular} supprimé.`);
    load();
  };

  const newDraft = () => {
    const base: Record<string, unknown> = { ...defaults };
    for (const f of fields) if (!(f.key in base)) base[f.key] = f.type === "bool" ? false : "";
    setDraft(base);
    setShowAdvanced(false);
    setFormError("");
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-slate-deep sm:text-3xl">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {filtered.length} élément{filtered.length > 1 ? "s" : ""}
          </p>
        </div>
        {mayWrite ? (
          <button type="button" onClick={newDraft} className="btn-primary">
            + Ajouter
          </button>
        ) : null}
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <input
          type="search"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setPage(1); }}
          placeholder="Rechercher…"
          aria-label="Rechercher"
          className="input max-w-xs"
        />
      </div>

      <div className="mt-4">
        {loading ? (
          <TableSkeleton />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : filtered.length === 0 ? (
          <EmptyState
            hint={query ? "Aucun résultat pour cette recherche." : undefined}
            action={mayWrite && !query ? (
              <button type="button" onClick={newDraft} className="btn-primary">
                Ajouter un élément
              </button>
            ) : null}
          />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  {columns.map((c) => <th key={c.header} className="px-4 py-3">{c.header}</th>)}
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((item) => (
                  <tr key={item.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                    {columns.map((c) => (
                      <td key={c.header} className="px-4 py-3 align-middle">{c.render(item)}</td>
                    ))}
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        {mayWrite ? (
                          <button
                            type="button"
                            onClick={() => { setDraft({ ...item }); setShowAdvanced(false); setFormError(""); }}
                            className="btn-ghost-sm"
                          >
                            Modifier
                          </button>
                        ) : null}
                        {mayDelete ? (
                          <button type="button" onClick={() => setConfirmId(item.id)} className="btn-danger-sm">
                            Supprimer
                          </button>
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

      {pages > 1 ? (
        <div className="mt-4 flex items-center justify-center gap-2">
          <button type="button" disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="btn-ghost-sm">
            Précédent
          </button>
          <span className="text-sm text-slate-500">Page {page} / {pages}</span>
          <button type="button" disabled={page === pages} onClick={() => setPage((p) => p + 1)} className="btn-ghost-sm">
            Suivant
          </button>
        </div>
      ) : null}

      {draft ? (
        <div
          className="fixed inset-0 z-[150] overflow-y-auto bg-slate-950/60 p-4"
          role="dialog" aria-modal="true" aria-label={singular}
          onClick={() => setDraft(null)}
        >
          <div
            className="lmdb-pop mx-auto my-6 w-full max-w-3xl rounded-2xl bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-display text-xl text-slate-deep">
              {draft.id ? `Modifier : ${singular}` : `Nouveau : ${singular}`}
            </h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {fields.filter((f) => !f.advanced).map((f) => (
                <FieldInput key={f.key} field={f} draft={draft} setDraft={setDraft} />
              ))}
            </div>

            {fields.some((f) => f.advanced) ? (
              <div className="mt-5">
                <button
                  type="button"
                  onClick={() => setShowAdvanced((v) => !v)}
                  aria-expanded={showAdvanced}
                  className="btn-ghost-sm"
                >
                  {showAdvanced ? "Masquer" : "Afficher"} les options avancées
                </button>
                {showAdvanced ? (
                  <div className="mt-4 grid gap-4 rounded-xl bg-slate-50 p-4 sm:grid-cols-2">
                    {fields.filter((f) => f.advanced).map((f) => (
                      <FieldInput key={f.key} field={f} draft={draft} setDraft={setDraft} />
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}

            {formError ? (
              <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {formError}
              </p>
            ) : null}

            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setDraft(null)} className="btn-ghost">Annuler</button>
              <button type="button" onClick={save} disabled={saving} className="btn-primary">
                {saving ? "Enregistrement…" : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={confirmId !== null}
        title="Confirmer la suppression"
        message="Cette action est définitive. Voulez-vous continuer ?"
        confirmLabel="Supprimer"
        onCancel={() => setConfirmId(null)}
        onConfirm={() => confirmId !== null && remove(confirmId)}
      />
    </div>
  );
}

export function FieldInput({
  field, draft, setDraft,
}: {
  field: FieldDef;
  draft: Record<string, unknown>;
  setDraft: (v: Record<string, unknown>) => void;
}) {
  const set = (v: unknown) => setDraft({ ...draft, [field.key]: v });
  const value = draft[field.key];
  const wide = field.full || ["textarea", "richtext", "image"].includes(field.type);

  return (
    <div className={wide ? "sm:col-span-2" : ""}>
      <label className="label" htmlFor={`f-${field.key}`}>
        {field.label} {field.required ? <span className="text-red-500">*</span> : null}
      </label>

      {field.type === "textarea" || field.type === "richtext" ? (
        <textarea
          id={`f-${field.key}`}
          rows={field.type === "richtext" ? 10 : 3}
          className="input"
          value={String(value ?? "")}
          onChange={(e) => set(e.target.value)}
        />
      ) : field.type === "bool" ? (
        <label className="flex items-center gap-2 py-2 text-sm text-slate-700">
          <input
            id={`f-${field.key}`}
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => set(e.target.checked)}
          />
          {field.help ?? "Activé"}
        </label>
      ) : field.type === "select" ? (
        <select id={`f-${field.key}`} className="input" value={String(value ?? "")} onChange={(e) => set(e.target.value)}>
          <option value="">—</option>
          {field.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : field.type === "image" ? (
        <MediaPicker value={String(value ?? "")} onChange={set} />
      ) : field.type === "tags" ? (
        <input
          id={`f-${field.key}`}
          className="input"
          value={Array.isArray(value) ? (value as string[]).join(", ") : String(value ?? "")}
          onChange={(e) => set(e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
          placeholder="Séparés par des virgules"
        />
      ) : field.type === "date" ? (
        <input
          id={`f-${field.key}`}
          type="datetime-local"
          className="input"
          value={value ? String(value).slice(0, 16) : ""}
          onChange={(e) => set(e.target.value)}
        />
      ) : (
        <input
          id={`f-${field.key}`}
          type={field.type === "number" ? "number" : "text"}
          className="input"
          value={value === null || value === undefined ? "" : String(value)}
          onChange={(e) => set(field.type === "number" ? e.target.value : e.target.value)}
        />
      )}

      {field.help && field.type !== "bool" ? (
        <p className="mt-1 text-xs text-slate-500">{field.help}</p>
      ) : null}
    </div>
  );
}

export { StatusBadge };
