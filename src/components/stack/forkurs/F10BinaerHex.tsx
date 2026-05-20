import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Hash,
  Calculator,
  BookOpen,
  Cpu,
  Server,
  Lightbulb,
} from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { VisualDefs } from "@/components/stack/kurose-kurs/VisualDefs";
import {
  BitIcon,
  ByteIcon,
  BinaerIcon,
  DesimalIcon,
} from "./forkursIcons";

/**
 * F-10 Binær og heksadesimal — base 2, base 16, bit, byte.
 * Visuell først: klikkbar 8-bit byte, hex-omregner, drill med 5 omregninger.
 */
export function F10BinaerHex() {
  return (
    <StackPageShell title="Forkurs · F-10" group="eksamen">
      <article className="container mx-auto px-4 py-10 max-w-3xl">
        <Crumbs />
        <Header />
        <DualSubjectWhy />
        <SectionTitle id="hvorfor" nr="1" tittel="Hvorfor 0 og 1 — maskinvarens språk" />
        <HvorforBinaer />
        <SectionTitle id="byte" nr="2" tittel="En byte — klikk bitsene selv" />
        <BitFlipper />
        <SectionTitle id="hex" nr="3" tittel="Heksadesimal — kompakt notasjon for binær" />
        <HexForklaring />
        <SectionTitle id="omregner" nr="4" tittel="Omregner — hex ↔ binær ↔ desimal" />
        <Omregner />
        <SectionTitle id="bruksomraader" nr="5" tittel="Hvor du møter dette — chmod, IP, MAC, farger" />
        <Bruksomraader />
        <SectionTitle id="drill" nr="6" tittel="Drill — fem omregninger" />
        <Drill5 />
        <SectionTitle id="quiz" nr="7" tittel="Sjekk forståelsen" />
        <Quizer />
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
      <span>F4 · Tall og krypto-intuisjon</span>
      <span>/</span>
      <span className="text-foreground">F-10 Binær og hex</span>
    </div>
  );
}

function Header() {
  return (
    <header className="mb-8">
      <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
        Forkurs · Fase F4 · Tall og krypto-intuisjon
      </div>
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
        Binær og heksadesimal
      </h1>
      <p className="mt-3 text-muted-foreground leading-relaxed">
        Datamaskiner kan bare det aller enkleste: er strømmen på, eller er den av? Alt — bilder, tekst, video, IP-adresser, passord — bygges på toppen av denne ene skillelinjen. Her bygger vi opp tallsystemet maskinen faktisk bruker, og det kompakte tvillingsystemet vi mennesker bruker for å lese maskinens språk uten å miste forstanden.
      </p>
    </header>
  );
}

