import { Link } from "@tanstack/react-router";
import { ArrowRight, Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";

const STEPS = [
  { title: "Retrofit i bildet", anchor: "intro" },
  { title: "API-interface med suspend", anchor: "interface" },
  { title: "Retrofit-bygging", anchor: "build" },
  { title: "JSON-parsing — Moshi/Gson/kotlinx", anchor: "json" },
  { title: "OkHttp og interceptors", anchor: "okhttp" },
  { title: "Feilhåndtering", anchor: "feil" },
  { title: "Tillatelser — INTERNET og runtime perms", anchor: "tillatelser" },
];

export function ApiRetrofitPage() {
  return (
    <StackPageShell title="API-kall med Retrofit" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2603 · Nettverk
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Retrofit — HTTP-API-kall på Android
          </h1>
          <p className="mt-3 text-muted-foreground">
            Retrofit er det dominerende biblioteket for å kalle REST-API-er på Android.
            Du skriver et Kotlin-interface, Retrofit genererer implementasjonen som gjør
            HTTP, parser JSON og leverer typede objekter tilbake.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Stack-en:</span> OkHttp gjør selve
              HTTP-jobben (sockets, tilkoblings-pool). Retrofit er et lag oppå som
              gjør interface-til-HTTP-magien. Moshi (eller Gson, kotlinx.serialization)
              parser JSON til data classes.
            </div>
          </div>
        </div>

        <CourseOutline courseId="api-retrofit" steps={STEPS} />

        <section id="intro" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Retrofit i bildet</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Den moderne nettverks-stacken på Android er tre lag som spiller sammen:
          </p>
          <div className="rounded-xl border-2 border-brand/40 bg-brand/5 p-5 mb-4">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`+──────────────────────────────────────+
│  RETROFIT                            │
│  - interface → implementasjon        │
│  - @GET, @POST, @Path, @Query        │
│  - suspend-funksjoner                │
+──────────────────────────────────────+
│  CONVERTER (Moshi / Gson / kotlinx)  │
│  - JSON ↔ Kotlin-objekter            │
+──────────────────────────────────────+
│  OkHttp                              │
│  - sockets, HTTP/1.1 og /2           │
│  - connection-pool, retry            │
│  - INTERCEPTORS (logging, auth)      │
+──────────────────────────────────────+
│  TCP/IP socket                       │
+──────────────────────────────────────+`}</pre>
          </div>
          <p className="text-xs text-muted-foreground">
            <strong>HVORFOR ikke skrive nettverk fra bunn:</strong> du må håndtere
            sockets, redirects, gzip, TLS, retry, connection-pool, og parsing — alt
            allerede løst av disse bibliotekene. Bruk dem.
          </p>
        </section>

        <section id="interface" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. API-interface med suspend</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Du beskriver API-et som et Kotlin-interface. Hver metode tagges med en
            HTTP-annotasjon. Retrofit genererer implementasjonen i runtime.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`// Data class som matcher JSON-strukturen:
data class BrukerDto(
    val id: Long,
    val navn: String,
    val epost: String,
)

interface BrukerApi {

    // GET https://api.eksempel.no/brukere
    @GET("brukere")
    suspend fun alle(): List<BrukerDto>

    // GET https://api.eksempel.no/brukere/42
    @GET("brukere/{id}")
    suspend fun en(@Path("id") id: Long): BrukerDto

    // GET https://api.eksempel.no/brukere?aktiv=true&side=2
    @GET("brukere")
    suspend fun søk(
        @Query("aktiv") aktiv: Boolean,
        @Query("side") side: Int,
    ): List<BrukerDto>

    // POST med body
    @POST("brukere")
    suspend fun opprett(@Body bruker: BrukerDto): BrukerDto

    // PUT for full erstatning
    @PUT("brukere/{id}")
    suspend fun erstatt(
        @Path("id") id: Long,
        @Body bruker: BrukerDto,
    ): BrukerDto

    @DELETE("brukere/{id}")
    suspend fun slett(@Path("id") id: Long)

    // Custom headers
    @GET("brukere/meg")
    suspend fun meg(@Header("Authorization") token: String): BrukerDto
}`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>HVORFOR suspend?</strong> Retrofit + coroutines integrerer slik at
            kompilatoren bytter til en bakgrunns-dispatcher under HTTP-kallet, og
            returnerer tilbake med resultat. Du slipper Call/callback-mønsteret.
          </p>
        </section>

        <section id="build" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Retrofit-bygging</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Du bygger én Retrofit-instans per backend, og henter ut interface-en med{" "}
            <code>create()</code>. Singletonen lever appens levetid.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`object Network {

    private val moshi = Moshi.Builder()
        .add(KotlinJsonAdapterFactory())
        .build()

    private val client = OkHttpClient.Builder()
        .addInterceptor(HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY    // log requests i debug
        })
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(15, TimeUnit.SECONDS)
        .build()

    private val retrofit = Retrofit.Builder()
        .baseUrl("https://api.eksempel.no/")             // MÅ slutte med /
        .client(client)
        .addConverterFactory(MoshiConverterFactory.create(moshi))
        .build()

    val brukerApi: BrukerApi = retrofit.create(BrukerApi::class.java)
}

// Bruk fra Repository:
class BrukerRepository {
    suspend fun hent(): List<Bruker> =
        Network.brukerApi.alle().map { dto ->
            Bruker(id = dto.id, navn = dto.navn, epost = dto.epost)
        }
}`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>HVORFOR mappe DTO → domene-objekt?</strong> JSON-strukturen kan
            endre seg (server-team gjør hva de vil). Hvis du bruker DTO-en direkte i
            UI-en, sprer du endringer overalt. Mapper du i Repository, er det ett sted
            å fikse.
          </p>
        </section>

        <section id="json" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">
            4. JSON-parsing — Moshi/Gson/kotlinx.serialization
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Tre dominerende biblioteker. Du velger ett — alle gjør samme jobb (JSON ↔
            Kotlin-objekter), men ulik filosofi.
          </p>
          <div className="overflow-hidden rounded-lg border border-border mb-4">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-3 py-2 w-44">Bibliotek</th>
                  <th className="text-left font-semibold px-3 py-2">Karakter</th>
                  <th className="text-left font-semibold px-3 py-2">Når bruke</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono">Moshi</td>
                  <td className="px-3 py-2 text-muted-foreground">Square, Kotlin-first</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    Anbefalt for ny Android-kode — null-safety, codegen
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono">Gson</td>
                  <td className="px-3 py-2 text-muted-foreground">Google, eldre</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    Mange eksisterende prosjekter — Java-arv, treffer ikke null-safety perfekt
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono">kotlinx.serialization</td>
                  <td className="px-3 py-2 text-muted-foreground">JetBrains, multiplattform</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    KMP-prosjekter, fullt compile-time-typed
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`// ----- Moshi -----
@JsonClass(generateAdapter = true)
data class BrukerDto(
    val id: Long,
    val navn: String,
    @Json(name = "email_address") val epost: String,   // map JSON-feltnavn
)

// ----- Gson -----
data class BrukerDto(
    val id: Long,
    val navn: String,
    @SerializedName("email_address") val epost: String,
)

// ----- kotlinx.serialization -----
@Serializable
data class BrukerDto(
    val id: Long,
    val navn: String,
    @SerialName("email_address") val epost: String,
)`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>HVORFOR mappe feltnavn?</strong> JSON-konvensjoner (snake_case)
            matcher ikke Kotlin-konvensjoner (camelCase). I stedet for å bruke
            stygge feltnavn i Kotlin, beholder vi camelCase og forteller serializeren
            hva JSON kaller feltet.
          </p>
        </section>

        <section id="okhttp" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. OkHttp og interceptors</h2>
          <p className="text-sm text-muted-foreground mb-4">
            OkHttp er HTTP-klienten under Retrofit. Den eksponerer{" "}
            <em>interceptors</em> — middleware-lignende håndteringer som kan logge,
            legge på headers, retry, eller cache.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`// Auth-interceptor: legg på "Authorization: Bearer ..." på hver request
class AuthInterceptor(private val tokenStore: TokenStore) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val original = chain.request()
        val token = tokenStore.get() ?: return chain.proceed(original)

        val ny = original.newBuilder()
            .addHeader("Authorization", "Bearer \$token")
            .build()

        return chain.proceed(ny)
    }
}

val client = OkHttpClient.Builder()
    .addInterceptor(AuthInterceptor(tokenStore))
    .addInterceptor(HttpLoggingInterceptor().apply {
        level = if (BuildConfig.DEBUG) Level.BODY else Level.NONE
    })
    .build()`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>HVORFOR interceptors?</strong> Du vil legge auth-headeren på HVERT
            kall — uten å gjenta deg selv i hvert API-interface. Interceptors gjør det
            sentralt og generisk.
          </p>
        </section>

        <section id="feil" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Feilhåndtering</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Nettverk feiler. Telefonen mister signal, serveren er nede, JSON-en endret
            form. Du må håndtere både HTTP-statuskoder OG IO-feil.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`sealed class ApiResultat<out T> {
    data class Ok<T>(val data: T) : ApiResultat<T>()
    data class Feil(val melding: String, val kode: Int? = null) : ApiResultat<Nothing>()
}

class BrukerRepository {
    suspend fun hent(): ApiResultat<List<Bruker>> = try {
        val dto = Network.brukerApi.alle()
        ApiResultat.Ok(dto.map { it.tilDomene() })
    } catch (e: HttpException) {
        // Retrofit kaster HttpException for ikke-2xx svar
        ApiResultat.Feil("Server-feil: \${e.code()}", e.code())
    } catch (e: IOException) {
        // IOException dekker timeout, no-internet, DNS-feil
        ApiResultat.Feil("Ingen forbindelse")
    } catch (e: JsonDataException) {
        // Moshi når JSON ikke matcher data class
        ApiResultat.Feil("Uventet svar fra serveren")
    }
}`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>HVORFOR sealed class for resultat?</strong> Du tvinger View til å
            håndtere både Ok og Feil i en uttømmende <code>when</code>. Da kan du ikke
            «glemme» loading-tilstand eller error-melding.
          </p>
        </section>

        <section id="tillatelser" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Tillatelser — INTERNET og runtime perms</h2>
          <p className="text-sm text-muted-foreground mb-4">
            For å gjøre nettverkskall trenger appen <code>INTERNET</code>-tillatelsen i
            manifestet. Det er en <em>normal</em> tillatelse — den gis automatisk når
            appen installeres.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`<!-- AndroidManifest.xml -->
<uses-permission android:name="android.permission.INTERNET" />

<!-- Farlige tillatelser (sjekkes ved RUNTIME, ikke installasjon) -->
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_CONTACTS" />`}</pre>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 mt-4">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`// Runtime-tillatelser — bruker MÅ godkjenne hver gang
class HovedActivity : AppCompatActivity() {

    private val locationLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission(),
    ) { granted ->
        if (granted) {
            startLocationUpdates()
        } else {
            visMelding("Trenger lokasjon for denne funksjonen")
        }
    }

    fun trengerLokasjon() {
        when {
            ContextCompat.checkSelfPermission(
                this, Manifest.permission.ACCESS_FINE_LOCATION,
            ) == PackageManager.PERMISSION_GRANTED -> {
                startLocationUpdates()
            }
            shouldShowRequestPermissionRationale(Manifest.permission.ACCESS_FINE_LOCATION) -> {
                // Bruker har sagt nei før — forklar HVORFOR vi trenger det
                visForklaring()
            }
            else -> {
                locationLauncher.launch(Manifest.permission.ACCESS_FINE_LOCATION)
            }
        }
    }
}`}</pre>
          </div>
          <div className="mt-4 overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-32">Type</th>
                  <th className="text-left font-semibold px-4 py-2">Eksempler</th>
                  <th className="text-left font-semibold px-4 py-2">Når gis</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-medium">Normal</td>
                  <td className="px-4 py-3 text-muted-foreground">INTERNET, VIBRATE, ACCESS_NETWORK_STATE</td>
                  <td className="px-4 py-3 text-muted-foreground">Ved installasjon</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-medium">Farlig</td>
                  <td className="px-4 py-3 text-muted-foreground">CAMERA, LOCATION, CONTACTS, MICROPHONE</td>
                  <td className="px-4 py-3 text-muted-foreground">Bruker spørres ved runtime</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-medium">Spesielle</td>
                  <td className="px-4 py-3 text-muted-foreground">SYSTEM_ALERT_WINDOW, WRITE_SETTINGS</td>
                  <td className="px-4 py-3 text-muted-foreground">Innstillingsskjerm</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/drag" className="text-brand hover:underline">
                Drag-oppgaver
              </Link>
              : Retrofit-interface-fyll, suspend i Retrofit, error-handling.
            </li>
            <li>
              Tilbake til{" "}
              <Link to="/stack/$slug" params={{ slug: "dte-2603" }} className="text-brand hover:underline">
                DTE-2603-hub
              </Link>
              <ArrowRight className="inline h-3.5 w-3.5 ml-1" />
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
