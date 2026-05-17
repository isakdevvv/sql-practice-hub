// Inline-oppgaver til CSS moderne-siden. To varianter:
//   - quiz: multi-choice, riktig/galt + rationale per alternativ.
//   - fill: __1__-plassholdere i et template som studenten fyller inn,
//           enten via knapper (med options) eller via tekst-input.
//
// Designet for å ligge mellom prosa-avsnitt. Holder progress i lokal state
// (ingen lagring til localStorage — det er en lese-side, ikke et drill).

import { useMemo, useState } from "react";
import { Check, X, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizOption {
  text: string;
  correct: boolean;
  /** Forklaring som vises etter at brukeren har valgt dette alternativet. */
  rationale: string;
}

interface QuizProps {
  kind: "quiz";
  title: string;
  question: string;
  options: QuizOption[];
  /** Vist nederst etter at brukeren har svart riktig. */
  explanation?: string;
}

interface FillProps {
  kind: "fill";
  title: string;
  prompt: string;
  /** Mal-tekst med __1__, __2__, ... som plassholdere. */
  template: string;
  /** Fasit per blank, i samme rekkefølge som __1__, __2__, ... */
  blanks: string[];
  /** Hvis satt: brukeren velger fra knapper. Hvis ikke: fri tekst-input. */
  options?: string[];
  explanation?: string;
  /** Språk-hint for syntaks-fargen av template (default: css). */
  language?: "css" | "html";
}

type Props = QuizProps | FillProps;

export function CssCheckpoint(props: Props) {
  if (props.kind === "quiz") return <QuizCheckpoint {...props} />;
  return <FillCheckpoint {...props} />;
}

// ────────────────────────────────────────────────────────────────────────────
// Quiz

function QuizCheckpoint({ title, question, options, explanation }: QuizProps) {
  const [picked, setPicked] = useState<number | null>(null);

  const correctIdx = options.findIndex((o) => o.correct);
  const solved = picked !== null && options[picked].correct;

  return (
    <div className="rounded-xl border border-brand/30 bg-brand/[0.03] p-4 my-4">
      <div className="flex items-start gap-2 mb-2">
        <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white">
          ?
        </span>
        <div className="flex-1">
          <div className="text-[11px] uppercase tracking-wider text-brand font-semibold">
            Sjekkpunkt
          </div>
          <h3 className="text-sm font-semibold">{title}</h3>
        </div>
        {solved && (
          <span className="inline-flex items-center gap-1 rounded-full bg-success/15 text-success px-2 py-0.5 text-[11px] font-medium">
            <Check className="h-3 w-3" /> løst
          </span>
        )}
      </div>

      <p className="text-sm mb-3">{question}</p>

      <div className="space-y-2">
        {options.map((opt, i) => {
          const isPicked = picked === i;
          const isCorrect = opt.correct;
          const showAsCorrect = isPicked && isCorrect;
          const showAsWrong = isPicked && !isCorrect;
          return (
            <button
              key={i}
              type="button"
              onClick={() => setPicked(i)}
              disabled={solved}
              className={cn(
                "w-full text-left text-sm rounded-md border px-3 py-2 transition-colors",
                "disabled:cursor-default",
                showAsCorrect &&
                  "border-success/60 bg-success/10 text-foreground",
                showAsWrong && "border-destructive/60 bg-destructive/10",
                !isPicked &&
                  "border-border bg-background hover:border-brand/40 hover:bg-brand/[0.04]",
                solved && !isPicked && i === correctIdx &&
                  "border-success/30 bg-success/[0.04]",
              )}
            >
              <div className="flex items-start gap-2">
                <span
                  className={cn(
                    "mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                    showAsCorrect && "border-success bg-success text-white",
                    showAsWrong && "border-destructive bg-destructive text-white",
                    !isPicked && "border-muted-foreground/40",
                  )}
                >
                  {showAsCorrect && <Check className="h-2.5 w-2.5" />}
                  {showAsWrong && <X className="h-2.5 w-2.5" />}
                </span>
                <span className="flex-1">{opt.text}</span>
              </div>
              {isPicked && (
                <div
                  className={cn(
                    "mt-2 pl-6 text-xs",
                    isCorrect ? "text-success" : "text-destructive",
                  )}
                >
                  {opt.rationale}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {solved && explanation && (
        <div className="mt-3 rounded-md border border-success/30 bg-success/5 p-3 text-xs text-foreground/80">
          <span className="font-semibold text-success">Forklaring:</span>{" "}
          {explanation}
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Fill

function FillCheckpoint({
  title,
  prompt,
  template,
  blanks,
  options,
  explanation,
  language = "css",
}: FillProps) {
  const [values, setValues] = useState<string[]>(() => blanks.map(() => ""));
  const [checked, setChecked] = useState(false);

  const status: ("empty" | "ok" | "miss")[] = useMemo(() => {
    if (!checked) return values.map(() => "empty");
    return values.map((v, i) =>
      v.trim().toLowerCase() === blanks[i].toLowerCase() ? "ok" : "miss",
    );
  }, [checked, values, blanks]);

  const allCorrect = checked && status.every((s) => s === "ok");

  // Splitt template på __N__-tokens for å vise blanks i flow.
  const parts = useMemo(() => splitTemplate(template, blanks.length), [
    template,
    blanks.length,
  ]);

  function setValue(i: number, v: string) {
    setValues((prev) => {
      const next = prev.slice();
      next[i] = v;
      return next;
    });
    setChecked(false);
  }

  // Sett verdi i FØRSTE tomme felt. Bruker funksjonell setState så raske
  // klikk etter hverandre ser oppdatert state, ikke en stale closure-kopi.
  function fillNextEmpty(v: string) {
    setValues((prev) => {
      const i = prev.findIndex((x) => !x.trim());
      if (i < 0) return prev;
      const next = prev.slice();
      next[i] = v;
      return next;
    });
    setChecked(false);
  }

  function reset() {
    setValues(blanks.map(() => ""));
    setChecked(false);
  }

  return (
    <div className="rounded-xl border border-brand/30 bg-brand/[0.03] p-4 my-4">
      <div className="flex items-start gap-2 mb-2">
        <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white">
          ✎
        </span>
        <div className="flex-1">
          <div className="text-[11px] uppercase tracking-wider text-brand font-semibold">
            Fyll inn
          </div>
          <h3 className="text-sm font-semibold">{title}</h3>
        </div>
        {allCorrect && (
          <span className="inline-flex items-center gap-1 rounded-full bg-success/15 text-success px-2 py-0.5 text-[11px] font-medium">
            <Check className="h-3 w-3" /> løst
          </span>
        )}
      </div>

      <p className="text-sm mb-3">{prompt}</p>

      <pre className="rounded-md bg-[#1e1e1e] text-zinc-100 p-3 text-xs font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
        {parts.map((part, idx) => {
          if (part.kind === "text") return <span key={idx}>{part.text}</span>;
          const i = part.index;
          const s = status[i];
          return (
            <input
              key={idx}
              type="text"
              value={values[i]}
              onChange={(e) => setValue(i, e.target.value)}
              placeholder={`__${i + 1}__`}
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              className={cn(
                "inline-block min-w-[80px] px-1.5 py-0.5 mx-0.5 rounded text-xs font-mono align-baseline",
                "bg-zinc-800 text-zinc-100 border outline-none focus:ring-1",
                s === "empty" && "border-zinc-600 focus:border-brand focus:ring-brand/40",
                s === "ok" && "border-success bg-success/20 text-success-foreground",
                s === "miss" && "border-destructive bg-destructive/20",
              )}
              style={{ width: `${Math.max(8, values[i].length + 2)}ch` }}
            />
          );
        })}
      </pre>

      {options && options.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground self-center mr-1">
            Forslag:
          </span>
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => fillNextEmpty(opt)}
              disabled={allCorrect}
              className="rounded-md border border-border bg-background px-2 py-0.5 text-xs font-mono hover:bg-accent hover:border-brand/40 transition-colors disabled:opacity-50 disabled:cursor-default"
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center gap-2">
        {!allCorrect ? (
          <button
            type="button"
            onClick={() => setChecked(true)}
            disabled={values.some((v) => !v.trim())}
            className="rounded-md bg-brand text-white text-sm font-medium px-3 py-1.5 hover:bg-brand/90 transition-colors disabled:opacity-50 disabled:cursor-default"
          >
            Sjekk
          </button>
        ) : (
          <button
            type="button"
            onClick={reset}
            className="rounded-md border border-border bg-background text-sm font-medium px-3 py-1.5 hover:bg-accent transition-colors flex items-center gap-1"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Nullstill
          </button>
        )}
        {checked && !allCorrect && (
          <span className="text-xs text-destructive">
            Ikke helt — sjekk de røde feltene og prøv igjen.
          </span>
        )}
      </div>

      {allCorrect && explanation && (
        <div className="mt-3 rounded-md border border-success/30 bg-success/5 p-3 text-xs text-foreground/80">
          <span className="font-semibold text-success">Forklaring:</span>{" "}
          {explanation}
        </div>
      )}
    </div>
  );
}

// Splitt en mal som "color: __1__; padding: __2__;" i [text, blank, text, ...].
function splitTemplate(
  template: string,
  blankCount: number,
): ({ kind: "text"; text: string } | { kind: "blank"; index: number })[] {
  const out: ({ kind: "text"; text: string } | { kind: "blank"; index: number })[] =
    [];
  let cursor = 0;
  const re = /__(\d+)__/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(template)) !== null) {
    if (m.index > cursor) {
      out.push({ kind: "text", text: template.slice(cursor, m.index) });
    }
    const idx = parseInt(m[1], 10) - 1;
    if (idx >= 0 && idx < blankCount) {
      out.push({ kind: "blank", index: idx });
    } else {
      out.push({ kind: "text", text: m[0] });
    }
    cursor = m.index + m[0].length;
  }
  if (cursor < template.length) {
    out.push({ kind: "text", text: template.slice(cursor) });
  }
  return out;
}
