import { Link } from "@tanstack/react-router";
import {
  Terminal,
  BookOpen,
  Search,
  Target,
  Bug,
  Brain,
  HelpCircle,
  CalendarClock,
  Telescope,
} from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { KommandoAnatomi } from "./KommandoAnatomi";
import { AnslaSjekk } from "./AnslaSjekk";
import { ManUtforsker } from "./ManUtforsker";
import { VerktoyVelger, LessTaster, SisteUtvei } from "./VerktoyVelger";
import { Hjelpekonsoll } from "./Hjelpekonsoll";
import { MalOppgaver } from "./MalOppgaver";
import { Feilsoking } from "./Feilsoking";
import { HjelpeKort } from "./HjelpeKort";

// ---------------------------------------------------------------------------
// DTE-2505 Modul 2 — «Kommandobasert, hjelpesystemer og dokumentasjon».
//
// Denne siden er også PILOTEN for oppgave-arkitekturen i
// PLAN-HOST26-MODULER.md §3. Rekkefølgen på seksjonene ER arkitekturen:
//
//   1. Anslå-så-sjekk    — før forklaringen, for å lage et hull hjernen fyller
//   2. Guidet simulering — under forklaringen, null prestasjonskrav
//   3. Måloppgave        — etter forklaringen, med tilstandssjekk (§3.1)
//   4. Feilsøking        — sist, fordi feilen kan bo i hvilket som helst lag
//   5. Recall-kort       — kun det som må sitte i hodet, planlagt med FSRS
// ---------------------------------------------------------------------------

const STEPS = [
  { title: "Hvorfor denne modulen", anchor: "hvorfor" },
  { title: "1 · Anslå først", anchor: "ansla" },
  { title: "Kommandolinjas anatomi", anchor: "anatomi" },
  { title: "Manualen og seksjonene", anchor: "man" },
  { title: "2 · Utforsk en manualside", anchor: "utforsker" },
  { title: "Inne i siden (less)", anchor: "less" },
  { title: "Søk: apropos og whatis", anchor: "sok" },
  { title: "--help, info og siste utvei", anchor: "andre" },
  { title: "Hvilket verktøy?", anchor: "velger" },
  { title: "Fri lekegrind", anchor: "konsoll" },
  { title: "3 · Måloppgaver", anchor: "mal" },
  { title: "4 · Feilsøking", anchor: "feilsok" },
  { title: "5 · Recall-kort", anchor: "recall" },
  { title: "Dypere enn pensum", anchor: "dypere" },
];

