import { Link } from "@tanstack/react-router";
import {
  Keyboard,
  Monitor,
  Lock,
  Bug,
  Brain,
  HelpCircle,
  Telescope,
  Info,
  Layers,
} from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { DiverseAnsla } from "./DiverseAnsla";
import { VimSimulator } from "./VimSimulator";
import { XKlientTjener } from "./XKlientTjener";
import { SshOppgaver } from "./SshOppgaver";
import { FeilsokingPanel } from "@/components/stack/dte2505-felles/FeilsokingPanel";
import { RecallPanel } from "@/components/stack/dte2505-felles/RecallPanel";
import { MODUL6_TROUBLE_TASKS } from "@/lib/dte2505/sshEngine";
import { DIVERSE_RECALL_CARDS, DIVERSE_CARD_TAGS, diverseFsrs } from "@/lib/dte2505/diverseKort";

// ---------------------------------------------------------------------------
// DTE-2505 Modul 6 — «Diverse: vi/vim, X og SSH».
//
// Tre løse tråder som Canvas har samlet i én modul. De henger likevel sammen i
// praksis: du redigerer en fil med vim PÅ en maskin du nådde med SSH, og
// grafikken derfra kommer hjem gjennom X-videresending — som går i SSH-tunnelen.
// Derfor er rekkefølgen vim → X → SSH, med SSH sist fordi den binder alt sammen.
//
// Seksjonsrekkefølgen er oppgave-arkitekturen i PLAN-HOST26-MODULER.md §3:
//   1. Anslå-så-sjekk · 2. Guidet simulering · 3. Måloppgave med tilstandssjekk
//   4. Feilsøking · 5. Recall-kort
// ---------------------------------------------------------------------------

const STEPS = [
  { title: "Hvorfor disse tre", anchor: "hvorfor" },
  { title: "1 · Anslå først", anchor: "ansla" },
  { title: "vi og vim: modusmodellen", anchor: "vim" },
  { title: "2+3 · vim-simulatoren", anchor: "vim-sim" },
  { title: "X: klient og tjener", anchor: "x" },
  { title: "2 · X-modellen visuelt", anchor: "x-viz" },
  { title: "Wayland", anchor: "wayland" },
  { title: "SSH: nøkler i stedet for passord", anchor: "ssh" },
  { title: "2+3 · SSH-oppgaver", anchor: "ssh-sim" },
  { title: "Filoverføring og config", anchor: "ssh-mer" },
  { title: "4 · Feilsøking", anchor: "feilsok" },
  { title: "5 · Recall-kort", anchor: "recall" },
  { title: "Dypere enn pensum", anchor: "dypere" },
];

