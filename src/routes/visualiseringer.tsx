import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import {
  buildPageHref,
  DOMAINS,
  VISUALIZERS,
  type VisualizerDomain,
  type VisualizerEntry,
  type VisualizerIcon,
} from "@/lib/visualizers/registry";
import {
  BTreeIcon,
  BarChart,
  Cloud,
  CpuChip,
  DatabaseCylinder,
  Disk,
  GraphNode,
  Heap,
  HostIcon,
  Indexes,
  Key,
  Lock,
  LossCurve,
  Neuron,
  Packet,
  Process,
  RamStick,
  RouterIcon,
  ScatterPlot,
  Shield,
  Stack as StackIcon,
  SwitchIcon,
  TableGrid,
  TreeNode,
  type IllustrationProps,
} from "@/components/illustrations";

export const Route = createFileRoute("/visualiseringer")({
  head: () => ({
    meta: [
      { title: "Visualiseringer — SQL Sandbox" },
      {
        name: "description",
        content:
          "Sokbart galleri over alle interaktive visualiseringer i kursene — DB, nettverk, OS, hardware, algoritmer, krypto og ML.",
      },
    ],
  }),
  component: VisualizersGallery,
});

const ICONS: Record<
  VisualizerIcon,
  (p: IllustrationProps) => React.ReactNode
> = {
  DatabaseCylinder,
  BTreeIcon,
  TableGrid,
  Indexes,
  RouterIcon,
  SwitchIcon,
  Packet,
  Cloud,
  HostIcon,
  CpuChip,
  RamStick,
  Disk,
  Process,
  Stack: StackIcon,
  TreeNode,
  GraphNode,
  BarChart,
  Heap,
  Neuron,
  LossCurve,
  ScatterPlot,
  Lock,
  Key,
  Shield,
};

const DOMAIN_COLOR: Record<VisualizerDomain, string> = {
  DB: "bg-sky-500/10 text-sky-500 border-sky-500/30",
  Nettverk: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
  OS: "bg-amber-500/10 text-amber-500 border-amber-500/30",
  Hardware: "bg-rose-500/10 text-rose-500 border-rose-500/30",
  Algoritmer: "bg-violet-500/10 text-violet-500 border-violet-500/30",
  Krypto: "bg-fuchsia-500/10 text-fuchsia-500 border-fuchsia-500/30",
  "ML/Stats": "bg-indigo-500/10 text-indigo-500 border-indigo-500/30",
};

function matchesQuery(v: VisualizerEntry, q: string): boolean {
  if (!q) return true;
  const hay = `${v.title} ${v.description} ${v.page} ${v.domain}`.toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((tok) => hay.includes(tok));
}

function VisualizersGallery() {
  const [query, setQuery] = useState("");
  const [activeDomains, setActiveDomains] = useState<Set<VisualizerDomain>>(
    new Set(),
  );

  const filtered = useMemo(() => {
    return VISUALIZERS.filter((v) => {
      if (activeDomains.size > 0 && !activeDomains.has(v.domain)) return false;
      return matchesQuery(v, query);
    });
  }, [query, activeDomains]);

  function toggleDomain(d: VisualizerDomain) {
    setActiveDomains((prev) => {
      const next = new Set(prev);
      if (next.has(d)) next.delete(d);
      else next.add(d);
      return next;
    });
  }

  const total = VISUALIZERS.length;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <header className="mb-8">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            <Sparkles className="size-4" aria-hidden />
            Galleri
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Visualiseringer
          </h1>
          <p className="mt-3 text-muted-foreground max-w-2xl">
            Alle {total} interaktive visualiseringer pa tvers av kursene — fra
            transistor til nevralt nett. Søk, filtrer pa domene, og hopp rett
            inn der ideen kommer til live.
          </p>
        </header>

        <div className="mb-6 space-y-4">
          <label className="relative block">
            <span className="sr-only">Søk i visualiseringer</span>
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Søk: tcp, B-tree, neuron, sortering …"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
            />
          </label>

          <div className="flex flex-wrap gap-2">
            {DOMAINS.map((d) => {
              const active = activeDomains.has(d);
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleDomain(d)}
                  className={
                    "text-xs font-medium px-3 py-1.5 rounded-full border transition-colors " +
                    (active
                      ? DOMAIN_COLOR[d]
                      : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-foreground/40")
                  }
                  aria-pressed={active}
                >
                  {d}
                </button>
              );
            })}
            {activeDomains.size > 0 && (
              <button
                type="button"
                onClick={() => setActiveDomains(new Set())}
                className="text-xs text-muted-foreground underline hover:text-foreground px-1"
              >
                nullstill
              </button>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            {filtered.length} av {total}{" "}
            {filtered.length === 1 ? "visualisering" : "visualiseringer"}
          </p>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            Ingen treff — prøv andre ord eller fjern filtre.
          </div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((v) => (
              <li key={v.slug}>
                <Card entry={v} />
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

function Card({ entry }: { entry: VisualizerEntry }) {
  const Icon = ICONS[entry.icon];
  return (
    <a
      href={buildPageHref(entry)}
      className="group h-full flex flex-col rounded-2xl border border-border bg-card hover:border-brand/60 hover:bg-card/80 transition-colors p-5"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="text-brand">
          <Icon size={40} title={entry.title} />
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span
            className={
              "text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full border " +
              DOMAIN_COLOR[entry.domain]
            }
          >
            {entry.domain}
          </span>
          <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full border border-brand/40 text-brand bg-brand/5">
            Interaktiv
          </span>
        </div>
      </div>
      <h2 className="font-semibold leading-tight group-hover:text-brand transition-colors">
        {entry.title}
      </h2>
      <p className="text-sm text-muted-foreground mt-2 flex-1">
        {entry.description}
      </p>
      <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          Pa side <span className="font-mono">{entry.page}</span>
          {entry.anchor && (
            <span className="font-mono text-muted-foreground/70">
              #{entry.anchor}
            </span>
          )}
        </span>
        <span className="text-brand opacity-0 group-hover:opacity-100 transition-opacity">
          Apne →
        </span>
      </div>
    </a>
  );
}
