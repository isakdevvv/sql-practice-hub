import { useEffect, useState } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  MousePointerClick,
  KeyRound,
  Link2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DrillShell,
  DrillPrompt,
  DrillHint,
  DrillStepCard,
  type DrillStep,
  type DrillStepCtx,
} from "@/components/learn/DrillShell";
import {
  ORDRE_RAW,
  RAW_COLS,
  STEP_1_COLS,
  STEP_1_ROWS,
  TELEFON_ROWS,
  STEP_2_COLS,
  STEP_2_ROWS,
  PRODUKT_ROWS,
  STEP_3_ORDRELINJE_COLS,
  STEP_3_ORDRELINJE_ROWS,
  STEP_3_ORDRE_ROWS,
  STEP_3_KUNDE_ROWS,
  STEP_3_POSTSTED_ROWS,
} from "./NormaliseringSteps";

// ---------------------------------------------------------------------------
// NormaliseringDrill — interaktiv «du normaliserer selv» med fire steg:
//   1) 1NF: pek på kolonnen som bryter atomisitet
//   2) 2NF: marker kolonnene med partiell avhengighet (multi-select + submit)
//   3) 3NF: velg den transitive FD-en (single-select)
//   4) FK-er: knytt hver FK-kolonne til riktig PK-tabell (klikk kilde, klikk mål)
//
// Migrert til DrillShell — shellet eier modus-toggle, progress, akkumulert
// kontekst og ferdig-panel. Denne fila eier dataene (kolonner, rader, korrekte
// svar) og fire steg-render-funksjoner som beskriver hver av de fire ulike
// interaksjons-stilene. Hver render-funksjon holder sin egen lokale state og
// melder fra til shellet om `done` via `ctx.setDone`.
// ---------------------------------------------------------------------------

type StepStatus = "idle" | "wrong" | "correct";

// ---------- Steg 1: 1NF ----------
const STEP1_CORRECT = "telefonNumre";
const STEP1_HINT = "Se etter celler som inneholder flere verdier separert med komma.";

// ---------- Steg 2: 2NF (multi-select) ----------
const STEP2_CORRECT = new Set(["prodNavn", "prodPris"]);
const STEP2_PK = new Set(["ordreNr", "prodNr"]);

// ---------- Steg 3: 3NF (velg én transitiv FD) ----------
type FdOption = { id: string; left: string; right: string; explain: string; correct?: boolean };
const STEP3_FDS: FdOption[] = [
  {
    id: "ordreNr-kundeNr",
    left: "ordreNr",
    right: "kundeNr",
    explain: "ordreNr er PK i den nye Ordre-tabellen — en direkte (ikke transitiv) FD.",
  },
  {
    id: "kundeNr-kundeNavn",
    left: "kundeNr",
    right: "kundeNavn, postNr",
    explain: "kundeNr blir PK i Kunde-tabellen — også en direkte FD, ikke transitiv.",
  },
  {
    id: "postNr-poststed",
    left: "postNr",
    right: "poststed",
    correct: true,
    explain:
      "Bingo! ordreNr (PK) → kundeNr → postNr → poststed. postNr er ikke kandidatnøkkel i Kunde-tabellen — postNr → poststed er den transitive avhengigheten. Flytt ut til Poststed(postNr, poststed).",
  },
  {
    id: "ordreNr-antall",
    left: "(ordreNr, prodNr)",
    right: "antall",
    explain: "Hele PK bestemmer antall — det er en direkte FD, ikke transitiv.",
  },
];

// ---------- Steg 4: FK-kobling ----------
type FkSource = { id: string; table: string; col: string };
type FkTarget = { id: string; table: string };

const FK_SOURCES: FkSource[] = [
  { id: "OrdreLinje.ordreNr", table: "OrdreLinje", col: "ordreNr" },
  { id: "OrdreLinje.prodNr", table: "OrdreLinje", col: "prodNr" },
  { id: "Ordre.kundeNr", table: "Ordre", col: "kundeNr" },
  { id: "Kunde.postNr", table: "Kunde", col: "postNr" },
  { id: "Telefon.kundeNr", table: "Telefon", col: "kundeNr" },
];

