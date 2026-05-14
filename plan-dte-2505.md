# Atom-dekomposisjon — DTE-2505 Operativsystemer

**5 stp · Eksamen 02.12.2026 (2t skriftlig)**

Plan-agent leste kurset slik: hub-en (`Dte2505Hub.tsx`) lister fem mini-kurs (OS-grunnlag, Linux-bruk, shell-scripting, brukere/rettigheter, virtualisering) pluss tre OSTEP-aligned drilling-sider (scheduling, virtuelt minne, concurrency/deadlock) og en oblig-guide som speiler 8 obliger fra VM-installasjon til systemd/logging. Praksis-laget er shell-drill (~40 scenarier i 7 topics), drag-oppgaver under "OS & Linux" (~70 stk), og en RWX-kalkulator. Pensum ligger derfor i tre lag — konseptuelt OS (OSTEP-stil), Linux-praksis (UiT-fokus), og obligene som lim — som atomene må respektere.

## Atom-dekomposisjon (avhengighets-ordnet)

### Lag A — Maskinen og lagdelingen (forutsetninger for alt annet)

**A1. CPU-modus (user vs kernel)**
- Hva er det egentlig? CPU-en har to privilegerte nivåer; user-mode er sandkasse, kernel-mode eier maskinvaren.
- Forutsetter: ingenting (kan tas helt først).
- Demo: vis et C-program som prøver å lese en device-fil direkte uten syscall → segfault. La studenten gjette hvorfor.
- Drill: "Hva skjer hvis et userspace-program forsøker å skrive direkte til disk-controlleren?" (segfault / general-protection trap).
- Status: **dekket** — `src/components/stack/os-grunnlag/OsGrunnlagPage.tsx` §1 (ASCII-diagrammet).

**A2. Syscall som eneste bro**
- Hva er det egentlig? En syscall er en kontrollert, instruksjons-utløst overgang fra user til kernel.
- Forutsetter: A1.
- Demo: `strace -c ls` — la studenten telle hvor mange syscalls et trivielt `ls` faktisk gjør.
- Drill: "Du skriver `printf("hei")` i C — hvilken syscall havner det til slutt i?" (write).
- Status: **dekket** — `OsGrunnlagPage.tsx` §5, samt `src/components/stack/trinn-9-syscalls-dyp` (cross-link).

**A3. Operativsystemets komponenter (kernel, scheduler, MM, VFS, drivere, syscalls, shell)**
- Hva er det egentlig? OS-et er en samling tjenester på toppen av kernelen, hver med ett ansvarsområde.
- Forutsetter: A1, A2.
- Demo: la studenten plassere `ls`, `bash`, `firefox`, `disk-driver`, `CFS` i riktig boks (kernel/user).
- Drill: "Hvilken komponent flytter `ls`-prosessen fra READY til RUNNING?" (scheduleren).
- Status: **dekket** — komponenttabell i `Dte2505Hub.tsx`.

### Lag B — Prosess-modellen (før alt annet praktisk)

**B1. Prosess som abstraksjon (eget adresseromm, PID, fds, env)**
- Hva er det egentlig? En prosess er et kjørende program med isolert minne og en identitet (PID).
- Forutsetter: A1.
- Demo: kjør to `python` i to terminaler, vis at `id(x)` for samme variabel gir ulike adresser; samme via `cat /proc/PID/maps`.
- Drill: Drag-oppgave — match {minne, PID, fds, env, cwd} til "tilhører prosess" vs "deles globalt".
- Status: **dekket** — `OsGrunnlagPage.tsx` §2.

**B2. Tråd (thread)**
- Hva er det egentlig? En utførelses-strøm inne i en prosess; tråder i samme prosess deler heap og adresseromm, men har egen stack.
- Forutsetter: B1.
- Demo: Python `threading` vs `multiprocessing` — vis at globals deles i én men ikke den andre.
- Drill: "To tråder i samme prosess — deler de stack? heap? PID?" (heap+PID ja; stack nei).
- Status: **delvis** — Linux-bruk og konkurrens-siden nevner threads, men ingen dedikert thread-vs-prosess-side.

