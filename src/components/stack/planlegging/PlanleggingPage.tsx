import { Link } from "@tanstack/react-router";
import { ArrowRight, Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";

const STEPS = [
  { title: "Hva planlegging er", anchor: "intro" },
  { title: "STRIPS-representasjon", anchor: "strips" },
  { title: "Eksempel — blokker-verden", anchor: "blokker" },
  { title: "Forward (progression) planning", anchor: "forward" },
  { title: "Backward (regression) planning", anchor: "backward" },
  { title: "Forward vs backward — når hva", anchor: "valg" },
];

export function PlanleggingPage() {
  return (
    <StackPageShell title="Planlegging" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2501 · Planlegging
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Planlegging — å bygge sekvenser av handlinger
          </h1>
          <p className="mt-3 text-muted-foreground">
            Planlegging kan sees som et søkeproblem, men i stedet for å behandle
            tilstander som ugjennomsiktige bokser, beskriver vi dem med logiske
            predikater. Det lar planleggeren resonnere om hvilke handlinger som er
            relevante.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Klassisk eksempel:</span> robot som
              stabler klosser, eller en bilgods-leveringsplan.
            </div>
          </div>
        </div>

        <CourseOutline courseId="planlegging" steps={STEPS} />

        <section id="intro" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Hva planlegging er</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Et planleggingsproblem:

  Tilstand        — en mengde sanne predikater
  Starttilstand   — konkrete predikater som er sanne nå
  Måltilstand     — predikater som MÅ være sanne på slutten
  Handlinger      — endrer tilstanden (precond -> effekter)

  Plan = sekvens av handlinger som tar oss
         fra start til mål.`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Forskjell fra rent søk:</strong> i et tilstandsrom-søk er en
            tilstand en svart boks. I planlegging er en tilstand en SAMLING fakta —
            så vi kan se rett inn i den og resonnere om hva som mangler for å nå
            målet.
          </p>
        </section>

        <section id="strips" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. STRIPS-representasjon</h2>
          <p className="text-sm text-muted-foreground mb-4">
            STRIPS = Stanford Research Institute Problem Solver (1971). Hver
            handling har tre lister:
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Action: Fly(p, from, to)
  Precondition:  At(p, from) ∧ Plane(p) ∧ Airport(from) ∧ Airport(to)
  Add list:      At(p, to)
  Delete list:   At(p, from)

Tolkning:
  - Preconditions må være sanne FØR handlingen kan kjøres
  - Add list   = predikater som blir sanne ETTER
  - Delete list = predikater som blir usanne ETTER

Effect-notasjon (kort):
  Effect: At(p, to) ∧ ¬At(p, from)

  Positive literals = add
  Negative literals = delete`}</pre>
          </div>
        </section>

        <section id="blokker" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Eksempel — blokker-verden</h2>
          <p className="text-sm text-muted-foreground mb-4">
            En robotarm flytter klosser mellom et bord og toppen av andre klosser.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Predikater:
  On(x, y)         — kloss x ligger på y
  Clear(x)         — ingenting oppå x
  OnTable(x)       — kloss x ligger på bordet

Handling:  Move(x, from, to)
  Pre:    On(x, from) ∧ Clear(x) ∧ Clear(to)
  Effect: On(x, to) ∧ Clear(from) ∧ ¬On(x, from) ∧ ¬Clear(to)

Start:                   Mål:
   C                       A
   A                       B
   B  bord                 C  bord
   ───                     ───
On(C,A), On(A,B),       On(A,B), On(B,C),
OnTable(B), Clear(C)    OnTable(C), Clear(A)

Plan: Move(C, A, Bord),
      Move(A, B, C-er ikke clear ennå -> umulig direkte)
      Et reelt plan trenger å rydde C først, så B osv.`}</pre>
          </div>
        </section>

        <section id="forward" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Forward (progression) planning</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Søk framover fra starttilstanden. For hver tilstand, prøv alle
            handlinger som har sine preconditions oppfylt; bruk effektene til å
            generere neste tilstand.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`function FORWARD-PLAN(start, goal, actions):
  frontier <- {start}
  while frontier not empty:
    state <- frontier.pop()
    if goal subset of state: return path(state)
    for a in actions:
      if precond(a) subset of state:
        next <- (state - delete(a)) ∪ add(a)
        if not visited(next): frontier.add(next)
  return failure`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Problemet:</strong> mange handlinger har preconditions oppfylt i
            de fleste tilstander — branching factor blir enorm. Effektivt med gode
            heuristikker (f.eks. relaksert plan: ignorer delete-listene).
          </p>
        </section>

        <section id="backward" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Backward (regression) planning</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Søk bakover fra målet. For hvert delmål, finn en handling som har det
            som add-effekt — og «regressér» målet: erstatt det med handlingens
            preconditions.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`function BACKWARD-PLAN(start, goal, actions):
  frontier <- {goal}
  while frontier not empty:
    g <- frontier.pop()
    if g subset of start: return path
    for a in actions:
      if a is "relevant" (add(a) ∩ g != {} og delete(a) ∩ g = {}):
        g' <- (g - add(a)) ∪ precond(a)
        frontier.add(g')
  return failure

«Relevant» betyr:
  - handlingen oppfyller minst ett mål (add overlapper g)
  - handlingen ødelegger ikke andre mål (delete er disjoint fra g)`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Hvorfor bakover er billigere ofte:</strong> bare et lite knippe
            handlinger er relevante for et gitt mål — branching factor blir mindre
            enn forward-søkets.
          </p>
        </section>

        <section id="valg" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Forward vs backward — når hva</h2>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2">Egenskap</th>
                  <th className="text-left font-semibold px-4 py-2">Forward</th>
                  <th className="text-left font-semibold px-4 py-2">Backward</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border"><td className="px-4 py-3">Søker fra</td><td className="px-4 py-3">Start</td><td className="px-4 py-3">Mål</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3">Tilstander</td><td className="px-4 py-3">Konkrete (alt definert)</td><td className="px-4 py-3">Partielle (kun mål-literals)</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3">Branching</td><td className="px-4 py-3">Stor — mange handlinger anvendelige</td><td className="px-4 py-3">Mindre — bare relevante handlinger</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3">Heuristikker</td><td className="px-4 py-3">Lett (mange muligheter)</td><td className="px-4 py-3">Vanskeligere</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3">Praksis</td><td className="px-4 py-3">Moderne planleggere (FF, FastDownward)</td><td className="px-4 py-3">Historisk, fortsatt nyttig konseptuelt</td></tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Eksamenstrap:</strong> «Hvilken handling er <em>relevant</em>?»
            Sjekk at den a) oppfyller minst ett mål-literal, og b) ikke har en
            negativ effekt som ødelegger et annet mål. Mange mister punkt b).
          </p>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/drag" className="text-brand hover:underline">Drag-oppgaver</Link>{" "}
              under «Planlegging»: STRIPS preconditions/effects-match, forward vs
              backward.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "bayes" }} className="text-brand hover:underline">
                Bayes og usikkerhet
              </Link>{" "}
              — hva gjør vi når verden ikke er observerbar?
              <ArrowRight className="inline h-3.5 w-3.5 ml-1" />
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
