import { Link } from "@tanstack/react-router";
import { Lightbulb, Clock, Calculator, KeyRound, Layers, Target } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { ClockArithmeticViz } from "./ClockArithmeticViz";
import { EuclideanAlgorithmViz } from "./EuclideanAlgorithmViz";
import { ModularInverseFinder } from "./ModularInverseFinder";
import { CrtSolver } from "./CrtSolver";
import { ApplicationsQuiz } from "./ApplicationsQuiz";

const STEPS = [
  { title: "Klokke-aritmetikk: hva mod n betyr geometrisk", anchor: "klokke" },
  { title: "Euklids algoritme + Bezouts identitet", anchor: "euklid" },
  { title: "Modulær invers: a⁻¹ mod n", anchor: "invers" },
  { title: "Chinese Remainder Theorem", anchor: "crt" },
  { title: "Applikasjoner: match konsept til use-case", anchor: "apps" },
];

export function ModAritmetikkPage() {
  return (
    <StackPageShell title="Modulær aritmetikk" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            Fase 0 · Math foundations · Diskret matematikk
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Modulær aritmetikk — klokke, gcd, Euklids algoritme, modulær invers
          </h1>
          <p className="mt-3 text-muted-foreground">
            Hele modulær-aritmetikken er ett bilde: en klokke. Når du forstår
            hvorfor "27 mod 12 = 3" geometrisk er "2 hele runder + 3 steg",
            faller resten — gcd, Bezouts identitet, modulær invers, og CRT —
            ut som naturlige operasjoner på den samme klokka. Denne lesjonen
            bygger intuisjonen først, så maskineriet, så bruksområdene (RSA,
            hashing, CRT, ISBN, kalender).
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Forutsetning:</span> du kan litt
              grunnleggende algebra og symbolene{" "}
              <code>mod, gcd, ≡</code>. Hvis ikke,{" "}
              <Link
                to="/stack/$slug"
                params={{ slug: "diskret-matte" }}
                className="text-brand hover:underline"
              >
                Diskret matematikk-trinnet
              </Link>{" "}
              har et kort kapittel om dette først.
            </div>
          </div>
        </div>

        <CourseOutline courseId="diskret-mod-aritmetikk" steps={STEPS} />

        {/* ============================================================ */}
        <section id="klokke" className="mb-12">
          <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
            <Clock className="h-5 w-5 text-brand" />
            1. Klokke-aritmetikk — fundamentet
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            En modulus <code>n</code> er antall posisjoner på en klokke. Hver
            gang vi går forbi <code>n</code>, "ruller vi over" og starter fra
            0. Dette er ikke en regneoperasjon — det er en{" "}
            <em>fysisk modell</em>. Modulær aritmetikk er bare algebraen på
            denne klokken.
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Prøv: n = 12, a = 27, op = "+". Klikk "Animer rotasjon". Du ser
            visuelt at vi går rundt 2 hele runder og lander på 3. Det er{" "}
            <code>27 mod 12 = 3</code>. Bytt til n = 7, a = -3 — du ser at
            negative tall bare betyr "gå mot urviser", men landingsposisjonen
            er alltid i intervallet <code>[0, n-1]</code>.
          </p>
          <ClockArithmeticViz />
          <div className="mt-4 rounded-lg border border-border bg-card p-4 text-sm space-y-2">
            <div className="font-semibold text-foreground">Tre identiteter som faller ut av klokka</div>
            <ul className="list-disc pl-5 text-muted-foreground space-y-1 text-[13px]">
              <li>
                <span className="font-mono text-foreground">
                  (a + b) mod n = ((a mod n) + (b mod n)) mod n
                </span>{" "}
                — du kan redusere først eller addere først; ender på samme
                klokke-posisjon.
              </li>
              <li>
                <span className="font-mono text-foreground">
                  (a · b) mod n = ((a mod n) · (b mod n)) mod n
                </span>{" "}
                — derfor kan vi "fast eksponentiering" uten å beregne det fulle
                tallet a^k.
              </li>
              <li>
                <span className="font-mono text-foreground">a ≡ b (mod n)</span> ⇔{" "}
                <span className="font-mono text-foreground">n | (a - b)</span> — to
                tall er kongruente når deres differanse er et helt antall klokke-runder.
              </li>
            </ul>
          </div>
        </section>

        {/* ============================================================ */}
        <section id="euklid" className="mb-12">
          <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
            <Calculator className="h-5 w-5 text-brand" />
            2. Euklids algoritme — gcd + Bezouts identitet
          </h2>
          <p className="text-sm text-muted-foreground mb-3">
            <strong className="text-foreground">Greatest common divisor</strong>{" "}
            (gcd) er det største heltallet som deler både <code>a</code> og{" "}
            <code>b</code>. Euklid (~300 f.Kr.) viste at gcd er invariant under
            "trekk fra b så mange ganger du kan": <code>gcd(a, b) = gcd(b, a mod b)</code>.
            Iterer til <code>b = 0</code> — da er <code>a</code> = gcd.
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            <strong className="text-foreground">Extended Euclidean</strong> går
            ett skritt videre: den finner heltall <code>x, y</code> slik at{" "}
            <code>a·x + b·y = gcd(a, b)</code>. Dette kalles{" "}
            <em>Bezouts identitet</em> og er nøkkelen til modulær invers,
            som vi bruker i neste seksjon.
          </p>
          <EuclideanAlgorithmViz />
          <div className="mt-4 rounded-lg border border-border bg-card p-4 text-sm space-y-2">
            <div className="font-semibold text-foreground">Hvorfor terminerer Euklid alltid?</div>
            <p className="text-muted-foreground text-[13px]">
              Etter hver iterasjon er <code>r &lt; b</code>, og <code>r ≥ 0</code>.
              Den nye <code>b</code> (= gammel <code>r</code>) er strengt mindre enn
              forrige <code>b</code> og fortsatt ikke-negativ. En strengt avtagende
              sekvens av ikke-negative heltall <em>må</em> nå null. Antall iterasjoner
              er O(log(min(a, b))) — Fibonacci-tall gir worst case.
            </p>
          </div>
        </section>

        {/* ============================================================ */}
        <section id="invers" className="mb-12">
          <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-brand" />
            3. Modulær invers — a⁻¹ mod n
          </h2>
          <p className="text-sm text-muted-foreground mb-3">
            På en klokke kan vi addere, subtrahere og multiplisere fritt. Men{" "}
            <em>divisjon</em> finnes ikke direkte — vi har bare heltall.
            "Divisjon med a" oversettes til "multiplikasjon med a⁻¹". For at
            <code>a⁻¹</code> skal finnes (mod n) må <code>gcd(a, n) = 1</code> —
            de må være <strong className="text-foreground">koprime</strong>.
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Når <code>gcd(a, n) = 1</code>, gir Bezout oss{" "}
            <code>a·x + n·y = 1</code>. Reduser mod n: <code>a·x ≡ 1 (mod n)</code>.
            Altså er <code>x mod n</code> selve inversen — direkte ut av Extended
            Euclidean.
          </p>
          <ModularInverseFinder />
        </section>

        {/* ============================================================ */}
        <section id="crt" className="mb-12">
          <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
            <Layers className="h-5 w-5 text-brand" />
            4. Chinese Remainder Theorem
          </h2>
          <p className="text-sm text-muted-foreground mb-3">
            Hvis du vet rester mod flere parvis koprime tall, så bestemmer det
            <em> entydig</em> en rest mod produktet. Mer formelt: gitt{" "}
            <code>x ≡ a₁ (mod n₁)</code>, <code>x ≡ a₂ (mod n₂)</code>, …, der{" "}
            <code>gcd(nᵢ, nⱼ) = 1</code> for alle <code>i ≠ j</code>, så finnes
            det nøyaktig én løsning <code>x</code> i <code>[0, M)</code> der{" "}
            <code>M = n₁·n₂·…</code>.
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Konstruksjonen er: <code>Mᵢ = M/nᵢ</code>, finn{" "}
            <code>yᵢ = Mᵢ⁻¹ (mod nᵢ)</code> via Extended Euclidean, så er{" "}
            <code>x = Σ aᵢ·Mᵢ·yᵢ (mod M)</code>. Hvert bidrag er null mod alle
            <em> andre</em> nᵢ enn sin egen — derfor matcher hvert ledd den
            ene kongruensen det skal.
          </p>
          <CrtSolver />
        </section>

        {/* ============================================================ */}
        <section id="apps" className="mb-12">
          <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
            <Target className="h-5 w-5 text-brand" />
            5. Hvor brukes dette? Match konsept til use-case
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Modulær aritmetikk er overalt der vi trenger en kompakt
            "fingeravtrykk"-verdi eller skal lukke et tall inn i en boks. Test
            deg selv: for hver bruk under, hvilken teknikk er kjernen?
          </p>
          <ApplicationsQuiz />
        </section>

        {/* ============================================================ */}
        <section id="oppsummering" className="mb-12">
          <h2 className="text-xl font-semibold mb-3">Oppsummering — på én side</h2>
          <div className="rounded-xl border border-border bg-card p-5 text-sm space-y-2">
            <p>
              <strong className="text-foreground">Klokke-modellen</strong> er kjernen:{" "}
              <code>a mod n</code> = posisjonen på en n-posisjons klokke etter a steg.
              Negativ a = mot urviser. Multiplikasjon = repeterte sprang. Addisjon og
              multiplikasjon kommuterer med mod — du kan redusere når du vil.
            </p>
            <p>
              <strong className="text-foreground">gcd</strong> finnes effektivt med
              Euklid: iterer <code>(a, b) ← (b, a mod b)</code> til b = 0. O(log n).
            </p>
            <p>
              <strong className="text-foreground">Modulær invers</strong> eksisterer ⇔
              <code> gcd(a, n) = 1</code>. Beregnes via Extended Euclidean: hent x i
              <code> a·x + n·y = 1</code>, så er <code>a⁻¹ = x mod n</code>.
            </p>
            <p>
              <strong className="text-foreground">CRT</strong> kobler systemer av
              kongruenser på parvis koprime moduli sammen til én rest mod produktet —
              fundamentalt for RSA-CRT, distribuert hashing, og klassiske rest-puslerier.
            </p>
            <p className="text-muted-foreground text-[13px] border-t border-border pt-2">
              Neste steg: lesjonen{" "}
              <Link
                to="/stack/$slug"
                params={{ slug: "diskret-matte" }}
                className="text-brand hover:underline"
              >
                Diskret matematikk
              </Link>{" "}
              har én flashcard-seksjon om mod og hashing, og{" "}
              <Link
                to="/stack/$slug"
                params={{ slug: "kryptografi" }}
                className="text-brand hover:underline"
              >
                Kryptografi
              </Link>{" "}
              bygger RSA, Diffie-Hellman og ECC oppå alt vi bygde her.
            </p>
          </div>
        </section>
      </div>
    </StackPageShell>
  );
}
