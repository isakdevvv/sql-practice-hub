import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Check, RotateCcw } from "lucide-react";

type Scenario = "circular" | "no-circular" | "bankers";

// ---- Resource Allocation Graph ----
type RagEdge = {
  from: string; // process or resource
  to: string;
  kind: "request" | "assignment";
};

const SCENARIOS: Record<Exclude<Scenario, "bankers">, { edges: RagEdge[]; deadlocked: boolean; story: string }> = {
  circular: {
    edges: [
      { from: "P1", to: "R1", kind: "request" },
      { from: "R1", to: "P2", kind: "assignment" },
      { from: "P2", to: "R2", kind: "request" },
      { from: "R2", to: "P1", kind: "assignment" },
    ],
    deadlocked: true,
    story:
      "P1 holder R2 og venter på R1. P2 holder R1 og venter på R2. Sirkulær ventekjede — ingen kan komme videre.",
  },
  "no-circular": {
    edges: [
      { from: "P1", to: "R1", kind: "request" },
      { from: "R1", to: "P2", kind: "assignment" },
      { from: "P3", to: "R2", kind: "request" },
      { from: "R2", to: "P2", kind: "assignment" },
    ],
    deadlocked: false,
    story:
      "P2 holder begge ressurser og kan kjøre ferdig. Når P2 frigjør R1 og R2, kan P1 og P3 ta dem. Ingen sirkel.",
  },
};

// Detekter syklus i RAG (single-instance resources).
function hasCycle(edges: RagEdge[]): boolean {
  const adj = new Map<string, string[]>();
  for (const e of edges) {
    if (!adj.has(e.from)) adj.set(e.from, []);
    adj.get(e.from)!.push(e.to);
  }
  const WHITE = 0, GRAY = 1, BLACK = 2;
  const color = new Map<string, number>();
  const nodes = new Set<string>();
  for (const e of edges) {
    nodes.add(e.from);
    nodes.add(e.to);
  }
  for (const n of nodes) color.set(n, WHITE);
  function dfs(u: string): boolean {
    color.set(u, GRAY);
    for (const v of adj.get(u) ?? []) {
      if (color.get(v) === GRAY) return true;
      if (color.get(v) === WHITE && dfs(v)) return true;
    }
    color.set(u, BLACK);
    return false;
  }
  for (const n of nodes) {
    if (color.get(n) === WHITE && dfs(n)) return true;
  }
  return false;
}

export function DeadlockVizPage() {
  const [scenario, setScenario] = useState<Scenario>("circular");

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Deadlock</h1>
          <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
            Fire betingelser for deadlock, ressurs-allokeringsgraf med
            syklus-deteksjon, og Bankers algoritme for sikker tilstand.
          </p>
        </header>

        <FourConditions />

        <div className="mt-6 flex gap-2">
          <Tab id="circular" current={scenario} onChange={setScenario}>
            RAG — sirkulær venting
          </Tab>
          <Tab id="no-circular" current={scenario} onChange={setScenario}>
            RAG — ingen sirkel
          </Tab>
          <Tab id="bankers" current={scenario} onChange={setScenario}>
            Bankers algoritme
          </Tab>
        </div>

        <div className="mt-3">
          {scenario === "bankers" ? <BankersAlgorithm /> : <RagView scenario={scenario} />}
        </div>

        <Lessons />
      </main>
    </div>
  );
}

