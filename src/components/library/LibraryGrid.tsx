import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { LIBRARY, libraryByKind, libraryTags, type LibraryKind } from "@/lib/library";
import { tagLabel } from "@/lib/library/tags";
import { LibraryCard } from "./LibraryCard";

// Uten `kind` vises hele biblioteket med Lek/Lær/Test som filter-chips —
// aktivitetstype er da et filter, ikke et topp-nivå. Med `kind` (de gamle
// /lek-, /laer- og /test-sidene) er grid-en låst til én type som før.
const KIND_FILTER: { value: LibraryKind; label: string }[] = [
  { value: "laer", label: "Lær — kurs" },
  { value: "lek", label: "Lek — simulatorer" },
  { value: "test", label: "Test — oppgaver" },
];

export function LibraryGrid({ kind }: { kind?: LibraryKind }) {
  const [activeKind, setActiveKind] = useState<LibraryKind | null>(null);
  const effectiveKind = kind ?? activeKind;

  const allItems = useMemo(
    () => (effectiveKind ? libraryByKind(effectiveKind) : LIBRARY),
    [effectiveKind],
  );
  const allTags = useMemo(() => libraryTags(allItems), [allItems]);

  const [query, setQuery] = useState("");
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allItems.filter((it) => {
      if (activeTags.size > 0) {
        for (const t of activeTags) if (!it.tags.includes(t)) return false;
      }
      if (!q) return true;
      const hay = [it.title, it.blurb ?? "", ...it.tags.map(tagLabel)].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [allItems, query, activeTags]);

  function toggleTag(t: string) {
    setActiveTags((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  }

  function clear() {
    setActiveTags(new Set());
    setQuery("");
    if (!kind) setActiveKind(null);
  }

  const hasFilters =
    activeTags.size > 0 || query.trim().length > 0 || (!kind && activeKind != null);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filtrer…"
          className="h-10 w-full rounded-lg border border-border bg-card pl-9 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand/60"
        />
        {hasFilters && (
          <button
            onClick={clear}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label="Nullstill filtre"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {!kind && (
        <div className="flex flex-wrap gap-1.5">
          {KIND_FILTER.map(({ value, label }) => {
            const active = activeKind === value;
            return (
              <button
                key={value}
                onClick={() => setActiveKind(active ? null : value)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  active
                    ? "border-brand bg-brand text-brand-foreground"
                    : "border-border bg-card text-foreground hover:bg-accent"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {allTags.map(({ tag, count }) => {
            const active = activeTags.has(tag);
            return (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                  active
                    ? "border-brand bg-brand text-brand-foreground"
                    : "border-border bg-card text-foreground hover:bg-accent"
                }`}
              >
                {tagLabel(tag)}
                <span
                  className={`ml-1 text-[10px] tabular-nums ${
                    active ? "text-brand-foreground/70" : "text-muted-foreground"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border px-4 py-12 text-center text-sm text-muted-foreground">
          Ingen treff. Prøv å fjerne noen filtre.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((it) => (
            <LibraryCard key={it.slug} item={it} />
          ))}
        </div>
      )}

      <div className="pt-2 text-xs text-muted-foreground">
        Viser {filtered.length} av {allItems.length}
      </div>
    </div>
  );
}
