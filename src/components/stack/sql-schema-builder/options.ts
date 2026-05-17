import type { Column, SchemaOption, Table } from "./types";

/**
 * Hjelpere som kutter ned støy i tabell-definisjonene under.
 */
const id = (): Column => ({ name: "id", type: "id-pk", notNull: true });
const fk = (
  name: string,
  table: string,
  opts: Partial<Column> = {},
): Column => ({
  name,
  type: "int",
  notNull: true,
  references: { table },
  ...opts,
});

// ============================================================================
// DOMENE-TABELLER
// Hvert domene har en samling tabeller. Vi tar med dem som faktisk er
// realistiske kjerne-entiteter i et lite, men ekte skjema.
// ============================================================================

// ----- WEBSHOP -----
const webshopTables = {
  kunde: (): Table => ({
    name: "kunde",
    comment: "Sluttbruker som handler i butikken.",
    columns: [
      id(),
      { name: "navn", type: "varchar", notNull: true },
      { name: "epost", type: "email" },
      // Adresse-felt — vil bli splittet ut hvis brukeren velger 3NF.
      { name: "gate", type: "varchar" },
      { name: "postnummer", type: "varchar" },
      { name: "poststed", type: "varchar" },
      {
        name: "opprettet",
        type: "datetime",
        notNull: true,
        default: "CURRENT_TIMESTAMP",
      },
    ],
  }),
  produkt: (): Table => ({
    name: "produkt",
    comment: "Varen som selges. Kan finnes på lager i flere antall.",
    columns: [
      id(),
      { name: "navn", type: "varchar", notNull: true },
      { name: "beskrivelse", type: "text" },
      { name: "pris", type: "decimal", notNull: true },
      { name: "lagerbeholdning", type: "int", notNull: true, default: "0" },
    ],
  }),
  ordre: (): Table => ({
    name: "ordre",
    comment: "En kundes handlekurv som er bekreftet.",
    columns: [
      id(),
      fk("kunde_id", "kunde"),
      {
        name: "bestilt",
        type: "datetime",
        notNull: true,
        default: "CURRENT_TIMESTAMP",
      },
      { name: "status", type: "varchar", notNull: true, default: "'ny'" },
    ],
  }),
  ordrelinje: (): Table => ({
    name: "ordrelinje",
    comment:
      "Mange-til-mange mellom ordre og produkt med antall og pris-på-tidspunktet.",
    columns: [
      id(),
      fk("ordre_id", "ordre"),
      fk("produkt_id", "produkt"),
      { name: "antall", type: "int", notNull: true, default: "1" },
      { name: "stykkpris", type: "decimal", notNull: true },
    ],
  }),
  betaling: (): Table => ({
    name: "betaling",
    comment: "En faktisk pengeoverføring koblet til en ordre.",
    columns: [
      id(),
      fk("ordre_id", "ordre"),
      { name: "belop", type: "decimal", notNull: true },
      { name: "metode", type: "varchar", notNull: true },
      {
        name: "tidspunkt",
        type: "datetime",
        notNull: true,
        default: "CURRENT_TIMESTAMP",
      },
    ],
  }),
};

// ----- SKOLE -----
const skoleTables = {
  student: (): Table => ({
    name: "student",
    comment: "Innskrevet student ved skolen.",
    columns: [
      id(),
      { name: "fornavn", type: "varchar", notNull: true },
      { name: "etternavn", type: "varchar", notNull: true },
      { name: "epost", type: "email" },
      { name: "fodselsdato", type: "date" },
    ],
  }),
  foreleser: (): Table => ({
    name: "foreleser",
    comment: "Ansatt som underviser i ett eller flere fag.",
    columns: [
      id(),
      { name: "navn", type: "varchar", notNull: true },
      { name: "epost", type: "email" },
      { name: "stilling", type: "varchar" },
    ],
  }),
  fag: (): Table => ({
    name: "fag",
    comment: "Et emne som tilbys.",
    columns: [
      id(),
      { name: "kode", type: "varchar", notNull: true, unique: true },
      { name: "navn", type: "varchar", notNull: true },
      { name: "studiepoeng", type: "int", notNull: true, default: "10" },
      fk("foreleser_id", "foreleser", { notNull: false }),
    ],
  }),
  tar: (): Table => ({
    name: "tar",
    comment: "Mange-til-mange: student tar fag i et gitt semester.",
    columns: [
      fk("student_id", "student"),
      fk("fag_id", "fag"),
      { name: "semester", type: "varchar", notNull: true },
    ],
    primaryKey: ["student_id", "fag_id", "semester"],
  }),
  karakter: (): Table => ({
    name: "karakter",
    comment: "Sluttkarakter for en student i et fag.",
    columns: [
      id(),
      fk("student_id", "student"),
      fk("fag_id", "fag"),
      { name: "bokstav", type: "varchar", notNull: true },
      { name: "satt_dato", type: "date", notNull: true },
    ],
    uniques: [["student_id", "fag_id"]],
  }),
};

