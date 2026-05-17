/**
 * Spørsmålsbank for 20-min diagnose-pretest.
 *
 * Hvert spørsmål tagger hvilke skills det tester, og en vanskelighetsgrad 1-5.
 * Adaptiv-algoritmen plukker spørsmål basert på løpende estimat.
 */

import type { DiagnoseAnswer, DiagnoseResult } from "./engine";
import type { SkillArea } from "./skills";
import { SKILLS } from "./skills";

export type QuestionKind = "mcq" | "predict" | "oneliner";

export interface DiagnoseQuestion {
  id: string;
  kind: QuestionKind;
  /** Norsk spørsmålstekst. */
  prompt: string;
  /** Valgfritt kodeklipp som vises i monospace-blokk. */
  code?: string;
  /** For mcq/predict: alternativer. */
  options?: string[];
  /** Index inn i `options` for riktig svar (mcq/predict), eller en streng for `oneliner`. */
  answer: number | string;
  /** Aksepter også disse strengene case-insensitivt for `oneliner`. */
  acceptedAnswers?: string[];
  /** Korrekt forklaring vist etter svar. */
  explain?: string;
  /** Skills som testes. */
  skills: string[];
  /** Vanskelighetsgrad 1-5. */
  difficulty: 1 | 2 | 3 | 4 | 5;
}

/* ----------------------------------------------------------------------------
 * Spørsmålsbank — ~70 spørsmål
 * ------------------------------------------------------------------------- */

