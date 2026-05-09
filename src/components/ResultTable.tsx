import type { QueryResult } from "@/lib/engine/sqlEngine";

export function ResultTable({ result }: { result: QueryResult | null }) {
  if (!result) {
    return (
      <div className="text-sm text-muted-foreground p-6 text-center">
        Click Run to test your query, or Submit to grade it.
      </div>
    );
  }
  if (result.columns.length === 0) {
    return (
      <div className="flex h-full min-h-[120px] items-center justify-center text-sm text-muted-foreground">
        Query executed (no rows returned).
      </div>
    );
  }
  return (
    <div className="overflow-x-auto shadow-[inset_-8px_0_8px_-8px_rgba(0,0,0,0.1)]">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 sticky top-0">
          <tr>
            {result.columns.map((c) => (
              <th
                key={c}
                className="px-3 py-2 text-left font-semibold text-foreground border-b border-border whitespace-nowrap min-w-[80px]"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {result.rows.map((row, i) => (
            <tr key={i} className="border-b border-border/50 hover:bg-accent/30">
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-1.5 font-mono text-xs whitespace-nowrap min-w-[80px]">
                  {cell === null ? (
                    <span className="text-muted-foreground italic">NULL</span>
                  ) : (
                    String(cell)
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
