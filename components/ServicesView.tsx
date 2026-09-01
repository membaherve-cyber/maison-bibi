"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { PageIntro } from "./PageIntro";
import { IconArrowRight, IconCheck } from "./icons";

const services = [
  { key: "sale", icon: "🏷️" },
  { key: "rent", icon: "🔑" },
  { key: "management", icon: "📋" },
  { key: "advisory", icon: "📈" },
  { key: "legal", icon: "⚖️" },
  { key: "visit", icon: "🎥" },
];

export function ServicesView() {
  const { t } = useI18n();

  return (
    <>
      <PageIntro
        eyebrowKey="nav.services"
        titleKey="services.title"
        subtitleKey="section.servicesSub"
      />

      <section className="container-page py-14 sm:py-16">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <div
              key={s.key}
              className="rounded-2xl border border-slate-200 bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-gold/50 hover:shadow-[0_18px_40px_-24px_rgba(15,23,42,0.4)]"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-sand text-2xl">
                {s.icon}
              </span>
              <h2 className="mt-5 font-display text-xl text-slate-deep">
                {t(`services.${s.key}`)}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                {t(`services.${s.key}Text`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-bibi py-14 text-white sm:py-16">
        <div className="container-page grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl">{t("section.why")}</h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/70">
              {t("footer.about")}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/proprietes"
                className="inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-3 text-sm font-bold uppercase tracking-wide text-slate-deep transition-colors hover:bg-white"
              >
                {t("section.viewAll")}
                <IconArrowRight size={16} />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-lg border border-white/25 px-5 py-3 text-sm font-semibold text-white transition-colors hover:border-gold hover:text-gold"
              >
                {t("nav.contact")}
              </Link>
            </div>
          </div>
          <ul className="space-y-4">
            {["local", "verified", "service"].map((k) => (
              <li
                key={k}
                className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-5"
              >
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold text-slate-deep">
                  <IconCheck size={18} />
                </span>
                <div>
                  <h3 className="font-display text-lg">{t(`why.${k}`)}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-white/70">
                    {t(`why.${k}Text`)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
