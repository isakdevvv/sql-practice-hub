import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ChevronRight, Eye, Sparkles, Check } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import {
  CODE_SNIPPETS,
  SNIPPETS_BY_ORDER,
  CATEGORY_LABELS,
  getSnippet,
  type CodeSnippet,
  type SnippetCategory,
  type Question,
} from "@/lib/karriere/code-reading";
import {
  computeStats,
  loadKodeLesningProgress,
  markReviewed,
  recordAnswer,
  recordHelpfulness,
  type Helpfulness,
  type SnippetRecord,
} from "@/lib/karriere/progress";
import { CodeEditor } from "@/components/mini-kurs/CodeEditor";

export const Route = createFileRoute("/karriere/kode-lesning")({
  validateSearch: (s: Record<string, unknown>) => ({
    s: typeof s.s === "string" ? s.s : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Kode-lesnings-trening — Karriere" },
      {
        name: "description",
        content:
          "Tren på å lese andres kode. 20 ekte-aktige snippeter med spørsmål før fasit — den viktigste ferdigheten i ingeniør-jobb.",
      },
    ],
  }),
  component: KodeLesningPage,
});

function KodeLesningPage() {
  const search = Route.useSearch();
  const selected = search.s ? getSnippet(search.s) : undefined;
  if (selected) {
    return <SnippetReader snippet={selected} />;
  }
  return <SnippetList />;
}

// ─────────────────── LISTE ───────────────────

