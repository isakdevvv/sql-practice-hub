import { useState } from "react";

/**
 * Visualiserer pendel-svingningene mellom de tre AI-paradigmene:
 *   - Symbolic AI         (1956-1990): regler, logikk, søk
 *   - Connectionism       (1986-i dag): nevrale nett, gradient descent
 *   - Statistical / ML    (1990s-i dag): probabilistiske modeller, kjerne-metoder
 *
 * Vis hvordan dominansen har skiftet, og hvordan dagens LLMs er hybride
 * (connectionist arkitektur, statistisk trening, men begynner å inkludere
 * symbolic reasoning via verktøy-bruk og chain-of-thought).
 */

type ParadigmId = "symbolic" | "connectionist" | "statistical";

type Paradigm = {
  id: ParadigmId;
  name: string;
  shortLabel: string;
  color: string; // tailwind text/bg-color base
  blurb: string;
  core: string;
  representatives: { name: string; year: number; what: string }[];
  // dominans per tiår (0-100)
  dominance: number[]; // [1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020]
};

const DECADES = [1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020];

const PARADIGMS: Paradigm[] = [
  {
    id: "symbolic",
    name: "Symbolic AI",
    shortLabel: "Symbolic",
    color: "amber",
    blurb:
      "AI som eksplisitt manipulasjon av symboler. Logikk, regler, søk. «Hjernen er en datamaskin som kjører på diskret symbolikk» (Newell & Simon).",
    core: "Kunnskap kodes som regler («hvis A og B, så C») eller logikk-formler. Resonnering = søk eller deduksjon.",
    representatives: [
      { name: "Logic Theorist", year: 1956, what: "Bevisste matematiske teoremer via søk" },
      { name: "ELIZA", year: 1966, what: "Mønster-matching for samtale" },
      { name: "STRIPS", year: 1971, what: "Planlegging via preconditions/effects" },
      { name: "MYCIN", year: 1972, what: "600 regler for blodinfeksjon-diagnose" },
      { name: "PROLOG", year: 1972, what: "Programmeringsspråk basert på logikk" },
      { name: "CYC", year: 1984, what: "Forsøk på å kode all «common sense»-kunnskap manuelt" },
      { name: "Deep Blue", year: 1997, what: "Brute force søk + håndlagde sjakk-regler" },
    ],
    dominance: [30, 70, 80, 70, 30, 15, 10, 10],
  },
  {
    id: "connectionist",
    name: "Connectionism / Nevrale nett",
    shortLabel: "Connectionist",
    color: "sky",
    blurb:
      "Intelligens oppstår fra nettverk av enkle enheter (nevroner) som lærer fra data. Distribuerte representasjoner, gradient descent.",
    core: "Vekter justeres med backprop slik at modellen minimerer feil på treningsdata. Mønstergjenkjenning fremfor regler.",
    representatives: [
      { name: "Perceptron", year: 1958, what: "Første lærbare nevron-modell" },
      { name: "Backpropagation", year: 1986, what: "Kjederegelen for fler-lag-trening" },
      { name: "LeNet", year: 1998, what: "Første praktiske CNN — leste sjekker" },
      { name: "Deep Belief Nets", year: 2006, what: "Rebranding NN → DL (Hinton)" },
      { name: "AlexNet", year: 2012, what: "CNN-revolusjonen på ImageNet" },
      { name: "Transformer", year: 2017, what: "Self-attention — fundamentet for LLMs" },
      { name: "GPT-3", year: 2020, what: "175B parametre — emergent abilities" },
    ],
    dominance: [40, 35, 15, 30, 25, 35, 75, 90],
  },
  {
    id: "statistical",
    name: "Statistisk ML",
    shortLabel: "Statistical",
    color: "emerald",
    blurb:
      "Modeller bygget på sannsynlighetsteori og statistikk. Bayes, kjerne-metoder, ensemble. «AI er bare anvendt statistikk».",
    core: "Anta en sannsynlighets-modell, estimer parametre fra data, gjør prediksjoner med usikkerhet. Ofte tolkbart.",
    representatives: [
      { name: "Naive Bayes", year: 1960, what: "Probabilistisk klassifikator" },
      { name: "Hidden Markov Models", year: 1970, what: "Sekvensiell prosess-modell" },
      { name: "EM-algoritmen", year: 1977, what: "Estimering med skjulte variabler" },
      { name: "SVM", year: 1995, what: "Maks-margin kjerne-metode" },
      { name: "Random Forest", year: 2001, what: "Ensemble av decision trees" },
      { name: "Gradient Boosting (XGBoost)", year: 2014, what: "Dominerer Kaggle-konkurranser" },
      { name: "Probabilistic programming (Stan, PyMC)", year: 2012, what: "Bayes-inferens som programvare" },
    ],
    dominance: [10, 15, 20, 25, 60, 75, 50, 30],
  },
];

