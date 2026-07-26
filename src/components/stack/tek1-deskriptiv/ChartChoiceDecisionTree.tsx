import { useState } from "react";

/**
 * ChartChoiceDecisionTree — guidet beslutningstre for "hvilken visualisering?".
 * Steg 1: datatype. Steg 2: antall variabler. Steg 3: hva man vil vise.
 * Til slutt: en anbefalt chart-type + mini-SVG-eksempel.
 */

type DataType = "kategorisk" | "ordinal" | "kontinuerlig";
type VarCount = "1" | "2" | "3+";
type Goal = "fordeling" | "sammenheng" | "sammenligning" | "trend" | "del-av-helhet";

type Recommendation = {
  chart: string;
  description: string;
  Example: () => JSX.Element;
};

function rec(dt: DataType, vc: VarCount, goal: Goal): Recommendation {
  // 1 variabel
  if (vc === "1") {
    if (goal === "fordeling") {
      if (dt === "kontinuerlig")
        return {
          chart: "Histogram (eller density plot)",
          description:
            "Del verdiområdet i bins. Søyle-høyde = antall observasjoner per bin. Avslører form, skew, multimodalitet.",
          Example: HistEx,
        };
      return {
        chart: "Søylediagram (bar chart)",
        description:
          "Én søyle per kategori, høyde = antall. For ordinal: behold rekkefølgen. For kategorisk: sortér på frekvens for lesbarhet.",
        Example: BarEx,
      };
    }
    if (goal === "del-av-helhet")
      return {
        chart: "Søylediagram (heller enn kake)",
        description:
          "Kakediagram er vanskelig å lese presist; bruk sortert bar chart med prosent-etiketter. Kake bare hvis du har ≤ 3 kategorier.",
        Example: BarEx,
      };
    return {
      chart: "Boksplott (single)",
      description:
        "5-tallsoppsummering + outliers. Bra for å vise spredning og skjevhet i én variabel.",
      Example: BoxEx,
    };
  }
  // 2 variabler
  if (vc === "2") {
    if (goal === "sammenheng") {
      if (dt === "kontinuerlig")
        return {
          chart: "Scatter plot",
          description:
            "(x, y)-punkter. Avslører lineær/ikke-lineær sammenheng, korrelasjon, klynger, outliers. Grunnlaget for regresjon.",
          Example: ScatterEx,
        };
      return {
        chart: "Heatmap / krysstabell",
        description:
          "For to kategoriske: krysstabell (mosaikk). For en kategorisk + en kontinuerlig: gruppert boksplott.",
        Example: HeatEx,
      };
    }
    if (goal === "trend")
      return {
        chart: "Linjediagram (line chart)",
        description:
          "Sammenhengende linje over en ordret x-akse (typisk tid). Bra for å se utvikling, ikke for spredning.",
        Example: LineEx,
      };
    if (goal === "sammenligning")
      return {
        chart: "Gruppert boksplott (boxplot per kategori)",
        description:
          "Side-om-side bokser per gruppe. Sammenligner medianer og spredninger samtidig.",
        Example: GroupedBoxEx,
      };
    return {
      chart: "Stablet/gruppert søylediagram",
      description:
        "Sammenlign fordeling av kategori A på tvers av kategori B. Bruk grupperte (ikke stablede) hvis du sammenligner verdier.",
      Example: BarEx,
    };
  }
  // 3+ variabler
  if (goal === "sammenheng")
    return {
      chart: "Scatter matrix / parallel coordinates",
      description:
        "Alle par av variabler tegnes som scatter (matrise), eller hvert datapunkt blir en linje gjennom akser (parallell).",
      Example: ScatterMatrixEx,
    };
  return {
    chart: "Heatmap (korrelasjonsmatrise)",
    description:
      "Når du har mange variabler: tegn korrelasjoner som en farget matrise. Klusterer lignende variabler.",
    Example: HeatEx,
  };
}

