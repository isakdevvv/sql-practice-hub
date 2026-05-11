import { Link } from "@tanstack/react-router";
import { Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";

const STEPS = [
  { title: "Hvorfor lagdeling?", anchor: "hvorfor" },
  { title: "Controller / Service / Repository", anchor: "lag" },
  { title: "DTO vs domene-modell vs entity", anchor: "dto" },
  { title: "Dependency Injection", anchor: "di" },
  { title: "Dependency-retning og Clean Architecture", anchor: "clean" },
  { title: "Hvor skal feilen kastes?", anchor: "feil" },
  { title: "Når du IKKE skal følge oppskriften", anchor: "skip" },
];

export function ApiArkitekturPage() {
  return (
    <StackPageShell title="API-arkitektur — lag, DTO, DI" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            API-prosjekt · Del 2 av 5
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            API-arkitektur — lag, DTO, DI
          </h1>
          <p className="mt-3 text-muted-foreground">
            Hvordan du strukturerer koden for at API-prosjektet kan vokse uten
            å bli en knute. Lagdeling, DTO-skille, dependency injection, og
            hvor avhengighetene skal peke.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Drill:</span>{" "}
              <Link to="/drag" className="text-brand hover:underline">drag-oppgavene</Link>{" "}
              under «API-prosjekt» — match ansvar til lag, DTO vs entity, DI-quiz.
            </div>
          </div>
        </div>

        <CourseOutline courseId="api-arkitektur" steps={STEPS} />

        <section id="hvorfor" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Hvorfor lagdeling?</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Et lite API er greit å skrive «alt i én fil». Når det vokser blir
            blander HTTP-håndtering, forretningslogikk og DB-tilgang seg, og
            det blir umulig å endre én del uten å brekke noe annet.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Hva lagdeling gir deg
            </div>
            <ul className="space-y-1.5 text-sm list-disc pl-5">
              <li>Hvert lag har ÉTT ansvar — lett å lese</li>
              <li>Forretningslogikk kan testes uten HTTP-server</li>
              <li>Du kan bytte database eller HTTP-rammeverk uten å rive opp domenet</li>
              <li>Nye utviklere finner ting der de forventer</li>
            </ul>
          </div>
        </section>

        <section id="lag" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Controller / Service / Repository</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Det vanligste mønsteret i API-prosjekter. Tre lag, hver med klart ansvar.
          </p>

          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`HTTP-request
     │
     ▼
+──────────────────+
│   Controller     │  HTTP-spesifikt:
│  (route handler) │  parse JSON, valider input,
+──────────────────+  returner statuskode + JSON
     │
     ▼
+──────────────────+
│    Service       │  Forretningslogikk:
│  (use case)      │  «opprett bestilling = sjekk lager
+──────────────────+   + reservere + persistere»
     │
     ▼
+──────────────────+
│   Repository     │  DB-tilgang:
│  (data access)   │  SQL, ORM-kall, returnerer entities
+──────────────────+
     │
     ▼
   Database`}</pre>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Hvem gjør hva — sjekkliste
            </div>
            <ul className="space-y-2 text-sm">
              <li><strong>Controller</strong>: parser request, validerer JSON-form, kaller service, mapper resultat til HTTP-respons. Bør være TYNN.</li>
              <li><strong>Service</strong>: koordinerer use cases, snakker med flere repositories, kaster domain-feil. Inneholder forretningsregler.</li>
              <li><strong>Repository</strong>: SQL eller ORM-kall. Returnerer entity-objekter. Aner ingenting om HTTP.</li>
            </ul>
          </div>
        </section>

        <section id="dto" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. DTO vs domene-modell vs entity</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Tre ord som lett rotes sammen. Forskjellen er hvor i lagstabelen de
            lever — og dermed hva de inneholder.
          </p>

          <div className="overflow-hidden rounded-lg border border-border mb-4">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-40">Type</th>
                  <th className="text-left font-semibold px-4 py-2">Hva</th>
                  <th className="text-left font-semibold px-4 py-2 w-40">Bor i</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border"><td className="px-4 py-3 font-medium">DTO</td><td className="px-4 py-3 text-muted-foreground">Data Transfer Object — formet ETTER hva APIet leverer/mottar</td><td className="px-4 py-3 text-muted-foreground">Controller-laget</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-medium">Domene-modell</td><td className="px-4 py-3 text-muted-foreground">Forretningskonsept med atferd — eks Bestilling som vet hvordan totalpris regnes</td><td className="px-4 py-3 text-muted-foreground">Service-laget</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-medium">Entity</td><td className="px-4 py-3 text-muted-foreground">ORM-rep av en DB-rad — formet etter tabellen</td><td className="px-4 py-3 text-muted-foreground">Repository-laget</td></tr>
              </tbody>
            </table>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Hvorfor ikke bare bruke entity hele veien?
            </div>
            <ul className="space-y-1.5 text-sm text-muted-foreground list-disc pl-5">
              <li>Endrer du DB-skjema, må alle API-konsumenter endre seg (lekk abstraksjon)</li>
              <li>Sensitiv data (hashed_password, cvv) lekker ut hvis du bare serialiserer entity</li>
              <li>API trenger ofte sammensetninger på tvers av tabeller (én DTO, flere entities)</li>
              <li>API-versjonering blir vanskelig — du kan ikke ha v1 og v2 av samme tabell</li>
            </ul>
          </div>
        </section>

        <section id="di" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Dependency Injection</h2>
          <p className="text-sm text-muted-foreground mb-4">
            DI = avhengigheter sendes INN i klassen/funksjonen i stedet for at
            den hentes dem selv. Gjør koden testbar og koblingen eksplisitt.
          </p>

          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`# Uten DI — hardkodet avhengighet, vanskelig å teste
class BestillingService:
    def __init__(self):
        self.repo = PostgresBestillingRepo()  # ← problem
    def opprett(self, data):
        return self.repo.save(data)

# Med DI — avhengigheten sendes inn
class BestillingService:
    def __init__(self, repo: BestillingRepo):  # ← interface
        self.repo = repo
    def opprett(self, data):
        return self.repo.save(data)

# I produksjon:
service = BestillingService(repo=PostgresBestillingRepo())
# I test:
service = BestillingService(repo=FakeBestillingRepo())`}</pre>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Tre former for DI
            </div>
            <ul className="space-y-1.5 text-sm">
              <li><strong>Constructor injection</strong> (vanligst): avhengigheter via __init__/konstruktør</li>
              <li><strong>Setter injection</strong>: via setter-metoder etter konstruksjon</li>
              <li><strong>Interface injection</strong>: klassen implementerer interface som tilbyr avhengighet</li>
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">
              Constructor injection er foretrukket — det gjør avhengighetene
              umulige å glemme og objektet er gyldig idet det opprettes.
            </p>
          </div>
        </section>

        <section id="clean" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Dependency-retning og Clean Architecture</h2>
          <p className="text-sm text-muted-foreground mb-4">
            En kjerne i Clean Architecture (Robert Martin): avhengigheter peker
            INNOVER, mot domenet. Domenet aner ingenting om HTTP, DB eller
            framework.
          </p>

          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Ytterst                                          Innerst
+──────────────+   +──────────────+   +──────────────+
│   Adapters   │   │  Use Cases   │   │   Entities   │
│  (HTTP, DB,  │──►│  (services)  │──►│   (domene)   │
│   CLI, ...)  │   │              │   │              │
+──────────────+   +──────────────+   +──────────────+

         Avhengighetene peker INNOVER ↑

  - Entities aner ikke om use cases
  - Use cases aner ikke om HTTP eller DB
  - Adapters kjenner use cases via interface (port)

Dette gir:
  • Domenet kan testes uten infrastruktur
  • Du kan bytte DB eller HTTP-rammeverk uten å røre domenet`}</pre>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Praktisk konsekvens: ports &amp; adapters
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`# Port — interface definert av use case (i domene/service-laget)
class BestillingRepo(Protocol):
    def save(self, b: Bestilling) -> int: ...
    def find(self, id: int) -> Bestilling | None: ...

# Adapter — konkret implementasjon (i infrastruktur-laget)
class PostgresBestillingRepo:
    def save(self, b): ...
    def find(self, id): ...

# Service avhenger av PORTEN, ikke adapteren`}</pre>
          </div>
        </section>

        <section id="feil" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Hvor skal feilen kastes?</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Feilhåndtering på tvers av lag er en vanlig snublestein. Følg dette mønsteret:
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <ul className="space-y-3 text-sm">
              <li>
                <strong>Repository</strong> kaster <code>NotFoundError</code>,
                <code> ConstraintViolationError</code> — feil som handler om data.
              </li>
              <li>
                <strong>Service</strong> kaster <code>BusinessRuleViolation</code>,
                <code> InsufficientStockError</code> — domain-feil. Fanger og
                pakker rep-feil hvis de skal endre form.
              </li>
              <li>
                <strong>Controller</strong> har en global exception-handler som
                mapper domain-feil til HTTP-statuskoder:
                <pre className="font-mono text-xs mt-2 overflow-x-auto whitespace-pre">{`NotFoundError                ──►  404
BusinessRuleViolation       ──►  422
AuthError                    ──►  401
PermissionError              ──►  403
Alt annet                    ──►  500 (logg det!)`}</pre>
              </li>
            </ul>
          </div>
        </section>

        <section id="skip" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Når du IKKE skal følge oppskriften</h2>
          <div className="space-y-3 text-sm">
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>Prototype / proof of concept</strong> — du eksperimenterer.
              Skriv alt i én fil. Sub-100 linjer trenger ikke lag.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>CRUD-only mikrotjenester</strong> — hvis tjenesten KUN
              eksponerer en tabell uten forretningslogikk, kan service-laget
              være overflødig. Controller kan kalle repo direkte.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>For tidlig abstraksjon</strong> — å bygge inn fem
              abstraksjonslag «i tilfelle» vi bytter DB en gang i fremtiden
              koster vedlikehold NÅ. YAGNI.
            </div>
          </div>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/drag" className="text-brand hover:underline">Drag-oppgaver</Link>
              : lag-match, DTO vs entity, DI-quiz.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "api-kontrakt" }} className="text-brand hover:underline">
                API-kontrakt
              </Link>
              : OpenAPI/Swagger, versjonering, problem-detail-format.
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
