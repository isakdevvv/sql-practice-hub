import { useMemo, useState } from "react";

type Variant = "1.0" | "1.1-serial" | "1.1-pipeline" | "2.0";

// 1 stor video-fil (50 frames) + 8 små CSS-filer (2 frames hver)
const OBJECTS = [
  { id: 0, label: "video.mp4", size: 50, color: "#ef4444" },
  { id: 1, label: "1.css", size: 2, color: "#3b82f6" },
  { id: 2, label: "2.css", size: 2, color: "#0ea5e9" },
  { id: 3, label: "3.css", size: 2, color: "#06b6d4" },
  { id: 4, label: "4.css", size: 2, color: "#14b8a6" },
  { id: 5, label: "5.css", size: 2, color: "#10b981" },
  { id: 6, label: "6.css", size: 2, color: "#22c55e" },
  { id: 7, label: "7.css", size: 2, color: "#84cc16" },
  { id: 8, label: "8.css", size: 2, color: "#eab308" },
];

const HANDSHAKE = 4; // frames per TCP-handshake (1 RTT)
const REQUEST = 2; // frames per request-trip
const TOTAL_SIZE = OBJECTS.reduce((s, o) => s + o.size, 0); // 50 + 16 = 66

type Slot = {
  t: number; // frame index
  objId: number | null; // null = idle / handshake / request-trip
  marker?: "handshake" | "request";
};

function simulate(variant: Variant): { slots: Slot[]; totalFrames: number } {
  const slots: Slot[] = [];

  if (variant === "1.0") {
    // Hver objekt: handshake (4) + request (2) + body (size)
    let t = 0;
    for (const obj of OBJECTS) {
      for (let i = 0; i < HANDSHAKE; i++) {
        slots.push({ t: t++, objId: null, marker: "handshake" });
      }
      for (let i = 0; i < REQUEST; i++) {
        slots.push({ t: t++, objId: null, marker: "request" });
      }
      for (let i = 0; i < obj.size; i++) {
        slots.push({ t: t++, objId: obj.id });
      }
    }
    return { slots, totalFrames: slots.length };
  }

  if (variant === "1.1-serial") {
    // Én handshake, så per objekt: request (2) + body
    let t = 0;
    for (let i = 0; i < HANDSHAKE; i++) {
      slots.push({ t: t++, objId: null, marker: "handshake" });
    }
    for (const obj of OBJECTS) {
      for (let i = 0; i < REQUEST; i++) {
        slots.push({ t: t++, objId: null, marker: "request" });
      }
      for (let i = 0; i < obj.size; i++) {
        slots.push({ t: t++, objId: obj.id });
      }
    }
    return { slots, totalFrames: slots.length };
  }

  if (variant === "1.1-pipeline") {
    // Én handshake + én request-batch, så body-er i opprinnelig rekkefølge
    let t = 0;
    for (let i = 0; i < HANDSHAKE; i++) {
      slots.push({ t: t++, objId: null, marker: "handshake" });
    }
    for (let i = 0; i < REQUEST; i++) {
      slots.push({ t: t++, objId: null, marker: "request" });
    }
    for (const obj of OBJECTS) {
      for (let i = 0; i < obj.size; i++) {
        slots.push({ t: t++, objId: obj.id });
      }
    }
    return { slots, totalFrames: slots.length };
  }

  // variant === "2.0": frames blandet — round-robin én frame per stream til hver er ferdig.
  // Ingen stor først, alle objekter konkurrerer rettferdig.
  let t = 0;
  for (let i = 0; i < HANDSHAKE; i++) {
    slots.push({ t: t++, objId: null, marker: "handshake" });
  }
  for (let i = 0; i < REQUEST; i++) {
    slots.push({ t: t++, objId: null, marker: "request" });
  }
  const remaining = OBJECTS.map((o) => o.size);
  let active = OBJECTS.map((o) => o.id);
  while (active.length > 0) {
    for (const id of [...active]) {
      if (remaining[id] > 0) {
        slots.push({ t: t++, objId: id });
        remaining[id]--;
      }
    }
    active = active.filter((id) => remaining[id] > 0);
  }
  return { slots, totalFrames: slots.length };
}

function firstFinish(slots: Slot[], objId: number): number | null {
  let lastFrame = -1;
  let count = 0;
  const target = OBJECTS[objId].size;
  for (const s of slots) {
    if (s.objId === objId) {
      count++;
      lastFrame = s.t;
      if (count >= target) return lastFrame + 1; // frame da objektet er ferdig
    }
  }
  return null;
}

function lastCssFinish(slots: Slot[]): number {
  let last = 0;
  for (let id = 1; id <= 8; id++) {
    const f = firstFinish(slots, id);
    if (f !== null) last = Math.max(last, f);
  }
  return last;
}

const VARIANT_LABEL: Record<Variant, string> = {
  "1.0": "HTTP/1.0 non-persistent",
  "1.1-serial": "HTTP/1.1 persistent (serielt)",
  "1.1-pipeline": "HTTP/1.1 + pipelining",
  "2.0": "HTTP/2 (frames + interleaving)",
};

