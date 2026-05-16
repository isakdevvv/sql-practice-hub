import { Link } from "@tanstack/react-router";
import { ArrowRight, Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";

const STEPS = [
  { title: "Room — SQLite med kompileringssjekk", anchor: "room" },
  { title: "Entity — tabellen", anchor: "entity" },
  { title: "DAO — spørringene", anchor: "dao" },
  { title: "Database — fabrikken", anchor: "database" },
  { title: "RecyclerView — hvorfor og hvordan", anchor: "recycler" },
  { title: "Adapter og ViewHolder", anchor: "adapter" },
  { title: "DiffUtil — bare endringene tegnes på nytt", anchor: "diffutil" },
];

export function RoomRecyclerPage() {
  return (
    <StackPageShell title="Room og RecyclerView" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2603 · Lagring + lister
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Room og RecyclerView — lokal database og skalerbare lister
          </h1>
          <p className="mt-3 text-muted-foreground">
            Room er Android sitt offisielle DB-lag (lag oppå SQLite). RecyclerView er
            mønsteret for lister som inneholder tusenvis av rader uten å spise minnet.
            De er to forskjellige problemer, men brukes nesten alltid sammen.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Mental modell:</span> Room er ORM-en
              (Object-Relational Mapper) for SQLite på Android. RecyclerView er
              «virtualized list» som bare beholder synlige rader i minnet.
            </div>
          </div>
        </div>

        <CourseOutline courseId="room-recycler" steps={STEPS} />

        <section id="room" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Room — SQLite med kompileringssjekk</h2>
          <p className="text-sm text-muted-foreground mb-4">
            SQLite har vært innebygd i Android siden begynnelsen. Tradisjonelt skrev du
            strenger med SQL og parset Cursor-objekter manuelt — masse boilerplate, lett
            å skrive feil. Room er et bibliotek som genererer all den koden for deg, OG
            sjekker SQL-en din ved kompilering.
          </p>
          <div className="rounded-xl border-2 border-brand/40 bg-brand/5 p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Room består av tre annotasjoner:

  @Entity      ← Kotlin-klasse = tabell
  @Dao         ← interface med spørringer (data access object)
  @Database    ← knytter Entitetene og DAO-ene sammen

Hvorfor Room over rå SQLite?
  - Kompilator validerer @Query mot @Entity-skjemaet
  - Auto-generert kode — ingen Cursor-håndtering
  - Lett å bruke med korutiner og Flow
  - Migrasjoner og tester er førsteklasses støttet`}</pre>
          </div>
        </section>

        <section id="entity" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Entity — tabellen</h2>
          <p className="text-sm text-muted-foreground mb-4">
            En <code>@Entity</code>-annotert data class representerer én rad. Felt-navn
            blir kolonner. Du må peke ut en primærnøkkel.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`@Entity(tableName = "brukere")
data class BrukerEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,

    @ColumnInfo(name = "navn")
    val navn: String,

    val epost: String,                  // kolonnenavn = feltnavn

    @ColumnInfo(name = "opprettet")
    val opprettet: Long = System.currentTimeMillis(),
)

// Med relasjon (foreign key):
@Entity(
    tableName = "bestillinger",
    foreignKeys = [
        ForeignKey(
            entity = BrukerEntity::class,
            parentColumns = ["id"],
            childColumns = ["bruker_id"],
            onDelete = ForeignKey.CASCADE,
        )
    ],
)
data class BestillingEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    @ColumnInfo(name = "bruker_id") val brukerId: Long,
    val totalsum: Int,
)`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>HVORFOR data class for entitet?</strong> Room trenger en
            no-args-konstruktør i Java-stil, men Kotlin gir oss
            primary-constructor-med-default-verdier. Data classes er trygt valg —{" "}
            <code>copy()</code> er nyttig når du oppdaterer ett felt.
          </p>
        </section>

        <section id="dao" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. DAO — spørringene</h2>
          <p className="text-sm text-muted-foreground mb-4">
            DAO (Data Access Object) er et interface der hver metode er en SQL-spørring
            eller mutation. Du skriver INGEN implementasjon — Room generere den.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`@Dao
interface BrukerDao {

    @Query("SELECT * FROM brukere ORDER BY navn")
    suspend fun hentAlle(): List<BrukerEntity>

    @Query("SELECT * FROM brukere WHERE id = :id")
    suspend fun hentEn(id: Long): BrukerEntity?

    // Flow gir LIVE-oppdateringer — UI re-tegner når data endrer seg
    @Query("SELECT * FROM brukere")
    fun observerAlle(): Flow<List<BrukerEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun settInn(bruker: BrukerEntity): Long

    @Insert
    suspend fun settInnAlle(brukere: List<BrukerEntity>)

    @Update
    suspend fun oppdater(bruker: BrukerEntity)

    @Delete
    suspend fun slett(bruker: BrukerEntity)

    @Query("DELETE FROM brukere WHERE id = :id")
    suspend fun slettMedId(id: Long)
}`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>HVORFOR suspend?</strong> SQLite-tilgang er disk-IO og må ikke skje
            på main-tråden. Ved å markere DAO-metoden <code>suspend</code> tvinger Room
            deg til å kalle den fra en korutine — typisk på{" "}
            <code>Dispatchers.IO</code>.
          </p>
        </section>

        <section id="database" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Database — fabrikken</h2>
          <p className="text-sm text-muted-foreground mb-4">
            <code>@Database</code> knytter entiteter og DAO-er sammen og gir deg én
            instans å holde på i hele appen (singleton).
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`@Database(
    entities = [BrukerEntity::class, BestillingEntity::class],
    version = 1,
    exportSchema = true,
)
abstract class AppDatabase : RoomDatabase() {

    abstract fun brukerDao(): BrukerDao
    abstract fun bestillingDao(): BestillingDao

    companion object {
        @Volatile private var INSTANCE: AppDatabase? = null

        fun get(context: Context): AppDatabase =
            INSTANCE ?: synchronized(this) {
                INSTANCE ?: Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "minapp.db",
                )
                    .fallbackToDestructiveMigration()   // OK i utvikling, IKKE i prod
                    .build()
                    .also { INSTANCE = it }
            }
    }
}

