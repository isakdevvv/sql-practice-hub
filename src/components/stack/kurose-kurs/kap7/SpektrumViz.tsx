import { useMemo, useState } from "react";
import { Plus, X, Wifi } from "lucide-react";

// SpektrumViz — fullskala interaktiv for 7.2.
// Bruker plasserer access points (APs) på et 2.4 GHz eller 5 GHz spektrum,
// velger kanal og kanalbredde, og ser i sanntid hvor mye de overlapper med
// hverandre. Lærer hvorfor 2.4 GHz kun har 3 ikke-overlappende kanaler (1/6/11),
// og hvorfor 5 GHz har plass til mange flere klienter samtidig.

type Band = "2.4" | "5";

type AP = {
  id: number;
  name: string;
  channel: number;
  width: 20 | 40 | 80 | 160;
  color: string;
};

// 2.4 GHz: kanaler 1..13, hver kanal er 5 MHz fra hverandre, men opptar 20 MHz.
// Senterfrekvens(kanal) = 2407 + 5*kanal MHz.
// 5 GHz: forenklet — bruker kanal-nummer 36, 40, 44, 48, ..., hvor hver kanal er 20 MHz bred
// og er ikke-overlappende. Med 40/80/160 MHz bondes nabokanaler.

const CHANNELS_24 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
const CHANNELS_5 = [36, 40, 44, 48, 52, 56, 60, 64, 100, 104, 108, 112, 116, 120, 124, 128, 132, 136, 140, 149, 153, 157, 161, 165];

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

function centerFreq(band: Band, ch: number): number {
  if (band === "2.4") return 2407 + 5 * ch; // MHz
  return 5000 + 5 * ch; // forenklet — riktig for de fleste 5 GHz-kanaler
}

function bandwidth(width: number): number {
  return width; // MHz
}

function overlap(a: AP, b: AP, band: Band): number {
  const fa = centerFreq(band, a.channel);
  const fb = centerFreq(band, b.channel);
  const ha = bandwidth(a.width) / 2;
  const hb = bandwidth(b.width) / 2;
  const lo = Math.max(fa - ha, fb - hb);
  const hi = Math.min(fa + ha, fb + hb);
  return Math.max(0, hi - lo); // MHz overlap
}

