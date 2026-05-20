import { useEffect, useMemo, useState } from "react";
import { Play, Pause, SkipForward, SkipBack, RotateCcw, Server, Users } from "lucide-react";

// Levende versjon av seksjon 2.1: interaktiv klient-server vs P2P-walkthrough.
// Veksler mellom to arkitekturer og animerer hvordan data faktisk flyter.
// Step-walkthrough:
//   Klient-server: 1 forespørsel → 1 svar → mange klienter → server-mett → fall
//   P2P: peers melder seg på → laster opp til hverandre → kapasiteten vokser
// Pedagogisk poeng: én sentral flaskehals vs distribuert kapasitet.

type Mode = "cs" | "p2p";

// SVG-koordinater for klient-server-topologien
const CS_SERVER = { x: 400, y: 170, label: "Server", sub: "vg.no" };
const CS_CLIENTS = [
  { id: "c1", x: 90, y: 60, label: "K1" },
  { id: "c2", x: 90, y: 170, label: "K2" },
  { id: "c3", x: 90, y: 280, label: "K3" },
  { id: "c4", x: 710, y: 60, label: "K4" },
  { id: "c5", x: 710, y: 170, label: "K5" },
  { id: "c6", x: 710, y: 280, label: "K6" },
];

// SVG-koordinater for P2P-mesh — peers ordnet rundt i en sirkel
const P2P_PEERS = [
  { id: "p1", x: 400, y: 50, label: "P1" },
  { id: "p2", x: 620, y: 110, label: "P2" },
  { id: "p3", x: 670, y: 230, label: "P3" },
  { id: "p4", x: 530, y: 310, label: "P4" },
  { id: "p5", x: 270, y: 310, label: "P5" },
  { id: "p6", x: 130, y: 230, label: "P6" },
  { id: "p7", x: 180, y: 110, label: "P7" },
];

type Flow = {
  /** Linje fra `from` til `to` (id i nodelisten) */
  from: string;
  to: string;
  /** Farge på pakken — request grønn, response brand, control lilla */
  kind: "request" | "response" | "control" | "upload" | "down";
};

type CSStep = {
  mode: "cs";
  title: string;
  description: string;
  /** Hvor mange klienter er aktive (sendte requests) i dette steget */
  activeClients: string[];
  /** Pakker som animeres */
  flows: Flow[];
  /** Server-last 0..1 (rødt etterhvert som det fylles) */
  serverLoad: number;
  /** Skal serveren "krasje" (vises som x-merket) */
  serverDown?: boolean;
};

type P2PStep = {
  mode: "p2p";
  title: string;
  description: string;
  activePeers: string[];
  flows: Flow[];
  /** Hvor mye totalt kapasitet (gjennomsnittlig per peer) — vises som progress bar */
  capacity: number; // 0..1
};

type Step = CSStep | P2PStep;

