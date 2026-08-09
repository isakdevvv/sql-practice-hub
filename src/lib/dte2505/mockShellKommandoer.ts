// ---------------------------------------------------------------------------
// Mock-shell, lag 2: KOMMANDOENE.
//
// Tar en kommandolinje, endrer tilstanden fra mockShellTilstand.ts, og
// returnerer det terminalen ville skrevet ut pluss en exit-kode.
//
// HVA SOM VIRKER
//   ls (-l, -a, -h, -R på ett nivå av gangen), cd, pwd, mkdir (-p),
//   touch, rm (-r, -f), cp (-r), mv, cat, echo med > og >>,
//   chmod (oktalt og symbolsk, -R), chown (-R, bruker:gruppe), chgrp (-R),
//   umask (les og sett), whoami, id -un/-gn, grep (ren delstreng, én fil),
//   wc -l, true, false, sudo (kjører resten av linja som rot).
//   Variabelekspansjon $VAR og ${VAR}, enkle og doble anførselstegn,
//   flere kommandoer på én linje med ;, && og ||.
//
// HVA SOM BEVISST IKKE VIRKER — og som sier fra i stedet for å late som
//   - rør (|) og prosess-substitusjon: ingen andre prosess å sende til
//   - jokertegn (*.log): ingen globbing. Skriv filnavnene.
//   - find, tar, ps, kill, systemctl, apt: hører til andre moduler
//   - inndata-omdirigering (<) og her-dokumenter
//   - bakgrunnsjobber (&), jobbkontroll, signaler
//   Alt annet svarer «kommandoen finnes ikke i dette øvingsmiljøet», med
//   exit-kode 127, slik at det aldri ser ut som om noe lyktes.
// ---------------------------------------------------------------------------

import {
  NY_FIL_BASIS,
  NY_KATALOG_BASIS,
  SETGID,
  STICKY,
  finnNode,
  forelderAv,
  harRett,
  kanListe,
  klasseFor,
  lagNode,
  losSti,
  modeEtterUmask,
  modeTilOktal,
  navnetAv,
  tolkChmod,
  typeOgModeTilTekst,
  klonNode,
  type FsNode,
  type ShellTilstand,
} from "./mockShellTilstand";

export interface Kjoring {
  /** Kommandolinja slik den ble skrevet. */
  linje: string;
  /** Standard ut, linje for linje, uten linjeskift på slutten. */
  utdata: string[];
  /** Standard feil, linje for linje. */
  feil: string[];
  exit: number;
}

const OK = (linje: string, utdata: string[] = []): Kjoring => ({ linje, utdata, feil: [], exit: 0 });
const FEIL = (linje: string, melding: string, exit = 1): Kjoring => ({
  linje,
  utdata: [],
  feil: [melding],
  exit,
});

// ---------------------------------------------------------------------------
// Tokenisering og ekspansjon
// ---------------------------------------------------------------------------

interface Token {
  tekst: string;
  /** Sant når tokenet var et operatortegn ( > >> ) og ikke vanlig tekst. */
  operator?: ">" | ">>";
}

/** Deler en kommandolinje i ord, respekterer '…' og "…", og ekspanderer $VAR. */
export function delOpp(linje: string, miljo: Record<string, string>): Token[] {
  const tokens: Token[] = [];
  let nåværende = "";
  let harInnhold = false;
  let i = 0;

  const skyv = () => {
    if (harInnhold) tokens.push({ tekst: nåværende });
    nåværende = "";
    harInnhold = false;
  };

  while (i < linje.length) {
    const c = linje[i];
    if (c === " " || c === "\t") {
      skyv();
      i++;
      continue;
    }
    if (c === ">") {
      skyv();
      if (linje[i + 1] === ">") {
        tokens.push({ tekst: ">>", operator: ">>" });
        i += 2;
      } else {
        tokens.push({ tekst: ">", operator: ">" });
        i += 1;
      }
      continue;
    }
    if (c === "'") {
      const slutt = linje.indexOf("'", i + 1);
      const innhold = slutt === -1 ? linje.slice(i + 1) : linje.slice(i + 1, slutt);
      nåværende += innhold; // enkle anførselstegn: ingen ekspansjon
      harInnhold = true;
      i = slutt === -1 ? linje.length : slutt + 1;
      continue;
    }
    if (c === '"') {
      const slutt = linje.indexOf('"', i + 1);
      const innhold = slutt === -1 ? linje.slice(i + 1) : linje.slice(i + 1, slutt);
      nåværende += ekspander(innhold, miljo);
      harInnhold = true;
      i = slutt === -1 ? linje.length : slutt + 1;
      continue;
    }
    nåværende += c;
    harInnhold = true;
    i++;
  }
  skyv();

  return tokens.map((t) => (t.operator ? t : { tekst: ekspander(t.tekst, miljo) }));
}

