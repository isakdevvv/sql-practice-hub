// Linux-drill: tutorials og øvelser for Linux-kommandolinje.
//
// Vi kan ikke kjøre Linux-shellet i nettleseren, så validering skjer via
// mønster-sjekk (regex + nøkkelord) på kommandoen brukeren skriver. Det er
// bra nok til å gi rask tilbakemelding på om strukturen er riktig — selve
// "kjøringen" gjør studenten på sin egen Linux-boks (eller i WSL/Docker).

export type LinuxTopic =
  | "navigasjon"
  | "filer"
  | "lesing-sok"
  | "permissions"
  | "pipes-redirects"
  | "tekst"
  | "prosesser"
  | "pakker-systemd"
  | "nett-ssh"
  | "scripting";

export interface LinuxTopicMeta {
  id: LinuxTopic;
  label: string;
  emoji: string;
  beskrivelse: string;
  /** Hvilke topics som bør være forstått først (progressiv scaffolding). */
  forutsetninger?: LinuxTopic[];
}

export const LINUX_TOPICS: LinuxTopicMeta[] = [
  {
    id: "navigasjon",
    label: "Navigasjon & filsystem",
    emoji: "🧭",
    beskrivelse:
      "Beveg deg rundt i filtreet med `ls`, `cd`, `pwd`. Forstå absolutte vs relative stier, ~, ., ..",
  },
  {
    id: "filer",
    label: "Filoperasjoner",
    emoji: "📁",
    beskrivelse:
      "Lag, kopier, flytt, slett og lenk filer: `touch`, `mkdir`, `cp`, `mv`, `rm`, `ln`.",
    forutsetninger: ["navigasjon"],
  },
  {
    id: "lesing-sok",
    label: "Lesing & søk",
    emoji: "🔎",
    beskrivelse:
      "Les filer (`cat`, `less`, `head`, `tail`) og finn ting (`grep`, `find`, `locate`).",
    forutsetninger: ["navigasjon", "filer"],
  },
  {
    id: "permissions",
    label: "Permissions & eierskap",
    emoji: "🔐",
    beskrivelse:
      "`chmod` (oktal og symbolsk), `chown`, `umask`, sudo. Forstå r/w/x for user/group/other.",
    forutsetninger: ["filer"],
  },
  {
    id: "pipes-redirects",
    label: "Pipes & redirects",
    emoji: "🚰",
    beskrivelse:
      "Koble kommandoer med `|`, omdiriger med `>`, `>>`, `<`, skille `2>`, `tee`, `xargs`.",
    forutsetninger: ["lesing-sok"],
  },
  {
    id: "tekst",
    label: "Tekstprosessering",
    emoji: "📝",
    beskrivelse:
      "`sort`, `uniq`, `wc`, `cut`, `tr`, `paste`, `head/tail` — bygg pipelines som transformerer tekst.",
    forutsetninger: ["pipes-redirects"],
  },
  {
    id: "prosesser",
    label: "Prosesser & jobber",
    emoji: "⚙️",
    beskrivelse:
      "`ps`, `top`/`htop`, `kill`, `&`, `jobs`, `fg`, `bg`, `nohup`, `nice`. Signal SIGTERM vs SIGKILL.",
    forutsetninger: ["navigasjon"],
  },
  {
    id: "pakker-systemd",
    label: "Pakker & systemd",
    emoji: "📦",
    beskrivelse:
      "Installer pakker (`apt`, `dpkg`). Styr tjenester (`systemctl`), les logg (`journalctl`).",
    forutsetninger: ["prosesser"],
  },
  {
    id: "nett-ssh",
    label: "Nettverk & SSH",
    emoji: "🌐",
    beskrivelse:
      "`ssh`, `scp`, `rsync`, `curl`, `wget`, `ss`/`netstat`, `nc`, `dig`. Port-forwarding og nøkler.",
    forutsetninger: ["pipes-redirects"],
  },
  {
    id: "scripting",
    label: "Bash-scripting",
    emoji: "🛠️",
    beskrivelse:
      "Variabler, `if`/`for`/`while`, funksjoner, `$?`, `$1..$9`, `set -e`, exit-koder.",
    forutsetninger: ["tekst", "prosesser"],
  },
];