const FK_TARGETS: FkTarget[] = [
  { id: "Ordre", table: "Ordre" },
  { id: "Produkt", table: "Produkt" },
  { id: "Kunde", table: "Kunde" },
  { id: "Poststed", table: "Poststed" },
];

const FK_ANSWER: Record<string, string> = {
  "OrdreLinje.ordreNr": "Ordre",
  "OrdreLinje.prodNr": "Produkt",
  "Ordre.kundeNr": "Kunde",
  "Kunde.postNr": "Poststed",
  "Telefon.kundeNr": "Kunde",
};

// ===========================================================================
// Hoved-komponent
// ===========================================================================

export function NormaliseringDrill() {
  const steps: DrillStep[] = [
    {
      id: "1nf",
      title: "Finn 1NF-bruddet",
      pillLabel: "1NF",
      render: (ctx) => <Step1 ctx={ctx} />,
      summary: "telefonNumre ut til Telefon(kundeNr, nummer).",
    },
    {
      id: "2nf",
      title: "Finn partielle avhengigheter",
      pillLabel: "2NF",
      render: (ctx) => <Step2 ctx={ctx} />,
      summary: "prodNavn, prodPris ut til Produkt(prodNr, prodNavn, prodPris).",
    },
    {
      id: "3nf",
      title: "Finn den transitive avhengigheten",
      pillLabel: "3NF",
      render: (ctx) => <Step3 ctx={ctx} />,
      summary: "kundeNavn/postNr ut til Kunde, poststed ut til Poststed; Ordre splittet ut.",
    },
    {
      id: "fk",
      title: "Knytt FK-ene riktig",
      pillLabel: "FK",
      render: (ctx) => <Step4 ctx={ctx} />,
      summary: "Alle FK-er knyttet til riktig mottakertabells PK.",
    },
  ];

  return (
    <DrillShell
      id="drill"
      title="Prøv selv — normaliser steg for steg"
      intro={
        <>
          Nå er det din tur. Du tar samme rotete OrdreLinje-tabell gjennom 1NF → 2NF → 3NF og setter
          til slutt FK-ene riktig. Bytt mellom <span className="text-foreground">Lær først</span>{" "}
          (ser fasit + forklaring) og <span className="text-foreground">Test deg selv</span> (må
          svare riktig for å gå videre).
        </>
      }
      steps={steps}
      finalSummary={
        <>
          Du gikk fra <strong>én rotete tabell</strong> til{" "}
          <strong>seks normaliserte tabeller</strong> (OrdreLinje, Ordre, Kunde, Poststed, Produkt,
          Telefon) — og knyttet FK-ene riktig. Det er hele 1NF → 2NF → 3NF-pipelinen på samme
          eksempel som teksten over.
        </>
      }
    />
  );
}

// ===========================================================================
// Steg 1 — 1NF: klikk kolonnen som bryter atomisitet
// ===========================================================================

