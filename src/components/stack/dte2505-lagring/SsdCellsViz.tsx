import { useMemo, useState } from "react";

// ---------------------------------------------------------------------------
// SsdCellsViz — visualiserer en NAND flash-celle og hvordan SLC/MLC/TLC/QLC
// bruker forskjellige antall spennings-nivåer for å lagre 1, 2, 3 eller 4 bit
// per celle. Pedagogisk poeng: flere bit per celle = tettere lagring og
// billigere per GB, men færre program/erase-sykler og lavere ytelse fordi
// terskel-nivåene blir tettere og krever mer sensitiv avlesning.
// ---------------------------------------------------------------------------

type CellType = "SLC" | "MLC" | "TLC" | "QLC";

type CellSpec = {
  bitsPerCell: number;
  levels: number;
  states: string[];
  pe: string;
  costPerGB: string;
  speed: string;
  useCase: string;
  color: string;
};

const SPECS: Record<CellType, CellSpec> = {
  SLC: {
    bitsPerCell: 1,
    levels: 2,
    states: ["0", "1"],
    pe: "~100 000",
    costPerGB: "høy",
    speed: "veldig rask",
    useCase: "enterprise cache, industri-SSD",
    color: "rgb(34 197 94)",
  },
  MLC: {
    bitsPerCell: 2,
    levels: 4,
    states: ["00", "01", "10", "11"],
    pe: "~3 000–10 000",
    costPerGB: "middels",
    speed: "rask",
    useCase: "tidlige consumer-SSD, server-mix",
    color: "rgb(59 130 246)",
  },
  TLC: {
    bitsPerCell: 3,
    levels: 8,
    states: ["000", "001", "010", "011", "100", "101", "110", "111"],
    pe: "~500–3 000",
    costPerGB: "lav",
    speed: "moderat",
    useCase: "default i moderne consumer-SSD",
    color: "rgb(234 179 8)",
  },
  QLC: {
    bitsPerCell: 4,
    levels: 16,
    states: Array.from({ length: 16 }, (_, i) => i.toString(2).padStart(4, "0")),
    pe: "~100–1 000",
    costPerGB: "veldig lav",
    speed: "tregere skriv",
    useCase: "lese-tunge load (media-arkiv, read cache)",
    color: "rgb(239 68 68)",
  },
};

export function SsdCellsViz() {
  const [cellType, setCellType] = useState<CellType>("TLC");
  const spec = SPECS[cellType];

  // For diagrammet: lag voltage-fordelinger som klokkekurver, én per state.
  const width = 480;
  const height = 160;
  const padding = { l: 30, r: 10, t: 10, b: 30 };
  const plotW = width - padding.l - padding.r;
  const plotH = height - padding.t - padding.b;

  const curves = useMemo(() => {
    const n = spec.levels;
    const sigma = 0.45 / n; // smalere kurver når flere nivåer → mer overlapp-fare.
    // sentre jevnt fordelt mellom 0.05 og 0.95 i normalisert voltage.
    return Array.from({ length: n }, (_, i) => {
      const mu = 0.05 + (0.9 * i) / (n - 1);
      const pts: string[] = [];
      const steps = 60;
      for (let k = 0; k <= steps; k++) {
        const x = (k / steps);
        const y = Math.exp(-((x - mu) ** 2) / (2 * sigma * sigma));
        pts.push(`${padding.l + x * plotW},${padding.t + plotH - y * plotH * 0.9}`);
      }
      return { d: `M${pts.join(" L")}`, mu, state: spec.states[i] };
    });
  }, [spec, plotW, plotH, padding.l, padding.t]);

  return (
    <div className="rounded-xl border-2 border-brand/30 bg-card p-4">
      <div className="flex flex-wrap gap-2 mb-4">
        {(Object.keys(SPECS) as CellType[]).map((c) => (
          <button
            key={c}
            onClick={() => setCellType(c)}
            className={`rounded-md border px-3 py-1.5 text-sm font-mono ${
              cellType === c ? "border-brand bg-brand/10 text-brand" : "bg-card hover:bg-accent"
            }`}
          >
            {c} <span className="text-xs text-muted-foreground">({SPECS[c].bitsPerCell} bit)</span>
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <div className="text-xs text-muted-foreground mb-1">
            Voltage-fordeling per state (idealisert)
          </div>
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full rounded-md bg-muted/30">
            {/* Akser */}
            <line
              x1={padding.l}
              y1={padding.t + plotH}
              x2={padding.l + plotW}
              y2={padding.t + plotH}
              stroke="rgb(255 255 255 / 0.3)"
            />
            <line
              x1={padding.l}
              y1={padding.t}
              x2={padding.l}
              y2={padding.t + plotH}
              stroke="rgb(255 255 255 / 0.3)"
            />
            {/* Akse-tekster */}
            <text
              x={padding.l + plotW / 2}
              y={height - 8}
              textAnchor="middle"
              className="fill-muted-foreground"
              fontSize="10"
            >
              voltage (Vt)
            </text>
            <text
              x={8}
              y={padding.t + plotH / 2}
              textAnchor="middle"
              transform={`rotate(-90, 8, ${padding.t + plotH / 2})`}
              className="fill-muted-foreground"
              fontSize="10"
            >
              celler
            </text>
            {/* Klokke-kurver */}
            {curves.map((c, i) => (
              <g key={i}>
                <path d={c.d} fill={spec.color} fillOpacity={0.15} stroke={spec.color} strokeWidth="1.2" />
                <text
                  x={padding.l + c.mu * plotW}
                  y={padding.t + plotH + 12}
                  textAnchor="middle"
                  className="fill-foreground font-mono"
                  fontSize="9"
                >
                  {c.state}
                </text>
              </g>
            ))}
          </svg>
          <div className="text-xs text-muted-foreground mt-2">
            Hver kurve er en "state": leser-elektronikken må skille spennings-nivåer fra
            hverandre. Med {spec.levels} nivåer er det {spec.levels - 1} terskler å treffe
            — feilrate øker etter hvert som cellene slites.
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <h4 className="font-semibold">{cellType} — {spec.bitsPerCell} bit per celle</h4>
          <ul className="space-y-1 text-sm">
            <li>
              <span className="text-muted-foreground">Spennings-nivåer:</span>{" "}
              <span className="font-mono">{spec.levels}</span>
            </li>
            <li>
              <span className="text-muted-foreground">Program/erase-sykler:</span>{" "}
              <span className="font-mono">{spec.pe}</span>
            </li>
            <li>
              <span className="text-muted-foreground">Kost per GB:</span> {spec.costPerGB}
            </li>
            <li>
              <span className="text-muted-foreground">Ytelse:</span> {spec.speed}
            </li>
            <li>
              <span className="text-muted-foreground">Typisk bruk:</span> {spec.useCase}
            </li>
          </ul>
          <div className="rounded-lg border bg-muted/30 p-3 text-xs">
            <strong>Tetthet vs holdbarhet — kjernen i SSD-design.</strong>
            <br />
            En QLC-celle pakker 4× så mye data som en SLC-celle på samme silisium-areal,
            men du må skille 16 nivåer i stedet for 2. Resultat: lavere kostnad, men også
            færre skriv før cellen blir upålitelig. Derfor finner du fortsatt SLC i
            enterprise-arbeid med høy skrive-rate, mens consumer-disker for det meste er TLC.
          </div>
        </div>
      </div>
    </div>
  );
}