// ----- MASKINUTLEIE -----
const utleieTables = {
  kunde: (): Table => ({
    name: "kunde",
    comment: "Bedriftskunde eller privatperson som leier utstyr.",
    columns: [
      id(),
      { name: "navn", type: "varchar", notNull: true },
      { name: "orgnr", type: "varchar", unique: true },
      { name: "epost", type: "email" },
      { name: "telefon", type: "varchar" },
    ],
  }),
  kundebehandler: (): Table => ({
    name: "kundebehandler",
    comment: "Ansatt som håndterer utleien.",
    columns: [
      id(),
      { name: "navn", type: "varchar", notNull: true },
      { name: "epost", type: "email" },
    ],
  }),
  utstyr: (): Table => ({
    name: "utstyr",
    comment:
      "Utstyrs-type (f.eks. 'Bosch slagdrill' generelt). Konkrete eksemplarer ligger i utstyr_instans.",
    columns: [
      id(),
      { name: "navn", type: "varchar", notNull: true },
      { name: "kategori", type: "varchar" },
      { name: "dagspris", type: "decimal", notNull: true },
    ],
  }),
  utstyr_instans: (): Table => ({
    name: "utstyr_instans",
    comment:
      "Et fysisk eksemplar med eget serienummer. Mange instanser per utstyr-type.",
    columns: [
      id(),
      fk("utstyr_id", "utstyr"),
      { name: "serienummer", type: "varchar", notNull: true, unique: true },
      {
        name: "status",
        type: "varchar",
        notNull: true,
        default: "'tilgjengelig'",
      },
    ],
  }),
  utleie: (): Table => ({
    name: "utleie",
    comment: "En utleie-periode der en instans er hos en kunde.",
    columns: [
      id(),
      fk("kunde_id", "kunde"),
      fk("instans_id", "utstyr_instans"),
      fk("behandler_id", "kundebehandler", { notNull: false }),
      { name: "starter", type: "date", notNull: true },
      { name: "slutter", type: "date" },
    ],
  }),
};

// ----- BIBLIOTEK -----
const bibliotekTables = {
  bruker: (): Table => ({
    name: "bruker",
    comment: "Lånekort-innehaver.",
    columns: [
      id(),
      { name: "navn", type: "varchar", notNull: true },
      { name: "epost", type: "email", unique: true },
      { name: "kortnummer", type: "varchar", notNull: true, unique: true },
    ],
  }),
  forfatter: (): Table => ({
    name: "forfatter",
    comment: "Personen som har skrevet en bok. Mange-til-mange via 'skrev'.",
    columns: [
      id(),
      { name: "navn", type: "varchar", notNull: true },
      { name: "fodselsaar", type: "int" },
    ],
  }),
  bok: (): Table => ({
    name: "bok",
    comment: "Verket på katalog-nivå. Fysiske eksemplarer ligger i 'eksemplar'.",
    columns: [
      id(),
      { name: "tittel", type: "varchar", notNull: true },
      { name: "isbn", type: "varchar", unique: true },
      { name: "utgitt_aar", type: "int" },
    ],
  }),
  skrev: (): Table => ({
    name: "skrev",
    comment:
      "Mange-til-mange mellom forfatter og bok (en bok kan ha flere forfattere).",
    columns: [fk("forfatter_id", "forfatter"), fk("bok_id", "bok")],
    primaryKey: ["forfatter_id", "bok_id"],
  }),
  eksemplar: (): Table => ({
    name: "eksemplar",
    comment: "Et fysisk eksemplar av en bok som faktisk lånes ut.",
    columns: [
      id(),
      fk("bok_id", "bok"),
      { name: "hyllenummer", type: "varchar", notNull: true },
      {
        name: "status",
        type: "varchar",
        notNull: true,
        default: "'i hyllen'",
      },
    ],
  }),
  lan: (): Table => ({
    name: "lan",
    comment: "Én utlåns-hendelse av et eksemplar til en bruker.",
    columns: [
      id(),
      fk("bruker_id", "bruker"),
      fk("eksemplar_id", "eksemplar"),
      { name: "laant_dato", type: "date", notNull: true },
      { name: "levert_dato", type: "date" },
    ],
  }),
};