export function ekspander(tekst: string, miljo: Record<string, string>): string {
  return tekst.replace(/\$\{([A-Za-z_][A-Za-z0-9_]*)\}|\$([A-Za-z_?][A-Za-z0-9_]*)/g, (_, a, b) => {
    return miljo[a ?? b] ?? "";
  });
}

// ---------------------------------------------------------------------------
// Kjøring
// ---------------------------------------------------------------------------

/** Kjører én linje. Endrer `t` direkte — klon først hvis du vil beholde den gamle. */
export function kjorLinje(t: ShellTilstand, råLinje: string): Kjoring[] {
  const utenKommentar = fjernKommentar(råLinje);
  const biter = delPaOperatorer(utenKommentar);
  const resultater: Kjoring[] = [];
  let forrigeExit = t.sisteExitkode;

  for (const bit of biter) {
    if (bit.forbinder === "&&" && forrigeExit !== 0) continue;
    if (bit.forbinder === "||" && forrigeExit === 0) continue;
    const r = kjorEnkel(t, bit.kommando);
    if (r) {
      resultater.push(r);
      forrigeExit = r.exit;
      t.sisteExitkode = r.exit;
      t.miljo["?"] = String(r.exit);
    }
  }
  return resultater;
}

/** Kjører flere linjer etter hverandre. */
export function kjorAlle(t: ShellTilstand, tekst: string): Kjoring[] {
  const ut: Kjoring[] = [];
  for (const linje of tekst.split("\n")) ut.push(...kjorLinje(t, linje));
  return ut;
}

function fjernKommentar(linje: string): string {
  let ute = true;
  let sitat = "";
  for (let i = 0; i < linje.length; i++) {
    const c = linje[i];
    if (ute && (c === "'" || c === '"')) {
      ute = false;
      sitat = c;
    } else if (!ute && c === sitat) {
      ute = true;
    } else if (ute && c === "#" && (i === 0 || /\s/.test(linje[i - 1]))) {
      return linje.slice(0, i);
    }
  }
  return linje;
}

function delPaOperatorer(linje: string): { kommando: string; forbinder: ";" | "&&" | "||" }[] {
  const ut: { kommando: string; forbinder: ";" | "&&" | "||" }[] = [];
  let nåværende = "";
  let forbinder: ";" | "&&" | "||" = ";";
  let i = 0;
  let sitat = "";
  while (i < linje.length) {
    const c = linje[i];
    if (sitat) {
      nåværende += c;
      if (c === sitat) sitat = "";
      i++;
      continue;
    }
    if (c === "'" || c === '"') {
      sitat = c;
      nåværende += c;
      i++;
      continue;
    }
    if (c === ";" || (c === "&" && linje[i + 1] === "&") || (c === "|" && linje[i + 1] === "|")) {
      ut.push({ kommando: nåværende, forbinder });
      forbinder = c === ";" ? ";" : c === "&" ? "&&" : "||";
      nåværende = "";
      i += c === ";" ? 1 : 2;
      continue;
    }
    nåværende += c;
    i++;
  }
  ut.push({ kommando: nåværende, forbinder });
  return ut.filter((b) => b.kommando.trim() !== "");
}

interface Argumenter {
  navn: string;
  kortflagg: string[];
  langflagg: string[];
  ord: string[];
  omdirigering?: { sti: string; leggTil: boolean };
}