function Step1({ ctx }: { ctx: DrillStepCtx }) {
  const [pick, setPick] = useState<string | null>(null);
  const [status, setStatus] = useState<StepStatus>("idle");
  const learnMode = ctx.mode === "learn";

  useEffect(() => {
    setPick(null);
    setStatus("idle");
  }, [ctx.resetToken]);

  function onPick(col: string) {
    if (learnMode) return;
    setPick(col);
    const ok = col === STEP1_CORRECT;
    setStatus(ok ? "correct" : "wrong");
    ctx.setDone(ok);
  }

  return (
    <DrillStepCard>
      <DrillPrompt
        icon={<MousePointerClick className="h-4 w-4" />}
        text="Pek på kolonnen som bryter 1NF (atomiske verdier)."
      />

      <ClickableTable
        navn="OrdreLinje (unormalisert)"
        pk={["ordreNr", "prodNr"]}
        kolonner={RAW_COLS}
        rader={ORDRE_RAW}
        selectedCols={pick ? new Set([pick]) : new Set()}
        correctCols={learnMode ? new Set([STEP1_CORRECT]) : new Set()}
        wrongCols={status === "wrong" && pick ? new Set([pick]) : new Set()}
        onColClick={onPick}
        highlightOnHover={!learnMode}
      />

      {learnMode && (
        <DrillHint
          tone="info"
          icon={<Lightbulb className="h-4 w-4" />}
          title="Hvorfor telefonNumre?"
          body="Cellen inneholder en kommaseparert liste («22 11 33, 99 88 77»). 1NF krever ÉN verdi per celle — lister må flyttes ut til egen tabell."
        />
      )}
      {!learnMode && status === "wrong" && (
        <DrillHint
          tone="warn"
          icon={<AlertTriangle className="h-4 w-4" />}
          title="Ikke helt."
          body={STEP1_HINT}
        />
      )}
      {!learnMode && status === "correct" && (
        <DrillHint
          tone="success"
          icon={<CheckCircle2 className="h-4 w-4" />}
          title="Riktig!"
          body="telefonNumre er en kommaseparert liste — bryter 1NF. Flyttes ut til Telefon(kundeNr, nummer). Trykk «Neste» for å se hva som skjer."
        />
      )}
    </DrillStepCard>
  );
}

// ===========================================================================
// Steg 2 — 2NF: multi-select av partielle avhengigheter
// ===========================================================================

function Step2({ ctx }: { ctx: DrillStepCtx }) {
  const [picks, setPicks] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState<StepStatus>("idle");
  const [submitted, setSubmitted] = useState(false);
  const learnMode = ctx.mode === "learn";

  useEffect(() => {
    setPicks(new Set());
    setStatus("idle");
    setSubmitted(false);
  }, [ctx.resetToken]);

  const colsToConsider = STEP_1_COLS.filter((c) => !["ordreNr", "prodNr"].includes(c));

  function onToggle(col: string) {
    if (learnMode) return;
    if (STEP2_PK.has(col)) return;
    setSubmitted(false);
    setStatus("idle");
    setPicks((prev) => {
      const next = new Set(prev);
      if (next.has(col)) next.delete(col);
      else next.add(col);
      return next;
    });
    // Submit har ikke skjedd ennå — fjern eventuell done-status
    ctx.setDone(false);
  }

  function onSubmit() {
    if (learnMode) return;
    setSubmitted(true);
    const same = picks.size === STEP2_CORRECT.size && [...picks].every((c) => STEP2_CORRECT.has(c));
    setStatus(same ? "correct" : "wrong");
    ctx.setDone(same);
  }

  const effectivePicks = learnMode ? STEP2_CORRECT : picks;
  const correct = STEP2_CORRECT;

  return (
    <DrillStepCard>
      <DrillPrompt
        icon={<MousePointerClick className="h-4 w-4" />}
        text="Marker kolonnene som kun avhenger av del av primærnøkkelen (ordreNr, prodNr). Velg én eller flere."
      />

      <ClickableTable
        navn="OrdreLinje (etter 1NF — PK = (ordreNr, prodNr))"
        pk={["ordreNr", "prodNr"]}
        kolonner={STEP_1_COLS}
        rader={STEP_1_ROWS}
        selectedCols={effectivePicks}
        correctCols={learnMode || (submitted && status === "correct") ? correct : new Set()}
        wrongCols={
          submitted && status === "wrong"
            ? new Set([...picks].filter((c) => !correct.has(c)))
            : new Set()
        }
        missingCols={
          submitted && status === "wrong"
            ? new Set([...correct].filter((c) => !picks.has(c)))
            : new Set()
        }
        onColClick={(c) => {
          if (colsToConsider.includes(c)) onToggle(c);
        }}
        nonClickableCols={new Set(["ordreNr", "prodNr"])}
        highlightOnHover={!learnMode}
      />

      {!learnMode && (
        <div className="mt-3 flex items-center gap-3">
          <button
            onClick={onSubmit}
            disabled={picks.size === 0}
            className="rounded-md border border-brand bg-brand/10 px-3 py-1.5 text-xs font-medium text-brand hover:bg-brand/20 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Sjekk svaret
          </button>
          <span className="text-xs text-muted-foreground">{picks.size} valgt</span>
        </div>
      )}

      {learnMode && (
        <DrillHint
          tone="info"
          icon={<Lightbulb className="h-4 w-4" />}
          title="FD: prodNr → prodNavn, prodPris"
          body="prodNavn og prodPris er fullstendig bestemt av prodNr alene — halve PK-en. Det er en partiell avhengighet og bryter 2NF. Flytt ut til Produkt(prodNr, prodNavn, prodPris)."
        />
      )}
      {!learnMode && submitted && status === "correct" && (
        <DrillHint
          tone="success"
          icon={<CheckCircle2 className="h-4 w-4" />}
          title="Riktig!"
          body="prodNavn og prodPris avhenger kun av prodNr — partiell avhengighet. Flytt ut til Produkt(prodNr, prodNavn, prodPris)."
        />
      )}
      {!learnMode && submitted && status === "wrong" && (
        <DrillHint
          tone="warn"
          icon={<AlertTriangle className="h-4 w-4" />}
          title="Ikke helt."
          body="Røde = du valgte feil. Gule = du glemte. Tips: hvilke kolonner bestemmes helt og fullt av prodNr alene? kundeNavn/postNr/poststed avhenger av kundeNr, ikke prodNr — så de gjelder transitiv avhengighet (3NF), ikke partiell."
        />
      )}
    </DrillStepCard>
  );
}

