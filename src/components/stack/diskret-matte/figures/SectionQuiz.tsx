import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Check, X, ArrowRight, Award } from "lucide-react";

// «Gate»-quiz som avslutter hver seksjon. 2–3 multiple-choice spørsmål med
// umiddelbar rationale-feedback. Når alle besvares riktig, marker seksjonen
// som «mestret» i localStorage — CourseOutline ser dette og setter en
// grønn ✓ ved seksjonen.
//
// Pedagogisk valg: ikke-blokkerende. Bruker KAN scrolle videre uten å klare
// quizen, men får et tydelig signal om hva som er igjen. Det reduserer
// frustrasjon for repetisjons-bruk samtidig som det gir et klart første-
// gangsmål.

const STORAGE_PREFIX = "sql-practice-course-mastered-v1:";

function loadMastered(courseId: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + courseId);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function saveMastered(courseId: string, set: Set<string>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_PREFIX + courseId, JSON.stringify(Array.from(set)));
    // Notify other listeners (e.g. CourseOutline on the same page).
    window.dispatchEvent(new CustomEvent("course-mastered-changed", { detail: { courseId } }));
  } catch {
    // quota etc. ignored
  }
}

export interface QuizQuestion {
  prompt: string;
  options: { text: string; correct: boolean; rationale?: string }[];
}

export interface SectionQuizProps {
  /** Course id (matches CourseOutline). */
  courseId: string;
  /** Section anchor id (matches one entry in STEPS). */
  sectionId: string;
  questions: QuizQuestion[];
  /** Optional next-section anchor for the «Neste» CTA. Null = last section. */
  nextSection?: { title: string; anchor: string };
}

export function SectionQuiz({
  courseId,
  sectionId,
  questions,
  nextSection,
}: SectionQuizProps) {
  // `picked[i]` = chosen option index for question i, or null if unanswered.
  const [picked, setPicked] = useState<(number | null)[]>(() => questions.map(() => null));
  const [revealed, setRevealed] = useState(false);
  const [alreadyMastered, setAlreadyMastered] = useState(false);

  useEffect(() => {
    const mastered = loadMastered(courseId);
    if (mastered.has(sectionId)) setAlreadyMastered(true);
  }, [courseId, sectionId]);

  const answered = picked.every((p) => p !== null);
  const correctCount = picked.reduce<number>((sum, idx, qi) => {
    if (idx === null) return sum;
    return sum + (questions[qi].options[idx].correct ? 1 : 0);
  }, 0);
  const allCorrect = revealed && correctCount === questions.length;

  // Persist mastered on first all-correct submission.
  useEffect(() => {
    if (!allCorrect) return;
    const mastered = loadMastered(courseId);
    if (!mastered.has(sectionId)) {
      mastered.add(sectionId);
      saveMastered(courseId, mastered);
      setAlreadyMastered(true);
    }
  }, [allCorrect, courseId, sectionId]);

  const pick = (qi: number, oi: number) => {
    if (revealed) return;
    setPicked((arr) => arr.map((v, i) => (i === qi ? oi : v)));
  };
  const submit = () => setRevealed(true);
  const retry = () => {
    setPicked(questions.map(() => null));
    setRevealed(false);
  };

  return (
    <div className="mt-6 rounded-2xl border-2 border-brand/30 bg-brand/5 p-4 not-prose">
      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
        <div className="text-xs uppercase tracking-wider text-brand font-semibold">
          Sjekk forståelse — {questions.length} spørsmål
        </div>
        {alreadyMastered && (
          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
            <Award className="h-3.5 w-3.5" /> Mestret
          </span>
        )}
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Svar på alle for å låse opp seksjonen som «mestret». Du kan fortsatt scrolle
        videre, men dette er sjekken på at konseptet sitter.
      </p>

      <ol className="space-y-3">
        {questions.map((q, qi) => {
          return (
            <li key={qi} className="rounded-md border border-border bg-background p-3">
              <div className="text-sm font-medium text-foreground mb-2">
                <span className="text-brand font-mono text-xs mr-1.5">{qi + 1}.</span>
                {q.prompt}
              </div>
              <div className="space-y-1">
                {q.options.map((opt, oi) => {
                  const isPicked = picked[qi] === oi;
                  const showAsCorrect = revealed && opt.correct;
                  const showAsWrong = revealed && isPicked && !opt.correct;
                  return (
                    <button
                      key={oi}
                      type="button"
                      onClick={() => pick(qi, oi)}
                      disabled={revealed}
                      className={`w-full text-left px-3 py-1.5 rounded border text-[13px] flex items-start gap-2 transition-colors ${
                        showAsCorrect
                          ? "border-emerald-500 bg-emerald-500/15"
                          : showAsWrong
                            ? "border-rose-500 bg-rose-500/15"
                            : isPicked
                              ? "border-brand bg-brand/10"
                              : "border-border bg-background hover:bg-muted"
                      } ${revealed ? "cursor-default" : "cursor-pointer"}`}
                    >
                      <span className="shrink-0 mt-0.5 w-4">
                        {showAsCorrect ? (
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                        ) : showAsWrong ? (
                          <X className="h-3.5 w-3.5 text-rose-500" />
                        ) : (
                          <span
                            className={`inline-block w-3 h-3 rounded-full border ${
                              isPicked ? "border-brand bg-brand" : "border-border"
                            }`}
                          />
                        )}
                      </span>
                      <span className="flex-1">{opt.text}</span>
                    </button>
                  );
                })}
              </div>
              {revealed && q.options[picked[qi]!]?.rationale && (
                <div className="mt-2 text-[11px] text-muted-foreground italic">
                  <span className="text-brand">↳ </span>
                  {q.options[picked[qi]!].rationale}
                </div>
              )}
            </li>
          );
        })}
      </ol>

      <div className="mt-3 flex items-center gap-2 flex-wrap">
        {!revealed ? (
          <button
            type="button"
            onClick={submit}
            disabled={!answered}
            className="px-3 py-1.5 rounded-md text-xs border border-brand bg-brand/15 hover:bg-brand/25 disabled:opacity-40 disabled:cursor-not-allowed font-semibold"
          >
            Sjekk svar
          </button>
        ) : (
          <>
            <span
              className={`text-xs font-semibold ${
                allCorrect ? "text-emerald-500" : "text-amber-500"
              }`}
            >
              {correctCount} av {questions.length} riktig
            </span>
            <button
              type="button"
              onClick={retry}
              className="px-3 py-1.5 rounded-md text-xs border border-border bg-background hover:bg-muted"
            >
              Prøv igjen
            </button>
          </>
        )}

        {nextSection && (
          <Link
            to="."
            hash={nextSection.anchor}
            className={`ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors ${
              allCorrect || alreadyMastered
                ? "border-brand bg-brand text-brand-foreground hover:bg-brand/90"
                : "border-border bg-background text-foreground hover:bg-muted"
            }`}
            title={nextSection.title}
          >
            Neste: {nextSection.title}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      {revealed && !allCorrect && (
        <div className="mt-2 text-[11px] text-muted-foreground">
          Bla opp og gå gjennom seksjonen på nytt — ofte er det én detalj som mangler.
          Du kan også fortsette og komme tilbake senere.
        </div>
      )}
    </div>
  );
}

