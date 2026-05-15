import { useEffect, useMemo, useState } from "react";
import { Play, Loader2, Check, X, ChevronLeft, ChevronRight, Lightbulb, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CodeEditor } from "./CodeEditor";
import { FileTree } from "./FileTree";
import { runProject, evaluateLesson, type RunResult } from "@/lib/mini-kurs/runner";
import type { MiniCourse, Lesson } from "@/lib/mini-kurs/types";

interface Props {
  course: MiniCourse;
}

const LESSON_KEY = (courseSlug: string) => `mini-kurs:${courseSlug}:lesson`;
const FILES_KEY = (courseSlug: string, lessonId: string) =>
  `mini-kurs:${courseSlug}:${lessonId}:files`;

export function MiniKursPlayer({ course }: Props) {
  // Hvilken leksjon — persistert i localStorage
  const [lessonIdx, setLessonIdx] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    const stored = localStorage.getItem(LESSON_KEY(course.slug));
    const n = stored ? parseInt(stored, 10) : 0;
    return Number.isNaN(n) || n < 0 || n >= course.lessons.length ? 0 : n;
  });
  const lesson = course.lessons[lessonIdx];

  // Filer for nåværende leksjon — persistert pr leksjon
  const [files, setFiles] = useState<Record<string, string>>(() => {
    if (typeof window === "undefined") return { ...lesson.files };
    const stored = localStorage.getItem(FILES_KEY(course.slug, lesson.id));
    if (!stored) return { ...lesson.files };
    try {
      const parsed = JSON.parse(stored) as Record<string, string>;
      // Sørg for at alle nye filer fra leksjons-definisjonen er med
      return { ...lesson.files, ...parsed };
    } catch {
      return { ...lesson.files };
    }
  });

  const [activeFile, setActiveFile] = useState<string>(lesson.defaultFile);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);
  const [showHint, setShowHint] = useState(false);

  // Bytt leksjon → reset state
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(LESSON_KEY(course.slug), String(lessonIdx));
    const stored = localStorage.getItem(FILES_KEY(course.slug, lesson.id));
    if (stored) {
      try {
        setFiles({ ...lesson.files, ...JSON.parse(stored) });
      } catch {
        setFiles({ ...lesson.files });
      }
    } else {
      setFiles({ ...lesson.files });
    }
    setActiveFile(lesson.defaultFile);
    setResult(null);
    setShowHint(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonIdx, course.slug]);

  // Persistér filer ved hver endring
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(FILES_KEY(course.slug, lesson.id), JSON.stringify(files));
  }, [files, course.slug, lesson.id]);

  const updateFile = (path: string, content: string) => {
    setFiles((prev) => ({ ...prev, [path]: content }));
  };

  const isEditable = lesson.editable.includes(activeFile);

  const handleRun = async () => {
    setRunning(true);
    try {
      const r = await runProject(files, lesson.run);
      setResult(r);
    } finally {
      setRunning(false);
    }
  };

  const handleReset = () => {
    if (confirm("Tilbakestille filene til startstand for denne leksjonen?")) {
      setFiles({ ...lesson.files });
      setActiveFile(lesson.defaultFile);
      setResult(null);
    }
  };

  const evaluation = useMemo(
    () => (result ? evaluateLesson(lesson, result) : null),
    [result, lesson],
  );
  const allPassed = evaluation && evaluation.passed === evaluation.total;

  return (
    <div className="space-y-4">
      {/* Header med leksjons-progresjon */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1">
          <div className="text-[10px] uppercase tracking-wider text-brand font-semibold mb-0.5">
            Leksjon {lessonIdx + 1} av {course.lessons.length}
          </div>
          <h2 className="text-lg font-semibold">{lesson.title}</h2>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            disabled={lessonIdx === 0}
            onClick={() => setLessonIdx((i) => i - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={lessonIdx >= course.lessons.length - 1}
            onClick={() => setLessonIdx((i) => i + 1)}
          >
            Neste <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* Narrative */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
          {lesson.narrative.split("\n").map((line, i) => (
            <p key={i} className="text-sm leading-relaxed mb-2 last:mb-0">
              {renderInline(line)}
            </p>
          ))}
        </div>
      </div>

      {/* Verifications */}
      {lesson.verifications.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-[10px] uppercase tracking-wider text-brand font-semibold mb-2">
            Mål for denne leksjonen
          </div>
          <ul className="text-sm space-y-1">
            {lesson.verifications.map((v, i) => {
              const detail = evaluation?.details[i];
              return (
                <li key={i} className="flex items-start gap-2">
                  {detail ? (
                    detail.ok ? (
                      <Check className="h-4 w-4 text-success mt-0.5 shrink-0" />
                    ) : (
                      <X className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                    )
                  ) : (
                    <span className="h-4 w-4 mt-0.5 shrink-0 rounded border border-muted-foreground/40" />
                  )}
                  <span
                    className={
                      detail?.ok
                        ? "text-success line-through"
                        : "text-foreground"
                    }
                  >
                    {v.label}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Editor + file tree side by side */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="grid lg:grid-cols-[200px_1fr] min-h-[400px]">
          {/* File tree */}
          <aside className="border-b lg:border-b-0 lg:border-r border-border bg-muted/20">
            <div className="px-3 py-2 border-b border-border bg-muted/40 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              Prosjekt-mappe
            </div>
            <FileTree
              files={files}
              activeFile={activeFile}
              editableFiles={lesson.editable}
              onSelect={setActiveFile}
            />
          </aside>

          {/* Editor */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/30">
              <span className="text-xs font-mono">{activeFile}</span>
              {!isEditable && (
                <span className="text-[9px] uppercase tracking-wider text-muted-foreground bg-muted/40 rounded px-1.5">
                  read-only
                </span>
              )}
              <div className="ml-auto flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={handleReset} title="Tilbakestill leksjonen">
                  <RotateCcw className="h-3.5 w-3.5" />
                </Button>
                <Button onClick={handleRun} size="sm" disabled={running}>
                  {running ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                      Kjører...
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5 mr-1" />
                      Kjør
                    </>
                  )}
                </Button>
              </div>
            </div>
            <div className="h-[400px]">
              <CodeEditor
                key={activeFile}
                value={files[activeFile] ?? ""}
                onChange={(v) => updateFile(activeFile, v)}
                path={activeFile}
                readOnly={!isEditable}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Output */}
      {result && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/30">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand">
              Output
            </span>
            {evaluation && (
              <span
                className={`text-xs font-mono ${
                  allPassed ? "text-success" : "text-muted-foreground"
                }`}
              >
                {evaluation.passed} / {evaluation.total} mål bestått
              </span>
            )}
          </div>
          {result.error ? (
            <pre className="text-xs text-destructive p-4 overflow-x-auto whitespace-pre-wrap">
              {result.error}
            </pre>
          ) : lesson.run.kind === "html-preview" ? (
            <iframe
              srcDoc={result.output}
              className="w-full h-[400px] bg-background border-0"
              sandbox="allow-scripts"
              title="HTML preview"
            />
          ) : (
            <pre className="text-xs p-4 overflow-x-auto whitespace-pre-wrap bg-background">
              {result.output || "(ingen output)"}
            </pre>
          )}
        </div>
      )}

      {/* Hint */}
      {lesson.hint && (
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowHint((s) => !s)}
            className="text-xs"
          >
            <Lightbulb className="h-3.5 w-3.5 mr-1" />
            {showHint ? "Skjul hint" : "Vis hint"}
          </Button>
          {showHint && (
            <pre className="mt-2 text-xs bg-muted/40 border border-border rounded-lg p-3 overflow-x-auto">
              {lesson.hint}
            </pre>
          )}
        </div>
      )}

      {/* Neste-knapp når alle mål bestått */}
      {allPassed && lessonIdx < course.lessons.length - 1 && (
        <div className="rounded-xl border border-success/40 bg-success/5 p-4 flex items-center justify-between">
          <span className="text-sm font-semibold text-success">
            Alle mål bestått! Klar for neste leksjon?
          </span>
          <Button onClick={() => setLessonIdx((i) => i + 1)} size="sm">
            Neste leksjon <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
      {allPassed && lessonIdx === course.lessons.length - 1 && (
        <div className="rounded-xl border border-brand/40 bg-brand/5 p-4 text-center">
          <span className="text-sm font-semibold text-brand">
            🎉 Du har fullført hele kurset!
          </span>
        </div>
      )}
    </div>
  );
}

/** Mini-renderer for inline `code` i markdown-like tekst. */
function renderInline(line: string): React.ReactNode {
  // Bare håndter `kode` for nå
  const parts = line.split(/(`[^`]+`)/);
  return parts.map((p, i) => {
    if (p.startsWith("`") && p.endsWith("`")) {
      return (
        <code
          key={i}
          className="font-mono text-xs bg-muted/60 px-1 py-0.5 rounded text-brand"
        >
          {p.slice(1, -1)}
        </code>
      );
    }
    // Håndter **bold**
    const boldParts = p.split(/(\*\*[^*]+\*\*)/);
    return boldParts.map((bp, bi) => {
      if (bp.startsWith("**") && bp.endsWith("**")) {
        return (
          <strong key={`${i}-${bi}`}>{bp.slice(2, -2)}</strong>
        );
      }
      return <span key={`${i}-${bi}`}>{bp}</span>;
    });
  });
}
