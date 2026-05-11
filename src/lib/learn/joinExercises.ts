import type { JoinExercise } from "./types";

// NOTE: Add new exercises by following the schema below.
// Keep tables small (3-6 rows) so the visual diff between INNER/LEFT/RIGHT/FULL is obvious.
// Aim for one of these scenario shapes:
//   - one unmatched row on each side (great default)
//   - duplicate keys on the right (shows row multiplication)
//   - NULL in a key column (shows that NULL never matches)
//   - no overlap at all (INNER = empty, FULL = stacked)

export const JOIN_EXERCISES: JoinExercise[] = [
  {
    id: "j1",
    title: "Kunde og utleie",
    scenario:
      "En kunde-tabell og en utleie-tabell. Noen kunder har ikke leid noe. Noen utleier står ført på en kunde-id som ikke lenger finnes (etter at kunden ble slettet).",
    topic: "Grunnleggende JOIN",
    difficulty: 1,
    left: {
      name: "kunde",
      columns: ["kundenr", "navn"],
      rows: [
        [1, "Ola"],
        [2, "Kari"],
        [3, "Per"],
      ],
    },
    right: {
      name: "utleie",
      columns: ["utleieid", "kundenr", "dato"],
      rows: [
        [101, 1, "2026-01-10"],
        [102, 1, "2026-02-15"],
        [103, 2, "2026-03-01"],
        [104, 9, "2026-03-20"],
      ],
    },
    leftKey: "kundenr",
    rightKey: "kundenr",
    explanation:
      "INNER gir 3 rader: Ola dukker opp to ganger (han har to utleier) og Kari én gang. Per faller bort. LEFT tar med Per med NULL i utleie-kolonnene (4 rader). RIGHT tar med utleie 104 selv om kundenr 9 ikke finnes (4 rader, men uten Per). FULL tar med både Per og utleie 104 (5 rader).",
  },
  {
    id: "j2",
    title: "Ansatt og avdeling",
    scenario:
      "Klassisk emp/dept. Én ansatt har ikke fått tildelt avdeling (NULL deptno). Én avdeling har ingen ansatte.",
    topic: "NULL-håndtering",
    difficulty: 2,
    left: {
      name: "emp",
      columns: ["empno", "ename", "deptno"],
      rows: [
        [7369, "Smith", 20],
        [7499, "Allen", 30],
        [7521, "Ward", 30],
        [7566, "Jones", null],
      ],
    },
    right: {
      name: "dept",
      columns: ["deptno", "dname"],
      rows: [
        [10, "Accounting"],
        [20, "Research"],
        [30, "Sales"],
      ],
    },
    leftKey: "deptno",
    rightKey: "deptno",
    explanation:
      "Jones har NULL deptno og blir aldri matchet — NULL = NULL er aldri sant. INNER mister både Jones og avdeling 10. LEFT beholder Jones. RIGHT beholder avdeling 10. FULL beholder begge.",
  },
  {
    id: "j3",
    title: "Kunde og ordre (duplikater)",
    scenario:
      "En kunde-tabell og en ordre-tabell. Én kunde har lagt inn flere ordrer, en annen har ingen, og én ordre er knyttet til et kundenr som ikke finnes lenger.",
    topic: "Duplikate nøkler",
    difficulty: 2,
    left: {
      name: "kunde",
      columns: ["kundenr", "navn"],
      rows: [
        [1, "Ingrid"],
        [2, "Jonas"],
        [3, "Mari"],
      ],
    },
    right: {
      name: "ordre",
      columns: ["ordrenr", "kundenr", "belop"],
      rows: [
        [501, 1, 250],
        [502, 1, 480],
        [503, 1, 120],
        [504, 2, 990],
        [505, 7, 75],
      ],
    },
    leftKey: "kundenr",
    rightKey: "kundenr",
    explanation:
      "INNER gir 4 rader: Ingrid dukker opp tre ganger fordi hun har tre ordrer, og Jonas én gang. LEFT legger til Mari med NULL i ordre-kolonnene (5 rader totalt). RIGHT tar med ordre 505 (kundenr 7 finnes ikke) men mister Mari. FULL tar med både Mari og ordre 505 (6 rader). Legg merke til at LEFT JOIN duplikerer venstre-rad når høyre-tabellen har flere treff.",
  },
  {
    id: "j4",
    title: "Produkt og leverandor (ingen overlapp)",
    scenario:
      "En produkt-tabell og en leverandor-tabell der ingen av produktene faktisk er knyttet til noen registrert leverandor — typisk situasjon rett etter en datamigrasjon.",
    topic: "Tom snittmengde",
    difficulty: 1,
    left: {
      name: "produkt",
      columns: ["produktnr", "navn"],
      rows: [
        [1, "Skrue M6"],
        [2, "Mutter M6"],
        [3, "Skive M6"],
      ],
    },
    right: {
      name: "leverandor",
      columns: ["leverandornr", "firma"],
      rows: [
        [10, "Stalmek AS"],
        [11, "Boltimport"],
        [12, "Nordbolt"],
      ],
    },
    leftKey: "produktnr",
    rightKey: "leverandornr",
    explanation:
      "Nokkelverdiene 1, 2, 3 i produkt overlapper ikke med 10, 11, 12 i leverandor. INNER blir derfor tom. LEFT gir 3 rader (alle produkter med NULL i leverandor-kolonnene). RIGHT gir 3 rader (alle leverandorer med NULL i produkt-kolonnene). FULL stabler begge og gir 6 rader. Dette illustrerer at INNER krever faktisk match — ikke bare at det finnes data.",
  },
  {
    id: "j5",
    title: "Ansatt og sjef",
    scenario:
      "En ansatt-tabell der hver ansatt har en sjef_id som peker til en sjef-tabell. Toppsjefen har sjef_id = NULL, og én sjef i registeret er ikke satt opp som sjef for noen ennå.",
    topic: "NULL i fremmednokkel",
    difficulty: 2,
    left: {
      name: "ansatt",
      columns: ["ansattnr", "navn", "sjef_id"],
      rows: [
        [1, "Ola", 100],
        [2, "Kari", 100],
        [3, "Per", 200],
        [4, "Liv", null],
      ],
    },
    right: {
      name: "sjef",
      columns: ["sjefnr", "tittel"],
      rows: [
        [100, "Avdelingsleder"],
        [200, "Teamleder"],
        [300, "Direktor"],
      ],
    },
    leftKey: "sjef_id",
    rightKey: "sjefnr",
    explanation:
      "Liv har NULL sjef_id og matcher aldri — NULL er aldri lik noe, heller ikke en annen NULL. INNER gir 3 rader (Ola, Kari, Per). LEFT tar i tillegg med Liv med NULL i sjef-kolonnene (4 rader). RIGHT tar med Direktor (sjefnr 300) som ingen rapporterer til, men mister Liv. FULL beholder begge spesialtilfellene (5 rader).",
  },
  {
    id: "j6",
    title: "Utleieordre og vare",
    scenario:
      "En utleieordre-tabell viser hvilken vare som er leid ut. Én utleieordre peker til en vare som er fjernet fra katalogen, og én vare har aldri blitt leid ut.",
    topic: "Fremmednokkel mot oppslagstabell",
    difficulty: 2,
    left: {
      name: "utleieordre",
      columns: ["ordrenr", "vare_id", "dager"],
      rows: [
        [1, 10, 3],
        [2, 11, 1],
        [3, 10, 7],
        [4, 99, 2],
      ],
    },
    right: {
      name: "vare",
      columns: ["vareid", "betegnelse"],
      rows: [
        [10, "Slagdrill"],
        [11, "Stigemodul"],
        [12, "Trykkluftpumpe"],
      ],
    },
    leftKey: "vare_id",
    rightKey: "vareid",
    explanation:
      "INNER gir 3 rader: ordre 1, 2 og 3 finner sin vare (Slagdrill dukker opp to ganger). LEFT tar med ordre 4 med NULL i vare-kolonnene fordi vare_id 99 ikke finnes (4 rader). RIGHT tar med Trykkluftpumpe som aldri er leid ut, men mister ordre 4 (4 rader). FULL beholder begge — 5 rader totalt.",
  },
  {
    id: "j7",
    title: "Student og kurs",
    scenario:
      "En koblingstabell mellom student og kurs. Noen studenter har ikke meldt seg på noe ennå, og ett kurs har ingen pameldte. Vi forenkler ved a la kobling sta direkte mellom de to tabellene.",
    topic: "Mange-til-mange",
    difficulty: 3,
    left: {
      name: "student",
      columns: ["studentnr", "navn", "kurskode"],
      rows: [
        [1, "Anna", "DAT1000"],
        [2, "Bjorn", "DAT1000"],
        [3, "Cecilie", "INF1100"],
        [4, "David", null],
      ],
    },
    right: {
      name: "kurs",
      columns: ["kurskode", "tittel"],
      rows: [
        ["DAT1000", "Databaser"],
        ["INF1100", "Programmering"],
        ["MAT1010", "Diskret matematikk"],
      ],
    },
    leftKey: "kurskode",
    rightKey: "kurskode",
    explanation:
      "INNER gir 3 rader: Anna og Bjorn pa Databaser, Cecilie pa Programmering. David har NULL kurskode og matcher ikke. LEFT legger David til med NULL i kurs-kolonnene (4 rader). RIGHT legger til MAT1010 som ingen er pameldt (4 rader, men uten David). FULL har begge — 5 rader. Dette viser hvordan partiell overlapp gir tydelig diff mellom alle fire JOIN-typer.",
  },
  {
    id: "j8",
    title: "Ansatt og lonnsutbetaling",
    scenario:
      "En ansatt-tabell og en lonnsutbetaling-tabell. Noen ansatte har fatt flere utbetalinger, en nyansatt har ingen ennå, og én utbetaling er bokfort pa et ansattnr som ikke lenger finnes.",
    topic: "Transaksjonshistorikk",
    difficulty: 2,
    left: {
      name: "ansatt",
      columns: ["ansattnr", "navn"],
      rows: [
        [1, "Hilde"],
        [2, "Truls"],
        [3, "Sara"],
      ],
    },
    right: {
      name: "lonnsutbetaling",
      columns: ["utbetalingsnr", "ansattnr", "dato", "belop"],
      rows: [
        [9001, 1, "2026-03-25", 42000],
        [9002, 1, "2026-04-25", 42000],
        [9003, 2, "2026-04-25", 38000],
        [9004, 8, "2026-04-25", 35000],
      ],
    },
    leftKey: "ansattnr",
    rightKey: "ansattnr",
    explanation:
      "INNER gir 3 rader: Hilde to ganger (to utbetalinger) og Truls én gang. Sara mangler fordi hun ikke har faatt lonn ennaa. LEFT tar med Sara med NULL i lonn-kolonnene (4 rader). RIGHT tar med utbetaling 9004 til ansattnr 8 som ikke finnes lenger (4 rader, men uten Sara). FULL beholder begge avvikene — 5 rader.",
  },
  {
    id: "j9",
    title: "Bil og eier",
    scenario:
      "En bil-tabell og en eier-tabell. Én bil star uten registrert eier (kanskje nettopp solgt fra forhandler), og én eier er registrert i systemet uten at bilen er knyttet til pers ennaa.",
    topic: "En-til-en med NULL",
    difficulty: 1,
    left: {
      name: "bil",
      columns: ["regnr", "modell", "eier_id"],
      rows: [
        ["AB12345", "Volvo V60", 1],
        ["CD67890", "Tesla Model 3", 2],
        ["EF11223", "VW Golf", null],
        ["GH44556", "Toyota Yaris", 1],
      ],
    },
    right: {
      name: "eier",
      columns: ["eiernr", "navn"],
      rows: [
        [1, "Marit Berg"],
        [2, "Trond Lie"],
        [3, "Eva Holm"],
      ],
    },
    leftKey: "eier_id",
    rightKey: "eiernr",
    explanation:
      "INNER gir 3 rader: Marit eier to biler (Volvo og Toyota), Trond eier Tesla. VW Golf har NULL eier_id og matcher aldri. LEFT tar med VW Golf med NULL i eier-kolonnene (4 rader). RIGHT tar med Eva Holm som ikke har bil registrert (4 rader, men uten VW Golf). FULL har begge — 5 rader.",
  },
  {
    id: "j11",
    title: "T-skjorte og storrelse (alle kombinasjoner)",
    scenario:
      "Du skal generere en sortimentmatrise: hver T-skjortemodell skal selges i hver storrelse. Det finnes ingen felles nokkel — du vil bare ha alle kombinasjoner.",
    topic: "CROSS JOIN",
    difficulty: 1,
    joinTypes: ["INNER", "LEFT", "RIGHT", "FULL", "CROSS"],
    correctType: "CROSS",
    left: {
      name: "tshirt",
      columns: ["modellnr", "navn"],
      rows: [
        [1, "Klassisk"],
        [2, "Polo"],
        [3, "V-hals"],
      ],
    },
    right: {
      name: "storrelse",
      columns: ["kode", "beskrivelse"],
      rows: [
        ["S", "Small"],
        ["M", "Medium"],
        ["L", "Large"],
      ],
    },
    leftKey: "modellnr",
    rightKey: "kode",
    explanation:
      "modellnr (1,2,3) og kode ('S','M','L') overlapper aldri, sa INNER blir tom. LEFT/RIGHT gir 3 rader hver med NULL pa motsatt side, FULL stabler dem til 6. CROSS ignorerer noklene og gir alle kombinasjoner: 3 × 3 = 9 rader. Dette er klassisk bruk av CROSS JOIN — generere et fullt rutenett av kombinasjoner.",
  },
  {
    id: "j12",
    title: "Kunde med én ordre hver (perfekt match)",
    scenario:
      "Tre kunder, tre ordrer, én ordre per kunde og ingen mangler eller dubletter. Et lærerikt tilfelle: nar alt matcher, ser INNER, LEFT, RIGHT og FULL helt like ut.",
    topic: "Perfekt 1:1 — JOIN-type uten betydning",
    difficulty: 2,
    joinTypes: ["INNER", "LEFT", "RIGHT", "FULL", "CROSS"],
    left: {
      name: "kunde",
      columns: ["kundenr", "navn"],
      rows: [
        [1, "Astrid"],
        [2, "Bjorn"],
        [3, "Cato"],
      ],
    },
    right: {
      name: "ordre",
      columns: ["ordrenr", "kundenr", "belop"],
      rows: [
        [501, 1, 250],
        [502, 2, 480],
        [503, 3, 120],
      ],
    },
    leftKey: "kundenr",
    rightKey: "kundenr",
    explanation:
      "Hver kunde matcher nøyaktig én ordre, og hver ordre treffer en kunde — derfor gir INNER, LEFT, RIGHT og FULL alle 3 rader med samme innhold. CROSS er den eneste som ser annerledes ut: 3 × 3 = 9 rader (alle kombinasjoner, inkludert urelevante som Astrid + ordre 502). Lærepunktet: forskjellen mellom OUTER JOIN-typene viser seg bare nar det finnes umatchede rader.",
  },
  {
    id: "j13",
    title: "Spillere og kamper (mange-til-mange pa klubb)",
    scenario:
      "Spillere er knyttet til en klubb, og kamper hører til en klubb. Begge sider har dubletter pa klubb-nokkelen, sa INNER multipliserer rader. I tillegg har én spiller ingen klubb, og én kamp tilhører en klubb uten spillere registrert.",
    topic: "Mange-til-mange og radmultiplikasjon",
    difficulty: 3,
    joinTypes: ["INNER", "LEFT", "RIGHT", "FULL", "CROSS"],
    left: {
      name: "spiller",
      columns: ["spillernr", "navn", "klubb"],
      rows: [
        [1, "Anna", "Lyn"],
        [2, "Berit", "Lyn"],
        [3, "Carl", "Ull"],
        [4, "Dag", null],
      ],
    },
    right: {
      name: "kamp",
      columns: ["kampid", "klubb", "dato"],
      rows: [
        [100, "Lyn", "2026-04-05"],
        [101, "Lyn", "2026-04-12"],
        [102, "Ull", "2026-04-19"],
        [103, "Vard", "2026-04-26"],
      ],
    },
    leftKey: "klubb",
    rightKey: "klubb",
    explanation:
      "Pa klubben Lyn har vi 2 spillere × 2 kamper = 4 rader. Pa Ull er det 1 × 1 = 1 rad. INNER gir derfor 5 rader. Dag (NULL klubb) matcher aldri — LEFT legger ham til (6 rader). Vard-kampen (kampid 103) har ingen spillere — RIGHT tar den med (6 rader, men uten Dag). FULL beholder begge avvikene (7 rader). CROSS overser klubb og gir 4 × 4 = 16 rader.",
  },
  {
    id: "j10",
    title: "Bok og utlan",
    scenario:
      "Et bibliotek har en bok-tabell og en utlan-tabell. Noen boker har aldri vaert lant ut, og én utlan-rad refererer til en bokid som er fjernet fra katalogen (kanskje boken er kassert).",
    topic: "Bibliotek-scenario",
    difficulty: 2,
    left: {
      name: "bok",
      columns: ["bokid", "tittel"],
      rows: [
        [1, "Database Design"],
        [2, "SQL i praksis"],
        [3, "Algoritmer"],
        [4, "Operativsystemer"],
      ],
    },
    right: {
      name: "utlan",
      columns: ["utlanid", "bokid", "lanedato"],
      rows: [
        [200, 1, "2026-02-01"],
        [201, 2, "2026-02-10"],
        [202, 2, "2026-03-05"],
        [203, 99, "2026-03-12"],
      ],
    },
    leftKey: "bokid",
    rightKey: "bokid",
    explanation:
      "INNER gir 3 rader: Database Design én gang, SQL i praksis to ganger. Algoritmer og Operativsystemer er aldri laant ut og er derfor utelatt. LEFT tar dem med som rader med NULL i utlan-kolonnene (5 rader). RIGHT tar med utlan 203 som peker til bokid 99 (ikke i katalogen lenger), men mister Algoritmer/Operativsystemer (4 rader). FULL har alle avvikene — 6 rader.",
  },
];
