import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ComprehensionDesugar,
  ListCompAnatomy,
  ListCompTrace,
  NestedCompOrder,
  DictCompShape,
  SetCompUnique,
  TupleCompTrick,
  TernaryVsFilter,
  GenExprLazy,
  WalrusInComp,
  LateBindingTrap,
} from "@/components/learn/python-figures/PythonFigures";
import { PY_COMPREHENSION_EXERCISES } from "@/lib/python/exercises-comprehensions";
import {
  BookOpen,
  Compass,
  ChevronLeft,
  Lightbulb,
  ArrowRight,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export const Route = createFileRoute("/python_/comprehensions")({
  head: () => ({
    meta: [
      { title: "Comprehensions — fra null til ekspert · Python kjerne" },
      {
        name: "description",
        content:
          "Dedikert kjerne-side for Python comprehensions: anatomi, trace, nested-rekkefølge, dict/set/tuple, lazy generators, walrus, late binding — med figurer for hvert mønster og lenker til 36 progressive øvinger.",
      },
    ],
  }),
  component: ComprehensionsKjernePage,
});

/* ----------------------------- Building blocks ----------------------------- */

function H2({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <h2
      id={id}
      className="mt-10 mb-2 text-xl font-semibold tracking-tight scroll-mt-24"
    >
      {children}
    </h2>
  );
}

function H3({ children }: { children: ReactNode }) {
  return (
    <h3 className="mt-6 mb-2 text-base font-semibold tracking-tight text-foreground/90">
      {children}
    </h3>
  );
}

function P({ children }: { children: ReactNode }) {
  return (
    <p className="my-2 text-sm leading-relaxed text-muted-foreground">
      {children}
    </p>
  );
}

function Code({ children }: { children: ReactNode }) {
  return (
    <pre className="my-3 rounded-md border border-border bg-card p-3 text-xs font-mono leading-relaxed overflow-x-auto">
      {children}
    </pre>
  );
}

function FigureCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="my-4 rounded-lg border border-border bg-card p-4">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
        {title}
      </div>
      {children}
    </div>
  );
}

/** Liten "predict the output"-quiz inline. Trykk "Vis svar" for å fasit. */
function PredictBox({
  prompt,
  code,
  answer,
  rationale,
}: {
  prompt: string;
  code: string;
  answer: string;
  rationale: ReactNode;
}) {
  const [revealed, setRevealed] = useState(false);
  return (
    <div className="my-4 rounded-lg border border-brand/30 bg-brand/5 p-3">
      <div className="flex items-center gap-2 mb-2">
        <Lightbulb className="h-3.5 w-3.5 text-brand" />
        <span className="text-[10px] uppercase tracking-wider text-brand font-semibold">
          Forutsi
        </span>
      </div>
      <div className="text-sm mb-2">{prompt}</div>
      <pre className="rounded-md border border-border bg-card p-2 text-xs font-mono leading-relaxed overflow-x-auto mb-2">
        {code}
      </pre>
      {revealed ? (
        <div className="mt-2 space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
            <span className="font-mono">{answer}</span>
          </div>
          <div className="text-xs text-muted-foreground leading-relaxed">{rationale}</div>
        </div>
      ) : (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setRevealed(true)}
          className="text-xs h-7"
        >
          Vis svar
        </Button>
      )}
    </div>
  );
}