export const QUESTIONS: DiagnoseQuestion[] = [
  // === Python grunnleggende ===
  {
    id: "q-py-1",
    kind: "predict",
    prompt: "Hva er output?",
    code: 'x = 5\nprint(type(x).__name__)',
    options: ["int", "float", "str", "number"],
    answer: 0,
    skills: ["py-variables"],
    difficulty: 1,
  },
  {
    id: "q-py-2",
    kind: "predict",
    prompt: "Hva skrives ut?",
    code: 'print(2 + 3 * 4)',
    options: ["20", "14", "11", "24"],
    answer: 1,
    explain: "Multiplikasjon før addisjon: 3*4=12, +2=14.",
    skills: ["py-variables"],
    difficulty: 1,
  },
  {
    id: "q-py-3",
    kind: "mcq",
    prompt: "Hvilken funksjon leser én linje tekst fra brukeren?",
    options: ["read()", "input()", "scan()", "get()"],
    answer: 1,
    skills: ["py-print-input"],
    difficulty: 1,
  },
  {
    id: "q-py-4",
    kind: "predict",
    prompt: "Hva blir output?",
    code: 'x = 10\nif x > 5:\n    print("A")\nelif x > 8:\n    print("B")\nelse:\n    print("C")',
    options: ["A", "B", "C", "A og B"],
    answer: 0,
    explain: "Første sanne gren kjører — så stopper if/elif.",
    skills: ["py-if"],
    difficulty: 2,
  },
  {
    id: "q-py-5",
    kind: "predict",
    prompt: "Hvor mange ganger skrives 'hei'?",
    code: 'i = 0\nwhile i < 3:\n    print("hei")\n    i += 1',
    options: ["2", "3", "4", "uendelig"],
    answer: 1,
    skills: ["py-while"],
    difficulty: 2,
  },
  {
    id: "q-py-6",
    kind: "predict",
    prompt: "Hva er output?",
    code: 'total = 0\nfor n in [1, 2, 3, 4]:\n    total += n\nprint(total)',
    options: ["10", "6", "4", "24"],
    answer: 0,
    skills: ["py-for"],
    difficulty: 2,
  },
  {
    id: "q-py-7",
    kind: "predict",
    prompt: "Hva returnerer dette?",
    code: 'name = "Ada"\nprint(f"Hei, {name}!")',
    options: ['"Hei, Ada!"', '"Hei, {name}!"', "feil", '"Hei, name!"'],
    answer: 0,
    skills: ["py-string-ops"],
    difficulty: 2,
  },
  {
    id: "q-py-8",
    kind: "predict",
    prompt: "Hva er output?",
    code: 'print("Hello".lower())',
    options: ["Hello", "hello", "HELLO", "feil"],
    answer: 1,
    skills: ["py-string-ops"],
    difficulty: 2,
  },

  // === Python datastrukturer ===
  {
    id: "q-py-9",
    kind: "predict",
    prompt: "Hva er output?",
    code: 'xs = [1, 2, 3]\nprint(xs[1:])',
    options: ["[1, 2]", "[2, 3]", "[1, 2, 3]", "[2]"],
    answer: 1,
    skills: ["py-list-slicing", "py-list"],
    difficulty: 2,
  },
  {
    id: "q-py-10",
    kind: "predict",
    prompt: "Hva returnerer dette?",
    code: 'xs = [10, 20, 30, 40]\nprint(xs[-2])',
    options: ["20", "30", "40", "IndexError"],
    answer: 1,
    skills: ["py-list-slicing"],
    difficulty: 2,
  },
  {
    id: "q-py-11",
    kind: "predict",
    prompt: "Hva blir output?",
    code: 'xs = [1, 2, 3]\nxs.append(4)\nprint(len(xs))',
    options: ["3", "4", "5", "feil"],
    answer: 1,
    skills: ["py-list"],
    difficulty: 2,
  },
  {
    id: "q-py-12",
    kind: "predict",
    prompt: "Hva returnerer len({'a': 1, 'b': 1, 'a': 2})?",
    options: ["3", "2", "1", "TypeError"],
    answer: 1,
    explain: "Nøkkelen 'a' er duplikat — siste verdi vinner, dict har to nøkler.",
    skills: ["py-dict"],
    difficulty: 3,
  },
  {
    id: "q-py-13",
    kind: "predict",
    prompt: "Hva er output?",
    code: 'd = {"a": 1, "b": 2}\nprint(d.get("c", 0))',
    options: ["None", "KeyError", "0", '"c"'],
    answer: 2,
    skills: ["py-dict"],
    difficulty: 3,
  },
  {
    id: "q-py-14",
    kind: "predict",
    prompt: "Hva er output?",
    code: 't = (1, 2, 3)\nt[0] = 9\nprint(t)',
    options: ["(9, 2, 3)", "(1, 2, 3)", "TypeError", "(9,)"],
    answer: 2,
    explain: "Tupler er immutable — kan ikke endres etter opprettelse.",
    skills: ["py-tuple"],
    difficulty: 3,
  },
  {
    id: "q-py-15",
    kind: "predict",
    prompt: "Hva returnerer len({1, 2, 2, 3, 3, 3})?",
    options: ["6", "3", "1", "TypeError"],
    answer: 1,
    skills: ["py-set"],
    difficulty: 3,
  },
  {
    id: "q-py-16",
    kind: "predict",
    prompt: "Hva produserer dette?",
    code: 'print([x*x for x in range(4)])',
    options: ["[1, 4, 9, 16]", "[0, 1, 4, 9]", "[0, 1, 2, 3]", "[1, 2, 3, 4]"],
    answer: 1,
    skills: ["py-comprehension", "py-list"],
    difficulty: 3,
  },

  // === Python funksjoner ===
  {
    id: "q-py-17",
    kind: "predict",
    prompt: "Hva returnerer funksjonen?",
    code: 'def f(x, y=2):\n    return x ** y\nprint(f(3))',
    options: ["3", "6", "9", "feil"],
    answer: 2,
    skills: ["py-functions"],
    difficulty: 3,
  },
  {
    id: "q-py-18",
    kind: "predict",
    prompt: "Hva skrives ut?",
    code: 'x = 1\ndef f():\n    x = 2\nf()\nprint(x)',
    options: ["1", "2", "None", "NameError"],
    answer: 0,
    explain: "x i funksjonen er en lokal variabel — global x påvirkes ikke.",
    skills: ["py-scope"],
    difficulty: 3,
  },
  {
    id: "q-py-19",
    kind: "predict",
    prompt: "Hva returnerer dette?",
    code: 'add = lambda a, b: a + b\nprint(add(2, 3))',
    options: ["5", "23", "(2, 3)", "feil"],
    answer: 0,
    skills: ["py-lambda"],
    difficulty: 3,
  },
  {
    id: "q-py-20",
    kind: "predict",
    prompt: "Hva blir output?",
    code: 'try:\n    1/0\nexcept ZeroDivisionError:\n    print("A")\nfinally:\n    print("B")',
    options: ["A", "B", "A\\nB", "ingen output"],
    answer: 2,
    skills: ["py-exceptions"],
    difficulty: 3,
  },
  {
    id: "q-py-21",
    kind: "predict",
    prompt: "Hva er output?",
    code: 'def f(*args):\n    return sum(args)\nprint(f(1, 2, 3, 4))',
    options: ["10", "4", "feil", "(1, 2, 3, 4)"],
    answer: 0,
    skills: ["py-args-kwargs"],
    difficulty: 4,
  },

  // === Python OOP ===
  {
    id: "q-py-22",
    kind: "predict",
    prompt: "Hva skrives ut?",
    code: 'class Hund:\n    def __init__(self, navn):\n        self.navn = navn\nh = Hund("Rex")\nprint(h.navn)',
    options: ["Rex", "None", "navn", "feil"],
    answer: 0,
    skills: ["py-class", "py-dunder"],
    difficulty: 3,
  },
  {
    id: "q-py-23",
    kind: "mcq",
    prompt: "Hvilken metode kalles automatisk når en klasse instansieres?",
    options: ["__call__", "__init__", "__new__", "__create__"],
    answer: 1,
    skills: ["py-dunder", "py-class"],
    difficulty: 3,
  },
  {
    id: "q-py-24",
    kind: "predict",
    prompt: "Hvilken klasse arver Katt fra?",
    code: 'class Dyr:\n    pass\nclass Katt(Dyr):\n    pass',
    options: ["Katt", "Dyr", "object", "ingen"],
    answer: 1,
    skills: ["py-inheritance"],
    difficulty: 4,
  },

  // === SQL grunnleggende ===
  {
    id: "q-sql-1",
    kind: "mcq",
    prompt: "Hvilken SQL-kommando henter data?",
    options: ["GET", "SELECT", "FETCH", "READ"],
    answer: 1,
    skills: ["sql-select"],
    difficulty: 1,
  },
  {
    id: "q-sql-2",
    kind: "mcq",
    prompt: "Hva henter `SELECT * FROM kunder`?",
    options: [
      "Bare kolonnenavn",
      "Alle rader og alle kolonner",
      "Første rad",
      "Antall rader",
    ],
    answer: 1,
    skills: ["sql-select"],
    difficulty: 1,
  },
  {
    id: "q-sql-3",
    kind: "mcq",
    prompt: "Hvilken klausul filtrerer rader?",
    options: ["FILTER", "HAVING", "WHERE", "IF"],
    answer: 2,
    skills: ["sql-where"],
    difficulty: 1,
  },
  {
    id: "q-sql-4",
    kind: "oneliner",
    prompt: "Skriv én linje SQL som henter alle kunder fra tabellen `kunder` der `alder` er over 30.",
    answer: "SELECT * FROM kunder WHERE alder > 30",
    acceptedAnswers: [
      "SELECT * FROM kunder WHERE alder>30",
      "select * from kunder where alder > 30",
    ],
    skills: ["sql-select", "sql-where"],
    difficulty: 2,
  },
  {
    id: "q-sql-5",
    kind: "mcq",
    prompt: "Hvilken klausul sorterer resultatet?",
    options: ["SORT BY", "ORDER BY", "ARRANGE", "GROUP BY"],
    answer: 1,
    skills: ["sql-order-limit"],
    difficulty: 2,
  },
  {
    id: "q-sql-6",
    kind: "mcq",
    prompt: "Hva gjør `LIMIT 10`?",
    options: [
      "Filtrerer på id < 10",
      "Returnerer maks 10 rader",
      "Hopper over 10 rader",
      "Setter timeout 10s",
    ],
    answer: 1,
    skills: ["sql-order-limit"],
    difficulty: 2,
  },
  {
    id: "q-sql-7",
    kind: "mcq",
    prompt: "Hva gjør `DISTINCT`?",
    options: [
      "Sletter duplikater fra tabellen",
      "Returnerer kun unike verdier",
      "Sorterer rader",
      "Filtrerer NULL",
    ],
    answer: 1,
    skills: ["sql-distinct"],
    difficulty: 2,
  },
  {
    id: "q-sql-8",
    kind: "mcq",
    prompt: "Hvordan finner du rader der `epost` mangler?",
    options: [
      "WHERE epost = NULL",
      "WHERE epost == NULL",
      "WHERE epost IS NULL",
      "WHERE epost = ''",
    ],
    answer: 2,
    skills: ["sql-null"],
    difficulty: 2,
  },
  {
    id: "q-sql-9",
    kind: "mcq",
    prompt: "Hvilken kommando legger til en ny rad?",
    options: ["ADD ROW", "INSERT INTO", "PUSH", "CREATE ROW"],
    answer: 1,
    skills: ["sql-insert-update-delete"],
    difficulty: 2,
  },
  {
    id: "q-sql-10",
    kind: "mcq",
    prompt: "Hvilken kommando endrer eksisterende data?",
    options: ["MODIFY", "CHANGE", "UPDATE", "ALTER"],
    answer: 2,
    skills: ["sql-insert-update-delete"],
    difficulty: 2,
  },

  // === SQL joins ===
  {
    id: "q-sql-11",
    kind: "mcq",
    prompt: "Hvilken JOIN-type returnerer alle rader fra venstre tabell, og NULL der det ikke finnes match?",
    options: ["INNER JOIN", "LEFT JOIN", "CROSS JOIN", "FULL JOIN"],
    answer: 1,
    skills: ["sql-left-join"],
    difficulty: 3,
  },
  {
    id: "q-sql-12",
    kind: "mcq",
    prompt: "Hva gjør INNER JOIN?",
    options: [
      "Returnerer alle rader fra begge tabeller",
      "Returnerer kun rader med match i begge tabeller",
      "Returnerer kun venstre side",
      "Lager kartesisk produkt",
    ],
    answer: 1,
    skills: ["sql-inner-join"],
    difficulty: 3,
  },
  {
    id: "q-sql-13",
    kind: "oneliner",
    prompt: "Skriv en INNER JOIN mellom `ordre o` og `kunder k` på `o.kunde_id = k.id`. (Bare ON-betingelsen og JOIN-syntaks, ingen SELECT.)",
    answer: "FROM ordre o INNER JOIN kunder k ON o.kunde_id = k.id",
    acceptedAnswers: [
      "FROM ordre o JOIN kunder k ON o.kunde_id = k.id",
      "from ordre o inner join kunder k on o.kunde_id = k.id",
      "from ordre o join kunder k on o.kunde_id = k.id",
    ],
    skills: ["sql-inner-join"],
    difficulty: 3,
  },
  {
    id: "q-sql-14",
    kind: "mcq",
    prompt: "Hva er en self-join?",
    options: [
      "En join uten ON-klausul",
      "En tabell som joiner mot seg selv",
      "En join på primær­nøkkel",
      "Synonym for INNER JOIN",
    ],
    answer: 1,
    skills: ["sql-self-join"],
    difficulty: 4,
  },

  // === SQL aggregering ===
  {
    id: "q-sql-15",
    kind: "mcq",
    prompt: "Hvilken funksjon teller antall rader?",
    options: ["SUM(*)", "COUNT(*)", "TOTAL(*)", "ROWS(*)"],
    answer: 1,
    skills: ["sql-agg"],
    difficulty: 2,
  },
  {
    id: "q-sql-16",
    kind: "mcq",
    prompt: "Hvilken klausul grupperer rader for aggregering?",
    options: ["GROUP BY", "ORDER BY", "PARTITION BY", "CLUSTER BY"],
    answer: 0,
    skills: ["sql-group-by"],
    difficulty: 3,
  },
  {
    id: "q-sql-17",
    kind: "mcq",
    prompt: "Hvor brukes HAVING?",
    options: [
      "Filtrerer rader før gruppering",
      "Filtrerer grupper etter GROUP BY",
      "Erstatter WHERE",
      "Joiner tabeller",
    ],
    answer: 1,
    skills: ["sql-having", "sql-group-by"],
    difficulty: 3,
  },
  {
    id: "q-sql-18",
    kind: "oneliner",
    prompt: "Skriv: Hent kunde_id og antall ordre per kunde fra tabellen `ordre`. (Hele setningen.)",
    answer: "SELECT kunde_id, COUNT(*) FROM ordre GROUP BY kunde_id",
    acceptedAnswers: [
      "select kunde_id, count(*) from ordre group by kunde_id",
      "SELECT kunde_id, COUNT(*) FROM ordre GROUP BY 1",
    ],
    skills: ["sql-group-by", "sql-agg"],
    difficulty: 3,
  },
  {
    id: "q-sql-19",
    kind: "mcq",
    prompt: "En subquery er ...",
    options: [
      "En SELECT inni en annen SELECT/WHERE/FROM",
      "En SQL-fil som inkluderes",
      "En lagret prosedyre",
      "En type JOIN",
    ],
    answer: 0,
    skills: ["sql-subquery"],
    difficulty: 4,
  },

  // === SQL modellering / DDL ===
  {
    id: "q-sql-20",
    kind: "mcq",
    prompt: "Hvilken kommando oppretter en ny tabell?",
    options: ["NEW TABLE", "CREATE TABLE", "MAKE TABLE", "ADD TABLE"],
    answer: 1,
    skills: ["sql-create-table"],
    difficulty: 3,
  },
  {
    id: "q-sql-21",
    kind: "mcq",
    prompt: "Hva er en PRIMARY KEY?",
    options: [
      "En kolonne som kan være NULL",
      "En kolonne som er unik og identifiserer en rad",
      "Et synonym for indeks",
      "En referanse til en annen tabell",
    ],
    answer: 1,
    skills: ["sql-primary-foreign"],
    difficulty: 3,
  },
  {
    id: "q-sql-22",
    kind: "mcq",
    prompt: "En FOREIGN KEY ...",
    options: [
      "Er en kopi av PRIMARY KEY",
      "Refererer til PRIMARY KEY i en annen tabell",
      "Er alltid auto-increment",
      "Tillater duplikater",
    ],
    answer: 1,
    skills: ["sql-primary-foreign"],
    difficulty: 3,
  },
  {
    id: "q-sql-23",
    kind: "mcq",
    prompt: "Hva er 3. normalform (3NF) — kort?",
    options: [
      "Ingen multiverdier i kolonner",
      "Ingen delvis avhengighet av sammensatt nøkkel",
      "Ingen transitiv avhengighet — ikke-nøkkel-kolonner avhenger kun av nøkkelen",
      "Alle kolonner er indeksert",
    ],
    answer: 2,
    skills: ["sql-normalization"],
    difficulty: 4,
  },
  {
    id: "q-sql-24",
    kind: "mcq",
    prompt: "Hva representerer en rombe i et ER-diagram (Chen-notasjon)?",
    options: ["Entitet", "Attributt", "Relasjon", "Primær­nøkkel"],
    answer: 2,
    skills: ["sql-er"],
    difficulty: 3,
  },

  // === Linux shell ===
  {
    id: "q-sh-1",
    kind: "mcq",
    prompt: "Hvilken kommando viser nåværende mappe?",
    options: ["cwd", "pwd", "dir", "where"],
    answer: 1,
    skills: ["shell-navigation"],
    difficulty: 1,
  },
  {
    id: "q-sh-2",
    kind: "mcq",
    prompt: "Hva gjør `cd ..`?",
    options: [
      "Går til hjemmemappen",
      "Går én mappe opp",
      "Lister filer",
      "Lukker terminalen",
    ],
    answer: 1,
    skills: ["shell-navigation"],
    difficulty: 1,
  },
  {
    id: "q-sh-3",
    kind: "mcq",
    prompt: "Hvilken kommando oppretter en ny mappe?",
    options: ["newdir", "mkdir", "makedir", "createfolder"],
    answer: 1,
    skills: ["shell-files"],
    difficulty: 2,
  },
  {
    id: "q-sh-4",
    kind: "mcq",
    prompt: "Hva gjør `rm -r mappe/`?",
    options: [
      "Sletter mappe rekursivt med alt innhold",
      "Gir read-only",
      "Sletter kun tomme mapper",
      "Flytter mappe til papirkurv",
    ],
    answer: 0,
    skills: ["shell-files"],
    difficulty: 3,
  },
  {
    id: "q-sh-5",
    kind: "mcq",
    prompt: "Hva gjør `ls -la | grep test`?",
    options: [
      "Lister filer i mappen `test`",
      "Lister alle filer og filtrerer linjer som inneholder 'test'",
      "Sletter filer som matcher 'test'",
      "Søker etter filen 'test' rekursivt",
    ],
    answer: 1,
    skills: ["shell-pipes", "shell-grep"],
    difficulty: 3,
  },
  {
    id: "q-sh-6",
    kind: "mcq",
    prompt: "Hva gjør `>` i bash, som i `echo hei > fil.txt`?",
    options: [
      "Sammenligner",
      "Appender til fil",
      "Overskriver fil med output",
      "Pipe til kommando",
    ],
    answer: 2,
    skills: ["shell-pipes"],
    difficulty: 3,
  },

  // === Linux permissions ===
  {
    id: "q-sh-7",
    kind: "mcq",
    prompt: "Hva betyr `chmod 755 fil.sh`?",
    options: [
      "Eier: rwx, gruppe: r-x, andre: r-x",
      "Eier: rwx, gruppe: rwx, andre: r--",
      "Eier: r-x, gruppe: rwx, andre: rwx",
      "Setter eier til bruker 755",
    ],
    answer: 0,
    explain: "7=rwx, 5=r-x. Rekkefølge: eier, gruppe, andre.",
    skills: ["shell-chmod"],
    difficulty: 3,
  },
  {
    id: "q-sh-8",
    kind: "mcq",
    prompt: "Hva gjør `chown isak fil.txt`?",
    options: [
      "Endrer rettigheter",
      "Endrer eier av fil til 'isak'",
      "Sletter eier-info",
      "Setter passord",
    ],
    answer: 1,
    skills: ["shell-chown"],
    difficulty: 3,
  },

  // === Git ===
  {
    id: "q-git-1",
    kind: "mcq",
    prompt: "Hvilken kommando initialiserer et nytt git-repository?",
    options: ["git start", "git new", "git init", "git create"],
    answer: 2,
    skills: ["git-basics"],
    difficulty: 2,
  },
  {
    id: "q-git-2",
    kind: "mcq",
    prompt: "Hva gjør `git add .`?",
    options: [
      "Committer alle endringer",
      "Legger alle endrede filer til staging",
      "Henter siste endringer fra remote",
      "Lager en ny branch",
    ],
    answer: 1,
    skills: ["git-basics"],
    difficulty: 2,
  },
  {
    id: "q-git-3",
    kind: "mcq",
    prompt: "Hva gjør `git merge feature`?",
    options: [
      "Sletter branchen 'feature'",
      "Fletter 'feature' inn i nåværende branch",
      "Bytter til 'feature'",
      "Lager en ny branch fra 'feature'",
    ],
    answer: 1,
    skills: ["git-branch-merge"],
    difficulty: 3,
  },
  {
    id: "q-git-4",
    kind: "mcq",
    prompt: "Hva gjør `git push`?",
    options: [
      "Sender lokale commits til remote",
      "Henter remote commits",
      "Sletter remote branch",
      "Lager commit",
    ],
    answer: 0,
    skills: ["git-remote"],
    difficulty: 3,
  },
  {
    id: "q-git-5",
    kind: "mcq",
    prompt: "Hva gjør `git revert <sha>`?",
    options: [
      "Sletter commit fra historikken",
      "Lager en ny commit som reverserer endringene",
      "Resetter HEAD til den committen",
      "Endrer commit-meldingen",
    ],
    answer: 1,
    skills: ["git-undo"],
    difficulty: 4,
  },

  // === Nettverk ===
  {
    id: "q-net-1",
    kind: "oneliner",
    prompt: "Hvor mange bit har en IPv4-adresse? (Bare tallet.)",
    answer: "32",
    skills: ["net-ipv4"],
    difficulty: 2,
  },
  {
    id: "q-net-2",
    kind: "mcq",
    prompt: "Hva er gyldig IPv4-adresse?",
    options: ["192.168.1.300", "10.0.0.1", "256.0.0.1", "192.168.1"],
    answer: 1,
    skills: ["net-ipv4"],
    difficulty: 2,
  },
  {
    id: "q-net-3",
    kind: "mcq",
    prompt: "På hvilket lag i OSI-modellen ligger TCP?",
    options: ["Nettverkslaget (3)", "Transportlaget (4)", "Sesjonslaget (5)", "Applikasjonslaget (7)"],
    answer: 1,
    skills: ["net-osi", "net-tcp-udp"],
    difficulty: 3,
  },
  {
    id: "q-net-4",
    kind: "mcq",
    prompt: "Hva betyr HTTP-status 404?",
    options: ["Server feil", "OK", "Ikke funnet", "Omdirigering"],
    answer: 2,
    skills: ["net-http"],
    difficulty: 2,
  },
  {
    id: "q-net-5",
    kind: "mcq",
    prompt: "Hva betyr HTTP-status 200?",
    options: ["Ikke funnet", "OK", "Forbudt", "Created"],
    answer: 1,
    skills: ["net-http"],
    difficulty: 2,
  },
  {
    id: "q-net-6",
    kind: "mcq",
    prompt: "Hva gjør DNS?",
    options: [
      "Krypterer trafikk",
      "Oversetter domenenavn til IP-adresser",
      "Tildeler dynamiske IP-er",
      "Sender e-post",
    ],
    answer: 1,
    skills: ["net-dns"],
    difficulty: 3,
  },
  {
    id: "q-net-7",
    kind: "mcq",
    prompt: "Hovedforskjell mellom TCP og UDP?",
    options: [
      "TCP er kryptert, UDP er ikke",
      "TCP er forbindelses-orientert/pålitelig, UDP er forbindelsesløst/upålitelig",
      "TCP er raskere enn UDP",
      "UDP brukes til web, TCP til video",
    ],
    answer: 1,
    skills: ["net-tcp-udp"],
    difficulty: 3,
  },

  // === Algoritmer ===
  {
    id: "q-alg-1",
    kind: "oneliner",
    prompt: "Forklar `O(n log n)` med ett ord (norsk eller engelsk — f.eks. type sortering).",
    answer: "merge sort",
    acceptedAnswers: [
      "mergesort",
      "merge-sort",
      "quicksort",
      "quick sort",
      "log-lineær",
      "log lineær",
      "loglineær",
      "linearitmisk",
    ],
    explain: "Typisk for effektive sammenligning-baserte sortering: merge sort, quicksort (gj.snitt), heap sort.",
    skills: ["alg-bigo", "alg-sort"],
    difficulty: 4,
  },
  {
    id: "q-alg-2",
    kind: "mcq",
    prompt: "Hva er Big-O for binær søk i sortert array av n elementer?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    answer: 1,
    skills: ["alg-bigo", "alg-search"],
    difficulty: 4,
  },
  {
    id: "q-alg-3",
    kind: "mcq",
    prompt: "Hva er Big-O for lineær søk?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
    answer: 2,
    skills: ["alg-bigo", "alg-search"],
    difficulty: 3,
  },
  {
    id: "q-alg-4",
    kind: "predict",
    prompt: "Hva returnerer denne rekursive funksjonen for fakultet(4)?",
    code: 'def fakultet(n):\n    if n <= 1: return 1\n    return n * fakultet(n - 1)',
    options: ["12", "16", "24", "uendelig løkke"],
    answer: 2,
    skills: ["alg-recursion"],
    difficulty: 4,
  },

  // === Web ===
  {
    id: "q-web-1",
    kind: "mcq",
    prompt: "Hva står HTML for?",
    options: [
      "HyperText Markup Language",
      "HighTech Modern Layout",
      "Home Tool Markup Language",
      "Hyperlink Text Module Language",
    ],
    answer: 0,
    skills: ["web-html"],
    difficulty: 1,
  },
  {
    id: "q-web-2",
    kind: "mcq",
    prompt: "Hvilken CSS-selektor matcher elementet med id 'main'?",
    options: [".main", "#main", "main", "*main"],
    answer: 1,
    skills: ["web-css"],
    difficulty: 2,
  },
  {
    id: "q-web-3",
    kind: "predict",
    prompt: "Hva returnerer dette i JavaScript?",
    code: 'console.log(typeof null);',
    options: ['"null"', '"object"', '"undefined"', '"none"'],
    answer: 1,
    explain: "Klassisk JS-quirk: typeof null === 'object'.",
    skills: ["web-js-basic"],
    difficulty: 3,
  },
  {
    id: "q-web-4",
    kind: "mcq",
    prompt: "Hva er gyldig JSON?",
    options: [
      "{name: 'Ada'}",
      '{"name": "Ada"}',
      "{name: \"Ada\",}",
      "<name>Ada</name>",
    ],
    answer: 1,
    skills: ["web-json"],
    difficulty: 2,
  },

  // === Verktoy ===
  {
    id: "q-tool-1",
    kind: "mcq",
    prompt: "Hva gjør `python -m venv .venv`?",
    options: [
      "Installerer Python",
      "Oppretter et virtuelt miljø i mappen .venv",
      "Aktiverer eksisterende venv",
      "Lister installerte pakker",
    ],
    answer: 1,
    skills: ["tool-venv"],
    difficulty: 3,
  },
  {
    id: "q-tool-2",
    kind: "mcq",
    prompt: "Hva er en Docker-image?",
    options: [
      "En kjørende kontainer",
      "En lesbar mal som kontainere lages fra",
      "Et virtuelt nettverk",
      "Et filsystem-mount",
    ],
    answer: 1,
    skills: ["tool-docker"],
    difficulty: 4,
  },
];

