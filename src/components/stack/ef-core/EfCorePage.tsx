import { Link } from "@tanstack/react-router";
import { ArrowRight, Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";

const STEPS = [
  { title: "Hva EF Core er", anchor: "hva" },
  { title: "DbContext + DbSet", anchor: "dbcontext" },
  { title: "Code-first migrations", anchor: "migrations" },
  { title: "LINQ til SQL", anchor: "linq-sql" },
  { title: "Relasjoner", anchor: "relasjoner" },
  { title: "Tracking vs AsNoTracking", anchor: "tracking" },
  { title: "Vanlige feller", anchor: "feller" },
];

export function EfCorePage() {
  return (
    <StackPageShell title="Entity Framework Core" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2802 · Datatilgang
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Entity Framework Core — ORM-en .NET lever av
          </h1>
          <p className="mt-3 text-muted-foreground">
            EF Core mapper C#-klasser til SQL-tabeller. Du skriver LINQ, EF Core
            oversetter til SQL, kjører mot DB-en og fyller objektene. «Code-first»:
            klassene definerer skjemaet, migrations lager faktiske DB-endringer.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <Link to="/drag" className="text-brand hover:underline">drag-oppgavene</Link>{" "}
              under «EF Core» — DbContext-setup, migrations-rekkefølge, LINQ-til-
              SQL, relasjons-konfigurasjon, tracking.
            </div>
          </div>
        </div>

        <CourseOutline courseId="ef-core" steps={STEPS} />

        <section id="hva" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Hva EF Core er — og ikke er</h2>
          <p className="text-sm text-muted-foreground mb-4">
            EF Core er en ORM (Object-Relational Mapper). Den bygger bro mellom
            tabell-tenking og objekt-tenking. Du jobber med C#-klasser; EF Core
            holder styr på hvilke rader som er hentet, hva som har endret seg, og
            kjører riktige INSERT/UPDATE/DELETE.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Du skriver:
    var b = _db.Books.First(b => b.Id == 5);
    b.Tittel = "Endret";
    _db.SaveChanges();

EF Core gjør:
    1.  SELECT * FROM Books WHERE Id = 5
    2.  Materialiserer rad → Book-objekt, marker som "tracked"
    3.  Du muterer .Tittel — change tracker noterer "modified"
    4.  SaveChanges() → UPDATE Books SET Tittel = 'Endret' WHERE Id = 5`}</pre>
          </div>
        </section>

        <section id="dbcontext" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. DbContext + DbSet</h2>
          <p className="text-sm text-muted-foreground mb-4">
            <code>DbContext</code> er rot­klassen — den representerer en «session»
            mot databasen. Hver <code>DbSet&lt;T&gt;</code> tilsvarer en tabell.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`// Entity-klasse
public class Book
{
    public int Id { get; set; }              // konvensjon: 'Id' eller 'BookId' = PK
    public string Tittel { get; set; } = "";
    public int ForfatterId { get; set; }     // FK
    public Forfatter? Forfatter { get; set; } // navigation property
}

public class Forfatter
{
    public int Id { get; set; }
    public string Navn { get; set; } = "";
    public List<Book> Books { get; set; } = new();
}

// DbContext
public class AppDb : DbContext
{
    public AppDb(DbContextOptions<AppDb> opts) : base(opts) { }

    public DbSet<Book> Books => Set<Book>();
    public DbSet<Forfatter> Forfattere => Set<Forfatter>();

    // Fluent konfigurasjon (alternativ til attributter)
    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<Book>()
            .HasOne(x => x.Forfatter)
            .WithMany(f => f.Books)
            .HasForeignKey(x => x.ForfatterId);
    }
}

// Registrering i Program.cs
builder.Services.AddDbContext<AppDb>(o =>
    o.UseSqlServer(builder.Configuration.GetConnectionString("Default")));

// Bruk i controller — DI gir oss en scoped instans pr. request
public class BooksController : ControllerBase
{
    private readonly AppDb _db;
    public BooksController(AppDb db) => _db = db;
    // ...
}`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Levetid:</strong> DbContext er registrert som
            <code> Scoped</code> — én instans per HTTP-request. Den er IKKE
            thread-safe, og bør IKKE leve lenger enn én logisk «arbeidsenhet».
          </p>
        </section>

        <section id="migrations" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Code-first migrations</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Du endrer C#-klassene, kjører en CLI-kommando, og EF Core genererer en
            migrasjon (en C#-fil som beskriver delta). Update-Database kjører den
            mot DB-en.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`# Installer EF CLI én gang
dotnet tool install --global dotnet-ef

# Lag første migrasjon basert på modellen din
dotnet ef migrations add InitialCreate

# Anvend på DB (kjører CREATE TABLE, etc.)
dotnet ef database update

# Senere — endret du Book-klassen?
dotnet ef migrations add AddIsbnToBook
dotnet ef database update

# Rull tilbake til en tidligere migrasjon
dotnet ef database update InitialCreate

# Eller i Package Manager Console (Visual Studio):
Add-Migration InitialCreate
Update-Database
Update-Database InitialCreate    # rollback`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Hver migrasjon</strong> er en C#-fil med <code>Up()</code> (gå
            framover) og <code>Down()</code> (rull tilbake). Sjekk filen før du
            applierer — særlig på prod-DB. EF Core sin <code>__EFMigrationsHistory</code>-
            tabell husker hvilke som er kjørt.
          </p>
        </section>

        <section id="linq-sql" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. LINQ til SQL</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Det <em>magiske</em>: samme LINQ-syntaks som over en in-memory liste
            kjøres som SQL mot databasen. Men du må vite når noe materialiserer.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`// Enkel filter — én SQL-spørring
var bok = await _db.Books
    .Where(b => b.Tittel.StartsWith("S"))
    .OrderBy(b => b.Tittel)
    .ToListAsync();

// Oversettes til:  SELECT * FROM Books WHERE Tittel LIKE 'S%' ORDER BY Tittel

// Eager loading med Include — JOIN med relatert tabell
var med = await _db.Books
    .Include(b => b.Forfatter)
    .ToListAsync();

// SELECT b.*, f.* FROM Books b LEFT JOIN Forfattere f ON b.ForfatterId = f.Id

// Projeksjon med Select — bare nødvendige felter
var lett = await _db.Books
    .Select(b => new { b.Id, b.Tittel })
    .ToListAsync();

// SELECT Id, Tittel FROM Books

// Aggregater — kjører som SQL COUNT/SUM/AVG
int antall = await _db.Books.CountAsync(b => b.Ar > 2000);
// SELECT COUNT(*) FROM Books WHERE Ar > 2000

// Single ressurs
var b1 = await _db.Books.FindAsync(42);                     // sjekker cache først
var b2 = await _db.Books.FirstOrDefaultAsync(b => b.Id == 42); // alltid query
var b3 = await _db.Books.SingleAsync(b => b.Id == 42);      // krever akkurat én

// Skriving
_db.Books.Add(new Book { Tittel = "Ny" });
_db.Books.Update(eksisterende);
_db.Books.Remove(skalSlettes);
await _db.SaveChangesAsync();   // én transaksjon, alle endringene`}</pre>
          </div>
        </section>

        <section id="relasjoner" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Relasjoner</h2>
          <p className="text-sm text-muted-foreground mb-4">
            EF Core utleder relasjoner fra navigation properties + FK-kolonner.
            Du kan overstyre med <code>HasOne</code>/<code>HasMany</code>/
            <code>WithOne</code>/<code>WithMany</code>.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`// ONE-TO-MANY: Forfatter ──< Book
public class Forfatter
{
    public int Id { get; set; }
    public List<Book> Books { get; set; } = new();   // many
}
public class Book
{
    public int Id { get; set; }
    public int ForfatterId { get; set; }              // FK
    public Forfatter? Forfatter { get; set; }         // one
}

// Fluent (i OnModelCreating)
b.Entity<Book>()
    .HasOne(x => x.Forfatter)
    .WithMany(f => f.Books)
    .HasForeignKey(x => x.ForfatterId)
    .OnDelete(DeleteBehavior.Cascade);  // slett bøker når forfatter slettes


// MANY-TO-MANY: Book ──< BookTag >── Tag  (EF Core 5+ kan skip join-table)
public class Book
{
    public int Id { get; set; }
    public List<Tag> Tags { get; set; } = new();
}
public class Tag
{
    public int Id { get; set; }
    public string Navn { get; set; } = "";
    public List<Book> Books { get; set; } = new();
}
// EF Core lager automatisk join-tabellen 'BookTag' med (BookId, TagId)


// ONE-TO-ONE: Bruker ── Profil
public class Bruker
{
    public int Id { get; set; }
    public Profil? Profil { get; set; }
}
public class Profil
{
    public int Id { get; set; }              // PK + FK
    public int BrukerId { get; set; }
    public Bruker? Bruker { get; set; }
}`}</pre>
          </div>
        </section>

        <section id="tracking" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Tracking vs AsNoTracking</h2>
          <p className="text-sm text-muted-foreground mb-4">
            EF Core sporer som default alle entiteter den henter, slik at
            <code>SaveChanges</code> kan finne hva som er endret. Det koster
            minne og tid — for read-only queries bør du slå det av.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`// TRACKED (default) — EF holder en kopi for change detection
var b = await _db.Books.FindAsync(5);
b.Tittel = "Ny tittel";
await _db.SaveChangesAsync();   // ← UPDATE går automatisk

// NO-TRACKING — raskere, mindre minne, men kan IKKE endres og lagres
var alle = await _db.Books
    .AsNoTracking()
    .ToListAsync();

// Når bruker du AsNoTracking?
//  - GET-endepunkter som BARE leser
//  - Lange lister du serialiserer til JSON
//  - Rapportering / søk

// Sett som default for hele DbContext (read-heavy app)
public class AppDb : DbContext
{
    public AppDb(DbContextOptions<AppDb> opts) : base(opts)
    {
        ChangeTracker.QueryTrackingBehavior =
            QueryTrackingBehavior.NoTracking;
    }
}`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Tommelfingerregel:</strong> read = AsNoTracking, write = tracked.
            EF Core bruker mindre minne og hopper over identity-resolution når
            tracking er av — typisk 20-40% raskere på store result-sett.
          </p>
        </section>

        <section id="feller" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Vanlige feller</h2>
          <div className="space-y-3 text-sm">
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>N+1 query</strong> — å iterere over <code>_db.Books</code> og
              hente <code>b.Forfatter</code> trigger én SQL-spørring per bok. Bruk
              <code>.Include()</code> eller projeksjon.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>ToList for tidlig</strong> — <code>.ToList()</code> midt i en
              query materialiserer hele tabellen til minnet. Hold queryen som
              <code>IQueryable</code> til siste øyeblikk.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>Glemmer SaveChangesAsync</strong> — <code>Add/Remove/Update</code>
              endrer bare in-memory change tracker. Ingenting skjer i DB før
              <code>SaveChanges(Async)</code>.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>Migrasjon på prod uten backup</strong> — destruktive endringer
              (drop kolonne, endre type) kan miste data. Sjekk migrasjonsfila
              <code>Up()</code> før <code>database update</code>.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>Long-lived DbContext</strong> — å holde samme DbContext lenge
              gir oppblåst change tracker. La DI håndtere det (Scoped pr. request).
            </div>
          </div>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/stack/$slug" params={{ slug: "blazor" }} className="text-brand hover:underline">
                Blazor
              </Link>{" "}— komponent-basert UI i C#, ofte med EF Core direkte under.
              <ArrowRight className="inline h-3.5 w-3.5 ml-1" />
            </li>
            <li>
              <Link to="/drag" className="text-brand hover:underline">Drag-oppgaver</Link>
              {" "}under «EF Core»: DbContext-fill, migrations-rekkefølge, LINQ-quiz,
              relasjons-match, tracking-quiz.
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
