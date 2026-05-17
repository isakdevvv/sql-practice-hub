import { useMemo, useRef, useState } from "react";

// =======================================================================
// BiasInDataSandbox.tsx
// -----------------------------------------------------------------------
// Brukeren bygger et treningssett for en lønnsprediktor ved å klikke i et
// 2D-rom (qualifications × salary) og merke punktet som gruppe A eller B.
// En enkel lineær regresjon trenes live PER GRUPPE og brukes til
// prediksjon på et felles test-rutenett. Vi viser også en "global" modell
// som ignorerer gruppen — og hvordan den blir like skjev hvis dataene
// er skjeve, selv om "protected attribute" er fjernet, så lenge en proxy
// (her: hvilken side av plottet punktet ligger) korrelerer med gruppen.
// =======================================================================

type Group = "A" | "B";
type Pt = { x: number; y: number; g: Group };

type Mitigation = "none" | "reweight" | "resample" | "drop-attr";

// Lineær regresjon y = a + b*x på et sett med punkter, weighted.
function fitLine(
  pts: { x: number; y: number; w: number }[],
): { a: number; b: number } {
  let sw = 0,
    swx = 0,
    swy = 0,
    swxx = 0,
    swxy = 0;
  for (const p of pts) {
    sw += p.w;
    swx += p.w * p.x;
    swy += p.w * p.y;
    swxx += p.w * p.x * p.x;
    swxy += p.w * p.x * p.y;
  }
  if (sw < 1e-9) return { a: 0, b: 0 };
  const mx = swx / sw;
  const my = swy / sw;
  const num = swxy - sw * mx * my;
  const den = swxx - sw * mx * mx;
  const b = Math.abs(den) < 1e-9 ? 0 : num / den;
  const a = my - b * mx;
  return { a, b };
}

// Bias-preset: shift alle B-punkter ned med 0.25 i lønn for samme kvalifikasjon.
const BIAS_SHIFT = 0.25;

// Preset-data: noenlunde overlappende kvalifikasjoner, men en historisk skjevhet
// der B-punkter ligger litt lavere i lønn enn A ved samme x. Setter scenen for
// at modellen lærer "kvinner tjener mindre"-mønsteret hvis vi ikke griper inn.
function seedData(): Pt[] {
  const pts: Pt[] = [];
  // A-gruppe (privilegert i datasettet)
  const a: [number, number][] = [
    [0.15, 0.42],
    [0.25, 0.48],
    [0.35, 0.55],
    [0.45, 0.6],
    [0.55, 0.66],
    [0.62, 0.7],
    [0.72, 0.78],
    [0.82, 0.84],
  ];
  for (const [x, y] of a) pts.push({ x, y, g: "A" });
  // B-gruppe (systematisk lavere lønn)
  const b: [number, number][] = [
    [0.18, 0.34],
    [0.28, 0.4],
    [0.38, 0.45],
    [0.48, 0.5],
    [0.58, 0.55],
    [0.68, 0.6],
    [0.78, 0.65],
  ];
  for (const [x, y] of b) pts.push({ x, y, g: "B" });
  return pts;
}

