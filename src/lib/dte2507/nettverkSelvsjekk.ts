/**
 * Selvsjekk for nettverksterminalen. Kjøres med:
 *
 *     bun run src/lib/dte2507/nettverkSelvsjekk.ts
 *
 * Sjekken har to jobber, og den andre er den viktige:
 *
 * 1. At kommandoene gir den utdataen vi tror.
 * 2. At **hver oppgaves fasit faktisk står i utdataen fra verktøyet oppgaven
 *    peker på.** Uten den kan en oppgave spørre etter et tall studenten aldri
 *    kan finne — og det oppdager man ikke ved å lese koden, bare ved å prøve.
 */

import { kjor } from "./nettverkKommandoer";
import { OPPGAVER } from "./nettverkOppgaver";
import { GRENSESNITT, aktivtGrensesnitt } from "./nettverkTilstand";
import { ANSLAG } from "./nettverkAnslag";
import { NETTVERK_KORT } from "./nettverkKort";
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

function utdata(linje: string): string {
  return kjor(linje).linjer.join("\n");
}

console.log("Nettverksterminal — selvsjekk\n");

/* ------------------------------------------------------- kommandoene virker */

sjekk("ifconfig viser det aktive kortets IP", utdata("ifconfig").includes("10.0.5.37"));
sjekk("ifconfig viser MAC-adressen", utdata("ifconfig").includes("a4:83:e7:2f:11:9c"));
sjekk("ifconfig markerer det frakoblede kortet", utdata("ifconfig").includes("status: inactive"));
// Invarianten er at selve adressen ikke lekker ut — ikke at ordet «Physical
// Address» er borte. Hjelpetipset nederst nevner nettopp det uttrykket, og
// skal få lov til det.
sjekk(
  "ipconfig uten /all skjuler MAC, slik ekte ipconfig",
  !utdata("ipconfig").toUpperCase().includes("A4-83-E7-2F-11-9C"),
);
sjekk(
  "ipconfig /all viser MAC med bindestrek og store bokstaver",
  utdata("ipconfig /all").includes("A4-83-E7-2F-11-9C"),
);
sjekk("ipconfig melder frakoblet kort", utdata("ipconfig").includes("Media disconnected"));

sjekk("ping uit.no får svar", utdata("ping uit.no").includes("0.0% packet loss"));
sjekk(
  "ping mot stille vert gir 100 % tap",
  utdata("ping arkiv.example.org").includes("100.0% packet loss"),
);
sjekk("ping løser navn til adresse", utdata("ping uit.no").includes("129.242.5.36"));
sjekk("ping på ukjent navn feiler pent", kjor("ping finnes.ikke").feil === true);
sjekk("ping -c styrer antall", utdata("ping -c 2 uit.no").includes("2 packets transmitted"));

sjekk("traceroute til uit.no har 6 hopp", tellHopp(utdata("traceroute uit.no")) === 6);
sjekk("traceroute viser stille ruter som * * *", utdata("traceroute uit.no").includes("* * *"));
sjekk("gatewayen er første hopp", utdata("traceroute uit.no").split("\n")[1].includes("10.0.5.1"));
sjekk("tracert bruker Windows-format", utdata("tracert uit.no").includes("Tracing route to"));
sjekk("tracert fullfører med Trace complete", utdata("tracert uit.no").includes("Trace complete."));

sjekk("nslookup viser navnetjeneren", utdata("nslookup uit.no").includes("dns-cache.uit.no"));
sjekk(
  "nslookup på alias viser canonical name",
  utdata("nslookup www.uit.no").includes("uit-no.cdn.example-edge.net"),
);
sjekk("nslookup på alias viser Aliases-linja", utdata("nslookup www.uit.no").includes("Aliases:"));
sjekk(
  "autoritativt svar mangler «Non-authoritative»",
  !utdata("nslookup uit.no").includes("Non-authoritative"),
);
sjekk(
  "cachet svar merkes «Non-authoritative»",
  utdata("nslookup www.uit.no").includes("Non-authoritative answer:"),
);
sjekk("revers-oppslag gir navn", utdata("nslookup 198.51.100.7").includes("arkiv.example.org"));
sjekk("ukjent navn gir NXDOMAIN", utdata("nslookup finnes.ikke.no").includes("NXDOMAIN"));
sjekk("uit.no har IPv6", utdata("nslookup uit.no").includes("2001:700:200:11::36"));

sjekk("netstat lister lyttende porter", utdata("netstat -l").includes("LISTENING"));
sjekk("netstat -p viser programnavn", utdata("netstat -lp").includes("sshd"));
sjekk("netstat -l skjuler etablerte", !utdata("netstat -l").includes("ESTABLISHED"));
sjekk("netstat -t filtrerer bort UDP", !utdata("netstat -t").includes("UDP"));

