/**
 * Selvsjekk for løkke-laben. Kjøres med:
 *
 *     bun run src/lib/python/lokkeLabSelvsjekk.ts
 *
 * Den viktige jobben er den samme som i nettverkslabens selvsjekk: **bevise at
 * fasiten er det verktøyet faktisk viser.** Her går det an å gjøre skikkelig.
 * I stedet for å stole på at jeg regnet riktig, kjøres hver eneste kodebit i
 * ekte Python med NØYAKTIG samme `sys.settrace`-instrumentering som sandkassen
 * bruker, og tellingene sammenlignes med fasitene.
 *
 * Det betyr at en oppgave med feil fasit stryker her, ikke hos studenten.
 *
 * Krever `python3` på maskinen. Finnes den ikke, hopper sjekken over
 * kjøringene og sier fra — resten av sjekkene går uansett.
 */

import { spawnSync } from "node:child_process";
import { ANSLAG, LOKKE_KORT, OPPGAVER } from "./lokkeLab";
import { MODUL_KORT_KILDER } from "../learn/modulKort";

let bestatt = 0;
let stroket = 0;

function sjekk(navn: string, betingelse: boolean, detalj = "") {
  if (betingelse) {
    bestatt += 1;
  } else {
    stroket += 1;
    console.log(`  STRØKET: ${navn}${detalj ? ` — ${detalj}` : ""}`);
  }
}

console.log("Løkke-laben — selvsjekk\n");

/* --------------------------------------------------- ekte Python-instrumentering */

/**
 * Samme tracer som lokkeInstrumentering.ts, skrevet ut som et frittstående
 * skript. Holdes bevisst kort og lik originalen — endres tellemåten der, må
 * den endres her, og da vil tallene under si fra.
 */
const MÅLESKRIPT = `
import sys, io, json
src = sys.stdin.read()
tellinger = {}
totalt = [0]

def spor(ramme, hendelse, arg):
    if ramme.f_code.co_filename != "<lab>":
        return None
    if hendelse == "line":
        nr = ramme.f_lineno
        tellinger[nr] = tellinger.get(nr, 0) + 1
        totalt[0] += 1
        if totalt[0] > 200000:
            raise RuntimeError("__LAB_EVIG__")
    return spor

g = {"__name__": "__main__"}
ut = io.StringIO()
gammel = sys.stdout
sys.stdout = ut
feil = None
evig = False
try:
    kode = compile(src, "<lab>", "exec")
    sys.settrace(spor)
    exec(kode, g)
except RuntimeError as e:
    if "__LAB_EVIG__" in str(e):
        evig = True
    else:
        feil = type(e).__name__ + ": " + str(e)
except BaseException as e:
    feil = type(e).__name__ + ": " + str(e)
finally:
    sys.settrace(None)
    sys.stdout = gammel

variabler = {}
for navn, verdi in g.items():
    if navn.startswith("__") or callable(verdi):
        continue
    variabler[navn] = repr(verdi)

print(json.dumps({
    "utdata": ut.getvalue(),
    "tellinger": {str(k): v for k, v in tellinger.items()},
    "variabler": variabler,
    "feil": feil,
    "aldriFerdig": evig,
}))
`;

interface Måling {
  utdata: string;
  tellinger: Record<string, number>;
  variabler: Record<string, string>;
  feil: string | null;
  aldriFerdig: boolean;
}

function harPython(): boolean {
  return spawnSync("python3", ["-c", "print(1)"], { encoding: "utf8" }).status === 0;
}

function mål(kode: string): Måling {
  const r = spawnSync("python3", ["-c", MÅLESKRIPT], { input: kode, encoding: "utf8" });
  if (r.status !== 0) throw new Error(`python3 feilet: ${r.stderr}`);
  return JSON.parse(r.stdout) as Måling;
}

/**
 * Tellingen for linja (1-basert) som inneholder `bit`.
 *
 * Merk at det MÅ være kroppen man teller, ikke «den høyeste tellingen i
 * programmet». Selve for-linja kjører én gang mer enn kroppen — den siste
 * gangen er sjekken som finner ut at sekvensen er tom. Første utgave av denne
 * sjekken brukte maksimum og påsto derfor at `range(3, 40, 6)` gir 8 runder.
 */
function tellingFor(m: Måling, kode: string, bit: string): number {
  const linjer = kode.split("\n");
  const nr = linjer.findIndex((l) => l.includes(bit)) + 1;
  if (nr === 0) throw new Error(`fant ikke «${bit}» i koden`);
  return m.tellinger[String(nr)] ?? 0;
}

const kjør = harPython();
if (!kjør) {
  console.log("  MERK: python3 ikke funnet — hopper over kjøringene.\n");
}

