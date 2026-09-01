"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { BackButton } from "./BackButton";

export function PageIntro({
  eyebrowKey,
  titleKey,
  subtitleKey,
  showBack = false,
  backFallback = "/",
}: {
  eyebrowKey: string;
  titleKey: string;
  subtitleKey?: string;
  showBack?: boolean;
  backFallback?: string;
}) {
  const { t } = useI18n();
  return (
    <section className="border-b border-slate-100 bg-sand">
      <div className="container-page py-10 sm:py-14">
        <nav aria-label="Fil d'Ariane" className="text-xs text-slate-500">
          <Link href="/" className="transition-colors hover:text-gold-dark">
            {t("common.home")}
          </Link>
          <span className="mx-2 text-slate-300">/</span>
          <span className="text-slate-700">{t(eyebrowKey)}</span>
        </nav>

        {showBack ? (
          <div className="mt-4">
            <BackButton fallback={backFallback} />
          </div>
        ) : null}

        <h1 className="mt-4 font-display text-3xl text-slate-deep sm:text-4xl">
          {t(titleKey)}
        </h1>
        {subtitleKey ? (
          <p className="mt-2 max-w-2xl text-sm text-slate-500">{t(subtitleKey)}</p>
        ) : null}
      </div>
    </section>
  );
}
