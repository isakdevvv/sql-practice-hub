// ---------------------------------------------------------------------------
// Mock-shell, lag 3: MÅLOPPGAVENE.
//
// Her ligger forskjellen fra shellScenarios.ts. Der sjekkes svaret med et regex
// mot kommandostrengen, og studenten lærer å gjenkalle én bestemt kommando.
// Her defineres oppgaven som et MÅLTILSTAND-PREDIKAT: etter at kommandoen din
// har kjørt, skal filsystemet se slik ut. Konsekvensene:
//
//   - Alle veier til målet godtas. `chmod 750 logg` og
//     `chmod u=rwx,g=rx,o= logg` gir begge «riktig», uten at noen må huske
//     å skrive en ny regex.
//   - Tilbakemeldingen kan si HVA som ble galt, fordi vi kan sammenligne
//     tilstanden vi fikk med tilstanden vi ba om, bit for bit.
//   - Flerstegs-oppgaver blir mulige. Det er de som ligner obligene.
//
// Utfallet er tre-verdig: «riktig», «nesten» (du er på rett vei, og her er
// nøyaktig hva som skiller) og «feil».
// ---------------------------------------------------------------------------

import {
  KLASSER,
  RETTER,
  SETGID,
  SETUID,
  STICKY,
  finnNode,
  harBit,
  klonTilstand,
  lagTilstand,
  losSti,
  modeTilOktal,
  modeTilTekst,
  sifferFor,
  type Klasse,
  type Rett,
  type ShellTilstand,
} from "./mockShellTilstand";
import { kjorAlle, type Kjoring } from "./mockShellKommandoer";

export type Utfall = "riktig" | "nesten" | "feil";

export interface Sjekkresultat {
  utfall: Utfall;
  /** Én til tre setninger. Ved «nesten» skal den navngi avviket. */
  melding: string;
}

export interface MalOppgave {
  id: string;
  tittel: string;
  tema: "rettigheter" | "eierskap" | "filer" | "flersteg";
  /** Situasjonen, formulert som noe studenten vil OPPNÅ. */
  oppdrag: string;
  /** Måltilstanden i klartekst. Vises i lær-modus og etter fasit. */
  maal: string;
  /** Utgangstilstanden. Ny hver gang, så oppgaven kan prøves om igjen. */
  start: () => ShellTilstand;
  /** Eksempler på løsninger som godtas. Ikke uttømmende — sjekken er bredere. */
  aksepterte: string[];
  hint: string;
  /** Selve predikatet. Får sluttilstanden og alt som ble kjørt. */
  sjekk: (slutt: ShellTilstand, kjøringer: Kjoring[]) => Sjekkresultat;
  laerdom: string;
  /** Sant når oppgaven forventer flere kommandoer etter hverandre. */
  flersteg?: boolean;
}

const riktig = (melding: string): Sjekkresultat => ({ utfall: "riktig", melding });
const nesten = (melding: string): Sjekkresultat => ({ utfall: "nesten", melding });
const feil = (melding: string): Sjekkresultat => ({ utfall: "feil", melding });

// ---------------------------------------------------------------------------
// Sammenligning av tilstand — det som gjør «nesten»-meldingene presise
// ---------------------------------------------------------------------------

const KLASSE_ORD: Record<Klasse, string> = {
  eier: "eier",
  gruppe: "gruppe",
  andre: "andre",
};

const RETT_ORD: Record<Rett, { har: string; mangler: string }> = {
  lese: { har: "lese", mangler: "lese" },
  skrive: { har: "skrive", mangler: "skrive" },
  kjøre: { har: "kjøre", mangler: "kjøre" },
};

/**
 * Alle forskjellene mellom to modes, som norske setningsledd.
 * Eksempel: ["gruppe har skriverett som ikke skulle vært der"].
 */
