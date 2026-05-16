import { useState } from "react";

// Hasse-diagram: visualisering av en partiell orden.
// Knutene tegnes på «nivåer» basert på lengste kjede til bunn, og kun
// «umiddelbare» dekningsrelasjoner (cover) får kanter — transitiv lukning er
// implisitt.

type Node = { id: string; x: number; y: number };
type Cover = [string, string]; // [under, over] — under er mindre

const PRESETS: {
  id: string;
  label: string;
  desc: string;
  nodes: Node[];
  covers: Cover[];
}[] = [
  {
    id: "div24",
    label: "Delere av 24",
    desc: "Partiell orden «deler» på {1, 2, 3, 4, 6, 8, 12, 24}. Top = 24, bunn = 1.",
    nodes: [
      { id: "1", x: 150, y: 220 },
      { id: "2", x: 80, y: 165 },
      { id: "3", x: 220, y: 165 },
      { id: "4", x: 50, y: 110 },
      { id: "6", x: 150, y: 110 },
      { id: "8", x: 40, y: 55 },
      { id: "12", x: 180, y: 55 },
      { id: "24", x: 110, y: 10 },
    ],
    covers: [
      ["1", "2"], ["1", "3"],
      ["2", "4"], ["2", "6"],
      ["3", "6"],
      ["4", "8"], ["4", "12"],
      ["6", "12"],
      ["8", "24"], ["12", "24"],
    ],
  },
  {
    id: "power3",
    label: "Potensmengden 𝒫({a, b, c})",
    desc: "Partiell orden ⊆ på alle delmengder av {a, b, c}. 8 elementer.",
    nodes: [
      { id: "∅", x: 150, y: 220 },
      { id: "{a}", x: 70, y: 165 },
      { id: "{b}", x: 150, y: 165 },
      { id: "{c}", x: 230, y: 165 },
      { id: "{a,b}", x: 60, y: 100 },
      { id: "{a,c}", x: 150, y: 100 },
      { id: "{b,c}", x: 240, y: 100 },
      { id: "{a,b,c}", x: 150, y: 35 },
    ],
    covers: [
      ["∅", "{a}"], ["∅", "{b}"], ["∅", "{c}"],
      ["{a}", "{a,b}"], ["{a}", "{a,c}"],
      ["{b}", "{a,b}"], ["{b}", "{b,c}"],
      ["{c}", "{a,c}"], ["{c}", "{b,c}"],
      ["{a,b}", "{a,b,c}"], ["{a,c}", "{a,b,c}"], ["{b,c}", "{a,b,c}"],
    ],
  },
  {
    id: "chain",
    label: "Total orden (kjede)",
    desc: "Total orden er en spesiell partiell orden hvor alle elementer kan sammenlignes.",
    nodes: [
      { id: "1", x: 150, y: 220 },
      { id: "2", x: 150, y: 165 },
      { id: "3", x: 150, y: 110 },
      { id: "4", x: 150, y: 55 },
    ],
    covers: [["1", "2"], ["2", "3"], ["3", "4"]],
  },
];

export function HasseDiagram() {
  const [idx, setIdx] = useState(0);
  const preset = PRESETS[idx];

  return (
    <div className="rounded-2xl border border-border bg-card p-4 not-prose">
      <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
        Hasse-diagram — partiell orden visualisert
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Et Hasse-diagram tegner kun de <strong>umiddelbare</strong> «mindre-enn»-relasjonene.
        Transitivitet er implisitt: hvis du kan gå <em>oppover</em> via kanter fra a til b, så
        er a ≤ b.
      </p>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {PRESETS.map((p, i) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setIdx(i)}
            className={`px-2.5 py-1 rounded text-[11px] border ${
              i === idx
                ? "border-brand bg-brand/15 text-foreground"
                : "border-border bg-background hover:bg-muted"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <svg viewBox="0 0 300 240" className="w-full max-w-md mx-auto bg-background rounded-md border border-border">
        {preset.covers.map(([u, v], i) => {
          const nu = preset.nodes.find((n) => n.id === u)!;
          const nv = preset.nodes.find((n) => n.id === v)!;
          return (
            <line
              key={i}
              x1={nu.x}
              y1={nu.y}
              x2={nv.x}
              y2={nv.y}
              className="stroke-foreground/50"
              strokeWidth={1.4}
            />
          );
        })}
        {preset.nodes.map((n) => (
          <g key={n.id}>
            <rect
              x={n.x - 18}
              y={n.y - 11}
              width={36}
              height={22}
              rx={5}
              className="fill-card stroke-brand"
              strokeWidth={1.5}
            />
            <text
              x={n.x}
              y={n.y + 4}
              textAnchor="middle"
              className="fill-foreground text-[10px] font-mono font-semibold"
            >
              {n.id}
            </text>
          </g>
        ))}
      </svg>

      <div className="mt-3 text-[11px] text-muted-foreground italic">{preset.desc}</div>

      <div className="mt-3 rounded-md border border-border bg-background p-3 text-[11px] space-y-1">
        <div className="text-muted-foreground uppercase tracking-wider text-[9px] mb-1">
          Hvordan lese diagrammet
        </div>
        <div>● Hver firkant er et element.</div>
        <div>● Linjer er <em>dekninger</em> — den umiddelbare neste i orden.</div>
        <div>● a ≤ b ⇔ du kan gå <em>oppover</em> fra a til b via kanter.</div>
        <div>● Reflexivitet (a ≤ a) og transitivitet tegnes <em>aldri</em> — implisitt.</div>
      </div>
    </div>
  );
}
