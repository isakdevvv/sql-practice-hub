import { createFileRoute, notFound } from "@tanstack/react-router";
import { getTrinnBySlug } from "@/lib/stack/content";

export const Route = createFileRoute("/stack/$slug")({
  component: TrinnPage,
  loader: ({ params }) => {
    if (!getTrinnBySlug(params.slug)) throw notFound();
  },
});

function TrinnPage() {
  const { slug } = Route.useParams();
  const trinn = getTrinnBySlug(slug);
  if (!trinn) return null;
  const Component = trinn.Component;
  return <Component />;
}
