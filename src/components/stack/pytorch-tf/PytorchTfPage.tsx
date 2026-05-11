import { Link } from "@tanstack/react-router";
import { Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";

const STEPS = [
  { title: "PyTorch vs TensorFlow — kort historikk", anchor: "historikk" },
  { title: "Tensors — felles primitiv", anchor: "tensors" },
  { title: "Autograd — automatisk derivasjon", anchor: "autograd" },
  { title: "nn.Module — slik defineres et nett", anchor: "module" },
  { title: "Full training-loop i PyTorch", anchor: "trainingloop" },
  { title: "Eager vs graph mode", anchor: "modes" },
  { title: "TensorFlow / Keras — kort", anchor: "tf" },
  { title: "Velg-tabell", anchor: "velg" },
];

export function PytorchTfPage() {
  return (
    <StackPageShell title="PyTorch & TensorFlow" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2502 · Dyp lærings-rammeverk
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            PyTorch &amp; TensorFlow — tensors, autograd og training-loops
          </h1>
          <p className="mt-3 text-muted-foreground">
            Du implementerer ikke backprop for hånd lenger. Rammeverkene gjør det for deg
            via autograd, og gir deg ferdige byggeklosser (konvolusjon, dropout, Adam).
            Her ser vi på hvordan PyTorch og TensorFlow likner og skiller seg — og
            hvilken du bør velge.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span> drag-oppgaver under topic
              «PyTorch/TF» i{" "}
              <Link to="/drag" className="text-brand hover:underline">/drag</Link>.
            </div>
          </div>
        </div>

        <CourseOutline courseId="pytorch-tf" steps={STEPS} />

        <section id="historikk" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. PyTorch vs TensorFlow — kort historikk</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`2015  TensorFlow 1.x lanseres (Google) — statisk graf, "define-then-run".
2016  PyTorch lanseres (Meta) — dynamisk graf, "define-by-run", pythonsk.
2017  Keras blir offisiell høy-nivå API for TF.
2019  TensorFlow 2.x — eager mode som default, mer pytorch-aktig.
2020+ PyTorch dominerer forskning. TF brukes mest i prod på Google-stack.
2022+ PyTorch 2.0 — torch.compile() gir TF-aktig graph optimization.

I dag:
  - Funksjonelt veldig like.
  - PyTorch er enklere å lære og debugge.
  - TF/Keras gir høyere abstraksjon (model.fit()), mer "batterier inkludert".
  - For DTE-2502 og forskning generelt: PyTorch er standardvalget.`}</pre>
          </div>
        </section>

        <section id="tensors" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Tensors — felles primitiv</h2>
          <p className="text-sm text-muted-foreground mb-3">
            En tensor er en n-dimensjonal array — som <code>numpy.ndarray</code>, men med
            to ekstra superkrefter: kan kjøres på GPU og kan spore gradienter.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`import torch

# Lage tensors
a = torch.tensor([1.0, 2.0, 3.0])         # shape (3,), dtype float32
b = torch.zeros(2, 3)                     # 2×3 nuller
c = torch.randn(2, 3)                     # normalfordelt random
d = torch.arange(0, 10).reshape(2, 5)     # 2×5

# Vanlige operasjoner — alle er vektoriserte
x = c + b                                 # element-vis
y = c @ d.float().T                       # matrise-multiplikasjon
z = c.sum(dim=0)                          # sum over rader → shape (3,)

# Form-manipulasjon
c.shape                                   # torch.Size([2, 3])
c.view(3, 2)                              # uten kopi
c.reshape(3, 2)                           # kopi hvis nødvendig
c.permute(1, 0)                           # bytt akser

# GPU
device = "cuda" if torch.cuda.is_available() else "cpu"
c = c.to(device)                          # flytt til GPU

# numpy-bro
a_np = a.cpu().numpy()                    # tensor → ndarray
t    = torch.from_numpy(a_np)             # ndarray → tensor (samme minne!)

# Kanal-konvensjon for bilder (PyTorch):
#   (Batch, Channels, Height, Width)  ← "NCHW"
# TensorFlow bruker:
#   (Batch, Height, Width, Channels)  ← "NHWC"`}</pre>
          </div>
        </section>

        <section id="autograd" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Autograd — automatisk derivasjon</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Autograd bygger en beregningsgraf dynamisk mens du gjør forward pass. Når du
            kaller <code>.backward()</code>, kjører den kjerne-regelen baklengs gjennom
            grafen og fyller <code>.grad</code> på hver tensor som krevde gradient.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`# Eksempel: deriver L = (w·x − t)² mhp. w
w = torch.tensor([2.0], requires_grad=True)
x = torch.tensor([3.0])
t = torch.tensor([5.0])

y    = w * x                # autograd: noterer "y = w · 3"
loss = (y - t) ** 2         # autograd: noterer "(y − 5)²"

loss.backward()             # regn ∂loss/∂w via kjerne-regelen
print(w.grad)               # tensor([6.]) — ∂L/∂w = 2(y−t)·x = 2·1·3 = 6

# Viktig: gradienter AKKUMULERES, ikke overskrives
# Derfor må du nullstille før neste backward:
w.grad.zero_()

# Slå AV autograd midlertidig (f.eks. ved inferens):
with torch.no_grad():
    pred = model(x_eval)            # ingen graf, mindre minne

# Detach — kutt en tensor fra grafen
x_const = x.detach()`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Akkumulering er <strong>by design</strong>: lar deg dele opp en stor batch i
            mindre mikrobatch-er, kalle <code>.backward()</code> for hver, og deretter ett
            <code> .step()</code> — «gradient accumulation» for å trene med større effektiv
            batch enn GPU-en tåler.
          </p>
        </section>

        <section id="module" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. nn.Module — slik defineres et nett</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Arv fra <code>nn.Module</code>, registrer lag i <code>__init__</code>, definér
            forward pass i <code>forward()</code>. Backward kommer gratis.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`import torch.nn as nn
import torch.nn.functional as F

class IrisMLP(nn.Module):
    def __init__(self, n_features=4, n_classes=3, hidden=16):
        super().__init__()
        self.fc1 = nn.Linear(n_features, hidden)
        self.fc2 = nn.Linear(hidden, hidden)
        self.fc3 = nn.Linear(hidden, n_classes)
        self.drop = nn.Dropout(0.2)

    def forward(self, x):
        x = F.relu(self.fc1(x))
        x = self.drop(x)
        x = F.relu(self.fc2(x))
        return self.fc3(x)              # logits — kombinér med CrossEntropyLoss

model = IrisMLP()

# Inspeksjon
print(model)
print(sum(p.numel() for p in model.parameters()))   # antall parametere
for name, p in model.named_parameters():
    print(name, p.shape)

# Mode-bytte (viktig for Dropout/BatchNorm)
model.train()                  # trening — dropout aktiv
model.eval()                   # evaluering — dropout AV, BN bruker running stats`}</pre>
          </div>
        </section>

        <section id="trainingloop" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Full training-loop i PyTorch</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Husk rekkefølgen — den er nesten alltid lik.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`import torch
from torch.utils.data import DataLoader

model     = IrisMLP().to(device)
optimizer = torch.optim.Adam(model.parameters(), lr=1e-3, weight_decay=1e-4)
loss_fn   = nn.CrossEntropyLoss()
scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=50)

train_loader = DataLoader(train_ds, batch_size=32, shuffle=True)
val_loader   = DataLoader(val_ds,   batch_size=64)

for epoch in range(50):
    # === TRAIN ===
    model.train()
    for X_batch, y_batch in train_loader:
        X_batch, y_batch = X_batch.to(device), y_batch.to(device)

        optimizer.zero_grad()         # 1. nullstill gradienter
        logits = model(X_batch)       # 2. forward
        loss   = loss_fn(logits, y_batch)
        loss.backward()               # 3. backward (autograd)
        optimizer.step()              # 4. oppdater vekter

    # === EVAL ===
    model.eval()
    correct = 0
    total   = 0
    with torch.no_grad():
        for X_batch, y_batch in val_loader:
            X_batch, y_batch = X_batch.to(device), y_batch.to(device)
            pred = model(X_batch).argmax(dim=1)
            correct += (pred == y_batch).sum().item()
            total   += y_batch.size(0)
    print(f"epoch {epoch}: val_acc={correct/total:.3f}")

    scheduler.step()                  # neste epoke — juster lr`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Fem trinn for hver batch:</strong> zero_grad → forward → loss →
            backward → step. Hvis du blander rekkefølgen får du tause feil (f.eks. å
            glemme zero_grad gjør at gradienter akkumulerer og loss blir kaos).
          </p>
        </section>

        <section id="modes" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Eager vs graph mode</h2>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-32">Egenskap</th>
                  <th className="text-left font-semibold px-4 py-2 w-48">Eager (define-by-run)</th>
                  <th className="text-left font-semibold px-4 py-2 w-48">Graph (define-then-run)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 text-muted-foreground">Hvem er default</td>
                  <td className="px-4 py-3 text-muted-foreground">PyTorch alltid. TF 2.x default.</td>
                  <td className="px-4 py-3 text-muted-foreground">TF 1.x. JAX. Opt-in i PyTorch via torch.compile().</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 text-muted-foreground">Når bygges grafen</td>
                  <td className="px-4 py-3 text-muted-foreground">Hver forward — dynamisk, hver iterasjon.</td>
                  <td className="px-4 py-3 text-muted-foreground">Først én gang, så kjøres optimalisert versjon.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 text-muted-foreground">Debugging</td>
                  <td className="px-4 py-3 text-muted-foreground">Veldig enkelt — vanlig Python, print, pdb.</td>
                  <td className="px-4 py-3 text-muted-foreground">Vanskelig — operasjoner kjøres lazy.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 text-muted-foreground">Ytelse</td>
                  <td className="px-4 py-3 text-muted-foreground">Litt tregere — overhead per op.</td>
                  <td className="px-4 py-3 text-muted-foreground">Raskere — fusion, planlegging, eksport.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 text-muted-foreground">Eksport (mobil, server)</td>
                  <td className="px-4 py-3 text-muted-foreground">Krever tracing → TorchScript/ONNX.</td>
                  <td className="px-4 py-3 text-muted-foreground">Naturlig — grafen er allerede separat artefakt.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 text-muted-foreground">Dynamiske strukturer (if/while)</td>
                  <td className="px-4 py-3 text-muted-foreground">Trivielt — Python kjører.</td>
                  <td className="px-4 py-3 text-muted-foreground">Kreves spesielle nodes (tf.cond, etc.).</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-3 rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`# PyTorch 2.0+ — kompiler ned til graph for ytelse:
model = torch.compile(model)            # transparent JIT-kompilering
# Resten av training-loopen er uendret.`}</pre>
          </div>
        </section>

        <section id="tf" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. TensorFlow / Keras — kort</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Keras er TF sin høy-nivå API. <code>model.fit()</code> erstatter hele
            training-loopen — kjapt i bruk for standard tilfeller.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`import tensorflow as tf
from tensorflow.keras import layers, Sequential

model = Sequential([
    layers.Dense(16, activation="relu", input_shape=(4,)),
    layers.Dropout(0.2),
    layers.Dense(16, activation="relu"),
    layers.Dense(3,  activation="softmax"),
])

model.compile(
    optimizer=tf.keras.optimizers.Adam(1e-3),
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"],
)

model.fit(X_train, y_train,
          epochs=50,
          batch_size=32,
          validation_data=(X_val, y_val),
          callbacks=[tf.keras.callbacks.EarlyStopping(patience=5,
                                                     restore_best_weights=True)])

eval_loss, eval_acc = model.evaluate(X_test, y_test)`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Keras er fint for prototyping og enkle modeller. Når du trenger custom
            training-loop, distribuert trening eller veldig spesielle arkitekturer er
            PyTorchs eksplisitthet ofte enklere.
          </p>
        </section>

        <section id="velg" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">8. Velg-tabell</h2>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-44">Situasjon</th>
                  <th className="text-left font-semibold px-4 py-2 w-32">Anbefalt</th>
                  <th className="text-left font-semibold px-4 py-2">Hvorfor</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 text-muted-foreground">Universitetskurs, forskning</td>
                  <td className="px-4 py-3 font-mono">PyTorch</td>
                  <td className="px-4 py-3 text-muted-foreground">Dominerer i akademisk litteratur. Lettere å debugge.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 text-muted-foreground">Rask prototype, kjent arkitektur</td>
                  <td className="px-4 py-3 font-mono">Keras / TF</td>
                  <td className="px-4 py-3 text-muted-foreground">model.fit() i 3 linjer. Mindre boilerplate.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 text-muted-foreground">Produksjon på mobil/edge</td>
                  <td className="px-4 py-3 font-mono">TF Lite / ONNX</td>
                  <td className="px-4 py-3 text-muted-foreground">TF har lengre prod-tooling-historikk. PyTorch eksporterer til ONNX.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 text-muted-foreground">Veldig stort distribuert</td>
                  <td className="px-4 py-3 font-mono">PyTorch DDP / FSDP</td>
                  <td className="px-4 py-3 text-muted-foreground">Standard for store transformer-treninger.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 text-muted-foreground">Funksjonell stil, TPU</td>
                  <td className="px-4 py-3 font-mono">JAX</td>
                  <td className="px-4 py-3 text-muted-foreground">Tredje kontender. Brukt mye av Google-forskning.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>For DTE-2502:</strong> bruk PyTorch. Det er det rammeverket pensum
            forholder seg til, og kunnskapen overføres umiddelbart til TF/Keras når
            du trenger det.
          </p>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              Drag-oppgaver:{" "}
              <Link to="/drag" className="text-brand hover:underline">/drag</Link> →
              topic «PyTorch/TF».
            </li>
            <li>
              Tilbake til{" "}
              <Link to="/stack/$slug" params={{ slug: "dte-2502" }} className="text-brand hover:underline">
                DTE-2502-huben
              </Link>{" "}
              for å se hvordan dette henger sammen med resten av kurset.
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
