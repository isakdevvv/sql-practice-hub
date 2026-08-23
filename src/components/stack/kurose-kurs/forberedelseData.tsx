import type { Metode } from "./Forberedelse";

/**
 * Metodene oppgavene i hvert kapittel krever.
 *
 * Alle eksempler bruker med vilje ANDRE tall og scenarier enn oppgavene på
 * siden. Målet er at du skal kjenne igjen oppgavetypen og kunne oppskriften —
 * ikke at du har sett fasiten før.
 */

const K = ({ children }: { children: React.ReactNode }) => (
  <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">{children}</code>
);

// ===========================================================================
// KAPITTEL 1
// ===========================================================================
export const FORBEREDELSE_1: Metode[] = [
  {
    navn: "Enhetene først — alltid",
    naar: <>Før du setter inn i en eneste formel. Halvparten av bomsvarene er enhetsfeil, ikke metodefeil.</>,
    oppskrift: (
      <>
        Byte → bit: <K>× 8</K>. Nettverksrater bruker 10-potenser (<K>1 Mb/s = 10⁶ bit/s</K>), ikke
        1024. km → m: <K>× 10³</K>. Signalfart i kabel: <K>≈ 2·10⁸ m/s</K> — ikke lysfarten i vakuum.
      </>
    ),
    eksempel: {
      oppgave: <>Hvor lang tid tar det å sende 250 MB over en lenke på 40 Mb/s?</>,
      steg: [
        <>250 MB til bit: <K>250·10⁶ · 8 = 2·10⁹ bit</K>.</>,
        <>Raten er allerede i bit/s: <K>40·10⁶</K>.</>,
        <>Del: <K>2·10⁹ / 4·10⁷ = 50</K>.</>,
      ],
      svar: <>50 sekunder.</>,
    },
    felle: (
      <>
        <strong>MB mot Mb.</strong> «250 MB på 40 Mb/s» ser ut som ca. 6 sekunder hvis du glemmer
        faktor 8. Skriv alltid om til bit før du deler.
      </>
    ),
  },
  {
    navn: "De fire forsinkelsene — hvilken dominerer?",
    naar: <>Oppgaven spør «hva er forsinkelsen» eller «hva dominerer» mellom to punkter.</>,
    oppskrift: (
      <>
        <K>d_proc</K> ≈ mikrosekunder · <K>d_queue</K> = varierer med belastning ·{" "}
        <K>d_trans = L/R</K> · <K>d_prop = d/s</K>. Regn ut alle, og sammenlign størrelsesorden.
      </>
    ),
    eksempel: {
      oppgave: (
        <>En 500-byte pakke sendes Tromsø–Trondheim (~1100 km) på en 1 Gb/s lenke uten kø. Hva dominerer?</>
      ),
      steg: [
        <>
          <K>d_trans = 500·8 / 10⁹ = 4·10⁻⁶ s = 4 µs</K>.
        </>,
        <>
          <K>d_prop = 1100·10³ / 2·10⁸ = 5,5·10⁻³ s = 5,5 ms</K>.
        </>,
        <>Sammenlign: 5,5 ms mot 4 µs — en faktor på nesten 1400.</>,
      ],
      svar: (
        <>
          Propagasjon dominerer fullstendig. Over lange avstander hjelper det knapt å oppgradere
          lenken — avstanden er problemet.
        </>
      ),
    },
    felle: (
      <>
        <strong>Lysfarten i vakuum.</strong> Bruker du <K>3·10⁸</K> i stedet for <K>2·10⁸</K> bommer
        du med 50 %. Signalet går saktere i glass og kobber enn i tomrom.
      </>
    ),
  },
  {
    navn: "Trafikkintensitet ρ og køeksplosjonen",
    naar: <>Oppgaven nevner belastning, utnyttelse, ankomstrate mot servicerate, eller om en kø vokser.</>,
    oppskrift: (
      <>
        <K>ρ = ankomstrate / servicerate</K> (eller <K>λ·L/R</K>). Stabil bare hvis <K>ρ &lt; 1</K>.
        Køforsinkelse ≈ <K>(L/R) · ρ/(1−ρ)</K> — legg merke til at nevneren går mot null.
      </>
    ),
    eksempel: {
      oppgave: (
        <>En 100 Mb/s lenke får 8000 pakker/s à 1250 byte. Hva er ρ og køforsinkelsen — og hva skjer ved ρ = 0,95?</>
      ),
      steg: [
        <>
          <K>L/R = 1250·8 / 10⁸ = 100 µs</K> per pakke.
        </>,
        <>
          <K>ρ = 8000 · 100 µs = 0,8</K>.
        </>,
        <>
          <K>kø = 100 µs · 0,8/0,2 = 400 µs</K>.
        </>,
        <>
          Ved ρ = 0,95: <K>100 µs · 0,95/0,05 = 1900 µs</K>.
        </>,
      ],
      svar: (
        <>
          ρ = 0,8 gir 400 µs. Å øke belastningen fra 0,80 til 0,95 — bare 19 % mer trafikk — nesten
          femdobler køen.
        </>
      ),
    },
    felle: (
      <>
        <strong>Å tro at kø vokser lineært.</strong> Kurven er nesten flat opp til ρ ≈ 0,7 og nesten
        loddrett etter 0,9. Derfor er «97 % utnyttelse» katastrofalt, ikke «litt verre enn 80 %».
      </>
    ),
  },
  {
    navn: "Flaskehalsen bestemmer — ta min(), ikke sum()",
    naar: <>Flere ledd på rad, eller flere brukere som deler en server. Spørsmål om oppnådd hastighet.</>,
    oppskrift: (
      <>
        Gjennomstrømming = <K>min</K> over alle ledd på veien. Deler N brukere en server:{" "}
        <K>min(klientens ned-rate, server-opp / N)</K>.
      </>
    ),
    eksempel: {
      oppgave: <>En server har 500 Mb/s opp. 40 klienter laster ned samtidig, hver med 100 Mb/s ned. Hva får hver?</>,
      steg: [
        <>Serverandel per klient: <K>500/40 = 12,5 Mb/s</K>.</>,
        <>Klientens egen kapasitet: <K>100 Mb/s</K>.</>,
        <>Ta minimum: <K>min(100 ; 12,5)</K>.</>,
      ],
      svar: <>12,5 Mb/s hver. Serveren er flaskehalsen — klientenes 100 Mb/s er irrelevant.</>,
    },
    felle: (
      <>
        <strong>Å legge sammen kapasiteter.</strong> En kjede blir aldri raskere enn sitt tregeste
        ledd. Summering hører hjemme i P2P, der hver ny deltaker <em>tilfører</em> opplasting.
      </>
    ),
  },
  {
    navn: "Bandwidth-delay product (BDP)",
    naar: <>Oppgaven spør hvor mye data som er «i lufta», eller hvor stort vindu som trengs.</>,
    oppskrift: (
      <>
        <K>BDP = rate × RTT</K>. Det er mengden data som får plass på strekningen samtidig. Vinduet
        må være <K>≥ BDP</K> for å holde røret fullt.
      </>
    ),
    eksempel: {
      oppgave: <>En lenke gir 200 Mb/s med RTT 40 ms. Hvor stort må vinduet minst være?</>,
      steg: [
        <><K>BDP = 2·10⁸ · 0,040 = 8·10⁶ bit</K>.</>,
        <>Til byte: <K>8·10⁶ / 8 = 10⁶ byte = 1 MB</K>.</>,
      ],
      svar: <>Ca. 1 MB. Er vinduet mindre, står avsenderen og venter på kvitteringer i stedet for å sende.</>,
    },
    felle: (
      <>
        <strong>Enveis i stedet for rundtur.</strong> BDP bruker RTT, ikke propagasjonstiden én vei —
        du må vente på kvitteringen før vinduet frigjøres.
      </>
    ),
  },
];

