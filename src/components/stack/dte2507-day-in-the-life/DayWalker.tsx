import { useEffect, useRef, useState, type FC } from "react";
import { Play, Pause, ChevronLeft, ChevronRight, SkipBack } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NetworkScene } from "./NetworkScene";
import { STEPS, PHASE_RANGES, type Phase } from "./steps";

const PHASE_LABELS: Record<Phase, string> = {
  "DHCP": "1. DHCP",
  "DNS+ARP": "2. DNS + ARP",
  "Routing": "3. Ruting",
  "TCP+HTTP": "4. TCP + HTTP",
};

const PHASE_COLORS: Record<Phase, string> = {
  "DHCP": "bg-brand/15 text-brand border-brand/40",
  "DNS+ARP": "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/40",
  "Routing": "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/40",
  "TCP+HTTP": "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40",
};

export const DayWalker: FC = () => {
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const step = STEPS[idx];

  useEffect(() => {
    if (!playing) return;
    timerRef.current = setTimeout(() => {
      setIdx((i) => {
        if (i >= STEPS.length - 1) {
          setPlaying(false);
          return i;
        }
        return i + 1;
      });
    }, 2400);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [idx, playing]);

  const goTo = (n: number) => {
    setPlaying(false);
    setIdx(Math.max(0, Math.min(STEPS.length - 1, n)));
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Phase chips — click to jump to phase start */}
      <div className="flex flex-wrap gap-2 p-3 border-b border-border bg-muted/30">
        {(Object.keys(PHASE_RANGES) as Phase[]).map((phase) => {
          const range = PHASE_RANGES[phase];
          const active = step.phase === phase;
          return (
            <button
              key={phase}
              onClick={() => goTo(range.from - 1)}
              className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-colors ${
                active ? PHASE_COLORS[phase] : "border-border text-muted-foreground hover:bg-muted"
              }`}
              aria-label={`Hopp til fase ${PHASE_LABELS[phase]} (steg ${range.from}-${range.to})`}
            >
              {PHASE_LABELS[phase]} · steg {range.from}-{range.to}
            </button>
          );
        })}
      </div>

      {/* Network diagram */}
      <div className="p-4">
        <NetworkScene step={step} />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 px-4 py-2 border-t border-border bg-muted/20">
        <Button
          variant="outline"
          size="sm"
          onClick={() => goTo(0)}
          disabled={idx === 0}
          aria-label="Hopp til start"
        >
          <SkipBack className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => goTo(idx - 1)}
          disabled={idx === 0}
          aria-label="Forrige steg"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant={playing ? "secondary" : "default"}
          size="sm"
          onClick={() => setPlaying((p) => !p)}
          className="min-w-[100px]"
        >
          {playing ? (
            <>
              <Pause className="h-4 w-4 mr-1" />
              Pause
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-1" />
              Spill av
            </>
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => goTo(idx + 1)}
          disabled={idx >= STEPS.length - 1}
          aria-label="Neste steg"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <div className="ml-auto text-sm text-muted-foreground font-mono">
          Steg {step.n} / {STEPS.length}
        </div>
      </div>

      {/* Step detail */}
      <div className="p-5 border-t border-border">
        <div className="flex items-baseline gap-3 mb-2">
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${
              PHASE_COLORS[step.phase]
            }`}
          >
            {PHASE_LABELS[step.phase]}
          </span>
          <h3 className="text-base font-semibold">
            <span className="text-brand mr-2">{step.n}.</span>
            {step.title}
          </h3>
        </div>

        <p className="text-sm leading-relaxed mb-3">{step.what}</p>

        <details className="text-sm text-muted-foreground mb-3">
          <summary className="cursor-pointer font-medium text-foreground hover:text-brand transition-colors">
            Detaljer
          </summary>
          <p className="mt-2 leading-relaxed">{step.detail}</p>
        </details>

        {/* Protocol stack */}
        {(step.layers.app || step.layers.transport || step.layers.network || step.layers.link) && (
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground bg-muted/40 px-3 py-1.5">
              Protokoll-lag
            </div>
            <div className="divide-y divide-border">
              {step.layers.app && (
                <LayerRow color="text-emerald-700 dark:text-emerald-300" label="App" value={step.layers.app} />
              )}
              {step.layers.transport && (
                <LayerRow color="text-purple-700 dark:text-purple-300" label="Transport" value={step.layers.transport} />
              )}
              {step.layers.network && (
                <LayerRow color="text-amber-700 dark:text-amber-300" label="Nettverk" value={step.layers.network} />
              )}
              {step.layers.link && (
                <LayerRow color="text-brand" label="Link" value={step.layers.link} />
              )}
            </div>
          </div>
        )}

        {step.ref && (
          <div className="mt-3 text-xs text-muted-foreground italic">
            ↪ {step.ref}
          </div>
        )}
      </div>

      {/* Step picker — compact strip of 24 buttons */}
      <div className="px-4 py-3 border-t border-border bg-muted/20">
        <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-2">
          Hopp til steg
        </div>
        <div className="grid grid-cols-12 gap-1">
          {STEPS.map((s, i) => {
            const isActive = i === idx;
            return (
              <button
                key={s.n}
                onClick={() => goTo(i)}
                className={`text-[10px] font-mono py-1 rounded transition-colors ${
                  isActive
                    ? "bg-brand text-brand-foreground font-bold"
                    : "bg-muted hover:bg-muted-foreground/20 text-muted-foreground"
                }`}
                title={`${s.n}. ${s.title}`}
                aria-label={`Hopp til steg ${s.n}: ${s.title}`}
              >
                {s.n}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const LayerRow: FC<{ color: string; label: string; value: string }> = ({ color, label, value }) => (
  <div className="flex items-start gap-3 px-3 py-2">
    <span className={`text-[10px] uppercase tracking-wider font-semibold w-16 shrink-0 ${color}`}>
      {label}
    </span>
    <code className="text-xs font-mono leading-relaxed flex-1 whitespace-pre-wrap break-all">
      {value}
    </code>
  </div>
);
