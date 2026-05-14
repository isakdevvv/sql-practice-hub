// Mini-IDE workspaces per kapittel. Hver workspace er et sett med "filer" (bare
// strings i minnet) som vises i et filtre + Monaco-editor + terminal-pane.
// Brukeren kjører `entrypoint` via samme Pyodide-runner som python.tsx.
//
// Holdes i sync med PYTHON_CHAPTERS (samme `nr`). Mangler vi workspace for et
// kapittel, faller IDE-ruten tilbake til en generisk skissefil.

export type WorkspaceFile = {
  /** Vist i filtreet, f.eks. "main.py" eller "oppgave.md". */
  path: string;
  /** Brukes til Monaco-syntaks. */
  language: "python" | "markdown" | "text";
  /** Innhold ved første åpning. */
  initial: string;
  /** Hvis true, kan brukeren ikke redigere (lese-fil — oppgavebeskrivelse, hint). */
  readOnly?: boolean;
};

export type ChapterWorkspace = {
  chapter: number;
  /** Kort tittel — vises i header. */
  title: string;
  /** 1-linjes beskrivelse til terminal-banner. */
  intro: string;
  files: WorkspaceFile[];
  /** Hvilken fil "Run" kjører. Må finnes i `files` og være .py. */
  entrypoint: string;
  /** Valgfri forventet stdout — brukes for "✓ riktig svar"-sjekk. */
  expectedStdout?: string;
};

const README = (title: string, body: string) =>
  `# ${title}\n\n${body}\n\n_Trykk **Run** (eller Ctrl/⌘+Enter i editoren) for å kjøre \`main.py\`._\n`;

