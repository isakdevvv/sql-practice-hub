// ---------------------------------------------------------------------------
// Mock-shell, lag 1: TILSTANDEN.
//
// PLAN-HOST26-MODULER.md §3.1: en måloppgave skal sjekke om studenten klarte å
// OPPNÅ EN TILSTAND, ikke om hun husket en kommandostreng. Da må tilstanden
// finnes som data. Denne fila er den datamodellen: et filsystem med eiere,
// grupper og rettighetsbits, en bruker som kan være rot eller ikke, en
// arbeidskatalog, en umask og et lite miljø.
//
// Ren TypeScript, ingen React, ingen nettleser-API-er. Den kan kjøres fra
// kommandolinja (se mockShellSelvsjekk.ts) og importeres av hvilken som helst
// Linux-modul i appen.
//
// HVA SOM ER MODELLERT
//   - filer og kataloger i et tre, med innhold på filene
//   - eier og gruppe per node
//   - de tolv rettighetsbitene: rwx for eier/gruppe/andre, pluss setuid (4000),
//     setgid (2000) og sticky (1000)
//   - arbeidskatalog, brukerkontekst (navn, grupper, rot eller ikke), umask
//   - miljøvariabler (PATH, HOME, USER, PWD) og exit-koden fra forrige kommando
//
// HVA SOM BEVISST IKKE ER MODELLERT
//   - inoder, harde og myke lenker: en node har nøyaktig ett navn
//   - tidsstempler (mtime/atime/ctime) — ingen oppgave trenger dem ennå
//   - tilgangskontrollister (ACL), utvidede attributter, capabilities
//   - flere samtidige prosesser. «Prosesstilstanden» her er én enkelt
//     kommandolinje om gangen, med PATH og exit-kode. Signaler, PID-er og
//     jobbkontroll hører hjemme i modul 3 og er ikke med.
//   - montering, kvoter, filsystemtyper
// ---------------------------------------------------------------------------

/** En fil eller en katalog. Kataloger har `barn`, filer har `innhold`. */
export interface FsNode {
  navn: string;
  type: "fil" | "katalog";
  /** Filinnhold. Alltid tom streng for kataloger. */
  innhold: string;
  eier: string;
  gruppe: string;
  /** Rettighetene som tolv bits: setuid|setgid|sticky + rwxrwxrwx. */
  mode: number;
  /** Kun for kataloger. Nøkkelen er filnavnet. */
  barn: Record<string, FsNode>;
}

export interface Bruker {
  navn: string;
  /** Primærgruppen først. Brukes når nye filer skal få gruppe. */
  grupper: string[];
  erRot: boolean;
}

export interface ShellTilstand {
  rot: FsNode;
  /** Absolutt sti, alltid uten etterfølgende skråstrek (unntatt "/"). */
  arbeidskatalog: string;
  bruker: Bruker;
  /** umask som tall, f.eks. 0o022. Bitene her TREKKES FRA på nye filer. */
  umask: number;
  miljo: Record<string, string>;
  /** Exit-koden fra forrige kommando — det $? ville vist. */
  sisteExitkode: number;
}

// ---------------------------------------------------------------------------
// Rettighetsbits
// ---------------------------------------------------------------------------

export const SETUID = 0o4000;
export const SETGID = 0o2000;
export const STICKY = 0o1000;

/** De tre rettighetsklassene, i den rekkefølgen ls -l viser dem. */
export type Klasse = "eier" | "gruppe" | "andre";
export const KLASSER: Klasse[] = ["eier", "gruppe", "andre"];

/** Norsk navn på de tre rettighetene. */
export type Rett = "lese" | "skrive" | "kjøre";
export const RETTER: Rett[] = ["lese", "skrive", "kjøre"];

const KLASSE_SKIFT: Record<Klasse, number> = { eier: 6, gruppe: 3, andre: 0 };
const RETT_BIT: Record<Rett, number> = { lese: 4, skrive: 2, kjøre: 1 };

/** Henter de tre bitene (0–7) for én klasse. */
export function sifferFor(mode: number, klasse: Klasse): number {
  return (mode >> KLASSE_SKIFT[klasse]) & 0o7;
}

export function harBit(mode: number, klasse: Klasse, rett: Rett): boolean {
  return (sifferFor(mode, klasse) & RETT_BIT[rett]) !== 0;
}

