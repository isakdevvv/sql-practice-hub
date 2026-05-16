import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PROBLEMS } from "@/lib/problems/data";
import type { Level } from "@/lib/problems/types";
import { LEVEL_NAMES } from "@/lib/problems/types";
import { DATASET_LIST, type DatasetId } from "@/lib/db/datasets";
import { loadProgress, type Progress } from "@/lib/progress/storage";
import { ArrowRight, Check, Lock, Play } from "lucide-react";

export const Route = createFileRoute("/kurs")({
  head: () => ({
    meta: [
      { title: "Kurs — stegvis SQL-læring" },
      {
        name: "description",
        content:
          "Følg en stegvis læringssti gjennom SQL — fra SELECT til vinduer og CTE. Velg nivå, øv, og lås opp neste.",
      },
    ],
  }),
  component: KursPage,
});

const LEVEL_CARDS: Array<{
  level: Level;
  norTitle: string;
  intro: string;
  topics: string[];
}> = [
  {
    level: 0,
    norTitle: "Grunnleggende",
    intro: "Plukk ut kolonner fra én tabell. SELECT, FROM, DISTINCT.",
    topics: ["SELECT", "FROM", "DISTINCT", "LIMIT"],
  },
  {
    level: 1,
    norTitle: "Filtrering",
    intro: "Begrens hvilke rader du får tilbake — WHERE og operatorer.",
    topics: ["WHERE", "AND/OR", "IN", "BETWEEN", "LIKE", "NULL"],
  },
  {
    level: 2,
    norTitle: "JOINs",
    intro: "Sett sammen flere tabeller. INNER, LEFT, og når du bruker hva.",
    topics: ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "ON"],
  },
  {
    level: 3,
    norTitle: "Aggregering",
    intro: "Tell, summer, grupper. COUNT, SUM, AVG, GROUP BY, HAVING.",
    topics: ["COUNT", "SUM", "AVG", "GROUP BY", "HAVING"],
  },
  {
    level: 4,
    norTitle: "Underspørringer",
    intro: "Spørringer inni spørringer. Subqueries, EXISTS, IN, korrelerte.",
    topics: ["Subquery", "EXISTS", "IN (SELECT …)", "Korrelert"],
  },
  {
    level: 5,
    norTitle: "Avansert",
    intro: "Vindusfunksjoner, CTE, rangering, indekser og EXPLAIN.",
    topics: ["WINDOW", "CTE", "RANK", "INDEX", "EXPLAIN"],
  },
];

