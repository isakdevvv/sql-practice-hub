import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
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
import { FlashCardView } from "@/components/learn/FlashCard";
import {
  buildStudyQueue,
  getDueCards,
  getLearnedCount,
  getNewCards,
  Rating,
  recordReview,
  resetFsrs,
  type ReviewRating,
} from "@/lib/learn/fsrs";
import { cn } from "@/lib/utils";
import {
  Check,
  X,
  ArrowRight,
  Trophy,
  RefreshCw,
  Shuffle,
  Brain,
  ListChecks,
  HelpCircle,
} from "lucide-react";

export const Route = createFileRoute("/cards")({
  head: () => ({
    meta: [
      { title: "Repetisjonskort — SQL Sandbox" },
      {
        name: "description",
        content:
          "Repetisjonskort med tre moduser: quiz med svar-alternativer, blaing gjennom alle kort, og spaced-repetition (FSRS-4.5) for varig laring.",
      },
    ],
  }),
  component: CardsPage,
});

type Mode = "quiz" | "browse" | "study";

function shuffle<T>(arr: T[]): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function CardsPage() {
  const [mode, setMode] = useState<Mode>("quiz");
  const [activeCategory, setActiveCategory] = useState<CardCategory | "alle">("alle");

  const filteredPool = useMemo(
    () =>
      activeCategory === "alle"
        ? FLASHCARDS
        : FLASHCARDS.filter((c) => c.category === activeCategory),
    [activeCategory],
  );

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Repetisjonskort</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Tre maater aa drive med kortene: quiz med alternativer, bla gjennom
            alt, eller spaced repetition (FSRS) for varig laering.
          </p>
        </div>

        <ModeSwitcher mode={mode} onChange={setMode} />

        <CategoryRow
          activeCategory={activeCategory}
          onChange={setActiveCategory}
        />

        {mode === "quiz" && <QuizMode pool={filteredPool} />}
        {mode === "browse" && <BrowseMode pool={filteredPool} />}
        {mode === "study" && <StudyMode pool={filteredPool} />}
      </main>
    </div>
  );
}

// ---------- mode switcher + shared category UI ----------

function ModeSwitcher({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  return (
    <div className="mb-5 grid grid-cols-3 gap-1.5 rounded-lg border border-border bg-card p-1">
      <ModeTab
        active={mode === "quiz"}
        onClick={() => onChange("quiz")}
        icon={<HelpCircle className="h-3.5 w-3.5" />}
        label="Quiz"
        sub="4 alternativer"
      />
      <ModeTab
        active={mode === "browse"}
        onClick={() => onChange("browse")}
        icon={<ListChecks className="h-3.5 w-3.5" />}
        label="Alle kort"
        sub="bla & flipp"
      />
      <ModeTab
        active={mode === "study"}
        onClick={() => onChange("study")}
        icon={<Brain className="h-3.5 w-3.5" />}
        label="Studer"
        sub="FSRS-4.5"
      />
    </div>
  );
}

function ModeTab({
  active,
  onClick,
  icon,
  label,
  sub,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  sub: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-md px-3 py-2 text-center transition-colors",
        active
          ? "bg-brand text-brand-foreground"
          : "bg-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground",
      )}
    >
      <div className="flex items-center justify-center gap-1.5 text-sm font-semibold">
        {icon}
        {label}
      </div>
      <div className="text-[10px] opacity-80 mt-0.5">{sub}</div>
    </button>
  );
}

function CategoryRow({
  activeCategory,
  onChange,
}: {
  activeCategory: CardCategory | "alle";
  onChange: (c: CardCategory | "alle") => void;
}) {
  return (
    <div className="mb-5">
      <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
        Kategori
      </label>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        <CategoryChip
          label={`Alle (${FLASHCARDS.length})`}
          active={activeCategory === "alle"}
          onClick={() => onChange("alle")}
        />
        {CARD_CATEGORIES.map((cat) => {
          const count = FLASHCARDS.filter((c) => c.category === cat.id).length;
          return (
            <CategoryChip
              key={cat.id}
              label={`${cat.label} (${count})`}
              active={activeCategory === cat.id}
              onClick={() => onChange(cat.id)}
            />
          );
        })}
      </div>
    </div>
  );
}

