import { Link } from "@tanstack/react-router";
import { Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";

const STEPS = [
  { title: "Kernel vs userspace", anchor: "kernel-userspace" },
  { title: "Prosesser og threads", anchor: "prosesser" },
  { title: "Scheduling — fordeling av CPU", anchor: "scheduling" },
  { title: "Filsystem-konsept", anchor: "filsystem" },
  { title: "Syscalls — broen til kernelen", anchor: "syscalls" },
];

export function OsGrunnlagPage() {
  return (
    <StackPageShell title="OS-grunnlag" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2505 · O'Gorman kap. 1
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            OS-grunnlag — hva et operativsystem faktisk gjør
          </h1>
          <p className="mt-3 text-muted-foreground">
            Før vi pugger Linux-kommandoer: hva er kernelen, hva er en prosess, hvordan
            fordeler scheduleren CPU, og hva skjer egentlig når du åpner en fil?
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <Link to="/drag" className="text-brand hover:underline">drag-oppgaver</Link>{" "}
              under «OS-grunnlag» — match kernel/userspace, sortér fork/exec/wait/exit,
              quiz om syscalls.
            </div>
          </div>
        </div>

        <CourseOutline courseId="os-grunnlag" steps={STEPS} />

        <section id="kernel-userspace" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Kernel vs userspace</h2>
          <p className="text-sm text-muted-foreground mb-4">
            CPU-en har to privilegerte modi: <strong>kernel mode</strong> (kan gjøre alt)
            og <strong>user mode</strong> (begrenset). Operativsystemet bruker dette
            skillet til å hindre at ett program kan ødelegge andre.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`+──────────────────────────────────────+
│  USERSPACE  (ring 3, user mode)      │
│   bash, firefox, python, ssh, ...    │
│   begrenset — ingen direkte HW       │
+──────────────────────────────────────+
                │  syscall (int 0x80 / syscall instr)
                ▼
+──────────────────────────────────────+
│  KERNEL  (ring 0, kernel mode)       │
│   scheduler, VFS, drivere, nettverk  │
│   full tilgang til maskinvaren       │
+──────────────────────────────────────+
                │
                ▼
            MASKINVARE (CPU, RAM, disk, NIC)`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Et userspace-program som prøver å lese fra disk direkte vil få en
            <code> segmentation fault</code>. Det MÅ gå via en syscall.
          </p>

          <div className="mt-4 rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Lagene i et operativsystem — og HAL nederst
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              Tegner man hele systemet, ligger brukeren øverst og maskinvaren nederst, med
              operativsystemet som en stabel av lag imellom:
            </p>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`   BRUKER
      │  brukergrensesnitt (GUI eller kommandolinje)
      ▼
   APPLIKASJONER
      │  systemkall, via systembiblioteker (API/libc)
      ▼
 ┌─ OPERATIVSYSTEM ──────────────────────────────┐
 │  System Service Interface                     │
 │  Management av: prosess · minne · I/O ·       │
 │                 filer · nettverk              │
 │  HAL — Hardware Abstraction Layer             │
 └───────────────────────────────────────────────┘
      ▼
   MASKINVARE`}</pre>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              <strong className="text-foreground">HAL</strong> er det nederste laget, og jobben
              er å skjule at maskinvare er forskjellig. Resten av kjernen sier «skriv denne
              blokka til disk» uten å vite om disken er NVMe, SATA eller virtuell — HAL og
              driverne oversetter til de konkrete registrene og avbruddene.
            </p>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Det er derfor samme Linux-kjerne kjører på en telefon, en bærbar og en tjener: alt
              over HAL er uendret, og det er HAL og driverne som byttes ut. Samme idé som
              syscall-grensa, ett hakk lenger ned — begge er grensesnitt som lar det ene laget
              endre seg uten at det andre merker det.
            </p>
          </div>
        </section>

        <section id="prosesser" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Prosesser og threads</h2>
          <p className="text-sm text-muted-foreground mb-4">
            En <strong>prosess</strong> er et kjørende program: den har egen
            minne-adresseromm, PID, filsystem-deskriptorer, miljøvariabler. En{" "}
            <strong>thread</strong> er en utførelsestråd inne i en prosess —
            threads i samme prosess deler minne.
          </p>
          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Prosess-tilstander (state machine)
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`     fork()
NEW ─────► READY ◄─────────────┐
              │                │
   scheduler  │ dispatch       │ I/O ferdig / signal
              ▼                │
           RUNNING ────────►  WAITING (sover, venter på I/O)
              │
   exit()     │
              ▼
          TERMINATED  (zombie til parent kaller wait())`}</pre>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Klassisk fork/exec-mønster (Unix)
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`pid_t pid = fork();   // lager kopi av parent
if (pid == 0) {
    execvp("ls", argv);  // erstatter prosess-bilde med ls
} else {
    waitpid(pid, &status, 0);  // parent venter på child
}`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>fork</strong> dupliserer, <strong>exec</strong> erstatter,{" "}
            <strong>wait</strong> venter på avslutning, <strong>exit</strong> avslutter.
            Dette er hvordan bash starter alle programmer du kjører.
          </p>
        </section>

        <section id="scheduling" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Scheduling — fordeling av CPU</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Du har én CPU (eller noen få kjerner), men hundrevis av prosesser. Scheduleren
            bestemmer hvilken prosess som kjører nå.
          </p>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-40">Algoritme</th>
                  <th className="text-left font-semibold px-4 py-2">Beskrivelse</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">FCFS</td><td className="px-4 py-3 text-muted-foreground">First-come, first-served. Enkel, men én treg prosess blokkerer resten.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">SJF</td><td className="px-4 py-3 text-muted-foreground">Shortest job first. Lavest gjennomsnitt-ventetid, men krever forutsigelse.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">Round-robin</td><td className="px-4 py-3 text-muted-foreground">Hver prosess får tidskvante (f.eks. 10 ms), så bytte. Rettferdig.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">Priority</td><td className="px-4 py-3 text-muted-foreground">Høyere prioritet kjører først. Fare: starvation av lav-prioritet.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">CFS (Linux)</td><td className="px-4 py-3 text-muted-foreground">Completely Fair Scheduler — sporer hvor mye CPU hver prosess har fått, og gir tid til den som har fått minst.</td></tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Preemption:</strong> moderne OS-er <em>kan</em> avbryte en prosess midt
            i kjøring og gi CPU-en til en annen. Uten preemption ville én CPU-tung
            prosess fryse hele systemet.
          </p>
        </section>

        <section id="filsystem" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Filsystem-konsept</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Filsystemet organiserer data på disk. I Unix er ALT en fil — vanlige filer,
            kataloger, devices (<code>/dev/sda</code>), sockets, pipes.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`/                  ← root
├── bin/           ← brukerprogrammer (ls, cat)
├── boot/          ← kernel + bootloader
├── dev/           ← devices (sda, tty, null)
├── etc/           ← config (passwd, fstab, hosts)
├── home/          ← brukernes hjem-kataloger
│   └── isak/
├── proc/          ← virtuelt filsystem — prosess-info
├── root/          ← root-brukerens hjem
├── tmp/           ← midlertidige filer
├── usr/           ← brukerinstallert programvare
└── var/           ← varierende data — log, mail, db`}</pre>
          </div>
          <div className="mt-4 rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Inode — filens metadata
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              Hver fil har en inode med eier, gruppe, rettigheter, størrelse, tidsstempler
              og pekere til datablokkene. Filnavnet er BARE en peker til inoden i en
              katalog-fil.
            </p>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`stat fil.txt
  File: fil.txt
  Size: 1024     Blocks: 8        IO Block: 4096
  Device: 802h   Inode: 1234567   Links: 1
  Access: (0644/-rw-r--r--)  Uid: (1000/isak)  Gid: (1000/isak)`}</pre>
          </div>
        </section>

        <section id="syscalls" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Syscalls — broen til kernelen</h2>
          <p className="text-sm text-muted-foreground mb-4">
            En syscall er en kontrollert overgang fra userspace til kernel mode. Det er
            den eneste måten et program kan be om I/O, minne eller prosess-operasjoner.
          </p>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-32">Syscall</th>
                  <th className="text-left font-semibold px-4 py-2">Gjør</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">open</td><td className="px-4 py-3 text-muted-foreground">Åpne fil — returnerer file descriptor (fd)</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">read</td><td className="px-4 py-3 text-muted-foreground">Les fra fd inn i buffer</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">write</td><td className="px-4 py-3 text-muted-foreground">Skriv buffer til fd</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">close</td><td className="px-4 py-3 text-muted-foreground">Lukk fd</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">fork</td><td className="px-4 py-3 text-muted-foreground">Lag ny prosess</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">execve</td><td className="px-4 py-3 text-muted-foreground">Erstatt prosessbilde med nytt program</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">mmap</td><td className="px-4 py-3 text-muted-foreground">Map fil eller minne inn i adresseromm</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">socket</td><td className="px-4 py-3 text-muted-foreground">Lag nettverkssocket</td></tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Se faktisk syscalls med strace
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`$ strace -c ls
% time     calls    syscall
 21.5         12     read
 18.0          4     openat
 15.3          5     mmap
 ...`}</pre>
          </div>

          <div className="mt-4 rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              POSIX — hvorfor <code className="font-mono">open()</code> heter det samme overalt
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Før i tiden hadde hvert operativsystem sitt eget sett med syscalls. Et program
              skrevet for det ene måtte skrives om for det andre — omtrent som å bytte
              programmeringsspråk. <strong>POSIX</strong> (Portable Operating System Interface)
              standardiserer navnene, parameterne og oppførselen, beskrevet som C-funksjoner i{" "}
              <code className="font-mono">libc</code> og dokumentert i manualsidene.
            </p>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Derfor finnes <code className="font-mono">fork()</code>,{" "}
              <code className="font-mono">open()</code>, <code className="font-mono">rename()</code>,{" "}
              <code className="font-mono">gettimeofday()</code>,{" "}
              <code className="font-mono">getuid()</code> og{" "}
              <code className="font-mono">reboot()</code> med samme signatur på Linux, macOS og
              BSD. Det er standarden som gjør kildekode portabel — ikke at systemene er like
              innvendig.
            </p>
          </div>

          <div className="mt-4 rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              POSIX på Windows — tre forsøk
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Windows er ikke et POSIX-system, og Microsoft har prøvd å bygge bro tre ganger:
            </p>
            <ol className="mt-2 space-y-1.5 text-sm text-muted-foreground list-decimal pl-5">
              <li>
                <strong className="text-foreground">Microsoft POSIX subsystem</strong> — et eget
                delsystem ved siden av Win32. Lite brukt, og lagt ned.
              </li>
              <li>
                <strong className="text-foreground">Windows Services for UNIX (SFU)</strong> —
                erstatteren. Også lagt ned.
              </li>
              <li>
                <strong className="text-foreground">
                  Windows Subsystem for Linux (WSL)
                </strong>{" "}
                — fra Windows 10 Anniversary Update. Kjører ekte Linux-binærfiler, i utgangspunktet
                bare tekst (GUI krever en X11-tjener), og bruker mindre ressurser enn en virtuell
                maskin. Ubuntu, openSUSE, Fedora, Arch m.fl.
              </li>
            </ol>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Poenget med WSL 2 er verdt å merke seg: Microsoft ga opp å oversette syscalls, og
              sender i stedet <em>en ekte Linux-kjerne</em> med Windows. Det er den enkleste måten
              å være POSIX-kompatibel på — å faktisk kjøre Linux.
            </p>
          </div>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/stack/$slug" params={{ slug: "linux-bruk" }} className="text-brand hover:underline">
                Linux-bruk
              </Link>
              {" "}— hvordan bruke shell, filer og prosesser i praksis.
            </li>
            <li>
              <Link to="/drag" className="text-brand hover:underline">Drag-oppgaver</Link>
              {" "}under «OS-grunnlag».
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
