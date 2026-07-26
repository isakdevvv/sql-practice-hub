import { useEffect, useRef, useState } from "react";
import { Tex } from "@/components/Tex";
import { Pause, Play, RotateCcw } from "lucide-react";

/**
 * Galton-brettet (quincunx) — den fysiske modellen bak sentralgrenseteoremet.
 *
 * Hvorfor akkurat denne: klokkekurven presenteres nesten alltid som en formel
 * man skal godta. Her ser man den bli til. Hver kule møter n pinner, og velger
 * høyre eller venstre med sannsynlighet p i hver. Bøtta kula lander i ER
 * antall høyre-valg — altså en sum av n uavhengige like trekk. At haugen blir
 * klokkeformet er ikke en påstand man må tro på; det er noe man ser skje.
 *
 * Sammenhengen med resten av modulen: dette er nøyaktig samme mekanisme som
 * gjør at gjennomsnitt blir normalfordelte. Et gjennomsnitt er også en sum av
 * mange uavhengige bidrag, bare delt på n.
 */

interface Kule {
  /** Hvilken rad kula er på vei gjennom. */
  rad: number;
  /** Antall høyre-valg så langt = horisontal posisjon i pinne-gitteret. */
  hoyre: number;
  /** 0–1, hvor langt ned mot neste rad kula har kommet. */
  t: number;
}

const W = 520;
const RAD_H = 22;
const TOPP = 16;

function binomPmf(n: number, k: number, p: number): number {
  // log-gamma for å unngå overflow ved store n
  const lg = (x: number) => {
    const c = [76.18009173, -86.50532033, 24.01409822, -1.231739516, 0.00120858003, -0.00000536382];
    let y = x,
      tmp = x + 5.5;
    tmp -= (x + 0.5) * Math.log(tmp);
    let ser = 1.000000000190015;
    for (let j = 0; j < 6; j++) ser += c[j] / ++y;
    return -tmp + Math.log((Math.sqrt(2 * Math.PI) * ser) / x);
  };
  const logC = lg(n + 1) - lg(k + 1) - lg(n - k + 1);
  return Math.exp(logC + k * Math.log(p) + (n - k) * Math.log(1 - p));
}

