import { Link } from "@tanstack/react-router";
import { Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";

const STEPS = [
  { title: "Test-pyramiden", anchor: "pyramide" },
  { title: "Unit-tester — innerst", anchor: "unit" },
  { title: "Integration-tester — med ekte DB", anchor: "integration" },
  { title: "Contract-tester — mot OpenAPI", anchor: "contract" },
  { title: "E2E-tester — gjennom hele stacken", anchor: "e2e" },
  { title: "Fixtures, mocks og fakes", anchor: "fixtures" },
  { title: "Snapshot- og property-tester", anchor: "snapshot" },
];

export function ApiTestingPage() {
  return (
    <StackPageShell title="API-testing — pyramide og praksis" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            API-prosjekt · Del 4 av 5
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            API-testing — pyramide og praksis
          </h1>
          <p className="mt-3 text-muted-foreground">
            Hvilken type test skriver du for hva? Mange tester samme ting på
            tre nivåer og får tregt testsett uten økt tillit. Vi går gjennom
            pyramiden, contract-testing og fixtures.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Drill:</span>{" "}
              <Link to="/drag" className="text-brand hover:underline">drag-oppgavene</Link>{" "}
              under «API-prosjekt» — pyramide-match, fixture vs mock, integration vs E2E.
            </div>
          </div>
        </div>

        <CourseOutline courseId="api-testing" steps={STEPS} />

        <section id="pyramide" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Test-pyramiden</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Mike Cohns klassiske modell. Mye unit, færre integration, enda
            færre E2E. Pyramiden — ikke is-kjegle (mye E2E, lite unit) som blir
            tregt og flaky.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`             ╱──╲
            ╱E2E ╲          ──  få, trege, kjør 1×/dag
           ╱──────╲
          ╱Contract╲        ──  noen, kjør i CI
         ╱──────────╲
        ╱Integration ╲      ──  mange, kjør på PR
       ╱──────────────╲
      ╱     Unit       ╲    ──  hundrevis, kjør hvert sekund
     ╱──────────────────╲

  Antall:        Fart:           Tillit per test:
   E2E:    < 50  sekunder/min    HØY (men flaky)
   Integ:  ~500  100ms-1s         middels
   Unit:   1000+ ms                lav (men dekker grenseflater)`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Prinsipp:</strong> test så langt nede i pyramiden som
            mulig. En unit-test er 100× raskere enn en E2E-test, lett å
            debugge, og forteller deg presist hva som er galt.
          </p>
        </section>

        <section id="unit" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Unit-tester — innerst</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Tester én funksjon eller klasse isolert. Ingen DB, ingen HTTP,
            ingen filsystem. Dependencies mockes/fakes.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`# Service med injectet repo
def test_opprett_bestilling_uten_lager_kaster_feil():
    fake_repo = FakeProduktRepo({1: Produkt(id=1, paa_lager=0)})
    service = BestillingService(produkt_repo=fake_repo)

    with pytest.raises(InsufficientStockError):
        service.opprett_bestilling(produkt_id=1, antall=1)

# Kjøretid: ~1 ms.  Ingen DB. Tester forretningsregelen.`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Hva unit-tester IKKE fanger:</strong> at SQL-en din er
            korrekt, at JSON-formatet matcher kontrakten, at to services
            integreres riktig. Det dekkes høyere i pyramiden.
          </p>
        </section>

        <section id="integration" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Integration-tester — med ekte DB</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Tester at flere komponenter spiller sammen. Typisk:
            controller + service + repo + ekte DB i container (test-Postgres
            via Docker eller in-memory SQLite).
          </p>

          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`# Bruker FastAPIs TestClient + ekte test-DB
def test_post_bestilling_oppretter_rad_i_db(client, db_session):
    # Arrange
    db_session.add(Produkt(id=1, navn="X", paa_lager=10))
    db_session.commit()

    # Act
    response = client.post("/bestillinger", json={
        "produkt_id": 1, "antall": 2
    })

    # Assert
    assert response.status_code == 201
    body = response.json()
    assert body["antall"] == 2
    # Verifiser i DB
    row = db_session.query(Bestilling).get(body["id"])
    assert row.antall == 2`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Kjøretid:</strong> ~100ms-1s per test. Bruker fixtures
            (under) for å rydde DB mellom tester.
          </p>
        </section>

        <section id="contract" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Contract-tester — mot OpenAPI</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Verifiserer at APIets faktiske respons MATCHER det OpenAPI-spec-en
            lover. Beskytter mot å bryte kontrakten utilsiktet.
          </p>

          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              To former
            </div>
            <ul className="space-y-2 text-sm">
              <li><strong>Schema-tests:</strong> sjekker at hver respons matcher OpenAPI-schema. Verktøy: schemathesis, dredd.</li>
              <li><strong>Consumer-driven contract tests (CDC):</strong> konsumenten skriver kontrakts-eksempler («når jeg ber om X forventer jeg Y»). Produsenten kjører disse mot seg selv. Verktøy: Pact.</li>
            </ul>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`# Med schemathesis — auto-genererte tester fra OpenAPI
$ schemathesis run http://localhost:8000/openapi.json

  ✓ GET /bestillinger/{id}
  ✓ POST /bestillinger
  ✗ DELETE /bestillinger/{id}
      Response status 204 not in spec (spec said 200)`}</pre>
          </div>
        </section>

        <section id="e2e" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. E2E-tester — gjennom hele stacken</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Hele systemet, ekte komponenter (ekte DB, ekte queue, ekte tredjeparts
            der mulig — eller staged). Tester at de viktigste brukerflytene
            fungerer.
          </p>

          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`# Eksempel: bestilling fra start til faktura
def test_bestilling_e2e():
    # 1. Bruker registrerer seg
    r = client.post("/brukere", json={"epost": "...", "passord": "..."})
    bruker_id = r.json()["id"]

    # 2. Bruker logger inn og får token
    r = client.post("/login", json={"epost": "...", "passord": "..."})
    token = r.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3. Bruker oppretter bestilling
    r = client.post("/bestillinger",
                    json={"produkt_id": 1, "antall": 2},
                    headers=headers)
    assert r.status_code == 201
    bestilling_id = r.json()["id"]

    # 4. Sjekk at faktura ble generert (eventuell async — poll med timeout)
    faktura = wait_for_faktura(bestilling_id, timeout=10)
    assert faktura is not None`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Hold tallet lavt</strong> — 5-15 E2E-tester for de viktigste
            brukerflytene. Mer enn det blir treghet og flakiness.
          </p>
        </section>

        <section id="fixtures" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Fixtures, mocks og fakes</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Tre relaterte konsepter som lett rotes sammen.
          </p>

          <div className="overflow-hidden rounded-lg border border-border mb-4">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-32">Type</th>
                  <th className="text-left font-semibold px-4 py-2">Hva</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border"><td className="px-4 py-3 font-medium">Fixture</td><td className="px-4 py-3 text-muted-foreground">Klargjøring som mange tester bruker — eks: «ren DB», «innlogget bruker», «en betalt bestilling»</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-medium">Mock</td><td className="px-4 py-3 text-muted-foreground">Falsk objekt som verifiserer at riktige kall ble gjort («atferd-verifikasjon»)</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-medium">Stub</td><td className="px-4 py-3 text-muted-foreground">Falsk objekt som bare returnerer hardkodede svar</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-medium">Fake</td><td className="px-4 py-3 text-muted-foreground">Forenklet, men FUNGERENDE implementasjon (eks: in-memory repo)</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-medium">Spy</td><td className="px-4 py-3 text-muted-foreground">Som mock, men registrerer kall til etterkontroll</td></tr>
              </tbody>
            </table>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Pytest-fixture eksempel
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`@pytest.fixture
def db_session():
    engine = create_engine("postgresql://test-db/...")
    SessionLocal = sessionmaker(bind=engine)
    session = SessionLocal()
    yield session
    # Cleanup etter testen
    session.rollback()
    session.close()

@pytest.fixture
def innlogget_kunde(db_session, client):
    kunde = Kunde(epost="kari@a.no")
    db_session.add(kunde); db_session.commit()
    response = client.post("/login", json={...})
    return {"kunde": kunde, "token": response.json()["token"]}`}</pre>
          </div>
        </section>

        <section id="snapshot" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Snapshot- og property-tester</h2>
          <p className="text-sm text-muted-foreground mb-4">
            To spesialiserte teknikker som ofte glemmes.
          </p>

          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Snapshot-tester
            </div>
            <p className="text-sm text-foreground mb-2">
              Lagre forventet output ÉN gang som «snapshot», sjekk hver kjøring
              at output matcher. Bra for komplekse JSON-strukturer der å skrive
              assertions manuelt blir 50 linjer.
            </p>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`def test_bestillingsbekreftelse_format(snapshot):
    output = render_bestilling(b)
    snapshot.assert_match(output, "bekreftelse.json")
# Når du endrer formatet: kjør med --snapshot-update for å oppdatere.`}</pre>
            <p className="mt-3 text-xs text-muted-foreground">
              <strong>Felle:</strong> «aksepter alle endringer» blir lett til
              «aksepter nytt buggy output». Snapshot-endringer må code-reviewes.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Property-baserte tester (hypothesis)
            </div>
            <p className="text-sm text-foreground mb-2">
              I stedet for konkrete eksempler («2 + 2 = 4»), formuler en
              egenskap («for alle a, b: add(a,b) == add(b,a)»). Rammeverket
              genererer 100-tals tilfeldige input.
            </p>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`from hypothesis import given, strategies as st

@given(st.integers(min_value=0), st.integers(min_value=1))
def test_total_alltid_positiv(antall, pris):
    assert beregn_total(antall, pris) >= 0`}</pre>
            <p className="mt-3 text-xs text-muted-foreground">
              Finner edge cases du ikke tenkte på: <code>0</code>,{" "}
              <code>2**31</code>, NaN, tomme strenger.
            </p>
          </div>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/drag" className="text-brand hover:underline">Drag-oppgaver</Link>
              : pyramide-match, fixture vs mock, integration vs E2E.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "api-deploy" }} className="text-brand hover:underline">
                Deploy
              </Link>
              : Docker, CI/CD, monitoring, runbooks.
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
