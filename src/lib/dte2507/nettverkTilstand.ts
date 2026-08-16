/**
 * Det etterlignede nettet som kommandoene i Lab 1 kjører mot.
 *
 * Hvorfor en tilstandsmaskin og ikke ferdigskrevne utdata-strenger: laben
 * tester at du kan *lese* utdata og trekke en konklusjon. Skriver vi svarene
 * som tekst, kan oppgavene bare sjekke om du husket teksten. Med en tilstand
 * kan `ping` og `traceroute` regne ut sine egne tall fra samme rutetabell, og
 * oppgavene kan spørre etter verdien du fant — ikke etter kommandoen du skrev.
 * (PLAN-HOST26-MODULER.md §3.1.)
 *
 * Tallene er oppdiktede, men konsistente: MAC-adressene har gyldige
 * produsentprefikser, RTT-ene vokser med avstanden, og DNS-sonen har de samme
 * mønstrene laben viser fram — et alias som peker på et canonical name, et
 * navn med både IPv4 og IPv6, og en adresse som kan slås opp baklengs.
 */

/** Et nettverkskort i maskinen — det `ifconfig`/`ipconfig` lister. */
export interface Grensesnitt {
  /** Navnet i Linux/macOS, f.eks. "en0". */
  navn: string;
  /** Navnet Windows viser, f.eks. "Wi-Fi". */
  windowsNavn: string;
  slag: "ethernet" | "wifi" | "loopback";
  /** Er kabelen i / er WiFi tilkoblet? */
  oppe: boolean;
  ipv4?: string;
  nettmaske?: string;
  ipv6?: string;
  /** MAC-adressen. Loopback har ingen. */
  mac?: string;
  /** Standard gateway — ruteren pakkene sendes til når målet er utenfor nettet. */
  gateway?: string;
}

/** Ett hopp på veien til et mål, slik `traceroute` lister dem. */
export interface Hopp {
  ip: string;
  /** Navnet revers-oppslaget gir. Utelatt når hoppet ikke har PTR-record. */
  navn?: string;
  /** Rundturstid i millisekunder, som gjennomsnitt av de tre målingene. */
  rtt: number;
  /**
   * Rutere som er satt opp til å ikke svare på traceroute. De vises som
   * `* * *` — og det er en av tingene laben pleier å spørre om.
   */
  stille?: boolean;
}

/** En DNS-oppføring i den etterlignede sonen. */
export interface DnsPost {
  navn: string;
  /** Canonical name, når `navn` bare er et alias. */
  cname?: string;
  ipv4: string[];
  ipv6?: string[];
  /**
   * Svarte navnetjeneren fra sitt eget cache? Da er svaret
   * «non-authoritative», som er formuleringen laben bruker.
   */
  autoritativ?: boolean;
}

/** En åpen forbindelse eller lyttende port, som `netstat` lister. */
export interface Forbindelse {
  protokoll: "TCP" | "UDP";
  lokalAdresse: string;
  lokalPort: number;
  fjernAdresse: string;
  fjernPort: number;
  tilstand: "ESTABLISHED" | "LISTENING" | "TIME_WAIT" | "CLOSE_WAIT" | "SYN_SENT";
  /** Programmet som eier forbindelsen. */
  program?: string;
}

/* ------------------------------------------------------------------ maskina */

export const GRENSESNITT: Grensesnitt[] = [
  {
    navn: "lo0",
    windowsNavn: "Loopback Pseudo-Interface 1",
    slag: "loopback",
    oppe: true,
    ipv4: "127.0.0.1",
    nettmaske: "255.0.0.0",
    ipv6: "::1",
  },
  {
    navn: "en0",
    windowsNavn: "Wi-Fi",
    slag: "wifi",
    oppe: true,
    ipv4: "10.0.5.37",
    nettmaske: "255.255.255.0",
    ipv6: "fe80::14b2:7d3a:9c01:5e88",
    mac: "a4:83:e7:2f:11:9c",
    gateway: "10.0.5.1",
  },
  {
    navn: "en1",
    windowsNavn: "Ethernet",
    slag: "ethernet",
    // Kabelen er ikke i. Det er med vilje: laben spør ofte om hvilket
    // grensesnitt som faktisk er i bruk, og da må det finnes ett som ikke er.
    oppe: false,
    mac: "3c:22:fb:84:60:d1",
  },
];

