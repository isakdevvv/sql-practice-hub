// Kryss-lenker lær → test: hvilke test-ressurser (oppgaver, drills, kort)
// hører til en stack-leksjon? Brukes av «Test deg på dette»-blokka i
// StackPagerFooter, så hver leksjon slutter med en konkret vei videre til
// øving i stedet for en blindvei.
//
// Kuratert på to nivåer:
//  - BY_PHASE: fornuftige defaults per curriculum-fase (dekker alle trinn).
//  - BY_SLUG: overstyringer/tillegg for enkelt-leksjoner der noe mer
//    spesifikt finnes (f.eks. JOIN-leksjon → JOIN-drill + JOIN-oppgaver).
//
// Drill-lenker slås opp i DRILLS-registeret (learn/drills.ts) så rutene har
// én kilde til sannhet. Lenker som peker til siden man allerede står på
// filtreres bort i relatedTestsFor().

import { DRILLS } from "@/lib/learn/drills";
import { phaseOfSlug } from "@/lib/stack/curriculum";

export type RelatedTestKind = "oppgaver" | "drill" | "kort";

export interface RelatedTestLink {
  label: string;
  href: string;
  description: string;
  kind: RelatedTestKind;
}

/** Lag en RelatedTestLink fra DRILLS-registeret. Returnerer null hvis id-en
 *  ikke finnes (registeret kan endre seg uavhengig av denne fila). */
function drill(id: string): RelatedTestLink | null {
  const d = DRILLS.find((x) => x.id === id);
  if (!d) return null;
  return { label: d.title, href: d.route, description: d.description, kind: "drill" };
}

function oppgaver(label: string, href: string, description: string): RelatedTestLink {
  return { label, href, description, kind: "oppgaver" };
}

function kort(label: string, href: string, description: string): RelatedTestLink {
  return { label, href, description, kind: "kort" };
}

// Defaults per curriculum-fase. Maks ~4 per fase — dette er «hva er den
// naturlige øvingen etter en leksjon i denne fasen», ikke en katalog.
const BY_PHASE: Record<string, (RelatedTestLink | null)[]> = {
  math: [
    kort(
      "Statistikk-kort",
      "/cards?category=statistikk",
      "Repetisjonskort for sannsynlighet og statistikk.",
    ),
  ],
  algoritmer: [
    drill("big-o"),
    oppgaver("Predict-trener", "/predict", "Gjett resultatet av en query før du kjører den."),
  ],
  os: [drill("dte2505-scheduling-drill"), drill("dte2505-shell-drill"), drill("venv-drill")],
  nettverk: [
    drill("dte2507-nat"),
    drill("dte2507-dhcp"),
    drill("mac-drill"),
    kort(
      "HTTP- og sikkerhetskort",
      "/cards?category=http",
      "Repetisjonskort for HTTP, API og web-sikkerhet.",
    ),
  ],
  database: [
    oppgaver("SQL-oppgaver", "/practice", "320 oppgaver mot ekte SQLite, med hint og fasit-diff."),
    drill("joins"),
    drill("normalisering"),
    kort("SQL-kort", "/cards?category=sql", "Repetisjonskort for spørringer og databasedesign."),
  ],
  web: [
    kort(
      "Flask-kort",
      "/cards?category=flask",
      "Repetisjonskort for routes, templates og sessions.",
    ),
    oppgaver("Python-oppgaver", "/python", "Pyodide-baserte oppgaver med autograder."),
    drill("git-drill"),
  ],
  "ai-klassisk": [
    drill("dte2501-mdp-bellman"),
    oppgaver("Python-oppgaver", "/python", "Pyodide-baserte oppgaver med autograder."),
  ],
  ml: [drill("dte2602-svm"), drill("python-drill")],
  "deep-learning": [drill("dte2602-svm"), drill("python-drill")],
  devops: [drill("git-drill"), drill("dte2505-shell-drill")],
};

// Leksjons-spesifikke tillegg. Legges FØRST, foran fase-defaults.
const BY_SLUG: Record<string, (RelatedTestLink | null)[]> = {
  // SQL-leksjoner → tema-filtrerte oppgaver
  subqueries: [
    oppgaver("Subquery-oppgaver", "/practice?topic=subquery", "Oppgaver filtrert på subqueries."),
    drill("joins"),
  ],
  normalisering: [drill("er-mapping"), drill("normalisering")],
  indekser: [
    drill("indekser"),
    oppgaver("Indeks-oppgaver", "/practice?topic=INDEX", "Oppgaver om indekser og EXPLAIN."),
  ],
  transaksjoner: [
    drill("transaksjoner"),
    oppgaver(
      "Transaksjons-oppgaver",
      "/practice?topic=TRANSACTION",
      "BEGIN/COMMIT/ROLLBACK-oppgaver.",
    ),
  ],
  "er-mapping": [drill("er-mapping")],
  "linux-bruk": [drill("dte2505-shell-drill")],
  "shell-scripting": [drill("dte2505-shell-drill")],
  "dte2505-bash-scripts": [drill("dte2505-shell-drill")],
};

/**
 * Test-ressursene som hører til en stack-leksjon: slug-spesifikke først,
 * så fase-defaults. Dedupe på href, dropp lenker til siden man står på,
 * maks `max` totalt. Tom liste = blokka skjules.
 */
export function relatedTestsFor(slug: string, max = 4): RelatedTestLink[] {
  const phase = phaseOfSlug(slug);
  const candidates = [...(BY_SLUG[slug] ?? []), ...(phase ? (BY_PHASE[phase.id] ?? []) : [])];

  const out: RelatedTestLink[] = [];
  const seen = new Set<string>();
  const selfPrefix = `/stack/${slug}`;
  for (const link of candidates) {
    if (!link) continue;
    if (seen.has(link.href)) continue;
    if (link.href === selfPrefix || link.href.startsWith(`${selfPrefix}#`)) continue;
    seen.add(link.href);
    out.push(link);
    if (out.length >= max) break;
  }
  return out;
}
