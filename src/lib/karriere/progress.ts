/**
 * Progress-tracking for kode-lesnings-modulen.
 *
 * Lagrer i localStorage under sin egen nøkkel — uavhengig av SQL-progress.
 * Per snippet sporer vi:
 *   - om brukeren har gjennomgått den
 *   - brukerens svar på hvert spørsmål (for tilbake-å-se-på)
 *   - nytte-vurdering (ja / sånn / nei)
 *   - tidspunkt
 */

const STORAGE_KEY = "karriere-kode-lesning-v1";

export type Helpfulness = "ja" | "sånn" | "nei";

export interface SnippetRecord {
  /** True hvis brukeren har trykket "Vis fasit". */
  reviewed: boolean;
  /** Brukerens svar per spørsmål, indeksert. For MC: indeks som string. */
  answers: Record<number, string>;
  helpfulness?: Helpfulness;
  reviewedAt?: string;
}

export interface KodeLesningProgress {
  records: Record<string, SnippetRecord>;
}

const EMPTY: KodeLesningProgress = { records: {} };

export function loadKodeLesningProgress(): KodeLesningProgress {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<KodeLesningProgress>;
    return { records: { ...EMPTY.records, ...(parsed.records ?? {}) } };
  } catch {
    return EMPTY;
  }
}

export function saveKodeLesningProgress(p: KodeLesningProgress): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

export function recordAnswer(snippetId: string, questionIndex: number, answer: string): void {
  const p = loadKodeLesningProgress();
  const prev = p.records[snippetId] ?? { reviewed: false, answers: {} };
  prev.answers[questionIndex] = answer;
  p.records[snippetId] = prev;
  saveKodeLesningProgress(p);
}

export function markReviewed(snippetId: string): void {
  const p = loadKodeLesningProgress();
  const prev = p.records[snippetId] ?? { reviewed: false, answers: {} };
  prev.reviewed = true;
  prev.reviewedAt = new Date().toISOString();
  p.records[snippetId] = prev;
  saveKodeLesningProgress(p);
}

export function recordHelpfulness(snippetId: string, helpful: Helpfulness): void {
  const p = loadKodeLesningProgress();
  const prev = p.records[snippetId] ?? { reviewed: false, answers: {} };
  prev.helpfulness = helpful;
  p.records[snippetId] = prev;
  saveKodeLesningProgress(p);
}

export function getSnippetRecord(snippetId: string): SnippetRecord | undefined {
  return loadKodeLesningProgress().records[snippetId];
}

export interface KodeLesningStats {
  reviewedCount: number;
  totalCount: number;
  /** Snitt av nytte-vurdering: ja=5, sånn=3, nei=1. På 5-skala. */
  averageScore: number | null;
  helpfulCounts: { ja: number; sånn: number; nei: number };
}

export function computeStats(totalCount: number): KodeLesningStats {
  const p = loadKodeLesningProgress();
  const reviewed = Object.values(p.records).filter((r) => r.reviewed);
  const ratings = reviewed
    .map((r) => r.helpfulness)
    .filter((h): h is Helpfulness => Boolean(h));
  const counts = { ja: 0, sånn: 0, nei: 0 };
  for (const h of ratings) counts[h] += 1;
  let avg: number | null = null;
  if (ratings.length > 0) {
    const sum = ratings.reduce(
      (acc, h) => acc + (h === "ja" ? 5 : h === "sånn" ? 3 : 1),
      0,
    );
    avg = sum / ratings.length;
  }
  return {
    reviewedCount: reviewed.length,
    totalCount,
    averageScore: avg,
    helpfulCounts: counts,
  };
}