export function HjelpesystemerPage() {
  return (
    <StackPageShell title="Hjelpesystemer og dokumentasjon" group="eksamen">
      <article className="container mx-auto max-w-3xl px-4 py-10">
        <header className="mb-8">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand">
            DTE-2505 · Modul 2
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Kommandobasert arbeid, hjelpesystemer og dokumentasjon
          </h1>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            Ingen husker flaggene til <code className="font-mono">tar</code>. Det er heller ikke
            poenget. Det som skiller en som får ting gjort på Linux fra en som sitter fast, er å vite
            hvor svaret ligger og hvilket oppslagsverk som svarer på nettopp ditt spørsmål. Denne
            modulen handler om de verktøyene: manualen, søket i manualen, den raske hjelpeteksten,
            GNU sitt eget dokumentasjonssystem, og de tre kommandoene som sier hvor en kommando
            egentlig bor.
          </p>
          <div className="mt-4 flex items-start gap-3 rounded-lg border border-amber-500/40 bg-amber-500/5 p-4">
            <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <div className="text-sm">
              <span className="font-medium">Sjekkpunktet:</span> Oblig 2 har frist{" "}
              <strong>11. september 2026</strong>. Modulen er bygget bakover fra den — den er ferdig
              når du kan finne fram uten hjelp, ikke når temaet er forklart.
            </div>
          </div>
        </header>

        <CourseOutline courseId="dte2505-hjelpesystemer" steps={STEPS} />

        {/* ================================================================= */}
        <section id="hvorfor" className="mt-10">
          <h2 className="mb-3 flex items-center gap-2 text-2xl font-semibold">
            <Telescope className="h-5 w-5 text-brand" /> Hvorfor denne modulen
          </h2>
          <p className="leading-relaxed">
            Unix ble laget på en tid uten nettsøk. Løsningen var å legge hele dokumentasjonen inn i
            selve systemet, og den løsningen står fortsatt: en Linux-maskin uten nettforbindelse kan
            svare på nesten alt du lurer på om sine egne kommandoer. Det som kreves, er at du kan
            stille spørsmålet på den formen systemet forstår.
          </p>
          <p className="mt-2 leading-relaxed">
            Her er hele modulen i én tabell. Resten av siden fyller ut cellene, én av gangen.
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[34rem] border-collapse text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="py-2 pr-3 font-medium">Verktøy</th>
                  <th className="py-2 pr-3 font-medium">Fullt navn</th>
                  <th className="py-2 font-medium">Svarer på</th>
                </tr>
              </thead>
              <tbody className="[&>tr]:border-b [&>tr]:border-border/60">
                {[
                  ["man", "manual", "«Vis meg alt om denne kommandoen.»"],
                  ["apropos / man -k", "latin: «angående»", "«Hva heter kommandoen som gjør dette?»"],
                  ["whatis / man -f", "«what is»", "«Hva er dette, kort fortalt?»"],
                  ["--help / -h", "hjelpeflagg", "«Bare vis meg flaggene, raskt.»"],
                  ["info", "GNU info", "«Lær meg hele pakken, ikke bare slå opp.»"],
                  ["which", "«which one?»", "«Hvilken fil kjøres når jeg skriver dette?»"],
                  ["type", "«what type?»", "«Er dette et program, alias eller innebygd?»"],
                  ["whereis", "«where is?»", "«Hvor er programmet, kilden og manualsiden?»"],
                ].map(([a, b, c]) => (
                  <tr key={a}>
                    <td className="py-2 pr-3 font-mono text-xs">{a}</td>
                    <td className="py-2 pr-3 text-xs text-muted-foreground">{b}</td>
                    <td className="py-2">{c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
            Ta disse <em>før</em> du leser videre. Du skal ikke kunne svarene ennå — det er hele
            poenget. En gjetning du har brukt ti sekunder på lager et hull som forklaringen etterpå
            fester seg i, mens en forklaring på et spørsmål du aldri stilte glir rett gjennom.
          </p>
          <AnslaSjekk />
        </section>

        {/* ============ ANATOMI ============================================ */}
        <section id="anatomi" className="mt-12">
          <h2 className="mb-3 flex items-center gap-2 text-2xl font-semibold">
            <Terminal className="h-5 w-5 text-brand" /> Kommandolinjas anatomi
          </h2>
          <p className="leading-relaxed">
            Alt annet i modulen bruker de samme tre ordene, så vi definerer dem først. Skallet deler
            linja du skriver på mellomrom, og gir delene hver sin rolle:
          </p>
          <ul className="mt-2 space-y-1.5 pl-5 leading-relaxed [&>li]:list-disc">
            <li>
              <strong>Kommandoen</strong> er det første ordet — navnet på programmet som skal kjøres.
            </li>
            <li>
              <strong>Opsjoner</strong> (også kalt flagg) endrer <em>hvordan</em> kommandoen jobber.
              De kommer i to former: kortform med én bindestrek og én bokstav
              (<code className="font-mono">-l</code>), og langform med to bindestreker og et helt ord
              (<code className="font-mono">--all</code>). Mange flagg finnes i begge former og betyr
              da nøyaktig det samme.
            </li>
            <li>
              <strong>Argumenter</strong> sier <em>hva</em> kommandoen skal jobbe på: en fil, en
              bruker, et søkeord.
            </li>
          </ul>
          <p className="mt-2 leading-relaxed">
            Kortflagg kan slås sammen: <code className="font-mono">ls -lah</code> er nøyaktig det
            samme som <code className="font-mono">ls -l -a -h</code>. Langflagg kan ikke, fordi
            ordene ville flytt i hverandre. Prøv selv:
          </p>
          <div className="mt-4">
            <KommandoAnatomi />
          </div>
        </section>

        {/* ============ MAN OG SEKSJONENE ================================= */}
        <section id="man" className="mt-12">
          <h2 className="mb-3 flex items-center gap-2 text-2xl font-semibold">
            <BookOpen className="h-5 w-5 text-brand" /> Manualen — og hvorfor den har åtte seksjoner
          </h2>
          <p className="leading-relaxed">
            <code className="font-mono">man</code> er kort for <strong>manual</strong>. Den viser
            systemets innebygde oppslagsverk, som er delt i åtte nummererte seksjoner. Delingen er
            ikke pynt: den finnes fordi det samme <em>navnet</em> kan bety helt forskjellige ting i
            ulike deler av systemet.
          </p>
          <p className="mt-2 leading-relaxed">
            Det klassiske eksempelet er <code className="font-mono">passwd</code>. Det er navnet på
            en kommando som endrer passord (seksjon 1), og navnet på filen{" "}
            <code className="font-mono">/etc/passwd</code> med et helt eget kolonneformat (seksjon
            5). To sider, samme navn, ingen overlapp i innhold. Derfor er den ekte identiteten til en
            manualside alltid <em>navn pluss seksjon</em>, skrevet{" "}
            <code className="font-mono">passwd(1)</code> og <code className="font-mono">passwd(5)</code>.
          </p>
          <p className="mt-2 leading-relaxed">
            Skriver du bare <code className="font-mono">man passwd</code>, går man gjennom seksjonene
            i stigende rekkefølge og viser den første siden den finner. Den sier ikke ifra om at det
            fantes flere. Vil du ha en bestemt, setter du nummeret foran navnet:{" "}
            <code className="font-mono">man 5 passwd</code>.
          </p>
        </section>

        {/* ============ 2. GUIDET SIMULERING =============================== */}
        <section id="utforsker" className="mt-10">
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-full bg-brand/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-brand">
              Oppgavetype 2
            </span>
            <span className="text-xs text-muted-foreground">guidet simulering · lær-modus</span>
          </div>
          <h3 className="mb-3 text-xl font-semibold">Utforsk en manualside</h3>
          <p className="mb-4 leading-relaxed">
            Her kan ingenting gå galt. Velg et navn, bytt seksjon, og trykk på bitene av SYNOPSIS for
            å få vite hva klammer, streker og store bokstaver betyr. Legg spesielt merke til hva som
            skjer når du bytter mellom <code className="font-mono">passwd(1)</code> og{" "}
            <code className="font-mono">passwd(5)</code>.
          </p>
          <ManUtforsker />
          <div className="mt-4 rounded-lg border bg-muted/30 p-4 text-sm leading-relaxed">
            <span className="font-medium">Den faste strukturen.</span> Alle manualsider har de samme
            overskriftene i samme rekkefølge: <strong>NAME</strong> (navn og én linje om hva det er),{" "}
            <strong>SYNOPSIS</strong> (kallesyntaksen), <strong>DESCRIPTION</strong> (hva den gjør),{" "}
            <strong>OPTIONS</strong> (alle flagg), <strong>EXAMPLES</strong> (konkret bruk, hvis
            forfatteren gadd) og <strong>SEE ALSO</strong> (beslektede sider med seksjonsnummer). Det
            er nettopp fordi strukturen er fast at du kan hoppe rett til den delen du trenger — og
            det er NAME-linja, og bare den, som søkeverktøyene i neste seksjon leser.
          </div>
        </section>

        {/* ============ LESS =============================================== */}
        <section id="less" className="mt-10">
          <h3 className="mb-3 text-xl font-semibold">Inne i siden: det er less som styrer</h3>
          <p className="mb-4 leading-relaxed">
            <code className="font-mono">man</code> viser ikke siden selv. Den formaterer teksten og
            sender den videre til søkeleseren <code className="font-mono">less</code>. Det er greit å
            vite, for det betyr at tastene du lærer her virker i alt annet som bruker less også — og
            det forklarer hvorfor den vanligste nybegynnerfellen er å ikke finne veien ut. Svaret er{" "}
            <code className="font-mono">q</code>.
          </p>
          <LessTaster />
        </section>

        {/* ============ SØK =============================================== */}
        <section id="sok" className="mt-12">
          <h2 className="mb-3 flex items-center gap-2 text-2xl font-semibold">
            <Search className="h-5 w-5 text-brand" /> Når du ikke vet hva kommandoen heter
          </h2>
          <p className="leading-relaxed">
            <code className="font-mono">man</code> slår opp eksakt sidenavn. Den søker ikke og gjetter
            ikke. Det er ubrukelig i den vanligste situasjonen av alle: du vet hva du vil oppnå, men
            ikke hva verktøyet heter.
          </p>
          <p className="mt-2 leading-relaxed">
            <strong>apropos</strong> (latin for «angående») løser akkurat det. Den søker etter en
            delstreng i navn og beskrivelse for alle manualsider på maskinen, og gir deg en
            treffliste med navn, seksjon og beskrivelse.{" "}
            <code className="font-mono">man -k</code> er nøyaktig samme program — samme resultat, to
            skrivemåter.
          </p>
          <p className="mt-2 leading-relaxed">
            <strong>whatis</strong> er det motsatte: eksakt navn inn, én linje ut per seksjon navnet
            finnes i. Perfekt når du vil vite <em>hvilke</em> sider som finnes før du bestemmer deg
            for hvilken du åpner. Også denne har en tvilling: <code className="font-mono">man -f</code>.
          </p>
          <div className="mt-3 rounded-lg border border-amber-500/40 bg-amber-500/5 p-4 text-sm leading-relaxed">
            <span className="font-medium">Viktig detalj som skaper mye forvirring:</span> apropos og
            whatis leser ikke manualsidene direkte. De slår opp i en forhåndsbygget indeks over alle
            NAME-linjer. Indeksen bygges av <code className="font-mono">mandb</code>, som kjører
            periodisk. Derfor kan en helt nyinstallert side være usynlig for apropos, selv om{" "}
            <code className="font-mono">man</code> finner den umiddelbart —{" "}
            <code className="font-mono">sudo mandb</code> fikser det. Og fordi indeksen inneholder de
            engelske NAME-linjene, gir norske søkeord aldri treff.
          </div>
        </section>

        {/* ============ ANDRE KILDER ====================================== */}
        <section id="andre" className="mt-12">
          <h2 className="mb-3 text-2xl font-semibold">--help, info, og hvor du leter når alt annet er tomt</h2>
          <p className="leading-relaxed">
            <strong>--help</strong> er den raske veien: programmet skriver ut sin egen korte
            bruksanvisning rett i terminalen, uten søkeleser og uten manualdatabase. Ulempen er at det
            ikke er noen systemfunksjon — hvert enkelt program må selv velge å støtte flagget. GNU
            coreutils gjør det konsekvent; eldre verktøy som <code className="font-mono">passwd</code>{" "}
            svarer med «ukjent opsjon». Og <code className="font-mono">-h</code> er ingen garanti for
            hjelp i det hele tatt: for <code className="font-mono">ls</code> betyr den
            «human-readable», altså lesbare filstørrelser.
          </p>
          <p className="mt-2 leading-relaxed">
            <strong>info</strong> er GNU-prosjektets eget dokumentasjonssystem. Det finnes ved siden
            av manualen fordi GNU mente man-sider var for korte til å lære noe av: et info-dokument er
            en hel bok, delt i noder du navigerer mellom med Tab (neste lenke), Enter (gå inn), u
            (opp et nivå) og q (avslutt). Mange GNU-verktøy har derfor en tynn man-side som nederst
            sier at den fulle dokumentasjonen er et Texinfo-dokument.
          </p>
          <p className="mt-2 leading-relaxed">
            <strong>Skall-innebygde kommandoer</strong> har ingen egen manualside, fordi de ikke er
            egne programmer. <code className="font-mono">man cd</code> finner ingenting;{" "}
            <code className="font-mono">help cd</code> gjør. Og til slutt:{" "}
            <code className="font-mono">/usr/share/doc</code>, der pakkene legger sine egne filer.
          </p>
          <div className="mt-4">
            <SisteUtvei />
          </div>
        </section>

        {/* ============ VELGEREN ========================================== */}
        <section id="velger" className="mt-10">
          <VerktoyVelger />
        </section>

        {/* ============ KONSOLL =========================================== */}
        <section id="konsoll" className="mt-10">
          <h3 className="mb-3 text-xl font-semibold">Prøv fritt</h3>
          <p className="mb-4 leading-relaxed">
            Alt under kjører mot et lite mock-system i nettleseren — det finnes ingen ekte
            manualdatabase her. Manualsidene er forkortet, men strukturen, seksjonene og
            oppførselen til verktøyene er som på et ekte Debian- eller Ubuntu-system.
          </p>
          <Hjelpekonsoll />
        </section>

        {/* ============ 3. MÅLOPPGAVER ==================================== */}
        <section id="mal" className="mt-12">
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-full bg-brand/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-brand">
              Oppgavetype 3
            </span>
            <span className="text-xs text-muted-foreground">måloppgave med tilstandssjekk</span>
          </div>
          <h2 className="mb-3 flex items-center gap-2 text-2xl font-semibold">
            <Target className="h-5 w-5 text-brand" /> Oppnå målet
          </h2>
          <p className="mb-4 leading-relaxed">
            Disse oppgavene sjekker <em>ikke</em> om du skrev en bestemt tekststreng. Kommandoen din
            kjøres mot mock-systemet, og så spør vi om resultatet løser oppgaven. Derfor godtas{" "}
            <code className="font-mono">apropos owner</code> og{" "}
            <code className="font-mono">man -k ownership</code> like godt — og derfor kan
            tilbakemeldingen si nøyaktig hva som manglet da du var nesten framme.
          </p>
          <MalOppgaver />
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
            Nå kan feilen bo hvor som helst: i seksjonsvalget, i språket på søkeordet, i en utdatert
            indeks, i at kommandoen er innebygd i skallet, eller i at programmet rett og slett ikke
            støtter flagget du prøvde. Du får se hva som faktisk skjedde i terminalen, og skal stille
            diagnosen før du får rettelsen.
          </p>
          <Feilsoking />
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
            Kortene dekker bare det du ikke rekker å slå opp: hva de åtte seksjonene inneholder,
            hvilket verktøy som svarer på hvilket spørsmål, og notasjonen i SYNOPSIS. Alt annet i
            modulen er ting du <em>skal</em> slå opp — det er jo hele poenget med et hjelpesystem.
            Kortene planlegges med samme repetisjonsmotor som resten av appen, så de kommer tilbake
            akkurat når du er i ferd med å glemme dem.
          </p>
          <HjelpeKort />
        </section>

        {/* ============ GO DEEP =========================================== */}
        <section id="dypere" className="mt-12">
          <div className="rounded-xl border border-dashed border-brand/40 bg-brand/5 p-5">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand">
              <Telescope className="h-3.5 w-3.5" /> Dypere enn pensum
            </div>
            <p className="text-sm leading-relaxed">
              Ingenting under trengs til Oblig 2 eller eksamen. Det står her fordi det gjør resten
              mindre magisk, og fordi hvert punkt sparer deg en time en gang du sitter fast.
            </p>
            <ul className="mt-3 space-y-2 pl-5 text-sm leading-relaxed [&>li]:list-disc">
              <li>
                <strong>Manualsider er kildekode.</strong> De skrives i makrospråket{" "}
                <code className="font-mono">roff</code>, med makropakken{" "}
                <code className="font-mono">man</code> eller den nyere{" "}
                <code className="font-mono">mdoc</code>. <code className="font-mono">man -w ls</code>{" "}
                viser deg filen; den er som regel gzip-komprimert og fullt lesbar.
              </li>
              <li>
                <strong>MANPATH og MANSECT.</strong> Hvor man leter styres av miljøvariabelen{" "}
                <code className="font-mono">MANPATH</code>, og rekkefølgen på seksjonene av{" "}
                <code className="font-mono">MANSECT</code>. Installerer du programvare i{" "}
                <code className="font-mono">/opt</code> eller under din egen hjemmekatalog, må du ofte
                utvide MANPATH selv for at man skal finne dokumentasjonen.
              </li>
              <li>
                <strong>Hvorfor akkurat åtte seksjoner?</strong> Inndelingen stammer fra den første
                utgaven av <em>Unix Programmer's Manual</em> fra 1971, skrevet av Ken Thompson og
                Dennis Ritchie. Den har overlevd i over femti år og på tvers av alle Unix-varianter —
                BSD og macOS bruker de samme numrene, med små avvik i seksjon 8.
              </li>
              <li>
                <strong>tldr og cheat.</strong> Fellesskapsdrevne pakker som gir eksempeldrevne
                minisider i stedet for full dokumentasjon. Ikke installert som standard, men den
                raskeste veien til «hvordan var det nå igjen med tar».
              </li>
            </ul>
          </div>
        </section>

        {/* ============ NESTE ============================================= */}
        <div className="mt-10 rounded-xl border border-brand/30 bg-brand/5 p-5">
          <h3 className="mb-2 text-lg font-semibold">Anbefalt neste</h3>
          <p className="mb-3 text-sm leading-relaxed">
            Nå kan du finne fram i dokumentasjonen. Neste steg er å faktisk bruke kommandoene du
            finner — filsystemet, skallet og rettighetene.
          </p>
          <div className="flex flex-wrap gap-2 text-sm">
            <Link
              to="/stack/$slug"
              params={{ slug: "dte2505-filsystem" }}
              className="rounded-md border bg-card px-3 py-1.5 hover:bg-accent"
            >
              Filsystem og navigasjon →
            </Link>
            <Link
              to="/stack/$slug"
              params={{ slug: "brukere-rettigheter" }}
              className="rounded-md border bg-card px-3 py-1.5 hover:bg-accent"
            >
              Brukere og rettigheter →
            </Link>
            <Link
              to="/stack/$slug"
              params={{ slug: "dte2505-bash-scripts" }}
              className="rounded-md border bg-card px-3 py-1.5 hover:bg-accent"
            >
              Bash-skript →
            </Link>
            <Link to="/dte2505/shell-drill" className="rounded-md border bg-card px-3 py-1.5 hover:bg-accent">
              Shell-drill →
            </Link>
          </div>
        </div>
      </article>
    </StackPageShell>
  );
}
