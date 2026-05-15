import { useEffect, useMemo, useRef, useState } from "react";
import { Play, Pause, RotateCcw, StepForward, Send, Shield, AlertTriangle } from "lucide-react";

// --------------------------------------------------------------------------
// Interaktiv NAT-translasjons-visualisering.
//
// Layout:
//   VENSTRE          MIDTEN                     HØYRE
//   H1, H2           NAT-ruter + NAT-tabell     S1, S2
//   (interne)        (offentlig IP 203.0.113.7) (eksterne servere)
//
// En forhåndsberegnet pakke-tidslinje styrer animasjonen. Hver pakke har en
// "leg" (etappe) — en vektor fra (x1,y1) til (x2,y2) — og en serie hendelser
// langs den (rewrite på inngang til NAT, tabell-oppslag på vei tilbake, osv).
// SVG <rect> for hver levende pakke; vi animerer via CSS transitions på de
// inline style-koordinatene som re-renderes hvert "tick".
// --------------------------------------------------------------------------

type Scenario = "out" | "collision" | "inbound" | "forward";

type NatRow = {
  privateIp: string;
  privatePort: number;
  publicIp: string;
  publicPort: number;
  externalIp: string;
  externalPort: number;
  ttl: number;
  static?: boolean; // port-forwarding-regel
};

type LogEntry = {
  step: number;
  label: string;
  beforeSrc?: string;
  beforeDst?: string;
  afterSrc?: string;
  afterDst?: string;
  note?: string;
  variant?: "ok" | "warn" | "info";
};

type NodeKey = "H1" | "H2" | "NAT" | "S1" | "S2";

type Frame = {
  /** Hvor pakken er ved START av dette steget (key + lateral offset for å unngå overlapp) */
  from: NodeKey;
  /** Hvor pakken er ved SLUTT av dette steget */
  to: NodeKey;
  /** Header etiketten viser ved start (src→dst) */
  headerStart: string;
  /** Header etiketten viser ved slutt (etter eventuell rewrite) */
  headerEnd: string;
  /** Farge på pakken (Tailwind klasse-streng) */
  color: string;
  /** Beskrivelse til log */
  description: string;
  /** Eventuell tabell-oppdatering som skal skje før dette steget vises */
  tableMutation?: (rows: NatRow[]) => NatRow[];
  /** Log-entry å pushe når dette steget begynner */
  logEntry?: Omit<LogEntry, "step">;
  /** Om pakken faktisk når frem (false = drop / ikke ruta) */
  dropped?: boolean;
};

// Koordinater for hver node i SVG-koordinatsystemet
const COORDS: Record<NodeKey, { x: number; y: number }> = {
  H1: { x: 90, y: 90 },
  H2: { x: 90, y: 230 },
  NAT: { x: 380, y: 160 },
  S1: { x: 680, y: 90 },
  S2: { x: 680, y: 230 },
};

const PUBLIC_IP = "203.0.113.7";

const SCENARIOS: { id: Scenario; label: string; sub: string }[] = [
  { id: "out", label: "Utgående oversettelse", sub: "H1 → S1 og svar tilbake" },
  { id: "collision", label: "Port-kollisjon", sub: "H1 og H2 velger samme port" },
  { id: "inbound", label: "Innkommende uten regel", sub: "Ekstern → privat IP" },
  { id: "forward", label: "Port-forwarding", sub: "Statisk regel — S1 → H1" },
];

