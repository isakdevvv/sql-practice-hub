/**
 * SEC-spor-bit-register. Sikkerhetsdelen av DTE-2507. Bygger på BÅDE OS-sporet
 * (DTE-2505) og DK-sporet (Datakomm-delen av DTE-2507). Hver bit har
 * eksplisitte forutsetninger og krysspeker mot OS-/DK-/F-biter i hovedfagene.
 *
 * Status: kun SEC-01 implementert per 2026-05-20 (pilot). Resten dispatches
 * til parallelle agenter etter brukers godkjenning av pilot-stil.
 */

export type SecFase = {
  id: "SEC1" | "SEC2" | "SEC3" | "SEC4";
  tittel: string;
  blurb: string;
};

export type SecBit = {
  /** Lenkeslug — brukes som ID i ruten /sikkerhet/$slug. */
  slug: string;
  /** Bit-ID fra læreplankartet, f.eks. "SEC-01". */
  bitId: string;
  fase: SecFase["id"];
  tittel: string;
  blurb: string;
  /** Begreper studenten skal kunne etter biten. */
  begreper: string[];
  /** Andre SEC-bit-IDer som må sitte først. */
  forutsetninger: string[];
  /** Krysspeker mot OS-/DK-/F-biter (eller andre SEC) denne biten bygger
   *  på eller åpner opp for. Skrives som "OS-11", "DK-14", "F-11", "SEC-03"
   *  med kort kontekst-tekst. */
  bygger_paa: string[];
  apner_for: string[];
  /** Estimert tid for biten. */
  estimertTid: string;
  /** Implementert? */
  implementert: boolean;
};

export const SEC_FASER: SecFase[] = [
  {
    id: "SEC1",
    tittel: "Kryptografiske prinsipper",
    blurb: "Grunnsteinene: konfidensialitet, integritet, autentisering — og verktøyene som realiserer dem. Symmetrisk og asymmetrisk kryptering, hashing, signaturer, PKI.",
  },
  {
    id: "SEC2",
    tittel: "Sikker kommunikasjon",
    blurb: "Hvordan vi tar krypto-prinsippene fra forrige fase og bygger ekte sikre kanaler — TLS over TCP — og lagrer passord trygt.",
  },
  {
    id: "SEC3",
    tittel: "Trusler og angrep",
    blurb: "Trusselbildet: hva angripere faktisk gjør, og hvorfor det fungerer. Sniffing, DoS, spoofing, malware, phishing — sett fra angripers og forsvars side.",
  },
  {
    id: "SEC4",
    tittel: "Anvendt sikring",
    blurb: "Full konvergens: brannmurer, DMZ, VLAN, OS-herding, IDS, trådløs-sikkerhet, web-server-sikkerhet, sikker web-koding. Her møtes OS-sporet og DK-sporet i praksis.",
  },
];

