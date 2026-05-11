import { Link } from "@tanstack/react-router";
import { ArrowRight, Code2, Layers, Server, Database, Cpu, Globe } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";

type Course = {
  slug: string;
  title: string;
  shortDescription: string;
  Icon: typeof Code2;
  status: "ready" | "coming-soon";
};

const COURSES: Course[] = [
  {
    slug: "csharp-grunnlag",
    title: "C# språk-grunnlag",
    shortDescription:
      "Typer, classes vs records, properties, LINQ, async/await, nullable reference types. Det språket alt resten i .NET er skrevet i.",
    Icon: Code2,
    status: "ready",
  },
  {
    slug: "aspnet-mvc",
    title: "ASP.NET Core MVC",
    shortDescription:
      "Model/View/Controller, Razor (.cshtml), routing, model binding, validation. Oblig 1.",
    Icon: Layers,
    status: "ready",
  },
  {
    slug: "aspnet-webapi",
    title: "ASP.NET Core Web API",
    shortDescription:
      "ControllerBase, [HttpGet/Post], action results, attribute routing, status codes. Oblig 2.",
    Icon: Server,
    status: "ready",
  },
  {
    slug: "ef-core",
    title: "Entity Framework Core",
    shortDescription:
      "DbContext + DbSet, code-first migrations, LINQ-til-SQL, relasjoner, tracking. ORM-en .NET-verdenen lever av.",
    Icon: Database,
    status: "ready",
  },
  {
    slug: "blazor",
    title: "Blazor (Server / WebAssembly)",
    shortDescription:
      "Components (.razor), @code-blokker, parametere, event binding, EditForm. C# i nettleseren.",
    Icon: Globe,
    status: "ready",
  },
];

