import { Link } from "@tanstack/react-router";
import { Layers, Lightbulb, ArrowLeft, ShieldCheck } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { KernelSplitSimulator } from "./KernelSplitSimulator";
import { ArchitectureQuiz } from "./ArchitectureQuiz";

const STEPS = [
  { title: "Hvorfor arkitekturen betyr noe", anchor: "intro" },
  { title: "Splittskjerm-simulator", anchor: "sim" },
  { title: "Hva som faktisk skiller dem", anchor: "diff" },
  { title: "Eksempler i naturen", anchor: "examples" },
  { title: "Drag-quiz", anchor: "quiz" },
  { title: "Eksamen-typiske spørsmål", anchor: "exam" },
];

export function MicrokernelPage() {
  return (
    <StackPageShell title="Microkernel vs monolittisk kernel" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2505 · OS-arkitektur (O&apos;Gorman kap. 1.7)
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Microkernel vs monolittisk kernel — splittskjerm-simulator
          </h1>
          <p className="mt-3 text-muted-foreground">
            Når du designer en kjerne tar du ett valg som bestemmer alt videre:{" "}
            <em>hvor mye</em> skal kjøre med full hardware-tilgang i ring 0, og{" "}
            <em>hvor mye</em> skal isoleres i ring 3 som vanlige
            user-space-prosesser? Monolitt og microkernel er de to klassiske
            ytterpunktene.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Sentralt:</span> det er en
              fundamental trade-off mellom <strong>ytelse</strong> (færre
              ring-bytter, raskere syscalls) og <strong>fault-isolation</strong>{" "}
              (én buggy driver tar ikke ned hele OS-et). Du kan ikke ha begge
              maksimert samtidig.
            </div>
          </div>
        </div>

        <CourseOutline courseId="microkernel-arkitektur" steps={STEPS} />

        <section id="intro" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Hvorfor arkitekturen betyr noe</h2>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm">
            <p>
              CPU-en kjører i to privilegerings-nivåer: <strong>ring 0</strong>{" "}
              (kernel mode) der enhver instruksjon er lovlig, og{" "}
              <strong>ring 3</strong> (user mode) der man trenger syscalls for
              å snakke med hardware. Selve transisjonen ring 3 → ring 0 er
              relativt dyr (lagre registre, bytte sidetabell, validere
              argumenter) — ofte hundrevis av sykler.
            </p>
            <p>
              Hvor du legger filsystem, drivere, IPC-mekanismer og
              nettverks-stacken avgjør <em>hvor mange</em> slike transisjoner
              en gjennomsnittlig forespørsel utløser:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>
                <strong className="text-foreground">Monolitt:</strong> alt
                subsystem-kode er linket inn i kernel-binæren og kjører i ring 0.
                Én syscall, deretter funksjonscall internt, returnerer. 2
                ring-bytter totalt.
              </li>
              <li>
                <strong className="text-foreground">Microkernel:</strong>{" "}
                kjernen inneholder kun det aller minste (typisk: IPC,
                scheduling, basal minneadministrasjon). Filsystem, drivere og
                nettverk bor som <em>vanlige user-space-prosesser</em> som
                snakker via meldinger. Hver server-forespørsel = ekstra
                ring-bytter.
              </li>
            </ul>
            <p className="text-xs text-muted-foreground">
              O&apos;Gorman bruker dette skillet i kap. 1.7 til å forklare
              hvorfor Linux (monolittisk) er rask men sårbar for driver-bugger,
              mens MINIX 3 / QNX (microkernel) bruker mer CPU på syscalls men
              kan re-starte en krasjet driver uten reboot.
            </p>
          </div>
        </section>

        <section id="sim" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Splittskjerm-simulator</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Trigg samme syscall (<code className="text-xs">read(&quot;file.txt&quot;)</code>)
            på begge arkitekturene og se ring-byttene telle opp. Dra moduler
            inn og ut av kernel space på microkernel-siden for å se effekten
            på ytelse og fault-isolation. Krasj driveren for å se forskjellen
            i konsekvens.
          </p>
          <KernelSplitSimulator />
        </section>

        <section id="diff" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Hva som faktisk skiller dem</h2>
          <div className="rounded-xl border border-border bg-card p-5 text-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="py-2 pr-3 font-semibold">Aspekt</th>
                    <th className="py-2 pr-3 font-semibold text-amber-500">Monolitt</th>
                    <th className="py-2 font-semibold text-cyan-500">Microkernel</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-border/60">
                    <td className="py-1.5 pr-3 text-foreground">Kernel-binæren</td>
                    <td className="py-1.5 pr-3">Stor — alt subsystem-kode</td>
                    <td className="py-1.5">Liten — IPC + scheduler + minne</td>
                  </tr>
                  <tr className="border-b border-border/60">
                    <td className="py-1.5 pr-3 text-foreground">Drivere bor</td>
                    <td className="py-1.5 pr-3">i ring 0</td>
                    <td className="py-1.5">i ring 3 (user-prosess)</td>
                  </tr>
                  <tr className="border-b border-border/60">
                    <td className="py-1.5 pr-3 text-foreground">Ring-bytter per syscall</td>
                    <td className="py-1.5 pr-3">2 (inn + ut)</td>
                    <td className="py-1.5">2 + 2·N (N = user-space servere som må kalles)</td>
                  </tr>
                  <tr className="border-b border-border/60">
                    <td className="py-1.5 pr-3 text-foreground">Driver-krasj</td>
                    <td className="py-1.5 pr-3 text-red-500">Kernel panic</td>
                    <td className="py-1.5 text-emerald-500">Bare server-prosessen dør</td>
                  </tr>
                  <tr className="border-b border-border/60">
                    <td className="py-1.5 pr-3 text-foreground">Sikkerhetsflate</td>
                    <td className="py-1.5 pr-3">Stor: enhver bug i kernel = root</td>
                    <td className="py-1.5">Liten: bare microkernel-koden er trusted</td>
                  </tr>
                  <tr className="border-b border-border/60">
                    <td className="py-1.5 pr-3 text-foreground">Personalities (ABI-er)</td>
                    <td className="py-1.5 pr-3">Hardkodet (én Linux per kernel)</td>
                    <td className="py-1.5">Pluggbare som user-servere (POSIX, Win32, …)</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 pr-3 text-foreground">Vedlikeholds-kompleksitet</td>
                    <td className="py-1.5 pr-3">Stor kodebase, men &quot;rett-fram&quot; control flow</td>
                    <td className="py-1.5">Liten kjerne, men kompleks meldings-koreografi</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground pt-3">
              Den klassiske kritikken mot microkernel — at IPC-overhead gjør
              dem for trege — gjaldt for Mach på 90-tallet. Moderne
              implementasjoner (L4, seL4) har vist at en optimalisert
              IPC-primitiv kan koste &lt; 1 µs på moderne CPU-er, og at
              gapet til monolitt er mindre enn man tror.
            </p>
          </div>
        </section>

        <section id="examples" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Eksempler i naturen</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl border border-amber-500/40 bg-amber-500/5 p-4">
              <div className="font-semibold mb-1 text-amber-500">Monolittiske</div>
              <ul className="space-y-1 text-xs text-muted-foreground list-disc pl-4">
                <li>Linux (klassisk; tillater loadable modules)</li>
                <li>klassisk UNIX, FreeBSD, NetBSD, OpenBSD</li>
                <li>MS-DOS (uten ring-skille — &quot;mer&quot; monolittisk)</li>
              </ul>
            </div>
            <div className="rounded-xl border border-cyan-500/40 bg-cyan-500/5 p-4">
              <div className="font-semibold mb-1 text-cyan-500">Microkernel</div>
              <ul className="space-y-1 text-xs text-muted-foreground list-disc pl-4">
                <li>Mach (CMU, 1985)</li>
                <li>MINIX 3 (Tanenbaum — Intel Management Engine!)</li>
                <li>QNX (bilindustri, BlackBerry OS)</li>
                <li>L4-familien, seL4 (formelt verifisert)</li>
                <li>GNU Hurd</li>
              </ul>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 sm:col-span-2">
              <div className="font-semibold mb-1 flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-brand" /> Hybrider
              </div>
              <p className="text-xs text-muted-foreground">
                I praksis er det få rene microkjerner i bruk på desktop:{" "}
                <strong>Windows NT</strong> (NT-kernel, ulike subsystemer) og{" "}
                <strong>XNU</strong> (macOS — Mach-IPC + BSD-monolitt i samme
                kernel space) er hybrider. De låner microkernel-konsepter
                (personality, message-passing) men holder kritiske subsystemer
                in-kernel for ytelsens skyld.
              </p>
            </div>
          </div>
        </section>

        <section id="quiz" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Drag-quiz</h2>
          <ArchitectureQuiz />
        </section>

        <section id="exam" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Eksamen-typiske spørsmål</h2>
          <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
            <li>
              <strong className="text-foreground">«Hva er forskjellen på monolittisk og microkernel?»</strong>{" "}
              Monolitt har drivere/FS/nettverk i ring 0; microkernel har dem
              som user-space servere som snakker via IPC. Trade-off er
              ytelse vs. fault-isolation.
            </li>
            <li>
              <strong className="text-foreground">«Hvorfor er microkernel «tregere»?»</strong>{" "}
              Hver server-forespørsel = en ekstra runde med user→kernel→user
              ring-bytter for IPC-meldingen, pluss kontekst-bytte til
              server-prosessen.
            </li>
            <li>
              <strong className="text-foreground">«Hva er en personality?»</strong>{" "}
              En user-space-komponent som implementerer en spesifikk ABI
              (POSIX, Win32) oppå en microkernel. Mach/L4/Hurd støtter
              flere parallelt.
            </li>
            <li>
              <strong className="text-foreground">«Hvorfor er Linux monolittisk og ikke microkernel?»</strong>{" "}
              Historisk valg av Linus i Tanenbaum-debatten (1992): enklere å
              bygge, raskere på maskinvaren i den tiden, og loadable modules
              ga &quot;god nok&quot; modularitet uten IPC-overhead.
            </li>
            <li>
              <strong className="text-foreground">«Hva er seL4 sin betydning?»</strong>{" "}
              Første microkernel med formell verifisering av at koden matcher
              spesifikasjonen. Brukes der safety/security er kritisk
              (luftfart, militær).
            </li>
            <li>
              <strong className="text-foreground">«Hvor passer XNU og NT inn?»</strong>{" "}
              Hybride — låner microkernel-konsepter (Mach-IPC i XNU,
              subsystem-design i NT) men flytter kritiske deler in-kernel for
              ytelse. Sjelden &quot;rent&quot; en eller annen.
            </li>
          </ul>
        </section>

        <div className="rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-brand" />
            Neste steg
          </h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/stack/$slug" params={{ slug: "os-grunnlag" }} className="text-brand hover:underline">
                OS-grunnlag
              </Link>{" "}
              — kernel vs userspace, syscalls og prosess-livssyklus.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte2505-ipc" }} className="text-brand hover:underline">
                IPC
              </Link>{" "}
              — message-passing-mekanismene som microkjerner lever av.
            </li>
            <li>
              Lese-tips: O&apos;Gorman kap. 1.7. Tanenbaum vs Torvalds-debatten
              fra comp.os.minix (1992) — bakgrunn for arkitektur-valgene.
            </li>
          </ul>
        </div>
        <div className="mt-6">
          <Link
            to="/stack/$slug"
            params={{ slug: "dte-2505" }}
            className="text-brand hover:underline inline-flex items-center gap-1 text-sm"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Tilbake til DTE-2505-hub
          </Link>
        </div>
      </div>
    </StackPageShell>
  );
}
