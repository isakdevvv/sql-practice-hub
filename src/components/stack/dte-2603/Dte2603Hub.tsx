import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Smartphone,
  Boxes,
  Database,
  Workflow,
  Wifi,
  Layers3,
  Code2,
} from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";

type Course = {
  slug: string;
  title: string;
  shortDescription: string;
  Icon: typeof Smartphone;
  status: "ready" | "coming-soon";
};

const COURSES: Course[] = [
  {
    slug: "kotlin-grunnlag",
    title: "Kotlin-grunnlag",
    shortDescription:
      "val vs var, null safety (?, !!, ?.), data classes, lambdas, scope-funksjoner og collections — det språket Android-koden faktisk er skrevet i.",
    Icon: Code2,
    status: "ready",
  },
  {
    slug: "android-grunnlag",
    title: "Android-grunnlag",
    shortDescription:
      "Aktiviteter, fragmenter, livssyklus (onCreate/onStart/...), AndroidManifest, Gradle og R-fila. Hvordan en Android-app er bygd opp.",
    Icon: Smartphone,
    status: "ready",
  },
  {
    slug: "mvvm-arkitektur",
    title: "MVVM-arkitektur",
    shortDescription:
      "Model-View-ViewModel, LiveData/StateFlow, observable patterns. Hvorfor Android-teamet anbefaler MVVM over MVC for moderne apper.",
    Icon: Layers3,
    status: "ready",
  },
  {
    slug: "korutiner",
    title: "Korutiner og flertråd",
    shortDescription:
      "suspend-funksjoner, launch/async, scopes (viewModelScope), Dispatchers (Main/IO/Default) og structured concurrency.",
    Icon: Workflow,
    status: "ready",
  },
  {
    slug: "room-recycler",
    title: "Room og RecyclerView",
    shortDescription:
      "Lokal database med Room (Entity/DAO/Database), skalerbare lister med RecyclerView (Adapter/ViewHolder/DiffUtil).",
    Icon: Database,
    status: "ready",
  },
  {
    slug: "api-retrofit",
    title: "API-kall med Retrofit",
    shortDescription:
      "Retrofit-interface med suspend, JSON-parsing (Moshi/Gson), error handling og OkHttp-interceptors.",
    Icon: Wifi,
    status: "ready",
  },
];

export function Dte2603Hub() {
  return (
    <StackPageShell title="DTE-2603 Programmering for mobil" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-10">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2603 · 10 stp · Android med Kotlin
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Programmering for mobil
          </h1>
          <p className="mt-3 text-muted-foreground max-w-2xl">
            Mini-kurs som dekker UiT-pensum: Kotlin som språk, Android-livssyklus,
            MVVM, korutiner, lokal database (Room), lister (RecyclerView) og
            nett-API-kall (Retrofit). Kotlin kjører ikke i nettleseren — dette er et
            konsept- og syntaks-kurs, så hver side er rik på kode-eksempler du må kunne
            lese.
          </p>
        </div>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Lagene i en Android-app</h2>
          <p className="text-sm text-muted-foreground mb-4">
            En moderne Android-app er delt i klare lag. Lær lagdelingen først — så blir
            hvert mini-kurs lettere å plassere.
          </p>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-40">Lag</th>
                  <th className="text-left font-semibold px-4 py-2">Hva det gjør</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">UI (View)</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    Activity, Fragment eller Compose-funksjoner — tegner og lytter på input
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">ViewModel</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    Holder skjerm-tilstand, overlever rotasjon, eksponerer LiveData/StateFlow
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">Repository</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    Eneste sannhetskilde — slår sammen lokal DB og nettverk
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">Data sources</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    Room (lokal DB), Retrofit (HTTP-API), SharedPreferences
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">Coroutines</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    Trådhåndtering — IO og DB skjer aldri på Main-tråden
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Hovedregel:</strong> View vet om ViewModel, ViewModel vet om
            Repository, Repository vet om data-kildene. Pilen peker aldri den andre veien
            — det er det som gjør laggene løskoblet og testbare.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Kotlin-cheatsheet</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Den absolutte minste Kotlin-syntaksen du trenger for å kunne lese
            Android-kode. Hver del er forklart grundigere i Kotlin-grunnlag.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`// Variabler ------------------------------------------------------
val pi = 3.14                       // val = immutable (kan IKKE reassignes)
var teller = 0                      // var = mutable (kan reassignes)
val navn: String = "Kari"           // eksplisitt type, men ofte unødvendig
val alder: Int? = null              // ? = nullable type

// Funksjoner -----------------------------------------------------
fun sum(a: Int, b: Int): Int {
    return a + b
}
fun dobbel(x: Int) = x * 2          // single-expression — type inferert

// Klasser og data classes ----------------------------------------
class Bil(val merke: String, var fart: Int)              // primary constructor
data class Bruker(val id: Long, val navn: String)        // får equals/hashCode/copy gratis

// Null safety ----------------------------------------------------
val s: String? = hentNavn()
val lengde = s?.length              // safe call → returnerer null hvis s er null
val lengde2 = s?.length ?: 0        // Elvis: null → bruk default
// val lengde3 = s!!.length         // !! = "kræsj hvis null" — UNNGÅ

// Lambdas og scope-funksjoner ------------------------------------
listOf(1, 2, 3).map { it * 2 }      // → [2, 4, 6]
bruker?.let { lagre(it) }           // kjør blokk hvis ikke null
config.apply { timeout = 30 }       // konfigurer objekt, returnerer det

// Collections ----------------------------------------------------
val tall = listOf(1, 2, 3, 4)
tall.filter { it > 2 }.map { it * 10 }     // → [30, 40]`}</pre>
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
                  <div
                    key={c.slug}
                    className="rounded-xl border border-border bg-card/30 p-5 opacity-60"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <h3 className="font-semibold text-foreground leading-tight">
                        {c.title}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {c.shortDescription}
                    </p>
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
                    <h3 className="font-semibold text-foreground leading-tight">
                      {c.title}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {c.shortDescription}
                  </p>
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
          <h2 className="font-semibold mb-2 flex items-center gap-2">
            <Boxes className="h-4 w-4 text-brand" />
            Hvor passer dette inn?
          </h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <strong className="text-foreground">Drag-oppgaver:</strong> filter på
              «Mobil» i{" "}
              <Link to="/drag" className="text-brand hover:underline">
                /drag
              </Link>{" "}
              — ca. 30 oppgaver om Kotlin, livssyklus, MVVM, korutiner og Retrofit.
            </li>
            <li>
              <strong className="text-foreground">Ingen kjøre-motor:</strong> Kotlin
              krever JVM/Android, så du må kjøre kode i Android Studio. På denne siden
              er fokus på syntaks, mønstre og forklaring.
            </li>
            <li>
              <strong className="text-foreground">Forbindelse til andre fag:</strong>{" "}
              MVVM bygger på samme separasjon-av-ansvar som vi så i{" "}
              <Link to="/stack/$slug" params={{ slug: "flask-livssyklus" }} className="text-brand hover:underline">
                Flask-livssyklus
              </Link>
              ; Room er bare SQLite under panseret.
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
