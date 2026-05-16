// ---------------------------------------------------------------------------
// drills.ts — register over alle drill-stil øvinger på platformen.
//
// Datakilden for et fremtidig /drill-hub-side: kort + filter på subject,
// lenker til side hvor drillet er montert, og en `uses_shell`-flagg som lar
// hub-en vise hvilke som er migrert til den generiske `DrillShell` og hvilke
// som fortsatt bruker bespoke implementasjon.
//
// Migrasjon: kun NormaliseringDrill og BigODrill bruker shellet i denne PR-en.
// Resten skal migreres en-og-en i senere PR-er. Når du migrerer et nytt drill,
// sett `uses_shell: true` på radens registry-entry.
// ---------------------------------------------------------------------------

export type DrillSubject =
  | "SQL"
  | "Python"
  | "Algoritmer"
  | "Databaser"
  | "Nettverk"
  | "OS"
  | "ML"
  | "Verktoy";

export type DrillEntry = {
  /** Stabilt slug; brukes som localStorage-prefiks og for fremtidige direkte-lenker. */
  id: string;
  /** Visningstittel. */
  title: string;
  /** Faglig kategori — driver filtre i /drill-hub. */
  subject: DrillSubject;
  /** Route der drillet er montert. Inkluder evt. `#drill`-anker hvis drillet er en seksjon nedi en større side. */
  route: string;
  /** Én-linjes beskrivelse for hub-kortet. */
  description: string;
  /** True = drillet bruker `DrillShell`-komponenten. False = bespoke implementasjon. */
  uses_shell: boolean;
};

export const DRILLS: DrillEntry[] = [
  // --- Migrert til DrillShell ---
  {
    id: "normalisering",
    title: "Normalisering 1NF → 2NF → 3NF + FK",
    subject: "Databaser",
    route: "/stack/normalisering#drill",
    description: "Pek på 1NF-bruddet, partielle FD-er, transitive FD-er og knytt FK-ene riktig.",
    uses_shell: true,
  },
  {
    id: "big-o",
    title: "Big-O-analyse",
    subject: "Algoritmer",
    route: "/stack/big-o#drill",
    description: "Tell løkker, identifiser dominante termer, sammenlign lineær- og binærsøk.",
    uses_shell: true,
  },

  // --- Legacy (bespoke implementasjon) ---
  {
    id: "indekser",
    title: "Indekser og søkestrategier",
    subject: "Databaser",
    route: "/stack/indekser#drill",
    description: "Velg riktig indeks-strategi for ulike spørringer.",
    uses_shell: false,
  },
  {
    id: "transaksjoner",
    title: "Transaksjons-isolasjonsnivåer",
    subject: "Databaser",
    route: "/stack/transaksjoner#drill",
    description:
      "Identifiser anomalier og velg riktig isolasjonsnivå — inkluderer trade-off-tabell.",
    uses_shell: false,
  },
  {
    id: "joins",
    title: "JOIN-typer",
    subject: "SQL",
    route: "/joins#drill",
    description: "Bygg SQL-klausuler og velg riktig JOIN-type for ulike scenarioer.",
    uses_shell: false,
  },
  {
    id: "er-mapping",
    title: "ER → relasjonsmodell",
    subject: "Databaser",
    route: "/stack/er-mapping#drill",
    description: "Mapp ER-konstruksjoner (entiteter, attributter, relasjoner) til tabeller.",
    uses_shell: false,
  },
  {
    id: "dte2507-nat",
    title: "NAT-pakkeflyt",
    subject: "Nettverk",
    route: "/stack/dte2507-nat#drill",
    description: "Følg en pakke gjennom NAT — kilde/destinasjons-IP og port på hvert hopp.",
    uses_shell: false,
  },
  {
    id: "dte2507-dhcp",
    title: "DHCP-pakkeflyt",
    subject: "Nettverk",
    route: "/stack/dte2507-dhcp#drill",
    description: "Plassér DHCP-meldinger (Discover/Offer/Request/ACK) i riktig rekkefølge.",
    uses_shell: false,
  },
  {
    id: "dte2505-scheduling-drill",
    title: "OS-scheduling",
    subject: "OS",
    route: "/stack/dte2505-scheduling-drill",
    description: "Bygg Gantt-diagrammer for FCFS/SJF/Round-robin og sammenlign ventetid.",
    uses_shell: false,
  },
  {
    id: "dte2501-mdp-bellman",
    title: "Bellman-iterasjon for MDP",
    subject: "ML",
    route: "/stack/dte2501-mdp-bellman#drill",
    description: "Fyll inn DP-tabellen for value-iteration steg for steg.",
    uses_shell: false,
  },
  {
    id: "dte2602-svm",
    title: "SVM-hyperplan",
    subject: "ML",
    route: "/stack/dte2602-svm#drill",
    description: "Tegn separasjonsmarginen og velg støttepunkter.",
    uses_shell: false,
  },
  {
    id: "python-drill",
    title: "Python-kodeøving",
    subject: "Python",
    route: "/stack/python-drill",
    description: "Kode-editor-basert: skriv Python-løsninger og kjør tester.",
    uses_shell: false,
  },
  {
    id: "mac-drill",
    title: "MAC-adresser og ARP",
    subject: "Nettverk",
    route: "/mac-drill",
    description: "Identifiser MAC-format, broadcast/unicast og ARP-flyt.",
    uses_shell: false,
  },
  {
    id: "dte2505-shell-drill",
    title: "Shell-kommandoer",
    subject: "Verktoy",
    route: "/dte2505/shell-drill",
    description: "Terminal-stil: skriv riktig kommando for å løse oppgaven.",
    uses_shell: false,
  },
  {
    id: "git-drill",
    title: "Git-kommandoer",
    subject: "Verktoy",
    route: "/git-drill",
    description: "Terminal-stil: bruk Git for å løse repo-scenarioer.",
    uses_shell: false,
  },
  {
    id: "venv-drill",
    title: "Python venv-kommandoer",
    subject: "Verktoy",
    route: "/venv-drill",
    description: "Terminal-stil: opprett, aktiver og bruk virtuelle Python-miljøer.",
    uses_shell: false,
  },
];

/** Slå opp ett drill på id. */
export function getDrill(id: string): DrillEntry | undefined {
  return DRILLS.find((d) => d.id === id);
}

/** Filter drills på subject (case-sensitiv match). */
export function drillsForSubject(subject: DrillSubject): DrillEntry[] {
  return DRILLS.filter((d) => d.subject === subject);
}
