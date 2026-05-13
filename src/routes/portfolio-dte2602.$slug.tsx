import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { PortfolioRunner } from "@/components/stack/dte-2602-portfolio/PortfolioRunner";
import { DTE2602_PORTFOLIO_TRACKS, getTrack } from "@/lib/python/portfolio-dte2602";

export const Route = createFileRoute("/portfolio-dte2602/$slug")({
  beforeLoad: ({ params }) => {
    if (!getTrack(params.slug)) throw notFound();
  },
  head: ({ params }) => {
    const t = getTrack(params.slug);
    return {
      meta: [
        { title: t ? `${t.title} — DTE-2602` : "DTE-2602 portefølje" },
        {
          name: "description",
          content:
            t?.intro ??
            "DTE-2602 porteføljespor — kjør Python rett i nettleseren.",
        },
      ],
    };
  },
  component: PortfolioPage,
  notFoundComponent: NotFoundComponent,
});

function PortfolioPage() {
  const { slug } = Route.useParams();
  const track = getTrack(slug);
  if (!track) return null;
  return <PortfolioRunner track={track} />;
}

function NotFoundComponent() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-6 text-sm">
          <h1 className="text-xl font-semibold mb-2">Fant ikke porteføljespor</h1>
          <p className="text-muted-foreground">Tilgjengelige spor:</p>
          <ul className="mt-3 list-disc pl-5 space-y-1">
            {DTE2602_PORTFOLIO_TRACKS.map((t) => (
              <li key={t.slug}>
                <Link
                  to="/portfolio-dte2602/$slug"
                  params={{ slug: t.slug }}
                  className="text-brand hover:underline"
                >
                  {t.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}