**B3. Prosess-tilstander (NEW → READY → RUNNING → WAITING → TERMINATED)**
- Hva er det egentlig? En state machine som beskriver hvor en prosess er i livet sitt.
- Forutsetter: B1.
- Demo: state-diagram i `ProcessStateMachine.tsx`; la studenten klikke seg gjennom et `read()` som blokkerer.
- Drill: "En prosess som venter på `read()` fra socket — hvilken state?" (WAITING/blocked).
- Status: **dekket** — `src/components/stack/dte2505-prosesser-signaler/ProcessStateMachine.tsx`.

**B4. fork — duplisering**
- Hva er det egentlig? Én syscall returnerer i to prosesser: 0 i barnet, child-PID i forelderen.
- Forutsetter: B1, A2.
- Demo: kjør et 6-linjers C-program med `fork()` og `printf` før og etter; la studenten gjette antall utskrifter.
- Drill: "Etter `fork()` — hva returnerer den i parent? i child? ved feil?" (PID / 0 / -1).
- Status: **dekket** — kodeeksempel i `OsGrunnlagPage.tsx` §2.

**B5. exec — erstatte prosessbilde**
- Hva er det egentlig? `execve` beholder PID/fds men erstatter all kode og data med et nytt program.
- Forutsetter: B4.
- Demo: bash-shell oppskriften — fork lager ny prosess, exec gjør den om til `ls`.
- Drill: "Hva blir PID etter exec?" (uendret).
- Status: **dekket** — samme sted.

**B6. wait/exit og zombier**
- Hva er det egentlig? Et barn som har avsluttet forblir i prosess-tabellen til parent kaller `wait`; ellers blir det en zombie. Foreldreløse barn arves av init.
- Forutsetter: B4.
- Demo: skript som forker og ikke wait-er, observér `ps aux | grep Z` for "<defunct>".
- Drill: "Parent dør før child — hvem blir ny parent?" (PID 1 / init/systemd).
- Status: **dekket** — `dte2505-prosesser-signaler` "Zombie og orphan"-seksjon.

**B7. Signaler som IPC-mekanisme**
- Hva er det egentlig? Et signal er en asynkron beskjed til en prosess; default-handler er drep, fang, eller ignorer.
- Forutsetter: B1.
- Demo: skriv en liten Python-skript som installerer SIGINT-handler og loop-er; trykk Ctrl-C.
- Drill: "Hvilke to signaler kan IKKE fanges eller ignoreres?" (SIGKILL=9, SIGSTOP=19).
- Status: **dekket** — `ProsesserSignalerPage.tsx`, "Signaler-tabell" + "SIGTERM vs SIGKILL".

### Lag C — Scheduling

**C1. Scheduler-metrikker (turnaround, response, throughput, fairness)**
- Hva er det egentlig? Definisjoner av hva en god scheduler optimerer for.
- Forutsetter: B3.
- Demo: tre prosesser med kjente burst-tider — la studenten regne turnaround og respons for FIFO før algoritmen formelt introduseres.
- Drill: "Turnaround vs response — hva er forskjellen?" (turnaround = ferdig − ankommet; response = først kjørt − ankommet).
- Status: **dekket** — `dte2505-scheduling-drill` "metrics"-seksjon.

**C2. FIFO/FCFS**
- Hva er det egentlig? Førstemann-til-mølla; ingen preemption; convoy-effekt.
- Forutsetter: C1.
- Demo: Gantt-diagram med én lang etterfulgt av to korte; vis at en kort jobb venter unødig.
- Drill: "Hvorfor er gjennomsnittlig respons elendig under convoy-effekten?"
- Status: **dekket** — `SchedulingSimulator.tsx`.

