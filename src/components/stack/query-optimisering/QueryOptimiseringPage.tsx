import { Link } from "@tanstack/react-router";
import { ArrowRight, Lightbulb, AlertTriangle, GitMerge, Layers } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { QueryPlanVisualizer } from "@/components/stack/query-optimisering/QueryPlanVisualizer";
import { QueryLayersView } from "@/components/stack/query-optimisering/QueryLayersView";
import { RelatedVisualizers } from "@/components/stack/RelatedVisualizers";

// Course page for query optimization: parser/optimizer/executor, EXPLAIN,
// join algorithms, stats, common anti-patterns, partitioning + materialized views.
// Drag-øvelser under emnet "Query-optimisering".

const STEPS = [
  { title: "Plan-visualisator (interaktiv)", anchor: "plan-vis" },
  { title: "Tre faser: parse → optimize → execute", anchor: "faser" },
  { title: "Lese EXPLAIN-output", anchor: "explain" },
  { title: "Seq scan vs index scan", anchor: "scan-typer" },
  { title: "Join-algoritmer", anchor: "join-algo" },
  { title: "Statistikker og ANALYZE", anchor: "statistikker" },
  { title: "Vanlige anti-mønstre", anchor: "anti" },
  { title: "Partitioning kort", anchor: "partitioning" },
  { title: "Views og materialized views", anchor: "views" },
  { title: "Samme spørring fra flere vinkler", anchor: "vinkler" },
];

type Faser = { nr: string; navn: string; hva: string };
const FASER: Faser[] = [
  {
    nr: "1",
    navn: "Parse",
    hva:
      "Tekst → syntaks-tre. Sjekker grammatikk. Feiler ved skrivefeil i nøkkelord, manglende komma, ubalanserte parenteser.",
  },
  {
    nr: "2",
    navn: "Rewrite + Plan",
    hva:
      "Optimiseren vurderer flere ekvivalente planer (rekkefølge på JOIN, valg av scan-type, bruk av indeks). Hver plan estimeres med cost-modell basert på statistikker.",
  },
  {
    nr: "3",
    navn: "Execute",
    hva:
      "Den billigste planen kjøres mot dataene. Resultatrader strømmes tilbake til klienten — eventuelt med blokkerende operatorer som SORT eller HASH underveis.",
  },
];

type Algo = { navn: string; nårBra: string; eksempel: string };
const JOIN_ALGOS: Algo[] = [
  {
    navn: "Nested Loop Join",
    nårBra:
      "Den ytre tabellen er liten, og det finnes indeks på join-kolonnen i den indre. For hver ytre rad: indeks-oppslag.",
    eksempel: `EXPLAIN
SELECT * FROM Kunde k JOIN Ordre o ON o.kundenr = k.kundenr
WHERE k.kundenr = 5;
-- Nested Loop
--   ->  Index Scan on kunde k  (kundenr = 5)
--   ->  Index Scan on ordre o  (o.kundenr = k.kundenr)`,
  },
  {
    navn: "Hash Join",
    nårBra:
      "Begge sidene er middels-store, ingen passende indeks, ekv-join (=). Bygger en hash-tabell på den minste siden, skanner den andre.",
    eksempel: `EXPLAIN
SELECT * FROM Kunde k JOIN Ordre o USING (kundenr);
-- Hash Join
--   Hash Cond: (o.kundenr = k.kundenr)
--   ->  Seq Scan on ordre o
--   ->  Hash
--         ->  Seq Scan on kunde k`,
  },
  {
    navn: "Merge Join",
    nårBra:
      "Begge sidene allerede sortert på join-kolonnen (typisk via indeks). Effektiv på enorme tabeller.",
    eksempel: `EXPLAIN
SELECT * FROM A JOIN B ON A.id = B.aid
ORDER BY A.id;
-- Merge Join
--   Merge Cond: (a.id = b.aid)
--   ->  Index Scan on a_pkey
--   ->  Index Scan on b_aid_idx`,
  },
];

