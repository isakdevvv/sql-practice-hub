import { Link } from "@tanstack/react-router";
import { ArrowRight, Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { RelatedVisualizers } from "@/components/stack/RelatedVisualizers";
import { lazy, Suspense } from "react";
import { VisualizerSkeleton } from "@/components/visualizer-shell";

const HashTableVisualizer = lazy(() =>
  import("./HashTableVisualizer").then((m) => ({ default: m.HashTableVisualizer })),
);

const STEPS = [
  { title: "Hva en hash-funksjon må gjøre", anchor: "krav" },
  { title: "Interaktiv: se hashing-strategiene", anchor: "visualisering" },
  { title: "Separate chaining", anchor: "chaining" },
  { title: "Open addressing", anchor: "open" },
  { title: "Lastfaktor og resize", anchor: "resize" },
  { title: "Kryptografisk vs ikke-kryptografisk", anchor: "krypto" },
  { title: "Bloom filter", anchor: "bloom" },
  { title: "Vanlige feller", anchor: "feller" },
];

export function HashingDyperePage() {
  return (
    <StackPageShell title="Hashing" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            Algoritmer · Hashing dypere
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Hashing — under panseret av <code>dict</code> og <code>set</code>
          </h1>
          <p className="mt-3 text-muted-foreground">
            Hash-tabeller er <code>O(1)</code> i snitt, men bare hvis du
            forstår hva som kan gå galt. Kollisjoner, lastfaktor, dårlig
            hash-funksjon — her er detaljene.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <Link to="/drag" className="text-brand hover:underline">
                drag-oppgavene
              </Link>{" "}
              har 9 oppgaver under «Hashing» — chaining vs probing, kalkuler
              lastfaktor, finn slot etter probing.
            </div>
          </div>
        </div>

        <CourseOutline courseId="hashing-dypere" steps={STEPS} />

        <section id="krav" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Hva en hash-funksjon må gjøre</h2>
          <p className="text-sm text-muted-foreground mb-3">
            En hash-funksjon mapper en nøkkel av vilkårlig type til et heltall
            (typisk modulo tabell-størrelsen). Tre krav skiller en god fra en
            dårlig:
          </p>
          <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-5 mb-3">
            <li>
              <strong>Deterministic:</strong> samme input gir alltid samme
              output. Uten dette er lookup umulig.
            </li>
            <li>
              <strong>Uniform fordeling:</strong> outputs er spredt jevnt
              utover slottene. Klumper = kollisjoner = degradering mot{" "}
              <code>O(n)</code>.
            </li>
            <li>
              <strong>Rask:</strong> må kjøres på hver lookup. Helst{" "}
              <code>O(k)</code> der k er nøkkellengde.
            </li>
          </ul>
          <div className="rounded-xl border border-border bg-card p-5 mb-3">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`# Naiv strenghash (FNV-style):
def hash_str(s, m):
    h = 14695981039346656037
    for c in s:
        h ^= ord(c)
        h *= 1099511628211
    return h % m

# Python sin str.__hash__ er randomized siden 3.3 (PYTHONHASHSEED)
# for å hindre HashDoS-angrep.`}</pre>
          </div>
          <p className="text-sm text-muted-foreground">
            <strong>Hash til indeks:</strong> typisk <code>h(key) % m</code>{" "}
            der m er tabell-størrelsen. Hvis m er en primtall reduseres
            klumping.
          </p>
        </section>

        <section id="visualisering" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Interaktiv: se hashing-strategiene</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Bytt mellom <strong>separate chaining</strong>, <strong>linear probing</strong> og{" "}
            <strong>double hashing</strong>, og kjør <code>insert</code>/<code>lookup</code>/<code>delete</code>{" "}
            mot samme tabell. Probe-sekvensen blinker gult mens nøkkelen leter seg fram til
            destinasjons-sloten (blå). Hash-verdien <code>h(k) = sum(ord(c)) % m</code> regnes ut
            live mens du skriver, og du ser lastfaktoren stige etter hvert som du fyller tabellen.
          </p>
          <Suspense fallback={<VisualizerSkeleton />}>
            <HashTableVisualizer />
          </Suspense>
        </section>

        <section id="chaining" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Separate chaining</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Hver slot inneholder en lenkeliste (eller dynamisk array) av
            entries som hasher til samme indeks. Kollisjoner løses ved å
            lenke flere entries i samme slot.
          </p>
          <div className="rounded-xl border border-border bg-card p-5 mb-3">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`tabell (m = 7), insert "Ane", "Bo", "Cia", "Dag", "Eli", "Ola":

  hash("Ane") % 7 = 2
  hash("Bo")  % 7 = 5
  hash("Cia") % 7 = 2     <- kollisjon
  hash("Dag") % 7 = 0
  hash("Eli") % 7 = 2     <- kollisjon
  hash("Ola") % 7 = 5     <- kollisjon

   0: [Dag]
   1: -
   2: [Ane] -> [Cia] -> [Eli]
   3: -
   4: -
   5: [Bo] -> [Ola]
   6: -`}</pre>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`class HashTable:
    def __init__(self, m=8):
        self.m = m
        self.slots = [[] for _ in range(m)]

    def _idx(self, key):
        return hash(key) % self.m

    def put(self, key, val):
        bucket = self.slots[self._idx(key)]
        for i, (k, _) in enumerate(bucket):
            if k == key:
                bucket[i] = (key, val); return
        bucket.append((key, val))

    def get(self, key):
        for k, v in self.slots[self._idx(key)]:
            if k == key: return v
        raise KeyError(key)`}</pre>
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            <strong>Snitt:</strong> <code>O(1 + α)</code> der α = n/m
            (lastfaktor). <strong>Verste:</strong> alle havner i samme bucket
            → <code>O(n)</code>. Java HashMap konverterer bucket til balansert
            tre etter 8 elementer for å garantere <code>O(log n)</code>.
          </p>
        </section>

        <section id="open" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Open addressing</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Ingen lenkelister — alt lagres i selve tabellen. Når slotet er
            opptatt, prøver vi neste slot etter en probe-strategi.
          </p>
          <div className="rounded-xl border border-border bg-card p-5 mb-3">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Linear probing:    prove indeksene  h, h+1, h+2, h+3, ...
