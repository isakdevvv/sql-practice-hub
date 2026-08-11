import { Link } from "@tanstack/react-router";
import {
  Brain,
  Bug,
  HelpCircle,
  Info,
  Layers,
  MapPin,
  Package,
  Share2,
  Target,
  Telescope,
} from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { STAKK } from "@/lib/dte2507/skjelettEngine";
import { AnslaForst } from "./AnslaForst";
import { Innkapslingssim } from "./Innkapslingssim";
import { AdresseSporing } from "./AdresseSporing";
import { SvitsjingSim } from "./SvitsjingSim";
import { PakkeByggeren } from "./PakkeByggeren";
import { Feilsoking } from "./Feilsoking";
import { SkjelettKort } from "./SkjelettKort";

// ---------------------------------------------------------------------------
// DTE-2507 · Lag 0 — «Konseptuelt skjelett».
//
// Første lag i den faglige rammen (`/stack/dte2507-lag`), og bygget etter
// oppgave-arkitekturen i PLAN-HOST26-MODULER.md §3. Rekkefølgen på seksjonene
// ER arkitekturen:
//
//   1. Anslå-så-sjekk    — før forklaringen, for å lage et hull hjernen fyller
//   2. Guidet simulering — under forklaringen, null prestasjonskrav (tre stk.)
//   3. Måloppgave        — etter forklaringen, med tilstandssjekk (§3.1)
//   4. Feilsøking        — sist, fordi feilen kan bo i hvilket som helst lag
//   5. Recall-kort       — kun det som MÅ sitte i hodet, planlagt med FSRS
// ---------------------------------------------------------------------------

const STEPS = [
  { title: "Hvorfor dette laget", anchor: "hvorfor" },
  { title: "1 · Anslå først", anchor: "ansla" },
  { title: "Protokoll og lagdeling", anchor: "protokoll" },
  { title: "De fem lagene", anchor: "lagene" },
  { title: "2 · Innkapsling", anchor: "innkapsling" },
  { title: "Adressene per lag", anchor: "adresser" },
  { title: "2 · Tre hopp", anchor: "sporing" },
  { title: "Pakker eller kretser", anchor: "svitsjing" },
  { title: "2 · Del lenken", anchor: "svitsjesim" },
  { title: "3 · Måloppgaver", anchor: "mal" },
  { title: "4 · Feilsøking", anchor: "feilsok" },
  { title: "5 · Recall-kort", anchor: "recall" },
  { title: "Dypere enn pensum", anchor: "dypere" },
];

