/**
 * Skill-graf for diagnose-pretesten.
 *
 * Dette er en STUB. Andre agenter eier den fulle skill-grafen.
 * Hvis denne filen allerede finnes når deres versjon merges, vinner deres versjon.
 *
 * Diagnosen referer kun til `id` og `area` her — så lenge IDene matcher
 * det andre agenter bygger, fungerer alt.
 */

export type SkillArea =
  | "python-grunnleggende"
  | "python-datastrukturer"
  | "python-funksjoner"
  | "python-oop"
  | "sql-grunnleggende"
  | "sql-joins"
  | "sql-aggregering"
  | "sql-modellering"
  | "linux-shell"
  | "linux-permissions"
  | "git"
  | "nettverk"
  | "algoritmer"
  | "web"
  | "verktoy";

export interface Skill {
  id: string;
  area: SkillArea;
  title: string;
  /** Hvor "dypt" i treet — 1 = grunnleggende, 5 = avansert. */
  depth: 1 | 2 | 3 | 4 | 5;
  /** Forutsetninger (andre skill-IDer). */
  prereqs?: string[];
}

/**
 * ~50 viktigste kjerne-skills. Holdes flat for at diagnosen skal kunne
 * referere til IDer uten tett kobling til den endelige grafen.
 */
export const SKILLS: Skill[] = [
  // --- Python grunnleggende ---
  { id: "py-variables", area: "python-grunnleggende", title: "Variabler og typer", depth: 1 },
  { id: "py-print-input", area: "python-grunnleggende", title: "print / input", depth: 1 },
  { id: "py-if", area: "python-grunnleggende", title: "if / elif / else", depth: 1 },
  { id: "py-while", area: "python-grunnleggende", title: "while-løkker", depth: 2 },
  { id: "py-for", area: "python-grunnleggende", title: "for-løkker", depth: 2 },
  { id: "py-string-ops", area: "python-grunnleggende", title: "Stringer og formattering", depth: 2 },

  // --- Python datastrukturer ---
  { id: "py-list", area: "python-datastrukturer", title: "Lister", depth: 2 },
  { id: "py-list-slicing", area: "python-datastrukturer", title: "List slicing og indexing", depth: 2 },
  { id: "py-dict", area: "python-datastrukturer", title: "Dictionaries", depth: 2 },
  { id: "py-tuple", area: "python-datastrukturer", title: "Tupler", depth: 2 },
  { id: "py-set", area: "python-datastrukturer", title: "Sets", depth: 3 },
  { id: "py-comprehension", area: "python-datastrukturer", title: "List/dict comprehensions", depth: 3 },

  // --- Python funksjoner ---
  { id: "py-functions", area: "python-funksjoner", title: "Definere funksjoner", depth: 2 },
  { id: "py-args-kwargs", area: "python-funksjoner", title: "*args og **kwargs", depth: 4 },
  { id: "py-scope", area: "python-funksjoner", title: "Scope (lokal/global)", depth: 3 },
  { id: "py-lambda", area: "python-funksjoner", title: "Lambda-funksjoner", depth: 3 },
  { id: "py-exceptions", area: "python-funksjoner", title: "try/except/finally", depth: 3 },

  // --- Python OOP ---
  { id: "py-class", area: "python-oop", title: "Klasser og objekter", depth: 3 },
  { id: "py-inheritance", area: "python-oop", title: "Arv", depth: 4 },
  { id: "py-dunder", area: "python-oop", title: "Dunder-metoder (__init__, __str__)", depth: 4 },

  // --- SQL grunnleggende ---
  { id: "sql-select", area: "sql-grunnleggende", title: "SELECT / FROM", depth: 1 },
  { id: "sql-where", area: "sql-grunnleggende", title: "WHERE-filter", depth: 1 },
  { id: "sql-order-limit", area: "sql-grunnleggende", title: "ORDER BY / LIMIT", depth: 2 },
  { id: "sql-distinct", area: "sql-grunnleggende", title: "DISTINCT", depth: 2 },
  { id: "sql-null", area: "sql-grunnleggende", title: "NULL og IS NULL", depth: 2 },
  { id: "sql-insert-update-delete", area: "sql-grunnleggende", title: "INSERT / UPDATE / DELETE", depth: 2 },

  // --- SQL joins ---
  { id: "sql-inner-join", area: "sql-joins", title: "INNER JOIN", depth: 3 },
  { id: "sql-left-join", area: "sql-joins", title: "LEFT/RIGHT JOIN", depth: 3 },
  { id: "sql-self-join", area: "sql-joins", title: "Self-join", depth: 4 },
  { id: "sql-multi-join", area: "sql-joins", title: "Flere joins i samme spørring", depth: 4 },

  // --- SQL aggregering ---
  { id: "sql-agg", area: "sql-aggregering", title: "COUNT / SUM / AVG / MIN / MAX", depth: 2 },
  { id: "sql-group-by", area: "sql-aggregering", title: "GROUP BY", depth: 3 },
  { id: "sql-having", area: "sql-aggregering", title: "HAVING", depth: 3 },
  { id: "sql-subquery", area: "sql-aggregering", title: "Subqueries", depth: 4 },

  // --- SQL modellering / DDL ---
  { id: "sql-create-table", area: "sql-modellering", title: "CREATE TABLE / datatyper", depth: 3 },
  { id: "sql-primary-foreign", area: "sql-modellering", title: "PRIMARY / FOREIGN KEY", depth: 3 },
  { id: "sql-normalization", area: "sql-modellering", title: "Normalisering (1NF/2NF/3NF)", depth: 4 },
  { id: "sql-er", area: "sql-modellering", title: "ER-diagram", depth: 3 },

  // --- Linux shell ---
  { id: "shell-navigation", area: "linux-shell", title: "cd / ls / pwd", depth: 1 },
  { id: "shell-files", area: "linux-shell", title: "cp / mv / rm / mkdir", depth: 2 },
  { id: "shell-pipes", area: "linux-shell", title: "Pipes og redirection", depth: 3 },
  { id: "shell-grep", area: "linux-shell", title: "grep / find", depth: 3 },

  // --- Linux permissions ---
  { id: "shell-chmod", area: "linux-permissions", title: "chmod / rettigheter", depth: 3 },
  { id: "shell-chown", area: "linux-permissions", title: "chown / eierskap", depth: 3 },

  // --- Git ---
  { id: "git-basics", area: "git", title: "init / add / commit", depth: 2 },
  { id: "git-branch-merge", area: "git", title: "branch / merge", depth: 3 },
  { id: "git-remote", area: "git", title: "remote / push / pull", depth: 3 },
  { id: "git-undo", area: "git", title: "reset / revert / checkout", depth: 4 },

  // --- Nettverk ---
  { id: "net-ipv4", area: "nettverk", title: "IPv4-adresser", depth: 2 },
  { id: "net-osi", area: "nettverk", title: "OSI / TCP/IP-modellen", depth: 3 },
  { id: "net-http", area: "nettverk", title: "HTTP / status-koder", depth: 2 },
  { id: "net-dns", area: "nettverk", title: "DNS", depth: 3 },
  { id: "net-tcp-udp", area: "nettverk", title: "TCP vs UDP", depth: 3 },

  // --- Algoritmer ---
  { id: "alg-bigo", area: "algoritmer", title: "Big-O notasjon", depth: 4 },
  { id: "alg-search", area: "algoritmer", title: "Lineær / binær søk", depth: 3 },
  { id: "alg-sort", area: "algoritmer", title: "Sorterings-algoritmer", depth: 4 },
  { id: "alg-recursion", area: "algoritmer", title: "Rekursjon", depth: 4 },

  // --- Web ---
  { id: "web-html", area: "web", title: "HTML-grunnlag", depth: 1 },
  { id: "web-css", area: "web", title: "CSS-selektorer", depth: 2 },
  { id: "web-js-basic", area: "web", title: "JavaScript-grunnlag", depth: 2 },
  { id: "web-json", area: "web", title: "JSON", depth: 2 },

  // --- Verktoy ---
  { id: "tool-venv", area: "verktoy", title: "Python venv / pip", depth: 3 },
  { id: "tool-docker", area: "verktoy", title: "Docker-grunnlag", depth: 4 },
];

export const SKILL_AREAS: { id: SkillArea; title: string }[] = [
  { id: "python-grunnleggende", title: "Python grunnleggende" },
  { id: "python-datastrukturer", title: "Python datastrukturer" },
  { id: "python-funksjoner", title: "Python funksjoner" },
  { id: "python-oop", title: "Python OOP" },
  { id: "sql-grunnleggende", title: "SQL grunnleggende" },
  { id: "sql-joins", title: "SQL joins" },
  { id: "sql-aggregering", title: "SQL aggregering" },
  { id: "sql-modellering", title: "SQL modellering / DDL" },
  { id: "linux-shell", title: "Linux shell" },
  { id: "linux-permissions", title: "Linux rettigheter" },
  { id: "git", title: "Git" },
  { id: "nettverk", title: "Nettverk" },
  { id: "algoritmer", title: "Algoritmer" },
  { id: "web", title: "Web (HTML/CSS/JS)" },
  { id: "verktoy", title: "Verktøy (venv/Docker)" },
];

export function getSkill(id: string): Skill | undefined {
  return SKILLS.find((s) => s.id === id);
}

export function getAreaTitle(area: SkillArea): string {
  return SKILL_AREAS.find((a) => a.id === area)?.title ?? area;
}
