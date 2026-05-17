import { useEffect, useRef, useState } from "react";

/**
 * AI-historikk tidslinje (1950 → 2025+). Brukeren drar slideren gjennom 8 epoker.
 * Per epoke: animert SVG-illustrasjon, "hva var hot" + "hva gikk feil" callouts,
 * eksempler. AI-vintrene (1974-80, 1987-93) markert som grå soner under slideren.
 *
 * Pedagogisk mønster (lik OS-historikk-tidslinjen):
 *   - kort header (epoke + årstall + headline)
 *   - slider + epoke-knapper for å hoppe
 *   - illustrasjon (16:9) med metafor for epokens hovedidé
 *   - "Hot" (grønn) + "Gikk feil" (rød) som parallelle kort
 *   - "Hva endret seg fra forrige epoke" som tredje rad
 */

type EraId =
  | "1950s"
  | "1960s"
  | "1970s"
  | "1980s"
  | "1990s"
  | "2000s"
  | "2010s"
  | "2020+";

type Era = {
  id: EraId;
  label: string;
  yearRange: string;
  headline: string;
  hot: string;
  wrong: string;
  diffFromPrev: string | null;
  examples: string[];
};

const ERAS: Era[] = [
  {
    id: "1950s",
    label: "1950-tallet",
    yearRange: "1950 – 1959",
    headline: "Grunnleggerne stiller spørsmålet",
    hot: "Alan Turings 1950-artikkel «Computing Machinery and Intelligence» introduserte Turing-testen — kan en maskin lure oss til å tro den er menneske? Dartmouth-konferansen (1956) myntet uttrykket «artificial intelligence» og samlet feltets fedre: McCarthy, Minsky, Shannon, Rochester. Frank Rosenblatts perceptron (1958) var første lærbare nevrale nettverk.",
    wrong: "Forventningene var skyhøye — Herbert Simon spådde i 1957 at en datamaskin ville bli sjakkverdensmester innen 10 år. Reality check: regnekraft var milligrammer, datasett fantes nesten ikke, og selv enkle resonnementer brøt sammen utenfor leketøys-eksempler.",
    diffFromPrev: null,
    examples: [
      "Turing-test (1950)",
      "Dartmouth Workshop (1956)",
      "Logic Theorist (1956)",
      "Perceptron (1958)",
    ],
  },
  {
    id: "1960s",
    label: "1960-tallet",
    yearRange: "1960 – 1969",
    headline: "Symbolic AI & naturlig språk",
    hot: "Symbolic AI dominerte: regler, logikk, LISP. ELIZA (Weizenbaum, 1966) simulerte en terapeut med tekst-mønstre — folk åpnet seg for et regel-baserte program. SHRDLU (Winograd, 1970) forstod kommandoer i en «blokk-verden». DARPA pøste penger inn i feltet.",
    wrong: "ELIZA forstod ingenting — den speilet bare innspill. Minsky & Papert (1969) beviste matematisk at en enkel perceptron ikke kunne lære XOR. Konklusjonen ble overtolket: «nevrale nett er en blindgate», og finansiering for connectionism tørket inn for tiår.",
    diffFromPrev:
      "Fra filosofisk grunnlag → konkrete kjørbare systemer. Symbolic AI (regler) vant kampen mot connectionism (nettverk) for en stund.",
    examples: ["LISP (1958)", "ELIZA (1966)", "Shakey the Robot (1969)", "Minsky & Papert (1969)"],
  },
  {
    id: "1970s",
    label: "1970-tallet",
    yearRange: "1970 – 1979",
    headline: "Første AI-vinter & expert systems-knopp",
    hot: "Expert systems begynte å gjøre konkret nytte: DENDRAL (kjemi-analyse, 1965+) og MYCIN (medisinsk diagnose, 1972) viste at regelbaserte systemer kunne matche eksperter på smale domener. Kunnskaps-baserte tilnærminger ble feltets hovedfokus.",
    wrong: "Lighthill-rapporten (1973) i Storbritannia konkluderte at AI-løftene var hule og kuttet finansiering. DARPA fulgte etter. Den første AI-vinteren (1974-80) traff hardt: prosjekter ble stengt, forskere skiftet felt. Symbolic AI strev med «common sense» — alt utenfor det smale ekspertdomenet brøt sammen.",
    diffFromPrev:
      "Fra brede løfter om generell intelligens → smale ekspertsystemer som faktisk virket. Men «hype-bobla» sprakk.",
    examples: ["DENDRAL", "MYCIN (1972)", "Lighthill-rapporten (1973)", "PROLOG (1972)"],
  },
  {
    id: "1980s",
    label: "1980-tallet",
    yearRange: "1980 – 1989",
    headline: "Expert systems-bom og backprop-comeback",
    hot: "Expert systems ble en milliardindustri — XCON (Digital Equipment) sparte $40M/år ved å konfigurere VAX-maskiner. Japan lanserte 5th Generation Computer Project ($850M). Rumelhart, Hinton & Williams publiserte backpropagation (1986) — endelig en metode for å trene fler-lag-nettverk. Connectionism revived.",
    wrong: "Mot slutten av tiåret kollapset expert systems-markedet: LISP-maskiner ble utdaterte, vedlikeholdskostnader eksploderte, regler-baser ble for skjøre. Den andre AI-vinteren (1987-93) startet. Backprop fantes, men datamaskinene var for trege og datasettene for små til å vise full kraft.",
    diffFromPrev:
      "Fra forsknings-prosjekt → kommersialisert produkt. Connectionism er tilbake i live etter at backprop løser XOR-problemet Minsky/Papert peket på.",
    examples: ["XCON/R1 (1980)", "Backprop popularisert (1986)", "NETtalk (1987)", "5th Gen (Japan, 1982)"],
  },
  {
    id: "1990s",
    label: "1990-tallet",
    yearRange: "1990 – 1999",
    headline: "Statistisk ML overtar, Deep Blue knuser Kasparov",
    hot: "Statistisk maskinlæring eksploderte: Support Vector Machines (Vapnik & Cortes, 1995), random forests-forløpere, Hidden Markov Models i talegjenkjenning, naive Bayes i spam-filter. LeCuns LeNet (1998) viste at CNN kunne lese postnumre. Deep Blue (IBM) slo verdensmester Garri Kasparov i sjakk (1997) — et symbolsk gjennombrudd.",
    wrong: "Deep Blue var brute-force søk med håndlagde evalueringsregler — ikke «forståelse». Nevrale nett-forskning var fortsatt nisje. AI-merket var fortsatt giftig: forskere kalte feltet «machine learning» eller «pattern recognition» for å unngå skammen fra vintrene.",
    diffFromPrev:
      "Fra «AI = regler» → «AI = lær fra data, med statistikk». SVM og kjerne-metoder dominerte før dyp læring brøt gjennom.",
    examples: ["SVM (1995)", "Deep Blue (1997)", "LSTM (Hochreiter, 1997)", "LeNet-5 (1998)"],
  },
  {
    id: "2000s",
    label: "2000-tallet",
    yearRange: "2000 – 2009",
    headline: "Big data + GPU-er = frø til dyp læring",
    hot: "Internett ga første gang virkelig store datasett. GPU-er (egentlig laget for spill) viste seg å være perfekte for matrise-multiplikasjon — gradient descent på nevrale nett ble plutselig praktisk. Hinton publiserte «deep belief networks» (2006) som starten på rebranding fra «nevrale nett» til «deep learning». ImageNet-datasettet ble samlet av Fei-Fei Li (2009) — 14M merkede bilder.",
    wrong: "Industriell adopsjon var fortsatt treg — de fleste praktiske systemer brukte SVM, random forests, eller logistisk regresjon. Dyp læring var lovende men ikke ennå overlegen på benchmark-tester. NLP var dominert av n-grammer og håndlagde features.",
    diffFromPrev:
      "Fra «vi mangler data og regnekraft» → «vi har begge deler nå». Frøene til DL-revolusjonen lå klare, men ventet på riktig demonstrasjon.",
    examples: ["NVIDIA CUDA (2006)", "Deep Belief Nets (Hinton, 2006)", "ImageNet (2009)", "Netflix Prize (2009)"],
  },
  {
    id: "2010s",
    label: "2010-tallet",
    yearRange: "2010 – 2019",
    headline: "Deep learning sprenger ALLE benchmarks",
    hot: "AlexNet (Krizhevsky, Sutskever, Hinton 2012) knuste ImageNet med 15% feilrate vs. forrige beste 26% — CNN-revolusjonen var bekreftet. Word2Vec (Mikolov, 2013), GANs (Goodfellow, 2014), AlphaGo slo verdensmester Lee Sedol i Go (2016). Det historiske gjennombruddet kom 2017: «Attention is all you need» introduserte Transformer-arkitekturen. BERT (Google, 2018) og GPT-2 (OpenAI, 2019) viste at språkmodeller kunne skalere voldsomt.",
    wrong: "Tolkbarhet og bias ble bekymringer på allvor: COMPAS-risikoalgoritmen (2016) viste rase-bias i USAs rettssystem. Gender Shades-studien (Buolamwini, 2018) avslørte 35% feilrate på mørke kvinner i ansiktsgjenkjenning. «Adversarial examples» viste at små perturbasjoner kunne lure CNN. AI-hypen kom tilbake — men også debattene om regulering.",
    diffFromPrev:
      "Fra «dyp læring kan kanskje funke» → «dyp læring slår alt». Fra hardkodet features → end-to-end-trening. Transformer-arkitekturen erstattet RNN/LSTM i NLP.",
    examples: ["AlexNet (2012)", "Word2Vec (2013)", "AlphaGo (2016)", "Transformer (2017)", "GPT-2 (2019)"],
  },
  {
    id: "2020+",
    label: "2020-tallet til i dag",
    yearRange: "2020 – nå",
    headline: "Generativ AI eksploderer i hverdagen",
    hot: "GPT-3 (2020, 175B parametre) viste «in-context learning» — modellen lærte oppgaver fra et par eksempler i prompten. ChatGPT (november 2022) nådde 100M brukere på to måneder — raskeste produkt-vekst i historien. GPT-4 (2023) ble multimodal (tekst + bilde). Diffusjons-modeller (Stable Diffusion 2022) gjorde bilde-generering tilgjengelig. Open-source modeller (Llama, Mistral) demokratiserte feltet.",
    wrong: "«Hallusinasjoner» — modeller finner på selvsikre løgner. Treningsdata-spørsmål (NYT vs. OpenAI), CO2-fotavtrykk, jobbtap i kreative bransjer, deepfakes i valg. EU AI Act vedtatt 2024 — verdens første omfattende AI-lov. Debatt om vi er midt i en ny boble: investorer pumper hundre milliarder dollar inn, men brukbarhet i bedrifter er fortsatt vanskelig å måle.",
    diffFromPrev:
      "Fra «AI hjelper eksperter» → «AI er konsumprodukt». Fra ren prediksjon → generativ (skape tekst, bilde, kode, lyd). Fra forskning → samfunnsdebatt.",
    examples: ["GPT-3 (2020)", "AlphaFold 2 (2020)", "ChatGPT (2022)", "Stable Diffusion (2022)", "GPT-4 (2023)", "EU AI Act (2024)"],
  },
];