/** Lenke til et sett relaterte øvinger i /python-sandkassen. */
function PracticeLinks({ ids }: { ids: string[] }) {
  const items = ids
    .map((id) => PY_COMPREHENSION_EXERCISES.find((e) => e.id === id))
    .filter(Boolean) as typeof PY_COMPREHENSION_EXERCISES;
  if (items.length === 0) return null;
  return (
    <div className="my-4 rounded-lg border border-success/40 bg-success/10 p-3">
      <div className="flex items-center gap-2 mb-2">
        <Compass className="h-3.5 w-3.5 text-success" />
        <span className="text-[10px] uppercase tracking-wider font-semibold text-success">
          Øv på dette nå
        </span>
      </div>
      <ul className="space-y-1.5">
        {items.map((ex) => (
          <li key={ex.id} className="flex items-start gap-2 text-sm">
            <ArrowRight className="h-3.5 w-3.5 mt-0.5 shrink-0 text-success" />
            <Link
              to="/python"
              hash={ex.id}
              className="text-foreground hover:text-brand underline-offset-2 hover:underline"
            >
              {ex.title}
              <span className="text-[10px] text-muted-foreground ml-1.5">
                ({ex.topic})
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Section({
  id,
  badge,
  title,
  intro,
  children,
}: {
  id: string;
  badge: string;
  title: string;
  intro: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="mb-8">
      <div className="flex items-baseline gap-2">
        <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
          {badge}
        </Badge>
      </div>
      <H2 id={id}>{title}</H2>
      <P>{intro}</P>
      <div>{children}</div>
    </section>
  );
}

/* ----------------------------- TOC sidebar ----------------------------- */

const TOC: { id: string; label: string }[] = [
  { id: "intro", label: "Hva er en comprehension?" },
  { id: "anatomi", label: "1. Anatomi" },
  { id: "trace", label: "2. Trace" },
  { id: "filter", label: "3. Filter med if" },
  { id: "ternary", label: "4. Ternary vs filter" },
  { id: "dict-set", label: "5. Dict & set" },
  { id: "tuple", label: "6. Tuple-trikset" },
  { id: "nested", label: "7. Nested" },
  { id: "lazy", label: "8. Lazy generators" },
  { id: "walrus", label: "9. Walrus" },
  { id: "late-binding", label: "10. Late binding" },
  { id: "veien-videre", label: "Veien videre" },
];

/* ----------------------------------- Page ---------------------------------- */

function ComprehensionsKjernePage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
          <Link to="/python" className="hover:text-foreground inline-flex items-center gap-1">
            <ChevronLeft className="h-3 w-3" />
            Python
          </Link>
          <span>/</span>
          <span className="text-foreground">Comprehensions — fra null til ekspert</span>
        </nav>

        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
            <BookOpen className="h-3.5 w-3.5" />
            Python kjerne
          </div>
          <h1 className="text-2xl font-bold tracking-tight mt-1">
            Comprehensions — fra null til ekspert
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Hver del har: figur som forklarer mønsteret, kort prosa, mini-quiz du
            kan forutsi, og lenker til øvingene som lar deg prøve selv.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link to="/python" hash="py-comp-01-square">
              <Button size="sm" className="text-xs h-8">
                Start kurset — øving #1
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
            <Link to="/python" hash="py-comp-30-vs-map-filter">
              <Button size="sm" variant="outline" className="text-xs h-8">
                Hopp til ekspert-nivå
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_220px] gap-8">
          <article className="min-w-0">
            {/* ===================== INTRO ===================== */}
            <Section
              id="intro"
              badge="Innledning"
              title="Hva er en comprehension?"
              intro="En comprehension er en kompakt skrivemåte for «lag en samling ved å iterere og samle». Den erstatter mønsteret for-loop + append/add/insert med ett uttrykk."
            >
              <P>
                I stedet for å bygge en liste skritt for skritt, sier du{" "}
                <em>hva</em> hvert element skal være og <em>hvor</em> det kommer fra.
                Python bygger ferdig listen for deg.
              </P>
              <FigureCard title="Sukker for for+append">
                <ComprehensionDesugar />
              </FigureCard>
              <P>
                Det finnes fire smaker:
              </P>
              <ul className="list-disc pl-5 my-2 text-sm space-y-1 text-muted-foreground">
                <li><strong>List:</strong> <code>[x for x in xs]</code> — bygger en liste.</li>
                <li><strong>Set:</strong> <code>{`{x for x in xs}`}</code> — bygger et set (duplikater fjernes).</li>
                <li><strong>Dict:</strong> <code>{`{k: v for ...}`}</code> — bygger en dict.</li>
                <li><strong>Generator:</strong> <code>(x for x in xs)</code> — bygger ingen ting; produserer lazy.</li>
              </ul>
              <P>
                Tuple har <em>ingen</em> egen comp-syntaks (vi kommer tilbake til hvorfor).
              </P>
            </Section>

            {/* ===================== ANATOMI ===================== */}
            <Section
              id="anatomi"
              badge="1 av 10"
              title="Anatomi: hvilken del gjør hva?"
              intro="En list-comp har tre faste deler. Du finner dem alltid i samme rekkefølge i koden, men de utføres i en annen rekkefølge."
            >
              <FigureCard title="Tre deler — uttrykk, for-del, filter">
                <ListCompAnatomy />
              </FigureCard>
              <P>
                Skriverekkefølgen er fast: <strong>uttrykk → for → if</strong>. Men
                Python kjører dem i den naturlige iterasjons-rekkefølgen: først
                hentes en x fra iterablen, så sjekkes filteret, så regnes uttrykket.
              </P>
              <PredictBox
                prompt="Hva blir resultatet?"
                code={`[w.upper() for w in "abc"]`}
                answer="['A', 'B', 'C']"
                rationale={
                  <>
                    Strenger er iterable — vi får ut tegn for tegn (<code>"a"</code>,{" "}
                    <code>"b"</code>, <code>"c"</code>). Uttrykket{" "}
                    <code>w.upper()</code> kjøres på hvert.
                  </>
                }
              />
              <PracticeLinks ids={["py-comp-01-square", "py-comp-02-double", "py-comp-03-lower"]} />
            </Section>

            {/* ===================== TRACE ===================== */}
            <Section
              id="trace"
              badge="2 av 10"
              title="Trace: hva har variablene på hvert steg?"
              intro="Den raskeste måten å lære comprehensions på er å se hver iterasjon utfolde seg."
            >
              <FigureCard title="Iterasjons-tabell for [x*x for x in [1,2,3,4]]">
                <ListCompTrace />
              </FigureCard>
              <P>
                Hver rad er én runde i den underliggende for-løkken. Etter siste rad
                returneres <code>result</code> — det er DET som ble bygd opp underveis.
              </P>
              <PredictBox
                prompt="Hva blir lengden av resultatet?"
                code={`tall = [10, 20, 30, 40, 50]\nlen([x // 10 for x in tall])`}
                answer="5"
                rationale={
                  <>
                    Ingen filter = ingen elementer dropper. Listen får like mange
                    elementer som <code>tall</code>.
                  </>
                }
              />
              <P>
                Tips: i <Link to="/python" className="text-brand underline">/python</Link>{" "}
                kan du klikke{" "}
                <em>Steg gjennom</em> på en hvilken som helst comp-øving — da kjører
                Pyodide linje for linje og viser <code>x</code> og{" "}
                <code>result</code> i variabel-panelet.
              </P>
              <PracticeLinks ids={["py-comp-04-pluck", "py-comp-05-c-to-f"]} />
            </Section>

            {/* ===================== FILTER ===================== */}
            <Section
              id="filter"
              badge="3 av 10"
              title="Filter med if — dropp elementer"
              intro="En `if` ETTER for-delen filtrerer bort elementer som ikke matcher. Det er det vanligste mønsteret etter rene transformasjoner."
            >
              <Code>{`[x for x in tall if x % 2 == 0]   # bare partall\n[w for w in ord if len(w) >= 5]    # bare lange ord\n[p for p in personer if p["alder"] >= 18]  # voksne`}</Code>
              <P>
                Du kan ha flere if-er på rad — de virker som <code>and</code>:
              </P>
              <Code>{`[x for x in tall if x > 5 if x % 2 == 0]\n# samme som: [x for x in tall if x > 5 and x % 2 == 0]`}</Code>
              <PredictBox
                prompt="Hva blir resultatet?"
                code={`[x*2 for x in range(6) if x % 3 == 0]`}
                answer="[0, 6]"
                rationale={
                  <>
                    <code>range(6)</code> = 0..5. Filteret slipper kun 0 og 3 gjennom
                    (de er delelige med 3). Hver multipliseres med 2.
                  </>
                }
              />
              <PracticeLinks ids={[
                "py-comp-06-even",
                "py-comp-07-long-strings",
                "py-comp-08-adults",
                "py-comp-09-square-evens",
                "py-comp-10-strip-none",
              ]} />
            </Section>

            {/* ===================== TERNARY ===================== */}
            <Section
              id="ternary"
              badge="4 av 10"
              title="Ternary vs filter — én tegn-forskjell, totalt forskjellig effekt"
              intro="Hvis if står FØR for-delen, er det et ternary-uttrykk som ERSTATTER. Hvis if står ETTER for-delen, er det et filter som DROPPER."
            >
              <FigureCard title="Plasseringen avgjør">
                <TernaryVsFilter />
              </FigureCard>
              <PredictBox
                prompt="Hva blir lengden?"
                code={`tall = [-2, -1, 0, 1, 2]\nlen([x if x > 0 else None for x in tall])`}
                answer="5"
                rationale={
                  <>
                    if står FØR for → ternary. Alle elementer beholdes; bare verdiene
                    endres. (Resultatet er <code>[None, None, None, 1, 2]</code>.)
                  </>
                }
              />
              <PracticeLinks ids={["py-comp-21-ternary"]} />
            </Section>

            {/* ===================== DICT & SET ===================== */}
            <Section
              id="dict-set"
              badge="5 av 10"
              title="Dict & set — krøllparenteser"
              intro="Bytt firkant til krøll og du får en dict eller set. Forskjellen mellom dem er ett tegn: kolon."
            >
              <FigureCard title="Dict-comp: nøkkel og verdi">
                <DictCompShape />
              </FigureCard>
              <FigureCard title="Set-comp: duplikater forsvinner">
                <SetCompUnique />
              </FigureCard>
              <P>
                Begge støtter filter på samme måte som list-comp:
              </P>
              <Code>{`{w: len(w) for w in words if len(w) > 3}    # dict med filter\n{w[0] for w in words}                       # unike første-bokstaver`}</Code>
              <PredictBox
                prompt="Hva blir resultatet?"
                code={`{c for c in "Mississippi"}`}
                answer="{'M', 'i', 's', 'p'}"
                rationale={
                  <>
                    Set fjerner duplikater. Strengen har 11 tegn, men bare 4 unike
                    (M, i, s, p). Rekkefølge i set er ikke garantert.
                  </>
                }
              />
              <PracticeLinks ids={[
                "py-comp-11-dict-name-age",
                "py-comp-12-enumerate",
                "py-comp-13-invert",
                "py-comp-14-set-first",
                "py-comp-15-set-intersection-with-filter",
                "py-comp-33-set-letters",
                "py-comp-34-set-word-lengths",
                "py-comp-35-dict-squares",
                "py-comp-36-dict-long-words",
              ]} />
            </Section>

            {/* ===================== TUPLE ===================== */}
            <Section
              id="tuple"
              badge="6 av 10"
              title="Tuple-trikset — det finnes ingen tuple-comp"
              intro="Runde parenteser rundt en comp lager en generator, ikke en tuple. Klassisk fallgruve — så klassisk at vi har en egen figur for den."
            >
              <FigureCard title="(x for x in xs) lyver">
                <TupleCompTrick />
              </FigureCard>
              <Code>{`t = tuple(x * x for x in range(6))   # → (0, 1, 4, 9, 16, 25)\nl = list (x * x for x in range(6))   # → [0, 1, 4, 9, 16, 25]\ns = set  (x % 3 for x in range(6))   # → {0, 1, 2}`}</Code>
              <PredictBox
                prompt="Hva er type(t)?"
                code={`t = (i + 1 for i in range(3))\ntype(t).__name__`}
                answer="'generator'"
                rationale={
                  <>
                    Ingen <code>tuple(...)</code> rundt — derfor får vi en generator.
                    For en tuple: <code>tuple(i + 1 for i in range(3))</code>.
                  </>
                }
              />
              <PracticeLinks ids={["py-comp-31-tuple-squares", "py-comp-32-tuple-pairs"]} />
            </Section>

            {/* ===================== NESTED ===================== */}
            <Section
              id="nested"
              badge="7 av 10"
              title="Nested — flere for-deler"
              intro="Du kan stable for-deler. Ytterste står FØRST, innerste SIST — samme rekkefølge som om du brettet ut til to vanlige løkker."
            >
              <FigureCard title="Iterasjons-rekkefølge i nested">
                <NestedCompOrder />
              </FigureCard>
              <Code>{`# Flatten 2D → 1D\n[x for rad in matrise for x in rad]\n\n# Kartesisk produkt\n[(f, s) for f in farger for s in storrelser]\n\n# Transponer\n[[m[i][j] for i in range(n)] for j in range(n)]`}</Code>
              <PredictBox
                prompt="Hvor mange elementer blir det?"
                code={`len([(a, b) for a in range(3) for b in range(4)])`}
                answer="12"
                rationale={
                  <>
                    3 × 4 = 12. Innerste loop kjører fullt ut for hver verdi ytterste
                    får.
                  </>
                }
              />
              <PracticeLinks ids={[
                "py-comp-16-flatten",
                "py-comp-17-cartesian",
                "py-comp-18-multi-if",
                "py-comp-19-transpose",
                "py-comp-20-multiplikasjon",
              ]} />
            </Section>

            {/* ===================== LAZY ===================== */}
            <Section
              id="lazy"
              badge="8 av 10"
              title="Lazy generators — bytt firkant med rund"
              intro="En gen-expr beregner ingenting før noen ber. Den bygger ikke en samling — bare en oppskrift på neste verdi."
            >
              <FigureCard title="Minne: list vs gen">
                <GenExprLazy />
              </FigureCard>
              <P>
                Mest brukt: rett inn i funksjoner som godtar iterables. Da slipper
                du parenteser:
              </P>
              <Code>{`sum(x * x for x in range(1_000_000))      # ingen liste — bare summer\nany(p.alder >= 18 for p in personer)      # stopper ved første treff\nmax(len(w) for w in words)                # lazy "running max"\nnext(x for x in tall if x > 999 and x % 17 == 0)  # første treff`}</Code>
              <PredictBox
                prompt="Hva skjer her?"
                code={`g = (1/x for x in [1, 2, 0, 3])\nnext(g)\nnext(g)`}
                answer="1.0  så  0.5  (ingen feil enda)"
                rationale={
                  <>
                    Gen-expr-en kjøres ikke fra start til slutt — bare når{" "}
                    <code>next</code> kalles. Vi har bare bedt om 2 verdier, så vi
                    har ikke kommet til <code>1/0</code> enda. Et tredje{" "}
                    <code>next(g)</code> ville krasjet med <code>ZeroDivisionError</code>.
                  </>
                }
              />
              <PracticeLinks ids={["py-comp-26-genexpr-memory", "py-comp-27-next-lazy"]} />
            </Section>

            {/* ===================== WALRUS ===================== */}
            <Section
              id="walrus"
              badge="9 av 10"
              title="Walrus — regn én gang, bruk to steder"
              intro="Når en dyr beregning brukes både i filter OG uttrykk, lar walrus :=-operatoren deg navngi resultatet midt i et uttrykk."
            >
              <FigureCard title="Slik fjerner walrus dobbeltarbeid">
                <WalrusInComp />
              </FigureCard>
              <P>
                Mønsteret er nesten alltid det samme:{" "}
                <code>... for x in xs if (s := dyrt(x)) &gt; terskel</code>. Variabelen{" "}
                <code>s</code> kan så brukes i uttrykket på venstre side.
              </P>
              <PredictBox
                prompt="Hva er på t etter dette?"
                code={`t = [(x, n) for x in ["abc", "ab", "abcd"] if (n := len(x)) > 2]`}
                answer="[('abc', 3), ('abcd', 4)]"
                rationale={
                  <>
                    <code>len(x)</code> regnes én gang per <code>x</code>, lagres i{" "}
                    <code>n</code>, og brukes både i filteret og som verdi i tuple-en.
                  </>
                }
              />
              <PracticeLinks ids={["py-comp-28-walrus"]} />
            </Section>

            {/* ===================== LATE BINDING ===================== */}
            <Section
              id="late-binding"
              badge="10 av 10"
              title="Late binding-fellen"
              intro="En klassisk gotcha: lambdas i en comprehension fanger VARIABELEN, ikke verdien. Når du senere kaller dem, ser alle på den siste verdien variabelen fikk."
            >
              <FigureCard title="5 lambdas, 1 variabel">
                <LateBindingTrap />
              </FigureCard>
              <PredictBox
                prompt="Hva skriver dette?"
                code={`fs = [lambda: i for i in range(3)]\nprint([f() for f in fs])`}
                answer="[2, 2, 2]"
                rationale={
                  <>
                    Lambdas binder seg til <em>navnet</em> <code>i</code>, ikke til
                    verdien <code>i</code> hadde da lambda-en ble lagd. Etter løkken
                    er <code>i == 2</code>, så alle returnerer 2.
                  </>
                }
              />
              <P>Fixet:</P>
              <Code>{`fs = [lambda i=i: i for i in range(3)]\nprint([f() for f in fs])    # [0, 1, 2]`}</Code>
              <P>
                Default-argumenter evalueres ved <em>definisjonstid</em>. Det betyr at{" "}
                <code>i</code> bindes til den verdien den har akkurat NÅ — ikke til
                navnet.
              </P>
              <PracticeLinks ids={["py-comp-29-late-binding", "py-comp-30-vs-map-filter"]} />
            </Section>

            {/* ===================== VEIEN VIDERE ===================== */}
            <Section
              id="veien-videre"
              badge="Sluttspurt"
              title="Veien videre"
              intro="Du har sett alle ti mønstrene. Den eneste måten å bli ekspert på er å skrive dem til de sitter i fingrene."
            >
              <div className="grid sm:grid-cols-2 gap-3 my-4">
                <Link
                  to="/python"
                  hash="py-comp-01-square"
                  className="rounded-lg border border-border bg-card p-4 hover:border-brand/60 transition-colors"
                >
                  <div className="text-[10px] uppercase tracking-wider text-brand font-semibold">
                    Begynn med #1
                  </div>
                  <div className="font-semibold mt-1">36 progressive øvinger</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Fra «skriv om denne for-løkken» til «predikt hva late binding gjør». Hver øving sjekker svaret med assert + print("OK").
                  </p>
                </Link>
                <Link
                  to="/python/kjerne"
                  className="rounded-lg border border-border bg-card p-4 hover:border-brand/60 transition-colors"
                >
                  <div className="text-[10px] uppercase tracking-wider text-brand font-semibold">
                    Resten av Python-kjernen
                  </div>
                  <div className="font-semibold mt-1">Kjerne-cheatsheet</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Comprehensions er én av mange mentale modeller. Se også scope, kall-rammer, slicing, type-systemet.
                  </p>
                </Link>
              </div>
              <div className="my-4 rounded-lg border border-warning/40 bg-warning/10 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <XCircle className="h-3.5 w-3.5 text-warning" />
                  <span className="text-[10px] uppercase tracking-wider text-warning font-semibold">
                    Når du IKKE bør bruke comprehension
                  </span>
                </div>
                <ul className="text-xs text-muted-foreground space-y-1 leading-relaxed">
                  <li>• Når logikken trenger flere setninger (try/except, hjelpevariabler) — skriv en vanlig for-løkke.</li>
                  <li>• Når comprehensionen blir lengre enn ~80 tegn — bryt opp.</li>
                  <li>• Når du har sideeffekter (print, write) — comp er for å BYGGE noe, ikke for å gjøre ting.</li>
                  <li>• Når en innebygd funksjon er klarere: <code>list(range(10))</code> &gt; <code>[i for i in range(10)]</code>.</li>
                </ul>
              </div>
            </Section>
          </article>

          {/* TOC sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-20">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                På denne siden
              </div>
              <nav className="space-y-1">
                {TOC.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="block text-xs text-muted-foreground hover:text-foreground py-1 px-2 rounded hover:bg-accent/40 transition-colors"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
