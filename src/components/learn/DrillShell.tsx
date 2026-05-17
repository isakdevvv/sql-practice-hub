import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  BookOpen,
  Dumbbell,
  CheckCircle2,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  clearDrillProgress,
  getDrillProgress,
  setDrillProgress,
  type DrillProgress,
} from "@/lib/learn/drillProgress";

// ---------------------------------------------------------------------------
// DrillShell — generisk vert for to-modus («Lær først» / «Test deg selv»)
// drilløvinger på platformen.
//
// Designprinsipp: shell eier KUN boilerplate (modus-toggle, progress-strip,
// akkumulert kontekst, nav-knapper, ferdig-panel). Den dikterer ikke
// interaksjons-type, antall steg, eller hvordan svar valideres. Hver drill-
// forfatter leverer en liste `DrillStep` og bestemmer selv hvilken JSX
// som rendres + når et steg er fullført (via `done`-prop på render-ctx).
//
// Hvorfor ikke en `onCheck()`-callback i hvert steg? Fordi noen drills sjekker
// på submit (multi-select), noen auto-fullfører på riktig klikk (single-select),
// noen krever alle riktige før de er done (FK-kobling), noen aksepterer
// progressive sub-steg (TransaksjonsIsolasjon). En enkel onCheck-API kunne
// ikke dekke alle disse uten å bli en switch-statement. I stedet eier hvert
// steg sin egen state og rapporterer `done` til shellet via `setDone`.
//
// Per user-memory `feedback_drill_learn_then_practice`: modus-toggle er
// globalt på toppen (ikke per-steg), default «Lær først».
// ---------------------------------------------------------------------------

export type DrillMode = "learn" | "drill";

export type DrillStepCtx = {
  /** Aktiv modus. I "learn" skal innholdet vise fasit + forklaring opp-front, ikke kreve input. */
  mode: DrillMode;
  /** True hvis shellet vurderer steget som fullført (drill-forfatter har kalt setDone(true)). */
  done: boolean;
  /** Marker steget som fullført / ikke-fullført. Kalles av drill-forfatteren når egen state-evaluering bestemmer det. */
  setDone: (done: boolean) => void;
  /** Token som endrer seg når brukeren trykker «Start på nytt» — bruk i `useEffect` for å nullstille per-steg state. */
  resetToken: number;
  /** Indeks for dette steget (0-basert). */
  stepIndex: number;
};

export type DrillStep = {
  /** Stabilt id; brukes som React-nøkkel og for evt. fremtidig localStorage. */
  id: string;
  /** Vises i steg-headeren og over progress-pillen. */
  title: string;
  /** Kort label på progress-pillen (≤ ~10 tegn). Default: `${stepIndex + 1}`. */
  pillLabel?: string;
  /** Selve interaktivt innhold. Returner JSX. Bruk `ctx.mode` til å vise fasit i «Lær først». */
  render: (ctx: DrillStepCtx) => ReactNode;
  /** Kompakt sammendragskort vist i akkumulert-kontekst-stripen ETTER at steget er fullført. */
  summary: ReactNode;
};

export type DrillShellProps = {
  /**
   * Stabilt id; brukes som section-id (for anker-lenker som `#drill`) og som
   * default nøkkel for localStorage-progress hvis `storageId` ikke er gitt.
   *
   * Mange migrerte drills setter `id="drill"` fordi de er en seksjon nedi
   * en større side og forventer anker `#drill`. Det betyr at vi MÅ ha en
   * separat `storageId`-mulighet — uten den ville flere drills dele samme
   * localStorage-record fordi de alle har `id="drill"`.
   */
  id: string;
  /**
   * Stabilt id KUN for localStorage-progress-record. Sett dette til
   * drill-registerets `id` (f.eks. `"normalisering"`, `"big-o"`) når
   * `id`-propen brukes som section-anker. Hvis ikke gitt, faller vi
   * tilbake til `id`.
   */
  storageId?: string;
  /** Stor h2-overskrift over modus-toggle. */
  title: string;
  /** Kort intro vist under tittelen. ReactNode for å støtte inline-formatering. */
  intro?: ReactNode;
  /** Stegliste. Rekkefølgen i arrayet er rekkefølgen i UI-en. */
  steps: DrillStep[];
  /** JSX som vises i ferdig-panelet når alle steg er fullført. */
  finalSummary: ReactNode;
  /** Tittel på ferdig-panelet. Default: "Ferdig!" */
  finalTitle?: string;
  /** Startmodus. Default "learn" per pedagogisk kontrakt (lær først, prøv selv). */
  defaultMode?: DrillMode;
};

// ===========================================================================
// Hoved-komponent
// ===========================================================================

