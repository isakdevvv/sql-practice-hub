import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Code,
  Terminal,
  Lightbulb,
  BookOpen,
  Cpu,
  Server,
  Play,
} from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { VisualDefs } from "@/components/stack/kurose-kurs/VisualDefs";
import {
  IntIcon,
  StrIcon,
  FloatIcon,
  BoolIcon,
  ListIcon,
  DictIcon,
} from "./forkursIcons";

/**
 * F-05 Python-grunnstein — variabel, datatype, if/else, løkke, funksjon, liste, dict.
 * Repetisjon for studenter som har sett Python før. Rask, ikke barnslig.
 * Forutsetter ingenting. Bygger forutsetning for F-06 og DK-10 (sockets).
 */
export function F05PythonGrunn() {
  return (
    <StackPageShell title="Forkurs · F-05" group="eksamen">
      <article className="container mx-auto px-4 py-10 max-w-3xl">
        <Crumbs />
        <Header />
        <DualSubjectWhy />
        <SectionTitle id="variabel" nr="1" tittel="Variabel og datatyper — navngitte bokser" />
        <VariabelSeksjon />
        <SectionTitle id="ifelse" nr="2" tittel="if/else — forgrening" />
        <IfElseSeksjon />
        <SectionTitle id="lokke" nr="3" tittel="Løkke — gjenta noe" />
        <LokkeSeksjon />
        <SectionTitle id="funksjon" nr="4" tittel="Funksjon — gjenbrukbar oppskrift" />
        <FunksjonSeksjon />
        <SectionTitle id="liste" nr="5" tittel="Liste — ordnet samling" />
        <ListeSeksjon />
        <SectionTitle id="dict" nr="6" tittel="Dict — navngitte oppslag" />
        <DictSeksjon />
        <SectionTitle id="drill" nr="7" tittel="Sjekk forståelsen" />
        <Drill />
        <SectionTitle id="neste" nr="8" tittel="Neste steg" />
        <NesteSteg />
      </article>
    </StackPageShell>
  );
}

function Crumbs() {
  return (
    <div className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
      <Link to="/forkurs" className="hover:text-foreground">Forkurs</Link>
      <span>/</span>
      <span>F2 · Programmeringsoppfriskning</span>
      <span>/</span>
      <span className="text-foreground">F-05 Python-grunnstein</span>
    </div>
  );
}

function Header() {
  return (
    <header className="mb-8">
      <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
        Forkurs · Fase F2 · Programmeringsoppfriskning
      </div>
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
        Python-grunnstein: alt du må kunne på 10 minutter
      </h1>
      <p className="mt-3 text-muted-foreground leading-relaxed">
        Du har sannsynligvis sett Python før. Denne biten er en rask
        oppfriskning av de seks tingene du må ha trygt under huden før du
        skriver socket-kode og leser fra filer: <strong>variabel</strong>,{" "}
        <strong>datatype</strong>, <strong>if/else</strong>,{" "}
        <strong>løkke</strong>, <strong>funksjon</strong>,{" "}
        <strong>liste</strong> og <strong>dict</strong> (dictionary, oppslagstabell). Hver
        seksjon viser et lite eksempel og spør deg hva det printer.
      </p>
    </header>
  );
}

function DualSubjectWhy() {
  return (
    <div className="mb-10 grid sm:grid-cols-2 gap-3">
      <div className="rounded-lg border border-purple-500/30 bg-purple-500/5 p-4">
        <div className="flex items-center gap-2 text-purple-300 font-semibold text-sm mb-2">
          <Server className="h-4 w-4" /> Hvorfor for DTE-2507 (Datakomm)
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Hele socket-pensum er skrevet i Python.{" "}
          <code className="text-purple-300">recv()</code> returnerer{" "}
          <em>bytes</em> du må dekode til{" "}
          <code className="text-purple-300">str</code>, du må sjekke{" "}
          <code className="text-purple-300">if data:</code>, og du må holde
          tilkoblinger i en <code className="text-purple-300">dict</code>{" "}
          mappet på adresse. Uten Python-grunnstein, ingen sockets.
        </p>
      </div>
      <div className="rounded-lg border border-brand/30 bg-brand/5 p-4">
        <div className="flex items-center gap-2 text-brand font-semibold text-sm mb-2">
          <Cpu className="h-4 w-4" /> Hvorfor for DTE-2505 (OS)
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Små Python-skript er den letteste måten å eksperimentere med
          OS-konsepter — lese{" "}
          <code className="text-brand">/proc/cpuinfo</code>, automatisere
          bash-oppgaver, parse loggfiler. Sekundært, men nyttig.
        </p>
      </div>
    </div>
  );
}

