// Renders documentation references next to an exercise prompt.
// Each entry is a clickable link to external docs, optionally with a
// short note and an inline code snippet so the user can grab the exact
// API call without leaving the page.

import { ExternalLink, BookOpen } from "lucide-react";
import type { DocRef } from "@/lib/docs";

interface DocsPanelProps {
  docs: DocRef[];
  /** Compact = smaller padding/font. Used inside the er-tegner sidebar. */
  compact?: boolean;
}

export function DocsPanel({ docs, compact = false }: DocsPanelProps) {
  if (!docs.length) return null;
  return (
    <section
      className={
        compact
          ? "rounded-md border border-border bg-muted/30 p-2.5 space-y-2"
          : "rounded-lg border border-border bg-muted/30 p-3 space-y-2.5"
      }
      aria-label="Dokumentasjon for denne oppgaven"
    >
      <div
        className={
          compact
            ? "flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground"
            : "flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground"
        }
      >
        <BookOpen className="h-3.5 w-3.5" />
        Dokumentasjon
      </div>
      <ul className={compact ? "space-y-1.5" : "space-y-2"}>
        {docs.map((d, i) => (
          <li key={i} className="space-y-1">
            <a
              href={d.url}
              target="_blank"
              rel="noopener noreferrer"
              className={
                compact
                  ? "inline-flex items-center gap-1 text-[11px] font-medium text-brand hover:underline"
                  : "inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"
              }
            >
              {d.title}
              <ExternalLink className="h-3 w-3" />
            </a>
            {d.note && (
              <div
                className={
                  compact
                    ? "text-[11px] text-muted-foreground leading-snug"
                    : "text-xs text-muted-foreground leading-snug"
                }
              >
                {d.note}
              </div>
            )}
            {d.snippet && (
              <pre
                className={
                  compact
                    ? "mt-1 rounded border border-border bg-background px-2 py-1.5 text-[10.5px] font-mono leading-snug overflow-x-auto"
                    : "mt-1 rounded border border-border bg-background px-2.5 py-2 text-xs font-mono leading-snug overflow-x-auto"
                }
              >
                {d.snippet}
              </pre>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
