import { useMemo, useState } from "react";
import { Copy, Check, Sparkles, AlertTriangle, ExternalLink } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { Button } from "@/components/ui/button";
import { CATEGORIES, type CategoryId } from "./types";
import { OPTIONS } from "./options";
import { assemble, resolveRequires, findConflicts } from "./assemble";

const DEFAULT_SELECTED = new Set(OPTIONS.filter((o) => o.defaultOn).map((o) => o.id));

export function FastapiAppBuilderPage() {
  const [selected, setSelected] = useState<Set<string>>(new Set(DEFAULT_SELECTED));
  const [copied, setCopied] = useState(false);

  const resolved = useMemo(() => resolveRequires(selected), [selected]);
  const conflicts = useMemo(() => findConflicts(resolved), [resolved]);
  const code = useMemo(() => assemble(resolved), [resolved]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const reset = () => setSelected(new Set(DEFAULT_SELECTED));

  const selectAll = () => setSelected(new Set(OPTIONS.map((o) => o.id)));

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  // Lenke til /python med koden pre-fylt via URL-fragment
  const runUrl = `/python#kode=${encodeURIComponent(btoa(unescape(encodeURIComponent(code))))}`;

  return (
    <StackPageShell title="FastAPI App Builder" group="stack">
      <article className="container mx-auto px-4 py-10 max-w-6xl">
        <header className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2507 / DAT-1000 · Interaktiv kodegenerator
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            FastAPI App Builder — kryss av, få ferdig FastAPI + Pydantic-kode
          </h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Velg byggesteinene du vil ha — endepunkter, Pydantic-modeller, validering,
            dependency injection, auth med JWT, SQLAlchemy-database og auto-genererte docs
            — så genereres en komplett, kjørbar FastAPI-app som bruker disse. Hver
            avhengighet løses automatisk: krysser du av <em>"GET /kunder"</em> aktiveres
            også <em>"KundeUt (output-modell)"</em>.
          </p>
        </header>

        <div className="grid lg:grid-cols-[420px_1fr] gap-6">
          {/* === LEFT: options === */}
          <aside className="space-y-5">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={reset}>
                Tilbakestill
              </Button>
              <Button variant="outline" size="sm" onClick={selectAll}>
                Velg alt
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
              return <CategorySection
                key={cat.id}
                catId={cat.id}
                label={cat.label}
                description={cat.description}
                options={opts}
                selected={selected}
                resolved={resolved}
                onToggle={toggle}
              />;
            })}
          </aside>

          {/* === RIGHT: generated code === */}
          <div className="space-y-3">
            <div className="rounded-xl border border-border bg-card overflow-hidden sticky top-4">
              <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-muted/30">
                <Sparkles className="h-4 w-4 text-brand" />
                <span className="text-sm font-semibold">Generert app.py</span>
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
                  <Button asChild variant="default" size="sm" className="h-7">
                    <Link to={runUrl}>
                      <ExternalLink className="h-3.5 w-3.5 mr-1" />
                      Kjør i Python-sandkasse
                    </Link>
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
                  <strong>app-config</strong>, <strong>Pydantic-modeller</strong>,{" "}
                  <strong>DB-oppsett</strong>, <strong>dependencies</strong>,{" "}
                  <strong>routes</strong> og <strong>test-stub</strong>. Builder-en samler
                  bidragene, dedupliserer imports, og setter alt sammen til én FastAPI-fil
                  i topologisk rekkefølge.
                </p>
                <p>
                  FastAPI bruker Python type-hints til validering: <code>def opprett_kunde(payload: KundeIn)</code>{" "}
                  betyr at body-en valideres mot <code>KundeIn</code> automatisk, og at{" "}
                  <code>/docs</code> viser et eksempel-skjema. Status-koder settes via{" "}
                  <code>status.HTTP_201_CREATED</code> og response-form via <code>response_model</code>.
                </p>
                <p>
                  Klikk <strong>"Kjør i Python-sandkasse"</strong> for å sende koden over til{" "}
                  <Link to="/python" className="text-brand hover:underline">/python</Link>. NB:
                  Pyodide kjører FastAPI via <code>TestClient</code> — full uvicorn-server
                  krever Python lokalt.
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
// Liten hjelp-komponent for å holde JSX i hovedfunksjonen lesbar.
// ---------------------------------------------------------------------

function CategorySection({
  catId,
  label,
  description,
  options,
  selected,
  resolved,
  onToggle,
}: {
  catId: CategoryId;
  label: string;
  description: string;
  options: typeof OPTIONS;
  selected: Set<string>;
  resolved: Set<string>;
  onToggle: (id: string) => void;
}) {
  const isCore = catId === "core";
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-2 bg-muted/40 border-b border-border">
        <div className="text-xs uppercase tracking-wider text-brand font-semibold">{label}</div>
        <div className="text-[11px] text-muted-foreground mt-0.5">{description}</div>
      </div>
      <div className="divide-y divide-border">
        {options.map((opt) => {
          const isSelected = selected.has(opt.id);
          const isAutoEnabled = !isSelected && resolved.has(opt.id);
          const disabled = isCore;
          return (
            <label
              key={opt.id}
              className={`flex items-start gap-3 px-4 py-2.5 cursor-pointer transition-colors hover:bg-muted/30 ${
                disabled ? "opacity-70 cursor-not-allowed" : ""
              } ${isAutoEnabled ? "bg-brand/5" : ""}`}
            >
              <input
                type="checkbox"
                className="mt-0.5 accent-brand"
                checked={isSelected || isAutoEnabled}
                disabled={disabled}
                onChange={() => !disabled && onToggle(opt.id)}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-medium">{opt.label}</span>
                  {isAutoEnabled && (
                    <span className="text-[9px] uppercase tracking-wider text-brand font-semibold">
                      auto
                    </span>
                  )}
                  {disabled && (
                    <span className="text-[9px] uppercase tracking-wider text-muted-foreground">
                      kjerne
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
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