Quadratic probing: prove indeksene  h, h+1, h+4, h+9, h+16, ...
Double hashing:    prove h, h + h2(k), h + 2*h2(k), ...

Eksempel — linear probing, m=7:
  insert Ane (h=2)  ->  slot 2: Ane
  insert Cia (h=2)  ->  slot 2 opptatt, prov 3: Cia
  insert Eli (h=2)  ->  slot 2,3 opptatt, prov 4: Eli
  insert Tor (h=3)  ->  slot 3,4 opptatt, prov 5: Tor

   0: -    1: -    2: Ane  3: Cia  4: Eli  5: Tor  6: -

Lookup Cia:
  prov 2: Ane != Cia, fortsett (linear probe)
  prov 3: Cia funnet`}</pre>
          </div>
          <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-5 mb-3">
            <li>
              <strong>Linear probing:</strong> enkel, cache-vennlig, men
              «primary clustering» — lange sammenhengende kjeder av opptatte
              slots.
            </li>
            <li>
              <strong>Quadratic probing:</strong> sprer probes, reduserer
              clustering, men kan ikke garantere å nå alle slots med mindre
              tabellen er primtall + halv-tom.
            </li>
            <li>
              <strong>Double hashing:</strong> bruk en sekundær hash-funksjon
              som step-size. Best clustering-egenskaper.
            </li>
          </ul>
          <p className="text-sm text-muted-foreground">
            <strong>Sletting er trickyest:</strong> du kan ikke bare nullstille
            en slot — det bryter probe-sekvensen for senere lookups. Bruk en
            «tombstone»-markør som lookup hopper over, men insert kan overskrive.
          </p>
        </section>

        <section id="resize" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Lastfaktor og resize</h2>
          <p className="text-sm text-muted-foreground mb-3">
            <strong>Lastfaktor α = n / m</strong> — antall elementer delt på
            antall slots. Når α blir stor, øker kollisjonsfrekvensen og
            ytelsen degraderer.
          </p>
          <div className="overflow-x-auto rounded-lg border border-border mb-4">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2">Strategi</th>
                  <th className="text-left font-semibold px-4 py-2">Typisk threshold</th>
                  <th className="text-left font-semibold px-4 py-2">Hvorfor</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-3">Separate chaining</td>
                  <td className="px-4 py-3 font-mono">α ≈ 0.75 - 1.0</td>
                  <td className="px-4 py-3">Tåler høyere α — kjeden vokser, men funker.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3">Open addressing</td>
                  <td className="px-4 py-3 font-mono">α ≈ 0.5 - 0.7</td>
                  <td className="px-4 py-3">Probe-tid eksploderer nær α=1. Java HashMap: 0.75.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3">Python dict</td>
                  <td className="px-4 py-3 font-mono">α ≈ 0.67</td>
                  <td className="px-4 py-3">Open addressing med perturbasjons-probing.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 mb-3">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`def put(self, key, val):
    # ... vanlig insert ...
    if (self.n / self.m) > 0.75:
        self._resize(self.m * 2)

