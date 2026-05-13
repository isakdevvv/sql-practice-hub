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

  // ============= DTE-2602 — ML/AI (30 kort) =============
  {
    id: "c-dte2602-bias-varians-def",
    category: "begrep",
    topic: "DTE-2602",
    question: "Hva er bias-varians-dekomposisjonen?",
    answer:
      "Forventet kvadratisk feil splittes i tre ledd: E[(ŷ-y)²] = Bias(ŷ)² + Var(ŷ) + σ². Bias = hvor systematisk modellen bommer. Varians = hvor ustabil modellen er på tvers av treningssett. σ² = irreduserbar støy.",
    code: "E[(ŷ-y)²] = Bias² + Var + σ²",
  },
  {
    id: "c-dte2602-overfit-symptom",
    category: "begrep",
    topic: "DTE-2602",
    question: "Klassisk symptom på overfitting?",
    answer:
      "Stor gap mellom train- og test-feil — modellen gjør det nesten perfekt på treningsdata men dårlig på nye data. Høy varians. Fiks: regularisering, mer data, enklere modell.",
  },
  {
    id: "c-dte2602-underfit-symptom",
    category: "begrep",
    topic: "DTE-2602",
    question: "Klassisk symptom på underfitting?",
    answer:
      "Både train- og test-feil er høye og ligger nær hverandre. Høy bias. Fiks: mer fleksibel modell, flere features, mindre regularisering.",
  },
  {
    id: "c-dte2602-ridge",
    category: "begrep",
    topic: "DTE-2602",
    question: "Hva gjør Ridge-regulering (L2)?",
    answer:
      "Legger til α·Σβ² til tap-funksjonen. Skrumper alle koeffisienter mot 0 (men aldri helt). Stabiliserer løsningen ved multikollinearitet og motvirker overfitting.",
    code: "L = MSE + α·Σ β_j²",
  },
  {
    id: "c-dte2602-lasso",
    category: "begrep",
    topic: "DTE-2602",
    question: "Hva gjør Lasso-regulering (L1)?",
    answer:
      "Legger til α·Σ|β| til tap-funksjonen. Skyver noen koeffisienter HELT til 0 — Lasso gjør automatisk feature selection. Nyttig når du har mange features og tror få er relevante.",
    code: "L = MSE + α·Σ |β_j|",
  },
  {
    id: "c-dte2602-ridge-vs-lasso",
    category: "begrep",
    topic: "DTE-2602",
    question: "Når Ridge og når Lasso?",
    answer:
      "Ridge: korrelerte features (fordeler vekt jevnt), standardvalg. Lasso: mange features hvorav få er viktige (du vil ha sparse modell). Vet du ikke — bruk ElasticNet som blander begge.",
  },
  {
    id: "c-dte2602-cv-kfold",
    category: "begrep",
    topic: "DTE-2602",
    question: "Hva er k-fold cross-validation?",
    answer:
      "Del treningsdata i k like deler (folds). Tren k ganger: hver gang holdes én fold ut som val-set, resten trenes på. Snittet av k val-scores gir mer robust estimat enn ett enkelt val-set. k=5 eller 10 er vanlig.",
    code: "scores = cross_val_score(model, X, y, cv=5)",
  },
  {
    id: "c-dte2602-stratified",
    category: "begrep",
    topic: "DTE-2602",
    question: "Hva er stratifisert split, og når trenger du det?",
    answer:
      "Vanlig train_test_split kan ved uflaks gi 0 % minoritetsklasse i test-settet. Stratify=y sikrer at klassebalansen blir lik i begge sett. Bruk alltid for klassifikasjon, og særlig ved ubalansert data.",
    code: "train_test_split(X, y, stratify=y, test_size=0.2)",
  },
  {
    id: "c-dte2602-metric-precision",
    category: "begrep",
    topic: "DTE-2602",
    question: "Når er precision viktigere enn recall?",
    answer:
      "Når en false positive er dyrere enn en false negative. Eksempler: spam-filter (bedre å la noe spam slippe gjennom enn å droppe en viktig epost), kreditt-godkjenning, rekommendasjons-systemer.",
  },
  {
    id: "c-dte2602-metric-recall",
    category: "begrep",
    topic: "DTE-2602",
    question: "Når er recall viktigere enn precision?",
    answer:
      "Når en false negative er dyrere enn en false positive. Eksempler: kreft-screening, fraud-deteksjon, sikkerhets-alarmer — å miste en ekte positiv har høye kostnader.",
  },
  {
    id: "c-dte2602-f1",
    category: "begrep",
    topic: "DTE-2602",
    question: "Hva er F1-score, og hvorfor harmonisk snitt?",
    answer:
      "F1 = 2·P·R/(P+R). Harmonisk snitt straffer ekstreme verdier hardere enn aritmetisk: hvis P=1.0 og R=0.0 blir F1=0, ikke 0.5. Nyttig når du vil ha balansert presisjon og recall.",
    code: "F1 = 2 * precision * recall / (precision + recall)",
  },
  {
    id: "c-dte2602-roc-auc",
    category: "begrep",
    topic: "DTE-2602",
    question: "Hva måler ROC-AUC?",
    answer:
      "Areal under ROC-kurven (TPR mot FPR over alle terskler). AUC=0.5 er random, 1.0 er perfekt. Måler modellens evne til å RANGERE positiver foran negativer — terskel-uavhengig.",
  },
  {
    id: "c-dte2602-leak",
    category: "begrep",
    topic: "DTE-2602",
    question: "Hva er datalekkasje (data leakage)?",
    answer:
      "Når informasjon fra test-settet sniker seg inn i trening, så test-scoren blir kunstig høy. Klassisk feil: skalere/imputere på hele X før train/test-split. Løsning: gjør all preprocessing inne i en sklearn Pipeline.",
  },
  {
    id: "c-dte2602-hyperparam-vs-param",
    category: "begrep",
    topic: "DTE-2602",
    question: "Forskjell på hyperparameter og parameter?",
    answer:
      "Parametere lærer modellen av data under .fit() (f.eks. koeffisientene β i regresjon). Hyperparametere setter DU før trening og tunes med val-set/CV (f.eks. max_depth, C, alpha, k i kNN).",
  },
  {
    id: "c-dte2602-gridsearch",
    category: "begrep",
    topic: "DTE-2602",
    question: "Hva gjør GridSearchCV?",
    answer:
      "Prøver alle kombinasjoner av hyperparametre du oppgir og kjører k-fold CV på hver. Returnerer best_estimator_, best_params_, best_score_. Refit-er modellen på hele treningsdata med beste params.",
    code: "GridSearchCV(pipe, {'clf__C': [0.1, 1, 10]}, cv=5)",
  },
  {
    id: "c-dte2602-train-val-test",
    category: "begrep",
    topic: "DTE-2602",
    question: "Hvorfor tre sett (train/val/test), ikke to?",
    answer:
      "Train: tren modellen. Val: velg hyperparametre (eller bruk CV inni train). Test: ÉN gang helt på slutten, for å estimere ekte generalisering. Bruker du test til tuning lekker du info — modellen velges biased mot test-settet.",
  },
  {
    id: "c-dte2602-pipeline",
    category: "begrep",
    topic: "DTE-2602",
    question: "Hvorfor pakke preprocessing i Pipeline?",
    answer:
      "Tre grunner: (1) hindrer datalekkasje — fit kjøres bare på train. (2) GridSearchCV kan tune alle steg samtidig. (3) Ett objekt å lagre/deploye — joblib.dump(pipe, 'model.pkl').",
    code: "Pipeline([('sc', StandardScaler()), ('lr', LogisticRegression())])",
  },
  {
    id: "c-dte2602-rf",
    category: "begrep",
    topic: "DTE-2602",
    question: "Hvorfor er Random Forest mer robust enn ett enkelt tre?",
    answer:
      "Bootstrap-sampling gir hver tre litt forskjellig treningsdata, og random feature subset i hver split dekorrelerer trærne. Når 100+ trær stemmer reduseres varians dramatisk — uten å øke bias merkbart.",
  },
  {
    id: "c-dte2602-gini",
    category: "begrep",
    topic: "DTE-2602",
    question: "Hva er Gini-impurity?",
    answer:
      "G = 1 - Σp_i². Mål for hvor 'urent' (blandet) en node er. G=0 = bare én klasse. G=0.5 (binær) = perfekt blandet. Treet velger split som minimerer vektet sum av Gini i barnenodene.",
  },
  {
    id: "c-dte2602-class-weight",
    category: "begrep",
    topic: "DTE-2602",
    question: "Hva gjør class_weight='balanced' i sklearn?",
    answer:
      "Justerer vekten på hver klasse omvendt proporsjonalt med frekvens. Minoritetsklassen får større innflytelse på tap-funksjonen. Førstevalget for ubalansert data — enklere enn SMOTE.",
  },
  {
    id: "c-dte2602-standardscaler",
    category: "begrep",
    topic: "DTE-2602",
    question: "Hva gjør StandardScaler?",
    answer:
      "Per kolonne: trekker fra mean og deler på std, slik at hver feature får mean=0, std=1. Krev for kNN, k-means, SVM (RBF), PCA, og for å akselerere konvergens i gradient-baserte modeller.",
    code: "x_scaled = (x - mean) / std",
  },
  {
    id: "c-dte2602-onehot",
    category: "begrep",
    topic: "DTE-2602",
    question: "Når og hvordan bruke OneHotEncoder?",
    answer:
      "Bruk for nominelle kategoriske kolonner (ingen iboende rekkefølge, f.eks. 'by', 'farge'). Returner én kolonne per kategori med 0/1. handle_unknown='ignore' for å unngå krasj på nye kategorier i test.",
    code: "OneHotEncoder(handle_unknown='ignore', sparse_output=False)",
  },
  {
    id: "c-dte2602-learning-curve",
    category: "begrep",
    topic: "DTE-2602",
    question: "Hva forteller en læringskurve deg?",
    answer:
      "Plot av train- og val-feil som funksjon av treningssett-størrelse. Begge høyt og nær hverandre → bias-problem (mer data hjelper ikke). Train lav + val høy med stort gap → varians-problem (mer data hjelper).",
  },
  {
    id: "c-dte2602-feature-importance",
    category: "begrep",
    topic: "DTE-2602",
    question: "Hvordan tolke feature_importances_ i Random Forest?",
    answer:
      "Verdi mellom 0 og 1 per feature, summerer til 1. Måler hvor mye splits på den featuren reduserer Gini i snitt. Biased mot features med høy kardinalitet — bruk permutation_importance for et mer pålitelig mål.",
  },
  {
    id: "c-dte2602-rmse-vs-mae",
    category: "begrep",
    topic: "DTE-2602",
    question: "Forskjell på RMSE og MAE?",
    answer:
      "RMSE = √(snitt(ŷ-y)²) — straffer store feil hardere (kvadrert). MAE = snitt(|ŷ-y|) — robust mot outliers, alle feil teller likt. Velg RMSE når store feil er ekstra ille (f.eks. prising av sjelden vare), MAE ellers.",
  },
  {
    id: "c-dte2602-r2",
    category: "begrep",
    topic: "DTE-2602",
    question: "Hva betyr R²?",
    answer:
      "Andel varians forklart av modellen. R²=1 perfekt, R²=0 like dårlig som gjennomsnittsmodell, R²<0 verre enn gjennomsnitt. Ikke tolkn det som 'prosent riktig' — det er en relativ score.",
  },
  {
    id: "c-dte2602-knn-k",
    category: "begrep",
    topic: "DTE-2602",
    question: "Hvordan velge k i kNN?",
    answer:
      "Liten k → høy varians, sensitive til støy. Stor k → høy bias, glatter for mye. Bruk CV: test k ∈ {1, 3, 5, 7, ..., 25} og velg den med best val-score. Skalér features først — kNN er avstandsbasert.",
  },
  {
    id: "c-dte2602-confusion-matrix",
    category: "begrep",
    topic: "DTE-2602",
    question: "Hvordan leser du sklearn sin confusion_matrix?",
    answer:
      "Rader = faktiske klasser, kolonner = predikerte. cm[0,0]=TN, cm[0,1]=FP, cm[1,0]=FN, cm[1,1]=TP. Diagonal = riktige, off-diagonal = feil. Visualiser med ConfusionMatrixDisplay for tydeligere bilde.",
  },
  {
    id: "c-dte2602-imbalance-acc-trap",
    category: "begrep",
    topic: "DTE-2602",
    question: "Hvorfor er accuracy farlig på ubalansert data?",
    answer:
      "Med 99 % klasse 0 får en modell som ALLTID sier 0 hele 99 % accuracy — og er ubrukelig. Bruk F1, recall, balanced_accuracy, eller AUC for å fange dette. Se også på confusion_matrix per klasse.",
  },
  {
    id: "c-dte2602-pipeline-cv-leak",
    category: "begrep",
    topic: "DTE-2602",
    question: "Hvorfor må preprocessing være INNI Pipeline når du bruker CV?",
    answer:
      "cross_val_score lager nye train/val-folds i hver iterasjon. Hvis du skalerte på hele X først, har scaler-en sett val-folden under fit — datalekkasje. Med Pipeline blir scaler fit_transform-et per fold, ærlig estimat.",
  },

  // ===== DTE-2602 PORTEFØLJE — AI-historie, etikk, filosofi, mappe-mal =====
  {
    id: "c-dte2602p-ai-fodsel",
    category: "begrep",
    topic: "AI-historie",
    question: "Hva markerte AI sin fødsel som fagfelt?",
    answer:
      "Dartmouth-konferansen i 1956. John McCarthy myntet uttrykket «artificial intelligence». Pionerene (McCarthy, Minsky, Shannon, Rochester) samlet seg for å definere feltet.",
  },
  {
    id: "c-dte2602p-ai-vintre",
    category: "begrep",
    topic: "AI-historie",
    question: "Hva var AI-vintrene?",
    answer:
      "Perioder med lite finansiering og sviktende forventninger. Første vinter (1970-tallet) etter Minsky/Papert viste at perceptron ikke kunne lære XOR. Andre vinter (1990-tallet) — expert systems-bølgen kollapset. Dagens DL-bølge er drevet av store data + GPU + bedre optimering.",
  },
  {
    id: "c-dte2602p-turing-test",
    category: "begrep",
    topic: "AI-historie",
    question: "Hva er Turing-testen?",
    answer:
      "Foreslått av Alan Turing (1950): en maskin 'tenker' hvis en menneskelig dommer ikke kan skille den fra et menneske i en tekstbasert samtale. Operasjonell definisjon. Kritisk respons: Searles Kinarom-argument (1980) hevder at å bestå ikke betyr at maskinen 'forstår'.",
  },
  {
    id: "c-dte2602p-bias-historisk",
    category: "begrep",
    topic: "AI-etikk",
    question: "Konkret eksempel på historisk bias i ML?",
    answer:
      "Amazon CV-screening (2018) — trent på 10 år med CV-er fra mest menn. Modellen lærte å straffe ordet 'kvinne-' (f.eks. «kvinne-fotball-lag»). Amazon trakk systemet. 'Objektiv' modell videreførte historisk diskriminering.",
  },
  {
    id: "c-dte2602p-bias-sampling",
    category: "begrep",
    topic: "AI-etikk",
    question: "Hva viste Gender Shades-studien?",
    answer:
      "Joy Buolamwini (MIT, 2018) testet IBM/Microsoft/Face++ ansiktsgjenkjenning. Feilrate < 1% på lyse menn, opp til 35% på mørke kvinner. Skjeve treningsdata = skjev ytelse — klassisk sampling-bias.",
  },
  {
    id: "c-dte2602p-bias-compas",
    category: "begrep",
    topic: "AI-etikk",
    question: "Hva var COMPAS-skandalen?",
    answer:
      "COMPAS — kommersiell risiko-score for tilbakefall i USAs rettsvesen. ProPublica (2016) viste at modellen markerte svarte tiltalte som «høyrisiko» dobbelt så ofte som hvite. Rase var ikke en feature, men postnummer + anholdelses-historikk fungerte som proxies — eksempel på måle-bias.",
  },
  {
    id: "c-dte2602p-bias-uk-karakter",
    category: "begrep",
    topic: "AI-etikk",
    question: "Hva var UK-karakterskandalen i 2020?",
    answer:
      "Under pandemien ble eksamen avlyst. Algoritmen satte karakterer basert delvis på skolens historikk → elever fra 'svake' skoler ble systematisk underkarakter, uavhengig av personlig prestasjon. Eksempel på aggregerings-bias: én modell anvendt på undergrupper med ulik underliggende distribusjon.",
  },
  {
    id: "c-dte2602p-gdpr-art22",
    category: "sikkerhet",
    topic: "AI-etikk",
    question: "GDPR Art. 22 — hva gir det?",
    answer:
      "Ved automatiserte beslutninger med betydelig påvirkning (lån, ansettelse, forsikring): rett til menneskelig vurdering + rett til forklaring. Driver behovet for tolkbare modeller eller XAI-verktøy (SHAP/LIME).",
  },
  {
    id: "c-dte2602p-gdpr-prinsipper",
    category: "sikkerhet",
    topic: "AI-etikk",
    question: "GDPR-prinsipper relevant for ML?",
    answer:
      "Dataminimering (argument for feature selection), formålsbegrensning (data samlet for X kan ikke uten videre brukes for Y), lagringsbegrensning (slett etter formål), rett til forklaring (Art. 22), og rett til å bli glemt (utfordring — 'machine unlearning' er aktivt forskningsfelt).",
  },
  {
    id: "c-dte2602p-xai-tolkbar",
    category: "begrep",
    topic: "AI-etikk",
    question: "Inherent tolkbar vs post-hoc forklart?",
    answer:
      "Inherent tolkbar (white-box): du leser modellen direkte — lineær/logistisk regresjon (vektene), decision trees (grener), regelsystemer. Post-hoc: black-box + verktøy som SHAP, LIME, feature_importance, partial dependence plots. Trade-off: tolkbarhet vs maksimal nøyaktighet.",
  },
  {
    id: "c-dte2602p-kinarom",
    category: "begrep",
    topic: "AI-etikk",
    question: "Searles Kinarom-argument — hva sier det?",
    answer:
      "En person i et rom uten kinesisk-kunnskap følger en oppslagstavle og svarer korrekt på kinesiske tegn. Utenfor virker det som forståelse, men personen 'forstår' ikke. Konklusjon (Searle): symbolmanipulering ≠ forståelse. Argument mot Sterk AI. Motsvar: 'systemet svar' — det er HELE systemet som forstår.",
  },
  {
    id: "c-dte2602p-svak-sterk-ai",
    category: "begrep",
    topic: "AI-etikk",
    question: "Svak AI vs Sterk AI?",
    answer:
      "Svak AI: modell som simulerer intelligens på begrenset domene (sjakk, oversettelse, bilde-klassifisering). Det vi har i dag. Sterk AI: hypotetisk modell som FAKTISK er bevisst og har generell forståelse. Eksisterer ikke. Kinarom-argumentet er rettet mot Sterk AI.",
  },
  {
    id: "c-dte2602p-eu-ai-act-pyramide",
    category: "sikkerhet",
    topic: "AI-etikk",
    question: "EU AI Act-pyramiden — fire risikonivå?",
    answer:
      "(1) Uakseptabel — FORBUDT (social scoring, sårbar manipulasjon). (2) Høy risiko — strenge krav (kritisk infra, helse, utdanning, jobb, justis). (3) Limited risk — merking (chatbots, deepfakes). (4) Minimal risk — ingen krav (spam-filter, anbefalingssystem).",
  },
  {
    id: "c-dte2602p-eu-7-prinsipper",
    category: "sikkerhet",
    topic: "AI-etikk",
    question: "EUs 7 etiske prinsipper for pålitelig AI?",
    answer:
      "Menneskelig tilsyn, teknisk robusthet + sikkerhet, personvern + datastyring, transparens, mangfold + ikke-diskriminering, samfunns- + miljønytte, og ansvarlighet. Ligger til grunn for EU AI Act og er et nyttig rammeverk for etisk drøfting i mappe-rapporten.",
  },
  {
    id: "c-dte2602p-fairness-metrikker",
    category: "begrep",
    topic: "AI-etikk",
    question: "Tre fairness-metrikker — og det matematiske dilemmaet",
    answer:
      "Demographic parity (lik prediksjons-rate per gruppe), equalized odds (lik TPR + FPR per gruppe), predictive parity (lik precision per gruppe). Et matematisk teorem (Chouldechova 2017) viser at de tre IKKE kan tilfredsstilles samtidig hvis baseline-ratene varierer per gruppe — du må velge.",
  },
  {
    id: "c-dte2602p-mappe-struktur",
    category: "praktisk",
    topic: "ML-prosjektflyt",
    question: "Standard kapittel-struktur i en ML-mappe-rapport?",
    answer:
      "1. Sammendrag, 2. Innledning (problemstilling + suksesskriterium), 3. Data (kilde + størrelse + begrensninger), 4. EDA (3-5 figurer + tolkning), 5. Metode (algoritmer + hyperparam-søk), 6. Resultater (metrikker + confusion matrix), 7. Diskusjon (begrensninger + etikk), 8. Konklusjon, 9. Referanser.",
  },
  {
    id: "c-dte2602p-mappe-kode-droftning",
    category: "praktisk",
    topic: "ML-prosjektflyt",
    question: "Hvor mye kode hører til i rapporten kontra notebook?",
    answer:
      "Rapport (10 sider): 1-2 sider kode-snippets som ILLUSTRERER poenger — ikke hele filer. Resten er tabeller, figurer, drøfting. Notebook: 500+ linjer hvis nødvendig — der bor den kjørbare koden.",
  },
  {
    id: "c-dte2602p-mappe-reproduserbarhet",
    category: "praktisk",
    topic: "ML-prosjektflyt",
    question: "Tre ting som gir reproducerbarhet i en mappe-oppgave?",
    answer:
      "(1) random_state satt OVERALT (train_test_split, modeller, cv-objekter). (2) requirements.txt med eksakte versjoner. (3) Relative stier (pathlib) — ikke /Users/ola/data/. Test på ren venv før innlevering!",
  },
  {
    id: "c-dte2602p-mappe-feller",
    category: "praktisk",
    topic: "ML-prosjektflyt",
    question: "Tre vanlige sensor-feller i en ML-mappe?",
    answer:
      "(1) «Funker på min maskin» — ingen requirements.txt, hardkodet sti. (2) Manglende random_state — sensor får andre tall. (3) Hyperparametere oppgis ikke — rapport sier 'tuned' men nevner ikke hvilke verdier som vant.",
  },
  {
    id: "c-dte2602p-llm-opphavsrett",
    category: "begrep",
    topic: "AI-etikk",
    question: "Hva er LLM-er + opphavsrett-debatten?",
    answer:
      "Store språkmodeller (GPT, Claude) trent på enorm web-tekst, ofte uten eksplisitt samtykke. NYT saksøker OpenAI (2023). Uavklart juss: er 'trening' fair use (transformative) eller ulovlig reproduksjon? Diskusjoner om kompensasjon og lisensiering pågår — viktig case for mappe-drøfting.",
  },

  // ============= TEK-1501: STATISTIKK =============
  // Deskriptiv statistikk
  {
    id: "c-tek1-mean",
    category: "statistikk",
    topic: "Deskriptiv statistikk",
    question: "Hva er gjennomsnitt (mean)?",
    answer:
      "Summen av alle verdier delt på antall. Formel: x̄ = (1/n) Σ xᵢ. Bruker all informasjon men er sårbar for outliers — én ekstremverdi kan flytte mean kraftig.",
  },
  {
    id: "c-tek1-median",
    category: "statistikk",
    topic: "Deskriptiv statistikk",
    question: "Hva er median, og når foretrekkes den fremfor mean?",
    answer:
      "Median er den midtre verdien i sortert datasett (eller snittet av de to midtre hvis n er partall). Foretrekkes ved skjeve fordelinger eller når det er outliers, fordi median er robust — den påvirkes ikke av ekstreme verdier.",
  },
  {
    id: "c-tek1-modus",
    category: "statistikk",
    topic: "Deskriptiv statistikk",
    question: "Hva er modus, og når brukes den?",
    answer:
      "Verdien som forekommer oftest i datasettet. Eneste sentralmål som funker for kategoriske data (farger, merker). Kan være ikke-unik eller ikke-eksisterende i kontinuerlige data.",
  },
  {
    id: "c-tek1-variance",
    category: "statistikk",
    topic: "Deskriptiv statistikk",
    question: "Formel for stikkprøve-varians s²?",
    answer:
      "s² = (1/(n−1)) · Σ (xᵢ − x̄)². Vi deler på n−1 (ikke n) — Bessel-korreksjonen — for å få en forventningsrett estimator for σ². I numpy: np.var(x, ddof=1).",
  },
  {
    id: "c-tek1-std",
    category: "statistikk",
    topic: "Deskriptiv statistikk",
    question: "Hva er standardavvik, og hvorfor brukes det?",
    answer:
      "s = √s² — kvadratroten av varians. Foretrekkes fremfor varians fordi det har samme enhet som dataene (m, sek, kr), så det er lettere å tolke direkte.",
  },
  {
    id: "c-tek1-iqr",
    category: "statistikk",
    topic: "Deskriptiv statistikk",
    question: "Hva er IQR, og hva forteller det?",
    answer:
      "IQR (Interquartile Range) = Q3 − Q1. Spredningen i de midtre 50 % av dataene. Robust mot outliers — i motsetning til standardavvik. Grunnlaget for boksplottets boks.",
  },
  {
    id: "c-tek1-quartiles",
    category: "statistikk",
    topic: "Deskriptiv statistikk",
    question: "Hva er kvartiler (Q1, Q2, Q3)?",
    answer:
      "Verdier som deler datasettet i fire like deler. Q1 = 25-persentilen (25 % av data er ≤ Q1). Q2 = median (50 %). Q3 = 75-persentilen. Sammen med min og max danner de 5-tallsoppsummeringen som boksplott bygges på.",
  },
  {
    id: "c-tek1-skewness",
    category: "statistikk",
    topic: "Deskriptiv statistikk",
    question: "Hva er en skjev (skewed) fordeling?",
    answer:
      "En fordeling som IKKE er symmetrisk. Høyrehale-skjev (positiv): lang hale mot høyre, mean > median (eks: inntekt). Venstrehale-skjev (negativ): lang hale mot venstre, mean < median (eks: eksamen-resultater for lett oppgave).",
  },
  {
    id: "c-tek1-outlier",
    category: "statistikk",
    topic: "Deskriptiv statistikk",
    question: "Hvordan defineres en outlier (1.5·IQR-regelen)?",
    answer:
      "En observasjon er outlier hvis den er under Q1 − 1.5·IQR eller over Q3 + 1.5·IQR. Tukey-regelen — også grensen for whiskers i boksplott. Verdier utenfor markeres som punkter.",
  },
  {
    id: "c-tek1-histogram-bins",
    category: "statistikk",
    topic: "Deskriptiv statistikk",
    question: "Hvor mange bins bør et histogram ha?",
    answer:
      "Tommelfingerregel: bins ≈ √n eller Sturges' formel ⌈log₂ n + 1⌉. For få bins skjuler struktur, for mange viser bare støy. Eksperimenter — målet er å se den underliggende formen.",
  },

  // Sannsynlighet
  {
    id: "c-tek1-axioms",
    category: "statistikk",
    topic: "Sannsynlighet",
    question: "Kolmogorovs tre sannsynlighets-aksiomer?",
    answer:
      "(1) 0 ≤ P(A) ≤ 1. (2) P(Ω) = 1. (3) P(A ∪ B) = P(A) + P(B) hvis A ∩ B = ∅. All sannsynlighetsteori bygger fra disse tre reglene.",
  },
  {
    id: "c-tek1-complement",
    category: "statistikk",
    topic: "Sannsynlighet",
    question: "Komplementregelen — formel og bruk?",
    answer:
      "P(Aᶜ) = 1 − P(A). Spesielt nyttig for 'minst én'-spørsmål: P(minst én feil i n forsøk) = 1 − P(ingen feil) = 1 − (1−p)ⁿ. Sparer kompliserte summer.",
  },
  {
    id: "c-tek1-inklusjon",
    category: "statistikk",
    topic: "Sannsynlighet",
    question: "Inklusjon-eksklusjon for P(A ∪ B)?",
    answer:
      "P(A ∪ B) = P(A) + P(B) − P(A ∩ B). Vi må trekke fra snittet, ellers dobbelt-teller vi overlappet. Hvis A og B er disjunkte er P(A ∩ B) = 0 og formelen forenkles.",
  },
  {
    id: "c-tek1-conditional",
    category: "statistikk",
    topic: "Sannsynlighet",
    question: "Definisjon av betinget sannsynlighet P(A | B)?",
    answer:
      "P(A | B) = P(A ∩ B) / P(B), forutsatt P(B) > 0. Tolkning: 'sannsynligheten for A, gitt at B har skjedd'. Snitt over evidence.",
  },
  {
    id: "c-tek1-independence",
    category: "statistikk",
    topic: "Sannsynlighet",
    question: "Når er A og B uavhengige?",
    answer:
      "Når P(A ∩ B) = P(A) · P(B). Ekvivalent: P(A | B) = P(A). NB: uavhengig er IKKE det samme som disjunkt — disjunkte hendelser med positiv sannsynlighet er nødvendigvis avhengige.",
  },
  {
    id: "c-tek1-bayes",
    category: "statistikk",
    topic: "Sannsynlighet",
    question: "Bayes' teorem?",
    answer:
      "P(A | B) = P(B | A) · P(A) / P(B). Snur betingingen: gitt P(B | A), kan vi finne P(A | B). Bruk for diagnostiske tester, kvalitetskontroll, oppdaterte tro etter observasjon.",
  },
  {
    id: "c-tek1-total-prob",
    category: "statistikk",
    topic: "Sannsynlighet",
    question: "Total sannsynlighet (med partisjon)?",
    answer:
      "Hvis B₁, ..., Bₙ er en partisjon av Ω: P(A) = Σᵢ P(A | Bᵢ) · P(Bᵢ). Brukes til å beregne P(B) i nevneren av Bayes-formelen — eks: P(test+) = P(test+|syk)·P(syk) + P(test+|frisk)·P(frisk).",
  },
  {
    id: "c-tek1-permutation",
    category: "statistikk",
    topic: "Kombinatorikk",
    question: "Permutasjon-formel P(n, k)?",
    answer:
      "P(n, k) = n! / (n−k)! — antall måter å velge k av n der REKKEFØLGEN teller. Eks: 8 løpere, antall ulike topp-3-rekkefølger = 8·7·6 = 336.",
  },
  {
    id: "c-tek1-combination",
    category: "statistikk",
    topic: "Kombinatorikk",
    question: "Kombinasjon-formel C(n, k) / 'n velg k'?",
    answer:
      "C(n, k) = n! / (k!(n−k)!) — antall måter å velge k av n der rekkefølgen IKKE teller. Eks: 8 personer, velg 3 til en gruppe = C(8,3) = 56.",
  },
  {
    id: "c-tek1-perm-vs-comb",
    category: "statistikk",
    topic: "Kombinatorikk",
    question: "Permutasjon eller kombinasjon — hvordan velge?",
    answer:
      "Spør: 'spiller rekkefølgen rolle?'. Hvis JA (pall, kode, rangering) → permutasjon P(n,k). Hvis NEI (komité, utvalg, lottokupong) → kombinasjon C(n,k).",
  },

  // Fordelinger
  {
    id: "c-tek1-rv",
    category: "statistikk",
    topic: "Fordelinger",
    question: "Hva er en stokastisk variabel?",
    answer:
      "En funksjon X: Ω → ℝ som tilordner et tall til hvert utfall. Diskret (tellbart antall verdier) eller kontinuerlig (intervall i ℝ). Beskrives av PMF (diskret) eller PDF (kontinuerlig).",
  },
  {
    id: "c-tek1-expected",
    category: "statistikk",
    topic: "Fordelinger",
    question: "Forventning E[X] — formel?",
    answer:
      "Diskret: E[X] = Σ x · p(x). Kontinuerlig: E[X] = ∫ x · f(x) dx. Lineær: E[aX + b] = aE[X] + b, E[X + Y] = E[X] + E[Y] (alltid).",
  },
  {
    id: "c-tek1-variance-rv",
    category: "statistikk",
    topic: "Fordelinger",
    question: "Var(X) — formel og praktisk versjon?",
    answer:
      "Var(X) = E[(X − μ)²] = E[X²] − (E[X])². Praktisk: Var(aX + b) = a²·Var(X). For uavhengige X og Y: Var(X + Y) = Var(X) + Var(Y).",
  },
  {
    id: "c-tek1-bernoulli",
    category: "statistikk",
    topic: "Fordelinger",
    question: "Bernoulli(p) — kjernefakta?",
    answer:
      "Ett forsøk, to utfall: suksess (p) eller fiasko (1−p). E[X] = p, Var(X) = p(1−p). Byggesteinen for binomisk fordeling.",
  },
  {
    id: "c-tek1-binomial",
    category: "statistikk",
    topic: "Fordelinger",
    question: "Binomisk B(n, p) — PMF, E, Var?",
    answer:
      "P(X = k) = C(n,k) · pᵏ · (1−p)ⁿ⁻ᵏ. E[X] = np, Var(X) = np(1−p). Brukes for antall suksesser i n uavhengige forsøk med samme p.",
  },
  {
    id: "c-tek1-hypergeom",
    category: "statistikk",
    topic: "Fordelinger",
    question: "Hypergeometrisk vs. binomisk?",
    answer:
      "Hypergeometrisk: trekninger UTEN tilbakelegging (P endres for hvert trekk). Binomisk: trekninger MED tilbakelegging eller fra stor populasjon (P konstant). For store N er hypergeometrisk ≈ binomisk.",
  },
  {
    id: "c-tek1-poisson",
    category: "statistikk",
    topic: "Fordelinger",
    question: "Poisson(λ) — PMF og kjernefakta?",
    answer:
      "P(X = k) = e^(−λ) · λᵏ / k!. E[X] = Var(X) = λ. Brukes for antall sjeldne hendelser i fast intervall (kundeankomster, defekter per areal).",
  },
  {
    id: "c-tek1-poi-approx-bin",
    category: "statistikk",
    topic: "Fordelinger",
    question: "Når kan Poisson tilnærme binomisk?",
    answer:
      "Når n er stor (≥ 30) og p er liten (≤ 0.1), slik at np ≤ 10. Da gjelder B(n, p) ≈ Poi(np). Tilnærmingen er kraftig fordi den krever bare ett parameter (λ) i stedet for to (n, p).",
  },
  {
    id: "c-tek1-uniform",
    category: "statistikk",
    topic: "Fordelinger",
    question: "Uniform U(a, b) — PDF, E, Var?",
    answer:
      "f(x) = 1/(b−a) for a ≤ x ≤ b. E[X] = (a+b)/2, Var(X) = (b−a)²/12. Konstant tetthet over intervallet.",
  },
  {
    id: "c-tek1-exp",
    category: "statistikk",
    topic: "Fordelinger",
    question: "Eksponential Exp(λ) — PDF, E, Var, memoryless?",
    answer:
      "f(x) = λ e^(−λx) for x ≥ 0. E[X] = 1/λ, Var(X) = 1/λ². Memoryless: P(X > s+t | X > s) = P(X > t). Brukes for tid mellom Poisson-hendelser, levetid uten aldring.",
  },
  {
    id: "c-tek1-normal",
    category: "statistikk",
    topic: "Fordelinger",
    question: "Normal N(μ, σ²) — egenskaper?",
    answer:
      "Klokkeformet, symmetrisk om μ. E[X] = μ, Var(X) = σ². 68/95/99.7-regel: 68 % innen ±1σ, 95 % innen ±2σ (egentlig ±1.96σ), 99.7 % innen ±3σ. Default-modell for målestøy.",
  },
  {
    id: "c-tek1-standardize",
    category: "statistikk",
    topic: "Fordelinger",
    question: "Standardisering — hvordan og hvorfor?",
    answer:
      "Z = (X − μ)/σ ~ N(0,1) når X ~ N(μ, σ²). Hvorfor: med Z kan vi slå opp i én tabell (standardnormaltabellen) uavhengig av μ og σ. P(X ≤ x) = Φ((x−μ)/σ).",
  },
  {
    id: "c-tek1-clt",
    category: "statistikk",
    topic: "Fordelinger",
    question: "Sentralgrenseteoremet (CLT) — hva sier det?",
    answer:
      "For i.i.d. variabler med E = μ og Var = σ²: X̄ = (1/n) Σ Xᵢ ~ N(μ, σ²/n) tilnærmet for stort n (typisk n ≥ 30). Uavhengig av den underliggende fordelingens form. Grunnlaget for inferens.",
  },
  {
    id: "c-tek1-chi2",
    category: "statistikk",
    topic: "Fordelinger",
    question: "Kji-kvadrat χ²(k) — hva er det?",
    answer:
      "Sum av k uavhengige standardnormaler kvadrert: X = Z₁² + ... + Zₖ². E = k, Var = 2k. Brukes til varians-tester og kji-kvadrat-test for uavhengighet/tilpasning.",
  },
  {
    id: "c-tek1-t-dist",
    category: "statistikk",
    topic: "Fordelinger",
    question: "Student-t — hvorfor og når?",
    answer:
      "T = (X̄ − μ) / (s/√n) ~ tₙ₋₁. Brukes når σ er ukjent og må estimeres med s. Likner normalfordelingen men har tyngre haler. For n > 30 er tₙ₋₁ ≈ N(0,1).",
  },

  // Inferens
  {
    id: "c-tek1-estimator",
    category: "statistikk",
    topic: "Inferens",
    question: "Forventningsrett (unbiased) estimator?",
    answer:
      "E[θ̂] = θ — estimatoren treffer parameteren I SNITT (ikke nødvendigvis i hver enkelt prøve). x̄ er unbiased for μ. s² (med n−1 i nevner) er unbiased for σ².",
  },
  {
    id: "c-tek1-ci-mu-known",
    category: "statistikk",
    topic: "Inferens",
    question: "95 % CI for μ når σ er kjent — formel?",
    answer:
      "x̄ ± 1.96 · σ/√n. Bruk z-kritisk (1.96 for 95 %). For 90 %: z = 1.645. For 99 %: z = 2.576.",
  },
  {
    id: "c-tek1-ci-mu-unknown",
    category: "statistikk",
    topic: "Inferens",
    question: "95 % CI for μ når σ er ukjent — formel?",
    answer:
      "x̄ ± t_(α/2, n−1) · s/√n. Bruk t-kritisk med n−1 frihetsgrader. For n = 12: t_0.025, 11 = 2.201.",
  },
  {
    id: "c-tek1-ci-interp",
    category: "statistikk",
    topic: "Inferens",
    question: "Korrekt tolkning av 95 % CI?",
    answer:
      "Hvis vi gjentok eksperimentet mange ganger og konstruerte CI hver gang, ville 95 % av disse intervallene inneholde det sanne μ. IKKE: 'det er 95 % sannsynlig at μ er i [a, b]' (μ er fast, ikke tilfeldig).",
  },
  {
    id: "c-tek1-hypothesis",
    category: "statistikk",
    topic: "Inferens",
    question: "Strukturen i en hypotesetest?",
    answer:
      "1) Formuler H₀ og H₁. 2) Velg α. 3) Velg teststatistikk med kjent fordeling under H₀. 4) Beregn observert verdi. 5) Sammenlign med kritisk verdi eller p-verdi. 6) Konkluder: p < α → forkast H₀.",
  },
  {
    id: "c-tek1-type-i-ii",
    category: "statistikk",
    topic: "Inferens",
    question: "Type I- vs. Type II-feil?",
    answer:
      "Type I (α): forkaste H₀ når den er sann (falsk alarm). Type II (β): beholde H₀ når den er usann (vi misser virkelig effekt). 1 − β = styrke. Trade-off: lavere α → høyere β, mer data reduserer begge.",
  },
  {
    id: "c-tek1-p-value",
    category: "statistikk",
    topic: "Inferens",
    question: "Hva er en p-verdi?",
    answer:
      "Sannsynligheten for å observere en teststatistikk minst så ekstrem som det observerte, GITT at H₀ er sann. Liten p = uvanlig under H₀ = bevis mot H₀. p < α → forkast H₀.",
  },
  {
    id: "c-tek1-t-test",
    category: "statistikk",
    topic: "Inferens",
    question: "One-sample t-test — teststatistikk?",
    answer:
      "t = (x̄ − μ₀) / (s/√n), med n−1 frihetsgrader. H₀: μ = μ₀. Tosidig: forkast hvis |t| > t_(α/2, n−1). Python: scipy.stats.ttest_1samp(data, μ₀).",
  },
  {
    id: "c-tek1-two-sample",
    category: "statistikk",
    topic: "Inferens",
    question: "Two-sample t-test for to grupper?",
    answer:
      "t = (x̄₁ − x̄₂) / √(sₚ²·(1/n₁ + 1/n₂)) med n₁+n₂−2 frihetsgrader, der sₚ² er pooled varians. Welch's t-test (ulike varianser): annen df-formel. Python: stats.ttest_ind(a, b, equal_var=False).",
  },
  {
    id: "c-tek1-chi2-test",
    category: "statistikk",
    topic: "Inferens",
    question: "Kji-kvadrat-test for uavhengighet?",
    answer:
      "χ² = Σ (O_ij − E_ij)² / E_ij, der E_ij = (rad_total · kol_total) / total. Frihetsgrader = (r−1)(c−1). Forkast H₀ hvis χ² > χ²_(α, df). Forutsetter alle E_ij ≥ 5.",
  },

  // Regresjon
  {
    id: "c-tek1-pearson-r",
    category: "statistikk",
    topic: "Regresjon",
    question: "Pearson-korrelasjon r — formel og verdier?",
    answer:
      "r = Σ(xᵢ−x̄)(yᵢ−ȳ) / √(Σ(xᵢ−x̄)²·Σ(yᵢ−ȳ)²). r ∈ [−1, +1]. r = 0 → ingen LINEÆR sammenheng (men kan ha ikke-lineær). Husk: korrelasjon ≠ kausalitet.",
  },
  {
    id: "c-tek1-regression-line",
    category: "statistikk",
    topic: "Regresjon",
    question: "Minste kvadraters metode — koeffisienter?",
    answer:
      "β̂₁ = Σ(xᵢ−x̄)(yᵢ−ȳ) / Σ(xᵢ−x̄)² = r·(s_y/s_x). β̂₀ = ȳ − β̂₁·x̄. Linjen går alltid gjennom (x̄, ȳ). Minimerer Σ(yᵢ − ŷᵢ)².",
  },
  {
    id: "c-tek1-r-squared",
    category: "statistikk",
    topic: "Regresjon",
    question: "Hva er R², og hvordan tolkes det?",
    answer:
      "R² = 1 − SS_res/SS_tot ∈ [0, 1]. Andel av variasjonen i Y som forklares av modellen. I enkel lineær regresjon: R² = r². R² = 0.72 → 72 % av Y's varians forklares av X.",
  },
  {
    id: "c-tek1-residual",
    category: "statistikk",
    topic: "Regresjon",
    question: "Hva er residualer, og hva skal du sjekke i residual-plot?",
    answer:
      "Residual eᵢ = yᵢ − ŷᵢ. Plot residualer mot x: tilfeldighet = modell passer. Trakt = heteroskedastisitet (ulik varians). Krumning = ikke-lineær sammenheng — prøv polynomisk eller log-transform.",
  },
  {
    id: "c-tek1-corr-causation",
    category: "statistikk",
    topic: "Regresjon",
    question: "Korrelasjon vs. kausalitet?",
    answer:
      "Sterk korrelasjon betyr ikke at den ene forårsaker den andre. Eks: Iskremsalg og drukninger korrelerer (begge øker om sommeren), men iskrem forårsaker ikke drukning. Kausalitet krever eksperiment eller streng kausal modell.",
  },

  // ============= DTE-2505: LINUX-GRUNNLAG =============
  {
    id: "c2505-fhs",
    category: "praktisk",
    topic: "Linux",
    question: "Hva er FHS — Filesystem Hierarchy Standard?",
    answer:
      "Konvensjonen for hvor ting ligger på Linux. /etc = config, /var = variable data (logger, mail-køer), /usr = programmer og bibliotek, /home = brukere, /tmp = midlertidig, /opt = tredje-parts programvare. Standarden gjør at du finner samme filer på samme sti på tvers av distroer.",
  },
  {
    id: "c2505-etc-passwd-felter",
    category: "praktisk",
    topic: "Linux",
    question: "Hva er feltene i /etc/passwd?",
    answer:
      "Sju kolon-separerte felter: brukernavn:passord-flag:UID:GID:GECOS:hjemmekatalog:login-shell. `x` i passord-feltet betyr at hashen ligger i /etc/shadow. GECOS er fullnavn/kontaktinfo (historisk).",
    code: "isak:x:1000:1000:Isak Olsen,,,:/home/isak:/bin/bash",
  },
  {
    id: "c2505-etc-shadow",
    category: "sikkerhet",
    topic: "Linux",
    question: "Hvorfor ligger passordet i /etc/shadow og ikke /etc/passwd?",
    answer:
      "/etc/passwd må være lesbar for alle (programmer bruker den til å mappe UID til navn). Da kan passord-hashen ikke ligge der — hvem som helst kunne kjørt offline brute-force. /etc/shadow er kun lesbar av root (rettigheter 640 root:shadow). Sjekken skjer via SUID-program `passwd` / `su`.",
  },
  {
    id: "c2505-uid-gid",
    category: "praktisk",
    topic: "Linux",
    question: "Hva er UID og GID?",
    answer:
      "Hver bruker har et heltall-UID (User ID) og hver gruppe et GID (Group ID). UID 0 = root. UID 1-999 = system-brukere (services). UID 1000+ = vanlige brukere. Kernelen jobber bare med tall — navn er bare en presentasjon (oppslag via /etc/passwd og /etc/group).",
  },
  {
    id: "c2505-find-vs-locate",
    category: "praktisk",
    topic: "Linux",
    question: "Forskjell på find og locate?",
    answer:
      "find traverserer filsystemet i sanntid — tregt for store trær, men alltid riktig. locate slår opp i en indeks (vanligvis bygget av updatedb daglig) — superraskt, men kan være utdatert. Bruk locate for «finnes det noe slikt?» og find for «alle filer som matcher disse kriteriene akkurat nå».",
  },
  {
    id: "c2505-man-seksjoner",
    category: "praktisk",
    topic: "Linux",
    question: "Hva betyr man-side-seksjoner som `man 5 passwd`?",
    answer:
      "1 = bruker-kommandoer, 2 = syscalls, 3 = bibliotek-funksjoner, 5 = filformater, 7 = misc/konvensjoner, 8 = system-admin-kommandoer. `man passwd` viser kommando-versjonen (seksjon 1). `man 5 passwd` viser filformatet for /etc/passwd.",
  },

  // ============= DTE-2505: PROSESSER =============
  {
    id: "c2505-prosess-vs-trad",
    category: "praktisk",
    topic: "Prosesser",
    question: "Forskjell på prosess og tråd?",
    answer:
      "Prosess = eget adresserom, egne file descriptors, egen PID. Trådene innenfor en prosess deler adresserom og filer, men har egne stacker. Lett-vekt parallelisme = tråder. Isolasjon = prosesser. På Linux er begge representert som task_struct i kernelen, og threads har egne TIDs (lik PID for hovedtråden).",
  },
  {
    id: "c2505-pid-1",
    category: "praktisk",
    topic: "Prosesser",
    question: "Hvilken prosess har PID 1?",
    answer:
      "Init-prosessen — på moderne Linux er det systemd. Den startes av kernelen og er forelder til alle andre prosesser direkte eller indirekte. Hvis init dør, panikker kernelen. systemd håndterer også reaping av orphans.",
  },
  {
    id: "c2505-fork-exec",
    category: "praktisk",
    topic: "Prosesser",
    question: "Hva er fork+exec-mønsteret?",
    answer:
      "Slik starter Linux nye programmer. fork() lager en barn-prosess som er en kopi av forelder. Barnet kaller deretter exec() som BYTTER UT programkoden med en ny binær. Mellom fork og exec kan barnet f.eks. lukke file descriptors, sette nye rettigheter eller redirige stdin/stdout.",
  },
  {
    id: "c2505-orphan-vs-zombie",
    category: "praktisk",
    topic: "Prosesser",
    question: "Orphan vs zombie?",
    answer:
      "Orphan = barn hvis forelder har dødd. Den blir adoptert av init (systemd) og fortsetter normalt. Zombie = barn som har dødd og venter på at forelderen kaller wait() for å hente exit-koden. Zombie bruker bare en plass i prosess-tabellen — ikke RAM eller CPU. Mange zombies = forelder har bug.",
  },
  {
    id: "c2505-signaler-sigterm-sigkill",
    category: "praktisk",
    topic: "Prosesser",
    question: "Hvorfor SIGTERM før SIGKILL?",
    answer:
      "SIGTERM (15) kan fanges. Programmet får mulighet til å rydde opp: lukke åpne filer, flushe bufrede skrivinger, lagre state, slippe locker. SIGKILL (9) kan IKKE fanges — programmet dør på flekken og kan etterlate halv-skrevne filer eller stale lock-filer. Bruk SIGKILL bare når SIGTERM ikke virker etter noen sekunder.",
  },
  {
    id: "c2505-ps-aux",
    category: "praktisk",
    topic: "Prosesser",
    question: "Hva betyr STAT-kolonnen i `ps aux`?",
    answer:
      "R = running, S = sleeping (interruptible), D = uninterruptible sleep (typisk venter på disk-IO), Z = zombie, T = stopped (av SIGSTOP eller debugger). Tilleggsbokstaver: `s` = session leader, `+` = foreground, `<` = høy prioritet, `N` = lav prioritet.",
  },
  {
    id: "c2505-systemd-unit",
    category: "praktisk",
    topic: "Prosesser",
    question: "Hva er en systemd-unit?",
    answer:
      "En unit er en konfig-fil som beskriver noe systemd kan håndtere. Vanligste typer: .service (en demon), .timer (en cron-erstatning), .mount (auto-mounting), .target (en samling andre units, som multi-user.target ≈ runlevel 3). Units ligger i /etc/systemd/system/ (egne) og /lib/systemd/system/ (pakker).",
  },

  // ============= DTE-2505: RETTIGHETER =============
  {
    id: "c2505-rwx-octal",
    category: "praktisk",
    topic: "Rettigheter",
    question: "Hvordan oversetter du rwx til oktalt?",
    answer:
      "r = 4, w = 2, x = 1. Sum per gruppe: rwx = 7, rw- = 6, r-x = 5, r-- = 4, --- = 0. 755 betyr 7 (rwx) for eier, 5 (r-x) for gruppe, 5 (r-x) for andre. Mental sjekk: hvert siffer er et 3-bit-tall, og 3 sifre = owner/group/other.",
  },
  {
    id: "c2505-suid",
    category: "sikkerhet",
    topic: "Rettigheter",
    question: "Hva er SUID og når brukes det?",
    answer:
      "SUID-bit (4xxx) gjør at programmet kjører som filens EIER, ikke som brukeren som starter den. Klassikeren er /usr/bin/passwd: vanlig bruker kjører den, men den må skrive til /etc/shadow som krever root. SUID på root-eide binærer er den vanligste angreps-overflaten — minimér antallet.",
  },
  {
    id: "c2505-sgid-kat",
    category: "praktisk",
    topic: "Rettigheter",
    question: "Hva gjør SGID på en katalog?",
    answer:
      "Nye filer som lages inni katalogen får KATALOGENS gruppe (ikke brukerens primær-gruppe). Mest brukt på delte arbeids-kataloger der teamet vil at alle filer skal være `developers`-gruppe uansett hvem som la dem til. Sett med `chmod 2755 katalog` eller `chmod g+s katalog`.",
  },
  {
    id: "c2505-sticky",
    category: "praktisk",
    topic: "Rettigheter",
    question: "Hva er sticky bit?",
    answer:
      "På katalog (1xxx) hindrer det at brukere sletter HVERANDRES filer, selv om katalogen er skrivbar for alle. Klassikeren er /tmp — alle kan lage filer, men ingen kan slette dine. På fil gjør sticky bit ingenting på moderne Linux.",
  },
  {
    id: "c2505-umask",
    category: "praktisk",
    topic: "Rettigheter",
    question: "Hva er umask og hvordan virker den?",
    answer:
      "umask trekkes fra DEFAULT-rettighetene når du lager nye filer/kataloger. Default for fil er 666, for katalog 777. umask 022 → ny fil 644, ny katalog 755 (vanlig). umask 077 → ny fil 600, ny katalog 700 (paranoid). Sett i ~/.bashrc eller /etc/profile.",
  },
  {
    id: "c2505-acl-vs-rwx",
    category: "sikkerhet",
    topic: "Rettigheter",
    question: "Når trenger du ACL i stedet for vanlig rwx?",
    answer:
      "Når flere brukere eller grupper trenger ULIKE rettigheter på samme fil. rwx har bare tre 'slots' (owner, group, other). ACL lar deg si 'bob: rw, alice: r, devs: rwx' uten å lage nye grupper for hver kombinasjon. Bruk `setfacl -m` og `getfacl` for å sjekke.",
    code: "setfacl -m u:bob:rw fil\ngetfacl fil",
  },
  {
    id: "c2505-ssh-key-perms",
    category: "sikkerhet",
    topic: "Rettigheter",
    question: "Hvorfor må ~/.ssh/id_rsa være 600?",
    answer:
      "ssh nekter å bruke en privat nøkkel som er lesbar for andre. Filen må være 600 (rw-------) og katalogen ~/.ssh må være 700 (rwx------). Vanlig feil: kopiert nøklene over fra en annen maskin med scp som ga 644.",
  },

  // ============= DTE-2505: SHELL & SCRIPTING =============
  {
    id: "c2505-shebang",
    category: "praktisk",
    topic: "Shell",
    question: "Hva er shebang og hva skal stå der?",
    answer:
      "Shebang er første linje i et skript: `#!` fulgt av interpreter-stien. Kernelen leser dette når den exec-er fila. `#!/bin/bash` er vanlig. `#!/usr/bin/env bash` er mer portabelt fordi env finner bash i $PATH selv om den ligger annet sted.",
  },
  {
    id: "c2505-bash-strict-mode",
    category: "praktisk",
    topic: "Shell",
    question: "Hva gjør `set -euo pipefail`?",
    answer:
      "Bash strict mode. -e = avslutt ved første feilende kommando. -u = error når en udefinert variabel brukes (fanger typos). -o pipefail = feil i en pipe propagerer (ellers er pipens exit-kode bare den siste kommandoen). Anbefales i alle robuste skript.",
  },
  {
    id: "c2505-special-vars",
    category: "praktisk",
    topic: "Shell",
    question: "Hva betyr $0, $1, $#, $@, $? og $$ i bash?",
    answer:
      "$0 = skriptets navn. $1, $2, ... = argumenter. $# = antall argumenter. $@ = alle argumenter som separate ord (quote med \"$@\"). $* = alle som én streng. $? = exit-kode fra forrige kommando. $$ = PID til selve skriptet. $! = PID til siste bakgrunns-jobb.",
  },
  {
    id: "c2505-command-substitution",
    category: "praktisk",
    topic: "Shell",
    question: "Hvordan fanger du output fra en kommando i en variabel?",
    answer:
      "Bruk $(KOMMANDO). Eksempel: `antall=$(ls -1 | wc -l)`. Den eldre syntaksen med backticks (`...`) virker også men er vanskeligere å nøste — bruk $(...) som default.",
  },
  {
    id: "c2505-exit-koder",
    category: "praktisk",
    topic: "Shell",
    question: "Hva betyr ulike exit-koder?",
    answer:
      "0 = suksess. 1 = generell feil. 2 = feil bruk (manglende argumenter). 126 = kunne ikke kjøre (permission denied). 127 = kommando ikke funnet. 128+N = drept av signal N. Eksempel: 130 = avbrutt av Ctrl+C (128+SIGINT 2). 137 = drept av SIGKILL (128+9). Du leser exit-kode med $?.",
  },
  {
    id: "c2505-quoting",
    category: "praktisk",
    topic: "Shell",
    question: "Når skal du bruke double quotes vs single quotes?",
    answer:
      "Double quotes (\"$var\") ekspanderer $variabler og $(kommandoer) — bruk når du trenger verdier. Single quotes ('$var') er bokstavelige — bruk for regex og når du vil at $ skal bety dollar-tegn. Som regel: quote variabler ALLTID i if-tester og rm-kommandoer — beskytter mot mellomrom i filnavn.",
  },
  {
    id: "c2505-pipe-vs-redirect",
    category: "praktisk",
    topic: "Shell",
    question: "Forskjell på pipe (|) og redirect (>)?",
    answer:
      "Pipe sender stdout fra én kommando som stdin til neste — KOMMANDO til KOMMANDO. Redirect sender stdout til en FIL. `ls > fil.txt` skriver til fil. `ls | grep foo` sender output videre. Du kan kombinere: `ls | grep foo > funnet.txt`.",
  },
  {
    id: "c2505-heredoc",
    category: "praktisk",
    topic: "Shell",
    question: "Hva er en heredoc?",
    answer:
      "En måte å sende fler-linje stdin inline. `cat <<EOF` leser inntil linjen 'EOF' som stdin. Brukes ofte til å lage config-filer i skript: `sudo tee /etc/foo.conf <<EOF`. Bruk `<<'EOF'` (med quotes) for å SLÅ AV variabel-ekspansjon i bodyen.",
    code: "cat <<EOF > /etc/min-app.conf\nport=8080\nuser=$USER\nEOF",
  },

  // ============= DTE-2505: SYSTEMD =============
  {
    id: "c2505-systemd-vs-init",
    category: "praktisk",
    topic: "Systemd",
    question: "Hva er forskjellen på systemd og SysV init?",
    answer:
      "SysV init brukte shell-skript i /etc/init.d/ og kjørte dem sekvensielt. Tregt. systemd håndterer tjenester som unit-filer (deklarativ syntaks), kan starte ting parallelt basert på avhengighetsgraf, har innebygget logging (journald), socket-aktivering, cgroups for ressurs-kontroll og timers (cron-erstatning).",
  },
  {
    id: "c2505-systemctl-enable-vs-start",
    category: "praktisk",
    topic: "Systemd",
    question: "Forskjell på `systemctl start` og `systemctl enable`?",
    answer:
      "start = start tjenesten NÅ, men ikke gjør noe permanent. enable = lag symlink slik at tjenesten starter ved hver boot, men ikke start den nå. `enable --now` gjør begge i ett. Vanlig fallgruve: enable uten --now, så fungerer alt fint til neste reboot — så starter den ikke.",
  },
  {
    id: "c2505-journalctl-grunnlag",
    category: "praktisk",
    topic: "Systemd",
    question: "Hvorfor journalctl i stedet for /var/log/-filer?",
    answer:
      "journald lagrer logger som strukturerte records, ikke ren tekst. Du kan filtrere på unit (-u nginx), priority (-p err), tid (--since '1 hour ago'), boot (-b) og felt (_PID=, _UID=). Vanlig tekstlogg i /var/log/ skrives fortsatt av rsyslog parallelt på de fleste systemer.",
  },
  {
    id: "c2505-cron-vs-systemd-timer",
    category: "praktisk",
    topic: "Systemd",
    question: "cron vs systemd-timer?",
    answer:
      "cron er den klassiske periodiske job-scheduler — enkel, men kjører ikke jobben hvis maskinen var av på det tidspunktet. systemd-timer kan ta igjen tapte kjøringer (Persistent=true), logger via journald, og kan trigge på andre events (boot, network). På servere kan cron være OK. På laptoper er timer bedre.",
  },
  {
    id: "c2505-logrotate",
    category: "praktisk",
    topic: "Systemd",
    question: "Hva gjør logrotate?",
    answer:
      "Forhindrer at loggfiler vokser i det uendelige. Konfig i /etc/logrotate.d/. Standard: roter daglig eller når fila når en størrelse, komprimer gamle versjoner (.gz), behold N kopier, slett resten. Kjøres via cron.daily eller systemd-timer. Test config med `logrotate -d` (dry-run).",
  },

  // ============= DTE-2505 deep-dive: 25 nye =============
  {
    id: "c2505d-chmod-755",
    category: "praktisk",
    topic: "DTE-2505",
    question: "Hva er chmod 755 i symbolsk form?",
    answer: "rwxr-xr-x. Eier har alle tre (rwx = 4+2+1 = 7). Gruppe og andre har read+execute (4+1 = 5). Standard for skript og kjørbare binærer.",
  },
  {
    id: "c2505d-chmod-644",
    category: "praktisk",
    topic: "DTE-2505",
    question: "Hva er chmod 644 i symbolsk form?",
    answer: "rw-r--r--. Eier kan lese og skrive (6 = 4+2). Gruppe og andre kan bare lese (4). Standard for vanlige tekstfiler.",
  },
  {
    id: "c2505d-chmod-600",
    category: "sikkerhet",
    topic: "DTE-2505",
    question: "Hva er chmod 600 i symbolsk form, og når brukes det?",
    answer: "rw-------. Bare eier kan lese og skrive. Standard for private nøkler (~/.ssh/id_rsa), tokens, secrets. ssh nekter å bruke en privatnøkkel som er videre enn 600.",
  },
  {
    id: "c2505d-rwx-mappe",
    category: "praktisk",
    topic: "DTE-2505",
    question: "Hva betyr x-biten på en KATALOG?",
    answer: "Lov til å traversere — gå inn i, eller bruke katalogen som del av en sti. UTEN x kan du ikke gjøre `cd` eller lese filer inne i den, selv om r er satt. r uten x lar deg `ls` katalogen, men ikke åpne filene.",
  },
  {
    id: "c2505d-signal-1-2-9-15",
    category: "praktisk",
    topic: "DTE-2505",
    question: "Hva er signal-numrene 1, 2, 9 og 15?",
    answer: "1 = SIGHUP (terminal lukket / reload). 2 = SIGINT (Ctrl+C). 9 = SIGKILL (kan IKKE fanges). 15 = SIGTERM (standard «vær så snill å slutte»).",
  },
  {
    id: "c2505d-sighup-bruk",
    category: "praktisk",
    topic: "DTE-2505",
    question: "Hvorfor sender man SIGHUP til daemoner som nginx?",
    answer: "Konvensjon: SIGHUP betyr «re-les config-filen din uten å restarte». nginx, sshd, apache lytter på SIGHUP og laster ny config inn i minne uten å miste tilkoblinger. Brukes ofte etter at config er endret med ansible/cron.",
  },
  {
    id: "c2505d-ps-stat-d",
    category: "praktisk",
    topic: "DTE-2505",
    question: "Hva betyr STAT-flagg «D» og hvorfor er det viktig?",
    answer: "Uninterruptible sleep — prosessen venter på maskinvare (typisk disk-IO). Kan IKKE drepes selv med SIGKILL. Hvis du ser mange D-prosesser: disken er overbelastet eller har feil.",
  },
  {
    id: "c2505d-nice-range",
    category: "praktisk",
    topic: "DTE-2505",
    question: "Hva er rekkevidden for nice-verdier, og hvem kan minske den?",
    answer: "Niceness går fra −20 (høyest prioritet) til +19 (lavest). Vanlige brukere kan bare øke niceness — gjøre prosessen mer ettergivende. Bare root kan gi negativ niceness.",
  },
  {
    id: "c2505d-jobs-ctrlz",
    category: "praktisk",
    topic: "DTE-2505",
    question: "Hva gjør Ctrl+Z i terminalen?",
    answer: "Sender SIGTSTP (20) til foreground-prosessen. Den pauses (STAT går til T) og du får prompten tilbake. Bruk `fg` for å hente den tilbake, `bg` for å la den fortsette i bakgrunnen.",
  },
  {
    id: "c2505d-disown-nohup",
    category: "praktisk",
    topic: "DTE-2505",
    question: "Forskjell på disown og nohup?",
    answer: "Begge gjør at prosessen overlever logout. nohup brukes ved START: `nohup ./tj.sh &` — fortsetter selv om terminalen lukkes. disown brukes ETTER at jobben er startet: `./tj.sh &` så `disown %1` — løser jobben fra shell-tabellen.",
  },
  {
    id: "c2505d-shebang-env",
    category: "praktisk",
    topic: "DTE-2505",
    question: "Hvorfor `#!/usr/bin/env python3` i stedet for `#!/usr/bin/python3`?",
    answer: "env søker etter python3 i $PATH. Mer portabelt — fungerer både på systemer der python3 ligger i /usr/bin og i /usr/local/bin (Homebrew, virtualenv, etc.). Hard-kodet path bryter når Python ligger annet sted.",
  },
  {
    id: "c2505d-bash-test-vs-bracket",
    category: "praktisk",
    topic: "DTE-2505",
    question: "Forskjell på `[ ... ]` og `[[ ... ]]` i bash?",
    answer: "[ ] er POSIX-test — en separat kommando, krever quoting av variabler, ingen regex. [[ ]] er bash-built-in: ord-deling og glob skjer ikke, støtter =~ for regex og &&/|| inni. Bruk [[ ]] i bash-skript; [ ] for kompatibilitet med sh/dash.",
  },
  {
    id: "c2505d-bash-arithmetic",
    category: "praktisk",
    topic: "DTE-2505",
    question: "Hvordan gjør du aritmetikk i bash?",
    answer: "$((uttrykk)) — for eksempel $((5 + 3)) eller $((i + 1)). Eller `let i=i+1`. Eller `((i++))` (bash-builtin). bash regner BARE med heltall — for desimaler trenger du bc eller awk.",
  },
  {
    id: "c2505d-read-input",
    category: "praktisk",
    topic: "DTE-2505",
    question: "Hvordan leser du brukerinput i bash?",
    answer: "`read -p \"Navn: \" navn` viser prompt og lagrer i $navn. `read -s passord` skjuler input. `read -t 5 svar` har 5 sekunders timeout. `read -r linje < fil` (-r = bevar backslashes) i en while-løkke leser fil-linjer.",
  },
  {
    id: "c2505d-test-file-flags",
    category: "praktisk",
    topic: "DTE-2505",
    question: "Hva tester -f, -d, -e, -r, -w, -x i bash?",
    answer: "-f = vanlig fil, -d = katalog, -e = finnes (av en eller annen type), -r = lesbar, -w = skrivbar, -x = kjørbar. Eks: `if [ -f /etc/passwd ]`. Tester rettigheter ut fra BRUKERENS perspektiv — påvirket av effektiv UID.",
  },
  {
    id: "c2505d-fd-redirect",
    category: "praktisk",
    topic: "DTE-2505",
    question: "Hva betyr `2>&1`?",
    answer: "«Send fd 2 (stderr) til samme sted som fd 1 (stdout) går nå». Eks: `cmd > log 2>&1` → både stdout og stderr til log. Rekkefølgen betyr noe — `cmd 2>&1 > log` virker IKKE som forventet (2 går til terminalen, så går 1 til log).",
  },
  {
    id: "c2505d-systemctl-status",
    category: "praktisk",
    topic: "DTE-2505",
    question: "Hva viser `systemctl status nginx`?",
    answer: "Om tjenesten kjører (active/inactive/failed), PID, hvor lenge den har kjørt, hvilken unit-fil den kom fra, og siste linjer fra loggen. Standard verktøy for å feilsøke en daemon.",
  },
  {
    id: "c2505d-journalctl-unit",
    category: "praktisk",
    topic: "DTE-2505",
    question: "Hvordan ser du loggen for kun én systemd-tjeneste?",
    answer: "`journalctl -u nginx` viser bare nginx-logger. `-f` for follow (live), `--since '10 min ago'` for tidsfilter, `-p err` for bare error-nivå, `-b` for siste boot.",
  },
  {
    id: "c2505d-apt-update-vs-upgrade",
    category: "praktisk",
    topic: "DTE-2505",
    question: "Forskjell på `apt update` og `apt upgrade`?",
    answer: "update = hent nyeste pakkeliste fra repoene (oppdaterer INDEKSEN). upgrade = installer nyere versjoner av allerede installerte pakker. Du kjører alltid update FØR upgrade.",
  },
  {
    id: "c2505d-dpkg-vs-apt",
    category: "praktisk",
    topic: "DTE-2505",
    question: "Forskjell på dpkg og apt?",
    answer: "dpkg er lav-nivå pakkebehandler — installerer/fjerner én .deb-fil, vet ikke om avhengigheter. apt er høy-nivå wrapper rundt dpkg som løser avhengigheter, henter fra repoer og er den vanlige bruker-fasaden.",
  },
  {
    id: "c2505d-dpkg-listfiles",
    category: "praktisk",
    topic: "DTE-2505",
    question: "Hvilken kommando viser alle filer en pakke installerer?",
    answer: "`dpkg -L pakkenavn`. Eks: `dpkg -L nginx`. Motsatt vei: `dpkg -S /path/to/fil` viser HVILKEN pakke som eier den fila.",
  },
  {
    id: "c2505d-ln-soft-hard",
    category: "praktisk",
    topic: "DTE-2505",
    question: "Forskjell på hard link og symbolic link?",
    answer: "Hard link (`ln`) lager et nytt navn for samme inode — fjerner du originalen, lever lenken (begge peker til samme data). Symlink (`ln -s`) er en TEKST-peker til en sti — hvis originalen slettes, blir lenken brutt. Hard links kan ikke krysse filsystemer eller peke på kataloger.",
  },
  {
    id: "c2505d-which-vs-whereis",
    category: "praktisk",
    topic: "DTE-2505",
    question: "Forskjell på which, whereis og type?",
    answer: "which = vis stien til en binær i $PATH. whereis = vis binær + man-side + kildekode. type = bash-builtin som forteller om kommandoen er alias, builtin, function eller ekstern (anbefales: avslører aliaser).",
  },
  {
    id: "c2505d-environment-variabler",
    category: "praktisk",
    topic: "DTE-2505",
    question: "Hva er forskjellen på lokal variabel og environment-variabel i bash?",
    answer: "`navn=Per` er bare lokal — barn-prosesser ser den ikke. `export navn=Per` putter den i environment slik at barn (sub-shells, programmer du starter) arver den. Sjekk eksisterende environment med `env` eller `printenv`.",
  },
  {
    id: "c2505d-bash-funksjon-return",
    category: "praktisk",
    topic: "DTE-2505",
    question: "Hva returnerer en bash-funksjon med `return 0`?",
    answer: "Bare en exit-kode (0-255), ikke en verdi. For å «returnere» data: skriv til stdout og fang med $(funksjon). Eks: `dato() { date +%Y-%m-%d; }`, så `i_dag=$(dato)`.",
  },

  // ===================== DTE-2501 ML =====================
  // Formler, konsept og algoritme-steg for moderne ML-pensum.

  // ---------- Formler ----------
  {
    id: "dte2501-c-gini",
    category: "praktisk",
    topic: "DTE-2501 ML",
    question: "Formel for Gini-urenhet i en node?",
    answer:
      "Gini(S) = 1 − Σ pᵢ², der pᵢ er andelen klasse i i S. Gini = 0 betyr noden er ren; maks ved jevn fordeling.",
    code: "p_A = 3/5, p_B = 2/5\nGini = 1 − (3/5)² − (2/5)² = 1 − 0.36 − 0.16 = 0.48",
  },
  {
    id: "dte2501-c-entropy",
    category: "praktisk",
    topic: "DTE-2501 ML",
    question: "Formel for entropi (Shannon)?",
    answer:
      "H(S) = − Σ pᵢ · log₂(pᵢ). Måler hvor mange bits informasjon som kreves for å beskrive klassen i S. Alternativ til Gini i beslutningstrær (criterion='entropy').",
  },
  {
    id: "dte2501-c-info-gain",
    category: "praktisk",
    topic: "DTE-2501 ML",
    question: "Hvordan beregnes informasjonsgevinst (IG) ved en split?",
    answer:
      "IG = Urenhet(foreldre) − Σ (|barn_i| / |foreldre|) · Urenhet(barn_i). Vektet snitt av barn-urenhet, trukket fra foreldrenodens. Velg splitten med størst IG.",
  },
  {
    id: "dte2501-c-kmeans-obj",
    category: "praktisk",
    topic: "DTE-2501 ML",
    question: "Objektiv-funksjon for k-Means?",
    answer:
      "J = Σᵢ ‖xᵢ − μ_{c(i)}‖² — Within-Cluster Sum of Squares (WCSS / inertia). k-Means minimerer dette grådig ved skiftende assign/update-steg.",
  },
  {
    id: "dte2501-c-bellman",
    category: "praktisk",
    topic: "DTE-2501 ML",
    question: "Bellman-likningen for optimal value V*?",
    answer:
      "V*(s) = max_a Σ_s' P(s'|s,a) · [R(s,a,s') + γ V*(s')]. Verdien i s er forventet umiddelbar belønning + diskontert verdi av neste tilstand, optimalt valg av handling.",
  },
  {
    id: "dte2501-c-qlearn-update",
    category: "praktisk",
    topic: "DTE-2501 ML",
    question: "Q-learning-oppdateringen?",
    answer:
      "Q(s,a) ← Q(s,a) + α · [r + γ · max_a' Q(s',a') − Q(s,a)]. α er læringsrate, leddet i hakeparentesen er TD-feilen.",
  },
  {
    id: "dte2501-c-tfidf",
    category: "praktisk",
    topic: "DTE-2501 ML",
    question: "Definer TF-IDF for term t i dokument d.",
    answer:
      "TF-IDF(t,d) = TF(t,d) · IDF(t). TF er termfrekvens i d. IDF = ln((1+N)/(1+df(t))) + 1 i sklearn — øker for sjeldne ord. Demper vanlige ord.",
  },
  {
    id: "dte2501-c-cosine",
    category: "praktisk",
    topic: "DTE-2501 ML",
    question: "Formel for cosine similarity mellom vektorer x og y?",
    answer:
      "cos(x,y) = (x · y) / (‖x‖ · ‖y‖). Ligger i [−1,1], for TF-IDF i [0,1]. For L2-normaliserte vektorer reduseres det til x · y.",
  },
  {
    id: "dte2501-c-knn-dist",
    category: "praktisk",
    topic: "DTE-2501 ML",
    question: "Euklidsk vs Manhattan-avstand?",
    answer:
      "Euklidsk: √(Σ(xᵢ−yᵢ)²) — rett linje (Minkowski p=2). Manhattan: Σ|xᵢ−yᵢ| — bymønster (Minkowski p=1). Manhattan er mer robust mot uteliggere.",
  },
  {
    id: "dte2501-c-pca-evr",
    category: "praktisk",
    topic: "DTE-2501 ML",
    question: "Hva er explained variance ratio i PCA?",
    answer:
      "EVR_i = λ_i / Σⱼ λⱼ — andelen av total varians forklart av prinsipalkomponent i. Velg k slik at kumulert EVR ≥ 0.95.",
  },
  {
    id: "dte2501-c-pso",
    category: "praktisk",
    topic: "DTE-2501 ML",
    question: "PSO-oppdatering for hastighet?",
    answer:
      "v(t+1) = w·v(t) + c₁·r₁·(pbest − x) + c₂·r₂·(gbest − x). Tre ledd: treghet, kognitivt (egen beste), sosialt (flokkens beste).",
  },
  {
    id: "dte2501-c-aco-pher",
    category: "praktisk",
    topic: "DTE-2501 ML",
    question: "Feromon-oppdatering i ACO?",
    answer:
      "τᵢⱼ(t+1) = (1 − ρ)·τᵢⱼ(t) + Σₖ Δτᵢⱼᵏ. Første ledd er fordamping (ρ), andre er bidrag fra maur som brukte (i,j), typisk Δτ = Q/L_k for hver maur som brukte kanten.",
  },
  {
    id: "dte2501-c-em-gmm-resp",
    category: "praktisk",
    topic: "DTE-2501 ML",
    question: "Hva er responsibility γᵢₖ i EM for GMM?",
    answer:
      "γᵢₖ = πₖ·N(xᵢ|μₖ,Σₖ) / Σⱼ πⱼ·N(xᵢ|μⱼ,Σⱼ). Posterior sannsynlighet for at xᵢ tilhører komponent k — soft assignment.",
  },
  {
    id: "dte2501-c-held-karp",
    category: "praktisk",
    topic: "DTE-2501 ML",
    question: "Held-Karp DP-rekursjon for TSP?",
    answer:
      "dp[S][j] = min over i ∈ S\\{j}: dp[S\\{j}][i] + dist(i,j). Optimum: min over j: dp[full][j] + dist(j,0). Kompleksitet O(n²·2ⁿ).",
  },

  // ---------- Konsept ----------
  {
    id: "dte2501-c-bagging-vs-boosting",
    category: "praktisk",
    topic: "DTE-2501 ML",
    question: "Bagging vs boosting — hovedforskjell?",
    answer:
      "Bagging trener mange modeller PARALLELT på bootstrap-sampler og reduserer variance. Boosting trener modeller SEKVENSIELT der hver retter feilene fra forrige, og reduserer bias.",
  },
  {
    id: "dte2501-c-hard-vs-soft",
    category: "praktisk",
    topic: "DTE-2501 ML",
    question: "Hard vs soft assignment i clustering?",
    answer:
      "Hard: hvert x tilhører ett cluster fullt ut (k-Means, argmin avstand). Soft: hvert x har sannsynlighetsfordeling over alle k komponenter (GMM, γᵢₖ).",
  },
  {
    id: "dte2501-c-pca-vs-kmeans",
    category: "praktisk",
    topic: "DTE-2501 ML",
    question: "Forskjellen på PCA og k-Means?",
    answer:
      "PCA komprimerer DIMENSJONER (features → færre prinsipalkomponenter). k-Means komprimerer PUNKTER (N → k cluster-senter). Begge unsupervised; ofte gjøres PCA → k-Means.",
  },
  {
    id: "dte2501-c-knn-lazy",
    category: "praktisk",
    topic: "DTE-2501 ML",
    question: "Hvorfor kalles k-NN lazy learning?",
    answer:
      "Fordi den ikke lærer en eksplisitt modell ved trening — bare lagrer datasettet. All beregning skjer ved prediksjon (sammenligning mot alle N treningseksempler).",
  },
  {
    id: "dte2501-c-scale-knn",
    category: "praktisk",
    topic: "DTE-2501 ML",
    question: "Hvorfor må vi skalere features før k-NN?",
    answer:
      "Distansemål summerer kvadrerte forskjeller. En feature med stor numerisk skala (f.eks. inntekt 10⁵) dominerer over en med liten (alder 10¹). Bruk StandardScaler eller MinMaxScaler.",
  },
  {
    id: "dte2501-c-no-scale-trees",
    category: "praktisk",
    topic: "DTE-2501 ML",
    question: "Hvorfor må man IKKE skalere features før beslutningstrær?",
    answer:
      "Treet splitter på terskelverdier (feature ≤ threshold). Skala påvirker ikke rekkefølgen på verdier, kun terskelverdien — splittingen blir lik. Skala-uavhengig.",
  },
  {
    id: "dte2501-c-curse-dim",
    category: "praktisk",
    topic: "DTE-2501 ML",
    question: "Hva er curse of dimensionality?",
    answer:
      "I høye dimensjoner blir alle datapunkter omtrent like langt unna hverandre — «nærmeste nabo» mister mening. Volum av en kule vokser eksponentielt, dataene blir sparse. Affekter k-NN, k-Means og avstandsbaserte metoder.",
  },
  {
    id: "dte2501-c-elbow",
    category: "praktisk",
    topic: "DTE-2501 ML",
    question: "Hva er albuemetoden for å velge k i k-Means?",
    answer:
      "Plot J(k) (inertia) mot k. J synker monotont, men det er ofte en «albue» der nedgangen flater ut — den k-verdien velges. Subjektivt; silhouette-score er mer kvantitativ.",
  },
  {
    id: "dte2501-c-silhouette",
    category: "praktisk",
    topic: "DTE-2501 ML",
    question: "Hva er silhouette-score?",
    answer:
      "s(i) = (b−a)/max(a,b), der a = snittavstand til eget cluster, b = snittavstand til nærmeste andre cluster. Snittet over alle punkt gir silhouette-score. > 0.5 = bra, > 0.7 = sterk struktur.",
  },
  {
    id: "dte2501-c-bias-variance",
    category: "praktisk",
    topic: "DTE-2501 ML",
    question: "Bias-variance dekomponering — kort.",
    answer:
      "E[(ŷ−y)²] = Bias² + Variance + støy. Bias = feilantakelser. Variance = ustabilitet mellom treningssett. Bagging ↓variance, boosting ↓bias.",
  },
  {
    id: "dte2501-c-mdp-markov",
    category: "praktisk",
    topic: "DTE-2501 ML",
    question: "Hva er Markov-egenskapen i en MDP?",
    answer:
      "P(s_{t+1} | s_t, a_t, s_{t−1}, …) = P(s_{t+1} | s_t, a_t). Sannsynligheten for neste tilstand avhenger bare av nåværende tilstand og handling — «memoryless future».",
  },
  {
    id: "dte2501-c-gamma",
    category: "praktisk",
    topic: "DTE-2501 ML",
    question: "Hva betyr diskonteringsfaktoren γ i RL?",
    answer:
      "Vekt for fremtidige belønninger: G = r₁ + γr₂ + γ²r₃ + … γ → 0 = bare umiddelbar belønning. γ → 1 = langsiktig. 0<γ<1 garanterer endelig sum på uendelig horisont. Typisk 0.9–0.99.",
  },
  {
    id: "dte2501-c-explore-exploit",
    category: "praktisk",
    topic: "DTE-2501 ML",
    question: "Eksplorering vs eksploitering — hvor ser vi det?",
    answer:
      "I RL: ε-greedy (gjør tilfeldig handling med ε, ellers greedy). I GA: mutasjon (utforsk) vs crossover (utnytt). I PSO: stor w utforsk, liten w utnytt.",
  },
  {
    id: "dte2501-c-knn-vs-kmeans",
    category: "praktisk",
    topic: "DTE-2501 ML",
    question: "k-NN vs k-Means — likhet og forskjell?",
    answer:
      "Begge bruker «k» og avstandsmål. k-NN er SUPERVISED (predikér klasse fra naboer). k-Means er UNSUPERVISED (finn k cluster-senter).",
  },
  {
    id: "dte2501-c-ga-elitism",
    category: "praktisk",
    topic: "DTE-2501 ML",
    question: "Hva er elitisme i GA?",
    answer:
      "De E beste individene overlever urørt til neste generasjon. Garanterer at beste-fitness aldri synker. Pris: noe redusert diversitet.",
  },
  {
    id: "dte2501-c-bow-vs-emb",
    category: "praktisk",
    topic: "DTE-2501 ML",
    question: "TF-IDF vs embeddings — kjernen?",
    answer:
      "TF-IDF: én dimensjon per ord, ortogonale (selv «bil» og «auto» blir helt ulike). Embeddings (Word2Vec, BERT): tette vektorer, semantisk like ord ligger nær hverandre.",
  },
  {
    id: "dte2501-c-rf-vs-bagging",
    category: "praktisk",
    topic: "DTE-2501 ML",
    question: "Hva skiller Random Forest fra ren bagging?",
    answer:
      "I tillegg til bootstrap-sampling av rader, sampler RF også et tilfeldig subset av features ved HVER split. Det reduserer korrelasjonen mellom trærne, gir bedre variance-reduksjon.",
  },
  {
    id: "dte2501-c-pca-center",
    category: "praktisk",
    topic: "DTE-2501 ML",
    question: "Hvorfor må vi mean-centre før PCA?",
    answer:
      "Hvis vi ikke gjør det, peker første komponent mot snittet i stedet for langs størst variansretning. PCA antar at variansen er sentrert om origo.",
  },
  {
    id: "dte2501-c-off-vs-on-policy",
    category: "praktisk",
    topic: "DTE-2501 ML",
    question: "Off-policy vs on-policy RL?",
    answer:
      "Off-policy (Q-learning): lærer optimal Q* selv om agenten følger en annen policy (ε-greedy). On-policy (SARSA): lærer policyen man faktisk følger.",
  },
  {
    id: "dte2501-c-tournament",
    category: "praktisk",
    topic: "DTE-2501 ML",
    question: "Tournament selection i GA?",
    answer:
      "Trekk k individer tilfeldig fra populasjonen, velg den med høyest fitness blant dem. k justerer seleksjonspress (k=2 = mildt, k=7 = hardt).",
  },

  // ---------- Algoritme-steg ----------
  {
    id: "dte2501-c-em-steps",
    category: "praktisk",
    topic: "DTE-2501 ML",
    question: "EM-algoritmen — hvilke to steg gjentas?",
    answer:
      "E-step (Expectation): beregn responsibilities γᵢₖ gitt nåværende parametre. M-step (Maximization): re-estimer π, μ, Σ basert på γᵢₖ (vektet snitt og kovarians). Repeter til log-likelihood konvergerer.",
  },
  {
    id: "dte2501-c-vi-steps",
    category: "praktisk",
    topic: "DTE-2501 ML",
    question: "Value Iteration — algoritmen i 3 setninger.",
    answer:
      "1) Initialiser V(s)=0. 2) For hver iter: V_{k+1}(s) = max_a Σ_s' P(s'|s,a)·[R + γV_k(s')]. 3) Stopp når ‖V_{k+1}−V_k‖<ε. Hent π*(s) = argmax_a Q*.",
  },
  {
    id: "dte2501-c-pi-steps",
    category: "praktisk",
    topic: "DTE-2501 ML",
    question: "Policy Iteration — to faser?",
    answer:
      "1) Policy evaluation: beregn V^π for current π (løs Bellman som lineært system). 2) Policy improvement: π_new(s) = argmax_a Σ_s' P(s'|s,a)·[R + γV^π(s')]. Repeter til π ikke endrer seg.",
  },
  {
    id: "dte2501-c-ga-loop",
    category: "praktisk",
    topic: "DTE-2501 ML",
    question: "Hovedloopen i en genetisk algoritme?",
    answer:
      "1) Initialiser populasjon. 2) Evaluer fitness. 3) Seleksjon. 4) Crossover. 5) Mutasjon. 6) Erstatt (med elitisme). Gjenta inntil maks generasjoner eller konvergens.",
  },
  {
    id: "dte2501-c-kmeans-steps",
    category: "praktisk",
    topic: "DTE-2501 ML",
    question: "k-Means (Lloyd's) — algoritmen.",
    answer:
      "1) Init k senter (k-means++). 2) ASSIGN: hvert x til nærmeste senter. 3) UPDATE: hvert senter til snitt av sine punkter. 4) Repeter 2-3 til ingen punkt skifter cluster.",
  },
  {
    id: "dte2501-c-knn-predict",
    category: "praktisk",
    topic: "DTE-2501 ML",
    question: "k-NN prediksjon — stegene?",
    answer:
      "1) Beregn dist(x_query, xᵢ) for alle i. 2) Sorter, behold de k minste. 3) Klassifisering: majoritetsstemme. Regresjon: snitt (evt. vektet med 1/dist).",
  },
  {
    id: "dte2501-c-adaboost-steps",
    category: "praktisk",
    topic: "DTE-2501 ML",
    question: "AdaBoost — sentrale steg per runde?",
    answer:
      "1) Tren svak klassifikator på vektet data. 2) Beregn ε_m (vektet feilrate). 3) α_m = ½·ln((1−ε_m)/ε_m). 4) Oppdater eksempel-vekter (øk for misklassifiserte) og normaliser.",
  },
  {
    id: "dte2501-c-gradient-boost-steps",
    category: "praktisk",
    topic: "DTE-2501 ML",
    question: "Gradient Boosting — hva gjør hver iterasjon?",
    answer:
      "1) Beregn negativ gradient av tap = pseudoresiduals. 2) Tren et nytt tre til å predikere residualene. 3) Oppdater ŷ_m = ŷ_{m-1} + η·h_m(x). Repeter M runder.",
  },
  {
    id: "dte2501-c-pca-steps",
    category: "praktisk",
    topic: "DTE-2501 ML",
    question: "PCA-pipeline — fra X til Z?",
    answer:
      "1) Mean-centre (og evt. standardiser). 2) Beregn Σ = X̃ᵀX̃/(N−1). 3) Egenvektor-dekomp: Σv = λv. 4) Sorter λ avtagende, velg k største. 5) Z = X̃·V_k.",
  },
  {
    id: "dte2501-c-aco-loop",
    category: "praktisk",
    topic: "DTE-2501 ML",
    question: "ACO-loopen for TSP — stegene?",
    answer:
      "1) Init feromon τ. 2) Hver maur bygger tur via stokastiske valg ∝ τ^α·η^β. 3) Beregn L_k. 4) Fordamp: τ ← (1−ρ)τ. 5) Legg til Δτ = Q/L_k på besøkte kanter. Repeter.",
  },
  {
    id: "dte2501-c-knn-k-choice",
    category: "praktisk",
    topic: "DTE-2501 ML",
    question: "Hvordan velger man k i k-NN?",
    answer:
      "Kryssvalidér over k ∈ {1,3,5,…,√N}, velg den med høyest validation accuracy. Bruk oddetall for binær klassifikasjon (unngår uavgjort).",
  },
  {
    id: "dte2501-c-kmeans-pp",
    category: "praktisk",
    topic: "DTE-2501 ML",
    question: "k-means++ init — hvorfor og hvordan?",
    answer:
      "Bedre init enn random: velg μ₁ tilfeldig, så velg hvert neste senter med sannsynlighet ∝ D(x)² (avstanden til nærmeste eksisterende senter)². Spredt init → mindre risiko for lokalt min.",
  },
  {
    id: "dte2501-c-roulette",
    category: "praktisk",
    topic: "DTE-2501 ML",
    question: "Roulette wheel-seleksjon — hvordan?",
    answer:
      "p_i = f_i / Σⱼ f_j. Tegn et tilfeldig tall i [0, Σf), finn hvilket kumulative vindu det treffer. Risiko: ett dominerende individ tar over.",
  },
  {
    id: "dte2501-c-one-point-x",
    category: "praktisk",
    topic: "DTE-2501 ML",
    question: "One-point crossover — beskriv.",
    answer:
      "Velg et cut-point i kromosomet. Barn 1 = forelder A før cut + forelder B etter cut. Barn 2 = motsatt. Bevarer sammenheng på lokale gen-blokker.",
  },
  {
    id: "dte2501-c-aic-bic",
    category: "praktisk",
    topic: "DTE-2501 ML",
    question: "AIC og BIC — hva er forskjellen?",
    answer:
      "Begge straffer modellkompleksitet for å velge antall komponenter (f.eks. K i GMM). AIC = −2logL + 2p. BIC = −2logL + p·ln(N). BIC straffer parametre hardere — foretrekker enklere modeller.",
  },
  {
    id: "dte2501-c-knn-vekt",
    category: "praktisk",
    topic: "DTE-2501 ML",
    question: "Vektet k-NN — hva er forskjellen?",
    answer:
      "I stedet for én stemme per nabo, vektes stemmen med 1/avstand. Nærmere naboer teller mer. Reduserer hjørne-effekter og er typisk litt bedre enn uniform vekt.",
  },
  {
    id: "dte2501-c-stop-words",
    category: "praktisk",
    topic: "DTE-2501 ML",
    question: "Hva er stop-words og hvorfor fjerne dem?",
    answer:
      "Vanlige ord uten innholdsbetydning: «og», «er», «the», «is». Fjernes før vektorisering for å redusere støy og dimensjonalitet. Moderne embeddings beholder dem ofte.",
  },
  {
    id: "dte2501-c-mut-rate",
    category: "praktisk",
    topic: "DTE-2501 ML",
    question: "Hvilken mutasjonsrate p_m er typisk i GA?",
    answer:
      "p_m ≈ 1/L, der L er kromosomlengden. Gir i snitt én mutasjon per individ. For lavt → for liten utforskning; for høyt → random walk.",
  },
  {
    id: "dte2501-c-tsp-naive",
    category: "praktisk",
    topic: "DTE-2501 ML",
    question: "Hvorfor er naiv TSP O(n!) og Held-Karp O(n²·2ⁿ)?",
    answer:
      "Naiv: prøv alle n! permutasjoner av byer. Held-Karp: state-rom 2ⁿ subsett × n endesteder, hver transisjon O(n). 2ⁿ vokser mye langsommere enn n!.",
  },
  {
    id: "dte2501-c-bow-limit",
    category: "praktisk",
    topic: "DTE-2501 ML",
    question: "Hva er hovedsvakheten ved Bag-of-Words?",
    answer:
      "Ignorerer ordrekkefølge og syntaks. «Hund biter mann» = «Mann biter hund». Også: ingen forståelse av synonymer — hvert ord er sin egen dimensjon.",
  },
  {
    id: "dte2501-c-rmse-mae",
    category: "praktisk",
    topic: "DTE-2501 ML",
    question: "RMSE vs MAE for regresjon — hva er forskjellen?",
    answer:
      "RMSE = √mean((y−ŷ)²) straffer store feil ekstra mye (kvadratet). MAE = mean(|y−ŷ|) behandler alle feil likt. RMSE er mer følsom for outliers.",
  },
  {
    id: "dte2501-c-overfit",
    category: "praktisk",
    topic: "DTE-2501 ML",
    question: "Hva er overfitting — i én setning?",
    answer:
      "Modellen lærer treningsdataens støy istedenfor underliggende mønster — høy trenings-accuracy, lav test-accuracy. Symptom på for høy variance / for kompleks modell.",
  },
  {
    id: "dte2501-c-mse-vs-r2",
    category: "praktisk",
    topic: "DTE-2501 ML",
    question: "Hva forteller R²?",
    answer:
      "R² = 1 − SS_res/SS_tot. Andel av variansen i y forklart av modellen. R²=1 = perfekt; R²=0 = like god som å gjette snittet; R²<0 = verre enn snitt-modell.",
  },
  {
    id: "dte2501-c-clustering-pipeline",
    category: "praktisk",
    topic: "DTE-2501 ML",
    question: "Standard clustering-pipeline på rå data?",
    answer:
      "1) Skalér (StandardScaler). 2) Evt. PCA for dimensjonsreduksjon. 3) Velg k via albue/silhouette. 4) Kjør k-Means eller GMM. 5) Evaluer cluster-kvalitet og tolk semantisk.",
  },
  {
    id: "dte2501-c-when-rl",
    category: "praktisk",
    topic: "DTE-2501 ML",
    question: "Når bruker man RL fremfor supervised learning?",
    answer:
      "Når riktig handling ikke er kjent på forhånd, men man kan måle belønning over tid. Sekvensielle beslutninger, ingen labeled data, men miljø man kan interagere med. Eks: spill, robotikk.",
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
  { id: "statistikk", label: "Statistikk" },
];