// ============== ILLUSTRATIONS ==============

function IllustrationFor({ era }: { era: EraId }) {
  switch (era) {
    case "1950s":
      return <Era1950 />;
    case "1960s":
      return <Era1960 />;
    case "1970s":
      return <Era1970 />;
    case "1980s":
      return <Era1980 />;
    case "1990s":
      return <Era1990 />;
    case "2000s":
      return <Era2000 />;
    case "2010s":
      return <Era2010 />;
    case "2020+":
      return <Era2020 />;
  }
}

// 1950s — Turing-test: skjult dommer + to "respondenter"
function Era1950() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setTick((t) => t + 1), 500);
    return () => clearInterval(i);
  }, []);
  const speakerActive = tick % 2;
  return (
    <svg viewBox="0 0 360 200" className="w-full h-full">
      {/* Dommer */}
      <rect x={20} y={70} width={70} height={70} rx={6} className="fill-zinc-200 dark:fill-zinc-700" />
      <circle cx={55} cy={90} r={10} className="fill-amber-400" />
      <text x={55} y={130} textAnchor="middle" className="fill-current text-[9px] font-bold text-zinc-700 dark:text-zinc-200" fontFamily="monospace">
        DOMMER
      </text>
      {/* Vegg */}
      <line x1={120} y1={20} x2={120} y2={180} stroke="currentColor" strokeWidth={2} className="text-zinc-400" strokeDasharray="4 3" />
      <text x={120} y={15} textAnchor="middle" className="fill-current text-[8px] text-zinc-500" fontFamily="monospace">
        ?
      </text>
      {/* Menneske */}
      <rect x={160} y={30} width={70} height={50} rx={6} className={speakerActive === 0 ? "fill-emerald-400" : "fill-zinc-300 dark:fill-zinc-700"} />
      <text x={195} y={55} textAnchor="middle" className="fill-zinc-900 text-[9px] font-bold" fontFamily="monospace">
        MENNESKE
      </text>
      {/* Maskin */}
      <rect x={160} y={120} width={70} height={50} rx={6} className={speakerActive === 1 ? "fill-sky-400" : "fill-zinc-300 dark:fill-zinc-700"} />
      <text x={195} y={145} textAnchor="middle" className="fill-zinc-900 text-[9px] font-bold" fontFamily="monospace">
        MASKIN
      </text>
      {/* Meldinger */}
      <line x1={90} y1={100} x2={160} y2={55} stroke={speakerActive === 0 ? "#10b981" : "transparent"} strokeWidth={1.5} />
      <line x1={90} y1={110} x2={160} y2={145} stroke={speakerActive === 1 ? "#0ea5e9" : "transparent"} strokeWidth={1.5} />
      {/* Spørsmål */}
      <rect x={260} y={80} width={90} height={50} rx={4} className="fill-zinc-200 dark:fill-zinc-800" />
      <text x={305} y={97} textAnchor="middle" className="fill-current text-[8px] text-zinc-700 dark:text-zinc-300" fontFamily="monospace">
        Hvem av disse
      </text>
      <text x={305} y={108} textAnchor="middle" className="fill-current text-[8px] text-zinc-700 dark:text-zinc-300" fontFamily="monospace">
        er menneske?
      </text>
      <text x={305} y={122} textAnchor="middle" className="fill-current text-[9px] font-bold text-amber-600" fontFamily="monospace">
        Turing 1950
      </text>
      <text x={180} y={195} textAnchor="middle" className="fill-current text-[10px] text-zinc-500" fontFamily="monospace">
        Operasjonell definisjon av «tenkende» maskin
      </text>
    </svg>
  );
}

