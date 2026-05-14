import { Link } from "@tanstack/react-router";
import { Lightbulb, Gamepad2, ArrowLeft, AlertTriangle } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { MinimaxGameTree } from "./MinimaxGameTree";
import { Tex, TexBlock } from "@/components/Tex";

const STEPS = [
  { title: "Adversarial search", anchor: "intro" },
  { title: "Game tree", anchor: "tree" },
  { title: "Minimax-algoritmen", anchor: "minimax" },
  { title: "Alpha-beta pruning", anchor: "alphabeta" },
  { title: "Evalueringsfunksjoner", anchor: "eval" },
  { title: "Horisonteffekten & quiescence", anchor: "quiescence" },
  { title: "Imperfect-info — kort", anchor: "imperfect" },
  { title: "Eksamen-typiske spørsmål", anchor: "exam" },
];

export function MinimaxPage() {
  return (
    <StackPageShell title="Minimax og alpha-beta pruning" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2501 · Adversarial search (AIMA kap. 6)
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Minimax — søke i 2-spillerspill med motstander
          </h1>
          <p className="mt-3 text-muted-foreground">
            I et 2-spillerspill (sjakk, tic-tac-toe, dam) handler ikke
            motstanderen i din favør — han prøver det motsatte. Minimax er
            algoritmen som tar dette på alvor: vi maksimerer egen utbetaling{" "}
            <em>under antagelsen</em> at motstanderen minimerer den.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Sentralt:</span> single-agent søk
              optimaliserer ÉN agent. Adversarial søk optimaliserer ÉN agent
              under antagelse om at en annen agent jobber mot oss. Alpha-beta
              pruning lar oss skippe grener uten å miste optimalitet.
            </div>
          </div>
        </div>

        <CourseOutline courseId="dte2501-minimax" steps={STEPS} />

        <section id="intro" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Adversarial search vs single-agent search</h2>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm">
            <p>I AIMA-tradisjonen klassifiseres søk etter to akser:</p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>
                <strong className="text-foreground">Single-agent:</strong>{" "}
                BFS, DFS, A* — vi velger handlinger som maksimerer egen nytte.
                Verden er statisk eller deterministisk-stokastisk, men ingen
                aktiv motstander.
              </li>
              <li>
                <strong className="text-foreground">Adversarial (2 spillere):</strong>{" "}
                MAX og MIN bytter på. MAX vil maksimere utility; MIN vil
                minimere den.
              </li>
            </ul>
            <p className="text-xs text-muted-foreground">
              Klassiske antagelser: <em>perfekt informasjon</em> (begge ser hele
              brettet), <em>deterministisk</em> (ingen terningkast),{" "}
              <em>turn-taking</em>, <em>zero-sum</em> (det jeg vinner taper du).
              Sjakk, Go, dam, tic-tac-toe oppfyller alt. Poker bryter perfekt-info
              (skjulte kort) og zero-sum-aspekter i fler-spillerspill.
            </p>
          </div>
        </section>

        <section id="tree" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Game tree — tic-tac-toe som referanse</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Vi modellerer spillet som et tre der noder er stillinger, kanter er
            trekk, og løv er sluttstillinger med en kjent verdi.
          </p>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm">
            <p>Et spill defineres av:</p>
            <ul className="list-disc pl-5 space-y-0.5 text-xs text-muted-foreground">
              <li>
                <Tex>{"S_0"}</Tex> — startstilling
              </li>
              <li>
                <Tex>{"\\text{TO-MOVE}(s)"}</Tex> — hvem er på tur (MAX eller MIN)
              </li>
              <li>
                <Tex>{"\\text{ACTIONS}(s)"}</Tex> — lovlige trekk i s
              </li>
              <li>
                <Tex>{"\\text{RESULT}(s, a)"}</Tex> — stilling etter trekk a
              </li>
              <li>
                <Tex>{"\\text{IS-TERMINAL}(s)"}</Tex> — sluttstilling?
              </li>
              <li>
                <Tex>{"\\text{UTILITY}(s, p)"}</Tex> — verdi i terminal for spiller p (vanligvis +1 / 0 / −1)
              </li>
            </ul>
            <p className="pt-2 text-xs text-muted-foreground">
              For tic-tac-toe: ~5478 unike stillinger og 255 168 mulige
              «spill-trær» fra start — håndterlig. Sjakk: ~10⁴⁰ stillinger,{" "}
              ~10¹²³ trær (Shannon-tall) — uoverkommelig. Derfor må vi i sjakk{" "}
              <em>cut off</em> søket og bruke en evalueringsfunksjon.
            </p>
          </div>
        </section>

        <section id="minimax" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Minimax-algoritmen</h2>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm">
            <p>
              Definert rekursivt på spilltreet: hver MAX-node tar maks over
              barneverdier, hver MIN-node tar min.
            </p>
            <TexBlock>{"\\text{MINIMAX}(s) = \\begin{cases} \\text{UTILITY}(s) & \\text{hvis } \\text{IS-TERMINAL}(s) \\\\ \\max_{a \\in A(s)} \\text{MINIMAX}(\\text{RESULT}(s, a)) & \\text{hvis TO-MOVE}(s) = \\text{MAX} \\\\ \\min_{a \\in A(s)} \\text{MINIMAX}(\\text{RESULT}(s, a)) & \\text{hvis TO-MOVE}(s) = \\text{MIN} \\end{cases}"}</TexBlock>
            <p className="text-xs text-muted-foreground">
              Optimal trekk fra <Tex>{"s"}</Tex>:
            </p>
            <TexBlock>{"a^* = \\arg\\max_{a \\in A(s)} \\text{MINIMAX}(\\text{RESULT}(s, a))"}</TexBlock>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`function minimax_value(state):
    if is_terminal(state): return utility(state)
    if to_move(state) == MAX:
        v = −∞
        for a in actions(state):
            v = max(v, minimax_value(result(state, a)))
        return v
    else:  # MIN
        v = +∞
        for a in actions(state):
            v = min(v, minimax_value(result(state, a)))
        return v`}</pre>
            <p className="text-xs text-muted-foreground">
              <strong>Kompleksitet:</strong> tid <Tex>{"O(b^m)"}</Tex>, plass{" "}
              <Tex>{"O(bm)"}</Tex>, der <Tex>{"b"}</Tex> = forgreningsfaktor og{" "}
              <Tex>{"m"}</Tex> = maksimal dybde. Fullstendig (gir alltid optimal
              løsning i endelige spill); optimal mot en optimal motstander.
            </p>
          </div>
        </section>

        <section id="alphabeta" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Alpha-beta pruning</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Vi kan klippe bort store deler av treet uten å miste optimalitet —
            ved å holde rede på det beste MAX-er har funnet hittil (
            <Tex>{"\\alpha"}</Tex>) og det beste MIN-er har funnet hittil (
            <Tex>{"\\beta"}</Tex>).
          </p>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm">
            <ul className="list-disc pl-5 space-y-0.5 text-xs text-muted-foreground">
              <li>
                <Tex>{"\\alpha"}</Tex> = beste (høyeste) verdi MAX har garantert
                seg så langt langs stien.
              </li>
              <li>
                <Tex>{"\\beta"}</Tex> = beste (laveste) verdi MIN har garantert
                seg så langt langs stien.
              </li>
              <li>
                Hvis <Tex>{"\\alpha \\geq \\beta"}</Tex> kan vi <strong>klippe</strong>{" "}
                — den nåværende grenen kan aldri velges av en rasjonell
                motstander.
              </li>
            </ul>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`function alphabeta(state, α, β):
    if is_terminal(state): return utility(state)
    if to_move(state) == MAX:
        v = −∞
        for a in actions(state):
            v = max(v, alphabeta(result(state, a), α, β))
            if v >= β: return v          # β-cutoff
            α = max(α, v)
        return v
    else:
        v = +∞
        for a in actions(state):
            v = min(v, alphabeta(result(state, a), α, β))
            if v <= α: return v          # α-cutoff
            β = min(β, v)
        return v

# kalt med α = −∞, β = +∞`}</pre>
            <p className="text-xs text-muted-foreground">
              <strong>Effekt:</strong> ved tilfeldig rekkefølge av trekk gir
              alpha-beta tid <Tex>{"O(b^{3m/4})"}</Tex>. Med perfekt
              trekk-rekkefølge (beste trekk først): <Tex>{"O(b^{m/2})"}</Tex>{" "}
              — vi kan søke dobbelt så dypt på samme tid.
            </p>
          </div>

          <div className="mt-4">
            <MinimaxGameTree />
          </div>
        </section>

        <section id="eval" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Evalueringsfunksjoner for ikke-løste spill</h2>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm">
            <p>
              For sjakk er treet for stort til å nå løv. Vi kutter på dybde{" "}
              <Tex>{"d"}</Tex> og estimerer verdien av ikke-terminale stillinger
              med en <em>evaluation function</em>{" "}
              <Tex>{"\\text{EVAL}(s)"}</Tex>.
            </p>
            <p className="font-semibold">Klassisk lineær evaluering for sjakk:</p>
            <TexBlock>{"\\text{EVAL}(s) = w_1 f_1(s) + w_2 f_2(s) + \\dots + w_n f_n(s)"}</TexBlock>
            <p className="text-xs text-muted-foreground">
              Features <Tex>{"f_i"}</Tex>: materiell (bonde=1, springer=3,
              løper=3, tårn=5, dronning=9), brikke-aktivitet, kongens trygghet,
              bondestruktur. Vekter <Tex>{"w_i"}</Tex> tunes for hånd (gammel
              skole) eller læres via selvspill (AlphaZero).
            </p>
            <div className="font-semibold pt-2">Krav til en god EVAL:</div>
            <ul className="list-disc pl-5 space-y-0.5 text-xs text-muted-foreground">
              <li>Rekkefølger terminal-stillinger riktig.</li>
              <li>Korrelerer med vinst-sannsynlighet for ikke-terminal.</li>
              <li>Rask å beregne (kalles millioner av ganger).</li>
            </ul>
            <p className="text-xs text-muted-foreground pt-1">
              Med EVAL ser minimax bare <Tex>{"d"}</Tex> halv-trekk framover.
              Dypere søk → bedre spill. Iterative deepening: start med dybde 1,
              øk én og én til tida er ute.
            </p>
          </div>
        </section>

        <section id="quiescence" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Horisonteffekten og quiescence search</h2>
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 flex items-start gap-3 mb-3">
            <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Horisonteffekten:</span> en stilling
              som ser stille ut akkurat på dybde <Tex>{"d"}</Tex> kan eksplodere
              i taktiske komplikasjoner på dybde <Tex>{"d+1"}</Tex>. Algoritmen
              evaluerer et villedende «øyeblikksbilde» av en ufullstendig sekvens.
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm">
            <p className="font-semibold">Quiescence search:</p>
            <p className="text-xs text-muted-foreground">
              Når søket når dybde-grensen, fortsett <em>bare</em> med «urolige»
              trekk (slag, sjakk, forfremmelser) inntil stillingen er rolig
              («quiet»). Da er <Tex>{"\\text{EVAL}"}</Tex> mye mer pålitelig.
            </p>
            <p className="text-xs text-muted-foreground">
              Andre teknikker: <strong>null-move pruning</strong> (la
              motstanderen «hoppe over» — hvis du fortsatt vinner, klipp),{" "}
              <strong>transposition table</strong> (cache stillinger som dukker
              opp via ulike trekkrekkefølger), <strong>move ordering</strong>{" "}
              (killer heuristic, history heuristic) for å maksimere α-β-cutoffs.
            </p>
          </div>
        </section>

        <section id="imperfect" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Imperfect-info games — kort intro</h2>
          <div className="rounded-xl border border-border bg-card p-5 text-sm space-y-2">
            <p>
              Når en spiller ikke kan se hele tilstanden (poker, Stratego,
              kortspill), bryter klassisk minimax. Vi må håndtere{" "}
              <em>information sets</em> — mengder av stillinger spilleren ikke
              kan skille mellom.
            </p>
            <p className="text-xs text-muted-foreground">
              Sentrale begreper: <strong>belief state</strong>{" "}
              (sannsynlighetsfordeling over mulige sanne tilstander),{" "}
              <strong>Nash equilibrium</strong> (i flerspillerspill / ikke
              zero-sum), <strong>Counterfactual Regret Minimization (CFR)</strong>{" "}
              — algoritmen som drev Libratus/Pluribus til menneskelig nivå i
              poker.
            </p>
            <p className="text-xs text-muted-foreground">
              For DTE-2501 holder det å vite at minimax forutsetter perfekt info,
              og at vi i imperfect info trekker inn sannsynlighetsregning over
              motstanderens mulige hender.
            </p>
          </div>
        </section>

        <section id="exam" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">8. Eksamen-typiske spørsmål</h2>
          <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
            <li>
              <strong className="text-foreground">«Hva er minimax?»</strong>{" "}
              Rekursiv algoritme der MAX maksimerer og MIN minimerer. Garantert
              optimal i endelige 2-spiller zero-sum-spill med perfekt info.
            </li>
            <li>
              <strong className="text-foreground">«Når kan alpha-beta klippe en gren?»</strong>{" "}
              Når <Tex>{"\\alpha \\geq \\beta"}</Tex>. MAX vil ikke velge en
              gren med verdi <Tex>{"\\leq \\alpha"}</Tex>; MIN vil ikke velge en
              gren med verdi <Tex>{"\\geq \\beta"}</Tex>.
            </li>
            <li>
              <strong className="text-foreground">«Hvorfor er trekk-rekkefølge viktig?»</strong>{" "}
              Med perfekt rekkefølge går alpha-beta fra <Tex>{"O(b^m)"}</Tex>{" "}
              til <Tex>{"O(b^{m/2})"}</Tex> — vi kan se dobbelt så dypt.
            </li>
            <li>
              <strong className="text-foreground">«Hvorfor EVAL i sjakk?»</strong>{" "}
              Trærne er for store til å nå løv (<Tex>{"\\sim 10^{40}"}</Tex>{" "}
              stillinger). Vi cut-off-er på dybde og estimerer ikke-terminale
              med EVAL.
            </li>
            <li>
              <strong className="text-foreground">«Hva er horisonteffekten?»</strong>{" "}
              Stillingen ser rolig ut på dybde <Tex>{"d"}</Tex> men har skjult
              taktikk på dybde <Tex>{"d+1"}</Tex>. Quiescence search løser det.
            </li>
            <li>
              <strong className="text-foreground">«Minimax vs Q-learning?»</strong>{" "}
              Minimax forutsetter kjent spill-modell og ingen tilfeldighet.
              Q-learning er for model-free RL i én-agent eller stokastisk miljø.
            </li>
          </ul>
        </section>

        <div className="rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2 flex items-center gap-2">
            <Gamepad2 className="h-4 w-4 text-brand" />
            Neste steg
          </h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/stack/$slug" params={{ slug: "sok-algoritmer" }} className="text-brand hover:underline">
                Søkealgoritmer
              </Link>{" "}
              — single-agent søk (BFS/DFS/A*) som minimax bygger oppå.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte2501-reinforcement" }} className="text-brand hover:underline">
                Reinforcement Learning
              </Link>{" "}
              — beslektet, men for ukjent dynamikk i stedet for motstander.
            </li>
            <li>Python-øvelse: implementer minimax på tic-tac-toe fra bunn.</li>
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
