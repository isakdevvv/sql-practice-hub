import { Link } from "@tanstack/react-router";
import { Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";

const STEPS = [
  { title: "Shebang og kjøring", anchor: "shebang" },
  { title: "Variabler og argumenter", anchor: "variabler" },
  { title: "if / elif / else", anchor: "if" },
  { title: "while og for", anchor: "loops" },
  { title: "Exit-koder", anchor: "exit" },
  { title: "Vanlige drift-skript", anchor: "skript" },
];

export function ShellScriptingPage() {
  return (
    <StackPageShell title="Shell scripting" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2505 · Automatisering
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Shell scripting — automatiser drift
          </h1>
          <p className="mt-3 text-muted-foreground">
            Et bash-skript er en serie kommandoer i en fil. Med variabler, betingelser og
            løkker kan du automatisere backup, deploy, logg-analyse og overvåkning.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <Link to="/drag" className="text-brand hover:underline">drag-oppgaver</Link>{" "}
              under «Shell scripting» — variabel-syntax, if/then/fi, exit-kode-match.
            </div>
          </div>
        </div>

        <CourseOutline courseId="shell-scripting" steps={STEPS} />

        <section id="shebang" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Shebang og kjøring</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Første linje i et skript heter <strong>shebang</strong> og forteller kernelen
            hvilken interpreter som skal kjøre filen.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`#!/bin/bash
# backup.sh — kopier hjemmekatalog
echo "Starter backup..."`}</pre>
          </div>
          <div className="mt-4 rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`chmod +x backup.sh    # gjør kjørbar
./backup.sh           # kjør den
bash backup.sh        # eller eksplisitt med bash`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <code>#!/usr/bin/env bash</code> er mer portabelt — det leter etter bash i
            PATH istedenfor å anta /bin/bash.
          </p>
        </section>

        <section id="variabler" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Variabler og argumenter</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`#!/bin/bash
# Variabler — INGEN mellomrom rundt =
navn="Isak"
alder=30
echo "Hei, $navn (alder: $alder)"

# Kommando-substitusjon
nå=$(date +%Y-%m-%d)
echo "I dag: $nå"

# Aritmetikk
sum=$((alder + 5))
echo "Om 5 år: $sum"

# Skript-argumenter
echo "Skript-navn:   $0"
echo "Første arg:    $1"
echo "Andre arg:     $2"
echo "Alle args:     $@"
echo "Antall args:   $#"
echo "Forrige exit:  $?"`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Quotes:</strong> bruk <code>&quot;$navn&quot;</code> (doble) for å
            ekspandere variabler. <code>&apos;$navn&apos;</code> (enkle) gir literal teksten.
          </p>
        </section>

        <section id="if" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. if / elif / else</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`#!/bin/bash
if [ -f "$1" ]; then
    echo "$1 finnes"
elif [ -d "$1" ]; then
    echo "$1 er en katalog"
else
    echo "Ikke funnet"
fi

# Tall-sammenligning
if [ "$alder" -gt 18 ]; then
    echo "Voksen"
fi

# Streng-sammenligning
if [ "$navn" = "Isak" ]; then
    echo "Hei sjef"
fi

# Kombinert med &&  / ||
[ -f /etc/passwd ] && echo "Fil finnes"
[ -d /tmp ] || mkdir /tmp`}</pre>
          </div>
          <div className="mt-4 overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-32">Test</th>
                  <th className="text-left font-semibold px-4 py-2">Sann hvis</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">-f fil</td><td className="px-4 py-3 text-muted-foreground">fil eksisterer og er vanlig fil</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">-d dir</td><td className="px-4 py-3 text-muted-foreground">dir eksisterer og er katalog</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">-z str</td><td className="px-4 py-3 text-muted-foreground">streng er tom</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">-n str</td><td className="px-4 py-3 text-muted-foreground">streng er IKKE tom</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">a = b</td><td className="px-4 py-3 text-muted-foreground">strenger like</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">a -eq b</td><td className="px-4 py-3 text-muted-foreground">tall like</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">a -gt b</td><td className="px-4 py-3 text-muted-foreground">a større enn b (tall)</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">a -lt b</td><td className="px-4 py-3 text-muted-foreground">a mindre enn b (tall)</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="loops" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. while og for</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`# for over en liste
for navn in alice bob carol; do
    echo "Hei $navn"
done

# for over filer (glob)
for fil in *.log; do
    echo "Komprimerer $fil"
    gzip "$fil"
done

# for tall (C-stil)
for ((i=1; i<=5; i++)); do
    echo "Iterasjon $i"
done

# while — så lenge betingelsen er sann
i=0
while [ $i -lt 3 ]; do
    echo $i
    i=$((i+1))
done

# while-read — bla linje for linje
while read linje; do
    echo "Fikk: $linje"
done < fil.txt`}</pre>
          </div>
        </section>

        <section id="exit" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Exit-koder</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Hver kommando returnerer en exit-kode. <code>0</code> betyr suksess, alt
            annet (1-255) er feil. Sjekk med <code>$?</code> rett etter kommandoen.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`grep mønster fil
echo $?    # 0 hvis funnet, 1 hvis ikke, 2 hvis feil

# Avslutt skript med kode
if [ -z "$1" ]; then
    echo "Bruk: $0 <filnavn>" >&2
    exit 1
fi

# Strict mode — anbefalt i alle skript
set -euo pipefail
# -e: avslutt ved første feil
# -u: feil hvis udefinert variabel
# -o pipefail: hele pipen feiler hvis ett ledd feiler`}</pre>
          </div>
          <div className="mt-4 overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-20">Kode</th>
                  <th className="text-left font-semibold px-4 py-2">Betyr (konvensjon)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">0</td><td className="px-4 py-3 text-muted-foreground">Suksess</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">1</td><td className="px-4 py-3 text-muted-foreground">Generell feil</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">2</td><td className="px-4 py-3 text-muted-foreground">Feil bruk (manglende argument o.l.)</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">126</td><td className="px-4 py-3 text-muted-foreground">Kommando ikke kjørbar</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">127</td><td className="px-4 py-3 text-muted-foreground">Kommando ikke funnet</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">130</td><td className="px-4 py-3 text-muted-foreground">Avbrutt med Ctrl+C (128 + SIGINT)</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="skript" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Vanlige drift-skript</h2>
          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Backup-skript med tidsstempel
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`#!/bin/bash
set -euo pipefail
SRC="/home/isak"
DST="/backup"
NÅ=$(date +%Y%m%d-%H%M)
tar -czf "$DST/hjem-$NÅ.tar.gz" "$SRC"
# Rydd vekk backups eldre enn 30 dager
find "$DST" -name "hjem-*.tar.gz" -mtime +30 -delete`}</pre>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Helse-sjekk for tjeneste
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`#!/bin/bash
if ! systemctl is-active --quiet nginx; then
    echo "$(date): nginx nede, restarter" >> /var/log/watchdog.log
    systemctl restart nginx
fi`}</pre>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Schedulere med cron
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`crontab -e   # rediger din crontab

# minutt time dag måned ukedag  kommando
0 3 * * *       /usr/local/bin/backup.sh
*/5 * * * *     /usr/local/bin/healthcheck.sh
0 0 * * 0       /usr/local/bin/weekly-report.sh`}</pre>
          </div>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/stack/$slug" params={{ slug: "brukere-rettigheter" }} className="text-brand hover:underline">
                Brukere og rettigheter
              </Link>
              {" "}— sett opp riktige rettigheter for skriptene dine.
            </li>
            <li>
              <Link to="/drag" className="text-brand hover:underline">Drag-oppgaver</Link>
              {" "}under «Shell scripting».
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
