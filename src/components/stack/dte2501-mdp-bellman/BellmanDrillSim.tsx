import { useEffect, useMemo, useRef, useState } from "react";

// MDP regnedrill — viser V_k(s) etter k iterasjoner av Value Iteration eller
// Policy Iteration på en liten 2-state MDP. Brukeren kan steppe én iterasjon
// av gangen eller kjøre til konvergens.

// MDP-spek (deterministic, 2 states A og B, 2 actions stay/move):
// state A: stay → A (reward +1), move → B (reward 0)
// state B: stay → B (reward 0), move → A (reward -1)
// Vi diskonterer med γ.

type Algo = "vi" | "pi";

const STATES = ["A", "B"] as const;
type State = (typeof STATES)[number];

const ACTIONS = ["stay", "move"] as const;
type Action = (typeof ACTIONS)[number];

// transition[s][a] = { nextState, reward }
const T: Record<State, Record<Action, { next: State; reward: number }>> = {
  A: {
    stay: { next: "A", reward: 1 },
    move: { next: "B", reward: 0 },
  },
  B: {
    stay: { next: "B", reward: 0 },
    move: { next: "A", reward: -1 },
  },
};

type Step = {
  k: number;
  V: Record<State, number>;
  policy: Record<State, Action>;
  delta: number;
};

function viStep(prev: Record<State, number>, gamma: number): Step {
  const Vnew: Record<State, number> = { A: 0, B: 0 };
  const policy: Record<State, Action> = { A: "stay", B: "stay" };
  let delta = 0;
  for (const s of STATES) {
    let bestVal = -Infinity;
    let bestAct: Action = "stay";
    for (const a of ACTIONS) {
      const { next, reward } = T[s][a];
      const v = reward + gamma * prev[next];
      if (v > bestVal) {
        bestVal = v;
        bestAct = a;
      }
    }
    Vnew[s] = bestVal;
    policy[s] = bestAct;
    delta = Math.max(delta, Math.abs(bestVal - prev[s]));
  }
  return { k: 0, V: Vnew, policy, delta };
}

// PI: full evaluering (vi løser direkte fordi 2 states, 2 ligninger)
// + improvement.
function piIteration(
  policy: Record<State, Action>,
  gamma: number,
): { V: Record<State, number>; newPolicy: Record<State, Action>; stable: boolean } {
  // Evaluation: V^π(s) = R(s, π(s)) + γ V^π(next). 2 likninger, 2 ukjente.
  // V_A = R_A + γ V_{next_A};  V_B = R_B + γ V_{next_B}
  const a_A = policy.A;
  const a_B = policy.B;
  const { next: nA, reward: rA } = T.A[a_A];
  const { next: nB, reward: rB } = T.B[a_B];

  // Matrix form: V = R + γ M V, der M velger ny state. 2x2 lineær system.
  // Bygg likningssystem (I − γ M) V = R.
  const M: number[][] = [
    [0, 0],
    [0, 0],
  ];
  const idx: Record<State, number> = { A: 0, B: 1 };
  M[idx.A][idx[nA]] = 1;
  M[idx.B][idx[nB]] = 1;

  // (I − γM) V = R
  const a11 = 1 - gamma * M[0][0];
  const a12 = -gamma * M[0][1];
  const a21 = -gamma * M[1][0];
  const a22 = 1 - gamma * M[1][1];
  const det = a11 * a22 - a12 * a21;
  const inv11 = a22 / det;
  const inv12 = -a12 / det;
  const inv21 = -a21 / det;
  const inv22 = a11 / det;
  const VA = inv11 * rA + inv12 * rB;
  const VB = inv21 * rA + inv22 * rB;
  const V: Record<State, number> = { A: VA, B: VB };

  // Improvement
  const newPolicy: Record<State, Action> = { A: "stay", B: "stay" };
  let stable = true;
  for (const s of STATES) {
    let bestVal = -Infinity;
    let bestAct: Action = "stay";
    for (const a of ACTIONS) {
      const { next, reward } = T[s][a];
      const v = reward + gamma * V[next];
      if (v > bestVal) {
        bestVal = v;
        bestAct = a;
      }
    }
    newPolicy[s] = bestAct;
    if (bestAct !== policy[s]) stable = false;
  }
  return { V, newPolicy, stable };
}

