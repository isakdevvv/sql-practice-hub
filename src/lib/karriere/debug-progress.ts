import { DEBUG_BUGS, type BugKategori } from "./debug-bugs";

const STORAGE_KEY = "karriere.debug-jakt.v1";

export interface BugAttempt {
  /** Antall ganger brukeren har trykket "Kjør test" på denne bug-en. */
  forsok: number;
  /** Om alle tester passerer. */
  lost: boolean;
  /** Tid (ms) fra første visning til løsning. */
  tidMs?: number;
  /** ISO-tidsstempel for løsning. */
  lostAt?: string;
  /** Om "Vis hint" er brukt. */
  hintBrukt?: boolean;
  /** Om "Vis fasit" er brukt. */
  fasitBrukt?: boolean;
}

export interface DebugProgress {
  attempts: Record<string, BugAttempt>;
}

const EMPTY: DebugProgress = { attempts: {} };

export function loadDebugProgress(): DebugProgress {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    return { ...EMPTY, ...(JSON.parse(raw) as DebugProgress) };
  } catch {
    return EMPTY;
  }
}

export function saveDebugProgress(p: DebugProgress) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

/** Hent eller initier attempt-data for én bug. */
export function getAttempt(p: DebugProgress, bugId: string): BugAttempt {
  return p.attempts[bugId] ?? { forsok: 0, lost: false };
}

export function updateAttempt(bugId: string, patch: Partial<BugAttempt>): DebugProgress {
  const p = loadDebugProgress();
  const eksist = getAttempt(p, bugId);
  p.attempts[bugId] = { ...eksist, ...patch };
  saveDebugProgress(p);
  return p;
}

// ----------------------------------------------------------------------------
// Aggregert statistikk
// ----------------------------------------------------------------------------

export interface DebugStats {
  loste: number;
  totalt: number;
  snittTidSec?: number;
  snittForsok?: number;
  perKategori: Array<{
    kategori: BugKategori;
    loste: number;
    totalt: number;
    snittForsok?: number;
  }>;
  vanskeligsteKategori?: BugKategori;
  jegerNiva: JegerNiva;
}

export interface JegerNiva {
  navn: string;
  beskrivelse: string;
  fra: number;
  til: number;
}

export const JEGER_NIVAER: readonly JegerNiva[] = [
  { navn: "Nybegynner", beskrivelse: "Du finner de åpenbare bug-ene.", fra: 0, til: 5 },
  { navn: "Apprentice", beskrivelse: "Du ser mønstre i koden.", fra: 6, til: 12 },
  { navn: "Senior", beskrivelse: "Du lukter NULL-feller før de inntreffer.", fra: 13, til: 18 },
  { navn: "Detektiv", beskrivelse: "Ingen bug går klar.", fra: 19, til: 20 },
];

function nivaFor(loste: number): JegerNiva {
  for (const n of JEGER_NIVAER) {
    if (loste >= n.fra && loste <= n.til) return n;
  }
  return JEGER_NIVAER[0];
}

export function computeStats(p: DebugProgress = loadDebugProgress()): DebugStats {
  const totalt = DEBUG_BUGS.length;
  const lostBugs = DEBUG_BUGS.filter((b) => p.attempts[b.id]?.lost);
  const loste = lostBugs.length;

  const tider = lostBugs.map((b) => p.attempts[b.id]?.tidMs).filter((t): t is number => !!t);
  const forsokListe = lostBugs.map((b) => p.attempts[b.id]?.forsok ?? 0).filter((f) => f > 0);

  const snittTidSec = tider.length ? Math.round(tider.reduce((a, b) => a + b, 0) / tider.length / 1000) : undefined;
  const snittForsok = forsokListe.length
    ? Math.round((forsokListe.reduce((a, b) => a + b, 0) / forsokListe.length) * 10) / 10
    : undefined;

  const kategoriMap = new Map<BugKategori, { loste: number; totalt: number; forsok: number[] }>();
  for (const b of DEBUG_BUGS) {
    const eksist = kategoriMap.get(b.kategori) ?? { loste: 0, totalt: 0, forsok: [] };
    eksist.totalt += 1;
    const a = p.attempts[b.id];
    if (a?.lost) eksist.loste += 1;
    if (a?.forsok) eksist.forsok.push(a.forsok);
    kategoriMap.set(b.kategori, eksist);
  }

  const perKategori = Array.from(kategoriMap.entries()).map(([kategori, v]) => ({
    kategori,
    loste: v.loste,
    totalt: v.totalt,
    snittForsok: v.forsok.length
      ? Math.round((v.forsok.reduce((a, b) => a + b, 0) / v.forsok.length) * 10) / 10
      : undefined,
  }));

  // "Vanskeligst" = den kategorien med høyest snitt antall forsøk (blant de
  // hvor brukeren har gjort minst ett ærlig forsøk).
  const medForsok = perKategori.filter((k) => k.snittForsok && k.snittForsok > 1);
  const vanskeligsteKategori = medForsok.sort(
    (a, b) => (b.snittForsok ?? 0) - (a.snittForsok ?? 0),
  )[0]?.kategori;

  return {
    loste,
    totalt,
    snittTidSec,
    snittForsok,
    perKategori,
    vanskeligsteKategori,
    jegerNiva: nivaFor(loste),
  };
}

/** Simulert global statistikk (kun frontend-mockup) — "X% av brukere fant
 *  denne bug-en på under 5 forsøk". Tallene er fast pr. bug-id basert på
 *  vanskelighetsgrad, så de er konsistente mellom views. */
export function fellesStat(bugId: string): { andelUnder5: number } {
  // Deterministisk pseudo-tilfeldig: hash bugId → 30-90%
  let h = 0;
  for (let i = 0; i < bugId.length; i++) h = (h * 31 + bugId.charCodeAt(i)) | 0;
  const andel = 30 + (Math.abs(h) % 60);
  return { andelUnder5: andel };
}
