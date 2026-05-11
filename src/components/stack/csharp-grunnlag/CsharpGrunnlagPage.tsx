import { Link } from "@tanstack/react-router";
import { ArrowRight, Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";

const STEPS = [
  { title: "Typer og var", anchor: "typer" },
  { title: "Classes vs records", anchor: "class-record" },
  { title: "Properties", anchor: "properties" },
  { title: "LINQ — Where / Select / OrderBy", anchor: "linq" },
  { title: "async / await", anchor: "async" },
  { title: "Nullable reference types", anchor: "nullable" },
  { title: "Vanlige feller", anchor: "feller" },
];

export function CsharpGrunnlagPage() {
  return (
    <StackPageShell title="C#-grunnlag" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2802 · Språk
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            C# — språk-grunnlag for .NET
          </h1>
          <p className="mt-3 text-muted-foreground">
            C# er statisk typet, OOP-først (alt er en class), men har de siste 10
            årene fått funksjonelle trekk: LINQ, records, pattern matching, nullable
            reference types. Dette er minimums-syntaksen du må kjenne for at MVC,
            Web API og EF Core skal gi mening.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <Link to="/drag" className="text-brand hover:underline">drag-oppgavene</Link>{" "}
              under «C#» — match typer, fill LINQ-ledd, quiz om async, nullable
              annoteringer.
            </div>
          </div>
        </div>

        <CourseOutline courseId="csharp-grunnlag" steps={STEPS} />

        <section id="typer" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Typer og var</h2>
          <p className="text-sm text-muted-foreground mb-4">
            C# er statisk typet — typen ligger fast ved kompilering. Du må enten
            skrive typen, eller bruke <code>var</code> og la kompilatoren utlede den.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`// Primitive verditrekk-typer
int alder = 30;           // 32-bit signert
long stort = 9_000_000_000L;
double pris = 19.95;
decimal kr = 199.50m;     // for penger! double mister presisjon
bool aktiv = true;
char tegn = 'A';

// Referansetyper
string navn = "Ada";
int[] tall = { 1, 2, 3 };
List<string> liste = new() { "a", "b" };

// var — utledes ved kompilering (fortsatt statisk typet!)
var x = 42;               // x er int
var s = "hei";            // s er string
var liste2 = new List<int>();

// const og readonly
const double PI = 3.14159;     // alltid uforanderlig
readonly DateTime opprettet;   // settes i konstruktør`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>var er IKKE dynamisk:</strong> det er bare type-inferens.
            <code>var x = 1; x = "hei";</code> kompilerer ikke. Bruk <code>var</code>
            når høyresida gjør typen åpenbar — særlig ved <code>new()</code>.
          </p>
        </section>

        <section id="class-record" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Classes vs records</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Begge er referansetyper. Forskjellen: <strong>class</strong> er
            tradisjonell OOP-bygge­stein med identitet, <strong>record</strong> er
            laget for å holde data og sammenligner på verdi.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`// CLASS — identitet, mutabel, sammenlignes med ==reference
public class Bok
{
    public int Id { get; set; }
    public string Tittel { get; set; } = "";
    public int Ar { get; set; }
}

var a = new Bok { Id = 1, Tittel = "1984" };
var b = new Bok { Id = 1, Tittel = "1984" };
Console.WriteLine(a == b);  // False — ulike objekter

// RECORD — verdi-likhet, ofte uforanderlig (immutable)
public record Bok2(int Id, string Tittel, int Ar);

var c = new Bok2(1, "1984", 1949);
var d = new Bok2(1, "1984", 1949);
Console.WriteLine(c == d);  // True — alle properties like!

// Non-destruktiv mutasjon med 'with'
var e = c with { Ar = 1950 };  // ny Bok2, alt likt utenom Ar`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Tommelfingerregel:</strong> bruk <code>record</code> for DTOer
            (data­objekter du sender over nettet eller i mellom lag),
            <code>class</code> for Entity-modeller i EF Core og forretningslogikk
            som har identitet og oppfører seg.
          </p>
        </section>

        <section id="properties" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Properties — den C#-typiske ting</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Property er en kombinasjon av et felt og to metoder (get/set), pakket inn
            som ett. Brukes i stedet for offentlige felt — gir mulighet for
            validering, computed values og data binding (særlig viktig i Blazor og
            MVC model binding).
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`public class Person
{
    // Auto-implementert property — kompilatoren genererer backing field
    public string Navn { get; set; } = "";

    // Read-only property med init-only setter (C# 9+)
    public DateTime Opprettet { get; init; } = DateTime.UtcNow;

    // Full property med backing field og validering
    private int _alder;
    public int Alder
    {
        get => _alder;
        set
        {
            if (value < 0) throw new ArgumentException("Negativ alder?");
            _alder = value;
        }
    }

    // Computed (expression-bodied)
    public bool ErVoksen => _alder >= 18;
}

var p = new Person { Navn = "Ada", Alder = 30 };
p.Alder = 31;          // OK
// p.Opprettet = ...;  // FEIL — init kan bare settes ved object init`}</pre>
          </div>
        </section>

        <section id="linq" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. LINQ — Where / Select / OrderBy</h2>
          <p className="text-sm text-muted-foreground mb-4">
            LINQ (Language Integrated Query) gir SQL-aktig syntaks for samlinger.
            Samme syntaks fungerer over <code>List&lt;T&gt;</code>, arrays, XML,
            <strong> og EF Core DbSet</strong> — der den oversettes til SQL.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`var personer = new List<Person>
{
    new() { Navn = "Ada", Alder = 30 },
    new() { Navn = "Bob", Alder = 17 },
    new() { Navn = "Cleo", Alder = 25 },
};

// Where = SQL WHERE
var voksne = personer.Where(p => p.Alder >= 18);

// Select = SQL SELECT (projeksjon)
var navn = personer.Select(p => p.Navn);  // IEnumerable<string>

// Kombinasjon — kjedet (method syntax)
var resultater = personer
    .Where(p => p.Alder >= 18)
    .OrderBy(p => p.Navn)
    .Select(p => new { p.Navn, p.Alder })  // anonymt objekt
    .ToList();

// Alternativ: query syntax (mer SQL-aktig)
var resultater2 = (
    from p in personer
    where p.Alder >= 18
    orderby p.Navn
    select new { p.Navn, p.Alder }
).ToList();

// Aggregater
int totalAlder  = personer.Sum(p => p.Alder);
int antallVoksne = personer.Count(p => p.Alder >= 18);
var eldst = personer.OrderByDescending(p => p.Alder).First();`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Deferred execution:</strong> <code>Where</code>/<code>Select</code>
            kjører ikke før du materialiserer (<code>.ToList()</code>,
            <code>.Count()</code>, <code>foreach</code>). Det er derfor EF Core kan
            bygge én SQL-spørring av en hel LINQ-kjede.
          </p>
        </section>

        <section id="async" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. async / await</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Asynkron kode i C# er førsteklasses og brukes overalt — særlig for I/O
            (DB, HTTP, fil). Returner <code>Task</code> eller <code>Task&lt;T&gt;</code>,
            bruk <code>await</code> for å vente uten å blokkere tråden.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`// Async-metode returnerer Task<T>
public async Task<string> HentBrukerNavnAsync(int id)
{
    using var http = new HttpClient();
    string json = await http.GetStringAsync($"/api/users/{id}");
    return json;
}

// Konsumér
public async Task KjorAsync()
{
    string navn = await HentBrukerNavnAsync(42);
    Console.WriteLine(navn);
}

// Konvensjon: suffiks 'Async' på metodenavn.
// Returner Task (ikke void!) for async metoder — void er bare for event handlers.

// Parallel: kjør begge samtidig, vent på begge
var t1 = HentBrukerNavnAsync(1);
var t2 = HentBrukerNavnAsync(2);
await Task.WhenAll(t1, t2);
string n1 = t1.Result, n2 = t2.Result;

// I ASP.NET Core er controllere async by default:
[HttpGet("{id}")]
public async Task<ActionResult<Bruker>> Get(int id)
{
    var b = await _db.Brukere.FindAsync(id);
    return b == null ? NotFound() : Ok(b);
}`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Hvorfor async?</strong> En web-server med 100 samtidige tregge
            DB-spørringer ville ellers blokkere 100 tråder. Med async frigjøres
            tråden mens DB-en jobber — én tråd kan håndtere mange forespørsler.
          </p>
        </section>

        <section id="nullable" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Nullable reference types (NRT)</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Siden C# 8 kan kompilatoren spore om en referanse <em>kan</em> være null
            eller ikke. Du sier det med <code>?</code>. Slått på som default i nye
            .NET-prosjekter.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`#nullable enable

string navn = null;       // ADVARSEL — string er ikke-nullable
string? mellomnavn = null; // OK — '?' = kan være null

void Skriv(Person p)
{
    Console.WriteLine(p.Navn.Length);    // OK — Navn er string
    Console.WriteLine(p.Mellomnavn.Length); // FEIL — Mellomnavn er string?
    Console.WriteLine(p.Mellomnavn?.Length); // OK — null-conditional, returnerer int?
    Console.WriteLine(p.Mellomnavn!.Length); // OK — '!' = "stol på meg, ikke null"
}

// Default for parametre / properties:
public class Person
{
    public string Navn { get; set; } = "";    // unngå null
    public string? Mellomnavn { get; set; }   // eksplisitt valgfritt
}

// Pattern matching mot null
if (mellomnavn is not null)
{
    Console.WriteLine(mellomnavn.Length);  // her vet kompilatoren det er trygt
}`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Praktisk konsekvens:</strong> NullReferenceException er fortsatt
            mulig, men kompilatoren advarer nesten alltid. Bruk <code>!</code>
            sparsomt — det er en lovnad du gir kompilatoren.
          </p>
        </section>

        <section id="feller" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Vanlige feller</h2>
          <div className="space-y-3 text-sm">
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>Glem <code>await</code></strong> — kallet returnerer en Task som
              aldri venter på. Hvis du har <code>async</code> i metode-signaturen
              MÅ du awaite en gang, eller returnere Task-en eksplisitt.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>.Result eller .Wait() i web-controller</strong> — gir
              deadlocks i klassisk ASP.NET, og blokkerer trådpoolen i alle tilfeller.
              Bruk alltid <code>await</code>.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>double for penger</strong> — flytetall-presisjon gir små feil.
              Bruk <code>decimal</code> for kroner og øre.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>Materialisering for tidlig</strong> — <code>.ToList()</code> i
              midten av en LINQ-kjede gjør at EF Core kjører de neste leddene i
              minnet i stedet for i SQL. Hold kjeden over IQueryable.
            </div>
          </div>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/stack/$slug" params={{ slug: "aspnet-mvc" }} className="text-brand hover:underline">
                ASP.NET MVC
              </Link>{" "}— der C# møter HTTP. Controllers, Razor, model binding.
              <ArrowRight className="inline h-3.5 w-3.5 ml-1" />
            </li>
            <li>
              <Link to="/drag" className="text-brand hover:underline">Drag-oppgaver</Link>
              {" "}under «C#»: types match, var-quiz, LINQ-fill, async-fill, NRT.
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
