import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";

const STEPS = [
  { title: "Hva EDA er, og hvorfor", anchor: "hva" },
  { title: "df.info() og df.describe()", anchor: "describe" },
  { title: "Fordelinger — histogram", anchor: "fordelinger" },
  { title: "Korrelasjonsmatrise", anchor: "korr" },
  { title: "Pairplot — alt mot alt", anchor: "pairplot" },
  { title: "Missing data — fang og fyll", anchor: "missing" },
  { title: "Interaktiv: last CSV", anchor: "csv" },
  { title: "EDA-sjekkliste", anchor: "sjekkliste" },
];

export function Dte2602EdaPandasPage() {
  return (
    <StackPageShell title="DTE-2602 · EDA i pandas" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2602 · Dataforståelse
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            EDA — Exploratory Data Analysis med pandas
          </h1>
          <p className="mt-3 text-muted-foreground">
            Før du trener noe som helst: forstå dataen. EDA-fasen finner skjeve
            fordelinger, manglende verdier, sterke korrelasjoner og uventede
            kategorier. Mappeoppgaven din står og faller på dette.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Kjør selv:</span>{" "}
              <Link to="/python" className="text-brand hover:underline">/python</Link>{" "}
              har sklearn-øvelser merket «DTE-2602» der du gjør EDA på iris og titanic.
            </div>
          </div>
        </div>

        <CourseOutline courseId="dte2602-eda-pandas" steps={STEPS} />

        <Section number="1" id="hva" title="Hva EDA er, og hvorfor">
          <p className="text-sm text-foreground mb-3">
            EDA (Exploratory Data Analysis, eller utforskende dataanalyse) er fasen
            der du «blir kjent med dataen». Du svarer på:
          </p>
          <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1 mb-3">
            <li>Hvor mange rader/kolonner? Hvilke datatyper?</li>
            <li>Hvilke kolonner har manglende verdier (NaN), og hvor mye?</li>
            <li>Hvordan ser fordelingen ut per kolonne — normal, skjev, multimodal?</li>
            <li>Hvilke kolonner korrelerer sterkt — er noen redundante?</li>
            <li>Finnes outliers? Er klassebalansen skjev?</li>
          </ul>
          <p className="text-sm text-muted-foreground">
            Konkrete eksempler følger med pandas-kode og figur-beskrivelser.
          </p>
        </Section>

        <Section number="2" id="describe" title="df.info() og df.describe()">
          <p className="text-sm text-muted-foreground mb-3">
            To kommandoer du kjører <em>først</em> på hvert nytt datasett:
          </p>
          <pre className="rounded-xl border border-border bg-card p-4 font-mono text-xs overflow-x-auto whitespace-pre">{`import pandas as pd

df = pd.read_csv("titanic.csv")

df.info()
# RangeIndex: 891 entries
# Data columns (total 12 columns):
#  #   Column    Non-Null Count  Dtype
#  0   Survived  891 non-null    int64
#  1   Pclass    891 non-null    int64
#  2   Sex       891 non-null    object   <-- kategorisk
#  3   Age       714 non-null    float64  <-- 177 mangler!
# ...

df.describe()
#              Age        Fare
# count  714.0000  891.0000
# mean    29.6991   32.2042
# std     14.5265   49.6934
# min      0.4200    0.0000
# 25%     20.1250    7.9104
# 50%     28.0000   14.4542
# 75%     38.0000   31.0000
# max     80.0000  512.3292`}</pre>
          <p className="text-sm text-muted-foreground mt-3">
            <code>info()</code> avslører manglende verdier per kolonne og dtype.{" "}
            <code>describe()</code> gir tallenes fordeling. For kategoriske kolonner
            bruk <code>df.describe(include="object")</code> eller{" "}
            <code>df["Sex"].value_counts()</code>.
          </p>
        </Section>

        <Section number="3" id="fordelinger" title="Fordelinger — histogram per kolonne">
          <p className="text-sm text-muted-foreground mb-3">
            Histogrammet er det første visuelle du tegner. Fordelingens form forteller
            deg om du må transformere (log, Box-Cox), skalere (StandardScaler), eller
            håndtere outliers.
          </p>
          <pre className="rounded-xl border border-border bg-card p-4 font-mono text-xs overflow-x-auto whitespace-pre">{`import matplotlib.pyplot as plt
import seaborn as sns

# Alle numeriske kolonner i én figur:
df.hist(bins=30, figsize=(12, 8))
plt.tight_layout()
plt.show()

# Én kolonne med KDE-overlay:
sns.histplot(df["Age"].dropna(), kde=True, bins=30)`}</pre>
          <ul className="text-xs text-muted-foreground list-disc pl-5 mt-3 space-y-1">
            <li><strong>Symmetrisk klokke</strong> → ofte fint som det er.</li>
            <li><strong>Høyreskjev</strong> (lang hale mot høyre, f.eks. inntekt) → vurder <code>np.log1p(x)</code>.</li>
            <li><strong>Multimodal</strong> (flere topper) → ofte gjemmer det seg en undergruppe — vurder å lage en kategorisk kolonne.</li>
          </ul>
        </Section>

        <Section number="4" id="korr" title="Korrelasjonsmatrise">
          <p className="text-sm text-muted-foreground mb-3">
            Korrelasjonsmatrisen viser parvise lineære sammenhenger. Verdier nær +1
            eller -1 betyr sterk korrelasjon. Sterk korrelasjon mellom features kan
            skape problemer for noen modeller (multikollinearitet i lineær regresjon).
          </p>
          <pre className="rounded-xl border border-border bg-card p-4 font-mono text-xs overflow-x-auto whitespace-pre">{`corr = df.corr(numeric_only=True)

sns.heatmap(corr, annot=True, cmap="coolwarm",
            vmin=-1, vmax=1, fmt=".2f")`}</pre>
          <CorrelationHeatmap />
          <p className="text-xs text-muted-foreground mt-3">
            <strong>NB:</strong> korrelasjon fanger bare lineære sammenhenger.
            To variabler kan ha sterk ikke-lineær avhengighet og korrelasjon ≈ 0.
            Bruk pairplot for å se selve formen.
          </p>
        </Section>

        <Section number="5" id="pairplot" title="Pairplot — alt mot alt">
          <p className="text-sm text-muted-foreground mb-3">
            <code>sns.pairplot(df, hue="target")</code> tegner et scatter-plot for
            hvert par av numeriske kolonner. Diagonalen viser histogram per kolonne.
            Farger man etter target ser du visuelt om klasser er separerbare.
          </p>
          <pre className="rounded-xl border border-border bg-card p-4 font-mono text-xs overflow-x-auto whitespace-pre">{`from sklearn.datasets import load_iris

iris = load_iris(as_frame=True)
df = iris.frame
df["target"] = df["target"].map(dict(enumerate(iris.target_names)))

sns.pairplot(df, hue="target", diag_kind="kde")`}</pre>
          <p className="text-xs text-muted-foreground mt-3">
            For iris ser du tydelig at <code>petal length</code> og{" "}
            <code>petal width</code> alene klarer å skille setosa fra resten — et
            beslutningstre kan løse det med ett split.
          </p>
        </Section>

        <Section number="6" id="missing" title="Missing data — fang og fyll">
          <pre className="rounded-xl border border-border bg-card p-4 font-mono text-xs overflow-x-auto whitespace-pre">{`# Hvor mange mangler per kolonne?
df.isna().sum()

# Andel:
df.isna().mean() * 100

# Visuell heatmap (svart = mangler):
import seaborn as sns
sns.heatmap(df.isna(), cbar=False)

# Tre strategier:
# 1) Drop kolonne hvis > 50% mangler
df = df.drop(columns=["Cabin"])

# 2) Drop rader hvis få mangler
df = df.dropna(subset=["Embarked"])

# 3) Imputér (fyll inn) med median/modus
from sklearn.impute import SimpleImputer
imp = SimpleImputer(strategy="median")
df["Age"] = imp.fit_transform(df[["Age"]])`}</pre>
          <p className="text-sm text-muted-foreground mt-3">
            <strong>Datalekkasje-fellen:</strong> hvis du imputér <em>før</em> du
            splitter til train/test, lekker du test-statistikk inn i trening. Bruk
            alltid imputer-en inne i en sklearn <code>Pipeline</code>.
          </p>
        </Section>

        <Section number="7" id="csv" title="Interaktiv: dropp en CSV inn">
          <p className="text-sm text-muted-foreground mb-3">
            Last opp en CSV-fil under, så genereres et histogram per kolonne og en
            korrelasjonsmatrise direkte i nettleseren — samme tabeller du ville fått
            av <code>df.hist()</code> og <code>df.corr()</code>.
          </p>
          <CsvDropArea />
        </Section>

        <Section number="8" id="sjekkliste" title="EDA-sjekkliste til mappeoppgaven">
          <ul className="text-sm text-foreground space-y-1.5">
            <li>1. <code>df.shape</code>, <code>df.info()</code>, <code>df.head()</code></li>
            <li>2. <code>df.describe()</code> + <code>df.describe(include="object")</code></li>
            <li>3. <code>df.isna().sum()</code> + visuell heatmap</li>
            <li>4. Histogram per numerisk kolonne</li>
            <li>5. <code>value_counts()</code> per kategorisk kolonne</li>
            <li>6. Klassebalanse: <code>df["target"].value_counts(normalize=True)</code></li>
            <li>7. Korrelasjonsmatrise (heatmap)</li>
            <li>8. Pairplot eller scatter-matrise farget på target</li>
            <li>9. Boxplot per kolonne for å se outliers</li>
            <li>10. Konkluder: hvilke kolonner trenger transformasjon? Skalering? Drop?</li>
          </ul>
        </Section>
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

/* ---------- Visual 1: Korrelasjons-heatmap (statisk demo-data) ---------- */

const CORR_LABELS = ["Pclass", "Age", "SibSp", "Fare", "Survived"];
const CORR_MATRIX = [
  [1.0, -0.37, 0.08, -0.55, -0.34],
  [-0.37, 1.0, -0.31, 0.1, -0.08],
  [0.08, -0.31, 1.0, 0.16, -0.04],
  [-0.55, 0.1, 0.16, 1.0, 0.26],
  [-0.34, -0.08, -0.04, 0.26, 1.0],
];

function colorForCorr(v: number): string {
  // Diverging blue (negative) → white (0) → red (positive)
  const a = Math.min(1, Math.abs(v));
  if (v >= 0) {
    // white -> red
    const r = 255;
    const g = Math.round(255 - 180 * a);
    const b = Math.round(255 - 180 * a);
    return `rgb(${r}, ${g}, ${b})`;
  }
  const r = Math.round(255 - 180 * a);
  const g = Math.round(255 - 180 * a);
  const b = 255;
  return `rgb(${r}, ${g}, ${b})`;
}

function CorrelationHeatmap() {
  return (
    <div className="mt-3 rounded-xl border border-border bg-card p-4 overflow-x-auto">
      <div className="text-xs text-muted-foreground mb-2">
        Eksempel-heatmap fra titanic — rødt = positiv korrelasjon, blått = negativ.
      </div>
      <table className="text-xs font-mono">
        <thead>
          <tr>
            <th className="px-2 py-1"></th>
            {CORR_LABELS.map((l) => (
              <th key={l} className="px-2 py-1 text-center font-semibold">
                {l}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {CORR_MATRIX.map((row, i) => (
            <tr key={i}>
              <td className="px-2 py-1 font-semibold pr-3">{CORR_LABELS[i]}</td>
              {row.map((v, j) => (
                <td
                  key={j}
                  className="px-2 py-1 text-center border border-border min-w-[3.5rem]"
                  style={{ backgroundColor: colorForCorr(v), color: "#111" }}
                >
                  {v.toFixed(2)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- Visual 2: CSV-drop som beregner histogrammer og korrelasjoner ---------- */

type CsvData = {
  columns: string[];
  rows: number[][]; // Only numeric columns are kept
  numericColumns: string[];
};

function parseCsv(text: string): CsvData {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return { columns: [], rows: [], numericColumns: [] };
  const sep = lines[0].includes("\t") ? "\t" : lines[0].includes(";") ? ";" : ",";
  const headers = lines[0].split(sep).map((h) => h.trim());
  const dataRows = lines.slice(1).map((l) => l.split(sep).map((c) => c.trim()));
  // Detect numeric columns
  const numericIdx: number[] = [];
  headers.forEach((_, j) => {
    let count = 0;
    let numeric = 0;
    for (const row of dataRows) {
      if (row[j] === undefined || row[j] === "") continue;
      count++;
      if (!Number.isNaN(parseFloat(row[j]))) numeric++;
    }
    if (count > 0 && numeric / count > 0.8) numericIdx.push(j);
  });
  const numericColumns = numericIdx.map((j) => headers[j]);
  const rows = dataRows
    .map((row) =>
      numericIdx.map((j) => {
        const v = parseFloat(row[j]);
        return Number.isNaN(v) ? NaN : v;
      }),
    )
    .filter((r) => r.some((v) => !Number.isNaN(v)));
  return { columns: headers, rows, numericColumns };
}

function histogramBuckets(values: number[], buckets = 12): { x: string; n: number }[] {
  const clean = values.filter((v) => !Number.isNaN(v));
  if (clean.length === 0) return [];
  const min = Math.min(...clean);
  const max = Math.max(...clean);
  if (min === max) return [{ x: min.toFixed(2), n: clean.length }];
  const w = (max - min) / buckets;
  const counts = new Array(buckets).fill(0);
  for (const v of clean) {
    const idx = Math.min(buckets - 1, Math.floor((v - min) / w));
    counts[idx]++;
  }
  return counts.map((n, i) => ({
    x: `${(min + i * w).toFixed(1)}`,
    n,
  }));
}

function pearson(a: number[], b: number[]): number {
  const pairs: [number, number][] = [];
  for (let i = 0; i < a.length; i++) {
    if (!Number.isNaN(a[i]) && !Number.isNaN(b[i])) pairs.push([a[i], b[i]]);
  }
  if (pairs.length < 3) return 0;
  const n = pairs.length;
  const ma = pairs.reduce((s, [x]) => s + x, 0) / n;
  const mb = pairs.reduce((s, [, y]) => s + y, 0) / n;
  let num = 0;
  let da = 0;
  let db = 0;
  for (const [x, y] of pairs) {
    num += (x - ma) * (y - mb);
    da += (x - ma) ** 2;
    db += (y - mb) ** 2;
  }
  const denom = Math.sqrt(da * db);
  return denom === 0 ? 0 : num / denom;
}

const DEMO_CSV = `length,width,depth,price
1.2,0.6,0.4,150
1.5,0.7,0.5,210
2.0,0.9,0.6,330
0.8,0.4,0.3,90
1.7,0.8,0.5,260
2.2,1.0,0.7,400
1.0,0.5,0.3,110
1.9,0.9,0.6,310
2.5,1.1,0.8,480
1.3,0.6,0.4,170`;

function CsvDropArea() {
  const [data, setData] = useState<CsvData | null>(null);
  const [filename, setFilename] = useState<string>("");

  const onFile = (file: File) => {
    setFilename(file.name);
    file.text().then((t) => setData(parseCsv(t)));
  };

  const tryDemo = () => {
    setFilename("demo.csv");
    setData(parseCsv(DEMO_CSV));
  };

  const corr = useMemo(() => {
    if (!data) return [];
    const cols = data.numericColumns;
    const colData = cols.map((_, j) => data.rows.map((r) => r[j]));
    return cols.map((_, i) => cols.map((_, j) => pearson(colData[i], colData[j])));
  }, [data]);

  return (
    <div className="rounded-xl border border-dashed border-border bg-card p-5">
      <label
        className="flex flex-col items-center justify-center gap-2 rounded-lg border border-border bg-background p-6 text-sm cursor-pointer hover:border-brand/50 transition-colors"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const f = e.dataTransfer.files?.[0];
          if (f) onFile(f);
        }}
      >
        <span className="text-muted-foreground">
          Slipp en CSV-fil her, eller klikk for å velge.
        </span>
        <input
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
          }}
        />
        <button
          type="button"
          className="mt-1 text-xs text-brand hover:underline"
          onClick={(e) => {
            e.preventDefault();
            tryDemo();
          }}
        >
          Eller: bruk demo-data
        </button>
      </label>

      {data && data.numericColumns.length > 0 && (
        <div className="mt-4 space-y-4">
          <div className="text-xs text-muted-foreground">
            <strong>{filename}</strong> — {data.rows.length} rader,{" "}
            {data.numericColumns.length} numeriske kolonner.
          </div>

          {/* Histograms */}
          <div>
            <h3 className="text-sm font-semibold mb-2">Histogrammer</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {data.numericColumns.map((col, j) => {
                const buckets = histogramBuckets(
                  data.rows.map((r) => r[j]),
                  10,
                );
                const max = Math.max(...buckets.map((b) => b.n), 1);
                return (
                  <div
                    key={col}
                    className="rounded-lg border border-border bg-background p-3"
                  >
                    <div className="text-xs font-mono mb-1">{col}</div>
                    <div className="flex items-end gap-0.5 h-20">
                      {buckets.map((b, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-brand/60 rounded-t"
                          style={{ height: `${(b.n / max) * 100}%` }}
                          title={`${b.x}: ${b.n}`}
                        />
                      ))}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-1">
                      Min: {Math.min(...buckets.map((b) => parseFloat(b.x))).toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Correlation heatmap */}
          <div>
            <h3 className="text-sm font-semibold mb-2">Korrelasjon</h3>
            <div className="overflow-x-auto">
              <table className="text-xs font-mono">
                <thead>
                  <tr>
                    <th className="px-2 py-1"></th>
                    {data.numericColumns.map((c) => (
                      <th key={c} className="px-2 py-1 text-center font-semibold">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {corr.map((row, i) => (
                    <tr key={i}>
                      <td className="px-2 py-1 font-semibold pr-3">
                        {data.numericColumns[i]}
                      </td>
                      {row.map((v, j) => (
                        <td
                          key={j}
                          className="px-2 py-1 text-center border border-border min-w-[3rem]"
                          style={{ backgroundColor: colorForCorr(v), color: "#111" }}
                        >
                          {v.toFixed(2)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {data && data.numericColumns.length === 0 && (
        <p className="text-xs text-muted-foreground mt-3">
          Fant ingen numeriske kolonner i filen.
        </p>
      )}
    </div>
  );
}
