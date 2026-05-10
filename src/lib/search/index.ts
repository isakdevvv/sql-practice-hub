// Global search index for the site-wide command palette.
//
// Pulls entries from every learning surface (Stack-trinn, SQL-oppgaver,
// Python-oppgaver, Kurs-nivå, Huskelapp-seksjoner, statiske sider) and
// returns a flat list the palette filters in-memory.

import { PROBLEMS } from "@/lib/problems/data";
import { LEVEL_NAMES, type Level } from "@/lib/problems/types";
import { PY_EXERCISES } from "@/lib/python/exercises";
import { TRINN } from "@/lib/stack/content";

export type SearchKind =
  | "Stack — eksamen"
  | "Stack"
  | "SQL-oppgave"
  | "Python-oppgave"
  | "Kurs-nivå"
  | "Huskelapp"
  | "Side";

export interface SearchEntry {
  id: string;
  title: string;
  kind: SearchKind;
  description?: string;
  href: string;
  keywords?: string;
}

const HUSKELAPP_SECTIONS: Array<{ id: string; title: string; keywords: string }> = [
  { id: "logisk-rekkefolge", title: "Logisk utføringsrekkefølge i SELECT", keywords: "from where group by having select distinct order limit" },
  { id: "skeleton", title: "Grunnleggende setningsstruktur", keywords: "select from join syntax" },
  { id: "where", title: "WHERE — operatorer og filtrering", keywords: "where filter operators between in like null exists comparison" },
  { id: "joins", title: "JOIN-typer", keywords: "join inner left right full outer cross self anti" },
  { id: "aggregat", title: "Aggregat og GROUP BY", keywords: "count sum avg min max group by having aggregate" },
  { id: "subqueries", title: "Sub-spørringer (subquery)", keywords: "subquery scalar correlated inline view exists" },
  { id: "null", title: "NULL — tre-verdi-logikk", keywords: "null is null coalesce three-valued logic" },
  { id: "sort-streng", title: "Sortering, paginering og strenger", keywords: "order by limit offset upper lower substr length round concat" },
  { id: "dato", title: "Datofunksjoner (SQLite)", keywords: "date datetime strftime now" },
  { id: "case", title: "CASE — betinget uttrykk", keywords: "case when then else conditional" },
  { id: "union", title: "UNION / INTERSECT / EXCEPT", keywords: "union intersect except set operations" },
  { id: "dml", title: "DML — INSERT, UPDATE, DELETE", keywords: "insert update delete dml" },
  { id: "ddl", title: "DDL — CREATE TABLE", keywords: "create table primary key foreign key check unique not null default ddl" },
  { id: "feller", title: "Vanlige feller på eksamen", keywords: "common pitfalls mistakes traps exam" },
];

const STATIC_PAGES: SearchEntry[] = [
  { id: "page-lar", title: "Lær (hub)", kind: "Side", description: "Hub: kurs, konsepter og hele stacken.", href: "/lar", keywords: "lar laer hub teori learn pensum" },
  { id: "page-ov", title: "Øv (hub)", kind: "Side", description: "Hub: SQL, Python, JOIN, ER, quiz, drag.", href: "/ov", keywords: "ov ove hub trening practice exercise" },
  { id: "page-eksamen-hub", title: "Eksamen (hub)", kind: "Side", description: "Hub: tidstrening, prosjekt og eksamen-trinn.", href: "/eksamen", keywords: "eksamen hub innspurt prove" },
  { id: "page-kurs", title: "Kurs", kind: "Side", description: "Stegvis SQL-læring i 6 nivåer.", href: "/kurs", keywords: "stegvis nivå levels" },
  { id: "page-stack", title: "Stack", kind: "Side", description: "Fra bytes til Flask — eksamensforberedelse og hele stacken.", href: "/stack", keywords: "stack bytes flask sockets http" },
  { id: "page-practice", title: "Practice", kind: "Side", description: "Bla i alle SQL-oppgavene.", href: "/practice", keywords: "oppgaver problems" },
  { id: "page-learn", title: "Lær", kind: "Side", description: "Konsept-forklaringer med eksempler.", href: "/learn", keywords: "konsept teori" },
  { id: "page-joins", title: "Joins", kind: "Side", description: "Visuell trening på JOIN-typer.", href: "/joins", keywords: "join inner left outer" },
  { id: "page-er-tegner", title: "ER-tegner", kind: "Side", description: "Tegn ER-diagrammer i krakefot-notasjon.", href: "/er-tegner", keywords: "er diagram krakefot crow's foot entity relationship" },
  { id: "page-python", title: "Python", kind: "Side", description: "Python-oppgaver med Pyodide-kjøring.", href: "/python", keywords: "python pyodide flask" },
  { id: "page-prosjekt", title: "Prosjekt", kind: "Side", description: "Større prosjektoppgave.", href: "/prosjekt", keywords: "prosjekt project" },
  { id: "page-konsoll", title: "API-konsoll", kind: "Side", description: "Test API-endepunkter.", href: "/konsoll", keywords: "api konsoll endpoint http" },
  { id: "page-exam", title: "Exam", kind: "Side", description: "Tidsbasert eksamenstrening.", href: "/exam", keywords: "exam eksamen prøve" },
  { id: "page-dashboard", title: "Dashboard", kind: "Side", description: "Fremgangsoversikt og XP.", href: "/dashboard", keywords: "dashboard fremgang xp progress" },
  { id: "page-cards", title: "Quiz", kind: "Side", description: "Multiple-choice quiz med 4 svaralternativer per spørsmål.", href: "/cards", keywords: "quiz flashcards kort repetisjon multiple choice svar alternativer" },
  { id: "page-drag", title: "Drag", kind: "Side", description: "Drag-and-drop-oppgaver.", href: "/drag", keywords: "drag drop interactive" },
];