export function ChartChoiceDecisionTree() {
  const [dt, setDt] = useState<DataType | null>(null);
  const [vc, setVc] = useState<VarCount | null>(null);
  const [goal, setGoal] = useState<Goal | null>(null);

  const reset = () => {
    setDt(null);
    setVc(null);
    setGoal(null);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        <Step n={1} label="Datatype" active={!dt} done={!!dt} />
        <Arrow />
        <Step n={2} label="Antall variabler" active={!!dt && !vc} done={!!vc} />
        <Arrow />
        <Step n={3} label="Hva vil du vise?" active={!!vc && !goal} done={!!goal} />
        <Arrow />
        <Step n={4} label="Anbefaling" active={!!dt && !!vc && !!goal} done={false} />
        <button
          type="button"
          onClick={reset}
          className="ml-auto px-2.5 py-1 rounded text-xs font-medium border border-border bg-background hover:bg-muted"
        >
          Start på nytt
        </button>
      </div>

      {!dt && (
        <Choices
          title="Hva slags data har du?"
          options={[
            { v: "kategorisk", label: "Kategorisk", hint: "farger, merker, ja/nei" },
            { v: "ordinal", label: "Ordinal", hint: "karakterer A–F, lite/middels/mye" },
            { v: "kontinuerlig", label: "Kontinuerlig", hint: "vekt, høyde, lønn" },
          ]}
          onPick={(v) => setDt(v as DataType)}
        />
      )}

      {dt && !vc && (
        <Choices
          title="Hvor mange variabler skal vises?"
          options={[
            { v: "1", label: "1 variabel", hint: "univariat" },
            { v: "2", label: "2 variabler", hint: "bivariat" },
            { v: "3+", label: "3+ variabler", hint: "multivariat" },
          ]}
          onPick={(v) => setVc(v as VarCount)}
        />
      )}

      {dt && vc && !goal && (
        <Choices
          title="Hva er hovedbudskapet?"
          options={[
            { v: "fordeling", label: "Vise FORDELING", hint: "form/skew/spredning" },
            { v: "sammenheng", label: "Vise SAMMENHENG", hint: "korrelasjon mellom variabler" },
            { v: "sammenligning", label: "SAMMENLIGNE grupper", hint: "A vs B vs C" },
            { v: "trend", label: "Vise TREND over tid", hint: "endring over tid" },
            { v: "del-av-helhet", label: "DEL-AV-HELHET", hint: "andeler av totalen" },
          ]}
          onPick={(v) => setGoal(v as Goal)}
        />
      )}

      {dt && vc && goal && <Result dt={dt} vc={vc} goal={goal} />}
    </div>
  );
}

function Result({ dt, vc, goal }: { dt: DataType; vc: VarCount; goal: Goal }) {
  const r = rec(dt, vc, goal);
  return (
    <div className="rounded-xl border-2 border-emerald-500/40 bg-emerald-500/5 p-4">
      <div className="text-xs uppercase tracking-wider text-emerald-500 font-semibold mb-1">
        Anbefalt visualisering
      </div>
      <div className="text-base font-semibold mb-2">{r.chart}</div>
      <p className="text-sm text-muted-foreground mb-3">{r.description}</p>
      <div className="rounded-lg border border-border bg-background p-3">
        <r.Example />
      </div>
      <div className="mt-3 text-[11px] text-muted-foreground">
        Valg: <span className="font-mono">{dt}</span> · <span className="font-mono">{vc}</span> ·{" "}
        <span className="font-mono">{goal}</span>
      </div>
    </div>
  );
}

function Choices({
  title,
  options,
  onPick,
}: {
  title: string;
  options: { v: string; label: string; hint?: string }[];
  onPick: (v: string) => void;
}) {
  return (
    <div>
      <div className="text-sm font-semibold mb-2">{title}</div>
      <div className="grid sm:grid-cols-3 gap-2">
        {options.map((o) => (
          <button
            key={o.v}
            type="button"
            onClick={() => onPick(o.v)}
            className="text-left rounded-lg border border-border bg-background p-3 hover:border-brand hover:bg-brand/5 transition"
          >
            <div className="text-sm font-medium">{o.label}</div>
            {o.hint && <div className="text-[11px] text-muted-foreground mt-0.5">{o.hint}</div>}
          </button>
        ))}
      </div>
    </div>
  );
}

