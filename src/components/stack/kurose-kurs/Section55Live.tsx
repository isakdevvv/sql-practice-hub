import { useEffect, useMemo, useRef, useState } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  Handle,
  Position,
  type Node,
  type Edge,
  type NodeProps,
  useReactFlow,
  useNodesState,
  useEdgesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Radar,
  Activity,
  AlertTriangle,
  Bell,
} from "lucide-react";

// Section55Live — ICMP (traceroute) + SNMP (manager/agent/trap).
//
// Pedagogisk poeng:
//   (a) traceroute fungerer ved å sende pakker med TTL=1, 2, 3, ... Hver
//       ruter som dekrementerer TTL til 0 SENDER en ICMP "Time Exceeded"
//       tilbake. Slik avsløres hver hop.
//   (b) SNMP er manager-pull (GET/SET) + agent-push (TRAP). Manager-pull er
//       periodisk polling. TRAP er asynkron varsel når agent oppdager noe
//       (f.eks. link-down, CPU>90).

// ============================================================
// Shared node types
// ============================================================

type RouterNodeData = {
  label: string;
  kind: "host" | "router" | "manager" | "agent";
  ip: string;
  highlight?: "src" | "dst" | "ttl-drop" | "icmp-reply" | "snmp-poll" | "snmp-trap" | "manager";
  badge?: string;
};

const KIND_STYLE: Record<RouterNodeData["kind"], string> = {
  host: "bg-emerald-500/10 border-emerald-500/40",
  router: "bg-sky-500/10 border-sky-500/40",
  manager: "bg-purple-500/10 border-purple-500/50",
  agent: "bg-amber-500/10 border-amber-500/40",
};

const HI_RING: Record<NonNullable<RouterNodeData["highlight"]>, string> = {
  src: "ring-2 ring-rose-500",
  dst: "ring-2 ring-emerald-500",
  "ttl-drop": "ring-2 ring-red-500 shadow-[0_0_0_4px_rgba(239,68,68,0.15)]",
  "icmp-reply": "ring-2 ring-orange-500",
  "snmp-poll": "ring-2 ring-blue-500",
  "snmp-trap": "ring-2 ring-fuchsia-500 shadow-[0_0_0_4px_rgba(217,70,239,0.15)]",
  manager: "ring-2 ring-purple-500",
};

function GenericNode({ data }: NodeProps) {
  const d = data as RouterNodeData;
  const ring = d.highlight ? HI_RING[d.highlight] : "";
  return (
    <div
      className={`relative rounded-md border-2 px-2.5 py-1.5 text-center shadow-sm ${KIND_STYLE[d.kind]} ${ring}`}
      style={{ minWidth: 76 }}
    >
      <Handle type="target" position={Position.Left} className="!bg-transparent !border-0" />
      <Handle type="source" position={Position.Right} className="!bg-transparent !border-0" />
      <Handle type="target" position={Position.Top} id="top" className="!bg-transparent !border-0" />
      <Handle type="source" position={Position.Bottom} id="bottom" className="!bg-transparent !border-0" />
      <div className="text-xs font-bold leading-none">{d.label}</div>
      <div className="text-[9px] text-muted-foreground leading-none mt-0.5">
        {d.kind === "router" ? "ruter" : d.kind === "host" ? "host" : d.kind === "manager" ? "SNMP manager" : "SNMP agent"}
      </div>
      <div className="text-[9px] text-muted-foreground font-mono leading-none mt-0.5">{d.ip}</div>
      {d.badge && (
        <div className="mt-1 text-[10px] font-mono leading-none text-amber-700 dark:text-amber-400">
          {d.badge}
        </div>
      )}
    </div>
  );
}

const nodeTypes = { net: GenericNode };

// ============================================================
// ICMP traceroute scene
//
//   H1 -- R1 -- R2 -- R3 -- H2
//
//   H1 kjører `traceroute H2`. Sender UDP-probe med TTL=1, 2, 3, 4.
//   Hver ruter som dekrementerer TTL til 0 svarer med ICMP TTL Exceeded.
//   Probe nr 4 (TTL=4) når H2 → port unreachable.
// ============================================================

