import { useMemo, useState } from "react";
import { Copy, Check, Sparkles, AlertTriangle } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { Button } from "@/components/ui/button";
import { CATEGORIES, type CategoryId } from "./types";
import { OPTIONS } from "./options";
import { assemble, resolveRequires, findConflicts } from "./assemble";

const DEFAULT_SELECTED = new Set(OPTIONS.filter((o) => o.defaultOn).map((o) => o.id));

/** Hvilke kategorier oppfører seg som radio-knapper. */
const RADIO_CATEGORIES = new Set<CategoryId>(
  CATEGORIES.filter((c) => c.radio).map((c) => c.id),
);

export function MLPipelineBuilderPage() {
  const [selected, setSelected] = useState<Set<string>>(new Set(DEFAULT_SELECTED));
  const [copied, setCopied] = useState(false);

  const resolved = useMemo(() => resolveRequires(selected), [selected]);
  const conflicts = useMemo(() => findConflicts(resolved), [resolved]);
  const code = useMemo(() => assemble(resolved), [resolved]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      const opt = OPTIONS.find((o) => o.id === id);
      if (!opt) return next;

      // Radio-oppførsel: i dataset / model kan kun én være aktiv.
      if (RADIO_CATEGORIES.has(opt.category)) {
        // Fjern alle andre i samme kategori, sett denne.
        for (const o of OPTIONS) {
          if (o.category === opt.category) next.delete(o.id);
        }
        next.add(id);
        return next;
      }

      if (next.has(id)) {
        next.delete(id);
      } else {
        // Fjern konflikter automatisk (UX: split-options er gjensidig
        // utelukkende, men ikke radio).
        if (opt.conflicts) {
          for (const c of opt.conflicts) next.delete(c);
        }
        next.add(id);
      }
      return next;
    });
  };

  const reset = () => setSelected(new Set(DEFAULT_SELECTED));

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <StackPageShell title="ML Pipeline Builder" group="stack">
      <article className="container mx-auto px-4 py-10 max-w-6xl">
        <header className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2602 · Interaktiv kodegenerator
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            ML Pipeline Builder — kryss av komponenter, få ferdig sklearn-pipeline
          </h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Velg datasett, preprocessor-trinn (StandardScaler, OneHotEncoder, SimpleImputer,
            ColumnTransformer), modell (LogisticRegression, RandomForest, KNN, SVC, GNB, MLP),
            train/test-split, kryssvalidering, hyperparameter-tuning og evalueringsmål — og
            få en komplett, kjørbar Python-pipeline generert. Hver option bidrar med imports,
            preprocessor-blokk, pipeline-blokk og eval-blokk.
          </p>
        </header>

        <div className="grid lg:grid-cols-[420px_1fr] gap-6">
          {/* === LEFT: options === */}
          <aside className="space-y-5">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={reset}>
                Tilbakestill
              </Button>
              <div className="ml-auto text-xs text-muted-foreground">
                {resolved.size} av {OPTIONS.length} valgt
              </div>
            </div>

            {conflicts.length > 0 && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm flex gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-destructive">Konflikt</div>
                  <ul className="mt-1 space-y-0.5">
                    {conflicts.map((c, i) => (
                      <li key={i} className="text-xs">
                        <code>{c.a}</code> kan ikke kombineres med <code>{c.b}</code>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {CATEGORIES.map((cat) => {
              const opts = OPTIONS.filter((o) => o.category === cat.id);
              if (opts.length === 0) return null;
              return (
                <CategorySection
                  key={cat.id}
                  catId={cat.id}
                  label={cat.label}
                  description={cat.description}
                  isRadio={!!cat.radio}
                  options={opts}
                  selected={selected}
                  resolved={resolved}
                  onToggle={toggle}
                />
              );
            })}
          </aside>

          {/* === RIGHT: generated code === */}
          <div className="space-y-3">
            <div className="rounded-xl border border-border bg-card overflow-hidden sticky top-4">
              <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-muted/30">
                <Sparkles className="h-4 w-4 text-brand" />
                <span className="text-sm font-semibold">Generert pipeline.py</span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {code.split("\n").length} linjer
                </span>
                <div className="ml-auto flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyCode}
                    className="h-7"
                    aria-label="Kopier kode"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5 mr-1" /> Kopiert
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 mr-1" /> Kopier
                      </>
                    )}
                  </Button>
                </div>
              </div>
              <pre className="text-xs overflow-x-auto max-h-[80vh] p-4 leading-relaxed bg-background">
                <code className="font-mono">{code}</code>
              </pre>
            </div>

            <details className="rounded-xl border border-border bg-card p-4">
              <summary className="cursor-pointer text-sm font-semibold">
                Hva skjer under panseret?
              </summary>
              <div className="mt-3 text-sm space-y-3 text-muted-foreground">
                <p>
                  Hver option kontribuerer fragmenter på flere lag: <strong>imports</strong>,{" "}
                  <strong>dataset-loader</strong>, <strong>preprocessor</strong>,{" "}
                  <strong>pipeline</strong>, <strong>split</strong>, <strong>cv</strong>,{" "}
                  <strong>tuning</strong> og <strong>evaluering</strong>. Builder-en
                  samler bidragene og dedupliserer imports.
                </p>
                <p>
                  Krysser du av et blandet datasett (Titanic) og slår på{" "}
                  <em>ColumnTransformer</em>, bygges to under-pipelines: én for numeriske
                  (SimpleImputer + Scaler) og én for kategoriske (SimpleImputer + OneHotEncoder).
                  Disse limes sammen med <code>ColumnTransformer</code>.
                </p>
                <p>
                  Slår du på <em>GridSearchCV</em> eller <em>RandomizedSearchCV</em>, brukes
                  modellens innebygde param-grid, og <code>cv</code> tas fra
                  kryssvalideringsvalget (StratifiedKFold/TimeSeriesSplit/GroupKFold).
                </p>
              </div>
            </details>
          </div>
        </div>
      </article>
    </StackPageShell>
  );
}

