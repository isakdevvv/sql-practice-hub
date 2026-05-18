import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, RotateCcw, Shuffle } from "lucide-react";

type Mode = "counting" | "radix";

function randomInts(n: number, max: number): number[] {
  return Array.from({ length: n }, () => Math.floor(Math.random() * max));
}

// ---- Counting sort steps ----
type CountingStep =
  | { kind: "init"; input: number[]; max: number }
  | { kind: "count"; counts: number[]; readIdx: number }
  | { kind: "prefix"; counts: number[]; prefix: number[]; cursor: number }
  | { kind: "place"; out: (number | null)[]; readIdx: number; bucket: number; outIdx: number; counts: number[] }
  | { kind: "done"; out: number[] };

function countingSteps(input: number[]): CountingStep[] {
  const steps: CountingStep[] = [];
  const max = Math.max(...input);
  steps.push({ kind: "init", input: [...input], max });
  const counts = new Array(max + 1).fill(0);
  for (let i = 0; i < input.length; i++) {
    counts[input[i]]++;
    steps.push({ kind: "count", counts: [...counts], readIdx: i });
  }
  const prefix = [...counts];
  for (let i = 1; i < prefix.length; i++) {
    prefix[i] += prefix[i - 1];
    steps.push({ kind: "prefix", counts: [...counts], prefix: [...prefix], cursor: i });
  }
  const out: (number | null)[] = new Array(input.length).fill(null);
  const work = [...prefix];
  for (let i = input.length - 1; i >= 0; i--) {
    const v = input[i];
    work[v]--;
    const oi = work[v];
    out[oi] = v;
    steps.push({
      kind: "place",
      out: [...out],
      readIdx: i,
      bucket: v,
      outIdx: oi,
      counts: [...work],
    });
  }
  steps.push({ kind: "done", out: out as number[] });
  return steps;
}

// ---- Radix LSD ----
type RadixStep = {
  pass: number; // digit position (0 = ones, 1 = tens, ...)
  before: number[];
  buckets: number[][];
  after: number[];
};

function radixSteps(input: number[]): RadixStep[] {
  const steps: RadixStep[] = [];
  let arr = [...input];
  const max = Math.max(...arr);
  const passes = max === 0 ? 1 : Math.floor(Math.log10(max)) + 1;
  for (let p = 0; p < passes; p++) {
    const div = Math.pow(10, p);
    const buckets: number[][] = Array.from({ length: 10 }, () => []);
    for (const v of arr) buckets[Math.floor(v / div) % 10].push(v);
    const after: number[] = buckets.flat();
    steps.push({ pass: p, before: [...arr], buckets: buckets.map((b) => [...b]), after });
    arr = after;
  }
  return steps;
}

