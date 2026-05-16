import { Link } from "@tanstack/react-router";
import { ArrowRight, Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";

const STEPS = [
  { title: "MVC-mønsteret", anchor: "mvc" },
  { title: "Controller + action", anchor: "controller" },
  { title: "Routing", anchor: "routing" },
  { title: "Razor (.cshtml)", anchor: "razor" },
  { title: "Model binding + validation", anchor: "binding" },
  { title: "Layouts og partials", anchor: "layouts" },
  { title: "TempData / ViewBag / ViewData", anchor: "state" },
];

export function AspnetMvcPage() {
  return (
    <StackPageShell title="ASP.NET Core MVC" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2802 · Oblig 1
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            ASP.NET Core MVC — Model / View / Controller
          </h1>
          <p className="mt-3 text-muted-foreground">
            MVC er Microsofts klassiske web-mønster: controller mottar request,
            henter/manipulerer model, returnerer en view som rendres til HTML.
            ASP.NET Core kombinerer det med dependency injection, attribute-routing
            og en eksplisitt middleware-pipeline.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <Link to="/drag" className="text-brand hover:underline">drag-oppgavene</Link>{" "}
              under «ASP.NET MVC» — controller-action-flyt, routing-pattern, model
              binding, validation-attributter, Razor-syntaks.
            </div>
          </div>
        </div>

        <CourseOutline courseId="aspnet-mvc" steps={STEPS} />

        <section id="mvc" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. MVC-mønsteret</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Separasjon av ansvar: <strong>Model</strong> er dataen (klasser, EF
            entities), <strong>View</strong> er presentasjonen (Razor-templates),
            <strong> Controller</strong> er limet som koordinerer.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Browser ──GET /Books/Details/5──► Routing
                                     │
                                     ▼
                              BooksController.Details(5)
                                     │
                          (henter Book #5 fra DB)
                                     │
                              return View(book)
                                     │
                                     ▼
                          Views/Books/Details.cshtml
                          (Razor → HTML, med book som Model)
                                     │
                                     ▼
                              HTML-respons til browser`}</pre>
          </div>
        </section>

        <section id="controller" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Controller + action</h2>
          <p className="text-sm text-muted-foreground mb-4">
            En controller er en klasse som arver fra <code>Controller</code> og
            inneholder action-metoder. Hver action returnerer typisk en
            <code>IActionResult</code>.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`public class BooksController : Controller
{
    private readonly BookDb _db;

    // Dependency injection via konstruktør
    public BooksController(BookDb db) => _db = db;

    // GET /Books eller /Books/Index
    public async Task<IActionResult> Index()
    {
        var alle = await _db.Books.ToListAsync();
        return View(alle);          // → Views/Books/Index.cshtml
    }

    // GET /Books/Details/42
    public async Task<IActionResult> Details(int id)
    {
        var b = await _db.Books.FindAsync(id);
        if (b == null) return NotFound();   // → 404
        return View(b);                     // → Views/Books/Details.cshtml
    }

    // GET /Books/Create  (vis tomt skjema)
    public IActionResult Create() => View();

    // POST /Books/Create (motta skjema)
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create(Book b)
    {
        if (!ModelState.IsValid) return View(b);
        _db.Books.Add(b);
        await _db.SaveChangesAsync();
        return RedirectToAction(nameof(Index));   // PRG-pattern: redirect etter POST
    }
}`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>PRG (Post-Redirect-Get):</strong> etter en POST som lykkes,
            <code>RedirectToAction</code> heller enn å returnere View direkte.
            Slik unngår du dobbel-submit ved refresh.
          </p>
        </section>

        <section id="routing" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Routing</h2>
          <p className="text-sm text-muted-foreground mb-4">
            ASP.NET Core MVC bruker som regel <em>convention-based routing</em> for
            controllers, satt opp i <code>Program.cs</code>:
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`// Program.cs (top-level)
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllersWithViews();
builder.Services.AddDbContext<BookDb>(o =>
    o.UseSqlServer(builder.Configuration.GetConnectionString("Default")));

var app = builder.Build();

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.UseAuthorization();

// Default route — gjelder ALLE controllere
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Hva betyr mønsteret?</strong> <code>{`{controller=Home}`}</code>:
            standardverdi <code>Home</code> hvis ikke oppgitt.
            <code>{`{id?}`}</code>: <code>id</code> er valgfritt. Så
            <code>GET /</code> = <code>HomeController.Index()</code>,
            <code>GET /Books</code> = <code>BooksController.Index()</code>,
            <code>GET /Books/Details/5</code> = <code>BooksController.Details(5)</code>.
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            Du kan også bruke <strong>attribute routing</strong> på enkelt-actioner
            (mer vanlig i Web API — se neste modul).
          </p>
        </section>

        <section id="razor" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Razor (.cshtml)</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Razor blander HTML og C#: alt etter <code>@</code> er C#-kode, alt annet
            er HTML. Filen ligger i <code>Views/{`{Controller}`}/{`{Action}`}.cshtml</code>.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`@* Views/Books/Index.cshtml *@
@model IEnumerable<Book>       @* type for 'Model'-variabelen *@

@{
    ViewData["Title"] = "Bøker";
}

<h1>Bøker</h1>

<a asp-action="Create" class="btn btn-primary">Ny bok</a>

<table class="table">
    <thead>
        <tr><th>Tittel</th><th>Forfatter</th><th></th></tr>
    </thead>
    <tbody>
        @foreach (var b in Model)
        {
            <tr>
                <td>@b.Tittel</td>
                <td>@b.Forfatter</td>
                <td>
                    <a asp-action="Details" asp-route-id="@b.Id">Se</a> |
                    <a asp-action="Edit"    asp-route-id="@b.Id">Endre</a>
                </td>
            </tr>
        }
    </tbody>
</table>

@if (!Model.Any())
{
    <p>Ingen bøker enda.</p>
}`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Tag helpers</strong> som <code>asp-action</code>,
            <code>asp-route-id</code>, <code>asp-for</code> genererer riktig URL
            eller HTML-attributt basert på rute-konfigurasjonen og modellen.
            Aldri hardkod URL-er i Razor.
          </p>
        </section>

        <section id="binding" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Model binding + validation</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Når en POST kommer inn med form-data, mapper ASP.NET automatisk
            felt-navn til property-navn på parameter-objektet. Du får et ferdig
            populert C#-objekt.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`public class Book
{
    public int Id { get; set; }

    [Required(ErrorMessage = "Tittel er påkrevd")]
    [StringLength(200, MinimumLength = 1)]
    public string Tittel { get; set; } = "";

    [Required]
    public string Forfatter { get; set; } = "";

    [Range(1450, 2100, ErrorMessage = "Ugyldig årstall")]
    public int Ar { get; set; }

    [EmailAddress]
    public string? KontaktEpost { get; set; }
}

// Controller — Book bindes automatisk fra form-fields
[HttpPost]
[ValidateAntiForgeryToken]
public async Task<IActionResult> Create(Book b)
{
    // ModelState fylles fra valideringsattributtene
    if (!ModelState.IsValid)
        return View(b);    // vis skjema med feilmeldinger

    _db.Books.Add(b);
    await _db.SaveChangesAsync();
    return RedirectToAction(nameof(Index));
}

// Form i Razor
<form asp-action="Create" method="post">
    <div asp-validation-summary="All"></div>
    <input asp-for="Tittel" />
    <span asp-validation-for="Tittel"></span>
    <input asp-for="Forfatter" />
    <input asp-for="Ar" />
    <button type="submit">Lagre</button>
</form>`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Hvor henter binderen verdier fra?</strong> Default-rekkefølge:
            form-fields → route values → query string. Du kan tvinge med
            <code>[FromBody]</code>, <code>[FromQuery]</code>, <code>[FromRoute]</code>.
          </p>
        </section>

        <section id="layouts" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Layouts og partials</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Felles layout (header/footer/nav) defineres i <code>_Layout.cshtml</code>.
            Hver view erklærer den i <code>_ViewStart.cshtml</code>. Partials er
            gjenbrukbare biter av Razor.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`@* Views/Shared/_Layout.cshtml *@
<!DOCTYPE html>
<html>
<head>
    <title>@ViewData["Title"] - MinApp</title>
    <link rel="stylesheet" href="~/css/site.css" />
</head>
<body>
    <nav>
        <a asp-controller="Home" asp-action="Index">Hjem</a>
        <a asp-controller="Books" asp-action="Index">Bøker</a>
    </nav>

    <main>
        @RenderBody()     @* her plugges hver view inn *@
    </main>

    <footer>&copy; 2024</footer>
    @RenderSection("Scripts", required: false)
</body>
</html>

@* Views/_ViewStart.cshtml — kjøres før hver view *@
@{
    Layout = "_Layout";
}

@* Partial: Views/Shared/_BookCard.cshtml *@
@model Book
<div class="card">
    <h3>@Model.Tittel</h3>
    <p>@Model.Forfatter</p>
</div>

@* Bruk i annen view *@
<partial name="_BookCard" model="b" />`}</pre>
          </div>
        </section>

        <section id="state" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. TempData / ViewBag / ViewData</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Tre mekanismer for å sende data fra controller til view <em>utenom</em>
            sterk-typet Model. Vit forskjellen — eksamenstoff.
          </p>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-32">Verktøy</th>
                  <th className="text-left font-semibold px-4 py-2">Levetid</th>
                  <th className="text-left font-semibold px-4 py-2">Når</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">ViewData</td><td className="px-4 py-3 text-muted-foreground">Én request</td><td className="px-4 py-3 text-muted-foreground">Tittel, småting til view. Dictionary&lt;string, object&gt;.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">ViewBag</td><td className="px-4 py-3 text-muted-foreground">Én request</td><td className="px-4 py-3 text-muted-foreground">Dynamic wrapper rundt ViewData. Samme bruk.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">TempData</td><td className="px-4 py-3 text-muted-foreground">Neste request</td><td className="px-4 py-3 text-muted-foreground">Flash-meldinger over en redirect.</td></tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`// I controller
ViewData["Title"] = "Bøker";
ViewBag.Antall = 42;        // samme som ViewData["Antall"]
TempData["Melding"] = "Bok lagret!";
return RedirectToAction(nameof(Index));

// I view
<h1>@ViewData["Title"]</h1>
<p>Antall: @ViewBag.Antall</p>

@if (TempData["Melding"] != null)
{
    <div class="alert">@TempData["Melding"]</div>
}`}</pre>
          </div>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/stack/$slug" params={{ slug: "aspnet-webapi" }} className="text-brand hover:underline">
                ASP.NET Core Web API
              </Link>{" "}— samme stakk, men JSON i stedet for HTML.
              <ArrowRight className="inline h-3.5 w-3.5 ml-1" />
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "ef-core" }} className="text-brand hover:underline">
                EF Core
              </Link>{" "}— det <code>BookDb</code>-objektet du injiserte.
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
