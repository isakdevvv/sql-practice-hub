import { useMemo, useState } from "react";
import { Check, X, RotateCcw, Trash2, Lightbulb } from "lucide-react";

// Interaktiv «Proof Lego»: bruker bygger et bevis ved å plukke steg fra en pool
// og legge dem inn i ordnet rekkefølge. Hvert steg har en logisk avhengighet
// til ett eller flere tidligere steg (`deps` = ID-er). Systemet validerer at
// avhengighetene er oppfylt FØR steget i den foreslåtte rekkefølgen.
//
// Pedagogisk grunn: lese-modus (StepProof) viser strukturen, men kan ikke
// avsløre om studenten faktisk forstår hvilken regel som rettferdiggjør
// hvert steg. Konstruksjons-modus tvinger den forståelsen.

export interface ProofPiece {
  id: string;
  /** The line / proposition itself, shown in monospace. */
  text: string;
  /** Optional left-side label (e.g. "Basis", "IH"). */
  label?: string;
  /** IDs of steps this one depends on. They must appear EARLIER in the user's order. */
  deps?: string[];
  /** One-line rule/justification (e.g. "definisjon av partall", "IH + (k+1)"). */
  justification: string;
}

export interface ProofBuilderProps {
  title: string;
  /** What we're trying to prove. */
  claim: string;
  /** Optional initial setup the user is given (the "antagelse" or context). */
  setup?: string;
  /** Shuffled pool — the canonical correct order is the array order. */
  pieces: ProofPiece[];
  /** Hint shown if user clicks "Hint". */
  hint?: string;
}

