import { useEffect, useMemo, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Zap, GitBranch } from "lucide-react";

// Levende seksjon 6.5 — Datasenter-nett: leaf-spine + ECMP multipath
//
// Vi tegner en klassisk 2-tier leaf-spine: 4 leaf-switcher nederst, 4 spine-switcher
// øverst. Hver leaf har en kobling til hver spine. Hostene henger under leafene
// (vi rangerer dem 8 hosts totalt, 2 per leaf).
//
// Når brukeren ber om en strøm fra h_i til h_j, må trafikken via en spine (med mindre
// både ligger under samme leaf). ECMP velger spine basert på hash av flow-felter.
// Vi animerer pakker som «flommer» som strømmer langs valgte stier — og brukeren
// kan endre antall strømmer for å se lastfordelingen.

type Host = { id: string; leaf: number; label: string };
type Flow = {
  id: number;
  src: string;
  dst: string;
  /** Hvilken spine ECMP valgte. */
  spine: number;
  /** Farge (deterministisk per id). */
  color: string;
};

const N_LEAF = 4;
const N_SPINE = 4;
const HOSTS_PER_LEAF = 2;

const HOSTS: Host[] = [];
for (let l = 0; l < N_LEAF; l++) {
  for (let h = 0; h < HOSTS_PER_LEAF; h++) {
    const id = `h${l * HOSTS_PER_LEAF + h + 1}`;
    HOSTS.push({ id, leaf: l, label: id });
  }
}

const COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#ec4899", // pink
  "#8b5cf6", // violet
  "#06b6d4", // cyan
  "#ef4444", // red
  "#84cc16", // lime
];

// Enkel hash for ECMP
function hashFlow(src: string, dst: string, salt: number): number {
  let h = 2166136261 ^ salt;
  for (const c of `${src}->${dst}|${salt}`) {
    h = (h ^ c.charCodeAt(0)) * 16777619;
  }
  return Math.abs(h >>> 0);
}

function pickSpine(src: string, dst: string, salt: number): number {
  return hashFlow(src, dst, salt) % N_SPINE;
}

// Geometri
const VW = 820;
const VH = 460;
const SPINE_Y = 80;
const LEAF_Y = 230;
const HOST_Y = 380;
const SW_W = 110;
const SW_H = 36;

function spineX(i: number) {
  const margin = 90;
  return margin + (i * (VW - 2 * margin)) / (N_SPINE - 1);
}
function leafX(i: number) {
  const margin = 90;
  return margin + (i * (VW - 2 * margin)) / (N_LEAF - 1);
}
function hostX(i: number) {
  const margin = 60;
  return margin + (i * (VW - 2 * margin)) / (HOSTS.length - 1);
}

