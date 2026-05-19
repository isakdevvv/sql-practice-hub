import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { BookOpen, Hash, Sigma, Layers, KeyRound, Workflow, RotateCcw } from "lucide-react";

type Tab = "intro" | "bloom" | "hll" | "lsh" | "sha" | "mapreduce";

export function ProbabilisticBigDataPage() {
  const [tab, setTab] = useState<Tab>("intro");

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">
            Probabilistiske &amp; storskala-algoritmer
          </h1>
          <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
            Seks trinn. Start på «0. Start her» — der introduseres hver byggestein (hash-funksjon,
            bitarray, sannsynlighet) som senere moduler bygger på. De fem neste er hands-on.
          </p>
        </header>

        <div className="mb-4 flex flex-wrap gap-1.5 border-b border-border">
          <TabBtn
            active={tab === "intro"}
            onClick={() => setTab("intro")}
            icon={<BookOpen className="h-3.5 w-3.5" />}
          >
            0. Start her
          </TabBtn>
          <TabBtn
            active={tab === "bloom"}
            onClick={() => setTab("bloom")}
            icon={<Hash className="h-3.5 w-3.5" />}
          >
            1. Bloom
          </TabBtn>
          <TabBtn
            active={tab === "hll"}
            onClick={() => setTab("hll")}
            icon={<Sigma className="h-3.5 w-3.5" />}
          >
            2. HyperLogLog
          </TabBtn>
          <TabBtn
            active={tab === "lsh"}
            onClick={() => setTab("lsh")}
            icon={<Layers className="h-3.5 w-3.5" />}
          >
            3. MinHash / LSH
          </TabBtn>
          <TabBtn
            active={tab === "sha"}
            onClick={() => setTab("sha")}
            icon={<KeyRound className="h-3.5 w-3.5" />}
          >
            4. SHA-avalanche
          </TabBtn>
          <TabBtn
            active={tab === "mapreduce"}
            onClick={() => setTab("mapreduce")}
            icon={<Workflow className="h-3.5 w-3.5" />}
          >
            5. MapReduce
          </TabBtn>
        </div>

        {tab === "intro" && <IntroModule onPick={setTab} />}
        {tab === "bloom" && <BloomModule />}
        {tab === "hll" && <HllModule />}
        {tab === "lsh" && <LshModule />}
        {tab === "sha" && <ShaModule />}
        {tab === "mapreduce" && <MapReduceModule />}

        <Lessons />
      </main>
    </div>
  );
}

function IntroModule({ onPick }: { onPick: (t: Tab) => void }) {
  return (
    <div className="space-y-4 text-sm">
      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-base font-semibold mb-2">Byggestein-ordbok</h2>
        <dl className="space-y-3 text-[13px]">
          <Def term="Hash-funksjon">
            En funksjon som tar en streng/tall og spytter ut et tilsynelatende tilfeldig tall
            innenfor et område. Samme input gir alltid samme output. Eksempel:{" "}
            <code>hash("epler") = 42</code>, <code>hash("bananer") = 7</code>. Brukes til å plassere
            ting i bøtter, oppdage duplikater og mer.
          </Def>
          <Def term="Bitarray">
            Et fast antall bits (0 eller 1) lagt i rekke. Et bitarray med m = 64 bits bruker 8 bytes
            minne. Du kan «sette» bit nr. i ved å skrive 1 der, og «sjekke» ved å lese om det er 0
            eller 1.
          </Def>
          <Def term="Bucket (bøtte)">
            En liten plass med en indeks. «Hash-funksjon plasserer noe i bucket <code>h % m</code>»
            betyr: regn ut hash, ta rest ved deling med m, få et tall mellom 0 og m−1, plasser der.
          </Def>
          <Def term="Kardinalitet">
            Antall <em>unike</em> elementer i en samling. <code>[a, b, a, c, b]</code> har lengde 5
            men kardinalitet 3 (unikt: a, b, c).
          </Def>
          <Def term="Sannsynlig / probabilistisk">
            Algoritmen bruker tilfeldighet og garanterer ikke et perfekt svar, men kommer veldig nær
            med høy sannsynlighet. Bytter litt nøyaktighet mot massiv plass-besparelse.
          </Def>
          <Def term="False positive (falsk positiv)">
            Algoritmen sier «JA, dette er i settet» når svaret faktisk er nei. Bloom-filter kan ha
            false positives, men ALDRI false negatives.
          </Def>
          <Def term="Jaccard-likhet">
            Et tall mellom 0 og 1 som måler hvor like to mengder er.{" "}
            <code>J(A, B) = |A ∩ B| / |A ∪ B|</code>: størrelsen på snittet delt på størrelsen på
            unionen. Helt like → 1. Helt forskjellige → 0.
          </Def>
          <Def term="Shingle (n-gram)">
            En liten bit av en tekst. 3-shingle av «hund» er <code>["hun", "und"]</code>: hver
            3-bokstavs-sekvens. To dokumenter med mange like shingles likner hverandre.
          </Def>
          <Def term="Leading zeros">
            Antall null-bits i starten av et binærtall. F.eks. binær <code>00010110</code> har 3
            leading zeros. Brukes av HyperLogLog som «hvor uvanlig er denne hashen».
          </Def>
          <Def term="Kryptografisk hash (SHA-256)">
            En spesielt sterk hash-funksjon der: (1) du ikke kan reversere den, (2) det er praktisk
            umulig å finne to inputs som gir samme output, og (3) endring av én bit input gir helt
            forskjellig output («avalanche»). SHA-256 gir 256 bits = 32 bytes = 64 hex-tegn.
          </Def>
          <Def term="MapReduce">
            Et mønster for å fordele jobben på mange maskiner: map = bryt opp input i (nøkkel,
            verdi)-par; shuffle = gruppér per nøkkel; reduce = slå sammen verdier i hver gruppe.
            Word-count er kanon-eksempelet.
          </Def>
          <Def term="m, n, k (i Bloom-formler)">
            <ul className="list-disc pl-5 mt-1">
              <li>
                <code>m</code> = antall bits i bitarrayet (større = mindre kollisjon).
              </li>
              <li>
                <code>n</code> = antall elementer du har satt inn.
              </li>
              <li>
                <code>k</code> = antall hash-funksjoner per element.
              </li>
            </ul>
          </Def>
        </dl>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-base font-semibold mb-2">Slik bygger modulene på hverandre</h2>
        <ol className="list-decimal pl-5 space-y-1.5 text-muted-foreground">
          <li>
            <strong className="text-foreground">Bloom (1)</strong> — én bit-array + flere
            hash-funksjoner. Lærer hvordan probabilistiske strukturer funker uten å spore alle
            elementer.
          </li>
          <li>
            <strong className="text-foreground">HyperLogLog (2)</strong> — samme idé, men i stedet
            for å sjekke <em>medlemskap</em> teller vi
            <em>antall unike</em>. Bygger på leading-zeros-trikset.
          </li>
          <li>
            <strong className="text-foreground">MinHash / LSH (3)</strong> — samme «mange
            hash-funksjoner»-mønster, men for å sammenligne
            <em>likhet</em> mellom dokumenter (Jaccard).
          </li>
          <li>
            <strong className="text-foreground">SHA (4)</strong> — bytter «random-aktig»
            hash-funksjon med en kryptografisk sterk. Samme grunnidé, høyere garantier.
          </li>
          <li>
            <strong className="text-foreground">MapReduce (5)</strong> — byggesteinen for storskala
            batch-prosessering. Lar deg kjøre alt over fra (1) til (4) parallelt over enorme
            datasett.
          </li>
        </ol>
        <div className="mt-3 flex gap-2">
          <Button size="sm" onClick={() => onPick("bloom")}>
            Start på modul 1 →
          </Button>
        </div>
      </div>
    </div>
  );
}

