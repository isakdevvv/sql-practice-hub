import { Link } from "@tanstack/react-router";
import { Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { OsTimeline, OsTimelineQuiz } from "./OsTimeline";

const STEPS = [
  { title: "Hvorfor lære OS-historikk?", anchor: "hvorfor" },
  { title: "Tidslinjen — dra og se", anchor: "tidslinje" },
  { title: "Det store mønsteret", anchor: "monster" },
  { title: "Mini-quiz — plasser hendelsene", anchor: "quiz" },
  { title: "Videre lesing", anchor: "videre" },
];

export function OsHistorikkPage() {
  return (
    <StackPageShell title="OS-historikk tidslinje" group="eksamen">
      <article className="container mx-auto px-4 py-10 max-w-3xl">
        <header className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2505 · O&apos;Gorman kap. 1.5
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Hvordan operativsystemer ble til
          </h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Fra ENIACs lyspaneler i 1945 til containere i 2025: hvert tiår la til en
            abstraksjon som løste forrige tiårs flaskehals. Dra slideren under for å
            se hva som var hovedproblemet, hva som ble løsningen, og hva som endret seg
            fra forrige epoke.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Pedagogisk poeng:</span> historien er ikke
              pugg — den er en mental tråd som forklarer{" "}
              <em>hvorfor</em> moderne OS ser ut som de gjør. Hver epoke svarer på et
              konkret problem fra forrige.
            </div>
          </div>
        </header>

        <CourseOutline courseId="os-historikk" steps={STEPS} />

        <Section number="1" id="hvorfor" title="Hvorfor lære OS-historikk?">
          <p className="text-sm text-muted-foreground mb-3">
            Du kan lære fork(), sider og syscalls uten å vite hvor de kommer fra — men
            da blir de bare regler du må huske. Med litt historisk kontekst blir hver
            mekanisme svaret på et reelt problem:
          </p>
          <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
            <li>
              <strong className="text-foreground">Multiprogrammering</strong> finnes
              fordi CPU-en stod stille mellom batch-jobber på 50-tallet.
            </li>
            <li>
              <strong className="text-foreground">Virtuelt minne</strong> finnes fordi
              programmer på 70-tallet trengte mer RAM enn maskinen hadde.
            </li>
            <li>
              <strong className="text-foreground">Filsystem-rettigheter</strong>{" "}
              (rwx, uid/gid) er fra UNIX — en time-sharing-maskin med mange brukere
              som måtte skjermes fra hverandre.
            </li>
            <li>
              <strong className="text-foreground">Containere &amp; sky</strong> finnes
              fordi moderne CPU-er er så sterke at det er sløsing å vie én hel maskin
              til ett program.
            </li>
          </ul>
        </Section>

        <Section number="2" id="tidslinje" title="Tidslinjen — dra slideren">
          <p className="text-sm text-muted-foreground mb-4">
            Bruk slideren (eller piltastene) for å bytte epoke. Illustrasjonen
            animeres med en visuell metafor for tiåret. Hvert kort viser
            hovedutfordringen, løsningen og hva som endret seg fra forrige epoke.
          </p>
          <OsTimeline />
        </Section>

        <Section number="3" id="monster" title="Det store mønsteret">
          <p className="text-sm text-muted-foreground mb-3">
            Når du har dratt deg gjennom alle sju epokene: legg merke til at hvert
            sprang er en{" "}
            <strong className="text-foreground">ny abstraksjon over forrige nivå</strong>.
          </p>
          <div className="rounded-xl border border-border bg-card p-4 mb-3">
            <pre className="text-[11px] sm:text-xs font-mono overflow-x-auto whitespace-pre leading-relaxed">{`1940s  rå maskinvare              brytere + lys
1950s  + automatisk jobb-bytte    batch monitor
1960s  + flere jobber samtidig    multiprogrammering, time-sharing
1970s  + portabel kjerne, virtuelt minne   UNIX, paging
1980s  + grafisk grensesnitt, LAN PC + GUI + nettverk
1990s  + globalt nettverk, åpen kildekode  Linux, internett, distribuerte sys.
2000+  + virtualisering, sky, mobil       VM, container, app i lomma`}</pre>
          </div>
          <p className="text-sm text-muted-foreground">
            Hver abstraksjon skjuler mer av forrige lag, slik at programmereren slipper
            å tenke på det. Det er <strong className="text-foreground">selve essensen
            av OS-design</strong>: gi userspace en enklere modell enn det maskinvaren
            faktisk er.
          </p>
        </Section>

        <Section number="4" id="quiz" title="Mini-quiz — plasser hendelsene">
          <p className="text-sm text-muted-foreground mb-4">
            Test om mønsteret sitter: dra fem milepæler til riktig tiår. Du må ha gått
            gjennom tidslinjen over først — quizen er en sjekk, ikke introduksjon.
          </p>
          <OsTimelineQuiz />
        </Section>

        <Section number="5" id="videre" title="Videre lesing">
          <div className="rounded-xl border border-border bg-card p-5 text-sm">
            <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
              <li>
                <strong className="text-foreground">O&apos;Gorman kap. 1.5</strong> —{" "}
                <em>The History of Operating Systems</em>. Pensum-kapittelet denne
                lesjonen dekker.
              </li>
              <li>
                Tanenbaum &amp; Bos, <em>Modern Operating Systems</em> 4. utg.,
                kap. 1.2 — historien fortalt i mer detalj.
              </li>
              <li>
                <a
                  href="https://pages.cs.wisc.edu/~remzi/OSTEP/"
                  className="text-brand hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  OSTEP
                </a>{" "}
                — gratis OS-bok. Kap. 2 («Introduction») oppsummerer
                «de tre store stykkene» (virtualisering, konkurrens, persistens) som er
                resultatet av denne historien.
              </li>
              <li>
                <Link to="/stack/$slug" params={{ slug: "os-grunnlag" }} className="text-brand hover:underline">
                  OS-grunnlag
                </Link>{" "}
                — nå som du kjenner historien, se hvordan dagens kjerne faktisk
                er bygget opp.
              </li>
              <li>
                <Link to="/stack/$slug" params={{ slug: "dte2505-scheduling-drill" }} className="text-brand hover:underline">
                  Scheduling-drill
                </Link>{" "}
                — algoritmene fra 60-tallet (multiprogrammering) er fortsatt de samme.
              </li>
              <li>
                <Link to="/stack/$slug" params={{ slug: "dte2505-virtuelt-minne" }} className="text-brand hover:underline">
                  Virtuelt minne &amp; paging
                </Link>{" "}
                — 70-tallets gjennombrudd, fortsatt grunnpilaren i hver moderne CPU.
              </li>
            </ul>
          </div>
        </Section>
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
