import { Link } from "@tanstack/react-router";
import { ArrowRight, Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";

const STEPS = [
  { title: "Hva Blazor er", anchor: "hva" },
  { title: "Server vs WebAssembly", anchor: "modeller" },
  { title: "Components (.razor)", anchor: "components" },
  { title: "@code-blokken", anchor: "code" },
  { title: "Parametere og event binding", anchor: "binding" },
  { title: "EditForm + validation", anchor: "forms" },
  { title: "Når velger du Blazor?", anchor: "valg" },
];

export function BlazorPage() {
  return (
    <StackPageShell title="Blazor" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2802 · Komponent-basert UI
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Blazor — C# i nettleseren (eller via SignalR)
          </h1>
          <p className="mt-3 text-muted-foreground">
            Blazor er Microsofts svar på React: komponent-basert UI bygget i C# og
            Razor i stedet for JavaScript. To kjøre­modeller med veldig ulike
            avveininger: Server (SignalR-tunnel) og WebAssembly (kjører i browseren).
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <Link to="/drag" className="text-brand hover:underline">drag-oppgavene</Link>{" "}
              under «Blazor» — Server vs WASM-quiz, component-anatomi, @onclick-fill.
            </div>
          </div>
        </div>

        <CourseOutline courseId="blazor" steps={STEPS} />

        <section id="hva" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Hva Blazor er</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Tenk React, men i C#. Du bygger UI som <em>components</em> — hver
            component er en <code>.razor</code>-fil med markup på toppen og
            <code>@code</code>-blokk for tilstand og hendelser. Routing,
            state-handtering, data binding — alt er innebygd.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`@* Counter.razor — den klassiske demo-komponenten *@
@page "/counter"

<PageTitle>Teller</PageTitle>

<h1>Teller</h1>
<p>Verdi: @currentCount</p>
<button class="btn btn-primary" @onclick="IncrementCount">
    Klikk meg
</button>

@code {
    private int currentCount = 0;

    private void IncrementCount()
    {
        currentCount++;
    }
}`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Ingen JavaScript trengs.</strong> Klikk-handleren skrives i C#,
            kjøres i C#, og UI-en re-rendrer automatisk når tilstand endres.
          </p>
        </section>

        <section id="modeller" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Server vs WebAssembly</h2>
          <p className="text-sm text-muted-foreground mb-4">
            To måter å kjøre Blazor på. Samme C#-kode, helt ulik runtime-modell.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Blazor Server
              </div>
              <p className="text-sm text-foreground mb-2">
                C# kjører på serveren. UI-endringer sendes til klient over SignalR
                (WebSocket).
              </p>
              <ul className="space-y-1 text-xs text-muted-foreground list-disc pl-5">
                <li>Rask oppstart — minimal download</li>
                <li>Direkte tilgang til DB og server-tjenester</li>
                <li>Krever stabil tilkobling</li>
                <li>Latency følbar over treig WiFi</li>
                <li>Skalering: én sirkulasjon per bruker</li>
              </ul>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Blazor WebAssembly
              </div>
              <p className="text-sm text-foreground mb-2">
                .NET-runtime kompileres til WASM og lastes ned til browser. C#
                kjører i klienten.
              </p>
              <ul className="space-y-1 text-xs text-muted-foreground list-disc pl-5">
                <li>Treg første-last (laster ned .NET runtime)</li>
                <li>Etter det: alt offline-fungerer</li>
                <li>Må snakke med backend over HTTP/JSON</li>
                <li>Kan kjøres som statisk fil (CDN)</li>
                <li>Mest sammenliknbar med React/Vue/Angular</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Server:
  Browser ──(klikk)──► SignalR ──► Blazor (på server) ──► render diff
                                       │
                                       └─► UPDATE i SignalR ──► browser patcher DOM

WebAssembly:
  Browser laster ned .dll-er + dotnet.wasm
  Klikk → C# kjører LOKALT i browseren → DOM oppdateres direkte
  Kall til API: HttpClient → server (samme som SPA)`}</pre>
          </div>
        </section>

        <section id="components" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Components (.razor)</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Hver komponent er en <code>.razor</code>-fil. Filnavnet blir
            klassenavnet. Komponenter brukes med HTML-aktig syntaks fra andre
            komponenter.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`@* BookCard.razor — gjenbrukbar komponent *@
<div class="card">
    <h3>@Title</h3>
    <p>@Author</p>
    <button @onclick="OnSelect">Velg</button>
</div>

@code {
    [Parameter] public string Title { get; set; } = "";
    [Parameter] public string Author { get; set; } = "";
    [Parameter] public EventCallback OnSelect { get; set; }
}

@* Bruk i en annen komponent *@
<BookCard Title="1984"
          Author="Orwell"
          OnSelect="HandleSelect" />

@code {
    private void HandleSelect()
    {
        Console.WriteLine("Valgt!");
    }
}`}</pre>
          </div>
        </section>

        <section id="code" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. @code-blokken</h2>
          <p className="text-sm text-muted-foreground mb-4">
            All C#-logikk i en komponent ligger i <code>@code {`{ }`}</code>.
            Du kan også flytte den ut til en code-behind-fil
            (<code>BookCard.razor.cs</code>) hvis det blir mye.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`@page "/books"
@inject HttpClient Http
@inject NavigationManager Nav

<h1>Bøker</h1>
@if (books == null)
{
    <p>Laster...</p>
}
else
{
    <ul>
    @foreach (var b in books)
    {
        <li>@b.Tittel</li>
    }
    </ul>
}

@code {
    private List<Book>? books;

    // Livssyklus-metoder — kjøres når komponenten lastes
    protected override async Task OnInitializedAsync()
    {
        books = await Http.GetFromJsonAsync<List<Book>>("api/books");
    }

    // Andre livssyklus-hooks:
    // OnParametersSetAsync   — etter parametere er satt
    // OnAfterRenderAsync     — etter rendering (for JS-interop)

    private record Book(int Id, string Tittel);
}`}</pre>
          </div>
        </section>

        <section id="binding" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Parametere og event binding</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Three-way: parametere ned, events opp, two-way binding for input-felter.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`@* PARAMETER NED — fra forelder til barn *@
<MinKomponent Tittel="Hei" />

@code {
    [Parameter] public string Tittel { get; set; } = "";
}

@* EVENT OPP — fra barn til forelder via EventCallback *@
<MinKomponent OnLagre="HandterLagre" />

@code {
    [Parameter] public EventCallback<string> OnLagre { get; set; }

    private async Task TriggLagre()
    {
        await OnLagre.InvokeAsync("data");
    }
}

@* TWO-WAY BINDING — @bind for input-felter *@
<input @bind="navn" />
<input @bind="navn" @bind:event="oninput" />  @* oppdater per tastetrykk *@
<p>Hei, @navn!</p>

@code {
    private string navn = "";
}

@* EVENT HANDLERS *@
<button @onclick="OnKlikk">Klikk</button>
<button @onclick="@(() => Count++)">Inline lambda</button>
<input @onchange="HandterEndring" />
<form @onsubmit="HandterSubmit">...</form>

@code {
    private int Count = 0;
    private void OnKlikk() { ... }
    private void HandterEndring(ChangeEventArgs e) { ... }
}`}</pre>
          </div>
        </section>

        <section id="forms" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. EditForm + validation</h2>
          <p className="text-sm text-muted-foreground mb-4">
            <code>EditForm</code> kobler en C#-modell til et HTML-skjema med
            innebygd validering basert på samme validation-attributter som i MVC.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`@page "/books/new"

<h1>Ny bok</h1>

<EditForm Model="@model" OnValidSubmit="HandleSubmit">
    <DataAnnotationsValidator />
    <ValidationSummary />

    <div>
        <label>Tittel</label>
        <InputText @bind-Value="model.Tittel" />
        <ValidationMessage For="@(() => model.Tittel)" />
    </div>

    <div>
        <label>År</label>
        <InputNumber @bind-Value="model.Ar" />
        <ValidationMessage For="@(() => model.Ar)" />
    </div>

    <button type="submit">Lagre</button>
</EditForm>

@code {
    private BookDto model = new();

    private async Task HandleSubmit()
    {
        // Kalles bare hvis ALLE valideringer passerer
        await Http.PostAsJsonAsync("api/books", model);
    }

    public class BookDto
    {
        [Required(ErrorMessage = "Tittel påkrevd")]
        [StringLength(200)]
        public string Tittel { get; set; } = "";

        [Range(1450, 2100)]
        public int Ar { get; set; } = 2024;
    }
}`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Innebygde input-komponenter:</strong> <code>InputText</code>,
            <code>InputNumber</code>, <code>InputDate</code>, <code>InputCheckbox</code>,
            <code>InputSelect</code>, <code>InputTextArea</code>. Alle støtter
            <code> @bind-Value</code> for two-way binding mot modellen.
          </p>
        </section>

        <section id="valg" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Når velger du Blazor?</h2>
          <div className="space-y-3 text-sm">
            <div className="rounded-lg border border-border bg-card p-4">
              <strong className="text-foreground">Du allerede har C#-team</strong> og
              vil unngå å vedlikeholde TypeScript/React i tillegg. Stort
              produktivitetshopp for back-end-utviklere som flyttes til frontend.
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <strong className="text-foreground">Intern bedriftsapp</strong> —
              forutsigbart antall brukere, stabil tilkobling. Blazor Server skinner.
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <strong className="text-foreground">Offline-fungerende SPA</strong> der
              du vil dele kode/modeller med backend. Blazor WebAssembly.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>Mindre velegnet:</strong> publikumsrettede sider der
              ytelse­budsjettet er knapt (WASM-bundle stort) og SEO matter mye
              (selv om SSR finnes).
            </div>
          </div>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Tilbake til hub</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte-2802" }} className="text-brand hover:underline">
                DTE-2802-hub
              </Link>{" "}— alle fem mini-kurs og .NET-stakk-cheatsheet.
              <ArrowRight className="inline h-3.5 w-3.5 ml-1" />
            </li>
            <li>
              <Link to="/drag" className="text-brand hover:underline">Drag-oppgaver</Link>
              {" "}under «Blazor»: Server vs WASM, component-match, @code-fill.
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