if (kjør) {
  // Oppgave for oppgave, med den påstanden oppgaveteksten faktisk gjør.
  const forventet: { id: string; svar: number; hvordan: (m: Måling, kode: string) => number }[] = [
    { id: "oppvarming", svar: 5, hvordan: (m, k) => tellingFor(m, k, "print(i)") },
    { id: "range-antall", svar: 6, hvordan: (m, k) => tellingFor(m, k, "print(i)") },
    { id: "while-betingelse", svar: 6, hvordan: (m, k) => tellingFor(m, k, "while n < 100") },
    { id: "break-print", svar: 6, hvordan: (m, k) => tellingFor(m, k, "print(i)") },
    { id: "continue-tell", svar: 6, hvordan: (m, k) => tellingFor(m, k, "sum = sum + t") },
    { id: "nostet", svar: 12, hvordan: (m, k) => tellingFor(m, k, "total = total + 1") },
  ];

  for (const f of forventet) {
    const o = OPPGAVER.find((x) => x.id === f.id);
    if (!o?.kode) {
      sjekk(`oppgave «${f.id}» finnes med kode`, false);
      continue;
    }
    const m = mål(o.kode);
    sjekk(`«${o.tittel}»: koden kjører uten feil`, m.feil === null, m.feil ?? "");
    const faktisk = f.hvordan(m, o.kode);
    sjekk(
      `«${o.tittel}»: fasiten ${o.fasit} er det Python faktisk teller`,
      faktisk === f.svar && String(f.svar) === o.fasit,
      `målte ${faktisk}`,
    );
  }

  // Verdien til `i` etter løkka — den eneste oppgaven som spør om en variabel.
  const iOppg = OPPGAVER.find((o) => o.id === "i-etterpa");
  if (iOppg?.kode) {
    const m = mål(iOppg.kode);
    sjekk(
      `«${iOppg.tittel}»: i er ${iOppg.fasit} etter løkka`,
      m.variabler.i === iOppg.fasit,
      `fikk ${m.variabler.i}`,
    );
  }

  // «Finn steget som gir sju runder» må ha ETT riktig svar. Er nabosteget også
  // 7 runder, er oppgaven umulig å svare presist på — og det ser man ikke ved
  // å lese den.
  const steg = OPPGAVER.find((o) => o.id === "steg-sju");
  if (steg) {
    const runderFor = (s: number) => {
      const kode = `for i in range(3, 40, ${s}):\n    print(i)`;
      return tellingFor(mål(kode), kode, "print(i)");
    };
    sjekk("«steg-sju»: steg 6 gir nøyaktig 7 runder", runderFor(6) === 7, `fikk ${runderFor(6)}`);
    sjekk(
      "«steg-sju»: svaret er entydig (5 og 7 gir noe annet)",
      runderFor(5) !== 7 && runderFor(7) !== 7,
    );
    sjekk("«steg-sju»: fasiten er 6", steg.fasit === "6");
  }

  // Den evige løkka MÅ faktisk stoppes av taket — ellers fryser sandkassen.
  const evig = OPPGAVER.find((o) => o.id === "evig-lokke");
  if (evig?.kode) {
    const m = mål(evig.kode);
    sjekk("«evig-lokke»: koden avbrytes av linjetaket", m.aldriFerdig, "den stoppet av seg selv");
    const fikset = mål(`${evig.kode}\n    n = n - 1`);
    sjekk(
      "«evig-lokke»: med n = n - 1 kjører kroppen 10 ganger",
      tellingFor(fikset, `${evig.kode}\n    n = n - 1`, "print(n)") === 10,
      `målte ${tellingFor(fikset, `${evig.kode}\n    n = n - 1`, "print(n)")}`,
    );
    sjekk("«evig-lokke»: fasiten er 10", evig.fasit === "10");
  }
}

/* ------------------------------------------------------- struktur og kobling */

for (const o of OPPGAVER) {
  sjekk(`«${o.tittel}»: fasiten godtas av sjekkfunksjonen`, o.sjekk(o.fasit).riktig);
  sjekk(`«${o.tittel}»: et åpenbart feilsvar avvises`, !o.sjekk("99999").riktig);
}

for (const a of ANSLAG) {
  sjekk(
    `anslag «${a.id}» peker på en ekte oppgave`,
    OPPGAVER.some((o) => o.id === a.knyttetTil),
    a.knyttetTil,
  );
  sjekk(`anslag «${a.id}» har gyldig riktig-indeks`, a.riktig >= 0 && a.riktig < a.valg.length);
}

const iKoen = new Set(
  MODUL_KORT_KILDER.filter((k) => k.id === "python-lokker-lab").flatMap((k) =>
    k.kort.map((x) => x.id),
  ),
);
for (const k of LOKKE_KORT) {
  sjekk(`recall-kort «${k.id}» er meldt inn i den felles køen`, iKoen.has(k.id));
}

console.log("\n====================================================");
console.log(`Bestått: ${bestatt}   Strøket: ${stroket}`);
console.log(stroket === 0 ? "Alt i orden." : "Noe må rettes.");
if (stroket > 0) process.exit(1);
