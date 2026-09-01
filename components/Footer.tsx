"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { Logo } from "./Logo";
import { site, telHref, whatsappHref } from "@/lib/site";

const IconWhatsapp = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15s-.77.96-.94 1.16-.35.22-.65.07a8.2 8.2 0 0 1-2.4-1.48 9 9 0 0 1-1.66-2.06c-.17-.3 0-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47s1.07 2.86 1.22 3.06c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.7h-.01a9.6 9.6 0 0 1-4.88-1.34l-.35-.2-3.63.95.97-3.54-.23-.36a9.58 9.58 0 0 1-1.47-5.11 9.62 9.62 0 0 1 16.43-6.8 9.55 9.55 0 0 1 2.82 6.81 9.62 9.62 0 0 1-9.65 9.6M20.5 3.49A11.55 11.55 0 0 0 12.05 0C5.64 0 .42 5.21.42 11.62c0 2.05.53 4.05 1.55 5.81L.32 24l6.72-1.76a11.6 11.6 0 0 0 5.01 1.2h.01c6.4 0 11.62-5.21 11.62-11.62 0-3.1-1.2-6.02-3.4-8.21" />
  </svg>
);

export function Footer() {
  const { t } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 bg-sand text-slate-deep">
      <div className="container-page grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo showTagline={false} />
          <p className="mt-4 font-script text-xl text-gold">{t("footer.tagline")}</p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-deep/70">
            {t("footer.about")}
          </p>
        </div>

        <div>
          <h2 className="font-display text-lg text-slate-deep">{t("footer.navigation")}</h2>
          <span className="mt-2 block h-px w-10 bg-gold" />
          <ul className="mt-4 space-y-2.5 text-sm text-slate-deep/70">
            {[
              { href: "/", label: t("nav.home") },
              { href: "/proprietes", label: t("nav.properties") },
              { href: "/proprietes?transaction=vente", label: t("nav.sale") },
              { href: "/proprietes?transaction=location", label: t("nav.rent") },
              { href: "/services", label: t("nav.services") },
              { href: "/contact", label: t("nav.contact") },
            ].map((l) => (
              <li key={l.label}>
                <Link
                  href={l.href}
                  className="transition-colors hover:text-bibi"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-display text-lg text-slate-deep">{t("footer.contact")}</h2>
          <span className="mt-2 block h-px w-10 bg-gold" />
          <ul className="mt-4 space-y-2.5 text-sm text-slate-deep/70">
            {site.emails.map((email) => (
              <li key={email}>
                <a
                  href={`mailto:${email}`}
                  className="transition-colors hover:text-bibi"
                >
                  {email}
                </a>
              </li>
            ))}
            {site.phones.map((p) => (
              <li key={p}>
                <a href={telHref(p)} className="transition-colors hover:text-bibi">
                  {p}
                </a>
              </li>
            ))}
            <li className="text-slate-deep/50">{site.city}</li>
          </ul>

          <div className="mt-5 flex flex-wrap gap-2">
            <a
              href={whatsappHref(
                "Bonjour La Maison Bibi, je souhaite être accompagné(e) dans mon projet immobilier.",
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-3.5 py-2 text-sm font-semibold text-slate-900 transition-transform hover:-translate-y-0.5"
            >
              <IconWhatsapp /> WhatsApp
            </a>
            <a
              href={telHref(site.phones[0])}
              className="inline-flex items-center gap-2 rounded-lg border border-gold/60 px-3.5 py-2 text-sm font-semibold text-gold transition-colors hover:bg-gold hover:text-slate-deep"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              {t("prop.call")}
            </a>
          </div>
        </div>

        <div>
          <h2 className="font-display text-lg text-slate-deep">{t("footer.backoffice")}</h2>
          <span className="mt-2 block h-px w-10 bg-gold" />
          <p className="mt-4 text-sm text-slate-deep/60">
            {t("footer.contact")} · {t("footer.backoffice")}
          </p>
          <Link
            href="/connexion"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-bibi px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-bibi-2"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            {t("footer.login")}
          </Link>
        </div>
      </div>

      <div className="border-t border-slate-200">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-slate-deep/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.name}. {t("footer.rights")}
          </p>
          <p>Douala · Bonapriso · Bonanjo · Akwa · Bonabéri · Yassa · Yaoundé</p>
        </div>
      </div>
    </footer>
  );
}
