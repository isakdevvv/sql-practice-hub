import { Link } from "@tanstack/react-router";
import { ArrowRight, Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";

const STEPS = [
  { title: "Hvorfor du IKKE bruker Thread direkte", anchor: "hvorfor" },
  { title: "suspend-funksjoner", anchor: "suspend" },
  { title: "launch og async", anchor: "launch-async" },
  { title: "Scopes — viewModelScope, lifecycleScope, GlobalScope", anchor: "scopes" },
  { title: "Dispatchers — Main, IO, Default", anchor: "dispatchers" },
  { title: "Structured concurrency", anchor: "structured" },
  { title: "Feilhåndtering og kansellering", anchor: "feil" },
];

export function KorutinerPage() {
  return (
    <StackPageShell title="Korutiner" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2603 · Flertråd
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Korutiner — Kotlin sin måte å håndtere flertråd og asynkroni
          </h1>
          <p className="mt-3 text-muted-foreground">
            En korutine er som en lett-vekts tråd — du kan ha tusenvis av dem på samme
            JVM-tråd, fordi de gir fra seg kontrollen frivillig på{" "}
            <em>suspension points</em>. På Android brukes korutiner for å gjøre nett-
            og DB-kall uten å fryse hovedtråden.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Eksamen-tips:</span> hvis du gjør nettverk
              eller disk-IO på hovedtråden får du <code>NetworkOnMainThreadException</code>{" "}
              eller frosset UI. Det er DERFOR korutiner finnes.
            </div>
          </div>
        </div>

        <CourseOutline courseId="korutiner" steps={STEPS} />

        <section id="hvorfor" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Hvorfor du IKKE bruker Thread direkte</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Android-systemet har én <em>UI-tråd</em> (også kalt main-tråden). Alt som
            tegner skjermen må skje der. Lange operasjoner — nettverk, DB,
            disk-tilgang — må derimot IKKE skje der, eller appen fryser.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`// Naivt — KRÆSJER med NetworkOnMainThreadException:
val data = api.hent()        // ❌ blokkerer main-tråden

// Med Thread (gammel java-stil) — fungerer, men:
Thread {
    val data = api.hent()
    runOnUiThread {          // må hoppe TILBAKE til main for å tegne
        tekst.text = data
    }
}.start()
// Problemer: ingen kansellering ved Activity-død, ingen feilhåndtering,
// manuell tråd-veksling — uleselig kjeding.

// Med korutiner — leselig, kansellerer ved livssyklus, strukturert:
viewLifecycleOwner.lifecycleScope.launch {
    val data = api.hent()    // suspender — frigir main-tråden
    tekst.text = data        // tilbake på main automatisk
}`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>HVORFOR korutiner:</strong> du skriver kode som SER sekvensiell ut,
            men kompilatoren transformerer hver suspend-funksjon til en state-machine
            som kan pauses og gjenopptas. Det gir trådfri samtidighet uten callbacks.
          </p>
        </section>

        <section id="suspend" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. suspend-funksjoner</h2>
          <p className="text-sm text-muted-foreground mb-4">
            En <code>suspend</code>-funksjon er en funksjon som KAN pauses og
            gjenopptas. Den kan bare kalles fra en annen suspend-funksjon eller fra
            innsiden av en korutine — du kan ikke kalle den fra vanlig kode.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`// Vanlig funksjon — kjører til ende
fun sum(a: Int, b: Int) = a + b

// Suspend-funksjon — kan pause underveis
suspend fun hentBruker(id: Long): Bruker {
    delay(100)               // delay er selv suspend — pauser uten å blokkere tråd
    return api.bruker(id)    // api.bruker er antagelig også suspend
}

// FEIL — kan ikke kalle suspend fra vanlig kode:
// fun handler() {
//     val u = hentBruker(1) // KOMPILERINGSFEIL
// }

// OK — kalt fra en korutine:
viewModelScope.launch {
    val u = hentBruker(1)
    // ...
}

// OK — kalt fra en annen suspend-funksjon:
suspend fun handler(): Bruker {
    return hentBruker(1)
}`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Mental modell:</strong> tenk på <code>suspend</code> som «denne
            funksjonen lover at den ikke blokkerer tråden — hvis den må vente, gir den
            den tilbake til systemet». <code>delay</code> er det klassiske eksempelet —
            det er IKKE <code>Thread.sleep</code>; det blokkerer ingenting.
          </p>
        </section>

        <section id="launch-async" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. launch og async</h2>
          <p className="text-sm text-muted-foreground mb-4">
            To måter å starte en korutine på. Velg ut fra om du trenger et resultat
            tilbake.
          </p>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                launch
              </div>
              <ul className="space-y-1 text-xs text-muted-foreground list-disc pl-4">
                <li>«Fire and forget»</li>
                <li>Returnerer <code>Job</code></li>
                <li>Brukes for handlinger (lagre, send, klikk)</li>
                <li>Ingen returverdi</li>
              </ul>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                async
              </div>
              <ul className="space-y-1 text-xs text-muted-foreground list-disc pl-4">
                <li>For å hente et resultat</li>
                <li>Returnerer <code>Deferred&lt;T&gt;</code></li>
                <li>Kall <code>.await()</code> for verdien</li>
                <li>Brukes for parallelle henter</li>
              </ul>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`// launch — fire and forget
viewModelScope.launch {
    repo.lagre(data)
}

// async — for resultat
viewModelScope.launch {
    val a = async { repo.hent(1) }     // starter med en gang
    val b = async { repo.hent(2) }     // og denne — parallelt
    val resultat = a.await() + b.await()   // venter på BEGGE
}

// Sekvensielt vs parallelt:
viewModelScope.launch {
    val a = repo.hent(1)   // venter ferdig
    val b = repo.hent(2)   // FØRST nå starter denne — TOTAL = a + b
}
// vs
viewModelScope.launch {
    val a = async { repo.hent(1) }
    val b = async { repo.hent(2) }
    val sum = a.await() + b.await()
    // TOTAL = max(a, b)  — viktig optimalisering!
}`}</pre>
          </div>
        </section>

        <section id="scopes" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">
            4. Scopes — viewModelScope, lifecycleScope, GlobalScope
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            En <em>scope</em> bestemmer levetiden til korutinen. Når scopet
            kanselleres, kanselleres alle korutiner i det. Velg scope ut fra HVA
            korutinen er knyttet til.
          </p>
          <div className="overflow-x-auto rounded-lg border border-border mb-4">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-3 py-2 w-44">Scope</th>
                  <th className="text-left font-semibold px-3 py-2">Lever til</th>
                  <th className="text-left font-semibold px-3 py-2">Bruk når</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono">viewModelScope</td>
                  <td className="px-3 py-2 text-muted-foreground">ViewModel.onCleared()</td>
                  <td className="px-3 py-2 text-muted-foreground">VM-jobber, last data, lagre</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono">lifecycleScope</td>
                  <td className="px-3 py-2 text-muted-foreground">Activity/Fragment-død</td>
                  <td className="px-3 py-2 text-muted-foreground">UI-jobber knyttet til skjermen</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono">GlobalScope</td>
                  <td className="px-3 py-2 text-muted-foreground">Prosessens levetid</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    NESTEN ALDRI — bryter structured concurrency
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`class BrukerViewModel : ViewModel() {
    fun last() {
        viewModelScope.launch {       // ← kanselleres automatisk ved onCleared
            val data = repo.hent()
            _ui.value = _ui.value.copy(brukere = data)
        }
    }
}

class HovedFragment : Fragment() {
    override fun onViewCreated(view: View, b: Bundle?) {
        viewLifecycleOwner.lifecycleScope.launch {
            // kanselleres når viewet ødelegges
        }
    }
}

// GlobalScope.launch { ... }   // ❌ ikke knyttet til noe — lekker enkelt`}</pre>
          </div>
        </section>

        <section id="dispatchers" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Dispatchers — Main, IO, Default</h2>
          <p className="text-sm text-muted-foreground mb-4">
            En <em>dispatcher</em> bestemmer hvilken tråd korutinen kjører på. Tre
            standard-dispatchers å vite om.
          </p>
          <div className="overflow-x-auto rounded-lg border border-border mb-4">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-3 py-2 w-44">Dispatcher</th>
                  <th className="text-left font-semibold px-3 py-2">Tråd</th>
                  <th className="text-left font-semibold px-3 py-2">Bruk for</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono">Dispatchers.Main</td>
                  <td className="px-3 py-2 text-muted-foreground">UI-tråden</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    UI-oppdateringer (default i viewModelScope/lifecycleScope)
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono">Dispatchers.IO</td>
                  <td className="px-3 py-2 text-muted-foreground">Stor pool av tråder</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    Nettverk, disk, DB — operasjoner som blokkerer
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono">Dispatchers.Default</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    Pool på antall CPU-kjerner
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    CPU-tung jobb (sortering, parsing, bilde-prosessering)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`viewModelScope.launch {
    // Starter på Main fordi viewModelScope sin default er Main

    val data = withContext(Dispatchers.IO) {
        api.hent()                  // tung blokkering — gjør på IO
    }

    val sortert = withContext(Dispatchers.Default) {
        data.sortedBy { it.navn }   // CPU-jobb — Default
    }

    // Tilbake på Main:
    _ui.value = _ui.value.copy(brukere = sortert)
}`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>HVORFOR <code>withContext</code> heller enn å launche på nytt?</strong>{" "}
            <code>withContext</code> bytter tråd MIDT i en korutine, men returnerer
            tilbake til opprinnelig dispatcher etterpå. Det gir den «sekvensielle ser-ut»
            kode-stilen som er hele poenget med korutiner.
          </p>
        </section>

        <section id="structured" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Structured concurrency</h2>
          <p className="text-sm text-muted-foreground mb-4">
            En parent-korutine venter på alle barna sine før den selv er ferdig.
            Kanselleres parent, kanselleres alle barna. Det er prinsippet bak{" "}
            <em>structured concurrency</em> — og grunnen til at korutiner ikke lekker
            som tråder kan.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`viewModelScope.launch {                  // parent
    launch { hentA() }                   // barn 1
    launch { hentB() }                   // barn 2
    // parent er IKKE ferdig før begge barn er det
}

// coroutineScope { } er en byggekloss — kjører blokk og venter på alt:
suspend fun hentAlt(): Pair<A, B> = coroutineScope {
    val a = async { repo.hentA() }
    val b = async { repo.hentB() }
    a.await() to b.await()
}

// Hvis hentA() kaster, blir hentB() også kansellert — alt går ned sammen.
// Vil du heller la dem fortsette uavhengig, bruk supervisorScope:
suspend fun robust(): List<Result<Data>> = supervisorScope {
    listOf(
        async { runCatching { repo.hentA() } },
        async { runCatching { repo.hentB() } },
    ).map { it.await() }
}`}</pre>
          </div>
        </section>

        <section id="feil" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Feilhåndtering og kansellering</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Feil i en korutine er som vanlige unntak — du fanger dem med try/catch.
            Men kansellering er sin egen kategori og må håndteres riktig.
          </p>
          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`viewModelScope.launch {
    try {
        val data = repo.hent()
        _ui.value = _ui.value.copy(brukere = data)
    } catch (e: IOException) {
        _ui.value = _ui.value.copy(feilmelding = "Nettverksfeil")
    } catch (e: CancellationException) {
        throw e                  // VIKTIG: la kansellering propagere oppover!
    } catch (e: Exception) {
        _ui.value = _ui.value.copy(feilmelding = e.message)
    }
}`}</pre>
          </div>
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
            <strong>Felle:</strong> <code>catch (e: Exception)</code> fanger også{" "}
            <code>CancellationException</code> — som du IKKE skal svelge. Da fortsetter
            jobben å kjøre selv etter at parent kansellerte den. Enten bruk spesifikke
            unntak, eller kast <code>CancellationException</code> videre.
          </div>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/drag" className="text-brand hover:underline">
                Drag-oppgaver
              </Link>
              : suspend vs blocking, match Dispatchers, launch vs async,
              structured-concurrency-quiz.
            </li>
            <li>
              <Link
                to="/stack/$slug"
                params={{ slug: "room-recycler" }}
                className="text-brand hover:underline"
              >
                Room og RecyclerView
              </Link>{" "}
              — DAO-funksjoner returnerer typisk <code>suspend</code> eller{" "}
              <code>Flow</code>.
              <ArrowRight className="inline h-3.5 w-3.5 ml-1" />
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
