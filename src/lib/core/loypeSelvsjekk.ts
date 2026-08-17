/**
 * Selvsjekk for løypene. Kjøres med:
 *
 *     bun run src/lib/core/loypeSelvsjekk.ts
 *
 * Grunnen til at den finnes: en løype som peker på en slug som ikke er
 * registrert, gir ingen feilmelding noe sted. «Neste»-knappen ser helt normal
 * ut, og så lander studenten på 404. Det skjedde under byggingen av denne
 * piloten — lenka til modultabellen pekte på `dte2507-moduler`, som ikke er en
 * rute i det hele tatt; tabellen rendres inne på `dte2507-lag`.
 *
 * Sjekken importerer sideregisteret, noe `loype.ts` med vilje IKKE gjør (det
 * ville laget en importsykel gjennom skallet). Her er det trygt — dette er et
 * frittstående skript, ikke noe som lastes av en side.
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { LOYPER } from "./loype";
import { getTrinnBySlug } from "../stack/content";

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

console.log("Løyper — selvsjekk\n");

sjekk("det finnes minst én løype", LOYPER.length > 0);

for (const loype of LOYPER) {
  // Ett steg er lov. Modul 6 har bare én side om trådløst i appen, og
  // alternativet ville vært at modulen er det eneste stedet i faget uten en vei
  // inn. Hullet står i stedet skrevet på modulsiden.
  sjekk(
    `«${loype.tittel}» har minst ett steg`,
    loype.steg.length >= 1,
    `${loype.steg.length} steg`,
  );

  // Modulsiden løypa lenker tilbake til må selv være en registrert rute.
  const modulSlug = loype.href.replace("/stack/", "");
  sjekk(`«${loype.tittel}»: modulsiden ${modulSlug} er registrert`, !!getTrinnBySlug(modulSlug));

  const settSlugs = new Set<string>();
  for (const [i, steg] of loype.steg.entries()) {
    const trinn = getTrinnBySlug(steg.slug);
    sjekk(`steg ${i + 1} «${steg.slug}» er en registrert side`, !!trinn);

    // En stub har ingen innhold å gå til — en «neste»-knapp dit er en blindvei.
    if (trinn) {
      sjekk(
        `steg ${i + 1} «${steg.slug}» er ferdig (ikke stub)`,
        trinn.status === "ready",
        trinn.status,
      );
      sjekk(
        `steg ${i + 1}: tittelen i løypa stemmer med sidas egen`,
        steg.tittel === trinn.title,
        `løype: «${steg.tittel}» · side: «${trinn.title}»`,
      );
    }

    sjekk(`steg ${i + 1} «${steg.slug}» står bare én gang i løypa`, !settSlugs.has(steg.slug));
    settSlugs.add(steg.slug);

    sjekk(`steg ${i + 1} har en begrunnelse`, steg.hvorfor.trim().length > 20);

    // Foten rendres av StackPageShell. En side som bygger sitt eget skall får
    // derfor ingen «neste»-knapp, og kjeden stopper der — uten feilmelding,
    // uten noe som ser galt ut. Tre sider i DTE-2507 gjorde nøyaktig det, og to
    // av dem sto midt i en løype.
    const mappe = `src/components/stack/${steg.slug}`;
    if (existsSync(mappe)) {
      const brukerSkallet = readdirSync(mappe)
        .filter((f) => f.endsWith(".tsx"))
        .some((f) => readFileSync(`${mappe}/${f}`, "utf8").includes("StackPageShell"));
      sjekk(
        `steg ${i + 1} «${steg.slug}» rendrer StackPageShell (ellers ingen neste-knapp)`,
        brukerSkallet,
      );
    }
  }
}

// En side kan bare høre til ÉN løype — ellers blir «neste» tvetydig, og
// `loypeFor` velger stille den første den finner.
const antallLoyper = new Map<string, number>();
for (const loype of LOYPER) {
  for (const steg of loype.steg) {
    antallLoyper.set(steg.slug, (antallLoyper.get(steg.slug) ?? 0) + 1);
  }
}
for (const [slug, antall] of antallLoyper) {
  sjekk(`«${slug}» hører til nøyaktig én løype`, antall === 1, `står i ${antall}`);
}

console.log("\n====================================================");
console.log(`Bestått: ${bestatt}   Strøket: ${stroket}`);
console.log(stroket === 0 ? "Alt i orden." : "Noe må rettes.");
if (stroket > 0) process.exit(1);