/* -------------------------------------------------------------------------- */
/* Tutorials                                                                  */
/* -------------------------------------------------------------------------- */

export interface CodeBlock {
  /** Kommandoen som skal vises. Multi-line støttes. */
  code: string;
  /** Valgfri forventet output for å gi studenten kontekst. */
  output?: string;
  /** En linje med tips eller forklaring under blokken. */
  runHint?: string;
}

export interface TutorialSection {
  heading: string;
  /** Markdown-lett: linjer som blir <p>, tom linje = paragraph-skille.
   *  Bruk `inline backtick` for kommandoer i prosatekst. */
  body: string;
  example?: CodeBlock;
}

export interface LinuxTutorial {
  id: string;
  topic: LinuxTopic;
  title: string;
  /** En setning som teaser. */
  tagline: string;
  /** Hva studenten skal sitte igjen med. */
  takeaways: string[];
  sections: TutorialSection[];
}

/* -------------------------------------------------------------------------- */
/* Øvelser                                                                    */
/* -------------------------------------------------------------------------- */

export type LinuxCheck =
  /** Kommandoen må inneholde denne strengen (case-sensitive). */
  | { kind: "contains"; needle: string; explain: string }
  /** Kommandoen må matche dette regex-mønsteret. */
  | { kind: "regex"; pattern: string; flags?: string; explain: string }
  /** Kommandoen må IKKE inneholde dette (case-sensitive). */
  | { kind: "not-contains"; needle: string; explain: string }
  /** Minst ett av disse må være til stede. */
  | { kind: "one-of"; needles: string[]; explain: string }
  /** Alle disse må være til stede (and-of). */
  | { kind: "all-of"; needles: string[]; explain: string };

export interface LinuxExercise {
  id: string;
  topic: LinuxTopic;
  /** 1 = grunnleggende, 2 = sammensatt, 3 = utfordrende/realistisk. */
  level: 1 | 2 | 3;
  title: string;
  /** Hovedoppgaven studenten skal løse. */
  prompt: string;
  /** Bakgrunns-info / fil-struktur / forventet output. Vises som "kontekst"-boks. */
  context?: string;
  /** Forhåndsutfylt skjelett (kan være tom). */
  starter: string;
  hint: string;
  /** Kanonisk fasit (vises ved "Vis svar"). */
  solution: string;
  /** Forklaring av løsningen (vises etter solved/reveal). */
  explanation: string;
  /** ALLE checks må passere for solved=true. */
  checks: LinuxCheck[];
}

/* -------------------------------------------------------------------------- */
/* Validator                                                                  */
/* -------------------------------------------------------------------------- */

export interface CheckResult {
  ok: boolean;
  passed: { check: LinuxCheck; ok: boolean }[];
}

export function validate(code: string, checks: LinuxCheck[]): CheckResult {
  const raw = code;
  const passed = checks.map((check) => {
    let ok = false;
    if (check.kind === "contains") {
      ok = raw.includes(check.needle);
    } else if (check.kind === "not-contains") {
      ok = !raw.includes(check.needle);
    } else if (check.kind === "regex") {
      try {
        ok = new RegExp(check.pattern, check.flags ?? "").test(raw);
      } catch {
        ok = false;
      }
    } else if (check.kind === "one-of") {
      ok = check.needles.some((n) => raw.includes(n));
    } else if (check.kind === "all-of") {
      ok = check.needles.every((n) => raw.includes(n));
    }
    return { check, ok };
  });
  return { ok: passed.every((p) => p.ok), passed };
}