/** «rwxr-x---»-delen av ls -l. Setuid/setgid/sticky vises som s/s/t slik ls gjør. */
export function modeTilTekst(mode: number): string {
  let ut = "";
  for (const klasse of KLASSER) {
    const s = sifferFor(mode, klasse);
    ut += s & 4 ? "r" : "-";
    ut += s & 2 ? "w" : "-";
    const kjor = (s & 1) !== 0;
    if (klasse === "eier" && mode & SETUID) ut += kjor ? "s" : "S";
    else if (klasse === "gruppe" && mode & SETGID) ut += kjor ? "s" : "S";
    else if (klasse === "andre" && mode & STICKY) ut += kjor ? "t" : "T";
    else ut += kjor ? "x" : "-";
  }
  return ut;
}

/** Hele første kolonnen i ls -l: typetegn pluss de ni rettighetstegnene. */
export function typeOgModeTilTekst(node: FsNode): string {
  return (node.type === "katalog" ? "d" : "-") + modeTilTekst(node.mode);
}

/** Firesifret oktal, slik `stat -c %a` ville skrevet den. */
export function modeTilOktal(mode: number): string {
  return (mode & 0o7777).toString(8).padStart(4, "0");
}

// ---------------------------------------------------------------------------
// chmod-uttrykk: både oktalt og symbolsk
// ---------------------------------------------------------------------------

export interface ChmodResultat {
  ok: boolean;
  mode: number;
  /** Feilmelding på norsk når uttrykket ikke lot seg tolke. */
  feil?: string;
}

const SYMBOLSK = /^([ugoa]*)([+\-=])([rwxXst]*)$/;

/**
 * Tolker ett chmod-uttrykk mot en gjeldende mode.
 *
 * Oktalt: 750, 0750, 2775 — settes direkte.
 * Symbolsk: kommaseparerte ledd som u=rwx, g+r, o-rwx, a+x, g+s, +t.
 * Utelatt klasse (`+x`) betyr «alle», men da med umask trukket fra, akkurat
 * som ekte chmod gjør.
 */
export function tolkChmod(
  uttrykk: string,
  gjeldende: number,
  umask: number,
  erKatalog: boolean,
): ChmodResultat {
  const tekst = uttrykk.trim();
  if (tekst === "") return { ok: false, mode: gjeldende, feil: "chmod: mangler rettighetsuttrykk" };

  if (/^[0-7]{1,4}$/.test(tekst)) {
    return { ok: true, mode: parseInt(tekst, 8) };
  }

  let mode = gjeldende;
  for (const ledd of tekst.split(",")) {
    const m = ledd.trim().match(SYMBOLSK);
    if (!m) {
      return {
        ok: false,
        mode: gjeldende,
        feil: `chmod: ugyldig modus: «${uttrykk}»`,
      };
    }
    const [, hvem, operator, retter] = m;
    const klasser: Klasse[] =
      hvem === "" || hvem.includes("a")
        ? ["eier", "gruppe", "andre"]
        : (["u", "g", "o"] as const)
            .filter((c) => hvem.includes(c))
            .map((c) => (c === "u" ? "eier" : c === "g" ? "gruppe" : "andre"));
    const utelattKlasse = hvem === "";

    // Bygg maske for de vanlige rwx-bitene.
    let maske = 0;
    for (const klasse of klasser) {
      let siffer = 0;
      if (retter.includes("r")) siffer |= 4;
      if (retter.includes("w")) siffer |= 2;
      // X = kjørerett kun på kataloger, eller på filer som allerede er kjørbare
      // for noen. Det er dette som gjør `chmod -R a+X` trygg på en katalogtre.
      const storX =
        retter.includes("X") && (erKatalog || (mode & 0o111) !== 0);
      if (retter.includes("x") || storX) siffer |= 1;
      maske |= siffer << KLASSE_SKIFT[klasse];
    }
    // Spesialbitene.
    let spesial = 0;
    if (retter.includes("s")) {
      if (klasser.includes("eier")) spesial |= SETUID;
      if (klasser.includes("gruppe")) spesial |= SETGID;
      if (utelattKlasse) spesial |= SETUID | SETGID;
    }
    if (retter.includes("t")) spesial |= STICKY;

    if (utelattKlasse && operator !== "=") {
      // `chmod +x` respekterer umask. `chmod a+x` gjør det ikke.
      maske &= ~umask;
    }

    if (operator === "+") mode |= maske | spesial;
    else if (operator === "-") mode &= ~(maske | spesial);
    else {
      // «=» nullstiller de nevnte klassene før den setter dem.
      let nullstill = 0;
      for (const klasse of klasser) nullstill |= 0o7 << KLASSE_SKIFT[klasse];
      if (klasser.includes("eier")) nullstill |= SETUID;
      if (klasser.includes("gruppe")) nullstill |= SETGID;
      if (klasser.includes("andre")) nullstill |= STICKY;
      mode = (mode & ~nullstill) | maske | spesial;
    }
  }
  return { ok: true, mode };
}