// ===========================================================================
// KAPITTEL 2
// ===========================================================================
export const FORBEREDELSE_2: Metode[] = [
  {
    navn: "Tell RTT-er for en sidelasting",
    naar: <>Oppgaven gir RTT og et antall objekter, og spør om lastetid for HTTP/1.1 mot HTTP/2.</>,
    oppskrift: (
      <>
        Oppsett: <K>1 RTT TCP + 1 RTT TLS</K>. Så <K>1 RTT</K> for HTML-en. Deretter: seriell ={" "}
        <K>N RTT</K> · parallell med P forbindelser = <K>⌈N/P⌉ RTT</K> · multiplekset (HTTP/2) ={" "}
        <K>1 RTT</K>.
      </>
    ),
    eksempel: {
      oppgave: <>12 objekter, RTT = 40 ms, TCP + TLS. Sammenlign seriell, 4 parallelle og HTTP/2.</>,
      steg: [
        <>Felles oppsett + HTML: <K>2 + 1 = 3 RTT</K> i alle tre tilfellene.</>,
        <>Seriell: <K>3 + 12 = 15 RTT = 600 ms</K>.</>,
        <>4 parallelle: <K>3 + ⌈12/4⌉ = 3 + 3 = 6 RTT = 240 ms</K>.</>,
        <>HTTP/2: <K>3 + 1 = 4 RTT = 160 ms</K>.</>,
      ],
      svar: <>600 ms, 240 ms og 160 ms.</>,
    },
    felle: (
      <>
        <strong>Å glemme HTML-runden.</strong> Nettleseren vet ikke hvilke 12 objekter den skal ha
        før basefila er hentet. Ressursene kan aldri starte i samme runde som HTML-en.
      </>
    ),
  },
  {
    navn: "TTL styrer lasten — raten skalerer som 1/TTL",
    naar: <>Oppgaven endrer TTL og spør hva som skjer med trafikken mot autoritativ server.</>,
    oppskrift: (
      <>
        Hver cache bommer én gang per TTL. Endrer du TTL fra <K>T</K> til <K>T′</K>, ganges
        spørringsraten med <K>T/T′</K>.
      </>
    ),
    eksempel: {
      oppgave: <>Autoritativ server ser 50 spørringer/s ved TTL = 600 s. Hva skjer om TTL settes til 60 s?</>,
      steg: [
        <>Faktoren: <K>600/60 = 10</K>.</>,
        <>Ny rate: <K>50 · 10 = 500</K> spørringer/s.</>,
      ],
      svar: <>500 spørringer/s — ti ganger lasten, for ti ganger raskere failover.</>,
    },
    felle: (
      <>
        <strong>Å tro at flere brukere gir mer last.</strong> Det er antall <em>cacher</em> og TTL-en
        som styrer. Tusen brukere bak én resolver gir én spørring per TTL.
      </>
    ),
  },
  {
    navn: "Distribusjonstid: klient-tjener mot P2P",
    naar: <>Oppgaven sammenligner nedlasting fra én server med BitTorrent-lignende deling.</>,
    oppskrift: (
      <>
        Klient-tjener: <K>max( N·F/u_s , F/d_min )</K>. P2P:{" "}
        <K>max( F/u_s , F/d_min , N·F/(u_s + Σu_i) )</K>. Forskjellen ligger i siste ledd — nevneren
        vokser med N.
      </>
    ),
    eksempel: {
      oppgave: <>F = 1 GB, N = 5 nedlastere, server 50 Mb/s opp, hver peer 10 Mb/s opp og 100 Mb/s ned.</>,
      steg: [
        <>Fila i bit: <K>8·10⁹</K>.</>,
        <>KS: <K>N·F/u_s = 5·8·10⁹/5·10⁷ = 800 s</K>; <K>F/d = 80 s</K> → <K>800 s</K>.</>,
        <>P2P: <K>F/u_s = 160 s</K>; <K>F/d = 80 s</K>.</>,
        <>P2P siste ledd: <K>5·8·10⁹ / (5·10⁷ + 5·10⁷) = 4·10¹⁰/10⁸ = 400 s</K>.</>,
      ],
      svar: <>800 s mot 400 s. P2P halverer, fordi de fem nedlasterne til sammen dobler opplastingskapasiteten.</>,
    },
    felle: (
      <>
        <strong>Å glemme at peers tilfører kapasitet.</strong> I klient-tjener står <K>N</K> bare i
        telleren. I P2P står den i telleren <em>og</em> nevneren — det er hele poenget.
      </>
    ),
  },
  {
    navn: "Vektet gjennomsnitt",
    naar: <>Oppgaven gir andeler («60 % av klientene …») og spør om snittet.</>,
    oppskrift: (
      <>
        <K>snitt = Σ (andel × verdi)</K>. Andelene skal summere til 1.
      </>
    ),
    eksempel: {
      oppgave: <>70 % av forespørslene treffer cachen (5 ms), 30 % bommer og må hentes (120 ms). Snitt?</>,
      steg: [
        <><K>0,70 · 5 = 3,5</K></>,
        <><K>0,30 · 120 = 36</K></>,
        <>Summer: <K>3,5 + 36</K></>,
      ],
      svar: <>39,5 ms.</>,
    },
    felle: (
      <>
        <strong>Å ta snittet av de to tallene.</strong> <K>(5+120)/2 = 62,5</K> er feil svar på et
        spørsmål som oppgir andeler. Vektene er halve oppgaven.
      </>
    ),
  },
  {
    navn: "Overhead-andel",
    naar: <>Oppgaven sammenligner protokoller med ulik header, eller små pakker mot store.</>,
    oppskrift: (
      <>
        <K>nyttelast-andel = payload / (payload + header)</K>. Si eksplisitt om prosenten er av{" "}
        <em>totalen</em> eller av <em>nyttelasten</em>.
      </>
    ),
    eksempel: {
      oppgave: <>40 byte nyttelast med 40 byte header, mot 1000 byte nyttelast med samme header.</>,
      steg: [
        <>Liten: <K>40/80 = 50 %</K> nyttelast — halve linja er header.</>,
        <>Stor: <K>1000/1040 ≈ 96,2 %</K> nyttelast.</>,
      ],
      svar: <>50 % mot 3,8 % overhead. Samme header, helt ulik kostnad — derfor er små pakker dyre.</>,
    },
    felle: (
      <>
        <strong>Å regne overhead av nyttelasten.</strong> 40 byte header på 40 byte data er «100 % av
        nyttelasten» men «50 % av totalen». Begge er riktige tall — si hvilket du mener.
      </>
    ),
  },
];

