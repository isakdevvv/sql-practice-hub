import { useState } from "react";
import { CheckCircle2, XCircle, RotateCcw } from "lucide-react";

// ---------------------------------------------------------------------------
// IpcMatchQuiz — match 6 use-cases til riktig IPC-mekanisme.
// Brukeren klikker en mekanisme for hvert scenario; vi viser hint og fasit
// med kort begrunnelse. Mål: lære når man velger HVA.
// ---------------------------------------------------------------------------

type Mechanism = "pipe" | "fifo" | "shm" | "semaphore" | "mq" | "signal";

const MECH_META: Record<Mechanism, { label: string; sub: string; color: string }> = {
  pipe: {
    label: "Anonym pipe",
    sub: "fd[0]/fd[1] mellom forelder/barn",
    color: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  fifo: {
    label: "Named pipe (FIFO)",
    sub: "mkfifo + path",
    color: "border-teal-500/40 bg-teal-500/10 text-teal-700 dark:text-teal-300",
  },
  shm: {
    label: "Shared memory",
    sub: "shm_open + mmap, raskest",
    color: "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300",
  },
  semaphore: {
    label: "Semafor",
    sub: "sem_wait/sem_post",
    color: "border-violet-500/40 bg-violet-500/10 text-violet-700 dark:text-violet-300",
  },
  mq: {
    label: "Message queue",
    sub: "mq_send/mq_receive, prio",
    color: "border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  },
  signal: {
    label: "Signal",
    sub: "kill(pid, SIG..)",
    color: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
};

type Question = {
  id: string;
  scenario: string;
  correct: Mechanism;
  why: string;
};

const QUESTIONS: Question[] = [
  {
    id: "q1",
    scenario:
      "ls | grep foo — shellet skal streame stdout fra `ls` til stdin på `grep`, begge er barn av samme shell.",
    correct: "pipe",
    why: "Klassisk fork+pipe+dup2-mønster. Anonym pipe er nok fordi begge prosessene har felles forelder.",
  },
  {
    id: "q2",
    scenario:
      "En log-collector og en database-daemon er startet uavhengig (forskjellige init-scripts), men begge skal sende/motta korte tekstmeldinger via et avtalt navn.",
    correct: "fifo",
    why: "Urelaterte prosesser, men byte-strøm er nok. Et FIFO-navn i filsystemet (mkfifo /var/run/logbus) lar dem koble seg på.",
  },
  {
    id: "q3",
    scenario:
      "En bilde-prosessor og en GPU-uploader skal dele en 4K-frame (~24 MiB) 60 ganger per sekund. Kopiering gjennom kjernen er for tregt.",
    correct: "shm",
    why: "Shared memory er den eneste IPC-formen som unngår kopiering gjennom kjernen. mmap MAP_SHARED gir zero-copy mellom prosessene.",
  },
  {
    id: "q4",
    scenario:
      "To prosesser som deler ovennevnte minne-region, må sørge for at uploaderen aldri leser en frame mens encoderen fortsatt skriver til den.",
    correct: "semaphore",
    why: "Shared memory har ingen innebygd synkronisering. Bruk binær POSIX-semafor (sem_init med pshared=1) eller process-shared mutex for å låse frame-en mens den fylles.",
  },
  {
    id: "q5",
    scenario:
      "En arkitektur med tre mikrotjenester der hver sender korte JSON-kommandoer med prioritet (kritisk/normal/lav). Sender skal ikke vente på at mottaker har konsumert.",
    correct: "mq",
    why: "POSIX message queue: bevarer meldingsgrenser, har innebygd prioritet, og lever i kjernen så sender kan forsvinne før mottaker leser.",
  },
  {
    id: "q6",
    scenario:
      "En supervisor må be alle barneprosesser om å avslutte rent — uten å sende data, bare et hint om at de skal kjøre cleanup nå.",
    correct: "signal",
    why: "Signaler (SIGTERM, SIGUSR1) er asynkrone notifikasjoner uten payload. Perfekte for «kjør cleanup» eller «reload config» — som SIGHUP til nginx.",
  },
];

export function IpcMatchQuiz() {
  const [answers, setAnswers] = useState<Record<string, Mechanism | null>>(
    Object.fromEntries(QUESTIONS.map((q) => [q.id, null])),
  );
  const [showResults, setShowResults] = useState(false);

  function pick(qid: string, m: Mechanism) {
    setAnswers((a) => ({ ...a, [qid]: m }));
  }

  function reset() {
    setAnswers(Object.fromEntries(QUESTIONS.map((q) => [q.id, null])));
    setShowResults(false);
  }

  const allAnswered = QUESTIONS.every((q) => answers[q.id] !== null);
  const correct = QUESTIONS.filter((q) => answers[q.id] === q.correct).length;

  return (
    <div
      className="rounded-2xl border border-border bg-card overflow-hidden"
      role="region"
      aria-label="Quiz: match scenario til IPC-mekanisme"
    >
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">
          Test deg selv
        </div>
        <div className="text-sm font-semibold">
          Match scenario til riktig IPC-mekanisme
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          Velg den mest passende mekanismen for hvert use-case. Send inn for å se fasit
          + begrunnelse.
        </div>
      </div>

      <div className="p-4 space-y-3">
        {QUESTIONS.map((q, i) => {
          const picked = answers[q.id];
          const isCorrect = picked === q.correct;
          return (
            <div
              key={q.id}
              className={`rounded-lg border p-3 ${
                showResults
                  ? isCorrect
                    ? "border-emerald-500/40 bg-emerald-500/5"
                    : "border-rose-500/40 bg-rose-500/5"
                  : "border-border bg-background"
              }`}
            >
              <div className="flex items-start gap-2 mb-2">
                <div className="text-[10px] font-mono text-muted-foreground mt-0.5 shrink-0">
                  {i + 1}.
                </div>
                <div className="text-sm">{q.scenario}</div>
                {showResults &&
                  (isCorrect ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                  ))}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(Object.keys(MECH_META) as Mechanism[]).map((m) => {
                  const meta = MECH_META[m];
                  const isPicked = picked === m;
                  const isAns = m === q.correct;
                  let cls = "border-border bg-muted/20 hover:bg-muted";
                  if (showResults) {
                    if (isAns) cls = `${meta.color} font-semibold`;
                    else if (isPicked && !isAns)
                      cls = "border-rose-500/50 bg-rose-500/10 text-rose-700 dark:text-rose-300 line-through";
                    else cls = "border-border bg-muted/10 text-muted-foreground opacity-60";
                  } else if (isPicked) {
                    cls = meta.color;
                  }
                  return (
                    <button
                      key={m}
                      type="button"
                      disabled={showResults}
                      onClick={() => pick(q.id, m)}
                      className={`text-[10px] font-mono px-2 py-1 rounded border ${cls} disabled:cursor-default`}
                      title={meta.sub}
                    >
                      {meta.label}
                    </button>
                  );
                })}
              </div>
              {showResults && (
                <div className="mt-2 text-[11px] text-muted-foreground italic">
                  <strong className="text-foreground not-italic">
                    Riktig: {MECH_META[q.correct].label}.
                  </strong>{" "}
                  {q.why}
                </div>
              )}
            </div>
          );
        })}

        <div className="flex flex-wrap items-center gap-2 pt-1">
          {!showResults ? (
            <button
              type="button"
              onClick={() => setShowResults(true)}
              disabled={!allAnswered}
              className="px-3 py-1.5 rounded-md text-xs font-medium bg-brand text-brand-foreground hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Sjekk svar
            </button>
          ) : (
            <div className="text-sm font-medium">
              {correct} / {QUESTIONS.length} riktige
              {correct === QUESTIONS.length && (
                <span className="ml-2 text-emerald-600">— full pott!</span>
              )}
            </div>
          )}
          <button
            type="button"
            onClick={reset}
            className="ml-auto text-xs px-2 py-1 rounded border border-border hover:bg-muted inline-flex items-center gap-1"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Nullstill
          </button>
        </div>
      </div>
    </div>
  );
}
