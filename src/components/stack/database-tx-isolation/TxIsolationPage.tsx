import { Link } from "@tanstack/react-router";
import { Lightbulb, ArrowRight } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { RelatedVisualizers } from "@/components/stack/RelatedVisualizers";
import { lazy, Suspense } from "react";
import { VisualizerSkeleton } from "@/components/visualizer-shell";

const ConcurrentTransactionSim = lazy(() =>
  import("@/components/stack/database-tx-isolation/ConcurrentTransactionSim").then(
    (m) => ({ default: m.ConcurrentTransactionSim }),
  ),
);
const AnomalyDemoPresets = lazy(() =>
  import("@/components/stack/database-tx-isolation/AnomalyDemoPresets").then(
    (m) => ({ default: m.AnomalyDemoPresets }),
  ),
);
const IsolationLevelMatrix = lazy(() =>
  import("@/components/stack/database-tx-isolation/IsolationLevelMatrix").then(
    (m) => ({ default: m.IsolationLevelMatrix }),
  ),
);
const LockTimingViz = lazy(() =>
  import("@/components/stack/database-tx-isolation/LockTimingViz").then((m) => ({
    default: m.LockTimingViz,
  })),
);

const STEPS = [
  { title: "Sandbox — to transaksjoner", anchor: "sandbox" },
  { title: "Anomali-presets — fire klassikere", anchor: "presets" },
  { title: "Matrise — isolation × anomali", anchor: "matrix" },
  { title: "Lås-tidslinje — låser i tid", anchor: "locks" },
  { title: "Oppsummering", anchor: "oppsummering" },
];

