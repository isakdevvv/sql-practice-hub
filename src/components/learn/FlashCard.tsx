import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { FlashCard as Card } from "@/lib/learn/types";
import { Check, X, RotateCcw } from "lucide-react";
import { VISUALS } from "./visuals/Visuals";

interface FlashCardViewProps {
  card: Card;
  onKnown: () => void;
  onUnknown: () => void;
  onSkip?: () => void;
}

export function FlashCardView({ card, onKnown, onUnknown }: FlashCardViewProps) {
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    setFlipped(false);
  }, [card.id]);

  // Keyboard: space/enter = flip, ArrowLeft = unknown, ArrowRight = known
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLElement && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) return;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (e.key === "ArrowRight" && flipped) {
        onKnown();
      } else if (e.key === "ArrowLeft" && flipped) {
        onUnknown();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flipped, onKnown, onUnknown]);

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
          <span className="text-[10px] text-muted-foreground">
            {flipped ? "← / → for å markere · mellomrom for å snu" : "Trykk for å snu (mellomrom)"}
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
    </div>
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
