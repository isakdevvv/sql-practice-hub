import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Play, Pause, Shuffle, RotateCcw } from "lucide-react";

// --------------------------------------------------------------------------
// Dropout-visualisering.
// Et lite 4-6-6-3 MLP der studenten kan se selve dropout-masken bli
// resamplet pr forward-pass. Tre moduser:
//   1. "trening" — Bernoulli(1-p) maske + inverted scaling.
//   2. "inferens" — alle nevroner aktive, ingen skalering.
//   3. "co-adapt" — "fryser" ett nevron som klippe-vrist, viser hva som
//      skjer hvis et nett lærer å stole på akkurat det nevronet.
// --------------------------------------------------------------------------

type Mode = "trening" | "inferens" | "co-adapt";

const LAYER_SIZES = [4, 6, 6, 3] as const;
type Layer = { x: number; nodes: { y: number; id: string }[] };

const SVG_W = 520;
const SVG_H = 280;

function buildLayout(): Layer[] {
  const margin = 50;
  const innerW = SVG_W - margin * 2;
  return LAYER_SIZES.map((count, li) => {
    const x = margin + (LAYER_SIZES.length === 1 ? 0 : (li * innerW) / (LAYER_SIZES.length - 1));
    const slotH = SVG_H / (count + 1);
    return {
      x,
      nodes: Array.from({ length: count }).map((_, i) => ({
        y: slotH * (i + 1),
        id: `L${li}-N${i}`,
      })),
    };
  });
}

