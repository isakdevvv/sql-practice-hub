import { useMemo, useState } from "react";
import {
  finnNode,
  lagTilstand,
  losSti,
  type ShellTilstand,
} from "@/lib/dte2505/mockShellTilstand";
import { kjorLinje, delOpp } from "@/lib/dte2505/mockShellKommandoer";

// ---------------------------------------------------------------------------
// Bash-sandkasse for DTE-2505.
//
// MIGRERT (PLAN-HOST26-MODULER.md §3.1): filsystemet og kommandoene lå
// tidligere som et flatt `Record<string, string>` her inne i komponenten, med
// hardkodede kataloger og uten eiere eller rettighetsbits. Nå kjører sandkassen
// mot den delte tilstandsmaskinen i src/lib/dte2505/mockShell*.ts, den samme
// som måloppgavene bruker. Gevinsten er konkret:
//
//   - `ls -l` viser ekte rettighetsstrenger, eier og gruppe
//   - chmod, chown, umask, mkdir, touch, cp, mv og rm virker og endrer tilstand
//   - «Filsystemet etterpå»-ruta under viser hva skriptet FAKTISK gjorde,
//     ikke bare hva det skrev ut
//
// Komponenten tolker fortsatt selv kontrollflyten (if/else/fi og for/do/done),
// fordi det er skriptsyntaks og ikke filsystemtilstand. Alt som er én
// kommandolinje sendes videre til motoren.
// ---------------------------------------------------------------------------

/** Bygger utgangstilstanden på nytt for hver kjøring, så skript kan kjøres om igjen. */
function nyTilstand(): ShellTilstand {
  return lagTilstand({
    arbeidskatalog: "/home/isak",
    filer: [
      {
        sti: "/etc/passwd",
        type: "fil",
        eier: "root",
        gruppe: "root",
        mode: 0o644,
        innhold:
          "root:x:0:0:root:/root:/bin/bash\nisak:x:1000:1000:Isak:/home/isak:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\n",
      },
      { sti: "/etc/hostname", type: "fil", eier: "root", gruppe: "root", mode: 0o644, innhold: "lab-server\n" },
      { sti: "/etc/shadow", type: "fil", eier: "root", gruppe: "shadow", mode: 0o640, innhold: "root:!:19000:0:99999:7:::\n" },
      {
        sti: "/home/isak/todo.txt",
        type: "fil",
        mode: 0o644,
        innhold: "[ ] kjøp brød\n[x] lever oblig\n[ ] vask kjøkken\n",
      },
      {
        sti: "/home/isak/notater.md",
        type: "fil",
        mode: 0o644,
        innhold: "# Notater\n- bash er rart\n- chmod 755 er det samme som rwxr-xr-x\n",
      },
      { sti: "/home/isak/rydd.sh", type: "fil", mode: 0o644, innhold: "#!/bin/bash\necho rydder\n" },
      {
        sti: "/var/log/sys.log",
        type: "fil",
        eier: "root",
        gruppe: "root",
        mode: 0o644,
        innhold: "boot ok\nservice nginx start\nservice nginx ok\nbruker isak logget inn\n",
      },
    ],
  });
}

// ---------------------------------------------------------------------------
// Testuttrykk: [ -f fil ], [ -d katalog ], [ "$a" = "$b" ], [ -z "$s" ], tall
// ---------------------------------------------------------------------------

