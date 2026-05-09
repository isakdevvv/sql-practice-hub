import { createFileRoute, notFound } from "@tanstack/react-router";
import { getTrinnBySlug } from "@/lib/stack/content";

export const Route = createFileRoute("/stack/$slug")({
  component: TrinnPage,
  loader: ({ params }) => {
    const trinn = getTrinnBySlug(params.slug);
    if (!trinn) throw notFound();
    return { trinn };
  },
});

function TrinnPage() {
  const { trinn } = Route.useLoaderData();
  const Component = trinn.Component;
  return <Component />;
}