function tolkArgumenter(t: ShellTilstand, kommando: string): Argumenter | null {
  const tokens = delOpp(kommando, t.miljo);
  if (tokens.length === 0) return null;
  const arg: Argumenter = { navn: "", kortflagg: [], langflagg: [], ord: [] };
  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];
    if (tok.operator) {
      const mål = tokens[i + 1];
      if (mål && !mål.operator) {
        arg.omdirigering = { sti: mål.tekst, leggTil: tok.operator === ">>" };
        i++;
      }
      continue;
    }
    if (arg.navn === "") {
      arg.navn = tok.tekst;
      continue;
    }
    if (tok.tekst.startsWith("--") && tok.tekst.length > 2) {
      arg.langflagg.push(tok.tekst.slice(2));
    } else if (
      tok.tekst.startsWith("-") &&
      tok.tekst.length > 1 &&
      // «-rw-r--r--» og «-1» er argumenter, ikke flagg, i praksis her
      /^-[A-Za-z]+$/.test(tok.tekst)
    ) {
      for (const c of tok.tekst.slice(1)) arg.kortflagg.push(c);
    } else {
      arg.ord.push(tok.tekst);
    }
  }
  return arg;
}

function kjorEnkel(t: ShellTilstand, kommando: string): Kjoring | null {
  const linje = kommando.trim();
  if (linje === "") return null;

  // Variabeltilordning uten kommando: NAVN=verdi
  const tilordning = linje.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
  if (tilordning) {
    const verdi = delOpp(tilordning[2], t.miljo)[0]?.tekst ?? "";
    t.miljo[tilordning[1]] = verdi;
    return OK(linje);
  }

  const arg = tolkArgumenter(t, linje);
  if (!arg) return null;

  // sudo: kjør resten som rot, og legg brukeren tilbake etterpå.
  if (arg.navn === "sudo") {
    const rest = linje.replace(/^\s*sudo\s+/, "");
    if (rest.trim() === "") return FEIL(linje, "sudo: mangler kommando");
    const gammel = t.bruker;
    t.bruker = { navn: "root", grupper: ["root"], erRot: true };
    const r = kjorEnkel(t, rest);
    t.bruker = gammel;
    return r ? { ...r, linje } : null;
  }

  const r = utfør(t, arg, linje);
  if (arg.omdirigering && r.exit === 0) {
    const skrevet = skrivTilFil(t, arg.omdirigering.sti, r.utdata, arg.omdirigering.leggTil);
    if (skrevet) return { ...r, utdata: [], feil: [...r.feil, skrevet], exit: 1 };
    return { ...r, utdata: [] };
  }
  return r;
}

// ---------------------------------------------------------------------------
// Hjelpere som alle kommandoene bruker
// ---------------------------------------------------------------------------

/** Lager en ny node i en katalog, med umask og eventuell setgid-arv. */
function opprett(
  t: ShellTilstand,
  forelder: FsNode,
  navn: string,
  type: "fil" | "katalog",
  innhold = "",
): FsNode {
  const basis = type === "katalog" ? NY_KATALOG_BASIS : NY_FIL_BASIS;
  // setgid på katalogen betyr at nye oppføringer arver KATALOGENS gruppe, ikke
  // brukerens primærgruppe. Det er hele poenget med en delt prosjektkatalog.
  const gruppe = forelder.mode & SETGID ? forelder.gruppe : t.bruker.grupper[0];
  const node = lagNode(
    navn,
    type,
    t.bruker.navn,
    gruppe,
    modeEtterUmask(basis, t.umask),
    innhold,
  );
  // setgid arves også nedover på nye underkataloger.
  if (type === "katalog" && forelder.mode & SETGID) node.mode |= SETGID;
  forelder.barn[navn] = node;
  return node;
}

/** Kan vi opprette/slette navn i denne katalogen? */
function kanEndreKatalog(t: ShellTilstand, katalog: FsNode): boolean {
  return harRett(t, katalog, "skrive") && harRett(t, katalog, "kjøre");
}

