// ---------------------------------------------------------------------------
// Selvsjekk for mock-skallet. Ren TypeScript, ingen testrammeverk, ingen React.
//
// Kjør den fra prosjektroten:
//
//     bun run src/lib/dte2505/mockShellSelvsjekk.ts
//
// Den skriver én linje per sjekk og avslutter med kode 1 hvis noe feiler, slik
// at den kan brukes som en billig portvakt før merge.
//
// De to viktigste sjekkene, altså de som beviser at §3.1 faktisk er innfridd:
//   1. FLERE GYLDIGE LØSNINGER på samme oppgave gir alle «riktig».
//   2. Et NESTEN-RIKTIG svar gir «nesten» med en melding som navngir avviket.
// ---------------------------------------------------------------------------

import {
  finnNode,
  lagTilstand,
  modeTilOktal,
  modeTilTekst,
  tolkChmod,
  typeOgModeTilTekst,
} from "./mockShellTilstand";
import { kjorAlle } from "./mockShellKommandoer";
import { MAL_OPPGAVER, oppgaveMedId, prøv } from "./mockShellOppgaver";

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

// ---------------------------------------------------------------------------
overskrift("1. Rettighetsbits og chmod-uttrykk");

sjekk("modeTilTekst(0o750) er rwxr-x---", modeTilTekst(0o750) === "rwxr-x---", modeTilTekst(0o750));
sjekk("modeTilTekst(0o2775) viser setgid som s", modeTilTekst(0o2775) === "rwxrwsr-x", modeTilTekst(0o2775));
sjekk("modeTilTekst(0o1777) viser sticky som t", modeTilTekst(0o1777) === "rwxrwxrwt", modeTilTekst(0o1777));

sjekk("chmod 750 gir 0750", tolkChmod("750", 0o644, 0o022, true).mode === 0o750);
sjekk(
  "chmod u=rwx,g=rx,o= gir samme mode som 750",
  tolkChmod("u=rwx,g=rx,o=", 0o644, 0o022, true).mode === 0o750,
  modeTilOktal(tolkChmod("u=rwx,g=rx,o=", 0o644, 0o022, true).mode),
);
sjekk("chmod g+s setter setgid", (tolkChmod("g+s", 0o770, 0o022, true).mode & 0o2000) !== 0);
sjekk("chmod +t setter sticky", (tolkChmod("+t", 0o777, 0o022, true).mode & 0o1000) !== 0);
sjekk("chmod a+x på 644 gir 755", tolkChmod("a+x", 0o644, 0o022, false).mode === 0o755);
sjekk("chmod go-rwx på 644 gir 600", tolkChmod("go-rwx", 0o644, 0o022, false).mode === 0o600);
sjekk("ugyldig uttrykk avvises", tolkChmod("u=rwq", 0o644, 0o022, false).ok === false);

// ---------------------------------------------------------------------------
overskrift("2. Kommandoene endrer tilstanden");

{
  const t = lagTilstand({ arbeidskatalog: "/home/isak" });
  kjorAlle(t, "mkdir logg");
  sjekk("mkdir lager katalog", finnNode(t, "/home/isak/logg")?.type === "katalog");

  kjorAlle(t, "echo hei > logg/dag1.txt");
  sjekk("echo > lager fil med innhold", finnNode(t, "/home/isak/logg/dag1.txt")?.innhold === "hei\n");

  kjorAlle(t, "echo igjen >> logg/dag1.txt");
  sjekk(
    "echo >> legger til",
    finnNode(t, "/home/isak/logg/dag1.txt")?.innhold === "hei\nigjen\n",
    JSON.stringify(finnNode(t, "/home/isak/logg/dag1.txt")?.innhold),
  );

  kjorAlle(t, "cp logg/dag1.txt logg/kopi.txt");
  sjekk("cp kopierer innholdet", finnNode(t, "/home/isak/logg/kopi.txt")?.innhold === "hei\nigjen\n");

  kjorAlle(t, "mv logg/kopi.txt logg/arkiv.txt");
  sjekk(
    "mv flytter og fjerner originalen",
    finnNode(t, "/home/isak/logg/arkiv.txt") != null && finnNode(t, "/home/isak/logg/kopi.txt") == null,
  );

  kjorAlle(t, "rm logg/arkiv.txt");
  sjekk("rm sletter", finnNode(t, "/home/isak/logg/arkiv.txt") == null);

  const uten = kjorAlle(t, "rm logg");
  sjekk("rm på katalog uten -r feiler", uten[0].exit !== 0, uten[0].feil.join(" "));

  kjorAlle(t, "cd logg");
  sjekk("cd endrer arbeidskatalog", t.arbeidskatalog === "/home/isak/logg");
  const pwd = kjorAlle(t, "pwd");
  sjekk("pwd skriver arbeidskatalogen", pwd[0].utdata[0] === "/home/isak/logg");

  kjorAlle(t, "cd ..");
  sjekk("cd .. går opp", t.arbeidskatalog === "/home/isak");
}