function DualSubjectWhy() {
  return (
    <div className="mb-10 grid sm:grid-cols-2 gap-3">
      <div className="rounded-lg border border-brand/30 bg-brand/5 p-4">
        <div className="flex items-center gap-2 text-brand font-semibold text-sm mb-2">
          <Cpu className="h-4 w-4" /> Hvorfor for DTE-2505 (OS)
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Linux-permissions skrives som <code className="text-brand">chmod 755</code> — tre oktale siffer. For å skjønne hva det betyr, må du kunne lese 3 bits om gangen. Filsystemer, minne-adresser og hex-dumps ligger overalt i OS-faget.
        </p>
      </div>
      <div className="rounded-lg border border-purple-500/30 bg-purple-500/5 p-4">
        <div className="flex items-center gap-2 text-purple-300 font-semibold text-sm mb-2">
          <Server className="h-4 w-4" /> Hvorfor for DTE-2507 (Datakomm)
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          IP-adresser er fire byte. Subnett-masker skjæres ned på bit-nivå. MAC-adresser, TCP-flagg, pakke-headere — alle vises som hex, men virker som binær. Uten hex blir Wireshark uleselig.
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

function HvorforBinaer() {
  return (
    <div className="space-y-4 text-sm leading-relaxed">
      <p>
        Inni en prosessor er det milliarder av små brytere. Hver bryter har to tilstander: <strong>på</strong> eller <strong>av</strong>. Strøm eller ingen strøm. Det er hele alfabetet maskinen kan jobbe i. Vi skriver det som <code className="text-brand">1</code> og <code className="text-brand">0</code>, men det kunne like gjerne vært ja/nei eller lys/mørke.
      </p>
      <p>
        Ett slikt på/av-signal kaller vi en <strong>bit</strong> (binary digit). Det er den minste mulige enheten av informasjon. En enkelt bit kan svare på ett ja/nei-spørsmål — for lite til noe nyttig alene.
      </p>
      <p>
        Derfor grupperer vi 8 bits sammen og kaller det en <strong>byte</strong>. Med 8 bits kan vi lage 256 forskjellige kombinasjoner (2⁸ = 256) — nok til å representere én bokstav, ett tall fra 0 til 255, eller én fargekanal.
      </p>
      <VisualDefs
        title="Ordliste så langt"
        items={[
          {
            term: "bit",
            icon: <BitIcon />,
            body: "Ett 0 eller 1 — én bryter på eller av. Minste mulige enhet av informasjon.",
          },
          {
            term: "byte",
            icon: <ByteIcon />,
            body: "8 bits gruppert sammen = ett tall mellom 0 og 255 (2⁸ = 256 kombinasjoner). Nok til én bokstav eller én fargekanal.",
          },
          {
            term: "base 2 / binær",
            icon: <BinaerIcon />,
            body: "Tallsystem med to siffer (0, 1). Maskinens eget alfabet.",
          },
          {
            term: "base 10 / desimal",
            icon: <DesimalIcon />,
            body: "Tallsystemet vi bruker til daglig (0–9). Det vi pleier å regne i.",
          },
        ]}
      />
    </div>
  );
}

function BitFlipper() {
  const [bits, setBits] = useState<number[]>([0, 0, 0, 0, 0, 0, 0, 0]);
  const verdier = [128, 64, 32, 16, 8, 4, 2, 1];

  const toggle = (i: number) => {
    const ny = [...bits];
    ny[i] = ny[i] === 0 ? 1 : 0;
    setBits(ny);
  };
  const reset = () => setBits([0, 0, 0, 0, 0, 0, 0, 0]);
  const alle = () => setBits([1, 1, 1, 1, 1, 1, 1, 1]);

  const desimal = bits.reduce((sum, b, i) => sum + b * verdier[i], 0);
  const hex = desimal.toString(16).toUpperCase().padStart(2, "0");
  const binaer = bits.join("");

  return (
    <div className="my-6">
      <p className="text-sm leading-relaxed mb-4">
        Hver bit i en byte har en <strong>verdi</strong> bestemt av hvor den står. Lengst til venstre står 128, så halveres det for hver plass: 64, 32, 16, 8, 4, 2, 1. Desimalverdien av byten er summen av verdiene der biten er <code className="text-brand">1</code>.
      </p>
      <div className="rounded-xl border border-border bg-card/30 p-6">
        <div className="grid grid-cols-8 gap-2 max-w-md mx-auto mb-4">
          {bits.map((b, i) => (
            <button
              key={i}
              onClick={() => toggle(i)}
              className={`aspect-square rounded-md border font-mono text-lg font-bold transition ${
                b === 1
                  ? "border-brand/60 bg-brand/20 text-brand"
                  : "border-border bg-background text-muted-foreground hover:bg-muted/40"
              }`}
            >
              {b}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-8 gap-2 max-w-md mx-auto mb-6">
          {verdier.map((v, i) => (
            <div
              key={i}
              className={`text-center text-[10px] font-mono ${
                bits[i] === 1 ? "text-brand" : "text-muted-foreground/60"
              }`}
            >
              {v}
            </div>
          ))}
        </div>
        <div className="grid sm:grid-cols-3 gap-3 text-center text-sm">
          <div className="rounded-md border border-border bg-background p-3">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Binær</div>
            <div className="font-mono font-semibold">
              {binaer.slice(0, 4)} {binaer.slice(4)}
            </div>
          </div>
          <div className="rounded-md border border-brand/40 bg-brand/5 p-3">
            <div className="text-xs uppercase tracking-wider text-brand mb-1">Desimal</div>
            <div className="font-mono font-semibold text-brand">{desimal}</div>
          </div>
          <div className="rounded-md border border-purple-500/40 bg-purple-500/5 p-3">
            <div className="text-xs uppercase tracking-wider text-purple-300 mb-1">Hex</div>
            <div className="font-mono font-semibold text-purple-300">0x{hex}</div>
          </div>
        </div>
        <div className="mt-4 flex justify-center gap-2">
          <button
            onClick={reset}
            className="rounded-md border border-border bg-background px-3 py-2 text-xs hover:bg-muted/40"
          >
            Nullstill
          </button>
          <button
            onClick={alle}
            className="rounded-md border border-brand/30 bg-brand/5 px-3 py-2 text-xs text-brand hover:bg-brand/10"
          >
            Sett alle bits = 1
          </button>
        </div>
        <div className="mt-4 rounded-md border border-brand/30 bg-brand/5 p-3 text-xs text-muted-foreground">
          <strong className="text-brand">Prøv:</strong> klikk biten lengst til venstre, så biten ved siden av. Hva blir desimal? (128 + 64 = 192). Klikk alle 8 — du får 255, det største en byte kan inneholde.
        </div>
      </div>
    </div>
  );
}

function HexForklaring() {
  return (
    <div className="space-y-4 text-sm leading-relaxed">
      <p>
        Binær er enkelt for maskinen, men slitsomt for oss. <code className="text-brand">1010 1100</code> er åtte tegn å lese, og det er bare ett tall. <strong>Heksadesimal</strong> (base 16) er kortere notasjon for nøyaktig de samme tallene.
      </p>
      <p>
        Hex bruker 16 siffer: <code className="text-brand">0–9</code> som vanlig, og så <code className="text-brand">A=10, B=11, C=12, D=13, E=14, F=15</code>. Det smarte: <strong>én hex-siffer = nøyaktig 4 bits</strong>. Dermed kan en hel byte (8 bits) skrives med kun to hex-siffer.
      </p>
      <div className="rounded-lg border border-border bg-card/40 p-4">
        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
          Alle 16 hex-siffer
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 text-center font-mono text-xs">
          {Array.from({ length: 16 }).map((_, i) => {
            const hex = i.toString(16).toUpperCase();
            const bin = i.toString(2).padStart(4, "0");
            return (
              <div key={i} className="rounded border border-border bg-background p-2">
                <div className="text-brand font-bold">{hex}</div>
                <div className="text-muted-foreground/70">{bin}</div>
                <div className="text-muted-foreground/50 text-[10px]">={i}</div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="rounded-md border border-brand/30 bg-brand/5 p-3 text-xs text-muted-foreground">
        <strong className="text-brand">Hvorfor 0x foran?</strong> Når du skriver <code>2A</code>, kan det forveksles med et vanlig desimaltall. Prefikset <code>0x</code> (eller <code>$</code>, eller <code>#</code> for farger) sier til leseren: dette er hex. Så <code>0x2A = 42</code> desimal.
      </div>
    </div>
  );
}

function Omregner() {
  const [input, setInput] = useState("2A");
  const [base, setBase] = useState<"hex" | "dec" | "bin">("hex");

  let desimal = 0;
  let gyldig = true;
  try {
    if (base === "hex") {
      if (!/^[0-9A-Fa-f]{1,2}$/.test(input)) gyldig = false;
      else desimal = parseInt(input, 16);
    } else if (base === "dec") {
      if (!/^\d{1,3}$/.test(input)) gyldig = false;
      else {
        desimal = parseInt(input, 10);
        if (desimal > 255) gyldig = false;
      }
    } else {
      if (!/^[01]{1,8}$/.test(input)) gyldig = false;
      else desimal = parseInt(input, 2);
    }
  } catch {
    gyldig = false;
  }

  const hex = gyldig ? desimal.toString(16).toUpperCase().padStart(2, "0") : "—";
  const dec = gyldig ? desimal.toString() : "—";
  const bin = gyldig ? desimal.toString(2).padStart(8, "0") : "—";

  return (
    <div className="my-6">
      <p className="text-sm leading-relaxed mb-4">
        Skriv inn et tall i én av basene — se de to andre øyeblikkelig. Maks 1 byte (0–255 / 00–FF / 0000 0000–1111 1111).
      </p>
      <div className="rounded-xl border border-border bg-card/30 p-6">
        <div className="flex flex-wrap gap-2 mb-4 justify-center">
          {(["hex", "dec", "bin"] as const).map((b) => (
            <button
              key={b}
              onClick={() => setBase(b)}
              className={`rounded-md border px-3 py-1.5 text-xs font-medium ${
                base === b
                  ? "border-brand/50 bg-brand/15 text-brand"
                  : "border-border bg-background hover:bg-muted/40"
              }`}
            >
              {b === "hex" ? "Skriv hex" : b === "dec" ? "Skriv desimal" : "Skriv binær"}
            </button>
          ))}
        </div>
        <div className="max-w-xs mx-auto mb-4">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={base === "hex" ? "f.eks. FF" : base === "dec" ? "f.eks. 255" : "f.eks. 11111111"}
            className={`w-full rounded-md border bg-background px-3 py-2 text-center font-mono text-lg ${
              gyldig ? "border-border" : "border-red-500/50 text-red-300"
            }`}
          />
          {!gyldig && (
            <div className="text-[11px] text-red-300 mt-1 text-center">
              Ugyldig input for {base === "hex" ? "hex (0–FF)" : base === "dec" ? "desimal (0–255)" : "binær (8 bits)"}.
            </div>
          )}
        </div>
        <div className="grid sm:grid-cols-3 gap-3 text-center text-sm">
          <Resultat tittel="Binær" verdi={bin === "—" ? bin : `${bin.slice(0, 4)} ${bin.slice(4)}`} aktiv={base === "bin"} />
          <Resultat tittel="Desimal" verdi={dec} aktiv={base === "dec"} farge="brand" />
          <Resultat tittel="Hex" verdi={hex === "—" ? hex : `0x${hex}`} aktiv={base === "hex"} farge="purple" />
        </div>
      </div>
    </div>
  );
}

function Resultat({
  tittel,
  verdi,
  aktiv,
  farge = "muted",
}: {
  tittel: string;
  verdi: string;
  aktiv: boolean;
  farge?: "muted" | "brand" | "purple";
}) {
  const ramme =
    farge === "brand"
      ? "border-brand/40 bg-brand/5 text-brand"
      : farge === "purple"
        ? "border-purple-500/40 bg-purple-500/5 text-purple-300"
        : "border-border bg-background";
  return (
    <div className={`rounded-md border p-3 ${ramme} ${aktiv ? "ring-2 ring-brand/30" : ""}`}>
      <div className="text-xs uppercase tracking-wider opacity-80 mb-1">{tittel}</div>
      <div className="font-mono font-semibold">{verdi}</div>
    </div>
  );
}

function Bruksomraader() {
  return (
    <div className="my-6 grid md:grid-cols-2 gap-4 text-sm">
      <Bruk
        ikon={<Cpu className="h-4 w-4" />}
        farge="brand"
        tittel="chmod 755 (Linux-permissions)"
        forklaring="Tre oktale siffer (base 8 — som hex, bare med 3 bits per siffer). 7 = 111 = rwx (alle rettigheter). 5 = 101 = r-x (lese + kjøre, ikke skrive). chmod 755 = eier 7, gruppe 5, andre 5."
        eksempel="755 → 111 101 101 → rwx r-x r-x"
      />
      <Bruk
        ikon={<Server className="h-4 w-4" />}
        farge="purple"
        tittel="IP-adresser og subnettmasker"
        forklaring="192.168.1.1 er fire byte i desimal. Hver oktet er én byte. /24-nettverk er en subnettmaske der de første 24 bits er 1, resten 0."
        eksempel="192 → 1100 0000   /24 → 1111…1111 0000 0000"
      />
      <Bruk
        ikon={<Hash className="h-4 w-4" />}
        farge="brand"
        tittel="MAC-adresser"
        forklaring="Nettverkskortets fysiske adresse. Skrives som 6 byte = 12 hex-siffer atskilt av kolon. Ren komprimering av binær."
        eksempel="3C:5A:B4:00:1F:E2"
      />
      <Bruk
        ikon={<Calculator className="h-4 w-4" />}
        farge="purple"
        tittel="Fargekoder i web"
        forklaring="#RRGGBB er tre byte i hex: rød, grønn, blå (0–255 hver). Hvit er FF FF FF (alle på), svart 00 00 00."
        eksempel="#FF8800 → 255 rød, 136 grønn, 0 blå (oransje)"
      />
    </div>
  );
}

function Bruk({
  ikon,
  farge,
  tittel,
  forklaring,
  eksempel,
}: {
  ikon: React.ReactNode;
  farge: "brand" | "purple";
  tittel: string;
  forklaring: string;
  eksempel: string;
}) {
  const klass =
    farge === "brand"
      ? "border-brand/30 bg-brand/5"
      : "border-purple-500/30 bg-purple-500/5";
  const tittelKlass = farge === "brand" ? "text-brand" : "text-purple-300";
  return (
    <div className={`rounded-lg border ${klass} p-4`}>
      <div className={`flex items-center gap-2 font-semibold text-sm mb-2 ${tittelKlass}`}>
        {ikon}
        {tittel}
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed mb-2">{forklaring}</p>
      <div className="rounded border border-border bg-background p-2 font-mono text-[11px]">
        {eksempel}
      </div>
    </div>
  );
}

type DrillOppg = {
  q: string;
  hint?: string;
  svar: string;
  forklaring: string;
};

function Drill5() {
  const oppgaver: DrillOppg[] = [
    {
      q: "Hva er 1010 1100 i desimal?",
      hint: "128 + 32 + 8 + 4",
      svar: "172",
      forklaring: "Bitsene som er 1: posisjon 128, 32, 8, 4. Sum: 128 + 32 + 8 + 4 = 172.",
    },
    {
      q: "Hva er 1010 1100 i hex?",
      hint: "Del i to halvdeler: 1010 og 1100",
      svar: "AC",
      forklaring: "1010 = A (10) og 1100 = C (12). Slått sammen: AC (= 172 desimal).",
    },
    {
      q: "Hva er 255 i binær?",
      hint: "Det er det største en byte kan inneholde",
      svar: "1111 1111",
      forklaring: "255 = 128+64+32+16+8+4+2+1 = alle 8 bits satt til 1. I hex: FF.",
    },
    {
      q: "chmod 755 — hva blir det binært (3 grupper á 3 bits)?",
      hint: "7 → 111, 5 → 101",
      svar: "111 101 101",
      forklaring: "7 = 4+2+1 = rwx. 5 = 4+0+1 = r-x. Eier får 7 (alt), gruppe og andre får 5 (lese + kjøre).",
    },
    {
      q: "Hva er 0x2A i desimal?",
      hint: "2 × 16 + 10",
      svar: "42",
      forklaring: "Hex-siffer 2 betyr 2×16 = 32. Hex-siffer A betyr 10. Sum: 32 + 10 = 42.",
    },
  ];
  return (
    <div className="my-6 space-y-3">
      <p className="text-sm leading-relaxed mb-2">
        Prøv selv. Klikk &quot;Vis svar&quot; først når du har tenkt. Du må gjøre disse i hodet for å henge med i kap. 2 av OS og IP-headere i datakomm.
      </p>
      {oppgaver.map((o, i) => (
        <DrillBoks key={i} nr={i + 1} {...o} />
      ))}
    </div>
  );
}

function DrillBoks({ nr, q, hint, svar, forklaring }: DrillOppg & { nr: number }) {
  const [vis, setVis] = useState(false);
  const [visHint, setVisHint] = useState(false);
  return (
    <div className="rounded-lg border border-border bg-card/30 p-4">
      <div className="text-sm font-medium mb-3 flex items-start gap-2">
        <span className="text-brand font-mono shrink-0">D{nr}.</span>
        <span>{q}</span>
      </div>
      {hint && !vis && (
        <button
          onClick={() => setVisHint((v) => !v)}
          className="text-xs text-muted-foreground hover:text-foreground mb-2 inline-flex items-center gap-1"
        >
          <Lightbulb className="h-3 w-3" /> {visHint ? "Skjul hint" : "Hint"}
        </button>
      )}
      {visHint && !vis && (
        <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-2 text-xs text-amber-200 mb-2">
          {hint}
        </div>
      )}
      <button
        onClick={() => setVis((v) => !v)}
        className="rounded-md border border-brand/30 bg-brand/5 px-3 py-1.5 text-xs text-brand hover:bg-brand/10"
      >
        {vis ? "Skjul svar" : "Vis svar"}
      </button>
      {vis && (
        <div className="mt-3 space-y-2">
          <div className="rounded-md border border-green-500/40 bg-green-500/10 p-2 font-mono text-sm text-green-200">
            {svar}
          </div>
          <div className="rounded-md border border-brand/30 bg-brand/5 p-2 text-xs text-muted-foreground">
            {forklaring}
          </div>
        </div>
      )}
    </div>
  );
}

function Quizer() {
  const sporsmal: { q: string; valg: string[]; riktig: number; forklaring: string }[] = [
    {
      q: "Hvorfor brukes hex i stedet for å skrive ut binær direkte?",
      valg: [
        "Hex er en annen tallrepresentasjon som maskinen forstår bedre",
        "Hex er kortere og hver hex-siffer er nøyaktig 4 bits — én byte = to siffer",
        "Hex kan inneholde større tall enn binær",
      ],
      riktig: 1,
      forklaring: "Hex er rent for menneskenes lesbarhet. Maskinen bruker binær uansett. Poenget er at 4 bits passer perfekt i ett hex-siffer, så konvertering er triviell.",
    },
    {
      q: "Hva er den største verdien én byte kan inneholde?",
      valg: [
        "127",
        "255",
        "256",
      ],
      riktig: 1,
      forklaring: "En byte er 8 bits. 2⁸ = 256 forskjellige verdier, fra 0 til 255. Verdien 256 trenger en ekstra bit (9 bits).",
    },
    {
      q: "Du ser en IP-pakke i Wireshark med feltet 'TTL: 0x40'. Hva er det i desimal?",
      valg: [
        "16",
        "40",
        "64",
      ],
      riktig: 2,
      forklaring: "0x40 = 4×16 + 0 = 64. TTL 64 er en vanlig standardverdi for Linux-pakker. Hex-prefikset 0x sier 'dette er hex, ikke desimal'.",
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

function NesteSteg() {
  return (
    <div className="my-6 rounded-lg border border-border bg-card/30 p-5">
      <p className="text-sm leading-relaxed mb-4">
        Du har nå tallsystemet på plass. Neste bit i F4 forklarer hva kryptering ER — uten matte. Da bruker du allerede hex som vant språk, fordi nøkler og hasher skrives i hex.
      </p>
      <div className="grid sm:grid-cols-2 gap-3">
        <Link
          to="/forkurs/$slug"
          params={{ slug: "f11-krypto-intuisjon" }}
          className="group rounded-md border border-brand/30 bg-brand/5 p-4 hover:bg-brand/10 transition"
        >
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-1">
            F-11 · neste
          </div>
          <div className="font-medium text-sm flex items-center gap-2">
            Hva ER kryptering (overflate)
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
        Denne biten åpner opp for: <code className="text-brand">DK-20</code> (IP-adressering),{" "}
        <code className="text-brand">DK-21</code> (subnetting),{" "}
        <code className="text-brand">OS-09</code> (Linux-permissions),{" "}
        <code className="text-brand">F-11</code> (krypto — hex blir nøkkel-notasjon).
      </div>
    </div>
  );
}

