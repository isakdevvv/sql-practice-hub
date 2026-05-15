// Mac-drill: tutorials og øvelser for Mac-automatisering.
//
// Vi kan ikke kjøre AppleScript/Shortcuts/launchd i nettleseren, så
// validering skjer via mønster-sjekk (regex + nøkkelord) på koden brukeren
// skriver. Det er bra nok til å gi rask tilbakemelding på om strukturen er
// riktig — selve "kjøringen" må studenten gjøre på sin egen Mac.

export type MacTopic =
  | "applescript-basis"
  | "applescript-apper"
  | "shortcuts"
  | "automator"
  | "terminal";

export interface MacTopicMeta {
  id: MacTopic;
  label: string;
  emoji: string;
  beskrivelse: string;
}

export const MAC_TOPICS: MacTopicMeta[] = [
  {
    id: "applescript-basis",
    label: "AppleScript-basis",
    emoji: "📜",
    beskrivelse:
      "Språket i seg selv: variabler, dialoger, tell-blokker, lister og repeat.",
  },
  {
    id: "applescript-apper",
    label: "AppleScript + apper",
    emoji: "🍎",
    beskrivelse:
      "Styr Finder, Safari, Mail, Music og System Events fra AppleScript.",
  },
  {
    id: "shortcuts",
    label: "Shortcuts (Snarveier)",
    emoji: "⚡",
    beskrivelse:
      "Apple sin moderne automatisering — bygg snarveier og kjør dem fra terminalen.",
  },
  {
    id: "automator",
    label: "Automator",
    emoji: "🤖",
    beskrivelse:
      "Workflows, Quick Actions, Folder Actions — drag-and-drop automatisering.",
  },
  {
    id: "terminal",
    label: "Terminal-automatisering",
    emoji: "🖥️",
    beskrivelse:
      "osascript, defaults, launchd, pmset, pbcopy — automatiser fra shellet.",
  },
];

export type Language = "applescript" | "shell" | "shortcuts";

/* -------------------------------------------------------------------------- */
/* Tutorials                                                                  */
/* -------------------------------------------------------------------------- */

export interface CodeBlock {
  /** Hva slags syntaks for highlight + kjør-hint. */
  language: Language;
  /** Selve koden. */
  code: string;
  /** Hvordan kjøre den på Mac (vises som tips under blokken). */
  runHint?: string;
}

export interface TutorialSection {
  heading: string;
  /** Markdown-lett: linjer som blir <p>. Tom linje = paragraph-skille.
   *  Bruk `inline backtick` for kode. */
  body: string;
  example?: CodeBlock;
}

export interface MacTutorial {
  id: string;
  topic: MacTopic;
  title: string;
  /** En setning som teaser. */
  tagline: string;
  /** Hva studenten skal sitte igjen med etter å ha lest. */
  takeaways: string[];
  sections: TutorialSection[];
}

/* -------------------------------------------------------------------------- */
/* Øvelser                                                                    */
/* -------------------------------------------------------------------------- */

export type MacCheck =
  /** Koden må inneholde denne strengen (case-insensitive). */
  | { kind: "contains"; needle: string; explain: string }
  /** Koden må matche dette regex-mønsteret. */
  | { kind: "regex"; pattern: string; flags?: string; explain: string }
  /** Koden må IKKE inneholde dette (case-insensitive). */
  | { kind: "not-contains"; needle: string; explain: string }
  /** Minst ett av disse må være til stede. */
  | { kind: "one-of"; needles: string[]; explain: string };

export interface MacExercise {
  id: string;
  topic: MacTopic;
  level: 1 | 2 | 3;
  title: string;
  /** Hva studenten skal løse — vises som hovedoppgave-tekst. */
  prompt: string;
  /** Bakgrunns-info som hjelper studenten. */
  context?: string;
  language: Language;
  /** Forhåndsutfylt skjelett (kan være tom streng). */
  starter: string;
  hint: string;
  /** Kanonisk fasit som vises ved "Vis svar". */
  solution: string;
  /** Forklaring av løsningen (vises etter solved/reveal). */
  explanation: string;
  /** Pattern-baserte sjekker. ALLE må passere for solved=true. */
  checks: MacCheck[];
}

/* -------------------------------------------------------------------------- */
/* Validator                                                                  */
/* -------------------------------------------------------------------------- */

export interface CheckResult {
  ok: boolean;
  /** Hvilke krav som passerte. */
  passed: { check: MacCheck; ok: boolean }[];
}

export function validate(code: string, checks: MacCheck[]): CheckResult {
  const norm = code.toLowerCase();
  const passed = checks.map((check) => {
    let ok = false;
    if (check.kind === "contains") {
      ok = norm.includes(check.needle.toLowerCase());
    } else if (check.kind === "not-contains") {
      ok = !norm.includes(check.needle.toLowerCase());
    } else if (check.kind === "regex") {
      try {
        ok = new RegExp(check.pattern, check.flags ?? "i").test(code);
      } catch {
        ok = false;
      }
    } else if (check.kind === "one-of") {
      ok = check.needles.some((n) => norm.includes(n.toLowerCase()));
    }
    return { check, ok };
  });
  return { ok: passed.every((p) => p.ok), passed };
}
