import type { QueryResult, ExplainReport } from "@/lib/engine/sqlEngine";
import { AlertTriangle, Info } from "lucide-react";

function rowKey(row: unknown[]): string {
  return JSON.stringify(row.map((v) => (v === null ? null : String(v))));
}

interface DiffPanelProps {
  expected: QueryResult;
  actual: QueryResult;
  ignoreOrder?: boolean;
}

export function ResultDiff({ expected, actual, ignoreOrder = true }: DiffPanelProps) {
  const expectedKeys = new Set(expected.rows.map(rowKey));
  const actualKeys = new Set(actual.rows.map(rowKey));

  const missing = expected.rows.filter((r) => !actualKeys.has(rowKey(r)));
  const extra = actual.rows.filter((r) => !expectedKeys.has(rowKey(r)));

  // Column diff
  const colsMatch =
    expected.columns.length === actual.columns.length &&
    expected.columns.every(
      (c, i) => c.toLowerCase() === actual.columns[i]?.toLowerCase(),
    );

  return (
    <div className="space-y-3 px-5 py-3">
      {!colsMatch && (
        <div className="rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-xs">
          <div className="font-semibold text-warning mb-1">Column mismatch</div>
          <div className="grid grid-cols-2 gap-3 font-mono">
            <div>
              <div className="text-[10px] uppercase text-muted-foreground">Expected</div>
              <div>{expected.columns.join(", ") || "—"}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase text-muted-foreground">Yours</div>
              <div>{actual.columns.join(", ") || "—"}</div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <DiffTable
          title={`Missing rows (${missing.length})`}
          subtitle="In expected, not in your result"
          tone="missing"
          columns={expected.columns}
          rows={missing}
        />
        <DiffTable
          title={`Extra rows (${extra.length})`}
          subtitle="In your result, not in expected"
          tone="extra"
          columns={actual.columns}
          rows={extra}
        />
      </div>

      {missing.length === 0 && extra.length === 0 && !colsMatch && (
        <p className="text-xs text-muted-foreground">
          Same rows but column shape differs — fix your SELECT list.
        </p>
      )}
      {missing.length === 0 && extra.length === 0 && colsMatch && (
        <p className="text-xs text-muted-foreground">
          Rows match{ignoreOrder ? " (order ignored)" : ""}. Difference must be in column
          ordering or types.
        </p>
      )}
    </div>
  );
}

function DiffTable({
  title,
  subtitle,
  tone,
  columns,
  rows,
}: {
  title: string;
  subtitle: string;
  tone: "missing" | "extra";
  columns: string[];
  rows: unknown[][];
}) {
  const toneCls =
    tone === "missing"
      ? "border-success/40 bg-success/5"
      : "border-destructive/40 bg-destructive/5";
  const headerCls = tone === "missing" ? "text-success" : "text-destructive";

  return (
    <div className={`rounded-md border ${toneCls} overflow-hidden`}>
      <div className="px-3 py-1.5 border-b border-border/60 bg-background/40">
        <div className={`text-xs font-semibold ${headerCls}`}>{title}</div>
        <div className="text-[10px] text-muted-foreground">{subtitle}</div>
      </div>
      {rows.length === 0 ? (
        <div className="px-3 py-3 text-[11px] text-muted-foreground">None ✓</div>
      ) : (
        <div className="overflow-auto max-h-48">
          <table className="w-full text-[11px]">
            <thead className="bg-muted/40">
              <tr>
                {columns.map((c) => (
                  <th
                    key={c}
                    className="px-2 py-1 text-left font-medium text-muted-foreground whitespace-nowrap"
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 50).map((row, i) => (
                <tr key={i} className="border-t border-border/40">
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      className="px-2 py-1 font-mono whitespace-nowrap"
                    >
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
          {rows.length > 50 && (
            <div className="px-3 py-1 text-[10px] text-muted-foreground">
              …{rows.length - 50} more rows hidden
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ExplainPanel({ report }: { report: ExplainReport }) {
  return (
    <div className="px-5 py-3 space-y-2">
      <div className="text-xs font-semibold text-foreground/90">Query plan</div>
      {report.plan.length === 0 ? (
        <div className="text-[11px] text-muted-foreground">No plan returned.</div>
      ) : (
        <ol className="rounded-md border border-border bg-muted/20 p-2 text-[11px] font-mono space-y-0.5">
          {report.plan.map((line, i) => (
            <li key={i} className="text-foreground/85">
              <span className="text-muted-foreground mr-2">{i + 1}.</span>
              {line}
            </li>
          ))}
        </ol>
      )}
      <div className="space-y-1.5">
        {report.hints.map((h, i) => (
          <div
            key={i}
            className={`flex items-start gap-2 rounded-md border px-2.5 py-1.5 text-[11px] ${
              h.level === "warn"
                ? "border-warning/40 bg-warning/10 text-foreground"
                : "border-border bg-muted/20 text-foreground/85"
            }`}
          >
            {h.level === "warn" ? (
              <AlertTriangle className="h-3.5 w-3.5 text-warning shrink-0 mt-0.5" />
            ) : (
              <Info className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
            )}
            <span>{h.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
