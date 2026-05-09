import type { DocRef } from "@/lib/docs";
import type { Attribute, Entity, ErModel, ErRelationship } from "./types";

// Exercises walk the user from a single-entity table all the way to a 4-table
// webshop. Each exercise has:
//   - description: what to build (Norwegian)
//   - hint: nudge toward the next step
//   - target: the ErModel that produces the expected CREATE TABLE-SQL
//
// The page compares user-generated SQL to target SQL line-by-line so the user
// sees exactly what their model produces vs what it should.

export interface ErExercise {
  id: string;
  level: 1 | 2 | 3;
  title: string;
  description: string;
  /** What the user should see/learn. */
  goal: string;
  hints: string[];
  /** The model the user is trying to build. */
  target: ErModel;
  /** Optional id of a previous exercise. If the user has saved progress for
   *  THIS exercise, that wins. Otherwise, the model is seeded from the user's
   *  saved progress for `seedFrom` — so e2 starts with the kunde they drew
   *  in e1, instead of a blank canvas. */
  seedFrom?: string;
  /** Documentation links + snippets shown next to the prompt. */
  docs?: DocRef[];
}

// ───── helpers — keep ids deterministic so tests are stable ─────
const attr = (id: string, name: string, type: Attribute["type"], notNull = false): Attribute => ({
  id,
  name,
  type,
  notNull,
});

const entity = (
  id: string,
  name: string,
  attributes: Attribute[],
  pkAttributeId: string,
): Entity => ({ id, name, attributes, pkAttributeId });

const rel = (
  id: string,
  fromEntityId: string,
  toEntityId: string,
  fromEnd: ErRelationship["fromEnd"],
  toEnd: ErRelationship["toEnd"],
  label?: string,
): ErRelationship => ({ id, fromEntityId, toEntityId, fromEnd, toEnd, label });

// ───── EXERCISES ─────