const ICMP_NODES: Node<RouterNodeData>[] = [
  { id: "H1", type: "net", position: { x: 30, y: 160 }, data: { label: "H1", kind: "host", ip: "10.0.0.1" } },
  { id: "R1", type: "net", position: { x: 200, y: 160 }, data: { label: "R1", kind: "router", ip: "10.0.1.1" } },
  { id: "R2", type: "net", position: { x: 370, y: 160 }, data: { label: "R2", kind: "router", ip: "10.0.2.1" } },
  { id: "R3", type: "net", position: { x: 540, y: 160 }, data: { label: "R3", kind: "router", ip: "10.0.3.1" } },
  { id: "H2", type: "net", position: { x: 700, y: 160 }, data: { label: "H2", kind: "host", ip: "10.0.0.2" } },
];

const ICMP_LINKS: { a: string; b: string }[] = [
  { a: "H1", b: "R1" },
  { a: "R1", b: "R2" },
  { a: "R2", b: "R3" },
  { a: "R3", b: "H2" },
];

type IcmpPhase = {
  ttlInitial: number;
  // Hvor langt pakken kommer før TTL=0 (eller fram til H2)
  reachedNodes: string[]; // sekvens av noder den traverserer (inkl. H1 start)
  dropNode: string | null; // null hvis den når H2
  replyNode: string | null; // hvilken node som sender ICMP reply
  replyKind: "ttl-exceeded" | "port-unreachable" | null;
};

const ICMP_PROBES: IcmpPhase[] = [
  {
    ttlInitial: 1,
    reachedNodes: ["H1", "R1"],
    dropNode: "R1",
    replyNode: "R1",
    replyKind: "ttl-exceeded",
  },
  {
    ttlInitial: 2,
    reachedNodes: ["H1", "R1", "R2"],
    dropNode: "R2",
    replyNode: "R2",
    replyKind: "ttl-exceeded",
  },
  {
    ttlInitial: 3,
    reachedNodes: ["H1", "R1", "R2", "R3"],
    dropNode: "R3",
    replyNode: "R3",
    replyKind: "ttl-exceeded",
  },
  {
    ttlInitial: 4,
    reachedNodes: ["H1", "R1", "R2", "R3", "H2"],
    dropNode: null,
    replyNode: "H2",
    replyKind: "port-unreachable",
  },
];

function buildIcmpEdges(opts: {
  highlightForward?: { a: string; b: string }[];
  highlightReply?: { a: string; b: string }[];
}): Edge[] {
  const fwdSet = new Set((opts.highlightForward ?? []).map((p) => `${p.a}-${p.b}`));
  const replySet = new Set((opts.highlightReply ?? []).map((p) => `${p.a}-${p.b}`));
  return ICMP_LINKS.map((l, i) => {
    const fwdKey1 = `${l.a}-${l.b}`;
    const fwdKey2 = `${l.b}-${l.a}`;
    const isFwd = fwdSet.has(fwdKey1) || fwdSet.has(fwdKey2);
    const isReply = replySet.has(fwdKey1) || replySet.has(fwdKey2);
    return {
      id: `il${i}`,
      source: l.a,
      target: l.b,
      style: {
        stroke: isReply ? "#f97316" : isFwd ? "#10b981" : "rgb(120 120 120 / 0.55)",
        strokeWidth: isFwd || isReply ? 3 : 1.8,
        strokeDasharray: isReply ? "5 3" : undefined,
      },
      animated: isFwd || isReply,
    };
  });
}

// ============================================================
// SNMP scene
//
//   Manager (NMS)  -----  R1 (agent)
//                  \---  R2 (agent)
//                  \---  R3 (agent)
//
//   GET/SET = manager pull. TRAP = agent push.
// ============================================================

const SNMP_NODES: Node<RouterNodeData>[] = [
  { id: "NMS", type: "net", position: { x: 60, y: 180 }, data: { label: "NMS", kind: "manager", ip: "10.99.0.1" } },
  { id: "R1", type: "net", position: { x: 320, y: 60 }, data: { label: "R1", kind: "agent", ip: "10.0.1.1" } },
  { id: "R2", type: "net", position: { x: 320, y: 200 }, data: { label: "R2", kind: "agent", ip: "10.0.2.1" } },
  { id: "R3", type: "net", position: { x: 320, y: 340 }, data: { label: "R3", kind: "agent", ip: "10.0.3.1" } },
];

const SNMP_LINKS: { a: string; b: string }[] = [
  { a: "NMS", b: "R1" },
  { a: "NMS", b: "R2" },
  { a: "NMS", b: "R3" },
];

