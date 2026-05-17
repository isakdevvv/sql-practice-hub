import { useMemo, useState } from "react";

/**
 * Scenario-match-quiz: 6 reelle MDP-scenarier (varelager, robot, trading,
 * helse osv.) → match til riktig MDP-konsept (myopic γ, far-sighted γ,
 * VI vs PI, stokastisk planlegging, etc.). Fungerer som sjekk av
 * forståelse uten å bli en flashcards-stabel.
 */

type Concept = "myopic" | "far-sighted" | "vi" | "pi" | "noisy" | "deterministic";

const CONCEPT_LABEL: Record<Concept, string> = {
  myopic: "Myopic γ (≈ 0.3) — bare nær-fremtid teller",
  "far-sighted": "Far-sighted γ (≈ 0.99) — planlegg langt frem",
  vi: "Value Iteration — mange enkle backup-sweeps",
  pi: "Policy Iteration — eksakt evaluering, få ytre runder",
  noisy: "Stokastiske overganger — ta omvei rundt risiko",
  deterministic: "Deterministiske overganger — kortest vei",
};

const CONCEPT_EXPLAIN: Record<Concept, string> = {
  myopic:
    "Når umiddelbar belønning dominerer (eller når simulering er dyr), velg liten γ. Optimal policy blir grådig.",
  "far-sighted":
    "Når sluttreward er stor og det er mange steg fram, må γ være nær 1 så bakover-induksjonen ikke 'mister' belønningen.",
  vi: "Stort state-space, billig per-state-backup, men vi tolererer mange iterasjoner. Asymptotisk konvergens.",
  pi: "Moderat |S|. Eksakt evaluering (O(|S|³)) er overkommelig, og vi vil finne optimum i finite antall ytre runder.",
  noisy:
    "Når handlinger glir/feiler. Optimal policy blir konservativ — unngå risiko-soner selv om det betyr lengre vei.",
  deterministic:
    "Når handlinger alltid lykkes. Optimal policy = korteste vei (eller minst step-cost) til høyeste reward.",
};

type Scenario = {
  id: string;
  scenario: string;
  answer: Concept;
  hint: string;
};

const SCENARIOS: Scenario[] = [
  {
    id: "s1",
    scenario:
      "Robot navigerer i et lager med 10 000 hyller (states). Hver action er enkel å simulere. Du har god tid og kan vente på asymptotisk konvergens.",
    answer: "vi",
    hint: "Stort |S|, billig per state-backup",
  },
  {
    id: "s2",
    scenario:
      "Finansiell trading-agent. Markedet kan kollapse med sannsynlighet 5 % når den shorter. Du vil ha en strategi som tåler at handler ikke alltid fyller.",
    answer: "noisy",
    hint: "Stokastiske overganger",
  },
  {
    id: "s3",
    scenario:
      "Sjakk-AI som planlegger sluttspill (få brikker, ~50 states på relevant nivå). Du vil ha eksakt løsning og er villig til å invertere matriser.",
    answer: "pi",
    hint: "Moderat |S|, eksakt evaluering OK",
  },
  {
    id: "s4",
    scenario:
      "Online ad-recommendation system. Click-through reward kommer med en gang, og du vil teste mange policyer raskt uten å vente på langtidskonsekvenser.",
    answer: "myopic",
    hint: "Bare nær-fremtid betyr noe",
  },
  {
    id: "s5",
    scenario:
      "Helsevesen: planlegger behandlingsforløp over 20 år for diabetespasienter. Reward (livskvalitet) realiseres gjennom hele livsforløpet.",
    answer: "far-sighted",
    hint: "Langtidsreward — γ må være nær 1",
  },
  {
    id: "s6",
    scenario:
      "Industriell robot-arm på et samlebånd. Alle bevegelser er pre-kalibrerte og slipping er forsømmelig. Du vil minimere syklustid.",
    answer: "deterministic",
    hint: "Pålitelige handlinger → korteste vei",
  },
];

const CONCEPTS: Concept[] = ["myopic", "far-sighted", "vi", "pi", "noisy", "deterministic"];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function MdpMatchQuiz() {
  const [shuffled] = useState(() => shuffle(SCENARIOS));
  const [answers, setAnswers] = useState<Record<string, Concept | null>>({});
  const [revealed, setRevealed] = useState(false);

  const correct = useMemo(() => {
    let n = 0;
    for (const s of shuffled) {
      if (answers[s.id] === s.answer) n++;
    }
    return n;
  }, [answers, shuffled]);

  function setAnswer(id: string, concept: Concept) {
    setAnswers((a) => ({ ...a, [id]: concept }));
  }

  function reset() {
    setAnswers({});
    setRevealed(false);
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="text-[10px] uppercase tracking-wider text-brand font-semibold">
          Match scenario → MDP-konsept
        </div>
        <div className="flex gap-2 text-xs">
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className="rounded bg-brand text-brand-foreground px-2 py-1 font-medium hover:opacity-90"
          >
            Sjekk svar
          </button>
          <button
            type="button"
            onClick={reset}
            className="rounded border border-border px-2 py-1 hover:border-brand/40"
          >
            Reset
          </button>
        </div>
      </div>

      {revealed && (
        <div
          className={
            "rounded border p-2 text-xs " +
            (correct === shuffled.length
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
              : "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400")
          }
        >
          {correct} / {shuffled.length} riktige.
        </div>
      )}

      <div className="space-y-2">
        {shuffled.map((s) => {
          const user = answers[s.id];
          const isRight = revealed && user === s.answer;
          const isWrong = revealed && user && user !== s.answer;
          return (
            <div
              key={s.id}
              className={
                "rounded-lg border p-3 space-y-2 " +
                (isRight
                  ? "border-emerald-500/50 bg-emerald-500/5"
                  : isWrong
                    ? "border-red-500/50 bg-red-500/5"
                    : "border-border bg-background")
              }
            >
              <div className="text-xs leading-relaxed">{s.scenario}</div>
              <select
                value={user ?? ""}
                onChange={(e) => setAnswer(s.id, e.target.value as Concept)}
                disabled={revealed}
                className="w-full rounded border border-border bg-background px-2 py-1 text-xs"
              >
                <option value="">— velg konsept —</option>
                {CONCEPTS.map((c) => (
                  <option key={c} value={c}>
                    {CONCEPT_LABEL[c]}
                  </option>
                ))}
              </select>
              {revealed && (
                <div className="text-[11px] space-y-0.5">
                  <div>
                    <span className="text-muted-foreground">Riktig:</span>{" "}
                    <span className="font-semibold">{CONCEPT_LABEL[s.answer]}</span>
                  </div>
                  <div className="text-muted-foreground italic">{CONCEPT_EXPLAIN[s.answer]}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
