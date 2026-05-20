import { useEffect, useMemo, useRef, useState } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
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
  Globe2,
  Coins,
  Route as RouteIcon,
} from "lucide-react";

// Section53Live — BGP inter-AS path-vector.
//
// Pedagogisk poeng: BGP velger ruter på POLICY, ikke bare på korteste path.
// Brukeren ser samme topologi med to ulike policy-valg og hvordan AS-en
// faktisk ruter trafikk fra "source" til "destination" prefix endrer seg.
//
// Vi viser også at BGP er en PATH-VECTOR-protokoll: hver oppdatering bærer
// hele AS-PATH-en, og en AS aksepterer ikke en oppdatering hvor sitt eget
// ASN allerede står i pathen (sløyfe-deteksjon).

// ============================================================
// Topologi: 6 autonome systemer rundt prefiks p eid av AS5.
//
//   AS1 (kunde)  ---  AS2 (provider, dyrere)
//        \              \
//         \              \
//        AS3 (provider, billigere) --- AS5 (eier prefiks p)
//         /              /
//        /              /
//   AS4 (kunde)  ---  AS6 (peer av AS5)
//
// AS1 vil sende trafikk til p (i AS5). To stier finnes (i denne forenklingen):
//   path A: AS1 → AS2 → AS5     (kort, men via dyr provider AS2)
//   path B: AS1 → AS3 → AS5     (kort, og via billigere provider AS3)
//   path C: AS1 → AS3 → AS6 → AS5 (lengre, peer-vei)
//
// AS1 sin policy bestemmer hvilken den faktisk velger.
// ============================================================

type ASRole = "customer" | "provider" | "peer" | "owner";

type AsNodeData = {
  label: string;
  asn: number;
  role: ASRole;
  highlight?: "source" | "dest" | "viaCheap" | "viaShort" | "filtered";
  selectedRoute?: boolean;
  badge?: string;
};

const ROLE_BG: Record<ASRole, string> = {
  customer: "bg-sky-500/10 border-sky-500/40",
  provider: "bg-amber-500/10 border-amber-500/40",
  peer: "bg-purple-500/10 border-purple-500/40",
  owner: "bg-emerald-500/10 border-emerald-500/40",
};

const HI_RING: Record<NonNullable<AsNodeData["highlight"]>, string> = {
  source: "ring-2 ring-rose-500 shadow-[0_0_0_4px_rgba(244,63,94,0.15)]",
  dest: "ring-2 ring-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.15)]",
  viaCheap: "ring-2 ring-blue-500",
  viaShort: "ring-2 ring-orange-500",
  filtered: "ring-2 ring-red-500 opacity-60",
};

function AsNode({ data }: NodeProps) {
  const d = data as AsNodeData;
  const ring = d.highlight ? HI_RING[d.highlight] : "";
  return (
    <div
      className={`relative rounded-md border-2 px-3 py-2 text-center shadow-sm ${ROLE_BG[d.role]} ${ring}`}
      style={{ minWidth: 78 }}
    >
      <Handle type="target" position={Position.Left} className="!bg-transparent !border-0" />
      <Handle type="source" position={Position.Right} className="!bg-transparent !border-0" />
      <Handle type="target" position={Position.Top} id="top" className="!bg-transparent !border-0" />
      <Handle type="source" position={Position.Bottom} id="bottom" className="!bg-transparent !border-0" />
      <div className="text-sm font-bold leading-none">{d.label}</div>
      <div className="mt-0.5 text-[9px] text-muted-foreground leading-none">AS{d.asn}</div>
      {d.badge && (
        <div className="mt-1 text-[10px] font-mono leading-none">{d.badge}</div>
      )}
    </div>
  );
}

const nodeTypes = { as: AsNode };

// ============================================================
// AS-topologi
// ============================================================

type ASDef = { id: string; asn: number; role: ASRole; x: number; y: number; commercial?: "cheap" | "expensive" };
const INIT_AS: ASDef[] = [
  { id: "AS1", asn: 1, role: "customer", x: 40, y: 220 },
  { id: "AS2", asn: 2, role: "provider", x: 240, y: 80, commercial: "expensive" },
  { id: "AS3", asn: 3, role: "provider", x: 240, y: 220, commercial: "cheap" },
  { id: "AS4", asn: 4, role: "customer", x: 40, y: 360 },
  { id: "AS5", asn: 5, role: "owner", x: 520, y: 150 },
  { id: "AS6", asn: 6, role: "peer", x: 380, y: 360 },
];

