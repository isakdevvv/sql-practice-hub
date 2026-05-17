import { Link } from "@tanstack/react-router";
import { Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { MemoryModelVisualizer } from "./MemoryModelVisualizer";
import { WorkloadComparison } from "./WorkloadComparison";
import { RaceConditionDemo } from "./RaceConditionDemo";
import { PsTopParser } from "./PsTopParser";

const STEPS = [
  { title: "Hva er forskjellen i ett bilde?", anchor: "intro" },
  { title: "Animert minne-layout", anchor: "minne" },
  { title: "Hva deler de — hva er privat?", anchor: "del-tabell" },
  { title: "4 jobber: prosesser vs tråder", anchor: "sammenligning" },
  { title: "Race condition — to tråder + 1 variabel", anchor: "race" },
  { title: "Når velger man hva?", anchor: "valg" },
  { title: "POSIX pthread API på 1 minutt", anchor: "api" },
  { title: "Parse ps -eLf — drag-til-kategori", anchor: "parse" },
];

export function ThreadVsProsessPage() {
  return (
    <StackPageShell title="Thread vs prosess" group="eksamen">
      <article className="container mx-auto px-4 py-10 max-w-3xl">
        <header className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2505 · O'Gorman kap. 2.3 + 2.6
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Thread vs prosess — minne-modell
          </h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            <code className="font-mono">fork()</code> lager en helt ny prosess med eget adresserom.{" "}
            <code className="font-mono">pthread_create()</code> lager bare en ny tråd inni en
            eksisterende prosess. Forskjellen i pris og risiko er stor — denne lesjonen
            viser hva som faktisk kopieres, hva som deles, og hvorfor «delt heap» er
            den vanligste kilden til race conditions i C/Java/Python.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Visuelt-først:</span>{" "}
              alle 4 interaktive verktøy bor på denne siden. Start med{" "}
              <a href="#minne" className="text-brand hover:underline">minne-layouten</a>{" "}
              og klikk «fork()» — så «pthread_create()».
            </div>
          </div>
        </header>

        <CourseOutline courseId="dte2505-thread-vs-prosess" steps={STEPS} />

        {/* ─────────────────────────────────────────────────────────────────── */}
        <section id="intro" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Forskjellen i ett bilde</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
              <div className="text-xs uppercase tracking-wider text-amber-700 dark:text-amber-400 font-semibold mb-2">
                fork() — to prosesser
              </div>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Ny <strong>PID</strong> (process ID), nytt adresserom</li>
                <li>• Alt minne kopieres logisk (COW i praksis)</li>
                <li>• Isolert: en crash dreper bare den ene</li>
                <li>• Kommunikasjon krever IPC (pipes, sockets, shm)</li>
                <li>• ~1 ms + flere MB COW-state per kall</li>
              </ul>
            </div>
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
              <div className="text-xs uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-semibold mb-2">
                pthread_create() — én prosess, mange tråder
              </div>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Samme PID, ny <strong>TID</strong> (thread ID / LWP)</li>
                <li>• Bare en ny stack — heap+kode+data deles</li>
                <li>• En segfault i én tråd kan dra hele prosessen ned</li>
                <li>• Kommunikasjon = vanlig delt variabel (men lås!)</li>
                <li>• ~10–50 μs + 1 stack per kall (μs = mikrosekund)</li>
              </ul>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────────── */}
        <section id="minne" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Animert minne-layout</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Tre moduser. Start i «fork()» og klikk knappen — se hvordan hele blokken klones
            og COW-markørene dukker opp på de skrivbare segmentene. Bytt så til «pthread_create()»
            og legg til tråder — bare nye stacks vokser fram inni samme prosess. «Inspekter»
            lar deg klikke ett segment og se delt/privat-statusen i begge modeller.
          </p>
          <MemoryModelVisualizer />
        </section>

        {/* ─────────────────────────────────────────────────────────────────── */}
        <section id="del-tabell" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Hva deles, hva er privat?</h2>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-3 py-2">Ressurs</th>
                  <th className="text-left font-semibold px-3 py-2">To prosesser (etter fork)</th>
                  <th className="text-left font-semibold px-3 py-2">To tråder i samme prosess</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border"><td className="px-3 py-2 font-mono text-brand">PID / PPID</td><td className="px-3 py-2 text-muted-foreground">Unike, child har parent som PPID</td><td className="px-3 py-2 text-muted-foreground">Samme PID, ulike TID/LWP</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2 font-mono text-brand">.text (kode)</td><td className="px-3 py-2 text-muted-foreground">Delt fysisk side, read-only</td><td className="px-3 py-2 text-muted-foreground">Delt</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2 font-mono text-brand">.data / .bss</td><td className="px-3 py-2 text-muted-foreground">COW — egne kopier ved første write</td><td className="px-3 py-2 text-muted-foreground">Delt (samme adresse!)</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2 font-mono text-brand">Heap (malloc)</td><td className="px-3 py-2 text-muted-foreground">COW — adresse-likt, men separate</td><td className="px-3 py-2 text-muted-foreground">Delt — samme malloc-arena</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2 font-mono text-brand">Stack</td><td className="px-3 py-2 text-muted-foreground">Egen kopi</td><td className="px-3 py-2 text-muted-foreground"><strong>Privat per tråd</strong></td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2 font-mono text-brand">Fil-deskriptorer</td><td className="px-3 py-2 text-muted-foreground">Duplisert (samme offsets)</td><td className="px-3 py-2 text-muted-foreground">Delt — samme tabell</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2 font-mono text-brand">Signal-handlere</td><td className="px-3 py-2 text-muted-foreground">Arvet kopi</td><td className="px-3 py-2 text-muted-foreground">Delt — ett sett for hele prosessen</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2 font-mono text-brand">errno</td><td className="px-3 py-2 text-muted-foreground">Hver sin</td><td className="px-3 py-2 text-muted-foreground"><strong>Per tråd</strong> (thread-local)</td></tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Den viktigste raden er <strong>heap</strong>: når to tråder kan se og endre samme
            objekt, må du beskytte hver felles datastruktur med en mutex eller bruke
            lock-free atomic-operasjoner.
          </p>
        </section>

        {/* ─────────────────────────────────────────────────────────────────── */}
        <section id="sammenligning" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. 4 jobber — prosesser vs tråder</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Samme arbeidsmengde (fire jobber á 600 ms beregning). Bytt mellom å spawne dem
            som 4 prosesser eller 4 tråder, og se hvor mye av total wall-time som forsvinner
            i setup-overhead — og hvor mye ekstra RAM hver modell koster.
          </p>
          <WorkloadComparison />
        </section>

        {/* ─────────────────────────────────────────────────────────────────── */}
        <section id="race" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Race condition — to tråder, én global</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Det kraftigste argumentet for tråder (delt minne, billig kommunikasjon) er også
            den største fellen. Kjør demoen — to tråder inkrementerer samme{" "}
            <code className="font-mono">counter</code> 5 000 ganger hver. Slå mutex av og på.
          </p>
          <RaceConditionDemo />
        </section>

        {/* ─────────────────────────────────────────────────────────────────── */}
        <section id="valg" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Når velger man hva?</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">Velg prosesser når...</div>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Isolasjon er kritisk — én feil skal ikke dra med seg de andre (Chrome-faner, nginx-workere).</li>
                <li>• Du kjører ulike programmer — typisk shell-script som fork+exec.</li>
                <li>• Du vil bruke OS-grenser per prosess (cgroups, ulimit, seccomp).</li>
                <li>• Sikkerhet: privilegie-separasjon (drop privileges per child).</li>
              </ul>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">Velg tråder når...</div>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Du trenger billig parallellisme — UI som ikke skal henge under tung jobb.</li>
                <li>• Mye delt state der IPC ville vært tregt eller tungvint.</li>
                <li>• Mange korte jobber (request handlers) der setup-pris dominerer.</li>
                <li>• Skala på antall — 10 000 prosesser er smertefullt, 10 000 tråder er greit.</li>
              </ul>
            </div>
          </div>
          <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs">
            <strong>Hybrid:</strong> moderne servere kombinerer ofte begge — nginx har én master-prosess som
            forker N worker-prosesser, og hver worker bruker tråder eller event-loop internt.
            Du får isolasjon mellom workere og effektiv parallellisme inni hver.
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────────── */}
        <section id="api" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. POSIX pthread API på 1 minutt</h2>
          <div className="rounded-xl border border-border bg-card p-4">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`#include <pthread.h>

void* worker(void* arg) {
    int id = *(int*)arg;
    printf("hello fra tråd %d\\n", id);
    return NULL;            // returnverdi hentes av join
}

int main(void) {
    pthread_t t1, t2;
    int a = 1, b = 2;

    pthread_create(&t1, NULL, worker, &a);   // start tråd 1
    pthread_create(&t2, NULL, worker, &b);   // start tråd 2

    pthread_join(t1, NULL);                  // vent på t1 (som wait() for prosess)
    pthread_join(t2, NULL);

    return 0;
}

// Kompiler med:  cc -pthread prog.c`}</pre>
          </div>
          <div className="mt-3 grid sm:grid-cols-2 gap-3 text-xs">
            <div className="rounded-lg border border-border bg-background p-3">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Tråd-kontroll</div>
              <ul className="space-y-0.5">
                <li><code className="font-mono">pthread_create()</code> — start tråd</li>
                <li><code className="font-mono">pthread_join()</code> — vent på at tråd avslutter</li>
                <li><code className="font-mono">pthread_detach()</code> — fire-and-forget</li>
                <li><code className="font-mono">pthread_exit()</code> — avslutt egen tråd</li>
                <li><code className="font-mono">pthread_self()</code> — hent egen TID</li>
              </ul>
            </div>
            <div className="rounded-lg border border-border bg-background p-3">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Synkronisering</div>
              <ul className="space-y-0.5">
                <li><code className="font-mono">pthread_mutex_lock/unlock</code> — gjensidig utelukkelse</li>
                <li><code className="font-mono">pthread_cond_wait/signal</code> — condition variable</li>
                <li><code className="font-mono">pthread_rwlock_*</code> — mange lesere / én skriver</li>
                <li><code className="font-mono">pthread_barrier_*</code> — synkronisering på N tråder</li>
              </ul>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────────── */}
        <section id="parse" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">8. Parse ps -eLf — drag til riktig kategori</h2>
          <p className="text-sm text-muted-foreground mb-3">
            <code className="font-mono">ps -eLf</code> viser én rad per <em>tråd</em>, ikke per prosess.
            Kolonnen <code className="font-mono">LWP</code> er Linux-navn for TID. Bruk
            kombinasjonen PID/PPID/LWP til å identifisere hvilken rolle hver rad har.
          </p>
          <PsTopParser />
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Tilbake til oversikten</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte-2505" }} className="text-brand hover:underline">DTE-2505-hub</Link>
              {" "}— alle mini-kursene.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte2505-prosesser-signaler" }} className="text-brand hover:underline">Prosesser og signaler</Link>
              {" "}— fork/exec/wait + signaler i dybden.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte2505-konkurrens" }} className="text-brand hover:underline">Concurrency &amp; deadlock</Link>
              {" "}— mutex, condvars, semaforer, dining philosophers.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte2505-ipc" }} className="text-brand hover:underline">IPC</Link>
              {" "}— pipes, FIFO, shared memory, signaler som meldingsbærer.
            </li>
          </ul>
        </div>
      </article>
    </StackPageShell>
  );
}