// 1960s — Perceptron: input → vekter → sum → output
function Era1960() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setTick((t) => t + 1), 600);
    return () => clearInterval(i);
  }, []);
  const fire = tick % 3 === 0;
  return (
    <svg viewBox="0 0 360 200" className="w-full h-full">
      <text x="180" y={15} textAnchor="middle" className="fill-current text-[10px] text-zinc-500" fontFamily="monospace">
        Perceptron: y = step(Σ wᵢxᵢ - θ)
      </text>
      {/* Inputs */}
      {[0, 1, 2].map((i) => {
        const cy = 60 + i * 40;
        return (
          <g key={i}>
            <circle cx={50} cy={cy} r={14} className="fill-sky-400" />
            <text x={50} y={cy + 3} textAnchor="middle" className="fill-zinc-900 text-[10px] font-bold" fontFamily="monospace">
              x{i + 1}
            </text>
            {/* vekt-label */}
            <text x={110} y={cy + (i === 1 ? -3 : 3)} textAnchor="middle" className="fill-current text-[9px] text-zinc-500" fontFamily="monospace">
              w{i + 1}
            </text>
            {/* Linje */}
            <line x1={64} y1={cy} x2={180} y2={120} stroke={fire ? "#10b981" : "#64748b"} strokeWidth={1.5} />
          </g>
        );
      })}
      {/* Sum-node */}
      <circle cx={190} cy={120} r={22} className={fire ? "fill-emerald-500" : "fill-zinc-500"} />
      <text x={190} y={117} textAnchor="middle" className="fill-zinc-100 text-[12px] font-bold" fontFamily="monospace">
        Σ
      </text>
      <text x={190} y={128} textAnchor="middle" className="fill-zinc-100 text-[8px]" fontFamily="monospace">
        - θ
      </text>
      {/* Output */}
      <line x1={212} y1={120} x2={280} y2={120} stroke={fire ? "#10b981" : "#64748b"} strokeWidth={1.5} />
      <rect x={280} y={108} width={50} height={24} rx={3} className={fire ? "fill-amber-400" : "fill-zinc-400"} />
      <text x={305} y={124} textAnchor="middle" className="fill-zinc-900 text-[11px] font-bold" fontFamily="monospace">
        {fire ? "1" : "0"}
      </text>
      <text x={180} y={195} textAnchor="middle" className="fill-current text-[10px] text-zinc-500" fontFamily="monospace">
        Rosenblatt 1958 — kan ikke lære XOR (Minsky 1969)
      </text>
    </svg>
  );
}

