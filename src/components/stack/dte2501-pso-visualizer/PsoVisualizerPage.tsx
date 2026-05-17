import { Link } from "@tanstack/react-router";
import { Lightbulb, Layers, ArrowLeft } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { PsoSwarmPlot } from "./PsoSwarmPlot";
import { Tex, TexBlock } from "@/components/Tex";

const STEPS = [
  { title: "Hva visualiseringen viser", anchor: "intro" },
  { title: "Live-plot — eksperimenter", anchor: "live" },
  { title: "Funksjonene — hvorfor de er harde", anchor: "functions" },
  { title: "PSO-ligningen — hva hver term gjør", anchor: "equation" },
  { title: "Parameter-intuisjon", anchor: "params" },
  { title: "Eksamen-hurtigreferanse", anchor: "exam" },
];

export function PsoVisualizerPage() {
  return (
    <StackPageShell title="PSO — visualizer" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2501 · Interaktiv visualisering
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Particle Swarm Optimization — se svermen jobbe
          </h1>
          <p className="mt-3 text-muted-foreground">
            PSO er en populasjons-basert optimalisering inspirert av flokk-atferd
            hos fugler og fisk. Hver partikkel «flyr» rundt i parameter-rommet,
            husker sin egen beste posisjon (pBest) og kjenner sværens beste
            (gBest). Hastigheten justeres mot begge — balansen mellom egen
            erfaring (c1) og sosial info (c2) avgjør om svermen utforsker bredt
            eller konvergerer raskt.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Tips:</span> start på Rastrigin med{" "}
              <code className="font-mono">w = 0.7</code>,{" "}
              <code className="font-mono">c1 = c2 = 1.5</code> (klassisk
              Shi-Eberhart). Trykk Play og se hvordan partiklene først «sprer
              seg» (utforskning), så «klumper seg» mot stjerna (konvergens).
              Skru deretter w opp til 1.4 og se hva som skjer — svermen overstyrer
              og lander aldri.
            </div>
          </div>
        </div>

        <CourseOutline courseId="dte2501-pso-visualizer" steps={STEPS} />

        <section id="intro" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Hva visualiseringen viser</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Heatmap-fargen viser fitness-verdien: mørk blå = lav fitness (bra,
            siden vi minimerer), varm rød = høy fitness (dårlig). De svake
            iso-linjene markerer høyder. Hver hvit prikk er en partikkel, og
            den korte hvite halen viser velocity-vektoren (hvor partikkelen kom
            fra). Den blekhvite punkt-skyggen er pBest for hver partikkel; den
            gule stjernen er gBest — sværens kollektive beste posisjon.
          </p>
          <p className="text-sm text-muted-foreground">
            Under heatmappet viser konvergens-grafen beste fitness over tid. På
            en velkalibrert PSO synker den raskt og flater ut nær null.
          </p>
        </section>

        <section id="live" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Live-plot — eksperimenter</h2>
          <PsoSwarmPlot />
          <p className="mt-3 text-xs text-muted-foreground">
            Bytt funksjon, juster <Tex>{"w, c_1, c_2"}</Tex>, og prøv de tre
            presets nederst. Du skal kunne identifisere hvilken preset er «for
            høy inertia», «for lav c2» og «balansert» bare ved å se på
            sværens bevegelse og konvergens-grafen — før du trykker «Fasit».
          </p>
        </section>

        <section id="functions" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Funksjonene — hvorfor de er harde</h2>
          <div className="space-y-3">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="font-medium text-sm mb-1">Rastrigin</div>
              <p className="text-xs text-muted-foreground">
                <Tex>{"f(x,y) = 20 + (x^2 - 10\\cos 2\\pi x) + (y^2 - 10\\cos 2\\pi y)"}</Tex>.
                Globalt minimum i <Tex>{"(0,0)"}</Tex>, men det er hundrevis av
                lokale minima i et regelmessig rutenett pga. cosinus-leddet.
                Gradient-baserte metoder setter seg fast øyeblikkelig; PSO
                klarer den fordi populasjonen utforsker mange daler parallelt.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="font-medium text-sm mb-1">Ackley</div>
              <p className="text-xs text-muted-foreground">
                Klassisk «utforskning vs utnyttelse»-test. Glatt overall trakt
                mot <Tex>{"(0,0)"}</Tex>, men dekket av tette små rifler. PSO
                må ha nok inertia/spredning til å ikke låses i en rifle på vei
                inn.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="font-medium text-sm mb-1">Daler («fjell og daler»)</div>
              <p className="text-xs text-muted-foreground">
                Konstruert sum av gaussiske «daler» med ulik dybde. Det globale
                minimum er en smal, dyp dal nær sentrum; tre mindre lokale daler
                forsøker å fange svermen. Bra for å demonstrere hvordan c2 (sosial
                info) drar partikler ut av lokale optima.
              </p>
            </div>
          </div>
        </section>

        <section id="equation" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. PSO-ligningen — hva hver term gjør</h2>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm">
            <p>Hver tick, for hver partikkel <Tex>{"i"}</Tex>:</p>
            <TexBlock>{"v_i \\leftarrow w\\,v_i + c_1 r_1 (\\text{pBest}_i - x_i) + c_2 r_2 (\\text{gBest} - x_i)"}</TexBlock>
            <TexBlock>{"x_i \\leftarrow x_i + v_i"}</TexBlock>
            <ul className="text-xs text-muted-foreground list-disc pl-5 space-y-1">
              <li>
                <strong>Inertia-term</strong> <Tex>{"w\\,v_i"}</Tex>: «momentum» —
                partikkelen vil fortsette i samme retning. Høyt w = mer
                utforskning. Lavt w = raskere konvergens.
              </li>
              <li>
                <strong>Kognitiv term</strong>{" "}
                <Tex>{"c_1 r_1 (\\text{pBest}_i - x_i)"}</Tex>: trekker partikkelen
                mot egen beste opplevde posisjon. «Individualisme».
              </li>
              <li>
                <strong>Sosial term</strong>{" "}
                <Tex>{"c_2 r_2 (\\text{gBest} - x_i)"}</Tex>: trekker partikkelen
                mot sværens beste. «Kollektiv visdom».
              </li>
              <li>
                <Tex>{"r_1, r_2 \\sim U(0,1)"}</Tex> — nye tilfeldige tall per tick.
                Stokastisitet hindrer at hele svermen kollapser deterministisk.
              </li>
            </ul>
          </div>
        </section>

        <section id="params" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Parameter-intuisjon</h2>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm">
            <div>
              <div className="font-semibold">Inertia w</div>
              <p className="text-xs text-muted-foreground">
                Anbefalt 0.4–0.9. <strong>w &gt; 1</strong>: hastighet vokser
                ubegrenset → svermen flyr ut og finner aldri ro.{" "}
                <strong>w &lt; 0.3</strong>: ingen momentum → klassisk «lokal
                søk»-oppførsel, fanges lett i lokale minima.
              </p>
            </div>
            <div>
              <div className="font-semibold">Kognitiv c1 vs sosial c2</div>
              <p className="text-xs text-muted-foreground">
                Klassisk: <Tex>{"c_1 = c_2 \\approx 1.5\\text{–}2.0"}</Tex>.{" "}
                <strong>c1 stor, c2 liten</strong>: hver partikkel jakter sin
                egen pBest — sverm spres ut og setter seg i flere lokale minima
                samtidig.{" "}
                <strong>c2 stor, c1 liten</strong>: alle stormer mot gBest —
                rask konvergens, men hvis gBest er en lokal felle har dere et
                problem.
              </p>
            </div>
            <div>
              <div className="font-semibold">Antall partikler n</div>
              <p className="text-xs text-muted-foreground">
                Typisk 20–50. Flere = bedre utforskning, men lineært dyrere per
                tick. På Rastrigin trenger du fler enn på Ackley fordi det er
                fler lokale minima å lete gjennom.
              </p>
            </div>
            <div>
              <div className="font-semibold">Start-spread</div>
              <p className="text-xs text-muted-foreground">
                Initial diversitet. Liten spread = sverm starter klumpet og kan
                gå glipp av globalt minimum. Stor spread = god dekning, men
                trenger fler iterasjoner for å konvergere.
              </p>
            </div>
          </div>
        </section>

        <section id="exam" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Eksamen-hurtigreferanse</h2>
          <div className="rounded-xl border border-brand/30 bg-brand/5 p-5 space-y-2 text-sm">
            <div>
              <strong>«Skriv PSO-oppdateringen.»</strong>{" "}
              <Tex>{"v \\leftarrow w v + c_1 r_1 (\\text{pBest} - x) + c_2 r_2 (\\text{gBest} - x);\\ x \\leftarrow x + v"}</Tex>.
            </div>
            <div>
              <strong>«Hva er forskjell på pBest og gBest?»</strong> pBest =
              hver partikkels egen beste posisjon noensinne. gBest = beste
              posisjon noen partikkel i svermen har funnet.
            </div>
            <div>
              <strong>«Hva styrer eksplorasjon vs eksploitasjon?»</strong>{" "}
              Inertia w (høy = utforskning), c1 og c2 (sammen styrer hvor raskt
              partiklene trekkes mot kjente gode punkter). Mange varianter
              bruker også avtakende w over tid: start høy, krymp mot null.
            </div>
            <div>
              <strong>«PSO vs GA?»</strong> Begge er populasjonsbaserte og
              gradient-frie. GA bruker seleksjon + crossover + mutasjon på en
              fiks populasjon. PSO holder samme partikler hele veien — det er
              bare hastighet og posisjon som oppdateres. PSO konvergerer ofte
              raskere, GA håndterer diskrete/kombinatoriske rom bedre.
            </div>
            <div>
              <strong>«Hvorfor stokastiske <Tex>{"r_1, r_2"}</Tex>?»</strong>{" "}
              Uten dem ville partikler med samme initial-tilstand følge identiske
              baner; sverm-diversitet kollapser. <Tex>{"r_i \\sim U(0,1)"}</Tex>{" "}
              skaleres uavhengig hver dimensjon og hver tick.
            </div>
          </div>
        </section>

        <div className="rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2 flex items-center gap-2">
            <Layers className="h-4 w-4 text-brand" />
            Relatert
          </h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link
                to="/stack/$slug"
                params={{ slug: "dte2501-genetic-algorithms" }}
                className="text-brand hover:underline"
              >
                Genetic algorithms, swarm, ACO
              </Link>{" "}
              — bredere teori-side: GA-operatorer, ACO og PSO i kontekst.
            </li>
            <li>
              <Link
                to="/stack/$slug"
                params={{ slug: "dte2501-kmeans-visualizer" }}
                className="text-brand hover:underline"
              >
                k-Means live-plot
              </Link>{" "}
              — annen iterativ algoritme du kan «se jobbe» i 2D.
            </li>
            <li>
              <Link
                to="/stack/$slug"
                params={{ slug: "dte2501-mdp-bellman" }}
                className="text-brand hover:underline"
              >
                MDP og Bellman-ligningen
              </Link>{" "}
              — annen optimaliseringsfamilie (verdiiterasjon) for sammenligning.
            </li>
          </ul>
        </div>

        <div className="mt-6">
          <Link
            to="/stack/$slug"
            params={{ slug: "dte-2501" }}
            className="text-brand hover:underline inline-flex items-center gap-1 text-sm"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Tilbake til DTE-2501-hub
          </Link>
        </div>
      </div>
    </StackPageShell>
  );
}
