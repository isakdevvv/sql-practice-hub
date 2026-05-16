import { useEffect, useMemo, useRef, useState } from "react";
import { Play, RotateCcw, Square } from "lucide-react";

// --------------------------------------------------------------------------
// Interaktiv Big-O-visualisering.
// Fire moduser:
//   1) growth   — linje-diagram over n med valgbare vekstrater
//   2) realtime — assume 10⁹ ops/sek, vis virkelig tid for hver klasse
//   3) race     — animert race mellom to algoritmer (lineær- vs binærsøk osv.)
//   4) quiz     — flervalgsspørsmål med kode-snippets, klassifiser Big-O
// --------------------------------------------------------------------------

type Mode = "growth" | "realtime" | "race" | "quiz";

const MODES: { id: Mode; label: string; sub: string }[] = [
  { id: "growth", label: "Vekstrate-kurver", sub: "Sammenlign hvor raskt T(n) vokser" },
  { id: "realtime", label: "Virkelig tid", sub: "Hvor lang tid bruker det egentlig?" },
  { id: "race", label: "Algoritme-race", sub: "Lineær- vs binærsøk i sanntid" },
  { id: "quiz", label: "Quiz", sub: "Les kode, gjett kompleksitet" },
];

const MODE_NOTE: Record<Mode, string> = {
  growth:
    "Veksraten er det eneste som betyr noe når n blir stor. Slå på log-y-aksen for å skille klassene visuelt — alle ser ut som linjer da, men stigningen viser klassen.",
  realtime:
    "Antar 10⁹ operasjoner per sekund (rask CPU). Tabellen viser hvor smertefullt eksponentiell og faktoriell blir — n=60 med 2ⁿ tar lengre tid enn universets alder.",
  race:
    "Samme sorterte datasett. Lineærsøk skanner ett-og-ett; binærsøk halverer for hvert steg. Med n=1000 vinner binærsøk nesten alltid innen ~10 sammenligninger.",
  quiz:
    "Mønstergjenkjenning — én løkke gir O(n), nestet gir O(n²), halvering gir O(log n), to nye kall per rekursjon gir O(2ⁿ).",
};

// ----------------------------------------------------------------------------
// Big-O-funksjoner og deres metadata
// ----------------------------------------------------------------------------

type Curve = {
  id: string;
  label: string;
  color: string;
  fn: (n: number) => number;
};

const CURVES: Curve[] = [
  { id: "1", label: "1", color: "#94a3b8", fn: () => 1 },
  { id: "logn", label: "log n", color: "#22c55e", fn: (n) => Math.log2(Math.max(1, n)) },
  { id: "n", label: "n", color: "#3b82f6", fn: (n) => n },
  { id: "nlogn", label: "n log n", color: "#06b6d4", fn: (n) => n * Math.log2(Math.max(1, n)) },
  { id: "n2", label: "n²", color: "#f59e0b", fn: (n) => n * n },
  { id: "n3", label: "n³", color: "#f97316", fn: (n) => n * n * n },
  { id: "2n", label: "2ⁿ", color: "#ef4444", fn: (n) => Math.pow(2, n) },
  { id: "nfact", label: "n!", color: "#a855f7", fn: factorial },
];

