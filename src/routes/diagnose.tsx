import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  QUESTIONS,
  TARGET_QUESTIONS_MAX,
  TARGET_QUESTIONS_MIN,
  checkAnswer,
  computeResult,
  createAdaptiveState,
  nextQuestion,
  recordAnswer,
  topFocusAreas,
  type DiagnoseQuestion,
} from "@/lib/skill-tree/diagnosis";
import {
  seedFromDiagnose,
  type DiagnoseAnswer,
  type DiagnoseResult,
} from "@/lib/skill-tree/engine";
import {
  SKILL_AREAS,
  getAreaTitle,
  type SkillArea,
} from "@/lib/skill-tree/skills";

export const Route = createFileRoute("/diagnose")({
  head: () => ({
    meta: [
      { title: "Diagnose — 20-min nivåtest for skill-treet" },
      {
        name: "description",
        content:
          "Adaptiv pretest som plotter deg på skill-treet. ~30 spørsmål, ca. 20 minutter. Ingen pressure — bare for å finne hvor du står.",
      },
    ],
  }),
  component: DiagnosePage,
});

type Phase = "intro" | "running" | "done";

function DiagnosePage() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [answers, setAnswers] = useState<DiagnoseAnswer[]>([]);
  const [result, setResult] = useState<DiagnoseResult | null>(null);
  const stateRef = useRef(createAdaptiveState());
  const [currentQ, setCurrentQ] = useState<DiagnoseQuestion | null>(null);

  function start() {
    stateRef.current = createAdaptiveState();
    setAnswers([]);
    setResult(null);
    const first = nextQuestion(stateRef.current, []);
    setCurrentQ(first);
    setPhase("running");
  }

  function handleSubmit(answer: DiagnoseAnswer) {
    if (!currentQ) return;
    recordAnswer(stateRef.current, currentQ, answer);
    const nextAnswers = [...answers, answer];
    setAnswers(nextAnswers);
    const next = nextQuestion(stateRef.current, nextAnswers);
    if (!next) {
      const res = computeResult(nextAnswers);
      setResult(res);
      seedFromDiagnose(nextAnswers, res);
      setPhase("done");
      setCurrentQ(null);
    } else {
      setCurrentQ(next);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="border-b border-border bg-card/30">
        <div className="container mx-auto px-4 py-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Hjem</Link>
          <span>/</span>
          <span className="text-foreground">Diagnose</span>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {phase === "intro" && <IntroScreen onStart={start} />}
        {phase === "running" && currentQ && (
          <QuestionScreen
            question={currentQ}
            indexShown={answers.length + 1}
            onSubmit={handleSubmit}
          />
        )}
        {phase === "done" && result && (
          <ResultScreen result={result} onRestart={start} />
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Intro                                                            */
/* ---------------------------------------------------------------- */

function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-3xl">Diagnose-test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-base leading-relaxed">
        <p>
          Denne testen tar ca. <strong>20 minutter</strong> og plotter deg på
          skill-treet. Du får mellom {TARGET_QUESTIONS_MIN} og {TARGET_QUESTIONS_MAX}{" "}
          spørsmål fordelt på {SKILL_AREAS.length} fag-områder — fra
          Python-grunnleggende til SQL, Linux, Git, nettverk og algoritmer.
        </p>
        <ul className="list-disc pl-6 space-y-1 text-sm">
          <li>Ett spørsmål per side. Ingen tilbake-knapp.</li>
          <li>
            Vanskelighetsgrad tilpasses underveis — svarer du riktig, blir det
            vanskeligere; svarer du feil, blir det enklere.
          </li>
          <li>
            Kjenner du ikke emnet, trykk <em>Hopp over</em>. Det teller som
            feil, men markeres med lavere tiltro.
          </li>
          <li>Timer per spørsmål er bare for telemetri — ingen pressure.</li>
        </ul>
        <p className="text-sm text-muted-foreground">
          Resultatet lagres lokalt i nettleseren og brukes som startpunkt for
          læring og repetisjon.
        </p>
        <div className="pt-2">
          <Button size="lg" onClick={onStart}>
            Start diagnose
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* ---------------------------------------------------------------- */
/* Spørsmål-skjerm                                                  */
/* ---------------------------------------------------------------- */

function QuestionScreen({
  question,
  indexShown,
  onSubmit,
}: {
  question: DiagnoseQuestion;
  indexShown: number;
  onSubmit: (a: DiagnoseAnswer) => void;
}) {
  const startedAt = useRef(Date.now());
  const [selected, setSelected] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [revealed, setRevealed] = useState<{
    correct: boolean;
    skipped: boolean;
  } | null>(null);

  useEffect(() => {
    startedAt.current = Date.now();
    setSelected(null);
    setText("");
    setRevealed(null);
  }, [question.id]);

  const totalEstimate = TARGET_QUESTIONS_MAX;
  const progressPct = Math.min(
    100,
    Math.round(((indexShown - 1) / totalEstimate) * 100),
  );

  function submit(skip = false) {
    let correct = false;
    if (!skip) {
      if (question.kind === "oneliner") {
        correct = checkAnswer(question, text);
      } else if (selected !== null) {
        correct = checkAnswer(question, selected);
      } else {
        return; // ingen valg gjort
      }
    }
    setRevealed({ correct, skipped: skip });
  }

  function advance() {
    if (!revealed) return;
    const timeMs = Date.now() - startedAt.current;
    onSubmit({
      questionId: question.id,
      skills: question.skills,
      difficulty: question.difficulty,
      correct: revealed.correct,
      skipped: revealed.skipped,
      timeMs,
    });
  }

  const canSubmit =
    question.kind === "oneliner" ? text.trim().length > 0 : selected !== null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Spørsmål {indexShown} av ~{totalEstimate}
        </span>
        <span>Vanskelighetsgrad {question.difficulty}/5</span>
      </div>
      <Progress value={progressPct} />

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{question.prompt}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {question.code && (
            <pre className="bg-muted rounded-md p-4 text-sm font-mono overflow-x-auto">
              <code>{question.code}</code>
            </pre>
          )}

          {question.kind === "oneliner" ? (
            <div className="space-y-2">
              <Input
                placeholder="Skriv svaret her..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={revealed !== null}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !revealed && canSubmit) submit();
                }}
                className="font-mono"
              />
            </div>
          ) : (
            <div className="grid gap-2">
              {question.options?.map((opt, i) => {
                const isSelected = selected === i;
                const isCorrect = i === question.answer;
                let cls =
                  "text-left rounded-md border p-3 transition-colors hover:bg-accent";
                if (revealed) {
                  if (isCorrect) cls += " border-green-500 bg-green-500/10";
                  else if (isSelected) cls += " border-red-500 bg-red-500/10";
                  else cls += " opacity-60";
                } else if (isSelected) {
                  cls += " border-primary bg-primary/5";
                }
                return (
                  <button
                    key={i}
                    type="button"
                    className={cls}
                    onClick={() => {
                      if (!revealed) setSelected(i);
                    }}
                    disabled={revealed !== null}
                  >
                    <span className="font-mono text-xs text-muted-foreground mr-2">
                      {String.fromCharCode(65 + i)}.
                    </span>
                    <span className="font-mono">{opt}</span>
                  </button>
                );
              })}
            </div>
          )}

          {revealed && (
            <div
              className={`rounded-md p-3 text-sm ${
                revealed.skipped
                  ? "bg-yellow-500/10 text-yellow-700 dark:text-yellow-300"
                  : revealed.correct
                    ? "bg-green-500/10 text-green-700 dark:text-green-300"
                    : "bg-red-500/10 text-red-700 dark:text-red-300"
              }`}
            >
              {revealed.skipped
                ? "Hoppet over — teller som feil, men markert som lav tiltro."
                : revealed.correct
                  ? "Riktig!"
                  : "Feil."}
              {question.explain && (
                <div className="mt-2 text-foreground/80">{question.explain}</div>
              )}
              {question.kind === "oneliner" && (
                <div className="mt-2 font-mono text-xs">
                  Forventet: {String(question.answer)}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            {!revealed ? (
              <>
                <Button
                  variant="ghost"
                  onClick={() => submit(true)}
                >
                  Hopp over
                </Button>
                <Button onClick={() => submit(false)} disabled={!canSubmit}>
                  Svar
                </Button>
              </>
            ) : (
              <>
                <span className="text-xs text-muted-foreground">
                  Testet: {question.skills.join(", ")}
                </span>
                <Button onClick={advance}>Neste</Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Resultat-skjerm                                                  */
/* ---------------------------------------------------------------- */

function ResultScreen({
  result,
  onRestart,
}: {
  result: DiagnoseResult;
  onRestart: () => void;
}) {
  const focus = useMemo(() => topFocusAreas(result, 3), [result]);

  const orderedAreas = useMemo(() => {
    return SKILL_AREAS.map((a) => ({
      ...a,
      rating: result.areaRatings[a.id]?.rating ?? null,
      observations: result.areaRatings[a.id]?.observations ?? 0,
    }));
  }, [result]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Diagnose ferdig</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            Resultatet ditt er lagret lokalt og brukes som startpunkt på
            skill-treet. Tatt: {new Date(result.takenAt).toLocaleString("no-NO")}.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Nivå per fag-område</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {orderedAreas.map((a) => (
              <AreaBar
                key={a.id}
                title={a.title}
                rating={a.rating}
                observations={a.observations}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Topp 3 områder å fokusere på</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {focus.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Ingen tydelige fokus-områder funnet. Bra jobba!
            </p>
          )}
          {focus.map((f, i) => (
            <FocusItem
              key={f.area}
              rank={i + 1}
              area={f.area}
              rating={f.rating}
              observations={f.observations}
            />
          ))}
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onRestart}>
          Ta testen på nytt
        </Button>
        <Link to="/">
          <Button variant="ghost">Tilbake til forsiden</Button>
        </Link>
      </div>
    </div>
  );
}

function AreaBar({
  title,
  rating,
  observations,
}: {
  title: string;
  rating: number | null;
  observations: number;
}) {
  if (rating === null || observations === 0) {
    return (
      <div className="text-sm">
        <div className="flex items-center justify-between mb-1">
          <span className="text-muted-foreground">{title}</span>
          <span className="text-xs text-muted-foreground">ikke testet</span>
        </div>
        <div className="h-2 rounded-full bg-muted" />
      </div>
    );
  }
  const color =
    rating >= 70
      ? "bg-green-500"
      : rating >= 40
        ? "bg-yellow-500"
        : "bg-red-500";
  return (
    <div className="text-sm">
      <div className="flex items-center justify-between mb-1">
        <span>{title}</span>
        <span className="text-xs text-muted-foreground">
          {rating} / 100 · {observations} spm
        </span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full ${color} transition-all`}
          style={{ width: `${rating}%` }}
        />
      </div>
    </div>
  );
}

function FocusItem({
  rank,
  area,
  rating,
  observations,
}: {
  rank: number;
  area: SkillArea;
  rating: number;
  observations: number;
}) {
  const title = getAreaTitle(area);
  return (
    <div className="flex items-center gap-3 border rounded-md p-3">
      <Badge variant="outline" className="text-base px-3 py-1">
        #{rank}
      </Badge>
      <div className="flex-1 min-w-0">
        <div className="font-medium">{title}</div>
        <div className="text-xs text-muted-foreground">
          Rating {rating} / 100 · {observations} observasjoner
        </div>
      </div>
      <a
        href={`/skill-tre?omrade=${encodeURIComponent(area)}`}
        className="shrink-0"
      >
        <Button size="sm">Start læring</Button>
      </a>
    </div>
  );
}