function evalBetingelse(uttrykk: string, t: ShellTilstand): boolean {
  const inner = uttrykk
    .trim()
    .replace(/^\[\[?\s*/, "")
    .replace(/\s*\]\]?$/, "")
    .trim();
  const ord = delOpp(inner, t.miljo).map((tok) => tok.tekst);

  if (ord[0] === "-f" && ord[1] != null) {
    const node = finnNode(t, losSti(t, ord[1]));
    return node?.type === "fil";
  }
  if (ord[0] === "-d" && ord[1] != null) {
    const node = finnNode(t, losSti(t, ord[1]));
    return node?.type === "katalog";
  }
  if (ord[0] === "-e" && ord[1] != null) return finnNode(t, losSti(t, ord[1])) != null;
  if (ord[0] === "-r" && ord[1] != null) {
    // Leserett — nå et ekte spørsmål, siden filene har rettighetsbits.
    const node = finnNode(t, losSti(t, ord[1]));
    return node != null && (node.mode & 0o444) !== 0;
  }
  if (ord[0] === "-x" && ord[1] != null) {
    const node = finnNode(t, losSti(t, ord[1]));
    return node != null && (node.mode & 0o111) !== 0;
  }
  if (ord[0] === "-z") return (ord[1] ?? "") === "";
  if (ord[0] === "-n") return (ord[1] ?? "") !== "";

  if (ord.length === 3) {
    const [a, op, b] = ord;
    switch (op) {
      case "=":
      case "==":
        return a === b;
      case "!=":
        return a !== b;
      case "-eq":
        return Number(a) === Number(b);
      case "-ne":
        return Number(a) !== Number(b);
      case "-lt":
        return Number(a) < Number(b);
      case "-gt":
        return Number(a) > Number(b);
      case "-le":
        return Number(a) <= Number(b);
      case "-ge":
        return Number(a) >= Number(b);
    }
  }
  return false;
}

// ---------------------------------------------------------------------------
// Skripttolkeren: kontrollflyt her, kommandoer i motoren
// ---------------------------------------------------------------------------

interface Kjøreresultat {
  linjer: string[];
  tilstand: ShellTilstand;
  /** Linjer skriptet ikke forsto — vises ærlig i stedet for å ignoreres. */
  uforstått: string[];
}

function kjørSkript(kildekode: string): Kjøreresultat {
  const t = nyTilstand();
  const ut: string[] = [];
  const uforstått: string[] = [];

  type Blokk =
    | { slag: "if"; betingelse: boolean; then: string[]; else: string[]; iElse: boolean }
    | { slag: "for"; variabel: string; verdier: string[]; kropp: string[] };
  const stabel: Blokk[] = [];

  function kjørLinjer(linjer: string[]) {
    for (const l of linjer) kjørEn(l);
  }

  function kjørEn(rå: string) {
    const linje = rå.trim();
    if (linje === "" || linje.startsWith("#")) return;

    const åpen = stabel[stabel.length - 1];
    if (åpen) {
      // Vi samler opp linjer til blokken lukkes.
      if (linje === "fi" && åpen.slag === "if") {
        stabel.pop();
        kjørLinjer(åpen.betingelse ? åpen.then : åpen.else);
        return;
      }
      if (linje === "done" && åpen.slag === "for") {
        stabel.pop();
        for (const verdi of åpen.verdier) {
          t.miljo[åpen.variabel] = verdi;
          kjørLinjer(åpen.kropp);
        }
        return;
      }
      if (linje === "else" && åpen.slag === "if") {
        åpen.iElse = true;
        return;
      }
      if (linje === "then" || linje === "do") return;
      if (åpen.slag === "if") (åpen.iElse ? åpen.else : åpen.then).push(linje);
      else åpen.kropp.push(linje);
      return;
    }

    const ifMatch = linje.match(/^if\s+(.+?)(?:;\s*then)?$/);
    if (ifMatch && linje.startsWith("if ")) {
      stabel.push({
        slag: "if",
        betingelse: evalBetingelse(ifMatch[1], t),
        then: [],
        else: [],
        iElse: false,
      });
      return;
    }
    const forMatch = linje.match(/^for\s+([A-Za-z_][A-Za-z0-9_]*)\s+in\s+(.+?)(?:;\s*do)?$/);
    if (forMatch) {
      stabel.push({
        slag: "for",
        variabel: forMatch[1],
        verdier: delOpp(forMatch[2], t.miljo).map((tok) => tok.tekst),
        kropp: [],
      });
      return;
    }
    if (linje === "then" || linje === "do" || linje === "fi" || linje === "done" || linje === "else") return;

    for (const k of kjorLinje(t, linje)) {
      ut.push(...k.utdata, ...k.feil);
      if (k.exit === 127) uforstått.push(k.linje.trim());
    }
  }

  for (const linje of kildekode.split("\n")) kjørEn(linje);
  return { linjer: ut, tilstand: t, uforstått };
}

