import { useMemo, useState } from "react";

/**
 * AI-vintrene: diskuter hva som forårsaket dem og om vi er i en ny boble.
 *
 * Interaktivt:
 *   - Velg en av de to historiske vintrene → se forventning/leveranse-grafen
 *   - "Hype-syklus"-modell: hype → disappointment → recovery → realism
 *   - Spørsmål om dagens situasjon: er vi på topp av Gartner-hype-syklus?
 *   - Bruker kan velge "hypotese" om dagens situasjon og se argumenter for/mot
 */

type WinterId = "first" | "second" | "now";

type Winter = {
  id: WinterId;
  era: string;
  title: string;
  causes: { label: string; detail: string }[];
  metrics: { label: string; expected: number; delivered: number; unit: string }[];
  lesson: string;
};

const WINTERS: Winter[] = [
  {
    id: "first",
    era: "1974 – 1980",
    title: "Første AI-vinter",
    causes: [
      {
        label: "Minsky & Papert (1969)",
        detail:
          "Boka «Perceptrons» beviste matematisk at single-layer perceptron ikke kan lære XOR. Konklusjonen ble overtolket til at alle nevrale nett var dødfødte.",
      },
      {
        label: "Lighthill-rapporten (1973)",
        detail:
          "Sir James Lighthill konkluderte for UK Science Research Council at AI hadde sviktet på alle felter utenfor leketøys-eksempler. Britisk AI-finansiering kollapset.",
      },
      {
        label: "DARPA-kutt (1974)",
        detail:
          "USAs DARPA, som hadde finansiert mesteparten av AI-forskning, mistet tålmodighet med løftene om talegjenkjenning og strategi-systemer. Mange labs ble stengt.",
      },
      {
        label: "Common sense-problem",
        detail:
          "Symbolic AI strevde med implisitt kunnskap — alt mennesker «bare vet». Forsøk på å kode dette manuelt (senere CYC, 1984) viste seg umulig store.",
      },
    ],
    metrics: [
      { label: "Maskin-oversettelse", expected: 90, delivered: 30, unit: "% kvalitet" },
      { label: "Generell talegjenkjenning", expected: 85, delivered: 20, unit: "% korrekt" },
      { label: "Common sense reasoning", expected: 70, delivered: 5, unit: "% dekning" },
    ],
    lesson:
      "Lekkasje fra demo til produksjon var katastrofal. Det som funket på 10 setninger eller 10 spørsmål brøt ned fullstendig ved 1000. Hypen ble drevet av imponerende, men nøye plukkede, demoer.",
  },
  {
    id: "second",
    era: "1987 – 1993",
    title: "Andre AI-vinter",
    causes: [
      {
        label: "LISP-maskiner ble utdaterte",
        detail:
          "Spesialdesignet LISP-hardware (Symbolics, LMI) var stjernen i expert systems-boomet. Men generelle workstations (Sun) ble raskt billigere og kraftigere. Hele maskinvare-industrien forsvant.",
      },
      {
        label: "Expert systems brakk",
        detail:
          "Regler var skjøre — små endringer i domenet krevde stor omskriving. Kunnskaps-acquisition fra eksperter var dyrt. XCON, fyrtårnet i industri-AI, ble for komplekst å vedlikeholde.",
      },
      {
        label: "Japan 5th Gen mislyktes",
        detail:
          "Japan investerte $850M i 5th Generation Computer Project (1982-92) basert på PROLOG og massiv parallellisme. Resultatet ble lite — verdens AI-industri fulgte ikke etter.",
      },
      {
        label: "Backprop trengte mer enn det hadde",
        detail:
          "Rumelhart/Hinton/Williams 1986 hadde formelen, men datasettene var små og datamaskinene trege. Måtte vente 25 år (på GPU + ImageNet) før dyp læring brøt gjennom for alvor.",
      },
    ],
    metrics: [
      { label: "Expert systems-marked", expected: 100, delivered: 25, unit: "$ B" },
      { label: "Nye applikasjoner / år", expected: 50, delivered: 8, unit: "viktige" },
      { label: "Industri-omfavnelse", expected: 75, delivered: 15, unit: "% selskaper" },
    ],
    lesson:
      "«Brittleness» — regelsystemer som virker for kjent input feiler katastrofalt utenfor distribusjon. Vedlikeholdskostnaden vokste raskere enn verdien. Same teknologi-fundament løste ikke samme problem ved skala.",
  },
  {
    id: "now",
    era: "2024 – ?",
    title: "Tredje vinter? Eller varig DL-bølge?",
    causes: [
      {
        label: "Hallusinasjoner — er det fundamentalt?",
        detail:
          "LLM-er finner på selvsikre løgner. Noen forskere mener dette er en grunnleggende begrensning ved next-token-prediction; andre mener bedre trening + tool use fikser det. Avgjør om LLMs trygt kan brukes i kritiske domener.",
      },
      {
        label: "Skalerings-lover flater ut?",
        detail:
          "GPT-3 → GPT-4 var et stort sprang. GPT-4 → GPT-4o / Claude 3.5 har gitt mindre dramatiske forbedringer per dollar. Hvis vi treffer en kostnads-mur, kan investorer trekke seg ut.",
      },
      {
        label: "Energi & data-grenser",
        detail:
          "Treningskostnaden av frontier-modeller stiger eksponentielt. Internett-data er nesten oppbrukt; syntetisk data har egne problemer. Strømforbruket per query er et tema.",
      },
      {
        label: "Bedrifts-ROI uklart",
        detail:
          "Investeringer har gått langt foran beviste produktivitetsgevinster. Mange selskaper investerer milliarder uten klar bunnlinje-effekt. McKinsey/Goldman-rapporter er nå mer forsiktige enn for 2 år siden.",
      },
      {
        label: "Regulering & juss",
        detail:
          "EU AI Act trådte i kraft 2024. NYT vs OpenAI om opphavsrett. Mulige forbud mot trening på beskyttet innhold kan endre økonomien dramatisk.",
      },
    ],
    metrics: [
      { label: "Forventet revenue 2030 (estimat)", expected: 100, delivered: 35, unit: "$ B" },
      { label: "Praktisk LLM-pålitelighet", expected: 95, delivered: 75, unit: "% korrekt" },
      { label: "Bedrifters AI-ROI (rapportert)", expected: 80, delivered: 30, unit: "%" },
    ],
    lesson:
      "Det er for tidlig å si. Argumenter både for «varig» (åpenbar nytte i kode, oversetting, søk) og «boble» (urealistiske AGI-løfter, manglende ROI). Men leksjonen fra vinter 1 og 2 er at AI-vintre kommer når demo-impressivitet ikke matcher produksjons-pålitelighet.",
  },
];

