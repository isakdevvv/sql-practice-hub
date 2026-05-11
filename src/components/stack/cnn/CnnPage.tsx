import { Link } from "@tanstack/react-router";
import { Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";

const STEPS = [
  { title: "Hvorfor CNN — vekt-deling", anchor: "hvorfor" },
  { title: "Konvolusjon — operasjonen", anchor: "conv" },
  { title: "Stride, padding & output-størrelse", anchor: "stride" },
  { title: "Pooling-lag", anchor: "pool" },
  { title: "Typisk CNN-arkitektur", anchor: "arkitektur" },
  { title: "Klassiske arkitekturer: LeNet → ResNet", anchor: "klassisk" },
  { title: "Parameter-telling", anchor: "params" },
  { title: "PyTorch-implementasjon (CIFAR-10)", anchor: "kode" },
];

export function CnnPage() {
  return (
    <StackPageShell title="Konvolusjonsnett (CNN)" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2502 · Convolutional Neural Networks
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            CNN — konvolusjonsnett for bilder
          </h1>
          <p className="mt-3 text-muted-foreground">
            En fully connected MLP på 224×224-bilder har 150 528 inputs i første lag —
            millioner av vekter, overfitter umiddelbart. CNN bytter ut «alle-til-alle»
            med <strong>lokale filtre som deles over hele bildet</strong>. Færre parametere,
            translasjons-invarians, og hierarkiske trekk (kanter → former → objekter).
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span> drag-oppgaver under topic
              «CNN» i{" "}
              <Link to="/drag" className="text-brand hover:underline">/drag</Link>.
            </div>
          </div>
        </div>

        <CourseOutline courseId="cnn" steps={STEPS} />

        <section id="hvorfor" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Hvorfor CNN — vekt-deling</h2>
          <p className="text-sm text-muted-foreground mb-3">
            En MLP behandler hver piksel som en uavhengig feature. Det betyr:
          </p>
          <ul className="space-y-2 text-sm mb-4">
            <li className="rounded-lg border border-border bg-card p-3">
              Den lærer ingenting fra at piksler nær hverandre er korrelerte.
            </li>
            <li className="rounded-lg border border-border bg-card p-3">
              En katt sentrert i bildet og en katt i hjørnet er to forskjellige problemer.
            </li>
            <li className="rounded-lg border border-border bg-card p-3">
              Antall parametere i første lag = piksler × hidden — ofte titalls millioner.
            </li>
          </ul>
          <p className="text-sm text-muted-foreground">
            CNN bruker tre prinsipper for å løse dette:
          </p>
          <div className="rounded-xl border border-border bg-card p-5 mt-2">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`1. Lokale receptive fields:
     hver utgangs-piksel ser bare et lite vindu (f.eks. 3×3).

2. Vekt-deling (parameter sharing):
     samme filter brukes overalt i bildet. Et "kant-detektor"-filter
     trenger ikke læres på nytt for hver posisjon.

3. Hierarki:
     stable mange konvolusjons-lag → tidlige lag lærer kanter,
     mellomste lag lærer former (øre, øye), senere lag lærer
     objekter (katt, hund).`}</pre>
          </div>
        </section>

        <section id="conv" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Konvolusjon — operasjonen</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Et <strong>filter</strong> (også kalt «kernel») er en liten matrise med
            lærbare vekter. Vi skyver det over bildet, og for hver posisjon regner ut
            element-vis multiplikasjon + sum.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Input (5×5) — gråtonebilde:
   1 1 1 0 0
   0 1 1 1 0
   0 0 1 1 1
   0 0 1 1 0
   0 1 1 0 0

Filter (3×3) — diagonal-detektor:
   1 0 0
   0 1 0
   0 0 1

Output[0,0] = 1·1 + 1·0 + 1·0
            + 0·0 + 1·1 + 1·0
            + 0·0 + 0·0 + 1·1
            = 3                  ← stor verdi = "diagonal her"

Output[0,1] = 1·1 + 1·0 + 0·0
            + 1·0 + 1·1 + 1·0
            + 0·0 + 1·0 + 1·1
            = 3
...

For et 5×5 input og 3×3 filter med stride 1, ingen padding:
   output-størrelse = (5 − 3 + 1) = 3 → 3×3 output.

Filtre brukes per fargekanal. For RGB:
   input  shape: (H, W, 3)
   filter shape: (k, k, 3)         ← samme dybde som input
   output:        (H', W')         ← summeres på tvers av kanaler

Antall filtre = antall output-kanaler i neste lag.`}</pre>
          </div>
        </section>

        <section id="stride" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Stride, padding &amp; output-størrelse</h2>
          <p className="text-sm text-muted-foreground mb-3">
            To hyperparametere kontrollerer hvordan filteret beveger seg og hva som skjer
            ved kantene.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Stride s = antall piksler filteret hopper per steg.
  s = 1 → tett konvolusjon, output ≈ input-størrelse.
  s = 2 → halverer output-dim. Brukes for nedsampling (alt. til pooling).

Padding p = ringer med nuller rundt input.
  "valid"  padding = 0  → output krymper.
  "same"   padding = (k−1)/2 → output bevarer input-størrelse for s=1.

Output-formel (for én dimensjon):
       ⌊ (W + 2p − k) / s ⌋ + 1

Eksempler:
  W=32, k=3, p=0, s=1  →  (32 − 3) / 1 + 1 = 30
  W=32, k=3, p=1, s=1  →  (32 + 2 − 3)/1 + 1 = 32   ← "same"
  W=32, k=3, p=0, s=2  →  (32 − 3)/2 + 1   = 15     ← nedsampling
  W=32, k=5, p=2, s=1  →  (32 + 4 − 5)/1 + 1 = 32   ← "same" for k=5`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Praktisk regel:</strong> bruk «same» padding med stride 1 i tidlige
            lag for å bevare spatial info, og reduser dimensjon enten med stride 2 eller
            pooling. k=3 er nesten alltid default (lite filter, stabel mange).
          </p>
        </section>

        <section id="pool" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Pooling-lag</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Pooling nedsampler feature-mapet — vi mister litt presisjon, men sparer
            kompute og får translasjons-invarians. Pooling har <strong>ingen lærbare
            parametere</strong>.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Max pooling 2×2, stride 2:

   1 3 │ 2 4         ← ta max i hvert 2×2-vindu
   5 6 │ 1 2     →   ┌────────┐
   ────┼────         │ 6   4  │   (max(1,3,5,6), max(2,4,1,2))
   3 1 │ 2 9         │ 7   9  │   (max(3,1,7,8), max(2,9,4,3))
   7 8 │ 4 3         └────────┘

Average pooling — samme idé, men gjennomsnitt i stedet for max.

Global average pooling (GAP):
  Tar gjennomsnitt over hele H×W per kanal → én verdi per kanal.
  Erstatter ofte FC-lag før klassifikasjons-head i moderne CNN.

Når brukes max vs avg?
  Max  — vanligst. Bevarer skarpe trekk (kanter).
  Avg  — glatter ut. Brukt i GAP og noen sjeldne lag.`}</pre>
          </div>
        </section>

        <section id="arkitektur" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Typisk CNN-arkitektur</h2>
          <p className="text-sm text-muted-foreground mb-3">
            CNN-er følger nesten alltid samme mal: vekselvis konvolusjon + nedsampling,
            så et lite klassifiserings-head på toppen.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`MNIST-style (28×28 gråtonebilde, 10 klasser):

   Input         (28, 28, 1)
   Conv 3×3, 32  ReLU       → (28, 28, 32)    "same" padding
   MaxPool 2×2              → (14, 14, 32)
   Conv 3×3, 64  ReLU       → (14, 14, 64)
   MaxPool 2×2              → (7,  7,  64)
   Flatten                  → (3136,)
   Dense 128     ReLU       → (128,)
   Dense 10      softmax    → (10,)            klasse-sannsynligheter

Mønsteret:
  - Tidlige lag: HØY oppløsning, FÅ kanaler.
  - Senere lag:  LAV oppløsning, MANGE kanaler.
  - Flatten → Dense → softmax på toppen.

Hvorfor flere kanaler dypere?
  Tidlige features er enkle (kanter) — få typer.
  Senere features er rikere (øre, øye, hjul) — flere typer.`}</pre>
          </div>
        </section>

        <section id="klassisk" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Klassiske arkitekturer: LeNet → ResNet</h2>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-28">Arkitektur</th>
                  <th className="text-left font-semibold px-4 py-2 w-20">År</th>
                  <th className="text-left font-semibold px-4 py-2">Nøkkel-idé</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono">LeNet-5</td>
                  <td className="px-4 py-3 text-muted-foreground">1998</td>
                  <td className="px-4 py-3 text-muted-foreground">Første moderne CNN. 2 conv + 2 FC. Brukt på MNIST/sifre på sjekker.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono">AlexNet</td>
                  <td className="px-4 py-3 text-muted-foreground">2012</td>
                  <td className="px-4 py-3 text-muted-foreground">Vant ImageNet med stor margin. ReLU + dropout + GPU. Startet dyp-lærings-bølgen.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono">VGG-16</td>
                  <td className="px-4 py-3 text-muted-foreground">2014</td>
                  <td className="px-4 py-3 text-muted-foreground">Bare 3×3-filtre, dypere. Enkel, regelmessig, fortsatt brukt som backbone.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono">GoogLeNet</td>
                  <td className="px-4 py-3 text-muted-foreground">2014</td>
                  <td className="px-4 py-3 text-muted-foreground">Inception-moduler — parallelle konvolusjoner med forskjellig kjerne-størrelse.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono">ResNet-50/152</td>
                  <td className="px-4 py-3 text-muted-foreground">2015</td>
                  <td className="px-4 py-3 text-muted-foreground">Skip-connections (residual) løste vanishing gradient → 152 lag mulig. Standard backbone i dag.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono">EfficientNet</td>
                  <td className="px-4 py-3 text-muted-foreground">2019</td>
                  <td className="px-4 py-3 text-muted-foreground">Skalering av dybde/bredde/oppløsning sammen — bedre nøyaktighet per FLOP.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Det viktigste tricket:</strong> ResNets <code>y = F(x) + x</code> —
            skip-connections lar gradienten flyte rett gjennom nettet. Etter dette ble
            dybde nesten gratis.
          </p>
        </section>

        <section id="params" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Parameter-telling</h2>
          <p className="text-sm text-muted-foreground mb-3">
            En typisk eksamens-oppgave: regn ut hvor mange lærbare parametere et lag har.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Conv-lag:
  Parametere = (k_h · k_w · C_in + 1) · C_out

  +1 er bias per output-kanal.

Eksempel:
  Input: (32, 32, 3)
  Filter: 3×3, 64 ut-kanaler
  Params = (3 · 3 · 3 + 1) · 64 = (27 + 1) · 64 = 1 792

Sammenlign med fully connected på samme dim:
  FC fra 32·32·3 = 3072 til 64 = 3072 · 64 + 64 = 196 672

  → CNN bruker ~110× færre parametere!

Dense / FC-lag:
  Parametere = n_in · n_out + n_out

  Flatten fra (7, 7, 64) til Dense 128:
  Params = 3136 · 128 + 128 = 401 536    ← Flatten-→-Dense er DYR

Pooling: 0 parametere.
ReLU/sigmoid: 0 parametere.
BatchNorm: 2 · C parametere (γ og β per kanal).`}</pre>
          </div>
        </section>

        <section id="kode" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">8. PyTorch-implementasjon (CIFAR-10)</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Et minimalt eksempel — CIFAR-10 (32×32 RGB, 10 klasser).
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`import torch
import torch.nn as nn
import torch.nn.functional as F

class TinyCnn(nn.Module):
    def __init__(self, num_classes=10):
        super().__init__()
        self.conv1 = nn.Conv2d(3,  32, kernel_size=3, padding=1)   # 32×32×32
        self.conv2 = nn.Conv2d(32, 64, kernel_size=3, padding=1)   # 16×16×64
        self.conv3 = nn.Conv2d(64, 128, kernel_size=3, padding=1)  # 8×8×128
        self.pool  = nn.MaxPool2d(2, 2)
        self.fc1   = nn.Linear(128 * 4 * 4, 256)
        self.fc2   = nn.Linear(256, num_classes)
        self.drop  = nn.Dropout(0.3)

    def forward(self, x):
        x = self.pool(F.relu(self.conv1(x)))   # 32→16
        x = self.pool(F.relu(self.conv2(x)))   # 16→8
        x = self.pool(F.relu(self.conv3(x)))   # 8 →4
        x = x.flatten(1)                       # (B, 128·4·4)
        x = F.relu(self.fc1(x))
        x = self.drop(x)
        return self.fc2(x)                     # logits — bruk CrossEntropyLoss

model = TinyCnn()
print(sum(p.numel() for p in model.parameters()))   # antall parametere`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            CIFAR-10 har 60 000 bilder fordelt på 10 klasser. En enkel CNN som denne
            når 70–80 % accuracy. ResNet med data augmentation når ~95 %.
          </p>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/stack/$slug" params={{ slug: "regularisering" }} className="text-brand hover:underline">
                Regularisering
              </Link>{" "}
              — hvordan dropout og batch norm gjør CNN-er stabile og generaliserer bedre.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "optimering" }} className="text-brand hover:underline">
                Optimerere
              </Link>{" "}
              — Adam er nesten alltid riktig valg for CNN-er på små datasett.
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
