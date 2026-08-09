// ---------------------------------------------------------------------------
// Selvsjekk for den samlede kortkøen (PLAN-HOST26-MODULER.md §3.4).
//
//     bun run src/lib/learn/modulKortSelvsjekk.ts
//
// FSRS-storene lagrer i localStorage. Utenfor nettleseren finnes ikke det, så
// vi setter opp en minne-utgave FØR modulene importeres. Da kan hele køen —
// planlegging, forfall, blanding og deling av framdrift mellom modulsiden og
// køen — etterprøves uten å rendre noe.
// ---------------------------------------------------------------------------

const lager = new Map<string, string>();
(globalThis as unknown as { window: unknown }).window = {
  localStorage: {
    getItem: (n: string) => lager.get(n) ?? null,
    setItem: (n: string, v: string) => void lager.set(n, v),
    removeItem: (n: string) => void lager.delete(n),
  },
};

const { Rating } = await import("./fsrs");
const {
  MODUL_KORT_KILDER,
  alleModulKort,
  byggKortKo,
  fagMedKort,
  finnModulKort,
  forfalteKort,
  kortStatistikk,
  nyeKort,
  statistikkPerKilde,
} = await import("./modulKort");

let bestått = 0;
let strøket = 0;

function sjekk(navn: string, betingelse: boolean, detaljer = "") {
  if (betingelse) {
    bestått++;
    console.log(`  ok    ${navn}`);
  } else {
    strøket++;
    console.log(`  FEIL  ${navn}${detaljer ? `\n        ${detaljer}` : ""}`);
  }
}

function overskrift(tekst: string) {
  console.log(`\n${tekst}`);
  console.log("-".repeat(tekst.length));
}

const DAG = 24 * 60 * 60 * 1000;
const nå = Date.UTC(2026, 7, 9, 12, 0, 0);

// ---------------------------------------------------------------------------
overskrift("1. Registeret");

sjekk("minst to fag er registrert", fagMedKort().length >= 2, JSON.stringify(fagMedKort()));
sjekk("kortene har unike id-er på tvers av kildene", (() => {
  const ider = alleModulKort().map((k) => k.id);
  return new Set(ider).size === ider.length;
})());
sjekk(
  "hvert kort kan spores tilbake til fag og modul",
  alleModulKort().every((k) => k.kilde.fagKode !== "" && k.kilde.modul !== "" && k.kilde.href.startsWith("/")),
);
sjekk("alle kort har både forside og bakside i ren tekst", alleModulKort().every((k) => typeof k.forside === "string" && k.forside.length > 0 && typeof k.bakside === "string" && k.bakside.length > 0));
sjekk("finnModulKort finner et kjent kort", finnModulKort("hjs-sec-5")?.kilde.fagKode === "DTE-2505");

for (const kilde of MODUL_KORT_KILDER) {
  console.log(`        ${kilde.fagKode} · ${kilde.modul}: ${kilde.kort.length} kort  (store: ${kilde.fsrs.storageKey})`);
}
console.log(`        Til sammen: ${alleModulKort().length} kort`);

// ---------------------------------------------------------------------------
overskrift("2. Alt starter som nytt, ingenting er forfalt");

sjekk("ingen forfalte kort før noe er repetert", forfalteKort(nå).length === 0);
sjekk("alle kort ligger som nye", nyeKort().length === alleModulKort().length);
{
  const s = kortStatistikk(nå);
  sjekk("statistikken stemmer", s.totalt === alleModulKort().length && s.nye === s.totalt && s.forfalt === 0);
}

// ---------------------------------------------------------------------------
overskrift("3. Repetisjon planlegger kortet, og det kommer tilbake når det forfaller");

{
  const kort = finnModulKort("hjs-sec-5")!;
  kort.kilde.fsrs.recordReview(kort.id, Rating.Again, nå);
  const rettEtter = forfalteKort(nå);
  sjekk("«Igjen» gir et kort som er tilbake i køen med én gang eller snart", rettEtter.length <= 1);

  kort.kilde.fsrs.recordReview(kort.id, Rating.Easy, nå);
  sjekk("«Lett» tar kortet ut av dagens kø", forfalteKort(nå).every((o) => o.kort.id !== kort.id));

  const tilstand = kort.kilde.fsrs.getCardState(kort.id, nå);
  const dagerTil = (tilstand.due - nå) / DAG;
  sjekk("kortet er planlagt fram i tid", dagerTil > 0, `${dagerTil.toFixed(1)} dager`);
  sjekk(
    "kortet dukker opp igjen når det forfaller",
    forfalteKort(tilstand.due + 1000).some((o) => o.kort.id === kort.id),
  );
}