// ===========================================================================
// KAPITTEL 3
// ===========================================================================
export const FORBEREDELSE_3: Metode[] = [
  {
    navn: "EWMA — glidende gjennomsnitt for RTT",
    naar: <>Oppgaven gir α, β, en startverdi og en rekke RTT-målinger.</>,
    oppskrift: (
      <>
        <K>E_n = (1−α)·E_(n−1) + α·S_n</K>
        <br />
        <K>Dev_n = (1−β)·Dev_(n−1) + β·|S_n − E_(n−1)|</K>
        <br />
        <K>Timeout = E + 4·Dev</K>
      </>
    ),
    eksempel: {
      oppgave: <>α = 0,25, β = 0,25, E₀ = 100 ms, Dev₀ = 0. Målinger: 140 ms, så 120 ms.</>,
      steg: [
        <><K>E₁ = 0,75·100 + 0,25·140 = 110</K></>,
        <><K>Dev₁ = 0,75·0 + 0,25·|140 − 100| = 10</K></>,
        <><K>E₂ = 0,75·110 + 0,25·120 = 112,5</K></>,
        <><K>Dev₂ = 0,75·10 + 0,25·|120 − 110| = 10</K></>,
      ],
      svar: <>E = 112,5 ms, Dev = 10 ms, timeout = <K>112,5 + 40 = 152,5 ms</K>.</>,
    },
    felle: (
      <>
        <strong>Feil E inne i avviket.</strong> <K>Dev</K> bruker det <em>gamle</em> estimatet{" "}
        <K>E_(n−1)</K>, ikke det du nettopp regnet ut. Regn alltid Dev før du oppdaterer E — eller
        ta vare på den gamle verdien.
      </>
    ),
  },
  {
    navn: "Hvor mye kan avsenderen sende akkurat nå?",
    naar: <>Oppgaven gir cwnd, rwnd og en mengde ubekreftede bytes.</>,
    oppskrift: (
      <>
        <K>tillatt nå = min(cwnd, rwnd) − ubekreftet ute</K>. To grenser, og den strammeste vinner.
      </>
    ),
    eksempel: {
      oppgave: <>cwnd = 20 KB, rwnd = 14 KB, og 9 KB er allerede sendt uten kvittering.</>,
      steg: [
        <><K>min(20 ; 14) = 14 KB</K> — mottakeren er flaskehalsen.</>,
        <><K>14 − 9 = 5</K></>,
      ],
      svar: <>5 KB. Flaskehalsen er rwnd, altså mottakerens bufferplass — ikke nettverket.</>,
    },
    felle: (
      <>
        <strong>Å glemme å trekke fra det som er ute.</strong> Vinduet er et tak på{" "}
        <em>utestående</em> data, ikke på hvor mye du får sende i hver runde.
      </>
    ),
  },
  {
    navn: "Er vinduet stort nok til å fylle lenken?",
    naar: <>Oppgaven gir vindusstørrelse, RTT og lenkerate, og spør om oppnådd gjennomstrømming.</>,
    oppskrift: (
      <>
        <K>oppnådd = vindu / RTT</K>. Sammenlign med lenkeraten. Trenger{" "}
        <K>vindu ≥ BDP = R · RTT</K> for å utnytte lenken fullt.
      </>
    ),
    eksempel: {
      oppgave: <>Vindu 64 KB, RTT 80 ms, lenke 50 Mb/s.</>,
      steg: [
        <>Vinduet i bit: <K>64·1024·8 ≈ 5,24·10⁵</K>.</>,
        <><K>oppnådd = 5,24·10⁵ / 0,08 ≈ 6,55 Mb/s</K>.</>,
        <><K>BDP = 5·10⁷ · 0,08 = 4·10⁶ bit = 500 kB</K>.</>,
      ],
      svar: (
        <>
          Bare 6,55 av 50 Mb/s — rundt 13 % av lenken. Vinduet måtte vært ca. 500 kB, altså nesten
          åtte ganger større.
        </>
      ),
    },
    felle: (
      <>
        <strong>Å sammenligne byte med bit/s direkte.</strong> Gjør om vinduet til bit før du deler
        på RTT, ellers får du et svar som er åtte ganger for lavt.
      </>
    ),
  },
  {
    navn: "Regnskap for slow start og fast recovery",
    naar: <>Oppgaven gir cwnd og ssthresh og et tap, og spør hva som skjer og hvor lenge det tar.</>,
    oppskrift: (
      <>
        3 dup-ACK: <K>ssthresh = cwnd/2</K>, <K>cwnd = ssthresh</K>. Timeout:{" "}
        <K>ssthresh = cwnd/2</K>, <K>cwnd = 1</K>. Under ssthresh dobles cwnd per RTT; over den
        vokser den <K>+1 MSS per RTT</K>.
      </>
    ),
    eksempel: {
      oppgave: <>cwnd = 24 MSS i congestion avoidance. Tre dup-ACK-er kommer. RTT = 40 ms. Hvor lenge til cwnd er 24 igjen?</>,
      steg: [
        <><K>ssthresh = 24/2 = 12</K>, og <K>cwnd = 12</K>.</>,
        <>Vi er nå over/på ssthresh → additiv vekst, <K>+1 per RTT</K>.</>,
        <>Fra 12 til 24 er <K>12</K> steg.</>,
        <><K>12 · 40 ms = 480 ms</K>.</>,
      ],
      svar: <>480 ms. Med timeout i stedet ville cwnd gått til 1, og gjenopphentingen tatt langt lengre.</>,
    },
    felle: (
      <>
        <strong>Å blande de to tapssignalene.</strong> Timeout gir <K>cwnd = 1</K> — ikke halvering.
        Halvering hører til tre dup-ACK-er, der senere segmenter beviselig kom fram.
      </>
    ),
  },
  {
    navn: "Mathis-formelen — hvorfor lik protokoll ikke gir lik fart",
    naar: <>To strømmer med ulik RTT deler en flaskehals, og oppgaven spør om forholdet.</>,
    oppskrift: (
      <>
        <K>throughput ≈ 1,22·MSS / (RTT·√p)</K>. Med samme <K>MSS</K> og <K>p</K> faller alt bort
        unntatt RTT — forholdet blir <K>RTT_B / RTT_A</K>.
      </>
    ),
    eksempel: {
      oppgave: <>Strøm A har RTT 30 ms, strøm B har RTT 90 ms. Samme tapsrate og MSS. Forholdet?</>,
      steg: [
        <>Alt utenom RTT er felles og forkortes bort.</>,
        <><K>T_A / T_B = RTT_B / RTT_A = 90/30</K>.</>,
      ],
      svar: <>3:1 i favør den korte RTT-en. «Rettferdig» protokoll, svært urettferdig utfall.</>,
    },
    felle: (
      <>
        <strong>Å tro at AIMD gir lik fart.</strong> AIMD er rettferdig mellom strømmer med{" "}
        <em>samme</em> RTT. Kort RTT betyr flere økninger per sekund — og dermed en systematisk
        fordel.
      </>
    ),
  },
];

