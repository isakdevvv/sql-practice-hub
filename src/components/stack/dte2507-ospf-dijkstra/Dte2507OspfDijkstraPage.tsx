import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { BookOpen, Network, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";

type Tab = "intro" | "dijkstra";

export function Dte2507OspfDijkstraPage() {
  const [tab, setTab] = useState<Tab>("intro");
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">
            OSPF — link-state ruting (Dijkstra på nettverket)
          </h1>
          <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
            Hvordan rutere internt i et autonomt system bygger en topologi-kart og kjører Dijkstra
            for å finne korteste vei. Kurose kap. 5.3. Bygger på dijkstra-viz, osi-tcpip og
            dte2507-ruting.
          </p>
        </header>

        <div className="mb-4 flex flex-wrap gap-1.5 border-b border-border">
          <TabBtn
            active={tab === "intro"}
            onClick={() => setTab("intro")}
            icon={<BookOpen className="h-3.5 w-3.5" />}
          >
            0. Start her
          </TabBtn>
          <TabBtn
            active={tab === "dijkstra"}
            onClick={() => setTab("dijkstra")}
            icon={<Network className="h-3.5 w-3.5" />}
          >
            1. OSPF live
          </TabBtn>
        </div>

        {tab === "intro" && <Intro onPick={setTab} />}
        {tab === "dijkstra" && <OspfModule />}

        <Lessons />
      </main>
    </div>
  );
}