/** Fillisting av hjemmekatalogen etter kjøring — beviset på at tilstanden endret seg. */
function listHjemme(t: ShellTilstand): string[] {
  const ut: string[] = [];
  for (const k of kjorLinje(t, "ls -l /home/isak")) ut.push(...k.utdata, ...k.feil);
  return ut;
}

// ---------------------------------------------------------------------------

const EKSEMPLER: { navn: string; kode: string; forventet: string[] }[] = [
  {
    navn: "1. Hei med variabel",
    kode: `#!/bin/bash
navn="Isak"
echo "Hei, $navn"`,
    forventet: ["Hei, Isak"],
  },
  {
    navn: "2. If — finnes fila?",
    kode: `if [ -f /etc/passwd ]
then
  echo "Ja, finnes"
else
  echo "Nei"
fi`,
    forventet: ["Ja, finnes"],
  },
  {
    navn: "3. For-løkke",
    kode: `for f in a b c
do
  echo "fil $f"
done`,
    forventet: ["fil a", "fil b", "fil c"],
  },
  {
    navn: "4. grep og cat",
    kode: `cat /etc/hostname
grep isak /etc/passwd`,
    forventet: ["lab-server", "isak:x:1000:1000:Isak:/home/isak:/bin/bash"],
  },
  {
    navn: "5. Rettigheter (ny)",
    kode: `# Motoren har ekte rettighetsbits — se på ls -l før og etter.
ls -l rydd.sh
chmod 750 rydd.sh
ls -l rydd.sh`,
    forventet: [
      "-rw-r--r-- 1 isak     isak          24 rydd.sh",
      "-rwxr-x--- 1 isak     isak          24 rydd.sh",
    ],
  },
  {
    navn: "6. Lag og lukk en katalog (ny)",
    kode: `# Flere steg som til sammen setter opp en tilstand — som i obligene.
mkdir logg
echo "oppstart ok" > logg/dag1.txt
chmod 750 logg
cat logg/dag1.txt
ls -l`,
    forventet: [],
  },
  {
    navn: "7. umask (ny)",
    kode: `# Nye filer fødes med 666 minus umask. Kjørerett gis aldri automatisk.
umask
touch standard.txt
umask 077
touch privat.txt
ls -l standard.txt
ls -l privat.txt`,
    forventet: [],
  },
  {
    navn: "8. Tilgang nektet (ny)",
    kode: `# /etc/shadow er 640 og eies av root. Du er isak.
ls -l /etc/shadow
cat /etc/shadow`,
    forventet: [],
  },
];

