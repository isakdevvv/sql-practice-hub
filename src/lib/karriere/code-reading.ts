/**
 * Kode-lesnings-snippeter — kuraterte for "PythonGymnastics"-stil trening.
 *
 * Filosofi: hver snippet er ekte-aktig kode du møter i jobb. Funksjons-navn
 * er bevisst FJERNET (heter alltid `f`, `g`, `do_thing`, `handler`, osv.),
 * kommentarer er FJERNET, slik at brukeren må lese koden uten ledetråder.
 *
 * Etter at brukeren har svart på spørsmålene får de se fasit:
 * - Hva koden faktisk gjør
 * - Anbefalt navn
 * - Bugs og forbedringer
 */

export type SnippetLanguage =
  | "python"
  | "sql"
  | "typescript"
  | "javascript"
  | "c"
  | "shell";

export type SnippetCategory =
  | "python"
  | "sql"
  | "web"
  | "lavnivå"
  | "ml";

export interface MultipleChoiceQuestion {
  kind: "mc";
  prompt: string;
  options: string[];
  /** Indeks i `options` — riktig svar. */
  correctIndex: number;
  rationale: string;
}

export interface TextQuestion {
  kind: "text";
  prompt: string;
  /** Forfatterens forventede stikkord/svar. Vises som "modell-svar". */
  modelAnswer: string;
  /** Akseptabel kortform (lowercase, brukes til myk pattern-match). Valgfritt. */
  acceptableKeywords?: string[];
}

export type Question = MultipleChoiceQuestion | TextQuestion;

export interface ExpertReview {
  /** Forfatterens forklaring av hva koden gjør, i ren norsk prosa. */
  whatItDoes: string;
  /** Anbefalt funksjons-navn. */
  suggestedName: string;
  /** Liste over bugs, edge cases, og forbedringer. */
  problems: string[];
  /** Lærings-poeng — én ting du skal ta med deg videre. */
  takeaway: string;
}

export interface CodeSnippet {
  id: string;
  /** Vist tittel — vag, beskrivelse av domene, ikke fasit. */
  title: string;
  category: SnippetCategory;
  language: SnippetLanguage;
  /** Brukes for syntax highlighting (Monaco filsti). */
  fileName: string;
  /** 1 = lett, 5 = vanskelig. */
  difficulty: 1 | 2 | 3 | 4 | 5;
  /** Anbefalt rekkefølge — laveste først. */
  order: number;
  /** Kort intro (én linje) — kontekst, ikke fasit. */
  intro: string;
  code: string;
  questions: Question[];
  expert: ExpertReview;
}

