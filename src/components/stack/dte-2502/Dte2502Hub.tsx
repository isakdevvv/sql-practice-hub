import { Link } from "@tanstack/react-router";
import { ArrowRight, GitBranch, Image as ImageIcon, Shield, Gauge, Wrench } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";

type Course = {
  slug: string;
  title: string;
  shortDescription: string;
  Icon: typeof GitBranch;
  status: "ready" | "coming-soon";
};

const COURSES: Course[] = [
  {
    slug: "backprop-dyp",
    title: "Backpropagation — dypt",
    shortDescription:
      "Kjerne-regelen, beregningsgraf, vanishing/exploding gradient, He/Xavier-init. Bygger på perceptron-intuisjonen fra DTE-2602.",
    Icon: GitBranch,
    status: "ready",
  },
  {
    slug: "cnn",
    title: "Konvolusjonsnett (CNN)",
    shortDescription:
      "Convolution, pooling, stride/padding, parameter-deling. LeNet, AlexNet, ResNet — hvorfor de virker på bilder.",
    Icon: ImageIcon,
    status: "ready",
  },
  {
    slug: "regularisering",
    title: "Regularisering",
    shortDescription:
      "Dropout, batch normalization, weight decay, early stopping, data augmentation — slik unngår du overfitting i dyp læring.",
    Icon: Shield,
    status: "ready",
  },
  {
    slug: "optimering",
    title: "Optimerere & learning rate",
    shortDescription:
      "SGD, momentum, Adam, learning rate schedules, gradient clipping — det som faktisk gjør at modellen konvergerer.",
    Icon: Gauge,
    status: "ready",
  },
  {
    slug: "pytorch-tf",
    title: "PyTorch & TensorFlow",
    shortDescription:
      "Tensors, autograd, training loop. Eager vs graph mode. Hvilken skal du velge — og hvorfor.",
    Icon: Wrench,
    status: "ready",
  },
];