// ============================================================================
// OPTIONS
// ============================================================================

export const OPTIONS: readonly SchemaOption[] = [
  // ============ DOMENE (single-select via conflicts) ====================
  {
    id: "domain-webshop",
    category: "domain",
    label: "Webshop",
    description:
      "Kunde · Produkt · Ordre · Ordrelinje · Betaling. Klassisk B2C-handel.",
    defaultOn: true,
    conflicts: ["domain-skole", "domain-utleie", "domain-bibliotek"],
    contributes: { rationale: "Domene: webshop." },
  },
  {
    id: "domain-skole",
    category: "domain",
    label: "Skole-system",
    description:
      "Student · Foreleser · Fag · Tar · Karakter. Klassisk universitets-skjema.",
    conflicts: ["domain-webshop", "domain-utleie", "domain-bibliotek"],
    contributes: { rationale: "Domene: skole." },
  },
  {
    id: "domain-utleie",
    category: "domain",
    label: "Maskinutleie",
    description:
      "Kunde · Utstyr · UtstyrInstans · Utleie · Kundebehandler. Eksempel på type vs. instans.",
    conflicts: ["domain-webshop", "domain-skole", "domain-bibliotek"],
    contributes: { rationale: "Domene: maskinutleie." },
  },
  {
    id: "domain-bibliotek",
    category: "domain",
    label: "Bibliotek",
    description:
      "Bruker · Forfatter · Skrev · Bok · Eksemplar · Lån. Mange-til-mange + type/instans.",
    conflicts: ["domain-webshop", "domain-skole", "domain-utleie"],
    contributes: { rationale: "Domene: bibliotek." },
  },

  // ============ KJERNE-ENTITETER (webshop) ===============================
  {
    id: "ws-kunde",
    category: "entities",
    label: "Kunde",
    description: "Brukerkonto med navn, epost og adresse.",
    domain: "webshop",
    defaultOn: true,
    contributes: { tables: [webshopTables.kunde()] },
  },
  {
    id: "ws-produkt",
    category: "entities",
    label: "Produkt",
    description: "Vare med pris og lagerbeholdning.",
    domain: "webshop",
    defaultOn: true,
    contributes: { tables: [webshopTables.produkt()] },
  },
  {
    id: "ws-ordre",
    category: "entities",
    label: "Ordre",
    description: "Bekreftet handlekurv. Krever Kunde.",
    domain: "webshop",
    defaultOn: true,
    requires: ["ws-kunde"],
    contributes: { tables: [webshopTables.ordre()] },
  },
  {
    id: "ws-ordrelinje",
    category: "entities",
    label: "Ordrelinje",
    description:
      "Mange-til-mange-tabell mellom Ordre og Produkt med antall og stykkpris.",
    domain: "webshop",
    defaultOn: true,
    requires: ["ws-ordre", "ws-produkt"],
    contributes: { tables: [webshopTables.ordrelinje()] },
  },
  {
    id: "ws-betaling",
    category: "entities",
    label: "Betaling",
    description: "Pengeoverføring koblet til en ordre.",
    domain: "webshop",
    requires: ["ws-ordre"],
    contributes: { tables: [webshopTables.betaling()] },
  },

  // ============ KJERNE-ENTITETER (skole) =================================
  {
    id: "sk-student",
    category: "entities",
    label: "Student",
    description: "Innskrevet student.",
    domain: "skole",
    defaultOn: true,
    contributes: { tables: [skoleTables.student()] },
  },
  {
    id: "sk-foreleser",
    category: "entities",
    label: "Foreleser",
    description: "Ansatt som underviser.",
    domain: "skole",
    defaultOn: true,
    contributes: { tables: [skoleTables.foreleser()] },
  },
  {
    id: "sk-fag",
    category: "entities",
    label: "Fag",
    description: "Emnet — har unik kode og evt. en foreleser.",
    domain: "skole",
    defaultOn: true,
    requires: ["sk-foreleser"],
    contributes: { tables: [skoleTables.fag()] },
  },
  {
    id: "sk-tar",
    category: "entities",
    label: "Tar (M:N)",
    description: "Mange-til-mange-kobling student↔fag per semester.",
    domain: "skole",
    defaultOn: true,
    requires: ["sk-student", "sk-fag"],
    contributes: { tables: [skoleTables.tar()] },
  },
  {
    id: "sk-karakter",
    category: "entities",
    label: "Karakter",
    description: "Sluttkarakter for et student/fag-par.",
    domain: "skole",
    requires: ["sk-student", "sk-fag"],
    contributes: { tables: [skoleTables.karakter()] },
  },

  // ============ KJERNE-ENTITETER (utleie) ================================
  {
    id: "ut-kunde",
    category: "entities",
    label: "Kunde",
    description: "Bedrift eller privatperson.",
    domain: "utleie",
    defaultOn: true,
    contributes: { tables: [utleieTables.kunde()] },
  },
  {
    id: "ut-kundebehandler",
    category: "entities",
    label: "Kundebehandler",
    description: "Ansatt som ekspederer utleier.",
    domain: "utleie",
    defaultOn: true,
    contributes: { tables: [utleieTables.kundebehandler()] },
  },
  {
    id: "ut-utstyr",
    category: "entities",
    label: "Utstyr (type)",
    description: "Type-tabell: 'Bosch slagdrill' med en dagspris.",
    domain: "utleie",
    defaultOn: true,
    contributes: { tables: [utleieTables.utstyr()] },
  },
  {
    id: "ut-instans",
    category: "entities",
    label: "UtstyrInstans",
    description:
      "Fysisk eksemplar med serienummer. Skiller type fra instans (klassisk modelleringsvalg).",
    domain: "utleie",
    defaultOn: true,
    requires: ["ut-utstyr"],
    contributes: { tables: [utleieTables.utstyr_instans()] },
  },
  {
    id: "ut-utleie",
    category: "entities",
    label: "Utleie",
    description: "Utleie-periode for en instans.",
    domain: "utleie",
    defaultOn: true,
    requires: ["ut-kunde", "ut-instans"],
    contributes: { tables: [utleieTables.utleie()] },
  },

  // ============ KJERNE-ENTITETER (bibliotek) =============================
  {
    id: "bi-bruker",
    category: "entities",
    label: "Bruker",
    description: "Lånekort-innehaver med kortnummer.",
    domain: "bibliotek",
    defaultOn: true,
    contributes: { tables: [bibliotekTables.bruker()] },
  },
  {
    id: "bi-forfatter",
    category: "entities",
    label: "Forfatter",
    description: "En person som har skrevet en bok.",
    domain: "bibliotek",
    defaultOn: true,
    contributes: { tables: [bibliotekTables.forfatter()] },
  },
  {
    id: "bi-bok",
    category: "entities",
    label: "Bok",
    description: "Verket på katalognivå (én rad uansett antall eksemplarer).",
    domain: "bibliotek",
    defaultOn: true,
    contributes: { tables: [bibliotekTables.bok()] },
  },
  {
    id: "bi-skrev",
    category: "entities",
    label: "Skrev (M:N)",
    description: "Bok kan ha flere forfattere; forfatter kan ha flere bøker.",
    domain: "bibliotek",
    defaultOn: true,
    requires: ["bi-forfatter", "bi-bok"],
    contributes: { tables: [bibliotekTables.skrev()] },
  },
  {
    id: "bi-eksemplar",
    category: "entities",
    label: "Eksemplar",
    description: "Fysisk eksemplar som lånes ut.",
    domain: "bibliotek",
    defaultOn: true,
    requires: ["bi-bok"],
    contributes: { tables: [bibliotekTables.eksemplar()] },
  },
  {
    id: "bi-lan",
    category: "entities",
    label: "Lån",
    description: "Én utlåns-hendelse.",
    domain: "bibliotek",
    defaultOn: true,
    requires: ["bi-bruker", "bi-eksemplar"],
    contributes: { tables: [bibliotekTables.lan()] },
  },

  // ============ NORMALISERING (single-select) ============================
  {
    id: "norm-1nf",
    category: "normalization",
    label: "1NF — atomic columns",
    description:
      "Hver kolonne har én verdi. Flate tabeller med adresse-felt i samme rad.",
    conflicts: ["norm-2nf", "norm-3nf", "norm-bcnf"],
    contributes: {
      rationale:
        "1NF: kolonner er atomiske. Vi godtar at gate/postnummer/poststed ligger inline på kunde — ingen splitting.",
    },
  },
  {
    id: "norm-2nf",
    category: "normalization",
    label: "2NF — fjern partial dependencies",
    description:
      "Ingen ikke-nøkkel-attributter avhenger av deler av en composite PK.",
    conflicts: ["norm-1nf", "norm-3nf", "norm-bcnf"],
    contributes: {
      rationale:
        "2NF: full funksjonell avhengighet til hele primærnøkkelen (relevant der vi har composite PK, f.eks. tar/skrev).",
    },
  },
  {
    id: "norm-3nf",
    category: "normalization",
    label: "3NF — splitt ut transitive avhengigheter",
    description:
      "Postnummer → poststed er en transitiv avhengighet og splittes ut i egen tabell.",
    defaultOn: true,
    conflicts: ["norm-1nf", "norm-2nf", "norm-bcnf"],
    contributes: {
      rationale:
        "3NF: postnummer → poststed er transitiv (kunde.postnummer bestemmer poststed). Splittes ut i postnummer-tabell og refereres med FK.",
      modifyTables: (tablesByName) => {
        // Splitt ut postnummer fra kunde-tabellen hvis den finnes.
        for (const t of tablesByName.values()) {
          const idx = t.columns.findIndex((c) => c.name === "poststed");
          const pnrIdx = t.columns.findIndex((c) => c.name === "postnummer");
          if (idx >= 0 && pnrIdx >= 0) {
            // Fjern poststed; gjør postnummer til FK mot postnummer-tabell.
            t.columns.splice(idx, 1);
            t.columns[pnrIdx] = {
              name: "postnummer",
              type: "varchar",
              references: { table: "postnummer", column: "postnummer" },
              comment: "FK til postnummer-tabell (transitiv avh. fjernet)",
            };
          }
        }
        // Legg til selve postnummer-tabellen hvis ikke allerede der.
        if (!tablesByName.has("postnummer")) {
          tablesByName.set("postnummer", {
            name: "postnummer",
            comment:
              "Lookup-tabell: postnummer → poststed. Splittet ut for 3NF.",
            columns: [
              { name: "postnummer", type: "varchar", notNull: true },
              { name: "poststed", type: "varchar", notNull: true },
            ],
            primaryKey: ["postnummer"],
          });
        }
      },
    },
  },
  {
    id: "norm-bcnf",
    category: "normalization",
    label: "BCNF — strengeste form",
    description:
      "Hver determinant er en superkey. Bygger på 3NF; for vårt skjema gjør den ingen ekstra splitting men markeres i kommentaren.",
    conflicts: ["norm-1nf", "norm-2nf", "norm-3nf"],
    contributes: {
      rationale:
        "BCNF: alle ikke-trivielle avhengigheter har en superkey på venstresiden. For dette skjemaet er 3NF + BCNF identisk (ingen overlappende kandidatnøkler).",
      modifyTables: (tablesByName) => {
        // Gjenbruk 3NF-splittingen.
        for (const t of tablesByName.values()) {
          const idx = t.columns.findIndex((c) => c.name === "poststed");
          const pnrIdx = t.columns.findIndex((c) => c.name === "postnummer");
          if (idx >= 0 && pnrIdx >= 0) {
            t.columns.splice(idx, 1);
            t.columns[pnrIdx] = {
              name: "postnummer",
              type: "varchar",
              references: { table: "postnummer", column: "postnummer" },
              comment: "FK til postnummer (BCNF: postnummer er superkey).",
            };
          }
        }
        if (!tablesByName.has("postnummer")) {
          tablesByName.set("postnummer", {
            name: "postnummer",
            comment: "BCNF-splittet lookup-tabell.",
            columns: [
              { name: "postnummer", type: "varchar", notNull: true },
              { name: "poststed", type: "varchar", notNull: true },
            ],
            primaryKey: ["postnummer"],
          });
        }
      },
    },
  },

  // ============ CONSTRAINTS ==============================================
  {
    id: "con-notnull",
    category: "constraints",
    label: "NOT NULL på alle kjerne-felt",
    description:
      "Tving fram verdier på navn/tittel/beløp — fanger ufullstendige rader tidlig.",
    defaultOn: true,
    contributes: {
      rationale:
        "NOT NULL er database-håndhevet kontrakt. Bedre å feile på INSERT enn å oppdage NULL i en rapport.",
    },
  },
  {
    id: "con-check-pris",
    category: "constraints",
    label: "CHECK (pris > 0)",
    description:
      "Avviser negative priser/dagspriser/beløp. Også CHECK på antall ≥ 1 der relevant.",
    defaultOn: true,
    contributes: {
      rationale:
        "CHECK-constraints koder forretningsregler inn i skjemaet. Negativ pris bør være umulig på lagringsnivå, ikke bare i appen.",
      modifyTables: (tablesByName) => {
        const priceColumns = ["pris", "dagspris", "stykkpris", "belop"];
        const countColumns = ["antall"];
        for (const t of tablesByName.values()) {
          for (const c of t.columns) {
            if (priceColumns.includes(c.name)) c.check = `${c.name} > 0`;
            if (countColumns.includes(c.name)) c.check = `${c.name} >= 1`;
          }
        }
      },
    },
  },
  {
    id: "con-unique-epost",
    category: "constraints",
    label: "UNIQUE på epost",
    description:
      "Hindrer dobbeltregistrering. Settes på alle tabeller som har epost-felt.",
    defaultOn: true,
    contributes: {
      rationale:
        "UNIQUE epost forhindrer at samme person får to kontoer ved et uhell.",
      modifyTables: (tablesByName) => {
        for (const t of tablesByName.values()) {
          for (const c of t.columns) {
            if (c.name === "epost") c.unique = true;
          }
        }
      },
    },
  },
  {
    id: "con-default-status",
    category: "constraints",
    label: "DEFAULT-verdier",
    description:
      "Tidsstempler defaulter til CURRENT_TIMESTAMP og status-felt får en startverdi.",
    defaultOn: true,
    contributes: {
      rationale:
        "DEFAULT lar appen INSERT-e uten å spesifisere felt som har en åpenbar startverdi (status='ny', opprettet=now()).",
    },
  },

  // ============ INDEKSER =================================================
  {
    id: "idx-fk-auto",
    category: "indexes",
    label: "Auto-indeks på alle FK-er",
    description:
      "Joins blir tregne uten. Mange DB-er (MySQL/InnoDB) gjør dette automatisk; PostgreSQL gjør det ikke.",
    defaultOn: true,
    contributes: {
      rationale:
        "Indeks på FK gjør JOIN ... ON child.parent_id = parent.id rask. PostgreSQL lager IKKE denne automatisk — vi gjør det eksplisitt.",
    },
  },
  {
    id: "idx-epost",
    category: "indexes",
    label: "Indeks på epost",
    description:
      "UNIQUE gir indeks gratis, men vi gjør det eksplisitt og navngir indeksen.",
    contributes: {
      rationale:
        "Eksplisitt navngitt indeks på epost — letter feilsøking i EXPLAIN-plans.",
    },
  },
  {
    id: "idx-dato",
    category: "indexes",
    label: "Indeks på dato-kolonner",
    description:
      "ORDER BY opprettet/bestilt/laant_dato DESC blir mye raskere med btree-indeks.",
    contributes: {
      rationale:
        "Indeks på timestamp/date-kolonner er ofte avgjørende for rapporter som filtrerer på tidsperiode.",
    },
  },

  // ============ DIALEKT (single-select) ==================================
  {
    id: "dia-postgres",
    category: "dialect",
    label: "PostgreSQL",
    description:
      "SERIAL/IDENTITY for PK, TEXT er gratis, dobbel anførselstegn på identifiers.",
    defaultOn: true,
    conflicts: ["dia-mysql", "dia-sqlite"],
    contributes: { rationale: "Dialekt: PostgreSQL." },
  },
  {
    id: "dia-mysql",
    category: "dialect",
    label: "MySQL",
    description:
      "AUTO_INCREMENT, ENGINE=InnoDB, VARCHAR(N) krever lengde, backticks for identifiers.",
    conflicts: ["dia-postgres", "dia-sqlite"],
    contributes: { rationale: "Dialekt: MySQL/InnoDB." },
  },
  {
    id: "dia-sqlite",
    category: "dialect",
    label: "SQLite",
    description:
      "INTEGER PRIMARY KEY AUTOINCREMENT, dynamiske typer (TEXT/REAL), ingen ENGINE-klausul.",
    conflicts: ["dia-postgres", "dia-mysql"],
    contributes: { rationale: "Dialekt: SQLite." },
  },
];
