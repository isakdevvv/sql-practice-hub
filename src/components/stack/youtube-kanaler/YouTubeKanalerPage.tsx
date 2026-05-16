import { ExternalLink, Youtube } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { MediaEmbed } from "@/components/stack/MediaEmbed";
import { CHANNELS, type Channel } from "./channels";

const STEPS = [
  { title: "Hvordan jeg har valgt", anchor: "metode" },
  { title: "Tier 1 — må kjenne til", anchor: "tier1" },
  { title: "Tier 2 — sterkt anbefalt", anchor: "tier2" },
  { title: "Tier 3 — situasjonelt", anchor: "tier3" },
  { title: "Per fag — quick-ref", anchor: "per-fag" },
];

const TIER_LABEL: Record<1 | 2 | 3, string> = {
  1: "Må ha",
  2: "Sterk anbefaling",
  3: "Situasjonelt",
};
const TIER_COLORS: Record<1 | 2 | 3, string> = {
  1: "border-brand/40 bg-brand/5",
  2: "border-success/40 bg-success/5",
  3: "border-muted bg-muted/30",
};

export function YouTubeKanalerPage() {
  const tier1 = CHANNELS.filter((c) => c.tier === 1);
  const tier2 = CHANNELS.filter((c) => c.tier === 2);
  const tier3 = CHANNELS.filter((c) => c.tier === 3);

  return (
    <StackPageShell title="YouTube-kanaler — kuratert for DTE-bachelor" group="stack">
      <article className="container mx-auto px-4 py-10 max-w-4xl">
        <header className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            Bibliotek · 12 kanaler som faktisk lærer deg noe
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            12 YouTube-kanaler en data-ingeniør faktisk trenger
          </h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Ikke "topp YouTubers" eller "100 must-watch videoer". 12 kanaler kuratert fordi DE ER
            BEST på sitt område. Hver kanal har én "best of"-video som beviser hvorfor — start
            der hvis du er usikker.
          </p>
        </header>

        <CourseOutline courseId="youtube-kanaler" steps={STEPS} />

        <section id="metode" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Hvordan jeg har valgt</h2>
          <div className="rounded-xl border border-border bg-card p-5 text-sm space-y-2 text-muted-foreground leading-relaxed">
            <p>
              <strong className="text-foreground">Forelesere over influencere.</strong> Mike
              Pound (Computerphile) og Andrew Ng er forskere som lærer for å hjelpe deg —
              ikke for views.
            </p>
            <p>
              <strong className="text-foreground">Konsept-dybde over hype.</strong> Two
              Minute Papers er på lista, ikke "Top 10 AI tools 2026"-typer.
            </p>
            <p>
              <strong className="text-foreground">Visuell pedagogikk vinner.</strong>{" "}
              3Blue1Brown og Sebastian Lague viser at animasjon &gt; tekst når matematikk og
              algoritmer skal forklares.
            </p>
            <p>
              <strong className="text-foreground">Bevisst utelatt:</strong> "X i 100 sekunder"-
              spam-kanaler, motivasjons-coding-talkers, kanaler som lever av tutorials
              (Traversy, Net Ninja) — gode, men du finner dem selv. Disse 12 er det jeg
              vurderer som det vanskeligste å snuble over.
            </p>
          </div>
        </section>

        <section id="tier1" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Tier 1 — må kjenne til</h2>
          <div className="space-y-4">
            {tier1.map((c) => (
              <ChannelCard key={c.id} channel={c} />
            ))}
          </div>
        </section>

        <section id="tier2" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Tier 2 — sterkt anbefalt</h2>
          <div className="space-y-4">
            {tier2.map((c) => (
              <ChannelCard key={c.id} channel={c} />
            ))}
          </div>
        </section>

        <section id="tier3" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Tier 3 — situasjonelt</h2>
          <div className="space-y-4">
            {tier3.map((c) => (
              <ChannelCard key={c.id} channel={c} />
            ))}
          </div>
        </section>

        <section id="per-fag" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Per fag — hvor skal jeg starte?</h2>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-40">Fag</th>
                  <th className="text-left font-semibold px-4 py-2">Beste kanal</th>
                  <th className="text-left font-semibold px-4 py-2">Komplement</th>
                </tr>
              </thead>
              <tbody>
                <FagRow fag="TEK-1501 Statistikk" primary="3Blue1Brown" extra="Stanford Online (CS229 første forelesninger)" />
                <FagRow fag="DTE-2505 OS" primary="Computerphile + Ben Eater" extra="MIT 6.S081 forelesninger" />
                <FagRow fag="DTE-2507 Datakomm" primary="Computerphile" extra="MIT/Stanford CS144" />
                <FagRow fag="DTE-2509 Databaser/Web" primary="Fireship" extra="The Coding Train for kreative web-prosjekter" />
                <FagRow fag="DTE-2501 AI" primary="Computerphile + Two Minute Papers" extra="Stanford CS221 lectures" />
                <FagRow fag="DTE-2602 ML intro" primary="3Blue1Brown + Stanford Online" extra="Karpathy for kode" />
                <FagRow fag="DTE-2502 Deep Learning" primary="Andrej Karpathy" extra="3Blue1Brown for matte" />
                <FagRow fag="Trinn 1-9 (CPU)" primary="Ben Eater" extra="Computerphile" />
                <FagRow fag="DTE-2511 Vid. prog." primary="NeetCode" extra="The Coding Train + Strange Loop" />
                <FagRow fag="DTE-2604 Systemutvikling" primary="Strange Loop & GOTO" extra="Fireship for tech-orientering" />
              </tbody>
            </table>
          </div>
        </section>

        <div className="mt-8 rounded-lg border border-warning/40 bg-warning/5 p-4 text-sm">
          <strong>YouTube-fellen:</strong> Det er lett å se 5 timer videoer og føle at du har
          studert. Du har ikke. Bruk videoer til å bygge intuisjon, men løs deretter problemer
          aktivt — ellers blir det passivt forbruk uten retensjon.
        </div>
      </article>
    </StackPageShell>
  );
}