export const CHAPTER_WORKSPACES: ChapterWorkspace[] = [
  {
    chapter: 4,
    title: "Valg — if / elif / else",
    intro: "Skriv en if-else-kjede som klassifiserer en karakter.",
    files: [
      {
        path: "oppgave.md",
        language: "markdown",
        readOnly: true,
        initial: README(
          "Karakter → bokstav",
          [
            "Skriv en funksjon `karakter(p)` som tar et tall mellom 0 og 100 og returnerer:",
            "",
            "- `\"A\"` hvis p ≥ 90",
            "- `\"B\"` hvis 80 ≤ p < 90",
            "- `\"C\"` hvis 70 ≤ p < 80",
            "- `\"D\"` hvis 60 ≤ p < 70",
            "- `\"F\"` ellers",
            "",
            "Test-koden under skal skrive ut `A B C D F` på fem linjer når du har riktig svar.",
          ].join("\n"),
        ),
      },
      {
        path: "main.py",
        language: "python",
        initial: [
          "def karakter(p):",
          "    # TODO: skriv if/elif/else her",
          "    return \"?\"",
          "",
          "",
          "for p in [95, 82, 71, 64, 40]:",
          "    print(karakter(p))",
          "",
        ].join("\n"),
      },
    ],
    entrypoint: "main.py",
    expectedStdout: "A\nB\nC\nD\nF",
  },
  {
    chapter: 5,
    title: "Løkker — while og for",
    intro: "Bygg en summeringsløkke med for-range.",
    files: [
      {
        path: "oppgave.md",
        language: "markdown",
        readOnly: true,
        initial: README(
          "Summer partall opp til 100",
          [
            "Bruk en `for`-løkke og `range(...)` til å summere alle partall fra og med 2 til og med 100.",
            "",
            "Forventet utskrift:",
            "",
            "```",
            "2550",
            "```",
          ].join("\n"),
        ),
      },
      {
        path: "main.py",
        language: "python",
        initial: [
          "total = 0",
          "for n in range(...):  # TODO: fyll inn range",
          "    pass  # TODO: oppdater total",
          "",
          "print(total)",
          "",
        ].join("\n"),
      },
    ],
    entrypoint: "main.py",
    expectedStdout: "2550",
  },
  {
    chapter: 6,
    title: "Funksjoner",
    intro: "Skriv en funksjon med parametre og returverdi.",
    files: [
      {
        path: "oppgave.md",
        language: "markdown",
        readOnly: true,
        initial: README(
          "Funksjon `er_primtall(n)`",
          [
            "Skriv `er_primtall(n)` som returnerer `True` hvis `n` er et primtall og `False` ellers.",
            "Anta `n ≥ 2`.",
            "",
            "Test-koden skal skrive ut `True False True True False True` fra primtall-listen.",
          ].join("\n"),
        ),
      },
      {
        path: "main.py",
        language: "python",
        initial: [
          "def er_primtall(n):",
          "    # TODO: returner True/False",
          "    return False",
          "",
          "",
          "for n in [2, 4, 7, 11, 15, 17]:",
          "    print(er_primtall(n))",
          "",
        ].join("\n"),
      },
    ],
    entrypoint: "main.py",
    expectedStdout: "True\nFalse\nTrue\nTrue\nFalse\nTrue",
  },
  {
    chapter: 8,
    title: "Strenger",
    intro: "Behandle tekst — slicing, .upper(), .split().",
    files: [
      {
        path: "oppgave.md",
        language: "markdown",
        readOnly: true,
        initial: README(
          "Initialer fra fullt navn",
          [
            "Skriv `initialer(navn)` som tar et fullt navn (f.eks. `\"ada lovelace\"`) og returnerer initialene i store bokstaver med punktum imellom:",
            "",
            "```",
            "initialer(\"ada lovelace\") → \"A.L.\"",
            "initialer(\"alan mathison turing\") → \"A.M.T.\"",
            "```",
          ].join("\n"),
        ),
      },
      {
        path: "main.py",
        language: "python",
        initial: [
          "def initialer(navn):",
          "    # TODO",
          "    return \"\"",
          "",
          "",
          "print(initialer(\"ada lovelace\"))",
          "print(initialer(\"alan mathison turing\"))",
          "",
        ].join("\n"),
      },
    ],
    entrypoint: "main.py",
    expectedStdout: "A.L.\nA.M.T.",
  },
  {
    chapter: 10,
    title: "Lister",
    intro: "List comprehension og filtrering.",
    files: [
      {
        path: "oppgave.md",
        language: "markdown",
        readOnly: true,
        initial: README(
          "Filtrer og kvadrer",
          [
            "Gitt listen `tall`, lag en ny liste med kvadratene av kun partallene.",
            "",
            "Bruk gjerne en list comprehension: `[x*x for x in tall if x % 2 == 0]`.",
            "",
            "Forventet utskrift: `[4, 16, 36, 64, 100]`.",
          ].join("\n"),
        ),
      },
      {
        path: "main.py",
        language: "python",
        initial: [
          "tall = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]",
          "",
          "kvadrater_av_partall = []  # TODO",
          "",
          "print(kvadrater_av_partall)",
          "",
        ].join("\n"),
      },
    ],
    entrypoint: "main.py",
    expectedStdout: "[4, 16, 36, 64, 100]",
  },
];

export function findWorkspace(chapter: number): ChapterWorkspace | undefined {
  return CHAPTER_WORKSPACES.find((w) => w.chapter === chapter);
}

/** Fallback når et kapittel ikke har dedikert workspace ennå. */
export function fallbackWorkspace(chapter: number): ChapterWorkspace {
  return {
    chapter,
    title: `Kap. ${chapter} — eksperimenter fritt`,
    intro: "Ingen ferdig oppgave for dette kapittelet ennå — skriv din egen kode.",
    files: [
      {
        path: "oppgave.md",
        language: "markdown",
        readOnly: true,
        initial: README(
          `Kap. ${chapter}`,
          "Vi har ikke laget en oppgave for dette kapittelet ennå. Skriv din egen kode i `main.py` og trykk **Run**.",
        ),
      },
      {
        path: "main.py",
        language: "python",
        initial: "print(\"Hei fra kap. " + chapter + "!\")\n",
      },
    ],
    entrypoint: "main.py",
  };
}
