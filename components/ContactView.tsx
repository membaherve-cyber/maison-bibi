"use client";

import { useI18n } from "@/lib/i18n";
import { PageIntro } from "./PageIntro";
import { ContactForm } from "./ContactForm";
import { IconPhone, IconPin, IconWhatsapp } from "./icons";
import { site, telHref, whatsappHref } from "@/lib/site";

export function ContactView() {
  const { t } = useI18n();

  return (
    <>
      <PageIntro
        eyebrowKey="nav.contact"
        titleKey="contact.title"
        subtitleKey="contact.subtitle"
      />

      <section className="container-page grid gap-10 py-14 lg:grid-cols-[1fr_1.2fr] sm:py-16">
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="font-display text-xl text-slate-deep">
              {t("footer.contact")}
            </h2>
            <span className="mt-2 block h-px w-12 bg-gold" />
            <ul className="mt-5 space-y-3 text-sm">
              {site.emails.map((email) => (
                <li key={email}>
                  <a
                    href={`mailto:${email}`}
                    className="flex items-center gap-3 text-slate-700 transition-colors hover:text-gold-dark"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sand">
                      @
                    </span>
                    {email}
                  </a>
                </li>
              ))}
              {site.phones.map((p) => (
                <li key={p}>
                  <a
                    href={telHref(p)}
                    className="flex items-center gap-3 text-slate-700 transition-colors hover:text-gold-dark"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sand">
                      <IconPhone size={16} />
                    </span>
                    {p}
                  </a>
                </li>
              ))}
              <li className="flex items-center gap-3 text-slate-700">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sand">
                  <IconPin size={16} />
                </span>
                {site.city}
              </li>
            </ul>

            <p className="mt-5 text-xs uppercase tracking-wide text-slate-500">
              {t("contact.hours")}
            </p>

            <a
              href={whatsappHref(
                "Bonjour La Maison Bibi, je souhaite échanger sur un projet immobilier.",
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 py-3 text-sm font-bold text-slate-900 transition-transform hover:-translate-y-0.5"
            >
              <IconWhatsapp size={18} /> WhatsApp
            </a>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <h2 className="font-display text-xl text-slate-deep">
            {t("contact.form")}
          </h2>
          <span className="mt-2 mb-6 block h-px w-12 bg-gold" />
          <ContactForm />
        </div>
      </section>
    </>
  );
}
