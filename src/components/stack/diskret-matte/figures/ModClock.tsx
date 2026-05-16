import { useMemo, useState } from "react";

export function ModClock() {
  const [n, setN] = useState(7);
  const [a, setA] = useState(17);
  const [b, setB] = useState(5);
  const [op, setOp] = useState<"+" | "·" | "^">("+");

  const aMod = mod(a, n);
  const bMod = mod(b, n);

  const fullResult = useMemo(() => {
    if (op === "+") return a + b;
    if (op === "·") return a * b;
    return Math.pow(a, b);
  }, [a, b, op]);
  const result = mod(fullResult, n);

  return (
    <div className="rounded-2xl border border-border bg-card p-4 not-prose">
      <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-3">
        Mod-klokke — visualiser a mod n
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <ClockSvg n={n} highlight={aMod} secondary={bMod} result={result} />
          <div className="mt-2 text-[11px] text-muted-foreground text-center">
            Klokke mod {n}. Rød = a mod n. Cyan = b mod n. Grønn = resultat.
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <label className="block space-y-1">
            <span className="text-muted-foreground">
              modulus n = <span className="text-foreground font-mono">{n}</span>
            </span>
            <input
              type="range"
              min={2}
              max={12}
              value={n}
              onChange={(e) => setN(Number.parseInt(e.target.value, 10))}
              className="w-full accent-brand"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-muted-foreground">
              a = <span className="text-foreground font-mono">{a}</span> &nbsp;→&nbsp; a mod {n} ={" "}
              <span className="text-rose-500 font-mono">{aMod}</span>
            </span>
            <input
              type="range"
              min={-20}
              max={50}
              value={a}
              onChange={(e) => setA(Number.parseInt(e.target.value, 10))}
              className="w-full accent-brand"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-muted-foreground">
              b = <span className="text-foreground font-mono">{b}</span> &nbsp;→&nbsp; b mod {n} ={" "}
              <span className="text-cyan-500 font-mono">{bMod}</span>
            </span>
            <input
              type="range"
              min={0}
              max={20}
              value={b}
              onChange={(e) => setB(Number.parseInt(e.target.value, 10))}
              className="w-full accent-brand"
            />
          </label>

          <div className="flex gap-1.5">
            {(["+", "·", "^"] as const).map((o) => (
              <button
                key={o}
                type="button"
                onClick={() => setOp(o)}
                className={`px-2.5 py-1 rounded text-[11px] font-mono border ${
                  op === o ? "border-brand bg-brand/15" : "border-border bg-background hover:bg-muted"
                }`}
              >
                a {o} b
              </button>
            ))}
          </div>

          <div className="rounded-md border border-border bg-background p-3 font-mono text-[11px] space-y-1">
            <div className="text-muted-foreground">
              {a} {op} {b} = {fullResult}
            </div>
            <div>
              ({a} {op} {b}) mod {n} ={" "}
              <span className="text-emerald-500">{result}</span>
            </div>
            <div className="text-[10px] text-muted-foreground border-t border-border pt-1 mt-1">
              ekvivalent: (({aMod}) {op} ({bMod})) mod {n} ={" "}
              <span className="text-emerald-500">{result}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function mod(a: number, n: number): number {
  return ((a % n) + n) % n;
}

function ClockSvg({
  n,
  highlight,
  secondary,
  result,
}: {
  n: number;
  highlight: number;
  secondary: number;
  result: number;
}) {
  const cx = 110;
  const cy = 110;
  const r = 85;
  return (
    <svg viewBox="0 0 220 220" className="w-full max-w-xs mx-auto">
      <circle cx={cx} cy={cy} r={r} className="fill-transparent stroke-border" strokeWidth={1} />
      {Array.from({ length: n }).map((_, i) => {
        const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        const isA = i === highlight;
        const isB = i === secondary;
        const isR = i === result;
        const fill = isR
          ? "fill-emerald-500"
          : isA
            ? "fill-rose-500"
            : isB
              ? "fill-cyan-500"
              : "fill-muted";
        const textCol = isA || isB || isR ? "fill-white" : "fill-foreground";
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={14} className={`${fill} stroke-border`} strokeWidth={1} />
            <text
              x={x}
              y={y + 4}
              textAnchor="middle"
              className={`${textCol} text-[10px] font-mono font-semibold`}
            >
              {i}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
