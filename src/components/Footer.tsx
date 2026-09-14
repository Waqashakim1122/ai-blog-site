import Link from "next/link";
import { CATEGORIES, FOOTER_LINKS, SITE_DESCRIPTION, SITE_NAME } from "@/lib/constants";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-2">
          <span className="text-lg font-bold tracking-tight">{SITE_NAME}</span>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">{SITE_DESCRIPTION}</p>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-foreground">Categories</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {CATEGORIES.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/category/${c.slug}`}
                  className="text-sm text-muted transition-colors hover:text-accent"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-foreground">Site</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {FOOTER_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-muted transition-colors hover:text-accent"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-border px-4 py-5 text-center text-xs text-muted sm:px-6">
        © {year} {SITE_NAME}. All rights reserved.
      </div>
    </footer>
  );
}
