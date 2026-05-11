import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MiniTable } from "./MiniTable";
import { JoinResultTable } from "./JoinResultTable";
import { ALL_JOIN_TYPES, computeJoin, joinSql } from "@/lib/learn/joinCompute";
import type { JoinExercise, JoinType } from "@/lib/learn/types";
import { cn } from "@/lib/utils";
import { ArrowRight, Check, X } from "lucide-react";
import { markJoinSolved } from "@/lib/learn/joinProgress";

const JOIN_DESCRIPTIONS: Record<JoinType, string> = {
  INNER:
    "Bare rader som finnes i begge tabeller — ingen NULL fra ytterside.",
  LEFT:
    "Alle rader fra venstre tabell. Når høyre ikke matcher, fylles høyre-kolonnene med NULL.",
  RIGHT:
    "Alle rader fra høyre tabell. Når venstre ikke matcher, fylles venstre-kolonnene med NULL.",
  FULL:
    "Alle rader fra begge tabeller. Manglende side fylles med NULL.",
  CROSS:
    "Alle kombinasjoner — kartesisk produkt. Antall rader = venstre × høyre.",
};

function pickRandom<T>(xs: T[], not?: T): T {
  if (xs.length === 0) throw new Error("empty");
  if (xs.length === 1 || not === undefined) {
    return xs[Math.floor(Math.random() * xs.length)];
  }
  let pick = not;
  while (pick === not) {
    pick = xs[Math.floor(Math.random() * xs.length)];
  }
  return pick;
}

