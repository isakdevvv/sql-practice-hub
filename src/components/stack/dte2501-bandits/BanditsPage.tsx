import { Link } from "@tanstack/react-router";
import { Lightbulb, Sparkles, ArrowLeft, AlertTriangle } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { BanditsSim } from "./BanditsSim";
import { Tex, TexBlock } from "@/components/Tex";

const STEPS = [
  { title: "Bandit-problemet", anchor: "intro" },
  { title: "Action-value Q(a)", anchor: "qa" },
  { title: "Explore vs exploit", anchor: "tradeoff" },
  { title: "ε-greedy", anchor: "egreedy" },
  { title: "Optimistic initial values", anchor: "optimistic" },
  { title: "UCB1", anchor: "ucb" },
  { title: "Thompson sampling", anchor: "thompson" },
  { title: "Regret som metrikk", anchor: "regret" },
  { title: "Eksamen-typiske spørsmål", anchor: "exam" },
];

export function BanditsPage() {
  return (
    <StackPageShell title="Multi-armed bandits" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2501 · Bandits (Sutton & Barto kap. 2)
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Multi-armed bandits — explore vs exploit i sin reneste form
          </h1>
          <p className="mt-3 text-muted-foreground">
            Bandit-problemet er RL <em>uten</em> state — bare ett valg per
            tidssteg blant <Tex>{"K"}</Tex> «armer» med ukjente belønning-distribusjoner.
            Det er den enkleste settingen der vi må balansere{" "}
            <strong className="text-foreground">utforskning</strong> (lære om
            armene) mot <strong className="text-foreground">utnytting</strong>{" "}
            (velge beste kjente).
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Navnet:</span> «one-armed bandit» er
              en spilleautomat. <em>Multi</em>-armed: tenk K spilleautomater
              ved siden av hverandre, hver med ukjent gevinst-rate. Du har T
              spinn — hvilken automat skal du velge når?
            </div>
          </div>
        </div>

        <CourseOutline courseId="dte2501-bandits" steps={STEPS} />

        <section id="intro" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Bandit-problemet</h2>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm">
            <p>
              Stokastisk K-armet bandit: hver arm <Tex>{"a \\in \\{1, \\dots, K\\}"}</Tex>{" "}
              gir tilfeldig belønning <Tex>{"R_t \\sim \\mathcal{D}_a"}</Tex>{" "}
              med ukjent gjennomsnitt <Tex>{"q_*(a) = \\mathbb{E}[R \\mid a]"}</Tex>.
              Vi velger <Tex>{"A_t"}</Tex>, observerer{" "}
              <Tex>{"R_t"}</Tex>, repeter i <Tex>{"T"}</Tex> trekk.
            </p>
            <p>
              <strong>Mål:</strong> maksimer forventet sum{" "}
              <Tex>{"\\sum_{t=1}^T R_t"}</Tex>, ekvivalent å minimere{" "}
              <em>regret</em> (forskjellen mot å alltid velge beste arm).
            </p>
            <p className="text-xs text-muted-foreground">
              Eksempler i praksis: A/B-testing av nettsider, klinisk forsøk med
              flere behandlinger, online ad-allokering, anbefaling. Det som
              skiller bandits fra full RL: det er <strong>ingen state</strong>{" "}
              og dermed ingen langsiktige konsekvenser av et valg — bare
              umiddelbar belønning.
            </p>
          </div>
        </section>

        <section id="qa" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Action-value methods: estimere Q(a)</h2>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm">
            <p>
              Vi kan ikke se <Tex>{"q_*(a)"}</Tex> direkte — vi må estimere den
              fra observasjoner. Den naturlige estimatoren er gjennomsnittet av
              alle belønninger vi har sett for arm <Tex>{"a"}</Tex>:
            </p>
            <TexBlock>{"Q_t(a) = \\frac{\\text{sum av belønninger fra } a \\text{ før tid } t}{N_t(a)} = \\frac{\\sum_{i=1}^{t-1} R_i \\cdot \\mathbb{1}[A_i = a]}{N_t(a)}"}</TexBlock>
            <p className="text-xs text-muted-foreground">
              Ved store talls lov: <Tex>{"Q_t(a) \\to q_*(a)"}</Tex> når{" "}
              <Tex>{"N_t(a) \\to \\infty"}</Tex>. Incrementell oppdatering
              (slipper å lagre alle belønninger):
            </p>
            <TexBlock>{"Q_{n+1} = Q_n + \\frac{1}{n}\\big(R_n - Q_n\\big)"}</TexBlock>
            <p className="text-xs text-muted-foreground">
              Generelt mønster:{" "}
              <em>NewEstimate ← OldEstimate + StepSize · (Target − OldEstimate)</em>.
              Med konstant step-size <Tex>{"\\alpha"}</Tex> får vi eksponensielt
              vektet gjennomsnitt — bra for ikke-stasjonære bandits der{" "}
              <Tex>{"q_*"}</Tex> endrer seg over tid.
            </p>
          </div>
        </section>

        <section id="tradeoff" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Explore vs exploit</h2>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm">
            <p>To grunnleggende strategier i hver runde:</p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-muted-foreground">
              <li>
                <strong className="text-foreground">Exploit:</strong> velg
                grådig arm <Tex>{"\\arg\\max_a Q_t(a)"}</Tex>. Gir best forventet
                belønning <em>nå</em> — men kan låse seg på suboptimal arm
                hvis vi har dårlig estimat.
              </li>
              <li>
                <strong className="text-foreground">Explore:</strong> velg en
                annen arm for å forbedre estimater. Koster forventet belønning
                <em> nå</em>, men forhindrer at vi sitter fast.
              </li>
            </ul>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
              <div className="text-xs">
                Grådig-from-start (alltid exploit etter første prøve) er nesten
                alltid suboptimalt med støy: én uheldig observasjon kan få oss
                til å forkaste den faktisk beste armen.
              </div>
            </div>
          </div>
        </section>

        <section id="egreedy" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. ε-greedy</h2>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm">
            <p>Den enkleste fungerende strategien:</p>
            <TexBlock>{"A_t = \\begin{cases} \\arg\\max_a Q_t(a) & \\text{med sannsynlighet } 1 - \\epsilon \\\\ \\text{tilfeldig arm} & \\text{med sannsynlighet } \\epsilon \\end{cases}"}</TexBlock>
            <ul className="list-disc pl-5 space-y-0.5 text-xs text-muted-foreground">
              <li>
                <Tex>{"\\epsilon = 0"}</Tex>: pur grådig — risikoen for å låse
                seg på dårlig arm er høy.
              </li>
              <li>
                <Tex>{"\\epsilon = 0.1"}</Tex>: 10 % tilfeldig utforsk — typisk
                tunet verdi.
              </li>
              <li>
                <Tex>{"\\epsilon"}</Tex>-decay (f.eks.{" "}
                <Tex>{"\\epsilon_t = 1/t"}</Tex>): kraftig utforsking tidlig,
                fokus på exploit sent. Konvergerer til optimal asymptotisk.
              </li>
            </ul>
            <p className="text-xs text-muted-foreground">
              <strong>Svakhet:</strong> exploration er <em>uinformert</em> — vi
              kaster armer like ofte selv om vi allerede har sterke bevis for at
              de er dårlige.
            </p>
          </div>
        </section>

        <section id="optimistic" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Optimistic initial values</h2>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm">
            <p>
              Sett <Tex>{"Q_0(a) = Q_{\\text{init}}"}</Tex> mye høyere enn den
              sanne maks-belønningen (f.eks. +5 når sann μ er rundt 0–1). Alle
              armer ser «for gode ut» til å starte med, så grådig algoritme
              tvinges til å prøve hver av dem flere ganger før Q-verdiene
              krymper.
            </p>
            <ul className="list-disc pl-5 space-y-0.5 text-xs text-muted-foreground">
              <li>Ingen behov for eksplisitt <Tex>{"\\epsilon"}</Tex>.</li>
              <li>Krever sample-mean-oppdatering med <Tex>{"\\alpha = 1/n"}</Tex> for å «glemme» initialen.</li>
              <li>Funker bare i stasjonære bandits — i ikke-stasjonære er effekten kortlivd.</li>
            </ul>
            <p className="text-xs text-muted-foreground">
              <strong>Sutton & Barto:</strong> «exploration via optimism is a
              simple trick that can be quite effective on stationary problems,
              but it is far from being a generally useful approach.»
            </p>
          </div>
        </section>

        <section id="ucb" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. UCB1 — Upper Confidence Bound</h2>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm">
            <p>
              Smartere utforskning: foretrekk armer som er enten gode{" "}
              <em>eller</em> usikre. UCB1 (Auer et al. 2002) velger:
            </p>
            <TexBlock>{"A_t = \\arg\\max_a \\Bigg[\\, Q_t(a) + c\\sqrt{\\frac{\\ln t}{N_t(a)}}\\, \\Bigg]"}</TexBlock>
            <ul className="list-disc pl-5 space-y-0.5 text-xs text-muted-foreground">
              <li>
                Første ledd <Tex>{"Q_t(a)"}</Tex> belønner exploit (høyt
                gjennomsnitt).
              </li>
              <li>
                Andre ledd <Tex>{"\\sqrt{\\ln t / N_t(a)}"}</Tex> belønner
                explore: armer som er valgt få ganger (lav <Tex>{"N_t"}</Tex>)
                får høyt bonus.
              </li>
              <li>
                <Tex>{"c"}</Tex> regulerer styrken (typisk{" "}
                <Tex>{"c = \\sqrt{2}"}</Tex> eller 1–2).
              </li>
            </ul>
            <p className="text-xs text-muted-foreground">
              <strong>Garanti:</strong> UCB1 oppnår{" "}
              <Tex>{"O(\\ln T)"}</Tex> regret — logaritmisk i tid. Dette er
              optimalt for stokastiske bandits.
            </p>
          </div>
        </section>

        <section id="thompson" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Thompson sampling — kort intro</h2>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm">
            <p>
              Bayesisk strategi: oppretthold en posterior-fordeling over hver
              arms <Tex>{"q_*(a)"}</Tex>. På hvert tidssteg:
            </p>
            <ol className="list-decimal pl-5 space-y-0.5 text-xs text-muted-foreground">
              <li>
                Trekk én sample <Tex>{"\\tilde q(a)"}</Tex> fra posterior for
                hver arm.
              </li>
              <li>
                Velg arm <Tex>{"\\arg\\max_a \\tilde q(a)"}</Tex>.
              </li>
              <li>
                Observér belønning, oppdater posterior for valgt arm.
              </li>
            </ol>
            <p className="text-xs text-muted-foreground">
              Bernoulli-armer (klikk/ikke-klikk): Beta-prior →{" "}
              Beta(<Tex>{"\\alpha"}</Tex>, <Tex>{"\\beta"}</Tex>) posterior, der{" "}
              <Tex>{"\\alpha"}</Tex> teller suksesser, <Tex>{"\\beta"}</Tex>{" "}
              feil. Konjugat-prior gjør oppdatering analytisk. Empirisk ofte
              best i praksis; matcher UCB asymptotisk.
            </p>
          </div>
        </section>

        <section id="regret" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">8. Regret som metrikk</h2>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm">
            <p>
              For å sammenligne algoritmer trenger vi en metrikk uavhengig av
              støy-realisering. <strong>Kumulativ (pseudo-)regret</strong>:
            </p>
            <TexBlock>{"L_T = T \\cdot q_*(a^*) - \\mathbb{E}\\!\\left[\\sum_{t=1}^T R_t\\right] = \\sum_{a} \\Delta_a \\cdot \\mathbb{E}[N_T(a)]"}</TexBlock>
            <p className="text-xs text-muted-foreground">
              der <Tex>{"\\Delta_a = q_*(a^*) - q_*(a)"}</Tex>. Lav regret =
              god algoritme.
            </p>
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full text-xs">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left font-semibold px-3 py-1.5">Algoritme</th>
                    <th className="text-left font-semibold px-3 py-1.5">Regret-orden</th>
                    <th className="text-left font-semibold px-3 py-1.5">Karakteristikk</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-border">
                    <td className="px-3 py-1.5">Pur grådig</td>
                    <td className="px-3 py-1.5"><Tex>{"\\Theta(T)"}</Tex></td>
                    <td className="px-3 py-1.5 text-muted-foreground">Kan låse seg → lineær regret</td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="px-3 py-1.5"><Tex>{"\\epsilon"}</Tex>-greedy, fast <Tex>{"\\epsilon"}</Tex></td>
                    <td className="px-3 py-1.5"><Tex>{"\\Theta(T)"}</Tex></td>
                    <td className="px-3 py-1.5 text-muted-foreground">Utforsker for mye — også lineær</td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="px-3 py-1.5"><Tex>{"\\epsilon"}</Tex>-greedy, <Tex>{"\\epsilon_t \\propto 1/t"}</Tex></td>
                    <td className="px-3 py-1.5"><Tex>{"O(\\ln T)"}</Tex></td>
                    <td className="px-3 py-1.5 text-muted-foreground">Krever finjustering</td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="px-3 py-1.5">UCB1</td>
                    <td className="px-3 py-1.5"><Tex>{"O(\\ln T)"}</Tex></td>
                    <td className="px-3 py-1.5 text-muted-foreground">Parameter-fri, tight bound</td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="px-3 py-1.5">Thompson sampling</td>
                    <td className="px-3 py-1.5"><Tex>{"O(\\ln T)"}</Tex></td>
                    <td className="px-3 py-1.5 text-muted-foreground">Bayesisk, praktisk best</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4">
            <BanditsSim />
          </div>
        </section>

        <section id="exam" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">9. Eksamen-typiske spørsmål</h2>
          <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
            <li>
              <strong className="text-foreground">«Hva er et bandit-problem?»</strong>{" "}
              K armer med ukjente belønning-distribusjoner. Ingen state. Mål:
              maksimer kumulativ belønning over T trekk.
            </li>
            <li>
              <strong className="text-foreground">«Forskjellen mellom bandits og full RL?»</strong>{" "}
              Bandits har ingen state — ett valg = umiddelbar belønning uten
              konsekvenser for framtida. RL har state-overganger, så et valg
              endrer framtidige muligheter.
            </li>
            <li>
              <strong className="text-foreground">«UCB1-formelen?»</strong>{" "}
              <Tex>{"A_t = \\arg\\max_a [Q_t(a) + c\\sqrt{\\ln t / N_t(a)}]"}</Tex>.
              Bonus for sjeldent valgte armer.
            </li>
            <li>
              <strong className="text-foreground">«Hvorfor er pur ε-greedy med ε fast suboptimal?»</strong>{" "}
              Den utforsker like mye i sluttfasen som i begynnelsen — lineær
              regret. ε-decay eller UCB gir <Tex>{"O(\\ln T)"}</Tex>.
            </li>
            <li>
              <strong className="text-foreground">«Hva er regret?»</strong>{" "}
              Differansen mellom oracle (alltid beste arm) og faktisk samlet
              belønning. Foretrukken metrikk for bandit-algoritmer.
            </li>
            <li>
              <strong className="text-foreground">«Optimistic initial values — hvordan virker det?»</strong>{" "}
              Sett <Tex>{"Q_0"}</Tex> mye høyere enn sann μ. Grådig algoritme
              tvinges til å prøve hver arm flere ganger før Q krymper, så vi
              får automatisk utforskning uten ε.
            </li>
          </ul>
        </section>

        <div className="rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-brand" />
            Neste steg
          </h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte2501-reinforcement" }} className="text-brand hover:underline">
                Reinforcement Learning
              </Link>{" "}
              — bandits + state = full MDP/RL.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte2501-mdp-bellman" }} className="text-brand hover:underline">
                MDP-Bellman-drill
              </Link>{" "}
              — neste skritt: Value Iteration og Policy Iteration på en MDP.
            </li>
            <li>Python-øvelse: implementer ε-greedy og UCB1 fra bunn.</li>
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