export function GaltonBrett() {
  const [rader, setRader] = useState(12);
  const [p, setP] = useState(0.5);
  const [gaar, setGaar] = useState(false);
  const [bins, setBins] = useState<number[]>(() => new Array(13).fill(0));
  const [kuler, setKuler] = useState<Kule[]>([]);
  const [totalt, setTotalt] = useState(0);

  const ref = useRef({ bins, kuler, totalt, rader, p, gaar });
  ref.current = { bins, kuler, totalt, rader, p, gaar };

  // Nullstill når brettet endrer form.
  useEffect(() => {
    setBins(new Array(rader + 1).fill(0));
    setKuler([]);
    setTotalt(0);
  }, [rader]);

  // Animasjonsløkke: slipper nye kuler jevnt og flytter dem nedover.
  useEffect(() => {
    if (!gaar) return;
    let raf = 0;
    let sisteSlipp = 0;

    const steg = (tid: number) => {
      const s = ref.current;
      let nye = s.kuler.map((k) => ({ ...k, t: k.t + 0.14 }));

      // Kuler som har nådd neste rad tar et valg; de som er ferdige havner i bøtte.
      const ferdige: number[] = [];
      nye = nye.filter((k) => {
        if (k.t < 1) return true;
        k.t = 0;
        if (Math.random() < s.p) k.hoyre += 1;
        k.rad += 1;
        if (k.rad >= s.rader) {
          ferdige.push(k.hoyre);
          return false;
        }
        return true;
      });

      if (tid - sisteSlipp > 90 && nye.length < 40) {
        nye.push({ rad: 0, hoyre: 0, t: 0 });
        sisteSlipp = tid;
      }

      setKuler(nye);
      if (ferdige.length > 0) {
        setBins((b) => {
          const nb = [...b];
          for (const h of ferdige) nb[h] = (nb[h] ?? 0) + 1;
          return nb;
        });
        setTotalt((t) => t + ferdige.length);
      }
      raf = requestAnimationFrame(steg);
    };

    raf = requestAnimationFrame(steg);
    return () => cancelAnimationFrame(raf);
  }, [gaar]);

  const maks = Math.max(1, ...bins);
  const binBredde = W / (rader + 1);
  const pinneTopp = TOPP;
  const bunn = pinneTopp + rader * RAD_H + 10;
  const binH = 90;

  // Forventet form: n·p og spredning √(n·p(1−p))
  const mu = rader * p;
  const sigma = Math.sqrt(rader * p * (1 - p));

  return (
    <div className="rounded-xl border border-border bg-card p-4 md:p-5 space-y-4">
      <div>
        <h3 className="font-semibold">Galton-brettet — se klokkekurven bli til</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Hver kule møter {rader} pinner og velger høyre eller venstre i hver. Bøtta den lander i er
          rett og slett <em>antall høyre-valg</em> — en sum av {rader} uavhengige like trekk. Haugen
          som bygger seg er ikke tegnet på forhånd; den er summen som former seg selv.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div className="min-w-[150px] flex-1">
          <div className="mb-1 flex items-baseline justify-between text-[11px]">
            <span className="font-semibold uppercase tracking-wider text-muted-foreground">
              Rader med pinner (n)
            </span>
            <span className="font-mono font-bold">{rader}</span>
          </div>
          <input
            type="range"
            min={4}
            max={20}
            value={rader}
            onChange={(e) => setRader(Number(e.target.value))}
            className="w-full accent-brand"
            aria-label="Antall rader"
          />
        </div>
        <div className="min-w-[150px] flex-1">
          <div className="mb-1 flex items-baseline justify-between text-[11px]">
            <span className="font-semibold uppercase tracking-wider text-muted-foreground">
              Sannsynlighet for høyre (p)
            </span>
            <span className="font-mono font-bold">{p.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min={0.1}
            max={0.9}
            step={0.05}
            value={p}
            onChange={(e) => setP(Number(e.target.value))}
            className="w-full accent-brand"
            aria-label="Sannsynlighet for høyre"
          />
        </div>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => setGaar((g) => !g)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-brand-foreground hover:opacity-90"
          >
            {gaar ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {gaar ? "Pause" : "Slipp kuler"}
          </button>
          <button
            type="button"
            onClick={() => {
              setGaar(false);
              setBins(new Array(rader + 1).fill(0));
              setKuler([]);
              setTotalt(0);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm hover:bg-muted"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${bunn + binH + 18}`} className="w-full min-w-[420px]">
          {/* Pinnene */}
          {Array.from({ length: rader }).map((_, r) =>
            Array.from({ length: r + 1 }).map((__, i) => (
              <circle
                key={`${r}-${i}`}
                cx={(W / 2 + (i - r / 2) * binBredde).toFixed(2)}
                cy={pinneTopp + r * RAD_H}
                r={2}
                className="fill-muted-foreground"
                opacity={0.45}
              />
            )),
          )}

          {/* Kuler under fall */}
          {kuler.map((k, idx) => {
            const r = k.rad;
            const x = W / 2 + (k.hoyre - r / 2) * binBredde + (k.t - 0.5) * 0;
            const y = pinneTopp + (r + k.t) * RAD_H;
            return (
              <circle key={idx} cx={x.toFixed(2)} cy={y.toFixed(2)} r={3} className="fill-brand" />
            );
          })}

          {/* Bøttene */}
          {bins.map((c, i) => {
            const h = (c / maks) * binH;
            const x = W / 2 + (i - rader / 2) * binBredde - binBredde / 2 + 1;
            return (
              <rect
                key={i}
                x={x.toFixed(2)}
                y={(bunn + binH - h).toFixed(2)}
                width={Math.max(2, binBredde - 2).toFixed(2)}
                height={h.toFixed(2)}
                className="fill-brand"
                opacity={0.7}
              />
            );
          })}

          {/* Teoretisk binomialfordeling som fasit oppå haugen */}
          {totalt > 20 && (
            <polyline
              points={bins
                .map((_, i) => {
                  const teoretisk = binomPmf(rader, i, p);
                  const maksTeori = Math.max(...bins.map((__, j) => binomPmf(rader, j, p)));
                  const h = (teoretisk / maksTeori) * binH * (maks / maks);
                  const x = W / 2 + (i - rader / 2) * binBredde;
                  return `${x.toFixed(1)},${(bunn + binH - h).toFixed(1)}`;
                })
                .join(" ")}
              fill="none"
              strokeWidth={2}
              strokeDasharray="4 3"
              className="stroke-foreground"
              opacity={0.55}
            />
          )}

          <line
            x1={0}
            y1={bunn + binH}
            x2={W}
            y2={bunn + binH}
            className="stroke-border"
            strokeWidth={1}
          />
        </svg>
      </div>

      <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs">
        <span>
          Kuler sluppet: <span className="font-mono font-bold">{totalt}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-5 border-t-2 border-dashed border-foreground opacity-60" />
          teoretisk binomialfordeling
        </span>
        <span className="text-muted-foreground">
          Forventet bøtte <Tex>{"np"}</Tex> = {mu.toFixed(1)}, spredning{" "}
          <Tex>{"\\sqrt{np(1-p)}"}</Tex> = {sigma.toFixed(2)}
        </span>
      </div>

      <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Hvorfor dette er sentralgrenseteoremet
        </div>
        <p className="mt-1">
          Én kule er tilfeldig og uforutsigbar. Summen av mange like, uavhengige valg er det ikke —
          den samler seg om <Tex>{"np"}</Tex> med en forutsigbar bredde. Det er nøyaktig samme
          mekanisme som gjør gjennomsnitt normalfordelte: et gjennomsnitt er også en sum av mange
          uavhengige bidrag, bare delt på <Tex>{"n"}</Tex>.
        </p>
        <p className="mt-2 text-muted-foreground">
          Prøv å dra <Tex>{"p"}</Tex> vekk fra 0,5. Haugen forskyver seg og blir skjev — men med nok
          rader kryper den mot klokkeformen likevel. Det er robustheten i CLT: den krever ikke at
          det underliggende trekket er symmetrisk.
        </p>
      </div>
    </div>
  );
}
