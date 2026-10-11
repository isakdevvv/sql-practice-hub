// Emne 2 — Applikasjonslaget.
// Pensum: Canvas modul 2 «Applikasjonslaget», Kurose & Ross kap. 2.
// Bygger på emne 1: endesystem, pakke, protokoll, de fem lagene, tur-retur-tid.
// Rekkefølge: hvordan to programmer finner hverandre → HTTP → det som gjør
// HTTP raskere → DNS → e-post → video og innholdsnett → egne sokkelprogrammer.

import type { Emne } from "@/lib/kurs/types";
import {
  anslag,
  intro,
  konsept,
  kode,
  oppsummering,
  recall,
  sjekk,
  tallanslag,
  visual,
} from "../dte-2505/byggere";
import { Kodelinje, Term } from "@/components/kurs-dte2505/blokker";
import { TcpVsUdpFlow } from "@/components/stack/dte2507-socket-programmering/TcpVsUdpFlow";
import { SocketLifecycleViz } from "@/components/stack/dte2507-socket-programmering/SocketLifecycleViz";
import { RequestFlowAnimator } from "@/components/stack/http-statuskoder/RequestFlowAnimator";
import { StatusDecisionTree } from "@/components/stack/http-statuskoder/StatusDecisionTree";
import { CacheCalculator } from "@/components/stack/dte2507-web-caching-matte/CacheCalculator";
import { HolTimeline } from "@/components/stack/dte2507-http2-hol/HolTimeline";
import { DnsLookupSim } from "@/components/stack/dte2507-dns-dyp/DnsLookupSim";

