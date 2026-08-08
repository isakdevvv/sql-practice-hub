// ---------------------------------------------------------------------------
// Hjelpesystem-motoren: parser en kommandolinje, kjører den mot mock-systemet,
// og lar oppgavene sjekke MÅLET i stedet for en eksakt tekststreng.
//
// Dette er kravet i PLAN-HOST26-MODULER.md §3.1: en måloppgave skal godta alle
// kommandoer som faktisk løser oppgaven, og kunne si HVA som gikk galt når
// svaret er nesten riktig.
// ---------------------------------------------------------------------------

import {
  aproposSearch,
  whatisLookup,
  lookupBinary,
  findPage,
  pagesForName,
  HELP_TEXTS,
  NO_HELP_SUPPORT,
  INFO_NODES,
  DOC_DIRS,
  type ManSectionNum,
  type ManDbEntry,
} from "./hjelpesystemerData";

// ---------------------------------------------------------------------------
// 1. Parseren — kommandolinjas anatomi gjort til data
// ---------------------------------------------------------------------------

export interface ParsedCommand {
  raw: string;
  /** Første ord: selve kommandoen. */
  command: string;
  /** Kortflagg, allerede pakket ut: "-lah" blir ["l", "a", "h"]. */
  shortFlags: string[];
  /** Langflagg uten de to bindestrekene: "--all" blir "all". */
  longFlags: string[];
  /** Verdien til et langflagg skrevet som --sections=5. */
  longValues: Record<string, string>;
  /** Alt som verken er kommandoen eller et flagg. */
  args: string[];
  /** Rekkefølgen på flagg og argumenter, brukt til visuell oppdeling. */
  pieces: { text: string; role: "command" | "short" | "long" | "arg" }[];
}

