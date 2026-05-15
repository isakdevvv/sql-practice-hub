import { useState } from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Lesson, Section } from "@/lib/viz-lesjon/types";
import { ExampleStepper } from "./ExampleStepper";

export function LessonRenderer({ lesson }: { lesson: Lesson }) {
  return (
    <article className="space-y-6">
      {lesson.sections.map((section, i) => (
        <SectionView key={i} section={section} />
      ))}
    </article>
  );
}

function SectionView({ section }: { section: Section }) {
  if (section.kind === "prose") {
    return (
      <div
        className="prose-mini text-sm text-foreground/90 leading-relaxed [&_code]:font-mono [&_code]:text-[0.9em] [&_code]:bg-muted/50 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ul]:my-2 [&_p]:my-2 [&_b]:font-semibold [&_h3]:text-foreground"
        dangerouslySetInnerHTML={{ __html: section.html }}
      />
    );
  }
  if (section.kind === "example") {
    return <ExampleStepper example={section.example} />;
  }
  if (section.kind === "checkpoint") {
    return <Checkpoint {...section} />;
  }
  return null;
}

function Checkpoint({
  question,
  options,
  correctIdx,
  explanation,
}: {
  question: string;
  options: string[];
  correctIdx: number;
  explanation: string;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  const revealed = picked !== null;
  const isCorrect = picked === correctIdx;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="text-[10px] uppercase tracking-wider text-brand font-semibold mb-2">
        Sjekkpunkt
      </div>
      <p className="text-sm font-medium text-foreground mb-3">{question}</p>
      <ul className="space-y-1.5">
        {options.map((opt, i) => {
          const showCorrect = revealed && i === correctIdx;
          const showWrong = revealed && i === picked && i !== correctIdx;
          return (
            <li key={i}>
              <button
                onClick={() => !revealed && setPicked(i)}
                disabled={revealed}
                className={cn(
                  "w-full text-left rounded-md border px-3 py-2 text-[13px] flex items-start gap-2 transition-colors",
                  !revealed &&
                    "border-border hover:border-brand/60 hover:bg-accent/30 cursor-pointer",
                  showCorrect &&
                    "border-success/60 bg-success/10 text-foreground",
                  showWrong &&
                    "border-destructive/60 bg-destructive/10 text-foreground",
                  revealed && !showCorrect && !showWrong && "opacity-50",
                )}
              >
                {revealed && showCorrect && (
                  <Check className="h-4 w-4 text-success shrink-0 mt-0.5" />
                )}
                {revealed && showWrong && (
                  <X className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                )}
                <span>{opt}</span>
              </button>
            </li>
          );
        })}
      </ul>
      {revealed && (
        <div
          className={cn(
            "mt-3 rounded-md border px-3 py-2 text-[12px] leading-relaxed",
            isCorrect
              ? "border-success/40 bg-success/5 text-foreground"
              : "border-border bg-muted/30 text-foreground",
          )}
        >
          <span className="font-semibold">
            {isCorrect ? "Riktig — " : "Ikke helt — "}
          </span>
          {explanation}
        </div>
      )}
    </div>
  );
}
