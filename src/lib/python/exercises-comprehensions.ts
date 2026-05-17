import type { PyExercise } from "./types";

/**
 * Python Comprehensions — 30 øvinger fra "hva er en list-comp"
 * til "lazy generatorer, walrus, late binding".
 *
 * Progresjon (6 nivåer):
 *   • Nivå 0 — for-loop → list-comp (transform)
 *   • Nivå 1 — filter med if
 *   • Nivå 2 — dict & set comprehensions
 *   • Nivå 3 — nested og flere if-er
 *   • Nivå 4 — conditional expression, unpacking, zip
 *   • Nivå 5 — generator-expressions, lazy eval, walrus, late binding
 *
 * Hver øving er selv-verifiserende: starter har `assert`-linjer som feiler
 * (med tydelig melding) hvis svaret er feil, og avsluttes med `print("OK")`.
 * Solution viser fasit. Hint gir nudge uten å løse alt.
 */
export const PY_COMPREHENSION_EXERCISES: PyExercise[] = [
  // =================================================================
  // NIVÅ 0 — for-loop → list-comp (transform, ingen filter)
  // =================================================================
  {
    id: "py-comp-01-square",
    topic: "Comprehensions — list",
    level: 0,
    title: "Fra for-loop til list-comp: kvadrater",
    description:
      "En list-comprehension er sukker for `for + append`. Lær mønsteret ved å skrive om en eksisterende for-loop til én linje.\n\nMønster: `[<uttrykk> for <var> in <iterable>]`.",
    requires: [],
    starter: `# === LÆR FØRST: for-loop med append ===
# Slik ser den "lange veien" ut:
tall = [1, 2, 3, 4, 5]
kvadrater_lang = []
for x in tall:
    kvadrater_lang.append(x * x)
print("Lang:", kvadrater_lang)

# === DIN OPPGAVE ===
# Skriv det samme som ÉN list-comprehension:
kvadrater = ...  # TODO: [<uttrykk> for x in tall]

print("Kort:", kvadrater)
assert kvadrater == [1, 4, 9, 16, 25], f"Forventet [1, 4, 9, 16, 25], fikk {kvadrater}"
print("OK")
`,
    solution: `tall = [1, 2, 3, 4, 5]
kvadrater_lang = []
for x in tall:
    kvadrater_lang.append(x * x)
print("Lang:", kvadrater_lang)

kvadrater = [x * x for x in tall]

print("Kort:", kvadrater)
assert kvadrater == [1, 4, 9, 16, 25]
print("OK")
`,
    hints: [
      "Mønster: [<noe-med-x> for x in <liste>].",
      "Uttrykket først, så `for x in tall`. Ingen `append`, ingen kolon.",
      "Svaret er `[x * x for x in tall]`.",
    ],
    docs: [
      {
        title: "Python docs — List Comprehensions",
        url: "https://docs.python.org/3/tutorial/datastructures.html#list-comprehensions",
        note: "Offisiell innføring: list-comp = kompakt for-loop som bygger en liste.",
      },
    ],
  },

  {
    id: "py-comp-02-double",
    topic: "Comprehensions — list",
    level: 0,
    title: "Doble hver verdi",
    description:
      "Bygg en ny liste der hvert tall er multiplisert med 2. Klassisk transform — ingen filter.",
    requires: [],
    starter: `priser = [10, 25, 50, 100, 250]

# TODO: bruk list-comp til å lage en liste der hver pris er doblet.
doblede = ...

print(doblede)
assert doblede == [20, 50, 100, 200, 500]
print("OK")
`,
    solution: `priser = [10, 25, 50, 100, 250]
doblede = [p * 2 for p in priser]
print(doblede)
assert doblede == [20, 50, 100, 200, 500]
print("OK")
`,
    hints: [
      "Mønster: [<uttrykk-i-p> for p in priser].",
      "Uttrykket er `p * 2`.",
    ],
  },

  {
    id: "py-comp-03-lower",
    topic: "Comprehensions — list",
    level: 0,
    title: "Lowercase alle ord",
    description:
      "Comprehensions funker på alt som er iterable — også strenger (kall metoder på elementet).",
    requires: [],
    starter: `ord = ["Hei", "VERDEN", "Python", "ER", "Gøy"]

# TODO: ny liste med lowercase-versjonene
sma = ...

print(sma)
assert sma == ["hei", "verden", "python", "er", "gøy"]
print("OK")
`,
    solution: `ord = ["Hei", "VERDEN", "Python", "ER", "Gøy"]
sma = [w.lower() for w in ord]
print(sma)
assert sma == ["hei", "verden", "python", "er", "gøy"]
print("OK")
`,
    hints: [
      "Du kan kalle metoder på elementet: `w.lower()`.",
      "Svaret: `[w.lower() for w in ord]`.",
    ],
  },

  {
    id: "py-comp-04-pluck",
    topic: "Comprehensions — list",
    level: 0,
    title: "Plukk ut ett felt fra dict-liste",
    description:
      "Vanlig mønster i web/data: du har en liste med dict-er og vil bare ha verdien for én nøkkel. Comprehension er det rette verktøyet.",
    requires: [],
    starter: `brukere = [
    {"id": 1, "navn": "Ola", "alder": 30},
    {"id": 2, "navn": "Kari", "alder": 25},
    {"id": 3, "navn": "Per", "alder": 40},
]

# TODO: liste med kun navnene
navn = ...

print(navn)
assert navn == ["Ola", "Kari", "Per"]
print("OK")
`,
    solution: `brukere = [
    {"id": 1, "navn": "Ola", "alder": 30},
    {"id": 2, "navn": "Kari", "alder": 25},
    {"id": 3, "navn": "Per", "alder": 40},
]
navn = [b["navn"] for b in brukere]
print(navn)
assert navn == ["Ola", "Kari", "Per"]
print("OK")
`,
    hints: [
      "For hver dict `b` i listen: hent `b[\"navn\"]`.",
      "Mønster: `[b[\"navn\"] for b in brukere]`.",
    ],
  },

  {
    id: "py-comp-05-c-to-f",
    topic: "Comprehensions — list",
    level: 0,
    title: "Celsius → Fahrenheit",
    description:
      "Bruk en formel-transform inne i en list-comp. F = C * 9/5 + 32.",
    requires: [],
    starter: `celsius = [0, 10, 20, 30, 100]

# TODO: regn om hver verdi til Fahrenheit
fahrenheit = ...

print(fahrenheit)
assert fahrenheit == [32.0, 50.0, 68.0, 86.0, 212.0]
print("OK")
`,
    solution: `celsius = [0, 10, 20, 30, 100]
fahrenheit = [c * 9/5 + 32 for c in celsius]
print(fahrenheit)
assert fahrenheit == [32.0, 50.0, 68.0, 86.0, 212.0]
print("OK")
`,
    hints: [
      "Uttrykket: `c * 9/5 + 32`.",
      "Husk: `9/5` (ikke `9//5`) for å få float.",
    ],
  },

  // =================================================================
  // NIVÅ 1 — Filter med `if`
  // =================================================================
  {
    id: "py-comp-06-even",
    topic: "Comprehensions — filter & transform",
    level: 1,
    title: "Filtrer partall",
    description:
      "Legg til en `if`-betingelse PÅ SLUTTEN av comprehensionen for å filtrere. Mønster: `[<uttrykk> for x in xs if <vilkår>]`.",
    requires: [],
    starter: `tall = list(range(1, 11))  # 1..10

# TODO: ny liste med kun partall
partall = ...  # [x for x in tall if ...]

print(partall)
assert partall == [2, 4, 6, 8, 10]
print("OK")
`,
    solution: `tall = list(range(1, 11))
partall = [x for x in tall if x % 2 == 0]
print(partall)
assert partall == [2, 4, 6, 8, 10]
print("OK")
`,
    hints: [
      "Partall: `x % 2 == 0`.",
      "Mønster: `[x for x in tall if x % 2 == 0]`.",
    ],
  },

  {
    id: "py-comp-07-long-strings",
    topic: "Comprehensions — filter & transform",
    level: 1,
    title: "Kun strenger lengre enn N",
    description:
      "Filter med `len()`. Hent ut alle ord som er minst 5 tegn lange.",
    requires: [],
    starter: `ord = ["sol", "katt", "elefant", "hus", "datamaskin", "is", "PYTHON"]

# TODO: kun ordene med 5 eller flere tegn
lange = ...

print(lange)
assert lange == ["elefant", "datamaskin", "PYTHON"]
print("OK")
`,
    solution: `ord = ["sol", "katt", "elefant", "hus", "datamaskin", "is", "PYTHON"]
lange = [w for w in ord if len(w) >= 5]
print(lange)
assert lange == ["elefant", "datamaskin", "PYTHON"]
print("OK")
`,
    hints: [
      "Uttrykket er bare `w` (ingen transformasjon).",
      "Vilkåret: `len(w) >= 5`.",
    ],
  },

  {
    id: "py-comp-08-adults",
    topic: "Comprehensions — filter & transform",
    level: 1,
    title: "Voksne fra dict-liste",
    description:
      "Kombinér filter (alder ≥ 18) med felt-plukking (kun navn). Klassisk to-i-ett: transform OG filter.",
    requires: [],
    starter: `personer = [
    {"navn": "Ola",  "alder": 30},
    {"navn": "Lars", "alder": 12},
    {"navn": "Kari", "alder": 17},
    {"navn": "Per",  "alder": 40},
    {"navn": "Ida",  "alder": 18},
]

# TODO: navn på personer som er minst 18
voksne = ...

print(voksne)
assert voksne == ["Ola", "Per", "Ida"]
print("OK")
`,
    solution: `personer = [
    {"navn": "Ola",  "alder": 30},
    {"navn": "Lars", "alder": 12},
    {"navn": "Kari", "alder": 17},
    {"navn": "Per",  "alder": 40},
    {"navn": "Ida",  "alder": 18},
]
voksne = [p["navn"] for p in personer if p["alder"] >= 18]
print(voksne)
assert voksne == ["Ola", "Per", "Ida"]
print("OK")
`,
    hints: [
      "Uttrykk = `p[\"navn\"]`. Vilkår = `p[\"alder\"] >= 18`.",
      "`[p[\"navn\"] for p in personer if p[\"alder\"] >= 18]`.",
    ],
  },

  {
    id: "py-comp-09-square-evens",
    topic: "Comprehensions — filter & transform",
    level: 1,
    title: "Kvadrér kun partallene",
    description:
      "Kombinér transformasjon (kvadrér) med filter (kun partall). Den klassiske jobben for en list-comp.",
    requires: [],
    starter: `tall = range(1, 11)

# TODO: kvadrér x, men bare hvis x er partall
resultat = ...

print(resultat)
assert resultat == [4, 16, 36, 64, 100]
print("OK")
`,
    solution: `tall = range(1, 11)
resultat = [x * x for x in tall if x % 2 == 0]
print(resultat)
assert resultat == [4, 16, 36, 64, 100]
print("OK")
`,
    hints: [
      "Uttrykk `x * x`, vilkår `x % 2 == 0`.",
      "`[x * x for x in tall if x % 2 == 0]`.",
    ],
  },

  {
    id: "py-comp-10-strip-none",
    topic: "Comprehensions — filter & transform",
    level: 1,
    title: "Strip ut None og tomme strenger",
    description:
      "Klassisk \"sanity-clean\" — filtrer bort falsy verdier (None, '', 0). Bare `if x` er nok, fordi tomme verdier er falsy i Python.",
    requires: [],
    starter: `rader = ["Ola", "", None, "Kari", "  ", "Per", None, "Ida"]

# TODO: behold bare ikke-tomme strenger (strip whitespace først; "   " teller som tom).
rene = ...

print(rene)
assert rene == ["Ola", "Kari", "Per", "Ida"]
print("OK")
`,
    solution: `rader = ["Ola", "", None, "Kari", "  ", "Per", None, "Ida"]
rene = [r.strip() for r in rader if r and r.strip()]
print(rene)
assert rene == ["Ola", "Kari", "Per", "Ida"]
print("OK")
`,
    hints: [
      "Du trenger to vilkår: `r` (filtrerer ut None) OG `r.strip()` (filtrerer ut whitespace-only).",
      "Kombinér med `and`: `if r and r.strip()`.",
      "Husk å transformere med `r.strip()` så de ikke har whitespace rundt.",
    ],
  },

  // =================================================================
  // NIVÅ 2 — Dict & set comprehensions
  // =================================================================
  {
    id: "py-comp-11-dict-name-age",
    topic: "Comprehensions — dict & set",
    level: 1,
    title: "Dict-comp: navn → alder",
    description:
      "Dict-comprehensions ser sånn ut: `{<nøkkel>: <verdi> for <var> in <iterable>}`. Bygg en `navn → alder`-oppslagstabell fra en dict-liste.",
    requires: [],
    starter: `personer = [
    {"navn": "Ola",  "alder": 30},
    {"navn": "Kari", "alder": 25},
    {"navn": "Per",  "alder": 40},
]

# TODO: bygg en dict {"Ola": 30, "Kari": 25, "Per": 40}
alder_av = ...

print(alder_av)
assert alder_av == {"Ola": 30, "Kari": 25, "Per": 40}
print("OK")
`,
    solution: `personer = [
    {"navn": "Ola",  "alder": 30},
    {"navn": "Kari", "alder": 25},
    {"navn": "Per",  "alder": 40},
]
alder_av = {p["navn"]: p["alder"] for p in personer}
print(alder_av)
assert alder_av == {"Ola": 30, "Kari": 25, "Per": 40}
print("OK")
`,
    hints: [
      "Mønster: `{<nøkkel>: <verdi> for p in personer}`.",
      "`{p[\"navn\"]: p[\"alder\"] for p in personer}`.",
    ],
    docs: [
      {
        title: "Python docs — Dictionaries (Comprehensions)",
        url: "https://docs.python.org/3/tutorial/datastructures.html#dictionaries",
        note: "Dict-comp = list-comp med `{key: value ...}` istedenfor `[value ...]`.",
      },
    ],
  },

  {
    id: "py-comp-12-enumerate",
    topic: "Comprehensions — dict & set",
    level: 1,
    title: "Dict-comp: index → element",
    description:
      "Bruk `enumerate()` til å få (index, element)-par, og bygg en dict med index som nøkkel.",
    requires: [],
    starter: `farger = ["rød", "grønn", "blå", "gul"]

# TODO: {0: "rød", 1: "grønn", 2: "blå", 3: "gul"}
indeksert = ...

print(indeksert)
assert indeksert == {0: "rød", 1: "grønn", 2: "blå", 3: "gul"}
print("OK")
`,
    solution: `farger = ["rød", "grønn", "blå", "gul"]
indeksert = {i: f for i, f in enumerate(farger)}
print(indeksert)
assert indeksert == {0: "rød", 1: "grønn", 2: "blå", 3: "gul"}
print("OK")
`,
    hints: [
      "`enumerate(farger)` gir `(0, 'rød'), (1, 'grønn'), ...`.",
      "Du kan unpacke i for-delen: `for i, f in enumerate(farger)`.",
      "`{i: f for i, f in enumerate(farger)}`.",
    ],
  },

  {
    id: "py-comp-13-invert",
    topic: "Comprehensions — dict & set",
    level: 2,
    title: "Inverter en dict (verdi → nøkkel)",
    description:
      "Bygg en ny dict der nøkler og verdier er bytta. Bruk `.items()` for å iterere over par.",
    requires: [],
    starter: `koder = {"A": 1, "B": 2, "C": 3, "D": 4}

# TODO: {1: "A", 2: "B", 3: "C", 4: "D"}
invertert = ...

print(invertert)
assert invertert == {1: "A", 2: "B", 3: "C", 4: "D"}
print("OK")
`,
    solution: `koder = {"A": 1, "B": 2, "C": 3, "D": 4}
invertert = {v: k for k, v in koder.items()}
print(invertert)
assert invertert == {1: "A", 2: "B", 3: "C", 4: "D"}
print("OK")
`,
    hints: [
      "Iterér over par med `koder.items()`.",
      "Unpack med `for k, v in koder.items()` — bytt så plassering.",
      "`{v: k for k, v in koder.items()}`.",
    ],
  },

  {
    id: "py-comp-14-set-first",
    topic: "Comprehensions — dict & set",
    level: 2,
    title: "Set-comp: unike første-bokstaver",
    description:
      "Set-comprehensions ser ut som dict-comp men uten kolon: `{<uttrykk> for ... }`. Bygg et set av første-bokstavene i en ordliste.",
    requires: [],
    starter: `ord = ["apple", "banana", "avocado", "blueberry", "cherry", "apricot"]

# TODO: et set med første-bokstavene (uppercase)
forste = ...

print(sorted(forste))
assert forste == {"A", "B", "C"}
print("OK")
`,
    solution: `ord = ["apple", "banana", "avocado", "blueberry", "cherry", "apricot"]
forste = {w[0].upper() for w in ord}
print(sorted(forste))
assert forste == {"A", "B", "C"}
print("OK")
`,
    hints: [
      "Set-comp: `{<uttrykk> for <var> in <iter>}` — krøllparenteser, ingen kolon.",
      "Første tegn: `w[0]`. Uppercase: `.upper()`.",
      "`{w[0].upper() for w in ord}`.",
    ],
  },

  {
    id: "py-comp-15-set-intersection-with-filter",
    topic: "Comprehensions — dict & set",
    level: 2,
    title: "Set-comp med filter: vokaler i tekst",
    description:
      "Bygg et set av kun de vokalene som faktisk finnes i en tekst. Bra øving på filter inne i set-comp.",
    requires: [],
    starter: `tekst = "Programmering i Python er gøy"
vokaler = set("aeiouæøå")

# TODO: et set med kun de vokalene som faktisk finnes i (lowercase) teksten
funnet = ...

print(sorted(funnet))
assert funnet == {"a", "e", "i", "o", "y", "ø"}, f"Fikk {funnet}"
print("OK")
`,
    solution: `tekst = "Programmering i Python er gøy"
vokaler = set("aeiouæøå")
funnet = {c for c in tekst.lower() if c in vokaler}
print(sorted(funnet))
assert funnet == {"a", "e", "i", "o", "y", "ø"}
print("OK")
`,
    hints: [
      "Iterer over hvert tegn: `for c in tekst.lower()`.",
      "Filter: `if c in vokaler`.",
      "Bruk krøllparenteser for set: `{c for c in ... if ...}`.",
    ],
  },

  // =================================================================
  // NIVÅ 3 — Nested og flere if-er
  // =================================================================
  {
    id: "py-comp-16-flatten",
    topic: "Comprehensions — nested",
    level: 2,
    title: "Flatten 2D-liste",
    description:
      "Nested comprehensions har TO `for`-deler. Rekkefølgen er som i den vanlige for-loopen: ytterst først, innerst sist.\n\nMønster: `[x for rad in matrise for x in rad]`.",
    requires: [],
    starter: `matrise = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]

# TODO: gjør den om til [1, 2, 3, 4, 5, 6, 7, 8, 9]
flat = ...

print(flat)
assert flat == [1, 2, 3, 4, 5, 6, 7, 8, 9]
print("OK")
`,
    solution: `matrise = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
flat = [x for rad in matrise for x in rad]
print(flat)
assert flat == [1, 2, 3, 4, 5, 6, 7, 8, 9]
print("OK")
`,
    hints: [
      "To `for`-deler i ÉN comprehension. Ytterste loop først: `for rad in matrise`. Innerste etter: `for x in rad`.",
      "Uttrykket er bare `x`.",
      "`[x for rad in matrise for x in rad]`.",
    ],
    docs: [
      {
        title: "Python docs — Nested List Comprehensions",
        url: "https://docs.python.org/3/tutorial/datastructures.html#nested-list-comprehensions",
        note: "Innerste for-loop står lengst til høyre. Samme rekkefølge som hvis du brettet ut til to vanlige løkker.",
      },
    ],
  },

  {
    id: "py-comp-17-cartesian",
    topic: "Comprehensions — nested",
    level: 2,
    title: "Kartesisk produkt (alle par)",
    description:
      "To `for`-deler over to forskjellige iterables gir alle kombinasjoner — kartesisk produkt.",
    requires: [],
    starter: `farger = ["rød", "blå"]
storrelser = ["S", "M", "L"]

# TODO: alle (farge, storrelse)-par som tuples
varianter = ...

print(varianter)
assert varianter == [
    ("rød", "S"), ("rød", "M"), ("rød", "L"),
    ("blå", "S"), ("blå", "M"), ("blå", "L"),
]
print("OK")
`,
    solution: `farger = ["rød", "blå"]
storrelser = ["S", "M", "L"]
varianter = [(f, s) for f in farger for s in storrelser]
print(varianter)
assert varianter == [
    ("rød", "S"), ("rød", "M"), ("rød", "L"),
    ("blå", "S"), ("blå", "M"), ("blå", "L"),
]
print("OK")
`,
    hints: [
      "Uttrykket er en tuple: `(f, s)`.",
      "To for-deler: `for f in farger for s in storrelser`.",
      "Ytterste loop først → farger varieres SAKTEST.",
    ],
  },

  {
    id: "py-comp-18-multi-if",
    topic: "Comprehensions — nested",
    level: 2,
    title: "Flere if-er på rad",
    description:
      "Du kan stable flere `if`-betingelser. Begge må være sanne. Hent partall som ER STØRRE enn 5.",
    requires: [],
    starter: `tall = list(range(1, 21))

# TODO: partall OG større enn 5
filt = ...  # [x for x in tall if ... if ...]

print(filt)
assert filt == [6, 8, 10, 12, 14, 16, 18, 20]
print("OK")
`,
    solution: `tall = list(range(1, 21))
filt = [x for x in tall if x % 2 == 0 if x > 5]
print(filt)
assert filt == [6, 8, 10, 12, 14, 16, 18, 20]
print("OK")
`,
    hints: [
      "Du kan skrive `if A if B` — det betyr `A and B`.",
      "Begge går: `if x % 2 == 0 if x > 5`.",
      "(Du kan også skrive `if x % 2 == 0 and x > 5` — samme resultat.)",
    ],
  },

  {
    id: "py-comp-19-transpose",
    topic: "Comprehensions — nested",
    level: 3,
    title: "Transponer en matrise",
    description:
      "Bytt rader og kolonner. To måter: nested comprehension, eller `zip(*matrise)`. Prøv nested først — det viser at innerste loop er den som varierer raskest.",
    requires: [],
    starter: `m = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
]

# TODO: transponer slik at kolonner blir rader.
# Hint: ytterste loop er kolonne-index j, innerste går over rader.
n = len(m)
t = ...  # [[m[i][j] for i in range(n)] for j in range(n)]

print(t)
assert t == [
    [1, 4, 7],
    [2, 5, 8],
    [3, 6, 9],
]
print("OK")
`,
    solution: `m = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
]
n = len(m)
t = [[m[i][j] for i in range(n)] for j in range(n)]
print(t)
assert t == [
    [1, 4, 7],
    [2, 5, 8],
    [3, 6, 9],
]
print("OK")
`,
    hints: [
      "Ytterste comp lager rader for `j` (kolonne-index): `[<rad> for j in range(n)]`.",
      "Innerste lager én rad ved å lese kolonne j: `[m[i][j] for i in range(n)]`.",
      "Sett dem sammen: `[[m[i][j] for i in range(n)] for j in range(n)]`.",
      "Alternativt (men ikke poenget her): `list(map(list, zip(*m)))`.",
    ],
  },

  {
    id: "py-comp-20-multiplikasjon",
    topic: "Comprehensions — nested",
    level: 3,
    title: "Multiplikasjonstabell som dict av dicts",
    description:
      "Nested dict-comp. For hver rad i (1..5), bygg en dict {j: i*j}.",
    requires: [],
    starter: `# TODO: bygg {1: {1:1, 2:2, ...}, 2: {1:2, 2:4, ...}, ...}
# for i, j i 1..5.
tabell = ...

print(tabell[3])
assert tabell[3] == {1: 3, 2: 6, 3: 9, 4: 12, 5: 15}
assert tabell[5][5] == 25
assert len(tabell) == 5
print("OK")
`,
    solution: `tabell = {i: {j: i * j for j in range(1, 6)} for i in range(1, 6)}
print(tabell[3])
assert tabell[3] == {1: 3, 2: 6, 3: 9, 4: 12, 5: 15}
assert tabell[5][5] == 25
assert len(tabell) == 5
print("OK")
`,
    hints: [
      "Ytterste dict-comp: `{i: <noe> for i in range(1, 6)}`.",
      "Innerste: `{j: i * j for j in range(1, 6)}`.",
      "Hele uttrykket: `{i: {j: i * j for j in range(1, 6)} for i in range(1, 6)}`.",
    ],
  },

  // =================================================================
  // NIVÅ 4 — Conditional expression, unpacking, zip
  // =================================================================
  {
    id: "py-comp-21-ternary",
    topic: "Comprehensions — avansert",
    level: 3,
    title: "if/else INNE i uttrykket (ternary)",
    description:
      "Det er forskjell på `if` som filter (slutten) og `if/else` som transform (uttrykket).\n\n• Filter:  `[x for x in xs if x > 0]`  ← dropper x ≤ 0\n• Ternary: `[x if x > 0 else 0 for x in xs]`  ← beholder alle, erstatter de negative\n\nØv på begge.",
    requires: [],
    starter: `tall = [-3, -1, 0, 2, 5, -7, 10]

# TODO 1: erstatt alle negative med 0, behold alle elementer (bruk ternary).
clamp = ...

# TODO 2: filtrer bort de negative — behold bare 0 og positive.
positive = ...

print("clamp:   ", clamp)
print("positive:", positive)
assert clamp == [0, 0, 0, 2, 5, 0, 10]
assert positive == [0, 2, 5, 10]
print("OK")
`,
    solution: `tall = [-3, -1, 0, 2, 5, -7, 10]
clamp = [x if x > 0 else 0 for x in tall]
positive = [x for x in tall if x >= 0]
print("clamp:   ", clamp)
print("positive:", positive)
assert clamp == [0, 0, 0, 2, 5, 0, 10]
assert positive == [0, 2, 5, 10]
print("OK")
`,
    hints: [
      "Ternary i Python: `<a> if <vilkår> else <b>`. Plasseres FØR `for`.",
      "Filter: `if <vilkår>` plasseres ETTER `for`.",
      "Husk: `0 ≥ 0` er sant, så `positive` får med 0.",
    ],
  },

  {
    id: "py-comp-22-items-unpack",
    topic: "Comprehensions — avansert",
    level: 3,
    title: "Unpack i for-delen: dict.items()",
    description:
      "Når iterablen gir tupler kan du unpacke direkte i `for`-delen. Bygg en liste med formaterte strenger fra en dict.",
    requires: [],
    starter: `alder = {"Ola": 30, "Kari": 25, "Per": 40}

# TODO: ["Ola er 30", "Kari er 25", "Per er 40"]
linjer = ...

print(linjer)
assert linjer == ["Ola er 30", "Kari er 25", "Per er 40"]
print("OK")
`,
    solution: `alder = {"Ola": 30, "Kari": 25, "Per": 40}
linjer = [f"{navn} er {ar}" for navn, ar in alder.items()]
print(linjer)
assert linjer == ["Ola er 30", "Kari er 25", "Per er 40"]
print("OK")
`,
    hints: [
      "`.items()` gir `(navn, alder)`-tupler.",
      "Unpack i for-delen: `for navn, ar in alder.items()`.",
      "f-string i uttrykket: `f\"{navn} er {ar}\"`.",
    ],
  },

  {
    id: "py-comp-23-zip-dict",
    topic: "Comprehensions — avansert",
    level: 3,
    title: "Bygg dict fra to lister med zip",
    description:
      "`zip(a, b)` parer opp element for element. Kombinér med dict-comp for å lage en oppslagstabell.",
    requires: [],
    starter: `navn = ["Ola", "Kari", "Per"]
poeng = [85, 92, 73]

# TODO: bygg {"Ola": 85, "Kari": 92, "Per": 73}
karakterbok = ...

print(karakterbok)
assert karakterbok == {"Ola": 85, "Kari": 92, "Per": 73}
print("OK")
`,
    solution: `navn = ["Ola", "Kari", "Per"]
poeng = [85, 92, 73]
karakterbok = {n: p for n, p in zip(navn, poeng)}
print(karakterbok)
assert karakterbok == {"Ola": 85, "Kari": 92, "Per": 73}
print("OK")
`,
    hints: [
      "`zip(navn, poeng)` gir `(\"Ola\", 85), (\"Kari\", 92), (\"Per\", 73)`.",
      "Unpack: `for n, p in zip(navn, poeng)`.",
      "Bonus: `dict(zip(navn, poeng))` gjør det samme — men poenget her er å mestre comp-formen.",
    ],
  },

  {
    id: "py-comp-24-product-with-filter",
    topic: "Comprehensions — avansert",
    level: 3,
    title: "Kombinér to lister med filter",
    description:
      "To `for`-deler PLUSS filter — vanlig i regneoppgaver (alle par a,b der a+b er primtall, alle (x,y) i et rutenett som ligger i sirkel, osv.).",
    requires: [],
    starter: `# Pythagoreiske trippel (a, b, c) der a² + b² = c² og a ≤ b ≤ c ≤ 20.
N = 20

# TODO: bygg listen av tupler (a, b, c).
# Tips: tre for-deler kan kombineres i én comp.
tripler = ...

print(tripler)
# Forventet (sortert): (3,4,5), (5,12,13), (6,8,10), (8,15,17), (9,12,15), (12,16,20)
assert (3, 4, 5) in tripler
assert (5, 12, 13) in tripler
assert (8, 15, 17) in tripler
assert len(tripler) == 6
print("OK")
`,
    solution: `N = 20
tripler = [
    (a, b, c)
    for a in range(1, N + 1)
    for b in range(a, N + 1)
    for c in range(b, N + 1)
    if a * a + b * b == c * c
]
print(tripler)
assert (3, 4, 5) in tripler
assert (5, 12, 13) in tripler
assert (8, 15, 17) in tripler
assert len(tripler) == 6
print("OK")
`,
    hints: [
      "Tre for-deler: a, b, c — der hver starter på den forrige (a≤b≤c).",
      "Filter til slutt: `if a*a + b*b == c*c`.",
      "Du sparer iterasjoner ved å starte b på `a` og c på `b` (ikke 1).",
    ],
  },

  {
    id: "py-comp-25-count-by-letter",
    topic: "Comprehensions — avansert",
    level: 4,
    title: "Grupper / tell med dict-comp + sum",
    description:
      "Du kan kombinere en dict-comp med en INNERSTE comprehension (eller `sum`-uttrykk) for å gruppe-telle. Tell hvor mange ord som starter med hver bokstav.",
    requires: [],
    starter: `ord = ["apple", "banana", "avocado", "blueberry", "cherry", "apricot", "blackberry"]

# TODO: bygg {"a": antall, "b": antall, "c": antall} basert på første bokstav.
# Hint: ytterste comp lager én entry per UNIK første-bokstav.
# Innerste sum teller hvor mange ord som matcher.
telling = ...

print(telling)
assert telling == {"a": 3, "b": 3, "c": 1}
print("OK")
`,
    solution: `ord = ["apple", "banana", "avocado", "blueberry", "cherry", "apricot", "blackberry"]
telling = {
    c: sum(1 for w in ord if w[0] == c)
    for c in {w[0] for w in ord}
}
print(telling)
assert telling == {"a": 3, "b": 3, "c": 1}
print("OK")
`,
    hints: [
      "Først: hent unike første-bokstaver med set-comp: `{w[0] for w in ord}`.",
      "Dict-comp over disse bokstavene: `{c: <antall> for c in <set>}`.",
      "Tell med gen-expr inni sum: `sum(1 for w in ord if w[0] == c)`.",
      "Alternativ (idiomatisk): `collections.Counter(w[0] for w in ord)` — men poenget her er å mestre comp.",
    ],
  },

  // =================================================================
  // NIVÅ 5 — Generators, lazy, walrus, late binding
  // =================================================================
  {
    id: "py-comp-26-genexpr-memory",
    topic: "Comprehensions — avansert",
    level: 4,
    title: "Generator-expression — minneeffektivitet",
    description:
      "Bytt ut `[]` med `()` og du får en GENERATOR — den bygger ikke listen i minnet, men gir verdier én etter én. Bra for store mengder data.\n\nDe fleste funksjoner (`sum`, `max`, `any`, `all`, `\".\".join(...)`) godtar gen-expr direkte uten parenteser.",
    requires: [],
    starter: `# Tenk deg at vi vil summere kvadratet av 1..1_000_000.
# Med list-comp bygger Python en liste på 1M elementer (~8MB) først.
# Med gen-expr behandles ett tall om gangen — nesten ingen ekstra minne.

import sys

N = 1000

# TODO 1: bygg en list-comp og finn størrelsen
lst = [x * x for x in range(N)]
list_storrelse = sys.getsizeof(lst)

# TODO 2: bygg en gen-expr (rund parentes) og finn størrelsen
gen = (x * x for x in range(N))
gen_storrelse = sys.getsizeof(gen)

# TODO 3: bruk gen-expr direkte i sum() (uten egne parenteser)
total = sum(...)  # erstatt ... med gen-expr-en for x*x for x in range(N)

print(f"list-comp:   {list_storrelse} bytes")
print(f"gen-expr:    {gen_storrelse} bytes")
print(f"sum av x²:   {total}")

assert list_storrelse > gen_storrelse * 10, "list bør være MYE større enn gen"
assert total == sum(x * x for x in range(N))
assert total == 332833500  # 0² + 1² + ... + 999² = N(N-1)(2N-1)/6
print("OK")
`,
    solution: `import sys

N = 1000

lst = [x * x for x in range(N)]
list_storrelse = sys.getsizeof(lst)

gen = (x * x for x in range(N))
gen_storrelse = sys.getsizeof(gen)

total = sum(x * x for x in range(N))

print(f"list-comp:   {list_storrelse} bytes")
print(f"gen-expr:    {gen_storrelse} bytes")
print(f"sum av x²:   {total}")

assert list_storrelse > gen_storrelse * 10
assert total == 332833500
print("OK")
`,
    hints: [
      "Gen-expr: bytt `[]` med `()`.",
      "I `sum(...)` kan du droppe de ytterste parentesene: `sum(x*x for x in range(N))`.",
      "`sys.getsizeof()` viser bytes en object selv tar — generatoren er liten og konstant uavhengig av N.",
    ],
    docs: [
      {
        title: "Python docs — Generator Expressions",
        url: "https://docs.python.org/3/reference/expressions.html#generator-expressions",
        note: "Samme syntaks som list-comp, men med rund parentes. Lager en iterator, ikke en liste.",
      },
    ],
  },

  {
    id: "py-comp-27-next-lazy",
    topic: "Comprehensions — avansert",
    level: 4,
    title: "Lazy: `next()` på en gen-expr",
    description:
      "Generatorer er late — de gjør ingenting før noen ber om en verdi. Bruk `next()` til å hente første treff uten å bygge hele lista.\n\nDette er Python-ekvivalenten til SQL `LIMIT 1`.",
    requires: [],
    starter: `tall = range(1, 1_000_000)

# TODO: finn FØRSTE tall større enn 999 som er delelig med 17.
# Bruk en gen-expr og next() — IKKE bygg en liste.
forste = next(...)  # next( (x for x in tall if ...) )

print(forste)
assert forste == 1003  # 1003 = 17 * 59
print("OK")
`,
    solution: `tall = range(1, 1_000_000)
forste = next(x for x in tall if x > 999 and x % 17 == 0)
print(forste)
assert forste == 1003
print("OK")
`,
    hints: [
      "Gen-expr: `(x for x in tall if x > 999 and x % 17 == 0)`.",
      "I `next(...)` kan du droppe de ekstra parentesene: `next(x for x in tall if ...)`.",
      "`next()` plukker første verdi og stopper — resten beregnes aldri.",
    ],
  },

  {
    id: "py-comp-28-walrus",
    topic: "Comprehensions — avansert",
    level: 4,
    title: "Walrus (`:=`) i comprehension",
    description:
      "Walrus-operatoren `:=` lar deg lagre et delresultat midt i et uttrykk. Nyttig når en kostbar beregning brukes BÅDE i filter OG i uttrykk.\n\nUten walrus måtte du regnet den to ganger.",
    requires: [],
    starter: `def slow_score(x):
    # Tenk deg at denne er treig (DB-kall, API, krevende matte).
    return x * 3 - 7

tall = range(20)

# UTEN walrus måtte du skrevet:
#   [(x, slow_score(x)) for x in tall if slow_score(x) > 10]
# — som kaller slow_score TO ganger per x.

# TODO: bruk walrus til å regne slow_score(x) ÉN gang per x.
# Mønster: \`[(x, s) for x in tall if (s := slow_score(x)) > 10]\`
par = ...

print(par)
assert par == [(6, 11), (7, 14), (8, 17), (9, 20), (10, 23),
               (11, 26), (12, 29), (13, 32), (14, 35), (15, 38),
               (16, 41), (17, 44), (18, 47), (19, 50)]
print("OK")
`,
    solution: `def slow_score(x):
    return x * 3 - 7

tall = range(20)

par = [(x, s) for x in tall if (s := slow_score(x)) > 10]

print(par)
assert par == [(6, 11), (7, 14), (8, 17), (9, 20), (10, 23),
               (11, 26), (12, 29), (13, 32), (14, 35), (15, 38),
               (16, 41), (17, 44), (18, 47), (19, 50)]
print("OK")
`,
    hints: [
      "Walrus: `(navn := uttrykk)` — tildeler OG returnerer uttrykket.",
      "Plassér tildelingen i filter-delen: `if (s := slow_score(x)) > 10`. Da kan `s` brukes i uttrykksdelen.",
      "`[(x, s) for x in tall if (s := slow_score(x)) > 10]`.",
    ],
    docs: [
      {
        title: "PEP 572 — Assignment Expressions",
        url: "https://peps.python.org/pep-0572/",
        note: "Introduserte `:=`-operatoren i Python 3.8. Hovedmotivasjon: unngå dobbeltberegning i comprehensions og while-løkker.",
      },
    ],
  },

  {
    id: "py-comp-29-late-binding",
    topic: "Comprehensions — avansert",
    level: 5,
    title: "Late binding-fellen med lambda",
    description:
      "En klassisk felle: lambdas inni en comprehension fanger VARIABELEN, ikke verdien. Når du senere kaller dem, ser alle på den SAMME variabelen — som har sluttet på sin siste verdi.\n\nDu skal først PRODUSERE bug-en, så fikse den med default-argument-trikset.",
    requires: [],
    starter: `# DEL A — bug-en
# Lag 5 lambdas, hver "ment" å returnere sin egen i:
buggy = [lambda: i for i in range(5)]
resultater_buggy = [f() for f in buggy]
print("Buggy:", resultater_buggy)
# Hva tror du dette skriver?
# Svar: [4, 4, 4, 4, 4] — alle 5 lambdas peker på SAMME i, som ble 4 sist.

# DEL B — FIKS
# Bruk default-argument-trikset: \`lambda i=i: i\`.
# Default-argumenter evalueres VED definisjonen, så i "fryses".
# TODO: lag riktig liste med 5 lambdas der hver returnerer sin egen i.
fikset = ...
resultater_fikset = [f() for f in fikset]
print("Fikset:", resultater_fikset)

assert resultater_buggy == [4, 4, 4, 4, 4]
assert resultater_fikset == [0, 1, 2, 3, 4]
print("OK")
`,
    solution: `buggy = [lambda: i for i in range(5)]
resultater_buggy = [f() for f in buggy]
print("Buggy:", resultater_buggy)

fikset = [lambda i=i: i for i in range(5)]
resultater_fikset = [f() for f in fikset]
print("Fikset:", resultater_fikset)

assert resultater_buggy == [4, 4, 4, 4, 4]
assert resultater_fikset == [0, 1, 2, 3, 4]
print("OK")
`,
    hints: [
      "Default-argumenter evalueres når funksjonen DEFINERES, ikke når den kalles.",
      "Skriv `lambda i=i: i` — variabelen `i` blir BUNDET til verdien den har akkurat nå.",
      "Alternativ: bruk `functools.partial` eller en ekte funksjon med closure-parameter.",
    ],
    docs: [
      {
        title: "Python FAQ — Why do lambdas defined in a loop with different values all return the same result?",
        url: "https://docs.python.org/3/faq/programming.html#why-do-lambdas-defined-in-a-loop-with-different-values-all-return-the-same-result",
        note: "Offisiell forklaring + samme default-argument-løsning.",
      },
    ],
  },

  {
    id: "py-comp-30-vs-map-filter",
    topic: "Comprehensions — avansert",
    level: 5,
    title: "Comprehension vs map/filter — når velge hvilken",
    description:
      "Alle de tre formene gjør det samme. Kjør dem ved siden av hverandre og se forskjellen.\n\nReglene som har vunnet i moderne Python:\n  • Comprehension er nesten alltid mest lesbart.\n  • `map`/`filter` er OK når funksjonen finnes fra før (`map(str, tall)`) — slipper lambda.\n  • Gen-expr brukes når output mates direkte inn i `sum`/`any`/`all`/`max`/`min`/`\",\".join(...)`.\n\nDu skal skrive alle tre variantene og se at de gir samme resultat.",
    requires: [],
    starter: `tall = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

# Mål: hent kvadratet av partallene.

# Variant A — list-comp
a = [x * x for x in tall if x % 2 == 0]

# Variant B — map + filter med lambda (tradisjonell funksjonell stil)
# TODO: bygg samme resultat med map(...) og filter(...).
# Hint: filter først, så map. Pakk inn med list(...) til slutt.
b = ...

# Variant C — gen-expr inn i sum (når vi bare vil ha totalen).
# TODO: skriv en gen-expr i sum() som summerer kvadratet av partallene.
total = sum(...)

print("A:", a)
print("B:", b)
print("Sum:", total)

assert a == [4, 16, 36, 64, 100]
assert b == a
assert total == sum(a)  # 220
assert total == 220
print("OK")
`,
    solution: `tall = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

a = [x * x for x in tall if x % 2 == 0]

b = list(map(lambda x: x * x, filter(lambda x: x % 2 == 0, tall)))

total = sum(x * x for x in tall if x % 2 == 0)

print("A:", a)
print("B:", b)
print("Sum:", total)

assert a == [4, 16, 36, 64, 100]
assert b == a
assert total == 220
print("OK")
`,
    hints: [
      "`filter(f, xs)` gir alle x der f(x) er sant — som `for x in xs if f(x)`.",
      "`map(g, xs)` gir g(x) for hver x — som `g(x) for x in xs`.",
      "Pakk inn med `list(...)` for å materialisere — både map og filter er late iteratorer.",
      "I `sum(...)` slipper gen-expr-en sine egne parenteser: `sum(x*x for x in tall if x % 2 == 0)`.",
    ],
    docs: [
      {
        title: "Python docs — map() / filter()",
        url: "https://docs.python.org/3/library/functions.html#map",
        note: "Begge er late iteratorer. I moderne Python anbefales comprehensions for lesbarhet — map/filter brukes når funksjonen er navngitt fra før.",
      },
    ],
  },
];
