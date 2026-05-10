import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { FLASHCARDS, CARD_CATEGORIES } from "@/lib/learn/flashcards";
import {
  loadCardProgress,
  markKnown,
  markUnknown,
  resetCards,
  type CardProgress,
} from "@/lib/learn/cardProgress";
import type { CardCategory, FlashCard } from "@/lib/learn/types";
import { VISUALS } from "@/components/learn/visuals/Visuals";
import { cn } from "@/lib/utils";
import { Check, X, ArrowRight, Trophy, RefreshCw, Shuffle } from "lucide-react";

export const Route = createFileRoute("/cards")({
  head: () => ({
    meta: [
      { title: "Quiz — SQL Sandbox" },
      {
        name: "description",
        content:
          "Quiz med svar-alternativer for begreper, SQL, Flask, HTTP og sikkerhet. Lærer ved å sammenligne — ikke bare flippe et kort.",
      },
    ],
  }),
  component: QuizPage,
});

function shuffle<T>(arr: T[]): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

interface QuizQuestion {
  card: FlashCard;
  options: { text: string; correct: boolean; sourceId: string }[];
}

// Velg distraktorer fra samme topic (mest forvirrende → best læring),
// fall tilbake til samme kategori om det er <3 same-topic-kort.
function buildQuestion(card: FlashCard, pool: FlashCard[]): QuizQuestion {
  const sameTopic = pool.filter((c) => c.id !== card.id && c.topic === card.topic);
  const sameCategory = pool.filter(
    (c) => c.id !== card.id && c.category === card.category && c.topic !== card.topic,
  );
  const distractors = shuffle(sameTopic).slice(0, 3);
  const fallback = shuffle(sameCategory);
  while (distractors.length < 3 && fallback.length > 0) {
    const next = fallback.shift();
    if (next) distractors.push(next);
  }
  while (distractors.length < 3) {
    const random = pool[Math.floor(Math.random() * pool.length)];
    if (random.id !== card.id && !distractors.some((d) => d.id === random.id)) {
      distractors.push(random);
    }
  }
  const options = shuffle([
    { text: card.answer, correct: true, sourceId: card.id },
    ...distractors.map((d) => ({ text: d.answer, correct: false, sourceId: d.id })),
  ]);
  return { card, options };
}