// 1970s — Expert system: regler → faktum → konklusjon
function Era1970() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setTick((t) => t + 1), 1100);
    return () => clearInterval(i);
  }, []);
  const step = tick % 3;
  return (
    <svg viewBox="0 0 360 200" className="w-full h-full">
      <text x="60" y={20} textAnchor="middle" className="fill-current text-[10px] text-zinc-500" fontFamily="monospace">
        Regelbase
      </text>
      <text x="200" y={20} textAnchor="middle" className="fill-current text-[10px] text-zinc-500" fontFamily="monospace">
        Inference engine
      </text>
      <text x="320" y={20} textAnchor="middle" className="fill-current text-[10px] text-zinc-500" fontFamily="monospace">
        Diagnose
      </text>
      {/* Regler */}
      <rect x={10} y={30} width={110} height={140} rx={4} className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-400" strokeWidth={1} />
      {[
        "IF feber AND",
        "  utslett",
        "THEN meslinger",
        "",
        "IF hoste AND",
        "  feber",
        "THEN flu",
        "",
        "IF utslett AND",
        "  kløe",
        "THEN allergi",
      ].map((line, i) => {
        const highlight = step === 0 && (i === 0 || i === 1 || i === 2);
        return (
          <text key={i} x={15} y={45 + i * 11} className={`fill-current text-[8px] ${highlight ? "font-bold text-emerald-600" : "text-zinc-700 dark:text-zinc-300"}`} fontFamily="monospace">
            {line}
          </text>
        );
      })}
      {/* Inference */}
      <rect x={140} y={70} width={120} height={60} rx={4} className={step >= 1 ? "fill-amber-300" : "fill-zinc-300 dark:fill-zinc-700"} />
      <text x={200} y={95} textAnchor="middle" className="fill-zinc-900 text-[10px] font-bold" fontFamily="monospace">
        MATCH
      </text>
      <text x={200} y={110} textAnchor="middle" className="fill-zinc-900 text-[9px]" fontFamily="monospace">
        feber ✓ utslett ✓
      </text>
      {/* Output */}
      <rect x={275} y={80} width={80} height={40} rx={4} className={step === 2 ? "fill-rose-400" : "fill-zinc-300 dark:fill-zinc-700"} />
      <text x={315} y={100} textAnchor="middle" className="fill-zinc-900 text-[10px] font-bold" fontFamily="monospace">
        meslinger
      </text>
      <text x={315} y={113} textAnchor="middle" className="fill-zinc-900 text-[8px]" fontFamily="monospace">
        p=0.87
      </text>
      <text x={180} y={195} textAnchor="middle" className="fill-current text-[10px] text-zinc-500" fontFamily="monospace">
        MYCIN-stil: regler + fakta = diagnose
      </text>
    </svg>
  );
}

