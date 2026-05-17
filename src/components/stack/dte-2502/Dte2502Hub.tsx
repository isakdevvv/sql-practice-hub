import { Link } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  ArrowRight,
  GitBranch,
  Image as ImageIcon,
  Shield,
  Gauge,
  Wrench,
  Lightbulb,
  Calendar,
  Sparkles,
  PlayCircle,
  BookOpen,
  Eye,
  ScrollText,
  Brain,
  Code2,
  Cpu,
  Workflow,
} from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { ModulStatusBadge, ModulProgressBar } from "@/components/stack/HubShared";
import { EXAM_META } from "@/lib/subjects/catalog";
import { useModulProgress } from "@/lib/stack/moduleProgress";

type Lab = {
  slug: string;
  title: string;
  blurb: string;
  Icon: typeof GitBranch;
  taggar: string[];
};

const LABS: Lab[] = [
  {
    slug: "backprop-dyp",
    title: "Backpropagation — dypt",
    blurb:
      "Kjerne-regelen visualisert i beregningsgraf. Vanishing/exploding gradient, He/Xavier-init illustrert.",
    Icon: Workflow,
    taggar: ["backprop", "init"],
  },
  {
    slug: "cnn",
    title: "Konvolusjonsnett (CNN)",
    blurb:
      "Convolution, pooling, stride/padding interaktivt. LeNet → AlexNet → ResNet — se hvorfor de virker.",
    Icon: ImageIcon,
    taggar: ["CNN", "bilder"],
  },
  {
    slug: "optimering",
    title: "Optimerere & learning rate",
    blurb:
      "SGD, momentum, Adam, learning rate schedules — visualisering av konvergens og oscillering.",
    Icon: Gauge,
    taggar: ["SGD", "Adam"],
  },
];

type ConceptCourse = {
  slug: string;
  title: string;
  shortDescription: string;
  Icon: typeof GitBranch;
};

const CONCEPT_COURSES: ConceptCourse[] = [
  {
    slug: "regularisering",
    title: "Regularisering",
    shortDescription:
      "Dropout, batch normalization, weight decay, early stopping, data augmentation — slik unngår du overfitting i dyp læring.",
    Icon: Shield,
  },
  {
    slug: "pytorch-tf",
    title: "PyTorch & TensorFlow",
    shortDescription:
      "Tensors, autograd, training loop. Eager vs graph mode. Hvilken skal du velge — og hvorfor.",
    Icon: Wrench,
  },
];

type ExamTopic = {
  topic: string;
  Icon: typeof GitBranch;
  slugs: { slug: string; label: string }[];
};

const EXAM_TOPICS: ExamTopic[] = [
  {
    topic: "Backpropagation & gradient",
    Icon: Workflow,
    slugs: [
      { slug: "backprop-dyp", label: "Backprop dypt" },
      { slug: "optimering", label: "Optimerere" },
    ],
  },
  {
    topic: "Konvolusjon & bilder",
    Icon: ImageIcon,
    slugs: [{ slug: "cnn", label: "CNN interaktiv" }],
  },
  {
    topic: "Regularisering & generalisering",
    Icon: Shield,
    slugs: [{ slug: "regularisering", label: "Konsept" }],
  },
  {
    topic: "Rammeverk",
    Icon: Wrench,
    slugs: [{ slug: "pytorch-tf", label: "PyTorch / TensorFlow" }],
  },
  {
    topic: "Forutsetninger (DTE-2602)",
    Icon: Cpu,
    slugs: [
      { slug: "dte-2602", label: "ML-grunnlag" },
      { slug: "nn-intro", label: "Perceptron + GD" },
    ],
  },
];

const MODE_ANCHORS: { id: string; label: string; Icon: typeof GitBranch }[] = [
  { id: "les", label: "Les", Icon: BookOpen },
  { id: "visualiser", label: "Visualiser", Icon: Eye },
  { id: "ov", label: "Øv", Icon: Wrench },
  { id: "eksamen", label: "Eksamen", Icon: ScrollText },
  { id: "tutor", label: "AI-tutor", Icon: Brain },
];