def _resize(self, ny_m):
    gamle = self.slots
    self.m = ny_m
    self.slots = [[] for _ in range(ny_m)]
    self.n = 0
    for bucket in gamle:
        for k, v in bucket:
            self.put(k, v)     # re-hash alle entries`}</pre>
          </div>
          <p className="text-sm text-muted-foreground">
            <strong>Doblings-strategi</strong> gir <code>O(1) amortisert</code>{" "}
            insert. Resize selv er <code>O(n)</code>, men skjer sjelden nok
            til at det jevnes ut. Tom-tabellen krymper sjelden (Python dict
            krymper f.eks. ikke automatisk).
          </p>
        </section>

        <section id="krypto" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Kryptografisk vs ikke-kryptografisk</h2>
          <div className="overflow-x-auto rounded-lg border border-border mb-4">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2">Egenskap</th>
                  <th className="text-left font-semibold px-4 py-2">Hash-tabell (FNV, MurmurHash, xxHash)</th>
                  <th className="text-left font-semibold px-4 py-2">Kryptografisk (SHA-256, BLAKE3)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-3">Uniform fordeling</td>
                  <td className="px-4 py-3">Ja</td>
                  <td className="px-4 py-3">Ja</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3">Rask</td>
                  <td className="px-4 py-3">Nanosekund-skala</td>
                  <td className="px-4 py-3">Mikrosekund-skala (100x tregere)</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3">Preimage-resistant</td>
                  <td className="px-4 py-3 text-destructive">Nei</td>
                  <td className="px-4 py-3">Ja</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3">Kollisjons-resistent</td>
                  <td className="px-4 py-3 text-destructive">Nei (designet for det motsatte er ikke krav)</td>
                  <td className="px-4 py-3">Ja</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3">Brukes til</td>
                  <td className="px-4 py-3">dict, set, sjekksum</td>
                  <td className="px-4 py-3">Passordlagring, HMAC, signaturer, Git-commits</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="rounded-xl border-2 border-destructive/40 bg-destructive/5 p-5 text-sm">
            <p className="text-foreground">
              <strong>Aldri</strong> bruk SHA-256 direkte for passordhash. Den
              er for rask — angripere kan kjøre milliarder av forsøk i sekundet.
              Bruk en designet password-KDF: <strong>bcrypt, scrypt, argon2</strong>{" "}
              — de er bevisst trege og minne-tunge.
            </p>
          </div>
        </section>

        <section id="bloom" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Bloom filter</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Probabilistisk struktur som svarer på «er denne nøkkelen i settet?»
            med <strong>false positives</strong> men ALDRI false negatives.
            Bruker en bit-array og k hash-funksjoner.
          </p>
          <div className="rounded-xl border border-border bg-card p-5 mb-3">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Insert "x":
  for each of k hash-funksjoner h_i:
      bits[h_i(x) % m] = 1