function skrivTilFil(
  t: ShellTilstand,
  sti: string,
  linjer: string[],
  leggTil: boolean,
): string | null {
  const absolutt = losSti(t, sti);
  const forelder = finnNode(t, forelderAv(absolutt));
  if (!forelder || forelder.type !== "katalog") {
    return `bash: ${sti}: ingen slik fil eller katalog`;
  }
  const navn = navnetAv(absolutt);
  let node = forelder.barn[navn];
  const tekst = linjer.length ? linjer.join("\n") + "\n" : "";
  if (!node) {
    if (!kanEndreKatalog(t, forelder)) return `bash: ${sti}: tilgang nektet`;
    node = opprett(t, forelder, navn, "fil");
  } else {
    if (node.type === "katalog") return `bash: ${sti}: er en katalog`;
    if (!harRett(t, node, "skrive")) return `bash: ${sti}: tilgang nektet`;
  }
  node.innhold = leggTil ? node.innhold + tekst : tekst;
  return null;
}

function forHverRekursivt(node: FsNode, f: (n: FsNode) => void) {
  f(node);
  for (const barn of Object.values(node.barn)) forHverRekursivt(barn, f);
}

// ---------------------------------------------------------------------------
// Selve kommandoene
// ---------------------------------------------------------------------------

function utfør(t: ShellTilstand, a: Argumenter, linje: string): Kjoring {
  switch (a.navn) {
    case "pwd":
      return OK(linje, [t.arbeidskatalog]);

    case "whoami":
      return OK(linje, [t.bruker.navn]);

    case "id": {
      if (a.kortflagg.includes("u") && a.kortflagg.includes("n")) return OK(linje, [t.bruker.navn]);
      if (a.kortflagg.includes("g") && a.kortflagg.includes("n")) return OK(linje, [t.bruker.grupper[0]]);
      return OK(linje, [`uid=${t.bruker.navn} gid=${t.bruker.grupper[0]} grupper=${t.bruker.grupper.join(",")}`]);
    }

    case "true":
      return OK(linje);
    case "false":
      return { linje, utdata: [], feil: [], exit: 1 };

    case "cd": {
      const mål = a.ord[0] ?? t.miljo.HOME ?? "/";
      const sti = losSti(t, mål);
      const node = finnNode(t, sti);
      if (!node) return FEIL(linje, `cd: ${mål}: ingen slik fil eller katalog`);
      if (node.type !== "katalog") return FEIL(linje, `cd: ${mål}: er ikke en katalog`);
      if (!harRett(t, node, "kjøre")) return FEIL(linje, `cd: ${mål}: tilgang nektet`);
      t.arbeidskatalog = sti;
      t.miljo.PWD = sti;
      return OK(linje);
    }

    case "ls":
      return lsKommando(t, a, linje);

    case "mkdir": {
      if (a.ord.length === 0) return FEIL(linje, "mkdir: mangler filnavn");
      const lagForeldre = a.kortflagg.includes("p") || a.langflagg.includes("parents");
      for (const mål of a.ord) {
        const sti = losSti(t, mål);
        if (finnNode(t, sti)) {
          if (lagForeldre) continue;
          return FEIL(linje, `mkdir: kan ikke opprette katalogen «${mål}»: filen finnes allerede`);
        }
        if (lagForeldre) {
          let node = t.rot;
          for (const del of sti.split("/").filter(Boolean)) {
            if (!node.barn[del]) {
              if (!kanEndreKatalog(t, node)) return FEIL(linje, `mkdir: kan ikke opprette katalogen «${mål}»: tilgang nektet`);
              opprett(t, node, del, "katalog");
            }
            node = node.barn[del];
            if (node.type !== "katalog") return FEIL(linje, `mkdir: «${mål}»: ikke en katalog`);
          }
        } else {
          const forelder = finnNode(t, forelderAv(sti));
          if (!forelder || forelder.type !== "katalog") {
            return FEIL(linje, `mkdir: kan ikke opprette katalogen «${mål}»: ingen slik fil eller katalog`);
          }
          if (!kanEndreKatalog(t, forelder)) {
            return FEIL(linje, `mkdir: kan ikke opprette katalogen «${mål}»: tilgang nektet`);
          }
          opprett(t, forelder, navnetAv(sti), "katalog");
        }
      }
      return OK(linje);
    }

    case "touch": {
      if (a.ord.length === 0) return FEIL(linje, "touch: mangler filnavn");
      for (const mål of a.ord) {
        const sti = losSti(t, mål);
        const finnes = finnNode(t, sti);
        if (finnes) continue; // ekte touch oppdaterer tidsstempel; vi har ingen
        const forelder = finnNode(t, forelderAv(sti));
        if (!forelder || forelder.type !== "katalog") {
          return FEIL(linje, `touch: kan ikke opprette «${mål}»: ingen slik fil eller katalog`);
        }
        if (!kanEndreKatalog(t, forelder)) {
          return FEIL(linje, `touch: kan ikke opprette «${mål}»: tilgang nektet`);
        }
        opprett(t, forelder, navnetAv(sti), "fil");
      }
      return OK(linje);
    }

    case "cat": {
      if (a.ord.length === 0) return FEIL(linje, "cat: dette øvingsmiljøet leser ikke fra tastaturet — oppgi et filnavn");
      const ut: string[] = [];
      for (const mål of a.ord) {
        const node = finnNode(t, losSti(t, mål));
        if (!node) return FEIL(linje, `cat: ${mål}: ingen slik fil eller katalog`);
        if (node.type === "katalog") return FEIL(linje, `cat: ${mål}: er en katalog`);
        if (!harRett(t, node, "lese")) return FEIL(linje, `cat: ${mål}: tilgang nektet`);
        ut.push(...node.innhold.split("\n").slice(0, -1));
        if (!node.innhold.endsWith("\n") && node.innhold !== "") {
          ut.push(node.innhold.split("\n").slice(-1)[0]);
        }
      }
      return OK(linje, ut);
    }

    case "echo": {
      // echo skriver argumentene sine, adskilt med mellomrom.
      const tokens = delOpp(linje, t.miljo).filter((tok) => !tok.operator);
      const ord = tokens.slice(1).map((tok) => tok.tekst);
      const utenN = ord[0] === "-n" ? ord.slice(1) : ord;
      return OK(linje, [utenN.join(" ")]);
    }

    case "rm":
      return rmKommando(t, a, linje);

    case "cp":
    case "mv":
      return kopierEllerFlytt(t, a, linje, a.navn === "mv");

    case "chmod":
      return chmodKommando(t, a, linje);

    case "chown":
    case "chgrp":
      return eierKommando(t, a, linje, a.navn === "chgrp");

    case "umask": {
      if (a.ord.length === 0) return OK(linje, [t.umask.toString(8).padStart(4, "0")]);
      if (!/^[0-7]{1,4}$/.test(a.ord[0])) {
        return FEIL(linje, `umask: ${a.ord[0]}: ugyldig maske (dette miljøet tar bare oktale tall)`);
      }
      t.umask = parseInt(a.ord[0], 8);
      return OK(linje);
    }

    case "grep": {
      const mønster = a.ord[0];
      const fil = a.ord[1];
      if (!mønster || !fil) {
        return FEIL(linje, "grep: dette øvingsmiljøet støtter bare «grep MØNSTER FIL» med ren tekst — ingen regulære uttrykk, ingen rør");
      }
      const node = finnNode(t, losSti(t, fil));
      if (!node || node.type !== "fil") return FEIL(linje, `grep: ${fil}: ingen slik fil eller katalog`, 2);
      if (!harRett(t, node, "lese")) return FEIL(linje, `grep: ${fil}: tilgang nektet`, 2);
      const treff = node.innhold
        .split("\n")
        .filter((l) => l !== "")
        .filter((l) => (a.kortflagg.includes("i") ? l.toLowerCase().includes(mønster.toLowerCase()) : l.includes(mønster)));
      return { linje, utdata: treff, feil: [], exit: treff.length ? 0 : 1 };
    }

    case "wc": {
      if (!a.kortflagg.includes("l") || a.ord.length === 0) {
        return FEIL(linje, "wc: dette øvingsmiljøet støtter bare «wc -l FIL»");
      }
      const node = finnNode(t, losSti(t, a.ord[0]));
      if (!node || node.type !== "fil") return FEIL(linje, `wc: ${a.ord[0]}: ingen slik fil eller katalog`);
      if (!harRett(t, node, "lese")) return FEIL(linje, `wc: ${a.ord[0]}: tilgang nektet`);
      const antall = node.innhold === "" ? 0 : node.innhold.split("\n").length - (node.innhold.endsWith("\n") ? 1 : 0);
      return OK(linje, [`${antall} ${a.ord[0]}`]);
    }

    case "stat": {
      const mål = a.ord[0];
      const node = mål ? finnNode(t, losSti(t, mål)) : null;
      if (!node) return FEIL(linje, `stat: kan ikke lese «${mål ?? ""}»: ingen slik fil eller katalog`);
      return OK(linje, [
        `  Fil: ${mål}`,
        `Tilgang: (${modeTilOktal(node.mode)}/${typeOgModeTilTekst(node)})  Uid: (${node.eier})   Gid: (${node.gruppe})`,
      ]);
    }

    default:
      return FEIL(
        linje,
        `${a.navn}: kommandoen finnes ikke i dette øvingsmiljøet. Miljøet dekker fil- og rettighetskommandoene (ls, cd, mkdir, touch, rm, cp, mv, cat, echo, chmod, chown, chgrp, umask).`,
        127,
      );
  }
}

