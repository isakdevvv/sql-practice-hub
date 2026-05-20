import { useEffect, useMemo, useState } from "react";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
  Database,
  Zap,
  Smartphone,
} from "lucide-react";

// Levende versjon av seksjon 2.3: DNS rekursivt oppslag med caching.
//
// Mobilen din spør sin lokale DNS-resolver (vanligvis hos ISP).
// Resolveren spør i tur og orden: Root → TLD → Authoritative.
// Hvert oppslag tar tid (RTT). Andre gang du spør, slipper du
// alt — svaret ligger i resolverens cache (så lenge TTL ikke har utløpt).

type Mode = "cold" | "warm"; // første oppslag (cold cache) vs gjentatt (warm)

// Nodene i nettverket
const NODE_CLIENT = { x: 60, y: 200, label: "Mobil", sub: "10.0.0.5" };
const NODE_RESOLVER = { x: 230, y: 200, label: "Resolver", sub: "ISP DNS" };
const NODE_ROOT = { x: 430, y: 70, label: "Root", sub: "." };
const NODE_TLD = { x: 600, y: 200, label: "TLD", sub: ".no" };
const NODE_AUTH = { x: 430, y: 330, label: "Auth", sub: "uit.no" };

const ALL_NODES = [NODE_CLIENT, NODE_RESOLVER, NODE_ROOT, NODE_TLD, NODE_AUTH];

type Step = {
  title: string;
  description: string;
  flow?: {
    from: typeof NODE_CLIENT;
    to: typeof NODE_CLIENT;
    label: string;
    kind: "query" | "answer" | "referral";
  };
  cache?: string[]; // hva som er cachet i resolveren etter steget
  highlight?: string; // node-label som blinker
};

const COLD_STEPS: Step[] = [
  {
    title: "1. Mobilen vil løse uit.no",
    description:
      "Du åpner uit.no i nettleseren. Maskinen spør sin lokale stub-resolver (i OS-en), som peker videre til ISP-ens DNS-server. DNS-pakken er en liten UDP-pakke (typisk < 100 byte).",
    flow: {
      from: NODE_CLIENT,
      to: NODE_RESOLVER,
      label: "uit.no?",
      kind: "query",
    },
    highlight: "Mobil",
  },
  {
    title: "2. Resolveren spør root-server",
    description:
      "Resolveren har tom cache. Den må starte på toppen — root-serveren (.). Root vet ikke hva uit.no er, men vet hvem som har ansvaret for .no-domenet.",
    flow: {
      from: NODE_RESOLVER,
      to: NODE_ROOT,
      label: "uit.no?",
      kind: "query",
    },
    highlight: "Root",
  },
  {
    title: "3. Root henviser til TLD-serveren for .no",
    description:
      "Root svarer ikke med IP-en til uit.no — den vet ikke. Den svarer med en 'referral': 'spør .no-serveren, den ligger på 158.36.X.X'. Dette kalles iterativt oppslag.",
    flow: {
      from: NODE_ROOT,
      to: NODE_RESOLVER,
      label: "spør .no",
      kind: "referral",
    },
  },
  {
    title: "4. Resolveren spør TLD-serveren (.no)",
    description:
      "Resolveren spør .no-TLD-serveren (typisk drevet av Norid). Den vet hvem som har autoritet over uit.no — universitetets egne navne-servere.",
    flow: {
      from: NODE_RESOLVER,
      to: NODE_TLD,
      label: "uit.no?",
      kind: "query",
    },
    highlight: "TLD",
  },
  {
    title: "5. TLD henviser til authoritative server",
    description:
      ".no-serveren vet ikke IP-en til uit.no heller — men vet at uit.no-sonen ligger på UiTs egne DNS-servere (ns1.uit.no, ns2.uit.no). Nok en referral.",
    flow: {
      from: NODE_TLD,
      to: NODE_RESOLVER,
      label: "spør ns1.uit.no",
      kind: "referral",
    },
  },
  {
    title: "6. Resolveren spør authoritative server",
    description:
      "Endelig kommer vi til serveren som faktisk vet svaret. Authoritative DNS for uit.no svarer med en A-record: uit.no = 129.242.16.214. Den setter også en TTL (typisk 3600 s = 1 time).",
    flow: {
      from: NODE_RESOLVER,
      to: NODE_AUTH,
      label: "uit.no?",
      kind: "query",
    },
    highlight: "Auth",
  },
  {
    title: "7. Auth svarer med IP-adressen",
    description:
      "Resolveren får svaret: 129.242.16.214, TTL=3600. Den lagrer dette i sin cache slik at neste oppslag for uit.no slipper hele turen.",
    flow: {
      from: NODE_AUTH,
      to: NODE_RESOLVER,
      label: "129.242.16.214",
      kind: "answer",
    },
    cache: ["uit.no → 129.242.16.214 (TTL 3600)"],
  },
  {
    title: "8. Resolveren svarer mobilen",
    description:
      "Resolveren sender det endelige svaret tilbake til mobilen. Nettleseren kan nå åpne TCP-forbindelse til 129.242.16.214. Hele kjeden tok 4 RTT-er — så ~200 ms hvis hver RTT er 50 ms.",
    flow: {
      from: NODE_RESOLVER,
      to: NODE_CLIENT,
      label: "129.242.16.214",
      kind: "answer",
    },
    cache: ["uit.no → 129.242.16.214 (TTL 3600)"],
    highlight: "Mobil",
  },
];