// ----------------------------------------------------------------------
// SCENARIO 1: Utgående oversettelse
// ----------------------------------------------------------------------
function buildOutboundFrames(): Frame[] {
  const blue = "fill-sky-500";
  return [
    {
      from: "H1",
      to: "NAT",
      headerStart: "src=10.0.0.5:3000 dst=8.8.8.8:80",
      headerEnd: "src=10.0.0.5:3000 dst=8.8.8.8:80",
      color: blue,
      description: "H1 sender ut TCP-pakke mot S1",
      logEntry: {
        label: "H1 → NAT (utgående)",
        beforeSrc: "10.0.0.5:3000",
        beforeDst: "8.8.8.8:80",
        afterSrc: "10.0.0.5:3000",
        afterDst: "8.8.8.8:80",
        note: "Pakken kommer til NAT-ruterens LAN-side.",
        variant: "info",
      },
    },
    {
      from: "NAT",
      to: "S1",
      headerStart: "src=203.0.113.7:5001 dst=8.8.8.8:80",
      headerEnd: "src=203.0.113.7:5001 dst=8.8.8.8:80",
      color: blue,
      description: "NAT skriver om src→ (203.0.113.7, 5001), lagrer rad",
      tableMutation: (rows) => [
        ...rows,
        {
          privateIp: "10.0.0.5",
          privatePort: 3000,
          publicIp: PUBLIC_IP,
          publicPort: 5001,
          externalIp: "8.8.8.8",
          externalPort: 80,
          ttl: 60,
        },
      ],
      logEntry: {
        label: "NAT → S1 (rewrite + lagring)",
        beforeSrc: "10.0.0.5:3000",
        beforeDst: "8.8.8.8:80",
        afterSrc: "203.0.113.7:5001",
        afterDst: "8.8.8.8:80",
        note: "Mapping lagt til i NAT-tabellen.",
        variant: "ok",
      },
    },
    {
      from: "S1",
      to: "NAT",
      headerStart: "src=8.8.8.8:80 dst=203.0.113.7:5001",
      headerEnd: "src=8.8.8.8:80 dst=203.0.113.7:5001",
      color: "fill-emerald-500",
      description: "S1 svarer — destination = WAN-IP og tildelt port",
      logEntry: {
        label: "S1 → NAT (svar inn)",
        beforeSrc: "8.8.8.8:80",
        beforeDst: "203.0.113.7:5001",
        afterSrc: "8.8.8.8:80",
        afterDst: "203.0.113.7:5001",
        note: "Svar-pakken kommer til ruterens WAN-side.",
        variant: "info",
      },
    },
    {
      from: "NAT",
      to: "H1",
      headerStart: "src=8.8.8.8:80 dst=10.0.0.5:3000",
      headerEnd: "src=8.8.8.8:80 dst=10.0.0.5:3000",
      color: "fill-emerald-500",
      description: "Tabell-oppslag på (5001) → dst skrives tilbake til H1",
      logEntry: {
        label: "NAT → H1 (reverse rewrite)",
        beforeSrc: "8.8.8.8:80",
        beforeDst: "203.0.113.7:5001",
        afterSrc: "8.8.8.8:80",
        afterDst: "10.0.0.5:3000",
        note: "Oppslag i NAT-tabell finner privat (IP,port).",
        variant: "ok",
      },
    },
  ];
}