// ============================================================
// Steg-scenario for klient-server-modus
// ============================================================
const CS_STEPS: CSStep[] = [
  {
    mode: "cs",
    title: "1. Én klient spør serveren",
    description:
      "Klient K2 sender en HTTP GET til serveren. Serveren har en kjent, fast adresse (vg.no). Klienten må kjenne adressen for å starte; serveren har ingen anelse om at K2 finnes før requesten kommer inn.",
    activeClients: ["c2"],
    flows: [{ from: "c2", to: "server", kind: "request" }],
    serverLoad: 0.15,
  },
  {
    mode: "cs",
    title: "2. Serveren svarer",
    description:
      "Serveren behandler requesten og sender HTML/JSON tilbake. Klienter snakker aldri direkte til hverandre — alt går gjennom serveren. Det er enkel arkitektur, men hver request belaster den ene maskinen.",
    activeClients: ["c2"],
    flows: [{ from: "server", to: "c2", kind: "response" }],
    serverLoad: 0.18,
  },
  {
    mode: "cs",
    title: "3. Tre klienter samtidig",
    description:
      "K1, K3 og K5 ber om samme side på samme tid. Serveren må håndtere alle tre — typisk med en tråd-pool eller event-loop. CPU og båndbredde deles på antall samtidige klienter.",
    activeClients: ["c1", "c3", "c5"],
    flows: [
      { from: "c1", to: "server", kind: "request" },
      { from: "c3", to: "server", kind: "request" },
      { from: "c5", to: "server", kind: "request" },
    ],
    serverLoad: 0.45,
  },
  {
    mode: "cs",
    title: "4. Server svarer alle tre",
    description:
      "Hver klient får sitt eget svar. Båndbredden ut fra serveren er delt — hvis lenken er 1 Gbps og tre klienter laster ned samtidig, får hver i snitt 333 Mbps. Skalerings-grensen er server-maskinen sin kapasitet.",
    activeClients: ["c1", "c3", "c5"],
    flows: [
      { from: "server", to: "c1", kind: "response" },
      { from: "server", to: "c3", kind: "response" },
      { from: "server", to: "c5", kind: "response" },
    ],
    serverLoad: 0.6,
  },
  {
    mode: "cs",
    title: "5. Alle seks klienter — overbelastning",
    description:
      "Topp-trafikk: alle seks klienter forespør samtidig. Serveren nærmer seg metning. Latens skyter i været, requests står i kø, noen tidsavbrytes. Dette er den klassiske 'Hug of Death' — populariteten din dreper deg.",
    activeClients: ["c1", "c2", "c3", "c4", "c5", "c6"],
    flows: [
      { from: "c1", to: "server", kind: "request" },
      { from: "c2", to: "server", kind: "request" },
      { from: "c3", to: "server", kind: "request" },
      { from: "c4", to: "server", kind: "request" },
      { from: "c5", to: "server", kind: "request" },
      { from: "c6", to: "server", kind: "request" },
    ],
    serverLoad: 0.95,
  },
  {
    mode: "cs",
    title: "6. Serveren ryker — single point of failure",
    description:
      "Hardware-feil, strømbrudd, en bug i koden, eller en DDoS-angrep. Når den ene serveren forsvinner, kommer ingen klient noe sted. Hele tjenesten er nede. Dette er prisen for sentralisert kontroll: enkel arkitektur, men ingen redundans i grunn-formen.",
    activeClients: ["c1", "c2", "c3", "c4", "c5", "c6"],
    flows: [],
    serverLoad: 0,
    serverDown: true,
  },
];

// ============================================================
// Steg-scenario for P2P-modus
// ============================================================
const P2P_STEPS: P2PStep[] = [
  {
    mode: "p2p",
    title: "1. To peers oppdager hverandre",
    description:
      "P1 og P5 har akkurat startet en P2P-app (f.eks. BitTorrent). De bruker en tracker eller DHT for å finne hverandre. Når de kjenner adressene, kan de snakke direkte — ingen sentral server håndterer dataene.",
    activePeers: ["p1", "p5"],
    flows: [{ from: "p1", to: "p5", kind: "control" }],
    capacity: 0.2,
  },
  {
    mode: "p2p",
    title: "2. Fildeling starter — én peer laster opp",
    description:
      "P1 har en fil P5 vil ha. P1 begynner å sende biter til P5. I et reint klient-server ville én maskin sendt til alle; her er P1 både klient og server samtidig.",
    activePeers: ["p1", "p5"],
    flows: [{ from: "p1", to: "p5", kind: "upload" }],
    capacity: 0.25,
  },
  {
    mode: "p2p",
    title: "3. Flere peers melder seg på",
    description:
      "P2, P3, P4 vil også ha filen. De kobler seg til swarm-en. Hver av dem trenger ikke å vente på P1 — så snart de har en bit, kan de begynne å laste opp til andre. Kapasiteten i nettverket vokser med antall peers.",
    activePeers: ["p1", "p2", "p3", "p4", "p5"],
    flows: [
      { from: "p1", to: "p5", kind: "upload" },
      { from: "p1", to: "p2", kind: "upload" },
      { from: "p2", to: "p3", kind: "upload" },
    ],
    capacity: 0.5,
  },
  {
    mode: "p2p",
    title: "4. Full mesh — alle deler med alle",
    description:
      "Alle peers har minst en del av filen. Hver peer laster ned biter den mangler og laster opp biter den har. Det er ingen flaskehals — den totale kapasiteten er summen av alle peer-opplastnings-rater.",
    activePeers: ["p1", "p2", "p3", "p4", "p5", "p6", "p7"],
    flows: [
      { from: "p1", to: "p2", kind: "upload" },
      { from: "p2", to: "p3", kind: "upload" },
      { from: "p3", to: "p4", kind: "upload" },
      { from: "p4", to: "p5", kind: "upload" },
      { from: "p5", to: "p6", kind: "upload" },
      { from: "p6", to: "p7", kind: "upload" },
      { from: "p7", to: "p1", kind: "upload" },
      { from: "p2", to: "p5", kind: "upload" },
      { from: "p3", to: "p6", kind: "upload" },
    ],
    capacity: 0.95,
  },
  {
    mode: "p2p",
    title: "5. En peer drar — swarm-en lever videre",
    description:
      "P4 logger av. Filene den hadde, finnes hos resten av peer-ene (de har fått biter via mesh-en). De andre fortsetter uten avbrudd. Ingen sentral feil — desentralisering gir innebygd redundans, men man stoler på fremmede maskiner og må håndtere upålitelige peers (free-riders, ondsinnede).",
    activePeers: ["p1", "p2", "p3", "p5", "p6", "p7"],
    flows: [
      { from: "p1", to: "p2", kind: "upload" },
      { from: "p2", to: "p3", kind: "upload" },
      { from: "p3", to: "p6", kind: "upload" },
      { from: "p6", to: "p7", kind: "upload" },
      { from: "p7", to: "p5", kind: "upload" },
      { from: "p5", to: "p1", kind: "upload" },
    ],
    capacity: 0.78,
  },
];

