import * as React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { GLOSSARY, TERM_REGEX, lookupTerm, type GlossaryEntry } from "@/lib/sqlGlossary";

void GLOSSARY; // ensure module init order

interface SqlTextProps {
  children: string;
  className?: string;
}

/**
 * Renders text and auto-wraps recognized SQL keywords with a hover tooltip
 * that explains the term. Multi-word terms like "INNER JOIN" are matched first.
 */
export function SqlText({ children, className }: SqlTextProps) {
  const segments = splitWithGlossary(children);
  return (
    <TooltipProvider delayDuration={200}>
      <span className={className}>
        {segments.map((seg, i) =>
          seg.entry ? (
            <KeywordTooltip key={i} entry={seg.entry}>
              {seg.text}
            </KeywordTooltip>
          ) : (
            <React.Fragment key={i}>{seg.text}</React.Fragment>
          ),
        )}
      </span>
    </TooltipProvider>
  );
}

function KeywordTooltip({
  entry,
  children,
}: {
  entry: GlossaryEntry;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="cursor-help underline decoration-dotted decoration-brand/60 underline-offset-4 hover:decoration-brand">
          {children}
        </span>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="max-w-sm bg-popover text-popover-foreground border border-border shadow-lg p-3 text-left"
      >
        <div className="space-y-1.5">
          <div className="flex items-baseline gap-2">
            <span className="font-mono font-semibold text-brand">{entry.term}</span>
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
              {entry.category}
            </span>
          </div>
          <div className="text-xs font-medium">{entry.short}</div>
          <p className="text-xs text-muted-foreground leading-relaxed">{entry.description}</p>
          {entry.example && (
            <pre className="mt-1 rounded bg-muted px-2 py-1 text-[11px] font-mono whitespace-pre-wrap leading-snug">
              {entry.example}
            </pre>
          )}
          {entry.seeAlso && entry.seeAlso.length > 0 && (
            <div className="text-[10px] text-muted-foreground">
              Se også:{" "}
              <span className="font-mono">{entry.seeAlso.join(" · ")}</span>
            </div>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

interface Segment {
  text: string;
  entry?: GlossaryEntry;
}

function splitWithGlossary(input: string): Segment[] {
  const segments: Segment[] = [];
  let lastIndex = 0;
  TERM_REGEX.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = TERM_REGEX.exec(input)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: input.slice(lastIndex, match.index) });
    }
    const entry = lookupTerm(match[0]);
    segments.push({ text: match[0], entry });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < input.length) {
    segments.push({ text: input.slice(lastIndex) });
  }
  return segments;
}
