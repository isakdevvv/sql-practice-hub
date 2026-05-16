import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Award, Circle, Eye, MapPin } from "lucide-react";

// A linear "Del X av N" stepper rendered at the top of each mini-course.
// Each step is an anchor link to a section in the page (#id). The stepper
// tracks three states per section:
//
//   1. Unvisited (open circle) — scroll has never landed here
//   2. Visited (eye icon) — user has scrolled into the section
//   3. Mastered (filled green check) — user has cleared the section's
//      `SectionQuiz` by getting all questions correct at least once
//
// «Visited» is automatic via IntersectionObserver. «Mastered» is set by
// `SectionQuiz` writing to localStorage and dispatching a
// `course-mastered-changed` event, which this component listens to.

export interface CourseStep {
  /** Section title shown on the chip. */
  title: string;
  /** Anchor id — must match the id="..." on the <h2> or section in the page. */
  anchor: string;
}

export interface CourseOutlineProps {
  /** Unique id for this course (used as localStorage key). */
  courseId: string;
  steps: CourseStep[];
}

const VISITED_PREFIX = "sql-practice-course-visited-v1:";
const MASTERED_PREFIX = "sql-practice-course-mastered-v1:";

function loadKey(prefix: string, courseId: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(prefix + courseId);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function saveVisited(courseId: string, set: Set<string>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(VISITED_PREFIX + courseId, JSON.stringify(Array.from(set)));
}

export function CourseOutline({ courseId, steps }: CourseOutlineProps) {
  const [activeAnchor, setActiveAnchor] = useState<string | null>(null);
  const [visited, setVisited] = useState<Set<string>>(() => loadKey(VISITED_PREFIX, courseId));
  const [mastered, setMastered] = useState<Set<string>>(() => loadKey(MASTERED_PREFIX, courseId));

  // IntersectionObserver for «visited» tracking.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const elements = steps
      .map((s) => document.getElementById(s.anchor))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          const id = visible[0].target.id;
          setActiveAnchor(id);
          setVisited((prev) => {
            if (prev.has(id)) return prev;
            const next = new Set(prev);
            next.add(id);
            saveVisited(courseId, next);
            return next;
          });
        }
      },
      { rootMargin: "0px 0px -70% 0px", threshold: 0 },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [courseId, steps]);

  // Listen for mastered-changed events from SectionQuiz (and storage events
  // from other tabs).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const refresh = (e: Event) => {
      const detail = (e as CustomEvent<{ courseId?: string }>).detail;
      if (detail && detail.courseId && detail.courseId !== courseId) return;
      setMastered(loadKey(MASTERED_PREFIX, courseId));
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === MASTERED_PREFIX + courseId) {
        setMastered(loadKey(MASTERED_PREFIX, courseId));
      }
    };
    window.addEventListener("course-mastered-changed", refresh);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("course-mastered-changed", refresh);
      window.removeEventListener("storage", onStorage);
    };
  }, [courseId]);

  const visitedCount = visited.size;
  const masteredCount = mastered.size;
  const total = steps.length;
  const pct = Math.round((masteredCount / total) * 100);

  return (
    <div className="mb-8 rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-brand" />
          <h2 className="font-semibold text-sm">
            Kursoversikt — {masteredCount} mestret · {visitedCount} sett · {total} totalt
          </h2>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="h-1.5 w-32 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-success transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="tabular-nums">{pct}%</span>
        </div>
      </div>
      <ol className="space-y-1">
        {steps.map((s, i) => {
          const isActive = s.anchor === activeAnchor;
          const isVisited = visited.has(s.anchor);
          const isMastered = mastered.has(s.anchor);
          return (
            <li key={s.anchor}>
              <a
                href={`#${s.anchor}`}
                className={cn(
                  "flex items-center gap-3 rounded-md px-2 py-1.5 text-sm transition-colors",
                  isActive
                    ? "bg-brand/10 text-brand"
                    : isMastered
                      ? "text-foreground hover:bg-accent"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center">
                  {isMastered ? (
                    <Award className="h-4 w-4 text-emerald-500" />
                  ) : isVisited ? (
                    <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                  ) : (
                    <Circle className="h-4 w-4" />
                  )}
                </span>
                <span className="text-[11px] font-mono tabular-nums w-12 shrink-0">
                  Del {i + 1}/{total}
                </span>
                <span className="truncate">{s.title}</span>
              </a>
            </li>
          );
        })}
      </ol>
      <div className="mt-3 pt-3 border-t border-border flex items-center gap-3 text-[10px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Circle className="h-3 w-3" /> ikke sett
        </span>
        <span className="inline-flex items-center gap-1">
          <Eye className="h-3 w-3" /> sett
        </span>
        <span className="inline-flex items-center gap-1">
          <Award className="h-3 w-3 text-emerald-500" /> mestret (klart quiz)
        </span>
      </div>
    </div>
  );
}

