import { useState } from "react";

/**
 * 14 nøkkelmomenter i AI-historikken. Klikkbare kort — vis 1) hva det var,
 * 2) hvorfor revolusjonerende, 3) hva som kom etter.
 *
 * Tre visuelle motiv-typer: sjakkbrett (Deep Blue), grid (CNN/ImageNet),
 * attention-matrise (Transformer). For øvrige momenter brukes ren ikonografi.
 */

type MotifKind = "chess" | "grid" | "attention" | "neural" | "tree" | "scroll";

type Moment = {
  id: string;
  year: number;
  title: string;
  what: string;
  why: string;
  after: string;
  motif: MotifKind;
};

const MOMENTS: Moment[] = [
  {
    id: "turing-test",
    year: 1950,
    title: "Turing-testen",
    what: "Alan Turing publiserte «Computing Machinery and Intelligence» og foreslo det vi i dag kaller Turing-testen: kan en menneskelig dommer skille en maskin fra et menneske i tekstsamtale?",
    why: "Første operasjonelle definisjon av «tenkende» maskin. Erstattet fruktløse filosofiske spørsmål («tenker maskinen?») med et målbart kriterium («kan den bedra oss?»).",
    after: "Searles Kinarom-argument (1980) angrep testen filosofisk. ELIZA (1966) lurte folk uten å «forstå». Moderne LLMs består enkle versjoner av testen rutinemessig — men debatten om forståelse vs simulering fortsetter.",
    motif: "scroll",
  },
  {
    id: "dartmouth",
    year: 1956,
    title: "Dartmouth-konferansen",
    what: "John McCarthy organiserte en 2-måneders workshop på Dartmouth College. McCarthy, Minsky, Shannon og Rochester samlet de første pionerene. Uttrykket «artificial intelligence» ble myntet.",
    why: "AI ble født som eget fagfelt — ikke bare en spredt samling spørsmål. Folkene som var der definerte forskningsagendaen for de neste 20 årene.",
    after: "Stanford AI Lab, MIT AI Lab og CMU Robotics Institute ble etablert. Symbolic AI dominerte. Forventningene var skyhøye — Simon: «innen 10 år vil maskiner gjøre alt et menneske kan».",
    motif: "tree",
  },
  {
    id: "perceptron",
    year: 1958,
    title: "Perceptron",
    what: "Frank Rosenblatt presenterte perceptron-algoritmen — første lærbare nevrale nettverk. Input × vekter, sum, terskel → output. Trent med en enkel feilkorreksjonsregel.",
    why: "Første bevis på at en maskin kunne lære fra eksempler i stedet for fra regler. New York Times skrev at perceptron «vil lære å gå, snakke, se, skrive og være bevisst».",
    after: "Minsky & Papert (1969) viste at en enkel perceptron ikke kan lære XOR. Dette ble overtolket som «alle nevrale nett er begrenset», og connectionism døde i nesten 20 år.",
    motif: "neural",
  },
  {
    id: "eliza",
    year: 1966,
    title: "ELIZA",
    what: "Joseph Weizenbaum bygget en enkel chatbot ved MIT som simulerte en Rogeriansk psykoterapeut. Den brukte mønster-matching: «Jeg er trist» → «Hvorfor er du trist?»",
    why: "Folk åpnet seg dypt for ELIZA — selv etter at Weizenbaum forklarte at programmet var trivielt. Weizenbaum ble bekymret for hva dette sa om menneskelig tilbøyelighet til antropomorfisering.",
    after: "Eliza-effekten — å tilskrive intelligens til enkle systemer — er like aktuell i dag med LLM-er. Weizenbaum skrev «Computer Power and Human Reason» (1976), en av AI-etikkens tidlige tekster.",
    motif: "scroll",
  },
  {
    id: "expert-systems",
    year: 1972,
    title: "Expert systems (MYCIN)",
    what: "Edward Shortliffe ved Stanford bygget MYCIN — et regelbasert system for å diagnostisere blodinfeksjoner. ~600 regler av typen «hvis A og B, så konklusjon C med sannsynlighet X».",
    why: "Viste at AI kunne matche eksperter (leger) på smale domener. Inspirerte XCON, R1 og hele expert systems-industrien som i 1985 omsatte for milliarder.",
    after: "Expert systems-bobla sprakk rundt 1990 — regler var skjøre, vedlikehold dyrt, kunnskaps-acquisition flaskehals. Andre AI-vinter fulgte. Men dagens decision trees og rule engines (Drools) er direkte arvtakere.",
    motif: "tree",
  },
  {
    id: "backprop",
    year: 1986,
    title: "Backpropagation populariseres",
    what: "Rumelhart, Hinton og Williams publiserte «Learning representations by back-propagating errors» i Nature. Backprop-algoritmen (kjent fra 1974) ble gjort kjent og praktisk — kjederegelen for å oppdatere vekter i fler-lag nett.",
    why: "Løste XOR-problemet Minsky/Papert peket på. Endelig kunne man trene dypere nett. Connectionism kom tilbake — med matematisk fundament.",
    after: "NETtalk leste tekst høyt (1987). LeCuns LeNet leste sjekker (1989). Men trege CPU-er + små datasett begrenset hvor dypt man kunne gå. Måtte vente på GPU-er + ImageNet før alt klikket.",
    motif: "neural",
  },
  {
    id: "deep-blue",
    year: 1997,
    title: "Deep Blue slår Kasparov",
    what: "IBMs Deep Blue vant en 6-runders match (3.5-2.5) mot sittende verdensmester Garri Kasparov i New York. Spesial-laget hardware som evaluerte 200 millioner posisjoner per sekund.",
    why: "Symbolsk seier — hvis maskinen kan slå menneskeheten i «kongelig spill», hva annet kan den gjøre? Massiv mediadekning, AI fikk plutselig allment publikum.",
    after: "Sjakk-engines er nå rutinemessig sterkere enn alle mennesker. AlphaGo (2016) gjorde det samme for Go — uten brute force, ved hjelp av dyp læring. Distinksjonen mellom «symbolsk» og «lært» AI ble tydeligere.",
    motif: "chess",
  },
  {
    id: "alexnet",
    year: 2012,
    title: "AlexNet / ImageNet",
    what: "Krizhevsky, Sutskever og Hinton vant ImageNet-konkurransen 2012 med en CNN trent på 2 GPU-er. Topp-5 feil 15.3% mot forrige beste 26.2% — uhørt forbedring.",
    why: "Beviste at dyp læring + store data + GPU-er var en kvalitativ revolusjon, ikke gradvis fremgang. Praktisk talt alle bilde-relaterte AI-applikasjoner pivoterte over natten.",
    after: "ResNet (2015) gikk til 152 lag. CNN ble standard i medisinsk bildebehandling, selvkjørende biler, ansiktsgjenkjenning. Hinton, Sutskever og Krizhevsky ble kjøpt opp av Google.",
    motif: "grid",
  },
  {
    id: "word2vec",
    year: 2013,
    title: "Word2Vec",
    what: "Tomas Mikolov & team ved Google publiserte Word2Vec — en metode for å lære vektor-representasjoner av ord fra rå tekst. Kjent eksempel: vec(king) − vec(man) + vec(woman) ≈ vec(queen).",
    why: "Viste at distribuerte representasjoner kunne fange semantiske relasjoner. La grunnlaget for moderne NLP — alle nyere språkmodeller bygger på embeddings.",
    after: "GloVe (Stanford, 2014), FastText (Facebook, 2016), kontekstuelle embeddings (ELMo 2018), og Transformer-baserte (BERT, GPT) er alle utviklinger på denne ideen.",
    motif: "scroll",
  },
  {
    id: "gans",
    year: 2014,
    title: "GANs (Generative Adversarial Networks)",
    what: "Ian Goodfellow fikk ideen mens han kranglet med kolleger på en bar i Montreal: tren to nett mot hverandre. Generator lager fake bilder, discriminator prøver å skille fake fra ekte. Begge blir bedre.",
    why: "Første sterke generative modell for naturlige bilder. Yann LeCun kalte det «den mest interessante ideen i ML de siste 10 årene».",
    after: "StyleGAN (NVIDIA 2018), deepfake-debatt, AI-genererte ansikter på thispersondoesnotexist.com. Etter ~2021 ble GANs gradvis utkonkurrert av diffusjons-modeller for bilde-generering.",
    motif: "neural",
  },
  {
    id: "alphago",
    year: 2016,
    title: "AlphaGo slår Lee Sedol",
    what: "DeepMinds AlphaGo vant 4-1 mot 18-ganger verdensmester Lee Sedol i Go. Trekk 37 i andre kamp ble berømt — en strategi ingen menneskelig spiller ville gjort, men som viste seg å være genial.",
    why: "Go har 10^170 mulige posisjoner — brute force umulig. AlphaGo brukte dyp læring (CNN + RL) + Monte Carlo Tree Search. Demonstrasjon av lært intuisjon utover ren beregning.",
    after: "AlphaGo Zero (2017) lærte fra null uten menneskelige spill. AlphaZero generaliserte til sjakk og shogi. AlphaFold (2018, 2020) anvendte samme teknikker på proteinfolding — løste 50 år gammelt biologisk problem.",
    motif: "grid",
  },
  {
    id: "transformer",
    year: 2017,
    title: "«Attention is all you need»",
    what: "Vaswani et al. ved Google Brain publiserte Transformer-arkitekturen. Ingen rekurrens, ingen konvolusjoner — bare attention. Hver token kan «se» hver annen token direkte, parallelt.",
    why: "Løste RNN-flaskehalsen (sekvensiell prosessering, vanskelig gradient-flyt). Skalerer effektivt på GPU/TPU. Ble fundament for ALT moderne i NLP.",
    after: "BERT (2018), GPT-2 (2019), GPT-3 (2020), ChatGPT (2022), GPT-4 (2023), Claude, Gemini, Llama. Transformere har også overtatt computer vision (Vision Transformer, 2020) og protein-modellering (AlphaFold 2).",
    motif: "attention",
  },
  {
    id: "gpt3",
    year: 2020,
    title: "GPT-3",
    what: "OpenAI publiserte GPT-3 med 175 milliarder parametre (~100× GPT-2). Viste «in-context learning»: modellen lærer nye oppgaver fra et par eksempler i prompten — ingen fine-tuning nødvendig.",
    why: "Demonstrasjon av at skala alene driver kvalitative kapabilitets-skift. «Emergent abilities» — evner som ikke fantes ved mindre skala. Endret hva forskere forventet av store modeller.",
    after: "ChatGPT (basert på GPT-3.5) lanserte nov 2022 og nådde 100M brukere på 2 måneder. AI fikk masseadopsjon, debatt om hallucinasjon, opphavsrett, jobbtap. Race mellom OpenAI, Anthropic, Google, Meta tok av.",
    motif: "attention",
  },
  {
    id: "chatgpt",
    year: 2022,
    title: "ChatGPT lanseres",
    what: "OpenAI ga ut ChatGPT (basert på GPT-3.5) som gratis chat-grensesnitt 30. november 2022. Modellen var finjustert med RLHF (Reinforcement Learning from Human Feedback) for å være hjelpsom og samtalevennlig.",
    why: "Raskeste produkt-vekst i historien: 1M brukere på 5 dager, 100M på 2 måneder. Brakte LLMs ut av forskningsmiljøet og inn i dagligliv. Plutselig snakket alle om AI.",
    after: "GPT-4 (mars 2023, multimodal). Anthropics Claude, Googles Bard/Gemini, Llama, Mistral. EU AI Act vedtatt 2024. Universiteter, jobber, kunst — alt påvirket. Vi er midt i en eksperiment-fase som ingen vet utfallet av.",
    motif: "attention",
  },
];

