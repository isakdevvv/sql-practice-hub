import { useState } from "react";

type Level = "direct" | "single" | "double" | "triple";

const LEVELS: Record<
  Level,
  { label: string; capacity: string; explain: string; color: string }
> = {
  direct: {
    label: "12 direkte",
    capacity: "12 × 4 KiB = 48 KiB",
    explain:
      "12 av inodens 15 pointer-slots peker direkte til datablokker. Null ekstra disk-IO for små filer — pointerne ligger inne i selve inoden.",
    color: "emerald",
  },
  single: {
    label: "1 indirekte",
    capacity: "1024 × 4 KiB = 4 MiB",
    explain:
      "Slot 13 peker til en blokk som inneholder 1024 pointere. Ett ekstra disk-oppslag, men dekker filer opp til ~4 MiB.",
    color: "sky",
  },
  double: {
    label: "1 dobbel-indirekte",
    capacity: "1024² × 4 KiB = 4 GiB",
    explain:
      "Slot 14 peker til en blokk med 1024 pointere — som hver peker til en blokk med 1024 pointere. To ekstra oppslag, dekker filer opp til ~4 GiB.",
    color: "violet",
  },
  triple: {
    label: "1 trippel-indirekte",
    capacity: "1024³ × 4 KiB = 4 TiB",
    explain:
      "Slot 15: tre nivåer pointer-blokker. Tre ekstra oppslag, men dekker filer opp til ~4 TiB. Brukes svært sjelden i praksis.",
    color: "rose",
  },
};