{
  const t = lagTilstand({ arbeidskatalog: "/home/isak", umask: 0o022 });
  kjorAlle(t, "touch a.txt");
  sjekk("umask 022 gir nye filer 644", (finnNode(t, "/home/isak/a.txt")!.mode & 0o7777) === 0o644);
  kjorAlle(t, "umask 077");
  kjorAlle(t, "touch b.txt");
  sjekk("umask 077 gir nye filer 600", (finnNode(t, "/home/isak/b.txt")!.mode & 0o7777) === 0o600);
  kjorAlle(t, "mkdir k");
  sjekk("umask 077 gir nye kataloger 700", (finnNode(t, "/home/isak/k")!.mode & 0o7777) === 0o700);
}

{
  const t = lagTilstand({
    arbeidskatalog: "/srv",
    filer: [
      { sti: "/srv", type: "katalog", eier: "root", gruppe: "root", mode: 0o755 },
      { sti: "/srv/hemmelig.txt", type: "fil", eier: "root", gruppe: "root", mode: 0o600, innhold: "kode\n" },
    ],
  });
  const lesing = kjorAlle(t, "cat /srv/hemmelig.txt");
  sjekk("cat på 600-fil eid av root nektes", lesing[0].exit !== 0, lesing[0].feil.join(" "));
  const somRot = kjorAlle(t, "sudo cat /srv/hemmelig.txt");
  sjekk("sudo cat leser samme fil", somRot[0].utdata[0] === "kode", JSON.stringify(somRot[0]));

  const eierskifte = kjorAlle(t, "chown isak /srv/hemmelig.txt");
  sjekk("chown uten sudo nektes", eierskifte[0].exit !== 0, eierskifte[0].feil.join(" "));
  kjorAlle(t, "sudo chown isak:studenter /srv/hemmelig.txt");
  const node = finnNode(t, "/srv/hemmelig.txt")!;
  sjekk("sudo chown setter eier og gruppe", node.eier === "isak" && node.gruppe === "studenter");
}

{
  // setgid på katalog: nye filer arver katalogens gruppe.
  const t = lagTilstand({
    arbeidskatalog: "/srv/felles",
    filer: [
      { sti: "/srv", type: "katalog", eier: "root", gruppe: "root", mode: 0o755 },
      { sti: "/srv/felles", type: "katalog", eier: "root", gruppe: "studenter", mode: 0o2777 },
    ],
  });
  kjorAlle(t, "touch delt.txt");
  sjekk(
    "setgid-katalog gir nye filer katalogens gruppe",
    finnNode(t, "/srv/felles/delt.txt")?.gruppe === "studenter",
    finnNode(t, "/srv/felles/delt.txt")?.gruppe,
  );
}

{
  // sticky bit: du kan ikke slette andres filer.
  const t = lagTilstand({
    arbeidskatalog: "/tmp",
    filer: [{ sti: "/tmp/kari.txt", type: "fil", eier: "kari", gruppe: "kari", mode: 0o666 }],
  });
  const r = kjorAlle(t, "rm /tmp/kari.txt");
  sjekk("sticky-katalog hindrer sletting av andres fil", r[0].exit !== 0, r[0].feil.join(" "));
  sjekk("filen står fortsatt der", finnNode(t, "/tmp/kari.txt") != null);
}