sjekk("ukjent kommando merkes som feil", kjor("ipconfog").feil === true);
sjekk("tom linje gir tom utdata", kjor("   ").linjer.length === 0);
sjekk("help nevner alle fem verktøy", ["ifconfig", "ping", "traceroute", "nslookup", "netstat"].every((v) => utdata("help").includes(v)));

/* ------------------------------------------ tilstanden henger sammen */

sjekk("nøyaktig ett aktivt ikke-loopback-kort", GRENSESNITT.filter((g) => g.oppe && g.slag !== "loopback").length === 1);
sjekk("det aktive kortet har både IP og MAC", Boolean(aktivtGrensesnitt().ipv4 && aktivtGrensesnitt().mac));

/* ----------------------------------- oppgavene er løsbare og fasiten stemmer */

for (const o of OPPGAVER) {
  sjekk(`«${o.tittel}»: fasiten godkjennes av sin egen sjekk`, o.sjekk(o.fasit).riktig, o.fasit);
  sjekk(`«${o.tittel}»: tomt svar avvises`, !o.sjekk("").riktig);
  sjekk(`«${o.tittel}»: åpenbart feil svar avvises`, !o.sjekk("xyzzy-42").riktig);
}

// Hver fasit må finnes i utdataen fra minst én kommando — ellers spør vi om
// noe studenten ikke kan finne fram til.
const ALL_UTDATA = [
  "ifconfig",
  "ipconfig /all",
  "ping uit.no",
  "ping arkiv.example.org",
  "traceroute uit.no",
  "traceroute arkiv.example.org",
  "nslookup uit.no",
  "nslookup www.uit.no",
  "nslookup 198.51.100.7",
  "netstat -lp",
  "netstat -p",
]
  .map(utdata)
  .join("\n");

for (const o of OPPGAVER) {
  // Tallsvar (antall hopp, antall forbindelser) telles fram av studenten og
  // står ikke som tall i utdataen. De sjekkes av tellingene over i stedet.
  if (/^\d+$/.test(o.fasit)) continue;
  sjekk(`«${o.tittel}»: fasiten finnes i utdata`, ALL_UTDATA.toLowerCase().includes(o.fasit.toLowerCase()), o.fasit);
}

// De tre telleoppgavene, regnet ut fra utdataen i stedet for fra datamodellen.
sjekk("teller: 6 hopp til uit.no", tellHopp(utdata("traceroute uit.no")) === 6);
sjekk(
  "teller: 3 svarende hopp mot arkiv.example.org",
  utdata("traceroute arkiv.example.org")
    .split("\n")
    .filter((l) => /^\s*\d+\s+\S/.test(l) && !l.includes("* * *")).length === 3,
);
sjekk(
  "teller: 4 ESTABLISHED-forbindelser",
  utdata("netstat").split("\n").filter((l) => l.includes("ESTABLISHED")).length === 4,
);

/** Antall nummererte hoppelinjer i en traceroute-utdata. */
function tellHopp(ut: string): number {
  return ut.split("\n").filter((l) => /^\s*\d+\s+\S/.test(l)).length;
}

/* -------------------------------------------- anslagene og kortene henger på */

// Et anslag som peker på en måloppgave som ikke finnes, får aldri vist fasiten
// sin — panelet venter på en oppgave som aldri kan løses. Det er usynlig i
// grensesnittet og fanges bare her.
for (const a of ANSLAG) {
  sjekk(
    `anslag «${a.id}» peker på en ekte oppgave`,
    OPPGAVER.some((o) => o.id === a.knyttetTil),
    a.knyttetTil,
  );
  sjekk(`anslag «${a.id}» har gyldig riktig-indeks`, a.riktig >= 0 && a.riktig < a.valg.length);
}

// Kortene skal ligge i den FELLES køen, ikke bare i panelet på siden. Glemmes
// registreringen, virker alt som normalt på lab-siden — og kortene forsvinner
// fra repetisjonen. Derfor sjekkes registeret, ikke bare lista.
const iKoen = new Set(
  MODUL_KORT_KILDER.filter((k) => k.id === "dte2507-nettverksverktoy").flatMap((k) =>
    k.kort.map((x) => x.id),
  ),
);
for (const k of NETTVERK_KORT) {
  sjekk(`recall-kort «${k.id}» er meldt inn i den felles køen`, iKoen.has(k.id));
}

console.log("\n====================================================");
console.log(`Bestått: ${bestatt}   Strøket: ${stroket}`);
console.log(stroket === 0 ? "Alt i orden." : "Noe må rettes.");
if (stroket > 0) process.exit(1);
