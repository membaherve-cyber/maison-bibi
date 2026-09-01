"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { apiFetch, clearToken } from "@/lib/backoffice-client";
import { BuildingLoader } from "@/components/BuildingLoader";
import { ToastHost } from "./ui";

export type AdminSession = {
  id: number;
  username: string;
  name: string;
  role: "manager" | "admin" | "agent";
};

type Ctx = { session: AdminSession; permissions: string[]; can: (p: string) => boolean };
const AdminContext = createContext<Ctx | null>(null);

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used inside AdminShell");
  return ctx;
}

/** Navigation entries with the permission required to see them. */
const NAV = [
  { href: "/admin", label: "Tableau de bord", perm: "dashboard.view", icon: "▦" },
  { href: "/admin/proprietes", label: "Propriétés", perm: "properties.read", icon: "🏠" },
  { href: "/admin/categories", label: "Catégories", perm: "properties.read", icon: "🗂" },
  { href: "/admin/localisations", label: "Localisations", perm: "properties.read", icon: "📍" },
  { href: "/admin/services", label: "Services", perm: "services.read", icon: "🛠" },
  { href: "/admin/demandes", label: "Demandes", perm: "requests.read", icon: "📥" },
  { href: "/admin/rendez-vous", label: "Rendez-vous", perm: "appointments.read", icon: "📅" },
  { href: "/admin/clients", label: "Clients", perm: "customers.read", icon: "👥" },
  { href: "/admin/articles", label: "Articles", perm: "articles.read", icon: "📝" },
  { href: "/admin/galerie", label: "Galerie", perm: "gallery.read", icon: "🖼" },
  { href: "/admin/temoignages", label: "Témoignages", perm: "gallery.read", icon: "💬" },
  { href: "/admin/equipe", label: "Équipe", perm: "services.read", icon: "🧑‍💼" },
  { href: "/admin/accueil", label: "Accueil", perm: "properties.read", icon: "🏗" },
  { href: "/admin/mediatheque", label: "Médiathèque", perm: "media.read", icon: "📁" },
  { href: "/admin/seo", label: "SEO", perm: "properties.read", icon: "🔎" },
  { href: "/admin/assistant", label: "Assistant IA", perm: "ai.read", icon: "🤖" },
  { href: "/admin/utilisateurs", label: "Utilisateurs", perm: "users.read", icon: "🔐" },
  { href: "/admin/parametres", label: "Paramètres", perm: "properties.read", icon: "⚙️" },
  { href: "/admin/journal", label: "Journal d'activité", perm: "activity.read", icon: "🗒" },
];

const ROLE_LABEL: Record<string, string> = {
  manager: "Super Admin",
  admin: "Administration",
  agent: "Agent",
};

export function AdminShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState<Ctx | null>(null);
  const [ready, setReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await apiFetch("/api/auth/session");
      const data = await res.json().catch(() => ({ authenticated: false }));
      if (!data.authenticated) {
        router.replace("/connexion?session=expired");
        return;
      }
      const permissions: string[] = data.permissions ?? [];
      setState({
        session: data.user,
        permissions,
        can: (p: string) => permissions.includes(p),
      });
      setReady(true);
    })();
  }, [router]);

  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  const logout = async () => {
    await apiFetch("/api/auth/logout", { method: "POST" });
    clearToken();
    router.replace("/connexion");
  };

  if (!ready || !state) {
    return <BuildingLoader label="Chargement du backoffice…" fullscreen />;
  }

  const visible = NAV.filter((n) => state.permissions.includes(n.perm));

  return (
    <AdminContext.Provider value={state}>
      <div className="min-h-screen bg-slate-100 lg:flex">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 shrink-0 overflow-y-auto bg-slate-deep text-white transition-transform lg:static lg:translate-x-0 ${
            menuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-16 items-center gap-2 border-b border-white/10 px-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-mark.svg" alt="" className="h-8 w-8" />
            <span className="font-script text-xl">La Maison Bibi</span>
          </div>
          <nav aria-label="Navigation du backoffice" className="p-3">
            <ul className="space-y-0.5">
              {visible.map((item) => {
                const active =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                        active
                          ? "bg-gold text-slate-deep font-semibold"
                          : "text-white/75 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <span aria-hidden="true" className="w-5 text-center">{item.icon}</span>
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        {menuOpen ? (
          <div
            className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
        ) : null}

        {/* Main */}
        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 sm:px-6">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Ouvrir le menu"
              className="rounded-lg border border-slate-200 p-2 lg:hidden"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" aria-hidden="true">
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            </button>

            <div className="flex-1" />

            <Link href="/" target="_blank" className="hidden text-sm text-slate-500 hover:text-gold-dark sm:block">
              Voir le site ↗
            </Link>

            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen((v) => !v)}
                aria-expanded={profileOpen}
                className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-deep text-xs font-bold text-white">
                  {state.session.name.slice(0, 1).toUpperCase()}
                </span>
                <span className="hidden text-left sm:block">
                  <span className="block font-semibold leading-tight text-slate-deep">
                    {state.session.name}
                  </span>
                  <span className="block text-[11px] text-slate-500">
                    {ROLE_LABEL[state.session.role]}
                  </span>
                </span>
              </button>
              {profileOpen ? (
                <div className="absolute right-0 top-full mt-1 w-52 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
                  <div className="border-b border-slate-100 px-4 py-3 text-xs text-slate-500">
                    Connecté : <strong className="text-slate-deep">{state.session.username}</strong>
                  </div>
                  <Link href="/admin/profil" className="block px-4 py-2.5 text-sm hover:bg-slate-50">
                    Profil
                  </Link>
                  <Link href="/admin/profil" className="block px-4 py-2.5 text-sm hover:bg-slate-50">
                    Modifier le mot de passe
                  </Link>
                  <button
                    type="button"
                    onClick={logout}
                    className="block w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                  >
                    Déconnexion
                  </button>
                </div>
              ) : null}
            </div>
          </header>

          <main className="p-4 sm:p-6">{children}</main>
        </div>
      </div>
      <ToastHost />
    </AdminContext.Provider>
  );
}