**C3. SJF / STCF**
- Hva er det egentlig? Velg korteste jobb (SJF: ikke-preemptiv; STCF: preemptiv) — optimal for turnaround når lengdene er kjent.
- Forutsetter: C2.
- Demo: kjør samme jobbsett under FIFO og STCF; sammenlikn turnaround.
- Drill: "Hvorfor er SJF urealistisk i praksis?" (vi vet ikke burst-tid på forhånd).
- Status: **dekket** — samme.

**C4. Round-Robin og tidskvantum**
- Hva er det egentlig? Cyklisk preemptiv scheduler med fast tidskvantum; bytter ut respons mot turnaround.
- Forutsetter: C2.
- Demo: kjør tre jobber med kvantum 1 vs 4 — vis hvordan respons bedres og turnaround forverres.
- Drill: "Hvis kvantum → ∞, hva ligner RR på?" (FIFO). "Hvis kvantum → 0?" (context-switch-overhead dominerer).
- Status: **dekket** — samme.

**C5. MLFQ (Linux CFS som motivasjon)**
- Hva er det egentlig? Multi-nivå kø som lærer prosessens karakter (CPU-bound vs I/O-bound) ved å degradere langtkjørende.
- Forutsetter: C4.
- Demo: simulator med to interaktive og to compute-prosesser; vis hvordan interaktive forblir på topp.
- Drill: "Hva er regel 4/5 i MLFQ?" (boost periodisk for å unngå starvation; gaming-defense).
- Status: **dekket** — samme.

### Lag D — Minne

**D1. Virtuelle adresser og adresseromm-layout (text/data/heap/stack)**
- Hva er det egentlig? Hver prosess ser et flatt, privat adresseromm — illusjon skapt av MMU.
- Forutsetter: B1.
- Demo: kjør samme C-program to ganger, vis at `&main` er identisk men `malloc` returnerer ulike adresser; `cat /proc/self/maps`.
- Drill: "Hvor i layoutet ligger en global `int x = 5`?" (.data). "En `char *p = malloc(8)`?" (heap; pekeren selv på stack).
- Status: **dekket** — `MemoryLayout.tsx`.

**D2. Pages, frames, VPN, PFN, offset**
- Hva er det egentlig? Adresserommet deles i pages av lik størrelse (typisk 4 KiB), oversatt til fysiske frames via en page-tabell.
- Forutsetter: D1.
- Demo: gi studenten en 32-bits adresse og page-size; la dem dele opp i VPN+offset for hånd før formelen vises.
- Drill: "16-bits adresse, 4 KiB pages — hvor mange bits er offset?" (12).
- Status: **dekket** — `VirtueltMinnePage.tsx` §"pages"+"oversett".

**D3. TLB — hva og hvorfor**
- Hva er det egentlig? Cache for page-table-oppslag; uten den er hver minneaksess i praksis to minneaksesser.
- Forutsetter: D2.
- Demo: streamingen av en array i et tight loop — TLB-hit-rate nær 100%; sammenlikn med random pointer-chasing.
- Drill: "TLB-miss — hva må kernelen gjøre?" (page-table-walk).
- Status: **dekket** — `VirtueltMinnePage.tsx` §"tlb".

**D4. Page fault og demand paging**
- Hva er det egentlig? Når en virtuell page ikke er i fysisk RAM, traps prosessen til kernelen som laster inn (eller dreper).
- Forutsetter: D2.
- Demo: kjør et program som `mmap`-er en stor fil og leser sekvensielt; vis page-fault-tellere i `perf stat`.
- Drill: "Hvilke tre utfall har en page fault?" (minor: i RAM andre steder; major: må hente fra disk; segfault: ulovlig).
- Status: **dekket** — `VirtueltMinnePage.tsx` §"faults".

