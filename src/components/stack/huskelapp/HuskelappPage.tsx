import { useEffect, useMemo, useState } from "react";
import { Search, X, AlertTriangle } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { HuskelappTOC, type TOCEntry } from "./HuskelappTOC";
import { HuskelappSection } from "./HuskelappSection";
import { SqlSnippet } from "./SqlSnippet";
import { OperatorTable, type OperatorRow } from "./OperatorTable";
import { AggregateTable, type AggregateRow } from "./AggregateTable";
import { JoinDiagram, type JoinVariant } from "./JoinDiagram";
import { cn } from "@/lib/utils";

interface SectionDef {
  id: string;
  number: number | string;
  title: string;
  /** Plain text for search (concatenated content). */
  searchText: string;
  render: () => React.ReactNode;
}

const ORDER_STEPS: Array<{ step: number; clause: string; what: string }> = [
  { step: 1, clause: "FROM / JOIN", what: "bygg råtabellen" },
  { step: 2, clause: "WHERE", what: "filtrer rader" },
  { step: 3, clause: "GROUP BY", what: "grupper rader" },
  { step: 4, clause: "HAVING", what: "filtrer grupper" },
  { step: 5, clause: "SELECT", what: "velg/regn ut kolonner (alias laget her)" },
  { step: 6, clause: "DISTINCT", what: "fjern duplikater" },
  { step: 7, clause: "ORDER BY", what: "sortér" },
  { step: 8, clause: "LIMIT / OFFSET", what: "begrens antall rader" },
];

const WHERE_OPS: OperatorRow[] = [
  { operator: "= <> < <= > >=", example: "pris > 100", note: "Standard sammenligning" },
  { operator: "AND / OR / NOT", example: "aar=2025 AND land='NO'", note: "Bruk parentes når du blander AND/OR" },
  { operator: "BETWEEN x AND y", example: "aar BETWEEN 1990 AND 1999", note: "Inklusive begge ender" },
  { operator: "IN (...)", example: "land IN ('NO','SE')", note: "Kortere enn flere OR" },
  { operator: "NOT IN (...)", example: "id NOT IN (SELECT ...)", note: "Pass på NULL i sub-spørring" },
  { operator: "LIKE '%a_'", example: "navn LIKE 'P%'", note: "% = 0+ tegn, _ = ett tegn" },
  { operator: "IS NULL / IS NOT NULL", example: "kommentar IS NULL", note: "NULL kan IKKE testes med =" },
  { operator: "EXISTS / NOT EXISTS", example: "EXISTS (SELECT 1 FROM ...)", note: "NULL-trygg variant av IN" },
];

const AGG_FNS: AggregateRow[] = [
  { fn: "COUNT(*)", desc: "Teller alle rader (også NULL)." },
  { fn: "COUNT(kol)", desc: "Teller rader der kol ikke er NULL." },
  { fn: "COUNT(DISTINCT kol)", desc: "Teller unike ikke-null-verdier." },
  { fn: "SUM, AVG", desc: "Summerer / snitt over ikke-null-verdier." },
  { fn: "MIN, MAX", desc: "Minste / største verdi." },
];

const STR_FNS: Array<{ fn: string; example: string }> = [
  { fn: "Strengkonkat", example: "fornavn || ' ' || etternavn (SQLite/PG); CONCAT(...) (MySQL)" },
  { fn: "UPPER / LOWER", example: "UPPER(navn) = 'OLA'" },
  { fn: "SUBSTR(s, start[, len])", example: "SUBSTR(navn, 1, 3)" },
  { fn: "LENGTH(s)", example: "Antall tegn" },
  { fn: "ROUND(x [,n])", example: "ROUND(snitt, 2)" },
];

