import { useMemo, useState } from "react";

/**
 * AIMD mot CUBIC — hvorfor CUBIC henter ut mer av lenken.
 *
 * Begge algoritmene leter etter det samme: den høyeste raten lenken tåler.
 * Forskjellen ligger utelukkende i FORMEN på oppramingen etter et tap. AIMD
 * kryper lineært tilbake (+1 per RTT). CUBIC bruker at taket sannsynligvis
 * ikke har flyttet seg mye siden sist, spurter opp mot forrige tapspunkt, og
 * bremser når den nærmer seg det.
 *
 * Arealet under kurven er gjennomstrømmingen. Det er derfor formen betyr noe.
 */

const RTTS = 90;
const W = 700;
const H = 260;
const PAD_L = 44;
const PAD_B = 30;
const PAD_T = 16;

/** CUBIC-konstanter fra RFC 8312. */
const C = 0.4;
const BETA = 0.7;

function simuler(kapasitet: number) {
  const aimd: number[] = [];
  const cubic: number[] = [];

  // --- AIMD: +1 per RTT, halver ved tap ---
  let w = kapasitet / 2;
  for (let t = 0; t < RTTS; t++) {
    aimd.push(w);
    w += 1;
    if (w > kapasitet) w = w / 2;
  }

  // --- CUBIC: w(t) = C(t-K)^3 + Wmax, K = cbrt(Wmax(1-beta)/C) ---
  let wmax = kapasitet;
  let siden = 0; // RTT-er siden forrige tap
  let cur = kapasitet * BETA;
  for (let t = 0; t < RTTS; t++) {
    cubic.push(cur);
    siden += 1;
    const K = Math.cbrt((wmax * (1 - BETA)) / C);
    cur = C * Math.pow(siden - K, 3) + wmax;
    if (cur > kapasitet) {
      wmax = kapasitet;
      cur = kapasitet * BETA;
      siden = 0;
    }
  }
  return { aimd, cubic };
}

