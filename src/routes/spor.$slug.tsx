import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BookOpen, Check, ChevronLeft, Clock, Lightbulb, Sparkles, Wrench } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { getTrack, type Track, type TrackStep } from "@/lib/learn/tracks";
import { TRINN } from "@/lib/stack/content";
import { PY_EXERCISES } from "@/lib/python/exercises";
import { loadPyProgress } from "@/lib/python/pyProgress";

export const Route = createFileRoute("/spor/$slug")({
  loader: ({ params }) => {
    const track = getTrack(params.slug);
    if (!track) throw notFound();
    return { track };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.track.label} — Spor` },
      { name: "description", content: loaderData?.track.blurb },
    ],
  }),
  component: TrackPage,
});

interface ResolvedStep {
  kind: TrackStep["kind"];
  title: string;
  href: string;
  note?: string;
  /** True hvis stack-siden eller python-oppgaven faktisk eksisterer. */
  found: boolean;
  /** Brukerens fremgang — kun relevant for kind="exercise". */
  solved: boolean;
}

function TrackPage() {
  const { track } = Route.useLoaderData();
  const [pySolved, setPySolved] = useState<Record<string, true>>({});

  useEffect(() => {
    setPySolved(loadPyProgress().solved);
  }, []);

  const trinnBySlug = useMemo(() => {
    const m = new Map<string, (typeof TRINN)[number]>();
    for (const t of TRINN) m.set(t.slug, t);
    return m;
  }, []);

  const exerciseById = useMemo(() => {
    const m = new Map<string, (typeof PY_EXERCISES)[number]>();
    for (const e of PY_EXERCISES) m.set(e.id, e);
    return m;
  }, []);

  const resolve = (step: TrackStep): ResolvedStep => {
    if (step.kind === "exercise") {
      const ex = exerciseById.get(step.ref);
      return {
        kind: step.kind,
        title: ex?.title ?? step.ref,
        href: `/python#${encodeURIComponent(step.ref)}`,
        note: step.note ?? ex?.topic,
        found: !!ex,
        solved: !!pySolved[step.ref],
      };
    }
    // stack or capstone — both link to /stack/<slug>
    const tr = trinnBySlug.get(step.ref);
    return {
      kind: step.kind,
      title: tr?.title ?? step.ref,
      href: `/stack/${step.ref}`,
      note: step.note ?? tr?.shortDescription,
      found: !!tr,
      solved: false,
    };
  };

  // Progresjons-statistikk: hvor mange oppgaver er løst i sporet?
  const totalExercises = track.sections.reduce(
    (sum, s) => sum + s.steps.filter((st) => st.kind === "exercise").length,
    0,
  );
  const solvedExercises = track.sections.reduce(
    (sum, s) =>
      sum + s.steps.filter((st) => st.kind === "exercise" && pySolved[st.ref]).length,
    0,
  );

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-10 max-w-4xl">
        <Link
          to="/spor"
          className="text-sm text-muted-foreground hover:text-foreground mb-3 inline-flex items-center"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Alle spor
        </Link>

        <header className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            Læringsspor
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{track.label}</h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">{track.longDescription}</p>

          <div className="mt-4 grid sm:grid-cols-3 gap-3">
            <Stat icon={<Clock className="h-4 w-4" />} label="Estimert tid" value={track.estimatedHours} />
            <Stat
              icon={<BookOpen className="h-4 w-4" />}
              label="Forutsetninger"
              value={track.prerequisites.join(" · ")}
            />
            <Stat
              icon={<Sparkles className="h-4 w-4" />}
              label="Oppgaver løst"
              value={`${solvedExercises} av ${totalExercises}`}
            />
          </div>
        </header>

        <ProgressBar value={totalExercises === 0 ? 0 : solvedExercises / totalExercises} />

        <div className="mt-8 space-y-6">
          {track.sections.map((section, idx) => (
            <section key={idx} className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-5 py-3 border-b border-border bg-muted/30">
                <h2 className="text-base font-semibold">{section.title}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{section.description}</p>
              </div>
              <ol className="divide-y divide-border">
                {section.steps.map((step, sIdx) => {
                  const r = resolve(step);
                  return <StepRow key={sIdx} step={r} />;
                })}
              </ol>
            </section>
          ))}
        </div>

        <CapstoneCard slug={track.capstoneStackSlug} note={track.capstoneNote} found={trinnBySlug.has(track.capstoneStackSlug)} title={trinnBySlug.get(track.capstoneStackSlug)?.title} />
      </main>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
        {icon}
        {label}
      </div>
      <div className="text-sm mt-1 leading-snug">{value}</div>
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
          Progresjon
        </span>
        <span className="text-xs text-muted-foreground font-mono">{pct}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-full bg-success transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function StepRow({ step }: { step: ResolvedStep }) {
  const Icon = step.kind === "exercise" ? Wrench : step.kind === "capstone" ? Sparkles : BookOpen;
  const kindLabel =
    step.kind === "exercise" ? "Oppgave" : step.kind === "capstone" ? "Capstone" : "Stack-side";

  if (!step.found) {
    return (
      <li className="flex items-start gap-3 px-5 py-3 opacity-60">
        <Icon className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium">{step.title}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">
            {kindLabel} — ikke registrert ennå
          </div>
        </div>
      </li>
    );
  }

  return (
    <li>
      <Link
        to={step.href}
        className="flex items-start gap-3 px-5 py-3 hover:bg-accent/40 transition-colors"
      >
        <Icon className="h-4 w-4 mt-0.5 text-brand shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-medium">{step.title}</span>
            {step.solved && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-success">
                <Check className="h-3 w-3" /> løst
              </span>
            )}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            {kindLabel} · {step.note ?? ""}
          </div>
        </div>
        <ArrowRight className="h-4 w-4 mt-1 text-muted-foreground shrink-0" />
      </Link>
    </li>
  );
}

function CapstoneCard({
  slug,
  note,
  title,
  found,
}: {
  slug: string;
  note: string;
  title?: string;
  found: boolean;
}) {
  return (
    <div className="mt-8 rounded-xl border border-brand/40 bg-brand/5 p-5">
      <div className="flex items-baseline gap-2 mb-2">
        <Lightbulb className="h-5 w-5 text-brand" />
        <h2 className="text-lg font-semibold">Capstone</h2>
      </div>
      <p className="text-sm leading-relaxed mb-3">{note}</p>
      {found ? (
        <Link
          to="/stack/$slug"
          params={{ slug }}
          className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"
        >
          Åpne {title ?? slug}
          <ArrowRight className="h-4 w-4" />
        </Link>
      ) : (
        <span className="text-xs text-muted-foreground italic">
          (Capstone-side {slug} er ikke registrert ennå)
        </span>
      )}
    </div>
  );
}
