import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { BookOpen, Atom, Play, Pause, RotateCcw } from "lucide-react";

type Tab = "intro" | "live";

export function GmmVisualizerPage() {
  const [tab, setTab] = useState<Tab>("intro");
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">GMM — Gaussian Mixture Models</h1>
          <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
            Géron kap. 8, MML kap. 11. Hvordan EM-algoritmen finner sannsynlige
            klynger uten å vite hvilken klynge hvert punkt tilhører. Bygger på
            dte2501-kmeans-visualizer og dte2501-gmm.
          </p>
        </header>
        <div className="mb-4 flex flex-wrap gap-1.5 border-b border-border">
          <TabBtn active={tab === "intro"} onClick={() => setTab("intro")} icon={<BookOpen className="h-3.5 w-3.5" />}>0. Start her</TabBtn>
          <TabBtn active={tab === "live"} onClick={() => setTab("live")} icon={<Atom className="h-3.5 w-3.5" />}>1. EM live</TabBtn>
        </div>
        {tab === "intro" && <Intro onPick={setTab} />}
        {tab === "live" && <GmmModule />}
        <Lessons />
      </main>
    </div>
  );
}

function TabBtn({ children, active, onClick, icon }: any) { return (<button onClick={onClick} className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border-b-2 -mb-px transition-colors ${active ? "border-brand text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>{icon}{children}</button>); }
function Def({ term, children }: { term: string; children: React.ReactNode }) { return (<div><dt className="font-semibold text-foreground">{term}</dt><dd className="text-muted-foreground mt-0.5">{children}</dd></div>); }

function Intro({ onPick }: { onPick: (t: Tab) => void }) {
  return (
    <div className="space-y-4 text-sm">
      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-base font-semibold mb-2">Bygger på</h2>
        <ul className="list-disc pl-5 text-muted-foreground space-y-1">
          <li><strong className="text-foreground">k-Means</strong> (<code>dte2501-kmeans-visualizer</code>): har sett hard assignment — hvert punkt tilhører nøyaktig én klynge.</li>
          <li><strong className="text-foreground">Normalfordeling</strong> (<code>tek1-kontinuerlige-fordelinger</code>): gjennomsnitt μ, varians σ². Den klokke-formede fordelingen.</li>
        </ul>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-base font-semibold mb-2">Hvorfor GMM vs k-Means?</h2>
        <p className="text-muted-foreground">
          k-Means antar at klynger er sirkulære og like store. Hvis de IKKE er det — f.eks. ene klynga er lang og smal, og en annen er bred — gir k-Means feil grupper.
        </p>
        <p className="text-muted-foreground mt-2">
          GMM antar at hvert punkt er trukket fra en av K normalfordelinger. Hver fordeling har sin egen μ (sentrum) og Σ (kovariansmatrise = form). Punkter tilhører klynger med <em>sannsynlighet</em> — ikke binært.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-base font-semibold mb-2">Ordbok</h2>
        <dl className="space-y-2.5 text-[13px]">
          <Def term="Mixture model">Antakelsen er at data er trukket fra en blanding av flere fordelinger. Hver fordeling kalles en «komponent» — har sin egen vekt (mixing coefficient) som sier hvor sannsynlig den er.</Def>
          <Def term="Mixing coefficient π_k">Sannsynligheten for at et tilfeldig punkt kom fra komponent k. π_1 + π_2 + ... + π_K = 1.</Def>
          <Def term="μ_k (mu)">Sentrum av komponent k. For 2D data: et punkt (x, y).</Def>
          <Def term="Σ_k (sigma, kovariansmatrise)">Form og orientering av komponent k. For 2D: en 2×2 matrise. Diagonal Σ = aksjuste ellipse. Full Σ = roterer ellipsen.</Def>
          <Def term="Responsibility γ(z_nk)">Sannsynligheten for at punkt n kom fra komponent k, gitt nåværende parametre. Et tall mellom 0 og 1. Summerer til 1 over k.</Def>
          <Def term="EM-algoritmen (Expectation-Maximization)">Itererer to trinn til konvergens:
            <ul className="list-disc pl-5 mt-1">
              <li><strong>E-step:</strong> regn ut responsibilities γ(z_nk) for hvert punkt og hver komponent gitt nåværende parametre.</li>
              <li><strong>M-step:</strong> oppdater π_k, μ_k, Σ_k slik at de maksimerer likelihood gitt nåværende responsibilities.</li>
            </ul>
          </Def>
          <Def term="Log-likelihood">Mål på hvor godt modellen forklarer dataene: <code>L = Σ log(Σ π_k · N(x_n | μ_k, Σ_k))</code>. EM garanterer at L øker for hver iterasjon, til konvergens i et lokalt maksimum.</Def>
        </dl>
      </div>
      <div className="flex gap-2"><Button size="sm" onClick={() => onPick("live")}>Start på modul 1 →</Button></div>
    </div>
  );
}

// 2D GMM med diagonal kovarianser (forenklet)
type Point = { x: number; y: number };
type Component = { mu: Point; sigma: { sx: number; sy: number }; pi: number };

function generateData(): Point[] {
  // 3 klynger med ulike former
  const pts: Point[] = [];
  let seed = 42;
  function rand() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed / 0x7fffffff); }
  function randn() { return Math.sqrt(-2 * Math.log(rand())) * Math.cos(2 * Math.PI * rand()); }
  const centers: { c: Point; sx: number; sy: number; n: number }[] = [
    { c: { x: 100, y: 100 }, sx: 30, sy: 30, n: 60 },
    { c: { x: 300, y: 120 }, sx: 50, sy: 15, n: 50 },
    { c: { x: 200, y: 280 }, sx: 25, sy: 60, n: 40 },
  ];
  for (const { c, sx, sy, n } of centers) {
    for (let i = 0; i < n; i++) pts.push({ x: c.x + randn() * sx, y: c.y + randn() * sy });
  }
  return pts;
}

function gaussian2d(p: Point, mu: Point, sigma: { sx: number; sy: number }): number {
  const dx = (p.x - mu.x) / sigma.sx;
  const dy = (p.y - mu.y) / sigma.sy;
  return Math.exp(-0.5 * (dx * dx + dy * dy)) / (2 * Math.PI * sigma.sx * sigma.sy);
}

function GmmModule() {
  const data = useMemo(generateData, []);
  const [components, setComponents] = useState<Component[]>(() => [
    { mu: { x: 80, y: 200 }, sigma: { sx: 40, sy: 40 }, pi: 1 / 3 },
    { mu: { x: 200, y: 50 }, sigma: { sx: 40, sy: 40 }, pi: 1 / 3 },
    { mu: { x: 350, y: 250 }, sigma: { sx: 40, sy: 40 }, pi: 1 / 3 },
  ]);
  const [iters, setIters] = useState(0);
  const [running, setRunning] = useState(false);

  // Compute responsibilities for current state (for color visualization)
  const resp = useMemo(() => {
    return data.map((p) => {
      const probs = components.map((c) => c.pi * gaussian2d(p, c.mu, c.sigma));
      const total = probs.reduce((a, b) => a + b, 0);
      return total > 0 ? probs.map((x) => x / total) : probs.map(() => 1 / components.length);
    });
  }, [data, components]);

  const logLikelihood = useMemo(() => {
    let s = 0;
    for (const p of data) {
      const v = components.reduce((acc, c) => acc + c.pi * gaussian2d(p, c.mu, c.sigma), 0);
      if (v > 0) s += Math.log(v);
    }
    return s;
  }, [data, components]);

  function emStep() {
    // E-step (already computed via resp)
    // M-step: oppdater hver komponent
    const newComps: Component[] = components.map((_, k) => {
      let Nk = 0;
      let muX = 0, muY = 0;
      for (let i = 0; i < data.length; i++) {
        Nk += resp[i][k];
        muX += resp[i][k] * data[i].x;
        muY += resp[i][k] * data[i].y;
      }
      const newMu = { x: muX / Nk, y: muY / Nk };
      let sx2 = 0, sy2 = 0;
      for (let i = 0; i < data.length; i++) {
        sx2 += resp[i][k] * (data[i].x - newMu.x) ** 2;
        sy2 += resp[i][k] * (data[i].y - newMu.y) ** 2;
      }
      return {
        mu: newMu,
        sigma: { sx: Math.sqrt(sx2 / Nk), sy: Math.sqrt(sy2 / Nk) },
        pi: Nk / data.length,
      };
    });
    setComponents(newComps);
    setIters(iters + 1);
  }

  useEffect(() => {
    if (!running) return;
    const id = setInterval(emStep, 500);
    return () => clearInterval(id);
    // eslint-disable-next-line
  }, [running, components, iters]);

  function reset() {
    setComponents([
      { mu: { x: 80, y: 200 }, sigma: { sx: 40, sy: 40 }, pi: 1 / 3 },
      { mu: { x: 200, y: 50 }, sigma: { sx: 40, sy: 40 }, pi: 1 / 3 },
      { mu: { x: 350, y: 250 }, sigma: { sx: 40, sy: 40 }, pi: 1 / 3 },
    ]);
    setIters(0);
    setRunning(false);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
        <strong className="text-foreground">3 klynger</strong> (sirkulær, lang horisontal ellipse, lang vertikal ellipse). Hver punkt er farget etter hvilken komponent som har høyest «responsibility» — fargen er en blanding hvis flere komponenter konkurrerer. Trykk «Step» én gang per EM-iterasjon, eller «Auto» for kontinuerlig kjøring.
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex gap-1.5 mb-3 items-center">
          <Button size="sm" onClick={emStep}>EM-step</Button>
          <Button size="sm" variant={running ? "default" : "outline"} onClick={() => setRunning((v) => !v)}>
            {running ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />} {running ? "Pause" : "Auto"}
          </Button>
          <Button size="sm" variant="outline" onClick={reset}><RotateCcw className="h-3 w-3" /></Button>
          <span className="text-xs text-muted-foreground ml-2">Iterasjoner: {iters}</span>
          <span className="text-xs text-muted-foreground ml-2">log L: {logLikelihood.toFixed(1)}</span>
        </div>

        <svg viewBox="0 0 450 350" className="w-full h-auto bg-muted/20 rounded">
          {/* Plot komponent-ellipser (1 stddev) */}
          {components.map((c, k) => (
            <ellipse key={`e${k}`} cx={c.mu.x} cy={c.mu.y} rx={c.sigma.sx} ry={c.sigma.sy}
              className={k === 0 ? "fill-brand/10 stroke-brand" : k === 1 ? "fill-amber-500/10 stroke-amber-500" : "fill-success/10 stroke-success"}
              strokeWidth={2} strokeDasharray="4 2" />
          ))}
          {/* Plot data-punkter, farget per dominant komponent */}
          {data.map((p, i) => {
            const r = resp[i];
            const dom = r.indexOf(Math.max(...r));
            const conf = r[dom];
            const cls = dom === 0 ? "fill-brand" : dom === 1 ? "fill-amber-500" : "fill-success";
            return <circle key={i} cx={p.x} cy={p.y} r={3} className={cls} opacity={0.3 + conf * 0.7} />;
          })}
          {/* Sentre */}
          {components.map((c, k) => (
            <g key={`c${k}`}>
              <circle cx={c.mu.x} cy={c.mu.y} r={6}
                className={k === 0 ? "fill-brand" : k === 1 ? "fill-amber-500" : "fill-success"}
                stroke="white" strokeWidth={2} />
              <text x={c.mu.x} y={c.mu.y - 12} textAnchor="middle" className="fill-foreground text-[10px] font-semibold">μ_{k + 1}</text>
            </g>
          ))}
        </svg>

        <div className="mt-3 grid gap-2 sm:grid-cols-3 text-xs">
          {components.map((c, k) => (
            <div key={k} className={`rounded border p-2 ${k === 0 ? "border-brand/40 bg-brand/5" : k === 1 ? "border-amber-500/40 bg-amber-500/5" : "border-success/40 bg-success/5"}`}>
              <div className="font-semibold">Komponent {k + 1}</div>
              <div className="font-mono text-[10px] text-muted-foreground">
                π = {c.pi.toFixed(2)}<br />
                μ = ({c.mu.x.toFixed(0)}, {c.mu.y.toFixed(0)})<br />
                σ = ({c.sigma.sx.toFixed(0)}, {c.sigma.sy.toFixed(0)})
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 text-xs text-muted-foreground">
          Etter ~10-20 EM-iterasjoner stabiliserer ellipsene seg over de 3 sanne klyngene. Legg merke til at den langstrakte horisontale klyngen får σ_x &gt;&gt; σ_y — noe k-Means aldri kunne fanget.
        </div>
      </div>
    </div>
  );
}

function Lessons() {
  return (
    <section className="mt-10 space-y-3 text-sm">
      <h2 className="text-lg font-semibold">Oppsummering</h2>
      <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
        <li><strong className="text-foreground">GMM = soft clustering</strong>. I motsetning til k-Means gir den probabilistiske tilhørighet. Bra når klynger overlapper.</li>
        <li><strong className="text-foreground">EM-garanti:</strong> log-likelihood ØKER monotont per iterasjon (eller står stille). Garanterer ikke globalt optimum — sensitive for initialisering.</li>
        <li><strong className="text-foreground">Valg av K:</strong> bruk BIC eller AIC (informasjons-kriterier som straffer kompleksitet). For mange komponenter overtilpasser; for få mister struktur.</li>
        <li><strong className="text-foreground">Anvendelser:</strong> bakgrunns-subtraksjon i video, speaker identification, anomali-deteksjon (data utenfor høy-likelihood-områder), generativ modellering (sample fra modellen for å lage syntetisk data).</li>
      </ul>
    </section>
  );
}