// 1980s — backprop: feil flyter bakover gjennom nett
function Era1980() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setTick((t) => t + 1), 800);
    return () => clearInterval(i);
  }, []);
  const forward = tick % 2 === 0;
  const layers = [3, 4, 3, 2];
  const xs = [50, 130, 230, 310];
  return (
    <svg viewBox="0 0 360 200" className="w-full h-full">
      <text x="180" y={15} textAnchor="middle" className="fill-current text-[10px] text-zinc-500" fontFamily="monospace">
        Backpropagation (Rumelhart, Hinton, Williams 1986)
      </text>
      {layers.map((count, l) => {
        const ys = Array.from({ length: count }, (_, i) => 50 + i * 32 + (4 - count) * 16);
        return ys.map((y, i) => (
          <circle
            key={`${l}-${i}`}
            cx={xs[l]}
            cy={y}
            r={9}
            className={l === 0 ? "fill-sky-400" : l === layers.length - 1 ? "fill-rose-400" : "fill-zinc-400"}
          />
        ));
      })}
      {/* kanter */}
      {layers.slice(0, -1).map((count, l) => {
        const nextCount = layers[l + 1];
        const ys1 = Array.from({ length: count }, (_, i) => 50 + i * 32 + (4 - count) * 16);
        const ys2 = Array.from({ length: nextCount }, (_, i) => 50 + i * 32 + (4 - nextCount) * 16);
        const elements: React.ReactElement[] = [];
        ys1.forEach((y1, i) => {
          ys2.forEach((y2, j) => {
            elements.push(
              <line
                key={`e-${l}-${i}-${j}`}
                x1={xs[l] + 9}
                y1={y1}
                x2={xs[l + 1] - 9}
                y2={y2}
                stroke={forward ? "#0ea5e9" : "#ef4444"}
                strokeWidth={0.5}
                opacity={0.6}
              />,
            );
          });
        });
        return elements;
      })}
      {/* Retning-pil */}
      <text x={180} y={180} textAnchor="middle" className="fill-current text-[9px] font-bold" fontFamily="monospace" fill={forward ? "#0ea5e9" : "#ef4444"}>
        {forward ? "→ FORWARD: prediksjon" : "← BACKWARD: feilen propagerer"}
      </text>
    </svg>
  );
}

