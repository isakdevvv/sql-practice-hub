import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {Lightbulb, ArrowLeft } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { BiasVariansDartboard } from "./BiasVariansDartboard";
import { GradientDescentSurface } from "./GradientDescentSurface";

const STEPS = [
  { title: "Bias-varians-tradeoff — definisjonen", anchor: "def" },
  { title: "Dartboard-intuisjon (interaktiv)", anchor: "dart" },
  { title: "Læringskurver", anchor: "kurver" },
  { title: "Regularisering — Ridge (L2)", anchor: "ridge" },
  { title: "Regularisering — Lasso (L1)", anchor: "lasso" },
  { title: "Ridge vs Lasso — når hva?", anchor: "vs" },
  { title: "Interaktiv: polynom-grad slider", anchor: "poly" },
  { title: "Interaktiv: Lasso → null-koeffisienter", anchor: "lasso-vis" },
  { title: "Gradient descent på loss-flate", anchor: "gd" },
];

export function Dte2602BiasVariansPage() {
  return (
    <StackPageShell title="DTE-2602 · Bias-varians & regularisering" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2602 · Modell-kompleksitet
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Bias-varians-tradeoff &amp; regularisering
          </h1>
          <p className="mt-3 text-muted-foreground">
            Hvorfor blir noen modeller dårligere når du gir dem mer fleksibilitet?
            Bias-varians-dekomposisjonen er den teoretiske forklaringen. Ridge og
            Lasso er de praktiske verktøyene for å håndtere den.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <Link to="/python" className="text-brand hover:underline">/python</Link>{" "}
              har øvelser som plotter læringskurver og kjører Ridge/Lasso på samme
              datasett.
            </div>
          </div>
        </div>

        <CourseOutline courseId="dte2602-bias-varians" steps={STEPS} />

        <Section number="1" id="def" title="Bias-varians-tradeoff — definisjonen">
          <p className="text-sm text-foreground mb-3">
            For et hvilket som helst datapunkt x kan vi dekomponere forventet
            kvadratisk feil til tre ledd:
          </p>
          <pre className="rounded-xl border border-border bg-card p-4 font-mono text-xs overflow-x-auto whitespace-pre">{`E[(ŷ - y)²]  =  Bias(ŷ)²  +  Var(ŷ)  +  σ²
                  └────────┘    └────┘     └──┘
              hvor systematisk   hvor       støy
              modellen bommer  ustabil    vi ikke
                              modellen     kan fjerne
                                er
`}</pre>
          <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-5 mt-3">
            <li>
              <strong>Bias høy:</strong> modellen er for stiv (underfitter). Lineær
              regresjon på ikke-lineær data.
            </li>
            <li>
              <strong>Varians høy:</strong> modellen er for fleksibel (overfitter).
              Ett dypt beslutningstre.
            </li>
            <li>
              <strong>σ²:</strong> irreduserbar støy. Du kan aldri komme under denne.
            </li>
          </ul>
          <p className="text-sm text-muted-foreground mt-3">
            Når du øker modellkompleksitet faller bias og varians stiger. Sweet spot
            ligger et sted i midten.
          </p>
        </Section>

        <Section number="2" id="dart" title="Dartboard-intuisjon (interaktiv)">
          <p className="text-sm text-muted-foreground mb-3">
            Tenk på treningen som dart-kast mot en blink (= sann modell). Hvert kast er
            <em> én modell trent på et nytt treningssett</em>. Bias = hvor langt
            gjennomsnittet bommer fra blink. Varians = hvor mye kastene spriker fra
            hverandre. Skru på sliderne — pilenes mønster oppfører seg som de fire
            klassiske scenariene fra Géron.
          </p>
          <BiasVariansDartboard />
        </Section>

        <Section number="3" id="kurver" title="Læringskurver">
          <p className="text-sm text-muted-foreground mb-3">
            Plot trenings- og validerings-feil som funksjon av treningssett-størrelse.
            Mønstrene avslører om du har bias-problem eller varians-problem:
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-xs uppercase tracking-wider text-amber-400 font-semibold mb-2">
                Høy bias (underfit)
              </div>
              <p className="text-xs text-muted-foreground">
                Begge kurver konvergerer høyt opp og er nær hverandre. Mer data
                hjelper ikke — du må bytte til en mer fleksibel modell.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-xs uppercase tracking-wider text-rose-400 font-semibold mb-2">
                Høy varians (overfit)
              </div>
              <p className="text-xs text-muted-foreground">
                Train-feil er lav, val-feil er høy, og det er et stort gap. Mer
                data eller regularisering vil hjelpe.
              </p>
            </div>
          </div>
          <pre className="rounded-xl border border-border bg-card p-4 font-mono text-xs overflow-x-auto whitespace-pre mt-3">{`from sklearn.model_selection import learning_curve

sizes, train_scores, val_scores = learning_curve(
    estimator=model, X=X, y=y, cv=5,
    train_sizes=np.linspace(0.1, 1.0, 10),
    scoring="neg_mean_squared_error",
)`}</pre>
        </Section>

        <Section number="4" id="ridge" title="Regularisering — Ridge (L2)">
          <p className="text-sm text-muted-foreground mb-3">
            Ridge legger til en straff på <em>kvadratisk sum av koeffisienter</em>{" "}
            til tap-funksjonen:
          </p>
          <pre className="rounded-xl border border-border bg-card p-4 font-mono text-xs overflow-x-auto whitespace-pre">{`L(β) = Σ(y_i - ŷ_i)²  +  α · Σ β_j²
       └──────────┘     └──────┘
        normal MSE      L2-penalty`}</pre>
          <p className="text-sm text-muted-foreground mt-3">
            Større α (alpha) → strengere straff → mindre koeffisienter → enklere
            modell. Ridge skrumper alle koeffisienter mot 0, men aldri helt.
          </p>
          <pre className="rounded-xl border border-border bg-card p-4 font-mono text-xs overflow-x-auto whitespace-pre mt-3">{`from sklearn.linear_model import RidgeCV

ridge = RidgeCV(alphas=[0.01, 0.1, 1, 10, 100])
ridge.fit(X_train_scaled, y_train)
print(ridge.alpha_)        # beste α valgt av CV`}</pre>
        </Section>

        <Section number="5" id="lasso" title="Regularisering — Lasso (L1)">
          <p className="text-sm text-muted-foreground mb-3">
            Lasso bruker <em>absoluttverdi</em> i straffen:
          </p>
          <pre className="rounded-xl border border-border bg-card p-4 font-mono text-xs overflow-x-auto whitespace-pre">{`L(β) = Σ(y_i - ŷ_i)²  +  α · Σ |β_j|
                              └─────────┘
                              L1-penalty`}</pre>
          <p className="text-sm text-muted-foreground mt-3">
            Kritisk forskjell fra Ridge: L1-formen har «hjørner» på aksene. Dette
            tvinger noen koeffisienter <em>helt</em> til 0 — Lasso gjør automatisk
            feature selection.
          </p>
          <pre className="rounded-xl border border-border bg-card p-4 font-mono text-xs overflow-x-auto whitespace-pre mt-3">{`from sklearn.linear_model import LassoCV

lasso = LassoCV(cv=5, random_state=42)
lasso.fit(X_train_scaled, y_train)
print((lasso.coef_ != 0).sum(), "features valgt")`}</pre>
        </Section>

        <Section number="6" id="vs" title="Ridge vs Lasso — når hva?">
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-32">Situasjon</th>
                  <th className="text-left font-semibold px-4 py-2">Velg</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono">Mange features, få relevante</td>
                  <td className="px-4 py-3 text-muted-foreground">Lasso — skyver irrelevante til 0.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono">Korrelerte features</td>
                  <td className="px-4 py-3 text-muted-foreground">Ridge — fordeler vekten jevnt på begge.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono">Vet ikke / vil ha begge</td>
                  <td className="px-4 py-3 text-muted-foreground">ElasticNet — blanding av L1 + L2.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono">Standardvalg</td>
                  <td className="px-4 py-3 text-muted-foreground">Ridge — stabil, alltid løsbar.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            <strong>Husk:</strong> begge krever skalerte features. Ellers straffes
            features med stor skala urettferdig.
          </p>
        </Section>

        <Section number="7" id="poly" title="Interaktiv: slider for polynom-grad">
          <p className="text-sm text-muted-foreground mb-3">
            Drag slideren for å øke polynom-graden. Treningsfeil faller monotont,
            men test-feil danner en U: optimal grad ligger der test-feilen er minst.
          </p>
          <PolynomialComplexityDemo />
        </Section>

        <Section number="8" id="lasso-vis" title="Interaktiv: Lasso skyver koeffisienter mot 0">
          <p className="text-sm text-muted-foreground mb-3">
            8 features, varierende α. Når α øker mot høyre, ser du at Lasso slår
            ut features én for én — koeffisienter går helt til 0:
          </p>
          <LassoPathDemo />
        </Section>

        <Section number="9" id="gd" title="Gradient descent på loss-flate">
          <p className="text-sm text-muted-foreground mb-3">
            Modellen treningen din kjører — den følger gradienten nedover loss-flata.
            Her er flata kvadratisk og langstrakt (vanskelig retning). Klikk i flata
            for å sette startpunkt. Dra på lærings-rate og momentum og se hvordan
            banen endres.
          </p>
          <GradientDescentSurface />
        </Section>
              <div className="mt-6">
          <Link
            to="/stack/$slug"
            params={{ slug: "dte-2602" }}
            className="text-brand hover:underline inline-flex items-center gap-1 text-sm"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Tilbake til DTE-2602-hub
          </Link>
        </div>
</div>
    </StackPageShell>
  );
}

