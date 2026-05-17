// Debugging-jakt — 20 realistiske bugs (12 Python + 8 SQL).
//
// Hver bug skal være noe en ekte utvikler har skrevet og slitt med:
// off-by-one, mutable default, late-binding closure, NULL-aritmetikk,
// LEFT JOIN + WHERE, GROUP BY uten aggregat, float-sammenligning, N+1,
// recursion uten base case, cache-miss, JOIN på feil felt.
//
// Test-driveren for Python kjører `func(*case.input)` mot `case.expected`.
// For SQL: vi kjører `query` mot et lite test-skjema (preSql) og sammenligner
// resultatraderne mot `expectedRows`.

export type BugKategori =
  | "off-by-one"
  | "scoping"
  | "mutable-default"
  | "float-presisjon"
  | "concurrency"
  | "performance"
  | "rekursjon"
  | "case-sensitivitet"
  | "sql-join"
  | "sql-null"
  | "sql-group-by"
  | "sql-edge-case";

export interface TestCase {
  /** Beskrivelse vist i UI ("input: [3, 1, 2] → 2"). */
  beskrivelse: string;
  /** Python: argumenter til funksjonen. SQL: ikke brukt. */
  input?: unknown[];
  /** Forventet returverdi (Python) — sammenlignes som JSON. */
  expected?: unknown;
}

export interface SqlTestSpec {
  /** DDL + INSERT som setter opp test-DBen. Kjøres FØR bruker-querien. */
  setup: string;
  /** Forventede rader, akkurat slik SQLite returnerer dem (etter ORDER BY). */
  expectedRows: unknown[][];
  /** Forventede kolonnenavn — sammenlignet kun hvis satt. */
  expectedColumns?: string[];
}

export interface DebugBug {
  id: string;
  tittel: string;
  sprak: "python" | "sql";
  kategori: BugKategori;
  vanskelighet: 1 | 2 | 3 | 4 | 5;
  /** Kort hva koden SKAL gjøre (klart spesifisert). */
  expected: string;
  /** Den buggy koden brukeren får i editoren. */
  kode: string;
  /** Korrekt versjon (fasit). */
  fasit: string;
  /** Forklaring av bug-en + hvorfor det er en vanlig feil. */
  bugForklaring: string;
  /** Python: navnet på funksjonen som testes. SQL: ikke brukt. */
  funksjonsnavn?: string;
  /** Python testCases — null for SQL. */
  testCases?: TestCase[];
  /** SQL testspec — null for Python. */
  sqlTest?: SqlTestSpec;
  /** Pekere til relaterte stack-sider (slugs i CURRICULUM_ORDER). */
  beslektetLitteratur?: { slug: string; tittel: string }[];
}

// ============================================================================
// PYTHON BUGS (12)
// ============================================================================