export const emneApplikasjonslaget: Emne = {
  slug: "applikasjonslaget",
  tittel: "Applikasjonslaget",
  sporsmal: "Hvordan snakker programmer sammen over nettet?",
  pensum: "Canvas modul 2 — Applikasjonslaget · Kurose & Ross kap. 2",
  undertemaer: [
    /* ------------------------------------------------------------------ */
    {
      slug: "prosesser-og-sokler",
      tittel: "Programmer, porter og sokler",
      utbytte:
        "Du kan forklare hvordan en melding finner riktig program på riktig maskin, og hva applikasjonen kan be transportlaget om.",
      byggerPa: ["lag-og-innkapsling"],
      skjermer: [
        intro("ps-1-intro", "Det er programmer som snakker", {
          ingress: (
            <>
              Nettverkslaget leverer til en maskin. Men på maskinen din kjører nettleser, e-post og
              spill samtidig. Applikasjonslaget handler om hvordan ett bestemt program snakker med
              ett bestemt program et annet sted.
            </>
          ),
        }),
        konsept("ps-2-arkitektur", "To måter å organisere seg på", {
          ingress: <>Den som lager en nettapplikasjon velger først hvem som snakker med hvem.</>,
          punkter: [
            <>
              <Term>Klient-tjener</Term> — en tjener som alltid er på og har fast adresse. Klientene
              tar kontakt, og snakker aldri direkte med hverandre.
            </>,
            <>
              <Term>Likemannsnett</Term> (peer-to-peer, P2P) — maskinene snakker direkte med
              hverandre, og hver maskin både ber om og leverer.
            </>,
          ],
          merk: (
            <>Nettsider og e-post er klient-tjener. Fildeling med BitTorrent er et likemannsnett.</>
          ),
        }),
        konsept("ps-3-prosess", "Prosess og sokkel", {
          ingress: (
            <>
              Et program som kjører kalles en <Term>prosess</Term>. Prosessen sender og mottar
              gjennom en <Term>sokkel</Term>, på engelsk socket.
            </>
          ),
          punkter: [
            "Sokkelen er døra mellom programmet og transportlaget.",
            "Programmet dytter meldingen ut gjennom døra og stoler på at transportlaget tar seg av resten.",
            <>
              Prosessen som tar kontakt er <Term>klient</Term>. Den som venter på kontakt er{" "}
              <Term>tjener</Term>.
            </>,
          ],
        }),
        konsept("ps-4-port", "Adressen til et program", {
          ingress: <>For å treffe riktig prosess trengs to tall.</>,
          punkter: [
            <>
              <Term>IP-adressen</Term> peker ut maskinen.
            </>,
            <>
              <Term>Portnummeret</Term> peker ut prosessen på maskinen. Det er et tall fra 0 til 65
              535.
            </>,
            "Kjente tjenester har faste porter: nettjenere bruker 80 og 443, e-posttjenere 25, navnetjenere 53.",
          ],
          bihjelp: (
            <>IP-adressen er gateadressen til en blokk. Portnummeret er leilighetsnummeret.</>
          ),
        }),
        konsept("ps-5-tjenester", "Hva kan applikasjonen be om?", {
          ingress: <>Internett tilbyr to transportprotokoller. Applikasjonen velger én.</>,
          punkter: [
            <>
              <Term>TCP</Term> — setter opp en forbindelse først, leverer alt, i riktig rekkefølge,
              og bremser når nettet er fullt.
            </>,
            <>
              <Term>UDP</Term> — sender uten oppkobling og uten garantier. Det som kommer fram,
              kommer fram.
            </>,
            "Ingen av dem garanterer en bestemt hastighet eller forsinkelse.",
          ],
          merk: <>Detaljene kommer i emnet om transportlaget. Nå holder det å vite hva du får.</>,
        }),
        visual("ps-6-flyt", "Samme melding, to protokoller", {
          Viz: TcpVsUdpFlow,
          hint: "Sammenlign hvor mange meldinger som går før dataene dine er sendt med TCP og med UDP.",
        }),
        sjekk("ps-7-sjekk", "Hvilken protokoll?", {
          sporsmal: (
            <>
              En bankapp skal overføre et beløp. Hvert tegn må komme fram, og rekkefølgen er
              avgjørende. Hva bør den bygge på?
            </>
          ),
          valg: [
            {
              tekst: "TCP",
              riktig: true,
              hvorfor: "Pålitelig levering i rekkefølge er akkurat det TCP tilbyr.",
            },
            {
              tekst: "UDP",
              hvorfor: "Da måtte appen selv oppdage og rette tap og feil rekkefølge.",
            },
            {
              tekst: "Det spiller ingen rolle",
              hvorfor: "De to gir helt ulike garantier.",
            },
          ],
          fasit: (
            <>
              TCP. UDP velges når litt tap er greit og ventetid er verre, som i en samtale eller et
              raskt navneoppslag.
            </>
          ),
        }),
        recall("ps-8-recall", [
          {
            forside: "Hva er en sokkel?",
            bakside:
              "Grensesnittet mellom en prosess og transportlaget. Døra programmet sender og mottar gjennom.",
          },
          {
            forside: "Hvilke to tall trengs for å adressere en prosess?",
            bakside: "IP-adressen til maskinen og portnummeret til prosessen.",
          },
          {
            forside: "Hva er hovedforskjellen på TCP og UDP sett fra applikasjonen?",
            bakside:
              "TCP gir forbindelse og pålitelig levering i rekkefølge. UDP gir ingen garantier, men heller ingen oppkobling.",
          },
        ]),
        oppsummering("ps-9-opp", {
          punkter: [
            "Applikasjoner er prosesser som snakker gjennom sokler.",
            "En prosess adresseres med IP-adresse og portnummer.",
            "Applikasjonen velger mellom TCP og UDP.",
          ],
          videre: "Neste undertema: den mest brukte applikasjonsprotokollen, HTTP.",
        }),
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      slug: "http",
      tittel: "HTTP: forespørsel og svar",
      utbytte:
        "Du kan lese en HTTP-forespørsel og et svar, tolke statuskoden, og regne ut hvor mange tur-retur-tider en side koster.",
      byggerPa: ["prosesser-og-sokler", "fire-forsinkelser"],
      skjermer: [
        intro("h-1-intro", "Språket til nettet", {
          ingress: (
            <>
              En nettside er en grunnfil pluss en rekke objekter den peker på: bilder, stilark,
              skript. Nettleseren henter hvert objekt med protokollen <Term>HTTP</Term>, HyperText
              Transfer Protocol.
            </>
          ),
          punkter: [
            "Klienten sender en forespørsel.",
            "Tjeneren sender et svar.",
            "HTTP bruker TCP, vanligvis på port 80, eller 443 når forbindelsen er kryptert.",
          ],
        }),
        kode("h-2-foresporsel", "En forespørsel", {
          ingress: <>HTTP er ren tekst. Dette er alt nettleseren sender for å hente en side.</>,
          kode: `GET /studier/index.html HTTP/1.1
Host: uit.no
User-Agent: Firefox/131.0
Accept-Language: nb
Connection: keep-alive
`,
          punkter: [
            <>
              Første linje: <Term>metode</Term>, sti og versjon. <Kodelinje>GET</Kodelinje> ber om
              et objekt.
            </>,
            <>
              Resten er <Term>hodelinjer</Term>, én opplysning per linje.
            </>,
            "En tom linje markerer slutten på hodet.",
          ],
          merk: (
            <>
              Andre metoder: <Kodelinje>POST</Kodelinje> sender data inn,{" "}
              <Kodelinje>HEAD</Kodelinje> ber bare om hodet, <Kodelinje>PUT</Kodelinje> laster opp
              og <Kodelinje>DELETE</Kodelinje> sletter.
            </>
          ),
        }),
        kode("h-3-svar", "Et svar", {
          kode: `HTTP/1.1 200 OK
Date: Sun, 11 Oct 2026 10:15:00 GMT
Content-Type: text/html
Content-Length: 6821
Last-Modified: Tue, 06 Oct 2026 08:00:00 GMT

<!doctype html> ...`,
          punkter: [
            <>
              Første linje er <Term>statuslinja</Term>: versjon, statuskode og en kort tekst.
            </>,
            <>
              <Kodelinje>Content-Length</Kodelinje> sier hvor mange byte kroppen har.
            </>,
            "Etter den tomme linja kommer selve objektet.",
          ],
        }),
        konsept("h-4-koder", "Statuskodene", {
          ingress: <>Første siffer forteller hva slags svar det er.</>,
          punkter: [
            <>
              <Term>2xx</Term> — det gikk bra. 200 OK.
            </>,
            <>
              <Term>3xx</Term> — se et annet sted. 301 flyttet permanent, 304 ikke endret.
            </>,
            <>
              <Term>4xx</Term> — klienten gjorde noe galt. 400 ugyldig forespørsel, 404 finnes ikke.
            </>,
            <>
              <Term>5xx</Term> — tjeneren sviktet. 500 intern feil.
            </>,
          ],
        }),
        visual("h-5-tre", "Hvilken kode skal tjeneren svare?", {
          Viz: StatusDecisionTree,
          hint: "Følg treet for et par ulike situasjoner og se hvilken statuskode du ender på.",
        }),
        konsept("h-6-tilstandslos", "HTTP husker ingenting", {
          ingress: (
            <>
              Tjeneren behandler hver forespørsel for seg og husker ikke hvem som spurte sist. Vi
              sier at HTTP er <Term>tilstandsløs</Term>.
            </>
          ),
          punkter: [
            "Det gjør tjeneren enkel og rask.",
            "Det betyr også at innlogging og handlekurv må løses med noe ekstra.",
          ],
          merk: <>Det ekstra heter informasjonskapsler, og kommer i neste undertema.</>,
        }),
        konsept("h-7-forbindelser", "Én forbindelse per objekt, eller én for alle?", {
          ingress: (
            <>
              Å sette opp en TCP-forbindelse koster én tur-retur-tid, forkortet <Term>RTT</Term>{" "}
              (round-trip time). Å be om et objekt og få første byte tilbake koster én til.
            </>
          ),
          punkter: [
            <>
              <Term>Ikke-vedvarende</Term> forbindelse: ny TCP-forbindelse for hvert objekt. To RTT
              per objekt.
            </>,
            <>
              <Term>Vedvarende</Term> forbindelse: forbindelsen holdes åpen. To RTT for det første
              objektet, én RTT for hvert av de neste.
            </>,
          ],
          bihjelp: <>I tillegg kommer sendetiden for selve objektet. Den ser vi bort fra her.</>,
        }),
        visual("h-8-flyt", "Følg en forespørsel", {
          Viz: RequestFlowAnimator,
          hint: "Følg forespørselen fra nettleser til tjener og tilbake, og legg merke til hva som skjer i hvert steg.",
        }),
        tallanslag("h-9-regn", "Hvor mange tur-retur-tider?", {
          sporsmal: (
            <>
              En side består av en grunnfil og 10 bilder. Forbindelsen er ikke-vedvarende, og
              objektene hentes ett om gangen. Hvor mange RTT går med?
            </>
          ),
          enhet: "RTT",
          fasitTall: 22,
          fasit: (
            <>
              11 objekter ganger 2 RTT er 22 RTT. Med vedvarende forbindelse blir det 2 + 10 = 12
              RTT.
            </>
          ),
        }),
        sjekk("h-10-sjekk", "Les statuskoden", {
          sporsmal: <>Nettleseren får svaret 404. Hvem har ansvaret for feilen, ifølge koden?</>,
          valg: [
            {
              tekst: "Klienten",
              riktig: true,
              hvorfor: "4xx betyr at forespørselen pekte på noe som ikke finnes eller ikke er lov.",
            },
            { tekst: "Tjeneren", hvorfor: "Da hadde koden begynt på 5." },
            {
              tekst: "Nettet mellom dem",
              hvorfor: "Feil i nettet gir ikke noe HTTP-svar i det hele tatt.",
            },
          ],
          fasit: (
            <>4xx peker på klienten, 5xx på tjeneren. 404 betyr at stien ikke finnes på tjeneren.</>
          ),
        }),
        recall("h-11-recall", [
          {
            forside: "Hva står på første linje i en HTTP-forespørsel?",
            bakside: "Metode, sti og versjon, for eksempel GET /index.html HTTP/1.1.",
          },
          {
            forside: "Hva betyr statuskodene 2xx, 3xx, 4xx og 5xx?",
            bakside: "Vellykket, omdirigering, feil hos klienten, feil hos tjeneren.",
          },
          {
            forside: "Hvor mange RTT koster ett objekt over en ny TCP-forbindelse?",
            bakside: "To: én for å sette opp forbindelsen og én for forespørsel og svar.",
          },
          {
            forside: "Hva betyr det at HTTP er tilstandsløs?",
            bakside: "Tjeneren husker ingenting om tidligere forespørsler fra samme klient.",
          },
        ]),
        oppsummering("h-12-opp", {
          punkter: [
            "HTTP er forespørsel og svar i ren tekst over TCP.",
            "Statuskodens første siffer sier hvem som har ballen.",
            "Vedvarende forbindelser sparer én RTT per objekt.",
          ],
          videre: "Neste undertema: kapsler, mellomlager og HTTP/2.",
        }),
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      slug: "kapsler-og-mellomlager",
      tittel: "Informasjonskapsler, mellomlager og HTTP/2",
      utbytte:
        "Du kan forklare hvordan en tjener kjenner deg igjen, regne på gevinsten av et mellomlager, og si hva HTTP/2 løser.",
      byggerPa: ["http"],
      skjermer: [
        intro("km-1-intro", "Tre tillegg til HTTP", {
          ingress: (
            <>
              HTTP alene husker ingenting, henter alt på nytt og sender ett svar om gangen. Tre
              tillegg retter på hver sin svakhet.
            </>
          ),
        }),
        konsept("km-2-kapsel", "Informasjonskapsler", {
          ingress: (
            <>
              En <Term>informasjonskapsel</Term> (cookie) er et lite id-nummer tjeneren ber
              nettleseren ta vare på og sende med neste gang.
            </>
          ),
          punkter: [
            <>
              Tjeneren sender <Kodelinje>Set-Cookie: 1678</Kodelinje> i svaret.
            </>,
            "Nettleseren lagrer nummeret i en fil, knyttet til nettstedet.",
            <>
              Hver senere forespørsel til nettstedet får med <Kodelinje>Cookie: 1678</Kodelinje>.
            </>,
            "Tjeneren slår opp nummeret i sin egen database og finner handlekurven din.",
          ],
          merk: <>Tilstanden ligger altså hos tjeneren. Kapselen er bare nøkkelen til den.</>,
        }),
        konsept("km-3-lager", "Mellomlager", {
          ingress: (
            <>
              Et <Term>mellomlager</Term> (web cache, også kalt mellomtjener eller proxy) står
              mellom klientene og de egentlige tjenerne og tar vare på kopier av objekter.
            </>
          ),
          punkter: [
            "Har lageret objektet, svarer det selv.",
            "Har det ikke, henter det objektet fra opphavstjeneren, tar en kopi og svarer.",
            "Lageret er både tjener for klienten og klient for opphavstjeneren.",
          ],
        }),
        konsept("km-4-betinget", "Er kopien fersk?", {
          ingress: <>Lageret må vite om kopien er utdatert uten å laste ned alt på nytt.</>,
          punkter: [
            <>
              Det sender en <Term>betinget GET</Term> med hodelinja{" "}
              <Kodelinje>If-Modified-Since</Kodelinje> og datoen på kopien.
            </>,
            <>
              Er objektet uendret, svarer tjeneren <Kodelinje>304 Not Modified</Kodelinje> uten
              kropp.
            </>,
            "Er det endret, kommer et vanlig 200-svar med nytt innhold.",
          ],
        }),
        tallanslag("km-5-regn", "Hvor mye sparer lageret?", {
          sporsmal: (
            <>
              Et mellomlager på campus har treffrate 0,4. Uten lager går 15 megabit per sekund ut på
              lenken mot Internett. Hvor mange megabit per sekund går ut med lageret på plass?
            </>
          ),
          enhet: "Mbit/s",
          fasitTall: 9,
          fasit: (
            <>
              60 % av forespørslene må fortsatt hentes utenfra: 0,6 · 15 = 9 megabit per sekund.
              Lavere belastning på lenken betyr kortere kø for alle.
            </>
          ),
        }),
        visual("km-6-kalk", "Regn på ditt eget lager", {
          Viz: CacheCalculator,
          hint: "Endre treffraten og se hva som skjer med belastningen på lenken og den gjennomsnittlige svartiden.",
        }),
        konsept("km-7-hol", "Køen bak det store objektet", {
          ingress: (
            <>
              I HTTP/1.1 kommer svarene i samme rekkefølge som forespørslene. Et stort objekt først
              i køen holder alle de små bak seg tilbake.
            </>
          ),
          punkter: [
            <>
              Fenomenet heter <Term>køhodeblokkering</Term>, på engelsk head-of-line blocking.
            </>,
            <>
              <Term>HTTP/2</Term> deler hvert svar i små biter kalt rammer og fletter rammer fra
              flere svar på samme forbindelse.
            </>,
            "Da slipper de små objektene fram mens det store fortsatt sendes.",
          ],
        }),
        visual("km-8-tidslinje", "Se forskjellen", {
          Viz: HolTimeline,
          hint: "Sammenlign når de små objektene er ferdige med og uten fletting.",
        }),
        sjekk("km-9-sjekk", "Hvor ligger handlekurven?", {
          sporsmal: (
            <>
              Du legger en vare i handlekurven i en nettbutikk. Hvor er innholdet i kurven lagret?
            </>
          ),
          valg: [
            {
              tekst: "I kapselen i nettleseren",
              hvorfor: "Kapselen inneholder vanligvis bare et id-nummer.",
            },
            {
              tekst: "I databasen hos tjeneren, slått opp med id-en fra kapselen",
              riktig: true,
              hvorfor: "Nettleseren sender id-en, og tjeneren finner resten selv.",
            },
            {
              tekst: "I TCP-forbindelsen",
              hvorfor: "Forbindelsen kan lukkes og åpnes på nytt uten at kurven forsvinner.",
            },
          ],
          fasit: <>Hos tjeneren. Kapselen er en nøkkel, ikke et lager.</>,
        }),
        recall("km-10-recall", [
          {
            forside: "Hvordan kjenner en tjener igjen en nettleser over tilstandsløs HTTP?",
            bakside:
              "Tjeneren deler ut et id-nummer med Set-Cookie, og nettleseren sender det tilbake i Cookie-linja.",
          },
          {
            forside: "Hva er en betinget GET?",
            bakside:
              "En GET med If-Modified-Since. Tjeneren svarer 304 uten kropp hvis objektet er uendret.",
          },
          {
            forside: "Hva er køhodeblokkering i HTTP/1.1?",
            bakside:
              "Et stort svar først i køen holder tilbake alle svarene bak seg på samme forbindelse.",
          },
        ]),
        oppsummering("km-11-opp", {
          punkter: [
            "Kapsler gir tilstand oppå en tilstandsløs protokoll.",
            "Mellomlager kutter trafikk og svartid, og betinget GET holder kopiene ferske.",
            "HTTP/2 fletter svar for å unngå køhodeblokkering.",
          ],
          videre: "Neste undertema: hvordan et navn blir til en adresse.",
        }),
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      slug: "dns",
      tittel: "DNS: fra navn til adresse",
      utbytte:
        "Du kan følge et navneoppslag gjennom hierarkiet og forklare de fire vanligste posttypene.",
      byggerPa: ["prosesser-og-sokler"],
      skjermer: [
        intro("d-1-intro", "Maskiner bruker tall", {
          ingress: (
            <>
              Du skriver uit.no. Pakkene trenger en IP-adresse. Tjenesten som oversetter heter{" "}
              <Term>DNS</Term>, Domain Name System.
            </>
          ),
          punkter: [
            "Den brukes før nesten alt annet du gjør på nettet.",
            "Den er en database spredt på hundretusenvis av tjenere.",
            "Oppslagene går vanligvis over UDP til port 53.",
          ],
        }),
        anslag("d-2-anslag", "Hvorfor ikke én stor tjener?", {
          sporsmal: (
            <>Hva er det største problemet med å ha én sentral navnetjener for hele verden?</>
          ),
          valg: [
            { tekst: "Den ville blitt for dyr" },
            { tekst: "Alt stopper hvis den går ned, og den er langt unna de fleste" },
            { tekst: "Navn kan ikke lagres på ett sted" },
          ],
          fasit: (
            <>
              Én tjener er ett sårbart punkt, den ville druknet i trafikk, og den ville ligget langt
              unna nesten alle brukere. Derfor er DNS delt opp i et hierarki.
            </>
          ),
        }),
        konsept("d-3-hierarki", "Tre nivåer", {
          ingress: <>Navnet leses bakfra, og hvert ledd har sin egen type tjener.</>,
          punkter: [
            <>
              <Term>Rottjenere</Term> vet hvem som har ansvar for hvert toppnivå.
            </>,
            <>
              <Term>Toppnivåtjenere</Term> (TLD) har ansvar for endelser som .no og .com, og vet
              hvem som har ansvar for hvert domene under.
            </>,
            <>
              <Term>Autoritative tjenere</Term> eies av organisasjonen selv og har de faktiske
              adressene.
            </>,
          ],
        }),
        konsept("d-4-lokal", "Den lokale navnetjeneren", {
          ingress: (
            <>
              Maskinen din spør ikke hierarkiet selv. Den spør en <Term>lokal navnetjener</Term> hos
              internettleverandøren eller på campus, som gjør jobben for den.
            </>
          ),
          punkter: [
            <>
              <Term>Iterativt</Term> oppslag: hver tjener svarer «jeg vet ikke, men spør denne», og
              den lokale tjeneren spør videre selv.
            </>,
            <>
              <Term>Rekursivt</Term> oppslag: tjeneren som blir spurt tar på seg å finne hele
              svaret.
            </>,
          ],
          merk: <>Vanligvis er spørsmålet fra maskinen din rekursivt, og resten iterativt.</>,
        }),
        visual("d-5-sim", "Følg et oppslag", {
          Viz: DnsLookupSim,
          hint: "Gå gjennom oppslaget steg for steg og tell hvor mange tjenere som blir spurt før svaret kommer.",
        }),
        konsept("d-6-lagring", "Svarene lagres underveis", {
          ingress: <>Hadde hvert oppslag gått helt til rota, ville nettet vært merkbart tregere.</>,
          punkter: [
            "Hver navnetjener tar vare på svarene den har sett.",
            <>
              Hvert svar har en levetid, <Term>TTL</Term> (time to live), satt av eieren.
            </>,
            "Når levetiden er ute, kastes svaret og må hentes på nytt.",
          ],
          merk: <>Derfor kan det ta timer før en endret adresse er synlig for alle.</>,
        }),
        konsept("d-7-poster", "Fire posttyper", {
          ingress: (
            <>
              Databasen består av <Term>ressursposter</Term> med navn, verdi, type og levetid.
            </>
          ),
          punkter: [
            <>
              <Term>A</Term> — navn til IP-adresse.
            </>,
            <>
              <Term>NS</Term> — domene til navnet på den autoritative tjeneren.
            </>,
            <>
              <Term>CNAME</Term> — kallenavn til det egentlige navnet.
            </>,
            <>
              <Term>MX</Term> — domene til navnet på e-posttjeneren.
            </>,
          ],
        }),
        kode("d-8-dig", "Slå opp selv", {
          kode: `$ dig uit.no A

;; ANSWER SECTION:
uit.no.        3600   IN   A    129.242.4.42

$ dig uit.no MX

;; ANSWER SECTION:
uit.no.        3600   IN   MX   10 mx.uit.no.`,
          punkter: [
            "Tallet 3600 er levetiden i sekunder: svaret kan lagres i én time.",
            "MX-posten peker på et navn, ikke en adresse. Det navnet må slås opp med en A-post etterpå.",
          ],
        }),
        sjekk("d-9-sjekk", "Hvilken posttype?", {
          sporsmal: (
            <>En e-posttjener skal levere til noen@uit.no. Hvilken post spør den etter først?</>
          ),
          valg: [
            {
              tekst: "A",
              hvorfor: "A-posten for uit.no peker på nettjeneren, ikke e-posttjeneren.",
            },
            {
              tekst: "MX",
              riktig: true,
              hvorfor: "MX sier hvilken maskin som tar imot e-post for domenet.",
            },
            { tekst: "NS", hvorfor: "NS sier hvem som svarer på navnespørsmål for domenet." },
            {
              tekst: "CNAME",
              hvorfor: "CNAME er et kallenavn og har ikke noe med e-post å gjøre.",
            },
          ],
          fasit: <>MX først, og deretter A for navnet MX-posten pekte på.</>,
        }),
        recall("d-10-recall", [
          {
            forside: "Hvilke tre nivåer har DNS-hierarkiet?",
            bakside: "Rottjenere, toppnivåtjenere og autoritative tjenere.",
          },
          {
            forside: "Hva gjør posttypene A, NS, CNAME og MX?",
            bakside:
              "A: navn til adresse. NS: domene til navnetjener. CNAME: kallenavn til egentlig navn. MX: domene til e-posttjener.",
          },
          {
            forside: "Hva er TTL i DNS?",
            bakside: "Hvor lenge et svar kan ligge i et mellomlager før det må hentes på nytt.",
          },
        ]),
        oppsummering("d-11-opp", {
          punkter: [
            "DNS er en hierarkisk, spredt database.",
            "Den lokale navnetjeneren spør rot, toppnivå og autoritativ tjener etter tur.",
            "Mellomlagring med levetid gjør at de fleste oppslag aldri når rota.",
          ],
          videre: "Neste undertema: e-post, der tjenere skyver meldinger til hverandre.",
        }),
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      slug: "epost",
      tittel: "E-post: SMTP og IMAP",
      utbytte:
        "Du kan følge en e-post fra avsender til mottaker og si hvilken protokoll som brukes på hver strekning.",
      byggerPa: ["http", "dns"],
      skjermer: [
        intro("e-1-intro", "Tre roller", {
          ingress: (
            <>E-post har vært på nettet siden før nettsidene fantes. Systemet har tre deler.</>
          ),
          punkter: [
            <>
              <Term>Brukeragenten</Term> — programmet du leser og skriver i.
            </>,
            <>
              <Term>E-posttjeneren</Term> — har postkassen din og en kø med utgående post.
            </>,
            <>
              <Term>SMTP</Term> (Simple Mail Transfer Protocol) — protokollen som flytter post
              mellom tjenere.
            </>,
          ],
        }),
        konsept("e-2-reise", "Reisen i tre etapper", {
          ingress: <>Fra Kari sin maskin til Ola sin maskin.</>,
          punkter: [
            "Karis brukeragent leverer meldingen til Karis e-posttjener.",
            "Karis tjener åpner en TCP-forbindelse til Olas tjener og sender meldingen med SMTP.",
            "Olas brukeragent henter meldingen fra Olas tjener.",
          ],
          merk: <>Meldingen går direkte mellom de to tjenerne, uten mellomstasjoner.</>,
        }),
        kode("e-3-smtp", "En SMTP-samtale", {
          ingress: <>S er tjeneren som tar imot, K er tjeneren som sender.</>,
          kode: `S: 220 uit.no
K: HELO hinn.no
S: 250 Hello hinn.no
K: MAIL FROM: <kari@hinn.no>
S: 250 OK
K: RCPT TO: <ola@uit.no>
S: 250 OK
K: DATA
S: 354 End data with <CR><LF>.<CR><LF>
K: Hei Ola, møtet er flyttet.
K: .
S: 250 Message accepted
K: QUIT`,
          punkter: [
            "Kommandoer og svar er ren tekst, som i HTTP.",
            "Svarene har tresifrede koder.",
            "Et punktum alene på en linje avslutter meldingen.",
          ],
        }),
        konsept("e-4-dytt", "Dytte og hente", {
          ingress: <>SMTP og HTTP flytter begge filer over TCP, men i hver sin retning.</>,
          punkter: [
            <>
              SMTP er en <Term>dytteprotokoll</Term>: den som har meldingen åpner forbindelsen.
            </>,
            <>
              HTTP er en <Term>henteprotokoll</Term>: den som vil ha objektet åpner forbindelsen.
            </>,
            "Derfor kan ikke Ola hente posten sin med SMTP. Han er ikke alltid på.",
          ],
        }),
        konsept("e-5-hente", "Den siste etappen", {
          ingress: <>For å lese posten trengs en protokoll der mottakeren tar kontakt.</>,
          punkter: [
            <>
              <Term>IMAP</Term> (Internet Mail Access Protocol) — meldingene blir liggende på
              tjeneren, ordnet i mapper, og er like på alle enhetene dine.
            </>,
            "Nettbasert e-post bruker HTTP mellom nettleseren og tjeneren.",
            "Mellom tjenerne er det uansett SMTP.",
          ],
        }),
        sjekk("e-6-sjekk", "Hvilken protokoll hvor?", {
          sporsmal: (
            <>
              Kari bruker e-post i nettleseren. Ola leser i en e-postapp. Hvilke protokoller brukes
              på de tre etappene, i rekkefølge?
            </>
          ),
          valg: [
            {
              tekst: "SMTP, SMTP, SMTP",
              hvorfor:
                "Siste etappe kan ikke være SMTP, for da måtte tjeneren dyttet til en app som kanskje er av.",
            },
            {
              tekst: "HTTP, SMTP, IMAP",
              riktig: true,
              hvorfor: "Nettleser til tjener, tjener til tjener, og app som henter.",
            },
            { tekst: "HTTP, HTTP, IMAP", hvorfor: "Mellom e-posttjenere brukes SMTP." },
          ],
          fasit: <>HTTP inn, SMTP mellom tjenerne, IMAP ut.</>,
        }),
        recall("e-7-recall", [
          {
            forside: "Hva brukes SMTP til?",
            bakside:
              "Å dytte e-post fra avsenderens tjener til mottakerens tjener, over TCP på port 25.",
          },
          {
            forside: "Hvorfor kan ikke mottakeren hente post med SMTP?",
            bakside:
              "SMTP er en dytteprotokoll der avsenderen åpner forbindelsen. Henting krever at mottakeren tar kontakt.",
          },
          {
            forside: "Hva er forskjellen på en dytteprotokoll og en henteprotokoll?",
            bakside:
              "I en dytteprotokoll åpner den som har dataene forbindelsen. I en henteprotokoll åpner den som vil ha dem.",
          },
        ]),
        oppsummering("e-8-opp", {
          punkter: [
            "E-post består av brukeragenter, tjenere og SMTP.",
            "SMTP dytter mellom tjenere. IMAP eller HTTP henter til leseren.",
          ],
          videre: "Neste undertema: video og innholdsnett.",
        }),
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      slug: "video-og-innholdsnett",
      tittel: "Fildeling, video og innholdsnett",
      utbytte:
        "Du kan forklare hvorfor likemannsnett skalerer, hvordan video tilpasser seg båndbredden, og hva et innholdsnett gjør.",
      byggerPa: ["prosesser-og-sokler", "gjennomstromning", "dns"],
      skjermer: [
        intro("v-1-intro", "Når filene blir store", {
          ingress: (
            <>
              Det meste av trafikken på Internett er video. Én tjener på ett sted klarer ikke å
              levere til millioner samtidig. To ideer løser det på hver sin måte.
            </>
          ),
        }),
        konsept("v-2-p2p", "Likemannsnett skalerer seg selv", {
          ingress: (
            <>
              I klient-tjener må tjeneren laste opp én kopi til hver klient. Tiden vokser med antall
              klienter.
            </>
          ),
          punkter: [
            "I et likemannsnett laster hver deltaker også opp til de andre.",
            "Flere deltakere betyr mer etterspørsel, men også mer opplastingskapasitet.",
            "Derfor holder nedlastingstiden seg nesten flat når nettet vokser.",
          ],
        }),
        konsept("v-3-bittorrent", "BitTorrent i korte trekk", {
          ingress: <>Fila deles i biter på 256 kilobyte, og deltakerne bytter biter.</>,
          punkter: [
            <>
              Du ber først om bitene som færrest naboer har: <Term>sjeldnest først</Term>.
            </>,
            "Du laster opp til de fire naboene som gir deg mest tilbake.",
            "Med jevne mellomrom prøver du en tilfeldig ny nabo, så nye deltakere slipper til.",
          ],
          merk: <>Prinsippet om å gi til dem som gir kalles på engelsk tit-for-tat.</>,
        }),
        konsept("v-4-dash", "Video som tilpasser seg", {
          ingress: (
            <>
              En videotjeneste vet ikke hvor rask forbindelsen din er, og den endrer seg underveis.
            </>
          ),
          punkter: [
            "Videoen deles i biter på noen sekunder.",
            "Hver bit finnes i flere kvaliteter, altså med ulik bitrate.",
            "Spilleren måler gjennomstrømningen og velger kvalitet for neste bit selv.",
          ],
          merk: (
            <>
              Teknikken heter <Term>DASH</Term>, Dynamic Adaptive Streaming over HTTP. Bitene hentes
              med vanlige HTTP-forespørsler.
            </>
          ),
        }),
        konsept("v-5-cdn", "Innholdsnett", {
          ingress: (
            <>
              Et <Term>innholdsnett</Term> (Content Distribution Network, CDN) er mange tjenere
              spredt over hele verden med kopier av det samme innholdet.
            </>
          ),
          punkter: [
            "Du får videoen fra en tjener nær deg, ikke fra den andre siden av jorda.",
            "Kortere vei gir færre flaskehalser.",
            "Valget av tjener skjer ofte i DNS: navneoppslaget svarer med adressen til en tjener i nærheten.",
          ],
        }),
        sjekk("v-6-sjekk", "Hvem velger kvaliteten?", {
          sporsmal: (
            <>Bildet blir plutselig kornete når du ser video på bussen. Hvem bestemte det?</>
          ),
          valg: [
            { tekst: "Tjeneren", hvorfor: "Tjeneren leverer bare de bitene den blir bedt om." },
            {
              tekst: "Spilleren hos deg",
              riktig: true,
              hvorfor:
                "Klienten måler gjennomstrømningen og ber om en lavere bitrate for neste bit.",
            },
            {
              tekst: "Ruterne på veien",
              hvorfor: "Rutere videresender pakker og vet ingenting om video.",
            },
          ],
          fasit: <>Klienten. I DASH ligger intelligensen hos den som ser på.</>,
        }),
        recall("v-7-recall", [
          {
            forside: "Hvorfor skalerer likemannsnett bedre enn klient-tjener for store filer?",
            bakside: "Hver ny deltaker bidrar med opplastingskapasitet, ikke bare etterspørsel.",
          },
          {
            forside: "Hva er DASH?",
            bakside:
              "Video delt i biter i flere kvaliteter, der klienten velger kvalitet for hver bit ut fra målt gjennomstrømning.",
          },
          {
            forside: "Hva er et innholdsnett (CDN)?",
            bakside:
              "Mange spredte tjenere med kopier av innholdet, slik at brukere betjenes fra en tjener i nærheten.",
          },
        ]),
        oppsummering("v-8-opp", {
          punkter: [
            "Likemannsnett lar brukerne dele på opplastingen.",
            "DASH lar klienten velge kvalitet bit for bit.",
            "Innholdsnett flytter innholdet nærmere brukeren.",
          ],
          videre: "Neste undertema: skriv et eget nettverksprogram.",
        }),
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      slug: "sokkelprogrammering",
      tittel: "Sokkelprogrammering i Python",
      utbytte:
        "Du kan lese en enkel UDP- og TCP-tjener i Python og forklare forskjellen på velkomstsokkel og forbindelsessokkel.",
      byggerPa: ["prosesser-og-sokler"],
      skjermer: [
        intro("sp-1-intro", "Døra, sett fra innsiden", {
          ingress: (
            <>
              Sokkelen er grensesnittet mellom programmet ditt og transportlaget. I Python er den et
              objekt med noen få metoder. Vi ser på UDP først, fordi den er enklest.
            </>
          ),
        }),
        kode("sp-2-udp", "UDP-tjener", {
          kode: `from socket import *

tjener = socket(AF_INET, SOCK_DGRAM)
tjener.bind(("", 12000))

while True:
    melding, klientadresse = tjener.recvfrom(2048)
    svar = melding.decode().upper()
    tjener.sendto(svar.encode(), klientadresse)`,
          filnavn: "udp_tjener.py",
          punkter: [
            <>
              <Kodelinje>SOCK_DGRAM</Kodelinje> betyr UDP.
            </>,
            <>
              <Kodelinje>bind</Kodelinje> knytter sokkelen til port 12000.
            </>,
            <>
              <Kodelinje>recvfrom</Kodelinje> gir både meldingen og hvem den kom fra, fordi det ikke
              finnes noen forbindelse.
            </>,
          ],
        }),
        kode("sp-3-tcp", "TCP-tjener", {
          kode: `from socket import *

velkomst = socket(AF_INET, SOCK_STREAM)
velkomst.bind(("", 12000))
velkomst.listen(1)

while True:
    forbindelse, adresse = velkomst.accept()
    melding = forbindelse.recv(1024).decode()
    forbindelse.send(melding.upper().encode())
    forbindelse.close()`,
          filnavn: "tcp_tjener.py",
          punkter: [
            <>
              <Kodelinje>SOCK_STREAM</Kodelinje> betyr TCP.
            </>,
            <>
              <Kodelinje>listen</Kodelinje> gjør sokkelen klar til å ta imot oppkoblinger.
            </>,
            <>
              <Kodelinje>accept</Kodelinje> returnerer en ny sokkel for akkurat denne klienten.
            </>,
          ],
        }),
        konsept("sp-4-to-sokler", "To sokler i TCP", {
          ingress: <>En TCP-tjener har alltid to slags sokler.</>,
          punkter: [
            <>
              <Term>Velkomstsokkelen</Term> står og venter på nye klienter. Det finnes bare én.
            </>,
            <>
              <Term>Forbindelsessokkelen</Term> lages for hver klient som kobler seg til, og brukes
              til selve samtalen.
            </>,
            "Derfor kan én tjener snakke med mange klienter samtidig på samme port.",
          ],
          bihjelp: (
            <>
              Tenk på en resepsjon. Resepsjonisten tar imot alle som kommer inn, og sender hver
              gjest videre til sin egen saksbehandler.
            </>
          ),
        }),
        visual("sp-5-livslop", "Livsløpet til en sokkel", {
          Viz: SocketLifecycleViz,
          hint: "Følg kallene i rekkefølge hos klient og tjener, og se hvilke som bare finnes i TCP.",
        }),
        sjekk("sp-6-sjekk", "Hvorfor recvfrom?", {
          sporsmal: (
            <>
              UDP-tjeneren bruker <Kodelinje>recvfrom</Kodelinje> og får klientadressen med hver
              melding. TCP-tjeneren bruker bare <Kodelinje>recv</Kodelinje>. Hvorfor?
            </>
          ),
          valg: [
            {
              tekst: "TCP-sokkelen er allerede knyttet til én bestemt klient",
              riktig: true,
              hvorfor: "Forbindelsessokkelen tilhører én klient, så avsenderen er gitt.",
            },
            {
              tekst: "TCP sender ikke adresser i pakkene",
              hvorfor: "Adressene står i hver pakke uansett protokoll.",
            },
            {
              tekst: "UDP er tregere og trenger mer informasjon",
              hvorfor: "UDP er ikke tregere. Den mangler bare en forbindelse.",
            },
          ],
          fasit: (
            <>
              Uten forbindelse må hver melding bære med seg hvem den kom fra. Med forbindelse er det
              avklart én gang.
            </>
          ),
        }),
        recall("sp-7-recall", [
          {
            forside: "Hvilken sokkeltype gir UDP, og hvilken gir TCP?",
            bakside: "SOCK_DGRAM gir UDP. SOCK_STREAM gir TCP.",
          },
          {
            forside: "Hva er forskjellen på velkomstsokkel og forbindelsessokkel?",
            bakside:
              "Velkomstsokkelen venter på nye klienter. Forbindelsessokkelen lages av accept og brukes til samtalen med én klient.",
          },
        ]),
        oppsummering("sp-8-opp", {
          punkter: [
            "UDP: én sokkel, og adressen følger med hver melding.",
            "TCP: en velkomstsokkel pluss en forbindelsessokkel per klient.",
          ],
          videre: "Neste emne: transportlaget, der vi åpner opp TCP og UDP.",
        }),
      ],
    },
  ],
};
