import { Link } from "@tanstack/react-router";
import { ArrowRight, Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { KrakefotSymbols } from "./KrakefotSymbols";
import { RelasjonLesing } from "./RelasjonLesing";
import { CardinalityCard } from "./CardinalityCard";
import { MappingRulesTable } from "./MappingRulesTable";
import { ErDrill } from "./ErDrill";
import { DRILL_EXERCISES } from "./drillExercises";

const SJEKKLISTE: string[] = [
  "Finn entitetene (substantivene): KUNDE, ORDRE, PRODUKT…",
  "Sett opp attributter; marker primærnøkkel (understrek).",
  "Finn relasjonene (verbene): «kunde legger inn ordre».",
  "For hver relasjon, spør to ganger: hvor mange B per A? (ytre symbol) og må A ha minst én B? (indre symbol). Gjenta motsatt retning.",
  "Identifiser M:N — lag koblingstabell med eventuelle relasjons-attributter.",
  "Sjekk svake entiteter (eksisterer bare gjennom en eier).",
  "Skriv ut tabellene: PK understreket, FK med pil/notasjon.",
];

export function ErMappingPage() {
  return (
    <StackPageShell title="ER → DDL mapping" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        {/* Topp */}
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            Eksamensforberedelse · Trinn 4
          </div>
          <h1 className="text-3xl font-bold tracking-tight">ER → DDL mapping</h1>
          <p className="mt-3 text-muted-foreground">
            Du kjenner krakefot-notasjonen. Nå skal vi krysse broen fra{" "}
            <em>diagram</em> til <em>SQL</em>: hver entitet, hver relasjon og hver
            kardinalitet har en spesifikk oversettelse til <code>CREATE TABLE</code>.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Vil du tegne fra scratch først?</span>{" "}
              <Link to="/er-tegner" className="text-brand hover:underline">
                Bruk ER-tegneren
              </Link>{" "}
              for å øve på selve diagrammet. Her fokuserer vi på oversettelsen til DDL.
            </div>
          </div>
        </div>

        {/* 1. Krakefot-symboler */}
        <KrakefotSymbols />

        {/* 1b. Hvordan lese et forhold */}
        <RelasjonLesing />

        {/* 2. Tre kardinaliteter */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Tre kardinaliteter</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Nesten alt du møter er en av disse tre. Hver har sin egen mapping-oppskrift.
          </p>
          <div className="grid sm:grid-cols-3 gap-3">
            <CardinalityCard
              type="1 : 1"
              diagram="PERSON ||——|| PASS"
              description="Hver person har ett pass; hvert pass tilhører én person."
              mapping="Slå sammen til én tabell, eller legg FK på den ene siden med UNIQUE."
            />
            <CardinalityCard
              type="1 : N"
              diagram="KUNDE ||——O< BESTILLING"
              description="Én kunde har 0..N bestillinger; én bestilling har akkurat én kunde."
              mapping="FK på mange-siden (BESTILLING.kunde_id → KUNDE.id)."
            />
            <CardinalityCard
              type="M : N"
              diagram="STUDENT >O——O< FAG"
              description="En student kan ha mange fag; et fag kan ha mange studenter."
              mapping="Koblingstabell med to FK-er som sammensatt PK."
            />
          </div>
        </section>

        {/* 3. Mapping-regler */}
        <MappingRulesTable />

        {/* 4. Eksempel: M:N med koblingstabell */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">
            Eksempel: M:N med koblingstabell
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            STUDENT og FAG er klassikeren. Koblingstabellen TAR holder
            relasjons-attributtet <code>semester</code>, og sammensatt PK{" "}
            <code>(sid, fkode)</code> hindrer dobbeltregistrering.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`STUDENT(sid, navn)
FAG(fkode, tittel)
TAR(sid, fkode, semester)        -- koblingstabell
   FOREIGN KEY (sid)   REFERENCES STUDENT(sid)
   FOREIGN KEY (fkode) REFERENCES FAG(fkode)

CREATE TABLE student (
  sid  INTEGER PRIMARY KEY,
  navn TEXT NOT NULL
);

CREATE TABLE fag (
  fkode  TEXT PRIMARY KEY,
  tittel TEXT NOT NULL
);

CREATE TABLE tar (
  sid       INTEGER NOT NULL,
  fkode     TEXT    NOT NULL,
  semester  TEXT,
  PRIMARY KEY (sid, fkode),
  FOREIGN KEY (sid)   REFERENCES student(sid),
  FOREIGN KEY (fkode) REFERENCES fag(fkode)
);`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Relasjons-attributter (her: <code>semester</code>) hører hjemme i
            koblingstabellen — ikke i STUDENT eller FAG.
          </p>
        </section>

        {/* 5. FK-plassering huskeregel */}
        <section className="mb-10">
          <div className="rounded-xl border-2 border-amber-500/40 bg-amber-500/10 p-5">
            <div className="text-xs uppercase tracking-wider text-amber-700 dark:text-amber-400 font-semibold mb-2">
              Huskeregel for FK-plassering (1:N)
            </div>
            <p className="text-lg font-semibold text-foreground">
              «FK-en bor på mange-siden.»
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Hvis du er i tvil: siden som peker mot 1 (krakefoten <code>||</code>) er
              der FK-en hører hjemme. Tenk «hver bestilling kjenner sin ene kunde»{" "}
              — derfor sitter <code>kunde_id</code> i BESTILLING, ikke omvendt.
            </p>
          </div>
        </section>

        {/* 6. Sjekkliste */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">
            Sjekkliste for å tegne et ER-diagram
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Sju steg. Bruk dem som rekkefølge når du står foran et tomt ark på eksamen.
          </p>
          <ol className="space-y-2">
            {SJEKKLISTE.map((step, i) => (
              <li
                key={i}
                className="flex gap-3 rounded-lg border border-border bg-card p-3"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand text-xs font-bold">
                  {i + 1}
                </span>
                <span className="text-sm text-foreground">{step}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* 7. Drill-oppgaver */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-2">
            Drill-oppgaver — fra diagram til DDL
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            {DRILL_EXERCISES.length} øvelser i økende vanskelighetsgrad. Klikk på en for
            å se diagrammet og skrive <code>CREATE TABLE</code>-er. Sjekken er lempelig
            på mellomrom, casing og kolonnerekkefølge — den sjekker at sentrale
            tabellnavn, PK, FK og constraints er på plass.
          </p>
          <Accordion type="multiple" className="rounded-xl border border-border bg-card">
            {DRILL_EXERCISES.map((ex, i) => (
              <AccordionItem
                key={ex.id}
                value={ex.id}
                className="border-b last:border-b-0 px-5"
              >
                <AccordionTrigger>
                  <span className="flex items-center gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-bold text-muted-foreground">
                      {i + 1}
                    </span>
                    <span>{ex.title}</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <ErDrill exercise={ex} />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* Bunn-CTA */}
        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/er-tegner" className="text-brand hover:underline">
                ER-tegneren
              </Link>
              : tegn dine egne diagrammer fra bunnen.
            </li>
            <li>
              <Link to="/practice" className="text-brand hover:underline">
                Practice
              </Link>
              : øv på SQL-spørringer mot ferdige skjemaer.
            </li>
            <li>
              <Link to="/stack" className="text-brand hover:underline">
                Stack-oversikten
              </Link>
              <ArrowRight className="inline h-3.5 w-3.5 ml-1" />
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
