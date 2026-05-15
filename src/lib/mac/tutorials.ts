import type { MacTutorial } from "./types";

export const MAC_TUTORIALS: MacTutorial[] = [
  /* ===================================================================
   * APPLESCRIPT — BASIS
   * =================================================================== */
  {
    id: "as-hello",
    topic: "applescript-basis",
    title: "Hei AppleScript — dialoger, variabler, set",
    tagline: 'AppleScript er Apple sitt språk for å snakke med apper. Det leser nesten som engelsk.',
    takeaways: [
      "Skriv en linje, kjør den med ⌘R i Script Editor.",
      "`display dialog` er hello-world.",
      "Variabler defineres med `set x to ...`. Strenger limes med `&`.",
    ],
    sections: [
      {
        heading: "Hvor skriver du AppleScript?",
        body:
          "Åpne `Script Editor` (ligger i `/System/Applications/Utilities`). Skriv kode i editoren og trykk ▶︎ Run eller ⌘R.\n\nAlternativt: kjør AppleScript fra terminalen med `osascript -e '…'` — det kommer vi til i terminal-modulen.",
      },
      {
        heading: "Hello, world",
        body:
          "Den enkleste AppleScript-en viser en dialog. `display dialog` tar en streng og åpner en boks med OK/Cancel.",
        example: {
          language: "applescript",
          code: 'display dialog "Hei verden!"',
          runHint: "Lim inn i Script Editor og trykk ⌘R.",
        },
      },
      {
        heading: "Variabler",
        body:
          'Variabler i AppleScript settes med `set NAVN to VERDI`. Strenger settes i doble fnutter. `&` limer strenger sammen.',
        example: {
          language: "applescript",
          code:
            'set brukernavn to "Isak"\nset hilsen to "Hei, " & brukernavn & "!"\ndisplay dialog hilsen',
        },
      },
      {
        heading: "Få svar tilbake fra dialogen",
        body:
          '`display dialog ... default answer ""` legger til et tekstfelt. `text returned of result` plukker ut det brukeren skrev.',
        example: {
          language: "applescript",
          code:
            'set svar to display dialog "Hva heter du?" default answer ""\nset navn to text returned of svar\ndisplay dialog "Hei, " & navn',
        },
      },
    ],
  },
  {
    id: "as-control",
    topic: "applescript-basis",
    title: "Lister, repeat og if",
    tagline: "Loop over filer, sjekk betingelser, bygg opp resultater i en liste.",
    takeaways: [
      "Lister: `{1, 2, 3}` med `item N of liste`.",
      "`repeat with x in liste` itererer.",
      "`if … then … else if … else end if` for forgrening.",
    ],
    sections: [
      {
        heading: "Lister",
        body:
          'Lister i AppleScript bruker krøllparenteser. Hent element med `item N of liste` (1-indeksert!) eller iterer med `repeat with x in liste`.',
        example: {
          language: "applescript",
          code:
            'set frukt to {"eple", "pære", "banan"}\nrepeat with f in frukt\n    display dialog f\nend repeat',
        },
      },
      {
        heading: "Repeat N ganger",
        body:
          "`repeat N times` er en enkel teller-loop. `repeat with i from 1 to N` gir deg telleren.",
        example: {
          language: "applescript",
          code:
            'set total to 0\nrepeat with i from 1 to 10\n    set total to total + i\nend repeat\ndisplay dialog "Sum 1..10 = " & total',
        },
      },
      {
        heading: "If/else",
        body: "Bruk `if … then … else …  end if`. Sammenlign med `is equal to`, `is greater than`, eller bare `=`, `>`, `<`.",
        example: {
          language: "applescript",
          code:
            'set svar to display dialog "Tall:" default answer ""\nset n to (text returned of svar) as integer\nif n > 0 then\n    display dialog "Positiv"\nelse if n < 0 then\n    display dialog "Negativ"\nelse\n    display dialog "Null"\nend if',
        },
      },
    ],
  },

  /* ===================================================================
   * APPLESCRIPT + APPER
   * =================================================================== */
  {
    id: "as-finder",
    topic: "applescript-apper",
    title: "Styr Finder — filer, mapper, valg",
    tagline: "AppleScript sin styrke: snakke med apper. Finder er den klassiske inngangen.",
    takeaways: [
      "`tell application \"Finder\" … end tell` for å snakke med Finder.",
      "Lag mappe: `make new folder at … with properties {name:\"…\"}`.",
      "`selection` gir filene brukeren har markert.",
    ],
    sections: [
      {
        heading: "Tell-blokken",
        body:
          'For å bruke en app sine kommandoer pakker du dem inn i `tell application "AppNavn" … end tell`. Inne i blokken forstår AppleScript appens egne ord (som `selection`, `make`, `move`).',
        example: {
          language: "applescript",
          code:
            'tell application "Finder"\n    display dialog "Antall valgte filer: " & (count of selection)\nend tell',
        },
      },
      {
        heading: "Lag en mappe på skrivebordet",
        body: "`make new folder at … with properties {name:\"…\"}` lager en ny mappe. `desktop` refererer til skrivebords-mappen.",
        example: {
          language: "applescript",
          code:
            'tell application "Finder"\n    make new folder at desktop with properties {name:"Nedlastinger-arkiv"}\nend tell',
        },
      },
      {
        heading: "Flytt valgte filer til en mappe",
        body:
          "Klassisk arbeidsflyt: marker filer i Finder, kjør et script som flytter dem inn i en valgt mappe.",
        example: {
          language: "applescript",
          code:
            'tell application "Finder"\n    set mål to (choose folder with prompt "Hvor skal filene?")\n    set valgte to selection\n    repeat with f in valgte\n        move f to mål\n    end repeat\nend tell',
          runHint: "Marker noen filer i Finder først, så kjør scriptet.",
        },
      },
    ],
  },
  {
    id: "as-safari",
    topic: "applescript-apper",
    title: "Safari — URL-er, faner, JavaScript-injeksjon",
    tagline: "Hent URL-en til aktiv fane, åpne nye faner, kjør JS på siden.",
    takeaways: [
      "`URL of current tab of front window` gir adressen.",
      "`make new tab` åpner ny fane.",
      '`do JavaScript "…"` kjører JS i siden (krever "Allow JavaScript from Apple Events" i Develop-menyen).',
    ],
    sections: [
      {
        heading: "Hent URL fra aktiv fane",
        body: "`current tab of front window` er fanen som er åpen nå.",
        example: {
          language: "applescript",
          code:
            'tell application "Safari"\n    set u to URL of current tab of front window\n    display dialog u\nend tell',
        },
      },
      {
        heading: "Åpne ny fane",
        body: "Lag en fane med `make new tab` og sett URL-en på den.",
        example: {
          language: "applescript",
          code:
            'tell application "Safari"\n    tell window 1\n        set current tab to (make new tab with properties {URL:"https://uit.no"})\n    end tell\nend tell',
        },
      },
      {
        heading: "Kjør JavaScript i siden",
        body:
          "Aktiver først \"Develop ▸ Allow JavaScript from Apple Events\" i Safari-menyen. Da kan du injisere JS — f.eks. trekke ut overskrifter.",
        example: {
          language: "applescript",
          code:
            'tell application "Safari"\n    set titler to do JavaScript "Array.from(document.querySelectorAll(\'h1\')).map(h => h.innerText).join(\'\\n\')" in current tab of front window\n    display dialog titler\nend tell',
        },
      },
    ],
  },
  {
    id: "as-mail",
    topic: "applescript-apper",
    title: "Mail — send e-post fra script",
    tagline: "Bygg en melding, sett mottaker/emne/innhold, send.",
    takeaways: [
      "`make new outgoing message with properties {subject, content, visible}`.",
      "Legg til mottaker med `make new to recipient with properties {address:\"…\"}`.",
      "`send` sender meldingen.",
    ],
    sections: [
      {
        heading: "Send en e-post",
        body:
          "Mail.app må være satt opp med en konto. AppleScript-en bygger en outgoing message, legger til mottakere, og kaller `send`.",
        example: {
          language: "applescript",
          code:
            'tell application "Mail"\n    set nyMelding to make new outgoing message with properties {subject:"Hei", content:"Test fra AppleScript", visible:true}\n    tell nyMelding\n        make new to recipient with properties {address:"navn@example.com"}\n    end tell\n    send nyMelding\nend tell',
          runHint: "Sett visible:false om du vil sende uten å vise vinduet.",
        },
      },
    ],
  },

  /* ===================================================================
   * SHORTCUTS
   * =================================================================== */
  {
    id: "sc-intro",
    topic: "shortcuts",
    title: "Shortcuts — Apple sin moderne automatisering",
    tagline:
      "Shortcuts er den moderne arvtakeren etter Automator: bygg drag-and-drop, kjør fra Spotlight, Siri eller terminal.",
    takeaways: [
      "Åpne Shortcuts.app for å bygge.",
      "Hver action har input og output — du kobler dem sammen.",
      "Magic Variables: klikk på et tidligere resultat for å bruke det senere.",
      "Kjør fra terminal: `shortcuts run \"Navn\"`.",
    ],
    sections: [
      {
        heading: "Action-er og dataflyt",
        body:
          "En Shortcut er en kjede av actions. Output fra én action går inn som input til neste. Hvis du vil bruke et tidligere resultat lenger ned, klikk i input-feltet og velg Magic Variable.\n\nBåde Shortcuts og Automator er låst til macOS — men Shortcuts er det Apple satser på framover.",
      },
      {
        heading: "Bygg din første: \"Lim inn URL og åpne i Safari\"",
        body:
          "1. Åpne Shortcuts.app, klikk +.\n2. Søk etter `Get Clipboard` og dra inn.\n3. Søk etter `Open URLs` og dra inn under.\n4. Navngi snarveien `Open Clipboard URL`.\n\nKjør den med ⌘+Enter eller fra menylinjen.",
      },
      {
        heading: "Kjør fra terminal",
        body:
          "macOS leveres med `shortcuts`-kommandoen. Den lar deg liste og kjøre snarveier fra shellet — nyttig for å koble Shortcuts til andre script.",
        example: {
          language: "shell",
          code:
            "# List alle snarveier\nshortcuts list\n\n# Kjør én\nshortcuts run \"Open Clipboard URL\"\n\n# Send input via stdin\necho \"https://uit.no\" | shortcuts run \"Open Clipboard URL\"",
        },
      },
    ],
  },
  {
    id: "sc-input",
    topic: "shortcuts",
    title: "Input, output og deling — Quick Actions",
    tagline: "Få snarveier til å dukke opp i Share Sheet, Services-menyen og Finder.",
    takeaways: [
      "Sett `Receive … input from Share Sheet/Quick Actions` i sidebar.",
      "Quick Actions vises i Finder-høyreklikk og Services.",
      "Bruk `Variable` action for å lagre mellom-resultat.",
    ],
    sections: [
      {
        heading: "Tilbyr en Quick Action",
        body:
          "Klikk på (i) i toppen av en Shortcut og hak av `Use as Quick Action`. Velg `Finder` for å vise den i høyreklikk-menyen, eller `Services Menu` for å dukke opp i app-menyer.",
      },
      {
        heading: "Eksempel: \"Konverter bilder til PNG\"",
        body:
          "1. Receive `Images` from Quick Actions.\n2. Action: `Convert Image` → PNG.\n3. Action: `Save File` → velg mappe.\n\nNå kan du markere bilder i Finder, høyreklikk, Quick Actions ▸ Konverter til PNG.",
      },
    ],
  },

  /* ===================================================================
   * AUTOMATOR
   * =================================================================== */
  {
    id: "auto-intro",
    topic: "automator",
    title: "Automator — den klassiske workflow-byggeren",
    tagline:
      "Eldre enn Shortcuts, men fortsatt nyttig: spesielt Folder Actions og Quick Actions med shell-script.",
    takeaways: [
      "Workflow vs Quick Action vs Folder Action vs Application.",
      "Folder Action kjører når en fil legges i en spesifikk mappe.",
      "Run Shell Script-action lar deg bake inn bash/zsh.",
    ],
    sections: [
      {
        heading: "Velg riktig dokument-type",
        body:
          "Når du åpner Automator får du valg:\n\n- **Workflow** — kjøres bare fra Automator.\n- **Application** — en .app du dobbeltklikker på.\n- **Quick Action** — vises i Services og Finder-høyreklikk.\n- **Folder Action** — kjører automatisk når en fil legges i en mappe.\n- **Calendar Alarm** — kjører på et tidspunkt.",
      },
      {
        heading: "Folder Action: kompresser PDF-er som droppes i ~/PDFer",
        body:
          "1. Nytt dokument ▸ Folder Action.\n2. \"Folder Action receives files added to:\" → velg `~/PDFer`.\n3. Dra inn `Quartz Filter` ▸ velg `Reduce File Size`.\n4. Lagre.\n\nNå komprimeres alle PDF-er som havner i mappen automatisk.",
      },
      {
        heading: "Run Shell Script — bake inn bash",
        body:
          "Action `Run Shell Script` lar deg bake inn et bash/zsh-snutt i en workflow. `Pass input: as arguments` gjør at fil-stiene blir til `$1 $2 …`.",
        example: {
          language: "shell",
          code:
            '#!/bin/bash\nfor f in "$@"; do\n    # Legg dato på filnavnet\n    dato=$(date +%Y-%m-%d)\n    mv "$f" "${f%.*}-${dato}.${f##*.}"\ndone',
          runHint: "Pass input: as arguments. Brukes som Quick Action i Finder.",
        },
      },
    ],
  },

  /* ===================================================================
   * TERMINAL-AUTOMATISERING
   * =================================================================== */
  {
    id: "term-osascript",
    topic: "terminal",
    title: "osascript — kjør AppleScript fra shellet",
    tagline: "Lim AppleScript inn i bash-script og terminal-pipelines.",
    takeaways: [
      "`osascript -e '…'` kjører én linje.",
      "`osascript fil.scpt` kjører en lagret fil.",
      "Output fra siste uttrykk blir stdout — perfekt for piping.",
    ],
    sections: [
      {
        heading: "Engangs-script",
        body: "`osascript -e` tar en streng og kjører den som AppleScript. Bruk fnutter med varsomhet — bruk enkle fnutter rundt hele scriptet og doble inne.",
        example: {
          language: "shell",
          code:
            "osascript -e 'display notification \"Build ferdig!\" with title \"Xcode\"'",
        },
      },
      {
        heading: "Flere linjer",
        body:
          "Gjenta `-e` for hver linje, eller bruk en heredoc.",
        example: {
          language: "shell",
          code:
            "osascript <<'EOF'\ntell application \"Safari\"\n    set u to URL of current tab of front window\nend tell\nreturn u\nEOF",
        },
      },
      {
        heading: "Hent verdi inn i bash-variabel",
        body: "Bytt return-verdien direkte inn i shell-konteksten.",
        example: {
          language: "shell",
          code:
            'url=$(osascript -e \'tell application "Safari" to return URL of current tab of front window\')\necho "Aktiv URL: $url"',
        },
      },
    ],
  },
  {
    id: "term-defaults",
    topic: "terminal",
    title: "defaults — skjulte macOS-innstillinger",
    tagline: "Endre Dock, Finder, screenshot-mappe, key repeat — ting GUI-en ikke eksponerer.",
    takeaways: [
      "`defaults write DOMAIN KEY -type VERDI` skriver.",
      "`defaults read DOMAIN KEY` leser.",
      "Mange endringer krever `killall Dock` / `killall Finder` for å tre i kraft.",
    ],
    sections: [
      {
        heading: "Domains og keys",
        body:
          "Hver app har et `domain` (bundle ID). `com.apple.dock`, `com.apple.finder`, `NSGlobalDomain` (system-wide). En `key` er innstillingen.",
        example: {
          language: "shell",
          code: "defaults read com.apple.dock | head",
        },
      },
      {
        heading: "Dock til venstre, alltid synlig",
        body: "",
        example: {
          language: "shell",
          code:
            "defaults write com.apple.dock orientation -string left\ndefaults write com.apple.dock autohide -bool false\nkillall Dock",
        },
      },
      {
        heading: "Screenshots i egen mappe, som JPG",
        body: "Standard er PNG på Desktop. Endre lagrings-mappe og format.",
        example: {
          language: "shell",
          code:
            'mkdir -p ~/Pictures/Screenshots\ndefaults write com.apple.screencapture location -string "$HOME/Pictures/Screenshots"\ndefaults write com.apple.screencapture type -string "jpg"\nkillall SystemUIServer',
        },
      },
      {
        heading: "Slå av key-repeat-forsinkelse",
        body: "Lager rasende rask key repeat — nyttig for vim/editor-bruk.",
        example: {
          language: "shell",
          code:
            "defaults write NSGlobalDomain KeyRepeat -int 2\ndefaults write NSGlobalDomain InitialKeyRepeat -int 15",
          runHint: "Logg ut og inn igjen for at det skal tre i kraft.",
        },
      },
    ],
  },
  {
    id: "term-launchd",
    topic: "terminal",
    title: "launchd — kjør script på tidsplan eller ved login",
    tagline: "macOS sin cron-erstatter. Mer kraftig, men mer XML-tung.",
    takeaways: [
      "User-agents ligger i `~/Library/LaunchAgents/com.NAVN.plist`.",
      "`launchctl load -w PLIST` aktiverer.",
      "`StartInterval` (sekunder) eller `StartCalendarInterval` (cron-aktig).",
    ],
    sections: [
      {
        heading: "Plist-strukturen",
        body:
          "En launchd-jobb er en XML-fil (`.plist`). Label, hva som skal kjøres (`ProgramArguments`), og når (`StartInterval` eller `StartCalendarInterval`).",
        example: {
          language: "shell",
          code:
            '# ~/Library/LaunchAgents/com.isak.backup.plist\ncat > ~/Library/LaunchAgents/com.isak.backup.plist <<\'EOF\'\n<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">\n<plist version="1.0">\n<dict>\n    <key>Label</key>           <string>com.isak.backup</string>\n    <key>ProgramArguments</key> <array>\n        <string>/Users/isak/bin/backup.sh</string>\n    </array>\n    <key>StartInterval</key>   <integer>3600</integer>\n    <key>StandardOutPath</key> <string>/tmp/backup.log</string>\n    <key>StandardErrorPath</key><string>/tmp/backup.err</string>\n</dict>\n</plist>\nEOF',
        },
      },
      {
        heading: "Last inn, ut, sjekk",
        body: "",
        example: {
          language: "shell",
          code:
            "# Aktiver (kjør én gang etter du lager filen)\nlaunchctl load -w ~/Library/LaunchAgents/com.isak.backup.plist\n\n# Se status\nlaunchctl list | grep com.isak\n\n# Skru av\nlaunchctl unload -w ~/Library/LaunchAgents/com.isak.backup.plist",
        },
      },
      {
        heading: "Kjør kl 09:00 hver hverdag",
        body: "Bytt `StartInterval` med `StartCalendarInterval` (en dict — eller en array av dict-er for flere tider).",
        example: {
          language: "shell",
          code:
            "<key>StartCalendarInterval</key>\n<array>\n    <dict><key>Hour</key><integer>9</integer><key>Minute</key><integer>0</integer><key>Weekday</key><integer>1</integer></dict>\n    <dict><key>Hour</key><integer>9</integer><key>Minute</key><integer>0</integer><key>Weekday</key><integer>2</integer></dict>\n</array>",
        },
      },
    ],
  },
  {
    id: "term-clipboard",
    topic: "terminal",
    title: "Clipboard, lyder, og open",
    tagline: "Små verktøy som limer terminal og GUI sammen.",
    takeaways: [
      "`pbcopy` / `pbpaste` — stdin til/fra clipboard.",
      "`open` — start app eller åpne fil i default-app.",
      "`say` — text-to-speech.",
      "`caffeinate` — hindre maskinen i å sove.",
    ],
    sections: [
      {
        heading: "Clipboard",
        body: "Pipe inn for å kopiere, pipe ut for å lime.",
        example: {
          language: "shell",
          code:
            "# Kopier output av en kommando\nls -la | pbcopy\n\n# Bruk clipboard i et script\ncurrent=$(pbpaste)\necho \"Du hadde: $current\"",
        },
      },
      {
        heading: "open — slipt mellom CLI og GUI",
        body:
          "Åpne filer i default-appen, eller en spesifikk app med `-a`.",
        example: {
          language: "shell",
          code:
            "# Åpne PDF i Preview\nopen rapport.pdf\n\n# Åpne mappa i Finder\nopen .\n\n# Åpne i spesifikk app\nopen -a \"Visual Studio Code\" .\n\n# Åpne URL i default-browser\nopen https://uit.no",
        },
      },
      {
        heading: "say — text-to-speech",
        body: "Innebygd TTS — nyttig for ferdig-bygg-varsler.",
        example: {
          language: "shell",
          code:
            "say \"Build ferdig\"\n\n# Annen stemme\nsay -v Karen \"G'day mate\"\n\n# List stemmer\nsay -v '?' | head",
        },
      },
      {
        heading: "caffeinate — hindre sleep",
        body:
          "`caffeinate -i` hindrer idle sleep mens kommandoen kjører. Lim foran en lang oppgave.",
        example: {
          language: "shell",
          code: "caffeinate -i ./langt-script.sh",
        },
      },
    ],
  },
];
