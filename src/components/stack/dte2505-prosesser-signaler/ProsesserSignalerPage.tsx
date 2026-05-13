import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { ProsessMonitor } from "./ProsessMonitor";

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
        </header>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Prosess-tilstander (STAT-kolonnen)</h2>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-20">STAT</th>
                  <th className="text-left font-semibold px-4 py-2 w-32">Navn</th>
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

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. ps aux — slik leser du output</h2>
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

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Signaler — språket kernelen bruker</h2>
          <div className="overflow-hidden rounded-lg border border-border mb-3">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-32">Signal</th>
                  <th className="text-left font-semibold px-4 py-2 w-16">Nr.</th>
                  <th className="text-left font-semibold px-4 py-2 w-24">Standard</th>
                  <th className="text-left font-semibold px-4 py-2">Bruk</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">SIGHUP</td><td className="px-4 py-3 font-mono">1</td><td className="px-4 py-3 text-muted-foreground">Terminate</td><td className="px-4 py-3 text-muted-foreground">Terminalen lukket, eller daemon reload-config.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">SIGINT</td><td className="px-4 py-3 font-mono">2</td><td className="px-4 py-3 text-muted-foreground">Terminate</td><td className="px-4 py-3 text-muted-foreground">Ctrl+C. Kan fanges.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">SIGKILL</td><td className="px-4 py-3 font-mono">9</td><td className="px-4 py-3 text-muted-foreground">Terminate</td><td className="px-4 py-3 text-muted-foreground">Kan IKKE fanges eller ignoreres. Siste utvei.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">SIGTERM</td><td className="px-4 py-3 font-mono">15</td><td className="px-4 py-3 text-muted-foreground">Terminate</td><td className="px-4 py-3 text-muted-foreground">Standard «vær så snill å slutte». Default for <code className="font-mono">kill PID</code>.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">SIGSTOP</td><td className="px-4 py-3 font-mono">19</td><td className="px-4 py-3 text-muted-foreground">Stop</td><td className="px-4 py-3 text-muted-foreground">Pause. Kan ikke fanges. Ctrl+Z sender SIGTSTP (20) som CAN.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">SIGCONT</td><td className="px-4 py-3 font-mono">18</td><td className="px-4 py-3 text-muted-foreground">Continue</td><td className="px-4 py-3 text-muted-foreground">Fortsett etter SIGSTOP/SIGTSTP.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">SIGSEGV</td><td className="px-4 py-3 font-mono">11</td><td className="px-4 py-3 text-muted-foreground">Core dump</td><td className="px-4 py-3 text-muted-foreground">Segfault — ulovlig minneadresse.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">SIGPIPE</td><td className="px-4 py-3 font-mono">13</td><td className="px-4 py-3 text-muted-foreground">Terminate</td><td className="px-4 py-3 text-muted-foreground">Skrev til pipe der leseren er død.</td></tr>
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

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Sandkasse — send signal mot mock-prosess</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Klikk en rad for å markere PID, så et signal i panelet under. Se forskjellen
            mellom SIGTERM (får tid til cleanup) og SIGKILL (umiddelbar Z).
          </p>
          <ProsessMonitor />
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. nice og renice — prioritet</h2>
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

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">6. Foreground vs background jobs</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`./tjener.sh &       # start i bakgrunn
jobs                # vis job-liste
[1]+ Running   ./tjener.sh

Ctrl+Z              # stopp foreground-job (sender SIGTSTP)
bg %1               # send pauset job til bakgrunn (SIGCONT)
fg %1               # hent bakgrunnsjob til foreground

disown %1           # løs job fra terminal — overlever logout
nohup ./tj.sh &     # samme idé, fra start: ignorer SIGHUP`}</pre>
                  <div className="mt-6">
          <Link
            to="/stack/$slug"
            params={{ slug: "dte-2505" }}
            className="text-brand hover:underline inline-flex items-center gap-1 text-sm"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Tilbake til DTE-2505-hub
          </Link>
        </div>
</div>
        </section>
      </article>
    </StackPageShell>
  );
}
