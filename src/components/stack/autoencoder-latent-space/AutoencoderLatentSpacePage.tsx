import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { BookOpen, Shrink } from "lucide-react";
import { VisualDefs } from "@/components/stack/kurose-kurs/VisualDefs";
import {
  LatentSpaceIcon,
  AutoencoderIcon,
  EncoderIcon,
  DecoderIcon,
  ReconstructionIcon,
  UnderOverCompleteIcon,
  PcaIcon,
} from "@/components/stack/statIcons";

type Tab = "intro" | "live";

export function AutoencoderLatentSpacePage() {
  const [tab, setTab] = useState<Tab>("intro");
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Autoencoder — latent-rommet</h1>
          <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
            Goodfellow kap. 14. Hvordan et nevralt nett kan lære en komprimert representasjon av
            data ved å bare prøve å rekonstruere input. Bygger på nn-intro, svd-eigen-explorer (PCA
            er en lineær autoencoder).
          </p>
        </header>
        <div className="mb-4 flex flex-wrap gap-1.5 border-b border-border">
          <TabBtn
            active={tab === "intro"}
            onClick={() => setTab("intro")}
            icon={<BookOpen className="h-3.5 w-3.5" />}
          >
            0. Start her
          </TabBtn>
          <TabBtn
            active={tab === "live"}
            onClick={() => setTab("live")}
            icon={<Shrink className="h-3.5 w-3.5" />}
          >
            1. Komprimer + rekonstruér
          </TabBtn>
        </div>
        {tab === "intro" && <Intro onPick={setTab} />}
        {tab === "live" && <AutoencoderModule />}
        <Lessons />
      </main>
    </div>
  );
}

