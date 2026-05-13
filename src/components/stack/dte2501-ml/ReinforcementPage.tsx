import { Link } from "@tanstack/react-router";
import { Lightbulb, Gamepad2, AlertTriangle } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";

const STEPS = [
  { title: "Hvorfor RL?", anchor: "intro" },
  { title: "Markov Decision Process (MDP)", anchor: "mdp" },
  { title: "Value function og Bellman-likning", anchor: "bellman" },
  { title: "Value Iteration", anchor: "vi" },
  { title: "Policy Iteration", anchor: "pi" },
  { title: "Known vs Unknown world", anchor: "world" },
  { title: "Q-learning", anchor: "qlearning" },
  { title: "Eksamen-typiske spørsmål", anchor: "exam" },
];

export function ReinforcementPage() {
  return (
    <StackPageShell title="Reinforcement Learning og MDP" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2501 · Reinforcement learning
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Reinforcement Learning — lær fra prøving og feiling
          </h1>
          <p className="mt-3 text-muted-foreground">
            Hverken supervised (vi har ingen y) eller unsupervised (vi har et mål
            — belønning). En agent handler i et miljø, får belønning, og lærer å
            optimere langsiktig sum av belønninger.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Sentralt:</span> agent ↔ miljø, state →
              action → reward → next state. Mål: finn policy π(s) som maksimerer
              forventet diskontert sum av framtidige belønninger.
            </div>
          </div>
        </div>

        <CourseOutline courseId="dte2501-rl" steps={STEPS} />

        <section id="intro" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Hvorfor RL?</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Tre paradigmer i ML:

Supervised:   gitt (X, y), lær f: X → y
              "Her er bilder med riktige etiketter."

Unsupervised: gitt X, finn struktur
              "Her er data, finn grupper."

Reinforcement: agent + miljø, ingen y, bare belønning over tid
              "Spill spillet, vinn poeng — jeg sier ikke hvilket trekk."

Eksempler på RL:
   - AlphaGo: brett-tilstander, trekk, vinn/tap
   - Robotkontroll: sensor-tilstander, motorbevegelser
   - Trafikklys-styring: kø-tilstand, røde/grønne, total ventetid
   - Anbefaling: brukerhistorikk, hvilket innhold vise, klikk

Sentralt: belønning kan komme SENT (skakk på trekk 1, vinn på trekk 50).
Agenten må lære long-horizon credit assignment.`}</pre>
          </div>
        </section>

        <section id="mdp" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Markov Decision Process (MDP)</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Det formelle rammeverket for RL. Markov = framtiden avhenger bare av
            nåværende state, ikke hele historien.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`En MDP er en 5-tuppel  (S, A, P, R, γ):

S       Mengde states (f.eks. ruter på et brett)
A       Mengde actions (opp/ned/venstre/høyre)
P(s'|s,a)   Transition probability — sjansen for å havne i s'
            når du gjør a i s
R(s,a,s')   Reward når du går fra s til s' med action a
γ ∈ [0,1)   Diskonteringsfaktor — hvor mye man bryr seg om framtiden

POLICY π:  S → A   (eller stokastisk: π(a|s))
   Avgjør hvilken action agenten tar i hver state.

RETURN G_t = Σ_{k=0}^∞  γᵏ · R_{t+k+1}
   Total framtidig belønning, diskontert.
   γ=0 → kortsiktig (gridig). γ→1 → langsiktig.

Mål: finn π* som maksimerer E[G_t] for alle s.`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Markov-egenskapen:</strong> P(s' | s, a, s_{`{t-1}`}, ...) = P(s'
            | s, a). Eneste state er nok info. Dette er en STERK antagelse — og
            ofte må man velge state-representasjon nøye for at den skal holde.
          </p>
        </section>

        <section id="bellman" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Value function og Bellman-likning</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`STATE VALUE V^π(s):
   "Hvor god er state s, hvis vi følger policy π fra og med nå?"
   V^π(s) = E_π [ G_t | s_t = s ]

ACTION VALUE Q^π(s, a):
   "Hvor god er det å gjøre a i s, og deretter følge π?"
   Q^π(s, a) = E [ R + γ V^π(s') | s, a ]

BELLMAN-LIKNING (rekursiv definisjon av V):
   V^π(s) = Σ_a π(a|s) · Σ_{s'} P(s'|s,a) · [ R(s,a,s') + γ V^π(s') ]

BELLMAN OPTIMALITY:
   V*(s) = max_a  Σ_{s'} P(s'|s,a) · [ R(s,a,s') + γ V*(s') ]
   Q*(s, a) = Σ_{s'} P(s'|s,a) · [ R(s,a,s') + γ max_{a'} Q*(s', a') ]

Når vi har V* eller Q*, er optimal policy:
   π*(s) = argmax_a  Q*(s, a)

Det er ikke-lineære likninger (max-operator) men har unik løsning.`}</pre>
          </div>
        </section>

        <section id="vi" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Value Iteration</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Iterativ algoritme for å løse Bellman optimality. Antar at vi KJENNER
            P og R (model-based, «known world»).
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`function value_iteration(S, A, P, R, γ, θ):
    V[s] = 0  for alle s

    repeat:
        Δ = 0
        for s in S:
            v_old = V[s]
            V[s] = max_a  Σ_{s'} P(s'|s,a) · [ R(s,a,s') + γ · V[s'] ]
            Δ = max(Δ, |v_old − V[s]|)
        until Δ < θ                    # konvergens

    # Hent optimal policy
    for s in S:
        π[s] = argmax_a  Σ_{s'} P(s'|s,a) · [ R(s,a,s') + γ · V[s'] ]
    return π, V

Konvergens: V[s] → V*[s] for alle s.
Kompleksitet per iterasjon: O(|S|² · |A|)`}</pre>
          </div>
        </section>

        <section id="pi" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Policy Iteration</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Alternativt. Veksler mellom policy evaluation og policy improvement.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`function policy_iteration(S, A, P, R, γ):
    π = tilfeldig policy
    repeat:
        # 1. POLICY EVALUATION (løs V^π)
        repeat:
            for s in S:
                V[s] = Σ_{s'} P(s'|s,π[s]) · [ R(s,π[s],s') + γ V[s'] ]
            until V konvergerer

        # 2. POLICY IMPROVEMENT
        stabil = True
        for s in S:
            old_action = π[s]
            π[s] = argmax_a  Σ_{s'} P(s'|s,a) · [ R + γ V[s'] ]
            if old_action ≠ π[s]: stabil = False

        until stabil
    return π, V

Konvergerer på færre iterasjoner enn VI, men hver iterasjon er dyrere.

Sammenligning VI vs PI:
   VI:  én Bellman-oppdatering per state, mange iterasjoner totalt
   PI:  full policy evaluation (lukket form O(|S|³)) per iterasjon
        men færre policy-skift før konvergens`}</pre>
          </div>

          <div className="mt-4 overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-44">Aspekt</th>
                  <th className="text-left font-semibold px-4 py-2">Value Iteration (VI)</th>
                  <th className="text-left font-semibold px-4 py-2">Policy Iteration (PI)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">Algoritme-flyt</td>
                  <td className="px-4 py-2 text-muted-foreground">Én Bellman-backup per state, gjenta</td>
                  <td className="px-4 py-2 text-muted-foreground">Full eval + improvement i hver runde</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">Konvergens</td>
                  <td className="px-4 py-2 text-muted-foreground">Mange iterasjoner — V flytter seg gradvis</td>
                  <td className="px-4 py-2 text-muted-foreground">Få iterasjoner — policy stabiliserer raskt</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">Per-iterasjon-kost</td>
                  <td className="px-4 py-2 text-muted-foreground">O(|S|²·|A|)</td>
                  <td className="px-4 py-2 text-muted-foreground">O(|S|³) (lineært system) + improvement</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">Beregningstid totalt</td>
                  <td className="px-4 py-2 text-muted-foreground">Bedre når |S| er stor og |A| er liten</td>
                  <td className="px-4 py-2 text-muted-foreground">Bedre når |S| er liten — løses raskt eksakt</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">Stopp-kriterie</td>
                  <td className="px-4 py-2 text-muted-foreground">Δ &lt; θ (verdier bevegelse)</td>
                  <td className="px-4 py-2 text-muted-foreground">Policy uendret én runde</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="world" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Known vs Unknown world</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`KNOWN WORLD (model-based):
   Vi vet P(s'|s,a) og R(s,a,s') eksplisitt — modellen er gitt.
   Eks: brettspill med kjente regler.
   Bruk: Value Iteration, Policy Iteration (DP-baserte).

UNKNOWN WORLD (model-free):
   Vi vet IKKE P og R. Vi kan bare PRØVE actions og se hva som skjer.
   Eks: robot i fysisk verden, online anbefaling.
   Bruk: Monte Carlo, TD-learning, Q-learning, SARSA.

Subtilt: i unknown world kan man EN GANG lære en modell av P og R
(model-based RL), eller hoppe direkte til policy/value (model-free).

EXPLORATION vs EXPLOITATION:
   Eksploater: ta beste kjente action
   Eksplorer:  prøv noe nytt — kanskje den er enda bedre
   ε-greedy: med p=1−ε ta best, med p=ε ta tilfeldig`}</pre>
          </div>

          <div className="mt-4 overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-40">Setting</th>
                  <th className="text-left font-semibold px-4 py-2">Known world (model-based)</th>
                  <th className="text-left font-semibold px-4 py-2">Unknown world (model-free)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">P og R</td>
                  <td className="px-4 py-2 text-muted-foreground">Kjent eksplisitt</td>
                  <td className="px-4 py-2 text-muted-foreground">Må estimeres ved interaksjon</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">Algoritmer</td>
                  <td className="px-4 py-2 text-muted-foreground">Value Iteration, Policy Iteration (DP)</td>
                  <td className="px-4 py-2 text-muted-foreground">Q-learning, SARSA, Monte Carlo, DQN</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">Eksempler</td>
                  <td className="px-4 py-2 text-muted-foreground">Brettspill m/ kjente regler, simulator</td>
                  <td className="px-4 py-2 text-muted-foreground">Robot, online anbefaling, fysisk verden</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">Sample-effektivitet</td>
                  <td className="px-4 py-2 text-muted-foreground">N/A — ingen samples nødvendig</td>
                  <td className="px-4 py-2 text-muted-foreground">Lav — krever mange episoder</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">Exploration</td>
                  <td className="px-4 py-2 text-muted-foreground">Trivielt (vi sweeper alle states)</td>
                  <td className="px-4 py-2 text-muted-foreground">Sentralt — ε-greedy, UCB, softmax</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 flex items-start gap-3">
            <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Explore-exploit trade-off:</span> hvis
              du alltid tar best-kjente action (ε=0), kan du sitte fast i et
              suboptimal område du aldri har utforsket. Hvis du alltid utforsker
              (ε=1), lærer du aldri å utnytte. Standard mønster:{" "}
              <em>ε-decay</em> — start ε=1.0, reduser eksponentielt til 0.01 over
              treningen. Tidlig fase: utforsk; sen fase: utnytt.
            </div>
          </div>
        </section>

        <section id="qlearning" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Q-learning</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Den mest kjente model-free RL-algoritmen. Lærer Q*(s, a) direkte uten å
            modellere P eller R.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Hold en tabell Q[s, a] over alle (state, action)-par.
Init Q vilkårlig (typisk 0).

For hver episode:
    s = start_state
    while s ikke er terminal:
        a = ε-greedy(Q, s)            # med p=ε ta tilfeldig, ellers argmax_a Q[s,a]
        utfør a, observer r og s'
        # OPPDATÉR Q (Bellman backup):
        Q[s, a] ← Q[s, a] + α · ( r + γ · max_a' Q[s', a']  −  Q[s, a] )
                            └────── TD-error ──────┘
        s = s'

α = learning rate (0.01 - 0.1)
γ = discount
ε = exploration rate (ofte decay over tid: 1.0 → 0.01)

Q-learning er OFF-POLICY: den lærer optimal Q* selv om policy er ε-greedy.
SARSA er ON-POLICY-varianten (bruker neste action faktisk valgt).

Konvergens: Q[s,a] → Q*(s,a) under svake betingelser (alle (s,a) besøkes
uendelig ofte, α reduseres på riktig vis).

Når state-rommet er KONTINUERLIG (bilder, robot-sensor) blir tabellen
umulig. Da brukes deep Q-learning (DQN) — Q er et nevralt nett.`}</pre>
          </div>

          <div className="mt-4 overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-32">Aspekt</th>
                  <th className="text-left font-semibold px-4 py-2">Q-learning</th>
                  <th className="text-left font-semibold px-4 py-2">SARSA</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">Policy-type</td>
                  <td className="px-4 py-2 text-muted-foreground">Off-policy</td>
                  <td className="px-4 py-2 text-muted-foreground">On-policy</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">Target-action</td>
                  <td className="px-4 py-2 text-muted-foreground">max_a&apos; Q[s&apos;, a&apos;] (gridig)</td>
                  <td className="px-4 py-2 text-muted-foreground">Q[s&apos;, a&apos;] der a&apos; er faktisk valgt</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">Eksplor.-strategi</td>
                  <td className="px-4 py-2 text-muted-foreground">Kan eksplorere risikabelt — lærer optimal Q*</td>
                  <td className="px-4 py-2 text-muted-foreground">Konservativ — tar hensyn til faktisk policy</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">Klassisk eksempel</td>
                  <td className="px-4 py-2 text-muted-foreground">Cliff-walking: hopper i klippa for å lære optimum</td>
                  <td className="px-4 py-2 text-muted-foreground">Cliff-walking: tar trygg rute (unngår klippa)</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">Bra på</td>
                  <td className="px-4 py-2 text-muted-foreground">Når du bare bryr deg om sluttresultatet</td>
                  <td className="px-4 py-2 text-muted-foreground">Når dårlige actions under trening har høy kost</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="exam" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">8. Eksamen-typiske spørsmål</h2>
          <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
            <li>
              <strong className="text-foreground">«Hva er en MDP?»</strong> Tuppel
              (S, A, P, R, γ). Markov-egenskap: framtid avhenger bare av nåtid.
            </li>
            <li>
              <strong className="text-foreground">«Forklar Bellman optimality.»</strong>{" "}
              V*(s) = max_a Σ P(s'|s,a) · [R + γ V*(s')]. Rekursiv likning som
              definerer optimal value.
            </li>
            <li>
              <strong className="text-foreground">«Value Iteration vs Policy Iteration?»</strong>{" "}
              VI: én Bellman-oppdatering per state per iterasjon, mange iterasjoner.
              PI: full evaluering, så improvement. Begge konvergerer til π*.
            </li>
            <li>
              <strong className="text-foreground">«Known vs unknown world?»</strong>{" "}
              Known = modell gitt → DP. Unknown = må prøve → Q-learning, SARSA.
            </li>
            <li>
              <strong className="text-foreground">«Hvorfor γ &lt; 1?»</strong>{" "}
              For å sikre at sumen G_t = Σ γᵏ R konvergerer ved uendelig horisont,
              og for å foretrekke umiddelbare belønninger.
            </li>
            <li>
              <strong className="text-foreground">«Exploration vs exploitation?»</strong>{" "}
              ε-greedy: tilfeldig action med p=ε, beste action ellers.
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
              <Link to="/stack/$slug" params={{ slug: "dte2501-dp" }} className="text-brand hover:underline">
                Dynamic Programming
              </Link>{" "}
              — algoritmisk grunnlag for Value/Policy Iteration.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "bayes" }} className="text-brand hover:underline">
                Bayes
              </Link>{" "}
              for forståelse av sannsynlighet-rammeverk.
            </li>
            <li>
              Python-øvelser: «Q-learning på liten grid-world».
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
