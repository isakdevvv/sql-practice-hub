// Original chapter content for the Python (Liang) curriculum.
// Every word and every example in this file is written from scratch in our
// own voice. Concepts (variables, loops, recursion, BSTs) are universal CS;
// the wording, scenarios, and figures are ours.

import type { ReactNode } from "react";
import * as F from "@/components/learn/python-figures/PythonFigures";

export interface PythonChapter {
  nr: number;
  /** Matches the topic string used in dragExercises ("Python kap. N"). */
  topic: string;
  title: string;
  /** 1-line summary for the index page. */
  summary: string;
  /** Estimated read time in minutes. */
  readMinutes: number;
  body: ReactNode;
}

/* ----------------------------- Building blocks ----------------------------- */

function H2({ children }: { children: ReactNode }) {
  return (
    <h2 className="mt-8 mb-3 text-lg font-semibold tracking-tight">
      {children}
    </h2>
  );
}

function P({ children }: { children: ReactNode }) {
  return <p className="my-3 leading-relaxed text-foreground/90">{children}</p>;
}

function Code({ children }: { children: ReactNode }) {
  return (
    <pre className="my-3 rounded-md border border-border bg-card p-3 text-xs font-mono leading-relaxed overflow-x-auto">
      {children}
    </pre>
  );
}