**D5. Replacement-algoritmer (FIFO, LRU, Clock, Optimal)**
- Hva er det egentlig? Når RAM er full, må noe evicte-s. Algoritmen velger hvilken page.
- Forutsetter: D4.
- Demo: `PageReplacementSim.tsx` med Belady-sekvens — vis at FIFO kan bli verre med flere frames.
- Drill: "Reference string 1,2,3,4,1,2,5,1,2,3,4,5 med 3 frames under LRU — hvor mange faults?" (10).
- Status: **dekket** — samme + simulator.

### Lag E — Filsystem

**E1. VFS og "alt er en fil"**
- Hva er det egentlig? Kernelen eksponerer alt (vanlige filer, devices, pipes, sockets, /proc) via samme open/read/write-API.
- Forutsetter: A2.
- Demo: `cat /dev/urandom | head -c 16 | xxd`; `cat /proc/self/status`.
- Drill: "Er `/dev/null` en fil? Hva returnerer `read` fra den?" (ja; 0 bytes / EOF).
- Status: **dekket** — `OsGrunnlagPage.tsx` §4.

**E2. Inode vs filnavn**
- Hva er det egentlig? Inoden er filens metadata + datapekere; filnavn er bare en oppføring i en katalog som peker til en inode.
- Forutsetter: E1.
- Demo: `ls -i fil.txt; ln fil.txt nytt-navn; ls -i nytt-navn` → samme inode-nummer.
- Drill: "Hva er forskjellen på hard link og symlink?" (hard: ny dir-entry til samme inode; sym: egen inode som inneholder en sti).
- Status: **dekket** — `OsGrunnlagPage.tsx` §4 + `InodeStructure.tsx`.

**E3. File descriptor**
- Hva er det egentlig? Et lite heltall fra `open()` som indekserer prosessens fd-tabell, som peker til kernelens fil-objekter.
- Forutsetter: B1, E1.
- Demo: `ls -l /proc/$$/fd` i bash; vis fd 0,1,2.
- Drill: "Hva er fd 0, 1, 2 by convention?" (stdin, stdout, stderr).
- Status: **delvis** — fd nevnes i syscalls-tabellen, men ingen dedikert side.

### Lag F — Brukere og rettigheter

**F1. UID/GID som primitiv**
- Hva er det egentlig? Hver prosess har en effective UID/GID; kernelen sjekker disse mot inode-rettigheter ved hver tilgang.
- Forutsetter: B1, E2.
- Demo: `id`, deretter `sudo id`; se hvordan UID endrer seg.
- Drill: "Hva betyr UID 0?" (root, bypasses de fleste rettighetssjekker).
- Status: **dekket** — `BrukereRettigheterPage.tsx` "passwd"+"useradd".

**F2. rwx for u/g/o**
- Hva er det egentlig? Ni bits — read/write/execute for owner/group/other — definerer adgang.
- Forutsetter: F1, E2.
- Demo: lag en fil 600, prøv lesing som annen bruker; endre til 644, prøv igjen.
- Drill: "rw-r----- → oktalt?" (640). "Hva betyr `x` på en katalog?" (lov å `cd` inn og oppløse filnavn til inode).
- Status: **dekket** — `RwxKalkulator.tsx`, drag-oppgaver, shell-drill `sh-chmod-755`.

**F3. chmod (oktal + symbolsk)**
- Hva er det egentlig? To måter å sette de 9 bittene: tallform (755) eller `u+x,g-w`.
- Forutsetter: F2.
- Demo: `chmod 755 a.sh` vs `chmod a+x,go-w a.sh` — vis at sluttresultat er likt.
- Drill: shell-drill `sh-chmod-private-key` — sett ~/.ssh/id_rsa til 600.
- Status: **dekket** — `RwxKalkulator.tsx`, shell-drill.

**F4. chown og gruppe-medlemskap**
- Hva er det egentlig? Endre eier-UID og gruppe-GID; krever vanligvis root.
- Forutsetter: F1.
- Demo: `sudo chown alice:dev fil; ls -l`; legg bob i `dev`-gruppen; bob får tilgang via gruppe-bits.
- Drill: shell-drill `sh-chown-recursive`.
- Status: **dekket** — shell-drill + `BrukereRettigheterPage.tsx`.