export function BashSandbox() {
  const [kode, setKode] = useState(EKSEMPLER[0].kode);
  const [forventet, setForventet] = useState<string[]>(EKSEMPLER[0].forventet);
  const [resultat, setResultat] = useState<Kjøreresultat | null>(null);

  const treff = useMemo(() => {
    if (!resultat || forventet.length === 0) return null;
    return resultat.linjer.join("\n") === forventet.join("\n");
  }, [resultat, forventet]);

  function lastEksempel(i: number) {
    setKode(EKSEMPLER[i].kode);
    setForventet(EKSEMPLER[i].forventet);
    setResultat(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {EKSEMPLER.map((e, i) => (
          <button
            key={i}
            onClick={() => lastEksempel(i)}
            className="text-xs px-2.5 py-1 rounded-md border border-border hover:border-brand/40"
          >
            {e.navn}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-3 py-1.5 border-b border-border bg-muted/30 text-xs font-mono text-muted-foreground">
            skript.sh
          </div>
          <textarea
            value={kode}
            onChange={(e) => setKode(e.target.value)}
            spellCheck={false}
            className="w-full h-72 font-mono text-xs p-3 bg-background outline-none resize-none"
          />
          <div className="px-3 py-2 border-t border-border bg-muted/20 flex items-center justify-between gap-2">
            <button
              onClick={() => setResultat(kjørSkript(kode))}
              className="text-xs px-3 py-1 rounded-md bg-brand text-brand-foreground font-semibold"
            >
              ▶ Kjør mot mock-systemet
            </button>
            <span className="text-[10px] text-muted-foreground font-mono">
              du er isak, står i /home/isak
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-3 py-1.5 border-b border-border bg-muted/30 text-xs font-mono text-muted-foreground flex items-center justify-between">
            <span>utdata</span>
            {treff != null && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded ${
                  treff
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                    : "bg-rose-500/15 text-rose-700 dark:text-rose-300"
                }`}
              >
                {treff ? "Som forventet" : "Avviker"}
              </span>
            )}
          </div>
          <pre className="font-mono text-xs p-3 h-72 overflow-auto whitespace-pre-wrap">
            {resultat ? (
              resultat.linjer.length ? (
                resultat.linjer.join("\n")
              ) : (
                <span className="text-muted-foreground">(ingen utskrift)</span>
              )
            ) : (
              <span className="text-muted-foreground">(klikk Kjør)</span>
            )}
          </pre>
          {forventet.length > 0 && (
            <div className="px-3 py-2 border-t border-border bg-muted/20">
              <div className="text-[10px] text-muted-foreground mb-1">Forventet utdata:</div>
              <pre className="font-mono text-[11px] whitespace-pre-wrap">{forventet.join("\n")}</pre>
            </div>
          )}
        </div>
      </div>

      {/* Tilstanden etterpå — poenget med å bytte til tilstandsmaskinen. */}
      {resultat && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-3 py-1.5 border-b border-border bg-muted/30 text-xs font-mono text-muted-foreground">
            filsystemet etterpå: ls -l /home/isak
          </div>
          <pre className="font-mono text-[11px] p-3 overflow-auto whitespace-pre">
            {listHjemme(resultat.tilstand).join("\n")}
          </pre>
          {resultat.uforstått.length > 0 && (
            <div className="px-3 py-2 border-t border-border bg-amber-500/10 text-[11px] text-amber-800 dark:text-amber-200">
              Sandkassen kjenner ikke{" "}
              <span className="font-mono">{resultat.uforstått.join(", ")}</span>. Den later ikke som
              om de virket — utdata over er alt som faktisk skjedde.
            </div>
          )}
        </div>
      )}

      <p className="text-[11px] text-muted-foreground leading-relaxed">
        <strong>Hva sandkassen kan:</strong> variabler, <code>echo</code> med <code>&gt;</code> og{" "}
        <code>&gt;&gt;</code>, <code>ls</code> (også <code>-l</code>), <code>cd</code>,{" "}
        <code>pwd</code>, <code>mkdir</code>, <code>touch</code>, <code>cp</code>, <code>mv</code>,{" "}
        <code>rm</code>, <code>cat</code>, <code>grep</code>, <code>wc -l</code>,{" "}
        <code>chmod</code> (oktalt og symbolsk), <code>chown</code>, <code>chgrp</code>,{" "}
        <code>umask</code>, <code>sudo</code>, samt <code>if/then/else/fi</code> og{" "}
        <code>for … do … done</code>. Filene har ekte eiere, grupper og rettighetsbits, så «tilgang
        nektet» skjer på ordentlig.{" "}
        <strong>Hva den ikke kan:</strong> rør (<code>|</code>), jokertegn som{" "}
        <code>*.log</code>, <code>find</code>, <code>tar</code> og prosesskommandoer. De svarer med
        en tydelig melding i stedet for å late som om de virket.
      </p>
    </div>
  );
}
