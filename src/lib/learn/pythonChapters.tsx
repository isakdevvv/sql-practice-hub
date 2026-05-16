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
        <H2>Innrykk er språket</H2>
        <P>
          Før vi dykker i <code>if</code>: Python har ingen krøllparanteser.
          Hvilke linjer som hører til hvilken blokk avgjøres av{" "}
          <em>innrykk</em>. Bytter du innrykk, bytter du blokk:
        </P>
        <F.IndentationBlocks />
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
        <H2>Hva skjer steg-for-steg</H2>
        <P>
          Python går gjennom kjeden ovenfra og ned, stopper ved første{" "}
          <code>True</code>, og kjører <em>kun</em> den greinen. Resten hoppes
          over — ikke evaluert i det hele tatt. Dette er viktig når
          betingelsene har bivirkninger eller er dyre å beregne.
        </P>
        <F.ConditionalAnatomy />
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
        <H2>Truthiness — hva regnes som sant?</H2>
        <P>
          Du kan skrive <code>if x:</code> uten å sammenligne mot noe. Da
          oversetter Python via <code>bool(x)</code>. Reglene er enkle: tomme
          samlinger og null-aktige verdier er <em>falsy</em>, alt annet er{" "}
          <em>truthy</em>:
        </P>
        <F.TruthinessLadder />
        <KeyPoints
          items={[
            "Bare én grein i en if/elif/else-kjede kjører.",
            "Sammenligning gir alltid True/False — bruk == og !=, ikke = og ≠.",
            "and / or short-circuit'er: høyresiden evalueres bare når den må.",
            "Tomme samlinger, 0 og None er falsy. Alt annet er truthy.",
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
        <H2>Anatomien av en løkke — fire steg</H2>
        <P>
          Hver løkke er bygd opp av de samme fire stegene. Lærer du å se dem,
          slipper du både evige løkker og av-med-én-feil:
        </P>
        <F.LoopAnatomy />
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
        <H2>Hva er en for-løkke egentlig?</H2>
        <P>
          Under panseret er <code>for</code> bare en pen forkortelse for en{" "}
          <em>iterator</em> + en <code>next()</code>-løkke. Det er derfor den
          virker likt på lister, strenger og generator-funksjoner:
        </P>
        <F.ForLoopDesugar />
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
        <H2>Anatomien av en def — ord for ord</H2>
        <P>
          Hvert ord i en <code>def</code>-linje har en presis rolle. Lærer du
          dem, kan du lese vilkårlige funksjons-signaturer og skjønne hva som
          skjer ved kall:
        </P>
        <F.FunctionAnatomy />
        <H2>Tilordning — hva skjer ved <code>=</code></H2>
        <P>
          Før vi går videre, en presisering som gjelder all Python-kode:{" "}
          <code>=</code> evaluerer alltid <em>høyre side først</em>, lager
          (eller finner) et objekt på heap-en, og binder så navnet til
          adressen til det objektet:
        </P>
        <F.AssignmentSteps />
        <H2>Hvilken operator binder strammest?</H2>
        <P>
          Når høyre side har flere operatorer uten paranteser, evaluerer
          Python etter en fast prioritets-rekkefølge. <code>3 + 4 * 2</code>{" "}
          blir <code>11</code>, ikke <code>14</code>, fordi <code>*</code>{" "}
          binder strammere enn <code>+</code>. Tabellen viser de vanligste —{" "}
          <strong>1 = sterkest</strong>:
        </P>
        <F.OperatorPrecedence />
        <H2>Flere parametre og standardverdier</H2>
        <Code>
          {`def hilsen(navn, hilsemate="Hei"):\n    return f"{hilsemate}, {navn}!"\n\nhilsen("Ada")           # "Hei, Ada!"\nhilsen("Bob", "Hallo")   # "Hallo, Bob!"`}
        </Code>
        <H2>Hva ligger på heap-en — én rad per type</H2>
        <P>
          Før vi snakker om adresser: hver verdi i Python er et heap-objekt
          med sin egen <code>id</code>. Tabellen viser hvordan de mest brukte
          typene skiller seg fra hverandre — hvilket{" "}
          <em>syntaktisk kjennemerke</em> de har, om de er mutable, og hvor
          mye de typisk veier i bytes.
        </P>
        <F.TypeOverview />
        <H2>Argumenter er adresser, ikke kopier</H2>
        <P>
          Når du sender et objekt inn i en funksjon, får parameteren{" "}
          <em>adressen</em> til samme heap-objekt som kalleren har. Dette er
          spesielt viktig å se for muterbare standardverdier — de evalueres{" "}
          <em>én gang</em> når <code>def</code> kjører, ikke på nytt per kall:
        </P>
        <F.MutableDefaultArg />
        <Code>
          {`def legg(x, b=[]):     # b = [] evalueres én gang ved def!\n    b.append(x)\n    return b\n\nlegg(1)   # [1]\nlegg(2)   # [1, 2]  ← samme liste, ikke ny\nlegg(3)   # [1, 2, 3]\n\n# Riktig idiom: bruk None som sentinel\ndef legg(x, b=None):\n    if b is None:\n        b = []\n    b.append(x)\n    return b`}
        </Code>
        <P>
          Kjør koden i Visualiser-panelet — du vil se at <code>b</code> i alle
          tre kall har samme <code>id=…</code>. Variabelen holder en adresse,
          ikke en verdi.
        </P>
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
        <F.CallFrameDetail />
        <F.CallStackGrowth />
        <KeyPoints
          items={[
            "Parametre binder seg til argumenter ved kall — ny ramme på stacken.",
            "return sender verdi tilbake. Uten return returneres None.",
            "Lokale variabler dør når funksjonen returnerer.",
            "Argumenter sendes som adresser — muter et list-/dict-argument og kalleren ser endringen.",
            "Mutable default-arg = én delt heap-liste per def. Bruk None-sentinel.",
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
        <H2><code>self</code> er bare en variabel som holder en adresse</H2>
        <P>
          Hver instans bor som et eget objekt på heap-en med sin egen{" "}
          <code>id(…)</code>. Når du skriver <code>rex.bjeff()</code>, finner
          Python metoden i klassen og kaller den med <code>rex</code> som
          første argument — det er det vi ellers kaller <code>self</code>.
          Inni metoden er <code>self</code> rett og slett en lokal variabel
          som holder adressen til riktig instans:
        </P>
        <F.SelfReference />
        <Code>
          {`rex = Hund("Rex")\nmira = Hund("Mira")\nprint(id(rex), id(mira))   # to ulike adresser\n\nrex.bjeff()                # self bindes til rex (samme id som over)\nmira.bjeff()               # self bindes til mira (annen id)`}
        </Code>
        <P>
          Kjør koden i Visualiser-panelet — du ser to <code>Hund</code>-bokser
          på heap-en med ulike <code>id=…</code>, og <code>self</code>{" "}
          peker på den som tilhører kallet.
        </P>
        <H2>Metode vs. funksjon — hva er forskjellen egentlig?</H2>
        <P>
          En metode er bare en funksjon som bor inne i en klasse. Punkt-syntaksen{" "}
          <code>obj.metode(x)</code> er syntaktisk sukker — Python oversetter
          den til <code>Klasse.metode(obj, x)</code> ved kalltidspunkt. Det er
          dét som gjør at <code>self</code> alltid får riktig instans:
        </P>
        <F.MethodVsFunction />
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
        <H2>Anatomien av s[a:b:c]</H2>
        <P>
          Slicing skiller seg fra de fleste språk på to måter: indekser er
          kant-posisjoner (ikke tegnene selv), og du kan ha et{" "}
          <em>steg</em>. Det forklarer både hvorfor stoppen er eksklusiv og
          hvorfor <code>s[::-1]</code> snur en streng:
        </P>
        <F.SlicingAnatomy />
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
        <H2><code>is</code> vs <code>==</code> og interning</H2>
        <P>
          Strenger er uforanderlige objekter på heap-en, og hver streng har en{" "}
          <em>adresse</em> — det Python kaller <code>id(s)</code>.{" "}
          <code>==</code> sammenligner <em>verdiene</em> tegn for tegn,{" "}
          <code>is</code> sammenligner <em>adressene</em>. Det er to ulike
          spørsmål — og de gir ofte ulikt svar:
        </P>
        <F.IsVsEquals />
        <Code>
          {`a = "hei verden"\nb = "hei verden"\na == b   # True  (samme verdi)\na is b   # ofte False (to ulike heap-objekter)\n\nx = "ok"\ny = "ok"\nx is y   # True — Python "interner" korte/identifier-aktige strenger`}
        </Code>
        <P>
          Python bestemmer selv hvilke strenger som blir <em>interned</em>{" "}
          (delt på samme adresse) — typisk korte og identifier-lignende. Stol
          aldri på <code>is</code> for verdi-likhet. Eneste tilfellet hvor{" "}
          <code>is</code> er riktig: sammenligning mot <code>None</code>,{" "}
          <code>True</code> og <code>False</code>, som alltid er enkelt-objekter
          i Python.
        </P>
        <KeyPoints
          items={[
            "Strenger er uforanderlige — metoder returnerer ny streng.",
            "Negativ indeks teller fra slutten: s[-1] er siste tegn.",
            "Slice s[a:b] inkluderer a, ekskluderer b.",
            "Bruk f-strenger for interpolasjon.",
            "== sjekker verdi, is sjekker adresse (id). Bruk is bare mot None/True/False.",
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
        <H2>List-comprehension — kompakt for-løkke</H2>
        <P>
          List-comprehensions ser kryptiske ut første gang, men er bare en
          kortere måte å skrive <em>"lag en liste ved å iterere og samle"</em>.
          Diagrammet viser den eksakte oversettelsen mellom de to formene:
        </P>
        <F.ComprehensionDesugar />
        <Code>
          {`# Comprehension\nkvadrater = [x*x for x in range(5)]\n\n# Eksakt det samme:\nkvadrater = []\nfor x in range(5):\n    kvadrater.append(x*x)\n\n# Med filter:\npositive_kvadrater = [x*x for x in tall if x > 0]`}
        </Code>
        <KeyPoints
          items={[
            "Lister er muterbare — du kan endre dem på plass.",
            "b = a lager ikke kopi. Bruk a.copy() eller list(a) for det.",
            "Slice (lst[2:5]) lager derimot alltid en ny liste.",
            "len() gir lengden, ikke siste indeks.",
            "[expr for x in xs if cond] er sukker for en for-løkke med append.",
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
        <H2>Bygge en tom matrise — aliasing-fellen i 2D</H2>
        <P>
          Et vanlig mønster, men pass opp for aliasing-fellen. Multiplikasjon
          av en liste kopierer <em>referanser</em>, ikke selve elementene. Med
          en indre liste betyr det at alle radene ender opp som samme objekt
          på heap-en — samme <code>id</code>:
        </P>
        <F.NestedListAliasing />
        <Code>
          {`# FEIL: alle rader er SAMME liste!\nm = [[0] * 3] * 3\nm[0][0] = 9\nprint(m)              # [[9,0,0], [9,0,0], [9,0,0]] — alle endret\nprint(id(m[0]) == id(m[1]) == id(m[2]))   # True\n\n# RIKTIG: ny indre liste per rad\nm = [[0] * 3 for _ in range(3)]\nm[0][0] = 9\nprint(m)              # [[9,0,0], [0,0,0], [0,0,0]]\nprint(id(m[0]) == id(m[1]))               # False`}
        </Code>
        <P>
          Kjør begge variantene i Visualiser-panelet — du ser én indre boks
          med tre piler i den feile versjonen, og tre separate bokser med ulik
          <code>id=…</code> i den riktige.
        </P>
        <KeyPoints
          items={[
            "2D-liste = liste av lister; grid[rad][kol].",
            "Nøstede løkker er den naturlige gjennomgangen.",
            "[[0]*3]*3 lager 3 referanser til samme rad (samme id) — bruk list-comprehension.",
            "id(m[0]) == id(m[1]) er testen som avslører aliasing.",
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
        <H2>Hvorfor må nøkler være «hashable»?</H2>
        <P>
          Dict-er finner verdier ved å regne <code>hash(nøkkel)</code> og
          bruke det som indeks i en intern tabell. For at oppslaget skal
          fungere, må samme nøkkel alltid gi samme hash — altså må nøkkelens{" "}
          identitet være <em>stabil</em>. Et muterbart objekt (som en liste)
          kan endre seg etter at du har lagt det inn, og da finner Python det
          ikke igjen i bøtta. Derfor er det forbudt:
        </P>
        <F.HashableKeys />
        <Code>
          {`d = {}\nd[(1, 2)] = "a"      # OK: tuple er immutable, hash stabil\nd[[1, 2]] = "b"      # TypeError: unhashable type: 'list'\n\n# Vil du ha listen som nøkkel? Konverter til tuple:\nd[tuple([1, 2])] = "b"`}
        </Code>
        <P>
          Samme regel gjelder for <code>set</code>-medlemmer. I praksis: tall,
          strenger, tupler (av hashable elementer) og <code>frozenset</code>{" "}
          fungerer; lister, sets og dicts gjør ikke.
        </P>
        <KeyPoints
          items={[
            "Tuple: fast rekkefølge, ingen endring etter opprettelse.",
            "Set: unike elementer, ingen rekkefølge, lynrask in-sjekk.",
            "Dict: nøkkel → verdi, lynrask oppslag, bevarer innsettingsrekkefølge.",
            "Bare hashable verdier (tall, str, tuple) kan være dict-nøkler eller set-medlemmer.",
            "Hashable = stabil hash, som krever at objektet ikke kan muteres.",
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
        <H2><code>.neste</code> er en adresse</H2>
        <P>
          Hver node er sitt eget objekt på heap-en med en egen{" "}
          <code>id(…)</code>. Feltet <code>.neste</code> holder bare adressen
          til neste node — ingen kopi av dataene. Slutten av lista markeres
          med <code>None</code>, som betyr "ingen adresse":
        </P>
        <F.LinkedListNodeIds />
        <Code>
          {`head = Node("A", Node("B", Node("C")))\nprint(id(head))           # f.eks. 1001\nprint(id(head.neste))     # f.eks. 1002 — annet objekt\nprint(head.neste.neste.neste is None)   # True — slutten`}
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
        <H2>Hver node har <em>to adresser</em></H2>
        <P>
          Akkurat som i lenkede lister er <code>venstre</code> og{" "}
          <code>høyre</code> adresser til andre <code>Node</code>-objekter på
          heap-en — eller <code>None</code> hvis det ikke finnes noe barn der.
          Det er hele poenget med "<code>if rot is None</code>"-sjekken: vi
          spør om vi har en adresse å følge.
        </P>
        <F.BSTNodeIds />
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
  {
    nr: 24,
    topic: "Python kap. 24",
    title: "Hashing",
    summary: "Slå opp på O(1) ved å regne ut hvor verdien ligger.",
    readMinutes: 11,
    body: (
      <>
        <P>
          Tenk på et oppslag i en stor liste: du må gå gjennom elementene ett
          for ett til du finner det du leter etter — O(n). Et balansert tre
          presser det ned til O(log n). Hashing går et hakk lenger: i stedet
          for å lete, <em>regn ut</em> hvor svaret må ligge. Det tar konstant
          tid.
        </P>
        <H2>Idéen</H2>
        <P>
          En <em>hash-funksjon</em> tar inn en nøkkel (f.eks. en streng) og
          spytter ut et heltall — en indeks i en intern tabell. Lagrer du
          verdien på den indeksen, kan du senere kjøre samme funksjon med samme
          nøkkel og gå rett dit. Ingen leting.
        </P>
        <F.HashTableLayout />
        <P>
          Python-objektet <code>dict</code> bruker hashing under panseret. Når
          du skriver <code>alder["Ada"] = 30</code>, kjører Python{" "}
          <code>hash("Ada")</code>, krymper det ned til en tabellindeks, og
          legger paret der. <code>alder["Ada"]</code> senere gjør samme regning
          og henter verdien direkte.
        </P>
        <H2>Fra nøkkel-id til bøtte</H2>
        <P>
          Selve nøkkelen er et heap-objekt med en <code>id(…)</code>.{" "}
          <code>hash(nøkkel)</code> deriveres fra innholdet (ikke{" "}
          <code>id</code>-en direkte — to like strenger skal kunne treffe
          samme bøtte selv om de bor på ulike adresser), og resultatet kappes
          ned til tabellstørrelsen:
        </P>
        <F.HashFromIdToBucket />
        <P>
          Det er derfor nøkkelen må være <em>uforanderlig</em>: hadde
          <code>hash</code> kunnet endre seg etter innsetting, ville Python
          slått opp i feil bøtte.
        </P>
        <H2>Krympe hash-koden til en indeks</H2>
        <P>
          <code>hash("Ada")</code> i Python er et stort tall (gjerne negativt).
          Tabellen har kanskje 16 plasser. Vanlig triks:{" "}
          <code>indeks = hash_kode % N</code>, der N er tabellstørrelsen. Hvis
          N er en toer-potens (16, 32, 64, …) kan du bytte modulo med en rask
          bit-AND:
        </P>
        <Code>
          {`# Begge gir samme svar når N = 2^k\nindeks = hash_kode % N\nindeks = hash_kode & (N - 1)   # mye raskere`}
        </Code>
        <P>
          Det fungerer fordi <code>N − 1</code> er en maske som plukker ut de
          k laveste bitene — akkurat det som blir igjen etter modulo.
        </P>
        <H2>Kollisjoner</H2>
        <P>
          To forskjellige nøkler kan havne på samme indeks. Det kalles en{" "}
          <em>kollisjon</em>, og det er uunngåelig så lenge antall mulige
          nøkler er større enn tabellstørrelsen. Det finnes to vanlige
          løsninger.
        </P>
        <H2>Separat chaining</H2>
        <P>
          Hver tabellplass er en liten liste (bøtte). Ved kollisjon legges det
          nye paret bakerst i bøtta. Ved oppslag går du gjennom kjeden og
          sammenligner nøklene.
        </P>
        <F.HashCollisionChaining />
        <H2>Lineær probing (åpen adressering)</H2>
        <P>
          Alternativ: kollisjoner havner ikke i en kjede, men i neste ledige
          celle. Hvis 3 er opptatt, prøv 4, så 5, og så videre.
        </P>
        <F.HashLinearProbing />
        <P>
          Probing er minne-effektivt (ingen kjeder) men danner{" "}
          <em>klynger</em> — sammenhengende blokker av fulle celler — som
          gjør at både innsetting og søk må gå gjennom hele klynga før de
          finner rom.
        </P>
        <H2>Load factor og rehashing</H2>
        <P>
          Load factor λ = antall elementer / tabellstørrelse. Når λ blir for
          høy (vanlig terskel: 0.75 for probing, 0.9 for chaining), blir det
          for mange kollisjoner og oppslag tregner. Løsning: <em>rehash</em> —
          lag en ny, dobbelt så stor tabell og legg inn alle eksisterende
          elementer på nytt. Det er O(n), men skjer sjelden, så gjennomsnittlig
          innsetting forblir O(1).
        </P>
        <H2>Minimumsoppskrift på __hash__</H2>
        <P>
          Lager du en egen klasse og vil bruke den som dict-nøkkel eller sette
          den i et <code>set</code>, må <code>__eq__</code> og{" "}
          <code>__hash__</code> være konsistente: to objekter som er like
          (etter <code>__eq__</code>) må gi samme hash. Det omvendte trenger
          ikke gjelde.
        </P>
        <Code>
          {`class Punkt:\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y\n\n    def __eq__(self, other):\n        return isinstance(other, Punkt) and (self.x, self.y) == (other.x, other.y)\n\n    def __hash__(self):\n        return hash((self.x, self.y))   # bygg på et tuple av feltene`}
        </Code>
        <KeyPoints
          items={[
            "Hashing erstatter leting med utregning — O(1) i snitt.",
            "Kollisjoner løses med chaining (kjeder) eller probing (neste ledige celle).",
            "Når N er 2^k: indeks = hash & (N − 1) gir samme svar som % N, men raskere.",
            "Load factor over ≈ 0.75 → rehash til større tabell.",
            "__hash__ og __eq__ skal være konsistente i egne klasser.",
            "Worst case er O(n) (alt i én bøtte), men en god hash-funksjon gjør det ekstremt sjeldent.",
          ]}
        />
      </>
    ),
  },
  {
    nr: 25,
    topic: "Python kap. 25",
    title: "Grafer — DFS og BFS",
    summary: "Modeller relasjoner, traverser dem dypt eller bredt.",
    readMinutes: 12,
    body: (
      <>
        <P>
          En graf er en mengde <em>noder</em> som er koblet sammen med{" "}
          <em>kanter</em>. Sosiale nettverk, T-banekart, lenker mellom
          nettsider og avhengighetsgrafer mellom pakker er alle grafer. Når
          problemet ditt handler om "hvem kan nå hvem", "kortest vei", eller
          "er alt koblet sammen", er det sannsynligvis en graf bak.
        </P>
        <H2>Grunnbegreper</H2>
        <P>
          En graf er <em>rettet</em> hvis kantene har en retning (A følger B
          på sosiale medier, men ikke nødvendigvis omvendt), eller{" "}
          <em>urettet</em> hvis kantene går begge veier (to Bluetooth-enheter
          er paret). <em>Grad</em> av en node er antall kanter som rører den.
          To noder er <em>naboer</em> hvis det går en kant mellom dem.
        </P>
        <H2>Representasjon</H2>
        <P>To vanlige måter:</P>
        <P>
          <strong>Nabomatrise</strong>: en V×V-tabell der <code>m[i][j]</code>{" "}
          er 1 om det går en kant fra i til j, ellers 0. Rask oppslag "er i og
          j naboer?" — O(1) — men bruker V² plass selv om grafen er nesten tom.
        </P>
        <P>
          <strong>Naboliste</strong>: én liste per node med dens umiddelbare
          naboer. Plass: O(V + E). Mest brukt fordi de fleste grafer i praksis
          er <em>sparse</em> (få kanter sammenlignet med V²).
        </P>
        <F.GraphAdjacencyList />
        <Code>
          {`# Naboliste som dict-of-lists\ngraf = {\n    "A": ["B", "C", "D"],\n    "B": ["A", "D"],\n    "C": ["A", "D"],\n    "D": ["A", "B", "C"],\n}`}
        </Code>
        <P>
          Strengene <code>"B"</code> og <code>"C"</code> i <code>graf["A"]</code>{" "}
          er ikke kopier av nodene — de er nøkler tilbake inn i samme
          dict. Bruker du i stedet en klasse <code>Node</code>, blir
          naboliste-innslagene <em>adresser</em> (referanser) til samme
          heap-objekter:
        </P>
        <F.GraphAdjAddresses />
        <Code>
          {`# Med Node-objekter: nabolisten holder adressene direkte\nclass Node:\n    def __init__(self, navn):\n        self.navn = navn\n        self.naboer = []\n\na, b, c, d = Node("A"), Node("B"), Node("C"), Node("D")\na.naboer = [b, c, d]   # b, c, d her er ID-ene til de samme objektene\nprint(a.naboer[0] is b)   # True — samme adresse, ikke kopi`}
        </Code>
        <H2>Depth-first search (DFS)</H2>
        <P>
          DFS starter på en node, går så dypt som mulig langs én gren før den
          snur og prøver en annen. Tenk på det som å løse en labyrint hvor du
          alltid tar første ledige sidegang, og bare snur når du møter en
          blindvei.
        </P>
        <F.DFSWalk />
        <Code>
          {`def dfs(graf, start):\n    sett = set()\n\n    def besøk(u):\n        if u in sett:\n            return\n        sett.add(u)\n        print(u)            # gjør noe med noden her\n        for v in graf[u]:\n            besøk(v)\n\n    besøk(start)`}
        </Code>
        <P>
          For å unngå uendelig løkke i en graf med sykler må vi huske hvilke
          noder vi har besøkt. <code>sett</code> tar den jobben.
        </P>
        <H2>Breadth-first search (BFS)</H2>
        <P>
          BFS sprer seg utover lag for lag: først alle naboene til start, så
          alle <em>deres</em> naboer, og så videre. Dette gir en viktig
          egenskap: i en urettet og uvektet graf finner BFS{" "}
          <strong>korteste sti</strong> (i antall kanter) fra startnoden.
        </P>
        <F.BFSWalk />
        <Code>
          {`from collections import deque\n\ndef bfs(graf, start):\n    sett = {start}\n    kø = deque([start])\n    forelder = {start: None}   # for å rekonstruere stien\n\n    while kø:\n        u = kø.popleft()\n        for v in graf[u]:\n            if v not in sett:\n                sett.add(v)\n                forelder[v] = u\n                kø.append(v)\n    return forelder`}
        </Code>
        <P>
          Etter en BFS kan du følge <code>forelder[mål]</code> tilbake til
          startnoden og snu lista — det er korteste vei.
        </P>
        <H2>DFS eller BFS?</H2>
        <P>
          De har samme tidskompleksitet — O(V + E) — så valget handler om hva
          spørsmålet er:
        </P>
        <P>
          DFS er kjekt for å finne <em>en eller annen</em> sti, oppdage
          sykler, eller traversere et tre i preorder. BFS er rett verktøy for
          korteste sti (uvektet), eller "alt innenfor k hopp".
        </P>
        <KeyPoints
          items={[
            "Graf = noder + kanter. Rettet eller urettet, vektet eller uvektet.",
            "Naboliste passer for sparse grafer (de fleste). Plass O(V + E).",
            "DFS dykker dypt med rekursjon/stack. BFS sprer bredt med kø.",
            "Begge er O(V + E) — uavhengig av hvor mange ganger en kant nesten ble besøkt.",
            "BFS i uvektet graf = korteste sti i antall kanter.",
            "Husk å markere besøkte noder, ellers løper du i ring rundt sykler.",
          ]}
        />
      </>
    ),
  },
  {
    nr: 26,
    topic: "Python kap. 26",
    title: "Vektede grafer — MST og Dijkstra",
    summary: "Når kantene koster noe: minimum spanning tree og korteste sti.",
    readMinutes: 13,
    body: (
      <>
        <P>
          Nå har hver kant et tall — en vekt. Det kan være kilometer mellom
          steder, kabelpris mellom rom, sekunder mellom maskiner. To klassiske
          spørsmål dukker opp.
        </P>
        <F.WeightedGraphExample />
        <P>
          <strong>1. Minimum spanning tree (MST):</strong> hva er den billigste
          måten å koble alle nodene sammen på? Eksempel: et bygg har flere
          rom; du skal legge nettverkskabel slik at alle rom henger sammen, og
          du vil bruke minst mulig kabel. Det blir et tre — V−1 kanter, ingen
          sykler — som spenner over alle noder med lavest mulig samlet vekt.
        </P>
        <P>
          <strong>2. Korteste sti (Dijkstra):</strong> gitt en startnode, hva
          er minste samlet vekt for å komme fra start til hver av de andre?
          Eksempel: hva er raskeste vei fra stua til skolen, gitt at hvert
          gateavsnitt har en kjent reisetid?
        </P>
        <H2>Prims algoritme for MST</H2>
        <P>
          Idéen er enkel og grådig: bygg treet vekstvis. Start med én vilkårlig
          node i et sett <code>T</code>. Ved hvert steg, se på alle kanter som
          går fra en node i <code>T</code> til en node <em>utenfor</em>{" "}
          <code>T</code>, og legg til den billigste. Gjenta til alle noder er
          inne.
        </P>
        <F.PrimStep />
        <Code>
          {`def prim(graf, start):\n    # graf[u] = [(nabo, vekt), ...]\n    T = {start}\n    tre = []   # kanter i MST\n    total = 0\n\n    while len(T) < len(graf):\n        # finn billigste kant ut av T\n        beste = None\n        for u in T:\n            for v, w in graf[u]:\n                if v not in T:\n                    if beste is None or w < beste[2]:\n                        beste = (u, v, w)\n        u, v, w = beste\n        T.add(v)\n        tre.append((u, v, w))\n        total += w\n    return tre, total`}
        </Code>
        <P>
          Den naive løkken her er O(V·E). I praksis bruker man en heap (Python
          har <code>heapq</code>) for å hente den letteste kanten i O(log E) —
          da blir hele algoritmen O(E log V).
        </P>
        <H2>Dijkstras algoritme for korteste sti</H2>
        <P>
          Veldig lik struktur som Prim, men vi sammenligner ikke vekten på{" "}
          <em>kanten</em> — vi sammenligner{" "}
          <em>samlet avstand fra startnoden</em>.
        </P>
        <P>
          Hold en tabell <code>cost[v]</code> = "billigste kjente vei fra
          start til v". Initialiser <code>cost[start] = 0</code>, alle andre
          til uendelig. Ved hvert steg: ta noden utenfor T med lavest cost,
          legg den i T, og se om noen av naboene kan nås billigere gjennom
          denne noden enn det vi hadde notert. Oppdater i så fall.
        </P>
        <F.DijkstraTable />
        <Code>
          {`import heapq\n\ndef dijkstra(graf, start):\n    cost = {u: float("inf") for u in graf}\n    cost[start] = 0\n    forelder = {start: None}\n    heap = [(0, start)]   # (cost, node)\n\n    while heap:\n        c, u = heapq.heappop(heap)\n        if c > cost[u]:\n            continue       # gammel oppføring\n        for v, w in graf[u]:\n            ny = c + w\n            if ny < cost[v]:\n                cost[v] = ny\n                forelder[v] = u\n                heapq.heappush(heap, (ny, v))\n    return cost, forelder`}
        </Code>
        <P>
          Heap-versjonen er O((V + E) log V). Linje-for-linje-versjonen uten
          heap finner minimum med en lineær gjennomgang og er O(V²) — fortsatt
          OK for små grafer og enklere å forklare på eksamen.
        </P>
        <H2>Når fungerer Dijkstra ikke?</H2>
        <P>
          Dijkstra antar at alle vekter er <em>ikke-negative</em>. Med
          negative vekter kan algoritmen "låse fast" en suboptimal kostnad for
          tidlig. For grafer som tillater negative kanter trenger du
          Bellman-Ford (utenfor pensum, men greit å vite at det finnes).
        </P>
        <H2>Prim vs Dijkstra — ett ords forskjell</H2>
        <P>Begge plukker grådig "neste node" fra V−T. Forskjellen:</P>
        <Code>
          {`# Prim — billigste KANT fra T til V−T\nif w < beste:\n    beste = w\n\n# Dijkstra — billigste SAMLET avstand til start\nif cost[u] + w < cost[v]:\n    cost[v] = cost[u] + w`}
        </Code>
        <P>
          Prim ser bare på kanten alene. Dijkstra ser på hele veien tilbake
          til startnoden.
        </P>
        <KeyPoints
          items={[
            "Vekt = tall på kanten. Modellerer kostnad, avstand, tid, …",
            "MST = billigste måten å koble alle noder sammen på, V−1 kanter, ingen sykler.",
            "Prim bygger MST grådig: legg til billigste kant ut av treet.",
            "Dijkstra finner korteste sti fra én startnode til alle andre.",
            "Dijkstra sammenligner cost[u] + w(u,v) mot cost[v]. Oppdater hvis billigere.",
            "Dijkstra krever ikke-negative vekter. Negative vekter → Bellman-Ford.",
            "Begge er O(E log V) med heap, O(V²) uten — match med grafstørrelsen.",
          ]}
        />
      </>
    ),
  },
];

export function findChapter(nr: number): PythonChapter | undefined {
  return PYTHON_CHAPTERS.find((c) => c.nr === nr);
}
