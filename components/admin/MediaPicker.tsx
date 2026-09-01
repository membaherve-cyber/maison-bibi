"use client";

import { useEffect, useRef, useState } from "react";
import { apiFetch, apiJson } from "@/lib/backoffice-client";
import { toast } from "./ui";

type MediaItem = {
  id: number;
  url: string;
  thumbnailUrl: string;
  filename: string;
  width: number;
  height: number;
  alt: string;
};

type Optimization = {
  originalSize: number;
  optimizedSize: number;
  savedPercent: number;
  originalDimensions: string;
  optimizedDimensions: string;
  format: string;
};

const kb = (n: number) => `${Math.round(n / 1024)} Ko`;

/** Uploads a file and returns the stored URL, or null on failure. */
export async function uploadImage(
  file: File,
  folder = "general",
): Promise<{ url: string; optimization: Optimization } | null> {
  const body = new FormData();
  body.append("file", file);
  body.append("folder", folder);
  const res = await apiFetch("/api/media", { method: "POST", body });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    toast(data.error || "Téléversement impossible.", "error");
    return null;
  }
  return { url: data.item.url, optimization: data.optimization };
}

export function MediaPicker({
  value,
  onChange,
  folder = "general",
}: {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState<Optimization | null>(null);
  const [browsing, setBrowsing] = useState(false);
  const [library, setLibrary] = useState<MediaItem[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    setBusy(true);
    const result = await uploadImage(file, folder);
    setBusy(false);
    if (result) {
      onChange(result.url);
      setInfo(result.optimization);
      toast("Image optimisée et téléversée.");
    }
  };

  useEffect(() => {
    if (!browsing) return;
    apiJson<{ items: MediaItem[] }>("/api/media").then(({ data }) =>
      setLibrary(data.items ?? []),
    );
  }, [browsing]);

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        className={`flex items-center gap-4 rounded-xl border-2 border-dashed p-3 transition-colors ${
          dragOver ? "border-gold bg-amber-50" : "border-slate-300 bg-slate-50"
        }`}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="h-20 w-28 shrink-0 rounded-lg object-cover" />
        ) : (
          <div className="flex h-20 w-28 shrink-0 items-center justify-center rounded-lg bg-slate-200 text-2xl">
            🖼
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className="text-sm text-slate-600">
            Glissez une image ici, ou{" "}
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="font-semibold text-gold-dark underline-offset-2 hover:underline"
            >
              parcourir
            </button>{" "}
            ·{" "}
            <button
              type="button"
              onClick={() => setBrowsing(true)}
              className="font-semibold text-gold-dark underline-offset-2 hover:underline"
            >
              médiathèque
            </button>
          </p>
          {busy ? (
            <p className="mt-1 text-xs text-slate-500">Téléversement et optimisation…</p>
          ) : info ? (
            <p className="mt-1 text-xs text-green-700">
              Image optimisée · {info.format} · {info.optimizedDimensions} ·{" "}
              {kb(info.originalSize)} → {kb(info.optimizedSize)} (−{info.savedPercent} %)
            </p>
          ) : (
            <p className="mt-1 text-xs text-slate-500">JPG, PNG, WebP ou AVIF · optimisation automatique</p>
          )}
          {value ? (
            <div className="mt-1 flex gap-3">
              <input
                className="w-full rounded border border-slate-200 px-2 py-1 text-xs"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                aria-label="URL de l'image"
              />
              <button type="button" onClick={() => { onChange(""); setInfo(null); }}
                className="shrink-0 text-xs text-red-600">
                Retirer
              </button>
            </div>
          ) : null}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {browsing ? (
        <div
          className="fixed inset-0 z-[170] overflow-y-auto bg-slate-950/60 p-4"
          role="dialog" aria-modal="true" aria-label="Médiathèque"
          onClick={() => setBrowsing(false)}
        >
          <div
            className="lmdb-pop mx-auto my-6 w-full max-w-4xl rounded-2xl bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl text-slate-deep">Médiathèque</h3>
              <button type="button" onClick={() => setBrowsing(false)} className="btn-ghost-sm">
                Fermer
              </button>
            </div>
            {library.length === 0 ? (
              <p className="mt-6 text-sm text-slate-500">
                Aucune image dans la médiathèque pour le moment.
              </p>
            ) : (
              <div className="mt-5 grid max-h-[60vh] grid-cols-3 gap-3 overflow-y-auto sm:grid-cols-5">
                {library.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => { onChange(m.url); setBrowsing(false); }}
                    className="overflow-hidden rounded-lg border-2 border-transparent hover:border-gold"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={m.thumbnailUrl || m.url} alt={m.alt} className="h-24 w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

/** Multi-image manager used by the property editor. */
export function GalleryEditor({
  images,
  onChange,
  folder = "properties",
}: {
  images: string[];
  onChange: (v: string[]) => void;
  folder?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    const added: string[] = [];
    for (const file of Array.from(files)) {
      const result = await uploadImage(file, folder);
      // Never let the same file be added twice to one property.
      if (result && !images.includes(result.url) && !added.includes(result.url)) {
        added.push(result.url);
      }
    }
    setBusy(false);
    if (added.length) {
      onChange([...images, ...added]);
      toast(`${added.length} image(s) optimisée(s) et ajoutée(s).`);
    }
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return;
    const next = [...images];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
        className={`rounded-xl border-2 border-dashed p-4 text-center transition-colors ${
          dragOver ? "border-gold bg-amber-50" : "border-slate-300 bg-slate-50"
        }`}
      >
        <p className="text-sm text-slate-600">
          Glissez vos photos ici, ou{" "}
          <button type="button" onClick={() => inputRef.current?.click()}
            className="font-semibold text-gold-dark underline-offset-2 hover:underline">
            sélectionnez des fichiers
          </button>
        </p>
        <p className="mt-1 text-xs text-slate-500">
          {busy ? "Téléversement et optimisation en cours…" : "3 photos minimum recommandées · optimisation automatique"}
        </p>
        <input
          ref={inputRef} type="file" multiple
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {images.length ? (
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {images.map((url, i) => (
            <li key={url} className="relative overflow-hidden rounded-lg border border-slate-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-24 w-full object-cover" />
              {i === 0 ? (
                <span className="absolute left-1 top-1 rounded bg-gold px-1.5 py-0.5 text-[10px] font-bold text-slate-deep">
                  Principale
                </span>
              ) : null}
              <div className="flex items-center justify-between bg-white px-1 py-1">
                <div className="flex gap-0.5">
                  <button type="button" onClick={() => move(i, i - 1)} aria-label="Déplacer à gauche"
                    className="rounded px-1.5 text-xs hover:bg-slate-100">←</button>
                  <button type="button" onClick={() => move(i, i + 1)} aria-label="Déplacer à droite"
                    className="rounded px-1.5 text-xs hover:bg-slate-100">→</button>
                  {i !== 0 ? (
                    <button type="button" onClick={() => move(i, 0)} title="Définir comme principale"
                      className="rounded px-1.5 text-xs hover:bg-slate-100">★</button>
                  ) : null}
                </div>
                <button type="button" onClick={() => onChange(images.filter((u) => u !== url))}
                  aria-label="Supprimer l'image" className="rounded px-1.5 text-xs text-red-600 hover:bg-red-50">
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
