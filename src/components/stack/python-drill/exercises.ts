// Eksamens-drill: Python-oppgaver. Hver oppgave har starter-kode, fasit og
// forventet stdout. Solutions er testet for å produsere expectedOutput eksakt
// (etter trim av trailing whitespace). Alle oppgaver er knyttet til typiske
// database/web-mønstre: filtrering, gruppering, joining, parsing, validering,
// cursor-håndtering og parameterbinding.

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
    id: "logger-feil-ip",
    title: "3. Unike feil-IP-er fra logg",
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
    id: "parse-query-string",
    title: "4. Parse HTTP query string",
    description:
      "Du får en query string fra en URL (f.eks. `?navn=ola&alder=34&by=Oslo`, men uten `?`). Parse den til en dictionary `params`. Verdiene kan være strenger.",
    starterCode: `qs = "navn=ola&alder=34&by=Oslo"

params = {}

# Skriv koden din her


print(params)
`,
    expectedOutput: "{'navn': 'ola', 'alder': '34', 'by': 'Oslo'}",
    hints: [
      "Først `qs.split(\"&\")` gir deg en liste med par-strenger som `\"navn=ola\"`.",
      "For hvert par: `par.split(\"=\")` gir deg `[nøkkel, verdi]` som du kan pakke ut: `nokkel, verdi = par.split(\"=\")`.",
    ],
    solution: `qs = "navn=ola&alder=34&by=Oslo"

params = {}

for par in qs.split("&"):
    nokkel, verdi = par.split("=")
    params[nokkel] = verdi

print(params)
`,
  },
  {
    id: "trygg-int-parse",
    title: "5. Trygg int-konvertering med try/except",
    description:
      "Du får en liste med rotete strenger fra et API eller en CSV-fil. Konverter alle som er gyldige heltall til int, og hopp stille over resten (`abc`, tom streng, desimaltall, osv.). Bruk `try`/`except`.",
    starterCode: `verdier = ["12", "34", "abc", "56", "", "78", "9.5", "100"]

gyldige = []

# Skriv koden din her


print(gyldige)
`,
    expectedOutput: "[12, 34, 56, 78, 100]",
    hints: [
      "`int(\"abc\")` kaster `ValueError`. Det er den du må fange.",
      "Inni løkken: `try: gyldige.append(int(v))` — `except ValueError: pass` for å hoppe over.",
    ],
    solution: `verdier = ["12", "34", "abc", "56", "", "78", "9.5", "100"]

gyldige = []

for v in verdier:
    try:
        gyldige.append(int(v))
    except ValueError:
        pass

print(gyldige)
`,
  },
  {
    id: "bestillinger-per-kunde",
    title: "6. Tell bestillinger per kunde",
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
    title: "7. Snittpris per kategori",
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
    id: "having-filter",
    title: "8. HAVING-filter på snittpris",
    description:
      "Beregn snittpris per kategori (som forrige oppgave), men returner BARE kategoriene som har snittpris over `terskel`. Tilsvarer SQLs `HAVING AVG(pris) > terskel`.",
    starterCode: `produkter = [
    {"navn": "Tastatur", "kategori": "tilbehør", "pris": 800},
    {"navn": "Mus", "kategori": "tilbehør", "pris": 400},
    {"navn": "Skjerm", "kategori": "skjerm", "pris": 5000},
    {"navn": "Curved", "kategori": "skjerm", "pris": 7000},
    {"navn": "Laptop", "kategori": "pc", "pris": 12000},
    {"navn": "Stasjonær", "kategori": "pc", "pris": 9000},
]
terskel = 1000

dyre = {}

# Skriv koden din her


print(dyre)
`,
    expectedOutput: "{'skjerm': 6000.0, 'pc': 10500.0}",
    hints: [
      "Først: bygg snittpris per kategori akkurat som i forrige oppgave.",
      "Deretter: iterer over snittene og legg bare til de som er > terskel i `dyre`.",
    ],
    solution: `produkter = [
    {"navn": "Tastatur", "kategori": "tilbehør", "pris": 800},
    {"navn": "Mus", "kategori": "tilbehør", "pris": 400},
    {"navn": "Skjerm", "kategori": "skjerm", "pris": 5000},
    {"navn": "Curved", "kategori": "skjerm", "pris": 7000},
    {"navn": "Laptop", "kategori": "pc", "pris": 12000},
    {"navn": "Stasjonær", "kategori": "pc", "pris": 9000},
]
terskel = 1000

sum_per = {}
antall_per = {}
for p in produkter:
    k = p["kategori"]
    sum_per[k] = sum_per.get(k, 0) + p["pris"]
    antall_per[k] = antall_per.get(k, 0) + 1

dyre = {}
for k in sum_per:
    snittpris = sum_per[k] / antall_per[k]
    if snittpris > terskel:
        dyre[k] = snittpris

print(dyre)
`,
  },
  {
    id: "group-by-multi",
    title: "9. GROUP BY på flere felt",
    description:
      "Beregn snittlønn per kombinasjon av (avdeling, stilling). Bruk en tuple `(avdeling, stilling)` som dict-nøkkel. Tilsvarer SQLs `GROUP BY avdeling, stilling`.",
    starterCode: `ansatte = [
    {"avdeling": "IT", "stilling": "junior", "lønn": 500000},
    {"avdeling": "IT", "stilling": "senior", "lønn": 800000},
    {"avdeling": "IT", "stilling": "junior", "lønn": 550000},
    {"avdeling": "HR", "stilling": "junior", "lønn": 450000},
    {"avdeling": "HR", "stilling": "senior", "lønn": 700000},
    {"avdeling": "IT", "stilling": "senior", "lønn": 900000},
]

snitt = {}

# Skriv koden din her


print(snitt)
`,
    expectedOutput:
      "{('IT', 'junior'): 525000.0, ('IT', 'senior'): 850000.0, ('HR', 'junior'): 450000.0, ('HR', 'senior'): 700000.0}",
    hints: [
      "Bruk `nokkel = (a[\"avdeling\"], a[\"stilling\"])` — tuples kan brukes som dict-nøkkel.",
      "Akkurat som vanlig group-by: bygg sum og antall per nøkkel, del på slutten.",
    ],
    solution: `ansatte = [
    {"avdeling": "IT", "stilling": "junior", "lønn": 500000},
    {"avdeling": "IT", "stilling": "senior", "lønn": 800000},
    {"avdeling": "IT", "stilling": "junior", "lønn": 550000},
    {"avdeling": "HR", "stilling": "junior", "lønn": 450000},
    {"avdeling": "HR", "stilling": "senior", "lønn": 700000},
    {"avdeling": "IT", "stilling": "senior", "lønn": 900000},
]

sum_per = {}
antall_per = {}

for a in ansatte:
    nokkel = (a["avdeling"], a["stilling"])
    sum_per[nokkel] = sum_per.get(nokkel, 0) + a["lønn"]
    antall_per[nokkel] = antall_per.get(nokkel, 0) + 1

snitt = {n: sum_per[n] / antall_per[n] for n in sum_per}

print(snitt)
`,
  },
  {
    id: "top-3-dyreste",
    title: "10. Topp-3 dyreste produkter",
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
    id: "multi-key-sort",
    title: "11. Sortér på flere nøkler",
    description:
      "Sortér ansatte etter `avdeling` stigende, så `lønn` synkende, så `navn` stigende. Skriv ut bare navnene i den endelige rekkefølgen.",
    starterCode: `ansatte = [
    {"navn": "Per", "avdeling": "HR", "lønn": 700000},
    {"navn": "Kari", "avdeling": "IT", "lønn": 800000},
    {"navn": "Ola", "avdeling": "IT", "lønn": 900000},
    {"navn": "Anne", "avdeling": "HR", "lønn": 700000},
    {"navn": "Lise", "avdeling": "IT", "lønn": 800000},
]

sortert = []

# Skriv koden din her


print([a["navn"] for a in sortert])
`,
    expectedOutput: "['Anne', 'Per', 'Ola', 'Kari', 'Lise']",
    hints: [
      "`sorted(..., key=lambda a: (a[\"avdeling\"], -a[\"lønn\"], a[\"navn\"]))` — tuple-key gir sammensatt sortering.",
      "Negativt fortegn på `lønn` snur sortert synkende. Strenger må snus med `reverse` per nøkkel — eller bare bytt rekkefølgen i tuple.",
    ],
    solution: `ansatte = [
    {"navn": "Per", "avdeling": "HR", "lønn": 700000},
    {"navn": "Kari", "avdeling": "IT", "lønn": 800000},
    {"navn": "Ola", "avdeling": "IT", "lønn": 900000},
    {"navn": "Anne", "avdeling": "HR", "lønn": 700000},
    {"navn": "Lise", "avdeling": "IT", "lønn": 800000},
]

sortert = sorted(ansatte, key=lambda a: (a["avdeling"], -a["lønn"], a["navn"]))

print([a["navn"] for a in sortert])
`,
  },
  {
    id: "gruppere-per-maned",
    title: "12. Gruppér hendelser per måned",
    description:
      "Du får en liste med hendelser med ISO-datoer (`YYYY-MM-DD`). Tell antall hendelser per måned, med nøkkel på formatet `\"YYYY-MM\"`. Bruk `datetime`-modulen.",
    starterCode: `from datetime import datetime

hendelser = [
    {"dato": "2026-01-15", "type": "kjøp"},
    {"dato": "2026-01-22", "type": "retur"},
    {"dato": "2026-02-03", "type": "kjøp"},
    {"dato": "2026-02-18", "type": "kjøp"},
    {"dato": "2026-03-05", "type": "retur"},
    {"dato": "2026-03-20", "type": "kjøp"},
    {"dato": "2026-03-29", "type": "kjøp"},
]

antall_per_maned = {}

# Skriv koden din her


print(antall_per_maned)
`,
    expectedOutput: "{'2026-01': 2, '2026-02': 2, '2026-03': 3}",
    hints: [
      "`datetime.fromisoformat(\"2026-01-15\")` parser ISO-datoen til et datetime-objekt.",
      "`d.strftime(\"%Y-%m\")` gir deg streng-nøkkel som `\"2026-01\"`. Tell deretter med `.get(nokkel, 0) + 1`.",
    ],
    solution: `from datetime import datetime

hendelser = [
    {"dato": "2026-01-15", "type": "kjøp"},
    {"dato": "2026-01-22", "type": "retur"},
    {"dato": "2026-02-03", "type": "kjøp"},
    {"dato": "2026-02-18", "type": "kjøp"},
    {"dato": "2026-03-05", "type": "retur"},
    {"dato": "2026-03-20", "type": "kjøp"},
    {"dato": "2026-03-29", "type": "kjøp"},
]

antall_per_maned = {}

for h in hendelser:
    d = datetime.fromisoformat(h["dato"])
    nokkel = d.strftime("%Y-%m")
    antall_per_maned[nokkel] = antall_per_maned.get(nokkel, 0) + 1

print(antall_per_maned)
`,
  },
  {
    id: "parse-csv-strenger",
    title: "13. Parse CSV-strenger til dict-er",
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
    id: "merge-konfig",
    title: "14. Slå sammen standard- og bruker-konfig",
    description:
      "Du har en `standard`-konfig og en `bruker`-konfig. Bygg `konfig` der bruker-verdier overstyrer standard-verdier, og nye nøkler i bruker beholdes. Standard-rekkefølgen skal komme først i resultatet.",
    starterCode: `standard = {"theme": "light", "språk": "no", "varsler": True}
bruker = {"theme": "dark", "skrift": 14}

konfig = {}

# Skriv koden din her


print(konfig)
`,
    expectedOutput:
      "{'theme': 'dark', 'språk': 'no', 'varsler': True, 'skrift': 14}",
    hints: [
      "`{**standard, **bruker}` slår sammen to dicts. Senere keys overstyrer tidligere.",
      "Eller: kopier standard først (`konfig = dict(standard)`), så `konfig.update(bruker)`.",
    ],
    solution: `standard = {"theme": "light", "språk": "no", "varsler": True}
bruker = {"theme": "dark", "skrift": 14}

konfig = {**standard, **bruker}

print(konfig)
`,
  },
  {
    id: "ikke-betalt-brukere",
    title: "15. Brukere som ikke har betalt (NOT IN-mønster)",
    description:
      "Gitt `aktive_brukere` og `betalte_brukere`: finn aktive brukere som IKKE har betalt. Behold opprinnelig rekkefølge fra `aktive_brukere`. Tilsvarer SQLs `WHERE bruker NOT IN (SELECT ...)`.",
    starterCode: `aktive_brukere = ["ola", "kari", "per", "lise", "anne", "trygve"]
betalte_brukere = ["kari", "lise", "ola"]

ikke_betalt = []

# Skriv koden din her


print(ikke_betalt)
`,
    expectedOutput: "['per', 'anne', 'trygve']",
    hints: [
      "List comprehension: `[u for u in aktive_brukere if u not in betalte_brukere]`.",
      "For store lister: konverter `betalte_brukere` til `set(...)` først — `not in` blir O(1) i stedet for O(n).",
    ],
    solution: `aktive_brukere = ["ola", "kari", "per", "lise", "anne", "trygve"]
betalte_brukere = ["kari", "lise", "ola"]

betalte_set = set(betalte_brukere)
ikke_betalt = [u for u in aktive_brukere if u not in betalte_set]

print(ikke_betalt)
`,
  },
  {
    id: "sql-result-to-dicts",
    title: "16. SQL-resultat (rader + kolonner) til list of dicts",
    description:
      "Når du henter data fra en database via en cursor får du ofte en liste med tupler (rader) og en separat liste med kolonnenavn. Konverter dette til en liste med dictionaries.",
    starterCode: `kolonner = ["id", "navn", "by"]
rader = [
    (1, "Ola", "Oslo"),
    (2, "Kari", "Bergen"),
    (3, "Per", "Trondheim"),
]

records = []

# Skriv koden din her


print(records)
`,
    expectedOutput:
      "[{'id': 1, 'navn': 'Ola', 'by': 'Oslo'}, {'id': 2, 'navn': 'Kari', 'by': 'Bergen'}, {'id': 3, 'navn': 'Per', 'by': 'Trondheim'}]",
    hints: [
      "`zip(kolonner, rad)` parer kolonnenavn med verdier fra én rad.",
      "`dict(zip(...))` lager en dictionary direkte fra par-iteratoren.",
    ],
    solution: `kolonner = ["id", "navn", "by"]
rader = [
    (1, "Ola", "Oslo"),
    (2, "Kari", "Bergen"),
    (3, "Per", "Trondheim"),
]

records = [dict(zip(kolonner, rad)) for rad in rader]

print(records)
`,
  },
  {
    id: "null-i-fetchall",
    title: "17. Filtrer ut NULL fra cursor.fetchall()",
    description:
      "MySQL og PostgreSQL returnerer `NULL`-verdier som Python-`None` i tuple-radene fra `cursor.fetchall()`. Filtrer ut rader der epost-feltet (3. kolonne) er `None`, og konverter resten til list of dicts.",
    starterCode: `# Resultat fra: SELECT id, navn, epost FROM brukere
rader = [
    (1, "Ola", "ola@x.no"),
    (2, "Kari", None),
    (3, "Per", "per@x.no"),
    (4, "Lise", None),
    (5, "Anne", "anne@x.no"),
]

med_epost = []

# Skriv koden din her


print(med_epost)
`,
    expectedOutput:
      "[{'id': 1, 'navn': 'Ola', 'epost': 'ola@x.no'}, {'id': 3, 'navn': 'Per', 'epost': 'per@x.no'}, {'id': 5, 'navn': 'Anne', 'epost': 'anne@x.no'}]",
    hints: [
      "Sjekk med `is not None` (ikke `!= None` — det er en pep-8-no-no).",
      "For hver rad som passerer filteret: bygg en dict manuelt med `{\"id\": rad[0], \"navn\": rad[1], \"epost\": rad[2]}`.",
    ],
    solution: `rader = [
    (1, "Ola", "ola@x.no"),
    (2, "Kari", None),
    (3, "Per", "per@x.no"),
    (4, "Lise", None),
    (5, "Anne", "anne@x.no"),
]

med_epost = []

for rad in rader:
    if rad[2] is not None:
        med_epost.append({"id": rad[0], "navn": rad[1], "epost": rad[2]})

print(med_epost)
`,
  },
  {
    id: "where-params",
    title: "18. Bygg WHERE-klausul + parameter-tuple",
    description:
      "Du skal bygge en parameterized SQL-query dynamisk fra et filter-dict. Lag WHERE-klausulen med `%s`-placeholders (én per filter, limt sammen med ` AND `) OG en tuple med verdiene i samme rekkefølge. Aldri f-string verdiene inn i SQL-en — det er prepared-statement-mønsteret som hindrer SQL injection.",
    starterCode: `filter_dict = {"avdeling": "IT", "min_lønn": 600000, "by": "Oslo"}

fragmenter = []
verdier = []

# Skriv koden din her


where_klausul = " AND ".join(fragmenter)
print(where_klausul)
print(tuple(verdier))
`,
    expectedOutput:
      "avdeling = %s AND min_lønn = %s AND by = %s\n('IT', 600000, 'Oslo')",
    hints: [
      "Iterer `filter_dict.items()` og bygg `f\"{k} = %s\"` per nøkkel.",
      "Legg verdien i `verdier`-listen i samme iterasjon, så holder rekkefølgen seg.",
    ],
    solution: `filter_dict = {"avdeling": "IT", "min_lønn": 600000, "by": "Oslo"}

fragmenter = []
verdier = []

for k, v in filter_dict.items():
    fragmenter.append(f"{k} = %s")
    verdier.append(v)

where_klausul = " AND ".join(fragmenter)
print(where_klausul)
print(tuple(verdier))
`,
  },
  {
    id: "index-by-id",
    title: "19. Indekser records etter ID",
    description:
      "Konverter en liste med records til en dictionary der nøkkelen er `id`-feltet og verdien er hele record-en. Dette gir O(1)-oppslag, og er forutsetningen for å gjøre joins i minnet.",
    starterCode: `produkter = [
    {"id": "A101", "navn": "Tastatur", "pris": 899},
    {"id": "B205", "navn": "Skjerm", "pris": 4990},
    {"id": "C310", "navn": "Mus", "pris": 449},
]

indeks = {}

# Skriv koden din her


print(indeks)
`,
    expectedOutput:
      "{'A101': {'id': 'A101', 'navn': 'Tastatur', 'pris': 899}, 'B205': {'id': 'B205', 'navn': 'Skjerm', 'pris': 4990}, 'C310': {'id': 'C310', 'navn': 'Mus', 'pris': 449}}",
    hints: [
      "En dict comprehension klarer dette på én linje: `{p[\"id\"]: p for p in produkter}`.",
      "Merk at verdien er hele dict-en `p`, ikke bare ett felt.",
    ],
    solution: `produkter = [
    {"id": "A101", "navn": "Tastatur", "pris": 899},
    {"id": "B205", "navn": "Skjerm", "pris": 4990},
    {"id": "C310", "navn": "Mus", "pris": 449},
]

indeks = {p["id"]: p for p in produkter}

print(indeks)
`,
  },
  {
    id: "join-lister",
    title: "20. JOIN av to lister på fremmednøkkel",
    description:
      "Gitt `kunder` (med `id` og `navn`) og `bestillinger` (med `kunde_id` og `belop`): beregn total kjøpsbeløp per kundenavn. Tilsvarer en INNER JOIN + SUM/GROUP BY.",
    starterCode: `kunder = [
    {"id": 1, "navn": "Ola"},
    {"id": 2, "navn": "Kari"},
    {"id": 3, "navn": "Per"},
]
bestillinger = [
    {"kunde_id": 1, "belop": 250},
    {"kunde_id": 2, "belop": 1200},
    {"kunde_id": 1, "belop": 90},
    {"kunde_id": 3, "belop": 540},
    {"kunde_id": 2, "belop": 75},
    {"kunde_id": 1, "belop": 320},
]

total_per_navn = {}

# Skriv koden din her


print(total_per_navn)
`,
    expectedOutput: "{'Ola': 660, 'Kari': 1275, 'Per': 540}",
    hints: [
      "Bygg først en indeks `id_til_navn = {k[\"id\"]: k[\"navn\"] for k in kunder}`.",
      "Iterer så bestillinger, slå opp navnet via indeksen, og akkumuler `belop` med `.get(navn, 0)`.",
    ],
    solution: `kunder = [
    {"id": 1, "navn": "Ola"},
    {"id": 2, "navn": "Kari"},
    {"id": 3, "navn": "Per"},
]
bestillinger = [
    {"kunde_id": 1, "belop": 250},
    {"kunde_id": 2, "belop": 1200},
    {"kunde_id": 1, "belop": 90},
    {"kunde_id": 3, "belop": 540},
    {"kunde_id": 2, "belop": 75},
    {"kunde_id": 1, "belop": 320},
]

id_til_navn = {k["id"]: k["navn"] for k in kunder}

total_per_navn = {}
for b in bestillinger:
    navn = id_til_navn[b["kunde_id"]]
    total_per_navn[navn] = total_per_navn.get(navn, 0) + b["belop"]

print(total_per_navn)
`,
  },
  {
    id: "nested-json",
    title: "21. Bygg nested JSON fra flat liste",
    description:
      "API-er returnerer ofte data nested per forelder. Gitt en flat liste med ordrer (med `kunde`, `ordre_id`, `belop`), bygg en dictionary der nøkkel er kunde og verdi er liste over ordrene (uten `kunde`-feltet).",
    starterCode: `rader = [
    {"kunde": "Ola", "ordre_id": 101, "belop": 250},
    {"kunde": "Kari", "ordre_id": 102, "belop": 1200},
    {"kunde": "Ola", "ordre_id": 103, "belop": 90},
    {"kunde": "Per", "ordre_id": 104, "belop": 540},
    {"kunde": "Kari", "ordre_id": 105, "belop": 75},
]

ordrer_per_kunde = {}

# Skriv koden din her


print(ordrer_per_kunde)
`,
    expectedOutput:
      "{'Ola': [{'ordre_id': 101, 'belop': 250}, {'ordre_id': 103, 'belop': 90}], 'Kari': [{'ordre_id': 102, 'belop': 1200}, {'ordre_id': 105, 'belop': 75}], 'Per': [{'ordre_id': 104, 'belop': 540}]}",
    hints: [
      "For hver rad: opprett en tom liste under `ordrer_per_kunde[kunde]` hvis den ikke finnes ennå.",
      "Legg så til en NY dict med kun `ordre_id` og `belop` (ikke `kunde`).",
    ],
    solution: `rader = [
    {"kunde": "Ola", "ordre_id": 101, "belop": 250},
    {"kunde": "Kari", "ordre_id": 102, "belop": 1200},
    {"kunde": "Ola", "ordre_id": 103, "belop": 90},
    {"kunde": "Per", "ordre_id": 104, "belop": 540},
    {"kunde": "Kari", "ordre_id": 105, "belop": 75},
]

ordrer_per_kunde = {}

for r in rader:
    k = r["kunde"]
    if k not in ordrer_per_kunde:
        ordrer_per_kunde[k] = []
    ordrer_per_kunde[k].append({"ordre_id": r["ordre_id"], "belop": r["belop"]})

print(ordrer_per_kunde)
`,
  },
  {
    id: "valider-payload",
    title: "22. Valider request-payloads",
    description:
      "I et web-API må du sjekke at innkommende JSON inneholder alle påkrevde felt. Gitt en liste med `required`-felt og en liste med payloads: returner en liste der hvert element er listen over manglende felt for tilhørende payload (tom liste betyr OK).",
    starterCode: `required = ["navn", "epost", "alder"]
payloads = [
    {"navn": "Ola", "epost": "ola@x.no", "alder": 34},
    {"navn": "Kari", "alder": 28},
    {"epost": "per@x.no"},
]

manglende = []

# Skriv koden din her


print(manglende)
`,
    expectedOutput: "[[], ['epost'], ['navn', 'alder']]",
    hints: [
      "For hver payload: lag en liste over `f` i `required` der `f not in payload`.",
      "List comprehension: `[f for f in required if f not in p]` gir akkurat det.",
    ],
    solution: `required = ["navn", "epost", "alder"]
payloads = [
    {"navn": "Ola", "epost": "ola@x.no", "alder": 34},
    {"navn": "Kari", "alder": 28},
    {"epost": "per@x.no"},
]

manglende = []

for p in payloads:
    mangler = [f for f in required if f not in p]
    manglende.append(mangler)

print(manglende)
`,
  },
  {
    id: "paginering",
    title: "23. Paginering av resultatsett",
    description:
      "En API-endepunkt returnerer maks `side_storrelse` records per side. Gitt en full liste, returner kun records for side nummer `side` (1-indeksert). Tilsvarer SQLs `LIMIT side_storrelse OFFSET (side-1)*side_storrelse`.",
    starterCode: `artikler = [
    {"id": 1, "tittel": "Intro"},
    {"id": 2, "tittel": "SQL basics"},
    {"id": 3, "tittel": "JOINs"},
    {"id": 4, "tittel": "GROUP BY"},
    {"id": 5, "tittel": "Subqueries"},
    {"id": 6, "tittel": "Indexes"},
    {"id": 7, "tittel": "Tuning"},
]
side = 2
side_storrelse = 3

resultat = []

# Skriv koden din her


print(resultat)
`,
    expectedOutput:
      "[{'id': 4, 'tittel': 'GROUP BY'}, {'id': 5, 'tittel': 'Subqueries'}, {'id': 6, 'tittel': 'Indexes'}]",
    hints: [
      "Slicing: `liste[start:stopp]`. Start er `(side - 1) * side_storrelse`.",
      "Stopp er `side * side_storrelse`. Python klipper automatisk hvis stopp er forbi slutten.",
    ],
    solution: `artikler = [
    {"id": 1, "tittel": "Intro"},
    {"id": 2, "tittel": "SQL basics"},
    {"id": 3, "tittel": "JOINs"},
    {"id": 4, "tittel": "GROUP BY"},
    {"id": 5, "tittel": "Subqueries"},
    {"id": 6, "tittel": "Indexes"},
    {"id": 7, "tittel": "Tuning"},
]
side = 2
side_storrelse = 3

start = (side - 1) * side_storrelse
stopp = side * side_storrelse
resultat = artikler[start:stopp]

print(resultat)
`,
  },
  {
    id: "diff-snapshots",
    title: "24. Diff to snapshots av en tabell",
    description:
      "Gitt to snapshots av samme tabell (`forrige` og `ny`), finn ID-er som er nye, endret, eller slettet. Klassisk sync-mønster når du replikerer data mellom systemer.",
    starterCode: `forrige = [
    {"id": 1, "navn": "Ola", "lønn": 500000},
    {"id": 2, "navn": "Kari", "lønn": 600000},
    {"id": 3, "navn": "Per", "lønn": 550000},
]
ny = [
    {"id": 2, "navn": "Kari", "lønn": 650000},
    {"id": 3, "navn": "Per", "lønn": 550000},
    {"id": 4, "navn": "Lise", "lønn": 700000},
]

endringer = {"nye": [], "endret": [], "slettet": []}

# Skriv koden din her


print(endringer)
`,
    expectedOutput: "{'nye': [4], 'endret': [2], 'slettet': [1]}",
    hints: [
      "Indekser begge listene etter `id` først (samme mønster som oppgave 19).",
      "Iterer ny: hvis id ikke i forrige → `nye`. Hvis dict-ene er ulike → `endret`. Iterer forrige: hvis id ikke i ny → `slettet`.",
    ],
    solution: `forrige = [
    {"id": 1, "navn": "Ola", "lønn": 500000},
    {"id": 2, "navn": "Kari", "lønn": 600000},
    {"id": 3, "navn": "Per", "lønn": 550000},
]
ny = [
    {"id": 2, "navn": "Kari", "lønn": 650000},
    {"id": 3, "navn": "Per", "lønn": 550000},
    {"id": 4, "navn": "Lise", "lønn": 700000},
]

forrige_indeks = {r["id"]: r for r in forrige}
ny_indeks = {r["id"]: r for r in ny}

endringer = {"nye": [], "endret": [], "slettet": []}

for r_id in ny_indeks:
    if r_id not in forrige_indeks:
        endringer["nye"].append(r_id)
    elif ny_indeks[r_id] != forrige_indeks[r_id]:
        endringer["endret"].append(r_id)

for r_id in forrige_indeks:
    if r_id not in ny_indeks:
        endringer["slettet"].append(r_id)

print(endringer)
`,
  },
  {
    id: "total-lagerverdi",
    title: "25. Total verdi i lager",
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