// ===========================================================================
// KAPITTEL 5
// ===========================================================================
export const FORBEREDELSE_5: Metode[] = [
  {
    navn: "Distance-vector: spor tabellene rad for rad",
    naar: <>En lenke ryker i et DV-nett, og oppgaven ber deg vise iterasjonene.</>,
    oppskrift: (
      <>
        Sett opp én rad per node med <K>(destinasjon: kost, via)</K>. Ved endring: hver node regner{" "}
        <K>ny kost = lenkekost + naboens annonserte kost</K> og annonserer videre. Fortsett til
        ingenting endrer seg.
      </>
    ),
    eksempel: {
      oppgave: <>X — Y — Z, alle lenker kost 1. Lenken Y—Z ryker. Hva tror X om Z rett etterpå?</>,
      steg: [
        <>Før bruddet: X har <K>(Z: 2, via Y)</K>, Y har <K>(Z: 1, direkte)</K>.</>,
        <>Y mister lenken, men hører X annonsere <K>Z = 2</K>.</>,
        <>Y regner <K>1 + 2 = 3</K> og tror nå Z er nåbar via X — som går via Y.</>,
        <>Kosten krabber oppover 3, 4, 5 … til den treffer «uendelig».</>,
      ],
      svar: (
        <>
          Dette er <strong>count-to-infinity</strong>. Poisoned reverse lar Y si «Z er uendelig langt
          unna» tilbake til den naboen den rutet gjennom — og kutter løkken for to noder.
        </>
      ),
    },
    felle: (
      <>
        <strong>Å tro poisoned reverse løser alt.</strong> Den fikser to-node-løkker. Løkker som går
        gjennom tre eller flere noder kan fortsatt telle oppover.
      </>
    ),
  },
  {
    navn: "Flow-tabell: høyeste prioritet vinner",
    naar: <>SDN-oppgave med en tabell av match-action-regler og en pakke som skal klassifiseres.</>,
    oppskrift: (
      <>
        Finn <em>alle</em> regler pakken matcher. Velg den med høyest <K>prio</K>. Matcher ingen,
        treffer <K>catch-all</K> — som typisk sender pakken til controlleren.
      </>
    ),
    eksempel: {
      oppgave: (
        <>Regler: (a) prio 200, <K>dst=192.168.1.7</K> → port 2. (b) prio 80, <K>dst=192.168.1.0/24</K> → port 5. (c) prio 5, <K>*</K> → controller. Hvor går <K>dst=192.168.1.7</K>?</>
      ),
      steg: [
        <>Pakken matcher (a) — eksakt treff.</>,
        <>Den matcher også (b) — den ligger i /24-nettet.</>,
        <>Og (c), som matcher alt.</>,
        <>Høyest prio blant treffene er 200.</>,
      ],
      svar: <>Port 2. En pakke til <K>192.168.1.50</K> ville derimot bare matchet (b) og (c) → port 5.</>,
    },
    felle: (
      <>
        <strong>«Første treff vinner».</strong> Det er slik brannmurregler ofte fungerer, men ikke
        OpenFlow. Her er det prioritet som avgjør, uansett rekkefølge i tabellen.
      </>
    ),
  },
  {
    navn: "Konvergenstid = hvilken timer som styrer",
    naar: <>Oppgaven sammenligner hvor raskt ulike mekanismer oppdager og retter en feil.</>,
    oppskrift: (
      <>
        Finn <em>deteksjons</em>-tiden først, så <em>spredningen</em>. OSPF: hello 10 s / dead 40 s.
        BFD: ~100–300 ms. BGP: MRAI ~30 s <em>per hopp</em> gjennom internett.
      </>
    ),
    eksempel: {
      oppgave: <>En rute må trekkes tilbake gjennom 4 AS-er på rad, med MRAI = 30 s. Grovt anslag?</>,
      steg: [
        <>Hvert AS venter opptil MRAI før det sender videre.</>,
        <><K>4 · 30 s = 120 s</K> i verste fall, pluss prosessering.</>,
      ],
      svar: <>To minutter er et helt normalt anslag. Derfor er BGP-konvergens målt i minutter, mens BFD er målt i millisekunder.</>,
    },
    felle: (
      <>
        <strong>Å blande deteksjon og spredning.</strong> BFD oppdager bruddet på 100 ms — men hvis
        beskjeden må gjennom BGP etterpå, er det MRAI som bestemmer totalen.
      </>
    ),
  },
  {
    navn: "Diagnose nedenfra og opp",
    naar: <>«Nettet virker ikke» — oppgaven ber deg beskrive framgangsmåten.</>,
    oppskrift: (
      <>
        Fast rekkefølge: <K>1)</K> har jeg IP (DHCP)? <K>2)</K> når jeg default gateway? <K>3)</K>{" "}
        når jeg en IP på utsiden? <K>4)</K> virker DNS? Første steg som feiler peker på laget.
      </>
    ),
    eksempel: {
      oppgave: <>Bruker har IP, <K>ping</K> til <K>8.8.8.8</K> virker, men ingen nettsider laster. Hvor sitter feilen?</>,
      steg: [
        <>IP finnes → DHCP og lenkelaget er i orden.</>,
        <>Ping til en IP på utsiden virker → ruting og nettverkslaget er i orden.</>,
        <>Da gjenstår navneoppslag.</>,
      ],
      svar: <>DNS. Å pinge en IP mot å pinge et navn er nettopp testen som skiller de to.</>,
    },
    felle: (
      <>
        <strong>Å starte øverst.</strong> Å teste nettsider først forteller deg ingenting om{" "}
        <em>hvor</em> det ryker. Test ett lag om gangen nedenfra.
      </>
    ),
  },
];

