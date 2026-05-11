import { Link } from "@tanstack/react-router";
import { ArrowRight, Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";

const STEPS = [
  { title: "val vs var — hvorfor val er default", anchor: "val-var" },
  { title: "Null safety — ?, !!, ?., Elvis", anchor: "null-safety" },
  { title: "Data classes", anchor: "data-class" },
  { title: "Funksjoner og lambdas", anchor: "lambdas" },
  { title: "Scope-funksjoner — let/run/apply/also/with", anchor: "scope" },
  { title: "Collections — map/filter/forEach", anchor: "collections" },
  { title: "Klasser og arv (kort)", anchor: "klasser" },
];

export function KotlinGrunnlagPage() {
  return (
    <StackPageShell title="Kotlin-grunnlag" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2603 · Språk
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Kotlin-grunnlag — språket Android-koden faktisk er skrevet i
          </h1>
          <p className="mt-3 text-muted-foreground">
            Kotlin er det offisielle Android-språket (anbefalt av Google siden 2019).
            Det kjører på JVM og samvirker med Java, men er strammere på null-håndtering
            og mer kortfattet. Denne siden går gjennom syntaksen du må kunne for å lese
            Android-kode.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Kontekst:</span> Kotlin kjører ikke i
              nettleseren — alle eksempler her er for lesing/forståelse. For å kjøre
              dem trenger du Android Studio eller{" "}
              <code>kotlinc</code> på terminalen.
            </div>
          </div>
        </div>

        <CourseOutline courseId="kotlin-grunnlag" steps={STEPS} />

        <section id="val-var" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. val vs var — hvorfor val er default</h2>
          <p className="text-sm text-muted-foreground mb-4">
            I Kotlin må du være eksplisitt om en variabel kan endres. <code>val</code>{" "}
            (value) gir et navn til en uforanderlig referanse, <code>var</code> (variable)
            gir en foranderlig. Brukbar regel: skriv alltid <code>val</code> først, bytt
            til <code>var</code> kun hvis du faktisk MÅ reassigne.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`val pi = 3.14
// pi = 3.15        // KOMPILERINGSFEIL: val cannot be reassigned

var teller = 0
teller = 1          // OK — var er mutable
teller += 1         // OK

// Type inferes fra høyresida — men du kan også skrive den eksplisitt:
val navn: String = "Kari"
val alder: Int = 30

// Late init for klassemedlemmer du fyller senere (typisk i onCreate):
lateinit var binding: ActivityMainBinding

// Computed property — kjører blokken hver gang du leser den:
val nesteId: Int get() = (siste?.id ?: 0) + 1`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>HVORFOR:</strong> <code>val</code> som default gjør koden lettere å
            resonnere om — du ser ved et blikk hvilke variabler som kan endre seg.
            Det er den samme tankegangen som <code>const</code> i moderne JavaScript.
          </p>
        </section>

        <section id="null-safety" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Null safety — ?, !!, ?., Elvis</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Kotlin skiller mellom typer som <em>kan</em> være null og typer som ikke kan.
            Det fjerner hele kategorien NullPointerException som Java sliter med — så
            sant du ikke bruker <code>!!</code> for å overstyre.
          </p>
          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`// Ikke-nullable (default):
var navn: String = "Kari"
// navn = null              // KOMPILERINGSFEIL

// Nullable — bare lov ved spørsmålstegn:
var kanskje: String? = null
kanskje = "hei"             // OK

// ----- Tilgang til medlemmer på nullable: -----
val s: String? = hentNavn()

// 1) Safe-call ?. — returnerer null hvis s er null
val len = s?.length         // Int? (kan være null)

// 2) Elvis ?: — gi en default når venstre er null
val len2 = s?.length ?: 0   // Int (0 hvis null)

// 3) Sikkerhetsnett: let kjører bare hvis ikke null
s?.let {
    println("Lengde: \${it.length}")
}

// 4) !! — "jeg lover at den IKKE er null". Krasjer med NPE hvis feil.
//    Unngå dette utenom helt spesielle situasjoner.
val len3 = s!!.length

// ----- Smart cast: -----
fun lengde(x: String?): Int {
    if (x == null) return 0
    return x.length         // kompilatoren VET nå at x ikke er null
}`}</pre>
          </div>
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
            <strong>Tommelfingerregel:</strong> bruk <code>?.</code> og <code>?:</code> i
            99% av tilfellene. <code>!!</code> er en lukt — det betyr at du har et hull
            i designet ditt. I praksis sees <code>!!</code> mest på{" "}
            <code>findViewById</code>-resultater før view binding ble standard.
          </div>
        </section>

        <section id="data-class" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Data classes</h2>
          <p className="text-sm text-muted-foreground mb-4">
            En vanlig klasse for å bære data. Kotlin genererer automatisk{" "}
            <code>equals()</code>, <code>hashCode()</code>, <code>toString()</code>,{" "}
            <code>componentN()</code> og <code>copy()</code> — så du slipper boilerplate
            som plager Java.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`data class Bruker(
    val id: Long,
    val navn: String,
    val epost: String,
)

val a = Bruker(1, "Kari", "k@x.no")
val b = Bruker(1, "Kari", "k@x.no")

println(a == b)         // true — sammenligner FELT-FOR-FELT
println(a.toString())   // Bruker(id=1, navn=Kari, epost=k@x.no)

// copy() — lag en variant med endrede felt (immutable update):
val c = a.copy(navn = "Ola")
// c = Bruker(id=1, navn=Ola, epost=k@x.no)

// Destructuring — pakke ut feltene:
val (id, navn, epost) = a
println("id=\$id navn=\$navn")`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>HVORFOR:</strong> Android-arkitekturen bruker data classes overalt —
            som UI-state, DTO-er fra Retrofit, og Room-entiteter. <code>copy()</code> er
            spesielt nyttig når en StateFlow holder en stor data-klasse og du vil endre
            ett felt.
          </p>
        </section>

        <section id="lambdas" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Funksjoner og lambdas</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Funksjoner er førsteklasses verdier i Kotlin. Lambdas (anonyme funksjoner)
            er kortere enn Javas, og brukes alle steder hvor du leverer en callback.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`// Vanlig funksjon:
fun sum(a: Int, b: Int): Int {
    return a + b
}

// Single-expression funksjon — type inferert fra høyresida:
fun dobbel(x: Int) = x * 2

// Default- og navngitte argumenter:
fun greet(navn: String, hilsen: String = "Hei") = "\$hilsen, \$navn!"
greet("Kari")                       // "Hei, Kari!"
greet(navn = "Ola", hilsen = "Yo")  // "Yo, Ola!"

// Lambda-syntaks: { argumenter -> kropp }
val plus: (Int, Int) -> Int = { a, b -> a + b }
plus(2, 3)                          // 5

// Hvis lambda er SISTE argument til en funksjon, kan den ligge utenfor parentesen:
listOf(1, 2, 3).forEach { tall ->
    println(tall)
}

// 'it' er det implisitte navnet når lambda har én parameter:
listOf(1, 2, 3).map { it * 2 }      // [2, 4, 6]

// Trailing lambda — Compose og Android-callbacks bruker det mye:
button.setOnClickListener {
    println("klikket")
}`}</pre>
          </div>
        </section>

        <section id="scope" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">
            5. Scope-funksjoner — let/run/apply/also/with
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Fem innebygde funksjoner som lar deg kjøre en blokk i konteksten av et
            objekt. De skiller seg i to ting: <strong>hva objektet kalles</strong>{" "}
            inne i blokken (<code>it</code> eller <code>this</code>), og{" "}
            <strong>hva blokken returnerer</strong>.
          </p>
          <div className="overflow-hidden rounded-lg border border-border mb-4">
            <table className="w-full text-xs">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-3 py-2">Funksjon</th>
                  <th className="text-left font-semibold px-3 py-2">Objekt</th>
                  <th className="text-left font-semibold px-3 py-2">Returnerer</th>
                  <th className="text-left font-semibold px-3 py-2">Typisk bruk</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono">let</td>
                  <td className="px-3 py-2 font-mono">it</td>
                  <td className="px-3 py-2">resultatet av blokken</td>
                  <td className="px-3 py-2 text-muted-foreground">null-sjekk + transformasjon</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono">run</td>
                  <td className="px-3 py-2 font-mono">this</td>
                  <td className="px-3 py-2">resultatet av blokken</td>
                  <td className="px-3 py-2 text-muted-foreground">init-blokk med returverdi</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono">apply</td>
                  <td className="px-3 py-2 font-mono">this</td>
                  <td className="px-3 py-2">objektet selv</td>
                  <td className="px-3 py-2 text-muted-foreground">konfigurere et nytt objekt</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono">also</td>
                  <td className="px-3 py-2 font-mono">it</td>
                  <td className="px-3 py-2">objektet selv</td>
                  <td className="px-3 py-2 text-muted-foreground">side-effekter (log, debug)</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono">with</td>
                  <td className="px-3 py-2 font-mono">this</td>
                  <td className="px-3 py-2">resultatet av blokken</td>
                  <td className="px-3 py-2 text-muted-foreground">kalle mange medlemmer på samme objekt</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`// let — null-safe transformasjon
val bruker: Bruker? = hent()
val visningsnavn = bruker?.let {
    "\${it.navn} (\${it.id})"
} ?: "Ukjent"

// apply — bygge opp objekt (i Android: Intent, Bundle, View-config)
val intent = Intent(this, DetailActivity::class.java).apply {
    putExtra("id", id)
    putExtra("navn", navn)
    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
}

// also — side-effekt uten å bryte fluent-kjeden
val tall = liste
    .filter { it > 0 }
    .also { println("Etter filter: \$it") }
    .map { it * 2 }

// run — kjøre blokk og returnere noe
val resultat = bruker?.run {
    "\$navn er \$alder år gammel"
}`}</pre>
          </div>
        </section>

        <section id="collections" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Collections — map/filter/forEach</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Kotlin-collections (List, Set, Map) har et stort sett av funksjonelle
            metoder — de samme du finner i moderne JavaScript-arrays. De er{" "}
            <strong>ikke late</strong> som default; bruk <code>asSequence()</code> for
            lat evaluering på store datasett.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`val tall = listOf(1, 2, 3, 4, 5)

// map — transformer hvert element
tall.map { it * 2 }                 // [2, 4, 6, 8, 10]

// filter — behold elementer som passer
tall.filter { it % 2 == 0 }         // [2, 4]

// forEach — kjør en side-effekt
tall.forEach { println(it) }

// kjeding — vanlig i Android
brukere
    .filter { it.aktiv }
    .map { it.navn }
    .sorted()
    .take(10)

// reduce / fold — slå sammen til ett resultat
tall.sum()                          // 15
tall.reduce { acc, x -> acc + x }   // 15

// groupBy, associateBy, partition — strukturere
brukere.groupBy { it.land }         // Map<String, List<Bruker>>
brukere.partition { it.aktiv }      // Pair(aktive, inaktive)

// Mutable vs immutable — viktig!
val immutable = listOf(1, 2, 3)             // List<Int> — kan IKKE endres
val mutable = mutableListOf(1, 2, 3)        // MutableList<Int> — kan add/remove
// immutable.add(4)                          // KOMPILERINGSFEIL`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>HVORFOR:</strong> Android-state håndteres ofte som immutable lister.
            For å endre en liste i en StateFlow lager du en NY liste med{" "}
            <code>+</code> eller <code>toMutableList().apply &#123; add(x) &#125;</code>
            {" "}— aldri endre den eksisterende. Det er hvordan observatører kan stole
            på at en endring betyr en ny verdi.
          </p>
        </section>

        <section id="klasser" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Klasser og arv (kort)</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Kotlin-klasser er <strong>final by default</strong> — du må eksplisitt
            markere dem <code>open</code> for å kunne arve. Det tvinger fram bevisst
            design.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`// Primary constructor er en del av klasse-headeren:
class Bil(val merke: String, var fart: Int) {
    fun øk(med: Int) {
        fart += med
    }
}

val b = Bil("Tesla", 50)
b.øk(10)
println(b.fart)                     // 60

// Arv: 'open' kreves
open class Dyr(val navn: String) {
    open fun lyd() = "..."
}

class Hund(navn: String) : Dyr(navn) {
    override fun lyd() = "voff"
}

// Interfaces
interface Klikkbar {
    fun klikk()
}

class Knapp : Klikkbar {
    override fun klikk() { /* ... */ }
}

// Object — singleton
object Logger {
    fun log(msg: String) = println("[LOG] \$msg")
}
Logger.log("hei")                   // ingen new — bare Logger.method()

// Sealed class — begrenset hierarki, alle subtyper må være i samme fil
sealed class Resultat {
    data class Ok(val data: String) : Resultat()
    data class Feil(val melding: String) : Resultat()
    object Laster : Resultat()
}

// Gjør 'when' uttømmende (kompilator sjekker at du dekker alle):
fun vis(r: Resultat) = when (r) {
    is Resultat.Ok -> r.data
    is Resultat.Feil -> "Feil: \${r.melding}"
    Resultat.Laster -> "..."
}`}</pre>
          </div>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/drag" className="text-brand hover:underline">
                Drag-oppgaver
              </Link>
              : val/var-quiz, null-safety-match, scope-funksjoner-match, collection-funksjoner.
            </li>
            <li>
              <Link
                to="/stack/$slug"
                params={{ slug: "android-grunnlag" }}
                className="text-brand hover:underline"
              >
                Android-grunnlag
              </Link>{" "}
              — aktiviteter, fragmenter, livssyklus, Gradle.
              <ArrowRight className="inline h-3.5 w-3.5 ml-1" />
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