type AsLink = { a: string; b: string; rel: "p2c" | "p2p"; label?: string };
// p2c = provider→customer (b is provider of a)
// p2p = peers (no money)
const AS_LINKS: AsLink[] = [
  { a: "AS1", b: "AS2", rel: "p2c", label: "kunde-link" },
  { a: "AS1", b: "AS3", rel: "p2c", label: "kunde-link" },
  { a: "AS4", b: "AS3", rel: "p2c" },
  { a: "AS4", b: "AS6", rel: "p2c" },
  { a: "AS2", b: "AS5", rel: "p2p", label: "peer" },
  { a: "AS3", b: "AS5", rel: "p2c" },
  { a: "AS6", b: "AS5", rel: "p2p", label: "peer" },
];

function key(a: string, b: string) {
  return [a, b].sort().join("-");
}

const INIT_NODES: Node<AsNodeData>[] = INIT_AS.map((a) => ({
  id: a.id,
  type: "as",
  position: { x: a.x, y: a.y },
  data: { label: a.id, asn: a.asn, role: a.role },
}));

// ============================================================
// Edges
// ============================================================

function buildEdges(opts: {
  highlightPath?: string[]; // sekvens av AS-id-er
  highlightColor?: "blue" | "orange" | "purple";
  filtered?: { a: string; b: string }[];
  showCommercial?: boolean;
}): Edge[] {
  const pathSet = new Set<string>();
  if (opts.highlightPath) {
    for (let i = 0; i < opts.highlightPath.length - 1; i++) {
      pathSet.add(key(opts.highlightPath[i], opts.highlightPath[i + 1]));
    }
  }
  const filteredSet = new Set((opts.filtered ?? []).map((f) => key(f.a, f.b)));
  return AS_LINKS.map((l, i) => {
    const k = key(l.a, l.b);
    const isHi = pathSet.has(k);
    const isFil = filteredSet.has(k);
    const color =
      opts.highlightColor === "blue"
        ? "#3b82f6"
        : opts.highlightColor === "orange"
          ? "#f97316"
          : "#a855f7";
    const baseColor = l.rel === "p2p" ? "#a855f788" : "rgb(120 120 120 / 0.6)";
    return {
      id: `l${i}`,
      source: l.a,
      target: l.b,
      label: opts.showCommercial
        ? l.rel === "p2c"
          ? "$ kunde→provider"
          : "peer (gratis)"
        : l.label,
      labelStyle: { fontSize: 9, fontWeight: 600 },
      labelBgStyle: { fill: "white", fillOpacity: 0.85 },
      style: {
        stroke: isFil ? "#ef4444" : isHi ? color : baseColor,
        strokeWidth: isHi ? 3.5 : 1.8,
        strokeDasharray: l.rel === "p2p" ? "5 3" : isFil ? "3 3" : undefined,
        opacity: isFil ? 0.5 : 1,
      },
      animated: isHi,
    };
  });
}

// ============================================================
// Mulige BGP-stier fra AS1 til AS5 (manuelt enumerert)
// ============================================================

type BgpRoute = {
  path: string[]; // AS-ID-sekvens fra source til dest inclusive
  asLen: number; // path.length - 1
  cost: "cheap" | "expensive" | "peer";
  description: string;
};

const ROUTES_FROM_AS1: BgpRoute[] = [
  {
    path: ["AS1", "AS3", "AS5"],
    asLen: 2,
    cost: "cheap",
    description:
      "AS1 → AS3 → AS5. To hopp. AS3 er billig provider. Dette er den korteste OG billigste pathen.",
  },
  {
    path: ["AS1", "AS2", "AS5"],
    asLen: 2,
    cost: "expensive",
    description:
      "AS1 → AS2 → AS5. To hopp. AS2 er dyrere provider. Samme AS-path-lengde som via AS3.",
  },
  {
    path: ["AS1", "AS3", "AS6", "AS5"],
    asLen: 3,
    cost: "cheap",
    description:
      "AS1 → AS3 → AS6 → AS5. Tre hopp via peer-link AS6-AS5. Lengre, og krever at AS6 ville annonsert AS5 til AS3 — men AS6 har ikke kommersiell grunn til å reklamere AS5 til sine providers' kunder (gratis transit-trafikk for AS5 og AS3).",
  },
];

// ============================================================
// Policy-engine
// ============================================================

type Policy = "shortest" | "preferred";

