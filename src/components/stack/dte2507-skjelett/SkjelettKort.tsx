import { useMemo, useState } from "react";
import { Brain, CalendarClock, CheckCircle2, Eye, RotateCcw } from "lucide-react";
import { Rating } from "@/lib/learn/fsrs";
import { cn } from "@/lib/utils";
import { KORT_TAGGER, RECALL_KORT, type KortTag } from "@/lib/dte2507/skjelettEngine";
import { skjelettFsrs } from "@/lib/dte2507/skjelettKortStore";

// ---------------------------------------------------------------------------
// Oppgavetype 5 — RECALL-KORT med ekte planlegging.
//
// Kortene dekker BARE det som må sitte i hodet: lagrekkefølgen, adressene per
// lag, og headerstørrelsene. Alt annet i modulen er ting du regner ut eller
// slår opp. Samme FSRS-motor som resten av appen, i eget navnerom — se
// `skjelettKortStore.ts` for hvorfor.
// ---------------------------------------------------------------------------

const RATINGS: {
  rating: Rating.Again | Rating.Hard | Rating.Good | Rating.Easy;
  label: string;
  klass: string;
}[] = [
  { rating: Rating.Again, label: "Glemt", klass: "border-rose-500/60 hover:bg-rose-500/10" },
  { rating: Rating.Hard, label: "Tungt", klass: "border-amber-500/60 hover:bg-amber-500/10" },
  { rating: Rating.Good, label: "Greit", klass: "border-emerald-500/60 hover:bg-emerald-500/10" },
  { rating: Rating.Easy, label: "Lett", klass: "border-sky-500/60 hover:bg-sky-500/10" },
];

export function SkjelettKort() {
  const [tag, setTag] = useState<KortTag | "alle">("alle");
  const [pos, setPos] = useState(0);
  const [vis, setVis] = useState(false);
  const [tick, setTick] = useState(0);

  const kortstokk = useMemo(
    () => (tag === "alle" ? RECALL_KORT : RECALL_KORT.filter((k) => k.tag === tag)),
    [tag],
  );

  const kort = kortstokk[pos % Math.max(kortstokk.length, 1)];

  const stats = useMemo(() => {
    void tick;
    const naa = Date.now();
    let nye = 0;
    let forfalt = 0;
    let planlagt = 0;
    for (const k of RECALL_KORT) {
      const s = skjelettFsrs.getCardState(k.id, naa);
      if (s.state === "new") nye++;
      else if (s.due <= naa) forfalt++;
      else planlagt++;
    }
    return { nye, forfalt, planlagt };
  }, [tick]);

  const previews = useMemo(() => {
    void tick;
    return kort ? skjelettFsrs.previewRatings(kort.id) : [];
  }, [kort, tick]);

  const state = useMemo(() => {
    void tick;
    return kort ? skjelettFsrs.getCardState(kort.id) : null;
  }, [kort, tick]);

  function vurder(rating: Rating.Again | Rating.Hard | Rating.Good | Rating.Easy) {
    if (!kort) return;
    skjelettFsrs.recordReview(kort.id, rating);
    setVis(false);
    setPos((p) => (p + 1) % kortstokk.length);
    setTick((t) => t + 1);
  }

  if (!kort) return null;

  return (
    <div className="rounded-xl border-2 border-brand/30 bg-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2.5">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Brain className="h-4 w-4 text-brand" /> Recall-kort
          <span className="text-xs font-normal text-muted-foreground">
            {(pos % kortstokk.length) + 1} / {kortstokk.length}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <CalendarClock className="h-3 w-3" /> {stats.forfalt} forfalt · {stats.nye} nye ·{" "}
            {stats.planlagt} planlagt
          </span>
          <button
            onClick={() => {
              skjelettFsrs.reset();
              setTick((t) => t + 1);
            }}
            className="inline-flex items-center gap-1 hover:text-foreground"
          >
            <RotateCcw className="h-3 w-3" /> Nullstill progresjon
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 border-b px-4 py-2">
        {(["alle", ...KORT_TAGGER.map((t) => t.id)] as const).map((id) => (
          <button
            key={id}
            onClick={() => {
              setTag(id as KortTag | "alle");
              setPos(0);
              setVis(false);
            }}
            className={cn(
              "rounded-full border px-2.5 py-0.5 text-xs hover:bg-accent",
              tag === id && "border-brand bg-brand/10",
            )}
          >
            {id === "alle" ? "Alle" : KORT_TAGGER.find((t) => t.id === id)!.label}
          </button>
        ))}
      </div>

      <div className="p-4">
        <div className="min-h-[10rem] rounded-lg border bg-muted/30 p-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            {KORT_TAGGER.find((t) => t.id === kort.tag)?.label}
            {state && state.state !== "new" && (
              <span className="ml-2 normal-case">
                · sett {state.reps} {state.reps === 1 ? "gang" : "ganger"}
              </span>
            )}
          </div>
          <div className="mt-2 font-medium leading-relaxed">{kort.front}</div>
          {vis ? (
            <div className="mt-3 border-t pt-3 text-sm leading-relaxed">{kort.back}</div>
          ) : (
            <button
              onClick={() => setVis(true)}
              className="mt-4 inline-flex items-center gap-1.5 rounded-md border bg-card px-3 py-1.5 text-sm hover:bg-accent"
            >
              <Eye className="h-3.5 w-3.5" /> Vis svar
            </button>
          )}
        </div>

        {vis && (
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
                    onClick={() => vurder(r.rating)}
                    className={cn(
                      "rounded-lg border-2 bg-card px-2 py-2 text-center transition-colors",
                      r.klass,
                    )}
                  >
                    <div className="text-sm font-medium">{r.label}</div>
                    <div className="text-[11px] text-muted-foreground">{p?.label ?? "—"}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {!vis && (
          <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
            <CheckCircle2 className="h-3 w-3" />
            Prøv å svare høyt før du snur kortet. Det er gjenhentingen som fester stoffet, ikke
            gjenkjennelsen.
          </p>
        )}
      </div>
    </div>
  );
}
