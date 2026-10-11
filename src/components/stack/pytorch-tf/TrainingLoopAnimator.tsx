import { useEffect, useMemo, useRef, useState } from "react";
import { Play, Pause, RotateCcw, StepForward } from "lucide-react";

// --------------------------------------------------------------------------
// TrainingLoopAnimator — gå gjennom de fem stegene i et PyTorch-loop:
//   1. optimizer.zero_grad()
//   2. logits = model(X)            (forward)
//   3. loss   = loss_fn(logits, y)
//   4. loss.backward()              (gradient regnes)
//   5. optimizer.step()             (vekt oppdateres)
//
// "Glem zero_grad"-toggle viser at gradienter akkumuleres på tvers av
// iterasjoner hvis du hopper over steg 1. Vi simulerer en skalar-regresjon
// y = w·x for å gjøre dynamikken konkret og synlig.
// --------------------------------------------------------------------------

type Step = 0 | 1 | 2 | 3 | 4;

const STEP_NAMES: Record<Step, string> = {
  0: "optimizer.zero_grad()",
  1: "logits = model(X)",
  2: "loss = loss_fn(logits, y)",
  3: "loss.backward()",
  4: "optimizer.step()",
};

const STEP_DESC: Record<Step, string> = {
  0: "Nullstill .grad på alle parametere før vi regner nye gradienter.",
  1: "Forward pass: kjør input gjennom modellen → prediksjon.",
  2: "Sammenlign prediksjon med target → skalar loss.",
  3: "Backward: autograd fyller .grad på hver parameter via kjerne-regelen.",
  4: "Optimizer leser .grad og oppdaterer vekter: w ← w − lr·grad.",
};

const X_TRUE = 2.0; // input
const Y_TRUE = 6.0; // target  → ekte w* = 3.0
const LR = 0.05;