function lsKommando(t: ShellTilstand, a: Argumenter, linje: string): Kjoring {
  const langt = a.kortflagg.includes("l") || a.langflagg.includes("long");
  const alle = a.kortflagg.includes("a") || a.langflagg.includes("all");
  const mål = a.ord[0] ?? ".";
  const sti = losSti(t, mål);
  const node = finnNode(t, sti);
  if (!node) return FEIL(linje, `ls: kan ikke åpne «${mål}»: ingen slik fil eller katalog`, 2);

  if (node.type === "fil") {
    if (!langt) return OK(linje, [mål]);
    return OK(linje, [langLinje(node, navnetAv(sti))]);
  }
  if (!harRett(t, node, "lese")) return FEIL(linje, `ls: kan ikke åpne «${mål}»: tilgang nektet`, 2);

  const navn = Object.keys(node.barn).sort();
  const synlige = alle ? [".", "..", ...navn] : navn;
  if (!langt) return OK(linje, synlige.length ? [synlige.join("  ")] : []);

  const linjer = [`totalt ${navn.length * 4}`];
  for (const n of synlige) {
    const barn = n === "." ? node : n === ".." ? (finnNode(t, forelderAv(sti)) ?? node) : node.barn[n];
    linjer.push(langLinje(barn, n));
  }
  return OK(linje, linjer);
}

