import type { LinuxTutorial } from "./types";

export const LINUX_TUTORIALS: LinuxTutorial[] = [
  /* ===================================================================
   * NAVIGASJON
   * =================================================================== */
  {
    id: "nav-basis",
    topic: "navigasjon",
    title: "Hvor er du, og hvordan kommer du dit du skal?",
    tagline: "Tre kommandoer holder deg orientert: pwd, ls, cd.",
    takeaways: [
      "`pwd` = print working directory — skriver ut hvor du er nå.",
      "`ls` lister innholdet i en mappe. Flagg: `-l` (langformat), `-a` (skjulte), `-h` (lesbare størrelser).",
      "`cd <sti>` bytter mappe. `cd` alene tar deg hjem. `cd -` tar deg tilbake til forrige.",
      "Absolutte stier starter med `/`. Relative starter uten. `~` = hjem, `.` = her, `..` = ett opp.",
    ],
    sections: [
      {
        heading: "Tenk på filsystemet som et tre",
        body:
          "Roten heter `/`. Under den ligger mapper som `/home`, `/etc`, `/usr`, `/var`. Hjemmemappen din ligger på `/home/<brukernavn>` (eller `/Users/<navn>` på macOS).\n\nNår du logger inn står du i hjemmemappen. Snarvei: `~` betyr alltid hjem.",
        example: {
          code: "pwd",
          output: "/home/isak",
        },
      },
      {
        heading: "Liste innhold",
        body:
          "`ls` viser navn. `ls -l` viser eier, rettigheter, størrelse, dato. `ls -lah` er den vanlige kombinasjonen: lang, alle (inkl. skjulte filer som starter med `.`), human-readable størrelser.",
        example: {
          code: "ls -lah",
          output:
            "drwxr-xr-x  5 isak isak  160B Mar 12 10:14 .\ndrwxr-xr-x  3 root root   96B Feb  1 09:00 ..\n-rw-r--r--  1 isak isak  2.1K Mar 12 10:14 .bashrc\ndrwxr-xr-x  4 isak isak  128B Mar 11 22:00 prosjekter",
        },
      },
      {
        heading: "Bytte mappe",
        body:
          "`cd prosjekter` går inn i `prosjekter/` (relativ sti). `cd /etc` går til absolutt sti. `cd ..` går ett nivå opp. `cd ../../var/log` kombinerer dem. `cd` uten argument går hjem.",
        example: {
          code: "cd ~/prosjekter && pwd",
          output: "/home/isak/prosjekter",
        },
      },
    ],
  },

  /* ===================================================================
   * FILOPERASJONER
   * =================================================================== */
  {
    id: "filer-grunn",
    topic: "filer",
    title: "Lage, kopiere, flytte, slette",
    tagline: "Fire kommandoer dekker 95% av filhverdagen.",
    takeaways: [
      "`mkdir` lager mapper. `-p` lager hele kjeden (`mkdir -p a/b/c`).",
      "`touch fil` lager en tom fil (eller oppdaterer tidsstempelet).",
      "`cp kilde mål` kopierer. `cp -r` for mapper. `mv` flytter eller døper om.",
      "`rm` sletter — uten papirkurv! `rm -r` for mapper. `rm -i` spør først.",
    ],
    sections: [
      {
        heading: "Lage",
        body:
          "`touch notater.md` lager en tom fil. `mkdir prosjekt` lager én mappe. `mkdir -p a/b/c` lager hele stien om noe mangler.",
        example: {
          code: "mkdir -p prosjekt/src && touch prosjekt/src/main.py prosjekt/README.md",
        },
      },
      {
        heading: "Kopiere og flytte",
        body:
          "`cp a.txt b.txt` lager en kopi. `cp -r mappe/ ny/` kopierer hele treet. `mv` brukes både til å flytte og til å døpe om — det er samme operasjon for Linux.",
        example: {
          code: "mv notater.md docs/notater.md\ncp -r prosjekt/ prosjekt-backup/",
        },
      },
      {
        heading: "Slette — forsiktig!",
        body:
          "`rm fil.txt` sletter umiddelbart, ingen papirkurv. `rm -r mappe/` sletter en mappe rekursivt. `rm -i` spør per fil. Aldri kjør `rm -rf /` eller `rm -rf $variabel` uten å sjekke at variabelen er satt.",
        example: {
          code: "rm -i tmp.log",
          runHint: "Med -i blir du bedt om å bekrefte før slettingen.",
        },
      },
    ],
  },

  /* ===================================================================
   * LESING & SØK
   * =================================================================== */
  {
    id: "les-sok-basis",
    topic: "lesing-sok",
    title: "Lese filer og finne ting",
    tagline: "cat for korte, less for lange, grep for å finne det du leter etter.",
    takeaways: [
      "`cat fil` skriver ut hele filen. `less fil` lar deg bla (q for å gå ut).",
      "`head -n 20 fil` viser de første 20 linjene. `tail -n 20` viser de siste.",
      "`tail -f log` følger filen i sanntid — perfekt for logger.",
      "`grep mønster fil` finner linjer som matcher. `-i` ignorerer store/små bokstaver, `-r` søker rekursivt, `-n` viser linjenummer.",
      "`find . -name '*.py'` finner filer etter navn rekursivt.",
    ],
    sections: [
      {
        heading: "cat, head, tail, less",
        body:
          "`cat` er for å se hele filen raskt. `less` for å bla rolig gjennom store filer. `head` og `tail` for å titte på toppen/bunnen.",
        example: {
          code: "head -n 5 /etc/passwd",
          output:
            "root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\n...",
        },
      },
      {
        heading: "grep — søk i innhold",
        body:
          "`grep 'ERROR' app.log` printer alle linjer som inneholder ERROR. `grep -r 'TODO' src/` søker rekursivt. `grep -in 'isak' /etc/passwd` ignorerer case og viser linjenummer.",
        example: {
          code: "grep -rn 'TODO' src/",
          output: "src/main.py:42: # TODO: rewrite this\nsrc/util.py:7: # TODO: handle errors",
        },
      },
      {
        heading: "find — søk etter filer",
        body:
          "`find <sti> -name '<mønster>'` finner filer. Tegnene `*` og `?` er wildcard. Bruk fnutter rundt mønsteret så ikke shellet ekspanderer det først.",
        example: {
          code: "find . -name '*.log' -type f",
        },
      },
    ],
  },

  /* ===================================================================
   * PERMISSIONS
   * =================================================================== */
  {
    id: "perm-basis",
    topic: "permissions",
    title: "Hvem får lov til hva",
    tagline: "Tre roller (u/g/o), tre rettigheter (r/w/x), to notasjoner (oktal/symbolsk).",
    takeaways: [
      "Hver fil har tre roller: owner (u), group (g), others (o).",
      "Hver rolle kan ha read (r=4), write (w=2), execute (x=1).",
      "`chmod 755 fil` = owner: rwx, group: r-x, others: r-x.",
      "`chmod u+x fil` = legg til execute for owner. `g-w` = fjern write for group.",
      "`chown bruker:gruppe fil` setter eier og gruppe.",
    ],
    sections: [
      {
        heading: "Lese ls -l",
        body:
          'Første tegn er filtype (`-` fil, `d` mappe, `l` lenke). Så ni tegn: rwx for owner, rwx for group, rwx for others. `-rwxr-xr--` betyr: owner kan alt, group kan lese+kjøre, others kan bare lese.',
        example: {
          code: "ls -l skript.sh",
          output: "-rwxr-xr-- 1 isak isak 312 Mar 12 10:14 skript.sh",
        },
      },
      {
        heading: "chmod oktal",
        body:
          "Hver gruppe (u, g, o) får ett tall: r=4, w=2, x=1. Legg sammen: rwx=7, rw-=6, r-x=5, r--=4. `chmod 644` er typisk for filer (eier kan skrive, alle kan lese). `chmod 755` for kjørbare/mapper.",
        example: {
          code: "chmod 755 skript.sh",
        },
      },
      {
        heading: "chmod symbolsk",
        body:
          "`chmod u+x` legger til x for user. `chmod go-w` fjerner w for group og others. `chmod a=r` setter alle (a = all) til kun r. Praktisk når du bare vil endre én rettighet uten å regne ut hele tallet.",
        example: {
          code: "chmod u+x deploy.sh",
        },
      },
    ],
  },

  /* ===================================================================
   * PIPES & REDIRECTS
   * =================================================================== */
  {
    id: "pipes-basis",
    topic: "pipes-redirects",
    title: "Koble kommandoer sammen",
    tagline: "| sender stdout videre. > skriver til fil. UNIX-filosofien i én leksjon.",
    takeaways: [
      "`A | B` sender output fra A som input til B.",
      "`A > fil` skriver stdout til fil (overskriv). `>>` legger til.",
      "`A < fil` leser stdin fra fil.",
      "`A 2> errlog` omdirigerer stderr (ikke stdout). `2>&1` slår sammen stderr og stdout.",
      "`A | tee fil` skriver til både stdout og fil samtidig.",
    ],
    sections: [
      {
        heading: "Pipe-konseptet",
        body:
          "I Unix er hver kommando en filter: den leser fra stdin, skriver til stdout. `|` kobler stdout fra én til stdin på neste. Slik bygger du kraftige pipelines av små verktøy.",
        example: {
          code: "ps aux | grep nginx",
          runHint: "ps lister prosesser, grep filtrerer ut linjer som inneholder 'nginx'.",
        },
      },
      {
        heading: "Redirect til fil",
        body:
          "`>` overskriver, `>>` legger til. Hvis filen ikke finnes, opprettes den.",
        example: {
          code: "ls -la > innhold.txt\necho 'ny linje' >> innhold.txt",
        },
      },
      {
        heading: "stderr og stdout",
        body:
          "Stdout er kanal 1, stderr er kanal 2. `2> fil` sender feilmeldinger til fil. `2>&1` slår dem sammen. `&>` er bash-snarvei for begge.",
        example: {
          code: "make 2> bygg-feil.log",
        },
      },
      {
        heading: "tee — splitt streamen",
        body:
          "`tee` skriver input til fil OG sender det videre. Nyttig når du vil se output samtidig som du lagrer.",
        example: {
          code: "ls -la | tee innhold.txt | wc -l",
        },
      },
    ],
  },

  /* ===================================================================
   * TEKSTPROSESSERING
   * =================================================================== */
  {
    id: "tekst-basis",
    topic: "tekst",
    title: "Sort, uniq, wc, cut, tr",
    tagline: "Fem små verktøy som tilsammen løser overraskende mye.",
    takeaways: [
      "`sort` sorterer linjer. `-n` numerisk, `-r` revers, `-k 2` etter kolonne 2.",
      "`uniq` fjerner DUPLISERTE NABO-linjer — kjør `sort` først! `uniq -c` teller forekomster.",
      "`wc -l` teller linjer, `-w` ord, `-c` tegn.",
      "`cut -d',' -f2` plukker ut kolonne 2 (komma-delt).",
      "`tr 'a-z' 'A-Z'` oversetter tegn (her: små → store bokstaver).",
    ],
    sections: [
      {
        heading: "Topp 10 mest brukte ord",
        body:
          "Klassisk pipeline: konverter til små bokstaver, splitt på mellomrom, sorter, tell unike, sorter etter telling.",
        example: {
          code:
            "cat tekst.txt | tr 'A-Z' 'a-z' | tr -s ' ' '\\n' | sort | uniq -c | sort -rn | head -10",
        },
      },
      {
        heading: "cut — plukk kolonne",
        body:
          "`cut -d <skille> -f <nr>` plukker felt. `cut -c 1-10` plukker tegn 1-10.",
        example: {
          code: "cut -d: -f1 /etc/passwd",
          output: "root\ndaemon\nbin\nsys\nisak",
        },
      },
      {
        heading: "sort + uniq for telling",
        body:
          "Husk: `uniq` ser bare på NABO-linjer. Sortér først. `uniq -c` setter telling foran. Tipiskt: `... | sort | uniq -c | sort -rn` = topp X.",
      },
    ],
  },

  /* ===================================================================
   * PROSESSER
   * =================================================================== */
  {
    id: "prosesser-basis",
    topic: "prosesser",
    title: "Se, styre og drepe prosesser",
    tagline: "ps og top viser, kill stopper, & og nohup kjører i bakgrunnen.",
    takeaways: [
      "`ps aux` lister alle prosesser med eier, PID, CPU, minne.",
      "`top` eller `htop` viser sanntid (q for å gå ut).",
      "`kill <PID>` sender SIGTERM (snill stopp). `kill -9 <PID>` sender SIGKILL (tving).",
      "`cmd &` kjører i bakgrunnen. `jobs` lister jobber. `fg %1` henter forrige tilbake.",
      "`nohup cmd &` kjører selv om du logger ut. Output havner i `nohup.out`.",
    ],
    sections: [
      {
        heading: "Finn en prosess",
        body:
          "`ps aux | grep nginx` lister alle nginx-prosesser. Andre kolonne er PID — det du trenger for å drepe den.",
        example: {
          code: "ps aux | grep python",
          output: "isak 12345  0.0  0.5 ... python app.py",
        },
      },
      {
        heading: "Signaler",
        body:
          "`kill <PID>` = SIGTERM = 'vennligst stopp'. Programmet kan rydde opp. `kill -9 <PID>` = SIGKILL = 'dø nå'. Kjernen dreper prosessen umiddelbart — ingen opprydding.\n\nProver vanligvis SIGTERM først, så SIGKILL hvis den henger.",
      },
      {
        heading: "Bakgrunns-jobber",
        body:
          "`./langtjobb.sh &` starter i bakgrunnen og gir deg PID. `jobs` lister dine bakgrunnsjobber. `fg %1` henter første tilbake til forgrunnen. Ctrl+Z pauser nåværende jobb, `bg` setter den i gang igjen i bakgrunnen.",
      },
    ],
  },

  /* ===================================================================
   * PAKKER & SYSTEMD
   * =================================================================== */
  {
    id: "pakker-systemd-basis",
    topic: "pakker-systemd",
    title: "apt, systemctl, journalctl",
    tagline: "Installer programvare. Start/stopp tjenester. Les logger.",
    takeaways: [
      "`sudo apt update` oppdaterer pakkeindeksen. `apt upgrade` oppdaterer pakker.",
      "`sudo apt install <pakke>` installerer. `apt remove` avinstallerer. `apt search <søk>`.",
      "`systemctl status <tjeneste>` viser om den kjører. `start`/`stop`/`restart` styrer den.",
      "`systemctl enable <tjeneste>` får den til å starte ved boot.",
      "`journalctl -u <tjeneste> -f` følger logg i sanntid.",
    ],
    sections: [
      {
        heading: "apt — pakke-CRUD",
        body:
          "På Debian/Ubuntu bruker du `apt`. Bak kulissene jobber `dpkg` med selve pakkene, men `apt` håndterer avhengigheter og indeks. Kjør alltid `apt update` før `install`.",
        example: {
          code: "sudo apt update && sudo apt install nginx",
        },
      },
      {
        heading: "systemctl — styre tjenester",
        body:
          "En tjeneste (unit) i systemd er en bakgrunnsprosess som starter ved boot. `systemctl status nginx` viser om den kjører + siste logglinjer. `enable` aktiverer ved boot, `disable` deaktiverer.",
        example: {
          code: "sudo systemctl restart nginx\nsystemctl status nginx",
        },
      },
      {
        heading: "journalctl — sentrale logger",
        body:
          "Systemd har én sentral logg. `journalctl -u nginx` filtrer på unit. `-f` følger sanntid (Ctrl+C for å gå ut). `--since '10 min ago'` filtrer på tid.",
        example: {
          code: "journalctl -u nginx --since '1 hour ago'",
        },
      },
    ],
  },

  /* ===================================================================
   * NETTVERK & SSH
   * =================================================================== */
  {
    id: "nett-basis",
    topic: "nett-ssh",
    title: "SSH, scp, rsync, curl",
    tagline: "Koble til andre maskiner. Send filer. Hent HTTP.",
    takeaways: [
      "`ssh bruker@host` logger inn over SSH. `-p 2222` for annen port, `-i nøkkel.pem` for spesifikk nøkkel.",
      "`ssh-keygen -t ed25519` genererer nøkkel. `ssh-copy-id bruker@host` legger den på serveren.",
      "`scp lokal.txt bruker@host:~/` kopierer til server. `scp -r` for mappe.",
      "`rsync -avz src/ bruker@host:dst/` synker mapper effektivt (bare diff sendes).",
      "`curl -I https://...` henter bare headers. `-X POST -d 'data'` poster. `-o fil` lagrer.",
    ],
    sections: [
      {
        heading: "SSH — sikre login",
        body:
          "SSH er den standard måten å logge inn på Linux-maskiner over nettverk. Bruk nøkler, ikke passord. Generér med `ssh-keygen`, legg den offentlige delen i `~/.ssh/authorized_keys` på serveren.",
        example: {
          code: "ssh -i ~/.ssh/id_ed25519 isak@server.example.no",
        },
      },
      {
        heading: "scp vs rsync",
        body:
          "`scp` er enkelt: kopier filer over SSH. `rsync` er smartere: synker bare det som er endret, kan resume, kan ekskludere mønstre. Bruk `rsync -avz` som default. `-n` for dry-run så du ser hva som ville skjedd.",
        example: {
          code: "rsync -avzn ./build/ isak@server:/var/www/  # -n = dry-run",
        },
      },
      {
        heading: "curl — sjekk en endpoint",
        body:
          "`curl https://api.no/status` henter URL. `-I` viser kun headers. `-v` viser hele forhandlingen (debug). `-X POST -H 'Content-Type: application/json' -d '{\"x\":1}' URL` for å poste JSON.",
      },
    ],
  },

  /* ===================================================================
   * SCRIPTING
   * =================================================================== */
  {
    id: "scripting-basis",
    topic: "scripting",
    title: "Variabler, if, for, exit-koder",
    tagline: "Når én linje ikke holder, skriv et bash-script.",
    takeaways: [
      "`#!/usr/bin/env bash` på første linje. `chmod +x script.sh` for å gjøre det kjørbart.",
      "`NAVN=verdi` (ingen mellomrom!). Bruk `$NAVN` eller `${NAVN}`.",
      "`if [ \"$x\" = \"ja\" ]; then ...; fi` — mellomrom rundt `[` og `]` er obligatorisk.",
      "`for f in *.txt; do echo \"$f\"; done` — loop over filer.",
      "`$?` er exit-kode fra forrige kommando (0 = OK). `set -e` stopper script ved feil.",
    ],
    sections: [
      {
        heading: "Shebang og kjørbar",
        body:
          'Første linje sier hvilken tolker som skal kjøre filen. `#!/usr/bin/env bash` finner bash i PATH. Sett kjørbar med `chmod +x deploy.sh`, kjør med `./deploy.sh`.',
        example: {
          code: "#!/usr/bin/env bash\necho \"Hei fra script!\"",
        },
      },
      {
        heading: "Variabler og strenger",
        body:
          'Ingen mellomrom rundt `=`. Sett: `NAVN=Isak`. Bruk: `$NAVN` eller `${NAVN}`. Sett alltid `\"$VAR\"` i fnutter når du bruker den — ellers brekker ting om verdien har mellomrom.',
        example: {
          code: 'navn="Per Olsen"\necho "Hei, $navn"',
        },
      },
      {
        heading: "if og test",
        body:
          '`[ ... ]` er kortform for `test`. `[ "$x" = "ja" ]` (streng-likhet), `[ "$x" -eq 1 ]` (numerisk), `[ -f fil ]` (fil eksisterer), `[ -d mappe ]` (mappe eksisterer). Mellomrom rundt klammene er obligatorisk.',
        example: {
          code:
            'if [ -f /etc/passwd ]; then\n  echo "passwd finnes"\nelse\n  echo "mangler"\nfi',
        },
      },
      {
        heading: "for-loop",
        body:
          "`for f in *.log; do ...; done` itererer over filer. `for i in {1..5}; do echo $i; done` itererer over tall.",
        example: {
          code: 'for f in *.txt; do\n  echo "Behandler $f"\ndone',
        },
      },
      {
        heading: "Exit-koder og set -e",
        body:
          "Hver kommando har en exit-kode i `$?`. 0 = suksess, alt annet = feil. `set -e` øverst i et script får det til å stoppe ved første feil — bruk det! `set -u` feiler på ubrukte variabler. Kombinasjonen `set -euo pipefail` er bash-standarden for trygge scripts.",
        example: {
          code:
            '#!/usr/bin/env bash\nset -euo pipefail\n\necho "alt blir avbrutt om noe under feiler"',
        },
      },
    ],
  },
];