export function parseCommand(input: string): ParsedCommand {
  const raw = input.trim();
  // Enkel tokenisering som respekterer anførselstegn.
  const tokens = raw.match(/"[^"]*"|'[^']*'|\S+/g) ?? [];
  const strip = (s: string) => s.replace(/^["']|["']$/g, "");

  const parsed: ParsedCommand = {
    raw,
    command: strip(tokens[0] ?? ""),
    shortFlags: [],
    longFlags: [],
    longValues: {},
    args: [],
    pieces: [],
  };
  if (tokens.length === 0) return parsed;

  parsed.pieces.push({ text: tokens[0], role: "command" });

  for (const tok of tokens.slice(1)) {
    if (tok.startsWith("--")) {
      const body = tok.slice(2);
      const eq = body.indexOf("=");
      if (eq >= 0) {
        const key = body.slice(0, eq);
        parsed.longFlags.push(key);
        parsed.longValues[key] = strip(body.slice(eq + 1));
      } else {
        parsed.longFlags.push(body);
      }
      parsed.pieces.push({ text: tok, role: "long" });
    } else if (tok.startsWith("-") && tok.length > 1 && !/^-\d+$/.test(tok)) {
      // Sammenslåtte kortflagg: -lah er nøyaktig det samme som -l -a -h.
      for (const ch of tok.slice(1)) parsed.shortFlags.push(ch);
      parsed.pieces.push({ text: tok, role: "short" });
    } else {
      parsed.args.push(strip(tok));
      parsed.pieces.push({ text: tok, role: "arg" });
    }
  }
  return parsed;
}

// ---------------------------------------------------------------------------
// 2. Kjøreren — hva systemet ville svart
// ---------------------------------------------------------------------------

/** Hva slags informasjon brukeren faktisk endte opp med å få. Det er DETTE
 *  måloppgavene sjekker, ikke kommandostrengen. */
export type OutcomeKind =
  | "man-page" // en full manualside ble åpnet
  | "search-hits" // et fritekstsøk ga treff
  | "search-empty" // et fritekstsøk ga null treff
  | "whatis-hits" // énlinjes oppslag traff
  | "whatis-empty"
  | "location" // vi fikk vite hvor kommandoen bor
  | "kind" // vi fikk vite om det er program, innebygd eller alias
  | "help-text" // en kort bruksanvisning ble skrevet ut
  | "info-doc" // GNU info-dokumentasjon ble åpnet
  | "doc-listing" // /usr/share/doc ble listet
  | "shell-help" // help-kommandoen for skall-innebygde
  | "error"; // kommandoen feilet

export interface HelpResult {
  kind: OutcomeKind;
  /** Terminalutdata, linje for linje. */
  lines: string[];
  /** Sider som ble åpnet eller truffet, som "passwd(5)". */
  pages: string[];
  /** Navnet kommandoen slo opp, hvis relevant. */
  subject?: string;
  /** Seksjonen som faktisk ble vist. */
  section?: ManSectionNum;
  /** Sant hvis kommandolinja i seg selv var ugyldig. */
  failed: boolean;
}

const ref = (e: { name: string; section: ManSectionNum }) => `${e.name}(${e.section})`;

function hitLines(hits: ManDbEntry[]): string[] {
  return hits.map((h) => `${h.name} (${h.section})${" ".repeat(Math.max(1, 18 - h.name.length))}- ${h.english}`);
}

function renderPage(name: string, section: ManSectionNum): string[] {
  const page = findPage(name, section);
  if (!page) return [];
  const head = `${name.toUpperCase()}(${section})${" ".repeat(20)}Manualsider${" ".repeat(20)}${name.toUpperCase()}(${section})`;
  const out = [head, "", "NAME", `       ${page.name} - ${page.oneLiner}`, "", "SYNOPSIS"];
  for (const line of page.synopsis) out.push(`       ${line.map((tk) => tk.text).join(" ")}`);
  out.push("", "DESCRIPTION", ...page.description.map((d) => `       ${d}`));
  if (page.options.length) {
    out.push("", "OPTIONS");
    for (const o of page.options) {
      const flag = [o.short, o.long].filter(Boolean).join(", ");
      out.push(`       ${flag}`, `              ${o.text}`);
    }
  }
  if (page.seeAlso.length) out.push("", "SEE ALSO", `       ${page.seeAlso.join(", ")}`);
  out.push("", "(Trykk q for å avslutte. Mellomrom blar videre, /ord søker.)");
  return out;
}

export function runHelpCommand(input: string): HelpResult {
  const p = parseCommand(input);
  const fail = (msg: string): HelpResult => ({ kind: "error", lines: [msg], pages: [], failed: true });

  if (!p.command) return fail("Skriv en kommando.");

  // ---- man ---------------------------------------------------------------
  if (p.command === "man") {
    // man -k / --apropos = fritekstsøk
    if (p.shortFlags.includes("k") || p.longFlags.includes("apropos")) {
      return doApropos(p.args[0] ?? "");
    }
    // man -f / --whatis = énlinjes oppslag
    if (p.shortFlags.includes("f") || p.longFlags.includes("whatis")) {
      return doWhatis(p.args[0] ?? "");
    }
    if (p.longFlags.includes("help") || p.shortFlags.includes("h")) {
      return { kind: "help-text", lines: HELP_TEXTS.man, pages: [], subject: "man", failed: false };
    }

    // Seksjon kan komme som argument (man 5 passwd) eller som -s 5 / --sections=5.
    let section: ManSectionNum | undefined;
    const rest = [...p.args];
    if (p.longValues.sections) section = Number(p.longValues.sections) as ManSectionNum;
    if (rest.length > 1 && /^[1-8]$/.test(rest[0])) section = Number(rest.shift()) as ManSectionNum;
    else if (p.shortFlags.includes("s") && /^[1-8]$/.test(rest[0] ?? "")) section = Number(rest.shift()) as ManSectionNum;

    const name = rest[0];
    if (!name) return fail("Hva vil du lese om?\nMan-siden hentes med: man [SEKSJON] SIDE");

    const all = pagesForName(name);
    if (all.length === 0) {
      return {
        kind: "error",
        lines: [`Ingen manualside for ${name}`],
        pages: [],
        subject: name,
        failed: false,
      };
    }
    if (section && !all.some((a) => a.section === section)) {
      return {
        kind: "error",
        lines: [`Ingen manualside for ${name} i seksjon ${section}`],
        pages: [],
        subject: name,
        failed: false,
      };
    }
    const wantAll = p.shortFlags.includes("a") || p.longFlags.includes("all");
    const chosen = section ? all.filter((a) => a.section === section) : wantAll ? all : [all[0]];
    return {
      kind: "man-page",
      lines: chosen.flatMap((c) => renderPage(c.name, c.section)),
      pages: chosen.map(ref),
      subject: name,
      section: chosen[0].section,
      failed: false,
    };
  }

  // ---- apropos -----------------------------------------------------------
  if (p.command === "apropos") return doApropos(p.args[0] ?? "");

  // ---- whatis ------------------------------------------------------------
  if (p.command === "whatis") return doWhatis(p.args[0] ?? "");

  // ---- which -------------------------------------------------------------
  if (p.command === "which") {
    const name = p.args[0];
    if (!name) return fail("which trenger et kommandonavn.");
    const b = lookupBinary(name);
    if (!b || !b.path) {
      return {
        kind: "error",
        lines: [`which: ingen ${name} i PATH`, "(which leter bare etter FILER i PATH — den kjenner ikke skall-innebygde kommandoer.)"],
        pages: [],
        subject: name,
        failed: false,
      };
    }
    return { kind: "location", lines: [b.path], pages: [], subject: name, failed: false };
  }

  // ---- command -v (samme jobb som which, men innebygd) --------------------
  if (p.command === "command" && (p.shortFlags.includes("v") || p.args[0] === "-v")) {
    const name = p.args.find((a) => a !== "-v");
    if (!name) return fail("command -v trenger et kommandonavn.");
    const b = lookupBinary(name);
    if (!b) return { kind: "error", lines: [`command: ${name}: ikke funnet`], pages: [], subject: name, failed: false };
    return {
      kind: b.path ? "location" : "kind",
      lines: [b.path ?? name],
      pages: [],
      subject: name,
      failed: false,
    };
  }

  // ---- type --------------------------------------------------------------
  if (p.command === "type") {
    const name = p.args[0];
    if (!name) return fail("type trenger et kommandonavn.");
    const b = lookupBinary(name);
    if (!b) return { kind: "error", lines: [`bash: type: ${name}: ikke funnet`], pages: [], subject: name, failed: false };
    const onlyType = p.shortFlags.includes("t");
    const lines: string[] = [];
    if (b.kind === "builtin") {
      lines.push(onlyType ? "builtin" : `${name} er en skall-innebygd kommando`);
      if (b.path && !onlyType) lines.push(`${name} er ${b.path}`, "(Begge finnes! Skallet bruker den innebygde med mindre du skriver full bane.)");
    } else if (b.kind === "keyword") {
      lines.push(onlyType ? "keyword" : `${name} er et reservert ord i skallet`);
    } else if (b.kind === "alias") {
      lines.push(onlyType ? "alias" : `${name} er et alias for \`${b.aliasFor}'`);
    } else {
      lines.push(onlyType ? "file" : `${name} er ${b.path}`);
    }
    return { kind: "kind", lines, pages: [], subject: name, failed: false };
  }

  // ---- whereis -----------------------------------------------------------
  if (p.command === "whereis") {
    const name = p.args[0];
    if (!name) return fail("whereis trenger et kommandonavn.");
    const b = lookupBinary(name);
    const parts = [b?.path, b?.srcPath, b?.manPath].filter(Boolean);
    return {
      kind: b && parts.length ? "location" : "error",
      lines: [`${name}: ${parts.join(" ")}`.trim()],
      pages: [],
      subject: name,
      failed: false,
    };
  }

  // ---- info --------------------------------------------------------------
  if (p.command === "info") {
    const name = p.args[0];
    if (!name) return { kind: "info-doc", lines: ["Toppnivå: alle installerte info-dokumenter.", ...Object.keys(INFO_NODES).map((k) => `* ${k}`)], pages: [], failed: false };
    const doc = INFO_NODES[name];
    if (!doc) {
      const page = findPage(name);
      return {
        kind: "info-doc",
        lines: page
          ? [`info: ingen egen info-fil for ${name} — viser manualsiden i stedet.`, "", ...renderPage(page.name, page.section).slice(0, 8)]
          : [`info: ingen dokumentasjon for ${name}`],
        pages: page ? [ref(page)] : [],
        subject: name,
        failed: false,
      };
    }
    return {
      kind: "info-doc",
      lines: [
        `File: ${name}.info,  Node: Top`,
        "",
        doc.top,
        "",
        "* Menu:",
        ...doc.nodes.map((n) => `* ${n}::`),
        "",
        "(Naviger med Tab mellom noder, Enter for å gå inn, u for opp, q for å avslutte.)",
      ],
      pages: [],
      subject: name,
      failed: false,
    };
  }

  // ---- help (skall-innebygd) ---------------------------------------------
  if (p.command === "help") {
    const name = p.args[0];
    if (!name) return { kind: "shell-help", lines: ["Skall-innebygde kommandoer: cd, export, type, alias, umask, help, ...", "Skriv help NAVN for én av dem."], pages: [], failed: false };
    const b = lookupBinary(name);
    if (b?.kind === "builtin" || b?.kind === "keyword") {
      return { kind: "shell-help", lines: [`${name}: innebygd i skallet. help ${name} viser bruken — man ${name} finner ingenting, for det finnes ingen egen fil.`], pages: [], subject: name, failed: false };
    }
    return { kind: "error", lines: [`bash: help: ingen hjelpeemner samsvarer med \`${name}'. Prøv man ${name}.`], pages: [], subject: name, failed: false };
  }

  // ---- ls /usr/share/doc -------------------------------------------------
  if (p.command === "ls" && p.args.some((a) => a.startsWith("/usr/share/doc"))) {
    const target = p.args.find((a) => a.startsWith("/usr/share/doc"))!;
    const sub = target.replace(/^\/usr\/share\/doc\/?/, "").replace(/\/$/, "");
    if (!sub) return { kind: "doc-listing", lines: DOC_DIRS.map((d) => d.pkg), pages: [], failed: false };
    const d = DOC_DIRS.find((x) => x.pkg === sub);
    return d
      ? { kind: "doc-listing", lines: d.files, pages: [], subject: sub, failed: false }
      : { kind: "error", lines: [`ls: kan ikke åpne '${target}': ingen slik fil eller katalog`], pages: [], failed: false };
  }

  // ---- vilkårlig kommando med --help / -h --------------------------------
  if (p.longFlags.includes("help") || (p.shortFlags.includes("h") && p.command !== "ls")) {
    const text = HELP_TEXTS[p.command];
    if (text) return { kind: "help-text", lines: text, pages: [], subject: p.command, failed: false };
    if (NO_HELP_SUPPORT.includes(p.command)) {
      return {
        kind: "error",
        lines: [`${p.command}: ukjent opsjon -- 'help'`, `Bruk: ${p.command} [opsjoner]`, `Prøv \`man ${p.command}' for full dokumentasjon.`],
        pages: [],
        subject: p.command,
        failed: false,
      };
    }
    return { kind: "error", lines: [`${p.command}: kommandoen finnes ikke i dette øvingsmiljøet.`], pages: [], failed: true };
  }

  // ls -h er IKKE hjelp — det er --human-readable. Klassisk felle.
  if (p.command === "ls" && p.shortFlags.includes("h")) {
    return {
      kind: "error",
      lines: [
        "total 24",
        "drwxr-xr-x 2 kari studenter 4,0K  8. aug 09:12  notater",
        "-rw-r--r-- 1 kari studenter  12K  8. aug 09:15  rapport.txt",
        "",
        "(Dette er en vanlig fillisting. For ls betyr -h «human-readable», altså 12K i stedet for 12288.)",
      ],
      pages: [],
      subject: "ls",
      failed: false,
    };
  }

  const known = lookupBinary(p.command);
  if (known) {
    return {
      kind: "error",
      lines: [`${p.command}: kommandoen finnes, men gjør ikke noe nyttig her. Dette øvingsmiljøet svarer bare på hjelpekommandoene.`],
      pages: [],
      subject: p.command,
      failed: true,
    };
  }
  return { kind: "error", lines: [`bash: ${p.command}: kommandoen finnes ikke`], pages: [], failed: true };
}

function doApropos(term: string): HelpResult {
  if (!term) return { kind: "error", lines: ["apropos: hva vil du søke etter?"], pages: [], failed: true };
  const hits = aproposSearch(term);
  if (hits.length === 0) {
    return {
      kind: "search-empty",
      lines: [`${term}: ingenting passende.`],
      pages: [],
      subject: term,
      failed: false,
    };
  }
  return { kind: "search-hits", lines: hitLines(hits), pages: hits.map(ref), subject: term, failed: false };
}

function doWhatis(name: string): HelpResult {
  if (!name) return { kind: "error", lines: ["whatis: hvilket navn?"], pages: [], failed: true };
  const hits = whatisLookup(name);
  if (hits.length === 0) {
    return {
      kind: "whatis-empty",
      lines: [`${name}: ingenting passende.`, "(whatis krever EKSAKT navn. Vil du søke i beskrivelsene, bruk apropos.)"],
      pages: [],
      subject: name,
      failed: false,
    };
  }
  return { kind: "whatis-hits", lines: hitLines(hits), pages: hits.map(ref), subject: name, failed: false };
}

// ---------------------------------------------------------------------------
// 3. Måltilstand-sjekken
// ---------------------------------------------------------------------------

export type Verdict = "riktig" | "nesten" | "feil";

export interface CheckOutcome {
  verdict: Verdict;
  /** Forklaringen studenten får. Ved «nesten» skal den si hva som manglet. */
  message: string;
}

export interface GoalTask {
  id: string;
  title: string;
  /** Situasjonen, skrevet som noe studenten vil OPPNÅ. */
  prompt: string;
  /** Hva som teller som løst — vises i lær-modus og etter fasit. */
  goal: string;
  /** Eksempler på løsninger som godtas. Ikke uttømmende — sjekken er bredere. */
  accepted: string[];
  hint: string;
  /** Måltilstand-predikatet. Får både parsingen og resultatet av kjøringen. */
  check: (p: ParsedCommand, r: HelpResult) => CheckOutcome;
  /** Hvorfor dette er verdt å kunne — vises etter riktig svar. */
  takeaway: string;
}

const ok = (message: string): CheckOutcome => ({ verdict: "riktig", message });
const near = (message: string): CheckOutcome => ({ verdict: "nesten", message });
const no = (message: string): CheckOutcome => ({ verdict: "feil", message });

/** Traff søket/oppslaget en bestemt side, f.eks. "chown(1)"? */
const found = (r: HelpResult, page: string) => r.pages.includes(page);

export const GOAL_TASKS: GoalTask[] = [
  {
    id: "g1",
    title: "Finn kommandoen når du ikke husker navnet",
    prompt:
      "Du vil endre hvem som eier en fil, men du husker ikke hva kommandoen heter. Du vet bare hva du vil oppnå. Hva skriver du?",
    goal: "Et fritekstsøk i manualens beskrivelser som får chown(1) opp i trefflisten.",
    accepted: ["apropos owner", "man -k owner", "apropos own", "man --apropos ownership"],
    hint: "Du kjenner betydningen, ikke navnet. Da er det beskrivelsene du må søke i — ikke navnene.",
    check: (p, r) => {
      if (r.kind === "search-hits" && found(r, "chown(1)")) {
        return ok(`Truffet. \`${p.command}\` søkte i beskrivelsene og fant chown(1) — «change file owner and group».`);
      }
      if (r.kind === "search-hits") {
        return near(
          `Du brukte riktig verktøy (fritekstsøk), men søkeordet «${r.subject}» traff ikke chown. Prøv et ord som står i den engelske beskrivelsen, for eksempel owner.`,
        );
      }
      if (r.kind === "search-empty") {
        return near(
          `Riktig verktøy, feil søkeord: «${r.subject}» ga null treff. Manualdatabasen er på engelsk, og apropos leter etter delstrenger — prøv owner.`,
        );
      }
      if (p.command === "man" && r.kind === "error") {
        return near(
          `\`man ${p.args.join(" ")}\` slår opp EKSAKT navn, og det finnes ingen kommando som heter det. Du vil søke i beskrivelsene i stedet: legg til -k, eller bruk apropos.`,
        );
      }
      if (p.command === "man" && r.kind === "man-page") {
        return near("Du fikk opp en manualside, men du visste jo ikke navnet på forhånd. Poenget med oppgaven er søket: apropos eller man -k.");
      }
      if (r.kind === "whatis-hits" || r.kind === "whatis-empty") {
        return near("whatis krever eksakt navn og gir bare énlinjes svar. Når du ikke kjenner navnet, er det apropos (eller man -k) som er verktøyet.");
      }
      if (p.command === "which" || p.command === "whereis" || p.command === "type") {
        return no(`\`${p.command}\` svarer på HVOR en kommando du allerede har navnet på ligger. Her mangler du navnet — det er et søk du trenger.`);
      }
      return no("Ikke helt. Du trenger å søke i beskrivelsene til manualsidene, ikke i navnene.");
    },
    takeaway:
      "apropos og man -k er nøyaktig samme verktøy. Regelen: kjenner du navnet, bruk man. Kjenner du bare hva du vil oppnå, bruk apropos.",
  },
  {
    id: "g2",
    title: "Les filformatet, ikke kommandoen",
    prompt:
      "Du skal forstå kolonnene i filen /etc/passwd. Men `man passwd` gir deg kommandoen som endrer passord. Hvordan får du fram dokumentasjonen for filformatet?",
    goal: "Åpne passwd i seksjon 5 (filformater), ikke seksjon 1.",
    accepted: ["man 5 passwd", "man -s 5 passwd", "man --sections=5 passwd"],
    hint: "Navnet er ikke nok til å peke ut en manualside. Identiteten er navn PLUSS seksjon.",
    check: (_p, r) => {
      if (r.kind === "man-page" && found(r, "passwd(5)") && r.pages.length === 1) {
        return ok("Riktig. Seksjonsnummeret foran navnet peker rett på filformat-siden.");
      }
      if (r.kind === "man-page" && found(r, "passwd(5)")) {
        return near("Du fikk med passwd(5), men du fikk også de andre seksjonene (du brukte -a/--all). Det virker, men er unødvendig — oppgi seksjon 5 direkte.");
      }
      if (r.kind === "man-page" && found(r, "passwd(1)")) {
        return near("Dette er seksjon 1, altså kommandoen. Uten seksjonsnummer velger man alltid den laveste seksjonen. Sett 5 foran navnet.");
      }
      if (r.kind === "search-hits" || r.kind === "whatis-hits") {
        return near("Søket ditt viser deg at passwd(5) finnes — men du har ikke åpnet siden. Neste steg er å be om nettopp den seksjonen.");
      }
      return no("Ikke helt. Du skal åpne selve manualsiden for filformatet.");
    },
    takeaway:
      "En manualside identifiseres av navn + seksjon. Skriver du bare navnet, får du den laveste seksjonen — som nesten alltid er kommandoen, ikke filen.",
  },
  {
    id: "g3",
    title: "Program eller innebygd i skallet?",
    prompt:
      "Du lurer på om `cd` er et program på disken eller noe skallet gjør selv. Hvordan finner du ut av det?",
    goal: "Få bekreftet at cd er en skall-innebygd kommando (engelsk: builtin).",
    accepted: ["type cd", "type -t cd", "help cd"],
    hint: "Ett av verktøyene leter bare etter FILER. Et annet spør skallet selv.",
    check: (p, r) => {
      if (r.kind === "kind" && r.subject === "cd") return ok("Riktig. `type` spør skallet, og skallet vet at cd er innebygd i det selv.");
      if (r.kind === "shell-help" && r.subject === "cd") return ok("Godtatt. `help` finnes bare for skall-innebygde kommandoer, så at den svarer er i seg selv beviset.");
      if (p.command === "which" && r.subject === "cd")
        return near(
          "Nesten — og feilmeldingen er faktisk et hint. `which` leter kun etter filer i PATH, så den finner aldri innebygde kommandoer. Bruk `type cd`, som spør skallet.",
        );
      if (p.command === "whereis") return near("`whereis` leter etter filer på faste steder på disken. cd har ingen fil, så du får et tomt svar som ikke forklarer hvorfor. `type cd` gir deg svaret direkte.");
      if (p.command === "man" && r.kind === "error")
        return near("Riktig instinkt, feil verktøy: innebygde kommandoer har ingen egen manualside. De er dokumentert inne i bash(1), eller via `help cd`.");
      return no("Ikke helt. Du trenger et verktøy som kan skille mellom program, alias, reservert ord og skall-innebygd.");
    },
    takeaway:
      "which = «finnes det en fil?». type = «hva ville skallet faktisk gjort?». Bare type kjenner innebygde kommandoer, alias og reserverte ord.",
  },
  {
    id: "g4",
    title: "Rask oversikt over flaggene",
    prompt:
      "Du er midt i noe og trenger bare å se hvilke flagg `grep` har. Du vil ikke åpne hele manualen og bla. Hva gjør du?",
    goal: "Få den korte bruksanvisningen programmet selv skriver ut.",
    accepted: ["grep --help"],
    hint: "De fleste GNU-programmer kan skrive ut sin egen korte hjelpetekst.",
    check: (p, r) => {
      if (r.kind === "help-text" && r.subject === "grep") return ok("Riktig. `--help` kommer fra programmet selv, ikke fra manualdatabasen, og skriver rett til terminalen.");
      if (p.command === "man" && found(r, "grep(1)"))
        return near("Det virker, men er akkurat det oppgaven ba deg unngå: du havner i søkeleseren og må bla. `grep --help` gir deg flaggene direkte.");
      if (r.kind === "error" && p.command === "grep") return near("Nesten riktig kommando. Sjekk skrivemåten: den lange formen har to bindestreker, `--help`.");
      return no("Ikke helt. Her vil du at programmet selv skal skrive ut sin korte bruksanvisning.");
    },
    takeaway:
      "--help er innebygd i programmet og krever ingen manualdatabase. Ulempen: den er ikke garantert å finnes, og eldre kommandoer som passwd svarer med en feilmelding.",
  },
  {
    id: "g5",
    title: "Hvilke seksjoner finnes for dette navnet?",
    prompt:
      "Du har hørt at `printf` finnes både som skallkommando og som C-funksjon. Hvordan sjekker du raskt hvilke seksjoner navnet finnes i, uten å åpne noen side?",
    goal: "Få en énlinjes oversikt som viser printf i både seksjon 1 og seksjon 3.",
    accepted: ["whatis printf", "man -f printf"],
    hint: "Du kjenner det eksakte navnet. Du vil ha oversikt, ikke innhold.",
    check: (p, r) => {
      if (r.kind === "whatis-hits" && found(r, "printf(1)") && found(r, "printf(3)"))
        return ok("Riktig. Én linje per seksjon, med beskrivelsen — akkurat nok til å velge hvilken side du faktisk vil åpne.");
      if (r.kind === "search-hits" && found(r, "printf(3)"))
        return near("Det virker, men apropos søker med delstreng i alle beskrivelser og gir deg mer støy enn du ba om. Når navnet er eksakt, er whatis (eller man -f) det presise valget.");
      if (r.kind === "man-page") return near("Nå åpnet du en side. Oppgaven var å få oversikten FØR du velger side — det er nettopp jobben til whatis.");
      if (p.command === "which" || p.command === "whereis") return no(`\`${p.command}\` svarer på hvor filer ligger, ikke på hvilke manualseksjoner et navn har.`);
      return no("Ikke helt. Du vil ha den korte oversiktslinja for et eksakt navn.");
    },
    takeaway: "whatis er identisk med man -f: eksakt navn inn, én linje per seksjon ut. apropos er det brede søket, whatis det smale oppslaget.",
  },
  {
    id: "g6",
    title: "Hvor ligger programmet?",
    prompt:
      "En kollega spør hvilken fil som faktisk kjøres når du skriver `grep`. Finn banen.",
    goal: "Vise filbanen /usr/bin/grep.",
    accepted: ["which grep", "type grep", "whereis grep", "command -v grep"],
    hint: "Flere verktøy kan svare på dette. Velg ett.",
    check: (p, r) => {
      if ((r.kind === "location" || r.kind === "kind") && r.subject === "grep" && r.lines.some((l) => l.includes("/usr/bin/grep")))
        return ok(`Riktig — \`${p.command}\` viser at grep er filen /usr/bin/grep.`);
      if (p.command === "man") return no("Manualsiden forteller hva grep gjør, ikke hvor filen ligger.");
      return no("Ikke helt. Du leter etter selve filbanen til programmet.");
    },
    takeaway:
      "which, type og whereis overlapper, men svarer på litt ulike spørsmål: which = første treff i PATH, type = hva skallet gjør, whereis = program + kilde + manualside.",
  },
  {
    id: "g7",
    title: "Når manualsiden ikke er nok",
    prompt:
      "Du skal lære deg coreutils skikkelig, og manualsiden er bare en oppslagstabell. GNU-prosjektet har en lengre, kapittelinndelt dokumentasjon. Hvordan åpner du den?",
    goal: "Åpne GNU info-dokumentasjonen for coreutils.",
    accepted: ["info coreutils"],
    hint: "GNU sitt eget dokumentasjonssystem lever ved siden av manualen, ikke inni den.",
    check: (p, r) => {
      if (r.kind === "info-doc" && r.subject === "coreutils" && r.lines.some((l) => l.includes("Node: Top")))
        return ok("Riktig. info åpner et tre av noder med en meny på toppen — laget for å leses fra start, ikke bare slås opp i.");
      if (r.kind === "info-doc") return near(`Riktig verktøy, men «${r.subject}» har ingen egen info-fil i dette systemet. Prøv coreutils.`);
      if (p.command === "man") return near("Manualsiden er nettopp det oppgaven sier ikke er nok. GNU sin lange dokumentasjon åpnes med et annet program.");
      return no("Ikke helt. GNU har et eget dokumentasjonssystem ved siden av manualen.");
    },
    takeaway:
      "man-sider er oppslagsverk, info-dokumenter er lærebøker. GNU-verktøy har ofte begge, og manualsiden nevner det nederst: «The full documentation is maintained as a Texinfo manual.»",
  },
];

// ---------------------------------------------------------------------------
// 4. Feilsøkingsoppgavene (oppgavetype 4)
// ---------------------------------------------------------------------------

export interface TroubleTask {
  id: string;
  title: string;
  /** Det som skjedde — kommando og faktisk utdata. */
  transcript: { cmd: string; output: string[] }[];
  /** Spørsmålet studenten skal svare på. */
  question: string;
  /** Diagnosealternativer. Nøyaktig én er riktig. */
  options: { id: string; label: string; why: string; correct?: boolean }[];
  /** Hva som faktisk fikser det, med forklaring. */
  fix: { cmd: string; text: string };
  /** Den generelle lærdommen. */
  lesson: string;
}

export const TROUBLE_TASKS: TroubleTask[] = [
  {
    id: "t1",
    title: "Feil seksjon",
    transcript: [
      {
        cmd: "man printf",
        output: ["PRINTF(1)", "NAME", "       printf - format and print data", "SYNOPSIS", "       printf FORMAT [ARGUMENT]..."],
      },
    ],
    question:
      "Du skriver C-kode og trengte funksjonssignaturen til printf(). I stedet fikk du en skallkommando med FORMAT og ARGUMENT. Hva er årsaken?",
    options: [
      {
        id: "a",
        label: "printf-funksjonen i C har ingen manualside — den er bare dokumentert i C-standarden.",
        why: "Den finnes: printf(3). Alle vanlige C-bibliotekfunksjoner har manualsider i seksjon 3.",
      },
      {
        id: "b",
        label: "Uten seksjonsnummer velger man den laveste seksjonen som har en side med dette navnet, og det er seksjon 1.",
        why: "Nettopp. Navnet alene er tvetydig; seksjonen avgjør hvilken av sidene du får.",
        correct: true,
      },
      {
        id: "c",
        label: "Manualdatabasen er utdatert og må bygges på nytt med mandb.",
        why: "Nei — du fikk jo en fullgod side. Databasen fant noe, den fant bare noe annet enn du ville ha.",
      },
      {
        id: "d",
        label: "C-funksjoner må slås opp med info, ikke med man.",
        why: "info har mer om GNU C-biblioteket, men man 3 printf finnes og er det raskeste svaret.",
      },
    ],
    fix: {
      cmd: "man 3 printf",
      text: "Seksjon 3 er bibliotekfunksjonene. Vil du se hvilke seksjoner navnet finnes i før du velger, kjør whatis printf først — eller man -a printf for å bla gjennom alle.",
    },
    lesson:
      "Når du får «riktig navn, feil innhold», er det nesten alltid seksjonen som er problemet. Sjekk med whatis, velg med tall.",
  },
  {
    id: "t2",
    title: "Søket som aldri treffer",
    transcript: [
      { cmd: "apropos nettverk", output: ["nettverk: ingenting passende."] },
      { cmd: "apropos network", output: ["socket (2)         - create an endpoint for communication", "socket (7)         - Linux socket interface", "..."] },
    ],
    question:
      "Systemet har åpenbart manualsider om nettverk. Hvorfor ga det norske søkeordet null treff?",
    options: [
      {
        id: "a",
        label: "apropos søker i NAME-linjene, og de er på engelsk. Søkeordet må matche teksten som faktisk står der.",
        why: "Riktig. apropos gjør en ren delstreng-sammenligning mot den indekserte engelske beskrivelsen — den oversetter ingenting.",
        correct: true,
      },
      {
        id: "b",
        label: "apropos tåler ikke bokstavene æ, ø og å.",
        why: "Ordet «nettverk» har ingen av dem, og søket feilet likevel.",
      },
      {
        id: "c",
        label: "Du må være rot-bruker for å søke i manualdatabasen.",
        why: "Nei — det andre søket virket, og det ble kjørt av samme bruker.",
      },
      {
        id: "d",
        label: "apropos krever minst to søkeord.",
        why: "Nei, ett ord holder — «network» alene ga full treffliste.",
      },
    ],
    fix: {
      cmd: "apropos network",
      text: "Søk på det engelske ordet. Vet du ikke hvilket ord som brukes, prøv flere: socket, tcp, route, interface.",
    },
    lesson:
      "Tomt søkeresultat betyr ikke at dokumentasjonen mangler. Det betyr at ordet ditt ikke sto i indeksen — enten fordi språket er feil, eller fordi indeksen ikke er bygget.",
  },
  {
    id: "t3",
    title: "Nyinstallert program, ingen manualside",
    transcript: [
      { cmd: "sudo apt install mittverktoy", output: ["Setting up mittverktoy (2.1-1) ...", "Processing triggers for man-db (2.11.2-2) ..."] },
      { cmd: "apropos mittverktoy", output: ["mittverktoy: ingenting passende."] },
      { cmd: "man mittverktoy", output: ["MITTVERKTOY(1)", "NAME", "       mittverktoy - gjør noe nyttig"] },
    ],
    question:
      "`man` finner siden, men `apropos` sier at den ikke finnes. Hvordan henger det sammen?",
    options: [
      {
        id: "a",
        label: "man leter i filsystemet etter selve siden, mens apropos slår opp i en forhåndsbygget indeks over NAME-linjene. Indeksen er ikke oppdatert ennå.",
        why: "Nettopp. De to bruker to forskjellige kilder, og bare den ene er en cache som kan bli foreldet.",
        correct: true,
      },
      {
        id: "b",
        label: "apropos viser bare sider fra seksjon 1, og denne ligger i en annen seksjon.",
        why: "Nei — apropos søker i alle seksjoner, og siden er dessuten i seksjon 1.",
      },
      {
        id: "c",
        label: "Siden mangler en SYNOPSIS, og da hopper apropos over den.",
        why: "apropos bryr seg bare om NAME-linja. SYNOPSIS er irrelevant for indeksen.",
      },
      {
        id: "d",
        label: "Pakken installerte manualsiden utenfor MANPATH.",
        why: "Da ville man heller ikke funnet den. man fant den, så banen er riktig.",
      },
    ],
    fix: {
      cmd: "sudo mandb",
      text: "mandb(8) bygger indeksen over NAME-linjene på nytt. Etterpå finner både apropos og whatis den nye siden. Systemet gjør dette selv med jevne mellomrom, men ikke nødvendigvis i samme sekund som installasjonen.",
    },
    lesson:
      "man og apropos svikter på hver sin måte. man svikter når filen mangler; apropos og whatis svikter når indeksen er gammel. Én tom treffliste er derfor aldri bevis for at noe ikke finnes.",
  },
  {
    id: "t4",
    title: "Kommandoen virker, men which finner den ikke",
    transcript: [
      { cmd: "cd /etc", output: ["(ingen utskrift — det virket)"] },
      { cmd: "which cd", output: ["which: ingen cd i PATH"] },
    ],
    question: "Kommandoen kjører helt fint. Hvorfor sier which at den ikke finnes?",
    options: [
      {
        id: "a",
        label: "cd er innebygd i skallet, og which leter bare etter kjørbare FILER i katalogene som står i PATH.",
        why: "Riktig. En innebygd kommando har ingen fil noe sted — den er kode inne i selve bash-programmet.",
        correct: true,
      },
      {
        id: "b",
        label: "PATH er satt feil for denne brukeren.",
        why: "Da ville en hel del andre kommandoer også sluttet å virke, ikke bare oppslaget på cd.",
      },
      {
        id: "c",
        label: "cd krever rot-rettigheter for å slås opp.",
        why: "Oppslag i PATH krever ingen spesielle rettigheter.",
      },
      {
        id: "d",
        label: "which er utdatert og erstattet av whereis.",
        why: "whereis ville gitt like tomt svar — den leter også bare etter filer.",
      },
    ],
    fix: {
      cmd: "type cd",
      text: "type spør skallet i stedet for filsystemet, og svarer «cd er en skall-innebygd kommando». Vil du ha dokumentasjonen, er det help cd — ikke man cd.",
    },
    lesson:
      "cd MÅ være innebygd. Et eget program ville byttet katalog i sin egen prosess og så avsluttet, og skallet ditt hadde stått igjen nøyaktig der det var.",
  },
  {
    id: "t5",
    title: "--help som ikke finnes",
    transcript: [
      { cmd: "passwd --help", output: ["passwd: ukjent opsjon -- 'help'", "Bruk: passwd [opsjoner]", "Prøv `man passwd' for full dokumentasjon."] },
    ],
    question: "Hvorfor svarer ikke passwd på --help, når ls gjør det?",
    options: [
      {
        id: "a",
        label: "--help er ikke en del av operativsystemet. Hvert program må selv velge å implementere det, og eldre verktøy utenfor GNU coreutils gjør ofte ikke det.",
        why: "Riktig. Skallet sender bare strengen videre; det er programmet selv som må kjenne den igjen.",
        correct: true,
      },
      {
        id: "b",
        label: "passwd krever rot-rettigheter, og hjelpeteksten er skjult for vanlige brukere.",
        why: "Nei. Hjelpetekst er aldri rettighetsbeskyttet — og feilmeldingen sier «ukjent opsjon», ikke «tilgang nektet».",
      },
      {
        id: "c",
        label: "Manualdatabasen må bygges på nytt.",
        why: "Databasen har ingenting med --help å gjøre. Den teksten er kompilert inn i selve programmet.",
      },
      {
        id: "d",
        label: "Du må skrive -help med én bindestrek for programmer som ikke er fra GNU.",
        why: "Enkelte gamle programmer bruker den formen, men her er poenget at flagget ikke støttes i det hele tatt.",
      },
    ],
    fix: {
      cmd: "man passwd",
      text: "Manualsiden finnes alltid når pakken er riktig installert, uansett hva programmet mener om --help. Merk også at feilmeldingen selv tipser deg om det.",
    },
    lesson:
      "Rekkefølgen når du står fast: prøv --help (raskest), så -h, så man, så apropos hvis du ikke er sikker på navnet, og til slutt /usr/share/doc for pakkens egne filer.",
  },
];
