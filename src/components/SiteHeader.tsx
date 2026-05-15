import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Menu, X } from "lucide-react";
import { searchEntries, type SearchEntry, type SearchKind } from "@/lib/search";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ProfileButton } from "@/components/ProfileButton";

// 6 hubs. Spor og Mini-kurs lagt til i fase A-IA-fix —
// før dette var de kun oppdagelig via globalt søk.
const HUBS: { label: string; to: string }[] = [
  { label: "Lær", to: "/lar" },
  { label: "Øv", to: "/ov" },
  { label: "Spor", to: "/spor" },
  { label: "Mini-kurs", to: "/mini-kurs" },
  { label: "Eksamen", to: "/eksamen" },
  { label: "Du", to: "/dashboard" },
];

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Lukk mobil-meny ved navigasjon (route-bytte)
  useEffect(() => {
    if (!mobileOpen) return;
    const close = () => setMobileOpen(false);
    window.addEventListener("popstate", close);
    return () => window.removeEventListener("popstate", close);
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-14 items-center gap-3 px-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand text-brand-foreground font-bold text-sm">
            S
          </div>
          <span className="font-semibold tracking-tight hidden sm:inline">SQL Sandbox</span>
        </Link>

        <GlobalSearch />

        {/* Desktop-navigasjon — md og oppover */}
        <nav className="hidden md:flex items-center gap-1 text-sm shrink-0">
          {HUBS.map((p) => (
            <Link
              key={p.to}
              to={p.to}
              className="rounded-md px-2.5 py-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              activeProps={{ className: "rounded-md px-2.5 py-1.5 text-foreground bg-accent" }}
            >
              {p.label}
            </Link>
          ))}
        </nav>

        {/* Mobil hamburger-knapp — under md */}
        <button
          type="button"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label={mobileOpen ? "Lukk meny" : "Åpne meny"}
          aria-expanded={mobileOpen}
          className="md:hidden rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <ProfileButton />
        <ThemeToggle />
      </div>

      {/* Mobil-meny dropdown — vises kun når mobileOpen og under md */}
      {mobileOpen && (
        <nav className="md:hidden border-t border-border bg-background">
          <div className="container mx-auto px-4 py-2 flex flex-col gap-0.5">
            {HUBS.map((p) => (
              <Link
                key={p.to}
                to={p.to}
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                activeProps={{ className: "rounded-md px-3 py-2 text-sm text-foreground bg-accent font-semibold" }}
              >
                {p.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}

const KIND_BADGE: Record<SearchKind, { label: string; cls: string }> = {
  "Stack — eksamen": { label: "Eksamen", cls: "border-brand/40 bg-brand/10 text-brand" },
  Stack: { label: "Stack", cls: "border-border bg-muted/40 text-muted-foreground" },
  Huskelapp: {
    label: "Huskelapp",
    cls: "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  "Kurs-nivå": { label: "Kurs", cls: "border-success/40 bg-success/10 text-success" },
  "SQL-oppgave": {
    label: "SQL",
    cls: "border-blue-500/40 bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  "Python-oppgave": {
    label: "Py",
    cls: "border-violet-500/40 bg-violet-500/10 text-violet-600 dark:text-violet-400",
  },
  Side: { label: "Side", cls: "border-border bg-muted/40 text-muted-foreground" },
};

const KIND_ORDER: SearchKind[] = [
  "Stack — eksamen",
  "Stack",
  "Huskelapp",
  "Kurs-nivå",
  "SQL-oppgave",
  "Python-oppgave",
  "Side",
];

const PER_KIND_CAP = 5;

function groupAndCap(results: SearchEntry[]): SearchEntry[] {
  const counts = new Map<SearchKind, number>();
  const out: SearchEntry[] = [];
  // First pass: respect score order but cap per kind so 320 SQL-oppgaver
  // don't crowd out a single Huskelapp hit.
  for (const r of results) {
    const n = counts.get(r.kind) ?? 0;
    if (n >= PER_KIND_CAP) continue;
    counts.set(r.kind, n + 1);
    out.push(r);
  }
  // Then re-order by KIND_ORDER while preserving in-kind order.
  out.sort((a, b) => KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind));
  return out;
}

function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const suggestions = useMemo<SearchEntry[]>(() => {
    const q = query.trim();
    if (!q) return [];
    return groupAndCap(searchEntries(q, 80));
  }, [query]);

  // Keep activeIdx in bounds.
  useEffect(() => {
    if (activeIdx >= suggestions.length) setActiveIdx(0);
  }, [suggestions.length, activeIdx]);

  // Close on outside click.
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    window.addEventListener("mousedown", onDoc);
    return () => window.removeEventListener("mousedown", onDoc);
  }, []);

  // Global shortcut: "/" or Cmd/Ctrl+K focuses the search.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (document.activeElement?.tagName ?? "").toUpperCase();
      const inField = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
      const inMonaco = !!document.activeElement?.closest(".monaco-editor");
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
        return;
      }
      if (e.key === "/" && !inField && !inMonaco && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function go(s: SearchEntry) {
    setOpen(false);
    setQuery("");
    inputRef.current?.blur();
    // window.location handles hashes (#anchor) and query strings cleanly,
    // and works for both internal SPA routes (rerendered on navigate) and
    // hash-jumps inside a page like /stack/huskelapp#joins.
    window.location.href = s.href;
  }

  function submit() {
    const q = query.trim();
    if (!q) return;
    if (suggestions.length > 0) {
      go(suggestions[Math.min(activeIdx, suggestions.length - 1)]);
    } else {
      // Fallback: hand the query to /practice search.
      window.location.href = `/practice?q=${encodeURIComponent(q)}`;
    }
  }

  // Build groups for header rendering inside the dropdown.
  const groups = useMemo(() => {
    const byKind = new Map<SearchKind, SearchEntry[]>();
    for (const s of suggestions) {
      if (!byKind.has(s.kind)) byKind.set(s.kind, []);
      byKind.get(s.kind)!.push(s);
    }
    return KIND_ORDER.filter((k) => byKind.has(k)).map((k) => ({
      kind: k,
      items: byKind.get(k)!,
    }));
  }, [suggestions]);

  // Flat index for keyboard navigation across groups.
  const flatItems = suggestions;

  return (
    <div ref={wrapRef} className="relative flex-1 min-w-0 max-w-xl">
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
      <input
        ref={inputRef}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setActiveIdx(0);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            submit();
          } else if (e.key === "Escape") {
            setOpen(false);
            inputRef.current?.blur();
          } else if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIdx((i) => Math.min(i + 1, Math.max(0, flatItems.length - 1)));
            setOpen(true);
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIdx((i) => Math.max(0, i - 1));
          }
        }}
        placeholder="Søk på alt — http, JOIN, NULL, transistor, opg9…  ( /  eller  ⌘K )"
        aria-label="Globalt søk"
        className="h-9 w-full rounded-md border border-border bg-card pl-8 pr-12 text-xs focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand/60"
      />
      <kbd className="absolute right-2 top-1/2 -translate-y-1/2 hidden md:inline-flex items-center rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground pointer-events-none">
        /
      </kbd>

      {open && query.trim() && (
        <div className="absolute left-0 right-0 top-[calc(100%+4px)] rounded-lg border border-border bg-popover shadow-lg overflow-hidden z-50 max-h-[70vh] overflow-y-auto">
          {flatItems.length === 0 ? (
            <div className="px-3 py-3 text-xs text-muted-foreground">
              Ingen treff på «{query}». Trykk Enter for å søke videre i oppgaver.
            </div>
          ) : (
            <div className="py-1">
              {groups.map((g) => (
                <div key={g.kind}>
                  <div className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                    {g.kind}
                  </div>
                  <ul role="listbox" aria-label={g.kind}>
                    {g.items.map((s) => {
                      const flatIdx = flatItems.indexOf(s);
                      const active = flatIdx === activeIdx;
                      return (
                        <li key={s.id}>
                          <button
                            type="button"
                            role="option"
                            aria-selected={active}
                            onMouseEnter={() => setActiveIdx(flatIdx)}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              go(s);
                            }}
                            className={`w-full flex items-start gap-2 px-3 py-1.5 text-left text-xs ${
                              active ? "bg-accent text-foreground" : "text-foreground/90"
                            }`}
                          >
                            <KindBadge kind={s.kind} />
                            <div className="flex-1 min-w-0">
                              <div className="truncate font-medium">{s.title}</div>
                              {s.description && (
                                <div className="truncate text-[10px] text-muted-foreground mt-0.5">
                                  {s.description}
                                </div>
                              )}
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function KindBadge({ kind }: { kind: SearchKind }) {
  const m = KIND_BADGE[kind];
  return (
    <span
      className={`shrink-0 rounded border px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider ${m.cls} mt-0.5`}
    >
      {m.label}
    </span>
  );
}
