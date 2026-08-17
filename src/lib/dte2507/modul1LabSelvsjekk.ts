/**
 * Selvsjekk for de to nye labene i modul 1. Kjøres med:
 *
 *     bun run src/lib/dte2507/modul1LabSelvsjekk.ts
 *
 * Jobben er den samme som i de andre lab-selvsjekkene: **bevise at fasiten er
 * det verktøyet faktisk viser.** Her betyr det å regne hver eneste fasit ut på
 * nytt fra formlene, med de samme standardverdiene simulatorene starter med.
 *
 * Det er ikke en formalitet. Fasitene er skrevet for hånd ut fra hva jeg mente
 * simulatorene ville vise, og en enkelt enhetsforveksling — µs mot ms, MB mot
 * Mbit — gir en oppgave som er umulig å svare riktig på uten at det synes ved å
 * lese koden.
 */

import {
  ANSLAG as DELAY_ANSLAG,
  DELAY_KORT,
  OPPGAVER as DELAY_OPPGAVER,
  STANDARD as D,
} from "./delayLab";
import {
  ANSLAG as BTL_ANSLAG,
  BOTTLENECK_KORT,
  OPPGAVER as BTL_OPPGAVER,
  STANDARD as B,
} from "./bottleneckLab";
import { MODUL_KORT_KILDER } from "../learn/modulKort";
import type { Oppgave } from "../lab/typer";

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

/** Godtar sjekkfunksjonen den verdien vi mener simulatoren viser? */
function fasitStemmer(oppgaver: Oppgave[], id: string, regnetUt: number, enhet: string) {
  const o = oppgaver.find((x) => x.id === id);
  if (!o) {
    sjekk(`oppgave «${id}» finnes`, false);
    return;
  }
  sjekk(
    `«${o.tittel}»: fasiten ${o.fasit} ${enhet} stemmer med formelen`,
    o.sjekk(String(regnetUt)).riktig,
    `formelen gir ${regnetUt}`,
  );
}

console.log("Modul 1 — labene på steg 3 og 4, selvsjekk\n");

/* --------------------------------------------------- steg 3: forsinkelsene */

const d_trans = D.L / D.R; // s
const d_prop = D.d / D.s; // s
const d_nodal = D.dProc + d_trans + d_prop;

fasitStemmer(DELAY_OPPGAVER, "d-trans", d_trans * 1e6, "µs");
fasitStemmer(DELAY_OPPGAVER, "d-prop", d_prop * 1e3, "ms");
fasitStemmer(DELAY_OPPGAVER, "d-nodal", d_nodal * 1e3, "ms");

// Dobbel lenkefart: propagering skal være HELT uendret, transmisjon halvert.
const d_trans2 = D.L / (2 * D.R);
fasitStemmer(DELAY_OPPGAVER, "prop-uendret", d_prop * 1e3, "ms");
fasitStemmer(DELAY_OPPGAVER, "d-trans-dobbel", d_trans2 * 1e6, "µs");
sjekk("dobbel R halverer transmisjonen", Math.abs(d_trans2 - d_trans / 2) < 1e-12);

// Trafikkintensitet: a = ρR/L, og kølengden simulatoren tegner er ρ²/(1−ρ).
const a06 = (0.6 * D.R) / D.L;
const ko08 = (0.8 * 0.8) / (1 - 0.8);
fasitStemmer(DELAY_OPPGAVER, "rho-a", a06, "pkt/s");
fasitStemmer(DELAY_OPPGAVER, "ko-08", ko08, "pakker");

// LAN-forhåndsvalget: der snur svaret, og det er hele poenget med oppgaven.
const LAN = { L: 12_000, R: 1e9, d: 100, s: 2e8 };
const lanTrans = LAN.L / LAN.R;
const lanProp = LAN.d / LAN.s;
sjekk(
  "LAN: transmisjon dominerer over propagering",
  lanTrans > lanProp,
  `${lanTrans} vs ${lanProp}`,
);
sjekk("WAN: propagering dominerer over transmisjon", d_prop > d_trans);

/* ------------------------------------------------------- steg 4: flaskehals */

const throughput = Math.min(B.R_server, B.R_core, B.R_client);
const filBits = B.filMB * 8 * 1e6;

fasitStemmer(BTL_OPPGAVER, "throughput", throughput / 1e6, "Mbps");
fasitStemmer(BTL_OPPGAVER, "overforingstid", filBits / throughput, "s");

// Oppgradert server: min() skal være helt upåvirket.
const etterServer = Math.min(40e9, B.R_core, B.R_client);
fasitStemmer(BTL_OPPGAVER, "oppgrader-server", etterServer / 1e6, "Mbps");
sjekk("serveroppgradering endrer ikke throughput", etterServer === throughput);

// Oppgradert klient: nå flytter det seg.
const etterKlient = Math.min(B.R_server, B.R_core, 1e9);
fasitStemmer(BTL_OPPGAVER, "oppgrader-klient", etterKlient / 1e6, "Mbps");
fasitStemmer(BTL_OPPGAVER, "tid-etter", filBits / etterKlient, "s");
sjekk("klientoppgradering gir ti ganger throughput", etterKlient === throughput * 10);

fasitStemmer(BTL_OPPGAVER, "deling", throughput / 4 / 1e6, "Mbps");

/* --------------------------------------------------- struktur og tilkobling */

for (const [navn, oppgaver] of [
  ["forsinkelser", DELAY_OPPGAVER],
  ["flaskehals", BTL_OPPGAVER],
] as const) {
  for (const o of oppgaver) {
    sjekk(`${navn} «${o.tittel}»: egen fasit godtas`, o.sjekk(o.fasit).riktig, o.fasit);
    sjekk(`${navn} «${o.tittel}»: åpenbart feilsvar avvises`, !o.sjekk("99999").riktig);
    sjekk(`${navn} «${o.tittel}»: har forklaring`, o.forklaring.trim().length > 40);
  }
}

for (const [navn, anslag, oppgaver] of [
  ["forsinkelser", DELAY_ANSLAG, DELAY_OPPGAVER],
  ["flaskehals", BTL_ANSLAG, BTL_OPPGAVER],
] as const) {
  for (const a of anslag) {
    sjekk(
      `${navn}: anslag «${a.id}» peker på en ekte oppgave`,
      oppgaver.some((o) => o.id === a.knyttetTil),
      a.knyttetTil,
    );
    sjekk(
      `${navn}: anslag «${a.id}» har gyldig riktig-indeks`,
      a.riktig >= 0 && a.riktig < a.valg.length,
    );
  }
}

// Kortene må inn i den FELLES køen. Glemmes det, virker sidene helt normalt —
// og kortene forsvinner ut av repetisjonen uten et eneste varsel.
for (const [kildeId, kort] of [
  ["dte2507-delay-modell", DELAY_KORT],
  ["dte2507-bottleneck-throughput", BOTTLENECK_KORT],
  ["dte2507-skjelett", null],
] as const) {
  const kilde = MODUL_KORT_KILDER.find((k) => k.id === kildeId);
  sjekk(`«${kildeId}» er registrert i den felles køen`, !!kilde);
  if (kilde && kort) {
    for (const k of kort) {
      sjekk(
        `kort «${k.id}» er med i køen`,
        kilde.kort.some((x) => x.id === k.id),
      );
    }
  }
}

console.log("\n====================================================");
console.log(`Bestått: ${bestatt}   Strøket: ${stroket}`);
console.log(stroket === 0 ? "Alt i orden." : "Noe må rettes.");
if (stroket > 0) process.exit(1);
