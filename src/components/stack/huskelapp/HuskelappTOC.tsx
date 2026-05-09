import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export interface TOCEntry {
  id: string;
  number: number | string;
  title: string;
}

export function HuskelappTOC({
  entries,
  visibleIds,
}: {
  entries: TOCEntry[];
  /** Optional set of section ids currently visible (filtered) — TOC entries not in the set are dimmed. */
  visibleIds?: Set<string>;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const sections = entries
      .map((e) => document.getElementById(e.id))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (records) => {
        // Pick the entry with the smallest top that is at least visible.
        const visible = records
          .filter((r) => r.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        // Activate when a section's top is within the upper third of viewport.
        rootMargin: "-80px 0px -65% 0px",
        threshold: [0, 0.1, 0.5, 1],
      },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [entries]);

  return (
    <nav aria-label="Innholdsfortegnelse" className="text-sm">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-3">
        Innhold
      </div>
      <ul className="space-y-1 border-l border-border">
        {entries.map((e) => {
          const isActive = e.id === activeId;
          const isHidden = visibleIds ? !visibleIds.has(e.id) : false;
          return (
            <li key={e.id}>
              <a
                href={`#${e.id}`}
                className={cn(
                  "block pl-3 -ml-px border-l-2 py-1 transition-colors",
                  isActive
                    ? "border-brand text-foreground font-medium"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border",
                  isHidden && "opacity-30",
                )}
              >
                <span className="inline-block w-6 tabular-nums text-[11px] text-muted-foreground/70 mr-1">
                  {e.number}
                </span>
                {e.title}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
