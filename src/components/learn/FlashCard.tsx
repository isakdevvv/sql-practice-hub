import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { FlashCard as Card } from "@/lib/learn/types";
import { Check, X, RotateCcw } from "lucide-react";
import { VISUALS } from "./visuals/Visuals";
import { previewRatings, Rating, type ReviewRating } from "@/lib/learn/fsrs";

interface FlashCardViewProps {
  card: Card;
  onKnown: () => void;
  onUnknown: () => void;
  onSkip?: () => void;
  /** When set, render FSRS rating buttons (Again/Hard/Good/Easy) instead of
   *  the simple Kunne/Ikke-ennå pair. Called with the chosen rating after a
   *  click; the parent is responsible for persisting via `recordReview`. */
  onRate?: (rating: ReviewRating) => void;
}

export function FlashCardView({ card, onKnown, onUnknown, onRate }: FlashCardViewProps) {
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    setFlipped(false);
  }, [card.id]);

  const useFsrs = !!onRate;

  // Predicted intervals shown on each rating button. Re-computed per card
  // so the labels always reflect the current FSRS state.
  const previews = useMemo(() => {
    if (!useFsrs) return null;
    return previewRatings(card.id);
  }, [card.id, useFsrs]);

  // Keyboard shortcuts:
  // - Space/Enter: flip
  // - FSRS mode (flipped): 1=Again, 2=Hard, 3=Good, 4=Easy
  // - Legacy mode (flipped): ArrowLeft=unknown, ArrowRight=known
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLElement && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) return;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setFlipped((f) => !f);
        return;
      }
      if (!flipped) return;
      if (useFsrs && onRate) {
        if (e.key === "1") onRate(Rating.Again);
        else if (e.key === "2") onRate(Rating.Hard);
        else if (e.key === "3") onRate(Rating.Good);
        else if (e.key === "4") onRate(Rating.Easy);
      } else {
        if (e.key === "ArrowRight") onKnown();
        else if (e.key === "ArrowLeft") onUnknown();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flipped, onKnown, onUnknown, onRate, useFsrs]);

  return (
    <div className="space-y-3">
      <div
        onClick={() => setFlipped((f) => !f)}
        className={cn(
          "relative cursor-pointer select-none rounded-2xl border-2 bg-card transition-all min-h-[280px] flex flex-col p-7",
          flipped ? "border-success/50" : "border-brand/40 hover:border-brand/60",
        )}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
              {card.topic}
            </Badge>
            <span className="text-[10px] text-muted-foreground">{card.id}</span>
          </div>
          <span className="text-[10px] text-muted-foreground hidden sm:inline">
            {flipped
              ? useFsrs
                ? "1=Again · 2=Hard · 3=Good · 4=Easy · mellomrom snur"
                : "← / → for å markere · mellomrom for å snu"
              : "Trykk for å snu (mellomrom)"}
          </span>
        </div>

        <div className="flex-1 flex items-center justify-center">
          {!flipped ? (
            <div className="text-center max-w-xl">
              <div className="text-xs uppercase tracking-wider text-brand mb-3">
                Spørsmål
              </div>
              <h2 className="text-xl md:text-2xl font-semibold leading-snug">
                {card.question}
              </h2>
            </div>
          ) : (
            <div className="w-full max-w-2xl">
              <div className="text-xs uppercase tracking-wider text-success mb-3 text-center">
                Svar
              </div>
              {card.visual && VISUALS[card.visual] ? (
                (() => {
                  const Visual = VISUALS[card.visual]!;
                  return <Visual />;
                })()
              ) : null}
              <p className="text-base leading-relaxed text-foreground/90">
                <InlineCode text={card.answer} />
              </p>
              {card.code ? (
                <pre className="mt-4 rounded-md bg-muted/60 border border-border p-3 text-[11px] font-mono whitespace-pre overflow-x-auto">
                  {card.code}
                </pre>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {useFsrs && previews ? (
        <div className="space-y-2">
          {/* Mobile-first: 2-col on small, 4-col on sm+. Touch-targets are 56px tall. */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <RatingButton
              flipped={flipped}
              tone="again"
              shortcut="1"
              label="Again"
              interval={previews[0].label}
              onClick={() => onRate?.(Rating.Again)}
            />
            <RatingButton
              flipped={flipped}
              tone="hard"
              shortcut="2"
              label="Hard"
              interval={previews[1].label}
              onClick={() => onRate?.(Rating.Hard)}
            />
            <RatingButton
              flipped={flipped}
              tone="good"
              shortcut="3"
              label="Good"
              interval={previews[2].label}
              onClick={() => onRate?.(Rating.Good)}
            />
            <RatingButton
              flipped={flipped}
              tone="easy"
              shortcut="4"
              label="Easy"
              interval={previews[3].label}
              onClick={() => onRate?.(Rating.Easy)}
            />
          </div>
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFlipped((f) => !f)}
              className="text-xs"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
              {flipped ? "Skjul svar" : "Vis svar"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFlipped((f) => !f)}
            className="flex-shrink-0"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
            Snu
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onUnknown}
              disabled={!flipped}
              className="border-destructive/40 text-destructive hover:bg-destructive/10"
            >
              <X className="h-3.5 w-3.5 mr-1.5" />
              Ikke ennå
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onKnown}
              disabled={!flipped}
              className="border-success/40 text-success hover:bg-success/10"
            >
              <Check className="h-3.5 w-3.5 mr-1.5" />
              Kunne!
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function RatingButton({
  flipped,
  tone,
  shortcut,
  label,
  interval,
  onClick,
}: {
  flipped: boolean;
  tone: "again" | "hard" | "good" | "easy";
  shortcut: string;
  label: string;
  interval: string;
  onClick: () => void;
}) {
  // Tone -> color. Same palette as the Anki/SuperMemo conventions students
  // who already use SR will recognize: red/orange/green/blue.
  const styles = {
    again:
      "border-destructive/50 text-destructive hover:bg-destructive/15 disabled:opacity-40",
    hard: "border-warning/50 text-warning hover:bg-warning/15 disabled:opacity-40",
    good: "border-success/50 text-success hover:bg-success/15 disabled:opacity-40",
    easy: "border-brand/50 text-brand hover:bg-brand/15 disabled:opacity-40",
  }[tone];
  return (
    <button
      onClick={onClick}
      disabled={!flipped}
      className={cn(
        "rounded-lg border-2 bg-card px-2 py-2 min-h-[56px] flex flex-col items-center justify-center gap-0.5 transition-colors",
        styles,
        !flipped && "cursor-not-allowed",
      )}
    >
      <div className="flex items-baseline gap-1.5">
        <span className="hidden sm:inline text-[10px] font-mono opacity-60">
          {shortcut}
        </span>
        <span className="text-sm font-semibold">{label}</span>
      </div>
      <span className="text-[11px] font-mono tabular-nums opacity-80">{interval}</span>
    </button>
  );
}

// Render `inline code` segments in a string with monospace styling.
function InlineCode({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code
              key={i}
              className="rounded bg-muted/80 px-1.5 py-0.5 text-[0.85em] font-mono"
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}
