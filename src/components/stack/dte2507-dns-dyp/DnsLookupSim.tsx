import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Play, RotateCcw, Zap } from "lucide-react";
import { Mermaid } from "@/components/Mermaid";

type Mode = "iterative" | "recursive";

type LookupStep = {
  from: string;
  to: string;
  msg: string;
  cached?: boolean;
};

type DomainInfo = {
  tld: string;
  authoritative: string;
  aRecord: string;
  ttl: number;
};

const KNOWN: Record<string, DomainInfo> = {
  "www.uit.no": {
    tld: ".no",
    authoritative: "ns.uit.no",
    aRecord: "129.242.20.1",
    ttl: 3600,
  },
  "www.google.com": {
    tld: ".com",
    authoritative: "ns1.google.com",
    aRecord: "142.250.74.4",
    ttl: 300,
  },
  "www.kahoot.no": {
    tld: ".no",
    authoritative: "ns.kahoot.no",
    aRecord: "104.18.32.5",
    ttl: 600,
  },
  "mail.example.org": {
    tld: ".org",
    authoritative: "ns.example.org",
    aRecord: "93.184.216.34",
    ttl: 1800,
  },
};

function buildSteps(domain: string, mode: Mode, cache: Set<string>): LookupStep[] {
  const info = KNOWN[domain];
  if (!info) return [];

  const steps: LookupStep[] = [];
  const cacheKey = `A:${domain}`;

  // Steg 1: klient → resolver (alltid)
  steps.push({
    from: "Klient",
    to: "Resolver",
    msg: `Query: A ${domain}?`,
  });

  // Cache-hit på resolver?
  if (cache.has(cacheKey)) {
    steps.push({
      from: "Resolver",
      to: "Klient",
      msg: `Cache-hit: A=${info.aRecord} (TTL gjenstår)`,
      cached: true,
    });
    return steps;
  }

  if (mode === "recursive") {
    // Resolver gjør hele jobben rekursivt, klienten venter
    steps.push({
      from: "Resolver",
      to: "Root NS (.)",
      msg: `Query: A ${domain}? (recursion desired)`,
    });
    steps.push({
      from: "Root NS (.)",
      to: "Resolver",
      msg: `Referral: prov ${info.tld}-servere`,
    });
    steps.push({
      from: "Resolver",
      to: `TLD NS (${info.tld})`,
      msg: `Query: A ${domain}?`,
    });
    steps.push({
      from: `TLD NS (${info.tld})`,
      to: "Resolver",
      msg: `Referral: prov ${info.authoritative}`,
    });
    steps.push({
      from: "Resolver",
      to: info.authoritative,
      msg: `Query: A ${domain}?`,
    });
    steps.push({
      from: info.authoritative,
      to: "Resolver",
      msg: `Authoritative answer: A=${info.aRecord} TTL=${info.ttl}`,
    });
    steps.push({
      from: "Resolver",
      to: "Klient",
      msg: `Svar: A=${info.aRecord}`,
    });
  } else {
    // Iterative: klient/resolver må selv tråle hierarkiet (men i praksis er det resolveren som itererer)
    steps.push({
      from: "Resolver",
      to: "Root NS (.)",
      msg: `Query: A ${domain}?`,
    });
    steps.push({
      from: "Root NS (.)",
      to: "Resolver",
      msg: `Referral: ${info.tld}-NS er ved …`,
    });
    steps.push({
      from: "Resolver",
      to: `TLD NS (${info.tld})`,
      msg: `Query: A ${domain}?`,
    });
    steps.push({
      from: `TLD NS (${info.tld})`,
      to: "Resolver",
      msg: `Referral: ${info.authoritative}`,
    });
    steps.push({
      from: "Resolver",
      to: info.authoritative,
      msg: `Query: A ${domain}?`,
    });
    steps.push({
      from: info.authoritative,
      to: "Resolver",
      msg: `Authoritative: A=${info.aRecord} TTL=${info.ttl}`,
    });
    steps.push({
      from: "Resolver",
      to: "Klient",
      msg: `Svar: A=${info.aRecord}`,
    });
  }

  return steps;
}

function buildMermaid(steps: LookupStep[]): string {
  const lines = [
    "sequenceDiagram",
    "  autonumber",
    "  participant K as Klient",
    "  participant R as Resolver",
    "  participant Root as Root NS",
    "  participant T as TLD NS",
    "  participant A as Auth NS",
  ];
  const aliasOf = (name: string) => {
    if (name === "Klient") return "K";
    if (name === "Resolver") return "R";
    if (name.startsWith("Root")) return "Root";
    if (name.startsWith("TLD")) return "T";
    return "A";
  };
  for (const s of steps) {
    const arrow = s.cached ? "-->>" : "->>";
    const note = s.cached ? " [CACHE]" : "";
    lines.push(`  ${aliasOf(s.from)}${arrow}${aliasOf(s.to)}: ${s.msg.replace(/:/g, "—")}${note}`);
  }
  return lines.join("\n");
}

