import type { FlashCard } from "./types";

// Cards drawn from the DAT1000 curriculum (Kap. 1-9 + Del 6 fasit).
// Group by category so the user can drill one topic at a time.

export const FLASHCARDS: FlashCard[] = [
  // ============= BEGREP =============
  {
    id: "c-db",
    category: "begrep",
    topic: "Grunnbegrep",
    question: "Hva er en database?",
    answer:
      "Et system for å lagre, organisere og hente data på en strukturert måte. Data lagres i tabeller med tydelig struktur framfor i filer eller regneark.",
  },
  {
    id: "c-tabell",
    category: "begrep",
    topic: "Grunnbegrep",
    question: "Hva er en tabell?",
    answer: "Data organisert i rader og kolonner. Én tabell representerer typisk én entitet, f.eks. Kunde eller Utleie.",
  },
  {
    id: "c-rad",
    category: "begrep",
    topic: "Grunnbegrep",
    question: "Hva er en rad?",
    answer: "Én registrering i en tabell — for eksempel én konkret kunde.",
  },
  {
    id: "c-kolonne",
    category: "begrep",
    topic: "Grunnbegrep",
    question: "Hva er en kolonne?",
    answer: "Et felt eller en egenskap i tabellen. F.eks. Navn, KundeNr, Pris.",
  },
  {
    id: "c-pk",
    category: "begrep",
    topic: "Nøkler",
    question: "Hva er en primærnøkkel?",
    answer:
      "En unik identifikator for hver rad i en tabell. Verdien må være unik og kan ikke være NULL.",
  },
  {
    id: "c-fk",
    category: "begrep",
    topic: "Nøkler",
    question: "Hva er en fremmednøkkel?",
    answer:
      "En kolonne som peker til primærnøkkelen i en annen tabell. Brukes for å koble tabeller sammen.",
  },
  {
    id: "c-pk-vs-fk",
    category: "begrep",
    topic: "Nøkler",
    question: "Forskjell på primærnøkkel og fremmednøkkel?",
    answer:
      "Primærnøkkel identifiserer hver rad unikt i sin egen tabell. Fremmednøkkel peker til en primærnøkkel i en annen tabell og brukes for å koble tabeller.",
  },
  {
    id: "c-relasjon",
    category: "begrep",
    topic: "Relasjoner",
    question: "Hva betyr 1:1, 1:M og M:N?",
    answer:
      "1:1: én rad i A hører til én rad i B. 1:M: én rad i A kan høre til mange rader i B. M:N: mange rader i A kan høre til mange rader i B — løses med koblingstabell.",
    visual: "relationship-kinds",
  },
  {
    id: "c-mn",
    category: "begrep",
    topic: "Relasjoner",
    question: "Hvordan løses en mange-til-mange-relasjon?",
    answer:
      "Med en koblingstabell som inneholder fremmednøkler til begge tabeller. F.eks. StudentKurs som kobler Student og Kurs.",
  },
  {
    id: "c-kard",
    category: "begrep",
    topic: "Relasjoner",
    question: "Hva er kardinalitet?",
    answer:
      "Beskriver hvor mange forekomster av én entitet som kan kobles til en annen — f.eks. én kunde kan ha mange utleier (1:M). I kråkefotnotasjonen vises dette med symboler i hver ende av relasjonslinjen.",
    visual: "crows-foot-cheat",
  },
  {
    id: "c-ref-int",
    category: "begrep",
    topic: "Integritet",
    question: "Hva betyr referanseintegritet?",
    answer:
      "At koblinger mellom tabeller alltid er gyldige. En utleie kan ikke peke til en kunde som ikke finnes.",
  },
  {
    id: "c-redundans",
    category: "begrep",
    topic: "Integritet",
    question: "Hva er redundans?",
    answer:
      "Dobbeltlagring av data. Gir større databaser, mer plassbruk og høyere risiko for inkonsistente data.",
  },
  {
    id: "c-norm-1",
    category: "design",
    topic: "Normalisering",
    question: "Hva er 1NF?",
    answer:
      "Alle verdier skal være atomiske — ingen lister eller repeterende grupper i én kolonne. Hvert felt inneholder én verdi.",
  },
  {
    id: "c-norm-2",
    category: "design",
    topic: "Normalisering",
    question: "Hva er 2NF?",
    answer:
      "Tabellen er i 1NF, og alle ikke-nøkkelattributter avhenger av HELE primærnøkkelen — viktig ved sammensatte nøkler.",
  },
  {
    id: "c-norm-3",
    category: "design",
    topic: "Normalisering",
    question: "Hva er 3NF?",
    answer:
      "Tabellen er i 2NF og har ingen transitive avhengigheter. Et ikke-nøkkelfelt skal ikke avhenge av et annet ikke-nøkkelfelt.",
  },
  {
    id: "c-norm-trans",
    category: "design",
    topic: "Normalisering",
    question: "Hva er en transitiv avhengighet?",
    answer:
      "Et felt som avhenger av et annet ikke-nøkkelfelt. Eks: KundeNr → PostNr → Poststed. Poststed avhenger ikke direkte av KundeNr — løses ved egen Poststed-tabell.",
    visual: "normalization-split",
  },
  {
    id: "c-fwd-rev",
    category: "design",
    topic: "Verktøy",
    question: "Forskjell på Forward og Reverse Engineer?",
    answer:
      "Forward: lage database fra ER-modell. Reverse: lage ER-modell fra eksisterende database. Begge gjøres i MySQL Workbench.",
  },
  {
    id: "c-server-vs-wb",
    category: "design",
    topic: "Verktøy",
    question: "MySQL Server vs. MySQL Workbench?",
    answer:
      "Server er selve databasesystemet som lagrer data og kjører SQL. Workbench er et grafisk verktøy som kobler seg til serveren — for å skrive SQL, lage ER-diagrammer og eksportere/importere.",
  },

  // ============= SQL =============
  {
    id: "c-select",
    category: "sql",
    topic: "SELECT",
    question: "Hva gjør SELECT *?",
    answer: "Henter alle kolonner fra tabellen. Uten WHERE returneres alle rader.",
    code: "SELECT * FROM kunde;",
  },
  {
    id: "c-where-having",
    category: "sql",
    topic: "WHERE / HAVING",
    question: "Forskjell på WHERE og HAVING?",
    answer:
      "WHERE filtrerer rader FØR gruppering. HAVING filtrerer GRUPPER etter GROUP BY. Aggregater som COUNT/SUM kan bare brukes i HAVING (eller SELECT).",
  },
  {
    id: "c-isnull",
    category: "sql",
    topic: "NULL",
    question: "Hvorfor virker ikke `WHERE x = NULL`?",
    answer:
      "NULL er ikke en vanlig verdi — det betyr 'ukjent'. Sammenligning med = NULL gir alltid UKJENT, aldri sant. Bruk `IS NULL` eller `IS NOT NULL`.",
  },
  {
    id: "c-orderby",
    category: "sql",
    topic: "ORDER BY",
    question: "Hva gjør ORDER BY ... DESC?",
    answer: "Sorterer resultatet synkende (høyeste først). ASC er standard og betyr stigende.",
    code: "SELECT * FROM utleie ORDER BY pris DESC;",
  },
  {
    id: "c-groupby",
    category: "sql",
    topic: "GROUP BY",
    question: "Hva brukes GROUP BY til?",
    answer:
      "Grupperer rader som har samme verdi i én eller flere kolonner. Brukes sammen med aggregater (COUNT, SUM, AVG, MIN, MAX) for å regne per gruppe.",
    code: "SELECT deptno, COUNT(*) FROM emp GROUP BY deptno;",
  },
  {
    id: "c-distinct",
    category: "sql",
    topic: "DISTINCT",
    question: "Hva gjør DISTINCT?",
    answer: "Fjerner duplikater fra resultatet — viser hver unik kombinasjon av valgte kolonner én gang.",
    code: "SELECT DISTINCT category FROM products;",
  },
  {
    id: "c-like",
    category: "sql",
    topic: "LIKE",
    question: "Hva betyr `%` i LIKE?",
    answer:
      "% står for vilkårlig antall tegn. 'A%' = starter med A. '%sen' = slutter på sen. '%ann%' = inneholder ann.",
  },
  {
    id: "c-between",
    category: "sql",
    topic: "BETWEEN",
    question: "Er BETWEEN inklusiv eller eksklusiv?",
    answer:
      "Inklusiv. `BETWEEN 100 AND 500` tar med både 100 og 500.",
  },
  {
    id: "c-in",
    category: "sql",
    topic: "IN",
    question: "Hva gjør IN?",
    answer:
      "Sjekker om en verdi finnes i en gitt liste — kortform for flere OR-uttrykk.",
    code: "WHERE kundenr IN (1, 2, 5)",
  },
  {
    id: "c-count-star",
    category: "sql",
    topic: "Aggregater",
    question: "Hva er forskjellen på COUNT(*) og COUNT(kolonne)?",
    answer:
      "COUNT(*) teller alle rader. COUNT(kolonne) teller bare rader hvor kolonnen ikke er NULL.",
  },
  {
    id: "c-inner-join",
    category: "sql",
    topic: "JOIN",
    question: "Hva er INNER JOIN?",
    answer:
      "Returnerer kun rader som har match i begge tabeller. Rader uten match (på begge sider) faller bort.",
    visual: "join-venn-inner",
  },
  {
    id: "c-left-join",
    category: "sql",
    topic: "JOIN",
    question: "Hva er LEFT JOIN?",
    answer:
      "Tar med ALLE rader fra venstre tabell. Hvis høyre side ikke matcher, fylles de høyre kolonnene med NULL.",
    visual: "join-venn-left",
  },
  {
    id: "c-right-join",
    category: "sql",
    topic: "JOIN",
    question: "Hva er RIGHT JOIN?",
    answer:
      "Tar med ALLE rader fra høyre tabell. Hvis venstre side ikke matcher, fylles de venstre kolonnene med NULL. Sjelden brukt — kan alltid skrives om som LEFT JOIN ved å bytte tabellrekkefølge.",
  },
  {
    id: "c-full-join",
    category: "sql",
    topic: "JOIN",
    question: "Hva er FULL OUTER JOIN?",
    answer:
      "Tar med alle rader fra BÅDE venstre og høyre tabell. Manglende side fylles med NULL. Støttes ikke av MySQL — emuleres med UNION av LEFT og RIGHT JOIN.",
    visual: "join-venn-full",
  },
  {
    id: "c-cross-join",
    category: "sql",
    topic: "JOIN",
    question: "Hva er CROSS JOIN?",
    answer:
      "Kartesisk produkt — alle kombinasjoner av rader. Resultat = venstre.rows × høyre.rows. Brukes sjelden direkte.",
  },
  {
    id: "c-subquery",
    category: "sql",
    topic: "Subquery",
    question: "Hva er en subquery?",
    answer:
      "En SELECT-spørring inni en annen spørring. Den indre kjøres først og resultatet brukes av den ytre — ofte i WHERE med IN/EXISTS.",
    code: "SELECT * FROM kunde\nWHERE kundenr IN (SELECT kundenr FROM utleie);",
  },
  {
    id: "c-insert",
    category: "sql",
    topic: "DML",
    question: "Hva er syntaksen for INSERT?",
    answer: "INSERT INTO tabell (kolonne1, kolonne2) VALUES (verdi1, verdi2);",
    code: "INSERT INTO kunde (kundenr, navn)\nVALUES (1003, 'Per');",
  },
  {
    id: "c-update",
    category: "sql",
    topic: "DML",
    question: "Hva er den vanligste UPDATE-fellen?",
    answer:
      "Å glemme WHERE — da oppdateres ALLE rader i tabellen. Test alltid SELECT med samme WHERE først.",
    code: "UPDATE kunde SET fornavn = 'Pål'\nWHERE kundenr = 1003;",
  },
  {
    id: "c-delete",
    category: "sql",
    topic: "DML",
    question: "Hva skjer hvis du glemmer WHERE i DELETE?",
    answer:
      "Alle rader i tabellen slettes. Bruk transaksjon (START TRANSACTION → ROLLBACK ved feil) når du er usikker.",
  },
  {
    id: "c-eval-order",
    category: "sql",
    topic: "Evalueringsrekkefølge",
    question: "I hvilken rekkefølge evalueres en SELECT-spørring?",
    answer:
      "FROM → JOIN → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT. Forklarer hvorfor alias fra SELECT ikke kan brukes i WHERE, men kan brukes i ORDER BY.",
    visual: "sql-eval-order",
  },
  {
    id: "c-index",
    category: "sql",
    topic: "Indeks",
    question: "Hva er en indeks?",
    answer:
      "En datastruktur som gjør oppslag raskere, som registeret bakerst i en bok. Gjør SELECT/WHERE/JOIN raskere, men gjør INSERT/UPDATE/DELETE litt tregere fordi indeksen må oppdateres.",
    visual: "btree-index",
  },
  {
    id: "c-view",
    category: "sql",
    topic: "View",
    question: "Hva er et view?",
    answer:
      "En virtuell tabell basert på en SELECT-spørring. Lagres som definisjon, ikke data — kjøres på nytt når man spør den. Bra for å kapsle inn kompleks logikk.",
  },
  {
    id: "c-transaction",
    category: "sql",
    topic: "Transaksjoner",
    question: "Hva er en transaksjon?",
    answer:
      "En gruppe operasjoner som behandles som én enhet. Enten lykkes alt (COMMIT), eller alt rulles tilbake (ROLLBACK). Følger ACID.",
  },
  {
    id: "c-acid",
    category: "sql",
    topic: "Transaksjoner",
    question: "Hva står ACID for?",
    answer:
      "Atomicity (alt eller ingenting), Consistency (databasen forblir gyldig), Isolation (transaksjoner forstyrrer ikke hverandre), Durability (committet data overlever krasj).",
    visual: "acid-atomic",
  },
  {
    id: "c-commit",
    category: "sql",
    topic: "Transaksjoner",
    question: "Hva gjør COMMIT?",
    answer: "Lagrer endringene i transaksjonen permanent.",
  },
  {
    id: "c-rollback",
    category: "sql",
    topic: "Transaksjoner",
    question: "Hva gjør ROLLBACK?",
    answer: "Angrer alle endringer i transaksjonen — som om de aldri skjedde.",
  },

  // ============= FLASK =============
  {
    id: "c-flask",
    category: "flask",
    topic: "Flask",
    question: "Hva er Flask?",
    answer: "Et lett Python web-rammeverk for å lage webapplikasjoner — routing, templates, sessions, forms.",
  },
  {
    id: "c-route",
    category: "flask",
    topic: "Routing",
    question: "Hva er en route i Flask?",
    answer: "Kobling mellom en URL og en Python-funksjon. Definert med @app.route(\"/path\").",
    code: "@app.route(\"/\")\ndef home():\n    return \"Hei\"",
  },
  {
    id: "c-render",
    category: "flask",
    topic: "Templates",
    question: "Hva gjør render_template()?",
    answer:
      "Henter en HTML-fil fra templates/-mappen, fyller inn variabler via Jinja2 og returnerer ferdig HTML til nettleseren.",
  },
  {
    id: "c-templates-mappe",
    category: "flask",
    topic: "Templates",
    question: "Hvor må HTML-filer ligge?",
    answer: "I `templates/`-mappen ved siden av app.py. Flask finner dem ikke andre steder uten ekstra konfigurasjon.",
  },
  {
    id: "c-static-mappe",
    category: "flask",
    topic: "Templates",
    question: "Hvor må CSS, bilder og JS ligge?",
    answer:
      "I `static/`-mappen. Refereres med {{ url_for('static', filename='main.css') }} fra HTML.",
  },
  {
    id: "c-jinja-var",
    category: "flask",
    topic: "Jinja",
    question: "Hvordan vises en variabel i Jinja?",
    answer: "Med dobbel krøllparentes: `{{ navn }}`. Verdien escapes automatisk for å beskytte mot XSS.",
  },
  {
    id: "c-jinja-loop",
    category: "flask",
    topic: "Jinja",
    question: "Hvordan lager du en loop i Jinja?",
    answer: "Med {% for %}-blokk:",
    code: "{% for kunde in kunder %}\n  {{ kunde.navn }}\n{% endfor %}",
  },
  {
    id: "c-url-for",
    category: "flask",
    topic: "Routing",
    question: "Hvorfor bruke url_for() i stedet for hardkodet URL?",
    answer:
      "url_for genererer URLen fra route-navnet, så lenker ikke ryker når du endrer path. Mindre vedlikehold og færre 404-feil.",
  },
  {
    id: "c-crud",
    category: "flask",
    topic: "CRUD",
    question: "Hva betyr CRUD?",
    answer: "Create (INSERT), Read (SELECT), Update (UPDATE), Delete (DELETE) — de fire grunnoperasjonene.",
  },
  {
    id: "c-login-required",
    category: "flask",
    topic: "Auth",
    question: "Hva gjør @login_required?",
    answer: "Gjør at routen bare er tilgjengelig for innloggede brukere. Uinnloggede sendes til login-siden.",
  },
  {
    id: "c-current-user",
    category: "flask",
    topic: "Auth",
    question: "Hva er current_user?",
    answer: "En Flask-Login-variabel som gir tilgang til den innloggede brukeren — eller AnonymousUser hvis ikke innlogget.",
  },
  {
    id: "c-session",
    category: "flask",
    topic: "Auth",
    question: "Hva brukes Flask sessions til?",
    answer:
      "Lagre informasjon om brukeren mellom requests — typisk innlogget bruker-ID. Lagres signert i en cookie hos klienten.",
    visual: "session-flow",
  },
  {
    id: "c-secret-key",
    category: "flask",
    topic: "Auth",
    question: "Hva brukes SECRET_KEY til?",
    answer:
      "Brukes til å signere sessions og CSRF-tokens. Må være hemmelig — endres den, blir alle innloggede brukere logget ut.",
  },
  {
    id: "c-prepared",
    category: "sikkerhet",
    topic: "SQL Injection",
    question: "Hvordan beskytter prepared statements mot SQL Injection?",
    answer:
      "Brukerdata sendes som parametre, atskilt fra SQL-koden. Databasen behandler dem som verdier, aldri som SQL.",
    code: "cursor.execute(\n  \"SELECT * FROM users WHERE id = %s\",\n  (user_id,)\n)",
    visual: "sql-injection-compare",
  },
  {
    id: "c-commit-py",
    category: "flask",
    topic: "Database",
    question: "Hvorfor må man kalle db.commit() etter INSERT/UPDATE/DELETE?",
    answer:
      "Endringene er bare i transaksjonsbufferet til serveren stoppes. Uten commit() lagres de ikke permanent — neste oppstart har dem ikke.",
  },
  {
    id: "c-with-database",
    category: "flask",
    topic: "Database",
    question: "Hvorfor brukes `with DataBase() as db:` i kurset?",
    answer:
      "Det er Pythons context-manager-mønster. __enter__ åpner cursor og returnerer self; __exit__ kjører ALLTID når blokken slutter (også på exception) og gjør commit + close. Du slipper å skrive try/finally for hånd, og garanterer at koblingen lukkes.",
    code: "with DataBase() as db:\n    db.cursor.execute(\"SELECT ...\")\n    rows = db.cursor.fetchall()\n# her er commit + close allerede kjørt",
  },
  {
    id: "c-context-exit-exception",
    category: "flask",
    topic: "Database",
    question: "Hva skjer i __exit__ hvis en exception kastes inni `with`-blokken?",
    answer:
      "__exit__ kjøres uansett — det er hele poenget. Argumentene exc_type/exc_val/exc_tb forteller hvilken feil som skjedde (None hvis ingen). Returnerer __exit__ True, undertrykkes feilen; returnerer den None/False (vanlig) propageres feilen videre. Kurset committer alltid — du kan velge å rulle tilbake ved exception.",
  },

  // ============= HTTP =============
  {
    id: "c-http",
    category: "http",
    topic: "HTTP",
    question: "Hva står HTTP for?",
    answer: "HyperText Transfer Protocol — protokollen klient og server bruker for å snakke sammen.",
    visual: "http-sequence",
  },
  {
    id: "c-get-post",
    category: "http",
    topic: "Metoder",
    question: "Forskjell på GET og POST?",
    answer:
      "GET henter data og bør ikke endre serverstate (data i URL). POST sender data til serveren (data i request body) og brukes ved login, registrering, opprett.",
  },
  {
    id: "c-200",
    category: "http",
    topic: "Statuskoder",
    question: "Hva betyr statuskode 200?",
    answer: "OK — requesten var vellykket og responsen inneholder forventet data.",
  },
  {
    id: "c-201",
    category: "http",
    topic: "Statuskoder",
    question: "Hva betyr statuskode 201?",
    answer: "Created — en ny ressurs ble opprettet (typisk etter POST).",
  },
  {
    id: "c-301",
    category: "http",
    topic: "Statuskoder",
    question: "Hva betyr statuskode 301?",
    answer: "Moved Permanently — permanent redirect. Nettleseren skal huske den nye URLen.",
  },
  {
    id: "c-401",
    category: "http",
    topic: "Statuskoder",
    question: "Hva betyr statuskode 401?",
    answer: "Unauthorized — brukeren er ikke autentisert (ikke logget inn).",
  },
  {
    id: "c-403",
    category: "http",
    topic: "Statuskoder",
    question: "Hva betyr statuskode 403?",
    answer: "Forbidden — brukeren ER innlogget, men har ikke tilgang til ressursen.",
  },
  {
    id: "c-404",
    category: "http",
    topic: "Statuskoder",
    question: "Hva betyr statuskode 404?",
    answer: "Not Found — siden eller ressursen finnes ikke. Som regel feil URL eller feil route.",
  },
  {
    id: "c-405",
    category: "http",
    topic: "Statuskoder",
    question: "Hva betyr statuskode 405?",
    answer: "Method Not Allowed — feil HTTP-metode for routen (f.eks. POST sendt til en GET-route).",
  },
  {
    id: "c-500",
    category: "http",
    topic: "Statuskoder",
    question: "Hva betyr statuskode 500?",
    answer: "Internal Server Error — feil i serverkode. Sjekk Flask-loggen for stacktrace.",
  },
  {
    id: "c-2xx-klasse",
    category: "http",
    topic: "Statuskode-klasser",
    question: "Hva betyr 2xx-klassen?",
    answer:
      "Successful — requesten ble forstått, akseptert og behandlet. Typiske medlemmer: 200 OK, 201 Created, 204 No Content. Server sier «alt gikk bra, her er svaret».",
  },
  {
    id: "c-3xx-klasse",
    category: "http",
    topic: "Statuskode-klasser",
    question: "Hva betyr 3xx-klassen?",
    answer:
      "Redirection — klienten må gjøre noe mer (typisk følge en ny URL). Typiske medlemmer: 301 Moved Permanently, 302 Found, 304 Not Modified. Etter en redirect følger nettleseren Location-headeren automatisk.",
  },
  {
    id: "c-4xx-klasse",
    category: "http",
    topic: "Statuskode-klasser",
    question: "Hva betyr 4xx-klassen?",
    answer:
      "Client error — feilen ligger hos klienten/brukeren. Typiske medlemmer: 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 405 Method Not Allowed. Server klandrer ikke seg selv.",
  },
  {
    id: "c-5xx-klasse",
    category: "http",
    topic: "Statuskode-klasser",
    question: "Hva betyr 5xx-klassen?",
    answer:
      "Server error — server klarte ikke å oppfylle en ellers gyldig request. Typiske medlemmer: 500 Internal Server Error, 502 Bad Gateway, 503 Service Unavailable. På 500 må du som utvikler fikse koden.",
  },
  {
    id: "c-post-suksess-status",
    category: "http",
    topic: "Statuskode-klasser",
    question:
      "Hvilken statuskode er normal etter en vellykket POST som lager noe nytt?",
    answer:
      "201 Created — ny ressurs er opprettet. Server kan også svare med en Location-header som peker på den nye ressursen. (200 OK er også OK hvis du ikke spesifikt opprettet noe.)",
  },
  {
    id: "c-api",
    category: "http",
    topic: "API",
    question: "Hva er et API?",
    answer:
      "Application Programming Interface — et grensesnitt der programmer kan kommunisere med hverandre. På web typisk via HTTP og JSON.",
  },
  {
    id: "c-json",
    category: "http",
    topic: "API",
    question: "Hva er JSON?",
    answer:
      "Et tekstbasert dataformat (key/value) som er lett å lese og sende. De facto standard for web-API-er.",
    code: "{ \"navn\": \"Ola\", \"alder\": 30 }",
  },
  {
    id: "c-rest",
    category: "http",
    topic: "API",
    question: "Hva er et REST API?",
    answer:
      "Et API som bruker HTTP-metoder (GET/POST/PUT/DELETE) på ressurs-URLer. F.eks. GET /api/kunder, POST /api/kunder, DELETE /api/kunder/5.",
  },

  // ============= SIKKERHET =============
  {
    id: "c-authn-vs-authz",
    category: "sikkerhet",
    topic: "Auth",
    question: "Authentication vs. Authorization?",
    answer:
      "Authentication: HVEM er du? (innlogging). Authorization: HVA har du lov til? (tilgangskontroll, roller).",
  },
  {
    id: "c-sqli",
    category: "sikkerhet",
    topic: "SQL Injection",
    question: "Hva er SQL Injection?",
    answer:
      "Et angrep der ondsinnet SQL injiseres via inputfelter. Kan lese/slette data, omgå login. Beskytt med prepared statements — ALDRI strengkonkatenering.",
  },
  {
    id: "c-xss",
    category: "sikkerhet",
    topic: "XSS",
    question: "Hva er XSS?",
    answer:
      "Cross Site Scripting — ondsinnet JavaScript injisert i en nettside. Kan stjele cookies/sessions. Jinja2 escaper output automatisk; vær forsiktig med |safe.",
  },
  {
    id: "c-csrf",
    category: "sikkerhet",
    topic: "CSRF",
    question: "Hva er CSRF?",
    answer:
      "Cross Site Request Forgery — bruker lures til å sende request fra en annen side. Beskytt med CSRF-tokens (Flask-WTF gjør det automatisk).",
  },
  {
    id: "c-csrf-token",
    category: "sikkerhet",
    topic: "CSRF",
    question: "Hva er et CSRF-token?",
    answer:
      "Et hemmelig token som genereres per session og legges som skjult felt i forms. Serveren sjekker at tokenet matcher — hvis ikke, avvises requesten.",
  },
  {
    id: "c-https",
    category: "sikkerhet",
    topic: "HTTPS",
    question: "Hvorfor HTTPS framfor HTTP?",
    answer:
      "HTTPS krypterer trafikken (TLS) — beskytter passord, sessions og data mot avlytting og manipulering.",
  },
  {
    id: "c-debug-prod",
    category: "sikkerhet",
    topic: "Flask",
    question: "Hvorfor ikke debug=True i produksjon?",
    answer:
      "Debug-mode viser detaljerte stacktraces og lar angripere kjøre vilkårlig kode via Werkzeug-konsollen.",
  },
  {
    id: "c-owasp",
    category: "sikkerhet",
    topic: "OWASP",
    question: "Hva er OWASP Top 10?",
    answer:
      "En liste over de vanligste og alvorligste sikkerhetshullene i webapplikasjoner — Injection, Broken Access Control, Misconfiguration osv.",
  },

  // ============= PRAKTISK =============
  {
    id: "c-venv",
    category: "praktisk",
    topic: "Python",
    question: "Hvordan oppretter du et virtual environment?",
    answer: "`python -m venv venv` lager mappen. Aktivér på Windows: `venv\\Scripts\\activate`.",
  },
  {
    id: "c-requirements",
    category: "praktisk",
    topic: "Python",
    question: "Hva brukes requirements.txt til?",
    answer:
      "Lagre prosjektets Python-avhengigheter. Lag med `pip freeze > requirements.txt`. Installer alt med `pip install -r requirements.txt`.",
  },
  {
    id: "c-no-module",
    category: "praktisk",
    topic: "Feil",
    question: "Hva betyr 'No module named flask'?",
    answer:
      "Flask er ikke installert i det aktive Python-miljøet. Vanligvis: glemt å aktivere venv, eller VS Code bruker feil interpreter.",
  },
  {
    id: "c-template-not-found",
    category: "praktisk",
    topic: "Feil",
    question: "Hva betyr 'TemplateNotFound'?",
    answer:
      "Flask finner ikke HTML-filen. Sjekk: filnavn (case-sensitivt på Linux), at filen ligger i templates/, og at templates/ ligger ved siden av app.py.",
  },
  {
    id: "c-method-not-allowed",
    category: "praktisk",
    topic: "Feil",
    question: "Hva betyr 'Method Not Allowed' (405)?",
    answer:
      "Routen støtter ikke metoden du sendte. F.eks. en form sender POST, men @app.route har bare default GET. Legg til `methods=['GET', 'POST']`.",
  },
  {
    id: "c-mysqldump",
    category: "praktisk",
    topic: "Backup",
    question: "Hvordan eksporterer du en MySQL-database fra kommandolinjen?",
    answer: "`mysqldump -u root -p database > backup.sql`. Importer med `mysql -u root -p database < backup.sql`.",
  },

  // ============= NORMALISERING (utvidet) =============
  {
    id: "c-norm-fd",
    category: "design",
    topic: "Normalisering",
    question: "Hva er en funksjonell avhengighet (FD)?",
    answer:
      "En regel `X → Y` som sier at verdien til X bestemmer Y entydig. Eks: `kundeNr → navn` — gitt et kundenummer er det bare ett mulig navn.",
  },
  {
    id: "c-norm-determinant",
    category: "design",
    topic: "Normalisering",
    question: "Hva er en determinant?",
    answer:
      "Venstresiden i en funksjonell avhengighet (X i `X → Y`). Det er feltet (eller kombinasjonen) som «bestemmer» et annet felt.",
  },
  {
    id: "c-norm-partiell",
    category: "design",
    topic: "Normalisering",
    question: "Hva er en partiell avhengighet?",
    answer:
      "Et ikke-nøkkelfelt avhenger bare av DEL av en sammensatt primærnøkkel. Eks: PK=(ordreNr, prodNr), men prodNavn avhenger bare av prodNr. Brytes i 2NF.",
  },
  {
    id: "c-norm-kandidat",
    category: "design",
    topic: "Normalisering",
    question: "Hva er en kandidatnøkkel?",
    answer:
      "Den minste kombinasjonen av felter som identifiserer hver rad unikt. En tabell kan ha flere kandidatnøkler — én av dem velges som primærnøkkel.",
  },
  {
    id: "c-norm-bcnf",
    category: "design",
    topic: "Normalisering",
    question: "Hva er BCNF?",
    answer:
      "Boyce-Codd Normalform — strengere enn 3NF. Krever at ALLE determinanter (X i X → Y) skal være kandidatnøkler. Fjerner sjeldne anomalier 3NF kan slippe gjennom.",
  },
  {
    id: "c-norm-anomali",
    category: "design",
    topic: "Normalisering",
    question: "Hva er innsettings-, oppdaterings- og slettings-anomalier?",
    answer:
      "Innsetting: kan ikke legge til ny info uten en annen rad (f.eks. nytt fag uten student). Oppdatering: må endre samme verdi mange steder. Sletting: mister utilsiktet info ved sletting av siste rad. Normalisering fjerner disse.",
  },
  {
    id: "c-norm-denorm",
    category: "design",
    topic: "Normalisering",
    question: "Hva er denormalisering, og når brukes det?",
    answer:
      "Bevisst å bryte normalformer for å unngå dyre JOIN-er. Brukes i lese-tunge analyse-databaser (data warehouses), aldri i OLTP-systemer der data oppdateres ofte.",
  },

  // ============= ER-MODELL =============
  {
    id: "c-er-entitet",
    category: "design",
    topic: "ER-modell",
    question: "Hva er forskjellen på en entitet og en attributt?",
    answer:
      "Entitet = «ting» vi vil lagre data om (KUNDE, ORDRE) — blir tabell. Attributt = egenskap ved entiteten (navn, dato, pris) — blir kolonne. I diagrammet: rektangel = entitet, oval/i boksen = attributt.",
  },
  {
    id: "c-er-svak",
    category: "design",
    topic: "ER-modell",
    question: "Hva er en svak entitet?",
    answer:
      "En entitet som ikke kan eksistere uten en eier. Eks: ORDRELINJE finnes bare gjennom en ORDRE. PK = (FK til eier + eget delvis ID), og FK-en er NOT NULL.",
  },
  {
    id: "c-er-deltakelse",
    category: "design",
    topic: "ER-modell",
    question: "Hva betyr total vs. partiell deltakelse?",
    answer:
      "Total (heltrukken / `|` innerst): hver forekomst MÅ delta i relasjonen — gir NOT NULL på FK. Partiell (`O` innerst): kan ha 0 — FK kan være NULL.",
  },
  {
    id: "c-er-flerverdi",
    category: "design",
    topic: "ER-modell",
    question: "Hvordan mappes et flerverdi-attributt?",
    answer:
      "Det blir EGEN tabell. Eks: en person kan ha flere telefonnumre → tabell Telefon(pid, nummer) med FK til Person. Du legger ALDRI flere verdier i én kolonne — det bryter 1NF.",
  },
  {
    id: "c-er-sammensatt",
    category: "design",
    topic: "ER-modell",
    question: "Hva er et sammensatt attributt?",
    answer:
      "Et attributt som naturlig består av flere deler — f.eks. adresse (gate, postnr, sted). Mappes til flere kolonner i samme tabell, ikke til egen tabell.",
  },
  {
    id: "c-er-fk-side",
    category: "design",
    topic: "ER-modell",
    question: "På hvilken side legges fremmednøkkelen i 1:N?",
    answer:
      "På MANGE-siden. Huskeregel: «FK-en bor på mange-siden». Eks: 1 kunde → mange bestillinger → kundeNr legges i Bestilling.",
  },
  {
    id: "c-er-symbol-min-max",
    category: "design",
    topic: "ER-modell",
    question: "Hva betyr indre vs. ytre symbol i kråkefot?",
    answer:
      "Indre = minimum (0 eller 1, dvs. valgfri/obligatorisk). Ytre = maksimum (1 eller mange/krage). Symbolene leses ved siden av motsatt entitet — «hvor mange B per A».",
  },
  {
    id: "c-er-mn-junction",
    category: "design",
    topic: "ER-modell",
    question: "Hvor lagres relasjons-attributter i M:N?",
    answer:
      "I koblingstabellen. Eks: Student tar Fag M:N med «semester» — semester ligger i TAR(sid, fkode, semester), ikke i Student eller Fag.",
  },
  {
    id: "c-er-rekursiv",
    category: "design",
    topic: "ER-modell",
    question: "Hva er en rekursiv relasjon?",
    answer:
      "En entitet som har relasjon til seg selv. Eks: ANSATT har leder som også er ANSATT — løses med en FK-kolonne lederNr som peker tilbake til ansattNr i samme tabell.",
  },

  // ============= KAPITTEL 6 — RELASJONSMODELLEN =============
  {
    id: "c-rm-relasjon",
    category: "begrep",
    topic: "Relasjonsmodell",
    question: "Hva er en 'relasjon' i relasjonsmodellen?",
    answer:
      "Det formelle navnet på en tabell. En relasjon er et sett av tupler (rader) over et bestemt skjema (kolonner med datatyper). 'Relasjon' refererer altså til tabellen, ikke til relasjonene mellom tabeller.",
  },
  {
    id: "c-rm-tuppel",
    category: "begrep",
    topic: "Relasjonsmodell",
    question: "Hva er et tuppel og en attributt?",
    answer:
      "Tuppel = én rad (én registrering). Attributt = én kolonne (én egenskap, med navn og datatype/domene).",
  },
  {
    id: "c-rm-domene",
    category: "begrep",
    topic: "Relasjonsmodell",
    question: "Hva er et domene?",
    answer:
      "Settet av lovlige verdier en attributt kan ha. F.eks. Alder ∈ INTEGER 0..150, Kjønn ∈ {'M','K'}. Datatype + eventuelle skranker (CHECK) avgrenser domenet.",
  },
  {
    id: "c-rm-superkey",
    category: "begrep",
    topic: "Nøkler",
    question: "Hva er en supernøkkel?",
    answer:
      "Et sett med attributter som identifiserer hver rad entydig. Kan inneholde 'overflødige' attributter — alle utvidelser av en kandidatnøkkel er supernøkler.",
  },
  {
    id: "c-rm-kandidatnokkel",
    category: "begrep",
    topic: "Nøkler",
    question: "Hva er en kandidatnøkkel?",
    answer:
      "En minimal supernøkkel — entydig, men hvor ingen ekte delmengde lenger er entydig. En tabell kan ha flere kandidatnøkler; én av dem velges som primærnøkkel, resten markeres som UNIQUE.",
  },
  {
    id: "c-rm-entitetsintegritet",
    category: "begrep",
    topic: "Integritet",
    question: "Hva sier entitetsintegritet?",
    answer: "Ingen del av primærnøkkelen kan være NULL. PK-kolonner må alltid ha verdi.",
  },
  {
    id: "c-rm-referanseintegritet",
    category: "begrep",
    topic: "Integritet",
    question: "Hva sier referanseintegritet?",
    answer:
      "En fremmednøkkelverdi må enten være NULL eller peke til en eksisterende rad i den refererte tabellen. Du kan ikke peke på noe som ikke finnes.",
  },
  {
    id: "c-rm-domeneintegritet",
    category: "begrep",
    topic: "Integritet",
    question: "Hva er domeneintegritet?",
    answer:
      "Hver attributtverdi må ligge innenfor sitt domene (riktig datatype, NOT NULL der det er krevd, CHECK-skranker overholdt).",
  },
  {
    id: "c-rm-alg-select",
    category: "begrep",
    topic: "Relasjonsalgebra",
    question: "Relasjonsalgebra: σ (seleksjon) tilsvarer hvilken SQL-klausul?",
    answer:
      "WHERE. σ_pris>100(Produkt) ≡ SELECT * FROM Produkt WHERE pris > 100. Velger ut RADER som matcher betingelsen.",
  },
  {
    id: "c-rm-alg-project",
    category: "begrep",
    topic: "Relasjonsalgebra",
    question: "Relasjonsalgebra: π (projeksjon) tilsvarer hva i SQL?",
    answer:
      "Kolonneliste i SELECT (med implisitt DISTINCT — algebra fjerner duplikater). π_navn,pris(Produkt) ≡ SELECT DISTINCT navn, pris FROM Produkt.",
  },
  {
    id: "c-rm-alg-join",
    category: "begrep",
    topic: "Relasjonsalgebra",
    question: "Relasjonsalgebra: ⋈ (natural join / theta-join)?",
    answer:
      "Kobler to relasjoner. Natural join (⋈) matcher på alle felles attributtnavn. Theta-join (⋈_θ) er ekvivalent med JOIN ... ON θ. SQL: INNER JOIN.",
  },
  {
    id: "c-rm-alg-set",
    category: "begrep",
    topic: "Relasjonsalgebra",
    question: "Forskjell på UNION, INTERSECT og EXCEPT/MINUS?",
    answer:
      "UNION = rader som finnes i A eller B. INTERSECT = rader i begge. EXCEPT (SQL Server) / MINUS (Oracle) = rader i A som IKKE finnes i B. Begge inputs må ha samme skjema.",
  },
  {
    id: "c-rm-alg-cross",
    category: "begrep",
    topic: "Relasjonsalgebra",
    question: "Hva er kartesisk produkt (×)?",
    answer:
      "Hver rad i A kombinert med hver rad i B. |A|·|B| rader. SQL: CROSS JOIN, eller JOIN uten ON. Sjelden ønsket — som regel resultat av en glemt join-betingelse.",
  },

  // ============= KAPITTEL 9 — FILER OG INDEKSER =============
  {
    id: "c-idx-hva",
    category: "design",
    topic: "Indeks",
    question: "Hva er en indeks?",
    answer:
      "En hjelpestruktur som lar databasen finne rader raskt uten å lese hele tabellen. Tilsvarer et stikkordregister bak i en bok — peker fra verdi til radens plassering.",
  },
  {
    id: "c-idx-btre",
    category: "design",
    topic: "Indeks",
    question: "Hvordan fungerer en B-tre-indeks?",
    answer:
      "Sortert tre-struktur med høy forgrening. Søk er O(log n). Bra for likhet (=), område (BETWEEN, <, >) og ORDER BY på indekserte kolonner.",
  },
  {
    id: "c-idx-hash",
    category: "design",
    topic: "Indeks",
    question: "Når brukes hash-indeks?",
    answer:
      "Bare for likhetsoppslag (=). O(1) i snitt, men kan IKKE brukes for område, sortering eller LIKE. SQLite har ikke hash-indeks; det er typisk i PostgreSQL/MySQL.",
  },
  {
    id: "c-idx-pk-auto",
    category: "design",
    topic: "Indeks",
    question: "Får primærnøkkelen indeks automatisk?",
    answer:
      "Ja. PK og UNIQUE-kolonner får automatisk indeks i de fleste DBMS (i SQLite blir INTEGER PRIMARY KEY rowid-aliaset, som er den klustrede indeksen).",
  },
  {
    id: "c-idx-kost",
    category: "design",
    topic: "Indeks",
    question: "Hva er ulempen med indekser?",
    answer:
      "Tar plass og må oppdateres ved INSERT/UPDATE/DELETE. For mange indekser → trege skrivinger. Velg indekser ut fra hvilke spørringer du faktisk kjører.",
  },
  {
    id: "c-idx-naar",
    category: "design",
    topic: "Indeks",
    question: "Når bør du legge til en indeks?",
    answer:
      "På kolonner brukt i WHERE, JOIN, ORDER BY eller GROUP BY på store tabeller — særlig fremmednøkler. Ikke verdt det på små tabeller eller kolonner med få distinkte verdier.",
  },
  {
    id: "c-idx-explain",
    category: "design",
    topic: "Indeks",
    question: "Hva forteller EXPLAIN QUERY PLAN deg?",
    answer:
      "Hvordan motoren tenker å kjøre spørringen. SCAN = full tabellgjennomgang (treg på store data). SEARCH = bruker indeks. Bruk det til å sjekke at viktige spørringer treffer indeks.",
  },
  {
    id: "c-idx-leading-wild",
    category: "design",
    topic: "Indeks",
    question: "Hvorfor er LIKE '%foo' ikke indekserbart?",
    answer:
      "B-treet er sortert fra venstre — uten kjent prefiks må alle rader sjekkes. LIKE 'foo%' kan derimot bruke indeks. For full-text-søk trengs egne indekstyper (FTS).",
  },
  {
    id: "c-fil-heap",
    category: "design",
    topic: "Indeks",
    question: "Hva er en heap-fil vs. klustret indeks?",
    answer:
      "Heap = rader lagret i innsettingsrekkefølge (uordnet). Klustret indeks = rader fysisk lagret i indeksens orden. SQLite bruker klustret rowid; en tabell kan kun ha én klustret indeks.",
  },

  // ============= KAPITTEL 10 — TRANSAKSJONER =============
  {
    id: "c-tx-acid-a",
    category: "begrep",
    topic: "ACID",
    question: "Hva betyr A i ACID?",
    answer:
      "Atomicity (atomisitet): hele transaksjonen lykkes eller ingen del av den. Hvis noe feiler midt i, rulles ALT tilbake.",
  },
  {
    id: "c-tx-acid-c",
    category: "begrep",
    topic: "ACID",
    question: "Hva betyr C i ACID?",
    answer:
      "Consistency (konsistens): databasen går fra én gyldig tilstand til en annen — alle skranker (PK, FK, CHECK) overholdes etter commit.",
  },
  {
    id: "c-tx-acid-i",
    category: "begrep",
    topic: "ACID",
    question: "Hva betyr I i ACID?",
    answer:
      "Isolation (isolasjon): samtidige transaksjoner skal oppleves som om de kjører hver for seg. Grad av isolasjon styres av isolasjonsnivå.",
  },
  {
    id: "c-tx-acid-d",
    category: "begrep",
    topic: "ACID",
    question: "Hva betyr D i ACID?",
    answer:
      "Durability (varighet): når en transaksjon er commit'et, overlever endringen krasj og strømbrudd. Lagres typisk via write-ahead-logg.",
  },
  {
    id: "c-tx-commit-rollback",
    category: "sql",
    topic: "Transaksjoner",
    question: "Hva gjør COMMIT og ROLLBACK?",
    answer:
      "COMMIT bekrefter alle endringer i transaksjonen. ROLLBACK forkaster alt og bringer databasen tilbake til tilstanden før BEGIN. Til sammen håndhever de atomisitet.",
  },
  {
    id: "c-tx-savepoint",
    category: "sql",
    topic: "Transaksjoner",
    question: "Hva er et SAVEPOINT?",
    answer:
      "Et merke inni en transaksjon. ROLLBACK TO savepoint ruller tilbake til merket uten å avbryte hele transaksjonen — nyttig for nestede operasjoner.",
  },
  {
    id: "c-tx-dirty-read",
    category: "begrep",
    topic: "Anomalier",
    question: "Hva er dirty read?",
    answer:
      "Transaksjon T1 leser data som T2 har skrevet, men ikke commit'et. Hvis T2 ruller tilbake, har T1 jobbet med data som aldri var gyldig. Forhindres fra READ COMMITTED og oppover.",
  },
  {
    id: "c-tx-non-repeatable",
    category: "begrep",
    topic: "Anomalier",
    question: "Hva er non-repeatable read?",
    answer:
      "T1 leser samme rad to ganger og får ulike verdier fordi T2 oppdaterte og commit'et imellom. Forhindres fra REPEATABLE READ.",
  },
  {
    id: "c-tx-phantom",
    category: "begrep",
    topic: "Anomalier",
    question: "Hva er en phantom read?",
    answer:
      "T1 kjører samme spørring to ganger og får ULIKT antall rader fordi T2 satt inn (eller slettet) rader som matcher betingelsen. Forhindres bare av SERIALIZABLE.",
  },
  {
    id: "c-tx-lost-update",
    category: "begrep",
    topic: "Anomalier",
    question: "Hva er lost update?",
    answer:
      "To transaksjoner leser samme rad, regner ut og skriver tilbake hver sin nye verdi — den siste overskriver den første uten å vite om den. Forhindres med låser eller optimistisk samtidighet (versjonsnummer).",
  },
  {
    id: "c-tx-iso-rc",
    category: "begrep",
    topic: "Isolasjonsnivå",
    question: "Isolasjonsnivå: READ COMMITTED?",
    answer:
      "Du leser kun commit'ede data — ingen dirty read. Men non-repeatable read og phantom read kan fortsatt skje. Standard i Oracle og PostgreSQL.",
  },
  {
    id: "c-tx-iso-rr",
    category: "begrep",
    topic: "Isolasjonsnivå",
    question: "Isolasjonsnivå: REPEATABLE READ?",
    answer:
      "Samme rad gir samme verdi gjennom hele transaksjonen — forhindrer dirty read OG non-repeatable read. Phantom read kan fortsatt skje (avhengig av DBMS). Standard i MySQL/InnoDB.",
  },
  {
    id: "c-tx-iso-ser",
    category: "begrep",
    topic: "Isolasjonsnivå",
    question: "Isolasjonsnivå: SERIALIZABLE?",
    answer:
      "Strengeste nivå — som om transaksjonene kjører én etter én. Forhindrer alle anomalier (også phantom). Lavest samtidighet og høyest risiko for serialisasjonsfeil/restart.",
  },
  {
    id: "c-tx-laas",
    category: "begrep",
    topic: "Transaksjoner",
    question: "Forskjell på delt lås (S) og eksklusiv lås (X)?",
    answer:
      "Delt lås (Shared) tas ved les — flere transaksjoner kan ha S samtidig. Eksklusiv lås (X) tas ved skriv — ingen annen kan ha S eller X. S er kompatibel med S; alt annet er konflikt.",
  },
  {
    id: "c-tx-deadlock",
    category: "begrep",
    topic: "Transaksjoner",
    question: "Hva er en deadlock?",
    answer:
      "To transaksjoner venter på låser hverandre holder. DBMS oppdager sirkelen og ruller tilbake én av transaksjonene (offer). Unngås ved å ta låser i konsistent rekkefølge.",
  },

  // ============= UTVIDET DEKNING (HTTP / sikkerhet / deploy) =============
  {
    id: "c-http-idempotens",
    category: "http",
    topic: "HTTP-metoder",
    question: "Hvilke HTTP-metoder er idempotente, og hva betyr det?",
    answer:
      "Idempotent betyr at samme request kan sendes flere ganger uten ny effekt. GET, PUT og DELETE er idempotente; POST og PATCH er det ikke. To identiske PUT-er gir samme tilstand, mens to POST-er typisk lager to ressurser.",
  },
  {
    id: "c-http-4xx-5xx",
    category: "http",
    topic: "Statuskoder",
    question: "Forskjellen på 4xx og 5xx — hvem har skylden?",
    answer:
      "4xx = klientfeil: requesten er feil (404 Not Found, 401 Unauthorized, 400 Bad Request). 5xx = serverfeil: serveren klarer ikke håndtere en gyldig request (500 Internal Server Error, 503 Service Unavailable). Logg 5xx aggressivt — de er vanligvis bug i koden din.",
  },
  {
    id: "c-http-rest-rpc",
    category: "http",
    topic: "Arkitektur",
    question: "REST vs RPC — hva er hovedforskjellen i én setning?",
    answer:
      "REST sentrerer rundt ressurser med standard HTTP-verb (GET /users/1), mens RPC sentrerer rundt funksjonskall (POST /getUser med { id: 1 }). REST utnytter HTTP-semantikken; RPC tunneler kall over HTTP.",
  },
  {
    id: "c-http-cache-etag",
    category: "http",
    topic: "Caching",
    question: "Hva gjør Cache-Control og ETag?",
    answer:
      "Cache-Control bestemmer hvor lenge og hvor (browser, CDN) en respons kan caches (f.eks. max-age=3600). ETag er en versjons-hash på ressursen — klienten sender den i If-None-Match, og serveren svarer 304 Not Modified hvis innholdet er uendret. Sparer båndbredde.",
    code: "Cache-Control: public, max-age=3600\nETag: \"v3-abc123\"",
  },

  {
    id: "c-sec-jwt-storage",
    category: "sikkerhet",
    topic: "JWT",
    question: "Hvor bør en JWT lagres på klientsiden?",
    answer:
      "I en HttpOnly + Secure + SameSite cookie — JavaScript kan ikke lese den, så XSS kan ikke stjele tokenet. localStorage er enklere, men hvilket som helst injisert script kan lese det. Ulempen med cookies er CSRF, som må håndteres separat (SameSite=Lax/Strict eller CSRF-token).",
  },
  {
    id: "c-sec-csrf-vs-xss",
    category: "sikkerhet",
    topic: "Web-angrep",
    question: "Forskjellen på CSRF og XSS?",
    answer:
      "XSS = angriper kjører eget JS i ditt domene (stjeler data, gjør hva som helst som brukeren). CSRF = angriperens side får nettleseren din til å sende en autentisert request til en annen side du er logget på. XSS bryter siden; CSRF utnytter at du er logget inn et annet sted.",
  },
  {
    id: "c-sec-bcrypt",
    category: "sikkerhet",
    topic: "Passord",
    question: "Hvorfor bcrypt og ikke sha256 for passord?",
    answer:
      "bcrypt er bevisst treg og inkluderer salt — det gjør brute-force og rainbow tables upraktisk. sha256 er designet for å være rask, så en GPU kan teste milliarder av kandidater per sekund. Bruk bcrypt, argon2 eller scrypt — aldri rå sha/md5.",
    code: "from werkzeug.security import generate_password_hash\nhash = generate_password_hash(pw)  # bruker pbkdf2/scrypt",
  },
  {
    id: "c-sec-sop-cors",
    category: "sikkerhet",
    topic: "Same-Origin",
    question: "Hva er Same-Origin Policy, og hva er CORS sin rolle?",
    answer:
      "Same-Origin Policy forbyr JS på ett origin (protokoll+host+port) fra å lese responsen fra et annet. CORS er serverens måte å eksplisitt åpne for det — via Access-Control-Allow-Origin-headeren. Uten CORS kan ikke browser-JS på app.no lese fra api.no.",
  },
  {
    id: "c-sec-sqli-prepared",
    category: "sikkerhet",
    topic: "SQL Injection",
    question: "Hva er SQL injection, og hvordan stopper prepared statements det?",
    answer:
      "SQL injection = brukerinput limes inn i en SQL-streng og endrer spørringen (f.eks. ' OR 1=1 --). Prepared statements sender SQL og parametre separat til DB-en — parametre tolkes alltid som data, aldri som SQL. Bruk ? eller %s, aldri f-string/konkat.",
    code: "# Trygt:\ncur.execute(\"SELECT * FROM bruker WHERE epost=?\", (epost,))\n# UTRYGT:\ncur.execute(f\"SELECT * FROM bruker WHERE epost='{epost}'\")",
  },

  {
    id: "c-deploy-venv",
    category: "praktisk",
    topic: "Virtual environment",
    question: "Hva er en virtual environment, og hvorfor trengs den?",
    answer:
      "En isolert Python-installasjon per prosjekt — egne avhengigheter uten å forurense systemets Python. Forhindrer at Flask 2 i prosjekt A kolliderer med Flask 3 i prosjekt B. Aktiver med source venv/bin/activate (eller .\\venv\\Scripts\\activate på Windows).",
    code: "python -m venv venv\nsource venv/bin/activate\npip install flask",
  },
  {
    id: "c-deploy-requirements",
    category: "praktisk",
    topic: "Avhengigheter",
    question: "Hva er requirements.txt, og hvordan lages den?",
    answer:
      "En liste over Python-pakker prosjektet trenger, med versjoner. Genereres med pip freeze > requirements.txt og installeres med pip install -r requirements.txt. Sørger for at andre (og prod-serveren) får nøyaktig samme versjoner som du brukte.",
    code: "Flask==3.0.0\nWerkzeug==3.0.1\ngunicorn==21.2.0",
  },
  {
    id: "c-deploy-dockerfile",
    category: "praktisk",
    topic: "Docker",
    question: "Hva er en Dockerfile, og hvordan ser den minimalt ut for Flask?",
    answer:
      "En oppskrift på et container-image: hvilket OS, hvilke filer, hvilke kommandoer. Bygges med docker build og kjøres med docker run. Gir samme miljø lokalt og i prod.",
    code: "FROM python:3.12-slim\nWORKDIR /app\nCOPY requirements.txt .\nRUN pip install -r requirements.txt\nCOPY . .\nCMD [\"gunicorn\", \"-b\", \"0.0.0.0:8000\", \"app:app\"]",
  },
  {
    id: "c-deploy-wsgi",
    category: "praktisk",
    topic: "WSGI",
    question: "Hva er WSGI, og hvorfor brukes Gunicorn i prod?",
    answer:
      "WSGI (Web Server Gateway Interface) er Python-standarden for hvordan webservere snakker med web-rammeverk. Flasks innebygde server er kun for utvikling — én tråd, ingen sikkerhet. Gunicorn/uWSGI/uvicorn håndterer mange requester parallelt, restarter krasjede workere og er prod-klare.",
  },
  {
    id: "c-deploy-env-git",
    category: "praktisk",
    topic: "Hemmeligheter",
    question: "Hvorfor skal .env aldri committes til git?",
    answer:
      "Den inneholder hemmeligheter — DB-passord, API-nøkler, SECRET_KEY. Når noe er pushet til GitHub, må du anta det er lekket for alltid (også etter force-push, fordi forks og caches finnes). Legg .env i .gitignore og del verdier via en hemmelighetstjeneste eller .env.example uten verdier.",
  },

  {
    id: "c-py-name-main",
    category: "praktisk",
    topic: "Python-idiom",
    question: "Hva gjør `if __name__ == \"__main__\":`?",
    answer:
      "Blokken kjøres KUN når fila kjøres direkte (python app.py), ikke når den importeres. Lar deg ha kjørbar kode + gjenbrukbare funksjoner i samme fil uten at importer trigger serveren.",
    code: "if __name__ == \"__main__\":\n    app.run(debug=True)",
  },
  {
    id: "c-py-decorator",
    category: "flask",
    topic: "Decorators",
    question: "Hvordan fungerer @app.route under panseret?",
    answer:
      "En decorator er en funksjon som tar en annen funksjon og returnerer en innpakket versjon. @app.route(\"/x\") registrerer funksjonen i Flask sin URL-tabell og returnerer den uendret. Sukker for: index = app.route(\"/x\")(index).",
    code: "@app.route(\"/hei\")\ndef hei():\n    return \"hei\"\n# tilsvarer: app.route(\"/hei\")(hei)",
  },
  {
    id: "c-py-with",
    category: "praktisk",
    topic: "Context manager",
    question: "Hva sikrer en `with`-blokk?",
    answer:
      "At opprydding (lukke fil, gi tilbake DB-tilkobling, releasse lås) skjer automatisk når blokken forlates — også ved exception. Objektet må implementere __enter__ og __exit__. Det er det idiomatiske mønsteret for ressurser i Python.",
    code: "with open(\"f.txt\") as f:\n    data = f.read()\n# fila lukkes garantert her",
  },
  {
    id: "c-py-fstring",
    category: "praktisk",
    topic: "Strenger",
    question: "f-string vs .format() — hva er anbefalt?",
    answer:
      "f-strings (Python 3.6+) er kortest og raskest, og er det idiomatiske valget i moderne kode. .format() er fortsatt OK for templating der strengen lages før verdiene er kjent. ALDRI bruk f-string i SQL-queries — bruk parameter-binding.",
    code: "navn = \"Ada\"\nf\"Hei {navn}\"        # anbefalt\n\"Hei {}\".format(navn)  # eldre stil",
  },

  // ============= FYSISK LAGRING (kap. 4) =============
  {
    id: "c-storage-hdd",
    category: "praktisk",
    topic: "Lagring",
    question: "HDD vs SSD — hva betyr det for databaser?",
    answer:
      "HDD (Hard Disk Drive) har roterende plater og er billig, men tregere. SSD (Solid State Drive) har ingen bevegelige deler og er mye raskere — særlig på random reads, som er typisk for databaser. Resultat: SSD gir raskere SELECT/JOIN, særlig når data ikke får plass i RAM.",
    visual: "memory-hierarchy",
  },
  {
    id: "c-storage-ram",
    category: "praktisk",
    topic: "Lagring",
    question: "Hva bruker databasen RAM til?",
    answer:
      "Caching av varme data (buffer pool), midlertidige sortere/joins, og resultatsett som bygges opp. RAM er ekstremt raskt, men flyktig — derfor må COMMIT også skrive til disk (durability i ACID).",
    visual: "memory-hierarchy",
  },
  {
    id: "c-storage-pages",
    category: "praktisk",
    topic: "Lagring",
    question: "Hvorfor leser databasen i sider/blokker, ikke én rad om gangen?",
    answer:
      "Disk-I/O har en stor fast kostnad per operasjon. Å lese 8 KB blokker (sider) i stedet for én rad reduserer antall I/O-operasjoner dramatisk. Naborader havner ofte på samme side, så én lesing kan gi mange treff.",
    visual: "db-page",
  },
  {
    id: "c-storage-seq-scan",
    category: "praktisk",
    topic: "Lagring",
    question: "Hva er sekvensielt søk (full table scan)?",
    answer:
      "Databasen leser hver eneste rad i tabellen og sjekker WHERE-betingelsen mot dem. Greit på små tabeller, men skalerer dårlig — på 10M rader leser den 10M rader. Indeks lar databasen hoppe direkte til riktig sted.",
    visual: "index-vs-scan",
  },
  {
    id: "c-index-why",
    category: "praktisk",
    topic: "Lagring",
    question: "Hvorfor gjør en indeks søk raskere?",
    answer:
      "Indeksen er en sortert datastruktur (typisk B-tre) på siden av tabellen. Databasen kan finne riktig verdi i O(log n) treghoppe-steg i stedet for å skanne O(n) rader. Sammenlignbart med å bruke registeret bakerst i en bok.",
    visual: "index-vs-scan",
  },

  // ============= BACKUP / RESTORE (kap. 4 + 8) =============
  {
    id: "c-mysqldump",
    category: "praktisk",
    topic: "Backup",
    question: "Hva gjør `mysqldump`?",
    answer:
      "Eksporterer en database (struktur + data) som ren SQL — vanligvis en `.sql`-fil med CREATE TABLE og INSERT. Brukes til backup, flytting og innleveringer.",
    code: "mysqldump -u root -p EmployeeDB > backup.sql",
  },
  {
    id: "c-mysql-restore",
    category: "praktisk",
    topic: "Backup",
    question: "Hvordan importerer du en mysqldump-fil tilbake?",
    answer:
      "Kjør SQL-fila mot databasen med `mysql`-kommandoen. Databasen må eksistere på forhånd (eller fila må inneholde CREATE DATABASE).",
    code: "mysql -u root -p EmployeeDB < backup.sql",
  },
  {
    id: "c-workbench-export",
    category: "praktisk",
    topic: "Backup",
    question: "Hvordan eksporterer du en database i MySQL Workbench?",
    answer:
      "Server → Data Export. Velg schema, og om du vil ha bare struktur, bare data, eller begge. Resultatet er en .sql-fil som kan importeres igjen via Server → Data Import.",
  },

  // ============= DATABASERETTIGHETER (kap. 4) =============
  {
    id: "c-grant",
    category: "sikkerhet",
    topic: "Rettigheter",
    question: "Hva gjør GRANT i MySQL?",
    answer:
      "Gir en bruker rettigheter på en database eller tabell. Vanlige privilegier: SELECT, INSERT, UPDATE, DELETE, ALL PRIVILEGES. Prinsippet om minste privilegium tilsier å gi akkurat det brukeren trenger — ikke mer.",
    code: "GRANT SELECT, INSERT\n  ON EmployeeDB.*\n  TO 'student'@'localhost';",
  },
  {
    id: "c-revoke",
    category: "sikkerhet",
    topic: "Rettigheter",
    question: "Hvordan trekker du tilbake en rettighet?",
    answer:
      "Med REVOKE — speilbildet av GRANT. Etter REVOKE kan det være lurt å kjøre FLUSH PRIVILEGES for å sikre at endringen tar effekt umiddelbart.",
    code: "REVOKE INSERT\n  ON EmployeeDB.*\n  FROM 'student'@'localhost';",
  },
  {
    id: "c-privileges",
    category: "sikkerhet",
    topic: "Rettigheter",
    question: "Vanlige MySQL-privilegier?",
    answer:
      "SELECT (lese), INSERT (legge inn), UPDATE (endre), DELETE (slette), CREATE/DROP (lage/slette tabeller), ALL PRIVILEGES (alt — bruk sparsomt). En vanlig app-bruker trenger typisk SELECT/INSERT/UPDATE/DELETE, ikke DDL.",
  },

  // ============= MYSQL WORKBENCH (kap. 8) =============
  {
    id: "c-wb-vs-server",
    category: "praktisk",
    topic: "Verktøy",
    question: "Forskjell på MySQL Server og MySQL Workbench?",
    answer:
      "MySQL Server er selve databasesystemet — der dataene faktisk lagres og SQL kjøres (lytter på port 3306). MySQL Workbench er et grafisk verktøy som kobler seg til serveren for å skrive SQL, lage ER-diagrammer og administrere brukere.",
  },
  {
    id: "c-wb-fwd-eng",
    category: "praktisk",
    topic: "Verktøy",
    question: "Hva er Forward Engineer i Workbench?",
    answer:
      "Tar en EER-modell (ER-diagrammet du har tegnet) og genererer SQL-skriptet som lager hele databasen — CREATE TABLE, PRIMARY KEY, FOREIGN KEY, indekser. Database → Forward Engineer.",
  },
  {
    id: "c-wb-rev-eng",
    category: "praktisk",
    topic: "Verktøy",
    question: "Hva er Reverse Engineer i Workbench?",
    answer:
      "Det motsatte: tar en eksisterende database og bygger et EER-diagram fra den. Nyttig for å dokumentere et system du ikke har laget selv. Database → Reverse Engineer → velg schema.",
  },
  {
    id: "c-wb-default-schema",
    category: "praktisk",
    topic: "Verktøy",
    question: "Hvorfor må du sette \"default schema\" i Workbench?",
    answer:
      "Uten valgt schema vet ikke serveren hvilken database SQL-en skal kjøre mot — du får feil eller tabeller havner i feil schema. Høyreklikk schema i venstre panel → Set as Default Schema (det blir uthevet i fet skrift).",
  },

  // ============= VS CODE / DEBUGGING (kap. 8) =============
  {
    id: "c-vscode-launch",
    category: "praktisk",
    topic: "Debugging",
    question: "Hva er `launch.json`?",
    answer:
      "VS Code sin debug-konfigurasjon. Forteller debuggeren hva som skal kjøres (modul, miljøvariabler, args). For Flask: type `python`, module `flask`, env med FLASK_APP=app.py, args [\"run\"]. F5 starter debug-økten.",
    code: "{\n  \"name\": \"Python: Flask\",\n  \"type\": \"python\",\n  \"request\": \"launch\",\n  \"module\": \"flask\",\n  \"env\": { \"FLASK_APP\": \"app.py\" },\n  \"args\": [\"run\"]\n}",
  },
  {
    id: "c-breakpoint",
    category: "praktisk",
    topic: "Debugging",
    question: "Hva er et breakpoint?",
    answer:
      "Et stoppunkt — programmet pauser akkurat før den linjen kjører, og du kan inspisere variabler, kjøre uttrykk, og steppe linje for linje. Sett ved å klikke til venstre for linjenummeret i VS Code.",
  },
  {
    id: "c-no-module-flask",
    category: "praktisk",
    topic: "Feil",
    question: "Hvorfor får du \"No module named flask\"?",
    answer:
      "Flask er ikke installert i det Python-miljøet som kjører. Vanligste årsaker: venv ikke aktivert, VS Code valgte feil interpreter, eller pip install ble kjørt i annet miljø. Sjekk Python-interpreter nede til høyre i VS Code.",
  },
  {
    id: "c-pylance",
    category: "praktisk",
    topic: "Verktøy",
    question: "Hva gjør Pylance?",
    answer:
      "Microsofts Python-extension for VS Code: gir autocomplete, hover-info, type-hint-sjekking og rød understreking av feil. Bruker type-hints om de finnes — så `def foo(x: int)` gir bedre forslag enn utypet kode.",
  },

  // ============= GIT / GITHUB (kap. 8) =============
  {
    id: "c-git-flow",
    category: "praktisk",
    topic: "Git",
    question: "Hva er den typiske Git-flyten for ett oppdrag?",
    answer:
      "git init (én gang) → endre filer → git add . → git commit -m \"melding\" → git push. Push krever at du har koblet til en remote (typisk GitHub) først, med git remote add origin <url>.",
    code: "git init\ngit add .\ngit commit -m \"første commit\"\ngit remote add origin <url>\ngit push -u origin main",
  },
  {
    id: "c-gitignore",
    category: "praktisk",
    topic: "Git",
    question: "Hva legger du i `.gitignore`?",
    answer:
      "Filer som ALDRI skal til Git: venv/, __pycache__/, .env (hemmeligheter!), instance/, *.db. Pushede secrets må antas lekket for alltid — derfor er .env i .gitignore en kritisk vane.",
    code: "venv/\n__pycache__/\n.env\ninstance/\n*.pyc",
  },
  {
    id: "c-readme",
    category: "praktisk",
    topic: "Git",
    question: "Hva bør stå i README.md?",
    answer:
      "Hva prosjektet er, hvordan installere det (venv + requirements.txt), hvordan kjøre det (flask run / python app.py), og hvilke miljøvariabler som må settes. Sensorer leser README først — så jobb litt med den.",
  },
  {
    id: "c-git-vs-github",
    category: "praktisk",
    topic: "Git",
    question: "Forskjell på Git og GitHub?",
    answer:
      "Git er versjonskontrollverktøyet — kjører lokalt på maskinen din, sporer endringer, lager commits og branches. GitHub er en nettjeneste som hoster Git-repoer, gjør samarbeid mulig, og har issues, pull requests og CI på toppen.",
  },
  {
    id: "c-git-merge-vs-rebase",
    category: "praktisk",
    topic: "Git",
    question: "Forskjell på `git merge` og `git rebase`?",
    answer:
      "merge lager en ny merge-commit som kobler to historier sammen — du beholder all opprinnelig commit-historikk. rebase tar dine commits og «flytter» dem oppå målbranchen — historikken blir lineær, men shasum-ene endres. På delte branches: bruk merge. På din egen private branch før push: rebase går bra for å rydde.",
  },
  {
    id: "c-git-head",
    category: "praktisk",
    topic: "Git",
    question: "Hva er HEAD i Git?",
    answer:
      "En peker til den committen du står på akkurat nå. Vanligvis peker den til den siste committen på en branch (`HEAD -> main`). Etter `git checkout <commit-sha>` kan du være i «detached HEAD» — du er på en commit uten branch og bør lage en branch hvis du skal jobbe der.",
  },
  {
    id: "c-git-pull-rebase",
    category: "praktisk",
    topic: "Git",
    question: "Hva gjør `git pull --rebase`?",
    answer:
      "Henter nye commits fra remote og rebaser dine lokale commits oppå dem — i stedet for å lage en merge-commit. Resultatet er lineær historikk uten støy fra merge-commits. Tryggest når du er alene på en branch. Lærerens git.md i kurset nevner `git config pull.rebase false` som motsatt valg (default-merge).",
  },

  // ============= HTML (kap. 5) =============
  {
    id: "c-html-semantic",
    category: "flask",
    topic: "HTML",
    question: "Hva er semantiske HTML5-elementer?",
    answer:
      "Tags som beskriver INNHOLDETS rolle, ikke bare utseendet: <header>, <nav>, <main>, <section>, <article>, <footer>, <aside>. Bedre for skjermlesere, søkemotorer og lesbarhet enn å fylle siden med <div>-er.",
    code: "<header><h1>Tittel</h1></header>\n<nav>...</nav>\n<main>\n  <article>...</article>\n</main>\n<footer>...</footer>",
    visual: "html-semantic",
  },
  {
    id: "c-html-class-id",
    category: "flask",
    topic: "HTML",
    question: "Forskjell på `class` og `id` i HTML?",
    answer:
      "`class` brukes mange steder (en knapp-stil, en kortstil) — selektor i CSS er `.navn`. `id` skal være UNIK på siden (én header, én form med id=\"login\") — selektor er `#navn`. Hvis du er i tvil, bruk class.",
  },
  {
    id: "c-html-link-img",
    category: "flask",
    topic: "HTML",
    question: "Hvordan lager du lenker og bilder?",
    answer:
      "Lenker med <a href=\"...\"> — absolutt URL eller relativ sti. Bilder med <img src=\"...\" alt=\"...\">. `alt` er obligatorisk for tilgjengelighet og vises hvis bildet feiler.",
    code: "<a href=\"/about\">Om oss</a>\n<img src=\"logo.png\" alt=\"Firmalogo\">",
  },
  {
    id: "c-html-lists",
    category: "flask",
    topic: "HTML",
    question: "Forskjell på <ul>, <ol> og <li>?",
    answer:
      "<ul> = unordered list (kuler). <ol> = ordered list (1, 2, 3). Begge inneholder <li>-elementer. Bruk <ul> for navigasjon og <ol> der rekkefølgen betyr noe (oppskrifter, steg).",
  },
  {
    id: "c-bootstrap",
    category: "flask",
    topic: "Bootstrap",
    question: "Hva er Bootstrap, og hvordan kobler du det på?",
    answer:
      "Et ferdig CSS- og JS-bibliotek som gir responsive stiler via klasser. Kurset bruker det via CDN: én <link> til CSS i <head> og én <script> til JS før </body>. Etter det trenger du bare å legge klasser på HTML-elementer.",
    code: '<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">\n<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>',
  },
  {
    id: "c-bootstrap-container",
    category: "flask",
    topic: "Bootstrap",
    question: "Hva gjør klassen `container` i Bootstrap?",
    answer:
      "Wrap-elementet din får sentrert posisjon og responsiv maks-bredde — smal på mobil, bredere på desktop. Brukes typisk på en <div> som omslutter hovedinnholdet. Variant: `container-fluid` for full bredde alltid.",
  },
  {
    id: "c-bootstrap-btn",
    category: "flask",
    topic: "Bootstrap",
    question: "Hvordan lager du en blå knapp i Bootstrap?",
    answer:
      "Legg klassene `btn btn-primary` på et <button>- eller <a>-element. Andre varianter: `btn-secondary` (grå), `btn-danger` (rød), `btn-success` (grønn), `btn-outline-primary` (kun ramme).",
    code: '<button class="btn btn-primary">Send</button>',
  },
  {
    id: "c-html-form-method",
    category: "flask",
    topic: "HTML",
    question: "Hva betyr `method=\"POST\"` på et HTML-form?",
    answer:
      "Skjemadata sendes i request body, ikke i URL-en. Brukes for login, registrering og opprettelser — der data ikke skal vises i URL eller havne i historikk/bookmarks. method=\"GET\" legger felt i URL (?navn=Ola).",
    code: "<form method=\"POST\" action=\"/kunde/ny\">\n  <input name=\"navn\">\n  <button type=\"submit\">Lagre</button>\n</form>",
  },

  // ============= CSS (kap. 5) =============
  {
    id: "c-css-link",
    category: "flask",
    topic: "CSS",
    question: "Hvordan kobler du CSS til HTML?",
    answer:
      "Med <link rel=\"stylesheet\"> i <head>. I Flask brukes ofte url_for('static', filename=...) så stien fungerer uansett hvor appen kjører.",
    code: "<link rel=\"stylesheet\"\n  href=\"{{ url_for('static', filename='main.css') }}\">",
  },
  {
    id: "c-css-margin-padding",
    category: "flask",
    topic: "CSS",
    question: "Forskjell på margin og padding?",
    answer:
      "margin er plass UTENFOR elementets ramme (avstand mellom dette og neste element). padding er plass INNENFOR rammen (mellom innhold og ramme). Bakgrunnsfarge dekker padding, ikke margin.",
    visual: "css-box-model",
  },
  {
    id: "c-css-selector",
    category: "flask",
    topic: "CSS",
    question: "Hvordan velger du elementer i CSS?",
    answer:
      "Tag-navn matcher alle: `p { ... }`. Klasser med punktum: `.message { ... }`. ID-er med firkanttegn: `#header { ... }`. Du kan kombinere: `nav .btn` matcher klasse btn inni nav.",
  },
  {
    id: "c-bootstrap",
    category: "flask",
    topic: "CSS",
    question: "Hva er Bootstrap, og hvorfor brukes det?",
    answer:
      "Et ferdig CSS-rammeverk med klasser som `btn btn-primary`, `navbar`, `container`, `card`. Gir raskt et profesjonelt utseende uten å skrive CSS selv, og er responsive ut av boksen (tilpasser mobil/PC).",
    code: "<button class=\"btn btn-primary\">Lagre</button>\n<div class=\"container\">\n  <div class=\"card\">...</div>\n</div>",
  },
  {
    id: "c-css-responsive",
    category: "flask",
    topic: "CSS",
    question: "Hva betyr \"responsiv design\"?",
    answer:
      "Siden tilpasser seg skjermstørrelsen — mobil, nettbrett, PC. Oppnås med relative enheter (%, rem), media queries (@media (max-width: 600px)), eller et rammeverk som Bootstrap. Krev <meta name=\"viewport\"> i <head>.",
  },

  // ============= HTTP DETALJER (kap. 7) =============
  {
    id: "c-put-vs-patch",
    category: "http",
    topic: "HTTP-metoder",
    question: "Forskjell på PUT og PATCH?",
    answer:
      "PUT erstatter hele ressursen — du sender hele objektet. PATCH oppdaterer DELER av ressursen — du sender bare feltene som skal endres. PUT må være idempotent; PATCH er det vanligvis også, men ikke garantert.",
  },
  {
    id: "c-cookies",
    category: "http",
    topic: "Cookies",
    question: "Hva er cookies, og hvordan skiller de seg fra sessions?",
    answer:
      "Cookies er små data lagret i nettleseren og sendes med hver request. Sessions ligger på serveren — cookien inneholder bare en session-ID som server slår opp. Sett HttpOnly + Secure + SameSite=Lax på session-cookies for å hindre XSS- og CSRF-angrep.",
  },
  {
    id: "c-postman",
    category: "http",
    topic: "Verktøy",
    question: "Hva brukes Postman til?",
    answer:
      "Et verktøy for å teste API-er manuelt — sende GET/POST/PUT/DELETE, sette headers, sende JSON-body, og se respons med statuskode. Nyttig når du bygger et REST API og vil verifisere før frontend er klar.",
  },
  {
    id: "c-file-upload",
    category: "sikkerhet",
    topic: "File upload",
    question: "Hvordan beskytter du file-upload?",
    answer:
      "Begrens filtyper (whitelist, ikke blacklist). Sjekk MIME-type OG faktisk innhold (magic bytes). Gi filen et nytt randomisert navn — aldri stol på brukerens. Lagre utenfor webroot så filen ikke kan kjøres direkte. Sett max størrelse.",
  },
  {
    id: "c-content-type",
    category: "http",
    topic: "Headers",
    question: "Hva forteller `Content-Type`-headeren?",
    answer:
      "Hvilket dataformat body-en har. Vanlige: text/html (HTML-side), application/json (JSON-API), application/x-www-form-urlencoded (vanlig form), multipart/form-data (form med filopplasting). Klienten/serveren bruker dette til å parse innholdet riktig.",
  },

  // ============= DATATYPER (kap. 1) =============
  {
    id: "c-dt-int",
    category: "sql",
    topic: "Datatyper",
    question: "Når bruker du INT?",
    answer:
      "For heltall — ID-er (KundeNr), antall, status-koder. INT i MySQL er 4 bytes (~2 mrd). For svært store tall, bruk BIGINT. Typisk kombinert med AUTO_INCREMENT for primærnøkler.",
    code: "KundeNr INT AUTO_INCREMENT PRIMARY KEY",
  },
  {
    id: "c-dt-varchar",
    category: "sql",
    topic: "Datatyper",
    question: "VARCHAR(50) vs TEXT?",
    answer:
      "VARCHAR(n) har en maksimal lengde — bra for korte felt som navn, e-post, telefonnummer. TEXT er for lange tekster (kommentarer, artikler) — kan ikke ha standard-verdi i samme grad og kan ikke indekseres i sin helhet.",
  },
  {
    id: "c-dt-date",
    category: "sql",
    topic: "Datatyper",
    question: "Forskjell på DATE, DATETIME og TIMESTAMP?",
    answer:
      "DATE = bare dato (YYYY-MM-DD). DATETIME = dato + tid (YYYY-MM-DD HH:MM:SS). TIMESTAMP = dato + tid med tidssone-håndtering, men begrenset rekkevidde (1970–2038). Bruk DATETIME for fremtidige datoer.",
  },
  {
    id: "c-dt-decimal",
    category: "sql",
    topic: "Datatyper",
    question: "Hvorfor DECIMAL og ikke FLOAT for penger?",
    answer:
      "FLOAT/DOUBLE bruker binær representasjon og kan ikke lagre 0.10 eksakt — du får avrundingsfeil. DECIMAL(10,2) er eksakt og lagrer alltid riktig. Regelen: bruk DECIMAL for penger, FLOAT bare for vitenskapelige målinger.",
    code: "Pris DECIMAL(10,2)  -- opp til 99 999 999.99",
  },
  {
    id: "c-dt-not-null",
    category: "sql",
    topic: "Datatyper",
    question: "Hva gjør NOT NULL og DEFAULT?",
    answer:
      "NOT NULL betyr at kolonnen ALDRI kan være NULL — INSERT uten verdi feiler. DEFAULT setter en automatisk verdi hvis ingen oppgis. Sammen lager de robuste skjemaer der dataene ikke kan havne i en udefinert tilstand.",
    code: "Status VARCHAR(20) NOT NULL DEFAULT 'aktiv',\nOpprettet DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP",
  },

  // ============= DTE-2507 — Datakomm =============
  {
    id: "c-dte-osi",
    category: "begrep",
    topic: "Datakomm",
    question: "Hva er de fem lagene i TCP/IP-modellen, top-down?",
    answer:
      "Applikasjon (HTTP, DNS) → Transport (TCP, UDP) → Nettverk (IP) → Lenke (Ethernet, Wi-Fi) → Fysisk (kobber, fiber). Hver pakke gar ned-gjennom hos sender, opp-gjennom hos mottaker.",
  },
  {
    id: "c-dte-tcp-vs-udp",
    category: "begrep",
    topic: "Datakomm",
    question: "TCP vs UDP — en setning hver?",
    answer:
      "TCP: palitelig, tilkoblet, byte-strom, handshake, retransmit. UDP: best-effort, tilkoblings-los, datagrams, ingen garanti. TCP for HTTP/SSH; UDP for DNS/NTP/video.",
  },
  {
    id: "c-dte-3way",
    category: "begrep",
    topic: "Datakomm",
    question: "Hva er TCP 3-way handshake?",
    answer:
      "SYN (klient → server), SYN-ACK (server → klient), ACK (klient → server). Tre rammer for a sette opp en TCP-tilkobling og avtale start-sekvens-numre.",
    code: "Klient: SYN  Seq=0\nServer: SYN+ACK  Seq=0 Ack=1\nKlient: ACK  Seq=1 Ack=1",
  },
  {
    id: "c-dte-mac-vs-ip",
    category: "begrep",
    topic: "Datakomm",
    question: "MAC-adresse vs IP-adresse?",
    answer:
      "MAC (48-bit) er hardware-adresse pa nettverkskortet, brukes pa lenke-laget (lag 2), unik per kort. IP (32 eller 128-bit) er programvare-adresse, kan endres, brukes for routing (lag 3). ARP mapper IP → MAC.",
  },
  {
    id: "c-dte-arp",
    category: "begrep",
    topic: "Datakomm",
    question: "Hva er ARP og hvorfor er det usikkert?",
    answer:
      "Address Resolution Protocol mapper IP til MAC pa et lokalt nett. 'Who has 10.0.0.1? Tell 10.0.0.5' (broadcast) -> reply med MAC. Usikkert fordi ingen autentisering: hvem som helst kan svare med falsk MAC og lure trafikk til seg (ARP spoofing).",
  },
  {
    id: "c-dte-dns",
    category: "begrep",
    topic: "Datakomm",
    question: "Hva gjor DNS og hvilken transport?",
    answer:
      "Mapper domene-navn til IP-adresser. Standard pa UDP port 53 (kort, idempotent). Faller til TCP for store svar eller zone transfer. DNSSEC signerer svar; DoT/DoH krypterer.",
  },
  {
    id: "c-dte-mtu",
    category: "begrep",
    topic: "Datakomm",
    question: "Hva er MTU?",
    answer:
      "Maximum Transmission Unit — storste pakke som kan sendes uten fragmentering pa et lenke-lag-segment. Ethernet vanlig 1500 bytes. Pakker storre enn MTU fragmenteres eller dropp es med ICMP 'Fragmentation needed'.",
  },
  {
    id: "c-dte-ttl",
    category: "begrep",
    topic: "Datakomm",
    question: "Hva er TTL i en IP-pakke?",
    answer:
      "Time To Live: en teller (start vanligvis 64 eller 128) som dekrementeres for hver router-hopp. Naar TTL=0 droppes pakken og en ICMP 'Time Exceeded' sendes tilbake. Hindrer evige rute-loops.",
  },
  {
    id: "c-dte-nat",
    category: "begrep",
    topic: "Datakomm",
    question: "Hva er NAT og hvorfor brukes det?",
    answer:
      "Network Address Translation: én offentlig IP deles av mange private (10/8, 192.168/16). Routeren oversetter src-IP+port til sin egen offentlige IP. Lar mange enheter dele én offentlig IP — kritisk pa IPv4 pga adresseknapphet.",
  },
  {
    id: "c-dte-private-ip",
    category: "begrep",
    topic: "Datakomm",
    question: "RFC 1918 private IP-rom?",
    answer:
      "10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16. Disse rutes ikke pa internett — brukes pa LAN bak NAT.",
  },
  {
    id: "c-dte-cidr-24",
    category: "begrep",
    topic: "Datakomm",
    question: "Hva betyr /24?",
    answer:
      "CIDR-notasjon: de forste 24 bits er nettverks-del, resterende 8 er host-del. 10.0.0.0/24 har 256 totalt adresser, 254 brukbare (en for nett-adresse, en for broadcast).",
  },
  {
    id: "c-dte-icmp",
    category: "begrep",
    topic: "Datakomm",
    question: "Hva er ICMP?",
    answer:
      "Internet Control Message Protocol — kontroll- og diagnostikk-meldinger pa nettverkslaget (lag 3). Ping bruker ICMP Echo Request/Reply. Traceroute eksploiterer TTL Exceeded-meldinger. ICMP er ikke transport — det er kontroll-meldinger.",
  },

  // ============= DTE-2507 — Sockets =============
  {
    id: "c-sock-server-skeleton",
    category: "praktisk",
    topic: "Sockets",
    question: "TCP-server-skjelett i Python (5 kall)?",
    answer:
      "socket(AF_INET, SOCK_STREAM) → bind((host,port)) → listen(backlog) → conn, addr = accept() → recv/send → close. Lagre disse fem utenat.",
    code: "srv = socket.socket(socket.AF_INET, socket.SOCK_STREAM)\nsrv.bind(('0.0.0.0', 8080))\nsrv.listen(5)\nconn, addr = srv.accept()\nconn.sendall(conn.recv(4096))\nconn.close()",
  },
  {
    id: "c-sock-client-skeleton",
    category: "praktisk",
    topic: "Sockets",
    question: "TCP-klient-skjelett?",
    answer:
      "socket() → connect((host, port)) → sendall(data) → recv(n) → close. Klient-koden er kortere fordi det ikke trenger accept-loop.",
    code: "c = socket.socket()\nc.connect(('example.com', 80))\nc.sendall(b'GET / HTTP/1.0\\r\\n\\r\\n')\ndata = c.recv(4096)\nc.close()",
  },
  {
    id: "c-sock-recv-partial",
    category: "praktisk",
    topic: "Sockets",
    question: "Hvorfor returnerer recv noen ganger fa bytes?",
    answer:
      "TCP er en byte-strom, ikke meldings-basert. recv(n) garanterer ikke n bytes — bare opptil n. Du ma loope til du har all data, og selv definere meldings-grense (lengde-prefiks eller avgrenser).",
  },
  {
    id: "c-sock-udp-vs-tcp-call",
    category: "praktisk",
    topic: "Sockets",
    question: "Hvilke API-kall skiller UDP fra TCP?",
    answer:
      "UDP bruker sendto(data, addr) og recvfrom(n) som ogsa returnerer avsender-adresse. Ingen accept(), connect() er valgfri og setter bare default peer. TCP bruker send()/recv() pa en established tilkobling.",
  },
  {
    id: "c-sock-time-wait",
    category: "praktisk",
    topic: "Sockets",
    question: "Hva er TIME_WAIT og hvorfor far jeg 'Address already in use'?",
    answer:
      "TCP-state etter aktiv close — sokket holdes i 60-120 sek for a fange forsinkede pakker. Restart-er du serveren umiddelbart, klager OS over at adressen er i bruk. Fiks: setsockopt(SOL_SOCKET, SO_REUSEADDR, 1) for bind().",
  },
  {
    id: "c-sock-shutdown",
    category: "praktisk",
    topic: "Sockets",
    question: "Hva gjor shutdown(SHUT_WR)?",
    answer:
      "Half-close: sender FIN sa peer-en vet vi er ferdige med a skrive, men vi kan fortsatt lese. Brukes nar man vil signalisere 'jeg har sendt alt, men jeg venter pa svar fra deg'.",
  },
  {
    id: "c-sock-blocking-vs-async",
    category: "praktisk",
    topic: "Sockets",
    question: "Blocking I/O, threading eller asyncio — naar hvilken?",
    answer:
      "Blocking: én klient om gangen — enklest. Threading: noen titalls samtidige — én thread per tilkobling, men dyrere ved hundrevis pga RAM/kontekst-bytte. asyncio/select: tusenvis samtidige — én thread, event-loop. C10K-problemet drev frem asyncio og non-blocking I/O.",
  },

  // ============= DTE-2507 — TLS =============
  {
    id: "c-tls-three-properties",
    category: "sikkerhet",
    topic: "TLS",
    question: "Hvilke tre garantier gir TLS?",
    answer:
      "Konfidensialitet (kryptering — sniffer ser bare stoy), integritet (ingen kan endre bytene uoppdaget), og autentisitet (klient vet det er riktig server via sertifikat). TLS skjuler IKKE hvilken server du gar til (SNI lekker) eller at du snakker.",
  },
  {
    id: "c-tls-handshake-13",
    category: "sikkerhet",
    topic: "TLS",
    question: "TLS 1.3-handshake — 4 hoved-meldinger?",
    answer:
      "1) Client Hello (SNI, ciphers, key share). 2) Server Hello + Certificate + Finished (alt etter Server Hello er kryptert). 3) Client Finished. 4) Application Data. Total: 1 RTT.",
  },
  {
    id: "c-tls-12-vs-13",
    category: "sikkerhet",
    topic: "TLS",
    question: "TLS 1.2 vs 1.3 — to konkrete forskjeller?",
    answer:
      "(1) Handshake: 2 RTT i 1.2 vs 1 RTT i 1.3. (2) Sertifikatet er klartekst i 1.2, kryptert i 1.3 (skjules etter Server Hello). 1.3 fjerner ogsa alle utdaterte ciphers — bare AEAD-suites igjen.",
  },
  {
    id: "c-tls-cert-validation",
    category: "sikkerhet",
    topic: "TLS",
    question: "Hva sjekkes i sertifikat-validering?",
    answer:
      "(1) Signatur-kjede opp til en betrodd Root CA i klientens trust store. (2) Gyldighetsdato (Not Before / Not After). (3) CN/SAN matcher server-navnet vi spurte etter. Alle tre ma passe.",
  },
  {
    id: "c-tls-sni-leak",
    category: "sikkerhet",
    topic: "TLS",
    question: "Hva er SNI og hvorfor lekker det?",
    answer:
      "Server Name Indication — domenenavnet klienten ber om, sa én IP kan hoste mange domener (virtual hosting). I TLS 1.2/1.3 gar SNI i klartekst i Client Hello — derfor kan en sniffer se HVILKEN side du gar til. ECH (Encrypted Client Hello) prover a fikse det.",
  },
  {
    id: "c-tls-forward-secrecy",
    category: "sikkerhet",
    topic: "TLS",
    question: "Forward secrecy — hva betyr det?",
    answer:
      "Selv om server-ens langtids-private-nokkel lekker i fremtiden, kan en angriper ikke dekryptere fortidens TLS-trafikk. Oppnaas ved at hver okt har en kort-tids-nokkel utledet via Diffie-Hellman (ECDHE) som kastes etterpa. TLS 1.3 krever forward secrecy.",
  },
  {
    id: "c-tls-cipher-suite",
    category: "sikkerhet",
    topic: "TLS",
    question: "Lese en cipher suite: TLS_AES_256_GCM_SHA384",
    answer:
      "AES-256 = symmetrisk kryptering. GCM = authenticated encryption (gir bade konfidensialitet og integritet i ett). SHA-384 = hash for nokkel-utledning (HKDF). Prefix TLS_ uten ECDHE/RSA er TLS 1.3-format.",
  },

  // ============= DTE-2507 — Brannmur =============
  {
    id: "c-fw-stateless-vs-stateful",
    category: "sikkerhet",
    topic: "Brannmur",
    question: "Stateless vs stateful brannmur — kjernen?",
    answer:
      "Stateless sjekker hver pakke isolert (IP, port, flagg) — du ma ha eksplisitt regel for utgaaende OG inngaaende. Stateful holder en connection-tabell og slipper automatisk gjennom retur-trafikk pa eksisterende tilkoblinger. Moderne FW-er (iptables, pfSense) er stateful.",
  },
  {
    id: "c-fw-drop-vs-reject",
    category: "sikkerhet",
    topic: "Brannmur",
    question: "DROP vs REJECT i iptables?",
    answer:
      "DROP: kast pakken stille — avsenderen far timeout. Bedre mot port-skanning. REJECT: kast med ICMP 'Destination Unreachable' — hoflig men avslorer at vi finnes. Praksis: DROP pa internett-siden, REJECT internt for raskere feilmeldinger.",
  },
  {
    id: "c-fw-dmz",
    category: "sikkerhet",
    topic: "Brannmur",
    question: "Hva er DMZ?",
    answer:
      "Demilitarized Zone — en sone mellom internett og indre LAN. Eksponerte tjenester (webserver, mailserver) staar i DMZ. Brannmur slipper bare gitte porter inn til DMZ, og strengt begrenset trafikk fra DMZ til indre LAN. Et brudd pa webserver gir ikke direkte tilgang til DB.",
  },
  {
    id: "c-fw-defense-in-depth",
    category: "sikkerhet",
    topic: "Brannmur",
    question: "Defense in depth — i en setning?",
    answer:
      "Aldri stol pa ett enkelt forsvars-lag. CDN/anti-DDoS + WAF + LB + stateful FW + applikasjons-validering + host-FW + least-privilege bruker. Bryter ett — flere staar.",
  },
  {
    id: "c-fw-least-priv",
    category: "sikkerhet",
    topic: "Brannmur",
    question: "Least privilege — hva er det?",
    answer:
      "Hver komponent gis BARE de rettighetene den absolutt trenger. Webserveren kjorer ikke som root; DB-brukeren har ikke DROP TABLE; brannmur-default er DENY. Skader fra én kompromittert komponent begrenses.",
  },
  {
    id: "c-fw-vlan-purpose",
    category: "sikkerhet",
    topic: "Brannmur",
    question: "Hvorfor VLAN?",
    answer:
      "Logisk segmentering pa én fysisk switch. (1) Reduserer broadcast-domener. (2) Begrenser lateral movement etter et brudd. (3) Ulike sikkerhets-policys per gruppe. (4) Skiller gjester fra ansatte uten egen kabling. Trafikk mellom VLAN-er rutes via L3 og kan passere brannmur.",
  },
  {
    id: "c-fw-access-vs-trunk",
    category: "sikkerhet",
    topic: "Brannmur",
    question: "Access port vs trunk port?",
    answer:
      "Access (untagged): én VLAN, switchen legger pa og fjerner 802.1Q-tag automatisk. Brukes for sluttbruker-PC-er. Trunk (tagged): beholder 802.1Q-tag i framen, brer flere VLAN-er over én link. Brukes mellom switcher og til hypervisor-noder.",
  },
  {
    id: "c-fw-zero-trust",
    category: "sikkerhet",
    topic: "Brannmur",
    question: "Zero trust — kjernen?",
    answer:
      "'Never trust, always verify.' Det finnes ikke et trusted internal network — hver tilkobling autentiseres og autoriseres, gjerne mTLS mellom mikrotjenester. Bryter med klassisk 'thick perimeter, soft interior'-modell.",
  },

  // ============= DTE-2507 — Kryptografi =============
  {
    id: "c-crypto-sym-vs-asym",
    category: "sikkerhet",
    topic: "Kryptografi",
    question: "Symmetrisk vs asymmetrisk kryptering?",
    answer:
      "Symmetrisk: én delt nokkel (AES, ChaCha20). Rask, men hvordan dele nokkelen sikkert? Asymmetrisk: nokkelpar — public for kryptering / verifisering, private for dekryptering / signering (RSA, ECC). Treg, men loser nokkel-deling. TLS bruker asymmetrisk for handshake, symmetrisk for application data.",
  },
  {
    id: "c-crypto-hash-vs-hmac",
    category: "sikkerhet",
    topic: "Kryptografi",
    question: "Hash vs HMAC?",
    answer:
      "Hash (SHA-256) er en envegs-funksjon: H(data) -> 256 bits. Alle kan beregne. HMAC bruker en delt nokkel i tillegg: HMAC(key, data) -> 256 bits. Bare den med nokkelen kan beregne — gir autentisering i tillegg til integritet. Beskytter mot lengde-utvidelse som naken H(key||data) er sarbar for.",
  },
  {
    id: "c-crypto-signature",
    category: "sikkerhet",
    topic: "Kryptografi",
    question: "Hva er en digital signatur?",
    answer:
      "Signer: hash meldingen, krypter hash-en med din private nokkel -> signatur. Verifiser: dekrypter signaturen med signerens offentlige nokkel -> sammenlign med egen hash av meldingen. Gir autentisitet (kun nokkel-eier kan signere) og integritet (hash matcher).",
  },
  {
    id: "c-crypto-pki",
    category: "sikkerhet",
    topic: "Kryptografi",
    question: "Hva er PKI?",
    answer:
      "Public Key Infrastructure: et hierarki av Certificate Authorities (CAs) som signerer sertifikater. Et sertifikat binder en public key til en identitet (domene-navn). Klienter har en trust store med Root CA-er; sertifikater valideres ved a folge signatur-kjeden opp dit.",
  },
  {
    id: "c-crypto-aead",
    category: "sikkerhet",
    topic: "Kryptografi",
    question: "Hva er AEAD?",
    answer:
      "Authenticated Encryption with Associated Data — gir bade konfidensialitet OG integritet i ett kall (AES-GCM, ChaCha20-Poly1305). Trygt by default: kan ikke bruke det galt og ende uten integritet-sjekk. TLS 1.3 tillater bare AEAD-cipher-suites.",
  },
  {
    id: "c-crypto-secrets",
    category: "sikkerhet",
    topic: "Kryptografi",
    question: "Hvorfor secrets-modulen og ikke random?",
    answer:
      "random er pseudoslump (predikerbar fra seed) — IKKE trygt for tokens/passord/nokler. secrets bruker OS-CSPRNG (urandom) og er kryptografisk sikker. Bruk secrets.token_hex(n), secrets.token_urlsafe(n), secrets.compare_digest(a, b).",
  },
  {
    id: "c-crypto-password-storage",
    category: "sikkerhet",
    topic: "Kryptografi",
    question: "Hvordan lagre passord (kort)?",
    answer:
      "ALDRI klartekst. ALDRI bare SHA-256 (GPU brute-forces det). Bruk en slow KDF: bcrypt, argon2, scrypt. Disse er bevisst trege (millisekunder) og bruker per-bruker salt. argon2id er anbefalt valg fra OWASP.",
  },

  // ============= DTE-2507 deep-dive: 25 nye =============
  {
    id: "c2507d-osi-7",
    category: "praktisk",
    topic: "DTE-2507",
    question: "Hva er OSI-modellens 7 lag (top-down)?",
    answer: "7 Application, 6 Presentation, 5 Session, 4 Transport, 3 Network, 2 Data Link, 1 Physical. TCP/IP-modellen slår sammen 5+6+7 til ett applikasjons-lag.",
  },
  {
    id: "c2507d-port-22-25-53-80-443",
    category: "praktisk",
    topic: "DTE-2507",
    question: "Hvilken protokoll på port 22, 25, 53, 80 og 443?",
    answer: "22 = SSH, 25 = SMTP (mail), 53 = DNS (UDP og TCP), 80 = HTTP, 443 = HTTPS.",
  },
  {
    id: "c2507d-tcp-flags",
    category: "praktisk",
    topic: "DTE-2507",
    question: "Hva betyr TCP-flagg SYN, ACK, FIN, RST?",
    answer: "SYN = initiering (synkroniser SEQ). ACK = bekreft mottak. FIN = pent avslutning. RST = brå avslutning (port lukket, sekvens-feil).",
  },
  {
    id: "c2507d-3way-handshake",
    category: "praktisk",
    topic: "DTE-2507",
    question: "Beskriv TCP 3-way handshake.",
    answer: "1) Klient til Server: SYN. 2) Server til Klient: SYN+ACK. 3) Klient til Server: ACK. Etter dette er begge enige om SEQ-nummer og kan sende data.",
  },
  {
    id: "c2507d-http-status",
    category: "http",
    topic: "DTE-2507",
    question: "Hva betyr HTTP 200, 301, 401, 403, 404, 500?",
    answer: "200 OK, 301 Moved Permanently, 401 Unauthorized (ikke innlogget), 403 Forbidden (innlogget men ikke tilgang), 404 Not Found, 500 Internal Server Error.",
  },
  {
    id: "c2507d-cidr-24",
    category: "praktisk",
    topic: "DTE-2507",
    question: "Hvor mange brukbare IP-adresser i et /24-nett?",
    answer: "256 totalt (2^8). Trekk fra network + broadcast = 254 brukbare.",
  },
  {
    id: "c2507d-cidr-28",
    category: "praktisk",
    topic: "DTE-2507",
    question: "Hvor mange brukbare i et /28-nett?",
    answer: "16 totalt, 14 brukbare (16 - 2).",
  },
  {
    id: "c2507d-private-ranges",
    category: "praktisk",
    topic: "DTE-2507",
    question: "Hvilke IP-ranges er PRIVATE (RFC 1918)?",
    answer: "10.0.0.0/8, 172.16.0.0/12 og 192.168.0.0/16. Kan ikke rutes på Internett - du trenger NAT for å nå ut.",
  },
  {
    id: "c2507d-tls-versjon",
    category: "sikkerhet",
    topic: "DTE-2507",
    question: "Hvilke TLS-versjoner er anbefalt brukt i 2024?",
    answer: "Kun TLS 1.2 og 1.3. SSL 2/3 og TLS 1.0/1.1 er deprecated. TLS 1.3 har enklere handshake (1-RTT) og obligatorisk forward secrecy.",
  },
  {
    id: "c2507d-symmetric-asymmetric",
    category: "sikkerhet",
    topic: "DTE-2507",
    question: "Forskjell på symmetrisk og asymmetrisk kryptering?",
    answer: "Symmetrisk: én delt nøkkel, raskt (AES). Asymmetrisk: nøkkelpar (public/private), tregt men løser nøkkelutveksling og signering (RSA, ECDH).",
  },
  {
    id: "c2507d-hash-vs-mac",
    category: "sikkerhet",
    topic: "DTE-2507",
    question: "Forskjell på hash og MAC?",
    answer: "Hash (SHA-256) er en envegs-funksjon - gir integritet, men ingen kan bevise hvem som sendte. MAC = HMAC bruker en delt nøkkel + hash, gir både integritet og autentisering (avsender HAR nøkkelen).",
  },
  {
    id: "c2507d-x509",
    category: "sikkerhet",
    topic: "DTE-2507",
    question: "Hva er et X.509-sertifikat?",
    answer: "Et standardformat for å signere en public key. Inneholder: subject (domene), public key, utsteder (CA), gyldighetstid, signaturalgoritme, og selve signaturen fra CA-en.",
  },
  {
    id: "c2507d-arp-uten-ruter",
    category: "praktisk",
    topic: "DTE-2507",
    question: "Kan ARP-pakker gå gjennom en ruter?",
    answer: "Nei. ARP opererer på lag 2 (datalink) og er broadcasted bare på det lokale nettverket. Hver ruter har sin egen ARP-cache for hvert nett den er på.",
  },
  {
    id: "c2507d-mtu",
    category: "praktisk",
    topic: "DTE-2507",
    question: "Hva er MTU?",
    answer: "Maximum Transmission Unit - største pakke et nettverk kan sende uten fragmentering. Standard Ethernet MTU er 1500 bytes. IP-pakker over denne fragmenteres (eller dropping hvis DF-flag).",
  },
  {
    id: "c2507d-icmp",
    category: "praktisk",
    topic: "DTE-2507",
    question: "Hva er ICMP og hvilke meldinger er vanlige?",
    answer: "Internet Control Message Protocol - lag 3-meldinger for feilrapportering og diagnostikk. Echo Request/Reply (ping), Destination Unreachable, Time Exceeded (brukes av traceroute), Redirect.",
  },
  {
    id: "c2507d-dns-rekord",
    category: "praktisk",
    topic: "DTE-2507",
    question: "Hva gjør A, AAAA, MX, CNAME, TXT?",
    answer: "A = navn til IPv4-adresse. AAAA = navn til IPv6. MX = mail-server for domenet. CNAME = alias (peker til annet navn). TXT = fritekst (SPF, DKIM, verifikasjon).",
  },
  {
    id: "c2507d-tcp-udp",
    category: "praktisk",
    topic: "DTE-2507",
    question: "Når velger man UDP fremfor TCP?",
    answer: "Når lav latens og toleranse for tap er viktigere enn pålitelighet: DNS-spørringer, video/audio-streaming, online spill, QUIC. UDP har ingen ACK, ingen flow control, ingen retransmit.",
  },
  {
    id: "c2507d-osi-enheter",
    category: "praktisk",
    topic: "DTE-2507",
    question: "Hvilket OSI-lag er hub, switch, ruter på?",
    answer: "Hub: lag 1 (kopier bits). Switch: lag 2 (MAC-basert switching). Ruter: lag 3 (IP-basert routing). Lag-4-switcher gjør load-balancing basert på TCP/UDP-port.",
  },
  {
    id: "c2507d-owasp-top-10",
    category: "sikkerhet",
    topic: "DTE-2507",
    question: "Hva er OWASP Top 10?",
    answer: "Liste over de 10 vanligste websårbarhetene. 2021-versjonen: Broken Access Control, Cryptographic Failures, Injection, Insecure Design, Security Misconfiguration, Vulnerable Components, Identification/Auth Failures, Software/Data Integrity, Logging, SSRF.",
  },
  {
    id: "c2507d-firewall-stateful",
    category: "sikkerhet",
    topic: "DTE-2507",
    question: "Forskjell på stateless og stateful brannmur?",
    answer: "Stateless: vurder hver pakke isolert mot reglene. Enkelt men mangler kontekst - kan ikke automatisk slippe svar inn på utgående tilkoblinger. Stateful holder en tilkoblings-tabell og kan si «slipp inn fordi denne er svar på etablert connection».",
  },
  {
    id: "c2507d-ids-vs-ips",
    category: "sikkerhet",
    topic: "DTE-2507",
    question: "IDS vs IPS?",
    answer: "IDS (Intrusion Detection System) overvåker og varsler. IPS (Intrusion Prevention System) sitter inline og BLOKKERER. IDS er ute av flyten (out-of-band, ofte SPAN-port); IPS må gjennom - performance og false-positive-risk.",
  },
  {
    id: "c2507d-dijkstra-bellman",
    category: "praktisk",
    topic: "DTE-2507",
    question: "Dijkstra vs Bellman-Ford som ruting-algoritme?",
    answer: "Dijkstra (brukt i OSPF) - link-state, hver ruter har globalt bilde, raskere konvergens. Bellman-Ford (brukt i RIP) - distance-vector, hver ruter snakker bare med naboer, tåler negative vekter, tregere konvergens (count-to-infinity).",
  },
  {
    id: "c2507d-rsa-keysize",
    category: "sikkerhet",
    topic: "DTE-2507",
    question: "Hvorfor er RSA-2048 standard i dag, ikke RSA-1024?",
    answer: "RSA-1024 anses ikke lenger sikker - kan teoretisk faktorises med store ressurser. NIST anbefaler minst 2048-bit fram til 2030, 3072+ deretter. Sikkerhet vokser logaritmisk med nøkkellengden.",
  },
  {
    id: "c2507d-hmac",
    category: "sikkerhet",
    topic: "DTE-2507",
    question: "Hva er HMAC og hvorfor ikke bare hash(key || message)?",
    answer: "HMAC = Hash-based MAC. Standardisert konstruksjon: H((key XOR opad) || H((key XOR ipad) || msg)). Sikker mot length-extension-angrep som rammer naive «hash(secret || data)»-konstruksjoner.",
  },
  {
    id: "c2507d-vlan-802-1q",
    category: "praktisk",
    topic: "DTE-2507",
    question: "Hva er 802.1Q og hvorfor brukes VLAN?",
    answer: "802.1Q legger en 4-byte VLAN-tag i Ethernet-headeren med 12-bit VLAN-ID. Lar én fysisk switch håndtere flere logisk separerte nettverk uten å trenge flere kabler. Mellom switcher: trunk-port som sender taggede frames.",
  },
];

export const CARD_CATEGORIES: { id: FlashCard["category"]; label: string }[] = [
  { id: "begrep", label: "Begrep" },
  { id: "design", label: "DB-design" },
  { id: "sql", label: "SQL" },
  { id: "flask", label: "Flask" },
  { id: "http", label: "HTTP / API" },
  { id: "sikkerhet", label: "Sikkerhet" },
  { id: "praktisk", label: "Praktisk" },
];
