import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { TRINN } from "@/lib/stack/content";
import { PROBLEMS } from "@/lib/problems/data";

export const Route = createFileRoute("/lar")({
  head: () => ({
    meta: [
      { title: "Lær — kurs, konsepter og hele stacken" },
      {
        name: "description",
        content:
          "Tre veier inn i pensum: stegvis kurs, frittstående konsept-forklaringer, og dypdykk fra bytes til Flask.",
      },
    ],
  }),
  component: LarHub,
});

function LarHub() {
  const eksamenStack = TRINN.filter((t) => t.group === "eksamen").length;
  const totalProblems = PROBLEMS.length;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground mb-4">
            Hub
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Lær —{" "}
            <span className="bg-gradient-to-r from-brand to-success bg-clip-text text-transparent">
              tre veier inn i pensum
            </span>
          </h1>
          <p className="mt-4 text-muted-foreground max-w-2xl">
            Velg det som passer der du er nå. Følg en stegvis sti, slå opp ett konsept, eller gå
            dypt under panseret. Du kan hoppe mellom dem når som helst.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <HubCard
            href="/kurs"
            title="Kurs — stegvis SQL"
            badge={`6 nivåer · ${totalProblems} oppgaver`}
            body="Følg en låst sti fra SELECT til vinduer og CTE. Lås opp ett nivå om gangen."
            prominent
          />
          <HubCard
            href="/stack"
            title="Stack — bytes til Flask"
            badge={`${eksamenStack} eksamen-trinn`}
            body="Hva er bytes, sockets, HTTP-anatomi og Flask-livssyklus, egentlig. Akkurat det eksamen tester."
            prominent
          />
          <HubCard
            href="/learn"
            title="Lær — konsepter"
            body="Frittstående forklaringer av JOIN, GROUP BY, NULL og resten — slå opp når du står fast."
          />
          <HubCard
            href="/stack/huskelapp"
            title="SQL-huskelapp"
            body="Alt om SELECT, JOIN, NULL, DDL — én side, søkbar. Den raskeste oppslagsboka."
          />
        </div>
      </main>
    </div>
  );
}

function HubCard({
  href,
  title,
  body,
  badge,
  prominent = false,
}: {
  href: string;
  title: string;
  body: string;
  badge?: string;
  prominent?: boolean;
}) {
  const accent = prominent
    ? "border-brand/50 bg-brand/5 hover:border-brand"
    : "border-border bg-card hover:border-brand/40";
  return (
    <Link
      to={href}
      className={`group rounded-xl border p-5 transition-colors block ${accent}`}
    >
      <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
        <h3 className="font-semibold text-foreground leading-tight">{title}</h3>
        {badge && (
          <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
            {badge}
          </span>
        )}
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
    </Link>
  );
}
