import { Link } from "@tanstack/react-router";
import { ArrowRight, Hash, Sigma, Grid3x3, BrainCog } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";

type Course = {
  slug: string;
  title: string;
  shortDescription: string;
  Icon: typeof Hash;
  status: "ready" | "coming-soon";
};

const COURSES: Course[] = [
  {
    slug: "diskret-matte",
    title: "Diskret matematikk",
    shortDescription:
      "Logikk, mengder, funksjoner, kombinatorikk, induksjon, grafer og modulær aritmetikk. Fundamentet for algoritmer og kryptografi.",
    Icon: Hash,
    status: "ready",
  },
  {
    slug: "sannsynlighet",
    title: "Sannsynlighet og statistikk",
    shortDescription:
      "Utfallsrom, Bayes, forventning, varians, fordelinger (Bernoulli, binomial, normal, Poisson), CLT, hypotesetesting.",
    Icon: Sigma,
    status: "ready",
  },
  {
    slug: "linaer-algebra",
    title: "Linær algebra",
    shortDescription:
      "Vektorer, indreprodukt, matriser, Ax=b, lineære transformasjoner, egenvektorer og PCA-intuisjon.",
    Icon: Grid3x3,
    status: "ready",
  },
];

export function MathFoundationsHub() {
  return (
    <StackPageShell title="Math foundations" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-10">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            Fase 0 · Prerekvisitt · Matematisk grunnlag
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Math foundations — matten alt annet hviler på
          </h1>
          <p className="mt-3 text-muted-foreground max-w-2xl">
            Før algoritmer, før ML, før nevrale nett: tre matte-områder du må ha
            i ryggmargen. Diskret matte for CS, sannsynlighet for ML,
            linær algebra for nevrale nett og PCA. Hver mini-kurs er kort,
            konkret og lenket til hvor matten dukker opp senere i løypa.
          </p>
        </div>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Cheatsheet — hvor brukes matten?</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Tre familier av matte, tre familier av anvendelser. Hold tabellen i
            hodet — den hjelper deg å plassere hver formel inn i riktig kontekst.
          </p>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-44">Matematikk</th>
                  <th className="text-left font-semibold px-4 py-2">Sentral idé</th>
                  <th className="text-left font-semibold px-4 py-2 w-52">Brukes til</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">Diskret matte</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    Tellbare strukturer: logikk, mengder, grafer, heltall
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">Algoritmer, DB-teori, kryptografi</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">Sannsynlighet</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    Tallfest usikkerhet, modeller på tilfeldighet
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">ML, statistikk, Bayes, A/B-test</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">Linær algebra</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    Rom av vektorer + lineære transformasjoner
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">Nevrale nett, PCA, grafikk, optimalisering</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Studietips:</strong> ikke prøv å lære alt på én gang. Diskret matte
            først (gir vokabularet for alt), så sannsynlighet (bygger på mengder), så
            linær algebra (helt eget område, men avgjørende for ML).
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Universitets-analoger</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <ul className="space-y-2 text-sm text-foreground">
              <li>
                <strong>MIT 6.042 / 6.1200</strong> — Mathematics for Computer Science.
                Standard diskret-matte-kurset. Logikk, induksjon, grafer, kombinatorikk.
              </li>
              <li>
                <strong>Stanford CS 109</strong> — Probability for Computer Scientists.
                Sannsynlighet med kode-eksempler, alt fra Bayes til CLT.
              </li>
              <li>
                <strong>MIT 18.06 (Strang)</strong> + Khan Academy Linear Algebra.
                Vektorer, matriser, egenvektorer, SVD.
              </li>
            </ul>
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
          <h2 className="text-xl font-semibold mb-3">Hvor brukes hva senere?</h2>
          <div className="space-y-3 text-sm">
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-2 mb-1">
                <BrainCog className="h-4 w-4 text-brand" />
                <strong className="text-foreground">Logikk og mengder</strong>
              </div>
              <p className="text-muted-foreground">
                Brukes direkte i SQL (WHERE-klausuler er propositional logic, JOIN er
                relasjonsalgebra på mengder), i datatype-system, og i hver IF-setning.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-2 mb-1">
                <BrainCog className="h-4 w-4 text-brand" />
                <strong className="text-foreground">Kombinatorikk og induksjon</strong>
              </div>
              <p className="text-muted-foreground">
                Big-O-analyse, rekursjons-bevis, dynamisk programmering. Hver gang du
                spør «hvor mange måter?» eller «for hver n», trenger du dette.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-2 mb-1">
                <BrainCog className="h-4 w-4 text-brand" />
                <strong className="text-foreground">Modulær aritmetikk</strong>
              </div>
              <p className="text-muted-foreground">
                Hashing, RSA, kryptografi, sjekksummer, hash-tabeller. <code>mod n</code>
                er en bro mellom heltall og en endelig ring.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-2 mb-1">
                <BrainCog className="h-4 w-4 text-brand" />
                <strong className="text-foreground">Sannsynlighet</strong>
              </div>
              <p className="text-muted-foreground">
                Hele ML-pensumet hviler på dette: maximum likelihood, Bayesianske modeller,
                kryssvalidering, p-verdier, A/B-tester, ROC-AUC.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-2 mb-1">
                <BrainCog className="h-4 w-4 text-brand" />
                <strong className="text-foreground">Linær algebra</strong>
              </div>
              <p className="text-muted-foreground">
                Hvert nevralt nett er en stabel matrise-multiplikasjoner. PCA er
                egenvektorer av kovariansmatrisen. Grafikk er rotasjonsmatriser.
              </p>
            </div>
          </div>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <strong className="text-foreground">Drag-oppgaver:</strong> filter på «Math foundations» i{" "}
              <Link to="/drag" className="text-brand hover:underline">/drag</Link>.
            </li>
            <li>
              Etter matten: gå videre til{" "}
              <Link to="/stack/$slug" params={{ slug: "algoritmer" }} className="text-brand hover:underline">
                algoritmer
              </Link>
              {" "}eller{" "}
              <Link to="/stack/$slug" params={{ slug: "dte-2602" }} className="text-brand hover:underline">
                DTE-2602 ML
              </Link>
              <ArrowRight className="inline h-3.5 w-3.5 ml-1" />
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
