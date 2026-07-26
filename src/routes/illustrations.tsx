import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import {
  DatabaseCylinder,
  BTreeIcon,
  TableGrid,
  Indexes,
  RouterIcon,
  SwitchIcon,
  Packet,
  Cloud,
  HostIcon,
  CpuChip,
  RamStick,
  Disk,
  Process,
  Stack,
  TreeNode,
  GraphNode,
  BarChart,
  Heap,
  Neuron,
  LossCurve,
  ScatterPlot,
  Lock,
  Key,
  Shield,
  type IllustrationProps,
} from "@/components/illustrations";

export const Route = createFileRoute("/illustrations")({
  head: () => ({
    meta: [
      { title: "Illustrasjonsbibliotek — Kodeverkstedet" },
      {
        name: "description",
        content:
          "Galleri over alle innebygde SVG-illustrasjoner som kan brukes på kurssidene. Inline, themable via Tailwind text-*.",
      },
    ],
  }),
  component: IllustrationsShowcase,
});

type Entry = {
  name: string;
  Comp: (p: IllustrationProps) => React.ReactNode;
  bruk: string;
};

type Section = {
  tittel: string;
  beskrivelse: string;
  items: Entry[];
};

// Norwegian copy throughout — these are discovery hints for future authors.
const SECTIONS: Section[] = [
  {
    tittel: "Database og SQL",
    beskrivelse:
      "Bruk disse i toppen av databasekurs (indekser, normalisering, transaksjoner, query-optimisering).",
    items: [
      {
        name: "DatabaseCylinder",
        Comp: DatabaseCylinder,
        bruk: "Generell DB-side, hero-bilde, eller som favicon-erstatning på databasekurs.",
      },
      {
        name: "BTreeIcon",
        Comp: BTreeIcon,
        bruk: "Indekser, query-optimisering, eller traer-emnet — viser et 3-niva B-tre.",
      },
      {
        name: "TableGrid",
        Comp: TableGrid,
        bruk: "Normalisering, ER-mapping, eller hvor som helst der en relasjon visualiseres.",
      },
      {
        name: "Indexes",
        Comp: Indexes,
        bruk: "Indeks-sider — viser sortert kolonne som peker inn i en tabellrad.",
      },
    ],
  },
  {
    tittel: "Nettverk",
    beskrivelse:
      "DTE-2507 og naerliggende temaer: ruting, switching, IP-pakker, internett, hosts.",
    items: [
      {
        name: "RouterIcon",
        Comp: RouterIcon,
        bruk: "Ruting-sider, NAT, BGP — alt med en ruter i kjernen.",
      },
      {
        name: "SwitchIcon",
        Comp: SwitchIcon,
        bruk: "L2-emner: VLAN, switch self-learning, broadcast-domener.",
      },
      {
        name: "Packet",
        Comp: Packet,
        bruk: "Pakke-dekoding, headere, transportlag, CRC og checksum.",
      },
      {
        name: "Cloud",
        Comp: Cloud,
        bruk: "Internett-skyer i topologi-diagrammer; ogsa generelt for «sky-tjenester».",
      },
      {
        name: "HostIcon",
        Comp: HostIcon,
        bruk: "Klient/host i nettverkstopologi, sluttbrukerperspektiv.",
      },
    ],
  },
  {
    tittel: "OS og maskinvare",
    beskrivelse:
      "DTE-2505 og maskinarkitektur-emnene — CPU, minne, lagring, prosesser, stack.",
    items: [
      { name: "CpuChip", Comp: CpuChip, bruk: "OS-grunnlag, scheduling, trinn-4-CPU." },
      {
        name: "RamStick",
        Comp: RamStick,
        bruk: "Virtuelt minne, sider/segmenter, hvor som helst minne diskuteres.",
      },
      {
        name: "Disk",
        Comp: Disk,
        bruk: "Lagring, I/O, filsystem, persistens-laget i en database.",
      },
      {
        name: "Process",
        Comp: Process,
        bruk: "Prosesser/signaler, konkurrens, scheduling.",
      },
      {
        name: "Stack",
        Comp: Stack,
        bruk: "Call stack, LIFO-datastruktur, rekursjon — perfekt over en stack-side.",
      },
    ],
  },
  {
    tittel: "Algoritmer og data",
    beskrivelse:
      "Generelle datastrukturer/algoritmer — traer, grafer, plotting, heaps.",
    items: [
      {
        name: "TreeNode",
        Comp: TreeNode,
        bruk: "Generelle traer (BST, AVL), traverserings-eksempler.",
      },
      {
        name: "GraphNode",
        Comp: GraphNode,
        bruk: "Grafer-dypere, korteste vei, BFS/DFS, sosiale grafer.",
      },
      {
        name: "BarChart",
        Comp: BarChart,
        bruk: "Statistikk, deskriptiv analyse, sammenligning av algoritmevarianter.",
      },
      {
        name: "Heap",
        Comp: Heap,
        bruk: "Prioritetskoer, heap-sort, Dijkstra. Skiller seg fra TreeNode via niva 3.",
      },
    ],
  },
  {
    tittel: "ML og matte",
    beskrivelse:
      "DTE-2602 og ML-grunnlag — nevroner, treningskurver, klassifikasjon.",
    items: [
      {
        name: "Neuron",
        Comp: Neuron,
        bruk: "NN-intro, backprop, perceptron — vektede input inn, output ut.",
      },
      {
        name: "LossCurve",
        Comp: LossCurve,
        bruk: "Trening, overfitting, learning rate — viser tap som synker over epoker.",
      },
      {
        name: "ScatterPlot",
        Comp: ScatterPlot,
        bruk: "Klassifikasjon, SVM, LDA/QDA — to klasser pluss en svak beslutningsgrense.",
      },
    ],
  },
  {
    tittel: "Sikkerhet og krypto",
    beskrivelse:
      "Brukerhandtering, kryptografi, TLS, autentisering — alternativ til lucides Lock/Key/Shield naar du vil ha noe storre.",
    items: [
      {
        name: "Lock",
        Comp: Lock,
        bruk: "Sikkerhet, autentisering, kryptering — bruk denne i stedet for lucide naar bildet skal vaere stort.",
      },
      { name: "Key", Comp: Key, bruk: "Nokler, RSA, sertifikater, API-nokler." },
      {
        name: "Shield",
        Comp: Shield,
        bruk: "Brannmur, IDS, sikkerhet generelt — sjekkmerket signaliserer beskyttelse OK.",
      },
    ],
  },
];

