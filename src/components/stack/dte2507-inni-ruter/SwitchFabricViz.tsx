import { useState } from "react";

type Mode = "memory" | "bus" | "crossbar";

const MODES: { id: Mode; label: string; sub: string }[] = [
  { id: "memory", label: "Via memory", sub: "DMA · CPU-kopi · DMA" },
  { id: "bus", label: "Via bus", sub: "Delt buss · én pakke" },
  { id: "crossbar", label: "Via crossbar", sub: "N×N matrise · parallell" },
];

export function SwitchFabricViz() {
  const [mode, setMode] = useState<Mode>("crossbar");

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="border-b border-border bg-muted/30 px-4 py-2 flex items-center justify-between gap-2 flex-wrap">
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          Switch fabric — tre arkitekturer
        </div>
        <div className="flex gap-1.5">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                mode === m.id
                  ? "bg-brand text-brand-foreground"
                  : "border border-border bg-card hover:border-brand/40 text-foreground"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-[1fr_240px]">
        <div className="bg-background p-4">
          <svg viewBox="0 0 500 280" className="w-full h-auto" role="img" aria-label={`Switch fabric: ${mode}`}>
            {/* Input ports (left) */}
            {[0, 1, 2].map((i) => (
              <g key={`in-${i}`}>
                <rect x={20} y={40 + i * 70} width={70} height={36} rx={6}
                  className="fill-muted stroke-border" strokeWidth={1} />
                <text x={55} y={62 + i * 70} textAnchor="middle" className="fill-foreground" fontSize={10} fontFamily="monospace">
                  in{i + 1}
                </text>
              </g>
            ))}
            {/* Output ports (right) */}
            {[0, 1, 2].map((i) => (
              <g key={`out-${i}`}>
                <rect x={410} y={40 + i * 70} width={70} height={36} rx={6}
                  className="fill-muted stroke-border" strokeWidth={1} />
                <text x={445} y={62 + i * 70} textAnchor="middle" className="fill-foreground" fontSize={10} fontFamily="monospace">
                  out{i + 1}
                </text>
              </g>
            ))}

            {mode === "memory" && (
              <g>
                {/* DMA → RAM → CPU → RAM → DMA out */}
                <rect x={180} y={100} width={140} height={60} rx={8}
                  className="fill-brand/10 stroke-brand" strokeWidth={1.2} />
                <text x={250} y={125} textAnchor="middle" className="fill-foreground" fontSize={11} fontWeight={600}>
                  Shared RAM
                </text>
                <text x={250} y={142} textAnchor="middle" className="fill-muted-foreground" fontSize={9}>
                  CPU kopierer
                </text>
                <text x={250} y={155} textAnchor="middle" className="fill-muted-foreground" fontSize={9}>
                  in→mem→out
                </text>
                {[0, 1, 2].map((i) => (
                  <g key={`mem-${i}`}>
                    <line x1={90} y1={58 + i * 70} x2={180} y2={130}
                      className="stroke-brand/60" strokeWidth={1.2} strokeDasharray="3 2" />
                    <line x1={320} y1={130} x2={410} y2={58 + i * 70}
                      className="stroke-brand/60" strokeWidth={1.2} strokeDasharray="3 2" />
                  </g>
                ))}
                <text x={250} y={195} textAnchor="middle" className="fill-amber-600 dark:fill-amber-400" fontSize={10}>
                  Throughput &lt; minnebåndbredde / 2
                </text>
                <text x={250} y={210} textAnchor="middle" className="fill-muted-foreground" fontSize={9}>
                  (hver pakke krysser bussen 2 ganger)
                </text>
              </g>
            )}

            {mode === "bus" && (
              <g>
                {/* Single horizontal bus */}
                <rect x={120} y={150} width={260} height={14} rx={4}
                  className="fill-brand/15 stroke-brand" strokeWidth={1.2} />
                <text x={250} y={183} textAnchor="middle" className="fill-foreground" fontSize={10} fontFamily="monospace">
                  shared bus
                </text>
                {[0, 1, 2].map((i) => (
                  <g key={`bus-${i}`}>
                    <line x1={90} y1={58 + i * 70} x2={150 + i * 60} y2={150}
                      className="stroke-brand/60" strokeWidth={1.2} />
                    <line x1={350 - i * 60} y1={164} x2={410} y2={58 + i * 70}
                      className="stroke-brand/60" strokeWidth={1.2} />
                  </g>
                ))}
                {/* Token: only one packet on bus */}
                <circle cx={200} cy={157} r={6} className="fill-amber-500" />
                <text x={200} y={141} textAnchor="middle" className="fill-amber-700 dark:fill-amber-300" fontSize={9}>
                  pakke
                </text>
                <text x={250} y={220} textAnchor="middle" className="fill-amber-600 dark:fill-amber-400" fontSize={10}>
                  Én pakke om gangen — bus-kapasitet er taket
                </text>
              </g>
            )}

            {mode === "crossbar" && (
              <g>
                {/* 3x3 crossbar grid */}
                {[0, 1, 2].map((i) =>
                  [0, 1, 2].map((j) => {
                    const cx = 170 + j * 60;
                    const cy = 58 + i * 70;
                    // Highlight diagonal as "open" matches in this example
                    const active = (i === 0 && j === 1) || (i === 1 && j === 2) || (i === 2 && j === 0);
                    return (
                      <g key={`cb-${i}-${j}`}>
                        <line x1={cx} y1={cy - 18} x2={cx} y2={cy + 18}
                          className="stroke-border" strokeWidth={1} />
                        <line x1={cx - 24} y1={cy} x2={cx + 24} y2={cy}
                          className="stroke-border" strokeWidth={1} />
                        <circle cx={cx} cy={cy} r={6}
                          className={active ? "fill-brand stroke-brand" : "fill-card stroke-border"}
                          strokeWidth={1.2} />
                      </g>
                    );
                  })
                )}
                {/* Connect input rails */}
                {[0, 1, 2].map((i) => (
                  <line key={`r-${i}`} x1={90} y1={58 + i * 70} x2={170} y2={58 + i * 70}
                    className="stroke-brand/40" strokeWidth={1} />
                ))}
                {[0, 1, 2].map((j) => (
                  <line key={`c-${j}`} x1={170 + j * 60} y1={40} x2={170 + j * 60} y2={216}
                    className="stroke-brand/20" strokeWidth={0.7} />
                ))}
                {/* Connect output rails */}
                {[0, 1, 2].map((i) => (
                  <line key={`ro-${i}`} x1={290} y1={58 + i * 70} x2={410} y2={58 + i * 70}
                    className="stroke-brand/40" strokeWidth={1} />
                ))}
                <text x={250} y={250} textAnchor="middle" className="fill-emerald-600 dark:fill-emerald-400" fontSize={10}>
                  Tre pakker samtidig hvis ut-portene er ulike
                </text>
                <text x={250} y={264} textAnchor="middle" className="fill-muted-foreground" fontSize={9}>
                  Ikke-blokkerende crossbar — N² koblingspunkter
                </text>
              </g>
            )}
          </svg>
        </div>

        <aside className="border-t md:border-t-0 md:border-l border-border bg-background p-4 text-sm flex flex-col gap-3">
          {MODES.filter((m) => m.id === mode).map((m) => (
            <div key={m.id}>
              <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                {m.label}
              </div>
              <div className="text-xs font-mono text-brand">{m.sub}</div>
              <p className="mt-2 text-[11px] text-muted-foreground leading-relaxed">
                {m.id === "memory" &&
                  "Klassisk PC-arkitektur som ruter: pakke leses inn via DMA, CPU bestemmer ut-port, kopierer til ut-buffer, DMA sender ut. Begrenset av minnebussen som krysses TO ganger per pakke. Bra for sjeldne pakker — håpløst for backbone-rutere."}
                {m.id === "bus" &&
                  "Linjekortene deler én buss internt. Hvert kort kjenner sin egen ut-adresse og plukker pakker fra bussen som er adressert til det. Skalerer dårlig — backplane-bussen er flaskehalsen. Cisco Catalyst 5500 var typisk slik."}
                {m.id === "crossbar" &&
                  "Matrise av kryssbrytere lukkes ved (input, output)-par. Flere par kan være aktive samtidig så lenge de ikke deler en kolonne (output). Linje-kort kobles via fabric scheduler. Skaleres med Clos-design til titusen-port-rutere."}
              </p>
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
}
