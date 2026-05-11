import { Link } from "@tanstack/react-router";
import { ArrowRight, Search, Network, BookOpen, ClipboardList, Sigma } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";

type Course = {
  slug: string;
  title: string;
  shortDescription: string;
  Icon: typeof Search;
  status: "ready" | "coming-soon";
};

const COURSES: Course[] = [
  {
    slug: "sok-algoritmer",
    title: "Søkealgoritmer i AI",
    shortDescription:
      "BFS, DFS, uniform-cost, iterative deepening, greedy og A*. Heuristikker, admissibility, completeness og optimality.",
    Icon: Search,
    status: "ready",
  },
  {
    slug: "csp",
    title: "Constraint Satisfaction Problems",
    shortDescription:
      "CSP-formulering, backtracking, AC-3, forward checking. MRV, degree heuristic og LCV.",
    Icon: Network,
    status: "ready",
  },
  {
    slug: "logisk-resonnering",
    title: "Logisk resonnering",
    shortDescription:
      "Propositional logic, sannhetstabeller, modus ponens, resolusjon, og en kort introduksjon til first-order logic.",
    Icon: BookOpen,
    status: "ready",
  },
  {
    slug: "planlegging",
    title: "Planlegging",
    shortDescription:
      "STRIPS-handlinger, preconditions/effects. Forward (progression) og backward (regression) planning.",
    Icon: ClipboardList,
    status: "ready",
  },
  {
    slug: "bayes",
    title: "Beslutninger under usikkerhet — Bayes",
    shortDescription:
      "Bayes' teorem med gjennomgått eksempel, naive Bayes-klassifikator og betinget uavhengighet.",
    Icon: Sigma,
    status: "ready",
  },
];

export function Dte2501Hub() {
  return (
    <StackPageShell title="DTE-2501 AI Methods and Applications" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-10">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2501 · 10 stp · Teknisk spesialisering
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            AI Methods and Applications
          </h1>
          <p className="mt-3 text-muted-foreground max-w-2xl">
            Mini-kurs som dekker UiT-pensumet (Russell & Norvig): søk, CSP, logikk,
            planlegging og resonnering under usikkerhet. ML-delen av pensumet er dekket
            separat i{" "}
            <Link to="/stack/$slug" params={{ slug: "dte-2602" }} className="text-brand hover:underline">
              DTE-2602
            </Link>{" "}
            og repeteres ikke her.
          </p>
        </div>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">AI-tilnærminger — cheatsheet</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Russell &amp; Norvig deler AI i grovt fire familier ut fra hva systemet
            modellerer. Hold tabellen i hodet — den hjelper deg å plassere hver
            algoritme i pensum.
          </p>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-40">Tilnærming</th>
                  <th className="text-left font-semibold px-4 py-2">Sentral idé</th>
                  <th className="text-left font-semibold px-4 py-2 w-48">Typiske metoder</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">Søk</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    Utforsk tilstandsrom og finn vei fra start til mål
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">BFS, DFS, UCS, A*</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">CSP</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    Tildel verdier til variabler under begrensninger
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">Backtracking, AC-3, MRV</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">Logikk</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    Representer kunnskap og resonner formelt
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">PL, FOL, resolusjon</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">Planlegging</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    Komponer handlinger som tar deg fra start- til måltilstand
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">STRIPS, forward/backward</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">Usikkerhet</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    Resonner sannsynlig når verden ikke er observerbar
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">Bayes, naive Bayes</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">Læring</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    Lær mønstre fra data i stedet for å programmere reglene
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">Se DTE-2602</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Eksamenstips:</strong> mange oppgaver tester at du klassifiserer et
            problem riktig. «Skal vi finne en rute?» → søk. «Tilfredsstille
            begrensninger?» → CSP. «Trekke konklusjon fra fakta?» → logikk. «Velge
            handlinger?» → planlegging. «Usikkerhet om verden?» → Bayes.
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
          <h2 className="font-semibold mb-2">Hvor passer dette inn?</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <strong className="text-foreground">Drag-oppgaver:</strong> filter på «ML &amp; AI» i{" "}
              <Link to="/drag" className="text-brand hover:underline">/drag</Link>{" "}
              — søk, CSP, logikk, planlegging og Bayes.
            </li>
            <li>
              <strong className="text-foreground">Lavnivå-grafer (BFS/DFS):</strong> se{" "}
              <Link to="/stack/$slug" params={{ slug: "algoritmer" }} className="text-brand hover:underline">
                algoritmer-trinnet
              </Link>{" "}
              for selve implementasjonen. Her bruker vi BFS/DFS som AI-søk.
            </li>
            <li>
              <strong className="text-foreground">ML-delen av pensum:</strong> dekket av{" "}
              <Link to="/stack/$slug" params={{ slug: "dte-2602" }} className="text-brand hover:underline">
                DTE-2602
              </Link>
              .
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