function SectionTitle({ id, nr, tittel }: { id: string; nr: string; tittel: string }) {
  return (
    <h2 id={id} className="mt-12 mb-4 text-xl font-semibold scroll-mt-20 flex items-baseline gap-3">
      <span className="text-brand text-base font-mono">{nr}.</span>
      {tittel}
    </h2>
  );
}

/* ---------- Datatype-tag ---------- */

function TypeTag({ type }: { type: "int" | "str" | "float" | "bool" | "list" | "dict" }) {
  const fargeKlass = {
    int: "border-blue-500/40 bg-blue-500/10 text-blue-300",
    str: "border-green-500/40 bg-green-500/10 text-green-300",
    float: "border-yellow-500/40 bg-yellow-500/10 text-yellow-300",
    bool: "border-purple-500/40 bg-purple-500/10 text-purple-300",
    list: "border-cyan-500/40 bg-cyan-500/10 text-cyan-300",
    dict: "border-pink-500/40 bg-pink-500/10 text-pink-300",
  }[type];
  return (
    <span className={`inline-block rounded border px-1.5 py-0.5 text-[10px] font-mono ${fargeKlass}`}>
      {type}
    </span>
  );
}

/* ---------- Kode-blokk ---------- */

function Kode({ linjer }: { linjer: string[] }) {
  return (
    <pre className="rounded-md border border-border bg-background/60 p-3 text-xs font-mono overflow-x-auto leading-relaxed">
      {linjer.map((l, i) => (
        <div key={i} className="whitespace-pre">
          <span className="text-muted-foreground/40 select-none mr-3">
            {String(i + 1).padStart(2, " ")}
          </span>
          <CodeLine line={l} />
        </div>
      ))}
    </pre>
  );
}

/** Lett "syntax-highlight" via Tailwind — ingen ekte lib. */
function CodeLine({ line }: { line: string }) {
  // Veldig naiv tokenisering: keyword/streng/tall/kommentar
  const keywords = [
    "if",
    "elif",
    "else",
    "for",
    "in",
    "while",
    "def",
    "return",
    "True",
    "False",
    "None",
    "and",
    "or",
    "not",
    "print",
    "len",
    "range",
  ];
  // Splitt på mellomrom og bevar dem
  const parts = line.split(/(\s+|[(),:[\]{}])/);
  return (
    <>
      {parts.map((p, i) => {
        if (!p) return null;
        if (p.startsWith("#")) {
          // resten av linja er kommentar
          const rest = parts.slice(i).join("");
          return (
            <span key={i} className="text-muted-foreground italic">
              {rest}
            </span>
          );
        }
        if (/^".*"$|^'.*'$/.test(p)) {
          return (
            <span key={i} className="text-green-300">
              {p}
            </span>
          );
        }
        if (/^-?\d+(\.\d+)?$/.test(p)) {
          return (
            <span key={i} className="text-yellow-300">
              {p}
            </span>
          );
        }
        if (keywords.includes(p)) {
          return (
            <span key={i} className="text-purple-300 font-semibold">
              {p}
            </span>
          );
        }
        return <span key={i}>{p}</span>;
      })}
    </>
  );
}

/* ---------- Forutsi-output-mønster ---------- */

function Forutsi({
  kode,
  valg,
  riktig,
  forklaring,
}: {
  kode: string[];
  valg: string[];
  riktig: number;
  forklaring: string;
}) {
  const [valgt, setValgt] = useState<number | null>(null);
  return (
    <div className="rounded-lg border border-border bg-card/30 p-4 my-4">
      <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2 flex items-center gap-1.5">
        <Play className="h-3 w-3" /> Forutsi output
      </div>
      <Kode linjer={kode} />
      <div className="mt-3 text-xs text-muted-foreground mb-2">
        Hva printer dette?
      </div>
      <div className="space-y-1.5">
        {valg.map((v, i) => {
          const erValgt = valgt === i;
          const erRiktig = i === riktig;
          const visStatus = valgt !== null && erValgt;
          const klass = visStatus
            ? erRiktig
              ? "border-green-500/40 bg-green-500/10 text-green-200"
              : "border-red-500/40 bg-red-500/10 text-red-200"
            : "border-border bg-background hover:bg-muted/40";
          return (
            <button
              key={i}
              onClick={() => setValgt(i)}
              disabled={valgt !== null}
              className={`block w-full text-left rounded-md border px-3 py-2 text-xs font-mono ${klass} disabled:cursor-default`}
            >
              {v}
            </button>
          );
        })}
      </div>
      {valgt !== null && (
        <div className="mt-3 rounded-md border border-brand/30 bg-brand/5 p-3 text-xs text-muted-foreground">
          {valgt === riktig ? (
            <span className="text-green-300 font-semibold">Riktig. </span>
          ) : (
            <span className="text-red-300 font-semibold">Ikke helt. </span>
          )}
          {forklaring}
        </div>
      )}
    </div>
  );
}