**F5. setuid/setgid/sticky (spesialbits)**
- Hva er det egentlig? Tre ekstra bits: setuid på fil = kjør med fil-eierens UID (slik `passwd` virker); setgid på katalog = nye filer arver dirs gruppe; sticky på dir = bare eier kan slette (slik `/tmp`).
- Forutsetter: F2.
- Demo: `ls -l /usr/bin/passwd` viser `rws`; `ls -ld /tmp` viser `t`.
- Drill: "Hvorfor må `passwd` være setuid-root?" (må skrive til /etc/shadow som er root-only).
- Status: **delvis** — SGID dekket i shell-drill `sh-chmod-sgid-dir`, men setuid/sticky som konsept-trio mangler dedikert behandling.

**F6. umask**
- Hva er det egentlig? Bitmaske som trekkes fra default-mode (666/777) når nye filer/dirs lages.
- Forutsetter: F2.
- Demo: `umask 077; touch ny; ls -l ny` → 600. Endre umask, gjenta.
- Drill: shell-drill `sh-umask-paranoid`.
- Status: **dekket** — `UmaskCalculator.tsx`, shell-drill.

**F7. sudo vs su**
- Hva er det egentlig? `su` bytter til en bruker (krever målets passord); `sudo` kjører én kommando som annen bruker (krever ditt eget passord, basert på sudoers).
- Forutsetter: F1.
- Demo: vis at `sudo -l` lister hva DU har lov til; sammenlikn med `su -`.
- Drill: drag-oppgave — hvilken bruker du er etter `sudo ls` vs `su - alice`.
- Status: **dekket** — `BrukereRettigheterPage.tsx` "sudo"-seksjon.

**F8. ACL (utvidet rettighetsmodell)**
- Hva er det egentlig? Når 9 bits ikke er nok: per-bruker/per-gruppe-rettigheter på samme inode.
- Forutsetter: F2.
- Demo: `setfacl -m u:bob:r fil; getfacl fil` — se den nye linjen.
- Drill: shell-drill `sh-acl-give-bob`.
- Status: **dekket** — `BrukereRettigheterPage.tsx` + shell-drill.

### Lag G — Konkurrens (parallell med D, etter B)

**G1. Race condition**
- Hva er det egentlig? Resultatet av to tråder avhenger av rekkefølge på instruksjoner uten synkronisering.
- Forutsetter: B2.
- Demo: to tråder som hver gjør `counter++` en million ganger — vis at sluttresultat sjelden er 2M.
- Drill: "Hvor i `counter++` ligger race condition?" (load–add–store er ikke atomisk).
- Status: **dekket** — `KonkurrensPage.tsx` "race".

**G2. Mutex / lock**
- Hva er det egentlig? Primitiv som garanterer at bare én tråd er i critical section om gangen.
- Forutsetter: G1.
- Demo: legg `pthread_mutex_lock/unlock` rundt counter; rekjør; vis at sluttresultat blir 2M.
- Drill: "Hva er forskjellen på spinlock og mutex?" (spinlock busy-waits, mutex blokkerer).
- Status: **dekket** — `KonkurrensPage.tsx` "mutex".

**G3. Condition variable**
- Hva er det egentlig? Synkroniseringsprimitiv som lar tråder vente på en betingelse uten å busy-loop-e, kombinert med en mutex.
- Forutsetter: G2.
- Demo: producer-consumer-simulator med wait/signal.
- Drill: "Hvorfor må wait alltid kjøres i while-løkke, ikke if?" (spurious wakeups).
- Status: **dekket** — `ProducerConsumerSim.tsx`.

**G4. Semafor**
- Hva er det egentlig? Tellende synkroniseringsprimitiv; binary semaphore ≈ mutex, counting semaphore = N slots.
- Forutsetter: G2.
- Demo: bounded buffer med en `full`-semafor og en `empty`-semafor.
- Drill: "Du har 5 lese-slots — hvilken initialverdi har semaforen?" (5).
- Status: **dekket** — `KonkurrensPage.tsx` "sem".