function KursPage() {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [datasetId, setDatasetId] = useState<DatasetId>("ecommerce");

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  const datasetProblems = useMemo(
    () => PROBLEMS.filter((p) => (p.dataset ?? "ecommerce") === datasetId),
    [datasetId],
  );

  const perLevel = useMemo(() => {
    const map = new Map<Level, { total: number; solved: number; firstUnsolvedId: string | null }>();
    for (const card of LEVEL_CARDS) {
      const inLevel = datasetProblems.filter((p) => p.level === card.level);
      const solved = progress
        ? inLevel.filter((p) => progress.attempts[p.id]?.solved).length
        : 0;
      const firstUnsolved = progress
        ? inLevel.find((p) => !progress.attempts[p.id]?.solved)
        : inLevel[0];
      map.set(card.level, {
        total: inLevel.length,
        solved,
        firstUnsolvedId: firstUnsolved?.id ?? null,
      });
    }
    return map;
  }, [datasetProblems, progress]);

  const totalSolved = useMemo(
    () =>
      progress
        ? datasetProblems.filter((p) => progress.attempts[p.id]?.solved).length
        : 0,
    [datasetProblems, progress],
  );

  // Hvilket nivå er "neste" å fortsette på? Første nivå med uløste oppgaver.
  const continueLevel = useMemo<Level | null>(() => {
    for (const card of LEVEL_CARDS) {
      const stat = perLevel.get(card.level);
      if (stat && stat.total > 0 && stat.solved < stat.total) return card.level;
    }
    return null;
  }, [perLevel]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Stegvis SQL-kurs</h1>
          <p className="text-muted-foreground mt-2">
            Seks nivåer fra grunnleggende SELECT til vinduer og CTE. Velg hvor du vil starte —
            knappen tar deg rett til neste uløste oppgave på det nivået.
          </p>
        </div>

        {/* Datasett-velger */}
        <div className="mb-6 rounded-xl border border-border bg-card p-4">
          <label className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">
            Database
          </label>
          <select
            value={datasetId}
            onChange={(e) => setDatasetId(e.target.value as DatasetId)}
            className="mt-1.5 h-9 w-full rounded-md border border-brand/40 bg-background px-2 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {DATASET_LIST.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs text-muted-foreground">
            {datasetProblems.length} oppgaver totalt · {totalSolved} løst
          </p>
        </div>

        {/* Fortsett-CTA */}
        {continueLevel !== null && totalSolved > 0 && (
          <div className="mb-6 rounded-xl border border-brand/40 bg-brand/5 p-4 flex items-center justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-wide text-brand font-semibold">
                Fortsett der du slapp
              </div>
              <div className="text-sm mt-0.5">
                Nivå {continueLevel} · {LEVEL_CARDS[continueLevel].norTitle}
              </div>
            </div>
            <Button asChild size="sm">
              <Link
                to="/practice"
                search={{
                  level: continueLevel,
                  dataset: datasetId,
                  id: perLevel.get(continueLevel)?.firstUnsolvedId ?? undefined,
                }}
              >
                Fortsett <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Link>
            </Button>
          </div>
        )}

        {/* Stige med 6 nivåkort */}
        <ol className="space-y-3">
          {LEVEL_CARDS.map((card) => {
            const stat = perLevel.get(card.level);
            const total = stat?.total ?? 0;
            const solved = stat?.solved ?? 0;
            const pct = total > 0 ? Math.round((solved / total) * 100) : 0;
            const isDone = total > 0 && solved === total;
            const isStarted = solved > 0 && !isDone;
            const isEmpty = total === 0;

            return (
              <li key={card.level}>
                <LevelCard
                  level={card.level}
                  norTitle={card.norTitle}
                  intro={card.intro}
                  topics={card.topics}
                  total={total}
                  solved={solved}
                  pct={pct}
                  isDone={isDone}
                  isStarted={isStarted}
                  isEmpty={isEmpty}
                  datasetId={datasetId}
                  firstUnsolvedId={stat?.firstUnsolvedId ?? null}
                />
              </li>
            );
          })}
        </ol>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Trenger du noe annet?</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/learn" className="text-brand hover:underline">
                Lær
              </Link>
              : repetisjonskort, drag-oppgaver og visuelle JOIN-øvelser.
            </li>
            <li>
              <Link to="/practice" className="text-brand hover:underline">
                Practice
              </Link>
              : alle oppgaver i én flat liste med filtre.
            </li>
            <li>
              <Link to="/eksamen/trening" className="text-brand hover:underline">
                Eksamenstrening
              </Link>
              : tidsbegrenset miks for å teste deg under press.
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}

function LevelCard({
  level,
  norTitle,
  intro,
  topics,
  total,
  solved,
  pct,
  isDone,
  isStarted,
  isEmpty,
  datasetId,
  firstUnsolvedId,
}: {
  level: Level;
  norTitle: string;
  intro: string;
  topics: string[];
  total: number;
  solved: number;
  pct: number;
  isDone: boolean;
  isStarted: boolean;
  isEmpty: boolean;
  datasetId: DatasetId;
  firstUnsolvedId: string | null;
}) {
  const accent = isDone
    ? "border-success/50 bg-success/5"
    : isStarted
      ? "border-brand/50 bg-brand/5"
      : "border-border bg-card";

  return (
    <div
      className={`rounded-xl border p-5 transition-colors ${accent} ${
        isEmpty ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Nivå-emblem */}
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg font-bold text-lg ${
            isDone
              ? "bg-success text-success-foreground"
              : isStarted
                ? "bg-brand text-brand-foreground"
                : "bg-muted text-muted-foreground"
          }`}
        >
          {isDone ? <Check className="h-6 w-6" /> : `L${level}`}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h3 className="font-semibold text-foreground">
                Nivå {level} · {norTitle}
              </h3>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                {LEVEL_NAMES[level]}
              </div>
            </div>
            <div className="text-xs tabular-nums text-muted-foreground">
              {isEmpty ? "Ingen oppgaver" : `${solved} / ${total} løst`}
            </div>
          </div>

          <p className="mt-2 text-sm text-foreground/80 leading-relaxed">{intro}</p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {topics.map((t) => (
              <Badge key={t} variant="secondary" className="text-[10px]">
                {t}
              </Badge>
            ))}
          </div>

          {/* Fremgangsbar */}
          {!isEmpty && (
            <div className="mt-4 h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full transition-all ${
                  isDone ? "bg-success" : "bg-brand"
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
          )}

          {/* Knapp */}
          <div className="mt-4">
            {isEmpty ? (
              <Button size="sm" variant="outline" disabled>
                <Lock className="h-3.5 w-3.5 mr-1" />
                Ingen oppgaver i {datasetId}
              </Button>
            ) : (
              <Button asChild size="sm" variant={isStarted ? "default" : "outline"}>
                <Link
                  to="/practice"
                  search={{
                    level,
                    dataset: datasetId,
                    id: firstUnsolvedId ?? undefined,
                  }}
                >
                  {isDone ? (
                    <>
                      Repeter <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </>
                  ) : isStarted ? (
                    <>
                      Fortsett <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5 mr-1" />
                      Start nivå {level}
                    </>
                  )}
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
