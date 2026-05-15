import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { lessonBySlug } from "@/lib/viz-lesjon";
import { LessonRenderer } from "@/components/viz-lesjon/LessonRenderer";

export const Route = createFileRoute("/viz-lesjon/$slug")({
  loader: ({ params }) => {
    const lesson = lessonBySlug(params.slug);
    if (!lesson) throw notFound();
    return { lesson };
  },
  head: ({ loaderData }) =>
    loaderData
      ? {
          meta: [
            { title: `${loaderData.lesson.title} — Lesjon` },
            { name: "description", content: loaderData.lesson.blurb },
          ],
        }
      : {},
  component: VizLesjon,
});

function VizLesjon() {
  const { lesson } = Route.useLoaderData();
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Link
          to="/viz-lesjon"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Alle lesjoner
        </Link>
        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {lesson.title}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-2xl leading-relaxed">
            {lesson.blurb}
          </p>
        </header>
        <LessonRenderer lesson={lesson} />
      </main>
    </div>
  );
}
