import Link from "next/link";
import { LayoutDashboard, PlusCircle, Users, ExternalLink, LogOut } from "lucide-react";
import { logout } from "@/lib/actions/auth";
import { SITE_NAME } from "@/lib/constants";

export function AdminSidebar({
  role,
  name,
}: {
  role: "admin" | "author";
  name: string;
}) {
  const links = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/posts/new", label: "New Post", icon: PlusCircle },
    ...(role === "admin" ? [{ href: "/admin/authors", label: "Authors", icon: Users }] : []),
  ];

  return (
    <aside className="w-56 shrink-0">
      <div className="sticky top-24">
        <p className="mb-1 text-sm font-semibold text-foreground">{SITE_NAME}</p>
        <p className="mb-5 text-xs text-muted">
          Signed in as {name} ({role})
        </p>

        <nav className="flex flex-col gap-1" aria-label="Admin">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface"
              >
                <Icon size={16} />
                {link.label}
              </Link>
            );
          })}

          <Link
            href="/"
            target="_blank"
            className="mt-2 flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface"
          >
            <ExternalLink size={16} />
            View site
          </Link>

          <form action={logout}>
            <button
              type="submit"
              className="mt-1 flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm font-medium text-muted transition-colors hover:bg-surface"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </form>
        </nav>
      </div>
    </aside>
  );
}