// ===========================================================================
// Steg 3 — 3NF: velg den transitive FD-en
// ===========================================================================

function Step3({ ctx }: { ctx: DrillStepCtx }) {
  const [pick, setPick] = useState<string | null>(null);
  const [status, setStatus] = useState<StepStatus>("idle");
  const learnMode = ctx.mode === "learn";

  useEffect(() => {
    setPick(null);
    setStatus("idle");
  }, [ctx.resetToken]);

  function onPick(id: string) {
    if (learnMode) return;
    setPick(id);
    const fd = STEP3_FDS.find((f) => f.id === id);
    const ok = !!fd?.correct;
    setStatus(ok ? "correct" : "wrong");
    ctx.setDone(ok);
  }

  const correctFd = STEP3_FDS.find((f) => f.correct);

  return (
    <DrillStepCard>
      <DrillPrompt
        icon={<MousePointerClick className="h-4 w-4" />}
        text="Velg den transitive avhengigheten (X → Y → Z der Y ikke er kandidatnøkkel)."
      />

      <div className="grid md:grid-cols-2 gap-3">
        <MiniTable
          navn="OrdreLinje (etter 2NF)"
          pk={["ordreNr", "prodNr"]}
          kolonner={STEP_2_COLS}
          rader={STEP_2_ROWS.slice(0, 3)}
        />
        <div className="space-y-3">
          <MiniTable
            navn="Produkt"
            pk={["prodNr"]}
            kolonner={["prodNr", "prodNavn", "prodPris"]}
            rader={PRODUKT_ROWS}
          />
          <MiniTable
            navn="Telefon"
            pk={["kundeNr", "nummer"]}
            kolonner={["kundeNr", "nummer"]}
            rader={TELEFON_ROWS}
          />
        </div>
      </div>

      <div className="mt-4 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Velg FD-en som er transitiv
      </div>
      <div className="space-y-2">
        {STEP3_FDS.map((fd) => {
          const isPicked = pick === fd.id;
          const showCorrect = learnMode && fd.correct;
          const showWrong = !learnMode && isPicked && status === "wrong";
          const showRight = !learnMode && isPicked && status === "correct";
          return (
            <button
              key={fd.id}
              onClick={() => onPick(fd.id)}
              disabled={learnMode}
              className={cn(
                "w-full text-left rounded-lg border px-3 py-2 transition-colors flex items-center gap-3",
                showCorrect && "border-success bg-success/10",
                showWrong && "border-destructive bg-destructive/10",
                showRight && "border-success bg-success/10",
                !showCorrect &&
                  !showWrong &&
                  !showRight &&
                  "border-border bg-background hover:bg-accent",
                learnMode && !fd.correct && "opacity-50",
              )}
            >
              <span className="font-mono text-sm">
                <span className="text-brand">{fd.left}</span>{" "}
                <span className="text-muted-foreground">→</span>{" "}
                <span className="text-foreground">{fd.right}</span>
              </span>
              {(showCorrect || showRight) && (
                <CheckCircle2 className="h-4 w-4 text-success ml-auto" />
              )}
              {showWrong && <AlertTriangle className="h-4 w-4 text-destructive ml-auto" />}
            </button>
          );
        })}
      </div>

      {learnMode && correctFd && (
        <DrillHint
          tone="info"
          icon={<Lightbulb className="h-4 w-4" />}
          title="Hvorfor er postNr → poststed transitiv?"
          body={correctFd.explain}
        />
      )}
      {!learnMode && status === "wrong" && pick && (
        <DrillHint
          tone="warn"
          icon={<AlertTriangle className="h-4 w-4" />}
          title="Ikke helt."
          body={
            STEP3_FDS.find((f) => f.id === pick)?.explain ??
            "Tenk: hvilken FD går via en ikke-nøkkel?"
          }
        />
      )}
      {!learnMode && status === "correct" && correctFd && (
        <DrillHint
          tone="success"
          icon={<CheckCircle2 className="h-4 w-4" />}
          title="Riktig!"
          body={correctFd.explain}
        />
      )}
    </DrillStepCard>
  );
}