export function RadixCountingSortPage() {
  const [mode, setMode] = useState<Mode>("counting");
  const [input, setInput] = useState<number[]>(() => randomInts(8, 9));
  const [radixInput, setRadixInput] = useState<number[]>(() => randomInts(8, 1000));
  const [step, setStep] = useState(0);

  const cSteps = useMemo(() => countingSteps(input), [input]);
  const rSteps = useMemo(() => radixSteps(radixInput), [radixInput]);

  function reset() {
    setStep(0);
  }
  function shuffle() {
    if (mode === "counting") setInput(randomInts(8, 9));
    else setRadixInput(randomInts(8, 1000));
    setStep(0);
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">
            Counting & Radix sort — ikke-sammenligningsbasert sortering
          </h1>
          <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
            Sorter i O(n+k) eller O(d·(n+k)) ved å telle, ikke sammenligne.
            Steg gjennom counting sort for å se telle-tabell, prefix-sum og
            plassering. Bytt til radix LSD for å se hvordan vi sorterer
            flersifret ved å gjøre én pass per siffer.
          </p>
        </header>

        <div className="flex flex-wrap gap-2 mb-4">
          <ModeTab id="counting" current={mode} onChange={(m) => { setMode(m); setStep(0); }}>
            Counting sort
          </ModeTab>
          <ModeTab id="radix" current={mode} onChange={(m) => { setMode(m); setStep(0); }}>
            Radix LSD
          </ModeTab>
        </div>

        {mode === "counting" ? (
          <CountingView steps={cSteps} step={step} />
        ) : (
          <RadixView steps={rSteps} step={step} />
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
          >
            <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Forrige
          </Button>
          <Button
            size="sm"
            onClick={() =>
              setStep((s) =>
                Math.min((mode === "counting" ? cSteps : rSteps).length - 1, s + 1),
              )
            }
            disabled={step >= (mode === "counting" ? cSteps : rSteps).length - 1}
          >
            Neste <ChevronRight className="h-3.5 w-3.5 ml-1" />
          </Button>
          <span className="text-xs text-muted-foreground">
            Steg {step + 1} / {(mode === "counting" ? cSteps : rSteps).length}
          </span>
          <div className="ml-auto flex gap-2">
            <Button size="sm" variant="outline" onClick={reset} className="gap-1.5">
              <RotateCcw className="h-3.5 w-3.5" /> Nullstill
            </Button>
            <Button size="sm" variant="outline" onClick={shuffle} className="gap-1.5">
              <Shuffle className="h-3.5 w-3.5" /> Nytt input
            </Button>
          </div>
        </div>

        <Lessons mode={mode} />
      </main>
    </div>
  );
}

function ModeTab({
  id,
  current,
  onChange,
  children,
}: {
  id: Mode;
  current: Mode;
  onChange: (m: Mode) => void;
  children: React.ReactNode;
}) {
  const active = id === current;
  return (
    <button
      onClick={() => onChange(id)}
      className={`rounded-md px-3 py-1.5 text-xs font-medium ${
        active ? "bg-brand text-brand-foreground" : "bg-muted hover:bg-accent"
      }`}
    >
      {children}
    </button>
  );
}

function CountingView({ steps, step }: { steps: CountingStep[]; step: number }) {
  const s = steps[Math.min(step, steps.length - 1)];

  let input: number[] = [];
  let counts: number[] = [];
  let prefix: number[] | null = null;
  let out: (number | null)[] | null = null;
  let highlight: number | null = null;
  let outIdx: number | null = null;
  let phase = "";

  if (s.kind === "init") {
    input = s.input;
    counts = new Array(s.max + 1).fill(0);
    phase = "Klar — input er listet under. Trykk Neste for å begynne telling.";
  } else if (s.kind === "count") {
    input = steps[0].kind === "init" ? steps[0].input : [];
    counts = s.counts;
    highlight = s.readIdx;
    phase = `Teller verdi ${input[s.readIdx]} fra index ${s.readIdx}. count[${input[s.readIdx]}]++`;
  } else if (s.kind === "prefix") {
    input = steps[0].kind === "init" ? steps[0].input : [];
    counts = s.counts;
    prefix = s.prefix;
    phase = `Prefix-sum: prefix[${s.cursor}] = prefix[${s.cursor - 1}] + counts[${s.cursor}]. Sluttposisjon for hver verdi.`;
  } else if (s.kind === "place") {
    input = steps[0].kind === "init" ? steps[0].input : [];
    counts = s.counts;
    out = s.out;
    highlight = s.readIdx;
    outIdx = s.outIdx;
    phase = `Plasser input[${s.readIdx}] = ${s.bucket} på output[${s.outIdx}]. Dekk-tabell trekkes ned.`;
  } else {
    input = steps[0].kind === "init" ? steps[0].input : [];
    counts = [];
    out = s.out;
    phase = "Ferdig! Stabil sortering — like verdier beholder relativ rekkefølge.";
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="text-xs text-muted-foreground">{phase}</div>

      <div>
        <Label>Input</Label>
        <Row vals={input} highlight={highlight} />
      </div>

      <div>
        <Label>Counts (counts[v] = antall ganger v forekommer)</Label>
        <IndexRow vals={counts} />
      </div>

      {prefix && (
        <div>
          <Label>Prefix-sum (= sluttposisjon + 1)</Label>
          <IndexRow vals={prefix} />
        </div>
      )}

      {out && (
        <div>
          <Label>Output</Label>
          <Row vals={out.map((v) => (v === null ? "·" : v))} highlight={outIdx} />
        </div>
      )}
    </div>
  );
}

function RadixView({ steps, step }: { steps: RadixStep[]; step: number }) {
  if (steps.length === 0) return null;
  const s = steps[Math.min(step, steps.length - 1)];
  const digitName = ["ener", "tier", "hundrer", "tusen"][s.pass] ?? `10^${s.pass}`;

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="text-xs text-muted-foreground">
        Pass {s.pass + 1} — sorterer på <strong>{digitName}</strong>-sifferet
        ved hjelp av en stabil bøtte-sort.
      </div>

      <div>
        <Label>Før</Label>
        <Row vals={s.before} />
      </div>

      <div>
        <Label>Bøtter</Label>
        <div className="grid grid-cols-10 gap-1.5">
          {s.buckets.map((b, i) => (
            <div key={i} className="rounded border border-border bg-background p-1.5 min-h-12">
              <div className="text-center text-[10px] text-muted-foreground mb-1">
                {i}
              </div>
              <div className="space-y-0.5">
                {b.map((v, j) => (
                  <div key={j} className="rounded bg-brand/10 text-[11px] text-center tabular-nums py-0.5">
                    {v}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label>Etter</Label>
        <Row vals={s.after} />
      </div>
    </div>
  );
}

function Row({
  vals,
  highlight,
}: {
  vals: (number | string)[];
  highlight?: number | null;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {vals.map((v, i) => (
        <div
          key={i}
          className={`min-w-10 rounded border px-2 py-1.5 text-center text-sm tabular-nums ${
            i === highlight
              ? "border-brand bg-brand/20 font-semibold"
              : "border-border bg-background"
          }`}
        >
          {v}
        </div>
      ))}
    </div>
  );
}

function IndexRow({ vals }: { vals: number[] }) {
  return (
    <div className="flex flex-wrap gap-1">
      {vals.map((v, i) => (
        <div
          key={i}
          className="rounded border border-border bg-background px-2 py-1 text-center"
        >
          <div className="text-[10px] text-muted-foreground tabular-nums">{i}</div>
          <div className="text-sm tabular-nums">{v}</div>
        </div>
      ))}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
      {children}
    </div>
  );
}

function Lessons({ mode }: { mode: Mode }) {
  return (
    <section className="mt-8 space-y-3 text-sm">
      <h2 className="text-lg font-semibold">Hvorfor uten sammenligning?</h2>
      <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
        <li>
          Sammenligningsbasert sortering har nedre grense{" "}
          <strong className="text-foreground">Ω(n log n)</strong>. Counting og
          radix bryter denne ved å unngå sammenligninger helt.
        </li>
        <li>
          <strong className="text-foreground">Counting sort:</strong> O(n+k)
          der k = verdiområdet. Verdt det når k er liten (f.eks. 0-255 piksel-verdier).
        </li>
        <li>
          <strong className="text-foreground">Radix LSD:</strong> O(d·(n+k))
          der d = antall siffer. Bra for heltall i et stort, men kjent
          område.
        </li>
        <li>
          Begge er <strong className="text-foreground">stabile</strong> hvis
          implementert med bøtter — like elementer beholder relativ rekkefølge.
          Det er det som gjør radix LSD korrekt: hvert pass må være stabilt.
        </li>
        {mode === "radix" && (
          <li>
            Vi tar enere først, så tiere, så hundrer. Det er kontraintuitivt
            — men det er nettopp fordi stabiliteten gjør at tidligere
            sorteringer "overlever".
          </li>
        )}
      </ul>
    </section>
  );
}
