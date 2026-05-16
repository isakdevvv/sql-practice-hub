import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {Lightbulb, ArrowLeft } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { RocExplorer } from "./RocExplorer";

const STEPS = [
  { title: "Forvirringsmatrise — TP/FP/FN/TN", anchor: "cm" },
  { title: "Precision, Recall, F1", anchor: "metrikker" },
  { title: "ROC og AUC", anchor: "roc" },
  { title: "Terskel-valg", anchor: "terskel" },
  { title: "Ubalansert data", anchor: "ubalanse" },
  { title: "Interaktiv: ROC + flyttbar terskel", anchor: "roc-vis" },
  { title: "Dypere: bytt modell-kvalitet, se AUC endre seg", anchor: "roc-explorer" },
];

export function Dte2602EvaluationRocPage() {
  return (
    <StackPageShell title="DTE-2602 · Evaluering & ROC" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2602 · Klassifikasjons-evaluering
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Forvirringsmatrise, F1 og ROC-AUC
          </h1>
          <p className="mt-3 text-muted-foreground">
            Accuracy alene er misvisende — særlig når dataen er ubalansert. Du
            trenger forvirringsmatrise, precision/recall og ROC-AUC. Og du må forstå
            at <em>terskelen</em> kan velges fritt.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <Link to="/python" className="text-brand hover:underline">/python</Link>{" "}
              har en øvelse der du tegner ROC-kurven manuelt med en terskel-loop.
            </div>
          </div>
        </div>

        <CourseOutline courseId="dte2602-evaluation-roc" steps={STEPS} />

        <Section number="1" id="cm" title="Forvirringsmatrise — TP/FP/FN/TN">
          <p className="text-sm text-muted-foreground mb-3">
            For binær klassifikasjon (positiv = 1, negativ = 0):
          </p>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2"></th>
                  <th className="text-left font-semibold px-4 py-2">Predikert 1</th>
                  <th className="text-left font-semibold px-4 py-2">Predikert 0</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-semibold">Faktisk 1</td>
                  <td className="px-4 py-3 text-emerald-400">TP — true positive</td>
                  <td className="px-4 py-3 text-rose-400">FN — false negative</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-semibold">Faktisk 0</td>
                  <td className="px-4 py-3 text-rose-400">FP — false positive</td>
                  <td className="px-4 py-3 text-emerald-400">TN — true negative</td>
                </tr>
              </tbody>
            </table>
          </div>
          <pre className="rounded-xl border border-border bg-card p-4 font-mono text-xs overflow-x-auto whitespace-pre mt-3">{`from sklearn.metrics import confusion_matrix, classification_report

cm = confusion_matrix(y_true, y_pred)
# array([[TN, FP],
#        [FN, TP]])

print(classification_report(y_true, y_pred))`}</pre>
        </Section>

        <Section number="2" id="metrikker" title="Precision, Recall, F1">
          <pre className="rounded-xl border border-border bg-card p-4 font-mono text-xs overflow-x-auto whitespace-pre">{`Precision = TP / (TP + FP)
            «Når modellen sier 1, hvor ofte er den riktig?»

Recall    = TP / (TP + FN)
            «Av alle ekte 1-ere, hvor mange fanget vi?»

F1        = 2 · (P · R) / (P + R)
            «Harmonisk snitt — én tall som balanserer P og R.»

Accuracy  = (TP + TN) / total
            «Hvor mange totalt riktig?» — misvisende ved ubalanse.`}</pre>
          <div className="grid sm:grid-cols-2 gap-3 mt-3">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Når precision er kritisk
              </div>
              <p className="text-xs text-muted-foreground">
                Spam-filter, retsforfølgelse, kreditt-godkjenning. En FP koster
                mer enn en FN.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Når recall er kritisk
              </div>
              <p className="text-xs text-muted-foreground">
                Kreft-screening, sikkerhets-trusler, fraud-deteksjon. En FN
                (missed positive) koster mer enn en FP.
              </p>
            </div>
          </div>
        </Section>

        <Section number="3" id="roc" title="ROC og AUC">
          <p className="text-sm text-muted-foreground mb-3">
            ROC-kurven (Receiver Operating Characteristic) tegner TPR mot FPR for
            ALLE mulige terskler. AUC (Area Under Curve) er arealet under.
          </p>
          <pre className="rounded-xl border border-border bg-card p-4 font-mono text-xs overflow-x-auto whitespace-pre">{`TPR (sensitivity / recall) = TP / (TP + FN)
FPR (false positive rate)  = FP / (FP + TN)

AUC = 0.5  → tilfeldig gjetning
AUC = 1.0  → perfekt klassifikator
AUC = 0.85 → ganske bra`}</pre>
          <pre className="rounded-xl border border-border bg-card p-4 font-mono text-xs overflow-x-auto whitespace-pre mt-3">{`from sklearn.metrics import roc_auc_score, roc_curve

probs = model.predict_proba(X_test)[:, 1]
auc = roc_auc_score(y_test, probs)
fpr, tpr, thresholds = roc_curve(y_test, probs)`}</pre>
          <p className="text-xs text-muted-foreground mt-3">
            AUC er <em>terskel-uavhengig</em>: den måler modellens evne til å
            rangere positiver foran negativer, uansett hvor du setter cut-offen.
          </p>
        </Section>

        <Section number="4" id="terskel" title="Terskel-valg">
          <p className="text-sm text-muted-foreground mb-3">
            Default i sklearn: <code>predict()</code> bruker terskel 0.5 på
            sannsynligheten. Det er sjelden optimalt for ditt problem. To strategier:
          </p>
          <ol className="text-sm text-muted-foreground space-y-2 list-decimal pl-5">
            <li>
              <strong>Maks F1:</strong> for hver terskel beregn F1, velg den som er størst.
            </li>
            <li>
              <strong>Maks utility:</strong> definer kostnaden av FP og FN, velg terskelen
              som minimerer total kostnad.
            </li>
          </ol>
          <pre className="rounded-xl border border-border bg-card p-4 font-mono text-xs overflow-x-auto whitespace-pre mt-3">{`from sklearn.metrics import precision_recall_curve

precs, recs, thr = precision_recall_curve(y_test, probs)
f1s = 2 * precs * recs / (precs + recs + 1e-9)
best_thr = thr[f1s[:-1].argmax()]
y_pred = (probs >= best_thr).astype(int)`}</pre>
        </Section>

        <Section number="5" id="ubalanse" title="Ubalansert data">
          <p className="text-sm text-muted-foreground mb-3">
            Hvis 99 % av samplene er klasse 0, vil en modell som <em>alltid</em>{" "}
            sier 0 få 99 % accuracy — og være helt ubrukelig.
          </p>
          <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-5">
            <li>
              Bruk <strong>F1, recall, AUC, balanced_accuracy</strong> — ikke accuracy.
            </li>
            <li>
              <code>{`class_weight="balanced"`}</code> i sklearn-modeller — vekter
              minoritetsklassen automatisk.
            </li>
            <li>
              <strong>SMOTE / oversampling</strong> for å lage syntetiske minoritetssampler.
            </li>
            <li>
              <strong>Stratifisert split</strong>: <code>{`train_test_split(..., stratify=y)`}</code>{" "}
              + <code>{`StratifiedKFold`}</code> i CV.
            </li>
          </ul>
        </Section>

        <Section number="6" id="roc-vis" title="Interaktiv: ROC + flyttbar terskel">
          <p className="text-sm text-muted-foreground mb-3">
            Synscener fra to klasser, vist som histogram. Slideren flytter terskelen.
            ROC-kurven over markerer hvor du står; forvirringsmatrisen og metrikene
            til høyre oppdateres live.
          </p>
          <RocThresholdDemo />
        </Section>

        <Section number="7" id="roc-explorer" title="Dypere: bytt modell-kvalitet">
          <p className="text-sm text-muted-foreground mb-3">
            Samme oppsett, men nå med tre forhåndsdefinerte modeller. Bytt fra
            «dårlig» til «god» til «perfekt» og se hvordan AUC kryper fra
            ~0.55 til 1.00 og histogrammene gradvis separeres. Knappen
            «Maks-F1» søker terskelen som maksimerer F1 — en god default i
            mange anvendelser.
          </p>
          <RocExplorer />
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

/* ---------- Visual: ROC + flyttbar terskel ---------- */

// Generate two overlapping score distributions
function generateScores(): { score: number; label: 0 | 1 }[] {
  const out: { score: number; label: 0 | 1 }[] = [];
  let s = 7;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  const gauss = (m: number, sd: number) => {
    // Box-Muller
    const u = 1 - rand();
    const v = rand();
    return m + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
  for (let i = 0; i < 100; i++) {
    out.push({ score: Math.max(0, Math.min(1, gauss(0.35, 0.18))), label: 0 });
    out.push({ score: Math.max(0, Math.min(1, gauss(0.65, 0.18))), label: 1 });
  }
  return out;
}

const SCORES = generateScores();
const N_POS = SCORES.filter((s) => s.label === 1).length;
const N_NEG = SCORES.length - N_POS;

function metricsAtThreshold(thr: number) {
  let tp = 0;
  let fp = 0;
  let tn = 0;
  let fn = 0;
  for (const s of SCORES) {
    const pred = s.score >= thr ? 1 : 0;
    if (s.label === 1 && pred === 1) tp++;
    else if (s.label === 0 && pred === 1) fp++;
    else if (s.label === 0 && pred === 0) tn++;
    else fn++;
  }
  const prec = tp + fp > 0 ? tp / (tp + fp) : 0;
  const rec = tp + fn > 0 ? tp / (tp + fn) : 0;
  const f1 = prec + rec > 0 ? (2 * prec * rec) / (prec + rec) : 0;
  const tpr = N_POS > 0 ? tp / N_POS : 0;
  const fpr = N_NEG > 0 ? fp / N_NEG : 0;
  return { tp, fp, tn, fn, prec, rec, f1, tpr, fpr };
}

function rocPath(): { fpr: number; tpr: number; thr: number }[] {
  const thresholds = Array.from({ length: 51 }, (_, i) => 1 - i * 0.02);
  return thresholds.map((thr) => {
    const m = metricsAtThreshold(thr);
    return { fpr: m.fpr, tpr: m.tpr, thr };
  });
}

const ROC_PATH = rocPath();
const AUC = (() => {
  // Trapezoidal AUC
  let area = 0;
  for (let i = 1; i < ROC_PATH.length; i++) {
    const x1 = ROC_PATH[i - 1].fpr;
    const x2 = ROC_PATH[i].fpr;
    const y1 = ROC_PATH[i - 1].tpr;
    const y2 = ROC_PATH[i].tpr;
    area += ((x2 - x1) * (y1 + y2)) / 2;
  }
  return area;
})();

function RocThresholdDemo() {
  const [thr, setThr] = useState(0.5);
  const m = useMemo(() => metricsAtThreshold(thr), [thr]);

  const W = 280;
  const H = 240;
  const PAD = 35;
  const sx = (v: number) => PAD + v * (W - 2 * PAD);
  const sy = (v: number) => H - PAD - v * (H - 2 * PAD);

  // Histogram for score distributions
  const HW = 280;
  const HH = 120;
  const HPAD = 25;
  const buckets = 20;
  const hist0 = new Array(buckets).fill(0);
  const hist1 = new Array(buckets).fill(0);
  for (const s of SCORES) {
    const i = Math.min(buckets - 1, Math.floor(s.score * buckets));
    if (s.label === 0) hist0[i]++;
    else hist1[i]++;
  }
  const maxBucket = Math.max(...hist0, ...hist1, 1);

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center gap-3">
        <label className="text-xs text-muted-foreground whitespace-nowrap">
          Terskel: {thr.toFixed(2)}
        </label>
        <input
          type="range"
          min={0}
          max={1}
          step={0.02}
          value={thr}
          onChange={(e) => setThr(parseFloat(e.target.value))}
          className="flex-1"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* ROC */}
        <div>
          <div className="text-xs font-semibold mb-1">
            ROC — AUC = {AUC.toFixed(3)}
          </div>
          <svg width={W} height={H} className="block">
            <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#888" />
            <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="#888" />
            {/* Diagonal = random */}
            <line
              x1={sx(0)}
              y1={sy(0)}
              x2={sx(1)}
              y2={sy(1)}
              stroke="#666"
              strokeDasharray="3 3"
            />
            {/* ROC path */}
            <path
              d={ROC_PATH.map((p, i) =>
                `${i === 0 ? "M" : "L"} ${sx(p.fpr)} ${sy(p.tpr)}`,
              ).join(" ")}
              fill="none"
              stroke="#3b82f6"
              strokeWidth={2}
            />
            {/* Current threshold point */}
            <circle cx={sx(m.fpr)} cy={sy(m.tpr)} r={6} fill="#facc15" stroke="#000" />
            <text x={PAD - 5} y={PAD + 8} fontSize={10} fill="#888" textAnchor="end">
              TPR
            </text>
            <text x={W - PAD} y={H - PAD + 14} fontSize={10} fill="#888" textAnchor="end">
              FPR
            </text>
          </svg>
        </div>

        {/* Metrics */}
        <div className="text-xs space-y-2">
          <div className="rounded-lg border border-border bg-background p-3">
            <div className="text-muted-foreground font-semibold mb-1">Forvirringsmatrise</div>
            <table className="w-full">
              <tbody>
                <tr>
                  <td className="py-0.5 text-muted-foreground">TP {m.tp}</td>
                  <td className="py-0.5 text-muted-foreground">FN {m.fn}</td>
                </tr>
                <tr>
                  <td className="py-0.5 text-muted-foreground">FP {m.fp}</td>
                  <td className="py-0.5 text-muted-foreground">TN {m.tn}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="rounded-lg border border-border bg-background p-3">
            <div>Precision: <span className="font-mono">{m.prec.toFixed(3)}</span></div>
            <div>Recall: <span className="font-mono">{m.rec.toFixed(3)}</span></div>
            <div>F1: <span className="font-mono">{m.f1.toFixed(3)}</span></div>
            <div className="text-muted-foreground mt-1">
              TPR: {m.tpr.toFixed(3)} · FPR: {m.fpr.toFixed(3)}
            </div>
          </div>
        </div>
      </div>

      {/* Score histograms */}
      <div>
        <div className="text-xs font-semibold mb-1">Score-fordelinger</div>
        <svg width={HW} height={HH} className="block w-full">
          <line x1={HPAD} y1={HH - HPAD} x2={HW - 5} y2={HH - HPAD} stroke="#888" />
          {hist0.map((n, i) => {
            const w = (HW - HPAD - 5) / buckets;
            const h = (n / maxBucket) * (HH - HPAD - 10);
            return (
              <rect
                key={`n${i}`}
                x={HPAD + i * w}
                y={HH - HPAD - h}
                width={w - 1}
                height={h}
                fill="rgba(244,63,94,0.6)"
              />
            );
          })}
          {hist1.map((n, i) => {
            const w = (HW - HPAD - 5) / buckets;
            const h = (n / maxBucket) * (HH - HPAD - 10);
            return (
              <rect
                key={`p${i}`}
                x={HPAD + i * w + 1}
                y={HH - HPAD - h}
                width={w - 2}
                height={h}
                fill="rgba(59,130,246,0.6)"
              />
            );
          })}
          {/* Threshold line */}
          <line
            x1={HPAD + thr * (HW - HPAD - 5)}
            y1={5}
            x2={HPAD + thr * (HW - HPAD - 5)}
            y2={HH - HPAD}
            stroke="#facc15"
            strokeWidth={2}
            strokeDasharray="4 3"
          />
          <text x={HPAD - 3} y={HH - HPAD + 12} fontSize={9} fill="#888" textAnchor="end">
            0
          </text>
          <text x={HW - 5} y={HH - HPAD + 12} fontSize={9} fill="#888" textAnchor="end">
            1
          </text>
        </svg>
        <div className="text-xs text-muted-foreground mt-1 flex gap-4">
          <span><span className="inline-block w-3 h-3 align-middle mr-1 bg-rose-500/60"></span>Klasse 0</span>
          <span><span className="inline-block w-3 h-3 align-middle mr-1 bg-blue-500/60"></span>Klasse 1</span>
          <span><span className="inline-block w-3 h-3 align-middle mr-1 bg-yellow-400"></span>Terskel</span>
        </div>
      </div>
    </div>
  );
}
