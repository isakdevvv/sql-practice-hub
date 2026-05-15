import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect } from "react";
import { getTrinnBySlug } from "@/lib/stack/content";
import { recordVisit } from "@/lib/userSubjects";

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
  return <Component />;
}
