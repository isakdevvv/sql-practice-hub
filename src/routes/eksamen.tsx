import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { TRINN } from "@/lib/stack/content";

export const Route = createFileRoute("/eksamen")({
  head: () => ({
    meta: [
      { title: "Eksamen — tidsmodus, prosjekt og forberedelse" },
      {
        name: "description",
        content:
          "Alt for eksamensinnspurten samlet: tidsbasert eksamenstrening, prosjektoppgave, og direkte lenker til de eksamen-relevante stack-trinnene.",
      },
    ],
  }),
  component: EksamenHub,
});

function EksamenHub() {
  const eksamenTrinn = TRINN.filter((t) => t.group === "eksamen");

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground mb-4">
            Hub
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Eksamen —{" "}
            <span className="bg-gradient-to-r from-brand to-success bg-clip-text text-transparent">
              innspurten
            </span>
          </h1>
          <p className="mt-4 text-muted-foreground max-w-2xl">
            Alt du trenger for DTE-2509-1 samlet: tidsbasert trening, prosjektoppgaven, og direkte
            inngang til de syv stack-trinnene som dekker det som faktisk testes.
          </p>
        </div>

        <section className="mb-10">
          <h2 className="text-xl font-bold tracking-tight mb-3">Trening og innlevering</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <HubCard
              href="/exam"
              title="Tidsbasert eksamenstrening"
              body="Mixed-difficulty, klokke som teller ned. Pressetest deg selv før dagen."
              prominent
            />
            <HubCard
              href="/prosjekt"
              title="Prosjekt"
              body="Den større prosjektoppgaven — design, implementer, lever."
              prominent
            />
          </div>
        </section>

        <section>
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-xl font-bold tracking-tight">Stack-trinn for eksamen</h2>
            <span className="text-xs text-muted-foreground tabular-nums">
              {eksamenTrinn.length} trinn
            </span>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {eksamenTrinn.map((t) => (
              <HubCard
                key={t.id}
                href={`/stack/${t.slug}`}
                title={t.title}
                body={t.shortDescription}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function HubCard({
  href,
  title,
  body,
  prominent = false,
}: {
  href: string;
  title: string;
  body: string;
  prominent?: boolean;
}) {
  const accent = prominent
    ? "border-brand/50 bg-brand/5 hover:border-brand"
    : "border-border bg-card hover:border-brand/40";
  return (
    <Link to={href} className={`group rounded-xl border p-5 transition-colors block ${accent}`}>
      <h3 className="font-semibold text-foreground leading-tight mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
    </Link>
  );
}
