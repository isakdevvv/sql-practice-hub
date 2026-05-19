import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { BookOpen, GitBranch, RotateCcw } from "lucide-react";

type Tab = "intro" | "live";

export function Dte2501MctsPage() {
  const [tab, setTab] = useState<Tab>("intro");
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">MCTS — Monte Carlo Tree Search</h1>
          <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
            AIMA kap. 5.4. Hvordan AlphaGo og moderne spill-AI søker — uten å vurdere ALLE trekk.
            Bygger på dte2501-minimax og dte2501-bandits.
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
            active={tab === "live"}
            onClick={() => setTab("live")}
            icon={<GitBranch className="h-3.5 w-3.5" />}
          >
            1. MCTS-tre live
          </TabBtn>
        </div>
        {tab === "intro" && <Intro onPick={setTab} />}
        {tab === "live" && <MctsModule />}
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
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border-b-2 -mb-px transition-colors ${active ? "border-brand text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
    >
      {icon}
      {children}
    </button>
  );
}
function Def({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="font-semibold text-foreground">{term}</dt>
      <dd className="text-muted-foreground mt-0.5">{children}</dd>
    </div>
  );
}

function Intro({ onPick }: { onPick: (t: Tab) => void }) {
  return (
    <div className="space-y-4 text-sm">
      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-base font-semibold mb-2">Bygger på</h2>
        <ul className="list-disc pl-5 text-muted-foreground space-y-1">
          <li>
            <strong className="text-foreground">Minimax + alpha-beta</strong> (
            <code>dte2501-minimax</code>): du har sett hvordan tradisjonell spill-AI søker hele
            spill-treet. Problem: forgreningsfaktoren b i Go er ~250 — umulig å søke dypt.
          </li>
          <li>
            <strong className="text-foreground">Multi-armed bandits + UCB</strong> (
            <code>dte2501-bandits</code>): du har sett UCB1-formelen som balanserer exploration vs
            exploitation.
          </li>
        </ul>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-base font-semibold mb-2">Hvorfor MCTS?</h2>
        <p className="text-muted-foreground">
          Minimax krever en evaluerings-funksjon på blader: «hvor god er denne stillingen?». For
          sjakk har vi hånd-tunede funksjoner (material + posisjon). For Go: ingen god heuristikk
          finnes — for komplekst.
        </p>
        <p className="text-muted-foreground mt-2">
          MCTS-idéen: gjør IKKE noen evaluering. I stedet, fra en gitt stilling, spill «random
          rollouts» til spillet slutter, og lær fra hvem som vant. Etter mange tusen rollouts
          begynner mønstre å vises.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-base font-semibold mb-2">De 4 fasene i én iterasjon</h2>
        <dl className="space-y-2.5 text-[13px]">
          <Def term="1. Selection">
            Start ved roten. Følg en sti nedover treet ved å velge barnet med høyest UCB1-score.
            Slutt ved en node som har et ikke-utvidet barn.
          </Def>
          <Def term="2. Expansion">
            Legg til ett NYTT barn-node for et trekk vi ikke har prøvd enda.
          </Def>
          <Def term="3. Simulation (rollout)">
            Fra det nye barnet, spill spillet til slutt med tilfeldige trekk. Få et utfall: +1
            (vunnet), 0 (uavgjort), -1 (tapt).
          </Def>
          <Def term="4. Backpropagation">
            Gå tilbake opp stien fra det nye barnet til rota. Oppdater hver node: visits += 1, wins
            += utfall.
          </Def>
        </dl>
        <p className="text-muted-foreground mt-2">
          Gjenta. Etter N iterasjoner: velg trekket fra rota som har høyest visit count (mest
          pålitelig statistikk, ikke høyest win-rate som kan være tilfeldig).
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-base font-semibold mb-2">Ordbok</h2>
        <dl className="space-y-2.5 text-[13px]">
          <Def term="UCB1-formel (Upper Confidence Bound)">
            For å velge barn under selection: maksimer{" "}
            <code>wins/visits + c·√(ln(parent.visits) / visits)</code>. Første ledd: empirisk
            win-rate (exploitation). Andre ledd: usikkerhets-bonus (exploration). c styrer balansen
            (typisk c = √2).
          </Def>
          <Def term="Rollout-policy">
            Hvordan man velger trekk under simulation. Ren MCTS = uniform random. AlphaGo brukte et
            lite nevralt nett som «vurderte» neste trekk under rollout, ikke ren random.
          </Def>
          <Def term="Forgreningsfaktor (b)">
            Antall mulige trekk per posisjon. Sjakk ≈ 35, Go ≈ 250, tic-tac-toe ≤ 9. MCTS skaler
            bedre med b enn minimax.
          </Def>
          <Def term="Anytime-algoritme">
            MCTS kan stoppes når som helst og gi det beste hittil-funnet svaret. Minimax må kjøre
            ferdig til en gitt dybde for å være korrekt.
          </Def>
        </dl>
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={() => onPick("live")}>
          Start på modul 1 →
        </Button>
      </div>
    </div>
  );
}

