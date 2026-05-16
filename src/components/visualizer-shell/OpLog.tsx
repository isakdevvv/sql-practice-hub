// --------------------------------------------------------------------------
// OpLog: monospace-liste med siste operasjoner, nyeste først.
// Bruker font-mono og setter en max-lengde for å unngå at lista vokser
// uendelig. Render-resultat (→ verdi) er valgfritt per entry.
// --------------------------------------------------------------------------

export interface OpLogEntry {
  op: string;
  code: string;
  result?: string;
}

export interface OpLogProps {
  entries: OpLogEntry[];
  /** Maks antall som vises. Default 6. */
  max?: number;
  /** Tittel på loggen. Default "Operasjons-logg (nyeste først)". */
  title?: string;
  /** Hvis bare en handful er nyttig: 1-indeksert nummerering fra totalt. */
  totalCount?: number;
}

export function OpLog({
  entries,
  max = 6,
  title = "Operasjons-logg (nyeste først)",
  totalCount,
}: OpLogProps) {
  if (entries.length === 0) return null;
  const visible = entries.slice(0, max);
  const baseNumber = totalCount ?? entries.length;

  return (
    <div className="px-4 py-3 border-t border-border bg-card">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
        {title}
      </div>
      <ol className="space-y-1 font-mono text-xs">
        {visible.map((entry, i) => (
          <li
            key={`${entry.op}-${i}`}
            className="flex items-baseline gap-3 text-foreground/90"
          >
            <span className="text-muted-foreground tabular-nums w-8 text-right">
              {baseNumber - i}.
            </span>
            <code className="flex-1 whitespace-pre-wrap break-all">{entry.code}</code>
            {entry.result !== undefined && (
              <span className="text-success shrink-0">→ {entry.result}</span>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
