import { Link } from "@tanstack/react-router";
import { ArrowRight, Lightbulb, TreeDeciduous, AlertTriangle, Zap } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";

// Course on indexes: B-tree, hash, covering, composite, when indexes
// don't get used, write-cost trade-offs. Pairs with /drag (topic "Indekser").

const STEPS = [
  { title: "Hva er en indeks egentlig?", anchor: "hva" },
  { title: "B-tree-indekser — struktur", anchor: "btree" },
  { title: "Hash-indeks — punkt-oppslag", anchor: "hash" },
  { title: "Composite-indeks — kolonnerekkefølge", anchor: "composite" },
  { title: "Covering index", anchor: "covering" },
  { title: "Når indeksen IKKE brukes", anchor: "ikke-brukt" },
  { title: "Trade-off: lese vs skrive", anchor: "tradeoff" },
];

type IkkeBrukt = { mønster: string; hvorfor: string; eksempel: string };
const IKKE_BRUKT: IkkeBrukt[] = [
  {
    mønster: "Wildcard helt foran i LIKE",
    hvorfor:
      "Indeksen er sortert alfabetisk. Vet du ikke første tegn, kan DB-en ikke navigere ned i treet — den må scanne alt.",
    eksempel: `-- Bruker indeks
WHERE navn LIKE 'Hans%'

-- Bruker IKKE indeks (full scan)
WHERE navn LIKE '%hansen'`,
  },
  {
    mønster: "Funksjon eller cast på kolonnen",
    hvorfor:
      "Indeksen er bygget på rådata-verdien, ikke på funksjonsresultatet. Pakk inn kolonnen, og indeksen står stille.",
    eksempel: `-- IKKE indeks (LOWER kalles på hver rad)
WHERE LOWER(epost) = 'a@b.no'

-- Bruker indeks
WHERE epost = 'a@b.no'
-- eller: lag funksjons-indeks
CREATE INDEX i ON Bruker (LOWER(epost));`,
  },
  {
    mønster: "Aritmetikk på kolonnen",
    hvorfor:
      "Samme problem som funksjoner — DB-en kan ikke regne baklengs gjennom indeksen.",
    eksempel: `-- IKKE indeks
WHERE saldo + 100 > 1000

-- Bruker indeks
WHERE saldo > 900`,
  },
  {
    mønster: "OR mellom forskjellige kolonner",
    hvorfor:
      "Med OR må DB-en vurdere begge sider — én indeks dekker sjelden begge betingelsene. Vurder UNION i stedet.",
    eksempel: `-- Kan slå over til seq scan
WHERE navn = 'Kari' OR epost = 'k@b.no'

-- Bedre: to indekserte spørringer kombinert
SELECT ... WHERE navn = 'Kari'
UNION
SELECT ... WHERE epost = 'k@b.no'`,
  },
  {
    mønster: "Typekonvertering implisitt",
    hvorfor:
      "Hvis du sammenligner string-kolonne med tall, kaster DB-en til felles type — ofte funksjon på kolonnen → indeks dropped.",
    eksempel: `-- kontonr er VARCHAR; gir implisitt CAST
WHERE kontonr = 12345

-- Riktig
WHERE kontonr = '12345'`,
  },
  {
    mønster: "Liten tabell",
    hvorfor:
      "Hvis tabellen er liten nok til å passe på få sider, er full scan raskere enn å hoppe gjennom indekstreet. Optimisten velger seq scan bevisst.",
    eksempel: `EXPLAIN SELECT * FROM Land WHERE landkode = 'NO';
-- → Seq Scan (cost=0.00..1.05) — 22 rader, ingen vits i indeks`,
  },
];