// MCTS på tic-tac-toe
type Cell = "X" | "O" | ".";
type Board = Cell[];
type MctsNode = {
  board: Board;
  player: "X" | "O";
  move?: number;
  parent?: MctsNode;
  children: MctsNode[];
  visits: number;
  wins: number;
  untried: number[];
};

const EMPTY_BOARD: Board = Array(9).fill(".");

function legalMoves(b: Board): number[] {
  return b.map((c, i) => (c === "." ? i : -1)).filter((i) => i >= 0);
}
function winner(b: Board): Cell | null {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (const [a, c, e] of lines) {
    if (b[a] !== "." && b[a] === b[c] && b[c] === b[e]) return b[a];
  }
  if (b.every((c) => c !== ".")) return null;
  return null;
}
function isDraw(b: Board): boolean {
  return b.every((c) => c !== ".") && !winner(b);
}
function isTerminal(b: Board): boolean {
  return winner(b) !== null || isDraw(b);
}

function rollout(b: Board, player: "X" | "O"): number {
  const board = [...b];
  let cur = player;
  while (!isTerminal(board)) {
    const moves = legalMoves(board);
    const m = moves[Math.floor(Math.random() * moves.length)];
    board[m] = cur;
    cur = cur === "X" ? "O" : "X";
  }
  const w = winner(board);
  if (w === null) return 0;
  return w === "X" ? 1 : -1; // utfall fra X' perspektiv
}

function ucb1(child: MctsNode, parent: MctsNode, c: number): number {
  if (child.visits === 0) return Infinity;
  return child.wins / child.visits + c * Math.sqrt(Math.log(parent.visits) / child.visits);
}

function makeNode(board: Board, player: "X" | "O", move?: number, parent?: MctsNode): MctsNode {
  return {
    board,
    player,
    move,
    parent,
    children: [],
    visits: 0,
    wins: 0,
    untried: legalMoves(board),
  };
}

function mctsIteration(root: MctsNode) {
  // 1. Selection
  let node = root;
  while (node.untried.length === 0 && node.children.length > 0 && !isTerminal(node.board)) {
    let best = node.children[0];
    let bestScore = -Infinity;
    for (const ch of node.children) {
      const score = ucb1(ch, node, Math.SQRT2);
      if (score > bestScore) {
        bestScore = score;
        best = ch;
      }
    }
    node = best;
  }
  // 2. Expansion
  if (node.untried.length > 0 && !isTerminal(node.board)) {
    const mi = Math.floor(Math.random() * node.untried.length);
    const move = node.untried[mi];
    node.untried.splice(mi, 1);
    const newBoard = [...node.board];
    newBoard[move] = node.player;
    const nextPlayer: "X" | "O" = node.player === "X" ? "O" : "X";
    const child = makeNode(newBoard, nextPlayer, move, node);
    node.children.push(child);
    node = child;
  }
  // 3. Simulation
  const result = rollout(node.board, node.player);
  // 4. Backpropagation — fra X' perspektiv. Nodens win-tally er fra spillerens side som SKAL flytte i denne noden.
  let cur: MctsNode | undefined = node;
  while (cur) {
    cur.visits++;
    // Node representerer stillingen der `cur.player` skal flytte. Den forrige spilleren gjorde trekket.
    const wonForUs = cur.player === "X" ? result === -1 : result === 1;
    if (wonForUs) cur.wins++;
    cur = cur.parent;
  }
}