function buildSnmpEdges(opts: {
  highlightPoll?: { a: string; b: string }[];
  highlightTrap?: { a: string; b: string }[];
}): Edge[] {
  const pollSet = new Set((opts.highlightPoll ?? []).map((p) => `${p.a}-${p.b}`));
  const trapSet = new Set((opts.highlightTrap ?? []).map((p) => `${p.a}-${p.b}`));
  return SNMP_LINKS.map((l, i) => {
    const isPoll = pollSet.has(`${l.a}-${l.b}`) || pollSet.has(`${l.b}-${l.a}`);
    const isTrap = trapSet.has(`${l.a}-${l.b}`) || trapSet.has(`${l.b}-${l.a}`);
    return {
      id: `sl${i}`,
      source: l.a,
      target: l.b,
      style: {
        stroke: isTrap ? "#d946ef" : isPoll ? "#3b82f6" : "rgb(120 120 120 / 0.55)",
        strokeWidth: isPoll || isTrap ? 3 : 1.8,
        strokeDasharray: isTrap ? "5 3" : undefined,
      },
      animated: isPoll || isTrap,
    };
  });
}

// ============================================================
// ICMP step-skript
// ============================================================

type IcmpStep = {
  title: string;
  description: string;
  probeIdx: number; // hvilken TTL-probe vi viser
  phase: "send" | "drop" | "reply" | "logged";
};

const ICMP_STEPS: IcmpStep[] = [
  {
    title: "1. `traceroute 10.0.0.2` starter — første probe med TTL=1",
    description:
      "Brukeren skriver `traceroute 10.0.0.2`. Kommandoen sender en UDP-pakke med høyt port-nummer og TTL=1. Pakken går ut på interface og når R1.",
    probeIdx: 0,
    phase: "send",
  },
  {
    title: "2. R1 dekrementerer TTL → 0, dropper pakken",
    description:
      "R1 mottar pakken, sjekker IP-header. TTL var 1, R1 dekrementerer det til 0. Per RFC 791 skal en pakke med TTL=0 droppes — den er «for gammel» til å fortsette. R1 vil ikke forwarde den videre.",
    probeIdx: 0,
    phase: "drop",
  },
  {
    title: "3. R1 sender ICMP «Time Exceeded» tilbake til H1",
    description:
      "R1 droppet ikke pakken stille — den sender en ICMP-melding type 11 («TTL exceeded in transit») tilbake til H1. ICMP-meldingen inneholder R1 sin IP-adresse som source. Slik lærer H1 hvilken ruter som var hop 1.",
    probeIdx: 0,
    phase: "reply",
  },
  {
    title: "4. H1 logger første hop, sender probe 2 med TTL=2",
    description:
      "traceroute-programmet skriver «1  R1 (10.0.1.1)». Nå sender den probe nummer 2 med TTL=2. Pakken passerer R1 (som dekrementerer til 1 og forwarder), kommer til R2.",
    probeIdx: 1,
    phase: "send",
  },
  {
    title: "5. R2 dekrementerer TTL → 0, sender ICMP-reply",
    description:
      "R2 mottar pakken med TTL=1, dekrementerer til 0, dropper, sender ICMP Time Exceeded fra R2 sin IP. H1 logger «2  R2 (10.0.2.1)».",
    probeIdx: 1,
    phase: "reply",
  },
  {
    title: "6. Probe 3 med TTL=3 — R3 svarer på samme måte",
    description:
      "TTL=3-pakken passerer R1 (TTL=2), R2 (TTL=1), R3 (TTL=0 → drop). R3 sender ICMP. H1 logger «3  R3 (10.0.3.1)».",
    probeIdx: 2,
    phase: "reply",
  },
  {
    title: "7. Probe 4 med TTL=4 — når frem til H2",
    description:
      "Pakken passerer R1, R2, R3 og treffer H2 med TTL=1. H2 dekrementerer til 0 — men H2 er destinasjonen, ikke en transit-ruter. UDP-pakken har et høyt portnummer ingen lytter på, så H2 svarer med ICMP type 3 (Destination Unreachable / port unreachable). Det er signalet til H1 om at H2 nå er nådd. H1 logger «4  H2 (10.0.0.2)» og traceroute er ferdig.",
    probeIdx: 3,
    phase: "reply",
  },
  {
    title: "8. Resultat — H1 har avslørt hele stien",
    description:
      "Ved å sende fire probes og observere hvor TTL ble overskredet, fikk H1 en komplett liste over rutere mellom seg og H2. Ingen av ruterne måtte konfigureres — traceroute fungerer fordi ICMP er en obligatorisk del av IP-stacken og fordi alle rutere DEKREMENTERER TTL ved forwarding.",
    probeIdx: 3,
    phase: "logged",
  },
];