function langLinje(node: FsNode, navn: string): string {
  const størrelse = node.type === "katalog" ? 4096 : node.innhold.length;
  return [
    typeOgModeTilTekst(node),
    "1",
    node.eier.padEnd(8),
    node.gruppe.padEnd(10),
    String(størrelse).padStart(5),
    navn,
  ].join(" ");
}

function rmKommando(t: ShellTilstand, a: Argumenter, linje: string): Kjoring {
  const rekursivt = a.kortflagg.includes("r") || a.kortflagg.includes("R") || a.langflagg.includes("recursive");
  const tvunget = a.kortflagg.includes("f") || a.langflagg.includes("force");
  if (a.ord.length === 0) return tvunget ? OK(linje) : FEIL(linje, "rm: mangler filnavn");
  for (const mål of a.ord) {
    const sti = losSti(t, mål);
    const node = finnNode(t, sti);
    if (!node) {
      if (tvunget) continue;
      return FEIL(linje, `rm: kan ikke fjerne «${mål}»: ingen slik fil eller katalog`);
    }
    if (node.type === "katalog" && !rekursivt) {
      return FEIL(linje, `rm: kan ikke fjerne «${mål}»: er en katalog (bruk -r)`);
    }
    const forelder = finnNode(t, forelderAv(sti));
    if (!forelder) return FEIL(linje, `rm: kan ikke fjerne «${mål}»: ingen slik fil eller katalog`);
    if (!kanEndreKatalog(t, forelder)) {
      return FEIL(linje, `rm: kan ikke fjerne «${mål}»: tilgang nektet`);
    }
    // Sticky bit: i en katalog med t kan bare eieren av filen (eller eieren av
    // katalogen, eller rot) slette. Det er derfor /tmp er 1777.
    if (
      forelder.mode & STICKY &&
      !t.bruker.erRot &&
      node.eier !== t.bruker.navn &&
      forelder.eier !== t.bruker.navn
    ) {
      return FEIL(
        linje,
        `rm: kan ikke fjerne «${mål}»: operasjonen er ikke tillatt (katalogen har sticky-bit, og filen eies av ${node.eier})`,
      );
    }
    delete forelder.barn[navnetAv(sti)];
  }
  return OK(linje);
}

