import { Link } from "@tanstack/react-router";
import { Lightbulb, ArrowLeft } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { Tex, TexBlock } from "@/components/Tex";
import { SvmMarginDemo } from "./SvmMarginDemo";
import { SvmDrill } from "./SvmDrill";

const STEPS = [
  { title: "Hvilken linje skal skille klassene?", anchor: "problem" },
  { title: "Maximum margin — interaktiv demo", anchor: "margin" },
  { title: "Støttevektorer (support vectors)", anchor: "support" },
  { title: "Kernel-trick — intuisjon", anchor: "kernel" },
  { title: "Når brukes SVM i praksis?", anchor: "praksis" },
  { title: "Drill: kjenner du SVM mot logreg?", anchor: "drill" },
];

export function Dte2602SvmPage() {
  return (
    <StackPageShell title="DTE-2602 · SVM (overflate-intro)" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2602 · Klassifikasjon
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Support Vector Machine — overflate-intro
          </h1>
          <p className="mt-3 text-muted-foreground">
            SVM er en klassifikator som finner hyperplanet som <em>maksimerer
            marginen</em> mellom klassene. I motsetning til logistisk regresjon
            bryr SVM seg bare om punktene som ligger nærmest grensa — de
            kalles støttevektorer. Med kernel-trick håndterer SVM også
            ikke-lineære grenser.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Intuisjon først:</span> Bla rett ned
              til demoen — dra punkter rundt og se grensa oppdatere seg —{" "}
              <em>før</em> du leser matten. Forutsetter at du har sett{" "}
              <Link
                to="/stack/$slug"
                params={{ slug: "supervised-learning" }}
                className="text-brand hover:underline"
              >
                regresjon vs klassifikasjon
              </Link>{" "}
              og gjerne{" "}
              <Link
                to="/stack/$slug"
                params={{ slug: "dte2602-logistisk-regresjon" }}
                className="text-brand hover:underline"
              >
                logistisk regresjon
              </Link>
              .
            </div>
          </div>
        </div>

        <CourseOutline courseId="dte2602-svm" steps={STEPS} />

        <Section
          number="1"
          id="problem"
          title="Problemet: hvilken linje skal skille klassene?"
        >
          <p className="text-sm text-muted-foreground mb-3">
            To klasser i et plan. En lineær klassifikator skiller dem med en
            rett linje — i 3D et plan, i n dimensjoner et{" "}
            <em>hyperplan</em>. Men <strong>uendelig mange</strong> linjer
            klarer å skille dataene perfekt:
          </p>
          <pre className="rounded-xl border border-border bg-card p-4 font-mono text-xs overflow-x-auto whitespace-pre">{`        klasse A                 klasse B
       o   o  o                  x   x  x
        o o   o     ─────?─────   x  x x
       o   o                       x   x

   tre kandidat-grenser, alle perfekte
   på trening — hvilken generaliserer best?`}</pre>
          <p className="text-sm text-muted-foreground mt-3">
            Logistisk regresjon velger linja som maksimerer
            log-likelihood — den «midter» seg blant alle punktene. SVM gjør
            noe annet: <strong>velg linja med størst avstand til nærmeste
            punkt fra hver klasse</strong>. Den avstanden kalles marginen.
          </p>
        </Section>

        <Section
          number="2"
          id="margin"
          title="Maximum margin — interaktiv demo"
        >
          <p className="text-sm text-muted-foreground mb-3">
            Dra de røde og blå punktene. Bytt mellom lineær og RBF-kjerne. Se
            hvordan beslutningsgrensa (grønn) og marginsona (gult skravert)
            oppdaterer seg. Punkter med gul ring er <em>støttevektorer</em>.
          </p>
          <SvmMarginDemo />
          <p className="text-xs text-muted-foreground mt-3">
            <strong>Eksperiment:</strong> dra et rødt punkt langt nedover —
            marginen blir bredere, men grensa beveger seg knapt fordi det
            punktet ikke lenger er nærmest. Dra deretter et støttevektor-punkt
            inn mot grensa — nå hopper hele hyperplanet.
          </p>
          <div className="mt-4 rounded-xl border border-border bg-card p-5 space-y-2 text-sm">
            <div className="font-semibold">Formelt (intuisjonsnivå)</div>
            <p>
              Hyperplanet er definert av en normalvektor{" "}
              <Tex>{"\\mathbf{w}"}</Tex> og forskyvning{" "}
              <Tex>{"b"}</Tex>:
            </p>
            <TexBlock>{"\\mathbf{w}^\\top \\mathbf{x} + b = 0"}</TexBlock>
            <p>
              Margin-bredden er <Tex>{"2 / \\|\\mathbf{w}\\|"}</Tex>. SVM
              minimerer <Tex>{"\\|\\mathbf{w}\\|"}</Tex> samtidig som alle
              punkter må ligge på riktig side av margin-grensene. Det er en
              <em> kvadratisk programmerings-oppgave</em> (QP). I DTE-2602
              kjører du den bare som <code>SVC(...)</code> i sklearn — selve
              optimeringen er DTE-2501-mat.
            </p>
          </div>
        </Section>

        <Section number="3" id="support" title="Støttevektorer">
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm">
            <p>
              Etter at SVM er trent, kan du{" "}
              <strong>kaste alle punkter unntatt støttevektorene</strong>{" "}
              og fortsatt få nøyaktig samme modell. Det er den dramatiske
              forskjellen fra logistisk regresjon, som summer log-loss over
              hvert eneste sample.
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong>Få støttevektorer</strong> → modellen er konsis og
                generaliserer bra.
              </li>
              <li>
                <strong>Mange støttevektorer</strong> (mer enn ca. halvparten
                av samplene) → klassene overlapper kraftig eller modellen er
                under-regularisert. Du bør justere C eller bytte modell.
              </li>
              <li>
                <strong>Outliers nær grensa</strong> blir automatisk
                støttevektorer — SVM er derfor sensitiv for slike. Soft-margin
                med liten C demper effekten (men det er DTE-2501-stoff).
              </li>
            </ul>
            <pre className="rounded-md bg-muted/40 p-3 font-mono text-xs overflow-x-auto whitespace-pre">{`from sklearn.svm import SVC
model = SVC(kernel='linear').fit(X, y)

print(model.support_vectors_.shape)  # (k, n_features)
print(model.n_support_)              # antall per klasse`}</pre>
          </div>
        </Section>

        <Section number="4" id="kernel" title="Kernel-trick — intuisjon">
          <p className="text-sm text-muted-foreground mb-3">
            Hva om klassene ikke kan skilles med en rett linje? Tenk to ringer
            der den ene ligger inni den andre. Trikset:{" "}
            <strong>løft dataene opp i et høyere-dimensjonalt rom</strong> der
            de blir lineært separerbare, finn hyperplanet der, og prosjekter
            grensa tilbake.
          </p>
          <pre className="rounded-xl border border-border bg-card p-4 font-mono text-xs overflow-x-auto whitespace-pre">{`2D (ringer)            3D (med løft z = x² + y²)
    o o o                     o o o
   o  x  o            ────→  ─────────  ← lineært skille mulig
    o o o                     x x x`}</pre>
          <p className="text-sm text-muted-foreground mt-3">
            «Trikset» er at vi <em>aldri</em> trenger å beregne løftet
            eksplisitt. Algoritmen bruker bare prikkprodukter mellom punkter,
            og en <strong>kjernefunksjon</strong>{" "}
            <Tex>{"K(\\mathbf{x}_i, \\mathbf{x}_j)"}</Tex> gir oss det
            prikkproduktet i det høyere rommet direkte. Vanlige kjerner:
          </p>
          <div className="grid sm:grid-cols-2 gap-3 mt-3 text-sm">
            <div className="rounded-xl border border-border bg-card p-4 space-y-1">
              <div className="font-semibold">Lineær</div>
              <TexBlock>{"K(\\mathbf{x}_i, \\mathbf{x}_j) = \\mathbf{x}_i^\\top \\mathbf{x}_j"}</TexBlock>
              <p className="text-xs text-muted-foreground">
                Bruk når du har mange features og lite data (tekst, høy-dim).
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 space-y-1">
              <div className="font-semibold">RBF (Gauss)</div>
              <TexBlock>{"K(\\mathbf{x}_i, \\mathbf{x}_j) = e^{-\\gamma \\|\\mathbf{x}_i - \\mathbf{x}_j\\|^2}"}</TexBlock>
              <p className="text-xs text-muted-foreground">
                Default valg. Lar grensa bukte seg lokalt rundt klyngene.
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            <strong>Pass på:</strong> hyperparameteren{" "}
            <Tex>{"\\gamma"}</Tex> styrer hvor «lokal» RBF-kjernen er. Stor{" "}
            <Tex>{"\\gamma"}</Tex> ⇒ snirklet grense, overfitter. Liten{" "}
            <Tex>{"\\gamma"}</Tex> ⇒ glatt grense, underfitter. Default i
            sklearn er <code>gamma='scale'</code> som ofte er greit, men tunes
            via grid-search.
          </p>
        </Section>

        <Section number="5" id="praksis" title="Når brukes SVM i praksis?">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-sm">
              <div className="font-semibold text-emerald-500 mb-1">Velg SVM når</div>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>middels datasett (noen hundre til noen tusen samples)</li>
                <li>høy-dimensjonale features (tekst-klassifikasjon, gener)</li>
                <li>klare margin-rom — klassene er nesten separerbare</li>
                <li>du har tid til grid-search over C og gamma</li>
              </ul>
            </div>
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-4 text-sm">
              <div className="font-semibold text-rose-500 mb-1">Unngå SVM når</div>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>
                  veldig store datasett (&gt;~50 000 samples) — RBF-SVM
                  skalerer omtrent <Tex>{"O(n^2)"}</Tex> til{" "}
                  <Tex>{"O(n^3)"}</Tex>
                </li>
                <li>
                  du trenger kalibrerte sannsynligheter — bruk logreg
                </li>
                <li>
                  du må forklare modellen til en kunde — trær er mer tolkbare
                </li>
                <li>
                  klassene overlapper massivt — gradient boosting eller nett
                  gjør det bedre
                </li>
              </ul>
            </div>
          </div>
          <pre className="rounded-xl border border-border bg-card p-4 font-mono text-xs overflow-x-auto whitespace-pre mt-3">{`from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
from sklearn.model_selection import GridSearchCV

pipe = Pipeline([
    ('scaler', StandardScaler()),       # SVM ER følsom for skala!
    ('svm', SVC(kernel='rbf')),
])

grid = GridSearchCV(pipe, {
    'svm__C': [0.1, 1, 10, 100],
    'svm__gamma': ['scale', 0.01, 0.1, 1],
}, cv=5)
grid.fit(X_train, y_train)`}</pre>
          <p className="text-xs text-muted-foreground mt-3">
            <strong>Skaler alltid features før SVM.</strong> RBF-kjernen
            bruker euklidsk avstand mellom samples — uskalerte features lar
            den ene med størst tallverdi dominere helt.
          </p>
        </Section>

        <Section number="6" id="drill" title="Drill: kjenner du SVM mot logreg?">
          <p className="text-sm text-muted-foreground mb-3">
            Klikk på et alternativ, og deretter «Sjekk svar». Sikt på 4 av 4
            før du går videre.
          </p>
          <SvmDrill />
        </Section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link
                to="/stack/$slug"
                params={{ slug: "dte2602-trees-rf" }}
                className="text-brand hover:underline"
              >
                Trær &amp; Random Forest
              </Link>{" "}
              — neste klassifikator-familie, helt forskjellig filosofi.
            </li>
            <li>
              <Link
                to="/stack/$slug"
                params={{ slug: "dte2602-evaluation-roc" }}
                className="text-brand hover:underline"
              >
                Forvirringsmatrise, F1 og ROC-AUC
              </Link>{" "}
              — hvordan sammenlikne SVM mot logreg på et test-sett.
            </li>
            <li>
              <Link to="/python" className="text-brand hover:underline">
                /python
              </Link>{" "}
              — tren <code>SVC(kernel='rbf')</code> på iris og plot
              beslutningsgrensa.
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
  id,
  title,
  children,
}: {
  number: string;
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mb-10">
      <h2 className="text-xl font-semibold mb-3">
        {number}. {title}
      </h2>
      {children}
    </section>
  );
}