export const SEC_BITS: SecBit[] = [
  // ============ FASE SEC-1 · Kryptografiske prinsipper ===============
  {
    slug: "sec01-cia-autentisering",
    bitId: "SEC-01",
    fase: "SEC1",
    tittel: "Hva sikkerhet betyr — CIA og autentisering",
    blurb: "Tre bokstaver som rammer inn alt: Konfidensialitet, Integritet, Tilgjengelighet. Pluss autentisering som lim. Du må kunne kategorisere trusler her før du kan løse dem.",
    begreper: ["konfidensialitet", "integritet", "tilgjengelighet", "CIA-triaden", "autentisering"],
    forutsetninger: [],
    bygger_paa: ["F-11 (krypto-intuisjon — vagt nivå)"],
    apner_for: ["alle videre SEC-biter"],
    estimertTid: "12 min",
    implementert: true,
  },
  {
    slug: "sec02-symmetrisk",
    bitId: "SEC-02",
    fase: "SEC1",
    tittel: "Symmetrisk kryptering",
    blurb: "Én nøkkel, to parter. Rask og solid — men hvordan får de tak i nøkkelen uten å gi den til alle andre?",
    begreper: ["symmetrisk nøkkel", "blokkchiffer", "AES", "nøkkeldelings-problemet"],
    forutsetninger: ["SEC-01"],
    bygger_paa: ["F-11"],
    apner_for: ["SEC-03 (motivasjon for asymmetrisk)", "SEC-19 (WPA2)"],
    estimertTid: "14 min",
    implementert: false,
  },
  {
    slug: "sec03-asymmetrisk",
    bitId: "SEC-03",
    fase: "SEC1",
    tittel: "Asymmetrisk kryptering",
    blurb: "Den geniale ideen: to nøkler som hører sammen. Den offentlige låser, den private låser opp. Løser nøkkeldelings-problemet i ett trekk.",
    begreper: ["offentlig nøkkel", "privat nøkkel", "RSA (idé)", "nøkkelpar"],
    forutsetninger: ["SEC-02"],
    bygger_paa: ["F-11"],
    apner_for: ["SEC-05", "SEC-06", "SEC-07 TLS"],
    estimertTid: "15 min",
    implementert: false,
  },
  {
    slug: "sec04-hashing",
    bitId: "SEC-04",
    fase: "SEC1",
    tittel: "Hashing",
    blurb: "Enveis-fingeravtrykk. Knytter integritet og passord-lagring — og en liten endring i input gir helt nytt avtrykk.",
    begreper: ["hash-funksjon", "enveis", "kollisjon", "SHA-256"],
    forutsetninger: ["SEC-01"],
    bygger_paa: ["F-11"],
    apner_for: ["SEC-05", "SEC-08 (passord-lagring)"],
    estimertTid: "12 min",
    implementert: false,
  },
  {
    slug: "sec05-signaturer",
    bitId: "SEC-05",
    fase: "SEC1",
    tittel: "Digitale signaturer",
    blurb: "Kombiner hash + asymmetrisk privat-nøkkel-kryptering. Resultat: bevis på hvem som skrev meldingen, OG at den ikke er endret.",
    begreper: ["signatur", "ikke-benekting", "hash + privat nøkkel", "verifisering"],
    forutsetninger: ["SEC-03", "SEC-04"],
    bygger_paa: [],
    apner_for: ["SEC-06 PKI", "SEC-07 TLS-håndtrykk"],
    estimertTid: "12 min",
    implementert: false,
  },
  {
    slug: "sec06-pki",
    bitId: "SEC-06",
    fase: "SEC1",
    tittel: "Nøkkeldistribusjon og PKI",
    blurb: "Hvordan vet du at en offentlig nøkkel faktisk tilhører nettsiden du tror? Svar: sertifikater + en tillitskjede ned til en CA du stoler på.",
    begreper: ["sertifikat", "sertifikatmyndighet (CA)", "tillitskjede", "PKI"],
    forutsetninger: ["SEC-05"],
    bygger_paa: [],
    apner_for: ["SEC-07 TLS"],
    estimertTid: "13 min",
    implementert: false,
  },
  // ============ FASE SEC-2 · Sikker kommunikasjon ====================
  {
    slug: "sec07-tls",
    bitId: "SEC-07",
    fase: "SEC2",
    tittel: "TLS/SSL — håndtrykk og øktnøkkel",
    blurb: "Klimakset av SEC-1. TCP-håndtrykk + asymmetrisk + sertifikat + symmetrisk øktnøkkel = HTTPS. Steg-for-steg gjennom hva som faktisk skjer når du ser hengelåsen.",
    begreper: ["TLS", "håndtrykk", "øktnøkkel", "HTTPS"],
    forutsetninger: ["SEC-06"],
    bygger_paa: ["DK-14 (TCP-håndtrykk)", "SEC-03 (asymmetrisk)", "SEC-05 (signatur)"],
    apner_for: ["SEC-20", "SEC-21"],
    estimertTid: "18 min",
    implementert: false,
  },
  {
    slug: "sec08-passord",
    bitId: "SEC-08",
    fase: "SEC2",
    tittel: "Autentisering og passord",
    blurb: "Hvorfor du ALDRI lagrer passord i klartekst. Hashing, salt, totrinns, og hva som gjør et passord faktisk sterkt.",
    begreper: ["autentisering", "hashing av passord", "salt", "totrinns"],
    forutsetninger: ["SEC-04"],
    bygger_paa: [],
    apner_for: ["SEC-20 (webserver-auth)"],
    estimertTid: "12 min",
    implementert: false,
  },
  // ============ FASE SEC-3 · Trusler og angrep =======================
  {
    slug: "sec09-trusselbildet",
    bitId: "SEC-09",
    fase: "SEC3",
    tittel: "Trusselbildet",
    blurb: "Hvem angriper, hvorfor, og hva er en angrepsflate? Du må kunne tegne den før du kan forsvare den.",
    begreper: ["angriper", "angrepsflate", "sårbarhet", "risiko"],
    forutsetninger: ["SEC-01"],
    bygger_paa: [],
    apner_for: ["SEC-13"],
    estimertTid: "11 min",
    implementert: false,
  },
  {
    slug: "sec10-sniffing",
    bitId: "SEC-10",
    fase: "SEC3",
    tittel: "Avlytting og sniffing",
    blurb: "Hvorfor ukryptert trafikk på offentlig wifi er like privat som å rope hemmeligheter på flytogperrongen. Mann-i-midten-angrep.",
    begreper: ["sniffing", "pakkeavlytting", "mann-i-midten (MITM)"],
    forutsetninger: [],
    bygger_paa: ["DK-30 (svitsj)", "F-09 (Wireshark)"],
    apner_for: ["SEC-18 (IDS)"],
    estimertTid: "13 min",
    implementert: false,
  },
  {
    slug: "sec11-dos",
    bitId: "SEC-11",
    fase: "SEC3",
    tittel: "Tjenestenektangrep",
    blurb: "Du trenger ikke knekke krypto for å ta ned en tjeneste — du kan bare drukne den. DoS og DDoS, særlig SYN-flood mot TCP.",
    begreper: ["DoS", "DDoS", "oversvømmelse (flooding)", "SYN-flood"],
    forutsetninger: [],
    bygger_paa: ["DK-16 (TCP mengdekontroll)"],
    apner_for: ["SEC-14 (brannmur)"],
    estimertTid: "12 min",
    implementert: false,
  },
  {
    slug: "sec12-spoofing",
    bitId: "SEC-12",
    fase: "SEC3",
    tittel: "Forfalskning — IP- og ARP-spoofing",
    blurb: "Når angriperen lyver om hvem han er på pakke-nivå. ARP-spoofing er den lokale varianten — IP-spoofing den globale.",
    begreper: ["spoofing", "IP-spoofing", "ARP-spoofing"],
    forutsetninger: [],
    bygger_paa: ["DK-31 (ARP)"],
    apner_for: ["SEC-18"],
    estimertTid: "13 min",
    implementert: false,
  },
  {
    slug: "sec13-malware-phishing",
    bitId: "SEC-13",
    fase: "SEC3",
    tittel: "Skadevare og sosial manipulering",
    blurb: "Det enkleste angrepet er å spørre pent. Phishing, malware-kategorier, og hvorfor mennesker er den svakeste lenken.",
    begreper: ["skadevare (malware)", "phishing", "sosial manipulering"],
    forutsetninger: ["SEC-09"],
    bygger_paa: [],
    apner_for: [],
    estimertTid: "11 min",
    implementert: false,
  },
  // ============ FASE SEC-4 · Anvendt sikring =========================
  {
    slug: "sec14-brannmur",
    bitId: "SEC-14",
    fase: "SEC4",
    tittel: "Brannmurer",
    blurb: "Først konvergens-punkt. Krever IP-pakkeforståelse + Linux-tjeneste-styring. Skriv et regelsett: hva skal slippe inn, hva skal stenges ute, og hvorfor.",
    begreper: ["brannmur", "pakkefilter", "regelsett", "tilstandsbasert"],
    forutsetninger: [],
    bygger_paa: ["DK-21 (IP-header)", "OS-31 (tjenester)"],
    apner_for: ["SEC-15", "SEC-20"],
    estimertTid: "15 min",
    implementert: false,
  },
  {
    slug: "sec15-topologier",
    bitId: "SEC-15",
    fase: "SEC4",
    tittel: "Brannmurtopologier — DMZ og soner",
    blurb: "Ikke bare ÉN brannmur. Topologi: hva er i kjernen (intranet), hva er på ytre lag (DMZ), og hva er utenfor. Sone-tenkning.",
    begreper: ["DMZ", "perimetersikring", "sone"],
    forutsetninger: ["SEC-14"],
    bygger_paa: [],
    apner_for: [],
    estimertTid: "12 min",
    implementert: false,
  },
  {
    slug: "sec16-vlan",
    bitId: "SEC-16",
    fase: "SEC4",
    tittel: "VLAN og nettsegmentering",
    blurb: "Logisk inndeling av et fysisk svitsjet nett. Hvorfor gjester ikke skal kunne snakke med produksjons-databasen — selv på samme svitsj.",
    begreper: ["VLAN", "segmentering", "isolasjon av trafikk"],
    forutsetninger: [],
    bygger_paa: ["DK-30 (svitsj)"],
    apner_for: [],
    estimertTid: "12 min",
    implementert: false,
  },
  {
    slug: "sec17-herding",
    bitId: "SEC-17",
    fase: "SEC4",
    tittel: "Herding av Linux-OS",
    blurb: "Andre konvergens-punkt. Ren OS-kunnskap i sikkerhetsbriller: minste privilegium, lukke porter, oppdatering, audit.",
    begreper: ["herding (hardening)", "minste privilegium", "lukke porter", "oppdatering"],
    forutsetninger: [],
    bygger_paa: ["OS-11/14 (rettigheter)", "OS-29 (pakker)", "OS-31 (tjenester)"],
    apner_for: ["SEC-20"],
    estimertTid: "14 min",
    implementert: false,
  },
  {
    slug: "sec18-ids",
    bitId: "SEC-18",
    fase: "SEC4",
    tittel: "Nettverksovervåkning og IDS",
    blurb: "Du kan ikke forhindre alt — så du må SE det. IDS-prinsipper, logging, anomali-deteksjon.",
    begreper: ["innbruddsdeteksjon (IDS)", "logging", "anomali"],
    forutsetninger: ["SEC-10"],
    bygger_paa: ["OS-32 (logger)"],
    apner_for: [],
    estimertTid: "12 min",
    implementert: false,
  },
  {
    slug: "sec19-tradlost",
    bitId: "SEC-19",
    fase: "SEC4",
    tittel: "Trådløs sikkerhet — WPA2/WPA3",
    blurb: "Hvorfor åpen wifi er katastrofe og WPA2 var sårbart, og hva WPA3 endret. Praktisk: hva skal du velge hjemme og på campus?",
    begreper: ["WPA2", "WPA3", "trådløs autentisering", "svakheter"],
    forutsetninger: ["SEC-02"],
    bygger_paa: ["DK-32 (WLAN)"],
    apner_for: [],
    estimertTid: "13 min",
    implementert: false,
  },
  {
    slug: "sec20-webserver",
    bitId: "SEC-20",
    fase: "SEC4",
    tittel: "Webtjener-sikkerhet",
    blurb: "TLS-oppsett som funker, tilgangskontroll, prinsippet om minste privilegium for prosessen som kjører webserveren. Praktisk konfigurasjon.",
    begreper: ["TLS-oppsett", "tjenerherding", "tilgangskontroll"],
    forutsetninger: ["SEC-07", "SEC-17"],
    bygger_paa: [],
    apner_for: ["SEC-21"],
    estimertTid: "14 min",
    implementert: false,
  },
  {
    slug: "sec21-webkoding",
    bitId: "SEC-21",
    fase: "SEC4",
    tittel: "Sikker webprogrammering — OWASP-grunnsteiner",
    blurb: "Injeksjon (SQL/XSS), inputvalidering, CSRF, autentiserings-feil. OWASP topp-10-tankegang for å skrive kode som ikke kan misbrukes.",
    begreper: ["injeksjon (SQL/XSS)", "inputvalidering", "CSRF", "OWASP-tankegang"],
    forutsetninger: ["SEC-20"],
    bygger_paa: ["DK-06 (HTTP)"],
    apner_for: [],
    estimertTid: "16 min",
    implementert: false,
  },
];

export function getBit(slug: string): SecBit | undefined {
  return SEC_BITS.find((b) => b.slug === slug);
}

export function getBitsInPhase(faseId: SecFase["id"]): SecBit[] {
  return SEC_BITS.filter((b) => b.fase === faseId);
}