export function modeAvvik(faktisk: number, forventet: number): string[] {
  const ut: string[] = [];
  for (const klasse of KLASSER) {
    for (const rett of RETTER) {
      const har = harBit(faktisk, klasse, rett);
      const skal = harBit(forventet, klasse, rett);
      if (har === skal) continue;
      ut.push(
        har
          ? `${KLASSE_ORD[klasse]} har ${RETT_ORD[rett].har}rett som ikke skulle vært der`
          : `${KLASSE_ORD[klasse]} mangler ${RETT_ORD[rett].mangler}rett`,
      );
    }
  }
  const spesial: [number, string][] = [
    [SETUID, "setuid-bit"],
    [SETGID, "setgid-bit"],
    [STICKY, "sticky-bit"],
  ];
  for (const [bit, navn] of spesial) {
    const har = (faktisk & bit) !== 0;
    const skal = (forventet & bit) !== 0;
    if (har === skal) continue;
    ut.push(har ? `${navn} er satt, men skulle ikke vært det` : `${navn} mangler`);
  }
  return ut;
}

/** Hvor mange rettighetsbits skiller de to? Brukes til å skille nesten fra feil. */
export function avstand(faktisk: number, forventet: number): number {
  let n = 0;
  for (let bit = 1; bit <= 0o4000; bit <<= 1) {
    if ((faktisk & bit) !== (forventet & bit)) n++;
  }
  return n;
}

export interface ModeKrav {
  sti: string;
  forventet: number;
  /** Hvordan filen omtales i tilbakemeldingen, f.eks. "logg/". */
  visesSom?: string;
}

/**
 * Standardsjekken for rettighetsoppgaver: én eller flere stier skal ha en
 * bestemt mode. Alt annet enn full treff blir «nesten» med en presis melding,
 * så lenge filen faktisk finnes — for da er studenten på rett spor.
 */
export function krevModer(t: ShellTilstand, krav: ModeKrav[]): Sjekkresultat {
  const mangler: string[] = [];
  const avvikstekster: string[] = [];
  let antallAvvikendeBits = 0;

  for (const k of krav) {
    const navn = k.visesSom ?? k.sti;
    const node = finnNode(t, losSti(t, k.sti));
    if (!node) {
      mangler.push(navn);
      continue;
    }
    if ((node.mode & 0o7777) === (k.forventet & 0o7777)) continue;
    const avvik = modeAvvik(node.mode, k.forventet);
    antallAvvikendeBits += avstand(node.mode, k.forventet);
    avvikstekster.push(
      `\`${navn}\` har nå mode ${modeTilOktal(node.mode).slice(1)} (${modeTilTekst(node.mode)}), ikke ${modeTilOktal(k.forventet).slice(1)} (${modeTilTekst(k.forventet)}) — ${avvik.join(", ")}.`,
    );
  }

  if (mangler.length) {
    return feil(
      `Fant ikke ${mangler.map((m) => `\`${m}\``).join(" og ")}. Sjekk at du står i riktig katalog, og at navnet er skrevet nøyaktig likt.`,
    );
  }
  if (avvikstekster.length === 0) return riktig("");
  // Mange bits gale betyr som regel at studenten har tenkt helt annerledes.
  return antallAvvikendeBits <= 3
    ? nesten(avvikstekster.join(" "))
    : feil(`${avvikstekster.join(" ")} Det er for langt unna til at dette er en skrivefeil — les målet en gang til.`);
}

/** Krev at en fil eller katalog har bestemt eier og/eller gruppe. */
export function krevEierskap(
  t: ShellTilstand,
  sti: string,
  forventet: { eier?: string; gruppe?: string },
  visesSom?: string,
): Sjekkresultat {
  const navn = visesSom ?? sti;
  const node = finnNode(t, losSti(t, sti));
  if (!node) return feil(`Fant ikke \`${navn}\`.`);
  const avvik: string[] = [];
  if (forventet.eier && node.eier !== forventet.eier) {
    avvik.push(`eieren er fortsatt \`${node.eier}\`, ikke \`${forventet.eier}\``);
  }
  if (forventet.gruppe && node.gruppe !== forventet.gruppe) {
    avvik.push(`gruppen er \`${node.gruppe}\`, ikke \`${forventet.gruppe}\``);
  }
  if (avvik.length === 0) return riktig("");
  return nesten(`\`${navn}\`: ${avvik.join(", og ")}.`);
}

