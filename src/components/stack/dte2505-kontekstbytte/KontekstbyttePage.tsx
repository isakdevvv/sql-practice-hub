import { Link } from "@tanstack/react-router";
import { Lightbulb, Cpu } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { ContextSwitchSimulator } from "./ContextSwitchSimulator";
import { StepOrderDragQuiz } from "./StepOrderDragQuiz";

const STEPS = [
  { title: "Hva et kontekstbytte egentlig er", anchor: "intro" },
  { title: "Volatile environment — hva må lagres?", anchor: "volatile" },
  { title: "Animator — steg gjennom A→B", anchor: "animator" },
  { title: "Hvorfor PC sist? (og hva skjer hvis ikke)", anchor: "pc-last" },
  { title: "Step-debugger: spor verdiene mellom hvert steg", anchor: "debugger" },
  { title: "Når trigges et bytte i Linux?", anchor: "trigger" },
  { title: "Kostnaden — cache, TLB, branch-predictor", anchor: "kostnad" },
  { title: "Drag-quiz: riktig rekkefølge", anchor: "quiz" },
  { title: "Eksamen-feller", anchor: "feller" },
];

export function KontekstbyttePage() {
  return (
    <StackPageShell title="Kontekstbytte" group="eksamen">
      <article className="container mx-auto px-4 py-10 max-w-3xl">
        <header className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2505 · O&apos;Gorman kap. 2.8
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Kontekstbytte — register save/restore, steg for steg
          </h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Når kernelen tar CPU fra én tråd og gir den til en annen, må alle CPU-registre
            fryses presist nok til at den første tråden kan fortsette som om ingenting har
            skjedd. O&apos;Gorman kaller dette tråden sin <em>volatile environment</em>. Denne
            siden viser register for register hva som lagres til Tråd A, hva som lastes fra
            Tråd B, og det subtile punktet flest eksamenskandidater bommer på:{" "}
            <strong>hvorfor PC må restoreres aller sist</strong>.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <a href="#animator" className="text-brand hover:underline">animatoren</a>{" "}
              spiller hele bytte register-for-register. Bytt til{" "}
              <span className="font-mono">feilmodus</span> for å se hva som skjer
              hvis PC settes for tidlig.
            </div>
          </div>
        </header>

        <CourseOutline courseId="dte2505-kontekstbytte" steps={STEPS} />

        <Section number="1" id="intro" title="Hva et kontekstbytte egentlig er">
          <p className="text-sm text-muted-foreground mb-3">
            En CPU har bare ett sett registre. PC peker på den ene instruksjonen som
            skal kjøres neste, SP peker på den ene stack-frame som er aktiv. Når
            scheduler bestemmer at en annen tråd skal kjøre, må kernelen{" "}
            <strong>kopiere alle registrene ut</strong> til der tråden er &quot;parkert&quot;,
            og <strong>kopiere den nye trådens registre inn</strong>. Først da er CPU-en
            i samme tilstand som da den nye tråden ble suspendert sist.
          </p>
          <div className="rounded-xl border border-border bg-card p-4 text-sm">
            <div className="flex items-center gap-2 mb-2 text-foreground font-semibold">
              <Cpu className="h-4 w-4 text-brand" /> O&apos;Gorman, kap. 2.8 (sammenfattet)
            </div>
            <blockquote className="text-muted-foreground italic border-l-2 border-brand/40 pl-3">
              &laquo;The volatile environment of a thread is everything the CPU was
              holding at the instant the thread was preempted — registers, condition
              flags, and memory-management state. To resume the thread, the kernel
              must restore exactly this state. The program counter must be the last
              register written, because the instant it is written, the CPU begins
              fetching from there.&raquo;
            </blockquote>
          </div>
        </Section>

        <Section number="2" id="volatile" title="Volatile environment — hva må lagres?">
          <p className="text-sm text-muted-foreground mb-3">
            For en typisk RISC-CPU (denne siden bruker en forenklet modell med 8 GP-registre):
          </p>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-3 py-2 w-32">Register</th>
                  <th className="text-left font-semibold px-3 py-2">Hva det inneholder</th>
                  <th className="text-left font-semibold px-3 py-2 w-40">Hvorfor må det med?</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono text-brand">PC</td>
                  <td className="px-3 py-2 text-muted-foreground">Program counter — adressen til neste instruksjon</td>
                  <td className="px-3 py-2 text-muted-foreground">Uten denne vet ikke tråden hvor den var</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono text-brand">SP</td>
                  <td className="px-3 py-2 text-muted-foreground">Stack pointer — toppen av bruker-stacken</td>
                  <td className="px-3 py-2 text-muted-foreground">Lokale variabler, return-adresser</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono text-brand">R0–R7</td>
                  <td className="px-3 py-2 text-muted-foreground">General-purpose registre</td>
                  <td className="px-3 py-2 text-muted-foreground">Verdier under regning som ikke ligger i minnet</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono text-brand">PSR</td>
                  <td className="px-3 py-2 text-muted-foreground">Program Status Register — flagg (Z/N), modus (user/kernel), IE (interrupt-enable)</td>
                  <td className="px-3 py-2 text-muted-foreground">Neste betingede branch trenger flagg</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono text-brand">MMU-regs</td>
                  <td className="px-3 py-2 text-muted-foreground">Page-table-pointer (på x86: CR3; ARM: TTBR)</td>
                  <td className="px-3 py-2 text-muted-foreground">B sin virtuelle adressering må aktiveres før B-kode kjøres</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Hvor lagres det?</strong> I tråden sin Process/Thread Control Block (PCB/TCB).
            Linux: <span className="font-mono">struct task_struct.thread</span>. Kjernelen vet adressen
            til PCB&apos;en fra <span className="font-mono">current</span>-pekeren.
          </p>
        </Section>

        <Section number="3" id="animator" title="Animator — steg gjennom A→B">
          <p className="text-sm text-muted-foreground mb-3">
            Klikk <em>Spill</em> for hele sekvensen, eller <em>Neste steg</em> for å gå
            register for register. Hvert steg viser hvilket register som flyttes,
            i hvilken retning, og hva CPU&apos;ens neste instruction fetch ville bli
            hvis CPU resumerte akkurat nå.
          </p>
          <ContextSwitchSimulator />
        </Section>

        <Section number="4" id="pc-last" title="Hvorfor PC sist? (og hva skjer hvis ikke)">
          <p className="text-sm text-muted-foreground mb-3">
            Det subtile poenget. Idet kernelen skriver til PC, vil CPU&apos;en{" "}
            <strong>i neste klokke-syklus</strong> hente instruksjon fra den nye
            adressen. Hvis SP, GP-registrene, PSR eller MMU-registrene fortsatt er
            den gamle trådens, vil den nye trådens første instruksjon kjøre i feil
            kontekst:
          </p>
          <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1.5 mb-3">
            <li>
              <strong className="text-foreground">Feil MMU:</strong> B&apos;s PC peker
              kanskje på en adresse som ikke finnes i A&apos;s page-table → page fault
              → SIGSEGV. Eller verre: adressen finnes tilfeldigvis i A&apos;s tabell
              også, og CPU kjører {" "}<em>helt feil instruksjon</em> uten å gi feilmelding.
            </li>
            <li>
              <strong className="text-foreground">Feil SP:</strong> første{" "}
              <span className="font-mono">PUSH</span>/<span className="font-mono">CALL</span>{" "}
              skriver til A&apos;s stack. A vil neste gang den får CPU oppdage at
              stacken er korrupt (return-adresse stemmer ikke).
            </li>
            <li>
              <strong className="text-foreground">Feil PSR:</strong> hvis user/kernel-bit
              er fra A og B er i user-mode, vil B kjøre med A&apos;s privilegier — sikkerhetshull.
            </li>
          </ul>
          <p className="text-sm text-muted-foreground mb-2">
            Symmetrisk på save-siden: <strong>PC må saves først</strong>, ellers kan
            en interrupt midt i save-koden ødelegge PC før den er trygt parkert i PCB&apos;en.
          </p>
          <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-3 text-sm">
            <div className="font-semibold text-red-700 dark:text-red-400 mb-1">
              Prøv i animatoren:
            </div>
            <span className="text-muted-foreground">
              Trykk <em>Feilmodus: PC først</em>, så <em>Spill</em>. CPU vil etter PC-load
              vise hva neste instruction fetch ville blitt — og krasje fordi resten av
              registrene fortsatt er A&apos;s.
            </span>
          </div>
        </Section>

        <Section number="5" id="debugger" title="Step-debugger: spor verdiene mellom hvert steg">
          <p className="text-sm text-muted-foreground mb-3">
            Animatoren <em>er</em> step-debuggeren. Bruk <em>Neste steg</em>-knappen,
            og se på de tre panelene:
          </p>
          <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1.5">
            <li>
              <strong className="text-foreground">CPU-blokken (midten):</strong> hva ligger faktisk i registrene akkurat nå.
              Gulmarkering = nettopp skrevet.
            </li>
            <li>
              <strong className="text-foreground">Tråd A (venstre):</strong> volatile environment — hva vi har lagret hittil.
              Felter er <span className="font-mono">—</span> til de er saved.
            </li>
            <li>
              <strong className="text-foreground">Tråd B (høyre):</strong> hva som ligger klart i B sin TCB,
              som vi gradvis trekker inn i CPU-en.
            </li>
            <li>
              Beskrivelse under animasjonen forklarer <em>nøyaktig hvorfor</em> akkurat dette
              steget er nødvendig, og hva som ville skjedd om vi hoppet over det.
            </li>
            <li>
              Feltet <span className="font-mono">neste instruction fetch</span> avslører
              feilmodus-effekten: så snart PC peker på B men resten er A, er CPU-en i
              ulovlig tilstand.
            </li>
          </ul>
        </Section>

        <Section number="6" id="trigger" title="Når trigges et bytte i Linux?">
          <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1.5">
            <li><strong className="text-foreground">Timer-interrupt:</strong> tidsskiven gikk ut. Kernelen tar CPU, kjører <span className="font-mono">schedule()</span>, evt. velger annen tråd.</li>
            <li><strong className="text-foreground">Blocking syscall:</strong> tråden kaller <span className="font-mono">read()</span>/<span className="font-mono">accept()</span> på noe som ikke er klart → går til BLOCKED → schedule().</li>
            <li><strong className="text-foreground">yield():</strong> tråden gir frivillig fra seg CPU.</li>
            <li><strong className="text-foreground">High-prio wakeup:</strong> en hørere-prioritet tråd ble READY (f.eks. I/O ferdig) → preempt.</li>
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">
            I alle disse tilfellene hopper CPU først til kernelens trap-handler. Det
            er <em>der</em> save-rutinen kjører, ikke i bruker-tråden.
          </p>
        </Section>

        <Section number="7" id="kostnad" title="Kostnaden — cache, TLB, branch-predictor">
          <p className="text-sm text-muted-foreground mb-3">
            Selve register-save/restore er noen titalls instruksjoner. Det som er{" "}
            <em>dyrt</em> er de indirekte effektene:
          </p>
          <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1.5">
            <li>
              <strong className="text-foreground">TLB-flush:</strong> ny MMU-pointer
              betyr at de cachede virtuelle→fysiske oversettelsene ikke gjelder.
              Første minneoppslag etter bytte er dyrt (page-walk).
            </li>
            <li>
              <strong className="text-foreground">Cache-misses:</strong> B sin data er
              ikke i L1/L2. De første hundrene tilganger leser fra DRAM (~100×).
            </li>
            <li>
              <strong className="text-foreground">Branch-predictor reset:</strong> historikk
              fra A bommer på B&apos;s grener.
            </li>
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Optimisering:</strong> hvis B er en <em>tråd</em> i samme prosess
            som A (samme MMU-tabell), trenger vi ikke å bytte page-table-pointer.
            Det er en hovedgrunn til at tråder er &laquo;billigere&raquo; enn prosesser.
          </p>
        </Section>

        <Section number="8" id="quiz" title="Drag-quiz: riktig rekkefølge">
          <p className="text-sm text-muted-foreground mb-3">
            10 steg, en korrekt sekvens. Dra og slipp til de står i riktig orden.
          </p>
          <StepOrderDragQuiz />
        </Section>

        <Section number="9" id="feller" title="Eksamen-feller">
          <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-2">
            <li>
              <strong className="text-foreground">&laquo;Det spiller ingen rolle hvilken rekkefølge registrene restoreres i.&raquo;</strong>{" "}
              Feil. PC sist. Argumenter med at CPU begynner instruction fetch i samme syklus som PC skrives.
            </li>
            <li>
              <strong className="text-foreground">&laquo;Vi trenger ikke lagre PSR — det er bare flagg.&raquo;</strong>{" "}
              Feil. PSR holder også interrupt-enable og kernel/user-bit. Mister du IE-biten kan tråden komme tilbake med interrupts permanent disablet.
            </li>
            <li>
              <strong className="text-foreground">&laquo;MMU-registre lastes etter PC.&raquo;</strong>{" "}
              Feil — MMU først av load-siden. Hvis PC settes før MMU, vil neste fetch oversettes mot feil page-table.
            </li>
            <li>
              <strong className="text-foreground">&laquo;Et kontekstbytte mellom tråder i samme prosess er like dyrt som mellom prosesser.&raquo;</strong>{" "}
              Feil. Samme adresseområde → ingen MMU-bytte, ingen TLB-flush. Trådbytte er typisk &lt;5× kostnaden av prosess-bytte.
            </li>
            <li>
              <strong className="text-foreground">&laquo;Volatile environment = bare GP-registrene.&raquo;</strong>{" "}
              Feil. Inkluderer PC, SP, PSR, MMU-state og evt. FPU/SIMD-state.
            </li>
          </ul>
        </Section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Videre lesing</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              O&apos;Gorman, <em>Linux Kernel</em> — kap. 2.8 (context switching),
              kap. 2.7 (process states).
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte2505-scheduling-drill" }} className="text-brand hover:underline">
                CPU-scheduling — Gantt-drill
              </Link>{" "}
              — når scheduleren velger å trigge bytte.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte2505-prosesser-signaler" }} className="text-brand hover:underline">
                Prosesser og signaler
              </Link>{" "}
              — tilstands-maskinen som styrer når en tråd kan/skal byttes ut.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte2505-virtuelt-minne" }} className="text-brand hover:underline">
                Virtuelt minne &amp; paging
              </Link>{" "}
              — hva MMU-registrene faktisk konfigurerer.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte-2505" }} className="text-brand hover:underline">
                DTE-2505-hub
              </Link>{" "}
              — alle OS-mini-kursene.
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
