import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-wide text-accent">404</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight">Page not found</h1>
      <p className="mt-3 text-muted">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href="/"
          className="rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
        >
          Go home
        </Link>
        <Link
          href="/blog"
          className="rounded-md border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-surface"
        >
          Browse articles
        </Link>
      </div>
    </div>
  );
}