const COLOR_FILL: Record<Flow["kind"], string> = {
  request: "fill-emerald-500",
  response: "fill-brand",
  control: "fill-purple-500",
  upload: "fill-amber-500",
  down: "fill-rose-500",
};
const COLOR_BG: Record<Flow["kind"], string> = {
  request: "bg-emerald-500",
  response: "bg-brand",
  control: "bg-purple-500",
  upload: "bg-amber-500",
  down: "bg-rose-500",
};

export function Section21Live() {
  const [mode, setMode] = useState<Mode>("cs");
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0..1 innen steget

  const steps: Step[] = mode === "cs" ? CS_STEPS : P2P_STEPS;
  const step = steps[stepIdx];

  // Animasjons-loop
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const SPEED = 1 / 2500; // ~2.5 s per steg
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

  // Resett ved modus-bytte
  function switchMode(next: Mode) {
    if (next === mode) return;
    setMode(next);
    setStepIdx(0);
    setProgress(0);
    setPlaying(false);
  }

  function nextStep() {
    setStepIdx((i) => Math.min(steps.length - 1, i + 1));
    setProgress(0);
  }
  function prevStep() {
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
      {/* Modus-toggle */}
      <div className="bg-muted/30 px-4 py-2 text-xs text-muted-foreground border-b border-border flex items-center gap-2 flex-wrap">
        <span className="font-medium text-foreground">{step.title}</span>
        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={() => switchMode("cs")}
            className={`inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium transition-colors ${
              mode === "cs"
                ? "bg-brand/15 text-brand"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Server className="h-3 w-3" /> Klient-server
          </button>
          <button
            onClick={() => switchMode("p2p")}
            className={`inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium transition-colors ${
              mode === "p2p"
                ? "bg-brand/15 text-brand"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Users className="h-3 w-3" /> P2P
          </button>
          <span className="ml-2 font-mono">
            Steg {stepIdx + 1} / {steps.length}
          </span>
        </div>
      </div>

      {/* SVG-visualisering */}
      <svg viewBox="0 0 800 360" className="w-full h-auto bg-muted/10">
        {mode === "cs" ? (
          <CsScene step={step as CSStep} progress={progress} />
        ) : (
          <P2pScene step={step as P2PStep} progress={progress} />
        )}
      </svg>

      {/* Beskrivelse */}
      <div className="px-4 py-3 text-sm text-muted-foreground border-t border-border">
        {step.description}
      </div>

      {/* Last/kapasitet-bar */}
      <div className="px-4 py-2 border-t border-border bg-muted/20">
        {mode === "cs" ? (
          <ServerLoadBar load={(step as CSStep).serverLoad} down={!!(step as CSStep).serverDown} />
        ) : (
          <CapacityBar capacity={(step as P2PStep).capacity} />
        )}
      </div>

      {/* Kontroller */}
      <div className="px-4 py-2 flex flex-wrap items-center gap-1.5 border-t border-border bg-muted/20">
        <button
          onClick={prevStep}
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
          onClick={nextStep}
          disabled={stepIdx === steps.length - 1}
          className="inline-flex items-center gap-1 rounded border border-border bg-background px-2 py-1 text-xs hover:border-brand/60 disabled:opacity-40"
        >
          Neste <SkipForward className="h-3 w-3" />
        </button>
        <button
          onClick={reset}
          className="inline-flex items-center gap-1 rounded border border-border bg-background px-2 py-1 text-xs hover:border-brand/60 ml-auto"
          title="Reset"
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
              aria-label={`Gå til steg ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 py-2 flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground border-t border-border">
        <span className={`inline-block w-2 h-2 rounded-full ${COLOR_BG.request}`} /> Request
        <span className={`inline-block w-2 h-2 rounded-full ${COLOR_BG.response}`} /> Response
        <span className={`inline-block w-2 h-2 rounded-full ${COLOR_BG.upload}`} /> P2P-overføring
        <span className={`inline-block w-2 h-2 rounded-full ${COLOR_BG.control}`} /> Kontroll/oppdage
      </div>
    </div>
  );
}

// ============================================================
// Klient-server-scene
// ============================================================
function CsScene({ step, progress }: { step: CSStep; progress: number }) {
  const serverActive = !step.serverDown;
  return (
    <>
      {/* Linjer fra alle klienter til server */}
      {CS_CLIENTS.map((c) => {
        const isActive = step.activeClients.includes(c.id);
        return (
          <line
            key={c.id}
            x1={c.x}
            y1={c.y}
            x2={CS_SERVER.x}
            y2={CS_SERVER.y}
            className={isActive ? "stroke-foreground/60" : "stroke-muted-foreground/20"}
            strokeWidth={isActive ? 1.6 : 1}
            strokeDasharray={isActive ? undefined : "3 3"}
          />
        );
      })}

      {/* Server */}
      <g opacity={serverActive ? 1 : 0.35}>
        <rect
          x={CS_SERVER.x - 36}
          y={CS_SERVER.y - 28}
          width={72}
          height={56}
          rx={4}
          className={
            serverActive
              ? step.serverLoad > 0.8
                ? "fill-rose-500/20 stroke-rose-500"
                : step.serverLoad > 0.5
                  ? "fill-amber-500/15 stroke-amber-500"
                  : "fill-success/15 stroke-success"
              : "fill-card stroke-muted-foreground/40"
          }
          strokeWidth={2}
        />
        {[0, 1, 2].map((i) => (
          <line
            key={i}
            x1={CS_SERVER.x - 26}
            y1={CS_SERVER.y - 14 + i * 10}
            x2={CS_SERVER.x + 26}
            y2={CS_SERVER.y - 14 + i * 10}
            className={serverActive ? "stroke-foreground/30" : "stroke-muted-foreground/30"}
          />
        ))}
        <text
          x={CS_SERVER.x}
          y={CS_SERVER.y + 46}
          textAnchor="middle"
          className="fill-foreground text-[11px] font-semibold"
        >
          {CS_SERVER.label}
        </text>
        <text
          x={CS_SERVER.x}
          y={CS_SERVER.y + 58}
          textAnchor="middle"
          className="fill-muted-foreground text-[9px]"
        >
          {CS_SERVER.sub}
        </text>
      </g>

      {/* X over server hvis nede */}
      {step.serverDown && (
        <g className="stroke-rose-500" strokeWidth={3} strokeLinecap="round">
          <line
            x1={CS_SERVER.x - 30}
            y1={CS_SERVER.y - 22}
            x2={CS_SERVER.x + 30}
            y2={CS_SERVER.y + 22}
          />
          <line
            x1={CS_SERVER.x + 30}
            y1={CS_SERVER.y - 22}
            x2={CS_SERVER.x - 30}
            y2={CS_SERVER.y + 22}
          />
        </g>
      )}

      {/* Klienter */}
      {CS_CLIENTS.map((c) => {
        const isActive = step.activeClients.includes(c.id);
        return (
          <g key={c.id} opacity={isActive ? 1 : 0.4}>
            <circle
              cx={c.x}
              cy={c.y}
              r={16}
              className={
                isActive ? "fill-brand/20 stroke-brand" : "fill-card stroke-muted-foreground/40"
              }
              strokeWidth={2}
            />
            <text
              x={c.x}
              y={c.y + 4}
              textAnchor="middle"
              className="fill-foreground text-[10px] font-bold"
            >
              {c.label}
            </text>
          </g>
        );
      })}

      {/* Pakker */}
      {step.flows.map((f, i) => {
        const a = resolveCsNode(f.from);
        const b = resolveCsNode(f.to);
        if (!a || !b) return null;
        const x = a.x + (b.x - a.x) * progress;
        const y = a.y + (b.y - a.y) * progress;
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={6}
            className={`${COLOR_FILL[f.kind]} stroke-background`}
            strokeWidth={1.5}
          />
        );
      })}
    </>
  );
}

function resolveCsNode(id: string): { x: number; y: number } | null {
  if (id === "server") return CS_SERVER;
  return CS_CLIENTS.find((c) => c.id === id) ?? null;
}

// ============================================================
// P2P-scene
// ============================================================
function P2pScene({ step, progress }: { step: P2PStep; progress: number }) {
  // Bakgrunns-mesh: tegn svake linjer mellom alle aktive peers
  const activeSet = useMemo(() => new Set(step.activePeers), [step.activePeers]);
  const meshLines: { a: { x: number; y: number }; b: { x: number; y: number }; key: string }[] =
    useMemo(() => {
      const lines = [];
      const active = P2P_PEERS.filter((p) => activeSet.has(p.id));
      for (let i = 0; i < active.length; i++) {
        for (let j = i + 1; j < active.length; j++) {
          lines.push({ a: active[i], b: active[j], key: `${active[i].id}-${active[j].id}` });
        }
      }
      return lines;
    }, [activeSet]);

  return (
    <>
      {/* Mesh-bakgrunn — svake linjer mellom aktive peers */}
      {meshLines.map((m) => (
        <line
          key={m.key}
          x1={m.a.x}
          y1={m.a.y}
          x2={m.b.x}
          y2={m.b.y}
          className="stroke-purple-500/20"
          strokeWidth={0.7}
        />
      ))}

      {/* Aktive flow-linjer hevet */}
      {step.flows.map((f, i) => {
        const a = P2P_PEERS.find((p) => p.id === f.from);
        const b = P2P_PEERS.find((p) => p.id === f.to);
        if (!a || !b) return null;
        return (
          <line
            key={`flow-${i}`}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            className="stroke-amber-500/50"
            strokeWidth={1.5}
          />
        );
      })}

      {/* Peers */}
      {P2P_PEERS.map((p) => {
        const isActive = activeSet.has(p.id);
        return (
          <g key={p.id} opacity={isActive ? 1 : 0.3}>
            <circle
              cx={p.x}
              cy={p.y}
              r={18}
              className={
                isActive
                  ? "fill-purple-500/20 stroke-purple-500"
                  : "fill-card stroke-muted-foreground/30"
              }
              strokeWidth={2}
            />
            <text
              x={p.x}
              y={p.y + 4}
              textAnchor="middle"
              className="fill-foreground text-[10px] font-bold"
            >
              {p.label}
            </text>
          </g>
        );
      })}

      {/* Pakker */}
      {step.flows.map((f, i) => {
        const a = P2P_PEERS.find((p) => p.id === f.from);
        const b = P2P_PEERS.find((p) => p.id === f.to);
        if (!a || !b) return null;
        const x = a.x + (b.x - a.x) * progress;
        const y = a.y + (b.y - a.y) * progress;
        return (
          <circle
            key={`pkt-${i}`}
            cx={x}
            cy={y}
            r={6}
            className={`${COLOR_FILL[f.kind]} stroke-background`}
            strokeWidth={1.5}
          />
        );
      })}
    </>
  );
}

// ============================================================
// Server-last-indikator (klient-server-modus)
// ============================================================
function ServerLoadBar({ load, down }: { load: number; down: boolean }) {
  const pct = Math.round(load * 100);
  const color =
    down ? "bg-rose-500" : load > 0.8 ? "bg-rose-500" : load > 0.5 ? "bg-amber-500" : "bg-success";
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-muted-foreground">Server-belastning</span>
        <span className="font-mono text-foreground">{down ? "NEDE" : `${pct}%`}</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-500`}
          style={{ width: down ? "100%" : `${pct}%` }}
        />
      </div>
      <p className="text-[10px] text-muted-foreground">
        {down
          ? "Single point of failure — ingen klient når serveren"
          : load > 0.8
            ? "Metning — latens øker, requests står i kø"
            : load > 0.5
              ? "Moderat last — innenfor kapasitet"
              : "Lav last — kjapp respons"}
      </p>
    </div>
  );
}

// ============================================================
// Kapasitets-indikator (P2P-modus)
// ============================================================
function CapacityBar({ capacity }: { capacity: number }) {
  const pct = Math.round(capacity * 100);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-muted-foreground">Total swarm-kapasitet</span>
        <span className="font-mono text-foreground">{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full bg-purple-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-[10px] text-muted-foreground">
        Kapasiteten = sum av peer-opplastingsrater. Vokser med antall peers, ikke begrenset av én
        sentral maskin.
      </p>
    </div>
  );
}
