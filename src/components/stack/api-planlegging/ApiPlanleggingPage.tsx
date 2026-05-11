import { Link } from "@tanstack/react-router";
import { Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";

const STEPS = [
  { title: "Hvor begynner du? — interessenter", anchor: "interessenter" },
  { title: "Funksjonelle vs ikke-funksjonelle krav", anchor: "krav" },
  { title: "MVP — definere den minste verdifulle versjonen", anchor: "mvp" },
  { title: "Brukerhistorier for APIer", anchor: "historier" },
  { title: "Prioritering — MoSCoW og RICE", anchor: "prioritering" },
  { title: "Scope-kontroll i prosjektløpet", anchor: "scope" },
  { title: "Discovery-spike for ukjente teknologier", anchor: "spike" },
];

export function ApiPlanleggingPage() {
  return (
    <StackPageShell title="Planlegging — krav, scope, MVP" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            API-prosjekt · Del 1 av 5
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Planlegging — krav, scope, MVP
          </h1>
          <p className="mt-3 text-muted-foreground">
            Et API som ikke løser et reelt behov er feilbygd uansett hvor pen
            kontrakten er. Vi starter med interessenter, krav, MVP og hvordan
            du holder scope under kontroll når presset kommer.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Drill:</span>{" "}
              <Link to="/drag" className="text-brand hover:underline">drag-oppgavene</Link>{" "}
              under «API-prosjekt» — MVP-quiz, MoSCoW-match, brukerhistorie-fill for APIer.
            </div>
          </div>
        </div>

        <CourseOutline courseId="api-planlegging" steps={STEPS} />

        <section id="interessenter" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Hvor begynner du? — interessenter</h2>
          <p className="text-sm text-muted-foreground mb-4">
            APIer har minst tre typer interessenter. Snakk med alle TRE før du
            låser kontrakten — ellers blir det dyrt å endre.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <ul className="space-y-3 text-sm">
              <li><strong>Sluttbrukere</strong> — de menneskene som bruker appen som kaller APIet. Hva trenger de? Hvilke responstider tåler de?</li>
              <li><strong>API-konsumenter (utviklere)</strong> — front-end-teamet, mobil-teamet, eller eksterne integrasjoner. Hva er deres arbeidsflyt? Hva irriterer dem ved nåværende løsning?</li>
              <li><strong>Drift / forretning</strong> — hvem betaler? Hva er SLA-en? Hvilke regulatoriske krav gjelder (GDPR, sektor-spesifikt)?</li>
            </ul>
          </div>
        </section>

        <section id="krav" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Funksjonelle vs ikke-funksjonelle krav</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Folk husker funksjonelle krav («skal kunne lage bestilling») og
            glemmer ikke-funksjonelle («skal svare innen 200 ms ved p95»).
            Begge må dokumenteres.
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Funksjonelle (FR)
              </div>
              <ul className="space-y-1.5 text-sm list-disc pl-5">
                <li>«Brukere skal kunne registrere seg»</li>
                <li>«APIet skal returnere liste over produkter filtrert på kategori»</li>
                <li>«Admin skal kunne deaktivere brukere»</li>
              </ul>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Ikke-funksjonelle (NFR)
              </div>
              <ul className="space-y-1.5 text-sm list-disc pl-5">
                <li>Ytelse: p95 &lt; 200 ms for GET-er</li>
                <li>Tilgjengelighet: 99.9% uptime per måned</li>
                <li>Sikkerhet: alle endpoints krever auth, secrets i vault</li>
                <li>Skalerbarhet: 1000 RPS uten degradering</li>
                <li>Compliance: GDPR — sletting på forespørsel</li>
                <li>Observability: 99% av kall logges med trace-id</li>
              </ul>
            </div>
          </div>
        </section>

        <section id="mvp" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. MVP — minste verdifulle versjon</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Minimum Viable Product. Det MINSTE settet av funksjonalitet som
            faktisk leverer verdi til sluttbruker. Ikke «det vi tror er enkelt»,
            men «det vi MÅ ha for at noen får jobben gjort».
          </p>

          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Henrik Knibergs MVP-tegning:

  Stort prosjekt — bilen:
  hjul ──► chassi ──► motor ──► bil
   (ikke verdi)        (ikke verdi)    (verdi til slutt)

  MVP-tilnærming:
  skateboard ──► sykkel ──► motorsykkel ──► bil
    (kjører!)    (raskere)   (bedre)         (best)

Hver versjon: brukbar, gir verdi. Du lærer underveis.`}</pre>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              MVP for et bestilling-API kan være:
            </div>
            <ul className="space-y-1.5 text-sm list-disc pl-5">
              <li>POST /bestillinger — opprett bestilling (én produkttype, hardkoded valuta)</li>
              <li>GET /bestillinger/{`{id}`} — vis status</li>
              <li>Auth: en hardkoded API-key</li>
              <li>Persistens: én tabell i Postgres</li>
              <li>Deploy: én Docker-container</li>
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">
              IKKE i MVP: avbestilling, multi-currency, admin-panel, e-post-bekreftelse,
              audit log, rate limiting, retry, betalingsintegrasjon. Disse kommer i v0.2, v0.3, ...
            </p>
          </div>
        </section>

        <section id="historier" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Brukerhistorier for APIer</h2>
          <p className="text-sm text-muted-foreground mb-4">
            For et API er «brukeren» ofte en annen utvikler eller et annet
            system. Formatet er det samme.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Eksempler
            </div>
            <div className="space-y-3 text-sm">
              <div className="border-l-2 border-success pl-3">
                Som <strong>front-end-utvikler</strong> vil jeg{" "}
                <strong>kunne hente paginert produktliste filtrert på kategori</strong>{" "}
                for å <strong>vise produkter på kategoriside uten å laste alt</strong>.
              </div>
              <div className="border-l-2 border-success pl-3">
                Som <strong>betalingsservice</strong> vil jeg{" "}
                <strong>kunne sjekke om en bestilling er gyldig og prisen riktig</strong>{" "}
                for å <strong>unngå å belaste kort for feil beløp</strong>.
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Akseptansekriterier kan inkludere endpoint-signatur, statuskoder,
              eksempel-respons. Se mini-kurset om{" "}
              <Link to="/stack/$slug" params={{ slug: "brukerhistorier" }} className="text-brand hover:underline">
                brukerhistorier
              </Link>
              .
            </p>
          </div>
        </section>

        <section id="prioritering" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Prioritering — MoSCoW og RICE</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Du har 50 historier og kan levere 10 i MVP. Hvilke?
          </p>

          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              MoSCoW
            </div>
            <ul className="space-y-2 text-sm">
              <li><strong>Must have</strong> — uten dette feiler MVP. Ingen kan bruke produktet.</li>
              <li><strong>Should have</strong> — viktig, men workarounds finnes. Inn så snart Must er ferdig.</li>
              <li><strong>Could have</strong> — fint å ha. Tar med hvis tid.</li>
              <li><strong>Won&apos;t have (this time)</strong> — eksplisitt utelatt. Ikke glemt — bevisst valgt bort.</li>
            </ul>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              RICE-score
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`RICE = (Reach × Impact × Confidence) / Effort

Reach     — hvor mange brukere påvirkes? (per kvartal)
Impact    — hvor mye? (3=stort, 2=middels, 1=lite)
Confidence— hvor sikkert vet du dette? (1.0 = veldig, 0.5 = gjetning)
Effort    — antall person-uker
`}</pre>
            <p className="mt-3 text-xs text-muted-foreground">
              Sort historier etter RICE-score. Den med høyest tas først. Bare
              «gjetning» (lav confidence) → kanskje en spike trengs først.
            </p>
          </div>
        </section>

        <section id="scope" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Scope-kontroll i prosjektløpet</h2>
          <p className="text-sm text-muted-foreground mb-4">
            <strong>Scope creep</strong> — gradvis utvidelse av prosjektomfang
            etter at det er definert. Hovedkilden til prosjekter som glipper
            tidsfrister.
          </p>
          <div className="space-y-3 text-sm">
            <div className="rounded-lg border border-border bg-card p-4">
              <strong>«Mens du er der, kan du også...»</strong> — kunden får
              ekstra-ideer underveis. Strategi: skriv ned i backlog, prioritér
              senere. IKKE bare «ja, jeg fikser».
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <strong>Gold plating</strong> — du som utvikler legger til ting
              kunden ikke ba om («det blir så mye penere med...»). Hold deg til
              brukerhistorien — den vet hva som er verdt.
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <strong>Skifte i prioritet uten tid-konsekvens</strong> — «Vi
              flytter X opp i prioritet og skipper Y». Bra. «Vi gjør både X og
              Y». Stopp og diskuter trade-offs.
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <strong>Tre-kant: scope, tid, kvalitet</strong> — du kan ikke
              øke scope uten å enten lengre tid eller redusert kvalitet. Gjør
              valget eksplisitt med kunden.
            </div>
          </div>
        </section>

        <section id="spike" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Discovery-spike for ukjente teknologier</h2>
          <p className="text-sm text-muted-foreground mb-4">
            En <strong>spike</strong> er en kort tids-bokset utforskning når du
            ikke kan estimere fordi noe er ukjent — typisk en ny teknologi
            eller integrasjon mot en tredjeparts-API du ikke har brukt.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`SPIKE: «Kan vi bruke Stripe Webhooks for refusjon?»

Time-box: 1 dag.
Mål: prototype som mottar webhook, validerer signatur,
     logger event. Ikke ferdig kode. Ikke produksjon.

Etter spike:
  ✓ Vi vet hvordan signatur valideres
  ✓ Vi vet retry-policyen
  ✓ Vi kan estimere selve historien (5 SP)
  ✗ Kode kastes (eller refaktoreres betydelig)`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Spike-output er KUNNSKAP, ikke produksjonskode. Skriv en kort
            oppsummering (en ADR — Architecture Decision Record) etterpå.
          </p>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/drag" className="text-brand hover:underline">Drag-oppgaver</Link>
              : MVP-quiz, MoSCoW-match, brukerhistorie-fill for APIer.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "api-arkitektur" }} className="text-brand hover:underline">
                Arkitektur
              </Link>
              : lagdeling, DTO vs entity, dependency injection.
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
