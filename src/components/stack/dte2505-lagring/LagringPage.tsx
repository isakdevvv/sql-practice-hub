import { Link } from "@tanstack/react-router";
import { Lightbulb, HardDrive, Cpu, Zap, ShieldCheck, Activity, Brain, Layers, GitBranch } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { HddPhysicsViz } from "./HddPhysicsViz";
import { SsdCellsViz } from "./SsdCellsViz";
import { EraseBeforeWriteSim } from "./EraseBeforeWriteSim";
import { WearLevelingViz } from "./WearLevelingViz";
import { TrimDemo } from "./TrimDemo";
import { StorageCompare } from "./StorageCompare";
import { RandomVsSeqBench } from "./RandomVsSeqBench";
import { LagringDrill } from "./LagringDrill";
import { LagringFlashcards } from "./LagringFlashcards";

const STEPS = [
  { title: "Hvorfor lagring betyr noe", anchor: "hvorfor" },
  { title: "HDD-fysikk", anchor: "hdd" },
  { title: "HDD-simulator (interaktiv)", anchor: "viz-hdd" },
  { title: "SSD og NAND-flash", anchor: "ssd" },
  { title: "NAND-celler (interaktiv)", anchor: "viz-cells" },
  { title: "Erase-before-write & WA", anchor: "ebw" },
  { title: "Erase-simulator (interaktiv)", anchor: "viz-ebw" },
  { title: "Wear leveling", anchor: "wear" },
  { title: "Wear-leveling-viz (interaktiv)", anchor: "viz-wear" },
  { title: "TRIM", anchor: "trim" },
  { title: "TRIM-demo (interaktiv)", anchor: "viz-trim" },
  { title: "Sammenligning HDD/SSD/NVMe", anchor: "compare" },
  { title: "Random vs sequential", anchor: "rvs" },
  { title: "Benchmark (interaktiv)", anchor: "viz-bench" },
  { title: "Drill — fem oppgaver", anchor: "drill" },
  { title: "Recall-kort", anchor: "recall" },
  { title: "Eksamen-feller", anchor: "feller" },
];

