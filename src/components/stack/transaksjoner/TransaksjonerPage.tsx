import { Link } from "@tanstack/react-router";
import { ArrowRight, Lightbulb, AlertTriangle, Lock, RefreshCw } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { TransactionVisualizer } from "@/components/stack/transaksjoner/TransactionVisualizer";
import { RelatedVisualizers } from "@/components/stack/RelatedVisualizers";

// Course page for transactions, ACID, isolation levels, locking and deadlocks.
// Drag-øvelser under emnet "Transaksjoner" parres med denne siden.

const STEPS = [
  { title: "Interaktiv: isolation-anomalier", anchor: "vis" },
  { title: "Hva er en transaksjon?", anchor: "hva" },
  { title: "ACID — fire egenskaper", anchor: "acid" },
  { title: "BEGIN, COMMIT, ROLLBACK", anchor: "kontroll" },
  { title: "Tre lese-problemer", anchor: "leseproblemer" },
  { title: "Isolation levels", anchor: "isolation" },
  { title: "Optimistisk vs pessimistisk låsing", anchor: "laasing" },
  { title: "Savepoints", anchor: "savepoints" },
  { title: "Deadlock — oppstår og oppdages", anchor: "deadlock" },
];

type Acid = { letter: string; navn: string; hva: string; eksempel: string };
const ACID_EGENSKAPER: Acid[] = [
  {
    letter: "A",
    navn: "Atomicity — alt eller ingenting",
    hva: "Alle setninger i transaksjonen utføres fullstendig, eller ingen av dem. Krasjer DB-en midt i overføringen, rulles alt tilbake.",
    eksempel: `BEGIN;
UPDATE Konto SET saldo = saldo - 1000 WHERE id = 1;
UPDATE Konto SET saldo = saldo + 1000 WHERE id = 2;
-- Krasj her? Begge er rullet tilbake. Ingen mister penger.
COMMIT;`,
  },
  {
    letter: "C",
    navn: "Consistency — gyldig før og etter",
    hva: "Constraints (PK, FK, CHECK, NOT NULL) holdes. En transaksjon som bryter en regel, kan ikke commite. Du går fra én gyldig tilstand til en annen.",
    eksempel: `-- CHECK (saldo >= 0)
BEGIN;
UPDATE Konto SET saldo = saldo - 9999 WHERE id = 1;
-- Brudd på CHECK → setningen kaster feil. Etter ROLLBACK
-- er DB i samme gyldige tilstand som før.
ROLLBACK;`,
  },
  {
    letter: "I",
    navn: "Isolation — som om du var alene",
    hva: "Samtidige transaksjoner forstyrrer ikke hverandre. Hvor strikt dette gjelder styres av isolation level (se nedenfor).",
    eksempel: `-- Transaksjon T1:                   Transaksjon T2:
-- BEGIN;                              BEGIN;
-- SELECT saldo FROM K WHERE id=1;     UPDATE K SET saldo=saldo+50 WHERE id=1;
-- (T1 ser den verdien som var         COMMIT;
--  da T2 startet — ikke T2 sitt
--  ucommittede mellomresultat)`,
  },
  {
    letter: "D",
    navn: "Durability — overlever krasj",
    hva: "Etter COMMIT er endringene varige — selv om strømmen ryker. DB skriver først til en write-ahead log (WAL), så til datasidene.",
    eksempel: `BEGIN;
INSERT INTO Ordre (kundenr, total) VALUES (5, 1299);
COMMIT;       -- WAL er fsynced til disk → garantert varig
-- Strømbrudd 0.1 ms senere: ordren er der etter restart.`,
  },
];

