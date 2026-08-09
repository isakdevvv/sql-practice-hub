// ---------------------------------------------------------------------------
// DTE-2505 Modul 6 — vi/vim som en TILSTANDSMASKIN.
//
// Modusmodellen er hele poenget med vi, og den er visuell av natur: den samme
// tasten gjør fire helt forskjellige ting avhengig av hvilken modus du er i.
// Derfor er editoren modellert som ren data her, uten React: hvert tastetrykk
// er en overgang fra én tilstand til en annen, og hver overgang forklarer seg
// selv i `forklaring`.
//
// Filen kan importeres i en test og kjøres uten å rendre noe (samme prinsipp
// som src/lib/dte2602/spamSimulering.ts).
//
// Navn skrevet ut: vi = «visual editor», vim = Vi IMproved.
// ---------------------------------------------------------------------------

export type VimMode = "normal" | "insert" | "visual" | "kommando";

export const MODUS_INFO: Record<
  VimMode,
  { navn: string; kort: string; farge: string; hvaTastene: string; hvordanUt: string }
> = {
  normal: {
    navn: "Normalmodus",
    kort: "Der du er når du åpner vim. Tastene er KOMMANDOER, ikke tekst.",
    farge: "sky",
    hvaTastene:
      "Hver tast er en kommando: h/j/k/l flytter, x sletter et tegn, dd sletter linja. Skriver du «hello», har du flyttet, satt inn, og slettet — ikke skrevet noe.",
    hvordanUt: "Du er alltid her. Alle andre moduser kommer tilbake hit med Esc.",
  },
  insert: {
    navn: "Innsettingsmodus",
    kort: "Den eneste modusen der tastene blir tekst i fila.",
    farge: "emerald",
    hvaTastene: "Tastene skriver tegn, akkurat som i en vanlig editor.",
    hvordanUt: "Esc tar deg tilbake til normalmodus.",
  },
  visual: {
    navn: "Visuellmodus",
    kort: "Merker et område først, og lar deg gjøre noe med hele merkingen etterpå.",
    farge: "violet",
    hvaTastene:
      "Bevegelsestastene utvider merkingen. d sletter det merkede, y kopierer det.",
    hvordanUt: "Esc, eller en operasjon som d eller y — begge deler ender i normalmodus.",
  },
  kommando: {
    navn: "Kommandolinjemodus",
    kort: "Linja nederst på skjermen. Her lagrer og avslutter du.",
    farge: "amber",
    hvaTastene: "Du skriver en kommando etter kolon, og Enter kjører den.",
    hvordanUt: "Enter kjører kommandoen, Esc avbryter. Begge ender i normalmodus.",
  },
};

export interface VimState {
  mode: VimMode;
  lines: string[];
  /** Markørens linje (0-basert). */
  row: number;
  /** Markørens kolonne (0-basert). */
  col: number;
  /** Startpunktet for merkingen i visuellmodus. */
  visualAnker: { row: number; col: number } | null;
  /** Teksten som skrives på kommandolinja, uten kolonet. */
  kommandolinje: string;
  /** Utklippsbufferet vim kaller «register». */
  register: string[];
  /** Om registeret inneholder hele linjer eller løse tegn. */
  registerType: "linjer" | "tegn";
  /** Operator som venter på en bevegelse: "d" etter at d er trykket én gang. */
  ventende: string;
  /** Statuslinja nederst. */
  melding: string;
  /** Sant når innholdet er endret siden siste lagring. */
  endret: boolean;
  /** Sant når fila er lagret minst én gang og ikke endret etterpå. */
  lagret: boolean;
  /** Sant når editoren er avsluttet. */
  avsluttet: boolean;
  /** Hva forrige tastetrykk faktisk gjorde — pedagogikken i simulatoren. */
  forklaring: string;
  /** Tasten som ble trykket sist, for å vise den i grensesnittet. */
  sisteTast: string;
}

export const STANDARD_TEKST = [
  "#!/bin/bash",
  "# sikkerhetskopi av hjemmekatalogen",
  "KILDE=/home/student",
  "MAAL=/mnt/backup",
  "tar -czf $MAAL/hjem.tar.gz $KILDE",
  "echo ferdig",
];