/* ----------------------------------------------------------------------------
 * Adaptiv algoritme
 * ------------------------------------------------------------------------- */

export const TARGET_QUESTIONS_MIN = 25;
export const TARGET_QUESTIONS_MAX = 35;
export const START_DIFFICULTY = 3;

interface AdaptiveState {
  /** Spørsmål som er besvart. */
  asked: Set<string>;
  /** Nåværende ønsket vanskelighetsgrad. */
  currentDifficulty: number;
  /** Per skill: antall observasjoner. */
  observations: Map<string, number>;
}

export function createAdaptiveState(): AdaptiveState {
  return {
    asked: new Set(),
    currentDifficulty: START_DIFFICULTY,
    observations: new Map(),
  };
}

/**
 * Velger neste spørsmål basert på adaptive state.
 * Strategi: Foretrekk spørsmål nær `currentDifficulty` som tester skills med
 * færrest observasjoner. Returnerer `null` når vi er ferdige.
 */
export function nextQuestion(
  state: AdaptiveState,
  answers: DiagnoseAnswer[],
): DiagnoseQuestion | null {
  if (answers.length >= TARGET_QUESTIONS_MAX) return null;

  // Stopp-kriterie: hvis vi har > min-antall og alle hoved-områder har minst
  // 2 observasjoner, kan vi stoppe.
  if (answers.length >= TARGET_QUESTIONS_MIN) {
    const areaObservations = new Map<string, number>();
    for (const a of answers) {
      for (const sid of a.skills) {
        const skill = SKILLS.find((s) => s.id === sid);
        if (!skill) continue;
        areaObservations.set(skill.area, (areaObservations.get(skill.area) ?? 0) + 1);
      }
    }
    const coveredAreas = Array.from(areaObservations.values()).filter((n) => n >= 2).length;
    if (coveredAreas >= 10) return null;
  }

  const candidates = QUESTIONS.filter((q) => !state.asked.has(q.id));
  if (candidates.length === 0) return null;

  // Score: lavere er bedre.
  //  - Avstand fra current difficulty (sterk vekt)
  //  - Negativ rabatt for skills med få observasjoner
  const scored = candidates.map((q) => {
    const diffPenalty = Math.abs(q.difficulty - state.currentDifficulty) * 10;
    const minObs = Math.min(
      ...q.skills.map((s) => state.observations.get(s) ?? 0),
    );
    const obsBonus = -Math.max(0, 3 - minObs) * 5; // prioriter skills med < 3 obs
    const jitter = Math.random() * 3; // litt variasjon så det ikke alltid blir samme spm
    return { q, score: diffPenalty + obsBonus + jitter };
  });

  scored.sort((a, b) => a.score - b.score);
  return scored[0].q;
}