// ============================================================
// SNMP step-skript
// ============================================================

type SnmpStep = {
  title: string;
  description: string;
  phase: "init" | "get" | "response" | "trap" | "ack";
  pollTarget?: string;
  trapSource?: string;
};

const SNMP_STEPS: SnmpStep[] = [
  {
    title: "1. SNMP — Network Management System (NMS) overvåker tre rutere",
    description:
      "Operatøren har et NMS (manager) som vil overvåke R1, R2 og R3. Hver av dem kjører en SNMP-agent. Agentene har lokale MIB-er — Management Information Bases — med variabler som ifInOctets (innkommende bytes), sysUpTime, cpuLoad osv. SNMP-trafikken bruker UDP port 161 (forespørsler) og 162 (TRAP).",
    phase: "init",
  },
  {
    title: "2. NMS sender SNMP GET-Request til R2 — periodisk polling",
    description:
      "Hvert 60. sekund poller NMS de ulike OID-ene (Object Identifier — adresseskjema i MIB-hierarkiet). NMS sender en GET-Request UDP-pakke til R2: «gi meg verdien av OID 1.3.6.1.2.1.2.2.1.10.1» — som er ifInOctets på interface 1.",
    phase: "get",
    pollTarget: "R2",
  },
  {
    title: "3. R2 agent svarer med GET-Response",
    description:
      "R2-agenten slår opp i sin MIB, finner verdien (f.eks. 2 458 372 bytes mottatt siden boot), pakker det i en GET-Response og sender tilbake til NMS. Hele utvekslingen tar typisk under 10 ms. NMS lagrer verdien i sin time-series database.",
    phase: "response",
    pollTarget: "R2",
  },
  {
    title: "4. Pull er treig for kritiske ting — TRAP er løsningen",
    description:
      "Polling hvert 60 s er greit for normale ting (grafer over CPU-bruk osv.) Men hva hvis et grensesnitt går ned? NMS oppdager det først ved neste poll — 60 sekunder senere. For tidskritiske hendelser bruker vi TRAP: agenten sender PROAKTIVT en melding når noe skjer.",
    phase: "init",
  },
  {
    title: "5. R3 oppdager port-down — sender SNMP TRAP",
    description:
      "Et ethernet-grensesnitt på R3 går ned. R3-agenten oppdager dette umiddelbart via lokal hardware-event. Den genererer en TRAP-melding (linkDown, OID 1.3.6.1.6.3.1.1.5.3) og sender den UPRØNNET til NMS på UDP port 162. Ingen forespørsel fra NMS trengs.",
    phase: "trap",
    trapSource: "R3",
  },
  {
    title: "6. NMS mottar TRAP — alarmerer operatøren",
    description:
      "NMS-en mottar TRAP-en, dekoder OID-en til menneskelig tekst («linkDown på if-3 på R3»), lagrer hendelsen i sin event-database, og sender muligens videre til PagerDuty / Slack. Operatøren får et varsel innen sekunder etter at lenken gikk ned — ikke minutter, som ved polling.",
    phase: "ack",
    trapSource: "R3",
  },
  {
    title: "7. Sammenligning: GET (pull) vs TRAP (push)",
    description:
      "GET er manager-initiert pull. Bra for periodiske målinger og grafer. TRAP er agent-initiert push. Bra for hendelser. Begge er en del av SNMP-modellen, men de tjener ulike formål. Moderne nett bruker også InfluxDB+Telegraf eller streaming telemetry — men SNMP er fortsatt allestedsnærværende.",
    phase: "init",
  },
];

// ============================================================
// Hovedkomponent
// ============================================================

type Mode = "icmp" | "snmp";

