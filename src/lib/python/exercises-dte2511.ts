/**
 * DTE-2511 «Videregående programmering» — 6 oppgaver fra Liang m.fl.
 * Hver oppgave har en `walkthrough` som lar studenten bla seg gjennom løsningen
 * steg for steg ("Lær først") før de prøver selv ("Test deg selv").
 *
 * Setup-koden seeder filer i Pyodides virtuelle filsystem så `open()` virker
 * akkurat som på en ekte maskin.
 */
import type { PyExercise } from "./types";

/* ------------------------------------------------------------------------- */
/* 1) Liang 13.5 — Replace text                                              */
/* ------------------------------------------------------------------------- */

const REPLACE_WORD_SETUP = `
# Seed en test.txt som koden under kan jobbe mot.
with open("test.txt", "w", encoding="utf-8") as _f:
    _f.write("Good morning everyone\\n")
    _f.write("This is a beautiful morning\\n")
    _f.write("Wake up early in the morning\\n")
`;

const REPLACE_WORD_STARTER = `# Liang 13.5 — bytt ut alle forekomster av et ord i en fil.
# Brukerdialog:
#   Enter a filename: test.txt
#   Enter the old string to be replaced: morning
#   Enter the new string to replace the old string: afternoon
#   Done
#
# Sandkasse-tips: input() funker ikke i Pyodide — hardkod variablene under.

filename = "test.txt"
old = "morning"
new = "afternoon"

# TODO: les fila, bytt ut old → new, skriv tilbake, og skriv "Done".
# TODO: håndter at fila ikke finnes (FileNotFoundError) med en pen feilmelding.
`;

const REPLACE_WORD_SOLUTION = `filename = "test.txt"
old = "morning"
new = "afternoon"

try:
    with open(filename, "r", encoding="utf-8") as f:
        content = f.read()
    new_content = content.replace(old, new)
    with open(filename, "w", encoding="utf-8") as f:
        f.write(new_content)
    print("Done")
except FileNotFoundError:
    print(f"Fant ikke fila '{filename}'")
except OSError as e:
    print(f"Klarte ikke å lese eller skrive: {e}")
`;

const REPLACE_WORD_WALKTHROUGH: PyExercise["walkthrough"] = [
  {
    label: "Sett opp variablene",
    explanation:
      "Vi starter med tre variabler: hvilken fil vi skal jobbe med, ordet vi vil erstatte, og det nye ordet. I et ekte terminal-program ville disse kommet fra `input()`, men Pyodide kan ikke vente på tastatur i nettleseren — derfor hardkoder vi dem her.\n\nFila `test.txt` er allerede seedet av oppgaven, så `open()` finner den.",
    code: `filename = "test.txt"
old = "morning"
new = "afternoon"
`,
    highlight: { from: 1, to: 3 },
  },
  {
    label: "Les hele innholdet",
    explanation:
      "Vi åpner fila i lesemodus (`\"r\"`) og bruker `with`-blokken slik at fila lukkes automatisk når blokken er ferdig — også hvis noe krasjer.\n\n`f.read()` slurper hele innholdet inn i én streng. Det er greit her fordi fila er liten, men for gigantfiler ville vi lest linje for linje med en for-løkke.",
    code: `filename = "test.txt"
old = "morning"
new = "afternoon"

with open(filename, "r", encoding="utf-8") as f:
    content = f.read()
`,
    highlight: { from: 5, to: 6 },
  },
  {
    label: "Bytt ut ordet",
    explanation:
      "`str.replace(gammelt, nytt)` returnerer en NY streng der alle forekomster er byttet — den endrer ikke originalstrengen, fordi strenger i Python er immutable.\n\nResultatet lagres i `new_content`. Hvis `old` ikke finnes, returnerer `replace` strengen uendret — ingen feil.",
    code: `filename = "test.txt"
old = "morning"
new = "afternoon"

with open(filename, "r", encoding="utf-8") as f:
    content = f.read()

new_content = content.replace(old, new)
`,
    highlight: { from: 8, to: 8 },
  },
  {
    label: "Skriv tilbake",
    explanation:
      "Vi åpner samme fil i skrivemodus (`\"w\"`). VIKTIG: `\"w\"` overskriver innholdet — det er det vi vil. Hadde vi brukt `\"a\"` (append), ville vi limt det nye innholdet bak det gamle.\n\nDeretter skriver vi `\"Done\"` til skjermen så brukeren vet at jobben er gjort.",
    code: `filename = "test.txt"
old = "morning"
new = "afternoon"

with open(filename, "r", encoding="utf-8") as f:
    content = f.read()

new_content = content.replace(old, new)

with open(filename, "w", encoding="utf-8") as f:
    f.write(new_content)
print("Done")
`,
    highlight: { from: 10, to: 12 },
    expectedOutput: "Done",
  },
  {
    label: "Håndter manglende fil",
    explanation:
      "Hva skjer hvis fila ikke finnes? `open()` kaster `FileNotFoundError` og hele programmet kræsjer med stacktrace. Det er stygt for brukeren.\n\nVi pakker hele logikken i `try`/`except` og fanger `FileNotFoundError` spesifikt. Da kan vi skrive en pen feilmelding istedenfor stacktrace.",
    code: `filename = "test.txt"
old = "morning"
new = "afternoon"

try:
    with open(filename, "r", encoding="utf-8") as f:
        content = f.read()
    new_content = content.replace(old, new)
    with open(filename, "w", encoding="utf-8") as f:
        f.write(new_content)
    print("Done")
except FileNotFoundError:
    print(f"Fant ikke fila '{filename}'")
`,
    highlight: { from: 5, to: 13 },
  },
  {
    label: "Fang andre IO-feil",
    explanation:
      "`FileNotFoundError` er kun ÉN av flere ting som kan gå galt: fila kan være låst (`PermissionError`), disken kan være full, encoding kan være feil. Alle disse er subklasser av `OSError`.\n\nVi legger til en bredere `except OSError`-blokk SIST — Python prøver `except`-blokkene ovenfra og ned, så `FileNotFoundError` fanges først, og alt annet IO-relatert havner i den brede.",
    code: REPLACE_WORD_SOLUTION,
    highlight: { from: 12, to: 14 },
    expectedOutput: "Done",
  },
];

/* ------------------------------------------------------------------------- */
/* 2) US Capitals — bygg dictionary fra fil                                  */
/* ------------------------------------------------------------------------- */