// ----------------------------------------------------------------------
// SCENARIO 2: Port-kollisjon
// ----------------------------------------------------------------------
function buildCollisionFrames(): Frame[] {
  const blue = "fill-sky-500";
  const amber = "fill-amber-500";
  return [
    {
      from: "H1",
      to: "NAT",
      headerStart: "src=10.0.0.5:3000 dst=8.8.8.8:80",
      headerEnd: "src=10.0.0.5:3000 dst=8.8.8.8:80",
      color: blue,
      description: "H1 sender med kilde-port 3000",
      logEntry: {
        label: "H1 → NAT",
        beforeSrc: "10.0.0.5:3000",
        beforeDst: "8.8.8.8:80",
        afterSrc: "10.0.0.5:3000",
        afterDst: "8.8.8.8:80",
        variant: "info",
      },
    },
    {
      from: "NAT",
      to: "S1",
      headerStart: "src=203.0.113.7:5001 dst=8.8.8.8:80",
      headerEnd: "src=203.0.113.7:5001 dst=8.8.8.8:80",
      color: blue,
      description: "NAT tildeler offentlig port 5001 til H1",
      tableMutation: (rows) => [
        ...rows,
        {
          privateIp: "10.0.0.5",
          privatePort: 3000,
          publicIp: PUBLIC_IP,
          publicPort: 5001,
          externalIp: "8.8.8.8",
          externalPort: 80,
          ttl: 60,
        },
      ],
      logEntry: {
        label: "NAT → S1 (H1)",
        beforeSrc: "10.0.0.5:3000",
        beforeDst: "8.8.8.8:80",
        afterSrc: "203.0.113.7:5001",
        afterDst: "8.8.8.8:80",
        note: "Første pakke: port 5001 tildelt.",
        variant: "ok",
      },
    },
    {
      from: "H2",
      to: "NAT",
      headerStart: "src=10.0.0.6:3000 dst=8.8.8.8:80",
      headerEnd: "src=10.0.0.6:3000 dst=8.8.8.8:80",
      color: amber,
      description: "H2 sender også med kilde-port 3000 (!)",
      logEntry: {
        label: "H2 → NAT",
        beforeSrc: "10.0.0.6:3000",
        beforeDst: "8.8.8.8:80",
        afterSrc: "10.0.0.6:3000",
        afterDst: "8.8.8.8:80",
        note: "Begge interne hoster valgte tilfeldigvis samme src-port.",
        variant: "warn",
      },
    },
    {
      from: "NAT",
      to: "S1",
      headerStart: "src=203.0.113.7:5002 dst=8.8.8.8:80",
      headerEnd: "src=203.0.113.7:5002 dst=8.8.8.8:80",
      color: amber,
      description: "NAT velger en ANNEN offentlig port (5002)",
      tableMutation: (rows) => [
        ...rows,
        {
          privateIp: "10.0.0.6",
          privatePort: 3000,
          publicIp: PUBLIC_IP,
          publicPort: 5002,
          externalIp: "8.8.8.8",
          externalPort: 80,
          ttl: 60,
        },
      ],
      logEntry: {
        label: "NAT → S1 (H2)",
        beforeSrc: "10.0.0.6:3000",
        beforeDst: "8.8.8.8:80",
        afterSrc: "203.0.113.7:5002",
        afterDst: "8.8.8.8:80",
        note: "5001 var opptatt — H2 får 5002. Ingen kollisjon.",
        variant: "ok",
      },
    },
    {
      from: "S1",
      to: "NAT",
      headerStart: "src=8.8.8.8:80 dst=203.0.113.7:5001",
      headerEnd: "src=8.8.8.8:80 dst=203.0.113.7:5001",
      color: "fill-emerald-500",
      description: "Svar til H1 (port 5001)",
      logEntry: {
        label: "S1 → NAT (til H1)",
        beforeSrc: "8.8.8.8:80",
        beforeDst: "203.0.113.7:5001",
        afterSrc: "8.8.8.8:80",
        afterDst: "203.0.113.7:5001",
        variant: "info",
      },
    },
    {
      from: "NAT",
      to: "H1",
      headerStart: "src=8.8.8.8:80 dst=10.0.0.5:3000",
      headerEnd: "src=8.8.8.8:80 dst=10.0.0.5:3000",
      color: "fill-emerald-500",
      description: "Tabell sier 5001 → 10.0.0.5:3000",
      logEntry: {
        label: "NAT → H1",
        beforeSrc: "8.8.8.8:80",
        beforeDst: "203.0.113.7:5001",
        afterSrc: "8.8.8.8:80",
        afterDst: "10.0.0.5:3000",
        note: "Tabell-oppslag på 5001 entydig.",
        variant: "ok",
      },
    },
    {
      from: "S1",
      to: "NAT",
      headerStart: "src=8.8.8.8:80 dst=203.0.113.7:5002",
      headerEnd: "src=8.8.8.8:80 dst=203.0.113.7:5002",
      color: "fill-emerald-500",
      description: "Svar til H2 (port 5002)",
      logEntry: {
        label: "S1 → NAT (til H2)",
        beforeSrc: "8.8.8.8:80",
        beforeDst: "203.0.113.7:5002",
        afterSrc: "8.8.8.8:80",
        afterDst: "203.0.113.7:5002",
        variant: "info",
      },
    },
    {
      from: "NAT",
      to: "H2",
      headerStart: "src=8.8.8.8:80 dst=10.0.0.6:3000",
      headerEnd: "src=8.8.8.8:80 dst=10.0.0.6:3000",
      color: "fill-emerald-500",
      description: "Tabell sier 5002 → 10.0.0.6:3000",
      logEntry: {
        label: "NAT → H2",
        beforeSrc: "8.8.8.8:80",
        beforeDst: "203.0.113.7:5002",
        afterSrc: "8.8.8.8:80",
        afterDst: "10.0.0.6:3000",
        note: "Hver host får riktig svar takket være ulike offentlige porter.",
        variant: "ok",
      },
    },
  ];
}