function FlowInner() {
  const [mode, setMode] = useState<Mode>("icmp");
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const playTimerRef = useRef<number | null>(null);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node<RouterNodeData>>(ICMP_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(buildIcmpEdges({}));

  const rf = useReactFlow();

  const steps = mode === "icmp" ? ICMP_STEPS : SNMP_STEPS;
  const step = steps[stepIdx];

  // Bytte modus: bytt noder
  useEffect(() => {
    setStepIdx(0);
    setPlaying(false);
    if (mode === "icmp") {
      setNodes(ICMP_NODES);
      setEdges(buildIcmpEdges({}));
    } else {
      setNodes(SNMP_NODES);
      setEdges(buildSnmpEdges({}));
    }
    setTimeout(() => rf.fitView({ padding: 0.12, duration: 200 }), 80);
  }, [mode, setNodes, setEdges, rf]);

  // Oppdater highlights basert på step
  useEffect(() => {
    if (mode === "icmp") {
      const icmpStep = step as IcmpStep;
      const probe = ICMP_PROBES[icmpStep.probeIdx];
      // Forward-link-segmenter pakken har gått: probe.reachedNodes[0..i].
      const fwdLinks: { a: string; b: string }[] = [];
      const reached = probe.reachedNodes;
      // Show forwards based on phase
      if (icmpStep.phase === "send" || icmpStep.phase === "drop") {
        for (let i = 0; i < reached.length - 1; i++) {
          fwdLinks.push({ a: reached[i], b: reached[i + 1] });
        }
      }
      // Reply-link: kun siste node tilbake til H1 — vi viser hele path reverse-highlighted
      const replyLinks: { a: string; b: string }[] = [];
      if (icmpStep.phase === "reply" || icmpStep.phase === "logged") {
        for (let i = 0; i < reached.length - 1; i++) {
          replyLinks.push({ a: reached[i], b: reached[i + 1] });
        }
      }
      setEdges(buildIcmpEdges({ highlightForward: fwdLinks, highlightReply: replyLinks }));

      setNodes((nds) =>
        nds.map((n) => {
          let highlight: RouterNodeData["highlight"];
          let badge: string | undefined;
          if (n.id === "H1") {
            highlight = "src";
            if (icmpStep.phase === "send") badge = `TTL=${probe.ttlInitial}`;
            if (icmpStep.phase === "reply" || icmpStep.phase === "logged")
              badge = `log: hop ${icmpStep.probeIdx + 1}`;
          } else if (n.id === "H2") {
            highlight = "dst";
            if (icmpStep.probeIdx === 3 && icmpStep.phase === "reply") {
              highlight = "icmp-reply";
              badge = "port-unreach.";
            }
          } else if (icmpStep.phase === "drop" && probe.dropNode === n.id) {
            highlight = "ttl-drop";
            badge = "TTL=0!";
          } else if (icmpStep.phase === "reply" && probe.replyNode === n.id) {
            highlight = "icmp-reply";
            badge = probe.replyKind === "ttl-exceeded" ? "ICMP T11" : "ICMP T3";
          }
          return {
            ...n,
            data: { ...(n.data as RouterNodeData), highlight, badge },
          };
        }),
      );
    } else {
      const snmpStep = step as SnmpStep;
      const pollLinks: { a: string; b: string }[] =
        snmpStep.phase === "get" && snmpStep.pollTarget
          ? [{ a: "NMS", b: snmpStep.pollTarget }]
          : snmpStep.phase === "response" && snmpStep.pollTarget
            ? [{ a: snmpStep.pollTarget, b: "NMS" }]
            : [];
      const trapLinks: { a: string; b: string }[] =
        (snmpStep.phase === "trap" || snmpStep.phase === "ack") && snmpStep.trapSource
          ? [{ a: snmpStep.trapSource, b: "NMS" }]
          : [];
      setEdges(buildSnmpEdges({ highlightPoll: pollLinks, highlightTrap: trapLinks }));

      setNodes((nds) =>
        nds.map((n) => {
          let highlight: RouterNodeData["highlight"];
          let badge: string | undefined;
          if (n.id === "NMS") {
            highlight = "manager";
            if (snmpStep.phase === "get") badge = "GET req";
            else if (snmpStep.phase === "response") badge = "stored";
            else if (snmpStep.phase === "trap" || snmpStep.phase === "ack") badge = "ALERT";
          } else if (snmpStep.pollTarget === n.id) {
            highlight = "snmp-poll";
            badge = snmpStep.phase === "response" ? "GET-resp" : "polled";
          } else if (snmpStep.trapSource === n.id) {
            highlight = "snmp-trap";
            badge = "linkDown TRAP";
          }
          return {
            ...n,
            data: { ...(n.data as RouterNodeData), highlight, badge },
          };
        }),
      );
    }
  }, [mode, step, stepIdx, setEdges, setNodes]);

  useEffect(() => {
    if (!playing) return;
    playTimerRef.current = window.setTimeout(() => {
      if (stepIdx + 1 < steps.length) setStepIdx((i) => i + 1);
      else setPlaying(false);
    }, 2800);
    return () => {
      if (playTimerRef.current) window.clearTimeout(playTimerRef.current);
    };
  }, [playing, stepIdx, steps.length]);

  const reset = () => {
    setStepIdx(0);
    setPlaying(false);
    if (mode === "icmp") setNodes(ICMP_NODES);
    else setNodes(SNMP_NODES);
    setTimeout(() => rf.fitView({ padding: 0.12, duration: 200 }), 60);
  };

  // Bygg traceroute-log
  const tracerouteLog = useMemo(() => {
    if (mode !== "icmp") return [];
    const log: string[] = [];
    const icmpStep = step as IcmpStep;
    const reachedSteps = icmpStep.phase === "logged" ? icmpStep.probeIdx + 1 : icmpStep.probeIdx;
    for (let i = 0; i < reachedSteps; i++) {
      const p = ICMP_PROBES[i];
      const last = p.replyNode!;
      const node = ICMP_NODES.find((n) => n.id === last);
      log.push(`${i + 1}  ${last} (${node?.data.ip})  ${Math.floor(Math.random() * 5 + 1 + i * 2)} ms`);
    }
    // Hvis vi er på reply-fasen for probe-idx-en, vis også den (tentativt)
    if (icmpStep.phase === "reply") {
      const p = ICMP_PROBES[icmpStep.probeIdx];
      const last = p.replyNode!;
      const node = ICMP_NODES.find((n) => n.id === last);
      log.push(
        `${icmpStep.probeIdx + 1}  ${last} (${node?.data.ip})  ${
          Math.floor(Math.random() * 5 + 1 + icmpStep.probeIdx * 2)
        } ms`,
      );
    }
    return log;
  }, [mode, step, stepIdx]);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="bg-muted/30 px-4 py-2 border-b border-border flex flex-wrap items-center gap-2">
        <div className="text-sm font-semibold inline-flex items-center gap-2">
          ICMP &amp; SNMP — diagnostikk og overvåking
        </div>
        <button
          onClick={() => setMode("icmp")}
          className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
            mode === "icmp"
              ? "bg-orange-500/20 text-orange-700 dark:text-orange-400 border border-orange-500/40"
              : "bg-background border border-border text-muted-foreground hover:bg-muted"
          }`}
        >
          <Radar className="h-3 w-3" /> ICMP (traceroute)
        </button>
        <button
          onClick={() => setMode("snmp")}
          className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
            mode === "snmp"
              ? "bg-blue-500/20 text-blue-700 dark:text-blue-400 border border-blue-500/40"
              : "bg-background border border-border text-muted-foreground hover:bg-muted"
          }`}
        >
          <Activity className="h-3 w-3" /> SNMP (manage/agent/TRAP)
        </button>
        <span className="ml-auto font-mono text-xs text-muted-foreground">
          Steg {stepIdx + 1} / {steps.length}
        </span>
      </div>

      <div className="bg-background px-4 py-2 border-b border-border text-sm font-medium">
        {step.title}
      </div>

      <div style={{ height: 360 }} className="relative bg-muted/10">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.12 }}
          proOptions={{ hideAttribution: true }}
          nodesConnectable={false}
          minZoom={0.4}
          maxZoom={2}
        >
          <Background gap={20} size={1} color="rgb(0 0 0 / 0.05)" />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>

      <div className="px-4 py-3 text-sm text-muted-foreground border-t border-border">
        {step.description}
      </div>

      <div className="px-4 py-2 flex flex-wrap items-center gap-1.5 border-t border-border bg-muted/20">
        <button
          onClick={() => setStepIdx((i) => Math.max(0, i - 1))}
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
          {playing ? "Pause" : "Auto"}
        </button>
        <button
          onClick={() => setStepIdx((i) => Math.min(steps.length - 1, i + 1))}
          disabled={stepIdx === steps.length - 1}
          className="inline-flex items-center gap-1 rounded border border-border bg-background px-2 py-1 text-xs hover:border-brand/60 disabled:opacity-40"
        >
          Neste <SkipForward className="h-3 w-3" />
        </button>
        <button
          onClick={reset}
          className="inline-flex items-center gap-1 rounded border border-border bg-background px-2 py-1 text-xs hover:border-brand/60 ml-auto"
        >
          <RotateCcw className="h-3 w-3" /> Reset
        </button>
        <div className="basis-full flex gap-1 flex-wrap mt-1">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => setStepIdx(i)}
              className={`h-1.5 w-6 rounded-full ${
                i === stepIdx
                  ? mode === "icmp"
                    ? "bg-orange-500"
                    : "bg-blue-500"
                  : i < stepIdx
                    ? "bg-muted-foreground/40"
                    : "bg-muted-foreground/20"
              }`}
              aria-label={`Gå til steg ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Resultat-paneler */}
      {mode === "icmp" ? (
        <TracerouteLog log={tracerouteLog} />
      ) : (
        <SnmpEventPanel step={step as SnmpStep} />
      )}

      <div className="px-4 py-2 flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground border-t border-border">
        {mode === "icmp" ? (
          <>
            <span className="inline-flex items-center gap-1">
              <span className="inline-block w-3 h-0.5 bg-emerald-500" /> probe forward
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="inline-block w-3 h-0.5 bg-orange-500" /> ICMP reply
            </span>
            <span className="inline-flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 text-red-500" /> TTL=0
            </span>
          </>
        ) : (
          <>
            <span className="inline-flex items-center gap-1">
              <span className="inline-block w-3 h-0.5 bg-blue-500" /> GET/Response (pull)
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="inline-block w-3 h-0.5 bg-fuchsia-500" /> TRAP (push)
            </span>
            <span className="inline-flex items-center gap-1">
              <Bell className="h-3 w-3 text-fuchsia-500" /> asynkront varsel
            </span>
          </>
        )}
      </div>
    </div>
  );
}

function TracerouteLog({ log }: { log: string[] }) {
  return (
    <div className="px-4 py-3 border-t border-border bg-background">
      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
        Terminal — traceroute output
      </div>
      <pre className="text-xs font-mono bg-black/85 dark:bg-black/60 text-emerald-300 rounded p-2 leading-relaxed overflow-x-auto">
{`$ traceroute 10.0.0.2
traceroute to 10.0.0.2 (10.0.0.2), 30 hops max
`}
        {log.length === 0 ? (
          <span className="text-emerald-300/60">(venter på svar…)</span>
        ) : (
          log.map((line, i) => (
            <div key={i}>{line}</div>
          ))
        )}
      </pre>
    </div>
  );
}

function SnmpEventPanel({ step }: { step: SnmpStep }) {
  return (
    <div className="px-4 py-3 border-t border-border bg-background">
      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
        SNMP-meldinger (denne fasen)
      </div>
      <div className="grid gap-2 md:grid-cols-2 text-xs font-mono">
        <div className="rounded border border-blue-500/30 bg-blue-500/5 p-2">
          <div className="font-semibold mb-1 text-blue-700 dark:text-blue-400">PULL (port 161)</div>
          {step.phase === "get" && (
            <div>
              <span className="text-muted-foreground">→</span> GET-Request OID
              1.3.6.1.2.1.2.2.1.10.1 (ifInOctets.1) til {step.pollTarget}
            </div>
          )}
          {step.phase === "response" && (
            <div>
              <span className="text-muted-foreground">←</span> GET-Response: ifInOctets.1 ={" "}
              <span className="text-emerald-400">2 458 372</span>
            </div>
          )}
          {step.phase !== "get" && step.phase !== "response" && (
            <div className="text-muted-foreground italic">(ingen polling i denne fasen)</div>
          )}
        </div>
        <div className="rounded border border-fuchsia-500/30 bg-fuchsia-500/5 p-2">
          <div className="font-semibold mb-1 text-fuchsia-700 dark:text-fuchsia-400">PUSH (port 162)</div>
          {step.phase === "trap" || step.phase === "ack" ? (
            <div>
              <span className="text-muted-foreground">→</span> TRAP fra {step.trapSource}: linkDown
              (OID 1.3.6.1.6.3.1.1.5.3), ifIndex=3
            </div>
          ) : (
            <div className="text-muted-foreground italic">(ingen trap nå — agentene er stille)</div>
          )}
        </div>
      </div>
    </div>
  );
}

export function Section55Live() {
  return (
    <ReactFlowProvider>
      <FlowInner />
    </ReactFlowProvider>
  );
}