function MctsModule() {
  const [root, setRoot] = useState<MctsNode>(() => makeNode([...EMPTY_BOARD], "X"));
  const [iters, setIters] = useState(0);

  function step(n = 1) {
    const r = root;
    for (let i = 0; i < n; i++) mctsIteration(r);
    setRoot({ ...r });
    setIters(iters + n);
  }
  function reset() {
    setRoot(makeNode([...EMPTY_BOARD], "X"));
    setIters(0);
  }

  // Velg «best move» = barn med flest visits
  let bestChild: MctsNode | null = null;
  for (const ch of root.children) {
    if (!bestChild || ch.visits > bestChild.visits) bestChild = ch;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
        <strong className="text-foreground">Tic-tac-toe MCTS:</strong> X skal flytte. Trykk «+1
        iterasjon» for å se én komplett MCTS-runde (selection → expansion → simulation → backprop).
        Eller «+100» for å la den lære. Du ser stats per mulig første-trekk for X.
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex gap-1.5 mb-3">
          <Button size="sm" onClick={() => step(1)}>
            +1 iterasjon
          </Button>
          <Button size="sm" onClick={() => step(10)}>
            +10
          </Button>
          <Button size="sm" onClick={() => step(100)}>
            +100
          </Button>
          <Button size="sm" variant="outline" onClick={reset}>
            <RotateCcw className="h-3 w-3" />
          </Button>
          <span className="text-xs text-muted-foreground self-center ml-2">
            Iterasjoner: {iters}
          </span>
          <span className="text-xs text-muted-foreground self-center ml-2">
            Root visits: {root.visits}
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
              Rot-stilling (X skal flytte)
            </div>
            <BoardView board={root.board} />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
              Anbefalt trekk
            </div>
            {bestChild ? (
              <div>
                <BoardView board={bestChild.board} highlight={bestChild.move} />
                <div className="text-xs text-muted-foreground mt-1">
                  Mest besøkt: posisjon {bestChild.move} ({bestChild.visits} visits, win-rate{" "}
                  {((bestChild.wins / Math.max(1, bestChild.visits)) * 100).toFixed(0)}%)
                </div>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">Kjør minst én iterasjon</div>
            )}
          </div>
        </div>

        <div className="mt-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
            Statistikk per første-trekk
          </div>
          <div className="grid gap-1.5 sm:grid-cols-3">
            {root.children
              .sort((a, b) => b.visits - a.visits)
              .map((ch) => (
                <div
                  key={ch.move}
                  className="rounded border border-border bg-background p-2 text-xs"
                >
                  <div className="font-mono">Trekk → pos {ch.move}</div>
                  <div className="text-[11px] text-muted-foreground">
                    visits: {ch.visits} · wins: {ch.wins.toFixed(0)} · WR:{" "}
                    {((ch.wins / Math.max(1, ch.visits)) * 100).toFixed(0)}%
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    UCB1: {root.visits > 0 ? ucb1(ch, root, Math.SQRT2).toFixed(2) : "—"}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function BoardView({ board, highlight }: { board: Board; highlight?: number }) {
  return (
    <div className="inline-grid grid-cols-3 gap-1 p-2 rounded bg-muted">
      {board.map((c, i) => (
        <div
          key={i}
          className={`w-10 h-10 rounded flex items-center justify-center font-mono font-bold text-lg ${
            highlight === i
              ? "bg-brand text-white"
              : c === "."
                ? "bg-background text-muted-foreground"
                : "bg-card border border-border"
          }`}
        >
          {c === "." ? "" : c}
        </div>
      ))}
    </div>
  );
}

function Lessons() {
  return (
    <section className="mt-10 space-y-3 text-sm">
      <h2 className="text-lg font-semibold">Oppsummering</h2>
      <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
        <li>
          <strong className="text-foreground">
            MCTS er probabilistisk og asymptotisk optimal.
          </strong>{" "}
          Med uendelig tid konvergerer den til minimax-løsningen.
        </li>
        <li>
          <strong className="text-foreground">AlphaGo (2016) bygde på MCTS</strong> + to nevrale
          nett: et policy network for å lede selection mot lovende trekk, et value network for å
          unngå randomness i rollouts.
        </li>
        <li>
          <strong className="text-foreground">AlphaZero (2017)</strong> droppet alle hånd-tunede
          heuristikker. Bare MCTS + nevrale nett trent fra self-play. Slo verdensmesteren i sjakk,
          shogi og Go.
        </li>
        <li>
          MCTS brukes også utenfor spill: planning, scheduling, NLP-decoding. Anywhere du har et
          stort tre å søke i og en mulighet til simulasjoner.
        </li>
      </ul>
    </section>
  );
}
