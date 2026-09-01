"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiJson } from "@/lib/backoffice-client";
import { useAdmin } from "@/components/admin/AdminShell";
import { EmptyState, ErrorState, TableSkeleton } from "@/components/admin/ui";

type Stats = {
  scope: string;
  properties: { total: number; published: number; draft: number; disponible: number; vendu: number; loue: number; views: number };
  requests: { total: number; nouvelles: number; enCours: number; converties: number };
  appointments: { total: number; aVenir: number };
  articles: { total: number; publies: number; brouillons: number };
  customers: number;
  media: number;
  engagement: { whatsapp: number; phone: number; propertyView: number };
  trend: { day: string; total: number }[];
  activity: { id: number; username: string; action: string; resource: string; detail: string; createdAt: string }[];
};

const ACTIONS: Record<string, string> = {
  login: "Connexion", create: "Création", update: "Modification",
  delete: "Suppression", upload: "Téléversement",
};

export default function DashboardPage() {
  const { session, can } = useAdmin();
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    apiJson<Stats>("/api/dashboard").then(({ ok, data, error }) => {
      if (ok) { setStats(data); setError(""); } else setError(error);
      setLoading(false);
    });
  };
  useEffect(load, []);

  if (loading) return <TableSkeleton rows={6} />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!stats) return <EmptyState />;

  const isAgent = session.role === "agent";
  const maxTrend = Math.max(1, ...stats.trend.map((t) => t.total));

  const cards = [
    { label: "Propriétés publiées", value: stats.properties.published, sub: `${stats.properties.total} au total`, show: !isAgent },
    { label: "Disponibles", value: stats.properties.disponible, show: !isAgent },
    { label: "Vendues", value: stats.properties.vendu, show: !isAgent },
    { label: "Louées", value: stats.properties.loue, show: !isAgent },
    { label: "Nouvelles demandes", value: stats.requests.nouvelles, sub: `${stats.requests.enCours} en cours`, show: true },
    { label: "Rendez-vous à venir", value: stats.appointments.aVenir, show: true },
    { label: "Clients", value: stats.customers, show: true },
    { label: "Articles publiés", value: stats.articles.publies, show: !isAgent },
    { label: "Vues des propriétés", value: stats.engagement.propertyView, show: !isAgent },
    { label: "Clics WhatsApp", value: stats.engagement.whatsapp, show: !isAgent },
    { label: "Appels", value: stats.engagement.phone, show: !isAgent },
    { label: "Médias", value: stats.media, show: !isAgent },
  ].filter((c) => c.show);

  const quick = [
    { href: "/admin/proprietes", label: "Ajouter une propriété", perm: "properties.write" },
    { href: "/admin/mediatheque", label: "Ajouter une image", perm: "media.write" },
    { href: "/admin/articles", label: "Ajouter un article", perm: "articles.write" },
    { href: "/admin/services", label: "Ajouter un service", perm: "services.write" },
    { href: "/admin/demandes", label: "Voir les demandes", perm: "requests.read" },
    { href: "/admin/utilisateurs", label: "Ajouter un utilisateur", perm: "users.write" },
  ].filter((q) => can(q.perm));

  return (
    <div>
      <h1 className="font-display text-2xl text-slate-deep sm:text-3xl">Tableau de bord</h1>
      <p className="mt-1 text-sm text-slate-500">
        Bonjour {session.name}.{" "}
        {isAgent ? "Voici vos dossiers assignés." : "Voici l'activité de La Maison Bibi."}
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="card">
            <p className="text-xs uppercase tracking-wide text-slate-500">{c.label}</p>
            <p className="mt-2 font-display text-3xl text-slate-deep">{c.value}</p>
            {c.sub ? <p className="mt-1 text-xs text-slate-400">{c.sub}</p> : null}
          </div>
        ))}
      </div>

      {quick.length ? (
        <div className="mt-6 flex flex-wrap gap-2">
          {quick.map((q) => (
            <Link key={q.href} href={q.href} className="btn-ghost">{q.label}</Link>
          ))}
        </div>
      ) : null}

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <div className="card">
          <h2 className="font-display text-lg text-slate-deep">Demandes sur 14 jours</h2>
          {stats.trend.every((t) => t.total === 0) ? (
            <p className="mt-6 text-sm text-slate-500">Aucune donnée disponible pour le moment.</p>
          ) : (
            <div className="mt-5 flex h-40 items-end gap-1.5">
              {stats.trend.map((t) => (
                <div key={t.day} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t bg-gold transition-all"
                    style={{ height: `${Math.max(4, (t.total / maxTrend) * 100)}%` }}
                    title={`${t.day} : ${t.total}`}
                  />
                  <span className="text-[9px] text-slate-400">{t.day.slice(8)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="font-display text-lg text-slate-deep">Activité récente</h2>
          {stats.activity.length === 0 ? (
            <p className="mt-6 text-sm text-slate-500">Aucune donnée disponible pour le moment.</p>
          ) : (
            <ul className="mt-4 space-y-2.5">
              {stats.activity.map((a) => (
                <li key={a.id} className="flex items-start justify-between gap-3 border-b border-slate-50 pb-2 text-sm last:border-0">
                  <span className="text-slate-600">
                    <strong className="text-slate-deep">{a.username || "système"}</strong>{" "}
                    — {ACTIONS[a.action] ?? a.action} {a.resource}
                    {a.detail ? <span className="text-slate-400"> · {a.detail.slice(0, 40)}</span> : null}
                  </span>
                  <span className="shrink-0 text-xs text-slate-400">
                    {new Date(a.createdAt).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
