import { Link } from "@tanstack/react-router";
import { Check, Circle, GraduationCap } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { PHASES, type CurriculumPhase } from "@/lib/stack/curriculum";
import { TRINN } from "@/lib/stack/content";

// First-principles læreplan — visuell oversikt over hele kurset i 14 faser.
// Hver slug i en fase som er ready vises som klikkbar lenke; stubs vises grått.
// Brukes for å hjelpe en student forstå rekkefølgen og se hvor langt de er.

export function LaereplanPage() {
  const statusOf = (slug: string) => TRINN.find((t) => t.slug === slug)?.status ?? null;
  const titleOf = (slug: string) =>
    TRINN.find((t) => t.slug === slug)?.title ?? slug;

  return (
    <StackPageShell title="Læreplan — første prinsipper" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-10">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            Komplett dataingeniør-løype
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Læreplan — fra transistor til deploy
          </h1>
          <p className="mt-3 text-muted-foreground max-w-2xl">
            Hele plattformen organisert i 14 faser, basert på hvordan MIT 6.*,
            Stanford CS, CMU 15.* og ETH bygger opp en CS-bachelor. Hver fase svarer
            på ett konkret spørsmål du trenger for neste fase. Vi tar aldri i bruk
            en abstraksjon vi ikke først har åpnet opp.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <GraduationCap className="h-5 w-5 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Slik bruker du planen:</span> gå
              gjennom hver fase i rekkefølge. Innenfor en fase: gjør teorien
              først, så øvelsene på <Link to="/drag" className="text-brand hover:underline">/drag</Link>.
              Du kan også gjøre alt på et fag via fag-filteret. Spor fremgang
              med poeng — alt lagres lokalt i nettleseren.
            </div>
          </div>
        </div>

        {/* Faser */}
        <div className="space-y-6">
          {PHASES.map((phase) => (
            <PhaseCard
              key={phase.id}
              phase={phase}
              statusOf={statusOf}
              titleOf={titleOf}
            />
          ))}
        </div>

        {/* Bunn-CTA */}
        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Hvor passer dette inn?</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <strong className="text-foreground">Stack-oversikten</strong>:{" "}
              <Link to="/stack" className="text-brand hover:underline">/stack</Link>{" "}
              viser alle trinn i samme rekkefølge.
            </li>
            <li>
              <strong className="text-foreground">Drag-oppgaver</strong>:{" "}
              <Link to="/drag" className="text-brand hover:underline">/drag</Link>{" "}
              for fyll-inn, match, sortér, quiz.
            </li>
            <li>
              <strong className="text-foreground">Python-kjøremotor</strong>:{" "}
              <Link to="/python" className="text-brand hover:underline">/python</Link>{" "}
              for kjørbare oppgaver.
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}

function PhaseCard({
  phase,
  statusOf,
  titleOf,
}: {
  phase: CurriculumPhase;
  statusOf: (slug: string) => "ready" | "stub" | null;
  titleOf: (slug: string) => string;
}) {
  const slugs = phase.slugs;
  const readyCount = slugs.filter((s) => statusOf(s) === "ready").length;
  const total = slugs.length;
  return (
    <section id={phase.id} className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-baseline justify-between gap-3 mb-2 flex-wrap">
        <h2 className="text-xl font-semibold">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-brand/10 text-brand text-sm font-mono mr-2">
            {phase.num}
          </span>
          {phase.title}
        </h2>
        <div className="text-xs text-muted-foreground tabular-nums">
          {readyCount} / {total} klar
        </div>
      </div>
      <p className="text-sm text-muted-foreground mb-3">{phase.why}</p>
      {phase.analog && (
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-3 font-mono">
          {phase.analog}
        </div>
      )}
      <ul className="space-y-1.5">
        {slugs.map((slug) => {
          const status = statusOf(slug);
          const title = titleOf(slug);
          if (status === "ready") {
            return (
              <li key={slug}>
                <Link
                  to="/stack/$slug"
                  params={{ slug }}
                  className="flex items-center gap-2 text-sm text-foreground hover:text-brand transition-colors py-0.5"
                >
                  <Check className="h-3.5 w-3.5 text-success shrink-0" />
                  <span>{title}</span>
                  <span className="text-xs text-muted-foreground font-mono">
                    /{slug}
                  </span>
                </Link>
              </li>
            );
          }
          return (
            <li key={slug} className="flex items-center gap-2 text-sm text-muted-foreground/60 py-0.5">
              <Circle className="h-3.5 w-3.5 shrink-0" />
              <span>{title}</span>
              <span className="text-xs font-mono">/{slug}</span>
              <span className="text-[10px] uppercase tracking-wider rounded bg-muted px-1.5 py-0.5">
                {status === "stub" ? "kommer" : "ikke bygd"}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