/** Navnetjeneren maskinen bruker — den `nslookup` viser som «Default Server». */
export const NAVNETJENER = {
  navn: "dns-cache.uit.no",
  ip: "129.242.9.253",
};

/* --------------------------------------------------------------------- DNS */

export const DNS_SONE: DnsPost[] = [
  {
    navn: "uit.no",
    ipv4: ["129.242.5.36"],
    ipv6: ["2001:700:200:11::36"],
    autoritativ: true,
  },
  {
    navn: "www.uit.no",
    cname: "uit-no.cdn.example-edge.net",
    ipv4: ["151.101.66.133", "151.101.130.133"],
  },
  {
    navn: "uit-no.cdn.example-edge.net",
    ipv4: ["151.101.66.133", "151.101.130.133"],
  },
  {
    navn: "fabrikken.example.no",
    ipv4: ["203.0.113.19"],
    ipv6: ["2001:db8:4f2::19"],
  },
  {
    navn: "arkiv.example.org",
    ipv4: ["198.51.100.7"],
  },
];

/** Revers-sone: IP → navn. Det `nslookup <ip>` svarer med. */
export const REVERS_SONE: Record<string, string> = {
  "129.242.5.36": "uit.no",
  "151.101.66.133": "edge-151-101-66-133.example-edge.net",
  "151.101.130.133": "edge-151-101-130-133.example-edge.net",
  "203.0.113.19": "fabrikken.example.no",
  "198.51.100.7": "arkiv.example.org",
  "10.0.5.1": "gw.hjemmenett.lan",
  "129.242.9.253": "dns-cache.uit.no",
};

/* ------------------------------------------------------------------- ruting */

/**
 * Veien fra maskinen til hvert mål. Første hoppet er alltid gatewayen —
 * det er den observasjonen laben er ute etter når den spør «hva er det første
 * traceroute viser, og hvorfor?».
 */
export const RUTER: Record<string, Hopp[]> = {
  "129.242.5.36": [
    { ip: "10.0.5.1", navn: "gw.hjemmenett.lan", rtt: 1.4 },
    { ip: "84.208.16.1", navn: "bras-tr1.example-isp.no", rtt: 8.7 },
    { ip: "84.208.4.9", navn: "core-tromso.example-isp.no", rtt: 11.2 },
    { ip: "128.39.0.42", rtt: 13.9, stille: true },
    { ip: "128.39.46.2", navn: "tromso-gw.uninett.no", rtt: 15.1 },
    { ip: "129.242.5.36", navn: "uit.no", rtt: 15.8 },
  ],
  "203.0.113.19": [
    { ip: "10.0.5.1", navn: "gw.hjemmenett.lan", rtt: 1.3 },
    { ip: "84.208.16.1", navn: "bras-tr1.example-isp.no", rtt: 9.1 },
    { ip: "62.115.9.14", navn: "sto-transit.example-carrier.net", rtt: 31.6 },
    { ip: "203.0.113.1", rtt: 44.2 },
    { ip: "203.0.113.19", navn: "fabrikken.example.no", rtt: 45.0 },
  ],
  "198.51.100.7": [
    { ip: "10.0.5.1", navn: "gw.hjemmenett.lan", rtt: 1.5 },
    { ip: "84.208.16.1", navn: "bras-tr1.example-isp.no", rtt: 8.9 },
    { ip: "62.115.9.14", navn: "sto-transit.example-carrier.net", rtt: 30.8 },
    // Maskinen svarer ikke på ICMP. Traceroute stopper altså aldri av seg
    // selv her — den går til maks antall hopp. Det forvirrer folk hver gang.
    { ip: "198.51.100.7", rtt: 0, stille: true },
  ],
  "151.101.66.133": [
    { ip: "10.0.5.1", navn: "gw.hjemmenett.lan", rtt: 1.2 },
    { ip: "84.208.16.1", navn: "bras-tr1.example-isp.no", rtt: 7.9 },
    { ip: "151.101.66.133", navn: "edge-151-101-66-133.example-edge.net", rtt: 9.4 },
  ],
  "10.0.5.1": [{ ip: "10.0.5.1", navn: "gw.hjemmenett.lan", rtt: 1.3 }],
  "127.0.0.1": [{ ip: "127.0.0.1", navn: "localhost", rtt: 0.05 }],
};