export function IndekserPage() {
  return (
    <StackPageShell title="Indekser — B-tree, covering og trade-offs" group="stack">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            Database · Ytelse
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Indekser — slik finner DB-en rader uten å lese hele tabellen
          </h1>
          <p className="mt-3 text-muted-foreground">
            En indeks er en sekundær datastruktur som lar DB-en hoppe direkte til de
            radene du leter etter, i stedet for å lese tabellen rad for rad. Riktig
            brukt: O(log n) i stedet for O(n). Feil brukt: bortkastet plass og
            tregere skriving.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <Link to="/drag" className="text-brand hover:underline">
                drag-oppgavene
              </Link>{" "}
              har et sett under «Indekser» — B-tree vs hash, kolonnerekkefølge,
              covering index, og når indeksen IKKE blir brukt.
            </div>
          </div>
        </div>

        <CourseOutline courseId="indekser" steps={STEPS} />

        {/* Hva er en indeks */}
        <section id="hva" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Hva er en indeks egentlig?</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Tenk på en bok: bakerst ligger stikkordsregisteret. Du finner «syre» på
            side 217 uten å lese boka. En DB-indeks er en sortert kopi av én eller
            flere kolonner, der hver verdi peker til radens fysiske plassering i
            tabellen. Primærnøkkelen er nesten alltid indeks automatisk.
          </p>
          <pre className="font-mono text-xs overflow-x-auto whitespace-pre rounded bg-background border border-border p-3">{`-- Opprett indeks
CREATE INDEX idx_kunde_navn ON Kunde (navn);

-- Sett unik begrensning (også indeks)
CREATE UNIQUE INDEX idx_kunde_epost ON Kunde (epost);

-- Slett
DROP INDEX idx_kunde_navn;

-- Liste indekser (Postgres)
SELECT indexname, tablename FROM pg_indexes WHERE tablename = 'kunde';`}</pre>
          <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
            <strong>Hvor henter du gevinsten?</strong> WHERE-filter, JOIN-betingelser,
            ORDER BY og GROUP BY på indekserte kolonner. ALDRI i SELECT-lista — der
            hjelper ikke en indeks.
          </div>
        </section>

        {/* B-tree */}
        <section id="btree" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">B-tree — default-indeksen</h2>
          <p className="text-sm text-muted-foreground mb-3">
            B-tree (balansert tre) er hva du får når du skriver{" "}
            <code>CREATE INDEX</code> uten å spesifisere noe annet. Hver node holder
            mange sorterte nøkler (typisk hundrevis), så treet blir bredt og grunt —
            tre-fire nivåer rekker for milliarder av rader. Søketid:{" "}
            <code>O(log n)</code>.
          </p>
          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <TreeDeciduous className="h-4 w-4 text-brand" />
              <h3 className="font-semibold text-sm">Skjematisk struktur</h3>
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre rounded bg-background border border-border p-3">{`                     [ 50 | 100 ]                       ← rotnode
                   /     |       \\
          [10|25|40]  [60|75|90]  [110|130|150]          ← intern
          /  |  |  |   /  |   |    /   |    |   \\
   leaf-noder med (nøkkel → radpeker), lenket i rekkefølge
   ────────────────────────────────────────────────────→

   leaves er lenket → rekke-scan (range scan) er rask`}</pre>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Et balansert tre vil si: alle blader er på samme dybde. Når en node blir
            full, splittes den (og en nøkkel «pushes opp»). Slettinger kan trigge
            merge. Disse er DB-ens jobb — du skriver bare INSERT/UPDATE/DELETE.
          </p>
          <p className="text-sm text-muted-foreground">
            <strong>B-tree er bra på:</strong> likhet, range (BETWEEN, &lt;, &gt;),
            ORDER BY på indeks-kolonnen, og prefix-LIKE (<code>'Hans%'</code>).
          </p>
        </section>

        {/* Hash */}
        <section id="hash" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Hash-indeks — bare likhet, men lynraskt</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Hash-indeks lagrer <code>hash(verdi) → radpeker</code>. Oppslag er{" "}
            <code>O(1)</code> i snitt — raskere enn B-tree for ren likhet. Men: kan
            IKKE brukes til range (BETWEEN, &lt;), IKKE til ORDER BY, IKKE til
            prefix-LIKE.
          </p>
          <pre className="font-mono text-xs overflow-x-auto whitespace-pre rounded bg-background border border-border p-3">{`-- Postgres: krever USING hash
CREATE INDEX idx_kunde_epost_hash ON Kunde USING hash (epost);

-- Bra
SELECT * FROM Kunde WHERE epost = 'kari@b.no';

-- IKKE bra (hash kan ikke gjøre dette)
SELECT * FROM Kunde WHERE epost > 'k';
SELECT * FROM Kunde ORDER BY epost;`}</pre>
          <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
            I praksis er B-tree default fordi den dekker både likhet og range. Hash
            brukes mest i in-memory caches og i spesielle DB-er. MySQL/InnoDB har
            ingen brukerstyrt hash-indeks i det hele tatt.
          </div>
        </section>

        {/* Composite */}
        <section id="composite" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">
            Composite-indeks — kolonnerekkefølgen er kritisk
          </h2>
          <p className="text-sm text-muted-foreground mb-3">
            En composite-indeks (flere kolonner) lagrer rader sortert på første
            kolonne, så på andre innen samme første-verdi, osv. Tenk på telefonkatalog:
            sortert på etternavn, så fornavn. Du kan finne alle «Hansen», men ikke
            alle «Kari» direkte.
          </p>
          <pre className="font-mono text-xs overflow-x-auto whitespace-pre rounded bg-background border border-border p-3">{`CREATE INDEX idx_ordre_kdato ON Ordre (kundenr, dato);

-- Bruker indeks (matcher venstreprefiks)
WHERE kundenr = 5
WHERE kundenr = 5 AND dato = '2026-05-12'
WHERE kundenr = 5 AND dato > '2026-01-01' ORDER BY dato

-- Bruker IKKE indeks (hopper over første kolonne)
WHERE dato = '2026-05-12'
ORDER BY dato`}</pre>
          <p className="mt-3 text-sm text-muted-foreground">
            <strong>Regel:</strong> sett den mest selektive (færrest like verdier)
            eller den hyppigst filtrerte kolonnen først — så lenge spørringen din
            faktisk filtrerer på den. Hvis du nesten alltid filtrerer på{" "}
            <code>kundenr</code>, må <code>kundenr</code> stå først.
          </p>
        </section>

        {/* Covering */}
        <section id="covering" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Covering index — slipp tabell-oppslaget</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Vanligvis finner DB-en raden i indeksen, så går den til tabellen for å
            hente flere kolonner. En <em>covering index</em> inneholder ALLE kolonnene
            spørringen trenger, så DB-en svarer rett fra indeksen. Kalles også{" "}
            <em>index-only scan</em>.
          </p>
          <pre className="font-mono text-xs overflow-x-auto whitespace-pre rounded bg-background border border-border p-3">{`-- Spørring vi vil dekke
SELECT kundenr, dato, total FROM Ordre WHERE kundenr = 5;

-- Vanlig indeks (kun kundenr)
CREATE INDEX idx_kn ON Ordre (kundenr);
-- → Index Scan + table lookup for dato og total

-- Covering — alle tre kolonnene i indeksen
CREATE INDEX idx_kn_full ON Ordre (kundenr, dato, total);
-- → Index Only Scan, ingen tabell-IO

-- Postgres-syntaks for "include uten å sortere på det":
CREATE INDEX idx_kn_inc ON Ordre (kundenr) INCLUDE (dato, total);`}</pre>
          <p className="mt-3 text-sm text-muted-foreground">
            Trade-off: indeksen blir større. Hvis du legger til kolonner du sjelden
            henter, betaler du write-cost uten å hente gevinst på lesing.
          </p>
        </section>

        {/* Når indeksen ikke brukes */}
        <section id="ikke-brukt" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Når indeksen IKKE blir brukt</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Du opprettet indeksen, men EXPLAIN viser{" "}
            <code>Seq Scan</code>. Klassiske grunner — disse er nesten alltid pensum:
          </p>
          <div className="space-y-3">
            {IKKE_BRUKT.map((p) => (
              <div key={p.mønster} className="rounded-xl border border-amber-500/40 bg-amber-500/5 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-amber-700 dark:text-amber-400" />
                  <h3 className="font-semibold text-sm">{p.mønster}</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{p.hvorfor}</p>
                <pre className="font-mono text-xs overflow-x-auto whitespace-pre rounded bg-background border border-border p-3">
                  {p.eksempel}
                </pre>
              </div>
            ))}
          </div>
        </section>

        {/* Trade-off */}
        <section id="tradeoff" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Trade-off: indeks koster ved skriving</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Hver indeks må oppdateres ved hver INSERT, UPDATE som rører
            indekskolonnen, og DELETE. Plassen på disk øker også. En tabell med åtte
            indekser har omtrent 8x skrive-cost på INSERT vs en tabell med null
            indekser.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-success/40 bg-success/5 p-5">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-success" />
                <h3 className="font-semibold text-sm">Legg til indeks når</h3>
              </div>
              <ul className="text-xs space-y-1.5 list-disc pl-5">
                <li>Kolonnen brukes ofte i WHERE/JOIN</li>
                <li>Tabellen er stor (typisk &gt; 10 000 rader)</li>
                <li>Spørringen leser få rader av mange (høy selektivitet)</li>
                <li>Skriving er sjeldent vs lesing</li>
              </ul>
            </div>
            <div className="rounded-xl border border-amber-500/40 bg-amber-500/5 p-5">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-amber-700 dark:text-amber-400" />
                <h3 className="font-semibold text-sm">Unngå indeks når</h3>
              </div>
              <ul className="text-xs space-y-1.5 list-disc pl-5">
                <li>Tabellen er liten</li>
                <li>Kolonnen har få distinkte verdier (kjonn, status)</li>
                <li>Tabellen skrives MYE og leses sjeldent (logg)</li>
                <li>Spørringen henter de fleste radene uansett</li>
              </ul>
            </div>
          </div>
          <pre className="mt-4 font-mono text-xs overflow-x-auto whitespace-pre rounded bg-background border border-border p-3">{`-- Sjekk om indeksen faktisk brukes
EXPLAIN ANALYZE
SELECT * FROM Ordre WHERE kundenr = 5 AND dato > '2026-01-01';

-- Eksempel-output (Postgres):
-- Index Scan using idx_ordre_kdato on ordre  (cost=0.42..8.45 rows=3)
--   Index Cond: ((kundenr = 5) AND (dato > '2026-01-01'))
--   Heap Fetches: 3
-- Planning Time: 0.123 ms
-- Execution Time: 0.067 ms`}</pre>
        </section>

        {/* CTA */}
        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/drag" className="text-brand hover:underline">
                Drag-oppgaver
              </Link>{" "}
              under «Indekser» — kolonnerekkefølge, covering, og når indeksen
              droppes.
            </li>
            <li>
              <Link
                to="/stack/$slug"
                params={{ slug: "query-optimisering" }}
                className="text-brand hover:underline"
              >
                Query-optimisering
              </Link>{" "}
              — EXPLAIN, join-typer, og hvordan optimisten velger plan.
              <ArrowRight className="inline h-3.5 w-3.5 ml-1" />
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
