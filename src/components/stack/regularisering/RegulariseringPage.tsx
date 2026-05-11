import { Link } from "@tanstack/react-router";
import { Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";

const STEPS = [
  { title: "Hvorfor regularisere?", anchor: "hvorfor" },
  { title: "Dropout", anchor: "dropout" },
  { title: "Batch normalization", anchor: "bn" },
  { title: "Weight decay (L2)", anchor: "decay" },
  { title: "Early stopping", anchor: "early" },
  { title: "Data augmentation", anchor: "aug" },
  { title: "Hvilken kombinasjon brukes typisk?", anchor: "kombo" },
];

export function RegulariseringPage() {
  return (
    <StackPageShell title="Regularisering" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2502 · Regularisering i dyp læring
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Regularisering — hvordan unngå overfitting i dype nett
          </h1>
          <p className="mt-3 text-muted-foreground">
            Et stort nett kan i prinsippet «huske» hele treningssettet (zero training
            loss) og likevel være ubrukelig på nye data. Regularisering er
            samle-betegnelsen på alle teknikkene som tvinger modellen til å
            generalisere — fra dropout og batch norm til data augmentation.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span> drag-oppgaver under topic
              «Regularisering (NN)» i{" "}
              <Link to="/drag" className="text-brand hover:underline">/drag</Link>.
            </div>
          </div>
        </div>

        <CourseOutline courseId="regularisering" steps={STEPS} />

        <section id="hvorfor" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Hvorfor regularisere?</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Et nett med mange parametere har enorm kapasitet. Hvis treningssettet er
            lite (eller bare ikke representativt nok), vil modellen lære <strong>støy
            i treningsdataene</strong> i stedet for det underliggende mønsteret.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Typisk symptom — overfitting:

  loss
   │       train ─────────────╲
   │                            ╲___________
   │                            ╲
   │       val   ───╲          /
   │                 ╲________/
   │                          ↑
   └──────────────────────────────── epoch
                              overfit starter her

  - Train-loss synker stadig.
  - Val-loss flater, deretter STIGER → overfitting.
  - Gapet mellom train og val vokser.

Regulariserings-strategi:
  1. Mer data (alltid best, hvis du kan).
  2. Mindre/enklere modell.
  3. Dropout — tilfeldig drep nevroner i trening.
  4. Batch norm — stabiliserer + svak regularisering.
  5. Weight decay — straff store vekter.
  6. Early stopping — stopp før val-loss stiger.
  7. Data augmentation — generér «nye» eksempler.`}</pre>
          </div>
        </section>

        <section id="dropout" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Dropout</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Under trening: sett tilfeldige andel av nevronene til 0. Under inferens: bruk
            alle, men skaler. Hindrer co-adaptasjon — nevroner kan ikke stole på at en
            spesifikk «kamerat» alltid er der.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Forward i trening med dropout-rate p = 0.5:

   h    = [0.8, 1.2, 0.3, 2.0, 0.5]
   mask = [1,   0,   1,   0,   1  ]      ← Bernoulli(1−p)
   h'   = h · mask / (1−p)
        = [1.6, 0,   0.6, 0,   1.0]      ← "inverted dropout"

   /(1−p) gjør at FORVENTET aktivering er den samme som
   uten dropout → ingen ekstra skalering trengs på inferens.

I PyTorch:
   self.drop = nn.Dropout(0.5)

   def forward(self, x):
       x = F.relu(self.fc1(x))
       x = self.drop(x)                  ← aktiv KUN i .train() mode
       return self.fc2(x)

Anbefalt:
  - Plasser etter aktivering i FC-lag.
  - 0.2–0.5 i FC. Mindre (0.1–0.2) i conv.
  - IKKE etter siste lag før softmax.
  - Slå av ved evaluering: model.eval() — PyTorch gjør det selv.`}</pre>
          </div>
        </section>

        <section id="bn" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Batch normalization</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Normaliserer aktiveringene per mini-batch til mean 0 / std 1, så multipliserer
            med lærbare <code>γ</code> og legger til <code>β</code>. Stabiliserer trening,
            tillater større learning rate, virker som svak regularisering.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Per batch, per kanal/feature:
   μ_B  = mean over batch
   σ²_B = var over batch
   x̂   = (x − μ_B) / sqrt(σ²_B + ε)
   y    = γ · x̂ + β              ← γ og β læres

I trening:
   bruker batch-statistikkene.
I inferens:
   bruker running average av μ og σ² som ble samlet i trening.

Effekter:
  ✓ Mye raskere konvergens — kan ofte 10× learning rate.
  ✓ Mindre følsom for vekt-init.
  ✓ Lett regulariserende (noise fra batch-statistikk).
  ✗ Krever batch_size ≥ ~16 for stabile statistikker.
    Alternativer for små batches: LayerNorm, GroupNorm.

Plassering i CNN:
   Conv → BN → ReLU → ...
                (BN MELLOM conv og ReLU — moderne konsensus).`}</pre>
          </div>
        </section>

        <section id="decay" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Weight decay (L2)</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Legg en straff på størrelsen av vektene direkte i loss-funksjonen. Tvinger
            modellen til å foretrekke små vekter — som ofte gir glattere beslutningsgrenser
            og bedre generalisering.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`L2-regularisering (a.k.a. weight decay):

   L_total = L_data + λ · ||w||²
                       └─ summen av kvadrerte vekter

   ∂L_total/∂w = ∂L_data/∂w + 2λw

   Update: w ← w − lr·(∂L_data/∂w + 2λw)
                                       └─ "drar" w mot 0 hver step

I PyTorch (gratis via optimizer):
   optimizer = torch.optim.Adam(model.parameters(),
                                lr=1e-3,
                                weight_decay=1e-4)

Typiske verdier: 1e-5 til 1e-3.

L1 (sparsity) vs L2 (smooth):
   L1: λ · Σ|w|    → driver mange vekter EKSakt til 0.
   L2: λ · Σ w²    → krymper alle vekter mot 0, men ikke helt.
   L2 er default i dyp læring.

Merk: AdamW separerer weight decay fra gradient-oppdateringen
       og er ofte bedre enn Adam + weight_decay direkte.`}</pre>
          </div>
        </section>

        <section id="early" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Early stopping</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Mål validation loss hver epoke. Stopp trening når val-loss ikke har bedret seg
            på N epoker. Restaurér beste vekter.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Pseudokode:

   best_val_loss = ∞
   best_weights  = None
   patience      = 5
   wait          = 0

   for epoch in range(max_epochs):
       train_one_epoch(...)
       val_loss = evaluate(val_loader)

       if val_loss < best_val_loss:
           best_val_loss = val_loss
           best_weights  = copy(model.state_dict())
           wait = 0
       else:
           wait += 1
           if wait >= patience:
               break          ← stopper trening

   model.load_state_dict(best_weights)

Fordel:
  - Trenger ikke gjette antall epoker — la modellen bestemme.
  - "Gratis" — krever bare en val-løkke du allerede gjør.

Vanlig kombinert med:
  - Learning rate scheduler som reduserer lr ved plateau.
  - Sjekkpunkt på disk — restaurér uten å holde i RAM.`}</pre>
          </div>
        </section>

        <section id="aug" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Data augmentation</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Lag «syntetiske» nye treningseksempler ved å bruke transformasjoner som
            bevarer label. Spesielt kritisk for bilder med små datasett.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Vanlige transforms for bilder (torchvision.transforms):

   RandomHorizontalFlip()              speilvend horisontalt
   RandomCrop(32, padding=4)           tilfeldig utsnitt
   RandomRotation(15)                  ±15° rotasjon
   ColorJitter(0.2, 0.2, 0.2)          farge/lysstyrke-variasjon
   RandomErasing(p=0.1)                "klipp ut" tilfeldig rektangel
   Normalize(mean, std)                z-score per kanal

   transform = transforms.Compose([
       transforms.RandomHorizontalFlip(),
       transforms.RandomCrop(32, padding=4),
       transforms.ToTensor(),
       transforms.Normalize((0.5,)*3, (0.5,)*3),
   ])

Hvorfor virker det?
  Du later som du har mye mer data enn du har.
  Modellen ser bildet i mange former → tvinges til
  å lære egenskapen "katt", ikke "katt presis i denne posisjonen".

Viktig:
  ✗ IKKE bruk augmentation på val/test-sett.
  ✗ IKKE flip horisontalt på asymmetriske ting (tekst, '6' vs '9').
  ✓ Skreddersy augmentation til doménet (medisinsk vs naturbilde).

Avanserte:
  - Mixup: blande to bilder + labels.
  - CutMix: lim inn et patch fra ett bilde i et annet.
  - AutoAugment: lær augmenterings-policy automatisk.`}</pre>
          </div>
        </section>

        <section id="kombo" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Hvilken kombinasjon brukes typisk?</h2>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-44">Modell-type</th>
                  <th className="text-left font-semibold px-4 py-2">Typisk regulariserings-stack</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono">Liten MLP (Iris-størrelse)</td>
                  <td className="px-4 py-3 text-muted-foreground">Bare weight decay + early stopping. Dropout overkill.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono">FC-nett på tabulær</td>
                  <td className="px-4 py-3 text-muted-foreground">Dropout 0.2–0.5 + weight decay + early stopping.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono">CNN (CIFAR-10)</td>
                  <td className="px-4 py-3 text-muted-foreground">BatchNorm + data aug + weight decay. Lite dropout i conv.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono">Stor CNN/ResNet på ImageNet</td>
                  <td className="px-4 py-3 text-muted-foreground">BN + tung data aug + weight decay + LR schedule + label smoothing.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono">Transformer</td>
                  <td className="px-4 py-3 text-muted-foreground">LayerNorm (alltid), Dropout 0.1, AdamW, warmup + cosine schedule.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Tommelfingerregel:</strong> begynn med batch norm + weight decay +
            early stopping. Hvis val-loss fortsatt stiger over train-loss: legg på
            dropout. Hvis du har lite data: legg på data augmentation FØR du gjør modellen
            mindre.
          </p>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/stack/$slug" params={{ slug: "optimering" }} className="text-brand hover:underline">
                Optimerere
              </Link>{" "}
              — Adam, SGD med momentum, learning rate schedules.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "pytorch-tf" }} className="text-brand hover:underline">
                PyTorch &amp; TensorFlow
              </Link>{" "}
              — slik kobles regularisering inn i training-loopen.
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
