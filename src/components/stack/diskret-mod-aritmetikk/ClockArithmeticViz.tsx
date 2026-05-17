import { useEffect, useMemo, useRef, useState } from "react";
import { mod } from "./modUtils";

type Op = "+" | "-" | "*";

const N_CHOICES = [5, 7, 12, 17, 24] as const;

/**
 * Visualisering av modulær aritmetikk på en klokke:
 *  - Velg n (antall posisjoner).
 *  - Skriv inn a og b (kan være negativ eller stor) og velg operasjon.
 *  - Animasjon: viser hvor mange hele runder + sluttposisjon, geometrisk.
 *
 * Pedagogisk mål: "27 mod 12 = 3" ses som "2 hele runder + 3 steg".
 */
export function ClockArithmeticViz() {
  const [n, setN] = useState<number>(12);
  const [a, setA] = useState<number>(27);
  const [b, setB] = useState<number>(5);
  const [op, setOp] = useState<Op>("+");
  const [playing, setPlaying] = useState(false);
  const [tick, setTick] = useState(0);

  // Total tilbakelagte steg fra 0 (signed) — det er det vi animerer.
  const totalSteps = useMemo(() => {
    if (op === "+") return a + b;
    if (op === "-") return a - b;
    // For ganging: vi animerer som a kopier av b steg (eller motsatt).
    return a * b;
  }, [a, b, op]);

  const finalPos = mod(totalSteps, n);

  // Antall hele runder (med tegn): floor(totalSteps / n).
  const fullLaps = Math.floor(totalSteps / n);
  const lapsAbs = Math.abs(fullLaps);

  // Animasjon: tick representerer "hvor langt rundt vi har kommet".
  // Vi animerer maks ~3 runder visuelt for å unngå evighetsanimasjoner,
  // men remainder + total-tellingen er alltid korrekt i UI-en.
  const animSteps = Math.min(Math.abs(totalSteps), n * 3 + Math.abs(finalPos));
  const animDirection = totalSteps >= 0 ? 1 : -1;

  // Animer ved knappetrykk eller endring i input.
  const rafRef = useRef<number | null>(null);
  useEffect(() => {
    if (!playing) return;
    let start: number | null = null;
    const dur = Math.max(800, Math.min(animSteps * 90, 3500));
    const step = (ts: number) => {
      if (start === null) start = ts;
      const elapsed = ts - start;
      const frac = Math.min(elapsed / dur, 1);
      const cur = Math.round(frac * animSteps) * animDirection;
      setTick(cur);
      if (frac < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setPlaying(false);
      }
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [playing, animSteps, animDirection]);

  const animatedPos = mod(tick, n);
  const lapsSoFar = Math.floor(Math.abs(tick) / n);

  return (
    <div className="rounded-2xl border border-border bg-card p-4 not-prose">
      <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-3">
        Klokke-aritmetikk — geometrisk mod n
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div>
          <ClockSvg
            n={n}
            currentPos={playing ? animatedPos : finalPos}
            finalPos={finalPos}
            traceFrom={0}
            traceTo={playing ? tick : totalSteps}
          />
          <div className="mt-2 text-[11px] text-muted-foreground text-center space-y-0.5">
            <div>
              Klokke med <span className="font-mono text-foreground">{n}</span>{" "}
              posisjoner.
            </div>
            <div>
              {playing ? (
                <>
                  Animerer:{" "}
                  <span className="font-mono text-foreground">{tick}</span> steg
                  &nbsp;·&nbsp; runder så langt:{" "}
                  <span className="font-mono text-foreground">{lapsSoFar}</span>
                </>
              ) : (
                <>
                  Sluttposisjon:{" "}
                  <span className="font-mono text-emerald-500">{finalPos}</span>{" "}
                  &nbsp;·&nbsp; hele runder:{" "}
                  <span className="font-mono text-foreground">
                    {fullLaps >= 0 ? lapsAbs : `-${lapsAbs}`}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <div className="text-muted-foreground mb-1">modulus n</div>
            <div className="flex gap-1">
              {N_CHOICES.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => {
                    setN(v);
                    setTick(0);
                  }}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono border ${
                    n === v
                      ? "border-brand bg-brand/15"
                      : "border-border bg-background hover:bg-muted"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <label className="block space-y-1">
            <span className="text-muted-foreground">
              a (kan være negativ eller stor)
            </span>
            <input
              type="number"
              value={a}
              onChange={(e) => {
                setA(Number.parseInt(e.target.value || "0", 10));
                setTick(0);
              }}
              className="w-full rounded border border-border bg-background px-2 py-1 font-mono text-xs"
            />
            <span className="text-[10px] text-muted-foreground">
              a mod {n} ={" "}
              <span className="text-foreground font-mono">{mod(a, n)}</span>
            </span>
          </label>

          <div>
            <div className="text-muted-foreground mb-1">operasjon</div>
            <div className="flex gap-1">
              {(["+", "-", "*"] as const).map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => {
                    setOp(o);
                    setTick(0);
                  }}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono border ${
                    op === o
                      ? "border-brand bg-brand/15"
                      : "border-border bg-background hover:bg-muted"
                  }`}
                >
                  a {o} b
                </button>
              ))}
            </div>
          </div>

          <label className="block space-y-1">
            <span className="text-muted-foreground">b</span>
            <input
              type="number"
              value={b}
              onChange={(e) => {
                setB(Number.parseInt(e.target.value || "0", 10));
                setTick(0);
              }}
              className="w-full rounded border border-border bg-background px-2 py-1 font-mono text-xs"
            />
            <span className="text-[10px] text-muted-foreground">
              b mod {n} ={" "}
              <span className="text-foreground font-mono">{mod(b, n)}</span>
            </span>
          </label>

          <div className="rounded-md border border-border bg-background p-3 font-mono text-[11px] space-y-1">
            <div className="text-muted-foreground">
              {a} {op} {b} = {totalSteps}
            </div>
            <div>
              ({a} {op} {b}) mod {n} ={" "}
              <span className="text-emerald-500">{finalPos}</span>
            </div>
            <div className="text-[10px] text-muted-foreground border-t border-border pt-1 mt-1">
              {fullLaps >= 0 ? lapsAbs : `-${lapsAbs}`} {fullLaps >= 0 ? "hele runder" : "hele runder (mot urviser)"} +{" "}
              {finalPos} steg
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setTick(0);
              setPlaying(true);
            }}
            disabled={playing || totalSteps === 0}
            className="w-full px-3 py-1.5 rounded text-[11px] border border-brand bg-brand/10 hover:bg-brand/20 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {playing ? "Animerer…" : "Animer rotasjon"}
          </button>

          <div className="text-[10px] text-muted-foreground leading-relaxed border-t border-border pt-2">
            <strong className="text-foreground">Klokke-intuisjonen:</strong> "27 mod 12 = 3" er ikke en
            tilfeldig regneoperasjon — det er <em>fysikken</em> på en 12-timers klokke. Start på 12 (=0),
            gå 27 steg framover. Du runder klokka to ganger og lander på 3.
            Den modulære aritmetikken er bare det som <em>er igjen</em> etter at vi har
            telt alle hele runder.
          </div>
        </div>
      </div>
    </div>
  );
}

function ClockSvg({
  n,
  currentPos,
  finalPos,
  traceFrom: _traceFrom,
  traceTo,
}: {
  n: number;
  currentPos: number;
  finalPos: number;
  traceFrom: number;
  traceTo: number;
}) {
  const cx = 140;
  const cy = 140;
  const r = 105;
  const dotR = n <= 12 ? 14 : n <= 17 ? 11 : 9;
  const fontSize = n <= 12 ? 10 : n <= 17 ? 9 : 8;

  // Visuell trace-bue fra 0 til traceTo (capped til ~3 runder for synlighet).
  const cappedTrace = Math.max(-n * 3, Math.min(traceTo, n * 3));
  const arc = buildSpiralArc(cx, cy, r - 22, n, cappedTrace);

  return (
    <svg viewBox="0 0 280 280" className="w-full max-w-sm mx-auto">
      <circle
        cx={cx}
        cy={cy}
        r={r}
        className="fill-transparent stroke-border"
        strokeWidth={1}
      />
      {/* Spiral-trace */}
      {arc && (
        <path
          d={arc}
          className="fill-none stroke-amber-500"
          strokeWidth={2}
          strokeLinecap="round"
          opacity={0.7}
        />
      )}
      {/* Posisjoner */}
      {Array.from({ length: n }).map((_, i) => {
        const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        const isFinal = i === finalPos;
        const isCurrent = i === currentPos;
        const isZero = i === 0;
        const fill = isCurrent
          ? "fill-emerald-500"
          : isFinal
            ? "fill-emerald-500/30"
            : isZero
              ? "fill-brand/40"
              : "fill-muted";
        const txt =
          isCurrent || isZero ? "fill-white" : "fill-foreground";
        return (
          <g key={i}>
            <circle
              cx={x}
              cy={y}
              r={dotR}
              className={`${fill} stroke-border`}
              strokeWidth={1}
            />
            <text
              x={x}
              y={y + fontSize / 2 - 1}
              textAnchor="middle"
              className={`${txt} font-mono font-semibold`}
              fontSize={fontSize}
            >
              {i}
            </text>
          </g>
        );
      })}
      {/* Senterpil — peker mot currentPos */}
      <CenterArrow cx={cx} cy={cy} r={r - 30} n={n} pos={currentPos} />
    </svg>
  );
}

function CenterArrow({
  cx,
  cy,
  r,
  n,
  pos,
}: {
  cx: number;
  cy: number;
  r: number;
  n: number;
  pos: number;
}) {
  const angle = (pos / n) * 2 * Math.PI - Math.PI / 2;
  const x2 = cx + r * Math.cos(angle);
  const y2 = cy + r * Math.sin(angle);
  return (
    <g>
      <circle cx={cx} cy={cy} r={3} className="fill-foreground" />
      <line
        x1={cx}
        y1={cy}
        x2={x2}
        y2={y2}
        className="stroke-emerald-500"
        strokeWidth={2.5}
        strokeLinecap="round"
      />
    </g>
  );
}

/**
 * Bygg en spiral-bue fra posisjon 0 til "steps" steg (signed), med
 * litt økende radius per runde slik at flere runder er visuelt synlige.
 */
function buildSpiralArc(
  cx: number,
  cy: number,
  baseR: number,
  n: number,
  steps: number,
): string | null {
  if (steps === 0) return null;
  const dir = steps >= 0 ? 1 : -1;
  const total = Math.abs(steps);
  const stepsPerSample = 1;
  const samples = Math.max(2, Math.ceil(total / stepsPerSample) + 1);
  const pts: string[] = [];
  for (let i = 0; i <= samples; i += 1) {
    const sFrac = i / samples;
    const traveled = sFrac * total * dir;
    const angle = (traveled / n) * 2 * Math.PI - Math.PI / 2;
    // Liten radius-økning per runde for at spiralen ikke overlapper helt.
    const lapsSoFar = Math.abs(traveled) / n;
    const rNow = baseR - Math.min(lapsSoFar * 8, 40);
    const x = cx + rNow * Math.cos(angle);
    const y = cy + rNow * Math.sin(angle);
    pts.push(`${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  return pts.join(" ");
}