// ---------------------------------------------------------------------------
overskrift("4. Framdriften deles mellom modulsiden og den samlede køen");

{
  // Modulsiden bruker hjelpesystemerFsrs direkte. Køen skal se det samme.
  const { hjelpesystemerFsrs } = await import("../dte2505/hjelpesystemerKort");
  const kilde = MODUL_KORT_KILDER.find((k) => k.id === "dte2505-hjelpesystemer")!;
  sjekk("køen bruker modulens egen FSRS-store", kilde.fsrs === hjelpesystemerFsrs);

  // Repetert i MODULEN …
  hjelpesystemerFsrs.recordReview("hjs-tool-apropos", Rating.Again, nå);
  // … skal være synlig i KØEN.
  const iKo = forfalteKort(nå + 60 * 60 * 1000).some((o) => o.kort.id === "hjs-tool-apropos");
  sjekk("kort repetert i modulen dukker opp i den samlede køen", iKo);

  // Og motsatt: repetert via køen skal modulen se det.
  kilde.fsrs.recordReview("hjs-tool-apropos", Rating.Easy, nå);
  const modulSerDet = hjelpesystemerFsrs.getCardState("hjs-tool-apropos", nå).reps >= 2;
  sjekk("repetisjon i køen er synlig for modulen", modulSerDet);
}

// ---------------------------------------------------------------------------
overskrift("5. Køen går på tvers av fag, og kan filtreres per fag");

{
  // Gjør ett kort i hvert fag forfalt.
  const dte2505 = finnModulKort("hjs-syn-pipe")!;
  const dte2602 = finnModulKort("f1-r1")!;
  const gammelt = nå - 40 * DAG;
  dte2505.kilde.fsrs.recordReview(dte2505.id, Rating.Good, gammelt);
  dte2602.kilde.fsrs.recordReview(dte2602.id, Rating.Good, gammelt);

  const alle = forfalteKort(nå);
  const fag = new Set(alle.map((o) => o.kort.kilde.fagKode));
  sjekk("køen inneholder kort fra flere fag samtidig", fag.size >= 2, [...fag].join(", "));
  sjekk("eldste forfalte kommer først", alle.every((o, i) => i === 0 || alle[i - 1].tilstand.due <= o.tilstand.due));

  const bare2602 = forfalteKort(nå, "dte-2602");
  sjekk("fag-filteret slipper bare gjennom det ene faget", bare2602.every((o) => o.kort.kilde.fagSlug === "dte-2602") && bare2602.length > 0);

  const stat = statistikkPerKilde(nå);
  sjekk("statistikk per kilde summerer til totalen", stat.reduce((s, x) => s + x.statistikk.totalt, 0) === alleModulKort().length);
}

// ---------------------------------------------------------------------------
overskrift("6. Studiekøen blander forfalte og nye kort");

{
  // Deterministisk «stokking» så resultatet kan sjekkes.
  const ko = byggKortKo({ nå, nyePerOkt: 5, stokk: () => 0 });
  const antallNye = ko.filter((o) => o.erNytt).length;
  sjekk("køen tar med inntil taket av nye kort", antallNye === 5, String(antallNye));
  sjekk("køen inneholder også de forfalte", ko.some((o) => !o.erNytt));
  sjekk("hvert element vet hvilken modul det kom fra", ko.every((o) => o.kort.kilde.modul.length > 0));

  const uten = byggKortKo({ nå, nyePerOkt: 0, stokk: () => 0 });
  sjekk("nyePerOkt = 0 gir bare repetisjoner", uten.every((o) => !o.erNytt));
}

// ---------------------------------------------------------------------------
console.log(`\n${"=".repeat(52)}`);
console.log(`Bestått: ${bestått}   Strøket: ${strøket}`);
if (strøket > 0) {
  console.log("Selvsjekken feilet.");
  process.exit(1);
}
console.log("Alt i orden.");
