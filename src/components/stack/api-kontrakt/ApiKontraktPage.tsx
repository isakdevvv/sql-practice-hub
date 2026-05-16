import { Link } from "@tanstack/react-router";
import { Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";

const STEPS = [
  { title: "Hvorfor en kontrakt — design first", anchor: "hvorfor" },
  { title: "OpenAPI / Swagger — formatet", anchor: "openapi" },
  { title: "Statuskoder — riktig bruk", anchor: "statuskoder" },
  { title: "Versjonering — URL vs header", anchor: "versjonering" },
  { title: "Feilformat — RFC 7807 problem-detail", anchor: "feil" },
  { title: "Idempotens — sikker retry", anchor: "idempotens" },
  { title: "Paginering, filtrering, sortering", anchor: "paging" },
];

export function ApiKontraktPage() {
  return (
    <StackPageShell title="API-kontrakt — OpenAPI, versjonering, feil" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            API-prosjekt · Del 3 av 5
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            API-kontrakt — OpenAPI, versjon, feil
          </h1>
          <p className="mt-3 text-muted-foreground">
            Kontrakten er APIets løfte til konsumentene. Bygg den tydelig nok
            til at frontend kan begynne å kode mot mock, og strengt nok til at
            kontrakts-tester kan kjøres automatisk.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Drill:</span>{" "}
              <Link to="/drag" className="text-brand hover:underline">drag-oppgavene</Link>{" "}
              under «API-prosjekt» — OpenAPI-fill, statuskode-quiz, idempotens-match, versjoneringsvalg.
            </div>
          </div>
        </div>

        <CourseOutline courseId="api-kontrakt" steps={STEPS} />

        <section id="hvorfor" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Hvorfor en kontrakt — design first</h2>
          <p className="text-sm text-muted-foreground mb-4">
            En API-kontrakt definerer endpoints, request/response-form,
            statuskoder, feilformat og auth. Skrives FØR implementasjon.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <ul className="space-y-2 text-sm">
              <li><strong>Parallell utvikling:</strong> front-end kan kode mot mock generert fra kontrakten mens back-end implementerer.</li>
              <li><strong>Discovery uten å lese kode:</strong> nye utviklere ser kontrakten, ikke 5000 linjer Python.</li>
              <li><strong>Kontrakts-tester</strong> kan automatisk verifisere at implementasjonen matcher.</li>
              <li><strong>Klient-generering</strong>: TypeScript-, Java-, Python-klienter genereres fra OpenAPI.</li>
            </ul>
          </div>
        </section>

        <section id="openapi" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. OpenAPI / Swagger — formatet</h2>
          <p className="text-sm text-muted-foreground mb-4">
            OpenAPI Specification (OAS, tidligere Swagger). YAML eller JSON.
            Versjon 3.0+ er standarden i dag.
          </p>

          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Minimal OpenAPI 3.0 — én endpoint
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`openapi: 3.0.3
info:
  title: Bestilling API
  version: 1.0.0
paths:
  /bestillinger/{id}:
    get:
      summary: Hent en bestilling
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: integer }
      responses:
        "200":
          description: OK
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Bestilling"
        "404":
          description: Finnes ikke
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Problem"
components:
  schemas:
    Bestilling:
      type: object
      required: [id, kunde_id, total]
      properties:
        id:        { type: integer }
        kunde_id:  { type: integer }
        total:     { type: number, format: float }
        status:    { type: string, enum: [opprettet, betalt, sendt] }
    Problem:
      type: object
      properties:
        type:   { type: string, format: uri }
        title:  { type: string }
        status: { type: integer }
        detail: { type: string }`}</pre>
          </div>

          <p className="text-xs text-muted-foreground">
            Swagger UI rendrer denne YAML-en som en interaktiv side hvor
            utviklere kan se endpoints, sende prøve-requests, og se respons.
          </p>
        </section>

        <section id="statuskoder" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Statuskoder — riktig bruk</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Velg statuskode ut fra hva som faktisk skjedde, ikke «alt feilet =
            500».
          </p>

          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-24">Kode</th>
                  <th className="text-left font-semibold px-4 py-2 w-44">Navn</th>
                  <th className="text-left font-semibold px-4 py-2">Brukes når</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">200</td><td className="px-4 py-3">OK</td><td className="px-4 py-3 text-muted-foreground">GET/PUT/PATCH lykkes med body</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">201</td><td className="px-4 py-3">Created</td><td className="px-4 py-3 text-muted-foreground">POST opprettet ressurs (Location-header bør peke til den)</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">202</td><td className="px-4 py-3">Accepted</td><td className="px-4 py-3 text-muted-foreground">Mottatt for asynk behandling</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">204</td><td className="px-4 py-3">No Content</td><td className="px-4 py-3 text-muted-foreground">Vellykket DELETE, eller PUT uten body</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">400</td><td className="px-4 py-3">Bad Request</td><td className="px-4 py-3 text-muted-foreground">Klient sendte ugyldig JSON eller manglende felt</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">401</td><td className="px-4 py-3">Unauthorized</td><td className="px-4 py-3 text-muted-foreground">Manglet eller ugyldig auth-token</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">403</td><td className="px-4 py-3">Forbidden</td><td className="px-4 py-3 text-muted-foreground">Autentisert, men mangler rettigheter</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">404</td><td className="px-4 py-3">Not Found</td><td className="px-4 py-3 text-muted-foreground">Ressurs finnes ikke (eller bør skjules)</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">409</td><td className="px-4 py-3">Conflict</td><td className="px-4 py-3 text-muted-foreground">Konflikt med eksisterende tilstand (duplikat, race)</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">422</td><td className="px-4 py-3">Unprocessable</td><td className="px-4 py-3 text-muted-foreground">JSON gyldig, men forretningsregel bruddet</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">429</td><td className="px-4 py-3">Too Many Requests</td><td className="px-4 py-3 text-muted-foreground">Rate limit overskredet</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">500</td><td className="px-4 py-3">Server Error</td><td className="px-4 py-3 text-muted-foreground">Uventet feil på server</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">503</td><td className="px-4 py-3">Service Unavailable</td><td className="px-4 py-3 text-muted-foreground">Server overbelastet / vedlikehold</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="versjonering" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Versjonering — URL vs header</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Når en breaking change er uunngåelig, må du versjonere. To
            hovedstrategier:
          </p>

          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                URL-versjon
              </div>
              <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`GET /v1/bestillinger
GET /v2/bestillinger`}</pre>
              <p className="text-xs text-muted-foreground mt-2">
                Pluss: lett å se i logger, lett å route. Minus: dirty URLs hvis
                versjoner spres mye.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Header-versjon
              </div>
              <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`GET /bestillinger
Accept: application/vnd.api.v2+json`}</pre>
              <p className="text-xs text-muted-foreground mt-2">
                Pluss: rene URLs. Minus: ikke synlig i nettleser, vanskelig
                å debugge, vanskelig å cache.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Backward-compatible endringer (krever IKKE ny versjon)
            </div>
            <ul className="space-y-1.5 text-sm text-muted-foreground list-disc pl-5">
              <li>Legge til nytt OPTIONAL felt i request</li>
              <li>Legge til nytt felt i response</li>
              <li>Legge til nytt endpoint</li>
              <li>Legge til ny statuskode for ny situasjon</li>
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">
              <strong>Breaking</strong>: fjerne/rename felt, endre type på felt,
              endre default-atferd, endre statuskode for eksisterende kall.
            </p>
          </div>
        </section>

        <section id="feil" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Feilformat — RFC 7807 problem-detail</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Standardisert måte å returnere strukturerte feil. Bedre enn å lage
            ditt eget format.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`HTTP/1.1 422 Unprocessable Entity
Content-Type: application/problem+json

{
  "type":     "https://api.example.com/errors/insufficient-stock",
  "title":    "Ikke nok på lager",
  "status":   422,
  "detail":   "Produkt 1234 har 2 igjen, du ba om 5",
  "instance": "/bestillinger/9876",
  "trace_id": "abc-123-def"
}`}</pre>
            <ul className="mt-3 space-y-1 text-xs text-muted-foreground list-disc pl-5">
              <li><strong>type</strong>: URI som identifiserer feiltypen — kan peke til dokumentasjon</li>
              <li><strong>title</strong>: kort menneske-lesbar oppsummering</li>
              <li><strong>status</strong>: samme som HTTP-status</li>
              <li><strong>detail</strong>: konkret beskrivelse for akkurat dette tilfellet</li>
              <li><strong>instance</strong>: URI for ressursen som ble forsøkt</li>
              <li>Egne felt kan legges til (eks <code>trace_id</code>)</li>
            </ul>
          </div>
        </section>

        <section id="idempotens" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Idempotens — sikker retry</h2>
          <p className="text-sm text-muted-foreground mb-4">
            En operasjon er <strong>idempotent</strong> hvis å kjøre den N
            ganger gir samme resultat som å kjøre den én gang. Viktig for retry —
            klient som ikke vet om POST gikk gjennom, må kunne prøve igjen.
          </p>

          <div className="overflow-x-auto rounded-lg border border-border mb-4">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-32">Metode</th>
                  <th className="text-left font-semibold px-4 py-2">Idempotent?</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">GET</td><td className="px-4 py-3 text-success">Ja (les data)</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">PUT</td><td className="px-4 py-3 text-success">Ja (sett til denne verdien)</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">DELETE</td><td className="px-4 py-3 text-success">Ja (etter første: 404, men idempotent på state)</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">POST</td><td className="px-4 py-3 text-destructive">Nei — to POST = to ressurser</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">PATCH</td><td className="px-4 py-3 text-muted-foreground">Avhenger av hva det gjør</td></tr>
              </tbody>
            </table>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Idempotency-Key — gjør POST trygt
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`POST /bestillinger
Idempotency-Key: 8f93c11a-9b2d-4e21-a7e3-f3aabb6f1234
Content-Type: application/json
{ "kunde_id": 1, "produkt_id": 42, "antall": 1 }

Første kall  → 201 Created (lager bestilling, lagrer key → bestilling-id)
Andre kall   → 200 OK     (samme key, returnerer samme bestilling-id)`}</pre>
            <p className="mt-3 text-xs text-muted-foreground">
              Klienten genererer en unik nøkkel (UUID) per logisk operasjon.
              Serveren lagrer (nøkkel → resultat) og returnerer cached respons
              ved retry. Vanlig hos Stripe, PayPal.
            </p>
          </div>
        </section>

        <section id="paging" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Paginering, filtrering, sortering</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Lister må pagineres — ellers vil noen kalle <code>GET /brukere</code> og
            få 100 000 rader. Bestem ETT mønster, dokumenter det, bruk det overalt.
          </p>

          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`GET /bestillinger?status=betalt&kunde_id=42&sort=-opprettet&page=2&size=20

Respons (vanlig mønster):
{
  "data": [ ... 20 bestillinger ... ],
  "page": 2,
  "size": 20,
  "total": 117,
  "links": {
    "self":  "/bestillinger?...&page=2",
    "next":  "/bestillinger?...&page=3",
    "prev":  "/bestillinger?...&page=1",
    "first": "/bestillinger?...&page=1",
    "last":  "/bestillinger?...&page=6"
  }
}`}</pre>
            <p className="mt-3 text-xs text-muted-foreground">
              Alternativ: <strong>cursor-paginering</strong> for store/realtid
              datasett — <code>?cursor=opaque_token</code>. Tryggere mot
              «hopper i listen» når data endrer seg mellom side-laster.
            </p>
          </div>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/drag" className="text-brand hover:underline">Drag-oppgaver</Link>
              : OpenAPI-fill, statuskode-quiz, idempotens-match.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "api-testing" }} className="text-brand hover:underline">
                API-testing
              </Link>
              : pyramide, unit/integration/contract/E2E.
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
