import { Link } from "@tanstack/react-router";
import { Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { RelatedVisualizers } from "@/components/stack/RelatedVisualizers";
import { lazy, Suspense } from "react";
import { VisualizerSkeleton } from "@/components/visualizer-shell";

const BackpropVisualizer = lazy(() =>
  import("./BackpropVisualizer").then((m) => ({ default: m.BackpropVisualizer })),
);

const STEPS = [
  { title: "Kjerne-regelen — backprops motor", anchor: "chain-rule" },
  { title: "Beregningsgraf", anchor: "compgraph" },
  { title: "Visualisering — forover/bakover-pass", anchor: "visualizer" },
  { title: "Backward pass — worked example", anchor: "worked" },
  { title: "Vanishing & exploding gradient", anchor: "vanishing" },
  { title: "Vekt-initialisering: Xavier & He", anchor: "init" },
  { title: "Gradient clipping", anchor: "clip" },
  { title: "Autograd — slik gjør PyTorch det", anchor: "autograd" },
];

export function BackpropDypPage() {
  return (
    <StackPageShell title="Backpropagation — dypt" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2502 · Backpropagation (dyp)
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Backpropagation — kjerne-regelen, gradient-flyt og vekt-init
          </h1>
          <p className="mt-3 text-muted-foreground">
            Du kjenner allerede ideen: forward pass, regn ut loss, backward pass,
            oppdater vekter. Her ser vi <strong>hvorfor</strong> det funker — kjerne-regelen
            anvendt på en beregningsgraf — og hvorfor dype nett historisk var umulige
            å trene før He/Xavier-init og ReLU.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Forutsetning:</span> Du kjenner
              perceptron, sigmoid/ReLU, MSE og enkel gradient descent fra{" "}
              <Link to="/stack/$slug" params={{ slug: "nn-intro" }} className="text-brand hover:underline">
                nn-intro
              </Link>
              .
            </div>
          </div>
        </div>

        <CourseOutline courseId="backprop-dyp" steps={STEPS} />

        <section id="chain-rule" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Kjerne-regelen — backprops motor</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Hele backpropagation er kjerne-regelen i differensialregning, anvendt
            systematisk. Hvis <code>L</code> er en funksjon av <code>y</code>, som er en
            funksjon av <code>z</code>, som er en funksjon av en vekt <code>w</code>, så er:
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Kjerne-regelen:

   ∂L     ∂L     ∂y     ∂z
   ── = ── · ── · ──
   ∂w     ∂y     ∂z     ∂w

Les: "for å vite hvor mye L endrer seg når w endrer seg,
      kjede sammen alle deriverte langs veien."

Eksempel — én neuron:
   z = w·x + b
   y = σ(z)          (sigmoid)
   L = (y − t)²      (MSE mot target t)

   ∂L/∂y = 2(y − t)
   ∂y/∂z = σ(z)(1 − σ(z))
   ∂z/∂w = x

   ∂L/∂w = 2(y − t) · σ(z)(1 − σ(z)) · x`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Hver lokal derivert er enkel — backprop er bare effektiv bokføring av
            disse kjedene gjennom et helt nettverk.
          </p>
        </section>

        <section id="compgraph" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Beregningsgraf</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Et nettverk er en <strong>rettet asyklisk graf (DAG)</strong> av operasjoner.
            Hver node er en operasjon med innganger og en utgang. Hver kant bærer
            en tensor og senere også gradienten.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Forward pass — verdier strømmer høyre:

    x ──┐
        ●(·w)── z₁ ──● σ ── h ──● (·v) ── z₂ ──● σ ── y ──● (−t)² ── L
    w ──┘                       v ──┘                     t ──┘

Backward pass — gradienter strømmer venstre, hver node
multipliserer mottatt gradient med sin lokale deriverte:

    ∂L/∂x ←┐
           ●←── ∂L/∂z₁ ←──● ←── ∂L/∂h ←──● ←── ∂L/∂z₂ ←──● ←── ∂L/∂y ←──●
    ∂L/∂w ←┘                       ∂L/∂v ←┘

Regel: ved hver node multiplisér INNKOMMENDE gradient med
       NODENS lokale deriverte mhp. hver input. Send produktet
       videre langs hver inngangs-kant.`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Topologisk orden:</strong> forward går fra inputs til output, backward
            i motsatt rekkefølge. Det er denne strukturen som lar PyTorch/TF gjøre alt
            automatisk via autograd.
          </p>
        </section>

        <section id="visualizer" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Visualisering — forover/bakover-pass</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Klikk gjennom kjerne-regelen steg for steg. Forward (forover) fyller
            verdier i grafen, backward (bakover) sender gradienter tilbake — rød
            pil per kant med lokal deriverte og akkumulert ∂L/∂node. Bytt mellom
            uttrykk, ett nevron, et 2-lags nett og et 10-lags vanishing-eksempel.
          </p>
          <Suspense fallback={<VisualizerSkeleton />}>
            <BackpropVisualizer />
          </Suspense>
        </section>

        <section id="worked" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Backward pass — worked example</h2>
          <p className="text-sm text-muted-foreground mb-3">
            La oss kjøre kjerne-regelen gjennom et mini-nett med to lag.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Nettverk:
   z₁ = w₁·x + b₁
   h  = ReLU(z₁)
   z₂ = w₂·h + b₂
   ŷ  = σ(z₂)
   L  = −(t·log(ŷ) + (1−t)·log(1−ŷ))     (BCE-loss)

Numerisk eksempel:
   x=1.0, t=1, w₁=0.5, b₁=0.0, w₂=2.0, b₂=−0.5

Forward:
   z₁ = 0.5·1 + 0 = 0.5
   h  = ReLU(0.5) = 0.5
   z₂ = 2.0·0.5 + (−0.5) = 0.5
   ŷ  = σ(0.5) ≈ 0.622
   L  = −log(0.622) ≈ 0.475

Backward (start fra output, gå bakover):
   ∂L/∂ŷ  = (ŷ − t)/(ŷ(1−ŷ))     med BCE+sigmoid forenkler dette til:
   ∂L/∂z₂ = ŷ − t = 0.622 − 1 = −0.378
   ∂L/∂w₂ = ∂L/∂z₂ · h = −0.378 · 0.5 = −0.189
   ∂L/∂b₂ = ∂L/∂z₂           =  −0.378
   ∂L/∂h  = ∂L/∂z₂ · w₂ = −0.378 · 2 = −0.756
   ∂L/∂z₁ = ∂L/∂h · ReLU'(z₁) = −0.756 · 1 = −0.756   (ReLU' = 1 for z>0)
   ∂L/∂w₁ = ∂L/∂z₁ · x  = −0.756
   ∂L/∂b₁ = ∂L/∂z₁      = −0.756

Update (lr=0.1):
   w₁ ← 0.5 − 0.1·(−0.756) = 0.576
   w₂ ← 2.0 − 0.1·(−0.189) = 2.019
   ... osv.`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Legg merke til at <code>∂L/∂z₂ = ŷ − t</code> — det er en velkjent forenkling
            når man kombinerer softmax/sigmoid + cross-entropy. Derfor parres de alltid.
          </p>
        </section>

        <section id="vanishing" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Vanishing & exploding gradient</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Når et nett er dypt (mange lag), multipliseres mange deriverte sammen i
            kjernen. Hvis hver deriverte er &lt; 1, krymper produktet eksponensielt
            mot 0 — gradienten <strong>forsvinner</strong>. Hvis &gt; 1, vokser den
            eksplosivt.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Sigmoid-deriverte: σ'(z) = σ(z)(1−σ(z))  ≤ 0.25 alltid.

I et 10-lags sigmoid-nett:
   ∂L/∂w_lag1 ∝ produkt av ti sigmoid-derivater
              ≤ 0.25¹⁰ ≈ 0.00000095

→ vektene i tidlige lag oppdateres knapt. Nettet
  lærer bare de øverste lagene. KLASSISK PROBLEM
  som blokkerte dyp læring i tiår.

Symptomer på vanishing gradient:
  - Loss synker først raskt, så stopper helt.
  - Gradient-normer i tidlige lag → 0.
  - Tidlige lag lærer ikke.

Symptomer på exploding gradient:
  - Loss blir NaN.
  - Vektene flyr av gårde.
  - Vanligst i RNN, dype residual-nett uten norm.

Fixes:
  - Bruk ReLU i stedet for sigmoid/tanh i skjulte lag.
  - Smart vekt-init (He, Xavier).
  - Batch normalization.
  - Skip-connections (ResNet).
  - Gradient clipping (mot exploding).`}</pre>
          </div>
        </section>

        <section id="init" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Vekt-initialisering: Xavier & He</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Hvis du starter alle vekter til 0, er hvert lag like — symmetri-bryting
            feiler og nettet lærer ingenting. Hvis du starter for stort, eksploderer
            aktiveringene. For lite — vanishing.
          </p>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-32">Init</th>
                  <th className="text-left font-semibold px-4 py-2 w-44">Formel (variance)</th>
                  <th className="text-left font-semibold px-4 py-2">Når brukes</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono">Xavier / Glorot</td>
                  <td className="px-4 py-3 font-mono">Var(W) = 1/n_in  (eller 2/(n_in+n_out))</td>
                  <td className="px-4 py-3 text-muted-foreground">Sigmoid, tanh — symmetriske aktiveringer.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono">He / Kaiming</td>
                  <td className="px-4 py-3 font-mono">Var(W) = 2/n_in</td>
                  <td className="px-4 py-3 text-muted-foreground">ReLU og varianter — kompenserer for at halve nevroner dør.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono">Null</td>
                  <td className="px-4 py-3 font-mono">W = 0</td>
                  <td className="px-4 py-3 text-muted-foreground">ALDRI for vekter. OK for bias.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono">Stor random</td>
                  <td className="px-4 py-3 font-mono">N(0, 1)</td>
                  <td className="px-4 py-3 text-muted-foreground">Eksploderer i dype nett. Unngå.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Intuisjon:</strong> vi vil at variansen til aktiveringene skal være
            omtrent lik på tvers av lagene — verken vokse eller krympe. Xavier antar
            tanh-lignende. He doblar fordi ReLU «slår av» halvparten i snitt.
          </p>
        </section>

        <section id="clip" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Gradient clipping</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Praktisk hammer mot exploding gradient: kapp gradienten hvis den blir
            for stor før du oppdaterer vektene.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Norm-clipping (vanligst):
   g_norm = ||grad||₂
   if g_norm > max_norm:
       grad = grad · (max_norm / g_norm)

Verdi-clipping (cruder):
   grad = clip(grad, −c, c)   # element-vis

PyTorch:
   loss.backward()
   torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
   optimizer.step()

Vanlig i:
  - RNN/LSTM (svært utsatt for exploding).
  - Reinforcement learning.
  - Tilfeller der du ser sporadiske NaN-er.

Ikke en erstatning for god init og normalisering — men
billig forsikring som koster nesten ingenting.`}</pre>
          </div>
        </section>

        <section id="autograd" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">8. Autograd — slik gjør PyTorch det</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Du implementerer aldri backward pass for hånd i moderne rammeverk.
            PyTorch bygger beregningsgrafen dynamisk når du kjører forward, og kjører
            backward med ett kall.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`import torch

# requires_grad=True forteller autograd å spore dette
w = torch.tensor([0.5], requires_grad=True)
b = torch.tensor([0.0], requires_grad=True)
x = torch.tensor([1.0])
t = torch.tensor([1.0])

# Forward — PyTorch bygger grafen mens du regner
z = w * x + b
y = torch.sigmoid(z)
loss = (y - t) ** 2

# Backward — kjør én linje, autograd gjør hele kjernen
loss.backward()

print(w.grad)   # ∂loss/∂w
print(b.grad)   # ∂loss/∂b

# Manuell update
with torch.no_grad():
    w -= 0.1 * w.grad
    b -= 0.1 * b.grad
    w.grad.zero_()      # MÅ nullstilles — gradienter akkumulerer
    b.grad.zero_()`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Vi ser nærmere på autograd og training-loopen i{" "}
            <Link to="/stack/$slug" params={{ slug: "pytorch-tf" }} className="text-brand hover:underline">
              PyTorch &amp; TensorFlow
            </Link>
            .
          </p>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              Drag-oppgaver:{" "}
              <Link to="/drag" className="text-brand hover:underline">/drag</Link> → topic «Backpropagation».
            </li>
            <li>
              Når du forstår gradient-flyt, er{" "}
              <Link to="/stack/$slug" params={{ slug: "cnn" }} className="text-brand hover:underline">
                CNN
              </Link>{" "}
              neste naturlige steg — vekt-deling reduserer både parametere og
              gradient-problemer.
            </li>
          </ul>
        </div>
        <RelatedVisualizers slug="backprop" />
      </div>
    </StackPageShell>
  );
}
