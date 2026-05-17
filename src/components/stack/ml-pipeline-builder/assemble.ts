import { OPTIONS } from "./options";
import type { AppOption } from "./types";

/**
 * Resolverer transitive `requires`-avhengigheter. Hvis bruker velger
 * `tune-grid` aktiveres `cv-stratified-kfold` automatisk.
 */
export function resolveRequires(selected: Set<string>): Set<string> {
  const byId = new Map(OPTIONS.map((o) => [o.id, o]));
  const result = new Set(selected);
  let changed = true;
  while (changed) {
    changed = false;
    for (const id of Array.from(result)) {
      const opt = byId.get(id);
      if (!opt?.requires) continue;
      for (const req of opt.requires) {
        if (!result.has(req)) {
          result.add(req);
          changed = true;
        }
      }
    }
  }
  return result;
}

/** Finn options som er i konflikt med valgte. */
export function findConflicts(selected: Set<string>): { a: string; b: string }[] {
  const conflicts: { a: string; b: string }[] = [];
  const byId = new Map(OPTIONS.map((o) => [o.id, o]));
  for (const id of selected) {
    const opt = byId.get(id);
    if (!opt?.conflicts) continue;
    for (const c of opt.conflicts) {
      if (selected.has(c) && id < c) conflicts.push({ a: id, b: c });
    }
  }
  return conflicts;
}

interface Sections {
  imports: Set<string>;
  datasetBlock: string;
  numericCols: string[];
  categoricalCols: string[];
  isBinary: boolean;
  /** Pre-step-listen blir brukt enten direkte i Pipeline (kun numerisk) eller
   *  inni ColumnTransformer (numerisk-pipeline). */
  numericSteps: { name: string; expr: string }[];
  hasOneHot: boolean;
  hasImputerMean: boolean;
  hasImputerMedian: boolean;
  hasColumnTransformer: boolean;
  modelExpr: string;
  paramGrid: string;
  splitBlock: string;
  cvBlock: string;
  tuningBlock: string;
  evalBlocks: string[];
  outputBlocks: string[];
}

function emptySections(): Sections {
  return {
    imports: new Set(),
    datasetBlock: "",
    numericCols: [],
    categoricalCols: [],
    isBinary: false,
    numericSteps: [],
    hasOneHot: false,
    hasImputerMean: false,
    hasImputerMedian: false,
    hasColumnTransformer: false,
    modelExpr: "",
    paramGrid: "",
    splitBlock: "",
    cvBlock: "",
    tuningBlock: "",
    evalBlocks: [],
    outputBlocks: [],
  };
}

function ingest(sec: Sections, opt: AppOption): void {
  const c = opt.contributes;
  if (c.imports) for (const i of c.imports) sec.imports.add(i);
  if (c.dataset) sec.datasetBlock = c.dataset;
  if (c.datasetInfo) {
    sec.numericCols = c.datasetInfo.numericCols ?? [];
    sec.categoricalCols = c.datasetInfo.categoricalCols ?? [];
    sec.isBinary = !!c.datasetInfo.binary;
  }
  if (c.preprocSteps) sec.numericSteps.push(...c.preprocSteps);
  if (opt.id === "pre-onehot") sec.hasOneHot = true;
  if (opt.id === "pre-impute-mean") sec.hasImputerMean = true;
  if (opt.id === "pre-impute-median") sec.hasImputerMedian = true;
  if (opt.id === "pre-column-transformer") sec.hasColumnTransformer = true;
  if (c.modelExpr) sec.modelExpr = c.modelExpr;
  if (c.paramGrid) sec.paramGrid = c.paramGrid;
  if (c.splitBlock) sec.splitBlock = c.splitBlock;
  if (c.cvBlock) sec.cvBlock = c.cvBlock;
  if (c.tuningBlock) sec.tuningBlock = c.tuningBlock;
  if (c.evalBlocks) sec.evalBlocks.push(...c.evalBlocks);
  if (c.outputBlocks) sec.outputBlocks.push(...c.outputBlocks);
}