/* ---------- Seksjon 1: variabel + datatyper ---------- */

function VariabelSeksjon() {
  return (
    <div className="space-y-4 text-sm leading-relaxed">
      <p>
        En <strong>variabel</strong> er et navn på en verdi. Python figurer
        selv ut typen — du sier ikke "lag en int", du sier{" "}
        <code className="text-brand">x = 5</code>, og så er{" "}
        <code className="text-brand">x</code> en int. Typen følger{" "}
        <em>verdien</em>, ikke navnet.
      </p>
      <VisualDefs
        title="Datatyper i Python"
        items={[
          {
            term: "int",
            icon: <IntIcon />,
            body: (
              <>
                Heltall. Eksempel:{" "}
                <code className="font-mono text-foreground">x = 5</code>
              </>
            ),
          },
          {
            term: "str",
            icon: <StrIcon />,
            body: (
              <>
                Streng (tekst). Eksempel:{" "}
                <code className="font-mono text-foreground">s = &quot;hei&quot;</code>
              </>
            ),
          },
          {
            term: "float",
            icon: <FloatIcon />,
            body: (
              <>
                Desimaltall. Eksempel:{" "}
                <code className="font-mono text-foreground">f = 3.14</code>
              </>
            ),
          },
          {
            term: "bool",
            icon: <BoolIcon />,
            body: (
              <>
                Sann/usann. Eksempel:{" "}
                <code className="font-mono text-foreground">b = True</code>
              </>
            ),
          },
          {
            term: "list",
            icon: <ListIcon />,
            body: (
              <>
                Ordnet samling. Eksempel:{" "}
                <code className="font-mono text-foreground">l = [1, 2, 3]</code>
              </>
            ),
          },
          {
            term: "dict",
            icon: <DictIcon />,
            body: (
              <>
                Nøkkel→verdi-tabell. Eksempel:{" "}
                <code className="font-mono text-foreground">d = {"{"}&quot;a&quot;: 1{"}"}</code>
              </>
            ),
          },
        ]}
      />
      <Forutsi
        kode={['x = 5', 'y = "5"', "print(x + x)", "print(y + y)"]}
        valg={["10 og 10", "10 og 55", '"5" og "5"', "Feil — kan ikke addere"]}
        riktig={1}
        forklaring={
          "x er int (5+5=10). y er str (streng). + på strenger limer dem sammen, så y+y er '55'."
        }
      />
    </div>
  );
}

/* ---------- Seksjon 2: if/else ---------- */

function IfElseSeksjon() {
  return (
    <div className="space-y-4 text-sm leading-relaxed">
      <p>
        <code className="text-brand">if</code> kjører bare hvis betingelsen er{" "}
        <TypeTag type="bool" /> <code className="text-brand">True</code>. Bruk{" "}
        <code className="text-brand">elif</code> for flere alternativer,{" "}
        <code className="text-brand">else</code> for alt annet. Indentering
        bestemmer hva som er <em>inne</em> i blokka — fire mellomrom, ikke tab.
      </p>
      <Forutsi
        kode={[
          "alder = 17",
          "if alder >= 18:",
          '    print("voksen")',
          "elif alder >= 13:",
          '    print("tenåring")',
          "else:",
          '    print("barn")',
        ]}
        valg={["voksen", "tenåring", "barn", "Ingenting — feil"]}
        riktig={1}
        forklaring={
          "alder=17, første test 17>=18 er False, så hopper til elif. 17>=13 er True, så printer 'tenåring' og hopper over else."
        }
      />
    </div>
  );
}

/* ---------- Seksjon 3: løkke ---------- */

function LokkeSeksjon() {
  return (
    <div className="space-y-4 text-sm leading-relaxed">
      <p>
        <code className="text-brand">for</code>-løkke går gjennom hvert
        element i noe — en liste, en streng, eller{" "}
        <code className="text-brand">range(n)</code> som lager tall fra 0
        til <em>n</em>-1.{" "}
        <code className="text-brand">while</code> kjører så lenge
        betingelsen er sann.
      </p>
      <Forutsi
        kode={["sum = 0", "for i in range(4):", "    sum = sum + i", "print(sum)"]}
        valg={["4", "6", "10", "0"]}
        riktig={1}
        forklaring={
          "range(4) gir 0,1,2,3. Vi adderer dem alle: 0+1+2+3 = 6. NB: range starter på 0 og slutter FØR 4."
        }
      />
    </div>
  );
}