function ChannelCard({ channel: c }: { channel: Channel }) {
  return (
    <div id={c.id} className={`rounded-xl border ${TIER_COLORS[c.tier]} p-5 scroll-mt-20`}>
      <div className="flex items-start gap-3">
        <Youtube className="h-5 w-5 text-destructive mt-1 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap mb-1">
            <h3 className="text-lg font-semibold">{c.navn}</h3>
            <span className="text-[10px] uppercase tracking-wider font-bold text-brand">
              tier {c.tier} · {TIER_LABEL[c.tier]}
            </span>
          </div>
          <div className="text-xs text-muted-foreground mb-3">
            {c.forfatter} ·{" "}
            <a
              href={c.url}
              target="_blank"
              rel="noreferrer"
              className="text-brand hover:underline inline-flex items-center gap-0.5"
            >
              Åpne kanal <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <p className="text-sm leading-relaxed mb-3">{c.blurb}</p>

          <div className="mb-3">
            <div className="text-[10px] uppercase tracking-wider font-semibold text-brand mb-1">
              Start her — {c.bestVideo.varighet}
            </div>
            <MediaEmbed
              kind="youtube"
              src={c.bestVideo.videoId}
              title={c.bestVideo.tittel}
              externalUrl={c.bestVideo.url}
            />
          </div>

          <div className="text-xs">
            <span className="text-muted-foreground">Treffer fag: </span>
            {c.fag.map((f, i) => (
              <span key={i}>
                <span className="font-mono text-brand">{f}</span>
                {i < c.fag.length - 1 ? " · " : ""}
              </span>
            ))}
          </div>

          <details className="mt-3 text-xs text-muted-foreground">
            <summary className="cursor-pointer font-medium text-foreground hover:text-brand">
              Hvorfor akkurat denne kanalen?
            </summary>
            <p className="mt-1.5 leading-relaxed">{c.hvorforHer}</p>
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