export function Section65Live() {
  const [flows, setFlows] = useState<Flow[]>([]);
  const [nextId, setNextId] = useState(1);
  const [src, setSrc] = useState("h1");
  const [dst, setDst] = useState("h8");
  const [salt, setSalt] = useState(0);
  const [showEcmpInternals, setShowEcmpInternals] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [t, setT] = useState(0);
  const lastRef = useRef(performance.now());

  useEffect(() => {
    if (!playing) return;
    let raf: number;
    function tick(now: number) {
      const dt = now - lastRef.current;
      lastRef.current = now;
      setT((tt) => tt + dt);
      raf = requestAnimationFrame(tick);
    }
    lastRef.current = performance.now();
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  function addFlow() {
    if (src === dst) return;
    const spine = pickSpine(src, dst, salt);
    const f: Flow = {
      id: nextId,
      src,
      dst,
      spine,
      color: COLORS[nextId % COLORS.length],
    };
    setFlows((prev) => [...prev, f]);
    setNextId((n) => n + 1);
  }

  function clearFlows() {
    setFlows([]);
  }

  function addRandomFlows(n: number) {
    const newFlows: Flow[] = [];
    let id = nextId;
    for (let i = 0; i < n; i++) {
      let a = HOSTS[Math.floor(Math.random() * HOSTS.length)].id;
      let b = HOSTS[Math.floor(Math.random() * HOSTS.length)].id;
      if (a === b) continue;
      const s = pickSpine(a, b, salt);
      newFlows.push({ id, src: a, dst: b, spine: s, color: COLORS[id % COLORS.length] });
      id++;
    }
    setFlows((prev) => [...prev, ...newFlows]);
    setNextId(id);
  }

  // Statistikk: hvor mye last per spine
  const spineLoad = useMemo(() => {
    const load = Array(N_SPINE).fill(0);
    for (const f of flows) {
      const sHost = HOSTS.find((h) => h.id === f.src);
      const dHost = HOSTS.find((h) => h.id === f.dst);
      if (!sHost || !dHost || sHost.leaf === dHost.leaf) continue; // intra-leaf, ingen spine brukt
      load[f.spine]++;
    }
    return load;
  }, [flows]);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="bg-muted/30 px-4 py-2 text-xs text-muted-foreground border-b border-border flex items-center gap-3">
        <span className="font-medium text-foreground">
          Leaf-spine topologi — legg til flows og se ECMP fordele over 4 spine-stier
        </span>
        <span className="ml-auto font-mono">{flows.length} flows aktive</span>
      </div>

      {/* Kontroller */}
      <div className="px-4 py-2 border-b border-border bg-muted/10 flex flex-wrap items-center gap-2 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground">Fra:</span>
          <select
            value={src}
            onChange={(e) => setSrc(e.target.value)}
            className="rounded border border-border bg-background px-2 py-1 text-xs"
          >
            {HOSTS.map((h) => (
              <option key={h.id} value={h.id}>
                {h.label} (leaf {h.leaf + 1})
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground">Til:</span>
          <select
            value={dst}
            onChange={(e) => setDst(e.target.value)}
            className="rounded border border-border bg-background px-2 py-1 text-xs"
          >
            {HOSTS.map((h) => (
              <option key={h.id} value={h.id}>
                {h.label} (leaf {h.leaf + 1})
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={addFlow}
          disabled={src === dst}
          className="inline-flex items-center gap-1 rounded border border-brand/40 bg-brand/10 px-2 py-1 text-xs font-medium hover:bg-brand/20 disabled:opacity-40"
        >
          <GitBranch className="h-3 w-3" /> Legg til flow
        </button>
        <button
          onClick={() => addRandomFlows(6)}
          className="inline-flex items-center gap-1 rounded border border-border bg-background px-2 py-1 text-xs hover:border-brand/60"
        >
          <Zap className="h-3 w-3" /> +6 tilfeldige
        </button>
        <button
          onClick={clearFlows}
          className="inline-flex items-center gap-1 rounded border border-border bg-background px-2 py-1 text-xs hover:border-brand/60"
        >
          <RotateCcw className="h-3 w-3" /> Nullstill
        </button>
        <button
          onClick={() => setPlaying((p) => !p)}
          className="inline-flex items-center gap-1 rounded border border-border bg-background px-2 py-1 text-xs hover:border-brand/60 ml-auto"
        >
          {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          {playing ? "Pause" : "Spill"}
        </button>
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground">hash-salt:</span>
          <input
            type="range"
            min={0}
            max={20}
            value={salt}
            onChange={(e) => {
              const v = Number(e.target.value);
              setSalt(v);
              // Re-velg spine for alle eksisterende flows med ny salt
              setFlows((prev) =>
                prev.map((f) => ({ ...f, spine: pickSpine(f.src, f.dst, v) })),
              );
            }}
            className="w-24"
          />
          <span className="font-mono text-foreground">{salt}</span>
        </div>
      </div>

      {/* SVG-topologi */}
      <svg viewBox={`0 0 ${VW} ${VH}`} className="w-full h-auto bg-muted/5">
        {/* Spine-leaf-linjer (alle koblinger først, så pakker oppå) */}
        {Array.from({ length: N_SPINE }).map((_, s) =>
          Array.from({ length: N_LEAF }).map((_, l) => (
            <line
              key={`${s}-${l}`}
              x1={spineX(s)}
              y1={SPINE_Y + SW_H / 2}
              x2={leafX(l)}
              y2={LEAF_Y - SW_H / 2}
              className="stroke-muted-foreground/25"
              strokeWidth={1}
            />
          )),
        )}
        {/* Host-leaf-linjer */}
        {HOSTS.map((h, i) => (
          <line
            key={h.id}
            x1={hostX(i)}
            y1={HOST_Y - 10}
            x2={leafX(h.leaf)}
            y2={LEAF_Y + SW_H / 2}
            className="stroke-muted-foreground/30"
            strokeWidth={1}
          />
        ))}

        {/* Spine-switcher */}
        {Array.from({ length: N_SPINE }).map((_, s) => {
          const load = spineLoad[s];
          const heat = Math.min(1, load / 4);
          return (
            <g key={s}>
              <rect
                x={spineX(s) - SW_W / 2}
                y={SPINE_Y - SW_H / 2}
                width={SW_W}
                height={SW_H}
                rx={4}
                className="fill-card stroke-brand"
                strokeWidth={1.5}
                fillOpacity={0.7 + heat * 0.3}
              />
              <text x={spineX(s)} y={SPINE_Y + 4} textAnchor="middle" className="fill-foreground text-[11px] font-semibold">
                Spine {s + 1}
              </text>
              <text x={spineX(s)} y={SPINE_Y + 18} textAnchor="middle" className="fill-muted-foreground text-[9px] font-mono">
                last: {load}
              </text>
            </g>
          );
        })}
        <text x={20} y={SPINE_Y + 4} className="fill-muted-foreground text-[10px] font-semibold">
          SPINE
        </text>

        {/* Leaf-switcher */}
        {Array.from({ length: N_LEAF }).map((_, l) => (
          <g key={l}>
            <rect
              x={leafX(l) - SW_W / 2}
              y={LEAF_Y - SW_H / 2}
              width={SW_W}
              height={SW_H}
              rx={4}
              className="fill-card stroke-purple-500"
              strokeWidth={1.5}
            />
            <text
              x={leafX(l)}
              y={LEAF_Y + 4}
              textAnchor="middle"
              className="fill-foreground text-[11px] font-semibold"
            >
              Leaf {l + 1}
            </text>
          </g>
        ))}
        <text x={20} y={LEAF_Y + 4} className="fill-muted-foreground text-[10px] font-semibold">
          LEAF
        </text>

        {/* Hosts */}
        {HOSTS.map((h, i) => (
          <g key={h.id}>
            <rect
              x={hostX(i) - 18}
              y={HOST_Y - 10}
              width={36}
              height={22}
              rx={3}
              className={`fill-card ${
                h.id === src ? "stroke-brand" : h.id === dst ? "stroke-success" : "stroke-border"
              }`}
              strokeWidth={1.5}
            />
            <text
              x={hostX(i)}
              y={HOST_Y + 5}
              textAnchor="middle"
              className="fill-foreground text-[10px] font-mono"
            >
              {h.label}
            </text>
          </g>
        ))}

        {/* Pakke-strømmer */}
        {flows.map((f, fi) => {
          const sHost = HOSTS.find((h) => h.id === f.src)!;
          const dHost = HOSTS.find((h) => h.id === f.dst)!;
          const sHostI = HOSTS.findIndex((h) => h.id === f.src);
          const dHostI = HOSTS.findIndex((h) => h.id === f.dst);

          // Hvis intra-leaf: bare host → leaf → host
          const intraLeaf = sHost.leaf === dHost.leaf;
          const path = intraLeaf
            ? [
                { x: hostX(sHostI), y: HOST_Y },
                { x: leafX(sHost.leaf), y: LEAF_Y },
                { x: hostX(dHostI), y: HOST_Y },
              ]
            : [
                { x: hostX(sHostI), y: HOST_Y },
                { x: leafX(sHost.leaf), y: LEAF_Y },
                { x: spineX(f.spine), y: SPINE_Y },
                { x: leafX(dHost.leaf), y: LEAF_Y },
                { x: hostX(dHostI), y: HOST_Y },
              ];

          // Tegn sti
          const dPath = path.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");

          // Animér en pakke langs stien
          const segLens: number[] = [];
          let total = 0;
          for (let i = 1; i < path.length; i++) {
            const dx = path[i].x - path[i - 1].x;
            const dy = path[i].y - path[i - 1].y;
            const len = Math.sqrt(dx * dx + dy * dy);
            segLens.push(len);
            total += len;
          }
          // pakke-offset (loop)
          const cyclePer = 2400 + fi * 110;
          const localT = ((t + fi * 200) % cyclePer) / cyclePer;
          const distAlong = localT * total;
          let accum = 0;
          let segI = 0;
          for (let i = 0; i < segLens.length; i++) {
            if (accum + segLens[i] >= distAlong) {
              segI = i;
              break;
            }
            accum += segLens[i];
          }
          const segT = (distAlong - accum) / Math.max(1, segLens[segI]);
          const px = path[segI].x + (path[segI + 1].x - path[segI].x) * segT;
          const py = path[segI].y + (path[segI + 1].y - path[segI].y) * segT;

          return (
            <g key={f.id}>
              <path
                d={dPath}
                stroke={f.color}
                strokeWidth={1.8}
                fill="none"
                strokeOpacity={0.5}
                strokeDasharray="6 3"
              />
              <circle cx={px} cy={py} r={5} fill={f.color} stroke={f.color} strokeWidth={1.5} />
            </g>
          );
        })}
      </svg>

      {/* Per-flow oversikt + ECMP-hash */}
      <div className="px-4 py-2 border-t border-border bg-muted/10">
        <div className="flex items-center justify-between mb-1.5">
          <div className="text-xs font-semibold">Aktive flows og valgt spine (ECMP)</div>
          <button
            onClick={() => setShowEcmpInternals((s) => !s)}
            className="text-[11px] text-brand hover:underline"
          >
            {showEcmpInternals ? "Skjul hash-detaljer" : "Vis hash-detaljer"}
          </button>
        </div>
        {flows.length === 0 ? (
          <div className="text-[11px] text-muted-foreground italic">Ingen flows ennå.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-0.5 text-[11px] font-mono">
            {flows.map((f) => {
              const sHost = HOSTS.find((h) => h.id === f.src)!;
              const dHost = HOSTS.find((h) => h.id === f.dst)!;
              const intra = sHost.leaf === dHost.leaf;
              const hash = hashFlow(f.src, f.dst, salt);
              return (
                <div key={f.id} className="flex items-center gap-1.5">
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-full"
                    style={{ background: f.color }}
                  />
                  <span className="text-foreground">
                    {f.src}→{f.dst}
                  </span>
                  <span className="text-muted-foreground">
                    {intra ? (
                      <>intra-leaf</>
                    ) : (
                      <>via S{f.spine + 1}</>
                    )}
                  </span>
                  {showEcmpInternals && !intra && (
                    <span className="text-muted-foreground/70">
                      hash=0x{(hash & 0xffff).toString(16).padStart(4, "0")} % {N_SPINE} = {f.spine}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="px-4 py-2 border-t border-border bg-muted/20 text-[11px] text-muted-foreground">
        <strong className="text-foreground">ECMP (Equal-Cost Multi-Path):</strong> alle 4 spine-stier
        er like lange (2 hopp). I stedet for å bare velge én, hash-fordeler routeren flows over
        alle stiene. Endre hash-salt og se hvordan flows omfordeles — det er nettopp dette en switch
        gjør når man bytter ut hash-frø eller flow-felt for å unngå hot-spots.
      </div>
    </div>
  );
}
