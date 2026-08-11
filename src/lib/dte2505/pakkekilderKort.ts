// ---------------------------------------------------------------------------
// Oppgavetype 5 for modul 1b punkt 1.3: RECALL-KORT.
//
// Bare det som må sitte i hodet. Kommandoene kan slås opp med `man apt`; det
// som ikke kan slås opp er MODELLEN — hva en kilde er, hva indeksen er, hva
// signaturen beviser, og hvilket verktøy som kjenner arkivene.
//
// Egen FSRS-butikk (samme motor som resten av appen, eget navnerom) slik at
// modulen kan bygges og merges uten å røre den globale kortlista.
// ---------------------------------------------------------------------------

import { createFsrsStore } from "@/lib/learn/fsrs";

export const pakkekilderFsrs = createFsrsStore("dte2505-pakkekilder-fsrs-v1");

export interface RecallCard {
  id: string;
  front: string;
  back: string;
  tag: "kilder" | "signering" | "formater";
}

export const PAKKE_RECALL_CARDS: RecallCard[] = [
  // ---- kilder og indeks --------------------------------------------------
  {
    id: "pk-kilde-fil",
    tag: "kilder",
    front: "Hvor står det hvilke pakkearkiver maskinen henter fra?",
    back: "I /etc/apt/sources.list (distribusjonens egne linjer) og i /etc/apt/sources.list.d/ (én fil per ekstra kilde). Begge er ren tekst. Formatet er «deb <adresse> <utgivelse> <komponenter>».",
  },
  {
    id: "pk-update-install",
    tag: "kilder",
    front: "Hva gjør `apt update`, og hvorfor må den kjøres etter at du har lagt til en kilde?",
    back: "Den henter pakkelistene fra alle kildene og bygger den lokale indeksen på nytt. apt slår alltid opp i indeksen, aldri direkte på nettet — så en nylagt kilde er usynlig helt til update har kjørt.",
  },
  {
    id: "pk-ppa",
    tag: "kilder",
    front: "Hva er et PPA, og hva gjør `add-apt-repository ppa:eier/navn`?",
    back: "PPA = Personal Package Archive, et personlig pakkearkiv hos Launchpad. Kommandoen gjør TO ting: skriver kildelinja i sources.list.d/ og henter arkivets signeringsnøkkel. Legger du inn en kilde for hånd, må du gjøre begge selv.",
  },
  {
    id: "pk-ppa-risiko",
    tag: "kilder",
    front: "Hvilken risiko tar du når du legger til et PPA?",
    back: "Arkivet er en fullverdig kilde: uten pinning vinner høyeste versjonsnummer, så det kan levere oppdateringer til hvilken som helst pakke — også systembiblioteker. Pakkene installeres med rot-rettigheter, og ingen godkjenner innholdet. Signaturen beviser hvem som lagde pakken, ikke at den er trygg.",
  },
  {
    id: "pk-foreldrelos",
    tag: "kilder",
    front: "`apt policy` viser Installed nyere enn Candidate. Hva betyr det?",
    back: "Pakken kom fra et sted systemet ikke lenger snakker med — en fjernet PPA eller en løs .deb-fil. Ingen aktiv kilde tilbyr den versjonen, så den får aldri en oppdatering igjen, heller ikke sikkerhetsoppdateringer.",
  },

  // ---- signering ---------------------------------------------------------
  {
    id: "pk-gpg",
    tag: "signering",
    front: "Hva beviser signaturen på et pakkearkiv — og hva beviser den ikke?",
    back: "GPG (GNU Privacy Guard) signerer pakkelista med arkivets private nøkkel. apt sjekker den med den offentlige nøkkelen den har lagret. Det beviser at lista er uendret siden arkivet lagde den, altså opphavet. Det sier ingenting om at innholdet er trygt eller velment.",
  },
  {
    id: "pk-nopubkey",
    tag: "signering",
    front: "`apt update` sier NO_PUBKEY for et arkiv. Hva er konsekvensen?",
    back: "Hele arkivet hoppes over. Innholdet er usynlig for apt, og feilen viser seg først senere som «Unable to locate package» på en pakke du vet finnes. Fiksen er å legge nøkkelen i /etc/apt/keyrings/ og kjøre update på nytt.",
  },
  {
    id: "pk-signedby",
    tag: "signering",
    front: "Hvorfor er `apt-key` avviklet til fordel for /etc/apt/keyrings/ og signed-by=?",
    back: "apt-key la nøkkelen i én felles nøkkelring som gjaldt ALLE arkiver. Da kunne et tredjepartsarkiv signere pakker som utga seg for å komme fra Ubuntu. signed-by= i kildelinja binder nøkkelen til nøyaktig ett arkiv.",
  },

  // ---- formater ----------------------------------------------------------
  {
    id: "pk-dpkg-apt",
    tag: "formater",
    front: "Forskjellen på `dpkg -i fil.deb` og `apt install ./fil.deb`?",
    back: "dpkg håndterer ÉN fil og kjenner ingen arkiver — mangler en avhengighet, blir pakken liggende halvferdig (status iU). apt godtar samme fil, men henter avhengighetene fra arkivene og fullfører. Skråstreken i ./fil.deb er nødvendig: uten den tolker apt navnet som et pakkenavn.",
  },
  {
    id: "pk-fix-broken",
    tag: "formater",
    front: "En pakke står som «iU» i `dpkg -l`. Hva betyr det, og hva fikser det?",
    back: "iU = unpacked, ikke konfigurert: filene ligger der, men oppsettssteget stoppet på en manglende avhengighet. `sudo apt install -f` (fix-broken) henter det som mangler og fullfører oppsettet.",
  },
  {
    id: "pk-snap-deb",
    tag: "formater",
    front: "Hva er byttehandelen mellom en .deb-pakke og en snap?",
    back: ".deb deler bibliotekene med resten av systemet: liten pakke, men bundet til distribusjonen og sårbar for at et bibliotek oppgraderes til noe inkompatibelt. En snap tar med alle bibliotekene sine: virker på tvers av distribusjoner og tåler systemoppdateringer, men bruker mer disk og minne og starter tregere første gang.",
  },
  {
    id: "pk-sandkasse",
    tag: "formater",
    front: "Hva betyr `--classic` når du installerer en snap?",
    back: "Sandkassa slås av, og programmet får samme tilgang som en vanlig .deb-installasjon. Utviklingsverktøy krever det fordi de må nå alle filer og kjøre andre programmer. Det er en bevisst avveining, ikke en formalitet.",
  },
  {
    id: "pk-flatpak",
    tag: "formater",
    front: "Hva må på plass før `flatpak install` kan gjøre noe på et Ubuntu-system?",
    back: "To ting: flatpak-programmet må installeres med apt (det følger ikke med Ubuntu, i motsetning til snap), og et fjernarkiv må legges til — vanligvis flathub. Flatpak har sitt eget kildebegrep, helt adskilt fra /etc/apt/sources.list.",
  },
  {
    id: "pk-tre-systemer",
    tag: "formater",
    front: "Samme program er installert som .deb, snap og flatpak. Hvilket starter når du skriver navnet?",
    back: "Den PATH treffer først — ofte /snap/bin. De tre vet ikke om hverandre og har hver sin oppsettskatalog (~/.config, ~/snap/, ~/.var/app/), så innstillinger ser ut til å forsvinne. `which <navn>` viser hvilken fil som faktisk kjøres.",
  },
];

export const PAKKE_CARD_TAGS: { id: RecallCard["tag"]; label: string }[] = [
  { id: "kilder", label: "Kilder og indeks" },
  { id: "signering", label: "Signering og tillit" },
  { id: "formater", label: "Formater og verktøy" },
];
