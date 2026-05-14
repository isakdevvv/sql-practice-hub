import { Link } from "@tanstack/react-router";
import { ArrowRight, Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { BayesArealer } from "./BayesArealer";

const STEPS = [
  { title: "Hvorfor sannsynlighet?", anchor: "intro" },
  { title: "Betinget sannsynlighet", anchor: "betinget" },
  { title: "Bayes' teorem", anchor: "bayes" },
  { title: "Gjennomgått eksempel — sykdomstest", anchor: "eksempel" },
  { title: "Bayes som arealer (interaktiv)", anchor: "arealer" },
  { title: "Naive Bayes-klassifikator", anchor: "naive" },
  { title: "Betinget uavhengighet", anchor: "uavhengighet" },
  { title: "Praktiske fallgruver", anchor: "fallgruver" },
];

export function BayesPage() {
  return (
    <StackPageShell title="Bayes — beslutninger under usikkerhet" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2501 · Usikkerhet
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Bayes — å oppdatere troen din i lys av bevis
          </h1>
          <p className="mt-3 text-muted-foreground">
            Logikk er knivskarp: alt er sant eller usant. Den virkelige verden er
            ikke slik. Bayes' teorem gir oss det formelle apparatet for å resonnere
            med usikkerhet — sjelen i moderne statistisk AI.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Sentralt:</span> en posterior (P(H|D))
              kommer fra en prior (P(H)) ganget med en likelihood (P(D|H)),
              normalisert.
            </div>
          </div>
        </div>

        <CourseOutline courseId="bayes" steps={STEPS} />

        <section id="intro" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Hvorfor sannsynlighet?</h2>
          <p className="text-sm text-muted-foreground mb-4">
            En AI-agent vet sjelden ALT om sin verden. Sensorene støyer, modellene
            er ufullstendige, fremtiden er usikker. Sannsynlighet er språket vi
            bruker til å kvantifisere det vi ikke vet.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Grunnaksiomer (Kolmogorov):
  0 ≤ P(A) ≤ 1
  P(true) = 1,   P(false) = 0
  P(A ∨ B) = P(A) + P(B) − P(A ∧ B)

Avledet:
  P(¬A) = 1 − P(A)
  Σ over alle utfall = 1`}</pre>
          </div>
        </section>

        <section id="betinget" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Betinget sannsynlighet</h2>
          <p className="text-sm text-muted-foreground mb-4">
            P(A | B) = sannsynlighet for A <em>gitt at</em> vi vet B er sann.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Definisjon:
   P(A | B) = P(A ∧ B) / P(B)        (forutsatt P(B) > 0)

Produktregel (begge sider av definisjonen):
   P(A ∧ B) = P(A | B) · P(B)
            = P(B | A) · P(A)

Det er nettopp den siste likheten som gir Bayes.`}</pre>
          </div>
        </section>

        <section id="bayes" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Bayes' teorem</h2>
          <div className="rounded-xl border-2 border-brand/40 bg-brand/5 p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`               P(D | H) · P(H)
   P(H | D) = ────────────────────
                    P(D)

   posterior  =  likelihood × prior
                 ───────────────────
                       evidens

Hvordan utlede den:
  P(H | D) · P(D) = P(H ∧ D)
                  = P(D | H) · P(H)
  Del begge sider på P(D).`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Begreper:</strong>{" "}
            <span className="font-mono">prior</span> P(H) er det vi trodde FØR vi så
            data. <span className="font-mono">likelihood</span> P(D|H) er hvor
            sannsynlig dataen er gitt hypotesen. <span className="font-mono">posterior</span>{" "}
            P(H|D) er det vi tror ETTER å ha sett data.
          </p>
        </section>

        <section id="eksempel" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Gjennomgått eksempel — sykdomstest</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Klassikeren som narrer de fleste intuisjoner.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Sykdom S rammer 1% av befolkningen.        P(S) = 0.01
Testen er 99% sensitiv  (P(+|S)  = 0.99).
Testen er 99% spesifikk (P(−|¬S) = 0.99).
                      => P(+|¬S) = 0.01

Du tester positivt. Hva er P(S | +)?

P(+) = P(+|S)·P(S) + P(+|¬S)·P(¬S)
     = 0.99·0.01 + 0.01·0.99
     = 0.0099 + 0.0099
     = 0.0198

P(S | +) = P(+|S)·P(S) / P(+)
         = (0.99 · 0.01) / 0.0198
         = 0.0099 / 0.0198
         = 0.5  (50%)

Selv med en 99%-test er det BARE 50% sannsynlighet for
at du faktisk er syk — fordi sykdommen er sjelden.
Det er base-rate-fellen.`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Lærdom:</strong> en sjelden prior dominerer ofte en sterk
            likelihood. Det er hvorfor screening-tester for sjeldne sykdommer alltid
            må følges opp av en bekreftende test.
          </p>
        </section>

        <section id="arealer" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Bayes som arealer — fysisk intuisjon</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Bayes-formelen er enkel å skrive, men vanskelig å føle på kroppen. Hvert
            rektangel under representerer en gruppe mennesker. Drag på sliderne for
            prevalens, sensitivitet og spesifisitet — og se direkte hvor mange av de
            som tester positivt som faktisk er syke.
          </p>
          <BayesArealer />
        </section>

        <section id="naive" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Naive Bayes-klassifikator</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Generaliser sykdomseksempelet til en hel klassifikator: gitt features
            (x1, ..., xn), hvilken klasse C er mest sannsynlig?
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Vi vil ha:
  P(C | x1, ..., xn) = P(x1, ..., xn | C) · P(C) / P(x)

Den vanskelige biten er P(x1, ..., xn | C) — den krever
modellering av hvordan ALLE features samspiller. Med n=20
binære features har du 2^20 kombinasjoner per klasse.

NAIVE-antagelsen — features er BETINGET UAVHENGIGE gitt C:
  P(x1, ..., xn | C) = P(x1 | C) · P(x2 | C) · ... · P(xn | C)

Dermed:
  P(C | x) ∝ P(C) · ∏ P(xi | C)

Klassifikatoren:
  argmax over C av  P(C) · ∏ P(xi | C)`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Hvorfor heter den «naive»?</strong> Antagelsen om at features er
            uavhengige er ofte feil — men i praksis fungerer modellen overraskende
            bra (spam-filter, tekstklassifikasjon). Den er <em>bias-tung</em> men
            <em> variance-lett</em>: gjør den enkel og rask å trene med lite data.
          </p>
        </section>

        <section id="uavhengighet" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Betinget uavhengighet</h2>
          <p className="text-sm text-muted-foreground mb-4">
            «Uavhengig» og «betinget uavhengig» er ikke det samme — pass på!
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Uavhengig:
  P(A ∧ B) = P(A) · P(B)
  Eksempel: to terninger som ikke påvirker hverandre.

Betinget uavhengig gitt C:
  P(A ∧ B | C) = P(A | C) · P(B | C)
  «Når vi VET C, gir B ingen ekstra info om A.»

Eksempel:
  C = «det regner»
  A = «paraply ute»
  B = «våte fortauer»
  A og B er KORRELERTE i seg selv (begge skjer når det regner).
  Men gitt at vi vet C, gir paraplyen ingen ekstra info om
  hvor våte fortauene er. De er betinget uavhengige gitt C.`}</pre>
          </div>
        </section>

        <section id="fallgruver" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">8. Praktiske fallgruver</h2>
          <div className="space-y-3 text-sm">
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>Zero-frequency:</strong> hvis en feature-verdi ikke fins i
              trening for en gitt klasse, blir P(xi|C) = 0 og hele produktet
              kollapser. Bruk <em>Laplace smoothing</em> (add-1) for å unngå det.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>Numerisk underflow:</strong> mange små sannsynligheter ganget
              sammen blir 0 i flytetall. Bruk LOG-sannsynligheter: summér i stedet
              for å gange.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>Korrelerte features:</strong> naive-antagelsen er bare en
              tilnærming. Hvis to features er sterkt korrelerte (f.eks. «høyde i cm»
              og «høyde i tommer»), telles informasjonen dobbelt og modellen blir
              overconfident.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>Prior-valg:</strong> hvis du ikke har bakgrunnsdata, bruk en
              uniform prior. Men husk at en sterk prior kan dominere noen få
              datapunkter.
            </div>
          </div>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/drag" className="text-brand hover:underline">Drag-oppgaver</Link>{" "}
              under «Bayes»: Bayes-formel-fill-in, P(A|B)-utregning, naive-Bayes-quiz.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte-2602" }} className="text-brand hover:underline">
                DTE-2602
              </Link>{" "}
              tar over for resten av ML-pensumet — supervised, unsupervised, NN.
              <ArrowRight className="inline h-3.5 w-3.5 ml-1" />
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
