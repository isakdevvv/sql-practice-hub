import { useMemo, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";

// --------------------------------------------------------------------------
// Interaktiv visualisering av hash-tabeller.
// Tre strategier: separate chaining, linear probing, double hashing.
// Hver insert/lookup/delete animerer probe-sekvensen og logger handlingen.
// Hash-funksjon h(k) = sum(ord(c)) % m vises live mens man skriver nøkkelen.
// --------------------------------------------------------------------------

type Mode = "chaining" | "linear" | "double";

type Entry = {
  id: number;
  key: string;
  /** Animasjons-fase: "new" → fade-in i sin endelige slot. "leaving" → fade-out. */
  phase?: "new" | "leaving";
  /** Tombstone-markør (kun open addressing). Slot er "tom for insert", men probe-sekvensen må fortsette ved lookup. */
  tomb?: boolean;
};

type LogEntry = {
  op: string;
  detail: string;
  probes: number;
  result?: "ok" | "not_found" | "full";
};

const MODES: { id: Mode; label: string; sub: string }[] = [
  { id: "chaining", label: "Separate chaining", sub: "bucket = lenke av entries" },
  { id: "linear", label: "Linear probing", sub: "h, h+1, h+2, …" },
  { id: "double", label: "Double hashing", sub: "h, h+h2, h+2·h2, …" },
];

const MODE_NOTE: Record<Mode, string> = {
  chaining: "Hver slot er en bucket (lenkeliste). Kollisjoner stables — α kan gå over 1.",
  linear: "Flat array. Ved kollisjon: prøv neste slot framover. Cache-vennlig, men gir clustering.",
  double: "Step-size kommer fra h2(k) = 1 + (sum(ord(c)) % (m-1)). Bedre spredning enn linear.",
};

const SUGGESTIONS = ["Ane", "Bo", "Cia", "Dag", "Eli", "Ola", "Tor", "Liv", "Per", "Kim"];

// ----- Hash-funksjoner (enkle, deterministiske — passer til pedagogikk) -----

function hash1(key: string, m: number): number {
  let s = 0;
  for (let i = 0; i < key.length; i++) s += key.charCodeAt(i);
  return s % m;
}

/** Sekundær hash for double hashing — alltid 1..m-1 så vi får full probe-dekning. */
function hash2(key: string, m: number): number {
  if (m <= 1) return 1;
  let s = 0;
  for (let i = 0; i < key.length; i++) s += key.charCodeAt(i);
  return 1 + (s % (m - 1));
}

function rawSum(key: string): number {
  let s = 0;
  for (let i = 0; i < key.length; i++) s += key.charCodeAt(i);
  return s;
}

export function HashTableVisualizer() {
  const [mode, setMode] = useState<Mode>("chaining");
  const [m, setM] = useState<number>(7);
  const [input, setInput] = useState<string>("Ane");
  const [log, setLog] = useState<LogEntry[]>([]);
  const [probeTrail, setProbeTrail] = useState<number[]>([]);
  /** Bucket-state for chaining: m lister med entries. */
  const [buckets, setBuckets] = useState<Entry[][]>(() =>
    Array.from({ length: 7 }, () => [] as Entry[]),
  );
  /** Slot-state for open addressing: lengde m, null = tom slot. */
  const [slots, setSlots] = useState<(Entry | null)[]>(() =>
    Array.from({ length: 7 }, () => null),
  );
  /** Akkumulert probe-statistikk for å regne snitt. */
  const [probeStats, setProbeStats] = useState<{ total: number; count: number }>({ total: 0, count: 0 });
  const idRef = useRef(0);

  // Antall entries totalt (for load-factor).
  const n = useMemo(() => {
    if (mode === "chaining") return buckets.reduce((acc, b) => acc + b.length, 0);
    return slots.reduce((acc, s) => acc + (s && !s.tomb ? 1 : 0), 0);
  }, [mode, buckets, slots]);

  const alpha = m === 0 ? 0 : n / m;
  const avgProbe = probeStats.count === 0 ? 0 : probeStats.total / probeStats.count;

  // ------------ Helpers ------------

  const makeEntry = (key: string): Entry => ({ id: ++idRef.current, key, phase: "new" });

  const resetAll = (nextMode = mode, nextM = m) => {
    setBuckets(Array.from({ length: nextM }, () => [] as Entry[]));
    setSlots(Array.from({ length: nextM }, () => null));
    setLog([]);
    setProbeTrail([]);
    setProbeStats({ total: 0, count: 0 });
    setMode(nextMode);
    setM(nextM);
  };

  const switchMode = (next: Mode) => resetAll(next, m);
  const changeM = (next: number) => resetAll(mode, next);

  const pushLog = (entry: LogEntry) => setLog((l) => [entry, ...l].slice(0, 8));
  const settleNew = () => {
    setTimeout(() => {
      setBuckets((bs) =>
        bs.map((b) => b.map((e) => (e.phase === "new" ? { ...e, phase: undefined } : e))),
      );
      setSlots((ss) => ss.map((s) => (s && s.phase === "new" ? { ...s, phase: undefined } : s)));
    }, 380);
  };

  const flashProbe = (trail: number[]) => {
    setProbeTrail(trail);
    setTimeout(() => setProbeTrail([]), 900);
  };

  // ------------ Operasjoner: chaining ------------

  const chainInsert = (key: string) => {
    const idx = hash1(key, m);
    const bucket = buckets[idx];
    // Oppdatering hvis nøkkelen finnes fra før — behold posisjon, bytt id for animasjon.
    const existing = bucket.findIndex((e) => e.key === key);
    let nextBuckets: Entry[][];
    if (existing >= 0) {
      nextBuckets = buckets.map((b, i) =>
        i === idx
          ? b.map((e, j) => (j === existing ? { ...makeEntry(key) } : e))
          : b,
      );
    } else {
      nextBuckets = buckets.map((b, i) => (i === idx ? [...b, makeEntry(key)] : b));
    }
    setBuckets(nextBuckets);
    settleNew();
    flashProbe([idx]);
    pushLog({
      op: `insert("${key}")`,
      detail: `h("${key}") = ${rawSum(key)} % ${m} = ${idx} → bucket[${idx}]${
        existing >= 0 ? " (oppdatert)" : ""
      }`,
      probes: 1,
    });
    setProbeStats((s) => ({ total: s.total + 1, count: s.count + 1 }));
  };

  const chainLookup = (key: string) => {
    const idx = hash1(key, m);
    const bucket = buckets[idx];
    flashProbe([idx]);
    let steps = 0;
    for (const e of bucket) {
      steps++;
      if (e.key === key) {
        pushLog({
          op: `lookup("${key}")`,
          detail: `bucket[${idx}] — fant etter ${steps} sammenligning${steps === 1 ? "" : "er"}`,
          probes: steps,
          result: "ok",
        });
        setProbeStats((s) => ({ total: s.total + steps, count: s.count + 1 }));
        return;
      }
    }
    pushLog({
      op: `lookup("${key}")`,
      detail: `bucket[${idx}] gjennomsøkt (${steps || 0}), ikke funnet`,
      probes: Math.max(1, steps),
      result: "not_found",
    });
    setProbeStats((s) => ({ total: s.total + Math.max(1, steps), count: s.count + 1 }));
  };

  const chainDelete = (key: string) => {
    const idx = hash1(key, m);
    const bucket = buckets[idx];
    const found = bucket.find((e) => e.key === key);
    if (!found) {
      flashProbe([idx]);
      pushLog({
        op: `delete("${key}")`,
        detail: `bucket[${idx}] — ikke funnet`,
        probes: 1,
        result: "not_found",
      });
      return;
    }
    // Animer ut, så fjern.
    setBuckets((bs) =>
      bs.map((b, i) =>
        i === idx ? b.map((e) => (e.id === found.id ? { ...e, phase: "leaving" } : e)) : b,
      ),
    );
    flashProbe([idx]);
    setTimeout(() => {
      setBuckets((bs) =>
        bs.map((b, i) => (i === idx ? b.filter((e) => e.id !== found.id) : b)),
      );
    }, 340);
    pushLog({
      op: `delete("${key}")`,
      detail: `bucket[${idx}] — fjernet entry`,
      probes: 1,
      result: "ok",
    });
  };

  // ------------ Operasjoner: open addressing ------------

  const probeStep = (key: string, i: number): number => {
    if (mode === "linear") return (hash1(key, m) + i) % m;
    if (mode === "double") return (hash1(key, m) + i * hash2(key, m)) % m;
    return hash1(key, m);
  };

  const openInsert = (key: string) => {
    const h = hash1(key, m);
    const h2 = mode === "double" ? hash2(key, m) : null;
    const trail: number[] = [];
    let firstTomb = -1;
    let updatedAt = -1;
    let insertedAt = -1;

    for (let i = 0; i < m; i++) {
      const idx = probeStep(key, i);
      trail.push(idx);
      const cur = slots[idx];
      if (cur === null) {
        insertedAt = firstTomb >= 0 ? firstTomb : idx;
        break;
      }
      if (cur.tomb) {
        if (firstTomb === -1) firstTomb = idx;
        continue;
      }
      if (cur.key === key) {
        updatedAt = idx;
        break;
      }
    }

    flashProbe(trail);

    if (updatedAt >= 0) {
      const entry = makeEntry(key);
      setSlots((ss) => ss.map((s, i) => (i === updatedAt ? entry : s)));
      settleNew();
      pushLog({
        op: `insert("${key}")`,
        detail: `${describeProbe(key, m, mode, h, h2)} — funn på ${updatedAt}, oppdatert (${trail.length} probe${trail.length === 1 ? "" : "r"})`,
        probes: trail.length,
        result: "ok",
      });
      setProbeStats((s) => ({ total: s.total + trail.length, count: s.count + 1 }));
      return;
    }

    if (insertedAt < 0) {
      pushLog({
        op: `insert("${key}")`,
        detail: `${describeProbe(key, m, mode, h, h2)} — tabellen er full, ingen ledig slot`,
        probes: trail.length,
        result: "full",
      });
      return;
    }

    const entry = makeEntry(key);
    setSlots((ss) => ss.map((s, i) => (i === insertedAt ? entry : s)));
    settleNew();
    pushLog({
      op: `insert("${key}")`,
      detail: `${describeProbe(key, m, mode, h, h2)} — slot ${insertedAt} etter ${trail.length} probe${trail.length === 1 ? "" : "r"}`,
      probes: trail.length,
      result: "ok",
    });
    setProbeStats((s) => ({ total: s.total + trail.length, count: s.count + 1 }));
  };

  const openLookup = (key: string) => {
    const h = hash1(key, m);
    const h2 = mode === "double" ? hash2(key, m) : null;
    const trail: number[] = [];
    let foundAt = -1;
    for (let i = 0; i < m; i++) {
      const idx = probeStep(key, i);
      trail.push(idx);
      const cur = slots[idx];
      if (cur === null) break; // probe-sekvens slutter
      if (cur.tomb) continue; // hopp over tombstone
      if (cur.key === key) {
        foundAt = idx;
        break;
      }
    }
    flashProbe(trail);
    if (foundAt >= 0) {
      pushLog({
        op: `lookup("${key}")`,
        detail: `${describeProbe(key, m, mode, h, h2)} — funnet på slot ${foundAt} etter ${trail.length} probe${trail.length === 1 ? "" : "r"}`,
        probes: trail.length,
        result: "ok",
      });
    } else {
      pushLog({
        op: `lookup("${key}")`,
        detail: `${describeProbe(key, m, mode, h, h2)} — ikke funnet (${trail.length} probe${trail.length === 1 ? "" : "r"})`,
        probes: Math.max(1, trail.length),
        result: "not_found",
      });
    }
    setProbeStats((s) => ({ total: s.total + Math.max(1, trail.length), count: s.count + 1 }));
  };

  const openDelete = (key: string) => {
    const h = hash1(key, m);
    const h2 = mode === "double" ? hash2(key, m) : null;
    const trail: number[] = [];
    let foundAt = -1;
    for (let i = 0; i < m; i++) {
      const idx = probeStep(key, i);
      trail.push(idx);
      const cur = slots[idx];
      if (cur === null) break;
      if (cur.tomb) continue;
      if (cur.key === key) {
        foundAt = idx;
        break;
      }
    }
    flashProbe(trail);
    if (foundAt < 0) {
      pushLog({
        op: `delete("${key}")`,
        detail: `${describeProbe(key, m, mode, h, h2)} — ikke funnet (${trail.length} probe${trail.length === 1 ? "" : "r"})`,
        probes: Math.max(1, trail.length),
        result: "not_found",
      });
      return;
    }
    // Animer ut, så plant tombstone så probe-sekvenser fortsatt funker.
    setSlots((ss) =>
      ss.map((s, i) => (i === foundAt && s ? { ...s, phase: "leaving" } : s)),
    );
    setTimeout(() => {
      setSlots((ss) =>
        ss.map((s, i) =>
          i === foundAt
            ? { id: ++idRef.current, key: "✗", tomb: true }
            : s,
        ),
      );
    }, 340);
    pushLog({
      op: `delete("${key}")`,
      detail: `slot ${foundAt} → tombstone (probe-sekvensen må forbli intakt)`,
      probes: trail.length,
      result: "ok",
    });
  };

  // ------------ Knapper ------------

  const doInsert = () => {
    const key = input.trim();
    if (!key) return;
    if (mode === "chaining") chainInsert(key);
    else openInsert(key);
  };
  const doLookup = () => {
    const key = input.trim();
    if (!key) return;
    if (mode === "chaining") chainLookup(key);
    else openLookup(key);
  };
  const doDelete = () => {
    const key = input.trim();
    if (!key) return;
    if (mode === "chaining") chainDelete(key);
    else openDelete(key);
  };

  const liveH = input.trim() ? hash1(input.trim(), m) : null;
  const liveH2 = mode === "double" && input.trim() ? hash2(input.trim(), m) : null;
  const liveSum = input.trim() ? rawSum(input.trim()) : null;

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden" role="region" aria-label="Interaktiv visualisering: Hash-tabell">
      {/* Header med modus-velger */}
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Interaktiv visualisering
            </div>
            <div className="text-sm font-semibold">Hash-tabell — chaining og open addressing</div>
          </div>
          <button
            type="button"
            onClick={() => resetAll()}
            className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 px-2 py-1 rounded border border-border hover:bg-muted"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {MODES.map((mm) => (
            <button
              key={mm.id}
              type="button"
              onClick={() => switchMode(mm.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                mode === mm.id
                  ? "bg-brand text-brand-foreground border-brand"
                  : "border-border hover:bg-muted"
              }`}
              title={mm.sub}
            >
              {mm.label}
            </button>
          ))}
        </div>
      </div>

      {/* Visualisering */}
      <div className="p-6 bg-background">
        {mode === "chaining" ? (
          <ChainingView buckets={buckets} m={m} highlight={probeTrail[0] ?? null} />
        ) : (
          <SlotsView slots={slots} m={m} trail={probeTrail} />
        )}
      </div>

      {/* Controls */}
      <div className="px-4 py-3 border-t border-border bg-muted/20">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <label className="text-xs text-muted-foreground" htmlFor="ht-key">
            Nøkkel
          </label>
          <input
            id="ht-key"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="f.eks. Ane"
            className="w-32 px-2 py-1 rounded border border-border bg-background text-sm font-mono"
          />
          <div className="text-xs font-mono text-muted-foreground">
            {liveH !== null ? (
              <>
                <span>
                  h(k) = sum(ord(c)) % m = {liveSum} % {m} ={" "}
                </span>
                <span className="text-brand font-semibold">{liveH}</span>
                {liveH2 !== null && (
                  <span>
                    {" "}
                    · h2(k) = 1 + {liveSum} % {Math.max(1, m - 1)} ={" "}
                    <span className="text-brand font-semibold">{liveH2}</span>
                  </span>
                )}
              </>
            ) : (
              <span className="italic">skriv en nøkkel for å se hash-verdien</span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-3">
          <OpBtn onClick={doInsert}>insert(k)</OpBtn>
          <OpBtn onClick={doLookup}>lookup(k)</OpBtn>
          <OpBtn onClick={doDelete} variant="danger">
            delete(k)
          </OpBtn>
          <span className="text-xs text-muted-foreground mx-2">Hurtigvalg:</span>
          {SUGGESTIONS.slice(0, 6).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setInput(s)}
              className="px-2 py-0.5 rounded border border-border text-xs font-mono hover:bg-muted"
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <label htmlFor="ht-m" className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Tabellstørrelse m =</span>
            <span className="font-mono font-semibold text-foreground">{m}</span>
            <input
              id="ht-m"
              type="range"
              min={5}
              max={13}
              value={m}
              onChange={(e) => changeM(Number(e.target.value))}
              className="w-32"
            />
          </label>
          <div className="text-xs text-muted-foreground italic flex-1 min-w-[200px]">
            {MODE_NOTE[mode]}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-4 text-xs">
          <Stat label="Antall entries (n)" value={String(n)} />
          <Stat
            label="Lastfaktor α = n/m"
            value={alpha.toFixed(2)}
            tone={alpha > 0.7 ? "warn" : "ok"}
          />
          <Stat
            label="Snitt probe-lengde"
            value={avgProbe === 0 ? "—" : avgProbe.toFixed(2)}
          />
        </div>
      </div>

      {/* Logg */}
      {log.length > 0 && (
        <div className="px-4 py-3 border-t border-border bg-card" aria-live="polite" aria-atomic="false">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
            Operasjons-logg (nyeste først)
          </div>
          <ol className="space-y-1 font-mono text-xs">
            {log.map((entry, i) => (
              <li key={`${entry.op}-${i}`} className="flex items-baseline gap-3 text-foreground/90">
                <span className="text-muted-foreground tabular-nums w-6 text-right">
                  {log.length - i}.
                </span>
                <code className="shrink-0">{entry.op}</code>
                <span className="text-muted-foreground flex-1">{entry.detail}</span>
                <span
                  className={
                    entry.result === "ok"
                      ? "text-success"
                      : entry.result === "not_found"
                        ? "text-destructive"
                        : entry.result === "full"
                          ? "text-destructive"
                          : "text-muted-foreground"
                  }
                >
                  {entry.result === "ok"
                    ? "✓"
                    : entry.result === "not_found"
                      ? "ikke funnet"
                      : entry.result === "full"
                        ? "full"
                        : ""}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

// ============= Hjelpere & visningskomponenter =============

function describeProbe(
  key: string,
  m: number,
  mode: Mode,
  h: number,
  h2: number | null,
): string {
  if (mode === "linear") return `h("${key}")=${h}, step=1`;
  if (mode === "double") return `h("${key}")=${h}, h2=${h2}`;
  return `h("${key}")=${h}`;
}

function OpBtn({
  children,
  onClick,
  variant = "default",
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "danger";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2.5 py-1 rounded-md text-xs font-mono font-medium border transition-colors ${
        variant === "danger"
          ? "border-destructive/40 text-destructive hover:bg-destructive/10"
          : "border-brand/40 text-brand hover:bg-brand/10"
      }`}
    >
      {children}
    </button>
  );
}

