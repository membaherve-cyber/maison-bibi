"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { apiJson } from "@/lib/backoffice-client";
import { useAdmin } from "@/components/admin/AdminShell";
import { uploadImage } from "@/components/admin/MediaPicker";
import { ConfirmDialog, EmptyState, ErrorState, TableSkeleton, toast } from "@/components/admin/ui";

type MediaItem = {
  id: number; filename: string; url: string; thumbnailUrl: string;
  width: number; height: number; originalSize: number; optimizedSize: number;
  alt: string; folder: string; createdAt: string;
};

const kb = (n: number) => `${Math.round(n / 1024)} Ko`;

export default function MediaPage() {
  const { can } = useAdmin();
  const mayWrite = can("media.write");
  const mayDelete = can("media.delete");

  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { ok, data, error } = await apiJson<{ items: MediaItem[] }>("/api/media");
    if (ok) { setItems(data.items ?? []); setError(""); } else setError(error);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? items.filter((m) => `${m.filename} ${m.alt}`.toLowerCase().includes(q)) : items;
  }, [items, query]);

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    let done = 0;
    for (const file of Array.from(files)) {
      const r = await uploadImage(file, "general");
      if (r) done += 1;
    }
    setBusy(false);
    if (done) toast(`${done} image(s) optimisée(s) et ajoutée(s).`);
    load();
  };

  const remove = async (id: number) => {
    setConfirmId(null);
    const { ok, error } = await apiJson(`/api/media/${id}`, { method: "DELETE" });
    if (!ok) { toast(error, "error"); return; }
    toast("Média supprimé."); load();
  };

  return (
    <div>
      <h1 className="font-display text-2xl text-slate-deep sm:text-3xl">Médiathèque</h1>
      <p className="mt-1 text-sm text-slate-500">{filtered.length} fichier(s)</p>

      {mayWrite ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); upload(e.dataTransfer.files); }}
          className={`mt-5 rounded-xl border-2 border-dashed p-8 text-center transition-colors ${dragOver ? "border-gold bg-amber-50" : "border-slate-300 bg-white"}`}
        >
          <p className="text-sm text-slate-600">
            Glissez vos images ici, ou{" "}
            <button type="button" onClick={() => inputRef.current?.click()} className="font-semibold text-gold-dark underline-offset-2 hover:underline">
              parcourez vos fichiers
            </button>
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {busy ? "Téléversement et optimisation en cours…" : "JPG, PNG, WebP ou AVIF · conversion WebP et compression automatiques"}
          </p>
          <input ref={inputRef} type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif"
            className="hidden" onChange={(e) => upload(e.target.files)} />
        </div>
      ) : null}

      <input type="search" value={query} onChange={(e) => setQuery(e.target.value)}
        placeholder="Rechercher par nom de fichier…" aria-label="Rechercher" className="input mt-5 max-w-xs" />

      <div className="mt-4">
        {loading ? <TableSkeleton /> : error ? <ErrorState message={error} onRetry={load} /> :
          filtered.length === 0 ? <EmptyState title="Aucun média pour le moment." /> : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {filtered.map((m) => (
              <figure key={m.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.thumbnailUrl || m.url} alt={m.alt} loading="lazy" className="h-32 w-full object-cover" />
                <figcaption className="p-3 text-xs">
                  <p className="truncate font-semibold text-slate-deep">{m.filename}</p>
                  <p className="mt-1 text-slate-500">{m.width}×{m.height} · {kb(m.optimizedSize)}</p>
                  {m.originalSize > m.optimizedSize ? (
                    <p className="text-green-700">
                      −{Math.round((1 - m.optimizedSize / m.originalSize) * 100)} % vs {kb(m.originalSize)}
                    </p>
                  ) : null}
                  <div className="mt-2 flex gap-1.5">
                    <button type="button" onClick={() => { navigator.clipboard?.writeText(m.url); toast("URL copiée."); }} className="btn-ghost-sm">
                      Copier l&apos;URL
                    </button>
                    {mayDelete ? (
                      <button type="button" onClick={() => setConfirmId(m.id)} className="btn-danger-sm">Supprimer</button>
                    ) : null}
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog open={confirmId !== null} title="Supprimer ce média ?"
        message="Le fichier sera supprimé du serveur. Les contenus qui l'utilisent afficheront une image manquante."
        confirmLabel="Supprimer" onCancel={() => setConfirmId(null)}
        onConfirm={() => confirmId !== null && remove(confirmId)} />
    </div>
  );
}