export function initVim(lines: string[] = STANDARD_TEKST): VimState {
  return {
    mode: "normal",
    lines: [...lines],
    row: 0,
    col: 0,
    visualAnker: null,
    kommandolinje: "",
    register: [],
    registerType: "linjer",
    ventende: "",
    melding: '"skript.sh" 6L, 142B',
    endret: false,
    lagret: false,
    avsluttet: false,
    forklaring:
      "vim åpner alltid i normalmodus. Prøv å skrive et ord nå — du kommer til å oppdage at ingenting av det havner i teksten.",
    sisteTast: "",
  };
}

function kopi(s: VimState): VimState {
  return { ...s, lines: [...s.lines], register: [...s.register], visualAnker: s.visualAnker ? { ...s.visualAnker } : null };
}

/** Klemmer markøren innenfor teksten. I normalmodus kan den ikke stå ETTER siste tegn. */
function klem(s: VimState): VimState {
  s.row = Math.max(0, Math.min(s.row, s.lines.length - 1));
  const lengde = s.lines[s.row]?.length ?? 0;
  const maks = s.mode === "insert" ? lengde : Math.max(0, lengde - 1);
  s.col = Math.max(0, Math.min(s.col, maks));
  return s;
}

/** Ordgrense framover, slik `w` beveger seg. */
function nesteOrd(linje: string, col: number): number {
  let i = col;
  const erOrdtegn = (c: string) => /[A-Za-z0-9_ÆØÅæøå]/.test(c);
  const start = erOrdtegn(linje[i] ?? "");
  while (i < linje.length && erOrdtegn(linje[i] ?? "") === start && (linje[i] ?? "") !== " ") i++;
  while (i < linje.length && linje[i] === " ") i++;
  return Math.min(i, Math.max(0, linje.length - 1));
}

/** Ordgrense bakover, slik `b` beveger seg. */
function forrigeOrd(linje: string, col: number): number {
  let i = col - 1;
  while (i > 0 && linje[i] === " ") i--;
  while (i > 0 && linje[i - 1] !== " ") i--;
  return Math.max(0, i);
}

/** Merkingen i visuellmodus, normalisert slik at start alltid kommer først. */
export function visuellUtvalg(s: VimState): { fra: { row: number; col: number }; til: { row: number; col: number } } | null {
  if (s.mode !== "visual" || !s.visualAnker) return null;
  const a = s.visualAnker;
  const b = { row: s.row, col: s.col };
  const foerst = a.row < b.row || (a.row === b.row && a.col <= b.col);
  return foerst ? { fra: a, til: b } : { fra: b, til: a };
}

/**
 * Ett tastetrykk. `key` er enten ett tegn ("h", "i", ":") eller et navn
 * ("Escape", "Enter", "Backspace").
 *
 * Rent funksjonell: tilstanden som sendes inn endres aldri.
 */
