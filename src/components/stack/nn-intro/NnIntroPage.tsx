import { Link } from "@tanstack/react-router";
import { ArrowRight, Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { NeuralNetForwardPass } from "./NeuralNetForwardPass";
import { NeuronVisualizer } from "./NeuronVisualizer";

const STEPS = [
  { title: "Nevron-visualizer (interaktiv)", anchor: "visualizer" },
  { title: "Perceptron — minste byggesten", anchor: "perceptron" },
  { title: "Aktiveringsfunksjoner", anchor: "aktivering" },
  { title: "Feed-forward — flere lag", anchor: "feedforward" },
  { title: "Loss-funksjoner", anchor: "loss" },
  { title: "Gradient descent — intuisjon", anchor: "gd" },
  { title: "Backpropagation — kort", anchor: "backprop" },
  { title: "Forward + backprop (interaktiv)", anchor: "forward-backprop" },
  { title: "Hyperparametere du må kjenne", anchor: "hyper" },
];

export function NnIntroPage() {
  return (
    <StackPageShell title="Innføring i nevrale nett" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2602 · Nevrale nett (intro)
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Innføring i nevrale nett — fra perceptron til backprop
          </h1>
          <p className="mt-3 text-muted-foreground">
            Hva en «neuron» faktisk er, hvordan flere lag stables, og hvordan modellen
            lærer. Vi går ikke inn på CNN/transformers — det er DTE-2502.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <Link to="/drag" className="text-brand hover:underline">drag-oppgavene</Link>{" "}
              under «Nevrale nett».
            </div>
          </div>
        </div>

        <CourseOutline courseId="nn-intro" steps={STEPS} />

        <section id="visualizer" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Nevron-visualizer (interaktiv)</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Lek deg med ett nevron, sammenlign aktiveringer, eller bygg et lite 2-lags
            nett — all matte oppdaterer seg live mens du drar i sliderne. XOR-modus
            er et godt sted å oppleve hvorfor flere lag trengs.
          </p>
          <NeuronVisualizer />
        </section>

        <section id="perceptron" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Perceptron — minste byggesten</h2>
          <p className="text-sm text-muted-foreground mb-4">
            En perceptron tar inn flere tall, ganger dem med vekter, summerer, og sender
            gjennom en aktiveringsfunksjon. Det er ÉN «neuron».
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Input:    x₁, x₂, x₃   (features)
Vekter:   w₁, w₂, w₃   (lærbare)
Bias:     b            (lærbar)

z = w₁·x₁ + w₂·x₂ + w₃·x₃ + b
output = σ(z)            ← aktivering

  x₁ ──╲
        ╲   w₁
  x₂ ────●────► z ──► σ ──► output
        ╱   w₂
  x₃ ──╱   w₃
            + b

Med riktige vekter kan én perceptron lære AND, OR — men IKKE XOR.
Det krever flere lag.`}</pre>
          </div>
        </section>

        <section id="aktivering" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Aktiveringsfunksjoner</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Uten aktivering ville hele nettet vært én stor lineær funksjon — uansett hvor
            mange lag. Aktiveringen er det som gir nettet evnen til å lære ikke-lineære
            mønstre.
          </p>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-32">Funksjon</th>
                  <th className="text-left font-semibold px-4 py-2 w-40">Formel</th>
                  <th className="text-left font-semibold px-4 py-2">Bruksområde</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">ReLU</td><td className="px-4 py-3 font-mono">max(0, z)</td><td className="px-4 py-3 text-muted-foreground">Default for skjulte lag. Rask. «Dying ReLU»-problem.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">Sigmoid</td><td className="px-4 py-3 font-mono">1/(1+e^-z)</td><td className="px-4 py-3 text-muted-foreground">Binær klassifikasjon — output ∈ (0,1). Sjelden i skjulte lag (vanishing gradient).</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">Tanh</td><td className="px-4 py-3 font-mono">(e^z-e^-z)/(e^z+e^-z)</td><td className="px-4 py-3 text-muted-foreground">Sigmoid-lignende, output ∈ (-1,1). Bedre enn sigmoid i skjulte lag.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">Softmax</td><td className="px-4 py-3 font-mono">e^zᵢ / Σe^zⱼ</td><td className="px-4 py-3 text-muted-foreground">Multi-klasse klassifikasjon. Output sum = 1.</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="feedforward" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Feed-forward — flere lag</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Stable perceptroner i lag. Output fra ett lag blir input til neste.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Eksempel: 3 input, 4 skjulte, 1 output (binær klassif.)

  Input layer    Skjult layer (4)     Output (1)
  ┌───┐         ┌───┐ ┌───┐ ┌───┐ ┌───┐
  │ x₁│────────►│   │ │   │ │   │ │   │
  └───┘     ╲  └───┘ └───┘ └───┘ └───┘    ┌───┐
            ╲ ╱      │     │     │     ╲  │   │
  ┌───┐    fully     │     │     │     ──►│ ŷ │
  │ x₂│────connected─┘     │     │     ╱  └───┘
  └───┘    ╱ ╲             │     │     ╱
            ╱   ╲           │     │
  ┌───┐         ┌───┐ ┌───┐ ┌───┐ ┌───┐
  │ x₃│────────►│   │ │   │ │   │ │   │
  └───┘         └───┘ └───┘ └───┘ └───┘

Antall parametere: 3*4 vekter + 4 bias  +  4*1 vekt + 1 bias  =  21`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            «Fully connected» betyr alle noder i ett lag er koblet til alle i neste.
            Antall parametere vokser raskt med bredde og dybde — derfor blir
            store nett dyre å trene.
          </p>
        </section>

        <section id="loss" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Loss-funksjoner</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Loss er ETT TALL som måler hvor «feil» modellen er. Trening er å minimere
            loss.
          </p>
          <ul className="space-y-2 text-sm">
            <li className="rounded-lg border border-border bg-card p-3">
              <strong>MSE (Mean Squared Error)</strong> — regresjon. <code>(1/n)·Σ(y-ŷ)²</code>. Straffer store feil hardt.
            </li>
            <li className="rounded-lg border border-border bg-card p-3">
              <strong>Binary cross-entropy</strong> — binær klassifikasjon. Bruker sigmoid + log.
            </li>
            <li className="rounded-lg border border-border bg-card p-3">
              <strong>Categorical cross-entropy</strong> — multi-klasse. Bruker softmax + log.
            </li>
            <li className="rounded-lg border border-border bg-card p-3">
              <strong>Huber loss</strong> — robust regresjon (MSE for små feil, MAE for store).
            </li>
          </ul>
        </section>

        <section id="gd" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Gradient descent — intuisjon</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Loss-funksjonen tegner et «landskap» i parameter-rommet. Gradient descent
            tar små skritt nedover — beregner gradient (steepest direction), justerer
            vektene motsatt vei.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Pseudokode:

  inisialiser vekter w tilfeldig
  repeat:
      ŷ = forward(X, w)
      L = loss(ŷ, y)
      ∇L = gradient av L mhp. hver vekt
      w = w - lr * ∇L           ← steg nedover bakken

Hyperparametere:
  lr (learning rate)    — skritt-størrelse
  batch_size            — hvor mange samples per gradient-estimat
  epochs                — antall passeringer over hele datasettet`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Varianter:</strong> SGD (stochastic — én sample), mini-batch (typisk
            32-256 samples), batch (hele datasettet). Mini-batch er praktisk default.
            Adam-optimalisering justerer lr per parameter — ofte raskere konvergens.
          </p>
        </section>

        <section id="backprop" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Backpropagation — kort</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Hvordan beregner vi gradienten effektivt? Backprop bruker kjerne-regelen i
            differensialregning og «bakover-passering» gjennom nettet.
          </p>
          <div className="rounded-xl border-2 border-brand/40 bg-brand/5 p-5">
            <ol className="space-y-1.5 text-sm text-foreground list-decimal pl-5">
              <li><strong>Forward pass:</strong> kjør input frem gjennom nettet, regn ut loss.</li>
              <li><strong>Backward pass:</strong> beregn ∂L/∂w for hver vekt — fra output-laget bakover.</li>
              <li><strong>Update:</strong> w = w - lr · ∂L/∂w</li>
            </ol>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Du trenger ikke implementere backprop fra scratch på grunnkurs-nivå. PyTorch
            og TensorFlow gjør det automatisk via «autograd». Men forstå at dyp nettverk
            har et problem: <strong>vanishing gradients</strong> — gradient blir
            forsvinnende liten i tidlige lag. ReLU + bedre vekter-init (He, Xavier) fikser
            mye av dette.
          </p>
        </section>

        <section id="forward-backprop" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Forward + backprop (interaktiv)</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Et lite 2&times;3&times;2-nett med ekte vekter og sigmoid. Dra på
            input-sliderne for å se aktiveringene forplante seg. «Forward pass»
            animerer signaler venstre-til-høyre. «Backprop» tar ETT
            gradient-skritt mot målet <span className="font-mono">y = [1, 0]</span>{" "}
            og oppdaterer vektene — sammenlign loss før og etter.
          </p>
          <NeuralNetForwardPass />
          <p className="mt-3 text-xs text-muted-foreground">
            Blå kanter er positive vekter, røde er negative; tykkelse =
            <span className="font-mono"> |w|</span>. Etter flere backprop-klikk
            ser du vektene gradvis omformes så output-node 1 nærmer seg 1 og
            node 2 nærmer seg 0.
          </p>
        </section>

        <section id="hyper" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">8. Hyperparametere du må kjenne</h2>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-40">Hyperparameter</th>
                  <th className="text-left font-semibold px-4 py-2">Effekt</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">learning_rate</td><td className="px-4 py-3 text-muted-foreground">For høyt → divergens. For lavt → treg konvergens. Typisk 1e-3 til 1e-4.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">batch_size</td><td className="px-4 py-3 text-muted-foreground">Større = jevnere gradient men mer minne. Typisk 32, 64, 128.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">epochs</td><td className="px-4 py-3 text-muted-foreground">For få → underfit. For mange → overfit. Bruk early stopping.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">hidden layers</td><td className="px-4 py-3 text-muted-foreground">Dypere = mer kompleksitet, mer overfitting-risiko. Begynn lite.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">dropout</td><td className="px-4 py-3 text-muted-foreground">Slå av tilfeldige nevroner under trening. 0.2-0.5. Reduserer overfit.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">optimizer</td><td className="px-4 py-3 text-muted-foreground">Adam er sikker default. SGD med momentum også standard.</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/drag" className="text-brand hover:underline">Drag-oppgaver</Link>
              .
            </li>
            <li>
              <strong>DTE-2502</strong> bygger på dette: CNN, RNN/transformers, ekte
              dyplærings-rammeverk.
              <ArrowRight className="inline h-3.5 w-3.5 ml-1" />
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