function Def({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="font-semibold text-foreground">{term}</dt>
      <dd className="text-muted-foreground mt-0.5">{children}</dd>
    </div>
  );
}

function TabBtn({
  children,
  active,
  onClick,
  icon,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border-b-2 -mb-px transition-colors ${
        active
          ? "border-brand text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

// ============================================================
// Hash-hjelpere — to uavhengige hash-funksjoner som kan komponeres
// til k hash-funksjoner via h1 + i*h2 (Kirsch-Mitzenmacher).
// ============================================================

function fnv1a(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function djb2(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = (h * 33) ^ s.charCodeAt(i);
  }
  return h >>> 0;
}

function hashI(s: string, i: number, m: number): number {
  return ((fnv1a(s) + i * djb2(s)) >>> 0) % m;
}

// ============================================================
// MODUL 1 — BLOOM FILTER
// ============================================================

function BloomModule() {
  const [m, setM] = useState(64);
  const [k, setK] = useState(3);
  const [items, setItems] = useState<string[]>(["epler", "bananer", "appelsiner"]);
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");

  const bits = useMemo(() => {
    const b = new Uint8Array(m);
    for (const s of items) {
      for (let i = 0; i < k; i++) {
        b[hashI(s, i, m)] = 1;
      }
    }
    return b;
  }, [m, k, items]);

  const filled = useMemo(() => bits.reduce((a, x) => a + x, 0), [bits]);
  const fpEmpirical = useMemo(() => {
    if (items.length === 0) return 0;
    const trials = 1000;
    let hits = 0;
    for (let t = 0; t < trials; t++) {
      const probe = `__probe_${t}_${m}_${k}_${items.length}`;
      let all = true;
      for (let i = 0; i < k; i++) {
        if (bits[hashI(probe, i, m)] === 0) {
          all = false;
          break;
        }
      }
      if (all) hits++;
    }
    return hits / trials;
  }, [bits, items, m, k]);
  const fpTheoretical = Math.pow(1 - Math.exp(-(k * items.length) / m), k);

  const queryHashes = useMemo(() => {
    if (!query) return [];
    return Array.from({ length: k }, (_, i) => hashI(query, i, m));
  }, [query, k, m]);
  const queryHit = queryHashes.length > 0 && queryHashes.every((p) => bits[p] === 1);

  function add() {
    const v = input.trim();
    if (v && !items.includes(v)) setItems([...items, v]);
    setInput("");
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
        <strong className="text-foreground">Hva er Bloom-filter?</strong> En rask «har jeg sett
        denne før?»-sjekk. I stedet for å lagre alle elementer (dyrt), lagrer vi bare en bit-array
        på m bits.
        <div className="mt-2">
          <strong className="text-foreground">Innsetting</strong> av «epler»: regn ut k forskjellige
          hash-funksjoner. Hver gir et tall mellom 0 og m−1. Sett alle de k bitene til 1.
        </div>
        <div className="mt-1">
          <strong className="text-foreground">Søk</strong> etter «epler»: regn ut de samme k
          hash-funksjonene. Hvis ALLE k bits er 1 → «sannsynligvis i settet». Hvis EN er 0 →
          «definitivt ikke i settet».
        </div>
        <div className="mt-2">
          Det er <em>asymmetrisk</em>: ingen falske negativer (et innsatt element vil alltid bli
          funnet), men noen falske positiver (ulike elementer kan tilfeldigvis treffe samme k bits).
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs text-muted-foreground">
              m = bits i bitarray: <span className="font-mono font-semibold">{m}</span>
            </label>
            <input
              type="range"
              min={16}
              max={256}
              step={8}
              value={m}
              onChange={(e) => setM(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">
              k = hash-funksjoner per element: <span className="font-mono font-semibold">{k}</span>
            </label>
            <input
              type="range"
              min={1}
              max={10}
              value={k}
              onChange={(e) => setK(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        <div className="mt-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
            Bitarray ({filled}/{m} bits satt)
          </div>
          <div
            className="grid gap-[2px] font-mono text-[8px]"
            style={{ gridTemplateColumns: `repeat(${Math.min(m, 32)}, minmax(0, 1fr))` }}
          >
            {Array.from(bits).map((b, i) => (
              <div
                key={i}
                className={`aspect-square flex items-center justify-center rounded-sm ${
                  queryHashes.includes(i)
                    ? b
                      ? "bg-amber-500 text-white"
                      : "bg-destructive text-white"
                    : b
                      ? "bg-brand text-white"
                      : "bg-muted text-muted-foreground"
                }`}
                title={`bit ${i} = ${b}`}
              >
                {b}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-3 text-xs">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
            Sett inn
          </div>
          <div className="flex gap-1.5">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && add()}
              placeholder="ord..."
              className="flex-1 h-7 rounded border border-border bg-background px-2 text-xs"
            />
            <Button size="sm" onClick={add}>
              Legg til
            </Button>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {items.map((it) => (
              <span
                key={it}
                className="rounded bg-brand/10 border border-brand/30 px-2 py-0.5 font-mono text-[10px]"
              >
                {it}
              </span>
            ))}
          </div>
          <Button size="sm" variant="outline" onClick={() => setItems([])} className="mt-2 gap-1.5">
            <RotateCcw className="h-3 w-3" /> Tøm
          </Button>
        </div>

        <div className="rounded-xl border border-border bg-card p-3 text-xs">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Søk</div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ord..."
            className="w-full h-7 rounded border border-border bg-background px-2 text-xs"
          />
          {query && (
            <div className="mt-2">
              <div className="text-[10px] text-muted-foreground">
                Hash-posisjoner: <span className="font-mono">{queryHashes.join(", ")}</span>
              </div>
              <div
                className={`mt-1 rounded px-2 py-1 text-[11px] font-medium ${
                  queryHit
                    ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                    : "bg-success/10 text-success"
                }`}
              >
                {queryHit
                  ? items.includes(query)
                    ? "✓ Sannsynligvis i settet (alle k bits = 1, og det stemmer)"
                    : "⚠ Sannsynligvis i settet (alle k bits = 1, MEN false positive!)"
                  : "✗ Definitivt IKKE i settet (minst én bit = 0)"}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-3 text-xs grid gap-2 sm:grid-cols-3">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            FP-rate (empirisk)
          </div>
          <div className="font-mono text-base">{(fpEmpirical * 100).toFixed(2)}%</div>
          <div className="text-[10px] text-muted-foreground">
            1000 søk på ord vi ikke har satt inn — hvor ofte sier filteret «sannsynligvis JA» feil.
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            FP-rate (formel)
          </div>
          <div className="font-mono text-base">{(fpTheoretical * 100).toFixed(2)}%</div>
          <div className="text-[10px] text-muted-foreground font-mono mt-1">(1 − e^(−kn/m))^k</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">
            Lest: «sjansen for at en tilfeldig bit ER 1 etter n innsettinger, opphøyd i k» (alle k
            må treffe 1 for false positive).
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Plassbruk
          </div>
          <div className="font-mono text-base">
            {m} bits ≈ {(m / 8).toFixed(0)} B
          </div>
          <div className="text-[10px] text-muted-foreground">
            for {items.length} ord. Ekte set ville brukt ~{items.reduce((s, w) => s + w.length, 0)}{" "}
            bytes minimum.
          </div>
        </div>
      </div>

      <details className="rounded-lg border border-border bg-card p-3 text-xs">
        <summary className="cursor-pointer font-medium text-foreground">
          Hvor kommer formelen fra?
        </summary>
        <div className="mt-2 space-y-1.5 text-muted-foreground">
          <p>
            1. Hver hash-funksjon plukker tilfeldig én bit av m. Sjansen for at en spesifikk bit
            IKKE blir truffet av én hash er <code>(1 − 1/m)</code>.
          </p>
          <p>
            2. Vi setter inn n elementer, hver bruker k hash-funksjoner = <code>k·n</code> treff
            total. Sjansen for at en bit IKKE blir truffet av noen er{" "}
            <code>(1 − 1/m)^(kn) ≈ e^(−kn/m)</code> for stor m.
          </p>
          <p>
            3. Sjansen for at en bit ER truffet (er 1) er da <code>1 − e^(−kn/m)</code>.
          </p>
          <p>
            4. For false positive må ALLE k bits være 1 tilfeldigvis: <code>(1 − e^(−kn/m))^k</code>
            .
          </p>
        </div>
      </details>
    </div>
  );
}

// ============================================================
// MODUL 2 — HYPERLOGLOG
// ============================================================

function leadingZeros(n: number): number {
  // Antall ledende nuller i en 32-bit usignert
  if (n === 0) return 32;
  let z = 0;
  for (let i = 31; i >= 0; i--) {
    if ((n >>> i) & 1) break;
    z++;
  }
  return z;
}

function HllModule() {
  const [b, setB] = useState(4); // p = antall buckets-bits → m = 2^b buckets
  const [stream, setStream] = useState<string[]>([]);
  const [input, setInput] = useState(
    "Olav,Pia,Pia,Kari,Olav,Per,Eli,Jon,Kari,Tom,Pia,Anna,Tor,Eli,Kåre,Tom,Mari,Pia",
  );

  const m = 1 << b;

  const { buckets, estimate, exact } = useMemo(() => {
    const buckets = new Uint8Array(m);
    const exactSet = new Set<string>();
    for (const x of stream) {
      exactSet.add(x);
      const h = fnv1a(x);
      const bucketIdx = h & (m - 1);
      const rest = h >>> b;
      const w = leadingZeros(rest) - b + 1;
      if (w > buckets[bucketIdx]) buckets[bucketIdx] = w;
    }
    // HLL-estimat: alpha_m * m^2 / sum(2^-M_j)
    let alpha = 0.7213 / (1 + 1.079 / m);
    if (m === 16) alpha = 0.673;
    else if (m === 32) alpha = 0.697;
    else if (m === 64) alpha = 0.709;
    let sum = 0;
    for (let i = 0; i < m; i++) sum += Math.pow(2, -buckets[i]);
    const estRaw = sum > 0 ? (alpha * m * m) / sum : 0;
    // Small-range correction
    let est = estRaw;
    const zeros = [...buckets].filter((v) => v === 0).length;
    if (estRaw <= 2.5 * m && zeros > 0) {
      est = m * Math.log(m / zeros);
    }
    return { buckets, estimate: est, exact: exactSet.size };
  }, [stream, m, b]);

  function ingest() {
    const items = input
      .split(/[,\s]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    setStream([...stream, ...items]);
    setInput("");
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground space-y-2">
        <div>
          <strong className="text-foreground">Hva er HyperLogLog?</strong> En måte å estimere{" "}
          <em>kardinalitet</em> (antall unike elementer) uten å lagre elementene. Bytter litt
          nøyaktighet mot drastisk mindre minne.
        </div>
        <div>
          <strong className="text-foreground">Intuisjonen — flippe mynter:</strong> hvis du flipper
          en mynt mange ganger og ser «kron, kron, kron, kron» (4 ledende kron-er), så har du
          sannsynligvis flippet ca. <code>2⁴ = 16</code> ganger totalt. Jo flere kron på rad, jo
          flere flips. HLL bruker det motsatt: jo flere leading zeros vi har sett i hashene av
          input, jo flere unike elementer har vi sannsynligvis sett.
        </div>
        <div>
          <strong className="text-foreground">Algoritmen:</strong>
          <ol className="list-decimal pl-5 mt-1 space-y-0.5">
            <li>Hash hvert element → 32-bit tall.</li>
            <li>
              Bruk de første <code>b</code> bitsene til å velge bucket (av m = 2^b buckets). Resten
              av bitene er det vi måler.
            </li>
            <li>
              Tell leading zeros i resten. Hvis denne er større enn det bucketen allerede har
              lagret, oppdater.
            </li>
            <li>Helt til slutt: regn ut estimatet basert på alle bucket-verdiene.</li>
          </ol>
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card p-4">
        <label className="text-xs text-muted-foreground">
          b = bits brukt til bucket-indeks → m = 2^{b} ={" "}
          <span className="font-mono font-semibold">{m}</span> buckets
        </label>
        <input
          type="range"
          min={3}
          max={8}
          value={b}
          onChange={(e) => setB(Number(e.target.value))}
          className="w-full max-w-md"
        />

        <div className="mt-3 text-xs">
          <label className="text-muted-foreground">
            Strøm av navn (komma- eller mellomrom-separert):
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={2}
            className="w-full mt-1 rounded border border-border bg-background p-2 font-mono text-[11px]"
          />
          <div className="flex gap-2 mt-2">
            <Button size="sm" onClick={ingest}>
              Spis strøm
            </Button>
            <Button size="sm" variant="outline" onClick={() => setStream([])} className="gap-1.5">
              <RotateCcw className="h-3 w-3" /> Tøm
            </Button>
            <span className="self-center text-[10px] text-muted-foreground">
              {stream.length} elementer ingestert
            </span>
          </div>
        </div>

        <div className="mt-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
            Buckets (verdi = lengste «ledende nuller» sett i den bucketen)
          </div>
          <div
            className="grid gap-1 font-mono text-[10px]"
            style={{ gridTemplateColumns: `repeat(${Math.min(m, 16)}, minmax(0, 1fr))` }}
          >
            {Array.from(buckets).map((v, i) => (
              <div
                key={i}
                className={`aspect-square flex items-center justify-center rounded ${
                  v > 0 ? "bg-brand/15 border border-brand/40" : "bg-muted border border-border"
                }`}
                title={`bucket ${i}`}
              >
                {v}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-3 text-xs grid gap-2 sm:grid-cols-3">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            HLL-estimat
          </div>
          <div className="font-mono text-base">{estimate.toFixed(1)}</div>
          <div className="text-[10px] text-muted-foreground">unike elementer</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Eksakt (Set.size)
          </div>
          <div className="font-mono text-base">{exact}</div>
          <div className="text-[10px] text-muted-foreground">koster O(n) minne</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Feil</div>
          <div className="font-mono text-base">
            {exact === 0 ? "—" : `${(((estimate - exact) / exact) * 100).toFixed(1)}%`}
          </div>
          <div className="text-[10px] text-muted-foreground">
            Forventet typisk feil:{" "}
            <code>≈ 1.04 / √m = {((1.04 / Math.sqrt(m)) * 100).toFixed(1)}%</code>
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">
            (Konstanten 1.04 kommer fra matematisk analyse av estimator-variansen. Dobl m → halver
            feil-margin.)
          </div>
        </div>
      </div>

      <div className="text-xs text-muted-foreground rounded-lg border border-border bg-card p-3">
        Med m = {m} buckets bruker HLL bare ≈ <code>{(m * 5) / 8} bytes</code> (hver bucket lagrer
        et lite tall, typisk 5 bits) — uansett om vi teller 100 eller 100 millioner unike elementer.
        Eksakt-telling med Set krever <code>O(n)</code> minne (alt må lagres). HLL bytter noen
        prosent nøyaktighet mot dramatisk plass-besparelse.
      </div>
    </div>
  );
}

// ============================================================
// MODUL 3 — MinHash / LSH
// ============================================================

function shingle(s: string, n: number): string[] {
  const set = new Set<string>();
  const clean = s.toLowerCase().replace(/\s+/g, " ").trim();
  for (let i = 0; i <= clean.length - n; i++) {
    set.add(clean.slice(i, i + n));
  }
  return [...set];
}

function jaccard(a: string[], b: string[]): number {
  const sa = new Set(a);
  const sb = new Set(b);
  const inter = [...sa].filter((x) => sb.has(x)).length;
  const uni = new Set([...sa, ...sb]).size;
  return uni === 0 ? 0 : inter / uni;
}

function minHashSig(shingles: string[], k: number): number[] {
  const sig: number[] = new Array(k).fill(Infinity);
  for (const sh of shingles) {
    for (let i = 0; i < k; i++) {
      const h = hashI(sh, i, 0xffffffff);
      if (h < sig[i]) sig[i] = h;
    }
  }
  return sig;
}

function sigSimilarity(a: number[], b: number[]): number {
  let eq = 0;
  for (let i = 0; i < a.length; i++) if (a[i] === b[i]) eq++;
  return eq / a.length;
}

function LshModule() {
  const [docA, setDocA] = useState("Den raske brune reven hopper over den late hunden.");
  const [docB, setDocB] = useState("Den raske brune reven hopper over en lat hund.");
  const [n, setN] = useState(3);
  const [k, setK] = useState(50);

  const shA = useMemo(() => shingle(docA, n), [docA, n]);
  const shB = useMemo(() => shingle(docB, n), [docB, n]);
  const j = useMemo(() => jaccard(shA, shB), [shA, shB]);
  const sigA = useMemo(() => minHashSig(shA, k), [shA, k]);
  const sigB = useMemo(() => minHashSig(shB, k), [shB, k]);
  const minSim = useMemo(() => sigSimilarity(sigA, sigB), [sigA, sigB]);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground space-y-2">
        <div>
          <strong className="text-foreground">Hva er MinHash / LSH?</strong> En måte å estimere hvor
          like to dokumenter er, uten å sammenligne dem ord-for-ord. Brukes til plagiat-deteksjon,
          dedup, anbefalings-systemer.
        </div>
        <div>
          <strong className="text-foreground">Trinn-for-trinn:</strong>
          <ol className="list-decimal pl-5 mt-1 space-y-0.5">
            <li>
              Bryt opp hvert dokument i <em>shingles</em> (n-bokstavs-biter). «hund» med n=3 →{" "}
              <code>["hun", "und"]</code>. Du har nå et SETT av shingles per dokument.
            </li>
            <li>
              Eksakt likhet er Jaccard: <code>|A∩B| / |A∪B|</code>. Hvis A og B har 10 shingles til
              felles og 15 totalt (union) → 10/15 = 67% like.
            </li>
            <li>
              <strong>MinHash-trikset:</strong> for hver av k hash-funksjoner, regn ut hash(s) for
              hver shingle s i settet, og behold den MINSTE verdien. Det blir én tall per hash.
              Settets «signatur» er disse k tallene.
            </li>
            <li>
              To dokumenter har samme MinHash-verdi for en gitt hash hvis og bare hvis de deler
              shingle som tilfeldigvis hashet til det minste tallet. Sjansen for det er nøyaktig
              Jaccard-likheten! Så % like signatur-celler ≈ Jaccard.
            </li>
          </ol>
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card p-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Dokument A
          </label>
          <textarea
            value={docA}
            onChange={(e) => setDocA(e.target.value)}
            rows={3}
            className="w-full mt-1 rounded border border-border bg-background p-2 font-mono text-[11px]"
          />
          <div className="text-[10px] text-muted-foreground mt-1">
            {shA.length} {n}-shingles
          </div>
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Dokument B
          </label>
          <textarea
            value={docB}
            onChange={(e) => setDocB(e.target.value)}
            rows={3}
            className="w-full mt-1 rounded border border-border bg-background p-2 font-mono text-[11px]"
          />
          <div className="text-[10px] text-muted-foreground mt-1">
            {shB.length} {n}-shingles
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 text-xs">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-muted-foreground">
              Shingle-størrelse n: <span className="font-mono font-semibold">{n}</span>
            </label>
            <input
              type="range"
              min={2}
              max={6}
              value={n}
              onChange={(e) => setN(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="text-muted-foreground">
              Antall hash-funksjoner k: <span className="font-mono font-semibold">{k}</span>
            </label>
            <input
              type="range"
              min={5}
              max={200}
              step={5}
              value={k}
              onChange={(e) => setK(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        <div className="mt-3 text-[10px] uppercase tracking-wider text-muted-foreground">
          Signatur-sammenligning (første 20)
        </div>
        <div
          className="grid grid-cols-20 gap-[2px] mt-1"
          style={{ gridTemplateColumns: "repeat(20, minmax(0, 1fr))" }}
        >
          {sigA.slice(0, 20).map((v, i) => {
            const eq = v === sigB[i];
            return (
              <div key={i} className="flex flex-col gap-[1px]">
                <div
                  className={`h-3 rounded-sm ${eq ? "bg-success" : "bg-muted"}`}
                  title={`A[${i}]=${v}`}
                />
                <div
                  className={`h-3 rounded-sm ${eq ? "bg-success" : "bg-muted"}`}
                  title={`B[${i}]=${sigB[i]}`}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-3 text-xs grid gap-2 sm:grid-cols-3">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Eksakt Jaccard
          </div>
          <div className="font-mono text-base">{(j * 100).toFixed(1)}%</div>
          <div className="text-[10px] text-muted-foreground">|A∩B| / |A∪B|</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            MinHash-estimat
          </div>
          <div className="font-mono text-base">{(minSim * 100).toFixed(1)}%</div>
          <div className="text-[10px] text-muted-foreground">% like signatur-celler</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Plassbruk
          </div>
          <div className="font-mono text-base">{k * 4} bytes</div>
          <div className="text-[10px] text-muted-foreground">uavhengig av dokument-størrelse</div>
        </div>
      </div>

      <div className="text-xs text-muted-foreground rounded-lg border border-border bg-card p-3">
        For ekte LSH (locality-sensitive hashing): del signaturen i {Math.floor(k / 5)} bånd × 5
        rader, og hash hvert bånd. To dokumenter kollideres som «kandidater» hvis minst ett bånd
        matcher — dette gjør at det er O(1) å finne like par i milliarder av dokumenter.
      </div>
    </div>
  );
}

// ============================================================
// MODUL 4 — SHA-AVALANCHE
// ============================================================

async function sha256Hex(s: string): Promise<string> {
  const data = new TextEncoder().encode(s);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function hexDiffBits(
  a: string,
  b: string,
): { diffBits: number; totalBits: number; diffMask: boolean[] } {
  const len = Math.min(a.length, b.length);
  let diffBits = 0;
  const diffMask: boolean[] = [];
  for (let i = 0; i < len; i++) {
    const va = parseInt(a[i], 16);
    const vb = parseInt(b[i], 16);
    const xor = va ^ vb;
    diffMask.push(xor !== 0);
    for (let bi = 0; bi < 4; bi++) if ((xor >> bi) & 1) diffBits++;
  }
  return { diffBits, totalBits: len * 4, diffMask };
}

function ShaModule() {
  const [a, setA] = useState("Heisann verden");
  const [b, setB] = useState("Heisann verdfn"); // én bokstav flippet
  const [hashA, setHashA] = useState("");
  const [hashB, setHashB] = useState("");

  useEffect(() => {
    sha256Hex(a).then(setHashA);
    sha256Hex(b).then(setHashB);
  }, [a, b]);

  const { diffBits, totalBits, diffMask } = useMemo(
    () =>
      hashA && hashB ? hexDiffBits(hashA, hashB) : { diffBits: 0, totalBits: 256, diffMask: [] },
    [hashA, hashB],
  );

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground space-y-2">
        <div>
          <strong className="text-foreground">Hva er en kryptografisk hash?</strong> En vanlig
          hash-funksjon (som dem i Bloom/HLL) trenger bare å se tilsynelatende tilfeldig ut. En{" "}
          <em>kryptografisk</em> hash som SHA-256 må også:
          <ul className="list-disc pl-5 mt-1 space-y-0.5">
            <li>
              <strong className="text-foreground">Ikke kunne reverseres</strong> — gitt en hash,
              umulig å finne en input som gir den.
            </li>
            <li>
              <strong className="text-foreground">Kollisjons-resistent</strong> — praktisk umulig å
              finne to inputs som gir samme hash.
            </li>
            <li>
              <strong className="text-foreground">Avalanche</strong> — endring av én bit input
              flipper omtrent halvparten av output-bitene uforutsigbart.
            </li>
          </ul>
        </div>
        <div>
          <strong className="text-foreground">Test avalanche:</strong> endre én bokstav i input B og
          se på den uthevete (gule) hex-tegnene under — det er de delene av hashen som har endret
          seg.
        </div>
        <div>
          <strong className="text-foreground">Hex (heksadesimal):</strong> en måte å skrive 4 bits
          per tegn (0–9, a–f). SHA-256 output er 256 bits = 64 hex-tegn.
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card p-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Input A
          </label>
          <input
            value={a}
            onChange={(e) => setA(e.target.value)}
            className="w-full mt-1 rounded border border-border bg-background p-2 font-mono text-xs"
          />
          <div className="text-[10px] text-muted-foreground mt-1 font-mono break-all">
            {hashA.split("").map((c, i) => (
              <span key={i} className={diffMask[i] ? "bg-amber-500/30 px-[1px]" : ""}>
                {c}
              </span>
            ))}
          </div>
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Input B
          </label>
          <input
            value={b}
            onChange={(e) => setB(e.target.value)}
            className="w-full mt-1 rounded border border-border bg-background p-2 font-mono text-xs"
          />
          <div className="text-[10px] text-muted-foreground mt-1 font-mono break-all">
            {hashB.split("").map((c, i) => (
              <span key={i} className={diffMask[i] ? "bg-amber-500/30 px-[1px]" : ""}>
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-3 text-xs grid gap-2 sm:grid-cols-3">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Endrede bits i hash
          </div>
          <div className="font-mono text-base">
            {diffBits} / {totalBits}
          </div>
          <div className="text-[10px] text-muted-foreground">
            {((diffBits / totalBits) * 100).toFixed(1)}% av output
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Forventet (god hash)
          </div>
          <div className="font-mono text-base">~50%</div>
          <div className="text-[10px] text-muted-foreground">avalanche-effekt</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Endrede bits i input
          </div>
          <div className="font-mono text-base">{countBitDiff(a, b)}</div>
          <div className="text-[10px] text-muted-foreground">
            {a.length === b.length && a !== b ? "én bokstav = ~3 bits" : "ulik lengde"}
          </div>
        </div>
      </div>

      <div className="text-xs text-muted-foreground rounded-lg border border-border bg-card p-3">
        Flipp én bokstav i input — over halvparten av output-bitene endrer seg. Det er det som gjør
        at SHA-256 kan brukes til content-addressed storage (Git-objekter, IPFS), passord-hashing
        (med salt), og digitale signaturer: små endringer i input gir uforutsigbart store endringer
        i output.
      </div>
    </div>
  );
}

function countBitDiff(a: string, b: string): number {
  let d = 0;
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i++) {
    const ca = a.charCodeAt(i) || 0;
    const cb = b.charCodeAt(i) || 0;
    let xor = ca ^ cb;
    while (xor) {
      d += xor & 1;
      xor >>>= 1;
    }
  }
  return d;
}

// ============================================================
// MODUL 5 — MAPREDUCE
// ============================================================

type Phase = "input" | "map" | "shuffle" | "reduce";

const MR_DEFAULT_TEXT = "katt hund katt fisk hund katt hund mus mus katt fisk fisk hund fisk katt";

function MapReduceModule() {
  const [text, setText] = useState(MR_DEFAULT_TEXT);
  const [phase, setPhase] = useState<Phase>("input");

  const words = useMemo(() => text.split(/\s+/).filter(Boolean), [text]);
  const splits = useMemo(() => {
    const n = words.length;
    const a = Math.ceil(n / 3);
    return [words.slice(0, a), words.slice(a, 2 * a), words.slice(2 * a)];
  }, [words]);

  // Map: hver mapper produserer (word, 1) par
  const mapped = useMemo(
    () => splits.map((arr) => arr.map((w) => [w, 1] as [string, number])),
    [splits],
  );

  // Shuffle: gruppér per nøkkel på tvers av mappers
  const shuffled = useMemo(() => {
    const m = new Map<string, number[]>();
    for (const mp of mapped) {
      for (const [k, v] of mp) {
        if (!m.has(k)) m.set(k, []);
        m.get(k)!.push(v);
      }
    }
    return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [mapped]);

  // Reduce: sum
  const reduced = useMemo(
    () => shuffled.map(([k, vs]) => [k, vs.reduce((a, b) => a + b, 0)] as [string, number]),
    [shuffled],
  );

  const phases: Phase[] = ["input", "map", "shuffle", "reduce"];

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground space-y-2">
        <div>
          <strong className="text-foreground">Hva er MapReduce?</strong> Et mønster for å
          distribuere en stor jobb over mange maskiner. Vi viser her klassikeren <em>word-count</em>
          : tell antall forekomster av hvert ord.
        </div>
        <div>
          <strong className="text-foreground">Fasene</strong> (klikk knappene i rekkefølge):
          <ol className="list-decimal pl-5 mt-1 space-y-0.5">
            <li>
              <strong className="text-foreground">Input:</strong> tekst splittes i 3 like store
              blokker. Hver blokk får sin egen mapper.
            </li>
            <li>
              <strong className="text-foreground">Map:</strong> hver mapper kjører{" "}
              <em>parallelt</em> og emitterer <code>(ord, 1)</code> for hvert ord. «Emittere» =
              sende videre til neste fase.
            </li>
            <li>
              <strong className="text-foreground">Shuffle:</strong> alle <code>(ord, 1)</code>-par
              fra ulike mappere grupperes per nøkkel («ord»). Resultatet er{" "}
              <code>(ord, [1, 1, 1, ...])</code>.
            </li>
            <li>
              <strong className="text-foreground">Reduce:</strong> for hver nøkkel: slå sammen
              verdilista. Her: summer 1-erne for å få antallet.
            </li>
          </ol>
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card p-4">
        <label className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Input-tekst
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={2}
          className="w-full mt-1 rounded border border-border bg-background p-2 font-mono text-xs"
        />
        <div className="mt-2 flex flex-wrap gap-1.5">
          {phases.map((p) => (
            <Button
              key={p}
              size="sm"
              variant={phase === p ? "default" : "outline"}
              onClick={() => setPhase(p)}
            >
              {p}
            </Button>
          ))}
        </div>
      </div>

      {phase === "input" && (
        <div className="rounded-xl border border-border bg-card p-3 text-xs">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
            1. INPUT — {words.length} ord splittes i 3 blokker (én per mapper)
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            {splits.map((s, i) => (
              <div key={i} className="rounded border border-border bg-background p-2">
                <div className="text-[10px] text-muted-foreground mb-1">
                  Blokk {i + 1} → Mapper {i + 1}
                </div>
                <div className="font-mono">{s.join(" ")}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {phase === "map" && (
        <div className="rounded-xl border border-border bg-card p-3 text-xs">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
            2. MAP — hver mapper emitterer (word, 1) parallelt
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            {mapped.map((m, i) => (
              <div key={i} className="rounded border border-brand/40 bg-brand/5 p-2">
                <div className="text-[10px] text-muted-foreground mb-1">Mapper {i + 1} output</div>
                <div className="font-mono space-y-0.5">
                  {m.map(([k, v], j) => (
                    <div key={j}>
                      ({k}, {v})
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {phase === "shuffle" && (
        <div className="rounded-xl border border-border bg-card p-3 text-xs">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
            3. SHUFFLE — grupperer alle (k, v) per k på tvers av mappers
          </div>
          <div className="font-mono space-y-1">
            {shuffled.map(([k, vs]) => (
              <div key={k} className="flex items-center gap-2">
                <span className="font-semibold w-16">{k}:</span>
                <span className="text-muted-foreground">[{vs.join(", ")}]</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {phase === "reduce" && (
        <div className="rounded-xl border border-border bg-card p-3 text-xs">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
            4. REDUCE — sum hver verdiliste
          </div>
          <table className="w-full">
            <thead className="text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left py-1">Nøkkel</th>
                <th className="text-right py-1">Sum</th>
              </tr>
            </thead>
            <tbody>
              {reduced.map(([k, v]) => (
                <tr key={k} className="border-t border-border">
                  <td className="py-1.5 font-mono">{k}</td>
                  <td className="py-1.5 text-right font-mono font-semibold">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="text-xs text-muted-foreground rounded-lg border border-border bg-card p-3">
        MapReduce-mønsteret er hvorfor Google kunne indeksere hele weben i 2004: map + reduce er den
        eneste primitiv-paret du trenger for å distribuere det meste av batch-arbeid. Spark og
        Hadoop bygger på akkurat dette, bare med fler-lags abstraksjoner over.
      </div>
    </div>
  );
}

// ============================================================
// FELLES — Lessons
// ============================================================

function Lessons() {
  return (
    <section className="mt-10 space-y-3 text-sm">
      <h2 className="text-lg font-semibold">Hvorfor Grokking kap. 13 finnes</h2>
      <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
        <li>
          <strong className="text-foreground">Probabilistiske datastrukturer</strong> (Bloom, HLL,
          MinHash) bytter litt nøyaktighet mot massiv plass-besparelse. De er det som lar Cassandra,
          Redis og Google sjekke milliarder av elementer i konstant minne.
        </li>
        <li>
          <strong className="text-foreground">Kryptografiske hashes</strong> (SHA) har
          avalanche-egenskapen som gjør dem brukbare til content-addressing, integritet og signering
          — ulik «vanlige» hash- funksjoner som bare prøver å unngå kollisjoner.
        </li>
        <li>
          <strong className="text-foreground">MapReduce-mønsteret</strong> er hvorfor du i det hele
          tatt kan ha big-data: bryt opp jobben i parallelle map-er, samle med shuffle, reduser.
          Stort sett alt fra Hadoop til BigQuery er bare varianter over dette.
        </li>
        <li>
          Grokking-boka stopper her som «hvor går du videre». Disse fem datastrukturene/mønstrene er
          inngangsporten til distribuerte systemer og databaser — neste steg er bøker som Kleppmann
          (DDIA) og Petrov (Database Internals).
        </li>
      </ul>
    </section>
  );
}
