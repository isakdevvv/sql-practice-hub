import { Link } from "@tanstack/react-router";
import { Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";

const STEPS = [
  { title: "sed — substitusjon og in-place", anchor: "sed" },
  { title: "awk — kolonner og BEGIN/END", anchor: "awk" },
  { title: "find — søk og -exec", anchor: "find" },
  { title: "xargs — fra stdin til argumenter", anchor: "xargs" },
  { title: "jq — JSON-prosessering", anchor: "jq" },
  { title: "grep -E vs -P, cut/sort/uniq", anchor: "grep-cut" },
  { title: "Prosess-debugging — strace, lsof, ps", anchor: "debug" },
  { title: "ss, systemctl, journalctl + skript-mønstre", anchor: "systemd" },
];

export function LinuxCliAdvancedPage() {
  return (
    <StackPageShell title="Linux-CLI advanced" group="stack">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DevOps · Phase 11.5
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Linux-CLI advanced — sed, awk, jq, debugging
          </h1>
          <p className="mt-3 text-muted-foreground">
            Du kan <code>ls</code>, <code>cd</code> og <code>grep</code> fra
            før. Her er verktøyene som gjør deg produktiv i drift: sed for
            substitusjon, awk for kolonner, find/xargs for batch-jobber, jq
            for JSON, og strace/lsof/ss når noe oppfører seg rart.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Drill:</span>{" "}
              <Link to="/drag" className="text-brand hover:underline">drag-oppgavene</Link>{" "}
              under «Linux-CLI» — sed-fyll, awk-quiz, find-match, jq-filter, strace use-case.
            </div>
          </div>
        </div>

        <CourseOutline courseId="linux-cli-advanced" steps={STEPS} />

        <section id="sed" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. sed — stream editor for substitusjon</h2>
          <p className="text-sm text-muted-foreground mb-4">
            <code>sed</code> tar input linje-for-linje og bruker
            redigerings­regler på hver linje. Brukes oftest til{" "}
            <strong>substitusjon</strong> — bytte ut tekst.
          </p>
          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`# Grunnform: s/SØK/ERSTATT/FLAGG
echo "hei verden" | sed 's/hei/hallo/'         # hallo verden

cat fil.txt | sed 's/foo/bar/'                 # første foo per linje
cat fil.txt | sed 's/foo/bar/g'                # g = global, ALLE foo per linje
cat fil.txt | sed 's/foo/bar/2'                # bare andre foo per linje
cat fil.txt | sed 's/foo/bar/gi'               # i = case-insensitive

# Bruk en annen separator når søket inneholder /
echo "/usr/local/bin" | sed 's|/usr|/opt|'     # /opt/local/bin

# Begrens til linjer som matcher et mønster:
sed '/^#/s/foo/bar/' fil.txt                   # bare på linjer som starter med #
sed -n '5,10p' fil.txt                         # print bare linje 5–10 (-n = quiet)`}</pre>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              In-place — endre filen direkte
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`# Linux:  sed -i 's/foo/bar/g' fil.txt
# macOS:  sed -i '' 's/foo/bar/g' fil.txt     ← BSD-sed krever tom backup-suffix

# Lag backup samtidig (anbefalt første gang):
sed -i.bak 's/foo/bar/g' fil.txt              # fil.txt.bak beholdes

# Rekursivt i et helt prosjekt:
grep -rl "gammel-versjon" . | xargs sed -i 's/gammel-versjon/ny-versjon/g'`}</pre>
          </div>
          <p className="text-xs text-muted-foreground">
            <strong>Hvorfor in-place er farlig:</strong> du har ingen «angre»
            uten backup. Test alltid uten <code>-i</code> først, og lag backup
            (<code>-i.bak</code>) til du stoler på regelen.
          </p>
        </section>

        <section id="awk" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. awk — kolonner, mønstre, BEGIN/END</h2>
          <p className="text-sm text-muted-foreground mb-4">
            <code>awk</code> deler hver linje i felt på whitespace (eller{" "}
            <code>-F</code>-separator). <code>$0</code> = hele linja,{" "}
            <code>$1</code> = første felt, <code>$NF</code> = siste felt.
          </p>
          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`# Plukk kolonne — print første og siste felt:
ps aux | awk '{ print $1, $NF }'

# Egendefinert separator (CSV):
awk -F, '{ print $2 }' data.csv

# Filtrer + plukk: linjer der felt 3 > 100
awk '$3 > 100 { print $1, $3 }' data.txt

# Mønster-match (regex):
awk '/ERROR/ { print $0 }' app.log            # som grep ERROR
awk '/ERROR/ { count++ } END { print count }' app.log

# Summer kolonne 5 — vanlig for å regne ut total:
awk '{ sum += $5 } END { print "total:", sum }' data.txt

# BEGIN kjører før første linje, END etter siste:
awk 'BEGIN { print "start" } { print NR, $0 } END { print "linjer:", NR }' fil.txt
#     NR = current line number, NF = number of fields`}</pre>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Reelt drifts-eksempel — top 5 IP-er i Nginx access-log
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`awk '{ ips[$1]++ } END { for (ip in ips) print ips[ip], ip }' access.log \\
  | sort -rn | head -5

# 14823 1.2.3.4
#  9214 5.6.7.8
#  7102 9.10.11.12
#  ...`}</pre>
          </div>
        </section>

        <section id="find" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. find — søk i filsystem med -exec</h2>
          <p className="text-sm text-muted-foreground mb-4">
            <code>find</code> er bunnsolid og slukende kraftig. Bygges som{" "}
            <em>uttrykk</em>: <code>find STED FILTER HANDLING</code>.
          </p>
          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`find . -name "*.log"                 # alle .log-filer rekursivt
find . -iname "README*"              # case-insensitive
find . -type f                       # bare filer
find . -type d                       # bare kataloger
find . -type l                       # bare symbolske lenker

# Tid
find . -mtime -7                     # endret siste 7 dager
find . -mtime +30                    # eldre enn 30 dager
find . -mmin -60                     # endret siste 60 minutter

# Størrelse
find . -size +100M                   # større enn 100 MB
find . -size -1k                     # mindre enn 1 KB

# Kombiner med -and (default), -or, -not, parenteser:
find . \\( -name "*.log" -or -name "*.tmp" \\) -mtime +7

# Ekskluder kataloger (PRUNE — viktig for ytelse):
find . -path ./node_modules -prune -or -name "*.js" -print`}</pre>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              -exec — kjør kommando per fil
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`# Slett alle .log-filer eldre enn 30 dager:
find /var/log/app -name "*.log" -mtime +30 -exec rm {} \\;

# {} = filnavnet, \\; = slutten på kommandoen.
# Bruk + i stedet for \\; for å batche (raskere):
find . -name "*.tmp" -exec rm {} +

# Tørrkjør først — bekreft hva som ville skjedd:
find . -name "*.tmp" -mtime +30 -print

# Endre permissions:
find /var/www -type d -exec chmod 755 {} +
find /var/www -type f -exec chmod 644 {} +`}</pre>
          </div>
        </section>

        <section id="xargs" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. xargs — fra stdin til argumenter</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Noen kommandoer (eks. <code>rm</code>, <code>mv</code>) tar
            argumenter på kommandolinja, ikke stdin. <code>xargs</code>{" "}
            konverterer linjer fra stdin til argumenter.
          </p>
          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`# Uten xargs — fungerer ikke:
echo "fil1.txt fil2.txt" | rm           # rm leser ikke stdin

# Med xargs:
echo "fil1.txt fil2.txt" | xargs rm     # rm fil1.txt fil2.txt

# Vanlig mønster — find + xargs:
find . -name "*.tmp" | xargs rm

# Problem: filnavn med mellomrom eller newlines bryter dette.
# Løsning: -print0 (NUL-separator) + -0:
find . -name "*.tmp" -print0 | xargs -0 rm

# Begrens antall argumenter per kall:
find . -name "*.log" | xargs -n 1 gzip      # én fil per gzip-kall
# Parallellisér:
find . -name "*.log" | xargs -P 4 -n 1 gzip # 4 prosesser i parallell

# Eksplisitt plassholder med -I:
find . -name "*.bak" | xargs -I {} mv {} /tmp/backups/`}</pre>
          </div>
          <p className="text-xs text-muted-foreground">
            <strong>find -exec vs xargs:</strong> <code>find -exec ... +</code>{" "}
            er nesten alltid det enkleste valget. <code>xargs</code> er
            nyttig når input ikke kommer fra find (eks. <code>grep -l</code>{" "}
            eller et script).
          </p>
        </section>

        <section id="jq" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. jq — JSON som strøm</h2>
          <p className="text-sm text-muted-foreground mb-4">
            <code>jq</code> er <code>sed/awk</code> for JSON. Filtre består
            av piper, akkurat som shell.
          </p>
          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`echo '{"name":"isak","age":29}' | jq '.'           # pretty-print
echo '{"name":"isak","age":29}' | jq '.name'      # "isak"
echo '{"name":"isak","age":29}' | jq -r '.name'   # isak (raw, ingen quotes)

# Array — alle elementer:
curl -s api/users | jq '.[] | .email'

# Filter + plukk felt:
jq '.[] | select(.active == true) | {id, name}' users.json

# Map en array til et nytt array:
jq '[.[] | {id, email}]' users.json

# Konstanter, beregninger:
jq '.users | length' data.json
jq '[.users[].age] | add / length' data.json      # snitt-alder

# CSV ut:
jq -r '.[] | [.id, .name, .email] | @csv' users.json`}</pre>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Reelt — finn 5xx-svar i en JSON-log
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`cat app.log.json \\
  | jq -c 'select(.level=="error" and .status >= 500) | {ts, path, status, msg}' \\
  | head -20

# -c = compact (én per linje)`}</pre>
          </div>
        </section>

        <section id="grep-cut" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. grep -E vs -P, cut/sort/uniq</h2>

          <div className="overflow-x-auto rounded-lg border border-border mb-4">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-24">Flagg</th>
                  <th className="text-left font-semibold px-4 py-2">Regex-dialekt</th>
                  <th className="text-left font-semibold px-4 py-2">Hvorfor</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">grep</td><td className="px-4 py-3 text-muted-foreground">BRE — basic</td><td className="px-4 py-3 text-muted-foreground">Default. <code>(...)</code> og <code>+</code> krever <code>\\</code>.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">grep -E</td><td className="px-4 py-3 text-muted-foreground">ERE — extended</td><td className="px-4 py-3 text-muted-foreground">Det folk regner med. <code>(a|b)+</code> funker uten escapes.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">grep -P</td><td className="px-4 py-3 text-muted-foreground">PCRE — Perl</td><td className="px-4 py-3 text-muted-foreground">Lookahead, <code>\\d</code>, non-greedy. GNU-grep. Ikke alltid tilgjengelig (macOS, BusyBox).</td></tr>
              </tbody>
            </table>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`grep -E '^(ERROR|WARN)' app.log         # linjer som starter med ERROR eller WARN
grep -P '\\d{3}-\\d{4}'                  # PCRE — siffer-mønster
grep -c "ERROR" app.log                 # bare antall matches
grep -v "DEBUG" app.log                 # invert — alt UNNTATT
grep -i "error" app.log                 # case-insensitive
grep -r "TODO" src/                     # rekursivt i katalog
grep -l "import os" *.py                # bare filnavn som matcher
grep -B 2 -A 2 "ERROR" app.log          # 2 linjer kontekst før/etter`}</pre>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              cut / sort / uniq — den klassiske pipelinen
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`# cut — plukk kolonne(r) på separator:
cut -d, -f2,4 data.csv                  # felt 2 og 4 fra CSV
cut -c1-10 fil.txt                      # tegn 1–10 per linje

# sort — sortér linjer:
sort fil.txt                            # alfabetisk
sort -n fil.txt                         # numerisk
sort -rn fil.txt                        # numerisk, descending
sort -k2 fil.txt                        # sortér på felt 2
sort -u fil.txt                         # unike (= sort | uniq)

# uniq — fjern duplikater (BARE påfølgende!):
sort fil.txt | uniq                     # alltid sort FØRST
sort fil.txt | uniq -c                  # tell forekomster
sort fil.txt | uniq -c | sort -rn       # mest frekvente øverst

# Hele pipelinen — top 10 hyppigste linjer i en log:
cat access.log | awk '{ print $7 }' | sort | uniq -c | sort -rn | head -10`}</pre>
          </div>
        </section>

        <section id="debug" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Prosess-debugging — strace, lsof, ps, top</h2>

          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              strace — hvilke syscalls gjør prosessen?
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`strace ./app                          # alle syscalls
strace -f ./app                       # følg child-prosesser også
strace -p 1234                        # attach til kjørende prosess

# Filtrér på syscall-grupper:
strace -e trace=file ./app            # bare file-syscalls (open, read, ...)
strace -e trace=network ./app         # bare nettverk

# Tell hvor mange syscalls av hver type:
strace -c ./app                       # "1234 open, 8 fork, ..." ved slutt

# Use-case: "Hvorfor finner ikke appen config-filen?"
strace -e openat ./app 2>&1 | grep config
# openat(AT_FDCWD, "/etc/app/config.yml", O_RDONLY) = -1 ENOENT
# ← den leter i feil sti`}</pre>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              lsof — hvilke filer/sockets bruker prosessen?
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`lsof -p 1234                          # alt prosessen har åpent
lsof /var/log/app.log                 # hvem bruker denne filen?
lsof -i :8080                         # hvem lytter på port 8080?
lsof -iTCP -sTCP:LISTEN -P -n         # alle lyttende TCP-sockets

# Use-case: "rm slettet filen, men disken er fortsatt full"
lsof | grep deleted                   # prosess som holder en slettet fil åpen
# → start den prosessen på nytt for å frigjøre inode-en`}</pre>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              ps / top / htop — øyeblikksbilde og live
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`ps auxf                               # tre-visning av prosesser
ps -eo pid,ppid,user,cmd,%cpu,%mem --sort=-%mem | head    # topp minne-spisere
pgrep -fa nginx                       # finn pid + full kommando

top                                   # interaktiv (M = sortér på mem, P = cpu)
htop                                  # penere, mer leselig

# Per-prosess detaljer:
cat /proc/1234/status                 # state, RSS, threads, ...
cat /proc/1234/cmdline | tr '\\0' ' '  # full kommando-linje
ls -l /proc/1234/fd/                  # alle åpne file descriptors`}</pre>
          </div>
        </section>

        <section id="systemd" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">8. ss, systemctl, journalctl + skript-mønstre</h2>

          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              ss — moderne avløser for netstat
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`ss -tulpn                             # T/U-DP, L-isten, P-rosess, N-umeric
# Vis hva som lytter, hvilken prosess, hvilken port — uten å løse DNS.

ss -tan                               # alle TCP-sockets
ss -s                                 # statistikk (etablerte, time-wait, ...)
ss state established '( dport = :443 or sport = :443 )'`}</pre>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              systemctl + journalctl
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`systemctl status nginx
systemctl start  nginx
systemctl stop   nginx
systemctl restart nginx
systemctl reload nginx                # SIGHUP — re-les config uten nedetid
systemctl enable  nginx               # autostart ved boot
systemctl disable nginx
systemctl daemon-reload               # etter at du har endret en .service-fil

systemctl list-units --failed         # hva har feilet?
systemctl list-unit-files             # alle tjenester (enabled/disabled)

journalctl -u nginx -f                # følg log for én tjeneste (-f = follow)
journalctl -u nginx --since "1 hour ago"
journalctl -u nginx --since today --priority=err
journalctl -b                         # logs siden siste boot
journalctl -k                         # kernel ring buffer (dmesg-stil)`}</pre>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Vanlige bash-skript-mønstre
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`#!/usr/bin/env bash
set -euo pipefail            # -e: stopp ved feil
                             # -u: ukjent variabel = feil
                             # -o pipefail: pipe feiler hvis ledd feiler

# Argumenter
if [ $# -lt 1 ]; then
  echo "Bruk: $0 <miljø>" >&2
  exit 1
fi
ENV="$1"

# Default-verdi om variabel er tom:
PORT="\${PORT:-8000}"

# Trap — kjør opprydding selv ved feil/Ctrl+C:
TMPDIR=$(mktemp -d)
trap 'rm -rf "$TMPDIR"' EXIT

# Looper med null-separator (trygt for filnavn):
find . -name "*.log" -print0 | while IFS= read -r -d '' f; do
  echo "Behandler $f"
done

# Kommando-utgang fanges i variabel:
LATEST=$(ls -t *.log | head -1)

# Kondisjonell kjøring:
command -v jq >/dev/null 2>&1 || { echo "jq mangler — installer det." >&2; exit 1; }`}</pre>
          </div>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/stack/$slug" params={{ slug: "shell-scripting" }} className="text-brand hover:underline">
                Shell scripting
              </Link>
              {" "}— større skript, funksjoner, debugging.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "docker" }} className="text-brand hover:underline">
                Docker
              </Link>
              {" "}— pakk verktøyene over inn i et image.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "git-dyp" }} className="text-brand hover:underline">
                Git-dyp
              </Link>
              {" "}— samme «scriptable workflow»-tankegang, men i Git.
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