// ============== MOTIF-IKONER ==============

function Motif({ kind }: { kind: MotifKind }) {
  switch (kind) {
    case "chess":
      return (
        <svg viewBox="0 0 60 60" className="w-full h-full">
          {Array.from({ length: 4 }).map((_, r) =>
            Array.from({ length: 4 }).map((_, c) => (
              <rect
                key={`${r}-${c}`}
                x={5 + c * 12}
                y={5 + r * 12}
                width={12}
                height={12}
                className={(r + c) % 2 === 0 ? "fill-amber-100" : "fill-amber-700"}
              />
            )),
          )}
          <circle cx={17} cy={29} r={4} className="fill-zinc-900" />
          <circle cx={41} cy={41} r={4} className="fill-zinc-100 stroke-zinc-900" strokeWidth={1} />
        </svg>
      );
    case "grid":
      return (
        <svg viewBox="0 0 60 60" className="w-full h-full">
          {Array.from({ length: 36 }).map((_, i) => {
            const r = Math.floor(i / 6);
            const c = i % 6;
            const v = (i * 17) % 100;
            return (
              <rect
                key={i}
                x={5 + c * 8}
                y={5 + r * 8}
                width={8}
                height={8}
                fill={`hsl(${v * 3.6}, 60%, 50%)`}
                opacity={0.6}
              />
            );
          })}
        </svg>
      );
    case "attention":
      return (
        <svg viewBox="0 0 60 60" className="w-full h-full">
          {Array.from({ length: 25 }).map((_, i) => {
            const r = Math.floor(i / 5);
            const c = i % 5;
            const intensity = Math.abs(r - c) <= 1 ? 0.9 : 0.3;
            return (
              <rect
                key={i}
                x={5 + c * 10}
                y={5 + r * 10}
                width={10}
                height={10}
                fill={`rgba(14,165,233,${intensity})`}
              />
            );
          })}
        </svg>
      );
    case "neural":
      return (
        <svg viewBox="0 0 60 60" className="w-full h-full">
          {[
            { x: 10, y: 15 },
            { x: 10, y: 30 },
            { x: 10, y: 45 },
          ].map((p, i) => (
            <circle key={`l-${i}`} cx={p.x} cy={p.y} r={4} className="fill-sky-400" />
          ))}
          {[
            { x: 30, y: 20 },
            { x: 30, y: 40 },
          ].map((p, i) => (
            <circle key={`m-${i}`} cx={p.x} cy={p.y} r={4} className="fill-emerald-400" />
          ))}
          <circle cx={50} cy={30} r={4} className="fill-rose-400" />
          <line x1={14} y1={15} x2={26} y2={20} stroke="#94a3b8" />
          <line x1={14} y1={15} x2={26} y2={40} stroke="#94a3b8" />
          <line x1={14} y1={30} x2={26} y2={20} stroke="#94a3b8" />
          <line x1={14} y1={30} x2={26} y2={40} stroke="#94a3b8" />
          <line x1={14} y1={45} x2={26} y2={20} stroke="#94a3b8" />
          <line x1={14} y1={45} x2={26} y2={40} stroke="#94a3b8" />
          <line x1={34} y1={20} x2={46} y2={30} stroke="#94a3b8" />
          <line x1={34} y1={40} x2={46} y2={30} stroke="#94a3b8" />
        </svg>
      );
    case "tree":
      return (
        <svg viewBox="0 0 60 60" className="w-full h-full">
          <circle cx={30} cy={10} r={4} className="fill-emerald-500" />
          <line x1={30} y1={14} x2={15} y2={25} stroke="#94a3b8" />
          <line x1={30} y1={14} x2={45} y2={25} stroke="#94a3b8" />
          <circle cx={15} cy={28} r={4} className="fill-emerald-400" />
          <circle cx={45} cy={28} r={4} className="fill-emerald-400" />
          <line x1={15} y1={32} x2={7} y2={45} stroke="#94a3b8" />
          <line x1={15} y1={32} x2={23} y2={45} stroke="#94a3b8" />
          <line x1={45} y1={32} x2={37} y2={45} stroke="#94a3b8" />
          <line x1={45} y1={32} x2={53} y2={45} stroke="#94a3b8" />
          <circle cx={7} cy={48} r={3} className="fill-amber-400" />
          <circle cx={23} cy={48} r={3} className="fill-amber-400" />
          <circle cx={37} cy={48} r={3} className="fill-amber-400" />
          <circle cx={53} cy={48} r={3} className="fill-amber-400" />
        </svg>
      );
    case "scroll":
      return (
        <svg viewBox="0 0 60 60" className="w-full h-full">
          <rect x={10} y={8} width={40} height={44} rx={3} className="fill-amber-100 stroke-amber-700" strokeWidth={1} />
          {[14, 20, 26, 32, 38, 44].map((y) => (
            <line key={y} x1={14} y1={y} x2={46} y2={y} stroke="#92400e" strokeWidth={0.7} />
          ))}
        </svg>
      );
  }
}