const PITFALLS: Array<{ title: string; explain: string }> = [
  {
    title: "Glemmer parentes rundt OR i WHERE",
    explain: "WHERE a=1 AND (b=2 OR c=3) — uten parentes blir AND evaluert først.",
  },
  {
    title: "Bruker = mot NULL i stedet for IS NULL",
    explain: "x = NULL gir alltid UKJENT — bruk x IS NULL / x IS NOT NULL.",
  },
  {
    title: "Glemmer kolonner i GROUP BY",
    explain: "Alle ikke-aggregerte SELECT-kolonner må stå i GROUP BY.",
  },
  {
    title: "Bruker WHERE i stedet for HAVING på aggregat",
    explain: "WHERE COUNT(*) > 1 → feil. Filtrering på aggregat hører hjemme i HAVING.",
  },
  {
    title: "LIMIT uten ORDER BY",
    explain: "Rekkefølgen er udefinert. Kombiner alltid LIMIT med ORDER BY.",
  },
  {
    title: "«Mangler» rader i resultatet etter JOIN",
    explain: "Sjekk om det burde vært LEFT JOIN — INNER JOIN dropper urelaterte rader.",
  },
  {
    title: "NOT IN med subspørring som returnerer NULL",
    explain: "Gir tomt sett. Bruk NOT EXISTS (NULL-trygt) i stedet.",
  },
  {
    title: "Forskjell mellom COUNT(*) og COUNT(kolonne)",
    explain: "COUNT(*) teller alle rader; COUNT(kol) teller rader der kol ikke er NULL.",
  },
];

