export interface GlossaryEntry {
  term: string;
  category: "clause" | "operator" | "function" | "join" | "concept";
  short: string;
  description: string;
  example?: string;
  seeAlso?: string[];
}

export const GLOSSARY: GlossaryEntry[] = [
  {
    term: "SELECT",
    category: "clause",
    short: "Velger ut kolonner",
    description:
      "Henter kolonner fra én eller flere tabeller. SELECT * gir alle kolonner; SELECT a, b gir bare de nevnte.",
    example: "SELECT navn, pris FROM produkt;",
  },
  {
    term: "FROM",
    category: "clause",
    short: "Tabell-kilde",
    description: "Angir hvilken tabell (eller hvilke tabeller) raden skal komme fra.",
    example: "SELECT * FROM kunde;",
  },
  {
    term: "WHERE",
    category: "clause",
    short: "Filtrerer rader",
    description:
      "Filtrerer rader FØR aggregering. Kombiner betingelser med AND/OR. NULL kan ikke testes med =.",
    example: "SELECT * FROM film WHERE aar > 1980 AND land = 'USA';",
    seeAlso: ["AND", "OR", "IS NULL", "HAVING"],
  },
  {
    term: "GROUP BY",
    category: "clause",
    short: "Grupper rader",
    description:
      "Samler rader med samme verdi i én gruppe. Aggregatfunksjoner (COUNT, SUM, AVG, MIN, MAX) beregnes per gruppe.",
    example: "SELECT land, COUNT(*) FROM film GROUP BY land;",
    seeAlso: ["HAVING", "COUNT", "SUM"],
  },
  {
    term: "HAVING",
    category: "clause",
    short: "Filtrer grupper",
    description:
      "Filtrerer grupper ETTER aggregering. Bruk HAVING når betingelsen viser til et aggregat — ellers bruk WHERE.",
    example: "SELECT land, COUNT(*) FROM film GROUP BY land HAVING COUNT(*) > 2;",
    seeAlso: ["GROUP BY", "WHERE"],
  },
  {
    term: "ORDER BY",
    category: "clause",
    short: "Sortér resultatet",
    description: "Sorterer raden i resultatet. Standard er stigende (ASC). DESC sorterer synkende.",
    example: "SELECT * FROM film ORDER BY pris DESC;",
  },
  {
    term: "LIMIT",
    category: "clause",
    short: "Begrens antall rader",
    description:
      "Returnerer kun de første N radene. Ofte kombinert med ORDER BY for «top-N»-spørringer.",
    example: "SELECT * FROM film ORDER BY pris DESC LIMIT 3;",
    seeAlso: ["ORDER BY"],
  },
  {
    term: "DISTINCT",
    category: "clause",
    short: "Fjerner duplikater",
    description: "Returnerer bare unike rader (eller unike kolonneverdier).",
    example: "SELECT DISTINCT land FROM film;",
  },
  {
    term: "AS",
    category: "concept",
    short: "Gir et nytt navn (alias)",
    description:
      "Gir en kolonne, et regnet uttrykk eller en tabell et alias. Aliaset vises som kolonnenavn i resultatet, og brukes ofte for korte tabellnavn i JOINs. Nøkkelordet AS er valgfritt for tabeller (`FROM users u` virker også) men anbefalt for lesbarhet.",
    example:
      "SELECT name AS product_name FROM products;\nSELECT u.name FROM users AS u JOIN orders AS o ON o.user_id = u.id;",
    seeAlso: ["SELECT", "FROM"],
  },
  {
    term: "INNER JOIN",
    category: "join",
    short: "Slår sammen rader som matcher i begge tabeller",
    description:
      "Returnerer kun rader der ON-betingelsen er sann i begge tabellene. Rader uten match faller bort. JOIN uten kvalifikator betyr INNER JOIN.",
    example:
      "SELECT b.tittel, f.navn FROM bok b INNER JOIN forfatter f ON b.fid = f.id;",
    seeAlso: ["LEFT JOIN", "ON"],
  },
  {
    term: "LEFT JOIN",
    category: "join",
    short: "Behold alle rader fra venstre side",
    description:
      "Beholder ALLE rader fra venstre tabell. Hvis høyre side ikke matcher, blir høyre kolonner NULL. Brukes ofte med IS NULL for å finne «manglende» rader (anti-join).",
    example:
      "SELECT k.navn FROM kunde k LEFT JOIN bestilling b ON b.kid = k.id WHERE b.id IS NULL;",
    seeAlso: ["INNER JOIN", "IS NULL", "RIGHT JOIN"],
  },
  {
    term: "RIGHT JOIN",
    category: "join",
    short: "Behold alle rader fra høyre side",
    description:
      "Som LEFT JOIN, men beholder alle rader fra høyre tabell. Mange motorer (deriblant SQLite) støtter ikke RIGHT JOIN — bytt rekkefølge og bruk LEFT JOIN i stedet.",
    seeAlso: ["LEFT JOIN"],
  },
  {
    term: "FULL JOIN",
    category: "join",
    short: "Behold alle rader fra begge sider",
    description:
      "Returnerer rader fra begge sider, med NULL på den siden som mangler match. Støttes ikke i alle motorer (SQLite/MySQL — bruk UNION av LEFT + RIGHT JOIN).",
    seeAlso: ["LEFT JOIN", "RIGHT JOIN", "UNION"],
  },
  {
    term: "ON",
    category: "clause",
    short: "Bindebetingelse for JOIN",
    description: "Angir hvordan rader fra to tabeller skal kobles i en JOIN.",
    example: "JOIN kunde k ON k.id = bestilling.kunde_id",
  },
  {
    term: "UNION",
    category: "operator",
    short: "Slår sammen resultatsett",
    description:
      "Stabler to spørringer vertikalt. Antall kolonner og datatyper må stemme. UNION fjerner duplikater; UNION ALL beholder dem (raskere).",
    example: "SELECT navn FROM kunde UNION SELECT navn FROM ansatt;",
  },
  {
    term: "AND",
    category: "operator",
    short: "Logisk OG",
    description: "Begge sider må være sann. Binder tettere enn OR — bruk parentes for klarhet.",
    example: "WHERE aar = 2025 AND pris < 5000",
    seeAlso: ["OR"],
  },
  {
    term: "OR",
    category: "operator",
    short: "Logisk ELLER",
    description:
      "Minst én side må være sann. Husk parentes når du blander OR med AND, ellers tolker SQL det annerledes enn du tror.",
    example: "WHERE land = 'Norge' OR land = 'Sverige'",
    seeAlso: ["AND", "IN"],
  },
  {
    term: "NOT",
    category: "operator",
    short: "Negering",
    description: "Inverterer sannhetsverdien. Brukes ofte med IN, EXISTS, LIKE, BETWEEN.",
    example: "WHERE id NOT IN (1, 2, 3)",
  },
  {
    term: "IN",
    category: "operator",
    short: "Medlemskap i en liste",
    description:
      "Sann hvis verdien er i lista (eller subspørringens resultat). Kortere enn flere OR.",
    example: "WHERE land IN ('Norge', 'Sverige', 'Danmark');",
    seeAlso: ["NOT IN", "EXISTS"],
  },
  {
    term: "NOT IN",
    category: "operator",
    short: "Ikke i listen",
    description:
      "Negering av IN. Vær oppmerksom på NULL — hvis subspørringen kan returnere NULL, kan NOT IN gi uventede tomme resultater. Bruk NOT EXISTS hvis i tvil.",
    example: "WHERE id NOT IN (SELECT kunde_id FROM bestilling)",
    seeAlso: ["IN", "NOT EXISTS"],
  },
  {
    term: "BETWEEN",
    category: "operator",
    short: "Verdi i intervall (inklusive)",
    description: "Tester om en verdi er mellom to grenser. BETWEEN x AND y inkluderer både x og y.",
    example: "WHERE aar BETWEEN 1980 AND 1989;",
  },
  {
    term: "LIKE",
    category: "operator",
    short: "Mønstersøk i tekst",
    description:
      "Sammenligner tekst mot et mønster. % matcher 0+ tegn, _ matcher ett tegn. SQLite er case-insensitiv for LIKE i ASCII.",
    example: "WHERE navn LIKE 'P%';",
  },
  {
    term: "IS NULL",
    category: "operator",
    short: "Tester for NULL",
    description:
      "NULL kan IKKE sammenlignes med =. Bruk IS NULL eller IS NOT NULL for å teste fravær av verdi.",
    example: "WHERE pris IS NULL;",
  },
  {
    term: "EXISTS",
    category: "operator",
    short: "Sjekker om subspørring gir rad",
    description:
      "Sann hvis subspørringen returnerer minst én rad. Ofte korrelert (refererer til ytre rad). NULL-trygg, til forskjell fra IN.",
    example:
      "SELECT * FROM kunde k WHERE EXISTS (SELECT 1 FROM bestilling b WHERE b.kid = k.id);",
    seeAlso: ["NOT EXISTS", "IN"],
  },
  {
    term: "NOT EXISTS",
    category: "operator",
    short: "Negering av EXISTS",
    description: "Sann hvis subspørringen IKKE returnerer noen rad. Trygg mot NULL.",
  },
  {
    term: "AS",
    category: "clause",
    short: "Aliasering",
    description: "Gir en kolonne eller tabell et nytt navn. Nyttig for klarere overskrifter eller kortere referanse.",
    example: "SELECT navn AS Tittel FROM film f;",
  },
  {
    term: "CASE",
    category: "clause",
    short: "Betinget uttrykk",
    description:
      "If/else-lignende konstruksjon i SQL. Returnerer ulik verdi avhengig av betingelser.",
    example:
      "SELECT navn, CASE WHEN pris > 100 THEN 'Dyr' ELSE 'Billig' END AS Kategori FROM film;",
  },
  {
    term: "COUNT",
    category: "function",
    short: "Teller rader",
    description:
      "COUNT(*) teller alle rader. COUNT(kolonne) teller rader hvor kolonnen IKKE er NULL. COUNT(DISTINCT k) teller unike ikke-null verdier.",
    example: "SELECT COUNT(*) FROM kunde;",
  },
  {
    term: "SUM",
    category: "function",
    short: "Summerer numerisk kolonne",
    description: "Summerer alle ikke-null verdier i en kolonne (eller uttrykk).",
    example: "SELECT SUM(pris * antall) FROM bestilling;",
  },
  {
    term: "AVG",
    category: "function",
    short: "Gjennomsnitt",
    description: "Gjennomsnittet av ikke-null verdier. Ignorerer NULL-rader.",
    example: "SELECT AVG(pris) FROM film;",
  },
  {
    term: "MIN",
    category: "function",
    short: "Minste verdi",
    description: "Returnerer minste ikke-null verdi i kolonnen.",
  },
  {
    term: "MAX",
    category: "function",
    short: "Største verdi",
    description: "Returnerer største ikke-null verdi i kolonnen.",
  },
  {
    term: "ROUND",
    category: "function",
    short: "Avrunder tall",
    description: "ROUND(x) avrunder til nærmeste heltall. ROUND(x, n) gir n desimaler.",
    example: "SELECT ROUND(AVG(pris)) FROM film;",
  },
  {
    term: "UPPER",
    category: "function",
    short: "Tekst til store bokstaver",
    description:
      "Konverterer streng til store bokstaver. Brukes for case-insensitiv sammenligning.",
    example: "WHERE UPPER(sjanger) = 'KOMEDIE';",
  },
  {
    term: "LOWER",
    category: "function",
    short: "Tekst til små bokstaver",
    description: "Motsatt av UPPER.",
  },
  {
    term: "SUBSTR",
    category: "function",
    short: "Hent del av streng",
    description:
      "SUBSTR(s, start) starter på posisjon `start` (1-indeksert). SUBSTR(s, start, len) tar `len` tegn.",
    example: "SELECT SUBSTR(navn, 2) FROM kunde;",
  },
  {
    term: "COALESCE",
    category: "function",
    short: "Første ikke-NULL-verdi",
    description:
      "Returnerer første argument som ikke er NULL. Brukes for å gi NULL-verdier en fallback.",
    example: "SELECT COALESCE(comm, 0) FROM emp;",
  },
  {
    term: "DATE",
    category: "function",
    short: "Dato-funksjon (SQLite)",
    description:
      "DATE('now') gir dagens dato. SQLite har også strftime() for fleksibel formatering.",
    example: "SELECT DATE('now');",
    seeAlso: ["STRFTIME"],
  },
  {
    term: "STRFTIME",
    category: "function",
    short: "Formater dato (SQLite)",
    description:
      "Henter del av en dato. %Y = år, %m = måned, %d = dag. Returnerer tekst, så CAST til tall ved behov.",
    example: "WHERE strftime('%Y', d) = '2025';",
  },
  {
    term: "VIEW",
    category: "concept",
    short: "Lagret spørring",
    description:
      "En CREATE VIEW-spørring lagrer en SELECT som en virtuell tabell. Endrer du dataene under, oppdateres viewet automatisk neste gang det leses.",
  },
  {
    term: "PRIMARY KEY",
    category: "concept",
    short: "Unik radidentifikator",
    description:
      "Kolonnen(e) som unikt identifiserer en rad. Får automatisk indeks. Kan ikke være NULL.",
  },
  {
    term: "FOREIGN KEY",
    category: "concept",
    short: "Referanse til annen tabell",
    description:
      "En kolonne som peker på primærnøkkelen i en annen tabell. Sikrer referanseintegritet.",
  },
  {
    term: "NULL",
    category: "concept",
    short: "Mangler verdi",
    description:
      "NULL betyr «ingen verdi». NULL = NULL er IKKE sant — bruk IS NULL. Aggregatfunksjoner som AVG, SUM, COUNT(kol) ignorerer NULL.",
    seeAlso: ["IS NULL", "COALESCE"],
  },
];

const TERM_MAP = new Map<string, GlossaryEntry>();
for (const e of GLOSSARY) TERM_MAP.set(e.term.toUpperCase(), e);

export function lookupTerm(term: string): GlossaryEntry | undefined {
  return TERM_MAP.get(term.toUpperCase());
}

// Sort longest-first so multi-word terms (INNER JOIN) match before INNER alone
export const TERM_REGEX = (() => {
  const sorted = [...GLOSSARY].map((e) => e.term).sort((a, b) => b.length - a.length);
  const escaped = sorted.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  return new RegExp(`\\b(${escaped.join("|")})\\b`, "gi");
})();
