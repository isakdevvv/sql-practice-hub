import { Link } from "@tanstack/react-router";
import { Lightbulb, Dna, AlertTriangle, ArrowLeft } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { GaEvolution } from "./GaEvolution";
import { PsoSwarm } from "./PsoSwarm";
import { AcoTsp } from "./AcoTsp";
import { Mermaid } from "@/components/Mermaid";

const GA_LOOP_CHART = `graph TD
  A[Init: populasjon] --> B[Evaluer fitness]
  B --> C{Konvergert?}
  C -->|Ja| D[Returner beste]
  C -->|Nei| E[Seleksjon]
  E --> F[Crossover]
  F --> G[Mutasjon]
  G --> B`;

const STEPS = [
  { title: "Hvorfor metaheuristikker?", anchor: "intro" },
  { title: "Genetic algorithm — komponentene", anchor: "ga-parts" },
  { title: "Seleksjon — roulette og tournament", anchor: "selection" },
  { title: "Crossover og mutasjon", anchor: "operators" },
  { title: "Interaktiv: GA-evolusjon", anchor: "ga-vis" },
  { title: "GA pseudokode", anchor: "code" },
  { title: "Swarm intelligence — PSO", anchor: "pso" },
  { title: "Interaktiv: PSO-flokken", anchor: "pso-vis" },
  { title: "Ant Colony Optimization", anchor: "aco" },
  { title: "Interaktiv: ACO på TSP", anchor: "aco-vis" },
  { title: "Eksamen-typiske spørsmål", anchor: "exam" },
];