// ===========================================================================
// KAPITTEL 6
// ===========================================================================
export const FORBEREDELSE_6: Metode[] = [
  {
    navn: "CRC — polynomdivisjon med XOR",
    naar: <>Oppgaven gir databit D og generator G og ber om sjekksummen.</>,
    oppskrift: (
      <>
        <K>r = lengde(G) − 1</K>. Heng <K>r</K> nuller bak D. Gjør lang divisjon der subtraksjon er
        erstattet med <K>XOR</K>. Resten (r bit) er CRC-en.
      </>
    ),
    eksempel: {
      oppgave: <>D = <K>1101</K>, G = <K>101</K>.</>,
      steg: [
        <><K>r = 2</K> → dividend blir <K>110100</K>.</>,
        <><K>110</K> XOR <K>101</K> = <K>011</K> → <K>011100</K>.</>,
        <>Neste ledende ener: <K>111</K> XOR <K>101</K> = <K>010</K> → <K>001000</K>.</>,
        <>Neste: <K>100</K> XOR <K>101</K> = <K>001</K> → <K>000010</K>.</>,
        <>De siste <K>r = 2</K> bitene er resten.</>,
      ],
      svar: <>CRC = <K>10</K>. Det sendes <K>110110</K> — som deler på G uten rest.</>,
    },
    felle: (
      <>
        <strong>Å glemme nullene bak.</strong> Uten dem regner du på feil tall. Og bruk XOR, ikke
        vanlig subtraksjon — det er ingen låning i denne aritmetikken.
      </>
    ),
  },
  {
    navn: "Oversubscription og bisection i leaf-spine",
    naar: <>Datasenter-oppgave med antall leaf, spine, serverporter og uplinks.</>,
    oppskrift: (
      <>
        Per leaf: <K>ned = antall serverporter × portrate</K>, <K>opp = antall spines × uplinkrate</K>{" "}
        (én uplink per spine). <K>Oversubscription = ned/opp</K>. Bisection: del leafene i to og
        summer opp-kapasiteten på den ene siden.
      </>
    ),
    eksempel: {
      oppgave: <>12 leaf, 6 spine. Hver leaf: 40 serverporter à 10 Gb/s, én 40 Gb/s uplink per spine.</>,
      steg: [
        <>Ned per leaf: <K>40 · 10 = 400 Gb/s</K>.</>,
        <>Opp per leaf: <K>6 · 40 = 240 Gb/s</K>.</>,
        <>Oversubscription: <K>400/240 ≈ 1,67:1</K>.</>,
        <>Bisection: <K>6 leaf · 240 = 1440 Gb/s</K> over snittet.</>,
      ],
      svar: <>Ca. 1,67:1 oversubscription og 1440 Gb/s bisection.</>,
    },
    felle: (
      <>
        <strong>Å telle uplinks feil.</strong> Antall uplinks per leaf er antall <em>spines</em> —
        én til hver. Les alltid ut spine-tallet før du regner opp-kapasiteten.
      </>
    ),
  },
  {
    navn: "Minste rammestørrelse fra rundturstid",
    naar: <>CSMA/CD-oppgave om hvorfor rammer må ha en minstestørrelse.</>,
    oppskrift: (
      <>
        Avsenderen må fortsatt sende når en kollisjon fra motsatt ende rekker tilbake:{" "}
        <K>L_min / R ≥ 2·d/s</K>, altså <K>L_min ≥ R · 2d/s</K>.
      </>
    ),
    eksempel: {
      oppgave: <>100 Mb/s, 100 m kabel, signalfart <K>2·10⁸ m/s</K>.</>,
      steg: [
        <>Rundtur: <K>2 · 100 / 2·10⁸ = 10⁻⁶ s = 1 µs</K>.</>,
        <><K>L_min = 10⁸ · 10⁻⁶ = 100 bit = 12,5 byte</K>.</>,
      ],
      svar: (
        <>
          12,5 byte holder her — men standarden krever 64 byte, som gir god margin. Sammenhengen
          forklarer hvorfor raskere Ethernet måtte krympe maks segmentlengde.
        </>
      ),
    },
    felle: (
      <>
        <strong>Å glemme faktor 2.</strong> Signalet må rekke bort <em>og</em> tilbake. Enveis gir
        halvparten av riktig svar.
      </>
    ),
  },
  {
    navn: "Switch self-learning",
    naar: <>Oppgaven gir en tom tabell og en rekke rammer, og ber deg føre tabellen.</>,
    oppskrift: (
      <>
        For hver ramme: <K>1)</K> lær <em>kilde</em>-MAC → inn-port. <K>2)</K> slå opp{" "}
        <em>destinasjon</em>: kjent → send kun på den porten; ukjent eller broadcast → flood på alle
        unntatt inn-porten.
      </>
    ),
    eksempel: {
      oppgave: <>Tom tabell. Ramme 1: fra X på port 1, til Y. Ramme 2: fra Y på port 4, til X.</>,
      steg: [
        <>Ramme 1: lær <K>X → 1</K>. Y er ukjent → flood.</>,
        <>Ramme 2: lær <K>Y → 4</K>. X er kjent → send kun på port 1.</>,
      ],
      svar: <>Tabellen er <K>X→1, Y→4</K>. Bare den første ramma ble flooded — svaret gikk målrettet.</>,
    },
    felle: (
      <>
        <strong>Å tro at destinasjonen læres.</strong> Svitsjen lærer kun av <em>kilde</em>-feltet.
        Destinasjonen slås opp, aldri lagres fra.
      </>
    ),
  },
];

