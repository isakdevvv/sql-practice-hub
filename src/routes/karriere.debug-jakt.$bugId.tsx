import { createFileRoute, Link, notFound, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Eye,
  Lightbulb,
  Play,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { PythonEditor } from "@/components/python/PythonEditor";
import { SqlEditor } from "@/components/SqlEditor";
import { DEBUG_BUGS, KATEGORI_LABEL, findBug, type DebugBug } from "@/lib/karriere/debug-bugs";
import { runTests, type TestRunOutcome } from "@/lib/karriere/debug-tester";
import {
  fellesStat,
  getAttempt,
  loadDebugProgress,
  updateAttempt,
} from "@/lib/karriere/debug-progress";

export const Route = createFileRoute("/karriere/debug-jakt/$bugId")({
  head: ({ params }) => {
    const bug = findBug((params as { bugId: string }).bugId);
    return {
      meta: [
        {
          title: bug
            ? `${bug.tittel} — Debugging-jakt`
            : "Debugging-jakt",
        },
      ],
    };
  },
  component: DebugBugPage,
  loader: ({ params }) => {
    if (!findBug(params.bugId)) throw notFound();
  },
});

function DebugBugPage() {
  const { bugId } = useParams({ from: "/karriere/debug-jakt/$bugId" });
  const bug = findBug(bugId);
  if (!bug) return null;
  return <DebugBugInner bug={bug} />;
}

function DebugBugInner({ bug }: { bug: DebugBug }) {
  const [kode, setKode] = useState<string>(bug.kode);
  const [outcome, setOutcome] = useState<TestRunOutcome | null>(null);
  const [kjorer, setKjorer] = useState(false);
  const [hintVist, setHintVist] = useState(false);
  const [fasitVist, setFasitVist] = useState(false);
  const [forklaringVist, setForklaringVist] = useState(false);

  // Timer
  const startRef = useRef<number>(Date.now());
  const [tikkende, setTikkende] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTikkende((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // Forsøk og status fra lagret progress.
  const initialAttempt = useMemo(() => {
    if (typeof window === "undefined") return null;
    return getAttempt(loadDebugProgress(), bug.id);
  }, [bug.id]);
  const [forsok, setForsok] = useState<number>(initialAttempt?.forsok ?? 0);
  const [alleredeBeseiret, setAlleredeBeseiret] = useState<boolean>(initialAttempt?.lost ?? false);

  // Reset state når brukeren navigerer til en ny bug.
  useEffect(() => {
    setKode(bug.kode);
    setOutcome(null);
    setHintVist(false);
    setFasitVist(false);
    setForklaringVist(false);
    startRef.current = Date.now();
    setTikkende(0);
    const a = getAttempt(loadDebugProgress(), bug.id);
    setForsok(a.forsok);
    setAlleredeBeseiret(a.lost);
  }, [bug.id, bug.kode]);

  const elapsedSec = Math.floor((Date.now() - startRef.current) / 1000);

  async function kjorTester() {
    if (kjorer) return;
    setKjorer(true);
    setOutcome(null);
    try {
      const r = await runTests(bug, kode);
      setOutcome(r);
      const nyForsok = forsok + 1;
      setForsok(nyForsok);
      const patch: Parameters<typeof updateAttempt>[1] = { forsok: nyForsok };
      if (r.ok && !alleredeBeseiret) {
        patch.lost = true;
        patch.tidMs = Date.now() - startRef.current;
        patch.lostAt = new Date().toISOString();
        setAlleredeBeseiret(true);
        setForklaringVist(true); // vis forklaring automatisk ved seier
      }
      updateAttempt(bug.id, patch);
    } finally {
      setKjorer(false);
    }
  }

  function visHint() {
    setHintVist(true);
    updateAttempt(bug.id, { hintBrukt: true });
  }

  function visFasit() {
    setFasitVist(true);
    updateAttempt(bug.id, { fasitBrukt: true });
  }

  function brukFasit() {
    setKode(bug.fasit);
  }

  function tilbakestill() {
    setKode(bug.kode);
    setOutcome(null);
  }

  const hintTilgjengelig = forsok >= 3 || hintVist;
  const fasitTilgjengelig = forsok >= 5 || fasitVist || alleredeBeseiret;

  const fellesAndel = useMemo(() => fellesStat(bug.id).andelUnder5, [bug.id]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="border-b border-border bg-card/30">
        <div className="container mx-auto px-4 py-3 flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            Hjem
          </Link>
          <span>/</span>
          <Link to="/karriere/debug-jakt" className="hover:text-foreground">
            Debugging-jakt
          </Link>
          <span>/</span>
          <span className="text-foreground">{bug.tittel}</span>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-destructive font-semibold mb-1">
              {KATEGORI_LABEL[bug.kategori]} · vanskelig {bug.vanskelighet}/5
            </div>
            <h1 className="text-2xl font-bold tracking-tight">{bug.tittel}</h1>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Clock className="size-4" /> {elapsedSec}s
            </div>
            <div>Forsøk: {forsok}</div>
            {alleredeBeseiret && (
              <div className="flex items-center gap-1.5 text-success">
                <CheckCircle2 className="size-4" /> Løst
              </div>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-muted/20 p-4 mb-5">
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">
            Hva koden skal gjøre
          </div>
          <p className="text-sm leading-relaxed">{bug.expected}</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <div className="rounded-lg border border-border bg-card/30 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/30">
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                Kode ({bug.sprak})
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={tilbakestill}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  <RotateCcw className="size-3" /> Tilbakestill
                </button>
                <button
                  type="button"
                  onClick={kjorTester}
                  disabled={kjorer}
                  className="rounded bg-brand text-brand-foreground text-xs px-3 py-1.5 font-semibold flex items-center gap-1 disabled:opacity-50"
                >
                  <Play className="size-3" />
                  {kjorer ? "Kjører…" : "Kjør tester"}
                </button>
              </div>
            </div>
            <div className="h-[420px]">
              {bug.sprak === "python" ? (
                <PythonEditor value={kode} onChange={setKode} onRun={kjorTester} />
              ) : (
                <SqlEditor value={kode} onChange={setKode} onRun={kjorTester} />
              )}
            </div>
          </div>

          <div className="space-y-3">
            <ResultatPanel outcome={outcome} kjorer={kjorer} />

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={visHint}
                disabled={!hintTilgjengelig}
                className="rounded border border-border bg-card text-xs px-3 py-1.5 flex items-center gap-1 disabled:opacity-50"
                title={hintTilgjengelig ? "" : "Tilgjengelig etter 3 mislykkede forsøk"}
              >
                <Lightbulb className="size-3" />
                {hintVist ? "Hint vist" : `Vis hint${forsok < 3 ? ` (${3 - forsok} forsøk igjen)` : ""}`}
              </button>
              <button
                type="button"
                onClick={visFasit}
                disabled={!fasitTilgjengelig}
                className="rounded border border-border bg-card text-xs px-3 py-1.5 flex items-center gap-1 disabled:opacity-50"
                title={fasitTilgjengelig ? "" : "Tilgjengelig etter 5 mislykkede forsøk"}
              >
                <Eye className="size-3" />
                {fasitVist ? "Fasit vist" : `Vis fasit${forsok < 5 ? ` (${5 - forsok} forsøk igjen)` : ""}`}
              </button>
            </div>

            {hintVist && <HintPanel bug={bug} />}
            {fasitVist && <FasitPanel bug={bug} onBruk={brukFasit} />}
            {forklaringVist && <ForklaringPanel bug={bug} fellesAndel={fellesAndel} />}
          </div>
        </div>

        <RelaterteBugs current={bug} />
      </main>
    </div>
  );
}

function ResultatPanel({
  outcome,
  kjorer,
}: {
  outcome: TestRunOutcome | null;
  kjorer: boolean;
}) {
  if (kjorer) {
    return (
      <div className="rounded-lg border border-border bg-card/30 p-4 text-sm text-muted-foreground">
        Kjører tester…
      </div>
    );
  }
  if (!outcome) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card/20 p-4 text-sm text-muted-foreground">
        Trykk «Kjør tester» for å sjekke koden. Tester kjører lokalt i nettleseren (Pyodide for
        Python, SQLite-backend for SQL).
      </div>
    );
  }
  if (outcome.runtimeError) {
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4">
        <div className="font-semibold text-sm mb-1 flex items-center gap-1.5 text-destructive">
          <XCircle className="size-4" /> Koden krasjet
        </div>
        <pre className="text-xs font-mono whitespace-pre-wrap break-all">
          {outcome.runtimeError}
        </pre>
      </div>
    );
  }
  return (
    <div
      className={`rounded-lg border p-4 ${
        outcome.ok ? "border-success/40 bg-success/5" : "border-destructive/40 bg-destructive/5"
      }`}
    >
      <div className="font-semibold text-sm mb-3 flex items-center gap-1.5">
        {outcome.ok ? (
          <>
            <CheckCircle2 className="size-4 text-success" /> Alle tester passerte
          </>
        ) : (
          <>
            <XCircle className="size-4 text-destructive" />
            {outcome.results.filter((r) => r.passerte).length}/{outcome.results.length} tester
            passerte
          </>
        )}
      </div>
      <ul className="space-y-1.5">
        {outcome.results.map((r, i) => (
          <li key={i} className="text-xs">
            <div className="flex items-start gap-1.5">
              {r.passerte ? (
                <CheckCircle2 className="size-3.5 text-success mt-0.5 shrink-0" />
              ) : (
                <XCircle className="size-3.5 text-destructive mt-0.5 shrink-0" />
              )}
              <div className="min-w-0">
                <div>{r.beskrivelse}</div>
                {!r.passerte && (
                  <div className="text-muted-foreground font-mono mt-1 break-all">
                    {r.feilmelding ? (
                      <>feil: {r.feilmelding}</>
                    ) : (
                      <>
                        forventet: <code>{JSON.stringify(r.forventet)}</code>
                        <br />
                        fikk: <code>{JSON.stringify(r.faktisk)}</code>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function HintPanel({ bug }: { bug: DebugBug }) {
  return (
    <div className="rounded-lg border border-warning/40 bg-warning/5 p-4">
      <div className="text-xs uppercase tracking-wider font-semibold text-warning mb-1 flex items-center gap-1.5">
        <Lightbulb className="size-3" /> Hint
      </div>
      <p className="text-sm">
        Denne bug-en er av kategorien{" "}
        <span className="font-semibold">{KATEGORI_LABEL[bug.kategori]}</span>. Se nøye på{" "}
        {hintTekst(bug.kategori)}.
      </p>
    </div>
  );
}

function hintTekst(k: DebugBug["kategori"]): string {
  switch (k) {
    case "off-by-one":
      return "indeksgrenser, range()-argumenter og om endepunkter inkluderes eller ekskluderes";
    case "scoping":
      return "hvor variabler defineres og hvilken scope de tilhører — særlig i lambdaer og loops";
    case "mutable-default":
      return "default-argumenter for funksjoner (de evalueres bare én gang)";
    case "float-presisjon":
      return "sammenligning av flyttall — == er sjelden trygt";
    case "concurrency":
      return "rekkefølgen på await/async — kjører det egentlig parallelt?";
    case "performance":
      return "kompleksitet — er det en loop inni en loop som kan unngås?";
    case "rekursjon":
      return "base case — finnes den, og treffes den faktisk?";
    case "case-sensitivitet":
      return "hvordan tekst-nøkler normaliseres ved skriving vs. lesing";
    case "sql-join":
      return "join-betingelsen — FK vs PK, og om WHERE rammer JOIN-typen";
    case "sql-null":
      return "NULL-håndtering — aritmetikk, COUNT, IN/NOT IN";
    case "sql-group-by":
      return "kolonner i SELECT som ikke er aggregert eller gruppert";
    case "sql-edge-case":
      return "WHERE vs HAVING, DISTINCT, og om aggregatet faktisk er det du tror";
  }
}

function FasitPanel({ bug, onBruk }: { bug: DebugBug; onBruk: () => void }) {
  return (
    <div className="rounded-lg border border-border bg-card/30 p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs uppercase tracking-wider font-semibold text-muted-foreground flex items-center gap-1.5">
          <Eye className="size-3" /> Fasit
        </div>
        <button
          type="button"
          onClick={onBruk}
          className="text-xs underline text-brand"
        >
          Sett inn i editoren
        </button>
      </div>
      <pre className="text-xs font-mono whitespace-pre-wrap overflow-auto bg-background/60 rounded p-2 border border-border">
        {bug.fasit}
      </pre>
    </div>
  );
}

function ForklaringPanel({
  bug,
  fellesAndel,
}: {
  bug: DebugBug;
  fellesAndel: number;
}) {
  return (
    <div className="rounded-lg border border-brand/40 bg-brand/5 p-4">
      <div className="text-xs uppercase tracking-wider font-semibold text-brand mb-2">
        Hva var bug-en?
      </div>
      <p className="text-sm leading-relaxed whitespace-pre-wrap">{bug.bugForklaring}</p>
      <p className="text-xs text-muted-foreground mt-3">
        {fellesAndel}% av brukere fant denne bug-en på under 5 forsøk.
      </p>
    </div>
  );
}

function RelaterteBugs({ current }: { current: DebugBug }) {
  const samme = DEBUG_BUGS.filter((b) => b.kategori === current.kategori && b.id !== current.id);
  if (samme.length === 0 && !current.beslektetLitteratur) return null;
  return (
    <div className="mt-8 rounded-lg border border-border bg-card/30 p-5">
      <h3 className="text-base font-semibold mb-3">Beslektet</h3>
      {samme.length > 0 && (
        <>
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
            Andre bugs i samme kategori
          </div>
          <ul className="space-y-1 text-sm mb-4">
            {samme.map((b) => (
              <li key={b.id}>
                <Link
                  to="/karriere/debug-jakt/$bugId"
                  params={{ bugId: b.id }}
                  className="text-brand hover:underline flex items-center gap-1"
                >
                  <ArrowLeft className="size-3 rotate-180" /> {b.tittel}
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
      {current.beslektetLitteratur && current.beslektetLitteratur.length > 0 && (
        <>
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
            Beslektet litteratur
          </div>
          <ul className="space-y-1 text-sm">
            {current.beslektetLitteratur.map((l) => (
              <li key={l.slug}>
                <Link
                  to="/stack/$slug"
                  params={{ slug: l.slug }}
                  className="text-brand hover:underline"
                >
                  {l.tittel}
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
