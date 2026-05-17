import { Link } from "@tanstack/react-router";
import { Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { OsTypologiSimulator } from "./OsTypologiSimulator";
import { OsCompare } from "./OsCompare";
import { UseCaseMatch } from "./UseCaseMatch";

const STEPS = [
  { title: "Hvorfor finnes det ulike OS-typer?", anchor: "hvorfor" },
  { title: "De fem typene — kort", anchor: "typer" },
  { title: "Interaktiv simulator", anchor: "sim" },
  { title: "Side om side — sammenlign", anchor: "compare" },
  { title: "Match use-case → OS-type", anchor: "match" },
  { title: "Eksamen-feller", anchor: "feller" },
];

export function OsTypologiPage() {
  return (
    <StackPageShell title="OS-typologi" group="eksamen">
      <article className="container mx-auto px-4 py-10 max-w-3xl">
        <header className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2505 · O'Gorman kap. 1.6
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            OS-typologi — batch, interactive, network, real-time, distributed
          </h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Et operativsystem er ikke "et operativsystem" — det er en familie av
            løsninger der hver type er optimert for en bestemt arbeidslast. Velg
            feil type, og du får alt fra dårlig ytelse til at fly faller ned.
            Denne lesjonen lar deg <em>se</em> mismatchene live.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span> velg en arbeidslast
              og en OS-type i simulatoren —{" "}
              <a href="#sim" className="text-brand hover:underline">
                kjør den
              </a>{" "}
              og se hva som skjer. Avslutt med drag-matching av 6 use-cases.
            </div>
          </div>
        </header>

        <CourseOutline courseId="dte2505-os-typologi" steps={STEPS} />

        <Section number="1" id="hvorfor" title="Hvorfor finnes det ulike OS-typer?">
          <p className="text-sm text-muted-foreground mb-3">
            Et OS må bytte mellom flere konkurrerende mål: høy throughput, lav
            respons-tid, garanterte deadlines, fildeling, transparent
            distribusjon. Du kan ikke maksimere alt samtidig — så historien
            løste det med spesialiserte OS-typer for hvert mål.
          </p>
          <div className="rounded-xl border border-border bg-card p-4 text-xs text-muted-foreground">
            <strong className="text-foreground">Eksempel-trade-off:</strong>{" "}
            Et batch-OS holder CPU-en på 100% på samme jobb (god throughput),
            men brukeren får ingen respons før jobben er ferdig. Et interactive
            OS bytter mellom jobber hvert millisekund (god respons), men bruker
            ~5–10% av CPU-en på selve context-switch-overhead.
          </div>
        </Section>

        <Section number="2" id="typer" title="De fem typene — kort">
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-3 py-2 w-32">Type</th>
                  <th className="text-left font-semibold px-3 py-2">
                    Optimert for
                  </th>
                  <th className="text-left font-semibold px-3 py-2">
                    Eksempel
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono text-brand">Batch</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    Throughput. Lange jobber uten interaktivitet.
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    IBM OS/360, mainframe-jobb-køer
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono text-brand">Interactive</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    Respons-tid. Mange korte oppgaver.
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    Linux desktop, macOS, Windows 10
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono text-brand">Network</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    Delte ressurser over LAN. Autentisering.
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    Novell NetWare, Windows Server
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono text-brand">Real-time</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    Garantert deadline. Determinisme.
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    VxWorks (Mars Rover), QNX, FreeRTOS
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono text-brand">Distributed</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    Mange maskiner ser ut som én.
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    Google Borg, Kubernetes, Amoeba
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Merk:</strong> moderne Linux og Windows er primært{" "}
            <em>interactive</em>, men kan kjøre batch-jobber (cron), nettverk
            (Samba, NFS), soft real-time (PREEMPT_RT-patch) og delta i
            distribuerte cluster (Kubernetes-noder). Skillet er strengere på
            embedded/spesial-systemer.
          </p>
        </Section>

        <Section
          number="3"
          id="sim"
          title="Interaktiv simulator — kjør en workload på en OS-type"
        >
          <p className="text-sm text-muted-foreground mb-3">
            Velg en <strong>arbeidslast</strong> (hva brukeren trenger) og en{" "}
            <strong>OS-type</strong> (hva systemet tilbyr). Trykk «Spill av» og
            se hvordan CPU, kø og ferdig-jobber utvikler seg over tid. Når
            simuleringen er ferdig, får du en pedagogisk forklaring.
          </p>
          <OsTypologiSimulator />
          <div className="mt-3 grid sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div className="rounded-md border border-border bg-card p-2.5">
              <strong className="text-foreground">Prøv først:</strong>{" "}
              «Tekstredigering» på «Batch-OS» — se hvordan tastetrykk-køen
              hoper seg opp.
            </div>
            <div className="rounded-md border border-border bg-card p-2.5">
              <strong className="text-foreground">Så denne:</strong>{" "}
              «Fly-by-wire» på «Interactive OS» — control-loopene bommer
              deadline én etter én.
            </div>
          </div>
        </Section>

        <Section number="4" id="compare" title="Side om side — sammenlign to OS-typer">
          <p className="text-sm text-muted-foreground mb-3">
            Velg én workload og kjør to ulike OS-typer parallelt. Rød verdi =
            dårligst, grønn = best. Slik blir trade-offene tydelige uten å måtte
            kjøre simulatoren to ganger.
          </p>
          <OsCompare />
        </Section>

        <Section number="5" id="match" title="Match use-case → OS-type">
          <p className="text-sm text-muted-foreground mb-3">
            Sjekk forståelsen: gitt 6 ekte use-cases — hvilken OS-type passer?
            Det er minst én av hver av batch / interactive / network /
            real-time / distributed.
          </p>
          <UseCaseMatch />
        </Section>

        <Section number="6" id="feller" title="Eksamen-feller">
          <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-2">
            <li>
              <strong className="text-foreground">
                «Real-time betyr raskt».
              </strong>{" "}
              Nei — real-time betyr <em>forutsigbart</em>. Et RTOS kan godt være
              tregere enn Linux i snitt, men det garanterer at INGEN jobb tar
              mer enn X ms. Linux har lav snitt-respons men kan av og til
              hikke 100 ms.
            </li>
            <li>
              <strong className="text-foreground">
                «Distributed OS = mange datamaskiner i nettverk».
              </strong>{" "}
              Det er <em>network</em>. Distributed-er ser ut som ÉN logisk
              maskin for brukeren — du logger inn på "clusteret", ikke på en
              spesifikk node.
            </li>
            <li>
              <strong className="text-foreground">
                «Batch er foreldet».
              </strong>{" "}
              Tvert imot — alle moderne data-pipelines (Spark, Airflow, Hadoop)
              er batch i sjelen. Cron-jobber i Linux er batch. Nattlige
              ETL-prosesser i banker er batch.
            </li>
            <li>
              <strong className="text-foreground">
                «Interactive og network er det samme».
              </strong>{" "}
              Nesten — network er interactive PLUSS eksplisitt støtte for
              delte ressurser (fileshares, printer-køer, brukerkonti på tvers
              av maskiner). En frittstående Linux-laptop er interactive.
              Samme laptop koblet til AD er en network-OS-klient.
            </li>
            <li>
              <strong className="text-foreground">
                Glemmer hybrid-naturen til moderne OS.
              </strong>{" "}
              Linux kan opptre i ALLE rollene avhengig av konfigurasjon og
              patcher. Eksamen-spørsmål om "hvilken type er Linux?" er ofte
              urettferdig — svar nyansert: primært interactive, men kan
              konfigureres for batch (cron), network (Samba), soft RT
              (PREEMPT_RT), og distributed (Kubernetes).
            </li>
          </ul>
        </Section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Videre lesing</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              O'Gorman, <em>Operating Systems with Linux</em>, kap. 1.6 —
              klassisk typologi-kapittel.
            </li>
            <li>
              <Link
                to="/stack/$slug"
                params={{ slug: "dte2505-scheduling-drill" }}
                className="text-brand hover:underline"
              >
                CPU-scheduling-drill
              </Link>{" "}
              — gå dypere på hvordan interactive OS faktisk fordeler CPU.
            </li>
            <li>
              <Link
                to="/stack/$slug"
                params={{ slug: "os-grunnlag" }}
                className="text-brand hover:underline"
              >
                OS-grunnlag
              </Link>{" "}
              — kernel, prosesser, syscalls i bunnen av all OS-design.
            </li>
            <li>
              <Link
                to="/stack/$slug"
                params={{ slug: "dte2505-virtualisering" }}
                className="text-brand hover:underline"
              >
                Virtualisering
              </Link>{" "}
              — hvordan VM-er og containere lar én maskin opptre som flere
              spesialiserte OS-typer samtidig.
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
