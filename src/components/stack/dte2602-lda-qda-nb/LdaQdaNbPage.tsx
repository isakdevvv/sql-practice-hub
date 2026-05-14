import { Link } from "@tanstack/react-router";
import { Lightbulb, ArrowLeft } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { Tex, TexBlock } from "@/components/Tex";
import { LdaQdaNbBoundaries } from "./LdaQdaNbBoundaries";

export function LdaQdaNbPage() {
  return (
    <StackPageShell
      title="DTE-2602 — LDA, QDA og Naive Bayes"
      group="eksamen"
    >
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2602 · Generative klassifikatorer
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            LDA, QDA og Naive Bayes — generative klassifikatorer
          </h1>
          <p className="mt-3 text-muted-foreground">
            Tre klassifikatorer som alle bygger på Bayes-teoremet, og som skiller
            seg gjennom hvilken antakelse de gjør om de klassebetingede tetthetene.
            Pensum: ISLP kap. 4.4–4.6. Du lærer hvorfor LDA gir lineær grense,
            QDA kvadratisk, og hvorfor Naive Bayes ofte overlever når{" "}
            <Tex>{"p \\gg n"}</Tex>.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hovedidé:</span> i stedet for å
              modellere <Tex>{"P(y \\mid x)"}</Tex> direkte (slik logistisk
              regresjon gjør), modellerer vi <Tex>{"P(x \\mid y)"}</Tex> per
              klasse og snur det med Bayes.
            </div>
          </div>
        </div>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">
            1. Generativ vs diskriminativ modell
          </h2>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm">
            <p>
              <strong>Diskriminativ</strong> (logistisk regresjon, SVM, trær):
              modeller <Tex>{"P(y \\mid x)"}</Tex> rett. Spør «gitt punktet, hvor
              sannsynlig er hver klasse?».
            </p>
            <p>
              <strong>Generativ</strong> (LDA, QDA, NB, GMM): modeller{" "}
              <Tex>{"P(x \\mid y)"}</Tex> og <Tex>{"P(y)"}</Tex> separat, og
              kombiner med Bayes. Spør «hvordan ville hver klasse ha generert et
              punkt som dette?».
            </p>
            <div className="font-semibold pt-2">Bayes-klassifikatoren:</div>
            <TexBlock>{"\\hat{y}(x) = \\arg\\max_{k}\\; P(y = k \\mid x)"}</TexBlock>
            <p>
              Dette er det <em>teoretisk optimale</em> valget (lavest mulig
              feilrate gitt sannheten). Alle ekte klassifikatorer prøver å
              tilnærme denne — forskjellen er hvordan.
            </p>
          </div>
        </section>

        <Section number="2" title="Bayes-teoremet for klassifikasjon">
          <p className="text-sm text-muted-foreground mb-3">
            Med <Tex>{"K"}</Tex> klasser, prior <Tex>{"\\pi_k = P(y=k)"}</Tex>{" "}
            og klassebetinget tetthet <Tex>{"f_k(x) = P(x \\mid y = k)"}</Tex>:
          </p>
          <TexBlock>{"P(y = k \\mid x) = \\frac{\\pi_k\\, f_k(x)}{\\sum_{l=1}^K \\pi_l\\, f_l(x)}"}</TexBlock>
          <p className="text-sm text-muted-foreground mt-3">
            Nevneren er lik for alle klasser, så argmax over <Tex>{"k"}</Tex>{" "}
            blir argmax av telleren — eller, etter logaritme, argmax av{" "}
            <Tex>{"\\log \\pi_k + \\log f_k(x)"}</Tex>.
          </p>
          <p className="text-sm text-muted-foreground mt-3">
            LDA, QDA og Naive Bayes deler dette rammeverket. De skiller seg
            kun gjennom hvilken modell de bruker for <Tex>{"f_k"}</Tex>.
          </p>
        </Section>

        <Section number="3" title="LDA — lik kovariansmatrise per klasse">
          <p className="text-sm text-muted-foreground mb-3">
            LDA antar at hver klasse er multivariat normalfordelt og at alle
            klassene deler <em>samme</em> kovariansmatrise:
          </p>
          <TexBlock>{"f_k(x) = \\frac{1}{(2\\pi)^{p/2} |\\Sigma|^{1/2}} \\exp\\!\\left(-\\tfrac{1}{2}(x - \\mu_k)^\\top \\Sigma^{-1} (x - \\mu_k)\\right)"}</TexBlock>
          <p className="text-sm text-muted-foreground mt-3">
            Når du tar logaritmen og fjerner ledd som er felles for alle
            klasser, sitter du igjen med den <em>lineære diskriminantfunksjonen</em>:
          </p>
          <TexBlock>{"\\delta_k(x) = x^\\top \\Sigma^{-1} \\mu_k - \\tfrac{1}{2} \\mu_k^\\top \\Sigma^{-1} \\mu_k + \\log \\pi_k"}</TexBlock>
          <p className="text-sm text-muted-foreground mt-3">
            <Tex>{"\\delta_k(x)"}</Tex> er lineær i <Tex>{"x"}</Tex>, så
            beslutningsgrensene mellom klassene blir hyperplan. Få parametere{" "}
            (én <Tex>{"\\mu_k"}</Tex> per klasse + én delt <Tex>{"\\Sigma"}</Tex>)
            ⇒ <strong>lav varians</strong>, men risiko for{" "}
            <strong>bias</strong> hvis antakelsen brister.
          </p>
          <div className="mt-3 rounded-lg border border-border bg-background p-3">
            <div className="text-xs font-semibold mb-2">Estimater fra data</div>
            <ul className="list-disc pl-5 space-y-1 text-xs text-muted-foreground">
              <li>
                <Tex>{"\\hat{\\pi}_k = n_k / n"}</Tex>
              </li>
              <li>
                <Tex>{"\\hat{\\mu}_k = \\frac{1}{n_k}\\sum_{i: y_i=k} x_i"}</Tex>
              </li>
              <li>
                <Tex>{"\\hat{\\Sigma} = \\frac{1}{n-K} \\sum_k \\sum_{i: y_i = k} (x_i - \\hat{\\mu}_k)(x_i - \\hat{\\mu}_k)^\\top"}</Tex>
              </li>
            </ul>
          </div>
        </Section>

        <Section number="4" title="QDA — ulik kovariansmatrise per klasse">
          <p className="text-sm text-muted-foreground mb-3">
            Slipp antakelsen om felles kovarians:
          </p>
          <TexBlock>{"\\delta_k(x) = -\\tfrac{1}{2} \\log|\\Sigma_k| - \\tfrac{1}{2} (x - \\mu_k)^\\top \\Sigma_k^{-1} (x - \\mu_k) + \\log \\pi_k"}</TexBlock>
          <p className="text-sm text-muted-foreground mt-3">
            Nå er <Tex>{"\\delta_k"}</Tex> kvadratisk i <Tex>{"x"}</Tex> — så
            grensene blir kvadratiske kurver (ellipser, hyperbler, parabler).
            Lavere bias, men <strong>høyere varians</strong>: vi må estimere én
            full kovariansmatrise per klasse (<Tex>{"K \\cdot p(p+1)/2"}</Tex>{" "}
            parametre).
          </p>
          <p className="text-sm text-muted-foreground mt-3">
            Tommelfingerregel: bruk QDA når <Tex>{"n"}</Tex> er stor og{" "}
            <Tex>{"p"}</Tex> moderat. LDA når <Tex>{"n"}</Tex> er liten eller du
            mistenker at klassene har lik form.
          </p>
        </Section>

        <Section number="5" title="Naive Bayes — feature-uavhengighet">
          <p className="text-sm text-muted-foreground mb-3">
            Naive Bayes antar at features er <em>betinget uavhengige</em> gitt
            klassen:
          </p>
          <TexBlock>{"f_k(x) = \\prod_{j=1}^p f_{kj}(x_j)"}</TexBlock>
          <p className="text-sm text-muted-foreground mt-3">
            For Gaussian Naive Bayes blir hver <Tex>{"f_{kj}"}</Tex> en
            én-dimensjonal normal med <Tex>{"\\mu_{kj}"}</Tex> og{" "}
            <Tex>{"\\sigma_{kj}^2"}</Tex>. Ekvivalent: QDA med{" "}
            <em>diagonal</em> kovariansmatrise per klasse.
          </p>
          <p className="text-sm text-muted-foreground mt-3">
            Antakelsen er nesten alltid usann (features korrelerer), men gjør
            modellen <strong>ekstremt</strong> robust mot lite data og høy
            dimensjon — du estimerer kun <Tex>{"2pK"}</Tex> parametre i stedet for{" "}
            <Tex>{"Kp(p+1)/2"}</Tex>. Klassiske bruksområder: tekst-klassifisering
            (spam, sentimentanalyse) der <Tex>{"p"}</Tex> kan være titusenvis.
          </p>
          <div className="mt-3 rounded-lg border border-border bg-background p-3 text-xs">
            <strong>Varianter av NB:</strong>
            <ul className="list-disc pl-5 mt-1 space-y-0.5 text-muted-foreground">
              <li>
                <strong>GaussianNB</strong> — kontinuerlige features.
              </li>
              <li>
                <strong>MultinomialNB</strong> — telle-features (word counts i tekst).
              </li>
              <li>
                <strong>BernoulliNB</strong> — binære features (term-present/absent).
              </li>
            </ul>
          </div>
        </Section>

        <Section number="6" title="Når er hvilken best?">
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-32">Modell</th>
                  <th className="text-left font-semibold px-4 py-2">Når</th>
                  <th className="text-left font-semibold px-4 py-2 w-28">Bias/Var</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono">LDA</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    Klassene har lik «form», nær-normale features, lite data.
                  </td>
                  <td className="px-4 py-3 text-xs">Høyere bias, lav varians</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono">QDA</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    Klassene har klart ulik spredning, nok data per klasse.
                  </td>
                  <td className="px-4 py-3 text-xs">Lav bias, høyere varians</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono">NB</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    Mange features, lite data (NLP), eller features faktisk
                    er nær uavhengige.
                  </td>
                  <td className="px-4 py-3 text-xs">Veldig høy bias, ekstremt lav varians</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono">Logistisk</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    Klassene <em>ikke</em> normalfordelt, du vil tolke
                    koeffisienter, du har middels data.
                  </td>
                  <td className="px-4 py-3 text-xs">Diskriminativ — annet rammeverk</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            <strong>Eksamen-feller:</strong> LDA gir lineær grense{" "}
            <em>uansett</em> — også når klassene ligger på en sirkel. QDA og
            logistisk regresjon klarer ikke det heller med kvadrater alene; for
            ikke-lineære grenser må du bytte modell eller transformere features.
          </p>
        </Section>

        <Section number="7" title="Interaktivt: decision boundaries side-by-side">
          <p className="text-sm text-muted-foreground mb-3">
            Bytt mellom LDA / QDA / Naive Bayes og se hvordan grensene endrer
            form. Slideren styrer hvor langt fra hverandre klassene ligger.
          </p>
          <LdaQdaNbBoundaries />
        </Section>

        <Section number="8" title="Python — sklearn på Pima Indians Diabetes">
          <pre className="rounded-xl border border-border bg-card p-4 font-mono text-xs overflow-x-auto whitespace-pre">{`from sklearn.discriminant_analysis import LinearDiscriminantAnalysis, QuadraticDiscriminantAnalysis
from sklearn.naive_bayes import GaussianNB
from sklearn.model_selection import cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

for name, model in [
    ("LDA", LinearDiscriminantAnalysis()),
    ("QDA", QuadraticDiscriminantAnalysis()),
    ("NB",  GaussianNB()),
]:
    pipe = Pipeline([('sc', StandardScaler()), ('clf', model)])
    scores = cross_val_score(pipe, X, y, cv=5, scoring='f1')
    print(f"{name}: f1 = {scores.mean():.3f} ± {scores.std():.3f}")`}</pre>
          <p className="text-xs text-muted-foreground mt-3">
            På Pima er klassene tilnærmet normalfordelt, ulik spredning, og
            <Tex>{"\\;n \\approx 770"}</Tex>. Typisk: QDA litt bedre enn LDA;
            NB taper på korrelasjon mellom features (alder ↔ BMI ↔ blodtrykk).
          </p>
        </Section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link
                to="/stack/$slug"
                params={{ slug: "dte2602-logistisk-regresjon" }}
                className="text-brand hover:underline"
              >
                Logistisk regresjon dypt
              </Link>{" "}
              — den diskriminative motsatsen.
            </li>
            <li>
              <Link
                to="/stack/$slug"
                params={{ slug: "dte2602-cv-varianter" }}
                className="text-brand hover:underline"
              >
                Cross-validation-varianter
              </Link>{" "}
              — slik velger du beste modell mellom LDA/QDA/NB rettferdig.
            </li>
            <li>
              <Link to="/python" className="text-brand hover:underline">/python</Link>{" "}
              — tren LDA/QDA/NB på iris og Pima, sammenlign CV-scores.
            </li>
          </ul>
        </div>

        <div className="mt-6">
          <Link
            to="/stack/$slug"
            params={{ slug: "dte-2602" }}
            className="text-brand hover:underline inline-flex items-center gap-1 text-sm"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Tilbake til DTE-2602-hub
          </Link>
        </div>
      </div>
    </StackPageShell>
  );
}

function Section({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold mb-3">
        {number}. {title}
      </h2>
      {children}
    </section>
  );
}
