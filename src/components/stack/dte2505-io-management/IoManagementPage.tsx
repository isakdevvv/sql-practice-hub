import { Link } from "@tanstack/react-router";
import { Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { DeviceClassifier } from "./DeviceClassifier";
import { DriverStackFlow } from "./DriverStackFlow";
import { IoStrategySim } from "./IoStrategySim";
import { BufferCacheSim } from "./BufferCacheSim";
import { DiskSchedulingViz } from "./DiskSchedulingViz";
import { ScenarioDragQuiz } from "./ScenarioDragQuiz";

const STEPS = [
  { title: "Hvorfor I/O er vrient", anchor: "hvorfor" },
  { title: "Enhetsklasser — block, char, network", anchor: "klasser" },
  { title: "Klassifisering (interaktiv)", anchor: "viz-klasser" },
  { title: "Driver-stack — fra syscall til hardware", anchor: "stack" },
  { title: "Stack-animasjon (interaktiv)", anchor: "viz-stack" },
  { title: "Polling vs interrupt vs DMA", anchor: "strategier" },
  { title: "CPU-bruk-simulator (interaktiv)", anchor: "viz-strategi" },
  { title: "Buffer cache", anchor: "cache" },
  { title: "Cache-animator (interaktiv)", anchor: "viz-cache" },
  { title: "I/O-scheduling", anchor: "scheduling" },
  { title: "Disk-scheduling-visualizer (interaktiv)", anchor: "viz-sched" },
  { title: "Scenario-quiz", anchor: "quiz" },
  { title: "Eksamen-feller", anchor: "feller" },
];

export function IoManagementPage() {
  return (
    <StackPageShell title="I/O management" group="eksamen">
      <article className="container mx-auto px-4 py-10 max-w-3xl">
        <header className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2505 · O&apos;Gorman kap. 4 / OSTEP kap. 36–37
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            I/O management — hvordan kjernen snakker med hardware
          </h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Et OS er først og fremst en abstraksjon over I/O: filer, sockets,
            tastatur, mus, disk og nett. Forskjellen mellom en treg og en rask
            applikasjon ligger sjelden i CPU og nesten alltid i hvordan I/O blir
            håndtert. Her bygger vi opp hele kjeden — fra <em>device class</em>{" "}
            via driver-stack til disk-scheduling — med fem interaktive
            visualizere og en avsluttende scenario-quiz.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span> alle visualizere
              ligger inline i seksjonene under. Anbefalt rekkefølge:{" "}
              <a href="#viz-klasser" className="text-brand hover:underline">
                klassifisering
              </a>{" "}
              →{" "}
              <a href="#viz-stack" className="text-brand hover:underline">
                stack-flyt
              </a>{" "}
              →{" "}
              <a href="#viz-strategi" className="text-brand hover:underline">
                CPU-bruk
              </a>{" "}
              →{" "}
              <a href="#viz-cache" className="text-brand hover:underline">
                cache
              </a>{" "}
              →{" "}
              <a href="#viz-sched" className="text-brand hover:underline">
                scheduling
              </a>{" "}
              →{" "}
              <a href="#quiz" className="text-brand hover:underline">
                quiz
              </a>
              .
            </div>
          </div>
        </header>

        <CourseOutline courseId="dte2505-io-management" steps={STEPS} />

        <Section number="1" id="hvorfor" title="Hvorfor I/O er vrient">
          <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-2">
            <li>
              <strong className="text-foreground">
                Tregheter på fem størrelsesordener.
              </strong>{" "}
              CPU-register: 1 ns. RAM: 100 ns. SSD: 100 µs. HDD: 10 ms. Nett:
              50–300 ms. Kjernen må gjemme dette gapet uten å henge programmer.
            </li>
            <li>
              <strong className="text-foreground">Uensartet hardware.</strong>{" "}
              Tusenvis av disktyper, nettverkskort, GPUer, sensorer. Kjernen
              tilbyr ett enkelt grensesnitt — <code className="font-mono">read()/write()</code> — over alt sammen.
            </li>
            <li>
              <strong className="text-foreground">Asynkronitet.</strong>{" "}
              Hardware vet ikke når CPUen er klar; CPUen vet ikke når hardware er
              klar. Mekanismene polling / interrupt / DMA finnes nettopp for å
              koordinere dette.
            </li>
            <li>
              <strong className="text-foreground">
                Rettferdighet vs ytelse.
              </strong>{" "}
              Den raskeste schedulingen (SSTF) er også den mest urettferdige.
              Linux velger CFQ/BFQ i mange tilfeller selv om de gir litt høyere
              seek.
            </li>
          </ul>
        </Section>

        <Section number="2" id="klasser" title="Enhetsklasser — block, char, network">
          <p className="text-sm text-muted-foreground mb-3">
            Kjernen deler enheter inn i tre grunnleggende klasser, og hver klasse
            får sitt eget interface og sin egen driver-base i Linux. Forskjellen
            er essensiell — du kan ikke <code className="font-mono">seek()</code>{" "}
            på en mus, og du kan ikke{" "}
            <code className="font-mono">listen()</code> på en disk.
          </p>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-3 py-2 w-32">
                    Klasse
                  </th>
                  <th className="text-left font-semibold px-3 py-2">
                    Egenskap
                  </th>
                  <th className="text-left font-semibold px-3 py-2">
                    Eksempler
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono text-brand">Block</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    Random access · faste blokker (typisk 4 KB) · buffer cache
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    HDD, SSD, NVMe, USB-stick
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono text-brand">Character</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    Streaming · byte/event om gangen · ingen seek
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    Tastatur, mus, terminal, printer, lydkort
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono text-brand">Network</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    Pakker · variabel størrelse · adresseres via sockets, ikke
                    via filsystem
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    Ethernet, Wi-Fi, loopback
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Kjør <code className="font-mono">ls -l /dev</code> — første tegn er{" "}
            <code className="font-mono">b</code> (block) eller{" "}
            <code className="font-mono">c</code> (char). Nettverk har egen
            namespace <code className="font-mono">/sys/class/net/</code>.
          </p>
        </Section>

        <Section
          number="3"
          id="viz-klasser"
          title="Visualisering — plasser 6 enheter i riktig klasse"
        >
          <p className="text-sm text-muted-foreground mb-3">
            Klikk en enhet for å velge den, klikk så hvilken klasse den hører
            til. Riktig plassering avslører hvilken konsekvens klassen har
            (random access, streaming, pakker).
          </p>
          <DeviceClassifier />
        </Section>

        <Section number="4" id="stack" title="Driver-stack — fra syscall til hardware">
          <p className="text-sm text-muted-foreground mb-3">
            Når et program kaller{" "}
            <code className="font-mono">read(fd, buf, 4096)</code>, krysser
            forespørselen syv lag før den når magnetplaten eller flash-cellen.
            Hvert lag har én ansvarsoppgave og dekker over forskjellene mellom
            de underliggende enhetene.
          </p>
          <div className="rounded-xl border border-border bg-card p-4 text-xs font-mono">
            <pre>{`user-space     fread(fp, buf, 4096)
syscall        sys_read(fd, buf, 4096)
VFS            vfs_read → file->f_op->read
filsystem      ext4_file_read → page cache
block layer    submit_bio → I/O-kø + scheduler
driver         scsi/nvme/ahci · ATA-kommando
controller     DMA-engine + bus (SATA/PCIe)
hardware       magnetisk platte / NAND / 3D-NAND`}</pre>
          </div>
        </Section>

        <Section
          number="5"
          id="viz-stack"
          title="Visualisering — animert read() gjennom stacken"
        >
          <p className="text-sm text-muted-foreground mb-3">
            Spill av eller klikk Neste for å se forespørselen bevege seg ned lag
            for lag. Bytt mellom HDD, SSD og NVMe — observer at bare driveren,
            controlleren og hardwaren endrer seg; alle lag over er identiske.
          </p>
          <DriverStackFlow />
        </Section>

        <Section number="6" id="strategier" title="Polling vs interrupt vs DMA">
          <p className="text-sm text-muted-foreground mb-3">
            Hvordan vet CPUen at I/O er ferdig? Tre helt forskjellige strategier
            med veldig ulike CPU-kostnader:
          </p>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-3 py-2 w-28">
                    Strategi
                  </th>
                  <th className="text-left font-semibold px-3 py-2">
                    Hvordan
                  </th>
                  <th className="text-left font-semibold px-3 py-2">
                    CPU-bruk
                  </th>
                  <th className="text-left font-semibold px-3 py-2">Bra for</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono text-brand">Polling</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    CPU spør hardware i en busy-loop til ready-bit er satt
                  </td>
                  <td className="px-3 py-2 text-rose-700 dark:text-rose-300">
                    100 % under hele ventetiden
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    Korte, kjente latencies (sensorer, mikrokontrollere)
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono text-brand">Interrupt</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    Hardware sender IRQ-signal når data er klar; CPU bytter til
                    handler
                  </td>
                  <td className="px-3 py-2 text-amber-700 dark:text-amber-300">
                    Liten — bare under handleren
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    Tastatur, mus, nettverk, sjeldne events
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono text-brand">DMA</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    Egen DMA-controller flytter data mellom enhet og RAM uten å
                    bry CPU
                  </td>
                  <td className="px-3 py-2 text-emerald-700 dark:text-emerald-300">
                    Minst mulig (oppsett + en kort IRQ)
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    Disk, nett, GPU — alt med store overføringer
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        <Section
          number="7"
          id="viz-strategi"
          title="Visualisering — CPU-bruk for samme I/O-jobb"
        >
          <p className="text-sm text-muted-foreground mb-3">
            Tre tidslinjer side om side viser samme overføring under hver
            strategi. Sjekk hvor mye av tiden CPU bruker på selve I/O (rødt) vs
            annet nyttig arbeid (grønt). DMA-baren er nesten bare grønn — der
            ligger gevinsten.
          </p>
          <IoStrategySim />
        </Section>

        <Section number="8" id="cache" title="Buffer cache — RAM som mellomlag">
          <p className="text-sm text-muted-foreground mb-3">
            Linux gir HELE ubrukt RAM til en buffer/page cache som sitter mellom
            filsystemet og disken. Første lesing av en blokk koster en miss
            (millisekunder). Andre lesing er en hit (nanosekunder) — fem
            størrelsesordener raskere.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="rounded-lg border border-border bg-background p-3 text-xs">
              <div className="font-semibold mb-1.5">Write-back</div>
              <p className="text-muted-foreground">
                Skriv til cache med dirty-bit. Disk oppdateres asynkront ved
                evict eller periodisk flush (
                <code className="font-mono">pdflush</code>/
                <code className="font-mono">writeback</code>-tråd). Rask, men
                crash før flush mister data.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-background p-3 text-xs">
              <div className="font-semibold mb-1.5">Write-through</div>
              <p className="text-muted-foreground">
                Skriv samtidig til cache OG disk. Trygt — data er på disk når
                kallet returnerer. Tregt — du betaler disk-latency hver gang.
                Brukes for DB-WAL og <code className="font-mono">O_SYNC</code>
                -filer.
              </p>
            </div>
          </div>
        </Section>

        <Section
          number="9"
          id="viz-cache"
          title="Visualisering — cache-størrelse vs hit-rate"
        >
          <p className="text-sm text-muted-foreground mb-3">
            Spill av sekvensen og se cache-tilstanden bygge seg opp. Skyv
            cache-størrelse opp og ned — observer hvordan hit-rate øker.
            Skift write-policy og se dirty-bit dukke opp ved write-back.
          </p>
          <BufferCacheSim />
        </Section>

        <Section number="10" id="scheduling" title="I/O-scheduling — i hvilken rekkefølge?">
          <p className="text-sm text-muted-foreground mb-3">
            Når flere requests venter i kø, må block-laget bestemme rekkefølge.
            Mål: minimere head-bevegelse (HDD) eller maksimere throughput uten å
            sulte ut prosesser (alle disker).
          </p>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-3 py-2 w-28">
                    Strategi
                  </th>
                  <th className="text-left font-semibold px-3 py-2">
                    Hvordan
                  </th>
                  <th className="text-left font-semibold px-3 py-2">
                    Fellen
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono text-brand">FIFO</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    Betjen i ankomstrekkefølge.
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    Kan koste enorm seek hvis requests er på motsatte sider av
                    disken.
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono text-brand">SSTF</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    Velg alltid nærmeste cylinder fra current head.
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    Starvation — en request langt unna kan vente evig.
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono text-brand">
                    SCAN (Elevator)
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    Head beveger seg én retning, betjener alle på veien, snur.
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    Litt høyere gjennomsnittlig latency enn SSTF, men ingen
                    starvation.
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono text-brand">CFQ</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    Én kø per prosess. Round-robin gir hver prosess en{" "}
                    <em>tids-slice</em>.
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    Rettferdig, men ikke optimalt for seek på HDD. Default i
                    Linux fram til 5.0.
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono text-brand">none/Kyber</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    SSD/NVMe-tider: scheduler-overhead &gt; gevinst. Linux
                    bruker <em>none</em> eller <em>Kyber</em>.
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    Krever at hardware har egne dype køer (NVMe).
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        <Section
          number="11"
          id="viz-sched"
          title="Visualisering — head-bevegelse for hver strategi"
        >
          <p className="text-sm text-muted-foreground mb-3">
            Samme fem requests, samme starthode, fire strategier. Sammenlign
            total seek-distance og se hvilken strategi som vinner her — og hvor
            CFQ slår når man måler rettferdighet i stedet.
          </p>
          <DiskSchedulingViz />
        </Section>

        <Section
          number="12"
          id="quiz"
          title="Scenario-quiz — match arbeid til strategi"
        >
          <p className="text-sm text-muted-foreground mb-3">
            Åtte realistiske scenarier. Match hvert mot riktig
            strategi-kombinasjon. Trykk Sjekk for å se fasit og forklaring.
          </p>
          <ScenarioDragQuiz />
        </Section>

        <Section number="13" id="feller" title="Eksamen-feller">
          <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-2">
            <li>
              <strong className="text-foreground">«Polling er alltid dårlig».</strong>{" "}
              Nei. For svært korte ventetider (mikrosekunder) er polling
              billigere enn en IRQ-context-switch. NVMe-drivere bruker polling i
              hot path for å minimere latency.
            </li>
            <li>
              <strong className="text-foreground">DMA betyr ikke null CPU.</strong>{" "}
              CPU bruker fortsatt tid på oppsett (programmere DMA-controlleren)
              og på en mini-IRQ når overføringen er ferdig. Gevinsten er at
              CPUen er fri under selve dataoverføringen.
            </li>
            <li>
              <strong className="text-foreground">
                Block-enheter er ikke alltid block-formattert.
              </strong>{" "}
              Du kan{" "}
              <code className="font-mono">open(&quot;/dev/sda&quot;, O_DIRECT)</code> og
              snakke direkte med disken, men kjernen krever fortsatt at
              read/write er aligned til 512 B/4 KB.
            </li>
            <li>
              <strong className="text-foreground">
                CFQ &amp; SSD er en dårlig match.
              </strong>{" "}
              CFQ ble designet for å minimere seek på HDD. På NVMe gir det bare
              overhead — bruk <code className="font-mono">none</code>,{" "}
              <code className="font-mono">mq-deadline</code> eller{" "}
              <code className="font-mono">kyber</code>.
            </li>
            <li>
              <strong className="text-foreground">
                Write-back-cache + crash = tap.
              </strong>{" "}
              Du må <code className="font-mono">fsync()</code> for å garantere
              data på disk. Database-WAL gjør dette eksplisitt.
            </li>
          </ul>
        </Section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Videre lesing</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              O&apos;Gorman, kap. 4 «Input/Output management» — pensum-kjerne.
            </li>
            <li>
              OSTEP kap. 36 (I/O Devices) og 37 (Hard Disk Drives) —{" "}
              <a
                href="https://pages.cs.wisc.edu/~remzi/OSTEP/"
                className="text-brand hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                pages.cs.wisc.edu/~remzi/OSTEP
              </a>
              .
            </li>
            <li>
              <Link
                to="/stack/$slug"
                params={{ slug: "dte2505-filsystem" }}
                className="text-brand hover:underline"
              >
                Filsystem
              </Link>{" "}
              — bygges oppå block-laget her.
            </li>
            <li>
              <Link
                to="/stack/$slug"
                params={{ slug: "dte2505-virtuelt-minne" }}
                className="text-brand hover:underline"
              >
                Virtuelt minne &amp; page cache
              </Link>{" "}
              — page cache er det samme RAM-laget som vises i §8 her.
            </li>
          </ul>
        </div>
      </article>
    </StackPageShell>
  );
}

function Section({
  number,
  id,
  title,
  children,
}: {
  number: string;
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mb-10">
      <h2 className="text-xl font-semibold mb-3">
        {number}. {title}
      </h2>
      {children}
    </section>
  );
}