const US_CAPITALS_SETUP = `
# Et lite utdrag av USCapitals.txt — nok til å demonstrere prinsippet.
_capitals_data = """Alabama, Montgomery
Alaska, Juneau
Arizona, Phoenix
California, Sacramento
Colorado, Denver
New York, Albany
New Mexico, Santa Fe
North Carolina, Raleigh
South Carolina, Columbia
South Dakota, Pierre
Texas, Austin
Washington, Olympia
"""
with open("USCapitals.txt", "w", encoding="utf-8") as _f:
    _f.write(_capitals_data)
`;

const US_CAPITALS_STARTER = `# Bygg en dict fra USCapitals.txt og la "brukeren" slå opp en stat.
# Filformat: "Stat, Hovedstad" (én per linje). NB: stat OG hovedstad kan
# være flere ord, så vi splitter KUN på første komma.
#
# Hardkod state_query i sandkassen siden input() ikke virker.

state_query = "New York"

# TODO: åpne fila, bygg en dict capitals[stat] = hovedstad,
#       slå opp state_query og skriv ut svaret (eller feilmelding).
`;

const US_CAPITALS_SOLUTION = `state_query = "New York"

capitals = {}
with open("USCapitals.txt", "r", encoding="utf-8") as f:
    for line in f:
        line = line.strip()
        if not line or "," not in line:
            continue
        state, capital = line.split(",", 1)
        capitals[state.strip()] = capital.strip()

if state_query in capitals:
    print(f"{state_query} → {capitals[state_query]}")
else:
    print(f"Fant ikke staten '{state_query}'.")
`;

const US_CAPITALS_WALKTHROUGH: PyExercise["walkthrough"] = [
  {
    label: "Tom dict + åpne fila",
    explanation:
      "Vi starter med en tom dict `capitals = {}`. Den blir nøkkel→verdi-tabellen vår: nøkkel = statsnavn, verdi = hovedstad.\n\nDeretter åpner vi fila i lesemodus med `with`, så vi vet den lukkes igjen.",
    code: `state_query = "New York"

capitals = {}
with open("USCapitals.txt", "r", encoding="utf-8") as f:
    pass  # TODO: iterer linje for linje
`,
    highlight: { from: 3, to: 5 },
  },
  {
    label: "Iterer linje for linje",
    explanation:
      "Et åpent fil-objekt er iterable: `for line in f` gir én linje av gangen, inkludert linjeskiftet `\\n` på slutten. Det er hukommelses-effektivt — vi laster aldri hele fila inn i minnet samtidig.\n\n`line.strip()` fjerner mellomrom og `\\n` foran og bak.",
    code: `state_query = "New York"

capitals = {}
with open("USCapitals.txt", "r", encoding="utf-8") as f:
    for line in f:
        line = line.strip()
`,
    highlight: { from: 5, to: 6 },
  },
  {
    label: "Hopp over tomme/ugyldige linjer",
    explanation:
      "Filer i den ekte verden er rotete: tomme linjer, kommentarlinjer, halve linjer. Vi sjekker at linja ikke er tom OG at den faktisk inneholder et komma — uten det kan vi ikke splitte den.\n\n`continue` hopper til neste iterasjon i for-løkka.",
    code: `state_query = "New York"

capitals = {}
with open("USCapitals.txt", "r", encoding="utf-8") as f:
    for line in f:
        line = line.strip()
        if not line or "," not in line:
            continue
`,
    highlight: { from: 7, to: 8 },
  },
  {
    label: "Splitt på FØRSTE komma",
    explanation:
      "Stat-navn som «New York» og hovedsteder som «Little Rock» kan inneholde mellomrom — men aldri komma. `split(\",\", 1)` deler maks én gang, så vi får alltid bare to deler.\n\nUten `1`-tallet ville `\"a, b, c\".split(\",\")` returnert tre elementer, og vi ville fått ValueError når vi prøver å pakke ut to.",
    code: `state_query = "New York"

capitals = {}
with open("USCapitals.txt", "r", encoding="utf-8") as f:
    for line in f:
        line = line.strip()
        if not line or "," not in line:
            continue
        state, capital = line.split(",", 1)
        capitals[state.strip()] = capital.strip()
`,
    highlight: { from: 9, to: 10 },
  },
  {
    label: "Slå opp + håndter ikke-funnet",
    explanation:
      "Når dict-en er bygd, er oppslag konstant tid: `state_query in capitals` sjekker eksistens, `capitals[state_query]` henter verdien.\n\nViktig: alltid sjekk med `in` FØR du indekserer — ellers får du `KeyError` ved ukjent stat. Alternativet `capitals.get(state_query)` returnerer `None` istedenfor å kræsje, men en eksplisitt `if/else` er ofte mer leselig her.",
    code: US_CAPITALS_SOLUTION,
    highlight: { from: 12, to: 15 },
    expectedOutput: "New York → Albany",
  },
];

/* ------------------------------------------------------------------------- */
/* 3) Compare files — sett-operasjoner                                       */
/* ------------------------------------------------------------------------- */

const COMPARE_FILES_SETUP = `
with open("a.txt", "w", encoding="utf-8") as _f:
    _f.write("python java go rust kotlin scala\\n")
    _f.write("c cpp typescript javascript\\n")
with open("b.txt", "w", encoding="utf-8") as _f:
    _f.write("python ruby go rust haskell\\n")
    _f.write("c cpp lisp javascript\\n")
`;

const COMPARE_FILES_STARTER = `# Les to filer inn i hver sin set, og bruk set-operasjoner for å
# sammenligne dem. Antar at filene inneholder ord uten spesialtegn,
# adskilt av whitespace (mellomrom eller linjeskift).
#
# Filene a.txt og b.txt er allerede seedet av oppgaven.

# TODO: les fila, bygg set_a og set_b
# TODO: skriv ut union, intersection, difference (begge veier), symmetric_difference
`;

const COMPARE_FILES_SOLUTION = `with open("a.txt", "r", encoding="utf-8") as f:
    set_a = set(f.read().split())
with open("b.txt", "r", encoding="utf-8") as f:
    set_b = set(f.read().split())

print(f"Antall unike i begge: {len(set_a | set_b)}")
print(f"Alle unike (union):       {sorted(set_a | set_b)}")
print(f"Felles (intersection):    {sorted(set_a & set_b)}")
print(f"Kun i A (A - B):          {sorted(set_a - set_b)}")
print(f"Kun i B (B - A):          {sorted(set_b - set_a)}")
print(f"Symmetrisk diff (A ^ B):  {sorted(set_a ^ set_b)}")
`;

