import { Link } from "@tanstack/react-router";
import { ArrowRight, Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";

// Course page on subqueries / nested SELECTs at multiple levels.
// Hands-on lives in /drag under topic "Underspørringer".

type Level = {
  niva: string;
  navn: string;
  hva: string;
  eksempel: string;
};

const NIVAER: Level[] = [
  {
    niva: "1",
    navn: "Skalar-subquery i WHERE",
    hva: "Subqueryen returnerer ÉN verdi. Bruker = for sammenligning.",
    eksempel: `SELECT navn
FROM Kunde
WHERE by = (SELECT by FROM Kunde WHERE kundenr = 5);
-- finn andre kunder i samme by som kunde 5`,
  },
  {
    niva: "2",
    navn: "Liste-subquery med IN",
    hva: "Subqueryen returnerer en liste av verdier. IN sjekker tilhørighet.",
    eksempel: `SELECT prodnavn
FROM Produkt
WHERE prodnr IN (SELECT DISTINCT prodnr FROM Ordrelinje);
-- produkter som er bestilt minst én gang`,
  },
  {
    niva: "3",
    navn: "EXISTS (anti-pattern: NOT EXISTS)",
    hva: "Sjekker bare OM en match finnes. Returnerer TRUE/FALSE per ytre rad.",
    eksempel: `SELECT k.navn
FROM Kunde k
WHERE EXISTS (
  SELECT 1 FROM Ordre o WHERE o.kundenr = k.kundenr
);
-- kunder som har minst én ordre`,
  },
  {
    niva: "4",
    navn: "Korrelert subquery",
    hva: "Subqueryen refererer til ytre tabells kolonne — kjører på nytt for hver ytre rad.",
    eksempel: `SELECT o.ordrenr, o.total
FROM Ordre o
WHERE o.total = (
  SELECT MAX(o2.total)
  FROM Ordre o2
  WHERE o2.kundenr = o.kundenr
);
-- hver kundes største ordre`,
  },
  {
    niva: "5",
    navn: "Skalar-subquery i SELECT",
    hva: "Beregnet kolonne — vises som ekstra felt i resultatet.",
    eksempel: `SELECT p.prodnavn,
       (SELECT COUNT(*) FROM Ordrelinje ol
        WHERE ol.prodnr = p.prodnr) AS antall
FROM Produkt p;
-- produkt + hvor mange ganger det er bestilt`,
  },
  {
    niva: "6",
    navn: "Avledet tabell (subquery i FROM)",
    hva: "Subqueryen gir en midlertidig tabell du joiner/filtrerer på.",
    eksempel: `SELECT kjonn, snittalder
FROM (
  SELECT kjonn, AVG(alder) AS snittalder, COUNT(*) AS n
  FROM Person GROUP BY kjonn
) AS gr
WHERE n > 10;
-- bare grupper med over 10 personer`,
  },
  {
    niva: "7",
    navn: "CTE — WITH ... AS",
    hva: "Navngitt midlertidig resultat. Lesbar versjon av avledet tabell.",
    eksempel: `WITH gr AS (
  SELECT kjonn, AVG(alder) AS snittalder, COUNT(*) AS n
  FROM Person GROUP BY kjonn
)
SELECT kjonn, snittalder FROM gr WHERE n > 10;`,
  },
  {
    niva: "8",
    navn: "Flere CTE-er + topp-N-per-gruppe",
    hva: "Klassisk eksamensmønster: én CTE per gruppe, JOIN dem på max-verdien.",
    eksempel: `WITH salg AS (
  SELECT p.kategori, p.prodnr, SUM(ol.antall) AS solgt
  FROM Produkt p JOIN Ordrelinje ol USING (prodnr)
  GROUP BY p.kategori, p.prodnr
),
maks AS (
  SELECT kategori, MAX(solgt) AS m FROM salg GROUP BY kategori
)
SELECT s.* FROM salg s
JOIN maks m ON s.kategori = m.kategori AND s.solgt = m.m;
-- toppselger per kategori`,
  },
];

const STEPS = [
  { title: "Lese-regel: innenfra og ut", anchor: "lese-regel" },
  { title: "Åtte nivåer — fra enkelt til ekspert", anchor: "nivaer" },
  { title: "Vanlige feller", anchor: "feller" },
  { title: "Subquery eller JOIN", anchor: "vs-join" },
];


export function SubqueriesPage() {
  return (
    <StackPageShell title="Underspørringer — fra nybegynner til ekspert" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            SQL · Nøstede spørringer
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Underspørringer — nøstet SELECT, EXISTS, korrelert, CTE
          </h1>
          <p className="mt-3 text-muted-foreground">
            Subqueries (også: «nested queries», «underspørringer») er SELECT inni SELECT.
            Det er én av de viktigste teknikkene for å løse problemer som JOIN alene
            ikke håndterer elegant. Vi tar dem fra enkleste skalar opp til klassiske
            «topp-N-per-gruppe»-mønstre med flere CTE-er.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <Link to="/drag" className="text-brand hover:underline">
                drag-oppgavene
              </Link>{" "}
              har 14 oppgaver under emnet «Underspørringer» — fyll inn, quiz, og
              rekkefølge.
            </div>
          </div>
        </div>

        {/* Hovedregel */}
        <CourseOutline courseId="subqueries" steps={STEPS} />

        <section id="lese-regel" className="mb-10">
          <div className="rounded-xl border-2 border-brand/40 bg-brand/5 p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Lese-regel
            </div>
            <p className="text-sm text-foreground">
              <strong>Innenfra og ut.</strong> Den innerste SELECTen kjører FØRST. Resultatet
              brukes så av neste lag. Når du ser nøstede queries, finn alltid det innerste,
              spør «hva returnerer den?», deretter «hva gjør laget over med det?».
            </p>
          </div>
        </section>

        {/* Åtte nivåer */}
        <section id="nivaer" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Åtte nivåer — fra enkelt til ekspert</h2>
          <div className="space-y-4">
            {NIVAER.map((n) => (
              <div key={n.niva} className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-3 mb-2">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand text-xs font-bold">
                    {n.niva}
                  </span>
                  <h3 className="font-semibold">{n.navn}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{n.hva}</p>
                <pre className="font-mono text-xs overflow-x-auto whitespace-pre rounded bg-background border border-border p-3">
                  {n.eksempel}
                </pre>
              </div>
            ))}
          </div>
        </section>

        {/* Vanlige feller */}
        <section id="feller" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Vanlige feller</h2>
          <div className="space-y-3 text-sm">
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>NOT IN + NULL-fellen.</strong> Hvis subqueryen returnerer ÉN NULL,
              blir hele NOT IN UKJENT og du får 0 rader. Filtrer NULL ut, eller bruk NOT
              EXISTS.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>= med multi-row subquery.</strong> Hvis subqueryen plutselig
              returnerer 2+ rader, kaster <code>=</code> en runtime-feil. Bruk IN hvis du
              er usikker.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>JOIN-duplikater.</strong> INNER JOIN gir én rad per match — så en
              kunde med 5 ordrer kommer 5 ganger. Bruk DISTINCT eller bytt til EXISTS.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>Korrelert subquery er treg.</strong> Den evaluerer på nytt for HVER
              ytre rad. På store datasett: bytt til JOIN eller window-funksjon
              (ROW_NUMBER OVER PARTITION).
            </div>
          </div>
        </section>

        {/* Subquery vs JOIN */}
        <section id="vs-join" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Subquery eller JOIN — hvilken?</h2>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-1/3">Du vil ...</th>
                  <th className="text-left font-semibold px-4 py-2">Best valg</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-medium">Vise data fra begge tabeller</td>
                  <td className="px-4 py-3 text-muted-foreground">JOIN</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-medium">Sjekke om noe FINNES</td>
                  <td className="px-4 py-3 text-muted-foreground">EXISTS</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-medium">Filtrere på liste av verdier</td>
                  <td className="px-4 py-3 text-muted-foreground">IN (SELECT ...)</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-medium">Beregne én verdi per ytre rad</td>
                  <td className="px-4 py-3 text-muted-foreground">Skalar-subquery i SELECT</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-medium">Filtrere på aggregat (snitt, max)</td>
                  <td className="px-4 py-3 text-muted-foreground">Avledet tabell eller CTE</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-medium">Returnere én rad per gruppe</td>
                  <td className="px-4 py-3 text-muted-foreground">CTE + JOIN på max-verdi, eller window-funksjon</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* CTA */}
        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/drag" className="text-brand hover:underline">
                Drag-oppgaver
              </Link>
              : 14 oppgaver under «Underspørringer» — fra IN/EXISTS opp til tre-nivå
              nesting.
            </li>
            <li>
              <Link to="/practice" className="text-brand hover:underline">
                Practice
              </Link>
              : kjør ekte SQL med subqueries mot et datasett.
              <ArrowRight className="inline h-3.5 w-3.5 ml-1" />
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
