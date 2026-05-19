import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  BookOpen,
  Sparkles,
  Target,
  Package,
  ShieldQuestion,
} from "lucide-react";

type Tab = "intro" | "setcover" | "tsp" | "knapsack" | "pvsnp";

export function GreedyNpVizPage() {
  const [tab, setTab] = useState<Tab>("intro");

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">
            Greedy &amp; NP — når «godt nok» er det beste vi kan
          </h1>
          <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
            Fem trinn. Start på «0. Start her» — der introduseres hvert ord og hvert symbol du møter
            senere. De fire neste er hands-on moduler.
          </p>
        </header>

        <div className="mb-4 flex flex-wrap gap-1.5 border-b border-border">
          <TabBtn
            active={tab === "intro"}
            onClick={() => setTab("intro")}
            icon={<BookOpen className="h-3.5 w-3.5" />}
          >
            0. Start her
          </TabBtn>
          <TabBtn
            active={tab === "setcover"}
            onClick={() => setTab("setcover")}
            icon={<Sparkles className="h-3.5 w-3.5" />}
          >
            1. Set cover
          </TabBtn>
          <TabBtn
            active={tab === "tsp"}
            onClick={() => setTab("tsp")}
            icon={<Target className="h-3.5 w-3.5" />}
          >
            2. TSP
          </TabBtn>
          <TabBtn
            active={tab === "knapsack"}
            onClick={() => setTab("knapsack")}
            icon={<Package className="h-3.5 w-3.5" />}
          >
            3. Knapsack
          </TabBtn>
          <TabBtn
            active={tab === "pvsnp"}
            onClick={() => setTab("pvsnp")}
            icon={<ShieldQuestion className="h-3.5 w-3.5" />}
          >
            4. P vs NP
          </TabBtn>
        </div>

        {tab === "intro" && <IntroModule onPick={setTab} />}
        {tab === "setcover" && <SetCoverModule />}
        {tab === "tsp" && <TspModule />}
        {tab === "knapsack" && <KnapsackModule />}
        {tab === "pvsnp" && <PvsNpModule />}

        <Lessons />
      </main>
    </div>
  );
}

// ============================================================
// MODUL 0 — START HER (alle ord/symboler forklart)
// ============================================================

function IntroModule({ onPick }: { onPick: (t: Tab) => void }) {
  return (
    <div className="space-y-4 text-sm">
      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-base font-semibold mb-2">Ordbok — slå opp ord du møter senere</h2>
        <dl className="space-y-3 text-[13px]">
          <Def term="Algoritme">
            En liste oppskrifter datamaskinen følger for å løse et problem. «Sorter denne lista»
            eller «finn kortest vei».
          </Def>
          <Def term="Greedy (grådig)">
            En algoritme-strategi: i hvert steg, ta valget som ser best ut
            <em> akkurat nå</em>, uten å tenke på fremtiden. Rask, men ikke alltid optimal.
          </Def>
          <Def term="Optimum / optimal løsning">
            Det beste mulige svaret. F.eks. det kortest mulige TSP-toget gjennom alle byer. Greedy
            gir ofte <em>ikke</em> optimum, men noe nær.
          </Def>
          <Def term="Brute force">
            «Prøv absolutt alle muligheter og velg det beste». Garantert optimum, men eksplosivt
            tregt når problemet vokser.
          </Def>
          <Def term="n (kursivt n)">
            Antall input-elementer. Hvis du sorterer 100 tall er <code>n = 100</code>. Vi måler hvor
            mange operasjoner algoritmen bruker som funksjon av n.
          </Def>
          <Def term="O(...) — Big-O">
            En «hastighets-merkelapp» som forteller hvor mange operasjoner i verste fall. Eksempler:
            <ul className="mt-1 list-disc pl-5">
              <li>
                <code>O(n)</code> = vokser proporsjonalt med n. 100 elementer → 100 operasjoner.
              </li>
              <li>
                <code>O(n²)</code> = vokser med n²: 100 elementer → 10 000 operasjoner.
              </li>
              <li>
                <code>O(n log n)</code> = litt mer enn lineær. God sortering.
              </li>
              <li>
                <code>O(2ⁿ)</code> = eksponentiell. 30 elementer → 1 milliard operasjoner.
              </li>
              <li>
                <code>O(n!)</code> = «n fakultet» = 1·2·3·...·n. 10! = 3.6 millioner. 20! = 2.4
                trillioner.
              </li>
            </ul>
          </Def>
          <Def term="Polynom tid">
            Algoritmer hvis kjøretid er <code>O(n^k)</code> for et fast tall k:
            <code>O(n)</code>, <code>O(n²)</code>, <code>O(n³)</code> osv. «Raskt nok» til at det
            skalerer i praksis.
          </Def>
          <Def term="P">
            Mengden problemer du kan løse i polynom tid. Sortering, søk, korteste vei (Dijkstra) er
            i P.
          </Def>
          <Def term="NP">
            Mengden problemer du kan <em>verifisere</em> en gitt løsning på i polynom tid.
            («Verifisere» betyr sjekke at svaret stemmer.) Alle P-problemer er i NP, men NP har også
            problemer vi ikke vet hvordan å løse raskt.
          </Def>
          <Def term="NP-hardt / NP-komplett">
            Problemer som er «minst like vanskelige» som de hardeste i NP. Hvis du fant en
            polynom-algoritme for ett av dem, ville alle NP-problemer bli polynome (det er det
            berømte P=NP-spørsmålet). Eksempler: set cover, TSP, subset sum, SAT. Alle disse fire er
            det vi leker med.
          </Def>
          <Def term="Approksimasjon">
            «Vi finner ikke optimum raskt, men vi finner noe garantert nær». F.eks. en
            1.5-approksimasjon for TSP betyr at svaret vi gir er høyst 1.5 ganger optimum.
          </Def>
          <Def term="H_n — harmonisk sum">
            Tallet <code>H_n = 1 + 1/2 + 1/3 + ... + 1/n</code>. For store n er{" "}
            <code>H_n ≈ ln(n)</code> (naturlig logaritme). Dukker opp som greedy-garantien for set
            cover.
          </Def>
          <Def term="ln(n) — naturlig logaritme">
            Inversen av <code>e^x</code> der <code>e ≈ 2.718</code>. <code>ln(100) ≈ 4.6</code>,
            <code>ln(1000) ≈ 6.9</code>. Vokser <em>veldig</em> sakte.
          </Def>
          <Def term="Trekant-ulikheten">
            For tre punkter A, B, C: avstanden A→C er aldri lengre enn å gå A→B→C. Holder for
            vanlige avstander (Euklid, taxi-cab).
          </Def>
        </dl>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-base font-semibold mb-2">Sånn er det bygd opp</h2>
        <ol className="list-decimal pl-5 space-y-1.5 text-muted-foreground">
          <li>
            <strong className="text-foreground">Set cover (modul 1)</strong> — enkleste greedy: «ta
            den som dekker flest udekkete». Bygger intuisjonen.
          </li>
          <li>
            <strong className="text-foreground">TSP (modul 2)</strong> — samme idé («ta nærmeste
            neste») men på et harderre problem. Sammenligning med brute force gjør NP-treghet
            konkret.
          </li>
          <li>
            <strong className="text-foreground">Knapsack (modul 3)</strong> — her bryter greedy.
            Introduserer DP (dynamisk programmering) som sammenligning.
          </li>
          <li>
            <strong className="text-foreground">P vs NP (modul 4)</strong> — samler det hele:
            greedy/DP fungerer fordi de fleste NP-problemer har approksimasjons-utveier. Subset
            sum-puslespill viser «verifiser vs finn».
          </li>
        </ol>
        <div className="mt-3 flex gap-2">
          <Button size="sm" onClick={() => onPick("setcover")}>
            Start på modul 1 →
          </Button>
        </div>
      </div>
    </div>
  );
}

