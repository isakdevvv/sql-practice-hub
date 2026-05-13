import { useEffect, useMemo, useState } from "react";

interface Question {
  prompt: string;
  /** Accept any of these as correct. Compared by normalize. */
  answers: string[];
  hint?: string;
  explanation?: string;
}

const QUESTIONS: Question[] = [
  {
    prompt: "Hvor mange brukbare host-er i et /24-nett?",
    answers: ["254"],
    explanation: "2^(32−24) = 256 total. Minus 2 (network + broadcast) = 254.",
  },
  {
    prompt: "Hvor mange brukbare host-er i et /28-nett?",
    answers: ["14"],
    explanation: "2^(32−28) = 16 total. Minus 2 = 14.",
  },
  {
    prompt: "Hva er broadcast for 192.168.10.0/26?",
    answers: ["192.168.10.63"],
    explanation: "/26 → 64 adresser per subnet. Første: .0–.63. Broadcast = .63.",
  },
  {
    prompt: "Hva er network address for IP 172.16.20.137 med maske /20?",
    answers: ["172.16.16.0"],
    explanation: "Maske /20 = 255.255.240.0. 20 AND 240 = 16. Network = 172.16.16.0.",
  },
  {
    prompt: "Hvilket prefix gir EKSAKT 30 brukbare host-er?",
    answers: ["/27", "27"],
    explanation: "2^5 = 32 total. Minus 2 = 30. Det er /27.",
  },
  {
    prompt: "Hvor mange /28-subnet kan du dele 192.168.1.0/24 opp i?",
    answers: ["16"],
    explanation: "/24 har 256 adresser. /28 har 16 adresser. 256/16 = 16 subnet.",
  },
  {
    prompt: "Hva er første brukbare IP i 10.0.0.0/29?",
    answers: ["10.0.0.1"],
    explanation: "/29 = 8 adresser. .0 = network, .1–.6 = brukbare, .7 = broadcast.",
  },
  {
    prompt: "Hva er subnet-masken for /22 i dotted decimal?",
    answers: ["255.255.252.0"],
    explanation: "22 enere: 11111111.11111111.11111100.00000000 = 255.255.252.0.",
  },
];

export function VlsmTrainer() {
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState("");
  const [shown, setShown] = useState<"none" | "correct" | "wrong">("none");
  const [score, setScore] = useState({ ok: 0, total: 0 });
  const q = QUESTIONS[idx];

  useEffect(() => {
    setInput("");
    setShown("none");
  }, [idx]);

  function check() {
    const norm = input.trim().toLowerCase();
    const isOk = q.answers.some((a) => a.toLowerCase() === norm);
    setShown(isOk ? "correct" : "wrong");
    setScore((s) => ({ ok: s.ok + (isOk ? 1 : 0), total: s.total + 1 }));
  }
  function next() {
    setIdx((i) => (i + 1) % QUESTIONS.length);
  }

  const progress = useMemo(() => `${score.ok}/${score.total}`, [score]);

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          Spørsmål {idx + 1} av {QUESTIONS.length} · Score: <span className="font-mono">{progress}</span>
        </div>
        <button onClick={next} className="text-xs px-2 py-1 rounded-md border border-border hover:border-brand/40">
          Hopp →
        </button>
      </div>
      <p className="text-sm font-medium">{q.prompt}</p>
      <div className="flex gap-2 flex-wrap">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && check()}
          spellCheck={false}
          className="font-mono text-sm flex-1 min-w-[14rem] bg-background border border-border rounded-md px-2 py-1.5"
          placeholder="ditt svar..."
        />
        <button
          onClick={check}
          className="text-xs px-3 py-1 rounded-md bg-brand text-brand-foreground font-semibold"
        >
          Sjekk
        </button>
      </div>
      {shown === "correct" && (
        <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-300">
          ✓ Riktig. {q.explanation}
          <div className="mt-1">
            <button onClick={next} className="underline">
              Neste spørsmål →
            </button>
          </div>
        </div>
      )}
      {shown === "wrong" && (
        <div className="rounded-md border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-700 dark:text-rose-300">
          ✗ Ikke helt. Fasit: <code className="font-mono">{q.answers[0]}</code>. {q.explanation}
          <div className="mt-1">
            <button onClick={next} className="underline">
              Neste spørsmål →
            </button>
          </div>
        </div>
      )}
      {q.hint && <p className="text-[11px] text-muted-foreground italic">Hint: {q.hint}</p>}
    </div>
  );
}
