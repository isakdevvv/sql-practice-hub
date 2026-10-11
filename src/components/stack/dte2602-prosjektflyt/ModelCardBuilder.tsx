import { useMemo, useState } from "react";
import { Copy, RotateCcw, Check } from "lucide-react";

// --------------------------------------------------------------------------
// ModelCardBuilder — studenten fyller inn et lite skjema (problem, data,
// modell, metrikker, begrensninger, etiske aspekter) og ser en
// live-render av en kompakt model-card. Knapp for å kopiere til markdown.
//
// Pedagogikk: én ting er å lese «en model-card bør inneholde X»;
// en annen er å oppdage hvor mye man IKKE har tenkt på når feltene står
// tomme. Det er det denne komponenten gjør synlig.
// --------------------------------------------------------------------------

type FieldKey =
  | "name"
  | "problem"
  | "useCase"
  | "data"
  | "split"
  | "model"
  | "metricName"
  | "metricValue"
  | "baseline"
  | "limitations"
  | "ethics";

type Field = {
  key: FieldKey;
  label: string;
  placeholder: string;
  multiline?: boolean;
  required?: boolean;
};

const FIELDS: Field[] = [
  {
    key: "name",
    label: "Modell-navn",
    placeholder: "f.eks. titanic-logreg-v1",
    required: true,
  },
  {
    key: "problem",
    label: "Problem",
    placeholder: "Binær klassifikasjon: overlevde passasjeren?",
    required: true,
  },
  {
    key: "useCase",
    label: "Intendert bruk",
    placeholder: "Pedagogisk demo. Skal IKKE brukes til å predikere reell overlevelse.",
    multiline: true,
    required: true,
  },
  {
    key: "data",
    label: "Datakilde + størrelse",
    placeholder: "seaborn titanic (891 rader, 11 features) — historisk passasjerliste.",
    required: true,
  },
  {
    key: "split",
    label: "Train/test-split",
    placeholder: "80/20 stratifisert på y, random_state=42",
  },
  {
    key: "model",
    label: "Modell-arkitektur",
    placeholder: "LogisticRegression(max_iter=1000) inni Pipeline(StandardScaler+OneHot).",
    required: true,
  },
  {
    key: "metricName",
    label: "Primær metrikk",
    placeholder: "F1 (macro)",
    required: true,
  },
  {
    key: "metricValue",
    label: "Score på test",
    placeholder: "0.81",
    required: true,
  },
  {
    key: "baseline",
    label: "Baseline-score",
    placeholder: "DummyClassifier(most_frequent) = 0.40",
  },
  {
    key: "limitations",
    label: "Begrensninger",
    placeholder: "Trenet på data fra én historisk hendelse (1912). Skjev kjønnsfordeling i klassene.",
    multiline: true,
    required: true,
  },
  {
    key: "ethics",
    label: "Etiske aspekter",
    placeholder: "Kjønn brukes som feature og dominerer prediksjonen. Ikke akseptabelt i ekte oppgaver om utfall.",
    multiline: true,
    required: true,
  },
];

const EXAMPLE: Record<FieldKey, string> = {
  name: "titanic-logreg-v1",
  problem: "Binær klassifikasjon: predikere om en passasjer overlevde forliset.",
  useCase:
    "Pedagogisk eksempel for DTE-2602. Ikke en modell for reell bruk — datasettet er én historisk hendelse.",
  data: "seaborn-datasets `titanic` — 891 rader, 11 features. 177 rader manglet `age`.",
  split: "80/20 stratifisert på `survived`, random_state=42.",
  model:
    "sklearn Pipeline: SimpleImputer(median) + StandardScaler på numeriske, OneHotEncoder på kategoriske, deretter LogisticRegression(max_iter=1000).",
  metricName: "F1 (macro)",
  metricValue: "0.81 (95% CI ≈ 0.77–0.84, 5-fold CV)",
  baseline: "DummyClassifier(strategy='most_frequent') = 0.40 F1",
  limitations:
    "Liten N (~700 etter cleaning). Datasettet representerer én hendelse i 1912. Generaliserer ikke til andre maritime ulykker.",
  ethics:
    "`sex` er den dominerende prediktoren — modellen reproduserer «kvinner og barn først». Brukes ikke til beslutninger; etiketten i seg selv koder en sosial norm fra en spesifikk historisk kontekst.",
};