function Section({
  number,
  id,
  title,
  children,
}: {
  number: string;
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mb-10">
      <h2 className="text-xl font-semibold mb-3">
        {number}. {title}
      </h2>
      {children}
    </section>
  );
}

/* ---------- Visual: polynom-grad ---------- */

// True function: y = sin(x) + small noise
const TRAIN_X = Array.from({ length: 12 }, (_, i) => i * 0.6 - 1);
function rngLCG(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}
const noise = rngLCG(1);
const TRAIN_Y = TRAIN_X.map((x) => Math.sin(x) + (noise() - 0.5) * 0.4);

function polyFit(x: number[], y: number[], deg: number): number[] {
  // Vandermonde + normal equations (ridge with tiny λ for stability)
  const n = x.length;
  const d = deg + 1;
  const X: number[][] = x.map((xi) => Array.from({ length: d }, (_, k) => xi ** k));
  // Normal equations: (X^T X + λI) β = X^T y
  const XtX = Array.from({ length: d }, () => new Array(d).fill(0));
  const Xty = new Array(d).fill(0);
  for (let i = 0; i < n; i++) {
    for (let a = 0; a < d; a++) {
      Xty[a] += X[i][a] * y[i];
      for (let b = 0; b < d; b++) XtX[a][b] += X[i][a] * X[i][b];
    }
  }
  for (let i = 0; i < d; i++) XtX[i][i] += 1e-6;
  // Solve via Gauss-Jordan
  for (let i = 0; i < d; i++) {
    let piv = i;
    for (let k = i + 1; k < d; k++) if (Math.abs(XtX[k][i]) > Math.abs(XtX[piv][i])) piv = k;
    [XtX[i], XtX[piv]] = [XtX[piv], XtX[i]];
    [Xty[i], Xty[piv]] = [Xty[piv], Xty[i]];
    const div = XtX[i][i] || 1e-12;
    for (let j = 0; j < d; j++) XtX[i][j] /= div;
    Xty[i] /= div;
    for (let k = 0; k < d; k++) {
      if (k === i) continue;
      const f = XtX[k][i];
      for (let j = 0; j < d; j++) XtX[k][j] -= f * XtX[i][j];
      Xty[k] -= f * Xty[i];
    }
  }
  return Xty;
}