type LeseProblem = { navn: string; beskrivelse: string; eksempel: string };
const LESE_PROBLEMER: LeseProblem[] = [
  {
    navn: "Dirty read",
    beskrivelse:
      "Du leser data som en annen transaksjon har endret, men ikke commit-et ennå. Hvis den ruller tilbake, har du lest noe som «aldri skjedde».",
    eksempel: `-- T1:                              T2:
-- BEGIN;                            BEGIN;
-- UPDATE Konto SET saldo=0          SELECT saldo FROM Konto WHERE id=1;
--   WHERE id=1;                     -- (leser 0 — dirty)
-- ROLLBACK;                         -- T2 har nå feilaktige data
`,
  },
  {
    navn: "Non-repeatable read",
    beskrivelse:
      "Du leser samme rad to ganger i én transaksjon og får forskjellig verdi — fordi noen commit-et en endring i mellomtiden.",
    eksempel: `-- T1: BEGIN;
-- T1: SELECT saldo FROM Konto WHERE id=1;   -- 100
--                                          T2: UPDATE Konto SET saldo=200 WHERE id=1;
--                                          T2: COMMIT;
-- T1: SELECT saldo FROM Konto WHERE id=1;   -- 200  (samme rad, ny verdi)
`,
  },
  {
    navn: "Phantom read",
    beskrivelse:
      "Du kjører samme spørring med WHERE to ganger. Andre gang får du nye rader («fantomer») fordi noen satte inn en match imellom.",
    eksempel: `-- T1: BEGIN;
-- T1: SELECT COUNT(*) FROM Ordre WHERE dato='2026-05-12';  -- 7
--                                T2: INSERT INTO Ordre (...) VALUES (...);
--                                T2: COMMIT;
-- T1: SELECT COUNT(*) FROM Ordre WHERE dato='2026-05-12';  -- 8 (ny rad dukket opp)
`,
  },
];

type Isolation = {
  navn: string;
  dirty: string;
  nonrep: string;
  phantom: string;
  kommentar: string;
};
const ISOLATION_LEVELS: Isolation[] = [
  {
    navn: "READ UNCOMMITTED",
    dirty: "Mulig",
    nonrep: "Mulig",
    phantom: "Mulig",
    kommentar: "Svakeste. Sjelden brukt i praksis. Rask, men leser ucommittet skitt.",
  },
  {
    navn: "READ COMMITTED",
    dirty: "Nei",
    nonrep: "Mulig",
    phantom: "Mulig",
    kommentar: "Default i Postgres og Oracle. Du leser bare committet data — men kan se ulike svar i samme transaksjon.",
  },
  {
    navn: "REPEATABLE READ",
    dirty: "Nei",
    nonrep: "Nei",
    phantom: "Mulig (i SQL-standard)",
    kommentar: "Default i MySQL/InnoDB. Hver rad du leser, forblir den samme gjennom hele transaksjonen.",
  },
  {
    navn: "SERIALIZABLE",
    dirty: "Nei",
    nonrep: "Nei",
    phantom: "Nei",
    kommentar: "Strikteste. Som om transaksjonene kjørte etter hverandre. Treig og kan kaste serialization-feil — du må prøve på nytt.",
  },
];

