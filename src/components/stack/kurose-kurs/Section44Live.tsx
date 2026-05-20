import { useMemo, useState } from "react";
import { Plus, Trash2, Play, ArrowRight, Cog } from "lucide-react";

// Section44Live — OpenFlow flow-tabell-simulator.
//
// Pedagogisk poeng (Kurose 4.4):
//   - Generalisert forwarding = match-action på pakke-headere.
//   - Brukeren bygger en flow-tabell og sender et knippe testpakker gjennom den.
//   - Pakker matches mot regler i prioritets-rekkefølge (høyest først).
//   - Den første regelen som matcher avgjør action.
//
// Brukerflyt:
//   1) Se en forhåndsdefinert tabell (med en standard "drop"-default på bunnen).
//   2) Legg til/fjern rader, endre match-kriterier og action.
//   3) Klikk "Send testpakker" — animer hver pakke som faller gjennom tabellen.

type MatchField = {
  inPort?: string; // f.eks. "p1" eller "*"
  srcIp?: string; // CIDR-ish eller eksakt
  dstIp?: string;
  srcPort?: string;
  dstPort?: string;
  proto?: string; // "TCP" | "UDP" | "ICMP" | "*"
};

type Action =
  | { kind: "forward"; port: string }
  | { kind: "drop" }
  | { kind: "controller" }
  | { kind: "modify"; field: string; value: string }
  | { kind: "flood" };

type FlowRule = {
  id: string;
  priority: number;
  match: MatchField;
  action: Action;
  packetsHit: number;
};

type TestPacket = {
  id: string;
  inPort: string;
  srcIp: string;
  dstIp: string;
  proto: string;
  srcPort?: string;
  dstPort?: string;
  label: string;
};

// ---- Match-engine ----
function matchField(value: string | undefined, pattern: string | undefined): boolean {
  if (!pattern || pattern === "*" || pattern === "") return true;
  if (!value) return false;
  // CIDR-aktig prefix-match for IP (10.0.0.0/8 matcher 10.x.x.x)
  if (pattern.includes("/")) {
    const [net, lenStr] = pattern.split("/");
    const len = parseInt(lenStr, 10);
    const ipToBits = (ip: string) =>
      ip
        .split(".")
        .map((n) => parseInt(n, 10).toString(2).padStart(8, "0"))
        .join("")
        .slice(0, 32);
    try {
      const a = ipToBits(value).slice(0, len);
      const b = ipToBits(net).slice(0, len);
      return a === b;
    } catch {
      return false;
    }
  }
  return value === pattern;
}

function matchesRule(pkt: TestPacket, rule: FlowRule): boolean {
  return (
    matchField(pkt.inPort, rule.match.inPort) &&
    matchField(pkt.srcIp, rule.match.srcIp) &&
    matchField(pkt.dstIp, rule.match.dstIp) &&
    matchField(pkt.proto, rule.match.proto) &&
    matchField(pkt.srcPort, rule.match.srcPort) &&
    matchField(pkt.dstPort, rule.match.dstPort)
  );
}

function describeAction(a: Action): string {
  switch (a.kind) {
    case "forward":
      return `forward(${a.port})`;
    case "drop":
      return "drop";
    case "controller":
      return "send-to-controller";
    case "modify":
      return `modify(${a.field}=${a.value})`;
    case "flood":
      return "flood";
  }
}

function actionColor(a: Action): string {
  switch (a.kind) {
    case "forward":
      return "text-emerald-700 dark:text-emerald-300";
    case "drop":
      return "text-red-700 dark:text-red-300";
    case "controller":
      return "text-purple-700 dark:text-purple-300";
    case "modify":
      return "text-amber-700 dark:text-amber-300";
    case "flood":
      return "text-blue-700 dark:text-blue-300";
  }
}

// ---- Default-tabell og testpakker ----
const INIT_RULES: FlowRule[] = [
  {
    id: "r1",
    priority: 100,
    match: { dstIp: "10.0.0.0/24", proto: "TCP", dstPort: "80" },
    action: { kind: "forward", port: "p3" },
    packetsHit: 0,
  },
  {
    id: "r2",
    priority: 90,
    match: { srcIp: "10.0.0.0/24", proto: "TCP" },
    action: { kind: "modify", field: "srcIp", value: "200.1.1.1" },
    packetsHit: 0,
  },
  {
    id: "r3",
    priority: 50,
    match: { proto: "ICMP" },
    action: { kind: "controller" },
    packetsHit: 0,
  },
  {
    id: "r4",
    priority: 10,
    match: { srcIp: "192.168.0.0/16" },
    action: { kind: "drop" },
    packetsHit: 0,
  },
  {
    id: "r-default",
    priority: 0,
    match: {},
    action: { kind: "forward", port: "p4" },
    packetsHit: 0,
  },
];

