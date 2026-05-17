import { Link } from "@tanstack/react-router";
import { Network } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { PipesSimulator } from "./PipesSimulator";
import { MessageQueueDemo } from "./MessageQueueDemo";
import { SharedMemorySim } from "./SharedMemorySim";
import { IpcMatchQuiz } from "./IpcMatchQuiz";

const STEPS = [
  { title: "Hvorfor IPC?", anchor: "intro" },
  { title: "Anonyme pipes (pipe())", anchor: "pipe" },
  { title: "Navngitte pipes / FIFO", anchor: "fifo" },
  { title: "Shared memory (shmget, mmap)", anchor: "shm" },
  { title: "Semaforer (POSIX + System V)", anchor: "sem" },
  { title: "Message queues", anchor: "mq" },
  { title: "Sammenligningstabell", anchor: "sammenligning" },
  { title: "Eksamen-quick-ref", anchor: "eksamen" },
  { title: "Test deg selv", anchor: "quiz" },
];

export function IpcPage() {
  return (
    <StackPageShell title="IPC: pipes, shared memory, semaforer" group="eksamen">
      <article className="container mx-auto px-4 py-10 max-w-3xl">
        <header className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2505 · OSTEP kap. 5, 30 + Stevens APUE
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            IPC — pipes, shared memory, semaforer
          </h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            To prosesser har separate adresseplasser. Det er hele poenget — én
            crash skal ikke ta ned naboen. Men de må fortsatt snakke sammen:
            shell-en din streamer output fra <code className="font-mono">ls</code>
            til <code className="font-mono">grep</code>, en database server
            koordinerer cache med worker-prosessene sine, dataforskere mappere
            store CSV-er på tvers av Python-prosesser. Linux gir et halvt
            dusin IPC-primitiver — hver med ulik trade-off mellom latency,
            kompleksitet og sync/async.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Network className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Tommelfingerregel:</span> mest data per sekund? Shared memory. Enklest? Pipe. Trenger kø? Message queue. Bare synkronisering? Semafor.
            </div>
          </div>
        </header>

        <CourseOutline courseId="dte2505-ipc" steps={STEPS} />

        <Section number="1" id="intro" title="Hvorfor trenger vi IPC?">
          <p className="text-sm text-muted-foreground mb-3">
            Kjernen isolerer adresseplasser med MMU + page tables — bra for
            sikkerhet, men det betyr at en vanlig <code className="font-mono">int x = 5</code>
            i prosess A ikke kan leses av prosess B. IPC er settet av syscalls
            som lar kjernen formidle data eller dele minne mellom prosesser
            på en kontrollert måte.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Datakanal-mekanismer
              </div>
              <p className="text-sm text-muted-foreground">
                Sender bytes mellom prosesser: <strong>pipes</strong>,{" "}
                <strong>FIFO-er</strong>, <strong>message queues</strong>,
                Unix-sockets.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Synkroniserings-mekanismer
              </div>
              <p className="text-sm text-muted-foreground">
                Koordinerer tilgang til delt ressurs:{" "}
                <strong>semaforer</strong>, mutexer (i shared memory),
                signaler, file locks.
              </p>
            </div>
          </div>
        </Section>

        <Section number="2" id="pipe" title="Anonyme pipes — pipe()">
          <p className="text-sm text-muted-foreground mb-3">
            En anonym pipe er en enveis byte-strøm med to filendepunkter: en
            read-end og en write-end. <code className="font-mono">pipe(fd)</code>
            returnerer <code className="font-mono">fd[0]</code> (les) og{" "}
            <code className="font-mono">fd[1]</code> (skriv). Etter en{" "}
            <code className="font-mono">fork()</code> arver barnet kopiene, og
            man får en kanal mellom foreldre- og barneprosess. Det er nøyaktig
            sånn shell-piper (<code className="font-mono">ls | grep foo</code>)
            er implementert.
          </p>
          <div className="rounded-xl border border-border bg-card p-4 mb-3">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              C-eksempel: foreldre skriver, barn leser
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`#include <unistd.h>
#include <stdio.h>
#include <string.h>

int main(void) {
    int fd[2];
    pipe(fd);                       // fd[0]=read, fd[1]=write

    if (fork() == 0) {              // BARN
        close(fd[1]);               // trenger ikke write-end
        char buf[64];
        ssize_t n = read(fd[0], buf, sizeof(buf) - 1);
        buf[n] = '\\0';
        printf("barn fikk: %s\\n", buf);
        close(fd[0]);
    } else {                        // FORELDRE
        close(fd[0]);               // trenger ikke read-end
        const char *msg = "hei fra forelder";
        write(fd[1], msg, strlen(msg));
        close(fd[1]);               // EOF til barn
    }
    return 0;
}`}</pre>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            <strong>Begrensninger:</strong> bare beslektede prosesser
            (forelder/barn/søsken som arver fd-ene), bare én retning per pipe
            (lag to for tovei), buffer er typisk 64&nbsp;KiB — fyller den seg
            opp blokkerer <code className="font-mono">write</code> til noen leser.
          </p>
          <PipesSimulator />
        </Section>

        <Section number="3" id="fifo" title="Navngitte pipes (FIFO)">
          <p className="text-sm text-muted-foreground mb-3">
            En FIFO (named pipe) har en path i filsystemet og kan brukes av
            urelaterte prosesser. <code className="font-mono">mkfifo(path, mode)</code>{" "}
            lager en spesiell fil-node; deretter åpner du den med vanlig{" "}
            <code className="font-mono">open()</code> for lesing eller skriving.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Lag og bruk fra shell
              </div>
              <pre className="font-mono text-xs whitespace-pre">{`$ mkfifo /tmp/myfifo

# Terminal A — leser:
$ cat /tmp/myfifo
hello

# Terminal B — skriver:
$ echo hello > /tmp/myfifo
# (returnerer når A leser)`}</pre>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Fra C
              </div>
              <pre className="font-mono text-xs whitespace-pre">{`#include <sys/stat.h>
#include <fcntl.h>

mkfifo("/tmp/myfifo", 0600);

// Leser:
int fd = open("/tmp/myfifo", O_RDONLY);
// blokkerer til noen åpner write-end

// Skriver:
int fd = open("/tmp/myfifo", O_WRONLY);
write(fd, "hi", 2);`}</pre>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            <strong>Når bruke FIFO over pipe:</strong> når kommunikasjonen
            ikke er forelder/barn — for eksempel en log-collector og en
            applikasjons-daemon som starter uavhengig.
          </p>
        </Section>

        <Section number="4" id="shm" title="Shared memory — shmget og mmap">
          <p className="text-sm text-muted-foreground mb-3">
            Shared memory mapper det <em>samme</em> fysiske minnesegmentet
            inn i adresseplassen til flere prosesser. Ingen kopiering — én
            prosess skriver, neste leser umiddelbart. Det er den raskeste
            IPC-formen, men også den farligste: nå har du race conditions
            uten å ha brukt tråder. Du må kombinere med semafor eller mutex
            for synkronisering.
          </p>
          <div className="grid sm:grid-cols-2 gap-3 mb-3">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                POSIX shm + mmap (moderne)
              </div>
              <pre className="font-mono text-xs whitespace-pre">{`#include <sys/mman.h>
#include <fcntl.h>
#include <unistd.h>

int fd = shm_open("/myshm",
                  O_CREAT | O_RDWR, 0600);
ftruncate(fd, 4096);

void *p = mmap(NULL, 4096,
               PROT_READ | PROT_WRITE,
               MAP_SHARED, fd, 0);

// p peker nå på 4 KiB delt minne
*(int *)p = 42;`}</pre>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                System V (eldre, men i pensum)
              </div>
              <pre className="font-mono text-xs whitespace-pre">{`#include <sys/shm.h>

key_t key = ftok("/tmp", 'A');
int id = shmget(key, 4096,
                IPC_CREAT | 0600);
void *p = shmat(id, NULL, 0);

*(int *)p = 42;

// Andre prosess: samme key →
// samme shmid → samme minne.

shmdt(p);
shmctl(id, IPC_RMID, NULL);`}</pre>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            <strong>POSIX vs System V:</strong> POSIX (<code className="font-mono">shm_open</code> + <code className="font-mono">mmap</code>)
            integrerer med fd-baserte syscalls, kan brukes med
            <code className="font-mono"> select</code>/<code className="font-mono">poll</code>, og er foretrukket i ny kode.
            System V (<code className="font-mono">shmget</code> / <code className="font-mono">shmat</code>)
            bruker IPC-keys og er enda i bruk i eldre Unix-software.
          </p>
          <SharedMemorySim />
        </Section>

        <Section number="5" id="sem" title="Semaforer — POSIX og System V">
          <p className="text-sm text-muted-foreground mb-3">
            En semafor er en heltallsteller med to atomiske operasjoner:{" "}
            <code className="font-mono">wait()</code> (P/down) dekrementerer
            og blokkerer hvis verdien blir &lt; 0, <code className="font-mono">post()</code>{" "}
            (V/up) inkrementerer og vekker en venter. Binær semafor
            (startverdi 1) brukes som mutex; counting semafor (startverdi N)
            kontrollerer N identiske ressurser.
          </p>
          <div className="grid sm:grid-cols-2 gap-3 mb-3">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                POSIX-semafor i shared memory
              </div>
              <pre className="font-mono text-xs whitespace-pre">{`#include <semaphore.h>

// I shared memory:
sem_t *s = ...;
sem_init(s, 1 /* pshared */, 1);

// Prosess A og B:
sem_wait(s);
// kritisk seksjon på delt data
sem_post(s);

sem_destroy(s);`}</pre>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                System V-semafor (semget)
              </div>
              <pre className="font-mono text-xs whitespace-pre">{`#include <sys/sem.h>

key_t k = ftok("/tmp", 'B');
int sid = semget(k, 1, IPC_CREAT|0600);

// Init til 1:
union semun arg = { .val = 1 };
semctl(sid, 0, SETVAL, arg);

// P-operasjon:
struct sembuf op = {0, -1, 0};
semop(sid, &op, 1);

// V-operasjon: op.sem_op = +1
op.sem_op = 1;
semop(sid, &op, 1);`}</pre>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Binær semafor
              </div>
              <p className="text-sm text-muted-foreground">
                Startverdi 0 eller 1. Brukes som mutex eller signal:{" "}
                «vent til hendelse X».
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Counting semafor
              </div>
              <p className="text-sm text-muted-foreground">
                Startverdi N. Begrenser samtidig tilgang til N ressurser
                (eks: 5 ledige slots i en connection pool).
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            <strong>Semafor vs mutex:</strong> en mutex har eier (kan bare
            unlockes av samme tråd som locket den), en semafor har ikke det.
            Bruk semafor når en annen prosess/tråd skal frigi ressursen enn
            den som tok den (klassisk producer/consumer).
          </p>
        </Section>

        <Section number="6" id="mq" title="Message queues">
          <p className="text-sm text-muted-foreground mb-3">
            En message queue er en kø av diskrete meldinger (ikke en
            byte-strøm). Hver melding har størrelse og evt. prioritet.
            Sender og mottaker er løst koblet — meldingen kan ligge i køen til
            noen henter den, selv om sender er ferdig. POSIX-versjonen:{" "}
            <code className="font-mono">mq_open</code> / <code className="font-mono">mq_send</code> /{" "}
            <code className="font-mono">mq_receive</code>.
          </p>
          <div className="rounded-xl border border-border bg-card p-4">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`#include <mqueue.h>

struct mq_attr attr = {
    .mq_flags = 0,
    .mq_maxmsg = 10,
    .mq_msgsize = 256,
};

mqd_t mq = mq_open("/myqueue",
                   O_CREAT | O_RDWR, 0600, &attr);

// Sender:
mq_send(mq, "hello", 5, /* prio */ 0);

// Mottaker:
char buf[256];
unsigned prio;
ssize_t n = mq_receive(mq, buf, 256, &prio);

mq_close(mq);
mq_unlink("/myqueue");`}</pre>
          </div>
          <p className="text-xs text-muted-foreground mt-3 mb-4">
            <strong>vs pipe/FIFO:</strong> meldingsgrenser bevares (les leser
            akkurat én melding av gangen), prioritet er innebygd, og kø
            overlever selv om alle åpne deskriptorer lukkes. Nyttig for
            løskoblede komponenter — tenk «small embedded message bus».
          </p>
          <MessageQueueDemo />
        </Section>

        <Section number="7" id="sammenligning" title="Sammenligningstabell">
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-3 py-2 w-40">Mekanisme</th>
                  <th className="text-left font-semibold px-3 py-2">Latency</th>
                  <th className="text-left font-semibold px-3 py-2">Throughput</th>
                  <th className="text-left font-semibold px-3 py-2">Sync/async</th>
                  <th className="text-left font-semibold px-3 py-2">Kompleksitet</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono">Pipe / FIFO</td>
                  <td className="px-3 py-2 text-muted-foreground">Lav</td>
                  <td className="px-3 py-2 text-muted-foreground">Middels (kopiering gjennom kjernen)</td>
                  <td className="px-3 py-2 text-muted-foreground">Blokkerende byte-strøm</td>
                  <td className="px-3 py-2 text-muted-foreground">Enkel — fd-basert</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono">Shared memory</td>
                  <td className="px-3 py-2 text-muted-foreground">Lavest (ingen kopiering)</td>
                  <td className="px-3 py-2 text-muted-foreground">Høyest (memcpy-hastighet)</td>
                  <td className="px-3 py-2 text-muted-foreground">Async — krever sync separat</td>
                  <td className="px-3 py-2 text-muted-foreground">Kompleks — du må lage sync selv</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono">Semafor</td>
                  <td className="px-3 py-2 text-muted-foreground">Veldig lav</td>
                  <td className="px-3 py-2 text-muted-foreground">N/A (bare sync, ingen data)</td>
                  <td className="px-3 py-2 text-muted-foreground">Synkroniserings-primitiv</td>
                  <td className="px-3 py-2 text-muted-foreground">Middels — lett å lage deadlocks</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono">Message queue</td>
                  <td className="px-3 py-2 text-muted-foreground">Middels</td>
                  <td className="px-3 py-2 text-muted-foreground">Middels (kopiering + prio-sortering)</td>
                  <td className="px-3 py-2 text-muted-foreground">Async — sender kan gå før mottaker er klar</td>
                  <td className="px-3 py-2 text-muted-foreground">Middels</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono">Signal</td>
                  <td className="px-3 py-2 text-muted-foreground">Lav</td>
                  <td className="px-3 py-2 text-muted-foreground">Minimal (bare et heltall)</td>
                  <td className="px-3 py-2 text-muted-foreground">Async (avbryter mottaker)</td>
                  <td className="px-3 py-2 text-muted-foreground">Treacherous — race-utsatt</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        <Section number="8" id="eksamen" title="Eksamen-quick-ref">
          <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-2">
            <li>
              <strong className="text-foreground">Pipes er enveis og buffer.</strong>{" "}
              Trenger du tovei? Lag to. Anonym pipe = bare beslektede prosesser. FIFO = path i filsystemet, urelaterte kan koble seg på.
            </li>
            <li>
              <strong className="text-foreground">Shared memory er raskest, men ALDRI alene.</strong>{" "}
              Ingen kjerne-kopiering, men ingen synkronisering heller. Kombiner alltid med semafor eller mutex.
            </li>
            <li>
              <strong className="text-foreground">Semafor ≠ mutex.</strong>{" "}
              Mutex har eier (lock og unlock må være samme tråd). Semafor har ikke det — perfekt for producer/consumer der A signaliserer og B venter.
            </li>
            <li>
              <strong className="text-foreground">Binær semafor = startverdi 0/1.</strong>{" "}
              Counting semafor = startverdi N (kontroller N parallelle slots/ressurser).
            </li>
            <li>
              <strong className="text-foreground">Message queue bevarer meldingsgrenser.</strong>{" "}
              Pipe gir byte-strøm — to <code className="font-mono">write(8)</code>-kall kan leses som én <code className="font-mono">read(16)</code>. MQ gir alltid én melding per <code className="font-mono">mq_receive</code>.
            </li>
            <li>
              <strong className="text-foreground">POSIX vs System V.</strong>{" "}
              POSIX (<code className="font-mono">shm_open</code>/<code className="font-mono">mq_open</code>/<code className="font-mono">sem_open</code>) bruker path-aktige navn (<code className="font-mono">/navn</code>) og fd-er — foretrukket. System V (<code className="font-mono">shmget</code>/<code className="font-mono">msgget</code>/<code className="font-mono">semget</code>) bruker numeriske key-er fra <code className="font-mono">ftok()</code>. Begge er på eksamen.
            </li>
            <li>
              <strong className="text-foreground">«ls | grep foo» = pipe + fork.</strong>{" "}
              Shellet kaller <code className="font-mono">pipe()</code>, <code className="font-mono">fork()</code>-er to ganger, og <code className="font-mono">dup2()</code>-er fd-ene til stdin/stdout før <code className="font-mono">execve()</code>. Klassisk eksamensspørsmål.
            </li>
          </ul>
        </Section>

        <Section number="9" id="quiz" title="Test deg selv">
          <p className="text-sm text-muted-foreground mb-3">
            6 use-cases, 6 mekanismer. Velg den som passer best — fasit og
            begrunnelse vises etter du har levert.
          </p>
          <IpcMatchQuiz />
        </Section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Videre lesing</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              OSTEP kap. 5 (Process API) og 31 (Semaphores) — <a href="https://pages.cs.wisc.edu/~remzi/OSTEP/" className="text-brand hover:underline" target="_blank" rel="noreferrer">gratis hos UW Madison</a>.
            </li>
            <li>
              Stevens, <em>Advanced Programming in the UNIX Environment</em> (APUE) — kap. 15 (IPC) og 17 (Advanced IPC) er kanonisk.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte2505-konkurrens" }} className="text-brand hover:underline">
                Concurrency &amp; deadlock
              </Link>{" "}
              — de samme låsemekanismene brukt på tråder.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte2505-prosesser-signaler" }} className="text-brand hover:underline">
                Prosesser &amp; signaler
              </Link>{" "}
              — fork/exec og signal som er beslektet IPC.
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
