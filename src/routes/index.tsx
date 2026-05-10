import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PROBLEMS } from "@/lib/problems/data";
import { useAppMode, setAppMode, type AppMode } from "@/lib/appMode";
import { Search, GraduationCap, Dumbbell, ArrowRight, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SQL Sandbox — DTE-2509-1 Databaser og webapplikasjoner 1" },
      {
        name: "description",
        content:
          "Øvingsverktøy for DTE-2509-1 26V Databaser og webapplikasjoner 1. SQL-oppgaver med ekte SQLite i nettleseren, hint, fasit, eksamen-modus og globalt søk.",
      },
      {
        property: "og:title",
        content: "SQL Sandbox — DTE-2509-1 Databaser og webapplikasjoner 1",
      },
      {
        property: "og:description",
        content:
          "Studentlaget øvingsverktøy for DTE-2509-1 26V — over 300 SQL-oppgaver, eksamen-modus og søk overalt.",
      },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  const navigate = useNavigate();
  const appMode = useAppMode();
  const [query, setQuery] = useState("");

  const totals = {
    problems: PROBLEMS.length,
    levels: 6,
    topics: new Set(PROBLEMS.flatMap((p) => p.topics)).size,
  };

  // Topp-temaer rangert etter antall oppgaver — det studenten typisk leter etter på eksamen.
  const topTopics = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of PROBLEMS) {
      for (const t of p.topics) counts.set(t, (counts.get(t) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 14);
  }, []);

  // Live-forslag mens man skriver — hjelper studenten å finne riktig oppgave/tema fort.
  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { probs: [], topics: [] };
    const probs = PROBLEMS.filter((p) =>
      `${p.title} ${p.problem} ${p.topics.join(" ")}`.toLowerCase().includes(q),
    ).slice(0, 6);
    const topics = topTopics
      .map(([t]) => t)
      .filter((t) => t.toLowerCase().includes(q))
      .slice(0, 4);
    return { probs, topics };
  }, [query, topTopics]);

  function submitSearch() {
    const q = query.trim();
    navigate({ to: "/practice", search: q ? { q } : {} });
  }

  function chooseMode(mode: AppMode) {
    setAppMode(mode);
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border">
          <div
            className="absolute inset-0 -z-10 opacity-40"
            style={{
              backgroundImage:
                "radial-gradient(60% 60% at 50% 0%, color-mix(in oklab, var(--brand) 35%, transparent), transparent)",
            }}
          />
          <div className="container mx-auto px-4 py-16 md:py-20 text-center max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand/40 bg-brand/10 px-3 py-1 text-xs font-semibold text-brand mb-3">
              DTE-2509-1 · 26V · Databaser og webapplikasjoner 1
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground mb-6 ml-2">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              Kjører lokalt i nettleseren — ingen innlogging
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Øv på SQL med{" "}
              <span className="bg-gradient-to-r from-brand to-success bg-clip-text text-transparent">
                ekte spørringer
              </span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Studentlaget øvingsverktøy for{" "}
              <strong className="text-foreground">DTE-2509-1 Databaser og webapplikasjoner 1</strong>.{" "}
              Skriv ekte spørringer mot et realistisk skjema — {totals.problems} oppgaver,{" "}
              {totals.topics} temaer — velg modus og søk deg fram.
            </p>

            {/* Modus-velger */}
            <div className="mt-8 mx-auto max-w-xl">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                Velg modus
              </div>
              <div className="grid grid-cols-2 gap-3">
                <ModeCard
                  active={appMode === "ovning"}
                  onClick={() => chooseMode("ovning")}
                  icon={<Dumbbell className="h-5 w-5" />}
                  title="Øving"
                  body="Løs oppgavene selv med hint, fasit og diff."
                  accent="brand"
                />
                <ModeCard
                  active={appMode === "eksamen"}
                  onClick={() => chooseMode("eksamen")}
                  icon={<GraduationCap className="h-5 w-5" />}
                  title="Eksamen"
                  body="Fasit pre-fylles i editoren — finn fort og lever."
                  accent="warning"
                />
              </div>
              {appMode === "eksamen" && (
                <p className="mt-3 text-xs text-warning flex items-center justify-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  Eksamen-modus: åpne en oppgave i Practice — fasiten ligger klar i SQL-editoren.
                </p>
              )}
            </div>

            {/* Søk */}
            <div className="mt-8 mx-auto max-w-xl text-left">
              <label
                htmlFor="home-search"
                className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold"
              >
                Søk etter tema eller oppgave
              </label>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="home-search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") submitSearch();
                  }}
                  placeholder="f.eks. JOIN, GROUP BY, vindusfunksjon, bilsalg…"
                  className="h-11 pl-9 pr-24 text-sm"
                />
                <Button
                  size="sm"
                  onClick={submitSearch}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8"
                >
                  Søk <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>

              {query.trim() && suggestions && (
                <div className="mt-2 rounded-lg border border-border bg-card overflow-hidden text-sm">
                  {suggestions.topics.length > 0 && (
                    <div className="border-b border-border px-3 py-2">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
                        Temaer
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {suggestions.topics.map((t) => (
                          <Link
                            key={t}
                            to="/practice"
                            search={{ topic: t }}
                            className="rounded-full border border-brand/40 bg-brand/10 px-2.5 py-0.5 text-xs hover:bg-brand/20"
                          >
                            {t}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                  {suggestions.probs.length > 0 ? (
                    <ul className="divide-y divide-border">
                      {suggestions.probs.map((p) => (
                        <li key={p.id}>
                          <Link
                            to="/practice"
                            search={{ id: p.id }}
                            className="flex items-center gap-2 px-3 py-2 hover:bg-accent/40"
                          >
                            <span className="text-[10px] rounded border border-border bg-muted px-1.5 py-0.5 text-muted-foreground">
                              L{p.level}
                            </span>
                            <span className="flex-1 truncate">{p.title}</span>
                            <span className="text-[11px] text-muted-foreground truncate max-w-[140px]">
                              {p.topics.slice(0, 2).join(", ")}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    suggestions.topics.length === 0 && (
                      <div className="px-3 py-3 text-xs text-muted-foreground">
                        Ingen treff. Prøv et annet søkeord.
                      </div>
                    )
                  )}
                </div>
              )}

              {/* Tema-chips for rask navigering */}
              {!query.trim() && (
                <div className="mt-4">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
                    Vanlige eksamenstemaer
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {topTopics.map(([t, n]) => (
                      <Link
                        key={t}
                        to="/practice"
                        search={{ topic: t }}
                        className="rounded-full border border-border bg-card px-2.5 py-0.5 text-xs text-foreground/90 hover:border-brand/60 hover:bg-brand/10"
                        title={`${n} oppgaver`}
                      >
                        {t} <span className="text-muted-foreground">({n})</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-10 flex items-center justify-center gap-3">
              <Button asChild size="lg">
                <Link to="/kurs">Start fra nivå 0 →</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/practice">Bla i alle oppgaver</Link>
              </Button>
            </div>
            <div className="mt-12 grid grid-cols-3 gap-6 max-w-md mx-auto text-left">
              <Stat label="Problems" value={String(totals.problems)} />
              <Stat label="Levels" value={String(totals.levels)} />
              <Stat label="Topics" value={String(totals.topics)} />
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="container mx-auto px-4 py-20 max-w-5xl">
          <h2 className="text-3xl font-bold text-center tracking-tight">
            Built for actually learning
          </h2>
          <p className="mt-3 text-center text-muted-foreground max-w-xl mx-auto">
            Not a quiz site. A SQL workbench with feedback that teaches.
          </p>
          <div className="mt-12 grid md:grid-cols-3 gap-5">
            <Feature
              title="Real SQLite, in your browser"
              body="Queries run on a real SQLite engine compiled to WebAssembly. No server, no signup, no rate limits."
            />
            <Feature
              title="Result-based grading"
              body="Your output is compared to the expected result set — there's never just one 'right' way to write a query."
            />
            <Feature
              title="Persistent dataset"
              body="Every problem uses the same e-commerce schema, so you build a real mental model of the data."
            />
            <Feature
              title="Progressive hints"
              body="Stuck? Reveal hints one at a time before peeking at the full solution and explanation."
            />
            <Feature
              title="XP, streaks & mastery"
              body="Earn XP per solve, build a streak, and see exactly which topics still need work."
            />
            <Feature
              title="Exam mode"
              body="Skru på Eksamen-modus så ligger fasiten klar i editoren for hver oppgave — perfekt som oppslagsverk."
            />
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border bg-card/30">
          <div className="container mx-auto px-4 py-16 text-center max-w-2xl">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
              Pick a problem and write your first query.
            </h2>
            <div className="mt-6">
              <Button asChild size="lg">
                <Link to="/practice">Browse problems</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t border-border">
        <div className="container mx-auto px-4 py-6 text-xs text-muted-foreground text-center">
          SQL Sandbox · Built with sql.js · Progress saved locally in your browser.
        </div>
      </footer>
    </div>
  );
}

function ModeCard({
  active,
  onClick,
  icon,
  title,
  body,
  accent,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  body: string;
  accent: "brand" | "warning";
}) {
  const activeRing =
    accent === "warning"
      ? "border-warning ring-2 ring-warning/40 bg-warning/10"
      : "border-brand ring-2 ring-brand/40 bg-brand/10";
  const idleHover =
    accent === "warning" ? "hover:border-warning/60" : "hover:border-brand/60";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`group rounded-xl border p-4 text-left transition-all ${
        active ? activeRing : `border-border bg-card ${idleHover}`
      }`}
    >
      <div className="flex items-center gap-2">
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-md ${
            accent === "warning"
              ? "bg-warning/20 text-warning"
              : "bg-brand/20 text-brand"
          }`}
        >
          {icon}
        </span>
        <span className="font-semibold">{title}</span>
        {active && (
          <span
            className={`ml-auto text-[10px] font-bold uppercase tracking-wider ${
              accent === "warning" ? "text-warning" : "text-brand"
            }`}
          >
            Aktiv
          </span>
        )}
      </div>
      <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{body}</p>
    </button>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="text-2xl font-bold text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">{label}</div>
    </div>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{body}</p>
    </div>
  );
}
