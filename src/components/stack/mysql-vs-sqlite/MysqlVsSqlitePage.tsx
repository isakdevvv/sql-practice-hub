import { Link } from "@tanstack/react-router";
import { ArrowRight, Lightbulb, AlertTriangle } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";

type Mapping = {
  konsept: string;
  mysql: string;
  sqlite: string;
  forklaring: string;
};

const MAPPINGS: Mapping[] = [
  {
    konsept: "Auto-økende primærnøkkel",
    mysql: "`id` INT NOT NULL AUTO_INCREMENT,\nPRIMARY KEY (`id`)",
    sqlite: "id INTEGER PRIMARY KEY AUTOINCREMENT",
    forklaring:
      "MySQL: AUTO_INCREMENT er et eget kolonne-attributt, og PRIMARY KEY skrives separat. SQLite: én linje, og bare INTEGER (ikke INT) gir auto-økende oppførsel når kombinert med PRIMARY KEY.",
  },
  {
    konsept: "Tekst-typer",
    mysql: "`tittel` varchar(50)",
    sqlite: "tittel TEXT",
    forklaring:
      "MySQL har faste lengde-grenser (VARCHAR(n)). SQLite har bare én tekst-type (TEXT) og ignorerer lengde-tall i praksis. Skriv likevel VARCHAR(50) i SQLite hvis du vil — det blir lagret som TEXT.",
  },
  {
    konsept: "Tall med desimaler",
    mysql: "`pris` decimal(6,2)",
    sqlite: "pris NUMERIC",
    forklaring:
      "MySQL DECIMAL(6,2) = totalt 6 sifre hvorav 2 etter komma. SQLite har bare NUMERIC eller REAL — ingen presisjons-garanti. For pris-data i SQLite må du ofte runde av selv.",
  },
  {
    konsept: "Heltall",
    mysql: "`alder` int DEFAULT NULL",
    sqlite: "alder INTEGER",
    forklaring:
      "MySQL skiller på INT, TINYINT, SMALLINT, BIGINT (ulike størrelser). SQLite bruker bare INTEGER for alle.",
  },
  {
    konsept: "Lagrings-motor",
    mysql: "ENGINE=InnoDB",
    sqlite: "(ikke nødvendig)",
    forklaring:
      "MySQL kan ha flere motorer (InnoDB støtter transaksjoner og fremmednøkler, MyISAM gjør ikke). InnoDB er standard og det du bør bruke. SQLite har bare én motor.",
  },
  {
    konsept: "Tegnsett",
    mysql: "DEFAULT CHARSET=utf8mb4",
    sqlite: "(alltid UTF-8)",
    forklaring:
      "MySQL trenger eksplisitt utf8mb4 for å støtte emoji og alle Unicode-tegn (utf8 alene i MySQL er begrenset). SQLite er alltid UTF-8.",
  },
  {
    konsept: "Norske tegn i kolonnenavn",
    mysql: "`år` int",
    sqlite: "aar INTEGER",
    forklaring:
      "MySQL tillater æ/ø/å i kolonnenavn hvis tegnsettet stemmer (og kolonnenavnet quotes med backticks). I vår SQLite-plattform skriver vi `aar` for å unngå parser-trøbbel. Eksamen-pensum bruker `år` — kjenn igjen begge skrivemåter.",
  },
  {
    konsept: "Fremmednøkkel med CASCADE",
    mysql: "FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE CASCADE",
    sqlite: "FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE",
    forklaring:
      "Lik syntaks. MEN i SQLite må fremmednøkler aktiveres eksplisitt med PRAGMA foreign_keys = ON; for hver tilkobling. I MySQL/InnoDB er det på som standard.",
  },
  {
    konsept: "Sjekk-betingelse",
    mysql: "`year` INT CHECK (`year` >= 1886)",
    sqlite: "year INTEGER CHECK (year >= 1886)",
    forklaring:
      "Lik syntaks for CHECK-betingelser. Begge støtter dette.",
  },
  {
    konsept: "Unik-betingelse",
    mysql: "`vin` VARCHAR(17) UNIQUE NOT NULL",
    sqlite: "vin TEXT UNIQUE NOT NULL",
    forklaring:
      "Lik syntaks i denne formen. Begge støtter også separate UNIQUE-blokker nederst i CREATE TABLE.",
  },
  {
    konsept: "Tidsstempel",
    mysql: "`created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
    sqlite: "created_at TEXT DEFAULT CURRENT_TIMESTAMP",
    forklaring:
      "MySQL har en egen TIMESTAMP-type. SQLite lagrer datoer som TEXT (ISO-8601) eller INTEGER (Unix-sekunder). CURRENT_TIMESTAMP fungerer i begge.",
  },
  {
    konsept: "Enum",
    mysql: "`role` ENUM('user', 'admin') DEFAULT 'user'",
    sqlite: "role TEXT CHECK (role IN ('user','admin')) DEFAULT 'user'",
    forklaring:
      "MySQL har en innebygd ENUM-type. SQLite har det ikke — du må emulere med TEXT + CHECK-betingelse.",
  },
];