// 1990s — sjakkbrett + Deep Blue
function Era1990() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setTick((t) => t + 1), 600);
    return () => clearInterval(i);
  }, []);
  const move = tick % 4;
  return (
    <svg viewBox="0 0 360 200" className="w-full h-full">
      <text x="180" y={15} textAnchor="middle" className="fill-current text-[10px] text-zinc-500" fontFamily="monospace">
        Deep Blue vs Kasparov (1997) — 200M posisjoner/sek
      </text>
      {/* sjakkbrett */}
      {Array.from({ length: 8 }).map((_, r) =>
        Array.from({ length: 8 }).map((_, c) => (
          <rect
            key={`${r}-${c}`}
            x={110 + c * 16}
            y={30 + r * 16}
            width={16}
            height={16}
            className={(r + c) % 2 === 0 ? "fill-amber-100" : "fill-amber-700"}
          />
        )),
      )}
      {/* brikker enkle */}
      {[
        { x: 2, y: 0, color: "#0f172a" },
        { x: 4, y: 3, color: "#0f172a" },
        { x: 5, y: 5, color: "#f8fafc" },
        { x: 3, y: 7, color: "#f8fafc" },
      ].map((p, i) => (
        <circle key={i} cx={110 + p.x * 16 + 8} cy={30 + p.y * 16 + 8} r={5} fill={p.color} stroke="#334155" />
      ))}
      {/* aktuelt trekk-highlight */}
      <rect x={110 + (move % 8) * 16} y={30 + (move * 2) * 16} width={16} height={16} className="fill-emerald-400 opacity-50" />
      {/* "search tree"-indikasjon til høyre */}
      <text x={310} y={50} textAnchor="middle" className="fill-current text-[10px] font-bold text-zinc-700 dark:text-zinc-300" fontFamily="monospace">
        Søk
      </text>
      {[0, 1, 2, 3].map((d) => (
        <g key={d}>
          <line x1={300} y1={60 + d * 25} x2={320} y2={75 + d * 25} stroke="#64748b" />
          <line x1={300} y1={60 + d * 25} x2={280} y2={75 + d * 25} stroke="#64748b" />
          <circle cx={300} cy={60 + d * 25} r={3} className={d <= move ? "fill-amber-500" : "fill-zinc-500"} />
        </g>
      ))}
      <text x={310} y={170} textAnchor="middle" className="fill-current text-[8px] text-zinc-500" fontFamily="monospace">
        dybde-12 minimax
      </text>
      <text x={50} y={100} textAnchor="middle" className="fill-current text-[10px] font-bold text-emerald-600" fontFamily="monospace">
        DEEP
      </text>
      <text x={50} y={115} textAnchor="middle" className="fill-current text-[10px] font-bold text-emerald-600" fontFamily="monospace">
        BLUE
      </text>
      <text x={50} y={135} textAnchor="middle" className="fill-current text-[8px] text-zinc-500" fontFamily="monospace">
        brute force +
      </text>
      <text x={50} y={146} textAnchor="middle" className="fill-current text-[8px] text-zinc-500" fontFamily="monospace">
        håndlagde regler
      </text>
      <text x={180} y={195} textAnchor="middle" className="fill-current text-[10px] text-zinc-500" fontFamily="monospace">
        Symbolsk seier — men ingen «forståelse» av sjakk
      </text>
    </svg>
  );
}

// 2000s — store datasett + GPU farm
function Era2000() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setTick((t) => t + 1), 400);
    return () => clearInterval(i);
  }, []);
  return (
    <svg viewBox="0 0 360 200" className="w-full h-full">
      <text x="180" y={15} textAnchor="middle" className="fill-current text-[10px] text-zinc-500" fontFamily="monospace">
        Big data + GPU = frø til DL-revolusjon
      </text>
      {/* "Internett" sky med data */}
      <ellipse cx={70} cy={90} rx={55} ry={35} className="fill-zinc-200 dark:fill-zinc-800" />
      <text x={70} y={85} textAnchor="middle" className="fill-current text-[10px] font-bold text-zinc-700 dark:text-zinc-200" fontFamily="monospace">
        INTERNET
      </text>
      <text x={70} y={100} textAnchor="middle" className="fill-current text-[9px] text-zinc-500" fontFamily="monospace">
        14M bilder
      </text>
      <text x={70} y={112} textAnchor="middle" className="fill-current text-[9px] text-zinc-500" fontFamily="monospace">
        ImageNet
      </text>
      {/* data-pakker som flyter */}
      {Array.from({ length: 4 }).map((_, i) => {
        const x = 130 + ((tick * 3 + i * 30) % 120);
        return (
          <rect key={i} x={x} y={86 - i * 5} width={10} height={8} className="fill-amber-400" />
        );
      })}
      {/* GPU-farm */}
      <rect x={250} y={50} width={100} height={120} rx={4} className="fill-zinc-700" />
      <text x={300} y={67} textAnchor="middle" className="fill-zinc-100 text-[10px] font-bold" fontFamily="monospace">
        GPU-FARM
      </text>
      {Array.from({ length: 12 }).map((_, i) => {
        const r = Math.floor(i / 4);
        const c = i % 4;
        const on = (tick + i * 3) % 6 < 4;
        return (
          <rect
            key={i}
            x={260 + c * 22}
            y={80 + r * 26}
            width={18}
            height={22}
            rx={2}
            className={on ? "fill-green-400" : "fill-zinc-500"}
          />
        );
      })}
      <text x={300} y={165} textAnchor="middle" className="fill-zinc-100 text-[8px]" fontFamily="monospace">
        CUDA: matmul parallelt
      </text>
      <text x={180} y={195} textAnchor="middle" className="fill-current text-[10px] text-zinc-500" fontFamily="monospace">
        Hinton 2006: «deep belief nets» — rebranding fra NN → DL
      </text>
    </svg>
  );
}

