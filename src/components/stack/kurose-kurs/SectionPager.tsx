import { ArrowLeft, ArrowRight, BookOpen } from "lucide-react";

export type SectionNavItem = {
  id: string;
  label: string;
};

/**
 * Forrige/neste-knapper INNI et kapittel — for å gå fra seksjon til seksjon
 * (1.1 → 1.2 → 1.3 ...) uten å hoppe til tab-baren på toppen.
 *
 * Når man står på siste seksjon (typisk oppgaver-tab) viser "Neste"-knappen
 * neste kapittel hvis det er angitt.
 */
export function SectionPager({
  tabs,
  current,
  onPick,
  nextChapter,
}: {
  tabs: SectionNavItem[];
  current: string;
  onPick: (id: string) => void;
  nextChapter?: { slug: string; title: string } | null;
}) {
  const idx = tabs.findIndex((t) => t.id === current);
  if (idx === -1) return null;
  const prev = idx > 0 ? tabs[idx - 1] : null;
  const nextInChapter = idx < tabs.length - 1 ? tabs[idx + 1] : null;
  // På siste seksjon i kapittelet: "neste"-knappen blir til "neste kapittel"
  const atEnd = !nextInChapter && nextChapter;

  function scrollToTop() {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return (
    <nav className="mt-6 grid gap-3 sm:grid-cols-2 border-t border-border pt-4">
      {prev ? (
        <button
          onClick={() => {
            onPick(prev.id);
            scrollToTop();
          }}
          className="group flex items-center gap-3 rounded-xl border border-border bg-card p-3 text-left transition-all hover:border-brand/60"
        >
          <ArrowLeft className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-brand transition-colors" />
          <div className="min-w-0 flex-1">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Forrige del
            </div>
            <div className="truncate text-sm font-semibold">{prev.label}</div>
          </div>
        </button>
      ) : (
        <div aria-hidden className="hidden sm:block" />
      )}

      {nextInChapter ? (
        <button
          onClick={() => {
            onPick(nextInChapter.id);
            scrollToTop();
          }}
          className="group flex items-center gap-3 rounded-xl border border-brand/40 bg-brand/5 p-3 text-left transition-all hover:border-brand hover:bg-brand/10 sm:flex-row-reverse sm:text-right"
        >
          <ArrowRight className="h-4 w-4 shrink-0 text-brand transition-transform group-hover:translate-x-0.5" />
          <div className="min-w-0 flex-1">
            <div className="text-[10px] uppercase tracking-wider text-brand/80">
              Neste del
            </div>
            <div className="truncate text-sm font-semibold">{nextInChapter.label}</div>
          </div>
        </button>
      ) : atEnd ? (
        <a
          href={`/stack/${nextChapter.slug}`}
          className="group flex items-center gap-3 rounded-xl border border-success/40 bg-success/5 p-3 transition-all hover:border-success hover:bg-success/10 sm:flex-row-reverse sm:text-right"
        >
          <ArrowRight className="h-4 w-4 shrink-0 text-success transition-transform group-hover:translate-x-0.5" />
          <div className="min-w-0 flex-1">
            <div className="text-[10px] uppercase tracking-wider text-success/80">
              Neste kapittel
            </div>
            <div className="truncate text-sm font-semibold">{nextChapter.title}</div>
          </div>
        </a>
      ) : (
        <a
          href="/stack/kurose-kurs"
          className="group flex items-center gap-3 rounded-xl border border-brand/40 bg-brand/5 p-3 transition-all hover:border-brand sm:flex-row-reverse sm:text-right"
        >
          <BookOpen className="h-4 w-4 shrink-0 text-brand" />
          <div className="min-w-0 flex-1">
            <div className="text-[10px] uppercase tracking-wider text-brand/80">
              Slutt på kapittelet
            </div>
            <div className="truncate text-sm font-semibold">Tilbake til kurs-oversikten</div>
          </div>
        </a>
      )}
    </nav>
  );
}
