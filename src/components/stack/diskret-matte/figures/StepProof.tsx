import { useState } from "react";
import { ChevronRight, ChevronLeft, RotateCcw } from "lucide-react";

// Animert bevis steg-for-steg.
// Hvert steg er { line, hint } — `line` rendres i monospace med valgfri
// fremhevning (substring som lyser opp grønt), `hint` er en setning som
// forklarer overgangen fra forrige steg.
//
// Pedagogisk grunn: bevis er der studenter mest gir opp. Et stort tekst-tre
// er overveldende. Klikk-deg-frem-modellen tvinger leseren til å registrere
// hvert eneste skritt.

export interface ProofStep {
  line: string;
  /** Substring(s) in `line` to highlight (typically what changed from previous step). */
  highlight?: string | string[];
  /** Short explanation of WHY this step follows from the previous. */
  hint: string;
  /** Optional label rendered to the left (e.g. "Basis", "IH", "QED"). */
  label?: string;
}

export interface StepProofProps {
  title: string;
  claim: string;
  steps: ProofStep[];
}

export function StepProof({ title, claim, steps }: StepProofProps) {
  const [idx, setIdx] = useState(0);
  const cur = steps[idx];

  const next = () => setIdx((i) => Math.min(i + 1, steps.length - 1));
  const prev = () => setIdx((i) => Math.max(i - 1, 0));
  const reset = () => setIdx(0);

  const done = idx === steps.length - 1;

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden not-prose">
      <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-baseline justify-between flex-wrap gap-2">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-brand font-semibold">
            Bevis steg-for-steg
          </div>
          <div className="text-sm font-semibold text-foreground">{title}</div>
        </div>
        <div className="text-[11px] text-muted-foreground font-mono">
          Steg {idx + 1} / {steps.length}
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="rounded-md border border-border bg-background p-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
            Påstand
          </div>
          <div className="font-mono text-sm text-foreground">{claim}</div>
        </div>

        {/* Alle steg vises, men kun synliggjorte (≤ idx) er ikke-dimmet */}
        <div className="rounded-md border border-border bg-background overflow-hidden">
          {steps.map((s, i) => {
            const visible = i <= idx;
            const isCurrent = i === idx;
            return (
              <div
                key={i}
                className={`px-3 py-2 border-b border-border/40 last:border-b-0 transition-opacity ${
                  visible ? "opacity-100" : "opacity-20"
                } ${isCurrent ? "bg-brand/5" : ""}`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`shrink-0 text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded ${
                      s.label
                        ? "bg-brand/15 text-brand"
                        : "text-muted-foreground"
                    }`}
                  >
                    {s.label ?? i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <pre className="font-mono text-xs overflow-x-auto whitespace-pre">
                      {renderLine(s.line, s.highlight, isCurrent)}
                    </pre>
                    {isCurrent && (
                      <div className="mt-1.5 text-[11px] text-muted-foreground">
                        <span className="text-brand">↳ </span>
                        {s.hint}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={prev}
            disabled={idx === 0}
            className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs border border-border bg-background hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Forrige
          </button>
          <button
            type="button"
            onClick={next}
            disabled={done}
            className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs border border-brand bg-brand/15 hover:bg-brand/25 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Neste <ChevronRight className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={reset}
            className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs border border-border bg-background hover:bg-muted ml-auto"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </button>
        </div>

        {done && (
          <div className="rounded-md border border-emerald-500/40 bg-emerald-500/5 p-3 text-[11px] text-foreground">
            <strong className="text-emerald-500">✓ Beviset fullført.</strong> Klikk «Reset»
            for å gå gjennom det igjen, eller «Forrige» for å se på et enkelt steg.
          </div>
        )}
      </div>
    </div>
  );
}

function renderLine(
  line: string,
  highlight: string | string[] | undefined,
  isCurrent: boolean,
): React.ReactNode {
  if (!highlight || !isCurrent) return line;
  const targets = Array.isArray(highlight) ? highlight : [highlight];
  // Build a single mask of highlighted ranges, then render parts.
  const ranges: [number, number][] = [];
  for (const t of targets) {
    if (!t) continue;
    let from = 0;
    while (from < line.length) {
      const i = line.indexOf(t, from);
      if (i === -1) break;
      ranges.push([i, i + t.length]);
      from = i + t.length;
    }
  }
  if (ranges.length === 0) return line;
  ranges.sort((a, b) => a[0] - b[0]);

  // Merge overlapping
  const merged: [number, number][] = [];
  for (const r of ranges) {
    const last = merged[merged.length - 1];
    if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1]);
    else merged.push([...r]);
  }

  const parts: React.ReactNode[] = [];
  let cursor = 0;
  for (const [a, b] of merged) {
    if (a > cursor) parts.push(line.slice(cursor, a));
    parts.push(
      <span
        key={a}
        className="bg-brand/25 text-foreground rounded px-0.5"
      >
        {line.slice(a, b)}
      </span>,
    );
    cursor = b;
  }
  if (cursor < line.length) parts.push(line.slice(cursor));
  return parts;
}