function SnippetList() {
  const [progressTick, setProgressTick] = useState(0);
  useEffect(() => {
    setProgressTick((t) => t + 1);
  }, []);

  const stats = useMemo(
    () => (typeof window !== "undefined" ? computeStats(CODE_SNIPPETS.length) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [progressTick],
  );

  const records = useMemo(
    () => (typeof window !== "undefined" ? loadKodeLesningProgress().records : {}),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [progressTick],
  );

  const byCat = useMemo(() => {
    const groups: Record<SnippetCategory, CodeSnippet[]> = {
      python: [],
      sql: [],
      web: [],
      lavnivå: [],
      ml: [],
    };
    for (const s of SNIPPETS_BY_ORDER) groups[s.category].push(s);
    return groups;
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-10 max-w-5xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
            Karriere · Kode-lesning
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Les{" "}
            <span className="bg-gradient-to-r from-brand to-success bg-clip-text text-transparent">
              andres kode
            </span>
          </h1>
          <p className="mt-3 text-muted-foreground max-w-2xl">
            Den viktigste ferdigheten i ekte ingeniør-jobb er å lese kode du
            ikke har skrevet selv — og forstå hva den gjør, hva den prøver å
            gjøre, og hvor den bryter. Her er 20 ekte-aktige snippeter. Svar på
            spørsmålene før du ser fasit.
          </p>
        </div>

        {stats && (
          <div className="mb-8 rounded-lg border border-border bg-card p-4 flex flex-wrap gap-6 text-sm">
            <div>
              <div className="text-muted-foreground">Lest</div>
              <div className="text-xl font-semibold tabular-nums">
                {stats.reviewedCount} / {stats.totalCount}
              </div>
            </div>
            {stats.averageScore !== null && (
              <div>
                <div className="text-muted-foreground">Snitt-vurdering</div>
                <div className="text-xl font-semibold tabular-nums">
                  {stats.averageScore.toFixed(1)} / 5
                </div>
              </div>
            )}
            <div>
              <div className="text-muted-foreground">Nytte</div>
              <div className="text-xl font-semibold tabular-nums">
                <span className="text-success">{stats.helpfulCounts.ja}</span>
                {" / "}
                <span className="text-muted-foreground">{stats.helpfulCounts.sånn}</span>
                {" / "}
                <span className="text-destructive">{stats.helpfulCounts.nei}</span>
              </div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                ja · sånn · nei
              </div>
            </div>
          </div>
        )}

        {(Object.keys(byCat) as SnippetCategory[]).map((cat) => (
          <section key={cat} className="mb-10">
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="text-xl font-bold tracking-tight">
                {CATEGORY_LABELS[cat]}
              </h2>
              <span className="text-xs text-muted-foreground tabular-nums">
                {byCat[cat].length} snippeter
              </span>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {byCat[cat].map((s) => {
                const rec = records[s.id];
                return <SnippetCard key={s.id} snippet={s} record={rec} />;
              })}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}

function SnippetCard({
  snippet,
  record,
}: {
  snippet: CodeSnippet;
  record: SnippetRecord | undefined;
}) {
  const reviewed = record?.reviewed ?? false;
  return (
    <Link
      to="/karriere/kode-lesning"
      search={{ s: snippet.id }}
      className="group rounded-xl border border-border bg-card hover:border-brand/40 transition-colors p-4 block"
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md font-bold text-sm tabular-nums ${
            reviewed
              ? "bg-success/15 text-success"
              : "bg-muted text-muted-foreground"
          }`}
          title={`Anbefalt rekkefølge: ${snippet.order}`}
        >
          {snippet.order}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h3 className="font-semibold text-foreground leading-tight">
              {snippet.title}
            </h3>
            <div className="flex gap-1.5 items-center">
              <DifficultyDots level={snippet.difficulty} />
              {reviewed && (
                <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-success/15 text-success flex items-center gap-1">
                  <Check className="h-3 w-3" />
                  Lest
                </span>
              )}
            </div>
          </div>
          <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
            {snippet.intro}
          </p>
          <div className="mt-2 text-xs text-muted-foreground flex items-center gap-2">
            <span>{snippet.questions.length} spørsmål</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground/70 group-hover:text-foreground">
              Åpne
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function DifficultyDots({ level }: { level: 1 | 2 | 3 | 4 | 5 }) {
  return (
    <span className="inline-flex gap-0.5" title={`Vanskelighet: ${level}/5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`h-1.5 w-1.5 rounded-full ${
            i <= level ? "bg-brand" : "bg-muted"
          }`}
        />
      ))}
    </span>
  );
}

// ─────────────────── READER ───────────────────

function SnippetReader({ snippet }: { snippet: CodeSnippet }) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [revealed, setRevealed] = useState(false);
  const [helpfulness, setHelpfulness] = useState<Helpfulness | undefined>();

  // Last inn tidligere svar/state for denne snippeten.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const rec = loadKodeLesningProgress().records[snippet.id];
    if (rec) {
      setAnswers(rec.answers ?? {});
      setRevealed(rec.reviewed);
      setHelpfulness(rec.helpfulness);
    } else {
      setAnswers({});
      setRevealed(false);
      setHelpfulness(undefined);
    }
  }, [snippet.id]);

  const allAnswered = useMemo(() => {
    return snippet.questions.every((_q, i) => {
      const v = answers[i];
      return typeof v === "string" && v.trim().length > 0;
    });
  }, [answers, snippet.questions]);

  function updateAnswer(i: number, val: string) {
    setAnswers((prev) => {
      const next = { ...prev, [i]: val };
      recordAnswer(snippet.id, i, val);
      return next;
    });
  }

  function onReveal() {
    setRevealed(true);
    markReviewed(snippet.id);
  }

  function onRate(h: Helpfulness) {
    setHelpfulness(h);
    recordHelpfulness(snippet.id, h);
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      <div className="border-b border-border bg-muted/30">
        <div className="container mx-auto px-4 py-3 max-w-7xl flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <Link
              to="/karriere/kode-lesning"
              className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Tilbake til lista
            </Link>
            <span className="text-muted-foreground/50">·</span>
            <span className="text-sm font-medium">{snippet.title}</span>
            <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground uppercase tracking-wider">
              {CATEGORY_LABELS[snippet.category]}
            </span>
            <span
              className="text-xs px-1.5 py-0.5 rounded bg-brand/10 text-brand font-semibold tabular-nums"
              title="Anbefalt rekkefølge"
            >
              #{snippet.order}
            </span>
          </div>
          <DifficultyDots level={snippet.difficulty} />
        </div>
      </div>

      <main className="flex-1 grid lg:grid-cols-[1fr_1fr] min-h-0">
        {/* VENSTRE: kode */}
        <div className="border-b lg:border-b-0 lg:border-r border-border min-h-[400px] lg:min-h-0 lg:h-[calc(100vh-7rem)]">
          <CodeEditor
            value={snippet.code}
            onChange={() => {
              /* readOnly */
            }}
            path={snippet.fileName}
            readOnly
            height="100%"
          />
        </div>

        {/* HØYRE: spørsmål + fasit */}
        <div className="overflow-y-auto lg:h-[calc(100vh-7rem)]">
          <div className="p-6 max-w-2xl">
            <p className="text-sm text-muted-foreground italic mb-6">
              {snippet.intro} Funksjons-navn og kommentarer er fjernet med vilje
              — gjett basert på hva koden faktisk gjør.
            </p>

            <div className="space-y-5">
              {snippet.questions.map((q, i) => (
                <QuestionBlock
                  key={i}
                  question={q}
                  index={i}
                  value={answers[i] ?? ""}
                  onChange={(v) => updateAnswer(i, v)}
                  revealed={revealed}
                />
              ))}
            </div>

            {!revealed && (
              <div className="mt-6">
                <button
                  type="button"
                  onClick={onReveal}
                  disabled={!allAnswered}
                  className="inline-flex items-center gap-2 rounded-md bg-brand text-brand-foreground px-4 py-2 text-sm font-medium hover:bg-brand/90 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Eye className="h-4 w-4" />
                  Vis fasit
                </button>
                {!allAnswered && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Svar på alle spørsmålene først.
                  </p>
                )}
              </div>
            )}

            {revealed && (
              <ExpertSection
                snippet={snippet}
                userAnswers={answers}
                helpfulness={helpfulness}
                onRate={onRate}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function QuestionBlock({
  question,
  index,
  value,
  onChange,
  revealed,
}: {
  question: Question;
  index: number;
  value: string;
  onChange: (v: string) => void;
  revealed: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-xs font-bold text-brand tabular-nums">
          Q{index + 1}
        </span>
        <p className="text-sm font-medium text-foreground">{question.prompt}</p>
      </div>
      {question.kind === "text" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          placeholder="Skriv ditt svar..."
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
      ) : (
        <div className="space-y-1.5">
          {question.options.map((opt, i) => {
            const id = `q${index}-opt${i}`;
            const checked = value === String(i);
            return (
              <label
                key={i}
                htmlFor={id}
                className={`flex items-start gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer transition-colors ${
                  checked
                    ? "border-brand/60 bg-brand/5"
                    : "border-border bg-background hover:border-brand/30"
                }`}
              >
                <input
                  id={id}
                  type="radio"
                  name={`q${index}`}
                  checked={checked}
                  onChange={() => onChange(String(i))}
                  className="mt-0.5 accent-brand"
                />
                <span>{opt}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ExpertSection({
  snippet,
  userAnswers,
  helpfulness,
  onRate,
}: {
  snippet: CodeSnippet;
  userAnswers: Record<number, string>;
  helpfulness: Helpfulness | undefined;
  onRate: (h: Helpfulness) => void;
}) {
  return (
    <div className="mt-8 space-y-5">
      <div className="rounded-lg border border-brand/30 bg-brand/5 p-4">
        <div className="text-xs uppercase tracking-widest text-brand font-bold mb-2 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5" />
          Forfatterens forklaring
        </div>
        <p className="text-sm text-foreground leading-relaxed">
          {snippet.expert.whatItDoes}
        </p>
        <div className="mt-3 text-sm">
          <span className="text-muted-foreground">Anbefalt navn: </span>
          <code className="rounded bg-background px-1.5 py-0.5 text-brand font-mono">
            {snippet.expert.suggestedName}
          </code>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-2">
          Problemer og forbedringer
        </div>
        <ul className="space-y-1.5 text-sm">
          {snippet.expert.problems.map((p, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-destructive shrink-0">•</span>
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-lg border border-success/30 bg-success/5 p-4">
        <div className="text-xs uppercase tracking-widest text-success font-bold mb-2">
          Take-away
        </div>
        <p className="text-sm">{snippet.expert.takeaway}</p>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-3">
          Din vurdering vs ekspert
        </div>
        <div className="space-y-3">
          {snippet.questions.map((q, i) => (
            <ComparisonRow
              key={i}
              question={q}
              userAnswer={userAnswers[i] ?? ""}
              index={i}
            />
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="text-sm font-medium text-foreground mb-2">
          Var dette nyttig?
        </div>
        <div className="flex gap-2">
          {(["ja", "sånn", "nei"] as Helpfulness[]).map((h) => {
            const isActive = helpfulness === h;
            const colorWhenActive =
              h === "ja"
                ? "bg-success text-success-foreground border-success"
                : h === "sånn"
                  ? "bg-muted text-foreground border-border"
                  : "bg-destructive text-destructive-foreground border-destructive";
            return (
              <button
                key={h}
                type="button"
                onClick={() => onRate(h)}
                className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
                  isActive
                    ? colorWhenActive
                    : "border-border bg-background hover:bg-muted"
                }`}
              >
                {h === "ja" ? "Ja" : h === "sånn" ? "Sånn passe" : "Nei"}
              </button>
            );
          })}
        </div>
        {helpfulness && (
          <p className="mt-2 text-xs text-muted-foreground">
            Takk — vi bruker dette til å kalibrere senere snippeter.
          </p>
        )}
      </div>
    </div>
  );
}

function ComparisonRow({
  question,
  userAnswer,
  index,
}: {
  question: Question;
  userAnswer: string;
  index: number;
}) {
  let expertText: string;
  let userText = userAnswer;
  let mcCorrect: boolean | null = null;
  if (question.kind === "mc") {
    expertText = question.options[question.correctIndex] + " — " + question.rationale;
    const userIdx = parseInt(userAnswer, 10);
    userText = Number.isFinite(userIdx) ? question.options[userIdx] ?? "" : "";
    mcCorrect = userIdx === question.correctIndex;
  } else {
    expertText = question.modelAnswer;
  }
  return (
    <div className="border-l-2 border-border pl-3">
      <div className="text-xs font-bold text-brand mb-1">
        Q{index + 1}
        {mcCorrect !== null && (
          <span
            className={`ml-2 ${mcCorrect ? "text-success" : "text-destructive"}`}
          >
            {mcCorrect ? "Riktig" : "Feil"}
          </span>
        )}
      </div>
      <div className="text-xs text-muted-foreground mb-1">Du svarte:</div>
      <div className="text-sm mb-2 whitespace-pre-wrap">
        {userText || <span className="italic text-muted-foreground">(tomt)</span>}
      </div>
      <div className="text-xs text-muted-foreground mb-1">Modell-svar:</div>
      <div className="text-sm whitespace-pre-wrap">{expertText}</div>
    </div>
  );
}