export function DnsLookupSim() {
  const [domain, setDomain] = useState<string>("www.uit.no");
  const [mode, setMode] = useState<Mode>("recursive");
  const [cache, setCache] = useState<Set<string>>(new Set());
  const [hits, setHits] = useState<{ hit: number; miss: number; rtt: number }[]>([]);

  const steps = useMemo(() => buildSteps(domain, mode, cache), [domain, mode, cache]);
  const mermaid = useMemo(() => buildMermaid(steps), [steps]);

  function runLookup() {
    const cacheKey = `A:${domain}`;
    const wasCached = cache.has(cacheKey);
    // Estimer RTT: cache-hit = 5 ms, miss = ~120 ms (3 hops à ~40 ms)
    const rtt = wasCached ? 5 : 120;
    setHits((p) => [...p, { hit: wasCached ? 1 : 0, miss: wasCached ? 0 : 1, rtt }].slice(-15));
    if (!wasCached) {
      setCache(new Set([...cache, cacheKey]));
    }
  }

  function clearCache() {
    setCache(new Set());
    setHits([]);
  }

  const totalRequests = hits.length;
  const totalHits = hits.reduce((s, h) => s + h.hit, 0);
  const hitRate = totalRequests > 0 ? Math.round((totalHits / totalRequests) * 100) : 0;
  const avgRtt = totalRequests > 0 ? Math.round(hits.reduce((s, h) => s + h.rtt, 0) / totalRequests) : 0;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="border-b border-border bg-muted/30 px-4 py-2 flex items-center justify-between gap-2 flex-wrap">
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          DNS-lookup stegvis
        </div>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => setMode("recursive")}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              mode === "recursive"
                ? "bg-brand text-brand-foreground"
                : "border border-border bg-card hover:border-brand/40"
            }`}
          >
            Recursive
          </button>
          <button
            type="button"
            onClick={() => setMode("iterative")}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              mode === "iterative"
                ? "bg-brand text-brand-foreground"
                : "border border-border bg-card hover:border-brand/40"
            }`}
          >
            Iterative
          </button>
        </div>
      </div>

      <div className="p-4 border-b border-border">
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            Domene:
          </label>
          <select
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="rounded-md border border-border bg-card px-2 py-1 text-sm font-mono"
          >
            {Object.keys(KNOWN).map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={runLookup}
            className="inline-flex items-center gap-1.5 rounded-md bg-brand text-brand-foreground text-xs font-medium px-3 py-1.5"
          >
            <Play className="h-3.5 w-3.5" /> Kjør lookup
          </button>
          <button
            type="button"
            onClick={clearCache}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card hover:border-brand/40 text-xs font-medium px-3 py-1.5"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Tøm cache
          </button>
          <div className="ml-auto text-xs text-muted-foreground flex items-center gap-3">
            <span>
              Cache: <span className="font-mono text-foreground">{cache.size}</span>
            </span>
            <span>
              Hit rate: <span className="font-mono text-foreground">{hitRate}%</span>
            </span>
            <span className="hidden sm:inline">
              Snitt-RTT: <span className="font-mono text-foreground">{avgRtt} ms</span>
            </span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-[1fr_320px]">
        <div className="p-4 bg-background">
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
            Sekvens
          </div>
          <div className="rounded-md border border-border bg-card overflow-x-auto">
            <Mermaid chart={mermaid} />
          </div>
        </div>

        <aside className="border-t md:border-t-0 md:border-l border-border bg-background p-4 text-sm flex flex-col gap-3">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">
              Steg ({steps.length} meldinger)
            </div>
            <ol className="space-y-1 text-[11px] max-h-[260px] overflow-y-auto pr-1">
              {steps.map((s, i) => (
                <li
                  key={i}
                  className={`rounded border px-2 py-1 leading-snug ${
                    s.cached
                      ? "border-emerald-500/30 bg-emerald-500/5"
                      : "border-border bg-muted/20"
                  }`}
                >
                  <div className="font-mono text-muted-foreground">
                    {i + 1}. {s.from} → {s.to}
                  </div>
                  <div className="text-foreground">{s.msg}</div>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">
              RTT per kjøring
            </div>
            <div className="h-[120px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hits.map((h, i) => ({ idx: i + 1, rtt: h.rtt, hit: h.hit }))}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="idx" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 9 }} />
                  <Tooltip
                    contentStyle={{ fontSize: 11 }}
                    formatter={(v: number) => [`${v} ms`, "RTT"]}
                  />
                  <Bar
                    dataKey="rtt"
                    fill="#f97316"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              <Zap className="h-2.5 w-2.5 inline" /> Andre kjøring på samme domene før TTL
              utløper = cache-hit (5 ms i stedet for ~120 ms).
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
