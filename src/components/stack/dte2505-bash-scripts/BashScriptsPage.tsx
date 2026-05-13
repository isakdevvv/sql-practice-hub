import { Link } from "@tanstack/react-router";
import { Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { BashSandbox } from "./BashSandbox";

const STEPS = [
  { title: "Variabler og sitering", anchor: "var" },
  { title: "Variabler vs miljøvariabler", anchor: "env" },
  { title: "Argumenter", anchor: "args" },
  { title: "Kontrollflyt (if/case/for/while)", anchor: "kontroll" },
  { title: "Funksjoner", anchor: "funk" },
  { title: "Pipes og omdirigering", anchor: "pipes" },
  { title: "Common gotchas", anchor: "gotchas" },
  { title: "Sandkasse", anchor: "sandkasse" },
  { title: "Fem ferdige snippets", anchor: "snippets" },
  { title: "Strenge moduser", anchor: "strenge" },
];

export function BashScriptsPage() {
  return (
    <StackPageShell title="bash-scripts" group="eksamen">
      <article className="container mx-auto px-4 py-10 max-w-3xl">
        <header className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2505 · Bash i dybden
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Bash-skript — variabler, kontroll, omdirigering
          </h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Et bash-skript skiller seg fra en kommandolinje på én viktig måte: ord-deling, sitering
            og <code className="font-mono">$VAR</code>-ekspansjon skjer hver gang. Lær reglene,
            så stopper feilene.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <a href="#sandkasse" className="text-brand hover:underline">bash-sandkassen</a>{" "}
              + drag under{" "}
              <Link to="/drag" className="text-brand hover:underline">«Shell scripting»</Link>.
            </div>
          </div>
        </header>

        <CourseOutline courseId="dte2505-bash-scripts" steps={STEPS} />

        <section id="var" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Variabler og sitering</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`navn="Per Olsen"          # INGEN mellomrom rundt =
echo $navn                # Per Olsen — to argumenter!
echo "$navn"              # Per Olsen — ett argument (riktig)
echo '$navn'              # $navn — single-quotes ekspanderer ikke

# Kommandoekspansjon
nå=$(date +%H:%M)
echo "Klokken er $nå"

# Aritmetikk
sum=$((2 + 3))
echo $sum                 # 5`}</pre>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Regel: <strong>Hvis du ikke vet hvorfor, putt &quot;&quot; rundt $VAR.</strong> 95 % av nybegynner-bugs
            i bash skyldes manglende quotes når en path inneholder mellomrom.
          </p>
        </section>

        <section id="env" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Variabel vs miljøvariabel</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Vanlig (shell-local)
              </div>
              <pre className="font-mono text-xs whitespace-pre">{`navn="Per"

# Lever bare i dette shellet.
# Subprosesser ser den IKKE.
bash -c 'echo $navn'   # tom`}</pre>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Eksportert (miljøvariabel)
              </div>
              <pre className="font-mono text-xs whitespace-pre">{`export navn="Per"

# Arves av alle child-prosesser.
bash -c 'echo $navn'   # Per
python -c 'import os
print(os.environ["navn"])'  # Per`}</pre>
            </div>
          </div>
          <div className="overflow-hidden rounded-lg border border-border mt-4">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-32">Viktig env-variabel</th>
                  <th className="text-left font-semibold px-4 py-2">Hva styrer den?</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">PATH</td><td className="px-4 py-3 text-muted-foreground">Hvor shellet leter etter binærer. Kolon-separert liste.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">HOME</td><td className="px-4 py-3 text-muted-foreground">Brukerens hjemmemappe. <code className="font-mono">cd</code> uten arg går hit.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">USER / LOGNAME</td><td className="px-4 py-3 text-muted-foreground">Innlogget brukernavn.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">SHELL</td><td className="px-4 py-3 text-muted-foreground">Path til default shell (/bin/bash).</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">PWD / OLDPWD</td><td className="px-4 py-3 text-muted-foreground">Nåværende / forrige working directory.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">LANG / LC_*</td><td className="px-4 py-3 text-muted-foreground">Språk og locale — påvirker sortering, dato-format, encoding.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">PS1</td><td className="px-4 py-3 text-muted-foreground">Prompt-streng — det du ser før du skriver kommando.</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="args" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Argumenter til skriptet</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`#!/bin/bash
# kjøring: ./demo.sh alpha bravo charlie

echo "$0"   # ./demo.sh        (skriptnavnet)
echo "$1"   # alpha            (første argument)
echo "$2"   # bravo
echo "$@"   # alpha bravo charlie  (alle, hver for seg)
echo "$*"   # "alpha bravo charlie" (alle, som én streng)
echo "$#"   # 3                (antall argumenter)
echo "$?"   # exit-kode fra forrige kommando`}</pre>
          </div>
        </section>

        <section id="kontroll" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Kontrollflyt side om side</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                if / elif / else
              </div>
              <pre className="font-mono text-xs whitespace-pre">{`if [ -f /etc/passwd ]; then
  echo "passwd finnes"
elif [ -d /etc ]; then
  echo "/etc er katalog"
else
  echo "ingen av delene"
fi`}</pre>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                case
              </div>
              <pre className="font-mono text-xs whitespace-pre">{`case "$1" in
  start) echo "start";;
  stop)  echo "stopp";;
  restart|reload)
         echo "omstart";;
  *)     echo "ukjent"; exit 1;;
esac`}</pre>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                for
              </div>
              <pre className="font-mono text-xs whitespace-pre">{`# Over fast liste
for f in *.txt; do
  echo "fil: $f"
done

# C-stil
for ((i=0; i<5; i++)); do
  echo $i
done`}</pre>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                while / until
              </div>
              <pre className="font-mono text-xs whitespace-pre">{`i=0
while [ $i -lt 3 ]; do
  echo $i
  i=$((i + 1))
done

# until = motsatt
until ping -c1 host; do
  sleep 2
done`}</pre>
            </div>
          </div>
          <div className="mt-4 overflow-hidden rounded-lg border border-border">
            <table className="w-full text-xs">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-3 py-2 w-24">Operator</th>
                  <th className="text-left font-semibold px-3 py-2">Sant når…</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border"><td className="px-3 py-2 font-mono">-f PATH</td><td className="px-3 py-2 text-muted-foreground">PATH er en vanlig fil</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2 font-mono">-d PATH</td><td className="px-3 py-2 text-muted-foreground">PATH er en katalog</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2 font-mono">-e PATH</td><td className="px-3 py-2 text-muted-foreground">PATH finnes (av en eller annen type)</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2 font-mono">-r/-w/-x PATH</td><td className="px-3 py-2 text-muted-foreground">Lesbar/skrivbar/eksekverbar av oss</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2 font-mono">-z STR</td><td className="px-3 py-2 text-muted-foreground">STR er tom</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2 font-mono">-n STR</td><td className="px-3 py-2 text-muted-foreground">STR er IKKE tom</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2 font-mono">a = b</td><td className="px-3 py-2 text-muted-foreground">Strenger like</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2 font-mono">a != b</td><td className="px-3 py-2 text-muted-foreground">Strenger forskjellige</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2 font-mono">a -eq b</td><td className="px-3 py-2 text-muted-foreground">Tall like (-ne, -lt, -gt, -le, -ge)</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="funk" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Funksjoner og «returverdi»</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Exit-kode (0–255)
              </div>
              <pre className="font-mono text-xs whitespace-pre">{`er_root() {
  [ "$EUID" -eq 0 ]
}

if er_root; then
  echo "er root"
else
  echo "ikke root"
fi`}</pre>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Returnere data via stdout
              </div>
              <pre className="font-mono text-xs whitespace-pre">{`greet() {
  local navn="$1"
  echo "Hei, $navn"   # stdout
}

melding=$(greet "Per")
echo "$melding"
# → Hei, Per`}</pre>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            <strong>Bash-funksjoner returnerer KUN exit-koder (0–255), ikke verdier.</strong>{" "}
            <code className="font-mono">local</code> hindrer lekkasje til global scope. For
            «output»: skriv til stdout og fang med <code className="font-mono">$(funk args)</code>.
          </p>
        </section>

        <section id="pipes" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Pipes og omdirigering</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`cmd > fil           # stdout → fil (overskriv)
cmd >> fil          # stdout → fil (append)
cmd 2> feil.log     # stderr → fil
cmd > all.log 2>&1  # stdout OG stderr → all.log
cmd &> all.log      # samme, bash-snarvei
cmd < input.txt     # stdin fra fil

# Pipeline — stdout fra venstre blir stdin til høyre
cat /etc/passwd | grep bash | wc -l

# Lagre PIPE-resultat
linjer=$(cat /etc/passwd | wc -l)`}</pre>
            <p className="text-xs text-muted-foreground mt-2">
              <strong>File descriptors:</strong> 0 = stdin, 1 = stdout, 2 = stderr.{" "}
              <code className="font-mono">2&gt;&amp;1</code> betyr «send stderr dit stdout går nå».
            </p>
          </div>
        </section>

        <section id="gotchas" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Common gotchas — feller du falt i</h2>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-44">Skrivefeil</th>
                  <th className="text-left font-semibold px-4 py-2 w-32">Riktig</th>
                  <th className="text-left font-semibold px-4 py-2">Hva gikk galt?</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">cp $fil /backup/</td><td className="px-4 py-3 font-mono text-brand">cp &quot;$fil&quot; /backup/</td><td className="px-4 py-3 text-muted-foreground">Uten quotes splittes navn med mellomrom.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">a = 5</td><td className="px-4 py-3 font-mono text-brand">a=5</td><td className="px-4 py-3 text-muted-foreground">Mellomrom rundt = gjør bash forsøker å kjøre «a» som kommando.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">if [$a -eq 5]</td><td className="px-4 py-3 font-mono text-brand">if [ $a -eq 5 ]</td><td className="px-4 py-3 text-muted-foreground">[ er en kommando — krever mellomrom inne.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">a = `ls`</td><td className="px-4 py-3 font-mono text-brand">a=$(ls)</td><td className="px-4 py-3 text-muted-foreground">Backticks: gammel, ikke nestbar. <code className="font-mono">$(...)</code> kan nestes.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">[ $str = abc ]</td><td className="px-4 py-3 font-mono text-brand">[ &quot;$str&quot; = abc ]</td><td className="px-4 py-3 text-muted-foreground">Hvis $str er tom blir [ = abc ] som er syntaksfeil.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">[[ vs [</td><td className="px-4 py-3 font-mono text-brand">[[ ... ]]</td><td className="px-4 py-3 text-muted-foreground">[[ er bash-only men trygere: regex, &amp;&amp;, automatisk quote-håndtering.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">#!/bin/sh</td><td className="px-4 py-3 font-mono text-brand">#!/bin/bash</td><td className="px-4 py-3 text-muted-foreground">/bin/sh er ofte dash på Ubuntu — bash-isms feiler.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">while read line</td><td className="px-4 py-3 font-mono text-brand">while IFS= read -r line</td><td className="px-4 py-3 text-muted-foreground">Uten IFS= og -r trimmes whitespace og backslash tolkes.</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="sandkasse" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">8. Sandkasse — skriv et skript</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Velg en preset, eller skriv ditt eget. Mock-filsystemet inneholder noen kjente
            Linux-stier. Klikk «Run» og sammenlign mot forventet output.
          </p>
          <BashSandbox />
        </section>

        <section id="snippets" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">9. Fem ferdige snippets</h2>
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                a) Loop over filer + tilstandssjekk
              </div>
              <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`#!/bin/bash
# Komprimer alle .log-filer over 100 MB i /var/log
set -euo pipefail
for fil in /var/log/*.log; do
  storrelse=$(stat -c %s "$fil")
  if [ "$storrelse" -gt $((100 * 1024 * 1024)) ]; then
    gzip "$fil"
    echo "Komprimerte: $fil"
  fi
done`}</pre>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                b) Parse CSV linje for linje
              </div>
              <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`#!/bin/bash
# Forventet format: navn,epost,land
while IFS=',' read -r navn epost land; do
  [ "$navn" = "navn" ] && continue   # hopp over header
  echo "Sender velkomst til $navn <$epost> i $land"
done < brukere.csv`}</pre>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                c) Log-rotering med dato-stempel
              </div>
              <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`#!/bin/bash
# Roter app.log → app.log.YYYY-MM-DD, behold 7 siste
set -euo pipefail
LOG=/var/log/app.log
DAGENS=$(date +%F)
mv "$LOG" "$LOG.$DAGENS"
touch "$LOG"
chmod 640 "$LOG"
# Slett alt over 7 dager
find /var/log -name 'app.log.*' -mtime +7 -delete`}</pre>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                d) System-helse-sjekk
              </div>
              <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`#!/bin/bash
# Send slack-melding hvis disk over 90 %
set -euo pipefail
GRENSE=90
df -h --output=pcent,target | tail -n +2 | while read pct mnt; do
  pct=\${pct%\\%}
  pct=\${pct// /}
  if [ "$pct" -ge "$GRENSE" ]; then
    echo "ALARM: $mnt på $pct%"
    # curl -X POST -d "text=..." https://hooks.slack.com/...
  fi
done`}</pre>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                e) Signal-trap (rydd ved Ctrl+C)
              </div>
              <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`#!/bin/bash
TMP=$(mktemp)
ryd_opp() {
  echo "Rydder $TMP"
  rm -f "$TMP"
}
trap ryd_opp EXIT INT TERM

# ... gjør noe med $TMP ...
sleep 60`}</pre>
            </div>
          </div>
        </section>

        <section id="strenge" className="mb-6">
          <h2 className="text-xl font-semibold mb-3">10. Strenge moduser — set -e, -u, -o pipefail</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`#!/bin/bash
set -euo pipefail   # standard for "ekte" prod-skript

# -e   : avslutt umiddelbart hvis en kommando feiler
# -u   : feilen hvis en udefinert variabel brukes ($navn med skrivefeil)
# -o pipefail : hele pipelinen feiler hvis en del feiler (default er kun siste)`}</pre>
            <p className="text-xs text-muted-foreground mt-2">
              Bruk dette i alle skript du skriver. Det er forskjellen mellom «kjørte
              halvveis og lot universet brenne» og «feilet eksplisitt med en gang».
            </p>
          </div>
          <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
            <strong className="text-amber-700 dark:text-amber-400">Eksamen-felle:</strong>{" "}
            <code className="font-mono">set -e</code> stopper IKKE på alle feil — kommandoer i
            <code className="font-mono"> if</code>, <code className="font-mono">||</code>,{" "}
            <code className="font-mono">&amp;&amp;</code>, eller med eksplisitt sjekk teller ikke.
            Det er feature, ikke bug.
          </div>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Tilbake til oversikten</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte-2505" }} className="text-brand hover:underline">DTE-2505-hub</Link>
              {" "}— alle Linux/eksamens-mini-kursene.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte2505-prosesser-signaler" }} className="text-brand hover:underline">Prosesser og signaler</Link>
              {" "}— bruk traps og signal-håndtering i scripts.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "linux-cli-advanced" }} className="text-brand hover:underline">Linux-CLI advanced</Link>
              {" "}— sed, awk, find, xargs.
            </li>
            <li>
              <Link to="/drag" className="text-brand hover:underline">Drag-oppgaver</Link>{" "}
              under «Shell scripting».
            </li>
            <li>
              <Link to="/cards" className="text-brand hover:underline">Repetisjonskort</Link>{" "}
              i kategorien <em>praktisk</em>.
            </li>
          </ul>
        </div>
      </article>
    </StackPageShell>
  );
}
