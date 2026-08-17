/**
 * Måloppgavene til nettverksterminalen.
 *
 * Hver oppgave gir et *mål* («finn MAC-adressen til kortet som er i bruk») og
 * sjekker **verdien du fant**, ikke kommandoen du skrev. Det er poenget i
 * PLAN-HOST26-MODULER.md §3.1: det finnes flere kommandoer som gir samme svar,
 * og laben spør etter svaret. Skriver du `ifconfig` eller `ipconfig /all` er
 * likegyldig — du skal ende på a4:83:e7:2f:11:9c.
 *
 * Derfor er normaliseringen romslig med vilje: MAC-adresser godtas med kolon
 * eller bindestrek, i store eller små bokstaver, fordi Windows og Unix skriver
 * dem ulikt og begge er riktige. Det er *ikke* romslig med tall som betyr noe:
 * antall hopp er antall hopp.
 */

import { eksakt, macRens, rens, tall, type Oppgave, type Vurdering } from "../lab/typer";

export type { Oppgave, Vurdering };

/* ------------------------------------------------------------------ oppgaver */

export const OPPGAVER: Oppgave[] = [
  {
    id: "egen-ip",
    tittel: "Din egen IP-adresse",
    oppdrag: "Hvilken IPv4-adresse har maskinen på grensesnittet som faktisk er i bruk?",
    verktoy: "ifconfig / ipconfig",
    hint: "To grensesnitt finnes, men bare ett har en adresse og status «active». Loopback (127.0.0.1) teller ikke — den går aldri ut på nettet.",
    forklaring:
      "10.0.5.37 er en privat adresse: hele 10.0.0.0/8 er reservert til bruk innenfor et lokalt nett og rutes aldri på Internett. Det er derfor du trenger en gateway som oversetter (NAT) for å nå uit.no.",
    fasit: "10.0.5.37",
    sjekk: eksakt("10.0.5.37", rens, [
      { verdi: "127.0.0.1", si: "Det er loopback — maskinen som snakker med seg selv. Den finnes på alle maskiner og sier ingenting om nettet ditt." },
      { verdi: "10.0.5.1", si: "Nesten: det er gatewayen, altså ruteren. Du er ute etter maskinens egen adresse." },
    ]),
  },
  {
    id: "egen-mac",
    tittel: "MAC-adressen",
    oppdrag: "Hva er MAC-adressen til nettverkskortet som er i bruk?",
    verktoy: "ifconfig / ipconfig /all",
    hint: "På Unix heter feltet «ether». På Windows må du bruke «ipconfig /all» — uten /all vises ikke Physical Address i det hele tatt.",
    forklaring:
      "MAC-adressen er brent inn i kortet og brukes bare innenfor ditt eget lokalnett — den kommer aldri lenger enn til gatewayen. IP-adressen er den som følger pakken hele veien. Det er hele grunnen til at begge finnes.",
    fasit: "a4:83:e7:2f:11:9c",
    sjekk: eksakt("a4:83:e7:2f:11:9c", macRens, [
      { verdi: "3c:22:fb:84:60:d1", si: "Det er MAC-adressen til Ethernet-kortet, men kabelen er ikke i — det kortet er ikke i bruk." },
    ]),
  },
  {
    id: "ubrukt-kort",
    tittel: "Kortet som ikke er i bruk",
    oppdrag: "Hvilket grensesnitt er tilstede, men ikke tilkoblet? Svar med Unix-navnet.",
    verktoy: "ifconfig / ipconfig",
    hint: "Se etter «status: inactive» i ifconfig, eller «Media disconnected» i ipconfig.",
    forklaring:
      "En bærbar maskin har typisk både Ethernet og WiFi. Kortet finnes uansett om kabelen er i — derfor har det en MAC-adresse, men ingen IP-adresse. IP-adressen får du først når du er koblet til et nett.",
    fasit: "en1",
    sjekk: eksakt("en1", (s) => rens(s).replace(/^ethernet$/, "en1"), [
      { verdi: "en0", si: "en0 er WiFi-kortet, og det er nettopp det som er tilkoblet." },
      { verdi: "lo0", si: "Loopback er alltid oppe. Se etter et kort med «inactive»." },
    ]),
  },
  {
    id: "gateway",
    tittel: "Veien ut",
    oppdrag: "Hvilken adresse er maskinens standard gateway?",
    verktoy: "ipconfig / traceroute",
    hint: "Enten fra «Default Gateway» i ipconfig — eller les det første hoppet i en traceroute til hvilket som helst mål utenfor nettet ditt.",
    forklaring:
      "Gatewayen er ruteren pakkene sendes til når målet ikke er i ditt eget nett. Derfor er den alltid hopp nummer 1 i en traceroute, uansett hvor du sporer til. Det er en fin dobbeltsjekk på at du leste ipconfig riktig.",
    fasit: "10.0.5.1",
    sjekk: eksakt("10.0.5.1", rens, [
      { verdi: "10.0.5.37", si: "Det er maskinen din. Gatewayen er ruteren pakkene sendes videre til." },
      { verdi: "129.242.9.253", si: "Det er navnetjeneren (DNS). Den slår opp navn — den ruter ikke pakkene dine." },
    ]),
  },
  {
    id: "hopp-uit",
    tittel: "Hvor langt er det til uit.no?",
    oppdrag: "Hvor mange hopp viser traceroute til uit.no til sammen, medregnet målet selv?",
    verktoy: "traceroute / tracert",
    hint: "Tell linjene. Ett av hoppene svarer ikke og vises som «* * *» — det er fortsatt et hopp, og det teller.",
    forklaring:
      "At en ruter svarer «* * *» betyr bare at den er satt opp til å ikke svare på traceroute. Pakken passerte den likevel — nummereringen fortsetter jo. Hopper du over slike linjer når du teller, får du feil svar på nettopp den oppgaven laben liker å stille.",
    fasit: "6",
    sjekk: tall(6, [
      { verdi: 5, si: "Du glemte trolig hoppet som viste «* * *». Det er en ruter som ikke svarer, ikke en ruter som ikke finnes." },
      { verdi: 7, si: "Litt for mange — tell linjene på nytt, målet selv er siste linje." },
    ]),
  },
  {
    id: "cname",
    tittel: "Aliaset og det virkelige navnet",
    oppdrag: "www.uit.no er bare et alias. Hva er det virkelige navnet (canonical name) bak?",
    verktoy: "nslookup",
    hint: "Slå opp www.uit.no. Se på linja som begynner med «Name:» — og legg merke til at «Aliases:» nederst er navnet du spurte om, ikke navnet du fikk.",
    forklaring:
      "Et CNAME lar én maskin ha mange navn. Nettstedet kan flytte til en helt annen leverandør uten at adressen du skriver i nettleseren endrer seg — bare CNAME-oppføringen peker et nytt sted. Det er derfor «Name:» og navnet du søkte på ofte er forskjellige.",
    fasit: "uit-no.cdn.example-edge.net",
    sjekk: eksakt("uit-no.cdn.example-edge.net", (s) => rens(s).replace(/\.$/, ""), [
      { verdi: "www.uit.no", si: "Det er navnet du spurte om — det står som «Aliases» i svaret. Canonical name står på «Name:»-linja." },
    ]),
  },
  {
    id: "revers",
    tittel: "Baklengs oppslag",
    oppdrag: "Hvilket navn hører til adressen 198.51.100.7?",
    verktoy: "nslookup",
    hint: "nslookup tar en IP-adresse like gjerne som et navn. Skriv adressen rett inn.",
    forklaring:
      "Revers-oppslag går i en egen sone (in-addr.arpa) og vedlikeholdes av den som eier adressene — ikke av den som eier navnet. Derfor har mange adresser ingen revers-oppføring i det hele tatt, og derfor kan et revers-oppslag gi et annet navn enn det du startet med.",
    fasit: "arkiv.example.org",
    sjekk: eksakt("arkiv.example.org", (s) => rens(s).replace(/\.$/, "")),
  },
  {
    id: "ipv6",
    tittel: "Den andre adressen",
    oppdrag: "uit.no har både IPv4 og IPv6. Hva er IPv6-adressen?",
    verktoy: "nslookup",
    hint: "IPv6-adressene står som egne «Address:»-linjer, og de har kolon i stedet for punktum.",
    forklaring:
      "IPv4 er 32 bits skrevet som fire tall. IPv6 er 128 bits skrevet som grupper av heksadesimale siffer, der «::» er en forkortelse for en rekke nuller. Mange navn har begge deler i en overgangsperiode som har vart i tjue år.",
    fasit: "2001:700:200:11::36",
    sjekk: eksakt("2001:700:200:11::36", (s) => rens(s).replace(/\s/g, "")),
  },
  {
    id: "stille-vert",
    tittel: "Nede, eller bare taus?",
    oppdrag:
      "arkiv.example.org svarer ikke på ping. Hvor mange hopp får du svar fra i en traceroute dit, før svarene stopper?",
    verktoy: "ping + traceroute",
    hint: "Tell hoppene som viser en adresse og en tid. «* * *»-linjene er de som ikke svarer.",
    forklaring:
      "Tre hopp svarer, så blir det stille. Det forteller deg at pakkene dine kom minst så langt — problemet er ikke nettet ditt eller ruta. Maskinen er sannsynligvis oppe, men har en brannmur som dropper ICMP. «Svarer ikke på ping» er derfor aldri i seg selv bevis på at en maskin er nede, og det er den vanligste feilslutningen i hele denne laben.",
    fasit: "3",
    sjekk: tall(3, [
      { verdi: 4, si: "Det fjerde hoppet er selve målet, og det svarer ikke — se «* * *»." },
      { verdi: 0, si: "Ping fikk ikke svar, men traceroute får svar fra de første ruterne. Kjør traceroute også." },
    ]),
  },
  {
    id: "lytteport",
    tittel: "Hvem lytter på port 22?",
    oppdrag: "Hvilket program lytter på port 22 på denne maskinen?",
    verktoy: "netstat -lp",
    hint: "Skill mellom LISTENING og ESTABLISHED. Ett program lytter på 22; et annet har en utgående forbindelse til port 22 på en annen maskin.",
    forklaring:
      "sshd er tjeneren som tar imot innlogginger — den lytter. ssh er klienten du bruker for å logge inn andre steder — den har en utgående forbindelse til port 22 hos noen andre. Samme portnummer, motsatt retning, to helt ulike ting.",
    fasit: "sshd",
    sjekk: eksakt("sshd", rens, [
      { verdi: "ssh", si: "ssh er klienten, med en utgående forbindelse til 203.0.113.19:22. Du er ute etter den som lytter." },
    ]),
  },
  {
    id: "etablerte",
    tittel: "Hvor mange samtaler pågår?",
    oppdrag: "Hvor mange forbindelser er i tilstanden ESTABLISHED?",
    verktoy: "netstat",
    hint: "Tell alle protokoller, ikke bare TCP. Og pass på: TIME_WAIT er ikke ESTABLISHED — den er en forbindelse som nettopp ble lukket.",
    forklaring:
      "TIME_WAIT er en avsluttet TCP-forbindelse som holdes i noen minutter for å fange opp forsinkede pakker. LISTENING er en port som venter på noen. Bare ESTABLISHED er en samtale som faktisk pågår nå — og det skillet er hele grunnen til at netstat viser en tilstandskolonne.",
    fasit: "4",
    sjekk: tall(4, [
      { verdi: 3, si: "Du glemte trolig UDP-linja til DNS-tjeneren. Den er også ESTABLISHED." },
      { verdi: 5, si: "For mange — TIME_WAIT-linja er en lukket forbindelse, ikke en pågående." },
    ]),
  },
];

/** Oppgave etter id. */
export function oppgaveFor(id: string): Oppgave | undefined {
  return OPPGAVER.find((o) => o.id === id);
}
