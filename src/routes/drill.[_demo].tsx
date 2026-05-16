import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, AlertTriangle, Lightbulb, MousePointerClick } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import {
  DrillShell,
  DrillPrompt,
  DrillHint,
  DrillStepCard,
  type DrillStep,
  type DrillStepCtx,
} from "@/components/learn/DrillShell";
import { cn } from "@/lib/utils";

/**
 * Intern utvikler-side: `/drill/_demo`
 *
 * Selv-test av `DrillShell` — minimalt 2-stegs drill som dekker
 *  - en single-select-interaksjon (Steg 1)
 *  - en multi-select med submit (Steg 2)
 *
 * Brukes for å regresjons-teste shellet etter endringer uten å måtte
 * pløye gjennom en av de migrerte produktiv-drillene (BigO/Normalisering).
 */
export const Route = createFileRoute("/drill/_demo")({
  head: () => ({
    meta: [
      { title: "DrillShell-demo (intern) — SQL Sandbox" },
      {
        name: "description",
        content:
          "Intern demo-side for DrillShell-komponenten. Brukes for å verifisere at shellet håndterer både single-select og multi-select-steg riktig.",
      },
    ],
  }),
  component: DrillDemoPage,
});

function DrillDemoPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <header className="mb-6">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
            <span className="rounded-sm border border-warning/40 bg-warning/10 px-1.5 py-0.5 text-warning">
              intern
            </span>
            <span>dev-tool</span>
          </div>
          <h1 className="text-2xl font-bold mt-1">DrillShell-demo</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Minimal 2-stegs drill for å verifisere at shellet håndterer single-select og
            multi-select-interaksjoner riktig.
          </p>
        </header>

        <DemoDrill />
      </main>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Demo-drill — 2 steg
// ---------------------------------------------------------------------------

function DemoDrill() {
  const steps: DrillStep[] = [
    {
      id: "color",
      title: "Velg primærfargen",
      pillLabel: "Farge",
      render: (ctx) => <ColorStep ctx={ctx} />,
      summary: "Brand-fargen er blå.",
    },
    {
      id: "primes",
      title: "Marker alle primtall under 10",
      pillLabel: "Primtall",
      render: (ctx) => <PrimesStep ctx={ctx} />,
      summary: "2, 3, 5, 7 er primtall under 10.",
    },
  ];

  return (
    <DrillShell
      id="demo-drill"
      title="Demo: 2-stegs drill"
      intro="Bytt mellom modus og naviger steg for å validere shellets oppførsel."
      steps={steps}
      finalSummary="Du har testet både single-select og multi-select-flyt. Shellet fungerer."
    />
  );
}

// Steg 1: single-select
const COLORS = [
  { id: "red", label: "Rød" },
  { id: "blue", label: "Blå", correct: true },
  { id: "green", label: "Grønn" },
];

function ColorStep({ ctx }: { ctx: DrillStepCtx }) {
  const [pick, setPick] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "wrong" | "correct">("idle");
  const learnMode = ctx.mode === "learn";

  useEffect(() => {
    setPick(null);
    setStatus("idle");
  }, [ctx.resetToken]);

  function onPick(id: string) {
    if (learnMode) return;
    setPick(id);
    const opt = COLORS.find((c) => c.id === id);
    const ok = !!opt?.correct;
    setStatus(ok ? "correct" : "wrong");
    ctx.setDone(ok);
  }

  const correctId = COLORS.find((c) => c.correct)?.id;
  const effectivePick = learnMode ? correctId : pick;

  return (
    <DrillStepCard>
      <DrillPrompt
        icon={<MousePointerClick className="h-4 w-4" />}
        text="Hvilken farge er platformens brand-farge?"
      />
      <div className="grid sm:grid-cols-3 gap-2">
        {COLORS.map((c) => {
          const isPicked = effectivePick === c.id;
          const showCorrect = learnMode && c.correct;
          const showWrong = !learnMode && isPicked && status === "wrong";
          const showRight = !learnMode && isPicked && status === "correct";
          return (
            <button
              key={c.id}
              onClick={() => onPick(c.id)}
              disabled={learnMode}
              className={cn(
                "rounded-lg border px-3 py-2 text-sm transition-colors flex items-center justify-between gap-2",
                showCorrect && "border-success bg-success/10",
                showWrong && "border-destructive bg-destructive/10",
                showRight && "border-success bg-success/10",
                !showCorrect &&
                  !showWrong &&
                  !showRight &&
                  "border-border bg-background hover:bg-accent",
                learnMode && !c.correct && "opacity-50",
              )}
            >
              <span>{c.label}</span>
              {(showCorrect || showRight) && <CheckCircle2 className="h-4 w-4 text-success" />}
              {showWrong && <AlertTriangle className="h-4 w-4 text-destructive" />}
            </button>
          );
        })}
      </div>
      {learnMode && (
        <DrillHint
          tone="info"
          icon={<Lightbulb className="h-4 w-4" />}
          title="Fasit: Blå"
          body="Brand-fargen i platformens design-token er en blå-toning."
        />
      )}
    </DrillStepCard>
  );
}