const COMPARE_FILES_WALKTHROUGH: PyExercise["walkthrough"] = [
  {
    label: "Les fila inn i en set",
    explanation:
      "`f.read()` henter hele innholdet som én streng. `.split()` uten argument deler på alle typer whitespace (mellomrom, tab, linjeskift) og kaster tomme strenger. `set(...)` lager en mengde som automatisk fjerner duplikater.\n\nDermed har vi ett rent set per fil.",
    code: `with open("a.txt", "r", encoding="utf-8") as f:
    set_a = set(f.read().split())
with open("b.txt", "r", encoding="utf-8") as f:
    set_b = set(f.read().split())
`,
    highlight: { from: 1, to: 4 },
  },
  {
    label: "Union — alt som finnes",
    explanation:
      "Union (`|`) gir oss alle elementer som er i A ELLER B (eller begge). Antallet = `len(set_a | set_b)`.\n\n`sorted(...)` brukes bare for pen utskrift — set-er har ingen rekkefølge, så uten sortering ville utskriften vært tilfeldig.",
    code: `with open("a.txt", "r", encoding="utf-8") as f:
    set_a = set(f.read().split())
with open("b.txt", "r", encoding="utf-8") as f:
    set_b = set(f.read().split())

print(f"Antall unike i begge: {len(set_a | set_b)}")
print(f"Alle unike (union):       {sorted(set_a | set_b)}")
`,
    highlight: { from: 6, to: 7 },
  },
  {
    label: "Intersection — kun det felles",
    explanation:
      "Intersection (`&`) gir ord som finnes i BÅDE A og B. Tenk Venn-diagram: kun den midtre overlapps-sonen.\n\nDe ekvivalente metodene er `set_a.intersection(set_b)` — pick whichever you find more readable.",
    code: `with open("a.txt", "r", encoding="utf-8") as f:
    set_a = set(f.read().split())
with open("b.txt", "r", encoding="utf-8") as f:
    set_b = set(f.read().split())

print(f"Antall unike i begge: {len(set_a | set_b)}")
print(f"Alle unike (union):       {sorted(set_a | set_b)}")
print(f"Felles (intersection):    {sorted(set_a & set_b)}")
`,
    highlight: { from: 8, to: 8 },
  },
  {
    label: "Difference — kun i én av filene",
    explanation:
      "Difference (`-`) er RETNINGS-følsom: `A - B` gir det som er i A men IKKE i B. `B - A` gir motsatt.\n\nDe to er sjelden like — `A - B` viser hva som er unikt for A, `B - A` viser hva som er unikt for B.",
    code: `with open("a.txt", "r", encoding="utf-8") as f:
    set_a = set(f.read().split())
with open("b.txt", "r", encoding="utf-8") as f:
    set_b = set(f.read().split())

print(f"Antall unike i begge: {len(set_a | set_b)}")
print(f"Alle unike (union):       {sorted(set_a | set_b)}")
print(f"Felles (intersection):    {sorted(set_a & set_b)}")
print(f"Kun i A (A - B):          {sorted(set_a - set_b)}")
print(f"Kun i B (B - A):          {sorted(set_b - set_a)}")
`,
    highlight: { from: 9, to: 10 },
  },
  {
    label: "Symmetric difference — XOR",
    explanation:
      "Symmetric difference (`^`) er som logisk XOR: alt som er i A ELLER B, men IKKE i begge. Du kan tenke på det som `(A | B) - (A & B)` — union minus intersection.\n\nMatematisk ekvivalens: `A ^ B == (A - B) | (B - A)`. Begge formler gir samme resultat.",
    code: COMPARE_FILES_SOLUTION,
    highlight: { from: 11, to: 11 },
    expectedOutput:
      "Antall unike i begge: 13\nAlle unike (union):       ['c', 'cpp', 'go', 'haskell', 'java', 'javascript', 'kotlin', 'lisp', 'python', 'ruby', 'rust', 'scala', 'typescript']\n…",
  },
];

/* ------------------------------------------------------------------------- */
/* 4) Library — OOP, arv og custom exception                                 */
/* ------------------------------------------------------------------------- */

const LIBRARY_SETUP = `
with open("books.txt", "w", encoding="utf-8") as _f:
    _f.write("Dune;Frank Herbert;1965;Novel\\n")
    _f.write("Python 101;Mike Driscoll;2020;Textbook\\n")
    _f.write("The Hobbit;J.R.R. Tolkien;1937;Novel\\n")
    _f.write("Feil linje uten nok felt\\n")
`;

const LIBRARY_STARTER = `# Lite bibliotekssystem med klassehierarki + custom exception.
# Filformat (én bok per linje): tittel;forfatter;årstall;type
# Gyldige typer: Novel, Textbook.
#
# Bygg ut klassene LibraryError, Book, Novel, Textbook, Library steg for steg.
# books.txt er allerede seedet av oppgaven.

class LibraryError(Exception):
    pass

class Book:
    pass

class Library:
    def __init__(self):
        self._books = []
        self._borrowed = []

    def load_from_file(self, filename):
        pass

    def borrow(self, title):
        pass

    def return_book(self, title):
        pass

# main:
lib = Library()
try:
    lib.load_from_file("books.txt")
except LibraryError as e:
    print("Feil ved innlasting:", e)
`;

