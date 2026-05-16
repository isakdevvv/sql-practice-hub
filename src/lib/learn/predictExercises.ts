// Predict & Trace-oppgaver: studenten leser kode + (evt) datasett og MÅ skrive
// hva de tror output blir, før systemet faktisk kjører koden. Designet for
// Bloom-nivå "Analyze" / "Evaluate" — vi sikter mot tricky korner-cases der
// naiv intuisjon ofte feiler.
//
// Hver oppgave har en `expected`-streng som er forventet stdout/result.
// Sammenligning er ren strenge-likhet etter trim+normalisering av whitespace
// (se predict.tsx). For SQL bruker vi DATASET_LIST default dataset (ecommerce)
// med mindre dataset er spesifisert.

import type { DatasetId } from "../db/datasets";

export type PredictLanguage = "python" | "sql";

export interface PredictExercise {
  id: string;
  language: PredictLanguage;
  title: string;
  /** Markdown-aktig prompt vist over koden. */
  prompt: string;
  code: string;
  /** Forventet stdout/output. For Python: alt som ble printet (trimmet).
   *  For SQL: en tab-separert tabell med kolonner på første linje. */
  expected: string;
  /** Forklaring som vises ETTER at brukeren har levert. Skal peke på *hvorfor*
   *  output ble som det ble — særlig hvis det går mot intuisjon. */
  explanation: string;
  /** SQL-dataset hvis language="sql". Default "ecommerce". */
  dataset?: DatasetId;
  /** Vanskelighet 1-5. */
  difficulty: 1 | 2 | 3 | 4 | 5;
  /** Hva slags konsept dette tester — for fremtidig filtrering. */
  topics: string[];
}

