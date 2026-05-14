import { useEffect, useMemo, useState } from "react";
import { Play, Pause, RotateCcw, SkipForward } from "lucide-react";

// 3-node distance vector simulator (Kurose 5.2.2, fig 5.6).
// Topologi:  x ── c(x,y) ── y ── 1 ── z
// I tillegg: x ── 50 ── z (alternativ rute som vanligvis er dyrere).
//
// Steady state med c(x,y)=4:
//   Dy(x)=4, Dy(z)=5
//   Dz(x)=5, Dz(y)=1
//   Dx(y)=4, Dx(z)=51 (via x) — egentlig 5 via y. La oss bruke fig 5.6 nøyaktig.
//
// Forenkling: vi følger bokens fig 5.6 — viser kun Dy(x) og Dz(x), dvs.
// y og z sine estimater for kostnaden til x. Det er der "count-to-infinity"
// utspiller seg når c(y,x) endrer seg.

type Step = {
  t: number;
  Dy: number; // y sin beste sti til x (currently believed)
  Dz: number; // z sin beste sti til x
  yVia: "x" | "z"; // hvilken nabo y går via for å nå x
  zVia: "x" | "y";
  event: string;
};

const INFINITY_THRESHOLD = 60;

function simulate(
  cxyOld: number,
  cxyNew: number,
  poisonedReverse: boolean,
): Step[] {
  // c(y,z)=1 alltid. c(y,x) endres fra cxyOld til cxyNew ved t=0.
  // Hvis cxyNew < cxyOld (good news): konvergerer raskt.
  // Hvis cxyNew > cxyOld (bad news): count-to-infinity-loop.
  const cyz = 1;

  // Steady state foer endringen — beregn naive minst-kostnads-stier.
  // Dy = min(c(y,x), c(y,z)+Dz) der Dz er z sin beste til x.
  // Med cxyOld=4: Dy=4 (via x), Dz=5 (via y, 1+4). Dette er bokens utgangspunkt.
  let Dy = cxyOld;
  let Dz = cyz + cxyOld;
  let yVia: "x" | "z" = "x";
  let zVia: "x" | "y" = "y";

  const steps: Step[] = [];
  steps.push({
    t: 0,
    Dy,
    Dz,
    yVia,
    zVia,
    event: `Steady state med c(y,x) = ${cxyOld}: Dy(x) = ${Dy}, Dz(x) = ${Dz}.`,
  });

  // Ved t=1: c(y,x) endres fra cxyOld til cxyNew.
  // y oppdager dette og oppdaterer Dy.
  // Hvis poisoned reverse: z annonserte Dz = INFINITY til y (fordi z gikk via y).
  // Dvs. y "ser" Dz = INFINITY fra z sitt rykte, og kan ikke gå via z.
  // I 2-node-tilfelle: y ser umiddelbart at direktelenken er beste, ingen loop.
  // I 3-node (vi har egentlig kun 2: x-y-z, men y kan ikke gaa via z hvis pr).
  //
  // Her er trikset: poisoned reverse mellom y og z. Hvis y bruker z for å naa x,
  // forteller y til z: Dy(x) = INFINITY (lyver). Likedan z til y.
  // I steady state: z går via y → z sier til y at "Dz(x) = INFINITY".
  // y går via x direkte, så y forteller sannheten til z.
  //
  // Når c(y,x) hopper til cxyNew=60:
  // - Uten poisoned reverse: y vet ikke at z går via y, så y tror Dz=5 → Dy = 1+5 = 6.
  //   y sier til z: "Dy = 6". z oppdaterer: Dz = 1+6 = 7. z sier til y: "Dz = 7".
  //   y oppdaterer: Dy = 1+7 = 8. ...loop til Dy >= 60.
  // - Med poisoned reverse: z har sagt til y at Dz = INFINITY. Så y må bruke
  //   direktelenken: Dy = 60. Konvergerer umiddelbart i 2-node.
  //
  // For 3-hop-eksempelet (z ─ y ─ x og ny lenke z ─ w ─ x faller): poisoned reverse
  // hjelper ikke. Vi simulerer det enklere 2-node-tilfellet for "count-to-infinity",
  // og bruker poisoned reverse som toggle som unngår problemet.

  steps.push({
    t: 1,
    Dy,
    Dz,
    yVia,
    zVia,
    event: `Hendelse: c(y,x) endres fra ${cxyOld} til ${cxyNew}.`,
  });

  // y oppdager endringen. Beregn Dy.
  // y har to alternativer: gå direkte (c(y,x) = cxyNew) eller via z (cyz + Dz).
  // Hvis poisoned reverse er på OG zVia === "y", da har z annonsert Dz = INFINITY til y.
  // I steady state med cxyOld=4: yVia=x, zVia=y. Så z annonserer INFINITY til y.
  // Da må y velge: Dy = min(cxyNew, cyz + INFINITY) = cxyNew. Ingen loop.
  // Uten pr: Dy = min(cxyNew, cyz + Dz) = min(60, 1+5) = 6. LOOP.

  let Dz_advertised_to_y = poisonedReverse && zVia === "y" ? Number.POSITIVE_INFINITY : Dz;
  let Dy_advertised_to_z = poisonedReverse && yVia === "z" ? Number.POSITIVE_INFINITY : Dy;

  // y reagerer:
  const yAlt1 = cxyNew;
  const yAlt2 = cyz + Dz_advertised_to_y;
  const newDy = Math.min(yAlt1, yAlt2);
  const newYVia: "x" | "z" = yAlt1 <= yAlt2 ? "x" : "z";
  Dy = newDy;
  yVia = newYVia;

  steps.push({
    t: 2,
    Dy,
    Dz,
    yVia,
    zVia,
    event: poisonedReverse && zVia === "y"
      ? `y oppdager endringen. z annonserer Dz = ∞ til y (poisoned reverse). y velger direktelenken: Dy = ${Dy}.`
      : `y oppdager endringen. y vet ikke at z går via y, så y tror Dz = ${Dz}. y velger: min(${cxyNew}, 1+${Dz}) = ${Dy} via ${yVia}.`,
  });

  // Hvis poisoned reverse aktiverer umiddelbar konvergens, er vi ferdige.
  if (Dy === cxyNew && yVia === "x") {
    // z må fortsatt oppdatere seg.
    Dy_advertised_to_z = poisonedReverse && yVia === "z" ? Number.POSITIVE_INFINITY : Dy;
    const zAlt = cyz + Dy_advertised_to_z;
    Dz = zAlt; // z gar uansett via y i dette mini-eksempelet (ingen direkte z-x).
    zVia = "y";
    steps.push({
      t: 3,
      Dy,
      Dz,
      yVia,
      zVia,
      event: `z får ryktet: Dy = ${Dy}. z oppdaterer: Dz = 1 + ${Dy} = ${Dz}. Konvergert.`,
    });
    return steps;
  }

  // Ellers: count-to-infinity-loop.
  // y annonserer sin nye Dy til z. z oppdaterer Dz = 1 + Dy. Osv.
  let t = 3;
  let safetyMax = 100;
  while (safetyMax-- > 0 && Math.max(Dy, Dz) < INFINITY_THRESHOLD) {
    // z reagerer på y sitt rykte
    Dy_advertised_to_z = poisonedReverse && yVia === "z" ? Number.POSITIVE_INFINITY : Dy;
    const newDz = cyz + Dy_advertised_to_z;
    const oldDz = Dz;
    Dz = newDz;
    zVia = "y";
    steps.push({
      t: t++,
      Dy,
      Dz,
      yVia,
      zVia,
      event: `z får Dy = ${Dy} fra y. Oppdaterer: Dz = 1 + ${Dy} = ${Dz} (var ${oldDz}).`,
    });
    if (Dz >= INFINITY_THRESHOLD) break;

    // y reagerer pa z sitt rykte
    Dz_advertised_to_y = poisonedReverse && zVia === "y" ? Number.POSITIVE_INFINITY : Dz;
    const yA = cxyNew;
    const yB = cyz + Dz_advertised_to_y;
    const newDy2 = Math.min(yA, yB);
    const oldDy = Dy;
    const newYV: "x" | "z" = yA <= yB ? "x" : "z";
    Dy = newDy2;
    yVia = newYV;

    if (yVia === "x") {
      // y endelig innser at direktelenken (selv om dyr) er bedre.
      steps.push({
        t: t++,
        Dy,
        Dz,
        yVia,
        zVia,
        event: `y sammenligner: direkte = ${cxyNew}, via z = 1+${Dz} = ${yB}. y velger direkte! Dy = ${Dy}.`,
      });
      // En siste runde til z.
      Dy_advertised_to_z = poisonedReverse && yVia === "z" ? Number.POSITIVE_INFINITY : Dy;
      Dz = cyz + Dy_advertised_to_z;
      steps.push({
        t: t++,
        Dy,
        Dz,
        yVia,
        zVia,
        event: `z får Dy = ${Dy}. Dz = 1 + ${Dy} = ${Dz}. Konvergert.`,
      });
      break;
    } else {
      steps.push({
        t: t++,
        Dy,
        Dz,
        yVia,
        zVia,
        event: `y får Dz = ${Dz} fra z. min(${cxyNew}, 1+${Dz}) = ${Dy} via ${yVia} (var ${oldDy}).`,
      });
    }
  }
  return steps;
}

