// Shell-drill: scenarier hvor studenten skriver kommando i tekstfelt.
//
// `matchers` er regex som testes mot brukerens normaliserte input. Et scenario
// godtas hvis MINST ÉN regex matcher hele input-strengen. Vi normaliserer ved å:
// - trimme whitespace
// - kollapse multiple mellomrom til ett
// - lower-case (siden Linux-kommandoer i nesten alle tilfeller er case-sensitive
//   for argumenter, men selve kommando-navnene er små. Vi lar regex selv håndtere
//   eventuelle store-bokstav-krav via [Aa] eller flags).
//
// `topic` styrer kategori-filtre i UI.
// `hint` vises etter første feilforsøk.
// `solution` vises etter rett svar eller etter "Gi opp".
// `flagOrder` indikerer at vi tolererer ulik rekkefølge på flagg
// (matcher-regex må selv ta hensyn — vi dokumenterer det her for forfatter).

export type ShellTopic =
  | "find-grep"
  | "rettigheter"
  | "prosesser"
  | "pakker"
  | "tjenester"
  | "arkiv-overforing"
  | "script-snutt";

export interface ShellScenario {
  id: string;
  topic: ShellTopic;
  title: string;
  /** Plain Norwegian beskrivelse av oppgaven. */
  prompt: string;
  /** Eksempel-state i miljøet (vises i monospace). */
  context?: string;
  /** Regex-er — minst én må matche hele input (etter normalisering). */
  matchers: RegExp[];
  /** Hint som vises etter første feil-forsøk. */
  hint: string;
  /** Den «kanoniske» løsningen som vises etter løst eller etter «vis svar». */
  solution: string;
  /** Forklarende note vist etter løsning. */
  explanation?: string;
}

const TOPIC_LABEL: Record<ShellTopic, string> = {
  "find-grep": "Find / grep / sed / awk",
  rettigheter: "chmod / chown / ACL",
  prosesser: "ps / kill / signaler",
  pakker: "apt / dpkg / dnf / rpm",
  tjenester: "systemctl / journalctl",
  "arkiv-overforing": "tar / gzip / scp / rsync",
  "script-snutt": "Bash-script-snutter",
};

export const SHELL_TOPICS: { id: ShellTopic; label: string }[] = (
  Object.keys(TOPIC_LABEL) as ShellTopic[]
).map((id) => ({ id, label: TOPIC_LABEL[id] }));