const COLOR_MAP: Record<string, { text: string; bg: string; bgLight: string; border: string; fill: string }> = {
  amber: {
    text: "text-amber-600",
    bg: "bg-amber-500",
    bgLight: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-300/40",
    fill: "#f59e0b",
  },
  sky: {
    text: "text-sky-600",
    bg: "bg-sky-500",
    bgLight: "bg-sky-50 dark:bg-sky-950/30",
    border: "border-sky-300/40",
    fill: "#0ea5e9",
  },
  emerald: {
    text: "text-emerald-600",
    bg: "bg-emerald-500",
    bgLight: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-300/40",
    fill: "#10b981",
  },
};

export function ParadigmShiftsViz() {
  const [selected, setSelected] = useState<ParadigmId | null>(null);
  const sel = selected ? PARADIGMS.find((p) => p.id === selected) ?? null : null;

  // SVG-dimensjoner
  const W = 600;
  const H = 220;
  const padL = 50;
  const padR = 20;
  const padT = 20;
  const padB = 40;
  const xScale = (decade: number) =>
    padL + ((decade - 1950) / (2020 - 1950)) * (W - padL - padR);
  const yScale = (val: number) => H - padB - (val / 100) * (H - padT - padB);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-lg font-semibold mb-1">
        Tre paradigmer — pendel mellom regler, data og statistikk
      </h3>
      <p className="text-xs text-muted-foreground mb-4">
        Klikk en farget linje (eller paradigme-knappen under) for å se representative
        algoritmer og hva paradigmet sto for.
      </p>

      <div className="rounded-lg border border-border bg-background p-3 overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto min-w-[500px]">
          {/* Bakgrunns-grid */}
          {[0, 25, 50, 75, 100].map((v) => (
            <g key={v}>
              <line
                x1={padL}
                y1={yScale(v)}
                x2={W - padR}
                y2={yScale(v)}
                stroke="currentColor"
                className="text-zinc-200 dark:text-zinc-800"
                strokeWidth={0.5}
              />
              <text x={padL - 6} y={yScale(v) + 3} textAnchor="end" className="fill-current text-[9px] text-zinc-500" fontFamily="monospace">
                {v}%
              </text>
            </g>
          ))}
          {/* X-akse */}
          {DECADES.map((d) => (
            <g key={d}>
              <line x1={xScale(d)} y1={padT} x2={xScale(d)} y2={H - padB} stroke="currentColor" className="text-zinc-100 dark:text-zinc-900" strokeWidth={0.5} />
              <text x={xScale(d)} y={H - padB + 15} textAnchor="middle" className="fill-current text-[9px] text-zinc-500" fontFamily="monospace">
                {d}
              </text>
            </g>
          ))}
          {/* AI-vinter bånd */}
          <rect
            x={xScale(1974)}
            y={padT}
            width={xScale(1980) - xScale(1974)}
            height={H - padT - padB}
            className="fill-zinc-400/30 dark:fill-zinc-600/30"
          />
          <rect
            x={xScale(1987)}
            y={padT}
            width={xScale(1993) - xScale(1987)}
            height={H - padT - padB}
            className="fill-zinc-400/30 dark:fill-zinc-600/30"
          />

          {/* Linjer */}
          {PARADIGMS.map((p) => {
            const isSel = !selected || selected === p.id;
            const c = COLOR_MAP[p.color];
            const points = p.dominance.map((v, i) => `${xScale(DECADES[i])},${yScale(v)}`).join(" ");
            return (
              <g key={p.id}>
                <polyline
                  points={points}
                  fill="none"
                  stroke={c.fill}
                  strokeWidth={isSel ? 3 : 1.5}
                  opacity={isSel ? 1 : 0.3}
                  onClick={() => setSelected(p.id)}
                  className="cursor-pointer"
                />
                {p.dominance.map((v, i) => (
                  <circle
                    key={i}
                    cx={xScale(DECADES[i])}
                    cy={yScale(v)}
                    r={isSel ? 4 : 2}
                    fill={c.fill}
                    opacity={isSel ? 1 : 0.3}
                    onClick={() => setSelected(p.id)}
                    className="cursor-pointer"
                  />
                ))}
              </g>
            );
          })}

          {/* Akse-titler */}
          <text x={W / 2} y={H - 4} textAnchor="middle" className="fill-current text-[10px] text-zinc-500" fontFamily="monospace">
            Tiår
          </text>
          <text x={10} y={H / 2} transform={`rotate(-90 10 ${H / 2})`} textAnchor="middle" className="fill-current text-[10px] text-zinc-500" fontFamily="monospace">
            Relativ dominans
          </text>

          {/* AI-vinter labels */}
          <text x={(xScale(1974) + xScale(1980)) / 2} y={padT + 12} textAnchor="middle" className="fill-current text-[8px] text-zinc-500 font-bold" fontFamily="monospace">
            ❄ vinter
          </text>
          <text x={(xScale(1987) + xScale(1993)) / 2} y={padT + 12} textAnchor="middle" className="fill-current text-[8px] text-zinc-500 font-bold" fontFamily="monospace">
            ❄ vinter
          </text>
        </svg>
      </div>

      {/* Paradigme-knapper */}
      <div className="mt-4 flex flex-wrap gap-2">
        {PARADIGMS.map((p) => {
          const c = COLOR_MAP[p.color];
          const isSel = selected === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelected(isSel ? null : p.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium border transition ${
                isSel
                  ? `${c.bg} text-white border-transparent`
                  : `bg-card border-border hover:${c.text} hover:border-current`
              }`}
            >
              <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: c.fill }} />
              {p.name}
            </button>
          );
        })}
        {selected && (
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="px-3 py-1.5 rounded-md text-xs text-muted-foreground border border-border hover:text-foreground"
          >
            Vis alle
          </button>
        )}
      </div>

      {/* Detalj-kort */}
      {sel && (
        <div className={`mt-4 rounded-lg border ${COLOR_MAP[sel.color].border} ${COLOR_MAP[sel.color].bgLight} p-4`}>
          <h4 className={`font-semibold ${COLOR_MAP[sel.color].text}`}>{sel.name}</h4>
          <p className="text-sm text-foreground/90 mt-1">{sel.blurb}</p>
          <p className="text-xs text-muted-foreground mt-2">
            <strong className="text-foreground">Kjerne-idé:</strong> {sel.core}
          </p>
          <div className="mt-3">
            <div className="text-[10px] uppercase tracking-wider text-foreground/70 font-semibold mb-2">
              Representative algoritmer & systemer
            </div>
            <ul className="text-xs space-y-1.5">
              {sel.representatives.map((r) => (
                <li key={r.name} className="flex gap-2">
                  <span className="font-mono text-foreground/70 w-12 shrink-0">{r.year}</span>
                  <span>
                    <strong className="text-foreground">{r.name}</strong> — {r.what}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Hybrid-poenget */}
      <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 text-sm">
        <div className="text-[10px] uppercase tracking-wider text-brand font-semibold mb-1">
          Hvor er vi nå? — hybrid-modellen
        </div>
        <p className="text-foreground/90 leading-relaxed">
          Dagens LLMs er ikke rent ett paradigme. Arkitekturen er{" "}
          <strong className="text-foreground">connectionist</strong> (transformere er
          dype nevrale nett). Treningen er{" "}
          <strong className="text-foreground">statistisk</strong> (next-token
          prediction = MLE på en sannsynlighetsfordeling). Men ved inferens får de
          stadig mer <strong className="text-foreground">symbolske</strong>
          komponenter: chain-of-thought-prompting, kalkulator/kode-verktøy,
          plan-og-utfør-arkitekturer, RAG mot kunnskaps-baser. Pendelen er ikke
          lenger «enten/eller» — feltet kombinerer styrkene.
        </p>
      </div>
    </div>
  );
}
