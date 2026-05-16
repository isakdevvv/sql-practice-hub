import { Link } from "@tanstack/react-router";
import { ArrowRight, Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";

const STEPS = [
  { title: "Hva et CSP er", anchor: "intro" },
  { title: "Eksempel — kartfarging", anchor: "map" },
  { title: "Backtracking-søk", anchor: "backtracking" },
  { title: "Forward checking", anchor: "forward" },
  { title: "AC-3 — arc consistency", anchor: "ac3" },
  { title: "Variabel- og verdi-heuristikker", anchor: "heuristikk" },
  { title: "Når lønner det seg?", anchor: "lonner" },
];

export function CspPage() {
  return (
    <StackPageShell title="Constraint Satisfaction Problems" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2501 · CSP
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Constraint Satisfaction Problems
          </h1>
          <p className="mt-3 text-muted-foreground">
            Et CSP er et søk der tilstanden er en delvis tildeling av variabler, og
            målet er en fullstendig tildeling som respekterer alle begrensningene.
            Strukturen — variabler, domener, begrensninger — gjør at vi kan bruke
            mye smartere algoritmer enn generelt søk.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Klassiske CSP-eksempler:</span> Sudoku,
              kartfarging, n-queens, kryssord, timeplanlegging.
            </div>
          </div>
        </div>

        <CourseOutline courseId="csp" steps={STEPS} />

        <section id="intro" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Hva et CSP er</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Et CSP består av tre ting:

  X = {X1, X2, ..., Xn}             ← variabler
  D = {D1, D2, ..., Dn}             ← domene for hver variabel
  C = {C1, C2, ..., Cm}             ← begrensninger (constraints)

  Hver Ci er et par (scope, rel):
    scope = variablene Ci angår
    rel   = tillatte verdikombinasjoner

  Løsning = tildeling X1=v1, ..., Xn=vn slik at
            alle begrensningene er oppfylt.`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Hvorfor «søk med struktur»?</strong> Et generelt søkeproblem
            behandler hver tilstand som en svart boks. I et CSP vet vi at en tilstand
            er en samling variabler — så vi kan resonnere lokalt på en variabel av
            gangen.
          </p>
        </section>

        <section id="map" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Eksempel — kartfarging</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Klassikeren: fargelegg Australia-kartet slik at to naboregioner ikke får
            samme farge.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`X = {WA, NT, SA, Q, NSW, V, T}
D = for hver: {rød, grønn, blå}
C = {WA != NT,  WA != SA,  NT != SA,  NT != Q,
     SA != Q,   SA != NSW, SA != V,   Q  != NSW,
     NSW != V}

Hver begrensning er BINÆR (involverer to variabler).
Vi kan tegne det som en constraint graph: noder
= variabler, kanter = begrensninger.`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>SA-trikset:</strong> SA er nabo med fem andre. Hvis du tildeler SA
            først, smelter resten til seg selv. Det er nettopp MRV-heuristikken vi
            kommer til.
          </p>
        </section>

        <section id="backtracking" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Backtracking-søk</h2>
          <p className="text-sm text-muted-foreground mb-4">
            DFS spesialisert til CSP: prøv en verdi, sjekk om den bryter en
            begrensning, eller fortsett — og rygg om vi går i tomvegg.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`function BACKTRACK(assignment, csp):
  if assignment is complete: return assignment
  var <- SELECT-UNASSIGNED-VARIABLE(csp)
  for value in ORDER-DOMAIN-VALUES(var, csp):
    if value is consistent with assignment:
      assignment[var] = value
      inferences <- INFERENCE(csp, var, value)   # f.eks. forward checking
      if inferences != failure:
        result <- BACKTRACK(assignment, csp)
        if result != failure: return result
      remove value from assignment, undo inferences
  return failure`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Naivt backtracking-søk er O(d^n) i verste fall (d = domenestørrelse, n =
            antall variabler). Det er heuristikkene og inference-stegene som gjør
            det praktisk anvendelig.
          </p>
        </section>

        <section id="forward" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Forward checking</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Når du tildeler X = v, fjern v fra domenet til alle nabovariabler. Hvis
            et domene blir tomt — backtrack umiddelbart i stedet for å oppdage det
            mye senere.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Eksempel — kartfarging, etter WA = rød:

  Domener før:                Domener etter forward check:
  WA  = {rød, grønn, blå}     WA  = {rød}
  NT  = {rød, grønn, blå}     NT  = {grønn, blå}      ← rød fjernet
  SA  = {rød, grønn, blå}     SA  = {grønn, blå}      ← rød fjernet
  Q   = {rød, grønn, blå}     Q   = {rød, grønn, blå}
  ...

Hvis vi nå tildeler NT = grønn:
  SA  = {grønn, blå}  -> {blå}   (grønn fjernet)
  Q   = {rød, grønn, blå} -> {rød, blå}`}</pre>
          </div>
        </section>

        <section id="ac3" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. AC-3 — arc consistency</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Forward checking ser bare ett steg fram. AC-3 propagerer mye lenger: en
            «arc» (Xi → Xj) er konsistent hvis det for hver verdi i Di finnes minst
            én verdi i Dj som er kompatibel.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`function AC-3(csp):
  queue <- alle arcs (Xi, Xj) i CSP-en
  while queue not empty:
    (Xi, Xj) <- queue.pop()
    if REVISE(csp, Xi, Xj):              # fjernet verdier fra Di?
      if Di == {}: return failure
      for each Xk in NEIGHBORS(Xi) - {Xj}:
        queue.add((Xk, Xi))              # re-test naboene
  return success

function REVISE(csp, Xi, Xj):
  revised <- false
  for each x in Di:
    if no value y in Dj satisfies constraint(Xi, Xj):
      remove x from Di
      revised <- true
  return revised`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Kompleksitet:</strong> O(cd³) der c = antall arcs og d =
            maksimalt domene. Mye billigere enn å kjøre selve søket på et fullt CSP.
            Vanlig å kjøre AC-3 EN gang som preprocessing før backtracking, og
            forward checking under selve søket.
          </p>
        </section>

        <section id="heuristikk" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Variabel- og verdi-heuristikker</h2>
          <p className="text-sm text-muted-foreground mb-4">
            To valg å gjøre per nivå i backtracking: hvilken variabel å tildele
            neste, og i hvilken rekkefølge å prøve verdiene.
          </p>

          <div className="space-y-3">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                MRV — Minimum Remaining Values
              </div>
              <p className="text-sm text-foreground mb-2">
                Velg variabelen med <strong>minst igjen i domenet</strong>. «Fail
                first» — hvis vi skal feile, la oss feile billig.
              </p>
              <p className="text-xs text-muted-foreground">
                Eksempel: etter WA=rød, NT=grønn, har SA bare {`{blå}`} igjen — det er
                soleklart neste valg.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Degree heuristic
              </div>
              <p className="text-sm text-foreground mb-2">
                Tiebreaker for MRV: velg variabelen som er involvert i <strong>flest
                begrensninger</strong> mot uassignede variabler.
              </p>
              <p className="text-xs text-muted-foreground">
                Eksempel: helt i starten har alle domene-størrelse 3. Velg SA — den
                har grad 5 i constraint graph-en.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                LCV — Least Constraining Value
              </div>
              <p className="text-sm text-foreground mb-2">
                Når du har valgt variabel, velg <strong>verdien som fjerner færrest
                muligheter</strong> i naboenes domener.
              </p>
              <p className="text-xs text-muted-foreground">
                MRV «fail first» på variabel; LCV «succeed first» på verdi. Logikken
                er asymmetrisk: vi vil bare ÉN løsning, så vi vil prøve den mest
                lovende verdien først.
              </p>
            </div>
          </div>
        </section>

        <section id="lonner" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Når lønner det seg?</h2>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2">Teknikk</th>
                  <th className="text-left font-semibold px-4 py-2">Kost</th>
                  <th className="text-left font-semibold px-4 py-2">Når</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border"><td className="px-4 py-3">Naivt backtracking</td><td className="px-4 py-3">O(d^n)</td><td className="px-4 py-3">Bare for små CSP-er</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3">+ MRV / LCV</td><td className="px-4 py-3">Gratis å legge til</td><td className="px-4 py-3">Alltid på</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3">+ Forward checking</td><td className="px-4 py-3">O(d) per tildeling</td><td className="px-4 py-3">Standardvalg</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3">+ AC-3 preprocessing</td><td className="px-4 py-3">O(cd³)</td><td className="px-4 py-3">Stort domene, tett constraint graph</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3">+ AC-3 etter hver tildeling</td><td className="px-4 py-3">Dyrere, men kraftigere</td><td className="px-4 py-3">Når feil-noder er svært dyre</td></tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Eksamenstrap:</strong> «Hvorfor backtrack-søk og ikke A* på et
            CSP?» — fordi en partial assignment ikke har en naturlig kost, og målet
            er BARE konsistens (ikke optimalitet). CSP-er løses raskere med
            constraint propagation enn med heuristisk graf-søk.
          </p>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/drag" className="text-brand hover:underline">Drag-oppgaver</Link>{" "}
              under «CSP»: AC-3-trace, MRV/LCV-match, backtracking-rekkefølge.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "logisk-resonnering" }} className="text-brand hover:underline">
                Logisk resonnering
              </Link>{" "}
              — det andre store paradigmet for å representere kunnskap.
              <ArrowRight className="inline h-3.5 w-3.5 ml-1" />
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
