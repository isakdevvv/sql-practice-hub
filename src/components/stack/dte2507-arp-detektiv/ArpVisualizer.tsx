import { useEffect, useMemo, useRef, useState } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  StepForward,
  Send,
  AlertTriangle,
  ShieldAlert,
  Megaphone,
  Zap,
} from "lucide-react";

// --------------------------------------------------------------------------
// Interaktiv ARP-visualisering for DTE-2507 ARP-detektiv.
//
// Layout: en sentral switch, fire hoster (A, B, C, D) rundt. Hver host har
// sin egen ARP-cache (IP -> MAC). Switchen har en MAC-tabell (MAC -> port).
//
// Scenarier:
//   1) "first"     A sender til B uten ARP-cache  -> broadcast, B svarer, cache fylles.
//   2) "hit"       Cachen er allerede varm        -> direkte unicast.
//   3) "spoof"     C svarer falskt på ARP fra A   -> A's cache peker mot angriper.
//   4) "garp"      D sender gratuitous ARP        -> alle naboer oppdaterer cache.
//
// Animasjonen er forhåndsberegnet til en liste "frames". Hver frame har en
// pakke (broadcast eller unicast), valgfri cache-/MAC-tabell-mutasjon og en
// log-entry. Vi rendrer SVG og animerer via CSS transitions på transform.
// --------------------------------------------------------------------------

type Scenario = "first" | "hit" | "spoof" | "garp";

type HostKey = "A" | "B" | "C" | "D";

type ArpEntry = {
  ip: string;
  mac: string;
  /** Peker mappingen mot en angriper? Brukes til å fargelegge. */
  poisoned?: boolean;
  /** Nylig oppdatert — gir en kort blink. */
  fresh?: boolean;
};

type ArpCache = Record<HostKey, ArpEntry[]>;

type SwitchRow = { mac: string; port: HostKey; host: HostKey };

type LogEntry = {
  step: number;
  label: string;
  detail?: string;
  variant?: "info" | "ok" | "warn" | "danger";
};

type PacketKind = "arp-request" | "arp-reply" | "data" | "garp";

type Frame = {
  /** Beskrivelse over SVG-en når frame er aktiv. */
  description: string;
  /** Hvor pakken starter — host-key eller "SW" (switch). */
  from: HostKey | "SW";
  /** Hvor pakken ender. "ALL" = broadcast (alle hoster utenom from). */
  to: HostKey | "SW" | "ALL";
  /** Slags pakke — styrer farge og label. */
  kind: PacketKind;
  /** Header-tekst som vises på pakken. */
  header: string;
  /** Mutator for ARP-cache-tilstand. */
  cacheMutation?: (c: ArpCache) => ArpCache;
  /** Mutator for switchens MAC-tabell. */
  switchMutation?: (rows: SwitchRow[]) => SwitchRow[];
  /** Log-entry å pushe når dette steget begynner. */
  logEntry?: Omit<LogEntry, "step">;
};

// --------------------------------------------------------------------------
// Topologi
// --------------------------------------------------------------------------
const HOSTS: Record<HostKey, { ip: string; mac: string; label: string; x: number; y: number }> = {
  A: { ip: "10.0.0.1", mac: "AA:AA:AA:AA:AA:AA", label: "Host A", x: 90, y: 90 },
  B: { ip: "10.0.0.2", mac: "BB:BB:BB:BB:BB:BB", label: "Host B", x: 670, y: 90 },
  C: { ip: "10.0.0.3", mac: "CC:CC:CC:CC:CC:CC", label: "Host C (angriper)", x: 90, y: 290 },
  D: { ip: "10.0.0.4", mac: "DD:DD:DD:DD:DD:DD", label: "Host D", x: 670, y: 290 },
};

const SWITCH = { x: 380, y: 190 };

const HOST_ORDER: HostKey[] = ["A", "B", "C", "D"];

// Tom ARP-cache for alle hoster.
function emptyCache(): ArpCache {
  return { A: [], B: [], C: [], D: [] };
}