const LIBRARY_SOLUTION = `class LibraryError(Exception):
    """Ett felles unntak for alle feil i biblioteket."""
    pass


class Book:
    def __init__(self, title, author, year):
        self._title = title
        self._author = author
        self._year = year

    def __str__(self):
        return f"{self._title} ({self._year})"


class Novel(Book):
    pass


class Textbook(Book):
    pass


class Library:
    BOOK_TYPES = {"Novel": Novel, "Textbook": Textbook}
    MAX_BORROW = 3

    def __init__(self):
        self._books = []
        self._borrowed = []

    def load_from_file(self, filename):
        try:
            f = open(filename, "r", encoding="utf-8")
        except OSError as e:
            print(f"Feil ved åpning av fil: {e}")
            return
        with f:
            for line in f:
                parts = line.strip().split(";")
                if len(parts) != 4:
                    raise LibraryError(f"Feil antall felt: '{line.strip()}'")
                title, author, year_str, type_str = parts
                try:
                    year = int(year_str)
                except ValueError:
                    raise LibraryError(f"Årstall ikke tall: {year_str}")
                cls = self.BOOK_TYPES.get(type_str)
                if cls is None:
                    raise LibraryError(f"Ukjent boktype: {type_str}")
                self._books.append(cls(title, author, year))

    def _find(self, lst, title):
        for b in lst:
            if b._title == title:
                return b
        return None

    def borrow(self, title):
        if len(self._borrowed) >= self.MAX_BORROW:
            raise LibraryError(f"Maks {self.MAX_BORROW} bøker kan lånes.")
        book = self._find(self._books, title)
        if book is None:
            raise LibraryError(f"Boka finnes ikke: {title}")
        self._books.remove(book)
        self._borrowed.append(book)

    def return_book(self, title):
        book = self._find(self._borrowed, title)
        if book is None:
            raise LibraryError(f"Boka er ikke lånt: {title}")
        self._borrowed.remove(book)
        self._books.append(book)


lib = Library()
try:
    lib.load_from_file("books.txt")
except LibraryError as e:
    print("Feil ved innlasting:", e)
else:
    print(f"Lastet inn {len(lib._books)} bøker.")
    try:
        lib.borrow("Dune")
        lib.borrow("The Hobbit")
        print("Lånt 2 bøker:", [str(b) for b in lib._borrowed])
        lib.return_book("Dune")
        print("Levert 1 bok, lånt nå:", [str(b) for b in lib._borrowed])
    except LibraryError as e:
        print("Feil:", e)
`;

const LIBRARY_WALKTHROUGH: PyExercise["walkthrough"] = [
  {
    label: "LibraryError",
    explanation:
      "Vi lager én felles exception-klasse for alle feil i biblioteket. Den arver fra `Exception` og trenger ingen kropp — `pass` betyr «klassen finnes, men har ingen tilleggsoppførsel».\n\nFordelen: vi kan skrive `except LibraryError` ETT sted og fange alle bibliotek-relaterte feil, samtidig som vi IKKE fanger uvedkommende feil som `KeyboardInterrupt` eller `ZeroDivisionError`.",
    code: `class LibraryError(Exception):
    """Ett felles unntak for alle feil i biblioteket."""
    pass
`,
    highlight: { from: 1, to: 3 },
  },
  {
    label: "Book + arv via Novel/Textbook",
    explanation:
      "`Book` har tre instansvariabler (`_title`, `_author`, `_year`) som settes i `__init__`. Underscore-prefiks signaliserer «privat» i Python — det er konvensjon, ikke teknisk håndhevet.\n\n`Novel` og `Textbook` arver fra `Book` uten å legge til noe — `pass` er nok. De finnes som EGNE TYPER så vi senere kan skille dem med `isinstance(b, Novel)`.",
    code: `class LibraryError(Exception):
    pass


class Book:
    def __init__(self, title, author, year):
        self._title = title
        self._author = author
        self._year = year

    def __str__(self):
        return f"{self._title} ({self._year})"


class Novel(Book):
    pass


class Textbook(Book):
    pass
`,
    highlight: { from: 5, to: 20 },
  },
  {
    label: "Library + type-lookup-tabell",
    explanation:
      "`BOOK_TYPES` er en KLASSE-variabel (delt for alle Library-instanser) som mapper streng → klasse. Slik kan vi senere skrive `cls = self.BOOK_TYPES.get(\"Novel\")` istedenfor en lang `if`/`elif`-kjede.\n\n`MAX_BORROW = 3` er også en konstant — å sentralisere den her gjør det enkelt å endre senere.",
    code: `class LibraryError(Exception):
    pass

class Book:
    def __init__(self, title, author, year):
        self._title = title
        self._author = author
        self._year = year
    def __str__(self):
        return f"{self._title} ({self._year})"

class Novel(Book): pass
class Textbook(Book): pass


class Library:
    BOOK_TYPES = {"Novel": Novel, "Textbook": Textbook}
    MAX_BORROW = 3

    def __init__(self):
        self._books = []
        self._borrowed = []
`,
    highlight: { from: 16, to: 22 },
  },
  {
    label: "load_from_file — åpne fila",
    explanation:
      "Oppgaven krever to ulike strategier for feil:\n\n• Hvis FILA ikke kan åpnes (`OSError`): FANG den, skriv pen feilmelding, og returner. Programmet skal fortsette.\n\n• Hvis DATAFEIL inne i fila: KAST `LibraryError` og la main håndtere.\n\nVi splitter derfor `open()` ut av `with`-blokken så vi kan ta `OSError` separat.",
    code: `    def load_from_file(self, filename):
        try:
            f = open(filename, "r", encoding="utf-8")
        except OSError as e:
            print(f"Feil ved åpning av fil: {e}")
            return
        with f:
            for line in f:
                pass  # parsing kommer i neste steg
`,
    highlight: { from: 1, to: 9 },
  },
  {
    label: "Parse hver linje + validér antall felt",
    explanation:
      "Vi splitter linja på semikolon og forventer EKSAKT fire deler. Hvis ikke, kaster vi `LibraryError` med en beskjed som identifiserer hvilken linje som var ødelagt.\n\n`line.strip()` fjerner `\\n` og whitespace før splitting — ellers ville `type_str` blitt `\"Novel\\n\"` istedenfor `\"Novel\"`.",
    code: `    def load_from_file(self, filename):
        try:
            f = open(filename, "r", encoding="utf-8")
        except OSError as e:
            print(f"Feil ved åpning av fil: {e}")
            return
        with f:
            for line in f:
                parts = line.strip().split(";")
                if len(parts) != 4:
                    raise LibraryError(f"Feil antall felt: '{line.strip()}'")
                title, author, year_str, type_str = parts
`,
    highlight: { from: 9, to: 12 },
  },
  {
    label: "Konverter år + velg riktig boktype",
    explanation:
      "`int(year_str)` kaster `ValueError` hvis strengen ikke er et tall — vi fanger den og kaster vår egen `LibraryError` istedenfor. Det skjuler implementasjonsdetaljer fra main, som bare trenger å vite om ÉN type feil.\n\n`BOOK_TYPES.get(type_str)` returnerer `None` for ukjente typer (i motsetning til `[type_str]` som ville kastet `KeyError`). Vi sjekker eksplisitt og kaster `LibraryError`.",
    code: `    def load_from_file(self, filename):
        try:
            f = open(filename, "r", encoding="utf-8")
        except OSError as e:
            print(f"Feil ved åpning av fil: {e}")
            return
        with f:
            for line in f:
                parts = line.strip().split(";")
                if len(parts) != 4:
                    raise LibraryError(f"Feil antall felt: '{line.strip()}'")
                title, author, year_str, type_str = parts
                try:
                    year = int(year_str)
                except ValueError:
                    raise LibraryError(f"Årstall ikke tall: {year_str}")
                cls = self.BOOK_TYPES.get(type_str)
                if cls is None:
                    raise LibraryError(f"Ukjent boktype: {type_str}")
                self._books.append(cls(title, author, year))
`,
    highlight: { from: 13, to: 20 },
  },
  {
    label: "borrow + return_book",
    explanation:
      "`borrow` sjekker først lånegrensen — hvis den er nådd, kast `LibraryError` UMIDDELBART. Så søker vi i `_books` etter tittelen, og hvis funnet flytter vi den til `_borrowed`.\n\n`return_book` er speilbildet: søk i `_borrowed`, flytt tilbake til `_books`. Begge bruker en liten hjelpe-metode `_find()` for å slippe duplisert kode.",
    code: `    def _find(self, lst, title):
        for b in lst:
            if b._title == title:
                return b
        return None

    def borrow(self, title):
        if len(self._borrowed) >= self.MAX_BORROW:
            raise LibraryError(f"Maks {self.MAX_BORROW} bøker kan lånes.")
        book = self._find(self._books, title)
        if book is None:
            raise LibraryError(f"Boka finnes ikke: {title}")
        self._books.remove(book)
        self._borrowed.append(book)

    def return_book(self, title):
        book = self._find(self._borrowed, title)
        if book is None:
            raise LibraryError(f"Boka er ikke lånt: {title}")
        self._borrowed.remove(book)
        self._books.append(book)
`,
    highlight: { from: 1, to: 21 },
  },
  {
    label: "main + try/except/else",
    explanation:
      "Vi instansierer `Library`, prøver å laste fila, og fanger `LibraryError` rundt det. `else`-blokken på en try/except kjører KUN hvis ingen exception ble kastet — perfekt for «kjør resten av programmet hvis innlasting gikk bra».\n\nVi har også en indre try/except rundt lån/levering — én feil der skal ikke stoppe resten av programmet.",
    code: LIBRARY_SOLUTION,
    highlight: { from: 71, to: 86 },
    expectedOutput:
      "Feil ved innlasting: Feil antall felt: 'Feil linje uten nok felt'",
  },
];

