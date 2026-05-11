import { Link } from "@tanstack/react-router";
import { Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";

const STEPS = [
  { title: "Docker — pakke som ett artefakt", anchor: "docker" },
  { title: "Env vars og secrets ut av repo", anchor: "secrets" },
  { title: "Healthchecks og readiness", anchor: "health" },
  { title: "CI/CD-pipeline (GitHub Actions)", anchor: "cicd" },
  { title: "Blue-green og canary deploy", anchor: "rollout" },
  { title: "Observability — logs, metrics, traces", anchor: "obs" },
  { title: "Runbooks når noe brenner", anchor: "runbook" },
];

export function ApiDeployPage() {
  return (
    <StackPageShell title="Deploy — Docker, CI/CD, observability" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            API-prosjekt · Del 5 av 5
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Deploy — Docker, CI/CD, observability
          </h1>
          <p className="mt-3 text-muted-foreground">
            Fra ferdig kodet API til kjørende i produksjon: Docker-image,
            secrets-håndtering, deploy-pipeline, gradvis utrulling, og hvordan
            du oppdager at noe er galt før kunden gjør det.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Drill:</span>{" "}
              <Link to="/drag" className="text-brand hover:underline">drag-oppgavene</Link>{" "}
              under «API-prosjekt» — Docker-fill, secrets-quiz, pipeline-rekkefølge, blue-green vs canary.
            </div>
          </div>
        </div>

        <CourseOutline courseId="api-deploy" steps={STEPS} />

        <section id="docker" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Docker — pakke som ett artefakt</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Docker bygger et image som inneholder appen + alle dependencies +
            kjøretid. Samme image kjører identisk på laptop, staging og prod.
          </p>

          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Minimal Dockerfile for Python-API
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`# Bruk slim base — mindre image, færre CVE-er
FROM python:3.12-slim

# Sett arbeidsdir
WORKDIR /app

# Installer dependencies FØRST (cache-vennlig)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Kopier kode
COPY ./src ./src

# Ikke kjør som root i container
RUN useradd --uid 1000 app && chown -R app /app
USER app

# Eksponer port (dokumentasjon, ikke binding)
EXPOSE 8000

# Healthcheck — Docker spør om appen lever
HEALTHCHECK --interval=30s --timeout=3s \\
  CMD curl -f http://localhost:8000/health || exit 1

# Start appen
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]`}</pre>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Multi-stage build for små images
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`# Stage 1: build (inneholder kompilatorer, dev-libs)
FROM python:3.12 AS build
WORKDIR /app
COPY requirements.txt .
RUN pip wheel --wheel-dir=/wheels -r requirements.txt

# Stage 2: runtime (slim — bare det som trengs i drift)
FROM python:3.12-slim
WORKDIR /app
COPY --from=build /wheels /wheels
RUN pip install --no-index --find-links=/wheels /wheels/*.whl
COPY ./src ./src
CMD ["uvicorn", "src.main:app"]
# Image: ~120 MB i stedet for ~900 MB`}</pre>
          </div>
        </section>

        <section id="secrets" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Env vars og secrets ut av repo</h2>
          <p className="text-sm text-muted-foreground mb-4">
            ALDRI commit secrets til git. Selv om du sletter dem, ligger de i
            git-historien for alltid. Bruk env vars og en secrets-vault.
          </p>

          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              The Twelve-Factor App: konfig i environment
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`# Koden leser fra env, ikke fra fil
import os
DATABASE_URL = os.environ["DATABASE_URL"]      # required
PORT         = int(os.environ.get("PORT", 8000))
LOG_LEVEL    = os.environ.get("LOG_LEVEL", "info")

# I lokalmiljø: bruk .env-fil (ikke commitet)
# I docker:    --env-file .env  eller -e DATABASE_URL=...
# I cloud:     secrets injiseres som env vars av plattformen`}</pre>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Hvor secrets BOR
            </div>
            <ul className="space-y-1.5 text-sm list-disc pl-5">
              <li><strong>HashiCorp Vault</strong> — bransje-standard for on-prem og hybrid</li>
              <li><strong>AWS Secrets Manager / SSM Parameter Store</strong></li>
              <li><strong>GCP Secret Manager</strong></li>
              <li><strong>GitHub Actions Secrets</strong> — for CI/CD-bruk</li>
              <li><strong>Kubernetes Secrets</strong> — base64-kodet, IKKE kryptert som default</li>
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">
              Roter secrets: nye nøkler/passord regelmessig + ved kjent kompromittering.
              Loggføring må aldri inkludere secrets — bruk redaction.
            </p>
          </div>
        </section>

        <section id="health" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Healthchecks og readiness</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Orkestratoren (Kubernetes, ECS, Nomad) trenger å vite om appen
            din lever — og om den er klar til å ta trafikk.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <ul className="space-y-3 text-sm">
              <li>
                <strong>Liveness</strong> (<code>/healthz</code>): «lever
                prosessen?». Hvis 503 → orkestrator restarter podden.
                Skal være enkel — bare returnere 200 hvis hovedloop er i live.
              </li>
              <li>
                <strong>Readiness</strong> (<code>/ready</code>): «kan jeg ta
                trafikk?». Hvis DB-kobling er nede eller dependencies ikke
                klargjort: 503. Trafikk dirigeres bort.
              </li>
              <li>
                <strong>Startup probe</strong>: tregstartede apper får
                tålmodighet før liveness begynner å sjekke.
              </li>
            </ul>
          </div>
        </section>

        <section id="cicd" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. CI/CD-pipeline (GitHub Actions)</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Continuous Integration + Continuous Delivery. Hver push kjører
            tester. Merge til main kan auto-deploye til staging.
          </p>

          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`# .github/workflows/ci.yml
name: CI
on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env: { POSTGRES_PASSWORD: test }
        ports: ["5432:5432"]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: "3.12" }
      - run: pip install -r requirements.txt
      - run: ruff check .            # lint
      - run: mypy src/               # type-check
      - run: pytest -v               # tests
      - run: schemathesis run ...    # contract

  build-and-push:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/build-push-action@v5
        with:
          push: true
          tags: ghcr.io/org/api:\${{ github.sha }}

  deploy-staging:
    needs: build-and-push
    runs-on: ubuntu-latest
    steps:
      - run: kubectl set image deploy/api api=ghcr.io/org/api:\${{ github.sha }}`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Hver feiltrinn stopper pipelinen før den når deploy. Det er hele
            poenget — fang feil tidlig, billig.
          </p>
        </section>

        <section id="rollout" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Blue-green og canary deploy</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Hvordan du ruller ut en ny versjon uten å ta hele tjenesten ned —
            og kan rulle tilbake raskt hvis den er buggy.
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Blue-green
              </div>
              <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Trafikk
  │
  ▼
