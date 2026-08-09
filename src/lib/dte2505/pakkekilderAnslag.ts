// ---------------------------------------------------------------------------
// Oppgavetype 1 for modul 1b, punkt 1.3: ANSLÅ-SÅ-SJEKK.
//
// Kommer FØR forklaringen. Jobben er å lage et hull hjernen vil fylle. Ingen
// poengsum — man kan ikke stryke på en gjetning.
//
// Rekkefølgen er ikke tilfeldig: den følger scaffolding-kravet. p1 etablerer at
// et pakkearkiv bare er en adresse i en fil, p2 at indeksen er en kopi, p3 at
// signaturen er det som gjør adressen brukbar, p4 hva dpkg mangler, p5–p7 hva
// de alternative formatene faktisk endrer.
// ---------------------------------------------------------------------------

export interface PredictOption {
  id: string;
  label: string;
}

export interface PredictItem {
  id: string;
  setup: string;
  question: string;
  options: PredictOption[];
  correct: string;
  /** Avsløringen: skal forklare mekanismen, ikke bare kåre en vinner. */
  reveal: string;
  punch: string;
}

export const PAKKE_PREDICT_ITEMS: PredictItem[] = [
  {
    id: "pp1",
    setup:
      "Når du skriver `sudo apt install htop`, henter systemet pakken fra et pakkearkiv (engelsk: repository) — en tjener på nettet med ferdigbygde pakker.",
    question: "Hvor står det hvilke arkiver maskinen din henter fra?",
    options: [
      { id: "a", label: "Det er kompilert inn i apt og kan ikke endres" },
      { id: "b", label: "I vanlige tekstfiler: /etc/apt/sources.list og /etc/apt/sources.list.d/" },
      { id: "c", label: "I en database Ubuntu vedlikeholder sentralt" },
      { id: "d", label: "Det bestemmes av hvilken Ubuntu-versjon du kjører, uten at du kan påvirke det" },
    ],
    correct: "b",
    reveal:
      "Det er ren tekst du kan lese med cat. Hver linje er ett arkiv, på formen «deb <adresse> <utgivelse> <komponenter>». Hovedfila er /etc/apt/sources.list, og katalogen /etc/apt/sources.list.d/ inneholder én fil per ekstra kilde — slik at et program som legger til en kilde kan gjøre det uten å redigere din hovedfil.",
    punch: "Å «legge til en programvarekilde» er bokstavelig talt å skrive en linje i en tekstfil.",
  },
  {
    id: "pp2",
    setup:
      "Du legger til et nytt arkiv i kildelista. Arkivet inneholder et program du vil ha.",
    question: "Du kjører `sudo apt install <programmet>` med én gang etterpå. Hva skjer?",
    options: [
      { id: "a", label: "Det installeres — apt sjekker kildene hver gang" },
      { id: "b", label: "«Unable to locate package» — apt slår opp i en lokal indeks som ikke er hentet på nytt" },
      { id: "c", label: "apt spør om du vil oppdatere pakkelista først" },
      { id: "d", label: "Det installeres, men i feil versjon" },
    ],
    correct: "b",
    reveal:
      "apt går aldri ut på nettet for å lete etter en pakke. Den slår opp i en lokal kopi av pakkelistene — indeksen — som bygges av `apt update`. Legger du til en kilde uten å kjøre update, er indeksen fortsatt den gamle, og den nye pakken finnes ikke for apt.",
    punch: "update henter LISTA. install henter pakken. Endrer du kildene, må lista hentes på nytt.",
  },
  {
    id: "pp3",
    setup:
      "Du skriver kildelinja til et tredjepartsarkiv for hånd, men glemmer å legge inn arkivets signeringsnøkkel. Adressen er riktig og tjeneren svarer.",
    question: "Hva gjør `sudo apt update` da?",
    options: [
      { id: "a", label: "Henter lista og advarer, men bruker den likevel" },
      { id: "b", label: "Spør deg om du vil stole på arkivet" },
      { id: "c", label: "Avviser hele arkivet med NO_PUBKEY — innholdet blir usynlig for apt" },
      { id: "d", label: "Laster ned pakkene, men nekter å installere dem" },
    ],
    correct: "c",
    reveal:
      "apt hopper over arkivet fullstendig. GPG (GNU Privacy Guard) signerer pakkelista med arkivets private nøkkel; apt sjekker signaturen med den offentlige nøkkelen den har lagret. Mangler nøkkelen, kan apt ikke bevise at lista er uendret siden arkivet lagde den — og da nekter den heller enn å gjette. Feilen dukker opp igjen senere som «Unable to locate package», langt fra der årsaken var.",
    punch: "Uten nøkkel finnes ikke arkivet, uansett hvor riktig adressen er.",
  },
  {
    id: "pp4",
    setup:
      "Du har lastet ned en løs .deb-fil fra en leverandørs nettside. Den trenger et bibliotek du ikke har installert.",
    question: "Hva gjør `sudo dpkg -i fil.deb`?",
    options: [
      { id: "a", label: "Henter biblioteket automatisk og installerer alt" },
      { id: "b", label: "Nekter å pakke ut noe som helst" },
      { id: "c", label: "Pakker ut filene, men klarer ikke sette opp pakken — den blir liggende halvferdig" },
      { id: "d", label: "Installerer pakken, som så krasjer ved oppstart uten forklaring" },
    ],
    correct: "c",
    reveal:
      "dpkg (Debian Package) er lavnivåverktøyet som håndterer ÉN pakkefil. Den vet ingenting om arkiver og kan derfor ikke hente noe. Den pakker ut filene, oppdager at avhengigheten mangler, og stopper før oppsettssteget. Pakken står da i tilstanden «iU» — unpacked, ikke konfigurert. `sudo apt install -f` rydder opp, og `sudo apt install ./fil.deb` unngår problemet helt fordi apt godtar en filsti og fortsatt kjenner arkivene.",
    punch: "dpkg installerer en fil. apt løser et problem. Skråstreken i ./fil.deb er det som skiller dem.",
  },
  {
    id: "pp5",
    setup:
      "Et PPA (Personal Package Archive) er et personlig pakkearkiv, typisk hos Launchpad, der hvem som helst kan legge ut ferdigbygde pakker for Ubuntu.",
    question: "Hva skjer med maskinen din når du legger til et PPA?",
    options: [
      { id: "a", label: "Bare den ene pakken du ville ha, kan installeres derfra" },
      { id: "b", label: "Arkivet kan levere oppdateringer til ALLE pakker med samme navn — også systempakker" },
      { id: "c", label: "Ubuntu godkjenner PPA-er før de kan brukes" },
      { id: "d", label: "Pakkene derfra kjøres i sandkasse, adskilt fra systemet" },
    ],
    correct: "b",
    reveal:
      "Et PPA er en fullverdig pakkekilde på linje med Ubuntus egne. Uten pinning vinner høyeste versjonsnummer, uansett hvilket arkiv det kommer fra. Legger PPA-et ut en nyere versjon av et systembibliotek, blir det ditt ved neste oppgradering. Ingen godkjenner innholdet — Launchpad bygger det eieren laster opp. Signeringen beviser hvem som lagde pakken, ikke at pakken er trygg.",
    punch: "Å legge til et PPA er å gi en fremmed skriveadgang til systemet ditt, med rot-rettigheter.",
  },
  {
    id: "pp6",
    setup:
      "Snap og flatpak er alternative pakkeformater. En snap-pakke har med seg alle bibliotekene den trenger, inne i selve pakken.",
    question: "Hva er den viktigste konsekvensen av det?",
    options: [
      { id: "a", label: "Pakken blir mindre og starter raskere" },
      { id: "b", label: "Pakken virker på tvers av distribusjoner og kan ikke brekke av en systemoppdatering — men bruker mer diskplass" },
      { id: "c", label: "Pakken må bygges på nytt for hver Ubuntu-versjon" },
      { id: "d", label: "Pakken kan ikke bruke grafikk" },
    ],
    correct: "b",
    reveal:
      "Dette er byttehandelen. En .deb deler bibliotekene med resten av systemet: liten pakke, men den brekker hvis et bibliotek oppgraderes til noe inkompatibelt, og den må bygges for akkurat din distribusjon. En snap tar med alt: samme pakke virker på Ubuntu, Fedora og Debian, og en systemoppdatering kan ikke ødelegge den. Prisen er diskplass, minne og tregere første oppstart.",
    punch: "Delte bibliotek = lite og skjørt. Egne bibliotek = stort og robust. Det finnes ikke et gratis valg.",
  },
  {
    id: "pp7",
    setup:
      "Snap-pakker kjører normalt i en sandkasse: programmet ser bare et begrenset utsnitt av filsystemet ditt.",
    question: "Hvorfor må Visual Studio Code installeres med `snap install code --classic`?",
    options: [
      { id: "a", label: "Fordi den er betalt programvare" },
      { id: "b", label: "Fordi en kodeeditor må nå alle filene dine og kjøre andre programmer — sandkassa må slås av" },
      { id: "c", label: "Fordi den er større enn grensen for vanlige snap-pakker" },
      { id: "d", label: "Fordi den ikke er signert" },
    ],
    correct: "b",
    reveal:
      "«Classic confinement» betyr at sandkassa er slått av og programmet har samme tilgang som en vanlig .deb-installasjon. Utviklingsverktøy trenger det: de skal åpne hvilken som helst fil, kjøre kompilatorer og snakke med systemet. Flagget er ikke en formalitet — det er en bevisst avveining der du gir fra deg beskyttelsen sandkassa gir.",
    punch: "--classic er ikke «tillat installasjon». Det er «slå av sikkerhetsgrensen rundt dette programmet».",
  },
];
