import { Link } from "@tanstack/react-router";
import {ArrowRight, Lightbulb, ArrowLeft } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";

const STEPS = [
  { title: "AI-historie i raske grep", anchor: "historie" },
  { title: "Bias i data og modeller", anchor: "bias" },
  { title: "Personvern og GDPR i ML", anchor: "gdpr" },
  { title: "Forklarbarhet (XAI)", anchor: "xai" },
  { title: "Kan maskiner «forstå»? — Kinarommet", anchor: "kinarommet" },
  { title: "EU AI Act og rammeverk", anchor: "ai-act" },
  { title: "Diskusjons-caser", anchor: "caser" },
];

export function Dte2602EtikkPage() {
  return (
    <StackPageShell title="DTE-2602 · Etikk & filosofiske grunnlagsproblemer" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2602 · Etikk & filosofi
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Etikk og filosofiske grunnlagsproblemer i AI
          </h1>
          <p className="mt-3 text-muted-foreground">
            UiT-pensum krever at du kan diskutere historie, etikk og filosofiske
            grunnlagsspørsmål. Mappe-oppgaven har en rapport-del — den vil ofte be
            deg drøfte fordeler/ulemper og etiske implikasjoner av den modellen du
            har bygget. Her er rammeverket.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Tips:</span> sensorer ser etter at du
              kjenner navn og konkrete eksempler — ikke generelle fraser om at
              «AI kan være farlig». Lær 3-4 konkrete caser utenat.
            </div>
          </div>
        </div>

        <CourseOutline courseId="dte2602-etikk-filosofi" steps={STEPS} />

        <section id="historie" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. AI-historie i raske grep</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Tidslinje du bør kunne. Henvis til disse i rapport-innledninger.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`1943   McCulloch & Pitts — første matematiske nevron-modell
1950   Turing — "Computing Machinery and Intelligence" + Turing-testen
1956   Dartmouth-konferansen — uttrykket "artificial intelligence" myntet
       (McCarthy, Minsky, Shannon, Rochester)
1957   Rosenblatt — Perceptron-algoritmen
1969   Minsky & Papert — viser at perceptron ikke kan lære XOR
       → første AI-vinter starter (finansiering tørker inn)

1980-tallet  Expert systems-bølgen (regelbaserte AI)
             — også den kollapser → andre AI-vinter

1986   Rumelhart, Hinton, Williams — backpropagation populariseres
1997   Deep Blue slår Kasparov i sjakk
1998   LeCun — LeNet (CNN for ziffer-gjenkjenning)
2006   Hinton — "deep belief networks" — DL-bølgen begynner
2012   AlexNet vinner ImageNet → CNN-revolusjonen
2014   GANs (Goodfellow)
2017   "Attention is all you need" — Transformer-arkitekturen
2018   BERT — språkmodeller blir mainstream
2020-  GPT-3, ChatGPT, multimodale modeller, AI-Act,
       store etiske og samfunnsmessige debatter`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Mønster:</strong> AI-feltet har gått gjennom flere «vintre»
            der lovende metoder har stoppet opp fordi datamengde eller regnekraft
            manglet. Dagens DL-bølge er drevet av (1) store datasett (internett),
            (2) GPU-er, og (3) bedre optimering. Spørsmålet er om vi treffer en ny
            mur, og hvor.
          </p>
        </section>

        <section id="bias" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Bias i data og modeller</h2>
          <p className="text-sm text-muted-foreground mb-4">
            En modell speiler dataene den ble trent på. Hvis data inneholder
            historisk diskriminering, gjentar modellen den — og kamuflerer den
            som «objektiv».
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Case 1: COMPAS (USA, 2016)
              </div>
              <p className="text-sm text-foreground mb-2">
                Risiko-score for tilbakefall hos kriminelle.
              </p>
              <p className="text-xs text-muted-foreground">
                ProPublica viste at COMPAS markerte svarte tiltalte som
                «høyrisiko» dobbelt så ofte som hvite (false positive). Modellen
                inkluderte aldri «rase» direkte — men bruke postnummer, anholdelses-
                historikk og andre proxies som bærer rase-signal.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Case 2: Amazon CV-screening (2018)
              </div>
              <p className="text-sm text-foreground mb-2">
                Modell for å rangere jobbsøkere.
              </p>
              <p className="text-xs text-muted-foreground">
                Trent på CV-er fra siste 10 år → flertall menn → modellen lærte å
                straffe ord som «kvinne-» (f.eks. «kvinne-fotball-lag»). Amazon
                trakk systemet — den «objektive» modellen videreførte historisk
                bias.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Case 3: Ansiktsgjenkjenning
              </div>
              <p className="text-sm text-foreground mb-2">
                Joy Buolamwini, MIT — "Gender Shades" (2018).
              </p>
              <p className="text-xs text-muted-foreground">
                Kommersielle ansiktsgjenkjennings-API-er fra IBM/Microsoft/Face++
                hadde &lt; 1 % feil på lyse menn, opp til 35 % feil på mørke
                kvinner. Dataene som modellene var trent på var massivt skjeve.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Case 4: Kreditt-scoring
              </div>
              <p className="text-sm text-foreground mb-2">
                Apple Card / Goldman Sachs (2019).
              </p>
              <p className="text-xs text-muted-foreground">
                Steve Wozniak fikk 10× høyere kredittgrense enn sin kone trass
                felles økonomi. Bank kunne ikke forklare modellen — som er nettopp
                problemet: black box uten ansvarlig agent.
              </p>
            </div>
          </div>
          <div className="mt-4 rounded-xl border border-border bg-card p-5">
            <h3 className="font-semibold mb-2 text-sm">Hvor kommer bias fra? — taksonomi</h3>
            <ul className="space-y-1 text-xs text-muted-foreground list-disc pl-5">
              <li><strong>Historisk bias:</strong> data speiler urettferdig fortid (Amazon CV).</li>
              <li><strong>Sampling-bias:</strong> noen grupper er underrepresentert (ansiktsgj.).</li>
              <li><strong>Måle-bias:</strong> y er proxy for det vi egentlig vil måle (anholdelser ≠ kriminalitet).</li>
              <li><strong>Aggregerings-bias:</strong> én modell brukes på undergrupper med ulik underlying-distribusjon.</li>
              <li><strong>Tilbakekoblings-bias:</strong> modellens beslutninger påvirker fremtidig data (predictive policing).</li>
            </ul>
          </div>
        </section>

        <section id="gdpr" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Personvern og GDPR i ML</h2>
          <p className="text-sm text-muted-foreground mb-4">
            GDPR (EU 2018) er den juridiske rammen for personopplysninger i Norge
            og EU. ML-prosjekter må tenke gjennom dette tidlig.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`GDPR-prinsipper relevante for ML:

  Lovlighet & samtykke
    — du må ha rettsgrunnlag for å bruke persondata.
    — samtykke må være informert og spesifikt.

  Formålsbegrensning
    — data samlet for "forskning" kan ikke uten videre brukes for "kommersiell modell".

  Dataminimering
    — bare data du faktisk trenger. Argument FOR feature selection.

  Riktighet
    — gale persondata må kunne rettes.

  Lagringsbegrensning
    — slett data når formål er oppfylt.

  Rett til forklaring (Artikkel 22)
    — ved automatiserte beslutninger med betydelig påvirkning
      har personen rett til menneskelig vurdering + forklaring.

  Rett til å bli glemt
    — utfordring for ML: hvordan "glemme" et eksempel fra en trent modell?
      Forskning på "machine unlearning" er i tidlig fase.`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Praktisk konsekvens:</strong> hvis prosjektet ditt bruker
            persondata, må du minst (1) anonymisere/pseudonymisere før modellering,
            (2) dokumentere rettsgrunnlag, (3) ha plan for sletting. På bachelor
            bruker du som regel åpne datasett — men diskuter likevel i rapport
            HVA som hadde gjeldt med ekte persondata.
          </p>
        </section>

        <section id="xai" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Forklarbarhet (XAI)</h2>
          <p className="text-sm text-muted-foreground mb-4">
            «Modellen sa det» er ikke en god begrunnelse for å nekte noen lån.
            Explainable AI handler om å gjøre modeller forståelige for mennesker.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`To familier metoder:

INHERENT TOLKBARE (white-box):
  — lineær regresjon          (vektene = importance)
  — logistisk regresjon       (vektene = log-odds)
  — decision trees            (følg grenene)
  — regelsystemer
  Bra når domene krever audit (medisin, finans, rettsvesen).

POST-HOC FORKLARINGER (black-box → forklaring):
  — feature_importance        (sklearn .feature_importances_ for trær)
  — permutation importance    (mål hvor mye accuracy faller når du
                              stokker én feature)
  — SHAP                      (Shapley-verdier — andel av prediksjon
                              som tilskrives hver feature, både global
                              og per-eksempel)
  — LIME                      (lokal lineær approksimasjon rundt ett punkt)
  — partial dependence plots  (hvordan prediksjonen varierer med én feature)

Hvorfor XAI viktig:
  - juridisk: GDPR artikkel 22
  - tillit: brukere stoler ikke på det de ikke forstår
  - feilsøking: forklaringer avslører bias (modellen brukte
    "postnummer" som proxy for rase → red flag)`}</pre>
          </div>
        </section>

        <section id="kinarommet" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Kan maskiner «forstå»? — Kinarommet</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Det klassiske filosofiske argumentet om AI fra John Searle (1980).
            Forventes at du kjenner det i et UiT-emne med filosofisk komponent.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Searles tankeeksperiment:

  Du sitter i et rom og kan ikke kinesisk.
  Inn glir det kinesiske tegn.
  Du har en bok som forteller deg, for hver kombinasjon av tegn,
  hvilke andre tegn du skal sende ut.
  Utenfor sitter en kineser som tror han fører en samtale med deg.

  Spørsmål: forstår DU kinesisk?
  Svar:    nei — du følger bare regler.

Konklusjon (Searle): selv om en maskin BESTÅR Turing-testen,
                     "forstår" den ikke språket — den manipulerer symboler.

Distinksjonen: SVAK AI    — modeller som simulerer intelligens
               STERK AI   — modeller som faktisk ER intelligente, bevisste

Motargumenter:
  - systemet svar:        ikke YOU forstår — det er SYSTEMET (du + boka + rommet)
                         som forstår.
  - brain-simulator svar: hvis nevroner kan tenke, kan også en god nok simulering?

For pensum: kjenn argumentet, vit at det er omdiskutert, og at det henger sammen
med spørsmålet om hva forståelse/bevissthet er. LLM-debatten i dag (er ChatGPT
"forståelig"?) er en ny runde med samme problem.`}</pre>
          </div>
        </section>

        <section id="ai-act" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. EU AI Act og rammeverk</h2>
          <p className="text-sm text-muted-foreground mb-4">
            EU AI Act (vedtatt 2024) er verdens første omfattende AI-lov og
            gjelder også i Norge via EØS. Risiko-basert tilnærming.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`AI Act-pyramiden — fire risikonivå:

  UAKSEPTABEL RISIKO   (FORBUDT)
    - social scoring (Kina-style)
    - manipulasjon av sårbare grupper
    - sanntid biometrisk identifikasjon i offentlig rom (m/unntak)

  HØY RISIKO           (STRENGE KRAV)
    - kritisk infrastruktur (strøm, vann)
    - utdanning & jobb (CV-screening)
    - rettsvesen, migrasjon
    - helse-diagnostikk
    Krav: dokumentasjon, risikohåndtering, transparens, menneskelig tilsyn,
          datakvalitet, robusthet, cybersikkerhet.

  LIMITED RISK         (TRANSPARENS)
    - chatbots må fortelle at de er AI
    - deepfakes må merkes

  MINIMAL RISK         (INGEN KRAV)
    - de fleste apper

Andre relevante rammeverk:
  - OECD AI Principles (2019)         — internasjonalt
  - NIST AI Risk Management Framework — USA, men brukt globalt
  - "Etiske retningslinjer for pålitelig AI" — EU 2019
       (de 7 prinsippene: menneske-tilsyn, robusthet, personvern,
        transparens, mangfold, samfunnsnytte, ansvarlighet)`}</pre>
          </div>
        </section>

        <section id="caser" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Diskusjons-caser</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Bruk disse til drøfting i mappe-rapporten. Argumenter med strukturen
            «hva er problemet, hvem er affisert, hva er alternativene, hva ville
            jeg gjort».
          </p>
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Case A — Triage-modell på sykehus
              </div>
              <p className="text-sm text-foreground mb-2">
                Du skal lage en modell som prioriterer pasienter i akuttmottak.
                Den predikerer «sannsynlighet for komplikasjon». Hvilke metrikker
                bruker du? Hvilke etiske dilemmaer melder seg? Hvem har ansvar
                hvis modellen tar feil?
              </p>
              <p className="text-xs text-muted-foreground">
                <strong>Vinkel:</strong> recall er sannsynligvis viktigere enn precision
                (false negative = pasient dør). Krever forklarbarhet (legen må forstå).
                EU AI Act høyrisiko → krav om menneskelig tilsyn (legen tar beslutning,
                ikke modellen).
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Case B — Karaktergrensemodell
              </div>
              <p className="text-sm text-foreground mb-2">
                UK 2020 — under pandemien ble eksamen avlyst og en algoritme
                satte karakterer basert på skolen sin historikk. Resultat: elever
                fra «svake» skoler ble systematisk underkarakter, uavhengig av
                personlig prestasjon. Hvor brast logikken?
              </p>
              <p className="text-xs text-muted-foreground">
                <strong>Vinkel:</strong> aggregeringsbias — én modell på en gruppe
                kan straffe enkeltindivid. Modellen brukte skolens historikk som
                proxy → predikerte gjennomsnittet, ikke individet. Manglet forklaring
                + appellrett.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Case C — Anbefalingssystem
              </div>
              <p className="text-sm text-foreground mb-2">
                YouTube/TikTok sin anbefalings-algoritme maksimerer engasjement.
                Studier viser at den fører brukere mot mer ekstremt innhold.
                Hvem har ansvar — ingeniør, plattform, regulator, bruker?
              </p>
              <p className="text-xs text-muted-foreground">
                <strong>Vinkel:</strong> målbar metrikk (engasjement) ≠ ønsket utfall
                (godt informert befolkning). Klassisk Goodhart's Law: «når en målestokk
                blir et mål, slutter den å være en god målestokk».
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Case D — LLM-er og opphavsrett
              </div>
              <p className="text-sm text-foreground mb-2">
                GPT/Claude er trent på enorme mengder web-tekst, ofte uten
                eksplisitt samtykke. NYT saksøker OpenAI. Hva er forskjellen
                mellom «trening» og «å lese for å lære»?
              </p>
              <p className="text-xs text-muted-foreground">
                <strong>Vinkel:</strong> uavklart juss. Argumenter: (1) fair use —
                transformative bruk. (2) ulovlig reproduksjon — modellen kan
                regenerere lange utdrag fra trening. Diskusjon om kompensasjon
                og lisensiering kommer.
              </p>
            </div>
          </div>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte2602-mappe-mal" }} className="text-brand hover:underline">
                Mappe-mal
              </Link>
              {" "}— hvor i rapporten skal du drøfte etikk?
              <ArrowRight className="inline h-3.5 w-3.5 ml-1" />
            </li>
            <li>
              <Link to="/drag" className="text-brand hover:underline">Drag-oppgaver</Link>
              {" "}— filter på «AI-etikk» og «ML-prosjektflyt».
            </li>
          </ul>
        </div>
              <div className="mt-6">
          <Link
            to="/stack/$slug"
            params={{ slug: "dte-2602" }}
            className="text-brand hover:underline inline-flex items-center gap-1 text-sm"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Tilbake til DTE-2602-hub
          </Link>
        </div>
</div>
    </StackPageShell>
  );
}
