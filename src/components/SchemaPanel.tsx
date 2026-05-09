import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { getDataset, type DatasetId } from "@/lib/db/datasets";
import { runQuery, type QueryResult } from "@/lib/engine/sqlEngine";
import { Button } from "@/components/ui/button";
import { Play, Network, Loader2, Eye, X } from "lucide-react";

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

interface FKRel {
  fromTable: string;
  fromCol: string;
  toTable: string;
  toCol: string;
}

function parseFKs(schemaSql: string): FKRel[] {
  const fks: FKRel[] = [];
  const tableRe = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)\s*\(([\s\S]*?)\);/gi;
  let m: RegExpExecArray | null;
  while ((m = tableRe.exec(schemaSql))) {
    const tableName = m[1];
    const body = m[2];
    const fkRe =
      /FOREIGN\s+KEY\s*\(\s*(\w+)\s*\)\s*REFERENCES\s+(\w+)\s*\(\s*(\w+)\s*\)/gi;
    let f: RegExpExecArray | null;
    while ((f = fkRe.exec(body))) {
      fks.push({
        fromTable: tableName,
        fromCol: f[1],
        toTable: f[2],
        toCol: f[3],
      });
    }
  }
  return fks;
}

interface PreviewState {
  loading: boolean;
  result?: QueryResult;
  error?: string;
}