function polyEval(coefs: number[], x: number): number {
  let s = 0;
  let p = 1;
  for (const c of coefs) {
    s += c * p;
    p *= x;
  }
  return s;
}

function PolynomialComplexityDemo() {
  const [deg, setDeg] = useState(3);

  const { trainErr, testErr, curve } = useMemo(() => {
    const coefs = polyFit(TRAIN_X, TRAIN_Y, deg);
    const trainPred = TRAIN_X.map((x) => polyEval(coefs, x));
    const tErr = trainPred.reduce((s, p, i) => s + (p - TRAIN_Y[i]) ** 2, 0) / TRAIN_Y.length;
    // True test set: more samples from sin(x), but use deterministic samples
    const testX = Array.from({ length: 50 }, (_, i) => (i / 49) * 8 - 1.5);
    const testY = testX.map((x) => Math.sin(x));
    const testPred = testX.map((x) => polyEval(coefs, x));
    const teErr = testPred.reduce((s, p, i) => s + (p - testY[i]) ** 2, 0) / testY.length;
    // Curve to draw
    const xs = Array.from({ length: 80 }, (_, i) => (i / 79) * 8 - 1.5);
    const ys = xs.map((x) => polyEval(coefs, x));
    return { trainErr: tErr, testErr: teErr, curve: xs.map((x, i) => [x, ys[i]]) };
  }, [deg]);

  // Plot
  const W = 420;
  const H = 240;
  const PAD = 30;
  const xMin = -1.5;
  const xMax = 6.5;
  const yMin = -2;
  const yMax = 2;
  const sx = (v: number) => PAD + ((v - xMin) / (xMax - xMin)) * (W - 2 * PAD);
  const sy = (v: number) => H - PAD - ((v - yMin) / (yMax - yMin)) * (H - 2 * PAD);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-3 mb-3">
        <label className="text-xs text-muted-foreground">Polynom-grad: {deg}</label>
        <input
          type="range"
          min={1}
          max={12}
          value={deg}
          onChange={(e) => setDeg(parseInt(e.target.value))}
          className="flex-1"
        />
      </div>
      <div className="flex justify-center">
        <svg width={W} height={H} className="block">
          <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#888" />
          <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="#888" />
          {/* Truth: sin(x) */}
          <path
            d={Array.from({ length: 80 }, (_, i) => {
              const x = xMin + (i / 79) * (xMax - xMin);
              const y = Math.sin(x);
              return `${i === 0 ? "M" : "L"} ${sx(x)} ${sy(y)}`;
            }).join(" ")}
            fill="none"
            stroke="#22c55e"
            strokeWidth={1}
            strokeDasharray="3 3"
            opacity={0.7}
          />
          {/* Fit */}
          <path
            d={curve
              .map(([x, y], i) => `${i === 0 ? "M" : "L"} ${sx(x)} ${sy(Math.max(yMin, Math.min(yMax, y)))}`)
              .join(" ")}
            fill="none"
            stroke="#3b82f6"
            strokeWidth={2}
          />
          {/* Train points */}
          {TRAIN_X.map((x, i) => (
            <circle key={i} cx={sx(x)} cy={sy(TRAIN_Y[i])} r={3.5} fill="#f43f5e" />
          ))}
        </svg>
      </div>
      <div className="grid grid-cols-2 gap-3 mt-3">
        <div className="rounded-lg border border-border bg-background p-3">
          <div className="text-xs text-muted-foreground">Train MSE</div>
          <div className="text-lg font-bold">{trainErr.toFixed(3)}</div>
        </div>
        <div className="rounded-lg border border-border bg-background p-3">
          <div className="text-xs text-muted-foreground">Test MSE (mot ekte sin x)</div>
          <div className="text-lg font-bold">{testErr.toFixed(3)}</div>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-3">
        Stiplet grønn = sann funksjon (sin x). Blå = polynom-fit. Røde prikker = treningsdata.
        Vri opp graden og se hvordan kurven begynner å vrenge seg gjennom alle prikker — men feilen mot sann sin øker.
      </p>
    </div>
  );
}

