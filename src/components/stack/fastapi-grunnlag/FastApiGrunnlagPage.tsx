import { Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";

const STEPS = [
  { title: "Hvorfor FastAPI?", anchor: "hvorfor" },
  { title: "Type-hints driver alt", anchor: "type-hints" },
  { title: "Pydantic-modeller", anchor: "pydantic" },
  { title: "Async / await", anchor: "async" },
  { title: "Dependency injection", anchor: "depends" },
  { title: "Automatisk OpenAPI / Swagger", anchor: "openapi" },
  { title: "Flask vs FastAPI cheat-sheet", anchor: "vs" },
  { title: "Eksamen-quick-ref", anchor: "ref" },
];

export function FastApiGrunnlagPage() {
  return (
    <StackPageShell title="FastAPI grunnlag" group="stack">
      <article className="container mx-auto px-4 py-10 max-w-3xl">
        <header className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2509 / DAT-1000+ · Moderne Python web framework
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            FastAPI — type-hints, async og automatisk OpenAPI
          </h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            FastAPI er Pythons mest populære moderne web-framework siden 2020. I motsetning til
            Flask er det <strong>type-hint-drevet</strong> — Python-type-annotasjonene driver
            validering, parsing, dokumentasjon OG editor-completion. Ett enkelt klasseuttrykk
            (Pydantic-modell) gir deg alt fire.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span> Det finnes 8 FastAPI-oppgaver under{" "}
              <a href="/python" className="text-brand hover:underline">/python</a> i kategorien
              "Web &amp; Flask" — alle bruker FastAPIs egen <code>TestClient</code>.
            </div>
          </div>
        </header>

        <CourseOutline courseId="fastapi-grunnlag" steps={STEPS} />

        <section id="hvorfor" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Hvorfor velge FastAPI?</h2>
          <ul className="text-sm space-y-1.5 list-disc pl-5">
            <li>
              <strong>Type-hints fra Python 3.6+</strong> brukes til validering OG dokumentasjon — du
              skriver feltet én gang og får 4 ting gratis.
            </li>
            <li>
              <strong>Pydantic-modeller</strong> validerer requests automatisk og returnerer
              detaljerte 422-feilmeldinger uten en linje med ekstra kode.
            </li>
            <li>
              <strong>Async-støtte ut av boksen</strong> via Starlette + uvicorn — kjøretider opp
              mot Node/Go på I/O-tunge workloads.
            </li>
            <li>
              <strong>Automatisk OpenAPI 3 og Swagger UI</strong> på <code>/docs</code> — all
              API-dokumentasjon genereres fra type-hints og Pydantic-modeller.
            </li>
            <li>
              <strong>Dependency injection</strong> som er enklere enn Flasks decorators eller
              before_request — og som kan testes via override.
            </li>
          </ul>
        </section>

        <section id="type-hints" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Type-hints driver alt</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            I Flask er type-hints kosmetiske — de hjelper IDE-en, men har ingen kjøretidseffekt.
            FastAPI bruker dem aktivt:
          </p>
          <pre className="text-xs overflow-x-auto bg-muted/40 p-4 rounded-lg leading-relaxed">
            <code className="font-mono">{`from fastapi import FastAPI
app = FastAPI()

@app.get("/kunder/{kid}")
def hent(kid: int, sortert: bool = True):
    return {"id": kid, "sortert": sortert}

# • kid: int   → path-param, validert som int
#                  /kunder/abc  → 422 Unprocessable Entity
# • sortert    → query-param fordi den ikke er i path-en
# • bool       → "true"/"1"/"yes" → True; "false"/"0"/"no" → False
`}</code>
          </pre>
        </section>

        <section id="pydantic" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Pydantic-modeller for body</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Argumenter som er Pydantic-klasser blir lest fra request body:
          </p>
          <pre className="text-xs overflow-x-auto bg-muted/40 p-4 rounded-lg leading-relaxed">
            <code className="font-mono">{`from pydantic import BaseModel

class KundeInn(BaseModel):
    navn: str
    epost: str
    alder: int | None = None      # valgfritt

class KundeUt(BaseModel):
    id: int
    navn: str

@app.post("/kunder", status_code=201, response_model=KundeUt)
def opprett(kunde: KundeInn):
    # Pydantic har allerede validert. Hvis vi kommer hit, har vi gyldig kunde.
    return KundeUt(id=42, navn=kunde.navn)
    # response_model filtrerer bort epost/alder fra svaret — sikkerhet!`}</code>
          </pre>
        </section>

        <section id="async" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Async / await</h2>
          <div className="overflow-hidden rounded-lg border border-border mb-3">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-32">Funksjons-type</th>
                  <th className="text-left font-semibold px-4 py-2">Når bruke</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">async def</td>
                  <td className="px-4 py-3">
                    Når du <code>await</code>-er noe (DB-driver, HTTP-kall, fil-IO med aiofiles).
                    Kjører i event-loopen.
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">def</td>
                  <td className="px-4 py-3">
                    Når du har CPU-tunge ting eller libraries uten async. FastAPI kjører dem i en
                    thread pool så de ikke blokkerer event-loopen.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <pre className="text-xs overflow-x-auto bg-muted/40 p-4 rounded-lg leading-relaxed">
            <code className="font-mono">{`import asyncio
import httpx

@app.get("/sakte")
async def sakte():
    await asyncio.sleep(1)            # gir tråden tilbake til event-loopen
    return {"resultat": "ferdig"}

@app.get("/kall-google")
async def kall_google():
    async with httpx.AsyncClient() as klient:
        r = await klient.get("https://www.google.com")
    return {"status": r.status_code}`}</code>
          </pre>
        </section>

        <section id="depends" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Dependency injection</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            FastAPIs killer-funksjon: gjør gjenbrukbare dependencies som kan testes og
            overrides. Erstatter Flasks <code>before_request</code> + globals.
          </p>
          <pre className="text-xs overflow-x-auto bg-muted/40 p-4 rounded-lg leading-relaxed">
            <code className="font-mono">{`from fastapi import Depends, Header, HTTPException

def get_db():
    db = sqlite3.connect(":memory:")
    try:
        yield db        # yield = setup før, cleanup etter (som Flasks teardown)
    finally:
        db.close()

def krev_token(authorization: str = Header(None)):
    if authorization != "Bearer demo":
        raise HTTPException(401, "Manglende eller ugyldig token")

@app.get("/api/kunder", dependencies=[Depends(krev_token)])
def liste(db = Depends(get_db)):
    return [r for r in db.execute("SELECT * FROM kunde")]`}</code>
          </pre>
          <p className="text-xs text-muted-foreground mt-2">
            Dependencies kan ha sub-dependencies — får du <em>get_current_user</em> så kan den
            interne <em>krev_token</em>-en kjøres automatisk.
          </p>
        </section>

        <section id="openapi" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Automatisk OpenAPI / Swagger</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Du har AKKURAT skrevet noen routes med Pydantic-modeller. Da har du også fått:
          </p>
          <ul className="text-sm space-y-1 list-disc pl-5">
            <li>
              <code>/docs</code> — interaktiv Swagger UI (klikk og test endpoints i nettleseren)
            </li>
            <li>
              <code>/redoc</code> — pen statisk dokumentasjon (ReDoc-stil)
            </li>
            <li>
              <code>/openapi.json</code> — komplett OpenAPI 3-skjema som frontend-team kan generere
              TypeScript-klienter fra
            </li>
          </ul>
          <p className="text-xs text-muted-foreground mt-3">
            Dette gjør FastAPI svært populær for backend som leveres til mobil/web-team — de får
            type-safe klient-kode automatisk.
          </p>
        </section>

        <section id="vs" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Flask vs FastAPI cheat-sheet</h2>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-40">Hva</th>
                  <th className="text-left font-semibold px-4 py-2">Flask</th>
                  <th className="text-left font-semibold px-4 py-2">FastAPI</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-2.5 font-mono text-brand">Route</td>
                  <td className="px-4 py-2.5"><code>@app.route("/x")</code></td>
                  <td className="px-4 py-2.5"><code>@app.get("/x")</code> / .post / .put / …</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2.5 font-mono text-brand">Path-param</td>
                  <td className="px-4 py-2.5"><code>{`<int:id>`}</code></td>
                  <td className="px-4 py-2.5"><code>{`{id}`}</code> + <code>id: int</code></td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2.5 font-mono text-brand">JSON request</td>
                  <td className="px-4 py-2.5"><code>request.get_json()</code> manuelt</td>
                  <td className="px-4 py-2.5">Pydantic-modell som arg — automatisk</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2.5 font-mono text-brand">JSON response</td>
                  <td className="px-4 py-2.5"><code>jsonify(...)</code></td>
                  <td className="px-4 py-2.5">Returner dict/Pydantic — auto-serialisert</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2.5 font-mono text-brand">Validering</td>
                  <td className="px-4 py-2.5">Skriv selv eller Flask-WTF</td>
                  <td className="px-4 py-2.5">Pydantic — gratis</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2.5 font-mono text-brand">Dependency injection</td>
                  <td className="px-4 py-2.5">before_request + g</td>
                  <td className="px-4 py-2.5">Depends()</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2.5 font-mono text-brand">Async</td>
                  <td className="px-4 py-2.5">Quart for async, ellers WSGI sync</td>
                  <td className="px-4 py-2.5">Native — async def routes</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2.5 font-mono text-brand">Doc-generering</td>
                  <td className="px-4 py-2.5">Manuelt (Sphinx, Swagger spec for hånd)</td>
                  <td className="px-4 py-2.5">Automatisk Swagger + ReDoc + OpenAPI 3</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2.5 font-mono text-brand">Templating</td>
                  <td className="px-4 py-2.5">Jinja2 innebygd</td>
                  <td className="px-4 py-2.5">Jinja2 valgfritt — FastAPI er API-først</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2.5 font-mono text-brand">Test-client</td>
                  <td className="px-4 py-2.5"><code>app.test_client()</code></td>
                  <td className="px-4 py-2.5"><code>TestClient(app)</code> fra fastapi.testclient</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2.5 font-mono text-brand">Server</td>
                  <td className="px-4 py-2.5">Flask dev-server, prod via gunicorn</td>
                  <td className="px-4 py-2.5">uvicorn (ASGI)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="ref" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">8. Eksamen-quick-ref</h2>
          <div className="rounded-xl border border-brand/40 bg-brand/5 p-5">
            <ul className="text-sm space-y-2">
              <li>
                <strong>Når velge FastAPI?</strong> Når API-et er hovedproduktet (mobile/SPA-frontend)
                eller du trenger async I/O.
              </li>
              <li>
                <strong>Når velge Flask?</strong> Når du leverer HTML-sider med Jinja-templates,
                eller når økosystemet rundt allerede er Flask (mange tutorials, plugins).
              </li>
              <li>
                <strong>Hva er Pydantic?</strong> Et datavaliderings-bibliotek basert på type-hints.
                FastAPIs ryggrad — Python-type → kjøretids-validering.
              </li>
              <li>
                <strong>Hvorfor 422 og ikke 400?</strong> 400 = generelt bad request (du forsto ikke
                hva klienten sendte). 422 = du forsto, men dataen er ugyldig. FastAPI bruker 422 for
                Pydantic-feil.
              </li>
              <li>
                <strong>ASGI vs WSGI?</strong> WSGI = synkron (Flask). ASGI = asynkron + WebSocket
                (FastAPI). uvicorn er en ASGI-server.
              </li>
              <li>
                <strong>response_model?</strong> Filtrerer responsen til kun feltene i modellen —
                viktig sikkerhetsmønster (ikke lekk passord-hash ut av API).
              </li>
            </ul>
          </div>
        </section>
      </article>
    </StackPageShell>
  );
}