function factorial(n: number): number {
  if (n < 0) return NaN;
  if (n > 170) return Infinity; // overflow grense for JS Number
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

// ----------------------------------------------------------------------------
// Hoved-komponent
// ----------------------------------------------------------------------------

export function BigOVisualizer() {
  const [mode, setMode] = useState<Mode>("growth");

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      {/* Topp-bar med modus-velger */}
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Interaktiv visualisering
            </div>
            <div className="text-sm font-semibold">
              Big-O — føl vekstratene på kroppen
            </div>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                mode === m.id
                  ? "bg-brand text-brand-foreground border-brand"
                  : "border-border hover:bg-muted"
              }`}
              title={m.sub}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Visualisering */}
      <div className="p-4 sm:p-6 bg-background">
        {mode === "growth" && <GrowthMode />}
        {mode === "realtime" && <RealtimeMode />}
        {mode === "race" && <RaceMode />}
        {mode === "quiz" && <QuizMode />}
      </div>

      {/* Modus-notat */}
      <div className="px-4 py-3 border-t border-border bg-muted/20">
        <div className="text-xs text-muted-foreground italic">{MODE_NOTE[mode]}</div>
      </div>
    </div>
  );
}

// ============================================================================
// Modus 1: Vekstrate-kurver
// ============================================================================

function GrowthMode() {
  const [maxN, setMaxN] = useState(50);
  const [logY, setLogY] = useState(false);
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    "1": false,
    logn: true,
    n: true,
    nlogn: true,
    n2: true,
    n3: false,
    "2n": true,
    nfact: false,
  });
  const [hoverN, setHoverN] = useState<number | null>(null);

  const W = 680;
  const H = 320;
  const padL = 50;
  const padR = 16;
  const padT = 20;
  const padB = 36;

  // For n!-stabilitet bruker vi små n. For visning klipper vi y-aksen.
  // Bestem y-domene basert på påslåtte kurver, med fornuftige tak.
  const activeCurves = CURVES.filter((c) => enabled[c.id]);

  // Beregn y-tak: bruk 1.2 × n² ved maxN som baseline når n² er på,
  // ellers maks aktiv kurve ved maxN. Klipp for å unngå dominans fra eksp/fakultet.
  const yMax = useMemo(() => {
    if (logY) {
      // i log-skala: tak ved største endelige verdi
      let m = 1;
      for (const c of activeCurves) {
        const v = c.fn(maxN);
        if (Number.isFinite(v) && v > m) m = v;
      }
      return m;
    }
    // lineær: bruk n² (eller n log n hvis n² ikke er på) som referanse
    if (enabled.n2) return Math.max(10, maxN * maxN * 1.05);
    if (enabled.nlogn) return Math.max(10, maxN * Math.log2(Math.max(2, maxN)) * 1.5);
    if (enabled.n) return Math.max(10, maxN * 1.5);
    return 20;
  }, [maxN, logY, enabled, activeCurves]);

  const xToPx = (x: number) =>
    padL + (x / Math.max(1, maxN)) * (W - padL - padR);

  const yToPx = (y: number) => {
    if (logY) {
      const yLog = Math.log10(Math.max(1, y));
      const maxLog = Math.log10(Math.max(10, yMax));
      return padT + (1 - yLog / maxLog) * (H - padT - padB);
    }
    return padT + (1 - Math.min(1, y / yMax)) * (H - padT - padB);
  };

  // Sample-punkter per kurve
  const N_SAMPLES = 200;
  const paths = useMemo(() => {
    return activeCurves.map((c) => {
      const pts: string[] = [];
      let started = false;
      for (let i = 0; i <= N_SAMPLES; i++) {
        const x = (maxN * i) / N_SAMPLES;
        // For n! og 2ⁿ er domenet diskret — sample heltall
        const n = c.id === "nfact" || c.id === "2n" ? Math.round(x) : x;
        const y = c.fn(n);
        if (!Number.isFinite(y) || y <= 0) {
          // hopp over (særlig for log/eksp ved n=0)
          continue;
        }
        if (logY && y < 1) continue;
        // klipp til synlig y-område for å unngå at SVG-tegningen ryker
        const yClamped = Math.max(0, Math.min(yMax * 1.05, y));
        const px = xToPx(x).toFixed(2);
        const py = yToPx(yClamped).toFixed(2);
        pts.push(`${started ? "L" : "M"} ${px} ${py}`);
        started = true;
      }
      return { curve: c, d: pts.join(" ") };
    });
  }, [activeCurves, maxN, logY, yMax]);

  // X-akse-ticks
  const xTicks = useMemo(() => {
    const ticks: number[] = [];
    const step = niceStep(maxN, 6);
    for (let t = 0; t <= maxN + 0.0001; t += step) {
      ticks.push(Math.round(t));
    }
    return Array.from(new Set(ticks));
  }, [maxN]);

  // Y-akse-ticks
  const yTicks = useMemo(() => {
    if (logY) {
      const out: number[] = [];
      const maxLog = Math.ceil(Math.log10(Math.max(10, yMax)));
      for (let e = 0; e <= maxLog; e++) {
        out.push(Math.pow(10, e));
      }
      return out;
    }
    const ticks: number[] = [];
    const step = niceStep(yMax, 5);
    for (let t = 0; t <= yMax + 0.0001; t += step) {
      ticks.push(t);
    }
    return ticks;
  }, [yMax, logY]);

  const onMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    if (px < padL || px > W - padR) {
      setHoverN(null);
      return;
    }
    const n = ((px - padL) / (W - padL - padR)) * maxN;
    setHoverN(n);
  };
  const onMouseLeave = () => setHoverN(null);

  return (
    <div className="space-y-4">
      {/* Kurve-checkboxer */}
      <div className="flex flex-wrap gap-2">
        {CURVES.map((c) => {
          const on = enabled[c.id];
          return (
            <button
              key={c.id}
              type="button"
              onClick={() =>
                setEnabled((prev) => ({ ...prev, [c.id]: !prev[c.id] }))
              }
              className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-mono border transition-colors ${
                on
                  ? "border-border bg-muted/60"
                  : "border-border/50 bg-transparent text-muted-foreground hover:bg-muted/30"
              }`}
            >
              <span
                className="inline-block w-3 h-3 rounded-sm"
                style={{
                  background: on ? c.color : "transparent",
                  border: `1.5px solid ${c.color}`,
                }}
              />
              {c.label}
            </button>
          );
        })}
      </div>

      {/* SVG-plot */}
      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full max-w-3xl mx-auto block"
          style={{ height: "min(45vh, 360px)" }}
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
        >
          {/* Bakgrunns-gitter */}
          {xTicks.map((t) => (
            <g key={`gx-${t}`}>
              <line
                x1={xToPx(t)}
                y1={padT}
                x2={xToPx(t)}
                y2={H - padB}
                stroke="currentColor"
                strokeOpacity={0.06}
              />
              <text
                x={xToPx(t)}
                y={H - padB + 14}
                fontSize="10"
                textAnchor="middle"
                className="fill-muted-foreground"
                fontFamily="ui-monospace, monospace"
              >
                {t}
              </text>
            </g>
          ))}
          {yTicks.map((t) => (
            <g key={`gy-${t}`}>
              <line
                x1={padL}
                y1={yToPx(t)}
                x2={W - padR}
                y2={yToPx(t)}
                stroke="currentColor"
                strokeOpacity={0.06}
              />
              <text
                x={padL - 6}
                y={yToPx(t) + 3}
                fontSize="10"
                textAnchor="end"
                className="fill-muted-foreground"
                fontFamily="ui-monospace, monospace"
              >
                {formatTick(t)}
              </text>
            </g>
          ))}

          {/* Akser */}
          <line
            x1={padL}
            y1={H - padB}
            x2={W - padR}
            y2={H - padB}
            stroke="currentColor"
            strokeOpacity={0.3}
          />
          <line
            x1={padL}
            y1={padT}
            x2={padL}
            y2={H - padB}
            stroke="currentColor"
            strokeOpacity={0.3}
          />

          {/* Akse-etiketter */}
          <text
            x={(padL + W - padR) / 2}
            y={H - 4}
            fontSize="11"
            textAnchor="middle"
            className="fill-muted-foreground"
            fontFamily="ui-monospace, monospace"
          >
            n
          </text>
          <text
            x={-((padT + H - padB) / 2)}
            y={12}
            fontSize="11"
            textAnchor="middle"
            transform={`rotate(-90)`}
            className="fill-muted-foreground"
            fontFamily="ui-monospace, monospace"
          >
            T(n) {logY ? "(log)" : ""}
          </text>

          {/* Kurver */}
          {paths.map(({ curve, d }) => (
            <path
              key={curve.id}
              d={d}
              fill="none"
              stroke={curve.color}
              strokeWidth={2}
              strokeOpacity={0.9}
            />
          ))}

          {/* Hover-linje + verdier */}
          {hoverN !== null && (
            <>
              <line
                x1={xToPx(hoverN)}
                y1={padT}
                x2={xToPx(hoverN)}
                y2={H - padB}
                stroke="currentColor"
                strokeOpacity={0.25}
                strokeDasharray="3 3"
              />
              {activeCurves.map((c) => {
                const nInt =
                  c.id === "nfact" || c.id === "2n"
                    ? Math.round(hoverN)
                    : hoverN;
                const y = c.fn(nInt);
                if (!Number.isFinite(y) || y <= 0) return null;
                const yClamped = Math.max(0, Math.min(yMax * 1.05, y));
                return (
                  <circle
                    key={`h-${c.id}`}
                    cx={xToPx(hoverN)}
                    cy={yToPx(yClamped)}
                    r={3.5}
                    fill={c.color}
                    stroke="white"
                    strokeWidth={1.5}
                  />
                );
              })}
            </>
          )}
        </svg>
      </div>

      {/* Hover-tabell */}
      {hoverN !== null && (
        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <div className="text-xs font-mono text-muted-foreground mb-2">
            n = {Math.round(hoverN)}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs font-mono">
            {activeCurves.map((c) => {
              const nInt =
                c.id === "nfact" || c.id === "2n"
                  ? Math.round(hoverN)
                  : hoverN;
              const v = c.fn(nInt);
              return (
                <div key={`hv-${c.id}`} className="flex items-center gap-1.5">
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-sm"
                    style={{ background: c.color }}
                  />
                  <span className="text-muted-foreground">T_{c.label}</span>
                  <span className="text-foreground">= {formatBig(v)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Kontroller */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-center">
        <div className="flex items-center gap-2">
          <label
            className="text-xs text-muted-foreground w-24 shrink-0"
            htmlFor="bigo-n"
          >
            maks n
          </label>
          <input
            id="bigo-n"
            type="range"
            min={10}
            max={1000}
            step={1}
            value={maxN}
            onChange={(e) => setMaxN(Number(e.target.value))}
            className="flex-1 accent-brand"
          />
          <span className="font-mono text-xs w-16 text-right tabular-nums">
            {maxN}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setLogY((v) => !v)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
              logY
                ? "bg-brand text-brand-foreground border-brand"
                : "border-border hover:bg-muted"
            }`}
          >
            y-akse: {logY ? "log" : "lineær"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Modus 2: Virkelig tid
// ============================================================================

const OPS_PER_SEC = 1e9;

function RealtimeMode() {
  const [n, setN] = useState(20);

  // Verdier vi viser
  const rows = [
    { label: "O(1)", v: 1 },
    { label: "O(log n)", v: Math.log2(Math.max(1, n)) },
    { label: "O(n)", v: n },
    { label: "O(n log n)", v: n * Math.log2(Math.max(1, n)) },
    { label: "O(n²)", v: n * n },
    { label: "O(n³)", v: n * n * n },
    { label: "O(2ⁿ)", v: Math.pow(2, n) },
    { label: "O(n!)", v: factorial(n) },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="text-sm">
          Antar <span className="font-mono">10⁹</span> operasjoner per sekund.
        </div>
      </div>

      <div className="flex items-center gap-2">
        <label
          className="text-xs text-muted-foreground w-12 shrink-0"
          htmlFor="rt-n"
        >
          n =
        </label>
        <input
          id="rt-n"
          type="range"
          min={1}
          max={100}
          step={1}
          value={n}
          onChange={(e) => setN(Number(e.target.value))}
          className="flex-1 accent-brand"
        />
        <span className="font-mono text-sm w-12 text-right tabular-nums">{n}</span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left font-semibold px-4 py-2 w-28">Klasse</th>
              <th className="text-left font-semibold px-4 py-2">
                Operasjoner T(n)
              </th>
              <th className="text-left font-semibold px-4 py-2">
                Tid @ 10⁹ ops/s
              </th>
              <th className="text-left font-semibold px-4 py-2 w-32">Følelse</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const sec = r.v / OPS_PER_SEC;
              const feel = feelOfDuration(sec);
              return (
                <tr key={r.label} className="border-t border-border">
                  <td className="px-4 py-2 font-mono">{r.label}</td>
                  <td className="px-4 py-2 font-mono text-muted-foreground">
                    {formatBig(r.v)}
                  </td>
                  <td className="px-4 py-2 font-mono">
                    {formatDuration(sec)}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        background: feel.bg,
                        color: feel.fg,
                      }}
                    >
                      {feel.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground">
        Universets alder er ca. 4.4 × 10¹⁷ sekunder. Klasser merket «umulig» ville
        ikke fullført før universet endte.
      </p>
    </div>
  );
}

function feelOfDuration(sec: number): { label: string; bg: string; fg: string } {
  if (!Number.isFinite(sec))
    return { label: "umulig", bg: "rgba(239,68,68,0.2)", fg: "#ef4444" };
  if (sec < 1e-6) return { label: "umiddelbar", bg: "rgba(34,197,94,0.15)", fg: "#16a34a" };
  if (sec < 1e-3) return { label: "rask", bg: "rgba(34,197,94,0.15)", fg: "#16a34a" };
  if (sec < 1) return { label: "merkbar", bg: "rgba(245,158,11,0.18)", fg: "#d97706" };
  if (sec < 60) return { label: "treig", bg: "rgba(245,158,11,0.18)", fg: "#d97706" };
  if (sec < 3600) return { label: "minutter", bg: "rgba(249,115,22,0.2)", fg: "#ea580c" };
  if (sec < 86400) return { label: "timer", bg: "rgba(249,115,22,0.2)", fg: "#ea580c" };
  if (sec < 86400 * 365) return { label: "dager", bg: "rgba(239,68,68,0.2)", fg: "#ef4444" };
  if (sec < 86400 * 365 * 1000)
    return { label: "år", bg: "rgba(239,68,68,0.2)", fg: "#ef4444" };
  return { label: "umulig", bg: "rgba(239,68,68,0.2)", fg: "#ef4444" };
}

function formatDuration(sec: number): string {
  if (!Number.isFinite(sec)) return "∞";
  if (sec < 1e-9) return `${(sec * 1e12).toFixed(2)} ps`;
  if (sec < 1e-6) return `${(sec * 1e9).toFixed(2)} ns`;
  if (sec < 1e-3) return `${(sec * 1e6).toFixed(2)} µs`;
  if (sec < 1) return `${(sec * 1e3).toFixed(2)} ms`;
  if (sec < 60) return `${sec.toFixed(2)} s`;
  if (sec < 3600) return `${(sec / 60).toFixed(1)} min`;
  if (sec < 86400) return `${(sec / 3600).toFixed(1)} t`;
  if (sec < 86400 * 365) return `${(sec / 86400).toFixed(1)} dager`;
  const years = sec / (86400 * 365);
  if (years < 1e3) return `${years.toFixed(1)} år`;
  if (years < 1e6) return `${(years / 1e3).toFixed(1)} tusen år`;
  if (years < 1e9) return `${(years / 1e6).toFixed(1)} mill. år`;
  if (years < 1e12) return `${(years / 1e9).toFixed(1)} mrd. år`;
  return `${years.toExponential(1)} år`;
}

// ============================================================================
// Modus 3: Algoritme-race
// ============================================================================

type RaceAlg = {
  id: "linear" | "binary";
  label: string;
  color: string;
  expected: string;
};

const RACE_ALGS: RaceAlg[] = [
  { id: "linear", label: "Lineærsøk", color: "#ef4444", expected: "O(n)" },
  { id: "binary", label: "Binærsøk", color: "#22c55e", expected: "O(log n)" },
];

type RaceState = {
  // For lineær: cursor er gjeldende index
  linearCursor: number;
  linearDone: boolean;
  linearOps: number;
  // For binær: lo / hi / mid
  binLo: number;
  binHi: number;
  binMid: number | null;
  binDone: boolean;
  binOps: number;
};

function RaceMode() {
  const [n, setN] = useState(100);
  const [target, setTarget] = useState(73);
  const [state, setState] = useState<RaceState>(() => initRace(100, 73));
  const [isRunning, setIsRunning] = useState(false);
  const runTimer = useRef<number | null>(null);

  // Datasettet er bare 1..n (sortert)
  // Hver "operasjon" er en sammenligning

  useEffect(() => {
    stopRun();
    setState(initRace(n, target));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n, target]);

  function stopRun() {
    if (runTimer.current !== null) {
      window.clearInterval(runTimer.current);
      runTimer.current = null;
    }
    setIsRunning(false);
  }

  function stepBoth() {
    setState((s) => stepRace(s, n, target));
  }

  function runAll() {
    if (isRunning) {
      stopRun();
      return;
    }
    setIsRunning(true);
    runTimer.current = window.setInterval(() => {
      setState((s) => {
        if (s.linearDone && s.binDone) {
          stopRun();
          return s;
        }
        return stepRace(s, n, target);
      });
    }, 80);
  }

  function reset() {
    stopRun();
    setState(initRace(n, target));
  }

  const maxOpsLinear = n;
  const maxOpsBinary = Math.ceil(Math.log2(Math.max(2, n))) + 1;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="flex items-center gap-2">
          <label
            className="text-xs text-muted-foreground w-24 shrink-0"
            htmlFor="race-n"
          >
            datasett n
          </label>
          <input
            id="race-n"
            type="range"
            min={10}
            max={1000}
            step={1}
            value={n}
            onChange={(e) => {
              const v = Number(e.target.value);
              setN(v);
              if (target > v) setTarget(v);
            }}
            className="flex-1 accent-brand"
          />
          <span className="font-mono text-xs w-16 text-right tabular-nums">
            {n}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <label
            className="text-xs text-muted-foreground w-24 shrink-0"
            htmlFor="race-t"
          >
            målverdi
          </label>
          <input
            id="race-t"
            type="range"
            min={1}
            max={n}
            step={1}
            value={target}
            onChange={(e) => setTarget(Number(e.target.value))}
            className="flex-1 accent-brand"
          />
          <span className="font-mono text-xs w-16 text-right tabular-nums">
            {target}
          </span>
        </div>
      </div>

      {/* To "race"-rader */}
      <div className="space-y-3">
        {RACE_ALGS.map((alg) => {
          const ops = alg.id === "linear" ? state.linearOps : state.binOps;
          const done = alg.id === "linear" ? state.linearDone : state.binDone;
          const maxOps = alg.id === "linear" ? maxOpsLinear : maxOpsBinary;
          const pct = Math.min(100, (ops / Math.max(1, maxOps)) * 100);

          return (
            <div
              key={alg.id}
              className="rounded-lg border border-border bg-card p-3"
            >
              <div className="flex items-center justify-between text-xs mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block w-3 h-3 rounded-sm"
                    style={{ background: alg.color }}
                  />
                  <span className="font-semibold">{alg.label}</span>
                  <span className="font-mono text-muted-foreground">
                    {alg.expected}
                  </span>
                </div>
                <div className="font-mono tabular-nums">
                  {ops} sammenligninger
                  {done && (
                    <span className="ml-2 text-success font-semibold">ferdig</span>
                  )}
                </div>
              </div>

              {/* Bar */}
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full transition-all"
                  style={{
                    width: `${pct}%`,
                    background: alg.color,
                    transitionDuration: "120ms",
                  }}
                />
              </div>

              {/* Mini-strip av dataset */}
              <RaceStrip
                n={n}
                target={target}
                alg={alg}
                state={state}
              />
            </div>
          );
        })}
      </div>

      {/* Kontroller */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={stepBoth}
          disabled={isRunning}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium border border-brand/40 text-brand hover:bg-brand/10 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Steg
        </button>
        <button
          type="button"
          onClick={runAll}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium border border-brand/40 text-brand hover:bg-brand/10"
        >
          {isRunning ? (
            <>
              <Square className="h-3.5 w-3.5" />
              Stopp
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5" />
              Kjør
            </>
          )}
        </button>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium border border-border hover:bg-muted"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </button>
        <div className="ml-auto text-xs text-muted-foreground font-mono">
          worst case: lineær ≤ {n}, binær ≤ {maxOpsBinary}
        </div>
      </div>
    </div>
  );
}

function initRace(n: number, target: number): RaceState {
  return {
    linearCursor: -1,
    linearDone: false,
    linearOps: 0,
    binLo: 0,
    binHi: n - 1,
    binMid: null,
    binDone: false,
    binOps: 0,
  };
}

function stepRace(s: RaceState, n: number, target: number): RaceState {
  const next = { ...s };

  // Linear: gå én fram. Verdier er 1..n, så index i har verdi i+1.
  if (!s.linearDone) {
    const i = s.linearCursor + 1;
    if (i >= n) {
      next.linearDone = true;
      next.linearCursor = i;
    } else {
      next.linearCursor = i;
      next.linearOps = s.linearOps + 1;
      if (i + 1 === target) {
        next.linearDone = true;
      }
    }
  }

  // Binary: én iterasjon
  if (!s.binDone) {
    if (s.binLo > s.binHi) {
      next.binDone = true;
    } else {
      const mid = Math.floor((s.binLo + s.binHi) / 2);
      next.binMid = mid;
      next.binOps = s.binOps + 1;
      const midVal = mid + 1;
      if (midVal === target) {
        next.binDone = true;
      } else if (midVal < target) {
        next.binLo = mid + 1;
      } else {
        next.binHi = mid - 1;
      }
    }
  }

  return next;
}

function RaceStrip({
  n,
  target,
  alg,
  state,
}: {
  n: number;
  target: number;
  alg: RaceAlg;
  state: RaceState;
}) {
  // Vis en bar med n celler. For store n grupperer vi for å unngå millioner av rects.
  // Tegn maks 200 visuelle celler.
  const W = 640;
  const H = 22;
  const cells = Math.min(n, 200);
  const cellW = (W - 2) / cells;
  const cellsArr = Array.from({ length: cells }, (_, i) => i);

  // Mapping fra visuell celle → faktisk index-område
  const cellToIdxStart = (c: number) => Math.floor((c * n) / cells);
  const cellToIdxEnd = (c: number) => Math.floor(((c + 1) * n) / cells);

  const targetIdx = target - 1;

  return (
    <div className="mt-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full block">
        {cellsArr.map((c) => {
          const lo = cellToIdxStart(c);
          const hi = cellToIdxEnd(c) - 1;
          let fill = "currentColor";
          let opacity = 0.1;

          if (alg.id === "linear") {
            // Allerede besøkt
            if (state.linearCursor >= hi) {
              fill = alg.color;
              opacity = 0.35;
            } else if (state.linearCursor >= lo) {
              fill = alg.color;
              opacity = 0.7;
            }
          } else {
            // binary: skygg ut området utenfor [binLo, binHi]
            const inWindow = hi >= state.binLo && lo <= state.binHi;
            if (!inWindow && !state.binDone) {
              fill = "currentColor";
              opacity = 0.04;
            } else if (state.binMid !== null && state.binMid >= lo && state.binMid <= hi) {
              fill = alg.color;
              opacity = 0.85;
            } else if (inWindow) {
              fill = alg.color;
              opacity = 0.2;
            }
          }

          // Mål
          const isTarget = targetIdx >= lo && targetIdx <= hi;
          return (
            <g key={c}>
              <rect
                x={1 + c * cellW}
                y={2}
                width={Math.max(0.5, cellW - 0.5)}
                height={H - 4}
                fill={fill}
                opacity={opacity}
              />
              {isTarget && (
                <rect
                  x={1 + c * cellW}
                  y={1}
                  width={Math.max(0.5, cellW - 0.5)}
                  height={H - 2}
                  fill="none"
                  stroke="#facc15"
                  strokeWidth={1.5}
                />
              )}
            </g>
          );
        })}
      </svg>
      <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground font-mono">
        <span>1</span>
        <span>
          mål: <span className="text-foreground">{target}</span>
        </span>
        <span>{n}</span>
      </div>
    </div>
  );
}

// ============================================================================
// Modus 4: Quiz
// ============================================================================

type QuizSnippet = {
  kode: string;
  riktig: string;
  alternativer: string[];
  forklaring: string;
};

const QUIZ: QuizSnippet[] = [
  {
    kode: `def sum_lst(lst):
    total = 0
    for x in lst:
        total += x
    return total`,
    riktig: "O(n)",
    alternativer: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
    forklaring:
      "Én løkke som besøker hvert element én gang. Linær tid — antall iterasjoner vokser direkte med n.",
  },
  {
    kode: `def dup(lst):
    for i in range(len(lst)):
        for j in range(i+1, len(lst)):
            if lst[i] == lst[j]:
                return True
    return False`,
    riktig: "O(n²)",
    alternativer: ["O(n)", "O(n log n)", "O(n²)", "O(2ⁿ)"],
    forklaring:
      "Nestet løkke over samme liste — kvadratisk. Hver ytre iterasjon kjører opptil n indre iterasjoner.",
  },
  {
    kode: `def search(lst, mål):
    lo, hi = 0, len(lst) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if lst[mid] == mål: return mid
        elif lst[mid] < mål: lo = mid + 1
        else: hi = mid - 1
    return -1`,
    riktig: "O(log n)",
    alternativer: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    forklaring:
      "Binærsøk. Hver iterasjon halverer søkeområdet — antall iterasjoner er log₂ n.",
  },
  {
    kode: `def fib(n):
    if n < 2: return n
    return fib(n-1) + fib(n-2)`,
    riktig: "O(2ⁿ)",
    alternativer: ["O(n)", "O(n²)", "O(2ⁿ)", "O(n!)"],
    forklaring:
      "Hvert kall lager to nye kall, og dybden er n. Total: ~2ⁿ kall. Memoization fikser det til O(n).",
  },
  {
    kode: `def print_pairs(a, b):
    for x in a:
        for y in b:
            print(x, y)`,
    riktig: "O(n × m)",
    alternativer: ["O(n + m)", "O(n × m)", "O(n²)", "O(max(n, m))"],
    forklaring:
      "To ulike lister — vi kan ikke kollapse n og m. Hver kombinasjon besøkes én gang.",
  },
  {
    kode: `def two_pass(lst):
    s = 0
    for x in lst:
        s += x
    for x in lst:
        print(x)
    return s`,
    riktig: "O(n)",
    alternativer: ["O(1)", "O(n)", "O(n²)", "O(2n)"],
    forklaring:
      "To løkker ETTER hverandre, ikke nestet. O(n) + O(n) = O(2n) = O(n). Konstanter fjernes.",
  },
  {
    kode: `def merge_sort(lst):
    if len(lst) <= 1: return lst
    mid = len(lst) // 2
    venstre = merge_sort(lst[:mid])
    høyre = merge_sort(lst[mid:])
    return merge(venstre, høyre)  # merge er O(n)`,
    riktig: "O(n log n)",
    alternativer: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"],
    forklaring:
      "Log n nivåer av rekursjon (halvering), og O(n) arbeid på hvert nivå (merge). Master-teoremet.",
  },
  {
    kode: `def perm(lst):
    if len(lst) <= 1:
        return [lst]
    out = []
    for i in range(len(lst)):
        rest = lst[:i] + lst[i+1:]
        for p in perm(rest):
            out.append([lst[i]] + p)
    return out`,
    riktig: "O(n!)",
    alternativer: ["O(n²)", "O(2ⁿ)", "O(n!)", "O(nⁿ)"],
    forklaring:
      "Genererer alle permutasjoner — n! mulige rekkefølger av n elementer.",
  },
];

function QuizMode() {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState({ rett: 0, antall: 0 });

  const q = QUIZ[idx];
  const answered = picked !== null;
  const correct = answered && picked === q.riktig;

  function pick(opt: string) {
    if (answered) return;
    setPicked(opt);
    setScore((s) => ({
      rett: s.rett + (opt === q.riktig ? 1 : 0),
      antall: s.antall + 1,
    }));
  }

  function next() {
    setPicked(null);
    setIdx((i) => (i + 1) % QUIZ.length);
  }

  function reset() {
    setPicked(null);
    setIdx(0);
    setScore({ rett: 0, antall: 0 });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs">
        <div className="font-mono text-muted-foreground">
          Snippet {idx + 1} / {QUIZ.length}
        </div>
        <div className="font-mono">
          Score:{" "}
          <span className="text-foreground font-semibold">
            {score.rett}/{score.antall}
          </span>
        </div>
      </div>

      <pre className="font-mono text-xs rounded-lg bg-background border border-border p-4 overflow-x-auto whitespace-pre">
        {q.kode}
      </pre>

      <div className="space-y-2">
        <div className="text-xs text-muted-foreground">
          Hva er kompleksiteten?
        </div>
        <div className="grid grid-cols-2 gap-2">
          {q.alternativer.map((opt) => {
            const isPicked = picked === opt;
            const isRight = opt === q.riktig;
            let cls =
              "px-3 py-2 rounded-md text-sm font-mono border transition-colors text-left";
            if (!answered) {
              cls += " border-border hover:bg-muted cursor-pointer";
            } else if (isRight) {
              cls += " border-success bg-success/10 text-success";
            } else if (isPicked) {
              cls += " border-destructive bg-destructive/10 text-destructive";
            } else {
              cls += " border-border opacity-50";
            }
            return (
              <button
                key={opt}
                type="button"
                onClick={() => pick(opt)}
                disabled={answered}
                className={cls}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {answered && (
        <div
          className={`rounded-lg border p-4 text-sm ${
            correct
              ? "border-success/40 bg-success/5"
              : "border-destructive/40 bg-destructive/5"
          }`}
        >
          <div className="font-semibold mb-1">
            {correct ? "Riktig" : "Feil"} — svaret er{" "}
            <span className="font-mono">{q.riktig}</span>
          </div>
          <div className="text-muted-foreground">{q.forklaring}</div>
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={next}
          disabled={!answered}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium border border-brand/40 text-brand hover:bg-brand/10 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Neste
        </button>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium border border-border hover:bg-muted"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Start på nytt
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// Hjelpere
// ============================================================================

function niceStep(range: number, targetTicks: number): number {
  if (range <= 0) return 1;
  const rough = range / Math.max(1, targetTicks);
  const mag = Math.pow(10, Math.floor(Math.log10(rough)));
  const norm = rough / mag;
  let nice: number;
  if (norm < 1.5) nice = 1;
  else if (norm < 3) nice = 2;
  else if (norm < 7) nice = 5;
  else nice = 10;
  return nice * mag;
}

function formatTick(v: number): string {
  if (v === 0) return "0";
  if (Math.abs(v) >= 1e6) return v.toExponential(0);
  if (Math.abs(v) >= 1e4) return v.toExponential(0);
  if (Math.abs(v) < 1) return v.toFixed(2);
  return Math.round(v).toString();
}

function formatBig(v: number): string {
  if (!Number.isFinite(v)) return "∞";
  if (v === 0) return "0";
  if (Math.abs(v) < 1) return v.toFixed(4);
  if (Math.abs(v) < 1000) return v.toFixed(v < 10 ? 2 : 0);
  if (Math.abs(v) < 1e6) return Math.round(v).toLocaleString("nb-NO");
  return v.toExponential(2);
}
