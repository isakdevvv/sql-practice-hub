import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bug, CheckCircle2, Circle, Clock, Target, Trophy } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { DEBUG_BUGS, KATEGORI_LABEL, type BugKategori } from "@/lib/karriere/debug-bugs";
import {
  computeStats,
  loadDebugProgress,
  type DebugProgress,
} from "@/lib/karriere/debug-progress";

export const Route = createFileRoute("/karriere/debug-jakt/")({
  head: () => ({
    meta: [
      { title: "Debugging-jakt — finn og fiks 20 realistiske bugs" },
      {
        name: "description",
        content:
          "Tren på debugging av ekte programmeringsfeil: off-by-one, mutable defaults, late-binding closures, NULL-aritmetikk, LEFT JOIN-feller. 12 Python + 8 SQL.",
      },
    ],
  }),
  component: DebugJaktIndex,
});

function DebugJaktIndex() {
  const [progress, setProgress] = useState<DebugProgress>({ attempts: {} });
  useEffect(() => setProgress(loadDebugProgress()), []);

  const stats = computeStats(progress);
  const python = DEBUG_BUGS.filter((b) => b.sprak === "python");
  const sql = DEBUG_BUGS.filter((b) => b.sprak === "sql");

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="border-b border-border bg-card/30">
        <div className="container mx-auto px-4 py-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            Hjem
          </Link>
          <span>/</span>
          <span className="text-foreground">Karriere — Debugging-jakt</span>
        </div>
      </div>

      <main className="container mx-auto px-4 py-10 max-w-5xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-destructive font-semibold mb-2 flex items-center gap-2">
            <Bug className="size-3.5" /> Karriere-spor · modul 2
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-3">Debugging-jakt</h1>
          <p className="text-muted-foreground leading-relaxed max-w-3xl">
            20 buggy programmer venter på deg. Hver bug er en feil ekte utviklere har skrevet —
            off-by-one i en range, mutable default-argument, late-binding closure, LEFT JOIN som
            stille blir til INNER JOIN på grunn av en WHERE. Finn bug-en, fiks den, og kjør
            testene. Du blir bedre på debugging ved å se mange bugs, ikke ved å skrive mer kode
            fra null.
          </p>
        </div>

        <StatsPanel stats={stats} />

        <h2 className="text-xl font-semibold mt-12 mb-4">Python-bugs ({python.length})</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {python.map((b) => (
            <BugCard key={b.id} bug={b} progress={progress} />
          ))}
        </div>

        <h2 className="text-xl font-semibold mt-10 mb-4">SQL-bugs ({sql.length})</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {sql.map((b) => (
            <BugCard key={b.id} bug={b} progress={progress} />
          ))}
        </div>

        <KategoriPanel stats={stats} />
      </main>
    </div>
  );
}

function StatsPanel({ stats }: { stats: ReturnType<typeof computeStats> }) {
  const pct = Math.round((stats.loste / stats.totalt) * 100);
  return (
    <div className="rounded-xl border border-border bg-card/40 p-5">
      <div className="grid sm:grid-cols-4 gap-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1.5">
            <Trophy className="size-3.5" /> Nivå
          </div>
          <div className="text-lg font-semibold">{stats.jegerNiva.navn}</div>
          <div className="text-xs text-muted-foreground">{stats.jegerNiva.beskrivelse}</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1.5">
            <Target className="size-3.5" /> Løst
          </div>
          <div className="text-lg font-semibold">
            {stats.loste}/{stats.totalt}
          </div>
          <div className="text-xs text-muted-foreground">{pct}% ferdig</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1.5">
            <Clock className="size-3.5" /> Snitt-tid
          </div>
          <div className="text-lg font-semibold">
            {stats.snittTidSec ? `${stats.snittTidSec}s` : "—"}
          </div>
          <div className="text-xs text-muted-foreground">per løste bug</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1.5">
            <Bug className="size-3.5" /> Snitt-forsøk
          </div>
          <div className="text-lg font-semibold">
            {stats.snittForsok ? stats.snittForsok : "—"}
          </div>
          <div className="text-xs text-muted-foreground">test-kjøringer per løste bug</div>
        </div>
      </div>
      <div className="mt-4">
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-success transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function BugCard({
  bug,
  progress,
}: {
  bug: (typeof DEBUG_BUGS)[number];
  progress: DebugProgress;
}) {
  const a = progress.attempts[bug.id];
  const lost = a?.lost ?? false;
  return (
    <Link
      to="/karriere/debug-jakt/$bugId"
      params={{ bugId: bug.id }}
      className={`group rounded-lg border p-4 transition-colors hover:bg-accent ${
        lost ? "border-success/40 bg-success/5" : "border-border bg-card/40"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          {lost ? (
            <CheckCircle2 className="size-5 text-success" />
          ) : (
            <Circle className="size-5 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium group-hover:underline truncate">{bug.tittel}</div>
          <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2 flex-wrap">
            <span className="rounded bg-muted px-1.5 py-0.5 font-mono">
              {bug.sprak}
            </span>
            <span>{KATEGORI_LABEL[bug.kategori]}</span>
            <span>·</span>
            <span>vanskelig {bug.vanskelighet}/5</span>
            {a && a.forsok > 0 && !lost && (
              <>
                <span>·</span>
                <span>{a.forsok} forsøk</span>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

function KategoriPanel({ stats }: { stats: ReturnType<typeof computeStats> }) {
  if (stats.loste === 0) return null;
  return (
    <div className="mt-12 rounded-xl border border-border bg-card/40 p-5">
      <h3 className="text-base font-semibold mb-3">Per kategori</h3>
      {stats.vanskeligsteKategori && (
        <p className="text-sm text-muted-foreground mb-4">
          Du sliter mest med{" "}
          <span className="font-semibold text-foreground">
            {KATEGORI_LABEL[stats.vanskeligsteKategori]}
          </span>
          -bugs — flest forsøk per løste bug i denne kategorien.
        </p>
      )}
      <div className="grid sm:grid-cols-2 gap-2">
        {stats.perKategori
          .slice()
          .sort((a, b) => b.loste / b.totalt - a.loste / a.totalt)
          .map((k) => (
            <div
              key={k.kategori}
              className="flex items-center justify-between rounded border border-border bg-background/50 px-3 py-2 text-sm"
            >
              <span>{KATEGORI_LABEL[k.kategori as BugKategori]}</span>
              <span className="text-xs text-muted-foreground">
                {k.loste}/{k.totalt}
                {k.snittForsok ? ` · ${k.snittForsok} forsøk` : ""}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}