export function DrillShell({
  id,
  storageId,
  title,
  intro,
  steps,
  finalSummary,
  finalTitle = "Ferdig!",
  defaultMode = "learn",
}: DrillShellProps) {
  // localStorage-nøkkel — falbacker til section-id hvis caller ikke spesifiserer.
  const progressKey = storageId ?? id;
  const [mode, setMode] = useState<DrillMode>(defaultMode);
  const [stepIdx, setStepIdx] = useState(0);

  // Per-steg "done"-flagg eies av shellet; hver render-funksjon kaller setDone
  // for sitt steg via DrillStepCtx. I "learn"-modus telles ALLE steg som done
  // automatisk (fasit synes opp-front), uavhengig av brukerens input.
  const [doneFlags, setDoneFlags] = useState<boolean[]>(() => steps.map(() => false));

  // Resett-token: økes ved «Start på nytt», så enkelte drills kan reagere via
  // useEffect (f.eks. tømme egen lokal state) uten å trenge ekstern API.
  const [resetToken, setResetToken] = useState(0);

  // Persistert progress fra localStorage — leses én gang ved mount og brukes
  // til (a) "fullført tidligere"-banneret og (b) som referanse for å unngå å
  // skrive samme record om igjen ved hver render. `null` = ingen record.
  // Vi leser kun ved mount; oppdateringer skjer via setDrillProgress nedenfor.
  const [persisted, setPersisted] = useState<DrillProgress | null>(() => {
    // SSR-safe: getDrillProgress håndterer typeof window === "undefined".
    return getDrillProgress(progressKey);
  });
  // Vi viser "Du har fullført denne tidligere"-banneret kun hvis brukeren
  // landet på siden med en allerede-fullført record. Banneret skal IKKE
  // poppe opp på nytt rett etter at brukeren akkurat fullførte sesjonen.
  const completedAtMount = useRef<boolean>(persisted?.completed != null);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const learnMode = mode === "learn";

  const setDoneAt = useCallback((idx: number, done: boolean) => {
    setDoneFlags((prev) => {
      if (prev[idx] === done) return prev;
      const next = prev.slice();
      next[idx] = done;
      return next;
    });
  }, []);

  const effectiveDone = useMemo(
    () => (learnMode ? steps.map(() => true) : doneFlags),
    [learnMode, steps, doneFlags],
  );

  const allDone = effectiveDone.every(Boolean);

  // ----- Persisterer progress til localStorage --------------------------
  //
  // Vi skiller bevisst MELLOM "learn"-modus og "drill"-modus:
  // - I "learn" telles alle steg som done (fasit synes), så hvis vi skrev
  //   automatisk ville hub-en alltid vise "Fullført" så snart brukeren
  //   åpnet et drill. Det er pedagogisk feil — fullført skal bety at
  //   brukeren har testet seg selv. Derfor skriver vi KUN i "drill"-modus,
  //   og baserer state på `doneFlags` (ikke `effectiveDone`).
  //
  // - Første interaksjon (overgangen fra 0 → 1 done-steg) markerer
  //   `started`. Når alle steg er done, markeres `completed`.
  //
  // - Vi bruker doneFlags direkte i deps for å unngå at effekten kjøres
  //   ved hver mount-bytte av andre states.
  //
  // - Hvis brukeren trykker «Start på nytt» nullstilles doneFlags til alt
  //   false, men persistedet rør vi ikke (det er en separat brukerhandling
  //   via banneret eller via DrillShell's reset-knapp som vi lar stå urørt
  //   — det føles riktig at å "starte på nytt" i sesjonen ikke sletter at
  //   du har fullført drillet tidligere).
  const drillDoneCount = useMemo(
    () => (learnMode ? 0 : doneFlags.filter(Boolean).length),
    [learnMode, doneFlags],
  );
  useEffect(() => {
    if (learnMode) return;
    if (drillDoneCount === 0) return;
    const total = steps.length;
    const isComplete = drillDoneCount === total;
    const existing = getDrillProgress(progressKey);
    const next: Partial<DrillProgress> = {
      stepsDone: drillDoneCount,
      totalSteps: total,
    };
    // Bare sett `started` første gang.
    if (!existing) next.started = new Date().toISOString();
    // Bare sett `completed` første gang vi når full.
    if (isComplete && !existing?.completed) next.completed = new Date().toISOString();
    setDrillProgress(progressKey, next);
  }, [progressKey, learnMode, drillDoneCount, steps.length]);

  function dismissCompletedBanner() {
    setBannerDismissed(true);
  }
  function startOverFromBanner() {
    // Banner-handling: nullstill BÅDE sesjons-state og localStorage-record,
    // og bytt til "drill"-modus så brukeren faktisk gjør stegene selv.
    clearDrillProgress(progressKey);
    setPersisted(null);
    completedAtMount.current = false;
    setBannerDismissed(true);
    setMode("drill");
    setStepIdx(0);
    setDoneFlags(steps.map(() => false));
    setResetToken((t) => t + 1);
  }

  const showCompletedBanner =
    completedAtMount.current && !bannerDismissed && persisted?.completed != null;

  const canAdvance = useCallback(() => {
    if (learnMode) return true;
    return effectiveDone[stepIdx];
  }, [learnMode, effectiveDone, stepIdx]);

  function onPrev() {
    if (stepIdx > 0) setStepIdx(stepIdx - 1);
  }
  function onNext() {
    if (!canAdvance()) return;
    if (stepIdx < steps.length - 1) setStepIdx(stepIdx + 1);
  }

  function resetAll() {
    setStepIdx(0);
    setDoneFlags(steps.map(() => false));
    setResetToken((t) => t + 1);
  }

  function onModeChange(m: DrillMode) {
    setMode(m);
    // Bytte til "drill" nullstiller all framgang — brukeren skal teste fra null.
    // Bytte til "learn" trenger ikke nullstilling; effectiveDone overstyrer uansett.
    if (m === "drill") {
      resetAll();
    }
  }

  // Antall fullførte steg (for ferdig-panelets visning). I learn-modus settes
  // ferdig-panelet vises ved navigering til siste steg.
  const completedBeforeCurrent = useMemo(
    () =>
      effectiveDone
        .map((d, i) => (i < stepIdx && d ? steps[i] : null))
        .filter(Boolean) as DrillStep[],
    [effectiveDone, stepIdx, steps],
  );

  const activeStep = steps[stepIdx];

  return (
    <section id={id} className="mb-12">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      {intro && <div className="text-sm text-muted-foreground mb-4">{intro}</div>}

      {showCompletedBanner && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-success/40 bg-success/5 p-3">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-success mt-0.5" />
          <div className="flex-1 text-sm">
            <strong className="text-success">Du har fullført denne tidligere.</strong>{" "}
            <span className="text-foreground">
              Vil du starte på nytt? Det nullstiller framdriften og bytter til «Test deg
              selv»-modus.
            </span>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                onClick={startOverFromBanner}
                className="inline-flex items-center gap-1.5 rounded-md border border-brand bg-brand/10 px-3 py-1 text-xs font-medium text-brand hover:bg-brand/20"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Start på nytt
              </button>
              <button
                onClick={dismissCompletedBanner}
                className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1 text-xs text-muted-foreground hover:bg-accent"
              >
                <X className="h-3.5 w-3.5" /> Behold framdrift
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modus-toggle */}
      <div
        role="tablist"
        aria-label="Modus"
        className="mb-4 inline-flex rounded-lg border border-border bg-muted/30 p-1"
      >
        <button
          role="tab"
          aria-selected={mode === "learn"}
          onClick={() => onModeChange("learn")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
            mode === "learn"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <BookOpen className="h-3.5 w-3.5" /> Lær først
        </button>
        <button
          role="tab"
          aria-selected={mode === "drill"}
          onClick={() => onModeChange("drill")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
            mode === "drill"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Dumbbell className="h-3.5 w-3.5" /> Test deg selv
        </button>
      </div>

      {/* Progress-strip + nav */}
      <div className="mb-4 rounded-xl border border-border bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {steps.map((s, i) => {
              const done = effectiveDone[i];
              const active = i === stepIdx;
              const pill = s.pillLabel ?? `${i + 1}`;
              return (
                <button
                  key={s.id}
                  onClick={() => setStepIdx(i)}
                  title={s.title}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs transition-colors flex items-center gap-1.5",
                    active
                      ? "border-brand bg-brand/10 text-brand"
                      : done
                        ? "border-success/50 text-success hover:bg-success/5"
                        : "border-border text-muted-foreground hover:bg-accent",
                  )}
                >
                  {done && !active ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <span className="font-bold">{i + 1}</span>
                  )}
                  <span>{pill}</span>
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs tabular-nums text-muted-foreground">
              Steg {stepIdx + 1} / {steps.length}
            </span>
            <button
              onClick={onPrev}
              disabled={stepIdx === 0}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Forrige steg"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={onNext}
              disabled={!canAdvance() || stepIdx === steps.length - 1}
              className="flex h-7 items-center justify-center rounded-md border border-brand bg-brand/10 px-2 text-xs text-brand hover:bg-brand/20 disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Neste steg"
            >
              Neste <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
            </button>
            <button
              onClick={resetAll}
              className="flex h-7 items-center justify-center rounded-md border border-border px-2 text-xs text-muted-foreground hover:bg-accent"
              title="Start på nytt"
              aria-label="Start på nytt"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <div className="mt-3 text-sm font-semibold text-foreground">{activeStep.title}</div>
      </div>

      {/* Akkumulert kontekst: sammendrag av tidligere fullførte steg */}
      {completedBeforeCurrent.length > 0 && <AccumulatedContext steps={completedBeforeCurrent} />}

      {/* Aktivt steg-innhold */}
      <div className="mt-4">
        {activeStep.render({
          mode,
          done: effectiveDone[stepIdx],
          setDone: (d) => setDoneAt(stepIdx, d),
          resetToken,
          stepIndex: stepIdx,
        })}
      </div>

      {/* Ferdig-panel — vises kun når alle steg er done OG vi står på siste steg.
          (Hindrer at panelet pop'er opp midt i learn-modus før brukeren har sett alle steg.) */}
      {allDone && stepIdx === steps.length - 1 && (
        <DonePanel title={finalTitle} body={finalSummary} onReset={resetAll} />
      )}
    </section>
  );
}