/** Setter sammen flere delsjekker. Den strengeste vurderingen vinner. */
export function alleMa(...deler: Sjekkresultat[]): Sjekkresultat {
  const feilene = deler.filter((d) => d.utfall === "feil");
  if (feilene.length) return feil(feilene.map((d) => d.melding).join(" "));
  const nestene = deler.filter((d) => d.utfall === "nesten");
  if (nestene.length) return nesten(nestene.map((d) => d.melding).join(" "));
  return riktig("");
}

/** Erstatter tom melding fra krevModer/krevEierskap med oppgavens egen ros. */
export function medRos(res: Sjekkresultat, ros: string): Sjekkresultat {
  return res.utfall === "riktig" ? riktig(ros) : res;
}

// ---------------------------------------------------------------------------
// Kjøringen studenten utløser
// ---------------------------------------------------------------------------

export interface Forsok {
  /** Sluttilstanden etter at alle linjene er kjørt. */
  slutt: ShellTilstand;
  kjøringer: Kjoring[];
  resultat: Sjekkresultat;
}

/**
 * Kjører studentens svar mot en fersk kopi av oppgavens starttilstand og
 * bruker måltilstand-predikatet. Ingen bivirkninger: oppgavens egen
 * starttilstand bygges på nytt hver gang.
 */
export function prøv(oppgave: MalOppgave, svar: string): Forsok {
  const t = klonTilstand(oppgave.start());
  const kjøringer = kjorAlle(t, svar);
  const tomtSvar = svar.trim() === "";
  const resultat = tomtSvar
    ? feil("Skriv en kommando først.")
    : oppgave.sjekk(t, kjøringer);
  return { slutt: t, kjøringer, resultat };
}

/** Feilet noe åpenbart? Gir en bedre melding enn «feil» alene. */
function førsteFeil(kjøringer: Kjoring[]): string | null {
  const k = kjøringer.find((x) => x.exit !== 0 && x.feil.length > 0);
  return k ? k.feil[0] : null;
}

/** Standard innpakning: hvis skallet klaget, si det før vi vurderer målet. */
function medSkallfeil(kjøringer: Kjoring[], res: Sjekkresultat): Sjekkresultat {
  if (res.utfall === "riktig") return res;
  const melding = førsteFeil(kjøringer);
  if (!melding) return res;
  return { utfall: res.utfall, melding: `Skallet svarte: «${melding}» ${res.melding}`.trim() };
}

// ---------------------------------------------------------------------------
// Oppgavene
// ---------------------------------------------------------------------------

const prosjektStart = () =>
  lagTilstand({
    arbeidskatalog: "/home/isak/prosjekt",
    filer: [
      { sti: "/home/isak/prosjekt", type: "katalog", mode: 0o755 },
      { sti: "/home/isak/prosjekt/logg", type: "katalog", mode: 0o755 },
      { sti: "/home/isak/prosjekt/logg/dag1.txt", type: "fil", mode: 0o644, innhold: "start\n" },
      { sti: "/home/isak/prosjekt/notat.txt", type: "fil", mode: 0o644, innhold: "husk oblig\n" },
    ],
  });