const WARM_STEPS: Step[] = [
  {
    title: "1. Mobilen spør resolveren — igjen",
    description:
      "Du klikker på en ny lenke til uit.no 10 minutter senere. Mobilen spør resolveren akkurat som forrige gang.",
    flow: {
      from: NODE_CLIENT,
      to: NODE_RESOLVER,
      label: "uit.no?",
      kind: "query",
    },
    cache: ["uit.no → 129.242.16.214 (TTL 3000)"],
    highlight: "Mobil",
  },
  {
    title: "2. Resolveren har det i cache",
    description:
      "Resolveren slår opp i sin cache. uit.no er der! TTL har gått fra 3600 → 3000 (600 sekunder siden forrige oppslag). Den trenger ikke spørre verken root, TLD eller auth.",
    cache: ["uit.no → 129.242.16.214 (TTL 3000)"],
    highlight: "Resolver",
  },
  {
    title: "3. Resolveren svarer direkte",
    description:
      "Svaret går rett tilbake til mobilen — fra 4 RTT til 1 RTT. ~50 ms i stedet for ~200 ms. Dette er hvorfor caching er hele DNS-sin overlevelse: med ~10 milliarder oppslag i sekundet globalt, ville rot-serverne kollapset uten cache.",
    flow: {
      from: NODE_RESOLVER,
      to: NODE_CLIENT,
      label: "129.242.16.214",
      kind: "answer",
    },
    cache: ["uit.no → 129.242.16.214 (TTL 3000)"],
    highlight: "Mobil",
  },
  {
    title: "4. TTL utløper — cache ugyldig",
    description:
      "Etter 3600 sekunder (1 time) går TTL til 0. Cache-en slettes. Neste oppslag må gå hele turen igjen (eller minst fra root → auth hvis TLD-svaret fortsatt er gyldig). TTL er trade-off: høy TTL = mindre last på auth-server, lav TTL = endringer propagerer raskere.",
    cache: [],
    highlight: "Resolver",
  },
];

const COLORS = {
  query: { fill: "fill-amber-500", bg: "bg-amber-500" },
  answer: { fill: "fill-emerald-500", bg: "bg-emerald-500" },
  referral: { fill: "fill-purple-500", bg: "bg-purple-500" },
};