// Steg 2: multi-select med submit
const NUMBERS = [2, 3, 4, 5, 6, 7, 8, 9];
const PRIMES = new Set([2, 3, 5, 7]);

function PrimesStep({ ctx }: { ctx: DrillStepCtx }) {
  const [picks, setPicks] = useState<Set<number>>(new Set());
  const [status, setStatus] = useState<"idle" | "wrong" | "correct">("idle");
  const [submitted, setSubmitted] = useState(false);
  const learnMode = ctx.mode === "learn";

  useEffect(() => {
    setPicks(new Set());
    setStatus("idle");
    setSubmitted(false);
  }, [ctx.resetToken]);

  function onToggle(n: number) {
    if (learnMode) return;
    setSubmitted(false);
    setStatus("idle");
    setPicks((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });
    ctx.setDone(false);
  }

  function onSubmit() {
    if (learnMode) return;
    setSubmitted(true);
    const same = picks.size === PRIMES.size && [...picks].every((n) => PRIMES.has(n));
    setStatus(same ? "correct" : "wrong");
    ctx.setDone(same);
  }

  const effective = learnMode ? PRIMES : picks;

  return (
    <DrillStepCard>
      <DrillPrompt
        icon={<MousePointerClick className="h-4 w-4" />}
        text="Klikk alle primtall under 10."
      />
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
        {NUMBERS.map((n) => {
          const picked = effective.has(n);
          const correct = PRIMES.has(n);
          const showCorrect =
            (learnMode && correct) || (submitted && status === "correct" && correct);
          const showWrong = submitted && status === "wrong" && picks.has(n) && !PRIMES.has(n);
          const showMissing = submitted && status === "wrong" && !picks.has(n) && PRIMES.has(n);
          return (
            <button
              key={n}
              onClick={() => onToggle(n)}
              disabled={learnMode}
              className={cn(
                "h-10 rounded-md border text-sm font-mono",
                showCorrect && "border-success bg-success/15 text-success",
                showWrong && "border-destructive bg-destructive/15 text-destructive",
                showMissing && "border-amber-500 bg-amber-500/15 text-amber-600",
                !showCorrect &&
                  !showWrong &&
                  !showMissing &&
                  picked &&
                  "border-brand bg-brand/10 text-brand",
                !showCorrect &&
                  !showWrong &&
                  !showMissing &&
                  !picked &&
                  "border-border bg-background hover:bg-accent",
              )}
            >
              {n}
            </button>
          );
        })}
      </div>
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
          title="Primtall under 10"
          body="2, 3, 5 og 7 er primtall. 4, 6, 8 og 9 er sammensatte."
        />
      )}
      {!learnMode && submitted && status === "correct" && (
        <DrillHint
          tone="success"
          icon={<CheckCircle2 className="h-4 w-4" />}
          title="Riktig!"
          body="2, 3, 5, 7 — fasit."
        />
      )}
      {!learnMode && submitted && status === "wrong" && (
        <DrillHint
          tone="warn"
          icon={<AlertTriangle className="h-4 w-4" />}
          title="Ikke helt."
          body="Røde = du valgte feil, gule = du glemte. Et primtall er > 1 og bare delelig på 1 og seg selv."
        />
      )}
    </DrillStepCard>
  );
}
