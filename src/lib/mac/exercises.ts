import type { MacExercise } from "./types";

export const MAC_EXERCISES: MacExercise[] = [
  /* ===================================================================
   * APPLESCRIPT-BASIS
   * =================================================================== */
  {
    id: "ex-as-hello",
    topic: "applescript-basis",
    level: 1,
    title: "Hello-dialog",
    prompt: 'Skriv en AppleScript som viser en dialog med teksten "Hei verden!".',
    language: "applescript",
    starter: "",
    hint: "Bruk `display dialog` med strengen i doble fnutter.",
    solution: 'display dialog "Hei verden!"',
    explanation:
      "`display dialog` er den enkleste UI-en i AppleScript. Den åpner en modal boks med OK/Cancel.",
    checks: [
      { kind: "contains", needle: "display dialog", explain: "Må bruke `display dialog`" },
      { kind: "regex", pattern: '"Hei verden!"', explain: 'Må inneholde teksten "Hei verden!"' },
    ],
  },
  {
    id: "ex-as-set",
    topic: "applescript-basis",
    level: 1,
    title: "Variabel + lim",
    prompt:
      'Sett en variabel `navn` til "Isak", og vis en dialog med "Hei, Isak!" — men bygg strengen ved å lime sammen "Hei, ", variabelen og "!".',
    language: "applescript",
    starter: "set navn to \n\ndisplay dialog ",
    hint: "Lim sammen strenger med `&`. Ferdig uttrykk: `\"Hei, \" & navn & \"!\"`.",
    solution: 'set navn to "Isak"\ndisplay dialog "Hei, " & navn & "!"',
    explanation:
      "`set X to Y` definerer variabel. `&` er streng-konkatenering i AppleScript (ikke `+`!).",
    checks: [
      { kind: "regex", pattern: 'set\\s+navn\\s+to\\s+"Isak"', explain: 'navn må settes til "Isak"' },
      { kind: "contains", needle: "display dialog", explain: "Må bruke `display dialog`" },
      { kind: "contains", needle: "&", explain: "Må bruke `&` for å lime sammen strengen" },
    ],
  },
  {
    id: "ex-as-input",
    topic: "applescript-basis",
    level: 2,
    title: "Hent input fra dialog",
    prompt:
      'Vis en dialog som spør "Hva heter du?" med tekstfelt. Plukk ut svaret og vis en ny dialog med "Hei, <navn>!".',
    language: "applescript",
    starter: "",
    hint: "Bruk `default answer \"\"` for å få tekstfelt. Plukk svaret med `text returned of result`.",
    solution:
      'set svar to display dialog "Hva heter du?" default answer ""\nset navn to text returned of svar\ndisplay dialog "Hei, " & navn & "!"',
    explanation:
      "`default answer \"\"` legger til et tekstfelt. `display dialog` returnerer en record — `text returned of` plukker ut den skrevne teksten.",
    checks: [
      { kind: "contains", needle: "default answer", explain: "Trenger `default answer` for å få tekstfelt" },
      { kind: "contains", needle: "text returned", explain: "Bruk `text returned` for å plukke ut svaret" },
      { kind: "regex", pattern: 'display\\s+dialog.*?display\\s+dialog', flags: "is", explain: "Må vise dialog to ganger" },
    ],
  },
  {
    id: "ex-as-repeat",
    topic: "applescript-basis",
    level: 2,
    title: "Summer 1 til 100",
    prompt:
      "Bruk `repeat with i from 1 to 100` for å summere tallene 1..100. Vis svaret i en dialog.",
    language: "applescript",
    starter: "set total to 0\n\nrepeat \n    \nend repeat\n\ndisplay dialog ",
    hint: "Initier `total` til 0, øk med `i` inne i loopen. Riktig svar er 5050.",
    solution:
      'set total to 0\nrepeat with i from 1 to 100\n    set total to total + i\nend repeat\ndisplay dialog "Sum = " & total',
    explanation:
      "`repeat with i from 1 to 100` er teller-loopen. Inne i loopen oppdaterer vi `total` med `set total to total + i`.",
    checks: [
      { kind: "regex", pattern: "repeat\\s+with\\s+\\w+\\s+from\\s+1\\s+to\\s+100", explain: "Bruk `repeat with i from 1 to 100`" },
      { kind: "contains", needle: "end repeat", explain: "Loopen må lukkes med `end repeat`" },
      { kind: "contains", needle: "total", explain: "Bruk en variabel (gjerne `total`)" },
      { kind: "contains", needle: "display dialog", explain: "Vis resultatet med dialog" },
    ],
  },
  {
    id: "ex-as-if",
    topic: "applescript-basis",
    level: 2,
    title: "Positiv, negativ eller null",
    prompt:
      'Spør brukeren om et tall via dialog. Konverter til integer. Vis "Positiv", "Negativ" eller "Null" basert på fortegnet.',
    language: "applescript",
    starter: "",
    hint: "`(text returned of result) as integer` konverterer. Bruk `if ... else if ... else ... end if`.",
    solution:
      'set svar to display dialog "Tall:" default answer ""\nset n to (text returned of svar) as integer\nif n > 0 then\n    display dialog "Positiv"\nelse if n < 0 then\n    display dialog "Negativ"\nelse\n    display dialog "Null"\nend if',
    explanation:
      "`as integer` caster strengen til tall. `if … else if … else … end if` er forgrenings-syntaksen.",
    checks: [
      { kind: "contains", needle: "as integer", explain: "Konverter svaret med `as integer`" },
      { kind: "regex", pattern: "if\\s+\\w+\\s*>\\s*0", explain: "Sjekk `if n > 0`" },
      { kind: "contains", needle: "else if", explain: "Bruk `else if` for negativt" },
      { kind: "contains", needle: "end if", explain: "Lukk med `end if`" },
    ],
  },

  /* ===================================================================
   * APPLESCRIPT + APPER
   * =================================================================== */
  {
    id: "ex-finder-folder",
    topic: "applescript-apper",
    level: 1,
    title: "Lag mappe på skrivebordet",
    prompt:
      'Bruk Finder til å lage en ny mappe på skrivebordet med navn "Arkiv".',
    language: "applescript",
    starter: "tell application \"Finder\"\n    \nend tell",
    hint: "`make new folder at desktop with properties {name:\"…\"}`.",
    solution:
      'tell application "Finder"\n    make new folder at desktop with properties {name:"Arkiv"}\nend tell',
    explanation:
      "`make new folder` er Finder sin kommando. `at desktop` sier hvor. `with properties` lar oss sette navn.",
    checks: [
      { kind: "regex", pattern: 'tell\\s+application\\s+"Finder"', explain: 'Må starte med `tell application "Finder"`' },
      { kind: "contains", needle: "make new folder", explain: "Bruk `make new folder`" },
      { kind: "contains", needle: "desktop", explain: "Bruk `desktop` som plassering" },
      { kind: "regex", pattern: 'name\\s*:\\s*"Arkiv"', explain: 'Navnet må være "Arkiv"' },
      { kind: "contains", needle: "end tell", explain: "Lukk tell-blokken med `end tell`" },
    ],
  },
  {
    id: "ex-finder-selection",
    topic: "applescript-apper",
    level: 2,
    title: "Tell valgte filer",
    prompt:
      'Lag et script som henter antall filer som er valgt i Finder og viser tallet i en dialog: "Du har valgt N filer".',
    language: "applescript",
    starter: "",
    hint: "`count of selection` gir antall. `tell application \"Finder\"` for å bruke `selection`.",
    solution:
      'tell application "Finder"\n    set n to count of selection\nend tell\ndisplay dialog "Du har valgt " & n & " filer"',
    explanation:
      "`selection` er Finder sin innebygde referanse til filene brukeren har markert. `count of` gir antall elementer.",
    checks: [
      { kind: "contains", needle: '"finder"', explain: "Må tell-e Finder" },
      { kind: "contains", needle: "selection", explain: "Bruk `selection`" },
      { kind: "contains", needle: "count of", explain: "Bruk `count of` for antall" },
      { kind: "contains", needle: "display dialog", explain: "Vis i dialog" },
    ],
  },
  {
    id: "ex-safari-url",
    topic: "applescript-apper",
    level: 1,
    title: "Hent URL fra aktiv Safari-fane",
    prompt: 'Hent URL-en til den aktive Safari-fanen og vis den i en dialog.',
    language: "applescript",
    starter: "",
    hint: "`URL of current tab of front window` — pakk i `tell application \"Safari\"`.",
    solution:
      'tell application "Safari"\n    set u to URL of current tab of front window\nend tell\ndisplay dialog u',
    explanation:
      "`current tab of front window` er fanen som er åpen nå. `URL of …` gir adressen som streng.",
    checks: [
      { kind: "contains", needle: '"safari"', explain: "Tell Safari" },
      { kind: "contains", needle: "url of current tab", explain: "Bruk `URL of current tab`" },
      { kind: "contains", needle: "display dialog", explain: "Vis URL-en i dialog" },
    ],
  },
  {
    id: "ex-safari-newtab",
    topic: "applescript-apper",
    level: 2,
    title: "Åpne ny fane i Safari",
    prompt: 'Åpne `https://uit.no` i en ny Safari-fane i det fremste vinduet.',
    language: "applescript",
    starter: 'tell application "Safari"\n    tell window 1\n        \n    end tell\nend tell',
    hint: "`make new tab with properties {URL:\"…\"}` inne i `tell window 1`.",
    solution:
      'tell application "Safari"\n    tell window 1\n        set current tab to (make new tab with properties {URL:"https://uit.no"})\n    end tell\nend tell',
    explanation:
      "`make new tab` returnerer den nye fanen. `set current tab to` fokuserer den.",
    checks: [
      { kind: "contains", needle: "make new tab", explain: "Bruk `make new tab`" },
      { kind: "contains", needle: "https://uit.no", explain: "URL må være https://uit.no" },
      { kind: "regex", pattern: "tell\\s+window\\s+1", explain: "Bruk `tell window 1`" },
    ],
  },
  {
    id: "ex-mail-send",
    topic: "applescript-apper",
    level: 3,
    title: "Send e-post fra script",
    prompt:
      'Send en e-post til `mottaker@example.com` med emne "Test" og innhold "Sendt fra AppleScript". Sett `visible:false` så vinduet ikke poppes opp.',
    language: "applescript",
    starter: "",
    hint:
      "`make new outgoing message` med properties. Legg til `to recipient` med `make new to recipient`. Avslutt med `send`.",
    solution:
      'tell application "Mail"\n    set m to make new outgoing message with properties {subject:"Test", content:"Sendt fra AppleScript", visible:false}\n    tell m\n        make new to recipient with properties {address:"mottaker@example.com"}\n    end tell\n    send m\nend tell',
    explanation:
      "Mail bygger meldingen som et objekt, så legger til mottakere som child-objekt. `send` køes opp og sendes.",
    checks: [
      { kind: "contains", needle: '"mail"', explain: "Må tell-e Mail" },
      { kind: "contains", needle: "make new outgoing message", explain: "Bruk `make new outgoing message`" },
      { kind: "contains", needle: "make new to recipient", explain: "Legg til mottaker med `make new to recipient`" },
      { kind: "contains", needle: "mottaker@example.com", explain: "Mottaker-adressen må være riktig" },
      { kind: "regex", pattern: "\\bsend\\b", explain: "Avslutt med `send`" },
      { kind: "contains", needle: "visible:false", explain: "Sett visible:false" },
    ],
  },

  /* ===================================================================
   * SHORTCUTS
   * =================================================================== */
  {
    id: "ex-sc-run",
    topic: "shortcuts",
    level: 1,
    title: "Kjør en snarvei fra terminalen",
    prompt:
      'Skriv shell-kommandoen som kjører Shortcut-en med navn "Open Clipboard URL".',
    language: "shell",
    starter: "",
    hint: '`shortcuts run "NAVN"`.',
    solution: 'shortcuts run "Open Clipboard URL"',
    explanation:
      "`shortcuts` er macOS sin innebygde CLI for Snarveier. `run` starter en snarvei ved navn.",
    checks: [
      { kind: "regex", pattern: "^\\s*shortcuts\\s+run\\s+", explain: "Start med `shortcuts run`" },
      { kind: "contains", needle: "Open Clipboard URL", explain: "Navnet må være `Open Clipboard URL`" },
    ],
  },
  {
    id: "ex-sc-stdin",
    topic: "shortcuts",
    level: 2,
    title: "Pipe input til en snarvei",
    prompt:
      'Send strengen `https://uit.no` som stdin til Shortcut-en `Open URL in Safari`.',
    language: "shell",
    starter: "",
    hint: "Bruk `echo` og pipe til `shortcuts run`.",
    solution: 'echo "https://uit.no" | shortcuts run "Open URL in Safari"',
    explanation:
      "`shortcuts run` leser stdin og setter det som input til snarveien hvis snarveien er konfigurert til å motta input.",
    checks: [
      { kind: "regex", pattern: "echo\\s+[\"']?https://uit\\.no", explain: "Bruk `echo \"https://uit.no\"`" },
      { kind: "contains", needle: "|", explain: "Pipe (|) til shortcuts" },
      { kind: "regex", pattern: "shortcuts\\s+run\\s+\"Open URL in Safari\"", explain: "shortcuts run \"Open URL in Safari\"" },
    ],
  },
  {
    id: "ex-sc-list",
    topic: "shortcuts",
    level: 1,
    title: "List alle snarveier",
    prompt: 'Skriv kommandoen som lister alle Shortcuts som finnes på maskinen.',
    language: "shell",
    starter: "",
    hint: "Subkommandoen heter `list`.",
    solution: "shortcuts list",
    explanation:
      "`shortcuts list` viser alle snarveier registrert på brukeren. Bruk `--folder NAVN` for å filtrere på mappe.",
    checks: [
      { kind: "regex", pattern: "^\\s*shortcuts\\s+list\\s*$", explain: "Eksakt: `shortcuts list`" },
    ],
  },

  /* ===================================================================
   * AUTOMATOR (mest konseptuelt — vi sjekker shell-script-actions)
   * =================================================================== */
  {
    id: "ex-auto-rename",
    topic: "automator",
    level: 2,
    title: "Quick Action: legg dato på filnavn",
    prompt:
      'I en Automator Quick Action (Run Shell Script, "Pass input: as arguments") vil filer komme inn som $1, $2, .... Skriv shell-koden som legger til dagens dato (`YYYY-MM-DD`) på slutten av filnavnet, før extensionen, for hver fil.',
    context:
      'Eksempel: `rapport.pdf` → `rapport-2026-05-16.pdf`. Bruk `date +%Y-%m-%d` for dato.',
    language: "shell",
    starter: '#!/bin/bash\nfor f in "$@"; do\n    \ndone',
    hint:
      "`${f%.*}` fjerner extension, `${f##*.}` plukker den ut. Sett dato med `$(date +%Y-%m-%d)`.",
    solution:
      '#!/bin/bash\nfor f in "$@"; do\n    dato=$(date +%Y-%m-%d)\n    mv "$f" "${f%.*}-${dato}.${f##*.}"\ndone',
    explanation:
      "`${f%.*}` = filnavn uten extension. `${f##*.}` = bare extension. `$(date +%Y-%m-%d)` = dagens dato. `mv` flytter med nytt navn.",
    checks: [
      { kind: "regex", pattern: 'for\\s+\\w+\\s+in\\s+"\\$@"', explain: 'Loop over `"$@"`' },
      { kind: "contains", needle: "date +%Y-%m-%d", explain: "Bruk `date +%Y-%m-%d`" },
      { kind: "regex", pattern: "\\$\\{\\w+%\\.\\*\\}", explain: "Bruk `${f%.*}` for filnavn uten extension" },
      { kind: "regex", pattern: "\\$\\{\\w+##\\*\\.\\}", explain: "Bruk `${f##*.}` for extension" },
      { kind: "regex", pattern: "\\bmv\\b", explain: "Bruk `mv` for å gi nytt navn" },
    ],
  },

  /* ===================================================================
   * TERMINAL
   * =================================================================== */
  {
    id: "ex-term-osa-notify",
    topic: "terminal",
    level: 1,
    title: "Native varsling fra shellet",
    prompt:
      'Bruk `osascript -e` til å vise en macOS-varsling med tittel "Build" og tekst "Ferdig!".',
    language: "shell",
    starter: "",
    hint: '`display notification "TEKST" with title "TITTEL"`.',
    solution: 'osascript -e \'display notification "Ferdig!" with title "Build"\'',
    explanation:
      "`display notification` triggrer Notification Center. Husk å pakke AppleScript-strengen i enkle fnutter for å unngå å escape de doble.",
    checks: [
      { kind: "regex", pattern: "^\\s*osascript\\s+-e", explain: "Bruk `osascript -e`" },
      { kind: "contains", needle: "display notification", explain: "Bruk `display notification`" },
      { kind: "contains", needle: "Ferdig!", explain: 'Teksten må være "Ferdig!"' },
      { kind: "contains", needle: "with title", explain: "Sett tittel med `with title`" },
      { kind: "contains", needle: "Build", explain: 'Tittelen må være "Build"' },
    ],
  },
  {
    id: "ex-term-pbcopy",
    topic: "terminal",
    level: 1,
    title: "Pipe ls-output til clipboard",
    prompt:
      'Skriv en pipeline som tar output av `ls -la` og legger det på clipboard.',
    language: "shell",
    starter: "",
    hint: "`pbcopy` leser stdin og setter clipboard.",
    solution: "ls -la | pbcopy",
    explanation:
      "`pbcopy` er macOS sin clipboard-skriver. Pipen `|` sender stdout fra `ls` inn som stdin til `pbcopy`.",
    checks: [
      { kind: "regex", pattern: "ls\\s+-la", explain: "Bruk `ls -la`" },
      { kind: "contains", needle: "|", explain: "Bruk pipe (|)" },
      { kind: "contains", needle: "pbcopy", explain: "Avslutt med `pbcopy`" },
    ],
  },
  {
    id: "ex-term-defaults-dock",
    topic: "terminal",
    level: 2,
    title: "Dock til venstre",
    prompt:
      'Skriv to defaults-kommandoer: én som setter Dock-orientering til "left", og én `killall Dock` for at endringen skal tre i kraft.',
    language: "shell",
    starter: "",
    hint: "`defaults write com.apple.dock orientation -string left`.",
    solution:
      'defaults write com.apple.dock orientation -string left\nkillall Dock',
    explanation:
      "Mange macOS-innstillinger leses bare ved app-start. `killall Dock` tvinger Dock til å starte på nytt og lese endringen.",
    checks: [
      { kind: "regex", pattern: "defaults\\s+write\\s+com\\.apple\\.dock", explain: "`defaults write com.apple.dock`" },
      { kind: "contains", needle: "orientation", explain: "Key må være `orientation`" },
      { kind: "regex", pattern: '-string\\s+["\\\']?left', explain: "Verdi: `-string left`" },
      { kind: "regex", pattern: "killall\\s+Dock", explain: "`killall Dock` for å reloade" },
    ],
  },
  {
    id: "ex-term-defaults-screenshot",
    topic: "terminal",
    level: 2,
    title: "Screenshots i egen mappe som JPG",
    prompt:
      'Skriv kommandoene som (1) setter screenshot-mappen til `~/Pictures/Screenshots`, (2) setter formatet til `jpg`, og (3) reloader SystemUIServer.',
    language: "shell",
    starter: "",
    hint: "Domain er `com.apple.screencapture`, keys er `location` og `type`. Avslutt med `killall SystemUIServer`.",
    solution:
      'defaults write com.apple.screencapture location -string "$HOME/Pictures/Screenshots"\ndefaults write com.apple.screencapture type -string "jpg"\nkillall SystemUIServer',
    explanation:
      "Begge settes med `defaults write … -string …`. `killall SystemUIServer` får screenshot-systemet til å lese endringen.",
    checks: [
      { kind: "contains", needle: "com.apple.screencapture", explain: "Domain `com.apple.screencapture`" },
      { kind: "contains", needle: "location", explain: "Sett `location`" },
      { kind: "contains", needle: "type", explain: "Sett `type`" },
      { kind: "contains", needle: "Pictures/Screenshots", explain: "Mappe `Pictures/Screenshots`" },
      { kind: "regex", pattern: '["\\\']jpg["\\\']', explain: 'Format `jpg` (i fnutter)' },
      { kind: "regex", pattern: "killall\\s+SystemUIServer", explain: "`killall SystemUIServer`" },
    ],
  },
  {
    id: "ex-term-launchd",
    topic: "terminal",
    level: 3,
    title: "launchd-jobb: kjør hver time",
    prompt:
      'Skriv plist-innholdet for en launchd-jobb med Label `com.isak.backup` som kjører `/Users/isak/bin/backup.sh` hver time (3600 sekunder). Inkluder `<?xml …>`-deklarasjonen og DOCTYPE.',
    language: "shell",
    starter:
      '<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">\n<plist version="1.0">\n<dict>\n    \n</dict>\n</plist>',
    hint:
      "Tre keys: `Label` (string), `ProgramArguments` (array av string), `StartInterval` (integer 3600).",
    solution:
      '<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">\n<plist version="1.0">\n<dict>\n    <key>Label</key><string>com.isak.backup</string>\n    <key>ProgramArguments</key>\n    <array>\n        <string>/Users/isak/bin/backup.sh</string>\n    </array>\n    <key>StartInterval</key><integer>3600</integer>\n</dict>\n</plist>',
    explanation:
      "Launchd leser plist-en og kjører `ProgramArguments` hver `StartInterval` sekund. Lagre i `~/Library/LaunchAgents/com.isak.backup.plist` og kjør `launchctl load -w …` for å aktivere.",
    checks: [
      { kind: "contains", needle: "com.isak.backup", explain: "Label må være `com.isak.backup`" },
      { kind: "contains", needle: "ProgramArguments", explain: "Trenger `ProgramArguments` key" },
      { kind: "contains", needle: "/Users/isak/bin/backup.sh", explain: "Sti til backup.sh" },
      { kind: "contains", needle: "StartInterval", explain: "Trenger `StartInterval` key" },
      { kind: "contains", needle: "3600", explain: "Intervall: 3600 sekunder" },
      { kind: "contains", needle: "<plist", explain: "Trenger `<plist>`-rot" },
    ],
  },
  {
    id: "ex-term-caffeinate",
    topic: "terminal",
    level: 1,
    title: "Forhindre sleep under et script",
    prompt: 'Kjør `./langt-script.sh` mens du hindrer macOS i å gå i idle sleep.',
    language: "shell",
    starter: "",
    hint: "`caffeinate -i KOMMANDO`.",
    solution: "caffeinate -i ./langt-script.sh",
    explanation:
      "`caffeinate -i` hindrer idle sleep så lenge kommandoen kjører. Maskinen våkner straks scriptet er ferdig.",
    checks: [
      { kind: "regex", pattern: "^\\s*caffeinate\\s+-i\\b", explain: "Bruk `caffeinate -i`" },
      { kind: "contains", needle: "./langt-script.sh", explain: "Kjør `./langt-script.sh`" },
    ],
  },
];