export const MAL_OPPGAVER: MalOppgave[] = [
  {
    id: "ms-logg-750",
    tittel: "Lukk katalogen for alle andre enn gruppen",
    tema: "rettigheter",
    oppdrag:
      "Katalogen `logg/` inneholder loggene til prosjektet. Du skal fortsatt kunne gjøre alt i den. Gruppen `studenter` skal kunne gå inn og lese, men ikke legge igjen eller slette filer. Alle andre skal ikke komme inn i det hele tatt.",
    maal: "logg/ har mode 750: eier rwx, gruppe r-x, andre ingenting.",
    start: prosjektStart,
    aksepterte: ["chmod 750 logg", "chmod u=rwx,g=rx,o= logg", "chmod 0750 logg", "chmod g-w,o-rwx logg"],
    hint: "«Gå inn i en katalog» er kjøreretten (x), ikke leseretten. Å liste navnene i den er leseretten. Gruppen trenger begge, men ikke w.",
    sjekk: (t, k) =>
      medSkallfeil(
        k,
        medRos(
          krevModer(t, [{ sti: "/home/isak/prosjekt/logg", forventet: 0o750, visesSom: "logg/" }]),
          "Riktig. Både `chmod 750 logg` og `chmod u=rwx,g=rx,o= logg` gir nøyaktig denne tilstanden — oppgaven spør etter resultatet, ikke etter én bestemt skrivemåte.",
        ),
      ),
    laerdom:
      "På en katalog betyr x «kan gå inn hit og nå det som ligger under», og r «kan liste navnene». En katalog med r men uten x er nesten ubrukelig: du ser navnene, men kommer ikke til filene.",
  },
  {
    id: "ms-hemmelig-600",
    tittel: "Gjør en fil privat",
    tema: "rettigheter",
    oppdrag:
      "Du har lagret notater i `notat.txt` som ingen andre skal kunne lese. Du skal selv kunne lese og redigere den. Ingen andre skal kunne noe som helst.",
    maal: "notat.txt har mode 600: eier rw-, gruppe og andre ingenting.",
    start: prosjektStart,
    aksepterte: ["chmod 600 notat.txt", "chmod u=rw,go= notat.txt", "chmod go-rwx notat.txt"],
    hint: "En tekstfil trenger ikke kjørerett for å redigeres. Det er bare skript og programmer som trenger x.",
    sjekk: (t, k) =>
      medSkallfeil(
        k,
        medRos(
          krevModer(t, [{ sti: "/home/isak/prosjekt/notat.txt", forventet: 0o600, visesSom: "notat.txt" }]),
          "Riktig. Dette er nøyaktig kravet ssh stiller til private nøkler: 600, ellers nekter den å bruke dem.",
        ),
      ),
    laerdom:
      "600 på filer er standardvalget for alt privat. Legger du på x «for sikkerhets skyld», har du ikke gjort filen tryggere — du har bare bedt skallet forsøke å kjøre en tekstfil.",
  },
  {
    id: "ms-skript-kjorbart",
    tittel: "Gjør skriptet kjørbart for alle",
    tema: "rettigheter",
    oppdrag:
      "Du har nettopp lagret `rydd.sh`. Filen har mode 644, og forsøk på å kjøre den svarer «tilgang nektet». Alle på maskinen skal kunne kjøre den; bare du skal kunne endre den.",
    maal: "rydd.sh har mode 755: eier rwx, gruppe r-x, andre r-x.",
    start: () =>
      lagTilstand({
        arbeidskatalog: "/home/isak/prosjekt",
        filer: [
          { sti: "/home/isak/prosjekt", type: "katalog", mode: 0o755 },
          { sti: "/home/isak/prosjekt/rydd.sh", type: "fil", mode: 0o644, innhold: "#!/bin/bash\necho rydder\n" },
        ],
      }),
    aksepterte: ["chmod 755 rydd.sh", "chmod a+x rydd.sh", "chmod u=rwx,go=rx rydd.sh"],
    hint: "Filen har allerede r for alle. Det eneste som mangler er kjøreretten.",
    sjekk: (t, k) =>
      medSkallfeil(
        k,
        medRos(
          krevModer(t, [{ sti: "/home/isak/prosjekt/rydd.sh", forventet: 0o755, visesSom: "rydd.sh" }]),
          "Riktig. Merk at `chmod a+x rydd.sh` og `chmod 755 rydd.sh` havner på samme sted her nettopp fordi filen sto på 644 fra før — hadde den vært 600, ville de gitt to ulike resultater.",
        ),
      ),
    laerdom:
      "`+x` legger til, `755` setter. Forskjellen betyr ingenting når du kjenner utgangspunktet, og alt når du ikke gjør det. Bruk oktal når du vil ha en bestemt tilstand uansett hva som var før.",
  },
  {
    id: "ms-eierskifte",
    tittel: "Gi filen til en annen bruker",
    tema: "eierskap",
    oppdrag:
      "Filen `/srv/rapport.txt` eies av `root`. Den skal overtas av brukeren `isak` og gruppen `studenter`. Du sitter som `isak`.",
    maal: "rapport.txt eies av isak og har gruppen studenter.",
    start: () =>
      lagTilstand({
        arbeidskatalog: "/srv",
        filer: [
          { sti: "/srv", type: "katalog", eier: "root", gruppe: "root", mode: 0o755 },
          { sti: "/srv/rapport.txt", type: "fil", eier: "root", gruppe: "root", mode: 0o644, innhold: "tall\n" },
        ],
      }),
    aksepterte: ["sudo chown isak:studenter /srv/rapport.txt", "sudo chown isak /srv/rapport.txt && sudo chgrp studenter /srv/rapport.txt"],
    hint: "Å gi bort en fil er en rot-operasjon. Uten det vil skallet si «operasjonen er ikke tillatt».",
    sjekk: (t, k) =>
      medSkallfeil(
        k,
        medRos(
          krevEierskap(t, "/srv/rapport.txt", { eier: "isak", gruppe: "studenter" }, "rapport.txt"),
          "Riktig. `chown EIER:GRUPPE FIL` gjør begge deler i én operasjon, og `sudo` er nødvendig fordi bare rot kan gi bort en fil.",
        ),
      ),
    laerdom:
      "En vanlig bruker kan ALDRI gi bort en fil, heller ikke sin egen. Ville det vært lov, kunne hvem som helst omgått en diskkvote ved å dumpe filene sine på naboen.",
  },
  {
    id: "ms-delt-setgid",
    tittel: "Lag en delt prosjektkatalog",
    tema: "rettigheter",
    oppdrag:
      "`/srv/felles` skal være et delt arbeidsområde for gruppen `studenter`. Alle i gruppen skal kunne lese, skrive og gå inn. Andre skal ikke inn. Og — dette er poenget — filer som legges der skal automatisk få gruppen `studenter`, ikke den som la dem der.",
    maal: "felles/ har mode 2770: setgid satt, eier rwx, gruppe rwx, andre ingenting.",
    start: () =>
      lagTilstand({
        bruker: { navn: "root", grupper: ["root"], erRot: true },
        arbeidskatalog: "/srv",
        filer: [
          { sti: "/srv", type: "katalog", eier: "root", gruppe: "root", mode: 0o755 },
          { sti: "/srv/felles", type: "katalog", eier: "root", gruppe: "studenter", mode: 0o770 },
        ],
      }),
    aksepterte: ["chmod 2770 /srv/felles", "chmod g+s /srv/felles", "chmod 2770 felles"],
    hint: "Gruppearven er én egen bit i tillegg til de ni vanlige. Oktalt legges den foran som 2; symbolsk heter den `g+s`.",
    sjekk: (t, k) =>
      medSkallfeil(
        k,
        medRos(
          krevModer(t, [{ sti: "/srv/felles", forventet: 0o2770, visesSom: "felles/" }]),
          "Riktig. Uten setgid ville hver students filer fått hans egen primærgruppe, og de andre i prosjektet hadde ikke kommet til dem.",
        ),
      ),
    laerdom:
      "setgid på en KATALOG betyr gruppearv for nye filer. setgid på en KJØRBAR FIL betyr noe helt annet: at programmet kjører med filens gruppe. Samme bit, to helt ulike virkninger.",
  },
  {
    id: "ms-sticky",
    tittel: "Alle kan legge fra seg, ingen kan rydde bort andres",
    tema: "rettigheter",
    oppdrag:
      "`/srv/innlevering` skal fungere som en postkasse: hvem som helst skal kunne legge inn en fil, men ingen skal kunne slette en fil de ikke selv eier. Katalogen er i dag 777, som betyr at hvem som helst kan slette hva som helst.",
    maal: "innlevering/ har mode 1777: sticky-bit satt, ellers rwx for alle.",
    start: () =>
      lagTilstand({
        bruker: { navn: "root", grupper: ["root"], erRot: true },
        arbeidskatalog: "/srv",
        filer: [
          { sti: "/srv", type: "katalog", eier: "root", gruppe: "root", mode: 0o755 },
          { sti: "/srv/innlevering", type: "katalog", eier: "root", gruppe: "root", mode: 0o777 },
        ],
      }),
    aksepterte: ["chmod 1777 /srv/innlevering", "chmod +t /srv/innlevering", "chmod o+t innlevering"],
    hint: "Dette er nøyaktig oppsettet /tmp har. Kjør `ls -l /` på en ekte maskin og se etter t-en til slutt.",
    sjekk: (t, k) =>
      medSkallfeil(
        k,
        medRos(
          krevModer(t, [{ sti: "/srv/innlevering", forventet: 0o1777, visesSom: "innlevering/" }]),
          "Riktig. Sticky-bit flytter slettetillatelsen fra katalogen til den enkelte filen: du må eie filen for å fjerne den.",
        ),
      ),
    laerdom:
      "Uten sticky-bit gir skriverett på en katalog rett til å slette ALT som ligger der, uansett hvem som eier det. Det er derfor /tmp er 1777 og ikke 777.",
  },
  {
    id: "ms-umask",
    tittel: "Få nye filer til å fødes private",
    tema: "flersteg",
    flersteg: true,
    oppdrag:
      "Alt du lager i denne økten skal være privat fra første sekund — ikke ryddet opp i etterpå. Sett skallet slik at nye filer får 600, og lag deretter filen `dagbok.txt` for å vise at det virker.",
    maal: "umask er 077, og den nyopprettede dagbok.txt har mode 600.",
    start: () =>
      lagTilstand({
        arbeidskatalog: "/home/isak",
        umask: 0o022,
        filer: [{ sti: "/home/isak", type: "katalog", mode: 0o755 }],
      }),
    aksepterte: ["umask 077\ntouch dagbok.txt", "umask 0077; touch dagbok.txt"],
    hint: "Nye filer starter på 666, ikke 777 — kjøreretten gis aldri automatisk. Maskeret trekkes fra: 666 minus hva gir 600?",
    sjekk: (t, k) => {
      const fil = finnNode(t, "/home/isak/dagbok.txt");
      if (t.umask !== 0o077 && !fil) {
        return medSkallfeil(
          k,
          feil("Verken umask eller filen er på plass. Oppgaven har to steg: sett masken først, lag filen etterpå."),
        );
      }
      if (t.umask !== 0o077) {
        return nesten(
          `Filen er laget, men umask står fortsatt på ${t.umask.toString(8).padStart(4, "0")}. Med den masken arver nye filer ${modeTilOktal(0o666 & ~t.umask).slice(1)}, ikke 600.`,
        );
      }
      if (!fil) {
        return nesten("umask er riktig satt til 077, men du har ikke laget `dagbok.txt` ennå — og det er filen som beviser at masken virket.");
      }
      const rekkefølgeFeil = (fil.mode & 0o7777) !== 0o600;
      if (rekkefølgeFeil) {
        return nesten(
          `\`dagbok.txt\` fikk mode ${modeTilOktal(fil.mode).slice(1)}. umask virker bare på filer som lages ETTER at masken er satt — sjekk rekkefølgen på de to kommandoene.`,
        );
      }
      return riktig(
        "Riktig. 666 minus 077 gir 600, og filen ble født privat i stedet for å bli ryddet opp i etterpå.",
      );
    },
    laerdom:
      "umask er en maske, ikke en rettighet: bitene i den TREKKES FRA. Den virker kun framover, på filer som lages etterpå — den rører aldri noe som allerede finnes.",
  },
  {
    id: "ms-flersteg-oppsett",
    tittel: "Sett opp loggkatalogen fra bunnen",
    tema: "flersteg",
    flersteg: true,
    oppdrag:
      "Du starter i `/home/isak/prosjekt`, som er tom. Lag katalogen `logg`, legg linjen `oppstart ok` i `logg/dag1.txt`, og lukk katalogen slik at gruppen kan lese men ikke skrive, og andre ikke kommer inn.",
    maal: "logg/ finnes med mode 750, og logg/dag1.txt inneholder «oppstart ok».",
    start: () =>
      lagTilstand({
        arbeidskatalog: "/home/isak/prosjekt",
        filer: [{ sti: "/home/isak/prosjekt", type: "katalog", mode: 0o755 }],
      }),
    aksepterte: [
      "mkdir logg\necho oppstart ok > logg/dag1.txt\nchmod 750 logg",
      "mkdir logg; echo 'oppstart ok' > logg/dag1.txt; chmod u=rwx,g=rx,o= logg",
    ],
    hint: "Tre steg, én linje hver — eller alt på én linje med semikolon mellom. Rekkefølgen betyr noe: stenger du katalogen før du skriver i den, kommer du ikke inn.",
    sjekk: (t, k) => {
      const katalog = finnNode(t, "/home/isak/prosjekt/logg");
      if (!katalog) return medSkallfeil(k, feil("Katalogen `logg` finnes ikke. Første steg er `mkdir logg`."));
      if (katalog.type !== "katalog") return feil("`logg` ble en fil, ikke en katalog. `touch` lager filer; `mkdir` lager kataloger.");
      const fil = finnNode(t, "/home/isak/prosjekt/logg/dag1.txt");
      if (!fil) {
        return medSkallfeil(
          k,
          nesten("Katalogen er på plass, men `logg/dag1.txt` mangler. Omdirigering med `>` lager filen og skriver innholdet i én operasjon."),
        );
      }
      if (!fil.innhold.includes("oppstart ok")) {
        return nesten(
          `\`dag1.txt\` finnes, men inneholder «${fil.innhold.trim() || "ingenting"}» i stedet for «oppstart ok».`,
        );
      }
      return medRos(
        krevModer(t, [{ sti: "/home/isak/prosjekt/logg", forventet: 0o750, visesSom: "logg/" }]),
        "Riktig — alle tre stegene sitter, og i en rekkefølge som faktisk virker. Dette er formen obligoppgavene har: flere kommandoer som til sammen setter opp en tilstand.",
      );
    },
    laerdom:
      "Flerstegsoppgaver er der rekkefølgen begynner å bety noe. Stenger du en katalog før du har skrevet i den, må du åpne den igjen — og da har du gjort jobben to ganger.",
  },
];

export const MAL_TEMAER: { id: MalOppgave["tema"]; navn: string }[] = [
  { id: "rettigheter", navn: "Rettighetsbits" },
  { id: "eierskap", navn: "Eier og gruppe" },
  { id: "filer", navn: "Filer og kataloger" },
  { id: "flersteg", navn: "Flere steg" },
];

export function oppgaveMedId(id: string): MalOppgave | undefined {
  return MAL_OPPGAVER.find((o) => o.id === id);
}

/** Praktisk for grensesnittet: hvordan ser starttilstanden ut som ls -l? */
export function beskrivStart(oppgave: MalOppgave): string[] {
  const t = oppgave.start();
  const kjøringer = kjorAlle(t, "ls -l");
  return kjøringer.flatMap((k) => [...k.utdata, ...k.feil]);
}

export { sifferFor };
