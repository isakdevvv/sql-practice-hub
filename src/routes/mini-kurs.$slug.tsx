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
      <main className="container mx-auto px-4 py-4 sm:py-5 max-w-[1400px]">
        <div className="flex items-baseline gap-3 mb-3 flex-wrap">
          <Link
            to="/mini-kurs"
            className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Alle mini-kurs
          </Link>
          <span className="text-xs uppercase tracking-wider text-brand font-semibold">
            Mini-kurs
          </span>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight">{course.title}</h1>
        </div>

        <MiniKursPlayer course={course} />
      </main>
    </div>
  );
}