function Step({
  n,
  label,
  active,
  done,
}: {
  n: number;
  label: string;
  active: boolean;
  done: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-1.5 text-xs ${
        active ? "text-brand font-semibold" : done ? "text-emerald-500" : "text-muted-foreground"
      }`}
    >
      <span
        className={`inline-flex items-center justify-center w-5 h-5 rounded-full border text-[10px] ${
          active
            ? "border-brand bg-brand/10"
            : done
              ? "border-emerald-500 bg-emerald-500/10"
              : "border-border"
        }`}
      >
        {n}
      </span>
      {label}
    </div>
  );
}

function Arrow() {
  return <span className="text-muted-foreground/60 text-xs">→</span>;
}

// ── Mini-eksempler ────────────────────────────────────────────────────────────

function HistEx() {
  const bars = [3, 6, 11, 16, 14, 9, 4, 2];
  const max = Math.max(...bars);
  return (
    <svg viewBox="0 0 200 80" className="w-full">
      {bars.map((b, i) => (
        <rect
          key={i}
          x={10 + i * 22}
          y={70 - (b / max) * 55}
          width={20}
          height={(b / max) * 55}
          fill="#3b82f6"
          opacity={0.7}
        />
      ))}
      <line
        x1={5}
        y1={70}
        x2={195}
        y2={70}
        stroke="currentColor"
        className="text-muted-foreground"
      />
    </svg>
  );
}

function BarEx() {
  const cats = [
    { lbl: "A", v: 30 },
    { lbl: "B", v: 18 },
    { lbl: "C", v: 12 },
    { lbl: "D", v: 8 },
  ];
  const max = Math.max(...cats.map((c) => c.v));
  return (
    <svg viewBox="0 0 200 80" className="w-full">
      {cats.map((c, i) => (
        <g key={c.lbl}>
          <rect
            x={20 + i * 42}
            y={70 - (c.v / max) * 55}
            width={32}
            height={(c.v / max) * 55}
            fill="#22c55e"
            opacity={0.7}
          />
          <text
            x={36 + i * 42}
            y={78}
            fontSize={8}
            className="fill-muted-foreground"
            textAnchor="middle"
          >
            {c.lbl}
          </text>
        </g>
      ))}
    </svg>
  );
}

function BoxEx() {
  return (
    <svg viewBox="0 0 200 60" className="w-full">
      <line
        x1={30}
        y1={30}
        x2={170}
        y2={30}
        stroke="currentColor"
        className="text-muted-foreground"
      />
      <line
        x1={30}
        y1={20}
        x2={30}
        y2={40}
        stroke="currentColor"
        className="text-muted-foreground"
      />
      <line
        x1={170}
        y1={20}
        x2={170}
        y2={40}
        stroke="currentColor"
        className="text-muted-foreground"
      />
      <rect x={70} y={15} width={70} height={30} fill="#3b82f6" opacity={0.25} stroke="#3b82f6" />
      <line x1={105} y1={15} x2={105} y2={45} stroke="#f59e0b" strokeWidth={2} />
    </svg>
  );
}

function ScatterEx() {
  const pts = [
    [20, 60],
    [40, 55],
    [60, 48],
    [80, 42],
    [100, 38],
    [120, 30],
    [140, 25],
    [160, 18],
    [180, 12],
    [45, 30],
    [110, 50],
    [80, 22],
  ];
  return (
    <svg viewBox="0 0 200 80" className="w-full">
      <line
        x1={10}
        y1={70}
        x2={190}
        y2={70}
        stroke="currentColor"
        className="text-muted-foreground"
      />
      <line
        x1={10}
        y1={10}
        x2={10}
        y2={70}
        stroke="currentColor"
        className="text-muted-foreground"
      />
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={3} fill="#3b82f6" />
      ))}
    </svg>
  );
}

function LineEx() {
  const ys = [40, 38, 42, 35, 28, 30, 22, 18, 24, 15];
  const path = ys.map((y, i) => `${i === 0 ? "M" : "L"}${15 + i * 18},${y + 10}`).join(" ");
  return (
    <svg viewBox="0 0 200 80" className="w-full">
      <line
        x1={10}
        y1={70}
        x2={190}
        y2={70}
        stroke="currentColor"
        className="text-muted-foreground"
      />
      <path d={path} fill="none" stroke="#22c55e" strokeWidth={2} />
      {ys.map((y, i) => (
        <circle key={i} cx={15 + i * 18} cy={y + 10} r={2.5} fill="#22c55e" />
      ))}
    </svg>
  );
}

function GroupedBoxEx() {
  const make = (x: number, q1: number, med: number, q3: number) => (
    <g>
      <rect
        x={x - 14}
        y={q1}
        width={28}
        height={q3 - q1}
        fill="#3b82f6"
        opacity={0.3}
        stroke="#3b82f6"
      />
      <line x1={x - 14} y1={med} x2={x + 14} y2={med} stroke="#f59e0b" strokeWidth={2} />
    </g>
  );
  return (
    <svg viewBox="0 0 200 80" className="w-full">
      <line
        x1={10}
        y1={70}
        x2={190}
        y2={70}
        stroke="currentColor"
        className="text-muted-foreground"
      />
      {make(50, 30, 40, 55)}
      {make(100, 20, 32, 50)}
      {make(150, 35, 48, 60)}
      <text x={50} y={78} fontSize={8} className="fill-muted-foreground" textAnchor="middle">
        A
      </text>
      <text x={100} y={78} fontSize={8} className="fill-muted-foreground" textAnchor="middle">
        B
      </text>
      <text x={150} y={78} fontSize={8} className="fill-muted-foreground" textAnchor="middle">
        C
      </text>
    </svg>
  );
}

function HeatEx() {
  const cells = Array.from({ length: 16 }, (_, i) => ({
    r: i % 4,
    c: Math.floor(i / 4),
    v: ((i * 37) % 100) / 100,
  }));
  return (
    <svg viewBox="0 0 100 80" className="w-full max-w-[160px] mx-auto">
      {cells.map((c, i) => (
        <rect
          key={i}
          x={10 + c.c * 18}
          y={5 + c.r * 18}
          width={16}
          height={16}
          fill="#3b82f6"
          opacity={0.2 + c.v * 0.7}
        />
      ))}
    </svg>
  );
}

function ScatterMatrixEx() {
  return (
    <svg viewBox="0 0 200 80" className="w-full">
      {[0, 1, 2].map((r) =>
        [0, 1, 2].map((c) => (
          <g key={`${r}${c}`} transform={`translate(${10 + c * 62}, ${5 + r * 24})`}>
            <rect
              width={56}
              height={20}
              fill="none"
              stroke="currentColor"
              className="text-muted-foreground/30"
            />
            {Array.from({ length: 6 }, (_, i) => (
              <circle
                key={i}
                cx={5 + i * 9 + ((r * c) % 4)}
                cy={5 + ((i * (r + 1)) % 12)}
                r={1.5}
                fill="#3b82f6"
              />
            ))}
          </g>
        )),
      )}
    </svg>
  );
}
