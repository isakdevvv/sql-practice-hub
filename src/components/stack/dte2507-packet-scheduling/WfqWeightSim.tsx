import { useMemo, useState } from "react";

const CLS_COLOR = [
  { fill: "#bfdbfe", stroke: "#3b82f6", text: "#1e3a8a", label: "Klasse 1" },
  { fill: "#fed7aa", stroke: "#f97316", text: "#7c2d12", label: "Klasse 2" },
];

function wfqOutput(w1: number, w2: number, n: number): number[] {
  // Begge klasser har alltid pakker (backlogged). Bruker enkel deficit/credits-modell.
  let credit1 = 0;
  let credit2 = 0;
  const out: number[] = [];
  for (let t = 0; t < n; t++) {
    credit1 += w1;
    credit2 += w2;
    if (credit1 / Math.max(w1, 0.0001) >= credit2 / Math.max(w2, 0.0001)) {
      out.push(0); // klasse 1
      credit1 -= w1 + w2;
    } else {
      out.push(1); // klasse 2
      credit2 -= w1 + w2;
    }
  }
  return out;
}

const TOTAL = 16;

export function WfqWeightSim() {
  const [w1, setW1] = useState(3);
  const [w2, setW2] = useState(1);
  const order = useMemo(() => wfqOutput(w1, w2, TOTAL), [w1, w2]);
  const share1 = order.filter((x) => x === 0).length;
  const share2 = order.filter((x) => x === 1).length;
  const expected1 = Math.round((100 * w1) / (w1 + w2));
  const expected2 = 100 - expected1;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="border-b border-border bg-muted/30 px-4 py-2 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
        WFQ — to backlog-bundne klasser
      </div>

      <div className="grid md:grid-cols-[1fr_240px]">
        <div className="bg-background p-4">
          <div className="flex flex-wrap gap-1.5 mb-4">
            {order.map((c, i) => {
              const col = CLS_COLOR[c];
              return (
                <div key={i} className="flex flex-col items-center">
                  <div
                    className="w-9 h-9 rounded-md flex items-center justify-center text-xs font-bold font-mono"
                    style={{ background: col.fill, border: `1.5px solid ${col.stroke}`, color: col.text }}
                  >
                    {c + 1}
                  </div>
                  <span className="text-[9px] text-muted-foreground font-mono mt-0.5">t={i}</span>
                </div>
              );
            })}
          </div>
          <div className="text-xs text-muted-foreground leading-relaxed">
            Pilen viser hvilken klasse som faktisk får sende sin pakke pr. tids­slot, gitt vektene.
          </div>

          {/* Stacked share bar */}
          <div className="mt-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">
              Faktisk båndbredde-andel ({TOTAL} slots)
            </div>
            <div className="flex h-6 rounded-md overflow-hidden border border-border">
              <div
                className="flex items-center justify-center text-[10px] font-mono"
                style={{
                  width: `${(share1 / TOTAL) * 100}%`,
                  background: CLS_COLOR[0].fill,
                  color: CLS_COLOR[0].text,
                }}
              >
                {share1}/{TOTAL}
              </div>
              <div
                className="flex items-center justify-center text-[10px] font-mono"
                style={{
                  width: `${(share2 / TOTAL) * 100}%`,
                  background: CLS_COLOR[1].fill,
                  color: CLS_COLOR[1].text,
                }}
              >
                {share2}/{TOTAL}
              </div>
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground font-mono">
              Forventet (w<sub>1</sub>/Σw, w<sub>2</sub>/Σw): {expected1}% / {expected2}%
            </div>
          </div>
        </div>

        <aside className="border-t md:border-t-0 md:border-l border-border bg-background p-4 text-sm flex flex-col gap-4">
          <div>
            <label htmlFor="w1" className="flex items-center justify-between text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              <span>Vekt w<sub>1</sub></span>
              <span className="font-mono text-foreground text-base">{w1}</span>
            </label>
            <input
              id="w1"
              type="range"
              min={1}
              max={6}
              value={w1}
              onChange={(e) => setW1(parseInt(e.target.value))}
              className="w-full accent-blue-500 mt-1"
            />
          </div>
          <div>
            <label htmlFor="w2" className="flex items-center justify-between text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              <span>Vekt w<sub>2</sub></span>
              <span className="font-mono text-foreground text-base">{w2}</span>
            </label>
            <input
              id="w2"
              type="range"
              min={1}
              max={6}
              value={w2}
              onChange={(e) => setW2(parseInt(e.target.value))}
              className="w-full accent-orange-500 mt-1"
            />
          </div>
          <div className="rounded-md border border-border bg-muted/30 p-2 text-[11px] leading-relaxed">
            <div className="font-semibold text-foreground">Formel</div>
            <p className="font-mono text-muted-foreground mt-1">
              R<sub>i</sub> = R · w<sub>i</sub> / Σ w<sub>j</sub>
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
