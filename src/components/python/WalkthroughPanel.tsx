import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, X, ClipboardCopy, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WalkthroughStep } from "@/lib/python/types";

interface Props {
  steps: WalkthroughStep[];
  stepIdx: number;
  onPrev: () => void;
  onNext: () => void;
  onJump: (idx: number) => void;
  onClose: () => void;
  /** Copies the current step's cumulative code into the main editor. */
  onLoadIntoEditor: (code: string) => void;
}

/**
 * Sequential teach-first overlay. Shown when the student presses "Lær først"
 * on an exercise that ships with a walkthrough. Each step shows cumulative
 * code that builds toward the solution plus a short Norwegian explanation
 * of what changed and why.
 */
export function WalkthroughPanel({
  steps,
  stepIdx,
  onPrev,
  onNext,
  onJump,
  onClose,
  onLoadIntoEditor,
}: Props) {
  const safeIdx = Math.min(Math.max(0, stepIdx), steps.length - 1);
  const step = steps[safeIdx];
  const isLast = safeIdx === steps.length - 1;
  const isFirst = safeIdx === 0;

  /** Split prose into paragraphs on blank lines. */
  const paragraphs = useMemo(
    () => step.explanation.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean),
    [step.explanation],
  );

  /** Annotate code lines with optional highlight range. */
  const codeLines = useMemo(() => step.code.split("\n"), [step.code]);
  const hl = step.highlight;

  return (
    <div className="rounded-xl border border-brand/40 bg-brand/[0.04] p-4 mb-3">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-brand" />
          <Badge
            variant="outline"
            className="text-[10px] uppercase tracking-wider border-brand/60 text-brand bg-brand/10"
          >
            Lær først · steg {safeIdx + 1} av {steps.length}
          </Badge>
          <span className="text-sm font-semibold text-foreground">{step.label}</span>
        </div>
        <Button size="sm" variant="ghost" onClick={onClose} className="h-7 w-7 p-0">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Step navigator dots — clickable to jump */}
      <div className="flex flex-wrap items-center gap-1 mb-3">
        {steps.map((s, i) => (
          <button
            key={i}
            onClick={() => onJump(i)}
            title={s.label}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === safeIdx
                ? "w-6 bg-brand"
                : i < safeIdx
                  ? "w-4 bg-brand/40"
                  : "w-4 bg-border hover:bg-muted-foreground/40",
            )}
          />
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_1.1fr] gap-3">
        {/* Left: prose */}
        <div className="space-y-2 text-sm text-foreground/90 leading-relaxed">
          {paragraphs.map((p, i) => (
            <p key={i}>{renderInlineCode(p)}</p>
          ))}
          {step.expectedOutput && (
            <div className="mt-3 rounded-md border border-success/30 bg-success/5 p-2">
              <div className="text-[10px] uppercase tracking-wider text-success font-semibold mb-1">
                Forventet output
              </div>
              <pre className="text-[11px] font-mono whitespace-pre-wrap text-foreground/80">
                {step.expectedOutput}
              </pre>
            </div>
          )}
        </div>

        {/* Right: cumulative code snapshot */}
        <div className="rounded-md border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-3 py-1.5">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Koden så langt
            </span>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 text-[11px]"
              onClick={() => onLoadIntoEditor(step.code)}
              title="Kopier denne koden inn i editoren så du kan kjøre den"
            >
              <ClipboardCopy className="h-3 w-3 mr-1" />
              Last inn i editor
            </Button>
          </div>
          <pre className="text-[11px] font-mono leading-relaxed overflow-auto max-h-[360px]">
            {codeLines.map((line, i) => {
              const lineNo = i + 1;
              const isHighlighted = hl && lineNo >= hl.from && lineNo <= hl.to;
              return (
                <div
                  key={i}
                  className={cn(
                    "flex px-3",
                    isHighlighted && "bg-brand/10 border-l-2 border-brand",
                  )}
                >
                  <span className="text-muted-foreground/60 w-7 text-right pr-2 select-none shrink-0">
                    {lineNo}
                  </span>
                  <span className="whitespace-pre">{line || " "}</span>
                </div>
              );
            })}
          </pre>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <Button size="sm" variant="ghost" onClick={onPrev} disabled={isFirst}>
          <ChevronLeft className="h-3.5 w-3.5 mr-1" />
          Forrige
        </Button>
        <span className="text-[11px] text-muted-foreground">
          {isLast
            ? "Du er på siste steg — prøv selv nå, eller bla tilbake."
            : "Trykk «Neste» for å bygge videre på løsningen."}
        </span>
        {isLast ? (
          <Button size="sm" variant="default" onClick={onClose}>
            Ferdig — prøv selv
          </Button>
        ) : (
          <Button size="sm" variant="default" onClick={onNext}>
            Neste
            <ChevronRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}

/** Replace `code` spans in prose with monospace styling. */
function renderInlineCode(text: string): React.ReactNode {
  const parts = text.split(/(`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={i}
          className="rounded bg-muted px-1 py-0.5 font-mono text-[12px] text-foreground"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return <span key={i}>{part}</span>;
  });
}
