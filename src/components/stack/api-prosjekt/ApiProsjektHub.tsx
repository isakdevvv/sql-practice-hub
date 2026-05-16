import { Link } from "@tanstack/react-router";
import { ArrowRight, ClipboardList, Layers, FileCode, FlaskConical, Rocket } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";

type Course = {
  slug: string;
  title: string;
  shortDescription: string;
  Icon: typeof ClipboardList;
  status: "ready" | "coming-soon";
};

const COURSES: Course[] = [
  {
    slug: "api-planlegging",
    title: "Planlegging — krav, scope, MVP",
    shortDescription:
      "Krav-innsamling, MVP-definisjon, brukerhistorier for APIer, scope-kontroll, prioritering.",
    Icon: ClipboardList,
    status: "ready",
  },
  {
    slug: "api-arkitektur",
    title: "Arkitektur — lag, DTO, dependency injection",
    shortDescription:
      "Lagdeling (controller/service/repository), DTO vs domene-modell, dependency-retning, Clean Architecture-intro.",
    Icon: Layers,
    status: "ready",
  },
  {
    slug: "api-kontrakt",
    title: "API-kontrakt — OpenAPI, versjon, feil",
    shortDescription:
      "OpenAPI/Swagger, versjonering (URL vs header), RFC 7807 problem-detail, idempotens, statuskoder.",
    Icon: FileCode,
    status: "ready",
  },
  {
    slug: "api-testing",
    title: "Testing — pyramide, unit/integration/E2E",
    shortDescription:
      "Test-pyramiden, unit-/integration-/contract-/E2E-tester, fixtures, mocks, snapshot, hva man tester hvor.",
    Icon: FlaskConical,
    status: "ready",
  },
  {
    slug: "api-deploy",
    title: "Deploy — Docker, CI/CD, observability",
    shortDescription:
      "Docker, env vars, secrets, GitHub Actions, blue-green vs canary, logs/metrics/traces, runbooks.",
    Icon: Rocket,
    status: "ready",
  },
];

export function ApiProsjektHub() {
  return (
    <StackPageShell title="API-prosjekt fra A til Å" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-10">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            Spesialisering · Praktisk
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            API-prosjekt fra A til Å
          </h1>
          <p className="mt-3 text-muted-foreground max-w-2xl">
            Hvordan du tar et API fra første kravsamtale til produksjonssatt
            tjeneste med tester, dokumentasjon og deploy-pipeline.
            Forutsetter at du kan grunnleggende HTTP og REST — vi snakker om
            helheten rundt selve byggingen.
          </p>
        </div>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Arbeidsflyten — én side</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Hver gang du bygger et API for første gang følger du noenlunde
            disse stegene. De fem mini-kursene dekker en del hver.
          </p>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-32">Steg</th>
                  <th className="text-left font-semibold px-4 py-2">Hva du gjør</th>
                  <th className="text-left font-semibold px-4 py-2 w-44">Mini-kurs</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">1. Skope</td><td className="px-4 py-3 text-muted-foreground">Hvem er brukerne? Hvilken verdi? Definer MVP. Skriv brukerhistorier.</td><td className="px-4 py-3 text-xs">api-planlegging</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">2. Designe</td><td className="px-4 py-3 text-muted-foreground">Modeller data (ER), tegn lagdeling, bestem grenser mellom services.</td><td className="px-4 py-3 text-xs">api-arkitektur</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">3. Kontrakt</td><td className="px-4 py-3 text-muted-foreground">Skriv OpenAPI-spec FØR implementasjon. Versjonering. Feilformat.</td><td className="px-4 py-3 text-xs">api-kontrakt</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">4. Bygge</td><td className="px-4 py-3 text-muted-foreground">Lagdeling i kode. DTO ut, entity inn. DI for testbarhet.</td><td className="px-4 py-3 text-xs">api-arkitektur</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">5. Teste</td><td className="px-4 py-3 text-muted-foreground">Unit (innerst), integration (med DB), contract (mot OpenAPI), E2E.</td><td className="px-4 py-3 text-xs">api-testing</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">6. Pakke</td><td className="px-4 py-3 text-muted-foreground">Docker-image, env vars, secrets ut av repo, healthcheck-endpoint.</td><td className="px-4 py-3 text-xs">api-deploy</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">7. Deploy</td><td className="px-4 py-3 text-muted-foreground">CI/CD-pipeline, staging først, blue-green eller canary til prod.</td><td className="px-4 py-3 text-xs">api-deploy</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">8. Drift</td><td className="px-4 py-3 text-muted-foreground">Logs, metrics, traces, runbooks. Watch for regressions.</td><td className="px-4 py-3 text-xs">api-deploy</td></tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Iterativt, ikke lineært.</strong> Du bygger ofte horisontale
            «skiver» — en MVP-funksjon ut hele veien til produksjon, så neste.
            Ikke alle endpoints designet før noen er bygd.
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
              <strong className="text-foreground">Drag-oppgaver:</strong> filter på «API-prosjekt» i{" "}
              <Link to="/drag" className="text-brand hover:underline">/drag</Link>.
            </li>
            <li>
              <strong className="text-foreground">DTE-2604 Systemutvikling:</strong>{" "}
              <Link to="/stack/$slug" params={{ slug: "dte-2604" }} className="text-brand hover:underline">/stack/dte-2604</Link>
              {" "}— dekker prosessen rundt selve byggingen (Scrum, brukerhistorier, retro).
            </li>
            <li>
              <strong className="text-foreground">HTTP-anatomi:</strong>{" "}
              <Link to="/stack/$slug" params={{ slug: "http-anatomi" }} className="text-brand hover:underline">/stack/http-anatomi</Link>
              {" "}— grunnleggende HTTP-bygging hvis du trenger det først.
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