type AntiMønster = { navn: string; symptom: string; fix: string };
const ANTI: AntiMønster[] = [
  {
    navn: "N+1-spørringer",
    symptom:
      "App-kode kjører 1 spørring for å hente listen, så 1 spørring per rad for å hente relatert data. 100 kunder → 101 spørringer.",
    fix:
      "Hent alt i én JOIN, eller bruk eager loading i ORM (Django: select_related, prefetch_related). EXPLAIN-en din vises som korrekt — det er logikken på klientsiden som er feil.",
  },
  {
    navn: "SELECT *",
    symptom:
      "Trekker alle kolonner — også store TEXT/BLOB du ikke trenger. Hindrer covering index, øker nettverk-bruk, knekker når noen legger til en kolonne.",
    fix:
      "Spesifiser kolonner. <code>SELECT kundenr, navn FROM Kunde WHERE ...</code>",
  },
  {
    navn: "Ingen LIMIT på admin-query",
    symptom:
      "<code>SELECT * FROM logg</code> i prod returnerer 50 millioner rader, klienten OOMer, hele DB-en blir treg.",
    fix:
      "Alltid LIMIT i interaktive query. Bruk paginering (LIMIT/OFFSET) eller keyset-paginering (WHERE id &gt; last_id).",
  },
  {
    navn: "Funksjon på kolonne i WHERE",
    symptom:
      "Indeksen står stille. Klassisk: <code>WHERE YEAR(dato) = 2026</code> tvinger seq scan.",
    fix:
      "Skriv om: <code>WHERE dato BETWEEN '2026-01-01' AND '2026-12-31'</code>. Eller lag funksjons-indeks.",
  },
  {
    navn: "OR mellom kolonner",
    symptom:
      "Optimisten kan ikke bruke ett indeks-oppslag for begge sider — slår ofte over til full scan.",
    fix:
      "Skriv om til UNION ALL der hver gren bruker sin egen indeks.",
  },
  {
    navn: "DISTINCT som band-aid",
    symptom:
      "Spørringen returnerer duplikater du «fixer» med DISTINCT. Det skjuler at JOIN-en multipliserer rader.",
    fix:
      "Forstå hvor duplikatene kommer fra. Bytt til EXISTS, eller aggreger eksplisitt med GROUP BY.",
  },
];

