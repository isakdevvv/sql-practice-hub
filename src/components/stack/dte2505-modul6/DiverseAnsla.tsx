import { useMemo, useState } from "react";
import { HelpCircle, ChevronRight, ChevronLeft, Sparkles, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { DIVERSE_PREDICT_ITEMS, type PredictItem } from "@/lib/dte2505/diverseAnslag";

// ---------------------------------------------------------------------------
// Oppgavetype 1 for modul 6 — ANSLÅ-SÅ-SJEKK, plassert FØR forklaringene.
//
// Filteret på de tre delene er der fordi modulen har tre løse tråder: man kan
// ta vim-anslagene før vim-avsnittet uten å ha lest om X ennå.
// ---------------------------------------------------------------------------

const DELER: { id: PredictItem["del"] | "alle"; label: string }[] = [
  { id: "alle", label: "Alle" },
  { id: "vim", label: "vi/vim" },
  { id: "x", label: "X Window System" },
  { id: "ssh", label: "SSH" },
];

export function DiverseAnsla() {
  const [del, setDel] = useState<PredictItem["del"] | "alle">("alle");
  const [idx, setIdx] = useState(0);
  const [guesses, setGuesses] = useState<Record<string, string>>({});

  const liste = useMemo(
    () => (del === "alle" ? DIVERSE_PREDICT_ITEMS : DIVERSE_PREDICT_ITEMS.filter((i) => i.del === del)),
    [del],
  );
  const item = liste[Math.min(idx, liste.length - 1)];
  const guess = guesses[item.id];
  const revealed = Boolean(guess);
  const hit = guess === item.correct;
  const answered = Object.keys(guesses).length;

  return (
    <div className="rounded-xl border-2 border-brand/30 bg-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2.5">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <HelpCircle className="h-4 w-4 text-brand" />
          Anslå først
          <span className="text-xs font-normal text-muted-foreground">
            {Math.min(idx, liste.length - 1) + 1} / {liste.length}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            {answered} av {DIVERSE_PREDICT_ITEMS.length} anslått
          </span>
          {answered > 0 && (
            <button
              onClick={() => setGuesses({})}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-3 w-3" /> Nullstill
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 border-b px-4 py-2">
        {DELER.map((d) => (
          <button
            key={d.id}
            onClick={() => {
              setDel(d.id);
              setIdx(0);
            }}
            className={cn(
              "rounded-full border px-2.5 py-0.5 text-xs hover:bg-accent",
              del === d.id && "border-brand bg-brand/10",
            )}
          >
            {d.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-1 border-b px-4 py-2">
        {liste.map((it, i) => (
          <button
            key={it.id}
            onClick={() => setIdx(i)}
            className={cn(
              "h-6 w-6 rounded-md border text-xs",
              i === Math.min(idx, liste.length - 1) && "border-brand bg-brand/15 font-semibold",
              guesses[it.id] && i !== idx && "border-emerald-500/60 bg-emerald-500/10",
            )}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <div className="p-4">
        <p className="text-xs leading-relaxed text-muted-foreground">{item.setup}</p>
        <p className="mt-2 font-medium leading-relaxed">{item.question}</p>

        <div className="mt-3 grid gap-2">
          {item.options.map((o) => {
            const isGuess = guess === o.id;
            const isCorrect = o.id === item.correct;
            return (
              <button
                key={o.id}
                onClick={() => !revealed && setGuesses((g) => ({ ...g, [item.id]: o.id }))}
                disabled={revealed}
                className={cn(
                  "rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                  !revealed && "hover:bg-accent",
                  revealed && isCorrect && "border-emerald-500/70 bg-emerald-500/10",
                  revealed && isGuess && !isCorrect && "border-amber-500/70 bg-amber-500/10",
                  revealed && !isCorrect && !isGuess && "opacity-50",
                )}
              >
                <span className="mr-2 font-mono text-xs text-muted-foreground">{o.id}.</span>
                {o.label}
                {revealed && isGuess && (
                  <span className="ml-2 text-[10px] uppercase tracking-wider text-muted-foreground">ditt anslag</span>
                )}
                {revealed && isCorrect && (
                  <span className="ml-2 text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    det som skjer
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {revealed ? (
          <div className="mt-4 rounded-lg border border-brand/40 bg-brand/5 p-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-brand">
              <Sparkles className="h-3.5 w-3.5" />
              {hit ? "Du traff — men grunnen er det viktige" : "Ikke det du trodde"}
            </div>
            <p className="mt-2 text-sm leading-relaxed">{item.reveal}</p>
            <p className="mt-2 border-t border-brand/20 pt-2 text-sm font-medium">{item.punch}</p>
          </div>
        ) : (
          <p className="mt-3 text-xs text-muted-foreground">
            Velg det du tror skjer. Du kan ikke svare feil her — poenget er å ha en mening før forklaringen
            kommer.
          </p>
        )}

        <div className="mt-4 flex items-center justify-between border-t pt-3">
          <button
            onClick={() => setIdx((i) => (i - 1 + liste.length) % liste.length)}
            className="inline-flex items-center gap-1 rounded-md border bg-card px-3 py-1.5 text-sm hover:bg-accent"
          >
            <ChevronLeft className="h-4 w-4" /> Forrige
          </button>
          <button
            onClick={() => setIdx((i) => (i + 1) % liste.length)}
            className="inline-flex items-center gap-1 rounded-md bg-brand px-3 py-1.5 text-sm text-brand-foreground hover:bg-brand/90"
          >
            Neste <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
