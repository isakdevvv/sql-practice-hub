import { ArrowUpRight } from "lucide-react";
import type { LibraryItem } from "@/lib/library";
import { tagLabel } from "@/lib/library/tags";
import { topicHue } from "@/lib/library/topics";

const KIND_LABEL: Record<LibraryItem["kind"], string> = {
  lek: "Lek",
  laer: "Lær",
  test: "Test",
};

export function LibraryCard({ item }: { item: LibraryItem }) {
  const Icon = item.Icon;
  const hue = topicHue(item.tags);

  return (
    <a
      href={item.href}
      style={{ "--topic-h": hue } as React.CSSProperties}
      className="group relative flex flex-col gap-2 overflow-hidden rounded-xl border border-border bg-card p-4 pt-5 transition-all hover:-translate-y-0.5 hover:border-[oklch(0.6_0.14_var(--topic-h))] hover:shadow-md"
    >
      {/* Fargestripe = tema. Gjør at rutenettet leses som grupper på avstand. */}
      <span className="absolute inset-x-0 top-0 h-1 bg-[oklch(0.65_0.15_var(--topic-h))] opacity-70 transition-opacity group-hover:opacity-100" />

      <div className="flex items-start justify-between gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[oklch(0.95_0.045_var(--topic-h))] text-[oklch(0.5_0.15_var(--topic-h))] dark:bg-[oklch(0.3_0.06_var(--topic-h))] dark:text-[oklch(0.8_0.13_var(--topic-h))]">
          {Icon ? <Icon className="h-4 w-4" /> : null}
        </div>
        <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          {KIND_LABEL[item.kind]}
        </span>
      </div>

      <div className="flex-1 space-y-1">
        <h3 className="text-[15px] font-semibold leading-tight transition-colors group-hover:text-[oklch(0.5_0.15_var(--topic-h))] dark:group-hover:text-[oklch(0.8_0.13_var(--topic-h))]">
          {item.title}
        </h3>
        {item.blurb && (
          <p className="text-xs text-muted-foreground leading-snug line-clamp-2">{item.blurb}</p>
        )}
      </div>

      <div className="flex items-end justify-between gap-2 pt-1">
        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {item.tags.slice(0, 3).map((t, i) => (
              <span
                key={t}
                className={
                  i === 0
                    ? "rounded border border-[oklch(0.85_0.07_var(--topic-h))] bg-[oklch(0.96_0.035_var(--topic-h))] px-1.5 py-0.5 text-[10px] font-medium text-[oklch(0.45_0.14_var(--topic-h))] dark:border-[oklch(0.4_0.07_var(--topic-h))] dark:bg-[oklch(0.28_0.05_var(--topic-h))] dark:text-[oklch(0.82_0.12_var(--topic-h))]"
                    : "rounded border border-border bg-muted/40 px-1.5 py-0.5 text-[10px] text-muted-foreground"
                }
              >
                {tagLabel(t)}
              </span>
            ))}
          </div>
        )}
        {/* Alltid synlig pil — kortet skal se klikkbart ut før musa er der. */}
        <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-50 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[oklch(0.5_0.15_var(--topic-h))] group-hover:opacity-100 dark:group-hover:text-[oklch(0.8_0.13_var(--topic-h))]" />
      </div>
    </a>
  );
}