{
  const t = lagTilstand({
    arbeidskatalog: "/home/isak",
    filer: [{ sti: "/home/isak/notat.txt", type: "fil", mode: 0o640, innhold: "en\nto\n" }],
  });
  const l = kjorAlle(t, "ls -l notat.txt");
  sjekk(
    "ls -l viser rettighetsstrengen",
    l[0].utdata[0].startsWith("-rw-r-----"),
    l[0].utdata[0],
  );
  sjekk("typeOgModeTilTekst på katalog starter med d", typeOgModeTilTekst(finnNode(t, "/home/isak")!).startsWith("d"));

  const ukjent = kjorAlle(t, "tar -czf arkiv.tar.gz notat.txt");
  sjekk("ikke-implementert kommando sier fra i stedet for å late som", ukjent[0].exit === 127, ukjent[0].feil.join(" "));

  const kjede = kjorAlle(t, "cd /finnesikke && touch skalikkeskje.txt");
  sjekk("&& stopper når første ledd feiler", finnNode(t, "/home/isak/skalikkeskje.txt") == null, JSON.stringify(kjede));
}

// ---------------------------------------------------------------------------
overskrift("3. Måltilstand-sjekken godtar ALLE veier til målet");

{
  const oppgave = oppgaveMedId("ms-logg-750")!;
  for (const svar of ["chmod 750 logg", "chmod u=rwx,g=rx,o= logg", "chmod 0750 logg", "chmod g-w,o-rwx logg"]) {
    const r = prøv(oppgave, svar);
    sjekk(`«${svar}» gir riktig`, r.resultat.utfall === "riktig", `${r.resultat.utfall}: ${r.resultat.melding}`);
  }
}

{
  const oppgave = oppgaveMedId("ms-skript-kjorbart")!;
  for (const svar of ["chmod 755 rydd.sh", "chmod a+x rydd.sh", "chmod u=rwx,go=rx rydd.sh", "chmod +x rydd.sh"]) {
    const r = prøv(oppgave, svar);
    sjekk(`«${svar}» gir riktig`, r.resultat.utfall === "riktig", `${r.resultat.utfall}: ${r.resultat.melding}`);
  }
}

{
  const oppgave = oppgaveMedId("ms-delt-setgid")!;
  for (const svar of ["chmod 2770 /srv/felles", "chmod g+s /srv/felles", "chmod g+s felles"]) {
    const r = prøv(oppgave, svar);
    sjekk(`«${svar}» gir riktig`, r.resultat.utfall === "riktig", `${r.resultat.utfall}: ${r.resultat.melding}`);
  }
}

// ---------------------------------------------------------------------------
overskrift("4. Nesten-riktig gir «nesten» med en presis melding");

{
  const oppgave = oppgaveMedId("ms-logg-750")!;
  const r = prøv(oppgave, "chmod 755 logg");
  sjekk("chmod 755 der målet er 750 gir «nesten»", r.resultat.utfall === "nesten", r.resultat.melding);
  sjekk(
    "meldingen sier hvilken mode katalogen faktisk fikk",
    r.resultat.melding.includes("755"),
    r.resultat.melding,
  );
  sjekk(
    "meldingen navngir at gruppen fikk skriverett den ikke skulle hatt",
    r.resultat.melding.includes("andre") && r.resultat.melding.includes("lese"),
    r.resultat.melding,
  );
  console.log(`        → «${r.resultat.melding}»`);
}

{
  const oppgave = oppgaveMedId("ms-logg-750")!;
  const r = prøv(oppgave, "chmod 770 logg");
  sjekk("chmod 770 gir «nesten» og nevner gruppens skriverett", r.resultat.utfall === "nesten" && r.resultat.melding.includes("skriverett"), r.resultat.melding);
  console.log(`        → «${r.resultat.melding}»`);
}

{
  const oppgave = oppgaveMedId("ms-hemmelig-600")!;
  const r = prøv(oppgave, "chmod 640 notat.txt");
  sjekk("chmod 640 der målet er 600 gir «nesten»", r.resultat.utfall === "nesten", r.resultat.melding);
  console.log(`        → «${r.resultat.melding}»`);
}

