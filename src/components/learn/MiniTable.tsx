import { cn } from "@/lib/utils";
import type { Cell, VisualTable } from "@/lib/learn/types";

interface MiniTableProps {
  table: VisualTable;
  /** Highlight key column with this background tint. */
  highlightKey?: string;
  /** Row indices to render dimmed (unmatched). */
  dimRows?: Set<number>;
  /** Row indices to render with success tint (matched). */
  glowRows?: Set<number>;
  /** Optional label shown above the table. */
  caption?: string;
  /** Optional accent color for the table border. */
  accent?: "left" | "right" | "result";
}

const ACCENT_BORDER: Record<NonNullable<MiniTableProps["accent"]>, string> = {
  left: "border-brand/40",
  right: "border-success/40",
  result: "border-warning/40",
};

const ACCENT_HEADER_BG: Record<NonNullable<MiniTableProps["accent"]>, string> = {
  left: "bg-brand/15 text-brand",
  right: "bg-success/15 text-success",
  result: "bg-warning/15 text-warning",
};

export function MiniTable({
  table,
  highlightKey,
  dimRows,
  glowRows,
  caption,
  accent,
}: MiniTableProps) {
  const accentClass = accent ? ACCENT_BORDER[accent] : "border-border";
  const headerClass = accent ? ACCENT_HEADER_BG[accent] : "bg-muted/50 text-foreground/80";
  return (
    <div className="space-y-1.5">
      {caption ? (
        <div className={cn("text-xs font-medium font-mono", accent === "left" && "text-brand", accent === "right" && "text-success", accent === "result" && "text-warning")}>
          {caption}
        </div>
      ) : null}
      <div className={cn("rounded-lg border bg-card overflow-hidden", accentClass)}>
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className={cn("border-b border-border", headerClass)}>
              {table.columns.map((col) => (
                <th
                  key={col}
                  className={cn(
                    "px-2.5 py-1.5 text-left font-semibold",
                    highlightKey === col && "underline underline-offset-2",
                  )}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.length === 0 ? (
              <tr>
                <td
                  colSpan={Math.max(1, table.columns.length)}
                  className="px-2.5 py-3 text-center text-muted-foreground italic"
                >
                  (ingen rader)
                </td>
              </tr>
            ) : (
              table.rows.map((row, i) => (
                <tr
                  key={i}
                  className={cn(
                    "border-b border-border/40 last:border-0 transition-colors",
                    dimRows?.has(i) && "opacity-40",
                    glowRows?.has(i) && "bg-success/10",
                  )}
                >
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      className={cn(
                        "px-2.5 py-1.5",
                        highlightKey && table.columns[j] === highlightKey && "bg-foreground/[0.04]",
                      )}
                    >
                      <CellText value={cell} />
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function CellText({ value }: { value: Cell }) {
  if (value === null) {
    return (
      <span className="rounded bg-destructive/15 text-destructive px-1.5 py-0.5 text-[10px] font-semibold">
        NULL
      </span>
    );
  }
  return <span>{String(value)}</span>;
}
