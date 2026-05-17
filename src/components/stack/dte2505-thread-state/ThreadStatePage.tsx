import { Link } from "@tanstack/react-router";
import { Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { ThreadStateSimulator } from "./ThreadStateSimulator";

const STEPS = [
  { title: "Hvorfor en state-maskin", anchor: "hvorfor" },
  { title: "De fire tilstandene", anchor: "states" },
  { title: "Run-queue vs wait-queue", anchor: "queues" },
  { title: "Interaktiv simulator", anchor: "sim" },
  { title: "Auto-modus + statistikk", anchor: "auto" },
  { title: "Mini-utfordring: forutse sluttilstand", anchor: "challenge" },
  { title: "Eksamen-feller", anchor: "feller" },
];

export function ThreadStatePage() {
  return (
    <StackPageShell title="Thread state-maskin" group="eksamen">
      <article className="container mx-auto px-4 py-10 max-w-3xl">
        <header className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2505 · O&apos;Gorman kap. 2.7 + 2.9
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Thread state-maskin
          </h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Hver tråd lever i én av fire tilstander: <strong>NEW</strong>,{" "}
            <strong>RUN</strong>, <strong>WAIT</strong>, <strong>TERMINATED</strong>.
            Scheduleren og I/O-systemet flytter tråden mellom dem via to køer —{" "}
            <em>run-queue</em> (klar til CPU) og <em>wait-queue</em> (venter på event).
            Denne lesjonen viser overgangene live; den komplementerer{" "}
            <Link to="/stack/$slug" params={{ slug: "dte2505-scheduling-drill" }} className="text-brand hover:underline">
              Gantt-scheduling-drillen
            </Link>{" "}
            som dekker <em>tidsskjedulering</em> (FIFO/SJF/RR/MLFQ), ikke selve state-overgangene.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <a href="#sim" className="text-brand hover:underline">Simulatoren</a>{" "}
              lar deg lage tråder, tikke klokken, trigge I/O-vent og kjøre 10 tråder i auto-modus.
              Mini-utfordringen helt nederst lar deg forutse hvilken state hver tråd ender i.
            </div>
          </div>
        </header>

        <CourseOutline courseId="dte2505-thread-state" steps={STEPS} />

        <Section number="1" id="hvorfor" title="Hvorfor en state-maskin?">
          <p className="text-sm text-muted-foreground mb-3">
            En tråd kan ikke alltid kjøre. CPU-en er én ressurs, men programmer venter
            også på disk, nettverk, tastatur, semaforer, andre tråder. Operativsystemet
            må vite om en tråd er <em>klar til å kjøre</em>, <em>blokkert på noe</em>{" "}
            eller <em>død</em>. Tilstand + køstruktur er bokstavelig talt to felt i
            tråd-kontrollblokken (TCB).
          </p>
          <p className="text-sm text-muted-foreground">
            <strong>Sentral innsikt:</strong> scheduleren tegner aldri Gantt-diagrammer.
            Den kikker bare på run-queue, plukker en tråd, setter den i RUN, og venter på
            en av to ting: kvantum-timer går av, eller tråden ber om noe som blokkerer.
          </p>
        </Section>

        <Section number="2" id="states" title="De fire tilstandene">
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-3 py-2 w-32">Tilstand</th>
                  <th className="text-left font-semibold px-3 py-2">Hva tråden gjør</th>
                  <th className="text-left font-semibold px-3 py-2 w-40">Kø</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono text-cyan-500">NEW</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    Akkurat opprettet via <code className="font-mono">pthread_create</code>{" "}
                    / <code className="font-mono">fork</code>. TCB er allokert, stack er reservert, men
                    scheduleren har ikke kjørt den enda.
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">— (ingen)</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono text-emerald-500">RUN (READY/RUNNING)</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    Klar til, eller aktivt brukende, CPU. O&apos;Gorman slår sammen READY og
                    RUNNING under én RUN-tilstand med to undertilstander.
                  </td>
                  <td className="px-3 py-2 text-muted-foreground font-mono">run-queue</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono text-amber-500">WAIT</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    Blokkert på noe utenfor CPU-en: disk-I/O, nettverk, semafor, signal,
                    annen tråds <code className="font-mono">join</code>. Bruker null CPU.
                  </td>
                  <td className="px-3 py-2 text-muted-foreground font-mono">wait-queue (per event)</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono text-zinc-500">TERMINATED</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    Ferdig (<code className="font-mono">return</code> /{" "}
                    <code className="font-mono">exit</code> / drept av signal). TCB ligger
                    igjen til foreldren <code className="font-mono">join</code>er — ellers blir den zombie.
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">— (utenfor)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        <Section number="3" id="queues" title="Run-queue og wait-queue">
          <p className="text-sm text-muted-foreground mb-3">
            Hjertet i scheduleren er to typer køer:
          </p>
          <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-2 mb-3">
            <li>
              <strong className="text-foreground">Run-queue</strong> (én eller flere per
              CPU). Inneholder alle tråder med state RUN som venter på CPU.
              Vanligvis prioritetsordnet; ved like prioritet brukes round-robin.
              <em> Dette er Gantt-kandidatene.</em>
            </li>
            <li>
              <strong className="text-foreground">Wait-queue</strong> (én per event/ressurs).
              Tråder blokkert på disk har sin egen kø, tråder blokkert på socket har en
              annen, tråder på semafor S har én. Når event-en skjer, flyttes <em>alle</em>{" "}
              (eller én, avhengig av semantikk) ventende tråder tilbake til run-queue.
            </li>
          </ul>
          <p className="text-sm text-muted-foreground">
            <strong>Den fundamentale syklusen:</strong>{" "}
            run-queue → CPU → (kvantum slutt eller blokkering) → tilbake til run-queue
            eller ned i wait-queue → event → opp i run-queue igjen. Hele OS sin
            multitasking består av å flytte TCB-pekere mellom disse listene.
          </p>
        </Section>

        <Section number="4" id="sim" title="Interaktiv simulator">
          <p className="text-sm text-muted-foreground mb-3">
            Lag tråder med valgt prioritet, klikk <em>Tick clock</em> for å la
            scheduleren plukke høyeste-prioritet og kjøre ett kvantum. Trigg I/O på en
            kjørende tråd for å sende den til wait-queue, og fullfør I/O-en for å bringe
            den tilbake. Prøv også <em>Auto-modus</em> for å se 10 tråder utvikle seg
            over 30 ticks med statistikk på slutten.
          </p>
          <ThreadStateSimulator />
        </Section>

        <Section number="5" id="auto" title="Auto-modus — hva statistikken viser">
          <p className="text-sm text-muted-foreground mb-3">
            Auto-modus genererer 10 tråder med blandet prioritet og I/O-tendens og kjører
            30 ticks. To metrikker er sentrale:
          </p>
          <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
            <li>
              <strong className="text-foreground">CPU-bruk</strong>: andel ticks der en
              tråd faktisk satt i RUNNING. Hvis alle tråder havner i wait-queue
              samtidig, går CPU-en idle og denne synker.
            </li>
            <li>
              <strong className="text-foreground">Gjennomsnittlig ventetid</strong>:
              snitt-ticks brukt i run-queue (READY) over hele kjøringen. Høy verdi betyr
              kø-trengsel; lav verdi betyr CPU-en serverer raskt.
            </li>
          </ul>
          <p className="text-sm text-muted-foreground mt-3">
            Skru opp prioritetsnivåer og time-slice-lengde for å se trade-off-en:
            lengre time slice gir høyere CPU-bruk (mindre context-switch overhead i en
            ekte kjerne) men kan øke ventetid for høyprioritets-tråder.
          </p>
        </Section>

        <Section number="6" id="challenge" title="Mini-utfordring">
          <p className="text-sm text-muted-foreground mb-3">
            Tre forhåndsdefinerte oppsett er innebygd i simulatoren under fanen{" "}
            <em>Utfordring</em>. For hvert oppsett: les workloaden, gjett hvilken state
            hver tråd er i etter X ticks, og se fasit. Hensikten er å øve på å lese kø-
            overganger — ikke å regne på Gantt-tider.
          </p>
        </Section>

        <Section number="7" id="feller" title="Eksamen-feller">
          <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-2">
            <li>
              <strong className="text-foreground">«READY og RUNNING er ulike tilstander».</strong>{" "}
              O&apos;Gorman behandler dem som to undertilstander av RUN — viktig hvis spørsmålet
              ber om «de tre/fire tilstandene». Bruk firetilstands-modellen i denne lesjonen.
            </li>
            <li>
              <strong className="text-foreground">«WAIT betyr at scheduleren ignorerer tråden».</strong>{" "}
              Scheduleren ser ikke på wait-queues i det hele tatt for å velge neste tråd —
              det er event-handler-en (interrupt fra disk, semafor-release) som flytter
              tråden tilbake til run-queue.
            </li>
            <li>
              <strong className="text-foreground">«Preempt = TERMINATED».</strong> Nei —
              preempt sender tråden bak i run-queue (state RUN/READY), ikke TERMINATED.
              Bare <code className="font-mono">exit</code>/<code className="font-mono">return</code>/dødelig signal
              gir TERMINATED.
            </li>
            <li>
              <strong className="text-foreground">Glemmer NEW → RUN-overgangen.</strong>{" "}
              En tråd er ikke umiddelbart skedulerbar etter <code className="font-mono">pthread_create</code>;
              scheduleren må først kalle <code className="font-mono">admit()</code> for å flytte
              den fra NEW inn i run-queue.
            </li>
          </ul>
        </Section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Videre lesing</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              O&apos;Gorman kap. 2.7 (thread state) + 2.9 (køer) — pensum-kapitlene denne
              lesjonen dekker.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte2505-scheduling-drill" }} className="text-brand hover:underline">
                CPU-scheduling — Gantt-drill
              </Link>{" "}
              for <em>hvordan</em> scheduleren plukker fra run-queue (FIFO/SJF/STCF/RR/MLFQ).
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte2505-prosesser-signaler" }} className="text-brand hover:underline">
                Prosesser og signaler
              </Link>{" "}
              for Linux-mapping (R/S/D/Z/T) av samme state-maskin.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte-2505" }} className="text-brand hover:underline">
                DTE-2505-hub
              </Link>{" "}
              — alle OS-mini-kursene.
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
