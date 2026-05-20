import { useEffect, useMemo, useRef, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { BookOpen, Grid3x3, Play, Pause, RotateCcw } from "lucide-react";
import { VisualDefs } from "@/components/stack/kurose-kurs/VisualDefs";
import {
  ModelFreeIcon,
  QTableIcon,
  AlphaIcon,
  GammaIcon,
  TdErrorIcon,
  QUpdateIcon,
  EpsilonGreedyIcon,
} from "@/components/stack/mlIcons";

type Tab = "intro" | "qlearning";

export function Dte2501TdQlearningPage() {
  const [tab, setTab] = useState<Tab>("intro");
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">TD-læring & Q-learning — gridworld</h1>
          <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
            Hvordan en agent lærer hva som er bra uten å vite kartet. Sutton & Barto kap. 6 + AIMA
            kap. 21. Bygger på dte2501-mdp-bellman og dte2501-bandits.
          </p>
        </header>

        <div className="mb-4 flex flex-wrap gap-1.5 border-b border-border">
          <TabBtn
            active={tab === "intro"}
            onClick={() => setTab("intro")}
            icon={<BookOpen className="h-3.5 w-3.5" />}
          >
            0. Start her
          </TabBtn>
          <TabBtn
            active={tab === "qlearning"}
            onClick={() => setTab("qlearning")}
            icon={<Grid3x3 className="h-3.5 w-3.5" />}
          >
            1. Q-learning live
          </TabBtn>
        </div>

        {tab === "intro" && <Intro onPick={setTab} />}
        {tab === "qlearning" && <QLearningModule />}

        <Lessons />
      </main>
    </div>
  );
}