function FourConditions() {
  const conditions = [
    {
      title: "Mutual exclusion",
      body: "Minst én ressurs kan ikke deles — kun én prosess kan holde den om gangen.",
    },
    {
      title: "Hold-and-wait",
      body: "En prosess holder minst én ressurs mens den venter på flere.",
    },
    {
      title: "No preemption",
      body: "Ressurser kan ikke tas tilbake med tvang — bare frivillig frigjøres.",
    },
    {
      title: "Sirkulær venting",
      body: "P1 → P2 → … → Pn → P1 — en kjede hvor hver venter på den neste.",
    },
  ];
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
        Coffman-betingelsene (alle fire må gjelde)
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {conditions.map((c) => (
          <div key={c.title} className="rounded-md border border-border bg-background p-3">
            <div className="text-sm font-semibold">{c.title}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{c.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Tab({
  id,
  current,
  onChange,
  children,
}: {
  id: Scenario;
  current: Scenario;
  onChange: (s: Scenario) => void;
  children: React.ReactNode;
}) {
  const active = id === current;
  return (
    <button
      onClick={() => onChange(id)}
      className={`rounded-md px-3 py-1.5 text-xs font-medium ${
        active ? "bg-brand text-brand-foreground" : "bg-muted hover:bg-accent"
      }`}
    >
      {children}
    </button>
  );
}

function RagView({ scenario }: { scenario: Exclude<Scenario, "bankers"> }) {
  const data = SCENARIOS[scenario];
  const cycle = useMemo(() => hasCycle(data.edges), [data.edges]);

  // Posisjoner — to/tre prosesser til venstre, ressurser i midten/høyre
  const positions: Record<string, { x: number; y: number; type: "P" | "R" }> = {};
  const W = 600;
  const H = 280;
  const nodes = Array.from(new Set(data.edges.flatMap((e) => [e.from, e.to])));
  const processes = nodes.filter((n) => n.startsWith("P")).sort();
  const resources = nodes.filter((n) => n.startsWith("R")).sort();
  processes.forEach((p, i) => {
    positions[p] = {
      x: 80,
      y: 50 + (i * (H - 100)) / Math.max(1, processes.length - 1),
      type: "P",
    };
  });
  resources.forEach((r, i) => {
    positions[r] = {
      x: W - 80,
      y: 50 + (i * (H - 100)) / Math.max(1, resources.length - 1),
      type: "R",
    };
  });

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className={`px-4 py-2 text-sm font-medium ${cycle ? "bg-rose-500/10 text-rose-700 dark:text-rose-300" : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"} flex items-center gap-2`}>
        {cycle ? <AlertTriangle className="h-4 w-4" /> : <Check className="h-4 w-4" />}
        {cycle ? "Syklus oppdaget — deadlock" : "Ingen syklus — trygt"}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        <defs>
          <marker id="arr-req" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" className="fill-amber-500" />
          </marker>
          <marker id="arr-asg" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" className="fill-brand" />
          </marker>
        </defs>
        {data.edges.map((e, i) => {
          const a = positions[e.from];
          const b = positions[e.to];
          if (!a || !b) return null;
          const stroke = e.kind === "request" ? "stroke-amber-500" : "stroke-brand";
          const marker = e.kind === "request" ? "url(#arr-req)" : "url(#arr-asg)";
          return (
            <line
              key={i}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              className={stroke}
              strokeWidth={2}
              markerEnd={marker}
            />
          );
        })}
        {Object.entries(positions).map(([id, p]) => (
          <g key={id}>
            {p.type === "P" ? (
              <circle cx={p.x} cy={p.y} r={22} className="fill-card stroke-foreground/60" strokeWidth={1.5} />
            ) : (
              <rect x={p.x - 22} y={p.y - 22} width={44} height={44} className="fill-card stroke-foreground/60" strokeWidth={1.5} />
            )}
            <text x={p.x} y={p.y + 4} textAnchor="middle" className="fill-foreground text-sm font-mono font-semibold">
              {id}
            </text>
          </g>
        ))}
      </svg>
      <div className="border-t border-border bg-muted/30 px-4 py-3 text-xs text-muted-foreground space-y-1">
        <div>{data.story}</div>
        <div className="flex gap-3 pt-1">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-4 bg-amber-500" /> Request
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-4 bg-brand" /> Assignment
          </span>
        </div>
      </div>
    </div>
  );
}

// ---- Bankers algorithm ----
type Process = {
  id: string;
  allocation: number[]; // per resource
  max: number[];
};

const BANKERS_INIT: { processes: Process[]; available: number[] } = {
  processes: [
    { id: "P0", allocation: [0, 1, 0], max: [7, 5, 3] },
    { id: "P1", allocation: [2, 0, 0], max: [3, 2, 2] },
    { id: "P2", allocation: [3, 0, 2], max: [9, 0, 2] },
    { id: "P3", allocation: [2, 1, 1], max: [2, 2, 2] },
    { id: "P4", allocation: [0, 0, 2], max: [4, 3, 3] },
  ],
  available: [3, 3, 2],
};

function safetyCheck(
  processes: Process[],
  available: number[],
): { safe: boolean; order: string[] } {
  const n = processes.length;
  const m = available.length;
  const need = processes.map((p) => p.max.map((mx, j) => mx - p.allocation[j]));
  const work = [...available];
  const finish = new Array(n).fill(false);
  const order: string[] = [];
  let progressed = true;
  while (progressed) {
    progressed = false;
    for (let i = 0; i < n; i++) {
      if (finish[i]) continue;
      let canRun = true;
      for (let j = 0; j < m; j++) {
        if (need[i][j] > work[j]) {
          canRun = false;
          break;
        }
      }
      if (canRun) {
        for (let j = 0; j < m; j++) work[j] += processes[i].allocation[j];
        finish[i] = true;
        order.push(processes[i].id);
        progressed = true;
      }
    }
  }
  return { safe: finish.every(Boolean), order };
}

function BankersAlgorithm() {
  const [processes, setProcesses] = useState(BANKERS_INIT.processes);
  const [available, setAvailable] = useState(BANKERS_INIT.available);

  const result = useMemo(() => safetyCheck(processes, available), [processes, available]);

  function setAlloc(i: number, j: number, val: number) {
    setProcesses((ps) =>
      ps.map((p, pi) =>
        pi === i ? { ...p, allocation: p.allocation.map((a, ai) => (ai === j ? Math.max(0, val) : a)) } : p,
      ),
    );
  }
  function setMax(i: number, j: number, val: number) {
    setProcesses((ps) =>
      ps.map((p, pi) =>
        pi === i ? { ...p, max: p.max.map((mx, mi) => (mi === j ? Math.max(0, val) : mx)) } : p,
      ),
    );
  }
  function setAvail(j: number, val: number) {
    setAvailable((a) => a.map((x, xi) => (xi === j ? Math.max(0, val) : x)));
  }
  function reset() {
    setProcesses(BANKERS_INIT.processes);
    setAvailable(BANKERS_INIT.available);
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div
        className={`-mt-4 -mx-4 px-4 py-2 text-sm font-medium flex items-center gap-2 ${
          result.safe
            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
            : "bg-rose-500/10 text-rose-700 dark:text-rose-300"
        }`}
      >
        {result.safe ? <Check className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
        {result.safe
          ? `Trygg tilstand — sikker rekkefølge: ${result.order.join(" → ")}`
          : `Usikker tilstand — ${processes.length - result.order.length} prosesser blokkert`}
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-muted-foreground">
              <th className="px-2 py-1.5 text-left font-medium">Prosess</th>
              <th className="px-2 py-1.5 text-center font-medium" colSpan={3}>
                Allocation (A, B, C)
              </th>
              <th className="px-2 py-1.5 text-center font-medium" colSpan={3}>
                Max (A, B, C)
              </th>
              <th className="px-2 py-1.5 text-center font-medium" colSpan={3}>
                Need
              </th>
            </tr>
          </thead>
          <tbody>
            {processes.map((p, i) => {
              const need = p.max.map((mx, j) => mx - p.allocation[j]);
              return (
                <tr key={p.id} className="border-t border-border">
                  <td className="px-2 py-1.5 font-mono">{p.id}</td>
                  {p.allocation.map((a, j) => (
                    <td key={`a${j}`} className="px-1 py-1">
                      <NumInput val={a} onChange={(v) => setAlloc(i, j, v)} />
                    </td>
                  ))}
                  {p.max.map((mx, j) => (
                    <td key={`m${j}`} className="px-1 py-1">
                      <NumInput val={mx} onChange={(v) => setMax(i, j, v)} />
                    </td>
                  ))}
                  {need.map((n, j) => (
                    <td
                      key={`n${j}`}
                      className={`px-2 py-1.5 text-center tabular-nums ${
                        n < 0 ? "text-rose-500" : "text-muted-foreground"
                      }`}
                    >
                      {n}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-end gap-3">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
            Available
          </div>
          <div className="flex gap-1">
            {available.map((v, j) => (
              <NumInput key={j} val={v} onChange={(x) => setAvail(j, x)} />
            ))}
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={reset} className="gap-1.5 ml-auto">
          <RotateCcw className="h-3.5 w-3.5" /> Nullstill eksempel
        </Button>
      </div>
    </div>
  );
}

function NumInput({ val, onChange }: { val: number; onChange: (v: number) => void }) {
  return (
    <input
      type="number"
      value={val}
      onChange={(e) => onChange(parseInt(e.target.value) || 0)}
      className="w-12 h-7 rounded border border-border bg-background text-center text-xs tabular-nums"
    />
  );
}

function Lessons() {
  return (
    <section className="mt-8 space-y-3 text-sm">
      <h2 className="text-lg font-semibold">Strategier</h2>
      <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
        <li>
          <strong className="text-foreground">Forhindring:</strong> bryt én
          av de fire betingelsene strukturelt. Total-allokering før start
          (bryter hold-and-wait); ressurs-orden (bryter sirkel).
        </li>
        <li>
          <strong className="text-foreground">Unngåelse (Bankers):</strong>{" "}
          før hver tildeling, sjekk om systemet forblir i trygg tilstand.
          Trygg = det finnes en sikker rekkefølge der alle kan kjøre.
        </li>
        <li>
          <strong className="text-foreground">Deteksjon + recovery:</strong>{" "}
          la deadlock skje, finn syklus i RAG, drep en prosess for å bryte
          den.
        </li>
        <li>
          <strong className="text-foreground">Ignorering (ostrich):</strong>{" "}
          de fleste OS-er gjør dette i praksis. Restart løser det, og
          deadlock er sjeldent nok.
        </li>
      </ul>
    </section>
  );
}
