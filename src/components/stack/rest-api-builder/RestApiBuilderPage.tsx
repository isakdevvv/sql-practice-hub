import { useMemo, useState } from "react";
import { Copy, Check, Sparkles, Code2 } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { Button } from "@/components/ui/button";
import {
  FRAMEWORKS,
  RESOURCES,
  AUTH_MODES,
  PAGINATIONS,
  CORS_OPTIONS,
  OPENAPI_MODES,
  VALIDATIONS,
} from "./options";
import { CATEGORIES } from "./types";
import type { BuilderState, Framework, AuthMode, Pagination, CorsMode, OpenApiMode } from "./types";
import { assemble, normalize } from "./assemble";

function defaultState(): BuilderState {
  return {
    framework: "fastapi",
    resources: new Set(["User", "Product", "Order"]),
    auth: "bearer",
    validation: "pydantic",
    pagination: "page-size",
    cors: "open",
    middleware: { requestId: true, accessLog: true, jsonErrors: true },
    openapi: "auto",
  };
}

export function RestApiBuilderPage() {
  const [state, setState] = useState<BuilderState>(defaultState);
  const [copied, setCopied] = useState(false);

  const normalized = useMemo(() => normalize(state), [state]);
  const code = useMemo(() => assemble(state), [state]);

  const setFramework = (id: Framework) =>
    setState((s) => ({ ...s, framework: id }));
  const setAuth = (id: AuthMode) => setState((s) => ({ ...s, auth: id }));
  const setPagination = (id: Pagination) => setState((s) => ({ ...s, pagination: id }));
  const setCors = (id: CorsMode) => setState((s) => ({ ...s, cors: id }));
  const setOpenApi = (id: OpenApiMode) => setState((s) => ({ ...s, openapi: id }));
  const toggleResource = (id: string) =>
    setState((s) => {
      const next = new Set(s.resources);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { ...s, resources: next };
    });
  const toggleMw = (key: keyof BuilderState["middleware"]) =>
    setState((s) => ({ ...s, middleware: { ...s.middleware, [key]: !s.middleware[key] } }));

  const reset = () => setState(defaultState());

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const fw = FRAMEWORKS.find((f) => f.id === state.framework)!;
  const fileExt = fw.ext;
  const fileName = fw.id === "drf" ? "api_modul.py" : fw.id === "express" ? "server.js" : "api.py";

  return (
    <StackPageShell title="REST API Builder" group="stack">
      <article className="container mx-auto px-4 py-10 max-w-6xl">
        <header className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE / Web · Interaktiv API-generator
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            REST API Builder — velg framework + ressurser → få ferdig API
          </h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Plukk framework (FastAPI / Flask-RESTful / Express / DRF), kryss av ressursene du vil ha
            CRUD-endepunkter for, velg auth-modus, validering, paginering, CORS, middleware og
            OpenAPI-stil — så genereres en komplett kjørbar API-fil med curl-testeksempler nederst.
            Ingen Jinja-templates: dette er ren JSON.
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
                {state.resources.size} av {RESOURCES.length} ressurser · {fw.label}
              </div>
            </div>

            {/* Framework (radio) */}
            <Section label={CATEGORIES[0].label} description={CATEGORIES[0].description}>
              {FRAMEWORKS.map((f) => (
                <RadioRow
                  key={f.id}
                  name="framework"
                  checked={state.framework === f.id}
                  onChange={() => setFramework(f.id)}
                  title={f.label}
                  subtitle={f.description}
                />
              ))}
            </Section>

            {/* Resources (multi) */}
            <Section label={CATEGORIES[1].label} description={CATEGORIES[1].description}>
              {RESOURCES.map((r) => (
                <CheckRow
                  key={r.singular}
                  checked={state.resources.has(r.singular)}
                  onChange={() => toggleResource(r.singular)}
                  title={`${r.label} (/${r.plural})`}
                  subtitle={`Felt: ${r.fields.map((f) => f.name).join(", ")}`}
                />
              ))}
            </Section>

            {/* Auth (radio) */}
            <Section label={CATEGORIES[2].label} description={CATEGORIES[2].description}>
              {AUTH_MODES.map((a) => (
                <RadioRow
                  key={a.id}
                  name="auth"
                  checked={state.auth === a.id}
                  onChange={() => setAuth(a.id)}
                  title={a.label}
                  subtitle={a.description}
                />
              ))}
            </Section>

            {/* Validation — vises informativt; bindes til framework */}
            <Section label={CATEGORIES[3].label} description={CATEGORIES[3].description}>
              {VALIDATIONS.map((v) => (
                <RadioRow
                  key={v.id}
                  name="validation"
                  checked={normalized.validation === v.id}
                  onChange={() => {
                    // Validering låses til framework via normalize() — radio er kun visning.
                    const target = FRAMEWORKS.find((fw) => fw.defaultValidation === v.id);
                    if (target) setFramework(target.id);
                  }}
                  title={`${v.label}`}
                  subtitle={`${v.description} (auto-valgt med ${FRAMEWORKS.find((f) => f.defaultValidation === v.id)?.label})`}
                />
              ))}
            </Section>

            {/* Pagination (radio) */}
            <Section label={CATEGORIES[4].label} description={CATEGORIES[4].description}>
              {PAGINATIONS.map((p) => (
                <RadioRow
                  key={p.id}
                  name="pagination"
                  checked={state.pagination === p.id}
                  onChange={() => setPagination(p.id)}
                  title={p.label}
                  subtitle={p.description}
                />
              ))}
            </Section>

            {/* CORS (radio) */}
            <Section label={CATEGORIES[5].label} description={CATEGORIES[5].description}>
              {CORS_OPTIONS.map((c) => (
                <RadioRow
                  key={c.id}
                  name="cors"
                  checked={state.cors === c.id}
                  onChange={() => setCors(c.id)}
                  title={c.label}
                  subtitle={c.description}
                />
              ))}
            </Section>

            {/* Middleware (multi) */}
            <Section label={CATEGORIES[6].label} description={CATEGORIES[6].description}>
              <CheckRow
                checked={state.middleware.requestId}
                onChange={() => toggleMw("requestId")}
                title="X-Request-ID"
                subtitle="Genererer unik id per request, returnerer i response-header."
              />
              <CheckRow
                checked={state.middleware.accessLog}
                onChange={() => toggleMw("accessLog")}
                title="Access-log"
                subtitle="Logger METHOD PATH -> STATUS (varighet)."
              />
              <CheckRow
                checked={state.middleware.jsonErrors}
                onChange={() => toggleMw("jsonErrors")}
                title="JSON-feilhandler"
                subtitle="Returner JSON-error-body i stedet for HTML på 404/500/422."
              />
            </Section>

            {/* OpenAPI (radio) */}
            <Section label={CATEGORIES[7].label} description={CATEGORIES[7].description}>
              {OPENAPI_MODES.map((o) => (
                <RadioRow
                  key={o.id}
                  name="openapi"
                  checked={state.openapi === o.id}
                  onChange={() => setOpenApi(o.id)}
                  title={o.label}
                  subtitle={o.description}
                  disabled={o.id === "auto" && (fw.id === "flask-restful" || fw.id === "express")}
                />
              ))}
              {normalized.openapi !== state.openapi && (
                <div className="px-4 py-2 text-[11px] text-amber-600 dark:text-amber-400">
                  {fw.label} støtter ikke "auto" — viser "manual" i stedet.
                </div>
              )}
            </Section>
          </aside>

          {/* === RIGHT: generated code === */}
          <div className="space-y-3">
            <div className="rounded-xl border border-border bg-card overflow-hidden sticky top-4">
              <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-muted/30">
                <Sparkles className="h-4 w-4 text-brand" />
                <span className="text-sm font-semibold">Generert {fileName}</span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {code.split("\n").length} linjer · .{fileExt}
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
              <summary className="cursor-pointer text-sm font-semibold flex items-center gap-2">
                <Code2 className="h-4 w-4 text-brand" />
                Hva skiller dette fra Flask App Builder?
              </summary>
              <div className="mt-3 text-sm space-y-3 text-muted-foreground">
                <p>
                  <strong>Flask App Builder</strong> bygger fullstack-apper med Jinja-templates,
                  Bootstrap-UI, form-skjemaer og navbar — alt server-renderert HTML.
                </p>
                <p>
                  <strong>REST API Builder</strong> er rent backend: kun JSON-endpoints. I stedet
                  for templates får du Pydantic/marshmallow/Joi-skjemaer, auth-decorators,
                  paginering, CORS-policy, request-id middleware og OpenAPI-doc. Output er ferdig
                  kjørbar API-fil + curl-eksempler.
                </p>
                <p>
                  Brukstilfelle: mobil-app-backend, microservice, API for SPA-frontend.
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
// Små UI-byggesteiner
// ---------------------------------------------------------------------

function Section({
  label,
  description,
  children,
}: {
  label: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-2 bg-muted/40 border-b border-border">
        <div className="text-xs uppercase tracking-wider text-brand font-semibold">{label}</div>
        <div className="text-[11px] text-muted-foreground mt-0.5">{description}</div>
      </div>
      <div className="divide-y divide-border">{children}</div>
    </div>
  );
}

function RadioRow({
  name,
  checked,
  onChange,
  title,
  subtitle,
  disabled,
}: {
  name: string;
  checked: boolean;
  onChange: () => void;
  title: string;
  subtitle: string;
  disabled?: boolean;
}) {
  return (
    <label
      className={`flex items-start gap-3 px-4 py-2.5 cursor-pointer transition-colors hover:bg-muted/30 ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      <input
        type="radio"
        name={name}
        className="mt-0.5 accent-brand"
        checked={checked}
        disabled={disabled}
        onChange={() => !disabled && onChange()}
      />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium">{title}</div>
        <div className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</div>
      </div>
    </label>
  );
}

function CheckRow({
  checked,
  onChange,
  title,
  subtitle,
}: {
  checked: boolean;
  onChange: () => void;
  title: string;
  subtitle: string;
}) {
  return (
    <label className="flex items-start gap-3 px-4 py-2.5 cursor-pointer transition-colors hover:bg-muted/30">
      <input
        type="checkbox"
        className="mt-0.5 accent-brand"
        checked={checked}
        onChange={onChange}
      />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium">{title}</div>
        <div className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</div>
      </div>
    </label>
  );
}