// ===========================================================================
// KAPITTEL 7
// ===========================================================================
export const FORBEREDELSE_7: Metode[] = [
  {
    navn: "Bølgelengde — derfor flytter 10 cm alt",
    naar: <>Oppgaver om multipath, fading og hvorfor små forflytninger endrer signalet.</>,
    oppskrift: (
      <>
        <K>λ = c/f</K>. Konstruktiv og destruktiv interferens veksler for hver <K>λ/2</K> du flytter
        deg.
      </>
    ),
    eksempel: {
      oppgave: <>Hva er bølgelengden ved 2,4 GHz, og hvor langt må du flytte deg for å snu interferensen?</>,
      steg: [
        <><K>λ = 3·10⁸ / 2,4·10⁹ = 0,125 m = 12,5 cm</K>.</>,
        <><K>λ/2 ≈ 6 cm</K>.</>,
      ],
      svar: (
        <>
          Rundt 6 cm er nok til å gå fra topp til bunn. Ti meter endrer derimot hele geometrien av
          refleksjoner — utfallet blir tilfeldig, ikke systematisk.
        </>
      ),
    },
    felle: (
      <>
        <strong>Å tro at lenger unna alltid er verre.</strong> På korte skalaer styrer interferens,
        ikke avstand. Derfor kan et halvt skritt hjelpe mer enn å flytte seg nærmere.
      </>
    ),
  },
  {
    navn: "Airtime-regnskap",
    naar: <>Oppgaven oppgir hvor stor andel av lufttiden som går til data, overhead og kollisjoner.</>,
    oppskrift: (
      <>
        Andelene summerer til 100 %. Nominell rate <K>×</K> data-andel gir reell gjennomstrømming.
        Overhead per ramme er nesten konstant — større rammer flytter derfor balansen mot data.
      </>
    ),
    eksempel: {
      oppgave: <>En celle har 200 Mb/s nominelt, 45 % data, 35 % overhead, 20 % kollisjoner. Reell nytte?</>,
      steg: [
        <><K>200 · 0,45 = 90 Mb/s</K>.</>,
        <>Færre samtidige klienter ville kuttet kollisjonsandelen.</>,
        <>Større rammer ville kuttet overhead-andelen per byte.</>,
      ],
      svar: <>Ca. 90 Mb/s reelt — under halvparten av det som står på esken.</>,
    },
    felle: (
      <>
        <strong>Å regne nominell rate som tilgjengelig kapasitet.</strong> Nominell rate gjelder mens
        det faktisk sendes data — og det er under halve tiden.
      </>
    ),
  },
  {
    navn: "Tapsbasert TCP over radio",
    naar: <>Oppgaven spør hvorfor nominell rate ikke oppnås på 4G/WiFi, selv med stort vindu.</>,
    oppskrift: (
      <>
        <K>BDP = R · RTT</K> gir nødvendig vindu. Men <K>Mathis</K> setter taket:{" "}
        <K>≈ 1,22·MSS/(RTT·√p)</K>. Radiotap tolkes som trengsel, og p blir stor nok til å binde.
      </>
    ),
    eksempel: {
      oppgave: <>50 Mb/s, RTT 80 ms, MSS 1460 byte, tap p = 0,5 %.</>,
      steg: [
        <><K>BDP = 5·10⁷ · 0,08 = 4·10⁶ bit = 500 kB</K>.</>,
        <><K>√p = √0,005 ≈ 0,0707</K>.</>,
        <><K>1,22 · 1460 B / (0,08 · 0,0707) ≈ 315 kB/s ≈ 2,5 Mb/s</K>.</>,
      ],
      svar: (
        <>
          Vinduet måtte vært 500 kB, men Mathis-taket ligger på ca. 2,5 Mb/s uansett vindu. Det er
          tapsraten, ikke vindusstørrelsen, som binder.
        </>
      ),
    },
    felle: (
      <>
        <strong>Å tro at et større vindu fikser det.</strong> Når tap tolkes som trengsel, senker
        avsenderen farten selv om lenken er ledig. Det er hele motivasjonen bak BBR.
      </>
    ),
  },
  {
    navn: "SNR mot modulasjon — velg med margin",
    naar: <>Oppgaven gir målt SNR og en tabell over hva hver modulasjon krever.</>,
    oppskrift: (
      <>
        Velg høyeste modulasjon der <K>målt SNR − krav</K> gir reell margin. Bit per symbol:
        QPSK 2, 16-QAM 4, 64-QAM 6, 256-QAM 8.
      </>
    ),
    eksempel: {
      oppgave: <>Målt SNR 20 dB. 16-QAM krever 15 dB, 64-QAM krever 19 dB.</>,
      steg: [
        <>64-QAM: margin <K>20 − 19 = 1 dB</K> — altfor lite, radiokanalen svinger mer enn det.</>,
        <>16-QAM: margin <K>20 − 15 = 5 dB</K> — robust.</>,
      ],
      svar: (
        <>
          Velg 16-QAM. Litt lavere toppfart, men langt færre retransmisjoner — som i praksis gir
          høyere gjennomstrømming.
        </>
      ),
    },
    felle: (
      <>
        <strong>Å velge høyeste modulasjon som «så vidt går».</strong> 1 dB margin betyr at
        halvparten av rammene ryker når noen går forbi.
      </>
    ),
  },
];

