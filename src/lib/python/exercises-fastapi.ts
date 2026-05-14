import type { PyExercise } from "./types";

/**
 * FastAPI-oppgaver. FastAPI har ikke ekte runtime i Pyodide (uvicorn er
 * native), så oppgavene bruker `TestClient` der det er nødvendig — eller
 * sjekker bare strukturen på koden via mock-Pydantic.
 *
 * Oppgavene introduserer FastAPI-konseptene parallelt med Flask-sporet:
 * type hints, Pydantic-modeller, dependency injection, async, OpenAPI.
 */
export const PY_FASTAPI_EXERCISES: PyExercise[] = [
  {
    id: "py-fastapi-hello",
    topic: "FastAPI",
    title: "Første FastAPI-route",
    description:
      "Lag en GET-route /hello som returnerer {\"melding\": \"hei\"}. Bruk dekoratoren @app.get(...). FastAPI returnerer dict-er som JSON automatisk — du trenger ikke jsonify.",
    requires: ["fastapi"],
    starter: `from fastapi import FastAPI
from fastapi.testclient import TestClient

app = FastAPI()

# === OPPGAVE ===
# • @app.get("/hello") definerer en GET-route
# • Returner en dict — FastAPI serialiserer den automatisk til JSON

# TODO: skriv route-funksjonen din her


client = TestClient(app)
r = client.get("/hello")
print(r.status_code, r.json())
assert r.status_code == 200
assert r.json() == {"melding": "hei"}
print("OK")
`,
    solution: `from fastapi import FastAPI
from fastapi.testclient import TestClient

app = FastAPI()

@app.get("/hello")
def hello():
    return {"melding": "hei"}


client = TestClient(app)
r = client.get("/hello")
assert r.status_code == 200
assert r.json() == {"melding": "hei"}
print("OK")
`,
    hints: [
      "Bruk @app.get(\"/hello\") som dekorator over funksjonen.",
      "Funksjonsnavnet bestemmer ikke URL-en — det er strengen i dekoratoren som gjør det.",
      "Returner en dict — FastAPI lager JSON og setter Content-Type: application/json.",
    ],
    docs: [
      {
        title: "FastAPI — First Steps",
        url: "https://fastapi.tiangolo.com/tutorial/first-steps/",
        note: "Sammenlign med Flask: ingen render_template, ingen jsonify — bare returner data.",
      },
    ],
  },

  {
    id: "py-fastapi-path-param",
    topic: "FastAPI",
    title: "Path-parameter med type-hint",
    description:
      "Lag /kunder/{kid} som tar inn en int i URL-en. FastAPI VALIDERER typen automatisk — sender du `/kunder/abc` får du 422 Unprocessable Entity tilbake uten ekstra kode.",
    requires: ["fastapi"],
    starter: `from fastapi import FastAPI
from fastapi.testclient import TestClient

app = FastAPI()

# === OPPGAVE ===
# • Skriv route /kunder/{kid} der kid: int
# • Returner {"id": kid, "navn": f"Kunde nr {kid}"}
# • FastAPI håndterer int-validering automatisk

# TODO


client = TestClient(app)
print(client.get("/kunder/42").json())
print(client.get("/kunder/abc").status_code)  # 422 — feil type
assert client.get("/kunder/42").json() == {"id": 42, "navn": "Kunde nr 42"}
assert client.get("/kunder/abc").status_code == 422
print("OK")
`,
    solution: `from fastapi import FastAPI
from fastapi.testclient import TestClient

app = FastAPI()

@app.get("/kunder/{kid}")
def hent_kunde(kid: int):
    return {"id": kid, "navn": f"Kunde nr {kid}"}


client = TestClient(app)
assert client.get("/kunder/42").json() == {"id": 42, "navn": "Kunde nr 42"}
assert client.get("/kunder/abc").status_code == 422
print("OK")
`,
    hints: [
      "Type-hinten kid: int er IKKE bare for IDE — FastAPI bruker den til validering.",
      "Hvis du dropper type-hinten får du str, og /kunder/abc fungerer (men sannsynligvis feil).",
      "FastAPI returnerer 422 med JSON-feilmelding ved feil type — Flask ville krasjet.",
    ],
    docs: [
      {
        title: "FastAPI — Path Parameters",
        url: "https://fastapi.tiangolo.com/tutorial/path-params/",
        note: "Type-hints driver validering, dokumentasjon og editor-completion samtidig.",
      },
    ],
  },

  {
    id: "py-fastapi-query-param",
    topic: "FastAPI",
    title: "Query-parametre med default-verdier",
    description:
      "Lag /sok som tar query-paramene q (str, default \"\") og maks (int, default 10). FastAPI parser dem automatisk fra URL-en når de IKKE er i path.",
    requires: ["fastapi"],
    starter: `from fastapi import FastAPI
from fastapi.testclient import TestClient

app = FastAPI()

# === OPPGAVE ===
# Lag /sok?q=...&maks=...
# Argumenter som IKKE er i path-en blir query-parametre i FastAPI.
# Returner {"q": q, "maks": maks}

# TODO


client = TestClient(app)
print(client.get("/sok?q=test&maks=5").json())
print(client.get("/sok").json())  # bruker default
assert client.get("/sok?q=test&maks=5").json() == {"q": "test", "maks": 5}
assert client.get("/sok").json() == {"q": "", "maks": 10}
print("OK")
`,
    solution: `from fastapi import FastAPI
from fastapi.testclient import TestClient

app = FastAPI()

@app.get("/sok")
def sok(q: str = "", maks: int = 10):
    return {"q": q, "maks": maks}


client = TestClient(app)
assert client.get("/sok?q=test&maks=5").json() == {"q": "test", "maks": 5}
assert client.get("/sok").json() == {"q": "", "maks": 10}
print("OK")
`,
    hints: [
      "Argument med default-verdi blir query-param: `q: str = \"\"`.",
      "Argument uten default blir påkrevd query-param.",
      "Argumenter som matcher {brackets} i path-en blir path-params; resten blir query-params.",
    ],
    docs: [
      {
        title: "FastAPI — Query Parameters",
        url: "https://fastapi.tiangolo.com/tutorial/query-params/",
        note: "Type bestemmer parsing: int → int(), bool → 1/true/yes konvertering, etc.",
      },
    ],
  },

  {
    id: "py-fastapi-pydantic-body",
    topic: "FastAPI",
    title: "Pydantic-modell for request body",
    description:
      "Definer en Pydantic-modell `KundeNy` med navn (str) og epost (str). Lag POST /kunder som tar imot JSON som matcher modellen, og returnerer kunden med en falsk id=42. Pydantic validerer automatisk — feil typer gir 422.",
    requires: ["fastapi"],
    starter: `from fastapi import FastAPI
from fastapi.testclient import TestClient
from pydantic import BaseModel

app = FastAPI()

# === OPPGAVE ===
# 1) Definer KundeNy(BaseModel) med navn: str og epost: str
# 2) Lag POST /kunder som tar imot KundeNy og returnerer {"id": 42, **kunde.dict()}

# TODO: KundeNy-modell

# TODO: POST-route


client = TestClient(app)
r = client.post("/kunder", json={"navn": "Ola", "epost": "ola@ex.no"})
print(r.json())
assert r.status_code == 200
assert r.json() == {"id": 42, "navn": "Ola", "epost": "ola@ex.no"}

# Manglende felt → 422
r2 = client.post("/kunder", json={"navn": "Ola"})
assert r2.status_code == 422
print("OK")
`,
    solution: `from fastapi import FastAPI
from fastapi.testclient import TestClient
from pydantic import BaseModel

app = FastAPI()

class KundeNy(BaseModel):
    navn: str
    epost: str

@app.post("/kunder")
def opprett_kunde(kunde: KundeNy):
    return {"id": 42, **kunde.dict()}


client = TestClient(app)
r = client.post("/kunder", json={"navn": "Ola", "epost": "ola@ex.no"})
assert r.status_code == 200
assert r.json() == {"id": 42, "navn": "Ola", "epost": "ola@ex.no"}

r2 = client.post("/kunder", json={"navn": "Ola"})
assert r2.status_code == 422
print("OK")
`,
    hints: [
      "Pydantic-modell = subclass av BaseModel med felt-typer.",
      "FastAPI ser argument-type i route-funksjonen; hvis det er en BaseModel parses request body som JSON.",
      "kunde.dict() konverterer modellen tilbake til en dict.",
    ],
    docs: [
      {
        title: "FastAPI — Request Body",
        url: "https://fastapi.tiangolo.com/tutorial/body/",
        note: "Pydantic er FastAPIs killer feature — ett enkelt klasseuttrykk gir validering, parsing OG OpenAPI-skjema.",
      },
    ],
  },

  {
    id: "py-fastapi-depends",
    topic: "FastAPI",
    title: "Dependency injection med Depends",
    description:
      "Lag en funksjon `get_db()` som returnerer en mock-database (en dict). Bruk Depends() til å injisere den i to routes: /kunder og /kunder/{kid}. Demonstrerer dependency injection — FastAPIs alternativ til Flasks before_request.",
    requires: ["fastapi"],
    starter: `from fastapi import FastAPI, Depends, HTTPException
from fastapi.testclient import TestClient

app = FastAPI()

DB = {1: "Ola", 2: "Kari", 3: "Per"}


def get_db():
    # TODO: returner DB
    pass


# TODO: GET /kunder — returner alle kunder fra get_db
# Bruk db: dict = Depends(get_db) som argument

# TODO: GET /kunder/{kid} — slå opp kid i db, returner navnet
# Hvis ikke funnet, raise HTTPException(404, "ikke funnet")


client = TestClient(app)
print(client.get("/kunder").json())
print(client.get("/kunder/2").json())
print(client.get("/kunder/99").status_code)
assert client.get("/kunder").json() == {"1": "Ola", "2": "Kari", "3": "Per"}
assert client.get("/kunder/2").json() == "Kari"
assert client.get("/kunder/99").status_code == 404
print("OK")
`,
    solution: `from fastapi import FastAPI, Depends, HTTPException
from fastapi.testclient import TestClient

app = FastAPI()

DB = {1: "Ola", 2: "Kari", 3: "Per"}


def get_db():
    return DB


@app.get("/kunder")
def liste(db: dict = Depends(get_db)):
    return {str(k): v for k, v in db.items()}


@app.get("/kunder/{kid}")
def en(kid: int, db: dict = Depends(get_db)):
    if kid not in db:
        raise HTTPException(404, "ikke funnet")
    return db[kid]


client = TestClient(app)
assert client.get("/kunder").json() == {"1": "Ola", "2": "Kari", "3": "Per"}
assert client.get("/kunder/2").json() == "Kari"
assert client.get("/kunder/99").status_code == 404
print("OK")
`,
    hints: [
      "Depends() lar deg trekke ut felles oppsett (DB-tilkobling, auth-sjekk) og injisere det i mange routes.",
      "FastAPI kaller get_db() før hver request og passer resultatet til route-funksjonen.",
      "HTTPException er FastAPIs måte å returnere feil-statuskoder med JSON-body.",
    ],
    docs: [
      {
        title: "FastAPI — Dependencies",
        url: "https://fastapi.tiangolo.com/tutorial/dependencies/",
        note: "Mer kraftig enn Flasks before_request — dependencies kan også ha sub-dependencies (som autentisering).",
      },
    ],
  },

  {
    id: "py-fastapi-bearer-auth",
    topic: "FastAPI",
    title: "Bearer-token-auth via dependency",
    description:
      "Lag en `verify_token(authorization: str = Header(None))` som sjekker at Authorization-headeren er `Bearer demo-token`. Bruk Depends til å beskytte /api/private. Returner 401 hvis token mangler eller er feil.",
    requires: ["fastapi"],
    starter: `from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.testclient import TestClient

app = FastAPI()

VALID_TOKEN = "Bearer demo-token"


def verify_token(authorization: str = Header(None)):
    # TODO: hvis authorization mangler eller != VALID_TOKEN → raise HTTPException(401, ...)
    pass


@app.get("/api/private", dependencies=[Depends(verify_token)])
def private():
    return {"hemmelighet": "42"}


client = TestClient(app)
print(client.get("/api/private").status_code)  # 401
print(client.get("/api/private", headers={"Authorization": "Bearer demo-token"}).status_code)  # 200
assert client.get("/api/private").status_code == 401
assert client.get("/api/private", headers={"Authorization": VALID_TOKEN}).status_code == 200
assert client.get("/api/private", headers={"Authorization": "Bearer feil"}).status_code == 401
print("OK")
`,
    solution: `from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.testclient import TestClient

app = FastAPI()

VALID_TOKEN = "Bearer demo-token"


def verify_token(authorization: str = Header(None)):
    if authorization is None or authorization != VALID_TOKEN:
        raise HTTPException(401, "Ugyldig eller manglende token")


@app.get("/api/private", dependencies=[Depends(verify_token)])
def private():
    return {"hemmelighet": "42"}


client = TestClient(app)
assert client.get("/api/private").status_code == 401
assert client.get("/api/private", headers={"Authorization": VALID_TOKEN}).status_code == 200
assert client.get("/api/private", headers={"Authorization": "Bearer feil"}).status_code == 401
print("OK")
`,
    hints: [
      "Header(None) gir default-verdi None hvis headeren mangler.",
      "Bruk dependencies=[Depends(verify_token)] hvis dependencien kun er for sin side-effekt (sjekk).",
      "Hvis du trenger token-verdien i route, bruk `token: str = Depends(verify_token)` og returner i verify.",
    ],
    docs: [
      {
        title: "FastAPI — Security Dependencies",
        url: "https://fastapi.tiangolo.com/tutorial/security/",
        note: "FastAPI har innebygd OAuth2PasswordBearer for production-bruk — vår sjekk er en pedagogisk minimum.",
      },
    ],
  },

  {
    id: "py-fastapi-async",
    topic: "FastAPI",
    title: "Async route med await",
    description:
      "Lag /sakte som er en async-funksjon. Den simulerer en treg I/O-operasjon med asyncio.sleep(0.01). Returnerer {\"resultat\": \"ferdig\"}. FastAPI håndterer async automatisk — i prod gir det enorm throughput-økning sammenlignet med Flask.",
    requires: ["fastapi"],
    starter: `import asyncio
from fastapi import FastAPI
from fastapi.testclient import TestClient

app = FastAPI()

# === OPPGAVE ===
# Skriv async def sakte() som:
# - er en async-funksjon (def → async def)
# - kjører await asyncio.sleep(0.01)
# - returnerer {"resultat": "ferdig"}

# TODO: @app.get("/sakte") og async def sakte


client = TestClient(app)
r = client.get("/sakte")
print(r.json())
assert r.json() == {"resultat": "ferdig"}
print("OK")
`,
    solution: `import asyncio
from fastapi import FastAPI
from fastapi.testclient import TestClient

app = FastAPI()

@app.get("/sakte")
async def sakte():
    await asyncio.sleep(0.01)
    return {"resultat": "ferdig"}


client = TestClient(app)
r = client.get("/sakte")
assert r.json() == {"resultat": "ferdig"}
print("OK")
`,
    hints: [
      "async def i stedet for def — gjør funksjonen asynkron.",
      "await fungerer kun inne i async-funksjoner.",
      "Synkrone (def) routes i FastAPI kjører i thread pool. Async (async def) kjører i event-loopen.",
    ],
    docs: [
      {
        title: "FastAPI — Async/Await",
        url: "https://fastapi.tiangolo.com/async/",
        note: "Bruk async når du venter på I/O (DB, HTTP). Bruk vanlig def for CPU-tunge ting eller libraries uten async-støtte.",
      },
    ],
  },

  {
    id: "py-fastapi-status-code",
    topic: "FastAPI",
    title: "Egendefinert status-kode + Response model",
    description:
      "Lag POST /kunder som returnerer 201 Created (ikke 200). Bruk `status_code=201` i dekoratoren. Definer en `KundeUt` Pydantic-modell og bruk `response_model=KundeUt` for å garantere skjema på svaret.",
    requires: ["fastapi"],
    starter: `from fastapi import FastAPI
from fastapi.testclient import TestClient
from pydantic import BaseModel

app = FastAPI()


class KundeNy(BaseModel):
    navn: str
    epost: str


class KundeUt(BaseModel):
    id: int
    navn: str
    epost: str


# === OPPGAVE ===
# POST /kunder
# - status_code=201
# - response_model=KundeUt
# - Tar imot KundeNy, returnerer KundeUt med id=99

# TODO


client = TestClient(app)
r = client.post("/kunder", json={"navn": "Ola", "epost": "ola@ex.no"})
print(r.status_code, r.json())
assert r.status_code == 201
assert r.json() == {"id": 99, "navn": "Ola", "epost": "ola@ex.no"}
print("OK")
`,
    solution: `from fastapi import FastAPI
from fastapi.testclient import TestClient
from pydantic import BaseModel

app = FastAPI()


class KundeNy(BaseModel):
    navn: str
    epost: str


class KundeUt(BaseModel):
    id: int
    navn: str
    epost: str


@app.post("/kunder", status_code=201, response_model=KundeUt)
def opprett_kunde(kunde: KundeNy):
    return KundeUt(id=99, navn=kunde.navn, epost=kunde.epost)


client = TestClient(app)
r = client.post("/kunder", json={"navn": "Ola", "epost": "ola@ex.no"})
assert r.status_code == 201
assert r.json() == {"id": 99, "navn": "Ola", "epost": "ola@ex.no"}
print("OK")
`,
    hints: [
      "status_code i @app.post(...) overrider default 200.",
      "response_model filtrerer responsen — felt som ikke er i modellen droppes (godt for sikkerhet!).",
      "201 Created er konvensjonen for vellykket POST som lager en ny ressurs.",
    ],
    docs: [
      {
        title: "FastAPI — Response Status Code",
        url: "https://fastapi.tiangolo.com/tutorial/response-status-code/",
        note: "Bruk fastapi.status (f.eks. status.HTTP_201_CREATED) for selvdokumenterende kode.",
      },
    ],
  },
];