// Switch lærer MAC -> port etter hvert som hoster sender. Vi forhåndsfyller
// med D for å vise at noen oppføringer kan eksistere før scenariet starter.
function initialSwitchRows(): SwitchRow[] {
  return [];
}

// Felles hjelper: oppdater eller legg til en ARP-rad hos en host.
function upsertArp(c: ArpCache, host: HostKey, entry: ArpEntry): ArpCache {
  const existing = c[host];
  const filtered = existing.filter((e) => e.ip !== entry.ip).map((e) => ({ ...e, fresh: false }));
  const cleaned: ArpCache = {
    A: c.A.map((e) => ({ ...e, fresh: false })),
    B: c.B.map((e) => ({ ...e, fresh: false })),
    C: c.C.map((e) => ({ ...e, fresh: false })),
    D: c.D.map((e) => ({ ...e, fresh: false })),
  };
  cleaned[host] = [...filtered, { ...entry, fresh: true }];
  return cleaned;
}

function learnSwitch(rows: SwitchRow[], host: HostKey): SwitchRow[] {
  const mac = HOSTS[host].mac;
  if (rows.some((r) => r.mac === mac)) return rows;
  return [...rows, { mac, port: host, host }];
}

// --------------------------------------------------------------------------
// SCENARIO 1 — First send (kald cache)
// --------------------------------------------------------------------------
function buildFirstSendFrames(): Frame[] {
  return [
    {
      from: "A",
      to: "SW",
      kind: "arp-request",
      header: "ARP: hvem har 10.0.0.2?  (fra AA:AA:..)",
      description: "A trenger MAC til 10.0.0.2 — cachen er tom. Bygger ARP-forespørsel.",
      switchMutation: (r) => learnSwitch(r, "A"),
      logEntry: {
        label: "A bygger ARP-spørring",
        detail:
          "Dest-MAC = FF:FF:FF:FF:FF:FF (broadcast). Switchen lærer A:s MAC på port A.",
        variant: "info",
      },
    },
    {
      from: "SW",
      to: "ALL",
      kind: "arp-request",
      header: "BROADCAST: hvem har 10.0.0.2?",
      description: "Switch flooder broadcasten ut på alle porter unntatt A.",
      logEntry: {
        label: "Switch flooder ARP-spørring",
        detail: "FF:FF:FF:FF:FF:FF treffer alle hoster på subnettet.",
        variant: "info",
      },
    },
    {
      from: "B",
      to: "SW",
      kind: "arp-reply",
      header: "ARP-svar: 10.0.0.2 er på BB:BB:..",
      description: "Bare B kjenner seg igjen. Svarer unicast tilbake til A.",
      switchMutation: (r) => learnSwitch(r, "B"),
      logEntry: {
        label: "B svarer unicast",
        detail: "B sender ARP-reply direkte til A — switchen lærer B:s MAC.",
        variant: "ok",
      },
    },
    {
      from: "SW",
      to: "A",
      kind: "arp-reply",
      header: "ARP-svar levert til A",
      description: "Switchen vet hvor A er — sender svaret kun ut port A.",
      cacheMutation: (c) =>
        upsertArp(c, "A", { ip: HOSTS.B.ip, mac: HOSTS.B.mac }),
      logEntry: {
        label: "A oppdaterer ARP-cache",
        detail: "10.0.0.2 → BB:BB:BB:BB:BB:BB lagres med aging-timer (~20 min).",
        variant: "ok",
      },
    },
    {
      from: "A",
      to: "SW",
      kind: "data",
      header: "DATA: A → 10.0.0.2",
      description: "Nå kan A sende nyttelasten — Ethernet-ramme med B:s MAC som dest.",
      logEntry: {
        label: "A sender data",
        detail: "Ethernet-header: src=AA:AA:.. dst=BB:BB:.. — én unicast-hop via switch.",
        variant: "info",
      },
    },
    {
      from: "SW",
      to: "B",
      kind: "data",
      header: "DATA levert til B",
      description: "Switch slår opp BB:.. → port B og leverer direkte.",
      logEntry: {
        label: "B mottar pakken",
        detail: "Ingen broadcast denne gangen — ren unicast takket være ARP-cachen.",
        variant: "ok",
      },
    },
  ];
}