/* ------------------------------------------------------------------------- */
/* 5) Vehicle — OOP + pickle for persistens                                  */
/* ------------------------------------------------------------------------- */

const VEHICLE_SETUP = `
# Ingen seeding — første kjøring lager dict fra scratch, neste kjøringer
# ville lest fra vehicles.dat (men i sandkassen mister vi state mellom kjøringer).
`;

const VEHICLE_STARTER = `# Vehicle-klassen og en menyløkke som lagrer data med pickle.
# I sandkassen erstatter vi input() med hardkodede testverdier siden
# Pyodide ikke har terminal-input.

import pickle, os

# TODO: lag klassen Vehicle med regnr, merke, modell, modellaar, km, pris.
# TODO: les vehicles.dat hvis den finnes (pickle.load), ellers tom dict.
# TODO: simuler å legge til en bil og listen alle.
# TODO: lagre dict med pickle.dump.
`;

const VEHICLE_SOLUTION = `import pickle, os

class Vehicle:
    def __init__(self, regnr, merke, modell, modellaar, km, pris):
        self.regnr = regnr
        self.merke = merke
        self.modell = modell
        self.modellaar = modellaar
        self.km = km
        self.pris = pris

    def __str__(self):
        return (f"{self.regnr}: {self.merke} {self.modell} ({self.modellaar}), "
                f"{self.km} km, NOK {self.pris}")


DATA_FILE = "vehicles.dat"

# Last inn ELLER start på blank
if os.path.exists(DATA_FILE):
    with open(DATA_FILE, "rb") as f:
        vehicles_dict = pickle.load(f)
else:
    vehicles_dict = {}

# Simuler "Legg til"
def add_vehicle(regnr, merke, modell, aar, km, pris):
    vehicles_dict[regnr] = Vehicle(regnr, merke, modell, aar, km, pris)
    print(f"Lagt til {regnr}.")

# Simuler "List alle"
def list_all():
    if not vehicles_dict:
        print("Ingen kjøretøy registrert.")
        return
    print("-- Alle kjøretøy --")
    for v in vehicles_dict.values():
        print(v)

# Test
add_vehicle("NN12345", "Volvo", "Amazon", 2000, 340000, 400000)
add_vehicle("WC21517", "VW", "ID3", 2023, 34000, 400000)
list_all()

# Lagre
with open(DATA_FILE, "wb") as f:
    pickle.dump(vehicles_dict, f)
print("Lagret.")
`;

