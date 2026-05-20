/**
 * Forkurs-bit-register. F-sporet er broen mellom DTE-2505 (OS) og DTE-2507
 * (Datakomm/Sikkerhet). Hver bit har eksplisitte forutsetninger og peker
 * fram til hvilke OS-/DK-/SEC-biter den åpner opp.
 *
 * Status: kun F-01 implementert per 2026-05-20. Resten er placeholder så
 * hub-en kan vise hele løypen før pilot-godkjenning.
 */

export type Fag = "DTE-2505" | "DTE-2507" | "begge";

export type ForkursFase = {
  id: "F1" | "F2" | "F3" | "F4";
  tittel: string;
  blurb: string;
};

export type ForkursBit = {
  /** Lenkeslug — brukes som ID i ruten /forkurs/$slug. */
  slug: string;
  /** Bit-ID fra læreplankartet, f.eks. "F-01". */
  bitId: string;
  fase: ForkursFase["id"];
  tittel: string;
  blurb: string;
  /** Begreper studenten skal kunne etter biten. */
  begreper: string[];
  /** Andre F-bit-IDer som må sitte først (kun F-IDer her). */
  forutsetninger: string[];
  /** Hvilke OS-/DK-/SEC-biter denne åpner opp for. */
  bygger_grunnlag_for: string[];
  /** Hvilket fag biten primært serverer (eller "begge"). */
  fag: Fag;
  /** Estimert tid å gjøre biten. */
  estimertTid: string;
  /** Implementert? Hvis false viser hub-en "kommer snart". */
  implementert: boolean;
};

export const FORKURS_FASER: ForkursFase[] = [
  {
    id: "F1",
    tittel: "Verktøykassa",
    blurb: "Du må ha et trygt sted å eksperimentere. Virtuell maskin, snapshots, terminal — det fysiske grunnlaget for alt OS- og nettverkslab senere.",
  },
  {
    id: "F2",
    tittel: "Programmeringsoppfriskning",
    blurb: "Python-grunnstein. Trenger du for socket-programmering (DK-10), automatisering og senere ML/AI-fagene.",
  },
  {
    id: "F3",
    tittel: "Nettverksintuisjon",
    blurb: "Hva skjer egentlig når du klikker en lenke? Bygger forventninger før Kurose-pensumet starter.",
  },
  {
    id: "F4",
    tittel: "Tall og krypto-intuisjon",
    blurb: "Binær og hex som du må kunne lese for IP-adresser og pakke-headere. Krypto kun som idé, ingen matte ennå.",
  },
];

