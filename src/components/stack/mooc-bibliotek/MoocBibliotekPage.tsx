import { ExternalLink, GraduationCap, Play, Clock, AlertTriangle } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { MOOCS, type Mooc } from "./moocs";

const STEPS = [
  { title: "Hvordan jeg har valgt", anchor: "metode" },
  { title: "Tier 1 — fundament", anchor: "tier1" },
  { title: "Tier 2 — fag-spesifikke", anchor: "tier2" },
  { title: "Tier 3 — alternativer / dypere", anchor: "tier3" },
  { title: "Per fag — quick-ref", anchor: "per-fag" },
  { title: "Realistisk planlegging", anchor: "planlegging" },
];

const TIER_LABEL: Record<1 | 2 | 3, string> = {
  1: "Fundament",
  2: "Fag-spesifikt",
  3: "Alternativ / dypere",
};
const TIER_COLORS: Record<1 | 2 | 3, string> = {
  1: "border-brand/40 bg-brand/5",
  2: "border-success/40 bg-success/5",
  3: "border-muted bg-muted/30",
};

export function MoocBibliotekPage() {
  const tier1 = MOOCS.filter((m) => m.tier === 1);
  const tier2 = MOOCS.filter((m) => m.tier === 2);
  const tier3 = MOOCS.filter((m) => m.tier === 3);

  return (
    <StackPageShell title="MOOCs — gratis universitetskurs for DTE-bachelor" group="stack">
      <article className="container mx-auto px-4 py-10 max-w-4xl">
        <header className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            Bibliotek · 10 universitetskurs som matcher DTE-pensumet
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            10 gratis universitetskurs en data-ingeniør faktisk kan ta
          </h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            MIT, Stanford, Harvard, CMU, Berkeley — gratis online for alle. Andrew Ng,
            Erik Demaine, Andy Pavlo, Karpathy. Ikke Coursera-marketing-kurs, men ekte
            universitets-forelesninger med problem sets og labs. Alle 10 er gratis.
          </p>
        </header>

        <CourseOutline courseId="mooc-bibliotek" steps={STEPS} />

        <section id="metode" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Hvordan jeg har valgt</h2>
          <div className="rounded-xl border border-border bg-card p-5 text-sm space-y-2 text-muted-foreground leading-relaxed">
            <p>
              <strong className="text-foreground">Akademisk &gt; corporate.</strong> MIT/Stanford-
              kurs slår "Big Data Bootcamp"-Coursera-kurs på matematisk dybde og varighet.
            </p>
            <p>
              <strong className="text-foreground">Klassiske &gt; nye.</strong> Karpathys CS231n fra
              2016 er fortsatt der mange ML-folk lærer CNN. Ng's CS229 er pre-LLM men gir
              fundament som transformers bygger på. Alder ≠ utdatert i grunnfag.
            </p>
            <p>
              <strong className="text-foreground">Problem sets matters.</strong> Kurs uten
              øvelser/labs er underholdning, ikke utdanning. Alle 10 har faktisk arbeid å gjøre.
            </p>
            <p>
              <strong className="text-foreground">Bevisst utelatt:</strong> Coursera Specialization-
              er som koster penger. fast.ai (god, men nisje). Udacity Nanodegrees (dyre).
              freeCodeCamp (bra for web, ikke akademisk).
            </p>
          </div>
        </section>

        <section id="tier1" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Tier 1 — fundament</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Disse er bredt nyttige uansett spesialisering. Start her.
          </p>
          <div className="space-y-4">
            {tier1.map((m) => (
              <MoocCard key={m.id} mooc={m} />
            ))}
          </div>
        </section>

        <section id="tier2" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Tier 2 — fag-spesifikke</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Match disse mot UiT-fagene dine. Hvis du tar DTE-2505, kjør 6.S081 parallelt.
          </p>
          <div className="space-y-4">
            {tier2.map((m) => (
              <MoocCard key={m.id} mooc={m} />
            ))}
          </div>
        </section>

        <section id="tier3" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Tier 3 — alternativer / dypere</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Velg disse hvis Tier 2 ikke matcher din læringsstil eller du vil dypere.
          </p>
          <div className="space-y-4">
            {tier3.map((m) => (
              <MoocCard key={m.id} mooc={m} />
            ))}
          </div>
        </section>

        <section id="per-fag" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Per fag — hvor matcher hva?</h2>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-40">UiT-fag</th>
                  <th className="text-left font-semibold px-4 py-2">Beste MOOC</th>
                  <th className="text-left font-semibold px-4 py-2">Alternativ / komplement</th>
                </tr>
              </thead>
              <tbody>
                <FagRow fag="DTE-2505 Operativsystemer" primary="MIT 6.S081" extra="—" />
                <FagRow fag="DTE-2507 Datakommunikasjon" primary="Stanford CS144" extra="—" />
                <FagRow fag="DTE-2509 Databaser/Web" primary="CMU 15-445 (DB) + CS50W (web)" extra="CS50 dekker SQL i lecture 7" />
                <FagRow fag="DTE-2501 AI Methods" primary="CS229" extra="MIT 6.034 alternativ" />
                <FagRow fag="DTE-2602 ML intro" primary="CS229" extra="MIT 6.S191 hvis tid presser" />
                <FagRow fag="DTE-2502 Deep Learning" primary="CS231n (Karpathy)" extra="MIT 6.S191 (kortere)" />
                <FagRow fag="DTE-2511 Vid. programmering" primary="CS50 + 6.006" extra="Berkeley CS61A for funksjonell" />
                <FagRow fag="Algoritmer / DSA" primary="MIT 6.006" extra="—" />
                <FagRow fag="Trinn-fagene (CPU/minne)" primary="CS50 Lecture 4" extra="Ben Eater på YouTube" />
                <FagRow fag="Bachelor-prosjekt (DB)" primary="CMU 15-445" extra="Etter du har valgt DB" />
              </tbody>
            </table>
          </div>
        </section>

        <section id="planlegging" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Realistisk planlegging</h2>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm">
            <p className="leading-relaxed">
              <strong>Sannheten ingen sier:</strong> Du kommer ikke til å fullføre 5 MOOCs
              parallelt med UiT-fag. Velg <strong>1-2 per semester</strong> som matcher de
              tyngste pensum-fagene dine.
            </p>
            <p className="leading-relaxed text-muted-foreground">
              <strong className="text-foreground">Anbefalt strategi:</strong> Bruk MOOC-en som
              hovedforelesning hvis UiT-foreleseren er dårlig, eller som komplement hvis du
              trenger andre vinklinger. Ikke som "ekstra pensum" — du har ikke tid.
            </p>
            <p className="leading-relaxed text-muted-foreground">
              <strong className="text-foreground">Sommerstrategi:</strong> Sommerferien er der
              MOOCs faktisk fullføres. Velg ÉN MOOC som forberedelse til høstens tyngste fag.
              Gjør problem sets aktivt — passive forelesninger gir ikke retensjon.
            </p>
            <div className="pt-2 border-t border-border flex items-start gap-2 text-warning">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              <p className="text-xs">
                MOOC-fellen: registrér deg for 5, fullfør 0. Velg færre, men gå
                hele veien.
              </p>
            </div>
          </div>
        </section>
      </article>
    </StackPageShell>
  );
}