// ===========================================================================
// Steg 4 — FK-er: klikk kilde, klikk mål
// ===========================================================================

function Step4({ ctx }: { ctx: DrillStepCtx }) {
  const [links, setLinks] = useState<Record<string, string>>({});
  const [source, setSource] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const learnMode = ctx.mode === "learn";

  useEffect(() => {
    setLinks({});
    setSource(null);
    setLastError(null);
  }, [ctx.resetToken]);

  function onPickSource(id: string) {
    if (learnMode) return;
    setLastError(null);
    setSource((prev) => (prev === id ? null : id));
  }
  function onPickTarget(id: string) {
    if (learnMode) return;
    if (!source) return;
    const correctTarget = FK_ANSWER[source];
    if (correctTarget !== id) {
      setLastError(`${source} → ${id} er feil. Prøv igjen.`);
      setSource(null);
      return;
    }
    setLastError(null);
    setLinks((prev) => {
      const next = { ...prev, [source]: id };
      const allDone = FK_SOURCES.every((s) => next[s.id]);
      if (allDone) ctx.setDone(true);
      return next;
    });
    setSource(null);
  }

  const effectiveLinks = learnMode ? { ...FK_ANSWER } : links;
  const done = FK_SOURCES.every((s) => effectiveLinks[s.id] === FK_ANSWER[s.id]);

  return (
    <DrillStepCard>
      <DrillPrompt
        icon={<Link2 className="h-4 w-4" />}
        text="Knytt hver FK-kolonne (venstre) til mottakertabellens PK (høyre). Klikk en FK-kolonne, så mål-tabellen den peker til."
      />

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <div className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            FK-kolonner
          </div>
          <ul className="space-y-1.5">
            {FK_SOURCES.map((s) => {
              const linked = effectiveLinks[s.id];
              const selected = source === s.id;
              const correctTarget = FK_ANSWER[s.id];
              const isCorrectLink = linked === correctTarget;
              return (
                <li key={s.id}>
                  <button
                    onClick={() => onPickSource(s.id)}
                    disabled={learnMode || isCorrectLink}
                    className={cn(
                      "w-full text-left rounded-md border px-3 py-2 text-sm font-mono flex items-center justify-between gap-2",
                      selected && "border-brand bg-brand/10",
                      isCorrectLink && "border-success/60 bg-success/5",
                      !selected && !isCorrectLink && "border-border bg-background hover:bg-accent",
                    )}
                  >
                    <span>
                      <span className="text-muted-foreground">{s.table}</span>
                      <span className="text-muted-foreground">.</span>
                      <span className="text-foreground">{s.col}</span>
                    </span>
                    {isCorrectLink && (
                      <span className="text-xs text-success flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> → {linked}
                      </span>
                    )}
                    {selected && !isCorrectLink && (
                      <span className="text-xs text-brand">velg mål →</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <div className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Mål-tabeller (PK)
          </div>
          <ul className="space-y-1.5">
            {FK_TARGETS.map((t) => {
              const isTarget = source !== null;
              return (
                <li key={t.id}>
                  <button
                    onClick={() => onPickTarget(t.id)}
                    disabled={learnMode || !isTarget}
                    className={cn(
                      "w-full text-left rounded-md border px-3 py-2 text-sm font-mono flex items-center gap-2",
                      isTarget
                        ? "border-brand/40 bg-background hover:bg-brand/10 cursor-pointer"
                        : "border-border bg-background text-muted-foreground cursor-default",
                    )}
                  >
                    <KeyRound className="h-3.5 w-3.5 text-success" />
                    <span className="text-foreground">{t.table}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {learnMode && (
        <DrillHint
          tone="info"
          icon={<Lightbulb className="h-4 w-4" />}
          title="Fasit: hver FK peker på PK i mottakertabellen"
          body="OrdreLinje.ordreNr → Ordre, OrdreLinje.prodNr → Produkt, Ordre.kundeNr → Kunde, Kunde.postNr → Poststed, Telefon.kundeNr → Kunde. FK-er gjør JOIN mulig og opprettholder referanseintegritet."
        />
      )}
      {!learnMode && lastError && (
        <DrillHint
          tone="warn"
          icon={<AlertTriangle className="h-4 w-4" />}
          title="Feil kobling."
          body={`${lastError} Hint: en FK skal peke til tabellen der den verdien ER primærnøkkel.`}
        />
      )}
      {!learnMode && done && !lastError && (
        <DrillHint
          tone="success"
          icon={<CheckCircle2 className="h-4 w-4" />}
          title="Alle FK-er er riktig satt!"
          body="Du har et fullstendig 3NF-skjema med referanseintegritet. Trykk «Neste» for å se sluttoppsummering."
        />
      )}
    </DrillStepCard>
  );
}

// ===========================================================================
// Hjelpe-komponenter (interne — ikke en del av shell-API-en)
// ===========================================================================

function ClickableTable({
  navn,
  pk,
  kolonner,
  rader,
  selectedCols,
  correctCols,
  wrongCols,
  missingCols,
  onColClick,
  nonClickableCols,
  highlightOnHover,
}: {
  navn: string;
  pk: string[];
  kolonner: string[];
  rader: (string | number)[][];
  selectedCols: Set<string>;
  correctCols?: Set<string>;
  wrongCols?: Set<string>;
  missingCols?: Set<string>;
  onColClick: (c: string) => void;
  nonClickableCols?: Set<string>;
  highlightOnHover?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-background overflow-hidden">
      <div className="px-3 py-2 border-b border-border flex items-center justify-between flex-wrap gap-2">
        <h4 className="font-semibold text-sm">{navn}</h4>
        <div className="text-xs text-muted-foreground">
          PK = (<span className="text-success font-mono">{pk.join(", ")}</span>)
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="text-xs font-mono w-full">
          <thead className="bg-muted/40">
            <tr>
              {kolonner.map((c) => {
                const isPk = pk.includes(c);
                const selected = selectedCols.has(c);
                const correct = correctCols?.has(c);
                const wrong = wrongCols?.has(c);
                const missing = missingCols?.has(c);
                const clickable = !nonClickableCols?.has(c);
                return (
                  <th
                    key={c}
                    onClick={() => clickable && onColClick(c)}
                    className={cn(
                      "px-2 py-1.5 text-left border-b border-border whitespace-nowrap select-none",
                      isPk && "text-success",
                      clickable && highlightOnHover && "cursor-pointer hover:bg-brand/10",
                      !clickable && "cursor-not-allowed opacity-80",
                      correct && "bg-success/20 text-success",
                      wrong && "bg-destructive/20 text-destructive",
                      missing && "bg-amber-500/20 text-amber-600 dark:text-amber-400",
                      selected && !correct && !wrong && "bg-brand/15 text-brand",
                    )}
                    title={
                      !clickable
                        ? "PK-kolonne — del av nøkkelen, ikke en attributt-avhengighet"
                        : "Klikk for å velge"
                    }
                  >
                    {c}
                    {correct && <CheckCircle2 className="inline h-3 w-3 ml-1 text-success" />}
                    {wrong && <AlertTriangle className="inline h-3 w-3 ml-1 text-destructive" />}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rader.map((rad, ri) => (
              <tr key={ri} className="border-b border-border/60 last:border-b-0">
                {rad.map((celle, ci) => {
                  const col = kolonner[ci];
                  const correct = correctCols?.has(col);
                  const wrong = wrongCols?.has(col);
                  const missing = missingCols?.has(col);
                  const selected = selectedCols.has(col);
                  return (
                    <td
                      key={ci}
                      className={cn(
                        "px-2 py-1 whitespace-nowrap",
                        correct && "bg-success/10",
                        wrong && "bg-destructive/10",
                        missing && "bg-amber-500/10",
                        selected && !correct && !wrong && "bg-brand/5",
                      )}
                    >
                      {celle === null || celle === undefined ? (
                        <span className="text-muted-foreground/50">NULL</span>
                      ) : (
                        String(celle)
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MiniTable({
  navn,
  pk,
  kolonner,
  rader,
}: {
  navn: string;
  pk: string[];
  kolonner: string[];
  rader: (string | number)[][];
}) {
  return (
    <div className="rounded-lg border border-border bg-background overflow-hidden">
      <div className="px-2.5 py-1.5 border-b border-border flex items-center justify-between gap-2">
        <h5 className="font-semibold text-xs">{navn}</h5>
        <div className="text-[10px] text-muted-foreground">
          PK = <span className="text-success font-mono">{pk.join(", ")}</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="text-[11px] font-mono w-full">
          <thead className="bg-muted/30">
            <tr>
              {kolonner.map((c) => (
                <th
                  key={c}
                  className={cn(
                    "px-1.5 py-1 text-left border-b border-border whitespace-nowrap",
                    pk.includes(c) && "text-success",
                  )}
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rader.map((rad, ri) => (
              <tr key={ri} className="border-b border-border/60 last:border-b-0">
                {rad.map((celle, ci) => (
                  <td key={ci} className="px-1.5 py-0.5 whitespace-nowrap">
                    {celle === null || celle === undefined ? (
                      <span className="text-muted-foreground/50">NULL</span>
                    ) : (
                      String(celle)
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Eksporter også slutt-skjemaet som referanse (brukes om vi senere vil vise
// pre-tegnet FK-arrow-summary).
export const FINAL_SCHEMA_TABLES = [
  {
    navn: "OrdreLinje",
    pk: ["ordreNr", "prodNr"],
    kolonner: STEP_3_ORDRELINJE_COLS,
    rader: STEP_3_ORDRELINJE_ROWS,
  },
  { navn: "Ordre", pk: ["ordreNr"], kolonner: ["ordreNr", "kundeNr"], rader: STEP_3_ORDRE_ROWS },
  {
    navn: "Kunde",
    pk: ["kundeNr"],
    kolonner: ["kundeNr", "kundeNavn", "postNr"],
    rader: STEP_3_KUNDE_ROWS,
  },
  {
    navn: "Poststed",
    pk: ["postNr"],
    kolonner: ["postNr", "poststed"],
    rader: STEP_3_POSTSTED_ROWS,
  },
  {
    navn: "Produkt",
    pk: ["prodNr"],
    kolonner: ["prodNr", "prodNavn", "prodPris"],
    rader: PRODUKT_ROWS,
  },
  {
    navn: "Telefon",
    pk: ["kundeNr", "nummer"],
    kolonner: ["kundeNr", "nummer"],
    rader: TELEFON_ROWS,
  },
];
