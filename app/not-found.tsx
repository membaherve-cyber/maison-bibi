import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <svg width="90" height="70" viewBox="0 0 96 72" aria-hidden="true">
        <rect x="6" y="36" width="12" height="26" rx="2" fill="#0f172a" />
        <rect x="22" y="22" width="14" height="40" rx="2" fill="#0f172a" />
        <rect x="40" y="8" width="16" height="54" rx="2" fill="#d4af37" />
        <rect x="60" y="26" width="14" height="36" rx="2" fill="#0f172a" />
        <rect x="78" y="16" width="12" height="46" rx="2" fill="#0f172a" />
        <rect x="0" y="62" width="96" height="5" rx="2.5" fill="#d4af37" />
      </svg>
      <h1 className="mt-6 font-display text-4xl text-slate-deep">Page introuvable</h1>
      <p className="mt-3 max-w-md text-sm text-slate-500">
        La page que vous recherchez n&apos;existe pas ou a été déplacée. Découvrez nos
        propriétés disponibles à Douala et au Cameroun.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-lg bg-slate-deep px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-gold hover:text-slate-deep"
        >
          Accueil
        </Link>
        <Link
          href="/proprietes"
          className="rounded-lg border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-deep transition-colors hover:border-gold"
        >
          Voir les propriétés
        </Link>
      </div>
    </section>
  );
}