export function HolTimeline() {
  const [variant, setVariant] = useState<Variant>("1.0");
  const sim = useMemo(() => simulate(variant), [variant]);

  // Visuell skalering — vi vil ha alle varianter på samme akse for visuell sammenligning
  const maxFrames = 200;
  const frameWidth = 4; // px per frame
  const rowHeight = 18;
  const labelWidth = 90;

  // Per-objekt rad-rendering: vis stripe der hver frame er allokert
  const objectRows = OBJECTS.map((obj) => {
    const frames = sim.slots.filter((s) => s.objId === obj.id).map((s) => s.t);
    const finishFrame = firstFinish(sim.slots, obj.id);
    return { obj, frames, finishFrame };
  });

  const lastCss = lastCssFinish(sim.slots);

  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {(Object.keys(VARIANT_LABEL) as Variant[]).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setVariant(v)}
            className={`text-xs font-medium px-3 py-1.5 rounded-md border transition-colors ${
              variant === v
                ? "bg-brand text-brand-foreground border-brand"
                : "border-border hover:bg-muted"
            }`}
          >
            {VARIANT_LABEL[v]}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <svg
          width={labelWidth + maxFrames * frameWidth + 40}
          height={(OBJECTS.length + 2) * rowHeight + 30}
          className="font-mono text-[10px]"
        >
          {/* tids-akse */}
          <g>
            {[0, 50, 100, 150, 200].map((tick) => (
              <g key={tick}>
                <line
                  x1={labelWidth + tick * frameWidth}
                  y1={20}
                  x2={labelWidth + tick * frameWidth}
                  y2={(OBJECTS.length + 1) * rowHeight + 20}
                  stroke="currentColor"
                  className="text-muted-foreground/20"
                  strokeWidth={1}
                />
                <text
                  x={labelWidth + tick * frameWidth}
                  y={14}
                  textAnchor="middle"
                  className="fill-muted-foreground"
                >
                  {tick}
                </text>
              </g>
            ))}
            <text
              x={labelWidth + maxFrames * frameWidth + 4}
              y={14}
              className="fill-muted-foreground"
            >
              frames
            </text>
          </g>

          {objectRows.map(({ obj, frames, finishFrame }, idx) => {
            const y = 20 + idx * rowHeight;
            return (
              <g key={obj.id}>
                <text
                  x={labelWidth - 6}
                  y={y + 12}
                  textAnchor="end"
                  className="fill-foreground"
                >
                  {obj.label}
                </text>
                <rect
                  x={labelWidth}
                  y={y + 2}
                  width={maxFrames * frameWidth}
                  height={rowHeight - 4}
                  className="fill-muted/40"
                />
                {frames.map((t) => (
                  <rect
                    key={t}
                    x={labelWidth + t * frameWidth}
                    y={y + 2}
                    width={frameWidth}
                    height={rowHeight - 4}
                    fill={obj.color}
                  />
                ))}
                {finishFrame !== null && finishFrame <= maxFrames && (
                  <text
                    x={labelWidth + finishFrame * frameWidth + 4}
                    y={y + 12}
                    className="fill-foreground"
                  >
                    ✓ {finishFrame}
                  </text>
                )}
              </g>
            );
          })}

          {/* total-rad: handshake + request markers */}
          <g>
            <text
              x={labelWidth - 6}
              y={20 + OBJECTS.length * rowHeight + 12}
              textAnchor="end"
              className="fill-muted-foreground"
            >
              control
            </text>
            {sim.slots
              .filter((s) => s.marker)
              .map((s) => (
                <rect
                  key={s.t}
                  x={labelWidth + s.t * frameWidth}
                  y={20 + OBJECTS.length * rowHeight + 2}
                  width={frameWidth}
                  height={rowHeight - 4}
                  fill={s.marker === "handshake" ? "#a3a3a3" : "#737373"}
                />
              ))}
          </g>
        </svg>
      </div>

      <div className="mt-4 grid sm:grid-cols-3 gap-3 text-sm">
        <div className="rounded-lg border border-border bg-background p-3">
          <div className="text-xs text-muted-foreground">Total tid (alle 9 objekter)</div>
          <div className="font-mono text-lg font-semibold">
            {sim.totalFrames} <span className="text-xs text-muted-foreground">frames</span>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-background p-3">
          <div className="text-xs text-muted-foreground">Siste CSS-fil ferdig</div>
          <div className="font-mono text-lg font-semibold">
            {lastCss} <span className="text-xs text-muted-foreground">frames</span>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-background p-3">
          <div className="text-xs text-muted-foreground">Nyttig data (uten control)</div>
          <div className="font-mono text-lg font-semibold">
            {TOTAL_SIZE} <span className="text-xs text-muted-foreground">frames</span>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs leading-relaxed">
        <strong className="text-amber-700 dark:text-amber-400">Les av kurven:</strong>{" "}
        På 1.0 betaler hver av de 9 objektene 6 frames i handshake+request før body. På
        1.1-pipeline har alle CSS-filene fått samtlige forespørsler ut umiddelbart, men
        body-en for <code className="font-mono">video.mp4</code> blokkerer dem (HOL). På
        2.0 interleaves frames slik at hver CSS-fil er ferdig på frame ≤ 25, parallelt
        med video-en.
      </div>
    </div>
  );
}
