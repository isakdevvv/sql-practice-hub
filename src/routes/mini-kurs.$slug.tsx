import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { MiniKursPlayer } from "@/components/mini-kurs/MiniKursPlayer";
import { getMiniCourse } from "@/lib/mini-kurs/courses";

export const Route = createFileRoute("/mini-kurs/$slug")({
  loader: ({ params }) => {
    const course = getMiniCourse(params.slug);
    if (!course) throw notFound();
    return { course };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.course.title} — Mini-kurs` },
      { name: "description", content: loaderData?.course.blurb },
    ],
  }),
  component: MiniKursDetail,
});

function MiniKursDetail() {
  const { course } = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <Link
          to="/mini-kurs"
          className="text-sm text-muted-foreground hover:text-foreground mb-3 inline-flex items-center"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Alle mini-kurs
        </Link>

        <header className="mb-6">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-1">
            Mini-kurs
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{course.title}</h1>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{course.blurb}</p>
        </header>

        <MiniKursPlayer course={course} />
      </main>
    </div>
  );
}
