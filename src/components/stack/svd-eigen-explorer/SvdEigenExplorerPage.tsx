import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { BookOpen, Compass } from "lucide-react";
import { VisualDefs } from "@/components/stack/kurose-kurs/VisualDefs";
import {
  EigenvectorIcon,
  EigenvalueIcon,
  EigenDecompIcon,
  SvdIcon,
  SingularValueIcon,
  RankIcon,
  RankKIcon,
  PcaIcon,
} from "@/components/stack/statIcons";

type Tab = "intro" | "live";

export function SvdEigenExplorerPage() {
  const [tab, setTab] = useState<Tab>("intro");
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">SVD & eigendekomposisjon</h1>
          <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
            MML kap. 4. Hvordan vi finner «retningene som er viktige» i en matrise. Fundamentet for
            PCA, anbefalings-systemer og noise-reduction. Bygger på linaer-algebra.
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
            icon={<Compass className="h-3.5 w-3.5" />}
          >
            1. Matrise → SVD
          </TabBtn>
        </div>
        {tab === "intro" && <Intro onPick={setTab} />}
        {tab === "live" && <SvdModule />}
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
            <strong className="text-foreground">Lineær algebra-basics</strong> (
            <code>linaer-algebra</code>): vektorer, matrise-multiplikasjon, dot product.
          </li>
        </ul>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-base font-semibold mb-2">Hva er problemet?</h2>
        <p className="text-muted-foreground">
          Tenk på en 2×2-matrise som en lineær transformasjon (rotér + skalér + skje). Når du
          multipliserer en hvilken som helst vektor med A, sender du den til et nytt punkt.
          Spørsmål: er det noen <em>spesielle retninger</em> som ikke bare blir skalert (ikke
          roterer)?
        </p>
        <p className="text-muted-foreground mt-2">
          Det er det egenvektorene er. Og SVD generaliserer det til hvilken som helst matrise (også
          ikke-kvadratiske).
        </p>
      </div>

      <VisualDefs
        title="Ordbok"
        items={[
          {
            term: "Egenvektor v",
            icon: <EigenvectorIcon />,
            body: (
              <>
                En vektor som, multiplisert med matrisen A, kun blir skalert (ikke rotert):
                <code> A·v = λ·v</code>. λ er en skalar (egenverdi).
              </>
            ),
          },
          {
            term: "Egenverdi λ",
            icon: <EigenvalueIcon />,
            body: (
              <>
                Hvor mye egenvektoren blir skalert. λ &gt; 1 = stretched. 0 &lt; λ &lt; 1 = shrunk.
                λ &lt; 0 = flippet.
              </>
            ),
          },
          {
            term: "Eigendekomposisjon",
            icon: <EigenDecompIcon />,
            body: (
              <>
                For en symmetrisk n×n matrise: <code>A = V·Λ·V⁻¹</code> der V er en matrise med
                egenvektorer som kolonner og Λ er en diagonal matrise med egenverdier. Bare
                definert for kvadratiske matriser.
              </>
            ),
          },
          {
            term: "SVD",
            icon: <SvdIcon />,
            body: (
              <>
                For ENHVER m×n matrise: <code>A = U·Σ·Vᵀ</code>. U: m×m, ortogonal (kolonner =
                «output-retninger»). Σ: m×n, diagonal med singulærverdier (alltid ≥ 0). V: n×n,
                ortogonal (rader = «input-retninger»).
              </>
            ),
          },
          {
            term: "Singulærverdi σ_i",
            icon: <SingularValueIcon />,
            body: (
              <>
                Diagonal-elementene i Σ, sortert avtagende: σ_1 ≥ σ_2 ≥ ... ≥ 0. Forteller hvor
                mye «kraft» det er i hver komponent.
              </>
            ),
          },
          {
            term: "Rangering (rank)",
            icon: <RankIcon />,
            body: (
              <>
                Antall ikke-null singulærverdier. En matrise med rank r kan «virkelig» bare
                representere et r-dimensjonalt rom, uansett hvor mange rader/kolonner den har.
              </>
            ),
          },
          {
            term: "Rank-k approksimasjon",
            icon: <RankKIcon />,
            body: (
              <>
                Behold bare de k største singulærverdiene. <code>A_k = U_k·Σ_k·V_kᵀ</code> er den
                beste mulige k-rangs tilnærmingen til A (i Frobenius-norm). Brukes til kompresjon
                og støy-reduksjon.
              </>
            ),
          },
          {
            term: "Forhold til PCA",
            icon: <PcaIcon />,
            body: (
              <>
                PCA = SVD av (sentrert) datamatrise. Hovedkomponentene er kolonnene i V, og «hvor
                mye varians de fanger» = σ_i² / Σ σ_j².
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

// 2x2 matrise + visualisering av enhetssirkel-transformasjon
function multiply2x2(A: number[][], v: number[]): number[] {
  return [A[0][0] * v[0] + A[0][1] * v[1], A[1][0] * v[0] + A[1][1] * v[1]];
}

// Jacobi-eigendekomposisjon for 2×2 symmetrisk
function eigen2x2sym(A: number[][]): { l1: number; l2: number; v1: number[]; v2: number[] } {
  const a = A[0][0],
    b = A[0][1],
    d = A[1][1];
  const tr = a + d;
  const det = a * d - b * b;
  const disc = Math.sqrt(Math.max(0, (tr * tr) / 4 - det));
  const l1 = tr / 2 + disc;
  const l2 = tr / 2 - disc;
  function eigvec(l: number): number[] {
    if (Math.abs(b) > 1e-9) {
      const v = [l - d, b];
      const n = Math.hypot(v[0], v[1]);
      return [v[0] / n, v[1] / n];
    } else {
      return Math.abs(a - l) < 1e-9 ? [1, 0] : [0, 1];
    }
  }
  return { l1, l2, v1: eigvec(l1), v2: eigvec(l2) };
}

function svd2x2(A: number[][]): { U: number[][]; sigma: number[]; V: number[][] } {
  // SVD via AAᵀ (symmetrisk)
  const AAT = [
    [A[0][0] * A[0][0] + A[0][1] * A[0][1], A[0][0] * A[1][0] + A[0][1] * A[1][1]],
    [A[1][0] * A[0][0] + A[1][1] * A[0][1], A[1][0] * A[1][0] + A[1][1] * A[1][1]],
  ];
  const { l1, l2, v1, v2 } = eigen2x2sym(AAT);
  const s1 = Math.sqrt(Math.max(0, l1));
  const s2 = Math.sqrt(Math.max(0, l2));
  // V kommer fra AᵀA — for enkelhets skyld bare la oss bruke at U = AAT egenvektorer
  // og V = ATA egenvektorer.
  const ATA = [
    [A[0][0] * A[0][0] + A[1][0] * A[1][0], A[0][0] * A[0][1] + A[1][0] * A[1][1]],
    [A[0][1] * A[0][0] + A[1][1] * A[1][0], A[0][1] * A[0][1] + A[1][1] * A[1][1]],
  ];
  const e2 = eigen2x2sym(ATA);
  return {
    U: [v1, v2],
    sigma: [s1, s2],
    V: [e2.v1, e2.v2],
  };
}

function SvdModule() {
  const [A, setA] = useState<number[][]>([
    [2, 1],
    [1, 2],
  ]);

  const svd = useMemo(() => svd2x2(A), [A]);

  function updateCell(i: number, j: number, v: number) {
    const next = A.map((r) => [...r]);
    next[i][j] = v;
    setA(next);
  }

  // Visualisering: vis enhetssirkelen og dens bilde under A
  const N = 36;
  const circle = Array.from({ length: N }, (_, k) => {
    const θ = (k / N) * 2 * Math.PI;
    return [Math.cos(θ), Math.sin(θ)];
  });
  const transformed = circle.map((v) => multiply2x2(A, v));

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
        <strong className="text-foreground">2×2 matrise A:</strong> sett verdiene under. Vi viser
        enhetssirkelen (blå) og dens bilde etter A (oransje). SVD finner: aksene U
        (output-retninger), σ (skalér-faktorer), V (input-retninger som blir aksene). Bildet er en
        ellipse hvis akser er σ_1·u_1 og σ_2·u_2.
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
              Matrise A
            </div>
            <div className="grid grid-cols-2 gap-1 max-w-[180px]">
              {A.flatMap((row, i) =>
                row.map((v, j) => (
                  <input
                    key={`${i}-${j}`}
                    type="number"
                    step={0.1}
                    value={v}
                    onChange={(e) => updateCell(i, j, Number(e.target.value))}
                    className="w-full rounded border border-border bg-background p-1.5 font-mono text-center text-sm"
                  />
                )),
              )}
            </div>
            <div className="text-[10px] text-muted-foreground mt-1 font-mono">
              det(A) = {(A[0][0] * A[1][1] - A[0][1] * A[1][0]).toFixed(2)}
            </div>

            <div className="mt-4 text-[11px] font-mono space-y-1">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                SVD-resultat: A = U·Σ·Vᵀ
              </div>
              <div>
                <strong>σ_1 = {svd.sigma[0].toFixed(2)}</strong> — strekk-faktor for første akse
              </div>
              <div>
                <strong>σ_2 = {svd.sigma[1].toFixed(2)}</strong> — strekk-faktor for andre akse
              </div>
              <div className="text-muted-foreground">
                u_1 = ({svd.U[0][0].toFixed(2)}, {svd.U[0][1].toFixed(2)})
              </div>
              <div className="text-muted-foreground">
                u_2 = ({svd.U[1][0].toFixed(2)}, {svd.U[1][1].toFixed(2)})
              </div>
              <div className="text-muted-foreground">
                v_1 = ({svd.V[0][0].toFixed(2)}, {svd.V[0][1].toFixed(2)})
              </div>
              <div className="text-muted-foreground">
                v_2 = ({svd.V[1][0].toFixed(2)}, {svd.V[1][1].toFixed(2)})
              </div>
              <div className="mt-1">
                Forhold σ_1/σ_2 ={" "}
                <strong>{(svd.sigma[0] / Math.max(0.01, svd.sigma[1])).toFixed(2)}</strong>
                {svd.sigma[0] / Math.max(0.01, svd.sigma[1]) > 10 ? " (nesten-singulær!)" : ""}
              </div>
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
              Geometrisk effekt
            </div>
            <svg viewBox="-200 -200 400 400" className="w-full h-auto bg-muted/20 rounded">
              {/* Akser */}
              <line
                x1={-200}
                y1={0}
                x2={200}
                y2={0}
                className="stroke-muted-foreground/30"
                strokeWidth={1}
              />
              <line
                x1={0}
                y1={-200}
                x2={0}
                y2={200}
                className="stroke-muted-foreground/30"
                strokeWidth={1}
              />
              {/* Enhetssirkel */}
              <polygon
                points={circle.map((v) => `${v[0] * 50},${-v[1] * 50}`).join(" ")}
                className="fill-brand/10 stroke-brand"
                strokeWidth={2}
              />
              {/* Transformert */}
              <polygon
                points={transformed.map((v) => `${v[0] * 50},${-v[1] * 50}`).join(" ")}
                className="fill-amber-500/10 stroke-amber-500"
                strokeWidth={2}
              />
              {/* SVD-akser i transformert */}
              <line
                x1={0}
                y1={0}
                x2={svd.U[0][0] * svd.sigma[0] * 50}
                y2={-svd.U[0][1] * svd.sigma[0] * 50}
                className="stroke-destructive"
                strokeWidth={3}
              />
              <line
                x1={0}
                y1={0}
                x2={svd.U[1][0] * svd.sigma[1] * 50}
                y2={-svd.U[1][1] * svd.sigma[1] * 50}
                className="stroke-destructive"
                strokeWidth={3}
              />
            </svg>
            <div className="text-[10px] text-muted-foreground mt-1">
              Blå = enhetssirkel før. Oransje = bilde etter A. Rød = SVD-aksene (σ_1·u_1 og
              σ_2·u_2).
            </div>
          </div>
        </div>

        <div className="mt-4 flex gap-1.5 flex-wrap text-xs">
          <span className="text-muted-foreground self-center">Prøv:</span>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              setA([
                [2, 0],
                [0, 2],
              ])
            }
          >
            2·I (kun skalering)
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              setA([
                [3, 0],
                [0, 1],
              ])
            }
          >
            Strekk (1 retning)
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              setA([
                [1, 1],
                [0, 1],
              ])
            }
          >
            Skje
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              setA([
                [Math.cos(Math.PI / 6), -Math.sin(Math.PI / 6)],
                [Math.sin(Math.PI / 6), Math.cos(Math.PI / 6)],
              ])
            }
          >
            Rotasjon 30°
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              setA([
                [2, 1.99],
                [1.99, 2],
              ])
            }
          >
            Nesten-singulær
          </Button>
        </div>
      </div>
    </div>
  );
}

function Lessons() {
  return (
    <section className="mt-10 space-y-3 text-sm">
      <h2 className="text-lg font-semibold">Oppsummering</h2>
      <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
        <li>
          <strong className="text-foreground">SVD finnes for HVER matrise.</strong> Også
          ikke-kvadratiske. Det gjør den til den mest generelle dekomposisjonen.
        </li>
        <li>
          <strong className="text-foreground">Geometrisk:</strong> enhver lineær transformasjon =
          (1) roter ved V, (2) skaler aksene ved Σ, (3) roter ved U. Det er hele historien.
        </li>
        <li>
          <strong className="text-foreground">Lav-rangs approksimasjon:</strong> behold bare topp-k
          singulærverdier. Brukt i bilde-kompresjon (lagre U_k, Σ_k, V_k i stedet for hele bildet),
          anbefalings-systemer (Netflix-prisen 2009 ble vunnet med SVD-basert collaborative
          filtering), støy-reduksjon.
        </li>
        <li>
          <strong className="text-foreground">Forhold σ_1/σ_n = «condition number»</strong>. Høyt =
          matrisen er nesten-singulær = numerisk ustabil. Viktig å vite før du regner med A.
        </li>
      </ul>
    </section>
  );
}
