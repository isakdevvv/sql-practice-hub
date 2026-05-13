import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { BashSandbox } from "./BashSandbox";

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
        </header>

        <section className="mb-10">
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

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Argumenter til skriptet</h2>
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

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. if / then / else / fi</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`# Test-uttrykk: [ ... ] er en KOMMANDO som returnerer 0 (sant) eller 1 (usant).
# MELLOMROMMENE er obligatoriske.

if [ -f /etc/passwd ]; then
  echo "passwd finnes"
elif [ -d /etc ]; then
  echo "/etc er en katalog"
else
  echo "ingen av delene"
fi`}</pre>
            <div className="mt-3 overflow-hidden rounded-lg border border-border">
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
                  <tr className="border-t border-border"><td className="px-3 py-2 font-mono">-z STR</td><td className="px-3 py-2 text-muted-foreground">STR er tom</td></tr>
                  <tr className="border-t border-border"><td className="px-3 py-2 font-mono">-n STR</td><td className="px-3 py-2 text-muted-foreground">STR er IKKE tom</td></tr>
                  <tr className="border-t border-border"><td className="px-3 py-2 font-mono">a = b</td><td className="px-3 py-2 text-muted-foreground">Strenger like</td></tr>
                  <tr className="border-t border-border"><td className="px-3 py-2 font-mono">a != b</td><td className="px-3 py-2 text-muted-foreground">Strenger forskjellige</td></tr>
                  <tr className="border-t border-border"><td className="px-3 py-2 font-mono">a -eq b</td><td className="px-3 py-2 text-muted-foreground">Tall like (-ne, -lt, -gt, -le, -ge)</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Løkker — for og while</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`# for over fast liste
for f in *.txt; do
  echo "fil: $f"
done

# for med C-style
for ((i=0; i<5; i++)); do
  echo "$i"
done

# while
i=0
while [ $i -lt 3 ]; do
  echo "rund $i"
  i=$((i + 1))
done

# Les linjer fra fil (while + read)
while IFS= read -r linje; do
  echo "→ $linje"
done < /etc/hostname`}</pre>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Funksjoner og exit-koder</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`greet() {
  local hilsen="Hei, $1"   # local = unngå global lekkasje
  echo "$hilsen"
  return 0                  # 0 = ok, 1-255 = feil
}

greet "Per"
echo "$?"   # 0`}</pre>
            <p className="text-xs text-muted-foreground mt-2">
              <strong>Bash-funksjoner returnerer KUN exit-koder (0–255), ikke verdier.</strong>{" "}
              For å returnere data: skriv til stdout og fang med <code className="font-mono">$(funksjon args)</code>.
            </p>
          </div>
        </section>

        <section className="mb-10">
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

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Sandkasse — skriv et skript</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Velg en preset, eller skriv ditt eget. Mock-filsystemet inneholder noen kjente
            Linux-stier. Klikk «Run» og sammenlign mot forventet output.
          </p>
          <BashSandbox />
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">8. Strenge moduser — set -e, -u, -o pipefail</h2>
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
                  <div className="mt-6">
          <Link
            to="/stack/$slug"
            params={{ slug: "dte-2505" }}
            className="text-brand hover:underline inline-flex items-center gap-1 text-sm"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Tilbake til DTE-2505-hub
          </Link>
        </div>
</div>
        </section>
      </article>
    </StackPageShell>
  );
}