Lookup "x":
  for each of k hash-funksjoner h_i:
      if bits[h_i(x) % m] == 0:
          return DEFINITIVT IKKE i settet
  return MULIGENS i settet

Eksempel (m=10, k=3):
  insert "apple":  bits[2,5,9] = 1
  insert "pear":   bits[1,5,7] = 1

  lookup "apple":  bits[2,5,9] alle 1 -> kanskje
  lookup "kiwi":   sjekk bits[3,4,8] -> bits[3]=0 -> NEI
  lookup "grape":  bits[2,7,9] alle 1 (tilfeldigvis) -> FALSE POSITIVE`}</pre>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            <strong>Bruksområder:</strong>
          </p>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
            <li>Web-cache: «Har vi sett denne URL-en før?» Hvis bloom sier nei, ikke bry deg med å spørre disken.</li>
            <li>Database: «Kan denne nøkkelen finnes i denne SSTable-en?» (LevelDB, Cassandra).</li>
            <li>Spell-checker — false positives er OK fordi sjelden brukt.</li>
            <li>Chrome safe-browsing — initial-sjekk mot malicious URL-er.</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-3">
            <strong>Trade-off:</strong> minneeffektivt (få bits per element),
            men kan IKKE slette uten å bruke en counting bloom filter-variant.
          </p>
        </section>

        <section id="feller" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">8. Vanlige feller</h2>
          <div className="rounded-xl border-2 border-destructive/40 bg-destructive/5 p-5 text-sm">
            <ul className="space-y-2 list-disc pl-5">
              <li>
                <strong>Dårlig hash → clustering:</strong> hvis hashen din returnerer alle partall, bruker du bare halve tabellen. Test med distribusjons-statistikk.
              </li>
              <li>
                <strong>Mutable nøkler:</strong> hvis du endrer en nøkkel etter
                innsetting (eks. muterer en liste som er key i en dict),
                korrumperer du tabellen. Python kaster TypeError på unhashable
                types nettopp derfor.
              </li>
              <li>
                <strong>Glemt resize i open addressing:</strong> nær α=1 blir
                insert <code>O(n)</code> per operasjon.
              </li>
              <li>
                <strong>SHA-256 for passord:</strong> for rask. Bruk argon2/bcrypt.
              </li>
              <li>
                <strong>Antar `dict` er ordnet «tilfeldig»:</strong> Python 3.7+
                garanterer insertion-order. Tidligere versjoner gjorde ikke.
              </li>
              <li>
                <strong>HashDoS:</strong> angripere som sender nøkler som alle
                kolliderer til samme bucket → degradering. Python forsvarer seg
                med randomized hash-seed (PYTHONHASHSEED).
              </li>
              <li>
                <strong>Iterere mens du muterer:</strong> resize under iterasjon
                kaster RuntimeError i Python. Snapshot keys() først.
              </li>
            </ul>
          </div>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/drag" className="text-brand hover:underline">
                Drag-oppgaver
              </Link>
              : 9 hashing-oppgaver — chaining vs probing, lastfaktor, bloom.
            </li>
            <li>
              <Link
                to="/stack/$slug"
                params={{ slug: "kryptografi" }}
                className="text-brand hover:underline"
              >
                Kryptografi
              </Link>
              : kryptografisk hashing i detalj — SHA, HMAC.
              <ArrowRight className="inline h-3.5 w-3.5 ml-1" />
            </li>
          </ul>
        </div>
        <RelatedVisualizers slug="hashing" />
      </div>
    </StackPageShell>
  );
}
