// Fremdrift for skjerm-baserte kurs. Egen localStorage-nøkkel så den gamle
// progress-shapen (`sql-practice-progress-v1`) er urørt.
//
// Vi lagrer sette skjermer, ikke en prosent: da kan et undertema vokse med
// nye skjermer uten at fremdriften blir feil i etterkant.

const KEY = "kurs.fremdrift.v1";

type Lager = {
  /** "<fag>/<undertema>" -> liste med sette skjerm-id-er. */
  sett: Record<string, string[]>;
  /** "<fag>/<undertema>" -> ISO-tidspunkt for fullført. */
  fullfort: Record<string, string>;
};

const TOM: Lager = { sett: {}, fullfort: {} };

function les(): Lager {
  if (typeof window === "undefined") return TOM;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return TOM;
    const parsed = JSON.parse(raw) as Partial<Lager>;
    return { sett: parsed.sett ?? {}, fullfort: parsed.fullfort ?? {} };
  } catch {
    return TOM;
  }
}

function skriv(l: Lager) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(l));
    window.dispatchEvent(new CustomEvent("kurs-fremdrift"));
  } catch {
    /* full disk / privat modus — fremdrift er ikke kritisk nok til å bråke */
  }
}

function nokkel(fag: string, undertema: string) {
  return `${fag}/${undertema}`;
}

export function setteSkjermer(fag: string, undertema: string): Set<string> {
  return new Set(les().sett[nokkel(fag, undertema)] ?? []);
}

export function markerSett(fag: string, undertema: string, skjermId: string) {
  const l = les();
  const k = nokkel(fag, undertema);
  const na = new Set(l.sett[k] ?? []);
  if (na.has(skjermId)) return;
  na.add(skjermId);
  l.sett[k] = [...na];
  skriv(l);
}

export function markerFullfort(fag: string, undertema: string) {
  const l = les();
  const k = nokkel(fag, undertema);
  if (l.fullfort[k]) return;
  l.fullfort[k] = new Date().toISOString();
  skriv(l);
}

export function erFullfort(fag: string, undertema: string): boolean {
  return Boolean(les().fullfort[nokkel(fag, undertema)]);
}

/** Andel sette skjermer, 0-1. `antall` er dagens antall skjermer i undertemaet. */
export function andel(fag: string, undertema: string, antall: number): number {
  if (antall <= 0) return 0;
  return Math.min(1, setteSkjermer(fag, undertema).size / antall);
}

/** Første skjerm studenten ikke har sett — der "Fortsett" skal lande. */
export function fortsettIndeks(fag: string, undertema: string, ider: readonly string[]): number {
  const sett = setteSkjermer(fag, undertema);
  const i = ider.findIndex((id) => !sett.has(id));
  return i < 0 ? 0 : i;
}
