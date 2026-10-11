import { useState } from "react";
import { RotateCcw } from "lucide-react";

// --------------------------------------------------------------------------
// CRISP-DM (Cross-Industry Standard Process for Data Mining) — 6 faser
// arrangert som syklus, med tilbakekant-piler som viser at prosessen
// IKKE er lineær. Klikk en fase for å vise typiske oppgaver + outputs.
//
// De fire viktigste tilbakekantene (det er disse studenter glemmer):
//   - Data Understanding → Business Understanding  (dataene matcher
//     ikke spørsmålet; refraser problemet)
//   - Modeling → Data Preparation                  (modellen trenger
//     andre features; gå tilbake og bygg dem)
//   - Evaluation → Business Understanding          (modellen er god,
//     men løser ikke det opprinnelige problemet)
//   - Deployment → (neste iterasjon)               (drift over tid)
// --------------------------------------------------------------------------

type PhaseId =
  | "business"
  | "data-und"
  | "data-prep"
  | "modeling"
  | "evaluation"
  | "deployment";

type Phase = {
  id: PhaseId;
  label: string;
  short: string;
  color: string;
  tasks: string[];
  outputs: string[];
  pitfall: string;
};

const PHASES: Phase[] = [
  {
    id: "business",
    label: "Business Understanding",
    short: "Forstå problemet",
    color: "#6366f1",
    tasks: [
      "Definer y (hva skal predikeres) og hvilken beslutning den støtter",
      "Identifiser hvem som faktisk bruker prediksjonen",
      "Skriv ned suksess-kriterium FØR du ser data",
      "Klargjør kostnaden av FP vs FN",
    ],
    outputs: [
      "Problemformulering (1 setning)",
      "Suksess-metrikk + terskel",
      "Liste over interessenter",
    ],
    pitfall:
      "Hopper rett til kode uten å spørre «hva er beslutningen?» — ender med en flott modell ingen bruker.",
  },
  {
    id: "data-und",
    label: "Data Understanding",
    short: "Bli kjent med dataene",
    color: "#8b5cf6",
    tasks: [
      "df.shape, df.info(), df.describe(), df.isna().sum()",
      "Histogrammer per feature, klassebalanse",
      "Pair-plot / korrelasjonsmatrise",
      "Sjekk seleksjonsskjevhet i innsamlingen",
    ],
    outputs: [
      "EDA-notebook med 3-5 nøkkelfigurer",
      "Liste over kjente begrensninger",
      "Beslutning: holder datakvaliteten?",
    ],
    pitfall:
      "Tror at «datasettet er rent» fordi det kom som CSV. Sjekk alltid duplikater, NaN, og om kategorier er konsistent kodet.",
  },
  {
    id: "data-prep",
    label: "Data Preparation",
    short: "Forbered + features",
    color: "#ec4899",
    tasks: [
      "Imputering av manglende verdier",
      "Skalering (StandardScaler) — kun for kNN/SVM/logreg, ikke trær",
      "One-hot eller ordinal-koding av kategoriske felt",
      "Feature engineering: avledede kolonner som koder domenekunnskap",
      "Train/test-split FØR pipeline fittes",
    ],
    outputs: [
      "sklearn Pipeline + ColumnTransformer",
      "X_train, X_test, y_train, y_test",
    ],
    pitfall:
      "scaler.fit(X) på HELE X før split → data-lekkasje. Fit kun på train, transform på begge.",
  },
  {
    id: "modeling",
    label: "Modeling",
    short: "Tren modeller",
    color: "#f59e0b",
    tasks: [
      "DummyClassifier som baseline — alltid",
      "Prøv 2-3 algoritmer (logreg, kNN, RandomForest)",
      "Cross-validation på TRAIN, ikke test",
      "Hyperparameter-søk med GridSearchCV/RandomizedSearchCV",
    ],
    outputs: [
      "Tabell: modell × CV-score",
      "Valgt modell + hyperparametre",
    ],
    pitfall:
      "Tuner hyperparametre på test-settet. Test-settet skal røres ÉN gang, helt til slutt — ellers blir det val-sett i forkledning.",
  },
  {
    id: "evaluation",
    label: "Evaluation",
    short: "Evaluér på test",
    color: "#10b981",
    tasks: [
      "Predict på test-sett ÉN gang",
      "Confusion matrix + classification_report",
      "Sammenlign med baseline og suksess-kriterium",
      "Vurder: oppfyller modellen det opprinnelige forretningsmålet?",
    ],
    outputs: [
      "Endelige metrikker (accuracy, F1, precision, recall)",
      "Diskusjon: hvor feiler modellen?",
      "Beslutning: deploy eller tilbake til steg 1?",
    ],
    pitfall:
      "Rapporterer kun accuracy på ubalansert datasett (90 % i én klasse → 90 % accuracy ved å gjette majoriteten). Bruk F1, recall, eller per-klasse-tall.",
  },
  {
    id: "deployment",
    label: "Deployment",
    short: "Deploy + monitor",
    color: "#0ea5e9",
    tasks: [
      "joblib.dump(pipeline, 'modell.joblib') — lagre HELE pipelinen",
      "Dokumentér input/output-format i README",
      "Sett opp monitoring av input-distribusjon (data drift)",
      "Plan for re-trening: hvor ofte? trigger?",
    ],
    outputs: [
      "Lagret modell-artifakt",
      "API/script som tar input og returnerer prediksjon",
      "Drift-monitorering",
    ],
    pitfall:
      "Lagrer bare estimatoren, ikke preprosesseringen → ny data går rett inn i modellen uten skalering. Lagre HELE pipelinen.",
  },
];

