import { Link } from "@tanstack/react-router";
import { ArrowRight, Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";

const STEPS = [
  { title: "Hva en Android-app egentlig er", anchor: "hva" },
  { title: "Activity og livssyklus", anchor: "activity" },
  { title: "Fragment og dens livssyklus", anchor: "fragment" },
  { title: "AndroidManifest.xml", anchor: "manifest" },
  { title: "Gradle — byggesystemet", anchor: "gradle" },
  { title: "Resources og qualifiers", anchor: "resources" },
  { title: "R-fila og view binding", anchor: "r-fila" },
];

export function AndroidGrunnlagPage() {
  return (
    <StackPageShell title="Android-grunnlag" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2603 · Plattform
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Android-grunnlag — aktiviteter, fragmenter og livssyklus
          </h1>
          <p className="mt-3 text-muted-foreground">
            En Android-app er ikke ett program med én <code>main()</code> — den er et
            sett med komponenter som operativsystemet starter og stopper når brukeren
            navigerer eller minne blir knapt. Å forstå LIVSSYKLUS er forskjellen på en
            app som overlever rotasjon og en som kræsjer.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Eksamen-tips:</span> rekkefølgen på
              callbacks (<code>onCreate</code> → <code>onStart</code> →{" "}
              <code>onResume</code> → <code>onPause</code> → <code>onStop</code> →{" "}
              <code>onDestroy</code>) kommer nesten alltid på prøven. Pugg den.
            </div>
          </div>
        </div>

        <CourseOutline courseId="android-grunnlag" steps={STEPS} />

        <section id="hva" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Hva en Android-app egentlig er</h2>
          <p className="text-sm text-muted-foreground mb-4">
            En Android-app er en APK (Android Package) — en zip-fil med kompilert
            DEX-bytekode, ressurser og et manifest. Når brukeren åpner appen, kjører
            Android Runtime (ART) bytekoden i en egen prosess.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`MinApp.apk
├── classes.dex            ← kompilert Kotlin/Java som DEX-bytekode
├── res/                   ← bilder, layouts, strenger, farger ...
│   ├── layout/activity_main.xml
│   ├── values/strings.xml
│   ├── values-no/strings.xml      ← norsk oversettelse
│   └── drawable/icon.png
├── AndroidManifest.xml    ← deklarerer komponenter + tillatelser
└── META-INF/              ← signatur

Fire komponent-typer:
  Activity      ← skjerm med UI
  Service       ← bakgrunnsarbeid uten UI
  BroadcastReceiver  ← lytter på system-events
  ContentProvider ← deler data med andre apper`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>HVORFOR:</strong> Activity er den du møter først og oftest — alle
            apper har minst én. Service/BroadcastReceiver/ContentProvider er sjeldnere i
            studentprosjekter.
          </p>
        </section>

        <section id="activity" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Activity og livssyklus</h2>
          <p className="text-sm text-muted-foreground mb-4">
            En Activity representerer én skjerm. Android-systemet kaller{" "}
            <em>livssyklus-callbacks</em> når aktiviteten beveger seg mellom tilstander
            (synlig, i bakgrunnen, ødelagt).
          </p>
          <div className="rounded-xl border-2 border-brand/40 bg-brand/5 p-5 mb-4">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`     [skapes]
        │
   onCreate()              ← sett opp UI, viewmodel, bindinger
        │
   onStart()               ← synlig, men ikke i fokus
        │
   onResume()              ← interaktiv (forgrunn)
        │
   ┌────┴────┐
   │ KJØRER │
   └────┬────┘
        │   (annen app i fokus, dialog, telefonsamtale)
   onPause()               ← MISTET fokus, men fortsatt delvis synlig
        │
   onStop()                ← helt skjult
        │
   onDestroy()             ← ferdig — instansen kastes
        │
     [borte]`}</pre>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`class HovedActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)   // koble til XML-layout
        // Init viewmodel, bindinger, listeners — KJØRER ÉN GANG per instans
    }

    override fun onStart() {
        super.onStart()
        // Activity er nå SYNLIG — start observasjoner du må ha mens den vises
    }

    override fun onResume() {
        super.onResume()
        // I FORGRUNNEN — start kamera, sensorer, animasjoner
    }

    override fun onPause() {
        super.onPause()
        // STOPP sensorer, lagre kritisk state. ASAP — denne kalles før onStop.
    }

    override fun onStop() {
        super.onStop()
        // Helt skjult. Lukk DB-connections, stoppe nettverk om relevant.
    }

    override fun onDestroy() {
        super.onDestroy()
        // Siste sjanse til opprydding. Kalles NESTE GANG bare hvis instansen lever.
    }
}`}</pre>
          </div>
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm mb-4">
            <strong>Konfigurasjonsendring (rotasjon, språkbytte):</strong> Android
            ødelegger og gjenoppretter aktiviteten by default — <code>onDestroy</code>{" "}
            → ny <code>onCreate</code>. Det er DERFOR du bruker ViewModel:
            ViewModel-instansen overlever rotasjon. State som ikke er i ViewModel går
            tapt (med mindre du lagrer i <code>onSaveInstanceState</code>).
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`// onSaveInstanceState — kalles før onStop hvis activity kan komme tilbake.
// savedInstanceState i onCreate inneholder det du la i Bundle.
override fun onSaveInstanceState(outState: Bundle) {
    super.onSaveInstanceState(outState)
    outState.putString("søk", søkefelt.text.toString())
}

override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    setContentView(R.layout.activity_main)
    savedInstanceState?.getString("søk")?.let { søkefelt.setText(it) }
}`}</pre>
          </div>
        </section>

        <section id="fragment" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Fragment og dens livssyklus</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Et Fragment er en gjenbrukbar UI-del som lever <em>inni</em> en Activity.
            Tablet-layouts viser ofte to fragmenter side om side; samme fragment kan
            brukes i en mobil-layout én av gangen.
          </p>
          <div className="rounded-xl border-2 border-brand/40 bg-brand/5 p-5 mb-4">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Fragment-livssyklus (rikere enn Activity):

  onAttach()           ← koblet til en Activity
  onCreate()           ← fragment-instans opprettet
  onCreateView()       ← inflate XML-layout, returner View
  onViewCreated()      ← View finnes nå — sett opp bindinger
  onStart() / onResume()
       ⋮
  onPause() / onStop()
  onDestroyView()      ← View ødelagt, men fragment-instansen lever
  onDestroy()
  onDetach()           ← koblet fra Activity`}</pre>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`class ListFragment : Fragment() {

    private var _binding: FragmentListBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?,
    ): View {
        _binding = FragmentListBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        binding.recycler.adapter = MinAdapter()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null      // VIKTIG: unngå memory-leak — view-treet finnes ikke lenger
    }
}`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>HVORFOR to livssykluser?</strong> Fragmentet (instansen) kan
            overleve at viewet ødelegges (f.eks. når brukeren navigerer via
            back-stack). Derfor er <code>onDestroyView</code> en egen callback —
            fragmentet er fortsatt der, men viewet er borte.
          </p>
        </section>

        <section id="manifest" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. AndroidManifest.xml</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Manifestet er kontrakten med Android-systemet. Det deklarerer hvilke
            komponenter appen har, hvilke tillatelser den trenger, og minimum
            SDK-versjon.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="no.uit.minapp">

    <!-- Tillatelser brukeren må gi (eller systemet) -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />

    <application
        android:label="@string/app_name"
        android:icon="@mipmap/ic_launcher"
        android:theme="@style/Theme.MinApp">

        <!-- Start-aktiviteten — den med LAUNCHER-intent vises i app-skuffen -->
        <activity
            android:name=".HovedActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <activity android:name=".DetailActivity" />
    </application>
</manifest>`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>HVORFOR:</strong> Android-systemet leser manifestet for å vite hva
            som finnes UTEN å starte koden. Det er hvordan launcher kan vise app-ikonet,
            og hvordan en annen app kan starte din DetailActivity via Intent.
          </p>
        </section>

        <section id="gradle" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Gradle — byggesystemet</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Gradle bygger Android-prosjektet: kompilerer Kotlin, pakker ressurser,
            signerer APK. Konfigurasjonen står i <code>build.gradle</code>-filer (eller
            <code>.gradle.kts</code> med Kotlin DSL).
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`// app/build.gradle.kts — modul-nivå
plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("kotlin-kapt")        // annotation processor for Room/Hilt
}

android {
    namespace = "no.uit.minapp"
    compileSdk = 34          // mot hvilken SDK koden kompileres

    defaultConfig {
        applicationId = "no.uit.minapp"
        minSdk = 24          // eldste Android-versjon som støttes
        targetSdk = 34       // hvilken vi har testet mot
        versionCode = 1
        versionName = "1.0"
    }

    buildFeatures {
        viewBinding = true
        // compose = true    // hvis du bruker Jetpack Compose
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.appcompat:appcompat:1.6.1")
    implementation("androidx.lifecycle:lifecycle-viewmodel-ktx:2.7.0")
    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    implementation("androidx.room:room-runtime:2.6.1")
    kapt("androidx.room:room-compiler:2.6.1")
}`}</pre>
          </div>
          <div className="mt-4 overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-40">Begrep</th>
                  <th className="text-left font-semibold px-4 py-2">Hva det er</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono">minSdk</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    Eldste Android-versjon (API-nivå) appen vil kjøre på
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono">targetSdk</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    Den nyeste versjonen du har testet — påvirker hvilke
                    compatibility-shims systemet anvender
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono">compileSdk</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    Hvilken SDK-versjon koden kompileres mot (gir tilgang til API-er)
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono">versionCode</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    Heltall — Google Play bruker det for å vite hva som er en oppdatering
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="resources" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Resources og qualifiers</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Alt som ikke er kode legges i <code>res/</code>. Android velger automatisk
            riktig variant ut fra <em>qualifiers</em> i mappenavnet — det er hvordan
            språk og skjermtilpasning fungerer.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`res/
├── values/strings.xml          ← default (engelsk)
├── values-no/strings.xml       ← norsk — språk-qualifier
├── values-night/colors.xml     ← mørk modus
├── layout/activity_main.xml    ← default layout
├── layout-land/activity_main.xml      ← landskap-variant
├── layout-sw600dp/activity_main.xml   ← brett (≥ 600dp bredde)
├── drawable-hdpi/ic.png
├── drawable-xhdpi/ic.png
└── drawable-xxhdpi/ic.png

values/strings.xml:
<resources>
    <string name="hilsen">Hello</string>
</resources>

values-no/strings.xml:
<resources>
    <string name="hilsen">Hei</string>
</resources>

Bruk i kode:
val tekst = getString(R.string.hilsen)   // "Hei" på norsk telefon

Bruk i XML:
<TextView android:text="@string/hilsen" />`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>HVORFOR:</strong> samme APK fungerer i hele verden. Android plukker
            ressursen som passer best ut fra telefonens språk, skjermstørrelse,
            orientering, mørk modus osv. Du skriver ikke if/else for det — du lager bare
            riktig mappenavn.
          </p>
        </section>

        <section id="r-fila" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. R-fila og view binding</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Når Gradle bygger genererer det en klasse <code>R</code> med konstanter for
            alle ressurser. <code>R.layout.activity_main</code> er et heltall som peker
            til den kompilerte layout-ressursen.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`// AUTOGENERERT — ikke rør:
class R {
    class layout { static final int activity_main = 0x7f0a001a; }
    class id     { static final int btn_submit    = 0x7f0a0042; }
    class string { static final int hilsen        = 0x7f0e0008; }
}

// Gammelt mønster — findViewById (mye boilerplate, lett å glemme null-sjekk):
val btn = findViewById<Button>(R.id.btn_submit)
btn.setOnClickListener { /* ... */ }

// Moderne mønster — view binding (slått på i Gradle):
// activity_main.xml → ActivityMainBinding generert klasse
class HovedActivity : AppCompatActivity() {
    private lateinit var binding: ActivityMainBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.btnSubmit.setOnClickListener {
            val tekst = binding.editNavn.text.toString()
            // ...
        }
    }
}`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>HVORFOR view binding:</strong> compile-time typesjekk
            (<code>binding.btnSubmit</code> er en <code>Button</code>, ikke{" "}
            <code>View?</code>), ingen risiko for null-pointer fra glemt id, og bedre
            ytelse fordi <code>findViewById</code> ikke kalles på nytt.
          </p>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/drag" className="text-brand hover:underline">
                Drag-oppgaver
              </Link>
              : order onCreate→onDestroy, Activity vs Fragment, savedInstanceState-quiz.
            </li>
            <li>
              <Link
                to="/stack/$slug"
                params={{ slug: "mvvm-arkitektur" }}
                className="text-brand hover:underline"
              >
                MVVM-arkitektur
              </Link>{" "}
              — hvordan ViewModel løser rotasjons-problemet.
              <ArrowRight className="inline h-3.5 w-3.5 ml-1" />
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