/**
 * Verter som ikke svarer på ping/ICMP. At en maskin ikke svarer betyr *ikke*
 * at den er nede — den kan ha en brannmur som dropper ICMP. Det skillet er
 * hele poenget med ping-delen av laben.
 */
export const SVARER_IKKE_PA_PING = new Set(["198.51.100.7"]);

/* ----------------------------------------------------------------- netstat */

export const FORBINDELSER: Forbindelse[] = [
  {
    protokoll: "TCP",
    lokalAdresse: "10.0.5.37",
    lokalPort: 51422,
    fjernAdresse: "129.242.5.36",
    fjernPort: 443,
    tilstand: "ESTABLISHED",
    program: "firefox",
  },
  {
    protokoll: "TCP",
    lokalAdresse: "10.0.5.37",
    lokalPort: 51430,
    fjernAdresse: "151.101.66.133",
    fjernPort: 443,
    tilstand: "ESTABLISHED",
    program: "firefox",
  },
  {
    protokoll: "TCP",
    lokalAdresse: "10.0.5.37",
    lokalPort: 51401,
    fjernAdresse: "203.0.113.19",
    fjernPort: 22,
    tilstand: "ESTABLISHED",
    program: "ssh",
  },
  {
    protokoll: "TCP",
    lokalAdresse: "10.0.5.37",
    lokalPort: 51388,
    fjernAdresse: "151.101.130.133",
    fjernPort: 443,
    tilstand: "TIME_WAIT",
  },
  {
    protokoll: "TCP",
    lokalAdresse: "0.0.0.0",
    lokalPort: 22,
    fjernAdresse: "0.0.0.0",
    fjernPort: 0,
    tilstand: "LISTENING",
    program: "sshd",
  },
  {
    protokoll: "TCP",
    lokalAdresse: "127.0.0.1",
    lokalPort: 5432,
    fjernAdresse: "0.0.0.0",
    fjernPort: 0,
    tilstand: "LISTENING",
    program: "postgres",
  },
  {
    protokoll: "UDP",
    lokalAdresse: "10.0.5.37",
    lokalPort: 58201,
    fjernAdresse: "129.242.9.253",
    fjernPort: 53,
    tilstand: "ESTABLISHED",
    program: "mDNSResponder",
  },
];

/* ----------------------------------------------------------------- hjelpere */

/** Grensesnittet som faktisk brukes til å nå omverdenen. */
export function aktivtGrensesnitt(): Grensesnitt {
  const g = GRENSESNITT.find((x) => x.oppe && x.slag !== "loopback" && x.ipv4);
  if (!g) throw new Error("Ingen aktive grensesnitt — tilstanden er ugyldig.");
  return g;
}

/** Slår opp et navn i DNS-sonen. Ikke versalfølsomt, slik ekte DNS. */
export function slaOppNavn(navn: string): DnsPost | undefined {
  const n = navn.toLowerCase().replace(/\.$/, "");
  return DNS_SONE.find((p) => p.navn.toLowerCase() === n);
}

/**
 * Løser et navn *eller* en IP til en IPv4-adresse. Følger CNAME ett steg,
 * slik en resolver gjør.
 */
export function tilIpv4(navnEllerIp: string): string | undefined {
  if (/^\d+\.\d+\.\d+\.\d+$/.test(navnEllerIp)) return navnEllerIp;
  const post = slaOppNavn(navnEllerIp);
  if (!post) return undefined;
  if (post.ipv4.length > 0) return post.ipv4[0];
  if (post.cname) return slaOppNavn(post.cname)?.ipv4[0];
  return undefined;
}

/** Ruta til et mål, eller `undefined` om vi ikke har en. */
export function ruteTil(ip: string): Hopp[] | undefined {
  return RUTER[ip];
}
