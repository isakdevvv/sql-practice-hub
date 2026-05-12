import { Link } from "@tanstack/react-router";
import {
  CheckSquare,
  AlertTriangle,
  Lightbulb,
  Terminal,
} from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";

// Obliger-guide: én leksjon som speiler kursets 8 obligatoriske innleveringer.
// Hver del har: lærings-mål, en sjekkliste, vanlige feller og nyttige kommandoer.

const STEPS = [
  { title: "Hvordan jobbe med oblig-ene", anchor: "intro" },
  { title: "Oblig 1 — VM-installasjon", anchor: "oblig-1" },
  { title: "Oblig 2 — Linux-grunnleggende", anchor: "oblig-2" },
  { title: "Oblig 3 — Bruker/gruppe-administrasjon", anchor: "oblig-3" },
  { title: "Oblig 4 — Filsystemrettigheter", anchor: "oblig-4" },
  { title: "Oblig 5 — Prosesshåndtering", anchor: "oblig-5" },
  { title: "Oblig 6 — Shell-scripting", anchor: "oblig-6" },
  { title: "Oblig 7 — Pakkebehandling og oppdatering", anchor: "oblig-7" },
  { title: "Oblig 8 — Tjenester og logging", anchor: "oblig-8" },
];

function Code({ children }: { children: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{children}</pre>
    </div>
  );
}