export function TransaksjonerPage() {
  return (
    <StackPageShell title="Transaksjoner — ACID og isolation" group="stack">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            Database · Concurrency
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Transaksjoner, ACID og isolation levels
          </h1>
          <p className="mt-3 text-muted-foreground">
            En transaksjon (eng: <em>transaction</em>) er en logisk arbeidsenhet som
            enten lykkes i sin helhet eller rulles tilbake helt. Når flere klienter
            jobber mot samme database samtidig, må DB-en garantere både korrekthet
            (ACID) og noenlunde fornuftig ytelse — det er en avveiing styrt av
            <em> isolation levels</em>.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <Link to="/drag" className="text-brand hover:underline">
                drag-oppgavene
              </Link>{" "}
              har et eget sett under «Transaksjoner» — ACID-bokstav-match,
              isolation-level-quiz, deadlock-scenario og savepoint-fill.
            </div>
          </div>
        </div>

        <CourseOutline courseId="transaksjoner" steps={STEPS} />

        {/* Interaktiv visualisering */}
        <section id="vis" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">
            Interaktiv: se anomalien skje (eller bli forhindret)
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Velg et scenario og et isolation level, og step gjennom timelinen for to
            samtidige transaksjoner (TX1 og TX2). Rød pulserende boks = anomali. Grønt
            låse-ikon = nivået holdt deg trygg.
          </p>
          <TransactionVisualizer />
        </section>

        {/* Hva er en transaksjon */}
        <section id="hva" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Hva er en transaksjon?</h2>
          <p className="text-sm text-muted-foreground mb-3">
            En transaksjon er en sekvens av SQL-setninger som DB-en behandler som ÉN
            uatskillelig enhet. Klassiske eksempel: pengeoverføring, ordrelegging,
            studentregistrering. Hvis noe går galt midt i, må alt rulles tilbake — du
            kan ikke ha halve operasjonen liggende igjen.
          </p>
          <pre className="font-mono text-xs overflow-x-auto whitespace-pre rounded bg-background border border-border p-3">{`-- Den klassiske bankoverføringen
BEGIN;                                         -- start transaksjon
UPDATE Konto SET saldo = saldo - 1000 WHERE id = 1;
UPDATE Konto SET saldo = saldo + 1000 WHERE id = 2;
INSERT INTO Transaksjonslogg (fra, til, belop) VALUES (1, 2, 1000);
COMMIT;                                        -- gjør endringene varige

-- Hvis noe feiler mellom de tre setningene, kjør ROLLBACK
-- og alle tre nullstilles.`}</pre>
        </section>

        {/* ACID */}
        <section id="acid" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">ACID — de fire garantiene</h2>
          <p className="text-sm text-muted-foreground mb-4">
            ACID er fire egenskaper en relasjonsdatabase lover å overholde. Lær
            bokstavene én og én — eksamen spør ofte «hvilken ACID-bokstav handler om
            X?».
          </p>
          <div className="space-y-4">
            {ACID_EGENSKAPER.map((a) => (
              <div key={a.letter} className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-3 mb-2">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand text-base font-bold">
                    {a.letter}
                  </span>
                  <h3 className="font-semibold">{a.navn}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{a.hva}</p>
                <pre className="font-mono text-xs overflow-x-auto whitespace-pre rounded bg-background border border-border p-3">
                  {a.eksempel}
                </pre>
              </div>
            ))}
          </div>
        </section>

        {/* BEGIN / COMMIT / ROLLBACK */}
        <section id="kontroll" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">BEGIN, COMMIT, ROLLBACK</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Tre setninger styrer transaksjonen. <code>BEGIN</code> (eller{" "}
            <code>START TRANSACTION</code>) åpner en. <code>COMMIT</code> gjør alt
            varig. <code>ROLLBACK</code> kaster alt.
          </p>
          <div className="overflow-hidden rounded-lg border border-border mb-4">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-40">Setning</th>
                  <th className="text-left font-semibold px-4 py-2">Effekt</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">BEGIN</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    Åpne ny transaksjon. Alt etter dette er pending.
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">COMMIT</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    Skriv endringer til disk varig. Frigjør låser. Andre transaksjoner ser nå dataene.
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">ROLLBACK</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    Kast alle endringer siden BEGIN. Frigjør låser. DB i samme tilstand som før.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <pre className="font-mono text-xs overflow-x-auto whitespace-pre rounded bg-background border border-border p-3">{`-- Autocommit er ofte ON som default — hver setning er sin egen
-- transaksjon. Slå av eksplisitt for å samle flere:
SET autocommit = 0;          -- MySQL
BEGIN;
  INSERT INTO Ordre (...) VALUES (...);
  INSERT INTO Ordrelinje (...) VALUES (...);
  INSERT INTO Ordrelinje (...) VALUES (...);
COMMIT;`}</pre>
        </section>

        {/* Tre lese-problemer */}
        <section id="leseproblemer" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Tre lese-problemer ved samtidighet</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Når flere transaksjoner kjører parallelt mot samme rader, kan rare ting
            skje. Tre klassiske mønstre — og isolation level styrer hvilke av dem
            DB-en hindrer.
          </p>
          <div className="space-y-4">
            {LESE_PROBLEMER.map((p) => (
              <div key={p.navn} className="rounded-xl border border-amber-500/40 bg-amber-500/5 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-amber-700 dark:text-amber-400" />
                  <h3 className="font-semibold">{p.navn}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{p.beskrivelse}</p>
                <pre className="font-mono text-xs overflow-x-auto whitespace-pre rounded bg-background border border-border p-3">
                  {p.eksempel}
                </pre>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
            <strong>Lost update</strong> er en fjerde klassiker: T1 og T2 leser samme
            rad, begge regner ut ny verdi basert på den, og T2 skriver over T1 sitt
            resultat. Løses med SELECT ... FOR UPDATE eller optimistisk locking
            (versjonskolonne).
          </div>
        </section>

        {/* Isolation levels */}
        <section id="isolation" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Isolation levels — fra svak til streng</h2>
          <p className="text-sm text-muted-foreground mb-4">
            SQL-standarden definerer fire isolation levels. Hvert nivå tetter flere av
            de tre lese-problemene — men koster mer i ytelse fordi DB-en må holde
            flere låser eller versjoner.
          </p>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2">Nivå</th>
                  <th className="text-left font-semibold px-2 py-2 hidden sm:table-cell">Dirty</th>
                  <th className="text-left font-semibold px-2 py-2 hidden sm:table-cell">Non-rep</th>
                  <th className="text-left font-semibold px-2 py-2 hidden sm:table-cell">Phantom</th>
                  <th className="text-left font-semibold px-4 py-2">Kommentar</th>
                </tr>
              </thead>
              <tbody>
                {ISOLATION_LEVELS.map((l) => (
                  <tr key={l.navn} className="border-t border-border">
                    <td className="px-4 py-3 font-mono text-brand text-xs">{l.navn}</td>
                    <td className="px-2 py-3 text-xs hidden sm:table-cell">{l.dirty}</td>
                    <td className="px-2 py-3 text-xs hidden sm:table-cell">{l.nonrep}</td>
                    <td className="px-2 py-3 text-xs hidden sm:table-cell">{l.phantom}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{l.kommentar}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <pre className="mt-4 font-mono text-xs overflow-x-auto whitespace-pre rounded bg-background border border-border p-3">{`-- Sett nivå per transaksjon (Postgres/MySQL)
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
BEGIN;
  SELECT SUM(saldo) FROM Konto;          -- konsistent øyeblikksbilde
COMMIT;`}</pre>
        </section>

        {/* Optimistisk vs pessimistisk */}
        <section id="laasing" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Optimistisk vs pessimistisk låsing</h2>
          <p className="text-sm text-muted-foreground mb-4">
            To strategier for å unngå at to transaksjoner overskriver hverandre. Velg
            ut fra konflikt-frekvens.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-success/40 bg-success/5 p-5">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="h-4 w-4 text-success" />
                <h3 className="font-semibold">Pessimistisk — lås tidlig</h3>
              </div>
              <p className="text-sm mb-3">
                Lås raden mens du jobber. Andre må vente til du commit-er. Trygt,
                men kan skape kø og deadlocks ved høy last.
              </p>
              <pre className="font-mono text-xs overflow-x-auto whitespace-pre rounded bg-background border border-border p-3">{`BEGIN;
SELECT saldo FROM Konto WHERE id=1
  FOR UPDATE;                  -- eksklusiv låsing
UPDATE Konto SET saldo = saldo - 100
  WHERE id=1;
COMMIT;`}</pre>
            </div>
            <div className="rounded-xl border border-brand/40 bg-brand/5 p-5">
              <div className="flex items-center gap-2 mb-2">
                <RefreshCw className="h-4 w-4 text-brand" />
                <h3 className="font-semibold">Optimistisk — sjekk ved skriving</h3>
              </div>
              <p className="text-sm mb-3">
                Ikke lås — bare sjekk om raden er endret mellom lesing og skriving
                (versjonsnummer). Hvis ja: feil, prøv på nytt. Bra ved lav
                konflikt-rate.
              </p>
              <pre className="font-mono text-xs overflow-x-auto whitespace-pre rounded bg-background border border-border p-3">{`-- Les versjon
SELECT saldo, versjon FROM Konto WHERE id=1;
-- (saldo=100, versjon=7)
-- Skriv bare hvis versjon ikke har endret seg
UPDATE Konto
  SET saldo = 90, versjon = versjon + 1
  WHERE id=1 AND versjon = 7;
-- 0 rader rammet → noen kom oss i forkjøpet → retry`}</pre>
            </div>
          </div>
        </section>

        {/* Savepoints */}
        <section id="savepoints" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Savepoints — delvis rollback</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Inne i en transaksjon kan du sette navngitte sjekkpunkter. Da kan du
            rulle tilbake til ett av dem uten å avbryte hele transaksjonen. Brukes
            for å håndtere feil i understeg.
          </p>
          <pre className="font-mono text-xs overflow-x-auto whitespace-pre rounded bg-background border border-border p-3">{`BEGIN;
  INSERT INTO Ordre (kundenr, total) VALUES (5, 0);

  SAVEPOINT linjer_start;

  INSERT INTO Ordrelinje (ordrenr, prodnr, antall) VALUES (LAST_INSERT_ID(), 1, 2);
  INSERT INTO Ordrelinje (ordrenr, prodnr, antall) VALUES (LAST_INSERT_ID(), 99, 1);
  -- prodnr 99 finnes ikke → FK-feil

  ROLLBACK TO SAVEPOINT linjer_start;  -- rull bare linjene tilbake
  -- ordren ligger fremdeles inne, vi kan logge feilen og fortsette

  UPDATE Ordre SET status='kansellert' WHERE ordrenr=LAST_INSERT_ID();
COMMIT;`}</pre>
        </section>

        {/* Deadlock */}
        <section id="deadlock" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Deadlock — to transaksjoner venter på hverandre</h2>
          <p className="text-sm text-muted-foreground mb-4">
            En deadlock oppstår når T1 venter på en lås T2 holder, samtidig som T2
            venter på en lås T1 holder. DB-en oppdager dette automatisk, dreper én av
            transaksjonene (offeret), og lar den andre fortsette. Klienten må fange
            feilen og prøve igjen.
          </p>
          <pre className="font-mono text-xs overflow-x-auto whitespace-pre rounded bg-background border border-border p-3">{`-- Klassisk eksempel: motsatt rekkefølge på låsing
-- T1:                                T2:
-- BEGIN;                             BEGIN;
-- UPDATE Konto SET ... WHERE id=1;   UPDATE Konto SET ... WHERE id=2;
-- (har lås på rad 1)                 (har lås på rad 2)
-- UPDATE Konto SET ... WHERE id=2;   UPDATE Konto SET ... WHERE id=1;
-- (venter på T2)                     (venter på T1) ← DEADLOCK
--
-- DB-en oppdager syklus i wait-for-grafen og dreper én.
-- Postgres-melding: ERROR: deadlock detected
-- MySQL/InnoDB-melding: Deadlock found when trying to get lock`}</pre>
          <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
            <strong>Forebygging:</strong>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Lås alltid rader i samme rekkefølge (f.eks. stigende id).</li>
              <li>Hold transaksjoner KORTE — gjør forretningslogikk før BEGIN.</li>
              <li>Bruk lavere isolation level der det er trygt.</li>
              <li>Fang deadlock-feilen og retry med eksponentiell backoff.</li>
            </ul>
          </div>
        </section>

        {/* CTA */}
        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/drag" className="text-brand hover:underline">
                Drag-oppgaver
              </Link>{" "}
              under «Transaksjoner» — ACID-bokstav-match, isolation-level-quiz,
              deadlock-scenario.
            </li>
            <li>
              <Link
                to="/stack/$slug"
                params={{ slug: "indekser" }}
                className="text-brand hover:underline"
              >
                Indekser
              </Link>{" "}
              — hvordan DB-en finner rader raskt, og hvorfor noen UPDATEs er trege.
              <ArrowRight className="inline h-3.5 w-3.5 ml-1" />
            </li>
          </ul>
        </div>
        <RelatedVisualizers slug="transaksjoner" />
      </div>
    </StackPageShell>
  );
}
