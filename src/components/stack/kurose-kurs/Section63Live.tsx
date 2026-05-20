import { useEffect, useMemo, useRef, useState } from "react";
import { Play, Pause, RotateCcw, FastForward } from "lucide-react";

// Levende seksjon 6.3 — CSMA/CD på klassisk delt-bus Ethernet
//
// Vi simulerer tre hosts (A, B, C) som henger på samme bus. Hver host har en
// liten kø med rammer den vil sende. Når en host vil sende:
//   1) Carrier sense: hører den på bussen — er det stille?
//   2) Hvis ja: begynn å sende, men fortsett å lytte.
//   3) Hvis to begynner å sende «samtidig» (innenfor propagasjons-vinduet),
//      kolliderer signalene. Begge merker det.
//   4) Begge sender et kort JAM-signal slik at alle hører kollisjonen.
//   5) Begge backer av eksponentielt: velg K ∈ {0..2^n - 1}, vent K·512 bit-tid.
//
// Vi visualiserer bussen som en horisontal stripe der signaler propagerer fra
// host-posisjonen utover. Når to signaler treffer hverandre, vises kollisjon.
//
// Simuleringen er deterministisk gitt seed — vi bruker en enkel LCG slik at
// "tilfeldig backoff" blir reproduserbar mellom omstart.

type HostId = "A" | "B" | "C";

type Host = {
  id: HostId;
  /** Posisjon langs bussen, 0..1. */
  pos: number;
  /** Antall rammer som ligger igjen i køen. */
  queueLeft: number;
  /** Hva host gjør akkurat nå. */
  state: HostState;
  /** Hvor mange ganger ramma denne hosten holder på med har kollidert. */
  collisionCount: number;
};

type HostState =
  | { kind: "idle" } // ikke noe å sende
  | { kind: "wait_carrier"; until: number } // venter til kanalen er stille (slot-mode)
  | { kind: "backoff"; until: number; chosenK: number } // venter etter kollisjon
  | { kind: "transmitting"; startedAt: number; sentBy: HostId; collidedAt?: number }
  | { kind: "jamming"; until: number };

type Signal = {
  id: number;
  /** Hvilken host sendte signalet. */
  src: HostId;
  /** Posisjon langs bussen der signalet ble injisert. */
  origin: number;
  /** Når signalet ble startet. */
  startedAt: number;
  /** Til hvilken tid signalet skal vare ut fra origin. */
  endAt: number;
  /** Om signalet er jam (rød) eller data (grønn). */
  jam: boolean;
};

type LogEntry = { t: number; msg: string; host?: HostId; kind: "info" | "collision" | "ok" };

// Bit-tid-konstanter — ikke realistiske, kun for animasjon
const FRAME_DUR = 600; // hvor lenge ett rammesignal kvasi-eksisterer
const JAM_DUR = 120;
const SLOT_TIME = 100; // "512 bit-times" pedagogisk slott
const PROP_SPEED = 25; // andel av bussen pr ms × 1000 — kjapp nok til at host B kollidert med A's signal raskt