export function QueryOptimiseringPage() {
  return (
    <StackPageShell title="Query-optimisering — EXPLAIN, joins og kost-modell" group="stack">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            Database · Ytelse
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Hvordan en SQL-motor faktisk kjører spørringen din
          </h1>
          <p className="mt-3 text-muted-foreground">
            Du skriver en deklarativ spørring («hva», ikke «hvordan»). DB-motoren
            oversetter den til en konkret plan: hvilken tabell skannes først, hvilken
            indeks brukes, hvilken join-algoritme, i hvilken rekkefølge. Forstår du
            EXPLAIN-output og hvilke valg motoren tar, kan du gjøre trege spørringer
            raske uten å endre datamodellen.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <Link to="/drag" className="text-brand hover:underline">
                drag-oppgavene
              </Link>{" "}
              har et sett under «Query-optimisering» — EXPLAIN-faser, join-type-match,
              ANALYZE-quiz og N+1-fix.
            </div>
          </div>
        </div>

        <CourseOutline courseId="query-optimisering" steps={STEPS} />

        {/* Plan-visualisator (interaktiv) */}
        <section id="plan-vis" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Plan-visualisator</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Velg modus og scenario. Trykk «Spill av» for å se executor-en gå
            nedenfra og opp i plan-treet — radene strømmer fra løvnodene
            (scans) opp mot rota. Hver operator-boks viser estimert kost,
            estimat-rader og faktiske rader.
          </p>
          <QueryPlanVisualizer />
        </section>

        {/* Faser */}
        <section id="faser" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Tre faser: parse → optimize → execute</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Hver SQL-spørring går gjennom samme tre-stegs maskineri. Eksamen spør
            ofte etter rekkefølgen og hva som skjer i hvert steg.
          </p>
          <div className="space-y-3">
            {FASER.map((f) => (
              <div key={f.nr} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand text-xs font-bold">
                    {f.nr}
                  </span>
                  <h3 className="font-semibold text-sm">{f.navn}</h3>
                </div>
                <p className="text-xs text-muted-foreground">{f.hva}</p>
              </div>
            ))}
          </div>
          <pre className="mt-4 font-mono text-xs overflow-x-auto whitespace-pre rounded bg-background border border-border p-3">{`-- Du skriver:
SELECT k.navn, SUM(o.total)
FROM Kunde k JOIN Ordre o USING (kundenr)
WHERE k.by = 'Tromsø'
GROUP BY k.navn;

-- Motoren vurderer (forenklet):
-- Plan A: Seq Scan Kunde + Hash Join + Seq Scan Ordre + HashAggregate
-- Plan B: Index Scan idx_by + Nested Loop + Index Scan idx_kundenr + Sort + GroupAggregate
-- Plan C: ...
-- Velger den med lavest cost-estimat.`}</pre>
        </section>

        {/* EXPLAIN */}
        <section id="explain" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Lese EXPLAIN-output</h2>
          <p className="text-sm text-muted-foreground mb-3">
            <code>EXPLAIN</code> viser planen uten å kjøre den.{" "}
            <code>EXPLAIN ANALYZE</code> kjører den og tilbakerapporterer faktiske
            tider og rad-tall. Les den nedenfra og opp — innerste operasjon kjører
            først, resultatet bobler opp.
          </p>
          <pre className="font-mono text-xs overflow-x-auto whitespace-pre rounded bg-background border border-border p-3">{`EXPLAIN ANALYZE
SELECT k.navn, SUM(o.total) AS sum_total
FROM Kunde k JOIN Ordre o USING (kundenr)
WHERE k.by = 'Tromsø'
GROUP BY k.navn;

-- Postgres-output:
HashAggregate  (cost=125.50..130.00 rows=50 width=44)
                (actual time=2.310..2.345 rows=47 loops=1)
  Group Key: k.navn
  ->  Hash Join  (cost=10.50..120.00 rows=1000 width=20)
                  (actual time=0.310..1.820 rows=987 loops=1)
        Hash Cond: (o.kundenr = k.kundenr)
        ->  Seq Scan on ordre o  (cost=0.00..80.00 rows=4000 width=12)
                                   (actual time=0.012..0.580 rows=4000 loops=1)
        ->  Hash  (cost=9.00..9.00 rows=120 width=16)
              ->  Index Scan using idx_kunde_by on kunde k
                    (cost=0.42..9.00 rows=120 width=16)
                    Index Cond: (by = 'Tromsø')
Planning Time: 0.245 ms
Execution Time: 2.401 ms`}</pre>
          <div className="mt-4 rounded-lg border border-border bg-card p-4 text-sm">
            <strong>Hva du leter etter:</strong>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-xs">
              <li>
                <strong>cost</strong> — startup-cost..total-cost (estimat). Bare relativ — sammenlign planer.
              </li>
              <li>
                <strong>rows</strong> (estimat) vs <strong>actual rows</strong>: stort avvik betyr stale statistikk.
              </li>
              <li>
                <strong>loops</strong>: hvor mange ganger denne noden kjørte. N+1 viser seg som høy loops-verdi.
              </li>
              <li>
                <strong>actual time</strong>: bruk denne for å finne flaskehalsen.
              </li>
            </ul>
          </div>
        </section>

        {/* Scan typer */}
        <section id="scan-typer" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Seq scan vs index scan</h2>
          <p className="text-sm text-muted-foreground mb-3">
            <strong>Seq Scan</strong> (full table scan) leser hele tabellen.{" "}
            <strong>Index Scan</strong> går via indekstreet og henter bare matchende
            rader. Trolig vs antagelig: når selektivitet er høy (få matchende rader),
            er index scan raskere. Når 50%+ av tabellen matcher, kan seq scan
            faktisk være raskere — færre random IO-er.
          </p>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2">Plan</th>
                  <th className="text-left font-semibold px-4 py-2">Når valgt</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand text-xs">Seq Scan</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    Liten tabell, eller spørringen henter de fleste radene.
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand text-xs">Index Scan</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    Få matchende rader, indeks tilgjengelig på WHERE-kolonnen.
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand text-xs">Index Only Scan</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    Alle kolonner spørringen trenger ligger i indeksen (covering).
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand text-xs">Bitmap Index Scan</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    Middels selektivitet — bygger bitmap over kandidat-blokker, leser dem i rekkefølge.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Join algoritmer */}
        <section id="join-algo" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Tre join-algoritmer</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Optimisten velger algoritme basert på tabell-størrelse, indekser og
            sort-rekkefølge. Du ser navnet direkte i EXPLAIN.
          </p>
          <div className="space-y-4">
            {JOIN_ALGOS.map((a) => (
              <div key={a.navn} className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-2 mb-2">
                  <GitMerge className="h-4 w-4 text-brand" />
                  <h3 className="font-semibold">{a.navn}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{a.nårBra}</p>
                <pre className="font-mono text-xs overflow-x-auto whitespace-pre rounded bg-background border border-border p-3">
                  {a.eksempel}
                </pre>
              </div>
            ))}
          </div>
        </section>

        {/* Statistikker */}
        <section id="statistikker" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Statistikker og ANALYZE</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Optimisten estimerer rad-tall ved å slå opp i statistikk-tabellene: hvor
            mange rader har tabellen, hvor mange distinkte verdier i hver kolonne,
            histogram over verdifordeling. Disse oppdateres ikke automatisk på hver
            INSERT — DB-en gjør det periodisk eller manuelt.
          </p>
          <pre className="font-mono text-xs overflow-x-auto whitespace-pre rounded bg-background border border-border p-3">{`-- Tving oppdatering av statistikker
ANALYZE Ordre;                         -- Postgres
ANALYZE TABLE Ordre;                   -- MySQL
UPDATE STATISTICS Ordre;               -- SQL Server

-- Symptom på stale statistikk:
-- EXPLAIN: rows=10        (estimat)
-- ANALYZE: actual rows=8400
-- Forskjell på 1000x → optimisten velger feil plan
-- (typisk: hash join på det den tror er liten side,
--  men den var faktisk stor → OOM eller spill til disk)`}</pre>
          <div className="mt-4 rounded-lg border border-border bg-card p-4 text-sm">
            <strong>Når kjøre ANALYZE manuelt:</strong>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-xs">
              <li>Rett etter en stor batch-import.</li>
              <li>Etter en stor sletting.</li>
              <li>Når EXPLAIN viser stort rows-avvik.</li>
              <li>Etter at du har lagt til en ny indeks (på noen DB-er).</li>
            </ul>
          </div>
        </section>

        {/* Anti-mønstre */}
        <section id="anti" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Seks anti-mønstre i SQL</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Klassiske feller som gjør spørringer trege uten at det er DB-ens skyld.
            Lær symptomene og fixene utenat.
          </p>
          <div className="space-y-3">
            {ANTI.map((p) => (
              <div key={p.navn} className="rounded-xl border border-amber-500/40 bg-amber-500/5 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-amber-700 dark:text-amber-400" />
                  <h3 className="font-semibold text-sm">{p.navn}</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  <strong>Symptom:</strong>{" "}
                  <span dangerouslySetInnerHTML={{ __html: p.symptom }} />
                </p>
                <p className="text-xs text-muted-foreground">
                  <strong>Fix:</strong>{" "}
                  <span dangerouslySetInnerHTML={{ __html: p.fix }} />
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Partitioning */}
        <section id="partitioning" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Partitioning — del store tabeller i biter</h2>
          <p className="text-sm text-muted-foreground mb-3">
            En partisjonert tabell ser ut som én tabell, men er fysisk lagret i
            flere underliggende biter (etter dato, kunde-id, region). DB-en kan
            hoppe over partisjoner som ikke matcher WHERE (<em>partition pruning</em>).
            Også nyttig for vedlikehold: drop hele 2022-partisjonen i én operasjon.
          </p>
          <pre className="font-mono text-xs overflow-x-auto whitespace-pre rounded bg-background border border-border p-3">{`-- Postgres-eksempel
CREATE TABLE Logg (
  id BIGINT,
  ts TIMESTAMP NOT NULL,
  melding TEXT
) PARTITION BY RANGE (ts);

CREATE TABLE Logg_2025 PARTITION OF Logg
  FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
CREATE TABLE Logg_2026 PARTITION OF Logg
  FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');

-- Spørringen leser KUN 2026-partisjonen:
SELECT * FROM Logg WHERE ts > '2026-05-01';
-- EXPLAIN: -> Seq Scan on Logg_2026 ...  (Logg_2025 ble pruned)`}</pre>
        </section>

        {/* Views */}
        <section id="views" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Views og materialized views</h2>
          <p className="text-sm text-muted-foreground mb-3">
            En <strong>view</strong> er en navngitt SELECT du kan spørre mot som om
            den var en tabell. Den lagrer ikke data — kjøres på nytt hver gang.{" "}
            <strong>Materialized view</strong> lagrer resultatet på disk og må
            refreshes manuelt (eller på intervall).
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 mb-2">
                <Layers className="h-4 w-4 text-brand" />
                <h3 className="font-semibold text-sm">View — alltid fersk, alltid kjørt</h3>
              </div>
              <pre className="font-mono text-xs overflow-x-auto whitespace-pre rounded bg-background border border-border p-3">{`CREATE VIEW kunde_oversikt AS
SELECT k.kundenr, k.navn,
       COUNT(o.ordrenr) AS antall_ordrer,
       SUM(o.total) AS sum_total
FROM Kunde k LEFT JOIN Ordre o USING (kundenr)
GROUP BY k.kundenr, k.navn;

-- Vanlig spørring:
SELECT * FROM kunde_oversikt WHERE sum_total > 10000;
-- Hele SELECT-en bak view-en kjøres på nytt.`}</pre>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 mb-2">
                <Layers className="h-4 w-4 text-success" />
                <h3 className="font-semibold text-sm">Materialized — cachet til disk</h3>
              </div>
              <pre className="font-mono text-xs overflow-x-auto whitespace-pre rounded bg-background border border-border p-3">{`CREATE MATERIALIZED VIEW kunde_oversikt_mv AS
SELECT k.kundenr, k.navn,
       COUNT(o.ordrenr) AS antall_ordrer,
       SUM(o.total) AS sum_total
FROM Kunde k LEFT JOIN Ordre o USING (kundenr)
GROUP BY k.kundenr, k.navn;

-- Spørringer treffer den lagrede tabellen — raskt!
SELECT * FROM kunde_oversikt_mv WHERE sum_total > 10000;

-- Men dataene kan være utdaterte:
REFRESH MATERIALIZED VIEW kunde_oversikt_mv;`}</pre>
            </div>
          </div>
          <div className="mt-4 rounded-lg border border-border bg-card p-4 text-sm">
            <strong>Velg materialized when:</strong> dyr aggregering, tolererer
            litt utdaterte tall, og leses ofte. Eksempel: dashboard som spør samme
            «omsetning per måned» tusenvis av ganger per dag.
          </div>
        </section>

        {/* Samme spørring fra flere vinkler */}
        <section id="vinkler" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Samme spørring fra flere vinkler</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Vi har sett spørringen fra parser-, optimizer- og executor-siden
            hver for seg. Her ligger alle åtte abstraksjonslagene side om side
            for én og samme spørring —{" "}
            <code className="font-mono text-xs">SELECT name FROM users WHERE age &gt; 30 ORDER BY created_at DESC LIMIT 10</code>.
            Hover et fargelagt ord (for eksempel <code>age</code>) og se
            hvordan det dukker opp i hvert lag det er relevant.
          </p>
          <QueryLayersView />
        </section>

        {/* CTA */}
        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/drag" className="text-brand hover:underline">
                Drag-oppgaver
              </Link>{" "}
              under «Query-optimisering» — EXPLAIN-faser, join-typer og anti-mønstre.
            </li>
            <li>
              <Link
                to="/stack/$slug"
                params={{ slug: "indekser" }}
                className="text-brand hover:underline"
              >
                Indekser
              </Link>{" "}
              — datastrukturen optimisten lener seg på.
              <ArrowRight className="inline h-3.5 w-3.5 ml-1" />
            </li>
          </ul>
        </div>
        <RelatedVisualizers slug="query-plan" />
      </div>
    </StackPageShell>
  );
}
