import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { BookOpen, Sigma } from "lucide-react";

type Tab = "intro" | "live";

export function UniversalApproxVizPage() {
  const [tab, setTab] = useState<Tab>("intro");
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">
            Universal approximation — visual bevis
          </h1>
          <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
            Nielsen kap. 4. Hvorfor ett skjult lag med nok nevroner kan approksimere ENHVER
            kontinuerlig funksjon. Bygger på nn-intro og sigmoid-viz.
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
            active={tab === "live"}
            onClick={() => setTab("live")}
            icon={<Sigma className="h-3.5 w-3.5" />}
          >
            1. Bygg en funksjon
          </TabBtn>
        </div>
        {tab === "intro" && <Intro onPick={setTab} />}
        {tab === "live" && <ApproxModule />}
        <Lessons />
      </main>
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
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border-b-2 -mb-px transition-colors ${active ? "border-brand text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
    >
      {icon}
      {children}
    </button>
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

function Intro({ onPick }: { onPick: (t: Tab) => void }) {
  return (
    <div className="space-y-4 text-sm">
      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-base font-semibold mb-2">Bygger på</h2>
        <ul className="list-disc pl-5 text-muted-foreground space-y-1">
          <li>
            <strong className="text-foreground">Sigmoid-funksjonen</strong> (
            <code>sigmoid-viz</code>): <code>σ(z) = 1/(1+e⁻ᶻ)</code>. Smooth S-kurve som klemmer alt
            til (0, 1).
          </li>
          <li>
            <strong className="text-foreground">Nevron</strong> (<code>nn-intro</code>):{" "}
            <code>output = σ(w·x + b)</code>. w styrer hellingen, b skyver til høyre/venstre.
          </li>
        </ul>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-base font-semibold mb-2">Universal approximation-teoremet</h2>
        <p className="text-muted-foreground">
          Cybenko (1989), Hornik (1991): et nevralt nett med ETT skjult lag som har nok nevroner kan
          tilnærme ENHVER kontinuerlig funksjon på et avgrenset område, så nøyaktig du vil.
        </p>
        <p className="text-muted-foreground mt-2">
          Det er en eksistens-bevis — det sier IKKE at vi vet hvordan å finne vektene. Bare at de
          finnes. Trening (backprop) er den separate utfordringen.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-base font-semibold mb-2">Det visuelle beviset</h2>
        <p className="text-muted-foreground">
          Trikset: et sigmoid-par kan lage en «bumpe» — en lokal pukkel. Hvor mange bumper du
          stabler kan du tegne hvilket som helst funksjons-form.
        </p>
        <p className="text-muted-foreground mt-2">
          Tenk på det som rektangler: legg nok rektangler ved siden av hverandre med justerbar
          høyde, og du kan tegne kurven til Mona Lisas profil. Sigmoid-bumper er bare softere
          rektangler.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-base font-semibold mb-2">Ordbok</h2>
        <dl className="space-y-2.5 text-[13px]">
          <Def term="Step-funksjon">
            En sigmoid med veldig stor w (vekt) ligner en step (0 til 1 ved en bestemt x). Brå
            overgang.
          </Def>
          <Def term="Bumpe (bump)">
            To step-funksjoner subtrahert: én går opp ved x=a, en annen går opp ved x=b. Resultatet
            er 1 mellom a og b, 0 utenfor. En lokal pukkel.
          </Def>
          <Def term="Approksimasjonsteorem (eksistens)">
            Beviser at noe finnes uten å gi en konstruksjon. Cybenko's bevis er konstruktivt (han
            VISER hvordan), men sier ikke det er enkelt eller praktisk å finne vektene.
          </Def>
          <Def term="Bredde vs dybde">
            Universal approx krever bare ETT skjult lag. Men hver komplekse funksjon kan trenge
            eksponentielt mange nevroner i ett lag — eller bare lineært mange hvis vi har flere lag.
            Det er hvorfor «deep» er praktisk: dypere nett = færre totale parametre for samme
            uttrykksevne.
          </Def>
        </dl>
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={() => onPick("live")}>
          Start på modul 1 →
        </Button>
      </div>
    </div>
  );
}

function sigmoid(z: number): number {
  return 1 / (1 + Math.exp(-z));
}

type Bump = { x: number; w: number; h: number }; // sentrum, bredde, høyde

function ApproxModule() {
  const [bumps, setBumps] = useState<Bump[]>([
    { x: 1, w: 1, h: 1 },
    { x: 3, w: 1.5, h: -0.5 },
    { x: 5, w: 1, h: 0.8 },
    { x: 7, w: 2, h: -0.3 },
  ]);
  const [target, setTarget] = useState<"sin" | "square" | "polynomial">("sin");

  const xs = useMemo(() => Array.from({ length: 200 }, (_, i) => (i / 200) * 10), []);
  const targetFn = (x: number) => {
    if (target === "sin") return Math.sin(x);
    if (target === "square") return x % 4 < 2 ? 0.8 : -0.4;
    return 0.05 * (x - 2) * (x - 5) * (x - 8);
  };
  const targetY = xs.map(targetFn);

  // Approksimasjon: sum av bumper. Hver bumpe er en differanse mellom to skarpe sigmoider.
  const SHARPNESS = 8; // hvor «skarp» step-en er
  const approxY = xs.map((x) => {
    let sum = 0;
    for (const b of bumps) {
      const left = sigmoid(SHARPNESS * (x - (b.x - b.w / 2)));
      const right = sigmoid(SHARPNESS * (x - (b.x + b.w / 2)));
      sum += b.h * (left - right);
    }
    return sum;
  });

  function update(i: number, key: keyof Bump, v: number) {
    setBumps((prev) => {
      const next = prev.map((b) => ({ ...b }));
      next[i][key] = v;
      return next;
    });
  }
  function addBump() {
    setBumps([...bumps, { x: 5, w: 1, h: 0.5 }]);
  }
  function removeBump(i: number) {
    setBumps(bumps.filter((_, k) => k !== i));
  }

  // Sett opp viewBox: x 0-10, y -1.5 til 1.5
  const W = 500,
    H = 280;
  function tx(x: number) {
    return (x / 10) * W;
  }
  function ty(y: number) {
    return H / 2 - (y / 1.5) * (H / 2 - 10);
  }

  const targetPath = xs
    .map((x, i) => `${i === 0 ? "M" : "L"} ${tx(x)} ${ty(targetY[i])}`)
    .join(" ");
  const approxPath = xs
    .map((x, i) => `${i === 0 ? "M" : "L"} ${tx(x)} ${ty(approxY[i])}`)
    .join(" ");

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
        <strong className="text-foreground">Bygg din egen approksimasjon:</strong> hver «bumpe» er
        bygd av to skarpe sigmoider (representerer ett nevron-par i et nett). Juster sentrum, bredde
        og høyde for å matche målfunksjonen (grå). Din approks (oransje) er summen av alle bumpene.
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-3 flex gap-1.5 items-center text-xs">
          <span className="text-muted-foreground">Målfunksjon:</span>
          <Button
            size="sm"
            variant={target === "sin" ? "default" : "outline"}
            onClick={() => setTarget("sin")}
          >
            sin(x)
          </Button>
          <Button
            size="sm"
            variant={target === "square" ? "default" : "outline"}
            onClick={() => setTarget("square")}
          >
            Firkant-bølge
          </Button>
          <Button
            size="sm"
            variant={target === "polynomial" ? "default" : "outline"}
            onClick={() => setTarget("polynomial")}
          >
            Polynom
          </Button>
        </div>

        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto bg-muted/20 rounded">
          {/* Akser */}
          <line
            x1={0}
            y1={H / 2}
            x2={W}
            y2={H / 2}
            className="stroke-muted-foreground/30"
            strokeWidth={1}
          />
          {/* Mål */}
          <path
            d={targetPath}
            fill="none"
            className="stroke-muted-foreground/60"
            strokeWidth={2}
            strokeDasharray="4 3"
          />
          {/* Approks */}
          <path d={approxPath} fill="none" className="stroke-amber-500" strokeWidth={2.5} />
          {/* Bumpe-sentre */}
          {bumps.map((b, i) => (
            <g key={i}>
              <line
                x1={tx(b.x)}
                y1={ty(0)}
                x2={tx(b.x)}
                y2={ty(b.h)}
                className="stroke-brand/60"
                strokeWidth={1}
                strokeDasharray="2 2"
              />
              <circle
                cx={tx(b.x)}
                cy={ty(b.h)}
                r={4}
                className="fill-brand stroke-white"
                strokeWidth={1.5}
              />
              <text
                x={tx(b.x)}
                y={ty(b.h) - 8}
                textAnchor="middle"
                className="fill-foreground text-[10px] font-mono"
              >
                #{i + 1}
              </text>
            </g>
          ))}
        </svg>

        <div className="mt-3 flex gap-3 text-[10px] text-muted-foreground">
          <span>
            <span className="inline-block w-3 h-0.5 bg-muted-foreground/60 mr-1" />
            mål
          </span>
          <span>
            <span className="inline-block w-3 h-0.5 bg-amber-500 mr-1" />
            din approks
          </span>
          <span>
            <span className="inline-block w-2 h-2 bg-brand rounded-full mr-1" />
            bumpe-sentre
          </span>
        </div>

        <div className="mt-4 space-y-2">
          {bumps.map((b, i) => (
            <div
              key={i}
              className="rounded border border-border bg-background p-2 grid grid-cols-3 gap-2 text-xs"
            >
              <div>
                <label className="text-[10px] text-muted-foreground">
                  x_{i + 1} (sentrum): {b.x.toFixed(1)}
                </label>
                <input
                  type="range"
                  min={0}
                  max={10}
                  step={0.1}
                  value={b.x}
                  onChange={(e) => update(i, "x", Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground">
                  w (bredde): {b.w.toFixed(1)}
                </label>
                <input
                  type="range"
                  min={0.2}
                  max={4}
                  step={0.1}
                  value={b.w}
                  onChange={(e) => update(i, "w", Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div className="flex gap-1 items-end">
                <div className="flex-1">
                  <label className="text-[10px] text-muted-foreground">
                    h (høyde): {b.h.toFixed(2)}
                  </label>
                  <input
                    type="range"
                    min={-1.5}
                    max={1.5}
                    step={0.05}
                    value={b.h}
                    onChange={(e) => update(i, "h", Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => removeBump(i)}
                  className="h-6 px-2 text-[10px]"
                >
                  ×
                </Button>
              </div>
            </div>
          ))}
          <Button size="sm" onClick={addBump}>
            + Ny bumpe
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-3 text-xs text-muted-foreground">
        Hver bumpe = 2 nevroner i et skjult lag (én positivt-vektet, én negativt-vektet sigmoid). Et
        nett med 10 bumper = 20 skjulte nevroner. Universal approximation sier at med nok bumper kan
        vi treffe målfunksjonen så nøyaktig vi vil.
      </div>
    </div>
  );
}

function Lessons() {
  return (
    <section className="mt-10 space-y-3 text-sm">
      <h2 className="text-lg font-semibold">Oppsummering</h2>
      <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
        <li>
          <strong className="text-foreground">Teoremet er enkelt</strong>: ett skjult lag + sigmoid
          + nok nevroner = kan approksimere alt. Beviset er konstruktivt (vi viser hvordan med
          bumper).
        </li>
        <li>
          <strong className="text-foreground">Men IKKE praktisk uten dybde.</strong> Komplekse
          mønstre (bilder, lyd) ville krevet astronomisk antall nevroner i ett lag. Med flere lag
          holder eksponentielt færre.
        </li>
        <li>
          <strong className="text-foreground">Trening er det egentlige problemet.</strong> Universal
          approx sier ikke noe om hvordan å FINNE de riktige vektene. Det er der backprop,
          optimizer-valg, regularisering kommer inn.
        </li>
        <li>
          <strong className="text-foreground">Generaliserer til andre aktiveringer.</strong> Ikke
          bare sigmoid — ReLU, tanh, og mange andre fungerer. Det er aktivering-funksjonens
          ikke-linearitet som er nøkkelen.
        </li>
      </ul>
    </section>
  );
}
