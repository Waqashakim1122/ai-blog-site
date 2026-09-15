import { CheckCircle2, XCircle } from "lucide-react";
import type { SeoChecklistResult } from "@/lib/seo-checklist";

export function SeoChecklistPanel({ result }: { result: SeoChecklistResult }) {
  return (
    <div className="rounded-lg border border-border p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold">SEO checklist</h2>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            result.passes
              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
              : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
          }`}
        >
          {result.score}/100
        </span>
      </div>

      <ul className="flex flex-col gap-2">
        {result.items.map((item) => (
          <li key={item.id} className="flex items-start gap-2 text-sm">
            {item.passed ? (
              <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-500" aria-hidden="true" />
            ) : (
              <XCircle size={16} className="mt-0.5 shrink-0 text-red-500" aria-hidden="true" />
            )}
            <span className={item.passed ? "text-muted" : "text-foreground"}>{item.label}</span>
          </li>
        ))}
      </ul>

      <p className="mt-3 text-xs text-muted">
        {result.passes
          ? "All checks pass — this post is ready to publish."
          : `${result.passedCount}/${result.totalCount} checks pass. Every item must pass to publish automatically.`}
      </p>
    </div>
  );
}
