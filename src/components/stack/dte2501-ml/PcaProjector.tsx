import { useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

/**
 * Interaktiv PCA-projisering.
 *
 * Vi genererer 3D-punkter, lar brukeren rotere skyen, og kjører enkel
 * PCA (egenvektor av kovariansmatrisen) for å vise hvilke retninger som
 * fanger mest varians. «Projisering»-toggle animerer punktene ned til
 * 0 langs den minste komponent-aksen.
 *
 * Tre lag:
 *  - Basis:   1 datasett, animert projeksjon 3D→2D, varians-bars.
 *  - Dypere:  velg datasett (3 ulike kovarians-strukturer), slider for
 *             hvor mange komponenter beholdes (1 eller 2).
 *  - Eksamen: korrelert datasett — spør hvor mye varians PC1 forklarer.
 */

type Mode = "basis" | "deep" | "exam";
type Dataset = "korrelert" | "ortogonal" | "klynger";

type Pt3 = { x: number; y: number; z: number };

function mulberry32(seed: number) {
  let a = seed | 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function gauss(rng: () => number, m = 0, s = 1) {
  return m + s * Math.sqrt(-2 * Math.log(Math.max(1e-9, rng()))) * Math.cos(2 * Math.PI * rng());
}

function generate(ds: Dataset, seed: number): Pt3[] {
  const rng = mulberry32(seed);
  const pts: Pt3[] = [];
  if (ds === "korrelert") {
    // Sterk korrelasjon mellom x og y, lav z-spredning
    for (let i = 0; i < 80; i++) {
      const u = gauss(rng, 0, 1.6);
      const v = gauss(rng, 0, 0.4);
      pts.push({ x: u + v * 0.3, y: 0.85 * u + v * 0.5, z: gauss(rng, 0, 0.3) });
    }
  } else if (ds === "ortogonal") {
    for (let i = 0; i < 80; i++) {
      pts.push({ x: gauss(rng, 0, 1.4), y: gauss(rng, 0, 1.0), z: gauss(rng, 0, 0.6) });
    }
  } else {
    // klynger langs en diagonal
    const centers = [
      { x: -1.5, y: -1.0, z: 0 },
      { x: 1.5, y: 1.0, z: 0 },
    ];
    for (let i = 0; i < 80; i++) {
      const c = centers[i % 2];
      pts.push({
        x: gauss(rng, c.x, 0.5),
        y: gauss(rng, c.y, 0.4),
        z: gauss(rng, c.z, 0.3),
      });
    }
  }
  return pts;
}

// 3x3 matrise-utility
type M3 = [number, number, number, number, number, number, number, number, number];

function covarianceMatrix(pts: Pt3[]): M3 {
  const n = pts.length;
  let mx = 0;
  let my = 0;
  let mz = 0;
  for (const p of pts) {
    mx += p.x;
    my += p.y;
    mz += p.z;
  }
  mx /= n;
  my /= n;
  mz /= n;
  let xx = 0;
  let yy = 0;
  let zz = 0;
  let xy = 0;
  let xz = 0;
  let yz = 0;
  for (const p of pts) {
    const dx = p.x - mx;
    const dy = p.y - my;
    const dz = p.z - mz;
    xx += dx * dx;
    yy += dy * dy;
    zz += dz * dz;
    xy += dx * dy;
    xz += dx * dz;
    yz += dy * dz;
  }
  const d = n - 1 || 1;
  return [
    xx / d, xy / d, xz / d,
    xy / d, yy / d, yz / d,
    xz / d, yz / d, zz / d,
  ];
}

// Jacobi-rotasjon for å diagonalisere symmetrisk 3x3
function eigJacobi(Min: M3): { vals: [number, number, number]; vecs: [number[], number[], number[]] } {
  const A: number[][] = [
    [Min[0], Min[1], Min[2]],
    [Min[3], Min[4], Min[5]],
    [Min[6], Min[7], Min[8]],
  ];
  const V: number[][] = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ];
  for (let sweep = 0; sweep < 100; sweep++) {
    let off = 0;
    for (let i = 0; i < 3; i++) {
      for (let j = i + 1; j < 3; j++) off += Math.abs(A[i][j]);
    }
    if (off < 1e-10) break;
    for (let p = 0; p < 2; p++) {
      for (let q = p + 1; q < 3; q++) {
        if (Math.abs(A[p][q]) < 1e-14) continue;
        const theta = (A[q][q] - A[p][p]) / (2 * A[p][q]);
        const t =
          theta >= 0
            ? 1 / (theta + Math.sqrt(1 + theta * theta))
            : 1 / (theta - Math.sqrt(1 + theta * theta));
        const c = 1 / Math.sqrt(1 + t * t);
        const s = t * c;
        const Apq = A[p][q];
        A[p][p] -= t * Apq;
        A[q][q] += t * Apq;
        A[p][q] = 0;
        A[q][p] = 0;
        for (let r = 0; r < 3; r++) {
          if (r !== p && r !== q) {
            const Arp = A[r][p];
            const Arq = A[r][q];
            A[r][p] = c * Arp - s * Arq;
            A[p][r] = A[r][p];
            A[r][q] = s * Arp + c * Arq;
            A[q][r] = A[r][q];
          }
        }
        for (let r = 0; r < 3; r++) {
          const Vrp = V[r][p];
          const Vrq = V[r][q];
          V[r][p] = c * Vrp - s * Vrq;
          V[r][q] = s * Vrp + c * Vrq;
        }
      }
    }
  }
  const vals: [number, number, number] = [A[0][0], A[1][1], A[2][2]];
  const vecs: [number[], number[], number[]] = [
    [V[0][0], V[1][0], V[2][0]],
    [V[0][1], V[1][1], V[2][1]],
    [V[0][2], V[1][2], V[2][2]],
  ];
  // sortér etter egenverdi avtagende
  const idx = [0, 1, 2].sort((a, b) => vals[b] - vals[a]);
  return {
    vals: [vals[idx[0]], vals[idx[1]], vals[idx[2]]],
    vecs: [vecs[idx[0]], vecs[idx[1]], vecs[idx[2]]],
  };
}

const W = 480;
const H = 360;
const CX = W / 2;
const CY = H / 2;
const SCALE = 60;

function rotate(p: Pt3, yaw: number, pitch: number): Pt3 {
  // y rotation (yaw), deretter x rotation (pitch)
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  const x1 = cy * p.x + sy * p.z;
  const z1 = -sy * p.x + cy * p.z;
  const y1 = p.y;
  const cp = Math.cos(pitch);
  const sp = Math.sin(pitch);
  const y2 = cp * y1 - sp * z1;
  const z2 = sp * y1 + cp * z1;
  return { x: x1, y: y2, z: z2 };
}

function project(p: Pt3): { x: number; y: number; depth: number } {
  // enkel perspektivisk
  const persp = 1 / (1 + p.z * 0.12);
  return {
    x: CX + p.x * SCALE * persp,
    y: CY - p.y * SCALE * persp,
    depth: p.z,
  };
}

export function PcaProjector() {
  const [mode, setMode] = useState<Mode>("basis");
  const [ds, setDs] = useState<Dataset>("korrelert");
  const [yaw, setYaw] = useState(0.6);
  const [pitch, setPitch] = useState(0.4);
  const [projAmount, setProjAmount] = useState(0); // 0 = full 3D, 1 = projisert til topp 2 PC
  const [kComps, setKComps] = useState(2);
  const [animating, setAnimating] = useState(false);

  const draggingRef = useRef<{ lx: number; ly: number } | null>(null);
  const animRef = useRef<number | null>(null);

  const pts = useMemo(() => generate(mode === "exam" ? "korrelert" : ds, 21), [mode, ds]);
  const cov = useMemo(() => covarianceMatrix(pts), [pts]);
  const eig = useMemo(() => eigJacobi(cov), [cov]);

  const totalVar = eig.vals[0] + eig.vals[1] + eig.vals[2];
  const ratios = eig.vals.map((v) => v / totalVar);

  // Projiser hvert punkt: kompenser ved å gradvis fjerne komponenter med små egenverdier
  const projectedPts = useMemo(() => {
    const dropComps = 3 - kComps; // 0, 1 eller 2
    return pts.map((p) => {
      // skriv om i PC-basis, demp de minste komponentene
      const px = p.x * eig.vecs[0][0] + p.y * eig.vecs[0][1] + p.z * eig.vecs[0][2];
      const py = p.x * eig.vecs[1][0] + p.y * eig.vecs[1][1] + p.z * eig.vecs[1][2];
      const pz = p.x * eig.vecs[2][0] + p.y * eig.vecs[2][1] + p.z * eig.vecs[2][2];
      // demp PC3 (og evt. PC2 hvis kComps=1) lineært med projAmount
      const pz2 = dropComps >= 1 ? pz * (1 - projAmount) : pz;
      const py2 = dropComps >= 2 ? py * (1 - projAmount) : py;
      // tilbake til original basis
      const nx = px * eig.vecs[0][0] + py2 * eig.vecs[1][0] + pz2 * eig.vecs[2][0];
      const ny = px * eig.vecs[0][1] + py2 * eig.vecs[1][1] + pz2 * eig.vecs[2][1];
      const nz = px * eig.vecs[0][2] + py2 * eig.vecs[1][2] + pz2 * eig.vecs[2][2];
      return { x: nx, y: ny, z: nz };
    });
  }, [pts, eig, projAmount, kComps]);

  // animasjon
  useEffect(() => {
    if (!animating) return;
    const start = performance.now();
    const fromVal = projAmount;
    const toVal = projAmount > 0.5 ? 0 : 1;
    const dur = 1200;
    const tick = (t: number) => {
      const u = Math.min(1, (t - start) / dur);
      setProjAmount(fromVal + (toVal - fromVal) * u);
      if (u < 1) {
        animRef.current = requestAnimationFrame(tick);
      } else {
        setAnimating(false);
      }
    };
    animRef.current = requestAnimationFrame(tick);
    return () => {
      if (animRef.current !== null) cancelAnimationFrame(animRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animating]);

  useEffect(() => {
    return () => {
      if (animRef.current !== null) cancelAnimationFrame(animRef.current);
    };
  }, []);

  function onDown(e: React.PointerEvent<SVGSVGElement>) {
    draggingRef.current = { lx: e.clientX, ly: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function onMove(e: React.PointerEvent<SVGSVGElement>) {
    if (!draggingRef.current) return;
    const dx = e.clientX - draggingRef.current.lx;
    const dy = e.clientY - draggingRef.current.ly;
    draggingRef.current = { lx: e.clientX, ly: e.clientY };
    setYaw((v) => v + dx * 0.01);
    setPitch((v) => Math.max(-1.2, Math.min(1.2, v + dy * 0.01)));
  }
  function onUp(e: React.PointerEvent<SVGSVGElement>) {
    draggingRef.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  }

  // Render-rekkefølge etter z (depth-sortering)
  const rendered = projectedPts
    .map((p) => {
      const r = rotate(p, yaw, pitch);
      return { p: r, screen: project(r) };
    })
    .sort((a, b) => a.p.z - b.p.z);

  // PC-akser som 3D piler
  const axes = useMemo(() => {
    const length = [1.8, 1.4, 0.9];
    return eig.vecs.map((v, i) => {
      const tip = { x: v[0] * length[i], y: v[1] * length[i], z: v[2] * length[i] };
      const r = rotate(tip, yaw, pitch);
      return { tip: project(r) };
    });
  }, [eig, yaw, pitch]);

  const varianceData = ratios.map((r, i) => ({
    name: `PC${i + 1}`,
    ratio: Number((r * 100).toFixed(1)),
  }));

  const explainedByKept =
    kComps === 1
      ? ratios[0]
      : kComps === 2
        ? ratios[0] + ratios[1]
        : 1;

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="text-xs uppercase tracking-wider text-brand font-semibold">
          PCA-projisering (3D → 2D)
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {(["basis", "deep", "exam"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={
                "px-2.5 py-1 rounded border text-xs " +
                (mode === m
                  ? "border-brand bg-brand/10 text-brand"
                  : "border-border bg-background hover:border-brand/40")
              }
            >
              {m === "basis" ? "Basis" : m === "deep" ? "Dypere" : "Eksamen"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_220px] gap-4">
        <div className="rounded-lg border border-border bg-background overflow-hidden">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full h-auto select-none touch-none"
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            style={{ cursor: "grab" }}
          >
            {/* origo-akser (X=red, Y=green, Z=blue lett synlige) */}
            {(["red", "green", "blue"] as const).map((c, ai) => {
              const ax: Pt3 =
                ai === 0
                  ? { x: 2, y: 0, z: 0 }
                  : ai === 1
                    ? { x: 0, y: 2, z: 0 }
                    : { x: 0, y: 0, z: 2 };
              const r = rotate(ax, yaw, pitch);
              const e = project(r);
              return (
                <line
                  key={c}
                  x1={CX}
                  y1={CY}
                  x2={e.x}
                  y2={e.y}
                  stroke="currentColor"
                  opacity={0.12}
                  strokeWidth={1}
                />
              );
            })}

            {/* punktsky */}
            {rendered.map((r, i) => {
              const op = 0.4 + Math.max(0, Math.min(0.6, (r.p.z + 2) / 4));
              return (
                <circle
                  key={i}
                  cx={r.screen.x}
                  cy={r.screen.y}
                  r={4}
                  fill="hsl(28 90% 55%)"
                  opacity={op}
                />
              );
            })}

            {/* PC-akser */}
            {axes.map((a, i) => (
              <g key={`pc${i}`}>
                <line
                  x1={CX}
                  y1={CY}
                  x2={a.tip.x}
                  y2={a.tip.y}
                  stroke={
                    i === 0
                      ? "hsl(215 80% 55%)"
                      : i === 1
                        ? "hsl(150 60% 45%)"
                        : "hsl(285 60% 60%)"
                  }
                  strokeWidth={2.5}
                  opacity={i + 1 > kComps ? 0.25 : 1}
                />
                <text
                  x={a.tip.x + 6}
                  y={a.tip.y - 4}
                  fontSize={11}
                  fontWeight={700}
                  fill={
                    i === 0
                      ? "hsl(215 80% 55%)"
                      : i === 1
                        ? "hsl(150 60% 45%)"
                        : "hsl(285 60% 60%)"
                  }
                  opacity={i + 1 > kComps ? 0.4 : 1}
                >
                  PC{i + 1}
                </text>
              </g>
            ))}

            <text x={10} y={H - 10} fontSize={10} fill="currentColor" opacity={0.5}>
              Dra for å rotere · yaw {yaw.toFixed(2)} / pitch {pitch.toFixed(2)}
            </text>
          </svg>
        </div>

        <div className="space-y-3">
          <div className="rounded-md border border-border bg-background px-3 py-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              Forklart varians
            </div>
            <div className="text-lg font-mono font-bold">
              {(explainedByKept * 100).toFixed(1)} %
            </div>
            <div className="text-xs text-muted-foreground">
              med {kComps} komponent{kComps > 1 ? "er" : ""}
            </div>
          </div>

          <div className="h-32 rounded border border-border bg-background p-1">
            <ResponsiveContainer>
              <BarChart data={varianceData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} unit="%" />
                <Tooltip formatter={(v: number) => `${v}%`} />
                <Bar dataKey="ratio">
                  {varianceData.map((_, i) => (
                    <Cell
                      key={i}
                      fill={
                        i + 1 <= kComps
                          ? i === 0
                            ? "hsl(215 80% 55%)"
                            : i === 1
                              ? "hsl(150 60% 45%)"
                              : "hsl(285 60% 60%)"
                          : "hsl(0 0% 60%)"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {mode === "deep" && (
            <>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Datasett</div>
                <div className="grid grid-cols-3 gap-1">
                  {(["korrelert", "ortogonal", "klynger"] as Dataset[]).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => {
                        setDs(d);
                        setProjAmount(0);
                      }}
                      className={
                        "px-1.5 py-1 rounded border text-[11px] " +
                        (ds === d
                          ? "border-brand bg-brand/10 text-brand"
                          : "border-border bg-background hover:border-brand/40")
                      }
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">
                  Behold k = {kComps}
                </div>
                <div className="flex gap-1">
                  {[1, 2].map((kk) => (
                    <button
                      key={kk}
                      type="button"
                      onClick={() => {
                        setKComps(kk);
                        setProjAmount(0);
                      }}
                      className={
                        "flex-1 px-2 py-1 rounded border text-xs " +
                        (kComps === kk
                          ? "border-brand bg-brand/10 text-brand"
                          : "border-border bg-background hover:border-brand/40")
                      }
                    >
                      {kk}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <button
            type="button"
            onClick={() => setAnimating(true)}
            disabled={animating}
            className="w-full rounded-md bg-brand text-brand-foreground px-3 py-1.5 text-sm font-medium hover:opacity-90 disabled:opacity-40"
          >
            Animer {projAmount > 0.5 ? "tilbake til 3D" : "projisering"}
          </button>

          {mode === "exam" && (
            <div className="text-xs space-y-1.5">
              <div className="text-muted-foreground">
                Sterkt korrelert datasett (x ≈ y). Spørsmål: ca. hvor mye
                varians fanger PC1?
              </div>
              <div className="rounded border border-emerald-500/40 bg-emerald-500/10 p-2 text-emerald-700 dark:text-emerald-400 font-mono">
                PC1 = {(ratios[0] * 100).toFixed(1)} %.<br />
                PC1+PC2 = {((ratios[0] + ratios[1]) * 100).toFixed(1)} %.
              </div>
              <div className="text-[11px] text-muted-foreground">
                Når korrelasjonen er sterk fanger PC1 alene typisk &gt; 80 %.
              </div>
            </div>
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">
        PC-aksene (blå/grønn/lilla) er egenvektorene til kovariansmatrisen,
        sortert etter egenverdi avtakende. Projeksjons-animasjonen «flater»
        skyen mot de aksene du beholder.
      </p>
    </div>
  );
}