// ---------------------------------------------------------------------------
// Stier
// ---------------------------------------------------------------------------

/** Gjør en sti absolutt og fjerner «.», «..» og doble skråstreker. */
export function losSti(t: ShellTilstand, sti: string): string {
  let rå = sti.trim();
  if (rå === "" ) rå = ".";
  if (rå === "~" || rå.startsWith("~/")) {
    rå = (t.miljo.HOME ?? "/") + rå.slice(1);
  }
  const absolutt = rå.startsWith("/") ? rå : `${t.arbeidskatalog}/${rå}`;
  const deler: string[] = [];
  for (const del of absolutt.split("/")) {
    if (del === "" || del === ".") continue;
    if (del === "..") {
      deler.pop();
      continue;
    }
    deler.push(del);
  }
  return "/" + deler.join("/");
}

export function forelderAv(sti: string): string {
  if (sti === "/") return "/";
  const i = sti.lastIndexOf("/");
  return i <= 0 ? "/" : sti.slice(0, i);
}

export function navnetAv(sti: string): string {
  if (sti === "/") return "/";
  return sti.slice(sti.lastIndexOf("/") + 1);
}

/** Slår opp en node på en absolutt sti. Returnerer null hvis den ikke finnes. */
export function finnNode(t: ShellTilstand, absoluttSti: string): FsNode | null {
  if (absoluttSti === "/") return t.rot;
  let node: FsNode = t.rot;
  for (const del of absoluttSti.split("/").filter(Boolean)) {
    if (node.type !== "katalog") return null;
    const neste = node.barn[del];
    if (!neste) return null;
    node = neste;
  }
  return node;
}

/** Som finnNode, men tar en sti relativt til arbeidskatalogen. */
export function slaOpp(t: ShellTilstand, sti: string): FsNode | null {
  return finnNode(t, losSti(t, sti));
}

// ---------------------------------------------------------------------------
// Rettighetssjekk
// ---------------------------------------------------------------------------

/** Hvilken klasse brukeren havner i for denne noden. */
export function klasseFor(t: ShellTilstand, node: FsNode): Klasse {
  if (t.bruker.navn === node.eier) return "eier";
  if (t.bruker.grupper.includes(node.gruppe)) return "gruppe";
  return "andre";
}

/**
 * Har brukeren denne retten på noden?
 *
 * Rot får alt — bortsett fra at rot heller ikke kan kjøre en fil som ingen har
 * kjørerett på. Det er nøyaktig slik ekte Linux oppfører seg, og det forklarer
 * hvorfor `sudo ./skript.sh` kan svare «Tilgang nektet».
 */
export function harRett(t: ShellTilstand, node: FsNode, rett: Rett): boolean {
  if (t.bruker.erRot) {
    if (rett === "kjøre" && node.type === "fil") return (node.mode & 0o111) !== 0;
    return true;
  }
  return harBit(node.mode, klasseFor(t, node), rett);
}

/** Kan brukeren gå INN i katalogen (kjørerett) og lese navnene i den (leserett)? */
export function kanListe(t: ShellTilstand, node: FsNode): boolean {
  return harRett(t, node, "lese") && harRett(t, node, "kjøre");
}

// ---------------------------------------------------------------------------
// Bygging og kloning
// ---------------------------------------------------------------------------

/** Standard mode for en ny fil før umask: rw-rw-rw-. */
export const NY_FIL_BASIS = 0o666;
/** Standard mode for en ny katalog før umask: rwxrwxrwx. */
export const NY_KATALOG_BASIS = 0o777;

export function modeEtterUmask(basis: number, umask: number): number {
  return basis & ~umask;
}

export function lagNode(
  navn: string,
  type: "fil" | "katalog",
  eier: string,
  gruppe: string,
  mode: number,
  innhold = "",
): FsNode {
  return { navn, type, innhold: type === "fil" ? innhold : "", eier, gruppe, mode, barn: {} };
}

/** Dyp kopi. Brukes for å kjøre en kommando uten å ødelegge utgangstilstanden. */
export function klonNode(node: FsNode): FsNode {
  const kopi: FsNode = { ...node, barn: {} };
  for (const [navn, barn] of Object.entries(node.barn)) kopi.barn[navn] = klonNode(barn);
  return kopi;
}

export function klonTilstand(t: ShellTilstand): ShellTilstand {
  return {
    rot: klonNode(t.rot),
    arbeidskatalog: t.arbeidskatalog,
    bruker: { ...t.bruker, grupper: [...t.bruker.grupper] },
    umask: t.umask,
    miljo: { ...t.miljo },
    sisteExitkode: t.sisteExitkode,
  };
}