// --------------------------------------------------------------------------
// SCENARIO 2 — Cache hit
// --------------------------------------------------------------------------
function buildCacheHitFrames(): Frame[] {
  return [
    {
      from: "A",
      to: "SW",
      kind: "data",
      header: "DATA: A → 10.0.0.2",
      description: "A vil sende til B. Cachen har allerede 10.0.0.2 → BB:.. — ingen ARP.",
      switchMutation: (r) => learnSwitch(r, "A"),
      logEntry: {
        label: "Cache-treff hos A",
        detail: "A bygger Ethernet-rammen direkte med BB:.. som dest-MAC.",
        variant: "ok",
      },
    },
    {
      from: "SW",
      to: "B",
      kind: "data",
      header: "DATA levert til B",
      description: "Switch slår opp BB:.. → port B. Effektiv levering, ingen broadcast.",
      logEntry: {
        label: "B mottar pakken",
        detail:
          "Varm cache betyr null ARP-trafikk. Dette er det normale tilfellet etter første gang.",
        variant: "ok",
      },
    },
  ];
}

// --------------------------------------------------------------------------
// SCENARIO 3 — ARP-spoofing
// --------------------------------------------------------------------------
function buildSpoofFrames(): Frame[] {
  return [
    {
      from: "A",
      to: "SW",
      kind: "arp-request",
      header: "ARP: hvem har 10.0.0.2?",
      description: "A spør etter B — cachen er tom igjen.",
      switchMutation: (r) => learnSwitch(r, "A"),
      logEntry: {
        label: "A sender ARP-spørring",
        detail: "Helt vanlig broadcast — A har ingen grunn til mistanke.",
        variant: "info",
      },
    },
    {
      from: "SW",
      to: "ALL",
      kind: "arp-request",
      header: "BROADCAST: hvem har 10.0.0.2?",
      description: "Switchen flooder broadcasten. B vil snart svare ærlig.",
      logEntry: {
        label: "Switch flooder",
        detail: "Også angriper C ser spørringen — ARP er uautentisert.",
        variant: "info",
      },
    },
    {
      from: "C",
      to: "SW",
      kind: "arp-reply",
      header: "FALSKT ARP-svar: 10.0.0.2 er på CC:CC:..",
      description: "C løyver: «jeg er 10.0.0.2». Sender raskt før B rekker det.",
      switchMutation: (r) => learnSwitch(r, "C"),
      logEntry: {
        label: "C utfører ARP-spoofing",
        detail:
          "Angriper rapporterer egen MAC for B:s IP. Switchen tror C bare lærer en ny MAC.",
        variant: "danger",
      },
    },
    {
      from: "SW",
      to: "A",
      kind: "arp-reply",
      header: "ARP-svar levert (forfalsket)",
      description: "A tar imot svaret. Ingen kontroll — første svar vinner.",
      cacheMutation: (c) =>
        upsertArp(c, "A", { ip: HOSTS.B.ip, mac: HOSTS.C.mac, poisoned: true }),
      logEntry: {
        label: "A's cache er forgiftet",
        detail: "10.0.0.2 → CC:CC:.. (angriperens MAC). Nå er A i man-in-the-middle.",
        variant: "danger",
      },
    },
    {
      from: "A",
      to: "SW",
      kind: "data",
      header: "DATA: A → 10.0.0.2 (men dst-MAC = CC:..)",
      description: "A sender det den tror er trafikk til B — Ethernet-headeren peker mot C.",
      logEntry: {
        label: "A sender til feil MAC",
        detail: "L3 (IP) sier B, men L2 (MAC) sier C. Switchen følger L2.",
        variant: "warn",
      },
    },
    {
      from: "SW",
      to: "C",
      kind: "data",
      header: "DATA havner hos angriper C",
      description: "Trafikken leveres til C. C kan sniffe, modifisere eller videresende.",
      logEntry: {
        label: "Trafikk avlyttet",
        detail:
          "Forsvar: Dynamic ARP Inspection (DAI) på switch + statiske ARP-entries på kritiske noder.",
        variant: "danger",
      },
    },
  ];
}