export function Dte2502Hub() {
  const meta = EXAM_META["dte-2502"];

  const allConceptSlugs = useMemo(() => CONCEPT_COURSES.map((c) => c.slug), []);
  const { seen, total } = useModulProgress(allConceptSlugs);
  const nextSlug = useNextUnseenSlug(allConceptSlugs);
  const nextCourse = useMemo(
    () => CONCEPT_COURSES.find((c) => c.slug === nextSlug) ?? CONCEPT_COURSES[0],
    [nextSlug],
  );
  const allDone = total > 0 && seen === total;

  return (
    <StackPageShell title="DTE-2502 Neural Networks" group="eksamen">
      <div className="container mx-auto px-4 py-10 max-w-4xl">
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-3 text-[11px]">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 text-brand border border-brand/30 px-2.5 py-1 font-semibold">
              DTE-2502
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted text-muted-foreground border border-border px-2.5 py-1">
              {meta?.stp ?? 10} stp
            </span>
            {meta?.eksamen && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 px-2.5 py-1">
                <Calendar className="h-3 w-3" />
                Eksamen {meta.eksamen}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted text-muted-foreground border border-border px-2.5 py-1">
              Dyplæring — bygger på DTE-2602
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Neural Networks</h1>
          <p className="mt-3 text-muted-foreground max-w-2xl">
            Bygger på perceptron, backprop og gradient descent fra{" "}
            <Link to="/stack/$slug" params={{ slug: "nn-intro" }} className="text-brand hover:underline">
              /stack/nn-intro
            </Link>
            . Her går vi dypere: kjerne-regelen, CNN på bilder, regularisering, optimerere
            og rammeverkene PyTorch og TensorFlow. Velg modus under.
          </p>
          <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm">
            <strong className="text-amber-700 dark:text-amber-400">Forutsetning:</strong>{" "}
            Du bør ha tatt{" "}
            <Link to="/stack/$slug" params={{ slug: "dte-2602" }} className="text-brand hover:underline">
              DTE-2602
            </Link>{" "}
            eller kjenne perceptron, forward/backward pass, MSE/cross-entropy. DTE-2502
            gjentar IKKE disse temaene.
          </div>
        </div>

        <nav
          aria-label="Velg modus"
          className="mb-6 sticky top-14 z-20 -mx-4 px-4 py-2 bg-background/85 backdrop-blur border-b border-border"
        >
          <div className="flex flex-wrap gap-1.5 text-xs">
            {MODE_ANCHORS.map((m) => {
              const Icon = m.Icon;
              return (
                <a
                  key={m.id}
                  href={`#${m.id}`}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card hover:border-brand/50 hover:bg-brand/5 px-2.5 py-1.5 text-foreground transition-colors"
                >
                  <Icon className="h-3.5 w-3.5 text-brand" />
                  {m.label}
                </a>
              );
            })}
          </div>
        </nav>

        <div className="mb-10 grid sm:grid-cols-[2fr_1fr] gap-3">
          <Link
            to="/stack/$slug"
            params={{ slug: nextCourse.slug }}
            className="group rounded-xl border-2 border-brand/40 bg-gradient-to-br from-brand/10 to-success/5 hover:border-brand transition-colors p-5 block"
          >
            <div className="flex items-center gap-2 mb-1">
              <PlayCircle className="h-5 w-5 text-brand" />
              <div className="text-[10px] uppercase tracking-wider font-semibold text-brand">
                {allDone ? "Repeter" : seen === 0 ? "Start her" : "Anbefalt neste"}
              </div>
            </div>
            <h3 className="font-semibold text-foreground leading-tight text-lg mt-1">
              {nextCourse.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-snug mt-1">
              {nextCourse.shortDescription}
            </p>
            <div className="mt-3 flex items-center text-xs font-medium text-brand">
              {seen === 0 ? "Start" : "Fortsett"}
              <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-1">
              Din framdrift
            </div>
            <div className="text-2xl font-semibold tabular-nums">
              {seen}{" "}
              <span className="text-muted-foreground text-base font-normal">
                / {total}
              </span>
            </div>
            <ModulProgressBar trinnSlugs={allConceptSlugs} />
            <div className="mt-3 text-[11px] text-muted-foreground">
              Konsept-leksjoner sett. {LABS.length} labs telles ikke her.
            </div>
          </div>
        </div>

        <section id="les" className="mb-12 scroll-mt-28">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-5 w-5 text-brand" />
            <h2 className="text-xl font-semibold">Les — konsept-leksjoner</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Tekst-tunge introduksjoner til reglene som ikke trenger visualisering.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {CONCEPT_COURSES.map((c) => {
              const Icon = c.Icon;
              return (
                <Link
                  key={c.slug}
                  to="/stack/$slug"
                  params={{ slug: c.slug }}
                  className="group rounded-xl border border-border bg-card hover:border-brand/40 p-5 transition-colors block"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-4 w-4 text-brand" />
                    <h3 className="font-semibold text-foreground leading-tight">
                      {c.title}
                    </h3>
                    <ModulStatusBadge trinnSlugs={[c.slug]} />
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {c.shortDescription}
                  </p>
                  <div className="mt-3 flex items-center text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                    Åpne
                    <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section id="visualiser" className="mb-12 scroll-mt-28">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="h-5 w-5 text-brand" />
            <h2 className="text-xl font-semibold">Visualiser & labs</h2>
            <span className="rounded-full bg-success/10 text-success border border-success/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
              {LABS.length} interaktive
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Backprop, CNN-filtre og optimerere er enklere å forstå ved å se dem virke
            enn å lese dem.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {LABS.map((lab) => {
              const Icon = lab.Icon;
              return (
                <Link
                  key={lab.slug}
                  to="/stack/$slug"
                  params={{ slug: lab.slug }}
                  className="group rounded-xl border border-success/30 bg-success/5 hover:border-success p-5 transition-colors block"
                >
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <Icon className="h-4 w-4 text-success" />
                    <h3 className="font-semibold text-foreground leading-tight">
                      {lab.title}
                    </h3>
                    <ModulStatusBadge trinnSlugs={[lab.slug]} />
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {lab.blurb}
                  </p>
                  <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
                    <div className="flex flex-wrap gap-1">
                      {lab.taggar.map((t) => (
                        <span
                          key={t}
                          className="text-[10px] rounded bg-muted text-muted-foreground px-1.5 py-0.5"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    <span className="inline-flex items-center text-xs text-success font-medium">
                      Åpne lab
                      <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section id="ov" className="mb-12 scroll-mt-28">
          <div className="flex items-center gap-2 mb-2">
            <Wrench className="h-5 w-5 text-brand" />
            <h2 className="text-xl font-semibold">Øv — gjør, ikke bare les</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Python-øvelser kjører PyTorch-snutter i Pyodide. Drag og flashcards for
            konsept-repetisjon.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            <Link
              to="/python"
              className="group rounded-xl border border-brand/40 bg-brand/5 hover:border-brand p-5 transition-colors block"
            >
              <div className="flex items-center gap-2 mb-2">
                <Code2 className="h-4 w-4 text-brand" />
                <h3 className="font-semibold text-foreground leading-tight">
                  Python-øvelser
                </h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                PyTorch-snutter direkte i browseren — train loop, autograd,
                CNN-bygging.
              </p>
              <div className="mt-3 flex items-center text-xs text-brand font-medium">
                Åpne
                <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
            <Link
              to="/drag"
              className="group rounded-xl border border-border bg-card hover:border-brand/40 p-5 transition-colors block"
            >
              <div className="flex items-center gap-2 mb-2">
                <GitBranch className="h-4 w-4 text-brand" />
                <h3 className="font-semibold text-foreground leading-tight">
                  Drag-oppgaver
                </h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Filter på «ML &amp; AI» — søk på «CNN», «Backpropagation»,
                «Regularisering (NN)», «NN-optimering», «PyTorch/TF».
              </p>
              <div className="mt-3 flex items-center text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                Åpne
                <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
            <Link
              to="/cards"
              className="group rounded-xl border border-border bg-card hover:border-brand/40 p-5 transition-colors block"
            >
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="h-4 w-4 text-brand" />
                <h3 className="font-semibold text-foreground leading-tight">
                  Flashcards
                </h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Backprop, CNN-arkitekturer, regularisering, optimerere, init-strategier.
              </p>
              <div className="mt-3 flex items-center text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                Åpne
                <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          </div>
        </section>

        <section id="eksamen" className="mb-12 scroll-mt-28">
          <div className="flex items-center gap-2 mb-2">
            <ScrollText className="h-5 w-5 text-brand" />
            <h2 className="text-xl font-semibold">Eksamen-temaer</h2>
            {meta?.eksamen && (
              <span className="text-[11px] text-muted-foreground">{meta.eksamen}</span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Pensumet gruppert etter typisk eksamenstema. Hver kategori har direkte
            ankerknapper til relevante labs og konsept-leksjoner.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {EXAM_TOPICS.map((t) => {
              const Icon = t.Icon;
              return (
                <div
                  key={t.topic}
                  className="rounded-xl border border-border bg-card p-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-4 w-4 text-brand" />
                    <h3 className="font-semibold text-foreground text-sm">
                      {t.topic}
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {t.slugs.map((s) => (
                      <Link
                        key={s.slug}
                        to="/stack/$slug"
                        params={{ slug: s.slug }}
                        className="inline-flex items-center gap-1 rounded-md border border-border bg-background hover:border-brand/50 hover:bg-brand/5 px-2 py-1 text-[11px] text-foreground transition-colors"
                      >
                        {s.label}
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section id="tutor" className="mb-12 scroll-mt-28">
          <a
            href="/tutor"
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-xl border border-brand/30 bg-gradient-to-br from-brand/10 to-violet-500/5 hover:border-brand p-5 transition-colors flex items-start gap-4"
          >
            <div className="shrink-0 rounded-lg bg-brand/15 p-2.5">
              <Sparkles className="h-5 w-5 text-brand" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-semibold">Spør AI om DTE-2502</h2>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-success/15 text-success border border-success/30">
                  Sjekk forståelse
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-snug">
                Få forklart hvorfor ReLU løser vanishing gradient, eller hvordan dropout
                ligner ensemble learning. Tutoren ser hva du har gjort på faget.
              </p>
              <div className="mt-2 flex items-center text-xs font-medium text-brand">
                Åpne tutor
                <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </a>
        </section>

        {/* Arkitektur-cheatsheet — beholdt fra forrige versjon */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">NN-arkitektur-cheatsheet</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Hvilken arkitektur passer hvilken type input? Bruk dette som første
            sortering før du leser detaljene.
          </p>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-32">Arkitektur</th>
                  <th className="text-left font-semibold px-4 py-2 w-40">Best for</th>
                  <th className="text-left font-semibold px-4 py-2">Nøkkel-idé</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">MLP / FFN</td><td className="px-4 py-3 text-muted-foreground">Tabulær data, Iris-baseline</td><td className="px-4 py-3 text-muted-foreground">Fully connected lag — alle vekter er unike. Mange parametere.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">CNN</td><td className="px-4 py-3 text-muted-foreground">Bilder (MNIST, CIFAR), 1D-signaler</td><td className="px-4 py-3 text-muted-foreground">Lokale filtre + vekt-deling. Lærer kanter → former → objekter.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">RNN / LSTM</td><td className="px-4 py-3 text-muted-foreground">Sekvenser, tidsserier, tekst</td><td className="px-4 py-3 text-muted-foreground">Skjult tilstand bærer historikk. Sliter med lang kontekst.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">Transformer</td><td className="px-4 py-3 text-muted-foreground">Lang tekst, multimodalt, dagens SOTA</td><td className="px-4 py-3 text-muted-foreground">Self-attention — alle tokens ser hverandre samtidig. Parallelliserbart.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">Autoencoder</td><td className="px-4 py-3 text-muted-foreground">Anomalydeteksjon, kompresjon</td><td className="px-4 py-3 text-muted-foreground">Encoder → flaskehals → decoder. Lærer å gjenskape inputen.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">GAN / Diffusion</td><td className="px-4 py-3 text-muted-foreground">Generere bilder/lyd</td><td className="px-4 py-3 text-muted-foreground">To nett mot hverandre (GAN) eller progressiv støy-fjerning (diffusion).</td></tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Velg-regel:</strong> bilder → CNN. Sekvens kort → RNN/LSTM. Sekvens lang
            eller dyr trening → Transformer. Tabulær → ofte gradient boosting (XGBoost)
            før du går nevralt. DTE-2502 fokuserer på <strong>MLP og CNN</strong>.
          </p>
        </section>
      </div>
    </StackPageShell>
  );
}

function useNextUnseenSlug(slugs: string[]): string {
  const { seen, total } = useModulProgress(slugs);
  if (typeof window === "undefined" || seen === 0 || seen >= total) {
    return slugs[0];
  }
  try {
    const raw = window.localStorage.getItem("stack.visited.v1");
    if (!raw) return slugs[0];
    const visited = JSON.parse(raw) as Record<string, true>;
    const next = slugs.find((s) => !visited[s]);
    return next ?? slugs[0];
  } catch {
    return slugs[0];
  }
}