export function recordAnswer(
  state: AdaptiveState,
  question: DiagnoseQuestion,
  answer: DiagnoseAnswer,
): void {
  state.asked.add(question.id);
  for (const sid of question.skills) {
    state.observations.set(sid, (state.observations.get(sid) ?? 0) + 1);
  }
  // Justér vanskelighetsgrad. Hopp-over teller som feil men med mindre justering.
  if (answer.skipped) {
    state.currentDifficulty = Math.max(1, state.currentDifficulty - 0.5);
  } else if (answer.correct) {
    state.currentDifficulty = Math.min(5, state.currentDifficulty + 0.7);
  } else {
    state.currentDifficulty = Math.max(1, state.currentDifficulty - 0.8);
  }
}

/* ----------------------------------------------------------------------------
 * Sjekk svar
 * ------------------------------------------------------------------------- */

export function checkAnswer(
  question: DiagnoseQuestion,
  given: string | number,
): boolean {
  if (question.kind === "oneliner") {
    if (typeof given !== "string") return false;
    const norm = (s: string) =>
      s
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ")
        .replace(/[;]+$/g, "");
    const target = norm(String(question.answer));
    if (norm(given) === target) return true;
    if (question.acceptedAnswers) {
      return question.acceptedAnswers.some((a) => norm(given) === norm(a));
    }
    return false;
  }
  return given === question.answer;
}

