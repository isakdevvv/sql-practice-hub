// ---------------------------------------------------------------------------
// Oppgavetype 5 — RECALL-KORT for nettverkslaben.
//
// Bare det som MÅ sitte i hodet 9. desember. Alt som kan slås opp i en terminal
// står ikke her — du har jo terminalen. Det som står her er de fire skillene
// laben er bygget rundt, pluss de to feltnavnene man faktisk må huske for å
// finne dem igjen (`ether` og `/all`), fordi de er de eneste stedene i laben
// der en glemt streng stopper deg helt.
//
// Kortene meldes inn i den FELLES køen (src/lib/learn/modulKort.ts), ikke bare
// vist her. Det er kravet i PLAN-HOST26-MODULER.md §3.4: en kø per modul er en
// kø ingen åpner igjen. Storen under deles av begge stedene, så framdriften er
// den samme uansett hvor kortet repeteres.
// ---------------------------------------------------------------------------

import { createFsrsStore } from "@/lib/learn/fsrs";

export const nettverkFsrs = createFsrsStore("dte2507-nettverk-fsrs-v1");

export interface NettverkKort {
  id: string;
  front: string;
  back: string;
  tag: "skiller" | "verktøyvalg";
}

export const NETTVERK_KORT: NettverkKort[] = [
  // ---- de fire skillene --------------------------------------------------
  {
    id: "nvk-mac-ip",
    tag: "skiller",
    front: "MAC-adresse eller IP-adresse — hvilken følger pakken hele veien?",
    back: "IP-adressen. MAC-adressen gjelder bare innenfor ett lokalnett og byttes ut på hvert hopp. Derfor trengs begge: IP for å finne fram gjennom nettet, MAC for å levere det siste stykket på lenka.",
  },
  {
    id: "nvk-alias-cname",
    tag: "skiller",
    front: "I et nslookup-svar: hva står på «Name:»-linja, og hva står under «Aliases:»?",
    back: "«Name:» er det virkelige navnet (canonical name). «Aliases:» er navnet du spurte om. Et CNAME lar én maskin ha mange navn, slik at nettstedet kan flytte uten at adressen du skriver endrer seg.",
  },
  {
    id: "nvk-ping-nede",
    tag: "skiller",
    front: "En maskin svarer ikke på ping. Hva vet du da?",
    back: "Nesten ingenting. En brannmur som dropper ICMP er umulig å skille fra en maskin som er av — begge er stille. «Svarer ikke på ping» er aldri i seg selv bevis på at en maskin er nede.",
  },
  {
    id: "nvk-gateway",
    tag: "skiller",
    front: "Hvorfor må gatewayen ligge i ditt eget adresseområde?",
    back: "Fordi du trenger en gateway for å nå noe utenfor nettet ditt. Lå gatewayen utenfor, måtte du gått via en gateway for å nå gatewayen. Den er derfor alltid første hopp i en traceroute.",
  },
  {
    id: "nvk-stjerner",
    tag: "skiller",
    front: "traceroute viser «* * *» på hopp 4 av 6. Hva betyr det for tellinga?",
    back: "At ruteren ikke svarer på traceroute — ikke at hoppet ikke finnes. Pakken passerte, nummereringen fortsetter, og hoppet teller. Hopper du over slike linjer, teller du feil.",
  },
  {
    id: "nvk-listening",
    tag: "skiller",
    front: "netstat: hva skiller LISTENING, ESTABLISHED og TIME_WAIT?",
    back: "LISTENING er en port som venter på noen. ESTABLISHED er en samtale som pågår nå. TIME_WAIT er en nettopp lukket forbindelse som holdes noen minutter for å fange opp forsinkede pakker.",
  },

  // ---- de to strengene man faktisk må huske ------------------------------
  {
    id: "nvk-ether-felt",
    tag: "verktøyvalg",
    front: "Hvilket felt viser MAC-adressen — på Unix, og på Windows?",
    back: "På Unix: «ether» i ifconfig. På Windows: «Physical Address», og bare med «ipconfig /all» — uten /all vises den ikke i det hele tatt.",
  },
  {
    id: "nvk-revers",
    tag: "verktøyvalg",
    front: "Hvilket verktøy gir deg navnet bak en IP-adresse, og hvorfor mangler svaret ofte?",
    back: "nslookup tar en adresse like gjerne som et navn. Revers-oppslag bor i en egen sone (in-addr.arpa) som vedlikeholdes av den som eier adressene — ikke av den som eier navnet. Derfor er den ofte tom.",
  },
];
