import { useEffect, useRef, useState } from "react";
import { Play, Pause, ChevronLeft, ChevronRight, RotateCcw, FastForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Example } from "@/lib/viz-lesjon/types";
import { IteratorVisualizer } from "./IteratorVisualizer";

interface Props {
  example: Example;
}

const PLAYBACK_MS: Record<"slow" | "normal" | "fast", number> = {
  slow: 1800,
  normal: 1100,
  fast: 600,
};

/**
 * Spiller gjennom et `Example` stegvis. Default-modus er autoplay
 * ("lær først"): brukeren ser løsningen rulle. Etterpå kan de gå
 * manuelt frem/tilbake for å studere hvert øyeblikk.
 */
export function ExampleStepper({ example }: Props) {
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState<"slow" | "normal" | "fast">("normal");
  const total = example.steps.length;
  const step = example.steps[Math.min(idx, total - 1)] ?? null;

  // Autoplay-timer.
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!playing) return;
    if (idx >= total - 1) {
      setPlaying(false);
      return;
    }
    timerRef.current = setTimeout(() => {
      setIdx((i) => Math.min(i + 1, total - 1));
    }, PLAYBACK_MS[speed]);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [playing, idx, total, speed]);

  function reset() {
    setIdx(0);
    setPlaying(true);
  }
  function prev() {
    setPlaying(false);
    setIdx((i) => Math.max(0, i - 1));
  }
  function next() {
    setPlaying(false);
    setIdx((i) => Math.min(total - 1, i + 1));
  }
  function jumpEnd() {
    setPlaying(false);
    setIdx(total - 1);
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="border-b border-border bg-muted/30 px-4 py-2 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            {example.title}
          </h3>
          {example.intro && (
            <p className="text-[12px] text-muted-foreground mt-0.5 max-w-prose">
              {example.intro}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={reset}
            title="Spill fra start"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
          <Button size="sm" variant="outline" onClick={prev} disabled={idx === 0}>
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant={playing ? "secondary" : "default"}
            onClick={() => setPlaying((p) => !p)}
            disabled={idx >= total - 1 && !playing}
          >
            {playing ? (
              <Pause className="h-3.5 w-3.5" />
            ) : (
              <Play className="h-3.5 w-3.5" />
            )}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={next}
            disabled={idx >= total - 1}
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={jumpEnd}
            disabled={idx >= total - 1}
            title="Hopp til siste steg"
          >
            <FastForward className="h-3.5 w-3.5" />
          </Button>
          <select
            value={speed}
            onChange={(e) => setSpeed(e.target.value as typeof speed)}
            className="ml-2 rounded border border-border bg-background text-[11px] px-1.5 py-1 font-mono"
            title="Avspillingshastighet"
          >
            <option value="slow">0.5×</option>
            <option value="normal">1×</option>
            <option value="fast">2×</option>
          </select>
          <span className="ml-2 text-[11px] text-muted-foreground font-mono whitespace-nowrap">
            steg {idx + 1} / {total}
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-0 lg:divide-x divide-border">
        <CodeBlock code={example.code} activeLine={step?.line ?? null} />
        <div className="p-4">
          {step ? (
            <IteratorVisualizer step={step} />
          ) : (
            <div className="text-xs italic text-muted-foreground">
              Trykk play for å spille gjennom kjøringen.
            </div>
          )}
        </div>
      </div>

      {/* Steg-progress + outro */}
      <div className="border-t border-border bg-muted/20 px-4 py-2">
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-brand transition-all duration-300"
            style={{ width: `${((idx + 1) / total) * 100}%` }}
          />
        </div>
        {idx >= total - 1 && example.outro && (
          <p className="mt-3 text-[12px] text-foreground/90 leading-relaxed">
            {example.outro}
          </p>
        )}
      </div>
    </div>
  );
}

/* --------------------------------- CodeBlock -------------------------------- */

function CodeBlock({
  code,
  activeLine,
}: {
  code: string;
  activeLine: number | null;
}) {
  const lines = code.replace(/\n$/, "").split("\n");
  return (
    <div className="bg-background/60 overflow-auto">
      <pre className="text-[12px] font-mono leading-6 m-0 py-3">
        {lines.map((line, i) => {
          const lineNo = i + 1;
          const active = activeLine === lineNo;
          return (
            <div
              key={i}
              className={cn(
                "px-3 flex gap-3 transition-colors duration-200",
                active &&
                  "bg-brand/15 border-l-2 border-brand -ml-[2px] pl-[10px]",
                !active && "border-l-2 border-transparent -ml-[2px] pl-[10px]",
              )}
            >
              <span className="text-muted-foreground select-none w-6 text-right shrink-0 opacity-70">
                {lineNo}
              </span>
              <span
                className={cn(
                  "whitespace-pre",
                  active ? "text-foreground" : "text-foreground/85",
                )}
              >
                {line || " "}
              </span>
            </div>
          );
        })}
      </pre>
    </div>
  );
}