export const PREDICT_EXERCISES: PredictExercise[] = [
  // ──────────────────────────────────────────────────────────────────────
  // PYTHON — list/dict/tuple korner-cases
  // ──────────────────────────────────────────────────────────────────────
  {
    id: "py-list-map-square",
    language: "python",
    title: "List comprehension med kvadrering",
    prompt: "Hva blir output?",
    code: `xs = [1, 2, 3]
ys = [x ** 2 for x in xs]
print(ys)`,
    expected: "[1, 4, 9]",
    explanation:
      "List comprehension lager en ny liste der hvert element kvadreres. xs endres ikke — ys er en helt ny liste [1, 4, 9].",
    difficulty: 1,
    topics: ["lister", "comprehension"],
  },
  {
    id: "py-dict-pop-missing",
    language: "python",
    title: "dict.pop() på key som ikke finnes",
    prompt:
      "Hva skjer hvis du kaller .pop(key, default) på en dict der key ikke finnes?",
    code: `d = {"a": 1, "b": 2}
v = d.pop("c", -1)
print(v)
print(d)`,
    expected: `-1
{'a': 1, 'b': 2}`,
    explanation:
      "Når .pop() får en default-verdi som andre argument, returneres default i stedet for å kaste KeyError. Dict-en endres ikke. Uten default ville koden krasjet med KeyError: 'c'.",
    difficulty: 2,
    topics: ["dict", "exceptions"],
  },
  {
    id: "py-mutable-default",
    language: "python",
    title: "Mutable default argument — den klassiske fellen",
    prompt:
      "Tenk nøye etter: hva printes? (Hint: dette er en av Pythons mest beryktede fallgruver.)",
    code: `def add_item(item, bag=[]):
    bag.append(item)
    return bag

a = add_item("eple")
b = add_item("pære")
print(a)
print(b)`,
    expected: `['eple', 'pære']
['eple', 'pære']`,
    explanation:
      "Default-argumentet [] evalueres ÉN gang, når funksjonen defineres — ikke ved hvert kall. Så a og b refererer til samme liste. Riktig mønster: bag=None og opprett ny liste inni hvis None.",
    difficulty: 4,
    topics: ["funksjoner", "mutability", "gotcha"],
  },
  {
    id: "py-late-binding-closure",
    language: "python",
    title: "Late binding i lambda-loop",
    prompt: "Lister med lambdas — hva blir output?",
    code: `fs = [lambda: i for i in range(3)]
print([f() for f in fs])`,
    expected: "[2, 2, 2]",
    explanation:
      "Lambdaene fanger variabelen i ved REFERANSE, ikke verdi. Når vi til slutt kaller dem er løkken ferdig og i == 2. Fiks: lambda i=i: i — slik 'fryses' verdien.",
    difficulty: 4,
    topics: ["closures", "lambda", "gotcha"],
  },
  {
    id: "py-int-string-add",
    language: "python",
    title: "Implicit type-mix",
    prompt: "Hva blir output (eller feiler det)?",
    code: `a = "3"
b = 4
print(a * b)`,
    expected: "3333",
    explanation:
      "I Python betyr str * int 'repeter strengen n ganger'. Resultatet er '3333', ikke 12. Hvis du i stedet skrev a + b ville du fått TypeError fordi + ikke konverterer mellom str og int.",
    difficulty: 2,
    topics: ["typer", "operatorer"],
  },
  {
    id: "py-is-vs-eq-int",
    language: "python",
    title: "is vs == for små heltall",
    prompt: "Hva blir output?",
    code: `a = 256
b = 256
c = 257
d = 257
print(a is b, c is d)`,
    expected: "True False",
    explanation:
      "CPython cacher små heltall (-5 til 256), så a og b peker på samme objekt. 257 ligger utenfor cache og lager nye objekter — derfor c is d == False. Regel: bruk == for verdi-likhet, is bare for None/True/False.",
    difficulty: 4,
    topics: ["identitet", "CPython", "gotcha"],
  },
  {
    id: "py-string-slice-step",
    language: "python",
    title: "String slicing med negativt step",
    prompt: "Hva returnerer dette?",
    code: `s = "Pythonista"
print(s[::-1])
print(s[1:7:2])`,
    expected: `atsinohtyP
yhn`,
    explanation:
      "[::-1] reverserer hele strengen. [1:7:2] starter på index 1 (y), går til (ikke inkl.) 7, og hopper 2 om gangen: y(1), h(3), n(5).",
    difficulty: 2,
    topics: ["strenger", "slicing"],
  },
  {
    id: "py-and-or-shortcircuit",
    language: "python",
    title: "and/or returnerer ikke alltid bool",
    prompt: "Hva printes?",
    code: `print(0 or "fallback")
print("" or [] or "siste")
print(5 and 10)`,
    expected: `fallback
siste
10`,
    explanation:
      "I Python returnerer or DEN FØRSTE truthy operanden (eller siste hvis alle er falsy). and returnerer den FØRSTE falsy operanden, eller siste hvis alle er truthy. 5 and 10 → siste truthy = 10. Dette er ikke bool!",
    difficulty: 3,
    topics: ["bool", "shortcircuit", "gotcha"],
  },
  {
    id: "py-list-copy-shallow",
    language: "python",
    title: "Shallow copy av nested liste",
    prompt: "Hva skjer med original-lista?",
    code: `a = [[1, 2], [3, 4]]
b = a.copy()
b[0].append(99)
b.append([5, 6])
print(a)
print(b)`,
    expected: `[[1, 2, 99], [3, 4]]
[[1, 2, 99], [3, 4], [5, 6]]`,
    explanation:
      ".copy() lager en grunn (shallow) kopi: ytre lista er ny, men de indre listene deles fortsatt. Append til b[0] muterer derfor også a[0]. Append til b selv påvirker ikke a. Bruk copy.deepcopy for ekte uavhengighet.",
    difficulty: 4,
    topics: ["lister", "copy", "gotcha"],
  },
  {
    id: "py-floor-div-negative",
    language: "python",
    title: "Heltallsdivisjon på negative tall",
    prompt: "Mange språk runder mot null. Hva gjør Python?",
    code: `print(7 // 2)
print(-7 // 2)
print(-7 % 2)`,
    expected: `3
-4
1`,
    explanation:
      "Python runder // NED mot minus uendelig, ikke mot null. -7/2 = -3.5 → -4 (ikke -3). Modulo følger samme regel slik at (a // b) * b + (a % b) == a alltid holder. Mange C-baserte språk bryter dette på negative tall.",
    difficulty: 3,
    topics: ["aritmetikk", "gotcha"],
  },
  {
    id: "py-set-from-string",
    language: "python",
    title: "set() på en streng",
    prompt: "Hva blir resultatet?",
    code: `s = set("banana")
print(sorted(s))
print(len(s))`,
    expected: `['a', 'b', 'n']
3`,
    explanation:
      "set('banana') itererer over strengen tegn-for-tegn og putter unike tegn i settet. 'banana' har bare 3 unike bokstaver: a, b, n. sorted() returnerer en liste i alfabetisk rekkefølge.",
    difficulty: 2,
    topics: ["sets", "strenger"],
  },
  {
    id: "py-tuple-single",
    language: "python",
    title: "Tuple med ett element",
    prompt: "Hva er typen og lengden?",
    code: `a = (5)
b = (5,)
print(type(a).__name__, type(b).__name__)
print(len(b))`,
    expected: `int tuple
1`,
    explanation:
      "(5) er bare et heltall i parentes — ikke en tuple! For en 1-element tuple MÅ du ha komma: (5,). Dette er en klassisk feil når man bygger små tupler.",
    difficulty: 3,
    topics: ["tuple", "syntax", "gotcha"],
  },
  {
    id: "py-print-end-sep",
    language: "python",
    title: "print med sep og end",
    prompt: "Hva blir nøyaktig output (legg merke til mellomrom og linjeskift)?",
    code: `print("a", "b", "c", sep="-", end="!")
print("d")`,
    expected: "a-b-c!d",
    explanation:
      "sep='-' skiller argumentene med bindestrek istedenfor mellomrom. end='!' erstatter standard linjeskift med ! — derfor lander 'd' på samme linje. Output: 'a-b-c!d' fulgt av et linjeskift fra andre print.",
    difficulty: 2,
    topics: ["print", "io"],
  },
  {
    id: "py-dict-key-order",
    language: "python",
    title: "Dict-iterasjonsrekkefølge (Python 3.7+)",
    prompt: "Hva blir output?",
    code: `d = {}
d["c"] = 1
d["a"] = 2
d["b"] = 3
del d["a"]
d["a"] = 4
print(list(d.keys()))`,
    expected: "['c', 'b', 'a']",
    explanation:
      "Siden Python 3.7 garanterer dict at iterasjon følger INNSETTINGS-rekkefølge. Vi satte c, a, b, slettet a, satte a igjen. Etter slett er rekkefølgen [c, b], så blir a lagt til på slutten → [c, b, a].",
    difficulty: 3,
    topics: ["dict", "ordering"],
  },
  {
    id: "py-string-immutable",
    language: "python",
    title: "Stringkonkatenering i loop",
    prompt: "Hva blir output, og hvorfor er denne stilen problematisk for store n?",
    code: `s = ""
for ch in "Python":
    s = s + ch + "."
print(s)`,
    expected: "P.y.t.h.o.n.",
    explanation:
      "Output er rett, men strings er IMMUTABLE i Python — hver += lager en helt ny streng og kopierer alt over. For store n blir dette O(n²). Bedre: ''.join(parts) eller en liste + ''.join til slutt.",
    difficulty: 2,
    topics: ["strenger", "performance"],
  },

  // ──────────────────────────────────────────────────────────────────────
  // SQL — ecommerce/scott dataset
  // ──────────────────────────────────────────────────────────────────────
  {
    id: "sql-count-null",
    language: "sql",
    title: "COUNT(*) vs COUNT(kolonne)",
    prompt:
      "Tabellen `emp` har 14 rader. 4 av dem har en `comm` (kommisjon); resten har NULL. Hva returnerer disse to spørringene?",
    code: `SELECT COUNT(*) AS antall_rader, COUNT(comm) AS antall_med_comm
FROM emp;`,
    expected: `antall_rader\tantall_med_comm
14\t4`,
    dataset: "scott",
    explanation:
      "COUNT(*) teller ALLE rader uansett. COUNT(kolonne) ignorerer NULL — derfor får vi 4 (kun selgerne har provisjon). Vanlig feil: anta at COUNT(comm) gir 14.",
    difficulty: 3,
    topics: ["aggregering", "null", "gotcha"],
  },
  {
    id: "sql-left-join-where",
    language: "sql",
    title: "LEFT JOIN + WHERE = INNER JOIN-felle",
    prompt:
      "Vi vil ha ALLE brukere og evt. antall completed-ordrer. Hva returnerer denne spørringen — og hvorfor er det sannsynligvis ikke det du vil?",
    code: `SELECT u.name, COUNT(o.id) AS antall
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE o.status = 'completed'
GROUP BY u.name
ORDER BY u.name;`,
    expected: `name\tantall
Alice\t4
Bob\t2
Charlie\t1
Eve\t1
Frank\t1
Grace\t1`,
    explanation:
      "WHERE filtrerer ETTER joinen. Når en bruker ikke har noen ordre, blir o.status = NULL, og NULL = 'completed' er FALSE → raden droppes. Slik forsvinner alle brukere uten ordre (Iris, Kara, Leo …) — selv om vi brukte LEFT JOIN. Fiks: flytt o.status='completed' inn i ON-klausulen.",
    difficulty: 4,
    topics: ["join", "null", "gotcha"],
  },
  {
    id: "sql-group-by-having",
    language: "sql",
    title: "HAVING vs WHERE",
    prompt:
      "Hvilke avdelinger (deptno = avdelingsnummer) har gjennomsnittslønn over 2000?",
    code: `SELECT deptno, AVG(sal) AS snittlonn
FROM emp
GROUP BY deptno
HAVING AVG(sal) > 2000
ORDER BY deptno;`,
    expected: `deptno\tsnittlonn
1\t2916.6666666666665
2\t2175`,
    dataset: "scott",
    explanation:
      "HAVING filtrerer AGGREGERTE resultater (etter GROUP BY). WHERE ville ikke fungert her — du kan ikke skrive WHERE AVG(sal) > 2000. Avdeling 3 (Sales) faller ut fordi snittet der er ~1566.",
    difficulty: 3,
    topics: ["aggregering", "having"],
  },
  {
    id: "sql-null-arithmetic",
    language: "sql",
    title: "NULL i aritmetikk",
    prompt:
      "Hva returnerer denne spørringen? Husk at `comm` (kommisjon) er NULL for de fleste ansatte.",
    code: `SELECT ename, sal, comm, sal + comm AS totalt
FROM emp
WHERE deptno = 3
ORDER BY ename;`,
    expected: `ename\tsal\tcomm\ttotalt
Allen\t1600\t300\t1900
Blake\t2850\t\t
James\t950\t\t
Martin\t1250\t1400\t2650
Turner\t1500\t0\t1500
Ward\t1250\t500\t1750`,
    dataset: "scott",
    explanation:
      "I aritmetikk gir ALLTID NULL + tall = NULL. Blake og James har comm = NULL → totalt blir NULL (vises som tom celle). For Turner er comm = 0, så totalt = 1500 (ikke NULL). Bruk COALESCE(comm, 0) hvis du vil at NULL skal telle som 0.",
    difficulty: 3,
    topics: ["null", "aritmetikk"],
  },
  {
    id: "sql-distinct-count",
    language: "sql",
    title: "COUNT(DISTINCT) vs COUNT()",
    prompt: "Hvor mange UNIKE produkter er bestilt på tvers av alle ordrelinjer?",
    code: `SELECT
  COUNT(*) AS antall_rader,
  COUNT(product_id) AS antall_product_id,
  COUNT(DISTINCT product_id) AS unike_produkter
FROM order_items;`,
    expected: `antall_rader\tantall_product_id\tunike_produkter
20\t20\t10`,
    explanation:
      "COUNT(*) og COUNT(product_id) er like her fordi product_id aldri er NULL. DISTINCT fjerner duplikater før telling — 20 ordrelinjer dekker bare 10 unike produkter (samme produkt bestilt i flere ordrer).",
    difficulty: 2,
    topics: ["distinct", "aggregering"],
  },
];

// Mappe topics til en kort filter-liste for UI.
export const PREDICT_TOPICS = Array.from(
  new Set(PREDICT_EXERCISES.flatMap((e) => e.topics)),
).sort();
