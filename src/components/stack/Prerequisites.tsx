import { Link } from "@tanstack/react-router";
import type { Prerequisite } from "@/lib/stack/types";

export function Prerequisites({ items }: { items: Prerequisite[] }) {
  if (items.length === 0) return null;
  return (
    <div className="rounded-lg border border-border bg-amber-500/5 p-4 mb-8">
      <div className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-2">
        Du bør forstå dette først
      </div>
      <ul className="space-y-1">
        {items.map((p) => (
          <li key={p.slug}>
            <Link
              to="/stack/$slug"
              params={{ slug: p.slug }}
              className="text-sm text-foreground hover:underline"
            >
              → {p.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
