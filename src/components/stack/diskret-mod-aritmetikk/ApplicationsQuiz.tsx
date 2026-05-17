import { useMemo, useState } from "react";

type Concept = "gcd" | "inverse" | "crt" | "mod-n";

interface UseCase {
  id: string;
  label: string;
  concept: Concept;
  rationale: string;
}

const CONCEPTS: Array<{ key: Concept; label: string; tone: string }> = [
  { key: "mod-n", label: "Plain mod n", tone: "amber" },
  { key: "gcd", label: "gcd via Euklid", tone: "brand" },
  { key: "inverse", label: "Modulær invers (Extended Euclid)", tone: "emerald" },
  { key: "crt", label: "Chinese Remainder Theorem", tone: "violet" },
];

const CASES: UseCase[] = [
  {
    id: "rsa-d",
    label: "Generere RSA-dekrypteringseksponent d gitt e og φ(N)",
    concept: "inverse",
    rationale:
      "d ≡ e⁻¹ (mod φ(N)) — dette er definisjonen av en multiplikativ invers, beregnet med Extended Euclidean.",
  },
  {
    id: "hash-bucket",
    label: "Bestemme hvilken bucket en nøkkel havner i i en hash-tabell",
    concept: "mod-n",
    rationale:
      "bucket = hash(key) mod n_buckets. Helt vanlig mod n — vi trenger bare resten.",
  },
  {
    id: "isbn",
    label: "Validere et ISBN-10 / ISBN-13 nummer",
    concept: "mod-n",
    rationale:
      "ISBN-validering er en vektet sum av sifrene mod 10 (eller mod 11 for ISBN-10). Plain mod-aritmetikk.",
  },
  {
    id: "rsa-crt-opt",
    label: "Speed-up av RSA-dekryptering ved å regne mod p og mod q separat",
    concept: "crt",
    rationale:
      "RSA-CRT: regn m_p = c^d mod p og m_q = c^d mod q, så bruk CRT til å rekonstruere m mod N. ~4x raskere.",
  },
  {
    id: "coprime-key",
    label: "Sjekke at en valgt eksponent e er gyldig for RSA (ko-prim med φ(N))",
    concept: "gcd",
    rationale:
      "e må oppfylle gcd(e, φ(N)) = 1 før modulær invers eksisterer. Euklids algoritme på 1-2 mikrosekunder.",
  },
  {
    id: "calendar-day",
    label: "Finne ukedagen for en gitt dato (Zellers kongruens)",
    concept: "mod-n",
    rationale:
      "Ukedag = (en sum av kalenderverdier) mod 7. Klassisk mod-bruk.",
  },
];

/**
 * 6 use-cases → match til riktig modulær-aritmetikk-konsept.
 */
export function ApplicationsQuiz() {
  const [selections, setSelections] = useState<Record<string, Concept | null>>(
    () => Object.fromEntries(CASES.map((c) => [c.id, null])) as Record<string, Concept | null>,
  );
  const [revealed, setRevealed] = useState(false);

  const score = useMemo(() => {
    let correct = 0;
    for (const c of CASES) {
      if (selections[c.id] === c.concept) correct += 1;
    }
    return correct;
  }, [selections]);

  const allAnswered = CASES.every((c) => selections[c.id] !== null);

  return (
    <div className="rounded-2xl border border-border bg-card p-4 not-prose space-y-4">
      <div className="text-xs uppercase tracking-wider text-brand font-semibold">
        Hvilken modulær-teknikk passer? — 6 use-cases
      </div>
      <div className="text-[11px] text-muted-foreground">
        For hver bruk: hvilken modulær-aritmetikk-teknikk er essensen?
      </div>

      <div className="space-y-2">
        {CASES.map((c) => {
          const sel = selections[c.id];
          const isCorrect = revealed && sel === c.concept;
          const isWrong = revealed && sel !== null && sel !== c.concept;
          return (
            <div
              key={c.id}
              className={`rounded-md border p-3 text-[11px] space-y-2 ${
                isCorrect
                  ? "border-emerald-500/50 bg-emerald-500/5"
                  : isWrong
                    ? "border-rose-500/50 bg-rose-500/5"
                    : "border-border bg-background"
              }`}
            >
              <div className="font-medium text-foreground">{c.label}</div>
              <div className="flex flex-wrap gap-1.5">
                {CONCEPTS.map((concept) => {
                  const chosen = sel === concept.key;
                  return (
                    <button
                      key={concept.key}
                      type="button"
                      onClick={() =>
                        setSelections((prev) => ({ ...prev, [c.id]: concept.key }))
                      }
                      disabled={revealed}
                      className={`px-2 py-1 rounded text-[10px] font-mono border transition-colors ${
                        chosen
                          ? "border-brand bg-brand/15 text-foreground"
                          : "border-border bg-background hover:bg-muted text-muted-foreground"
                      } ${revealed ? "cursor-default opacity-90" : ""}`}
                    >
                      {concept.label}
                    </button>
                  );
                })}
              </div>
              {revealed && (
                <div
                  className={`text-[11px] leading-relaxed border-t pt-1.5 ${
                    isCorrect
                      ? "border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
                      : "border-rose-500/30 text-foreground"
                  }`}
                >
                  {isCorrect ? "Riktig: " : `Fasit: ${labelFor(c.concept)}. `}
                  {c.rationale}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-3 border-t border-border pt-3">
        {!revealed ? (
          <button
            type="button"
            onClick={() => setRevealed(true)}
            disabled={!allAnswered}
            className="px-3 py-1.5 rounded text-[11px] border border-brand bg-brand/15 hover:bg-brand/25 disabled:opacity-40"
          >
            Sjekk svar
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              setSelections(
                Object.fromEntries(CASES.map((c) => [c.id, null])) as Record<string, Concept | null>,
              );
              setRevealed(false);
            }}
            className="px-3 py-1.5 rounded text-[11px] border border-border bg-background hover:bg-muted"
          >
            Prøv igjen
          </button>
        )}
        <div className="text-[11px] text-muted-foreground">
          {revealed ? (
            <>
              Resultat:{" "}
              <span className="text-foreground font-mono">
                {score} / {CASES.length}
              </span>
            </>
          ) : (
            <>
              Besvart:{" "}
              <span className="font-mono text-foreground">
                {Object.values(selections).filter((v) => v !== null).length} /{" "}
                {CASES.length}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function labelFor(c: Concept): string {
  return CONCEPTS.find((x) => x.key === c)?.label ?? c;
}