// --------------------------------------------------------------------------
// SCENARIO 4 — Gratuitous ARP
// --------------------------------------------------------------------------
function buildGarpFrames(): Frame[] {
  return [
    {
      from: "D",
      to: "SW",
      kind: "garp",
      header: "Gratuitous ARP: 10.0.0.4 er på DD:DD:..",
      description: "D annonserer egen IP/MAC uoppfordret — uten at noen spurte.",
      switchMutation: (r) => learnSwitch(r, "D"),
      logEntry: {
        label: "D sender Gratuitous ARP",
        detail:
          "Vanlige grunner: oppstart (IP-konflikt-deteksjon) eller failover etter NIC-bytte.",
        variant: "info",
      },
    },
    {
      from: "SW",
      to: "ALL",
      kind: "garp",
      header: "BROADCAST: 10.0.0.4 → DD:DD:..",
      description: "Switch flooder annonseringen. Alle naboer ser den.",
      logEntry: {
        label: "Switch flooder GARP",
        detail: "Dest-MAC = FF:FF:.. — alle hoster på linken får oppdateringen.",
        variant: "info",
      },
    },
    {
      from: "SW",
      to: "ALL",
      kind: "garp",
      header: "Alle hoster oppdaterer cache",
      description: "A, B og C lagrer 10.0.0.4 → DD:.. (overskriver evt. gammel verdi).",
      cacheMutation: (c) => {
        const entry: ArpEntry = { ip: HOSTS.D.ip, mac: HOSTS.D.mac };
        let next = upsertArp(c, "A", entry);
        next = upsertArp(next, "B", entry);
        next = upsertArp(next, "C", entry);
        return next;
      },
      logEntry: {
        label: "Naboer oppdaterer ARP-cache",
        detail:
          "Mørk side: en angriper kan bruke samme mekanisme til å «kuppe» gateway-IP-en.",
        variant: "warn",
      },
    },
  ];
}

// --------------------------------------------------------------------------
// Scenario-metadata + initial-tilstand
// --------------------------------------------------------------------------
const SCENARIOS: { id: Scenario; label: string; sub: string }[] = [
  { id: "first", label: "Første sending", sub: "A → B med tom cache" },
  { id: "hit", label: "Cache-treff", sub: "Varm cache, ingen ARP" },
  { id: "spoof", label: "ARP-spoofing", sub: "C lurer A med falskt svar" },
  { id: "garp", label: "Gratuitous ARP", sub: "D annonserer seg uoppfordret" },
];

const SCENARIO_NOTE: Record<Scenario, string> = {
  first:
    "Standardflyt: broadcast for å spørre, unicast for å svare, deretter datatrafikk via switchen.",
  hit:
    "Når cachen er varm, droppes ARP-fasen helt. Dette er det vanlige tilfellet i et levende nettverk.",
  spoof:
    "ARP er uautentisert: første svar vinner. En angriper på samme link kan dirigere trafikk til seg selv.",
  garp:
    "Gratuitous ARP er nyttig (failover, konflikt-deteksjon) men også våpenet bak gateway-kapring.",
};

function getInitialCache(scenario: Scenario): ArpCache {
  if (scenario === "hit") {
    // Varm cache hos A.
    const c = emptyCache();
    c.A = [{ ip: HOSTS.B.ip, mac: HOSTS.B.mac }];
    return c;
  }
  return emptyCache();
}

function getInitialSwitch(scenario: Scenario): SwitchRow[] {
  if (scenario === "hit") {
    return [
      { mac: HOSTS.A.mac, port: "A", host: "A" },
      { mac: HOSTS.B.mac, port: "B", host: "B" },
    ];
  }
  return initialSwitchRows();
}

function getFrames(scenario: Scenario): Frame[] {
  switch (scenario) {
    case "first":
      return buildFirstSendFrames();
    case "hit":
      return buildCacheHitFrames();
    case "spoof":
      return buildSpoofFrames();
    case "garp":
      return buildGarpFrames();
  }
}