function MoocCard({ mooc: m }: { mooc: Mooc }) {
  return (
    <div id={m.id} className={`rounded-xl border ${TIER_COLORS[m.tier]} p-5 scroll-mt-20`}>
      <div className="flex items-start gap-3">
        <GraduationCap className="h-5 w-5 text-brand mt-1 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap mb-1">
            <h3 className="text-lg font-semibold">{m.navn}</h3>
            <span className="text-[10px] uppercase tracking-wider font-bold text-brand">
              tier {m.tier} · {TIER_LABEL[m.tier]}
            </span>
            {m.free && (
              <span className="text-[10px] uppercase tracking-wider font-bold text-success bg-success/10 rounded px-1.5">
                gratis
              </span>
            )}
          </div>
          <div className="text-xs text-muted-foreground mb-2">
            <span className="font-mono">{m.universitet}</span> · {m.forelesere}
          </div>
          <div className="text-xs text-muted-foreground mb-3 flex items-center gap-2 flex-wrap">
            <a
              href={m.url}
              target="_blank"
              rel="noreferrer"
              className="text-brand hover:underline inline-flex items-center gap-0.5"
            >
              Åpne kurs <ExternalLink className="h-3 w-3" />
            </a>
            <span className="opacity-50">·</span>
            <span>{m.plattform}</span>
            <span className="opacity-50">·</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {m.estimertTid}
            </span>
          </div>

          <div className="rounded-lg border border-border bg-background p-3 mb-3">
            <div className="text-[10px] uppercase tracking-wider font-semibold text-brand mb-2">
              Beste forelesninger (start her)
            </div>
            <ul className="space-y-1">
              {m.bestForelesninger.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-xs">
                  <Play className="h-3 w-3 mt-0.5 shrink-0 text-muted-foreground" />
                  <span>
                    <span className="font-medium">{f.tittel}</span>
                    {f.varighet && (
                      <span className="text-muted-foreground"> · {f.varighet}</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="text-xs">
            <span className="text-muted-foreground">Treffer fag: </span>
            {m.fag.map((f, i) => (
              <span key={i}>
                <span className="font-mono text-brand">{f}</span>
                {i < m.fag.length - 1 ? " · " : ""}
              </span>
            ))}
          </div>

          <details className="mt-3 text-xs text-muted-foreground">
            <summary className="cursor-pointer font-medium text-foreground hover:text-brand">
              Hvorfor akkurat dette kurset?
            </summary>
            <p className="mt-1.5 leading-relaxed">{m.hvorforHer}</p>
          </details>
        </div>
      </div>
    </div>
  );
}

function FagRow({ fag, primary, extra }: { fag: string; primary: string; extra: string }) {
  return (
    <tr className="border-t border-border">
      <td className="px-4 py-2.5 font-mono text-brand">{fag}</td>
      <td className="px-4 py-2.5 font-medium">{primary}</td>
      <td className="px-4 py-2.5 text-muted-foreground">{extra}</td>
    </tr>
  );
}