function TabBtn({
  children,
  active,
  onClick,
  icon,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border-b-2 -mb-px transition-colors ${
        active
          ? "border-brand text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

function Intro({ onPick }: { onPick: (t: Tab) => void }) {
  return (
    <div className="space-y-4 text-sm">
      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-base font-semibold mb-2">Bakgrunn — bygger på</h2>
        <ul className="list-disc pl-5 text-muted-foreground space-y-1">
          <li>
            <strong className="text-foreground">MDP &amp; Bellman</strong> (stack-side{" "}
            <code>dte2501-mdp-bellman</code>): vi vet allerede hva en tilstand, en handling, og en
            belønning er, og hvordan <em>value iteration</em> regner ut den optimale verdien for
            hver celle hvis vi <em>kjenner</em> reglene for verden.
          </li>
          <li>
            <strong className="text-foreground">Bandits</strong> (stack-side{" "}
            <code>dte2501-bandits</code>): vi vet hvordan en agent kan velge mellom <em>kjent</em>{" "}
            godt og <em>nytt</em> ukjent (exploration vs exploitation, ε-greedy, UCB).
          </li>
        </ul>
        <p className="text-muted-foreground mt-2">
          Det vi <strong className="text-foreground">ikke</strong> har gjort enda: hva hvis agenten
          ikke vet sannsynlighetene for å havne i en tilstand? Det er der TD-læring og Q-learning
          kommer inn.
        </p>
      </div>

      <VisualDefs
        title="Nye ord vi trenger"
        items={[
          {
            term: "Modell-fri (model-free)",
            icon: <ModelFreeIcon />,
            body: (
              <>
                Agenten kjenner IKKE sannsynlighetene <code>P(s' | s, a)</code> eller belønningene
                på forhånd. Den må prøve seg fram og lære av faktiske opplevelser. (Motsatt:
                «model-based» = value iteration har modellen.)
              </>
            ),
          },
          {
            term: "Q-verdi Q(s, a)",
            icon: <QTableIcon />,
            body: "«Hvor god er det å være i tilstand s og velge handling a, hvis jeg deretter spiller optimalt?» Et tall per (tilstand, handling)-par. Tabell med rader = tilstander, kolonner = handlinger.",
          },
          {
            term: "α (alpha) — læringsrate",
            icon: <AlphaIcon />,
            body: "Hvor mye agenten justerer Q etter hver nye opplevelse. α = 1.0 betyr «glem alt jeg trodde, ta det nye estimatet». α = 0.1 betyr «bland 10% nytt med 90% gammelt». Mellom 0 og 1.",
          },
          {
            term: "γ (gamma) — discount-faktor",
            icon: <GammaIcon />,
            body: "Hvor mye agenten bryr seg om fremtidige belønninger vs nåværende. γ = 0.9 betyr «en belønning om 1 steg er verdt 0.9 av den samme nå». Mellom 0 og 1. Lavt γ = kortsynt; høyt γ = tålmodig.",
          },
          {
            term: "TD-error (temporal-difference error)",
            icon: <TdErrorIcon />,
            body: (
              <>
                Forskjellen mellom det vi trodde Q(s, a) var, og det den nye opplevelsen sier:{" "}
                <code>δ = r + γ·max_a' Q(s', a') − Q(s, a)</code>. Hvis δ er positiv var det BEDRE
                enn vi trodde, og vi øker Q.
              </>
            ),
          },
          {
            term: "Q-learning oppdateringsregel",
            icon: <QUpdateIcon />,
            body: (
              <>
                Etter hver handling: <code>Q(s, a) ← Q(s, a) + α·δ</code>. Det er hele algoritmen.
                Gjenta til Q-tabellen stabiliserer seg.
              </>
            ),
          },
          {
            term: "ε-greedy",
            icon: <EpsilonGreedyIcon />,
            body: "Med sannsynlighet ε velger agenten en helt tilfeldig handling (explore). Med sannsynlighet 1−ε velger den den med høyest Q-verdi (exploit). Som vi så i bandits-modulen.",
          },
        ]}
      />

      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-base font-semibold mb-2">Hvordan modulen er bygd opp</h2>
        <p className="text-muted-foreground">
          Du får en gridworld der agenten starter et sted og skal til et mål. Noen celler er feller
          (negativ belønning). Trykk «Step» for å se én opplevelse oppdatere én Q-celle. Trykk
          «Kjør» for autoplay. Etter noen hundre steg har Q-tabellen lært hvilken vei som er best —{" "}
          <em>uten at vi noen gang fortalte den reglene</em>.
        </p>
        <div className="mt-3">
          <Button size="sm" onClick={() => onPick("qlearning")}>
            Start på modul 1 →
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MODUL 1 — Q-learning gridworld
// ============================================================

const GRID_W = 5;
const GRID_H = 4;
// Reward map. -1 = vegg, 10 = mål, -10 = felle, 0 = nøytral.
// Default: enkel layout.
const DEFAULT_REWARDS = [
  [0, 0, 0, 0, 10],
  [0, -10, 0, -10, 0],
  [0, 0, 0, 0, 0],
  [0, 0, -10, 0, 0],
];
const START = [3, 0] as [number, number];
const GOAL_R = 10;
const TRAP_R = -10;

type Action = 0 | 1 | 2 | 3; // up, right, down, left
const ACTIONS: Action[] = [0, 1, 2, 3];
const DXY: Record<Action, [number, number]> = { 0: [-1, 0], 1: [0, 1], 2: [1, 0], 3: [0, -1] };
const ACT_NAMES = ["↑", "→", "↓", "←"];

function isTerminal(r: number, c: number, rewards: number[][]) {
  return rewards[r][c] === GOAL_R || rewards[r][c] === TRAP_R;
}

function QLearningModule() {
  const [alpha, setAlpha] = useState(0.3);
  const [gamma, setGamma] = useState(0.9);
  const [epsilon, setEpsilon] = useState(0.2);
  const [rewards] = useState(DEFAULT_REWARDS);
  const [Q, setQ] = useState<number[][][]>(() =>
    Array.from({ length: GRID_H }, () => Array.from({ length: GRID_W }, () => [0, 0, 0, 0])),
  );
  const [pos, setPos] = useState<[number, number]>(START);
  const [last, setLast] = useState<{
    s: [number, number];
    a: Action;
    sNext: [number, number];
    r: number;
    delta: number;
  } | null>(null);
  const [episodes, setEpisodes] = useState(0);
  const [steps, setSteps] = useState(0);
  const [running, setRunning] = useState(false);
  const runRef = useRef(false);

  function chooseAction(r: number, c: number): Action {
    if (Math.random() < epsilon) return ACTIONS[Math.floor(Math.random() * 4)];
    const qs = Q[r][c];
    let best: Action = 0;
    for (let a = 1; a < 4; a++) if (qs[a as Action] > qs[best]) best = a as Action;
    return best;
  }

  function stepOnce() {
    const [r, c] = pos;
    if (isTerminal(r, c, rewards)) {
      // Reset episode
      setPos(START);
      setEpisodes((e) => e + 1);
      setLast(null);
      return;
    }
    const a = chooseAction(r, c);
    const [dr, dc] = DXY[a];
    const nr = Math.max(0, Math.min(GRID_H - 1, r + dr));
    const nc = Math.max(0, Math.min(GRID_W - 1, c + dc));
    const reward = rewards[nr][nc];
    const oldQ = Q[r][c][a];
    const maxNext = isTerminal(nr, nc, rewards) ? 0 : Math.max(...Q[nr][nc]);
    const delta = reward + gamma * maxNext - oldQ;
    const newQ = oldQ + alpha * delta;
    setQ((prev) => {
      const next = prev.map((row) => row.map((cell) => [...cell]));
      next[r][c][a] = newQ;
      return next;
    });
    setLast({ s: [r, c], a, sNext: [nr, nc], r: reward, delta });
    setPos([nr, nc]);
    setSteps((s) => s + 1);
  }

  // Auto-run loop
  useEffect(() => {
    runRef.current = running;
    if (!running) return;
    let cancelled = false;
    const loop = () => {
      if (cancelled || !runRef.current) return;
      stepOnce();
      setTimeout(loop, 40);
    };
    loop();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  function reset() {
    setQ(Array.from({ length: GRID_H }, () => Array.from({ length: GRID_W }, () => [0, 0, 0, 0])));
    setPos(START);
    setLast(null);
    setEpisodes(0);
    setSteps(0);
    setRunning(false);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
        <strong className="text-foreground">Hva du ser:</strong> agenten (blå sirkel) starter
        nederst til venstre. Målet (grønn) er øverst til høyre. Røde celler er feller (−10). Hver
        celle viser de fire Q-verdiene (en per handling). I starten er alt 0 — agenten vet
        ingenting. Trykk «Step» én gang for å se ÉN opplevelse oppdatere ÉN Q-verdi. Eller «Kjør»
        for autoplay.
      </div>

      <div className="rounded-xl border border-border bg-card p-4 grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <GridView Q={Q} pos={pos} rewards={rewards} last={last} />
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="text-muted-foreground">
              α (læringsrate): <span className="font-mono font-semibold">{alpha.toFixed(2)}</span>
            </label>
            <input
              type="range"
              min={0.05}
              max={1}
              step={0.05}
              value={alpha}
              onChange={(e) => setAlpha(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="text-muted-foreground">
              γ (discount): <span className="font-mono font-semibold">{gamma.toFixed(2)}</span>
            </label>
            <input
              type="range"
              min={0.5}
              max={0.99}
              step={0.01}
              value={gamma}
              onChange={(e) => setGamma(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="text-muted-foreground">
              ε (explore): <span className="font-mono font-semibold">{epsilon.toFixed(2)}</span>
            </label>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={epsilon}
              onChange={(e) => setEpsilon(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="flex gap-1.5 pt-2">
            <Button size="sm" onClick={stepOnce}>
              Step
            </Button>
            <Button
              size="sm"
              variant={running ? "default" : "outline"}
              onClick={() => setRunning((v) => !v)}
            >
              {running ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}{" "}
              {running ? "Pause" : "Kjør"}
            </Button>
            <Button size="sm" variant="outline" onClick={reset}>
              <RotateCcw className="h-3 w-3" />
            </Button>
          </div>

          <div className="rounded border border-border bg-background p-2 space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Episoder</span>
              <span className="font-mono">{episodes}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Steg totalt</span>
              <span className="font-mono">{steps}</span>
            </div>
          </div>

          {last && (
            <div className="rounded border border-amber-500/40 bg-amber-500/5 p-2 space-y-0.5 text-[11px]">
              <div className="font-semibold">Siste opplevelse</div>
              <div>
                s = ({last.s[0]},{last.s[1]}), a = {ACT_NAMES[last.a]}
              </div>
              <div>
                s' = ({last.sNext[0]},{last.sNext[1]}), r = {last.r}
              </div>
              <div className="font-mono">δ = {last.delta.toFixed(2)}</div>
              <div className="text-muted-foreground">
                {last.delta > 0
                  ? "Bedre enn forventet → øker Q"
                  : last.delta < 0
                    ? "Verre enn forventet → senker Q"
                    : "Som forventet"}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function GridView({
  Q,
  pos,
  rewards,
  last,
}: {
  Q: number[][][];
  pos: [number, number];
  rewards: number[][];
  last: {
    s: [number, number];
    a: Action;
    sNext: [number, number];
    r: number;
    delta: number;
  } | null;
}) {
  return (
    <div
      className="grid gap-1"
      style={{ gridTemplateColumns: `repeat(${GRID_W}, minmax(0, 1fr))` }}
    >
      {rewards.map((row, r) =>
        row.map((rew, c) => {
          const isPos = pos[0] === r && pos[1] === c;
          const isLast = last && last.s[0] === r && last.s[1] === c;
          const qs = Q[r][c];
          const bestA = qs.indexOf(Math.max(...qs));
          const allZero = qs.every((v) => v === 0);
          return (
            <div
              key={`${r}-${c}`}
              className={`aspect-square rounded relative border ${
                rew === GOAL_R
                  ? "bg-success/20 border-success"
                  : rew === TRAP_R
                    ? "bg-destructive/20 border-destructive"
                    : "bg-card border-border"
              } ${isLast ? "ring-2 ring-amber-400" : ""}`}
            >
              {isPos && (
                <div className="absolute inset-2 rounded-full bg-brand/80 z-10 flex items-center justify-center text-[10px] text-white font-mono">
                  A
                </div>
              )}
              {rew === GOAL_R && (
                <div className="absolute top-0.5 right-1 text-[10px] font-bold text-success">
                  +10
                </div>
              )}
              {rew === TRAP_R && (
                <div className="absolute top-0.5 right-1 text-[10px] font-bold text-destructive">
                  −10
                </div>
              )}
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 text-[8px] font-mono p-0.5 leading-tight">
                <div />
                <div
                  className={`text-center ${bestA === 0 && !allZero ? "text-brand font-bold" : "text-muted-foreground"}`}
                >
                  {qs[0].toFixed(1)}
                </div>
                <div />
                <div
                  className={`text-left ${bestA === 3 && !allZero ? "text-brand font-bold" : "text-muted-foreground"}`}
                >
                  {qs[3].toFixed(1)}
                </div>
                <div />
                <div
                  className={`text-right ${bestA === 1 && !allZero ? "text-brand font-bold" : "text-muted-foreground"}`}
                >
                  {qs[1].toFixed(1)}
                </div>
                <div />
                <div
                  className={`text-center ${bestA === 2 && !allZero ? "text-brand font-bold" : "text-muted-foreground"}`}
                >
                  {qs[2].toFixed(1)}
                </div>
                <div />
              </div>
            </div>
          );
        }),
      )}
    </div>
  );
}

function Lessons() {
  return (
    <section className="mt-10 space-y-3 text-sm">
      <h2 className="text-lg font-semibold">Oppsummering</h2>
      <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
        <li>
          Q-learning lærer den optimale strategien <em>uten å kjenne reglene</em>. Det er
          forskjellen fra value iteration (som krever overgangs-sannsynligheter).
        </li>
        <li>
          TD-erroren <code>δ = r + γ·max Q(s') − Q(s, a)</code> er det algoritmen «hører» fra
          verden: «du forventet x, du fikk y, juster.»
        </li>
        <li>
          ε-greedy holder agenten åpen for nye veier — uten den ville den bare gjenta det første
          brukbare hun fant.
        </li>
        <li>
          Neste skritt: <em>SARSA</em> (samme oppdatering men med faktisk neste handling i stedet
          for max), <em>function approximation</em> (Q som nevralt nett i stedet for tabell — DQN),
          og <em>policy gradient</em> (lær handlingen direkte, ikke verdien).
        </li>
      </ul>
    </section>
  );
}