// Pakke-farger
function packetColor(kind: PacketKind): string {
  switch (kind) {
    case "arp-request":
      return "fill-amber-500";
    case "arp-reply":
      return "fill-emerald-500";
    case "data":
      return "fill-sky-500";
    case "garp":
      return "fill-violet-500";
  }
}

// --------------------------------------------------------------------------
// Hovedkomponent
// --------------------------------------------------------------------------
export function ArpVisualizer() {
  const [scenario, setScenario] = useState<Scenario>("first");
  const [cache, setCache] = useState<ArpCache>(() => getInitialCache("first"));
  const [switchRows, setSwitchRows] = useState<SwitchRow[]>(() => getInitialSwitch("first"));
  const [log, setLog] = useState<LogEntry[]>([]);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [packetAtEnd, setPacketAtEnd] = useState(true);
  const timerRef = useRef<number | null>(null);

  const frames = useMemo(() => getFrames(scenario), [scenario]);
  const totalSteps = frames.length;
  const currentFrame: Frame | null = step > 0 ? frames[step - 1] : null;

  const resetAll = (s: Scenario = scenario) => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setPlaying(false);
    setStep(0);
    setCache(getInitialCache(s));
    setSwitchRows(getInitialSwitch(s));
    setLog([]);
    setPacketAtEnd(true);
  };

  const switchScenario = (s: Scenario) => {
    setScenario(s);
    resetAll(s);
  };

  const advance = () => {
    if (step >= totalSteps) return false;
    const next = frames[step];
    if (next.cacheMutation) {
      setCache((c) => next.cacheMutation!(c));
    }
    if (next.switchMutation) {
      setSwitchRows((r) => next.switchMutation!(r));
    }
    if (next.logEntry) {
      setLog((l) => [{ step: step + 1, ...next.logEntry! }, ...l].slice(0, 24));
    }
    setPacketAtEnd(false);
    setStep(step + 1);
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
    }, 1200);
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, step, totalSteps]);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  // ---- Pakke-rendering ----
  // For "ALL" (broadcast) tegner vi tre samtidige pakker fra switch til alle
  // hoster utenom kilden. Ellers én enkelt pakke fra->to.
  type Bullet = { x: number; y: number; color: string; label: string };

  const bullets: Bullet[] = (() => {
    if (!currentFrame) return [];
    const color = packetColor(currentFrame.kind);
    const fromPt = currentFrame.from === "SW" ? SWITCH : HOSTS[currentFrame.from];

    if (currentFrame.to === "ALL") {
      const sourceHost: HostKey | null =
        currentFrame.from === "SW"
          ? // Hvis switch broadcaster, finn opphavet ved å se på forrige frame.
            (() => {
              const prev = step > 1 ? frames[step - 2] : null;
              if (prev && prev.from !== "SW") return prev.from;
              return null;
            })()
          : currentFrame.from;
      const targets = HOST_ORDER.filter((h) => h !== sourceHost);
      return targets.map((h) => {
        const to = HOSTS[h];
        const pos = packetAtEnd ? to : fromPt;
        return {
          x: pos.x,
          y: pos.y,
          color,
          label: currentFrame.header,
        };
      });
    }

    const toPt = currentFrame.to === "SW" ? SWITCH : HOSTS[currentFrame.to];
    const pos = packetAtEnd ? toPt : fromPt;
    return [
      {
        x: pos.x,
        y: pos.y,
        color,
        label: currentFrame.header,
      },
    ];
  })();

  // Trigger Quick-buttons: setter scenariet og starter avspilling.
  const playScenario = (s: Scenario) => {
    switchScenario(s);
    setTimeout(() => setPlaying(true), 80);
  };

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden" role="region" aria-label="Interaktiv visualisering: ARP-protokoll">
      {/* Toppbar */}
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Interaktiv visualisering
            </div>
            <div className="text-sm font-semibold">
              ARP-cachen, broadcast, unicast og spoofing
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (step >= totalSteps) resetAll();
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
                  resetAll();
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
              onClick={() => resetAll()}
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

      {/* Hurtigknapper: send fra hver host */}
      <div className="px-4 py-2 border-b border-border bg-muted/10 flex flex-wrap gap-1.5 text-xs">
        <button
          type="button"
          onClick={() => playScenario("first")}
          className="inline-flex items-center gap-1 px-2 py-1 rounded border border-border hover:bg-muted"
          title="A → B uten cache: full ARP-runde"
        >
          <Send className="h-3 w-3" />
          A: send pakke (kald cache)
        </button>
        <button
          type="button"
          onClick={() => playScenario("hit")}
          className="inline-flex items-center gap-1 px-2 py-1 rounded border border-border hover:bg-muted"
          title="A → B med varm cache"
        >
          <Zap className="h-3 w-3" />
          A: send pakke (varm cache)
        </button>
        <button
          type="button"
          onClick={() => playScenario("spoof")}
          className="inline-flex items-center gap-1 px-2 py-1 rounded border border-rose-500/40 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10"
          title="C svarer falskt på A's ARP-spørring"
        >
          <ShieldAlert className="h-3 w-3" />
          C: spoof B
        </button>
        <button
          type="button"
          onClick={() => playScenario("garp")}
          className="inline-flex items-center gap-1 px-2 py-1 rounded border border-violet-500/40 text-violet-600 dark:text-violet-400 hover:bg-violet-500/10"
          title="D annonserer egen MAC til alle"
        >
          <Megaphone className="h-3 w-3" />
          D: gratuitous ARP
        </button>
        <span className="text-muted-foreground self-center ml-auto tabular-nums">
          Steg {Math.min(step, totalSteps)} / {totalSteps}
        </span>
      </div>

      {/* SVG */}
      <div className="p-4 bg-background">
        <svg viewBox="0 0 760 400" className="w-full h-auto" style={{ maxHeight: 440 }}>
          {/* Subnett-bakgrunn */}
          <rect
            x="20"
            y="20"
            width="720"
            height="360"
            fill="currentColor"
            className="text-sky-500/5"
            rx="14"
          />
          <text
            x="380"
            y="14"
            className="fill-sky-700 dark:fill-sky-300"
            fontSize="11"
            fontWeight="600"
            textAnchor="middle"
          >
            Ett subnett — 10.0.0.0/24
          </text>

          {/* Linjer host -> switch */}
          {HOST_ORDER.map((h) => (
            <line
              key={`line-${h}`}
              x1={HOSTS[h].x}
              y1={HOSTS[h].y}
              x2={SWITCH.x}
              y2={SWITCH.y}
              stroke="currentColor"
              className="text-border"
              strokeWidth="1.5"
            />
          ))}

          {/* Hoster */}
          {HOST_ORDER.map((h) => (
            <HostBox
              key={h}
              hostKey={h}
              entries={cache[h]}
              attacker={h === "C" && scenario === "spoof"}
            />
          ))}

          {/* Switch */}
          <g>
            <rect
              x={SWITCH.x - 70}
              y={SWITCH.y - 36}
              width="140"
              height="72"
              rx="10"
              fill="currentColor"
              className="text-indigo-500/15 dark:text-indigo-400/20"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <rect
              x={SWITCH.x - 70}
              y={SWITCH.y - 36}
              width="140"
              height="72"
              rx="10"
              fill="none"
              stroke="currentColor"
              className="text-indigo-500"
              strokeWidth="1.5"
              opacity="0.55"
            />
            <text
              x={SWITCH.x}
              y={SWITCH.y - 14}
              className="fill-foreground"
              fontSize="13"
              fontWeight="700"
              textAnchor="middle"
            >
              Switch
            </text>
            <text
              x={SWITCH.x}
              y={SWITCH.y + 4}
              className="fill-muted-foreground"
              fontSize="10"
              textAnchor="middle"
            >
              porter: A · B · C · D
            </text>
            <text
              x={SWITCH.x}
              y={SWITCH.y + 22}
              className="fill-muted-foreground"
              fontSize="9"
              textAnchor="middle"
              fontFamily="monospace"
            >
              MAC-tabell {switchRows.length}/4
            </text>
          </g>

          {/* Pakker */}
          {bullets.map((b, i) => {
            const fromPt = currentFrame
              ? currentFrame.from === "SW"
                ? SWITCH
                : HOSTS[currentFrame.from]
              : SWITCH;
            const baseX = fromPt.x;
            const baseY = fromPt.y;
            return (
              <g
                key={i}
                style={{
                  transition: "transform 950ms cubic-bezier(0.4, 0, 0.2, 1)",
                  transform: `translate(${b.x - baseX}px, ${b.y - baseY}px)`,
                }}
              >
                <rect
                  x={baseX - 95}
                  y={baseY - 13}
                  width="190"
                  height="26"
                  rx="6"
                  className={b.color}
                  opacity="0.92"
                />
                <text
                  x={baseX}
                  y={baseY + 4}
                  className="fill-white"
                  fontSize="9.5"
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {b.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Beskrivelse */}
        <div className="mt-2 min-h-[1.5rem] text-center text-xs text-muted-foreground">
          {currentFrame
            ? currentFrame.description
            : step === 0
              ? "Velg scenario og trykk Spill — eller bruk Steg for å gå gjennom hvert hopp."
              : "Ferdig. Reset for å starte på nytt eller bytt scenario."}
        </div>
      </div>

      {/* ARP-cacher per host + switch-tabell */}
      <div className="px-4 py-3 border-t border-border bg-muted/20 grid sm:grid-cols-2 gap-3">
        {HOST_ORDER.map((h) => (
          <ArpCacheTable
            key={`cache-${h}`}
            hostKey={h}
            entries={cache[h]}
            highlight={h === "A" && scenario === "spoof"}
          />
        ))}
        <SwitchTable rows={switchRows} />
      </div>

      {/* Log */}
      <div className="px-4 py-3 border-t border-border bg-card">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
          Hendelses-log (nyeste først)
        </div>
        {log.length === 0 ? (
          <div className="text-xs text-muted-foreground italic">
            Ingen hendelser enda — start scenariet.
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
                      : entry.variant === "danger"
                        ? "border-rose-500/40 bg-rose-500/10"
                        : "border-border bg-muted/20"
                }`}
              >
                <div className="flex items-baseline gap-2">
                  <span className="text-muted-foreground tabular-nums w-6 text-right">
                    {entry.step}.
                  </span>
                  <span className="font-semibold">{entry.label}</span>
                  {entry.variant === "danger" && (
                    <ShieldAlert className="h-3 w-3 text-rose-600 inline-block" />
                  )}
                  {entry.variant === "warn" && (
                    <AlertTriangle className="h-3 w-3 text-amber-600 inline-block" />
                  )}
                </div>
                {entry.detail && (
                  <div className="pl-8 mt-1 text-muted-foreground italic">{entry.detail}</div>
                )}
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Underkomponenter
// --------------------------------------------------------------------------
function HostBox({
  hostKey,
  entries,
  attacker,
}: {
  hostKey: HostKey;
  entries: ArpEntry[];
  attacker: boolean;
}) {
  const info = HOSTS[hostKey];
  const tone = attacker ? "rose" : hostKey === "A" ? "sky" : hostKey === "B" ? "emerald" : "violet";
  const fill: Record<string, string> = {
    sky: "text-sky-500/20 dark:text-sky-400/25",
    emerald: "text-emerald-500/20 dark:text-emerald-400/25",
    violet: "text-violet-500/20 dark:text-violet-400/25",
    rose: "text-rose-500/25 dark:text-rose-400/30",
  };
  const stroke: Record<string, string> = {
    sky: "text-sky-500",
    emerald: "text-emerald-500",
    violet: "text-violet-500",
    rose: "text-rose-500",
  };
  return (
    <g>
      <rect
        x={info.x - 70}
        y={info.y - 36}
        width="140"
        height="72"
        rx="10"
        fill="currentColor"
        className={fill[tone]}
      />
      <rect
        x={info.x - 70}
        y={info.y - 36}
        width="140"
        height="72"
        rx="10"
        fill="none"
        stroke="currentColor"
        className={stroke[tone]}
        strokeWidth="1.5"
        opacity="0.55"
      />
      <text
        x={info.x}
        y={info.y - 16}
        className="fill-foreground"
        fontSize="12"
        fontWeight="700"
        textAnchor="middle"
      >
        {info.label}
      </text>
      <text
        x={info.x}
        y={info.y - 1}
        className="fill-muted-foreground"
        fontSize="10"
        fontFamily="monospace"
        textAnchor="middle"
      >
        {info.ip}
      </text>
      <text
        x={info.x}
        y={info.y + 14}
        className="fill-muted-foreground"
        fontSize="9"
        fontFamily="monospace"
        textAnchor="middle"
      >
        {info.mac.slice(0, 11)}…
      </text>
      <text
        x={info.x}
        y={info.y + 28}
        className="fill-muted-foreground"
        fontSize="8.5"
        textAnchor="middle"
      >
        cache: {entries.length} oppf.
      </text>
    </g>
  );
}

function ArpCacheTable({
  hostKey,
  entries,
  highlight,
}: {
  hostKey: HostKey;
  entries: ArpEntry[];
  highlight: boolean;
}) {
  const info = HOSTS[hostKey];
  return (
    <div
      className={`rounded-md border bg-background overflow-hidden ${
        highlight ? "border-rose-500/40" : "border-border"
      }`}
    >
      <div className="px-3 py-1.5 bg-muted/40 text-[10px] uppercase tracking-wider text-muted-foreground flex items-center justify-between">
        <span>ARP-cache · {info.label}</span>
        <span className="font-mono text-[10px] normal-case">{info.ip}</span>
      </div>
      {entries.length === 0 ? (
        <div className="px-3 py-2 text-[11px] text-muted-foreground italic">
          (tom)
        </div>
      ) : (
        <table className="w-full text-[11px] font-mono">
          <thead className="bg-muted/20 text-muted-foreground">
            <tr>
              <th className="text-left px-3 py-1 font-semibold">IP</th>
              <th className="text-left px-3 py-1 font-semibold">MAC</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e, i) => (
              <tr
                key={i}
                className={`border-t border-border ${
                  e.poisoned
                    ? "bg-rose-500/10 text-rose-700 dark:text-rose-300"
                    : e.fresh
                      ? "bg-emerald-500/10"
                      : ""
                }`}
              >
                <td className="px-3 py-1">{e.ip}</td>
                <td className="px-3 py-1">
                  {e.mac}
                  {e.poisoned && (
                    <span className="ml-1 normal-case font-sans not-italic text-[10px] text-rose-600 dark:text-rose-400">
                      (spoofed)
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function SwitchTable({ rows }: { rows: SwitchRow[] }) {
  return (
    <div className="rounded-md border border-indigo-500/30 bg-background overflow-hidden sm:col-span-2">
      <div className="px-3 py-1.5 bg-indigo-500/10 text-[10px] uppercase tracking-wider text-indigo-700 dark:text-indigo-300 flex items-center justify-between">
        <span>Switch — MAC-tabell</span>
        <span className="font-mono normal-case">{rows.length} oppføring{rows.length === 1 ? "" : "er"}</span>
      </div>
      {rows.length === 0 ? (
        <div className="px-3 py-2 text-[11px] text-muted-foreground italic">
          Tom — switchen lærer etter hvert som rammer ankommer.
        </div>
      ) : (
        <table className="w-full text-[11px] font-mono">
          <thead className="bg-muted/20 text-muted-foreground">
            <tr>
              <th className="text-left px-3 py-1 font-semibold">MAC</th>
              <th className="text-left px-3 py-1 font-semibold">Port</th>
              <th className="text-left px-3 py-1 font-semibold">Host</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-border">
                <td className="px-3 py-1">{r.mac}</td>
                <td className="px-3 py-1">{r.port}</td>
                <td className="px-3 py-1">{HOSTS[r.host].label}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
