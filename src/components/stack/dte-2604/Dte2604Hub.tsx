import { Link } from "@tanstack/react-router";
import { ArrowRight, Users, ListChecks, Boxes, GitMerge, Workflow } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";

type Course = {
  slug: string;
  title: string;
  shortDescription: string;
  Icon: typeof Users;
  status: "ready" | "coming-soon";
};

const COURSES: Course[] = [
  {
    slug: "su-metodikker",
    title: "Metodikker — fra fossefall til smidig",
    shortDescription:
      "Fossefall og RUP historisk. Scrum-events og roller. Kanban WIP-limits. XP-praksiser (TDD, pair programming, refactoring).",
    Icon: Workflow,
    status: "ready",
  },
  {
    slug: "brukerhistorier",
    title: "Brukerhistorier, krav og estimering",
    shortDescription:
      "Som-vil-for-å formatet. INVEST-kriterier. Story points (Fibonacci). Planning poker. Akseptansekriterier.",
    Icon: ListChecks,
    status: "ready",
  },
  {
    slug: "uml",
    title: "UML — diagrammene du faktisk trenger",
    shortDescription:
      "Use case, klassediagram, sekvensdiagram, aktivitetsdiagram. Når du tegner hva, og hvor mye er nok.",
    Icon: Boxes,
    status: "ready",
  },
  {
    slug: "su-prosjekt-praksis",
    title: "Prosjekt-praksis i gruppe",
    shortDescription:
      "Git feature-branch + PR-flow, code review, retrospektiv-format, vanlige team-feller og hvordan unngå dem.",
    Icon: GitMerge,
    status: "ready",
  },
];

export function Dte2604Hub() {
  return (
    <StackPageShell title="DTE-2604 Systemutvikling" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-10">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2604 · 10 stp · Systemutvikling
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Systemutvikling — smidig, i praksis
          </h1>
          <p className="mt-3 text-muted-foreground max-w-2xl">
            Fire mini-kurs som dekker UiT-pensum: smidige metodikker (Scrum,
            Kanban, XP), brukerhistorier og estimering, UML-diagrammer som
            faktisk brukes, og prosjekt-praksis i gruppe. Hvert kurs har
            drag-oppgaver og konkrete eksempler.
          </p>
        </div>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Smidig på 30 sekunder — cheatsheet</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Hvis du må forklare smidig på muntlig eksamen og bare har én side,
            bruk denne. Detaljene står i mini-kursene.
          </p>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-32">Pilar</th>
                  <th className="text-left font-semibold px-4 py-2">Hva det betyr i praksis</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">Iterativt</td><td className="px-4 py-3 text-muted-foreground">Korte sprinter (1-4 uker) som leverer noe som kjører — ikke en stor leveranse på slutten.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">Inkrementelt</td><td className="px-4 py-3 text-muted-foreground">Hver sprint utvider produktet med en bit ny funksjonalitet, bygd oppå den forrige.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">Tilpasningsdyktig</td><td className="px-4 py-3 text-muted-foreground">Krav er ikke fryst — backloggen kan reprioriteres mellom sprinter når læring oppstår.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">Samarbeid</td><td className="px-4 py-3 text-muted-foreground">Daglig kontakt mellom utvikler og kunde/PO. Verdi defineres sammen, ikke i forhåndsdokument.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">Refleksjon</td><td className="px-4 py-3 text-muted-foreground">Retrospektiv etter hver sprint — hva fungerer, hva må endres. Konkrete handlinger til neste sprint.</td></tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Smidig manifest (2001):</strong> individer og samspill over
            prosesser og verktøy; fungerende programvare over omfattende
            dokumentasjon; kundesamarbeid over kontraktsforhandlinger; respons
            på endring over å følge en plan.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Mini-kurs</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {COURSES.map((c) => {
              const isReady = c.status === "ready";
              const Icon = c.Icon;
              if (!isReady) {
                return (
                  <div key={c.slug} className="rounded-xl border border-border bg-card/30 p-5 opacity-60">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <h3 className="font-semibold text-foreground leading-tight">{c.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{c.shortDescription}</p>
                  </div>
                );
              }
              return (
                <Link
                  key={c.slug}
                  to="/stack/$slug"
                  params={{ slug: c.slug }}
                  className="group rounded-xl border border-border bg-card hover:border-brand/40 p-5 transition-colors block"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-4 w-4 text-brand" />
                    <h3 className="font-semibold text-foreground leading-tight">{c.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{c.shortDescription}</p>
                  <div className="mt-3 flex items-center text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                    Åpne
                    <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Beslektet stoff</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <strong className="text-foreground">Drag-oppgaver:</strong> filter på «Systemutvikling» i{" "}
              <Link to="/drag" className="text-brand hover:underline">/drag</Link>.
            </li>
            <li>
              <strong className="text-foreground">API-prosjekt fra A til Å:</strong>{" "}
              <Link to="/stack/$slug" params={{ slug: "api-prosjekt" }} className="text-brand hover:underline">
                /stack/api-prosjekt
              </Link>
              — bruker samme prosjekt-prosess på en konkret API-leveranse.
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