// 2010s — ImageNet-skog / convolutions blir til klasser
function Era2010() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setTick((t) => t + 1), 500);
    return () => clearInterval(i);
  }, []);
  const classes = ["katt", "hund", "bil", "fugl", "blomst"];
  const active = tick % classes.length;
  return (
    <svg viewBox="0 0 360 200" className="w-full h-full">
      <text x="180" y={15} textAnchor="middle" className="fill-current text-[10px] text-zinc-500" fontFamily="monospace">
        AlexNet (2012) vinner ImageNet — CNN-revolusjonen
      </text>
      {/* Bilde */}
      <rect x={20} y={50} width={70} height={70} className="fill-emerald-200 dark:fill-emerald-900" />
      {/* faux-bilde med pixler */}
      {Array.from({ length: 49 }).map((_, i) => {
        const r = Math.floor(i / 7);
        const c = i % 7;
        const v = ((tick * 13 + i * 7) % 100) / 100;
        return (
          <rect
            key={i}
            x={20 + c * 10}
            y={50 + r * 10}
            width={10}
            height={10}
            fill={`hsl(${(v * 360) | 0}, 50%, 50%)`}
            opacity={0.5}
          />
        );
      })}
      <text x={55} y={135} textAnchor="middle" className="fill-current text-[9px] text-zinc-500" fontFamily="monospace">
        input
      </text>
      {/* Conv-lag som blokker */}
      {[0, 1, 2, 3].map((l) => {
        const w = 40 - l * 6;
        const h = 60 - l * 8;
        return (
          <g key={l}>
            <rect x={110 + l * 35} y={70 + l * 4} width={w} height={h} rx={2} className="fill-sky-400 dark:fill-sky-700" opacity={0.7} />
            <text x={110 + l * 35 + w / 2} y={140 + l * 4} textAnchor="middle" className="fill-current text-[8px] text-zinc-500" fontFamily="monospace">
              C{l + 1}
            </text>
          </g>
        );
      })}
      {/* Softmax-output */}
      <text x={305} y={45} textAnchor="middle" className="fill-current text-[9px] text-zinc-500" fontFamily="monospace">
        softmax
      </text>
      {classes.map((c, i) => {
        const isActive = i === active;
        const w = isActive ? 60 : 20;
        return (
          <g key={c}>
            <rect x={280} y={55 + i * 22} width={w} height={16} rx={2} className={isActive ? "fill-amber-400" : "fill-zinc-400"} />
            <text x={285} y={67 + i * 22} className="fill-zinc-900 text-[9px] font-bold" fontFamily="monospace">
              {c}
            </text>
          </g>
        );
      })}
      <text x={180} y={190} textAnchor="middle" className="fill-current text-[10px] text-zinc-500" fontFamily="monospace">
        Transformer 2017 → BERT 2018 → GPT-2 2019
      </text>
    </svg>
  );
}

// 2020+ — transformer attention-matrise
function Era2020() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setTick((t) => t + 1), 400);
    return () => clearInterval(i);
  }, []);
  const tokens = ["The", "cat", "sat", "on", "the", "mat"];
  return (
    <svg viewBox="0 0 360 200" className="w-full h-full">
      <text x="180" y={15} textAnchor="middle" className="fill-current text-[10px] text-zinc-500" fontFamily="monospace">
        Self-attention — hver token ser hver token
      </text>
      {/* tokens øverst */}
      {tokens.map((t, i) => (
        <g key={`top-${i}`}>
          <rect x={70 + i * 35} y={30} width={30} height={20} rx={3} className="fill-sky-400" />
          <text x={85 + i * 35} y={44} textAnchor="middle" className="fill-zinc-900 text-[9px] font-bold" fontFamily="monospace">
            {t}
          </text>
        </g>
      ))}
      {/* attention-matrise */}
      {tokens.map((_, r) =>
        tokens.map((_, c) => {
          const v = (((r * 7 + c * 11 + tick * 3) % 100) / 100);
          const isMax = ((r + tick) % tokens.length) === c;
          return (
            <rect
              key={`${r}-${c}`}
              x={70 + c * 35}
              y={70 + r * 18}
              width={32}
              height={16}
              fill={isMax ? "#f59e0b" : `rgba(14,165,233,${0.2 + v * 0.6})`}
            />
          );
        }),
      )}
      {/* rad-labels */}
      {tokens.map((t, i) => (
        <text key={`lab-${i}`} x={55} y={82 + i * 18} textAnchor="end" className="fill-current text-[8px] text-zinc-500" fontFamily="monospace">
          {t}
        </text>
      ))}
      <text x={180} y={195} textAnchor="middle" className="fill-current text-[10px] text-zinc-500" fontFamily="monospace">
        «Attention is all you need» (Vaswani 2017) → GPT-4 (2023)
      </text>
    </svg>
  );
}

// AI-vintre — grafisk markering under slider
const WINTERS = [
  { start: 1974, end: 1980, label: "Vinter 1" },
  { start: 1987, end: 1993, label: "Vinter 2" },
];

