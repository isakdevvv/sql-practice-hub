import { Link } from "@tanstack/react-router";
import { Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { Tex, TexBlock } from "@/components/Tex";
import { SchedulingSimulator } from "./SchedulingSimulator";

const STEPS = [
  { title: "Hva scheduleren prøver å optimere", anchor: "metrics" },
  { title: "FIFO (FCFS)", anchor: "fifo" },
  { title: "SJF — Shortest Job First", anchor: "sjf" },
  { title: "STCF — preemptiv SJF", anchor: "stcf" },
  { title: "Round-Robin", anchor: "rr" },
  { title: "MLFQ — Multi-Level Feedback Queue", anchor: "mlfq" },
  { title: "Sammenlign side om side", anchor: "compare" },
  { title: "Gantt-simulator + drill", anchor: "drill" },
  { title: "Eksamen-feller", anchor: "feller" },
];

export function SchedulingDrillPage() {
  return (
    <StackPageShell title="Scheduling-drill" group="eksamen">
      <article className="container mx-auto px-4 py-10 max-w-3xl">
        <header className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2505 · OSTEP kap. 7–10
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            CPU-scheduling — fra FIFO til MLFQ
          </h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Scheduleren bestemmer hvilken klar jobb som får CPU-en når. Den klassiske
            øvelsen i OS-faget: gitt en liste jobber med ankomst og burst, regn ut
            ferdigtid, turnaround og venting for hver algoritme. Lær mønsteret én gang
            og kjenn det igjen på eksamen.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <a href="#drill" className="text-brand hover:underline">Gantt-simulatoren</a>{" "}
              lengre ned + 5 forhåndsdefinerte øvelser. Bytt algoritme og se snitt-tallene
              endre seg live.
            </div>
          </div>
        </header>

        <CourseOutline courseId="dte2505-scheduling-drill" steps={STEPS} />

        <Section number="1" id="metrics" title="Hva scheduleren prøver å optimere">
          <p className="text-sm text-muted-foreground mb-3">
            Ingen scheduler er «best» — de optimerer ulike ting og bytter alltid bort
            noe annet. De fire klassiske metrikkene:
          </p>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-3 py-2 w-40">Metrikk</th>
                  <th className="text-left font-semibold px-3 py-2">Definisjon</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono text-brand">Turnaround time</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    <Tex>{`T_{ferdig} - T_{ankomst}`}</Tex>{" "}
                    — total tid fra jobben kom inn til den var ferdig. Batch-jobber
                    bryr seg om dette.
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono text-brand">Response time</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    <Tex>{`T_{f\\o rste\\;start} - T_{ankomst}`}</Tex>{" "}
                    — hvor lenge brukeren vente på første reaksjon. Interaktive
                    jobber kreves at den er lav.
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono text-brand">Throughput</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    <Tex>{`N / T_{total}`}</Tex>{" "}
                    — antall jobber ferdig per tidsenhet. Serverer flest mulig.
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono">Fairness</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    Får alle jobber en rimelig del av CPU-en? Round-robin er rettferdig;
                    SJF er ikke (lange jobber svelter hvis korte hele tiden kommer inn).
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Trade-off du må kjenne:</strong> lavere response time krever ofte
            preemption og context-switching, som blåser opp snitt-turnaround. Du
            kan ikke maksimere alt samtidig.
          </p>
        </Section>

        <Section number="2" id="fifo" title="FIFO — First In, First Out (FCFS)">
          <p className="text-sm text-muted-foreground mb-3">
            Den enkleste mulige scheduler: jobben som kom først, kjører først, og den
            fullfører før vi går videre. Ingen preemption.
          </p>
          <div className="rounded-xl border border-border bg-card p-4 mb-3">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Eksempel
            </div>
            <table className="w-full text-xs font-mono mb-2">
              <thead className="text-muted-foreground">
                <tr>
                  <th className="text-left font-normal pb-1">jobb</th>
                  <th className="text-left font-normal pb-1">ankomst</th>
                  <th className="text-left font-normal pb-1">burst</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>A</td><td>0</td><td>10</td></tr>
                <tr><td>B</td><td>1</td><td>1</td></tr>
                <tr><td>C</td><td>2</td><td>1</td></tr>
              </tbody>
            </table>
            <pre className="text-xs font-mono">{`0          10  11 12
|---  A  ---|-B-|-C-|
turnaround:  A=10, B=10, C=10  →  snitt 10
venting:     A=0,  B=9,  C=9   →  snitt 6`}</pre>
          </div>
          <p className="text-xs text-muted-foreground">
            <strong>Problemet — convoy effect:</strong> én lang jobb foran i køen
            blokkerer alle korte. Tenk en lang lastebil i kassa på Rema 1000 mens to
            kunder med én vare hver venter.
          </p>
        </Section>

        <Section number="3" id="sjf" title="SJF — Shortest Job First">
          <p className="text-sm text-muted-foreground mb-3">
            Når CPU-en blir ledig, velg jobben med kortest burst-tid blant de som har
            ankommet. Ikke-preemptiv: jobben kjører til den er ferdig.
          </p>
          <div className="rounded-xl border border-border bg-card p-4 mb-3">
            <pre className="text-xs font-mono">{`Med samme jobber, men alle ankommer på t=0:
0     1     2          12
|--B--|--C--|---- A ----|
turnaround:  A=12, B=1, C=2  →  snitt 5
venting:     A=2,  B=0, C=1  →  snitt 1`}</pre>
          </div>
          <p className="text-xs text-muted-foreground mb-2">
            <strong>OSTEPs bevis:</strong> SJF gir lavest gjennomsnittlig
            turnaround når alle jobber er klar samtidig. Men:
          </p>
          <ul className="text-xs text-muted-foreground list-disc pl-5 space-y-1">
            <li>Krever å vite burst-tiden på forhånd (urealistisk i praksis).</li>
            <li>Ikke-preemptiv — hvis en lang jobb starter rett før en kort kommer, må den korte vente.</li>
            <li>Lange jobber kan <em>svelte</em> hvis det stadig kommer korte (starvation).</li>
          </ul>
        </Section>

        <Section number="4" id="stcf" title="STCF — Shortest Time-to-Completion First">
          <p className="text-sm text-muted-foreground mb-3">
            SJF + preemption. Hver gang en ny jobb ankommer, sammenlign dens burst med
            den gjenværende tiden på den kjørende jobben — bytt hvis den nye er kortere.
          </p>
          <div className="rounded-xl border border-border bg-card p-4 mb-3">
            <pre className="text-xs font-mono">{`A: ankomst 0, burst 10
B: ankomst 3, burst 2
C: ankomst 5, burst 1

t=0: A starter
t=3: B (burst 2) < A (rem 7) → bytt til B
t=5: C (burst 1) < B (rem 0... B er ferdig på t=5)
     A (rem 7) vs C (1) → C
t=6: C ferdig, A resume
t=13: A ferdig

turnaround: A=13, B=2, C=1  → snitt 5.3
response:   A=0,  B=0, C=0  → snitt 0`}</pre>
          </div>
          <p className="text-xs text-muted-foreground">
            STCF er optimal for turnaround. Men <strong>response time for lange
            jobber kan fortsatt være elendig</strong>, og det er fortsatt avhengig av å
            kjenne burst.
          </p>
        </Section>

        <Section number="5" id="rr" title="Round-Robin — fair share">
          <p className="text-sm text-muted-foreground mb-3">
            Hver jobb får et fast <em>tidskvantum</em> (typisk 10–100 ms). Etter
            kvantumet preempteres jobben og legges bak i køen. Aller best for{" "}
            <strong>respons-tid</strong> og rettferdighet.
          </p>
          <div className="rounded-xl border border-border bg-card p-4 mb-3">
            <pre className="text-xs font-mono">{`Tidskvantum q=2, jobber A(5), B(3), C(7) alle på t=0:

| A | B | C | A | B | C | A | C | C |
0   2   4   6   8   9  11  13  15  17

response: A=0, B=2, C=4   →  snitt 2
turnaround: A=11, B=9, C=17 → snitt 12.3`}</pre>
          </div>
          <TexBlock>{`T_{respons,worst} \\le (n-1) \\cdot q`}</TexBlock>
          <p className="text-xs text-muted-foreground">
            <strong>Valg av kvantum:</strong> for lite → mye context-switch overhead
            (CPU brukes på å bytte i stedet for å regne). For stort → blir nesten FIFO.
            Linux bruker dynamisk kvantum (~1–20 ms) basert på prioritet.
          </p>
        </Section>

        <Section number="6" id="mlfq" title="MLFQ — Multi-Level Feedback Queue">
          <p className="text-sm text-muted-foreground mb-3">
            Hvordan håndtere mix av korte interaktive jobber og lange CPU-tunge — uten
            å kjenne burst på forhånd? Svaret: <strong>la oppførselen avgjøre prioriteten.</strong>{" "}
            Dette er prinsippet bak Linux sin O(1)- og CFS-scheduler.
          </p>
          <div className="rounded-xl border border-border bg-card p-4 mb-3">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Reglene (OSTEP)
            </div>
            <ul className="text-xs space-y-1 text-foreground">
              <li>R1: Hvis Pri(A) &gt; Pri(B), kjør A.</li>
              <li>R2: Like prioritet → Round-Robin.</li>
              <li>R3: Nye jobber starter i øverste kø (høyeste prioritet).</li>
              <li>R4: Bruker en jobb hele kvantumet → senk prioriteten ett nivå.</li>
              <li>R4&apos;: Gir den fra seg CPU (I/O) før kvantumet → behold prioritet.</li>
              <li>R5: Etter en periode <Tex>{`S`}</Tex>, løft ALLE jobber til topp (anti-starvation).</li>
            </ul>
          </div>
          <p className="text-xs text-muted-foreground">
            <strong>Effekten:</strong> CPU-tunge batch-jobber synker ned og lar
            korte interaktive (terminal, redaktør, nettleser) holde høy prioritet —
            uten at scheduleren noen gang trenger å vite burst på forhånd.
          </p>
        </Section>

        <Section number="7" id="compare" title="Sammenlign side om side">
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-xs">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-2 py-2 w-20">Algoritme</th>
                  <th className="text-left font-semibold px-2 py-2">Preemptiv?</th>
                  <th className="text-left font-semibold px-2 py-2">Kjenner burst?</th>
                  <th className="text-left font-semibold px-2 py-2">Sterk på</th>
                  <th className="text-left font-semibold px-2 py-2">Svak på</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-2 py-2 font-mono">FIFO</td>
                  <td className="px-2 py-2 text-muted-foreground">Nei</td>
                  <td className="px-2 py-2 text-muted-foreground">Nei</td>
                  <td className="px-2 py-2 text-muted-foreground">Enkelhet</td>
                  <td className="px-2 py-2 text-muted-foreground">Convoy effect</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-2 py-2 font-mono">SJF</td>
                  <td className="px-2 py-2 text-muted-foreground">Nei</td>
                  <td className="px-2 py-2 text-muted-foreground">Ja</td>
                  <td className="px-2 py-2 text-muted-foreground">Snitt-turnaround</td>
                  <td className="px-2 py-2 text-muted-foreground">Starvation, urealistisk</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-2 py-2 font-mono">STCF</td>
                  <td className="px-2 py-2 text-muted-foreground">Ja</td>
                  <td className="px-2 py-2 text-muted-foreground">Ja</td>
                  <td className="px-2 py-2 text-muted-foreground">Optimal turnaround</td>
                  <td className="px-2 py-2 text-muted-foreground">Krever oraklet burst</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-2 py-2 font-mono">RR</td>
                  <td className="px-2 py-2 text-muted-foreground">Ja</td>
                  <td className="px-2 py-2 text-muted-foreground">Nei</td>
                  <td className="px-2 py-2 text-muted-foreground">Respons, fairness</td>
                  <td className="px-2 py-2 text-muted-foreground">Snitt-turnaround</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-2 py-2 font-mono">MLFQ</td>
                  <td className="px-2 py-2 text-muted-foreground">Ja</td>
                  <td className="px-2 py-2 text-muted-foreground">Nei (lærer)</td>
                  <td className="px-2 py-2 text-muted-foreground">Mix av jobb-typer</td>
                  <td className="px-2 py-2 text-muted-foreground">Tuning av parametere</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        <Section number="8" id="drill" title="Gantt-simulator — bytt algoritme, se metrikker">
          <p className="text-sm text-muted-foreground mb-3">
            Bruk en av de fem presetene eller skriv inn dine egne jobber. Gantt-chartet
            tegnes om på flekken. Sammenlign snitt-turnaround mellom FIFO og SJF på
            samme jobber for å se convoy-effekten.
          </p>
          <SchedulingSimulator />
        </Section>

        <Section number="9" id="feller" title="Eksamen-feller">
          <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-2">
            <li>
              <strong className="text-foreground">«FIFO er bra fordi det er fair».</strong>{" "}
              Nei — FIFO behandler alle i ankomst-rekkefølge, men det er ikke rettferdig
              hvis lange jobber kommer først (convoy).
            </li>
            <li>
              <strong className="text-foreground">«SJF gir alltid best turnaround».</strong>{" "}
              Kun når alle jobber ankommer samtidig. Med varierende ankomst-tider er
              STCF (preemptiv versjon) optimal.
            </li>
            <li>
              <strong className="text-foreground">«Round-robin er alltid optimalt for respons».</strong>{" "}
              Bare hvis du velger riktig kvantum. Q for stort → blir FIFO. Q for lite →
              context-switching dreper throughput.
            </li>
            <li>
              <strong className="text-foreground">Glemte å regne riktig på preemption.</strong>{" "}
              For STCF og RR: sjekk ankomst-tabellen ved <em>hvert</em> tidspunkt — nye
              jobber kan dukke opp mens du regner.
            </li>
            <li>
              <strong className="text-foreground">MLFQ-prioritets-løft (R5) glemmes.</strong>{" "}
              Uten R5 ville lange batch-jobber svelte for alltid. Vis R5 hvis spørsmålet
              spør om starvation.
            </li>
          </ul>
        </Section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Videre lesing</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              OSTEP kap. 7 (Scheduling: Intro), 8 (MLFQ), 9 (Lottery), 10 (Multi-CPU) —{" "}
              <a
                href="https://pages.cs.wisc.edu/~remzi/OSTEP/"
                className="text-brand hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                gratis online
              </a>.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte-2505" }} className="text-brand hover:underline">
                DTE-2505-hub
              </Link>{" "}
              — alle OS-mini-kursene.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte2505-virtuelt-minne" }} className="text-brand hover:underline">
                Virtuelt minne &amp; paging
              </Link>{" "}
              — det neste store OS-temaet.
            </li>
            <li>
              <Link to="/cards" className="text-brand hover:underline">Flashcards</Link>{" "}
              filtrert på DTE-2505 — drill metrikker og algoritme-egenskaper.
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