function Stat({
  label,
  value,
  tone = "ok",
}: {
  label: string;
  value: string;
  tone?: "ok" | "warn";
}) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-muted-foreground">{label}:</span>
      <span
        className={`font-mono font-semibold ${
          tone === "warn" ? "text-destructive" : "text-foreground"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function ChainingView({
  buckets,
  m,
  highlight,
}: {
  buckets: Entry[][];
  m: number;
  highlight: number | null;
}) {
  return (
    <div className="w-full overflow-x-auto">
      <div className="flex gap-2 min-w-fit mx-auto pt-2 pb-2 px-1 justify-center">
        {Array.from({ length: m }, (_, i) => {
          const bucket = buckets[i] ?? [];
          const isHi = highlight === i;
          return (
            <div key={i} className="flex flex-col items-center gap-1 min-w-[64px]">
              <div
                className={`text-[10px] font-mono w-full text-center py-0.5 rounded border transition-colors ${
                  isHi
                    ? "border-brand text-brand bg-brand/10 font-semibold"
                    : "border-border text-muted-foreground bg-muted/30"
                }`}
              >
                slot {i}
              </div>
              <div
                className={`w-14 min-h-[48px] rounded-md border-2 border-dashed flex flex-col-reverse items-center gap-1 p-1 transition-colors ${
                  isHi ? "border-brand bg-brand/5" : "border-border"
                }`}
              >
                {bucket.length === 0 && (
                  <span className="text-[10px] text-muted-foreground italic">∅</span>
                )}
                {bucket.map((e) => (
                  <KeyPill key={e.id} entry={e} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SlotsView({
  slots,
  m,
  trail,
}: {
  slots: (Entry | null)[];
  m: number;
  trail: number[];
}) {
  // Map idx → trail-posisjon for å nummerere prober.
  const trailIndex = new Map<number, number>();
  trail.forEach((idx, t) => {
    if (!trailIndex.has(idx)) trailIndex.set(idx, t);
  });
  const lastIdx = trail.length > 0 ? trail[trail.length - 1] : null;

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex gap-2 min-w-fit mx-auto pt-2 pb-2 px-1 justify-center">
        {Array.from({ length: m }, (_, i) => {
          const s = slots[i] ?? null;
          const probePos = trailIndex.get(i);
          const inTrail = probePos !== undefined;
          const isLast = i === lastIdx;
          return (
            <div key={i} className="flex flex-col items-center gap-1 min-w-[56px]">
              <div
                className={`text-[10px] font-mono w-full text-center py-0.5 rounded border transition-colors ${
                  inTrail
                    ? isLast
                      ? "border-brand text-brand bg-brand/10 font-semibold"
                      : "border-warning text-warning bg-warning/10 font-semibold"
                    : "border-border text-muted-foreground bg-muted/30"
                }`}
                style={
                  inTrail && !isLast
                    ? {
                        // Fallback for tema som ikke har --warning: bruk en gulaktig tone.
                        borderColor: "rgba(234, 179, 8, 0.6)",
                        color: "rgb(202, 138, 4)",
                        background: "rgba(234, 179, 8, 0.1)",
                      }
                    : undefined
                }
              >
                {i}
                {inTrail && (
                  <span className="ml-1 opacity-70">·#{(probePos ?? 0) + 1}</span>
                )}
              </div>
              <div
                className={`w-12 h-12 rounded-md border-2 flex items-center justify-center transition-colors ${
                  inTrail
                    ? isLast
                      ? "border-brand bg-brand/5"
                      : "border-amber-500/60 bg-amber-500/5"
                    : s
                      ? s.tomb
                        ? "border-dashed border-destructive/40 bg-destructive/5"
                        : "border-border bg-card"
                      : "border-dashed border-border bg-muted/20"
                }`}
              >
                {s ? (
                  s.tomb ? (
                    <span className="text-[10px] font-mono text-destructive italic">tomb</span>
                  ) : (
                    <KeyPill entry={s} />
                  )
                ) : (
                  <span className="text-[10px] text-muted-foreground italic">∅</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 text-center text-[10px] text-muted-foreground font-mono">
        gul = mellomliggende probe · blå = endelig destinasjon · stiplet rød = tombstone
      </div>
    </div>
  );
}

function KeyPill({ entry }: { entry: Entry }) {
  return (
    <span
      className={`px-2 py-0.5 rounded-md text-xs font-mono font-semibold border bg-card transition-all duration-300 ease-out ${
        entry.phase === "new"
          ? "animate-in fade-in slide-in-from-top-2 duration-300 border-brand text-brand"
          : entry.phase === "leaving"
            ? "opacity-0 translate-y-1 scale-90 border-destructive/40 text-destructive"
            : "border-border text-foreground"
      }`}
    >
      {entry.key}
    </span>
  );
}