/** Lager en Python-liste av kolonnenavn. */
function pyList(items: string[]): string {
  return `[${items.map((i) => JSON.stringify(i)).join(", ")}]`;
}

/** Hjelp: numeriske og kategoriske kolonne-uttrykk for ColumnTransformer. */
function colsExpr(cols: string[], fallback: string): string {
  if (cols.length === 1 && cols[0] === "__ALL_NUMERIC__") {
    return "X.select_dtypes(include='number').columns.tolist()";
  }
  if (cols.length === 1 && cols[0] === "__DYN_NUMERIC__") return "NUMERIC_COLS";
  if (cols.length === 1 && cols[0] === "__DYN_CATEGORICAL__") return "CATEGORICAL_COLS";
  if (cols.length === 0) return fallback;
  return pyList(cols);
}

/**
 * Hovedfunksjon: ta sett av valgte option-id-er, returner ferdig
 * sklearn-script. `selected` skal allerede være kjørt gjennom
 * resolveRequires.
 */
export function assemble(selected: Set<string>): string {
  const sec = emptySections();

  // Iterer i deklarert rekkefølge for konsistent output uansett klikk-orden.
  for (const opt of OPTIONS) {
    if (selected.has(opt.id)) ingest(sec, opt);
  }

  // Defaults hvis bruker har slått av alt i en radio-kategori.
  if (!sec.datasetBlock) {
    sec.datasetBlock = `# Ingen datasett valgt — fallback til Iris
from sklearn.datasets import load_iris
data = load_iris(as_frame=True)
X, y = data.data, data.target`;
    sec.imports.add("from sklearn.datasets import load_iris");
  }
  if (!sec.modelExpr) {
    sec.modelExpr = "LogisticRegression(max_iter=1000, random_state=42)";
    sec.imports.add("from sklearn.linear_model import LogisticRegression");
  }
  if (!sec.splitBlock) {
    sec.splitBlock = `X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)`;
    sec.imports.add("from sklearn.model_selection import train_test_split");
  }

  // Pipeline trengs alltid for å lime sammen preprocessing + model.
  sec.imports.add("from sklearn.pipeline import Pipeline");

  // ===== Bygg preprocessor =====
  const useColTrans = sec.hasColumnTransformer && (sec.categoricalCols.length > 0 || sec.hasOneHot);
  let preprocessorBlock = "";
  if (useColTrans) {
    sec.imports.add("from sklearn.compose import ColumnTransformer");
    if (sec.hasOneHot) sec.imports.add("from sklearn.preprocessing import OneHotEncoder");

    const numSteps: string[] = [];
    if (sec.hasImputerMean || sec.hasImputerMedian) {
      const strat = sec.hasImputerMedian ? "median" : "mean";
      sec.imports.add("from sklearn.impute import SimpleImputer");
      numSteps.push(`        ("imputer", SimpleImputer(strategy="${strat}"))`);
    }
    for (const s of sec.numericSteps) {
      numSteps.push(`        (${JSON.stringify(s.name)}, ${s.expr})`);
    }
    if (numSteps.length === 0) {
      // Pipeline må ha minst ett steg
      sec.imports.add("from sklearn.preprocessing import StandardScaler");
      numSteps.push(`        ("scaler", StandardScaler())`);
    }

    const catStepsLines: string[] = [];
    if (sec.hasImputerMean || sec.hasImputerMedian) {
      sec.imports.add("from sklearn.impute import SimpleImputer");
      catStepsLines.push(`        ("imputer", SimpleImputer(strategy="most_frequent"))`);
    }
    catStepsLines.push(`        ("onehot", OneHotEncoder(handle_unknown="ignore"))`);

    preprocessorBlock = `numeric_pipe = Pipeline(steps=[
${numSteps.join(",\n")},
])

categorical_pipe = Pipeline(steps=[
${catStepsLines.join(",\n")},
])

preprocessor = ColumnTransformer(transformers=[
    ("num", numeric_pipe, ${colsExpr(sec.numericCols, "[]")}),
    ("cat", categorical_pipe, ${colsExpr(sec.categoricalCols, "[]")}),
])`;
  } else {
    // Enkel pipeline: bare numerisk-preprocessing inline
    const steps: string[] = [];
    if (sec.hasImputerMean || sec.hasImputerMedian) {
      const strat = sec.hasImputerMedian ? "median" : "mean";
      sec.imports.add("from sklearn.impute import SimpleImputer");
      steps.push(`    ("imputer", SimpleImputer(strategy="${strat}"))`);
    }
    for (const s of sec.numericSteps) {
      steps.push(`    (${JSON.stringify(s.name)}, ${s.expr})`);
    }
    if (steps.length === 0) {
      preprocessorBlock = "# (ingen preprocessor valgt — modellen får X direkte)";
    } else {
      preprocessorBlock = `preprocessor = Pipeline(steps=[
${steps.join(",\n")},
])`;
    }
  }

  // ===== Bygg full pipeline =====
  const hasPre =
    useColTrans ||
    sec.numericSteps.length > 0 ||
    sec.hasImputerMean ||
    sec.hasImputerMedian;
  const pipeBlock = hasPre
    ? `pipe = Pipeline(steps=[
    ("preprocessor", preprocessor),
    ("model", ${sec.modelExpr}),
])`
    : `pipe = Pipeline(steps=[
    ("model", ${sec.modelExpr}),
])`;

  // ===== Sett sammen output =====
  const out: string[] = [];
  out.push(
    "# =====================================================================",
    "# scikit-learn-pipeline — generert av ML Pipeline Builder",
    "# =====================================================================",
    "",
  );

  // Imports — stdlib først, så pandas/numpy, så sklearn, så matplotlib.
  const imports = Array.from(sec.imports);
  imports.sort((a, b) => {
    const ord = (s: string) => {
      if (s.startsWith("import pandas") || s.startsWith("import numpy")) return 1;
      if (s.includes("sklearn")) return 2;
      if (s.includes("matplotlib")) return 3;
      return 0;
    };
    return ord(a) - ord(b) || a.localeCompare(b);
  });
  out.push(...imports, "");

  // 1) Datasett
  out.push(sec.datasetBlock, "");

  // 2) Preprocessor
  out.push("# === Preprocessor ===");
  out.push(preprocessorBlock, "");

  // 3) Param-grid (kun ved tuning)
  if (sec.tuningBlock) {
    out.push("# === Param-grid for tuning ===");
    out.push(
      `PARAM_GRID = ${sec.paramGrid || `{
    # Ingen grid definert for valgt modell
}`}`,
    );
    out.push("");
  }

  // 4) Pipeline
  out.push("# === Full pipeline ===");
  out.push(pipeBlock, "");

  // 5) Split
  out.push("# === Train/test-split ===");
  out.push(sec.splitBlock, "");

  // 6) CV-objekt
  if (sec.cvBlock) {
    out.push("# === Kryssvalidering ===");
    out.push(sec.cvBlock, "");
  }

  // 7) Tuning ELLER vanlig fit
  if (sec.tuningBlock) {
    out.push(sec.tuningBlock, "");
  } else {
    out.push("# === Tren modellen ===");
    out.push("pipe.fit(X_train, y_train)", "");
  }

  // 8) Prediksjon
  out.push("# === Prediksjon på test-sett ===");
  out.push("y_pred = pipe.predict(X_test)", "");

  // 9) Evaluering
  if (sec.evalBlocks.length > 0) {
    out.push("# === Evaluering ===");
    out.push(sec.evalBlocks.join("\n\n"), "");
  }

  // 10) Output-format-tillegg
  if (sec.outputBlocks.length > 0) {
    out.push("# === Output-format ===");
    out.push(sec.outputBlocks.join("\n\n"), "");
  }

  return out.join("\n");
}