// ===========================================================================
// Akkumulert-kontekst-stripe
// ===========================================================================

function AccumulatedContext({ steps }: { steps: DrillStep[] }) {
  // Tre-kolonners grid på sm+; én kolonne på mobil. Drill-forfatter avgjør
  // innhold per summary-prop; shellet legger på rammen + sjekk-merket.
  return (
    <div className={cn("mt-2 grid gap-2", steps.length >= 3 ? "sm:grid-cols-3" : "sm:grid-cols-2")}>
      {steps.map((s, i) => (
        <div key={s.id} className="rounded-md border border-success/30 bg-success/5 px-3 py-2">
          <div className="text-xs font-semibold text-success flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> {s.pillLabel ?? `Steg ${i + 1}`}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">{s.summary}</div>
        </div>
      ))}
    </div>
  );
}

// ===========================================================================
// Ferdig-panel
// ===========================================================================

function DonePanel({
  title,
  body,
  onReset,
}: {
  title: string;
  body: ReactNode;
  onReset: () => void;
}) {
  return (
    <div className="mt-6 rounded-xl border-2 border-success/50 bg-success/5 p-5">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="h-5 w-5 text-success" />
        <h3 className="font-semibold text-lg text-success">{title}</h3>
      </div>
      <div className="text-sm text-foreground mb-3">{body}</div>
      <button
        onClick={onReset}
        className="inline-flex items-center gap-1.5 rounded-md border border-brand bg-brand/10 px-3 py-1.5 text-xs font-medium text-brand hover:bg-brand/20"
      >
        <RotateCcw className="h-3.5 w-3.5" /> Start på nytt
      </button>
    </div>
  );
}