export function ProofBuilder({ title, claim, setup, pieces, hint }: ProofBuilderProps) {
  // Stable shuffle on mount.
  const shuffledPool = useMemo(() => seededShuffle(pieces, hashStr(title)), [pieces, title]);
  const [placed, setPlaced] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const remaining = shuffledPool.filter((p) => !placed.includes(p.id));
  const placedPieces = placed.map((id) => pieces.find((p) => p.id === id)!);

  const validation = useMemo(() => validate(placedPieces, pieces), [placedPieces, pieces]);

  const add = (id: string) => {
    if (submitted) return;
    setPlaced((arr) => [...arr, id]);
  };
  const removeAt = (i: number) => {
    if (submitted) return;
    setPlaced((arr) => arr.filter((_, j) => j !== i));
  };
  const reset = () => {
    setPlaced([]);
    setSubmitted(false);
    setShowHint(false);
  };

  const finished = placed.length === pieces.length;
  const allValid = validation.every((v) => v === null);
  const correctOrder = finished && allValid;

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden not-prose">
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <div className="text-[10px] uppercase tracking-wider text-brand font-semibold">
          Proof Lego — bygg beviset selv
        </div>
        <div className="text-sm font-semibold text-foreground">{title}</div>
      </div>

      <div className="p-4 space-y-3">
        <div className="rounded-md border border-border bg-background p-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
            Påstand
          </div>
          <div className="font-mono text-sm text-foreground">{claim}</div>
          {setup && (
            <>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-2 mb-1">
                Antagelse / oppsett
              </div>
              <div className="font-mono text-xs text-foreground">{setup}</div>
            </>
          )}
        </div>

        {/* Bygget bevis */}
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
            Ditt bevis ({placed.length} / {pieces.length} steg)
          </div>
          {placed.length === 0 ? (
            <div className="rounded-md border-2 border-dashed border-border bg-background/40 p-4 text-center text-[11px] text-muted-foreground">
              Tomt — klikk et steg i poolen under for å starte.
            </div>
          ) : (
            <ol className="space-y-1.5">
              {placedPieces.map((p, i) => {
                const err = validation[i];
                return (
                  <li
                    key={`${p.id}-${i}`}
                    className={`rounded-md border px-3 py-2 flex items-start gap-2 transition-colors ${
                      submitted
                        ? err
                          ? "border-rose-500 bg-rose-500/10"
                          : "border-emerald-500 bg-emerald-500/5"
                        : err && finished
                          ? "border-amber-500/60 bg-amber-500/5"
                          : "border-border bg-background"
                    }`}
                  >
                    <span className="text-[10px] font-mono font-semibold text-muted-foreground shrink-0 w-5 mt-0.5">
                      {i + 1}.
                    </span>
                    {p.label && (
                      <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-brand/15 text-brand shrink-0">
                        {p.label}
                      </span>
                    )}
                    <div className="flex-1 min-w-0">
                      <pre className="font-mono text-xs whitespace-pre-wrap break-words">
                        {p.text}
                      </pre>
                      {submitted && (
                        <div className="text-[11px] text-muted-foreground mt-1">
                          <span className="text-brand">↳ </span>
                          {p.justification}
                        </div>
                      )}
                      {err && (
                        <div className="text-[11px] text-rose-500 mt-1">
                          <X className="inline h-3 w-3" /> {err}
                        </div>
                      )}
                    </div>
                    {!submitted && (
                      <button
                        type="button"
                        onClick={() => removeAt(i)}
                        className="text-muted-foreground hover:text-rose-500 shrink-0"
                        title="Fjern dette steget"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        {/* Pool av gjenværende steg */}
        {remaining.length > 0 && (
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
              Pool — klikk for å legge til
            </div>
            <div className="flex flex-col gap-1.5">
              {remaining.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => add(p.id)}
                  disabled={submitted}
                  className="text-left rounded-md border border-border bg-background hover:border-brand hover:bg-brand/5 px-3 py-2 flex items-start gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {p.label && (
                    <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-muted text-muted-foreground shrink-0 mt-0.5">
                      {p.label}
                    </span>
                  )}
                  <pre className="font-mono text-xs whitespace-pre-wrap break-words text-foreground/80">
                    {p.text}
                  </pre>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Knapper */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => setSubmitted(true)}
            disabled={!finished || submitted}
            className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs border border-brand bg-brand/15 hover:bg-brand/25 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Check className="h-3.5 w-3.5" /> Sjekk bevis
          </button>
          <button
            type="button"
            onClick={reset}
            className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs border border-border bg-background hover:bg-muted"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </button>
          {hint && (
            <button
              type="button"
              onClick={() => setShowHint((v) => !v)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs border border-border bg-background hover:bg-muted ml-auto"
            >
              <Lightbulb className="h-3.5 w-3.5" /> {showHint ? "Skjul hint" : "Hint"}
            </button>
          )}
        </div>

        {showHint && hint && (
          <div className="rounded-md border border-amber-500/40 bg-amber-500/5 p-3 text-[11px] text-foreground">
            <strong className="text-amber-500">Hint:</strong> {hint}
          </div>
        )}

        {submitted && (
          <div
            className={`rounded-md border p-3 text-xs ${
              correctOrder
                ? "border-emerald-500/40 bg-emerald-500/5"
                : "border-rose-500/40 bg-rose-500/5"
            }`}
          >
            {correctOrder ? (
              <span className="text-emerald-500 font-semibold">
                ✓ Beviset er korrekt — hver linje har sine avhengigheter oppfylt på et
                tidligere steg. QED.
              </span>
            ) : (
              <span className="text-rose-500 font-semibold">
                ✗ Beviset har feil. Røde linjer mangler avhengigheter de bygger på.
                Klikk «Reset» og prøv igjen.
              </span>
            )}
          </div>
        )}

        {finished && !submitted && !allValid && (
          <div className="rounded-md border border-amber-500/40 bg-amber-500/5 p-3 text-[11px] text-foreground">
            Du har alle stegene plassert, men noen står i feil rekkefølge — gule linjer
            har avhengigheter som ennå ikke er introdusert. Du kan fortsatt klikke
            «Sjekk bevis», eller fjerne og prøve igjen.
          </div>
        )}
      </div>
    </div>
  );
}

// Validate: for each placed step at index i, every dep must be the id of some step at index < i.
function validate(placed: ProofPiece[], _all: ProofPiece[]): (string | null)[] {
  const seenIds = new Set<string>();
  const errors: (string | null)[] = [];
  for (let i = 0; i < placed.length; i++) {
    const p = placed[i];
    const deps = p.deps ?? [];
    const missing = deps.filter((d) => !seenIds.has(d));
    if (missing.length === 0) {
      errors.push(null);
    } else {
      errors.push(
        `Trenger «${missing.join(", ")}» plassert FØR dette steget. ${p.justification}`,
      );
    }
    seenIds.add(p.id);
  }
  return errors;
}

function seededShuffle<T>(arr: readonly T[], seed: number): T[] {
  // Fisher-Yates with a deterministic seeded PRNG so the order is stable per title.
  const a = [...arr];
  let s = seed;
  const rand = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