export const ER_EXERCISES: ErExercise[] = [
  {
    id: "er-1-kunde",
    level: 1,
    title: "1. Én entitet med primærnøkkel",
    description:
      "Lag én entitet `kunde` med tre attributter: kundenr (INTEGER, primærnøkkel), navn (TEXT, NOT NULL) og epost (TEXT, valgfri).",
    goal:
      "Lær det grunnleggende: én entitet blir én CREATE TABLE. Primærnøkkelen markeres med nøkkel-ikonet. Hver attributt har en SQL-type og en NOT NULL-flagg.",
    hints: [
      "Trykk «Ny entitet» og kall den `kunde`",
      "Legg til tre attributter under den",
      "Trykk på nøkkel-ikonet ved siden av kundenr for å sette den som PK",
    ],
    docs: [
      {
        title: "CREATE TABLE i SQLite",
        url: "https://www.sqlite.org/lang_createtable.html",
        note: "SQL-en denne entiteten genererer:",
        snippet: `CREATE TABLE kunde (
  kundenr INTEGER PRIMARY KEY,
  navn    TEXT NOT NULL,
  epost   TEXT
);`,
      },
      {
        title: "PRIMARY KEY og NOT NULL — datatyper i SQLite",
        url: "https://www.sqlite.org/datatype3.html",
        note: "INTEGER, TEXT, REAL, BLOB. PK er unik + alltid satt; NOT NULL krever at kolonnen fylles inn.",
      },
    ],
    target: {
      entities: [
        entity(
          "kunde",
          "kunde",
          [
            attr("k-pk", "kundenr", "INTEGER", true),
            attr("k-navn", "navn", "TEXT", true),
            attr("k-epost", "epost", "TEXT", false),
          ],
          "k-pk",
        ),
      ],
      relationships: [],
    },
  },
  {
    id: "er-2-1-til-n",
    level: 1,
    title: "2. 1:N-relasjon (kunde → bestilling)",
    description:
      "Behold kunde-tabellen fra forrige oppgave. Legg til en ny entitet `bestilling` med bestnr (INTEGER PK) og dato (TEXT, NOT NULL). Lag en relasjon der hver bestilling tilhører nøyaktig én kunde, men en kunde kan ha 0 eller mange bestillinger.",
    goal:
      "Forstå at FK-en automatisk lander på MANGE-siden når du sier `||——O<`. Du skriver IKKE inn kundenr-kolonnen på bestilling — sqlGen.ts gjør det for deg.",
    hints: [
      "Bestilling har bare bestnr og dato — ikke legg til kundenr selv",
      "Kråkefot-symbolet `||` er på kunde-siden (én og bare én)",
      "Kråkefot-symbolet `O<` er på bestilling-siden (null eller flere)",
    ],
    seedFrom: "er-1-kunde",
    docs: [
      {
        title: "Kråkefot-notasjon (Wikipedia)",
        url: "https://en.wikipedia.org/wiki/Entity%E2%80%93relationship_model#Crow's_foot_notation",
        note: "Symbolene || (én), O| (valgfri én), |< (én eller flere), O< (null eller flere).",
      },
      {
        title: "FOREIGN KEY i SQLite",
        url: "https://www.sqlite.org/foreignkeys.html",
        note: "Hva FK-en bestilling.kundenr genererer:",
        snippet:
          "FOREIGN KEY (kundenr) REFERENCES kunde(kundenr)",
      },
    ],
    target: {
      entities: [
        entity(
          "kunde",
          "kunde",
          [
            attr("k-pk", "kundenr", "INTEGER", true),
            attr("k-navn", "navn", "TEXT", true),
            attr("k-epost", "epost", "TEXT", false),
          ],
          "k-pk",
        ),
        entity(
          "bestilling",
          "bestilling",
          [
            attr("b-pk", "bestnr", "INTEGER", true),
            attr("b-dato", "dato", "TEXT", true),
          ],
          "b-pk",
        ),
      ],
      relationships: [
        rel("rel-1n", "kunde", "bestilling", "||", "O<", "har"),
      ],
    },
  },
  {
    id: "er-3-1-til-1",
    level: 2,
    title: "3. 1:1-relasjon (person → pass)",
    description:
      "Lag to entiteter: `person` (pid INTEGER PK, navn TEXT NOT NULL) og `pass` (passnr CHAR/TEXT PK, utstedt TEXT NOT NULL). Hver person har én pass, hvert pass tilhører én person — total deltakelse på begge sider.",
    goal:
      "Se hvordan generatoren behandler 1:1: FK på én side med UNIQUE for å håndheve at koblingen er én-til-én.",
    hints: [
      "Pass har bare passnr og utstedt — ikke pid-kolonne",
      "Begge endene må være `||` for total deltakelse",
      "Generert SQL skal ha UNIQUE på FK-kolonnen",
    ],
    docs: [
      {
        title: "UNIQUE constraint i SQLite",
        url: "https://www.sqlite.org/lang_createtable.html#unique_constraints",
        note: "1:1 håndheves med UNIQUE på FK-kolonnen — sørger for at ingen to rader peker på samme person.",
        snippet: `pid INTEGER UNIQUE,
FOREIGN KEY (pid) REFERENCES person(pid)`,
      },
      {
        title: "Total vs partiell deltakelse",
        url: "https://en.wikipedia.org/wiki/Entity%E2%80%93relationship_model#Cardinalities",
        note: "Symbolet `||` på begge sider = total deltakelse: hver person MÅ ha et pass og hvert pass MÅ tilhøre en person.",
      },
    ],
    target: {
      entities: [
        entity(
          "person",
          "person",
          [
            attr("p-pk", "pid", "INTEGER", true),
            attr("p-navn", "navn", "TEXT", true),
          ],
          "p-pk",
        ),
        entity(
          "pass",
          "pass",
          [
            attr("pa-pk", "passnr", "TEXT", true),
            attr("pa-utstedt", "utstedt", "TEXT", true),
          ],
          "pa-pk",
        ),
      ],
      relationships: [
        rel("rel-11", "person", "pass", "||", "||", "har"),
      ],
    },
  },
  {
    id: "er-4-m-til-n",
    level: 2,
    title: "4. M:N-relasjon med koblingstabell (student ↔ fag)",
    description:
      "Lag `student` (sid INTEGER PK, navn TEXT NOT NULL) og `fag` (fkode TEXT PK, tittel TEXT NOT NULL). Lag en M:N-relasjon mellom dem — bruk kråkefot `O<` på begge sider.",
    goal:
      "Se at en M:N-relasjon AUTOMATISK genererer en koblingstabell `student_fag` med sammensatt PK og to FK-er. Dette er den klassiske mappingen fra ER-modell til relasjons-skjema.",
    hints: [
      "Bare to entiteter — koblingstabellen genereres for deg",
      "Begge endene av relasjonen er `O<`",
      "I generert SQL skal du se en tredje CREATE TABLE",
    ],
    docs: [
      {
        title: "M:N — koblings-/junction-tabell",
        url: "https://en.wikipedia.org/wiki/Associative_entity",
        note: "M:N kan ikke uttrykkes med én FK. Mappes til en tredje tabell med sammensatt PK av de to FK-ene.",
        snippet: `CREATE TABLE student_fag (
  sid    INTEGER,
  fkode  TEXT,
  PRIMARY KEY (sid, fkode),
  FOREIGN KEY (sid)   REFERENCES student(sid),
  FOREIGN KEY (fkode) REFERENCES fag(fkode)
);`,
      },
      {
        title: "Sammensatt primærnøkkel (composite PK)",
        url: "https://www.sqlite.org/lang_createtable.html#the_primary_key",
        note: "PRIMARY KEY (a, b) — kombinasjonen av kolonnene må være unik. Klassisk for koblingstabeller.",
      },
    ],
    target: {
      entities: [
        entity(
          "student",
          "student",
          [
            attr("s-pk", "sid", "INTEGER", true),
            attr("s-navn", "navn", "TEXT", true),
          ],
          "s-pk",
        ),
        entity(
          "fag",
          "fag",
          [
            attr("f-pk", "fkode", "TEXT", true),
            attr("f-tittel", "tittel", "TEXT", true),
          ],
          "f-pk",
        ),
      ],
      relationships: [
        rel("rel-mn", "student", "fag", "O<", "O<", "tar"),
      ],
    },
  },
  {
    id: "er-5-rekursiv",
    level: 2,
    title: "5. Rekursiv relasjon — ansatt har leder",
    description:
      "Lag én entitet `ansatt` (ansattnr INTEGER PK, navn TEXT NOT NULL, stilling TEXT). Legg til en relasjon FRA ansatt TIL ansatt — der hver ansatt kan ha 0 eller én leder (også en ansatt). Toppsjefen har ingen leder.",
    goal:
      "Vise at en entitet kan ha en relasjon til seg selv. Generert SQL skal ha en FK-kolonne (typisk leder-id eller ansatt-id) som peker tilbake på samme tabell.",
    hints: [
      "Velg `ansatt` både som FRA og TIL i relasjonsdialogen",
      "Symbol nær 'leder-rollen': `O|` (null eller én — toppsjefen har ingen)",
      "Symbol nær 'underordnet-siden': `O<` (en leder kan ha 0..N underordnede)",
    ],
    docs: [
      {
        title: "Self-referencing FOREIGN KEY",
        url: "https://www.sqlite.org/foreignkeys.html",
        note: "En tabell kan referere til seg selv. Treet bygges via leder-FK-en.",
        snippet: `CREATE TABLE ansatt (
  ansattnr  INTEGER PRIMARY KEY,
  navn      TEXT NOT NULL,
  stilling  TEXT,
  leder     INTEGER,
  FOREIGN KEY (leder) REFERENCES ansatt(ansattnr)
);`,
      },
      {
        title: "Rekursive spørringer (CTE) — bla gjennom hierarkiet",
        url: "https://www.sqlite.org/lang_with.html#recursive_common_table_expressions",
        note: "Senere kan du finne hele underordnede-treet under en leder med en `WITH RECURSIVE`-spørring.",
      },
    ],
    target: {
      entities: [
        entity(
          "ansatt",
          "ansatt",
          [
            attr("a-pk", "ansattnr", "INTEGER", true),
            attr("a-navn", "navn", "TEXT", true),
            attr("a-stilling", "stilling", "TEXT", false),
          ],
          "a-pk",
        ),
      ],
      relationships: [
        rel("rel-rek", "ansatt", "ansatt", "O<", "O|", "leder"),
      ],
    },
  },
  {
    id: "er-6-nettbutikk",
    level: 3,
    title: "6. Komplett nettbutikk — 4 tabeller",
    description:
      "Bygg den klassiske nettbutikk-skjemaet: `kunde` (kundenr PK, navn, epost), `produkt` (prodnr PK, navn, pris REAL), `ordre` (ordrenr PK, dato — knyttet til kunde 1:N) og `ordrelinje` (M:N mellom ordre og produkt med antall + pris).",
    goal:
      "Sett alt sammen: 1:N + M:N i samme modell. Lær at ordrelinje IKKE er en egen entitet du tegner — den oppstår som koblingstabell fra M:N-relasjonen mellom ordre og produkt.",
    hints: [
      "Tre entiteter: kunde, produkt, ordre. Ordrelinje er en koblingstabell — ikke tegn den.",
      "kunde 1:N ordre — bruk `||——O<`",
      "ordre M:N produkt — bruk `O<——O<`. Generatoren lager `ordre_produkt`-tabellen.",
      "Hvis du vil ha `antall` og `pris` på koblingstabellen må du bruke det enkle utvalget — for nå holder det at relasjonen blir registrert.",
    ],
    docs: [
      {
        title: "Komplett ER-mapping til relasjonsmodell",
        url: "https://en.wikipedia.org/wiki/Entity%E2%80%93relationship_model#Mapping_natural_language",
        note: "Entiteter blir tabeller. 1:N legger FK på mange-siden. M:N gir en koblingstabell. Det er hele oppskriften.",
      },
      {
        title: "REAL-typen for pris",
        url: "https://www.sqlite.org/datatype3.html#real",
        note: "Bruk REAL for desimaltall. (For ekte penger ville du brukt INTEGER med øre — men det er en annen lekse.)",
        snippet: `CREATE TABLE produkt (
  prodnr INTEGER PRIMARY KEY,
  navn   TEXT NOT NULL,
  pris   REAL NOT NULL
);`,
      },
    ],
    target: {
      entities: [
        entity(
          "kunde",
          "kunde",
          [
            attr("k-pk", "kundenr", "INTEGER", true),
            attr("k-navn", "navn", "TEXT", true),
            attr("k-epost", "epost", "TEXT", false),
          ],
          "k-pk",
        ),
        entity(
          "produkt",
          "produkt",
          [
            attr("p-pk", "prodnr", "INTEGER", true),
            attr("p-navn", "navn", "TEXT", true),
            attr("p-pris", "pris", "REAL", true),
          ],
          "p-pk",
        ),
        entity(
          "ordre",
          "ordre",
          [
            attr("o-pk", "ordrenr", "INTEGER", true),
            attr("o-dato", "dato", "TEXT", true),
          ],
          "o-pk",
        ),
      ],
      relationships: [
        rel("rel-kunde-ordre", "kunde", "ordre", "||", "O<", "legger inn"),
        rel("rel-ordre-produkt", "ordre", "produkt", "O<", "O<", "inneholder"),
      ],
    },
  },
];