export const FORKURS_BITS: ForkursBit[] = [
  // ============ FASE F1 ===========================================
  {
    slug: "f01-virtualisering",
    bitId: "F-01",
    fase: "F1",
    tittel: "Virtualisering — hva og hvorfor",
    blurb: "Hva er en virtuell maskin egentlig? Hvorfor trenger vi den i begge fag? Bygger fundamentet for all OS-lab og nettverks-eksperimentering.",
    begreper: ["virtuell maskin", "hypervisor", "host vs guest", "isolasjon"],
    forutsetninger: [],
    bygger_grunnlag_for: ["F-02", "OS-01", "F-09 (Wireshark trenger trygt miljø)"],
    fag: "begge",
    estimertTid: "12 min",
    implementert: true,
  },
  {
    slug: "f02-installer-vm",
    bitId: "F-02",
    fase: "F1",
    tittel: "Installer VirtualBox + Ubuntu",
    blurb: "Steg-for-steg-guide til å sette opp Ubuntu i en VM. Den maskinen kommer du til å bruke hele semesteret.",
    begreper: ["ISO", "disk-image", "RAM-allokering", "virtuell disk"],
    forutsetninger: ["F-01"],
    bygger_grunnlag_for: ["F-03", "F-04", "alle OS-lab"],
    fag: "begge",
    estimertTid: "20 min",
    implementert: true,
  },
  {
    slug: "f03-snapshots",
    bitId: "F-03",
    fase: "F1",
    tittel: "Snapshots og trygg eksperimentering",
    blurb: "Hvordan ta snapshot, ødelegge noe med vilje, og rulle tilbake. Sikkerhetsnett for alle senere lab-er.",
    begreper: ["snapshot", "rollback", "tilstand"],
    forutsetninger: ["F-02"],
    bygger_grunnlag_for: ["alle videre lab"],
    fag: "begge",
    estimertTid: "8 min",
    implementert: true,
  },
  {
    slug: "f04-terminal",
    bitId: "F-04",
    fase: "F1",
    tittel: "Åpne terminalen",
    blurb: "Ledetekst, shell, første kommandoer. Smør for hånda før OS-2 starter med ekte filsystem-navigering.",
    begreper: ["ledetekst (prompt)", "shell", "kommando"],
    forutsetninger: ["F-02"],
    bygger_grunnlag_for: ["OS-05", "OS-06"],
    fag: "DTE-2505",
    estimertTid: "8 min",
    implementert: true,
  },
  // ============ FASE F2 ===========================================
  {
    slug: "f05-python-grunn",
    bitId: "F-05",
    fase: "F2",
    tittel: "Python-grunnstein (rask repetisjon)",
    blurb: "Variabel, if/else, løkke, funksjon, liste, dict. Diagnostisk quiz pluss fyll-ut-kode.",
    begreper: ["variabel", "datatype", "if/else", "løkke", "funksjon", "liste", "dict"],
    forutsetninger: [],
    bygger_grunnlag_for: ["F-06", "DK-10"],
    fag: "DTE-2507",
    estimertTid: "25 min",
    implementert: true,
  },
  {
    slug: "f06-filer-python",
    bitId: "F-06",
    fase: "F2",
    tittel: "Lese og skrive filer i Python",
    blurb: "open, read, write, with-blokk, filsti. Forutsetning for socket-programmering.",
    begreper: ["open", "read", "write", "with-blokk", "filsti"],
    forutsetninger: ["F-05"],
    bygger_grunnlag_for: ["DK-10"],
    fag: "DTE-2507",
    estimertTid: "15 min",
    implementert: true,
  },
  // ============ FASE F3 ===========================================
  {
    slug: "f07-nettside-flyt",
    bitId: "F-07",
    fase: "F3",
    tittel: "Hva skjer når du åpner en nettside",
    blurb: "Animert klient→server→svar-flyt. Det store bildet før vi graver oss inn i protokollene.",
    begreper: ["klient", "server", "forespørsel/svar", "det store bildet"],
    forutsetninger: [],
    bygger_grunnlag_for: ["DK-01", "DK-06"],
    fag: "DTE-2507",
    estimertTid: "10 min",
    implementert: true,
  },
  {
    slug: "f08-ip-port",
    bitId: "F-08",
    fase: "F3",
    tittel: "IP-adresse og port",
    blurb: "Adresse = bygning, port = leilighet. Lokal vs offentlig — uten å forklare NAT ennå.",
    begreper: ["IP-adresse", "port", "lokal vs offentlig"],
    forutsetninger: ["F-07"],
    bygger_grunnlag_for: ["DK-19", "DK-20"],
    fag: "DTE-2507",
    estimertTid: "10 min",
    implementert: true,
  },
  {
    slug: "f09-wireshark-ping",
    bitId: "F-09",
    fase: "F3",
    tittel: "Wireshark, ping og traceroute",
    blurb: "Praktisk: fang trafikk i VM-en, les pakkeliste, mål latens med ping og traceroute.",
    begreper: ["pakke", "ping", "traceroute", "latens"],
    forutsetninger: ["F-02", "F-08"],
    bygger_grunnlag_for: ["DK-23", "SEC-10"],
    fag: "DTE-2507",
    estimertTid: "15 min",
    implementert: true,
  },
  // ============ FASE F4 ===========================================
  {
    slug: "f10-binaer-hex",
    bitId: "F-10",
    fase: "F4",
    tittel: "Binær og heksadesimal",
    blurb: "Interaktiv omregner pluss drilløvelser. Vi bruker dette for IP-adresser, subnett og pakke-headere.",
    begreper: ["base 2", "base 16", "bit", "byte", "omregning"],
    forutsetninger: [],
    bygger_grunnlag_for: ["DK-20", "DK-21"],
    fag: "begge",
    estimertTid: "12 min",
    implementert: true,
  },
  {
    slug: "f11-krypto-intuisjon",
    bitId: "F-11",
    fase: "F4",
    tittel: "Hva ER kryptering (overflate)",
    blurb: "Symmetrisk, asymmetrisk, hash, signatur — kun ideene. Ingen matte. Bygger intuisjon før SEC-1.",
    begreper: ["symmetrisk", "asymmetrisk", "hash", "signatur"],
    forutsetninger: [],
    bygger_grunnlag_for: ["SEC-01", "SEC-02", "SEC-03"],
    fag: "DTE-2507",
    estimertTid: "10 min",
    implementert: true,
  },
];

export function getBit(slug: string): ForkursBit | undefined {
  return FORKURS_BITS.find((b) => b.slug === slug);
}

export function getBitsInPhase(faseId: ForkursFase["id"]): ForkursBit[] {
  return FORKURS_BITS.filter((b) => b.fase === faseId);
}
