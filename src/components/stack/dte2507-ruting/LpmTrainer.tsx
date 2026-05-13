import { useMemo, useState } from "react";
import { Check, RefreshCw, X } from "lucide-react";

type Route = {
  prefix: string;
  nextHop: string;
  iface: string;
};

const ROUTES: Route[] = [
  { prefix: "0.0.0.0/0", nextHop: "10.0.0.1", iface: "wan0" },
  { prefix: "10.0.0.0/8", nextHop: "—", iface: "lan0" },
  { prefix: "10.1.0.0/16", nextHop: "10.0.1.1", iface: "eth1" },
  { prefix: "10.1.2.0/24", nextHop: "10.0.1.2", iface: "eth2" },
  { prefix: "10.1.2.128/25", nextHop: "10.0.1.3", iface: "eth3" },
  { prefix: "192.168.1.0/24", nextHop: "—", iface: "lan1" },
];

type Q = {
  ip: string;
  correctPrefix: string;
  why: string;
};

const QUESTIONS: Q[] = [
  {
    ip: "10.1.2.50",
    correctPrefix: "10.1.2.0/24",
    why: "Matcher 10.0.0.0/8, 10.1.0.0/16 og 10.1.2.0/24 (men ikke /25 — fjerde oktet 50 < 128). Lengste match = /24.",
  },
  {
    ip: "10.1.2.200",
    correctPrefix: "10.1.2.128/25",
    why: "Matcher /8, /16, /24 og /25 (200 ≥ 128 ⇒ matcher 10.1.2.128/25). Lengste = /25.",
  },
  {
    ip: "10.1.5.10",
    correctPrefix: "10.1.0.0/16",
    why: "Matcher /8 og /16. Ingen /24 dekker 10.1.5.0/24. Lengste = /16.",
  },
  {
    ip: "10.99.0.5",
    correctPrefix: "10.0.0.0/8",
    why: "Bare /8 matcher (10.99 er ikke i 10.1-rommet). Default-ruten dekker også, men /8 er lengre.",
  },
  {
    ip: "172.16.5.5",
    correctPrefix: "0.0.0.0/0",
    why: "Ingen spesifikk rute. Default-ruten (/0) er den eneste matchen — pakken sendes ut wan0.",
  },
  {
    ip: "192.168.1.42",
    correctPrefix: "192.168.1.0/24",
    why: "Eksakt match på /24. Lengre enn default-ruten.",
  },
];

function pick(): number {
  return Math.floor(Math.random() * QUESTIONS.length);
}

export function LpmTrainer() {
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const q = QUESTIONS[qIdx];

  const isCorrect = useMemo(
    () => selected === q.correctPrefix,
    [selected, q.correctPrefix]
  );

  function pickRoute(prefix: string) {
    if (showAnswer) return;
    setSelected(prefix);
    setShowAnswer(true);
  }

  function nextQ() {
    let next = qIdx;
    while (next === qIdx && QUESTIONS.length > 1) next = pick();
    setQIdx(next);
    setSelected(null);
    setShowAnswer(false);
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="border-b border-border bg-muted/30 px-4 py-2 flex items-center justify-between">
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          Longest-prefix-match trener
        </div>
        <button
          type="button"
          onClick={nextQ}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card hover:border-brand/40 text-xs font-medium px-2 py-1"
        >
          <RefreshCw className="h-3 w-3" /> Ny IP
        </button>
      </div>

      <div className="p-5">
        <p className="text-sm text-muted-foreground mb-2">
          Hvilken rute matcher denne destinasjon-IP-en?
        </p>
        <div className="text-2xl font-mono text-brand mb-4">{q.ip}</div>

        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left font-semibold px-3 py-2">Prefix</th>
                <th className="text-left font-semibold px-3 py-2">Next hop</th>
                <th className="text-left font-semibold px-3 py-2">Iface</th>
                <th className="text-left font-semibold px-3 py-2 w-20"></th>
              </tr>
            </thead>
            <tbody>
              {ROUTES.map((r) => {
                const isPicked = selected === r.prefix;
                const isAnswer = r.prefix === q.correctPrefix;
                let stateClass = "";
                if (showAnswer) {
                  if (isAnswer) stateClass = "bg-emerald-500/10";
                  else if (isPicked && !isAnswer) stateClass = "bg-destructive/10";
                }
                return (
                  <tr
                    key={r.prefix}
                    className={`border-t border-border cursor-pointer hover:bg-muted/30 ${stateClass}`}
                    onClick={() => pickRoute(r.prefix)}
                  >
                    <td className="px-3 py-2 font-mono">{r.prefix}</td>
                    <td className="px-3 py-2 font-mono text-muted-foreground">{r.nextHop}</td>
                    <td className="px-3 py-2 font-mono text-muted-foreground">{r.iface}</td>
                    <td className="px-3 py-2 text-right">
                      {showAnswer && isAnswer ? (
                        <Check className="h-4 w-4 text-emerald-600 inline" />
                      ) : showAnswer && isPicked && !isAnswer ? (
                        <X className="h-4 w-4 text-destructive inline" />
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {showAnswer && (
          <div
            className={`mt-4 rounded-lg border p-4 text-sm ${
              isCorrect
                ? "border-emerald-500/40 bg-emerald-500/5"
                : "border-destructive/40 bg-destructive/5"
            }`}
          >
            <div
              className={`font-semibold mb-1 ${
                isCorrect ? "text-emerald-700 dark:text-emerald-400" : "text-destructive"
              }`}
            >
              {isCorrect ? "Riktig!" : `Feil. Riktig svar: ${q.correctPrefix}`}
            </div>
            <p className="text-[12.5px] text-muted-foreground leading-relaxed">{q.why}</p>
            <button
              type="button"
              onClick={nextQ}
              className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-brand text-brand-foreground text-xs font-medium px-3 py-1.5"
            >
              Neste IP <RefreshCw className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
