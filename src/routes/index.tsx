import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { PROBLEMS } from "@/lib/problems/data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SQL Sandbox — Master SQL with 50 hands-on problems" },
      {
        name: "description",
        content:
          "Practice SQL in your browser with a realistic e-commerce dataset, instant feedback, and progress tracking. 50 problems across 6 levels.",
      },
      { property: "og:title", content: "SQL Sandbox — Master SQL with 50 hands-on problems" },
      {
        property: "og:description",
        content:
          "Browser-based SQL practice with sandboxed SQLite, result-based grading, hints, and XP tracking.",
      },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  const totals = {
    problems: PROBLEMS.length,
    levels: 6,
    topics: new Set(PROBLEMS.flatMap((p) => p.topics)).size,
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border">
          <div
            className="absolute inset-0 -z-10 opacity-40"
            style={{
              backgroundImage:
                "radial-gradient(60% 60% at 50% 0%, color-mix(in oklab, var(--brand) 35%, transparent), transparent)",
            }}
          />
          <div className="container mx-auto px-4 py-20 md:py-28 text-center max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              Runs entirely in your browser — no signup
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Master SQL with{" "}
              <span className="bg-gradient-to-r from-brand to-success bg-clip-text text-transparent">
                hands-on practice
              </span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Write real queries against a realistic e-commerce database. Get instant feedback,
              progressive hints, and track your progress across {totals.problems} problems.
            </p>
            <div className="mt-8 flex items-center justify-center gap-3">
              <Button asChild size="lg">
                <Link to="/kurs">Start fra nivå 0 →</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/practice">Bla i alle oppgaver</Link>
              </Button>
            </div>
            <div className="mt-12 grid grid-cols-3 gap-6 max-w-md mx-auto text-left">
              <Stat label="Problems" value={String(totals.problems)} />
              <Stat label="Levels" value={String(totals.levels)} />
              <Stat label="Topics" value={String(totals.topics)} />
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="container mx-auto px-4 py-20 max-w-5xl">
          <h2 className="text-3xl font-bold text-center tracking-tight">
            Built for actually learning
          </h2>
          <p className="mt-3 text-center text-muted-foreground max-w-xl mx-auto">
            Not a quiz site. A SQL workbench with feedback that teaches.
          </p>
          <div className="mt-12 grid md:grid-cols-3 gap-5">
            <Feature
              title="Real SQLite, in your browser"
              body="Queries run on a real SQLite engine compiled to WebAssembly. No server, no signup, no rate limits."
            />
            <Feature
              title="Result-based grading"
              body="Your output is compared to the expected result set — there's never just one 'right' way to write a query."
            />
            <Feature
              title="Persistent dataset"
              body="Every problem uses the same e-commerce schema, so you build a real mental model of the data."
            />
            <Feature
              title="Progressive hints"
              body="Stuck? Reveal hints one at a time before peeking at the full solution and explanation."
            />
            <Feature
              title="XP, streaks & mastery"
              body="Earn XP per solve, build a streak, and see exactly which topics still need work."
            />
            <Feature
              title="Exam mode"
              body="Timed, mixed-difficulty sessions to pressure-test your skills before an interview."
            />
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border bg-card/30">
          <div className="container mx-auto px-4 py-16 text-center max-w-2xl">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
              Pick a problem and write your first query.
            </h2>
            <div className="mt-6">
              <Button asChild size="lg">
                <Link to="/practice">Browse problems</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t border-border">
        <div className="container mx-auto px-4 py-6 text-xs text-muted-foreground text-center">
          SQL Sandbox · Built with sql.js · Progress saved locally in your browser.
        </div>
      </footer>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="text-2xl font-bold text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">{label}</div>
    </div>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{body}</p>
    </div>
  );
}