function buildSections(): SectionDef[] {
  const s: SectionDef[] = [];

  s.push({
    id: "logisk-rekkefolge",
    number: 1,
    title: "Logisk utføringsrekkefølge",
    searchText:
      "FROM JOIN WHERE GROUP BY HAVING SELECT DISTINCT ORDER BY LIMIT OFFSET utføringsrekkefølge alias",
    render: () => (
      <>
        <p className="text-foreground/80">
          SQL leses ovenfra og ned, men <em>kjøres</em> i en annen rekkefølge.
          Dette forklarer hvorfor alias laget i SELECT kan brukes i ORDER BY,
          men ikke i WHERE/GROUP BY/HAVING.
        </p>
        <ol className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {ORDER_STEPS.map((row) => (
            <li
              key={row.step}
              className="flex items-start gap-3 rounded-lg border border-border bg-card/50 p-3"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-brand text-brand-foreground text-xs font-bold">
                {row.step}
              </span>
              <div className="min-w-0">
                <div className="font-mono text-[12.5px] text-pink-700 dark:text-pink-400 font-semibold">
                  {row.clause}
                </div>
                <div className="text-[13px] text-foreground/80 mt-0.5">
                  {row.what}
                </div>
              </div>
            </li>
          ))}
        </ol>
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-[13px]">
          <strong className="font-semibold">Konsekvens:</strong> alias laget i
          SELECT kan brukes i ORDER BY, men ikke i WHERE / GROUP BY / HAVING
          (med mindre motoren tillater det).
        </div>
      </>
    ),
  });

  s.push({
    id: "skeleton",
    number: 2,
    title: "Grunnleggende setningsstruktur",
    searchText: "SELECT DISTINCT FROM WHERE GROUP BY HAVING ORDER BY LIMIT OFFSET skjelett",
    render: () => (
      <SqlSnippet
        code={`SELECT [DISTINCT] kolonner | uttrykk [AS alias]
FROM    tabell [AS alias] [JOIN ... ON ...]
WHERE   radbetingelser
GROUP BY kolonner
HAVING  gruppebetingelser
ORDER BY kolonner [ASC|DESC]
LIMIT n [OFFSET m];`}
      />
    ),
  });

  s.push({
    id: "where",
    number: 3,
    title: "WHERE — operatorer",
    searchText:
      "WHERE operatorer = <> AND OR NOT BETWEEN IN NOT IN LIKE IS NULL EXISTS",
    render: () => (
      <>
        <p className="text-foreground/80">
          WHERE filtrerer rader <em>før</em> aggregering. Kolonne-aliaser fra
          SELECT kan ikke brukes her.
        </p>
        <OperatorTable rows={WHERE_OPS} />
      </>
    ),
  });

  // Section 4 — JOIN-typer
  const joinCard = (
    label: string,
    desc: string,
    code: string,
    variant: JoinVariant,
    extra?: React.ReactNode,
  ) => (
    <div className="rounded-lg border border-border bg-card/50 p-3 space-y-2">
      <div className="flex items-start gap-3">
        <JoinDiagram variant={variant} size={56} />
        <div className="min-w-0">
          <div className="font-semibold text-foreground">{label}</div>
          <div className="text-[13px] text-foreground/80 mt-0.5">{desc}</div>
        </div>
      </div>
      <SqlSnippet code={code} />
      {extra}
    </div>
  );

  s.push({
    id: "joins",
    number: 4,
    title: "JOIN-typer",
    searchText:
      "INNER JOIN LEFT OUTER RIGHT FULL SELF CROSS ANTI JOIN venn diagram SQLite",
    render: () => (
      <>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {joinCard(
            "INNER JOIN",
            "Bare rader som matcher i begge tabeller.",
            `SELECT b.tittel, f.navn
FROM    bok b
JOIN    forfatter f ON b.fid = f.id;`,
            "inner",
          )}
          {joinCard(
            "LEFT (OUTER) JOIN",
            "Alle rader fra venstre tabell. Manglende høyre → NULL.",
            `SELECT k.navn, b.id
FROM    kunde k
LEFT JOIN bestilling b ON b.kid = k.id;`,
            "left",
          )}
          {joinCard(
            "RIGHT / FULL JOIN",
            "Speilet av LEFT, hhv. begge sider med NULL der match mangler. Mange motorer (SQLite) støtter ikke disse — bytt rekkefølge og bruk LEFT JOIN.",
            `-- Ikke støttet i SQLite:
-- SELECT ... FROM a RIGHT JOIN b ...
-- Skriv om til:
SELECT ... FROM b LEFT JOIN a ON ...;`,
            "full",
          )}
          {joinCard(
            "SELF JOIN",
            "Tabell joinet med seg selv (med ulike alias). Brukt for hierarkier (sjef/ansatt).",
            `SELECT a.navn, s.navn AS sjef
FROM    ansatt a
JOIN    ansatt s ON a.sjef_id = s.id;`,
            "inner",
          )}
          {joinCard(
            "CROSS JOIN",
            "Kartesisk produkt — alle kombinasjoner. FROM a, b uten ON gir det samme.",
            `SELECT *
FROM    farge
CROSS JOIN storrelse;`,
            "cross",
          )}
          <div className="rounded-lg border border-amber-500/40 bg-amber-500/5 p-3 space-y-2">
            <div className="flex items-start gap-3">
              <JoinDiagram variant="leftOnly" size={56} />
              <div className="min-w-0">
                <div className="font-semibold text-foreground">
                  Anti-join (finn det som mangler)
                </div>
                <div className="text-[13px] text-foreground/80 mt-0.5">
                  LEFT JOIN + WHERE høyre IS NULL.
                </div>
              </div>
            </div>
            <SqlSnippet
              code={`SELECT k.* FROM kunde k
LEFT JOIN bestilling b ON b.kid = k.id
WHERE b.id IS NULL;`}
              caption="Kunder uten bestilling."
            />
          </div>
        </div>
      </>
    ),
  });

  s.push({
    id: "aggregat",
    number: 5,
    title: "Aggregat & GROUP BY",
    searchText:
      "COUNT SUM AVG MIN MAX GROUP BY HAVING WHERE aggregat aggregering DISTINCT",
    render: () => (
      <>
        <AggregateTable rows={AGG_FNS} />
        <SqlSnippet
          code={`SELECT land, COUNT(*) AS antall, AVG(pris) AS snitt
FROM    film
WHERE   aar >= 2000
GROUP BY land
HAVING  COUNT(*) > 5
ORDER BY antall DESC;`}
        />
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/5 p-3 text-[13px] space-y-1">
          <div>
            <strong className="font-semibold">Regel:</strong> Alle ikke-aggregerte
            kolonner i SELECT må også stå i GROUP BY (i streng SQL).
          </div>
          <div>
            <strong className="font-semibold">WHERE</strong> filtrerer{" "}
            <em>før</em> aggregering, <strong className="font-semibold">HAVING</strong>{" "}
            filtrerer <em>etter</em>.
          </div>
        </div>
      </>
    ),
  });

  s.push({
    id: "subqueries",
    number: 6,
    title: "Sub-spørringer",
    searchText: "subquery scalar IN NOT IN korrelert inline view FROM-subspørring",
    render: () => (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="rounded-lg border border-border bg-card/50 p-3 space-y-2">
          <div className="font-semibold text-foreground">Skalar (returnerer 1 verdi)</div>
          <SqlSnippet
            code={`SELECT * FROM film
WHERE pris > (SELECT AVG(pris) FROM film);`}
          />
        </div>
        <div className="rounded-lg border border-border bg-card/50 p-3 space-y-2">
          <div className="font-semibold text-foreground">IN / NOT IN (liste)</div>
          <SqlSnippet
            code={`SELECT * FROM kunde
WHERE id IN (SELECT kid FROM bestilling);`}
          />
        </div>
        <div className="rounded-lg border border-border bg-card/50 p-3 space-y-2">
          <div className="font-semibold text-foreground">
            Korrelert (refererer til ytre rad)
          </div>
          <SqlSnippet
            code={`SELECT a.* FROM ansatt a
WHERE lonn = (
  SELECT MAX(lonn)
  FROM ansatt
  WHERE avd = a.avd);`}
            caption="Høyest lønn i hver avdeling."
          />
        </div>
        <div className="rounded-lg border border-border bg-card/50 p-3 space-y-2">
          <div className="font-semibold text-foreground">
            Inline view (FROM-subspørring)
          </div>
          <SqlSnippet
            code={`SELECT avd, snitt FROM (
  SELECT avd, AVG(lonn) AS snitt
  FROM ansatt GROUP BY avd) t
WHERE snitt > 50000;`}
          />
        </div>
      </div>
    ),
  });

  s.push({
    id: "null",
    number: 7,
    title: "NULL — tre-verdi-logikk",
    searchText: "NULL IS NULL COALESCE NOT IN tre-verdi-logikk UKJENT",
    render: () => (
      <ul className="space-y-2 list-disc pl-5 text-foreground/85">
        <li>
          <code className="font-mono text-[12.5px]">NULL = NULL</code> →{" "}
          <em>UKJENT</em> (ikke sant). Bruk{" "}
          <code className="font-mono text-[12.5px]">IS NULL</code>.
        </li>
        <li>
          <code className="font-mono text-[12.5px]">NULL + 1</code>,{" "}
          <code className="font-mono text-[12.5px]">NULL || 'x'</code> →{" "}
          <code className="font-mono text-[12.5px]">NULL</code>.
        </li>
        <li>
          Aggregater (SUM/AVG/MIN/MAX/COUNT(kol)) <strong>ignorerer NULL</strong>.
          <code className="font-mono text-[12.5px] ml-1">COUNT(*)</code> teller alt.
        </li>
        <li>
          <code className="font-mono text-[12.5px]">COALESCE(a, b, c)</code> →
          første ikke-NULL.
        </li>
        <li>
          <code className="font-mono text-[12.5px]">NOT IN (...)</code> blir{" "}
          <em>tomt resultat</em> hvis subspørringen kan returnere NULL — bruk{" "}
          <code className="font-mono text-[12.5px]">NOT EXISTS</code>.
        </li>
      </ul>
    ),
  });

  s.push({
    id: "sort-streng",
    number: 8,
    title: "Sortering, paginering, strenger",
    searchText:
      "ORDER BY ASC DESC LIMIT OFFSET CONCAT UPPER LOWER SUBSTR LENGTH ROUND streng",
    render: () => (
      <>
        <SqlSnippet
          code={`SELECT navn, pris FROM film
ORDER BY pris DESC, navn ASC
LIMIT 10 OFFSET 20;     -- topp 10, hopp over 20`}
        />
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-card/60">
              <tr className="text-left">
                <th className="px-3 py-2 font-semibold border-b border-border w-1/3">
                  Funksjon
                </th>
                <th className="px-3 py-2 font-semibold border-b border-border">
                  Eksempel
                </th>
              </tr>
            </thead>
            <tbody>
              {STR_FNS.map((row, i) => (
                <tr key={i} className="border-b border-border last:border-b-0">
                  <td className="px-3 py-2 align-top">
                    <code className="font-mono text-[12.5px] text-pink-700 dark:text-pink-400">
                      {row.fn}
                    </code>
                  </td>
                  <td className="px-3 py-2 align-top">
                    <code className="font-mono text-[12.5px] text-foreground/90">
                      {row.example}
                    </code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    ),
  });

  s.push({
    id: "dato",
    number: 9,
    title: "Datofunksjoner (SQLite)",
    searchText: "DATE DATETIME strftime now start of month dato format",
    render: () => (
      <>
        <SqlSnippet
          code={`SELECT DATE('now'), DATETIME('now', '-7 days');
SELECT strftime('%Y', dato) AS aar FROM bestilling;
WHERE dato >= DATE('now', 'start of month');`}
        />
        <div className="text-[13px] text-foreground/80 grid grid-cols-2 sm:grid-cols-4 gap-2">
          <span>
            <code className="font-mono text-[12.5px]">%Y</code> = år
          </span>
          <span>
            <code className="font-mono text-[12.5px]">%m</code> = måned
          </span>
          <span>
            <code className="font-mono text-[12.5px]">%d</code> = dag
          </span>
          <span>
            <code className="font-mono text-[12.5px]">%w</code> = ukedag (0=søndag)
          </span>
        </div>
      </>
    ),
  });

  s.push({
    id: "case",
    number: 10,
    title: "CASE — betinget uttrykk",
    searchText: "CASE WHEN THEN ELSE END kategori betinget",
    render: () => (
      <SqlSnippet
        code={`SELECT navn,
  CASE
    WHEN pris < 100 THEN 'Billig'
    WHEN pris < 500 THEN 'Middels'
    ELSE 'Dyr'
  END AS kategori
FROM film;`}
      />
    ),
  });

  s.push({
    id: "union",
    number: 11,
    title: "UNION / INTERSECT / EXCEPT",
    searchText:
      "UNION ALL INTERSECT EXCEPT mengde sett dupliker kolonner datatype",
    render: () => (
      <>
        <ul className="space-y-2 list-disc pl-5 text-foreground/85">
          <li>
            <code className="font-mono text-[12.5px]">UNION</code> stabler to
            spørringer og fjerner duplikater.{" "}
            <code className="font-mono text-[12.5px]">UNION ALL</code> beholder
            dem (raskere).
          </li>
          <li>Antall kolonner og datatyper må stemme.</li>
          <li>
            <code className="font-mono text-[12.5px]">INTERSECT</code> = felles
            rader. <code className="font-mono text-[12.5px]">EXCEPT</code> = i
            A, men ikke i B.
          </li>
        </ul>
        <SqlSnippet
          code={`SELECT navn FROM kunde_no
UNION ALL
SELECT navn FROM kunde_se;

SELECT id FROM aktiv
INTERSECT
SELECT id FROM premium;`}
        />
      </>
    ),
  });

  s.push({
    id: "dml",
    number: 12,
    title: "DML — INSERT / UPDATE / DELETE",
    searchText: "INSERT VALUES SELECT UPDATE SET DELETE WHERE DML",
    render: () => (
      <>
        <SqlSnippet
          code={`INSERT INTO kunde (navn, land) VALUES ('Ola', 'NO');
INSERT INTO kunde (navn) SELECT navn FROM gammel_kunde;

UPDATE film SET pris = pris * 1.1 WHERE aar < 2000;

DELETE FROM kunde WHERE id = 7;`}
        />
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/5 p-3 text-[13px]">
          <strong className="font-semibold">Glem aldri WHERE</strong> i
          UPDATE/DELETE — uten WHERE rammes hele tabellen.
        </div>
      </>
    ),
  });

  s.push({
    id: "ddl",
    number: 13,
    title: "DDL — CREATE TABLE",
    searchText:
      "CREATE TABLE PRIMARY KEY NOT NULL UNIQUE DEFAULT CHECK FOREIGN KEY REFERENCES",
    render: () => (
      <>
        <SqlSnippet
          code={`CREATE TABLE kunde (
  id        INTEGER PRIMARY KEY,
  navn      TEXT NOT NULL,
  epost     TEXT UNIQUE,
  registrert DATE DEFAULT (DATE('now'))
);

CREATE TABLE bestilling (
  id     INTEGER PRIMARY KEY,
  kid    INTEGER NOT NULL,
  belop  REAL CHECK(belop >= 0),
  FOREIGN KEY(kid) REFERENCES kunde(id)
);`}
        />
        <ul className="text-[13px] text-foreground/80 list-disc pl-5 space-y-1">
          <li>
            <code className="font-mono text-[12.5px]">PRIMARY KEY</code> —
            unikt, ikke NULL, automatisk indeks.
          </li>
          <li>
            <code className="font-mono text-[12.5px]">NOT NULL</code> +{" "}
            <code className="font-mono text-[12.5px]">UNIQUE</code> +{" "}
            <code className="font-mono text-[12.5px]">DEFAULT</code> +{" "}
            <code className="font-mono text-[12.5px]">CHECK</code> setter
            radkrav.
          </li>
          <li>
            <code className="font-mono text-[12.5px]">FOREIGN KEY</code> peker
            til en PK i en annen tabell — gir referanseintegritet.
          </li>
        </ul>
      </>
    ),
  });

  s.push({
    id: "feller",
    number: 14,
    title: "Vanlige feller på eksamen",
    searchText:
      "feller feil eksamen NULL HAVING WHERE GROUP BY LIMIT ORDER BY NOT IN COUNT JOIN",
    render: () => (
      <div className="rounded-xl border-2 border-amber-500/50 bg-amber-500/10 p-4">
        <div className="flex items-center gap-2 mb-3 text-amber-700 dark:text-amber-400 font-semibold">
          <AlertTriangle className="h-4 w-4" />
          De vanligste feilene — sjekk disse før du leverer
        </div>
        <ul className="space-y-2.5">
          {PITFALLS.map((p) => (
            <li
              key={p.title}
              className="rounded-lg border border-amber-500/30 bg-background/60 p-3"
            >
              <div className="font-semibold text-foreground text-[13.5px]">
                {p.title}
              </div>
              <div className="text-[13px] text-foreground/80 mt-0.5">
                {p.explain}
              </div>
            </li>
          ))}
        </ul>
      </div>
    ),
  });

  return s;
}

export function HuskelappPage() {
  const sections = useMemo(buildSections, []);
  const [query, setQuery] = useState("");

  const filteredIds = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length === 0) return new Set(sections.map((s) => s.id));
    return new Set(
      sections
        .filter(
          (s) =>
            s.title.toLowerCase().includes(q) ||
            s.searchText.toLowerCase().includes(q),
        )
        .map((s) => s.id),
    );
  }, [query, sections]);

  const tocEntries: TOCEntry[] = sections.map((s) => ({
    id: s.id,
    number: s.number,
    title: s.title,
  }));

  // Reset scroll position to first matching section when filter narrows.
  useEffect(() => {
    if (query.trim().length === 0) return;
    const first = sections.find((s) => filteredIds.has(s.id));
    if (first) {
      const el = document.getElementById(first.id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [query, filteredIds, sections]);

  return (
    <StackPageShell title="SQL huskelapp" group="eksamen">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground mb-3">
            Eksamensforberedelse
          </div>
          <h1 className="text-3xl font-bold tracking-tight">SQL huskelapp</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Komprimert hurtigreferanse for eksamen — SELECT, JOIN, GROUP BY,
            NULL og DDL på én side. Eksempler i SQLite-/standard-SQL-stil.
          </p>
        </div>

        {/* Search */}
        <div className="mb-6 relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Søk i huskelappen — f.eks. JOIN, NULL, HAVING..."
            aria-label="Søk i huskelappen"
            className="w-full pl-9 pr-9 h-10 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
          />
          {query.length > 0 && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Tøm søk"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[14rem,1fr] gap-8">
          {/* TOC */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <HuskelappTOC entries={tocEntries} visibleIds={filteredIds} />
            </div>
          </aside>

          {/* Mobile TOC */}
          <details className="lg:hidden rounded-lg border border-border bg-card p-3 mb-2">
            <summary className="text-sm font-semibold cursor-pointer select-none">
              Innholdsfortegnelse
            </summary>
            <div className="mt-3">
              <HuskelappTOC entries={tocEntries} visibleIds={filteredIds} />
            </div>
          </details>

          {/* Content */}
          <div className="space-y-12 min-w-0">
            {sections.map((s) => {
              const visible = filteredIds.has(s.id);
              return (
                <div
                  key={s.id}
                  className={cn(
                    "transition-opacity",
                    !visible && "hidden",
                  )}
                >
                  <HuskelappSection
                    id={s.id}
                    number={s.number}
                    title={s.title}
                    data_text={s.searchText}
                  >
                    {s.render()}
                  </HuskelappSection>
                </div>
              );
            })}

            {filteredIds.size === 0 && (
              <div className="rounded-lg border border-border bg-card p-6 text-center text-sm text-muted-foreground">
                Ingen treff for «{query}». Prøv et annet søkeord — f.eks.{" "}
                <em>JOIN</em>, <em>NULL</em>, <em>HAVING</em>.
              </div>
            )}
          </div>
        </div>
      </div>
    </StackPageShell>
  );
}