/* ---------- Seksjon 4: funksjon ---------- */

function FunksjonSeksjon() {
  return (
    <div className="space-y-4 text-sm leading-relaxed">
      <p>
        En <strong>funksjon</strong> er en navngitt oppskrift du kan kjøre
        flere ganger med ulike inndata. Du definerer den med{" "}
        <code className="text-brand">def</code>, og du sender ut et svar med{" "}
        <code className="text-brand">return</code>.
      </p>
      <Forutsi
        kode={[
          "def dobbel(x):",
          "    return x * 2",
          "",
          "a = dobbel(3)",
          "b = dobbel(a)",
          "print(b)",
        ]}
        valg={["3", "6", "12", "9"]}
        riktig={2}
        forklaring={
          "dobbel(3) returnerer 6, så a=6. dobbel(6) returnerer 12, så b=12. To kall: 3 → 6 → 12."
        }
      />
    </div>
  );
}

/* ---------- Seksjon 5: liste ---------- */

function ListeSeksjon() {
  return (
    <div className="space-y-4 text-sm leading-relaxed">
      <p>
        En <TypeTag type="list" /> er en <em>ordnet</em> samling verdier.
        Indeks starter på 0. Du kan hente med{" "}
        <code className="text-brand">l[0]</code>, legge til med{" "}
        <code className="text-brand">l.append(x)</code>, telle med{" "}
        <code className="text-brand">len(l)</code>.
      </p>
      <Forutsi
        kode={[
          "navn = [\"Ada\", \"Bob\", \"Cia\"]",
          "navn.append(\"Dag\")",
          "print(navn[1])",
          "print(len(navn))",
        ]}
        valg={["Bob og 3", "Bob og 4", "Ada og 4", "Cia og 4"]}
        riktig={1}
        forklaring={
          "append legger 'Dag' bakerst. navn[1] er 'Bob' (indeks 0 er 'Ada', indeks 1 er 'Bob'). len blir 4 etter append."
        }
      />
    </div>
  );
}

/* ---------- Seksjon 6: dict ---------- */

function DictSeksjon() {
  return (
    <div className="space-y-4 text-sm leading-relaxed">
      <p>
        En <TypeTag type="dict" /> (dictionary, oppslagstabell) lagrer
        <em> nøkkel→verdi</em>-par. Du henter ikke med tall, men med
        nøkkelen. Brukes overalt i datakomm-pensum: f.eks. en tabell over
        aktive tilkoblinger der nøkkelen er klient-adressen.
      </p>
      <Forutsi
        kode={[
          'aldre = {"Ada": 30, "Bob": 25}',
          'aldre["Cia"] = 28',
          'print(aldre["Bob"])',
          "print(len(aldre))",
        ]}
        valg={["25 og 2", "25 og 3", "30 og 3", "Bob og 3"]}
        riktig={1}
        forklaring={
          "aldre['Bob'] slår opp på nøkkel 'Bob' og finner 25. Etter at vi la til 'Cia' har dict 3 nøkler totalt."
        }
      />
      <div className="rounded-md border border-border bg-card/40 p-4 text-xs text-muted-foreground">
        <Lightbulb className="h-3 w-3 inline mr-1 text-brand" /> <strong>Forskjell list vs dict:</strong> i liste henter du på{" "}
        <em>posisjon</em> (<code>l[0]</code>). I dict henter du på{" "}
        <em>navn</em> (<code>d["Ada"]</code>). Hvis du tenker "jeg vil slå opp
        på et navn", bruk dict.
      </div>
    </div>
  );
}

/* ---------- Drill ---------- */