const INIT_PACKETS: TestPacket[] = [
  {
    id: "pkt-1",
    label: "HTTP til intern web-server",
    inPort: "p1",
    srcIp: "203.0.113.5",
    dstIp: "10.0.0.42",
    proto: "TCP",
    dstPort: "80",
  },
  {
    id: "pkt-2",
    label: "TCP fra intern host (skal NAT-es)",
    inPort: "p2",
    srcIp: "10.0.0.7",
    dstIp: "172.217.16.100",
    proto: "TCP",
    srcPort: "54321",
    dstPort: "443",
  },
  {
    id: "pkt-3",
    label: "ICMP ping (skal til controller)",
    inPort: "p1",
    srcIp: "203.0.113.5",
    dstIp: "10.0.0.1",
    proto: "ICMP",
  },
  {
    id: "pkt-4",
    label: "Pakke fra blokkert privat nett",
    inPort: "p1",
    srcIp: "192.168.50.10",
    dstIp: "8.8.8.8",
    proto: "TCP",
    dstPort: "443",
  },
  {
    id: "pkt-5",
    label: "Ukjent UDP (default-rule)",
    inPort: "p2",
    srcIp: "100.64.0.5",
    dstIp: "8.8.8.8",
    proto: "UDP",
    dstPort: "53",
  },
];

type MatchTrace = {
  pkt: TestPacket;
  matched: { rule: FlowRule | null; via: FlowRule[] }; // via = regler vi forsøkte før match
};

function runPackets(rules: FlowRule[], pkts: TestPacket[]): MatchTrace[] {
  const sorted = [...rules].sort((a, b) => b.priority - a.priority);
  return pkts.map((pkt) => {
    const via: FlowRule[] = [];
    for (const r of sorted) {
      if (matchesRule(pkt, r)) {
        return { pkt, matched: { rule: r, via } };
      }
      via.push(r);
    }
    return { pkt, matched: { rule: null, via } };
  });
}