export function GeneticPage() {
  return (
    <StackPageShell title="Genetic algorithms, swarm, ACO" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2501 · Metaheuristikk
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Naturinspirerte søk — GA, PSO, ACO
          </h1>
          <p className="mt-3 text-muted-foreground">
            Når søkerommet er for stort for brute force, og funksjonen er
            ikke-deriverbar (kan ikke bruke gradient descent), bruker vi
            populasjons-baserte søk. Disse herme natur: evolusjon, fugleflokker,
            maurkolonier.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Sentralt:</span> hold en POPULASJON av
              kandidatløsninger. Generer nye fra de beste. Stokastiske — gir
              ulike svar hver gang.
            </div>
          </div>
        </div>

        <CourseOutline courseId="dte2501-genetic" steps={STEPS} />

        <section id="intro" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Hvorfor metaheuristikker?</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Tre typer optimerings-problemer:

1. KONVEKS (f.eks. lineær regresjon)
   → Bruk lukket form eller gradient descent. Garantert globalt opt.

2. ULOKAL OG DERIVÉRBAR (f.eks. nevrale nett)
   → Stochastic gradient descent. Lokalt minimum, men «funker».

3. IKKE-DERIVÉRBAR / DISKRET / KOMBINATORISK (f.eks. TSP, schedulering)
   → Gradient finnes ikke. Brute force er N!.
   → Bruk metaheuristikk: GA, PSO, ACO, simulated annealing.

Felles for metaheuristikker:
  - black-box: trenger bare en fitness(x) → tall
  - stokastiske: ulik kjøring → ulikt svar
  - ingen optimumsgaranti — men ofte VELDIG gode løsninger fort`}</pre>
          </div>
        </section>

        <section id="ga-parts" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Genetic algorithm — komponentene</h2>
          <p className="text-sm text-muted-foreground mb-4">
            En GA modellerer evolusjon: en populasjon av individer (kandidatløsninger)
            som reproduserer, muterer og overlever basert på fitness.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`KROMOSOM (chromosome):
   Representasjon av ÉN løsning.
   Eks: TSP → [3, 1, 4, 2, 0] (rekkefølge byer besøkes)
        bits → 10110100 (binær koding av tall)
        floats → [0.12, 0.88, -0.45] (kontinuerlig)

GENE:
   Ett element i kromosomet. Tilsvarer ett valg / én parameter.

POPULASJON:
   Mengde av kromosomer som er aktiv i én generasjon. Størrelse N (50–500).

FITNESS-FUNKSJON f(c):
   Hvor god er kromosomet c? Større = bedre (eller motsatt — vær konsekvent).
   For TSP: f(c) = −total-distanse  (negativ → MINIMERE = MAKSIMERE −d).

GENERASJON:
   Én syklus av seleksjon → crossover → mutasjon → ny populasjon.`}</pre>
          </div>
        </section>

        <section id="selection" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Seleksjon — roulette og tournament</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Hvilke foreldre velger vi? De bedre individene skal ha større sjanse
            for å reprodusere — men ikke 100%, ellers krasjer mangfoldet.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`ROULETTE WHEEL (fitness-proportional):
   p(individ_i) = f(c_i) / Σⱼ f(c_j)
   Tenk på det som en kakediagram: høyere fitness = større skive.
   Snurre hjulet → velg den «kaka» pinnen lander på.

   Problem: hvis f varierer kraftig (f=1000, f=2, f=3), vil 1000-en
   ta over hele populasjonen i én generasjon (premature konvergens).
   Løsning: rangering eller skalering.

TOURNAMENT SELECTION:
   1. Plukk t individer tilfeldig (typisk t=3-5)
   2. Velg den med høyest fitness blant disse
   3. Repeter for å plukke neste forelder

   Fordel: presset (selection pressure) er enkelt å justere via t.
            t=1 → ren tilfeldighet. t=N → alltid den beste.

ELITISM:
   Behold de top-k beste UENDRET i neste generasjon. Sikrer at vi aldri
   "mister" beste-så-langt.`}</pre>
          </div>

          <div className="mt-4 overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-32">Seleksjon</th>
                  <th className="text-left font-semibold px-4 py-2">Bias mot beste</th>
                  <th className="text-left font-semibold px-4 py-2">Exploration</th>
                  <th className="text-left font-semibold px-4 py-2">Kommentar</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">Roulette</td>
                  <td className="px-4 py-2 text-muted-foreground">Høyt (fitness-prop.)</td>
                  <td className="px-4 py-2 text-muted-foreground">Lavt</td>
                  <td className="px-4 py-2 text-muted-foreground">Skala-sensitiv, prematur konvergens</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">Tournament</td>
                  <td className="px-4 py-2 text-muted-foreground">Justerbart via t</td>
                  <td className="px-4 py-2 text-muted-foreground">Justerbart</td>
                  <td className="px-4 py-2 text-muted-foreground">Robust, mest brukt i praksis</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">Rank</td>
                  <td className="px-4 py-2 text-muted-foreground">Moderat</td>
                  <td className="px-4 py-2 text-muted-foreground">Høyt</td>
                  <td className="px-4 py-2 text-muted-foreground">Skala-uavhengig — bra med extreme fitness-skala</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">Elitism</td>
                  <td className="px-4 py-2 text-muted-foreground">Maks (top-k)</td>
                  <td className="px-4 py-2 text-muted-foreground">0 for de elite</td>
                  <td className="px-4 py-2 text-muted-foreground">Sikrer beste aldri tapes — kombineres med annet</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">Truncation</td>
                  <td className="px-4 py-2 text-muted-foreground">Hardt — bare topp x %</td>
                  <td className="px-4 py-2 text-muted-foreground">Veldig lavt</td>
                  <td className="px-4 py-2 text-muted-foreground">Aggressiv — fungerer hvis populasjon er stor</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="operators" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Crossover og mutasjon</h2>
          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`CROSSOVER (rekombinasjon):
   Lager 1 eller 2 barn fra 2 foreldre.

   One-point crossover (bits):
       Parent A:  1 0 1 1 | 0 1 0 0
       Parent B:  0 1 1 0 | 1 1 0 1
                          ↑ punkt
       Child:     1 0 1 1 | 1 1 0 1   (A før, B etter)

   For TSP-rekkefølge bruker vi ORDER CROSSOVER (OX):
       behold et segment fra A, fyll resten med B i rekkefølge
       (slik at vi ikke besøker en by to ganger).

MUTASJON:
   Tilfeldig liten endring — sikrer at vi utforsker nye områder.

   Bit-flip (binær koding):
       1 0 1 1 0 1 → 1 0 1 1 1 1   (én bit flippet)

   Swap (TSP):
       [3, 1, 4, 2, 0] → [3, 2, 4, 1, 0]  (bytte 2 og 1)

   Mutasjonsrate er liten, typisk 0.01-0.05 per gen.
   For lav → for tidlig konvergens. For høy → tilfeldig søk.`}</pre>
          </div>

          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-40">Operator</th>
                  <th className="text-left font-semibold px-4 py-2">Hva den gjør</th>
                  <th className="text-left font-semibold px-4 py-2">Effekt på diversitet</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">Single-point cross</td>
                  <td className="px-4 py-2 text-muted-foreground">Bytt halene etter ett tilfeldig kuttpunkt</td>
                  <td className="px-4 py-2 text-muted-foreground">Lav blanding — segment-konservativ</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">Two-point cross</td>
                  <td className="px-4 py-2 text-muted-foreground">Bytt segment mellom to kuttpunkter</td>
                  <td className="px-4 py-2 text-muted-foreground">Moderat — vanlig standard</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">Uniform cross</td>
                  <td className="px-4 py-2 text-muted-foreground">For hvert gen, velg 50/50 fra A eller B</td>
                  <td className="px-4 py-2 text-muted-foreground">Høy — bryter ned bygge-blokker</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">Order (OX) — TSP</td>
                  <td className="px-4 py-2 text-muted-foreground">Behold segment, fyll resten i B-rekkefølge</td>
                  <td className="px-4 py-2 text-muted-foreground">Moderat — bevarer permutasjon</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">Mutasjon p_m ≈ 1/L</td>
                  <td className="px-4 py-2 text-muted-foreground">Tommelfingerregel: 1 endring per kromosom-snitt</td>
                  <td className="px-4 py-2 text-muted-foreground">Lav rate → ekspl. svekkes; høy → random walk</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 flex items-start gap-3">
            <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hvorfor GA er trege:</span> hver
              generasjon krever N fitness-evalueringer. For et nevralt nett
              betyr hver evaluering en full forward+backward pass på et helt
              treningssett. 100 generasjoner × 200 individer = 20 000 trenings-runder.
              Det er hvorfor gradient-descent vinner når gradient er tilgjengelig.
            </div>
          </div>
        </section>

        <section id="ga-vis" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Interaktiv: GA-evolusjon (OneMax)</h2>
          <p className="text-sm text-muted-foreground mb-4">
            En populasjon av 16-bit strenger. Fitness = antall 1-ere
            (OneMax-problemet — vi vil ha bare 1-ere). Trykk «Neste generasjon»
            for å se ett steg av seleksjon → crossover → mutasjon. Gule bits er
            nylig muterte. Kjør 50 generasjoner og se hvor fort populasjonen
            konvergerer mot 16/16.
          </p>
          <GaEvolution />
        </section>

        <section id="code" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. GA pseudokode</h2>
          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-3">
              GA-loopen som flowchart
            </div>
            <Mermaid
              chart={GA_LOOP_CHART}
              ariaLabel="Flowchart over genetic algorithm: init, evaluer fitness, konvergens-sjekk, seleksjon, crossover, mutasjon, loop tilbake"
            />
            <p className="text-xs text-muted-foreground mt-3">
              Loopen kjorer til konvergens-kriteriet slar inn (antall
              generasjoner, fitness-threshold, eller K generasjoner uten
              forbedring). Pseudokoden under viser detaljene.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`function genetic_algorithm(fitness, N, generations, p_cross, p_mut):
    # 1. Init
    population = [random_chromosome() for _ in 1..N]

    for gen in 1..generations:
        # 2. Evaluér
        scores = [fitness(c) for c in population]

        # 3. Elitisme — behold top-2
        new_pop = top_k(population, scores, k=2)

        # 4. Fyll resten via seleksjon + crossover + mutasjon
        while len(new_pop) < N:
            p1 = tournament_select(population, scores, t=3)
            p2 = tournament_select(population, scores, t=3)
            if random() < p_cross:
                c1, c2 = crossover(p1, p2)
            else:
                c1, c2 = p1, p2
            c1 = mutate(c1, p_mut)
            c2 = mutate(c2, p_mut)
            new_pop.extend([c1, c2])

        population = new_pop[:N]

    return best(population, fitness)

Stopp-kriterier:
   - antall generasjoner nådd
   - fitness over en threshold
   - ingen forbedring i K generasjoner`}</pre>
          </div>
        </section>

        <section id="pso" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Swarm intelligence — PSO</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Particle Swarm Optimization (PSO) modellerer en flokk fugler som søker
            etter mat. Hver fugl («partikkel») har posisjon og hastighet, og
            justerer kursen mot sitt eget beste funn OG flokkens beste funn.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`For hver partikkel i:
    x_i = posisjon (kandidatløsning)
    v_i = hastighet
    p_i = beste posisjon i selv har sett
    g    = beste posisjon HELE flokken har sett

Oppdater:
    v_i ← w·v_i  +  c₁·r₁·(p_i − x_i)  +  c₂·r₂·(g − x_i)
                   └──── kognitiv ───┘   └─── sosial ────┘
    x_i ← x_i + v_i

Parameterne:
    w  = inertia (typisk 0.7 — hvor mye gammel hastighet beholdes)
    c₁ = kognitiv vekt (typisk 1.5)
    c₂ = sosial vekt (typisk 1.5)
    r₁, r₂ = tilfeldige tall i [0, 1]

Klassisk anvendelse: kontinuerlig optimering (neural net weights,
hyperparameter tuning).`}</pre>
          </div>
        </section>

        <section id="pso-vis" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">
            8. Interaktiv: PSO på 2D-landskap
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Partikler søker etter minimum av Rastrigin-funksjonen — et brutalt
            ikke-konvekst landskap med svært mange lokale minima. Mørk = lav
            verdi (mål). Hver partikkel husker sitt eget beste (liten ring) og
            følger flokkens beste (gul stjerne). Skru på vekt-parametrene og
            se hvordan flokken oppfører seg.
          </p>
          <PsoSwarm />
        </section>

        <section id="aco" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">9. Ant Colony Optimization</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Maur finner korteste vei mellom bol og mat ved å legge igjen
            feromon-spor — kortere veier blir besøkt mer ofte, fordi feromoner
            har mindre tid til å fordampe. ACO etteraper dette for graf-problemer
            (TSP, ruting).
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Graf G = (V, E), feromon-nivå τ(i,j) på hver kant.

For hver maur k:
    Start i tilfeldig by, gå videre med sannsynlighet:
                 τ(i,j)^α · η(i,j)^β
    P(j | i) = ────────────────────────────
               Σ_l  τ(i,l)^α · η(i,l)^β

    der η(i,j) = 1 / distance(i, j) (heuristikk)

Etter alle maur har fullført sin tour:
    Fordamping:  τ(i,j) ← (1 − ρ) · τ(i,j)
    Forsterkning: hver kant (i,j) på rute r får +Δτ
                  = 1/L(r) der L = tour-lengde
                  → korte tourer legger igjen MER feromon

Parametre:
    α = feromon-vekt (typisk 1)
    β = heuristikk-vekt (typisk 2-5)
    ρ = fordampningsrate (typisk 0.1)

Anvendelser:
   - TSP, vehicle routing
   - Nettverks-ruting (AntNet)
   - Jobb-schedulering`}</pre>
          </div>

          <div className="mt-4 overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-32">Aspekt</th>
                  <th className="text-left font-semibold px-4 py-2">GA</th>
                  <th className="text-left font-semibold px-4 py-2">PSO (Swarm)</th>
                  <th className="text-left font-semibold px-4 py-2">ACO</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">Informasjons-deling</td>
                  <td className="px-4 py-2 text-muted-foreground">Crossover av foreldre</td>
                  <td className="px-4 py-2 text-muted-foreground">Personlig + global beste</td>
                  <td className="px-4 py-2 text-muted-foreground">Indirekte via feromon-spor</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">Konvergens</td>
                  <td className="px-4 py-2 text-muted-foreground">Sakte, mangfoldig</td>
                  <td className="px-4 py-2 text-muted-foreground">Rask — kan kollapse</td>
                  <td className="px-4 py-2 text-muted-foreground">Stadig forbedring</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">Søkerom</td>
                  <td className="px-4 py-2 text-muted-foreground">Diskret eller blandet</td>
                  <td className="px-4 py-2 text-muted-foreground">Kontinuerlig</td>
                  <td className="px-4 py-2 text-muted-foreground">Graf/kombinatorisk</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">Klassisk bruk</td>
                  <td className="px-4 py-2 text-muted-foreground">Schedulering, design, TSP</td>
                  <td className="px-4 py-2 text-muted-foreground">Hyperparameter, NN-vekter</td>
                  <td className="px-4 py-2 text-muted-foreground">TSP, VRP, nettverk-ruting</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">Naturkilde</td>
                  <td className="px-4 py-2 text-muted-foreground">Darwinsk evolusjon</td>
                  <td className="px-4 py-2 text-muted-foreground">Fugleflokker/fiskestim</td>
                  <td className="px-4 py-2 text-muted-foreground">Maurkolonier</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="aco-vis" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">
            10. Interaktiv: ACO på TSP
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            8 byer i 2D. Tykke kanter = høyt feromon-nivå, tynne = lite. Send
            én maur for å se hvordan ruten bygges probabilistisk. Kjør 20
            iterasjoner: korte ruter forsterkes, lange fordamper bort.
          </p>
          <AcoTsp />
        </section>

        <section id="exam" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">11. Eksamen-typiske spørsmål</h2>
          <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
            <li>
              <strong className="text-foreground">«Forklar de fire grunn-operatorene i en GA.»</strong>{" "}
              Init, seleksjon, crossover, mutasjon. Eventuelt elitisme.
            </li>
            <li>
              <strong className="text-foreground">«Roulette wheel vs tournament — fordeler/ulemper?»</strong>{" "}
              Roulette: enkel, men sensitiv for fitness-skala. Tournament: robust,
              enkel å justere selection pressure.
            </li>
            <li>
              <strong className="text-foreground">«Hvorfor mutasjon i tillegg til crossover?»</strong>{" "}
              Crossover blander eksisterende gener. Mutasjon introduserer nye →
              hindrer prematur konvergens.
            </li>
            <li>
              <strong className="text-foreground">«ACO — hva er feromon-fordamping for?»</strong>{" "}
              Forhindrer at gamle dårlige ruter dominerer evig. Lar nye gode ruter
              ta over.
            </li>
            <li>
              <strong className="text-foreground">«Når foretrekker du GA over gradient descent?»</strong>{" "}
              Når søkerommet er diskret/kombinatorisk, fitness ikke-deriverbar,
              eller objektivfunksjonen har mange lokale minima.
            </li>
          </ul>
        </section>

        <div className="rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2 flex items-center gap-2">
            <Dna className="h-4 w-4 text-brand" />
            Neste steg
          </h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte2501-dp" }} className="text-brand hover:underline">
                Dynamic Programming og TSP
              </Link>{" "}
              — den eksakte (ikke heuristiske) tilnærmingen til TSP.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte2501-reinforcement" }} className="text-brand hover:underline">
                Reinforcement Learning
              </Link>{" "}
              — også en agent-i-miljø, men med belønning og tid.
            </li>
            <li>
              Python-øvelser: «GA fra scratch — finn maks av f(x)».
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
