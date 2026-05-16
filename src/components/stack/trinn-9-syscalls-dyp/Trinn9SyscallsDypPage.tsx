import { Link } from "@tanstack/react-router";
import { ArrowRight, Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { SyscallLifecycle } from "./SyscallLifecycle";

const STEPS = [
  { title: "Hva en syscall faktisk er", anchor: "hva" },
  { title: "Syscall-livssyklus — fra ring 3 til ring 0 og tilbake", anchor: "livssyklus" },
  { title: "open, read, write, close", anchor: "fileio" },
  { title: "File descriptors og stdin/stdout/stderr", anchor: "fd" },
  { title: "fork og exec — hvordan prosesser starter", anchor: "fork-exec" },
  { title: "Pipes — kommunikasjon mellom prosesser", anchor: "pipes" },
  { title: "Signaler — SIGINT, SIGKILL, og resten", anchor: "signaler" },
];

export function Trinn9SyscallsDypPage() {
  return (
    <StackPageShell title="9. Syscalls (dypere)" group="stack">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            Hardware-stakken · Trinn 9
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Syscalls — broa fra prosessen din til OS-kjernen
          </h1>
          <p className="mt-3 text-muted-foreground">
            Alt en prosess gjør utenfor sin egen minne — lese fil, skrive
            til skjerm, åpne socket, starte ny prosess — går gjennom en{" "}
            <em>syscall</em>. Det er en CPU-instruksjon som overlater
            kontrollen til kernel-en, som så gjør jobben på vegne av oss.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <Link to="/drag" className="text-brand hover:underline">drag-oppgavene</Link>{" "}
              under «Syscalls» — match read/write/open, fork-exec rekkefølge,
              pipe-quiz.
            </div>
          </div>
        </div>

        <CourseOutline courseId="trinn-9-syscalls-dyp" steps={STEPS} />

        <section id="hva" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Hva en syscall faktisk er</h2>
          <p className="text-sm text-muted-foreground mb-4">
            CPU-en har (minst) to privilegienivåer: user space (ring 3) og
            kernel space (ring 0). En vanlig prosess kjører i ring 3 og
            kan IKKE direkte snakke til diskdriver, nettverkskort osv. Den
            må be kernelen om hjelp via en syscall.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Anatomien av en syscall på x86-64 Linux:

  User space (ring 3):
    ; vi vil skrive("hei", 3) til stdout (fd=1)
    mov rax, 1          ; syscall-nummer: 1 = sys_write
    mov rdi, 1          ; fd (1 = stdout)
    mov rsi, buf        ; peker til buffer
    mov rdx, 3          ; antall bytes
    syscall              ; ← HER skjer privilege-bytte
    ; rax har nå antall bytes faktisk skrevet

   Når 'syscall' utføres:
   1. CPU bytter ring 3 → ring 0
   2. CPU hopper til kernel-entry på fast adresse
   3. Kernel sjekker syscall-nummer (rax), validerer args
   4. Kernel utfører jobben (skriv på tty, eller hva enn fd er)
   5. Kernel kopierer resultatet til rax
   6. CPU bytter ring 0 → ring 3, fortsetter i user space

  Hele rundturen er ~100-500 nanosekunder. Det er DYRT.

Hvor finner du syscall-nummerne?
  $ man 2 syscalls
  $ cat /usr/include/asm/unistd_64.h
    #define __NR_read    0
    #define __NR_write   1
    #define __NR_open    2
    #define __NR_close   3
    ...

Hvorfor C-funksjoner som write() ikke ER syscalls:
  write() er en glibc-wrapper. Den setter args i registre,
  utfører syscall-instruksjonen, og oversetter feilkoder til
  errno-konvensjonen.`}</pre>
          </div>
        </section>

        <section id="livssyklus" className="mb-12">
          <h2 className="text-xl font-semibold mb-3">
            2. Syscall-livssyklus — step gjennom ring-overgangen
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Step gjennom en ekte syscall instruksjon for instruksjon. Se hvordan
            registrene fylles av user-koden, hvordan{" "}
            <code>syscall</code>-instruksjonen bytter til ring 0, hva kjernen
            gjør med argumentene, og hvordan returverdien havner tilbake i{" "}
            <code>rax</code>. To scenarier: <code>write</code> til stdout, og{" "}
            <code>open</code> + <code>read</code> + <code>close</code> av en fil.
          </p>
          <SyscallLifecycle />
        </section>

        <section id="fileio" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. open, read, write, close</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Fil-I/O er den vanligste familien av syscalls. Alt i Unix er
            «en fil» — også sockets, terminaler, pipes, devices.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Typisk fil-lese-flyt i C:

   #include <fcntl.h>
   #include <unistd.h>

   int fd = open("/etc/hostname", O_RDONLY);   // → fd, eller -1 ved feil
   if (fd < 0) { perror("open"); return 1; }

   char buf[256];
   ssize_t n = read(fd, buf, sizeof(buf));     // → antall bytes, 0 = EOF
   if (n < 0) { perror("read"); return 1; }
   buf[n] = '\\0';
   write(STDOUT_FILENO, buf, n);              // skriv ut

   close(fd);

Hva hver syscall gjør (forkortet):

  open(path, flags, [mode])    → int fd
     Slår opp filen, sjekker permissions, returnerer minste ledige fd.
     Flags: O_RDONLY, O_WRONLY, O_RDWR, O_CREAT, O_APPEND, O_TRUNC, ...

  read(fd, buf, count)          → ssize_t bytes_read
     Kopierer opptil 'count' bytes fra fd-ens posisjon inn i buf.
     Posisjonen flyttes. Returnerer 0 ved EOF, -1 ved feil.

  write(fd, buf, count)         → ssize_t bytes_written
     Kopierer 'count' bytes fra buf til fd-en. Returnerer antall
     faktisk skrevet (kan være mindre enn count).

  close(fd)                     → int
     Frigjør fd-en. Hvis dette var siste referanse, frigjøres også
     kernel-strukturen og buffrene.

Linux man-pages (de gjelder API-en i ekte produksjon):
   $ man 2 open
   $ man 2 read
   $ man 2 write
   $ man 2 close

(Tallet 2 betyr 'seksjon 2 — syscall'. Seksjon 1 er kommandoer.)`}</pre>
          </div>
        </section>

        <section id="fd" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. File descriptors og stdin/stdout/stderr</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Hver prosess har en fd-tabell. En fd er bare en int (small index).

  Prosessens fd-tabell (forenklet):

  fd │  Type                       Open Description
  ───┼──────────────────────────  ────────────────────────────────────
   0 │  stdin                      input fra terminal eller pipe
   1 │  stdout                     output til terminal eller pipe
   2 │  stderr                     feilmeldinger (umrettet til terminal)
   3 │  /etc/hostname (read-only)
   4 │  socket (TCP, til server)
   5 │  ...

  Alle prosesser arver 0, 1, 2 fra forelderen sin (shellen).

Redirigering i shell:
   echo hei > out.txt
   # Shell-en gjør:
   # 1. fork() en barn-prosess
   # 2. I barnet: close(1); open("out.txt", O_WRONLY|O_CREAT) → fd 1
   # 3. exec("/bin/echo", "hei")
   # 4. echo skriver til fd 1 — som NÅ er filen, ikke terminal

  Slik fungerer < og > i Bash — bare omdirigering av fd-er før exec.

Pipes i shell:  ls | grep foo
   1. Shell lager en pipe → to fd-er (read-end, write-end)
   2. fork to barn:
        Barn A:  dup2(pipe_write, 1); exec("ls")
        Barn B:  dup2(pipe_read, 0);  exec("grep", "foo")
   3. ls skriver til pipe → grep leser fra pipe → ...

Filer i /proc/<pid>/fd/ viser hver kjørende prosess sine åpne fd-er:
   $ ls -la /proc/$$/fd
   0 -> /dev/pts/0
   1 -> /dev/pts/0
   2 -> /dev/pts/0
   255 -> /dev/pts/0`}</pre>
          </div>
        </section>

        <section id="fork-exec" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. fork og exec — hvordan prosesser starter</h2>
          <p className="text-sm text-muted-foreground mb-4">
            På Unix er prosess-opprettelse delt i to: kopier deg selv
            (<code>fork</code>), så bytt ut programkoden
            (<code>exec</code>). Det er rart, men det gir uovertruffen
            fleksibilitet.
          </p>
          <div className="rounded-xl border-2 border-brand/40 bg-brand/5 p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`fork() — lager en kopi av prosessen.
   Returnerer 0 i barn, og barnets PID i foreldre.

   pid_t pid = fork();
   if (pid == 0) {
       // BARN-PROSESS
       printf("Jeg er barnet, pid %d\\n", getpid());
       exit(0);
   } else if (pid > 0) {
       // FORELDRE-PROSESS
       printf("Jeg er forelderen, barnet er %d\\n", pid);
       waitpid(pid, NULL, 0);   // vent på at barnet dør
   } else {
       perror("fork");
   }

  Etter fork har vi to identiske prosesser. Begge har samme
  fd-er, samme variabler, samme PC — men forskjellig PID.

  CoW (Copy-on-Write) — minne blir bare faktisk kopiert når
  enten foreldre eller barn skriver til det. Ellers deles det.


exec*() — bytt ut den nåværende prosessens program med et nytt.
   exec returnerer IKKE hvis det lykkes (ingen kode etter).
   Den gamle programkoden er borte. Bare PID-en og fd-tabellen er
   beholdt.

   execve("/bin/ls", argv, envp);
   // Hvis vi kommer hit, har exec FEILET.


Hvorfor delt opp i to?

   1. Mellom fork() og exec(), kan barnet justere fd-tabellen
      (redirigering, pipe-setup, lukke unødvendige fd-er).
   2. Foreldre og barn kan dele lukninger uten å arve hverandres
      hele tilstand.
   3. Det matcher hvordan shellet faktisk fungerer.

Tegning av "ls -la" i bash:

   bash:
     fork()  ──┐
        │     │
        │      └──► child (kopi av bash):
        │              dup2(pipe_write_end, 1)   (redirigering hvis pipe)
        │              execve("/bin/ls", ["ls", "-la"], envp)
        │              (her bytter koden seg ut — bash forsvinner i barnet)
        │
        ▼
     waitpid()   ← venter på at /bin/ls returnerer
     ...
     promptet kommer tilbake`}</pre>
          </div>
        </section>

        <section id="pipes" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Pipes — kommunikasjon mellom prosesser</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`pipe(int fds[2])  — lager en kjernel-buffer med to fd-er.
   fds[0] = lese-ende
   fds[1] = skrive-ende

   Bytes skrevet til fds[1] kan leses fra fds[0]. Det er en FIFO.

Bygge "ls | wc -l" fra grunnen:

   int fds[2];
   pipe(fds);

   pid_t left = fork();
   if (left == 0) {
       // venstre barn: ls
       dup2(fds[1], 1);     // stdout går til pipe-write
       close(fds[0]);       // trenger ikke read-end
       close(fds[1]);       // har allerede dup-et til 1
       execlp("ls", "ls", (char*)NULL);
   }

   pid_t right = fork();
   if (right == 0) {
       // høyre barn: wc -l
       dup2(fds[0], 0);     // stdin kommer fra pipe-read
       close(fds[0]);
       close(fds[1]);       // ingen skrive
       execlp("wc", "wc", "-l", (char*)NULL);
   }

   close(fds[0]);
   close(fds[1]);
   waitpid(left, NULL, 0);
   waitpid(right, NULL, 0);

  Det er bokstavelig talt det shellet gjør når du skriver "ls | wc -l".

Pipe-buffer:
  Pipen er begrenset (typisk 64 KB i Linux). Hvis skriveren har
  fylt buffer-en, blokkerer write() til leseren har lest noe.

Navngitte pipes (FIFO):
  mkfifo(path, mode)  — lager en pipe som har et navn i filsystemet.
  To uavhengige prosesser kan open() og bruke samme FIFO.

Sockets:
  socket(AF_INET, SOCK_STREAM, 0) → fd
  En "extension" av pipe-modellen til nettverk. Samme read/write API.`}</pre>
          </div>
        </section>

        <section id="signaler" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Signaler</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Signaler er kernel-ens måte å avbryte en prosess på.
            Ctrl-C sender SIGINT, kill -9 sender SIGKILL, child som dør
            sender SIGCHLD til forelderen, segfault gir SIGSEGV.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Viktige signaler:

  Signal     Num   Beskrivelse                       Default-effekt
  ────────   ───   ────────────────────────────────  ──────────────
  SIGHUP      1    terminal/forelder forsvant         terminate
  SIGINT      2    Ctrl-C                              terminate
  SIGQUIT     3    Ctrl-\\                              core dump
  SIGILL      4    illegal instruksjon                core dump
  SIGABRT     6    abort() kalt                       core dump
  SIGFPE      8    flyttall-feil (divisjon med 0)    core dump
  SIGKILL     9    "drep nå" — KAN IKKE fanges       terminate
  SIGSEGV    11    segfault                           core dump
  SIGPIPE    13    skrev til pipe uten leser          terminate
  SIGTERM    15    "vennligst termineer"              terminate
  SIGCHLD    17    barn endret tilstand               (ignored)
  SIGSTOP    19    "pauser nå" — KAN IKKE fanges     stop
  SIGTSTP    20    Ctrl-Z                              stop
  SIGCONT    18    fortsett etter SIGSTOP             continue

Sende et signal:
   $ kill -SIGTERM 1234        # eller bare 'kill 1234' (TERM er default)
   $ kill -9 1234               # KILL — kan ikke fanges, drepes UMIDDELBART
   $ kill -SIGHUP <pid>         # tradisjonelt "reload config"

Fange et signal i C:
   #include <signal.h>

   void handler(int signo) {
       printf("Fikk SIGINT (%d), avslutter pent...\\n", signo);
       cleanup();
       _exit(0);
   }

   int main(void) {
       signal(SIGINT, handler);    // (eller bedre: sigaction)
       while (1) { /* jobbe */ }
   }

SIGKILL og SIGSTOP er spesielle — de KAN IKKE fanges, ignoreres
eller blokkeres. Det er nødvendig for at "kill -9" alltid skal
virke som en siste utvei.`}</pre>
          </div>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/drag" className="text-brand hover:underline">Drag-oppgaver</Link>
              : syscalls, fork-exec, pipes.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "trinn-10-flask-dyp" }} className="text-brand hover:underline">
                Trinn 10 — Flask under panseret
              </Link>
              : WSGI, hvordan TCP-bytes blir til en view.{" "}
              <ArrowRight className="inline h-3.5 w-3.5 ml-1" />
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