/** Én oppføring i beskrivelsen av en starttilstand. */
export interface FilSpek {
  /** Absolutt sti. Mellomliggende kataloger lages automatisk. */
  sti: string;
  type: "fil" | "katalog";
  innhold?: string;
  eier?: string;
  gruppe?: string;
  /** Oktal mode. Utelatt gir 644 for filer og 755 for kataloger. */
  mode?: number;
}

export interface TilstandSpek {
  bruker?: Partial<Bruker>;
  arbeidskatalog?: string;
  umask?: number;
  miljo?: Record<string, string>;
  filer?: FilSpek[];
}

/**
 * Bygger en tilstand. Standardoppsettet er en Ubuntu-lik maskin med brukeren
 * `isak` i gruppene `isak` og `studenter`, hjemmekatalog /home/isak.
 */
export function lagTilstand(spek: TilstandSpek = {}): ShellTilstand {
  const bruker: Bruker = {
    navn: "isak",
    grupper: ["isak", "studenter"],
    erRot: false,
    ...spek.bruker,
  };
  const hjem = `/home/${bruker.navn}`;
  const rot = lagNode("/", "katalog", "root", "root", 0o755);
  const t: ShellTilstand = {
    rot,
    arbeidskatalog: spek.arbeidskatalog ?? hjem,
    bruker,
    umask: spek.umask ?? 0o022,
    miljo: {
      PATH: "/usr/local/bin:/usr/bin:/bin",
      HOME: hjem,
      USER: bruker.navn,
      PWD: spek.arbeidskatalog ?? hjem,
      ...spek.miljo,
    },
    sisteExitkode: 0,
  };

  // Standardstillaset. Alltid til stede, slik at oppgaver kan anta at /home,
  // /tmp og /etc finnes.
  const grunn: FilSpek[] = [
    { sti: "/home", type: "katalog", eier: "root", gruppe: "root", mode: 0o755 },
    { sti: hjem, type: "katalog", eier: bruker.navn, gruppe: bruker.grupper[0], mode: 0o755 },
    { sti: "/etc", type: "katalog", eier: "root", gruppe: "root", mode: 0o755 },
    { sti: "/tmp", type: "katalog", eier: "root", gruppe: "root", mode: 0o1777 },
    { sti: "/var", type: "katalog", eier: "root", gruppe: "root", mode: 0o755 },
  ];

  for (const f of [...grunn, ...(spek.filer ?? [])]) leggInn(t, f, bruker);
  return t;
}

function leggInn(t: ShellTilstand, f: FilSpek, bruker: Bruker) {
  const absolutt = f.sti.startsWith("/") ? f.sti : `/${f.sti}`;
  const deler = absolutt.split("/").filter(Boolean);
  let node = t.rot;
  for (let i = 0; i < deler.length; i++) {
    const navn = deler[i];
    const sisteLedd = i === deler.length - 1;
    if (!node.barn[navn]) {
      node.barn[navn] = lagNode(
        navn,
        sisteLedd ? f.type : "katalog",
        sisteLedd ? (f.eier ?? bruker.navn) : (f.eier ?? bruker.navn),
        sisteLedd ? (f.gruppe ?? bruker.grupper[0]) : (f.gruppe ?? bruker.grupper[0]),
        sisteLedd
          ? (f.mode ?? (f.type === "katalog" ? 0o755 : 0o644))
          : 0o755,
        sisteLedd && f.type === "fil" ? (f.innhold ?? "") : "",
      );
    } else if (sisteLedd) {
      // Finnes fra før (typisk /home eller hjemmekatalogen): oppdater feltene
      // spesifikasjonen faktisk oppgir, la resten stå.
      const eksisterende = node.barn[navn];
      if (f.eier) eksisterende.eier = f.eier;
      if (f.gruppe) eksisterende.gruppe = f.gruppe;
      if (f.mode != null) eksisterende.mode = f.mode;
      if (f.innhold != null) eksisterende.innhold = f.innhold;
    }
    node = node.barn[navn];
  }
}

/** Alle stier i treet, sortert. Brukes av selvsjekken og av feilmeldinger. */
export function alleStier(node: FsNode, prefiks = ""): string[] {
  const her = prefiks === "" ? "/" : prefiks;
  const ut = [her];
  for (const navn of Object.keys(node.barn).sort()) {
    ut.push(...alleStier(node.barn[navn], `${prefiks}/${navn}`));
  }
  return ut;
}