// ===========================================================================
// KAPITTEL 8
// ===========================================================================
export const FORBEREDELSE_8: Metode[] = [
  {
    navn: "Hvem bruker hvilken nøkkel — hybrid kryptering",
    naar: <>Oppgaven ber deg tegne flyten for konfidensialitet, integritet og signatur.</>,
    oppskrift: (
      <>
        Fast mønster: <K>1)</K> tilfeldig symmetrisk nøkkel krypterer meldingen. <K>2)</K>{" "}
        <em>mottakerens offentlige</em> nøkkel krypterer den symmetriske nøkkelen. <K>3)</K>{" "}
        <em>avsenderens private</em> nøkkel signerer en hash av meldingen.
      </>
    ),
    eksempel: {
      oppgave: <>Hvilken nøkkel gjør hva når A sender en signert, konfidensiell melding til B?</>,
      steg: [
        <>Innhold: symmetrisk nøkkel <K>k</K> (rask, takler store meldinger).</>,
        <>Konfidensialitet: <K>k</K> krypteres med <strong>B sin offentlige</strong> — kun B kan åpne.</>,
        <>Autentisitet: hash av meldingen signeres med <strong>A sin private</strong> — kun A kan lage den.</>,
      ],
      svar: (
        <>
          Offentlig nøkkel <em>låser</em>, privat nøkkel <em>låser opp</em> — men for signatur er det
          motsatt vei. Det er den vekslingen oppgaven tester.
        </>
      ),
    },
    felle: (
      <>
        <strong>Å signere med mottakerens nøkkel.</strong> Da beviser du ingenting. Signatur bruker
        alltid <em>din egen</em> private nøkkel, fordi det er den bare du har.
      </>
    ),
  },
  {
    navn: "Presisjon ved sjeldne hendelser (base rate)",
    naar: <>IDS- eller deteksjons-oppgave med sensitivitet, falsk-positiv-rate og en sjelden hendelse.</>,
    oppskrift: (
      <>
        Regn antall, ikke prosenter: <K>TP = N·andel·sensitivitet</K>,{" "}
        <K>FP = N·(1−andel)·FPR</K>. Presisjon = <K>TP/(TP+FP)</K>.
      </>
    ),
    eksempel: {
      oppgave: <>1 000 000 pakker. 0,01 % er ondsinnede. Sensitivitet 99 %, falsk-positiv-rate 1 %.</>,
      steg: [
        <>Ondsinnede: <K>100</K>. Godartede: <K>999 900</K>.</>,
        <><K>TP = 100 · 0,99 = 99</K>.</>,
        <><K>FP = 999 900 · 0,01 ≈ 9999</K>.</>,
        <><K>99 / (99 + 9999) ≈ 0,0098</K>.</>,
      ],
      svar: (
        <>
          Under 1 % av alarmene er ekte. Med 99 % sensitivitet. Det er derfor SOC-er drukner i
          varsler — og hvorfor falsk-positiv-raten betyr mer enn sensitiviteten.
        </>
      ),
    },
    felle: (
      <>
        <strong>Å lese sensitivitet som presisjon.</strong> «99 % nøyaktig» sier hvor mange angrep
        som fanges, ikke hvor mange alarmer som er ekte. Når hendelsen er sjelden, drukner de ekte i
        de falske.
      </>
    ),
  },
  {
    navn: "Nøkkellengde mot sikkerhetsnivå",
    naar: <>Oppgaven sammenligner RSA og ECC, eller påstår at lengre nøkkel er tryggere.</>,
    oppskrift: (
      <>
        Sammenlign <em>sikkerhetsnivå i bit</em>, ikke nøkkellengde:{" "}
        <K>AES-128 ≈ RSA-3072 ≈ ECC-256</K>. Nøkkellengder er ikke sammenlignbare på tvers av
        algoritmefamilier.
      </>
    ),
    eksempel: {
      oppgave: <>Er RSA-3072 tryggere enn ECDSA-256 fordi tallet er større?</>,
      steg: [
        <>Begge gir ca. <K>128 bit</K> sikkerhetsnivå — altså likt.</>,
        <>RSA-3072-signaturen er ca. <K>384 byte</K>, ECDSA-256 ca. <K>64 byte</K>.</>,
        <>Signering med RSA er dessuten merkbart tyngre.</>,
      ],
      svar: <>Samme sikkerhet, flere byte i hvert håndtrykk og mer CPU. Argumentet om «lengre = tryggere» holder ikke.</>,
    },
    felle: (
      <>
        <strong>Å sammenligne bit på tvers av familier.</strong> 256 hos ECC og 256 hos RSA er ikke i
        nærheten av det samme — RSA-256 ville vært knekt på et blunk.
      </>
    ),
  },
  {
    navn: "Salt — hva det faktisk stopper",
    naar: <>Oppgaver om lekkede passordtabeller, rainbow tables og brute force.</>,
    oppskrift: (
      <>
        Salt gjør <em>forhåndsberegning</em> ubrukelig: hver bruker trenger sin egen tabell. Det
        stopper <strong>ikke</strong> brute force mot én konto — det krever en{" "}
        <em>treg</em> hash (bcrypt, Argon2).
      </>
    ),
    eksempel: {
      oppgave: <>Usaltet SHA-256-tabell lekker. Hvilke to angrep, og hva stopper hvert?</>,
      steg: [
        <>Rainbow table: én ferdig tabell knekker alle like passord samtidig → <strong>salt</strong> stopper det.</>,
        <>Brute force mot én bruker: SHA-256 er rask, milliarder av forsøk i sekundet → salt hjelper ikke.</>,
        <>Mot det andre trengs en <em>bevisst treg</em> hash.</>,
      ],
      svar: <>Salt mot forhåndsberegning, treg hash mot gjetting. To ulike problemer, to ulike svar.</>,
    },
    felle: (
      <>
        <strong>«Vi salter, altså er vi trygge».</strong> Salt gjør ingenting med hvor <em>fort</em>{" "}
        angriperen kan prøve. Rask hash pluss salt er fortsatt svakt.
      </>
    ),
  },
];

