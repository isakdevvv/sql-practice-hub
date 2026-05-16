import { createFileRoute, notFound } from "@tanstack/react-router";
import { Suspense, useEffect } from "react";
import { getTrinnBySlug } from "@/lib/stack/content";
import { recordVisit } from "@/lib/userSubjects";
import { SiteHeader } from "@/components/SiteHeader";

const COURSE_SLUGS = new Set([
  "dte-2509",
  "dte-2802",
  "dte-2501",
  "dte-2602",
  "dte-2502",
  "dte-2505",
  "dte-2507",
  "tek-1501",
  "dte-2603",
  "dte-2604",
]);

export const Route = createFileRoute("/stack/$slug")({
  component: TrinnPage,
  loader: ({ params }) => {
    if (!getTrinnBySlug(params.slug)) throw notFound();
  },
});

function TrinnPage() {
  const { slug } = Route.useParams();
  const trinn = getTrinnBySlug(slug);
  useEffect(() => {
    if (COURSE_SLUGS.has(slug)) recordVisit(slug);
  }, [slug]);
  if (!trinn) return null;
  const Component = trinn.Component;
  return (
    <Suspense fallback={<TrinnLoading />}>
      <Component />
    </Suspense>
  );
}

function TrinnLoading() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="animate-pulse space-y-4">
          <div className="h-3 w-24 bg-muted rounded" />
          <div className="h-9 w-2/3 bg-muted rounded" />
          <div className="h-4 w-full bg-muted/60 rounded" />
          <div className="h-4 w-5/6 bg-muted/60 rounded" />
          <div className="h-40 w-full bg-muted/40 rounded-xl mt-6" />
        </div>
      </main>
    </div>
  );
}