// ============================================================
// Hovedkomponent
// ============================================================
export function Section44Live() {
  const [rules, setRules] = useState<FlowRule[]>(INIT_RULES);
  const [traces, setTraces] = useState<MatchTrace[] | null>(null);
  const [animPktIdx, setAnimPktIdx] = useState(0); // hvilken pakke "vandrer" akkurat nå
  const [animStep, setAnimStep] = useState<number>(-1); // hvilken regel-rad er pakken på

  const sortedRules = useMemo(
    () => [...rules].sort((a, b) => b.priority - a.priority),
    [rules],
  );

  const updateRule = (id: string, patch: Partial<FlowRule>) => {
    setRules((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };
  const updateMatch = (id: string, patch: Partial<MatchField>) => {
    setRules((rs) =>
      rs.map((r) => (r.id === id ? { ...r, match: { ...r.match, ...patch } } : r)),
    );
  };
  const deleteRule = (id: string) => {
    setRules((rs) => rs.filter((r) => r.id !== id));
  };
  const addRule = () => {
    const newRule: FlowRule = {
      id: `r-${Date.now()}`,
      priority: 60,
      match: { inPort: "*" },
      action: { kind: "drop" },
      packetsHit: 0,
    };
    // Sett inn rett over default-rule
    setRules((rs) => {
      const defIdx = rs.findIndex((r) => r.priority === 0);
      const out = [...rs];
      out.splice(defIdx >= 0 ? defIdx : rs.length, 0, newRule);
      return out;
    });
  };

  const runAll = () => {
    const result = runPackets(rules, INIT_PACKETS);
    // oppdater hit-counts
    const counts: Record<string, number> = {};
    for (const t of result) {
      if (t.matched.rule) counts[t.matched.rule.id] = (counts[t.matched.rule.id] ?? 0) + 1;
    }
    setRules((rs) => rs.map((r) => ({ ...r, packetsHit: counts[r.id] ?? 0 })));
    setTraces(result);
    setAnimPktIdx(0);
    setAnimStep(-1);
    // Start enkel timer-anim som teller seg gjennom regler
    let pkt = 0;
    let step = 0;
    const tick = () => {
      const t = result[pkt];
      if (!t) return;
      const total = t.matched.via.length + (t.matched.rule ? 1 : 0);
      setAnimPktIdx(pkt);
      setAnimStep(step);
      step++;
      if (step > total) {
        pkt++;
        step = 0;
      }
      if (pkt < result.length) {
        setTimeout(tick, 500);
      } else {
        setAnimStep(-1);
      }
    };
    setTimeout(tick, 200);
  };

  const resetHits = () => {
    setRules((rs) => rs.map((r) => ({ ...r, packetsHit: 0 })));
    setTraces(null);
    setAnimStep(-1);
  };

  // Hvilken regel-id høygnes for animasjon?
  const currentlyChecking = useMemo(() => {
    if (!traces || animStep < 0 || animPktIdx < 0) return null;
    const t = traces[animPktIdx];
    if (!t) return null;
    if (animStep < t.matched.via.length) return { ruleId: t.matched.via[animStep].id, kind: "miss" as const };
    if (t.matched.rule && animStep === t.matched.via.length)
      return { ruleId: t.matched.rule.id, kind: "hit" as const };
    return null;
  }, [traces, animStep, animPktIdx]);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="bg-muted/30 px-4 py-2 text-xs text-muted-foreground border-b border-border flex items-center gap-3">
        <Cog className="h-3.5 w-3.5 text-purple-500" />
        <span className="font-medium text-foreground">
          OpenFlow flow-tabell — match-action-simulator
        </span>
        <button
          onClick={runAll}
          className="ml-auto inline-flex items-center gap-1 rounded border border-brand/40 bg-brand/10 px-2 py-1 text-xs font-medium hover:bg-brand/20"
        >
          <Play className="h-3 w-3" /> Send testpakker
        </button>
        <button
          onClick={resetHits}
          className="rounded border border-border bg-background px-2 py-1 text-xs hover:border-brand/60"
        >
          Reset
        </button>
      </div>

      {/* Flow-tabell editor */}
      <div className="p-3">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border">
              <th className="text-left font-medium pb-1.5 pl-1">Pri.</th>
              <th className="text-left font-medium pb-1.5">In-port</th>
              <th className="text-left font-medium pb-1.5">Src IP</th>
              <th className="text-left font-medium pb-1.5">Dst IP</th>
              <th className="text-left font-medium pb-1.5">Proto</th>
              <th className="text-left font-medium pb-1.5">Dst-port</th>
              <th className="text-left font-medium pb-1.5">Action</th>
              <th className="text-left font-medium pb-1.5">Hits</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sortedRules.map((r) => {
              const isChecking = currentlyChecking?.ruleId === r.id;
              const isHit = isChecking && currentlyChecking?.kind === "hit";
              const isMiss = isChecking && currentlyChecking?.kind === "miss";
              const isDefault = r.priority === 0;
              return (
                <tr
                  key={r.id}
                  className={`border-b border-border/60 ${
                    isHit
                      ? "bg-emerald-500/20"
                      : isMiss
                        ? "bg-red-500/10"
                        : ""
                  } ${isDefault ? "bg-muted/30" : ""}`}
                >
                  <td className="py-1 pl-1">
                    <input
                      type="number"
                      value={r.priority}
                      onChange={(e) => updateRule(r.id, { priority: Number(e.target.value) })}
                      disabled={isDefault}
                      className="w-12 rounded border border-border bg-background px-1 py-0.5 font-mono"
                    />
                  </td>
                  <td className="py-1">
                    <input
                      value={r.match.inPort ?? "*"}
                      onChange={(e) => updateMatch(r.id, { inPort: e.target.value })}
                      className="w-14 rounded border border-border bg-background px-1 py-0.5 font-mono text-[11px]"
                    />
                  </td>
                  <td className="py-1">
                    <input
                      value={r.match.srcIp ?? "*"}
                      onChange={(e) => updateMatch(r.id, { srcIp: e.target.value })}
                      placeholder="*"
                      className="w-28 rounded border border-border bg-background px-1 py-0.5 font-mono text-[11px]"
                    />
                  </td>
                  <td className="py-1">
                    <input
                      value={r.match.dstIp ?? "*"}
                      onChange={(e) => updateMatch(r.id, { dstIp: e.target.value })}
                      placeholder="*"
                      className="w-28 rounded border border-border bg-background px-1 py-0.5 font-mono text-[11px]"
                    />
                  </td>
                  <td className="py-1">
                    <select
                      value={r.match.proto ?? "*"}
                      onChange={(e) => updateMatch(r.id, { proto: e.target.value })}
                      className="rounded border border-border bg-background px-1 py-0.5 font-mono text-[11px]"
                    >
                      <option value="*">*</option>
                      <option value="TCP">TCP</option>
                      <option value="UDP">UDP</option>
                      <option value="ICMP">ICMP</option>
                    </select>
                  </td>
                  <td className="py-1">
                    <input
                      value={r.match.dstPort ?? "*"}
                      onChange={(e) => updateMatch(r.id, { dstPort: e.target.value })}
                      placeholder="*"
                      className="w-16 rounded border border-border bg-background px-1 py-0.5 font-mono text-[11px]"
                    />
                  </td>
                  <td className="py-1">
                    <ActionEditor
                      action={r.action}
                      onChange={(action) => updateRule(r.id, { action })}
                    />
                  </td>
                  <td className="py-1 font-mono">
                    <span
                      className={
                        r.packetsHit > 0
                          ? "text-emerald-600 dark:text-emerald-400 font-bold"
                          : "text-muted-foreground"
                      }
                    >
                      {r.packetsHit}
                    </span>
                  </td>
                  <td className="py-1 text-right pr-1">
                    {!isDefault && (
                      <button
                        onClick={() => deleteRule(r.id)}
                        className="rounded p-0.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        title="Slett regel"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <button
          onClick={addRule}
          className="mt-2 inline-flex items-center gap-1 rounded border border-border bg-background px-2 py-1 text-xs hover:border-brand/60"
        >
          <Plus className="h-3 w-3" /> Legg til regel
        </button>
        <div className="mt-1 text-[10px] text-muted-foreground">
          Tips: IP-mønstre kan være CIDR (<code>10.0.0.0/24</code>) eller eksakt (<code>10.0.0.42</code>);{" "}
          <code>*</code> matcher alt.
        </div>
      </div>

      {/* Testpakker */}
      <div className="border-t border-border bg-muted/10 p-3">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
          Testpakker
        </div>
        <div className="grid gap-1.5 sm:grid-cols-2 text-xs">
          {INIT_PACKETS.map((p, i) => {
            const tr = traces?.[i];
            const isCurrent = animPktIdx === i && animStep >= 0;
            return (
              <div
                key={p.id}
                className={`rounded-lg border p-2 ${
                  isCurrent
                    ? "border-brand bg-brand/5"
                    : tr
                      ? tr.matched.rule
                        ? "border-emerald-500/30 bg-emerald-500/5"
                        : "border-amber-500/30 bg-amber-500/5"
                      : "border-border bg-card"
                }`}
              >
                <div className="font-semibold text-[11px]">{p.label}</div>
                <div className="font-mono text-[10px] text-muted-foreground mt-0.5">
                  {p.inPort} | {p.srcIp}
                  {p.srcPort && `:${p.srcPort}`} → {p.dstIp}
                  {p.dstPort && `:${p.dstPort}`} | {p.proto}
                </div>
                {tr && (
                  <div className="mt-1 text-[10px] flex items-center gap-1">
                    <ArrowRight className="h-3 w-3" />
                    {tr.matched.rule ? (
                      <span className={actionColor(tr.matched.rule.action)}>
                        Match: regel pri={tr.matched.rule.priority} →{" "}
                        <strong>{describeAction(tr.matched.rule.action)}</strong>
                      </span>
                    ) : (
                      <span className="text-amber-700 dark:text-amber-300">
                        Ingen match — vanligvis sendes til kontroller
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="px-4 py-2 border-t border-border text-[10px] text-muted-foreground">
        <strong>Slik fungerer det:</strong> regler sorteres etter prioritet (høyest først). For
        hver pakke prøves regler én etter én — den første som matcher alle ikke-stjerne-felt
        vinner, og dens action utføres. Default-rad-en på bunnen (priority 0, alle stjerner)
        sikrer at ingen pakke faller helt gjennom uten å bli håndtert.
      </div>
    </div>
  );
}

function ActionEditor({
  action,
  onChange,
}: {
  action: Action;
  onChange: (a: Action) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <select
        value={action.kind}
        onChange={(e) => {
          const k = e.target.value as Action["kind"];
          if (k === "forward") onChange({ kind: "forward", port: "p4" });
          else if (k === "drop") onChange({ kind: "drop" });
          else if (k === "controller") onChange({ kind: "controller" });
          else if (k === "modify") onChange({ kind: "modify", field: "srcIp", value: "200.1.1.1" });
          else if (k === "flood") onChange({ kind: "flood" });
        }}
        className="rounded border border-border bg-background px-1 py-0.5 font-mono text-[11px]"
      >
        <option value="forward">forward</option>
        <option value="drop">drop</option>
        <option value="controller">controller</option>
        <option value="modify">modify</option>
        <option value="flood">flood</option>
      </select>
      {action.kind === "forward" && (
        <input
          value={action.port}
          onChange={(e) => onChange({ ...action, port: e.target.value })}
          className="w-12 rounded border border-border bg-background px-1 py-0.5 font-mono text-[11px]"
        />
      )}
      {action.kind === "modify" && (
        <>
          <input
            value={action.field}
            onChange={(e) => onChange({ ...action, field: e.target.value })}
            className="w-14 rounded border border-border bg-background px-1 py-0.5 font-mono text-[11px]"
            placeholder="felt"
          />
          <span className="text-muted-foreground">=</span>
          <input
            value={action.value}
            onChange={(e) => onChange({ ...action, value: e.target.value })}
            className="w-20 rounded border border-border bg-background px-1 py-0.5 font-mono text-[11px]"
            placeholder="verdi"
          />
        </>
      )}
    </div>
  );
}
