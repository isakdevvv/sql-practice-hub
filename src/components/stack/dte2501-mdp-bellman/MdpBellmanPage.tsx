import { Link } from "@tanstack/react-router";
import { Lightbulb, Calculator, ArrowLeft } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { BellmanDrillSim } from "./BellmanDrillSim";
import { Tex, TexBlock } from "@/components/Tex";

const STEPS = [
  { title: "MDP refresh", anchor: "mdp" },
  { title: "Bellman for V^π", anchor: "bellman-pi" },
  { title: "Bellman optimality", anchor: "bellman-star" },
  { title: "Value Iteration", anchor: "vi" },
  { title: "Policy Iteration", anchor: "pi" },
  { title: "VI vs PI — når hva", anchor: "compare" },
  { title: "Konvergens-garanti", anchor: "convergence" },
  { title: "Regnedrill (interaktivt)", anchor: "drill" },
  { title: "Eksamen-typiske spørsmål", anchor: "exam" },
];

export function MdpBellmanPage() {
  return (
    <StackPageShell title="MDP — Bellman, VI og PI regnedrill" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2501 · MDP-regnedrill (Sutton & Barto kap. 3-4)
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Bellman-likningen, Value Iteration og Policy Iteration — på papir
          </h1>
          <p className="mt-3 text-muted-foreground">
            Dette er et regnedrill-modul. Du skal kunne skrive opp
            Bellman-likningen for en gitt MDP og <em>regne én iterasjon av Value
            Iteration på papir</em>. Side-modulen viser samme regnskap steg for
            steg på en liten 2-state MDP du kan eksperimentere med.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Sentralt:</span> Bellman er en
              rekursiv konsistens-likning. Value Iteration iterer den til
              fixed-point (max-versjon). Policy Iteration løser den eksakt for
              en gitt π og forbedrer π etterpå.
            </div>
          </div>
        </div>

        <CourseOutline courseId="dte2501-mdp-bellman" steps={STEPS} />

        <section id="mdp" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. MDP refresh</h2>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm">
            <p>
              En Markov Decision Process er en 5-tuppel{" "}
              <Tex>{"(S, A, P, R, \\gamma)"}</Tex>:
            </p>
            <ul className="list-disc pl-5 space-y-0.5 text-xs text-muted-foreground">
              <li><Tex>{"S"}</Tex> — mengde states</li>
              <li><Tex>{"A"}</Tex> — mengde actions</li>
              <li><Tex>{"P(s' \\mid s, a)"}</Tex> — overgangs-sannsynlighet</li>
              <li><Tex>{"R(s, a, s')"}</Tex> — belønning ved overgang</li>
              <li><Tex>{"\\gamma \\in [0, 1)"}</Tex> — diskonteringsfaktor</li>
            </ul>
            <p className="text-xs text-muted-foreground">
              Markov-egenskapen: <Tex>{"P(s_{t+1} \\mid s_t, a_t, \\dots) = P(s_{t+1} \\mid s_t, a_t)"}</Tex>{" "}
              — framtiden avhenger bare av nåtid. En policy <Tex>{"\\pi(a \\mid s)"}</Tex>{" "}
              beskriver hvilke actions agenten velger.
            </p>
          </div>
        </section>

        <section id="bellman-pi" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Bellman for V^π</h2>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm">
            <p>
              Definisjon av state-value: forventet diskontert retur når man
              starter i <Tex>{"s"}</Tex> og følger π:
            </p>
            <TexBlock>{"V^\\pi(s) = \\mathbb{E}_\\pi\\!\\left[\\sum_{k=0}^\\infty \\gamma^k R_{t+k+1} \\,\\Big|\\, s_t = s\\right]"}</TexBlock>
            <p className="font-semibold pt-2">Bellman-konsistenslikning for V^π:</p>
            <TexBlock>{"V^\\pi(s) = \\sum_a \\pi(a \\mid s) \\sum_{s'} P(s' \\mid s, a) \\big[\\, R(s, a, s') + \\gamma V^\\pi(s')\\, \\big]"}</TexBlock>
            <p className="text-xs text-muted-foreground">
              Verdien i <Tex>{"s"}</Tex> = forventet umiddelbar belønning +
              diskontert verdi av neste state. Dette er <strong>ikke</strong>{" "}
              en algoritme — det er en konsistens-likning som <Tex>{"V^\\pi"}</Tex>{" "}
              må oppfylle. For endelig <Tex>{"|S|"}</Tex> har vi et lineært
              system med <Tex>{"|S|"}</Tex> ukjente — kan løses direkte med{" "}
              <Tex>{"O(|S|^3)"}</Tex>.
            </p>
            <p className="font-semibold pt-2">Eksempel-utregning (2 states, deterministic):</p>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`MDP: A,B + actions stay/move. γ = 0.9.
Policy π: alltid stay.
V^π(A) = R(A,stay,A) + γ V^π(A)       (likn 1)
V^π(B) = R(B,stay,B) + γ V^π(B)       (likn 2)
=> V^π(A) = 1 + 0.9 V^π(A)  =>  V^π(A) = 10
=> V^π(B) = 0 + 0.9 V^π(B)  =>  V^π(B) = 0`}</pre>
          </div>
        </section>

        <section id="bellman-star" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Bellman optimality</h2>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm">
            <p>
              Optimal value <Tex>{"V^*(s) = \\max_\\pi V^\\pi(s)"}</Tex>{" "}
              tilfredsstiller Bellman optimality:
            </p>
            <TexBlock>{"V^*(s) = \\max_a \\sum_{s'} P(s' \\mid s, a) \\big[\\, R(s, a, s') + \\gamma V^*(s')\\, \\big]"}</TexBlock>
            <p>Tilsvarende for action-value:</p>
            <TexBlock>{"Q^*(s, a) = \\sum_{s'} P(s' \\mid s, a) \\big[\\, R(s, a, s') + \\gamma \\max_{a'} Q^*(s', a')\\, \\big]"}</TexBlock>
            <p>Optimal policy:</p>
            <TexBlock>{"\\pi^*(s) = \\arg\\max_a Q^*(s, a) = \\arg\\max_a \\sum_{s'} P(s' \\mid s, a) [R + \\gamma V^*(s')]"}</TexBlock>
            <p className="text-xs text-muted-foreground">
              Til forskjell fra <Tex>{"V^\\pi"}</Tex>-likningen er denne{" "}
              <strong>ikke-lineær</strong> pga <Tex>{"\\max"}</Tex>. Vi kan ikke
              løse den direkte — vi må iterere.
            </p>
          </div>
        </section>

        <section id="vi" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Value Iteration</h2>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm">
            <p>
              Iterér Bellman-optimality som en oppdaterings-regel til
              fixed-point:
            </p>
            <TexBlock>{"V_{k+1}(s) \\leftarrow \\max_a \\sum_{s'} P(s' \\mid s, a) \\big[\\, R(s, a, s') + \\gamma V_k(s')\\, \\big]"}</TexBlock>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`function value_iteration(S, A, P, R, γ, θ):
    V₀[s] = 0  for alle s
    k = 0
    repeat:
        Δ = 0
        for s in S:
            v_old = V_k[s]
            V_{k+1}[s] = max_a Σ_{s'} P(s'|s,a) · [ R + γ · V_k[s'] ]
            Δ = max(Δ, |V_{k+1}[s] − v_old|)
        k = k + 1
    until Δ < θ
    # ekstraktér policy:
    π[s] = argmax_a Σ P(s'|s,a) · [R + γ V[s']]
    return π, V_k`}</pre>
            <p className="font-semibold pt-2">Sutton & Barto's «klassiske» VI-trinn på papir:</p>
            <ol className="list-decimal pl-5 space-y-0.5 text-xs text-muted-foreground">
              <li>Skriv tabell med <Tex>{"V_k(s)"}</Tex> for hver state.</li>
              <li>
                For hver state, regn én Bellman-backup: list opp{" "}
                <Tex>{"Q_k(s, a)"}</Tex> for hver a, ta max, skriv som{" "}
                <Tex>{"V_{k+1}(s)"}</Tex>.
              </li>
              <li>Mål <Tex>{"\\Delta = \\max_s |V_{k+1}(s) - V_k(s)|"}</Tex>.</li>
              <li>Stopp når <Tex>{"\\Delta &lt; \\theta"}</Tex>; ellers k = k+1.</li>
            </ol>
            <p className="text-xs text-muted-foreground">
              Synchronous backup (skrive til ny tabell) vs in-place (overskriv
              umiddelbart). In-place konvergerer ofte raskere fordi nye verdier
              brukes innenfor samme sweep.
            </p>
          </div>
        </section>

        <section id="pi" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Policy Iteration</h2>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm">
            <p>To-fase: <em>evaluation</em> + <em>improvement</em>, gjenta:</p>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`function policy_iteration(S, A, P, R, γ):
    π = tilfeldig policy (kan også settes likt overalt)
    repeat:
        # 1. POLICY EVALUATION — løs V^π
        # Alt. A) iterativ Bellman-backup til V konvergerer
        # Alt. B) lineært system (I − γ P_π) V = R_π   (O(|S|³))
        V = løs V^π

        # 2. POLICY IMPROVEMENT
        stabil = True
        for s in S:
            old = π[s]
            π[s] = argmax_a Σ_{s'} P(s'|s,a) · [ R + γ V[s'] ]
            if old ≠ π[s]: stabil = False

    until stabil
    return π, V`}</pre>
            <p className="font-semibold pt-2">Klassisk PI-trinn på papir:</p>
            <ol className="list-decimal pl-5 space-y-0.5 text-xs text-muted-foreground">
              <li>Skriv opp gjeldende π.</li>
              <li>
                <strong>Evaluering:</strong> sett opp lineær-systemet for{" "}
                <Tex>{"V^\\pi"}</Tex> — løs eksakt (2-3 ukjente kan løses for hånd).
              </li>
              <li>
                <strong>Improvement:</strong> for hver state, regn{" "}
                <Tex>{"Q^\\pi(s, a) = \\sum_{s'} P[R + \\gamma V^\\pi(s')]"}</Tex>{" "}
                for hver a. Velg argmax.
              </li>
              <li>
                Sammenlign med gammel π. Hvis identisk: stopp — π er optimal.
                Ellers gjenta.
              </li>
            </ol>
            <p className="text-xs text-muted-foreground">
              <strong>Modified PI:</strong> i stedet for full eksakt evaluering,
              gjør bare noen få Bellman-backups for <Tex>{"V^\\pi"}</Tex>.
              Krysser VI og PI; konvergerer som regel raskt.
            </p>
          </div>
        </section>

        <section id="compare" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. VI vs PI — når foretrekkes hvilken?</h2>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-3 py-2 w-40">Aspekt</th>
                  <th className="text-left font-semibold px-3 py-2">Value Iteration</th>
                  <th className="text-left font-semibold px-3 py-2">Policy Iteration</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-medium">Per-iterasjon</td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">Én Bellman-backup pr state — <Tex>{"O(|S|^2|A|)"}</Tex></td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">Full eksakt evaluering — <Tex>{"O(|S|^3)"}</Tex> + improvement</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-medium">Antall iterasjoner</td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">Mange (V flytter seg gradvis)</td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">Få (typisk &lt; <Tex>{"|S| \\cdot |A|"}</Tex>)</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-medium">Stopp-kriterie</td>
                  <td className="px-3 py-2 text-xs text-muted-foreground"><Tex>{"\\Delta &lt; \\theta"}</Tex> (numerisk konvergens på V)</td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">Policy uendret én runde (eksakt — kan oppdages før V konvergerer)</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-medium">Vinner når</td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">|S| stor, |A| liten — billig per backup</td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">|S| moderat, vil unngå mange iterasjoner</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-medium">Konvergens-type</td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">Asymptotisk (V_k → V*)</td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">Finitt antall steg til optimal π</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Praksis:</strong> i kurs/eksamen-MDPer (få states) er PI
            ofte raskest å regne på papir fordi V^π løses eksakt. Men VI er
            enklere mekanisk: én sweep, gjenta. Modified PI (få VI-sweeps som
            «evaluering») er sweet-spot.
          </p>
        </section>

        <section id="convergence" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Konvergens-garanti (γ &lt; 1)</h2>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm">
            <p>
              Bellman-operatoren <Tex>{"\\mathcal{T}"}</Tex> for VI:
            </p>
            <TexBlock>{"(\\mathcal{T} V)(s) = \\max_a \\sum_{s'} P(s' \\mid s, a) [R + \\gamma V(s')]"}</TexBlock>
            <p>
              er en <em>kontraksjon</em> i sup-normen med faktor <Tex>{"\\gamma"}</Tex>:
            </p>
            <TexBlock>{"\\|\\mathcal{T} V_1 - \\mathcal{T} V_2\\|_\\infty \\leq \\gamma \\|V_1 - V_2\\|_\\infty"}</TexBlock>
            <p className="text-xs text-muted-foreground">
              Ved Banachs fixed-point-teorem har <Tex>{"\\mathcal{T}"}</Tex> et
              unikt fixed-point <Tex>{"V^*"}</Tex>, og fra hvilket som helst
              start-V konvergerer <Tex>{"V_k \\to V^*"}</Tex> eksponentielt med
              rate <Tex>{"\\gamma"}</Tex>. Etter k iterasjoner:
            </p>
            <TexBlock>{"\\|V_k - V^*\\|_\\infty \\leq \\gamma^k \\|V_0 - V^*\\|_\\infty"}</TexBlock>
            <p className="text-xs text-muted-foreground">
              Krever <Tex>{"\\gamma &lt; 1"}</Tex>. Når <Tex>{"\\gamma = 1"}</Tex>{" "}
              (uendelig horisont uten diskontering) må vi anta at det finnes en
              absorberende terminal-state nådd i endelig tid, ellers kan{" "}
              <Tex>{"V"}</Tex> divergere.
            </p>
          </div>
        </section>

        <section id="drill" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">8. Regnedrill — interaktivt</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Liten 2-state MDP (A og B, actions stay/move). Du kjenner
            transition og reward — agenten skal finne optimal policy. Bytt
            mellom VI og PI, juster <Tex>{"\\gamma"}</Tex>, og se hvordan
            tabellen utvikler seg.
          </p>
          <BellmanDrillSim />
        </section>

        <section id="exam" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">9. Eksamen-typiske spørsmål</h2>
          <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
            <li>
              <strong className="text-foreground">«Skriv Bellman-likningen for V^π.»</strong>{" "}
              <Tex>{"V^\\pi(s) = \\sum_a \\pi(a|s) \\sum_{s'} P(s'|s,a)[R + \\gamma V^\\pi(s')]"}</Tex>.
            </li>
            <li>
              <strong className="text-foreground">«Bellman optimality?»</strong>{" "}
              Erstatte <Tex>{"\\sum_a \\pi"}</Tex> med{" "}
              <Tex>{"\\max_a"}</Tex>: <Tex>{"V^*(s) = \\max_a \\sum_{s'} P[R + \\gamma V^*(s')]"}</Tex>.
            </li>
            <li>
              <strong className="text-foreground">«VI-oppdaterings-regelen?»</strong>{" "}
              <Tex>{"V_{k+1}(s) \\leftarrow \\max_a \\sum_{s'} P[R + \\gamma V_k(s')]"}</Tex>.
              Stopp-kriterie: <Tex>{"\\max_s |V_{k+1}(s) - V_k(s)| &lt; \\theta"}</Tex>.
            </li>
            <li>
              <strong className="text-foreground">«PI-syklusen?»</strong>{" "}
              Evaluering (løs <Tex>{"V^\\pi"}</Tex>, evt iterativ Bellman-backup
              eller eksakt lineært system) → Improvement (argmax). Gjenta til
              policy stabil.
            </li>
            <li>
              <strong className="text-foreground">«Når foretrekkes VI vs PI?»</strong>{" "}
              VI vinner ved store <Tex>{"|S|"}</Tex>; PI vinner ved moderate{" "}
              <Tex>{"|S|"}</Tex> der eksakt evaluering er rimelig, og oppdager
              optimum gjennom færre iterasjoner.
            </li>
            <li>
              <strong className="text-foreground">«Hvorfor konvergerer VI?»</strong>{" "}
              Bellman-operatoren er en γ-kontraksjon i sup-normen. Banach gir
              unikt fixed-point V* og <Tex>{"\\|V_k - V^*\\| \\leq \\gamma^k \\|V_0 - V^*\\|"}</Tex>.
            </li>
            <li>
              <strong className="text-foreground">«Regn én VI-iterasjon for ...»</strong>{" "}
              Skriv tabellen <Tex>{"Q_k(s, a)"}</Tex> for hver action, ta max
              per state, skriv ny <Tex>{"V_{k+1}"}</Tex>-rad. Husk å bruke{" "}
              <em>forrige</em> tabells V på høyresiden.
            </li>
          </ul>
        </section>

        <div className="rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2 flex items-center gap-2">
            <Calculator className="h-4 w-4 text-brand" />
            Neste steg
          </h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte2501-reinforcement" }} className="text-brand hover:underline">
                Reinforcement Learning og MDP
              </Link>{" "}
              — konteksten: model-free metoder for når P og R er ukjente.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte2501-bandits" }} className="text-brand hover:underline">
                Multi-armed bandits
              </Link>{" "}
              — MDP uten state — explore vs exploit-grunnlaget.
            </li>
            <li>Python-øvelse: implementer VI og PI fra bunn for et lite grid.</li>
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