function TabBtn({
  children,
  active,
  onClick,
  icon,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border-b-2 -mb-px transition-colors ${
        active
          ? "border-brand text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

function Intro({ onPick }: { onPick: (t: Tab) => void }) {
  return (
    <div className="space-y-4 text-sm">
      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-base font-semibold mb-2">Bygger på</h2>
        <ul className="list-disc pl-5 text-muted-foreground space-y-1">
          <li>
            <strong className="text-foreground">Dijkstra-algoritmen</strong> (
            <code>dijkstra-viz</code>): vi har sett hvordan korteste-vei- algoritmen velger nærmeste
            ubesøkte node og «slapper av» (relaxes) nabokanter.
          </li>
          <li>
            <strong className="text-foreground">Lag-modellen og rutere</strong> (
            <code>osi-tcpip</code>, <code>dte2507-inni-ruter</code>): rutere opererer i
            nettverkslaget. De videresender pakker fra inn-link til ut-link basert på en{" "}
            <em>forwarding-tabell</em> indeksert på destinasjons-IP.
          </li>
          <li>
            <strong className="text-foreground">Distance-vector vs link-state</strong> (
            <code>dte2507-count-to-infinity</code>): vi har sett at RIP/BGP er distance-vector (hver
            ruter forteller bare naboene om hva DEN tror er kortest avstand). Det er enkelt men har
            count-to-infinity-problemer.
          </li>
        </ul>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-base font-semibold mb-2">Hva er link-state da?</h2>
        <p className="text-muted-foreground">
          I link-state-ruting deler hver ruter <em>HELE</em> nabolaget sitt med ALLE andre rutere i
          nettverket. Etter en runde med «flooding» har hver ruter samme bilde av topologien. Da kan
          hver ruter selv kjøre Dijkstra fra seg selv og bygge sin egen forwarding-tabell.
        </p>
        <p className="text-muted-foreground mt-2">
          OSPF (Open Shortest Path First) er den vanligste link-state-protokollen innenfor et
          autonomt system. Brukes av store internet-leverandører, datasentre og bedriftsnett.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-base font-semibold mb-2">Ordbok</h2>
        <dl className="space-y-2.5 text-[13px]">
          <Def term="Autonomt system (AS)">
            En samling rutere under én organisasjons kontroll. F.eks. Telenor har ett AS, NTNU har
            ett. Internett er ~80 000 AS-er bundet sammen med BGP.
          </Def>
          <Def term="Intra-AS / Inter-AS ruting">
            <ul className="list-disc pl-5 mt-1">
              <li>
                <strong>Intra-AS</strong>: ruting INNENFOR et AS. OSPF, IS-IS, RIP.
              </li>
              <li>
                <strong>Inter-AS</strong>: ruting MELLOM AS-er. BGP er de facto.
              </li>
            </ul>
          </Def>
          <Def term="Link cost">
            Et tall som forteller «hvor dyrt» det er å bruke en lenke. Kan settes manuelt eller
            automatisk basert på båndbredde. Lavere = bedre.
            <code>cost = 10⁸ / båndbredde-i-bps</code> er Cisco-default.
          </Def>
          <Def term="Link-state advertisement (LSA)">
            En melding fra en ruter: «her er listen over mine naboer og kostnaden til hver av dem».
            Sendes når noe endrer seg (link går ned/opp) eller periodisk (default 30 min i OSPF).
          </Def>
          <Def term="Flooding">
            En LSA fra ruter R sendes til alle naboer, som sender den videre til sine naboer, osv.
            Hver ruter videresender bare LSA-en hvis den er
            <em>ny</em> (har høyere sekvensnummer enn forrige). Når flooding er ferdig, har alle
            rutere fått alle LSA-er.
          </Def>
          <Def term="Link-State Database (LSDB)">
            Hver ruter samler alle LSA-er den har sett i en database. LSDB er altså{" "}
            <em>hele topologi-grafen</em>: noder = rutere, kanter = lenker med kostnader.
          </Def>
          <Def term="SPF-treet (Shortest Path First)">
            Resultatet av å kjøre Dijkstra på LSDB-en fra seg selv som startnode. Et tre der vi vet
            korteste vei fra meg til alle andre rutere.
          </Def>
          <Def term="Forwarding-tabell">
            For hver destinasjon: hvilket NESTE-HOPP-naboruter skal pakken sendes til? Bygges
            automatisk fra SPF-treet — ta første hopp på korteste vei.
          </Def>
        </dl>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-base font-semibold mb-2">Modulen — hva skjer</h2>
        <p className="text-muted-foreground">
          Du får et lite nettverk med 6 rutere og noen lenker. Velg en «start-ruter». Trykk gjennom
          Dijkstra-steg for steg og se forwarding-tabellen bygges opp. Bytt link-cost ved å klikke
          på tallet på en lenke for å se hvordan ruting endrer seg.
        </p>
        <div className="mt-3">
          <Button size="sm" onClick={() => onPick("dijkstra")}>
            Start på modul 1 →
          </Button>
        </div>
      </div>
    </div>
  );
}

function Def({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="font-semibold text-foreground">{term}</dt>
      <dd className="text-muted-foreground mt-0.5">{children}</dd>
    </div>
  );
}

// ============================================================
// MODUL 1 — Dijkstra på ruter-nettverket
// ============================================================

type R = { id: string; x: number; y: number };
type L = { from: string; to: string; cost: number };

const ROUTERS: R[] = [
  { id: "R1", x: 80, y: 80 },
  { id: "R2", x: 280, y: 60 },
  { id: "R3", x: 480, y: 100 },
  { id: "R4", x: 130, y: 240 },
  { id: "R5", x: 320, y: 260 },
  { id: "R6", x: 500, y: 240 },
];
const DEFAULT_LINKS: L[] = [
  { from: "R1", to: "R2", cost: 5 },
  { from: "R1", to: "R4", cost: 2 },
  { from: "R2", to: "R3", cost: 4 },
  { from: "R2", to: "R5", cost: 3 },
  { from: "R3", to: "R6", cost: 2 },
  { from: "R4", to: "R5", cost: 6 },
  { from: "R5", to: "R6", cost: 4 },
  { from: "R5", to: "R3", cost: 1 },
];

function dijkstra(links: L[], src: string) {
  const dist = new Map<string, number>();
  const prev = new Map<string, string | null>();
  const visited = new Set<string>();
  for (const r of ROUTERS) {
    dist.set(r.id, Infinity);
    prev.set(r.id, null);
  }
  dist.set(src, 0);

  const adj = new Map<string, { to: string; w: number }[]>();
  for (const r of ROUTERS) adj.set(r.id, []);
  for (const e of links) {
    adj.get(e.from)?.push({ to: e.to, w: e.cost });
    adj.get(e.to)?.push({ to: e.from, w: e.cost });
  }

  const steps: {
    current: string | null;
    visited: Set<string>;
    dist: Map<string, number>;
    prev: Map<string, string | null>;
    description: string;
  }[] = [];
  steps.push({
    current: null,
    visited: new Set(),
    dist: new Map(dist),
    prev: new Map(prev),
    description: `LSDB lastet inn. Vi starter Dijkstra fra ${src}: dist[${src}] = 0, alle andre = ∞.`,
  });

  while (visited.size < ROUTERS.length) {
    let u: string | null = null;
    let best = Infinity;
    for (const r of ROUTERS)
      if (!visited.has(r.id) && dist.get(r.id)! < best) {
        best = dist.get(r.id)!;
        u = r.id;
      }
    if (u === null) break;
    visited.add(u);
    steps.push({
      current: u,
      visited: new Set(visited),
      dist: new Map(dist),
      prev: new Map(prev),
      description: `Velg ${u} (dist = ${best}). Den får sin endelige korteste-vei-verdi.`,
    });
    for (const { to, w } of adj.get(u)!) {
      if (visited.has(to)) continue;
      const alt = dist.get(u)! + w;
      if (alt < dist.get(to)!) {
        dist.set(to, alt);
        prev.set(to, u);
      }
    }
    steps.push({
      current: u,
      visited: new Set(visited),
      dist: new Map(dist),
      prev: new Map(prev),
      description: `Slapp av alle naboer av ${u}. Oppdaterte dist hvis kortere vei funnet.`,
    });
  }
  steps.push({
    current: null,
    visited: new Set(visited),
    dist: new Map(dist),
    prev: new Map(prev),
    description: `Ferdig. SPF-treet er klart — forwarding-tabellen kan bygges.`,
  });
  return steps;
}

function buildForwardingTable(
  prev: Map<string, string | null>,
  dist: Map<string, number>,
  src: string,
) {
  // For hver destinasjon: hvilken neste-hopp-naboruter?
  return ROUTERS.filter((r) => r.id !== src).map((r) => {
    let cur = r.id;
    let nextHop: string | null = null;
    while (cur !== src && prev.get(cur) != null) {
      if (prev.get(cur) === src) {
        nextHop = cur;
        break;
      }
      cur = prev.get(cur)!;
    }
    return { dest: r.id, nextHop, cost: dist.get(r.id) ?? Infinity };
  });
}

function OspfModule() {
  const [src, setSrc] = useState("R1");
  const [links, setLinks] = useState(DEFAULT_LINKS);
  const [step, setStep] = useState(0);

  const steps = useMemo(() => dijkstra(links, src), [links, src]);
  const s = steps[Math.min(step, steps.length - 1)];

  const fwd = buildForwardingTable(s.prev, s.dist, src);

  function bumpCost(idx: number) {
    setLinks((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], cost: (next[idx].cost % 9) + 1 };
      return next;
    });
    setStep(0);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
        <strong className="text-foreground">Klikk på en lenke-kostnad</strong> (det lille tallet)
        for å rotere den (1 → 9 → 1). Det simulerer en link-state-endring. Når kostnaden endrer seg
        blir vi tvunget til å starte Dijkstra på nytt, og forwarding-tabellen blir oppdatert.
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="bg-muted/30 px-4 py-2 text-xs text-muted-foreground border-b border-border flex justify-between items-center">
          <span>{s.description}</span>
          <span className="font-mono">
            Steg {step + 1} / {steps.length}
          </span>
        </div>
        <svg viewBox="0 0 600 320" className="w-full h-auto">
          <rect x={0} y={0} width={600} height={320} className="fill-muted/10" />
          {links.map((l, i) => {
            const a = ROUTERS.find((r) => r.id === l.from)!;
            const b = ROUTERS.find((r) => r.id === l.to)!;
            const onPath = s.prev.get(l.to) === l.from || s.prev.get(l.from) === l.to;
            return (
              <g key={i}>
                <line
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  className={onPath ? "stroke-brand" : "stroke-muted-foreground/40"}
                  strokeWidth={onPath ? 2.5 : 1.5}
                />
                <g onClick={() => bumpCost(i)} className="cursor-pointer">
                  <rect
                    x={(a.x + b.x) / 2 - 11}
                    y={(a.y + b.y) / 2 - 9}
                    width={22}
                    height={18}
                    rx={4}
                    className="fill-card stroke-border"
                    strokeWidth={1}
                  />
                  <text
                    x={(a.x + b.x) / 2}
                    y={(a.y + b.y) / 2 + 4}
                    textAnchor="middle"
                    className="fill-foreground text-[11px] tabular-nums select-none"
                  >
                    {l.cost}
                  </text>
                </g>
              </g>
            );
          })}
          {ROUTERS.map((r) => {
            const visited = s.visited.has(r.id);
            const current = s.current === r.id;
            const isSrc = src === r.id;
            const d = s.dist.get(r.id)!;
            return (
              <g key={r.id}>
                <circle
                  cx={r.x}
                  cy={r.y}
                  r={22}
                  className={
                    current
                      ? "fill-amber-500/30 stroke-amber-500"
                      : visited
                        ? "fill-brand/20 stroke-brand"
                        : isSrc
                          ? "fill-success/10 stroke-success"
                          : "fill-card stroke-foreground/40"
                  }
                  strokeWidth={2}
                />
                <text
                  x={r.x}
                  y={r.y + 4}
                  textAnchor="middle"
                  className="fill-foreground text-sm font-mono font-semibold select-none"
                >
                  {r.id}
                </text>
                <text
                  x={r.x}
                  y={r.y - 28}
                  textAnchor="middle"
                  className="fill-muted-foreground text-[10px] tabular-nums select-none"
                >
                  {d === Infinity ? "∞" : d}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
        >
          <ChevronLeft className="h-3 w-3 mr-1" /> Forrige
        </Button>
        <Button
          size="sm"
          onClick={() => setStep(Math.min(steps.length - 1, step + 1))}
          disabled={step >= steps.length - 1}
        >
          Neste <ChevronRight className="h-3 w-3 ml-1" />
        </Button>
        <span className="text-xs text-muted-foreground">
          Steg {step + 1} / {steps.length}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <label className="text-xs text-muted-foreground">Start-ruter:</label>
          <select
            value={src}
            onChange={(e) => {
              setSrc(e.target.value);
              setStep(0);
            }}
            className="h-7 rounded border border-border bg-background px-2 text-xs"
          >
            {ROUTERS.map((r) => (
              <option key={r.id} value={r.id}>
                {r.id}
              </option>
            ))}
          </select>
          <Button size="sm" variant="outline" onClick={() => setStep(0)}>
            <RotateCcw className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-3">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
          Forwarding-tabell på {src}
        </div>
        <table className="w-full text-xs">
          <thead className="text-[10px] uppercase text-muted-foreground">
            <tr>
              <th className="text-left py-1">Destinasjon</th>
              <th className="text-left py-1">Neste hopp</th>
              <th className="text-right py-1">Total kost</th>
            </tr>
          </thead>
          <tbody>
            {fwd.map((f) => (
              <tr key={f.dest} className="border-t border-border">
                <td className="py-1.5 font-mono">{f.dest}</td>
                <td className="py-1.5 font-mono">{f.nextHop ?? "—"}</td>
                <td className="py-1.5 text-right font-mono">
                  {f.cost === Infinity ? "∞" : f.cost}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Lessons() {
  return (
    <section className="mt-10 space-y-3 text-sm">
      <h2 className="text-lg font-semibold">Oppsummering</h2>
      <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
        <li>
          OSPF har 3 faser: (1) finne naboer (Hello-pakker), (2) dele LSA-er med hele AS-et
          (flooding), (3) hver ruter kjører Dijkstra fra seg selv.
        </li>
        <li>
          <strong className="text-foreground">Skalering:</strong> OSPF bruker «areas» for å unngå at
          hele AS-et må dele alt med alle. En backbone- area (area 0) limer sammen
          ikke-backbone-areas.
        </li>
        <li>
          <strong className="text-foreground">Konvergens:</strong> når en link går ned tar det noen
          sekunder før alle rutere har fått oppdatert LSDB og kjørt Dijkstra på nytt.
          Distance-vector (RIP) ville brukt mye lengre, og kan ha count-to-infinity-problemer.
        </li>
        <li>
          <strong className="text-foreground">Ekstern-ruting:</strong> mellom AS-er bruker vi BGP,
          som er en path-vector-protokoll (ikke Dijkstra). BGP-policy bryr seg om mer enn bare
          korteste vei — det handler om forretnings-avtaler. Se <code>dte2507-bgp-stige</code> for
          det.
        </li>
      </ul>
    </section>
  );
}