export function BellmanDrillSim() {
  const [gamma, setGamma] = useState(0.9);
  const [algo, setAlgo] = useState<Algo>("vi");

  // VI state
  const [history, setHistory] = useState<Step[]>([
    { k: 0, V: { A: 0, B: 0 }, policy: { A: "stay", B: "stay" }, delta: Infinity },
  ]);

  // PI state
  const [piPolicy, setPiPolicy] = useState<Record<State, Action>>({
    A: "stay",
    B: "stay",
  });
  const [piHistory, setPiHistory] = useState<
    { k: number; V: Record<State, number>; policy: Record<State, Action>; stable: boolean }[]
  >([{ k: 0, V: { A: 0, B: 0 }, policy: { A: "stay", B: "stay" }, stable: false }]);

  const lastGammaRef = useRef(gamma);
  const lastAlgoRef = useRef(algo);

  useEffect(() => {
    if (lastGammaRef.current !== gamma || lastAlgoRef.current !== algo) {
      setHistory([
        { k: 0, V: { A: 0, B: 0 }, policy: { A: "stay", B: "stay" }, delta: Infinity },
      ]);
      setPiPolicy({ A: "stay", B: "stay" });
      setPiHistory([
        { k: 0, V: { A: 0, B: 0 }, policy: { A: "stay", B: "stay" }, stable: false },
      ]);
      lastGammaRef.current = gamma;
      lastAlgoRef.current = algo;
    }
  }, [gamma, algo]);

  // Optimal value (closed-form for this MDP): stay i A er alltid optimalt.
  // V*(A) = 1 / (1 − γ). V*(B) = best av { stay i B = 0 forever = 0,
  // move til A = -1 + γ · V*(A) }. Velg den størrere.
  const optimal = useMemo(() => {
    const VA_opt = 1 / Math.max(1e-9, 1 - gamma);
    const VB_move = -1 + gamma * VA_opt;
    const VB_stay = 0;
    const VB_opt = Math.max(VB_move, VB_stay);
    const polB: Action = VB_move > VB_stay ? "move" : "stay";
    return { A: VA_opt, B: VB_opt, polA: "stay" as Action, polB };
  }, [gamma]);

  const stepVi = () => {
    setHistory((h) => {
      const last = h[h.length - 1];
      const next = viStep(last.V, gamma);
      next.k = last.k + 1;
      return [...h, next];
    });
  };

  const runViToConvergence = () => {
    setHistory((h) => {
      const result = [...h];
      const THETA = 1e-4;
      const MAX_ITERS = 200;
      let last = result[result.length - 1];
      for (let i = 0; i < MAX_ITERS; i++) {
        const next = viStep(last.V, gamma);
        next.k = last.k + 1;
        result.push(next);
        last = next;
        if (next.delta < THETA) break;
      }
      return result;
    });
  };

  const stepPi = () => {
    const { V, newPolicy, stable } = piIteration(piPolicy, gamma);
    setPiHistory((h) => [
      ...h,
      { k: h.length, V, policy: newPolicy, stable },
    ]);
    setPiPolicy(newPolicy);
  };

  const runPiToConvergence = () => {
    let pol = piPolicy;
    const newHist = [...piHistory];
    for (let i = 0; i < 20; i++) {
      const { V, newPolicy, stable } = piIteration(pol, gamma);
      newHist.push({ k: newHist.length, V, policy: newPolicy, stable });
      pol = newPolicy;
      if (stable) break;
    }
    setPiPolicy(pol);
    setPiHistory(newHist);
  };

  const reset = () => {
    setHistory([
      { k: 0, V: { A: 0, B: 0 }, policy: { A: "stay", B: "stay" }, delta: Infinity },
    ]);
    setPiPolicy({ A: "stay", B: "stay" });
    setPiHistory([
      { k: 0, V: { A: 0, B: 0 }, policy: { A: "stay", B: "stay" }, stable: false },
    ]);
  };

  const lastVi = history[history.length - 1];
  const lastPi = piHistory[piHistory.length - 1];

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex items-center gap-2 rounded border border-border p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setAlgo("vi")}
            className={`rounded px-2 py-1 ${algo === "vi" ? "bg-brand text-brand-foreground" : "hover:bg-muted"}`}
          >
            Value Iteration
          </button>
          <button
            type="button"
            onClick={() => setAlgo("pi")}
            className={`rounded px-2 py-1 ${algo === "pi" ? "bg-brand text-brand-foreground" : "hover:bg-muted"}`}
          >
            Policy Iteration
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-medium">γ = </span>
          <input
            type="range"
            min={0.1}
            max={0.99}
            step={0.01}
            value={gamma}
            onChange={(e) => setGamma(Number(e.target.value))}
            className="w-32"
          />
          <span className="font-mono">{gamma.toFixed(2)}</span>
        </div>

        <button
          type="button"
          onClick={reset}
          className="rounded border border-border px-2 py-1 text-xs hover:bg-muted"
        >
          Reset
        </button>
      </div>

      <div className="mb-4 rounded border border-border bg-muted/20 p-3 text-xs">
        <div className="font-medium mb-1">MDP-spek (2 states A og B, 2 actions):</div>
        <ul className="list-disc pl-5 space-y-0.5 text-muted-foreground">
          <li>A · stay → A, reward +1</li>
          <li>A · move → B, reward 0</li>
          <li>B · stay → B, reward 0</li>
          <li>B · move → A, reward −1</li>
        </ul>
        <div className="mt-1 text-muted-foreground">
          Deterministisk (alle P=1). Optimal trivielt:{" "}
          <span className="font-mono">stay i A</span> bygger evig +1.
        </div>
      </div>

      {algo === "vi" && (
        <>
          <div className="flex gap-2 mb-3">
            <button
              type="button"
              onClick={stepVi}
              className="rounded border border-brand bg-brand/10 px-3 py-1.5 text-xs font-medium hover:bg-brand/20"
            >
              Kjør én VI-iterasjon ▶
            </button>
            <button
              type="button"
              onClick={runViToConvergence}
              className="rounded border border-border px-3 py-1.5 text-xs hover:bg-muted"
            >
              Kjør til konvergens (Δ &lt; 10⁻⁴)
            </button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-border mb-3">
            <table className="w-full text-xs">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-3 py-1.5">k</th>
                  <th className="text-left px-3 py-1.5">V(A)</th>
                  <th className="text-left px-3 py-1.5">V(B)</th>
                  <th className="text-left px-3 py-1.5">π(A)</th>
                  <th className="text-left px-3 py-1.5">π(B)</th>
                  <th className="text-left px-3 py-1.5">Δ</th>
                </tr>
              </thead>
              <tbody>
                {history.slice(-12).map((s, i) => (
                  <tr
                    key={i}
                    className={`border-t border-border ${
                      i === history.slice(-12).length - 1 ? "bg-brand/5 font-medium" : ""
                    }`}
                  >
                    <td className="px-3 py-1 font-mono">{s.k}</td>
                    <td className="px-3 py-1 font-mono">{s.V.A.toFixed(3)}</td>
                    <td className="px-3 py-1 font-mono">{s.V.B.toFixed(3)}</td>
                    <td className="px-3 py-1 font-mono">{s.k === 0 ? "—" : s.policy.A}</td>
                    <td className="px-3 py-1 font-mono">{s.k === 0 ? "—" : s.policy.B}</td>
                    <td className="px-3 py-1 font-mono">
                      {isFinite(s.delta) ? s.delta.toFixed(4) : "∞"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded border border-border bg-muted/20 p-3 text-xs space-y-1">
            <div className="font-medium">Bellman-oppdatering (denne iterasjonen):</div>
            <div className="font-mono">
              V(A) ← max(stay: 1 + γ·V<sub>prev</sub>(A), move: 0 + γ·V<sub>prev</sub>(B)) ={" "}
              {lastVi.V.A.toFixed(3)}
            </div>
            <div className="font-mono">
              V(B) ← max(stay: 0 + γ·V<sub>prev</sub>(B), move: −1 + γ·V<sub>prev</sub>(A)) ={" "}
              {lastVi.V.B.toFixed(3)}
            </div>
            <div className="text-muted-foreground pt-1">
              Optimum (lukket form): V*(A) = 1/(1−γ) = {optimal.A.toFixed(3)}, V*(B) ={" "}
              {optimal.B.toFixed(3)}, π* = (A→{optimal.polA}, B→{optimal.polB})
            </div>
          </div>
        </>
      )}

      {algo === "pi" && (
        <>
          <div className="flex gap-2 mb-3">
            <button
              type="button"
              onClick={stepPi}
              className="rounded border border-brand bg-brand/10 px-3 py-1.5 text-xs font-medium hover:bg-brand/20"
            >
              Kjør én PI-iterasjon ▶
            </button>
            <button
              type="button"
              onClick={runPiToConvergence}
              className="rounded border border-border px-3 py-1.5 text-xs hover:bg-muted"
            >
              Kjør til konvergens
            </button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-border mb-3">
            <table className="w-full text-xs">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-3 py-1.5">k</th>
                  <th className="text-left px-3 py-1.5">π(A)</th>
                  <th className="text-left px-3 py-1.5">π(B)</th>
                  <th className="text-left px-3 py-1.5">V^π(A)</th>
                  <th className="text-left px-3 py-1.5">V^π(B)</th>
                  <th className="text-left px-3 py-1.5">Stabil?</th>
                </tr>
              </thead>
              <tbody>
                {piHistory.map((s, i) => (
                  <tr
                    key={i}
                    className={`border-t border-border ${
                      i === piHistory.length - 1 ? "bg-brand/5 font-medium" : ""
                    }`}
                  >
                    <td className="px-3 py-1 font-mono">{s.k}</td>
                    <td className="px-3 py-1 font-mono">{s.policy.A}</td>
                    <td className="px-3 py-1 font-mono">{s.policy.B}</td>
                    <td className="px-3 py-1 font-mono">{s.V.A.toFixed(3)}</td>
                    <td className="px-3 py-1 font-mono">{s.V.B.toFixed(3)}</td>
                    <td className="px-3 py-1">
                      {i === 0 ? "—" : s.stable ? "✓" : "nei"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded border border-border bg-muted/20 p-3 text-xs space-y-1">
            <div className="font-medium">PI ved iterasjon {lastPi.k}:</div>
            <div className="text-muted-foreground">
              <strong>Evaluation:</strong> løste lineært system (I − γM) V = R for
              gjeldende policy. <strong>Improvement:</strong> for hver state,
              argmax over actions med oppdaterte V.
            </div>
            <div className="text-muted-foreground pt-1">
              Optimum (lukket form): V*(A) = {optimal.A.toFixed(3)}, V*(B) ={" "}
              {optimal.B.toFixed(3)}, π* = (A→{optimal.polA}, B→{optimal.polB})
            </div>
          </div>
        </>
      )}
    </div>
  );
}