function kopierEllerFlytt(t: ShellTilstand, a: Argumenter, linje: string, flytt: boolean): Kjoring {
  const navn = flytt ? "mv" : "cp";
  const rekursivt = a.kortflagg.includes("r") || a.kortflagg.includes("R") || a.langflagg.includes("recursive");
  if (a.ord.length < 2) return FEIL(linje, `${navn}: mangler målfil`);
  const kilder = a.ord.slice(0, -1);
  const målSti = losSti(t, a.ord[a.ord.length - 1]);
  const målNode = finnNode(t, målSti);

  for (const kilde of kilder) {
    const kildeSti = losSti(t, kilde);
    const kildeNode = finnNode(t, kildeSti);
    if (!kildeNode) return FEIL(linje, `${navn}: kan ikke lese «${kilde}»: ingen slik fil eller katalog`);
    if (kildeNode.type === "katalog" && !rekursivt && !flytt) {
      return FEIL(linje, `cp: -r er ikke oppgitt; hopper over katalogen «${kilde}»`);
    }
    if (!flytt && !harRett(t, kildeNode, "lese")) {
      return FEIL(linje, `cp: kan ikke lese «${kilde}»: tilgang nektet`);
    }

    const inn = målNode && målNode.type === "katalog" ? målNode : finnNode(t, forelderAv(målSti));
    const nyttNavn = målNode && målNode.type === "katalog" ? navnetAv(kildeSti) : navnetAv(målSti);
    if (!inn || inn.type !== "katalog") {
      return FEIL(linje, `${navn}: kan ikke opprette «${a.ord[a.ord.length - 1]}»: ingen slik fil eller katalog`);
    }
    if (!kanEndreKatalog(t, inn)) {
      return FEIL(linje, `${navn}: kan ikke opprette «${nyttNavn}»: tilgang nektet`);
    }

    if (flytt) {
      const gammelForelder = finnNode(t, forelderAv(kildeSti));
      if (!gammelForelder || !kanEndreKatalog(t, gammelForelder)) {
        return FEIL(linje, `mv: kan ikke flytte «${kilde}»: tilgang nektet`);
      }
      const flyttet = klonNode(kildeNode);
      flyttet.navn = nyttNavn;
      delete gammelForelder.barn[navnetAv(kildeSti)];
      inn.barn[nyttNavn] = flyttet;
    } else {
      // cp lager en NY fil: eieren blir den som kopierer, og rettighetene
      // filtreres gjennom umask. Det er den vanligste overraskelsen med cp.
      const kopi = klonNode(kildeNode);
      kopi.navn = nyttNavn;
      forHverRekursivt(kopi, (n) => {
        n.eier = t.bruker.navn;
        n.gruppe = inn.mode & SETGID ? inn.gruppe : t.bruker.grupper[0];
        n.mode = n.mode & ~t.umask;
      });
      inn.barn[nyttNavn] = kopi;
    }
  }
  return OK(linje);
}