// Pseudo-tilfeldig generator vi kan se-de slik at studenten kan re-spille.
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function DropoutVisualizer() {
  const layers = useMemo(buildLayout, []);
  const [mode, setMode] = useState<Mode>("trening");
  const [p, setP] = useState(0.5);
  const [seed, setSeed] = useState(7);
  const [playing, setPlaying] = useState(false);
  const intervalRef = useRef<number | null>(null);

  // Hvilke nevroner er droppet? Ett array per skjult lag (lag 1 og 2).
  const masks = useMemo(() => {
    const rng = mulberry32(seed);
    return [layers[1], layers[2]].map((layer) => layer.nodes.map(() => (rng() < p ? 0 : 1)));
  }, [layers, p, seed]);

  const dropped = useCallback(
    (layerIdx: number, nodeIdx: number) => {
      if (mode !== "trening") return false;
      if (layerIdx !== 1 && layerIdx !== 2) return false;
      const m = masks[layerIdx - 1];
      return m[nodeIdx] === 0;
    },
    [mode, masks],
  );

  // Tilfeldige vekter for visualiseringens "tykkelse" — frosset på seed=0
  // så de er deterministiske og uavhengige av dropout-seed.
  const weights = useMemo(() => {
    const rng = mulberry32(99);
    const out: number[][][] = [];
    for (let li = 0; li < layers.length - 1; li++) {
      const layer: number[][] = [];
      for (let i = 0; i < layers[li].nodes.length; i++) {
        const row: number[] = [];
        for (let j = 0; j < layers[li + 1].nodes.length; j++) {
          row.push(rng() * 2 - 1);
        }
        layer.push(row);
      }
      out.push(layer);
    }
    return out;
  }, [layers]);

  // Co-adapt: hvis modus = co-adapt, "fryser" vi midterste nevron i lag 1.
  // Alle vekter inn til lag 2 fra det nevronet får 2× tykkelse for å
  // illustrere at nedstrøms har lært å stole tungt på den.
  const coAdaptFrozenIdx = 2;
  const coAdaptActive = mode === "co-adapt";

  useEffect(() => {
    if (!playing) {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }
    intervalRef.current = window.setInterval(() => setSeed((s) => s + 1), 700);
    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [playing]);

  // Forventet andel droppet (over et hidden lag) — for skala-tekst.
  const droppedCount = mode === "trening" ? masks.flat().filter((m) => m === 0).length : 0;
  const totalHidden = masks.flat().length;

  const scale = mode === "trening" ? 1 / (1 - p) : 1;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      {/* Modusvalg */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {(
          [
            { id: "trening", label: "Trening", sub: "model.train()" },
            { id: "inferens", label: "Inferens", sub: "model.eval()" },
            { id: "co-adapt", label: "Co-adaptasjon", sub: "uten dropout" },
          ] as const
        ).map((m) => {
          const active = m.id === mode;
          return (
            <button
              key={m.id}
              onClick={() => {
                setMode(m.id);
                setPlaying(false);
              }}
              className={
                "rounded-lg border px-3 py-2 text-left transition-colors " +
                (active
                  ? "border-brand bg-brand/10"
                  : "border-border hover:border-brand/50 hover:bg-muted/30")
              }
            >
              <div className={"text-sm font-semibold " + (active ? "text-brand" : "")}>
                {m.label}
              </div>
              <div className="text-[10px] text-muted-foreground leading-tight mt-0.5 font-mono">
                {m.sub}
              </div>
            </button>
          );
        })}
      </div>

      {/* Kontrollpanel */}
      <div className="flex flex-wrap items-center gap-3 mb-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Dropout-rate</span>
          <input
            type="range"
            min={0}
            max={0.7}
            step={0.05}
            value={p}
            onChange={(e) => setP(parseFloat(e.target.value))}
            disabled={mode !== "trening"}
            className="w-32"
          />
          <span className="font-mono w-10 text-right">p={p.toFixed(2)}</span>
        </div>

        <button
          onClick={() => {
            setPlaying(false);
            setSeed((s) => s + 1);
          }}
          disabled={mode !== "trening"}
          className="inline-flex items-center gap-1 rounded-md border border-border bg-card hover:bg-muted/40 px-2 py-1 disabled:opacity-40"
        >
          <Shuffle className="h-3.5 w-3.5" /> Ny maske
        </button>

        <button
          onClick={() => setPlaying((p) => !p)}
          disabled={mode !== "trening"}
          className="inline-flex items-center gap-1 rounded-md border border-border bg-card hover:bg-muted/40 px-2 py-1 disabled:opacity-40"
        >
          {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          {playing ? "Stopp" : "Spill"}
        </button>

        <button
          onClick={() => {
            setPlaying(false);
            setSeed(7);
            setP(0.5);
          }}
          className="inline-flex items-center gap-1 rounded-md border border-border bg-card hover:bg-muted/40 px-2 py-1"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reset
        </button>
      </div>

      {/* SVG nett */}
      <div className="rounded-lg border border-border bg-background/40 overflow-hidden">
        <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full h-auto block">
          {/* Edges */}
          {layers.slice(0, -1).map((src, li) =>
            src.nodes.map((sn, si) =>
              layers[li + 1].nodes.map((tn, ti) => {
                const srcDropped = dropped(li, si);
                const tgtDropped = dropped(li + 1, ti);
                const w = weights[li][si][ti];
                const baseAlpha = Math.min(0.6, Math.abs(w) * 0.6 + 0.1);

                let alpha = baseAlpha;
                let stroke = w >= 0 ? "rgb(56,189,248)" : "rgb(244,114,182)";
                let widthPx = Math.abs(w) * 1.6 + 0.4;

                if (srcDropped || tgtDropped) {
                  alpha = 0.05;
                  stroke = "currentColor";
                  widthPx = 0.6;
                }
                // Co-adapt: forsterk alle kanter UT fra det frosne nevronet i lag 1
                if (coAdaptActive && li === 1 && si === coAdaptFrozenIdx) {
                  widthPx = Math.abs(w) * 3.0 + 1.0;
                  alpha = Math.min(0.95, baseAlpha + 0.3);
                  stroke = "rgb(251,191,36)";
                }
                return (
                  <line
                    key={`e-${li}-${si}-${ti}`}
                    x1={src.x}
                    y1={sn.y}
                    x2={layers[li + 1].x}
                    y2={tn.y}
                    stroke={stroke}
                    strokeOpacity={alpha}
                    strokeWidth={widthPx}
                  />
                );
              }),
            ),
          )}

          {/* Nodes */}
          {layers.map((layer, li) =>
            layer.nodes.map((n, ni) => {
              const isDropped = dropped(li, ni);
              const isHidden = li === 1 || li === 2;
              const isFrozen = coAdaptActive && li === 1 && ni === coAdaptFrozenIdx;
              const fill = isFrozen
                ? "rgb(251,191,36)"
                : isDropped
                ? "transparent"
                : isHidden
                ? "rgb(56,189,248)"
                : li === 0
                ? "rgb(148,163,184)"
                : "rgb(34,197,94)";
              const stroke = isDropped ? "rgb(148,163,184)" : "currentColor";
              const r = isFrozen ? 12 : isDropped ? 10 : 11;
              return (
                <g key={n.id}>
                  <circle
                    cx={layer.x}
                    cy={n.y}
                    r={r}
                    fill={fill}
                    fillOpacity={isDropped ? 0.05 : 0.85}
                    stroke={stroke}
                    strokeOpacity={isDropped ? 0.4 : 0.9}
                    strokeWidth={isFrozen ? 2.5 : isDropped ? 1.5 : 1}
                    strokeDasharray={isDropped ? "3 2" : undefined}
                  />
                  {isDropped && (
                    <text
                      x={layer.x}
                      y={n.y + 4}
                      textAnchor="middle"
                      className="fill-muted-foreground font-mono"
                      fontSize={11}
                    >
                      ✕
                    </text>
                  )}
                  {isFrozen && (
                    <text
                      x={layer.x}
                      y={n.y + 4}
                      textAnchor="middle"
                      className="font-mono"
                      fontSize={11}
                      fill="rgb(120,53,15)"
                    >
                      ★
                    </text>
                  )}
                </g>
              );
            }),
          )}

          {/* Lag-etiketter */}
          {layers.map((layer, li) => (
            <text
              key={`lab-${li}`}
              x={layer.x}
              y={SVG_H - 8}
              textAnchor="middle"
              className="fill-muted-foreground"
              fontSize={11}
            >
              {li === 0 ? "Input" : li === layers.length - 1 ? "Output" : `Hidden ${li}`}
            </text>
          ))}
        </svg>
      </div>

      {/* Status / matte */}
      <div className="mt-3 grid sm:grid-cols-2 gap-3 text-xs">
        <div className="rounded-md border border-border bg-background/40 p-3">
          <div className="font-semibold mb-1">Hva forwarden faktisk gjør</div>
          {mode === "trening" && (
            <pre className="font-mono text-[11px] leading-snug whitespace-pre-wrap">
{`mask  ~ Bernoulli(${(1 - p).toFixed(2)})  pr nevron
h'    = (h ⊙ mask) / ${(1 - p).toFixed(2)}
        └─ "inverted dropout":
           forventningen E[h'] = h.

Iterasjon ${seed - 6}:
  droppet ${droppedCount}/${totalHidden} skjulte nevroner
  skalering = 1/(1−p) = ${scale.toFixed(3)}`}
            </pre>
          )}
          {mode === "inferens" && (
            <pre className="font-mono text-[11px] leading-snug whitespace-pre-wrap">
{`Ingen maske — alle nevroner aktive.
Ingen skalering nødvendig (det
er allerede gjort i trening).

model.eval()  i PyTorch slår av
Dropout-lag automatisk.

Test-time-pass er deterministisk.`}
            </pre>
          )}
          {mode === "co-adapt" && (
            <pre className="font-mono text-[11px] leading-snug whitespace-pre-wrap">
{`Det stjerne-merkede nevronet er
"alltid på". Med tiden lærer
nedstrøms-lagene å stole TUNGT
på det (tykke gule kanter).

Hvis det nevronet en dag feiler
eller får støy — bryter hele
prediksjonen sammen.

Dropout hindrer dette ved å
TVINGE redundans.`}
            </pre>
          )}
        </div>
        <div className="rounded-md border border-border bg-background/40 p-3">
          <div className="font-semibold mb-1">Hvorfor inverted scaling?</div>
          <pre className="font-mono text-[11px] leading-snug whitespace-pre-wrap">
{`Uten /(1−p):
  trenings-aktivering ≈ h · (1−p)
  inferens-aktivering = h
  → nett ser SYSTEMATISK annerledes
     verden på test enn trening.

Med /(1−p):
  E[trening-akt] = h
  inferens-akt   = h
  → ingen mismatch. PyTorch og
     TF gjør dette automatisk.`}
          </pre>
        </div>
      </div>

      {/* Forklaring nederst */}
      <div className="mt-3 text-xs text-muted-foreground leading-relaxed">
        <strong className="text-foreground">Hva å se etter:</strong> i "Trening" — slå
        på <em>Spill</em> og legg merke til at andelen kryssede nevroner svinger rundt{" "}
        <span className="font-mono">{(p * 100).toFixed(0)}%</span>. I "Co-adaptasjon" —
        det stjerne-merkede nevronet er bevisst urørt og nedstrøm har grovere kanter
        til det. Det er denne avhengigheten dropout bryter opp ved å la <em>ingen</em>{" "}
        nevron være garantert til stede.
      </div>
    </div>
  );
}