export function BiasInDataSandbox() {
  const [pts, setPts] = useState<Pt[]>(() => seedData());
  const [activeG, setActiveG] = useState<Group>("A");
  const [mit, setMit] = useState<Mitigation>("none");
  const [showProxy, setShowProxy] = useState(false);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const W = 420;
  const H = 320;
  const PAD = 36;

  function toSvg(x: number, y: number) {
    return {
      cx: PAD + x * (W - 2 * PAD),
      cy: H - PAD - y * (H - 2 * PAD),
    };
  }
  function fromSvg(px: number, py: number) {
    return {
      x: Math.min(1, Math.max(0, (px - PAD) / (W - 2 * PAD))),
      y: Math.min(1, Math.max(0, (H - PAD - py) / (H - 2 * PAD))),
    };
  }

  function addPoint(e: React.MouseEvent<SVGSVGElement>) {
    if (!svgRef.current) return;
    const r = svgRef.current.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    const py = ((e.clientY - r.top) / r.height) * H;
    const { x, y } = fromSvg(px, py);
    setPts((cur) => [...cur, { x, y, g: activeG }]);
  }

  function clearAll() {
    setPts([]);
  }
  function reseed() {
    setPts(seedData());
  }
  function applyBiasPreset() {
    setPts((cur) =>
      cur.map((p) =>
        p.g === "B" ? { ...p, y: Math.max(0, p.y - BIAS_SHIFT) } : p,
      ),
    );
  }

  // Vekter per mitigasjon
  const weighted = useMemo(() => {
    const nA = pts.filter((p) => p.g === "A").length || 1;
    const nB = pts.filter((p) => p.g === "B").length || 1;
    return pts.map((p) => {
      let w = 1;
      if (mit === "reweight") {
        // Inverse-frequency vekting: gjør B-gruppen like "tung" som A
        w = p.g === "A" ? 1 / nA : 1 / nB;
      }
      return { ...p, w };
    });
  }, [pts, mit]);

  // Resample-mitigasjon: kopier underrepresentert gruppe opp til samme antall.
  const resampled = useMemo(() => {
    if (mit !== "resample") return weighted;
    const a = weighted.filter((p) => p.g === "A");
    const b = weighted.filter((p) => p.g === "B");
    const target = Math.max(a.length, b.length);
    const upA: typeof weighted = [];
    const upB: typeof weighted = [];
    for (let i = 0; i < target; i++) {
      upA.push(a[i % Math.max(1, a.length)] ?? a[0]);
      upB.push(b[i % Math.max(1, b.length)] ?? b[0]);
    }
    return [...upA.filter(Boolean), ...upB.filter(Boolean)];
  }, [weighted, mit]);

  const fitA = useMemo(
    () =>
      fitLine(
        resampled
          .filter((p) => p.g === "A")
          .map((p) => ({ x: p.x, y: p.y, w: p.w })),
      ),
    [resampled],
  );
  const fitB = useMemo(
    () =>
      fitLine(
        resampled
          .filter((p) => p.g === "B")
          .map((p) => ({ x: p.x, y: p.y, w: p.w })),
      ),
    [resampled],
  );
  // Global modell — ignorerer gruppen ("drop protected attribute").
  // Hvis dataen er skjev, lærer den fortsatt den skjeve overgangen.
  const fitGlobal = useMemo(
    () => fitLine(resampled.map((p) => ({ x: p.x, y: p.y, w: p.w }))),
    [resampled],
  );

  // Gap ved midtkvalifikasjon x=0.5 — proxy-uttrykk for hvor stor bias er.
  const gapAtMid = useMemo(() => {
    const yA = fitA.a + fitA.b * 0.5;
    const yB = fitB.a + fitB.b * 0.5;
    return yA - yB;
  }, [fitA, fitB]);

  // For "drop-attr"-modus brukes global linje for begge grupper.
  // For å vise proxy-effekten lar vi en "proxy-modell" predikere ut fra
  // x-posisjon alene; hvis A-er typisk i en x-region og B-er i en annen,
  // vil global modell speile gruppe-medianer via x.
  const useGlobalForBoth = mit === "drop-attr";

  // Konfidens-stripe per gruppe (1 std av residual).
  function stripe(fit: { a: number; b: number }, group: Group) {
    const sub = pts.filter((p) => p.g === group);
    if (sub.length < 2) return { up: 0, dn: 0 };
    let s = 0;
    for (const p of sub) {
      const yhat = fit.a + fit.b * p.x;
      s += (p.y - yhat) * (p.y - yhat);
    }
    const sd = Math.sqrt(s / sub.length);
    return { up: sd, dn: sd };
  }
  const sA = stripe(useGlobalForBoth ? fitGlobal : fitA, "A");
  const sB = stripe(useGlobalForBoth ? fitGlobal : fitB, "B");

  // Bygg SVG-stier
  const lineA = useMemo(() => {
    const f = useGlobalForBoth ? fitGlobal : fitA;
    const p0 = toSvg(0, Math.max(0, Math.min(1, f.a)));
    const p1 = toSvg(1, Math.max(0, Math.min(1, f.a + f.b)));
    return `M ${p0.cx} ${p0.cy} L ${p1.cx} ${p1.cy}`;
  }, [fitA, fitGlobal, useGlobalForBoth]);
  const lineB = useMemo(() => {
    const f = useGlobalForBoth ? fitGlobal : fitB;
    const p0 = toSvg(0, Math.max(0, Math.min(1, f.a)));
    const p1 = toSvg(1, Math.max(0, Math.min(1, f.a + f.b)));
    return `M ${p0.cx} ${p0.cy} L ${p1.cx} ${p1.cy}`;
  }, [fitB, fitGlobal, useGlobalForBoth]);

  // Tekst-status
  const statusColor =
    Math.abs(gapAtMid) < 0.02
      ? "text-success"
      : Math.abs(gapAtMid) < 0.08
        ? "text-amber-600 dark:text-amber-400"
        : "text-destructive";
  const statusText =
    Math.abs(gapAtMid) < 0.02
      ? "Tilnærmet rettferdig (gap < 0.02)"
      : Math.abs(gapAtMid) < 0.08
        ? "Moderat gap — modellen lærer noe skjevhet"
        : "Stor systematisk bias mot gruppe B";

  const mitDesc: Record<Mitigation, string> = {
    none: "Modellen trenes ufiltrert på data slik den ligger.",
    reweight:
      "Hvert punkt vektes så A og B summeres til samme total — sjelden gruppe får tyngre punkter.",
    resample:
      "Underrepresentert gruppe oversamples (kopier til lik størrelse) før trening.",
    "drop-attr":
      "Vi 'fjerner' gruppe-attributtet og trener én global modell på alle punktene. Se hva som skjer hvis x korrelerer med gruppen.",
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="grid lg:grid-cols-[420px_1fr] gap-5">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
            Treningsdata — klikk for å legge til
          </div>
          <svg
            ref={svgRef}
            viewBox={`0 0 ${W} ${H}`}
            onClick={addPoint}
            className="w-full h-auto bg-background border border-border rounded-lg cursor-crosshair select-none"
            role="img"
            aria-label="Treningsdata-plott — kvalifikasjoner mot lønn"
          >
            {/* akser */}
            <line
              x1={PAD}
              y1={H - PAD}
              x2={W - PAD}
              y2={H - PAD}
              stroke="currentColor"
              className="text-border"
            />
            <line
              x1={PAD}
              y1={PAD}
              x2={PAD}
              y2={H - PAD}
              stroke="currentColor"
              className="text-border"
            />
            <text
              x={W / 2}
              y={H - 8}
              textAnchor="middle"
              className="fill-muted-foreground text-[10px]"
            >
              kvalifikasjoner →
            </text>
            <text
              x={10}
              y={H / 2}
              textAnchor="middle"
              transform={`rotate(-90 10 ${H / 2})`}
              className="fill-muted-foreground text-[10px]"
            >
              lønn →
            </text>
            {/* konfidensstripe A */}
            {pts.some((p) => p.g === "A") &&
              (() => {
                const f = useGlobalForBoth ? fitGlobal : fitA;
                const p0u = toSvg(0, Math.min(1, Math.max(0, f.a + sA.up)));
                const p1u = toSvg(
                  1,
                  Math.min(1, Math.max(0, f.a + f.b + sA.up)),
                );
                const p1d = toSvg(
                  1,
                  Math.min(1, Math.max(0, f.a + f.b - sA.dn)),
                );
                const p0d = toSvg(0, Math.min(1, Math.max(0, f.a - sA.dn)));
                return (
                  <path
                    d={`M ${p0u.cx} ${p0u.cy} L ${p1u.cx} ${p1u.cy} L ${p1d.cx} ${p1d.cy} L ${p0d.cx} ${p0d.cy} Z`}
                    fill="#3b82f6"
                    fillOpacity={0.08}
                  />
                );
              })()}
            {/* konfidensstripe B */}
            {pts.some((p) => p.g === "B") &&
              (() => {
                const f = useGlobalForBoth ? fitGlobal : fitB;
                const p0u = toSvg(0, Math.min(1, Math.max(0, f.a + sB.up)));
                const p1u = toSvg(
                  1,
                  Math.min(1, Math.max(0, f.a + f.b + sB.up)),
                );
                const p1d = toSvg(
                  1,
                  Math.min(1, Math.max(0, f.a + f.b - sB.dn)),
                );
                const p0d = toSvg(0, Math.min(1, Math.max(0, f.a - sB.dn)));
                return (
                  <path
                    d={`M ${p0u.cx} ${p0u.cy} L ${p1u.cx} ${p1u.cy} L ${p1d.cx} ${p1d.cy} L ${p0d.cx} ${p0d.cy} Z`}
                    fill="#f59e0b"
                    fillOpacity={0.08}
                  />
                );
              })()}
            {/* regresjonslinjer */}
            {pts.some((p) => p.g === "A") && (
              <path d={lineA} stroke="#3b82f6" strokeWidth={2} fill="none" />
            )}
            {pts.some((p) => p.g === "B") && (
              <path d={lineB} stroke="#f59e0b" strokeWidth={2} fill="none" />
            )}
            {/* punkter */}
            {pts.map((p, i) => {
              const c = toSvg(p.x, p.y);
              return (
                <circle
                  key={i}
                  cx={c.cx}
                  cy={c.cy}
                  r={5}
                  fill={p.g === "A" ? "#3b82f6" : "#f59e0b"}
                  stroke="white"
                  strokeWidth={1}
                />
              );
            })}
            {/* gap-markering ved x=0.5 */}
            {pts.length > 4 && (
              <>
                <line
                  x1={toSvg(0.5, 0).cx}
                  y1={toSvg(0.5, Math.min(1, Math.max(0, fitA.a + fitA.b * 0.5))).cy}
                  x2={toSvg(0.5, 0).cx}
                  y2={toSvg(0.5, Math.min(1, Math.max(0, fitB.a + fitB.b * 0.5))).cy}
                  stroke="#dc2626"
                  strokeWidth={1.5}
                  strokeDasharray="3 2"
                />
                <text
                  x={toSvg(0.5, 0).cx + 4}
                  y={toSvg(0.5, (fitA.a + fitA.b * 0.5 + fitB.a + fitB.b * 0.5) / 2).cy}
                  className="fill-destructive text-[10px] font-semibold"
                >
                  gap
                </text>
              </>
            )}
          </svg>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveG("A")}
              className={`text-xs rounded-md px-3 py-1.5 border ${
                activeG === "A"
                  ? "border-[#3b82f6] bg-[#3b82f6]/10 text-[#3b82f6]"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              ● Gruppe A
            </button>
            <button
              type="button"
              onClick={() => setActiveG("B")}
              className={`text-xs rounded-md px-3 py-1.5 border ${
                activeG === "B"
                  ? "border-[#f59e0b] bg-[#f59e0b]/10 text-[#f59e0b]"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              ● Gruppe B
            </button>
            <button
              type="button"
              onClick={applyBiasPreset}
              className="text-xs rounded-md px-3 py-1.5 border border-destructive/40 bg-destructive/5 text-destructive hover:bg-destructive/10"
            >
              Injiser bias (skift B ned)
            </button>
            <button
              type="button"
              onClick={reseed}
              className="text-xs rounded-md px-3 py-1.5 border border-border bg-card text-muted-foreground hover:text-foreground"
            >
              Reset preset
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="text-xs rounded-md px-3 py-1.5 border border-border bg-card text-muted-foreground hover:text-foreground"
            >
              Tøm
            </button>
          </div>
        </div>

        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
            Mitigasjon
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(["none", "reweight", "resample", "drop-attr"] as Mitigation[]).map(
              (m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setMit(m)}
                  className={`text-xs rounded-md px-3 py-2 border text-left ${
                    mit === m
                      ? "border-brand bg-brand/10 text-foreground"
                      : "border-border bg-card text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <div className="font-semibold">
                    {m === "none" && "Ingen mitigasjon"}
                    {m === "reweight" && "Reweighting"}
                    {m === "resample" && "Resampling"}
                    {m === "drop-attr" && "Fjern attributt"}
                  </div>
                </button>
              ),
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-2">{mitDesc[mit]}</p>

          <div className="mt-4 rounded-lg border border-border bg-background p-3">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
              Modellens prediksjons-gap ved kvalifikasjon = 0.5
            </div>
            <div className={`text-lg font-semibold tabular-nums ${statusColor}`}>
              y(A) − y(B) = {gapAtMid.toFixed(3)}
            </div>
            <div className={`text-xs ${statusColor}`}>{statusText}</div>
          </div>

          <div className="mt-4 rounded-lg border border-border bg-background p-3 text-xs">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
              Modell-parametere
            </div>
            <div className="font-mono text-muted-foreground">
              A: y = {fitA.a.toFixed(2)} + {fitA.b.toFixed(2)} · x
            </div>
            <div className="font-mono text-muted-foreground">
              B: y = {fitB.a.toFixed(2)} + {fitB.b.toFixed(2)} · x
            </div>
            <div className="font-mono text-muted-foreground">
              global: y = {fitGlobal.a.toFixed(2)} + {fitGlobal.b.toFixed(2)} · x
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowProxy((v) => !v)}
            className="mt-4 w-full text-xs rounded-md border border-amber-500/40 bg-amber-500/5 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10 px-3 py-2"
          >
            {showProxy ? "Skjul" : "Vis"}: hvorfor "fjern attributt" ikke alltid hjelper
          </button>
          {showProxy && (
            <div className="mt-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-foreground">
              Hvis du har skjøvet B-gruppen ned med "Injiser bias" og deretter
              skifter til <em>Fjern attributt</em>, vil den globale modellen
              fortsatt lære en lavere gjennomsnittlig lønn for samme x — fordi
              dataen i seg selv koder skjevheten gjennom selve fordelingen.
              Dette er det klassiske <strong>proxy-problemet</strong>: postnummer
              er proxy for rase, navn er proxy for kjønn. Å fjerne
              gruppe-attributtet uten å fikse skjevheten i selve dataen er
              "fairness through unawareness" — en av de mest kritiserte
              tilnærmingene i fairness-litteraturen.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