function Drill() {
  const sporsmal: { q: string; valg: string[]; riktig: number; forklaring: string }[] = [
    {
      q: "Hva er typen til verdien 3.0 i Python?",
      valg: ["int", "float", "str", "bool"],
      riktig: 1,
      forklaring:
        "Punktum gjør tallet til float (desimaltall). 3 alene er int, men 3.0 er float.",
    },
    {
      q: "Hvilken av disse er en dict, ikke en liste?",
      valg: [
        '["Ada", "Bob"]',
        '{"Ada", "Bob"}',
        '{"navn": "Ada", "alder": 30}',
        "(1, 2, 3)",
      ],
      riktig: 2,
      forklaring:
        "Dict bruker krøllparentes OG kolon mellom nøkkel og verdi. Krøllparentes uten kolon er en 'set'. Firkant er liste, rund er tuple.",
    },
    {
      q: "Du skriver `for x in [10, 20, 30]: print(x)`. Hvor mange linjer printes?",
      valg: ["1", "3", "6", "0"],
      riktig: 1,
      forklaring:
        "Løkka går én gang per element i lista. Lista har 3 elementer, så 3 print-kall.",
    },
  ];
  return (
    <div className="my-6 space-y-4">
      {sporsmal.map((s, i) => (
        <Quiz key={i} {...s} nr={i + 1} />
      ))}
    </div>
  );
}

function Quiz({
  nr,
  q,
  valg,
  riktig,
  forklaring,
}: {
  nr: number;
  q: string;
  valg: string[];
  riktig: number;
  forklaring: string;
}) {
  const [valgt, setValgt] = useState<number | null>(null);
  return (
    <div className="rounded-lg border border-border bg-card/30 p-4">
      <div className="text-sm font-medium mb-3">
        <span className="text-brand mr-2">Sjekk {nr}.</span>
        {q}
      </div>
      <div className="space-y-1.5">
        {valg.map((v, i) => {
          const erValgt = valgt === i;
          const erRiktig = i === riktig;
          const visStatus = valgt !== null && erValgt;
          const klass = visStatus
            ? erRiktig
              ? "border-green-500/40 bg-green-500/10 text-green-200"
              : "border-red-500/40 bg-red-500/10 text-red-200"
            : "border-border bg-background hover:bg-muted/40";
          return (
            <button
              key={i}
              onClick={() => setValgt(i)}
              disabled={valgt !== null}
              className={`block w-full text-left rounded-md border px-3 py-2 text-xs ${klass} disabled:cursor-default`}
            >
              {v}
            </button>
          );
        })}
      </div>
      {valgt !== null && (
        <div className="mt-3 rounded-md border border-brand/30 bg-brand/5 p-3 text-xs text-muted-foreground">
          {valgt === riktig ? (
            <span className="text-green-300 font-semibold">Riktig. </span>
          ) : (
            <span className="text-red-300 font-semibold">Ikke helt. </span>
          )}
          {forklaring}
        </div>
      )}
    </div>
  );
}

/* ---------- NesteSteg ---------- */

function NesteSteg() {
  return (
    <div className="my-6 rounded-lg border border-border bg-card/30 p-5">
      <p className="text-sm leading-relaxed mb-4">
        Nå har du Python-grunnsteinen. Neste steg: bruke det til å lese fra og
        skrive til filer — som er forutsetning for sockets, som lagrer mottatte
        bytes til disk.
      </p>
      <div className="grid sm:grid-cols-2 gap-3">
        <Link
          to="/forkurs/$slug"
          params={{ slug: "f06-filer-python" }}
          className="group rounded-md border border-brand/30 bg-brand/5 p-4 hover:bg-brand/10 transition"
        >
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-1">
            F-06 · neste
          </div>
          <div className="font-medium text-sm flex items-center gap-2">
            Lese og skrive filer i Python
            <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition" />
          </div>
        </Link>
        <Link
          to="/forkurs"
          className="group rounded-md border border-border bg-background p-4 hover:bg-muted/40 transition"
        >
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">
            <BookOpen className="h-3 w-3 inline mr-1" /> Oversikt
          </div>
          <div className="font-medium text-sm flex items-center gap-2">
            Tilbake til forkurs-løypen
            <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition" />
          </div>
        </Link>
      </div>
      <div className="mt-4 text-xs text-muted-foreground">
        Denne biten åpner opp for: <code className="text-brand">F-06</code>{" "}
        (filer), <code className="text-brand">DK-10</code> (sockets — recv/send
        i Python), og generell skriptig for{" "}
        <code className="text-brand">OS-*</code>.
      </div>
      <div className="mt-3 text-[10px] text-muted-foreground flex items-center gap-1.5">
        <Terminal className="h-3 w-3" />
        <span>Tips: kjør koden i en terminal med{" "}
          <code>python3 fil.py</code> for å verifisere selv.</span>
      </div>
      <div className="mt-1 text-[10px] text-muted-foreground flex items-center gap-1.5">
        <Code className="h-3 w-3" />
        <span>Eller bruk en REPL: skriv bare <code>python3</code> i terminalen og test linje for linje.</span>
      </div>
    </div>
  );
}