export const CODE_SNIPPETS: CodeSnippet[] = [
  // ─────────────────── PYTHON ───────────────────
  {
    id: "py-listcomp-flatten",
    title: "Python — list comprehension",
    category: "python",
    language: "python",
    fileName: "snippet.py",
    difficulty: 1,
    order: 1,
    intro: "En enkel transformasjon av en liste av lister.",
    code: `def f(rows):
    return [
        x.strip().lower()
        for row in rows
        for x in row
        if x and x.strip()
    ]`,
    questions: [
      {
        kind: "text",
        prompt: "Hva returnerer denne funksjonen?",
        modelAnswer:
          "En flat liste av alle ikke-tomme strenger fra alle rader, trimmet og lowercased.",
        acceptableKeywords: ["flat", "liste", "lowercase", "trim"],
      },
      {
        kind: "mc",
        prompt: "Hva skjer hvis `rows = [['Hei', ''], [None, '  Du  ']]`?",
        options: [
          "Kaster TypeError fordi None ikke har .strip()",
          "Returnerer ['hei', 'du']",
          "Returnerer ['Hei', 'Du']",
          "Returnerer [['hei'], ['du']]",
        ],
        correctIndex: 1,
        rationale:
          "`if x` filtrerer ut None og '' før .strip() kalles, så None hopper rett over.",
      },
      {
        kind: "text",
        prompt: "Foreslå et bedre navn på funksjonen.",
        modelAnswer: "flatten_and_normalize_strings() eller clean_string_grid()",
      },
      {
        kind: "text",
        prompt: "Hva er det største problemet med denne koden?",
        modelAnswer:
          "Den krasjer hvis x ikke er en streng (eks. tall) — `if x` er sann for 42, og 42.strip() finnes ikke. Burde sjekke isinstance(x, str).",
      },
    ],
    expert: {
      whatItDoes:
        "Tar en liste av rader (hver rad er en liste av strenger), filtrerer bort tomme/None-verdier, trimmer whitespace, lowercaser, og returnerer en flat liste.",
      suggestedName: "flatten_and_normalize_strings",
      problems: [
        "Krasjer på ikke-streng-input (tall, dicts) — `if x` er sann for 42.",
        "Dobbel `.strip()`-kall: én i filteret, én i resultatet. Unødvendig.",
        "Ingen type hints — vanskeligere å bruke i en større kodebase.",
      ],
      takeaway:
        "Truthy-sjekken `if x` filtrerer både None og '' i én operasjon, men ikke andre falske ikke-strenger på en trygg måte.",
    },
  },
  {
    id: "py-flask-route",
    title: "Python — webroute med database",
    category: "python",
    language: "python",
    fileName: "snippet.py",
    difficulty: 2,
    order: 4,
    intro: "En route i en Flask-app som henter brukere.",
    code: `@app.route("/api/users/<int:uid>")
def h(uid):
    conn = sqlite3.connect("app.db")
    cur = conn.cursor()
    cur.execute(f"SELECT id, name, email FROM users WHERE id = {uid}")
    row = cur.fetchone()
    if row is None:
        return jsonify({"error": "not found"}), 404
    return jsonify({
        "id": row[0],
        "name": row[1],
        "email": row[2],
    })`,
    questions: [
      {
        kind: "text",
        prompt: "Hva returnerer funksjonen ved suksess og ved feil?",
        modelAnswer:
          "Suksess: JSON med {id, name, email}. Feil: {error: 'not found'} med status 404.",
      },
      {
        kind: "mc",
        prompt:
          "Selv om `<int:uid>` validerer at uid er et tall — hva er sikkerhets-problemet?",
        options: [
          "Det er ingen — int-converteren beskytter mot SQL-injection.",
          "f-string i SQL er fortsatt en dårlig vane og vil bite deg når du bytter til string-param.",
          "SQLite støtter ikke prepared statements i det hele tatt.",
          "Connection lekker minne.",
        ],
        correctIndex: 1,
        rationale:
          "Selv om int-converteren akkurat her stopper injection, lærer du en vane som er livsfarlig på første string-felt. Bruk alltid parametriserte queries.",
      },
      {
        kind: "text",
        prompt: "Foreslå et bedre navn.",
        modelAnswer: "get_user_by_id()",
      },
      {
        kind: "text",
        prompt: "Hva er de største problemene utover SQL-vanen?",
        modelAnswer:
          "Connection lukkes aldri (ressurs-lekkasje). Ny tilkobling per request er tregt. Ingen logging. Burde brukt en pool/dependency og parametrisert query.",
      },
    ],
    expert: {
      whatItDoes:
        "GET-endepunkt som returnerer én bruker som JSON, eller 404 hvis ID ikke finnes.",
      suggestedName: "get_user_by_id",
      problems: [
        "f-string i SQL — selv om int-converter stopper injection her, er dette en vane som dreper deg.",
        "Connection lukkes aldri. Skulle brukt `with sqlite3.connect(...)` eller en connection pool.",
        "Ny tilkobling per request — tregt. I produksjon: bruk Flask-SQLAlchemy eller g.db-pattern.",
        "Returnerer rå tuple-indekser (row[0], row[1]) — bør bruke sqlite3.Row eller dict_factory for å unngå at endring i SELECT bryter alt.",
      ],
      takeaway:
        "Selv 'trygge' SQL-strenger blir farlige når koden videreutvikles. Parametrisering er ikke en sikkerhets-feature — det er en arkitektur-norm.",
    },
  },
  {
    id: "py-decorator-retry",
    title: "Python — decorator",
    category: "python",
    language: "python",
    fileName: "snippet.py",
    difficulty: 3,
    order: 8,
    intro: "En generell decorator.",
    code: `def d(n=3, delay=1):
    def outer(fn):
        def inner(*args, **kwargs):
            for i in range(n):
                try:
                    return fn(*args, **kwargs)
                except Exception as e:
                    last = e
                    time.sleep(delay)
            raise last
        return inner
    return outer

@d(n=5, delay=0.5)
def fetch(url):
    return requests.get(url).json()`,
    questions: [
      {
        kind: "text",
        prompt: "Hva gjør denne decoratoren?",
        modelAnswer:
          "Retry-decorator: prøver funksjonen n ganger med delay mellom, kaster siste exception hvis alle feiler.",
      },
      {
        kind: "mc",
        prompt: "Hva skjer hvis n=0?",
        options: [
          "Kjører funksjonen én gang.",
          "Kaster TypeError direkte.",
          "UnboundLocalError fordi `last` aldri ble satt.",
          "Loopen kjører i evighet.",
        ],
        correctIndex: 2,
        rationale:
          "`for i in range(0)` kjører null ganger, `last` blir aldri tildelt, og `raise last` ramler i UnboundLocalError.",
      },
      {
        kind: "text",
        prompt: "Foreslå et bedre navn.",
        modelAnswer: "retry() eller retry_on_exception()",
      },
      {
        kind: "text",
        prompt: "Hva er de største problemene?",
        modelAnswer:
          "Fanger ALLE exceptions (selv KeyboardInterrupt). Ingen exponential backoff. Mangler functools.wraps så __name__ og docstring forsvinner. Bug ved n=0. Skulle latt brukeren angi hvilke exceptions som triggrer retry.",
      },
    ],
    expert: {
      whatItDoes:
        "Decorator-fabrikk som wrapper en funksjon i en retry-loop med fast delay.",
      suggestedName: "retry",
      problems: [
        "`except Exception` er for bredt — fanger KeyboardInterrupt-derivater? Nei, men fanger ALT annet. Burde ta en `exceptions=(...,)`-param.",
        "Ingen `functools.wraps(fn)` — fetch.__name__ blir 'inner', ikke 'fetch'.",
        "n=0 → UnboundLocalError. Edge-case ikke håndtert.",
        "Konstant delay — exponential backoff er standarden i dag.",
        "Ingen jitter — alle klienter retryer samtidig og lager 'thundering herd'.",
      ],
      takeaway:
        "Generelle decoratorer må alltid bruke `functools.wraps`. Retry-policy må være eksplisitt om hva som retryes.",
    },
  },
  {
    id: "py-generator-window",
    title: "Python — generator",
    category: "python",
    language: "python",
    fileName: "snippet.py",
    difficulty: 3,
    order: 10,
    intro: "En generator som tar et iterable.",
    code: `def g(seq, k):
    it = iter(seq)
    win = []
    for _ in range(k):
        win.append(next(it))
    yield tuple(win)
    for x in it:
        win.pop(0)
        win.append(x)
        yield tuple(win)`,
    questions: [
      {
        kind: "text",
        prompt: "Hva yielder denne generatoren?",
        modelAnswer:
          "Glidende vindu av størrelse k over sekvensen — hver yield er en tuple av k påfølgende elementer.",
      },
      {
        kind: "mc",
        prompt: "Hva skjer hvis seq har færre enn k elementer?",
        options: [
          "Yielder en kortere tuple.",
          "Yielder ingenting.",
          "Kaster StopIteration ut av next() — uncaught og rotete.",
          "Henger i evig løkke.",
        ],
        correctIndex: 2,
        rationale:
          "next(it) i en for-loop fanges automatisk, men her er den eksplisitt — StopIteration bobler opp som RuntimeError (PEP 479) eller propagerer ukontrollert.",
      },
      {
        kind: "text",
        prompt: "Foreslå et bedre navn.",
        modelAnswer: "sliding_window(seq, k)",
      },
      {
        kind: "text",
        prompt: "Hva er hovedproblemet?",
        modelAnswer:
          "`win.pop(0)` er O(k) — bør bruke collections.deque med maxlen=k. Krasj ved kort sekvens. Mangler validering av k > 0.",
      },
    ],
    expert: {
      whatItDoes:
        "Glidende vindu (sliding window) av størrelse k over en iterable, som tuple-er.",
      suggestedName: "sliding_window",
      problems: [
        "`list.pop(0)` er O(k) — bruk `collections.deque(maxlen=k)` for O(1).",
        "Ingen håndtering av k <= 0 eller k > len(seq).",
        "PEP 479: StopIteration som lekker fra generator blir RuntimeError i Python 3.7+.",
        "Mer idiomatisk: `itertools.islice` + deque.",
      ],
      takeaway:
        "Når du popper fra start av en liste, stopp opp. Det er nesten alltid en deque-jobb.",
    },
  },
  {
    id: "py-async-gather",
    title: "Python — async-funksjon",
    category: "python",
    language: "python",
    fileName: "snippet.py",
    difficulty: 3,
    order: 11,
    intro: "Asynkron funksjon med httpx.",
    code: `async def h(urls):
    results = []
    async with httpx.AsyncClient() as client:
        for url in urls:
            r = await client.get(url)
            results.append(r.json())
    return results`,
    questions: [
      {
        kind: "text",
        prompt: "Hva gjør denne funksjonen?",
        modelAnswer:
          "Henter en liste URLer og returnerer JSON-svarene — men sekvensielt, ikke parallelt.",
      },
      {
        kind: "mc",
        prompt: "Hva er den største ytelsesfellen?",
        options: [
          "httpx er treg.",
          "`for url in urls: await client.get(url)` venter på hver request før neste — ingen parallellitet.",
          "AsyncClient burde vært delt mellom kall.",
          "r.json() er blokkerende.",
        ],
        correctIndex: 1,
        rationale:
          "Hele poenget med async er parallellitet. Her er det ikke raskere enn synchronous requests — kun mer kompleks.",
      },
      {
        kind: "text",
        prompt: "Foreslå et bedre navn.",
        modelAnswer: "fetch_all_json() — og refaktorer til asyncio.gather().",
      },
      {
        kind: "text",
        prompt: "Hvordan ville du fikset ytelsen?",
        modelAnswer:
          "Bruk `asyncio.gather(*[client.get(u) for u in urls])` så requestene kjører parallelt. Vurder også semaphore for å begrense concurrency.",
      },
    ],
    expert: {
      whatItDoes:
        "Henter JSON fra en liste URLer — men sekvensielt. async/await uten parallellisme.",
      suggestedName: "fetch_all_json_sequentially (eller fiks: fetch_all_json)",
      problems: [
        "Sekvensielt — eneste fordelen mot synchronous er at event-loopen ikke blokkeres.",
        "Ingen feil-håndtering: én feilende URL kaster hele batchen.",
        "Ingen retry, timeout, eller rate-limiting.",
        "Vurder asyncio.gather + return_exceptions=True.",
      ],
      takeaway:
        "`async def` gir deg ikke parallellitet automatisk — du må spawn flere coroutines og awaite dem sammen.",
    },
  },
  {
    id: "py-dataclass-protocol",
    title: "Python — dataclass + protocol",
    category: "python",
    language: "python",
    fileName: "snippet.py",
    difficulty: 4,
    order: 13,
    intro: "En struktur med typing.Protocol.",
    code: `from dataclasses import dataclass
from typing import Protocol

class P(Protocol):
    def total(self) -> float: ...

@dataclass
class L:
    items: list
    discount: float = 0.0

    def total(self) -> float:
        s = sum(i.price * i.qty for i in self.items)
        return s * (1 - self.discount)

def f(orders: list[P]) -> float:
    return sum(o.total() for o in orders)`,
    questions: [
      {
        kind: "text",
        prompt: "Hva er rollen til P, L og f her?",
        modelAnswer:
          "P er et strukturelt interface (alt med .total() -> float). L implementerer det implisitt. f summerer total() over en liste P-er.",
      },
      {
        kind: "mc",
        prompt: "Må L eksplisitt nedarve fra P for å være kompatibel?",
        options: [
          "Ja, ellers er det TypeError.",
          "Nei — Protocol er strukturelt typet (duck typing med typer).",
          "Ja, men kun ved runtime hvis @runtime_checkable.",
          "Nei, men mypy vil klage.",
        ],
        correctIndex: 1,
        rationale:
          "Protocol bruker structural subtyping — L har en .total() -> float, derfor *er* L en P uten å si det.",
      },
      {
        kind: "text",
        prompt: "Foreslå bedre navn.",
        modelAnswer:
          "P → Totalable eller HasTotal. L → LineItemBundle eller Order. f → grand_total.",
      },
      {
        kind: "text",
        prompt: "Hva er det største problemet?",
        modelAnswer:
          "items: list er utypet — burde være list[LineItem]. Floating-point for penger er en klassisk feil — bruk Decimal. Discount kan være > 1 eller < 0 uten validering.",
      },
    ],
    expert: {
      whatItDoes:
        "Definerer et structural typing-interface P (alt med .total()), en konkret L (ordre med rabatt), og en aggregator f som summerer.",
      suggestedName: "P=Totalable, L=Order, f=grand_total",
      problems: [
        "Penger som float — bruk decimal.Decimal. Klassisk industri-feil.",
        "items: list er utypet generic — `list[LineItem]` ville fanget feil tidlig.",
        "Discount valideres ikke (kan være 1.5 → negativ total).",
        "Protocol bør være @runtime_checkable hvis du noen gang vil isinstance-sjekke.",
      ],
      takeaway:
        "Protocols gir deg structural typing uten arv. Men typer alene erstatter ikke validering — Decimal og constrained types finnes.",
    },
  },

  // ─────────────────── SQL ───────────────────
  {
    id: "sql-window-rank",
    title: "SQL — window function",
    category: "sql",
    language: "sql",
    fileName: "snippet.sql",
    difficulty: 2,
    order: 3,
    intro: "En SELECT med en window function.",
    code: `SELECT
  customer_id,
  order_id,
  order_date,
  total,
  ROW_NUMBER() OVER (
    PARTITION BY customer_id
    ORDER BY order_date DESC
  ) AS rn
FROM orders
WHERE rn = 1;`,
    questions: [
      {
        kind: "text",
        prompt: "Hva er intensjonen med denne queryen?",
        modelAnswer:
          "Hente siste ordre per kunde. Men WHERE rn = 1 i samme nivå som ROW_NUMBER er en bug.",
      },
      {
        kind: "mc",
        prompt: "Hvorfor feiler denne queryen?",
        options: [
          "ROW_NUMBER krever en GROUP BY.",
          "WHERE evalueres FØR window functions — `rn` finnes ikke når WHERE kjører.",
          "Mangler en tabell-alias.",
          "Det går fint — det er valid SQL.",
        ],
        correctIndex: 1,
        rationale:
          "SQL evaluerings-rekkefølge: FROM → WHERE → SELECT (window funcs) → ORDER BY. WHERE kan ikke se aliaser fra SELECT.",
      },
      {
        kind: "text",
        prompt: "Hvordan fikse det?",
        modelAnswer:
          "Wrap i en CTE eller subquery og filtrer i ytre nivå: WITH x AS (SELECT ..., ROW_NUMBER() ... AS rn FROM orders) SELECT * FROM x WHERE rn = 1.",
      },
      {
        kind: "text",
        prompt: "Foreslå et tittel-navn på denne queryen.",
        modelAnswer:
          "latest_order_per_customer eller most_recent_orders",
      },
    ],
    expert: {
      whatItDoes:
        "Forsøker å hente seneste ordre per kunde — men kompilerer ikke, fordi WHERE refererer til en window-funksjons-alias som ikke eksisterer ennå.",
      suggestedName: "latest_order_per_customer (etter fiks)",
      problems: [
        "WHERE evalueres før SELECT — kan ikke referere `rn`.",
        "Må flyttes inn i en CTE eller subquery. Alternativt brukes QUALIFY (i Snowflake/BigQuery).",
        "Ties på order_date er ikke deterministisk håndtert. Vurder ORDER BY order_date DESC, order_id DESC for stabilitet.",
      ],
      takeaway:
        "SQL har en logisk evaluerings-rekkefølge: FROM → WHERE → GROUP → SELECT → ORDER. Window functions hører til SELECT-fasen.",
    },
  },
  {
    id: "sql-recursive-cte",
    title: "SQL — rekursiv CTE",
    category: "sql",
    language: "sql",
    fileName: "snippet.sql",
    difficulty: 5,
    order: 18,
    intro: "En rekursiv WITH-clause.",
    code: `WITH RECURSIVE t AS (
  SELECT id, manager_id, name, 1 AS depth
  FROM employees
  WHERE manager_id IS NULL
  UNION ALL
  SELECT e.id, e.manager_id, e.name, t.depth + 1
  FROM employees e
  JOIN t ON e.manager_id = t.id
)
SELECT id, name, depth FROM t ORDER BY depth, name;`,
    questions: [
      {
        kind: "text",
        prompt: "Hva returnerer denne queryen?",
        modelAnswer:
          "Hele organisasjons-hierarkiet — hver ansatt med sitt nivå (rot = 1), sortert etter dybde og navn.",
      },
      {
        kind: "mc",
        prompt: "Hva skjer hvis en ansatt har seg selv som manager_id (sirkulær referanse)?",
        options: [
          "PostgreSQL detekterer sykler automatisk.",
          "Queryen kjører i evighet eller til server kjører tom for minne.",
          "Den hopper over noden.",
          "Den kaster en constraint error.",
        ],
        correctIndex: 1,
        rationale:
          "Standard rekursiv CTE har ingen sykel-deteksjon. Du må eksplisitt spore besøkte IDer eller bruke CYCLE-clause (SQL:99, ikke alltid støttet).",
      },
      {
        kind: "text",
        prompt: "Foreslå en tittel.",
        modelAnswer: "employee_hierarchy_with_depth",
      },
      {
        kind: "text",
        prompt: "Hva er det største problemet?",
        modelAnswer:
          "Ingen sykel-deteksjon. Ingen maks-dybde-grense. Hvis manager_id peker tilbake oppover blir det infinite loop. Burde brukt CYCLE-clause eller en array av besøkte ID-er.",
      },
    ],
    expert: {
      whatItDoes:
        "Bygger organisasjons-tre fra `employees`-tabellen: starter med rot-noder (manager_id IS NULL), så rekursivt JOINer mot barn.",
      suggestedName: "employee_hierarchy_with_depth",
      problems: [
        "Ingen sykel-deteksjon — sirkulære referanser dreper queryen.",
        "Ingen maks-dybde — defensiv kode bør sette `WHERE t.depth < 100` i den rekursive delen.",
        "Skalering: hver iterasjon JOINer mot hele employees. På store tabeller blir det dyrt.",
        "I PostgreSQL kan man bruke `CYCLE id SET is_cycle USING path` (SQL:99).",
      ],
      takeaway:
        "Rekursive CTEer er kraftige men farlige. Bygg alltid inn en safety-net (depth-grense eller sykel-deteksjon).",
    },
  },
  {
    id: "sql-correlated",
    title: "SQL — korrelert subquery",
    category: "sql",
    language: "sql",
    fileName: "snippet.sql",
    difficulty: 3,
    order: 7,
    intro: "En SELECT med en subquery.",
    code: `SELECT
  c.id,
  c.name,
  (SELECT COUNT(*)
   FROM orders o
   WHERE o.customer_id = c.id
     AND o.status = 'completed') AS done_count
FROM customers c
WHERE c.active = true;`,
    questions: [
      {
        kind: "text",
        prompt: "Hva returnerer queryen?",
        modelAnswer:
          "Alle aktive kunder med antall fullførte ordre per kunde.",
      },
      {
        kind: "mc",
        prompt: "Hvilket alternativ er typisk raskere på store tabeller?",
        options: [
          "Den korrelerte subqueryen som vist.",
          "LEFT JOIN orders + GROUP BY — én scan i stedet for N kjøringer.",
          "EXISTS-clause istedet.",
          "Spiller ingen rolle, optimizer fikser det.",
        ],
        correctIndex: 1,
        rationale:
          "Korrelerte subqueries blir ofte evaluert per rad (N+1). LEFT JOIN + GROUP BY scanner én gang.",
      },
      {
        kind: "text",
        prompt: "Foreslå en tittel.",
        modelAnswer: "active_customers_with_completed_order_count",
      },
      {
        kind: "text",
        prompt: "Hva er hovedproblemet?",
        modelAnswer:
          "N+1 evaluerings-pattern. På 1M kunder kjøres subqueryen 1M ganger. LEFT JOIN orders + GROUP BY c.id er bedre. Også: hardkodet 'completed'-streng burde være en enum/konstant.",
      },
    ],
    expert: {
      whatItDoes:
        "Lister aktive kunder med antall fullførte ordre. Korrelert subquery — én SELECT-evaluering per rad i ytre query.",
      suggestedName: "active_customers_with_completed_order_count",
      problems: [
        "N+1 query-pattern. Bruk LEFT JOIN + GROUP BY for én pass.",
        "Hardkodet streng 'completed' — fragil hvis status endrer seg.",
        "Mangler index-hint: orders bør ha index på (customer_id, status).",
        "Returnerer 0 for kunder uten ordre — bra, men du må eksplisitt teste det.",
      ],
      takeaway:
        "Korrelerte subqueries leses naturlig men skalerer dårlig. JOIN + GROUP BY er nesten alltid raskere.",
    },
  },
  {
    id: "sql-exists-anti",
    title: "SQL — EXISTS-mønster",
    category: "sql",
    language: "sql",
    fileName: "snippet.sql",
    difficulty: 3,
    order: 6,
    intro: "En SELECT med NOT EXISTS.",
    code: `SELECT u.id, u.email
FROM users u
WHERE NOT EXISTS (
  SELECT 1
  FROM logins l
  WHERE l.user_id = u.id
    AND l.created_at > NOW() - INTERVAL '90 days'
);`,
    questions: [
      {
        kind: "text",
        prompt: "Hva finner queryen?",
        modelAnswer:
          "Brukere som IKKE har logget inn de siste 90 dagene (inkl. brukere som aldri har logget inn).",
      },
      {
        kind: "mc",
        prompt: "Hva er forskjellen mot `WHERE u.id NOT IN (SELECT user_id FROM logins WHERE ...)`?",
        options: [
          "Ingen forskjell.",
          "NOT IN feiler stille hvis subqueryen returnerer NULL — NOT EXISTS gjør det ikke.",
          "NOT IN er alltid raskere.",
          "NOT EXISTS støttes ikke i MySQL.",
        ],
        correctIndex: 1,
        rationale:
          "NULL i NOT IN gjør at hele utrykket blir UNKNOWN og raden ekskluderes — klassisk feil. NOT EXISTS er trygt.",
      },
      {
        kind: "text",
        prompt: "Foreslå tittel.",
        modelAnswer: "inactive_users_90d",
      },
      {
        kind: "text",
        prompt: "Hva er det største problemet?",
        modelAnswer:
          "Logg-tabellen er ofte stor — uten index på logins(user_id, created_at) blir dette tregt. Også: 90 dager er en magic number — bør være en parameter.",
      },
    ],
    expert: {
      whatItDoes:
        "Anti-join: brukere uten innlogging siste 90 dager (eller aldri innlogget).",
      suggestedName: "inactive_users_90d",
      problems: [
        "Trenger index på logins(user_id, created_at) — ellers full scan.",
        "Magic number 90 — burde være en CTE-konstant eller funksjons-parameter.",
        "Bevarer ikke historikk: en bruker som logget inn for 91 dager siden er 'inaktiv' selv om de er nye.",
      ],
      takeaway:
        "Bruk NOT EXISTS over NOT IN. NULL-håndtering er forskjellig og NOT IN biter deg.",
    },
  },
  {
    id: "sql-lateral",
    title: "SQL — LATERAL JOIN",
    category: "sql",
    language: "sql",
    fileName: "snippet.sql",
    difficulty: 4,
    order: 15,
    intro: "En JOIN med LATERAL i PostgreSQL.",
    code: `SELECT c.id, c.name, o.order_id, o.total
FROM customers c
LEFT JOIN LATERAL (
  SELECT order_id, total
  FROM orders
  WHERE customer_id = c.id
  ORDER BY created_at DESC
  LIMIT 3
) o ON true;`,
    questions: [
      {
        kind: "text",
        prompt: "Hva returnerer denne queryen?",
        modelAnswer:
          "Hver kunde med sine inntil 3 nyeste ordre. Kunder uten ordre kommer med NULL i o-kolonnene.",
      },
      {
        kind: "mc",
        prompt: "Hvorfor må vi bruke LATERAL her?",
        options: [
          "Det må vi ikke — vanlig JOIN duger.",
          "Vanlig subquery kan ikke referere til c.id — LATERAL gir oss det.",
          "LATERAL er raskere generelt.",
          "Det er en PostgreSQL-spesifikk optimalisering.",
        ],
        correctIndex: 1,
        rationale:
          "I en vanlig FROM-subquery kan du ikke referere til en kollega-tabell. LATERAL låser opp 'per-rad'-utrykk.",
      },
      {
        kind: "text",
        prompt: "Foreslå tittel.",
        modelAnswer: "top_3_orders_per_customer",
      },
      {
        kind: "text",
        prompt: "Største problem eller fallgruve?",
        modelAnswer:
          "ORDER BY uten stabil tie-breaker (created_at kan være lik) — bør være created_at DESC, order_id DESC. Også: LATERAL kjører per rad — uten index på orders(customer_id, created_at) blir det tregt.",
      },
    ],
    expert: {
      whatItDoes:
        "Topp-N per gruppe — top 3 nyeste ordre per kunde. Klassisk LATERAL-pattern.",
      suggestedName: "top_3_orders_per_customer",
      problems: [
        "ORDER BY mangler tie-breaker — ikke deterministisk hvis to ordre har samme created_at.",
        "Krever index på orders(customer_id, created_at DESC) for å skalere.",
        "Alternativ: window function + ROW_NUMBER. Lateral er ofte tydeligere men ikke alltid raskere.",
      ],
      takeaway:
        "LATERAL er PostgreSQLs svar på 'per-rad-subquery'. Bruk den når du trenger Topp-N per gruppe og JOIN-syntaks er ryddigere enn window functions.",
    },
  },

  // ─────────────────── JavaScript / TypeScript ───────────────────
  {
    id: "js-closure-counter",
    title: "JavaScript — closure",
    category: "web",
    language: "javascript",
    fileName: "snippet.js",
    difficulty: 2,
    order: 2,
    intro: "En funksjon som returnerer en funksjon.",
    code: `function f() {
  let n = 0;
  return {
    inc: () => ++n,
    dec: () => --n,
    get: () => n,
    reset: () => { n = 0; }
  };
}`,
    questions: [
      {
        kind: "text",
        prompt: "Hva er konstruksjonen som lar `n` overleve mellom kall?",
        modelAnswer:
          "Closure — de returnerte funksjonene fanger lexical scope og holder `n` i live.",
      },
      {
        kind: "mc",
        prompt: "Hvis du kaller f() to ganger, deler de to instansene state?",
        options: [
          "Ja, n er globalt.",
          "Nei, hver f()-aktivering lager en ny binding av n.",
          "Avhenger av om du bruker `new`.",
          "Bare hvis du bruker strict mode.",
        ],
        correctIndex: 1,
        rationale:
          "Hver invocation skaper en ny scope og dermed en ny `n`. To countere er uavhengige.",
      },
      {
        kind: "text",
        prompt: "Foreslå navn.",
        modelAnswer: "createCounter()",
      },
      {
        kind: "text",
        prompt: "Hva er det største problemet?",
        modelAnswer:
          "Ingen type-info (TypeScript ville fanget feil). Ingen grense (kan bli negativ — kanskje OK, kanskje ikke). Ingen subscriber-mekanisme — andre kan ikke reagere på endringer.",
      },
    ],
    expert: {
      whatItDoes:
        "Factory som returnerer et counter-objekt med privat state via closure.",
      suggestedName: "createCounter",
      problems: [
        "Ingen typer — i TS ville `Counter`-interface vært nyttig.",
        "Ingen events — for UI bør du eksponere subscribe/notify.",
        "`reset()` har ingen `return n` — inkonsistent API.",
      ],
      takeaway:
        "Closures er JavaScripts måte å lage privat state uten klasse. Hver factory-kall = ny instans.",
    },
  },
  {
    id: "js-promise-chain",
    title: "TypeScript — Promise-kjede",
    category: "web",
    language: "typescript",
    fileName: "snippet.ts",
    difficulty: 3,
    order: 9,
    intro: "Asynkron data-flyt.",
    code: `function f(userId: string) {
  return fetch(\`/api/users/\${userId}\`)
    .then(r => r.json())
    .then(user => fetch(\`/api/orders?user=\${user.id}\`))
    .then(r => r.json())
    .then(orders => orders.filter((o: any) => o.total > 100))
    .catch(e => {
      console.error(e);
      return [];
    });
}`,
    questions: [
      {
        kind: "text",
        prompt: "Hva returnerer funksjonen?",
        modelAnswer:
          "En Promise som resolver til en array av ordre over 100 for gitt bruker, eller tom array ved feil.",
      },
      {
        kind: "mc",
        prompt: "Hva er det største feil-håndterings-problemet?",
        options: [
          "Tomme arrays kan ikke skille feil fra 'ingen store ordre'.",
          ".catch er på feil sted.",
          "fetch returnerer ikke en Promise.",
          "any-typene gjør at TS klager.",
        ],
        correctIndex: 0,
        rationale:
          "Ved feil får kalleren `[]` — som er ikke å skille fra et legitimt tomt resultat. Skjuler bugs.",
      },
      {
        kind: "text",
        prompt: "Foreslå navn.",
        modelAnswer: "getBigOrdersForUser()",
      },
      {
        kind: "text",
        prompt: "Hva er andre problemer?",
        modelAnswer:
          "Sjekker ikke r.ok — 404/500 blir parset som JSON og kaster rart. `any`-typer mister type-safety. catch returnerer [] som maskerer feil. Magic number 100. fetch + .then er foreldet stil — bruk async/await.",
      },
    ],
    expert: {
      whatItDoes:
        "Henter en bruker, så ordrene deres, så filtrerer på total > 100. Returnerer tom array ved hvilken som helst feil.",
      suggestedName: "getBigOrdersForUser",
      problems: [
        "Ingen r.ok-sjekk — 4xx/5xx parses som JSON og krasjer rart.",
        "Catch sluker feil — kalleren kan ikke skille feil fra tomt.",
        "Magic threshold 100 — bør være parameter.",
        "any på orders — definer Order-type.",
        "async/await ville vært mer leselig enn .then-kjede.",
      ],
      takeaway:
        "Aldri sluk en error stille. Returnér eller re-throw — kalleren skal bestemme om feilen er forventet.",
    },
  },
  {
    id: "ts-generic-debounce",
    title: "TypeScript — generic-funksjon",
    category: "web",
    language: "typescript",
    fileName: "snippet.ts",
    difficulty: 4,
    order: 14,
    intro: "En higher-order funksjon med generics.",
    code: `function f<T extends (...args: any[]) => any>(
  fn: T,
  ms: number,
): (...args: Parameters<T>) => void {
  let t: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (t) clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}`,
    questions: [
      {
        kind: "text",
        prompt: "Hva er den klassiske implementasjonen som dette er?",
        modelAnswer:
          "Debounce — utsetter fn-kallet til det har gått `ms` siden siste forsøk.",
      },
      {
        kind: "mc",
        prompt: "Hvorfor returneres `void` selv om fn kan returnere noe?",
        options: [
          "Det er en bug.",
          "Fordi fn kjøres asynkront i en setTimeout — return-verdien er borte når wrapperen returnerer.",
          "Generisk begrensning krever det.",
          "TypeScript-versjonen støtter ikke ReturnType<T>.",
        ],
        correctIndex: 1,
        rationale:
          "Wrapperen returnerer umiddelbart, men fn kjører senere. Det er umulig å returnere fns resultat synkront.",
      },
      {
        kind: "text",
        prompt: "Foreslå navn.",
        modelAnswer: "debounce()",
      },
      {
        kind: "text",
        prompt: "Hvilket problem har denne implementasjonen?",
        modelAnswer:
          "any[] i constraint — løs type-safety. Ingen leading-edge variant. Ingen .cancel() metode (kan ikke avbryte en pending call). Ingen flush(). Memory leak hvis komponenten unmountes mens timeren venter.",
      },
    ],
    expert: {
      whatItDoes:
        "Debounce — wrapper en funksjon slik at den bare kalles etter `ms` ms uten nye kall.",
      suggestedName: "debounce",
      problems: [
        "Mangler .cancel() / .flush() — i React må komponenten kunne avbryte ved unmount.",
        "any[] i constraint — bedre med `T extends (...args: never[]) => unknown`.",
        "Ingen 'leading' option (kall umiddelbart, så stillne).",
        "Hvis fn er en metode mister du `this`-binding.",
      ],
      takeaway:
        "Debounce/throttle ser enkelt ut men har mange edge cases. Bruk lodash-debounce i prod, eller dekk de explicit.",
    },
  },
  {
    id: "ts-react-hook",
    title: "React — custom hook",
    category: "web",
    language: "typescript",
    fileName: "snippet.tsx",
    difficulty: 4,
    order: 16,
    intro: "En React hook.",
    code: `function u<T>(key: string, initial: T) {
  const [v, setV] = useState<T>(() => {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : initial;
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(v));
  }, [v]);
  return [v, setV] as const;
}`,
    questions: [
      {
        kind: "text",
        prompt: "Hva er denne hooken?",
        modelAnswer:
          "En useState som persister verdien til localStorage under en gitt key.",
      },
      {
        kind: "mc",
        prompt: "Hva skjer på server-side rendering (Next.js, Remix)?",
        options: [
          "Den fungerer fint — useState er server-safe.",
          "ReferenceError: localStorage is not defined.",
          "Den returnerer initial uten å lese.",
          "useState fanger feilen automatisk.",
        ],
        correctIndex: 1,
        rationale:
          "localStorage finnes ikke på server. Initializer kjøres ved første render — på SSR krasjer det.",
      },
      {
        kind: "text",
        prompt: "Foreslå navn.",
        modelAnswer: "useLocalStorage()",
      },
      {
        kind: "text",
        prompt: "Hva er de viktigste bug-ene?",
        modelAnswer:
          "Krasjer på SSR. `key` er ikke i useEffect-deps — endring av key oppdaterer ikke. JSON.parse uten try/catch — corrupt verdi krasjer. Ingen synk på tvers av faner (storage event). Quota exceeded ved store objekter ikke håndtert.",
      },
    ],
    expert: {
      whatItDoes:
        "Drop-in erstatter for useState som persister til localStorage.",
      suggestedName: "useLocalStorage",
      problems: [
        "SSR-usikker — må sjekke `typeof window !== 'undefined'`.",
        "`key` ikke i useEffect deps — bytte av key gir feil oppførsel.",
        "Ingen try/catch rundt JSON.parse — corrupt data → krasj.",
        "Ingen cross-tab sync via `storage`-event.",
        "Initial-callback kalles bare første render — endrer `initial` senere har ingen effekt (forvirrende).",
      ],
      takeaway:
        "Hooks som rører ved global state (DOM, storage) må alltid håndtere SSR og deps-arrayen nøye.",
    },
  },

  // ─────────────────── C / lavnivå ───────────────────
  {
    id: "c-pointer-arith",
    title: "C — pointer arithmetic",
    category: "lavnivå",
    language: "c",
    fileName: "snippet.c",
    difficulty: 4,
    order: 17,
    intro: "En C-funksjon som tar en streng.",
    code: `int f(const char *s) {
    const char *p = s;
    int n = 0;
    while (*p) {
        if (*p == ' ' && *(p + 1) != ' ' && *(p + 1) != '\\0')
            n++;
        p++;
    }
    return *s == ' ' || n == 0 ? n : n + 1;
}`,
    questions: [
      {
        kind: "text",
        prompt: "Hva teller funksjonen?",
        modelAnswer:
          "Antall ord i en streng — teller mellomrom etterfulgt av ikke-mellomrom, og legger til 1 hvis strengen ikke starter med mellomrom og inneholder noe.",
      },
      {
        kind: "mc",
        prompt: "Hva returnerer den for input `\"  hello world  \"`?",
        options: ["1", "2", "3", "0"],
        correctIndex: 1,
        rationale:
          "Starter med space, så n = 0 initielt. ' '+'h' øker (n=1), ' '+'w' øker (n=2). Ender med ' '+'\\0' — ingen økning. Sjekken `*s == ' '` er sann, så returnerer n = 2.",
      },
      {
        kind: "text",
        prompt: "Foreslå navn.",
        modelAnswer: "count_words()",
      },
      {
        kind: "text",
        prompt: "Hva er problemene?",
        modelAnswer:
          "Tabs/newlines telles ikke som whitespace — kun ' '. NULL-pointer krasjer. Logikken er forvirrende — burde brukt en is_in_word-flag. Også: assumption om at strengen er null-terminated, men det er C-standard.",
      },
    ],
    expert: {
      whatItDoes:
        "Teller antall ord i en streng (med caveat: kun space som separator).",
      suggestedName: "count_words",
      problems: [
        "Behandler kun ' ' som separator — ikke '\\t', '\\n', '\\r'. Burde brukt isspace().",
        "Krasjer hvis s == NULL — ingen guard.",
        "Logikken er obscur — en state-machine med 'in_word'-flag er mer leselig og korrekt.",
        "Edge case: streng med kun whitespace returnerer 0 — OK, men ikke spesifisert.",
      ],
      takeaway:
        "C-kode med pointer-aritmetikk og lookahead er klassisk vanskelig å verifisere. Bruk standard-bibliotek (ctype.h) og state-maskiner — ikke ad-hoc bool-uttrykk.",
    },
  },
  {
    id: "c-fork-exec",
    title: "C — fork + exec",
    category: "lavnivå",
    language: "c",
    fileName: "snippet.c",
    difficulty: 5,
    order: 19,
    intro: "Prosess-styring i en C-funksjon.",
    code: `int f(const char *cmd) {
    pid_t pid = fork();
    if (pid == 0) {
        execlp("sh", "sh", "-c", cmd, NULL);
        _exit(127);
    }
    int status;
    waitpid(pid, &status, 0);
    return WEXITSTATUS(status);
}`,
    questions: [
      {
        kind: "text",
        prompt: "Hva gjør funksjonen?",
        modelAnswer:
          "Kjører `cmd` i et shell, venter på at det blir ferdig, returnerer exit-koden.",
      },
      {
        kind: "mc",
        prompt: "Hva er den største sikkerhets-risikoen?",
        options: [
          "fork() lekker minne.",
          "Shell injection — cmd interpolerss av sh -c, så `; rm -rf /` fungerer.",
          "execlp returnerer fra child.",
          "waitpid kan henge.",
        ],
        correctIndex: 1,
        rationale:
          "sh -c kjører strengen som shell-script. Ukontrollert input = remote code execution.",
      },
      {
        kind: "text",
        prompt: "Foreslå navn.",
        modelAnswer: "run_shell_command() eller system_like()",
      },
      {
        kind: "text",
        prompt: "Andre problemer?",
        modelAnswer:
          "fork() == -1 ikke håndtert. waitpid kan returnere -1 (EINTR). WIFEXITED ikke sjekket — hvis prosessen ble drept av signal er WEXITSTATUS udefinert. Stdin/stdout/stderr arves direkte uten kontroll.",
      },
    ],
    expert: {
      whatItDoes:
        "En system()-erstatter: kjører en kommando i et shell og returnerer exit-koden.",
      suggestedName: "run_shell_command",
      problems: [
        "Shell injection — bruk execvp med arg-array istedet hvis kommandoen er kjent.",
        "fork() == -1 ignoreres — bør returnere -1 til kalleren.",
        "waitpid bør være i en loop på EINTR.",
        "WIFEXITED bør sjekkes før WEXITSTATUS.",
        "Mangler signal-håndtering (SIGCHLD i forelder).",
      ],
      takeaway:
        "Aldri eksponer `sh -c` for ukontrollerte input. Bygg arg-arrays og bruk execvp direkte.",
    },
  },
  {
    id: "c-bit-manip",
    title: "C — bit manipulation",
    category: "lavnivå",
    language: "c",
    fileName: "snippet.c",
    difficulty: 3,
    order: 12,
    intro: "En liten C-funksjon på et heltall.",
    code: `int f(unsigned int x) {
    int n = 0;
    while (x) {
        n += x & 1;
        x >>= 1;
    }
    return n;
}`,
    questions: [
      {
        kind: "text",
        prompt: "Hva teller funksjonen?",
        modelAnswer:
          "Antall 1-bits i x — populasjons-count (popcount).",
      },
      {
        kind: "mc",
        prompt: "Hva er en raskere variant for samme jobb?",
        options: [
          "while(x) { n++; x &= (x-1); } — Brian Kernighans triks.",
          "Bruk en lookup-tabell.",
          "__builtin_popcount(x) — GCC/Clang instriksic.",
          "Alle tre er raskere på ulike måter.",
        ],
        correctIndex: 3,
        rationale:
          "Kernighans triks itererer bare én gang per satt bit. Lookup er O(1) for kjente størrelser. __builtin_popcount bruker POPCNT-instruksjonen på moderne CPUer.",
      },
      {
        kind: "text",
        prompt: "Foreslå navn.",
        modelAnswer: "popcount() eller count_set_bits()",
      },
      {
        kind: "text",
        prompt: "Hva er den største svakheten?",
        modelAnswer:
          "Itererer alle 32 bits selv om bare én er satt. Bruk x &= (x-1)-trikset for å iterere kun antall satte bits, eller __builtin_popcount.",
      },
    ],
    expert: {
      whatItDoes:
        "Populasjons-count: teller antall 1-bits i et unsigned int.",
      suggestedName: "popcount",
      problems: [
        "O(bits) i stedet for O(satte bits) — bruk x &= (x-1) for klassisk Kernighan.",
        "Ingen bruk av __builtin_popcount eller std::popcount (C++20).",
        "Hvis signed int hadde vært input ville >> vært implementation-defined for negative tall — bra at det er unsigned.",
      ],
      takeaway:
        "Klassiske bit-triks (Kernighan, lookup-tabell, hardware-instruksjon) finnes for de fleste bit-operasjoner. Vit hva som er tilgjengelig.",
    },
  },

  // ─────────────────── ML / Pandas ───────────────────
  {
    id: "ml-pandas-groupby",
    title: "Pandas — groupby + apply",
    category: "ml",
    language: "python",
    fileName: "snippet.py",
    difficulty: 3,
    order: 5,
    intro: "En transformasjon av en DataFrame.",
    code: `def f(df):
    return (
        df.groupby("category")
          .apply(lambda g: g.sort_values("date").tail(5))
          .reset_index(drop=True)
    )`,
    questions: [
      {
        kind: "text",
        prompt: "Hva returnerer funksjonen?",
        modelAnswer:
          "De 5 nyeste radene per kategori, samlet i en DataFrame.",
      },
      {
        kind: "mc",
        prompt: "Hva er den største ytelses-problemet?",
        options: [
          "groupby er treg.",
          "apply med en Python-lambda er treg — vectorize med groupby().tail() eller rank.",
          "sort_values bør være sort=True.",
          "reset_index er unødvendig.",
        ],
        correctIndex: 1,
        rationale:
          "`.apply(lambda)` faller tilbake til Python-loop. `df.sort_values('date').groupby('category').tail(5)` er én vektorisert pass.",
      },
      {
        kind: "text",
        prompt: "Foreslå navn.",
        modelAnswer: "latest_n_per_category() eller top5_recent_per_category()",
      },
      {
        kind: "text",
        prompt: "Hva er andre problemer?",
        modelAnswer:
          "Hardkodet 5 og 'category'/'date' — burde være parametre. apply gir DeprecationWarning i nyere pandas. Tomme grupper håndteres ikke eksplisitt.",
      },
    ],
    expert: {
      whatItDoes:
        "Topp-N per gruppe: de 5 nyeste radene per kategori.",
      suggestedName: "latest_n_per_category",
      problems: [
        "`apply(lambda)` er tregt — bruk `df.sort_values('date').groupby('category').tail(5)`.",
        "Hardkodet kolonnenavn og N — bør være parametre.",
        "Pandas 2.x deprecater apply-gruppe-retur av modifiserte DataFrames i flere tilfeller.",
      ],
      takeaway:
        "I pandas: hvis du skriver `.apply(lambda g: ...)` — stopp opp. Det finnes nesten alltid en vektorisert variant.",
    },
  },
  {
    id: "ml-sklearn-pipeline",
    title: "sklearn — Pipeline",
    category: "ml",
    language: "python",
    fileName: "snippet.py",
    difficulty: 3,
    order: 20,
    intro: "En sklearn-pipeline.",
    code: `def f(X, y):
    from sklearn.preprocessing import StandardScaler
    from sklearn.linear_model import LogisticRegression
    from sklearn.model_selection import cross_val_score
    import numpy as np

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    clf = LogisticRegression()
    scores = cross_val_score(clf, X_scaled, y, cv=5)
    return np.mean(scores)`,
    questions: [
      {
        kind: "text",
        prompt: "Hva er hovedfeilen som gjør resultatet for optimistisk?",
        modelAnswer:
          "Data leakage: scaler er fit på HELE X før cross-validation, så validerings-foldene har 'sett' trenings-statistikken.",
      },
      {
        kind: "mc",
        prompt: "Hva er fiksen?",
        options: [
          "Bruk cv=10 i stedet for 5.",
          "Pak scaler + clf i en sklearn.Pipeline — da fit-tes scaler kun på train-folden.",
          "Bruk RobustScaler.",
          "Drop scaler — LogReg trenger ikke skalering.",
        ],
        correctIndex: 1,
        rationale:
          "Pipeline(steps=[('sc', StandardScaler()), ('lr', LogisticRegression())]) fit-er hvert steg på trenings-folden inne i CV. Ingen lekkasje.",
      },
      {
        kind: "text",
        prompt: "Foreslå navn.",
        modelAnswer: "evaluate_logreg_cv() (etter fiks)",
      },
      {
        kind: "text",
        prompt: "Andre problemer?",
        modelAnswer:
          "Ingen stratifisert CV — uten StratifiedKFold blir foldene ujevne ved imbalansert klasse-distribusjon. LogReg uten max_iter kan ikke konvergere. Returnerer kun mean — std forteller mye om stabilitet.",
      },
    ],
    expert: {
      whatItDoes:
        "Skalerer features, kjører cross-validation av LogisticRegression, returnerer gjennomsnitts-accuracy.",
      suggestedName: "evaluate_logreg_cv (etter fiks)",
      problems: [
        "DATA LEAKAGE: scaler.fit_transform før CV — bryter CV-isolasjon.",
        "Bruk Pipeline([('scaler', StandardScaler()), ('clf', LogisticRegression())]) i cross_val_score.",
        "Ingen StratifiedKFold — viktig ved imbalansert klasse.",
        "Returnerer kun mean — std er essensielt for å vurdere variabilitet.",
        "LogReg uten max_iter/solver-spec kan gi convergence warnings.",
      ],
      takeaway:
        "Hver gang du fit-er en transformer utenfor CV-loopen lekker du info. Pipeline er ikke kosmetikk — det er korrekthet.",
    },
  },
];

/** Snippeter sortert i anbefalt rekkefølge (lett → vanskelig). */
export const SNIPPETS_BY_ORDER = [...CODE_SNIPPETS].sort((a, b) => a.order - b.order);

export function getSnippet(id: string): CodeSnippet | undefined {
  return CODE_SNIPPETS.find((s) => s.id === id);
}

export function snippetsByCategory(): Record<SnippetCategory, CodeSnippet[]> {
  const groups: Record<SnippetCategory, CodeSnippet[]> = {
    python: [],
    sql: [],
    web: [],
    lavnivå: [],
    ml: [],
  };
  for (const s of CODE_SNIPPETS) groups[s.category].push(s);
  for (const k of Object.keys(groups) as SnippetCategory[]) {
    groups[k].sort((a, b) => a.order - b.order);
  }
  return groups;
}

export const CATEGORY_LABELS: Record<SnippetCategory, string> = {
  python: "Python",
  sql: "SQL",
  web: "Web (JS/TS)",
  lavnivå: "C / lavnivå",
  ml: "ML / Pandas",
};