export function Section23Live() {
  const [mode, setMode] = useState<Mode>("cold");
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const steps: Step[] = mode === "cold" ? COLD_STEPS : WARM_STEPS;
  const step = steps[stepIdx];

  // Tid akkumulert (RTT-er). Et steg med flow = 0.5 RTT (envei).
  const elapsedRtt = useMemo(() => {
    let sum = 0;
    for (let i = 0; i < stepIdx; i++) {
      if (steps[i].flow) sum += 0.5;
    }
    if (step.flow) sum += 0.5 * progress;
    return sum;
  }, [stepIdx, progress, step, steps]);

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const SPEED = 1 / 1800; // 1.8 s per steg
    function tick(now: number) {
      const dt = now - last;
      last = now;
      setProgress((p) => {
        const next = p + dt * SPEED;
        if (next >= 1) {
          setStepIdx((i) => {
            if (i + 1 >= steps.length) {
              setPlaying(false);
              return i;
            }
            return i + 1;
          });
          return 0;
        }
        return next;
      });
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, steps.length]);

  function switchMode(m: Mode) {
    if (m === mode) return;
    setMode(m);
    setStepIdx(0);
    setProgress(0);
    setPlaying(false);
  }

  function next() {
    setStepIdx((i) => Math.min(steps.length - 1, i + 1));
    setProgress(0);
  }
  function prev() {
    setStepIdx((i) => Math.max(0, i - 1));
    setProgress(0);
  }
  function reset() {
    setStepIdx(0);
    setProgress(0);
    setPlaying(false);
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Toggle */}
      <div className="bg-muted/30 px-4 py-2 text-xs border-b border-border flex items-center gap-2 flex-wrap">
        <span className="font-medium text-foreground">{step.title}</span>
        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={() => switchMode("cold")}
            className={`inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium ${
              mode === "cold"
                ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Database className="h-3 w-3" /> Tom cache
          </button>
          <button
            onClick={() => switchMode("warm")}
            className={`inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium ${
              mode === "warm"
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Zap className="h-3 w-3" /> Cachet
          </button>
          <span className="ml-2 font-mono text-muted-foreground">
            Steg {stepIdx + 1} / {steps.length}
          </span>
        </div>
      </div>

      {/* SVG-scene */}
      <svg viewBox="0 0 680 420" className="w-full h-auto bg-muted/10">
        {/* Faste linjer mellom resolver og hierarki-nivåene */}
        <line
          x1={NODE_RESOLVER.x}
          y1={NODE_RESOLVER.y}
          x2={NODE_ROOT.x}
          y2={NODE_ROOT.y}
          className="stroke-muted-foreground/20"
          strokeDasharray="3 3"
        />
        <line
          x1={NODE_RESOLVER.x}
          y1={NODE_RESOLVER.y}
          x2={NODE_TLD.x}
          y2={NODE_TLD.y}
          className="stroke-muted-foreground/20"
          strokeDasharray="3 3"
        />
        <line
          x1={NODE_RESOLVER.x}
          y1={NODE_RESOLVER.y}
          x2={NODE_AUTH.x}
          y2={NODE_AUTH.y}
          className="stroke-muted-foreground/20"
          strokeDasharray="3 3"
        />
        <line
          x1={NODE_CLIENT.x}
          y1={NODE_CLIENT.y}
          x2={NODE_RESOLVER.x}
          y2={NODE_RESOLVER.y}
          className="stroke-muted-foreground/20"
          strokeDasharray="3 3"
        />

        {/* Aktiv flow-linje */}
        {step.flow && (
          <line
            x1={step.flow.from.x}
            y1={step.flow.from.y}
            x2={step.flow.to.x}
            y2={step.flow.to.y}
            className={
              step.flow.kind === "query"
                ? "stroke-amber-500/60"
                : step.flow.kind === "answer"
                  ? "stroke-emerald-500/60"
                  : "stroke-purple-500/60"
            }
            strokeWidth={2}
          />
        )}

        {/* Noder */}
        {ALL_NODES.map((n) => {
          const isHL = step.highlight === n.label;
          const isClient = n.label === "Mobil";
          return (
            <g key={n.label}>
              {isClient ? (
                <g transform={`translate(${n.x - 16}, ${n.y - 22})`}>
                  <rect
                    width={32}
                    height={44}
                    rx={5}
                    className={
                      isHL ? "fill-brand/20 stroke-brand" : "fill-card stroke-muted-foreground/40"
                    }
                    strokeWidth={2}
                  />
                  <rect
                    x={4}
                    y={5}
                    width={24}
                    height={28}
                    className={isHL ? "fill-brand/30" : "fill-muted/40"}
                  />
                  <circle
                    cx={16}
                    cy={38}
                    r={2}
                    className={isHL ? "fill-brand" : "fill-muted-foreground/50"}
                  />
                </g>
              ) : (
                <rect
                  x={n.x - 30}
                  y={n.y - 20}
                  width={60}
                  height={40}
                  rx={5}
                  className={
                    isHL
                      ? n.label === "Root"
                        ? "fill-rose-500/15 stroke-rose-500"
                        : n.label === "TLD"
                          ? "fill-sky-500/15 stroke-sky-500"
                          : n.label === "Auth"
                            ? "fill-purple-500/15 stroke-purple-500"
                            : "fill-brand/15 stroke-brand"
                      : "fill-card stroke-muted-foreground/40"
                  }
                  strokeWidth={2}
                />
              )}
              <text
                x={n.x}
                y={n.y + 38}
                textAnchor="middle"
                className="fill-foreground text-[11px] font-semibold"
              >
                {n.label}
              </text>
              <text
                x={n.x}
                y={n.y + 50}
                textAnchor="middle"
                className="fill-muted-foreground text-[9px] font-mono"
              >
                {n.sub}
              </text>
            </g>
          );
        })}

        {/* Pakke */}
        {step.flow && (
          <g>
            {(() => {
              const x = step.flow.from.x + (step.flow.to.x - step.flow.from.x) * progress;
              const y = step.flow.from.y + (step.flow.to.y - step.flow.from.y) * progress;
              return (
                <>
                  <circle
                    cx={x}
                    cy={y}
                    r={9}
                    className={`${COLORS[step.flow.kind].fill} stroke-background`}
                    strokeWidth={2}
                  />
                  <text
                    x={x}
                    y={y - 14}
                    textAnchor="middle"
                    className="fill-foreground text-[9px] font-mono font-semibold"
                  >
                    {step.flow.label}
                  </text>
                </>
              );
            })()}
          </g>
        )}

        {/* Cache-boks (på resolveren) */}
        <g transform={`translate(${NODE_RESOLVER.x - 95}, ${NODE_RESOLVER.y + 60})`}>
          <rect
            x={0}
            y={0}
            width={190}
            height={48}
            rx={4}
            className={
              step.cache && step.cache.length > 0
                ? "fill-emerald-500/5 stroke-emerald-500/40"
                : "fill-muted/20 stroke-muted-foreground/30"
            }
            strokeWidth={1}
            strokeDasharray="3 2"
          />
          <text x={6} y={12} className="fill-muted-foreground text-[8px] font-mono uppercase">
            Resolver-cache
          </text>
          {step.cache && step.cache.length > 0 ? (
            step.cache.map((c, i) => (
              <text
                key={i}
                x={6}
                y={26 + i * 11}
                className="fill-foreground text-[9px] font-mono"
              >
                {c}
              </text>
            ))
          ) : (
            <text
              x={6}
              y={28}
              className="fill-muted-foreground text-[9px] font-mono italic"
            >
              (tom)
            </text>
          )}
        </g>
      </svg>

      {/* Beskrivelse */}
      <div className="px-4 py-3 text-sm text-muted-foreground border-t border-border">
        {step.description}
      </div>

      {/* Tids-indikator */}
      <div className="px-4 py-2 border-t border-border bg-muted/20 space-y-1">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-muted-foreground">Akkumulert latens</span>
          <span className="font-mono text-foreground">
            {(elapsedRtt * 50).toFixed(0)} ms ({elapsedRtt.toFixed(1)} RTT)
          </span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full transition-[width] duration-100 ${
              mode === "cold" ? "bg-amber-500" : "bg-emerald-500"
            }`}
            style={{ width: `${Math.min(100, (elapsedRtt / 4) * 100)}%` }}
          />
        </div>
        <p className="text-[10px] text-muted-foreground">
          {mode === "cold"
            ? "Cold cache: opp til 4 RTT (~200 ms ved 50 ms RTT)"
            : "Warm cache: 1 RTT (~50 ms) — uavhengig av hierarki-dybde"}
        </p>
      </div>

      {/* Kontroller */}
      <div className="px-4 py-2 flex flex-wrap items-center gap-1.5 border-t border-border bg-muted/20">
        <button
          onClick={prev}
          disabled={stepIdx === 0}
          className="inline-flex items-center gap-1 rounded border border-border bg-background px-2 py-1 text-xs hover:border-brand/60 disabled:opacity-40"
        >
          <SkipBack className="h-3 w-3" /> Forrige
        </button>
        <button
          onClick={() => setPlaying((p) => !p)}
          className="inline-flex items-center gap-1 rounded border border-brand/40 bg-brand/10 px-2 py-1 text-xs font-medium hover:bg-brand/20"
        >
          {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          {playing
            ? "Pause"
            : stepIdx === steps.length - 1 && progress >= 0.99
              ? "Spill av igjen"
              : "Spill av"}
        </button>
        <button
          onClick={next}
          disabled={stepIdx === steps.length - 1}
          className="inline-flex items-center gap-1 rounded border border-border bg-background px-2 py-1 text-xs hover:border-brand/60 disabled:opacity-40"
        >
          Neste <SkipForward className="h-3 w-3" />
        </button>
        <button
          onClick={reset}
          className="inline-flex items-center gap-1 rounded border border-border bg-background px-2 py-1 text-xs hover:border-brand/60 ml-auto"
        >
          <RotateCcw className="h-3 w-3" />
        </button>

        <div className="ml-2 flex gap-1">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setStepIdx(i);
                setProgress(0);
              }}
              className={`h-1.5 w-4 rounded-full ${
                i === stepIdx ? "bg-brand" : i < stepIdx ? "bg-brand/40" : "bg-muted-foreground/20"
              }`}
              aria-label={`Steg ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 py-2 flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground border-t border-border">
        <Smartphone className="h-3 w-3" />
        <span className={`inline-block w-2 h-2 rounded-full ${COLORS.query.bg}`} /> Query
        <span className={`inline-block w-2 h-2 rounded-full ${COLORS.referral.bg}`} /> Referral
        <span className={`inline-block w-2 h-2 rounded-full ${COLORS.answer.bg}`} /> Answer
      </div>
    </div>
  );
}
