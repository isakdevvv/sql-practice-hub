import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { getTrinnByGroup } from "@/lib/stack/content";
import type { TrinnContent } from "@/lib/stack/types";

export const Route = createFileRoute("/stack/")({
  head: () => ({
    meta: [
      { title: "Stack — fra transistor til Flask" },
      {
        name: "description",
        content:
          "Stegvis reise fra transistorer til en levende Flask-app. Eksamensforberedelse først, så hele stacken under panseret.",
      },
    ],
  }),
  component: StackLandingPage,
});

function StackLandingPage() {
  const eksamen = getTrinnByGroup("eksamen");
  const stack = getTrinnByGroup("stack");

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight">
            Stack — fra{" "}
            <span className="bg-gradient-to-r from-brand to-success bg-clip-text text-transparent">
              bytes til Flask
            </span>
          </h1>
          <p className="mt-4 text-muted-foreground max-w-2xl">
            Det du må kunne til <strong className="text-foreground">eksamen</strong>: bytes,
            sockets, HTTP-anatomi, ER-mapping og Flask-livssyklus.
          </p>
        </div>

        {eksamen.length > 0 && (
          <section className="mb-12">
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="text-2xl font-bold tracking-tight">Eksamensforberedelse</h2>
              <span className="text-xs text-muted-foreground tabular-nums">
                {eksamen.length} trinn
              </span>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {eksamen.map((t) => (
                <TrinnCard key={t.id} trinn={t} prominent />
              ))}
            </div>
          </section>
        )}

        {stack.length > 0 && (
          <section>
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="text-2xl font-bold tracking-tight">
                Hele stacken — fra hardware til web
              </h2>
              <span className="text-xs text-muted-foreground tabular-nums">
                {stack.length} trinn
              </span>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {stack.map((t) => (
                <TrinnCard key={t.id} trinn={t} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function TrinnCard({ trinn, prominent = false }: { trinn: TrinnContent; prominent?: boolean }) {
  const isReady = trinn.status === "ready";
  const accent = prominent
    ? isReady
      ? "border-brand/50 bg-brand/5 hover:border-brand"
      : "border-border bg-card hover:border-brand/40"
    : isReady
      ? "border-border bg-card hover:border-brand/40"
      : "border-border/60 bg-card/40 hover:border-border";

  return (
    <Link
      to="/stack/$slug"
      params={{ slug: trinn.slug }}
      className={`group rounded-xl border p-4 transition-colors block ${accent} ${
        prominent ? "" : "opacity-90"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md font-bold text-sm tabular-nums ${
            prominent
              ? "bg-brand text-brand-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {trinn.order}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h3 className="font-semibold text-foreground leading-tight">{trinn.title}</h3>
            <span
              className={`text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded ${
                isReady
                  ? "bg-success/15 text-success"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {isReady ? "Klar" : "Kommer snart"}
            </span>
          </div>
          <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
            {trinn.shortDescription}
          </p>
        </div>
      </div>
    </Link>
  );
}