// ---------------------------------------------------------------------
// Liten hjelp-komponent for å holde JSX-en lesbar.
// ---------------------------------------------------------------------

function CategorySection({
  catId,
  label,
  description,
  isRadio,
  options,
  selected,
  resolved,
  onToggle,
}: {
  catId: CategoryId;
  label: string;
  description: string;
  isRadio: boolean;
  options: typeof OPTIONS;
  selected: Set<string>;
  resolved: Set<string>;
  onToggle: (id: string) => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-2 bg-muted/40 border-b border-border">
        <div className="text-xs uppercase tracking-wider text-brand font-semibold">
          {label}
          {isRadio && (
            <span className="ml-2 text-[9px] text-muted-foreground normal-case tracking-normal">
              (velg én)
            </span>
          )}
        </div>
        <div className="text-[11px] text-muted-foreground mt-0.5">{description}</div>
      </div>
      <div className="divide-y divide-border">
        {options.map((opt) => {
          const isSelected = selected.has(opt.id);
          const isAutoEnabled = !isSelected && resolved.has(opt.id);
          return (
            <label
              key={opt.id}
              className={`flex items-start gap-3 px-4 py-2.5 cursor-pointer transition-colors hover:bg-muted/30 ${
                isAutoEnabled ? "bg-brand/5" : ""
              }`}
            >
              <input
                type={isRadio ? "radio" : "checkbox"}
                name={isRadio ? `radio-${catId}` : undefined}
                className="mt-0.5 accent-brand"
                checked={isSelected || isAutoEnabled}
                onChange={() => onToggle(opt.id)}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-medium">{opt.label}</span>
                  {isAutoEnabled && (
                    <span className="text-[9px] uppercase tracking-wider text-brand font-semibold">
                      auto
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  {opt.description}
                </div>
                {opt.requires && opt.requires.length > 0 && (
                  <div className="text-[10px] text-muted-foreground/70 mt-1">
                    trenger: {opt.requires.join(", ")}
                  </div>
                )}
                {opt.conflicts && opt.conflicts.length > 0 && (
                  <div className="text-[10px] text-muted-foreground/70 mt-1">
                    konflikt: {opt.conflicts.join(", ")}
                  </div>
                )}
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