const VEHICLE_WALKTHROUGH: PyExercise["walkthrough"] = [
  {
    label: "Vehicle-klassen",
    explanation:
      "Helt vanlig klasse med 6 instansvariabler. `__init__` setter alle, `__str__` lager en pen tekst-representasjon som `print(v)` bruker automatisk.\n\nViktig: vi bruker IKKE underscore-prefiks her, fordi oppgaven sier «vi modifiserer ikke datamedlemmene etter at vi har skapt objektet» — så vi trenger ikke getter/setter-properties, og direkte attributt-tilgang er greit.",
    code: `import pickle, os

class Vehicle:
    def __init__(self, regnr, merke, modell, modellaar, km, pris):
        self.regnr = regnr
        self.merke = merke
        self.modell = modell
        self.modellaar = modellaar
        self.km = km
        self.pris = pris

    def __str__(self):
        return (f"{self.regnr}: {self.merke} {self.modell} ({self.modellaar}), "
                f"{self.km} km, NOK {self.pris}")
`,
    highlight: { from: 3, to: 14 },
  },
  {
    label: "Les vehicles.dat hvis den finnes",
    explanation:
      "Vi sjekker med `os.path.exists` om datafila finnes fra forrige kjøring. Hvis ja: åpne i BINÆR lesemodus (`\"rb\"`) og bruk `pickle.load` til å rekonstruere dict-en med Vehicle-objektene.\n\nHvis fila ikke finnes: start på blank med en tom dict. Dette gjør at programmet kjører fint første gang, før noen data er lagret.",
    code: `import pickle, os

class Vehicle:
    def __init__(self, regnr, merke, modell, modellaar, km, pris):
        self.regnr = regnr
        # ... (utelatt for kortets skyld)

DATA_FILE = "vehicles.dat"

if os.path.exists(DATA_FILE):
    with open(DATA_FILE, "rb") as f:
        vehicles_dict = pickle.load(f)
else:
    vehicles_dict = {}
`,
    highlight: { from: 8, to: 14 },
  },
  {
    label: "Legg til + list ut",
    explanation:
      "I et ekte terminalprogram ville disse vært inne i en menyløkke med `input()`-kall. Vi pakker logikken i to funksjoner så det er enkelt å lese.\n\nNøkkelen i dict-en er regnummer (`self.regnr`) — siden det er unikt per bil, kan vi raskt slå opp, sjekke om en bil allerede er registrert, og slette.",
    code: `import pickle, os

class Vehicle:
    def __init__(self, regnr, merke, modell, modellaar, km, pris):
        self.regnr = regnr
        # ... (utelatt)

DATA_FILE = "vehicles.dat"
vehicles_dict = {}

def add_vehicle(regnr, merke, modell, aar, km, pris):
    vehicles_dict[regnr] = Vehicle(regnr, merke, modell, aar, km, pris)
    print(f"Lagt til {regnr}.")

def list_all():
    if not vehicles_dict:
        print("Ingen kjøretøy registrert.")
        return
    print("-- Alle kjøretøy --")
    for v in vehicles_dict.values():
        print(v)

add_vehicle("NN12345", "Volvo", "Amazon", 2000, 340000, 400000)
list_all()
`,
    highlight: { from: 11, to: 25 },
  },
  {
    label: "Lagre med pickle.dump",
    explanation:
      "Når programmet skal avsluttes (Quit-menyvalget), åpner vi datafila i BINÆR SKRIVEMODUS (`\"wb\"`) og kaller `pickle.dump(obj, fil)`. Pickle serialiserer hele dict-en — inkludert alle Vehicle-objektene med deres klasse-info — til binærformat.\n\nNeste kjøring kan `pickle.load` rekonstruere alt eksakt.",
    code: VEHICLE_SOLUTION,
    highlight: { from: 46, to: 49 },
    expectedOutput:
      "Lagt til NN12345.\nLagt til WC21517.\n-- Alle kjøretøy --\nNN12345: Volvo Amazon (2000), 340000 km, NOK 400000\nWC21517: VW ID3 (2023), 34000 km, NOK 400000\nLagret.",
  },
  {
    label: "Menyløkke + exception-håndtering",
    explanation:
      "I et fullt program har du en `while True`-løkke med en meny. Brukerens valg leses med `input()` — som returnerer STRING. Vi prøver å konvertere til int og fanger `ValueError` slik at «L» eller «abc» ikke kræsjer programmet.\n\nIfølge oppgaven skal også menyvalget valideres til 1-6.",
    code: `# Menyløkke-mønster (ikke kjørbart i Pyodide pga input()):
#
# while True:
#     print("1) List 2) Legg til 3) Sok 4) Slett 5) Lagre 6) Quit")
#     valg = input("Velg 1-6: ")
#     try:
#         n = int(valg)
#         if n < 1 or n > 6:
#             raise ValueError
#     except ValueError:
#         print("Ugyldig valg.")
#         continue
#     if n == 1: list_all()
#     elif n == 2: add_vehicle(...)
#     elif n == 6:
#         with open(DATA_FILE, "wb") as f:
#             pickle.dump(vehicles_dict, f)
#         print("Data lagret. Avslutter.")
#         break
`,
    highlight: { from: 1, to: 19 },
  },
];

/* ------------------------------------------------------------------------- */
/* 6) Speeding — datetime + nested loops + utvidet Vehicle                   */
/* ------------------------------------------------------------------------- */

const SPEEDING_SETUP = `
# Lite utdrag av box_a.txt / box_b.txt — vi velger noen rader der vi vet
# det finnes både lovlige passeringer og fartsovertredelser.
with open("box_a.txt", "w", encoding="utf-8") as _f:
    _f.write("""NB72826, 2022-01-03 07:11:41
WC21517, 2022-01-03 13:12:36
WC21517, 2022-01-03 15:48:36
ZH85499, 2022-01-03 07:15:56
""")
with open("box_b.txt", "w", encoding="utf-8") as _f:
    _f.write("""NB72826, 2022-01-03 07:20:06
WC21517, 2022-01-03 13:17:06
WC21517, 2022-01-03 15:53:06
ZH85499, 2022-01-03 07:22:13
""")
`;

const SPEEDING_STARTER = `# Fartskontroll mellom to fotobokser, A og B, 5 km fra hverandre.
# Fartsgrense 60 km/t → lovlig kjøretid minst 5 minutter mellom A og B.
# Loggformat: "REGNR, YYYY-MM-DD HH:MM:SS" (én per linje).
#
# box_a.txt og box_b.txt er allerede seedet.

from datetime import datetime

# TODO: lag read_log(path) som returnerer dict { regnr: [datetime, ...] }
# TODO: lag check_speeding(regnr, passA, passB) som finner overtredelser
# TODO: kjør for "WC21517" og skriv ut treffene.
`;