export function CountToInfinitySim() {
  const [cxyNew, setCxyNew] = useState(60);
  const [poisonedReverse, setPoisonedReverse] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);

  const steps = useMemo(
    () => simulate(4, cxyNew, poisonedReverse),
    [cxyNew, poisonedReverse],
  );

  useEffect(() => {
    setStepIdx(0);
    setPlaying(false);
  }, [cxyNew, poisonedReverse]);

  useEffect(() => {
    if (!playing) return;
    if (stepIdx >= steps.length - 1) {
      setPlaying(false);
      return;
    }
    const tm = setTimeout(() => setStepIdx((p) => p + 1), 500);
    return () => clearTimeout(tm);
  }, [playing, stepIdx, steps.length]);

  const current = steps[Math.min(stepIdx, steps.length - 1)];
  const isLoop = cxyNew > 4 && !poisonedReverse;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="border-b border-border bg-muted/30 px-4 py-3 flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">Ny c(y,x):</span>
          <input
            type="range"
            min={1}
            max={60}
            value={cxyNew}
            onChange={(e) => setCxyNew(parseInt(e.target.value, 10))}
            className="w-32"
          />
          <span className="font-mono font-semibold w-7 text-right">{cxyNew}</span>
        </label>
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={poisonedReverse}
            onChange={(e) => setPoisonedReverse(e.target.checked)}
            className="accent-brand"
          />
          <span>Poisoned reverse</span>
        </label>
        <div className="ml-auto text-[11px] text-muted-foreground">
          {cxyNew < 4 ? "Good news" : cxyNew === 4 ? "Ingen endring" : "Bad news"}
          {" · "}
          {steps.length - 1} iterasjoner totalt
        </div>
      </div>

      <div className="grid md:grid-cols-[1fr_320px]">
        <div className="bg-background p-6 flex flex-col items-center justify-center min-h-[280px]">
          {/* 3-node graf: x — y — z */}
          <svg viewBox="0 0 360 180" className="w-full max-w-md">
            {/* edge x-y */}
            <line
              x1="40"
              y1="90"
              x2="180"
              y2="90"
              stroke={current.t === 1 ? "#ef4444" : "#94a3b8"}
              strokeWidth={current.t === 1 ? 4 : 2}
            />
            <text
              x="110"
              y="80"
              textAnchor="middle"
              className="font-mono text-xs fill-current"
              fill={current.t === 1 ? "#ef4444" : "var(--muted-foreground)"}
            >
              {current.t === 0 ? "4" : `${cxyNew}`}
            </text>
            {/* edge y-z */}
            <line x1="180" y1="90" x2="320" y2="90" stroke="#94a3b8" strokeWidth={2} />
            <text
              x="250"
              y="80"
              textAnchor="middle"
              className="font-mono text-xs fill-current"
              fill="var(--muted-foreground)"
            >
              1
            </text>

            {/* nodes */}
            <circle cx="40" cy="90" r="22" className="fill-card stroke-foreground" strokeWidth={2} />
            <text x="40" y="95" textAnchor="middle" className="font-bold fill-current">x</text>
            <circle
              cx="180"
              cy="90"
              r="22"
              className="fill-card"
              stroke={current.t >= 2 ? "#f97316" : "var(--foreground)"}
              strokeWidth={current.t >= 2 ? 3 : 2}
            />
            <text x="180" y="95" textAnchor="middle" className="font-bold fill-current">y</text>
            <circle
              cx="320"
              cy="90"
              r="22"
              className="fill-card"
              stroke={current.t >= 3 ? "#f97316" : "var(--foreground)"}
              strokeWidth={current.t >= 3 ? 3 : 2}
            />
            <text x="320" y="95" textAnchor="middle" className="font-bold fill-current">z</text>

            {/* labels above nodes */}
            <text x="180" y="40" textAnchor="middle" className="font-mono text-[11px] fill-current" fill="var(--muted-foreground)">
              Dy(x) = {current.Dy >= INFINITY_THRESHOLD ? "∞" : current.Dy} via {current.yVia}
            </text>
            <text x="320" y="40" textAnchor="middle" className="font-mono text-[11px] fill-current" fill="var(--muted-foreground)">
              Dz(x) = {current.Dz >= INFINITY_THRESHOLD ? "∞" : current.Dz} via {current.yVia === "z" ? "y" : current.zVia}
            </text>
          </svg>

          <div className="mt-4 text-[11px] text-muted-foreground text-center max-w-md leading-relaxed">
            {current.event}
          </div>
        </div>

        <aside className="border-t md:border-t-0 md:border-l border-border bg-background p-4 text-sm flex flex-col gap-3">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">
              Iterasjon {stepIdx} av {steps.length - 1}
            </div>
            <div className="font-mono text-[12px] space-y-1">
              <div>
                <span className="text-muted-foreground">Dy(x) =</span>{" "}
                <span className={current.Dy >= INFINITY_THRESHOLD ? "text-red-500 font-bold" : "text-brand font-semibold"}>
                  {current.Dy >= INFINITY_THRESHOLD ? "∞" : current.Dy}
                </span>{" "}
                via {current.yVia}
              </div>
              <div>
                <span className="text-muted-foreground">Dz(x) =</span>{" "}
                <span className={current.Dz >= INFINITY_THRESHOLD ? "text-red-500 font-bold" : "text-brand font-semibold"}>
                  {current.Dz >= INFINITY_THRESHOLD ? "∞" : current.Dz}
                </span>{" "}
                via {current.zVia}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStepIdx((p) => Math.min(p + 1, steps.length - 1))}
              disabled={stepIdx >= steps.length - 1 || playing}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md bg-brand text-brand-foreground text-xs font-medium px-2 py-1.5 disabled:opacity-50"
            >
              <SkipForward className="h-3.5 w-3.5" /> Neste
            </button>
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              disabled={stepIdx >= steps.length - 1}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md border border-border bg-card hover:border-brand/40 text-xs font-medium px-2 py-1.5 disabled:opacity-50"
            >
              {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              {playing ? "Pause" : "Spill"}
            </button>
            <button
              type="button"
              onClick={() => { setStepIdx(0); setPlaying(false); }}
              className="inline-flex items-center justify-center rounded-md border border-border bg-card hover:border-brand/40 text-xs font-medium px-2 py-1.5"
              aria-label="Start om"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className={`rounded-md border p-2 text-[11px] leading-relaxed ${isLoop ? "border-red-500/40 bg-red-500/5" : "border-emerald-500/40 bg-emerald-500/5"}`}>
            <div className="font-semibold mb-1">
              {isLoop ? "Routing loop oppdaget" : "Konvergert"}
            </div>
            {isLoop ? (
              <span className="text-muted-foreground">
                y og z blir enige om en falsk billig rute via hverandre. Pakker for x sirkulerer
                som i et svart hull til Dy passerer den ekte direktekostnaden {cxyNew}.
              </span>
            ) : (
              <span className="text-muted-foreground">
                {poisonedReverse
                  ? "Z løy om Dz = ∞ til y, så y måtte velge direktelenken med en gang."
                  : "Ingen loop — verdiene konvergerer raskt."}
              </span>
            )}
          </div>

          <div className="rounded-md border border-border bg-muted/30 p-2 text-[10px] font-mono leading-relaxed max-h-32 overflow-auto">
            {steps.slice(0, stepIdx + 1).map((s) => (
              <div key={s.t} className={s.t === stepIdx ? "text-brand" : "text-muted-foreground"}>
                t={s.t}: Dy={s.Dy >= INFINITY_THRESHOLD ? "∞" : s.Dy}, Dz={s.Dz >= INFINITY_THRESHOLD ? "∞" : s.Dz}
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