**G5. Deadlock og Coffmans fire betingelser**
- Hva er det egentlig? Mutual exclusion + hold-and-wait + no preemption + circular wait — alle fire må holde for deadlock.
- Forutsetter: G2.
- Demo: dining-philosophers + RAG-detektor; bryt én betingelse og vis at deadlock forsvinner.
- Drill: "Hvilken Coffman-betingelse brytes av lock-ordering?" (circular wait).
- Status: **dekket** — `DeadlockGraph.tsx`.

### Lag H — Shell og Linux-praksis (etter B og F)

**H1. Bash som program**
- Hva er det egentlig? Shellet er bare en vanlig prosess som leser inn linjer, fork-er, exec-er, og venter.
- Forutsetter: B4, B5, B6.
- Demo: vis at `bash -x` traces fork/exec; sammenlign med `strace -f bash -c 'ls'`.
- Drill: "Når du skriver `ls` i bash — hvilke tre syscalls er sentrale?" (fork, execve, waitpid).
- Status: **delvis** — antydet i `OsGrunnlagPage.tsx` §2, men ingen dedikert "shellet er en prosess"-side.

**H2. Pipes og redirects (stdin/stdout/stderr)**
- Hva er det egentlig? Bash kobler fd 1 fra prosess A til fd 0 i prosess B (pipe), eller åpner en fil og dup-er over fd 1 (redirect).
- Forutsetter: H1, E3.
- Demo: `ls | wc -l` vs `ls > out; wc -l < out` — vis at resultatet er likt; `strace -e dup2,pipe2` for å se mekanikken.
- Drill: "`cmd 2>&1 | grep err` — hvilken stream blir filtrert?" (både stdout og stderr).
- Status: **dekket** — `LinuxBrukPage.tsx` + `shell-scripting`-siden.

**H3. Exit-koder**
- Hva er det egentlig? Et heltall (0–255) en prosess returnerer ved exit; konvensjon: 0 = OK, ikke-0 = feil.
- Forutsetter: B6.
- Demo: `false; echo $?` (1); `true; echo $?` (0); `[ -f foo ]; echo $?`.
- Drill: "Hva betyr exit-kode 130?" (avbrutt av SIGINT — 128+2).
- Status: **dekket** — `shell-scripting`-siden "exit"-seksjon.

**H4. Variabler og kommando-substitusjon i bash**
- Hva er det egentlig? `var=verdi` (uten mellomrom!); `$var` ekspanderer; `$(cmd)` setter inn stdout fra cmd.
- Forutsetter: H1.
- Demo: `nå=$(date +%s); echo "tid: $nå"`.
- Drill: shell-drill `sh-cmd-substitution`.
- Status: **dekket** — shell-scripting + shell-drill.

**H5. Kontrollflyt (if / for / while)**
- Hva er det egentlig? Bash har if/then/fi, for in/do/done, while do/done. Tester gjøres med `[ … ]` (`-f`, `-d`, `-z`, `=`).
- Forutsetter: H3, H4.
- Demo: én-liners `[ -f /etc/passwd ] && echo ja` — la studenten først skrive uten &&, så kondensere.
- Drill: shell-drill `sh-if-file-exists`, `sh-for-loop-files`.
- Status: **dekket** — `shell-scripting`-siden + shell-drill + `BashSandbox.tsx`.

**H6. Pakkehåndtering (apt + dnf)**
- Hva er det egentlig? En pakke = filer + metadata + dependency-erklæringer; pakke-manageren installerer, oppgraderer, og finner gjensidige avhengigheter.
- Forutsetter: F1 (sudo) + filsystem.
- Demo: `apt show nginx`, `dpkg -L nginx` — vis at en pakke er en fil-manifest.
- Drill: shell-drill `sh-apt-install`, `sh-apt-search-owner`.
- Status: **dekket** — `LinuxBrukPage.tsx` "pakker" + shell-drill.

