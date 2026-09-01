"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useI18n } from "@/lib/i18n";

const links = [
  { href: "/", key: "nav.home" },
  { href: "/proprietes", key: "nav.properties" },
  { href: "/proprietes?transaction=vente", key: "nav.sale" },
  { href: "/proprietes?transaction=location", key: "nav.rent" },
  { href: "/services", key: "nav.services" },
  { href: "/contact", key: "nav.contact" },
];

export function Header() {
  const { t } = useI18n();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 shadow-lg shadow-slate-900/10 backdrop-blur"
          : "bg-white"
      }`}
    >
      <div className="container-page flex h-20 items-center justify-between gap-4">
        <Logo />

        <nav
          aria-label="Navigation principale"
          className="hidden items-center gap-1 lg:flex"
        >
          {links.map((l) => {
            const active =
              l.href === "/"
                ? pathname === "/"
                : pathname.startsWith(l.href.split("?")[0]) &&
                  l.href.includes("?") === false;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`relative rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  active ? "text-bibi" : "text-black hover:text-bibi"
                }`}
              >
                {t(l.key)}
                <span
                  className={`absolute inset-x-3 -bottom-0.5 h-px origin-left scale-x-0 bg-gold transition-transform duration-300 ${
                    active ? "scale-x-100" : "group-hover:scale-x-100"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher tone="light" />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? t("nav.close") : t("nav.menu")}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-deep transition-colors hover:border-bibi hover:text-bibi lg:hidden"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              {open ? (
                <>
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </>
              ) : (
                <>
                  <path d="M3 6h18" />
                  <path d="M3 12h18" />
                  <path d="M3 18h18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      <div
        id="mobile-nav"
        className={`overflow-hidden border-t border-white/10 bg-white transition-[max-height] duration-300 lg:hidden ${
          open ? "max-h-96" : "max-h-0"
        }`}
      >
        <nav aria-label="Navigation mobile" className="container-page py-3">
          <ul className="flex flex-col">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="block border-b border-white/5 py-3 text-sm font-medium text-black transition-colors hover:text-bibi"
                >
                  {t(l.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
