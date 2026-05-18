import { ArrowUpRight } from "lucide-react";
import type { LibraryItem } from "@/lib/library";
import { tagLabel } from "@/lib/library/tags";

export function LibraryCard({ item }: { item: LibraryItem }) {
  const Icon = item.Icon;
  return (
    <a
      href={item.href}
      className="group flex flex-col gap-2 rounded-xl border border-border bg-card p-4 transition-all hover:border-brand/60 hover:shadow-md hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-brand/10 text-brand">
          {Icon ? <Icon className="h-4 w-4" /> : null}
        </div>
        <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
      <div className="flex-1 space-y-1">
        <h3 className="text-sm font-semibold leading-tight">{item.title}</h3>
        {item.blurb && (
          <p className="text-xs text-muted-foreground leading-snug line-clamp-2">
            {item.blurb}
          </p>
        )}
      </div>
      {item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-1">
          {item.tags.slice(0, 3).map((t) => (
            <span
              key={t}
              className="rounded border border-border bg-muted/40 px-1.5 py-0.5 text-[10px] text-muted-foreground"
            >
              {tagLabel(t)}
            </span>
          ))}
        </div>
      )}
    </a>
  );
}