export function Modul6Page() {
  return (
    <StackPageShell title="Diverse — vi/vim, X og SSH" group="eksamen">
      <article className="container mx-auto max-w-3xl px-4 py-10">
        <header className="mb-8">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand">
            DTE-2505 · Modul 6
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Teksteditoren, grafikken og innloggingen
          </h1>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            Tre løse tråder til slutt i emnet: teksteditoren <strong>vi</strong> som alltid finnes på
            en Linux-maskin, det grafiske systemet <strong>X</strong> som er delt i klient og tjener på
            en måte de fleste gjetter feil, og <strong>SSH</strong> (Secure Shell) som er måten du
            faktisk kommer deg inn på andre maskiner. De henger tettere sammen enn de ser ut: du
            redigerer med vi på en maskin du nådde med SSH, og grafikken derfra kommer hjem gjennom
            X-videresending — som går i SSH-tunnelen.
          </p>
          <div className="mt-4 flex items-start gap-3 rounded-lg border border-sky-500/40 bg-sky-500/5 p-4">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400" />
            <div className="text-sm leading-relaxed">
              <span className="font-medium">Ingen oblig på denne modulen.</span> Det er ingen
              innlevering og ingen frist. Stoffet er likevel pensum og kan komme på eksamen 2.
              desember — og i praksis er det den modulen du får mest bruk for etter emnet.
            </div>
          </div>
        </header>

        <CourseOutline courseId="dte2505-modul6" steps={STEPS} />

        {/* ================================================================= */}
        <section id="hvorfor" className="mt-10">
          <h2 className="mb-3 flex items-center gap-2 text-2xl font-semibold">
            <Layers className="h-5 w-5 text-brand" /> Hvorfor akkurat disse tre
          </h2>
          <p className="leading-relaxed">
            Tenk deg en helt vanlig situasjon: et skript feiler på en tjener i et serverrom du aldri
            har sett. Du kommer deg inn med <strong>SSH</strong>. Der finnes ingen grafisk editor, så
            du retter fila med <strong>vi</strong> — den er installert på absolutt alle Unix-lignende
            systemer, også når ingenting annet er det. Skal du kjøre et grafisk verktøy på den
            maskinen, må vinduet hjem til skjermen din, og det er <strong>X</strong> som gjør det
            mulig.
          </p>
          <p className="mt-2 leading-relaxed">
            Modulen bygger på det du allerede kan: filsystemet og skallet fra modul 4, og
            rettighetsbitene fra modul 5 — de siste dukker opp igjen som en av de vanligste
            SSH-feilene.
          </p>
        </section>

        {/* ============ 1. ANSLÅ-SÅ-SJEKK ================================== */}
        <section id="ansla" className="mt-12">
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-full bg-brand/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-brand">
              Oppgavetype 1
            </span>
            <span className="text-xs text-muted-foreground">før forklaringen</span>
          </div>
          <h2 className="mb-3 flex items-center gap-2 text-2xl font-semibold">
            <HelpCircle className="h-5 w-5 text-brand" /> Anslå først, sjekk etterpå
          </h2>
          <p className="mb-4 leading-relaxed">
            Ni anslag, tre for hver del. Ta dem <em>før</em> du leser videre — du skal ikke kunne
            svarene ennå. Du kan filtrere på del hvis du vil ta vim-anslagene rett før vim-avsnittet.
          </p>
          <DiverseAnsla />
        </section>

        {/* ============ VIM ================================================ */}
        <section id="vim" className="mt-12">
          <h2 className="mb-3 flex items-center gap-2 text-2xl font-semibold">
            <Keyboard className="h-5 w-5 text-brand" /> vi: den modale editoren
          </h2>
          <p className="leading-relaxed">
            <strong>vi</strong> («visual editor») er fra 1976 og finnes på hver eneste Unix-lignende
            maskin. <strong>vim</strong> (<em>Vi IMproved</em>) er den moderne versjonen du møter på
            Linux i dag. At den alltid er der er hele grunnen til at du må kunne den: på en fersk
            tjener, i en container eller i et redningsmiljø er den ofte den eneste editoren.
          </p>
          <p className="mt-2 leading-relaxed">
            Det ene som gjør vi annerledes enn alt annet, er at den er <strong>modal</strong>. I en
            vanlig editor betyr en tast alltid «skriv dette tegnet». I vi betyr den fire forskjellige
            ting avhengig av hvilken modus du er i:
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[32rem] border-collapse text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="py-2 pr-3 font-medium">Modus</th>
                  <th className="py-2 pr-3 font-medium">Hva tastene gjør</th>
                  <th className="py-2 font-medium">Inn / ut</th>
                </tr>
              </thead>
              <tbody className="[&>tr]:border-b [&>tr]:border-border/60">
                {[
                  ["Normal", "Tastene er kommandoer. Her starter du alltid.", "Esc fra alle andre"],
                  ["Innsetting", "Tastene blir tekst. Den eneste modusen der det skjer.", "i a o O inn · Esc ut"],
                  ["Visuell", "Bevegelsene utvider en merking.", "v inn · Esc eller d/y ut"],
                  ["Kommandolinje", "Du skriver en kommando nederst på skjermen.", ": inn · Enter eller Esc ut"],
                ].map(([a, b, c]) => (
                  <tr key={a}>
                    <td className="py-2 pr-3 font-medium">{a}</td>
                    <td className="py-2 pr-3">{b}</td>
                    <td className="py-2 font-mono text-xs text-muted-foreground">{c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 rounded-lg border border-amber-500/40 bg-amber-500/5 p-4 text-sm leading-relaxed">
            <span className="font-medium">Regelen som løser nesten alt:</span> er du i tvil, trykk{" "}
            <kbd className="rounded border bg-card px-1.5 py-0.5 font-mono text-xs">Esc</kbd>. Fra alle
            andre moduser tar den deg til normalmodus, og i normalmodus gjør den ingenting. Den er
            derfor alltid trygg — og alltid riktig startpunkt for neste kommando.
          </div>
          <p className="mt-3 leading-relaxed">
            Det som skremmer folk vekk fra vi er nesten alltid det samme: man begynner å skrive uten å
            vite at man er i normalmodus, ting hopper rundt, og man finner ikke veien ut. Svaret på det
            siste er fire kommandoer, og de kjøres alle fra kommandolinjemodus:
          </p>
          <ul className="mt-2 space-y-1.5 pl-5 leading-relaxed [&>li]:list-disc">
            <li>
              <code className="font-mono">:w</code> — <em>write</em>: lagre, og bli værende.
            </li>
            <li>
              <code className="font-mono">:q</code> — <em>quit</em>: avslutt. Nekter hvis du har
              ulagrede endringer, som en sikring.
            </li>
            <li>
              <code className="font-mono">:wq</code> — lagre og avslutt i én kommando. Den du bruker
              mest.
            </li>
            <li>
              <code className="font-mono">:q!</code> — forkast alt og avslutt. Utropstegnet betyr «jeg
              mener det» over hele vim.
            </li>
          </ul>
        </section>

        {/* ============ 2+3 VIM-SIMULATOREN =============================== */}
        <section id="vim-sim" className="mt-10">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-brand/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-brand">
              Oppgavetype 2 + 3
            </span>
            <span className="text-xs text-muted-foreground">
              guidet simulering, så måloppgaver med tilstandssjekk
            </span>
          </div>
          <h3 className="mb-3 text-xl font-semibold">Prøv modusene</h3>
          <p className="mb-4 leading-relaxed">
            Modusstripen øverst viser alltid hvor du er, og feltet under editoren forklarer hva det
            siste tastetrykket faktisk gjorde. Klikk i editoren for å bruke ekte tastatur, eller trykk
            på tasteknappene. Begynn i <strong>Utforsk fritt</strong> — der kan ingenting gå galt —
            og gå så til <strong>Måloppgaver</strong>, der sjekken ser på hva som står i fila, ikke
            på hvilke taster du brukte.
          </p>
          <VimSimulator />
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Legg spesielt merke til to ting: at bokstaver i normalmodus <em>ikke</em> havner i teksten,
            og at <code className="font-mono">:wq</code> skrevet i innsettingsmodus blir stående midt i
            fila. Det er de to opplevelsene alle har hatt.
          </p>
        </section>

        {/* ============ X ================================================== */}
        <section id="x" className="mt-12">
          <h2 className="mb-3 flex items-center gap-2 text-2xl font-semibold">
            <Monitor className="h-5 w-5 text-brand" /> X Window System: klient og tjener
          </h2>
          <p className="leading-relaxed">
            <strong>X Window System</strong> (ofte skrevet <strong>X11</strong>, fordi versjon 11 fra
            1987 er den som overlevde) er grunnlaget under det grafiske skrivebordet på Linux. Det
            tegner ikke skrivebordet selv — det leverer de grunnleggende byggeklossene: vinduer,
            inndata fra tastatur og mus, og en protokoll for å be om at noe blir tegnet.
          </p>
          <p className="mt-2 leading-relaxed">
            Arkitekturen er klient–tjener, og retningen er det som forvirrer:
          </p>
          <ul className="mt-2 space-y-2 pl-5 leading-relaxed [&>li]:list-disc">
            <li>
              <strong>X-tjeneren</strong> kjører på maskinen der <em>skjermen, tastaturet og musa</em>{" "}
              er. Den «tjener» maskinvaren: alle som vil tegne noe eller vite hva du trykket, må spørre
              den.
            </li>
            <li>
              <strong>X-klienten</strong> er selve programmet — nettleseren, teksteditoren, hva det nå
              er. Den ber tjeneren om å tegne, og får beskjed når du klikker.
            </li>
          </ul>
          <p className="mt-2 leading-relaxed">
            Det føles bakvendt fordi vi er vant til at «tjeneren» er den store maskinen i serverrommet.
            Her handler det om hvem som eier skjermen — og det er laptopen din. Grunnen til at delingen
            i det hele tatt finnes, er at X ble laget i 1984 for et miljø med billige terminaler og
            store delte maskiner: programmet skulle kjøre på stormaskinen, vinduet vises på terminalen
            foran deg.
          </p>
          <p className="mt-2 leading-relaxed">
            Fordi de to alltid snakker over en protokoll, spiller det ingen rolle om de er på samme
            maskin. Adressen til X-tjeneren står i miljøvariabelen{" "}
            <code className="font-mono">DISPLAY</code>: <code className="font-mono">:0</code> betyr
            skjerm 0 på denne maskinen. Er den tom, finnes ingen skjerm, og grafiske programmer nekter å
            starte med <code className="font-mono">Can&apos;t open display</code>.
          </p>
        </section>

        {/* ============ 2 · X VISUELT ===================================== */}
        <section id="x-viz" className="mt-10">
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-full bg-brand/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-brand">
              Oppgavetype 2
            </span>
            <span className="text-xs text-muted-foreground">guidet simulering</span>
          </div>
          <h3 className="mb-3 text-xl font-semibold">De tre scenariene</h3>
          <p className="mb-4 leading-relaxed">
            Samme modell, tre situasjoner. Klikk gjennom dem og se hvor X-tjeneren står (alltid til
            venstre, hos deg), hvor programmet kjører, og hva{" "}
            <code className="font-mono">DISPLAY</code> peker på.
          </p>
          <XKlientTjener />
          <p className="mt-3 leading-relaxed">
            <code className="font-mono">ssh -X</code> ber om <strong>X-videresending</strong>: SSH
            åpner en tunnel og setter <code className="font-mono">DISPLAY</code> på fjernmaskinen til{" "}
            <code className="font-mono">localhost:10.0</code>. Programmet tror det snakker med en lokal
            X-tjener; i virkeligheten går trafikken kryptert gjennom SSH-forbindelsen og kommer ut hos
            deg. Beregningen skjer på tjeneren, tegningen på din skjerm. (
            <code className="font-mono">-Y</code> er en mindre streng variant som noen ganger trengs
            for eldre programmer, men den slår av beskyttelser og bør ikke være førstevalget.)
          </p>
        </section>

        {/* ============ WAYLAND =========================================== */}
        <section id="wayland" className="mt-12">
          <h2 className="mb-3 text-2xl font-semibold">Wayland: avløseren</h2>
          <p className="leading-relaxed">
            X er fra 1984 og bærer med seg antakelser fra den gang. Den viktigste: enhver klient kan
            lese hva alle andre vinduer viser og fange alle tastetrykk, uten spesielle rettigheter. Det
            var praktisk da alle på maskinen kjente hverandre. I dag betyr det at en tastelogger ikke
            trenger å bryte seg inn i noe som helst — den er bare enda en X-klient.
          </p>
          <p className="mt-2 leading-relaxed">
            <strong>Wayland</strong> er det moderne alternativet, og standard på Ubuntu og Fedora i
            dag. Hovedendringen er isolasjon: hver klient ser bare sitt eget vindu. Arkitekturen er
            også enklere — der X hadde en tjener <em>og</em> en egen vindusbehandler som forhandlet med
            hverandre, er de slått sammen til én <em>compositor</em>.
          </p>
          <p className="mt-2 leading-relaxed">
            Prisen er nettverkstransparensen. X kunne sende vinduer over nettet fordi det uansett var en
            protokoll mellom to prosesser; Wayland er bygget for lokal bruk. Derfor virker ikke{" "}
            <code className="font-mono">ssh -X</code> mot rene Wayland-programmer. Omveiene er{" "}
            <strong>XWayland</strong> (et kompatibilitetslag som kjører X-klienter oppå Wayland — det er
            derfor de fleste eldre programmer fortsatt virker) og verktøy som{" "}
            <code className="font-mono">waypipe</code>.
          </p>
          <div className="mt-3 rounded-lg border border-amber-500/40 bg-amber-500/5 p-4 text-sm leading-relaxed">
            <span className="font-medium">Praktisk konsekvens for deg:</span> logger du inn på en
            tjener med <code className="font-mono">ssh -X</code>, virker det som regel fint — tjenere
            kjører sjelden Wayland, og din side håndteres av XWayland. Får du likevel «Can&apos;t open
            display» med riktig oppsett, er Wayland en av de tingene å mistenke.
          </div>
        </section>

        {/* ============ SSH =============================================== */}
        <section id="ssh" className="mt-12">
          <h2 className="mb-3 flex items-center gap-2 text-2xl font-semibold">
            <Lock className="h-5 w-5 text-brand" /> SSH: nøkler i stedet for passord
          </h2>
          <p className="leading-relaxed">
            <strong>SSH</strong> står for <strong>Secure Shell</strong>. Den gir deg et skall på en
            annen maskin, over en kryptert forbindelse. Forgjengeren <code className="font-mono">telnet</code>{" "}
            sendte alt i klartekst, passordet inkludert — det er hele grunnen til at SSH finnes.
          </p>
          <p className="mt-2 leading-relaxed">
            Du kan logge inn med passord, men den riktige måten er med et{" "}
            <strong>nøkkelpar</strong>, og forskjellen er verdt å forstå ordentlig:
          </p>
          <ul className="mt-2 space-y-2 pl-5 leading-relaxed [&>li]:list-disc">
            <li>
              <code className="font-mono">ssh-keygen -t ed25519</code> lager to filer. Den{" "}
              <strong>private</strong> (<code className="font-mono">~/.ssh/id_ed25519</code>) forlater
              aldri maskinen din. Den <strong>offentlige</strong> (
              <code className="font-mono">.pub</code>) kan deles helt fritt.
            </li>
            <li>
              <code className="font-mono">ssh-copy-id bruker@vert</code> legger den offentlige nøkkelen
              på én linje i <code className="font-mono">~/.ssh/authorized_keys</code> på tjeneren. Det
              er alt som skjer — du kunne gjort det med en teksteditor.
            </li>
            <li>
              Ved innlogging sender tjeneren en tilfeldig utfordring. Du signerer den med den private
              nøkkelen, tjeneren sjekker signaturen med den offentlige. Hemmeligheten sendes{" "}
              <em>aldri</em>.
            </li>
          </ul>
          <p className="mt-2 leading-relaxed">
            Det er derfor nøkler er tryggere enn passord: en tjener som blir kompromittert har aldri
            sett noe den kan gjenbruke, mens et passord du bruker flere steder er verdifullt for den
            som stjeler det.
          </p>
          <p className="mt-2 leading-relaxed">
            Beskytt den private nøkkelen med en <strong>passfrase</strong>. For å slippe å skrive den
            hver gang, bruk <code className="font-mono">ssh-agent</code>: den låser opp nøkkelen én gang
            og holder den opplåste kopien i minnet for økta, mens fila på disk forblir kryptert. Du får
            altså bedre sikkerhet <em>og</em> mindre skriving — det er sjelden.
          </p>
        </section>

        {/* ============ 2+3 SSH-OPPGAVER ================================== */}
        <section id="ssh-sim" className="mt-10">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-brand/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-brand">
              Oppgavetype 2 + 3
            </span>
            <span className="text-xs text-muted-foreground">
              guidet gjennomgang, så måloppgaver med tilstandssjekk
            </span>
          </div>
          <h3 className="mb-3 text-xl font-semibold">To maskiner, én nøkkelhalvdel hver</h3>
          <p className="mb-4 leading-relaxed">
            Panelet under viser begge maskinene samtidig, og hvilken du står på. Det er nettopp de to
            forvirringene som gjentar seg i alle SSH-problemer: <em>hvilken maskin er jeg på</em>, og{" "}
            <em>hvilken halvdel av nøkkelparet ligger hvor</em>. Start med den guidede gjennomgangen.
          </p>
          <SshOppgaver />
        </section>

        {/* ============ CONFIG OG FILOVERFØRING =========================== */}
        <section id="ssh-mer" className="mt-12">
          <h2 className="mb-3 text-2xl font-semibold">Config-fila og filoverføring</h2>
          <p className="leading-relaxed">
            <code className="font-mono">~/.ssh/config</code> er ren tekst med én blokk per maskin. Alt
            du ellers ville skrevet på kommandolinja kan stå der:
          </p>
          <pre className="mt-2 overflow-x-auto rounded-lg border bg-muted/40 px-3 py-2 font-mono text-xs">
            {`Host uit
    HostName login.uit.no
    User student
    IdentityFile ~/.ssh/id_ed25519
    ForwardX11 yes`}
          </pre>
          <p className="mt-2 leading-relaxed">
            Etterpå holder <code className="font-mono">ssh uit</code>. Og siden{" "}
            <code className="font-mono">scp</code>, <code className="font-mono">sftp</code> og{" "}
            <code className="font-mono">rsync</code> leser den samme fila, virker aliaset i alle
            sammen.
          </p>
          <p className="mt-2 leading-relaxed">
            De tre overføringsverktøyene bruker alle SSH som transport, så nøklene du nettopp satte opp
            gjelder automatisk:
          </p>
          <ul className="mt-2 space-y-1.5 pl-5 leading-relaxed [&>li]:list-disc">
            <li>
              <code className="font-mono">scp</code> (<strong>Secure Copy</strong>) kopierer og er
              ferdig: <code className="font-mono">scp rapport.pdf uit:~/</code>. Kolonet skiller vert
              fra sti.
            </li>
            <li>
              <code className="font-mono">sftp</code> (<strong>SSH File Transfer Protocol</strong>) gir
              en interaktiv økt der du blar med <code className="font-mono">ls</code> og{" "}
              <code className="font-mono">cd</code>, og flytter med{" "}
              <code className="font-mono">get</code> og <code className="font-mono">put</code>.
            </li>
            <li>
              <code className="font-mono">rsync</code> sender bare det som er endret og kan gjenopptas.
              Det du vil ha for store kataloger.
            </li>
          </ul>
          <div className="mt-3 rounded-lg border border-amber-500/40 bg-amber-500/5 p-4 text-sm leading-relaxed">
            <span className="font-medium">Rettighetene fra modul 5 dukker opp igjen her.</span> SSH
            nekter å bruke en privat nøkkel andre kan lese. Riktig oppsett er{" "}
            <code className="font-mono">700</code> på <code className="font-mono">~/.ssh</code>,{" "}
            <code className="font-mono">600</code> på private nøkler og{" "}
            <code className="font-mono">config</code>, og <code className="font-mono">644</code> på
            offentlige nøkler. Dette er ett av få steder i Linux der for åpne rettigheter gir en hard
            avvisning i stedet for en advarsel — og <code className="font-mono">ssh -v</code> sier
            alltid rett ut hva som er galt.
          </div>
        </section>

        {/* ============ 4. FEILSØKING ===================================== */}
        <section id="feilsok" className="mt-12">
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-full bg-rose-500/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-rose-500">
              Oppgavetype 4
            </span>
            <span className="text-xs text-muted-foreground">sist i modulen</span>
          </div>
          <h2 className="mb-3 flex items-center gap-2 text-2xl font-semibold">
            <Bug className="h-5 w-5 text-rose-500" /> Noe gikk galt — hvor?
          </h2>
          <p className="mb-4 leading-relaxed">
            Fem situasjoner der feilen kan bo i hvilket som helst lag: i hvilken modus editoren var i,
            i hvilken halvdel av nøkkelparet som ble kopiert, i at DISPLAY var tom, i hvilken maskin du
            faktisk sto på, eller i rettighetene på en fil. Still diagnosen før du får rettelsen.
          </p>
          <FeilsokingPanel tasks={MODUL6_TROUBLE_TASKS} />
        </section>

        {/* ============ 5. RECALL ========================================= */}
        <section id="recall" className="mt-12">
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-full bg-brand/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-brand">
              Oppgavetype 5
            </span>
            <span className="text-xs text-muted-foreground">løpende, på tvers</span>
          </div>
          <h2 className="mb-3 flex items-center gap-2 text-2xl font-semibold">
            <Brain className="h-5 w-5 text-brand" /> Det som må sitte i hodet
          </h2>
          <p className="mb-4 leading-relaxed">
            Kommandoene kan du slå opp — modul 2 handlet nettopp om hvordan. Det du{" "}
            <em>ikke</em> kan slå opp under press, er modusmodellen i vi, retningen på klient og tjener
            i X, og hvilken halvdel av nøkkelparet som skal hvor. Det er dét kortene dekker.
          </p>
          <RecallPanel cards={DIVERSE_RECALL_CARDS} tags={DIVERSE_CARD_TAGS} store={diverseFsrs} />
        </section>

        {/* ============ GO DEEP =========================================== */}
        <section id="dypere" className="mt-12">
          <div className="rounded-xl border border-dashed border-brand/40 bg-brand/5 p-5">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand">
              <Telescope className="h-3.5 w-3.5" /> Dypere enn pensum
            </div>
            <p className="text-sm leading-relaxed">
              Ingenting under trengs til eksamen. Det står her fordi hvert punkt sparer deg en time en
              gang du sitter fast.
            </p>
            <ul className="mt-3 space-y-2 pl-5 text-sm leading-relaxed [&>li]:list-disc">
              <li>
                <strong>Hvorfor h j k l?</strong> Terminalen Bill Joy brukte da han skrev vi, ADM-3A,
                hadde piltastene trykket på nettopp de tastene — og ingen egne piltaster. Valget har
                overlevd i femti år fordi hånden slipper å flytte seg.
              </li>
              <li>
                <strong>SSH-tunneler utover X.</strong> <code className="font-mono">-L</code> lager en
                lokal port som kommer ut på fjernsiden (nyttig for en database bak brannmur),{" "}
                <code className="font-mono">-R</code> gjør det motsatte, og{" "}
                <code className="font-mono">-D</code> lager en SOCKS-proxy. X-videresending er bare det
                mest synlige tilfellet av det samme.
              </li>
              <li>
                <strong>known_hosts og vertsnøkler.</strong> Første gang du kobler til, spør SSH om du
                stoler på tjenerens fingeravtrykk, og lagrer det i{" "}
                <code className="font-mono">~/.ssh/known_hosts</code>. Endrer det seg senere, får du en
                stor advarsel — det er beskyttelsen mot at noen setter seg i midten av forbindelsen.
              </li>
              <li>
                <strong>vim-grammatikken.</strong> Kommandoene er ikke enkeltord, men{" "}
                <em>operator + bevegelse</em>: <code className="font-mono">d$</code> sletter til
                linjeslutt, <code className="font-mono">ci&quot;</code> endrer alt inne i anførselstegn.
                Har du forstått mønsteret, kan du kombinasjoner du aldri har lært.
              </li>
              <li>
                <strong>Wayland-protokollen i praksis.</strong>{" "}
                <code className="font-mono">echo $XDG_SESSION_TYPE</code> svarer{" "}
                <code className="font-mono">x11</code> eller <code className="font-mono">wayland</code>{" "}
                og forteller deg hvilken verden du faktisk sitter i.
              </li>
            </ul>
          </div>
        </section>

        {/* ============ NESTE ============================================= */}
        <div className="mt-10 rounded-xl border border-brand/30 bg-brand/5 p-5">
          <h3 className="mb-2 text-lg font-semibold">Anbefalt neste</h3>
          <p className="mb-3 text-sm leading-relaxed">
            Modul 6 er den siste i emnet. Med den er alle Canvas-modulene dekket — bruk modulsiden til
            å se hvor du står før eksamen 2. desember.
          </p>
          <div className="flex flex-wrap gap-2 text-sm">
            <Link
              to="/stack/$slug"
              params={{ slug: "dte2505-moduler" }}
              className="rounded-md border bg-card px-3 py-1.5 hover:bg-accent"
            >
              Alle modulene i DTE-2505 →
            </Link>
            <Link
              to="/stack/$slug"
              params={{ slug: "brukere-rettigheter" }}
              className="rounded-md border bg-card px-3 py-1.5 hover:bg-accent"
            >
              Rettigheter (modul 5) →
            </Link>
            <Link
              to="/stack/$slug"
              params={{ slug: "dte2505-bash-scripts" }}
              className="rounded-md border bg-card px-3 py-1.5 hover:bg-accent"
            >
              Bash-skript →
            </Link>
          </div>
        </div>
      </article>
    </StackPageShell>
  );
}
