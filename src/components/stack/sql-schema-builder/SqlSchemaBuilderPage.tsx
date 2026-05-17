import { useMemo, useState } from "react";
import { Copy, Check, Database, AlertTriangle } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { Button } from "@/components/ui/button";
import { CATEGORIES, type CategoryId, type Domain } from "./types";
import { OPTIONS } from "./options";
import { assemble, findConflicts, resolveRequires } from "./assemble";

const DEFAULT_SELECTED = new Set(
  OPTIONS.filter((o) => o.defaultOn).map((o) => o.id),
);

export function SqlSchemaBuilderPage() {
  const [selected, setSelected] = useState<Set<string>>(
    new Set(DEFAULT_SELECTED),
  );
  const [copied, setCopied] = useState(false);

  const resolved = useMemo(() => resolveRequires(selected), [selected]);
  const conflicts = useMemo(() => findConflicts(resolved), [resolved]);
  const code = useMemo(() => assemble(resolved), [resolved]);

  /**
   * Toggle med smart håndtering av "single-select"-grupper.
   * Hvis brukeren krysser på en option som har conflicts, skal de andre
   * i samme conflict-gruppe automatisk slås av — slik fungerer det som radio.
   */
  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      const opt = OPTIONS.find((o) => o.id === id);
      if (next.has(id)) {
        // Tillat avskruing kun hvis det IKKE er en single-select-gruppe
        // (ellers står vi uten dialect/domain).
        if (!opt?.conflicts || opt.conflicts.length === 0) {
          next.delete(id);
        }
      } else {
        next.add(id);
        // Hvis denne har conflicts, skru av alle de andre.
        if (opt?.conflicts) {
          for (const c of opt.conflicts) next.delete(c);
        }
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

  // Bestem hvilket domene som er aktivt — entitets-options som hører til
  // andre domener filtreres ut av lista (men dukker opp hvis brukeren bytter).
  const activeDomain: Domain = selected.has("domain-skole")
    ? "skole"
    : selected.has("domain-utleie")
      ? "utleie"
      : selected.has("domain-bibliotek")
        ? "bibliotek"
        : "webshop";

  return (
    <StackPageShell title="SQL Schema Builder" group="stack">
      <article className="container mx-auto px-4 py-10 max-w-6xl">
        <header className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2509 / DAT-1001 · Interaktiv DDL-generator
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            SQL Schema Builder — kryss av entiteter, få ferdig CREATE TABLE
          </h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Velg domene (webshop, skole, utleie, bibliotek), hvilke entiteter du
            vil ha, normaliseringsnivå (1NF — BCNF), constraints og dialekt.
            Builder-en setter sammen et komplett DDL-skript med{" "}
            <code>DROP TABLE</code> i omvendt FK-rekkefølge,{" "}
            <code>CREATE TABLE</code> i topologisk rekkefølge,
            primær-/fremmednøkler, CHECK/UNIQUE/DEFAULT, og navngitte indekser.
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
                {resolved.size} valg
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
                        <code>{c.a}</code> og <code>{c.b}</code> kan ikke være
                        på samtidig
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {CATEGORIES.map((cat) => {
              const opts = OPTIONS.filter((o) => {
                if (o.category !== cat.id) return false;
                // Skjul entitets-options som tilhører andre domener.
                if (cat.id === "entities" && o.domain && o.domain !== activeDomain) {
                  return false;
                }
                return true;
              });
              if (opts.length === 0) return null;
              return (
                <CategorySection
                  key={cat.id}
                  catId={cat.id}
                  label={cat.label}
                  description={cat.description}
                  options={opts}
                  selected={selected}
                  resolved={resolved}
                  onToggle={toggle}
                />
              );
            })}
          </aside>

          {/* === RIGHT: generated SQL === */}
          <div className="space-y-3">
            <div className="rounded-xl border border-border bg-card overflow-hidden sticky top-4">
              <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-muted/30">
                <Database className="h-4 w-4 text-brand" />
                <span className="text-sm font-semibold">Generert schema.sql</span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {code.split("\n").length} linjer
                </span>
                <div className="ml-auto flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyCode}
                    className="h-7"
                    aria-label="Kopier SQL"
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
                  Hver entitet du krysser av leverer en tabell-definisjon
                  (kolonner + FK-er). <strong>Normaliserings</strong>-valget
                  kjører et siste pass som splitter ut transitive avhengigheter
                  (typisk <code>postnummer → poststed</code> i en 3NF/BCNF-
                  refaktorering). <strong>Constraints</strong> som CHECK på
                  <code> pris &gt; 0</code> blir injisert i de kolonnene som er
                  pris/beløp.
                </p>
                <p>
                  Tabellene blir{" "}
                  <strong>topologisk sortert etter fremmednøkler</strong> så
                  parents kommer før children — du kan kjøre skriptet rett inn i
                  en tom DB uten å treffe missing-table-feil. DROP-statements
                  rendres i omvendt rekkefølge.
                </p>
                <p>
                  <strong>Dialekt</strong>-valget styrer{" "}
                  <code>AUTO_INCREMENT</code> vs <code>SERIAL</code> vs{" "}
                  <code>INTEGER PRIMARY KEY AUTOINCREMENT</code>, om{" "}
                  <code>VARCHAR(N)</code> eller bare <code>TEXT</code>, og om
                  MySQL får sin <code>ENGINE=InnoDB</code>-klausul.
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
// Liten hjelp-komponent — identisk mønster som Flask App Builder.
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
  // Single-select-kategorier rendrer som radio (visuelt) selv om
  // implementasjonen bruker conflicts.
  const isSingleSelect =
    catId === "domain" || catId === "dialect" || catId === "normalization";
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-2 bg-muted/40 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold">
            {label}
          </div>
          {isSingleSelect && (
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground">
              velg én
            </span>
          )}
        </div>
        <div className="text-[11px] text-muted-foreground mt-0.5">
          {description}
        </div>
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
                type={isSingleSelect ? "radio" : "checkbox"}
                name={isSingleSelect ? `single-${catId}` : undefined}
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
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
