"use client";

import { useEffect, useState, type ReactNode } from "react";

/* ------------------------------------------------------------- toasts */

type Toast = { id: number; message: string; tone: "success" | "error" };
let pushToast: ((message: string, tone?: "success" | "error") => void) | null = null;

export function toast(message: string, tone: "success" | "error" = "success") {
  pushToast?.(message, tone);
}

export function ToastHost() {
  const [items, setItems] = useState<Toast[]>([]);
  useEffect(() => {
    pushToast = (message, tone = "success") => {
      const id = Date.now() + Math.random();
      setItems((v) => [...v, { id, message, tone }]);
      setTimeout(() => setItems((v) => v.filter((t) => t.id !== id)), 4000);
    };
    return () => {
      pushToast = null;
    };
  }, []);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-4 right-4 z-[200] flex flex-col gap-2"
    >
      {items.map((t) => (
        <div
          key={t.id}
          role="status"
          className={`lmdb-pop pointer-events-auto rounded-lg px-4 py-3 text-sm font-medium shadow-lg ${
            t.tone === "error"
              ? "bg-red-600 text-white"
              : "bg-slate-deep text-white"
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------ confirm */

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirmer",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[190] flex items-center justify-center bg-slate-950/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onCancel}
    >
      <div
        className="lmdb-pop w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display text-xl text-slate-deep">{title}</h2>
        <p className="mt-2 text-sm text-slate-600">{message}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="btn-ghost">
            Annuler
          </button>
          <button type="button" onClick={onConfirm} className="btn-danger">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- states */

export function EmptyState({
  title = "Aucune donnée disponible pour le moment.",
  hint,
  action,
}: {
  title?: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8"
        strokeWidth="1.3" className="mx-auto" aria-hidden="true">
        <path d="M3 21V8l6-4 6 4v13" /><path d="M15 21V11l6 4v6" /><path d="M3 21h18" />
      </svg>
      <p className="mt-4 font-display text-lg text-slate-deep">{title}</p>
      {hint ? <p className="mt-1 text-sm text-slate-500">{hint}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2" aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="lmdb-shimmer relative h-14 overflow-hidden rounded-lg bg-slate-100"
        />
      ))}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
      <p className="font-semibold">Une erreur est survenue</p>
      <p className="mt-1">{message}</p>
      {onRetry ? (
        <button type="button" onClick={onRetry} className="btn-ghost mt-3">
          Réessayer
        </button>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------- badges */

export function StatusBadge({ value }: { value: string }) {
  const map: Record<string, string> = {
    published: "bg-green-100 text-green-800",
    publie: "bg-green-100 text-green-800",
    draft: "bg-slate-200 text-slate-700",
    brouillon: "bg-slate-200 text-slate-700",
    planifie: "bg-blue-100 text-blue-800",
    archive: "bg-amber-100 text-amber-800",
    disponible: "bg-green-100 text-green-800",
    "sous-offre": "bg-amber-100 text-amber-800",
    vendu: "bg-slate-800 text-white",
    loue: "bg-slate-800 text-white",
    nouvelle: "bg-blue-100 text-blue-800",
    contactee: "bg-indigo-100 text-indigo-800",
    qualifiee: "bg-violet-100 text-violet-800",
    "visite-planifiee": "bg-cyan-100 text-cyan-800",
    offre: "bg-amber-100 text-amber-800",
    convertie: "bg-green-100 text-green-800",
    terminee: "bg-slate-200 text-slate-700",
    annulee: "bg-red-100 text-red-800",
    demande: "bg-blue-100 text-blue-800",
    confirme: "bg-green-100 text-green-800",
    reporte: "bg-amber-100 text-amber-800",
  };
  const labels: Record<string, string> = {
    published: "Publié", publie: "Publié", draft: "Brouillon", brouillon: "Brouillon",
    planifie: "Planifié", archive: "Archivé", disponible: "Disponible",
    "sous-offre": "Sous offre", vendu: "Vendu", loue: "Loué",
    nouvelle: "Nouvelle", contactee: "Contactée", qualifiee: "Qualifiée",
    "visite-planifiee": "Visite planifiée", offre: "Offre", convertie: "Convertie",
    terminee: "Terminée", annulee: "Annulée", demande: "Demandé",
    confirme: "Confirmé", reporte: "Reporté",
  };
  return (
    <span className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold ${map[value] ?? "bg-slate-100 text-slate-600"}`}>
      {labels[value] ?? value}
    </span>
  );
}