export function SkjelettPage() {
  return (
    <StackPageShell title="Protokollstakken, innkapsling og adresser" group="eksamen">
      <article className="container mx-auto max-w-3xl px-4 py-10">
        <header className="mb-8">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand">
            DTE-2507 · Lag 0 — konseptuelt skjelett
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Protokollstakken, innkapsling og adressene på hvert lag
          </h1>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            Dette er laget alt annet i faget står på. Ikke fordi det er vanskelig, men fordi hvert
            eneste senere tema — ruting, TCP-håndtrykk, brannmurregler, TLS — forutsetter at du
            allerede vet hvilket lag du befinner deg på, hvilken dataenhet du snakker om, og
            hvilken adresse som gjelder der. De aller fleste som synes datakommunikasjon er rotete,
            mangler nettopp dette skjelettet å henge detaljene på.
          </p>
          <div className="mt-4 flex items-start gap-3 rounded-lg border border-brand/40 bg-brand/5 p-4">
            <Target className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
            <div className="text-sm leading-relaxed">
              <span className="font-medium">Sjekkpunktet.</span> Laget er ikke ferdig når du har
              lest det. Det er ferdig når du kan tegne de fem lagene med dataenhet og adresse fra
              hukommelsen, regne ut hvor mye av en ramme som er dine egne data, og si hvilken
              adresse som endrer seg for hvert hopp — uten å slå opp.
            </div>
          </div>
          <div className="mt-3 flex items-start gap-3 rounded-lg border border-sky-500/40 bg-sky-500/5 p-4">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400" />
            <div className="text-sm leading-relaxed">
              Plasseringen i faget følger pensumlogikken i Kurose &amp; Ross, ikke emnets egen
              modulrekkefølge — Canvas for DTE-2507 er ikke gjennomgått ennå.{" "}
              <Link to="/stack/$slug" params={{ slug: "dte2507-lag" }} className="text-brand hover:underline">
                Se hele lag-rammen
              </Link>
              .
            </div>
          </div>
        </header>

        <CourseOutline courseId="dte2507-skjelett" steps={STEPS} />

        {/* ================================================================ */}
        <section id="hvorfor" className="mt-10">
          <h2 className="mb-3 flex items-center gap-2 text-2xl font-semibold">
            <Telescope className="h-5 w-5 text-brand" /> Hvorfor dette laget
          </h2>
          <p className="leading-relaxed">
            Å sende data over et nett er et absurd sammensatt problem. Signalet må bli til noe
            fysisk som kan reise gjennom kobber, glass eller luft. Det må komme fram til riktig
            maskin, som kan ligge på et helt annet kontinent, via utstyr ingen av partene eier. Det
            må komme fram til riktig program på den maskinen. Det som ble borte på veien må sendes
            på nytt. Og alt dette må virke selv om de to sidene bruker helt forskjellig maskinvare
            og operativsystem.
          </p>
          <p className="mt-2 leading-relaxed">
            Ingen kunne løst alt dette i én omgang. Løsningen var å dele det i lag, der hvert lag
            gjør én ting og bare snakker med naboene sine: det lover noe til laget over, og bruker
            det laget under lover. Da kan du bytte WiFi mot fiber uten å røre en linje TCP-kode, og
            bytte HTTP/1.1 mot HTTP/2 uten at IP merker noe.
          </p>
        </section>

        {/* ============ 1. ANSLÅ-SÅ-SJEKK ================================= */}
        <section id="ansla" className="mt-12">
          <TypeMerke nummer={1} tekst="før forklaringen" />
          <h2 className="mb-3 flex items-center gap-2 text-2xl font-semibold">
            <HelpCircle className="h-5 w-5 text-brand" /> Anslå først, sjekk etterpå
          </h2>
          <p className="mb-4 leading-relaxed">
            Ta disse <em>før</em> du leser videre. Du skal ikke kunne svarene ennå — det er hele
            poenget. En gjetning du har brukt ti sekunder på lager et hull som forklaringen etterpå
            fester seg i, mens en forklaring på et spørsmål du aldri stilte glir rett gjennom.
          </p>
          <AnslaForst />
        </section>

        {/* ============ PROTOKOLL ========================================= */}
        <section id="protokoll" className="mt-12">
          <h2 className="mb-3 text-2xl font-semibold">Hva en protokoll faktisk er</h2>
          <p className="leading-relaxed">
            En <strong>protokoll</strong> er en avtale om tre ting: hvilket format meldingene har,
            i hvilken rekkefølge de skal sendes, og hva som skal skje ved hver melding. Alle tre
            delene må være avtalt på forhånd. Uten avtalen er en bitstrøm bare støy — det finnes
            ingen måte å se på bitene hva de betyr.
          </p>
          <p className="mt-2 leading-relaxed">
            Legg merke til at «rekkefølgen» er en like reell del av avtalen som formatet. Når du
            senere møter TCPs trestegs håndtrykk, er det nettopp en rekkefølgeregel: den som
            svarer, svarer på en bestemt melding, og ingen data sendes før begge har bekreftet.
            Bryter en av partene rekkefølgen, er protokollen brutt selv om hver enkelt melding er
            perfekt formatert.
          </p>
          <p className="mt-2 leading-relaxed">
            <strong>Lagdeling</strong> er å stable slike avtaler oppå hverandre. Hvert lag har sin
            egen protokoll, og behandler alt det får fra laget over som ugjennomsiktig nyttelast
            det ikke skal tolke. Det er nøyaktig som en konvolutt: posten leser adressen utenpå og
            bryr seg ikke om hva som står i brevet.
          </p>
        </section>

        {/* ============ DE FEM LAGENE ===================================== */}
        <section id="lagene" className="mt-12">
          <h2 className="mb-3 flex items-center gap-2 text-2xl font-semibold">
            <Layers className="h-5 w-5 text-brand" /> De fem lagene
          </h2>
          <p className="leading-relaxed">
            Modellen vi bruker heter TCP/IP-modellen, etter de to protokollene som bærer nesten alt
            på internett. Den har fem lag. Her er hele skjelettet i én tabell — resten av siden
            fyller ut cellene.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[38rem] border-collapse text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="py-2 pr-3 font-medium">Nr</th>
                  <th className="py-2 pr-3 font-medium">Lag</th>
                  <th className="py-2 pr-3 font-medium">Dataenhet</th>
                  <th className="py-2 pr-3 font-medium">Adresse</th>
                  <th className="py-2 font-medium">Jobb</th>
                </tr>
              </thead>
              <tbody className="[&>tr]:border-b [&>tr]:border-border/60">
                {STAKK.map((l) => (
                  <tr key={l.id}>
                    <td className="py-2 pr-3 tabular-nums text-muted-foreground">{l.nivaa}</td>
                    <td className="py-2 pr-3 font-medium">{l.navn}</td>
                    <td className="py-2 pr-3 text-xs">{l.enhet}</td>
                    <td className="py-2 pr-3 text-xs">{l.adresse}</td>
                    <td className="py-2 text-xs text-muted-foreground">{l.jobb}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Fellesbetegnelsen for «dataenheten et lag jobber med» er PDU (Protocol Data Unit).
            Begrepet er verdt å kunne, for det er slik lærebøker og eksamensoppgaver formulerer
            seg: «hva er PDU-en på transportlaget?» betyr «hva heter enheten der?».
          </p>
          <div className="mt-4 rounded-lg border bg-muted/30 p-4 text-sm leading-relaxed">
            <span className="font-medium">Om det andre tallet du kommer til å høre.</span> Mange
            snakker om «lag 7» og «lag 3». Da bruker de OSI-modellen (Open Systems Interconnection),
            som har sju lag i stedet for fem. Forskjellen er ikke funksjonell: OSI splitter det
            TCP/IP kaller applikasjonslaget i tre — applikasjon, presentasjon og sesjon. Nettet du
            bruker er bygget på TCP/IP; OSI er ordboka fagfeltet snakker i. Du trenger begge, og
            oversettingen er enkel når du først vet at det er samme funksjoner, ulikt gruppert.
          </div>
        </section>

        {/* ============ 2. INNKAPSLING ==================================== */}
        <section id="innkapsling" className="mt-12">
          <TypeMerke nummer={2} tekst="guidet simulering · lær-modus" />
          <h2 className="mb-3 flex items-center gap-2 text-2xl font-semibold">
            <Package className="h-5 w-5 text-brand" /> Innkapsling — se pakken vokse
          </h2>
          <p className="mb-4 leading-relaxed">
            Her kan ingenting gå galt. Trykk deg nedover gjennom lagene og se hva hvert av dem
            legger på. Legg spesielt merke til at Ethernet er det eneste laget som legger på noe{" "}
            <em>bak</em> dataene også, og til hva som skjer med den siste linja når du drar
            datamengden helt ned mot 1 byte.
          </p>
          <Innkapslingssim />
          <div className="mt-4 rounded-lg border bg-muted/30 p-4 text-sm leading-relaxed">
            <span className="font-medium">Regelen du trenger videre.</span> MTU (Maximum
            Transmission Unit) er den største <em>nyttelasten</em> lenkelaget vil bære — for
            Ethernet 1500 byte. Både IP-headeren og transport-headeren må få plass innenfor den
            grensen. Det som er igjen til dine data heter MSS (Maximum Segment Size), og for TCP
            over IPv4 er det 1500 − 20 − 20 = 1460 byte. Nesten alle regnefeil på dette temaet er
            den samme feilen: å dele filstørrelsen på 1500 i stedet for på 1460.
          </div>
        </section>

        {/* ============ ADRESSER ========================================== */}
        <section id="adresser" className="mt-12">
          <h2 className="mb-3 text-2xl font-semibold">Én adresse per lag — og hvorfor</h2>
          <p className="leading-relaxed">
            Nybegynnere spør ofte hvorfor en pakke trenger både en IP-adresse og en MAC-adresse når
            den bare skal ett sted. Svaret er at de to svarer på helt forskjellige spørsmål.
          </p>
          <ul className="mt-2 space-y-1.5 pl-5 leading-relaxed [&>li]:list-disc">
            <li>
              <strong>IP-adressen (Internet Protocol)</strong> sier hvor pakken skal{" "}
              <em>til slutt</em>. Den gjelder hele veien, gjennom alle nettene imellom.
            </li>
            <li>
              <strong>MAC-adressen (Media Access Control)</strong> sier hvem som skal ha rammen{" "}
              <em>på denne ene lenken</em>. Den har ingen mening ett hopp lenger fram.
            </li>
            <li>
              <strong>Portnummeret</strong> sier hvilket <em>program</em> på maskinen som skal ha
              dataene. Uten det ville operativsystemet visst at noe kom, men ikke til hvem.
            </li>
          </ul>
          <p className="mt-2 leading-relaxed">
            Sammenligningen som fester det: IP er reisemålet på billetten, MAC er neste kryss i
            veibeskrivelsen, og porten er romnummeret når du endelig er framme.
          </p>
        </section>

        {/* ============ 2. SPORING ======================================== */}
        <section id="sporing" className="mt-10">
          <TypeMerke nummer={2} tekst="guidet simulering · lær-modus" />
          <h3 className="mb-3 flex items-center gap-2 text-xl font-semibold">
            <MapPin className="h-5 w-5 text-brand" /> Følg samme pakke gjennom tre hopp
          </h3>
          <p className="mb-4 leading-relaxed">
            Klikk deg gjennom hoppene. Feltene som endret seg siden forrige hopp blir markert. Det
            er ett mønster å se etter, og det er hele poenget med laget.
          </p>
          <AdresseSporing />
        </section>

        {/* ============ SVITSJING ========================================= */}
        <section id="svitsjing" className="mt-12">
          <h2 className="mb-3 text-2xl font-semibold">Pakker eller reserverte kretser</h2>
          <p className="leading-relaxed">
            Det finnes to måter å dele en kommunikasjonslinje mellom mange brukere.{" "}
            <strong>Krets-svitsjing</strong> er den gamle telefonmåten: før samtalen starter
            reserveres en fast andel av linja, og den er din til du legger på — enten du snakker
            eller tier. Du får garantert kapasitet, og til gjengjeld står reservasjonen din tom
            hver gang du er stille.
          </p>
          <p className="mt-2 leading-relaxed">
            <strong>Pakke-svitsjing</strong> reserverer ingenting. Data deles i pakker som sendes
            når de er klare, og lenken deles etter hvem som faktisk sender akkurat nå. Det kalles{" "}
            <em>statistisk multipleksing</em>: man utnytter at brukere sjelden er aktive samtidig.
            Prisen er at ingen får noen garanti — blir mange aktive på én gang, oppstår kø, og blir
            køen full, forsvinner pakker.
          </p>
          <p className="mt-2 leading-relaxed">
            Internett valgte pakke-svitsjing. Simulatoren under viser hvorfor det valget ikke var
            nært.
          </p>
        </section>

        {/* ============ 2. SVITSJE-SIM ==================================== */}
        <section id="svitsjesim" className="mt-10">
          <TypeMerke nummer={2} tekst="guidet simulering · lær-modus" />
          <h3 className="mb-3 flex items-center gap-2 text-xl font-semibold">
            <Share2 className="h-5 w-5 text-brand" /> Del lenken mellom brukerne
          </h3>
          <SvitsjingSim />
        </section>

        {/* ============ 3. MÅLOPPGAVER ==================================== */}
        <section id="mal" className="mt-12">
          <TypeMerke nummer={3} tekst="måloppgave med tilstandssjekk" />
          <h2 className="mb-3 flex items-center gap-2 text-2xl font-semibold">
            <Target className="h-5 w-5 text-brand" /> Oppnå målet
          </h2>
          <p className="mb-4 leading-relaxed">
            Disse oppgavene sjekker ikke om du skrev en bestemt tekst. De leser{" "}
            <em>tilstanden du bygget</em> — hvilken transport, hvilken port, hvilke adresser — og
            spør om den løser oppgaven. Derfor kan tilbakemeldingen si nøyaktig hvilket felt som
            var galt når du var nesten framme, i stedet for bare «feil».
          </p>
          <PakkeByggeren />
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
            <Bug className="h-5 w-5 text-rose-500" /> Noe virker ikke — hvilket lag?
          </h2>
          <p className="mb-4 leading-relaxed">
            Nå kan feilen bo hvor som helst, og det er hele poenget: symptomet peker nesten aldri
            på laget feilen faktisk bor i. Du får observasjonene fra kommandolinja, og skal stille
            diagnosen før du får rettelsen. Hvert alternativ er merket med hvilket lag det ville
            plassert feilen i.
          </p>
          <Feilsoking />
        </section>

        {/* ============ 5. RECALL ========================================= */}
        <section id="recall" className="mt-12">
          <TypeMerke nummer={5} tekst="løpende, på tvers" />
          <h2 className="mb-3 flex items-center gap-2 text-2xl font-semibold">
            <Brain className="h-5 w-5 text-brand" /> Det som må sitte i hodet
          </h2>
          <p className="mb-4 leading-relaxed">
            Kortene dekker bare det du ikke rekker å regne ut på en eksamen: lagrekkefølgen,
            dataenheten og adressen per lag, og headerstørrelsene. Alt annet i modulen er ting du
            skal <em>utlede</em>, og det ville vært bortkastet å pugge.
          </p>
          <SkjelettKort />
        </section>

        {/* ============ GO DEEP =========================================== */}
        <section id="dypere" className="mt-12">
          <div className="rounded-xl border border-dashed border-brand/40 bg-brand/5 p-5">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand">
              <Telescope className="h-3.5 w-3.5" /> Dypere enn pensum
            </div>
            <p className="text-sm leading-relaxed">
              Ingenting under trengs til eksamen. Det står her fordi det gjør resten mindre magisk.
            </p>
            <ul className="mt-3 space-y-2 pl-5 text-sm leading-relaxed [&>li]:list-disc">
              <li>
                <strong>Minste ramme er 64 byte.</strong> Regnestykket vårt ga 59 byte for én byte
                data, men en ekte Ethernet-ramme fylles opp til 64. Grunnen er kollisjonsdeteksjon:
                rammen må vare lenge nok på kabelen til at avsenderen rekker å oppdage en kollisjon
                før hen er ferdig med å sende.
              </li>
              <li>
                <strong>Jumbo-rammer.</strong> Noen datasenternett kjører MTU 9000 i stedet for
                1500. Det gir dramatisk mindre overhead per byte, men bare hvis hvert eneste ledd i
                stien er enig — ett ledd med 1500 ødelegger det for alle.
              </li>
              <li>
                <strong>Hvorfor IPv6-headeren er større, men raskere.</strong> 40 byte mot 20, men
                den er av fast lengde og har ingen kontrollsum. Ruteren slipper dermed å regne om
                kontrollsummen for hver eneste pakke — en jobb den måtte gjøre i IPv4 hver gang TTL
                gikk ned.
              </li>
              <li>
                <strong>Lagdeling er ikke gratis.</strong> Hvert lag legger på header, kopierer
                data og gjør sitt eget oppslag. Prosjekter som QUIC slår sammen lag nettopp for å
                bli kvitt noe av denne kostnaden — det er derfor QUIC bygger transportlaget sitt
                oppå UDP i stedet for å bruke TCP.
              </li>
            </ul>
          </div>
        </section>

        {/* ============ NESTE ============================================= */}
        <div className="mt-10 rounded-xl border border-brand/30 bg-brand/5 p-5">
          <h3 className="mb-2 text-lg font-semibold">Anbefalt neste</h3>
          <p className="mb-3 text-sm leading-relaxed">
            Skjelettet står. Neste lag går nedover i stakken, til bits, rammer og adressen som
            byttes ut i hvert hopp.
          </p>
          <div className="flex flex-wrap gap-2 text-sm">
            <Link
              to="/stack/$slug"
              params={{ slug: "dte2507-lag" }}
              className="rounded-md border bg-card px-3 py-1.5 hover:bg-accent"
            >
              Hele lag-rammen →
            </Link>
            <Link
              to="/stack/$slug"
              params={{ slug: "osi-tcpip" }}
              className="rounded-md border bg-card px-3 py-1.5 hover:bg-accent"
            >
              OSI- og TCP/IP-modellen →
            </Link>
            <Link
              to="/stack/$slug"
              params={{ slug: "dte2507-delay-modell" }}
              className="rounded-md border bg-card px-3 py-1.5 hover:bg-accent"
            >
              De fire forsinkelsene →
            </Link>
            <Link
              to="/stack/$slug"
              params={{ slug: "dte2507-arp-detektiv" }}
              className="rounded-md border bg-card px-3 py-1.5 hover:bg-accent"
            >
              ARP-detektiv →
            </Link>
          </div>
        </div>
      </article>
    </StackPageShell>
  );
}

function TypeMerke({ nummer, tekst }: { nummer: number; tekst: string }) {
  return (
    <div className="mb-2 flex items-center gap-2">
      <span className="rounded-full bg-brand/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-brand">
        Oppgavetype {nummer}
      </span>
      <span className="text-xs text-muted-foreground">{tekst}</span>
    </div>
  );
}
