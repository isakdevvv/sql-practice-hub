import { Link } from "@tanstack/react-router";
import { Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { ProsessMonitor } from "./ProsessMonitor";
import { ProcessStateMachine } from "./ProcessStateMachine";
import { ProcessVisualizer } from "./ProcessVisualizer";
import { Mermaid } from "@/components/Mermaid";

const PROSESS_LIVSSYKLUS = `stateDiagram-v2
  [*] --> Ready: fork() / exec()
  Ready --> Running: scheduler velger
  Running --> Ready: time slice utlopt
  Running --> Blocked: I/O wait
  Blocked --> Ready: I/O ferdig
  Running --> Terminated: exit() / kill
  Terminated --> [*]`;

const STEPS = [
  { title: "Livssyklus-visualisering", anchor: "livssyklus" },
  { title: "Prosess-tilstander", anchor: "tilstander" },
  { title: "Hva sender en prosess hvor?", anchor: "transitions" },
  { title: "ps aux — slik leser du output", anchor: "ps" },
  { title: "ps-flagg cheat-sheet", anchor: "ps-flagg" },
  { title: "Signaler-tabell", anchor: "signaler" },
  { title: "SIGTERM vs SIGKILL", anchor: "term-vs-kill" },
  { title: "Sandkasse — send signal", anchor: "sandkasse" },
  { title: "Foreground vs background", anchor: "fg-bg" },
  { title: "Zombie og orphan", anchor: "zombie" },
  { title: "nice / renice", anchor: "nice" },
];

export function ProsesserSignalerPage() {
  return (
    <StackPageShell title="Prosesser & signaler" group="eksamen">
      <article className="container mx-auto px-4 py-10 max-w-3xl">
        <header className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2505 · Prosess-håndtering
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Prosesser og signaler
          </h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            En prosess er én kjørende kopi av et program. Kernelen styrer dem som en barnehage —
            putter dem i søvn når de venter, vekker dem når data er klart, og dreper dem hvis
            de hører på signalene. Lær tilstandene, signal-koden og hva som faktisk skiller
            SIGTERM fra SIGKILL.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <a href="#sandkasse" className="text-brand hover:underline">prosess-sandkassen lenger ned</a>{" "}
              + drag under{" "}
              <Link to="/drag" className="text-brand hover:underline">«Linux-prosesser»</Link>.
            </div>
          </div>
        </header>

        <CourseOutline courseId="dte2505-prosesser-signaler" steps={STEPS} />

        <section id="livssyklus" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">
            Interaktiv: hele livssyklusen
          </h2>
          <p className="text-sm text-muted-foreground mb-3">
            Fem moduser i ett verktøy. Tenk på prosessen som en oppskrift som blir
            til en kake — <code className="font-mono">fork()</code> kopierer oppskriften,{" "}
            <code className="font-mono">exec()</code> bytter oppskrift midt i, og{" "}
            <code className="font-mono">wait()</code> er bakeren som venter ved ovnen.
            Klikk gjennom hver modus.
          </p>
          <ProcessVisualizer />
        </section>

        <section id="tilstander" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Prosess-tilstander (STAT-kolonnen)</h2>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-20">STAT</th>
                  <th className="text-left font-semibold px-4 py-2 w-44">Navn</th>
                  <th className="text-left font-semibold px-4 py-2">Når?</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">R</td><td className="px-4 py-3">Running</td><td className="px-4 py-3 text-muted-foreground">Bruker CPU akkurat nå, eller står klar i kø.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">S</td><td className="px-4 py-3">Sleeping (interruptible)</td><td className="px-4 py-3 text-muted-foreground">Venter på noe (I/O, timer, semafor). Kan vekkes av signaler.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">D</td><td className="px-4 py-3">Disk wait (uninterruptible)</td><td className="px-4 py-3 text-muted-foreground">Venter på maskinvare. Kan IKKE vekkes — selv ikke av SIGKILL.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">T</td><td className="px-4 py-3">Stopped</td><td className="px-4 py-3 text-muted-foreground">Pauset (SIGSTOP, Ctrl+Z, debugger). Fortsett med SIGCONT.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">Z</td><td className="px-4 py-3">Zombie</td><td className="px-4 py-3 text-muted-foreground">Død, men parent har ikke <code className="font-mono">wait()</code>-et exit-koden ennå.</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="transitions" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Hvordan kommer en prosess i hver tilstand?</h2>
          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-3">
              Livssyklus — fra fork() til exit()
            </div>
            <Mermaid
              chart={PROSESS_LIVSSYKLUS}
              ariaLabel="Tilstandsdiagram: prosess-livssyklus mellom Ready, Running, Blocked og Terminated"
            />
            <p className="text-xs text-muted-foreground mt-3">
              Forenklet bilde med fire kjernetilstander. Linux har flere
              (Stopped/Zombie), men dette er rammeverket pensum bygger pa.
            </p>
          </div>
          <div className="mb-4">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Interaktiv: kjør gjennom hendelser
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Klikk en hendelse for å se prosessen bevege seg gjennom livssyklusen.
              Bare gyldige overganger fra nåværende tilstand er aktive — du kan
              ikke I/O-blokkere en READY-prosess, bare en RUNNING. PCB-en oppdaterer
              seg med ny state og PC.
            </p>
            <ProcessStateMachine />
          </div>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-20">Fra → Til</th>
                  <th className="text-left font-semibold px-4 py-2">Hva utløste skiftet?</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">R → S</td><td className="px-4 py-3 text-muted-foreground">Prosess kalte <code className="font-mono">read()</code> på en pipe/socket og må vente.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">S → R</td><td className="px-4 py-3 text-muted-foreground">Data ankom, eller timer utløp, eller et signal kom inn.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">R → D</td><td className="px-4 py-3 text-muted-foreground">Disk-I/O — kernelen lover å vekke når controller-en er klar.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">R → T</td><td className="px-4 py-3 text-muted-foreground">Mottok SIGSTOP, SIGTSTP (Ctrl+Z) eller SIGTTIN/SIGTTOU.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">T → R</td><td className="px-4 py-3 text-muted-foreground">Mottok SIGCONT (<code className="font-mono">fg</code>, <code className="font-mono">bg</code>, eller kill -CONT).</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">R → Z</td><td className="px-4 py-3 text-muted-foreground">Prosess kalte <code className="font-mono">exit()</code>. Parent har ikke wait()-et ennå.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">Z → (borte)</td><td className="px-4 py-3 text-muted-foreground">Parent kjørte <code className="font-mono">wait()</code> / <code className="font-mono">waitpid()</code>. PID frigjøres.</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="ps" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. ps aux — slik leser du output</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`$ ps aux
USER       PID  %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root         1   0.0  0.5 168432 12100 ?        Ss   mai13   0:02 /sbin/init
isak      1042  87.4 12.3 524288 91200 pts/0    R+   14:22   0:18 python sim.py
isak      1133   0.0  0.3   8800   600 pts/0    D    14:25   0:00 dd if=/dev/sda
isak      1201   0.0  8.2 421000 78900 ?        Tl   14:26   0:03 node webserver.js`}</pre>
            <ul className="mt-3 text-xs text-muted-foreground space-y-1">
              <li><strong>USER/PID</strong> — eier og prosess-ID.</li>
              <li><strong>%CPU/%MEM</strong> — andel av tilgjengelig CPU og RAM.</li>
              <li><strong>VSZ/RSS</strong> — virtuelt størrelse / resident set (faktisk RAM brukt).</li>
              <li><strong>TTY</strong> — knyttet terminal, eller <code className="font-mono">?</code> for daemon.</li>
              <li><strong>STAT</strong> — tilstand + flagg: <code className="font-mono">s</code> = session leader, <code className="font-mono">+</code> = foreground, <code className="font-mono">l</code> = multi-threaded.</li>
              <li><strong>COMMAND</strong> — full kommando.</li>
            </ul>
          </div>
        </section>

        <section id="ps-flagg" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. ps-flagg cheat-sheet</h2>
          <p className="text-sm text-muted-foreground mb-3">
            <code className="font-mono">ps</code> har to historiske syntakser: BSD (uten bindestrek) og UNIX
            (med). Begge fungerer på Linux.
          </p>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-44">Kommando</th>
                  <th className="text-left font-semibold px-4 py-2 w-24">Stil</th>
                  <th className="text-left font-semibold px-4 py-2">Hva får du?</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">ps</td><td className="px-4 py-3">BSD</td><td className="px-4 py-3 text-muted-foreground">Bare egne prosesser i denne terminal. Stort sett aldri det du vil.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">ps aux</td><td className="px-4 py-3">BSD</td><td className="px-4 py-3 text-muted-foreground">Alle (a) brukere (u), inkl. uten TTY (x). Klassisk default.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">ps -ef</td><td className="px-4 py-3">UNIX</td><td className="px-4 py-3 text-muted-foreground">Alle (-e) i full format (-f). Inkluderer parent PID (PPID).</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">ps -fU isak</td><td className="px-4 py-3">UNIX</td><td className="px-4 py-3 text-muted-foreground">Alle prosesser eid av brukeren isak.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">ps -o pid,user,cmd</td><td className="px-4 py-3">UNIX</td><td className="px-4 py-3 text-muted-foreground">Velg kolonner selv. Lett å pipe videre.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">ps --forest</td><td className="px-4 py-3">GNU</td><td className="px-4 py-3 text-muted-foreground">ASCII-tre av parent/child-relasjoner.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">pgrep -fl python</td><td className="px-4 py-3">—</td><td className="px-4 py-3 text-muted-foreground">Bare PID-ene av prosesser hvis kommandolinje matcher «python».</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">top / htop</td><td className="px-4 py-3">—</td><td className="px-4 py-3 text-muted-foreground">Interaktiv visning. <code className="font-mono">htop</code> er penere.</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="signaler" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Signaler — språket kernelen bruker</h2>
          <div className="overflow-hidden rounded-lg border border-border mb-3">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-3 py-2 w-32">Signal</th>
                  <th className="text-left font-semibold px-3 py-2 w-12">Nr.</th>
                  <th className="text-left font-semibold px-3 py-2 w-24">Default</th>
                  <th className="text-left font-semibold px-3 py-2 w-24">Kan fanges?</th>
                  <th className="text-left font-semibold px-3 py-2">Bruk</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border"><td className="px-3 py-2 font-mono text-brand">SIGHUP</td><td className="px-3 py-2 font-mono">1</td><td className="px-3 py-2 text-muted-foreground">Terminate</td><td className="px-3 py-2 text-success">Ja</td><td className="px-3 py-2 text-muted-foreground">Terminalen lukket, eller daemon reload-config.</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2 font-mono text-brand">SIGINT</td><td className="px-3 py-2 font-mono">2</td><td className="px-3 py-2 text-muted-foreground">Terminate</td><td className="px-3 py-2 text-success">Ja</td><td className="px-3 py-2 text-muted-foreground">Ctrl+C. Python reiser KeyboardInterrupt.</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2 font-mono text-brand">SIGQUIT</td><td className="px-3 py-2 font-mono">3</td><td className="px-3 py-2 text-muted-foreground">Core dump</td><td className="px-3 py-2 text-success">Ja</td><td className="px-3 py-2 text-muted-foreground">Ctrl+\. Dump for debugging.</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2 font-mono text-brand">SIGKILL</td><td className="px-3 py-2 font-mono">9</td><td className="px-3 py-2 text-muted-foreground">Terminate</td><td className="px-3 py-2 text-destructive">NEI</td><td className="px-3 py-2 text-muted-foreground">Siste utvei. Kan IKKE blokkeres/ignoreres.</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2 font-mono text-brand">SIGSEGV</td><td className="px-3 py-2 font-mono">11</td><td className="px-3 py-2 text-muted-foreground">Core dump</td><td className="px-3 py-2 text-success">Ja</td><td className="px-3 py-2 text-muted-foreground">Segfault — ulovlig minneadresse.</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2 font-mono text-brand">SIGPIPE</td><td className="px-3 py-2 font-mono">13</td><td className="px-3 py-2 text-muted-foreground">Terminate</td><td className="px-3 py-2 text-success">Ja</td><td className="px-3 py-2 text-muted-foreground">Skrev til pipe der leseren er død.</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2 font-mono text-brand">SIGTERM</td><td className="px-3 py-2 font-mono">15</td><td className="px-3 py-2 text-muted-foreground">Terminate</td><td className="px-3 py-2 text-success">Ja</td><td className="px-3 py-2 text-muted-foreground">Default for <code className="font-mono">kill PID</code>. «Vær så snill å avslutte».</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2 font-mono text-brand">SIGCONT</td><td className="px-3 py-2 font-mono">18</td><td className="px-3 py-2 text-muted-foreground">Continue</td><td className="px-3 py-2 text-success">Ja</td><td className="px-3 py-2 text-muted-foreground">Fortsett etter SIGSTOP/SIGTSTP.</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2 font-mono text-brand">SIGSTOP</td><td className="px-3 py-2 font-mono">19</td><td className="px-3 py-2 text-muted-foreground">Stop</td><td className="px-3 py-2 text-destructive">NEI</td><td className="px-3 py-2 text-muted-foreground">Pause prosessen. Kan ikke ignoreres.</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2 font-mono text-brand">SIGTSTP</td><td className="px-3 py-2 font-mono">20</td><td className="px-3 py-2 text-muted-foreground">Stop</td><td className="px-3 py-2 text-success">Ja</td><td className="px-3 py-2 text-muted-foreground">Ctrl+Z. Den fangbare varianten av SIGSTOP.</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2 font-mono text-brand">SIGCHLD</td><td className="px-3 py-2 font-mono">17</td><td className="px-3 py-2 text-muted-foreground">Ignore</td><td className="px-3 py-2 text-success">Ja</td><td className="px-3 py-2 text-muted-foreground">Sendt til parent når et child dør (eller stopper).</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2 font-mono text-brand">SIGUSR1/2</td><td className="px-3 py-2 font-mono">10/12</td><td className="px-3 py-2 text-muted-foreground">Terminate</td><td className="px-3 py-2 text-success">Ja</td><td className="px-3 py-2 text-muted-foreground">App-definerte. Mange daemoner bruker dem til å rotere logger osv.</td></tr>
              </tbody>
            </table>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`kill 1042            # default = SIGTERM
kill -9 1042         # SIGKILL
kill -HUP 1042       # SIGHUP
kill -l              # list alle signal-navn
killall python       # send SIGTERM til alle prosesser ved navn
pkill -9 -u isak     # kill alle isak-prosesser med SIGKILL`}</pre>
          </div>
        </section>

        <section id="term-vs-kill" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. kill -15 vs kill -9 — konkret</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                kill -15 (SIGTERM)
              </div>
              <pre className="font-mono text-xs whitespace-pre">{`$ kill 1042

# Prosess kjører sin signal-handler:
# - lagrer buffere
# - lukker DB-tilkoblinger
# - skriver shutdown-logg
# - exit() pent

→ Z (zombie) i et øyeblikk
→ borte når parent wait()-er`}</pre>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-destructive font-semibold mb-2">
                kill -9 (SIGKILL)
              </div>
              <pre className="font-mono text-xs whitespace-pre">{`$ kill -9 1042

# Kernel river prosessen ned umiddelbart:
# - INGEN cleanup
# - åpne filer = potensielt korrupte
# - DB-tilkoblinger = leak
# - shared memory = kan henge igjen

→ Z med en gang
→ siste utvei`}</pre>
            </div>
          </div>
          <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
            <strong className="text-amber-700 dark:text-amber-400">Tommelfingerregel:</strong>{" "}
            send SIGTERM først, vent 5–10 sek, så SIGKILL hvis den ikke har avsluttet.{" "}
            <code className="font-mono">systemctl stop</code> gjør nettopp dette automatisk.
            SIGKILL kan IKKE drepe en D-state-prosess fordi kernelen venter på maskinvaren.
          </div>
        </section>

        <section id="sandkasse" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Sandkasse — send signal mot mock-prosess</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Klikk en rad for å markere PID, så et signal i panelet under. Se forskjellen
            mellom SIGTERM (får tid til cleanup) og SIGKILL (umiddelbar Z).
          </p>
          <ProsessMonitor />
        </section>

        <section id="fg-bg" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">8. Foreground vs background jobs</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`./tjener.sh &       # start i bakgrunn
jobs                # vis job-liste
[1]+ Running   ./tjener.sh

Ctrl+Z              # stopp foreground-job (sender SIGTSTP)
bg %1               # send pauset job til bakgrunn (SIGCONT)
fg %1               # hent bakgrunnsjob til foreground

disown %1           # løs job fra terminal — overlever logout
nohup ./tj.sh &     # samme idé, fra start: ignorer SIGHUP`}</pre>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Bakgrunns-jobs er fortsatt knyttet til terminal-sesjonen — når du logger ut sendes
            SIGHUP til alle. <code className="font-mono">nohup</code> og <code className="font-mono">disown</code> løser dette.
            For permanente bakgrunnstjenester: bruk systemd.
          </p>
        </section>

        <section id="zombie" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">9. Zombie- og orphan-prosesser</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Zombie (Z)
              </div>
              <p className="text-sm text-muted-foreground">
                Child har <code className="font-mono">exit()</code>-et, men parent har ikke
                kalt <code className="font-mono">wait()</code> ennå. Prosessen vises i ps som
                <code className="font-mono">[cmd] &lt;defunct&gt;</code>. Bruker null minne, men
                holder PID-en opptatt.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                <strong>Fix:</strong> få parent til å kalle wait() i en SIGCHLD-handler — eller
                drep parent, så adopteres zombien av PID 1 som rydder.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Orphan
              </div>
              <p className="text-sm text-muted-foreground">
                Parent døde først. Child kjører videre — men har mistet parent. Kernelen
                re-parenterer den til PID 1 (init / systemd), som tar ansvar for å
                wait()-e når den dør.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                <strong>Ikke et problem</strong> i seg selv — det er slik daemoner blir
                daemoner: fork + parent exit + setsid.
              </p>
            </div>
          </div>
        </section>

        <section id="nice" className="mb-6">
          <h2 className="text-xl font-semibold mb-3">10. nice og renice — prioritet</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground mb-3">
              Niceness går fra −20 (høyest prioritet) til +19 (lavest). Vanlige brukere kan bare
              ØKE niceness (bli snillere). Bare root kan minske den.
            </p>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`nice -n 10 ./tung-script.sh     # start med lavere prioritet
renice +5 -p 1042               # endre niceness på kjørende prosess
ps -eo pid,ni,cmd | head        # se NI-kolonnen`}</pre>
          </div>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Tilbake til oversikten</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte-2505" }} className="text-brand hover:underline">DTE-2505-hub</Link>
              {" "}— alle Linux/eksamens-mini-kursene.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte2505-bash-scripts" }} className="text-brand hover:underline">Bash-skripting</Link>
              {" "}— bruk signal-traps i scripts.
            </li>
            <li>
              <Link to="/drag" className="text-brand hover:underline">Drag-oppgaver</Link>{" "}
              under «Linux-prosesser» og «Linux».
            </li>
            <li>
              <Link to="/cards" className="text-brand hover:underline">Repetisjonskort</Link>{" "}
              i kategorien <em>praktisk</em>.
            </li>
          </ul>
        </div>
      </article>
    </StackPageShell>
  );
}