const SPEEDING_SOLUTION = `from datetime import datetime, timedelta

DISTANSE_KM = 5.0
FARTSGRENSE = 60.0  # km/t
MIN_KJORETID = timedelta(minutes=5)  # 5 km / 60 km/t = 5 min


def read_log(path):
    """Returnerer dict { regnr: [sortert liste av datetime] }."""
    result = {}
    try:
        with open(path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or "," not in line:
                    continue
                regnr, ts_str = line.split(",", 1)
                regnr = regnr.strip().upper()
                try:
                    ts = datetime.strptime(ts_str.strip(), "%Y-%m-%d %H:%M:%S")
                except ValueError:
                    continue
                result.setdefault(regnr, []).append(ts)
    except OSError as e:
        print(f"Klarte ikke å lese {path}: {e}")
        return {}
    for regnr in result:
        result[regnr].sort()
    return result


def check_speeding(regnr, passA, passB):
    """Returnerer liste med (tA, tB, fart_km_t) for hver overtredelse."""
    tickets = []
    a_list = passA.get(regnr, [])
    b_list = passB.get(regnr, [])
    for tA in a_list:
        # Finn første tidspunkt i B som er ETTER tA.
        candidates = [tB for tB in b_list if tB > tA]
        if not candidates:
            continue
        tB = min(candidates)
        delta = tB - tA
        if delta < MIN_KJORETID:
            timer = delta.total_seconds() / 3600
            fart = DISTANSE_KM / timer
            tickets.append((tA, tB, fart))
    return tickets


passA = read_log("box_a.txt")
passB = read_log("box_b.txt")

regnr = "WC21517"
tickets = check_speeding(regnr, passA, passB)
print(f"-- {regnr} ({len(tickets)} treff) --")
for i, (tA, tB, fart) in enumerate(tickets, start=1):
    print(f" {i}) A: {tA}  B: {tB}  fart: {fart:.1f} km/t")
`;

const SPEEDING_WALKTHROUGH: PyExercise["walkthrough"] = [
  {
    label: "Konstanter + datetime-import",
    explanation:
      "Vi starter med å sentralisere domeneverdiene øverst: avstand, fartsgrense og minste lovlige kjøretid. Hvorfor `timedelta(minutes=5)` istedenfor `5`? Fordi vi senere skal sammenligne med differansen mellom to `datetime`-objekter, og DEN er en `timedelta`.\n\n`from datetime import datetime, timedelta` — vi importerer kun det vi trenger, ikke hele modulen.",
    code: `from datetime import datetime, timedelta

DISTANSE_KM = 5.0
FARTSGRENSE = 60.0  # km/t
MIN_KJORETID = timedelta(minutes=5)  # 5 km / 60 km/t = 5 min
`,
    highlight: { from: 1, to: 5 },
  },
  {
    label: "read_log — sett opp dict",
    explanation:
      "Vi skal bygge en dict der nøkkel = regnummer, verdi = liste av tidspunkter. Det lar oss raskt slå opp alle passeringer for én bil.\n\nVi pakker fillesing i `try/except OSError` — hvis fila mangler, returnerer vi tom dict heller enn å kræsje.",
    code: `from datetime import datetime, timedelta

def read_log(path):
    result = {}
    try:
        with open(path, "r", encoding="utf-8") as f:
            for line in f:
                pass  # parsing kommer
    except OSError as e:
        print(f"Klarte ikke å lese {path}: {e}")
        return {}
    return result
`,
    highlight: { from: 3, to: 12 },
  },
  {
    label: "Parse linja + datetime.strptime",
    explanation:
      "`line.split(\",\", 1)` deler i regnummer og tidsstempel. Vi gjør regnummer til store bokstaver (UPPERCASE) så vi ikke får duplikatnøkler hvis loggen er inkonsistent.\n\n`datetime.strptime(s, fmt)` parser en streng til `datetime`-objekt. Format `\"%Y-%m-%d %H:%M:%S\"` matcher loggen. Hvis det feiler, fanger vi `ValueError` og hopper over linja.",
    code: `def read_log(path):
    result = {}
    try:
        with open(path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or "," not in line:
                    continue
                regnr, ts_str = line.split(",", 1)
                regnr = regnr.strip().upper()
                try:
                    ts = datetime.strptime(ts_str.strip(), "%Y-%m-%d %H:%M:%S")
                except ValueError:
                    continue
                result.setdefault(regnr, []).append(ts)
    except OSError as e:
        print(f"Klarte ikke å lese {path}: {e}")
        return {}
    return result
`,
    highlight: { from: 6, to: 15 },
  },
  {
    label: "setdefault — bygg liste uten if-sjekk",
    explanation:
      "`result.setdefault(regnr, []).append(ts)` er et idiomatisk Python-mønster: hvis `regnr` ikke finnes som nøkkel, lager den en ny tom liste; ellers returnerer den den eksisterende. Så `.append(ts)` legger til.\n\nAlternativet ville vært en ekstra `if regnr not in result: result[regnr] = []`-linje. Begge funker — `setdefault` er mer kompakt.",
    code: `def read_log(path):
    result = {}
    try:
        with open(path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or "," not in line:
                    continue
                regnr, ts_str = line.split(",", 1)
                regnr = regnr.strip().upper()
                try:
                    ts = datetime.strptime(ts_str.strip(), "%Y-%m-%d %H:%M:%S")
                except ValueError:
                    continue
                result.setdefault(regnr, []).append(ts)
    except OSError as e:
        return {}
    for regnr in result:
        result[regnr].sort()
    return result
`,
    highlight: { from: 15, to: 19 },
  },
  {
    label: "check_speeding — finn nærmeste B etter A",
    explanation:
      "For hver passering i A trenger vi tidspunktet i B som er KORTEST etter — det er kandidaten for å være «samme tur».\n\n`[tB for tB in b_list if tB > tA]` er en list comprehension som filtrerer ut alle B-tidspunkter etter tA. `min(...)` plukker det tidligste av dem (= nærmeste fremover i tid).",
    code: `def check_speeding(regnr, passA, passB):
    tickets = []
    a_list = passA.get(regnr, [])
    b_list = passB.get(regnr, [])
    for tA in a_list:
        candidates = [tB for tB in b_list if tB > tA]
        if not candidates:
            continue
        tB = min(candidates)
        # neste steg: regn ut farten
    return tickets
`,
    highlight: { from: 5, to: 9 },
  },
  {
    label: "Regn ut farten + sammenlign med grense",
    explanation:
      "`tB - tA` gir en `timedelta`. Vi sammenligner direkte med `MIN_KJORETID` (også timedelta) — Python støtter `<` mellom timedelta-er direkte.\n\nHvis kjøretiden er kortere enn 5 min, har bilen kjørt for fort. Vi henter ut sekunder med `total_seconds()`, gjør om til timer, og deler avstand på tid for å få km/t.",
    code: `def check_speeding(regnr, passA, passB):
    tickets = []
    a_list = passA.get(regnr, [])
    b_list = passB.get(regnr, [])
    for tA in a_list:
        candidates = [tB for tB in b_list if tB > tA]
        if not candidates:
            continue
        tB = min(candidates)
        delta = tB - tA
        if delta < MIN_KJORETID:
            timer = delta.total_seconds() / 3600
            fart = DISTANSE_KM / timer
            tickets.append((tA, tB, fart))
    return tickets
`,
    highlight: { from: 10, to: 14 },
  },
  {
    label: "Kjør og skriv ut",
    explanation:
      "Vi leser begge logg-filene én gang og bruker dict-ene flere ganger. Det er mye raskere enn å åpne fila på nytt for hver bil.\n\nUtskriften matcher PDF-eksempelet: én linje per overtredelse, med både A- og B-tidspunkt og beregnet fart formatert til én desimal (`{fart:.1f}`).",
    code: SPEEDING_SOLUTION,
    highlight: { from: 53, to: 61 },
    expectedOutput:
      "-- WC21517 (2 treff) --\n 1) A: 2022-01-03 13:12:36  B: 2022-01-03 13:17:06  fart: 66.7 km/t\n 2) A: 2022-01-03 15:48:36  B: 2022-01-03 15:53:06  fart: 66.7 km/t",
  },
];

