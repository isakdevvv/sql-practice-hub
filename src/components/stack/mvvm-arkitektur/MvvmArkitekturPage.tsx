import { Link } from "@tanstack/react-router";
import { ArrowRight, Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";

const STEPS = [
  { title: "Hvorfor arkitektur i det hele tatt", anchor: "hvorfor" },
  { title: "Lagene — Model, View, ViewModel, Repository", anchor: "lagene" },
  { title: "Observable patterns — LiveData og StateFlow", anchor: "observable" },
  { title: "ViewModel i praksis", anchor: "viewmodel" },
  { title: "Repository — én sannhetskilde", anchor: "repository" },
  { title: "MVC vs MVP vs MVVM", anchor: "mvc-vs-mvvm" },
  { title: "Typiske feilmønstre", anchor: "feller" },
];

export function MvvmArkitekturPage() {
  return (
    <StackPageShell title="MVVM-arkitektur" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2603 · Arkitektur
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            MVVM — Model-View-ViewModel
          </h1>
          <p className="mt-3 text-muted-foreground">
            MVVM er det offisielle anbefalte mønsteret for Android-apper. Det løser to
            problemer: hvordan UI overlever konfigurasjonsendringer (rotasjon, språk),
            og hvordan du tester logikk uten å starte hele appen.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Mental modell:</span> View «observerer»
              ViewModel. ViewModel vet ikke at View finnes — den eksponerer bare en
              strøm av tilstand. Det er denne ene-veis-pilen som gjør alt resten
              fungerer.
            </div>
          </div>
        </div>

        <CourseOutline courseId="mvvm-arkitektur" steps={STEPS} />

        <section id="hvorfor" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Hvorfor arkitektur i det hele tatt</h2>
          <p className="text-sm text-muted-foreground mb-4">
            En naiv Android-app gjør alt i Activity: laster data, holder state, tegner
            UI, håndterer klikk. Det fungerer på 200 linjer. Når koden vokser kommer
            problemer som driver fram MVVM.
          </p>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-44">Problem</th>
                  <th className="text-left font-semibold px-4 py-2">Hvordan MVVM løser det</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-medium">Rotasjon ødelegger state</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    ViewModel overlever Activity-rekonstruksjon
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-medium">Activity blir tusen linjer</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    Logikk flyttes til ViewModel, View bare tegner
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-medium">Vanskelig å enhetsteste</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    ViewModel har ingen Android-avhengigheter — kan testes med JUnit
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-medium">Data hentes flere steder</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    Repository samler henting til ett sted
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="lagene" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Lagene</h2>
          <div className="rounded-xl border-2 border-brand/40 bg-brand/5 p-5 mb-4">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`  +────────────────+        kun ENVEIS pil ─────────►
  │     VIEW       │   observerer    ┌──────────────┐
  │  Activity /    │ ──────────────► │  VIEW MODEL  │
  │  Fragment /    │ ◄── tilstand ── │ holder state │
  │  Compose       │                 └──────┬───────┘
  +────────────────+                        │
                                            ▼
                                    ┌──────────────┐
                                    │  REPOSITORY  │
                                    │ én sannhets- │
                                    │    kilde     │
                                    └──┬──────────┬┘
                                       ▼          ▼
                                  ┌────────┐  ┌────────┐
                                  │  ROOM  │  │RETROFIT│
                                  │ (DB)   │  │  (API) │
                                  └────────┘  └────────┘`}</pre>
          </div>
          <ul className="space-y-3 text-sm">
            <li className="rounded-lg border border-border bg-card p-4">
              <strong className="text-foreground">Model:</strong> rene data-klasser som
              representerer domenet — <code>Bruker</code>, <code>Bok</code>,{" "}
              <code>Bestilling</code>. Ofte data classes. Inneholder INGEN logikk om
              henting.
            </li>
            <li className="rounded-lg border border-border bg-card p-4">
              <strong className="text-foreground">View:</strong> Activity, Fragment
              eller Compose-funksjoner. Tegner UI ut fra tilstanden ViewModel
              eksponerer. Sender klikk og input videre.
            </li>
            <li className="rounded-lg border border-border bg-card p-4">
              <strong className="text-foreground">ViewModel:</strong> holder UI-state
              (det View trenger å vise), eksponerer det som LiveData/StateFlow, kjører
              forretningslogikk. Overlever rotasjon.
            </li>
            <li className="rounded-lg border border-border bg-card p-4">
              <strong className="text-foreground">Repository:</strong> abstraherer
              data-kildene. ViewModel ber Repository om data og bryr seg ikke om det
              kom fra DB eller nett.
            </li>
          </ul>
        </section>

        <section id="observable" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">
            3. Observable patterns — LiveData og StateFlow
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            ViewModel må eksponere data slik at View kan «se på» det og reagere. To
            dominerende valg:
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                LiveData
              </div>
              <ul className="space-y-1 text-xs text-muted-foreground list-disc pl-4">
                <li>Eldre — fra AndroidX Lifecycle</li>
                <li>Livssyklus-bevisst (slutter selv å sende når View er stoppet)</li>
                <li>Bare main-tråden</li>
                <li>Brukes mye i eldre kode og kurs-materiale</li>
              </ul>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                StateFlow
              </div>
              <ul className="space-y-1 text-xs text-muted-foreground list-disc pl-4">
                <li>Nyere — fra Kotlin Coroutines</li>
                <li>Krever <code>repeatOnLifecycle</code> for livssyklus</li>
                <li>Multiplattform, mer fleksibel</li>
                <li>Anbefalt for ny kode</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`// --- LiveData ---
class TallViewModel : ViewModel() {
    private val _teller = MutableLiveData(0)
    val teller: LiveData<Int> get() = _teller       // utad er den read-only

    fun øk() {
        _teller.value = (_teller.value ?: 0) + 1
    }
}

// I Fragment:
viewModel.teller.observe(viewLifecycleOwner) { ny ->
    binding.tekst.text = ny.toString()
}

// --- StateFlow ---
class TallViewModel : ViewModel() {
    private val _teller = MutableStateFlow(0)
    val teller: StateFlow<Int> = _teller.asStateFlow()

    fun øk() {
        _teller.value += 1
    }
}

// I Fragment:
viewLifecycleOwner.lifecycleScope.launch {
    viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
        viewModel.teller.collect { ny ->
            binding.tekst.text = ny.toString()
        }
    }
}`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>HVORFOR _navn / navn?</strong> Konvensjon: den mutable versjonen er{" "}
            <em>private</em> med understrek-prefiks. Utad eksponeres en immutable
            type (<code>LiveData</code>, <code>StateFlow</code>). Det hindrer View fra å
            sette verdier direkte på ViewModelen — alt skjer via funksjoner.
          </p>
        </section>

        <section id="viewmodel" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. ViewModel i praksis</h2>
          <p className="text-sm text-muted-foreground mb-4">
            En typisk ViewModel: eksponerer state, tar imot intents/events fra View,
            kaller Repository i en korutine.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`data class BrukerUiState(
    val laster: Boolean = false,
    val brukere: List<Bruker> = emptyList(),
    val feilmelding: String? = null,
)

class BrukerViewModel(
    private val repo: BrukerRepository,
) : ViewModel() {

    private val _ui = MutableStateFlow(BrukerUiState())
    val ui: StateFlow<BrukerUiState> = _ui.asStateFlow()

    fun last() {
        viewModelScope.launch {
            _ui.value = _ui.value.copy(laster = true, feilmelding = null)
            try {
                val data = repo.hentBrukere()                       // suspend-kall
                _ui.value = _ui.value.copy(laster = false, brukere = data)
            } catch (e: Exception) {
                _ui.value = _ui.value.copy(laster = false, feilmelding = e.message)
            }
        }
    }
}

// Fragment leser ui-tilstand og tegner:
// - laster=true   → spinner
// - feilmelding ≠ null → snackbar
// - ellers        → lista`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>HVORFOR én data class for state?</strong> Det gjør View enkel — alt
            den trenger ligger i ett objekt. <code>copy()</code> sørger for at hver
            endring er en ny verdi som triggerer observatører.
          </p>
        </section>

        <section id="repository" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Repository — én sannhetskilde</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Repository skjuler hvor data faktisk ligger. ViewModel kaller{" "}
            <code>repo.hentBrukere()</code> og bryr seg ikke om svaret kommer fra DB
            eller API.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`class BrukerRepository(
    private val dao: BrukerDao,           // Room
    private val api: BrukerApi,           // Retrofit
) {

    suspend fun hentBrukere(): List<Bruker> {
        // 1) Prøv lokal cache først (raskt)
        val cached = dao.hentAlle()
        if (cached.isNotEmpty()) return cached

        // 2) Hent fra nett, lagre i cache
        val ferske = api.alle()
        dao.settInn(ferske)
        return ferske
    }

    // Flow lar UI få oppdateringer kontinuerlig — Room støtter dette ut av boksen
    fun observerBrukere(): Flow<List<Bruker>> = dao.observerAlle()
}`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>HVORFOR:</strong> du kan bytte ut Retrofit med en annen klient, eller
            legge til disk-cache, uten å røre ViewModel eller View. Det er
            avhengighets-invertering i praksis.
          </p>
        </section>

        <section id="mvc-vs-mvvm" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. MVC vs MVP vs MVVM</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Tre relaterte mønstre — det er lett å forveksle dem. Forskjellen er hvordan
            View og state-holderen kommuniserer.
          </p>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-3 py-2 w-20">Mønster</th>
                  <th className="text-left font-semibold px-3 py-2">View → ?</th>
                  <th className="text-left font-semibold px-3 py-2">? → View</th>
                  <th className="text-left font-semibold px-3 py-2">Hvorfor på Android</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono">MVC</td>
                  <td className="px-3 py-2 text-muted-foreground">Controller</td>
                  <td className="px-3 py-2 text-muted-foreground">Controller endrer View direkte</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    Tett kobling — vanskelig å teste, Activity blir både View og Controller
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono">MVP</td>
                  <td className="px-3 py-2 text-muted-foreground">Presenter</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    Presenter holder View-referanse og kaller `view.show()`
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    Bedre testbar, men Presenter må kjenne View-interface — boilerplate
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono">MVVM</td>
                  <td className="px-3 py-2 text-muted-foreground">ViewModel-funksjoner</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    View OBSERVERER tilstand — VM vet ikke om View
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    Løskoblet, overlever rotasjon, testbar — Android-anbefalt
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Kjerneforskjellen MVP vs MVVM:</strong> i MVP har Presenter en
            referanse TIL View og kaller metoder på den. I MVVM eksponerer ViewModel en
            strøm av state, og View velger selv å observere. Det betyr ViewModel kan
            kjøre uten View — derfor enklere å teste.
          </p>
        </section>

        <section id="feller" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Typiske feilmønstre</h2>
          <div className="space-y-3 text-sm">
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>Holde Context/View i ViewModel</strong> — ViewModel overlever
              Activity-død. Hvis du beholder en Activity-referanse, lekker du minne.
              Bruk <code>AndroidViewModel</code> hvis du absolutt må ha{" "}
              <code>Application</code>-context.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>Eksponere MutableLiveData utad</strong> — da kan View skrive til
              den direkte. Hold den private; eksponer immutable typen.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>Logikk i Activity</strong> — hvis du bygger HTTP-kall eller
              filter-logikk i Activity, har du droppet hele MVVM-poenget. Flytt til
              ViewModel.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>For mange små ViewModels</strong> — typisk vil hver skjerm
              (Activity eller Fragment) ha én ViewModel. Ikke lag én per knapp.
            </div>
          </div>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/drag" className="text-brand hover:underline">
                Drag-oppgaver
              </Link>
              : match Model/View/ViewModel/Repository, LiveData vs StateFlow,
              hvorfor-ikke-MVC.
            </li>
            <li>
              <Link
                to="/stack/$slug"
                params={{ slug: "korutiner" }}
                className="text-brand hover:underline"
              >
                Korutiner
              </Link>{" "}
              — hvordan <code>viewModelScope</code> faktisk fungerer.
              <ArrowRight className="inline h-3.5 w-3.5 ml-1" />
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
