// Samlet "Due i dag"-side, bygget på core-engine-registeret: køen itererer
// PRACTICE_MODULES i stedet for å hardkode hver FSRS-silo, og kan filtreres
// per fag via modulenes fag-avledning. Nye øvingsmoduler dukker opp her
// automatisk når de registreres i src/lib/core/registry.ts.

import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Target } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { PRACTICE_MODULES } from "@/lib/core/registry";
import { collectDue, subjectsWithDue } from "@/lib/core/due";
import { SUBJECT_BY_SLUG } from "@/lib/subjects/catalog";

export const Route = createFileRoute("/repetisjon")({
  head: () => ({
    meta: [
      { title: "Due i dag — Kodeverkstedet" },
      {
        name: "description",
        content:
          "Samlet spaced-repetition kø: alt som er due i dag på tvers av øvingsmodulene, basert på FSRS-4.5. Filtrer per fag.",
      },
    ],
  }),
  component: RepetisjonPage,
});

function formatOverdue(ms: number): string {
  const abs = Math.abs(ms);
  const min = abs / 60_000;
  if (min < 60) return `${Math.max(1, Math.round(min))} min`;
  const h = min / 60;
  if (h < 24) return `${Math.round(h)} t`;
  const d = h / 24;
  return `${Math.round(d)} d`;
}

function RepetisjonPage() {
  // Re-read on mount only; the queue is essentially static during a visit.
  // Users return here after solving something — that mount re-runs this.
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => setNow(Date.now()), []);

  const [subjectFilter, setSubjectFilter] = useState<string | null>(null);

  const allItems = useMemo(() => (now != null ? collectDue(now) : []), [now]);
  const subjects = useMemo(() => (now != null ? subjectsWithDue(now) : []), [now]);

  const items = useMemo(
    () =>
      subjectFilter == null
        ? allItems
        : allItems.filter((e) => e.item.subjectSlug === subjectFilter),
    [allItems, subjectFilter],
  );

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

  const counts: Record<string, number> = {};
  for (const m of PRACTICE_MODULES) counts[m.id] = 0;
  for (const e of items) counts[e.module.id] += 1;

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
              Spaced repetition (FSRS-4.5) på tvers av alle øvingsmodulene. Listen viser alt som er
              klart for repetisjon nå, sortert etter eldste due-dato først.
            </p>
          </div>
          <Link to="/dashboard">
            <Button variant="outline" size="sm">
              Til dashboard
            </Button>
          </Link>
        </div>

        {/* Fag-filter — vises bare når køen inneholder fag-taggede items */}
        {subjects.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setSubjectFilter(null)}
              className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                subjectFilter == null
                  ? "border-brand bg-brand text-brand-foreground"
                  : "border-border bg-card text-foreground hover:bg-accent"
              }`}
            >
              Alle fag ({allItems.length})
            </button>
            {subjects.map((slug) => {
              const subject = SUBJECT_BY_SLUG[slug];
              const count = allItems.filter((e) => e.item.subjectSlug === slug).length;
              return (
                <button
                  key={slug}
                  type="button"
                  onClick={() => setSubjectFilter(subjectFilter === slug ? null : slug)}
                  className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                    subjectFilter === slug
                      ? "border-brand bg-brand text-brand-foreground"
                      : "border-border bg-card text-foreground hover:bg-accent"
                  }`}
                >
                  {subject?.code ?? slug} ({count})
                </button>
              );
            })}
          </div>
        )}

        {/* Per-modul count cards */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {PRACTICE_MODULES.map((m) => (
            <div key={m.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-muted-foreground">
                  {m.label}
                </span>
                <m.Icon className={`h-4 w-4 ${m.color}`} />
              </div>
              <div className="mt-2 text-2xl font-bold">{counts[m.id]}</div>
              <div className="text-xs text-muted-foreground mt-0.5">due</div>
            </div>
          ))}
        </div>

        {/* Queue */}
        <div className="mt-8">
          <h2 className="font-semibold mb-3 flex items-baseline gap-2">
            <span>Kø ({items.length})</span>
            {items.length > 50 && (
              <span className="text-xs font-normal text-muted-foreground">viser de første 50</span>
            )}
          </h2>
          {items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center">
              <p className="text-sm text-muted-foreground">
                {subjectFilter
                  ? "Ingen ting due i dette faget akkurat nå."
                  : "Ingen ting due akkurat nå. Løs noen oppgaver — så dukker de opp her når FSRS sier de er klare for repetisjon."}
              </p>
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                {PRACTICE_MODULES.map((m) => (
                  <a key={m.id} href={m.href}>
                    <Button size="sm" variant="outline">
                      {m.label}
                    </Button>
                  </a>
                ))}
              </div>
            </div>
          ) : (
            <ul className="rounded-xl border border-border bg-card overflow-hidden divide-y divide-border">
              {items.slice(0, 50).map((e) => {
                const Icon = e.module.Icon;
                const overdueMs = now - e.due;
                const subject = e.item.subjectSlug ? SUBJECT_BY_SLUG[e.item.subjectSlug] : null;
                return (
                  <li key={`${e.module.id}-${e.item.id}`}>
                    <Link
                      to={e.item.to}
                      search={e.item.search as never}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors"
                    >
                      <Icon className={`h-4 w-4 shrink-0 ${e.module.color}`} />
                      <span
                        className={`text-[10px] uppercase tracking-wider font-mono shrink-0 w-16 ${e.module.color}`}
                      >
                        {e.module.label}
                      </span>
                      <span className="flex-1 text-sm truncate" title={e.item.title}>
                        {e.item.title}
                      </span>
                      {subject && (
                        <span className="hidden sm:inline text-[10px] font-mono uppercase tracking-wider text-muted-foreground shrink-0">
                          {subject.code}
                        </span>
                      )}
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