export function JoinExplorer({
  exercise,
  onAdvance,
  hasNext,
}: {
  exercise: JoinExercise;
  onAdvance?: () => void;
  hasNext?: boolean;
}) {
  const types = exercise.joinTypes ?? ALL_JOIN_TYPES;

  // The hidden answer the user is trying to identify. When the exercise locks
  // `correctType`, use it; otherwise pick randomly from the available types.
  const [target, setTarget] = useState<JoinType>(
    () => exercise.correctType ?? pickRandom(types),
  );
  // What the user is currently previewing/considering.
  const [selected, setSelected] = useState<JoinType>(types[0]);
  // The user's locked-in answer (null until they click Bekreft).
  const [committed, setCommitted] = useState<JoinType | null>(null);

  const previewResult = useMemo(
    () =>
      computeJoin(
        exercise.left,
        exercise.right,
        exercise.leftKey,
        exercise.rightKey,
        selected,
      ),
    [exercise, selected],
  );

  const targetResult = useMemo(
    () =>
      computeJoin(
        exercise.left,
        exercise.right,
        exercise.leftKey,
        exercise.rightKey,
        target,
      ),
    [exercise, target],
  );

  const dimLeft = useMemo(() => {
    const set = new Set<number>();
    for (let i = 0; i < exercise.left.rows.length; i++) {
      if (!previewResult.matchedLeft.has(i)) set.add(i);
    }
    return set;
  }, [exercise.left.rows.length, previewResult.matchedLeft]);

  const dimRight = useMemo(() => {
    const set = new Set<number>();
    for (let i = 0; i < exercise.right.rows.length; i++) {
      if (!previewResult.matchedRight.has(i)) set.add(i);
    }
    return set;
  }, [exercise.right.rows.length, previewResult.matchedRight]);

  const committedResult = useMemo(
    () =>
      committed === null
        ? null
        : computeJoin(
            exercise.left,
            exercise.right,
            exercise.leftKey,
            exercise.rightKey,
            committed,
          ),
    [exercise, committed],
  );

  const correct = useMemo(() => {
    if (committed === null || committedResult === null) return false;
    if (committed === target) return true;
    if (committedResult.rows.length !== targetResult.rows.length) return false;
    const a = committedResult.rows.map((r) => JSON.stringify(r.cells)).sort();
    const b = targetResult.rows.map((r) => JSON.stringify(r.cells)).sort();
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
  }, [committed, target, committedResult, targetResult]);

  // Show "fasit"-list of all join types that happen to be result-equivalent to
  // the target on this dataset. Useful when several types collapse to the same
  // rows (e.g., perfect 1:1 match → INNER = LEFT = RIGHT = FULL).
  const equivalentTypes = useMemo(() => {
    const tKey = targetResult.rows.map((r) => JSON.stringify(r.cells)).sort().join("|");
    return types.filter((t) => {
      const r = computeJoin(
        exercise.left,
        exercise.right,
        exercise.leftKey,
        exercise.rightKey,
        t,
      );
      if (r.rows.length !== targetResult.rows.length) return false;
      const k = r.rows.map((row) => JSON.stringify(row.cells)).sort().join("|");
      return k === tKey;
    });
  }, [types, target, exercise, targetResult]);

  function tryAgain() {
    // When the exercise locks correctType, keep it; otherwise reshuffle.
    if (!exercise.correctType) setTarget(pickRandom(types, target));
    setCommitted(null);
    setSelected(types[0]);
  }

  // Mark solved + Enter-to-advance once the user nails it.
  useEffect(() => {
    if (!correct) return;
    markJoinSolved(exercise.id);
    function onKey(e: KeyboardEvent) {
      if (e.key === "Enter" && onAdvance && hasNext) {
        e.preventDefault();
        onAdvance();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [correct, exercise.id, onAdvance, hasNext]);

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold tracking-tight">{exercise.title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{exercise.scenario}</p>
        </div>
        <Badge variant="outline" className="text-[10px] uppercase tracking-wider shrink-0">
          {exercise.topic}
        </Badge>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <MiniTable
          table={exercise.left}
          highlightKey={exercise.leftKey}
          dimRows={dimLeft}
          glowRows={previewResult.matchedLeft}
          caption={`${exercise.left.name} (venstre)`}
          accent="left"
        />
        <MiniTable
          table={exercise.right}
          highlightKey={exercise.rightKey}
          dimRows={dimRight}
          glowRows={previewResult.matchedRight}
          caption={`${exercise.right.name} (høyre)`}
          accent="right"
        />
      </div>

      <div className="rounded-lg border border-warning/40 bg-warning/5 p-3 text-sm">
        <strong className="text-warning">Oppgave:</strong> Hvilken JOIN-type produserte
        målresultatet? Klikk gjennom typene under for å sammenligne — bekreft når du er sikker.
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-medium font-mono text-warning">
              Mål ({targetResult.rows.length} rader)
            </div>
            <span className="text-[10px] text-muted-foreground">Dette skal du matche</span>
          </div>
          <JoinResultTable result={targetResult} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-medium font-mono text-brand">
              Forhåndsvisning · {selected} JOIN ({previewResult.rows.length} rader)
            </div>
            <span className="text-[10px] text-muted-foreground">Ditt valgte forslag</span>
          </div>
          <JoinResultTable result={previewResult} />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs leading-relaxed">
        <div className="font-mono text-foreground/80 whitespace-pre">
          {joinSql(
            exercise.left,
            exercise.right,
            exercise.leftKey,
            exercise.rightKey,
            selected,
          )}
        </div>
        <p className="text-muted-foreground mt-2">{JOIN_DESCRIPTIONS[selected]}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground mr-1">Velg JOIN-type:</span>
        {types.map((t) => {
          const isSelected = selected === t;
          const isCommitted = committed === t;
          const showCorrect = committed !== null && t === target;
          const showWrong = committed !== null && isCommitted && t !== target;
          return (
            <button
              key={t}
              onClick={() => committed === null && setSelected(t)}
              disabled={committed !== null && !showCorrect && !showWrong}
              className={cn(
                "rounded-md border px-3 py-1.5 text-xs font-mono transition-colors",
                committed !== null
                  ? showCorrect
                    ? "border-success bg-success/15 text-success"
                    : showWrong
                      ? "border-destructive bg-destructive/15 text-destructive"
                      : "border-border bg-background text-muted-foreground opacity-50"
                  : isSelected
                    ? "border-brand bg-brand/10 text-brand"
                    : "border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              {t} JOIN
            </button>
          );
        })}
      </div>

      {/* Hovedhandling — én prominent knapp som bytter rolle:
          Submit (Bekreft) → Neste oppgave (når riktig) → Prøv igjen (når feil). */}
      <div className="flex items-center justify-end gap-2 pt-1">
        {committed === null ? (
          <Button
            size="lg"
            onClick={() => setCommitted(selected)}
            className="bg-brand text-brand-foreground hover:bg-brand/90 min-w-[220px]"
          >
            Bekreft svar: {selected} JOIN
          </Button>
        ) : correct ? (
          <Button
            size="lg"
            autoFocus
            onClick={onAdvance ?? (() => {})}
            disabled={!onAdvance || !hasNext}
            className="bg-success text-success-foreground hover:bg-success/90 min-w-[220px]"
          >
            Neste oppgave <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <>
            <Button size="lg" variant="outline" onClick={tryAgain} className="min-w-[140px]">
              Prøv igjen
            </Button>
            {onAdvance && hasNext && (
              <Button
                size="lg"
                onClick={onAdvance}
                variant="ghost"
                className="text-muted-foreground hover:text-foreground"
              >
                Hopp over <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </>
        )}
      </div>

      {committed !== null && (
        <div
          className={cn(
            "rounded-lg border p-3 text-sm",
            correct
              ? "border-success/40 bg-success/10 text-success"
              : "border-destructive/40 bg-destructive/10 text-destructive",
          )}
        >
          <div className="flex items-center gap-2 font-semibold mb-1">
            {correct ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
            {correct ? "Riktig!" : `Ikke riktig — fasit: ${target} JOIN`}
          </div>
          {correct && equivalentTypes.length > 1 && (
            <p className="text-foreground/80 text-xs mb-1">
              På dette datasettet gir også {equivalentTypes.filter((t) => t !== committed).join(", ")} JOIN samme resultat — fordi det ikke finnes umatchede rader.
            </p>
          )}
          <p className="text-foreground/80 text-xs">{JOIN_DESCRIPTIONS[target]}</p>
          <p className="mt-2 text-foreground/85 text-xs leading-relaxed">
            {exercise.explanation}
          </p>
          {correct && hasNext && (
            <span className="mt-2 inline-block text-[11px] text-muted-foreground">
              Trykk{" "}
              <kbd className="px-1 py-0.5 rounded border border-border bg-background font-mono">
                Enter
              </kbd>{" "}
              for neste oppgave
            </span>
          )}
        </div>
      )}
    </div>
  );
}
