import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Check, X, Eye, EyeOff } from "lucide-react";
import type { DrillExercise } from "./drillExercises";

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/--[^\n]*/g, " ") // strip line comments
    .replace(/\s*([(),])\s*/g, "$1") // tighten whitespace around (, ), and ,
    .replace(/\s+/g, " ")
    .trim();
}

function check(answer: string, required: string[]): { found: string[]; missing: string[] } {
  const norm = normalize(answer);
  const found: string[] = [];
  const missing: string[] = [];
  for (const clause of required) {
    const target = normalize(clause);
    if (norm.includes(target)) found.push(clause);
    else missing.push(clause);
  }
  return { found, missing };
}

export function ErDrill({ exercise }: { exercise: DrillExercise }) {
  const [answer, setAnswer] = useState("");
  const [checked, setChecked] = useState(false);
  const [showFasit, setShowFasit] = useState(false);

  const result = useMemo(
    () => (checked ? check(answer, exercise.requiredClauses) : null),
    [answer, checked, exercise.requiredClauses],
  );

  const allFound = result && result.missing.length === 0;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-foreground mb-3">{exercise.description}</p>
        <pre className="rounded-md bg-muted/40 px-3 py-2 font-mono text-sm overflow-x-auto">
          {exercise.diagram}
        </pre>
        {exercise.hint && (
          <p className="mt-2 text-xs text-muted-foreground italic">
            Tips: {exercise.hint}
          </p>
        )}
      </div>

      <Textarea
        value={answer}
        onChange={(e) => {
          setAnswer(e.target.value);
          if (checked) setChecked(false);
        }}
        placeholder="CREATE TABLE ..."
        className="font-mono text-sm min-h-[180px]"
        spellCheck={false}
      />

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          onClick={() => setChecked(true)}
          disabled={answer.trim().length === 0}
        >
          Sjekk svar
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowFasit((v) => !v)}
        >
          {showFasit ? (
            <>
              <EyeOff className="h-3.5 w-3.5 mr-1.5" /> Skjul fasit
            </>
          ) : (
            <>
              <Eye className="h-3.5 w-3.5 mr-1.5" /> Vis fasit
            </>
          )}
        </Button>
        {checked && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setChecked(false);
              setAnswer("");
            }}
          >
            Nullstill
          </Button>
        )}
      </div>

      {result && (
        <div
          className={`rounded-lg border p-4 text-sm ${
            allFound
              ? "border-success/50 bg-success/5"
              : "border-destructive/40 bg-destructive/5"
          }`}
        >
          <div className="flex items-center gap-2 mb-2 font-semibold">
            {allFound ? (
              <>
                <Check className="h-4 w-4 text-success" />
                <span className="text-success">Bra! Alle nødvendige deler er på plass.</span>
              </>
            ) : (
              <>
                <X className="h-4 w-4 text-destructive" />
                <span className="text-destructive">
                  {result.found.length} av {exercise.requiredClauses.length} på plass.
                </span>
              </>
            )}
          </div>
          <ul className="space-y-1 text-xs">
            {exercise.requiredClauses.map((clause) => {
              const isFound = result.found.includes(clause);
              return (
                <li key={clause} className="flex items-start gap-2">
                  {isFound ? (
                    <Check className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                  ) : (
                    <X className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />
                  )}
                  <code
                    className={`font-mono ${
                      isFound ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {clause}
                  </code>
                </li>
              );
            })}
          </ul>
          {!allFound && (
            <p className="mt-3 text-xs text-muted-foreground">
              Sjekken er lempelig: vi ignorerer mellomrom, store/små bokstaver og
              kommentarer. Hvis et krav fortsatt er rødt — sjekk navn på tabell, kolonne
              eller constraint.
            </p>
          )}
        </div>
      )}

      {showFasit && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
            Fasit
          </div>
          <pre className="font-mono text-xs overflow-x-auto whitespace-pre">
            {exercise.fasit}
          </pre>
          <p className="mt-2 text-xs text-muted-foreground">
            Kolonne-navn, datatyper og rekkefølge kan variere — det viktige er
            tabellnavnene, PK, FK og constraints.
          </p>
        </div>
      )}
    </div>
  );
}