function KeyPoints({ items }: { items: string[] }) {
  return (
    <div className="my-4 rounded-md border border-brand/30 bg-brand/5 p-3">
      <div className="text-[10px] uppercase tracking-wider text-brand font-semibold mb-2">
        Huskepunkter
      </div>
      <ul className="space-y-1 text-sm">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-brand">›</span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* --------------------------------- Chapters -------------------------------- */

export const PYTHON_CHAPTERS: PythonChapter[] = [
  {
    nr: 4,
    topic: "Python kap. 4",
    title: "Valg — if, elif og else",
    summary: "Boolske uttrykk, sammenligning, og hvordan Python velger grein.",
    readMinutes: 8,
    body: (
      <>
        <P>
          Et program må ofte ta valg basert på hva som er sant. Skal vi vise
          rabattprisen, eller den vanlige? Er brukerinputen et tall, eller noe
          annet? Disse spørsmålene besvares med <code>if</code>, <code>elif</code>{" "}
          og <code>else</code> — og under panseret med boolske verdier (
          <code>True</code> / <code>False</code>).
        </P>
        <H2>Den enkleste if</H2>
        <P>
          Et boolsk uttrykk er noe som evaluerer til <code>True</code> eller{" "}
          <code>False</code>. Hvis det er sant, kjøres innrykket blokk:
        </P>
        <Code>
          {`temp = 22\nif temp > 20:\n    print("Varmt nok for t-skjorte.")`}
        </Code>
        <F.IfElseFlow />
        <H2>elif og else</H2>
        <P>
          Når flere muligheter må sjekkes etter tur, bruker vi en <code>elif</code>
          -kjede. Bare <em>én</em> grein kjører — den første som matcher:
        </P>
        <Code>
          {`if temp > 25:\n    melding = "Het."\nelif temp > 15:\n    melding = "Behagelig."\nelse:\n    melding = "Trekk på jakka."`}
        </Code>
        <H2>Sammenligning</H2>
        <P>
          Operatorer som <code>==</code>, <code>!=</code>, <code>{"<"}</code>,{" "}
          <code>{">="}</code> sammenligner to verdier og returnerer et boolsk
          svar. Vær oppmerksom på forskjellen mellom <code>=</code>{" "}
          (tilordning) og <code>==</code> (likhet) — de er forskjellige
          operasjoner.
        </P>
        <F.ComparisonOps />
        <H2>Kombinerte vilkår med and, or, not</H2>
        <P>
          Du kan kombinere boolske uttrykk: <code>and</code> krever at begge er{" "}
          sanne, <code>or</code> krever minst én, <code>not</code> snur. Disse
          short-circuit'er — <code>and</code> stopper å evaluere så snart en
          falsk er funnet.
        </P>
        <F.TruthTable />
        <Code>
          {`alder = 17\nhar_id = True\nif alder >= 18 and har_id:\n    slipp_inn()\nelif alder >= 18 or har_id:\n    sjekk_nøyere()  # bare én av delene\nelse:\n    avvis()`}
        </Code>
        <KeyPoints
          items={[
            "Bare én grein i en if/elif/else-kjede kjører.",
            "Sammenligning gir alltid True/False — bruk == og !=, ikke = og ≠.",
            "and / or short-circuit'er: høyresiden evalueres bare når den må.",
            "Innrykk markerer hvilken kode som hører til hvilken grein.",
          ]}
        />
      </>
    ),
  },
  {
    nr: 5,
    topic: "Python kap. 5",
    title: "Løkker — while og for",
    summary: "Gjentakelse: while-løkker, for-range, break/continue, og når man velger hva.",
    readMinutes: 9,
    body: (
      <>
        <P>
          En løkke kjører den samme blokken flere ganger. Python har to:{" "}
          <code>while</code> kjører så lenge en betingelse er sann, og{" "}
          <code>for</code> går gjennom en sekvens.
        </P>
        <H2>while-løkke</H2>
        <P>
          Bruk <code>while</code> når du ikke vet på forhånd hvor mange
          gjennomløp som trengs:
        </P>
        <Code>
          {`gjett = -1\nwhile gjett != 42:\n    gjett = int(input("Gjett: "))\nprint("Riktig!")`}
        </Code>
        <F.WhileFlow />
        <P>
          Vær våken for evige løkker — variabler i betingelsen må endres inni
          kroppen, ellers stopper aldri løkka.
        </P>
        <H2>for med range</H2>
        <P>
          Når antall iterasjoner er kjent på forhånd, er <code>for</code> +{" "}
          <code>range</code> det enkleste:
        </P>
        <Code>
          {`for i in range(5):\n    print(i)   # 0, 1, 2, 3, 4`}
        </Code>
        <F.ForRangeStrip />
        <P>
          <code>range(start, stop, step)</code> er fleksibel:{" "}
          <code>range(2, 10, 2)</code> gir 2, 4, 6, 8. Stoppverdien er
          eksklusiv.
        </P>
        <H2>for over sekvenser</H2>
        <P>
          <code>for</code> går egentlig over hva som helst som er itererbart —
          strenger, lister, dict-nøkler:
        </P>
        <Code>
          {`for bokstav in "Python":\n    print(bokstav)\n\nfor pris in [12, 8, 25]:\n    print(pris)`}
        </Code>
        <H2>break og continue</H2>
        <P>
          <code>break</code> avslutter løkka umiddelbart. <code>continue</code>{" "}
          hopper til neste iterasjon uten å kjøre resten av kroppen.
        </P>
        <F.BreakContinue />
        <Code>
          {`for n in tall:\n    if n < 0:\n        continue        # ignorer negative, fortsett\n    if n > 100:\n        break           # stopp helt\n    skriv_ut(n)`}
        </Code>
        <KeyPoints
          items={[
            "while når antall iterasjoner er ukjent; for når det er kjent.",
            "range(stop) gir 0..stop−1. range(start, stop, step) er fleksibel.",
            "continue → neste iterasjon; break → ut av løkka helt.",
            "Pass på at while-betingelsen før eller siden blir False.",
          ]}
        />
      </>
    ),
  },
  {
    nr: 6,
    topic: "Python kap. 6",
    title: "Funksjoner",
    summary: "def, parametre, return, scope, og hva som skjer på kallstacken.",
    readMinutes: 10,
    body: (
      <>
        <P>
          En funksjon er en navngitt blokk kode du kan kalle igjen og igjen med
          forskjellige input. Det reduserer duplisering og lager naturlige
          enheter du kan teste hver for seg.
        </P>
        <H2>Definere og kalle</H2>
        <Code>
          {`def hilsen(navn):\n    return f"Hei, {navn}!"\n\nsvar = hilsen("Ada")   # svar == "Hei, Ada!"`}
        </Code>
        <F.FunctionCallDiagram />
        <P>
          Når du kaller funksjonen, blir argumentet (her <code>"Ada"</code>){" "}
          bundet til parameteren (her <code>navn</code>). Kroppen kjører, og{" "}
          <code>return</code> sender en verdi tilbake til kallstedet.
        </P>
        <H2>Flere parametre og standardverdier</H2>
        <Code>
          {`def hilsen(navn, hilsemate="Hei"):\n    return f"{hilsemate}, {navn}!"\n\nhilsen("Ada")           # "Hei, Ada!"\nhilsen("Bob", "Hallo")   # "Hallo, Bob!"`}
        </Code>
        <H2>Scope — hvor lever variabler?</H2>
        <P>
          En variabel definert inni en funksjon er <em>lokal</em> — den
          eksisterer kun mens funksjonen kjører og kan ikke ses utenfor. Globale
          variabler kan leses, men å endre dem krever <code>global</code>.
        </P>
        <F.ScopeDiagram />
        <H2>Kallstacken</H2>
        <P>
          Hver gang en funksjon kalles, lager Python en ny ramme på{" "}
          <em>kallstacken</em>. Rammen holder lokale variabler og linjen vi er
          på. Når funksjonen returnerer, fjernes rammen.
        </P>
        <F.CallStackGrowth />
        <KeyPoints
          items={[
            "Parametre binder seg til argumenter ved kall — ny ramme på stacken.",
            "return sender verdi tilbake. Uten return returneres None.",
            "Lokale variabler dør når funksjonen returnerer.",
            "Stort program = mange små funksjoner som hver gjør én ting.",
          ]}
        />
      </>
    ),
  },
  {
    nr: 7,
    topic: "Python kap. 7",
    title: "Objekter og klasser",
    summary: "Definere egne typer med klasse-malen og lage instanser.",
    readMinutes: 9,
    body: (
      <>
        <P>
          Lister og strenger er innebygde typer i Python. Med en klasse kan du
          lage dine egne typer — bunte sammen data og operasjoner som hører
          sammen.
        </P>
        <H2>Anatomien av en klasse</H2>
        <F.ClassAnatomy />
        <P>
          <code>class</code> definerer malen. <code>__init__</code> er
          konstruktøren som kjører hver gang du lager en instans. Inni metoder
          refererer <code>self</code> til den konkrete instansen.
        </P>
        <Code>
          {`class Hund:\n    def __init__(self, navn):\n        self.navn = navn       # attributt\n\n    def bjeff(self):\n        return f"{self.navn} sier voff!"\n\nrex = Hund("Rex")\nprint(rex.bjeff())            # Rex sier voff!`}
        </Code>
        <H2>Instans vs. klasse</H2>
        <P>
          Klassen er en mal. Hver instans har sin egen kopi av attributtene.
        </P>
        <F.InstanceVsClass />
        <H2>Hvorfor klasser?</H2>
        <P>
          Klasser samler relatert data og oppførsel på ett sted. Når koden vokser
          er det enklere å resonnere om <code>kunde.legg_til_ordre(o)</code> enn
          om dusinvis av løse funksjoner som tar dict-er som argument.
        </P>
        <KeyPoints
          items={[
            "class er malen; instans er den konkrete tingen.",
            "__init__ kjøres når du lager en instans og setter attributter.",
            "self er måten en metode refererer til sin egen instans.",
            "Klasser samler data og metoder som hører sammen.",
          ]}
        />
      </>
    ),
  },
  {
    nr: 8,
    topic: "Python kap. 8",
    title: "Strenger",
    summary: "Indeksering, slicing, metoder og f-strenger.",
    readMinutes: 8,
    body: (
      <>
        <P>
          En streng er en sekvens av tegn. Du kan se på den som en
          uforanderlig liste — du kan plukke ut tegn og biter, men ikke endre
          dem på plass.
        </P>
        <H2>Indeksering</H2>
        <F.StringIndex />
        <Code>
          {`s = "Python"\ns[0]    # "P"\ns[-1]   # "n"  (siste tegn)\ns[1:4]  # "yth" (slice)`}
        </Code>
        <H2>Slicing</H2>
        <F.SliceDiagram />
        <P>
          Slice-syntaksen <code>s[start:stop]</code> tar tegnene fra og med{" "}
          <code>start</code> til <em>men ikke med</em> <code>stop</code>. Tenk på
          tallene som streker mellom tegnene, ikke som tegnene selv.
        </P>
        <H2>Vanlige metoder</H2>
        <Code>
          {`"hei".upper()          # "HEI"\n"  pakke  ".strip()   # "pakke"\n"a,b,c".split(",")     # ["a", "b", "c"]\n"-".join(["a","b","c"]) # "a-b-c"\n"hei".replace("h", "H") # "Hei"`}
        </Code>
        <H2>f-strenger</H2>
        <P>
          F-strenger lar deg pakke inn uttrykk direkte i strengen — mye renere
          enn manuell concatenation:
        </P>
        <Code>
          {`navn = "Ada"\nalder = 30\nprint(f"{navn} er {alder} år ({alder*12} måneder).")`}
        </Code>
        <KeyPoints
          items={[
            "Strenger er uforanderlige — metoder returnerer ny streng.",
            "Negativ indeks teller fra slutten: s[-1] er siste tegn.",
            "Slice s[a:b] inkluderer a, ekskluderer b.",
            "Bruk f-strenger for interpolasjon.",
          ]}
        />
      </>
    ),
  },
  {
    nr: 9,
    topic: "Python kap. 9",
    title: "Grafiske grensesnitt (tkinter)",
    summary: "Widgets, layout, og hvordan event-drevne programmer kjører.",
    readMinutes: 8,
    body: (
      <>
        <P>
          Et grafisk grensesnitt fungerer ganske annerledes enn et
          kommandolinjeprogram. I stedet for å spørre brukeren steg for steg
          tegner du opp et vindu og reagerer på events — klikk, tastetrykk,
          musebevegelser.
        </P>
        <H2>Widget-treet</H2>
        <P>
          Et vindu er bygd opp av widgets — knapper, etiketter, tekstfelt — som
          ligger inni hverandre i et tre. Hovedvinduet er roten.
        </P>
        <F.WidgetTree />
        <H2>Et minimalt program</H2>
        <Code>
          {`import tkinter as tk\n\ndef på_klikk():\n    label.config(text="Trykket!")\n\nroot = tk.Tk()\nlabel = tk.Label(root, text="Klar")\nbtn = tk.Button(root, text="Trykk", command=på_klikk)\nlabel.pack()\nbtn.pack()\nroot.mainloop()`}
        </Code>
        <H2>Event-løkka</H2>
        <P>
          <code>mainloop()</code> starter den evige event-løkka: vent på event,
          finn rett handler, kjør den, oppdater skjermen, gjenta.
        </P>
        <F.EventLoop />
        <KeyPoints
          items={[
            "Widgets er bygd opp som et tre; barn lever inni foreldre.",
            "Knapper kobles til en funksjon via command=.",
            "mainloop() holder programmet i live til vinduet lukkes.",
            "Layout-managere (pack, grid, place) plasserer widgetene.",
          ]}
        />
      </>
    ),
  },
  {
    nr: 10,
    topic: "Python kap. 10",
    title: "Lister",
    summary: "Ordnede samlinger som kan endres — pluss aliasing-fellen.",
    readMinutes: 9,
    body: (
      <>
        <P>
          En liste er en ordnet samling som kan endres. Du kan legge til og
          fjerne elementer, sortere, og indeksere etter posisjon. Lister er
          arbeidshesten i de fleste Python-programmer.
        </P>
        <H2>Indekserte plasser</H2>
        <F.ListBoxes />
        <Code>
          {`tall = [10, 20, 30, 40]\ntall[0]      # 10\ntall[-1]     # 40\nlen(tall)    # 4`}
        </Code>
        <H2>Vanlige operasjoner</H2>
        <F.ListMethods />
        <Code>
          {`lst = [1, 2, 3]\nlst.append(4)        # [1,2,3,4]\nlst.insert(0, 0)     # [0,1,2,3,4]\nx = lst.pop()        # x=4, lst=[0,1,2,3]\nlst.remove(2)        # [0,1,3]`}
        </Code>
        <H2>Aliasing</H2>
        <P>
          Når du tilordner en liste til en ny variabel, kopieres ikke listen —
          begge navn peker på det samme objektet. Endring via ett navn ses av
          det andre. Dette er en av de vanligste fellene for nye Python-utviklere.
        </P>
        <F.AliasingDiagram />
        <Code>
          {`a = [1, 2, 3]\nb = a            # ikke kopi! samme objekt\nb.append(99)\nprint(a)         # [1, 2, 3, 99]\n\nc = a.copy()     # nå er det en ækte kopi\nc.append(0)\nprint(a)         # [1, 2, 3, 99] (uendret)`}
        </Code>
        <KeyPoints
          items={[
            "Lister er muterbare — du kan endre dem på plass.",
            "b = a lager ikke kopi. Bruk a.copy() eller list(a) for det.",
            "Slice (lst[2:5]) lager derimot alltid en ny liste.",
            "len() gir lengden, ikke siste indeks.",
          ]}
        />
      </>
    ),
  },
  {
    nr: 11,
    topic: "Python kap. 11",
    title: "Multidimensjonale lister",
    summary: "Lister av lister — rutenett, matriser, og nestede løkker.",
    readMinutes: 7,
    body: (
      <>
        <P>
          En 2D-liste er bare en liste av lister. Du indekserer to ganger:{" "}
          <code>grid[rad][kol]</code>. Dette mønsteret dekker rutenett,
          spillebrett, og enkel matrisematematikk.
        </P>
        <H2>Strukturen</H2>
        <F.Grid2D />
        <Code>
          {`grid = [\n  [1, 2, 3],\n  [4, 5, 6],\n  [7, 8, 9],\n]\n\ngrid[0][0]   # 1  (øverst venstre)\ngrid[2][2]   # 9  (nederst høyre)`}
        </Code>
        <H2>Iterere over alle celler</H2>
        <P>
          Bruk nøstede løkker — ytre over rader, indre over kolonner:
        </P>
        <Code>
          {`for rad in grid:\n    for v in rad:\n        print(v, end=" ")\n    print()       # ny linje per rad`}
        </Code>
        <H2>Bygge en tom matrise</H2>
        <P>
          Et vanlig mønster, men pass opp for aliasing-fellen:
        </P>
        <Code>
          {`# RIKTIG: ny indre liste per rad\nm = [[0] * 3 for _ in range(3)]\n\n# FEIL: alle rader er SAMME liste!\nm = [[0] * 3] * 3   # endring av m[0] endrer alle radene`}
        </Code>
        <KeyPoints
          items={[
            "2D-liste = liste av lister; grid[rad][kol].",
            "Nøstede løkker er den naturlige gjennomgangen.",
            "[[0]*3]*3 lager 3 referanser til samme rad — bruk list-comprehension.",
          ]}
        />
      </>
    ),
  },
  {
    nr: 12,
    topic: "Python kap. 12",
    title: "Arv og polymorfi",
    summary: "Bygge nye klasser oppå eksisterende — gjenbruk + spesialisering.",
    readMinutes: 9,
    body: (
      <>
        <P>
          Arv lar deg lage en ny klasse som starter med alt en eksisterende
          klasse har, og legge til eller endre etter behov. Det er gjenbruk uten
          kopiering.
        </P>
        <H2>Hierarki</H2>
        <F.InheritanceTree />
        <Code>
          {`class Dyr:\n    def __init__(self, navn):\n        self.navn = navn\n    def lyd(self):\n        return "..."\n\nclass Hund(Dyr):       # arver fra Dyr\n    def lyd(self):     # overstyrer\n        return "voff"`}
        </Code>
        <H2>Override</H2>
        <P>
          Subklassen kan overstyre en metode med samme navn. Hvilken som kjører
          bestemmes av instansens faktiske type, ikke variabelens deklarerte
          type — dette er <em>polymorfi</em>.
        </P>
        <F.MethodOverride />
        <Code>
          {`dyr_liste = [Hund("Rex"), Katt("Mons")]\nfor d in dyr_liste:\n    print(d.lyd())   # "voff", "mjau" — riktig per instans`}
        </Code>
        <H2>Kalle superklassen</H2>
        <P>
          Inni en overstyrt metode kan du fortsatt nå den opprinnelige
          versjonen via <code>super()</code>:
        </P>
        <Code>
          {`class Puddel(Hund):\n    def __init__(self, navn, farge):\n        super().__init__(navn)   # gjør det Hund.__init__ gjorde\n        self.farge = farge`}
        </Code>
        <KeyPoints
          items={[
            "class B(A): B arver alt fra A.",
            "Overstyring: ny metode med samme navn skygger over forelderens.",
            "super() når du trenger å bygge på forelderens oppførsel, ikke erstatte den.",
            "Polymorfi: samme kall, riktig oppførsel per type.",
          ]}
        />
      </>
    ),
  },
  {
    nr: 13,
    topic: "Python kap. 13",
    title: "Filer og unntak",
    summary: "Lese og skrive filer trygt — og håndtere ting som går galt.",
    readMinutes: 9,
    body: (
      <>
        <P>
          Filer er stien fra programmet ditt til varig lagring. Unntak er
          Pythons måte å si fra om at noe gikk galt — et tall som ikke kunne
          parses, en fil som ikke finnes, en nettverkskobling som forsvant.
        </P>
        <H2>Livssyklus av en fil</H2>
        <F.FileLifecycle />
        <P>
          Åpne, gjør noe, lukk. Glemmer du å lukke, kan dataene være ufullstendige
          på disk. <code>with</code>-blokken gjør det automatisk:
        </P>
        <Code>
          {`with open("data.txt", "r", encoding="utf-8") as f:\n    innhold = f.read()\n# her er f allerede lukket\n\nwith open("ut.txt", "w", encoding="utf-8") as f:\n    f.write("Hei\\n")\n    f.write("Verden\\n")`}
        </Code>
        <H2>Linje for linje</H2>
        <Code>
          {`with open("data.txt") as f:\n    for linje in f:        # itererer naturlig\n        if "feil" in linje:\n            print(linje.strip())`}
        </Code>
        <H2>Unntak</H2>
        <P>
          Når noe går galt kaster Python et unntak. Hvis du ikke fanger det,
          krasjer programmet. <code>try/except</code> gir deg muligheten til å
          reagere kontrollert.
        </P>
        <F.TryExceptFlow />
        <Code>
          {`try:\n    n = int(input("Tall: "))\n    print(100 / n)\nexcept ValueError:\n    print("Det var ikke et tall.")\nexcept ZeroDivisionError:\n    print("Kan ikke dele på null.")\nfinally:\n    print("Ferdig.")  # alltid`}
        </Code>
        <KeyPoints
          items={[
            "Bruk with open(...) as f: — slipper å huske close().",
            "open(\"r\") for lesing, \"w\" for skriving (overskriver), \"a\" for tillegg.",
            "try/except fanger spesifikke unntak — fang aldri bare \"Exception\" uten grunn.",
            "finally kjøres alltid, både ved suksess og feil — nyttig til opprydning.",
          ]}
        />
      </>
    ),
  },
  {
    nr: 14,
    topic: "Python kap. 14",
    title: "Tupler, sets og dicts",
    summary: "Tre samlingstyper som dekker resten av hverdagsbehovene.",
    readMinutes: 10,
    body: (
      <>
        <P>
          Når en liste ikke er rett verktøy, har Python tre andre alternativer:
          <strong> tupler</strong> for fastsydde sekvenser,{" "}
          <strong>sets</strong> for unike elementer, og{" "}
          <strong>dicts</strong> for nøkkel-til-verdi-oppslag.
        </P>
        <H2>Tupler — uforanderlige lister</H2>
        <F.TupleVsList />
        <P>
          Når en samling ikke skal endres etter at den er laget, er en tuple
          riktig. Bonus: tupler kan brukes som dict-nøkler og set-medlemmer,
          mens lister ikke kan.
        </P>
        <Code>
          {`punkt = (3, 4)\nx, y = punkt          # unpacking\n\nposisjoner = { (0,0), (1,2) }   # set av tupler — OK`}
        </Code>
        <H2>Sets — matematiske mengder</H2>
        <F.SetOps />
        <Code>
          {`unike = set([1, 2, 2, 3, 3, 3])   # {1, 2, 3}\na = {1, 2, 3}\nb = {2, 3, 4}\na | b    # {1, 2, 3, 4}  union\na & b    # {2, 3}        snitt\na - b    # {1}           differanse`}
        </Code>
        <P>
          Sets sjekker medlemskap i konstant tid: <code>x in stort_set</code> er
          mye raskere enn <code>x in stor_liste</code>.
        </P>
        <H2>Dicts — nøkkel-til-verdi</H2>
        <F.DictStructure />
        <Code>
          {`pris = {"eple": 12, "banan": 8}\npris["eple"]              # 12\npris["melk"] = 25         # legge til\ndel pris["banan"]         # fjerne\n"eple" in pris            # True\n\nfor nøkkel, verdi in pris.items():\n    print(nøkkel, verdi)`}
        </Code>
        <KeyPoints
          items={[
            "Tuple: fast rekkefølge, ingen endring etter opprettelse.",
            "Set: unike elementer, ingen rekkefølge, lynrask in-sjekk.",
            "Dict: nøkkel → verdi, lynrask oppslag, bevarer innsettingsrekkefølge.",
            "Bare hashable verdier (tall, str, tuple) kan være dict-nøkler eller set-medlemmer.",
          ]}
        />
      </>
    ),
  },
  {
    nr: 19,
    topic: "Python kap. 19",
    title: "Rekursjon",
    summary: "Funksjoner som kaller seg selv — base case + recursive case.",
    readMinutes: 9,
    body: (
      <>
        <P>
          En rekursiv funksjon er en funksjon som kaller seg selv på et mindre
          problem. To ting må alltid være på plass: en <em>base case</em> som
          ikke kaller videre, og et <em>rekursivt steg</em> som beveger seg mot
          base case.
        </P>
        <H2>Klassikeren: fakultet</H2>
        <Code>
          {`def fak(n):\n    if n == 0:           # base case\n        return 1\n    return n * fak(n-1)  # rekursivt steg`}
        </Code>
        <H2>Kallstacken vokser</H2>
        <F.RecursionStack />
        <P>
          Hver gjentakelse legger en ny ramme. Når base case nås, returnerer
          funksjonen og rammene løses opp én etter én — verdiene multipliseres
          sammen på vei tilbake.
        </P>
        <H2>Rekursjonstrær</H2>
        <P>
          Når et rekursivt kall gir flere nye kall, blir bildet et tre. Naiv
          Fibonacci er beryktet for å regne samme verdi mange ganger:
        </P>
        <F.RecursionTree />
        <Code>
          {`def fib(n):\n    if n < 2:\n        return n\n    return fib(n-1) + fib(n-2)`}
        </Code>
        <H2>Når rekursjon, når løkke?</H2>
        <P>
          Hvis problemet bryter naturlig ned i mindre versjoner av seg selv —
          traversering av tre, splitt-og-hersk — er rekursjon ofte den klareste
          måten. For lineær iterasjon er en løkke gjerne både raskere og enklere
          å lese.
        </P>
        <KeyPoints
          items={[
            "Alltid en base case som stopper rekursjonen.",
            "Hvert kall må bevege seg mot base case — ellers stack overflow.",
            "Naiv rekursjon kan duplisere arbeid — memoisering hjelper.",
            "Trær og fraktale strukturer er en naturlig pasning for rekursjon.",
          ]}
        />
      </>
    ),
  },
  {
    nr: 21,
    topic: "Python kap. 21",
    title: "Sorteringsalgoritmer",
    summary: "Selection sort og insertion sort, steg for steg.",
    readMinutes: 8,
    body: (
      <>
        <P>
          De enkleste sorteringsalgoritmene er O(n²) — to nestede løkker over
          n elementer. De er trege for store datamengder, men gull verdt for å
          forstå hvordan sortering virker.
        </P>
        <H2>Selection sort</H2>
        <P>
          Idé: finn det minste elementet i den usorterte delen, bytt det inn på
          neste ledige plass. Gjenta.
        </P>
        <F.SelectionSortSteps />
        <Code>
          {`def selection_sort(a):\n    for i in range(len(a)):\n        min_idx = i\n        for j in range(i+1, len(a)):\n            if a[j] < a[min_idx]:\n                min_idx = j\n        a[i], a[min_idx] = a[min_idx], a[i]   # bytt`}
        </Code>
        <H2>Insertion sort</H2>
        <P>
          Idé: ta neste element fra den usorterte delen, sett det inn på riktig
          plass i den sorterte delen. Som å holde kort på hånd og sortere etter
          hvert som du får et nytt.
        </P>
        <F.InsertionSortSteps />
        <Code>
          {`def insertion_sort(a):\n    for i in range(1, len(a)):\n        nå = a[i]\n        j = i - 1\n        while j >= 0 and a[j] > nå:\n            a[j+1] = a[j]   # skyv høyre\n            j -= 1\n        a[j+1] = nå`}
        </Code>
        <KeyPoints
          items={[
            "Begge er O(n²) i verste fall — ikke bruk på store datamengder.",
            "Insertion sort er O(n) på allerede sortert input.",
            "list.sort() i Python bruker Timsort (O(n log n)) — i praksis alltid bedre.",
            "Å forstå disse er likevel nyttig — de er ofte byggesteiner.",
          ]}
        />
      </>
    ),
  },
  {
    nr: 22,
    topic: "Python kap. 22",
    title: "Lenkede lister og køer",
    summary: "En annen måte å bygge sekvenser: noder med pekere.",
    readMinutes: 9,
    body: (
      <>
        <P>
          En lenket liste er en sekvens bygd opp av små noder som peker på
          hverandre. Til forskjell fra Pythons innebygde liste (som er et
          dynamisk array) er innsetting og fjerning i midten konstant tid.
          Tilgang etter posisjon er derimot O(n).
        </P>
        <H2>Strukturen</H2>
        <F.LinkedListSingly />
        <Code>
          {`class Node:\n    def __init__(self, verdi, neste=None):\n        self.verdi = verdi\n        self.neste = neste\n\nhead = Node("A", Node("B", Node("C")))`}
        </Code>
        <H2>Innsetting</H2>
        <F.LinkedListInsert />
        <P>
          For å sette inn X mellom A og B trenger du bare endre to pekere — A
          peker nå på X, og X peker på B. Ingen elementer flyttes.
        </P>
        <H2>Køer</H2>
        <P>
          En kø (FIFO) er en liste der du legger til i den ene enden og tar ut i
          den andre. En lenket liste er en effektiv backing-struktur fordi begge
          operasjoner er O(1). Pythons{" "}
          <code>collections.deque</code> implementerer dette ferdig:
        </P>
        <Code>
          {`from collections import deque\nkø = deque()\nkø.append("Ada")        # bakerst\nkø.append("Bob")\nførst = kø.popleft()    # "Ada" — fremst ut`}
        </Code>
        <KeyPoints
          items={[
            "Node = verdi + peker til neste node.",
            "Innsetting/fjerning i midten: O(1) hvis du har noden.",
            "Tilgang etter indeks: O(n) — du må gå gjennom kjeden.",
            "deque er Pythons ferdige kø/dobbeltkø — bruk den i praksis.",
          ]}
        />
      </>
    ),
  },
  {
    nr: 23,
    topic: "Python kap. 23",
    title: "Binære søketrær",
    summary: "Sorterte trær som gir O(log n) oppslag i balansert tilfelle.",
    readMinutes: 10,
    body: (
      <>
        <P>
          Et binært søketre (BST) er et tre der hver node har opptil to barn, og
          en streng sorteringsregel: alle verdier i venstre subtre er mindre enn
          noden, alle i høyre er større.
        </P>
        <H2>Strukturen</H2>
        <F.BSTStructure />
        <Code>
          {`class Node:\n    def __init__(self, verdi):\n        self.verdi = verdi\n        self.venstre = None\n        self.høyre = None`}
        </Code>
        <H2>Søk</H2>
        <P>
          Sammenlign med roten — gå venstre hvis mindre, høyre hvis større. Hvert
          steg halverer (omtrent) hvor mye av treet som er igjen.
        </P>
        <F.BSTSearchPath />
        <Code>
          {`def søk(rot, mål):\n    if rot is None:\n        return False\n    if mål == rot.verdi:\n        return True\n    if mål < rot.verdi:\n        return søk(rot.venstre, mål)\n    return søk(rot.høyre, mål)`}
        </Code>
        <H2>Innsetting</H2>
        <P>
          Samme algoritme som søk, men når du faller av treet (None) hekter du
          den nye noden på der.
        </P>
        <Code>
          {`def sett_inn(rot, verdi):\n    if rot is None:\n        return Node(verdi)\n    if verdi < rot.verdi:\n        rot.venstre = sett_inn(rot.venstre, verdi)\n    elif verdi > rot.verdi:\n        rot.høyre = sett_inn(rot.høyre, verdi)\n    return rot`}
        </Code>
        <H2>Balanse</H2>
        <P>
          Et BST gir O(log n) bare hvis det er balansert. Setter du inn 1, 2,
          3, 4, 5 i rekkefølge ender du opp med en degenerert «liste» og O(n)
          oppslag. Selv-balanserende varianter (AVL, rød-svart) løser dette.
        </P>
        <KeyPoints
          items={[
            "Invariant: venstre subtre < node < høyre subtre.",
            "Søk/innsetting følger én sti — O(høyde) operasjoner.",
            "Balansert tre: høyde ≈ log₂(n). Skjevt tre: høyde ≈ n.",
            "I-order traversering av et BST gir verdiene sortert.",
          ]}
        />
      </>
    ),
  },
];

export function findChapter(nr: number): PythonChapter | undefined {
  return PYTHON_CHAPTERS.find((c) => c.nr === nr);
}
