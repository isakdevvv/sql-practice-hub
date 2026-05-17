import type { ParadigmeId } from "./ParadigmeGraph";
import { PARADIGMER } from "./ParadigmeGraph";
import { CheckCircle2 } from "lucide-react";

export type Problem = {
  id: string;
  scenario: string;
  ikon: string;
  riktige: ParadigmeId[];
  begrunnelse: string;
};

export const PROBLEMER: Problem[] = [
  {
    id: "p1",
    scenario: "Finne korteste rute i et veinettverk fra A til B",
    ikon: "🗺️",
    riktige: ["search-fundamentals", "advanced-search"],
    begrunnelse:
      "Klassisk graf-søk. Uniform-cost search (Dijkstra-stil) finner optimalt; A* med admissible heuristikk (luftlinje-avstand) er raskere. Maur-sverm (ACO) brukes også i nettverks-ruting, men er sjelden best i én-til-én-tilfelle.",
  },
  {
    id: "p2",
    scenario: "Lære en agent å spille sjakk mot en menneskelig motstander",
    ikon: "♟️",
    riktige: ["adversarial", "reinforcement"],
    begrunnelse:
      "Adversarial search (minimax + alpha-beta) er den klassiske tilnærmingen — motstanderen spiller optimalt mot deg. Moderne sjakk-/Go-engines (AlphaZero) kombinerer dette med reinforcement learning via self-play.",
  },
  {
    id: "p3",
    scenario: "Klassifisere bilder av katter vs hunder",
    ikon: "🐱",
    riktige: ["ml", "neural-nets"],
    begrunnelse:
      "Supervised ML med konvolusjonelle nevrale nett (CNN) er state-of-the-art for bildeklassifisering. Klassisk ML (k-NN på piksler) fungerer, men dårlig — for høy-dimensjonale data trengs feature-læring som NN gir.",
  },
  {
    id: "p4",
    scenario:
      "Optimere ruten for 20 leveranser slik at total kjøretid minimeres (TSP)",
    ikon: "🚚",
    riktige: ["evolutionary", "swarm-ants", "advanced-search"],
    begrunnelse:
      "Klassisk metaheuristikk-problem. Genetic algorithms og Ant Colony Optimization (ACO) er to populære valg — populasjons-/sverm-basert søk håndterer det enorme søke-rommet bra. Held-Karp DP er eksakt, men kun praktisk for n < ~20. A* med god heuristikk kan også fungere for små instanser.",
  },
  {
    id: "p5",
    scenario:
      "Lære en robot-arm å plukke opp en kopp uten å bli fortalt eksakt hvordan",
    ikon: "🤖",
    riktige: ["reinforcement", "neural-nets"],
    begrunnelse:
      "Reinforcement learning er ideelt: agenten prøver, mottar belønning (eller straff), og lærer en policy. Moderne deep RL bruker nevrale nett til å representere policy/Q-funksjon (DQN, PPO).",
  },
  {
    id: "p6",
    scenario:
      "Finne minimum av en kontinuerlig matematisk funksjon med mange lokale minima",
    ikon: "📉",
    riktige: ["swarm-particles", "evolutionary"],
    begrunnelse:
      "Particle Swarm Optimization (PSO) er spesielt designet for kontinuerlig optimering. Genetic algorithms fungerer også. Tradisjonell gradient-descent setter seg fast i første lokale minimum — sverm/populasjon gir global utforskning.",
  },
];

type Props = {
  valgtId: string | null;
  onVelg: (id: string | null) => void;
};

export function ProblemSelector({ valgtId, onVelg }: Props) {
  const valgt = PROBLEMER.find((p) => p.id === valgtId) ?? null;

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="border-b border-border px-4 py-2 flex items-center justify-between">
        <div className="text-sm font-medium">Problem-velger</div>
        {valgt && (
          <button
            onClick={() => onVelg(null)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Nullstill
          </button>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs text-muted-foreground mb-3">
          Velg et problem-scenario. Kartet highlighter familiene som passer.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
          {PROBLEMER.map((p) => {
            const erValgt = p.id === valgtId;
            return (
              <button
                key={p.id}
                onClick={() => onVelg(p.id)}
                className={`text-left rounded-lg border p-3 transition-colors ${
                  erValgt
                    ? "border-brand bg-brand/10"
                    : "border-border bg-muted/20 hover:border-brand/40"
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-xl shrink-0" aria-hidden>{p.ikon}</span>
                  <div className="text-xs leading-relaxed">{p.scenario}</div>
                </div>
              </button>
            );
          })}
        </div>

        {valgt && (
          <div className="rounded-lg border border-brand/30 bg-brand/5 p-3">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-4 w-4 text-brand" />
              <div className="text-xs font-semibold uppercase tracking-wider text-brand">
                Relevante familier
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {valgt.riktige.map((id) => {
                const par = PARADIGMER.find((p) => p.id === id);
                if (!par) return null;
                return (
                  <span
                    key={id}
                    className="text-xs px-2 py-0.5 rounded-full bg-brand/15 text-brand border border-brand/30"
                  >
                    {par.kortNavn}
                  </span>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {valgt.begrunnelse}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