function QuizPage() {
  const [progress, setProgress] = useState<CardProgress>({
    known: {},
    unknown: {},
    lastSeen: {},
  });
  const [activeCategory, setActiveCategory] = useState<CardCategory | "alle">("alle");
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [chosenIdx, setChosenIdx] = useState<number | null>(null);

  useEffect(() => {
    setProgress(loadCardProgress());
  }, []);

  const filteredPool = useMemo(
    () =>
      activeCategory === "alle"
        ? FLASHCARDS
        : FLASHCARDS.filter((c) => c.category === activeCategory),
    [activeCategory],
  );

  // Pekepinn: prioriter ikke-sett, så ukjente, så kjente.
  function pickNextCard(prog: CardProgress, pool: FlashCard[]): FlashCard {
    const unseen = pool.filter((c) => !prog.known[c.id] && !prog.unknown[c.id]);
    const wrong = pool.filter((c) => prog.unknown[c.id]);
    const right = pool.filter((c) => prog.known[c.id]);
    const pickFrom =
      unseen.length > 0
        ? unseen
        : wrong.length > 0
          ? wrong
          : right.length > 0
            ? right
            : pool;
    return pickFrom[Math.floor(Math.random() * pickFrom.length)];
  }

  function newQuestion() {
    if (filteredPool.length === 0) {
      setQuestion(null);
      return;
    }
    const card = pickNextCard(progress, filteredPool);
    setQuestion(buildQuestion(card, filteredPool));
    setChosenIdx(null);
  }

  // Ny quiz når kategorien endres eller appen åpnes
  useEffect(() => {
    newQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory, filteredPool.length]);

  function chooseAnswer(idx: number) {
    if (chosenIdx !== null || !question) return;
    setChosenIdx(idx);
    const correct = question.options[idx].correct;
    if (correct) {
      const next = markKnown(question.card.id);
      setProgress(next);
      setStreak((s) => {
        const newStreak = s + 1;
        setBestStreak((b) => Math.max(b, newStreak));
        return newStreak;
      });
    } else {
      const next = markUnknown(question.card.id);
      setProgress(next);
      setStreak(0);
    }
  }

  function nextOrRetry() {
    if (chosenIdx !== null && question && !question.options[chosenIdx].correct) {
      // Etter feil: vis samme spørsmål en gang til (ny shuffle av alternativer)
      setQuestion(buildQuestion(question.card, filteredPool));
      setChosenIdx(null);
      return;
    }
    newQuestion();
  }

  function reset() {
    if (typeof window !== "undefined" && !window.confirm("Nullstill all quiz-progresjon?"))
      return;
    setProgress(resetCards());
    setStreak(0);
    setBestStreak(0);
    newQuestion();
  }

  const knownCount = filteredPool.filter((c) => progress.known[c.id]).length;
  const unknownCount = filteredPool.filter((c) => progress.unknown[c.id]).length;
  const seenCount = knownCount + unknownCount;
  const accuracy = seenCount > 0 ? Math.round((knownCount / seenCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Quiz</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Velg riktig svar blant fire. Distraktorene er hentet fra samme tema —
            du lærer ved å sammenligne, ikke bare flippe et kort.
          </p>
        </div>

        {/* Stats + kategori-velger */}
        <div className="grid sm:grid-cols-[1fr_auto] gap-4 mb-5 items-end">
          <div>
            <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
              Kategori
            </label>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              <CategoryChip
                label={`Alle (${FLASHCARDS.length})`}
                active={activeCategory === "alle"}
                onClick={() => setActiveCategory("alle")}
              />
              {CARD_CATEGORIES.map((cat) => {
                const count = FLASHCARDS.filter((c) => c.category === cat.id).length;
                return (
                  <CategoryChip
                    key={cat.id}
                    label={`${cat.label} (${count})`}
                    active={activeCategory === cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                  />
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Stat icon={<Trophy className="h-3.5 w-3.5" />} label="Streak" value={streak.toString()} />
            <Stat label="Best" value={bestStreak.toString()} />
            <Stat label="Treff" value={`${accuracy}%`} />
          </div>
        </div>

        {/* Progresjons-bar */}
        <div className="mb-5">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
            <span>
              {knownCount} riktig · {unknownCount} feil ·{" "}
              {filteredPool.length - seenCount} ikke sett
            </span>
            <button
              onClick={reset}
              className="hover:text-foreground inline-flex items-center gap-1"
            >
              <RefreshCw className="h-3 w-3" /> Nullstill
            </button>
          </div>
          <ProgressBar value={(knownCount / Math.max(1, filteredPool.length)) * 100} />
        </div>

        {/* Selve quiz-kortet */}
        {question ? (
          <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
                {question.card.topic}
              </Badge>
              <Badge variant="secondary" className="text-[10px]">
                {CARD_CATEGORIES.find((c) => c.id === question.card.category)?.label ??
                  question.card.category}
              </Badge>
            </div>

            <h2 className="text-lg sm:text-xl font-semibold leading-relaxed">
              {question.card.question}
            </h2>

            {/* Vis tilhørende diagram (B-tree, JOIN-Venn, krågefot, …) når
                kortet har et `visual`-felt. Hjelper studenten å visualisere
                konseptet før de svarer. */}
            {question.card.visual && VISUALS[question.card.visual] && (() => {
              const Visual = VISUALS[question.card.visual]!;
              return (
                <div className="mt-4 rounded-lg border border-border bg-background/40 p-3">
                  <Visual />
                </div>
              );
            })()}

            <div className="mt-5 grid gap-2">
              {question.options.map((opt, i) => {
                const isChosen = chosenIdx === i;
                const showVerdict = chosenIdx !== null;
                const isCorrect = opt.correct;
                return (
                  <button
                    key={i}
                    onClick={() => chooseAnswer(i)}
                    disabled={chosenIdx !== null}
                    className={cn(
                      "w-full text-left rounded-lg border p-3 transition-colors text-sm leading-relaxed",
                      "flex items-start gap-3",
                      !showVerdict &&
                        "border-border bg-background hover:border-brand/60 hover:bg-brand/5 cursor-pointer",
                      showVerdict &&
                        isCorrect &&
                        "border-success bg-success/10 text-foreground",
                      showVerdict &&
                        isChosen &&
                        !isCorrect &&
                        "border-destructive bg-destructive/10 text-foreground",
                      showVerdict &&
                        !isChosen &&
                        !isCorrect &&
                        "border-border bg-background opacity-50",
                    )}
                  >
                    <span
                      className={cn(
                        "shrink-0 flex h-6 w-6 items-center justify-center rounded-md border text-xs font-mono font-semibold",
                        !showVerdict && "border-border text-muted-foreground",
                        showVerdict &&
                          isCorrect &&
                          "border-success bg-success text-success-foreground",
                        showVerdict &&
                          isChosen &&
                          !isCorrect &&
                          "border-destructive bg-destructive text-destructive-foreground",
                        showVerdict &&
                          !isChosen &&
                          !isCorrect &&
                          "border-border text-muted-foreground",
                      )}
                    >
                      {showVerdict && isCorrect ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : showVerdict && isChosen && !isCorrect ? (
                        <X className="h-3.5 w-3.5" />
                      ) : (
                        String.fromCharCode(65 + i)
                      )}
                    </span>
                    <span className="flex-1">{opt.text}</span>
                  </button>
                );
              })}
            </div>

            {chosenIdx !== null && (
              <div className="mt-5 flex items-center justify-between gap-3">
                <div className="text-sm">
                  {question.options[chosenIdx].correct ? (
                    <span className="text-success font-semibold">Riktig! +1 til streak</span>
                  ) : (
                    <span className="text-destructive font-semibold">
                      Ikke riktig — riktig svar er markert grønt
                    </span>
                  )}
                </div>
                <Button onClick={nextOrRetry} size="lg" autoFocus>
                  {chosenIdx !== null && !question.options[chosenIdx].correct
                    ? "Prøv igjen"
                    : "Neste"}
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card p-10 text-center text-muted-foreground">
            Ingen kort i denne kategorien.
          </div>
        )}

        {/* Hopp-knapp under kortet */}
        {question && chosenIdx === null && (
          <div className="mt-4 flex justify-end">
            <Button variant="ghost" size="sm" onClick={newQuestion}>
              <Shuffle className="h-3.5 w-3.5 mr-1.5" />
              Hopp over
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}

function CategoryChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-xs transition-colors",
        active
          ? "border-brand bg-brand/15 text-brand"
          : "border-border bg-card text-muted-foreground hover:border-brand/50 hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}

function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-border bg-card px-2.5 py-1 min-w-[58px] text-center">
      <div className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
        {icon} {label}
      </div>
      <div className="text-sm font-mono font-semibold tabular-nums">{value}</div>
    </div>
  );
}