// ============== HOVED-KOMPONENT ==============

export function KeyMomentsExplorer() {
  const [selected, setSelected] = useState<string>(MOMENTS[0].id);
  const moment = MOMENTS.find((m) => m.id === selected) ?? MOMENTS[0];

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-lg font-semibold mb-1">14 nøkkelmomenter — klikk for å utforske</h3>
      <p className="text-xs text-muted-foreground mb-4">
        Hvert moment har tre kort: <strong>hva det var</strong>, <strong>hvorfor det
        var revolusjonerende</strong>, <strong>hva som kom etter</strong>.
      </p>

      {/* Tidslinje-strek med klikkbare punkter */}
      <div className="mb-4 relative">
        <div className="h-1 bg-zinc-300 dark:bg-zinc-700 rounded-full" />
        <div className="absolute inset-x-0 -top-2 flex">
          {MOMENTS.map((m, i) => {
            const pos = ((m.year - 1950) / (2025 - 1950)) * 100;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelected(m.id)}
                className={`absolute -translate-x-1/2 px-1 py-0.5 rounded transition ${
                  selected === m.id
                    ? "bg-brand text-white scale-110"
                    : "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 hover:bg-brand/40"
                }`}
                style={{ left: `${pos}%`, top: `${(i % 2) * 22}px` }}
                title={`${m.year} — ${m.title}`}
              >
                <span className="text-[9px] font-mono font-bold">{m.year}</span>
              </button>
            );
          })}
        </div>
      </div>
      {/* spacer pga absolutte knapper */}
      <div className="h-12" />

      {/* Detalj-visning */}
      <div className="grid sm:grid-cols-[80px_1fr] gap-4 mb-4">
        <div className="w-20 h-20 rounded-lg border border-border bg-background p-2">
          <Motif kind={moment.motif} />
        </div>
        <div>
          <div className="text-xs text-brand font-mono font-bold">{moment.year}</div>
          <h4 className="text-xl font-semibold leading-tight">{moment.title}</h4>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-3 text-sm">
        <div className="rounded-lg border border-border bg-background p-3">
          <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold mb-1.5">
            Hva det var
          </div>
          <p className="text-foreground/90 leading-relaxed">{moment.what}</p>
        </div>
        <div className="rounded-lg border border-emerald-300/40 bg-emerald-50 dark:bg-emerald-950/30 p-3">
          <div className="text-[10px] uppercase tracking-wider text-emerald-600 font-semibold mb-1.5">
            Hvorfor revolusjonerende
          </div>
          <p className="text-foreground/90 leading-relaxed">{moment.why}</p>
        </div>
        <div className="rounded-lg border border-brand/30 bg-brand/5 p-3">
          <div className="text-[10px] uppercase tracking-wider text-brand font-semibold mb-1.5">
            Hva kom etter
          </div>
          <p className="text-foreground/90 leading-relaxed">{moment.after}</p>
        </div>
      </div>

      {/* Mini-grid: alle momentene som kort til hurtig-tilgang */}
      <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {MOMENTS.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setSelected(m.id)}
            className={`text-left p-2 rounded-md border transition ${
              selected === m.id
                ? "border-brand bg-brand/10"
                : "border-border bg-background hover:border-brand/50"
            }`}
          >
            <div className="text-[10px] font-mono text-brand font-bold">{m.year}</div>
            <div className="text-xs font-medium leading-tight">{m.title}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