/* ----------------------------------------------------------------------------
 * Beregn resultat
 * ------------------------------------------------------------------------- */

/**
 * Bruker en enkel IRT-inspirert utregning: per skill, ratingen er
 * (sum av vanskelighetsgrad * 20 for riktig svar) / (sum vanskelighetsgrad).
 * Hopp-over teller med halv vekt og som feil.
 */
export function computeResult(answers: DiagnoseAnswer[]): DiagnoseResult {
  const skillAgg = new Map<string, { weighted: number; total: number; obs: number }>();
  for (const a of answers) {
    for (const sid of a.skills) {
      const cur = skillAgg.get(sid) ?? { weighted: 0, total: 0, obs: 0 };
      const weight = a.skipped ? 0.5 : 1;
      const score = a.correct ? 1 : 0;
      cur.weighted += a.difficulty * weight * score;
      cur.total += a.difficulty * weight;
      cur.obs += 1;
      skillAgg.set(sid, cur);
    }
  }

  const skillRatings: Record<string, { rating: number; observations: number }> = {};
  for (const [sid, v] of skillAgg.entries()) {
    const rating = v.total > 0 ? Math.round((v.weighted / v.total) * 100) : 0;
    skillRatings[sid] = { rating, observations: v.obs };
  }

  // Per fag-område: gjennomsnitt vektet av observasjoner.
  const areaAgg = new Map<SkillArea, { sum: number; weight: number; obs: number }>();
  for (const sid of Object.keys(skillRatings)) {
    const skill = SKILLS.find((s) => s.id === sid);
    if (!skill) continue;
    const cur = areaAgg.get(skill.area) ?? { sum: 0, weight: 0, obs: 0 };
    const w = skillRatings[sid].observations;
    cur.sum += skillRatings[sid].rating * w;
    cur.weight += w;
    cur.obs += w;
    areaAgg.set(skill.area, cur);
  }

  const areaRatings = {} as Record<SkillArea, { rating: number; observations: number }>;
  for (const [area, v] of areaAgg.entries()) {
    areaRatings[area] = {
      rating: v.weight > 0 ? Math.round(v.sum / v.weight) : 0,
      observations: v.obs,
    };
  }

  return {
    skillRatings,
    areaRatings,
    takenAt: new Date().toISOString(),
  };
}

/**
 * Topp 3 fag-områder å fokusere på:
 * lavt rating + nok observasjoner til å være tillitsverdig.
 */
export function topFocusAreas(
  result: DiagnoseResult,
  n = 3,
): { area: SkillArea; rating: number; observations: number }[] {
  return Object.entries(result.areaRatings)
    .filter(([, v]) => v.observations >= 1)
    .map(([area, v]) => ({ area: area as SkillArea, rating: v.rating, observations: v.observations }))
    .sort((a, b) => {
      // Lavt rating først; ved tie, flere observasjoner først.
      if (a.rating !== b.rating) return a.rating - b.rating;
      return b.observations - a.observations;
    })
    .slice(0, n);
}