function TabBtn({
  children,
  active,
  onClick,
  icon,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border-b-2 -mb-px transition-colors ${active ? "border-brand text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
    >
      {icon}
      {children}
    </button>
  );
}
function Intro({ onPick }: { onPick: (t: Tab) => void }) {
  return (
    <div className="space-y-4 text-sm">
      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-base font-semibold mb-2">Bygger på</h2>
        <ul className="list-disc pl-5 text-muted-foreground space-y-1">
          <li>
            <strong className="text-foreground">Nevrale nett basics</strong> (<code>nn-intro</code>,{" "}
            <code>backprop-dyp</code>).
          </li>
          <li>
            <strong className="text-foreground">PCA</strong> (<code>dte2501-pca-visualizer</code>,{" "}
            <code>svd-eigen-explorer</code>): finn hovedkomponentene som forklarer mest varians.
          </li>
        </ul>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-base font-semibold mb-2">Hva er en autoencoder?</h2>
        <p className="text-muted-foreground">Et nevralt nett med to deler:</p>
        <ul className="list-disc pl-5 text-muted-foreground space-y-1 mt-1">
          <li>
            <strong className="text-foreground">Encoder f(x)</strong>: krymper input fra n
            dimensjoner ned til k dimensjoner (latent-rommet). k &lt; n.
          </li>
          <li>
            <strong className="text-foreground">Decoder g(z)</strong>: utvider de k dimensjonene
            tilbake til n.
          </li>
        </ul>
        <p className="text-muted-foreground mt-2">
          Trening: vis nettet et bilde x, og straff hvor langt <code>g(f(x))</code> er fra x. Loss =
          MSE mellom input og rekonstruksjon. Ingen labels nødvendig — selvtrening.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-base font-semibold mb-2">Hvorfor det er nyttig</h2>
        <ul className="list-disc pl-5 text-muted-foreground space-y-1">
          <li>
            <strong className="text-foreground">Kompresjon:</strong> hvis k er mye mindre enn n men
            nettet klarer å rekonstruere godt, har den lært et kompakt representasjons-system.
          </li>
          <li>
            <strong className="text-foreground">Støy-reduksjon:</strong> tren nettet på rene bilder,
            send støyete bilder gjennom. Latent-rommet kan ikke lagre støy, så output blir renere.
          </li>
          <li>
            <strong className="text-foreground">Anomali-deteksjon:</strong> tren på «normale»
            eksempler. Nye eksempler som rekonstrueres dårlig er anomalier.
          </li>
          <li>
            <strong className="text-foreground">Generativ modellering:</strong> Variational
            Autoencoders (VAE) bygger på dette. Sample fra latent-rommet → få nye bilder.
          </li>
        </ul>
      </div>

      <VisualDefs
        title="Ordbok"
        items={[
          {
            term: "Latent-rom",
            icon: <LatentSpaceIcon />,
            body: (
              <>
                Det k-dimensjonale rommet i midten av nettet. «Latent» = skjult — disse k tallene
                fanger essensen av input.
              </>
            ),
          },
          {
            term: "Latent-dimensjon k",
            icon: <AutoencoderIcon />,
            body: (
              <>
                Antall tall i flaskehalsen. Lite k = mye kompresjon, men dårligere rekonstruksjon.
                Stort k = god rekonstruksjon, men ingen kompresjon (kan bare være
                identity-funksjonen).
              </>
            ),
          },
          {
            term: "Encoder f",
            icon: <EncoderIcon />,
            body: (
              <>
                Funksjonen som tar n-dim input og produserer k-dim latent. Typisk: noen
                sammenkoblede lag med aktivering.
              </>
            ),
          },
          {
            term: "Decoder g",
            icon: <DecoderIcon />,
            body: (
              <>
                Funksjonen som tar k-dim latent og produserer n-dim rekonstruksjon. Typisk
                speil-bilde av encoder.
              </>
            ),
          },
          {
            term: "Rekonstruksjons-tap",
            icon: <ReconstructionIcon />,
            body: (
              <>
                L = (1/n) Σ (x_i - g(f(x))_i)². Vanlig MSE. Nettet trenes til å minimere dette.
              </>
            ),
          },
          {
            term: "Under/overcomplete",
            icon: <UnderOverCompleteIcon />,
            body: (
              <>
                Undercomplete: k &lt; n (vanlig). Tvinger nettet til å komprimere. Overcomplete: k
                &gt; n (kan lære identity = nyttig kun med regularisering, f.eks. sparse
                autoencoder).
              </>
            ),
          },
          {
            term: "PCA = lineær AE",
            icon: <PcaIcon />,
            body: (
              <>
                Hvis encoder/decoder er lineære og loss er MSE, så er den optimale løsningen
                identisk med PCA på input-dataen. Autoencoder med ikke-lineære aktiveringer kan
                gjøre mer enn PCA.
              </>
            ),
          },
        ]}
      />
      <div className="flex gap-2">
        <Button size="sm" onClick={() => onPick("live")}>
          Start på modul 1 →
        </Button>
      </div>
    </div>
  );
}

// Mini-autoencoder demo via PCA på syntetiske 8x8-bilder
// Vi bruker SVD som «trent» encoder/decoder (PCA = optimal lineær autoencoder)
const IMG_SIZE = 8;
const PIXELS = IMG_SIZE * IMG_SIZE;

function makeImages(): number[][] {
  // 16 syntetiske bilder: forskjellige sirkler/streker
  const imgs: number[][] = [];
  for (let n = 0; n < 16; n++) {
    const img = new Array(PIXELS).fill(0);
    const cx = 2 + (n % 4) * 1.2;
    const cy = 2 + Math.floor(n / 4) * 1.2;
    const r = 1.5 + (n % 3) * 0.5;
    for (let y = 0; y < IMG_SIZE; y++) {
      for (let x = 0; x < IMG_SIZE; x++) {
        const d = Math.hypot(x - cx, y - cy);
        img[y * IMG_SIZE + x] = Math.max(0, 1 - Math.abs(d - r));
      }
    }
    imgs.push(img);
  }
  return imgs;
}

// Beregn PCA-encoder/decoder via potensmetoden (forenklet)
function computePca(data: number[][], k: number): { mean: number[]; components: number[][] } {
  const n = data.length;
  const d = data[0].length;
  const mean = new Array(d).fill(0);
  for (const v of data) for (let i = 0; i < d; i++) mean[i] += v[i] / n;
  const centered = data.map((v) => v.map((x, i) => x - mean[i]));
  // Power iteration for topp-k komponenter
  const comps: number[][] = [];
  const residual = centered.map((v) => [...v]);
  for (let c = 0; c < k; c++) {
    let u = new Array(d).fill(0).map(() => Math.random() - 0.5);
    let norm = Math.hypot(...u);
    u = u.map((x) => x / norm);
    for (let iter = 0; iter < 30; iter++) {
      const newU = new Array(d).fill(0);
      for (const v of residual) {
        let dp = 0;
        for (let i = 0; i < d; i++) dp += v[i] * u[i];
        for (let i = 0; i < d; i++) newU[i] += dp * v[i];
      }
      norm = Math.hypot(...newU);
      u = newU.map((x) => x / (norm || 1));
    }
    comps.push(u);
    // Deflate: subtraher prosjeksjon
    for (const v of residual) {
      let dp = 0;
      for (let i = 0; i < d; i++) dp += v[i] * u[i];
      for (let i = 0; i < d; i++) v[i] -= dp * u[i];
    }
  }
  return { mean, components: comps };
}

function encode(img: number[], mean: number[], components: number[][]): number[] {
  return components.map((c) => {
    let s = 0;
    for (let i = 0; i < img.length; i++) s += (img[i] - mean[i]) * c[i];
    return s;
  });
}
function decode(z: number[], mean: number[], components: number[][]): number[] {
  const out = [...mean];
  for (let k = 0; k < z.length; k++) {
    for (let i = 0; i < out.length; i++) out[i] += z[k] * components[k][i];
  }
  return out;
}

function AutoencoderModule() {
  const images = useMemo(makeImages, []);
  const [k, setK] = useState(4);

  const { mean, components } = useMemo(() => computePca(images, 16), [images]);
  const compsK = components.slice(0, k);

  const [selected, setSelected] = useState(0);
  const z = encode(images[selected], mean, compsK);
  const reconstruction = decode(z, mean, compsK);

  const mse = useMemo(() => {
    let s = 0;
    for (let i = 0; i < PIXELS; i++) s += (images[selected][i] - reconstruction[i]) ** 2;
    return s / PIXELS;
  }, [images, selected, reconstruction]);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
        <strong className="text-foreground">16 syntetiske 8×8-bilder</strong> (sirkler med
        varierende sentrum/radius = 64 piksler hver). Vi trener en lineær autoencoder (PCA) med
        flaskehals på k dimensjoner. Dra k-slideren for å se hvordan rekonstruksjonen forverres når
        vi presser mer.
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-3">
          <label className="text-xs text-muted-foreground">
            Latent-dimensjon k: <span className="font-mono font-semibold">{k}</span> (av 64 piksler)
          </label>
          <input
            type="range"
            min={1}
            max={16}
            value={k}
            onChange={(e) => setK(Number(e.target.value))}
            className="w-full max-w-md"
          />
          <div className="text-[10px] text-muted-foreground">
            Kompresjonsforhold: {(PIXELS / k).toFixed(1)}×
          </div>
        </div>

        <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(8, minmax(0, 1fr))" }}>
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`p-1 rounded ${selected === i ? "bg-brand/20 ring-2 ring-brand" : "bg-muted hover:bg-muted-foreground/10"}`}
            >
              <ImageView img={img} />
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded border border-border bg-background p-2 text-center">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
              Original (64 piksler)
            </div>
            <ImageView img={images[selected]} large />
          </div>
          <div className="rounded border border-brand/40 bg-brand/5 p-2 text-center">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
              Latent z (k = {k})
            </div>
            <div className="flex justify-center items-center h-20 gap-1">
              {z.map((v, i) => {
                const h = Math.min(60, Math.abs(v) * 8);
                return (
                  <div
                    key={i}
                    className={`w-3 ${v >= 0 ? "bg-brand" : "bg-amber-500"}`}
                    style={{ height: `${h}px` }}
                    title={v.toFixed(2)}
                  />
                );
              })}
            </div>
            <div className="text-[10px] text-muted-foreground mt-1">
              {z.map((v) => v.toFixed(1)).join(", ")}
            </div>
          </div>
          <div className="rounded border border-border bg-background p-2 text-center">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
              Rekonstruksjon
            </div>
            <ImageView img={reconstruction} large />
          </div>
        </div>

        <div className="mt-3 rounded border border-border bg-background p-2 text-xs">
          <strong>Rekonstruksjons-tap (MSE):</strong>{" "}
          <span className="font-mono">{mse.toFixed(4)}</span>{" "}
          {mse < 0.01
            ? "🟢 perfekt rekonstruksjon — k er stort nok"
            : mse < 0.05
              ? "🟡 ok rekonstruksjon"
              : "🔴 dårlig rekonstruksjon — k er for lite for kompleksiteten i bildene"}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-3 text-xs text-muted-foreground">
        <strong className="text-foreground">Bemerk:</strong> selv med k = 2 eller 3 kan vi
        gjenkjenne hvilken «type» bilde det var. De første komponentene fanger
        STØRSTE-VARIANS-retninger — sentrum av sirkelen og radius — som er det som varierer mest
        mellom bildene.
      </div>
    </div>
  );
}