function chmodKommando(t: ShellTilstand, a: Argumenter, linje: string): Kjoring {
  const rekursivt = a.kortflagg.includes("R") || a.langflagg.includes("recursive");
  // «chmod -x fil» ser ut som et flagg, men er et rettighetsuttrykk. Vi henter
  // det tilbake fra den rå linja hvis ord-lista mangler et uttrykk.
  let uttrykk = a.ord[0];
  let mål = a.ord.slice(1);
  const negativt = linje.match(/^\s*(?:sudo\s+)?chmod\s+(-[rwxXstugoa]+)\s+(.+)$/);
  if (negativt && !/^[0-7]/.test(uttrykk ?? "")) {
    uttrykk = negativt[1];
    mål = delOpp(negativt[2], t.miljo).map((tok) => tok.tekst);
  }
  if (!uttrykk || mål.length === 0) return FEIL(linje, "chmod: bruk: chmod MODUS FIL…");

  for (const m of mål) {
    const sti = losSti(t, m);
    const node = finnNode(t, sti);
    if (!node) return FEIL(linje, `chmod: kan ikke slå opp «${m}»: ingen slik fil eller katalog`);
    // Bare eieren og rot kan endre rettighetene på en fil.
    if (!t.bruker.erRot && node.eier !== t.bruker.navn) {
      return FEIL(linje, `chmod: endring av rettighetene til «${m}»: operasjonen er ikke tillatt (du eier ikke filen)`);
    }
    const noder = rekursivt ? samle(node) : [node];
    for (const n of noder) {
      const r = tolkChmod(uttrykk, n.mode, t.umask, n.type === "katalog");
      if (!r.ok) return FEIL(linje, r.feil ?? "chmod: ugyldig modus");
      n.mode = r.mode;
    }
  }
  return OK(linje);
}

function eierKommando(t: ShellTilstand, a: Argumenter, linje: string, kunGruppe: boolean): Kjoring {
  const navn = kunGruppe ? "chgrp" : "chown";
  const rekursivt = a.kortflagg.includes("R") || a.langflagg.includes("recursive");
  const spek = a.ord[0];
  const mål = a.ord.slice(1);
  if (!spek || mål.length === 0) {
    return FEIL(linje, `${navn}: bruk: ${navn} ${kunGruppe ? "GRUPPE" : "[EIER][:GRUPPE]"} FIL…`);
  }
  // Bare rot kan gi bort en fil. Uten sudo skal dette feile — og det er nettopp
  // det oppgaven om eierskifte skal lære.
  if (!t.bruker.erRot) {
    return FEIL(linje, `${navn}: endring av eier for «${mål[0]}»: operasjonen er ikke tillatt (bare rot kan gi bort filer — prøv sudo)`);
  }
  let nyEier: string | undefined;
  let nyGruppe: string | undefined;
  if (kunGruppe) {
    nyGruppe = spek;
  } else {
    const [e, g] = spek.split(":");
    if (e) nyEier = e;
    if (g !== undefined) nyGruppe = g === "" ? undefined : g;
  }
  for (const m of mål) {
    const node = finnNode(t, losSti(t, m));
    if (!node) return FEIL(linje, `${navn}: kan ikke slå opp «${m}»: ingen slik fil eller katalog`);
    for (const n of rekursivt ? samle(node) : [node]) {
      if (nyEier) n.eier = nyEier;
      if (nyGruppe) n.gruppe = nyGruppe;
    }
  }
  return OK(linje);
}

function samle(node: FsNode): FsNode[] {
  const ut: FsNode[] = [];
  forHverRekursivt(node, (n) => ut.push(n));
  return ut;
}

// ---------------------------------------------------------------------------
// Utskrift for grensesnittet
// ---------------------------------------------------------------------------

/** Alt en kjøring skrev ut, i riktig rekkefølge, som én liste med linjer. */
export function terminallinjer(kjøringer: Kjoring[], ledetekst = "$"): string[] {
  const ut: string[] = [];
  for (const k of kjøringer) {
    ut.push(`${ledetekst} ${k.linje.trim()}`);
    ut.push(...k.utdata, ...k.feil);
  }
  return ut;
}

/** Hjelper for oppgavesjekkene: fant noen av kjøringene på en feil? */
export function noeFeilet(kjøringer: Kjoring[]): Kjoring | undefined {
  return kjøringer.find((k) => k.exit !== 0);
}

export { klasseFor, kanListe };