export function TrainingLoopAnimator() {
  const [step, setStep] = useState<Step>(0);
  const [iter, setIter] = useState(0);
  const [w, setW] = useState(0.5);
  const [grad, setGrad] = useState(0);
  const [forgetZero, setForgetZero] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [history, setHistory] = useState<{ iter: number; w: number; loss: number; grad: number }[]>([]);
  const intervalRef = useRef<number | null>(null);

  const pred = w * X_TRUE;
  const loss = (pred - Y_TRUE) ** 2;
  // dL/dw = 2(w·x − y)·x
  const trueGrad = 2 * (pred - Y_TRUE) * X_TRUE;

  const doStep = (s: Step) => {
    if (s === 0) {
      // zero_grad — kun hvis vi IKKE glemmer det
      if (!forgetZero) setGrad(0);
    } else if (s === 1) {
      // forward — beregn pred (vises live)
    } else if (s === 2) {
      // loss — beregn loss (vises live)
    } else if (s === 3) {
      // backward — gradient AKKUMULERES på eksisterende
      setGrad((g) => g + trueGrad);
    } else if (s === 4) {
      // step — w oppdateres med nåværende akkumulert grad
      const newW = w - LR * (grad + (step < 3 ? 0 : 0)); // grad er allerede satt
      setW(newW);
      setHistory((h) => [
        ...h.slice(-19),
        { iter: iter + 1, w: newW, loss, grad },
      ]);
      setIter((i) => i + 1);
    }
  };

  const nextStep = () => {
    const ns = ((step + 1) % 5) as Step;
    doStep(ns);
    setStep(ns);
  };

  const reset = () => {
    setStep(0);
    setIter(0);
    setW(0.5);
    setGrad(0);
    setHistory([]);
    setPlaying(false);
  };

  // Auto-play
  useEffect(() => {
    if (!playing) {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }
    intervalRef.current = window.setInterval(() => {
      if (iter >= 25) {
        setPlaying(false);
        return;
      }
      const ns = ((step + 1) % 5) as Step;
      doStep(ns);
      setStep(ns);
    }, 250);
    return () => {
      if (intervalRef.current !== null) window.clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, step, w, grad, iter, forgetZero]);

  // Auto-reset history når forgetZero endres
  useEffect(() => {
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forgetZero]);

  // Plot
  const W = 360;
  const H = 140;
  const PAD = 20;
  const maxLoss = Math.max(...history.map((h) => h.loss), 16);
  const xPos = (i: number) => PAD + (i / 25) * (W - PAD * 2);
  const yPos = (l: number) => PAD + (1 - Math.min(1, l / maxLoss)) * (H - PAD * 2);
  const lossPath =
    history.length > 0
      ? `M ${xPos(history[0].iter)} ${yPos(history[0].loss)} ` +
        history
          .slice(1)
          .map((h) => `L ${xPos(h.iter)} ${yPos(h.loss)}`)
          .join(" ")
      : "";

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      {/* Kontroller */}
      <div className="flex flex-wrap items-center gap-2 mb-3 text-xs">
        <button
          onClick={() => setPlaying((p) => !p)}
          className="inline-flex items-center gap-1 rounded-md border border-border bg-card hover:bg-muted/40 px-2 py-1"
        >
          {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          {playing ? "Pause" : "Auto-tren"}
        </button>
        <button
          onClick={nextStep}
          disabled={playing}
          className="inline-flex items-center gap-1 rounded-md border border-border bg-card hover:bg-muted/40 px-2 py-1 disabled:opacity-40"
        >
          <StepForward className="h-3.5 w-3.5" /> Neste steg
        </button>
        <button
          onClick={reset}
          className="inline-flex items-center gap-1 rounded-md border border-border bg-card hover:bg-muted/40 px-2 py-1"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reset
        </button>
        <label className="flex items-center gap-1 ml-auto cursor-pointer select-none">
          <input
            type="checkbox"
            checked={forgetZero}
            onChange={(e) => setForgetZero(e.target.checked)}
          />
          <span className={forgetZero ? "text-amber-500 font-semibold" : ""}>
            Glem zero_grad()
          </span>
        </label>
      </div>

      {/* Loop-kode med highlight på aktiv linje */}
      <div className="rounded-md border border-border bg-background/40 p-2 mb-3 font-mono text-xs">
        <div className="text-muted-foreground mb-1">{`for X, y in train_loader:`}</div>
        {([0, 1, 2, 3, 4] as Step[]).map((s) => {
          const active = s === step;
          const isZero = s === 0;
          const skipped = isZero && forgetZero;
          return (
            <div
              key={s}
              className={
                "px-2 py-0.5 rounded transition-colors " +
                (active
                  ? skipped
                    ? "bg-amber-400/20 text-amber-500 line-through"
                    : "bg-brand/15 text-brand"
                  : skipped
                  ? "text-muted-foreground line-through opacity-50"
                  : "text-foreground/80")
              }
            >
              {"    "}
              {STEP_NAMES[s]}
            </div>
          );
        })}
      </div>

      {/* State-panel */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs mb-3">
        {[
          { label: "iter", val: iter.toString(), color: "text-muted-foreground" },
          { label: "w", val: w.toFixed(3), color: "text-foreground" },
          {
            label: "loss",
            val: loss.toFixed(3),
            color: loss < 0.1 ? "text-emerald-500" : loss > 5 ? "text-rose-500" : "text-foreground",
          },
          {
            label: "w.grad",
            val: grad.toFixed(3),
            color:
              Math.abs(grad) > 20 ? "text-rose-500" : forgetZero && iter > 1 ? "text-amber-500" : "text-foreground",
          },
        ].map((c) => (
          <div key={c.label} className="rounded-md border border-border bg-background/40 p-2">
            <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">
              {c.label}
            </div>
            <div className={"font-mono text-base " + c.color}>{c.val}</div>
          </div>
        ))}
      </div>

      {/* Aktivt steg-beskrivelse */}
      <div className="rounded-md border border-brand/30 bg-brand/5 p-2 text-xs mb-3">
        <span className="font-mono font-semibold text-brand">{STEP_NAMES[step]}</span>
        {" — "}
        <span className="text-muted-foreground">{STEP_DESC[step]}</span>
      </div>

      {/* Loss-plot */}
      <div className="rounded-lg border border-border bg-background/40 overflow-hidden">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block">
          {[0, 0.25, 0.5, 0.75, 1].map((t) => (
            <line
              key={t}
              x1={PAD}
              x2={W - PAD}
              y1={PAD + t * (H - PAD * 2)}
              y2={PAD + t * (H - PAD * 2)}
              stroke="currentColor"
              strokeOpacity={0.08}
            />
          ))}
          <text x={PAD - 4} y={PAD + 8} textAnchor="end" fontSize={9} className="fill-muted-foreground">
            {maxLoss.toFixed(1)}
          </text>
          <text x={PAD - 4} y={H - PAD + 3} textAnchor="end" fontSize={9} className="fill-muted-foreground">
            0
          </text>
          <text x={(W) / 2} y={H - 4} textAnchor="middle" fontSize={9} className="fill-muted-foreground">
            iter (mål: loss → 0, w → 3.0)
          </text>
          {lossPath && (
            <path
              d={lossPath}
              fill="none"
              stroke={forgetZero ? "rgb(251,191,36)" : "rgb(34,197,94)"}
              strokeWidth={2}
            />
          )}
          {history.map((h, i) => (
            <circle
              key={i}
              cx={xPos(h.iter)}
              cy={yPos(h.loss)}
              r={2.2}
              fill={forgetZero ? "rgb(251,191,36)" : "rgb(34,197,94)"}
            />
          ))}
        </svg>
      </div>

      {/* Forklaring */}
      <div className="mt-3 text-xs text-muted-foreground leading-relaxed">
        <strong className="text-foreground">Hva å se etter:</strong> normal modus — kjør{" "}
        <em>Auto-tren</em> og se loss falle mot null, w konvergere mot 3.0 (siden y = 2·w
        med target 6).{" "}
        {forgetZero ? (
          <>
            Nå som zero_grad() er <strong className="text-amber-500">av</strong>: hver
            backward LEGGER TIL på forrige .grad i stedet for å erstatte. Etter få
            iterasjoner blir gradienten enorm, w hopper forbi optimum, og loss
            divergerer. Akkurat denne klassen av bug er hvorfor zero_grad alltid står
            først.
          </>
        ) : (
          <>
            Slå på <em>«Glem zero_grad()»</em> for å se hva som skjer hvis du dropper
            steg 1: gradienten akkumulerer på tvers av iterasjoner og treningen
            divergerer.
          </>
        )}
      </div>
    </div>
  );
}
