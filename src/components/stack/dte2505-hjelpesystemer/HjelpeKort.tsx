import { useMemo, useState } from "react";
import { Brain, Eye, RotateCcw, CalendarClock, CheckCircle2 } from "lucide-react";
import { Rating } from "@/lib/learn/fsrs";
import { cn } from "@/lib/utils";
import { RECALL_CARDS, CARD_TAGS, hjelpesystemerFsrs, type RecallCard } from "@/lib/dte2505/hjelpesystemerKort";

// ---------------------------------------------------------------------------
// Oppgavetype 5 — RECALL-KORT med ekte planlegging.
//
// Kortene bruker den samme FSRS-motoren som resten av appen
// (src/lib/learn/fsrs.ts), men i sitt eget navnerom i localStorage. Det gir
// riktige intervaller uten å røre den globale kortlista — modulen kan derfor
// bygges og merges uten konflikt med andre agenter. Skal kortene senere inn i
// den felles køen (planens §3.4), er det bare å bytte butikk her.
// ---------------------------------------------------------------------------

const RATINGS: { rating: Rating.Again | Rating.Hard | Rating.Good | Rating.Easy; label: string; klass: string }[] = [
  { rating: Rating.Again, label: "Glemt", klass: "border-rose-500/60 hover:bg-rose-500/10" },
  { rating: Rating.Hard, label: "Tungt", klass: "border-amber-500/60 hover:bg-amber-500/10" },
  { rating: Rating.Good, label: "Greit", klass: "border-emerald-500/60 hover:bg-emerald-500/10" },
  { rating: Rating.Easy, label: "Lett", klass: "border-sky-500/60 hover:bg-sky-500/10" },
];

export function HjelpeKort() {
  const [tag, setTag] = useState<RecallCard["tag"] | "alle">("alle");
  const [pos, setPos] = useState(0);
  const [show, setShow] = useState(false);
  const [tick, setTick] = useState(0); // tvinger ny lesing fra FSRS-butikken

  const deck = useMemo(
    () => (tag === "alle" ? RECALL_CARDS : RECALL_CARDS.filter((c) => c.tag === tag)),
    [tag],
  );

  const card = deck[pos % Math.max(deck.length, 1)];

  const stats = useMemo(() => {
    void tick;
    const now = Date.now();
    let nye = 0;
    let forfalt = 0;
    let planlagt = 0;
    for (const c of RECALL_CARDS) {
      const s = hjelpesystemerFsrs.getCardState(c.id, now);
      if (s.state === "new") nye++;
      else if (s.due <= now) forfalt++;
      else planlagt++;
    }
    return { nye, forfalt, planlagt };
  }, [tick]);

  const previews = useMemo(() => {
    void tick;
    return card ? hjelpesystemerFsrs.previewRatings(card.id) : [];
  }, [card, tick]);

  const state = useMemo(() => {
    void tick;
    return card ? hjelpesystemerFsrs.getCardState(card.id) : null;
  }, [card, tick]);

  function grade(rating: Rating.Again | Rating.Hard | Rating.Good | Rating.Easy) {
    if (!card) return;
    hjelpesystemerFsrs.recordReview(card.id, rating);
    setShow(false);
    setPos((p) => (p + 1) % deck.length);
    setTick((t) => t + 1);
  }

  if (!card) return null;

  return (
    <div className="rounded-xl border-2 border-brand/30 bg-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2.5">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Brain className="h-4 w-4 text-brand" /> Recall-kort
          <span className="text-xs font-normal text-muted-foreground">
            {(pos % deck.length) + 1} / {deck.length}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <CalendarClock className="h-3 w-3" /> {stats.forfalt} forfalt · {stats.nye} nye ·{" "}
            {stats.planlagt} planlagt
          </span>
          <button
            onClick={() => {
              hjelpesystemerFsrs.reset();
              setTick((t) => t + 1);
            }}
            className="inline-flex items-center gap-1 hover:text-foreground"
          >
            <RotateCcw className="h-3 w-3" /> Nullstill progresjon
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 border-b px-4 py-2">
        {(["alle", ...CARD_TAGS.map((t) => t.id)] as const).map((id) => (
          <button
            key={id}
            onClick={() => {
              setTag(id as RecallCard["tag"] | "alle");
              setPos(0);
              setShow(false);
            }}
            className={cn(
              "rounded-full border px-2.5 py-0.5 text-xs hover:bg-accent",
              tag === id && "border-brand bg-brand/10",
            )}
          >
            {id === "alle" ? "Alle" : CARD_TAGS.find((t) => t.id === id)!.label}
          </button>
        ))}
      </div>

      <div className="p-4">
        <div className="min-h-[10rem] rounded-lg border bg-muted/30 p-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            {CARD_TAGS.find((t) => t.id === card.tag)?.label}
            {state && state.state !== "new" && (
              <span className="ml-2 normal-case">
                · sett {state.reps} {state.reps === 1 ? "gang" : "ganger"}
              </span>
            )}
          </div>
          <div className="mt-2 font-medium leading-relaxed">{card.front}</div>
          {show ? (
            <div className="mt-3 border-t pt-3 text-sm leading-relaxed">{card.back}</div>
          ) : (
            <button
              onClick={() => setShow(true)}
              className="mt-4 inline-flex items-center gap-1.5 rounded-md border bg-card px-3 py-1.5 text-sm hover:bg-accent"
            >
              <Eye className="h-3.5 w-3.5" /> Vis svar
            </button>
          )}
        </div>

        {show && (
          <div className="mt-3">
            <div className="mb-1.5 text-xs text-muted-foreground">
              Hvor godt satt det? Svaret bestemmer når kortet kommer igjen.
            </div>
            <div className="grid grid-cols-4 gap-2">
              {RATINGS.map((r) => {
                const p = previews.find((x) => x.rating === r.rating);
                return (
                  <button
                    key={r.label}
                    onClick={() => grade(r.rating)}
                    className={cn("rounded-lg border-2 bg-card px-2 py-2 text-center transition-colors", r.klass)}
                  >
                    <div className="text-sm font-medium">{r.label}</div>
                    <div className="text-[11px] text-muted-foreground">{p?.label ?? "—"}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {!show && (
          <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
            <CheckCircle2 className="h-3 w-3" />
            Prøv å svare høyt før du snur kortet. Det er selve gjenhentingen som fester stoffet, ikke
            gjenkjennelsen.
          </p>
        )}
      </div>
    </div>
  );
}
