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
      "Beskriver hvor mange forekomster av én entitet som kan kobles til en annen — f.eks. én kunde kan ha mange utleier (1:M).",
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
  },
  {
    id: "c-left-join",
    category: "sql",
    topic: "JOIN",
    question: "Hva er LEFT JOIN?",
    answer:
      "Tar med ALLE rader fra venstre tabell. Hvis høyre side ikke matcher, fylles de høyre kolonnene med NULL.",
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
  },
  {
    id: "c-index",
    category: "sql",
    topic: "Indeks",
    question: "Hva er en indeks?",
    answer:
      "En datastruktur som gjør oppslag raskere, som registeret bakerst i en bok. Gjør SELECT/WHERE/JOIN raskere, men gjør INSERT/UPDATE/DELETE litt tregere fordi indeksen må oppdateres.",
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
  },
  {
    id: "c-commit-py",
    category: "flask",
    topic: "Database",
    question: "Hvorfor må man kalle db.commit() etter INSERT/UPDATE/DELETE?",
    answer:
      "Endringene er bare i transaksjonsbufferet til serveren stoppes. Uten commit() lagres de ikke permanent — neste oppstart har dem ikke.",
  },

  // ============= HTTP =============
  {
    id: "c-http",
    category: "http",
    topic: "HTTP",
    question: "Hva står HTTP for?",
    answer: "HyperText Transfer Protocol — protokollen klient og server bruker for å snakke sammen.",
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
