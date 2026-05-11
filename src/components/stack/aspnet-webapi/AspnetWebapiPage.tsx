import { Link } from "@tanstack/react-router";
import { ArrowRight, Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";

const STEPS = [
  { title: "Web API vs MVC", anchor: "vs-mvc" },
  { title: "ControllerBase + attributter", anchor: "controller" },
  { title: "Attribute routing", anchor: "routing" },
  { title: "Action results", anchor: "results" },
  { title: "Model binding (kilder)", anchor: "binding" },
  { title: "Statuskoder", anchor: "status" },
  { title: "CORS", anchor: "cors" },
];

export function AspnetWebapiPage() {
  return (
    <StackPageShell title="ASP.NET Core Web API" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2802 · Oblig 2
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            ASP.NET Core Web API — REST-endepunkter i C#
          </h1>
          <p className="mt-3 text-muted-foreground">
            Web API er MVC uten viewet. Controllere returnerer JSON (eller andre
            formater) i stedet for HTML. Brukes til REST-tjenester, SPA-backender og
            mobil-API-er. Eksamen og Oblig 2 fokuserer her.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <Link to="/drag" className="text-brand hover:underline">drag-oppgavene</Link>{" "}
              under «ASP.NET Web API» — match HTTP-verb til attributt, action
              results (Ok/NotFound), binding-kilder, CORS-quiz.
            </div>
          </div>
        </div>

        <CourseOutline courseId="aspnet-webapi" steps={STEPS} />

        <section id="vs-mvc" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Web API vs MVC</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Samme stakk, samme middleware-pipeline, samme DI. Bare en annen base­klasse
            og en annen «return-type-filosofi».
          </p>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-32"></th>
                  <th className="text-left font-semibold px-4 py-2">MVC</th>
                  <th className="text-left font-semibold px-4 py-2">Web API</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border"><td className="px-4 py-3 font-medium">Base-klasse</td><td className="px-4 py-3 text-muted-foreground"><code>Controller</code></td><td className="px-4 py-3 text-muted-foreground"><code>ControllerBase</code></td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-medium">Klasse-attributt</td><td className="px-4 py-3 text-muted-foreground">—</td><td className="px-4 py-3 text-muted-foreground"><code>[ApiController]</code></td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-medium">Returnerer</td><td className="px-4 py-3 text-muted-foreground">HTML (View)</td><td className="px-4 py-3 text-muted-foreground">JSON (ActionResult)</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-medium">Routing</td><td className="px-4 py-3 text-muted-foreground">Convention</td><td className="px-4 py-3 text-muted-foreground">Attribute</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-medium">Brukt av</td><td className="px-4 py-3 text-muted-foreground">Browser direkte</td><td className="px-4 py-3 text-muted-foreground">SPA, mobil, andre tjenester</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="controller" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. ControllerBase + [ApiController]</h2>
          <p className="text-sm text-muted-foreground mb-4">
            <code>[ApiController]</code>-attributtet på klassen aktiverer automatisk
            model validation, attribute routing-krav, og bedre feilmeldinger.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`[ApiController]
[Route("api/[controller]")]      // [controller] = "users"  →  /api/users
public class UsersController : ControllerBase
{
    private readonly AppDb _db;
    public UsersController(AppDb db) => _db = db;

    // GET /api/users
    [HttpGet]
    public async Task<ActionResult<IEnumerable<User>>> GetAll()
        => await _db.Users.ToListAsync();

    // GET /api/users/42
    [HttpGet("{id:int}")]
    public async Task<ActionResult<User>> Get(int id)
    {
        var u = await _db.Users.FindAsync(id);
        return u is null ? NotFound() : Ok(u);
    }

    // POST /api/users
    [HttpPost]
    public async Task<ActionResult<User>> Create(User u)
    {
        _db.Users.Add(u);
        await _db.SaveChangesAsync();
        // Returner 201 Created med Location-header til den nye ressursen
        return CreatedAtAction(nameof(Get), new { id = u.Id }, u);
    }

    // PUT /api/users/42
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, User u)
    {
        if (id != u.Id) return BadRequest();
        _db.Entry(u).State = EntityState.Modified;
        await _db.SaveChangesAsync();
        return NoContent();        // 204
    }

    // DELETE /api/users/42
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var u = await _db.Users.FindAsync(id);
        if (u is null) return NotFound();
        _db.Users.Remove(u);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}`}</pre>
          </div>
        </section>

        <section id="routing" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Attribute routing</h2>
          <p className="text-sm text-muted-foreground mb-4">
            I Web API bruker vi attributter på controller og action for å definere
            URL-er eksplisitt. Mer fleksibelt enn convention-routing.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`// Klasse-nivå: prefix for ALLE actions i denne controlleren
[Route("api/[controller]")]              // /api/users
[Route("api/v{version:int}/[controller]")] // /api/v1/users
public class UsersController : ControllerBase
{
    [HttpGet]                            // GET /api/users
    public ... GetAll();

    [HttpGet("{id:int}")]                // GET /api/users/42
    public ... Get(int id);

    [HttpGet("{id:int}/orders")]         // GET /api/users/42/orders
    public ... GetOrders(int id);

    [HttpGet("search")]                  // GET /api/users/search?q=ada
    public ... Search([FromQuery] string q);
}

// Route constraints — typer + validering i selve mønsteret
[HttpGet("{id:int}")]            // bare heltall
[HttpGet("{id:guid}")]           // bare GUID
[HttpGet("{slug:alpha}")]        // bare bokstaver
[HttpGet("{date:datetime}")]     // parseable som DateTime
[HttpGet("{age:int:min(0)}")]    // ikke-negativt heltall`}</pre>
          </div>
        </section>

        <section id="results" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Action results</h2>
          <p className="text-sm text-muted-foreground mb-4">
            <code>ControllerBase</code> har innebygde hjelpe­metoder som returnerer
            de vanligste HTTP-statuskodene. Du skal kjenne disse på rygg­raden.
          </p>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-44">Metode</th>
                  <th className="text-left font-semibold px-4 py-2 w-20">Kode</th>
                  <th className="text-left font-semibold px-4 py-2">Når</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono"><code>Ok(obj)</code></td><td className="px-4 py-3 font-mono">200</td><td className="px-4 py-3 text-muted-foreground">Vellykket GET/PUT med data</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono"><code>CreatedAtAction(...)</code></td><td className="px-4 py-3 font-mono">201</td><td className="px-4 py-3 text-muted-foreground">Vellykket POST som lagde ny ressurs</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono"><code>NoContent()</code></td><td className="px-4 py-3 font-mono">204</td><td className="px-4 py-3 text-muted-foreground">Vellykket PUT/DELETE uten body</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono"><code>BadRequest(...)</code></td><td className="px-4 py-3 font-mono">400</td><td className="px-4 py-3 text-muted-foreground">Klient sendte ugyldig data</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono"><code>Unauthorized()</code></td><td className="px-4 py-3 font-mono">401</td><td className="px-4 py-3 text-muted-foreground">Mangler autentisering</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono"><code>Forbid()</code></td><td className="px-4 py-3 font-mono">403</td><td className="px-4 py-3 text-muted-foreground">Innlogget, men mangler tilgang</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono"><code>NotFound()</code></td><td className="px-4 py-3 font-mono">404</td><td className="px-4 py-3 text-muted-foreground">Ressurs finnes ikke</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono"><code>Conflict()</code></td><td className="px-4 py-3 font-mono">409</td><td className="px-4 py-3 text-muted-foreground">Konflikt (eks. duplikat-nøkkel)</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono"><code>StatusCode(500)</code></td><td className="px-4 py-3 font-mono">500</td><td className="px-4 py-3 text-muted-foreground">Egen feil — sjelden brukt direkte</td></tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`// ActionResult<T> lar deg returnere både T og statuskode
public async Task<ActionResult<User>> Get(int id)
{
    var u = await _db.Users.FindAsync(id);
    if (u is null) return NotFound();         // → 404
    return u;                                  // → 200 OK med JSON
    // Tilsvarende: return Ok(u);
}`}</pre>
          </div>
        </section>

        <section id="binding" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Model binding — hvor kommer data fra?</h2>
          <p className="text-sm text-muted-foreground mb-4">
            ASP.NET binder fra fire mulige kilder. Med <code>[ApiController]</code>
            er default smart: komplekse typer fra <strong>body</strong>, primitive
            fra <strong>route</strong>/<strong>query</strong>.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`// FROM ROUTE — del av URL-mønsteret
[HttpGet("{id:int}")]
public ... Get([FromRoute] int id);   // [FromRoute] er default for route-parameter

// FROM QUERY — query string
[HttpGet]
public ... Search([FromQuery] string q, [FromQuery] int? page = 1);
//                              GET /api/users?q=ada&page=2

// FROM BODY — JSON i request-body (komplekse typer)
[HttpPost]
public ... Create([FromBody] User u);   // [FromBody] er default for klasser

// FROM HEADER — request-header
[HttpGet]
public ... Get([FromHeader(Name = "X-Api-Key")] string apiKey);

// FROM FORM — multipart/form-data (filer)
[HttpPost("upload")]
public ... Upload([FromForm] IFormFile fil);`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Trygg vane:</strong> annoter alltid eksplisitt
            (<code>[FromBody]</code>, <code>[FromQuery]</code>) — gjør koden
            selv­dokumenterende og fjerner tvetydigheter med komplekse typer.
          </p>
        </section>

        <section id="status" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Statuskoder — eksamenstoff</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Hver HTTP-respons har en kode. Velg riktig — semantikken matter.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`2xx — suksess
   200 OK            generisk suksess (GET, PUT med body)
   201 Created       POST opprettet ressurs; Location-header peker på den
   204 No Content    suksess uten body (DELETE, PUT)

3xx — redirect (mindre relevant i API-er)
   301 Moved Permanently
   304 Not Modified  (caching)

4xx — klient-feil
   400 Bad Request   ugyldig syntaks / validering feiler
   401 Unauthorized  mangler eller har ugyldig autentisering
   403 Forbidden     autentisert, men mangler tilgang
   404 Not Found     ressurs finnes ikke
   409 Conflict      konflikt med nåværende state (duplikat)
   422 Unprocessable Entity   semantisk feil (sjelden i .NET — bruk 400)

5xx — server-feil
   500 Internal Server Error  ufanget exception
   502 Bad Gateway            opstrøms-tjeneste feilet
   503 Service Unavailable    midlertidig nede`}</pre>
          </div>
        </section>

        <section id="cors" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. CORS — cross-origin requests</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Browseren blokkerer som default JS-kall til API på et annet origin
            (annet domene/port/protokoll). Du må slippe det inn eksplisitt fra
            API-siden — CORS er en server-side opt-in.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`// Program.cs
builder.Services.AddCors(o => o.AddPolicy("Frontend", p =>
    p.WithOrigins("https://app.example.com")
     .AllowAnyHeader()
     .AllowAnyMethod()
     .AllowCredentials()
));

var app = builder.Build();
app.UseCors("Frontend");     // VIKTIG: før UseAuthorization og MapControllers
app.UseAuthorization();
app.MapControllers();`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Husk rekkefølgen:</strong> middleware kjører i den rekkefølgen
            den registreres. <code>UseCors</code> må komme før
            <code>UseAuthorization</code>, ellers blokkerer auth requesten før
            CORS-headerne legges på.
          </p>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/stack/$slug" params={{ slug: "ef-core" }} className="text-brand hover:underline">
                EF Core
              </Link>{" "}— database-laget bak <code>_db.Users</code>.
              <ArrowRight className="inline h-3.5 w-3.5 ml-1" />
            </li>
            <li>
              <Link to="/drag" className="text-brand hover:underline">Drag-oppgaver</Link>
              {" "}under «ASP.NET Web API»: HttpGet vs HttpPost, ActionResult-quiz,
              binding-kilder, CORS.
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
