import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { TRINN } from "@/lib/stack/content";

export const Route = createFileRoute("/eksamen/")({
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

// Stack-slugs gruppert etter offisiell DTE-2509-modul. Alt utenom dette
// settet vises i bunn-seksjonen "Andre eksamen-trinn".
type ModulSpec = {
  nr: string;
  title: string;
  blurb: string;
  slugs: string[];
};

const DTE_2509_MODULER: ModulSpec[] = [
  {
    nr: "1",
    title: "HTML, CSS og Git",
    blurb: "Statisk struktur, semantiske tags, Bootstrap, og versjonskontroll.",
    slugs: ["html-jinja"],
  },
  {
    nr: "2",
    title: "Flask Basics",
    blurb: "App, routing, render_template, forms — request-livssyklus fra ende til annen.",
    slugs: ["flask-livssyklus", "python-drill"],
  },
  {
    nr: "3",
    title: "Database — DDL, design, CRUD",
    blurb:
      "Normalisering, ER → relasjonsmodell, nøkler, subqueries, og MySQL-syntaks vs SQLite.",
    slugs: ["normalisering", "er-mapping", "nokler", "subqueries", "mysql-vs-sqlite", "bytes-encoding"],
  },
  {
    nr: "4",
    title: "User Management",
    blurb:
      "Register, login, sessions, @login_required, logout — full auth-flyt med Flask-Login.",
    slugs: ["brukerhandtering", "mvc-monster"],
  },
  {
    nr: "5",
    title: "API og HTTP",
    blurb: "HTTP-anatomi, statuskoder, GET/POST/PUT/DELETE, JSON-respons.",
    slugs: ["http-anatomi"],
  },
  {
    nr: "6",
    title: "Sikkerhet",
    blurb: "SQL injection, XSS, CSRF — sårbare mønstre og motstandsdyktige.",
    slugs: ["sikkerhet"],
  },
];

function EksamenHub() {
  const eksamenTrinn = TRINN.filter((t) => t.group === "eksamen" && t.status === "ready");
  const bySlug = new Map(eksamenTrinn.map((t) => [t.slug, t]));
  const gruppertSlugs = new Set(DTE_2509_MODULER.flatMap((m) => m.slugs));
  const andre = eksamenTrinn.filter((t) => !gruppertSlugs.has(t.slug));

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
            inngang til stack-trinnene som dekker det offisielle pensumet.
          </p>
        </div>

        <section className="mb-10">
          <h2 className="text-xl font-bold tracking-tight mb-3">Trening og innlevering</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <HubCard
              href="/eksamen/trening"
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

        {/* Modul-gruppert oversikt for DTE-2509 */}
        <section className="mb-10">
          <h2 className="text-xl font-bold tracking-tight mb-1">DTE-2509 — modul for modul</h2>
          <p className="text-xs text-muted-foreground mb-5">
            Gruppert etter offisielt pensum-skjema. Hver modul-blokk lenker direkte til
            stack-trinnene som dekker det temaet.
          </p>
          <div className="space-y-6">
            {DTE_2509_MODULER.map((m) => {
              const trinn = m.slugs.map((s) => bySlug.get(s)).filter((t): t is NonNullable<typeof t> => Boolean(t));
              if (trinn.length === 0) return null;
              return (
                <div key={m.nr}>
                  <div className="flex items-baseline gap-3 mb-2">
                    <span className="text-xs font-semibold text-brand">MODUL {m.nr}</span>
                    <h3 className="text-base font-semibold text-foreground">{m.title}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{m.blurb}</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {trinn.map((t) => (
                      <HubCard
                        key={t.id}
                        href={`/stack/${t.slug}`}
                        title={t.title}
                        body={t.shortDescription}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {andre.length > 0 && (
          <section>
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="text-xl font-bold tracking-tight">Andre eksamen-trinn</h2>
              <span className="text-xs text-muted-foreground tabular-nums">
                {andre.length} trinn
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Stoff fra andre fag som også kan være relevant — algoritmer, ML, nettverk, OS.
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {andre.map((t) => (
                <HubCard
                  key={t.id}
                  href={`/stack/${t.slug}`}
                  title={t.title}
                  body={t.shortDescription}
                />
              ))}
            </div>
          </section>
        )}
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