function lcg(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

const HOSTS_INITIAL: Host[] = [
  { id: "A", pos: 0.1, queueLeft: 2, state: { kind: "idle" }, collisionCount: 0 },
  { id: "B", pos: 0.5, queueLeft: 2, state: { kind: "idle" }, collisionCount: 0 },
  { id: "C", pos: 0.85, queueLeft: 2, state: { kind: "idle" }, collisionCount: 0 },
];

export function Section63Live() {
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [hosts, setHosts] = useState<Host[]>(HOSTS_INITIAL);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const sigIdRef = useRef(0);
  const rngRef = useRef(lcg(42));

  // Initiering: alle 3 hostene vil prøve å sende rundt samme tid.
  useEffect(() => {
    setHosts((prev) =>
      prev.map((h, i) => ({
        ...h,
        state: { kind: "wait_carrier", until: 60 + i * 20 } as HostState,
      })),
    );
  }, []);

  // RAF-loop
  useEffect(() => {
    if (!playing) return;
    let raf: number;
    let last = performance.now();
    function step(now: number) {
      const dt = (now - last) * speed;
      last = now;
      setT((tt) => tt + dt);
      raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [playing, speed]);

  // Hovedlogikk — kjøres når t endres
  useEffect(() => {
    setHosts((prevHosts) => {
      const newSignals: Signal[] = [];
      const newLogs: LogEntry[] = [];
      // 1) Fjern utdaterte signaler
      const liveSignals = signals.filter((s) => t - s.startedAt < s.endAt);

      // 2) For hver host, oppdater state
      const updated: Host[] = prevHosts.map((h) => {
        const newState = { ...h.state };
        switch (newState.kind) {
          case "idle":
            return h;
          case "wait_carrier": {
            if (t < newState.until) return h;
            // Sjekk om kanalen er fri ved hostens posisjon nå
            const hasCarrier = signalsAt(liveSignals, h.pos, t);
            if (hasCarrier) {
              // Wait litt til (1-persistent: fortsett å prøve hvert 5. ms)
              return { ...h, state: { kind: "wait_carrier", until: t + 5 } };
            }
            // Send!
            newLogs.push({ t, msg: `${h.id} sender: kanal stille`, host: h.id, kind: "info" });
            const sig: Signal = {
              id: ++sigIdRef.current,
              src: h.id,
              origin: h.pos,
              startedAt: t,
              endAt: FRAME_DUR,
              jam: false,
            };
            newSignals.push(sig);
            return {
              ...h,
              state: { kind: "transmitting", startedAt: t, sentBy: h.id } as HostState,
            };
          }
          case "transmitting": {
            // Sjekk om vi har detektert en kollisjon (et fremmed signal har nådd vår posisjon)
            const incoming = liveSignals.find(
              (s) => s.src !== h.id && reachesAt(s, h.pos, t),
            );
            if (incoming && !newState.collidedAt) {
              newLogs.push({
                t,
                msg: `${h.id} merker kollisjon med ${incoming.src} → sender JAM`,
                host: h.id,
                kind: "collision",
              });
              // Begynn å jamme
              const jam: Signal = {
                id: ++sigIdRef.current,
                src: h.id,
                origin: h.pos,
                startedAt: t,
                endAt: JAM_DUR,
                jam: true,
              };
              newSignals.push(jam);
              return {
                ...h,
                collisionCount: h.collisionCount + 1,
                state: { kind: "jamming", until: t + JAM_DUR } as HostState,
              };
            }
            // Hvis ramma har vart sin tid uten kollisjon → ferdig sendt
            if (t - newState.startedAt >= FRAME_DUR) {
              newLogs.push({
                t,
                msg: `${h.id} ferdig sendt — ingen kollisjon`,
                host: h.id,
                kind: "ok",
              });
              const queueLeft = Math.max(0, h.queueLeft - 1);
              return {
                ...h,
                queueLeft,
                collisionCount: 0,
                state:
                  queueLeft > 0
                    ? ({ kind: "wait_carrier", until: t + SLOT_TIME } as HostState)
                    : ({ kind: "idle" } as HostState),
              };
            }
            return h;
          }
          case "jamming": {
            if (t < newState.until) return h;
            // Etter jam → backoff
            const n = Math.min(h.collisionCount, 10);
            const k = Math.floor(rngRef.current() * Math.pow(2, n));
            newLogs.push({
              t,
              msg: `${h.id} backoff: K=${k} (av 2^${n}), venter ${k * SLOT_TIME} ms`,
              host: h.id,
              kind: "info",
            });
            return {
              ...h,
              state: {
                kind: "backoff",
                until: t + k * SLOT_TIME,
                chosenK: k,
              } as HostState,
            };
          }
          case "backoff": {
            if (t < newState.until) return h;
            return { ...h, state: { kind: "wait_carrier", until: t } as HostState };
          }
          default:
            return h;
        }
      });

      if (newSignals.length > 0) {
        setSignals((prev) => [...prev, ...newSignals]);
      } else if (liveSignals.length !== signals.length) {
        setSignals(liveSignals);
      }
      if (newLogs.length > 0) {
        setLogs((prev) => [...newLogs.reverse(), ...prev].slice(0, 25));
      }
      return updated;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t]);

  function reset() {
    setT(0);
    setPlaying(false);
    setSignals([]);
    setLogs([]);
    rngRef.current = lcg(42);
    sigIdRef.current = 0;
    setHosts(
      HOSTS_INITIAL.map((h, i) => ({
        ...h,
        state: { kind: "wait_carrier", until: 60 + i * 20 } as HostState,
      })),
    );
  }

  // SVG-koordinater
  const VW = 800;
  const VH = 360;
  const BUS_Y = 220;
  const BUS_X1 = 50;
  const BUS_X2 = VW - 50;

  const livesSig = useMemo(
    () => signals.filter((s) => t - s.startedAt < s.endAt + 5),
    [signals, t],
  );

  // Detekter kollisjons-overlap for visualisering
  const collisionPoints = useMemo(() => {
    const pts: { x: number; t: number }[] = [];
    for (let i = 0; i < livesSig.length; i++) {
      for (let j = i + 1; j < livesSig.length; j++) {
        const a = livesSig[i];
        const b = livesSig[j];
        if (a.src === b.src) continue;
        // Finn x der signal-frontene fra a og b krysser hverandre i nåtid
        const ax = a.origin;
        const bx = b.origin;
        const at = t - a.startedAt;
        const bt = t - b.startedAt;
        const leftA = Math.max(0, ax - at * PROP_SPEED * 0.001);
        const rightA = Math.min(1, ax + at * PROP_SPEED * 0.001);
        const leftB = Math.max(0, bx - bt * PROP_SPEED * 0.001);
        const rightB = Math.min(1, bx + bt * PROP_SPEED * 0.001);
        const overlapL = Math.max(leftA, leftB);
        const overlapR = Math.min(rightA, rightB);
        if (overlapR > overlapL) {
          pts.push({ x: (overlapL + overlapR) / 2, t });
        }
      }
    }
    return pts;
  }, [livesSig, t]);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="bg-muted/30 px-4 py-2 text-xs text-muted-foreground border-b border-border flex items-center gap-3">
        <span className="font-medium text-foreground">
          Tre hosts på samme bus — CSMA/CD i sanntid
        </span>
        <span className="ml-auto font-mono">t = {Math.floor(t)} ms</span>
      </div>

      <svg viewBox={`0 0 ${VW} ${VH}`} className="w-full h-auto bg-muted/10">
        {/* Bus-stripe */}
        <line
          x1={BUS_X1}
          y1={BUS_Y}
          x2={BUS_X2}
          y2={BUS_Y}
          className="stroke-muted-foreground/50"
          strokeWidth={3}
        />
        <text x={BUS_X1} y={BUS_Y + 22} className="fill-muted-foreground text-[10px]">
          delt bus / coax — alle hører alt
        </text>

        {/* Signaler — propagerer i begge retninger fra origin */}
        {livesSig.map((s) => {
          const age = t - s.startedAt;
          if (age < 0) return null;
          const spread = age * PROP_SPEED * 0.001; // andel av bus
          const left = Math.max(0, s.origin - spread);
          const right = Math.min(1, s.origin + spread);
          const x1 = BUS_X1 + left * (BUS_X2 - BUS_X1);
          const x2 = BUS_X1 + right * (BUS_X2 - BUS_X1);
          // Fade ut når ramma «ferdig»
          const ageRel = age / s.endAt;
          const opacity = s.jam ? 0.9 : Math.max(0.15, 1 - ageRel * 0.5);
          return (
            <g key={s.id} opacity={opacity}>
              <rect
                x={x1}
                y={BUS_Y - 10}
                width={Math.max(0, x2 - x1)}
                height={20}
                rx={2}
                className={s.jam ? "fill-destructive" : fillClassFor(s.src)}
                fillOpacity={s.jam ? 0.6 : 0.45}
              />
            </g>
          );
        })}

        {/* Kollisjonspunkter */}
        {collisionPoints.map((p, i) => (
          <g key={i}>
            <circle
              cx={BUS_X1 + p.x * (BUS_X2 - BUS_X1)}
              cy={BUS_Y}
              r={12}
              className="fill-destructive"
              fillOpacity={0.6}
            >
              <animate attributeName="r" from="6" to="18" dur="0.4s" repeatCount="indefinite" />
              <animate
                attributeName="fill-opacity"
                from="0.7"
                to="0"
                dur="0.4s"
                repeatCount="indefinite"
              />
            </circle>
            <text
              x={BUS_X1 + p.x * (BUS_X2 - BUS_X1)}
              y={BUS_Y - 22}
              textAnchor="middle"
              className="fill-destructive text-[11px] font-bold"
            >
              KOLLISJON
            </text>
          </g>
        ))}

        {/* Hosts */}
        {hosts.map((h) => {
          const cx = BUS_X1 + h.pos * (BUS_X2 - BUS_X1);
          const hostY = 90;
          const stateColor = stateColorFor(h.state);
          return (
            <g key={h.id}>
              <line
                x1={cx}
                y1={hostY + 30}
                x2={cx}
                y2={BUS_Y}
                className="stroke-muted-foreground/40"
                strokeWidth={1.5}
              />
              <rect
                x={cx - 36}
                y={hostY - 20}
                width={72}
                height={50}
                rx={6}
                className={`fill-card ${strokeClassFor(h.id)}`}
                strokeWidth={1.5}
              />
              <text
                x={cx}
                y={hostY - 4}
                textAnchor="middle"
                className={`${textFillClassFor(h.id)} text-[14px] font-bold`}
              >
                Host {h.id}
              </text>
              <text
                x={cx}
                y={hostY + 12}
                textAnchor="middle"
                className="fill-foreground text-[10px]"
              >
                {stateText(h.state)}
              </text>
              <text
                x={cx}
                y={hostY + 24}
                textAnchor="middle"
                className="fill-muted-foreground text-[9px] font-mono"
              >
                {h.queueLeft} i kø · {h.collisionCount} koll.
              </text>
              {/* Status-pip rundt host */}
              <circle
                cx={cx + 30}
                cy={hostY - 14}
                r={4}
                className={stateColor}
              />
            </g>
          );
        })}

        {/* Forklaring nederst */}
        <text x={VW / 2} y={VH - 14} textAnchor="middle" className="fill-muted-foreground text-[10px]">
          Signaler bredder seg utover fra sender. Når to ulike signaler overlapper → kollisjon.
          Kollisjon → JAM → eksponentiell backoff.
        </text>
      </svg>

      {/* Controls */}
      <div className="px-4 py-2 flex flex-wrap items-center gap-2 border-t border-border bg-muted/20">
        <button
          onClick={() => setPlaying((p) => !p)}
          className="inline-flex items-center gap-1 rounded border border-brand/40 bg-brand/10 px-2 py-1 text-xs font-medium hover:bg-brand/20"
        >
          {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          {playing ? "Pause" : "Spill av"}
        </button>
        <button
          onClick={() => setSpeed((s) => (s === 1 ? 2 : s === 2 ? 4 : 1))}
          className="inline-flex items-center gap-1 rounded border border-border bg-background px-2 py-1 text-xs hover:border-brand/60"
        >
          <FastForward className="h-3 w-3" /> {speed}x
        </button>
        <button
          onClick={reset}
          className="inline-flex items-center gap-1 rounded border border-border bg-background px-2 py-1 text-xs hover:border-brand/60"
        >
          <RotateCcw className="h-3 w-3" /> Restart
        </button>
        <span className="ml-auto text-[11px] text-muted-foreground">
          Tre hosts starter samtidig — kollisjon nesten garantert.
        </span>
      </div>

      {/* Logg */}
      <div className="px-4 py-2 border-t border-border bg-muted/10 max-h-40 overflow-y-auto text-[11px] font-mono">
        {logs.length === 0 && (
          <div className="text-muted-foreground italic">
            Trykk Spill av — hendelser dukker opp her etter hvert.
          </div>
        )}
        {logs.map((l, i) => (
          <div
            key={i}
            className={
              l.kind === "collision"
                ? "text-destructive"
                : l.kind === "ok"
                  ? "text-success"
                  : "text-muted-foreground"
            }
          >
            <span className="text-foreground/60 mr-2">[{Math.floor(l.t)}]</span>
            {l.msg}
          </div>
        ))}
      </div>

      {/* Liten note om CSMA/CA-forskjellen */}
      <div className="px-4 py-2 border-t border-border bg-muted/20 text-[11px] text-muted-foreground">
        <span className="text-foreground font-medium">CSMA/CA (trådløst, kap. 7):</span> kollisjoner
        kan ikke detekteres på radio fordi senderen hører bare sitt eget signal. Derfor brukes
        kollisjons-<em>unngåelse</em> i stedet: tilfeldig backoff <em>før</em> sending + ACK fra
        mottaker for å bekrefte at det gikk bra.
      </div>
    </div>
  );
}

function signalsAt(signals: Signal[], pos: number, now: number): boolean {
  return signals.some((s) => reachesAt(s, pos, now));
}

function reachesAt(s: Signal, pos: number, now: number): boolean {
  const age = now - s.startedAt;
  if (age < 0 || age > s.endAt) return false;
  const spread = age * PROP_SPEED * 0.001;
  return Math.abs(pos - s.origin) <= spread;
}

function fillClassFor(id: HostId): string {
  if (id === "A") return "fill-brand";
  if (id === "B") return "fill-purple-500";
  return "fill-amber-500";
}

function strokeClassFor(id: HostId): string {
  if (id === "A") return "stroke-brand";
  if (id === "B") return "stroke-purple-500";
  return "stroke-amber-500";
}

function textFillClassFor(id: HostId): string {
  if (id === "A") return "fill-brand";
  if (id === "B") return "fill-purple-500";
  return "fill-amber-500";
}

function stateText(s: HostState): string {
  switch (s.kind) {
    case "idle":
      return "stille (ferdig)";
    case "wait_carrier":
      return "lytter (CS)";
    case "backoff":
      return `backoff K=${s.chosenK}`;
    case "transmitting":
      return "sender →";
    case "jamming":
      return "JAM!";
  }
}

function stateColorFor(s: HostState): string {
  switch (s.kind) {
    case "idle":
      return "fill-muted-foreground/50";
    case "wait_carrier":
      return "fill-amber-500";
    case "backoff":
      return "fill-amber-500";
    case "transmitting":
      return "fill-success";
    case "jamming":
      return "fill-destructive";
  }
}
