import { cn } from "@/lib/utils";
import { CellText } from "./MiniTable";
import type { JoinResult } from "@/lib/learn/joinCompute";

export function JoinResultTable({ result }: { result: JoinResult }) {
  const { columns, rows } = result;
  return (
    <div className="rounded-lg border border-warning/40 bg-card overflow-hidden">
      <table className="w-full text-xs font-mono">
        <thead>
          <tr className="border-b border-border">
            {columns.map((col, i) => (
              <th
                key={i}
                className={cn(
                  "px-2.5 py-1.5 text-left font-semibold",
                  col.from === "left"
                    ? "bg-brand/15 text-brand"
                    : "bg-success/15 text-success",
                )}
              >
                {col.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={Math.max(1, columns.length)}
                className="px-2.5 py-4 text-center text-muted-foreground italic"
              >
                (ingen rader i resultatet)
              </td>
            </tr>
          ) : (
            rows.map((r, i) => (
              <tr key={i} className="border-b border-border/40 last:border-0">
                {r.cells.map((cell, j) => (
                  <td
                    key={j}
                    className={cn(
                      "px-2.5 py-1.5",
                      columns[j].from === "left"
                        ? "bg-brand/[0.04]"
                        : "bg-success/[0.04]",
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
  );
}
