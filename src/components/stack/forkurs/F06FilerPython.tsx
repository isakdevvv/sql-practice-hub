import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  FileCode,
  BookOpen,
  Cpu,
  Server,
  Play,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { VisualDefs } from "@/components/stack/kurose-kurs/VisualDefs";
import {
  OpenFileIcon,
  CloseFileIcon,
  WithBlockIcon,
  FilstiIcon,
} from "./forkursIcons";

type FilModus = "r" | "w" | "a";

/**
 * F-06 Lese og skrive filer i Python.
 * Metafor: filen er en bok på biblioteket, open() henter den, with er
 * et utlån med innleveringsgaranti.
 * Forutsetter F-05. Bygger forutsetning for DK-10 (sockets skriver bytes til fil).
 */
export function F06FilerPython() {
  return (
    <StackPageShell title="Forkurs · F-06" group="eksamen">
      <article className="container mx-auto px-4 py-10 max-w-3xl">
        <Crumbs />
        <Header />
        <DualSubjectWhy />
        <SectionTitle id="metafor" nr="1" tittel="Metaforen: filen er en bok på biblioteket" />
        <Metafor />
        <SectionTitle id="modes" nr="2" tittel="Modes — r, w, a (les, skriv, legg til)" />
        <ModesVisualisering />
        <SectionTitle id="with" nr="3" tittel="with-blokk — utlån med innleveringsgaranti" />
        <WithSeksjon />
        <SectionTitle id="lab" nr="4" tittel="Mini-lab: kjør et skript mot et fake-filsystem" />
        <FakeFilLab />
        <SectionTitle id="komplett" nr="5" tittel="Komplett eksempel: tell linjer i en fil" />
        <KomplettEksempel />
        <SectionTitle id="drill" nr="6" tittel="Sjekk forståelsen" />
        <Drill />
        <SectionTitle id="neste" nr="7" tittel="Neste steg" />
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
      <span className="text-foreground">F-06 Lese og skrive filer i Python</span>
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
        Lese og skrive filer i Python
      </h1>
      <p className="mt-3 text-muted-foreground leading-relaxed">
        Når en socket mottar data, må du som regel <em>lagre</em> det et sted —
        til disk, for å analysere eller spille av senere. Dette er den siste
        biten av Python-grunnsteinen før vi kan begynne på det
        nettverksmessige: <strong>åpne</strong>, <strong>lese</strong>,{" "}
        <strong>skrive</strong> og <strong>lukke</strong> filer på en trygg
        måte.
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
          I socket-pensum mottar serveren bytes fra klienten med{" "}
          <code className="text-purple-300">recv()</code>. Disse må ofte
          skrives til en fil — f.eks. en mottatt bilde eller logg. Du trenger
          <code className="text-purple-300"> open(..., "wb")</code> og en{" "}
          <code className="text-purple-300">with</code>-blokk.
        </p>
      </div>
      <div className="rounded-lg border border-brand/30 bg-brand/5 p-4">
        <div className="flex items-center gap-2 text-brand font-semibold text-sm mb-2">
          <Cpu className="h-4 w-4" /> Hvorfor for DTE-2505 (OS)
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Filsystemet er kjernen i OS-pensum. Å lese{" "}
          <code className="text-brand">/proc/cpuinfo</code> eller parse{" "}
          <code className="text-brand">/etc/passwd</code> i et lite Python-skript
          gir deg konkret følelse for hvordan filer ER bare strenger på disk.
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

/* ---------- Kode-blokk (egen kopi per fil-policy) ---------- */

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

function CodeLine({ line }: { line: string }) {
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
    "with",
    "as",
    "open",
  ];
  const parts = line.split(/(\s+|[(),:[\]{}])/);
  return (
    <>
      {parts.map((p, i) => {
        if (!p) return null;
        if (p.startsWith("#")) {
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

/* ---------- Metafor ---------- */

function Metafor() {
  return (
    <div className="space-y-4 text-sm leading-relaxed">
      <p>
        Tenk på en fil på harddisken som en{" "}
        <strong>bok i et bibliotek</strong>. Innholdet ligger i hyllen — det er
        der hele tiden. Men du kan ikke bare lese fra hyllen direkte; du må
        først låne boka.
      </p>
      <p>
        <code className="text-brand">open("data.txt")</code> er å gå til
        utlånsskranken og be om boka. Du får en{" "}
        <em>kvittering</em> tilbake (et fil-objekt). Med kvitteringen i hånda
        kan du lese, blade, skrive. Men: boka må{" "}
        <strong>leveres tilbake</strong>. Hvis du glemmer det, blir den stående
        i hånda di for alltid — det er en{" "}
        <em>resource leak</em>, og operativsystemet liker det ikke.
      </p>
      <p>
        <code className="text-brand">with</code>-blokka er som å låne boka med
        en automatisk innleverings-garanti: "uansett hva jeg gjør med den —
        leser, blar, gråter, kræsjer programmet — så er den levert tilbake når
        jeg går ut av blokka". Det er derfor{" "}
        <code className="text-brand">with</code> er foretrukket framfor manuell{" "}
        <code className="text-brand">close()</code>.
      </p>
      <VisualDefs
        title="Ordliste så langt"
        items={[
          {
            term: "open()",
            icon: <OpenFileIcon />,
            body: "Lån filen ut — be operativsystemet om tilgang. Returnerer et fil-objekt (kvitteringen) du leser eller skriver gjennom.",
          },
          {
            term: "close()",
            icon: <CloseFileIcon />,
            body: "Lever tilbake. Frigjør fil-håndtaket. Glemmer du den, lekker du ressurser.",
          },
          {
            term: "with",
            icon: <WithBlockIcon />,
            body: "Automatisk innlevering. Når blokka slutter, kalles close() for deg — også hvis det oppstår en feil. Foretrukket framfor manuell close().",
          },
          {
            term: "filsti",
            icon: <FilstiIcon />,
            body: (
              <>
                Adressen til boka i biblioteket — f.eks.{" "}
                <code className="font-mono">./data.txt</code> eller{" "}
                <code className="font-mono">/home/student/notes.txt</code>.
              </>
            ),
          },
        ]}
      />
    </div>
  );
}

/* ---------- Modes-visualisering ---------- */

function ModesVisualisering() {
  const [modus, setModus] = useState<FilModus>("r");
  return (
    <div className="my-6">
      <p className="text-sm leading-relaxed mb-4">
        Når du åpner en fil, må du si <em>hvorfor</em>. De tre vanligste er:
      </p>
      <div className="grid grid-cols-3 gap-2 mb-4">
        <ModusKnapp aktiv={modus === "r"} onClick={() => setModus("r")} kode='"r"' navn="les" />
        <ModusKnapp aktiv={modus === "w"} onClick={() => setModus("w")} kode='"w"' navn="skriv" />
        <ModusKnapp aktiv={modus === "a"} onClick={() => setModus("a")} kode='"a"' navn="legg til" />
      </div>
      <ModusForklaring modus={modus} />
    </div>
  );
}

function ModusKnapp({
  aktiv,
  onClick,
  kode,
  navn,
}: {
  aktiv: boolean;
  onClick: () => void;
  kode: string;
  navn: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md border px-3 py-3 text-center transition ${
        aktiv
          ? "border-brand/50 bg-brand/10 text-brand"
          : "border-border bg-background hover:bg-muted/40"
      }`}
    >
      <div className="font-mono text-sm font-semibold">{kode}</div>
      <div className="text-[10px] text-muted-foreground mt-1">{navn}</div>
    </button>
  );
}

function ModusForklaring({ modus }: { modus: FilModus }) {
  const data = {
    r: {
      tittel: "r — read (les)",
      kode: 'f = open("notes.txt", "r")\nprint(f.read())\nf.close()',
      forklaring:
        "Åpner en eksisterende fil for lesing. Hvis filen ikke finnes, får du en FileNotFoundError. Filen forblir uendret.",
      for: ["Hei verden", "Linje 2", "Linje 3"],
      etter: ["Hei verden", "Linje 2", "Linje 3"],
      farge: "blue",
    },
    w: {
      tittel: "w — write (skriv, overskriv alt)",
      kode: 'f = open("notes.txt", "w")\nf.write("Ny start")\nf.close()',
      forklaring:
        "Tømmer filen FØR du begynner å skrive. Eksisterende innhold forsvinner. Hvis filen ikke finnes, opprettes den.",
      for: ["Hei verden", "Linje 2", "Linje 3"],
      etter: ["Ny start"],
      farge: "red",
    },
    a: {
      tittel: "a — append (legg til på slutten)",
      kode: 'f = open("notes.txt", "a")\nf.write("\\nLinje 4")\nf.close()',
      forklaring:
        "Beholder eksisterende innhold og legger nytt bakerst. Trygt valg når du skal loggføre noe over tid.",
      for: ["Hei verden", "Linje 2", "Linje 3"],
      etter: ["Hei verden", "Linje 2", "Linje 3", "Linje 4"],
      farge: "green",
    },
  }[modus];

  const fargeKlass =
    data.farge === "red"
      ? "border-red-500/40 bg-red-500/5"
      : data.farge === "green"
        ? "border-green-500/40 bg-green-500/5"
        : "border-blue-500/40 bg-blue-500/5";

  return (
    <div className={`rounded-xl border ${fargeKlass} p-5 space-y-4`}>
      <div className="font-semibold text-sm">{data.tittel}</div>
      <Kode linjer={data.kode.split("\n")} />
      <p className="text-xs text-muted-foreground leading-relaxed">{data.forklaring}</p>
      <div className="grid grid-cols-2 gap-3">
        <FilVisualisering tittel="notes.txt FØR" linjer={data.for} />
        <FilVisualisering tittel="notes.txt ETTER" linjer={data.etter} highlight />
      </div>
    </div>
  );
}

function FilVisualisering({
  tittel,
  linjer,
  highlight,
}: {
  tittel: string;
  linjer: string[];
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-md border p-3 ${
        highlight ? "border-brand/40 bg-brand/5" : "border-border bg-background/60"
      }`}
    >
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
        {tittel}
      </div>
      <div className="font-mono text-[11px] space-y-0.5">
        {linjer.length === 0 ? (
          <div className="text-muted-foreground italic">(tom)</div>
        ) : (
          linjer.map((l, i) => (
            <div key={i}>
              <span className="text-muted-foreground/40 mr-2">{i + 1}</span>
              {l}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ---------- with-blokk ---------- */

function WithSeksjon() {
  return (
    <div className="space-y-4 text-sm leading-relaxed my-6">
      <p>
        Sammenlign disse to versjonene av samme operasjon. Begge gjør det
        samme — men én av dem er trygg, og én er en bombe som venter.
      </p>
      <div className="grid md:grid-cols-2 gap-3">
        <div className="rounded-lg border border-red-500/40 bg-red-500/5 p-4">
          <div className="flex items-center gap-2 text-red-300 font-semibold text-sm mb-2">
            <AlertTriangle className="h-4 w-4" /> Manuell close() — skjør
          </div>
          <Kode
            linjer={[
              'f = open("data.txt", "r")',
              "innhold = f.read()",
              "# hva hvis denne kræsjer?",
              "behandle(innhold)",
              "f.close()  # nås kanskje aldri",
            ]}
          />
          <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
            Hvis <code>behandle(innhold)</code> kaster en feil, hopper Python
            ut av funksjonen FØR{" "}
            <code className="text-red-300">close()</code> blir nådd. Filen
            forblir åpen — du har en lekkasje.
          </p>
        </div>
        <div className="rounded-lg border border-green-500/40 bg-green-500/5 p-4">
          <div className="flex items-center gap-2 text-green-300 font-semibold text-sm mb-2">
            <CheckCircle2 className="h-4 w-4" /> with-blokk — trygt
          </div>
          <Kode
            linjer={[
              'with open("data.txt", "r") as f:',
              "    innhold = f.read()",
              "    behandle(innhold)",
              "# her ER filen lukket,",
              "# uansett hva som skjedde inne.",
            ]}
          />
          <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
            Når blokka slutter (på vanlig måte ELLER ved en feil), kaller
            Python automatisk{" "}
            <code className="text-green-300">f.close()</code>. Du kan ikke
            glemme det.
          </p>
        </div>
      </div>
      <div className="rounded-md border border-brand/30 bg-brand/5 p-3 text-xs text-muted-foreground">
        <Lightbulb className="h-3 w-3 inline mr-1 text-brand" />{" "}
        <strong>Tommelfingerregel:</strong> Bruk{" "}
        <code className="text-brand">with</code> hver gang du åpner en fil. Bare
        skriv manuell <code>open</code>/<code>close</code> hvis du har en svært
        god grunn (du har sjelden det).
      </div>
    </div>
  );
}

/* ---------- Mini-lab: interaktivt fake-filsystem ---------- */

type Operasjon = {
  modus: FilModus;
  innhold: string;
  beskrivelse: string;
};

function FakeFilLab() {
  const start = ["Hei verden", "Linje 2"];
  const [linjer, setLinjer] = useState<string[]>(start);
  const [historikk, setHistorikk] = useState<string[]>([]);

  const operasjoner: Operasjon[] = [
    {
      modus: "r",
      innhold: "",
      beskrivelse: "Leser filen (ingen endring)",
    },
    {
      modus: "w",
      innhold: "Ny linje",
      beskrivelse: 'open("...", "w") + write("Ny linje")',
    },
    {
      modus: "a",
      innhold: "Lagt til",
      beskrivelse: 'open("...", "a") + write("\\nLagt til")',
    },
  ];

  const kjor = (op: Operasjon) => {
    if (op.modus === "r") {
      setHistorikk((h) => [...h, `read() → returnerte ${linjer.length} linjer`]);
      return;
    }
    if (op.modus === "w") {
      setLinjer([op.innhold]);
      setHistorikk((h) => [...h, `"w": tømt fil, skrev '${op.innhold}'`]);
      return;
    }
    if (op.modus === "a") {
      setLinjer((l) => [...l, op.innhold]);
      setHistorikk((h) => [...h, `"a": la til '${op.innhold}' bakerst`]);
      return;
    }
  };

  const reset = () => {
    setLinjer(start);
    setHistorikk([]);
  };

  return (
    <div className="my-6 rounded-xl border border-border bg-card/30 p-5">
      <p className="text-sm leading-relaxed mb-4">
        Klikk knappene under for å se hva som skjer med <code>notes.txt</code>.
        Du eksperimenterer her — filen er trygt fake.
      </p>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
            notes.txt (live)
          </div>
          <div className="rounded-md border border-brand/30 bg-background/60 p-3 min-h-[120px] font-mono text-xs">
            {linjer.length === 0 ? (
              <div className="text-muted-foreground italic">(tom fil)</div>
            ) : (
              linjer.map((l, i) => (
                <div key={i}>
                  <span className="text-muted-foreground/40 mr-2">{i + 1}</span>
                  {l}
                </div>
              ))
            )}
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
            Historikk
          </div>
          <div className="rounded-md border border-border bg-background/60 p-3 min-h-[120px] text-[11px] font-mono space-y-1">
            {historikk.length === 0 ? (
              <div className="text-muted-foreground italic">
                Trykk en knapp nedenfor for å begynne...
              </div>
            ) : (
              historikk.map((h, i) => (
                <div key={i} className="text-muted-foreground">
                  &gt; {h}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 justify-center">
        {operasjoner.map((op, i) => (
          <button
            key={i}
            onClick={() => kjor(op)}
            className={`rounded-md border px-3 py-2 text-xs font-medium flex items-center gap-1.5 ${
              op.modus === "r"
                ? "border-blue-500/40 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20"
                : op.modus === "w"
                  ? "border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/20"
                  : "border-green-500/40 bg-green-500/10 text-green-300 hover:bg-green-500/20"
            }`}
          >
            <Play className="h-3 w-3" />
            {op.beskrivelse}
          </button>
        ))}
        <button
          onClick={reset}
          className="rounded-md border border-border bg-background px-3 py-2 text-xs font-medium hover:bg-muted/40 flex items-center gap-1.5"
        >
          <RotateCcw className="h-3 w-3" /> Reset
        </button>
      </div>
      <div className="mt-4 rounded-md border border-brand/30 bg-brand/5 p-3 text-xs text-muted-foreground">
        <strong className="text-brand">Legg merke til:</strong> trykker du{" "}
        <code>"w"</code> ETTER at filen har innhold, blir det BORTE. Det er en
        klassisk feil. Hvis du vil bevare gammelt innhold, bruk{" "}
        <code>"a"</code>.
      </div>
    </div>
  );
}

/* ---------- Komplett eksempel ---------- */

function KomplettEksempel() {
  return (
    <div className="my-6 space-y-4 text-sm leading-relaxed">
      <p>
        Her er et komplett, kjørbart skript som teller hvor mange linjer en fil
        har. Les koden, så gjennomgår vi den linje for linje.
      </p>
      <Kode
        linjer={[
          "# count_lines.py",
          'with open("notes.txt", "r") as f:',
          "    linjer = f.readlines()",
          "",
          "print(\"Antall linjer:\", len(linjer))",
          "for i, linje in enumerate(linjer):",
          "    print(i + 1, linje.strip())",
        ]}
      />
      <ol className="text-xs text-muted-foreground space-y-1.5 pl-5 list-decimal">
        <li>
          <code className="text-brand">with open(...) as f</code> — åpne for
          lesing, få fil-objekt <code>f</code>, automatisk close etterpå.
        </li>
        <li>
          <code className="text-brand">f.readlines()</code> — leser HELE filen
          inn i en <em>liste</em> av strenger, én streng per linje. Husk lista
          fra F-05.
        </li>
        <li>
          <code className="text-brand">len(linjer)</code> — bruker
          listefunksjonen fra F-05 til å telle.
        </li>
        <li>
          <code className="text-brand">enumerate</code> — gir oss både indeks
          og verdi mens vi går gjennom lista. <code>i + 1</code> fordi vi vil
          ha linjenummer fra 1, ikke 0.
        </li>
        <li>
          <code className="text-brand">.strip()</code> — fjerner linjeskift på
          slutten, så <code>print</code> ikke lager dobbelt mellomrom.
        </li>
      </ol>
      <div className="rounded-md border border-border bg-card/40 p-3 text-xs text-muted-foreground">
        <Lightbulb className="h-3 w-3 inline mr-1 text-brand" /> Dette skriptet
        ER mønsteret du kommer til å se igjen og igjen i datakomm:{" "}
        <em>open i with → process → close skjer automatisk</em>.
      </div>
    </div>
  );
}

/* ---------- Drill ---------- */

function Drill() {
  const sporsmal: { q: string; valg: string[]; riktig: number; forklaring: string }[] = [
    {
      q: "Du har en fil notes.txt med 5 linjer. Hva skjer hvis du gjør open(\"notes.txt\", \"w\") og lukker uten å skrive noe?",
      valg: [
        "Filen er uendret, 5 linjer som før",
        "Filen er nå tom (0 linjer)",
        "Du får en FileExistsError",
        "Bare første linje slettes",
      ],
      riktig: 1,
      forklaring:
        "\"w\" tømmer filen i det øyeblikket du åpner den. Ikke når du skriver — når du åpner. Selv om du ikke skriver noe etterpå, er den nå tom. Det er hovedforskjellen fra \"a\".",
    },
    {
      q: 'Hva er forskjellen mellom modus "r" og "r+"?',
      valg: [
        '"r+" finnes ikke i Python',
        '"r" leser bare, "r+" leser OG skriver i samme handle',
        '"r+" tømmer filen først som "w"',
        '"r" må brukes med with, "r+" må ikke',
      ],
      riktig: 1,
      forklaring:
        '"r" gir kun lese-tilgang. "r+" gir lese- OG skrive-tilgang uten å tømme filen først. Den finnes, men du trenger den sjelden — vanligst er ren "r" eller "w".',
    },
    {
      q: "Hvorfor er with-blokk å foretrekke framfor manuell open() + close()?",
      valg: [
        "Den er raskere",
        "Den garanterer close() selv om noe kræsjer underveis",
        "Den støtter flere modes",
        "Den er den eneste måten å skrive til disk på",
      ],
      riktig: 1,
      forklaring:
        "Hele poenget med with er garantert opprydning. Hvis koden inne i blokka kaster en feil, blir filen lukket likevel — ingen lekkasje. Manuell close() risikerer å aldri bli nådd.",
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
        Du kan nå lese fra og skrive til filer trygt. Det betyr at når du
        kommer til socket-pensum (DK-10 Sockets), kan du fokusere på det
        nye — protokoll, bytes, adresser — uten å snuble i fil-håndtering.
      </p>
      <div className="grid sm:grid-cols-2 gap-3">
        <Link
          to="/forkurs"
          className="group rounded-md border border-brand/30 bg-brand/5 p-4 hover:bg-brand/10 transition"
        >
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-1">
            Fase F2 fullført
          </div>
          <div className="font-medium text-sm flex items-center gap-2">
            Tilbake til forkurs-løypen
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
            Se alle forkurs-bitene
            <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition" />
          </div>
        </Link>
      </div>
      <div className="mt-4 text-xs text-muted-foreground">
        Denne biten åpner opp for: <code className="text-brand">DK-10</code>{" "}
        (sockets — du skal lese bytes fra <code>recv()</code> og skrive til
        fil), <code className="text-brand">SEC-*</code> (parse loggfiler), og
        <code className="text-brand"> OS-FS-*</code> (skriv småskript som leser
        fra <code>/proc</code>).
      </div>
      <div className="mt-3 text-[10px] text-muted-foreground flex items-center gap-1.5">
        <FileCode className="h-3 w-3" />
        <span>Lag en fil <code>test.txt</code> i terminalen og prøv koden over selv — det fester seg dobbelt så raskt.</span>
      </div>
    </div>
  );
}