function ImageView({ img, large }: { img: number[]; large?: boolean }) {
  const px = large ? 12 : 6;
  return (
    <div
      className="inline-grid bg-card"
      style={{ gridTemplateColumns: `repeat(${IMG_SIZE}, ${px}px)`, gap: 1 }}
    >
      {img.map((v, i) => {
        const intensity = Math.max(0, Math.min(1, v));
        const c = Math.floor(intensity * 255);
        return (
          <div
            key={i}
            style={{ width: px, height: px, backgroundColor: `rgb(${c}, ${c}, ${c})` }}
          />
        );
      })}
    </div>
  );
}

function Lessons() {
  return (
    <section className="mt-10 space-y-3 text-sm">
      <h2 className="text-lg font-semibold">Oppsummering</h2>
      <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
        <li>
          <strong className="text-foreground">Lineær autoencoder = PCA.</strong> Bare når
          aktiverings-funksjonen er ikke-lineær får vi noe mer kraftig.
        </li>
        <li>
          <strong className="text-foreground">Praktiske ikke-lineære autoencoders</strong> brukt
          for: bilde-kompresjon (Dropbox brukte tidlig autoencoders), støy-reduksjon (denoising
          autoencoder med skjult «hint» om støy), feature extraction før klassifisering.
        </li>
        <li>
          <strong className="text-foreground">Variational Autoencoder (VAE)</strong> legger til en
          sannsynlighets-tolkning av latent-rommet og er bygd for generering. Sample tilfeldig fra
          latent → få nytt bilde.
        </li>
        <li>
          <strong className="text-foreground">Moderne diffusjons-modeller</strong> (Stable
          Diffusion, DALL-E) bruker en encoder/decoder-arkitektur men på et helt annet
          trening-prinsipp (gradvis støy-tilføring og fjerning).
        </li>
      </ul>
    </section>
  );
}