const INITIAL: Record<FieldKey, string> = FIELDS.reduce(
  (acc, f) => ({ ...acc, [f.key]: "" }),
  {} as Record<FieldKey, string>,
);

function buildMarkdown(v: Record<FieldKey, string>): string {
  const part = (label: string, value: string) =>
    value ? `**${label}:** ${value}\n` : `**${label}:** _(ikke oppgitt)_\n`;
  return `# Model Card: ${v.name || "(ikke navngitt)"}\n\n` +
    `## 1. Problem\n${v.problem || "_(ikke oppgitt)_"}\n\n` +
    `## 2. Intendert bruk\n${v.useCase || "_(ikke oppgitt)_"}\n\n` +
    `## 3. Data\n` + part("Kilde + størrelse", v.data) + part("Train/test-split", v.split) + `\n` +
    `## 4. Modell\n${v.model || "_(ikke oppgitt)_"}\n\n` +
    `## 5. Resultater\n` +
    part("Primær metrikk", v.metricName) +
    part("Score på test", v.metricValue) +
    part("Baseline", v.baseline) + `\n` +
    `## 6. Begrensninger\n${v.limitations || "_(ikke oppgitt)_"}\n\n` +
    `## 7. Etiske aspekter\n${v.ethics || "_(ikke oppgitt)_"}\n`;
}

export function ModelCardBuilder() {
  const [values, setValues] = useState<Record<FieldKey, string>>(INITIAL);
  const [copied, setCopied] = useState(false);

  const md = useMemo(() => buildMarkdown(values), [values]);
  const filledRequired = FIELDS.filter((f) => f.required && values[f.key].trim().length > 0).length;
  const totalRequired = FIELDS.filter((f) => f.required).length;
  const completeness = Math.round((filledRequired / totalRequired) * 100);

  const update = (k: FieldKey, v: string) => setValues((prev) => ({ ...prev, [k]: v }));

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(md);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // klipper-API kan være blokkert; ignorer
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 md:p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="text-sm font-semibold">Model-card builder</div>
          <div className="text-xs text-muted-foreground mt-0.5">
            Fyll inn feltene. Forhåndsvisning til høyre oppdateres live — tomme felt blir
            tydelig «ikke oppgitt» i den endelige markdown-en.
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setValues(EXAMPLE)}
            className="text-xs px-2 py-1 rounded border border-border hover:bg-muted/50"
          >
            fyll med eksempel
          </button>
          <button
            type="button"
            onClick={() => setValues(INITIAL)}
            className="text-xs flex items-center gap-1 px-2 py-1 rounded border border-border hover:bg-muted/50"
          >
            <RotateCcw className="h-3 w-3" /> tøm
          </button>
        </div>
      </div>

      <div className="mb-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
          <span>Obligatoriske felt utfylt</span>
          <span className="tabular-nums">{filledRequired}/{totalRequired}</span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-brand transition-all"
            style={{ width: `${completeness}%` }}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2.5">
          {FIELDS.map((f) => (
            <div key={f.key}>
              <label className="text-[11px] font-medium flex items-center gap-1 mb-1">
                {f.label}
                {f.required && <span className="text-rose-500">*</span>}
              </label>
              {f.multiline ? (
                <textarea
                  value={values[f.key]}
                  onChange={(e) => update(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  rows={2}
                  className="w-full text-xs rounded border border-border bg-background px-2 py-1.5 resize-none focus:outline-none focus:ring-1 focus:ring-brand"
                />
              ) : (
                <input
                  value={values[f.key]}
                  onChange={(e) => update(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className="w-full text-xs rounded border border-border bg-background px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand"
                />
              )}
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-border bg-muted/20 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-border text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
            <span>preview (markdown)</span>
            <button
              type="button"
              onClick={copy}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded border border-border hover:bg-card text-foreground"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3" /> kopiert
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" /> kopier
                </>
              )}
            </button>
          </div>
          <pre className="font-mono text-[11px] leading-relaxed p-3 overflow-x-auto whitespace-pre-wrap flex-1">
            {md}
          </pre>
        </div>
      </div>

      <div className="mt-3 text-[11px] text-muted-foreground">
        En model-card er ikke pynt — sensor på DTE-2602 ser etter at du har TENKT på
        begrensningene og det etiske, ikke bare målt accuracy.
      </div>
    </div>
  );
}
