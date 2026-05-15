import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { PROBLEMS } from "@/lib/problems/data";
import { PY_EXERCISES } from "@/lib/python/exercises";
import { GIT_SCENARIOS } from "@/lib/git/scenarios";
import { VENV_SCENARIOS } from "@/lib/venv/scenarios";

export const Route = createFileRoute("/ov")({
  head: () => ({
    meta: [
      { title: "Øv — SQL, Python, JOIN, ER og quiz" },
      {
        name: "description",
        content:
          "Alle øvingsmodusene samlet: SQL-oppgaver, JOIN-trening, ER-tegner, Python i Pyodide, drag-and-drop og multiple-choice quiz.",
      },
    ],
  }),
  component: OvHub,
});

function OvHub() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground mb-4">
            Hub
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Øv —{" "}
            <span className="bg-gradient-to-r from-brand to-success bg-clip-text text-transparent">
              gjør, ikke bare les
            </span>
          </h1>
          <p className="mt-4 text-muted-foreground max-w-2xl">
            Seks måter å trene på det samme stoffet. Skriv ekte SQL, dra brikker, ta quiz, eller
            kjør Python i nettleseren — velg formatet som hjelper deg lære best akkurat nå.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <HubCard
            href="/practice"
            title="SQL-oppgaver"
            badge={`${PROBLEMS.length} oppgaver`}
            body="Skriv ekte spørringer mot et realistisk skjema. Resultatbasert vurdering, hint underveis."
            prominent
          />
          <HubCard
            href="/python"
            title="Python (Pyodide)"
            badge={`${PY_EXERCISES.length} oppgaver`}
            body="Ekte Python kjørt i nettleseren — inkludert Flask. Akkurat eksamenstypen."
            prominent
          />
          <HubCard
            href="/joins"
            title="JOIN-trening"
            body="Visuell trening på INNER, LEFT, RIGHT, FULL — se hva som skjer med radene."
          />
          <HubCard
            href="/er-tegner"
            title="ER-tegner"
            body="Tegn krakefot-diagram fra scratch. Kobler rett opp mot ER → DDL drillen."
          />
          <HubCard
            href="/cards"
            title="Quiz"
            body="Multiple-choice med 4 alternativer per spørsmål. Rask repetisjon."
          />
          <HubCard
            href="/drag"
            title="Drag-and-drop"
            body="Sett sammen spørringer ved å dra klausuler på plass. Bra for å låse rekkefølgen."
          />
          <HubCard
            href="/git-drill"
            title="Git-drill"
            badge={`${GIT_SCENARIOS.length} scenarier`}
            body="Skriv git-kommandoer i en simulert terminal — init, add, commit, branch, merge, reset. Ingen ekte git, alt kjører lokalt."
          />
          <HubCard
            href="/venv-drill"
            title="Venv-drill"
            badge={`${VENV_SCENARIOS.length} scenarier`}
            body="Øv Python virtuelle miljø: lag venv, aktiver, pip install, requirements.txt, ModuleNotFoundError. Simulert terminal, ingen ekte python."
          />
        </div>
      </main>
    </div>
  );
}

function HubCard({
  href,
  title,
  body,
  badge,
  prominent = false,
}: {
  href: string;
  title: string;
  body: string;
  badge?: string;
  prominent?: boolean;
}) {
  const accent = prominent
    ? "border-brand/50 bg-brand/5 hover:border-brand"
    : "border-border bg-card hover:border-brand/40";
  return (
    <Link to={href} className={`group rounded-xl border p-5 transition-colors block ${accent}`}>
      <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
        <h3 className="font-semibold text-foreground leading-tight">{title}</h3>
        {badge && (
          <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
            {badge}
          </span>
        )}
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
    </Link>
  );
}
