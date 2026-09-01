import Link from "next/link";

export function Logo({
  showTagline = true,
  className = "",
}: {
  showTagline?: boolean;
  className?: string;
}) {
  return (
    <Link
      href="/"
      aria-label="La Maison Bibi — accueil"
      className={`group flex items-center gap-3 ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-bibi-transparent.png"
        alt="La Maison Bibi — Vous servir est notre challenge"
        width={280}
        height={180}
        className="h-16 w-auto shrink-0 object-contain object-left transition-transform duration-300 group-hover:scale-[1.02] sm:h-[72px]"
      />
    </Link>
  );
}