// ===========================================================================
// KAPITTEL 9
// ===========================================================================
export const FORBEREDELSE_9: Metode[] = [
  {
    navn: "Pakkeregnskap for sanntid",
    naar: <>Oppgaven gir kodek-bitrate og pakkeintervall og spør om pakkestørrelse eller linjelast.</>,
    oppskrift: (
      <>
        <K>payload = bitrate · intervall / 8</K> byte. Legg på{" "}
        <K>RTP 12 + UDP 8 + IPv4 20 = 40 byte</K>. Linjelast = <K>total · pakkerate</K>.
      </>
    ),
    eksempel: {
      oppgave: <>G.711 på 64 kb/s, én pakke hvert 10. ms.</>,
      steg: [
        <><K>64000 · 0,010 = 640 bit = 80 byte</K> nyttelast.</>,
        <><K>80 + 40 = 120 byte</K> per IP-pakke.</>,
        <>Pakkerate <K>100/s</K> → <K>120 · 8 · 100 = 96 kb/s</K> på linja.</>,
      ],
      svar: <>80 byte nyttelast, 120 byte totalt — 64 kb/s lyd koster 96 kb/s på nettet.</>,
    },
    felle: (
      <>
        <strong>Å oppgi kodek-raten som linjelast.</strong> Ved korte intervaller er headeren halve
        pakken. Lengre intervall gir mindre overhead — men mer forsinkelse.
      </>
    ),
  },
  {
    navn: "Prioritetskø: EF først, resten fordeles",
    naar: <>DiffServ-oppgave med EF, AF og BE og vekter.</>,
    oppskrift: (
      <>
        <K>1)</K> EF tas først, i sin helhet. <K>2)</K> <K>rest = R − EF</K>. <K>3)</K> Fordel{" "}
        <em>resten</em> etter WFQ-vektene. <K>4)</K> Ingen klasse får mer enn den tilbyr.
      </>
    ),
    eksempel: {
      oppgave: <>500 Mb/s lenke. EF = 80 Mb/s konstant. AF tilbyr 400, BE tilbyr 300. Vekter AF:BE = 2:1.</>,
      steg: [
        <>EF får sine <K>80</K>.</>,
        <><K>rest = 500 − 80 = 420</K>.</>,
        <>AF: <K>2/3 · 420 = 280</K>. BE: <K>1/3 · 420 = 140</K>.</>,
        <>Begge tilbyr mer enn de får → begge er begrenset.</>,
      ],
      svar: <>EF 80, AF 280, BE 140 Mb/s. AF og BE opplever kø; EF gjør det praktisk talt ikke.</>,
    },
    felle: (
      <>
        <strong>Å fordele vektene over hele lenken.</strong> Vektene gjelder bare det som er igjen
        etter at prioritetsklassen har forsynt seg.
      </>
    ),
  },
  {
    navn: "Playout-buffer = middel + 4·jitter",
    naar: <>Oppgaven gir målt jitter og spør hvor stort bufferet bør være.</>,
    oppskrift: (
      <>
        <K>buffer ≈ middel-delay + 4·jitter</K>. Fire standardavvik dekker ~99,99 % av en
        normalfordelt ankomstvariasjon.
      </>
    ),
    eksempel: {
      oppgave: <>Middel-delay 30 ms, målt jitter 12 ms.</>,
      steg: [
        <><K>4 · 12 = 48 ms</K>.</>,
        <><K>30 + 48 = 78 ms</K>.</>,
      ],
      svar: (
        <>
          Ca. 78 ms. Kompromisset: større buffer gir færre hakk, men mer forsinkelse — og over ~150
          ms enveis blir en samtale merkbart ubehagelig.
        </>
      ),
    },
    felle: (
      <>
        <strong>Å tro at større buffer er gratis.</strong> For lagret video er det nesten gratis. For
        samtale betaler du direkte i interaktivitet.
      </>
    ),
  },
  {
    navn: "Gjennomsnittlig bitrate fra en GOP",
    naar: <>Oppgaven gir I-, P- og B-rammestørrelser og en GOP-lengde.</>,
    oppskrift: (
      <>
        <K>sum bytes i GOP-en / GOP-varighet</K>, deretter <K>× 8</K> for bit. Vekt hver rammetype
        med <em>antallet</em>, ikke bare størrelsen.
      </>
    ),
    eksempel: {
      oppgave: <>GOP = 30 rammer (1 s ved 30 fps): 1 I à 60 kB, 9 P à 6 kB, 20 B à 2 kB.</>,
      steg: [
        <>I: <K>1 · 60 = 60 kB</K>.</>,
        <>P: <K>9 · 6 = 54 kB</K>.</>,
        <>B: <K>20 · 2 = 40 kB</K>.</>,
        <>Sum <K>154 kB</K> per sekund → <K>154 · 8 = 1232 kb/s</K>.</>,
      ],
      svar: <>Ca. 1,23 Mb/s i snitt — men I-ramma alene er 10× en P-ramme, og den spissen må bufferet tåle.</>,
    },
    felle: (
      <>
        <strong>Å ta snittet av de tre rammestørrelsene.</strong> <K>(60+6+2)/3</K> er meningsløst
        når det er 20 B-rammer og bare én I-ramme. Vekt med antallet.
      </>
    ),
  },
  {
    navn: "Sett inn i MOS-formelen",
    naar: <>Oppgaven gir en E-modell-formel og målte verdier for delay, tap og jitter.</>,
    oppskrift: (
      <>
        Sett inn ett ledd om gangen og trekk fra utgangspunktet. Pass på delere inne i leddene — de
        er lette å overse.
      </>
    ),
    eksempel: {
      oppgave: (
        <>
          <K>MOS ≈ 4,5 − 0,025·delay/10 − 0,5·tap% − 0,02·jitter</K>, med 120 ms delay, 2 % tap, 10 ms jitter.
        </>
      ),
      steg: [
        <>Delay: <K>0,025 · 120/10 = 0,3</K>.</>,
        <>Tap: <K>0,5 · 2 = 1,0</K>.</>,
        <>Jitter: <K>0,02 · 10 = 0,2</K>.</>,
        <><K>4,5 − 0,3 − 1,0 − 0,2</K>.</>,
      ],
      svar: <>MOS = 3,0 — brukbart, men merkbart dårlig. Legg merke til at tapet alene koster mest.</>,
    },
    felle: (
      <>
        <strong>Å overse <K>/10</K> i delay-leddet.</strong> Uten den blir delay-straffen ti ganger
        for stor og svaret negativt — et umulig MOS-tall, som burde få deg til å lete etter feilen.
      </>
    ),
  },
];