// Velg «beste» rute etter policy.
function pickBestRoute(routes: BgpRoute[], policy: Policy): BgpRoute {
  if (policy === "shortest") {
    // Korteste AS-path; ved tie, vilkårlig — vi tar første.
    let best = routes[0];
    for (const r of routes) if (r.asLen < best.asLen) best = r;
    // Tie-breaker: foretrekk via AS2 (alfabetisk over AS3? Vi velger AS2 for å gjøre poenget at policy avgjør)
    // Faktisk: korteste alene gir tie 2 vs 2. Vi velger første: AS3-pathen.
    const tied = routes.filter((r) => r.asLen === best.asLen);
    return tied[0];
  } else {
    // "preferred provider" = AS3 (cheap). Filtrer ut ruter som ikke går via AS3
    // som første provider, ellers fall tilbake.
    const cheap = routes.filter((r) => r.cost === "cheap");
    if (cheap.length > 0) {
      // Velg den med kortest path blant cheap.
      let best = cheap[0];
      for (const r of cheap) if (r.asLen < best.asLen) best = r;
      return best;
    }
    return routes[0];
  }
}

// ============================================================
// Step-skript
// ============================================================

type Step = {
  title: string;
  description: string;
  // policy som er aktiv (state utenfor stepIdx kontrollerer dette).
  showRoutes?: boolean;
  showCommercial?: boolean;
  highlight?: "selected" | "alternatives" | null;
  highlightFiltered?: boolean;
};

const STEPS: Step[] = [
  {
    title: "1. Internett som AS-graf",
    description:
      "Internett er ikke ett nett — det er ca 75 000 autonome systemer (AS) som peer-er med hverandre. Vi viser 6 av dem. AS5 eier prefiks p (det vi vil nå). AS1 ønsker å sende trafikk til p. BGP er protokollen som hjelper AS1 å lære HVILKE veier som finnes til p, og VELGE en av dem.",
  },
  {
    title: "2. AS5 starter — annonserer prefiks p til sine BGP-naboer",
    description:
      "AS5 sender BGP UPDATE-meldinger over eBGP-sessions til AS2, AS3 og AS6: «jeg eier prefiks p; AS-PATH = [AS5]». Hver mottaker legger til SIN ASN foran og kan forwarde til sine kunder. AS-PATH er pathens identitet — også brukt til sløyfedetektering.",
    highlight: "alternatives",
  },
  {
    title: "3. AS1 mottar to UPDATE-meldinger om p",
    description:
      "AS2 sender til kunden AS1: «p er nåbar via [AS2, AS5]». AS3 sender til kunden AS1: «p er nåbar via [AS3, AS5]». Begge har AS-PATH-lengde = 2. AS6 sender ikke til AS3 (peer-policy: AS6 reklamerer ikke AS5 til AS3 — det ville gitt gratis transit-trafikk).",
    showRoutes: true,
    highlight: "alternatives",
  },
  {
    title: "4. Policy «shortest AS-path» — vilkårlig blant ties",
    description:
      "Med klassisk BGP-tie-breaker «velg den med kortest AS-PATH» har AS1 to like gode ruter. Begge er 2 hop. Tradisjonelt brukes da andre kriterier (Local Preference, MED, eldste rute, lavest neighbour-ID). I denne forenklingen velger vi vilkårlig den via AS2.",
    showRoutes: true,
    highlight: "selected",
  },
  {
    title: "5. Bytt policy: «preferred provider = AS3 (billig)»",
    description:
      "AS1-administratoren konfigurerer Local Preference: alle ruter mottatt fra AS3-naboen får LocalPref = 200, fra AS2 LocalPref = 100. LocalPref er DET FØRSTE BGP-kriteriet — kommer FØR AS-PATH-lengde. Resultatet: AS1 velger nå pathen via AS3 selv om begge var like korte. Penger over hop-count.",
    showRoutes: true,
    showCommercial: true,
    highlight: "selected",
  },
  {
    title: "6. Hvorfor sender ikke AS6 annonse om AS5 til AS3?",
    description:
      "Eksport-policy (commercial valley-free). AS6 har en peer-relasjon med AS5 (gratis trafikk). Hvis AS6 reklamerte AS5 til AS3, ville AS3 sende trafikk til AS5 GJENNOM AS6 — AS6 må da bære gratis transit. Derfor: peer-ruter eksporteres aldri til provider eller peer. Bare til kunder. Pathen AS1→AS3→AS6→AS5 finnes derfor IKKE i BGP-tabellene — selv om den eksisterer fysisk.",
    showRoutes: true,
    showCommercial: true,
    highlightFiltered: true,
  },
  {
    title: "7. Sammenligning: policy bestemmer rute",
    description:
      "BGP er ikke en korteste-sti-protokoll. Den er en POLICY-engine. Hver AS bestemmer selv hvilke ruter den vil bruke (import-policy: LocalPref) og hvilke den vil annonsere videre (export-policy: peer-regel). Korteste path er bare ett kriterium blant mange. Internett rutes ikke etter optimum — etter penger og politiske avtaler.",
    showRoutes: true,
    showCommercial: true,
    highlight: "selected",
  },
];