// ----------------------------------------------------------------------
// SCENARIO 3: Innkommende uten regel — pakken kan ikke leveres
// ----------------------------------------------------------------------
function buildInboundFrames(): Frame[] {
  return [
    {
      from: "S2",
      to: "NAT",
      headerStart: "src=140.82.121.4:9000 dst=10.0.0.5:80",
      headerEnd: "src=140.82.121.4:9000 dst=10.0.0.5:80",
      color: "fill-rose-500",
      description: "S2 forsøker direkte mot privat IP 10.0.0.5",
      logEntry: {
        label: "S2 → NAT (uoppfordret)",
        beforeSrc: "140.82.121.4:9000",
        beforeDst: "10.0.0.5:80",
        note: "Privat dst-IP er ikke rutbar offentlig — i praksis kastes pakken av ISP-en allerede. Tegnet her for å vise problemet.",
        variant: "warn",
      },
    },
    {
      from: "NAT",
      to: "NAT",
      headerStart: "DROP: ingen tabell-treff",
      headerEnd: "DROP: ingen tabell-treff",
      color: "fill-rose-600",
      description: "Ingen mapping → NAT vet ikke hvor pakken skal",
      dropped: true,
      logEntry: {
        label: "NAT slipper pakken",
        note: "Ingen rad i tabellen matcher (203.0.113.7, port). Uten port-forwarding eller hull-stikking når ingen ekstern initiering frem.",
        variant: "warn",
      },
    },
  ];
}

// ----------------------------------------------------------------------
// SCENARIO 4: Port-forwarding — pre-installert statisk regel
// ----------------------------------------------------------------------
function buildForwardFrames(): Frame[] {
  return [
    {
      from: "S2",
      to: "NAT",
      headerStart: "src=140.82.121.4:9000 dst=203.0.113.7:80",
      headerEnd: "src=140.82.121.4:9000 dst=203.0.113.7:80",
      color: "fill-violet-500",
      description: "Ekstern klient treffer WAN-IP:80",
      logEntry: {
        label: "S2 → NAT (port 80)",
        beforeSrc: "140.82.121.4:9000",
        beforeDst: "203.0.113.7:80",
        afterSrc: "140.82.121.4:9000",
        afterDst: "203.0.113.7:80",
        variant: "info",
      },
    },
    {
      from: "NAT",
      to: "H1",
      headerStart: "src=140.82.121.4:9000 dst=10.0.0.5:80",
      headerEnd: "src=140.82.121.4:9000 dst=10.0.0.5:80",
      color: "fill-violet-500",
      description: "Statisk regel: 203.0.113.7:80 → 10.0.0.5:80",
      logEntry: {
        label: "NAT → H1 (port-fwd)",
        beforeSrc: "140.82.121.4:9000",
        beforeDst: "203.0.113.7:80",
        afterSrc: "140.82.121.4:9000",
        afterDst: "10.0.0.5:80",
        note: "Statisk regel matcher — dst skrives om til intern host.",
        variant: "ok",
      },
    },
    {
      from: "H1",
      to: "NAT",
      headerStart: "src=10.0.0.5:80 dst=140.82.121.4:9000",
      headerEnd: "src=10.0.0.5:80 dst=140.82.121.4:9000",
      color: "fill-emerald-500",
      description: "H1 svarer på henvendelsen",
      logEntry: {
        label: "H1 → NAT (svar)",
        beforeSrc: "10.0.0.5:80",
        beforeDst: "140.82.121.4:9000",
        afterSrc: "10.0.0.5:80",
        afterDst: "140.82.121.4:9000",
        variant: "info",
      },
    },
    {
      from: "NAT",
      to: "S2",
      headerStart: "src=203.0.113.7:80 dst=140.82.121.4:9000",
      headerEnd: "src=203.0.113.7:80 dst=140.82.121.4:9000",
      color: "fill-emerald-500",
      description: "NAT skriver src→ WAN-IP for å bevare returveien",
      logEntry: {
        label: "NAT → S2",
        beforeSrc: "10.0.0.5:80",
        beforeDst: "140.82.121.4:9000",
        afterSrc: "203.0.113.7:80",
        afterDst: "140.82.121.4:9000",
        note: "Klienten ser bare WAN-IP — den vet ikke at det er en intern host.",
        variant: "ok",
      },
    },
  ];
}