/* ------------------------------------------------------------------------- */
/* Eksport                                                                   */
/* ------------------------------------------------------------------------- */

export const DTE2511_EXERCISES: readonly PyExercise[] = [
  {
    id: "dte2511-replace-word",
    topic: "DTE-2511 — Filer & exceptions",
    title: "Replace text (Liang 13.5)",
    description:
      "Les en tekstfil, bytt ut alle forekomster av et ord med et annet, skriv tilbake. Legg på try/except for å håndtere manglende fil og andre IO-feil.",
    starter: REPLACE_WORD_STARTER,
    solution: REPLACE_WORD_SOLUTION,
    setup: REPLACE_WORD_SETUP,
    hints: [
      "Åpne fila i 'r'-modus, les med f.read(), bruk str.replace(), åpne igjen i 'w'-modus.",
      "FileNotFoundError er en subklasse av OSError — fang den spesifikke først.",
    ],
    walkthrough: REPLACE_WORD_WALKTHROUGH,
  },
  {
    id: "dte2511-us-capitals",
    topic: "DTE-2511 — Dictionary fra fil",
    title: "US Capitals — dict fra fil",
    description:
      "Les USCapitals.txt og bygg en dict { stat: hovedstad }. Slå opp en stat og skriv hovedstaden, eller en feilmelding hvis staten ikke finnes.",
    starter: US_CAPITALS_STARTER,
    solution: US_CAPITALS_SOLUTION,
    setup: US_CAPITALS_SETUP,
    hints: [
      "split(\",\", 1) deler kun én gang — viktig fordi stat OG hovedstad kan ha mellomrom.",
      "strip() på begge sider for å fjerne whitespace.",
      "Bruk 'state in capitals' istedenfor try/KeyError.",
    ],
    walkthrough: US_CAPITALS_WALKTHROUGH,
  },
  {
    id: "dte2511-compare-files",
    topic: "DTE-2511 — Sets & sammenligning",
    title: "Fil-sammenligning med set-operasjoner",
    description:
      "Les to filer inn i hver sin set, og sammenlign med |, &, - og ^. Vis union, intersection, difference begge veier, og symmetrisk differanse.",
    starter: COMPARE_FILES_STARTER,
    solution: COMPARE_FILES_SOLUTION,
    setup: COMPARE_FILES_SETUP,
    hints: [
      "set(f.read().split()) gir deg en mengde unike ord på én linje.",
      "Operatorene |, &, -, ^ matcher metodene union, intersection, difference, symmetric_difference.",
      "sorted() rundt utskriften bare for å få konsistent rekkefølge — set har ingen.",
    ],
    walkthrough: COMPARE_FILES_WALKTHROUGH,
  },
  {
    id: "dte2511-library",
    topic: "DTE-2511 — OOP & arv",
    title: "Bibliotekssystem (LibraryError, Book-arv)",
    description:
      "Bygg LibraryError (custom exception), Book med Novel/Textbook-subklasser, og en Library-klasse med load_from_file, borrow og return_book. All datafeil kastes som LibraryError; IO-feil ved åpning fanges og logges.",
    starter: LIBRARY_STARTER,
    solution: LIBRARY_SOLUTION,
    setup: LIBRARY_SETUP,
    hints: [
      "BOOK_TYPES = {\"Novel\": Novel, \"Textbook\": Textbook} sparer deg en lang if/elif.",
      "Skill mellom IO-feil (fang, fortsett) og DATA-feil (kast LibraryError).",
      "try/except/else: else kjører kun hvis ingen exception ble kastet.",
    ],
    walkthrough: LIBRARY_WALKTHROUGH,
  },
  {
    id: "dte2511-vehicle",
    topic: "DTE-2511 — OOP & pickle",
    title: "Vehicle-register med pickle",
    description:
      "Lag Vehicle-klassen og en dict { regnr: Vehicle }. Last fra vehicles.dat med pickle.load hvis den finnes, og lagre med pickle.dump ved Quit. NB: input() funker ikke i Pyodide — testdata er hardkodet.",
    starter: VEHICLE_STARTER,
    solution: VEHICLE_SOLUTION,
    setup: VEHICLE_SETUP,
    hints: [
      "Bruk 'rb' og 'wb' (binær) — pickle skriver binærformat.",
      "os.path.exists() før pickle.load — ellers krasjer programmet første kjøring.",
      "Menyvalg via input() bør konverteres til int i try/except for å fange ValueError.",
    ],
    walkthrough: VEHICLE_WALKTHROUGH,
  },
  {
    id: "dte2511-speeding",
    topic: "DTE-2511 — datetime & logikk",
    title: "Fartskontroll mellom fotobokser",
    description:
      "Bygg dict { regnr: [datetime, ...] } fra to logg-filer (boks A og B). For hver passering i A, finn nærmeste B-passering etter, og sjekk om kjøretiden er for kort (avstand 5 km, grense 60 km/t = minst 5 min).",
    starter: SPEEDING_STARTER,
    solution: SPEEDING_SOLUTION,
    setup: SPEEDING_SETUP,
    hints: [
      "datetime.strptime(s, \"%Y-%m-%d %H:%M:%S\") parser tidsstrengen.",
      "tB - tA gir en timedelta — sammenlign direkte med timedelta(minutes=5).",
      "List comprehension + min() for å finne nærmeste B-tidspunkt etter et gitt tA.",
    ],
    walkthrough: SPEEDING_WALKTHROUGH,
  },
];