// Bruk:
val db = AppDatabase.get(applicationContext)
val dao = db.brukerDao()`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>HVORFOR singleton?</strong> Å åpne SQLite-fila flere ganger kan gi
            låsing og dårlig ytelse. Én instans deles av hele appen. I praksis
            håndteres det av Hilt eller en service locator.
          </p>
        </section>

        <section id="recycler" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. RecyclerView — hvorfor og hvordan</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Å vise 10 000 elementer i en vanlig <code>LinearLayout</code> ville lage
            10 000 View-objekter i minnet — telefonen krasjer. RecyclerView resirkulerer
            view-objekter: bare de som er synlige (pluss noen reserver) lever til
            enhver tid.
          </p>
          <div className="rounded-xl border-2 border-brand/40 bg-brand/5 p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Skjerm (visuelt):
+──────────────────+
│ rad 4 (synlig)   │
│ rad 5 (synlig)   │
│ rad 6 (synlig)   │
│ rad 7 (synlig)   │
+──────────────────+

Faktiske ViewHolder-objekter i minnet:  ca. 6-7 stykker
Dataset (List<Data>):                   10 000 rader

Når brukeren scroller ned:
  - Den øverste ViewHolderen «resirkuleres»
  - Adapter.onBindViewHolder() fyller den med data for ny rad
  - Ingen NYE View-objekter opprettes — bare data byttes ut`}</pre>
          </div>
        </section>

        <section id="adapter" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Adapter og ViewHolder</h2>
          <p className="text-sm text-muted-foreground mb-4">
            <strong>ViewHolder</strong> holder referansene til viewene i én rad.{" "}
            <strong>Adapter</strong> kobler datasettet til viewholderne — den oppretter
            nye når det trengs, og fyller eksisterende med data.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`class BrukerAdapter(
    private val onClick: (Bruker) -> Unit,
) : ListAdapter<Bruker, BrukerAdapter.VH>(DIFF) {

    // 1) Hvordan SE en rad ut — opprett ViewHolder + view
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VH {
        val binding = ItemBrukerBinding.inflate(
            LayoutInflater.from(parent.context), parent, false,
        )
        return VH(binding)
    }

    // 2) Hvordan FYLLE en rad — kalles ved hver scroll/oppdatering
    override fun onBindViewHolder(holder: VH, position: Int) {
        val bruker = getItem(position)
        holder.binding.navn.text = bruker.navn
        holder.binding.epost.text = bruker.epost
        holder.itemView.setOnClickListener { onClick(bruker) }
    }

    class VH(val binding: ItemBrukerBinding) : RecyclerView.ViewHolder(binding.root)

    companion object {
        private val DIFF = object : DiffUtil.ItemCallback<Bruker>() {
            override fun areItemsTheSame(a: Bruker, b: Bruker) = a.id == b.id
            override fun areContentsTheSame(a: Bruker, b: Bruker) = a == b
        }
    }
}

// I Fragment:
val adapter = BrukerAdapter { bruker -> åpneDetalj(bruker.id) }
binding.recycler.layoutManager = LinearLayoutManager(requireContext())
binding.recycler.adapter = adapter

viewModel.brukere.observe(viewLifecycleOwner) { brukere ->
    adapter.submitList(brukere)
}`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>HVORFOR <code>ListAdapter</code> over rå <code>Adapter</code>?</strong>{" "}
            <code>ListAdapter</code> bruker DiffUtil internt — den vet hva som ENDRET
            seg mellom gammel og ny liste, og tegner bare de radene. Det er forskjellen
            på sleip animasjon og hele lista som blinker.
          </p>
        </section>

        <section id="diffutil" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. DiffUtil — bare endringene tegnes på nytt</h2>
          <p className="text-sm text-muted-foreground mb-4">
            DiffUtil sammenligner to lister og rapporterer minimal endring — innsetting,
            sletting eller endring av enkelt-rader. Det gir glatt animasjon og lavt
            CPU-bruk.
          </p>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-56">Metode</th>
                  <th className="text-left font-semibold px-4 py-2">Hva den svarer på</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono">areItemsTheSame</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    «Er dette samme rad?» — sammenlign typisk på ID
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono">areContentsTheSame</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    «Er innholdet identisk?» — sammenlign med equals (data class gir gratis)
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono">getChangePayload</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    (valgfri) hvilke FELT endret seg — for delvis animasjon
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Felle:</strong> hvis <code>areItemsTheSame</code> sammenligner hele
            objektet (eller <code>a === b</code>), tror DiffUtil at hver redigering er en
            ny rad — du får full rebuild og «blink». Bruk alltid stabil ID.
          </p>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/drag" className="text-brand hover:underline">
                Drag-oppgaver
              </Link>
              : match @Entity/@Dao/@Database, RecyclerView-pattern-order, DiffUtil-quiz.
            </li>
            <li>
              <Link
                to="/stack/$slug"
                params={{ slug: "api-retrofit" }}
                className="text-brand hover:underline"
              >
                API-kall med Retrofit
              </Link>{" "}
              — hent data fra nett og lagre med Room.
              <ArrowRight className="inline h-3.5 w-3.5 ml-1" />
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
