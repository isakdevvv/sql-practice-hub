import { useState } from "react";

// Visuell intro til mengder for absolutt-nybegynnere.
// Tre moduser:
//   1) Hva er en mengde — klikk inn/ut av boks, se notasjon oppdateres
//   2) ∈ vs. ∉  — klikk elementer for å avgjøre tilhørighet, sjekk svar
//   3) ⊆       — er A en delmengde av B? Visuelt med to bokser

type Mode = "what" | "elem" | "subset";

const MODES: { id: Mode; label: string }[] = [
  { id: "what", label: "Hva er en mengde?" },
  { id: "elem", label: "Tilhørighet: ∈" },
  { id: "subset", label: "Delmengde: ⊆" },
];

export function AbcMengder() {
  const [mode, setMode] = useState<Mode>("what");
  return (
    <div className="rounded-2xl border border-border bg-card p-4 not-prose">
      <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
        Mattens ABC — mengde-notasjon visualisert
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Tre korte øvelser. Klikk gjennom dem i rekkefølge — du vil aldri se
        symbolene <code>∈</code>, <code>⊆</code> forvirre deg igjen.
      </p>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMode(m.id)}
            className={`px-2.5 py-1 rounded text-[11px] border ${
              mode === m.id
                ? "border-brand bg-brand/15 text-foreground"
                : "border-border bg-background hover:bg-muted"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {mode === "what" && <WhatIsSet />}
      {mode === "elem" && <ElemQuiz />}
      {mode === "subset" && <SubsetQuiz />}
    </div>
  );
}

// ============================================================
// 1) Hva er en mengde — klikk inn/ut av boksen, se notasjon
// ============================================================

const ALL_FRUKT = ["🍎 eple", "🍐 pære", "🍊 appelsin", "🍌 banan", "🍇 drue", "🥝 kiwi"];

function WhatIsSet() {
  const [inSet, setInSet] = useState<Set<string>>(new Set(["🍎 eple", "🍌 banan"]));

  const toggle = (x: string) => {
    setInSet((prev) => {
      const next = new Set(prev);
      if (next.has(x)) next.delete(x);
      else next.add(x);
      return next;
    });
  };

  const arr = ALL_FRUKT.filter((x) => inSet.has(x));

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        En <strong>mengde</strong> er en uordnet samling av unike ting. Klikk frukter for å
        legge dem i (eller ta dem ut av) settet <code>F</code>:
      </p>

      <div className="flex flex-wrap gap-1.5">
        {ALL_FRUKT.map((x) => {
          const isIn = inSet.has(x);
          return (
            <button
              key={x}
              type="button"
              onClick={() => toggle(x)}
              className={`px-2.5 py-1 rounded-md text-xs border transition-colors ${
                isIn
                  ? "border-brand bg-brand/15 text-foreground"
                  : "border-border bg-background hover:bg-muted text-muted-foreground"
              }`}
            >
              {x}
            </button>
          );
        })}
      </div>

      <div className="rounded-md border border-border bg-background p-3 font-mono text-xs">
        <div className="text-muted-foreground">Settet F skrives:</div>
        <div className="text-brand mt-1 break-all">
          F = {"{"}
          {arr.length === 0 ? " " : " " + arr.join(", ") + " "}
          {"}"}
        </div>
        <div className="text-muted-foreground mt-1">
          Kardinalitet: <span className="text-foreground">|F| = {arr.length}</span>
        </div>
      </div>

      <div className="rounded-md border border-border bg-background p-3 text-xs space-y-1">
        <Fact>Rekkefølge betyr ingenting: {`{1, 2, 3} = {3, 1, 2}`}</Fact>
        <Fact>Duplikater telles bare én gang: {`{1, 1, 2} = {1, 2}`}</Fact>
        <Fact>Tom mengde skrives ∅ eller { } — har kardinalitet 0</Fact>
      </div>
    </div>
  );
}

// ============================================================
// 2) ∈ vs. ∉ — klikk for å avgjøre tilhørighet
// ============================================================

const ELEM_QUIZ: { x: string; inA: boolean }[] = [
  { x: "2", inA: true },
  { x: "3", inA: false },
  { x: "5", inA: true },
  { x: "6", inA: false },
  { x: "7", inA: true },
  { x: "8", inA: false },
];

function ElemQuiz() {
  const [answers, setAnswers] = useState<Record<string, "in" | "out" | null>>({});
  const [revealed, setRevealed] = useState(false);

  const set = (x: string, v: "in" | "out") => {
    setAnswers((prev) => ({ ...prev, [x]: v }));
  };

  const score = ELEM_QUIZ.filter((q) => {
    const a = answers[q.x];
    return a !== null && a !== undefined && ((a === "in") === q.inA);
  }).length;

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        La <code>A = {`{2, 5, 7, 11, 13}`}</code> (primtallene under 14). For hvert tall
        under, klikk <strong>∈ A</strong> hvis tallet er i A, og <strong>∉ A</strong> hvis
        det ikke er det.
      </p>

      <table className="text-xs font-mono">
        <tbody>
          {ELEM_QUIZ.map((q) => {
            const userAns = answers[q.x];
            const correct = userAns !== undefined && (userAns === "in") === q.inA;
            return (
              <tr key={q.x} className="border-b border-border/40">
                <td className="px-3 py-1.5 font-bold w-12">{q.x}</td>
                <td className="px-1 py-1.5">
                  <button
                    type="button"
                    onClick={() => set(q.x, "in")}
                    className={`px-2 py-0.5 rounded text-[11px] border mr-1 ${
                      userAns === "in"
                        ? revealed
                          ? correct
                            ? "border-emerald-500 bg-emerald-500/20"
                            : "border-rose-500 bg-rose-500/20"
                          : "border-brand bg-brand/15"
                        : "border-border bg-background hover:bg-muted"
                    }`}
                  >
                    ∈ A
                  </button>
                  <button
                    type="button"
                    onClick={() => set(q.x, "out")}
                    className={`px-2 py-0.5 rounded text-[11px] border ${
                      userAns === "out"
                        ? revealed
                          ? correct
                            ? "border-emerald-500 bg-emerald-500/20"
                            : "border-rose-500 bg-rose-500/20"
                          : "border-brand bg-brand/15"
                        : "border-border bg-background hover:bg-muted"
                    }`}
                  >
                    ∉ A
                  </button>
                </td>
                {revealed && (
                  <td className="px-3 py-1.5 text-[11px] text-muted-foreground">
                    {q.inA ? "primtall ✓" : "ikke primtall"}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setRevealed(true)}
          className="px-3 py-1.5 rounded-md text-xs border border-brand bg-brand/15 hover:bg-brand/25"
        >
          Sjekk svar
        </button>
        {revealed && (
          <span className="text-xs text-muted-foreground">
            {score} av {ELEM_QUIZ.length} riktig.
          </span>
        )}
      </div>

      <div className="text-[11px] text-muted-foreground italic">
        Symbol: <code>∈</code> = «er element i». <code>∉</code> = «er IKKE element i».
        Det er bare to muligheter — en ting er enten med eller ikke med.
      </div>
    </div>
  );
}

// ============================================================
// 3) ⊆ — er A en delmengde av B?
// ============================================================

const SUBSET_QUIZ: { a: number[]; b: number[]; isSubset: boolean; note: string }[] = [
  { a: [1, 2], b: [1, 2, 3, 4], isSubset: true, note: "Hvert element i A (1, 2) finnes også i B." },
  { a: [1, 5], b: [1, 2, 3, 4], isSubset: false, note: "5 er i A men ikke i B — diskvalifiserer ⊆." },
  { a: [], b: [1, 2, 3], isSubset: true, note: "Tom mengde er delmengde av ALT — det finnes ingen element å bryte regelen for." },
  { a: [1, 2, 3], b: [1, 2, 3], isSubset: true, note: "A = B medfører A ⊆ B (men ikke ekte delmengde A ⊂ B)." },
  { a: [1, 2, 3], b: [1, 2], isSubset: false, note: "3 ∈ A men 3 ∉ B." },
];

function SubsetQuiz() {
  const [idx, setIdx] = useState(0);
  const [pickedYes, setPickedYes] = useState<boolean | null>(null);

  const q = SUBSET_QUIZ[idx];
  const next = () => {
    setIdx((i) => (i + 1) % SUBSET_QUIZ.length);
    setPickedYes(null);
  };
  const revealed = pickedYes !== null;
  const correct = revealed && pickedYes === q.isSubset;

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        <code>A ⊆ B</code> betyr: «hvert element i A er også i B». Klikk JA hvis det
        gjelder her, NEI hvis ikke.
      </p>

      <div className="grid grid-cols-2 gap-3">
        <SetBox name="A" items={q.a} />
        <SetBox name="B" items={q.b} />
      </div>

      <div className="rounded-md border border-border bg-background p-3 text-xs">
        Spørsmål: er <code>A ⊆ B</code>?
        <div className="flex gap-2 mt-2">
          <button
            type="button"
            onClick={() => setPickedYes(true)}
            disabled={revealed}
            className={`px-3 py-1 rounded text-xs border ${
              revealed
                ? pickedYes === true
                  ? q.isSubset
                    ? "border-emerald-500 bg-emerald-500/20"
                    : "border-rose-500 bg-rose-500/20"
                  : "border-border bg-background opacity-50"
                : "border-border bg-background hover:bg-muted"
            }`}
          >
            JA, A ⊆ B
          </button>
          <button
            type="button"
            onClick={() => setPickedYes(false)}
            disabled={revealed}
            className={`px-3 py-1 rounded text-xs border ${
              revealed
                ? pickedYes === false
                  ? !q.isSubset
                    ? "border-emerald-500 bg-emerald-500/20"
                    : "border-rose-500 bg-rose-500/20"
                  : "border-border bg-background opacity-50"
                : "border-border bg-background hover:bg-muted"
            }`}
          >
            NEI, A ⊄ B
          </button>
          {revealed && (
            <button
              type="button"
              onClick={next}
              className="ml-auto px-3 py-1 rounded text-xs border border-border bg-background hover:bg-muted"
            >
              Neste →
            </button>
          )}
        </div>
        {revealed && (
          <div className={`mt-2 text-[11px] ${correct ? "text-emerald-500" : "text-rose-500"}`}>
            {correct ? "Riktig! " : `Feil. Svaret er ${q.isSubset ? "JA" : "NEI"}. `}
            <span className="text-muted-foreground">{q.note}</span>
          </div>
        )}
      </div>

      <div className="text-[11px] text-muted-foreground italic">
        Sammenheng: A ⊆ B betyr «A er innebygd i B». A = B er det samme som «A ⊆ B og B ⊆
        A». Spesialregel: ∅ ⊆ X for ALLE X.
      </div>
    </div>
  );
}

function SetBox({ name, items }: { name: string; items: number[] }) {
  return (
    <div className="rounded-md border-2 border-border bg-background p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
        {name} = {"{"}
        {items.join(", ")}
        {"}"}
      </div>
      <div className="flex flex-wrap gap-1 min-h-[40px] items-center">
        {items.length === 0 ? (
          <span className="text-[11px] text-muted-foreground italic">∅ (tom)</span>
        ) : (
          items.map((it) => (
            <span
              key={it}
              className="px-2 py-1 rounded text-xs border border-brand bg-brand/15 font-mono"
            >
              {it}
            </span>
          ))
        )}
      </div>
    </div>
  );
}

function Fact({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 text-foreground">
      <span className="text-brand text-[10px] mt-0.5">●</span>
      <span>{children}</span>
    </div>
  );
}
