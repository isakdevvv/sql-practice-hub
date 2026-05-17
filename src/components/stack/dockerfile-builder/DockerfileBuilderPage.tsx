import { useMemo, useState } from "react";
import { Copy, Check, Sparkles, AlertTriangle, Container } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { Button } from "@/components/ui/button";
import { CATEGORIES, type CategoryId, type Category } from "./types";
import { OPTIONS } from "./options";
import { assemble, resolveRequires, findConflicts } from "./assemble";

const DEFAULT_SELECTED = new Set(OPTIONS.filter((o) => o.defaultOn).map((o) => o.id));

type TabKey = "dockerfile" | "dockerignore" | "compose";

export function DockerfileBuilderPage() {
  const [selected, setSelected] = useState<Set<string>>(new Set(DEFAULT_SELECTED));
  const [tab, setTab] = useState<TabKey>("dockerfile");
  const [copied, setCopied] = useState(false);

  const resolved = useMemo(() => resolveRequires(selected), [selected]);
  const conflicts = useMemo(() => findConflicts(resolved), [resolved]);
  const result = useMemo(() => assemble(resolved), [resolved]);

  const visibleCode = useMemo(() => {
    if (tab === "dockerfile") return result.files.dockerfile;
    if (tab === "dockerignore") return result.files.dockerignore ?? "(slå på .dockerignore-option for å generere)";
    return result.files.compose ?? "(slå på en docker-compose-option for å generere)";
  }, [tab, result]);

  const reset = () => {
    setSelected(new Set(DEFAULT_SELECTED));
    setTab("dockerfile");
  };

  /**
   * Toggle som respekterer radio-grupper: når en kategori er av typen
   * "radio" fjerner vi de andre options i samme kategori før vi legger
   * til den nye.
   */
  const toggle = (id: string) => {
    const opt = OPTIONS.find((o) => o.id === id);
    if (!opt) return;
    const cat = CATEGORIES.find((c) => c.id === opt.category);
    setSelected((prev) => {
      const next = new Set(prev);
      if (cat?.kind === "radio") {
        // For radio: fjern alle andre i kategorien, legg til denne
        for (const other of OPTIONS) {
          if (other.category === opt.category) next.delete(other.id);
        }
        next.add(id);
      } else {
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
      }
      return next;
    });
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(visibleCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const port = result.exposedPort ?? 8000;
  const hasCompose = result.files.compose !== null;
  const hasDockerignore = result.files.dockerignore !== null;

  return (
    <StackPageShell title="Dockerfile Builder" group="stack">
      <article className="container mx-auto px-4 py-10 max-w-6xl">
        <header className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DevOps · Interaktiv kodegenerator
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Dockerfile Builder — kryss av config, få ferdig Dockerfile
          </h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Velg base-image, dependencies, runtime og helsesjekk — så genereres en{" "}
            <code>Dockerfile</code> med korrekt lag-rekkefølge (FROM → deps → app → CMD),
            en <code>.dockerignore</code> med fornuftige defaults, og valgfritt en{" "}
            <code>docker-compose.yml</code> med database-tjeneste. Builder-en respekterer{" "}
            cache-vennlig rekkefølge så du ikke ødelegger bygge-cachen din.
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
                  category={cat}
                  options={opts}
                  selected={selected}
                  resolved={resolved}
                  onToggle={toggle}
                />
              );
            })}
          </aside>

          {/* === RIGHT: generated files === */}
          <div className="space-y-3">
            <div className="rounded-xl border border-border bg-card overflow-hidden sticky top-4">
              <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-muted/30">
                <Container className="h-4 w-4 text-brand" />
                <span className="text-sm font-semibold">Generert</span>
                <div className="ml-2 flex items-center gap-1 text-xs">
                  <TabButton active={tab === "dockerfile"} onClick={() => setTab("dockerfile")}>
                    Dockerfile
                  </TabButton>
                  <TabButton
                    active={tab === "dockerignore"}
                    onClick={() => setTab("dockerignore")}
                    disabled={!hasDockerignore}
                  >
                    .dockerignore
                  </TabButton>
                  <TabButton
                    active={tab === "compose"}
                    onClick={() => setTab("compose")}
                    disabled={!hasCompose}
                  >
                    docker-compose.yml
                  </TabButton>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {visibleCode.split("\n").length} linjer
                  </span>
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
                <code className="font-mono">{visibleCode}</code>
              </pre>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 text-sm">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-brand" />
                <span className="font-semibold">Kjør lokalt</span>
              </div>
              <pre className="text-xs bg-muted/40 rounded p-3 overflow-x-auto">
                <code>{`docker build -t app .
docker run --rm -p ${port}:${port} app${hasCompose ? "\n\n# eller alt på en gang:\ndocker compose up --build" : ""}`}</code>
              </pre>
            </div>

            <details className="rounded-xl border border-border bg-card p-4">
              <summary className="cursor-pointer text-sm font-semibold">
                Hvorfor denne lag-rekkefølgen?
              </summary>
              <div className="mt-3 text-sm space-y-3 text-muted-foreground">
                <p>
                  Docker bygger images <em>lag for lag</em> og cacher hvert lag. Et lag
                  invalideres når input til laget endrer seg — og alle påfølgende lag bygges
                  da på nytt. Derfor plasserer Builder-en dependencies (som endrer seg
                  sjelden) FØR app-koden (som endrer seg ofte): da slipper du å installere
                  pip-pakker hver gang du redigerer en linje Python.
                </p>
                <p>
                  <strong>USER settes sent</strong> så bygge-trinn (apt-get, pip install) kan
                  kjøre som root, mens selve prosessen kjører som <code>appuser</code>.{" "}
                  <strong>Multi-stage</strong> gir minst mulig runtime-image: du bygger i et
                  stort image med kompilatorer og kopierer kun ferdig artefakt til et lite
                  runtime-image.
                </p>
                <p>
                  <strong>.dockerignore</strong> er kritisk: uten den blir{" "}
                  <code>node_modules/</code>, <code>.git/</code> og <code>__pycache__/</code>{" "}
                  kopiert inn ved <code>COPY . .</code> — det invaliderer cache og blåser opp
                  imaget.
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
// Hjelp-komponenter
// ---------------------------------------------------------------------