function Checklist({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5 text-sm">
      {items.map((it, i) => (
        <li key={i} className="flex items-start gap-2 text-muted-foreground">
          <CheckSquare className="h-4 w-4 mt-0.5 text-brand shrink-0" />
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}

function Pitfalls({ items }: { items: string[] }) {
  return (
    <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
      <div className="flex items-center gap-2 mb-2 text-amber-500 text-xs uppercase tracking-wider font-semibold">
        <AlertTriangle className="h-3.5 w-3.5" />
        Vanlige feller
      </div>
      <ul className="space-y-1.5 text-sm text-muted-foreground list-disc pl-5">
        {items.map((it, i) => (
          <li key={i}>{it}</li>
        ))}
      </ul>
    </div>
  );
}

function Goals({ items }: { items: string[] }) {
  return (
    <div className="rounded-lg border border-brand/30 bg-brand/5 p-4">
      <div className="flex items-center gap-2 mb-2 text-brand text-xs uppercase tracking-wider font-semibold">
        <Lightbulb className="h-3.5 w-3.5" />
        Lærings-mål
      </div>
      <ul className="space-y-1 text-sm text-muted-foreground list-disc pl-5">
        {items.map((it, i) => (
          <li key={i}>{it}</li>
        ))}
      </ul>
    </div>
  );
}

export function Dte2505ObligerGuidePage() {
  return (
    <StackPageShell title="DTE-2505 — Oblig-guide" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2505 · 8 obligatoriske innleveringer
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Oblig-guide — fra VM-installasjon til systemd og logging
          </h1>
          <p className="mt-3 text-muted-foreground">
            Alle åtte obliger må godkjennes for å kunne ta eksamen. Denne guiden
            speiler de typiske obligene i DTE-2505: hva du skal levere, hvilke
            kommandoer du må kunne, og hva som er erfaringsmessig vanskelig.
            Bruk listen som sjekkliste mens du øver.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Terminal className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Interaktiv praksis:</span>{" "}
              <Link to="/dte2505/shell-drill" className="text-brand hover:underline">
                Shell-drill
              </Link>{" "}
              gir 30+ scenarier der du skriver kommandoen og får svar med en gang.
            </div>
          </div>
        </div>

        <CourseOutline courseId="dte2505-obliger-guide" steps={STEPS} />

        <section id="intro" className="mb-12">
          <h2 className="text-xl font-semibold mb-3">Hvordan jobbe med oblig-ene</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Obligene er bygd opp som en stige: hver oblig forutsetter forrige.
            Det betyr at hvis du sliter med oblig 4 (rettigheter), bør du gå
            tilbake til oblig 2 (Linux-grunnleggende) og være sikker på at du
            forstår <code>ls -l</code>-output.
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
            <li>
              <strong className="text-foreground">Ta snapshot før du tukler.</strong>{" "}
              VirtualBox/VMware har snapshot-funksjon. Lag én etter oblig 1, og
              én etter hver oblig — så kan du rulle tilbake gratis hvis du ødelegger noe.
            </li>
            <li>
              <strong className="text-foreground">Skriv loggbok.</strong>{" "}
              En tekstfil per oblig der du noterer hver kommando du har kjørt.
              Sensor ber gjerne om dokumentasjon — du har den allerede.
            </li>
            <li>
              <strong className="text-foreground">Aldri kjør oblig som root.</strong>{" "}
              Bruk din vanlige bruker + <code>sudo</code> der det trengs. Det er en
              del av lærings-målet å vite NÅR sudo er nødvendig.
            </li>
            <li>
              <strong className="text-foreground">Test før du leverer.</strong>{" "}
              Reboot VM-en og sjekk at det du har konfigurert fortsatt fungerer.
              Mange poeng tapes fordi en endring bare lå i minnet eller i $PATH.
            </li>
          </ul>
        </section>

        <section id="oblig-1" className="mb-12">
          <h2 className="text-xl font-semibold mb-3">Oblig 1 — VM-installasjon</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Du skal installere en Linux-distribusjon (vanligvis Ubuntu eller Debian)
            i en virtuell maskin og dokumentere prosessen.
          </p>
          <div className="space-y-4">
            <Goals
              items={[
                "Forstå forskjellen på hypervisor type 1 (bare-metal) og type 2 (VirtualBox/VMware)",
                "Kunne sette opp VM med riktig CPU, RAM, disk, nettverk",
                "Bruke ISO som boot-medium og fullføre installasjons-veiviseren",
                "Bruke snapshots til å rulle tilbake feil",
              ]}
            />
            <Code>{`# Etter installasjon — første ting du gjør:
sudo apt update
sudo apt upgrade -y
sudo apt install -y openssh-server build-essential curl
# Installer VirtualBox Guest Additions (eller VMware Tools)
# slik at du får shared clipboard og bedre skjermoppløsning.`}</Code>
            <div>
              <h3 className="font-semibold text-sm mb-2">Sjekkliste</h3>
              <Checklist
                items={[
                  "VM-en starter og logger inn med din bruker",
                  "Nettverk fungerer — `ping 8.8.8.8` og `ping google.com` (DNS) går gjennom",
                  "Du har tatt en snapshot kalt 'frisk-installasjon'",
                  "`uname -a` viser kernel-versjon",
                  "Du kan SSH-e inn fra hosten (host-only eller bridged nettverk)",
                ]}
              />
            </div>
            <Pitfalls
              items={[
                "For lite RAM (under 2 GB) gir treig GUI. Sett 4 GB hvis hosten har nok.",
                "Glemt å aktivere VT-x/AMD-V i BIOS — VM-en starter ikke eller går veldig sakte.",
                "NAT vs Bridged: NAT lar VM-en surfe, men hosten kan ikke nå VM-en uten port-forward. For oblig 8 (tjenester) trenger du ofte Bridged eller Host-only.",
                "Snapshot tatt mens VM-en er på pause — fungerer, men ta heller én med VM-en avslått for «ren» tilstand.",
              ]}
            />
          </div>
        </section>

        <section id="oblig-2" className="mb-12">
          <h2 className="text-xl font-semibold mb-3">Oblig 2 — Linux-grunnleggende</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Filsystem-traversal, lese filer, søke etter mønstre, lese
            man-sider. Dette er fundamentet for alle senere obliger.
          </p>
          <div className="space-y-4">
            <Goals
              items={[
                "Navigere i filsystem-hierarkiet: /, /etc, /var, /home, /tmp, /usr",
                "Bruke ls/cd/pwd/cp/mv/rm/mkdir/touch trygt",
                "Lese filer med cat/less/head/tail",
                "Søke i filer med grep og finne filer med find",
                "Lese man-sider og forstå seksjonsnumre (man 1 ls vs man 5 passwd)",
              ]}
            />
            <Code>{`# Navigasjon og inspeksjon
pwd                       # hvor er jeg?
cd ~/Documents            # gå til en katalog
ls -lah                   # long, all, human-readable
tree -L 2                 # tre-visning (installer 'tree' først)

# Lese filer
cat /etc/os-release       # vis hele filen
less /var/log/syslog      # bla igjennom (q for å avslutte)
head -n 20 fil.txt        # første 20 linjer
tail -f /var/log/syslog   # følg loggen i sanntid

# Søk
grep -rn "TODO" .         # rekursivt, vis linjenummer
grep -i "error" log.txt   # case-insensitive
find / -name "*.conf" 2>/dev/null            # alle .conf-filer
find /home -mtime -1                          # endret siste 24 t
find . -type f -size +10M                     # store filer

# Man-sider
man ls                    # bruksanvisning for ls
man 5 passwd              # seksjon 5 = filformat
apropos network           # finn man-sider om emnet`}</Code>
            <Checklist
              items={[
                "Du kan forklare hva som ligger i /etc, /var, /home og /usr",
                "Du kan finne alle .log-filer endret siste 24 timer",
                "Du kan kjede grep og find med pipe og argumenter",
                "Du vet forskjellen på `man 1` (kommandoer) og `man 5` (filformater)",
              ]}
            />
            <Pitfalls
              items={[
                "`rm -rf` med variabel — hvis variabelen er tom blir det `rm -rf /`. Bruk alltid quoting og helst `--`.",
                "`find / -name ...` uten `2>/dev/null` druknes i Permission-denied-meldinger.",
                "grep matcher BRE som standard. For Perl-regex: `grep -P`. For utvidet: `grep -E`.",
                "less viser kompresserte filer feil — bruk `zless` for .gz.",
              ]}
            />
          </div>
        </section>

        <section id="oblig-3" className="mb-12">
          <h2 className="text-xl font-semibold mb-3">Oblig 3 — Bruker/gruppe-administrasjon</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Opprette brukere, legge dem i grupper, gi sudo-tilgang og forstå
            hvilke filer som faktisk lagrer informasjonen.
          </p>
          <div className="space-y-4">
            <Goals
              items={[
                "useradd/usermod/userdel og forskjellen på dem og adduser-veiviseren",
                "groupadd/groupmod/groupdel + primær vs sekundær gruppe",
                "Lese og forstå /etc/passwd, /etc/shadow og /etc/group",
                "Sette og endre passord med passwd",
                "Gi en bruker sudo-tilgang trygt (sudo-gruppe, ikke wheel på Debian)",
              ]}
            />
            <Code>{`# Opprette bruker med hjemmekatalog og bash
sudo useradd -m -s /bin/bash alice
sudo passwd alice

# Legg i ekstra gruppe — viktig: -a (append) ellers mister hun andre grupper
sudo usermod -aG sudo alice
sudo usermod -aG developers alice

# Endre primær gruppe
sudo usermod -g developers alice

# Slett bruker (og hjemmekatalog)
sudo userdel -r alice

# Gruppe-CRUD
sudo groupadd developers
getent group developers      # vis hvem som er i gruppa

# /etc/passwd-format: 7 felter, kolon-separert
# isak:x:1000:1000:Isak Olsen,,,:/home/isak:/bin/bash
# navn:passord-flag:UID:GID:GECOS:hjem:shell

# /etc/shadow er kun lesbar av root og inneholder hashet passord
sudo cat /etc/shadow | head -3

# Sjekk hvilke grupper du er i
groups
id`}</Code>
            <Checklist
              items={[
                "Du kan opprette en bruker med hjemmekatalog og bash-shell",
                "Du forstår hver av de 7 feltene i /etc/passwd",
                "Du vet hvorfor passordet ligger i /etc/shadow og ikke /etc/passwd",
                "Du kan legge en bruker i sudo-gruppen og verifisere med `sudo -l`",
                "Du kan slette en bruker pent (`userdel -r`)",
              ]}
            />
            <Pitfalls
              items={[
                "`usermod -G gruppe alice` (uten -a) ERSTATTER alle hennes sekundære grupper. Bruk alltid `-aG`.",
                "`useradd` uten `-m` lager INGEN hjemmekatalog. Brukeren får login-feil ved første pålogging.",
                "`useradd` uten `-s /bin/bash` på Debian gir `/bin/sh`. Veldig vanlig fallgruve.",
                "Du må logge ut og inn igjen før nye gruppemedlemskap blir synlig for prosessen.",
                "passwd må kjøres som root for å sette passord for andre brukere.",
              ]}
            />
          </div>
        </section>

        <section id="oblig-4" className="mb-12">
          <h2 className="text-xl font-semibold mb-3">Oblig 4 — Filsystemrettigheter</h2>
          <p className="text-sm text-muted-foreground mb-3">
            chmod, chown, umask, og spesielle bits (setuid, setgid, sticky).
            Dette er det mest dokumenterte temaet på eksamen.
          </p>
          <div className="space-y-4">
            <Goals
              items={[
                "Lese `ls -l` og avkode owner/group/other-rettigheter",
                "Sette rettigheter både symbolsk (u+x) og oktalt (755)",
                "Forstå umask og hvordan den påvirker nye filer",
                "Bruke setuid, setgid og sticky bit korrekt",
                "Bruke ACL (getfacl/setfacl) når DAC ikke er nok",
              ]}
            />
            <Code>{`# Symbolsk
chmod u+x script.sh           # legg til execute for owner
chmod g-w fil                 # fjern write for group
chmod o= fil                  # fjern alt for other
chmod a+r fil                 # all (u+g+o) får read

# Oktalt — r=4, w=2, x=1
chmod 755 script.sh           # rwxr-xr-x
chmod 644 notater.txt         # rw-r--r--
chmod 600 ~/.ssh/id_rsa       # rw-------  (ssh nekter ellers)
chmod 700 ~/.ssh              # rwx------  (samme grunn)

# Eierskap
sudo chown alice fil          # bytt eier
sudo chown alice:devs fil     # eier og gruppe
sudo chown -R alice /var/app  # rekursivt

# umask — hva nye filer/kataloger fødes med
umask                          # vis nåværende
umask 022                      # standard: filer 644, kataloger 755
umask 077                      # paranoid: filer 600, kataloger 700
# Regel: ny fil = 666 minus umask. Ny katalog = 777 minus umask.

# Spesielle bits
chmod 4755 /usr/bin/passwd     # SUID (4xxx) — kjør som filens eier
chmod 2755 /var/team           # SGID (2xxx) — nye filer arver gruppe
chmod 1777 /tmp                # sticky (1xxx) — bare eier kan slette i felles katalog

# ACL — fingerkornet tilgang utover rwx
sudo setfacl -m u:bob:rw fil       # bob får rw uavhengig av gruppe
getfacl fil                         # vis hele ACL-en
sudo setfacl -x u:bob fil           # fjern bobs eksplisitte regel
sudo setfacl -b fil                 # fjern alle ekstra ACL-er`}</Code>
            <Checklist
              items={[
                "Du kan oversette mellom rwx-, binær- og oktal-notasjon i hodet",
                "Du kan forklare hva som skjer hvis ssh-katalogen din er 755 (ssh nekter å bruke nøklene)",
                "Du har testet umask og sett at filer og kataloger får ulike default-bits",
                "Du har laget en SGID-katalog der nye filer automatisk får riktig gruppe",
                "Du har brukt setfacl for å gi spesifikk bruker ekstra tilgang",
              ]}
            />
            <Pitfalls
              items={[
                "`chmod 777` løser symptomet, ikke problemet. Sensor merker dette med en gang.",
                "chmod på en symbolsk lenke endrer fila lenken peker på, ikke lenken selv — bruk `chmod -h` eller `chown -h` for å påvirke lenken.",
                "`chmod -R 755 .` på et hjem gir alle filer execute — ikke greit. Bruk `find ... -type f -exec chmod 644 {} \\;` og `find ... -type d -exec chmod 755 {} \\;`.",
                "Sticky bit på en fil gjør INGENTING på moderne Linux — den er kun meningsfull på kataloger.",
                "ACL krever at filsystemet er montert med `acl`-opsjonen — på de fleste moderne filsystem er det default.",
              ]}
            />
          </div>
        </section>

        <section id="oblig-5" className="mb-12">
          <h2 className="text-xl font-semibold mb-3">Oblig 5 — Prosesshåndtering</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Liste prosesser, sende signaler, justere prioritet og håndtere
            bakgrunns-jobber. Forberedelse for oblig 8 (systemd).
          </p>
          <div className="space-y-4">
            <Goals
              items={[
                "ps aux og ps -ef — to syntakser, samme info",
                "top og htop — interaktiv overvåkning",
                "kill og signaler — SIGTERM (15), SIGKILL (9), SIGHUP (1), SIGINT (2)",
                "nice og renice — påvirke schedulerens prioritet",
                "Jobs, fg, bg, nohup, & og disown — kontroll i shellet",
              ]}
            />
            <Code>{`# Listing
ps aux                    # alle prosesser, BSD-stil (USER PID %CPU %MEM ...)
ps -ef                    # alle prosesser, System V-stil (UID PID PPID ...)
ps aux | grep nginx       # finn navngitt prosess
pgrep -fl nginx           # bedre — finn PID-er

# Interaktiv
top                       # innebygd
htop                      # penere; installer med apt install htop
btop                      # enda penere; nyeste alternativ

# Signaler
kill 1234                 # SIGTERM (15) — be pent om å avslutte
kill -15 1234             # eksplisitt SIGTERM
kill -9 1234              # SIGKILL — drep uten å spørre
kill -HUP 1234            # SIGHUP — be tjenesten reloade config
killall nginx             # drep alle med dette navnet
pkill -f "python myscript.py"   # drep basert på command-line

# Liste alle signaler
kill -l

# Prioritet (nice = "snillhet"; lavere = mer aggressiv)
nice -n 10 ./langsom-jobb.sh     # start med nice 10
renice -n 19 -p 1234              # endre til lavest mulig prioritet
renice -n -5 -p 1234              # forhøye (krever root)

# Bakgrunns-jobber i shellet
./langsom-jobb.sh &       # start i bakgrunn
jobs                      # vis jobber i shellet
fg %1                     # hent jobb 1 til forgrunn
bg %1                     # fortsett stoppet jobb i bakgrunn
Ctrl+Z                    # suspendér forgrunns-jobb
nohup ./jobb.sh &         # kjør videre selv etter logout
disown -h %1              # ikke send SIGHUP når shellet lukkes`}</Code>
            <Checklist
              items={[
                "Du kan finne PID til en gitt prosess på minst to måter",
                "Du vet hvorfor SIGTERM bør prøves før SIGKILL",
                "Du har brukt SIGHUP til å få en tjeneste til å reload-e config",
                "Du har startet en jobb i bakgrunnen og hentet den tilbake med fg",
                "Du har brukt nice til å la en tung jobb gå uten å fryse systemet",
              ]}
            />
            <Pitfalls
              items={[
                "SIGKILL (-9) kan ikke fanges. Prosessen får ALDRI sjansen til å rydde — låste filer, åpne sockets, halv-skrevne data blir hengende.",
                "kill uten signal-flagg sender SIGTERM, ikke SIGKILL. Mange tror -9 er default. Det er det ikke.",
                "ps aux og ps -ef gir samme info i ulik formatering — ikke ulike kommandoer.",
                "nohup-output går til ./nohup.out som standard — sjekk der hvis du tror jobben ikke har skrevet noe.",
                "& uten `disown` betyr at jobben fortsatt henger fra shellet — den dør ved logout med mindre du brukte nohup.",
              ]}
            />
          </div>
        </section>

        <section id="oblig-6" className="mb-12">
          <h2 className="text-xl font-semibold mb-3">Oblig 6 — Shell-scripting</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Bash-scripting: variabler, kontrollflyt, funksjoner og exit-koder.
            Skriv robuste skript som faktisk feiler høyt når noe går galt.
          </p>
          <div className="space-y-4">
            <Goals
              items={[
                "Shebang, eksekverbar fil, og hvordan kjøre skript",
                "Variabler, kommandosubstitusjon $(...) og argumenter $1..$N",
                "if/then/fi, while/do/done, for/in/do/done",
                "Funksjoner med argumenter og return-verdier",
                "Exit-koder og hvordan ‹set -euo pipefail› hjelper",
              ]}
            />
            <Code>{`#!/usr/bin/env bash
# Robust bash strict mode — anbefales i ALLE oblig-skript:
set -euo pipefail
IFS=$'\\n\\t'

# -e   = avslutt ved første feil
# -u   = error på udefinert variabel
# -o pipefail = feil i pipe propagerer
# IFS = bare nylinje/tab — beskytter mot ord-splitting

# Variabler — INGEN mellomrom rundt =
navn="alice"
home="$HOME"
antall=$(ls -1 | wc -l)        # kommandosubstitusjon

# Argumenter
echo "Skriptet heter: $0"
echo "Første argument: $1"
echo "Antall argumenter: $#"
echo "Alle: $@"
echo "PID: $$"
echo "Forrige exit-kode: $?"

# if/then/fi
if [ -f "$1" ]; then
  echo "$1 finnes"
elif [ -d "$1" ]; then
  echo "$1 er en katalog"
else
  echo "$1 finnes ikke"
fi

# Vanlige test-flagg:
# -f fil    = vanlig fil
# -d kat    = katalog
# -r fil    = lesbar
# -w fil    = skrivbar
# -x fil    = eksekverbar
# -z streng = tom streng
# -n streng = ikke tom

# for-løkke
for fil in *.log; do
  echo "Komprimerer $fil"
  gzip "$fil"
done

# while-løkke som leser fil
while IFS= read -r linje; do
  echo "Fikk: $linje"
done < input.txt

# Funksjon
backup_fil() {
  local kilde="$1"
  local dest="$2"
  cp -a "$kilde" "$dest" || return 1
  echo "Backup OK: $kilde -> $dest"
}

backup_fil /etc/hosts /tmp/hosts.bak
if [ $? -ne 0 ]; then
  echo "Feilet!" >&2
  exit 1
fi

# Eksempel: krev minst ett argument
if [ $# -lt 1 ]; then
  echo "Bruk: $0 <fil>" >&2
  exit 2
fi`}</Code>
            <Checklist
              items={[
                "Skriptene dine starter med shebang og `set -euo pipefail`",
                "Du quoter variabler: `\"$var\"` ikke `$var` (beskytter mot mellomrom i filnavn)",
                "Du skiller mellom `[ ]` (POSIX test) og `[[ ]]` (bash extended)",
                "Du bruker exit-kode 0 for suksess og >0 for feil",
                "Du bruker `>&2` for å skrive feilmeldinger til stderr",
              ]}
            />
            <Pitfalls
              items={[
                "Mellomrom rundt = i tilordning: `navn = \"alice\"` blir tolket som «kjør kommandoen navn med argumenter = og alice».",
                "Glemt $ ved bruk av variabel: `echo navn` skriver «navn», ikke verdien.",
                "Uquoted variabler i if: `[ -f $fil ]` med mellomrom i filnavn = syntaks-feil. Bruk alltid quotes.",
                "`==` virker i `[[ ]]` men ikke i POSIX `[ ]` (der bruker du `=`).",
                "for-løkke over `$(ls)` er en klassisk feil. Bruk glob: `for f in *.log`.",
                "Skriptet er ikke eksekverbart — du har glemt `chmod +x`.",
              ]}
            />
          </div>
        </section>

        <section id="oblig-7" className="mb-12">
          <h2 className="text-xl font-semibold mb-3">Oblig 7 — Pakkebehandling og oppdatering</h2>
          <p className="text-sm text-muted-foreground mb-3">
            apt/dnf-kommandoer, hvordan systemet vet hvor pakkene kommer fra,
            og hvordan oppgradere uten å brekke systemet.
          </p>
          <div className="space-y-4">
            <Goals
              items={[
                "apt/dnf-kommandoer: update, upgrade, install, remove, search",
                "Hva /etc/apt/sources.list og /etc/yum.repos.d/ gjør",
                "Forskjellen på dpkg/rpm (lav-nivå) og apt/dnf (høy-nivå)",
                "Hva som skjer under en kernel-oppgradering",
                "Bruke snapshots for å rulle tilbake et brukket system",
              ]}
            />
            <Code>{`# Debian/Ubuntu — apt
sudo apt update                 # oppdater pakkelistene (ikke selve pakkene)
sudo apt upgrade                # oppgrader installerte pakker
sudo apt full-upgrade           # tillat fjerning hvis nødvendig
sudo apt install nginx          # installer
sudo apt remove nginx           # avinstaller (behold config)
sudo apt purge nginx            # avinstaller (slett config også)
sudo apt autoremove             # rydd opp i ubrukte avhengigheter
apt search "web server"         # søk
apt show nginx                  # detaljer om en pakke
apt list --installed            # alt som er installert

# Kilder (sources)
cat /etc/apt/sources.list
ls /etc/apt/sources.list.d/

# Lav-nivå — dpkg
dpkg -l                        # liste alt installert
dpkg -L nginx                  # filer som hører til pakken
dpkg -S /usr/sbin/nginx        # hvilken pakke eier denne filen?
sudo dpkg -i pakke.deb         # installer en lokal .deb
sudo dpkg --configure -a       # rep "interrupted" dpkg-tilstand

# Fedora/RHEL — dnf
sudo dnf check-update
sudo dnf upgrade
sudo dnf install nginx
sudo dnf remove nginx
dnf search web-server
dnf info nginx
dnf history                   # full historikk!
sudo dnf history undo 42      # rull tilbake en bestemt transaksjon

# rpm (lav-nivå)
rpm -qa                       # liste alt
rpm -ql nginx                 # filer i pakken
rpm -qf /usr/sbin/nginx       # hvilken pakke eier filen?

# Holde igjen / pinning
sudo apt-mark hold linux-image-generic
sudo dnf versionlock add nginx`}</Code>
            <Checklist
              items={[
                "Du forstår at `apt update` IKKE oppgraderer pakker — bare pakkelistene",
                "Du har installert, fjernet og purget en pakke og sett forskjellen",
                "Du vet hvor sources.list ligger og hvordan tilføye et nytt repository",
                "Du kan finne hvilken pakke som eier en gitt fil",
                "Du har testet `dnf history undo` (eller apt-historikk) for rollback",
              ]}
            />
            <Pitfalls
              items={[
                "`apt upgrade` uten `update` først bruker gamle pakkelister og ser ikke nye versjoner.",
                "Tredje-parts repoer kan brekke avhengigheter. Aldri legg til random PPA-er på en oblig-VM.",
                "`dpkg -i pakke.deb` håndterer ikke avhengigheter. Bruk `apt install ./pakke.deb` i stedet.",
                "Glemt `sudo` foran apt/dnf — du får en uklar tilgangs-feil.",
                "Etter kernel-oppgradering må VM rebootes for å bruke ny kernel. `uname -r` viser nåværende.",
                "`apt remove` lar config-filer ligge igjen i /etc — bruk `purge` for å rydde helt.",
              ]}
            />
          </div>
        </section>

        <section id="oblig-8" className="mb-12">
          <h2 className="text-xl font-semibold mb-3">Oblig 8 — Tjenester og logging</h2>
          <p className="text-sm text-muted-foreground mb-3">
            systemctl, journalctl, cron og logrotate. Avslutter kurset ved å
            ta deg fra «en kommando jeg kjører manuelt» til «en tjeneste som
            kjører automatisk og roteres».
          </p>
          <div className="space-y-4">
            <Goals
              items={[
                "Starte, stoppe, restart-e og enable-e tjenester med systemctl",
                "Lese tjeneste-status og logger med journalctl",
                "Lage en egen .service-fil under /etc/systemd/system/",
                "Sette opp cron-jobber via crontab -e",
                "Bruke logrotate for å hindre at logger fyller disken",
              ]}
            />
            <Code>{`# systemctl — kontrollere tjenester
sudo systemctl status nginx           # status + siste logg-linjer
sudo systemctl start nginx            # start nå
sudo systemctl stop nginx             # stopp
sudo systemctl restart nginx          # stopp + start
sudo systemctl reload nginx           # be tjenesten lese config på nytt
sudo systemctl enable nginx           # autostart ved boot
sudo systemctl disable nginx          # ikke autostart
sudo systemctl enable --now nginx     # enable og start på en gang

# List alt
systemctl list-units --type=service
systemctl list-unit-files --type=service --state=enabled

# journalctl — strukturerte logger
journalctl -u nginx                   # logg for én tjeneste
journalctl -u nginx -f                # følg i sanntid (som tail -f)
journalctl -u nginx --since "1 hour ago"
journalctl -u nginx --since today --until "2 hours ago"
journalctl -p err                     # bare priority error eller verre
journalctl -b                         # siden siste boot
journalctl --disk-usage               # hvor stor er journalen?

# Egen systemd-tjeneste — /etc/systemd/system/min-app.service
sudo tee /etc/systemd/system/min-app.service <<'EOF'
[Unit]
Description=Mitt eksempelprogram
After=network.target

[Service]
Type=simple
User=alice
WorkingDirectory=/opt/min-app
ExecStart=/usr/bin/python3 /opt/min-app/app.py
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload          # NB: må kjøres når du endrer en .service-fil
sudo systemctl enable --now min-app

# cron — periodiske jobber
crontab -e                            # rediger dine cron-jobber
crontab -l                            # vis dem
# Format: minutt time dag måned ukedag kommando
# 0 3 * * *  /usr/local/bin/backup.sh    # hver natt kl 03:00
# */5 * * * * /usr/local/bin/sjekk.sh    # hvert 5. minutt

# system-wide cron — /etc/cron.daily/ /etc/cron.weekly/
ls /etc/cron.daily/

# logrotate — /etc/logrotate.d/
cat /etc/logrotate.d/nginx            # eksempel-konfig
sudo logrotate -d /etc/logrotate.conf # dry-run

# /var/log/ — viktige loggfiler
ls /var/log/                          # alle logger
sudo tail -f /var/log/syslog          # generell system-logg (Debian)
sudo tail -f /var/log/auth.log        # login/sudo-forsøk
sudo tail -f /var/log/nginx/error.log`}</Code>
            <Checklist
              items={[
                "Du kan starte/stoppe/enable-e en eksisterende tjeneste",
                "Du har skrevet og deployet en egen .service-fil med `daemon-reload`",
                "Du kan følge en tjenestes logger i sanntid med journalctl -f",
                "Du har satt opp en cron-jobb og verifisert at den faktisk kjørte (sjekk /var/log/syslog)",
                "Du har en logrotate-konfig som roterer loggene dine før de blir for store",
              ]}
            />
            <Pitfalls
              items={[
                "Endret en .service-fil men ikke kjørt `systemctl daemon-reload`. systemd bruker fortsatt gammel versjon.",
                "Brukt `tilfeldig=verdi` i ExecStart — systemd støtter ikke shell-syntaks her. Wrap i et bash-skript hvis du trenger.",
                "Glemt `Restart=on-failure` — tjenesten stopper for godt ved første krasj.",
                "cron-jobber kjører med MINIMAL miljøvariabel-PATH. Bruk fulle stier (`/usr/bin/python3`, ikke `python3`).",
                "cron-jobber kjører ikke fordi maskinen er avslått ved jobbe-tidspunktet. På en laptop: bruk `systemd-timer` i stedet, som tar igjen tapte kjøringer.",
                "logrotate kjører ikke fordi /etc/cron.daily/logrotate ikke er installert.",
                "journalctl bruker mye disk. `journalctl --vacuum-time=7d` rydder.",
              ]}
            />
          </div>
        </section>

        <div className="mt-12 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Hvor passer dette inn?</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <strong className="text-foreground">Drag-oppgaver:</strong>{" "}
              <Link to="/drag" className="text-brand hover:underline">/drag</Link>{" "}
              — filtre på «Linux», «Linux-rettigheter», «Linux-prosesser», «Shell scripting», «Pakkebehandling».
            </li>
            <li>
              <strong className="text-foreground">Shell-drill:</strong>{" "}
              <Link to="/dte2505/shell-drill" className="text-brand hover:underline">/dte2505/shell-drill</Link>{" "}
              — 30+ scenarier der du selv skriver kommandoen.
            </li>
            <li>
              <strong className="text-foreground">Flashcards:</strong>{" "}
              <Link to="/cards" className="text-brand hover:underline">/cards</Link>{" "}
              — repetisjon på Linux, Prosesser, Rettigheter, Shell og Systemd.
            </li>
            <li>
              <strong className="text-foreground">Mini-kurs:</strong>{" "}
              <Link to="/stack/$slug" params={{ slug: "linux-bruk" }} className="text-brand hover:underline">Linux-bruk</Link>,{" "}
              <Link to="/stack/$slug" params={{ slug: "shell-scripting" }} className="text-brand hover:underline">Shell scripting</Link>,{" "}
              <Link to="/stack/$slug" params={{ slug: "brukere-rettigheter" }} className="text-brand hover:underline">Brukere &amp; rettigheter</Link>.
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
