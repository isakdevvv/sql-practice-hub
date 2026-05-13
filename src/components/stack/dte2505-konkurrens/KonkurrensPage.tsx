import { Link } from "@tanstack/react-router";
import { Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { DeadlockGraph } from "./DeadlockGraph";

const STEPS = [
  { title: "Race conditions", anchor: "race" },
  { title: "Mutex / lock", anchor: "mutex" },
  { title: "Condition variables", anchor: "cv" },
  { title: "Semaforer", anchor: "sem" },
  { title: "Klassiske concurrency-bugs", anchor: "bugs" },
  { title: "Deadlock — Coffmans betingelser", anchor: "coffman" },
  { title: "Dining philosophers", anchor: "dp" },
  { title: "pthread + Python-eksempler", anchor: "kode" },
  { title: "RAG-detektor", anchor: "drill" },
  { title: "Eksamen-feller", anchor: "feller" },
];

export function KonkurrensPage() {
  return (
    <StackPageShell title="Concurrency &amp; deadlock" group="eksamen">
      <article className="container mx-auto px-4 py-10 max-w-3xl">
        <header className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2505 · OSTEP kap. 28–33
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Concurrency — låser, semaforer og deadlock
          </h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Flere tråder deler minne for å gå raskere — men nå kan to tråder lese,
            endre og skrive samme variabel uten å koordinere. Resultatet: race
            conditions. Hele lærdomsfeltet rundt mutexer, condition variables og
            semaforer handler om å gjenoppfinne <em>atomicitet</em> og{" "}
            <em>rekkefølge</em> oppå asynkron utførelse.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <a href="#drill" className="text-brand hover:underline">ressurs-allokeringsgrafen</a>{" "}
              lengre ned. Tre scenarier, deadlock-detektor med sirkel-merking.
            </div>
          </div>
        </header>

        <CourseOutline courseId="dte2505-konkurrens" steps={STEPS} />

        <Section number="1" id="race" title="Race conditions — kanonisk eksempel">
          <p className="text-sm text-muted-foreground mb-3">
            To tråder øker samme teller en million ganger hver. Hvorfor blir
            slutt-tallet ikke 2 millioner?
          </p>
          <div className="rounded-xl border border-border bg-card p-4 mb-3">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`// Tråd A og B kjører dette parallelt:
counter = counter + 1

// Som maskinkode:
mov eax, [counter]     // 1. last
add eax, 1             // 2. inkrement
mov [counter], eax     // 3. lagre

// Hvis OS-en bytter mellom 1 og 3 i tråd A,
// kan tråd B også lese den GAMLE verdien.
// Da går teller bare opp med 1 i stedet for 2.`}</pre>
          </div>
          <p className="text-xs text-muted-foreground">
            <strong>Kritisk seksjon:</strong> koden mellom load og store er en
            kritisk seksjon. Det må kjøre <em>atomisk</em> — som om ingen andre
            tråder kunne se den halvferdige tilstanden. Det er det låser gir oss.
          </p>
        </Section>

        <Section number="2" id="mutex" title="Mutex / lock — gjensidig utelukkelse">
          <p className="text-sm text-muted-foreground mb-3">
            Én tråd om gangen i den kritiske seksjonen. Andre må vente.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Pseudokode
              </div>
              <pre className="font-mono text-xs whitespace-pre">{`lock m
lock(m)
// === kritisk seksjon ===
counter = counter + 1
// === slutt ===
unlock(m)`}</pre>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Implementering (forenklet)
              </div>
              <pre className="font-mono text-xs whitespace-pre">{`// Atomisk test-and-set
while (test_and_set(m) == 1)
  ;  // spinn

// Eller bedre: park-tråden i kø
// (futex på Linux)`}</pre>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            <strong>Spinlock vs. blocking:</strong> spinlock = «sjekk i loop til
            den er ledig» — bra for korte kritiske seksjoner. Blocking mutex =
            «legg meg til side, vekk meg når låsen er ledig» — bra for lange.
            Linux <code className="font-mono">pthread_mutex</code> er adaptiv: spinner
            litt før den blokkerer.
          </p>
        </Section>

        <Section number="3" id="cv" title="Condition variables — wait/signal">
          <p className="text-sm text-muted-foreground mb-3">
            Mutex hindrer to tråder fra å være i seksjonen samtidig. Condition variables
            lar tråder <em>vente på at en betingelse blir sann</em> — typisk i
            producer-consumer.
          </p>
          <div className="rounded-xl border border-border bg-card p-4">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`// Producer-consumer med begrenset buffer
mutex m; cond not_full; cond not_empty;
buffer buf;

producer():
  lock(m)
  while (buf.full()):
    wait(not_full, m)    // gir slipp på m, sover, henter m når vekket
  buf.put(item)
  signal(not_empty)
  unlock(m)

consumer():
  lock(m)
  while (buf.empty()):
    wait(not_empty, m)
  item = buf.get()
  signal(not_full)
  unlock(m)`}</pre>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            <strong>Hvorfor <code className="font-mono">while</code> og ikke <code className="font-mono">if</code>?</strong>{" "}
            Spurious wakeups + flere consumers. Når tråden våkner, kan en annen ha
            «stjålet» elementet. Sjekk alltid betingelsen på nytt.
          </p>
        </Section>

        <Section number="4" id="sem" title="Semaforer — Dijkstra (1965)">
          <p className="text-sm text-muted-foreground mb-3">
            En semafor er en teller med to atomiske operasjoner:{" "}
            <code className="font-mono">wait()</code> (også P/down) som dekrementerer og
            blokkerer hvis &lt;0, og <code className="font-mono">post()</code> (V/up) som
            inkrementerer og vekker én ventende.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Binær semafor (verdi 0 eller 1)
              </div>
              <pre className="font-mono text-xs whitespace-pre">{`sem_t mutex;
sem_init(&mutex, 0, 1);

sem_wait(&mutex);
// kritisk seksjon
sem_post(&mutex);

// Tilsvarer mutex_lock/unlock`}</pre>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Counting semafor (kontrollér N ressurser)
              </div>
              <pre className="font-mono text-xs whitespace-pre">{`sem_t slots;
sem_init(&slots, 0, 5);  // 5 ledige slots

worker():
  sem_wait(&slots);     // ta en slot
  do_work();
  sem_post(&slots);     // gi tilbake`}</pre>
            </div>
          </div>
        </Section>

        <Section number="5" id="bugs" title="Klassiske concurrency-bugs (Lu et al. 2008)">
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-3 py-2 w-32">Bug</th>
                  <th className="text-left font-semibold px-3 py-2">Beskrivelse</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono text-brand">Atomicity</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    Kode som forventes å være udelelig blir avbrutt. Eks: en if-test
                    og handling som ikke står sammen i samme låste blokk. ~65 % av
                    bugs i studien.
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono text-brand">Order</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    Tråd B antar at A allerede er ferdig, men ingen synkronisering
                    sørger for det. Klassisk i init-kode. Løses med condition vars.
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono text-brand">Deadlock</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    To tråder venter på hverandres låser i evig tid. ~30 % av bugs.
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono text-brand">Livelock</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    Tråder kjører, men kommer ingen vei — de bare reagerer på
                    hverandre. To høflige folk i en dør.
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono text-brand">Starvation</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    En tråd kommer aldri til, fordi andre stadig blir prioritert.
                    Løses med fair-låser eller prioritets-løft.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        <Section number="6" id="coffman" title="Deadlock — Coffmans fire betingelser">
          <p className="text-sm text-muted-foreground mb-3">
            Deadlock kan KUN oppstå hvis ALLE fire betingelsene er sanne samtidig.
            Bryt én og deadlocken er umulig.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            <CoffmanCard
              title="1. Mutual exclusion"
              text="Ressurser kan ikke deles — bare én tråd om gangen kan eie en lås."
              fix="Bruk lock-free strukturer eller delbar ressurs der mulig."
            />
            <CoffmanCard
              title="2. Hold and wait"
              text="En tråd holder på en ressurs mens den venter på en annen."
              fix="Krev at alle ressurser anskaffes samtidig — alt eller ingenting."
            />
            <CoffmanCard
              title="3. No preemption"
              text="Ressurser kan ikke tas fra en tråd — bare frivillig slippes."
              fix="Tillat at scheduleren tar tilbake en lås. Sjelden praktisk."
            />
            <CoffmanCard
              title="4. Circular wait"
              text="Det finnes en sirkel i ventegrafen: P1→R2→P2→R1→P1."
              fix="Pålegg total orden på låser — alle tar dem i samme rekkefølge."
            />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Praktisk strategi:</strong> bryt #4. Gi hver lås et ID-nummer.
            Krev at all kode tar låser i stigende rekkefølge. Da kan det aldri
            oppstå en sirkel — beviselig.
          </p>
        </Section>

        <Section number="7" id="dp" title="Dining philosophers — illustrerer alt">
          <p className="text-sm text-muted-foreground mb-3">
            Fem filosofer rundt et bord, fem gafler mellom dem. Hver må ha begge
            sine gafler for å spise.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-4">
              <div className="text-xs uppercase tracking-wider text-rose-600 dark:text-rose-400 font-semibold mb-2">
                Naiv (deadlock!)
              </div>
              <pre className="font-mono text-xs whitespace-pre">{`philosopher(i):
  while true:
    think()
    lock(fork[i])           // venstre
    lock(fork[(i+1) % 5])   // høyre
    eat()
    unlock(fork[(i+1) % 5])
    unlock(fork[i])`}</pre>
              <p className="text-xs text-muted-foreground mt-2">
                Hvis alle tar venstre gaffel samtidig → ingen kan ta høyre →
                deadlock.
              </p>
            </div>
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
              <div className="text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-semibold mb-2">
                Løsning (bryt circular wait)
              </div>
              <pre className="font-mono text-xs whitespace-pre">{`philosopher(i):
  while true:
    think()
    // Filosof 4 tar høyre FØRST:
    if i == 4:
      lock(fork[(i+1) % 5])
      lock(fork[i])
    else:
      lock(fork[i])
      lock(fork[(i+1) % 5])
    eat()
    unlock(...); unlock(...)`}</pre>
              <p className="text-xs text-muted-foreground mt-2">
                Asymmetri = ingen sirkel = ingen deadlock.
              </p>
            </div>
          </div>
        </Section>

        <Section number="8" id="kode" title="pthread og Python — samme idé">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                C — pthread
              </div>
              <pre className="font-mono text-xs whitespace-pre">{`#include <pthread.h>

pthread_mutex_t m = PTHREAD_MUTEX_INITIALIZER;
int counter = 0;

void* work(void* arg) {
  for (int i = 0; i < 1000000; i++) {
    pthread_mutex_lock(&m);
    counter++;
    pthread_mutex_unlock(&m);
  }
  return NULL;
}`}</pre>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Python — threading.Lock
              </div>
              <pre className="font-mono text-xs whitespace-pre">{`import threading

lock = threading.Lock()
counter = 0

def work():
    global counter
    for _ in range(1_000_000):
        with lock:        # auto-unlock
            counter += 1

t1 = threading.Thread(target=work)
t2 = threading.Thread(target=work)
t1.start(); t2.start()
t1.join(); t2.join()
print(counter)  # 2_000_000`}</pre>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            <strong>GIL-merknad:</strong> Pythons Global Interpreter Lock gjør at
            bare én tråd kjører Python-bytekode om gangen. Race-conditions er
            fortsatt mulig (mellom bytekode-instruksjoner), så låser trengs
            uansett. CPU-bundne ting → bruk <code className="font-mono">multiprocessing</code>.
          </p>
        </Section>

        <Section number="9" id="drill" title="Interaktiv: ressurs-allokeringsgraf">
          <p className="text-sm text-muted-foreground mb-3">
            En ressurs-allokeringsgraf har sirkler (prosesser) og firkanter
            (ressurser). En kant <em>R → P</em> betyr «R holdes av P». En kant{" "}
            <em>P → R</em> betyr «P ber om R». En sirkel i grafen = deadlock (når
            hver ressurs har én instans).
          </p>
          <p className="text-sm text-muted-foreground mb-3">
            Klikk «Sjekk for deadlock». Sirkel-noder blir rosa. Fjern en kant for å
            bryte sirkelen og se hvilken Coffman-betingelse som da brytes.
          </p>
          <DeadlockGraph />
        </Section>

        <Section number="10" id="feller" title="Eksamen-feller">
          <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-2">
            <li>
              <strong className="text-foreground">«Mutex løser alt».</strong>{" "}
              Mutex hindrer to tråder samtidig, men ikke at de ser inkonsistente
              data hvis du holder låsen for kort. Hele transaksjonen må være under
              samme lås.
            </li>
            <li>
              <strong className="text-foreground">Glemte at deadlock krever ALLE fire Coffman-betingelser.</strong>{" "}
              Bryt én → ingen deadlock. Ikke nødvendig å bryte alle.
            </li>
            <li>
              <strong className="text-foreground">Race condition ≠ deadlock.</strong>{" "}
              Race = utfallet avhenger av tråd-rekkefølge. Deadlock = ingen
              tråder gjør fremgang. Kan ha en uten den andre.
            </li>
            <li>
              <strong className="text-foreground">Bruker <code className="font-mono">if</code> i stedet for <code className="font-mono">while</code> rundt cond.wait.</strong>{" "}
              Bug — spurious wakeups og flere consumers. Alltid loop.
            </li>
            <li>
              <strong className="text-foreground">Semafor med startverdi 1 = mutex?</strong>{" "}
              Nesten, men: en mutex har eier (kan bare unlockes av samme tråd).
              Semafor har ikke eier. Brukes feil → enkelt å lage bugs.
            </li>
          </ul>
        </Section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Videre lesing</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              OSTEP kap. 28 (Locks), 29 (Lock-based DS), 30 (CV), 31 (Semaphores), 32
              (Bugs), 33 (Event-based) —{" "}
              <a
                href="https://pages.cs.wisc.edu/~remzi/OSTEP/"
                className="text-brand hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                gratis hos UW Madison
              </a>.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte2505-scheduling-drill" }} className="text-brand hover:underline">
                CPU-scheduling
              </Link>{" "}
              — første halvdel av OSTEP.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte2505-virtuelt-minne" }} className="text-brand hover:underline">
                Virtuelt minne &amp; paging
              </Link>{" "}
              — andre halvdel.
            </li>
            <li>
              <Link to="/cards" className="text-brand hover:underline">Flashcards</Link>{" "}
              — drill Coffman, mutex vs. semafor, klassiske bugs.
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

function CoffmanCard({
  title,
  text,
  fix,
}: {
  title: string;
  text: string;
  fix: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
        {title}
      </div>
      <p className="text-sm text-foreground mb-2">{text}</p>
      <p className="text-xs text-muted-foreground">
        <strong className="text-foreground">Å bryte:</strong> {fix}
      </p>
    </div>
  );
}