export function InodeDiagram() {
  const [active, setActive] = useState<Level>("direct");
  const cur = LEVELS[active];

  const colorMap: Record<string, { stroke: string; fill: string; text: string }> = {
    emerald: {
      stroke: "stroke-emerald-500",
      fill: "fill-emerald-500/20",
      text: "text-emerald-600 dark:text-emerald-400",
    },
    sky: {
      stroke: "stroke-sky-500",
      fill: "fill-sky-500/20",
      text: "text-sky-600 dark:text-sky-400",
    },
    violet: {
      stroke: "stroke-violet-500",
      fill: "fill-violet-500/20",
      text: "text-violet-600 dark:text-violet-400",
    },
    rose: {
      stroke: "stroke-rose-500",
      fill: "fill-rose-500/20",
      text: "text-rose-600 dark:text-rose-400",
    },
  };
  const c = colorMap[cur.color];

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap gap-2 mb-4">
        {(Object.keys(LEVELS) as Level[]).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setActive(k)}
            className={`text-xs font-mono px-3 py-1.5 rounded-md border transition-colors ${
              active === k
                ? "bg-brand text-brand-foreground border-brand"
                : "border-border hover:bg-muted"
            }`}
          >
            {LEVELS[k].label}
          </button>
        ))}
      </div>

      <svg
        viewBox="0 0 640 320"
        className="w-full h-auto max-h-80 bg-muted/30 rounded-lg"
        role="img"
        aria-label="Inode pointer-diagram"
      >
        {/* Inode-boks */}
        <rect
          x="10"
          y="50"
          width="120"
          height="220"
          rx="6"
          className="fill-card stroke-border"
          strokeWidth="1.5"
        />
        <text x="70" y="42" textAnchor="middle" className="fill-foreground text-[12px] font-semibold">
          inode (256 B)
        </text>

        {/* 15 pointer-slots */}
        {Array.from({ length: 15 }).map((_, i) => {
          const y = 60 + i * 14;
          let levelOf: Level;
          if (i < 12) levelOf = "direct";
          else if (i === 12) levelOf = "single";
          else if (i === 13) levelOf = "double";
          else levelOf = "triple";
          const isActive = levelOf === active;
          const lc = colorMap[LEVELS[levelOf].color];
          return (
            <g key={i}>
              <rect
                x="20"
                y={y}
                width="100"
                height="12"
                rx="2"
                className={`${isActive ? lc.fill : "fill-muted/40"} ${isActive ? lc.stroke : "stroke-border"}`}
                strokeWidth="1"
              />
              <text
                x="25"
                y={y + 9}
                className={`fill-foreground text-[9px] font-mono ${isActive ? "font-bold" : ""}`}
              >
                i_block[{i}]
              </text>
            </g>
          );
        })}

        {/* Direct */}
        {active === "direct" && (
          <g>
            <line x1="130" y1="120" x2="200" y2="120" className={c.stroke} strokeWidth="1.5" />
            <rect x="200" y="100" width="100" height="40" rx="4" className={`${c.fill} ${c.stroke}`} strokeWidth="1.5" />
            <text x="250" y="125" textAnchor="middle" className="fill-foreground text-[11px] font-mono">
              data-blokk
            </text>
            <text x="250" y="160" textAnchor="middle" className="fill-muted-foreground text-[10px]">
              (12 stk)
            </text>
          </g>
        )}

        {/* Single indirect */}
        {active === "single" && (
          <g>
            <line x1="130" y1="228" x2="200" y2="180" className={c.stroke} strokeWidth="1.5" />
            <rect x="200" y="160" width="100" height="80" rx="4" className={`${c.fill} ${c.stroke}`} strokeWidth="1.5" />
            <text x="250" y="185" textAnchor="middle" className="fill-foreground text-[11px] font-mono">
              ptr-blokk
            </text>
            <text x="250" y="202" textAnchor="middle" className="fill-muted-foreground text-[9px]">
              1024 pointere
            </text>
            <line x1="300" y1="200" x2="370" y2="200" className={c.stroke} strokeWidth="1.5" />
            <rect x="370" y="180" width="100" height="40" rx="4" className="fill-card stroke-border" strokeWidth="1.5" />
            <text x="420" y="205" textAnchor="middle" className="fill-foreground text-[11px] font-mono">
              data
            </text>
          </g>
        )}

        {/* Double indirect */}
        {active === "double" && (
          <g>
            <line x1="130" y1="242" x2="180" y2="160" className={c.stroke} strokeWidth="1.5" />
            <rect x="180" y="140" width="80" height="60" rx="4" className={`${c.fill} ${c.stroke}`} strokeWidth="1.5" />
            <text x="220" y="165" textAnchor="middle" className="fill-foreground text-[10px] font-mono">
              ptr-blokk
            </text>
            <text x="220" y="183" textAnchor="middle" className="fill-muted-foreground text-[8px]">
              1024 ptr
            </text>
            <line x1="260" y1="170" x2="310" y2="170" className={c.stroke} strokeWidth="1.5" />
            <rect x="310" y="150" width="80" height="60" rx="4" className={`${c.fill} ${c.stroke}`} strokeWidth="1.5" />
            <text x="350" y="175" textAnchor="middle" className="fill-foreground text-[10px] font-mono">
              ptr-blokk
            </text>
            <text x="350" y="193" textAnchor="middle" className="fill-muted-foreground text-[8px]">
              1024 ptr
            </text>
            <line x1="390" y1="180" x2="440" y2="180" className={c.stroke} strokeWidth="1.5" />
            <rect x="440" y="160" width="80" height="40" rx="4" className="fill-card stroke-border" strokeWidth="1.5" />
            <text x="480" y="185" textAnchor="middle" className="fill-foreground text-[11px] font-mono">
              data
            </text>
          </g>
        )}

        {/* Triple indirect */}
        {active === "triple" && (
          <g>
            <line x1="130" y1="256" x2="160" y2="170" className={c.stroke} strokeWidth="1.5" />
            <rect x="160" y="150" width="70" height="50" rx="4" className={`${c.fill} ${c.stroke}`} strokeWidth="1.5" />
            <text x="195" y="175" textAnchor="middle" className="fill-foreground text-[9px] font-mono">
              ptr
            </text>
            <line x1="230" y1="175" x2="270" y2="175" className={c.stroke} strokeWidth="1.5" />
            <rect x="270" y="155" width="70" height="50" rx="4" className={`${c.fill} ${c.stroke}`} strokeWidth="1.5" />
            <text x="305" y="180" textAnchor="middle" className="fill-foreground text-[9px] font-mono">
              ptr
            </text>
            <line x1="340" y1="180" x2="380" y2="180" className={c.stroke} strokeWidth="1.5" />
            <rect x="380" y="160" width="70" height="50" rx="4" className={`${c.fill} ${c.stroke}`} strokeWidth="1.5" />
            <text x="415" y="185" textAnchor="middle" className="fill-foreground text-[9px] font-mono">
              ptr
            </text>
            <line x1="450" y1="185" x2="490" y2="185" className={c.stroke} strokeWidth="1.5" />
            <rect x="490" y="165" width="70" height="40" rx="4" className="fill-card stroke-border" strokeWidth="1.5" />
            <text x="525" y="190" textAnchor="middle" className="fill-foreground text-[10px] font-mono">
              data
            </text>
          </g>
        )}
      </svg>

      <div className="mt-4 rounded-lg border border-border bg-muted/30 p-3">
        <div className={`text-xs uppercase tracking-wider font-semibold mb-1 ${c.text}`}>
          {cur.label} — {cur.capacity}
        </div>
        <p className="text-sm text-muted-foreground">{cur.explain}</p>
      </div>
    </div>
  );
}
