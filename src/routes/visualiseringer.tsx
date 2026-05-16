import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Sparkles, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import {
  VISUALIZERS,
  VIZ_CATEGORIES,
  searchVisualizers,
  type VizCategory,
  type VizEntry,
} from "@/lib/visualizers/registry";

export const Route = createFileRoute("/visualiseringer")({
  head: () => ({
    meta: [
      { title: "Visualiseringer — interaktivt galleri" },
      {
        name: "description",
        content:
          "Søkbart galleri over alle interaktive visualiseringer i appen — fra transistor til Flask, fra sortering til CNN.",
      },
    ],
  }),
  component: VisualiseringerPage,
});

const CATEGORY_COLORS: Record<VizCategory, string> = {
  "hardware-stakk": "border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  os: "border-slate-500/40 bg-slate-500/10 text-slate-700 dark:text-slate-300",
  nettverk: "border-indigo-500/40 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
  database: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  algoritmer: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  ml: "border-violet-500/40 bg-violet-500/10 text-violet-700 dark:text-violet-300",
  statistikk: "border-pink-500/40 bg-pink-500/10 text-pink-700 dark:text-pink-300",
  sikkerhet: "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300",
  python: "border-yellow-500/40 bg-yellow-500/10 text-yellow-700 dark:text-yellow-300",
  matematikk: "border-teal-500/40 bg-teal-500/10 text-teal-700 dark:text-teal-300",
};

const CATEGORY_LABEL: Record<VizCategory, string> = Object.fromEntries(
  VIZ_CATEGORIES.map((c) => [c.id, c.label]),
) as Record<VizCategory, string>;

function VisualiseringerPage() {
  const [query, setQuery] = useState("");
  const [activeCats, setActiveCats] = useState<Set<VizCategory>>(new Set());

  const filtered = useMemo<VizEntry[]>(() => {
    const bySearch = searchVisualizers(query);
    if (activeCats.size === 0) return bySearch;
    return bySearch.filter((v) => activeCats.has(v.category));
  }, [query, activeCats]);

  const toggleCat = (cat: VizCategory) => {
    setActiveCats((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const clearFilters = () => {
    setQuery("");
    setActiveCats(new Set());
  };

  const totalCount = VISUALIZERS.length;
  const showingCount = filtered.length;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-10 max-w-6xl">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            Interaktivt galleri
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Visualiseringer
          </h1>
          <p className="mt-3 text-muted-foreground max-w-2xl">
            {totalCount} interaktive komponenter spredt over kurs-sidene, samlet
            på ett sted. Søk på begrep eller fagkode, eller filtrér på kategori
            for å finne det du trenger akkurat nå.
          </p>
        </div>

        {/* Søk */}
        <div className="relative mb-4">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Søk på navn, tag eller fagkode (f.eks. 'bgp', 'gradient descent', 'dte2507')…"
            className="w-full rounded-lg border border-border bg-card pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
          />
        </div>

        {/* Kategori-filtre */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {VIZ_CATEGORIES.map((cat) => {
            const active = activeCats.has(cat.id);
            const colorCls = CATEGORY_COLORS[cat.id];
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggleCat(cat.id)}
                className={`text-xs px-3 py-1 rounded-full border transition ${
                  active
                    ? `${colorCls} font-semibold ring-1 ring-brand`
                    : "border-border bg-background text-muted-foreground hover:bg-muted/40"
                }`}
                aria-pressed={active}
              >
                {cat.label}
              </button>
            );
          })}
          {(query || activeCats.size > 0) && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs px-3 py-1 rounded-full border border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted/40"
            >
              Tøm
            </button>
          )}
        </div>

        <div className="text-xs text-muted-foreground mb-5 tabular-nums">
          Viser {showingCount} av {totalCount}
        </div>

        {/* Galleri */}
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            Ingen visualiseringer matcher søket. Prøv et bredere søk eller fjern
            kategori-filtre.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((viz) => (
              <VizCard key={viz.id} viz={viz} />
            ))}
          </div>
        )}

        <div className="mt-12 rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
          <p>
            Mangler det noe? Hver visualizer lever fortsatt i sin
            opprinnelige kontekst — denne siden er et indeks. Hvis du lager en
            ny interaktiv komponent, legg en post i{" "}
            <code className="text-foreground">
              src/lib/visualizers/registry.ts
            </code>{" "}
            så dukker den opp her.
          </p>
        </div>
      </main>
    </div>
  );
}

function VizCard({ viz }: { viz: VizEntry }) {
  const colorCls = CATEGORY_COLORS[viz.category];
  return (
    <Link
      to={viz.route}
      className="group block rounded-xl border border-border bg-card p-4 hover:border-brand/50 hover:shadow-sm transition"
    >
      <div className="flex items-baseline justify-between gap-2 mb-1.5">
        <span
          className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${colorCls}`}
        >
          {CATEGORY_LABEL[viz.category]}
        </span>
        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-brand group-hover:translate-x-0.5 transition" />
      </div>
      <h3 className="text-sm font-semibold leading-snug mb-1.5">{viz.title}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
        {viz.blurb}
      </p>
    </Link>
  );
}