// ---------- QUIZ MODE (existing behavior, extracted) ----------

interface QuizQuestion {
  card: FlashCard;
  options: { text: string; correct: boolean; sourceId: string }[];
}

// Velg distraktorer fra samme topic (mest forvirrende -> best laring),
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

function QuizMode({ pool }: { pool: FlashCard[] }) {
  const [progress, setProgress] = useState<CardProgress>({
    known: {},
    unknown: {},
    lastSeen: {},
  });
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [chosenIdx, setChosenIdx] = useState<number | null>(null);

  useEffect(() => {
    setProgress(loadCardProgress());
  }, []);

  function pickNextCard(prog: CardProgress, p: FlashCard[]): FlashCard {
    const unseen = p.filter((c) => !prog.known[c.id] && !prog.unknown[c.id]);
    const wrong = p.filter((c) => prog.unknown[c.id]);
    const right = p.filter((c) => prog.known[c.id]);
    const pickFrom =
      unseen.length > 0 ? unseen : wrong.length > 0 ? wrong : right.length > 0 ? right : p;
    return pickFrom[Math.floor(Math.random() * pickFrom.length)];
  }

  const newQuestion = useCallback(() => {
    if (pool.length === 0) {
      setQuestion(null);
      return;
    }
    const card = pickNextCard(progress, pool);
    setQuestion(buildQuestion(card, pool));
    setChosenIdx(null);
  }, [pool, progress]);

  useEffect(() => {
    newQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool.length]);

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
      setQuestion(buildQuestion(question.card, pool));
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

  const knownCount = pool.filter((c) => progress.known[c.id]).length;
  const unknownCount = pool.filter((c) => progress.unknown[c.id]).length;
  const seenCount = knownCount + unknownCount;
  const accuracy = seenCount > 0 ? Math.round((knownCount / seenCount) * 100) : 0;

  return (
    <>
      <div className="mb-5 grid grid-cols-3 sm:flex sm:items-center sm:justify-end gap-2">
        <Stat icon={<Trophy className="h-3.5 w-3.5" />} label="Streak" value={streak.toString()} />
        <Stat label="Best" value={bestStreak.toString()} />
        <Stat label="Treff" value={`${accuracy}%`} />
      </div>

      <div className="mb-5">
        <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
          <span>
            {knownCount} riktig · {unknownCount} feil ·{" "}
            {pool.length - seenCount} ikke sett
          </span>
          <button
            onClick={reset}
            className="hover:text-foreground inline-flex items-center gap-1"
          >
            <RefreshCw className="h-3 w-3" /> Nullstill
          </button>
        </div>
        <ProgressBar value={(knownCount / Math.max(1, pool.length)) * 100} />
      </div>

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

          {question.card.visual &&
            VISUALS[question.card.visual] &&
            (() => {
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
                    showVerdict && isCorrect && "border-success bg-success/10 text-foreground",
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
                    Ikke riktig - riktig svar er markert grønt
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

      {question && chosenIdx === null && (
        <div className="mt-4 flex justify-end">
          <Button variant="ghost" size="sm" onClick={newQuestion}>
            <Shuffle className="h-3.5 w-3.5 mr-1.5" />
            Hopp over
          </Button>
        </div>
      )}
    </>
  );
}

// ---------- BROWSE MODE (flip through every card) ----------

function BrowseMode({ pool }: { pool: FlashCard[] }) {
  const [idx, setIdx] = useState(0);

  // Reset to first card when pool changes (category filter).
  useEffect(() => {
    setIdx(0);
  }, [pool.length]);

  if (pool.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center text-muted-foreground">
        Ingen kort i denne kategorien.
      </div>
    );
  }

  const card = pool[idx % pool.length];
  const next = () => setIdx((i) => (i + 1) % pool.length);
  const prev = () => setIdx((i) => (i - 1 + pool.length) % pool.length);

  return (
    <div className="space-y-3">
      <div className="text-[11px] text-muted-foreground text-right">
        Kort {idx + 1} av {pool.length}
      </div>
      <FlashCardView card={card} onKnown={next} onUnknown={prev} />
      <div className="flex justify-between gap-2">
        <Button variant="outline" size="sm" onClick={prev}>
          Forrige
        </Button>
        <Button variant="outline" size="sm" onClick={next}>
          Neste
          <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
        </Button>
      </div>
    </div>
  );
}

// ---------- STUDY MODE (FSRS-scheduled) ----------

function StudyMode({ pool }: { pool: FlashCard[] }) {
  // Bumped on every review to force re-evaluation of queue/stats.
  const [tick, setTick] = useState(0);

  // Build the queue once per pool/tick. Order is fixed within a tick so
  // hitting a rating button advances to the next item deterministically.
  const queue = useMemo(
    () => buildStudyQueue(pool, 20),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pool, tick],
  );

  const dueCount = useMemo(() => getDueCards(pool).length, [pool, tick]);
  const newCount = useMemo(() => getNewCards(pool).length, [pool, tick]);
  const learnedCount = useMemo(() => getLearnedCount(pool), [pool, tick]);

  const card = queue[0];

  const handleRate = useCallback(
    (rating: ReviewRating) => {
      if (!card) return;
      recordReview(card.id, rating);
      setTick((t) => t + 1);
    },
    [card],
  );

  function handleReset() {
    if (
      typeof window !== "undefined" &&
      !window.confirm("Nullstille all FSRS-state? Dette sletter alle intervaller for alle kort.")
    )
      return;
    resetFsrs();
    setTick((t) => t + 1);
  }

  return (
    <>
      <div className="mb-5 grid grid-cols-3 gap-2">
        <Stat label="Due i dag" value={dueCount.toString()} icon={<Brain className="h-3.5 w-3.5 text-warning" />} />
        <Stat label="Nye" value={newCount.toString()} />
        <Stat label="Lært" value={learnedCount.toString()} />
      </div>

      <div className="mb-5">
        <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
          <span>
            FSRS-4.5 · request_retention 0.9 · maximum_interval 2 år
          </span>
          <button
            onClick={handleReset}
            className="hover:text-foreground inline-flex items-center gap-1"
            title="Nullstill all FSRS-state"
          >
            <RefreshCw className="h-3 w-3" /> Nullstill FSRS
          </button>
        </div>
        <ProgressBar
          value={
            pool.length > 0
              ? (learnedCount / pool.length) * 100
              : 0
          }
        />
      </div>

      {card ? (
        <FlashCardView
          card={card}
          onKnown={() => handleRate(Rating.Good)}
          onUnknown={() => handleRate(Rating.Again)}
          onRate={handleRate}
        />
      ) : (
        <div className="rounded-xl border border-border bg-card p-10 text-center">
          <div className="text-success font-semibold mb-2">Ferdig for naa</div>
          <p className="text-sm text-muted-foreground">
            Ingen kort er due, og du har ikke flere nye kort i denne kategorien.
            Kom tilbake i morgen — eller bytt kategori for å laere noe nytt.
          </p>
        </div>
      )}

      <p className="mt-4 text-[11px] text-muted-foreground leading-relaxed">
        <strong>FSRS</strong> (Free Spaced Repetition Scheduler) regner ut neste
        intervall basert paa hvor lett kortet falt deg. <em>Again</em> nullstiller,{" "}
        <em>Hard</em> gir et kort intervall, <em>Good</em> ca. dobler det forrige,
        og <em>Easy</em> gir et stort hopp. Tallet paa hver knapp er predikert
        neste due-dato.
      </p>
    </>
  );
}

// ---------- shared chip/stat ----------

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
    <div className="rounded-md border border-border bg-card px-2.5 py-1.5 min-w-[58px] text-center">
      <div className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
        {icon} {label}
      </div>
      <div className="text-sm font-mono font-semibold tabular-nums">{value}</div>
    </div>
  );
}