const KURS_LEVELS: Array<{ level: Level; title: string; description: string; topics: string }> = [
  { level: 0, title: "Nivå 0 — Grunnleggende", description: "SELECT, FROM, DISTINCT, LIMIT.", topics: "select from distinct limit basic" },
  { level: 1, title: "Nivå 1 — Filtrering", description: "WHERE og operatorer.", topics: "where and or in between like null filter" },
  { level: 2, title: "Nivå 2 — JOINs", description: "INNER, LEFT, ON.", topics: "inner left right join on" },
  { level: 3, title: "Nivå 3 — Aggregering", description: "COUNT, SUM, AVG, GROUP BY, HAVING.", topics: "count sum avg group by having aggregate" },
  { level: 4, title: "Nivå 4 — Underspørringer", description: "Subqueries, EXISTS, korrelerte.", topics: "subquery exists in correlated" },
  { level: 5, title: "Nivå 5 — Avansert", description: "Vinduer, CTE, rekursjon.", topics: "window cte recursive advanced" },
];

let cached: SearchEntry[] | null = null;

export function getSearchEntries(): SearchEntry[] {
  if (cached) return cached;

  const entries: SearchEntry[] = [];

  // Stack-trinn
  for (const t of TRINN) {
    entries.push({
      id: t.id,
      title: t.title,
      kind: t.group === "eksamen" ? "Stack — eksamen" : "Stack",
      description: t.shortDescription,
      href: `/stack/${t.slug}`,
    });
  }

  // Huskelapp-seksjoner (anchors inside /stack/huskelapp)
  for (const s of HUSKELAPP_SECTIONS) {
    entries.push({
      id: `huskelapp-${s.id}`,
      title: s.title,
      kind: "Huskelapp",
      description: "Hopp direkte til seksjonen i SQL huskelappen.",
      href: `/stack/huskelapp#${s.id}`,
      keywords: s.keywords,
    });
  }

  // Kurs-nivå
  for (const k of KURS_LEVELS) {
    entries.push({
      id: `kurs-${k.level}`,
      title: k.title,
      kind: "Kurs-nivå",
      description: k.description,
      href: `/kurs`,
      keywords: k.topics,
    });
  }

  // SQL-oppgaver
  for (const p of PROBLEMS) {
    const levelLabel = LEVEL_NAMES?.[p.level as Level] ?? `Nivå ${p.level}`;
    entries.push({
      id: `sql-${p.id}`,
      title: p.title,
      kind: "SQL-oppgave",
      description: `${levelLabel} · ${p.topics.join(", ")}`,
      href: `/practice?id=${encodeURIComponent(p.id)}`,
      keywords: p.topics.join(" "),
    });
  }

  // Python-oppgaver
  for (const e of PY_EXERCISES) {
    entries.push({
      id: `py-${e.id}`,
      title: e.title,
      kind: "Python-oppgave",
      description: e.description?.slice(0, 140),
      href: `/python?id=${encodeURIComponent(e.id)}`,
      keywords: e.topic ?? "",
    });
  }

  // Statiske sider
  entries.push(...STATIC_PAGES);

  cached = entries;
  return entries;
}

/** Lowercase substring score: 3 if title hits, +1 per other field hit, 0 = miss. */
export function scoreEntry(entry: SearchEntry, query: string): number {
  if (!query) return 1;
  const q = query.toLowerCase();
  let score = 0;
  if (entry.title.toLowerCase().includes(q)) score += 3;
  if (entry.description && entry.description.toLowerCase().includes(q)) score += 1;
  if (entry.keywords && entry.keywords.toLowerCase().includes(q)) score += 1;
  if (entry.kind.toLowerCase().includes(q)) score += 1;
  return score;
}

export function searchEntries(query: string, limit = 50): SearchEntry[] {
  const entries = getSearchEntries();
  if (!query.trim()) {
    return entries.slice(0, limit);
  }
  const scored = entries
    .map((e) => ({ e, s: scoreEntry(e, query) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((x) => x.e);
  return scored;
}