// ============== HOVED-KOMPONENT ==============

export function AiTimelineScrubber() {
  const [idx, setIdx] = useState(0);
  const era = ERAS[idx];
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!ref.current) return;
      if (document.activeElement !== ref.current) return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        setIdx((i) => Math.min(ERAS.length - 1, i + 1));
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        setIdx((i) => Math.max(0, i - 1));
      } else if (e.key === "Home") {
        e.preventDefault();
        setIdx(0);
      } else if (e.key === "End") {
        e.preventDefault();
        setIdx(ERAS.length - 1);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div
      ref={ref}
      tabIndex={0}
      className="rounded-xl border border-border bg-card p-5 focus:outline-none focus:ring-2 focus:ring-brand/40"
    >
      <div className="flex items-baseline justify-between mb-2">
        <div>
          <div className="text-xs uppercase tracking-wider text-brand font-semibold">
            {era.label} ({era.yearRange})
          </div>
          <h3 className="text-lg font-semibold mt-0.5">{era.headline}</h3>
        </div>
        <div className="text-[10px] text-muted-foreground font-mono hidden sm:block">
          ← → for å bytte epoke
        </div>
      </div>

      {/* Slider */}
      <div className="mb-2">
        <input
          type="range"
          min={0}
          max={ERAS.length - 1}
          step={1}
          value={idx}
          onChange={(e) => setIdx(parseInt(e.target.value, 10))}
          className="w-full accent-[var(--brand,#3b82f6)] cursor-pointer"
          aria-label="Velg epoke"
        />
        <div className="mt-1 flex justify-between text-[10px] font-mono text-muted-foreground">
          {ERAS.map((e, i) => (
            <button
              key={e.id}
              type="button"
              onClick={() => setIdx(i)}
              className={`px-1 py-0.5 rounded hover:text-brand transition ${i === idx ? "text-brand font-bold" : ""}`}
            >
              {e.label.replace("-tallet", "s").replace(" til i dag", "")}
            </button>
          ))}
        </div>
      </div>

      {/* AI-vinter linje */}
      <div className="mb-4 relative h-5">
        <div className="absolute inset-0 rounded-full bg-zinc-100 dark:bg-zinc-800" />
        {WINTERS.map((w) => {
          // mapping 1950 → 2025 til 0-100%
          const start = ((w.start - 1950) / (2025 - 1950)) * 100;
          const end = ((w.end - 1950) / (2025 - 1950)) * 100;
          return (
            <div
              key={w.label}
              className="absolute top-0 bottom-0 bg-zinc-400/60 dark:bg-zinc-600/60 flex items-center justify-center"
              style={{ left: `${start}%`, width: `${end - start}%` }}
            >
              <span className="text-[8px] font-mono text-zinc-900 dark:text-zinc-100 whitespace-nowrap px-1">
                ❄ {w.label} ({w.start}-{w.end})
              </span>
            </div>
          );
        })}
        {/* dagens posisjon-markør */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-brand"
          style={{
            left: `${((parseInt(era.yearRange.split(" – ")[0], 10) - 1950) / (2025 - 1950)) * 100}%`,
          }}
        />
      </div>

      {/* Illustrasjon */}
      <div className="aspect-[16/9] rounded-lg border border-border bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950 overflow-hidden mb-4">
        <IllustrationFor era={era.id} />
      </div>

      {/* Hot + Wrong */}
      <div className="grid sm:grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg border border-emerald-300/40 bg-emerald-50 dark:bg-emerald-950/30 p-3">
          <div className="text-[10px] uppercase tracking-wider text-emerald-600 font-semibold mb-1 flex items-center gap-1">
            <span>🔥</span> Hva var hot?
          </div>
          <p className="text-foreground/90 leading-relaxed">{era.hot}</p>
        </div>
        <div className="rounded-lg border border-rose-300/40 bg-rose-50 dark:bg-rose-950/30 p-3">
          <div className="text-[10px] uppercase tracking-wider text-rose-600 font-semibold mb-1 flex items-center gap-1">
            <span>⚠</span> Hva gikk feil?
          </div>
          <p className="text-foreground/90 leading-relaxed">{era.wrong}</p>
        </div>
      </div>

      {era.diffFromPrev && (
        <div className="mt-3 rounded-lg border border-brand/30 bg-brand/5 p-3 text-sm">
          <div className="text-[10px] uppercase tracking-wider text-brand font-semibold mb-1">
            Hva endret seg fra forrige epoke?
          </div>
          <p className="text-foreground/90 leading-relaxed">{era.diffFromPrev}</p>
        </div>
      )}

      <div className="mt-3 text-xs text-muted-foreground">
        <span className="font-semibold text-foreground">Milepæler:</span>{" "}
        {era.examples.join(" · ")}
      </div>
    </div>
  );
}