// ============================================================
// Hovedkomponent
// ============================================================

function FlowInner() {
  const [policy, setPolicy] = useState<Policy>("shortest");
  const [nodes, setNodes, onNodesChange] = useNodesState(INIT_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(buildEdges({}));
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const playTimerRef = useRef<number | null>(null);
  const rf = useReactFlow();

  // Når vi når step 5 eller senere, lås policy = preferred.
  // På step 3-4, policy = shortest.
  // Lar brukeren overstyre manuelt etter step 5.
  useEffect(() => {
    if (stepIdx === 4 || stepIdx === 5 || stepIdx === 6) setPolicy("preferred");
    else if (stepIdx === 3) setPolicy("shortest");
  }, [stepIdx]);

  const step = STEPS[stepIdx];

  const selected = useMemo(() => pickBestRoute(ROUTES_FROM_AS1, policy), [policy]);

  useEffect(() => {
    const t = setTimeout(() => rf.fitView({ padding: 0.12, duration: 0 }), 60);
    return () => clearTimeout(t);
  }, [rf]);

  // Bygg edges + node-highlights
  useEffect(() => {
    let highlightPath: string[] | undefined;
    let color: "blue" | "orange" | "purple" = "blue";
    const filtered: { a: string; b: string }[] = [];

    if (step.highlight === "selected") {
      highlightPath = selected.path;
      color = policy === "preferred" ? "blue" : "orange";
    }

    if (step.highlightFiltered) {
      // Markér AS6-AS3-strekningen som "ville vært brukt men er filtrert"
      filtered.push({ a: "AS3", b: "AS6" });
      // Vi viser dessverre ikke direkte AS3-AS6, men markerer i sti-listen.
    }

    setEdges(
      buildEdges({
        highlightPath,
        highlightColor: color,
        filtered,
        showCommercial: step.showCommercial,
      }),
    );

    const onPath = new Set(highlightPath ?? []);
    setNodes((nds) =>
      nds.map((n) => {
        let highlight: AsNodeData["highlight"];
        let badge: string | undefined;
        if (n.id === "AS1") highlight = "source";
        else if (n.id === "AS5") highlight = "dest";
        else if (onPath.has(n.id)) highlight = policy === "preferred" ? "viaCheap" : "viaShort";

        if (step.showRoutes) {
          if (n.id === "AS2") badge = "LocalPref=100";
          if (n.id === "AS3") badge = step.showCommercial ? "LocalPref=200" : "LocalPref=100";
        }
        if (n.id === "AS5") badge = "eier p";
        if (n.id === "AS1" && step.showRoutes) badge = "vil nå p";

        return {
          ...n,
          data: { ...(n.data as AsNodeData), highlight, badge },
        };
      }),
    );
  }, [step, selected, policy, setEdges, setNodes]);

  useEffect(() => {
    if (!playing) return;
    playTimerRef.current = window.setTimeout(() => {
      if (stepIdx + 1 < STEPS.length) setStepIdx((i) => i + 1);
      else setPlaying(false);
    }, 3200);
    return () => {
      if (playTimerRef.current) window.clearTimeout(playTimerRef.current);
    };
  }, [playing, stepIdx]);

  const reset = () => {
    setStepIdx(0);
    setPlaying(false);
    setPolicy("shortest");
    setNodes(INIT_NODES);
    setTimeout(() => rf.fitView({ padding: 0.12, duration: 200 }), 60);
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="bg-muted/30 px-4 py-2 border-b border-border flex flex-wrap items-center gap-2">
        <div className="text-sm font-semibold inline-flex items-center gap-2">
          <Globe2 className="h-4 w-4" /> BGP — path-vector og policy
        </div>
        <button
          onClick={() => setPolicy("shortest")}
          className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
            policy === "shortest"
              ? "bg-orange-500/20 text-orange-700 dark:text-orange-400 border border-orange-500/40"
              : "bg-background border border-border text-muted-foreground hover:bg-muted"
          }`}
        >
          <RouteIcon className="h-3 w-3" /> Shortest AS-path
        </button>
        <button
          onClick={() => setPolicy("preferred")}
          className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
            policy === "preferred"
              ? "bg-blue-500/20 text-blue-700 dark:text-blue-400 border border-blue-500/40"
              : "bg-background border border-border text-muted-foreground hover:bg-muted"
          }`}
        >
          <Coins className="h-3 w-3" /> Preferred provider (AS3)
        </button>
        <span className="ml-auto font-mono text-xs text-muted-foreground">
          Steg {stepIdx + 1} / {STEPS.length}
        </span>
      </div>

      <div className="bg-background px-4 py-2 border-b border-border text-sm font-medium">
        {step.title}
      </div>

      <div style={{ height: 440 }} className="relative bg-muted/10">
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
          <MiniMap pannable zoomable position="bottom-right" />
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
          onClick={() => setStepIdx((i) => Math.min(STEPS.length - 1, i + 1))}
          disabled={stepIdx === STEPS.length - 1}
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
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setStepIdx(i)}
              className={`h-1.5 w-6 rounded-full ${
                i === stepIdx
                  ? policy === "preferred"
                    ? "bg-blue-500"
                    : "bg-orange-500"
                  : i < stepIdx
                    ? "bg-muted-foreground/40"
                    : "bg-muted-foreground/20"
              }`}
              aria-label={`Gå til steg ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Ruter-tabell — vis kandidater + valgt */}
      {step.showRoutes && <RouteTablePanel selected={selected} policy={policy} />}

      <div className="px-4 py-2 flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground border-t border-border">
        <span className="inline-flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-sm bg-sky-500/40 border border-sky-500" /> kunde
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-sm bg-amber-500/40 border border-amber-500" /> provider
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-sm bg-purple-500/40 border border-purple-500" /> peer
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-sm bg-emerald-500/40 border border-emerald-500" /> eier prefiks
        </span>
        <span className="ml-auto">Dra noder · scroll for zoom</span>
      </div>
    </div>
  );
}

function RouteTablePanel({ selected, policy }: { selected: BgpRoute; policy: Policy }) {
  return (
    <div className="px-4 py-3 border-t border-border bg-background">
      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
        AS1 sin BGP-tabell for prefiks p (etter import-filter)
      </div>
      <div className="overflow-x-auto">
        <table className="text-xs font-mono w-full">
          <thead>
            <tr className="text-muted-foreground">
              <th className="text-left py-1 pr-2">AS-PATH</th>
              <th className="text-left py-1 px-2">Lengde</th>
              <th className="text-left py-1 px-2">LocalPref</th>
              <th className="text-left py-1 px-2">Kost</th>
              <th className="text-left py-1 px-2">Valgt?</th>
            </tr>
          </thead>
          <tbody>
            {ROUTES_FROM_AS1.filter((r) => r.path[r.path.length - 1] === "AS5").map((r) => {
              const isSelected = r.path.join("-") === selected.path.join("-");
              const localPref =
                policy === "preferred" && r.cost === "cheap" ? 200 : 100;
              const isPossible = r.asLen <= 2; // Vi viser kun de to direkte (peer-pathen er filtrert i import)
              if (!isPossible) return null;
              return (
                <tr
                  key={r.path.join("-")}
                  className={`border-t border-border/50 ${isSelected ? "bg-brand/5" : ""}`}
                >
                  <td className="py-1 pr-2">{r.path.join(" → ")}</td>
                  <td className="py-1 px-2">{r.asLen}</td>
                  <td className="py-1 px-2">{localPref}</td>
                  <td className="py-1 px-2">
                    {r.cost === "cheap" ? (
                      <span className="text-emerald-600 dark:text-emerald-400">billig</span>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400">dyr</span>
                    )}
                  </td>
                  <td className="py-1 px-2">
                    {isSelected ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold">
                        ✓ aktiv
                      </span>
                    ) : (
                      <span className="text-muted-foreground">kandidat</span>
                    )}
                  </td>
                </tr>
              );
            })}
            <tr className="border-t border-border/50 opacity-50">
              <td className="py-1 pr-2 italic">AS1 → AS3 → AS6 → AS5</td>
              <td className="py-1 px-2">3</td>
              <td className="py-1 px-2">—</td>
              <td className="py-1 px-2">—</td>
              <td className="py-1 px-2 italic text-red-600 dark:text-red-400">
                filtrert (AS6 eksport)
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="mt-2 text-[11px] text-muted-foreground">
        Tie-breaker-rekkefølge i BGP: <span className="font-mono">LocalPref</span> →{" "}
        <span className="font-mono">AS-PATH-lengde</span> →{" "}
        <span className="font-mono">MED</span> → eBGP&gt;iBGP →{" "}
        <span className="font-mono">IGP-kost</span> → lavest BGP-ID. LocalPref kommer FØR
        AS-PATH-lengde — derfor vinner policy alltid.
      </div>
    </div>
  );
}

export function Section53Live() {
  return (
    <ReactFlowProvider>
      <FlowInner />
    </ReactFlowProvider>
  );
}