export function LagringPage() {
  return (
    <StackPageShell title="Lagringsmedier" group="eksamen">
      <article className="container mx-auto px-4 py-10 max-w-3xl">
        <header className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2505 · Lagringsmedier i dybden
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Hvordan HDD, SSD og NVMe faktisk fungerer
          </h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Du vet at "SSD er raskere enn HDD". Men <em>hvorfor</em>? Hva er det
            i fysikken som gjør at random I/O straffer HDD så voldsomt? Hvorfor må
            SSD-er erase hele blocks før de kan re-skrive? Hva er write amplification,
            wear leveling og TRIM — og hvorfor finnes de? Her bygger vi opp svarene fra
            silisium og opp, med syv interaktive visualizere, fem drill-oppgaver og en
            recall-runde til slutt.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span> alle visualizere er inline i
              seksjonene under. Anbefalt rekkefølge:{" "}
              <a href="#viz-hdd" className="text-brand hover:underline">HDD-simulator</a> →{" "}
              <a href="#viz-cells" className="text-brand hover:underline">NAND-celler</a> →{" "}
              <a href="#viz-ebw" className="text-brand hover:underline">erase-before-write</a> →{" "}
              <a href="#viz-wear" className="text-brand hover:underline">wear leveling</a> →{" "}
              <a href="#viz-trim" className="text-brand hover:underline">TRIM</a> →{" "}
              <a href="#viz-bench" className="text-brand hover:underline">benchmark</a> →{" "}
              <a href="#drill" className="text-brand hover:underline">drill</a>.
            </div>
          </div>
        </header>

        <CourseOutline courseId="dte2505-lagring" steps={STEPS} />

        {/* ====================================================================== */}
        <section id="hvorfor" className="mt-10">
          <h2 className="text-2xl font-semibold mb-3 flex items-center gap-2">
            <HardDrive className="h-5 w-5 text-brand" /> Hvorfor lagring betyr noe
          </h2>
          <p className="leading-relaxed">
            Et OS er en abstraksjon over lagring like mye som over CPU. Filsystem,
            virtuelt minne, journals, swap, databaser — alt sammen handler om å
            flytte byte mellom RAM og noe som overlever strømbrudd. Forskjellen
            mellom en programmerer som forstår disken og en som ikke gjør det er
            ofte 10–1000× ytelse, og den forskjellen er ikke i kompilator-flagg
            men i hvilke disk-mønstre du genererer.
          </p>
          <div className="mt-3 grid sm:grid-cols-3 gap-2 text-xs">
            <Fact icon={<Cpu className="h-3.5 w-3.5" />} title="RAM" value="~100 ns" />
            <Fact icon={<Zap className="h-3.5 w-3.5" />} title="NVMe SSD" value="~30–80 µs" />
            <Fact icon={<HardDrive className="h-3.5 w-3.5" />} title="HDD random" value="~10 ms" />
          </div>
        </section>

        {/* ====================================================================== */}
        <section id="hdd" className="mt-10">
          <h2 className="text-2xl font-semibold mb-3">HDD-fysikk — spindle, plate, arm, hode</h2>
          <p className="leading-relaxed">
            En harddisk er et mekanisk system. En eller flere{" "}
            <strong>platter</strong> roterer på en spindle med 5400, 7200 eller 15 000
            omdreininger i minuttet. Over hver platte svinger en{" "}
            <strong>arm</strong> som bærer et lese/skrive-<strong>hode</strong> noen
            få nanometer over magnetiseringen. Dataene er lagt i konsentriske{" "}
            <strong>spor (tracks)</strong> som er delt i{" "}
            <strong>sektorer</strong>.
          </p>
          <p className="leading-relaxed mt-2">
            For å lese en sektor må diskcontrolleren gjøre to ting:
          </p>
          <ol className="list-decimal pl-5 mt-2 space-y-1 leading-relaxed">
            <li>
              <strong>Seek:</strong> flytte armen til riktig spor. Typisk 3–12 ms
              avhengig av avstanden.
            </li>
            <li>
              <strong>Vent på rotasjon:</strong> stå stille og vente til riktig
              sektor passerer under hodet. Snitt er en halv rotasjon — 60 000 / RPM / 2 ms.
            </li>
          </ol>
          <p className="leading-relaxed mt-2">
            <strong>Konsekvens:</strong> random access er fundamentalt straffet av at
            armen må flyttes. Sekvensiell access er nesten gratis fordi armen står
            stille og platen er allerede på vei dit du skal.
          </p>
        </section>

        <section id="viz-hdd" className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Prøv det — HDD-simulator</h3>
          <HddPhysicsViz />
        </section>

        {/* ====================================================================== */}
        <section id="ssd" className="mt-10">
          <h2 className="text-2xl font-semibold mb-3">SSD og NAND-flash</h2>
          <p className="leading-relaxed">
            En SSD har ingen bevegelige deler. Data lagres i{" "}
            <strong>NAND-flash-celler</strong> som er små transistorer med en{" "}
            <strong>floating gate</strong> — en isolert region som kan holde
            elektroner i mange år uten strøm. Antall elektroner i floating gate
            bestemmer transistorens terskel-spenning, og det er det vi leser av
            som "bits".
          </p>
          <ul className="mt-2 list-disc pl-5 space-y-1 leading-relaxed">
            <li>
              <strong>SLC</strong> (1 bit): to spennings-nivåer (0 og 1). Veldig
              robust, opptil 100 000 program/erase-sykler.
            </li>
            <li>
              <strong>MLC</strong> (2 bit): fire nivåer. 3 000–10 000 PE-sykler.
            </li>
            <li>
              <strong>TLC</strong> (3 bit): åtte nivåer. 500–3 000 PE-sykler. Default
              i moderne consumer-SSD.
            </li>
            <li>
              <strong>QLC</strong> (4 bit): 16 nivåer. 100–1 000 PE-sykler.
              Billig per GB, men sliter raskere.
            </li>
          </ul>
          <p className="leading-relaxed mt-2">
            Cellene er organisert i <strong>pages</strong> (typisk 4–16 KB) som
            er den minste enheten du kan skrive. Pages er gruppert i{" "}
            <strong>blocks</strong> (typisk 128–512 pages) som er den minste
            enheten du kan erase. Asymmetrien write-vs-erase er kjernen i alt
            som er rart med flash.
          </p>
        </section>

        <section id="viz-cells" className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Prøv det — NAND-celler</h3>
          <SsdCellsViz />
        </section>

        {/* ====================================================================== */}
        <section id="ebw" className="mt-10">
          <h2 className="text-2xl font-semibold mb-3 flex items-center gap-2">
            <Activity className="h-5 w-5 text-brand" /> Erase-before-write & write amplification
          </h2>
          <p className="leading-relaxed">
            Floating-gate-fysikken lar deg <em>dytte elektroner inn</em> i en celle
            page-vis (write). Men for å <em>rydde elektroner ut</em> trenger du å
            tilbakestille hele blocken på én gang — det er en mer kraftig
            elektrisk operasjon som ikke kan rettes mot enkeltceller uten å
            skade naboene.
          </p>
          <p className="leading-relaxed mt-2">
            <strong>Resultatet:</strong> hvis en page allerede er programmert
            (selv om den logisk er "slettet"), må controller flytte alle
            fortsatt-valid pages i samme block ut til en frisk block,{" "}
            <em>deretter</em> erase blocken, og <em>deretter</em> skrive nytt.
            Én logisk write på 4 KB kan trigge mange MB av fysiske writes — det
            er <strong>write amplification (WA)</strong>.
          </p>
          <p className="leading-relaxed mt-2">
            <strong>Hvorfor det betyr noe:</strong> WA påvirker både{" "}
            <em>levetiden</em> (TBW spises raskere) og{" "}
            <em>ytelsen</em> (controller-trafikken multipliseres). En sunn
            consumer-SSD ligger under 2.0×; en SSD som er nesten full og får
            mye random write kan kjøre i 5× eller mer.
          </p>
        </section>

        <section id="viz-ebw" className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Prøv det — erase-before-write</h3>
          <EraseBeforeWriteSim />
        </section>

        {/* ====================================================================== */}
        <section id="wear" className="mt-10">
          <h2 className="text-2xl font-semibold mb-3 flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-brand" /> Wear leveling
          </h2>
          <p className="leading-relaxed">
            Hver NAND-block tåler bare et begrenset antall program/erase-sykler
            før den blir upålitelig. Et OS pleier å skrive de samme logiske
            LBA-ene veldig ofte: filsystem-journal, swap, metadata. Uten ekstra
            triks ville dette brent ut noen få fysiske blocks lenge før resten
            av disken hadde sett noen særlig slitasje.
          </p>
          <p className="leading-relaxed mt-2">
            <strong>Wear leveling</strong> er controllerens svar:{" "}
            <em>Flash Translation Layer (FTL)</em> mapper logiske LBA-er til
            fysiske blocks dynamisk, og roterer mappingen slik at skrive-belastningen
            fordeles jevnt over hele disken. Det er hvorfor en SSD ikke har en
            "C-disk-er-utbrent"-modus — controlleren skjuler det helt fra OS.
          </p>
        </section>

        <section id="viz-wear" className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Prøv det — wear leveling</h3>
          <WearLevelingViz />
        </section>

        {/* ====================================================================== */}
        <section id="trim" className="mt-10">
          <h2 className="text-2xl font-semibold mb-3 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-brand" /> TRIM
          </h2>
          <p className="leading-relaxed">
            Når OS sletter en fil, oppdaterer filsystemet bare en peker — disken vet
            ikke at noe er borte. På HDD er det helt OK; sektorene blir bare
            overskrevet senere når noe annet trenger plass. På SSD er det et
            problem: controlleren tror cellene fortsatt er valid og må flytte
            dem ved hver eneste garbage collection.
          </p>
          <p className="leading-relaxed mt-2">
            <strong>TRIM</strong> er en SATA/NVMe-kommando OS sender for å si "LBA
            X..Y er ikke i bruk lenger". Controlleren markerer pages som stale,
            og neste GC kan ignorere dem trygt. Effekt: lavere WA, lavere
            slitasje, mer konsistent ytelse over tid.
          </p>
        </section>

        <section id="viz-trim" className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Prøv det — TRIM</h3>
          <TrimDemo />
        </section>

        {/* ====================================================================== */}
        <section id="compare" className="mt-10">
          <h2 className="text-2xl font-semibold mb-3 flex items-center gap-2">
            <Layers className="h-5 w-5 text-brand" /> HDD vs SSD vs NVMe vs Optane vs RAM
          </h2>
          <p className="leading-relaxed">
            Det er ikke bare "HDD eller SSD". Det er en hierarki, og hvert nivå
            har sin nisje. Diagrammet under viser 4 KB random read latency på
            log-skala (det er den eneste skalaen som får alt på samme bilde).
          </p>
          <div className="mt-4">
            <StorageCompare />
          </div>
        </section>

        {/* ====================================================================== */}
        <section id="rvs" className="mt-10">
          <h2 className="text-2xl font-semibold mb-3">Random vs sequential I/O</h2>
          <p className="leading-relaxed">
            Den viktigste enkelt-faktoren i hvor rask disk-trafikk din applikasjon
            har er <em>access-mønsteret</em>, ikke <em>disken</em>. Bytt fra
            random til sequential på samme HDD og du får ofte 100–1000× speedup.
            På NVMe er forskjellen mindre — fordi NVMe er så rask at transfer-tiden
            for blokken begynner å dominere over per-op-latency.
          </p>
        </section>

        <section id="viz-bench" className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Prøv det — benchmark-modell</h3>
          <RandomVsSeqBench />
        </section>

        {/* ====================================================================== */}
        <section id="drill" className="mt-12">
          <LagringDrill />
        </section>

        {/* ====================================================================== */}
        <section id="recall" className="mt-12">
          <h2 className="text-2xl font-semibold mb-3 flex items-center gap-2">
            <Brain className="h-5 w-5 text-brand" /> Recall — siste sjekk
          </h2>
          <p className="leading-relaxed mb-4">
            Hvis du kan svare på alle disse uten å gå tilbake, sitter pensumet.
          </p>
          <LagringFlashcards />
        </section>

        {/* ====================================================================== */}
        <section id="feller" className="mt-10">
          <h2 className="text-2xl font-semibold mb-3">Eksamen-feller å unngå</h2>
          <ul className="space-y-2 list-disc pl-5 leading-relaxed">
            <li>
              <strong>"SSD har ingen seek-tid" er en forenkling.</strong> SSD-er
              har fortsatt en liten konstant latency (~50–100 µs for SATA, ~30 µs
              for NVMe) på grunn av controller-overhead, buss-arbitrasjon og
              FTL-lookup. Den er bare så liten at random og sequential
              nesten ikke skiller seg.
            </li>
            <li>
              <strong>Mer cache i SSD-controlleren = mer fart, men gambling med data.</strong>{" "}
              DRAM-cache i controller gir mye høyere IOPS, men hvis strømmen kuttes uten PLP
              mister du committet data. Derfor finnes "enterprise SSD" med kondensatorer
              for power-loss protection.
            </li>
            <li>
              <strong>"TBW = absolutt slutt" er feil.</strong> TBW er produsentens
              garanti-grense. Mange disker holder 2–3× lengre, men du har ikke
              garanti etter TBW er nådd. Server-design regner med TBW som hard
              grense.
            </li>
            <li>
              <strong>fsync på HDD koster én full rotasjon.</strong> Det er fordi
              filsystemet må vente på at journal-blocken faktisk når platen før
              commit returnerer. På 7200 RPM betyr det &lt; 270 commits/sek per disk,
              med mindre du grupperer.
            </li>
            <li>
              <strong>Defragmentering på SSD er skadelig.</strong> Det øker writes
              uten å forbedre ytelsen (det er ingen seek å spare på). Moderne OS
              detekterer SSD og slår av defrag automatisk.
            </li>
          </ul>
        </section>

        <div className="mt-10 rounded-xl border border-brand/30 bg-brand/5 p-5">
          <h3 className="text-lg font-semibold mb-2">Anbefalt neste</h3>
          <p className="text-sm leading-relaxed mb-3">
            Storage-laget kobler direkte til I/O-management og filsystem-laget. Disse er gode neste stopp:
          </p>
          <div className="flex flex-wrap gap-2 text-sm">
            <Link
              to="/stack/$slug"
              params={{ slug: "dte2505-io-management" }}
              className="rounded-md border bg-card px-3 py-1.5 hover:bg-accent"
            >
              I/O management →
            </Link>
            <Link
              to="/stack/$slug"
              params={{ slug: "dte2505-filsystem" }}
              className="rounded-md border bg-card px-3 py-1.5 hover:bg-accent"
            >
              Filsystem (inode & block) →
            </Link>
            <Link
              to="/stack/$slug"
              params={{ slug: "dte2505-virtuelt-minne" }}
              className="rounded-md border bg-card px-3 py-1.5 hover:bg-accent"
            >
              Virtuelt minne (paging) →
            </Link>
          </div>
        </div>
      </article>
    </StackPageShell>
  );
}

function Fact({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) {
  return (
    <div className="rounded-lg border bg-muted/30 p-2.5 flex items-center gap-2">
      <span className="text-brand">{icon}</span>
      <div>
        <div className="text-muted-foreground text-[10px] uppercase tracking-wider">{title}</div>
        <div className="font-mono text-sm">{value}</div>
      </div>
    </div>
  );
}
