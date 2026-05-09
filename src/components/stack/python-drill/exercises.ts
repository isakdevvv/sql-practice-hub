// Eksamens-drill: Python-oppgaver. Hver oppgave har starter-kode, fasit og
// forventet stdout. Solutions er testet for å produsere expectedOutput eksakt
// (etter trim av trailing whitespace).

export interface Exercise {
  id: string;
  title: string;
  description: string;
  starterCode: string;
  expectedOutput: string;
  hints: string[];
  solution: string;
}

export const EXERCISES: Exercise[] = [
  {
    id: "ansatte-it",
    title: "1. Filtrer ansatte etter avdeling og lønn",
    description:
      "Gitt en liste med ansatte-dictionaries: lag en liste over navn (i STORE BOKSTAVER) på alle ansatte i IT-avdelingen som tjener mer enn 600 000.",
    starterCode: `ansatte = [
    {"navn": "Kari", "avdeling": "IT", "lønn": 620000},
    {"navn": "Ola", "avdeling": "HR", "lønn": 540000},
    {"navn": "Lise", "avdeling": "IT", "lønn": 710000},
    {"navn": "Per", "avdeling": "HR", "lønn": 490000},
    {"navn": "Anne", "avdeling": "IT", "lønn": 580000},
]

liste_it = []

# Skriv koden din her


print(liste_it)
`,
    expectedOutput: "['KARI', 'LISE']",
    hints: [
      "Iterer over `ansatte` med en for-løkke. Sjekk to betingelser i én if-setning med `and`.",
      "Bruk `.upper()` på navnet før du legger det til i `liste_it`.",
    ],
    solution: `ansatte = [
    {"navn": "Kari", "avdeling": "IT", "lønn": 620000},
    {"navn": "Ola", "avdeling": "HR", "lønn": 540000},
    {"navn": "Lise", "avdeling": "IT", "lønn": 710000},
    {"navn": "Per", "avdeling": "HR", "lønn": 490000},
    {"navn": "Anne", "avdeling": "IT", "lønn": 580000},
]

liste_it = []

for ansatt in ansatte:
    if ansatt["avdeling"] == "IT" and ansatt["lønn"] > 600000:
        liste_it.append(ansatt["navn"].upper())

print(liste_it)
`,
  },
  {
    id: "produkter-tilgjengelig",
    title: "2. Tilgjengelige produkter som dictionary",
    description:
      "Lag en dictionary `tilgjengelig` der nøkkelen er produkt-ID og verdien er produktnavnet — men kun for produkter som er på lager (lager > 0) OG koster under 1000 kr.",
    starterCode: `produkter = [
    {"id": "A101", "navn": "Tastatur", "pris": 899, "lager": 12},
    {"id": "B205", "navn": "Skjerm", "pris": 4990, "lager": 0},
    {"id": "C310", "navn": "Mus", "pris": 449, "lager": 34},
    {"id": "D412", "navn": "Headset", "pris": 1299, "lager": 0},
    {"id": "E517", "navn": "Webkamera", "pris": 699, "lager": 7},
]

tilgjengelig = {}

# Skriv koden din her


print(tilgjengelig)
`,
    expectedOutput: "{'A101': 'Tastatur', 'C310': 'Mus', 'E517': 'Webkamera'}",
    hints: [
      "Du kan løse det med en for-løkke: `tilgjengelig[produkt[\"id\"]] = produkt[\"navn\"]`.",
      "Eller med dict comprehension: `{p[\"id\"]: p[\"navn\"] for p in produkter if ...}`.",
    ],
    solution: `produkter = [
    {"id": "A101", "navn": "Tastatur", "pris": 899, "lager": 12},
    {"id": "B205", "navn": "Skjerm", "pris": 4990, "lager": 0},
    {"id": "C310", "navn": "Mus", "pris": 449, "lager": 34},
    {"id": "D412", "navn": "Headset", "pris": 1299, "lager": 0},
    {"id": "E517", "navn": "Webkamera", "pris": 699, "lager": 7},
]

tilgjengelig = {
    p["id"]: p["navn"]
    for p in produkter
    if p["lager"] > 0 and p["pris"] < 1000
}

print(tilgjengelig)
`,
  },
  {
    id: "matrise-odde",
    title: "3. Odde tall fra en matrise",
    description:
      "Du får en 2D-liste (matrise). Lag en flat liste `odde_tall` som inneholder bare oddetallene — i samme rekkefølge som de står i matrisen.",
    starterCode: `matrise = [
    [1, 2, 3, 4],
    [5, 6, 7, 8],
    [9, 10, 11, 12],
]

odde_tall = []

# Skriv koden din her


print(odde_tall)
`,
    expectedOutput: "[1, 3, 5, 7, 9, 11]",
    hints: [
      "Du trenger to nøstede for-løkker: én for radene, én for tallene i hver rad.",
      "Et tall er oddetall hvis `tall % 2 != 0`.",
    ],
    solution: `matrise = [
    [1, 2, 3, 4],
    [5, 6, 7, 8],
    [9, 10, 11, 12],
]

odde_tall = []

for rad in matrise:
    for tall in rad:
        if tall % 2 != 0:
            odde_tall.append(tall)

print(odde_tall)
`,
  },
  {
    id: "logger-feil-ip",
    title: "4. Unike feil-IP-er fra logg",
    description:
      "Gitt en liste med loggmeldinger på formatet `\"NIVÅ IP melding\"`. Finn alle unike IP-er som har minst én ERROR-melding. Behold rekkefølgen IP-en først dukker opp i.",
    starterCode: `logger = [
    "ERROR 192.168.1.1 disk full",
    "WARNING 192.168.1.2 high load",
    "ERROR 192.168.1.1 disk full",
    "INFO 192.168.1.3 backup ok",
    "ERROR 192.168.1.4 timeout",
    "WARNING 192.168.1.2 high load",
    "ERROR 192.168.1.1 disk full",
]

feil_ip = []

# Skriv koden din her


for ip in feil_ip:
    print(ip)
`,
    expectedOutput: "192.168.1.1\n192.168.1.4",
    hints: [
      "Bruk `.split()` på loggteksten — IP-en blir element 1 i listen.",
      "Sjekk at IP ikke allerede ligger i `feil_ip` før du legger den til, så unngår du duplikater.",
    ],
    solution: `logger = [
    "ERROR 192.168.1.1 disk full",
    "WARNING 192.168.1.2 high load",
    "ERROR 192.168.1.1 disk full",
    "INFO 192.168.1.3 backup ok",
    "ERROR 192.168.1.4 timeout",
    "WARNING 192.168.1.2 high load",
    "ERROR 192.168.1.1 disk full",
]

feil_ip = []

for log in logger:
    if "ERROR" in log:
        deler = log.split()
        ip = deler[1]
        if ip not in feil_ip:
            feil_ip.append(ip)

for ip in feil_ip:
    print(ip)
`,
  },
  {
    id: "bestillinger-per-kunde",
    title: "5. Tell bestillinger per kunde",
    description:
      "Gitt en liste over bestillinger. Lag en dictionary `antall` der nøkkel er kundenavn og verdi er antall bestillinger den kunden har gjort.",
    starterCode: `bestillinger = [
    {"kunde": "Ola", "belop": 250},
    {"kunde": "Kari", "belop": 1200},
    {"kunde": "Ola", "belop": 90},
    {"kunde": "Per", "belop": 540},
    {"kunde": "Kari", "belop": 75},
    {"kunde": "Ola", "belop": 320},
]

antall = {}

# Skriv koden din her


print(antall)
`,
    expectedOutput: "{'Ola': 3, 'Kari': 2, 'Per': 1}",
    hints: [
      "For hver bestilling: hent ut kundenavnet, og legg det til i `antall`.",
      "`antall[kunde] = antall.get(kunde, 0) + 1` er en typisk idiom for telling.",
    ],
    solution: `bestillinger = [
    {"kunde": "Ola", "belop": 250},
    {"kunde": "Kari", "belop": 1200},
    {"kunde": "Ola", "belop": 90},
    {"kunde": "Per", "belop": 540},
    {"kunde": "Kari", "belop": 75},
    {"kunde": "Ola", "belop": 320},
]

antall = {}

for b in bestillinger:
    kunde = b["kunde"]
    antall[kunde] = antall.get(kunde, 0) + 1

print(antall)
`,
  },
  {
    id: "snitt-per-kategori",
    title: "6. Snittpris per kategori",
    description:
      "Beregn gjennomsnittsprisen per kategori. Resultatet skal være en dictionary `snitt` der nøkkel er kategori og verdi er snittprisen som flyttall (uten avrunding).",
    starterCode: `produkter = [
    {"navn": "Tastatur", "kategori": "tilbehør", "pris": 800},
    {"navn": "Mus", "kategori": "tilbehør", "pris": 400},
    {"navn": "Skjerm", "kategori": "skjerm", "pris": 5000},
    {"navn": "Webkamera", "kategori": "tilbehør", "pris": 600},
    {"navn": "Curved", "kategori": "skjerm", "pris": 7000},
]

snitt = {}

# Skriv koden din her


print(snitt)
`,
    expectedOutput: "{'tilbehør': 600.0, 'skjerm': 6000.0}",
    hints: [
      "Bygg først to dicts: én med totalsum per kategori, én med antall per kategori.",
      "Del sum / antall for hver kategori. Bruk vanlig divisjon (`/`) for å få et flyttall.",
    ],
    solution: `produkter = [
    {"navn": "Tastatur", "kategori": "tilbehør", "pris": 800},
    {"navn": "Mus", "kategori": "tilbehør", "pris": 400},
    {"navn": "Skjerm", "kategori": "skjerm", "pris": 5000},
    {"navn": "Webkamera", "kategori": "tilbehør", "pris": 600},
    {"navn": "Curved", "kategori": "skjerm", "pris": 7000},
]

sum_per = {}
antall_per = {}

for p in produkter:
    k = p["kategori"]
    sum_per[k] = sum_per.get(k, 0) + p["pris"]
    antall_per[k] = antall_per.get(k, 0) + 1

snitt = {k: sum_per[k] / antall_per[k] for k in sum_per}

print(snitt)
`,
  },
  {
    id: "top-3-dyreste",
    title: "7. Topp-3 dyreste produkter",
    description:
      "Sorter produktene synkende på pris og hent navnet på de tre dyreste. Resultatet skal være en liste `topp3` med produktnavn.",
    starterCode: `produkter = [
    {"navn": "Tastatur", "pris": 899},
    {"navn": "Mus", "pris": 449},
    {"navn": "Skjerm", "pris": 4990},
    {"navn": "Headset", "pris": 1299},
    {"navn": "Webkamera", "pris": 699},
    {"navn": "Curved", "pris": 7990},
    {"navn": "Pad", "pris": 199},
]

topp3 = []

# Skriv koden din her


print(topp3)
`,
    expectedOutput: "['Curved', 'Skjerm', 'Headset']",
    hints: [
      "Bruk `sorted(produkter, key=lambda p: p[\"pris\"], reverse=True)` for å sortere synkende.",
      "Slik du har en sortert liste — ta de tre første og hent ut `navn`.",
    ],
    solution: `produkter = [
    {"navn": "Tastatur", "pris": 899},
    {"navn": "Mus", "pris": 449},
    {"navn": "Skjerm", "pris": 4990},
    {"navn": "Headset", "pris": 1299},
    {"navn": "Webkamera", "pris": 699},
    {"navn": "Curved", "pris": 7990},
    {"navn": "Pad", "pris": 199},
]

sortert = sorted(produkter, key=lambda p: p["pris"], reverse=True)
topp3 = [p["navn"] for p in sortert[:3]]

print(topp3)
`,
  },
  {
    id: "parse-csv-strenger",
    title: "8. Parse CSV-strenger til dict-er",
    description:
      "Du får en liste med strenger på formatet `\"navn,alder,by\"`. Konverter dem til en liste med dictionaries der `alder` er et heltall (int).",
    starterCode: `linjer = [
    "Ola,34,Oslo",
    "Kari,28,Bergen",
    "Per,41,Trondheim",
]

personer = []

# Skriv koden din her


print(personer)
`,
    expectedOutput:
      "[{'navn': 'Ola', 'alder': 34, 'by': 'Oslo'}, {'navn': 'Kari', 'alder': 28, 'by': 'Bergen'}, {'navn': 'Per', 'alder': 41, 'by': 'Trondheim'}]",
    hints: [
      "For hver linje: `linje.split(\",\")` gir tre deler.",
      "Husk å konvertere alderen med `int(...)` — ellers blir den en streng.",
    ],
    solution: `linjer = [
    "Ola,34,Oslo",
    "Kari,28,Bergen",
    "Per,41,Trondheim",
]

personer = []

for linje in linjer:
    deler = linje.split(",")
    personer.append({
        "navn": deler[0],
        "alder": int(deler[1]),
        "by": deler[2],
    })

print(personer)
`,
  },
  {
    id: "grupper-anagrammer",
    title: "9. Grupper anagrammer",
    description:
      "Gitt en liste med ord. Grupper ord som er anagrammer av hverandre (samme bokstaver, ulik rekkefølge). Resultatet skal være en dictionary der nøkkelen er en sortert bokstav-streng og verdien er listen med ord.",
    starterCode: `ord_liste = ["are", "era", "ear", "tea", "eat", "ate", "kake"]

grupper = {}

# Skriv koden din her


print(grupper)
`,
    expectedOutput:
      "{'aer': ['are', 'era', 'ear'], 'aet': ['tea', 'eat', 'ate'], 'aekk': ['kake']}",
    hints: [
      "Bruk `\"\".join(sorted(ord))` som nøkkel — to anagrammer får samme sortert nøkkel.",
      "Sjekk om nøkkelen finnes i `grupper`. Hvis ikke: legg til en tom liste først.",
    ],
    solution: `ord_liste = ["are", "era", "ear", "tea", "eat", "ate", "kake"]

grupper = {}

for ord_ in ord_liste:
    nokkel = "".join(sorted(ord_))
    if nokkel not in grupper:
        grupper[nokkel] = []
    grupper[nokkel].append(ord_)

print(grupper)
`,
  },
  {
    id: "total-lagerverdi",
    title: "10. Total verdi i lager",
    description:
      "Beregn den samlede lagerverdien (pris × antall på lager, summert over alle produkter). Skriv ut tallet — som heltall.",
    starterCode: `produkter = [
    {"navn": "Tastatur", "pris": 800, "lager": 12},
    {"navn": "Skjerm", "pris": 5000, "lager": 4},
    {"navn": "Mus", "pris": 400, "lager": 30},
    {"navn": "Headset", "pris": 1200, "lager": 8},
]

total = 0

# Skriv koden din her


print(total)
`,
    expectedOutput: "51200",
    hints: [
      "For hvert produkt: legg til `pris * lager` til `total`.",
      "Du kan også løse det elegant med `sum(p[\"pris\"] * p[\"lager\"] for p in produkter)`.",
    ],
    solution: `produkter = [
    {"navn": "Tastatur", "pris": 800, "lager": 12},
    {"navn": "Skjerm", "pris": 5000, "lager": 4},
    {"navn": "Mus", "pris": 400, "lager": 30},
    {"navn": "Headset", "pris": 1200, "lager": 8},
]

total = sum(p["pris"] * p["lager"] for p in produkter)

print(total)
`,
  },
];
