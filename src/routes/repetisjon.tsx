// Samlet "Due i dag"-side. Trekker fra alle fire FSRS-namespacene
// (flashcards, drag, JOIN, SQL-problemer) og viser en mikset kø sortert etter
// hvor lenge oppgavene har vært overforfalt.
//
// Klikk på en linje sender brukeren til riktig verktøy. For SQL-problemer
// pre-velger vi oppgaven via `?id=` (practice-ruta støtter dette allerede).
// For drag/JOIN/flashcards finnes det ingen per-oppgave deep-link enda, så
// vi sender brukeren til verktøyets studiemodus i staden.

import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Brain, Layers, GitMerge, Code2, Target } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { flashcardFsrs } from "@/lib/learn/fsrs";
import { dragFsrs } from "@/lib/learn/dragProgress";
import { joinFsrs } from "@/lib/learn/joinProgress";
import { problemFsrs } from "@/lib/progress/storage";
import { FLASHCARDS } from "@/lib/learn/flashcards";
import { DRAG_EXERCISES } from "@/lib/learn/dragExercises";
import { JOIN_EXERCISES } from "@/lib/learn/joinExercises";
import { PROBLEMS } from "@/lib/problems/data";

export const Route = createFileRoute("/repetisjon")({
  head: () => ({
    meta: [
      { title: "Due i dag — SQL Sandbox" },
      {
        name: "description",
        content:
          "Samlet spaced-repetition kø: alle oppgaver (flashcards, drag, JOIN, SQL) som er due i dag, basert på FSRS-4.5.",
      },
    ],
  }),
  component: RepetisjonPage,
});

type ToolKind = "flashcard" | "drag" | "join" | "sql";

interface DueItem {
  id: string;
  tool: ToolKind;
  title: string;
  due: number;
  /** Where clicking the row sends the user. */
  to: string;
  /** Optional search params for TanStack Router. */
  search?: Record<string, string>;
}

const TOOL_META: Record<ToolKind, { label: string; icon: typeof Brain; color: string }> = {
  flashcard: { label: "Flashcard", icon: Brain, color: "text-brand" },
  drag: { label: "Drag", icon: Layers, color: "text-success" },
  join: { label: "JOIN", icon: GitMerge, color: "text-warning" },
  sql: { label: "SQL", icon: Code2, color: "text-info" },
};

function flashcardTitle(id: string): string {
  const c = FLASHCARDS.find((x) => x.id === id);
  return c?.question ?? id;
}
function dragTitle(id: string): string {
  const e = DRAG_EXERCISES.find((x) => x.id === id);
  return e?.title ?? id;
}
function joinTitle(id: string): string {
  const e = JOIN_EXERCISES.find((x) => x.id === id);
  return e?.title ?? id;
}
function sqlTitle(id: string): string {
  const p = PROBLEMS.find((x) => x.id === id);
  return p?.title ?? id;
}

function formatOverdue(ms: number): string {
  const abs = Math.abs(ms);
  const min = abs / 60_000;
  if (min < 60) return `${Math.max(1, Math.round(min))} min`;
  const h = min / 60;
  if (h < 24) return `${Math.round(h)} t`;
  const d = h / 24;
  return `${Math.round(d)} d`;
}

function collectDue(now: number): DueItem[] {
  const items: DueItem[] = [];

  for (const s of Object.values(flashcardFsrs.getAllStates())) {
    if (s.state === "new" || s.due > now) continue;
    items.push({
      id: s.id,
      tool: "flashcard",
      title: flashcardTitle(s.id),
      due: s.due,
      to: "/cards",
      search: { mode: "study" },
    });
  }

  for (const s of Object.values(dragFsrs.getAllStates())) {
    if (s.state === "new" || s.due > now) continue;
    items.push({
      id: s.id,
      tool: "drag",
      title: dragTitle(s.id),
      due: s.due,
      to: "/drag",
    });
  }

  for (const s of Object.values(joinFsrs.getAllStates())) {
    if (s.state === "new" || s.due > now) continue;
    items.push({
      id: s.id,
      tool: "join",
      title: joinTitle(s.id),
      due: s.due,
      to: "/joins",
    });
  }

  for (const s of Object.values(problemFsrs.getAllStates())) {
    if (s.state === "new" || s.due > now) continue;
    items.push({
      id: s.id,
      tool: "sql",
      title: sqlTitle(s.id),
      due: s.due,
      to: "/practice",
      search: { id: s.id },
    });
  }

  items.sort((a, b) => a.due - b.due);
  return items;
}