const STEPS = [
  { title: "Hvorfor vi har to versjoner", anchor: "hvorfor" },
  { title: "Film-skjemaet — side om side", anchor: "film" },
  { title: "Mapping-tabell", anchor: "mapping" },
  { title: "Vanlige eksamen-feller", anchor: "feller" },
];

const FILM_MYSQL = `DROP TABLE IF EXISTS \`film\`;
CREATE TABLE \`film\` (
  \`fnr\` int NOT NULL AUTO_INCREMENT,
  \`tittel\` varchar(50) DEFAULT NULL,
  \`år\` int DEFAULT NULL,
  \`land\` varchar(50) default null,
  \`sjanger\` varchar(50) default null,
  \`alder\` int default null,
  \`tid\` int default null,
  \`pris\` decimal(6,2) default null,
  PRIMARY KEY (\`fnr\`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4;`;

const FILM_SQLITE = `DROP TABLE IF EXISTS film;
CREATE TABLE film (
  fnr   INTEGER PRIMARY KEY AUTOINCREMENT,
  tittel TEXT,
  aar    INTEGER,
  land   TEXT,
  sjanger TEXT,
  alder  INTEGER,
  tid    INTEGER,
  pris   NUMERIC
);`;

export function MysqlVsSqlitePage() {
  return (
    <StackPageShell title="MySQL vs SQLite — porting og pensum" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2509 · Database-dialekter
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            MySQL vs SQLite — slik mapper du fra eksamen-syntaks
          </h1>
          <p className="mt-3 text-muted-foreground">
            Kurset DTE-2509 bruker <strong>MySQL</strong> (med <code>dte_2509</code>-database
            og <code>mysql.connector</code>). Plattformen her kjører <strong>SQLite</strong> i
            nettleseren — det er ikke samme dialekt. Eksamen kan be deg skrive begge.
            Denne siden viser mappingen ord for ord.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <Link to="/drag" className="text-brand hover:underline">
                drag-oppgaven «Skriv film-skjemaet slik kurset gjør det»
              </Link>{" "}
              under emnet DDL — du drar MySQL-spesifikke tokens på plass.
            </div>
          </div>
        </div>

        <CourseOutline courseId="mysql-vs-sqlite" steps={STEPS} />

        {/* Hvorfor */}
        <section id="hvorfor" className="mb-10">
          <div className="rounded-xl border-2 border-brand/40 bg-brand/5 p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              To dialekter, samme SQL-stamme
            </div>
            <p className="text-sm text-foreground">
              <strong>SQL-standarden</strong> dekker SELECT, WHERE, GROUP BY, JOIN — alt det
              du øver på i Practice fungerer identisk i begge. Det er{" "}
              <strong>DDL (CREATE TABLE)</strong> og <strong>tilkobling fra Python</strong>{" "}
              som er forskjellig. På eksamen får du typisk MySQL-stil DDL.
            </p>
          </div>
        </section>

        {/* Film side-om-side */}
        <section id="film" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Film-skjemaet — slik kurset skriver det</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Eksakt fra repoets <code>Flask_DB/Movies/film.sql</code>:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs uppercase tracking-wider text-foreground/70 font-semibold mb-2">
                MySQL (kurset)
              </div>
              <pre className="font-mono text-xs overflow-x-auto whitespace-pre rounded bg-background border border-border p-3 h-full">
                {FILM_MYSQL}
              </pre>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-foreground/70 font-semibold mb-2">
                SQLite (plattformen)
              </div>
              <pre className="font-mono text-xs overflow-x-auto whitespace-pre rounded bg-background border border-border p-3 h-full">
                {FILM_SQLITE}
              </pre>
            </div>
          </div>
          <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
            <div className="text-sm">
              Legg merke til at vi har gitt nytt navn fra <code>år</code> til <code>aar</code>{" "}
              i SQLite-versjonen. Det er bare for å unngå parser-trøbbel i nettleseren. På
              eksamen skriver du <code>år</code>.
            </div>
          </div>
        </section>

        {/* Mapping-tabell */}
        <section id="mapping" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Konsept-for-konsept mapping</h2>
          <div className="space-y-3">
            {MAPPINGS.map((m) => (
              <div key={m.konsept} className="rounded-xl border border-border bg-card p-4">
                <div className="font-semibold mb-3">{m.konsept}</div>
                <div className="grid md:grid-cols-2 gap-3 mb-3">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-foreground/60 font-semibold mb-1">
                      MySQL
                    </div>
                    <pre className="font-mono text-xs overflow-x-auto whitespace-pre rounded bg-background border border-border p-2">
                      {m.mysql}
                    </pre>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wider text-foreground/60 font-semibold mb-1">
                      SQLite
                    </div>
                    <pre className="font-mono text-xs overflow-x-auto whitespace-pre rounded bg-background border border-border p-2">
                      {m.sqlite}
                    </pre>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{m.forklaring}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Feller */}
        <section id="feller" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Eksamen-feller</h2>
          <div className="space-y-3 text-sm">
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>Backticks vs anførselstegn.</strong> MySQL bruker{" "}
              <code>`backticks`</code> rundt navn. SQLite bruker{" "}
              <code>&quot;double quotes&quot;</code> (eller backticks, men det er ikke
              standard). Skriv som kurset gjør på eksamen.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>AUTO_INCREMENT vs AUTOINCREMENT.</strong> MySQL har understrek,
              SQLite har ikke. Lett å skrive feil.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>Fremmednøkler i SQLite må aktiveres.</strong> Du må kjøre{" "}
              <code>PRAGMA foreign_keys = ON;</code> i SQLite — ellers blir ON DELETE
              CASCADE og REFERENCES-sjekker bare ignorert. I MySQL/InnoDB er det på fra
              starten.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>ENUM finnes ikke i SQLite.</strong> Skriv{" "}
              <code>CHECK (role IN ('user','admin'))</code> i stedet.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>Tilkobling fra Python.</strong> Kurset bruker{" "}
              <code>mysql.connector.connect(host=..., user=..., password=..., database=...)</code>
              . SQLite bruker bare <code>sqlite3.connect(&quot;sti/til/fil.db&quot;)</code> —
              ingen host/user/password.
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/drag" className="text-brand hover:underline">
                Drag-oppgave
              </Link>
              : «Skriv film-skjemaet slik kurset gjør det» (emne: DDL).
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "nokler" }} className="text-brand hover:underline">
                Stack: Primær- og fremmednøkler
              </Link>{" "}
              — dypere på FK, ON DELETE og nøkkel-design.
              <ArrowRight className="inline h-3.5 w-3.5 ml-1" />
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
