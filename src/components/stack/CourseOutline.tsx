import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, MapPin } from "lucide-react";

// A linear "Del X av N" stepper rendered at the top of each mini-course.
// Each step is an anchor link to a section in the page (#id). The stepper
// tracks scroll position to highlight the currently-visible section, and
// persists "visited" state per course in localStorage so the learner can see
// progress through the course content even if they jump between pages.

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

const STORAGE_PREFIX = "sql-practice-course-visited-v1:";

function loadVisited(courseId: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + courseId);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function saveVisited(courseId: string, set: Set<string>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_PREFIX + courseId, JSON.stringify(Array.from(set)));
}

export function CourseOutline({ courseId, steps }: CourseOutlineProps) {
  const [activeAnchor, setActiveAnchor] = useState<string | null>(null);
  const [visited, setVisited] = useState<Set<string>>(() => loadVisited(courseId));

  // Track which section is currently in viewport — that's the "active" step.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const elements = steps
      .map((s) => document.getElementById(s.anchor))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the topmost section that's currently intersecting.
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
      // Mark a section as "active" once its top crosses 30% of the viewport
      { rootMargin: "0px 0px -70% 0px", threshold: 0 },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [courseId, steps]);

  const visitedCount = visited.size;
  const total = steps.length;
  const pct = Math.round((visitedCount / total) * 100);

  return (
    <div className="mb-8 rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-brand" />
          <h2 className="font-semibold text-sm">
            Kursoversikt — {visitedCount} av {total} deler sett
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
          return (
            <li key={s.anchor}>
              <a
                href={`#${s.anchor}`}
                className={cn(
                  "flex items-center gap-3 rounded-md px-2 py-1.5 text-sm transition-colors",
                  isActive
                    ? "bg-brand/10 text-brand"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center">
                  {isVisited ? (
                    <CheckCircle2 className="h-4 w-4 text-success" />
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
    </div>
  );
}