// ===========================================================================
// Gjenbrukbare hjelpe-komponenter for drill-forfattere (valgfrie, eksporterte)
// ===========================================================================

/** Liten prompt-rad: ikon + tekst, brukes som intro inne i hvert steg. */
export function DrillPrompt({ icon, text }: { icon: ReactNode; text: ReactNode }) {
  return (
    <div className="mb-3 flex items-start gap-2 text-sm">
      <span className="text-brand mt-0.5 shrink-0">{icon}</span>
      <span className="text-foreground">{text}</span>
    </div>
  );
}

/**
 * Standard hint-boks i tre toner. Drill-forfattere bruker denne for læringstips
 * (info), feilfeedback (warn) og bekreftelse (success).
 */
export function DrillHint({
  tone,
  icon,
  title,
  body,
}: {
  tone: "info" | "warn" | "success";
  icon: ReactNode;
  title: string;
  body: ReactNode;
}) {
  const styles =
    tone === "info"
      ? "border-brand/30 bg-brand/5 text-foreground"
      : tone === "warn"
        ? "border-destructive/30 bg-destructive/5 text-foreground"
        : "border-success/30 bg-success/5 text-foreground";
  const iconColor =
    tone === "info" ? "text-brand" : tone === "warn" ? "text-destructive" : "text-success";
  const titleColor =
    tone === "info" ? "text-brand" : tone === "warn" ? "text-destructive" : "text-success";

  return (
    <div className={cn("mt-3 rounded-lg border p-3 flex items-start gap-2", styles)}>
      <span className={cn("mt-0.5 shrink-0", iconColor)}>{icon}</span>
      <div className="text-sm">
        <strong className={titleColor}>{title}</strong> <span>{body}</span>
      </div>
    </div>
  );
}

/**
 * Standard container rundt et stegs aktivinnhold (brand-rammet kort).
 * Drill-forfattere kan velge å bruke den (vanlig look) eller wrappe innholdet selv.
 */
export function DrillStepCard({ children }: { children: ReactNode }) {
  return <div className="rounded-xl border-2 border-brand/30 bg-card p-4">{children}</div>;
}