const SVG_W = 560;
const SVG_H = 460;
const CENTER_X = SVG_W / 2;
const CENTER_Y = SVG_H / 2 + 10;
const RADIUS = 165;
const NODE_R = 52;

// Posisjoner fasene rundt en sirkel, klokke-start kl 12.
const PHASE_POS: Record<PhaseId, { x: number; y: number; angle: number }> = (() => {
  const ids: PhaseId[] = [
    "business",
    "data-und",
    "data-prep",
    "modeling",
    "evaluation",
    "deployment",
  ];
  const out = {} as Record<PhaseId, { x: number; y: number; angle: number }>;
  ids.forEach((id, i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 6;
    out[id] = {
      x: CENTER_X + RADIUS * Math.cos(angle),
      y: CENTER_Y + RADIUS * Math.sin(angle),
      angle,
    };
  });
  return out;
})();

// Pile-segmenter på sirkelen. Hovedretningen er med klokka.
const FORWARD_EDGES: Array<[PhaseId, PhaseId]> = [
  ["business", "data-und"],
  ["data-und", "data-prep"],
  ["data-prep", "modeling"],
  ["modeling", "evaluation"],
  ["evaluation", "deployment"],
];

// Tilbakekantene — disse er det som gjør CRISP-DM iterativ.
const BACKWARD_EDGES: Array<{ from: PhaseId; to: PhaseId; label: string; offset: number }> = [
  { from: "data-und", to: "business", label: "dataene matcher ikke spørsmålet", offset: -28 },
  { from: "modeling", to: "data-prep", label: "trenger andre features", offset: -28 },
  { from: "evaluation", to: "business", label: "modell god, mål ikke nådd", offset: 0 },
];

function pointOnNodeEdge(from: { x: number; y: number }, to: { x: number; y: number }, r: number) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy);
  return { x: from.x + (dx / len) * r, y: from.y + (dy / len) * r };
}

// Bue mellom to noder, alltid med klokka (vri ut fra senter).
function arcPath(fromId: PhaseId, toId: PhaseId, inward: boolean) {
  const from = PHASE_POS[fromId];
  const to = PHASE_POS[toId];
  const p1 = pointOnNodeEdge(from, to, NODE_R);
  const p2 = pointOnNodeEdge(to, from, NODE_R);
  const r = RADIUS * (inward ? 0.78 : 1.18);
  const sweep = inward ? 0 : 1;
  return `M ${p1.x} ${p1.y} A ${r} ${r} 0 0 ${sweep} ${p2.x} ${p2.y}`;
}