export function SchemaPanel({
  datasetId = "ecommerce",
  currentSql,
  onRunSql,
}: {
  datasetId?: DatasetId;
  currentSql?: string;
  onRunSql?: (sql: string) => void;
}) {
  const ds = getDataset(datasetId);
  const fks = useMemo(() => parseFKs(ds.schemaSql), [ds.schemaSql]);

  const referenced = useMemo(() => {
    const set = new Set<string>();
    if (!currentSql) return set;
    const sql = currentSql.toLowerCase();
    for (const t of ds.reference) {
      const re = new RegExp("\\b" + escapeRegex(t.name.toLowerCase()) + "\\b");
      if (re.test(sql)) set.add(t.name);
    }
    return set;
  }, [currentSql, ds]);

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [previews, setPreviews] = useState<Record<string, PreviewState>>({});
  const [diagramOpen, setDiagramOpen] = useState(false);

  // Reset cached previews when dataset changes
  useEffect(() => {
    setExpanded({});
    setPreviews({});
  }, [datasetId]);

  async function loadPreview(table: string) {
    setPreviews((p) => ({ ...p, [table]: { loading: true } }));
    const out = await runQuery(`SELECT * FROM ${table} LIMIT 5;`, datasetId);
    setPreviews((p) => ({
      ...p,
      [table]: out.success
        ? { loading: false, result: out.result }
        : { loading: false, error: out.error ?? "Failed" },
    }));
  }

  function togglePreview(table: string) {
    const isOpen = expanded[table];
    setExpanded((e) => ({ ...e, [table]: !isOpen }));
    if (!isOpen && !previews[table]) {
      void loadPreview(table);
    }
  }

  function runFullTable(table: string) {
    onRunSql?.(`SELECT * FROM ${table} LIMIT 20;`);
  }

  return (
    <div className="space-y-3 text-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold text-foreground">Schema · {ds.name}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{ds.description}</p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setDiagramOpen(true)}
          className="h-7 px-2 shrink-0"
          title="Vis ER-diagram"
        >
          <Network className="h-3.5 w-3.5 mr-1" />
          Diagram
        </Button>
      </div>

      {ds.reference.map((t) => {
        const active = referenced.has(t.name);
        const isOpen = !!expanded[t.name];
        const preview = previews[t.name];
        return (
          <div
            key={t.name}
            className={`rounded-lg border transition-colors ${
              active ? "border-brand/40 bg-brand/10" : "border-border bg-card"
            }`}
          >
            <div className="flex items-center justify-between px-3 pt-3 pb-1.5">
              <div className="font-mono text-brand text-sm font-semibold flex items-center min-w-0">
                <span className="truncate">{t.name}</span>
                {active && (
                  <span className="ml-1.5 h-1.5 w-1.5 rounded-full bg-brand inline-block shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  onClick={() => togglePreview(t.name)}
                  className="h-6 w-6 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-accent/40"
                  title={isOpen ? "Skjul forhåndsvisning" : "Vis 5 rader"}
                  aria-expanded={isOpen}
                >
                  <Eye className="h-3.5 w-3.5" />
                </button>
                {onRunSql && (
                  <button
                    onClick={() => runFullTable(t.name)}
                    className="h-6 w-6 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-accent/40"
                    title={`Kjør SELECT * FROM ${t.name} LIMIT 20`}
                  >
                    <Play className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
            <ul className="space-y-0.5 px-3 pb-2">
              {t.columns.map((c) => (
                <li
                  key={c.name}
                  className="flex justify-between gap-2 font-mono text-xs text-muted-foreground"
                >
                  <span className="text-foreground/90">{c.name}</span>
                  <span>{c.type}</span>
                </li>
              ))}
            </ul>
            {isOpen && (
              <div className="border-t border-border/60 px-2 py-2 bg-background/40">
                {preview?.loading && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground px-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Laster…
                  </div>
                )}
                {preview?.error && (
                  <div className="text-xs text-destructive font-mono px-1">
                    {preview.error}
                  </div>
                )}
                {preview?.result && (
                  <PreviewTable result={preview.result} />
                )}
              </div>
            )}
          </div>
        );
      })}

      {diagramOpen && (
        <DiagramModal onClose={() => setDiagramOpen(false)} title={`ER-diagram · ${ds.name}`}>
          <ERDiagram dataset={ds} fks={fks} highlighted={referenced} />
        </DiagramModal>
      )}
    </div>
  );
}

function DiagramModal({
  onClose,
  title,
  children,
}: {
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl max-h-[90vh] bg-card rounded-lg border border-border shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-border shrink-0">
          <h2 className="text-base font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="h-7 w-7 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-accent/40"
            aria-label="Lukk"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 min-h-0 overflow-auto">{children}</div>
      </div>
    </div>
  );
}

function PreviewTable({ result }: { result: QueryResult }) {
  if (result.rows.length === 0) {
    return (
      <div className="text-xs text-muted-foreground px-1 py-1 italic">
        (tom tabell)
      </div>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="text-[10px] font-mono w-full">
        <thead>
          <tr className="text-muted-foreground">
            {result.columns.map((c) => (
              <th
                key={c}
                className="text-left px-1.5 py-0.5 font-semibold border-b border-border/60 whitespace-nowrap"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {result.rows.map((row, i) => (
            <tr key={i} className="border-b border-border/30 last:border-b-0">
              {row.map((cell, j) => (
                <td
                  key={j}
                  className="px-1.5 py-0.5 whitespace-nowrap text-foreground/85"
                >
                  {cell === null ? (
                    <span className="text-muted-foreground/70 italic">NULL</span>
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

function ERDiagram({
  dataset,
  fks,
  highlighted,
}: {
  dataset: ReturnType<typeof getDataset>;
  fks: FKRel[];
  highlighted: Set<string>;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const colRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [paths, setPaths] = useState<
    { d: string; label: string; midX: number; midY: number; key: string }[]
  >([]);

  useLayoutEffect(() => {
    const compute = () => {
      const cont = containerRef.current;
      if (!cont) return;
      const cBox = cont.getBoundingClientRect();
      const next: typeof paths = [];
      for (let i = 0; i < fks.length; i++) {
        const fk = fks[i];
        const fromEl = colRefs.current[`${fk.fromTable}.${fk.fromCol}`];
        const toEl = colRefs.current[`${fk.toTable}.${fk.toCol}`];
        if (!fromEl || !toEl) continue;
        const f = fromEl.getBoundingClientRect();
        const t = toEl.getBoundingClientRect();
        const fromOnRight = f.left + f.width / 2 < t.left + t.width / 2;
        const fromX = (fromOnRight ? f.right : f.left) - cBox.left + cont.scrollLeft;
        const toX = (fromOnRight ? t.left : t.right) - cBox.left + cont.scrollLeft;
        const fromY = f.top + f.height / 2 - cBox.top + cont.scrollTop;
        const toY = t.top + t.height / 2 - cBox.top + cont.scrollTop;
        const dx = Math.abs(toX - fromX);
        const c = Math.max(40, dx / 2);
        const c1x = fromOnRight ? fromX + c : fromX - c;
        const c2x = fromOnRight ? toX - c : toX + c;
        const d = `M ${fromX} ${fromY} C ${c1x} ${fromY}, ${c2x} ${toY}, ${toX} ${toY}`;
        next.push({
          d,
          label: fk.fromCol,
          midX: (fromX + toX) / 2,
          midY: (fromY + toY) / 2,
          key: `${fk.fromTable}.${fk.fromCol}->${fk.toTable}.${fk.toCol}`,
        });
      }
      setPaths(next);
    };
    compute();
    const ro = new ResizeObserver(compute);
    if (containerRef.current) ro.observe(containerRef.current);
    const refs = Object.values(colRefs.current).filter(Boolean) as HTMLElement[];
    refs.forEach((el) => ro.observe(el));
    window.addEventListener("resize", compute);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", compute);
    };
  }, [fks, dataset.id]);

  const fkOutgoing = useMemo(() => {
    const set = new Set<string>();
    fks.forEach((f) => set.add(`${f.fromTable}.${f.fromCol}`));
    return set;
  }, [fks]);

  const fkIncoming = useMemo(() => {
    const set = new Set<string>();
    fks.forEach((f) => set.add(`${f.toTable}.${f.toCol}`));
    return set;
  }, [fks]);

  return (
    <div
      ref={containerRef}
      className="relative p-4"
      style={{ minHeight: 400 }}
    >
      <svg
        className="absolute inset-0 pointer-events-none"
        width="100%"
        height="100%"
        style={{ overflow: "visible" }}
      >
        <defs>
          <marker
            id="er-arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path
              d="M 0 0 L 10 5 L 0 10 z"
              style={{ fill: "var(--brand)" }}
            />
          </marker>
        </defs>
        {paths.map((p) => (
          <g key={p.key}>
            <path
              d={p.d}
              style={{ stroke: "var(--brand)", fill: "none" }}
              strokeWidth={1.5}
              opacity={0.75}
              markerEnd="url(#er-arrow)"
            />
          </g>
        ))}
      </svg>

      <div
        className="grid gap-6 relative"
        style={{
          gridTemplateColumns: `repeat(auto-fit, minmax(220px, 1fr))`,
        }}
      >
        {dataset.reference.map((t) => {
          const active = highlighted.has(t.name);
          return (
            <div
              key={t.name}
              className={`rounded-lg border bg-card shadow-sm overflow-hidden ${
                active ? "border-brand/60 ring-1 ring-brand/40" : "border-border"
              }`}
            >
              <div className="bg-muted/40 px-3 py-1.5 border-b border-border font-mono text-sm font-semibold text-brand">
                {t.name}
              </div>
              <div className="divide-y divide-border/40">
                {t.columns.map((c) => {
                  const key = `${t.name}.${c.name}`;
                  const isFK = fkOutgoing.has(key);
                  const isPK = c.type.toUpperCase().includes("PK");
                  const isReferenced = fkIncoming.has(key);
                  return (
                    <div
                      key={c.name}
                      ref={(el) => {
                        colRefs.current[key] = el;
                      }}
                      className="flex items-center justify-between gap-2 px-3 py-1 font-mono text-xs"
                    >
                      <span className="flex items-center gap-1.5 min-w-0">
                        {isPK && (
                          <span
                            className="text-warning text-[9px] font-bold"
                            title="Primary key"
                          >
                            PK
                          </span>
                        )}
                        {isFK && (
                          <span
                            className="text-brand text-[9px] font-bold"
                            title="Foreign key"
                          >
                            FK
                          </span>
                        )}
                        <span
                          className={`truncate ${
                            isReferenced && !isPK
                              ? "text-foreground"
                              : "text-foreground/90"
                          }`}
                        >
                          {c.name}
                        </span>
                      </span>
                      <span className="text-muted-foreground text-[10px] shrink-0">
                        {c.type.replace(/\s*(PK|FK)\s*/g, "").trim() || c.type}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {fks.length === 0 && (
        <div className="mt-4 text-xs text-muted-foreground italic">
          Ingen foreign-key-relasjoner i dette datasettet.
        </div>
      )}
    </div>
  );
}
