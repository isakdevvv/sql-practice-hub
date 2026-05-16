import { Link } from "@tanstack/react-router";
import { Lightbulb, Layers, ArrowLeft } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { KMeansLivePlot } from "./KMeansLivePlot";
import { Tex, TexBlock } from "@/components/Tex";

const STEPS = [
  { title: "Hva visualiseringen viser", anchor: "intro" },
  { title: "Live-plot — eksperimenter", anchor: "live" },
  { title: "Hvordan tolke datasettene", anchor: "datasets" },
  { title: "Steg-for-steg: ASSIGN og UPDATE", anchor: "steps" },
  { title: "Inertia — hvorfor synker den?", anchor: "inertia" },
  { title: "Eksamen-hurtigreferanse", anchor: "exam" },
];

export function KMeansVisualizerPage() {
  return (
    <StackPageShell title="k-Means live-plot" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2501 · Interaktiv visualisering
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            k-Means live-plot — se algoritmen jobbe
          </h1>
          <p className="mt-3 text-muted-foreground">
            Velg dataset, sett k, og se Lloyd&apos;s algoritme i sanntid. Du kan
            steppe gjennom én iterasjon ad gangen for å forstå nøyaktig hva
            ASSIGN-steget og UPDATE-steget gjør, eller animere helt til
            konvergens. Inertia (WCSS) plottes per steg så du kan se objektivet
            synke.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Tips:</span> prøv Iris med k = 3 (en
              klynge per art) — de to virginica/versicolor-klyngene overlapper
              litt. Prøv Moons med k = 2: k-Means deler tvers gjennom månene
              fordi den antar kuleformede klustre.
            </div>
          </div>
        </div>

        <CourseOutline courseId="dte2501-kmeans-visualizer" steps={STEPS} />

        <section id="intro" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Hva visualiseringen viser</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Hver iterasjon består av to halvsteg: <strong>ASSIGN</strong> (hvert
            punkt får farge etter nærmeste centroid) og <strong>UPDATE</strong>{" "}
            (hver centroid flyttes til snittet av sine punkter). Pilene viser
            sentrums-bevegelsen, og inertia-grafen nederst dokumenterer at
            objektivet
            <Tex>{"\\,J = \\sum_i \\|x_i - \\mu_{c(i)}\\|^2\\,"}</Tex>
            synker monotont.
          </p>
        </section>

        <section id="live" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Live-plot — eksperimenter</h2>
          <KMeansLivePlot />
          <p className="mt-3 text-xs text-muted-foreground">
            Velg <em>Klikk selv</em> for å bygge ditt eget datasett — så ser du
            hvordan k-Means oppfører seg på akkurat din geometri.
          </p>
        </section>

        <section id="datasets" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Hvordan tolke datasettene</h2>
          <div className="space-y-3">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="font-medium text-sm mb-1">Iris (2 features)</div>
              <p className="text-xs text-muted-foreground">
                Petal length og petal width (PL og PW) — kjent datasett, 60
                punkter, 3 arter. Setosa skiller seg klart ut nede til venstre.
                Versicolor og virginica overlapper noe. Med k = 3 finner k-Means
                stort sett de tre artene; med k = 2 slås versicolor og virginica
                sammen.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="font-medium text-sm mb-1">Blobs</div>
              <p className="text-xs text-muted-foreground">
                Fire gaussiske klustre i hvert hjørne — den ideelle k-Means-saken.
                Med k = 4 konvergerer den raskt og finner riktig struktur. Med
                k = 3 eller k = 5 ser du tydelig dårligere inertia.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="font-medium text-sm mb-1">Moons (halvmåner)</div>
              <p className="text-xs text-muted-foreground">
                To halvmåner som vikles rundt hverandre — <em>ikke konveks</em>
                {" "}geometri. k-Means feiler her, uansett k, fordi den minimerer
                kvadrert avstand til sentrum. DBSCAN eller spectral clustering
                løser det.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="font-medium text-sm mb-1">Klikk selv</div>
              <p className="text-xs text-muted-foreground">
                Lag ditt eget datasett. Prøv: én tett klynge + en utligger.
                Utliggeren får sin egen centroid hvis k er stor nok — eller
                drar et annet sentrum mot seg hvis k er for liten.
              </p>
            </div>
          </div>
        </section>

        <section id="steps" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Steg-for-steg: ASSIGN og UPDATE</h2>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm">
            <div>
              <div className="font-semibold">ASSIGN (E-steg)</div>
              <p className="text-xs text-muted-foreground mb-2">
                Hvert punkt <Tex>{"x_i"}</Tex> tilordnes klustret med nærmeste
                sentrum:
              </p>
              <TexBlock>{"c(i) \\leftarrow \\arg\\min_{j} \\|x_i - \\mu_j\\|^2"}</TexBlock>
              <p className="text-xs text-muted-foreground">
                I plottet: punktene skifter farge. Tallet «X punkter byttet
                klustre» viser hvor mye som endret seg siden forrige ASSIGN.
              </p>
            </div>
            <div className="pt-2">
              <div className="font-semibold">UPDATE (M-steg)</div>
              <p className="text-xs text-muted-foreground mb-2">
                Hvert sentrum flyttes til gjennomsnittet av sine punkter:
              </p>
              <TexBlock>{"\\mu_j \\leftarrow \\frac{1}{|C_j|} \\sum_{i \\in C_j} x_i"}</TexBlock>
              <p className="text-xs text-muted-foreground">
                I plottet: stiplet sirkel = gammel posisjon, pil = bevegelse,
                fylt sirkel = ny posisjon.
              </p>
            </div>
            <div className="pt-2">
              <div className="font-semibold">Konvergens</div>
              <p className="text-xs text-muted-foreground">
                Når UPDATE ikke flytter noen sentre (under en liten toleranse),
                er algoritmen ferdig. Inertia er da på et lokalt minimum.
              </p>
            </div>
          </div>
        </section>

        <section id="inertia" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Inertia — hvorfor synker den?</h2>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm">
            <p>
              Inertia (eller WCSS, within-cluster sum of squares):
            </p>
            <TexBlock>{"J = \\sum_{i=1}^n \\|x_i - \\mu_{c(i)}\\|^2"}</TexBlock>
            <ul className="text-xs text-muted-foreground list-disc pl-5 space-y-1">
              <li>
                <strong>ASSIGN</strong> kan ikke øke J: hvis du flytter et
                punkt til et nærmere sentrum, blir bidraget til summen mindre.
              </li>
              <li>
                <strong>UPDATE</strong> kan ikke øke J heller: gjennomsnittet
                minimerer kvadrert avstand for et fast sett punkter.
              </li>
              <li>
                Derfor: J er monotont avtakende — algoritmen må konvergere
                (endelig mange klustre-konfigurasjoner).
              </li>
              <li>
                Men: globalt optimum er <em>ikke</em> garantert. Bruk{" "}
                <code className="font-mono">n_init=10</code> i sklearn.
              </li>
            </ul>
          </div>
        </section>

        <section id="exam" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Eksamen-hurtigreferanse</h2>
          <div className="rounded-xl border border-brand/30 bg-brand/5 p-5 space-y-2 text-sm">
            <div>
              <strong>«Hva er ett iterasjons-steg i k-Means?»</strong> ASSIGN
              (hvert punkt til nærmeste sentrum) + UPDATE (hvert sentrum til
              snittet av sine punkter).
            </div>
            <div>
              <strong>«Hvilken objektivfunksjon minimeres?»</strong>{" "}
              <Tex>{"J = \\sum_i \\|x_i - \\mu_{c(i)}\\|^2"}</Tex> — sum av
              kvadrerte avstander til eget sentrum (WCSS / inertia).
            </div>
            <div>
              <strong>«Hvorfor garanterer ikke k-Means globalt optimum?»</strong>{" "}
              J er ikke-konveks. Lokalt minimum avhenger av init. Løsning: kjør
              mange ganger med ulik init (n_init=10) og behold beste run.
            </div>
            <div>
              <strong>«Når feiler k-Means?»</strong> Ikke-konvekse klustre
              (halvmåner, ringer), klustre med veldig ulik størrelse eller
              tetthet, uskalerte features.
            </div>
            <div>
              <strong>«Hvordan velge k?»</strong> Elbow-metoden (knekk i
              J(k)-kurven) eller silhouette-koeffisient.
            </div>
          </div>
        </section>

        <div className="rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2 flex items-center gap-2">
            <Layers className="h-4 w-4 text-brand" />
            Relatert
          </h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link
                to="/stack/$slug"
                params={{ slug: "dte2501-kmeans-clustering" }}
                className="text-brand hover:underline"
              >
                k-Means clustering (teori-side)
              </Link>{" "}
              — algoritmen i detalj, elbow/silhouette, sammenligning med
              hierarkisk og DBSCAN.
            </li>
            <li>
              <Link
                to="/stack/$slug"
                params={{ slug: "dte2501-pca-visualizer" }}
                className="text-brand hover:underline"
              >
                PCA interaktiv projeksjon
              </Link>{" "}
              — visualiser klustringen din i 2D etter PCA.
            </li>
            <li>
              <Link
                to="/stack/$slug"
                params={{ slug: "dte2501-gmm" }}
                className="text-brand hover:underline"
              >
                GMM
              </Link>{" "}
              — soft clustering, generaliseringen av k-Means.
            </li>
          </ul>
        </div>

        <div className="mt-6">
          <Link
            to="/stack/$slug"
            params={{ slug: "dte-2501" }}
            className="text-brand hover:underline inline-flex items-center gap-1 text-sm"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Tilbake til DTE-2501-hub
          </Link>
        </div>
      </div>
    </StackPageShell>
  );
}
