import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {Lightbulb, ArrowLeft } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { DecisionBoundary } from "./DecisionBoundary";

const STEPS = [
  { title: "Beslutningstre — intuisjon", anchor: "intuisjon" },
  { title: "Hvordan velge split — Gini & entropi", anchor: "gini" },
  { title: "Overfitting og max_depth", anchor: "depth" },
  { title: "Random Forest — bootstrap + random features", anchor: "rf" },
  { title: "Feature importance", anchor: "importance" },
  { title: "Visuell: bygg tre steg-for-steg", anchor: "visual" },
  { title: "Sammenlign single-tree vs forest", anchor: "compare" },
  { title: "Dypere: beslutningsgrenser, depth & n_estimators", anchor: "boundary" },
];

export function Dte2602TreesRfPage() {
  return (
    <StackPageShell title="DTE-2602 · Trær & Random Forest" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2602 · Trebaserte modeller
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Beslutningstrær &amp; Random Forest
          </h1>
          <p className="mt-3 text-muted-foreground">
            Trær er den mest tolkbare ML-modellen — du kan tegne dem på papir.
            Random Forest fikser overfitting-problemet ved å la mange svake trær
            stemme sammen. To av de mest robuste algoritmene du har.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <Link to="/python" className="text-brand hover:underline">/python</Link>{" "}
              har øvelser som plotter beslutningsgrensene til
              både <code>DecisionTreeClassifier</code> og <code>RandomForestClassifier</code>.
            </div>
          </div>
        </div>

        <CourseOutline courseId="dte2602-trees-rf" steps={STEPS} />

        <Section number="1" id="intuisjon" title="Beslutningstre — intuisjon">
          <p className="text-sm text-foreground mb-3">
            Et beslutningstre er en serie ja/nei-spørsmål. Hver intern node er et
            spørsmål om en feature (<em>«er petal_length &lt; 2.5?»</em>), hver
            kant er svaret, hvert blad er prediksjonen.
          </p>
          <pre className="rounded-xl border border-border bg-card p-4 font-mono text-xs overflow-x-auto whitespace-pre">{`              [petal_length < 2.45?]
               /                \\
            ja /                  \\ nei
             [setosa]      [petal_width < 1.75?]
                            /                \\
                         ja /                  \\ nei
                       [versicolor]        [virginica]`}</pre>
          <p className="text-sm text-muted-foreground mt-3">
            Treet gjør splits aksejusterte (én feature om gangen). Det betyr at
            beslutningsgrensene alltid blir trappetrinn-formede — aldri diagonale.
          </p>
        </Section>

        <Section number="2" id="gini" title="Hvordan velge split — Gini & entropi">
          <p className="text-sm text-muted-foreground mb-3">
            For hver mulig split beregner algoritmen <em>urenheten</em> i nodene som
            oppstår. Den splitten som gir lavest urenhet vinner. To vanlige mål:
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Gini-impurity
              </div>
              <pre className="font-mono text-xs">{`G = 1 - Σ p_i²

Ren node:  G = 0
Maks usikker (50/50): G = 0.5`}</pre>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Entropi (informasjon)
              </div>
              <pre className="font-mono text-xs">{`H = -Σ p_i · log₂(p_i)

Ren node:  H = 0
Maks usikker (50/50): H = 1`}</pre>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            <code>criterion="gini"</code> er default i sklearn — raskere å regne
            og gir nesten alltid samme tre som entropi.
          </p>
        </Section>

        <Section number="3" id="depth" title="Overfitting og max_depth">
          <p className="text-sm text-muted-foreground mb-3">
            Et fullt vokst tre <em>memorerer</em> treningsdataen — det får
            100 % train accuracy, men overfit hardt. Tre hovedhåndtak:
          </p>
          <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-5 mb-3">
            <li>
              <code>max_depth</code> — kapper treet på en gitt dybde. Typisk 3–10.
            </li>
            <li>
              <code>min_samples_split</code> — krev minst N samples i en node for å
              prøve å splitte. Typisk 10–50.
            </li>
            <li>
              <code>min_samples_leaf</code> — krev minst M samples i hvert blad.
              Typisk 1–20.
            </li>
          </ul>
          <pre className="rounded-xl border border-border bg-card p-4 font-mono text-xs overflow-x-auto whitespace-pre">{`from sklearn.tree import DecisionTreeClassifier

tree = DecisionTreeClassifier(
    max_depth=5,
    min_samples_leaf=10,
    random_state=42,
)
tree.fit(X_train, y_train)`}</pre>
        </Section>

        <Section number="4" id="rf" title="Random Forest — bootstrap + random features">
          <p className="text-sm text-muted-foreground mb-3">
            Random Forest = mange trær som stemmer. To kilder til randomness:
          </p>
          <ol className="text-sm text-muted-foreground space-y-2 list-decimal pl-5 mb-3">
            <li>
              <strong>Bootstrap-samples:</strong> hvert tre trenes på en tilfeldig
              utvalgt delmengde (med tilbakelegging) av samplene.
            </li>
            <li>
              <strong>Random feature subset:</strong> i hver split vurderes bare et
              tilfeldig utvalg av features (default <code>sqrt(n_features)</code>{" "}
              for klassifikasjon).
            </li>
          </ol>
          <p className="text-sm text-muted-foreground">
            Effekten: trærne dekorreleres. Hvert tre overfit på sin egen måte, men
            når 100 av dem stemmer er gjennomsnittet stabilt og presist.
          </p>
          <pre className="rounded-xl border border-border bg-card p-4 font-mono text-xs overflow-x-auto whitespace-pre mt-3">{`from sklearn.ensemble import RandomForestClassifier

rf = RandomForestClassifier(
    n_estimators=200,       # antall trær
    max_features="sqrt",
    n_jobs=-1,              # bruk alle CPU-kjerner
    random_state=42,
)
rf.fit(X_train, y_train)`}</pre>
        </Section>

        <Section number="5" id="importance" title="Feature importance">
          <p className="text-sm text-muted-foreground mb-3">
            En av de viktigste fordelene med tre-baserte modeller:{" "}
            <code>rf.feature_importances_</code> gir deg en ranking av hvilke
            kolonner som faktisk betyr noe for prediksjonen.
          </p>
          <pre className="rounded-xl border border-border bg-card p-4 font-mono text-xs overflow-x-auto whitespace-pre">{`import pandas as pd

imp = pd.Series(rf.feature_importances_, index=X.columns)
imp.sort_values().plot(kind="barh")`}</pre>
          <p className="text-xs text-muted-foreground mt-3">
            <strong>Pass på:</strong> sklearn sin innebygde importance er biased mot
            features med mange unike verdier. <code>permutation_importance</code>{" "}
            (også i sklearn) er mer pålitelig.
          </p>
        </Section>

        <Section number="6" id="visual" title="Visuell: bygg treet steg-for-steg">
          <p className="text-sm text-muted-foreground mb-3">
            10 datapunkter i 2D, to klasser. Klikk «Neste split» for å bygge treet
            én node om gangen og se hvordan beslutningsgrensene blir trappetrinn:
          </p>
          <TreeBuilderDemo />
        </Section>

        <Section number="7" id="compare" title="Sammenlign single-tree vs forest">
          <p className="text-sm text-muted-foreground mb-3">
            Den klassiske demonstrasjonen: ett tre lager skarpe, rotete grenser. En
            forest av 50 trær glatter ut grensene — overfitter mindre.
          </p>
          <ForestVsTreeDemo />
        </Section>

        <Section
          number="8"
          id="boundary"
          title="Dypere: beslutningsgrenser, depth & n_estimators"
        >
          <p className="text-sm text-muted-foreground mb-3">
            Tre klasser i 2D. Bytt mellom Decision Tree og Random Forest, og
            skru på <code>max_depth</code> og <code>n_estimators</code> for å
            se hvordan beslutningsgrensene endrer karakter. Med tre,
            depth=10 får du tydelige trappetrinn (overfit). Med forest,
            n_estimators=50 glatter grensene seg ut til mer organiske kurver.
          </p>
          <DecisionBoundary />
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

/* ---------- Visual: bygg tre steg-for-steg ---------- */

type Point = { x: number; y: number; cls: 0 | 1 };
type Split = { axis: "x" | "y"; value: number; xMin: number; xMax: number; yMin: number; yMax: number };

const DEMO_POINTS: Point[] = [
  { x: 1.2, y: 1.5, cls: 0 },
  { x: 1.8, y: 2.1, cls: 0 },
  { x: 2.3, y: 1.7, cls: 0 },
  { x: 2.1, y: 0.9, cls: 0 },
  { x: 3.5, y: 2.5, cls: 1 },
  { x: 4.1, y: 3.0, cls: 1 },
  { x: 3.8, y: 4.2, cls: 1 },
  { x: 4.5, y: 3.7, cls: 1 },
  { x: 2.7, y: 4.0, cls: 1 },
  { x: 3.0, y: 3.3, cls: 1 },
];

const BUILT_SPLITS: Split[] = [
  // 1: split on x at ~2.8
  { axis: "x", value: 2.8, xMin: 0, xMax: 5, yMin: 0, yMax: 5 },
  // 2: in right region, split on y at ~3.0
  { axis: "y", value: 2.0, xMin: 2.8, xMax: 5, yMin: 0, yMax: 5 },
];

function TreeBuilderDemo() {
  const [step, setStep] = useState(0);
  const W = 360;
  const H = 320;
  const PAD = 30;
  const sx = (v: number) => PAD + (v / 5) * (W - 2 * PAD);
  const sy = (v: number) => H - PAD - (v / 5) * (H - 2 * PAD);

  // Compute partitions to color
  type Region = { xMin: number; xMax: number; yMin: number; yMax: number };
  const regions: Region[] = useMemo(() => {
    let regs: Region[] = [{ xMin: 0, xMax: 5, yMin: 0, yMax: 5 }];
    for (let i = 0; i < step; i++) {
      const s = BUILT_SPLITS[i];
      const next: Region[] = [];
      for (const r of regs) {
        // only split regions that the split actually intersects
        if (s.axis === "x" && s.value > r.xMin && s.value < r.xMax) {
          next.push({ ...r, xMax: s.value });
          next.push({ ...r, xMin: s.value });
        } else if (s.axis === "y" && s.value > r.yMin && s.value < r.yMax) {
          next.push({ ...r, yMax: s.value });
          next.push({ ...r, yMin: s.value });
        } else {
          next.push(r);
        }
      }
      regs = next;
    }
    return regs;
  }, [step]);

  const majorityClass = (r: Region): 0 | 1 => {
    const inR = DEMO_POINTS.filter(
      (p) => p.x >= r.xMin && p.x <= r.xMax && p.y >= r.yMin && p.y <= r.yMax,
    );
    const ones = inR.filter((p) => p.cls === 1).length;
    return ones > inR.length / 2 ? 1 : 0;
  };

  const splitsToDraw = BUILT_SPLITS.slice(0, step);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <button
          className="px-3 py-1.5 text-xs rounded bg-brand text-brand-foreground disabled:opacity-40"
          onClick={() => setStep((s) => Math.min(BUILT_SPLITS.length, s + 1))}
          disabled={step >= BUILT_SPLITS.length}
        >
          Neste split
        </button>
        <button
          className="px-3 py-1.5 text-xs rounded bg-muted text-muted-foreground"
          onClick={() => setStep(0)}
        >
          Tilbakestill
        </button>
        <span className="text-xs text-muted-foreground ml-2">
          Steg {step}/{BUILT_SPLITS.length}
        </span>
      </div>
      <div className="flex justify-center">
        <svg width={W} height={H} className="block">
          {/* Background partitions */}
          {regions.map((r, i) => {
            const cls = majorityClass(r);
            const color = cls === 1 ? "rgba(59, 130, 246, 0.15)" : "rgba(244, 63, 94, 0.15)";
            return (
              <rect
                key={i}
                x={sx(r.xMin)}
                y={sy(r.yMax)}
                width={sx(r.xMax) - sx(r.xMin)}
                height={sy(r.yMin) - sy(r.yMax)}
                fill={color}
              />
            );
          })}
          {/* Split lines */}
          {splitsToDraw.map((s, i) => {
            if (s.axis === "x") {
              return (
                <line
                  key={i}
                  x1={sx(s.value)}
                  y1={sy(s.yMin)}
                  x2={sx(s.value)}
                  y2={sy(s.yMax)}
                  stroke="#facc15"
                  strokeWidth={2}
                  strokeDasharray="4 3"
                />
              );
            }
            return (
              <line
                key={i}
                x1={sx(s.xMin)}
                y1={sy(s.value)}
                x2={sx(s.xMax)}
                y2={sy(s.value)}
                stroke="#facc15"
                strokeWidth={2}
                strokeDasharray="4 3"
              />
            );
          })}
          {/* Axes */}
          <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#888" />
          <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="#888" />
          {/* Points */}
          {DEMO_POINTS.map((p, i) => (
            <circle
              key={i}
              cx={sx(p.x)}
              cy={sy(p.y)}
              r={5}
              fill={p.cls === 1 ? "#3b82f6" : "#f43f5e"}
              stroke="#fff"
              strokeWidth={1}
            />
          ))}
          <text x={W / 2} y={H - 5} textAnchor="middle" fontSize={10} fill="#888">
            x (feature 1)
          </text>
          <text
            x={10}
            y={H / 2}
            textAnchor="middle"
            fontSize={10}
            fill="#888"
            transform={`rotate(-90, 10, ${H / 2})`}
          >
            y (feature 2)
          </text>
        </svg>
      </div>
      <div className="text-xs text-muted-foreground mt-3">
        {step === 0 && (
          <>Før noen split: alle 10 punkter er i én region. Gini ≈ 0.48 (ganske blandet).</>
        )}
        {step === 1 && (
          <>
            Split 1: <code>x &lt; 2.8</code>. Venstre region har bare røde, høyre
            har overvekt blå. Stor reduksjon i Gini.
          </>
        )}
        {step === 2 && (
          <>
            Split 2: i høyre region, <code>y &lt; 2.0</code>. Splitter ut én rød
            outlier-region nederst til høyre. Resten er ren blå.
          </>
        )}
      </div>
    </div>
  );
}

/* ---------- Visual: single tree vs forest ---------- */

function ForestVsTreeDemo() {
  // Simple synthetic decision regions, hand-tuned to show that forest
  // is smoother than a deep single tree.
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="text-xs font-semibold mb-2">
          Ett dypt tre (max_depth=None)
        </div>
        <svg width={260} height={220} className="block">
          {/* jagged boundary */}
          <rect x={20} y={20} width={220} height={180} fill="rgba(244,63,94,0.1)" />
          <path
            d="M 20,140 L 60,140 L 60,100 L 90,100 L 90,130 L 130,130 L 130,80 L 170,80 L 170,110 L 200,110 L 200,60 L 240,60 L 240,200 L 20,200 Z"
            fill="rgba(59,130,246,0.25)"
            stroke="#3b82f6"
            strokeWidth={1}
          />
          <text x={130} y={215} textAnchor="middle" fontSize={9} fill="#888">
            Skarpe trappetrinn — overfit
          </text>
        </svg>
      </div>
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="text-xs font-semibold mb-2">
          Random Forest (n_estimators=100)
        </div>
        <svg width={260} height={220} className="block">
          <rect x={20} y={20} width={220} height={180} fill="rgba(244,63,94,0.1)" />
          <path
            d="M 20,120 Q 80,100 130,110 Q 180,115 240,90 L 240,200 L 20,200 Z"
            fill="rgba(59,130,246,0.25)"
            stroke="#3b82f6"
            strokeWidth={1}
          />
          <text x={130} y={215} textAnchor="middle" fontSize={9} fill="#888">
            Glattet ut — stemmegjennomsnitt
          </text>
        </svg>
      </div>
    </div>
  );
}