[Router]──► [Blue v1] (live)
        └─► [Green v2] (idle)

Etter test:
[Router]──► [Blue v1] (idle)
        └─► [Green v2] (live)

Rollback = bytt ruter tilbake.`}</pre>
              <p className="text-xs text-muted-foreground mt-2">
                To identiske miljøer. Bytte alt på en gang. Rask rollback. Dyrt
                — to fulle miljøer.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Canary
              </div>
              <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Trafikk (100%)
  │
  ├─► [v1] 95%
  └─► [v2] 5%       (overvåk metrics)

Hvis ok, øk gradvis:
  v1: 95→90→50→0
  v2:  5→10→50→100

Hvis dårlig: tilbake til 100% v1.`}</pre>
              <p className="text-xs text-muted-foreground mt-2">
                Gradvis. Begrenset blast radius hvis bug. Krever god monitoring
                for å se canaryen tidlig.
              </p>
            </div>
          </div>

          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Rolling update</strong> (default i Kubernetes) er en
            tredje variant: podder erstattes én for én. Enklere, men ingen
            «trafikk-prosentstyring».
          </p>
        </section>

        <section id="obs" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Observability — logs, metrics, traces</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Når noe er galt i prod: HVA er galt, HVOR, og HVORFOR? «De tre pillarene».
          </p>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-32">Pilar</th>
                  <th className="text-left font-semibold px-4 py-2">Hva</th>
                  <th className="text-left font-semibold px-4 py-2">Verktøy</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border"><td className="px-4 py-3 font-medium">Logs</td><td className="px-4 py-3 text-muted-foreground">Hendelseslinjer over tid. «Hva skjedde?»</td><td className="px-4 py-3 text-muted-foreground">Loki, Elastic, CloudWatch</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-medium">Metrics</td><td className="px-4 py-3 text-muted-foreground">Aggregerte tall over tid. «Hvor mye, hvor ofte?»</td><td className="px-4 py-3 text-muted-foreground">Prometheus, Grafana, Datadog</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-medium">Traces</td><td className="px-4 py-3 text-muted-foreground">Et request gjennom flere services. «Hvor brukes tiden?»</td><td className="px-4 py-3 text-muted-foreground">OpenTelemetry + Jaeger / Tempo</td></tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Strukturerte logs — JSON, ikke fritekst
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`{
  "ts":        "2026-05-12T08:14:22.041Z",
  "level":     "ERROR",
  "service":   "bestilling-api",
  "trace_id":  "abc-123",
  "user_id":   42,
  "event":     "bestilling_failed",
  "reason":    "insufficient_stock",
  "produkt_id": 1
}`}</pre>
            <p className="mt-3 text-xs text-muted-foreground">
              Strukturerte logs er filtrerbare og spørrbare — du kan
              «show all errors for user 42 last hour». Fritekst er ikke.
            </p>
          </div>
        </section>

        <section id="runbook" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Runbooks når noe brenner</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Når alarmen går klokken 02:00, vil personen som svarer ha en
            sjekkliste — ikke måtte gjette. Det er en runbook.
          </p>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Mal: alarm «API-latency p95 over 1s»
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`# Symptom
  Grafana-alert: api_latency_seconds_p95 > 1 i 5 min

# Sjekk først
  1. Er bare ett endpoint tregt eller alle? (sjekk Grafana)
  2. Er DB-latency oppe? (postgres-dashboard)
  3. Er det stor request-volum? (rate-dashboard)
  4. Recente deploys? (CD-history)

# Vanlige årsaker og fix
  - N+1 query etter ny PR → revertér deploy
  - Slow query etter nytt index-bytte → ANALYZE / re-index
  - Cache cold etter restart → varm cache via /admin/warm
  - DB connection pool tom → øk pool-size + restart

# Eskalering
  Hvis ikke løst på 20 min: ring backend-on-call (+47 ...)

# Etter
  Skriv post-mortem innen 24t. Oppdater runbook.`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Post-mortem</strong> er en blame-fri rapport etter hver
            hendelse: hva skjedde, når, hvilken impact, hva gjorde vi, hva
            lærte vi, hva endrer vi. <strong>Five whys</strong> brukes til å
            finne rotårsak.
          </p>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Ferdig — du har dekket hele løpet</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/drag" className="text-brand hover:underline">Drag-oppgaver</Link>
              : Docker-fill, secrets-quiz, pipeline-rekkefølge, blue-green vs canary.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "api-prosjekt" }} className="text-brand hover:underline">
                Tilbake til API-hub
              </Link>
              {" "}— gå tilbake og se hele arbeidsflyten samlet.
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
