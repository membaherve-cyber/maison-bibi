"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { apiFetch, saveToken } from "@/lib/backoffice-client";
import { Logo } from "./Logo";

const input =
  "w-full rounded-lg border border-slate-200 px-3.5 py-3 text-sm outline-none transition-colors focus:border-gold";
const label =
  "mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500";

export function LoginView() {
  const { t } = useI18n();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  // Explain why the user landed back here instead of failing silently.
  useEffect(() => {
    const reason = new URLSearchParams(window.location.search).get("session");
    if (reason === "expired") {
      setNotice("Votre session a expiré. Merci de vous reconnecter.");
    }
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        cache: "no-store",
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        token?: string;
      };

      if (!res.ok) {
        setError(data.error || "Identifiants incorrects.");
        return;
      }

      // Keep the signed token as a fallback for browsers that refuse cookies
      // inside an embedded frame.
      if (data.token) saveToken(data.token);

      // Confirm the session is actually usable before navigating. Retried once
      // because some browsers commit cookies slightly after the response.
      let stored = false;
      for (let attempt = 0; attempt < 2 && !stored; attempt++) {
        if (attempt) await new Promise((r) => setTimeout(r, 250));
        const check = await apiFetch("/api/auth/session");
        const session = (await check.json().catch(() => ({}))) as {
          authenticated?: boolean;
        };
        stored = Boolean(session.authenticated);
      }

      if (!stored) {
        setError(
          "Connexion validée, mais votre navigateur n'a pas conservé la session. Ouvrez le site dans un onglet à part (plutôt que dans un cadre intégré) ou autorisez les cookies, puis réessayez.",
        );
        return;
      }

      window.location.assign("/admin");
      return;
    } catch {
      setError("Connexion impossible. Réessayez.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="flex min-h-[75vh] items-center justify-center bg-sand px-4 py-16">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex justify-center rounded-xl bg-creamwhite py-4">
            <Logo showTagline={false} />
          </div>

          <h1 className="mt-6 text-center font-display text-2xl text-slate-deep">
            {t("login.title")}
          </h1>
          <p className="mt-1 text-center text-sm text-slate-500">
            Espace réservé à l&apos;équipe La Maison Bibi.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className={label} htmlFor="username">
                Identifiant
              </label>
              <input
                id="username"
                type="text"
                required
                autoComplete="username"
                placeholder="manager"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={input}
              />
            </div>

            <div>
              <label className={label} htmlFor="password">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={show ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${input} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  aria-label={
                    show ? "Masquer le mot de passe" : "Afficher le mot de passe"
                  }
                  className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition-colors hover:text-slate-deep"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    aria-hidden="true"
                  >
                    {show ? (
                      <>
                        <path d="M17.94 17.94A10.1 10.1 0 0 1 12 20c-7 0-11-8-11-8a18.4 18.4 0 0 1 5.06-5.94M9.9 4.24A9.1 9.1 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                        <path d="m1 1 22 22" />
                      </>
                    ) : (
                      <>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </>
                    )}
                  </svg>
                </button>
              </div>
            </div>

            {notice && !error ? (
              <p className="rounded-lg bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
                {notice}
              </p>
            ) : null}

            {error ? (
              <p
                role="alert"
                className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700"
              >
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-lg bg-slate-deep px-5 py-3 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-gold hover:text-slate-deep disabled:opacity-60"
            >
              {busy ? "Connexion…" : t("footer.login")}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-xs leading-relaxed text-slate-500">
          Accès réservé à l&apos;équipe La Maison Bibi. Vos autorisations dépendent
          de votre rôle : direction, administration ou agent.
          <br />
          Problème de connexion ? Contactez l&apos;administrateur du site.
        </p>
      </div>
    </section>
  );
}