export const DEBUG_BUGS: DebugBug[] = [
  // ---------- 1: Off-by-one (klassiker) ----------
  {
    id: "py-off-by-one-sum",
    tittel: "Summer tall fra 1 til n",
    sprak: "python",
    kategori: "off-by-one",
    vanskelighet: 1,
    expected:
      "sum_til_n(n) skal returnere summen av alle heltall fra 1 til og med n. sum_til_n(5) → 15.",
    funksjonsnavn: "sum_til_n",
    kode: `def sum_til_n(n):
    total = 0
    for i in range(1, n):
        total += i
    return total
`,
    fasit: `def sum_til_n(n):
    total = 0
    for i in range(1, n + 1):
        total += i
    return total
`,
    bugForklaring:
      "range(1, n) stopper FØR n — det inkluderer ikke n selv. For sum 1..5 ville den summere 1+2+3+4 = 10, ikke 15. Klassisk off-by-one: range(start, stop) er halvåpent, stop er eksklusiv. Skal du inkludere n, må du skrive range(1, n + 1) eller range(n) + 1 hvis du starter på 0.",
    testCases: [
      { beskrivelse: "sum_til_n(5) → 15", input: [5], expected: 15 },
      { beskrivelse: "sum_til_n(10) → 55", input: [10], expected: 55 },
      { beskrivelse: "sum_til_n(1) → 1", input: [1], expected: 1 },
      { beskrivelse: "sum_til_n(100) → 5050", input: [100], expected: 5050 },
    ],
    beslektetLitteratur: [
      { slug: "python-grunnsyntaks", tittel: "Python grunnsyntaks" },
    ],
  },

  // ---------- 2: Mutable default ----------
  {
    id: "py-mutable-default",
    tittel: "Legg vare i handlekurv",
    sprak: "python",
    kategori: "mutable-default",
    vanskelighet: 3,
    expected:
      "legg_til(vare, kurv=...) skal returnere en NY handlekurv med varen lagt til. To kall uten kurv-argument skal gi to UAVHENGIGE handlekurver.",
    funksjonsnavn: "legg_til",
    kode: `def legg_til(vare, kurv=[]):
    kurv.append(vare)
    return kurv
`,
    fasit: `def legg_til(vare, kurv=None):
    if kurv is None:
        kurv = []
    kurv.append(vare)
    return kurv
`,
    bugForklaring:
      "Default-argumenter i Python evalueres EN gang — når funksjonen defineres, ikke når den kalles. Den tomme listen []  er derfor SAMME liste på tvers av alle kall som ikke gir kurv eksplisitt. Resultat: legg_til('a'); legg_til('b') gir ['a', 'b'] andre gang, ikke ['b']. Riktig pattern er kurv=None + sjekk inni.",
    testCases: [
      {
        beskrivelse: "To uavhengige kall: legg_til('a') == ['a']",
        input: ["__sentinel_first__"],
        expected: ["a"],
      },
    ],
    beslektetLitteratur: [
      { slug: "python-grunnsyntaks", tittel: "Python grunnsyntaks" },
    ],
  },

  // ---------- 3: Late binding closure ----------
  {
    id: "py-late-binding-closure",
    tittel: "Lag liste av multiplikatorer",
    sprak: "python",
    kategori: "scoping",
    vanskelighet: 4,
    expected:
      "lag_multiplikatorer(n) skal returnere en liste med n funksjoner, hvor funksjon nr i ganger input med i. F.eks. lag_multiplikatorer(3)[2](10) → 20.",
    funksjonsnavn: "lag_multiplikatorer",
    kode: `def lag_multiplikatorer(n):
    funcs = []
    for i in range(n):
        funcs.append(lambda x: x * i)
    return funcs
`,
    fasit: `def lag_multiplikatorer(n):
    funcs = []
    for i in range(n):
        funcs.append(lambda x, i=i: x * i)
    return funcs
`,
    bugForklaring:
      "Lambdaer fanger variabler ved REFERANSE, ikke verdi. Når loopen er ferdig peker alle lambdaene på SAMME i, og den har siste verdi (n - 1). Resultat: alle ganger med n-1, ikke 0, 1, 2, ... Løs ved å binde i som default-argument (lambda x, i=i: ...) — da snappes verdien NÅ.",
    testCases: [
      {
        beskrivelse: "lag_multiplikatorer(3)[0](10) → 0",
        input: ["__call_idx__", 3, 0, 10],
        expected: 0,
      },
      {
        beskrivelse: "lag_multiplikatorer(3)[1](10) → 10",
        input: ["__call_idx__", 3, 1, 10],
        expected: 10,
      },
      {
        beskrivelse: "lag_multiplikatorer(3)[2](10) → 20",
        input: ["__call_idx__", 3, 2, 10],
        expected: 20,
      },
    ],
    beslektetLitteratur: [
      { slug: "python-grunnsyntaks", tittel: "Python grunnsyntaks" },
    ],
  },

  // ---------- 4: Float-sammenligning ----------
  {
    id: "py-float-comparison",
    tittel: "Sjekk om totalen er 0.30",
    sprak: "python",
    kategori: "float-presisjon",
    vanskelighet: 2,
    expected:
      "er_eksakt(a, b, mål) skal returnere True hvis a + b er praktisk talt lik mål (innen 1e-9 toleranse). er_eksakt(0.1, 0.2, 0.3) → True.",
    funksjonsnavn: "er_eksakt",
    kode: `def er_eksakt(a, b, mål):
    return a + b == mål
`,
    fasit: `import math

def er_eksakt(a, b, mål):
    return math.isclose(a + b, mål, abs_tol=1e-9)
`,
    bugForklaring:
      "Flyttall (float) i IEEE 754 kan ikke representere 0.1 og 0.2 eksakt. 0.1 + 0.2 blir 0.30000000000000004, IKKE 0.3. Derfor er == nesten alltid feil for flyttall. Bruk math.isclose() eller en eksplisitt toleranse (abs(a - b) < 1e-9). Samme problem rammer alle desimalberegninger — bruk decimal.Decimal hvis du trenger eksakt presisjon (f.eks. penger).",
    testCases: [
      { beskrivelse: "er_eksakt(0.1, 0.2, 0.3) → True", input: [0.1, 0.2, 0.3], expected: true },
      { beskrivelse: "er_eksakt(1.0, 2.0, 3.0) → True", input: [1.0, 2.0, 3.0], expected: true },
      { beskrivelse: "er_eksakt(0.1, 0.1, 0.3) → False", input: [0.1, 0.1, 0.3], expected: false },
    ],
  },

  // ---------- 5: Recursion uten base case ----------
  {
    id: "py-recursion-no-base",
    tittel: "Beregn fakultet rekursivt",
    sprak: "python",
    kategori: "rekursjon",
    vanskelighet: 2,
    expected:
      "fakultet(n) skal returnere n! (n fakultet). fakultet(0) → 1, fakultet(5) → 120.",
    funksjonsnavn: "fakultet",
    kode: `def fakultet(n):
    return n * fakultet(n - 1)
`,
    fasit: `def fakultet(n):
    if n <= 1:
        return 1
    return n * fakultet(n - 1)
`,
    bugForklaring:
      "Funksjonen mangler base case — den kaller seg selv i det uendelige. n teller nedover under null, RecursionError kommer (Python har ca. 1000 nivåers grense). Hver rekursiv funksjon MÅ ha en base case som returnerer uten å kalle seg selv. For fakultet: fakultet(0) = fakultet(1) = 1.",
    testCases: [
      { beskrivelse: "fakultet(0) → 1", input: [0], expected: 1 },
      { beskrivelse: "fakultet(1) → 1", input: [1], expected: 1 },
      { beskrivelse: "fakultet(5) → 120", input: [5], expected: 120 },
      { beskrivelse: "fakultet(7) → 5040", input: [7], expected: 5040 },
    ],
  },

  // ---------- 6: Cache miss / case sensitive dict ----------
  {
    id: "py-cache-case-sensitive",
    tittel: "Slå opp brukerprofil i cache",
    sprak: "python",
    kategori: "case-sensitivitet",
    vanskelighet: 3,
    expected:
      "finn_bruker(cache, navn) skal returnere brukeren fra cachen — søket skal være case-insensitivt slik at 'Alice', 'alice' og 'ALICE' alle treffer.",
    funksjonsnavn: "finn_bruker",
    kode: `def finn_bruker(cache, navn):
    return cache.get(navn)
`,
    fasit: `def finn_bruker(cache, navn):
    return cache.get(navn.lower())
`,
    bugForklaring:
      "Cachen er bygget med små bokstaver (cache = {'alice': ..., 'bob': ...}), men oppslaget bruker navnet uendret. cache.get('Alice') returnerer None fordi nøkkelen er 'alice'. Klassisk bug i autentisering, e-post-lookup, URL-routing. Normaliser nøkkelen ved BÅDE skriving og lesning — typisk .lower() eller .strip().lower(). Aldri stol på at input har 'rett' format.",
    testCases: [
      {
        beskrivelse: "cache={'alice': 1}, finn_bruker(cache, 'Alice') → 1",
        input: ["__cache_lookup__", "Alice"],
        expected: 1,
      },
      {
        beskrivelse: "cache={'alice': 1}, finn_bruker(cache, 'ALICE') → 1",
        input: ["__cache_lookup__", "ALICE"],
        expected: 1,
      },
      {
        beskrivelse: "cache={'alice': 1}, finn_bruker(cache, 'alice') → 1",
        input: ["__cache_lookup__", "alice"],
        expected: 1,
      },
    ],
  },

  // ---------- 7: Concurrency / await sekvensielt ----------
  {
    id: "py-async-sequential",
    tittel: "Hent to API-svar parallelt",
    sprak: "python",
    kategori: "concurrency",
    vanskelighet: 4,
    expected:
      "hent_begge() skal returnere [svar_a, svar_b] — begge API-kallene skal kjøres SAMTIDIG (parallelt), ikke sekvensielt. Hvert kall tar 0.1s, så total skal være ca 0.1s, ikke 0.2s.",
    funksjonsnavn: "hent_begge",
    kode: `import asyncio

async def hent_a():
    await asyncio.sleep(0.05)
    return "A"

async def hent_b():
    await asyncio.sleep(0.05)
    return "B"

async def hent_begge():
    a = await hent_a()
    b = await hent_b()
    return [a, b]
`,
    fasit: `import asyncio

async def hent_a():
    await asyncio.sleep(0.05)
    return "A"

async def hent_b():
    await asyncio.sleep(0.05)
    return "B"

async def hent_begge():
    a, b = await asyncio.gather(hent_a(), hent_b())
    return [a, b]
`,
    bugForklaring:
      "To 'await' etter hverandre kjører sekvensielt — andre kall starter først NÅR det første er ferdig. Total tid = sum av begge. Bruk asyncio.gather(coro1, coro2) for å starte dem samtidig og vente på begge — total tid = max av begge. Klassisk perf-bug i async-kode: ser ut som du parallelliserer fordi det er async, men gjør det ikke. (Vi tester kun korrekthet på utdata her, ikke tid — men forklaringen er den viktige.)",
    testCases: [
      { beskrivelse: "hent_begge() → ['A', 'B']", input: ["__async__"], expected: ["A", "B"] },
    ],
  },

  // ---------- 8: N+1 query (algoritmisk versjon) ----------
  {
    id: "py-n-plus-one",
    tittel: "Beregn total for hver ordre",
    sprak: "python",
    kategori: "performance",
    vanskelighet: 3,
    expected:
      "totaler(ordrer, linjer) skal returnere {ordre_id: sum_pris}. Linjer er en liste av (ordre_id, pris). Implementasjonen skal være O(n + m), ikke O(n * m) — ikke skann linjer-listen på nytt for hver ordre.",
    funksjonsnavn: "totaler",
    kode: `def totaler(ordrer, linjer):
    result = {}
    for ordre_id in ordrer:
        total = 0
        for lid, pris in linjer:
            if lid == ordre_id:
                total += pris
        result[ordre_id] = total
    return result
`,
    fasit: `def totaler(ordrer, linjer):
    summer = {}
    for lid, pris in linjer:
        summer[lid] = summer.get(lid, 0) + pris
    return {oid: summer.get(oid, 0) for oid in ordrer}
`,
    bugForklaring:
      "For hver ordre skanner du HELE linje-listen. Med 1000 ordrer og 10000 linjer blir det 10 millioner sammenligninger. Algoritmisk N+1: en outer-loop som triggrer en inner-skan. Gjør i stedet ETT pass over linjer som bygger opp et dict (ordre_id → total), deretter ETT pass over ordrer. Total: O(n + m). Samme mønster gjelder for SQL: ikke kall SELECT inni en loop — bruk JOIN eller IN (...). Pass på at tester verifiserer korrekthet — perf-forskjellen ser du ikke på små input.",
    testCases: [
      {
        beskrivelse: "totaler([1,2], [(1,10),(1,5),(2,7)]) → {1: 15, 2: 7}",
        input: [[1, 2], [[1, 10], [1, 5], [2, 7]]],
        expected: { 1: 15, 2: 7 },
      },
      {
        beskrivelse: "totaler([1], [(2, 99)]) → {1: 0}",
        input: [[1], [[2, 99]]],
        expected: { 1: 0 },
      },
    ],
  },

  // ---------- 9: Dict-mutering under iterasjon ----------
  {
    id: "py-dict-mutate-during-iter",
    tittel: "Fjern inaktive brukere",
    sprak: "python",
    kategori: "scoping",
    vanskelighet: 2,
    expected:
      "fjern_inaktive(brukere) skal returnere et nytt dict med kun aktive brukere (verdi True). Input mutators skal IKKE krasje.",
    funksjonsnavn: "fjern_inaktive",
    kode: `def fjern_inaktive(brukere):
    for navn in brukere:
        if not brukere[navn]:
            del brukere[navn]
    return brukere
`,
    fasit: `def fjern_inaktive(brukere):
    return {navn: aktiv for navn, aktiv in brukere.items() if aktiv}
`,
    bugForklaring:
      "Du muterer dict-en mens du itererer over den — Python kaster RuntimeError: dictionary changed size during iteration. Samme problem gjelder lister og sets. To løsninger: (1) iterer over list(brukere.keys()) for å fryse nøklene først, (2) bedre — bygg et NYTT dict via comprehension. Sistnevnte er også mer Pythonisk og unngår mutasjon helt.",
    testCases: [
      {
        beskrivelse: "fjern_inaktive({'a': True, 'b': False, 'c': True}) → {'a': True, 'c': True}",
        input: [{ a: true, b: false, c: true }],
        expected: { a: true, c: true },
      },
      {
        beskrivelse: "fjern_inaktive({'x': False}) → {}",
        input: [{ x: false }],
        expected: {},
      },
    ],
  },

  // ---------- 10: Integer division vs float ----------
  {
    id: "py-integer-division",
    tittel: "Beregn gjennomsnitt",
    sprak: "python",
    kategori: "off-by-one",
    vanskelighet: 1,
    expected:
      "snitt(tall) skal returnere det aritmetiske gjennomsnittet som float. snitt([1, 2]) → 1.5, snitt([10, 20, 30]) → 20.0.",
    funksjonsnavn: "snitt",
    kode: `def snitt(tall):
    return sum(tall) // len(tall)
`,
    fasit: `def snitt(tall):
    return sum(tall) / len(tall)
`,
    bugForklaring:
      "// er gulvdivisjon (integer division) — den runder NEDOVER til nærmeste heltall. snitt([1, 2]) blir 1, ikke 1.5. For ekte divisjon: bruk / (alltid float i Python 3). Klassisk bug for utviklere som kommer fra C/Java der / på int også er gulvdivisjon. I Python 3 er / alltid 'true division'; bruk // bare når du EKSPLISITT vil ha integer.",
    testCases: [
      { beskrivelse: "snitt([1, 2]) → 1.5", input: [[1, 2]], expected: 1.5 },
      { beskrivelse: "snitt([10, 20, 30]) → 20.0", input: [[10, 20, 30]], expected: 20.0 },
      { beskrivelse: "snitt([5, 5, 5, 5]) → 5.0", input: [[5, 5, 5, 5]], expected: 5.0 },
    ],
  },

  // ---------- 11: String concat in loop / shadowing ----------
  {
    id: "py-shadow-builtin",
    tittel: "Tell positive tall",
    sprak: "python",
    kategori: "scoping",
    vanskelighet: 2,
    expected:
      "tell_positive(tall) skal returnere antall positive tall (> 0). Bug-en her er at vi prøver å bruke sum() etterpå — men funksjonen overskriver den innebygde sum.",
    funksjonsnavn: "tell_positive",
    kode: `def tell_positive(tall):
    sum = 0
    for x in tall:
        if x > 0:
            sum += 1
    # Nå skal vi også returnere summen av ALLE tall som debug-info
    totalsum = sum(tall)
    return (sum, totalsum)
`,
    fasit: `def tell_positive(tall):
    antall = 0
    for x in tall:
        if x > 0:
            antall += 1
    totalsum = sum(tall)
    return (antall, totalsum)
`,
    bugForklaring:
      "Ved å bruke navnet 'sum' som lokal variabel skygger du for den innebygde sum() — kallet sum(tall) på siste linje kaster TypeError: 'int' object is not callable. Unngå å bruke navn på innebygde funksjoner som variabler: list, dict, sum, max, min, type, id, input, len. Pylint og ruff varsler på dette (W0622). Bruk i stedet beskrivende navn som 'antall', 'total', 'count'.",
    testCases: [
      {
        beskrivelse: "tell_positive([1, -2, 3, -4]) → (2, -2)",
        input: [[1, -2, 3, -4]],
        expected: [2, -2],
      },
      {
        beskrivelse: "tell_positive([5, 5, 5]) → (3, 15)",
        input: [[5, 5, 5]],
        expected: [3, 15],
      },
    ],
  },

  // ---------- 12: List comprehension med betingelse på feil sted ----------
  {
    id: "py-comprehension-conditional",
    tittel: "Doble tall, men hopp over negative",
    sprak: "python",
    kategori: "off-by-one",
    vanskelighet: 2,
    expected:
      "transform(tall) skal returnere en ny liste der hver positive verdi er doblet, og negative verdier er FILTRERT BORT (ikke inkludert i resultatet). transform([1, -2, 3]) → [2, 6].",
    funksjonsnavn: "transform",
    kode: `def transform(tall):
    return [x * 2 if x > 0 else None for x in tall]
`,
    fasit: `def transform(tall):
    return [x * 2 for x in tall if x > 0]
`,
    bugForklaring:
      "Den buggy versjonen bruker en ternær uttrykk (x * 2 if x > 0 else None) — det BEHOLDER alle elementer og setter de negative til None, i stedet for å FILTRERE dem bort. Forskjellen: `[expr if cond else other for x in xs]` er map med betinget uttrykk (alltid like lang som input). `[expr for x in xs if cond]` er filter (potensielt kortere). Tommelfingerregel: hvis du vil filtrere → if til slutt. Hvis du vil transformere alle → if/else i uttrykket.",
    testCases: [
      { beskrivelse: "transform([1, -2, 3]) → [2, 6]", input: [[1, -2, 3]], expected: [2, 6] },
      { beskrivelse: "transform([-1, -2]) → []", input: [[-1, -2]], expected: [] },
      { beskrivelse: "transform([5]) → [10]", input: [[5]], expected: [10] },
    ],
  },

  // ============================================================================
  // SQL BUGS (8)
  // ============================================================================

  // ---------- 13: LEFT JOIN + WHERE on right table = INNER JOIN ----------
  {
    id: "sql-left-join-where",
    tittel: "Finn alle kunder, også de uten ordrer",
    sprak: "sql",
    kategori: "sql-join",
    vanskelighet: 3,
    expected:
      "Returner navn på ALLE kunder og total ordresum for hver. Kunder som ikke har lagt en ordre skal vises med 0 i total. Sortert på navn.",
    kode: `SELECT k.navn, COALESCE(SUM(o.pris), 0) AS total
FROM kunder k
LEFT JOIN ordrer o ON o.kunde_id = k.id
WHERE o.pris > 0
GROUP BY k.id, k.navn
ORDER BY k.navn;
`,
    fasit: `SELECT k.navn, COALESCE(SUM(o.pris), 0) AS total
FROM kunder k
LEFT JOIN ordrer o ON o.kunde_id = k.id AND o.pris > 0
GROUP BY k.id, k.navn
ORDER BY k.navn;
`,
    bugForklaring:
      "WHERE o.pris > 0 evalueres ETTER joinen. For kunder uten ordrer fyller LEFT JOIN inn NULL i o.pris — og NULL > 0 er falsk, så raden faller bort. Resultat: LEFT JOIN oppfører seg som INNER JOIN. Løsning: flytt betingelsen på høyre tabell inn i ON-klausulen (LEFT JOIN ordrer o ON o.kunde_id = k.id AND o.pris > 0). Da bevares LEFT JOIN-semantikken. Alternativt: WHERE (o.pris > 0 OR o.id IS NULL).",
    sqlTest: {
      setup: `CREATE TABLE kunder (id INTEGER PRIMARY KEY, navn TEXT);
CREATE TABLE ordrer (id INTEGER PRIMARY KEY, kunde_id INTEGER, pris INTEGER);
INSERT INTO kunder VALUES (1, 'Alice'), (2, 'Bob'), (3, 'Cara');
INSERT INTO ordrer VALUES (1, 1, 100), (2, 1, 50), (3, 2, 200);`,
      expectedColumns: ["navn", "total"],
      expectedRows: [
        ["Alice", 150],
        ["Bob", 200],
        ["Cara", 0],
      ],
    },
    beslektetLitteratur: [
      { slug: "join-spørringer", tittel: "JOIN-spørringer" },
    ],
  },

  // ---------- 14: NULL arithmetic ----------
  {
    id: "sql-null-arithmetic",
    tittel: "Beregn netto-pris (pris - rabatt)",
    sprak: "sql",
    kategori: "sql-null",
    vanskelighet: 2,
    expected:
      "Returner navn og netto-pris (pris - rabatt) for hver vare. Hvis rabatt er NULL, skal netto være lik pris. Sortert på navn.",
    kode: `SELECT navn, pris - rabatt AS netto
FROM varer
ORDER BY navn;
`,
    fasit: `SELECT navn, pris - COALESCE(rabatt, 0) AS netto
FROM varer
ORDER BY navn;
`,
    bugForklaring:
      "I SQL er enhver aritmetikk med NULL = NULL: 100 - NULL = NULL, ikke 100. Det samme gjelder konkatenering, sammenligning, alt unntatt IS NULL / COALESCE / spesialfunksjoner. Hvis du forventer 'mangler verdi = 0', må du bruke COALESCE(kolonne, 0). Klassisk regnskaps-bug: rapporter viser plutselig NULL i totalfelt fordi én rad har manglende verdi i en delsum.",
    sqlTest: {
      setup: `CREATE TABLE varer (id INTEGER PRIMARY KEY, navn TEXT, pris INTEGER, rabatt INTEGER);
INSERT INTO varer VALUES
  (1, 'Bok', 100, 10),
  (2, 'Penn', 50, NULL),
  (3, 'Sax', 200, 25);`,
      expectedColumns: ["navn", "netto"],
      expectedRows: [
        ["Bok", 90],
        ["Penn", 50],
        ["Sax", 175],
      ],
    },
  },

  // ---------- 15: COUNT(*) vs COUNT(col) ----------
  {
    id: "sql-count-null",
    tittel: "Tell brukere med registrert e-post",
    sprak: "sql",
    kategori: "sql-null",
    vanskelighet: 2,
    expected:
      "Returner én rad med kolonnen antall_med_epost — antall rader i brukere der epost IKKE er NULL.",
    kode: `SELECT COUNT(*) AS antall_med_epost
FROM brukere;
`,
    fasit: `SELECT COUNT(epost) AS antall_med_epost
FROM brukere;
`,
    bugForklaring:
      "COUNT(*) teller ALLE rader, uansett NULL. COUNT(kolonne) teller bare rader der kolonnen IKKE er NULL. Klassisk feil: 'hvor mange brukere har e-post' — COUNT(*) gir totalt antall brukere, ikke antall med utfylt e-post. Alternativt: COUNT(*) FILTER (WHERE epost IS NOT NULL), eller SUM(CASE WHEN epost IS NOT NULL THEN 1 ELSE 0 END).",
    sqlTest: {
      setup: `CREATE TABLE brukere (id INTEGER PRIMARY KEY, navn TEXT, epost TEXT);
INSERT INTO brukere VALUES
  (1, 'Alice', 'a@x.no'),
  (2, 'Bob', NULL),
  (3, 'Cara', 'c@x.no'),
  (4, 'Dan', NULL);`,
      expectedColumns: ["antall_med_epost"],
      expectedRows: [[2]],
    },
  },

  // ---------- 16: GROUP BY missing column (works in MySQL, wrong result) ----------
  {
    id: "sql-group-by-missing",
    tittel: "Vis høyeste pris per kategori, og navn på den varen",
    sprak: "sql",
    kategori: "sql-group-by",
    vanskelighet: 4,
    expected:
      "Returner kategori, navn på den dyreste varen i kategorien, og prisen. Sortert på kategori. Det skal være én rad per kategori.",
    kode: `SELECT kategori, navn, MAX(pris) AS max_pris
FROM varer
GROUP BY kategori
ORDER BY kategori;
`,
    fasit: `SELECT v.kategori, v.navn, v.pris AS max_pris
FROM varer v
JOIN (
  SELECT kategori, MAX(pris) AS mp
  FROM varer
  GROUP BY kategori
) m ON m.kategori = v.kategori AND m.mp = v.pris
ORDER BY v.kategori;
`,
    bugForklaring:
      "navn er IKKE i GROUP BY og IKKE i en aggregat — MySQL (uten ONLY_FULL_GROUP_BY) tillater dette og returnerer en VILKÅRLIG navn-verdi fra gruppen, ikke nødvendigvis navnet til varen med max pris. PostgreSQL og standard-SQL nekter spørringen. For å faktisk få varen med høyest pris per kategori: bruk subquery + JOIN, eller window function (ROW_NUMBER() OVER (PARTITION BY kategori ORDER BY pris DESC)). Klassisk subtil bug fordi den 'ser ut til å fungere' — riktig svar ved en tilfeldighet med visse datasett.",
    sqlTest: {
      setup: `CREATE TABLE varer (id INTEGER PRIMARY KEY, kategori TEXT, navn TEXT, pris INTEGER);
INSERT INTO varer VALUES
  (1, 'Bok', 'Lærebok', 500),
  (2, 'Bok', 'Roman', 200),
  (3, 'Penn', 'Mont Blanc', 1500),
  (4, 'Penn', 'BIC', 20);`,
      expectedColumns: ["kategori", "navn", "max_pris"],
      expectedRows: [
        ["Bok", "Lærebok", 500],
        ["Penn", "Mont Blanc", 1500],
      ],
    },
  },

  // ---------- 17: JOIN on wrong field (cartesian-ish) ----------
  {
    id: "sql-join-wrong-field",
    tittel: "Koble ordre til ordrelinjer",
    sprak: "sql",
    kategori: "sql-join",
    vanskelighet: 3,
    expected:
      "Returner ordrenummer (ordre.id) og total antall enheter (sum av antall i ordrelinjer) per ordre. Sortert på ordre-id.",
    kode: `SELECT o.id AS ordre, SUM(l.antall) AS enheter
FROM ordrer o
JOIN ordrelinjer l ON l.id = o.id
GROUP BY o.id
ORDER BY o.id;
`,
    fasit: `SELECT o.id AS ordre, SUM(l.antall) AS enheter
FROM ordrer o
JOIN ordrelinjer l ON l.ordre_id = o.id
GROUP BY o.id
ORDER BY o.id;
`,
    bugForklaring:
      "JOIN-betingelsen er på l.id = o.id (linjens egen PK = ordrens PK), ikke på fremmednøkkelen l.ordre_id. Det matcher kun rader der linje-id tilfeldigvis er lik ordre-id — feilen ser uskyldig ut fordi den 'gir noen rader' og kompilerer fint. Klassisk skrivefeil i JOIN ON. Sjekk alltid at du joiner FK → PK. Verktøy: SHOW CREATE TABLE, ER-diagram, eller en linter som dbt kan fange dette.",
    sqlTest: {
      setup: `CREATE TABLE ordrer (id INTEGER PRIMARY KEY, kunde TEXT);
CREATE TABLE ordrelinjer (id INTEGER PRIMARY KEY, ordre_id INTEGER, antall INTEGER);
INSERT INTO ordrer VALUES (1, 'Alice'), (2, 'Bob');
INSERT INTO ordrelinjer VALUES
  (10, 1, 3),
  (11, 1, 2),
  (20, 2, 5);`,
      expectedColumns: ["ordre", "enheter"],
      expectedRows: [
        [1, 5],
        [2, 5],
      ],
    },
    beslektetLitteratur: [
      { slug: "join-spørringer", tittel: "JOIN-spørringer" },
    ],
  },

  // ---------- 18: HAVING vs WHERE ----------
  {
    id: "sql-having-vs-where",
    tittel: "Tell ordrer over 100 kr per kunde",
    sprak: "sql",
    kategori: "sql-edge-case",
    vanskelighet: 2,
    expected:
      "Returner kunde_id og antall ordrer med pris > 100 per kunde. Bare ta med kunder som har minst én slik ordre. Sortert på kunde_id.",
    kode: `SELECT kunde_id, COUNT(*) AS antall
FROM ordrer
GROUP BY kunde_id
HAVING pris > 100
ORDER BY kunde_id;
`,
    fasit: `SELECT kunde_id, COUNT(*) AS antall
FROM ordrer
WHERE pris > 100
GROUP BY kunde_id
ORDER BY kunde_id;
`,
    bugForklaring:
      "WHERE filtrerer rader FØR aggregering — det er der pris > 100 hører hjemme (pris er per-rad). HAVING filtrerer ETTER aggregering — bruk det på aggregater (HAVING COUNT(*) > 5). Den buggy versjonen bryter standard-SQL: pris er ikke i GROUP BY og ikke aggregert. SQLite tillater det (vilkårlig verdi velges), PostgreSQL nekter. Tommelfingerregel: WHERE for rad-betingelser, HAVING for aggregat-betingelser.",
    sqlTest: {
      setup: `CREATE TABLE ordrer (id INTEGER PRIMARY KEY, kunde_id INTEGER, pris INTEGER);
INSERT INTO ordrer VALUES
  (1, 1, 50),
  (2, 1, 150),
  (3, 1, 200),
  (4, 2, 300),
  (5, 3, 50);`,
      expectedColumns: ["kunde_id", "antall"],
      expectedRows: [
        [1, 2],
        [2, 1],
      ],
    },
  },

  // ---------- 19: DISTINCT in wrong place ----------
  {
    id: "sql-distinct-misuse",
    tittel: "Hvor mange unike kunder har lagt en ordre",
    sprak: "sql",
    kategori: "sql-edge-case",
    vanskelighet: 2,
    expected:
      "Returner antall UNIKE kunder (etter kunde_id) som har lagt minst én ordre. Én rad med kolonne unike_kunder.",
    kode: `SELECT COUNT(kunde_id) AS unike_kunder
FROM ordrer;
`,
    fasit: `SELECT COUNT(DISTINCT kunde_id) AS unike_kunder
FROM ordrer;
`,
    bugForklaring:
      "COUNT(kunde_id) teller hver rad der kunde_id ikke er NULL — én kunde med 3 ordrer telles 3 ganger. For å telle UNIKE verdier: COUNT(DISTINCT kunde_id). Klassisk feil i analyseskriving: 'hvor mange aktive brukere' (skal være distinct user_id), 'hvor mange forskjellige produkter solgt' (distinct product_id). Sjekk alltid: 'teller jeg rader, eller unike verdier?'",
    sqlTest: {
      setup: `CREATE TABLE ordrer (id INTEGER PRIMARY KEY, kunde_id INTEGER, pris INTEGER);
INSERT INTO ordrer VALUES
  (1, 1, 100),
  (2, 1, 200),
  (3, 1, 50),
  (4, 2, 300),
  (5, 3, 100);`,
      expectedColumns: ["unike_kunder"],
      expectedRows: [[3]],
    },
  },

  // ---------- 20: IN with subquery + NULL ----------
  {
    id: "sql-not-in-null",
    tittel: "Finn kunder som IKKE har noen ordre",
    sprak: "sql",
    kategori: "sql-null",
    vanskelighet: 4,
    expected:
      "Returner navnet på alle kunder som IKKE har en eneste rad i ordrer-tabellen. Sortert på navn.",
    kode: `SELECT navn
FROM kunder
WHERE id NOT IN (SELECT kunde_id FROM ordrer)
ORDER BY navn;
`,
    fasit: `SELECT navn
FROM kunder
WHERE id NOT IN (SELECT kunde_id FROM ordrer WHERE kunde_id IS NOT NULL)
ORDER BY navn;
`,
    bugForklaring:
      "Hvis subqueryen returnerer EN ENESTE NULL (f.eks. en ordre uten registrert kunde), blir NOT IN evaluert med 3-verdis logikk: x NOT IN (1, 2, NULL) blir x ≠ 1 AND x ≠ 2 AND x ≠ NULL. Det siste er ALDRI sant (NULL-sammenligning er UNKNOWN). Hele uttrykket blir UNKNOWN → raden ekskluderes. Resultat: tom liste. Beryktet bug, vanskelig å finne fordi spørringen ofte 'fungerer' inntil noen NULL sniker seg inn. Løs ved å filtrere ut NULL i subqueryen, eller bruk NOT EXISTS som ikke har dette problemet.",
    sqlTest: {
      setup: `CREATE TABLE kunder (id INTEGER PRIMARY KEY, navn TEXT);
CREATE TABLE ordrer (id INTEGER PRIMARY KEY, kunde_id INTEGER);
INSERT INTO kunder VALUES (1, 'Alice'), (2, 'Bob'), (3, 'Cara'), (4, 'Dan');
INSERT INTO ordrer VALUES (1, 1), (2, 2), (3, NULL);`,
      expectedColumns: ["navn"],
      expectedRows: [
        ["Cara"],
        ["Dan"],
      ],
    },
  },
];

export function findBug(id: string): DebugBug | undefined {
  return DEBUG_BUGS.find((b) => b.id === id);
}

export const KATEGORI_LABEL: Record<BugKategori, string> = {
  "off-by-one": "Off-by-one",
  scoping: "Scoping / lukninger",
  "mutable-default": "Mutable default-argument",
  "float-presisjon": "Flyttall-presisjon",
  concurrency: "Concurrency / async",
  performance: "Ytelse / algoritmisk",
  rekursjon: "Rekursjon",
  "case-sensitivitet": "Tekst-normalisering",
  "sql-join": "SQL — JOIN",
  "sql-null": "SQL — NULL",
  "sql-group-by": "SQL — GROUP BY",
  "sql-edge-case": "SQL — kant-tilfeller",
};
