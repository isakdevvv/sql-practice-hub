import { Link } from "@tanstack/react-router";
import { Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";

const STEPS = [
  { title: "UML på 1 minutt — hva og hvorfor", anchor: "intro" },
  { title: "Use case-diagram", anchor: "usecase" },
  { title: "Klassediagram", anchor: "klasse" },
  { title: "Sekvensdiagram", anchor: "sekvens" },
  { title: "Aktivitetsdiagram", anchor: "aktivitet" },
  { title: "Når du bruker hvilket", anchor: "naar" },
];

export function UmlPage() {
  return (
    <StackPageShell title="UML — diagrammene du trenger" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2604 · Del 3 av 4
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            UML — diagrammene du faktisk trenger
          </h1>
          <p className="mt-3 text-muted-foreground">
            UML har 14 diagramtyper. I praksis bruker du fire. Vi tar de fire
            som inngår i DTE-2604-pensum og forklarer når hver passer.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Drill:</span>{" "}
              <Link to="/drag" className="text-brand hover:underline">drag-oppgavene</Link>{" "}
              under «Systemutvikling» — diagram-type til use-case, relasjons-symboler match.
            </div>
          </div>
        </div>

        <CourseOutline courseId="uml" steps={STEPS} />

        <section id="intro" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. UML på 1 minutt</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Unified Modeling Language. Standardisert notasjon for å tegne
            software-design. Hovedpoenget er at andre utviklere kan LESE
            diagrammet uten å gjette hva symbolene betyr.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <ul className="space-y-2 text-sm">
              <li><strong>Strukturdiagrammer</strong> viser hva systemet ER (klasse, komponent, deployment).</li>
              <li><strong>Atferdsdiagrammer</strong> viser hva systemet GJØR (use case, sekvens, aktivitet, tilstand).</li>
              <li>Du trenger ikke kunne alle 14. Use case + klasse + sekvens + aktivitet dekker 95% av kommunikasjonsbehovet.</li>
            </ul>
          </div>
        </section>

        <section id="usecase" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Use case-diagram</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Viser HVEM (aktører) kan gjøre HVA (use cases) i systemet. Toppnivå —
            ingen detaljer om hvordan.
          </p>

          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              ASCII-eksempel: nettbutikk
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`            +─────── Systemgrense ───────+
            │                            │
   Kunde ──►│   (Bla i produkter)        │
   (◯/├)    │                            │
            │   (Legg i kurv)            │
            │                            │
            │   (Sjekk ut)  ◄──extends── │
            │     ▲                      │
            │     │ <<include>>          │
            │   (Betal)                  │
            │                            │
            │                  (Send     │◄── Lagermedarbeider
            │                  pakke)    │
            +────────────────────────────+

Aktør = pinnemann utenfor.
Use case = oval inni systemgrensa.
Streker = «aktør X kan utføre use case Y».`}</pre>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Sentrale relasjoner
            </div>
            <ul className="space-y-2 text-sm">
              <li><strong>&lt;&lt;include&gt;&gt;:</strong> A inkluderer alltid B. «Sjekk ut» inkluderer alltid «Betal».</li>
              <li><strong>&lt;&lt;extend&gt;&gt;:</strong> B utvider A under visse betingelser. «Bruk rabattkode» extends «Sjekk ut».</li>
              <li><strong>Generalisering:</strong> spesialisert aktør arver fra generell. «Premium-kunde» er-en «Kunde».</li>
            </ul>
          </div>
        </section>

        <section id="klasse" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Klassediagram</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Viser klassene i koden, deres attributter, metoder og forhold mellom
            dem. Den mest brukte UML-typen for å kommunisere objektorientert design.
          </p>

          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`+─────────────────+        +──────────────────+
│    Kunde        │  1   * │   Bestilling     │
+─────────────────│────────│──────────────────│
│ - id: int       │        │ - id: int        │
│ - navn: string  │        │ - dato: Date     │
│ - epost: string │        │ - status: enum   │
+─────────────────│        +──────────────────+
│ + login()       │              │  1
│ + logout()      │              │
+─────────────────+              │  *
                                 ▼
                       +──────────────────+
                       │   Ordrelinje     │
                       +──────────────────│
                       │ - produktid: int │
                       │ - antall: int    │
                       │ - pris: decimal  │
                       +──────────────────+

- = privat,  + = public,  # = protected
1 .. * = en kunde har mange bestillinger`}</pre>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Relasjonstyper
            </div>
            <ul className="space-y-2 text-sm">
              <li><strong>Assosiasjon</strong> (vanlig strek): generell sammenheng. «Kunde har Bestillinger».</li>
              <li><strong>Aggregering</strong> (◇──): «består av», svak — delen kan eksistere uten helheten. Bil ◇── Hjul.</li>
              <li><strong>Komposisjon</strong> (◆──): sterk «består av» — delen lever bare så lenge helheten gjør. Hus ◆── Rom.</li>
              <li><strong>Arv/generalisering</strong> (──▷): «er en». Hund ──▷ Dyr.</li>
              <li><strong>Avhengighet</strong> (─ ─ &gt;): bruker, men eier ikke. Tjeneste ─ ─&gt; Logger.</li>
            </ul>
          </div>
        </section>

        <section id="sekvens" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Sekvensdiagram</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Viser RAD AV MELDINGER mellom objekter over tid. Brukes for å
            beskrive ett konkret scenario — typisk en use case i detalj.
          </p>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Eksempel: login-flyt
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`  Bruker      Nettleser    Backend       DB
    │            │            │            │
    │ tast navn  │            │            │
    │ + passord  │            │            │
    │───────────►│            │            │
    │            │ POST /login│            │
    │            │───────────►│            │
    │            │            │SELECT ... │
    │            │            │───────────►│
    │            │            │            │
    │            │            │  user row  │
    │            │            │◄───────────│
    │            │            │check hash  │
    │            │  set cookie│            │
    │            │◄───────────│            │
    │ viser hjem │            │            │
    │◄───────────│            │            │

Vertikal akse = tid (oppover er tidligere).
Horisontal stiplede linjer = lifelines.
Pil med fylt hode = synkron melding/kall.
Pil med åpent hode = retur eller asynkront.`}</pre>
          </div>
        </section>

        <section id="aktivitet" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Aktivitetsdiagram</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Flytdiagram. Viser hvordan en prosess FLYTER — beslutninger,
            parallelle gjøremål, sluttilstander. Egner seg for forretningsflyter.
          </p>

          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`           ● (start)
           │
           ▼
      [ Motta bestilling ]
           │
           ▼
        ◇ Betalt? ◇
        ╱        ╲
   nei╱            ╲ja
     ▼              ▼
[ Send påminnelse ]   ─── join ───
                    │            │
                    ▼            ▼
            [ Plukk varer ] [ Skriv faktura ]
                    │            │
                    └─── fork ───┘
                          │
                          ▼
                  [ Send pakke ]
                          │
                          ▼
                          ⊙ (slutt)

● = start,  ⊙ = slutt
◇ = beslutning (vanligvis ja/nei)
=== = fork/join for parallelle løp`}</pre>
          </div>
        </section>

        <section id="naar" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Når du bruker hvilket</h2>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-40">Diagram</th>
                  <th className="text-left font-semibold px-4 py-2">Bruk når du vil…</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border"><td className="px-4 py-3 font-medium">Use case</td><td className="px-4 py-3 text-muted-foreground">…vise hvem som kan gjøre hva (eksternt perspektiv, til kunde/PO)</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-medium">Klasse</td><td className="px-4 py-3 text-muted-foreground">…dokumentere den objektorienterte strukturen (til andre utviklere)</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-medium">Sekvens</td><td className="px-4 py-3 text-muted-foreground">…vise hvordan komponenter samhandler i ett konkret scenario</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-medium">Aktivitet</td><td className="px-4 py-3 text-muted-foreground">…dokumentere en forretningsprosess med beslutninger og parallellitet</td></tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Tommelfingerregel:</strong> tegn ikke et diagram bare fordi
            det er pensum. Tegn det som hjelper en konkret samtale med en
            konkret mottaker. Et godt klassediagram for koblede aggregater er
            verdt mer enn fem perfekte sekvensdiagrammer ingen leser.
          </p>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/drag" className="text-brand hover:underline">Drag-oppgaver</Link>
              : diagram-type til use-case, relasjonssymboler match.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "su-prosjekt-praksis" }} className="text-brand hover:underline">
                Prosjekt-praksis i gruppe
              </Link>
              : git-flow, code review, retrospektiv, vanlige team-feller.
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
