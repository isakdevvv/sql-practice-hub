import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Map, Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import {
  ParadigmeGraph,
  type ParadigmeId,
  PARADIGMER,
} from "./ParadigmeGraph";
import { ProblemSelector, PROBLEMER } from "./ProblemSelector";
import { ParadigmeDragQuiz } from "./ParadigmeDragQuiz";

const STEPS = [
  { title: "Hvorfor et kart over AI", anchor: "intro" },
  { title: "Utforsk kartet", anchor: "kart" },
  { title: "Problem-velger — finn riktig familie", anchor: "velger" },
  { title: "Slik leser du klyngene", anchor: "klynger" },
  { title: "Drag-quiz — match problem til familie", anchor: "quiz" },
  { title: "Veien videre", anchor: "videre" },
];

export function AiParadigmerKartPage() {
  const [valgtNode, setValgtNode] = useState<ParadigmeId | null>(null);
  const [valgtProblem, setValgtProblem] = useState<string | null>(null);

  const highlighted = useMemo<Set<ParadigmeId>>(() => {
    if (!valgtProblem) return new Set();
    const p = PROBLEMER.find((p) => p.id === valgtProblem);
    return new Set(p?.riktige ?? []);
  }, [valgtProblem]);

  const highlightLabel =
    PROBLEMER.find((p) => p.id === valgtProblem)?.scenario ?? undefined;

  return (
    <StackPageShell title="AI-paradigmer kart" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <Link
            to="/stack/$slug"
            params={{ slug: "dte-2501" }}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-3"
          >
            <ArrowLeft className="h-3 w-3" />
            Tilbake til DTE-2501-hub
          </Link>
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2501 · Intro · Grokking AI kap. 1
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            AI-paradigmer — et interaktivt kart
          </h1>
          <p className="mt-3 text-muted-foreground">
            "AI" er ikke én ting — det er et knippe ulike algoritme-familier som
            angriper forskjellige typer problemer. Dette kartet (inspirert av
            forsiden på <em>Grokking AI</em>) gir deg en mental ramme før du
            dykker i de tekniske lesjonene. Klikk en node for å se hva familien
            gjør, prøv "problem-velger" for å se hvilke familier som passer for
            ulike scenarier, og avslutt med drag-quizen.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Map className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Pedagogisk idé:</span> de fleste
              eksamensspørsmål i DTE-2501 starter med å plassere et problem i
              riktig familie. Klarer du det, vet du hvilke metoder du skal
              hente fram. Dette kartet er treningen i å se mønsteret.
            </div>
          </div>
        </div>

        <CourseOutline courseId="dte2501-ai-paradigmer-kart" steps={STEPS} />

        <section id="intro" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Hvorfor et kart over AI</h2>
          <p className="text-sm text-muted-foreground mb-3">
            DTE-2501 hopper raskt mellom svært ulike teknikker: A*-søk, minimax,
            genetic algorithms, k-NN, k-Means, PCA, ensembler, reinforcement
            learning, nevrale nett. Det er lett å miste oversikten. Hvis du
            først får et overblikk over <em>hvilke familier som finnes</em> og{" "}
            <em>hvilke typer problemer hver familie løser</em>, blir resten av
            kurset mye lettere å plassere.
          </p>
          <p className="text-sm text-muted-foreground">
            Kartet under viser ni familier gruppert i fem klynger (farger):
            klassisk søk (blå), adversarial (rød), natur-inspirert / metaheuristikk
            (grønn), data-drevet ML (lilla) og reinforcement learning (oransje).
            Linjer mellom noder markerer slektskap — f.eks. at A* bygger på
            grunnleggende søk, eller at moderne RL ofte kombineres med nevrale nett.
          </p>
        </section>

        <section id="kart" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Utforsk kartet</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Klikk en node. Du får en one-liner, tre typiske problem-typer
            (ikoner) og en "Lær dybde →"-lenke til den eksisterende dybde-lesjonen
            i repoet.
          </p>
          <ParadigmeGraph
            selected={valgtNode}
            onSelect={(id) => setValgtNode(id)}
            highlighted={highlighted}
            highlightLabel={highlightLabel}
          />
        </section>

        <section id="velger" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">
            3. Problem-velger — finn riktig familie
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Velg ett av seks scenarier. Kartet over highlighter (lilla ring)
            familiene som passer, og du får en begrunnelse. Mange problemer har{" "}
            <em>flere</em> gyldige svar — poenget er å se mønsteret, ikke å
            finne én "fasit".
          </p>
          <ProblemSelector valgtId={valgtProblem} onVelg={setValgtProblem} />
        </section>

        <section id="klynger" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Slik leser du klyngene</h2>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-32">Klynge</th>
                  <th className="text-left font-semibold px-4 py-2">Sentralt prinsipp</th>
                  <th className="text-left font-semibold px-4 py-2 w-56">Lesjoner i repoet</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-blue-400">Søk</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    Utforsk en tilstandsgraf systematisk — med eller uten heuristikk.
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <Link to="/stack/$slug" params={{ slug: "sok-algoritmer" }} className="text-brand hover:underline">
                      Søkealgoritmer
                    </Link>
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-red-400">Adversarial</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    Søk i et spilltre der motstanderen spiller optimalt mot deg.
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <Link to="/stack/$slug" params={{ slug: "dte2501-minimax" }} className="text-brand hover:underline">
                      Minimax og alpha-beta
                    </Link>
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-green-400">Natur-insp.</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    Populasjons- eller sverm-basert søk — GA, ACO, PSO.
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <Link to="/stack/$slug" params={{ slug: "dte2501-genetic-algorithms" }} className="text-brand hover:underline">
                      GA, PSO, ACO
                    </Link>
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-purple-400">Data / ML</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    Lær mønstre fra data — klassisk ML og nevrale nett.
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <Link to="/stack/$slug" params={{ slug: "dte2501-knn" }} className="text-brand hover:underline">
                      k-NN
                    </Link>
                    {", "}
                    <Link to="/stack/$slug" params={{ slug: "nn-intro" }} className="text-brand hover:underline">
                      NN-intro
                    </Link>
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-orange-400">RL</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    Agent + belønning + omverden = lær policy via prøving og feiling.
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <Link to="/stack/$slug" params={{ slug: "dte2501-reinforcement" }} className="text-brand hover:underline">
                      RL og MDP
                    </Link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Når et nytt problem dukker opp (f.eks. på eksamen), spør deg selv:
            «<em>Hvilken type input har jeg, og hva vil jeg ut?</em>» Etiketter +
            tall ut? → ML/regresjon. Etiketter + klasse ut? → ML/klassifikasjon.
            Ingen etiketter, vil ha grupper? → klustring. Spill mot motstander?
            → adversarial. Tilstandsrom med kost? → søk. Belønningssignal? → RL.
          </p>
        </section>

        <section id="quiz" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">
            5. Drag-quiz — match problem til familie
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Ti problembeskrivelser. Dra hver til familien du tror er best egnet,
            og klikk "Sjekk svar". Feil får en forklaring så du vet hvorfor en
            annen familie er bedre.
          </p>
          <ParadigmeDragQuiz />
        </section>

        <section id="videre" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Veien videre</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Nå som du har kartet i hodet, gå tilbake til{" "}
            <Link to="/stack/$slug" params={{ slug: "dte-2501" }} className="text-brand hover:underline">
              DTE-2501-huben
            </Link>{" "}
            og start med moderne ML-sporet (k-NN først). Hver dybde-lesjon
            bygger ut én av nodene i dette kartet. Når du er ferdig med kurset,
            kom tilbake hit og test deg selv med drag-quizen igjen — du vil se
            at scenariene har blitt selvinnlysende.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PARADIGMER.slice(0, 6).map((p) => (
              <Link
                key={p.id}
                to="/stack/$slug"
                params={{ slug: p.dybdeSlug ?? "dte-2501" }}
                className="rounded-lg border border-border bg-card hover:border-brand/40 p-3 text-sm flex items-center justify-between gap-2 transition-colors"
              >
                <span className="font-medium">{p.kortNavn}</span>
                <span className="text-xs text-brand">{p.dybdeLabel} →</span>
              </Link>
            ))}
          </div>
        </section>

        <div className="rounded-xl border border-border bg-card p-5 text-sm">
          <div className="flex items-start gap-2">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div>
              <h3 className="font-semibold mb-1">Pedagogisk merknad</h3>
              <p className="text-muted-foreground leading-relaxed text-xs">
                Denne lesjonen er bevisst <em>visuell-først</em>: ingen flashcards,
                ingen lange tekstavsnitt. Målet er at du skal kunne <em>tegne</em>{" "}
                kartet selv på et papir etter et par minutter — det er ofte
                forskjellen mellom å huske et faktum og å forstå et felt.
              </p>
            </div>
          </div>
        </div>
      </div>
    </StackPageShell>
  );
}
