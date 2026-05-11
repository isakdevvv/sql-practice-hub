import { Link } from "@tanstack/react-router";
import { Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";

const STEPS = [
  { title: "Hva brukerhistorier er — og ikke er", anchor: "hva" },
  { title: "Som-vil-for-å-formatet", anchor: "format" },
  { title: "INVEST-kriteriene", anchor: "invest" },
  { title: "Akseptansekriterier (gherkin)", anchor: "ac" },
  { title: "Story points og Fibonacci", anchor: "points" },
  { title: "Planning poker", anchor: "poker" },
  { title: "Splitting av for store historier", anchor: "splitting" },
];

export function BrukerhistorierPage() {
  return (
    <StackPageShell title="Brukerhistorier, krav og estimering" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2604 · Del 2 av 4
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Brukerhistorier, krav og estimering
          </h1>
          <p className="mt-3 text-muted-foreground">
            Brukerhistorier er hvordan smidige team beskriver krav. Du må
            kunne formatet, INVEST-kriteriene, akseptansekriterier, og kunne
            estimere med story points.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Drill:</span>{" "}
              <Link to="/drag" className="text-brand hover:underline">drag-oppgavene</Link>{" "}
              under «Systemutvikling» — fyll inn brukerhistorie-formatet, match
              akseptansekriterier, splitt store historier.
            </div>
          </div>
        </div>

        <CourseOutline courseId="brukerhistorier" steps={STEPS} />

        <section id="hva" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Hva brukerhistorier er — og ikke er</h2>
          <p className="text-sm text-muted-foreground mb-4">
            En brukerhistorie er en KORT beskrivelse av en funksjonalitet fra
            brukerens perspektiv — som setter scene for en samtale, ikke et
            ferdig kravspesifikasjon.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-success/30 bg-success/5 p-5">
              <div className="text-xs uppercase tracking-wider text-success font-semibold mb-2">
                ER en brukerhistorie
              </div>
              <ul className="space-y-1.5 text-sm list-disc pl-5">
                <li>En invitasjon til samtale</li>
                <li>Forklarer HVEM, HVA og HVORFOR</li>
                <li>Lett å estimere</li>
                <li>Kan ferdigstilles innen én sprint</li>
              </ul>
            </div>
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5">
              <div className="text-xs uppercase tracking-wider text-destructive font-semibold mb-2">
                Ikke en brukerhistorie
              </div>
              <ul className="space-y-1.5 text-sm list-disc pl-5">
                <li>Et 20-siders kravdokument</li>
                <li>En teknisk task («Sett opp database»)</li>
                <li>Noe som tar 3 sprinter</li>
                <li>«Vi må refaktorere modul X»</li>
              </ul>
            </div>
          </div>
        </section>

        <section id="format" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Som-vil-for-å-formatet</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Standardformatet for en brukerhistorie. Tre slot-er må fylles inn.
          </p>
          <div className="rounded-xl border-2 border-brand/40 bg-brand/5 p-5 mb-4">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Som <ROLLE>
vil jeg <HANDLING>
for å <VERDI/MÅL>`}</pre>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Eksempler
            </div>
            <div className="space-y-3 text-sm">
              <div className="border-l-2 border-success pl-3">
                Som <strong>innlogget kunde</strong> vil jeg{" "}
                <strong>kunne tilbakestille passordet mitt via e-post</strong>{" "}
                for å <strong>komme inn igjen uten å kontakte support</strong>.
              </div>
              <div className="border-l-2 border-success pl-3">
                Som <strong>butikkeier</strong> vil jeg{" "}
                <strong>se totalsalg per produkt forrige måned</strong>{" "}
                for å <strong>bestemme hvilke produkter jeg skal kjøpe inn mer av</strong>.
              </div>
              <div className="border-l-2 border-destructive pl-3 text-muted-foreground">
                <em>Dårlig:</em> «Implementere passord-reset» — ingen rolle, ingen verdi, bare teknisk task.
              </div>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>«For å»-delen er viktigst</strong> — det er VERDIEN. Hvis du
            ikke kan formulere den, er det et signal om at historien kanskje
            ikke trengs.
          </p>
        </section>

        <section id="invest" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. INVEST-kriteriene</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Sjekkliste for om en brukerhistorie er god nok til å gå inn i en
            sprint. Bill Wake formulerte INVEST.
          </p>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-32">Bokstav</th>
                  <th className="text-left font-semibold px-4 py-2">Står for</th>
                  <th className="text-left font-semibold px-4 py-2">Betyr</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">I</td><td className="px-4 py-3 font-medium">Independent</td><td className="px-4 py-3 text-muted-foreground">Kan leveres uavhengig av andre historier</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">N</td><td className="px-4 py-3 font-medium">Negotiable</td><td className="px-4 py-3 text-muted-foreground">Detaljene er åpne for samtale, ikke fastspikret</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">V</td><td className="px-4 py-3 font-medium">Valuable</td><td className="px-4 py-3 text-muted-foreground">Gir verdi for bruker eller forretning</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">E</td><td className="px-4 py-3 font-medium">Estimable</td><td className="px-4 py-3 text-muted-foreground">Teamet kan gi et fornuftig estimat</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">S</td><td className="px-4 py-3 font-medium">Small</td><td className="px-4 py-3 text-muted-foreground">Passer innenfor én sprint (tommelfingerregel: under halve sprinten)</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">T</td><td className="px-4 py-3 font-medium">Testable</td><td className="px-4 py-3 text-muted-foreground">Har målbare akseptansekriterier — vi vet når den er ferdig</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="ac" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Akseptansekriterier (Gherkin)</h2>
          <p className="text-sm text-muted-foreground mb-4">
            «Testable» betyr at vi vet når historien er ferdig. Akseptansekriterier
            (AC) gjør det konkret. Mange skriver dem i Gherkin-format: Given/When/Then.
          </p>

          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Eksempel: passord-reset
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`HISTORIE:
  Som innlogget kunde vil jeg kunne tilbakestille
  passordet mitt via e-post for å komme inn igjen.

AKSEPTANSEKRITERIER:

  Scenario: Reset med gyldig e-post
    GIVEN at jeg er på siden /glemt-passord
    WHEN jeg taster inn e-posten min og trykker "Send"
    THEN ser jeg en bekreftelse på skjermen
    AND mottar en e-post med en reset-lenke innen 1 minutt

  Scenario: Ukjent e-post
    GIVEN at jeg er på siden /glemt-passord
    WHEN jeg taster inn en e-post som ikke finnes
    THEN ser jeg samme bekreftelse (ikke avslør hvem som har konto)
    AND ingen e-post sendes`}</pre>
          </div>

          <p className="text-xs text-muted-foreground">
            <strong>Definition of Done (DoD)</strong> er separat fra AC. DoD er
            felles for alle historier («kode reviewet, tester grønne, deployet
            til staging, dokumentert»). AC er spesifikt for én historie.
          </p>
        </section>

        <section id="points" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Story points og Fibonacci</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Story points er et RELATIVT mål for kompleksitet/usikkerhet/innsats —
            ikke timer. Vi bruker en modifisert Fibonacci-skala.
          </p>

          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Fibonacci-skalaen
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`  1 ─ trivielt («endre en label»)
  2 ─ litt mer enn trivielt
  3 ─ smårutine
  5 ─ vanlig dag
  8 ─ stor historie, men håndterbar
 13 ─ veldig stor — vurdér å splitte
 21 ─ for stor — MÅ splittes
  ? ─ for usikker — trenger spike/utforskning`}</pre>
            <p className="mt-3 text-xs text-muted-foreground">
              Hvorfor Fibonacci? Avstanden mellom 1 og 2 er liten, mellom 8 og
              13 er stor. Det reflekterer at usikkerheten øker eksponentielt med
              størrelse — vi kan ikke skille mellom 21 og 22 i hodet.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Velocity
            </div>
            <p className="text-sm text-foreground mb-2">
              Summen av story points et team faktisk leverer per sprint, målt
              over tid. Etter 3-5 sprinter har du et snitt — bruk det til å
              forutsi hva som får plass i neste sprint.
            </p>
            <p className="text-xs text-muted-foreground">
              <strong>Ikke et produktivitets-tall.</strong> Et team som leverer
              30 SP/sprint er ikke «bedre» enn et som leverer 15 — deres SP er
              kalibrert til deres egen oppfatning av «5».
            </p>
          </div>
        </section>

        <section id="poker" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Planning poker</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Metoden teamet bruker for å bli enige om story points. Hovedpoenget
            er å diskutere uenighet — selve tallet er sekundært.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`1. PO leser historien høyt + AC
2. Teamet stiller spørsmål, PO svarer
3. Hver utvikler velger et kort i hemmelighet (Fibonacci)
4. Alle viser samtidig
5. Hvis sprik:
     - Høyest og lavest forklarer hvorfor de valgte som de valgte
     - Diskuter
     - Stem på nytt
6. Når teamet er enig (eller nær) — bruk det tallet`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Hvorfor i hemmelighet?</strong> For å unngå anchoring — at
            den seniore utvikleren sier «8» og resten følger uten å tenke.
          </p>
        </section>

        <section id="splitting" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Splitting av for store historier</h2>
          <p className="text-sm text-muted-foreground mb-4">
            En historie som er 13+ SP bør splittes. Her er vanlige mønstre.
          </p>

          <div className="space-y-3 text-sm">
            <div className="rounded-lg border border-border bg-card p-4">
              <strong>Splitt på arbeidsflyt</strong> — del en lang flyt i steg.
              Eks: «Bestilling» blir til «legg i kurv», «sjekkout», «betaling»,
              «bekreftelses-e-post».
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <strong>Splitt på datatype/variant</strong> — «importer kunder»
              blir til «importer fra CSV», «importer fra Excel», «importer fra
              API». Den enkleste først.
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <strong>Splitt på regler/kompleksitet</strong> — først «happy
              path», så «valideringsfeil», så «edge cases». Lever happy path
              først.
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <strong>Splitt på CRUD</strong> — først «opprett», så «vis», så
              «redigér», så «slett». Lever CRUD i prioritert rekkefølge.
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <strong>Splitt på UI vs API</strong> — først API-endepunktet med
              integrasjonstest, så UI som bruker det. Front-end og back-end kan
              jobbe parallelt på neste historie.
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Anti-mønster:</strong> ALDRI splitt langs tekniske lag
            («front-end», «back-end», «database»). Hver bit må levere VERDI for
            seg selv — ellers er det bare tasks i forkledning.
          </p>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/drag" className="text-brand hover:underline">Drag-oppgaver</Link>
              : INVEST-fill, Fibonacci-quiz, splitt-rekkefølge.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "uml" }} className="text-brand hover:underline">
                UML
              </Link>
              : diagrammene du kan trenge for å kommunisere designet.
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