export function TxIsolationPage() {
  return (
    <StackPageShell title="Transaksjons-isolasjonsnivå" group="stack">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            Database · Concurrency · Anomalier
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Transaksjons-isolasjonsnivå — dirty read, lost update, phantom read
          </h1>
          <p className="mt-3 text-muted-foreground">
            Når to klienter snakker med samme database samtidig, kan rart skje:
            verdier som forsvinner, rader som «dukker opp», beregninger som er
            ut av sync med virkeligheten. Isolasjonsnivå (eng:{" "}
            <em>isolation level</em>) er knappen som velger hvor strikt
            DB-en skal beskytte deg — og hvor mye ytelse du gir opp.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Mål for denne lesjonen:</span> Du
              skal kunne se anomalien fysisk skje i sandboxen, forstå hvilke
              låser som styrer det, og kunne velge riktig isolasjonsnivå for
              en gitt situasjon. Tekst-pensum finner du under{" "}
              <Link
                to="/stack/$slug"
                params={{ slug: "transaksjoner" }}
                className="text-brand hover:underline"
              >
                Transaksjoner — ACID og isolation
              </Link>
              .
            </div>
          </div>
        </div>

        <CourseOutline courseId="tx-isolation" steps={STEPS} />

        {/* Sandbox */}
        <section id="sandbox" className="mb-12">
          <h2 className="text-xl font-semibold mb-3">
            1. Sandbox — to transaksjoner side ved side
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Velg isolasjonsnivå på toppen, og kjør operasjoner for{" "}
            <span className="font-semibold text-emerald-600">A</span> og{" "}
            <span className="font-semibold text-sky-600">B</span> i den
            rekkefølgen du vil. Tabellene viser hva hver transaksjon faktisk
            ser, og lock-panelet midt på viser låsene i sanntid. Når en anomali
            oppstår, highlightes den rødt.
          </p>
          <Suspense fallback={<VisualizerSkeleton />}>
            <ConcurrentTransactionSim />
          </Suspense>
          <div className="mt-3 text-[11px] text-muted-foreground">
            <strong>Tips:</strong> Start med READ COMMITTED og gjør{" "}
            <code>UPDATE id=1</code> i A, deretter <code>SELECT id=1</code> i
            B. B blokkeres til A committer. Bytt deretter til READ UNCOMMITTED
            og gjenta — nå leser B den ucommittede verdien (dirty read).
          </div>
        </section>

        {/* Presets */}
        <section id="presets" className="mb-12">
          <h2 className="text-xl font-semibold mb-3">
            2. Anomali-presets — fire klassikere
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Hver av de fire mest beryktede transaksjons-anomaliene kommer som et
            ferdig preset. Tabellen viser hva som faktisk skjer på hvert
            isolasjonsnivå (anomali, blokkert, eller forhindret), og «spill av»
            laster sekvensen inn i sandboxen for nivået du valgte.
          </p>
          <Suspense fallback={<VisualizerSkeleton />}>
            <AnomalyDemoPresets />
          </Suspense>
        </section>

        {/* Matrix */}
        <section id="matrix" className="mb-12">
          <h2 className="text-xl font-semibold mb-3">
            3. Matrise — isolation × anomali
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Den klassiske 4×4-tabellen, men interaktiv. Hver celle har en
            mini-historie — klikk for å lese den.
          </p>
          <Suspense fallback={<VisualizerSkeleton />}>
            <IsolationLevelMatrix />
          </Suspense>
        </section>

        {/* Locks */}
        <section id="locks" className="mb-12">
          <h2 className="text-xl font-semibold mb-3">
            4. Lås-tidslinje — låser i tid
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Bytt mellom isolation levels og se hvordan låsene endrer
            karakter: hvor lenge holdes en S-lås? Når slippes X-låsen? Hva er
            forskjellen mellom en rad-lås og en range-lås? Det siste scenariet
            viser en klassisk deadlock — to UPDATE i motsatt rekkefølge — og
            hvordan DB-en velger et offer for å bryte syklusen.
          </p>
          <Suspense fallback={<VisualizerSkeleton />}>
            <LockTimingViz />
          </Suspense>
        </section>

        {/* Oppsummering */}
        <section id="oppsummering" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Oppsummering — én tabell å huske</h2>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-3 py-2">Nivå</th>
                  <th className="text-left font-semibold px-3 py-2 hidden sm:table-cell">
                    Forhindrer
                  </th>
                  <th className="text-left font-semibold px-3 py-2">Typisk bruk</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono text-brand text-xs">READ UNCOMMITTED</td>
                  <td className="px-3 py-2 hidden sm:table-cell text-xs">ingen</td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">
                    Sjelden. Logg-skanning, stats der presisjon ikke er kritisk.
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono text-brand text-xs">READ COMMITTED</td>
                  <td className="px-3 py-2 hidden sm:table-cell text-xs">dirty read</td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">
                    Default i Postgres/Oracle. Sweet spot for de fleste apper.
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono text-brand text-xs">REPEATABLE READ</td>
                  <td className="px-3 py-2 hidden sm:table-cell text-xs">dirty + non-repeatable</td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">
                    Default i MySQL/InnoDB. Konsistent snapshot per tx.
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono text-brand text-xs">SERIALIZABLE</td>
                  <td className="px-3 py-2 hidden sm:table-cell text-xs">alt — også phantom + lost update</td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">
                    Regnskap, bank, oppgjør. Krev retry-logikk i klienten.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-5 rounded-xl border border-border bg-card p-5 text-sm">
            <h3 className="font-semibold mb-2">Beslutningsregel</h3>
            <ol className="list-decimal pl-5 space-y-1 text-muted-foreground">
              <li>
                Trenger du å regne på lesninger og skrive tilbake? Bruk{" "}
                <code>SELECT ... FOR UPDATE</code> eller hev til{" "}
                <code>SERIALIZABLE</code>.
              </li>
              <li>
                Mange korte transaksjoner med lav konflikt-rate? <code>READ COMMITTED</code> + optimistisk
                versjonskolonne.
              </li>
              <li>
                Rapportering på snapshot? <code>REPEATABLE READ</code> gir et stabilt blikk uten å blokkere
                skriverne i moderne MVCC-baserte DB-er.
              </li>
              <li>
                Cross-row-invariant (sum, partisjonering, kvoter)? <code>SERIALIZABLE</code>. Periode.
              </li>
            </ol>
          </div>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Videre</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link
                to="/stack/$slug"
                params={{ slug: "transaksjoner" }}
                className="text-brand hover:underline"
              >
                Transaksjoner — ACID og isolation
              </Link>{" "}
              — tekst-pensum, ACID-bokstavene, savepoints, deadlock-forebygging.
            </li>
            <li>
              <Link to="/drag" className="text-brand hover:underline">
                Drag-oppgaver
              </Link>{" "}
              under «Transaksjoner» — ACID-bokstav-match, isolation-quiz, deadlock-scenarie.
              <ArrowRight className="inline h-3.5 w-3.5 ml-1" />
            </li>
          </ul>
        </div>

        <RelatedVisualizers slug="tx-isolation" />
      </div>
    </StackPageShell>
  );
}