export function Dte2502Hub() {
  return (
    <StackPageShell title="DTE-2502 Neural Networks" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-10">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2502 · 10 stp · Dyplæring (oppfølger til DTE-2602)
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Neural Networks — dyplæring i praksis
          </h1>
          <p className="mt-3 text-muted-foreground max-w-2xl">
            Bygger på perceptron, backprop og gradient descent fra{" "}
            <Link to="/stack/$slug" params={{ slug: "nn-intro" }} className="text-brand hover:underline">
              /stack/nn-intro
            </Link>
            . Her går vi dypere: kjerne-regelen, CNN på bilder, regularisering, optimerere
            og rammeverkene PyTorch og TensorFlow.
          </p>
          <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
            <strong className="text-amber-700 dark:text-amber-400">Forutsetning:</strong>{" "}
            Du bør ha tatt{" "}
            <Link to="/stack/$slug" params={{ slug: "dte-2602" }} className="text-brand hover:underline">
              DTE-2602
            </Link>{" "}
            eller kjenne perceptron, forward/backward pass, MSE/cross-entropy, og hvordan
            gradient descent oppdaterer vekter. DTE-2502 gjentar IKKE disse temaene.
          </div>
        </div>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">NN-arkitektur-cheatsheet</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Hvilken arkitektur passer hvilken type input? Bruk dette som første sortering
            før du leser detaljene.
          </p>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-32">Arkitektur</th>
                  <th className="text-left font-semibold px-4 py-2 w-40">Best for</th>
                  <th className="text-left font-semibold px-4 py-2">Nøkkel-idé</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">MLP / FFN</td>
                  <td className="px-4 py-3 text-muted-foreground">Tabulær data, Iris-baseline</td>
                  <td className="px-4 py-3 text-muted-foreground">Fully connected lag — alle vekter er unike. Mange parametere.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">CNN</td>
                  <td className="px-4 py-3 text-muted-foreground">Bilder (MNIST, CIFAR), 1D-signaler</td>
                  <td className="px-4 py-3 text-muted-foreground">Lokale filtre + vekt-deling. Lærer kanter → former → objekter.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">RNN / LSTM</td>
                  <td className="px-4 py-3 text-muted-foreground">Sekvenser, tidsserier, tekst</td>
                  <td className="px-4 py-3 text-muted-foreground">Skjult tilstand bærer historikk. Sliter med lang kontekst.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">Transformer</td>
                  <td className="px-4 py-3 text-muted-foreground">Lang tekst, multimodalt, dagens SOTA</td>
                  <td className="px-4 py-3 text-muted-foreground">Self-attention — alle tokens ser hverandre samtidig. Parallelliserbart.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">Autoencoder</td>
                  <td className="px-4 py-3 text-muted-foreground">Anomalydeteksjon, kompresjon</td>
                  <td className="px-4 py-3 text-muted-foreground">Encoder → flaskehals → decoder. Lærer å gjenskape inputen.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">GAN / Diffusion</td>
                  <td className="px-4 py-3 text-muted-foreground">Generere bilder/lyd</td>
                  <td className="px-4 py-3 text-muted-foreground">To nett mot hverandre (GAN) eller progressiv støy-fjerning (diffusion).</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Velg-regel:</strong> bilder → CNN. Sekvens kort → RNN/LSTM. Sekvens lang
            eller dyr trening → Transformer. Tabulær → ofte gradient boosting (XGBoost)
            før du går nevralt. DTE-2502 fokuserer på <strong>MLP og CNN</strong>.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Curse of dimensionality — kort</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Hvorfor trenger vi CNN-er i det hele tatt? Fordi rå pikseldata er
            ekstremt høy-dimensjonal — og distanser, sampling og generalisering blir
            patologiske i høye dimensjoner.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Et 28×28 gråtonebilde: 784 features.
Et 224×224 RGB-bilde:   150 528 features.

Konsekvenser når d (antall features) vokser:
  - Volumet av rommet vokser eksponentielt → nesten alle punkter
    er "langt unna" hverandre. kNN, RBF, distanse-baserte metoder
    feiler.
  - Antall samples du trenger for å dekke rommet eksploderer.
  - En fully connected MLP får mange millioner vekter — overfit-
    ter umiddelbart på MNIST-størrelse data.

CNN-løsningen:
  - Vekt-deling (samme filter brukes overalt) → få parametere.
  - Lokale receptive fields → utnytter at piksler nær hverandre
    er korrelerte.
  - Translasjons-invarians → en katt er en katt uansett posisjon.`}</pre>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Mini-kurs</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {COURSES.map((c) => {
              const isReady = c.status === "ready";
              const Icon = c.Icon;
              if (!isReady) {
                return (
                  <div key={c.slug} className="rounded-xl border border-border bg-card/30 p-5 opacity-60">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <h3 className="font-semibold text-foreground leading-tight">{c.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{c.shortDescription}</p>
                  </div>
                );
              }
              return (
                <Link
                  key={c.slug}
                  to="/stack/$slug"
                  params={{ slug: c.slug }}
                  className="group rounded-xl border border-border bg-card hover:border-brand/40 p-5 transition-colors block"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-4 w-4 text-brand" />
                    <h3 className="font-semibold text-foreground leading-tight">{c.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{c.shortDescription}</p>
                  <div className="mt-3 flex items-center text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                    Åpne
                    <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Historisk linje — fra perceptron til transformer</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`1958  Perceptron (Rosenblatt) — én lineær neuron.
1969  Minsky & Papert: én perceptron klarer ikke XOR. AI-vinter.
1986  Rumelhart/Hinton/Williams: backpropagation publiseres bredt.
1989  LeNet (LeCun) — første CNN, sifre på konvolutter.
1998  LeNet-5 — moden CNN-arkitektur.
2006  "Deep belief networks" (Hinton). Pretraining gjør dypt mulig.
2012  AlexNet vinner ImageNet med stor margin — GPU + ReLU + dropout.
2014  VGG, GoogLeNet, GAN. Adam-optimaliseren publiseres.
2015  ResNet — skip-connections, 152 lag mulig.
2017  "Attention is all you need" — Transformer.
2018+ BERT, GPT-2/3/4, ViT — transformer dominerer alt.

Læringen for DTE-2502:
  - Dyp læring var mulig i prinsippet siden 1986.
  - Det som gjorde det praktisk: GPU-er, store datasett (ImageNet),
    bedre init (He/Xavier), ReLU, dropout, batch norm, Adam.
  - Hvert av disse triksene tar vi i et eget mini-kurs.`}</pre>
          </div>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Hvor passer dette inn?</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <strong className="text-foreground">Drag-oppgaver:</strong> filter på «ML & AI» i{" "}
              <Link to="/drag" className="text-brand hover:underline">/drag</Link> — søk på «CNN», «Backpropagation», «Regularisering (NN)», «NN-optimering», «PyTorch/TF».
            </li>
            <li>
              <strong className="text-foreground">Praktisk kode:</strong> kjør PyTorch-snutter direkte i browser på{" "}
              <Link to="/python" className="text-brand hover:underline">/python</Link>.
            </li>
            <li>
              <strong className="text-foreground">Forrige kurs:</strong>{" "}
              <Link to="/stack/$slug" params={{ slug: "dte-2602" }} className="text-brand hover:underline">DTE-2602</Link>{" "}
              — start der hvis perceptron/backprop ikke sitter ennå.
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
