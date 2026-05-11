import { Link } from "@tanstack/react-router";
import { Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";

const STEPS = [
  { title: "Historisk: fossefall og RUP", anchor: "historisk" },
  { title: "Smidig-manifestet", anchor: "manifest" },
  { title: "Scrum — events og roller", anchor: "scrum" },
  { title: "Kanban — flyt og WIP", anchor: "kanban" },
  { title: "Scrum vs Kanban — hvilket når?", anchor: "vs" },
  { title: "XP — praksiser for kvalitet", anchor: "xp" },
  { title: "Vanlige misforståelser", anchor: "feller" },
];

export function SuMetodikkerPage() {
  return (
    <StackPageShell title="Metodikker — fra fossefall til smidig" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2604 · Del 1 av 4
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Metodikker — fra fossefall til smidig
          </h1>
          <p className="mt-3 text-muted-foreground">
            Først historikken (fossefall, RUP) som forklarer hvorfor smidig
            oppstod. Deretter Scrum, Kanban og XP — de tre rammeverkene du må
            kjenne til eksamen og i prosjektarbeid.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Drill:</span>{" "}
              <Link to="/drag" className="text-brand hover:underline">drag-oppgavene</Link>{" "}
              under «Systemutvikling» — match Scrum-events til formål, roller
              til ansvar, og quiz om Kanban WIP.
            </div>
          </div>
        </div>

        <CourseOutline courseId="su-metodikker" steps={STEPS} />

        <section id="historisk" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Historisk: fossefall og RUP</h2>
          <p className="text-sm text-muted-foreground mb-4">
            For å forstå hvorfor smidig finnes må du vite hva det reagerte mot.
          </p>
          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Fossefall (Waterfall, Royce 1970)
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Krav  ──►  Design  ──►  Implementasjon  ──►  Test  ──►  Drift
 (uke 1-4)  (uke 5-8)    (uke 9-20)         (uke 21-24) (uke 25+)

Én vei. Hver fase ferdigstilles helt før neste starter.
Endring i krav etter design = stort tilbakeskritt.`}</pre>
            <p className="mt-3 text-xs text-muted-foreground">
              Fungerer når krav er stabile og kjente (eks: byggeprosjekter,
              embedded systemer der ROM brennes én gang). Feiler når krav
              endrer seg underveis — som de gjør i de fleste software-prosjekter.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              RUP — Rational Unified Process (1998)
            </div>
            <p className="text-sm text-foreground mb-2">
              Iterativt, men tungt prosess-dokumentert. Fire faser:
              <strong> inception, elaboration, construction, transition</strong>.
              Hver fase består av flere iterasjoner. Mye UML, mye dokumentasjon.
            </p>
            <p className="text-xs text-muted-foreground">
              Steget i riktig retning fra fossefall, men ble ofte kritisert for
              å være tungrodd i praksis. Smidig var en reaksjon på nettopp
              tyngden i RUP og fossefall.
            </p>
          </div>
        </section>

        <section id="manifest" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Smidig-manifestet (2001)</h2>
          <p className="text-sm text-muted-foreground mb-4">
            17 utviklere møttes i Utah og skrev et manifest med fire
            verdi-utsagn og 12 prinsipper. Du må kunne disse fire utsagnene.
          </p>
          <div className="rounded-xl border-2 border-brand/40 bg-brand/5 p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Vi setter:
  individer og samspill          OVER  prosesser og verktøy
  fungerende programvare         OVER  omfattende dokumentasjon
  kundesamarbeid                 OVER  kontraktsforhandling
  å respondere på endring        OVER  å følge en plan

(Det vil si: vi verdsetter elementene til høyre,
 men elementene til venstre verdsettes mer.)`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Manifestet er ikke et rammeverk — det er en verdiplattform. Scrum,
            Kanban og XP er konkrete rammeverk som bygger på disse verdiene.
          </p>
        </section>

        <section id="scrum" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Scrum — events og roller</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Mest brukte smidige rammeverk. Tidsboks-basert: sprinter på 1-4 uker
            (oftest 2). Du må kunne tre roller, fem events og tre artefakter.
          </p>

          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Tre roller
            </div>
            <ul className="space-y-2 text-sm">
              <li><strong>Product Owner (PO):</strong> eier produktbackloggen, prioriterer, snakker med interessenter. Maksimerer verdi.</li>
              <li><strong>Scrum Master (SM):</strong> coach for teamet og PO, fjerner hindringer (impediments), passer på at prosessen følges. Er IKKE prosjektleder.</li>
              <li><strong>Utviklingsteamet:</strong> 3-9 personer, kryssfunksjonelt (har all nødvendig kompetanse), selvstyrt. Eier HVORDAN.</li>
            </ul>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Fem events
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Sprint               (1-4 uker, oftest 2)  ── selve tidsboksen
├── Sprint Planning  (maks 8t for 4-ukers) ── hva skal vi gjøre?
├── Daily Scrum      (15 min, hver dag)    ── status, hindringer
├── Sprint Review    (maks 4t)             ── demo for stakeholders
└── Retrospective    (maks 3t)             ── hva lærte vi?`}</pre>
            <p className="mt-3 text-xs text-muted-foreground">
              <strong>Daily Scrum</strong> svarer på: hva gjorde jeg i går? hva
              skal jeg i dag? hva blokkerer meg? Det er ikke en status-rapport
              til Scrum Master — det er teamet som koordinerer seg.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Tre artefakter
            </div>
            <ul className="space-y-2 text-sm">
              <li><strong>Product Backlog:</strong> prioritert liste over alt produktet skal kunne. Eies av PO.</li>
              <li><strong>Sprint Backlog:</strong> det teamet har plukket inn i denne sprinten + plan for hvordan.</li>
              <li><strong>Increment:</strong> det fungerende produktet etter sprinten. Skal oppfylle Definition of Done.</li>
            </ul>
          </div>
        </section>

        <section id="kanban" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Kanban — flyt og WIP</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Kanban (japansk for «signal-kort») kommer fra Toyota og fokuserer
            på kontinuerlig flyt — ikke sprinter. Visualiser arbeidet, begrens
            arbeid i prosess (WIP), mål gjennomstrømming.
          </p>

          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Kanban-tavle
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`+──────────+──────────────+──────────────+──────────+
│ Backlog  │ I arbeid (3) │ Review (2)   │ Ferdig   │
+──────────+──────────────+──────────────+──────────+
│  [task]  │  [task]      │  [task]      │  [task]  │
│  [task]  │  [task]      │  [task]      │  [task]  │
│  [task]  │  [task]      │              │  [task]  │
│  [task]  │              │              │          │
+──────────+──────────────+──────────────+──────────+
              ↑WIP=3         ↑WIP=2

Tallene i header = WIP-limits. Når kolonnen er full,
må noe FERDIGSTILLES før noe nytt kan starte.`}</pre>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Hvorfor WIP-limits?
            </div>
            <p className="text-sm text-foreground mb-2">
              Mennesker er dårlige på multitasking. Hvis tre saker er «halvferdig»
              samtidig, er null verdi levert. Med WIP=1 ferdigstilles én før
              neste starter — total leveringstid går NED, selv om det føles tregere.
            </p>
            <p className="text-xs text-muted-foreground">
              <strong>Lead time:</strong> tid fra task opprettet til levert.{" "}
              <strong>Cycle time:</strong> tid fra arbeidet startet til levert.
              Kanban-team måler disse for å se hvor flaskehalser oppstår.
            </p>
          </div>
        </section>

        <section id="vs" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Scrum vs Kanban — hvilket når?</h2>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-40"></th>
                  <th className="text-left font-semibold px-4 py-2">Scrum</th>
                  <th className="text-left font-semibold px-4 py-2">Kanban</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border"><td className="px-4 py-3 font-medium">Kadens</td><td className="px-4 py-3 text-muted-foreground">Tidsboks (sprint)</td><td className="px-4 py-3 text-muted-foreground">Kontinuerlig flyt</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-medium">Roller</td><td className="px-4 py-3 text-muted-foreground">PO, SM, team</td><td className="px-4 py-3 text-muted-foreground">Ingen påkrevd</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-medium">Endring midt-i</td><td className="px-4 py-3 text-muted-foreground">Sprint er låst</td><td className="px-4 py-3 text-muted-foreground">Reprioritér når som helst</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-medium">Begrensning</td><td className="px-4 py-3 text-muted-foreground">Sprint-mål</td><td className="px-4 py-3 text-muted-foreground">WIP-limits per kolonne</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-medium">Passer best for</td><td className="px-4 py-3 text-muted-foreground">Produktutvikling med tydelig backlog</td><td className="px-4 py-3 text-muted-foreground">Drift/support, kontinuerlig innkommende</td></tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Mange team kjører «Scrumban» — Scrum-events (planlegging, retro,
            daily) kombinert med Kanban-tavle og WIP-limits.
          </p>
        </section>

        <section id="xp" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. XP — Extreme Programming</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Beck (1999). Ikke et planleggings-rammeverk som Scrum — XP er en
            samling tekniske praksiser for kvalitet. Brukes ofte SAMMEN med Scrum.
          </p>

          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Sentrale praksiser
            </div>
            <ul className="space-y-2 text-sm">
              <li><strong>Test-Driven Development (TDD):</strong> skriv testen først, så koden som får testen til å passere, så refaktorer. Red → Green → Refactor.</li>
              <li><strong>Pair programming:</strong> to utviklere, én tastatur. Driver skriver, navigator tenker høyt. Bytt jevnlig. Fungerer som kontinuerlig code review.</li>
              <li><strong>Continuous integration:</strong> alle merger til main flere ganger om dagen. Bygg og tester kjøres automatisk.</li>
              <li><strong>Refactoring:</strong> løpende forbedring av kode-struktur uten å endre atferd. Kreves når tester finnes.</li>
              <li><strong>Simple design:</strong> bygg enkleste løsning som virker NÅ. YAGNI — «You Aren&apos;t Gonna Need It».</li>
              <li><strong>Collective ownership:</strong> alle kan endre all kode. Ingen «det er Petters modul».</li>
            </ul>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              TDD-syklus
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`         +────────────+
         │   RED      │  Skriv test som FEILER
         │ (test fail)│  (kravet er ennå ikke kodet)
         +────────────+
                │
                ▼
         +────────────+
         │  GREEN     │  Skriv MINIMAL kode som
         │ (test pass)│  gjør testen grønn
         +────────────+
                │
                ▼
         +────────────+
         │ REFACTOR   │  Rydd opp uten å bryte
         │ (still pass)│ testen. Loop tilbake.
         +────────────+`}</pre>
          </div>
        </section>

        <section id="feller" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Vanlige misforståelser</h2>
          <div className="space-y-3 text-sm">
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>«Smidig = ingen dokumentasjon»</strong> — feil. Manifestet
              sier <em>fungerende programvare</em> over <em>omfattende</em>{" "}
              dokumentasjon. Du dokumenterer det som er nødvendig — bare ikke
              alt-i-forhåndsdokument.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>«Daily Scrum er status-møte for SM»</strong> — feil. Det
              er teamets eget møte for å koordinere arbeidet seg imellom. SM
              kan delta, men leder ikke.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>«Scrum Master = prosjektleder»</strong> — feil. SM coacher
              og fjerner hindringer. Teamet er selvstyrt. PO eier prioritering.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>«Kanban betyr ingen regler»</strong> — feil. Kanban har
              tydelige praksiser: visualiser, begrens WIP, mål flyt, gjør
              prosess-policyer eksplisitte, forbedre kontinuerlig.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>«TDD er bare testing»</strong> — feil. TDD er en{" "}
              <em>design-teknikk</em>. Det at du må skrive testen først presser
              deg til å designe små, koblbare enheter med klare grensesnitt.
            </div>
          </div>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/drag" className="text-brand hover:underline">Drag-oppgaver</Link>
              : Scrum-events match, INVEST-fill, Kanban WIP-quiz.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "brukerhistorier" }} className="text-brand hover:underline">
                Brukerhistorier
              </Link>
              : hvordan kravene faktisk skrives og estimeres i smidige team.
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
