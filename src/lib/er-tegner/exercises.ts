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
