import { Link } from "@tanstack/react-router";
import {Lightbulb, ArrowLeft } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { Tex, TexBlock } from "@/components/Tex";

const STEPS = [
  { title: "Stokastiske variabler — diskret vs. kontinuerlig", anchor: "sv" },
  { title: "Forventning E[X] og varians Var(X)", anchor: "ev" },
  { title: "Diskrete fordelinger", anchor: "diskret" },
  { title: "Kontinuerlige fordelinger", anchor: "kontinuerlig" },
  { title: "Normalfordelingen — standardisering", anchor: "normal" },
  { title: "Sentralgrenseteoremet (CLT)", anchor: "clt" },
  { title: "Fordelings-velgeren", anchor: "velger" },
  { title: "Eksamen-feller", anchor: "feller" },
];

export function Tek1FordelingerPage() {
  return (
    <StackPageShell
      title="Modul 3 — Sannsynlighetsfordelinger"
      group="eksamen"
    >
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            TEK-1501 · Modul 3 av 4 · Eksamen-tyngdepunkt
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Fordelinger — generelle modeller for tilfeldighet
          </h1>
          <p className="mt-3 text-muted-foreground">
            En sannsynlighetsfordeling er en oppskrift som forteller hvor
            sannsynlige ulike verdier er. I stedet for å regne fra grunnen av
            for hver oppgave, lærer vi gjenkjennelige mønstre (binomisk,
            Poisson, normal, …) og setter inn parameterne. Halve eksamen-
            uka går med på å velge RIKTIG fordeling.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <Link to="/drag" className="text-brand hover:underline">
                drag-oppgavene
              </Link>{" "}
              under «Sannsynlighetsfordelinger» — fordelings-match,
              parameter-fill, og CLT-quizzer. Verifisér med{" "}
              <code className="text-xs">scipy.stats</code> i{" "}
              <Link to="/python" className="text-brand hover:underline">Python</Link>.
            </div>
          </div>
        </div>

        <CourseOutline courseId="tek1-fordelinger" steps={STEPS} />

        <section id="sv" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Stokastiske variabler</h2>
          <p className="text-sm text-muted-foreground mb-4">
            En stokastisk variabel (random variable) X er en funksjon som
            tilordner et tall til hvert utfall i Ω. Eks: kast to terninger →
            X = summen. To grunntyper:
          </p>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm">
            <div className="font-semibold">Diskret <Tex>{"X"}</Tex>:</div>
            <p className="text-xs text-muted-foreground">Tar tellbart antall verdier (heltall, kategorier). Beskrives med PMF (Probability Mass Function): <Tex>{"p(x) = P(X = x)"}</Tex>.</p>
            <TexBlock>{"\\sum_x p(x) = 1, \\quad p(x) \\geq 0"}</TexBlock>
            <div className="text-xs text-muted-foreground">CDF:</div>
            <TexBlock>{"F(x) = P(X \\leq x) = \\sum_{x_i \\leq x} p(x_i)"}</TexBlock>
            <p className="text-xs text-muted-foreground">Eks: antall feil i 10 enheter (0..10), terningkast (1..6).</p>

            <div className="font-semibold pt-3">Kontinuerlig <Tex>{"X"}</Tex>:</div>
            <p className="text-xs text-muted-foreground">Tar verdier i et intervall (reelle tall). Beskrives med PDF (Probability Density Function): <Tex>{"f(x)"}</Tex> (en TETTHETSFUNKSJON, ikke sannsynlighet!).</p>
            <TexBlock>{"\\int_{-\\infty}^{\\infty} f(x)\\, dx = 1, \\quad f(x) \\geq 0"}</TexBlock>
            <TexBlock>{"P(a \\leq X \\leq b) = \\int_a^b f(x)\\, dx \\quad \\text{(areal under kurven)}"}</TexBlock>
            <p className="text-xs text-muted-foreground"><Tex>{"P(X = a) = 0"}</Tex> alltid — punkt har sannsynlighet 0 i kontinuerlig.</p>
            <div className="text-xs text-muted-foreground">CDF:</div>
            <TexBlock>{"F(x) = P(X \\leq x) = \\int_{-\\infty}^{x} f(t)\\, dt"}</TexBlock>
            <p className="text-xs text-muted-foreground">Eks: tid mellom kundeankomster, måling av lengde.</p>
          </div>
        </section>

        <section id="ev" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Forventning og varians</h2>
          <p className="text-sm text-muted-foreground mb-4">
            To tall som karakteriserer en fordeling: hvor ligger den i snitt
            (forventning) og hvor mye varierer den (varians).
          </p>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm">
            <div className="font-semibold">Forventning <Tex>{"E[X]"}</Tex> (<Tex>{"= \\mu"}</Tex>):</div>
            <TexBlock>{"E[X] = \\sum_x x \\cdot p(x) \\quad \\text{(diskret)}"}</TexBlock>
            <TexBlock>{"E[X] = \\int_{-\\infty}^{\\infty} x \\cdot f(x)\\, dx \\quad \\text{(kontinuerlig)}"}</TexBlock>
            <p className="text-xs text-muted-foreground">Linearitet:</p>
            <TexBlock>{"E[aX + b] = a\\,E[X] + b, \\qquad E[X + Y] = E[X] + E[Y]"}</TexBlock>

            <div className="font-semibold pt-3">Varians <Tex>{"\\mathrm{Var}(X)"}</Tex> (<Tex>{"= \\sigma^2"}</Tex>):</div>
            <TexBlock>{"\\mathrm{Var}(X) = E[(X - \\mu)^2] = E[X^2] - (E[X])^2"}</TexBlock>
            <p className="text-xs text-muted-foreground">Standardavvik:</p>
            <TexBlock>{"\\sigma = \\sqrt{\\mathrm{Var}(X)}"}</TexBlock>
            <p className="text-xs text-muted-foreground">Skalering:</p>
            <TexBlock>{"\\mathrm{Var}(aX + b) = a^2\\,\\mathrm{Var}(X)"}</TexBlock>
            <TexBlock>{"\\mathrm{Var}(X + Y) = \\mathrm{Var}(X) + \\mathrm{Var}(Y) \\quad \\text{hvis } X \\perp Y"}</TexBlock>
          </div>
          <div className="mt-4 rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Eksempel — én terning
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              <Tex>{"X"}</Tex> = utfallet av en rettferdig terning. <Tex>{"P(X = k) = 1/6"}</Tex> for <Tex>{"k = 1, \\ldots, 6"}</Tex>.
            </p>
            <TexBlock>{"E[X] = \\frac{1+2+3+4+5+6}{6} = \\frac{21}{6} = 3.5"}</TexBlock>
            <TexBlock>{"E[X^2] = \\frac{1+4+9+16+25+36}{6} = \\frac{91}{6} \\approx 15.17"}</TexBlock>
            <TexBlock>{"\\mathrm{Var}(X) = E[X^2] - (E[X])^2 = \\frac{91}{6} - \\left(\\frac{7}{2}\\right)^2 = \\frac{35}{12} \\approx 2.92"}</TexBlock>
            <TexBlock>{"\\sigma = \\sqrt{2.92} \\approx 1.71"}</TexBlock>
          </div>
        </section>

        <section id="diskret" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Diskrete fordelinger</h2>

          <div className="rounded-xl border border-border bg-card p-5 mb-4 space-y-2 text-sm">
            <h3 className="font-semibold text-sm">Bernoulli (n=1)</h3>
            <p className="text-xs text-muted-foreground">
              Ett forsøk med to utfall: suksess (<Tex>{"p"}</Tex>) eller fiasko (<Tex>{"1-p"}</Tex>). <Tex>{"X = 1"}</Tex> hvis suksess, <Tex>{"0"}</Tex> ellers.
            </p>
            <TexBlock>{"P(X = 1) = p, \\quad P(X = 0) = 1 - p"}</TexBlock>
            <TexBlock>{"E[X] = p, \\quad \\mathrm{Var}(X) = p(1-p)"}</TexBlock>
            <p className="text-xs text-muted-foreground">Eks: kaster én mynt (<Tex>{"p = 0.5"}</Tex>), tester én enhet (<Tex>{"p = 0.05"}</Tex> defekt).</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 mb-4 space-y-2 text-sm">
            <h3 className="font-semibold text-sm">Binomisk <Tex>{"B(n, p)"}</Tex></h3>
            <p className="text-xs text-muted-foreground">Sum av <Tex>{"n"}</Tex> uavhengige Bernoulli — antall suksesser i <Tex>{"n"}</Tex> forsøk.</p>
            <TexBlock>{"P(X = k) = \\binom{n}{k} p^k (1-p)^{n-k}, \\quad k = 0, 1, \\ldots, n"}</TexBlock>
            <TexBlock>{"E[X] = np, \\quad \\mathrm{Var}(X) = np(1-p)"}</TexBlock>
            <ul className="text-xs text-muted-foreground list-disc pl-5">
              <li>Fast antall forsøk <Tex>{"n"}</Tex></li>
              <li>Hvert forsøk har samme <Tex>{"p"}</Tex>, uavhengige</li>
              <li>Bare to mulige utfall pr. forsøk</li>
            </ul>
            <p className="text-xs text-muted-foreground"><strong>Eks:</strong> 10 enheter, hver med 5% feil — <Tex>{"P(X = 2)"}</Tex>?</p>
            <TexBlock>{"P(X = 2) = \\binom{10}{2} (0.05)^2 (0.95)^8 = 45 \\cdot 0.0025 \\cdot 0.6634 \\approx 0.0746"}</TexBlock>
            <p className="text-xs text-muted-foreground font-mono">scipy.stats.binom.pmf(2, n=10, p=0.05)</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 mb-4 space-y-2 text-sm">
            <h3 className="font-semibold text-sm">Hypergeometrisk <Tex>{"H(N, K, n)"}</Tex></h3>
            <p className="text-xs text-muted-foreground">Antall suksesser når vi trekker <Tex>{"n"}</Tex> UTEN tilbakelegging fra en populasjon med <Tex>{"N"}</Tex> enheter, hvorav <Tex>{"K"}</Tex> er suksesser.</p>
            <TexBlock>{"P(X = k) = \\frac{\\binom{K}{k}\\binom{N-K}{n-k}}{\\binom{N}{n}}"}</TexBlock>
            <TexBlock>{"E[X] = n \\cdot \\frac{K}{N}"}</TexBlock>
            <TexBlock>{"\\mathrm{Var}(X) = n \\cdot \\frac{K}{N} \\cdot \\frac{N-K}{N} \\cdot \\frac{N-n}{N-1}"}</TexBlock>
            <p className="text-xs text-muted-foreground"><strong>Eks:</strong> 20 enheter, 5 defekte. Trekk 3 — <Tex>{"P(X = 2)"}</Tex>?</p>
            <TexBlock>{"P(X = 2) = \\frac{\\binom{5}{2}\\binom{15}{1}}{\\binom{20}{3}} = \\frac{10 \\cdot 15}{1140} \\approx 0.132"}</TexBlock>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 space-y-2 text-sm">
            <h3 className="font-semibold text-sm">Poisson <Tex>{"\\mathrm{Poi}(\\lambda)"}</Tex></h3>
            <p className="text-xs text-muted-foreground">Antall sjeldne hendelser i et fast intervall (tid, areal, volum).</p>
            <TexBlock>{"P(X = k) = \\frac{e^{-\\lambda} \\lambda^k}{k!}, \\quad k = 0, 1, 2, \\ldots"}</TexBlock>
            <TexBlock>{"E[X] = \\lambda, \\quad \\mathrm{Var}(X) = \\lambda"}</TexBlock>
            <p className="text-xs text-muted-foreground"><strong>Eks:</strong> 5 kundeankomster pr. time i snitt — <Tex>{"P(X = 3)"}</Tex>?</p>
            <TexBlock>{"P(X = 3) = \\frac{e^{-5} \\cdot 5^3}{3!} = \\frac{0.00674 \\cdot 125}{6} \\approx 0.1404"}</TexBlock>
            <p className="text-xs text-muted-foreground">Tilnærming: <Tex>{"B(n, p) \\approx \\mathrm{Poi}(np)"}</Tex> når <Tex>{"n"}</Tex> stor og <Tex>{"p"}</Tex> liten (<Tex>{"np \\leq 10"}</Tex>).</p>
          </div>
        </section>

        <section id="kontinuerlig" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Kontinuerlige fordelinger</h2>

          <div className="rounded-xl border border-border bg-card p-5 mb-4 space-y-2 text-sm">
            <h3 className="font-semibold text-sm">Uniform <Tex>{"U(a, b)"}</Tex></h3>
            <p className="text-xs text-muted-foreground">Konstant tetthet på intervallet <Tex>{"[a, b]"}</Tex>.</p>
            <TexBlock>{"f(x) = \\frac{1}{b - a}, \\quad a \\leq x \\leq b"}</TexBlock>
            <TexBlock>{"E[X] = \\frac{a + b}{2}, \\quad \\mathrm{Var}(X) = \\frac{(b - a)^2}{12}"}</TexBlock>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 mb-4 space-y-2 text-sm">
            <h3 className="font-semibold text-sm">Eksponential <Tex>{"\\mathrm{Exp}(\\lambda)"}</Tex></h3>
            <p className="text-xs text-muted-foreground">Tid mellom Poisson-hendelser. Memoryless.</p>
            <TexBlock>{"f(x) = \\lambda e^{-\\lambda x}, \\quad x \\geq 0"}</TexBlock>
            <TexBlock>{"F(x) = 1 - e^{-\\lambda x}"}</TexBlock>
            <TexBlock>{"E[X] = \\frac{1}{\\lambda}, \\quad \\mathrm{Var}(X) = \\frac{1}{\\lambda^2}"}</TexBlock>
            <p className="text-xs text-muted-foreground">Memoryless: <Tex>{"P(X > s + t \\mid X > s) = P(X > t)"}</Tex>.</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 mb-4 space-y-2 text-sm">
            <h3 className="font-semibold text-sm">Normal <Tex>{"\\mathcal{N}(\\mu, \\sigma^2)"}</Tex></h3>
            <p className="text-xs text-muted-foreground">Den klokkeformede fordelingen. Default-modell for sum av mange små uavhengige bidrag (jf. CLT).</p>
            <TexBlock>{"f(x) = \\frac{1}{\\sigma \\sqrt{2\\pi}} \\exp\\!\\left(-\\frac{(x - \\mu)^2}{2\\sigma^2}\\right)"}</TexBlock>
            <TexBlock>{"E[X] = \\mu, \\quad \\mathrm{Var}(X) = \\sigma^2"}</TexBlock>
            <div className="text-xs text-muted-foreground">68/95/99.7-regel:</div>
            <TexBlock>{"P(|X - \\mu| < \\sigma) \\approx 0.683"}</TexBlock>
            <TexBlock>{"P(|X - \\mu| < 2\\sigma) \\approx 0.954"}</TexBlock>
            <TexBlock>{"P(|X - \\mu| < 3\\sigma) \\approx 0.997"}</TexBlock>
            <div className="text-xs text-muted-foreground">Standardisering:</div>
            <TexBlock>{"Z = \\frac{X - \\mu}{\\sigma} \\sim \\mathcal{N}(0, 1)"}</TexBlock>
            <TexBlock>{"P(X \\leq x) = \\Phi\\!\\left(\\frac{x - \\mu}{\\sigma}\\right)"}</TexBlock>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 mb-4 space-y-2 text-sm">
            <h3 className="font-semibold text-sm">Kji-kvadrat <Tex>{"\\chi^2(k)"}</Tex></h3>
            <p className="text-xs text-muted-foreground">Sum av <Tex>{"k"}</Tex> uavhengige standardnormale i andre potens.</p>
            <TexBlock>{"X = Z_1^2 + Z_2^2 + \\cdots + Z_k^2"}</TexBlock>
            <TexBlock>{"E[X] = k, \\quad \\mathrm{Var}(X) = 2k"}</TexBlock>
            <p className="text-xs text-muted-foreground">
              Brukes til test om utvalgs-varians: <Tex>{"\\frac{(n-1) s^2}{\\sigma^2} \\sim \\chi^2_{n-1}"}</Tex>, og kji-kvadrattest for uavhengighet/tilpasning.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 space-y-2 text-sm">
            <h3 className="font-semibold text-sm">Student-t <Tex>{"t_\\nu"}</Tex></h3>
            <p className="text-xs text-muted-foreground">Lignende normalfordelingen, men med tyngre haler. Bruk når <Tex>{"\\sigma"}</Tex> er ukjent og estimeres med <Tex>{"s"}</Tex>.</p>
            <TexBlock>{"T = \\frac{\\bar{X} - \\mu}{s / \\sqrt{n}} \\sim t_{\\nu}, \\quad \\nu = n - 1"}</TexBlock>
            <TexBlock>{"E[T] = 0, \\quad \\mathrm{Var}(T) = \\frac{\\nu}{\\nu - 2} \\;\\; (\\nu > 2)"}</TexBlock>
            <p className="text-xs text-muted-foreground"><Tex>{"\\nu > 30 \\Rightarrow t_\\nu \\approx \\mathcal{N}(0, 1)"}</Tex>. Brukes til KI for <Tex>{"\\mu"}</Tex> med ukjent <Tex>{"\\sigma"}</Tex>, t-tester.</p>
          </div>
        </section>

        <section id="normal" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Normalfordelingen — standardisering</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Den viktigste ferdigheten i hele kurset.
          </p>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm">
            <div className="font-semibold">Steg 1 — standardisér:</div>
            <TexBlock>{"Z = \\frac{X - \\mu}{\\sigma}"}</TexBlock>
            <div className="font-semibold">Steg 2 — finn sannsynligheten via <Tex>{"\\Phi"}</Tex>:</div>
            <TexBlock>{"P(X \\leq x) = \\Phi\\!\\left(\\frac{x - \\mu}{\\sigma}\\right)"}</TexBlock>
            <TexBlock>{"P(X \\geq x) = 1 - \\Phi\\!\\left(\\frac{x - \\mu}{\\sigma}\\right)"}</TexBlock>
            <TexBlock>{"P(a \\leq X \\leq b) = \\Phi\\!\\left(\\frac{b - \\mu}{\\sigma}\\right) - \\Phi\\!\\left(\\frac{a - \\mu}{\\sigma}\\right)"}</TexBlock>

            <div className="font-semibold pt-2">Eksempel: <Tex>{"X \\sim \\mathcal{N}(100, 15^2)"}</Tex>. Finn <Tex>{"P(X \\leq 130)"}</Tex>:</div>
            <TexBlock>{"z = \\frac{130 - 100}{15} = 2.0 \\;\\Rightarrow\\; P(X \\leq 130) = \\Phi(2.0) = 0.9772"}</TexBlock>

            <div className="font-semibold pt-2">Eksempel: <Tex>{"P(85 \\leq X \\leq 115)"}</Tex>:</div>
            <TexBlock>{"P = \\Phi(1) - \\Phi(-1) = 0.8413 - 0.1587 = 0.6826"}</TexBlock>
          </div>
        </section>

        <section id="clt" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Sentralgrenseteoremet (CLT)</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Det viktigste resultatet i kurset. Forklarer hvorfor normal-
            fordelingen er overalt.
          </p>
          <div className="rounded-xl border-2 border-brand/40 bg-brand/5 p-5 space-y-3 text-sm">
            <p>
              La <Tex>{"X_1, X_2, \\ldots, X_n"}</Tex> være iid med forventning <Tex>{"\\mu"}</Tex> og varians <Tex>{"\\sigma^2"}</Tex>. For stort <Tex>{"n"}</Tex>:
            </p>
            <TexBlock>{"\\bar{X} = \\frac{X_1 + X_2 + \\cdots + X_n}{n} \\;\\sim\\; \\mathcal{N}\\!\\left(\\mu, \\frac{\\sigma^2}{n}\\right) \\;\\text{ (tilnærmet)}"}</TexBlock>
            <p>Ekvivalent:</p>
            <TexBlock>{"Z = \\frac{\\bar{X} - \\mu}{\\sigma / \\sqrt{n}} \\;\\sim\\; \\mathcal{N}(0, 1)"}</TexBlock>
            <p className="text-xs text-muted-foreground">
              Den underliggende fordelingen kan være hva som helst (uniform, eksponential, skjev, …) — snittet av <Tex>{"n"}</Tex> sample blir likevel tilnærmet normalt. Tommelfingerregel: <Tex>{"n \\geq 30"}</Tex>.
            </p>
          </div>
          <div className="mt-4 rounded-xl border border-border bg-card p-5 space-y-2 text-sm">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Eksempel — fabrikk-snitt
            </div>
            <p>Vekt av enheter har <Tex>{"\\mu = 500\\,\\text{g}"}</Tex> og <Tex>{"\\sigma = 20\\,\\text{g}"}</Tex> (ukjent fordeling). Vi tar <Tex>{"n = 64"}</Tex> enheter — hva er <Tex>{"P(\\bar{X} \\geq 505)"}</Tex>?</p>
            <TexBlock>{"\\bar{X} \\sim \\mathcal{N}\\!\\left(500, \\frac{20^2}{64}\\right) = \\mathcal{N}(500, 6.25)"}</TexBlock>
            <TexBlock>{"\\mathrm{SD}(\\bar{X}) = \\sqrt{6.25} = 2.5"}</TexBlock>
            <TexBlock>{"z = \\frac{505 - 500}{2.5} = 2.0"}</TexBlock>
            <TexBlock>{"P(\\bar{X} \\geq 505) = 1 - \\Phi(2.0) = 0.0228 \\approx 2.3\\%"}</TexBlock>
          </div>
        </section>

        <section id="velger" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Fordelings-velgeren</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Det viktigste verktøyet på eksamen.
          </p>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-3 py-2 w-1/3">
                    Situasjon
                  </th>
                  <th className="text-left font-semibold px-3 py-2">Fordeling</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-3 py-2">
                    Ett forsøk, to utfall (suksess/fiasko)
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">Bernoulli(p)</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2">
                    Antall suksesser i n uavhengige forsøk, hver med p
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">Binomisk B(n,p)</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2">
                    Trekk UTEN tilbakelegging fra endelig populasjon
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    Hypergeometrisk
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2">
                    Antall sjeldne hendelser i fast intervall
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">Poisson(λ)</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2">Tilfeldig tall i [a, b], helt jevnt</td>
                  <td className="px-3 py-2 text-muted-foreground">Uniform(a, b)</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2">
                    Tid mellom Poisson-hendelser, levetid uten aldring
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">Exp(λ)</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2">Måling med tilfeldig støy, klokkeform</td>
                  <td className="px-3 py-2 text-muted-foreground">Normal N(μ, σ²)</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2">Sum av kvadrerte standardnormale</td>
                  <td className="px-3 py-2 text-muted-foreground">χ²(k)</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2">
                    Snitt fra liten n, σ ukjent — bruker s
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">Student-t(n-1)</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2">
                    Snitt fra stor n (n ≥ 30), ukjent fordeling
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    CLT → N(μ, σ²/n)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="feller" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">8. Eksamen-feller</h2>
          <div className="space-y-3 text-sm">
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>Med eller uten tilbakelegging.</strong> Binomisk antar
              uavhengige forsøk (med tilbakelegging eller stor populasjon).
              Hypergeometrisk når trekkene avhenger av forrige.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>PDF ≠ sannsynlighet.</strong> For kontinuerlige X kan f(x)
              være større enn 1 — det er en tetthet. Bare AREAL under f er
              sannsynlighet. P(X = a) = 0 alltid for kontinuerlig.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>Normal-standardisering: hvilket fortegn?</strong> Hvis vi
              vil P(X {">"} x): finn Φ((x-μ)/σ), så ta 1 minus.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>CLT-snittets std er σ/√n, IKKE σ.</strong> Det er hele
              poenget med CLT — varians blir mindre etter hvert som n øker. På
              eksamen: glem ikke å dele med √n.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>Poisson-tilnærming gjelder bare når p er liten.</strong>{" "}
              Binom(n,p) ≈ Poi(np) krever p ≤ 0.1 og n ≥ 30. Ellers bruk binomisk
              direkte.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>Var(X+Y) = Var(X) + Var(Y)</strong> krever uavhengighet.
              Hvis ikke: Var(X+Y) = Var(X) + Var(Y) + 2·Cov(X,Y).
            </div>
          </div>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/drag" className="text-brand hover:underline">
                Drag-oppgaver
              </Link>{" "}
              under «Sannsynlighetsfordelinger» — match-fordeling-til-scenario,
              parameter-fyll, og CLT-quizzer.
            </li>
            <li>
              <Link to="/python" className="text-brand hover:underline">
                Python-øvelser
              </Link>{" "}
              — bruk{" "}
              <code className="text-xs">scipy.stats.binom</code>,{" "}
              <code className="text-xs">scipy.stats.norm</code>, og{" "}
              <code className="text-xs">scipy.stats.poisson</code> for verifisering.
            </li>
            <li>
              Neste modul:{" "}
              <Link
                to="/stack/$slug"
                params={{ slug: "tek1-statistisk-analyse" }}
                className="text-brand hover:underline"
              >
                Statistisk inferens og regresjon
              </Link>{" "}
              — fra fordeling til konklusjon.
            </li>
          </ul>
        </div>
              <div className="mt-6">
          <Link
            to="/stack/$slug"
            params={{ slug: "tek-1501" }}
            className="text-brand hover:underline inline-flex items-center gap-1 text-sm"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Tilbake til TEK-1501-hub
          </Link>
        </div>
</div>
    </StackPageShell>
  );
}