function IllustrationsShowcase() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-12 max-w-5xl">
        <header className="mb-10">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            Designsystem
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Illustrasjonsbibliotek
          </h1>
          <p className="mt-3 text-muted-foreground max-w-2xl">
            Inline SVG-komponenter for bruk pa kurssidene. Alle bruker{" "}
            <code className="font-mono text-xs">currentColor</code>, sa de tilpasser
            seg light/dark theme via Tailwind <code className="font-mono text-xs">text-*</code>-klasser.
            Standard storrelse er 64 px; juster med <code className="font-mono text-xs">size</code>-prop.
            Sett <code className="font-mono text-xs">title</code> hvis illustrasjonen
            er informativ (gir aria-label); la den stae tom hvis den er rent dekorativ.
          </p>
          <pre className="mt-4 font-mono text-xs overflow-x-auto rounded bg-card border border-border p-3">{`import { DatabaseCylinder } from "@/components/illustrations";

<DatabaseCylinder size={48} className="text-brand" title="Database" />`}</pre>
        </header>

        {SECTIONS.map((s) => (
          <section key={s.tittel} className="mb-12">
            <h2 className="text-xl font-semibold mb-1">{s.tittel}</h2>
            <p className="text-sm text-muted-foreground mb-5">{s.beskrivelse}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {s.items.map(({ name, Comp, bruk }) => (
                <figure
                  key={name}
                  className="rounded-xl border border-border bg-card p-4 flex flex-col items-center text-center"
                >
                  <div className="text-brand mb-3">
                    <Comp size={64} title={name} />
                  </div>
                  <figcaption className="text-xs font-mono font-semibold">
                    {name}
                  </figcaption>
                  <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
                    {bruk}
                  </p>
                </figure>
              ))}
            </div>
          </section>
        ))}

        <section className="mt-12 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Retningslinjer</h2>
          <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
            <li>
              Bruk lucide-react for sma UI-ikoner (16–20 px). Bruk dette
              biblioteket for topiske illustrasjoner (40–96 px).
            </li>
            <li>
              Sett en tekstklasse pa wrapperen — for eksempel{" "}
              <code className="font-mono text-xs">text-brand</code> eller{" "}
              <code className="font-mono text-xs">text-muted-foreground</code> — sa
              illustrasjonen folger temaet.
            </li>
            <li>
              For dekorative bilder: la <code className="font-mono text-xs">title</code>{" "}
              vaere tom. SVG-en marker da seg selv som <code>aria-hidden</code>.
            </li>
            <li>
              Foretrukket storrelse i sideintroer: 56–72 px. Justér med{" "}
              <code className="font-mono text-xs">size</code>.
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
}