**H7. systemd-tjenester og journalctl**
- Hva er det egentlig? systemd er PID 1 og holder unit-filer (.service) som beskriver hva som skal kjøre, når, og avhengigheter. Loggene samles i journald.
- Forutsetter: B1, H6.
- Demo: skriv en minimal `min-app.service`, `systemctl daemon-reload && systemctl enable --now min-app`, `journalctl -fu min-app`.
- Drill: shell-drill `sh-systemctl-enable-now`, `sh-systemctl-daemon-reload`.
- Status: **dekket** — shell-drill + obliger-guide oblig-8.

### Lag I — Virtualisering (etter C, D, og prosess-konsept)

**I1. Hypervisor type 1 vs 2**
- Hva er det egentlig? Type 1 (bare metal) kjører direkte på maskinvare; type 2 kjører som en prosess i et host-OS.
- Forutsetter: A1.
- Demo: tabell type-1 (ESXi, Hyper-V) vs type-2 (VirtualBox, VMware Workstation); spør hvor host-OS-et passer inn.
- Drill: "VirtualBox på din laptop — type 1 eller 2?" (type 2).
- Status: **dekket** — `VirtualiseringPage.tsx`.

**I2. VM vs container**
- Hva er det egentlig? VM = egen kernel + eget OS, isolert av hypervisor; container = samme kernel, isolert av namespaces+cgroups.
- Forutsetter: I1, B1.
- Demo: vis at `docker run alpine uname -r` gir host-kernelens versjon — beviser at containere deler kernel.
- Drill: "Hvorfor starter en container på millisekunder, en VM på sekunder?" (ingen kernel-boot, ingen BIOS).
- Status: **dekket** — `VirtualiseringPage.tsx` "vm-container" + `docker`-siden.

**I3. Snapshots**
- Hva er det egentlig? Et frosset bilde av en VMs disk + RAM på et tidspunkt; kan rulles tilbake.
- Forutsetter: I1.
- Demo: ta snapshot før oblig-eksperiment, gjør destruktiv operasjon, rull tilbake.
- Drill: "Når i en oblig-arbeidsflyt bør du ta snapshot?" (før hvert risikofylt steg).
- Status: **dekket** — `VirtualiseringPage.tsx` "snapshots".

### Lag J — Oblig-broen (etter alt over)

**J1. Oblig-stigen (1→8 som progresjon)**
- Hva er det egentlig? Obligene bygger på hverandre: VM-installasjon → Linux-grunnlag → brukere/grupper → rettigheter → prosesser → scripting → pakker → tjenester. Hver oblig forutsetter forrige.
- Forutsetter: alle atomer over (J er syntese).
- Demo: la studenten plassere en gitt feilmelding ("Permission denied", "Job for x.service failed", "E: Unable to locate package") til riktig oblig-emne.
- Drill: "Du står fast på oblig 5 (prosesser). Hvilke atomer må sitte først?" (B1–B7, evt H1).
- Status: **dekket** — `Dte2505ObligerGuidePage.tsx` + `ObligerHub.tsx`.

---

## Åpne spørsmål

1. **OSTEP-prioritet på eksamen** — OSTEP-sider siterer kapitler, men UiT-pensumbeskrivelsen nevner ikke OSTEP-tema. Er C/D/G på eksamen eller bonus-dybde?
2. **Thread (B2) som eget atom** — pensumbeskrivelsen nevner ikke threads eksplisitt, men de er forutsetning for hele lag G.
3. **File descriptor (E3)** — ingen dedikert side. Marker som "implisitt forutsatt" eller løft til eget mini-atom?
4. **setuid/sticky (F5)** — kun nevnt forbigående. Egen drill-runde?
5. **Worktree-status** — `feat/dte-2505-obliger` er trolig stale; main er sannhetskilden.
