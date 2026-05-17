import { Link } from "@tanstack/react-router";
import { Database } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { BackupTimelineSim } from "./BackupTimelineSim";
import { RecoveryAnimator } from "./RecoveryAnimator";
import { TradeOffMatrix } from "./TradeOffMatrix";
import { MatchQuiz } from "./MatchQuiz";

const STEPS = [
  { title: "Hvorfor backup-strategi er et reelt valg", anchor: "intro" },
  { title: "Tre primitive operasjoner: full / inc / diff", anchor: "primitiver" },
  { title: "30-dagers timeline-simulator", anchor: "timeline" },
  { title: "Recovery — kjernen i pedagogikken", anchor: "recovery" },
  { title: "Tradeoff-matrise (5 × 4)", anchor: "matrise" },
  { title: "Match-quiz: hvilken strategi for hvilken DB?", anchor: "quiz" },
  { title: "3-2-1-regelen og 'er backupen din testet?'", anchor: "regel" },
  { title: "RTO & RPO — de to tallene som styrer alt", anchor: "rto-rpo" },
  { title: "Eksamen-quick-ref", anchor: "eksamen" },
];

export function BackupPage() {
  return (
    <StackPageShell title="Backup-strategier" group="eksamen">
      <article className="container mx-auto px-4 py-10 max-w-3xl">
        <header className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            Database-blokken · backup & recovery
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Backup-strategier — full vs inkrementell vs differensiell
          </h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Backup er ikke en knapp — det er en strategi. Hver natt må du bestemme{" "}
            <em>hvor mye</em> du kopierer, og hver krasj-dag betaler du regningen
            for det valget i form av <em>recovery-tid</em>. Denne lesjonen lar
            deg simulere både siden av regnestykket: 30-dagers timeline med
            disk-volum, og animert recovery-prosess som viser hvorfor en lang
            inkrementell kjede er fundamentalt sårbar.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Database className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Bygger på:</span>{" "}
              <Link
                to="/stack/$slug"
                params={{ slug: "transaksjoner" }}
                className="text-brand hover:underline"
              >
                transaksjoner & ACID
              </Link>{" "}
              (durability), og{" "}
              <Link
                to="/stack/$slug"
                params={{ slug: "dte2505-filsystem" }}
                className="text-brand hover:underline"
              >
                journaling i filsystemet
              </Link>{" "}
              (write-ahead log er samme idé én abstraksjon ned). Praktisk{" "}
              <code className="font-mono">mysqldump</code> dekkes i{" "}
              <Link
                to="/cards"
                className="text-brand hover:underline"
              >
                flashcards
              </Link>{" "}
              under topic "Backup".
            </div>
          </div>
        </header>

        <CourseOutline courseId="backup-strategier" steps={STEPS} />

        <Section number="1" id="intro" title="Hvorfor backup-strategi er et reelt valg">
          <p className="text-sm text-muted-foreground mb-3">
            Den naive løsningen er "ta full backup hver natt". Det fungerer
            helt fint på en 2 GB blogg-DB. Men når datasettet er 1 TB og du har
            et 4-timers backup-vindu om natten, blir realiteten:
          </p>
          <div className="rounded-xl border border-border bg-card p-4 mb-3">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Full hver natt (1 TB):
  1000 GB / 140 MB/s ≈ 2 timer ren disk-IO
  + komprimering + nettverk + verifisering → 3–4 timer
  + 7 TB diskforbruk per uke
  + DB-en må stå stille eller under load hele tida

Etter ett år: 365 TB lagring. Det er ikke "backup",
det er et budsjett-problem.`}</pre>
          </div>
          <p className="text-sm text-muted-foreground">
            Løsningen er å bare kopiere det som har <em>endret seg</em>. Men
            hva er "endret"? Dette skiller de to delta-strategiene:
          </p>
        </Section>

        <Section
          number="2"
          id="primitiver"
          title="Tre primitive operasjoner — bygg-blokkene"
        >
          <div className="grid sm:grid-cols-3 gap-3 mb-3">
            <PrimitiveCard
              color="emerald"
              title="Full"
              code="cp -a /data /backup/full-$DATE"
              what="Kopier alt — hver eneste fil/blokk."
              when="Periodisk anker. Brukes som utgangspunkt for delta-strategiene."
            />
            <PrimitiveCard
              color="amber"
              title="Inkrementell"
              code='rsync --link-dest=prev /data /backup/inc-$DATE'
              what="Bare endringer siden FORRIGE backup (full eller inc)."
              when="Når du vil minimere både plass og backup-vindu."
            />
            <PrimitiveCard
              color="orange"
              title="Differensiell"
              code='rsync --link-dest=last-full /data /backup/diff-$DATE'
              what="Alle endringer siden SISTE FULL backup."
              when="Når du vil minimere plass men holde recovery enkelt."
            />
          </div>
          <div className="rounded-lg border border-border bg-muted/20 p-3 text-xs">
            <div className="font-semibold text-foreground mb-1">
              Kritisk forskjell — én ord
            </div>
            <p className="text-muted-foreground">
              <strong>Inkrementell</strong> = siden forrige backup (kjede).{" "}
              <strong>Differensiell</strong> = siden siste full (alltid 2 filer
              å gjenopprette). Inc er billigst per natt, diff er enklest å
              gjenopprette. Det er hele tradeoff-en i tre ord.
            </p>
          </div>
        </Section>

        <Section
          number="3"
          id="timeline"
          title="30-dagers timeline-simulator"
        >
          <p className="text-sm text-muted-foreground mb-3">
            Velg en strategi og se hver natts backup-størrelse som søyle. Sidepanelet
            viser total lagring + lengste backup-vindu over 30 dager. Bytt mellom
            strategiene og legg merke til at "Full ukentlig + Diff daglig" har en
            <em> voksende</em> søyle gjennom uken (samler opp delta) mens "Full
            ukentlig + Inc daglig" har en konstant lav søyle (bare gårsdagens
            endring).
          </p>
          <BackupTimelineSim />
        </Section>

        <Section
          number="4"
          id="recovery"
          title="Recovery — kjernen i pedagogikken"
        >
          <p className="text-sm text-muted-foreground mb-3">
            Lagrings-regnskapet over 30 dager er bare halve historien. Det
            andre tallet — hvor mange filer du må anvende sekvensielt for å
            komme tilbake — vises ikke i timeline-en. Her er den:
          </p>
          <RecoveryAnimator />
          <div className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/5 p-3 text-sm">
            <div className="font-semibold text-rose-700 dark:text-rose-400 mb-1">
              Hvorfor "Korrupt fil midt i kjeden"-knappen finnes
            </div>
            <p className="text-muted-foreground text-xs">
              Inkrementell-strategien er matematisk avhengig av at ingen ledd i
              kjeden er korrupt. En båndspoler som svikter på dag 4, eller en
              .tar.gz som ikke kan dekomprimeres — og alt etter det punktet er
              uoppnåelig. Dette er hovedgrunnen til at produksjons-DB-er gjerne
              foretrekker differensiell (2 filer er trivielt å verifisere) eller
              continuous log-shipping (replika holder seg synkron live).
            </p>
          </div>
        </Section>

        <Section
          number="5"
          id="matrise"
          title="Tradeoff-matrise: 5 strategier × 4 dimensjoner"
        >
          <p className="text-sm text-muted-foreground mb-3">
            Sammenlign alle strategiene side ved side. Grønn = bra, rød = dårlig
            på den dimensjonen. Vær oppmerksom på at ingen kolonne har bare
            grønt — du <em>må</em> akseptere svakhet et sted.
          </p>
          <TradeOffMatrix />
        </Section>

        <Section
          number="6"
          id="quiz"
          title="Match-quiz — hvilken strategi for hvilken DB?"
        >
          <p className="text-sm text-muted-foreground mb-3">
            Ekte valg styres sjelden av "hva er teknisk best", men av
            kombinasjonen av endrings-rate, RPO-krav, datastørrelse og budsjett.
            Prøv å velg riktig for hvert scenario før du sjekker svaret.
          </p>
          <MatchQuiz />
        </Section>

        <Section
          number="7"
          id="regel"
          title="3-2-1-regelen og 'er backupen din testet?'"
        >
          <div className="rounded-xl border border-border bg-card p-4 mb-3">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`3-2-1-regelen (industri-standard):

  3  kopier av dataene  (1 primær + 2 backup)
  2  forskjellige medier (disk + tape, eller disk + cloud)
  1  off-site            (geografisk separasjon — ikke samme bygning)

Hvorfor: en enkel disk dør (~1 % årlig). En brann tar både
        server-rom og NAS-en under bordet. Ransomware krypterer
        alle mountede shares. Off-site + offline er svaret.`}</pre>
          </div>
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm">
            <div className="font-semibold text-amber-700 dark:text-amber-400 mb-1">
              Ulest backup = ingen backup
            </div>
            <p className="text-muted-foreground text-xs">
              Schroedinger's backup: den eksisterer i en superposisjon av "OK"
              og "korrupt" til du faktisk har restaurert fra den. Tom på sjekkliste:
              kvartalsvis test-restore til en sandbox + integrity-check. Mange
              orgs oppdager først ved katastrofen at backupen har vært tom i
              månedsvis fordi mysqldump silently feilet og crontab returnerte 0.
            </p>
          </div>
        </Section>

        <Section
          number="8"
          id="rto-rpo"
          title="RTO & RPO — de to tallene som styrer alt"
        >
          <div className="grid sm:grid-cols-2 gap-3 mb-3">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                RTO — Recovery Time Objective
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Hvor lang nedetid tåler vi før vi er oppe igjen?
              </p>
              <pre className="font-mono text-xs whitespace-pre">{`RTO = 4 timer
 → backup-strategi må kunne
   gjenopprette på < 4 timer

Pga. dette utelukkes lange
inc-kjeder (RTO blir > 4t)
for store DB-er.`}</pre>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                RPO — Recovery Point Objective
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Hvor mye data kan vi tåle å miste?
              </p>
              <pre className="font-mono text-xs whitespace-pre">{`RPO = 1 minutt
 → må ha backup-punkt
   hvert 60. sekund

Natt-baserte strategier
har RPO ≈ 24t — utilstrekkelig
for bank-DB.
Trenger log-shipping (CDP).`}</pre>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
            <div className="font-semibold text-foreground mb-1">
              Plassér deg på spektrumet
            </div>
            <p className="text-xs text-muted-foreground">
              RTO = sekunder + RPO = sekunder → multi-region replica (dyrt).
              <br />
              RTO = timer + RPO = minutter → continuous log-shipping (CDP).
              <br />
              RTO = timer + RPO = 24t → klassisk natt-backup (inc/diff/GFS).
              <br />
              RTO = dager + RPO = dager → cold offsite tape (billig, sjelden brukt).
            </p>
          </div>
        </Section>

        <Section number="9" id="eksamen" title="Eksamen-quick-ref">
          <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-2">
            <li>
              <strong className="text-foreground">Full backup</strong> — kopi
              av alt. Stor. Eneste filtype som er selvstendig (kan restaureres
              uten andre filer).
            </li>
            <li>
              <strong className="text-foreground">Inkrementell</strong> —
              endringer siden forrige backup (kjede). Liten per natt, men
              recovery krever ALLE inc-filer + siste full i rekkefølge.
              Ett ledd korrupt = kjeden brutt.
            </li>
            <li>
              <strong className="text-foreground">Differensiell</strong> —
              endringer siden siste full. Vokser gjennom uka. Recovery er
              alltid 2 filer: full + siste diff. Sikrere men mer plass enn inc.
            </li>
            <li>
              <strong className="text-foreground">GFS</strong> = Grandfather
              (måned) + Father (uke) + Son (dag). Retention-rotasjon for
              langtidslagring og compliance.
            </li>
            <li>
              <strong className="text-foreground">RTO</strong> = hvor lang
              nedetid tolereres. <strong className="text-foreground">RPO</strong> =
              hvor mye data kan tapes. RTO styrer recovery-strategi (kjedelengde),
              RPO styrer backup-frekvens.
            </li>
            <li>
              <strong className="text-foreground">3-2-1-regelen:</strong> 3
              kopier, 2 medier, 1 off-site. Standard for å overleve enkelt-
              feil (disk-død, brann, ransomware).
            </li>
            <li>
              <strong className="text-foreground">Backup ≠ replikasjon.</strong>{" "}
              En replika kopierer slett-kommandoer også. Backup er en{" "}
              <em>tidsfryst</em> kopi du kan rulle tilbake til.
            </li>
            <li>
              <strong className="text-foreground">Utestet backup = ingen backup.</strong>{" "}
              Periodisk test-restore + integrity-check er obligatorisk.
            </li>
          </ul>
        </Section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Videre lesing</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link
                to="/stack/$slug"
                params={{ slug: "transaksjoner" }}
                className="text-brand hover:underline"
              >
                Transaksjoner & ACID
              </Link>{" "}
              — durability-garantien som backup-en din skal beskytte.
            </li>
            <li>
              <Link
                to="/stack/$slug"
                params={{ slug: "dte2505-filsystem" }}
                className="text-brand hover:underline"
              >
                Filsystem og inodes
              </Link>{" "}
              — journaling-animatoren der viser samme idé på FS-nivå (write-ahead
              log som garanterer atomic crash-konsistens).
            </li>
            <li>
              <Link
                to="/cards"
                className="text-brand hover:underline"
              >
                Flashcards
              </Link>{" "}
              — filtrer på topic "Backup" for praktiske mysqldump/restore-kort.
            </li>
            <li>
              MySQL ref:{" "}
              <a
                href="https://dev.mysql.com/doc/refman/8.0/en/backup-and-recovery.html"
                className="text-brand hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                Backup and Recovery (8.0)
              </a>{" "}
              — binary log, point-in-time recovery, mysqldump-flagg.
            </li>
          </ul>
        </div>
      </article>
    </StackPageShell>
  );
}

function Section({
  number,
  id,
  title,
  children,
}: {
  number: string;
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mb-10">
      <h2 className="text-xl font-semibold mb-3">
        {number}. {title}
      </h2>
      {children}
    </section>
  );
}

function PrimitiveCard({
  color,
  title,
  code,
  what,
  when,
}: {
  color: "emerald" | "amber" | "orange";
  title: string;
  code: string;
  what: string;
  when: string;
}) {
  const borderClass =
    color === "emerald"
      ? "border-emerald-500/30 bg-emerald-500/5"
      : color === "amber"
        ? "border-amber-500/30 bg-amber-500/5"
        : "border-orange-500/30 bg-orange-500/5";
  const textClass =
    color === "emerald"
      ? "text-emerald-600 dark:text-emerald-400"
      : color === "amber"
        ? "text-amber-600 dark:text-amber-400"
        : "text-orange-600 dark:text-orange-400";
  return (
    <div className={`rounded-xl border p-4 ${borderClass}`}>
      <div
        className={`text-xs uppercase tracking-wider font-semibold mb-2 font-mono ${textClass}`}
      >
        {title}
      </div>
      <pre className="font-mono text-[10px] whitespace-pre-wrap break-words bg-background border border-border rounded p-1.5 mb-2 text-foreground">
        {code}
      </pre>
      <p className="text-xs text-foreground mb-1.5">{what}</p>
      <p className="text-[10px] text-muted-foreground">
        <strong className="text-foreground">Brukes når:</strong> {when}
      </p>
    </div>
  );
}