export const SHELL_SCENARIOS: ShellScenario[] = [
  // ============ FIND / GREP / AWK / SED ============
  {
    id: "sh-find-log-24h",
    topic: "find-grep",
    title: "Finn alle .log-filer endret siste 24 timer",
    prompt:
      "Du må finne alle filer som ender på .log i hele filsystemet og som er endret siste 24 timer.",
    matchers: [
      // find / -name "*.log" -mtime -1   (med eller uten quotes, +/-)
      /^find\s+\/\s+-(name|iname)\s+["']?\*\.log["']?\s+-mtime\s+-?1$/,
      /^find\s+\/\s+-mtime\s+-?1\s+-(name|iname)\s+["']?\*\.log["']?$/,
    ],
    hint: "find tar `-name` for navne-mønster og `-mtime -1` for «endret siste 24t».",
    solution: 'find / -name "*.log" -mtime -1',
    explanation:
      "-mtime -1 = endret mindre enn 1 dag siden. -1 = mindre enn N dager; +1 = mer enn N dager. Husk å quote *.log for å unngå glob-ekspansjon.",
  },
  {
    id: "sh-find-large",
    topic: "find-grep",
    title: "Finn filer over 100 MB under /var",
    prompt: "Du leter etter store filer som spiser disk under /var.",
    matchers: [
      /^find\s+\/var\s+-type\s+f\s+-size\s+\+100m$/,
      /^find\s+\/var\s+-size\s+\+100m\s+-type\s+f$/,
      /^find\s+\/var\s+-size\s+\+100m$/,
    ],
    hint: "find … `-size +100M` = større enn 100 megabyte. Filtrer på `-type f` for å unngå kataloger.",
    solution: "find /var -type f -size +100M",
    explanation:
      "Suffikser: c (byte), k, M, G. + = større enn, - = mindre enn, ingen tegn = nøyaktig.",
  },
  {
    id: "sh-find-empty",
    topic: "find-grep",
    title: "Finn tomme filer under home",
    prompt: "List alle tomme filer (0 byte) under brukerens hjemmekatalog.",
    matchers: [
      /^find\s+(\$home|~|\/home\/\S+)\s+-type\s+f\s+-empty$/,
      /^find\s+(\$home|~|\/home\/\S+)\s+-empty\s+-type\s+f$/,
    ],
    hint: "find har et `-empty`-predikat. Begrens til `-type f` for å bare få filer.",
    solution: "find ~ -type f -empty",
  },
  {
    id: "sh-grep-recursive",
    topic: "find-grep",
    title: "Søk rekursivt etter TODO i alle Python-filer",
    prompt:
      "Du vil finne alle TODO-kommentarer i alle .py-filer under nåværende katalog, med linjenummer.",
    matchers: [
      /^grep\s+-rn(\s+--include=["']?\*\.py["']?)?\s+["']?todo["']?\s+\.(\s+--include=["']?\*\.py["']?)?$/,
      /^grep\s+-rn?\s+--include=["']?\*\.py["']?\s+["']?todo["']?\s+\.$/,
    ],
    hint: "grep -r = rekursivt, -n = linjenummer, --include=*.py begrenser til Python-filer.",
    solution: 'grep -rn --include="*.py" TODO .',
  },
  {
    id: "sh-grep-ignorecase",
    topic: "find-grep",
    title: "Søk case-insensitive etter «error» i syslog",
    prompt:
      "Finn alle linjer som inneholder ordet error (uansett store/små bokstaver) i /var/log/syslog.",
    matchers: [/^grep\s+-i\s+["']?error["']?\s+\/var\/log\/syslog$/],
    hint: "Bruk grep med -i (ignore case).",
    solution: "grep -i error /var/log/syslog",
  },
  {
    id: "sh-awk-col2",
    topic: "find-grep",
    title: "Skriv ut kolonne 2 fra et space-separert format",
    prompt:
      "Du har en logg-fil der hver linje har felter separert med mellomrom. Skriv ut kolonne 2 av hver linje fra fil.txt.",
    matchers: [
      /^awk\s+["']?\{print\s*\$2\}["']?\s+fil\.txt$/,
      /^cat\s+fil\.txt\s*\|\s*awk\s+["']?\{print\s*\$2\}["']?$/,
    ],
    hint: "awk bruker $1, $2, $3 for kolonner. Standard separator er whitespace.",
    solution: "awk '{print $2}' fil.txt",
  },
  {
    id: "sh-sed-replace",
    topic: "find-grep",
    title: "Erstatt «localhost» med «127.0.0.1» i fila (in-place)",
    prompt:
      "Du må gjøre tekstutskifting i config.txt og lagre tilbake i samme fil.",
    matchers: [
      /^sed\s+-i\s+["']?s\/localhost\/127\.0\.0\.1\/g?["']?\s+config\.txt$/,
    ],
    hint: "sed -i = in-place. Formatet for substitusjon: `s/MØNSTER/ERSTATNING/g`.",
    solution: "sed -i 's/localhost/127.0.0.1/g' config.txt",
    explanation:
      "g til slutt = global (alle forekomster på linja, ikke bare den første). På macOS krever -i et argument: `-i ''`.",
  },
  {
    id: "sh-pipe-count",
    topic: "find-grep",
    title: "Tell antall brukere i /etc/passwd",
    prompt: "Hver linje i /etc/passwd representerer én bruker. Tell linjene.",
    matchers: [
      /^wc\s+-l\s+(\/etc\/passwd|<\s*\/etc\/passwd)$/,
      /^cat\s+\/etc\/passwd\s*\|\s*wc\s+-l$/,
      /^wc\s+-l\s+<\s+\/etc\/passwd$/,
    ],
    hint: "wc -l teller linjer. Du kan enten gi den filnavnet direkte eller pipe inn med cat.",
    solution: "wc -l /etc/passwd",
  },

  // ============ chmod / chown ============
  {
    id: "sh-chmod-755",
    topic: "rettigheter",
    title: "Gjør script.sh kjørbart (rwxr-xr-x)",
    prompt:
      "Du har akkurat lagret et bash-script og må gi det riktige rettigheter slik at det kan kjøres.",
    context: "-rw-r--r-- 1 alice alice 128 script.sh",
    matchers: [
      /^chmod\s+0?755\s+\.?\/?script\.sh$/,
      /^chmod\s+u\+x,?g\+x,?o\+x\s+\.?\/?script\.sh$/,
      /^chmod\s+a\+x\s+\.?\/?script\.sh$/,
      /^chmod\s+\+x\s+\.?\/?script\.sh$/,
    ],
    hint: "rwxr-xr-x = 755 oktalt. Alternativt: `+x` for å legge til execute for alle.",
    solution: "chmod 755 script.sh",
  },
  {
    id: "sh-chmod-private-key",
    topic: "rettigheter",
    title: "Sett rettigheter på en privat SSH-nøkkel",
    prompt:
      "ssh nekter å bruke private nøkler som er lesbare for andre. Sett ~/.ssh/id_rsa til kun rw for eier.",
    matchers: [
      /^chmod\s+0?600\s+~\/\.ssh\/id_rsa$/,
      /^chmod\s+u=rw,?g=,?o=\s+~\/\.ssh\/id_rsa$/,
      /^chmod\s+u\+rw,?g-rwx,?o-rwx\s+~\/\.ssh\/id_rsa$/,
    ],
    hint: "rw------- = 600. Andre kan ikke lese.",
    solution: "chmod 600 ~/.ssh/id_rsa",
  },
  {
    id: "sh-chown-recursive",
    topic: "rettigheter",
    title: "Endre eier og gruppe rekursivt på /var/app",
    prompt:
      "/var/app skal eies av brukeren alice og gruppen developers, inkludert alt under.",
    matchers: [
      /^sudo\s+chown\s+-r\s+alice:developers\s+\/var\/app$/,
      /^sudo\s+chown\s+--recursive\s+alice:developers\s+\/var\/app$/,
    ],
    hint: "chown EIER:GRUPPE FIL. -R for rekursivt. Krever sudo for /var.",
    solution: "sudo chown -R alice:developers /var/app",
  },
  {
    id: "sh-chmod-sgid-dir",
    topic: "rettigheter",
    title: "Sett SGID på en delt katalog",
    prompt:
      "/srv/teamdata skal være en delt arbeidskatalog der nye filer automatisk får gruppen til katalogen.",
    matchers: [
      /^sudo\s+chmod\s+0?2775\s+\/srv\/teamdata$/,
      /^sudo\s+chmod\s+g\+s\s+\/srv\/teamdata$/,
    ],
    hint: "SGID på katalog = nye filer arver katalogens gruppe. Oktalt: 2 foran (2775). Symbolsk: `g+s`.",
    solution: "sudo chmod 2775 /srv/teamdata",
  },
  {
    id: "sh-acl-give-bob",
    topic: "rettigheter",
    title: "Gi bob lese-tilgang til en fil via ACL",
    prompt:
      "Filen rapport.pdf er eid av alice. Du vil at bob skal kunne lese den uten å endre owner eller gruppe.",
    matchers: [/^setfacl\s+-m\s+u:bob:r--?\s+rapport\.pdf$/],
    hint: "setfacl -m = modify. Format: `u:BRUKER:rwx` eller `g:GRUPPE:rwx`.",
    solution: "setfacl -m u:bob:r rapport.pdf",
  },
  {
    id: "sh-umask-paranoid",
    topic: "rettigheter",
    title: "Sett umask slik at nye filer fødes med 600",
    prompt:
      "Du vil at alle filer du lager fra denne shellet skal være lesbare bare av deg.",
    matchers: [/^umask\s+0?077$/],
    hint: "Ny fil = 666 minus umask. For å få 600 trenger du 077.",
    solution: "umask 077",
  },

  // ============ PROSESSER ============
  {
    id: "sh-ps-grep-nginx",
    topic: "prosesser",
    title: "Finn nginx-prosesser",
    prompt: "List alle prosesser som har 'nginx' i kommandolinjen.",
    matchers: [
      /^ps\s+aux\s*\|\s*grep\s+nginx$/,
      /^ps\s+-ef\s*\|\s*grep\s+nginx$/,
      /^pgrep\s+-fl?\s+nginx$/,
    ],
    hint: "Klassikeren: `ps aux | grep navn`. Bedre: `pgrep -fl navn`.",
    solution: "ps aux | grep nginx",
  },
  {
    id: "sh-kill-sigterm",
    topic: "prosesser",
    title: "Be prosess 4321 om å avslutte pent",
    prompt:
      "Send SIGTERM til prosess med PID 4321 (slik at den kan rydde opp før den avslutter).",
    matchers: [
      /^kill\s+4321$/,
      /^kill\s+-15\s+4321$/,
      /^kill\s+-term\s+4321$/,
      /^kill\s+-sigterm\s+4321$/,
    ],
    hint: "Default signal til kill er SIGTERM (15). Du trenger ikke `-9`.",
    solution: "kill 4321",
  },
  {
    id: "sh-kill-sigkill",
    topic: "prosesser",
    title: "Drep en hengt prosess umiddelbart",
    prompt:
      "Prosess 9999 svarer ikke på SIGTERM. Send et signal som ikke kan fanges eller ignoreres.",
    matchers: [
      /^kill\s+-9\s+9999$/,
      /^kill\s+-kill\s+9999$/,
      /^kill\s+-sigkill\s+9999$/,
    ],
    hint: "SIGKILL = signal 9. Kan ikke fanges.",
    solution: "kill -9 9999",
  },
  {
    id: "sh-kill-sighup-reload",
    topic: "prosesser",
    title: "Be nginx om å re-lese sin konfigurasjon",
    prompt:
      "Send SIGHUP til hovedprosessen for nginx (PID 1234) slik at den reload-er config uten å starte på nytt.",
    matchers: [
      /^kill\s+-1\s+1234$/,
      /^kill\s+-hup\s+1234$/,
      /^kill\s+-sighup\s+1234$/,
    ],
    hint: "SIGHUP = signal 1. Brukes typisk til reload av config.",
    solution: "kill -HUP 1234",
  },
  {
    id: "sh-pkill-pattern",
    topic: "prosesser",
    title: "Drep alle python-skript som matcher mønster",
    prompt:
      "Du har flere python-prosesser kjørt med ulike args. Drep alle som har 'worker.py' i kommandolinjen.",
    matchers: [
      /^pkill\s+-f\s+worker\.py$/,
      /^pkill\s+-9?\s*-f\s+worker\.py$/,
      /^pkill\s+-f\s+["']?worker\.py["']?$/,
    ],
    hint: "pkill -f matcher hele kommandolinjen (ikke bare programnavnet).",
    solution: "pkill -f worker.py",
  },
  {
    id: "sh-top-batch",
    topic: "prosesser",
    title: "Skriv ut top-snapshot én gang (ikke interaktivt)",
    prompt:
      "Du vil ha top-output som tekst (for å pipe videre eller lagre), ikke et interaktivt skjermbilde.",
    matchers: [/^top\s+-bn1$/, /^top\s+-b\s+-n\s+1$/, /^top\s+-bn\s+1$/],
    hint: "top -b = batch mode, -n 1 = bare én oppdatering.",
    solution: "top -bn1",
  },
  {
    id: "sh-nice-launch",
    topic: "prosesser",
    title: "Start en tung jobb med lavere prioritet",
    prompt:
      "Kjør ./tung-jobb.sh i bakgrunnen med nice-verdi 10 (mindre aggressiv enn default).",
    matchers: [
      /^nice\s+-n\s+10\s+\.\/tung-jobb\.sh\s*&$/,
      /^nice\s+-10\s+\.\/tung-jobb\.sh\s*&$/,
    ],
    hint: "`nice -n N kommando` setter starts-niceness. Etterstilt & for bakgrunn.",
    solution: "nice -n 10 ./tung-jobb.sh &",
  },

  // ============ PAKKER ============
  {
    id: "sh-apt-install",
    topic: "pakker",
    title: "Installer nginx på Ubuntu",
    prompt:
      "Du har et frisk-installert Ubuntu-system. Oppdater pakkelistene og installer nginx.",
    matchers: [
      /^sudo\s+apt\s+update\s*&&\s*sudo\s+apt\s+install\s+(-y\s+)?nginx$/,
      /^sudo\s+apt\s+update\s*;\s*sudo\s+apt\s+install\s+(-y\s+)?nginx$/,
      /^sudo\s+apt-get\s+update\s*&&\s*sudo\s+apt-get\s+install\s+(-y\s+)?nginx$/,
    ],
    hint: "`apt update` for å hente nye pakkelister, deretter `apt install`. Sett dem sammen med &&.",
    solution: "sudo apt update && sudo apt install -y nginx",
  },
  {
    id: "sh-apt-search-owner",
    topic: "pakker",
    title: "Finn hvilken pakke som eier en fil",
    prompt:
      "/usr/sbin/sshd ligger på systemet. Hvilken pakke kommer den fra? (Debian/Ubuntu)",
    matchers: [
      /^dpkg\s+-s\s+\/usr\/sbin\/sshd$/,
      /^dpkg\s+-s\s+sshd$/,
      /^dpkg-query\s+-s\s+\/usr\/sbin\/sshd$/,
      /^dpkg\s+-?-search\s+\/usr\/sbin\/sshd$/,
      /^dpkg\s+--?s\s+\/usr\/sbin\/sshd$/,
    ],
    hint: "På Debian-baserte systemer: `dpkg -S FIL` viser eier-pakken.",
    solution: "dpkg -S /usr/sbin/sshd",
  },
  {
    id: "sh-apt-purge",
    topic: "pakker",
    title: "Fjern nginx HELT — inkludert config-filer",
    prompt:
      "En vanlig `apt remove` lar /etc-filene være. Du vil fjerne både binærer og config-filer.",
    matchers: [/^sudo\s+apt\s+purge\s+(-y\s+)?nginx$/],
    hint: "Bruk `apt purge` i stedet for `apt remove`.",
    solution: "sudo apt purge nginx",
  },
  {
    id: "sh-dnf-history-undo",
    topic: "pakker",
    title: "Rull tilbake en dnf-transaksjon",
    prompt:
      "Du oppgraderte noe som brakk systemet. Rull tilbake transaksjon nummer 42 i dnf-historikken.",
    matchers: [/^sudo\s+dnf\s+history\s+undo\s+42$/],
    hint: "dnf har full historikk. `dnf history undo N` reverserer.",
    solution: "sudo dnf history undo 42",
  },
  {
    id: "sh-rpm-find-owner",
    topic: "pakker",
    title: "Hvilken rpm-pakke eier /usr/bin/python3?",
    prompt: "På et Fedora/RHEL-system, hvilken pakke kommer python3-binær fra?",
    matchers: [
      /^rpm\s+-qf\s+\/usr\/bin\/python3$/,
      /^rpm\s+-?-?queryformat?\s+\/usr\/bin\/python3$/,
    ],
    hint: "rpm -qf FIL — query, find by file.",
    solution: "rpm -qf /usr/bin/python3",
  },

  // ============ TJENESTER ============
  {
    id: "sh-systemctl-enable-now",
    topic: "tjenester",
    title: "Start nginx og autostart ved boot — i én kommando",
    prompt:
      "Du har installert nginx og vil at den skal starte med en gang OG starte automatisk ved hver boot.",
    matchers: [
      /^sudo\s+systemctl\s+enable\s+--now\s+nginx$/,
      /^sudo\s+systemctl\s+enable\s+nginx\s+--now$/,
    ],
    hint: "systemctl enable --now gjør begge i ett.",
    solution: "sudo systemctl enable --now nginx",
  },
  {
    id: "sh-systemctl-status",
    topic: "tjenester",
    title: "Vis status og siste logg-linjer for en tjeneste",
    prompt: "Sjekk om sshd kjører og se de siste loggene fra den.",
    matchers: [
      /^(sudo\s+)?systemctl\s+status\s+sshd?$/,
      /^(sudo\s+)?systemctl\s+status\s+ssh$/,
    ],
    hint: "systemctl status TJENESTE inkluderer siste linjer fra journalctl.",
    solution: "systemctl status sshd",
  },
  {
    id: "sh-journalctl-follow",
    topic: "tjenester",
    title: "Følg loggen til nginx i sanntid",
    prompt: "Du restarter nginx og vil se loggen mens den starter.",
    matchers: [
      /^(sudo\s+)?journalctl\s+-u\s+nginx\s+-f$/,
      /^(sudo\s+)?journalctl\s+-fu\s+nginx$/,
      /^(sudo\s+)?journalctl\s+-f\s+-u\s+nginx$/,
    ],
    hint: "journalctl -u TJENESTE -f = follow.",
    solution: "journalctl -u nginx -f",
  },
  {
    id: "sh-journalctl-since",
    topic: "tjenester",
    title: "Vis nginx-logg fra siste time",
    prompt: "Du vil bare ha loggene fra siste time.",
    matchers: [
      /^(sudo\s+)?journalctl\s+-u\s+nginx\s+--since\s+["']?1\s*hour?\s*ago["']?$/,
      /^(sudo\s+)?journalctl\s+--since\s+["']?1\s*hour?\s*ago["']?\s+-u\s+nginx$/,
    ],
    hint: "--since godtar relative tider som '1 hour ago' eller 'today'.",
    solution: 'journalctl -u nginx --since "1 hour ago"',
  },
  {
    id: "sh-systemctl-daemon-reload",
    topic: "tjenester",
    title: "Etter å ha endret en .service-fil",
    prompt:
      "Du har redigert /etc/systemd/system/min-app.service. Hvilken kommando må du kjøre før systemctl restart trer i kraft?",
    matchers: [/^sudo\s+systemctl\s+daemon-reload$/],
    hint: "systemd cacher unit-filene. Du må be den om å lese inn på nytt.",
    solution: "sudo systemctl daemon-reload",
  },

  // ============ ARKIV / OVERFØRING ============
  {
    id: "sh-tar-create-gzip",
    topic: "arkiv-overforing",
    title: "Lag et komprimert tar-arkiv av /var/www",
    prompt: "Lag arkivet www-backup.tar.gz som inneholder hele /var/www.",
    matchers: [
      /^sudo\s+tar\s+-?cz?vf\s+www-backup\.tar\.gz\s+\/var\/www$/,
      /^sudo\s+tar\s+-czf\s+www-backup\.tar\.gz\s+\/var\/www$/,
      /^sudo\s+tar\s+czvf\s+www-backup\.tar\.gz\s+\/var\/www$/,
    ],
    hint: "tar-flagg: c=create, z=gzip, v=verbose (valgfritt), f=filnavn.",
    solution: "sudo tar -czvf www-backup.tar.gz /var/www",
  },
  {
    id: "sh-tar-extract",
    topic: "arkiv-overforing",
    title: "Pakk ut et tar.gz-arkiv",
    prompt: "Pakk ut innholdet av backup.tar.gz til nåværende katalog.",
    matchers: [
      /^tar\s+-?xz?vf\s+backup\.tar\.gz$/,
      /^tar\s+-xzf\s+backup\.tar\.gz$/,
      /^tar\s+xzvf\s+backup\.tar\.gz$/,
    ],
    hint: "x=extract, z=gzip, f=filnavn.",
    solution: "tar -xzvf backup.tar.gz",
  },
  {
    id: "sh-scp-to-server",
    topic: "arkiv-overforing",
    title: "Kopier en fil til en server",
    prompt:
      "Send filen rapport.pdf til ~/innleveringer/ på serveren server.uit.no som brukeren alice.",
    matchers: [
      /^scp\s+rapport\.pdf\s+alice@server\.uit\.no:~\/innleveringer\/?$/,
      /^scp\s+rapport\.pdf\s+alice@server\.uit\.no:innleveringer\/?$/,
    ],
    hint: "scp KILDE BRUKER@HOST:DEST",
    solution: "scp rapport.pdf alice@server.uit.no:~/innleveringer/",
  },
  {
    id: "sh-rsync-mirror",
    topic: "arkiv-overforing",
    title: "Speil en lokal katalog til en server",
    prompt:
      "Synkroniser /var/www lokalt til /var/www på server.uit.no (alice), arkiv-modus.",
    matchers: [
      /^rsync\s+-az(v)?\s+\/var\/www\/\s+alice@server\.uit\.no:\/var\/www\/?$/,
      /^rsync\s+-avz\s+\/var\/www\/?\s+alice@server\.uit\.no:\/var\/www\/?$/,
    ],
    hint: "rsync -a = arkiv (rekursiv + bevar rettigheter), -z = komprimer over nett.",
    solution: "rsync -azv /var/www/ alice@server.uit.no:/var/www/",
  },

  // ============ BASH-SCRIPT-SNUTTER ============
  {
    id: "sh-shebang",
    topic: "script-snutt",
    title: "Hvilken shebang skal et bash-skript starte med?",
    prompt:
      "Du skriver et nytt bash-skript. Hva skal være første linje for at scriptet kjøres med bash?",
    matchers: [
      /^#!\/bin\/bash$/,
      /^#!\/usr\/bin\/env\s+bash$/,
      /^#!\/bin\/sh$/,
    ],
    hint: "Shebang = #! fulgt av interpreter-sti. /usr/bin/env bash er mest portabel.",
    solution: "#!/usr/bin/env bash",
  },
  {
    id: "sh-if-file-exists",
    topic: "script-snutt",
    title: "Sjekk om en fil eksisterer i et bash-skript",
    prompt:
      "Skriv en ettlinje-if som skriver «finnes» dersom /etc/passwd eksisterer.",
    matchers: [
      /^if\s+\[\s+-f\s+\/etc\/passwd\s+\];?\s+then\s+echo\s+["']?finnes["']?;?\s+fi$/,
      /^\[\s+-f\s+\/etc\/passwd\s+\]\s+&&\s+echo\s+["']?finnes["']?$/,
      /^\[\[\s+-f\s+\/etc\/passwd\s+\]\]\s+&&\s+echo\s+["']?finnes["']?$/,
    ],
    hint: "Test om fila eksisterer med `-f`. Kortform med &&: `[ -f FIL ] && echo OK`.",
    solution: "[ -f /etc/passwd ] && echo finnes",
  },
  {
    id: "sh-for-loop-files",
    topic: "script-snutt",
    title: "Iterér over alle .log-filer og komprimer dem",
    prompt:
      "Skriv en for-løkke som går gjennom alle .log-filer i nåværende katalog og kjører gzip på hver.",
    matchers: [
      /^for\s+f(il)?\s+in\s+\*\.log;?\s*do\s+gzip\s+["']?\$f(il)?["']?;?\s*done$/,
    ],
    hint: "for VAR in *.log; do gzip \"$VAR\"; done. Quote variabelen.",
    solution: 'for f in *.log; do gzip "$f"; done',
  },
  {
    id: "sh-cmd-substitution",
    topic: "script-snutt",
    title: "Tildel antall filer i nåværende katalog til en variabel",
    prompt:
      "Bruk kommando-substitusjon for å sette variabelen antall til antall ikke-skjulte filer i katalogen.",
    matchers: [
      /^antall=\$\(ls\s+-1\s*\|\s*wc\s+-l\)$/,
      /^antall=\$\(ls\s*\|\s*wc\s+-l\)$/,
      /^antall=`ls\s+-1\s*\|\s*wc\s+-l`$/,
    ],
    hint: "Bruk $(...) for kommando-substitusjon. Husk: ingen mellomrom rundt =.",
    solution: "antall=$(ls -1 | wc -l)",
  },
  {
    id: "sh-strict-mode",
    topic: "script-snutt",
    title: "Aktiver bash strict mode",
    prompt:
      "Skriv linjen som setter -e (avslutt ved feil), -u (feil ved udefinerte variabler) og pipefail (feil i pipe propagerer).",
    matchers: [/^set\s+-euo\s+pipefail$/, /^set\s+-eu\s+-o\s+pipefail$/],
    hint: "set -euo pipefail er den anbefalte ‹bash strict mode›-linjen.",
    solution: "set -euo pipefail",
  },
];

export function normalizeShellInput(raw: string): string {
  return raw.trim().replace(/\s+/g, " ").toLowerCase();
}

export function checkShellAnswer(raw: string, scenario: ShellScenario): boolean {
  const norm = normalizeShellInput(raw);
  if (norm.length === 0) return false;
  return scenario.matchers.some((rx) => rx.test(norm));
}
