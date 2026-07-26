import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Beaker,
  BookOpen,
  CalendarClock,
  Dumbbell,
  Flame,
  GraduationCap,
  Pin,
  PinOff,
  RefreshCw,
  Zap,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { LibraryCard } from "@/components/library/LibraryCard";
import { LIBRARY, type LibraryItem, type LibraryKind } from "@/lib/library";
import { SUBJECT_BY_SLUG, EXAM_META } from "@/lib/subjects/catalog";
import { examUrgency, formatDaysUntil, type ExamUrgency } from "@/lib/subjects/examDate";
import { phaseOfSlug } from "@/lib/stack/curriculum";
import { useModulProgress } from "@/lib/stack/moduleProgress";
import { usePinnedSubjects, toggleSubject } from "@/lib/userSubjects";

export const Route = createFileRoute("/fag/$slug")({
  head: () => ({
    meta: [
      { title: "Fag — alt samlet på ett sted" },
      {
        name: "description",
        content:
          "Alt for ett emne på én side: kurs, simulatorer, drills, fremdrift og eksamens-nedtelling.",
      },
    ],
  }),
  loader: ({ params }) => {
    if (!SUBJECT_BY_SLUG[params.slug]) throw notFound();
  },
  component: FagPage,
});

// Samme urgens-farger som mine-fag bruker for countdown-pillen.
function urgencyClasses(u: ExamUrgency): string {
  switch (u) {
    case "urgent":
      return "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/40";
    case "soon":
      return "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/40";
    case "later":
      return "bg-brand/10 text-brand border-brand/30";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

const KIND_SECTIONS: { kind: LibraryKind; title: string; blurb: string; Icon: typeof Beaker }[] = [
  {
    kind: "laer",
    title: "Lær — kurs og løp",
    blurb: "Strukturerte løp som dekker pensum steg for steg.",
    Icon: BookOpen,
  },
  {
    kind: "lek",
    title: "Lek — simulatorer og sandkasser",
    blurb: "Dra parametere og se konseptene bevege seg.",
    Icon: Beaker,
  },
  {
    kind: "test",
    title: "Test — oppgaver og drill",
    blurb: "Sjekk at det sitter.",
    Icon: Dumbbell,
  },
];

// Fag-uavhengige test-verktøy som alltid er relevante uansett emne.
const GLOBAL_TOOLS: { href: string; label: string; blurb: string; Icon: typeof Zap }[] = [
  {
    href: "/repetisjon",
    label: "Due i dag",
    blurb: "Samlet spaced repetition-kø på tvers av alle verktøy.",
    Icon: RefreshCw,
  },
  {
    href: "/drill",
    label: "Drill-hub",
    blurb: "Alle drill-øvinger med søk og fag-filter.",
    Icon: Dumbbell,
  },
  {
    href: "/cards",
    label: "Flashcards",
    blurb: "Spaced repetition på tvers av temaer.",
    Icon: Zap,
  },
];

function FagPage() {
  const { slug } = Route.useParams();
  const subject = SUBJECT_BY_SLUG[slug];
  const pinnedSlugs = usePinnedSubjects();

  const meta = EXAM_META[slug];
  const u = examUrgency(meta?.eksamen);

  // Fagets curriculum-fase — brukes til fremdrift ("X av Y sider sett").
  // Kun meningsfullt når faget selv er hub-en (første slug) i fasen.
  const phase = useMemo(() => {
    const p = phaseOfSlug(slug);
    return p && p.slugs[0] === slug ? p : null;
  }, [slug]);
  const progress = useModulProgress(phase ? [...phase.slugs] : []);

  const itemsByKind = useMemo(() => {
    const map = new Map<LibraryKind, LibraryItem[]>();
    for (const item of LIBRARY) {
      if (item.subjectSlug !== slug) continue;
      if (!map.has(item.kind)) map.set(item.kind, []);
      map.get(item.kind)!.push(item);
    }
    return map;
  }, [slug]);

  if (!subject) return null;
  const Icon = subject.Icon;
  const pinned = pinnedSlugs.includes(slug);
  const totalItems = [...itemsByKind.values()].reduce((n, arr) => n + arr.length, 0);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="border-b border-border bg-gradient-to-br from-brand/5 via-background to-success/5">
          <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
            <Link
              to="/mine-fag"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Mine fag
            </Link>

            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand/15">
                <Icon className="h-6 w-6 text-brand" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-brand uppercase tracking-wider">
                    {subject.code}
                  </span>
                  {meta && <span className="text-xs text-muted-foreground">{meta.stp} stp</span>}
                </div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight mt-0.5">
                  {subject.navn}
                </h1>
                <p className="mt-2 text-sm text-muted-foreground max-w-2xl">{subject.blurb}</p>
              </div>
              <button
                type="button"
                onClick={() => toggleSubject(slug)}
                aria-pressed={pinned}
                title={pinned ? "Fjern fra Mine fag" : "Lagre i Mine fag"}
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md border transition-colors ${
                  pinned
                    ? "border-brand bg-brand/15 text-brand hover:bg-brand/25"
                    : "border-border bg-background/60 text-muted-foreground hover:border-brand/60 hover:text-brand"
                }`}
              >
                {pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
              </button>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link
                to="/stack/$slug"
                params={{ slug }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground hover:opacity-90 transition-opacity"
              >
                <GraduationCap className="h-4 w-4" />
                Åpne kurset
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>

              {meta && (
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${urgencyClasses(u.urgency)}`}
                  title={meta.eksamen}
                >
                  {u.urgency === "urgent" ? (
                    <Flame className="h-3.5 w-3.5" />
                  ) : (
                    <CalendarClock className="h-3.5 w-3.5" />
                  )}
                  {u.days != null && u.days >= 0
                    ? `Eksamen om ${formatDaysUntil(u.days)} — ${meta.eksamen}`
                    : meta.eksamen}
                </span>
              )}
            </div>

            {/* Fremdrift i fagets læringsløp */}
            {phase && progress.total > 0 && (
              <div className="mt-5 max-w-md">
                <div className="flex items-baseline justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">Fremdrift i læringsløpet</span>
                  <span className="font-semibold tabular-nums">
                    {progress.seen} av {progress.total} sider sett
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand to-success transition-all"
                    style={{ width: `${Math.round((progress.seen / progress.total) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Innhold gruppert etter Lek/Lær/Test — samme tredeling som headeren */}
        <section className="container mx-auto px-4 py-10 max-w-5xl space-y-10">
          {totalItems === 0 && (
            <div className="rounded-xl border-2 border-dashed border-border bg-card/40 p-8 text-center text-sm text-muted-foreground">
              Ingen egne verktøy er koblet til dette faget enda — kurset over er stedet å starte.
            </div>
          )}

          {KIND_SECTIONS.map(({ kind, title, blurb, Icon: SectionIcon }) => {
            const items = itemsByKind.get(kind);
            if (!items || items.length === 0) return null;
            return (
              <div key={kind}>
                <div className="mb-4 flex items-center gap-2">
                  <SectionIcon className="h-4 w-4 text-brand" />
                  <div>
                    <h2 className="text-lg font-bold tracking-tight leading-tight">{title}</h2>
                    <p className="text-xs text-muted-foreground">{blurb}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((it) => (
                    <LibraryCard key={it.slug} item={it} />
                  ))}
                </div>
              </div>
            );
          })}

          {/* Fag-uavhengige verktøy — alltid tilgjengelige */}
          <div>
            <div className="mb-4">
              <h2 className="text-lg font-bold tracking-tight leading-tight">
                Verktøy på tvers av fag
              </h2>
              <p className="text-xs text-muted-foreground">
                Repetisjonskø og drill-verktøy som dekker alle emner.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {GLOBAL_TOOLS.map(({ href, label, blurb: toolBlurb, Icon: ToolIcon }) => (
                <a
                  key={href}
                  href={href}
                  className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:border-brand/60 hover:shadow-md"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brand/10 text-brand">
                    <ToolIcon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold">{label}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1">{toolBlurb}</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t border-border">
        <div className="container mx-auto px-4 py-6 text-xs text-muted-foreground text-center">
          Læringsplattform · Fremgang lagres lokalt i nettleseren.
        </div>
      </footer>
    </div>
  );
}