export function pressKey(state: VimState, key: string): VimState {
  if (state.avsluttet) return state;
  const s = kopi(state);
  s.sisteTast = key;
  s.melding = "";

  // -------------------------------------------------------------------------
  // KOMMANDOLINJEMODUS — alt som skrives havner på linja nederst
  // -------------------------------------------------------------------------
  if (s.mode === "kommando") {
    if (key === "Escape") {
      s.mode = "normal";
      s.kommandolinje = "";
      s.forklaring = "Esc avbrøt kommandoen. Ingenting ble kjørt, og du er tilbake i normalmodus.";
      return klem(s);
    }
    if (key === "Backspace") {
      if (s.kommandolinje.length === 0) {
        s.mode = "normal";
        s.forklaring = "Du slettet kolonet, og da forsvinner kommandolinja. Tilbake i normalmodus.";
        return klem(s);
      }
      s.kommandolinje = s.kommandolinje.slice(0, -1);
      s.forklaring = "Retter på kommandoen før du kjører den.";
      return s;
    }
    if (key === "Enter") {
      return kjorKommando(s);
    }
    if (key.length === 1) {
      s.kommandolinje += key;
      s.forklaring = `Skriver kommandoen: «:${s.kommandolinje}». Ingenting skjer før du trykker Enter.`;
      return s;
    }
    return s;
  }

  // -------------------------------------------------------------------------
  // INNSETTINGSMODUS — den ENESTE modusen der tastene blir tekst
  // -------------------------------------------------------------------------
  if (s.mode === "insert") {
    if (key === "Escape") {
      s.mode = "normal";
      s.forklaring =
        "Esc tilbake til normalmodus. Merk at markøren flytter seg ett tegn til venstre — i normalmodus står den PÅ et tegn, ikke mellom to.";
      s.col = Math.max(0, s.col - 1);
      return klem(s);
    }
    if (key === "Enter") {
      const linje = s.lines[s.row];
      s.lines[s.row] = linje.slice(0, s.col);
      s.lines.splice(s.row + 1, 0, linje.slice(s.col));
      s.row += 1;
      s.col = 0;
      s.endret = true;
      s.lagret = false;
      s.forklaring = "Linjeskift: resten av linja flyttes ned på en ny linje.";
      return s;
    }
    if (key === "Backspace") {
      if (s.col > 0) {
        const linje = s.lines[s.row];
        s.lines[s.row] = linje.slice(0, s.col - 1) + linje.slice(s.col);
        s.col -= 1;
        s.endret = true;
        s.lagret = false;
        s.forklaring = "Sletter tegnet til venstre for markøren.";
      } else {
        s.forklaring = "Ingenting å slette — markøren står helt til venstre.";
      }
      return s;
    }
    if (key.length === 1) {
      const linje = s.lines[s.row];
      s.lines[s.row] = linje.slice(0, s.col) + key + linje.slice(s.col);
      s.col += 1;
      s.endret = true;
      s.lagret = false;
      s.forklaring = `Tegnet «${key}» ble satt inn i teksten. Dette er den eneste modusen der det skjer.`;
      return s;
    }
    return s;
  }

  // -------------------------------------------------------------------------
  // NORMAL- OG VISUELLMODUS — tastene er kommandoer
  // -------------------------------------------------------------------------
  const iVisual = s.mode === "visual";

  if (key === "Escape") {
    if (iVisual) {
      s.mode = "normal";
      s.visualAnker = null;
      s.forklaring = "Merkingen er opphevet. Tilbake i normalmodus, ingenting ble endret.";
    } else if (s.ventende) {
      s.ventende = "";
      s.forklaring = "Avbrøt den halvferdige kommandoen.";
    } else {
      s.forklaring =
        "Du er allerede i normalmodus. Esc her gjør ingenting — og det er nettopp derfor Esc alltid er trygt å trykke når du er usikker.";
    }
    return klem(s);
  }

  // ---- ventende operator (d eller y som venter på en bevegelse) -----------
  // «g» er ikke en operator, bare første halvdel av gg, og håndteres nedenfor.
  if ((s.ventende === "d" || s.ventende === "y") && !iVisual) {
    const op = s.ventende;
    s.ventende = "";
    if (key === op) {
      // dd og yy: hele linja
      if (op === "d") {
        s.register = [s.lines[s.row]];
        s.registerType = "linjer";
        s.lines.splice(s.row, 1);
        if (s.lines.length === 0) s.lines = [""];
        s.endret = true;
        s.lagret = false;
        s.forklaring = "dd slettet hele linja — og la den i registeret, så p kan lime den inn igjen.";
      } else {
        s.register = [s.lines[s.row]];
        s.registerType = "linjer";
        s.forklaring = "yy kopierte («yanked») hele linja til registeret. Teksten er uendret.";
      }
      return klem(s);
    }
    if (key === "w") {
      const linje = s.lines[s.row];
      const til = nesteOrd(linje, s.col);
      const biten = linje.slice(s.col, til);
      if (op === "d") {
        s.lines[s.row] = linje.slice(0, s.col) + linje.slice(til);
        s.endret = true;
        s.lagret = false;
        s.forklaring = `dw slettet fram til neste ord: «${biten}». Operator + bevegelse er hele grammatikken i vim.`;
      } else {
        s.forklaring = `yw kopierte «${biten}» til registeret.`;
      }
      s.register = [biten];
      s.registerType = "tegn";
      return klem(s);
    }
    s.forklaring = `«${op}${key}» er ingen gyldig kombinasjon her. Prøv ${op}${op} for hele linja eller ${op}w for ett ord.`;
    return klem(s);
  }

  switch (key) {
    // ---- bevegelse -------------------------------------------------------
    case "h":
      s.col -= 1;
      s.forklaring = iVisual ? "Utvider merkingen mot venstre." : "h flytter én til venstre. Tastene h j k l ligger under høyre hånd på et engelsk tastatur — derfor ble de bevegelsestaster.";
      return klem(s);
    case "l":
      s.col += 1;
      s.forklaring = iVisual ? "Utvider merkingen mot høyre." : "l flytter én til høyre.";
      return klem(s);
    case "j":
      s.row += 1;
      s.forklaring = iVisual ? "Utvider merkingen én linje ned." : "j flytter én linje ned. Huskeregel: j peker nedover.";
      return klem(s);
    case "k":
      s.row -= 1;
      s.forklaring = iVisual ? "Utvider merkingen én linje opp." : "k flytter én linje opp.";
      return klem(s);
    case "w":
      s.col = nesteOrd(s.lines[s.row], s.col);
      s.forklaring = "w hopper til starten av neste ord (w for word). Mye raskere enn å holde inne l.";
      return klem(s);
    case "b":
      s.col = forrigeOrd(s.lines[s.row], s.col);
      s.forklaring = "b hopper til starten av forrige ord (b for back).";
      return klem(s);
    case "0":
      s.col = 0;
      s.forklaring = "0 hopper til første tegn på linja.";
      return klem(s);
    case "$":
      s.col = Math.max(0, s.lines[s.row].length - 1);
      s.forklaring = "$ hopper til siste tegn på linja. Samme symbol som «slutt» i regulære uttrykk.";
      return klem(s);
    case "G":
      s.row = s.lines.length - 1;
      s.col = 0;
      s.forklaring = "G hopper til siste linje i fila.";
      return klem(s);
    case "g":
      if (s.ventende === "g") {
        s.ventende = "";
        s.row = 0;
        s.col = 0;
        s.forklaring = "gg hopper til første linje. Motstykket til G.";
        return klem(s);
      }
      s.ventende = "g";
      s.forklaring = "g alene gjør ingenting — vim venter på ett tegn til. Trykk g igjen for å hoppe til toppen.";
      return s;

    // ---- inn i innsettingsmodus -----------------------------------------
    case "i":
      if (iVisual) break;
      s.mode = "insert";
      s.forklaring = "i = insert: du havner i innsettingsmodus FØR tegnet markøren står på. Nå blir tastene tekst.";
      return klem(s);
    case "a":
      if (iVisual) break;
      s.mode = "insert";
      s.col += 1;
      s.forklaring = "a = append: samme modus som i, men markøren settes ETTER tegnet den sto på. Forskjellen betyr alt når du står på siste tegn i et ord.";
      return klem(s);
    case "o":
      if (iVisual) break;
      s.lines.splice(s.row + 1, 0, "");
      s.row += 1;
      s.col = 0;
      s.mode = "insert";
      s.endret = true;
      s.lagret = false;
      s.forklaring = "o = open: åpner en ny, tom linje UNDER og hopper rett i innsettingsmodus. Den vanligste måten å begynne å skrive noe nytt.";
      return klem(s);
    case "O":
      if (iVisual) break;
      s.lines.splice(s.row, 0, "");
      s.col = 0;
      s.mode = "insert";
      s.endret = true;
      s.lagret = false;
      s.forklaring = "Stor O åpner en ny linje OVER i stedet for under.";
      return klem(s);

    // ---- redigering ------------------------------------------------------
    case "x": {
      if (iVisual) break;
      const linje = s.lines[s.row];
      if (linje.length === 0) {
        s.forklaring = "Linja er tom — ingenting å slette.";
        return klem(s);
      }
      s.register = [linje[s.col]];
      s.registerType = "tegn";
      s.lines[s.row] = linje.slice(0, s.col) + linje.slice(s.col + 1);
      s.endret = true;
      s.lagret = false;
      s.forklaring = `x slettet tegnet «${linje[s.col]}» under markøren. Tenk på det som «kryss ut».`;
      return klem(s);
    }
    case "d":
      if (iVisual) {
        const u = visuellUtvalg(s);
        if (u) slettUtvalg(s, u);
        s.mode = "normal";
        s.visualAnker = null;
        s.endret = true;
        s.lagret = false;
        s.forklaring = "d slettet alt som var merket, og du er tilbake i normalmodus. Det slettede ligger i registeret.";
        return klem(s);
      }
      s.ventende = "d";
      s.forklaring = "d venter på å få vite HVA som skal slettes. dd = hele linja, dw = til neste ord. Dette er vims grammatikk: operator + bevegelse.";
      return s;
    case "y":
      if (iVisual) {
        const u = visuellUtvalg(s);
        if (u) {
          s.register = hentUtvalg(s, u);
          s.registerType = u.fra.row === u.til.row ? "tegn" : "linjer";
        }
        s.mode = "normal";
        s.visualAnker = null;
        s.forklaring = "y kopierte («yanked») det merkede til registeret. Teksten er uendret — lim inn med p.";
        return klem(s);
      }
      s.ventende = "y";
      s.forklaring = "y venter på en bevegelse. yy = hele linja, yw = ett ord.";
      return s;
    case "p": {
      if (iVisual) break;
      if (s.register.length === 0) {
        s.forklaring = "Registeret er tomt — du har ikke slettet eller kopiert noe ennå.";
        return klem(s);
      }
      if (s.registerType === "linjer") {
        s.lines.splice(s.row + 1, 0, ...s.register);
        s.row += 1;
        s.col = 0;
        s.forklaring = "p limte inn linjene fra registeret UNDER markørlinja. Stor P limer inn over.";
      } else {
        const linje = s.lines[s.row];
        const tekst = s.register.join("");
        s.lines[s.row] = linje.slice(0, s.col + 1) + tekst + linje.slice(s.col + 1);
        s.col += tekst.length;
        s.forklaring = "p limte inn tegnene fra registeret etter markøren.";
      }
      s.endret = true;
      s.lagret = false;
      return klem(s);
    }
    case "P": {
      if (iVisual) break;
      if (s.register.length === 0) {
        s.forklaring = "Registeret er tomt.";
        return klem(s);
      }
      if (s.registerType === "linjer") {
        s.lines.splice(s.row, 0, ...s.register);
        s.col = 0;
        s.forklaring = "Stor P limer inn OVER markørlinja.";
      } else {
        const linje = s.lines[s.row];
        const tekst = s.register.join("");
        s.lines[s.row] = linje.slice(0, s.col) + tekst + linje.slice(s.col);
        s.forklaring = "Stor P limer inn foran markøren.";
      }
      s.endret = true;
      s.lagret = false;
      return klem(s);
    }

    // ---- visuellmodus ----------------------------------------------------
    case "v":
      if (iVisual) {
        s.mode = "normal";
        s.visualAnker = null;
        s.forklaring = "v igjen slår av merkingen.";
        return klem(s);
      }
      s.mode = "visual";
      s.visualAnker = { row: s.row, col: s.col };
      s.forklaring =
        "v starter visuellmodus. Nå utvider bevegelsestastene en merking i stedet for bare å flytte markøren. Trykk d for å slette det merkede eller y for å kopiere det.";
      return klem(s);

    // ---- kommandolinjemodus ---------------------------------------------
    case ":":
      s.mode = "kommando";
      s.kommandolinje = "";
      s.forklaring =
        "Kolon åpner kommandolinja nederst. Det er HER du lagrer og avslutter — ikke med noen tastekombinasjon.";
      return s;

    default:
      break;
  }

  if (key.length === 1) {
    s.forklaring = iVisual
      ? `«${key}» gjør ingenting i visuellmodus. Bruk bevegelser for å utvide merkingen, d for å slette, y for å kopiere, Esc for å avbryte.`
      : `«${key}» er ingen kommando i normalmodus, så ingenting skjer. Merk at tegnet IKKE havnet i teksten — det er nettopp dette som forvirrer nye brukere.`;
  }
  return klem(s);
}