{
  const oppgave = oppgaveMedId("ms-eierskifte")!;
  const utenSudo = prøv(oppgave, "chown isak:studenter /srv/rapport.txt");
  sjekk(
    "chown uten sudo gir ikke riktig, og skallets feilmelding er med",
    utenSudo.resultat.utfall !== "riktig" && utenSudo.resultat.melding.includes("sudo"),
    utenSudo.resultat.melding,
  );
  const bareEier = prøv(oppgave, "sudo chown isak /srv/rapport.txt");
  sjekk("bare eier satt gir «nesten» som nevner gruppen", bareEier.resultat.utfall === "nesten" && bareEier.resultat.melding.includes("gruppen"), bareEier.resultat.melding);
  console.log(`        → «${bareEier.resultat.melding}»`);
}

// ---------------------------------------------------------------------------
overskrift("5. Flerstegsoppgavene");

{
  const oppgave = oppgaveMedId("ms-umask")!;
  const riktigRekkefølge = prøv(oppgave, "umask 077\ntouch dagbok.txt");
  sjekk("umask før touch gir riktig", riktigRekkefølge.resultat.utfall === "riktig", riktigRekkefølge.resultat.melding);
  const feilRekkefølge = prøv(oppgave, "touch dagbok.txt\numask 077");
  sjekk(
    "touch før umask gir «nesten» og peker på rekkefølgen",
    feilRekkefølge.resultat.utfall === "nesten" && feilRekkefølge.resultat.melding.includes("rekkefølgen"),
    feilRekkefølge.resultat.melding,
  );
  console.log(`        → «${feilRekkefølge.resultat.melding}»`);
}

{
  const oppgave = oppgaveMedId("ms-flersteg-oppsett")!;
  const helt = prøv(oppgave, "mkdir logg\necho oppstart ok > logg/dag1.txt\nchmod 750 logg");
  sjekk("alle tre stegene gir riktig", helt.resultat.utfall === "riktig", helt.resultat.melding);
  const påEnLinje = prøv(oppgave, "mkdir logg; echo 'oppstart ok' > logg/dag1.txt; chmod u=rwx,g=rx,o= logg");
  sjekk("samme tre steg på én linje gir også riktig", påEnLinje.resultat.utfall === "riktig", påEnLinje.resultat.melding);
  const glemtChmod = prøv(oppgave, "mkdir logg\necho oppstart ok > logg/dag1.txt");
  sjekk("glemt chmod gir «nesten»", glemtChmod.resultat.utfall === "nesten", glemtChmod.resultat.melding);
  console.log(`        → «${glemtChmod.resultat.melding}»`);
  const glemtFil = prøv(oppgave, "mkdir logg\nchmod 750 logg");
  sjekk("glemt fil gir «nesten» og nevner dag1.txt", glemtFil.resultat.utfall === "nesten" && glemtFil.resultat.melding.includes("dag1.txt"), glemtFil.resultat.melding);
}

// ---------------------------------------------------------------------------
overskrift("6. Hver oppgave har minst én løsning som faktisk virker");

for (const oppgave of MAL_OPPGAVER) {
  const virker = oppgave.aksepterte.filter((svar) => prøv(oppgave, svar).resultat.utfall === "riktig");
  sjekk(
    `${oppgave.id}: ${virker.length}/${oppgave.aksepterte.length} av de oppgitte løsningene gir riktig`,
    virker.length === oppgave.aksepterte.length,
    oppgave.aksepterte
      .filter((s) => !virker.includes(s))
      .map((s) => `«${s}» → ${prøv(oppgave, s).resultat.utfall}: ${prøv(oppgave, s).resultat.melding}`)
      .join("\n        "),
  );
  const tomt = prøv(oppgave, "");
  sjekk(`${oppgave.id}: tomt svar gir ikke riktig`, tomt.resultat.utfall !== "riktig");
}

// ---------------------------------------------------------------------------
console.log(`\n${"=".repeat(52)}`);
console.log(`Bestått: ${bestått}   Strøket: ${strøket}`);
if (strøket > 0) {
  console.log("Selvsjekken feilet.");
  process.exit(1);
}
console.log("Alt i orden.");
