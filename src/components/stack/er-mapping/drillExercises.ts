export type DrillExercise = {
  id: string;
  title: string;
  diagram: string;
  description: string;
  /**
   * Lower-case substrings that must ALL appear in the student's normalized answer
   * (lowercased, whitespace-collapsed). Keep them short and unambiguous.
   */
  requiredClauses: string[];
  /** Reference solution shown when student clicks "Vis fasit". */
  fasit: string;
  /** Optional hint shown above textarea. */
  hint?: string;
};

export const DRILL_EXERCISES: DrillExercise[] = [
  {
    id: "kunde-bestilling",
    title: "1:N — KUNDE og BESTILLING",
    diagram: "KUNDE  ||————O<  BESTILLING",
    description:
      "Hver kunde kan ha 0..N bestillinger. Hver bestilling har akkurat én kunde (total deltakelse). Skriv begge CREATE TABLE-er.",
    hint: "FK på mange-siden. Total deltakelse på BESTILLING-siden ⇒ FK NOT NULL.",
    requiredClauses: [
      "create table kunde",
      "create table bestilling",
      "primary key",
      "foreign key",
      "references kunde",
      "not null",
    ],
    fasit: `CREATE TABLE kunde (
  id   INTEGER PRIMARY KEY,
  navn TEXT NOT NULL
);

CREATE TABLE bestilling (
  id        INTEGER PRIMARY KEY,
  kunde_id  INTEGER NOT NULL,
  FOREIGN KEY (kunde_id) REFERENCES kunde(id)
);`,
  },
  {
    id: "person-pass",
    title: "1:1 — PERSON og PASS",
    diagram: "PERSON  ||————||  PASS",
    description:
      "Hver person har nøyaktig ett pass. Hvert pass tilhører nøyaktig én person. Mapp som to tabeller med FK + UNIQUE på én side.",
    hint: "1:1 ⇒ FK på den ene siden, og marker FK som UNIQUE for å hindre duplikater.",
    requiredClauses: [
      "create table person",
      "create table pass",
      "primary key",
      "foreign key",
      "references person",
      "unique",
    ],
    fasit: `CREATE TABLE person (
  id   INTEGER PRIMARY KEY,
  navn TEXT NOT NULL
);

CREATE TABLE pass (
  id         INTEGER PRIMARY KEY,
  person_id  INTEGER NOT NULL UNIQUE,
  utstedt    DATE,
  FOREIGN KEY (person_id) REFERENCES person(id)
);`,
  },
  {
    id: "student-fag",
    title: "M:N — STUDENT og FAG (med koblingstabell)",
    diagram: "STUDENT  >O————O<  FAG",
    description:
      "En student kan ta mange fag og et fag kan ha mange studenter. Lag STUDENT, FAG og koblingstabellen TAR(sid, fkode, semester) — hvor sammensatt PK hindrer dobbeltregistrering.",
    hint: "Koblingstabellen har sammensatt PK = (sid, fkode), og to FK-er.",
    requiredClauses: [
      "create table student",
      "create table fag",
      "create table tar",
      "primary key (sid, fkode)",
      "references student",
      "references fag",
      "semester",
    ],
    fasit: `CREATE TABLE student (
  sid  INTEGER PRIMARY KEY,
  navn TEXT NOT NULL
);

CREATE TABLE fag (
  fkode  TEXT PRIMARY KEY,
  tittel TEXT NOT NULL
);

CREATE TABLE tar (
  sid       INTEGER NOT NULL,
  fkode     TEXT    NOT NULL,
  semester  TEXT,
  PRIMARY KEY (sid, fkode),
  FOREIGN KEY (sid)   REFERENCES student(sid),
  FOREIGN KEY (fkode) REFERENCES fag(fkode)
);`,
  },
  {
    id: "ordre-linje-svak",
    title: "Svak entitet — ORDRE og ORDRELINJE",
    diagram: "ORDRE  ||————|<  ORDRELINJE",
    description:
      "ORDRELINJE er svak: den eksisterer bare gjennom en ORDRE. PK i ORDRELINJE skal være sammensatt: (ordre_id, linjenr).",
    hint: "Svak entitet ⇒ PK = (FK til eier, eget delvis ID). Total deltakelse mot eier.",
    requiredClauses: [
      "create table ordre",
      "create table ordrelinje",
      "primary key (ordre_id, linjenr)",
      "foreign key",
      "references ordre",
      "not null",
    ],
    fasit: `CREATE TABLE ordre (
  id   INTEGER PRIMARY KEY,
  dato DATE NOT NULL
);

CREATE TABLE ordrelinje (
  ordre_id  INTEGER NOT NULL,
  linjenr   INTEGER NOT NULL,
  antall    INTEGER NOT NULL,
  PRIMARY KEY (ordre_id, linjenr),
  FOREIGN KEY (ordre_id) REFERENCES ordre(id)
);`,
  },
  {
    id: "ansatt-partner",
    title: "1:1 valgfri — ANSATT og PARTNER",
    diagram: "ANSATT  ||————O|  PARTNER",
    description:
      "En ansatt kan ha én partner — eller ingen. Mapp slik at FK kan være NULL (valgfri deltakelse).",
    hint: "Valgfri deltakelse ⇒ FK skal IKKE være NOT NULL.",
    requiredClauses: [
      "create table ansatt",
      "create table partner",
      "primary key",
      "foreign key",
      "references ansatt",
    ],
    fasit: `CREATE TABLE ansatt (
  id   INTEGER PRIMARY KEY,
  navn TEXT NOT NULL
);

CREATE TABLE partner (
  id        INTEGER PRIMARY KEY,
  navn      TEXT NOT NULL,
  ansatt_id INTEGER UNIQUE,
  FOREIGN KEY (ansatt_id) REFERENCES ansatt(id)
);`,
  },
  {
    id: "ansatt-sjef",
    title: "Selvrefererende 1:N — ANSATT med sjef",
    diagram: "ANSATT  ⟲  (sjef_id → ANSATT.id)",
    description:
      "Hver ansatt kan ha én sjef (også en ansatt). Toppsjefen har ingen sjef. Lag én tabell med en FK som peker på samme tabell.",
    hint: "Toppsjef har ingen sjef ⇒ sjef_id må kunne være NULL.",
    requiredClauses: [
      "create table ansatt",
      "primary key",
      "foreign key",
      "references ansatt",
      "sjef_id",
    ],
    fasit: `CREATE TABLE ansatt (
  id        INTEGER PRIMARY KEY,
  navn      TEXT NOT NULL,
  sjef_id   INTEGER,
  FOREIGN KEY (sjef_id) REFERENCES ansatt(id)
);`,
  },
  {
    id: "forfatter-bok",
    title: "M:N med relasjons-attributt — FORFATTER og BOK",
    diagram: "FORFATTER  >O————O<  BOK",
    description:
      "Forfattere skriver bøker; en bok kan ha flere forfattere og en forfatter flere bøker. Koblingstabellen SKRIVER skal også lagre rolle (f.eks. 'hovedforfatter').",
    hint: "Relasjons-attributter (rolle) hører hjemme i koblingstabellen.",
    requiredClauses: [
      "create table forfatter",
      "create table bok",
      "create table skriver",
      "primary key (forfatter_id, bok_id)",
      "references forfatter",
      "references bok",
      "rolle",
    ],
    fasit: `CREATE TABLE forfatter (
  id   INTEGER PRIMARY KEY,
  navn TEXT NOT NULL
);

CREATE TABLE bok (
  id     INTEGER PRIMARY KEY,
  tittel TEXT NOT NULL
);

CREATE TABLE skriver (
  forfatter_id INTEGER NOT NULL,
  bok_id       INTEGER NOT NULL,
  rolle        TEXT,
  PRIMARY KEY (forfatter_id, bok_id),
  FOREIGN KEY (forfatter_id) REFERENCES forfatter(id),
  FOREIGN KEY (bok_id)       REFERENCES bok(id)
);`,
  },
  {
    id: "avd-ansatt",
    title: "1:N med valgfri tilknytning — AVDELING og ANSATT",
    diagram: "AVDELING  ||————O<  ANSATT",
    description:
      "En avdeling kan ha 0..N ansatte. En ansatt KAN tilhøre en avdeling, men trenger ikke (nyansatte uten plassering). FK kan være NULL.",
    hint: "Valgfri deltakelse på ANSATT-siden ⇒ avd_id kan være NULL.",
    requiredClauses: [
      "create table avdeling",
      "create table ansatt",
      "primary key",
      "foreign key",
      "references avdeling",
      "avd_id",
    ],
    fasit: `CREATE TABLE avdeling (
  id   INTEGER PRIMARY KEY,
  navn TEXT NOT NULL
);

CREATE TABLE ansatt (
  id     INTEGER PRIMARY KEY,
  navn   TEXT NOT NULL,
  avd_id INTEGER,
  FOREIGN KEY (avd_id) REFERENCES avdeling(id)
);`,
  },
];
