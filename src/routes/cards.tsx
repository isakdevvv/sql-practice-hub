import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { FlashCardView } from "@/components/learn/FlashCard";
import { FLASHCARDS, CARD_CATEGORIES } from "@/lib/learn/flashcards";
import {
  loadCardProgress,
  markKnown,
  markUnknown,
  resetCards,
  type CardProgress,
} from "@/lib/learn/cardProgress";
import type { CardCategory } from "@/lib/learn/types";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Shuffle, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/cards")({
  head: () => ({
    meta: [
      { title: "Repetisjonskort — SQL Sandbox" },
      {
        name: "description",
        content:
          "Snu-kort med begreper, SQL, Flask, HTTP og sikkerhet — lett repetisjon før eksamen.",
      },
    ],
  }),
  component: CardsPage,
});

function shuffle<T>(arr: T[]): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function CardsPage() {
  const [progress, setProgress] = useState<CardProgress | null>(null);
  const [category, setCategory] = useState<CardCategory | "all">("all");
  const [onlyUnknown, setOnlyUnknown] = useState(false);
  const [shuffled, setShuffled] = useState(false);
  const [pos, setPos] = useState(0);

  useEffect(() => {
    setProgress(loadCardProgress());
  }, []);

  const deck = useMemo(() => {
    let cards = FLASHCARDS.slice();
    if (category !== "all") cards = cards.filter((c) => c.category === category);
    if (onlyUnknown && progress) {
      cards = cards.filter(
        (c) => !progress.known[c.id] || progress.unknown[c.id],
      );
    }
    if (shuffled) cards = shuffle(cards);
    return cards;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, onlyUnknown, shuffled, progress?.known, progress?.unknown]);

  // Reset position when deck shape changes
  useEffect(() => {
    setPos(0);
  }, [category, onlyUnknown, shuffled]);

  const card = deck[pos];

  const knownCount = progress
    ? Object.keys(progress.known).filter((id) =>
        FLASHCARDS.some((c) => c.id === id),
      ).length
    : 0;
  const totalCards = FLASHCARDS.length;
  const pct = totalCards ? (knownCount / totalCards) * 100 : 0;

  function go(delta: number) {
    if (deck.length === 0) return;
    setPos((p) => (p + delta + deck.length) % deck.length);
  }

  function handleKnown() {
    if (!card) return;
    setProgress(markKnown(card.id));
    go(1);
  }

  function handleUnknown() {
    if (!card) return;
    setProgress(markUnknown(card.id));
    go(1);
  }

  function handleReset() {
    if (!confirm("Nullstille fremdrift på alle kort?")) return;
    setProgress(resetCards());
  }

  if (!progress) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">
          Laster…
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-6 flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Repetisjonskort</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Snu kortet for å se svaret. Marker om du kunne det eller må øve mer.
            </p>
          </div>
          <Button size="sm" variant="ghost" onClick={handleReset}>
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Nullstill
          </Button>
        </div>

        {/* Progress bar */}
        <div className="rounded-xl border border-border bg-card p-4 mb-5">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold">
              {knownCount} av {totalCards} kort markert som «kunne»
            </span>
            <span className="text-muted-foreground">{Math.round(pct)}%</span>
          </div>
          <ProgressBar value={pct} />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <button
            onClick={() => setCategory("all")}
            className={cn(
              "rounded-full border px-3 py-1 text-xs transition-colors",
              category === "all"
                ? "border-brand bg-brand/10 text-brand"
                : "border-border text-muted-foreground hover:bg-accent",
            )}
          >
            Alle ({FLASHCARDS.length})
          </button>
          {CARD_CATEGORIES.map((cat) => {
            const count = FLASHCARDS.filter((c) => c.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs transition-colors",
                  category === cat.id
                    ? "border-brand bg-brand/10 text-brand"
                    : "border-border text-muted-foreground hover:bg-accent",
                )}
              >
                {cat.label} ({count})
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-6 text-xs">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={onlyUnknown}
              onChange={(e) => setOnlyUnknown(e.target.checked)}
              className="accent-brand"
            />
            <span className="text-muted-foreground">Bare ikke-mestrede</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={shuffled}
              onChange={(e) => setShuffled(e.target.checked)}
              className="accent-brand"
            />
            <Shuffle className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">Tilfeldig rekkefølge</span>
          </label>
        </div>

        {deck.length === 0 || !card ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
            Ingen kort i denne bunken. Endre filtre eller velg en annen kategori.
          </div>
        ) : (
          <>
            <FlashCardView
              key={card.id}
              card={card}
              onKnown={handleKnown}
              onUnknown={handleUnknown}
            />

            <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
              <Button size="sm" variant="ghost" onClick={() => go(-1)}>
                <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                Forrige
              </Button>
              <div className="flex items-center gap-2">
                <span>
                  {pos + 1} / {deck.length}
                </span>
                {progress.known[card.id] ? (
                  <Badge variant="outline" className="border-success/40 text-success">
                    ✓ kunne
                  </Badge>
                ) : progress.unknown[card.id] ? (
                  <Badge variant="outline" className="border-destructive/40 text-destructive">
                    øv mer
                  </Badge>
                ) : null}
              </div>
              <Button size="sm" variant="ghost" onClick={() => go(1)}>
                Neste
                <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