const HYPE_CYCLE = [
  { phase: "Trigger", y: 30, label: "Teknologi-gjennombrudd" },
  { phase: "Peak", y: 95, label: "Toppen av forventningene" },
  { phase: "Trough", y: 15, label: "Avgrunnen av desillusjonering" },
  { phase: "Slope", y: 50, label: "Opplysningens skråning" },
  { phase: "Plateau", y: 70, label: "Produktivitetsplatået" },
];

export function WinterPredictionDemo() {
  const [selected, setSelected] = useState<WinterId>("first");
  const w = WINTERS.find((x) => x.id === selected) ?? WINTERS[0];

  // Brukerens vurdering av dagens posisjon på Gartner-syklusen
  const [position, setPosition] = useState(70); // 0-100 langs x

  const userPhase = useMemo(() => {
    if (position < 15) return HYPE_CYCLE[0];
    if (position < 35) return HYPE_CYCLE[1];
    if (position < 55) return HYPE_CYCLE[2];
    if (position < 75) return HYPE_CYCLE[3];
    return HYPE_CYCLE[4];
  }, [position]);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-lg font-semibold mb-1">
        AI-vintrene — og er vi i en ny boble?
      </h3>
      <p className="text-xs text-muted-foreground mb-4">
        Velg en vinter for å se hva som forårsaket den. Eksperimenter til slutt
        med din egen vurdering: hvor er vi nå på Gartner-hype-syklusen?
      </p>

      {/* Velg vinter */}
      <div className="flex flex-wrap gap-2 mb-4">
        {WINTERS.map((winter) => (
          <button
            key={winter.id}
            type="button"
            onClick={() => setSelected(winter.id)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium border transition ${
              selected === winter.id
                ? "bg-brand text-white border-transparent"
                : "bg-card border-border hover:border-brand/50"
            }`}
          >
            {winter.title} <span className="opacity-70 ml-1">({winter.era})</span>
          </button>
        ))}
      </div>

      {/* Forventet vs levert */}
      <div className="rounded-lg border border-border bg-background p-4 mb-4">
        <div className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-3">
          Forventning vs. faktisk levering
        </div>
        <div className="space-y-3">
          {w.metrics.map((m) => (
            <div key={m.label}>
              <div className="flex items-center justify-between mb-1 text-xs">
                <span className="text-foreground/90">{m.label}</span>
                <span className="font-mono text-muted-foreground">
                  {m.delivered} / {m.expected} {m.unit}
                </span>
              </div>
              <div className="relative h-5 rounded-md bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-amber-300 dark:bg-amber-600/60"
                  style={{ width: `${(m.expected / Math.max(100, m.expected)) * 100}%` }}
                />
                <div
                  className="absolute inset-y-0 left-0 bg-rose-500"
                  style={{ width: `${(m.delivered / Math.max(100, m.expected)) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-4 text-[10px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <span className="inline-block w-3 h-2 bg-amber-300 dark:bg-amber-600/60 rounded-sm" />
            Forventet
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="inline-block w-3 h-2 bg-rose-500 rounded-sm" />
            Faktisk levert
          </span>
        </div>
      </div>

      {/* Årsaks-grid */}
      <div className="grid sm:grid-cols-2 gap-3 mb-4">
        {w.causes.map((c) => (
          <div key={c.label} className="rounded-lg border border-border bg-background p-3 text-sm">
            <div className="font-semibold text-foreground mb-1">{c.label}</div>
            <p className="text-xs text-muted-foreground leading-relaxed">{c.detail}</p>
          </div>
        ))}
      </div>

      {/* Lesson */}
      <div className="rounded-lg border border-brand/30 bg-brand/5 p-3 text-sm mb-6">
        <div className="text-[10px] uppercase tracking-wider text-brand font-semibold mb-1">
          Lærdom
        </div>
        <p className="text-foreground/90 leading-relaxed">{w.lesson}</p>
      </div>

      {/* Gartner hype-syklus */}
      <div className="rounded-lg border border-border bg-background p-4">
        <div className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-2">
          Hvor er vi nå? — sett markøren der du tror
        </div>
        <p className="text-[11px] text-muted-foreground mb-3 leading-snug">
          Gartner-hype-syklusen modellerer hvordan ny teknologi går gjennom 5 faser.
          Dra slideren under for å plassere dagens (mai 2026) AI der du mener vi er.
        </p>

        {/* SVG-kurve */}
        <svg viewBox="0 0 400 140" className="w-full">
          {/* Akselinjer */}
          <line x1={20} y1={120} x2={390} y2={120} stroke="currentColor" strokeWidth={1} className="text-zinc-400" />
          {/* kurven (Gartner-formet: rask topp → dyp grop → langsom recovery) */}
          <path
            d="M 30 110 Q 80 -10, 130 25 Q 175 80, 220 115 Q 275 130, 320 100 Q 365 80, 390 70"
            fill="none"
            stroke="#94a3b8"
            strokeWidth={2}
          />
          {/* Fase-labels */}
          {HYPE_CYCLE.map((p, i) => {
            const x = 30 + i * 90;
            return (
              <g key={p.phase}>
                <text x={x} y={135} textAnchor="middle" className="fill-current text-[8px] font-bold text-zinc-600 dark:text-zinc-400" fontFamily="monospace">
                  {p.phase}
                </text>
              </g>
            );
          })}
          {/* Brukerens markør på kurven */}
          {(() => {
            // map position 0-100 til x = 30..390
            const x = 30 + (position / 100) * 360;
            // estimer y ved å sample kurven manuelt
            const yEstimate =
              position < 20
                ? 110 - position * 5
                : position < 40
                  ? 10 + (position - 20) * 3.5
                  : position < 60
                    ? 80 + (position - 40) * 1.5
                    : position < 80
                      ? 110 - (position - 60) * 1.5
                      : 80 - (position - 80) * 0.5;
            return (
              <>
                <circle cx={x} cy={yEstimate} r={8} fill="#3b82f6" stroke="#fff" strokeWidth={2} />
                <text x={x} y={yEstimate - 12} textAnchor="middle" className="fill-current text-[9px] font-bold text-brand" fontFamily="monospace">
                  HER?
                </text>
              </>
            );
          })()}
        </svg>

        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={position}
          onChange={(e) => setPosition(parseInt(e.target.value, 10))}
          className="w-full mt-2 accent-[var(--brand,#3b82f6)] cursor-pointer"
        />

        <div className="mt-3 rounded-lg border border-border bg-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-brand font-semibold mb-1">
            Du har plassert AI på: {userPhase.label}
          </div>
          <p className="text-xs text-foreground/90 leading-relaxed">
            {userPhase.phase === "Trigger" &&
              "Du tror gjennombruddet fortsatt er i støpeskjeen. Mange muligheter, lite kommersielt enda."}
            {userPhase.phase === "Peak" &&
              "Du tror vi er på toppen av forventningene — investorer, presse og bedrifter overvurderer hva som er mulig nå. Et fall er sannsynlig."}
            {userPhase.phase === "Trough" &&
              "Du tror vi er midt i (eller på vei inn i) en desillusjonerings-fase. Mange selskaper kommer til å gå over ende, men teknologien overlever."}
            {userPhase.phase === "Slope" &&
              "Du tror vi er gjennom det verste — folk forstår nå begrensningene, og bygger på ekte verdier i stedet for hype."}
            {userPhase.phase === "Plateau" &&
              "Du tror AI har funnet sin plass: nyttig i mange yrker, ikke universell magi. Som elektrisitet — det bare er der."}
          </p>
        </div>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        <strong className="text-foreground">Diskusjons-spørsmål:</strong> Vinter 1
        og 2 kom etter at brede løfter ikke ble innfridd. Hvilke løfter blir nå
        gitt om GenAI? Kan de innfris? Hvis ikke — hva blir konsekvensen?
      </p>
    </div>
  );
}
