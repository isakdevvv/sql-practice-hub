import type { AppOption } from "./types";

/**
 * Alle options brukeren kan krysse av i FastAPI App Builder. Hver option
 * leverer kode-fragmenter som komponeres av assemble.ts.
 *
 * Antall = 26. Pydantic v2-syntaks brukes overalt (Field/field_validator).
 */
export const OPTIONS: readonly AppOption[] = [
  // ============ KJERNE (alltid på) ====================================
  {
    id: "core-app",
    category: "core",
    label: "FastAPI()-instans + tittel",
    description: "Oppretter app med title + description som dukker opp i /docs.",
    defaultOn: true,
    contributes: {
      imports: ["from fastapi import FastAPI"],
      config: [
        `app = FastAPI(
    title="Butikken API",
    description="En liten FastAPI generert av Builder-en.",
    version="0.1.0",
)`,
      ],
    },
  },
  {
    id: "core-pydantic-base",
    category: "core",
    label: "Pydantic BaseModel-import",
    description: "Importerer BaseModel og Field — grunnlaget for alle modeller.",
    defaultOn: true,
    contributes: {
      imports: ["from pydantic import BaseModel, Field"],
    },
  },
  {
    id: "core-uvicorn-run",
    category: "core",
    label: "uvicorn-run blokk (`__main__`)",
    description: "Legger til `uvicorn.run(...)` under `if __name__ == '__main__'`.",
    defaultOn: true,
    contributes: {
      imports: ["import uvicorn"],
    },
  },

  // ============ ENDEPUNKTER ===========================================
  {
    id: "ep-hjem",
    category: "endpoints",
    label: "GET / (hjem)",
    description: "Rot-endepunkt som returnerer en velkomst-melding.",
    defaultOn: true,
    contributes: {
      routes: [
        `@app.get("/", tags=["meta"])
def hjem():
    return {"melding": "Velkommen til Butikken API", "docs": "/docs"}`,
      ],
    },
  },
  {
    id: "ep-kunder-list",
    category: "endpoints",
    label: "GET /kunder",
    description: "Liste over alle kunder. Bruker response_model=list[KundeUt].",
    requires: ["model-kunde-ut"],
    contributes: {
      routes: [
        `@app.get("/kunder", response_model=list[KundeUt], tags=["kunder"])
def list_kunder():
    return list(KUNDER.values())`,
      ],
    },
  },
  {
    id: "ep-kunde-get",
    category: "endpoints",
    label: "GET /kunder/{kid}",
    description: "Hent én kunde. Returnerer 404 hvis ikke funnet.",
    requires: ["model-kunde-ut"],
    contributes: {
      imports: ["from fastapi import HTTPException, status"],
      routes: [
        `@app.get("/kunder/{kid}", response_model=KundeUt, tags=["kunder"])
def get_kunde(kid: int):
    kunde = KUNDER.get(kid)
    if kunde is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ingen kunde med id={kid}",
        )
    return kunde`,
      ],
    },
  },
  {
    id: "ep-kunde-post",
    category: "endpoints",
    label: "POST /kunder",
    description: "Opprett kunde. Returnerer 201 Created med response_model.",
    requires: ["model-kunde-in", "model-kunde-ut"],
    contributes: {
      imports: ["from fastapi import status"],
      routes: [
        `@app.post(
    "/kunder",
    response_model=KundeUt,
    status_code=status.HTTP_201_CREATED,
    tags=["kunder"],
)
def opprett_kunde(payload: KundeIn):
    global _NESTE_ID
    ny = {"id": _NESTE_ID, "navn": payload.navn, "epost": payload.epost}
    KUNDER[_NESTE_ID] = ny
    _NESTE_ID += 1
    return ny`,
      ],
    },
  },
  {
    id: "ep-kunde-put",
    category: "endpoints",
    label: "PUT /kunder/{kid}",
    description: "Oppdater eksisterende kunde. 404 hvis fraværende.",
    requires: ["model-kunde-in", "model-kunde-ut"],
    contributes: {
      imports: ["from fastapi import HTTPException, status"],
      routes: [
        `@app.put("/kunder/{kid}", response_model=KundeUt, tags=["kunder"])
def oppdater_kunde(kid: int, payload: KundeIn):
    if kid not in KUNDER:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Ikke funnet")
    KUNDER[kid] = {"id": kid, "navn": payload.navn, "epost": payload.epost}
    return KUNDER[kid]`,
      ],
    },
  },
  {
    id: "ep-kunde-delete",
    category: "endpoints",
    label: "DELETE /kunder/{kid}",
    description: "Slett kunde. Returnerer 204 No Content.",
    contributes: {
      imports: ["from fastapi import HTTPException, status"],
      routes: [
        `@app.delete(
    "/kunder/{kid}",
    status_code=status.HTTP_204_NO_CONTENT,
    tags=["kunder"],
)
def slett_kunde(kid: int):
    if kid not in KUNDER:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Ikke funnet")
    del KUNDER[kid]
    return None`,
      ],
    },
  },

  // ============ PYDANTIC-MODELLER =====================================
  {
    id: "model-kunde-in",
    category: "models",
    label: "KundeIn (input-modell)",
    description: "Modell for å motta nye kunder. Ingen id-felt.",
    defaultOn: true,
    contributes: {
      models: [
        `class KundeIn(BaseModel):
    navn: str = Field(min_length=1, max_length=80)
    epost: str | None = None`,
      ],
    },
  },
  {
    id: "model-kunde-ut",
    category: "models",
    label: "KundeUt (output-modell)",
    description: "Modell for å returnere kunder. Har id-felt.",
    defaultOn: true,
    contributes: {
      models: [
        `class KundeUt(BaseModel):
    id: int
    navn: str
    epost: str | None = None`,
      ],
      helpers: [
        `# In-memory \"database\" — byttes ut når SQLAlchemy-options brukes.
KUNDER: dict[int, dict] = {
    1: {"id": 1, "navn": "Ola Nordmann", "epost": "ola@ex.no"},
    2: {"id": 2, "navn": "Kari Hansen", "epost": "kari@ex.no"},
}
_NESTE_ID = 3`,
      ],
    },
  },
  {
    id: "model-error",
    category: "models",
    label: "ErrorResponse",
    description: "Standard feil-payload med kode + melding, brukt i OpenAPI.",
    contributes: {
      models: [
        `class ErrorResponse(BaseModel):
    kode: str
    melding: str`,
      ],
    },
  },
  {
    id: "model-paginert",
    category: "models",
    label: "Paginert<T> response-wrapper",
    description: "Generisk wrapper: { items, total, skip, limit }.",
    contributes: {
      imports: ["from typing import Generic, TypeVar"],
      models: [
        `T = TypeVar("T")


class Paginert(BaseModel, Generic[T]):
    items: list[T]
    total: int
    skip: int = 0
    limit: int = 50`,
      ],
    },
  },

  // ============ VALIDERING ============================================
  {
    id: "val-field-constraints",
    category: "validation",
    label: "Field-constraints på navn",
    description: "min_length / max_length / pattern på navn-feltet.",
    requires: ["model-kunde-in"],
    contributes: {
      // Disse er allerede i KundeIn — denne option-en demonstrerer mønsteret
      // ved å legge til en utvidet Streng-validator-modell.
      models: [
        `class KundeStreng(KundeIn):
    navn: str = Field(min_length=2, max_length=40, pattern=r"^[A-Za-zÆØÅæøå \\-]+$")`,
      ],
    },
  },
  {
    id: "val-epost-regex",
    category: "validation",
    label: "Regex-validator på epost",
    description: "Field-pattern som krever gyldig epost-format.",
    requires: ["model-kunde-in"],
    contributes: {
      models: [
        `class KundeMedEpost(KundeIn):
    epost: str = Field(
        pattern=r"^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$",
        description="Må være en gyldig epost",
    )`,
      ],
    },
  },
  {
    id: "val-custom-validator",
    category: "validation",
    label: "Custom field_validator",
    description: "Pydantic v2 @field_validator — strip whitespace + tittel-case.",
    requires: ["model-kunde-in"],
    contributes: {
      imports: ["from pydantic import field_validator"],
      models: [
        `class KundeNormalisert(KundeIn):
    @field_validator("navn")
    @classmethod
    def normaliser_navn(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("navn kan ikke være tomt")
        return v.title()`,
      ],
    },
  },

  // ============ DEPENDENCY INJECTION ==================================
  {
    id: "di-get-db",
    category: "di",
    label: "get_db (yield-dependency)",
    description: "Standard SQLAlchemy session-dep med try/finally close.",
    requires: ["db-sqlalchemy"],
    contributes: {
      dependencies: [
        `def get_db():
    """Yield en SQLAlchemy-session og lukk etter request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()`,
      ],
    },
  },
  {
    id: "di-pagination",
    category: "di",
    label: "Paginerings-dep (skip/limit)",
    description: "Klasse-basert dependency som leser ?skip=&limit= fra query.",
    contributes: {
      imports: ["from fastapi import Query"],
      dependencies: [
        `class PaginationParams:
    """Reusable pagination-dep: bruk via Depends(PaginationParams)."""

    def __init__(
        self,
        skip: int = Query(0, ge=0),
        limit: int = Query(50, ge=1, le=200),
    ) -> None:
        self.skip = skip
        self.limit = limit`,
      ],
    },
  },
  {
    id: "di-current-user",
    category: "di",
    label: "get_current_user",
    description: "Dep som henter user_id fra Authorization-header (demo).",
    contributes: {
      imports: ["from fastapi import Header, HTTPException, status"],
      dependencies: [
        `def get_current_user(authorization: str = Header(default="")):
    """Minimal demo: forventer 'Bearer <user_id>'."""
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Mangler Bearer-token",
        )
    user_id = authorization[7:]
    return {"id": user_id}`,
      ],
    },
  },

  // ============ AUTH ==================================================
  {
    id: "auth-oauth2",
    category: "auth",
    label: "OAuth2PasswordBearer-scheme",
    description: "Standard FastAPI-skjema som /docs viser som låse-ikon.",
    contributes: {
      imports: ["from fastapi.security import OAuth2PasswordBearer"],
      helpers: [
        `oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")`,
      ],
    },
  },
  {
    id: "auth-password-hash",
    category: "auth",
    label: "Passordhashing (passlib + bcrypt)",
    description: "passlib.CryptContext for hashing og verifisering.",
    contributes: {
      imports: ["from passlib.context import CryptContext"],
      helpers: [
        `pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain: str) -> str:
    return pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)`,
      ],
    },
  },
  {
    id: "auth-jwt",
    category: "auth",
    label: "JWT-creator (PyJWT)",
    description: "create_access_token + decode_access_token med HS256.",
    contributes: {
      imports: [
        "import jwt",
        "from datetime import datetime, timedelta, timezone",
        "from fastapi import HTTPException, status",
      ],
      helpers: [
        `SECRET_KEY = "bytt-meg-i-produksjon"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.PyJWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Ugyldig token",
        ) from exc`,
      ],
    },
  },
  {
    id: "auth-protected-route",
    category: "auth",
    label: "Beskyttet route via Depends",
    description: "GET /me bak Depends(oauth2_scheme) — vises som låst i /docs.",
    requires: ["auth-oauth2", "auth-jwt"],
    contributes: {
      imports: ["from fastapi import Depends"],
      routes: [
        `@app.get("/me", tags=["auth"])
def les_meg(token: str = Depends(oauth2_scheme)):
    payload = decode_access_token(token)
    return {"bruker": payload.get("sub"), "exp": payload.get("exp")}`,
      ],
    },
  },

  // ============ DATABASE ==============================================
  {
    id: "db-sqlalchemy",
    category: "database",
    label: "SQLAlchemy-engine + SessionLocal + Base",
    description: "SQLite-engine (in-memory), SessionLocal-factory og Base.",
    contributes: {
      imports: [
        "from sqlalchemy import create_engine",
        "from sqlalchemy.orm import declarative_base, sessionmaker",
      ],
      dbSetup: [
        `DATABASE_URL = "sqlite:///./butikken.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()`,
      ],
    },
  },
  {
    id: "db-kunde-orm",
    category: "database",
    label: "Kunde ORM-modell + create_all",
    description: "SQLAlchemy-modell + Base.metadata.create_all(engine).",
    requires: ["db-sqlalchemy"],
    contributes: {
      imports: [
        "from sqlalchemy import Column, Integer, String",
      ],
      dbSetup: [
        `class KundeORM(Base):
    __tablename__ = "kunde"

    id = Column(Integer, primary_key=True, index=True)
    navn = Column(String(80), nullable=False)
    epost = Column(String(120), nullable=True)


Base.metadata.create_all(bind=engine)`,
      ],
    },
  },
  {
    id: "db-crud-route",
    category: "database",
    label: "CRUD-route via get_db",
    description: "GET /db/kunder som bruker Depends(get_db) og SQLAlchemy.",
    requires: ["db-kunde-orm", "di-get-db", "model-kunde-ut"],
    contributes: {
      imports: ["from fastapi import Depends", "from sqlalchemy.orm import Session"],
      routes: [
        `@app.get("/db/kunder", response_model=list[KundeUt], tags=["db"])
def db_list_kunder(db: Session = Depends(get_db)):
    rader = db.query(KundeORM).all()
    return [{"id": k.id, "navn": k.navn, "epost": k.epost} for k in rader]`,
      ],
    },
  },

  // ============ TEST & DOCS ===========================================
  {
    id: "docs-tags",
    category: "docs",
    label: "OpenAPI-tag-grupperingsmetadata",
    description: "openapi_tags=[...] gir kategorier i /docs.",
    contributes: {
      helpers: [
        `app.openapi_tags = [
    {"name": "meta", "description": "Helse og hjem"},
    {"name": "kunder", "description": "CRUD for kunder"},
    {"name": "auth", "description": "Login og brukerprofil"},
    {"name": "db", "description": "Eksempler med SQLAlchemy"},
]`,
      ],
    },
  },
  {
    id: "docs-redoc",
    category: "docs",
    label: "/redoc aktivert (default)",
    description: "ReDoc-versjon av OpenAPI-dokumentasjonen på /redoc.",
    contributes: {
      // FastAPI har /redoc by default — denne option-en eksponerer URL-en
      // i hjem-responsen og dokumenterer hvor man finner den.
      helpers: [
        `# /redoc er aktivert as standard. For å slå AV: app.redoc_url = None
# /docs (Swagger UI) er også på som standard.`,
      ],
    },
  },
  {
    id: "docs-testclient",
    category: "docs",
    label: "TestClient-stub",
    description: "Demo-tester med fastapi.testclient.TestClient.",
    contributes: {
      imports: ["from fastapi.testclient import TestClient"],
      tests: [
        `client = TestClient(app)
r = client.get("/")
print("GET / →", r.status_code, r.json())
r = client.get("/kunder")
print("GET /kunder →", r.status_code, r.json() if r.status_code == 200 else r.text)`,
      ],
    },
  },
];