export function CrispDmDiagram() {
  const [selected, setSelected] = useState<PhaseId>("business");
  const phase = PHASES.find((p) => p.id === selected)!;

  return (
    <div className="rounded-xl border border-border bg-card p-4 md:p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="text-sm font-semibold">CRISP-DM som syklus</div>
          <div className="text-xs text-muted-foreground mt-0.5">
            Klikk en fase for typiske oppgaver, outputs og vanlige feller.
            Stiplede piler = tilbakekanter (iterasjon).
          </div>
        </div>
        <button
          type="button"
          onClick={() => setSelected("business")}
          className="text-xs flex items-center gap-1 px-2 py-1 rounded border border-border hover:bg-muted/50"
        >
          <RotateCcw className="h-3 w-3" /> reset
        </button>
      </div>

      <div className="grid md:grid-cols-[1fr_280px] gap-4 items-start">
        <div className="overflow-x-auto">
          <svg
            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            className="w-full max-w-[560px] mx-auto"
            role="img"
            aria-label="CRISP-DM syklus med 6 faser"
          >
            <defs>
              <marker
                id="arrow-fwd"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
              </marker>
              <marker
                id="arrow-back"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#e11d48" />
              </marker>
            </defs>

            {/* Ytre "data"-ring (kontekst-laget i CRISP-DM-figuren) */}
            <circle
              cx={CENTER_X}
              cy={CENTER_Y}
              r={RADIUS + NODE_R + 16}
              fill="none"
              stroke="currentColor"
              strokeWidth={1}
              strokeDasharray="2 4"
              className="text-muted-foreground/30"
            />
            <text
              x={CENTER_X}
              y={CENTER_Y - RADIUS - NODE_R - 22}
              textAnchor="middle"
              className="fill-muted-foreground text-[10px]"
            >
              Data
            </text>

            {/* Forward-piler (med klokka) */}
            {FORWARD_EDGES.map(([from, to]) => (
              <path
                key={`fwd-${from}-${to}`}
                d={arcPath(from, to, false)}
                fill="none"
                stroke="#64748b"
                strokeWidth={2}
                markerEnd="url(#arrow-fwd)"
              />
            ))}

            {/* Deployment → business: ytre løkke som lukker syklusen */}
            <path
              d={arcPath("deployment", "business", false)}
              fill="none"
              stroke="#64748b"
              strokeWidth={2}
              markerEnd="url(#arrow-fwd)"
            />

            {/* Tilbakekanter (rødt, stiplet, inn-buet) */}
            {BACKWARD_EDGES.map((e) => (
              <g key={`back-${e.from}-${e.to}`}>
                <path
                  d={arcPath(e.from, e.to, true)}
                  fill="none"
                  stroke="#e11d48"
                  strokeWidth={1.5}
                  strokeDasharray="4 3"
                  markerEnd="url(#arrow-back)"
                />
              </g>
            ))}

            {/* Senter-tekst */}
            <text
              x={CENTER_X}
              y={CENTER_Y - 6}
              textAnchor="middle"
              className="fill-foreground text-[13px] font-semibold"
            >
              CRISP-DM
            </text>
            <text
              x={CENTER_X}
              y={CENTER_Y + 12}
              textAnchor="middle"
              className="fill-muted-foreground text-[10px]"
            >
              iterativ syklus
            </text>

            {/* Faser */}
            {PHASES.map((p, i) => {
              const pos = PHASE_POS[p.id];
              const isSel = p.id === selected;
              return (
                <g
                  key={p.id}
                  onClick={() => setSelected(p.id)}
                  className="cursor-pointer"
                >
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={NODE_R}
                    fill={p.color}
                    fillOpacity={isSel ? 0.95 : 0.18}
                    stroke={p.color}
                    strokeWidth={isSel ? 3 : 1.5}
                  />
                  <text
                    x={pos.x}
                    y={pos.y - 6}
                    textAnchor="middle"
                    className="text-[9px] font-bold pointer-events-none"
                    fill={isSel ? "white" : p.color}
                  >
                    {i + 1}.
                  </text>
                  <text
                    x={pos.x}
                    y={pos.y + 8}
                    textAnchor="middle"
                    className="text-[10px] font-semibold pointer-events-none"
                    fill={isSel ? "white" : "currentColor"}
                  >
                    {p.short.split(" ")[0]}
                  </text>
                  <text
                    x={pos.x}
                    y={pos.y + 20}
                    textAnchor="middle"
                    className="text-[9px] pointer-events-none"
                    fill={isSel ? "white" : "currentColor"}
                    fillOpacity={isSel ? 0.9 : 0.7}
                  >
                    {p.short.split(" ").slice(1).join(" ")}
                  </text>
                </g>
              );
            })}
          </svg>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-muted-foreground mt-2 justify-center">
            <span className="inline-flex items-center gap-1">
              <span className="inline-block w-6 h-[2px] bg-[#64748b]" /> forward
            </span>
            <span className="inline-flex items-center gap-1">
              <span
                className="inline-block w-6 h-[2px]"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(to right, #e11d48 0 4px, transparent 4px 7px)",
                }}
              />
              tilbakekant (iterer)
            </span>
          </div>
        </div>

        <div
          className="rounded-lg border p-3 text-xs space-y-2.5"
          style={{ borderColor: phase.color + "55", background: phase.color + "0d" }}
        >
          <div>
            <div className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: phase.color }}>
              fase {PHASES.findIndex((p) => p.id === phase.id) + 1}
            </div>
            <div className="font-semibold text-sm mt-0.5">{phase.label}</div>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Typiske oppgaver</div>
            <ul className="mt-1 space-y-0.5 list-disc pl-4">
              {phase.tasks.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Outputs</div>
            <ul className="mt-1 space-y-0.5 list-disc pl-4">
              {phase.outputs.map((o, i) => (
                <li key={i}>{o}</li>
              ))}
            </ul>
          </div>

          <div className="rounded border border-amber-500/40 bg-amber-500/5 p-2">
            <div className="text-[10px] uppercase tracking-wider font-semibold text-amber-600 dark:text-amber-400">
              vanligste felle
            </div>
            <div className="mt-0.5">{phase.pitfall}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