export function CubicAimdViz() {
  const [kapasitet, setKapasitet] = useState(40);
  const [visAimd, setVisAimd] = useState(true);
  const [visCubic, setVisCubic] = useState(true);

  const { aimd, cubic } = useMemo(() => simuler(kapasitet), [kapasitet]);

  const yMax = kapasitet * 1.15;
  const x = (i: number) => PAD_L + (i / (RTTS - 1)) * (W - PAD_L - 12);
  const y = (v: number) => H - PAD_B - (v / yMax) * (H - PAD_B - PAD_T);

  const bane = (serie: number[]) => serie.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");

  const snitt = (s: number[]) => s.reduce((a, b) => a + b, 0) / s.length;
  const snittAimd = snitt(aimd);
  const snittCubic = snitt(cubic);
  const gevinst = ((snittCubic / snittAimd - 1) * 100).toFixed(0);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-muted/20 px-4 py-2">
        <span className="text-sm font-semibold">Oppramping etter tap: AIMD mot CUBIC</span>
        <div className="ml-auto flex gap-2 text-xs">
          <Bryter på={visAimd} sett={setVisAimd} farge="text-brand" tekst="AIMD" />
          <Bryter på={visCubic} sett={setVisCubic} farge="text-purple-600 dark:text-purple-400" tekst="CUBIC" />
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        {/* Kapasitetslinje — der tap inntreffer */}
        <line
          x1={PAD_L}
          y1={y(kapasitet)}
          x2={W - 12}
          y2={y(kapasitet)}
          className="stroke-destructive/60"
          strokeWidth={1.5}
          strokeDasharray="5 4"
        />
        <text x={W - 14} y={y(kapasitet) - 5} textAnchor="end" className="fill-destructive text-[10px] font-semibold">
          kapasitet — tap her
        </text>

        {/* Akser */}
        <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={H - PAD_B} className="stroke-muted-foreground/40" />
        <line x1={PAD_L} y1={H - PAD_B} x2={W - 12} y2={H - PAD_B} className="stroke-muted-foreground/40" />
        <text x={8} y={PAD_T + 10} className="fill-muted-foreground text-[10px]">
          cwnd
        </text>
        <text x={W - 12} y={H - 8} textAnchor="end" className="fill-muted-foreground text-[10px]">
          tid (RTT-er) →
        </text>

        {/* Snittlinjer */}
        {visAimd && (
          <line x1={PAD_L} y1={y(snittAimd)} x2={W - 12} y2={y(snittAimd)} className="stroke-brand/30" strokeWidth={1} />
        )}
        {visCubic && (
          <line
            x1={PAD_L}
            y1={y(snittCubic)}
            x2={W - 12}
            y2={y(snittCubic)}
            className="stroke-purple-500/30"
            strokeWidth={1}
          />
        )}

        {/* Kurvene */}
        {visAimd && <path d={bane(aimd)} fill="none" className="stroke-brand" strokeWidth={2} />}
        {visCubic && (
          <path d={bane(cubic)} fill="none" className="stroke-purple-500" strokeWidth={2} strokeDasharray="6 3" />
        )}
      </svg>

      <div className="grid gap-2 border-t border-border bg-muted/10 px-4 py-3 text-xs sm:grid-cols-3">
        <div className="rounded-lg border border-brand/40 bg-brand/5 px-3 py-2">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Snitt-cwnd, AIMD</div>
          <div className="font-mono text-sm font-semibold text-foreground">{snittAimd.toFixed(1)}</div>
        </div>
        <div className="rounded-lg border border-purple-500/40 bg-purple-500/5 px-3 py-2">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Snitt-cwnd, CUBIC</div>
          <div className="font-mono text-sm font-semibold text-foreground">{snittCubic.toFixed(1)}</div>
        </div>
        <div className="rounded-lg border border-border bg-background px-3 py-2">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">CUBIC henter ut</div>
          <div className="font-mono text-sm font-semibold text-foreground">+{gevinst} %</div>
        </div>
      </div>

      <div className="border-t border-border px-4 py-3">
        <label className="block text-xs">
          <span className="flex justify-between text-muted-foreground">
            Lenkekapasitet (segmenter i vinduet før tap)
            <span className="font-mono font-semibold text-foreground">{kapasitet}</span>
          </span>
          <input
            type="range"
            min={12}
            max={90}
            value={kapasitet}
            onChange={(e) => setKapasitet(Number(e.target.value))}
            className="mt-1 w-full accent-brand"
          />
        </label>
      </div>

      <p className="border-t border-border px-4 py-2 text-xs leading-relaxed text-muted-foreground">
        <strong className="text-foreground">Se på formen, ikke tallene:</strong> AIMD lager rette skråninger —
        den bruker like lang tid på hver eneste segment-økning, uansett hvor langt unna taket den er. CUBIC
        er flat i midten: den spurter opp mot forrige tapspunkt og{" "}
        <em>blir liggende der og kjenne etter</em> før den forsiktig prøver seg høyere. Det er tiden nær taket
        som gir gjennomstrømming, ikke selve toppunktet — de to treffer jo samme tak.
      </p>
      <p className="border-t border-border px-4 py-2 text-xs leading-relaxed text-muted-foreground">
        <strong className="text-foreground">Dra i kapasiteten:</strong> gevinsten holder seg rundt 20 %
        uansett hvor du setter taket. Det er ingen tilfeldighet — begge snittene skalerer med taket, så
        <em> forholdet</em> mellom dem står stille mens det <em>absolutte</em> gapet vokser. Modellen her
        kjører et fast antall RTT-er; i ekte nett med store vinduer er CUBIC-fordelen større enn dette,
        fordi AIMD da bruker tilsvarende lengre <em>tid</em> på å krype tilbake etter hvert tap.
      </p>
    </div>
  );
}

function Bryter({
  på,
  sett,
  tekst,
  farge,
}: {
  på: boolean;
  sett: (v: boolean) => void;
  tekst: string;
  farge: string;
}) {
  return (
    <button
      onClick={() => sett(!på)}
      className={`rounded border px-2 py-1 font-medium ${
        på ? `border-current ${farge}` : "border-border text-muted-foreground opacity-50"
      }`}
    >
      {tekst}
    </button>
  );
}
