import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { PROBLEMS } from "@/lib/problems/data";

interface NavSuggestion {
  kind: "page" | "topic" | "problem";
  label: string;
  sub?: string;
  to: string;
  search?: Record<string, string>;
}

// Statisk liste over hovedsidene — gir hurtignavigasjon ("hjem", "exam", "dashboard"...).
const PAGES: { label: string; to: string; aliases?: string[] }[] = [
  { label: "Hjem", to: "/", aliases: ["start", "home"] },
  { label: "Kurs", to: "/kurs" },
  { label: "Stack", to: "/stack" },
  { label: "Practice", to: "/practice", aliases: ["oppgaver", "øving"] },
  { label: "Lær", to: "/learn", aliases: ["learn"] },
  { label: "Joins", to: "/joins" },
  { label: "ER-tegner", to: "/er-tegner", aliases: ["er", "diagram"] },
  { label: "Python", to: "/python" },
  { label: "Prosjekt", to: "/prosjekt" },
  { label: "API-konsoll", to: "/konsoll", aliases: ["api", "konsoll"] },
  { label: "Exam", to: "/exam", aliases: ["eksamen"] },
  { label: "Dashboard", to: "/dashboard" },
  { label: "Cards", to: "/cards", aliases: ["flashcards"] },
  { label: "Drag", to: "/drag", aliases: ["dra"] },
];

export function SiteHeader() {
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

        <nav className="hidden xl:flex items-center gap-1 text-sm shrink-0">
          {PAGES.slice(1, 8).map((p) => (
            <Link
              key={p.to}
              to={p.to}
              className="rounded-md px-2.5 py-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              activeProps={{ className: "rounded-md px-2.5 py-1.5 text-foreground bg-accent" }}
            >
              {p.label}
            </Link>
          ))}
          <Link
            to="/exam"
            className="rounded-md px-2.5 py-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            activeProps={{ className: "rounded-md px-2.5 py-1.5 text-foreground bg-accent" }}
          >
            Exam
          </Link>
          <Link
            to="/dashboard"
            className="rounded-md px-2.5 py-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            activeProps={{ className: "rounded-md px-2.5 py-1.5 text-foreground bg-accent" }}
          >
            Dashboard
          </Link>
        </nav>
      </div>
    </header>
  );
}

function GlobalSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Topic-frekvens — likt prinsipp som på landingssiden, men cachet her.
  const allTopics = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of PROBLEMS) for (const t of p.topics) counts.set(t, (counts.get(t) ?? 0) + 1);
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, []);

  const suggestions = useMemo<NavSuggestion[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const out: NavSuggestion[] = [];

    // Sider
    for (const p of PAGES) {
      const hay = [p.label, ...(p.aliases ?? [])].join(" ").toLowerCase();
      if (hay.includes(q)) out.push({ kind: "page", label: p.label, to: p.to });
      if (out.length >= 4) break;
    }

    // Temaer
    const topicMatches = allTopics.filter(([t]) => t.toLowerCase().includes(q)).slice(0, 4);
    for (const [t, n] of topicMatches) {
      out.push({
        kind: "topic",
        label: t,
        sub: `${n} oppgaver`,
        to: "/practice",
        search: { topic: t },
      });
    }

    // Oppgaver
    const probMatches = PROBLEMS.filter((p) =>
      `${p.title} ${p.problem} ${p.topics.join(" ")}`.toLowerCase().includes(q),
    ).slice(0, 6);
    for (const p of probMatches) {
      out.push({
        kind: "problem",
        label: p.title,
        sub: `L${p.level} · ${p.topics.slice(0, 2).join(", ")}`,
        to: "/practice",
        search: { id: p.id },
      });
    }

    return out;
  }, [query, allTopics]);

  // Hold activeIdx i bounds når listen endres.
  useEffect(() => {
    if (activeIdx >= suggestions.length) setActiveIdx(0);
  }, [suggestions.length, activeIdx]);

  // Lukk ved klikk utenfor.
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    window.addEventListener("mousedown", onDoc);
    return () => window.removeEventListener("mousedown", onDoc);
  }, []);

  // Global hurtigtast: "/" eller Cmd/Ctrl+K fokuserer søk fra hvor som helst.
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

  function go(s: NavSuggestion) {
    navigate({ to: s.to, search: s.search ?? {} });
    setOpen(false);
    setQuery("");
    inputRef.current?.blur();
  }

  function submit() {
    const q = query.trim();
    if (!q) return;
    if (suggestions.length > 0) {
      go(suggestions[Math.min(activeIdx, suggestions.length - 1)]);
    } else {
      navigate({ to: "/practice", search: { q } });
      setOpen(false);
      setQuery("");
      inputRef.current?.blur();
    }
  }

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
            setActiveIdx((i) => Math.min(i + 1, Math.max(0, suggestions.length - 1)));
            setOpen(true);
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIdx((i) => Math.max(0, i - 1));
          }
        }}
        placeholder="Søk side, tema eller oppgave…  ( /  eller  ⌘K )"
        aria-label="Globalt søk"
        className="h-9 w-full rounded-md border border-border bg-card pl-8 pr-12 text-xs focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand/60"
      />
      <kbd className="absolute right-2 top-1/2 -translate-y-1/2 hidden md:inline-flex items-center rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground pointer-events-none">
        /
      </kbd>

      {open && query.trim() && (
        <div className="absolute left-0 right-0 top-[calc(100%+4px)] rounded-lg border border-border bg-popover shadow-lg overflow-hidden z-50 max-h-[60vh] overflow-y-auto">
          {suggestions.length === 0 ? (
            <div className="px-3 py-3 text-xs text-muted-foreground">
              Ingen treff. Trykk Enter for å søke i alle oppgaver.
            </div>
          ) : (
            <ul role="listbox" aria-label="Søkeforslag" className="py-1">
              {suggestions.map((s, i) => {
                const active = i === activeIdx;
                return (
                  <li key={`${s.kind}-${s.to}-${s.label}-${i}`}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={active}
                      onMouseEnter={() => setActiveIdx(i)}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        go(s);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-1.5 text-left text-xs ${
                        active ? "bg-accent text-foreground" : "text-foreground/90"
                      }`}
                    >
                      <KindBadge kind={s.kind} />
                      <span className="flex-1 truncate">{s.label}</span>
                      {s.sub && (
                        <span className="text-[10px] text-muted-foreground truncate max-w-[160px]">
                          {s.sub}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function KindBadge({ kind }: { kind: NavSuggestion["kind"] }) {
  const map = {
    page: { label: "Side", cls: "border-brand/40 bg-brand/10 text-brand" },
    topic: { label: "Tema", cls: "border-warning/40 bg-warning/10 text-warning" },
    problem: { label: "Oppg", cls: "border-success/40 bg-success/10 text-success" },
  } as const;
  const m = map[kind];
  return (
    <span
      className={`shrink-0 rounded border px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider ${m.cls}`}
    >
      {m.label}
    </span>
  );
}