export function Dte2802Hub() {
  return (
    <StackPageShell title="DTE-2802 Web Applikasjoner 2" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-10">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2802 · 10 stp · UiT
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Web Applikasjoner 2 — C#, ASP.NET, Blazor
          </h1>
          <p className="mt-3 text-muted-foreground max-w-2xl">
            Konsept- og syntaks-tunge mini-kurs som dekker pensum: C#-språk, ASP.NET
            MVC (Oblig 1), ASP.NET Web API (Oblig 2), Entity Framework Core og Blazor.
            Vi kjører IKKE C# i nettleseren — fokus er forståelse, kjenne syntaks og
            .NET-konvensjoner igjen, og kunne lese kode som «det der gjør sånn».
          </p>
        </div>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">.NET-stakken — én side</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Alt henger sammen rundt to ting: en HTTP-pipeline med middleware, og
            dependency injection (DI) overalt. Lær lagene utenat — så blir resten
            «hvilken klasse hooker du inn hvor».
          </p>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-44">Lag</th>
                  <th className="text-left font-semibold px-4 py-2">Hva det gjør</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">Program.cs</td><td className="px-4 py-3 text-muted-foreground">Bootstrap: bygg WebApplication, registrer services, bygg middleware-pipeline</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">Middleware</td><td className="px-4 py-3 text-muted-foreground">Pipeline av delegat-funksjoner som ser HVER request: auth, logging, statiske filer, routing</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">Routing</td><td className="px-4 py-3 text-muted-foreground">Map URL → controller-action eller endpoint. Attribute-basert eller convention-basert.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">Controllers</td><td className="px-4 py-3 text-muted-foreground">MVC: returnerer View. Web API: returnerer JSON via ActionResult.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">Services (DI)</td><td className="px-4 py-3 text-muted-foreground">Forretningslogikk injisert via konstruktør. Levetid: Singleton / Scoped / Transient.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">EF Core</td><td className="px-4 py-3 text-muted-foreground">DbContext → DbSet&lt;T&gt;. LINQ over DbSet blir til SQL.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">Views / Blazor</td><td className="px-4 py-3 text-muted-foreground">Razor (.cshtml) i MVC, eller Razor-components (.razor) i Blazor.</td></tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Konvensjon over konfigurasjon:</strong> .NET er ekstremt attribut-
            og navnekonvensjon-drevet. <code>UsersController</code> håndterer
            automatisk URL <code>/Users</code>. En metode <code>Index()</code> matcher
            <code>/Users/Index</code>. Dette er ikke magi — det er bare default route-
            mønsteret <code>{`{controller=Home}/{action=Index}/{id?}`}</code>.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Cheatsheet — viktige attributter</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`// ROUTING (Web API)
[Route("api/[controller]")]      // /api/users
[HttpGet("{id:int}")]            // GET /api/users/42
[HttpPost]                       // POST /api/users  (body)

// MODEL VALIDATION
[Required]                       // ikke null/tom
[StringLength(50)]               // maks 50 tegn
[Range(1, 100)]                  // tall i intervall
[EmailAddress]                   // gyldig e-post
[RegularExpression("^[A-Z]+$")]  // egendefinert regex

// EF CORE
[Key]                            // primary key
[ForeignKey("UserId")]           // peker på fk-kolonne
[Required]                       // NOT NULL i DB-tabellen

// MVC
[HttpGet] [HttpPost]             // begrens metode
[ValidateAntiForgeryToken]       // CSRF-beskyttelse i forms
[Authorize]                      // krever innlogging
[Authorize(Roles = "Admin")]     // krever rolle

// DI (i Program.cs)
builder.Services.AddSingleton<IFoo, Foo>();   // én instans hele livet
builder.Services.AddScoped<IBar, Bar>();      // én per HTTP-request
builder.Services.AddTransient<IBaz, Baz>();   // ny hver gang den injiseres`}</pre>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Mini-kurs</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {COURSES.map((c) => {
              const isReady = c.status === "ready";
              const Icon = c.Icon;
              if (!isReady) {
                return (
                  <div key={c.slug} className="rounded-xl border border-border bg-card/30 p-5 opacity-60">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <h3 className="font-semibold text-foreground leading-tight">{c.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{c.shortDescription}</p>
                  </div>
                );
              }
              return (
                <Link
                  key={c.slug}
                  to="/stack/$slug"
                  params={{ slug: c.slug }}
                  className="group rounded-xl border border-border bg-card hover:border-brand/40 p-5 transition-colors block"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-4 w-4 text-brand" />
                    <h3 className="font-semibold text-foreground leading-tight">{c.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{c.shortDescription}</p>
                  <div className="mt-3 flex items-center text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                    Åpne
                    <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Pensum-mapping</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <strong className="text-foreground">Oblig 1 (MVC):</strong>{" "}
              <Link to="/stack/$slug" params={{ slug: "aspnet-mvc" }} className="text-brand hover:underline">ASP.NET Core MVC</Link>
              {" "}+ Razor + model binding + validation. Du trenger også
              {" "}<Link to="/stack/$slug" params={{ slug: "csharp-grunnlag" }} className="text-brand hover:underline">C#-grunnlag</Link>.
            </li>
            <li>
              <strong className="text-foreground">Oblig 2 (Web API):</strong>{" "}
              <Link to="/stack/$slug" params={{ slug: "aspnet-webapi" }} className="text-brand hover:underline">Web API</Link>
              {" "}+{" "}
              <Link to="/stack/$slug" params={{ slug: "ef-core" }} className="text-brand hover:underline">EF Core</Link>
              {" "}for database-tilgang.
            </li>
            <li>
              <strong className="text-foreground">Prosjekt:</strong> typisk Blazor- eller
              MVC-app med EF Core, ofte med autentisering via ASP.NET Identity.
              {" "}<Link to="/stack/$slug" params={{ slug: "blazor" }} className="text-brand hover:underline">Blazor</Link>.
            </li>
            <li>
              <strong className="text-foreground">Drag-oppgaver:</strong> filter på «Web Applikasjoner 2» i{" "}
              <Link to="/drag" className="text-brand hover:underline">/drag</Link>.
            </li>
          </ul>
        </div>

        <div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/5 p-5 text-sm">
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="h-4 w-4 text-amber-500" />
            <h2 className="font-semibold">Hvorfor ingen kjørbar kode?</h2>
          </div>
          <p className="text-muted-foreground">
            C#/.NET trenger en .NET-runtime — kan ikke kjøres i nettleseren slik vi
            kjører Python via Pyodide eller SQL via sql.js. Hele kurset er
            <strong> konsept- og syntaks-tungt</strong>: les snippets, gjør drag-
            oppgaver, og åpne Visual Studio / Rider når du faktisk skal kompilere.
            Mål: kjenne igjen <code>[Authorize]</code>, <code>IActionResult</code> og
            <code>DbContext</code> uten å måtte slå opp.
          </p>
        </div>
      </div>
    </StackPageShell>
  );
}