export function SpektrumViz() {
  const [band, setBand] = useState<Band>("2.4");
  const [aps, setAps] = useState<AP[]>([
    { id: 1, name: "AP-A", channel: 1, width: 20, color: COLORS[0] },
    { id: 2, name: "AP-B", channel: 6, width: 20, color: COLORS[1] },
    { id: 3, name: "AP-C", channel: 11, width: 20, color: COLORS[2] },
  ]);
  const [selectedId, setSelectedId] = useState<number>(1);

  const channels = band === "2.4" ? CHANNELS_24 : CHANNELS_5;
  const selected = aps.find((a) => a.id === selectedId);

  // Konflikter — par av AP-er som overlapper
  const conflicts = useMemo(() => {
    const out: { a: AP; b: AP; mhz: number }[] = [];
    for (let i = 0; i < aps.length; i++) {
      for (let j = i + 1; j < aps.length; j++) {
        const o = overlap(aps[i], aps[j], band);
        if (o > 0) out.push({ a: aps[i], b: aps[j], mhz: o });
      }
    }
    return out;
  }, [aps, band]);

  const addAP = () => {
    const id = (aps[aps.length - 1]?.id ?? 0) + 1;
    const name = `AP-${String.fromCharCode(64 + (aps.length + 1))}`;
    const color = COLORS[aps.length % COLORS.length];
    const ch = band === "2.4" ? 1 : 36;
    setAps([...aps, { id, name, channel: ch, width: 20, color }]);
    setSelectedId(id);
  };

  const removeAP = (id: number) => {
    setAps(aps.filter((a) => a.id !== id));
    if (selectedId === id && aps.length > 1) {
      setSelectedId(aps[0].id);
    }
  };

  const updateSelected = (patch: Partial<AP>) => {
    setAps(aps.map((a) => (a.id === selectedId ? { ...a, ...patch } : a)));
  };

  // Recommended preset
  const presetNonOverlap = () => {
    if (band === "2.4") {
      setAps([
        { id: 1, name: "AP-A", channel: 1, width: 20, color: COLORS[0] },
        { id: 2, name: "AP-B", channel: 6, width: 20, color: COLORS[1] },
        { id: 3, name: "AP-C", channel: 11, width: 20, color: COLORS[2] },
      ]);
    } else {
      setAps([
        { id: 1, name: "AP-A", channel: 36, width: 20, color: COLORS[0] },
        { id: 2, name: "AP-B", channel: 40, width: 20, color: COLORS[1] },
        { id: 3, name: "AP-C", channel: 44, width: 20, color: COLORS[2] },
        { id: 4, name: "AP-D", channel: 48, width: 20, color: COLORS[3] },
      ]);
    }
    setSelectedId(1);
  };
  const presetCrowded = () => {
    if (band === "2.4") {
      setAps([
        { id: 1, name: "AP-A", channel: 1, width: 20, color: COLORS[0] },
        { id: 2, name: "AP-B", channel: 3, width: 20, color: COLORS[1] },
        { id: 3, name: "AP-C", channel: 6, width: 20, color: COLORS[2] },
        { id: 4, name: "AP-D", channel: 9, width: 20, color: COLORS[3] },
        { id: 5, name: "AP-E", channel: 11, width: 20, color: COLORS[4] },
      ]);
    } else {
      setAps([
        { id: 1, name: "AP-A", channel: 36, width: 80, color: COLORS[0] },
        { id: 2, name: "AP-B", channel: 40, width: 80, color: COLORS[1] },
      ]);
    }
    setSelectedId(1);
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h3 className="font-semibold">SpektrumViz — WiFi-kanaler i 2.4 og 5 GHz</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Legg ut access points. Velg kanal og bredde. Se hvor mye de overlapper.
          </p>
        </div>
        <div className="inline-flex rounded-md border border-border text-xs">
          <button
            onClick={() => {
              setBand("2.4");
              presetNonOverlap();
            }}
            className={`px-3 py-1.5 rounded-l-md ${
              band === "2.4" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
            }`}
          >
            2.4 GHz
          </button>
          <button
            onClick={() => {
              setBand("5");
              setAps([
                { id: 1, name: "AP-A", channel: 36, width: 20, color: COLORS[0] },
                { id: 2, name: "AP-B", channel: 40, width: 20, color: COLORS[1] },
              ]);
              setSelectedId(1);
            }}
            className={`px-3 py-1.5 rounded-r-md border-l border-border ${
              band === "5" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
            }`}
          >
            5 GHz
          </button>
        </div>
      </div>

      {/* Spektrum-plot */}
      <SpectrumPlot band={band} aps={aps} selectedId={selectedId} onSelect={setSelectedId} />

      {/* AP-liste + kontroller */}
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Access points
            </span>
            <button
              onClick={addAP}
              disabled={aps.length >= 6}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded border border-border hover:bg-muted disabled:opacity-40"
            >
              <Plus className="h-3 w-3" /> Legg til AP
            </button>
          </div>
          <ul className="space-y-1.5">
            {aps.map((ap) => {
              const isSel = ap.id === selectedId;
              return (
                <li
                  key={ap.id}
                  onClick={() => setSelectedId(ap.id)}
                  className={`flex items-center justify-between px-2 py-1.5 rounded border cursor-pointer text-sm ${
                    isSel ? "border-primary bg-muted" : "border-border hover:bg-muted/50"
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <span
                      className="inline-block h-3 w-3 rounded"
                      style={{ background: ap.color }}
                    />
                    <Wifi className="h-3 w-3" />
                    <span className="font-medium">{ap.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ch {ap.channel} · {ap.width} MHz
                    </span>
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeAP(ap.id);
                    }}
                    disabled={aps.length <= 1}
                    className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                    aria-label="Fjern AP"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="flex gap-2 pt-1">
            <button
              onClick={presetNonOverlap}
              className="px-2 py-1 text-xs rounded border border-border hover:bg-muted"
            >
              Preset: ikke-overlapp
            </button>
            <button
              onClick={presetCrowded}
              className="px-2 py-1 text-xs rounded border border-border hover:bg-muted"
            >
              Preset: rotete
            </button>
          </div>
        </div>

        {/* Kontroller for valgt AP */}
        {selected && (
          <div className="rounded-md border border-border p-3 space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Endre {selected.name}
            </div>
            <div>
              <label className="text-xs flex items-baseline justify-between">
                <span>Kanal</span>
                <span className="font-mono">
                  ch {selected.channel} · {centerFreq(band, selected.channel)} MHz
                </span>
              </label>
              <select
                value={selected.channel}
                onChange={(e) => updateSelected({ channel: Number(e.target.value) })}
                className="mt-1 w-full px-2 py-1 rounded border border-border bg-background text-sm"
              >
                {channels.map((c) => (
                  <option key={c} value={c}>
                    Kanal {c} ({centerFreq(band, c)} MHz)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs">Kanalbredde</label>
              <div className="mt-1 inline-flex rounded-md border border-border text-xs">
                {(band === "2.4" ? [20, 40] : [20, 40, 80, 160]).map((w) => (
                  <button
                    key={w}
                    onClick={() => updateSelected({ width: w as 20 | 40 | 80 | 160 })}
                    className={`px-2.5 py-1 ${
                      selected.width === w
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    } ${w !== 20 ? "border-l border-border" : ""}`}
                  >
                    {w} MHz
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Bredere kanal = høyere rate, men færre ikke-overlappende kanaler tilgjengelig.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Konflikter */}
      <div className="rounded-md border border-border p-3">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
          Overlapp ({conflicts.length} konflikt{conflicts.length === 1 ? "" : "er"})
        </div>
        {conflicts.length === 0 ? (
          <p className="text-sm text-emerald-600 dark:text-emerald-400">
            ✓ Ingen overlapp. Alle AP-er kan sende samtidig uten å forstyrre hverandre.
          </p>
        ) : (
          <ul className="space-y-1 text-sm">
            {conflicts.map((c, i) => (
              <li key={i} className="flex items-center gap-2">
                <span
                  className="inline-block h-2.5 w-2.5 rounded"
                  style={{ background: c.a.color }}
                />
                <span className="font-medium">{c.a.name}</span>
                <span className="text-muted-foreground">×</span>
                <span
                  className="inline-block h-2.5 w-2.5 rounded"
                  style={{ background: c.b.color }}
                />
                <span className="font-medium">{c.b.name}</span>
                <span className="text-muted-foreground">— {c.mhz} MHz overlapp</span>
              </li>
            ))}
            <li className="pt-1 text-xs text-muted-foreground">
              Overlappende kanaler tvinger AP-ene til å konkurrere om lufta (via CSMA/CA). Resultat:
              throughput per klient faller.
            </li>
          </ul>
        )}
      </div>

      {/* Lær-tips */}
      <details className="rounded-md border border-dashed border-border p-3">
        <summary className="text-sm font-medium cursor-pointer">
          Hvorfor 1, 6 og 11 på 2.4 GHz?
        </summary>
        <div className="mt-2 text-sm space-y-2 text-muted-foreground">
          <p>
            Hver 2.4 GHz-kanal opptar 20 MHz, men kanalnumrene er bare 5 MHz fra hverandre. Det vil
            si: kanal 1 dekker 2401–2423 MHz, kanal 6 dekker 2426–2448 MHz, kanal 11 dekker
            2451–2473 MHz. Mellom dem finnes det akkurat så mye luft at de ikke overlapper.
          </p>
          <p>
            Velger du i stedet kanal 1, 4, 7 og 11 i naboligheter, vil 4 og 7 begge overlappe
            kraftig med 1 og 11. Slutt-resultatet er at alle AP-ene må vente på hverandre, og du
            får mindre throughput enn med bare tre AP-er på 1/6/11.
          </p>
          <p>
            På 5 GHz er hver 20 MHz-kanal ikke-overlappende fra start, så det finnes 20+
            ikke-overlappende kanaler — derfor klarer 5 GHz mye høyere klient-tetthet.
          </p>
        </div>
      </details>
    </div>
  );
}

// ---------- Spektrum-plot ----------

function SpectrumPlot({
  band,
  aps,
  selectedId,
  onSelect,
}: {
  band: Band;
  aps: AP[];
  selectedId: number;
  onSelect: (id: number) => void;
}) {
  const W = 720;
  const H = 180;
  const padding = { top: 20, right: 16, bottom: 28, left: 40 };
  const plotW = W - padding.left - padding.right;
  const plotH = H - padding.top - padding.bottom;

  // Frekvens-range
  const fMin = band === "2.4" ? 2400 : 5150;
  const fMax = band === "2.4" ? 2500 : 5870;
  const range = fMax - fMin;

  const fToX = (f: number) => padding.left + ((f - fMin) / range) * plotW;
  const ticks =
    band === "2.4"
      ? [2400, 2420, 2440, 2460, 2480, 2500]
      : [5150, 5300, 5450, 5600, 5750, 5870];

  return (
    <div className="rounded-md border border-border bg-background p-2 overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto min-w-[640px]">
        {/* Baseline */}
        <line
          x1={padding.left}
          y1={padding.top + plotH}
          x2={padding.left + plotW}
          y2={padding.top + plotH}
          stroke="currentColor"
          strokeWidth={0.5}
          opacity={0.4}
        />
        {/* Y-akse */}
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={padding.top + plotH}
          stroke="currentColor"
          strokeWidth={0.5}
          opacity={0.4}
        />
        <text
          x={padding.left - 4}
          y={padding.top + 8}
          fontSize={9}
          fill="currentColor"
          opacity={0.6}
          textAnchor="end"
        >
          energi
        </text>

        {/* X-akse-ticks */}
        {ticks.map((f) => (
          <g key={f}>
            <line
              x1={fToX(f)}
              y1={padding.top + plotH}
              x2={fToX(f)}
              y2={padding.top + plotH + 4}
              stroke="currentColor"
              strokeWidth={0.5}
              opacity={0.5}
            />
            <text
              x={fToX(f)}
              y={padding.top + plotH + 16}
              fontSize={9}
              fill="currentColor"
              opacity={0.6}
              textAnchor="middle"
            >
              {f}
            </text>
          </g>
        ))}
        <text
          x={padding.left + plotW}
          y={H - 4}
          fontSize={9}
          fill="currentColor"
          opacity={0.6}
          textAnchor="end"
        >
          MHz
        </text>

        {/* AP-er som "bell-curves" — gauss-aktig form */}
        {aps.map((ap) => {
          const cf = centerFreq(band, ap.channel);
          const bw = bandwidth(ap.width);
          const cx = fToX(cf);
          const halfW = (bw / range) * plotW * 0.5;
          const isSel = ap.id === selectedId;
          // bygg en glatt path som ligner en kanal-maske
          const top = padding.top + 14;
          const baseY = padding.top + plotH;
          const path = `M ${cx - halfW} ${baseY}
            Q ${cx - halfW * 0.5} ${baseY},  ${cx - halfW * 0.3} ${top + 12}
            L ${cx + halfW * 0.3} ${top + 12}
            Q ${cx + halfW * 0.5} ${baseY},  ${cx + halfW} ${baseY}
            Z`;
          return (
            <g key={ap.id} onClick={() => onSelect(ap.id)} style={{ cursor: "pointer" }}>
              <path
                d={path}
                fill={ap.color}
                fillOpacity={isSel ? 0.45 : 0.25}
                stroke={ap.color}
                strokeWidth={isSel ? 2 : 1}
              />
              <text
                x={cx}
                y={top + 6}
                fontSize={10}
                fill={ap.color}
                textAnchor="middle"
                fontWeight={isSel ? "bold" : "normal"}
              >
                {ap.name}
              </text>
              <text
                x={cx}
                y={baseY - 4}
                fontSize={8}
                fill="currentColor"
                opacity={0.5}
                textAnchor="middle"
              >
                ch {ap.channel}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