function getInitialRows(scenario: Scenario): NatRow[] {
  if (scenario === "forward") {
    return [
      {
        privateIp: "10.0.0.5",
        privatePort: 80,
        publicIp: PUBLIC_IP,
        publicPort: 80,
        externalIp: "*",
        externalPort: 0,
        ttl: Infinity,
        static: true,
      },
    ];
  }
  return [];
}

function getFrames(scenario: Scenario): Frame[] {
  switch (scenario) {
    case "out":
      return buildOutboundFrames();
    case "collision":
      return buildCollisionFrames();
    case "inbound":
      return buildInboundFrames();
    case "forward":
      return buildForwardFrames();
  }
}

const SCENARIO_NOTE: Record<Scenario, string> = {
  out: "Standardflyt: src-IP/port skrives om utgående, og oppslag i tabell reverserer på vei inn.",
  collision: "Selv om begge interne hoster bruker samme src-port, garanterer NAT unike offentlige porter.",
  inbound: "NAT er asymmetrisk: forbindelser må initieres innenfra for at en mapping skal finnes.",
  forward: "En statisk regel åpner én tjeneste utad — typisk for hjemmeservere bak NAT.",
};

// ----------------------------------------------------------------------
// Hovedkomponent
// ----------------------------------------------------------------------
export function NatVisualizer() {
  const [scenario, setScenario] = useState<Scenario>("out");
  const [rows, setRows] = useState<NatRow[]>(() => getInitialRows("out"));
  const [log, setLog] = useState<LogEntry[]>([]);
  const [step, setStep] = useState(0); // hvor mange frames vi har spilt av
  const [playing, setPlaying] = useState(false);
  const [packetAtEnd, setPacketAtEnd] = useState(true); // pakke vises i to-posisjon (true) eller from-posisjon
  const timerRef = useRef<number | null>(null);

  const frames = useMemo(() => getFrames(scenario), [scenario]);
  const totalSteps = frames.length;
  const currentFrame: Frame | null = step > 0 ? frames[step - 1] : null;

  const reset = (s: Scenario = scenario) => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setPlaying(false);
    setStep(0);
    setRows(getInitialRows(s));
    setLog([]);
    setPacketAtEnd(true);
  };

  const switchScenario = (s: Scenario) => {
    setScenario(s);
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setPlaying(false);
    setStep(0);
    setRows(getInitialRows(s));
    setLog([]);
    setPacketAtEnd(true);
  };

  const advance = () => {
    if (step >= totalSteps) return false;
    const next = frames[step];
    if (next.tableMutation) {
      setRows((r) => next.tableMutation!(r));
    }
    if (next.logEntry) {
      setLog((l) => [{ step: step + 1, ...next.logEntry! }, ...l].slice(0, 20));
    }
    // Sett pakken på from-posisjon, så animer til to-posisjon
    setPacketAtEnd(false);
    setStep(step + 1);
    // Etter neste tick, sett til end-posisjon (CSS transition tar over)
    window.setTimeout(() => setPacketAtEnd(true), 30);
    return true;
  };

  // Play-loop
  useEffect(() => {
    if (!playing) return;
    if (step >= totalSteps) {
      setPlaying(false);
      return;
    }
    timerRef.current = window.setTimeout(() => {
      if (step >= totalSteps) {
        setPlaying(false);
        return;
      }
      advance();
    }, 1100);
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, step, totalSteps]);

  // Tilbakestill når komponenten unmountes
  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  // Beregn pakkens nåværende posisjon
  const packetPos = (() => {
    if (!currentFrame) return null;
    const from = COORDS[currentFrame.from];
    const to = COORDS[currentFrame.to];
    const pos = packetAtEnd ? to : from;
    return { x: pos.x, y: pos.y, header: packetAtEnd ? currentFrame.headerEnd : currentFrame.headerStart, color: currentFrame.color, dropped: currentFrame.dropped };
  })();

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      {/* Topp-bar */}
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Interaktiv visualisering
            </div>
            <div className="text-sm font-semibold">
              NAT-translasjon — pakker, tabell og port-forwarding
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (step >= totalSteps) reset();
                else advance();
              }}
              disabled={playing}
              className="text-xs inline-flex items-center gap-1 px-2 py-1 rounded border border-border hover:bg-muted disabled:opacity-40"
            >
              <StepForward className="h-3 w-3" />
              Steg
            </button>
            <button
              type="button"
              onClick={() => {
                if (step >= totalSteps) {
                  reset();
                  setTimeout(() => setPlaying(true), 50);
                  return;
                }
                setPlaying((p) => !p);
              }}
              className="text-xs inline-flex items-center gap-1 px-2 py-1 rounded border border-border hover:bg-muted"
            >
              {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              {playing ? "Pause" : "Spill"}
            </button>
            <button
              type="button"
              onClick={() => reset()}
              className="text-xs inline-flex items-center gap-1 px-2 py-1 rounded border border-border hover:bg-muted"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => switchScenario(s.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                scenario === s.id
                  ? "bg-brand text-brand-foreground border-brand"
                  : "border-border hover:bg-muted"
              }`}
              title={s.sub}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="mt-2 text-xs text-muted-foreground italic">
          {SCENARIO_NOTE[scenario]}
        </div>
      </div>

      {/* Hurtigknapper for å spille de tre vanligste flytene */}
      <div className="px-4 py-2 border-b border-border bg-muted/10 flex flex-wrap gap-1.5 text-xs">
        <button
          type="button"
          onClick={() => {
            switchScenario("out");
            setTimeout(() => setPlaying(true), 80);
          }}
          className="inline-flex items-center gap-1 px-2 py-1 rounded border border-border hover:bg-muted"
        >
          <Send className="h-3 w-3" />
          Send pakke fra H1
        </button>
        <button
          type="button"
          onClick={() => {
            switchScenario("collision");
            setTimeout(() => setPlaying(true), 80);
          }}
          className="inline-flex items-center gap-1 px-2 py-1 rounded border border-border hover:bg-muted"
        >
          <Send className="h-3 w-3" />
          Send pakke fra H2 (kollisjon)
        </button>
        <button
          type="button"
          onClick={() => {
            switchScenario("inbound");
            setTimeout(() => setPlaying(true), 80);
          }}
          className="inline-flex items-center gap-1 px-2 py-1 rounded border border-border hover:bg-muted"
        >
          <Send className="h-3 w-3" />
          Send pakke utenfra
        </button>
        <span className="text-muted-foreground self-center ml-auto tabular-nums">
          Steg {Math.min(step, totalSteps)} / {totalSteps}
        </span>
      </div>

      {/* SVG-visning */}
      <div className="p-4 bg-background">
        <svg viewBox="0 0 760 320" className="w-full h-auto" style={{ maxHeight: 360 }}>
          {/* Nett-bakgrunn: LAN-zone og WAN-zone */}
          <rect x="20" y="30" width="280" height="270" fill="currentColor" className="text-sky-500/5" rx="12" />
          <rect x="460" y="30" width="280" height="270" fill="currentColor" className="text-rose-500/5" rx="12" />
          <text x="160" y="22" className="fill-sky-700 dark:fill-sky-300" fontSize="11" fontWeight="600" textAnchor="middle">
            Privatnett (LAN) — 10.0.0.0/24
          </text>
          <text x="600" y="22" className="fill-rose-700 dark:fill-rose-300" fontSize="11" fontWeight="600" textAnchor="middle">
            Offentlig Internett (WAN)
          </text>

          {/* Linjer mellom noder */}
          <line x1="170" y1="90" x2="320" y2="160" stroke="currentColor" className="text-border" strokeWidth="1.5" />
          <line x1="170" y1="230" x2="320" y2="160" stroke="currentColor" className="text-border" strokeWidth="1.5" />
          <line x1="440" y1="160" x2="600" y2="90" stroke="currentColor" className="text-border" strokeWidth="1.5" />
          <line x1="440" y1="160" x2="600" y2="230" stroke="currentColor" className="text-border" strokeWidth="1.5" />

          {/* Hosts */}
          <HostNode x={90} y={90} label="H1" ip="10.0.0.5" tone="sky" />
          <HostNode x={90} y={230} label="H2" ip="10.0.0.6" tone="amber" />
          <HostNode x={680} y={90} label="S1" ip="8.8.8.8" tone="emerald" />
          <HostNode x={680} y={230} label="S2" ip="140.82.121.4" tone="violet" />

          {/* NAT-ruter (større boks) */}
          <g>
            <rect
              x="320"
              y="120"
              width="120"
              height="80"
              rx="10"
              fill="currentColor"
              className="text-indigo-500/15 dark:text-indigo-400/20"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <text x="380" y="148" className="fill-foreground" fontSize="12" fontWeight="700" textAnchor="middle">
              NAT-ruter
            </text>
            <text x="380" y="166" className="fill-muted-foreground" fontSize="10" textAnchor="middle">
              WAN: {PUBLIC_IP}
            </text>
            <text x="380" y="184" className="fill-muted-foreground" fontSize="10" textAnchor="middle">
              LAN: 10.0.0.1
            </text>
          </g>

          {/* Pakke */}
          {packetPos && !packetPos.dropped && (
            <g
              style={{
                transition: "transform 900ms cubic-bezier(0.4, 0, 0.2, 1)",
                transform: `translate(${packetPos.x - 380}px, ${packetPos.y - 160}px)`,
              }}
            >
              <rect
                x={380 - 95}
                y={160 - 14}
                width="190"
                height="28"
                rx="6"
                className={packetPos.color}
                opacity="0.92"
              />
              <text
                x={380}
                y={160 + 4}
                className="fill-white"
                fontSize="10"
                fontWeight="600"
                textAnchor="middle"
              >
                {packetPos.header}
              </text>
            </g>
          )}
          {packetPos && packetPos.dropped && (
            <g>
              <rect
                x={380 - 95}
                y={160 - 14}
                width="190"
                height="28"
                rx="6"
                className="fill-rose-600"
                opacity="0.85"
              />
              <text
                x={380}
                y={160 + 4}
                className="fill-white"
                fontSize="10"
                fontWeight="700"
                textAnchor="middle"
              >
                DROP — ingen mapping
              </text>
            </g>
          )}
        </svg>

        {/* Beskrivelse av nåværende steg */}
        <div className="mt-2 min-h-[1.5rem] text-center text-xs text-muted-foreground">
          {currentFrame
            ? currentFrame.description
            : step === 0
              ? "Trykk Steg eller Spill for å starte scenariet."
              : "Ferdig — trykk Reset for å starte på nytt."}
        </div>
      </div>

      {/* NAT-tabell */}
      <div className="px-4 py-3 border-t border-border bg-muted/20">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
          <Shield className="h-3 w-3" />
          NAT-tabell
        </div>
        {rows.length === 0 ? (
          <div className="text-xs text-muted-foreground italic">
            Tom — ingen aktive mappings.
          </div>
        ) : (
          <div className="overflow-hidden rounded-md border border-border">
            <table className="w-full text-xs font-mono">
              <thead className="bg-muted/40 text-muted-foreground">
                <tr>
                  <th className="text-left px-3 py-1.5 font-semibold">Privat (IP:port)</th>
                  <th className="text-left px-3 py-1.5 font-semibold">Public (IP:port)</th>
                  <th className="text-left px-3 py-1.5 font-semibold">Ekstern (IP:port)</th>
                  <th className="text-left px-3 py-1.5 font-semibold">TTL</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="px-3 py-1.5">
                      {r.privateIp}:{r.privatePort}
                    </td>
                    <td className="px-3 py-1.5">
                      {r.publicIp}:{r.publicPort}
                    </td>
                    <td className="px-3 py-1.5">
                      {r.externalIp === "*" ? "*:*" : `${r.externalIp}:${r.externalPort}`}
                    </td>
                    <td className="px-3 py-1.5">
                      {r.static ? (
                        <span className="inline-flex items-center gap-1 text-violet-600 dark:text-violet-400">
                          <Shield className="h-3 w-3" />
                          statisk
                        </span>
                      ) : r.ttl === Infinity ? (
                        "∞"
                      ) : (
                        `${r.ttl}s`
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pakke-log */}
      <div className="px-4 py-3 border-t border-border bg-card">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
          Pakke-log (nyeste først)
        </div>
        {log.length === 0 ? (
          <div className="text-xs text-muted-foreground italic">
            Ingen pakker enda — start scenariet.
          </div>
        ) : (
          <ol className="space-y-1.5">
            {log.map((entry, i) => (
              <li
                key={`${entry.step}-${i}`}
                className={`rounded-md border px-3 py-2 text-xs ${
                  entry.variant === "ok"
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : entry.variant === "warn"
                      ? "border-amber-500/30 bg-amber-500/5"
                      : "border-border bg-muted/20"
                }`}
              >
                <div className="flex items-baseline gap-2">
                  <span className="text-muted-foreground tabular-nums w-6 text-right">
                    {entry.step}.
                  </span>
                  <span className="font-semibold">{entry.label}</span>
                  {entry.variant === "warn" && (
                    <AlertTriangle className="h-3 w-3 text-amber-600 inline-block" />
                  )}
                </div>
                {(entry.beforeSrc || entry.afterSrc) && (
                  <div className="mt-1 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0.5 font-mono text-[11px] pl-8">
                    {entry.beforeSrc && (
                      <div>
                        <span className="text-muted-foreground">før: </span>
                        <span>
                          src={entry.beforeSrc} dst={entry.beforeDst}
                        </span>
                      </div>
                    )}
                    {entry.afterSrc && entry.afterSrc !== entry.beforeSrc && (
                      <div>
                        <span className="text-muted-foreground">etter: </span>
                        <span>
                          src={entry.afterSrc} dst={entry.afterDst}
                        </span>
                      </div>
                    )}
                    {entry.afterSrc && entry.afterSrc === entry.beforeSrc && entry.afterDst !== entry.beforeDst && (
                      <div>
                        <span className="text-muted-foreground">etter: </span>
                        <span>
                          src={entry.afterSrc} dst={entry.afterDst}
                        </span>
                      </div>
                    )}
                  </div>
                )}
                {entry.note && (
                  <div className="pl-8 mt-1 text-muted-foreground italic">{entry.note}</div>
                )}
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Underkomponent for hver host/server-boks
// ----------------------------------------------------------------------
function HostNode({
  x,
  y,
  label,
  ip,
  tone,
}: {
  x: number;
  y: number;
  label: string;
  ip: string;
  tone: "sky" | "amber" | "emerald" | "violet";
}) {
  const toneClass: Record<typeof tone, string> = {
    sky: "text-sky-500/20 dark:text-sky-400/25",
    amber: "text-amber-500/20 dark:text-amber-400/25",
    emerald: "text-emerald-500/20 dark:text-emerald-400/25",
    violet: "text-violet-500/20 dark:text-violet-400/25",
  };
  const strokeTone: Record<typeof tone, string> = {
    sky: "text-sky-500",
    amber: "text-amber-500",
    emerald: "text-emerald-500",
    violet: "text-violet-500",
  };
  return (
    <g>
      <rect
        x={x - 60}
        y={y - 28}
        width="120"
        height="56"
        rx="10"
        fill="currentColor"
        className={toneClass[tone]}
        stroke="currentColor"
        strokeWidth="1.5"
        // re-bruk currentColor: stroke styres av neste linje
      />
      <rect
        x={x - 60}
        y={y - 28}
        width="120"
        height="56"
        rx="10"
        fill="none"
        stroke="currentColor"
        className={strokeTone[tone]}
        strokeWidth="1.5"
        opacity="0.5"
      />
      <text x={x} y={y - 6} className="fill-foreground" fontSize="13" fontWeight="700" textAnchor="middle">
        {label}
      </text>
      <text x={x} y={y + 11} className="fill-muted-foreground" fontSize="10" fontFamily="monospace" textAnchor="middle">
        {ip}
      </text>
    </g>
  );
}