function hentUtvalg(s: VimState, u: NonNullable<ReturnType<typeof visuellUtvalg>>): string[] {
  if (u.fra.row === u.til.row) {
    return [s.lines[u.fra.row].slice(u.fra.col, u.til.col + 1)];
  }
  return s.lines.slice(u.fra.row, u.til.row + 1);
}

function slettUtvalg(s: VimState, u: NonNullable<ReturnType<typeof visuellUtvalg>>) {
  s.register = hentUtvalg(s, u);
  if (u.fra.row === u.til.row) {
    s.registerType = "tegn";
    const linje = s.lines[u.fra.row];
    s.lines[u.fra.row] = linje.slice(0, u.fra.col) + linje.slice(u.til.col + 1);
    s.row = u.fra.row;
    s.col = u.fra.col;
  } else {
    s.registerType = "linjer";
    s.lines.splice(u.fra.row, u.til.row - u.fra.row + 1);
    if (s.lines.length === 0) s.lines = [""];
    s.row = Math.min(u.fra.row, s.lines.length - 1);
    s.col = 0;
  }
}

/** Kjører innholdet på kommandolinja. Dette er der :w, :q og :wq bor. */
function kjorKommando(s: VimState): VimState {
  const c = s.kommandolinje.trim();
  s.kommandolinje = "";
  s.mode = "normal";

  const skriv = () => {
    s.endret = false;
    s.lagret = true;
  };

  switch (c) {
    case "w":
      skriv();
      s.melding = `"skript.sh" ${s.lines.length}L skrevet`;
      s.forklaring = "w = write: fila er lagret, og du er fortsatt i editoren. Dette er den vanligste kommandoen av alle.";
      return klem(s);
    case "q":
      if (s.endret) {
        s.melding = "E37: Ingen skriving siden siste endring (legg til ! for å overstyre)";
        s.forklaring =
          "vim nekter å avslutte fordi du har ulagrede endringer. Dette er ikke en feil — det er en sikring. Du har tre valg: :w for å lagre, :wq for å lagre og avslutte, eller :q! for å forkaste alt.";
        return klem(s);
      }
      s.avsluttet = true;
      s.forklaring = "q = quit: du er ute. Det var alt som skulle til.";
      return klem(s);
    case "wq":
    case "x":
      skriv();
      s.avsluttet = true;
      s.forklaring =
        "wq = write and quit: lagre og avslutt i én kommando. Den mest brukte avslutningen. (:x gjør det samme, men skriver bare hvis noe faktisk er endret.)";
      return klem(s);
    case "q!":
      s.avsluttet = true;
      s.endret = false;
      s.forklaring =
        "q! forkaster alle endringene og avslutter. Utropstegnet betyr «jeg mener det» i hele vim — det overstyrer sikringen.";
      return klem(s);
    case "wq!":
      skriv();
      s.avsluttet = true;
      s.forklaring = "Lagrer og avslutter, og overstyrer eventuelle innvendinger om skriverettigheter.";
      return klem(s);
    case "help":
    case "h":
      s.melding = "Hjelpen ville åpnet seg her. Avslutt den med :q, som alt annet.";
      s.forklaring = ":help åpner vims innebygde dokumentasjon i et eget vindu. Det lukkes med :q, som alt annet i vim.";
      return klem(s);
    case "":
      s.forklaring = "Tom kommando — ingenting skjedde.";
      return klem(s);
    default:
      if (/^\d+$/.test(c)) {
        s.row = Math.max(0, Math.min(Number(c) - 1, s.lines.length - 1));
        s.col = 0;
        s.forklaring = `:${c} hopper til linje ${c}. Nyttig når en kompilator klager på en bestemt linje.`;
        return klem(s);
      }
      if (c.startsWith("s/") || c.startsWith("%s/")) {
        const deler = c.replace(/^%?s\//, "").split("/");
        const [fra, til] = deler;
        const alle = c.startsWith("%s/");
        let antall = 0;
        const bytt = (linje: string) => {
          if (!fra || !linje.includes(fra)) return linje;
          antall++;
          return deler[2]?.includes("g") ? linje.split(fra).join(til ?? "") : linje.replace(fra, til ?? "");
        };
        s.lines = alle ? s.lines.map(bytt) : s.lines.map((l, i) => (i === s.row ? bytt(l) : l));
        if (antall > 0) {
          s.endret = true;
          s.lagret = false;
        }
        s.melding = `${antall} erstatninger`;
        s.forklaring = `Søk og erstatt. «%» betyr hele fila, «g» på slutten betyr alle treff på hver linje — uten den byttes bare det første på hver linje.`;
        return klem(s);
      }
      s.melding = `E492: Ikke en editorkommando: ${c}`;
      s.forklaring = `«:${c}» finnes ikke. De du trenger er :w (lagre), :q (avslutt), :wq (begge) og :q! (forkast).`;
      return klem(s);
  }
}

// ---------------------------------------------------------------------------
// Måloppgaver for vim: sjekk BUFFERET, ikke tastetrykkene
// ---------------------------------------------------------------------------

export type Verdict = "riktig" | "nesten" | "feil";

export interface CheckOutcome {
  verdict: Verdict;
  message: string;
}

export interface VimGoalTask {
  id: string;
  title: string;
  prompt: string;
  goal: string;
  /** Starttekst i bufferet. */
  start: string[];
  /** Én tastesekvens som løser oppgaven. Vises i lær-modus. */
  fasit: string[];
  hint: string;
  takeaway: string;
  /** Sjekker sluttilstanden i editoren. */
  check: (s: VimState) => CheckOutcome;
}

const ok = (m: string): CheckOutcome => ({ verdict: "riktig", message: m });
const near = (m: string): CheckOutcome => ({ verdict: "nesten", message: m });
const no = (m: string): CheckOutcome => ({ verdict: "feil", message: m });

const START_SKRIPT = [
  "#!/bin/bash",
  "# gammel kommentar",
  "KILDE=/home/student",
  "MAAL=/mnt/backup",
];

export const VIM_GOAL_TASKS: VimGoalTask[] = [
  {
    id: "vg1",
    title: "Kom deg ut igjen",
    prompt:
      "Den mest berømte hindringen i faget: du har åpnet en fil ved et uhell og endret ingenting. Kom deg ut av vim.",
    goal: "Editoren er avsluttet, uten at noe er lagret.",
    start: START_SKRIPT,
    fasit: [":", "q", "Enter"],
    hint: "Det er ingen tastekombinasjon. Du må åpne kommandolinja først — den åpnes med ett tegn.",
    takeaway:
      "Avslutning skjer alltid fra kommandolinjemodus: kolon, kommando, Enter. :q avslutter, :q! forkaster endringer, :wq lagrer og avslutter. Det er hele repertoaret du trenger.",
    check: (s) => {
      if (s.avsluttet && !s.lagret) return ok("Ute. Kolon åpnet kommandolinja, q avsluttet, Enter kjørte den.");
      if (s.avsluttet) return near("Du kom deg ut, men du lagret også. Her var ingenting endret, så :q alene holdt.");
      if (s.mode === "kommando") return near("Du er på kommandolinja — riktig sted. Skriv kommandoen og trykk Enter.");
      if (s.mode === "insert")
        return near("Du er i innsettingsmodus, så alt du skriver blir tekst i fila. Trykk Esc først, så kolon.");
      return no("Fortsatt inne. Alle avslutninger går via kommandolinja, som åpnes med kolon.");
    },
  },
  {
    id: "vg2",
    title: "Rett en linje og lagre",
    prompt:
      "Linje 2 er en gammel kommentar som skal bort. Slett hele linja, og lagre fila uten å avslutte.",
    goal: "Kommentarlinja er borte, fila er lagret, og du er fortsatt i editoren.",
    start: START_SKRIPT,
    fasit: ["j", "d", "d", ":", "w", "Enter"],
    hint: "Én bevegelse ned, én kommando som sletter hele linja (samme tast to ganger), og så lagring fra kommandolinja.",
    takeaway:
      "dd sletter hele linja og legger den i registeret, så p kan angre det ved å lime den inn igjen. :w lagrer uten å avslutte — den kombinasjonen bruker du hundrevis av ganger.",
    check: (s) => {
      const borte = !s.lines.some((l) => l.includes("gammel kommentar"));
      if (borte && s.lagret && !s.avsluttet) return ok("Riktig: linja er slettet og fila er skrevet til disk, og du står fortsatt i editoren.");
      if (borte && s.avsluttet) return near("Linja er borte og fila lagret, men du avsluttet også. Oppgaven ba om :w, ikke :wq.");
      if (borte && !s.lagret) return near("Linja er slettet, men endringen ligger bare i minnet. Lagre med :w.");
      if (s.lines.length === START_SKRIPT.length && s.lagret) return near("Du lagret, men linja er der ennå. Still deg på den og slett den med dd.");
      return no("Kommentarlinja står fortsatt der. Flytt deg ned med j og slett linja.");
    },
  },
  {
    id: "vg3",
    title: "Sett inn en ny linje",
    prompt:
      "Legg til linjen «set -e» rett under skallhode-linja (#!/bin/bash), og lagre og avslutt.",
    goal: "«set -e» står som linje 2, og fila er lagret og lukket.",
    start: START_SKRIPT,
    fasit: ["o", "s", "e", "t", " ", "-", "e", "Escape", ":", "w", "q", "Enter"],
    hint: "Det finnes én tast som både åpner en ny linje under og setter deg i innsettingsmodus samtidig. Husk Esc før du kan skrive en kommando.",
    takeaway:
      "o er den vanligste veien inn i innsettingsmodus: åpne ny linje under og begynn å skrive, i én tast. Og du må alltid ut av innsettingsmodus med Esc før kolon virker som kommando — ellers skriver du bare et kolon i teksten.",
    check: (s) => {
      const idx = s.lines.findIndex((l) => l.trim() === "set -e");
      if (idx === 1 && s.avsluttet && s.lagret) return ok("Perfekt: riktig linje, riktig plass, lagret og lukket.");
      if (idx === 1 && !s.avsluttet) return near("Linja står riktig. Nå gjenstår :wq for å lagre og avslutte.");
      if (idx > 1) return near(`«set -e» havnet på linje ${idx + 1}, ikke linje 2. Sto markøren på skallhode-linja da du trykket o?`);
      if (s.lines.some((l) => l.includes(":wq") || l.includes(":w")))
        return near("Se på teksten: kommandoen din havnet i fila. Du var i innsettingsmodus — trykk Esc først.");
      if (s.mode === "insert") return near("Du er i innsettingsmodus. Skriv teksten, og trykk så Esc for å kunne gi kommandoer igjen.");
      return no("«set -e» finnes ikke i fila ennå.");
    },
  },
  {
    id: "vg4",
    title: "Flytt en linje",
    prompt:
      "MAAL-linja skal stå FØR KILDE-linja. Klipp den ut og lim den inn på riktig plass. Ikke lagre.",
    goal: "Rekkefølgen er: skallhode, kommentar, MAAL, KILDE.",
    start: START_SKRIPT,
    fasit: ["j", "j", "j", "d", "d", "P"],
    hint: "dd tar linja ut og legger den i registeret. p limer inn under markøren — og den store varianten limer inn over.",
    takeaway:
      "Klipp-og-lim i vim er bare dd og p. Det er ingen egen utklippstavle: det slettede havner alltid i registeret, som er hvorfor «sletting» og «klipping» er samme operasjon.",
    check: (s) => {
      const i = s.lines.findIndex((l) => l.startsWith("KILDE="));
      const j = s.lines.findIndex((l) => l.startsWith("MAAL="));
      if (i < 0 || j < 0) return near("En av linjene er borte helt. dd la den i registeret — lim den inn igjen med p.");
      if (j < i && s.lines.length === START_SKRIPT.length) return ok("Riktig rekkefølge. dd klipte ut, og P limte inn over linja markøren sto på.");
      if (j < i) return near("Rekkefølgen er riktig, men antall linjer stemmer ikke — du har limt inn en gang for mye.");
      if (s.register.length > 0 && s.lines.length < START_SKRIPT.length)
        return near("Linja er klipt ut og ligger i registeret. Flytt markøren dit den skal og lim inn — husk at p limer UNDER, stor P limer OVER.");
      return no("Rekkefølgen er uendret. Still deg på MAAL-linja og klipp den ut med dd.");
    },
  },
  {
    id: "vg5",
    title: "Merk og slett med visuellmodus",
    prompt:
      "Slett de to siste linjene (KILDE og MAAL) i én operasjon ved å merke dem først. Ikke lagre.",
    goal: "Begge variabellinjene er borte, og du er tilbake i normalmodus.",
    start: START_SKRIPT,
    fasit: ["j", "j", "v", "j", "d"],
    hint: "Én tast starter merkingen. Så utvider du med de vanlige bevegelsestastene, og gjør noe med hele merkingen til slutt.",
    takeaway:
      "Visuellmodus snur rekkefølgen: normalt sier du først hva du vil gjøre og så på hva (dd, dw). I visuellmodus merker du først og velger operasjonen etterpå — mye lettere når du ikke helt vet hvor langt merkingen skal gå.",
    check: (s) => {
      const harKilde = s.lines.some((l) => l.startsWith("KILDE="));
      const harMaal = s.lines.some((l) => l.startsWith("MAAL="));
      if (!harKilde && !harMaal && s.mode === "normal") return ok("Begge linjene borte i én operasjon, og du er tilbake i normalmodus — det skjer automatisk når merkingen brukes.");
      if (!harKilde && !harMaal) return near("Linjene er borte, men du står ikke i normalmodus. Trykk Esc.");
      if (s.mode === "visual") return near("Du er i visuellmodus og merkingen er i gang. Utvid den til begge linjene og trykk d.");
      if (harKilde !== harMaal) return near("Bare den ene linja forsvant. Merkingen dekket ikke begge — utvid den med j før du sletter.");
      return no("Begge linjene står ennå. Start merkingen med v.");
    },
  },
];
