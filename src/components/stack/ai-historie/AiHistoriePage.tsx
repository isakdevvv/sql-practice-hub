import { Link } from "@tanstack/react-router";
import { Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { AiTimelineScrubber } from "./AiTimelineScrubber";
import { KeyMomentsExplorer } from "./KeyMomentsExplorer";
import { ParadigmShiftsViz } from "./ParadigmShiftsViz";
import { WinterPredictionDemo } from "./WinterPredictionDemo";
import { AiHistoryQuiz } from "./AiHistoryQuiz";

const STEPS = [
  { title: "Hvorfor lære AI-historikk?", anchor: "hvorfor" },
  { title: "Tidslinje — dra deg fra Turing til transformer", anchor: "tidslinje" },
  { title: "14 nøkkelmomenter — utforsk hver milepæl", anchor: "moments" },
  { title: "Tre paradigmer — symbolic, connectionist, statistisk", anchor: "paradigmer" },
  { title: "AI-vintrene & dagens boble-debatt", anchor: "vintre" },
  { title: "Quiz — sjekk forståelsen", anchor: "quiz" },
  { title: "Videre lesing", anchor: "videre" },
];

export function AiHistoriePage() {
  return (
    <StackPageShell title="AI-historie — Turing til transformers" group="eksamen">
      <article className="container mx-auto px-4 py-10 max-w-3xl">
        <header className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2501 / DTE-2602 · AI-pensum · interaktiv lesjon
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Hvordan kom vi fra Turings spørsmål til ChatGPT?
          </h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            75 år med oppturer, vintre og paradigme-skifter. Dra deg gjennom 8
            epoker, klikk gjennom 14 nøkkelmomenter, og se hvordan pendelen har
            svingt mellom symbolic AI, connectionism og statistisk ML. Avslutt med
            quiz som tester at det sitter.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Pedagogisk poeng:</span> dagens
              LLM-revolusjon gir bare mening hvis du vet hva som kom før. Hver
              «nytt» konsept (attention, RLHF, in-context learning) har røtter
              tiår tilbake — og hver vinter forteller deg hva som kan gå galt
              hvis hypen overstiger leveransen.
            </div>
          </div>
        </header>

        <CourseOutline courseId="ai-historie" steps={STEPS} />

        <Section number="1" id="hvorfor" title="Hvorfor lære AI-historikk?">
          <p className="text-sm text-muted-foreground mb-3">
            Du kan kjøre <code>model.fit()</code> uten å vite hvor det kommer fra
            — men da blir hver komponent bare en regel å huske. Historien gjør
            hver mekanisme til <em>svaret på et reelt problem</em>:
          </p>
          <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1.5">
            <li>
              <strong className="text-foreground">Backpropagation</strong> finnes
              fordi Minsky &amp; Papert beviste at single-layer perceptron ikke
              kunne lære XOR. Backprop løste det.
            </li>
            <li>
              <strong className="text-foreground">Statistisk ML</strong> dominerte
              90-tallet fordi expert systems brakk sammen — folk søkte en mer
              robust metode.
            </li>
            <li>
              <strong className="text-foreground">Transformer</strong> finnes
              fordi RNN/LSTM var trege og hadde vansker med lange sekvenser.
              Self-attention løste det og skalerer effektivt på GPU.
            </li>
            <li>
              <strong className="text-foreground">RLHF</strong> (Reinforcement
              Learning from Human Feedback) finnes fordi GPT-3 var dyktig men
              «usnill» — finjustering med menneskelig tilbakemelding ga oss
              ChatGPT-stilen.
            </li>
            <li>
              <strong className="text-foreground">EU AI Act</strong> finnes fordi
              Gender Shades, COMPAS og deepfakes viste at uregulert ML har
              samfunnsmessige kostnader.
            </li>
          </ul>
          <p className="text-sm text-muted-foreground mt-3">
            Sensorer på DTE-2501 og DTE-2602 forventer at du kan plassere både
            algoritmer og samfunnshendelser på tidslinjen. Den interaktive
            tidslinjen under er din mentale ramme.
          </p>
        </Section>

        <Section number="2" id="tidslinje" title="Tidslinjen — dra deg fra Turing til transformer">
          <p className="text-sm text-muted-foreground mb-4">
            Bruk slideren (eller piltastene) for å bytte epoke. Per epoke ser du
            en animert illustrasjon (Turing-test, perceptron, regler-engine,
            backprop-flyt, sjakkbrett, ImageNet, attention-matrise), pluss kort
            for <strong className="text-emerald-600">hva var hot</strong> og{" "}
            <strong className="text-rose-600">hva gikk feil</strong>. AI-vintrene
            (1974-80 og 1987-93) er markert som grå soner.
          </p>
          <AiTimelineScrubber />
        </Section>

        <Section number="3" id="moments" title="14 nøkkelmomenter — utforsk hver milepæl">
          <p className="text-sm text-muted-foreground mb-4">
            Tidslinjen gir oversikten. Disse 14 momentene er sensorenes
            «yndlingsspørsmål» — klikk hver for å se{" "}
            <em>hva det var</em>, <em>hvorfor det var revolusjonerende</em>, og{" "}
            <em>hva som kom etter</em>.
          </p>
          <KeyMomentsExplorer />
        </Section>

        <Section number="4" id="paradigmer" title="Tre paradigmer — symbolic, connectionist, statistisk">
          <p className="text-sm text-muted-foreground mb-4">
            AI-feltet har pendlet mellom tre fundamentalt ulike syn på hvordan
            intelligens lages. Linje-grafen viser hvilket som dominerte i hvilket
            tiår. Klikk en linje (eller paradigme-knappen under) for å se
            representative algoritmer.
          </p>
          <ParadigmShiftsViz />
        </Section>

        <Section number="5" id="vintre" title="AI-vintrene & dagens boble-debatt">
          <p className="text-sm text-muted-foreground mb-4">
            To historiske vintre (1974-80 og 1987-93) skyldtes overhypede løfter
            som ikke ble innfridd. Bruk verktøyet under til å sammenligne dem og
            plassere dagens situasjon (mai 2026) på Gartner-hype-syklusen.
          </p>
          <WinterPredictionDemo />
        </Section>

        <Section number="6" id="quiz" title="Quiz — sjekk forståelsen">
          <p className="text-sm text-muted-foreground mb-4">
            8 spørsmål om navn, årstall og konsepter du har sett over. Få fasit
            + kontekst etter «Sjekk svar».
          </p>
          <AiHistoryQuiz />
        </Section>

        <Section number="7" id="videre" title="Videre lesing">
          <div className="rounded-xl border border-border bg-card p-5 text-sm">
            <ul className="space-y-2 text-muted-foreground list-disc pl-5">
              <li>
                Russell &amp; Norvig, <em>Artificial Intelligence: A Modern
                Approach</em> 4. utg., kap. 1.3 — «The History of Artificial
                Intelligence». Standardreferansen.
              </li>
              <li>
                <a
                  href="https://www.deeplearningbook.org/contents/intro.html"
                  className="text-brand hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  Goodfellow, Bengio &amp; Courville
                </a>{" "}
                — <em>Deep Learning</em>, kap. 1.2 «Historical Trends in Deep
                Learning». Gratis online.
              </li>
              <li>
                Cade Metz, <em>Genius Makers</em> (2021) — fortellingen om Hinton,
                LeCun, Bengio og «godfathers of deep learning». Lettlest.
              </li>
              <li>
                Stuart Russell, <em>Human Compatible</em> (2019) — argumenter for
                hvorfor neste generasjon AI må designes med menneskelige verdier
                som mål.
              </li>
              <li>
                <Link to="/stack/$slug" params={{ slug: "dte2501-ai-paradigmer-kart" }} className="text-brand hover:underline">
                  AI-paradigmer kart
                </Link>{" "}
                — visualiserer algoritme-familier (søk, adversarial, evolutionary,
                ML, RL) som henger sammen på tvers av epoker.
              </li>
              <li>
                <Link to="/stack/$slug" params={{ slug: "dte2602-etikk-filosofi" }} className="text-brand hover:underline">
                  Etikk &amp; filosofiske grunnlagsproblemer
                </Link>{" "}
                — Turing-test, Kinarommet, GDPR, EU AI Act, bias-taksonomi.
                Naturlig oppfølger.
              </li>
              <li>
                <Link to="/stack/$slug" params={{ slug: "ai-etikk" }} className="text-brand hover:underline">
                  AI-etikk: bias, fairness, GDPR
                </Link>{" "}
                — interaktiv sandbox med case-studier (COMPAS, Amazon CV, Gender
                Shades).
              </li>
            </ul>
          </div>
        </Section>
      </article>
    </StackPageShell>
  );
}

function Section({
  number,
  id,
  title,
  children,
}: {
  number: string;
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mb-10">
      <h2 className="text-xl font-semibold mb-3">
        {number}. {title}
      </h2>
      {children}
    </section>
  );
}
