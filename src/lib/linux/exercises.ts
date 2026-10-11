import type { LinuxExercise } from "./types";

export const LINUX_EXERCISES: LinuxExercise[] = [
  /* ===================================================================
   * NAVIGASJON  (level 1-2)
   * =================================================================== */
  {
    id: "nav-pwd",
    topic: "navigasjon",
    level: 1,
    title: "Hvor er jeg?",
    prompt: "Skriv kommandoen som printer ut hvilken mappe du står i nå.",
    starter: "",
    hint: "Det er en treboksstavet kommando — *print working directory*.",
    solution: "pwd",
    explanation:
      "`pwd` (print working directory) viser absolutt sti til mappen du står i. Den tar ingen argumenter.",
    checks: [{ kind: "regex", pattern: "^\\s*pwd\\s*$", explain: "Bare kommandoen `pwd`, ingen argumenter." }],
  },
  {
    id: "nav-ls-lah",
    topic: "navigasjon",
    level: 1,
    title: "Vis alt, langformat, lesbare størrelser",
    prompt: "List innholdet i `~/prosjekter` i langformat, inkluder skjulte filer, og vis størrelser på lesbar form.",
    context: "Skjulte filer starter med `.` (f.eks. `.gitignore`).",
    starter: "ls ",
    hint: "Tre flagg kombineres ofte: -l (lang), -a (alle), -h (human-readable).",
    solution: "ls -lah ~/prosjekter",
    explanation:
      "`-l` gir én linje per fil med rettigheter/eier/størrelse. `-a` tar med skjulte. `-h` viser 2.1K i stedet for 2147. Du kan kombinere som `-lah` eller `-la -h`.",
    checks: [
      { kind: "contains", needle: "ls", explain: "Kommandoen heter `ls`." },
      { kind: "regex", pattern: "-[lah]*l[lah]*", explain: "Må inkludere -l (langformat)." },
      { kind: "regex", pattern: "-[lah]*a[lah]*", explain: "Må inkludere -a (alle filer)." },
      { kind: "regex", pattern: "-[lah]*h[lah]*", explain: "Må inkludere -h (human-readable)." },
      { kind: "one-of", needles: ["~/prosjekter", "$HOME/prosjekter", "/home/"], explain: "Må peke på `~/prosjekter`." },
    ],
  },
  {
    id: "nav-cd-rel",
    topic: "navigasjon",
    level: 1,
    title: "Opp ett nivå, så inn i src",
    prompt: "Du står i `~/prosjekt/docs`. Skriv én linje som bytter til `~/prosjekt/src` ved hjelp av relativ sti.",
    starter: "",
    hint: "`..` betyr ett opp. Du må først opp, så inn i `src`.",
    solution: "cd ../src",
    explanation:
      "Relativ sti: `..` går opp fra `docs`, så `src` ned igjen. Du kunne også brukt absolutt sti `cd ~/prosjekt/src`, men oppgaven krever relativ.",
    checks: [
      { kind: "regex", pattern: "^\\s*cd\\s+\\.\\./src\\s*$", explain: "Forventer `cd ../src` (relativ sti)." },
    ],
  },
  {
    id: "nav-cd-dash",
    topic: "navigasjon",
    level: 2,
    title: "Hopp tilbake til forrige mappe",
    prompt: "Du var nettopp i `/var/log` og kjørte `cd /etc`. Skriv kommandoen som tar deg tilbake til `/var/log` uten å skrive stien.",
    starter: "",
    hint: "`cd -` hopper tilbake til den forrige mappen.",
    solution: "cd -",
    explanation:
      "`cd -` bruker skall-variabelen `$OLDPWD` til å hoppe til forrige mappe. Praktisk når du veksler mellom to plasser.",
    checks: [{ kind: "regex", pattern: "^\\s*cd\\s+-\\s*$", explain: "Forventer `cd -`." }],
  },
  {
    id: "nav-tree-2",
    topic: "navigasjon",
    level: 2,
    title: "ls-tre to nivåer dypt",
    prompt: "Bruk `find` til å liste alle elementer (filer og mapper) i nåværende mappe og ett nivå ned — maks dybde 2.",
    starter: "find ",
    hint: "`find` har et flagg `-maxdepth N`.",
    solution: "find . -maxdepth 2",
    explanation:
      "`-maxdepth 2` betyr: bare den nåværende mappen og ett nivå under. Uten det ville `find` gå rekursivt helt ned.",
    checks: [
      { kind: "contains", needle: "find", explain: "Bruk `find`." },
      { kind: "contains", needle: "-maxdepth", explain: "Bruk -maxdepth-flagget." },
      { kind: "regex", pattern: "-maxdepth\\s+2", explain: "Sett maxdepth til 2." },
    ],
  },

  /* ===================================================================
   * FILOPERASJONER  (level 1-3)
   * =================================================================== */
  {
    id: "fil-mkdir-p",
    topic: "filer",
    level: 1,
    title: "Lag hele kjeden",
    prompt: "Lag mappestien `prosjekt/src/util` i ett kall, selv om `prosjekt/src` ikke finnes fra før.",
    starter: "mkdir ",
    hint: "`mkdir -p` lager mellomliggende mapper automatisk.",
    solution: "mkdir -p prosjekt/src/util",
    explanation:
      "Uten `-p` feiler `mkdir` om `prosjekt/` ikke finnes. Med `-p` lages hele stien — og det er heller ingen feil om mappen allerede eksisterer.",
    checks: [
      { kind: "contains", needle: "mkdir", explain: "Bruk `mkdir`." },
      { kind: "contains", needle: "-p", explain: "Bruk -p for å lage hele stien." },
      { kind: "contains", needle: "prosjekt/src/util", explain: "Stien må være `prosjekt/src/util`." },
    ],
  },
  {
    id: "fil-touch-flere",
    topic: "filer",
    level: 1,
    title: "Lag flere tomme filer på én linje",
    prompt: "Lag tre tomme filer på én linje: `a.txt`, `b.txt`, `c.txt`.",
    starter: "",
    hint: "`touch` tar flere navn som argumenter.",
    solution: "touch a.txt b.txt c.txt",
    explanation: "`touch` lager tomme filer (eller oppdaterer mtime om de finnes). Argumentene listes med mellomrom.",
    checks: [
      { kind: "contains", needle: "touch", explain: "Bruk `touch`." },
      { kind: "all-of", needles: ["a.txt", "b.txt", "c.txt"], explain: "Alle tre filer må med." },
    ],
  },
  {
    id: "fil-cp-r",
    topic: "filer",
    level: 1,
    title: "Kopier en mappe rekursivt",
    prompt: "Kopier mappen `prosjekt/` til `prosjekt-backup/` med alt innholdet.",
    starter: "cp ",
    hint: "Du trenger -r (rekursiv) for å kopiere en mappe.",
    solution: "cp -r prosjekt/ prosjekt-backup/",
    explanation:
      "Uten `-r` (eller `-R`) får du `cp: -r not specified; omitting directory ...`. Mappekopier krever rekursivt flagg.",
    checks: [
      { kind: "contains", needle: "cp", explain: "Bruk `cp`." },
      { kind: "one-of", needles: ["-r", "-R", "-a"], explain: "Bruk -r (eller -R/-a) for rekursiv kopi." },
      { kind: "contains", needle: "prosjekt", explain: "Kilde må være prosjekt." },
      { kind: "contains", needle: "prosjekt-backup", explain: "Mål må være prosjekt-backup." },
    ],
  },
  {
    id: "fil-mv-rename",
    topic: "filer",
    level: 1,
    title: "Døp om en fil",
    prompt: "Døp om filen `notater.md` til `README.md` (i samme mappe).",
    starter: "",
    hint: "På Linux brukes `mv` både til flytting og omdøping.",
    solution: "mv notater.md README.md",
    explanation: "`mv` er én operasjon: endre navnet på en fil — uavhengig av om det er ny mappe eller bare nytt navn.",
    checks: [
      { kind: "contains", needle: "mv", explain: "Bruk `mv`." },
      { kind: "contains", needle: "notater.md", explain: "Kilde." },
      { kind: "contains", needle: "README.md", explain: "Mål." },
    ],
  },
  {
    id: "fil-rm-r",
    topic: "filer",
    level: 2,
    title: "Slett en mappe trygt",
    prompt: "Slett mappen `tmp/` med alt innhold, men la `rm` spørre deg per fil før den sletter.",
    context: "Du vil være sikker på at du ikke sletter feil — interaktivt modus.",
    starter: "rm ",
    hint: "Kombiner -r (rekursiv) og -i (interaktiv).",
    solution: "rm -ri tmp/",
    explanation:
      "`-r` for å gå inn i mappen, `-i` for å spørre per fil. Mange foretrekker `rm -rI` (stor I) som bare spør én gang for hele operasjonen.",
    checks: [
      { kind: "contains", needle: "rm", explain: "Bruk `rm`." },
      { kind: "regex", pattern: "-[rRiI]*r[rRiI]*", explain: "Bruk -r (rekursiv)." },
      { kind: "regex", pattern: "-[rRiI]*i[rRiI]*|-[rRiI]*I[rRiI]*", explain: "Bruk -i (eller -I) for interaktiv." },
      { kind: "contains", needle: "tmp", explain: "Sletter `tmp/`." },
    ],
  },
  {
    id: "fil-ln-sym",
    topic: "filer",
    level: 2,
    title: "Symbolsk lenke",
    prompt: "Lag en symbolsk lenke `kjør` som peker på `/usr/local/bin/myapp`.",
    starter: "ln ",
    hint: "`ln -s mål lenke`. Symbolsk = `-s`.",
    solution: "ln -s /usr/local/bin/myapp kjør",
    explanation:
      "Rekkefølgen er `ln -s <mål> <lenkenavn>` — den samme som `cp <kilde> <mål>`. Uten `-s` lages en hard link, som er noe annet.",
    checks: [
      { kind: "contains", needle: "ln", explain: "Bruk `ln`." },
      { kind: "contains", needle: "-s", explain: "Bruk -s for symbolsk lenke." },
      { kind: "contains", needle: "/usr/local/bin/myapp", explain: "Mål må være /usr/local/bin/myapp." },
      { kind: "contains", needle: "kjør", explain: "Lenken skal hete `kjør`." },
    ],
  },

  /* ===================================================================
   * LESING & SØK  (level 1-3)
   * =================================================================== */
  {
    id: "les-head-20",
    topic: "lesing-sok",
    level: 1,
    title: "Første 20 linjer",
    prompt: "Vis de første 20 linjene av `/var/log/syslog`.",
    starter: "head ",
    hint: "`head -n N <fil>`.",
    solution: "head -n 20 /var/log/syslog",
    explanation: "`head -n 20` (eller `head -20`) skriver ut de første 20 linjene.",
    checks: [
      { kind: "contains", needle: "head", explain: "Bruk `head`." },
      { kind: "regex", pattern: "(-n\\s*20|-20)", explain: "Antall linjer = 20 (skriv -n 20 eller -20)." },
      { kind: "contains", needle: "/var/log/syslog", explain: "Filen er /var/log/syslog." },
    ],
  },
  {
    id: "les-tail-f",
    topic: "lesing-sok",
    level: 1,
    title: "Følg loggen i sanntid",
    prompt: "Følg `app.log` i sanntid — slik at nye linjer vises etter hvert som de skrives.",
    starter: "tail ",
    hint: "`-f` (follow).",
    solution: "tail -f app.log",
    explanation:
      "`tail -f` (follow) holder filen åpen og skriver ut nye linjer etter hvert. Ctrl+C for å gå ut. Bruk `-F` om filen kan bli rotert.",
    checks: [
      { kind: "contains", needle: "tail", explain: "Bruk `tail`." },
      { kind: "one-of", needles: ["-f", "-F"], explain: "Bruk -f (eller -F)." },
      { kind: "contains", needle: "app.log", explain: "Filen er app.log." },
    ],
  },
  {
    id: "les-grep-i-n",
    topic: "lesing-sok",
    level: 2,
    title: "Søk uavhengig av store/små bokstaver",
    prompt: "Finn alle linjer i `app.log` som inneholder ordet `error` (uavhengig av store/små bokstaver), og vis linjenummer.",
    starter: "grep ",
    hint: "-i = ignore case, -n = linjenummer.",
    solution: "grep -in error app.log",
    explanation:
      "`-i` gjør søket case-insensitive (matcher Error, ERROR, error). `-n` setter linjenummer foran hvert treff.",
    checks: [
      { kind: "contains", needle: "grep", explain: "Bruk `grep`." },
      { kind: "regex", pattern: "-[a-zA-Z]*i", explain: "Bruk -i." },
      { kind: "regex", pattern: "-[a-zA-Z]*n", explain: "Bruk -n." },
      { kind: "regex", pattern: "\\berror\\b", explain: "Søk etter 'error'." },
      { kind: "contains", needle: "app.log", explain: "I filen app.log." },
    ],
  },
  {
    id: "les-grep-r",
    topic: "lesing-sok",
    level: 2,
    title: "Rekursivt søk etter TODO",
    prompt: "Finn alle linjer i alle filer under `src/` som inneholder strengen `TODO`. Vis linjenummer.",
    starter: "grep ",
    hint: "-r = rekursivt, -n = linjenummer.",
    solution: "grep -rn TODO src/",
    explanation:
      "`-r` søker rekursivt i en mappe. Mange bruker `grep -rn` som default. `--include='*.py'` om du vil begrense filtype.",
    checks: [
      { kind: "contains", needle: "grep", explain: "Bruk `grep`." },
      { kind: "regex", pattern: "-[a-zA-Z]*r|-R", explain: "Bruk -r (eller -R)." },
      { kind: "regex", pattern: "-[a-zA-Z]*n", explain: "Bruk -n." },
      { kind: "contains", needle: "TODO", explain: "Søk etter TODO." },
      { kind: "contains", needle: "src", explain: "I mappen src." },
    ],
  },
  {
    id: "les-find-name",
    topic: "lesing-sok",
    level: 2,
    title: "Finn alle Python-filer",
    prompt: "Finn alle filer (ikke mapper) som slutter på `.py` under nåværende mappe.",
    starter: "find ",
    hint: "`-name '*.py' -type f`. Pakk mønsteret i fnutter så shellet ikke ekspanderer det.",
    solution: "find . -type f -name '*.py'",
    explanation:
      "`-name '*.py'` matcher filnavnet med wildcard. Fnuttene er viktige — uten dem ekspanderer shellet `*.py` *før* `find` ser det. `-type f` begrenser til vanlige filer.",
    checks: [
      { kind: "contains", needle: "find", explain: "Bruk `find`." },
      { kind: "contains", needle: "-name", explain: "Bruk -name." },
      { kind: "one-of", needles: ["'*.py'", '"*.py"', "*.py"], explain: "Mønster *.py." },
      { kind: "regex", pattern: "-type\\s+f", explain: "Bruk -type f for vanlige filer." },
    ],
  },
  {
    id: "les-find-exec",
    topic: "lesing-sok",
    level: 3,
    title: "Finn og slett gamle loggfiler",
    prompt: "Finn alle `.log`-filer under `/var/log/myapp/` som er eldre enn 7 dager, og slett dem.",
    context: "`-mtime +7` = endret for mer enn 7 dager siden. `-delete` sletter treffene.",
    starter: "find ",
    hint: "Du kan bruke `-delete` direkte, eller `-exec rm {} \\;`.",
    solution: "find /var/log/myapp/ -name '*.log' -mtime +7 -delete",
    explanation:
      "`-mtime +7` plukker filer eldre enn 7 dager. `-delete` er enklere enn `-exec rm {} \\;` og raskere. Test alltid uten -delete først.",
    checks: [
      { kind: "contains", needle: "find", explain: "Bruk `find`." },
      { kind: "contains", needle: "/var/log/myapp", explain: "I /var/log/myapp." },
      { kind: "one-of", needles: ["'*.log'", '"*.log"', "*.log"], explain: "Mønster *.log." },
      { kind: "regex", pattern: "-mtime\\s+\\+7", explain: "-mtime +7 for eldre enn 7 dager." },
      { kind: "one-of", needles: ["-delete", "-exec rm"], explain: "Slett med -delete eller -exec rm." },
    ],
  },

  /* ===================================================================
   * PERMISSIONS  (level 1-3)
   * =================================================================== */
  {
    id: "perm-755",
    topic: "permissions",
    level: 1,
    title: "Gjør et script kjørbart for alle",
    prompt: "Sett rettighetene på `deploy.sh` til 755 (eier: rwx, gruppe/andre: r-x).",
    starter: "chmod ",
    hint: "Oktal: 7=rwx, 5=r-x.",
    solution: "chmod 755 deploy.sh",
    explanation: "755 = 4+2+1 / 4+0+1 / 4+0+1 = rwxr-xr-x. Vanlig for kjørbare scripts og mapper.",
    checks: [
      { kind: "contains", needle: "chmod", explain: "Bruk `chmod`." },
      { kind: "regex", pattern: "\\b0?755\\b", explain: "Modusen er 755." },
      { kind: "contains", needle: "deploy.sh", explain: "Filen er deploy.sh." },
    ],
  },
  {
    id: "perm-symb-x",
    topic: "permissions",
    level: 1,
    title: "Bare legg til execute for eier",
    prompt: "Legg til execute-rettighet kun for eieren av `script.sh` — uten å endre group eller other.",
    starter: "chmod ",
    hint: "Symbolsk: `u+x`.",
    solution: "chmod u+x script.sh",
    explanation:
      "`u` = user (eier), `+x` = legg til execute. Symbolsk endrer kun det du sier — oktal overskriver alle rettigheter samtidig.",
    checks: [
      { kind: "contains", needle: "chmod", explain: "Bruk `chmod`." },
      { kind: "regex", pattern: "u\\+x|\\+x", explain: "Bruk u+x (eller +x)." },
      { kind: "contains", needle: "script.sh", explain: "Filen er script.sh." },
      { kind: "not-contains", needle: "755", explain: "Ikke bruk oktal — oppgaven krever symbolsk." },
    ],
  },
  {
    id: "perm-644",
    topic: "permissions",
    level: 2,
    title: "Sikre en privat fil",
    prompt: "Sett `notater.md` til 600 (kun eier kan lese og skrive).",
    starter: "chmod ",
    hint: "6 = rw-, 0 = ingenting.",
    solution: "chmod 600 notater.md",
    explanation:
      "600 = rw------. Standard for private filer som `~/.ssh/id_rsa`. Hvis andre kan lese den, nekter SSH å bruke den.",
    checks: [
      { kind: "contains", needle: "chmod", explain: "Bruk `chmod`." },
      { kind: "regex", pattern: "\\b0?600\\b", explain: "Modus 600." },
      { kind: "contains", needle: "notater.md", explain: "Filen." },
    ],
  },
  {
    id: "perm-chown",
    topic: "permissions",
    level: 2,
    title: "Bytt eier og gruppe",
    prompt: "Sett eier til `www-data` og gruppe til `www-data` på hele mappen `/var/www/myapp/` rekursivt.",
    starter: "sudo chown ",
    hint: "`chown -R bruker:gruppe sti`.",
    solution: "sudo chown -R www-data:www-data /var/www/myapp/",
    explanation:
      "`chown bruker:gruppe sti` setter begge på én gang. `-R` for rekursivt. Krever som regel sudo.",
    checks: [
      { kind: "contains", needle: "chown", explain: "Bruk `chown`." },
      { kind: "contains", needle: "-R", explain: "Bruk -R for rekursivt." },
      { kind: "contains", needle: "www-data:www-data", explain: "Eier:gruppe." },
      { kind: "contains", needle: "/var/www/myapp", explain: "Stien." },
    ],
  },
  {
    id: "perm-recurse-dirs",
    topic: "permissions",
    level: 3,
    title: "Forskjellige modus for filer og mapper",
    prompt:
      "Sett alle MAPPER under `web/` til 755 og alle FILER til 644 — i to find-kommandoer (én for filer, én for mapper).",
    context:
      "Vanlig mønster ved deploy: mapper må være kjørbare (x for å gå inn), filer skal ikke være kjørbare.",
    starter: "find web/ ",
    hint: "`find ... -type d -exec chmod 755 {} \\;` og tilsvarende for -type f og 644.",
    solution:
      "find web/ -type d -exec chmod 755 {} \\;\nfind web/ -type f -exec chmod 644 {} \\;",
    explanation:
      "`find -type d` matcher kun mapper, `-type f` kun filer. `-exec ... {} \\;` kjører kommandoen for hvert treff der `{}` blir filnavnet. `\\;` (eller `';'`) avslutter exec-uttrykket.",
    checks: [
      { kind: "all-of", needles: ["-type d", "-type f"], explain: "Bruk både -type d og -type f." },
      { kind: "contains", needle: "755", explain: "Mapper får 755." },
      { kind: "contains", needle: "644", explain: "Filer får 644." },
      { kind: "contains", needle: "-exec", explain: "Bruk -exec for å kjøre chmod per treff." },
      { kind: "contains", needle: "chmod", explain: "Kjør chmod." },
    ],
  },

  /* ===================================================================
   * PIPES & REDIRECTS  (level 1-3)
   * =================================================================== */
  {
    id: "pipe-ls-wc",
    topic: "pipes-redirects",
    level: 1,
    title: "Tell antall filer",
    prompt: "Tell hvor mange linjer `ls` gir for nåværende mappe — bruk en pipe.",
    starter: "ls ",
    hint: "`ls | wc -l`.",
    solution: "ls | wc -l",
    explanation:
      "`ls` printer én fil per linje når den ikke peker på terminal (ved pipe). `wc -l` teller linjer. Resultat = antall filer.",
    checks: [
      { kind: "contains", needle: "ls", explain: "Bruk `ls`." },
      { kind: "contains", needle: "|", explain: "Bruk pipe `|`." },
      { kind: "contains", needle: "wc", explain: "Bruk `wc`." },
      { kind: "contains", needle: "-l", explain: "Tell linjer (-l)." },
    ],
  },
  {
    id: "pipe-redirect",
    topic: "pipes-redirects",
    level: 1,
    title: "Skriv ls til fil",
    prompt: "Skriv output fra `ls -la` til filen `innhold.txt` (overskriv om den finnes).",
    starter: "",
    hint: "`>` overskriver, `>>` legger til.",
    solution: "ls -la > innhold.txt",
    explanation: "`>` redirecter stdout. `>>` legger til på slutten. Filen lages om den ikke finnes.",
    checks: [
      { kind: "contains", needle: "ls", explain: "Bruk `ls`." },
      { kind: "regex", pattern: "[^>]>[^>]", explain: "Bruk `>` (én pil = overskriv)." },
      { kind: "contains", needle: "innhold.txt", explain: "Til filen innhold.txt." },
    ],
  },
  {
    id: "pipe-append",
    topic: "pipes-redirects",
    level: 1,
    title: "Legg til en linje uten å overskrive",
    prompt: "Legg til strengen `ny linje` til slutten av `log.txt` uten å overskrive innholdet.",
    starter: "echo ",
    hint: "`>>` legger til.",
    solution: "echo 'ny linje' >> log.txt",
    explanation: "`>>` appender. `>` ville ha overskrevet hele filen.",
    checks: [
      { kind: "contains", needle: "echo", explain: "Bruk `echo`." },
      { kind: "contains", needle: ">>", explain: "Bruk `>>` for å appende." },
      { kind: "contains", needle: "log.txt", explain: "Til log.txt." },
      { kind: "contains", needle: "ny linje", explain: "Strengen som skrives." },
    ],
  },
  {
    id: "pipe-stderr",
    topic: "pipes-redirects",
    level: 2,
    title: "Send feilmeldinger til fil",
    prompt: "Kjør `make` og send kun feilmeldingene (stderr) til `bygg-feil.log`. Stdout skal fortsatt vises i terminalen.",
    starter: "make ",
    hint: "`2>` redirecter stderr (kanal 2).",
    solution: "make 2> bygg-feil.log",
    explanation:
      "I Unix: kanal 1 = stdout, kanal 2 = stderr. `2> fil` sender stderr til fil. Stdout går uberørt videre til terminalen.",
    checks: [
      { kind: "contains", needle: "make", explain: "Kjør `make`." },
      { kind: "contains", needle: "2>", explain: "Bruk `2>` for stderr." },
      { kind: "contains", needle: "bygg-feil.log", explain: "Til bygg-feil.log." },
    ],
  },
  {
    id: "pipe-tee",
    topic: "pipes-redirects",
    level: 2,
    title: "Se output og lagre samtidig",
    prompt: "Kjør `dmesg`, vis det i terminalen, og lagre en kopi i `kernel.log` — alt på én linje.",
    starter: "dmesg ",
    hint: "`tee` splitter streamen.",
    solution: "dmesg | tee kernel.log",
    explanation:
      "`tee` skriver til både stdout (slik at du ser det) og til filen. Tenk på det som en T-kobling i et vannrør.",
    checks: [
      { kind: "contains", needle: "dmesg", explain: "Kjør `dmesg`." },
      { kind: "contains", needle: "|", explain: "Pipe." },
      { kind: "contains", needle: "tee", explain: "Bruk `tee`." },
      { kind: "contains", needle: "kernel.log", explain: "Til kernel.log." },
    ],
  },
  {
    id: "pipe-2-and-1",
    topic: "pipes-redirects",
    level: 3,
    title: "Slå sammen stderr og stdout, så pipe",
    prompt: "Kjør `npm run build` og send BÅDE stdout og stderr gjennom `grep -i error`.",
    context: "Bare `|` piper stdout. For å fange opp stderr også må du slå dem sammen først.",
    starter: "npm run build ",
    hint: "`2>&1` sender stderr inn på samme kanal som stdout. Eller bruk `|&` (bash-snarvei).",
    solution: "npm run build 2>&1 | grep -i error",
    explanation:
      "`2>&1` betyr: ta kanal 2 (stderr) og koble den til der kanal 1 går. Rekkefølgen er viktig — `2>&1` må komme FØR pipen for å virke. `|&` er bash-snarvei for det samme.",
    checks: [
      { kind: "contains", needle: "npm run build", explain: "Kjør npm run build." },
      { kind: "one-of", needles: ["2>&1", "|&"], explain: "Slå sammen stderr og stdout." },
      { kind: "contains", needle: "grep", explain: "Pipe til grep." },
      { kind: "regex", pattern: "-[a-zA-Z]*i", explain: "Bruk -i (case-insensitive)." },
    ],
  },

  /* ===================================================================
   * TEKSTPROSESSERING  (level 2-3)
   * =================================================================== */
  {
    id: "tekst-cut-passwd",
    topic: "tekst",
    level: 2,
    title: "Plukk ut alle brukernavn",
    prompt: "Vis alle brukernavn fra `/etc/passwd`. Hver linje har formen `bruker:x:UID:GID:...`.",
    starter: "cut ",
    hint: "`cut -d: -f1 <fil>`.",
    solution: "cut -d: -f1 /etc/passwd",
    explanation:
      "`-d:` setter feltskille til kolon, `-f1` plukker første felt. Default skille er TAB, så du må alltid sette `-d` for andre separatorer.",
    checks: [
      { kind: "contains", needle: "cut", explain: "Bruk `cut`." },
      { kind: "regex", pattern: "-d\\s*['\"]?:", explain: "Bruk -d: som skille." },
      { kind: "regex", pattern: "-f\\s*1\\b", explain: "Bruk -f1 for første felt." },
      { kind: "contains", needle: "/etc/passwd", explain: "Filen er /etc/passwd." },
    ],
  },
  {
    id: "tekst-sort-uniq",
    topic: "tekst",
    level: 2,
    title: "Finn unike linjer",
    prompt: "List ut unike linjer i `besokere.txt` (uavhengig av rekkefølge i filen).",
    context: "`uniq` ser bare på naboer — du må sortere først.",
    starter: "sort ",
    hint: "`sort | uniq`.",
    solution: "sort besokere.txt | uniq",
    explanation:
      "Klassisk feil: `uniq fil` alene fjerner bare dupliserte NABO-linjer. Sortér først så like linjer havner ved siden av hverandre. `sort -u` gjør begge i ett.",
    checks: [
      { kind: "contains", needle: "sort", explain: "Bruk `sort`." },
      { kind: "contains", needle: "besokere.txt", explain: "Filen." },
      { kind: "one-of", needles: ["| uniq", "-u"], explain: "Bruk `| uniq` eller `sort -u`." },
    ],
  },
  {
    id: "tekst-uniq-c",
    topic: "tekst",
    level: 2,
    title: "Tell hvor ofte hver linje forekommer",
    prompt: "Tell forekomster av hver unike linje i `bestillinger.txt` og vis tellingen foran.",
    starter: "sort ",
    hint: "`sort | uniq -c`.",
    solution: "sort bestillinger.txt | uniq -c",
    explanation:
      "`uniq -c` setter en teller foran hver unike linje. Output: `  3 banan`, `  1 eple`, osv. Hvis du vil ha topp-listen, pip til `sort -rn`.",
    checks: [
      { kind: "contains", needle: "sort", explain: "Sortér først." },
      { kind: "contains", needle: "bestillinger.txt", explain: "Filen." },
      { kind: "contains", needle: "uniq", explain: "Bruk `uniq`." },
      { kind: "contains", needle: "-c", explain: "Bruk -c for telling." },
    ],
  },
  {
    id: "tekst-top10",
    topic: "tekst",
    level: 3,
    title: "Topp 10 mest aktive IP-er",
    prompt:
      "I `access.log` står IP-adressen som første felt på hver linje (mellomrom som skille). Lag pipeline som gir topp 10 IP-er etter antall treff.",
    context:
      "Linjer ser ut som: `192.168.1.4 - - [12/Mar/2026] \"GET / HTTP/1.1\" 200 ...`",
    starter: "",
    hint: "`awk '{print $1}'` eller `cut -d' ' -f1` for IP. Så `sort | uniq -c | sort -rn | head -n 10`.",
    solution: "awk '{print $1}' access.log | sort | uniq -c | sort -rn | head -n 10",
    explanation:
      "Pipelinen plukker IP (kol 1), sorterer, teller med uniq -c, sorterer på telling synkende (-rn = revers numerisk), tar topp 10. Du kunne brukt `cut -d' ' -f1` istedenfor awk.",
    checks: [
      { kind: "one-of", needles: ["awk", "cut"], explain: "Plukk IP med awk eller cut." },
      { kind: "contains", needle: "access.log", explain: "Filen access.log." },
      { kind: "contains", needle: "sort", explain: "Sortér." },
      { kind: "contains", needle: "uniq", explain: "Tell unike." },
      { kind: "contains", needle: "-c", explain: "uniq -c." },
      { kind: "regex", pattern: "sort\\s+-[a-zA-Z]*r[a-zA-Z]*n|sort\\s+-[a-zA-Z]*n[a-zA-Z]*r", explain: "Bruk sort -rn (eller -nr)." },
      { kind: "contains", needle: "head", explain: "Topp 10 med head." },
      { kind: "regex", pattern: "head\\s+(-n\\s*)?10\\b", explain: "head -n 10 eller -10." },
    ],
  },
  {
    id: "tekst-tr-lower",
    topic: "tekst",
    level: 2,
    title: "Konverter til små bokstaver",
    prompt: "Konverter alle store bokstaver i `tekst.txt` til små og print resultatet til terminalen.",
    starter: "tr ",
    hint: "`tr 'A-Z' 'a-z' < fil` — tr leser kun fra stdin.",
    solution: "tr 'A-Z' 'a-z' < tekst.txt",
    explanation:
      "`tr` leser kun fra stdin, ikke en fil-argument. Bruk redirect `< fil`, eller pipe: `cat fil | tr ...`. `'A-Z'` og `'a-z'` er range-spec.",
    checks: [
      { kind: "contains", needle: "tr", explain: "Bruk `tr`." },
      { kind: "one-of", needles: ["'A-Z'", '"A-Z"'], explain: "Kildeområde 'A-Z'." },
      { kind: "one-of", needles: ["'a-z'", '"a-z"'], explain: "Målområde 'a-z'." },
      { kind: "contains", needle: "tekst.txt", explain: "Filen tekst.txt." },
    ],
  },

  /* ===================================================================
   * PROSESSER  (level 1-3)
   * =================================================================== */
  {
    id: "proc-ps-grep",
    topic: "prosesser",
    level: 1,
    title: "Finn nginx-prosesser",
    prompt: "List alle prosesser hvor kommandoen inneholder `nginx`.",
    starter: "ps ",
    hint: "`ps aux | grep nginx`.",
    solution: "ps aux | grep nginx",
    explanation:
      "`ps aux` lister alle prosesser. `grep nginx` filtrerer. NB: `grep` finner også sin egen prosess — bruk `pgrep nginx` for ren liste.",
    checks: [
      { kind: "contains", needle: "ps", explain: "Bruk `ps`." },
      { kind: "regex", pattern: "ps\\s+aux|ps\\s+-ef", explain: "Bruk `ps aux` eller `ps -ef`." },
      { kind: "contains", needle: "|", explain: "Pipe." },
      { kind: "contains", needle: "grep", explain: "Filtrer med grep." },
      { kind: "contains", needle: "nginx", explain: "Etter nginx." },
    ],
  },
  {
    id: "proc-kill-9",
    topic: "prosesser",
    level: 1,
    title: "Tving en prosess til å dø",
    prompt: "Drep prosess med PID 4242 med SIGKILL (kan ikke ignoreres).",
    starter: "kill ",
    hint: "Signal 9 = SIGKILL.",
    solution: "kill -9 4242",
    explanation:
      "`kill -9` (eller `kill -SIGKILL`) tvinger kjernen til å drepe prosessen umiddelbart. Kontrast: `kill 4242` (= SIGTERM = signal 15) lar prosessen rydde opp først.",
    checks: [
      { kind: "contains", needle: "kill", explain: "Bruk `kill`." },
      { kind: "one-of", needles: ["-9", "-SIGKILL", "-KILL"], explain: "Signal 9 / SIGKILL." },
      { kind: "contains", needle: "4242", explain: "PID 4242." },
    ],
  },
  {
    id: "proc-background",
    topic: "prosesser",
    level: 2,
    title: "Kjør i bakgrunnen",
    prompt: "Start `./langtidsjobb.sh` i bakgrunnen så terminalen er klar med en gang.",
    starter: "",
    hint: "`&` på slutten.",
    solution: "./langtidsjobb.sh &",
    explanation:
      "`&` etter en kommando sender den til bakgrunnen. Du får tilbake PID og en jobb-ID. `jobs` lister, `fg %1` henter første tilbake.",
    checks: [
      { kind: "contains", needle: "./langtidsjobb.sh", explain: "Kjør scriptet." },
      { kind: "regex", pattern: "&\\s*$", explain: "Avslutt med `&`." },
    ],
  },
  {
    id: "proc-nohup",
    topic: "prosesser",
    level: 2,
    title: "Overlev utlogging",
    prompt: "Start `./worker.py` slik at den fortsetter å kjøre selv om du logger ut. Den skal også gå i bakgrunnen.",
    starter: "nohup ",
    hint: "`nohup ... &` — output havner i `nohup.out`.",
    solution: "nohup ./worker.py &",
    explanation:
      "`nohup` ignorerer SIGHUP (signalet shellet sender til barna sine ved utlogging). Kombinert med `&` får du en jobb som lever videre.",
    checks: [
      { kind: "contains", needle: "nohup", explain: "Bruk `nohup`." },
      { kind: "contains", needle: "./worker.py", explain: "Scriptet." },
      { kind: "regex", pattern: "&\\s*$", explain: "Avslutt med `&` for bakgrunn." },
    ],
  },
  {
    id: "proc-pkill",
    topic: "prosesser",
    level: 2,
    title: "Drep alle prosesser etter navn",
    prompt: "Drep alle prosesser med navn `python` ved hjelp av én kommando (ikke `ps + grep + kill`).",
    starter: "",
    hint: "`pkill <navn>` eller `killall <navn>`.",
    solution: "pkill python",
    explanation:
      "`pkill` matcher navnet og sender signal (default SIGTERM). `killall` gjør det samme. Begge er enklere enn `ps | grep | awk | xargs kill`.",
    checks: [
      { kind: "one-of", needles: ["pkill", "killall"], explain: "Bruk pkill eller killall." },
      { kind: "contains", needle: "python", explain: "Mot python-prosesser." },
    ],
  },

  /* ===================================================================
   * PAKKER & SYSTEMD  (level 1-2)
   * =================================================================== */
  {
    id: "pkg-apt-install",
    topic: "pakker-systemd",
    level: 1,
    title: "Installer en pakke",
    prompt: "Oppdater pakkeindeksen og installer nginx — på én linje med `&&`.",
    starter: "sudo ",
    hint: "`apt update && apt install -y nginx`.",
    solution: "sudo apt update && sudo apt install -y nginx",
    explanation:
      "`apt update` henter ny indeks, `apt install -y nginx` installerer (-y svarer ja på prompt). `&&` kjører neste bare om første lyktes.",
    checks: [
      { kind: "contains", needle: "apt", explain: "Bruk `apt`." },
      { kind: "contains", needle: "update", explain: "Kjør apt update." },
      { kind: "contains", needle: "install", explain: "Kjør apt install." },
      { kind: "contains", needle: "nginx", explain: "Pakken nginx." },
      { kind: "contains", needle: "&&", explain: "Bruk && for å lenke." },
    ],
  },
  {
    id: "pkg-systemctl-restart",
    topic: "pakker-systemd",
    level: 1,
    title: "Restart en tjeneste",
    prompt: "Restart nginx-tjenesten.",
    starter: "sudo systemctl ",
    hint: "`systemctl restart <tjeneste>`.",
    solution: "sudo systemctl restart nginx",
    explanation: "`systemctl restart` stopper og starter på nytt. `reload` er softere (sender SIGHUP), men ikke alle daemoner støtter det.",
    checks: [
      { kind: "contains", needle: "systemctl", explain: "Bruk `systemctl`." },
      { kind: "contains", needle: "restart", explain: "Bruk `restart`." },
      { kind: "contains", needle: "nginx", explain: "Tjenesten nginx." },
    ],
  },
  {
    id: "pkg-enable",
    topic: "pakker-systemd",
    level: 2,
    title: "Få tjenesten til å starte ved boot",
    prompt: "Aktiver nginx slik at den starter automatisk når systemet boot-er.",
    starter: "sudo systemctl ",
    hint: "`systemctl enable <tjeneste>` (eller `enable --now` for å starte den samtidig).",
    solution: "sudo systemctl enable nginx",
    explanation:
      "`enable` lager en symlink i `multi-user.target.wants/` slik at systemd starter unit-en ved boot. `enable --now` starter den i tillegg umiddelbart.",
    checks: [
      { kind: "contains", needle: "systemctl", explain: "Bruk `systemctl`." },
      { kind: "contains", needle: "enable", explain: "Bruk `enable`." },
      { kind: "contains", needle: "nginx", explain: "Tjenesten nginx." },
    ],
  },
  {
    id: "pkg-journalctl",
    topic: "pakker-systemd",
    level: 2,
    title: "Følg loggen til nginx",
    prompt: "Følg journalctl-loggen for nginx-tjenesten i sanntid (siste linjer + nye linjer fortløpende).",
    starter: "journalctl ",
    hint: "`-u tjeneste -f`.",
    solution: "journalctl -u nginx -f",
    explanation:
      "`-u <unit>` filtrerer på service. `-f` (follow) holder strømmen åpen. Ctrl+C for å gå ut. Kombiner med `--since '5 min ago'` for å starte fra et tidspunkt.",
    checks: [
      { kind: "contains", needle: "journalctl", explain: "Bruk `journalctl`." },
      { kind: "regex", pattern: "-u\\s+nginx", explain: "-u nginx for å filtrere unit." },
      { kind: "contains", needle: "-f", explain: "-f for å følge." },
    ],
  },

  /* ===================================================================
   * NETTVERK & SSH  (level 1-3)
   * =================================================================== */
  {
    id: "net-ssh-port",
    topic: "nett-ssh",
    level: 1,
    title: "SSH på annen port",
    prompt: "Logg inn som `isak` på `server.example.no` på port 2222.",
    starter: "ssh ",
    hint: "`-p PORT bruker@host`.",
    solution: "ssh -p 2222 isak@server.example.no",
    explanation:
      "`-p` (liten p) setter port for ssh. NB: `scp` bruker `-P` (stor P) for det samme — irriterende inkonsistens.",
    checks: [
      { kind: "contains", needle: "ssh", explain: "Bruk `ssh`." },
      { kind: "regex", pattern: "-p\\s+2222", explain: "-p 2222." },
      { kind: "contains", needle: "isak@server.example.no", explain: "Bruker@host." },
    ],
  },
  {
    id: "net-scp",
    topic: "nett-ssh",
    level: 1,
    title: "Kopier en fil til serveren",
    prompt: "Kopier `bygg.tar.gz` fra nåværende mappe til hjemmemappen til `isak` på `server.example.no`.",
    starter: "scp ",
    hint: "`scp lokal bruker@host:mål`.",
    solution: "scp bygg.tar.gz isak@server.example.no:~/",
    explanation:
      "`scp <kilde> <mål>`. Målet kan være `bruker@host:sti`. `~/` betyr hjemmemappen til den brukeren. For mapper trenger du `-r`.",
    checks: [
      { kind: "contains", needle: "scp", explain: "Bruk `scp`." },
      { kind: "contains", needle: "bygg.tar.gz", explain: "Filen." },
      { kind: "contains", needle: "isak@server.example.no", explain: "Bruker@host." },
      { kind: "contains", needle: ":", explain: "Kolon mellom host og sti." },
    ],
  },
  {
    id: "net-rsync",
    topic: "nett-ssh",
    level: 2,
    title: "Synk en mappe effektivt",
    prompt: "Synk `./build/` til `/var/www/myapp/` på `server.example.no` som bruker `deploy`. Bevar tider og rettigheter, vis fremgang, og komprimer underveis.",
    starter: "rsync ",
    hint: "`-avz` er standard: a=archive (bevar alt), v=verbose, z=zip.",
    solution: "rsync -avz ./build/ deploy@server.example.no:/var/www/myapp/",
    explanation:
      "`-a` impliserer en haug av flagg (-rlptgoD) som bevarer rettigheter, tider, lenker. `-v` viser hva som sendes. `-z` komprimerer over linja. Sluttstrek på kilden er viktig: `build/` = innholdet, `build` = mappen selv.",
    checks: [
      { kind: "contains", needle: "rsync", explain: "Bruk `rsync`." },
      { kind: "regex", pattern: "-[a-zA-Z]*a[a-zA-Z]*", explain: "Inkluder -a." },
      { kind: "regex", pattern: "-[a-zA-Z]*v[a-zA-Z]*", explain: "Inkluder -v." },
      { kind: "regex", pattern: "-[a-zA-Z]*z[a-zA-Z]*", explain: "Inkluder -z." },
      { kind: "contains", needle: "./build/", explain: "Kilden ./build/." },
      { kind: "contains", needle: "deploy@server.example.no:/var/www/myapp/", explain: "Mål." },
    ],
  },
  {
    id: "net-curl-headers",
    topic: "nett-ssh",
    level: 1,
    title: "Bare HTTP-headers, takk",
    prompt: "Hent KUN response-headers (ikke body) fra `https://example.com`.",
    starter: "curl ",
    hint: "`-I` (stor i) eller `--head`.",
    solution: "curl -I https://example.com",
    explanation:
      "`-I` sender HEAD-request og viser headers. Liten `-i` viser headers + body. `-v` viser hele forhandlingen (request, response, TLS).",
    checks: [
      { kind: "contains", needle: "curl", explain: "Bruk `curl`." },
      { kind: "one-of", needles: ["-I", "--head"], explain: "Bruk -I (eller --head)." },
      { kind: "contains", needle: "https://example.com", explain: "URL." },
    ],
  },
  {
    id: "net-curl-post-json",
    topic: "nett-ssh",
    level: 3,
    title: "POST JSON med curl",
    prompt:
      "Send en POST til `https://api.eksempel.no/users` med JSON-bodyen `{\"navn\":\"Isak\"}` og header `Content-Type: application/json`.",
    starter: "curl ",
    hint: "`-X POST`, `-H 'Content-Type: ...'`, `-d '...'`.",
    solution:
      'curl -X POST -H \'Content-Type: application/json\' -d \'{"navn":"Isak"}\' https://api.eksempel.no/users',
    explanation:
      "`-X` setter HTTP-metode. `-H` legger til en header (kan gjentas). `-d` sender body — curl setter automatisk metoden til POST når -d er med, men det er tydeligere å skrive `-X POST` eksplisitt.",
    checks: [
      { kind: "contains", needle: "curl", explain: "Bruk `curl`." },
      { kind: "regex", pattern: "-X\\s+POST", explain: "-X POST." },
      { kind: "regex", pattern: "-H\\s+['\"]Content-Type:\\s*application/json['\"]", explain: "Content-Type header." },
      { kind: "regex", pattern: '-d\\s+[\'"][^\'"]*"navn"[^\'"]*[\'"]', explain: "JSON-body med 'navn'." },
      { kind: "contains", needle: "https://api.eksempel.no/users", explain: "URL." },
    ],
  },
  {
    id: "net-ss-listen",
    topic: "nett-ssh",
    level: 3,
    title: "Hva lytter på port?",
    prompt: "List alle TCP-porter som lytter på maskinen, og vis hvilken prosess som lytter på hver.",
    context: "`ss` har erstattet `netstat` i moderne distroer.",
    starter: "sudo ss ",
    hint: "`-t` (tcp), `-l` (lytting), `-n` (numerisk), `-p` (prosess).",
    solution: "sudo ss -tlnp",
    explanation:
      "`-t` TCP, `-l` LISTEN-tilstand, `-n` ikke gjør DNS/port-name oppslag, `-p` viser PID/program. Krever som regel sudo for å vise prosess. `netstat -tlnp` virker likt på eldre systemer.",
    checks: [
      { kind: "one-of", needles: ["ss", "netstat"], explain: "Bruk `ss` (eller `netstat`)." },
      { kind: "regex", pattern: "-[a-zA-Z]*t[a-zA-Z]*", explain: "-t (TCP)." },
      { kind: "regex", pattern: "-[a-zA-Z]*l[a-zA-Z]*", explain: "-l (LISTEN)." },
      { kind: "regex", pattern: "-[a-zA-Z]*n[a-zA-Z]*", explain: "-n (numerisk)." },
      { kind: "regex", pattern: "-[a-zA-Z]*p[a-zA-Z]*", explain: "-p (prosess)." },
    ],
  },

  /* ===================================================================
   * SCRIPTING  (level 1-3)
   * =================================================================== */
  {
    id: "script-shebang",
    topic: "scripting",
    level: 1,
    title: "Hello-script",
    prompt:
      'Skriv et komplett bash-script (inkl. shebang) som printer "Hei verden". Bare innholdet i .sh-filen.',
    starter: "",
    hint: "Linje 1: `#!/usr/bin/env bash`. Linje 2: `echo \"Hei verden\"`.",
    solution: '#!/usr/bin/env bash\necho "Hei verden"',
    explanation:
      "Shebang `#!` på første linje sier hvilken tolker som skal kjøre filen. `/usr/bin/env bash` finner bash via PATH — mer portabelt enn `/bin/bash` direkte.",
    checks: [
      { kind: "regex", pattern: "^#!\\s*/", explain: "Må starte med shebang (`#!`)." },
      { kind: "contains", needle: "bash", explain: "Shebang skal peke på bash." },
      { kind: "contains", needle: "echo", explain: "Bruk `echo`." },
      { kind: "regex", pattern: "[\"']Hei verden[\"']", explain: "Strengen \"Hei verden\"." },
    ],
  },
  {
    id: "script-var",
    topic: "scripting",
    level: 1,
    title: "Variabel og interpolasjon",
    prompt:
      'Lag et bash-script (med shebang) som setter en variabel `navn` til "Isak" og skriver ut "Hei, Isak!" ved å bruke variabelen.',
    starter: "#!/usr/bin/env bash\n",
    hint: 'Ingen mellomrom rundt =. Bruk `"Hei, $navn!"`.',
    solution: '#!/usr/bin/env bash\nnavn="Isak"\necho "Hei, $navn!"',
    explanation:
      'Tildeling uten mellomrom: `navn="Isak"`. Variabel-ekspansjon skjer KUN i doble fnutter — i enkle fnutter forblir `$navn` litterært.',
    checks: [
      { kind: "regex", pattern: "^#!", explain: "Shebang." },
      { kind: "regex", pattern: 'navn\\s*=\\s*["\']?Isak', explain: 'Variabel `navn="Isak"`.' },
      { kind: "regex", pattern: "\\$navn|\\$\\{navn\\}", explain: "Bruk $navn." },
      { kind: "contains", needle: "echo", explain: "Bruk `echo`." },
    ],
  },
  {
    id: "script-if-fil",
    topic: "scripting",
    level: 2,
    title: "Sjekk om fil eksisterer",
    prompt:
      'Skriv et bash-script som sjekker om filen `/etc/passwd` eksisterer. Hvis ja, skriv "Finnes". Hvis nei, skriv "Mangler".',
    starter: "#!/usr/bin/env bash\n",
    hint: "`if [ -f /etc/passwd ]; then ... else ... fi`. Mellomrom rundt `[` og `]`!",
    solution:
      '#!/usr/bin/env bash\nif [ -f /etc/passwd ]; then\n  echo "Finnes"\nelse\n  echo "Mangler"\nfi',
    explanation:
      "`-f` tester om en vanlig fil eksisterer. Andre tester: `-d` (mappe), `-e` (eksisterer i det hele tatt), `-r/-w/-x` (lesbar/skrivbar/kjørbar). Husk mellomrommene rundt klammene!",
    checks: [
      { kind: "regex", pattern: "^#!", explain: "Shebang." },
      { kind: "contains", needle: "if", explain: "Bruk `if`." },
      { kind: "regex", pattern: "\\[\\s+-f\\s+/etc/passwd\\s+\\]", explain: "`[ -f /etc/passwd ]` med mellomrom." },
      { kind: "contains", needle: "then", explain: "`then`." },
      { kind: "contains", needle: "else", explain: "`else`." },
      { kind: "contains", needle: "fi", explain: "`fi`." },
      { kind: "regex", pattern: '"Finnes"', explain: '"Finnes"-grenen.' },
      { kind: "regex", pattern: '"Mangler"', explain: '"Mangler"-grenen.' },
    ],
  },
  {
    id: "script-for-loop",
    topic: "scripting",
    level: 2,
    title: "Loop over filer",
    prompt:
      "Skriv et bash-script som looper over alle `.txt`-filer i nåværende mappe og printer linjeantall for hver med `wc -l`.",
    starter: "#!/usr/bin/env bash\n",
    hint: "`for f in *.txt; do wc -l \"$f\"; done`. Quote $f!",
    solution:
      '#!/usr/bin/env bash\nfor f in *.txt; do\n  wc -l "$f"\ndone',
    explanation:
      "`for f in *.txt` lar shellet ekspandere globben. Quote `\"$f\"` så filnavn med mellomrom ikke brekker. Hvis ingen .txt finnes, gir bash-default `f=\"*.txt\"` litterært — sett `shopt -s nullglob` for å unngå.",
    checks: [
      { kind: "regex", pattern: "^#!", explain: "Shebang." },
      { kind: "regex", pattern: "for\\s+\\w+\\s+in\\s+\\*\\.txt", explain: "for f in *.txt." },
      { kind: "contains", needle: "do", explain: "`do`." },
      { kind: "contains", needle: "done", explain: "`done`." },
      { kind: "contains", needle: "wc", explain: "Bruk `wc`." },
      { kind: "contains", needle: "-l", explain: "wc -l." },
      { kind: "regex", pattern: '"\\$\\w+"', explain: "Quote variabelen, f.eks. \"$f\"." },
    ],
  },
  {
    id: "script-set-e",
    topic: "scripting",
    level: 3,
    title: "Trygg-modus øverst",
    prompt: "Skriv shebang og første linje etter — den linja som gjør at scriptet stopper ved første feil, ved ubrukt variabel, og ved feil i en pipeline.",
    context: "Dette er bash-standardlinja for trygge scripts.",
    starter: "#!/usr/bin/env bash\n",
    hint: "`set -euo pipefail`. e=errexit, u=nounset, pipefail=feil propagerer.",
    solution: "#!/usr/bin/env bash\nset -euo pipefail",
    explanation:
      "`-e` stopper ved første kommando som gir non-zero exit. `-u` feiler ved bruk av ubrukt variabel. `pipefail` får exit-koden til en pipeline til å være siste non-zero (ikke bare siste kommando). Sammen kalt 'bash strict mode'.",
    checks: [
      { kind: "regex", pattern: "^#!", explain: "Shebang." },
      { kind: "contains", needle: "set", explain: "Bruk `set`." },
      { kind: "regex", pattern: "-[a-z]*e[a-z]*", explain: "-e for errexit." },
      { kind: "regex", pattern: "-[a-z]*u[a-z]*", explain: "-u for nounset." },
      { kind: "contains", needle: "pipefail", explain: "pipefail." },
    ],
  },
  {
    id: "script-args",
    topic: "scripting",
    level: 3,
    title: "Sjekk antall argumenter",
    prompt:
      'Skriv et bash-script som tar nøyaktig ett argument. Hvis brukeren ikke gir akkurat ett, skriv "Bruk: $0 <fil>" til stderr og avslutt med exit-kode 1. Ellers skriv "OK".',
    starter: "#!/usr/bin/env bash\n",
    hint: "`$#` = antall argumenter. `>&2` for stderr. `exit 1` for feilkode.",
    solution:
      '#!/usr/bin/env bash\nif [ "$#" -ne 1 ]; then\n  echo "Bruk: $0 <fil>" >&2\n  exit 1\nfi\necho "OK"',
    explanation:
      "`$#` er antall positional args. `-ne` er numerisk ulik (string-versjonen er `!=`). `>&2` redirecter echo til stderr — riktig for feilmeldinger. `exit 1` (eller annet non-zero) signaliserer feil til callere.",
    checks: [
      { kind: "regex", pattern: "^#!", explain: "Shebang." },
      { kind: "regex", pattern: "\\$#", explain: "Bruk $# for antall args." },
      { kind: "regex", pattern: "-ne\\s+1|!=\\s*1", explain: "Sjekk ulik 1." },
      { kind: "contains", needle: ">&2", explain: "Send feilmeldingen til stderr." },
      { kind: "regex", pattern: "exit\\s+1", explain: "exit 1." },
      { kind: "regex", pattern: '\\$0', explain: "Bruk $0 i feilmeldingen." },
    ],
  },
];