function Def({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="font-semibold text-foreground">{term}</dt>
      <dd className="text-muted-foreground mt-0.5">{children}</dd>
    </div>
  );
}

function TabBtn({
  children,
  active,
  onClick,
  icon,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border-b-2 -mb-px transition-colors ${
        active
          ? "border-brand text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

// ============================================================
// MODUL 1 — SET COVER
// ============================================================

type City = { id: string; x: number; y: number };
type Station = { id: string; covers: string[]; label: string };

const SC_CITIES: City[] = [
  { id: "Oslo", x: 360, y: 380 },
  { id: "Bergen", x: 130, y: 330 },
  { id: "Trh", x: 280, y: 220 },
  { id: "Tromsø", x: 380, y: 70 },
  { id: "Stav", x: 170, y: 410 },
  { id: "Krs", x: 270, y: 460 },
  { id: "Bodø", x: 320, y: 150 },
  { id: "Ålesund", x: 200, y: 270 },
];

const SC_STATIONS: Station[] = [
  { id: "S1", label: "S1 (sør-vest)", covers: ["Bergen", "Stav", "Ålesund"] },
  { id: "S2", label: "S2 (sør-øst)", covers: ["Oslo", "Krs", "Stav"] },
  { id: "S3", label: "S3 (midt)", covers: ["Trh", "Ålesund", "Bodø"] },
  { id: "S4", label: "S4 (nord)", covers: ["Tromsø", "Bodø"] },
  { id: "S5", label: "S5 (bred)", covers: ["Oslo", "Trh", "Bergen"] },
  { id: "S6", label: "S6 (kyst)", covers: ["Stav", "Krs", "Ålesund", "Trh"] },
];

type SCStep = {
  picked: string[];
  covered: Set<string>;
  candidate: string | null;
  description: string;
};

function setCoverGreedy(): SCStep[] {
  const steps: SCStep[] = [];
  const universe = new Set(SC_CITIES.map((c) => c.id));
  const covered = new Set<string>();
  const picked: string[] = [];
  const remaining = new Set(SC_STATIONS.map((s) => s.id));

  steps.push({
    picked: [],
    covered: new Set(),
    candidate: null,
    description: `Vi må dekke ${universe.size} byer. Greedy: i hver runde, velg stasjonen som dekker FLEST udekkete byer.`,
  });

  while (covered.size < universe.size) {
    let best: string | null = null;
    let bestNew = 0;
    for (const sid of remaining) {
      const s = SC_STATIONS.find((x) => x.id === sid)!;
      const newCov = s.covers.filter((c) => !covered.has(c)).length;
      if (newCov > bestNew) {
        bestNew = newCov;
        best = sid;
      }
    }
    if (best === null || bestNew === 0) break;
    const s = SC_STATIONS.find((x) => x.id === best)!;
    steps.push({
      picked: [...picked],
      covered: new Set(covered),
      candidate: best,
      description: `Vurder kandidater. ${s.label} dekker ${bestNew} nye byer (${s.covers.filter((c) => !covered.has(c)).join(", ")}) — flest av alle. Velg den.`,
    });
    picked.push(best);
    for (const c of s.covers) covered.add(c);
    remaining.delete(best);
    steps.push({
      picked: [...picked],
      covered: new Set(covered),
      candidate: null,
      description: `Etter valg: ${covered.size}/${universe.size} byer dekket. ${universe.size - covered.size === 0 ? "Ferdig!" : `${universe.size - covered.size} igjen.`}`,
    });
  }

  return steps;
}

// Brute-force optimum: hvor få stasjoner trenger vi minst?
function setCoverOptimum(): { count: number; sets: string[] } {
  const universe = SC_CITIES.map((c) => c.id);
  const n = SC_STATIONS.length;
  let best: string[] = SC_STATIONS.map((s) => s.id);
  for (let mask = 1; mask < 1 << n; mask++) {
    const chosen: string[] = [];
    const cov = new Set<string>();
    for (let i = 0; i < n; i++) {
      if (mask & (1 << i)) {
        chosen.push(SC_STATIONS[i].id);
        for (const c of SC_STATIONS[i].covers) cov.add(c);
      }
    }
    if (cov.size === universe.length && chosen.length < best.length) {
      best = chosen;
    }
  }
  return { count: best.length, sets: best };
}

function SetCoverModule() {
  const steps = useMemo(() => setCoverGreedy(), []);
  const optimum = useMemo(() => setCoverOptimum(), []);
  const [step, setStep] = useState(0);
  const s = steps[Math.min(step, steps.length - 1)];

  return (
    <div>
      <div className="mb-3 rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
        <strong className="text-foreground">Oppgaven:</strong> Vi har 8 byer i Norge. Hver
        radio-stasjon (S1–S6) dekker en delmengde av byene. Vi vil dekke ALLE 8 byer med{" "}
        <em>færrest mulige</em> stasjoner. Dette er klassisk{" "}
        <strong className="text-foreground">set cover</strong> — å dekke en «universemengde» med
        færrest «sett».
        <div className="mt-2">
          <strong className="text-foreground">Greedy-regelen vi bruker:</strong> i hver runde, velg
          stasjonen som dekker flest <em>udekkete</em> byer akkurat nå.
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="bg-muted/30 px-4 py-2 text-xs text-muted-foreground border-b border-border">
          {s.description}
        </div>
        <SetCoverMap step={s} />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <StationList step={s} />
        <div className="rounded-xl border border-border bg-card p-3 text-xs">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
            Greedy vs Optimum
          </div>
          <div className="space-y-1.5">
            <Row label="Stasjoner valgt nå" value={`${s.picked.length}`} />
            <Row
              label="Greedy ferdig på"
              value={`${steps[steps.length - 1].picked.length} stasjoner`}
            />
            <Row
              label="Optimum (brute force, 2⁶ = 64 forsøk)"
              value={`${optimum.count} stasjoner (${optimum.sets.join(", ")})`}
            />
            <div className="text-[11px] text-muted-foreground pt-2 space-y-1">
              <div>
                <strong className="text-foreground">Hva er garantien?</strong> For set cover bevises
                det at greedy alltid bruker høyst{" "}
                <code>
                  H<sub>n</sub>
                </code>{" "}
                ganger så mange sett som optimum, der <code>n</code> er antall byer (her 8) og{" "}
                <code>
                  H<sub>n</sub> = 1 + 1/2 + 1/3 + ... + 1/n
                </code>
                .
              </div>
              <div>
                For <code>n = 8</code>:{" "}
                <code>
                  H<sub>8</sub> ≈ 2.72
                </code>
                . For store n vokser{" "}
                <code>
                  H<sub>n</sub>
                </code>{" "}
                som <code>ln(n)</code> (naturlig logaritme). Det er ingen kjent hurtigere algoritme
                — set cover er <em>NP-hardt</em> (se «0. Start her» for definisjon).
              </div>
            </div>
          </div>
        </div>
      </div>

      <Controls step={step} setStep={setStep} max={steps.length - 1} />
    </div>
  );
}

function SetCoverMap({ step }: { step: SCStep }) {
  const W = 500;
  const H = 510;
  const pos = new Map(SC_CITIES.map((c) => [c.id, c]));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      <rect x={0} y={0} width={W} height={H} className="fill-muted/10" />
      {/* Dekningsringer for valgte stasjoner */}
      {step.picked.map((sid) => {
        const s = SC_STATIONS.find((x) => x.id === sid)!;
        const cities = s.covers.map((c) => pos.get(c)!).filter(Boolean);
        if (cities.length === 0) return null;
        const cx = cities.reduce((a, c) => a + c.x, 0) / cities.length;
        const cy = cities.reduce((a, c) => a + c.y, 0) / cities.length;
        const r = Math.max(...cities.map((c) => Math.hypot(c.x - cx, c.y - cy))) + 18;
        return (
          <g key={sid}>
            <circle
              cx={cx}
              cy={cy}
              r={r}
              className="fill-brand/10 stroke-brand/40"
              strokeWidth={1.5}
              strokeDasharray="3 3"
            />
            <text
              x={cx}
              y={cy - r - 4}
              textAnchor="middle"
              className="fill-brand text-[10px] font-mono"
            >
              {s.label}
            </text>
          </g>
        );
      })}
      {/* Kandidat-ring */}
      {step.candidate &&
        (() => {
          const s = SC_STATIONS.find((x) => x.id === step.candidate)!;
          const cities = s.covers.map((c) => pos.get(c)!).filter(Boolean);
          const cx = cities.reduce((a, c) => a + c.x, 0) / cities.length;
          const cy = cities.reduce((a, c) => a + c.y, 0) / cities.length;
          const r = Math.max(...cities.map((c) => Math.hypot(c.x - cx, c.y - cy))) + 18;
          return (
            <circle
              cx={cx}
              cy={cy}
              r={r}
              className="fill-amber-500/10 stroke-amber-500"
              strokeWidth={2}
              strokeDasharray="5 3"
            />
          );
        })()}
      {/* Byer */}
      {SC_CITIES.map((c) => {
        const covered = step.covered.has(c.id);
        return (
          <g key={c.id}>
            <circle
              cx={c.x}
              cy={c.y}
              r={9}
              className={covered ? "fill-brand stroke-brand" : "fill-card stroke-foreground/50"}
              strokeWidth={2}
            />
            <text
              x={c.x}
              y={c.y + 22}
              textAnchor="middle"
              className="fill-foreground text-[10px] font-medium"
            >
              {c.id}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function StationList({ step }: { step: SCStep }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3 text-xs">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
        Stasjoner
      </div>
      <div className="space-y-1.5">
        {SC_STATIONS.map((s) => {
          const isPicked = step.picked.includes(s.id);
          const isCand = step.candidate === s.id;
          const newCov = s.covers.filter((c) => !step.covered.has(c)).length;
          return (
            <div
              key={s.id}
              className={`rounded border px-2 py-1.5 ${
                isPicked
                  ? "border-brand/40 bg-brand/5"
                  : isCand
                    ? "border-amber-500/40 bg-amber-500/5"
                    : "border-border bg-background"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-semibold">{s.label}</span>
                <span className="text-muted-foreground tabular-nums">
                  {isPicked ? "valgt" : `+${newCov} nye`}
                </span>
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{s.covers.join(", ")}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono font-semibold">{value}</span>
    </div>
  );
}

// ============================================================
// MODUL 2 — TSP (Nærmeste-nabo vs optimum)
// ============================================================

type Point = { id: number; x: number; y: number };

const TSP_DEFAULT: Point[] = [
  { id: 0, x: 80, y: 80 },
  { id: 1, x: 320, y: 50 },
  { id: 2, x: 500, y: 100 },
  { id: 3, x: 510, y: 280 },
  { id: 4, x: 320, y: 340 },
  { id: 5, x: 100, y: 320 },
  { id: 6, x: 260, y: 180 },
];

function dist(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function tourLength(points: Point[], order: number[]): number {
  let total = 0;
  for (let i = 0; i < order.length; i++) {
    total += dist(points[order[i]], points[order[(i + 1) % order.length]]);
  }
  return total;
}

function nearestNeighbor(points: Point[]): number[] {
  const visited = new Set<number>();
  const order: number[] = [0];
  visited.add(0);
  while (order.length < points.length) {
    const cur = points[order[order.length - 1]];
    let best = -1;
    let bestD = Infinity;
    for (let i = 0; i < points.length; i++) {
      if (visited.has(i)) continue;
      const d = dist(cur, points[i]);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    order.push(best);
    visited.add(best);
  }
  return order;
}

function bruteForceTsp(points: Point[]): { order: number[]; length: number } {
  let best: number[] = [];
  let bestLen = Infinity;
  const rest = points.slice(1).map((_, i) => i + 1);
  function permute(arr: number[], k: number) {
    if (k === arr.length) {
      const order = [0, ...arr];
      const len = tourLength(points, order);
      if (len < bestLen) {
        bestLen = len;
        best = order;
      }
      return;
    }
    for (let i = k; i < arr.length; i++) {
      [arr[k], arr[i]] = [arr[i], arr[k]];
      permute(arr, k + 1);
      [arr[k], arr[i]] = [arr[i], arr[k]];
    }
  }
  permute(rest, 0);
  return { order: best, length: bestLen };
}

function TspModule() {
  const [points, setPoints] = useState<Point[]>(TSP_DEFAULT);
  const [showOptimum, setShowOptimum] = useState(false);

  const greedy = useMemo(() => nearestNeighbor(points), [points]);
  const greedyLen = useMemo(() => tourLength(points, greedy), [points, greedy]);
  const opt = useMemo(() => bruteForceTsp(points), [points]);
  const ratio = greedyLen / opt.length;

  function addPoint(e: React.MouseEvent<SVGSVGElement>) {
    if (points.length >= 9) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 600;
    const y = ((e.clientY - rect.top) / rect.height) * 400;
    setPoints([...points, { id: points.length, x, y }]);
  }

  return (
    <div>
      <div className="mb-3 rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
        <strong className="text-foreground">Oppgaven:</strong>{" "}
        <strong className="text-foreground">TSP = Travelling Salesperson Problem</strong>: en selger
        må besøke alle byene én gang og returnere til start. Hva er det <em>korteste</em> mulige
        toget?
        <div className="mt-2">
          <strong className="text-foreground">To strategier her:</strong>
          <ul className="list-disc pl-5 mt-1 space-y-0.5">
            <li>
              <strong className="text-foreground">Nærmeste-nabo (greedy, blå):</strong> start på by
              0, ta alltid nærmeste ubesøkte by. Rask: <code>O(n²)</code> — for hver av n byer
              sjekker vi avstand til alle andre.
            </li>
            <li>
              <strong className="text-foreground">Brute force (grønn):</strong> prøv ALLE mulige
              byrekkefølger og velg den korteste. Det er <code>(n−1)!</code> rekkefølger (vi
              fikserer startbyen). For n = 7 er det 720, for n = 9 er det 40 320, for n = 12 er det
              ~40 millioner. Derfor begrenser vi til 9 byer her.
            </li>
          </ul>
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="bg-muted/30 px-4 py-2 text-xs text-muted-foreground border-b border-border flex justify-between items-center">
          <span>Klikk i kartet for å legge til en by. By 0 (gul) er alltid startbyen.</span>
          <span className="font-mono">{points.length} byer</span>
        </div>
        <svg viewBox="0 0 600 400" className="w-full h-auto cursor-crosshair" onClick={addPoint}>
          <rect x={0} y={0} width={600} height={400} className="fill-muted/10" />
          <TspTour points={points} order={greedy} color="brand" closed />
          {showOptimum && (
            <TspTour points={points} order={opt.order} color="success" closed dashed />
          )}
          {points.map((p, i) => (
            <g key={p.id}>
              <circle
                cx={p.x}
                cy={p.y}
                r={10}
                className={
                  i === 0 ? "fill-amber-500 stroke-amber-600" : "fill-card stroke-foreground/60"
                }
                strokeWidth={2}
              />
              <text
                x={p.x}
                y={p.y + 4}
                textAnchor="middle"
                className="fill-foreground text-[10px] font-mono font-semibold"
              >
                {p.id}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-brand/40 bg-brand/5 p-3 text-xs">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
            Nærmeste-nabo
          </div>
          <div className="font-mono text-lg">{greedyLen.toFixed(0)}</div>
          <div className="text-[10px] text-muted-foreground mt-1">
            O(n²) — alltid grådig nærmeste.
          </div>
        </div>
        <div className="rounded-xl border border-success/40 bg-success/5 p-3 text-xs">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
            Optimum (brute force)
          </div>
          <div className="font-mono text-lg">{opt.length.toFixed(0)}</div>
          <div className="text-[10px] text-muted-foreground mt-1">O(n!) — alle permutasjoner.</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 text-xs">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
            Greedy / optimum
          </div>
          <div className="font-mono text-lg">{(ratio * 100).toFixed(1)}%</div>
          <div className="text-[10px] text-muted-foreground mt-1">
            {ratio < 1.05
              ? "Greedy traff perfekt."
              : ratio < 1.25
                ? "Greedy er nær."
                : "Greedy bommer mye."}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={showOptimum ? "default" : "outline"}
          onClick={() => setShowOptimum((v) => !v)}
        >
          {showOptimum ? "Skjul optimum" : "Vis optimum"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setPoints(TSP_DEFAULT)}
          className="gap-1.5"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Tilbakestill
        </Button>
        <Button size="sm" variant="outline" onClick={() => setPoints([])}>
          Tøm
        </Button>
        <span className="text-xs text-muted-foreground self-center ml-auto">
          Klikk i kartet for å legge til by (maks 9 — brute force blir tregt over det).
        </span>
      </div>
    </div>
  );
}

function TspTour({
  points,
  order,
  color,
  closed,
  dashed,
}: {
  points: Point[];
  order: number[];
  color: "brand" | "success";
  closed?: boolean;
  dashed?: boolean;
}) {
  if (order.length < 2) return null;
  const segs: { x1: number; y1: number; x2: number; y2: number }[] = [];
  for (let i = 0; i < order.length - 1; i++) {
    segs.push({
      x1: points[order[i]].x,
      y1: points[order[i]].y,
      x2: points[order[i + 1]].x,
      y2: points[order[i + 1]].y,
    });
  }
  if (closed && order.length > 1) {
    segs.push({
      x1: points[order[order.length - 1]].x,
      y1: points[order[order.length - 1]].y,
      x2: points[order[0]].x,
      y2: points[order[0]].y,
    });
  }
  const cls = color === "brand" ? "stroke-brand" : "stroke-success";
  return (
    <g>
      {segs.map((s, i) => (
        <line
          key={i}
          x1={s.x1}
          y1={s.y1}
          x2={s.x2}
          y2={s.y2}
          className={cls}
          strokeWidth={dashed ? 1.5 : 2.5}
          strokeDasharray={dashed ? "5 4" : undefined}
        />
      ))}
    </g>
  );
}

// ============================================================
// MODUL 3 — KNAPSACK (greedy vs DP)
// ============================================================

type Item = { id: string; weight: number; value: number };

const DEFAULT_ITEMS: Item[] = [
  { id: "Gull-blokk", weight: 7, value: 14 },
  { id: "Sølv-stang", weight: 3, value: 7 },
  { id: "Kobber-spole", weight: 4, value: 9 },
  { id: "Diamant", weight: 1, value: 4 },
  { id: "Smaragd", weight: 2, value: 5 },
  { id: "Ametyst", weight: 5, value: 10 },
];

function knapsackGreedy(
  items: Item[],
  cap: number,
): { picked: string[]; value: number; weight: number } {
  const sorted = [...items].sort((a, b) => b.value / b.weight - a.value / a.weight);
  const picked: string[] = [];
  let weight = 0;
  let value = 0;
  for (const it of sorted) {
    if (weight + it.weight <= cap) {
      picked.push(it.id);
      weight += it.weight;
      value += it.value;
    }
  }
  return { picked, value, weight };
}

function knapsackDp(
  items: Item[],
  cap: number,
): { picked: string[]; value: number; weight: number } {
  const n = items.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(cap + 1).fill(0));
  for (let i = 1; i <= n; i++) {
    const w = items[i - 1].weight;
    const v = items[i - 1].value;
    for (let c = 0; c <= cap; c++) {
      dp[i][c] = dp[i - 1][c];
      if (w <= c) dp[i][c] = Math.max(dp[i][c], dp[i - 1][c - w] + v);
    }
  }
  const picked: string[] = [];
  let c = cap;
  let weight = 0;
  for (let i = n; i >= 1; i--) {
    if (dp[i][c] !== dp[i - 1][c]) {
      picked.push(items[i - 1].id);
      weight += items[i - 1].weight;
      c -= items[i - 1].weight;
    }
  }
  return { picked, value: dp[n][cap], weight };
}

function KnapsackModule() {
  const [cap, setCap] = useState(10);
  const items = DEFAULT_ITEMS;
  const greedy = useMemo(() => knapsackGreedy(items, cap), [items, cap]);
  const dp = useMemo(() => knapsackDp(items, cap), [items, cap]);
  const gap = dp.value - greedy.value;

  return (
    <div>
      <div className="mb-3 rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
        <strong className="text-foreground">Oppgaven:</strong>{" "}
        <strong className="text-foreground">Knapsack (ryggsekk):</strong> du er en tyv med en sekk
        som tåler en viss vekt. Hver gjenstand har en vekt og en verdi. Hvilke skal du ta for å
        maksimere verdi uten å sprenge vekt-grensa?
        <div className="mt-2">
          <strong className="text-foreground">To strategier:</strong>
          <ul className="list-disc pl-5 mt-1 space-y-0.5">
            <li>
              <strong className="text-foreground">Greedy (verdi/vekt-ratio):</strong> regn ut
              verdi-per-kg for hver gjenstand. Ta den med høyest ratio først, så nest høyeste, så
              lenge sekken har plass.
              <code>O(n log n)</code>.
            </li>
            <li>
              <strong className="text-foreground">DP (dynamisk programmering):</strong> et
              systematisk oppslagsverk. For hver (gjenstand i, kapasitet c) regner vi ut «beste
              mulige verdi». Bygger en n×C-tabell der C er max kapasitet. Garantert optimum.{" "}
              <code>O(n·C)</code>.
            </li>
          </ul>
          <div className="mt-1">
            DP er ikke i NP-klassen for dette problemet: kjøretiden er «pseudo-polynom» (avhenger av
            tall-størrelsen C). For store C blir også DP tregt — derfor vurderer vi fortsatt greedy.
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-3 mb-4">
          <label className="text-xs text-muted-foreground">Sekk-kapasitet:</label>
          <input
            type="range"
            min={3}
            max={15}
            value={cap}
            onChange={(e) => setCap(Number(e.target.value))}
            className="flex-1 max-w-xs"
          />
          <span className="font-mono text-sm tabular-nums">{cap} kg</span>
        </div>

        <table className="w-full text-xs">
          <thead className="text-[10px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left py-1 px-2">Gjenstand</th>
              <th className="text-right py-1 px-2">Vekt</th>
              <th className="text-right py-1 px-2">Verdi</th>
              <th className="text-right py-1 px-2">V/kg</th>
              <th className="text-center py-1 px-2">Greedy</th>
              <th className="text-center py-1 px-2">DP</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => {
              const inG = greedy.picked.includes(it.id);
              const inD = dp.picked.includes(it.id);
              return (
                <tr key={it.id} className="border-t border-border">
                  <td className="py-1.5 px-2 font-medium">{it.id}</td>
                  <td className="py-1.5 px-2 text-right font-mono">{it.weight}</td>
                  <td className="py-1.5 px-2 text-right font-mono">{it.value}</td>
                  <td className="py-1.5 px-2 text-right font-mono">
                    {(it.value / it.weight).toFixed(2)}
                  </td>
                  <td className="py-1.5 px-2 text-center">{inG ? "●" : "·"}</td>
                  <td className="py-1.5 px-2 text-center">{inD ? "●" : "·"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-brand/40 bg-brand/5 p-3 text-xs">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
            Greedy (verdi/vekt-ratio)
          </div>
          <div className="font-mono text-lg">{greedy.value} verdi</div>
          <div className="text-[10px] text-muted-foreground mt-1">
            Bruker {greedy.weight}/{cap} kg. Plukker høyest V/kg først.
          </div>
        </div>
        <div className="rounded-xl border border-success/40 bg-success/5 p-3 text-xs">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
            DP (alltid optimum)
          </div>
          <div className="font-mono text-lg">{dp.value} verdi</div>
          <div className="text-[10px] text-muted-foreground mt-1">
            Bruker {dp.weight}/{cap} kg. Tabell over alle delproblemer.
          </div>
        </div>
      </div>

      <div className="mt-3 text-xs text-muted-foreground rounded-lg border border-border bg-card p-3">
        {gap === 0
          ? "Greedy traff optimum denne gangen. Det skjer, men er ikke garantert."
          : `Greedy taper ${gap} verdi (${((gap / dp.value) * 100).toFixed(1)}%). Det er prisen for å være rask — greedy kjører i O(n log n), DP i O(n·C).`}
      </div>
    </div>
  );
}

// ============================================================
// MODUL 4 — P vs NP (verifiser vs løs)
// ============================================================

function generateSubsetSum(n: number, target: number): { nums: number[]; solution: number[] } {
  // Lag tall hvor en delmengde summerer til target.
  const nums: number[] = [];
  let remaining = target;
  const solIdx = new Set<number>();
  // Velg 3-5 tall i målsumen
  const k = Math.min(n, 3 + Math.floor(Math.random() * 3));
  for (let i = 0; i < k - 1; i++) {
    const v = 1 + Math.floor(Math.random() * Math.min(remaining - (k - i - 1), 30));
    nums.push(v);
    solIdx.add(nums.length - 1);
    remaining -= v;
  }
  nums.push(remaining);
  solIdx.add(nums.length - 1);
  // Fyll resten med støy
  while (nums.length < n) {
    nums.push(1 + Math.floor(Math.random() * 40));
  }
  // Stokk
  const idx = nums.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  const shuffled = idx.map((i) => nums[i]);
  const newSol = idx.map((i, newI) => (solIdx.has(i) ? newI : -1)).filter((x) => x >= 0);
  return { nums: shuffled, solution: newSol };
}

function PvsNpModule() {
  const [n, setN] = useState(10);
  const [target, setTarget] = useState(60);
  const [puzzle, setPuzzle] = useState(() => generateSubsetSum(10, 60));
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [showSol, setShowSol] = useState(false);
  const [bruteResult, setBruteResult] = useState<{ ms: number; found: boolean } | null>(null);
  const [bruteRunning, setBruteRunning] = useState(false);

  const userSum = useMemo(
    () => Array.from(selected).reduce((s, i) => s + puzzle.nums[i], 0),
    [selected, puzzle],
  );

  function regenerate(nn = n, tt = target) {
    setPuzzle(generateSubsetSum(nn, tt));
    setSelected(new Set());
    setShowSol(false);
    setBruteResult(null);
  }

  function toggle(i: number) {
    const s = new Set(selected);
    if (s.has(i)) s.delete(i);
    else s.add(i);
    setSelected(s);
  }

  function runBruteForce() {
    setBruteRunning(true);
    setBruteResult(null);
    setTimeout(() => {
      const t0 = performance.now();
      const nums = puzzle.nums;
      let found = false;
      const N = nums.length;
      if (N <= 25) {
        for (let mask = 0; mask < 1 << N; mask++) {
          let s = 0;
          for (let i = 0; i < N; i++) if (mask & (1 << i)) s += nums[i];
          if (s === target) {
            found = true;
            break;
          }
        }
      }
      const t1 = performance.now();
      setBruteResult({ ms: t1 - t0, found });
      setBruteRunning(false);
    }, 30);
  }

  return (
    <div>
      <div className="mb-3 rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
        <strong className="text-foreground">Oppgaven:</strong>{" "}
        <strong className="text-foreground">Subset Sum (delmengde-sum):</strong> gitt en liste tall,
        finn en delmengde av dem som summerer til et bestemt mål. Eksempel: tall{" "}
        <code>[3, 7, 2, 8]</code>, mål <code>10</code> → delmengden <code>[8, 2]</code>.
        <div className="mt-2">
          Subset Sum er <strong className="text-foreground">NP-komplett</strong> (se «0. Start her»
          — det betyr: ingen kjent rask algoritme, men hvis noen gir deg svaret er det raskt å
          sjekke).
        </div>
        <div className="mt-2">
          <strong className="text-foreground">Hva vi prøver å vise:</strong>
          <ul className="list-disc pl-5 mt-1 space-y-0.5">
            <li>
              <strong className="text-foreground">Verifisere = lett:</strong> hvis du velger noen
              tall, kan vi summere dem og sjekke om de treffer målet i <code>O(n)</code>.
            </li>
            <li>
              <strong className="text-foreground">Finne = vanskelig:</strong> det er <code>2ⁿ</code>{" "}
              mulige delmengder (hver av de n tallene er enten med eller ikke). Brute force prøver
              alle. Dra n-slideren under og se hvordan tiden eksploderer.
            </li>
          </ul>
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="text-sm mb-3">
          Finn en delmengde av tallene som summerer til{" "}
          <span className="font-mono text-brand font-semibold">{target}</span>. Klikk på tall for å
          velge/avvelge.
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          {puzzle.nums.map((num, i) => {
            const sel = selected.has(i);
            const inSol = showSol && puzzle.solution.includes(i);
            return (
              <button
                key={i}
                onClick={() => toggle(i)}
                className={`min-w-[44px] h-11 rounded-lg border-2 font-mono font-semibold text-sm transition-colors ${
                  sel
                    ? "border-brand bg-brand/10 text-foreground"
                    : inSol
                      ? "border-success bg-success/10 text-foreground"
                      : "border-border bg-background hover:border-foreground/30"
                }`}
              >
                {num}
              </button>
            );
          })}
        </div>

        <div className="text-sm flex items-center gap-3">
          <span>
            Sum:{" "}
            <span
              className={`font-mono font-semibold ${userSum === target ? "text-success" : userSum > target ? "text-destructive" : "text-foreground"}`}
            >
              {userSum}
            </span>{" "}
            / {target}
          </span>
          {userSum === target && <span className="text-success text-xs">✓ Verifisert på O(n)</span>}
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-3 text-xs space-y-2">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Verifisere en gitt løsning
          </div>
          <p className="text-muted-foreground">
            Hvis noen gir deg et svar (en delmengde), tar det{" "}
            <code className="font-mono">O(n)</code> å summere og sjekke om det er riktig. Det er det
            som gjør subset sum til <strong>NP</strong>: «kan verifiseres i polynom tid».
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 text-xs space-y-2">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Finne en løsning
          </div>
          <p className="text-muted-foreground">
            Å finne svaret krever (i verste fall) å sjekke alle{" "}
            <code className="font-mono">2ⁿ</code> delmengder. Det er ingen kjent polynom-algoritme.
            Det er det som gjør subset sum <strong>NP-hardt</strong>.
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={runBruteForce}
            disabled={bruteRunning || n > 25}
          >
            {bruteRunning ? "Kjører..." : "Kjør brute force"}
          </Button>
          {bruteResult && (
            <div className="font-mono text-[11px] pt-1">
              {bruteResult.found ? "✓ Fant løsning" : "✗ Ingen funnet"} på{" "}
              <span className="font-semibold">{bruteResult.ms.toFixed(1)} ms</span>
              <span className="text-muted-foreground"> ({(1 << n).toLocaleString()} subsets)</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <label className="text-xs text-muted-foreground">Antall tall:</label>
        <input
          type="range"
          min={6}
          max={22}
          value={n}
          onChange={(e) => {
            const v = Number(e.target.value);
            setN(v);
            regenerate(v, target);
          }}
          className="max-w-xs"
        />
        <span className="font-mono text-xs tabular-nums">
          n={n} → 2ⁿ = {(1 << n).toLocaleString()}
        </span>
        <Button size="sm" variant="outline" onClick={() => regenerate()}>
          Nytt puslespill
        </Button>
        <Button
          size="sm"
          variant={showSol ? "default" : "outline"}
          onClick={() => setShowSol((v) => !v)}
        >
          {showSol ? "Skjul fasit" : "Vis fasit"}
        </Button>
      </div>

      <div className="mt-3 text-xs text-muted-foreground rounded-lg border border-border bg-card p-3">
        Legg merke til: når du øker n med 1, dobles bruteforce-tiden. Verifisering vokser bare
        lineært. <em>Hvis</em> P = NP ville løsing også vært polynom — men ingen har klart å bevise
        det på 50+ år. Det er fortsatt det største åpne problemet i CS.
      </div>
    </div>
  );
}

// ============================================================
// FELLES
// ============================================================

function Controls({
  step,
  setStep,
  max,
}: {
  step: number;
  setStep: (n: number) => void;
  max: number;
}) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <Button
        size="sm"
        variant="outline"
        onClick={() => setStep(Math.max(0, step - 1))}
        disabled={step === 0}
      >
        <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Forrige
      </Button>
      <Button size="sm" onClick={() => setStep(Math.min(max, step + 1))} disabled={step >= max}>
        Neste <ChevronRight className="h-3.5 w-3.5 ml-1" />
      </Button>
      <span className="text-xs text-muted-foreground">
        Steg {step + 1} / {max + 1}
      </span>
      <Button size="sm" variant="outline" onClick={() => setStep(0)} className="gap-1.5 ml-auto">
        <RotateCcw className="h-3.5 w-3.5" /> Til start
      </Button>
    </div>
  );
}

function Lessons() {
  return (
    <section className="mt-10 space-y-3 text-sm">
      <h2 className="text-lg font-semibold">Oppsummering — hele bildet</h2>
      <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
        <li>
          <strong className="text-foreground">Greedy</strong> er strategien «alltid velg det som ser
          best ut nå». Fungerer perfekt for noen problemer (set cover gir{" "}
          <code>
            H<sub>n</sub>
          </code>
          -garanti), bryter for andre (knapsack kan tape masse).
        </li>
        <li>
          <strong className="text-foreground">NP-komplett</strong> = problemer der vi ikke kjenner
          noen polynom-algoritme, men kan verifisere svar raskt. Hvis du finner én rask løser for
          ETT av dem (set cover, TSP, subset sum, SAT, ...), har du løst dem alle samtidig. Det
          berømte «P = NP?»-spørsmålet.
        </li>
        <li>
          <strong className="text-foreground">Approksimasjon</strong> = «vi finner ikke optimum, men
          noe garantert nær»:
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>
              <strong className="text-foreground">For set cover:</strong> greedy gir høyst{" "}
              <code>
                H<sub>n</sub> ≈ ln(n)
              </code>{" "}
              ganger optimum.
            </li>
            <li>
              <strong className="text-foreground">For TSP der trekant-ulikheten gjelder</strong>{" "}
              (vanlige avstander der A→C ≤ A→B + B→C):{" "}
              <strong className="text-foreground">Christofides-algoritmen</strong> (Nicos
              Christofides, 1976) gir garantert høyst 1.5 × optimum. Bygger på minimum-spennende-tre
              + perfekt matching av odd-gradnoder.
            </li>
            <li>
              <strong className="text-foreground">For knapsack:</strong> det finnes en{" "}
              <strong className="text-foreground">FPTAS</strong> — «Fully Polynomial-Time
              Approximation Scheme». Du velger et ε (f.eks. 0.01 = 1% feil) og får et svar som er
              garantert innenfor (1−ε) × optimum, i polynom tid både i n OG 1/ε. Praktisk talt så
              nær du vil, så raskt du vil.
            </li>
          </ul>
        </li>
        <li>
          <strong className="text-foreground">Når du møter et nytt problem</strong> som ligner
          (schedulering, ressursvelging, lagvalg) — sjekk om det er kjent NP-hardt. Da slipper du å
          lete etter en perfekt algoritme som ikke finnes; finn en god approksimasjon i stedet.
        </li>
      </ul>
    </section>
  );
}