/* ---------- Visual: Lasso path ---------- */

const FEATURE_NAMES = ["alder", "BMI", "blodtrykk", "kolesterol", "puls", "vekt", "trening", "støy"];
const TRUE_COEFS = [0.8, 0.6, 0.4, 0.0, 0.2, 0.0, 0.5, 0.0];

function lassoPathSimulated(alpha: number): number[] {
  // Soft-thresholding: β_j = sign(β_j) * max(|β_j| - α, 0)
  return TRUE_COEFS.map((b) => {
    const shrunk = Math.max(Math.abs(b) - alpha, 0);
    return Math.sign(b) * shrunk;
  });
}

function LassoPathDemo() {
  const [alpha, setAlpha] = useState(0.05);
  const coefs = lassoPathSimulated(alpha);
  const W = 420;
  const H = 220;
  const PAD = 50;
  const barWidth = (W - PAD - 20) / FEATURE_NAMES.length;
  const maxAbs = 1;
  const zero = H - 30;
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-3 mb-3">
        <label className="text-xs text-muted-foreground">α (regularisering): {alpha.toFixed(2)}</label>
        <input
          type="range"
          min={0}
          max={0.9}
          step={0.05}
          value={alpha}
          onChange={(e) => setAlpha(parseFloat(e.target.value))}
          className="flex-1"
        />
      </div>
      <div className="flex justify-center">
        <svg width={W} height={H} className="block">
          <line x1={PAD} y1={zero} x2={W - 20} y2={zero} stroke="#888" />
          {coefs.map((c, i) => {
            const h = (Math.abs(c) / maxAbs) * 100;
            const x = PAD + i * barWidth + 4;
            const y = c >= 0 ? zero - h : zero;
            return (
              <g key={i}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth - 8}
                  height={h}
                  fill={c === 0 ? "#9ca3af" : c > 0 ? "#3b82f6" : "#f43f5e"}
                  opacity={c === 0 ? 0.3 : 0.9}
                />
                <text
                  x={x + (barWidth - 8) / 2}
                  y={zero + 14}
                  textAnchor="middle"
                  fontSize={9}
                  fill="#888"
                >
                  {FEATURE_NAMES[i]}
                </text>
                <text
                  x={x + (barWidth - 8) / 2}
                  y={zero + 26}
                  textAnchor="middle"
                  fontSize={9}
                  fill={c === 0 ? "#888" : "#fff"}
                >
                  {c.toFixed(2)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <p className="text-xs text-muted-foreground mt-3">
        Stiplet grå bar betyr β = 0 — Lasso har droppet kolonnen. Ved store α
        står du igjen med bare 1–2 features. Lav α → alle features beholder
        noe vekt (lik Ridge).
      </p>
    </div>
  );
}