function RepetisjonPage() {
  // Re-read on mount only; the queue is essentially static during a visit.
  // Users return here after solving something — that mount re-runs this.
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => setNow(Date.now()), []);

  const items = useMemo(() => (now != null ? collectDue(now) : []), [now]);

  if (now == null) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">
          Laster…
        </div>
      </div>
    );
  }

  const counts = items.reduce<Record<ToolKind, number>>(
    (acc, it) => {
      acc[it.tool] = (acc[it.tool] ?? 0) + 1;
      return acc;
    },
    { flashcard: 0, drag: 0, join: 0, sql: 0 },
  );

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-10 max-w-4xl">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Target className="h-7 w-7 text-brand" />
              Due i dag
            </h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
              Spaced repetition (FSRS-4.5) på tvers av flashcards, drag-oppgaver,
              JOIN-oppgaver og SQL-problemer. Listen viser alt som er klart for
              repetisjon nå, sortert etter eldste due-dato først.
            </p>
          </div>
          <Link to="/dashboard">
            <Button variant="outline" size="sm">
              Til dashboard
            </Button>
          </Link>
        </div>

        {/* Per-tool count cards */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(Object.keys(TOOL_META) as ToolKind[]).map((kind) => {
            const meta = TOOL_META[kind];
            const Icon = meta.icon;
            return (
              <div
                key={kind}
                className="rounded-xl border border-border bg-card p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">
                    {meta.label}
                  </span>
                  <Icon className={`h-4 w-4 ${meta.color}`} />
                </div>
                <div className="mt-2 text-2xl font-bold">{counts[kind]}</div>
                <div className="text-xs text-muted-foreground mt-0.5">due</div>
              </div>
            );
          })}
        </div>

        {/* Queue */}
        <div className="mt-8">
          <h2 className="font-semibold mb-3 flex items-baseline gap-2">
            <span>Kø ({items.length})</span>
            {items.length > 50 && (
              <span className="text-xs font-normal text-muted-foreground">
                viser de første 50
              </span>
            )}
          </h2>
          {items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center">
              <p className="text-sm text-muted-foreground">
                Ingen ting due akkurat nå. Løs noen oppgaver — så dukker de opp
                her når FSRS sier de er klare for repetisjon.
              </p>
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                <Link to="/cards">
                  <Button size="sm" variant="outline">
                    Flashcards
                  </Button>
                </Link>
                <Link to="/drag">
                  <Button size="sm" variant="outline">
                    Drag
                  </Button>
                </Link>
                <Link to="/joins">
                  <Button size="sm" variant="outline">
                    JOIN
                  </Button>
                </Link>
                <Link to="/practice">
                  <Button size="sm" variant="outline">
                    SQL-problemer
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <ul className="rounded-xl border border-border bg-card overflow-hidden divide-y divide-border">
              {items.slice(0, 50).map((it) => {
                const meta = TOOL_META[it.tool];
                const Icon = meta.icon;
                const overdueMs = now - it.due;
                return (
                  <li key={`${it.tool}-${it.id}`}>
                    <Link
                      to={it.to}
                      search={it.search as never}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors"
                    >
                      <Icon className={`h-4 w-4 shrink-0 ${meta.color}`} />
                      <span
                        className={`text-[10px] uppercase tracking-wider font-mono shrink-0 w-16 ${meta.color}`}
                      >
                        {meta.label}
                      </span>
                      <span className="flex-1 text-sm truncate" title={it.title}>
                        {it.title}
                      </span>
                      <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
                        {overdueMs >= 0
                          ? `${formatOverdue(overdueMs)} over`
                          : `om ${formatOverdue(overdueMs)}`}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