function TabButton({
  active,
  disabled,
  onClick,
  children,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`px-2 py-1 rounded transition-colors ${
        active
          ? "bg-brand text-brand-foreground"
          : disabled
          ? "text-muted-foreground/50 cursor-not-allowed"
          : "text-muted-foreground hover:bg-muted"
      }`}
    >
      {children}
    </button>
  );
}

function CategorySection({
  category,
  options,
  selected,
  resolved,
  onToggle,
}: {
  category: Category;
  options: typeof OPTIONS;
  selected: Set<string>;
  resolved: Set<string>;
  onToggle: (id: string) => void;
}) {
  const isRadio = category.kind === "radio";
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-2 bg-muted/40 border-b border-border flex items-baseline gap-2">
        <div className="text-xs uppercase tracking-wider text-brand font-semibold">
          {category.label}
        </div>
        <span className="text-[9px] uppercase tracking-wider text-muted-foreground">
          {isRadio ? "velg én" : "kryss av"}
        </span>
      </div>
      <div className="px-4 pt-1 pb-0">
        <div className="text-[11px] text-muted-foreground">{category.description}</div>
      </div>
      <div className="divide-y divide-border mt-1">
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
                name={isRadio ? `cat-${category.id}` : undefined}
                className="mt-0.5 accent-brand"
                checked={isSelected || isAutoEnabled}
                onChange={() => onToggle(opt.id)}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
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
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}

// Re-eksport så _typesfilen er trygt brukt utenfor (referert i type-importer).
export type { CategoryId };
