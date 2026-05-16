import { Link } from "@tanstack/react-router";
import { Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { GradientDescentVisualizer } from "@/components/stack/optimering/GradientDescentVisualizer";

const STEPS = [
  { title: "Visualisering — gradient descent live", anchor: "visualisering" },
  { title: "SGD — utgangspunktet", anchor: "sgd" },
  { title: "Momentum", anchor: "momentum" },
  { title: "Adaptiv lr — RMSProp & Adam", anchor: "adam" },
  { title: "Learning rate — den viktigste hyper", anchor: "lr" },
  { title: "Learning rate schedules", anchor: "schedule" },
  { title: "Gradient clipping", anchor: "clip" },
  { title: "Velg-tabell — hvilken optimizer når?", anchor: "velg" },
];

export function OptimeringPage() {
  return (
    <StackPageShell title="Optimerere & learning rate" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2502 · NN-optimering
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Optimerere &amp; learning rate — det som faktisk gjør at modellen konvergerer
          </h1>
          <p className="mt-3 text-muted-foreground">
            Du kjenner grunn-gradient descent fra nn-intro. Her ser vi hvorfor ren SGD
            sjelden er nok, hvordan momentum og Adam akselererer, og hvordan learning rate
            schedules brukes i praksis.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span> drag-oppgaver under topic
              «NN-optimering» i{" "}
              <Link to="/drag" className="text-brand hover:underline">/drag</Link>.
            </div>
          </div>
        </div>

        <CourseOutline courseId="optimering" steps={STEPS} />

        <section id="visualisering" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">
            0. Visualisering — gradient descent live
          </h2>
          <p className="text-sm text-muted-foreground mb-3">
            Før vi går inn i formlene: lek litt med selve mekanismen. Skru på α,
            flytt startpunktet, se hvordan GD finner bunnen — eller ikke finner
            den når α er for høy. Sammenlikn ren GD med momentum og Adam på
            samme ill-conditioned bowl.
          </p>
          <GradientDescentVisualizer />
        </section>

        <section id="sgd" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. SGD — utgangspunktet</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Stochastic Gradient Descent: bruk gradient fra én (eller en mini-batch)
            sample i stedet for hele datasettet. Billig per steg, men støyete.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Full batch GD (for referanse):
   for each epoch:
       g = ∇L over hele datasettet
       w ← w − lr · g
   → glatt, men dyrt og treffer lokale minima lett.

Mini-batch SGD (standard i dag):
   for each batch B in dataloader:
       g = ∇L over batch B
       w ← w − lr · g
   → støyete gradient, men:
       ✓ billig per steg
       ✓ støy hjelper å hoppe ut av flate/saddel-punkter
       ✓ passer på GPU (parallellisert per batch)

Ulemper med ren SGD:
   - Treg i daler hvor en akse er bratt og en flat
     (sik-sak-bevegelse istedet for fart mot bunnen).
   - Veldig følsom for valg av learning rate.`}</pre>
          </div>
        </section>

        <section id="momentum" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Momentum</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Tenk på vektene som en ball som ruller. Momentum tar med litt av forrige
            steg, slik at ballen får fart i konsistente retninger og demper sik-sak.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`SGD med momentum:
   v ← β · v + (1−β) · g     (eller: v ← β·v + g, avhengig av konvensjon)
   w ← w − lr · v

   β = "momentum-koeffisient", typisk 0.9.

   v er et eksponentielt glidende snitt av siste gradienter.
   Hvis gradienter peker konsekvent samme retning → v vokser → større skritt.
   Hvis de svinger → de kanselleres → mindre skritt.

Nesterov-momentum (en variant):
   "Se litt fram før du regner gradient" — i praksis litt bedre konvergens.
   Aktiveres i PyTorch: optim.SGD(..., momentum=0.9, nesterov=True)

I PyTorch:
   optimizer = torch.optim.SGD(model.parameters(),
                               lr=0.01,
                               momentum=0.9,
                               weight_decay=5e-4)`}</pre>
          </div>
        </section>

        <section id="adam" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Adaptiv lr — RMSProp &amp; Adam</h2>
          <p className="text-sm text-muted-foreground mb-3">
            En enkelt global learning rate er en kompromiss — noen parametere trenger
            store skritt, andre små. RMSProp og Adam justerer effektiv lr per parameter
            basert på historiske gradient-størrelser.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`RMSProp:
   s ← β · s + (1−β) · g²              ← eksponentielt snitt av g²
   w ← w − lr · g / (sqrt(s) + ε)

   → store-gradient-parametere får automatisk MINDRE skritt.
   → små-gradient-parametere får RELATIVT større skritt.

Adam = momentum + RMSProp:
   m ← β₁·m + (1−β₁)·g                ← 1. moment (gradient)
   s ← β₂·s + (1−β₂)·g²               ← 2. moment (gradient²)
   m̂ = m / (1 − β₁ᵗ)                  ← bias-korreksjon
   ŝ = s / (1 − β₂ᵗ)
   w ← w − lr · m̂ / (sqrt(ŝ) + ε)

   Defaults: β₁=0.9, β₂=0.999, ε=1e-8, lr=1e-3.

I PyTorch:
   optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)
   optimizer = torch.optim.AdamW(model.parameters(),
                                 lr=1e-3,
                                 weight_decay=1e-2)   ← som regel bedre

Egenskaper:
   ✓ Robust default — konvergerer ofte uten tuning.
   ✓ Fungerer godt i lite-data og non-convex landskap.
   ✗ Kan generalisere litt dårligere enn SGD+momentum på store CV-datasett.
   ✗ Bruker 2× minne (lagrer m og s per parameter).`}</pre>
          </div>
        </section>

        <section id="lr" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Learning rate — den viktigste hyper</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Hvis du bare skal tune én ting: tune learning rate. Alt annet er sekundært.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Symptomer på feil lr:

   For HØYT:
     - Loss blir NaN.
     - Loss hopper opp og ned uten å synke.
     - Train-loss synker, så plutselig divergerer.

   For LAVT:
     - Loss synker MYE saktere enn forventet.
     - Modellen sitter fast i tidlig "platau".
     - Tusenvis av epoker for å lære enkle ting.

   Sweet spot:
     - Loss synker jevnt og stabilt.
     - Til slutt platår på et lavt nivå.

Typiske defaults:
   Adam:   1e-3
   AdamW:  1e-3
   SGD:    1e-2 (eller høyere for CNN)
   Transformers ofte: 1e-4 til 5e-4 med warmup.

"Learning rate range test" (Smith):
   Start lr meget lavt (1e-7), øk eksponentielt i én epoke.
   Plot loss vs lr. Pek på "stupet" der loss begynner å falle bratt
   → vinn-LR ligger litt UNDER stupets bunn.`}</pre>
          </div>
        </section>

        <section id="schedule" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Learning rate schedules</h2>
          <p className="text-sm text-muted-foreground mb-3">
            En konstant lr er sjelden optimal. Ofte vil du starte stort (utforske raskt)
            og senke etter hvert (finjustere).
          </p>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-40">Schedule</th>
                  <th className="text-left font-semibold px-4 py-2">Profil & når brukes</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono">StepLR</td>
                  <td className="px-4 py-3 text-muted-foreground">Halver lr hver N epoker. Enkel, robust default.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono">CosineAnnealing</td>
                  <td className="px-4 py-3 text-muted-foreground">Glatt cosinus-kurve ned mot 0. Veldig populær for CNN.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono">ReduceLROnPlateau</td>
                  <td className="px-4 py-3 text-muted-foreground">Reduser lr når val-loss stagnerer. Adaptiv, ingen schedule å justere.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono">Warmup + decay</td>
                  <td className="px-4 py-3 text-muted-foreground">Start liten, øk lineært i N steg, så cosinus ned. Standard for transformers.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono">OneCycleLR</td>
                  <td className="px-4 py-3 text-muted-foreground">Smith: gå opp, så ned, så veldig ned. Rask konvergens.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-3 rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`# Eksempel: cosine annealing i PyTorch
scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(
    optimizer, T_max=num_epochs
)

for epoch in range(num_epochs):
    train_one_epoch(...)
    scheduler.step()                 ← kall etter hver epoke
    # eller scheduler.step() etter hver batch — sjekk dokumentasjon`}</pre>
          </div>
        </section>

        <section id="clip" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Gradient clipping</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Kort repetisjon fra{" "}
            <Link to="/stack/$slug" params={{ slug: "backprop-dyp" }} className="text-brand hover:underline">
              backprop-dyp
            </Link>
            : kapp gradient-normen før <code>optimizer.step()</code>.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`optimizer.zero_grad()
loss.backward()
torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
optimizer.step()

Når:
  ✓ RNN/LSTM — alltid.
  ✓ Reinforcement learning — ofte.
  ✓ Du ser sporadiske NaN-er i loss.
  ✗ Ikke et substitutt for fornuftig lr — bare en sikkerhetslinje.`}</pre>
          </div>
        </section>

        <section id="velg" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Velg-tabell — hvilken optimizer når?</h2>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-32">Situasjon</th>
                  <th className="text-left font-semibold px-4 py-2 w-48">Anbefalt</th>
                  <th className="text-left font-semibold px-4 py-2">Hvorfor</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 text-muted-foreground">Nytt prosjekt, ikke tid</td>
                  <td className="px-4 py-3 font-mono">Adam, lr=1e-3</td>
                  <td className="px-4 py-3 text-muted-foreground">Sikkert default. Trenger sjelden tuning for å funke.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 text-muted-foreground">CNN, mye data (ImageNet)</td>
                  <td className="px-4 py-3 font-mono">SGD + momentum 0.9 + cosine</td>
                  <td className="px-4 py-3 text-muted-foreground">Generaliserer ofte litt bedre enn Adam, men krever tuning.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 text-muted-foreground">Transformer / NLP</td>
                  <td className="px-4 py-3 font-mono">AdamW + warmup + cosine</td>
                  <td className="px-4 py-3 text-muted-foreground">Standard. Weight decay er viktig for store modeller.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 text-muted-foreground">RNN / LSTM</td>
                  <td className="px-4 py-3 font-mono">Adam + grad clipping</td>
                  <td className="px-4 py-3 text-muted-foreground">Adaptiv lr hjelper. Clip mot exploding.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 text-muted-foreground">Lite datasett, tabulær</td>
                  <td className="px-4 py-3 font-mono">Adam, lavere lr (1e-4)</td>
                  <td className="px-4 py-3 text-muted-foreground">Mindre fart for å unngå overfit i få epoker.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 text-muted-foreground">Veldig stor batch (1024+)</td>
                  <td className="px-4 py-3 font-mono">LAMB / LARS</td>
                  <td className="px-4 py-3 text-muted-foreground">Adam/SGD blir ustabile ved svært store batches.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Tommelfingerregel:</strong> AdamW er nesten alltid trygt og raskt.
            Bytt til SGD+momentum bare hvis du har tid til å tune og ønsker siste
            prosenter på et generaliserings-benchmark.
          </p>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/stack/$slug" params={{ slug: "pytorch-tf" }} className="text-brand hover:underline">
                PyTorch &amp; TensorFlow
              </Link>{" "}
              — slik skrives en komplett training loop med optimizer + scheduler.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "regularisering" }} className="text-brand hover:underline">
                Regularisering
              </Link>{" "}
              — weight decay er typisk en del av optimizeren.
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
