import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
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
import {
  examUrgency,
  formatDaysUntil,
  formatExamEvent,
  nextExamEvent,
  type ExamUrgency,
} from "@/lib/subjects/examDate";
import { phaseOfSlug } from "@/lib/stack/curriculum";
import { useModulProgress } from "@/lib/stack/moduleProgress";
import { usePinnedSubjects, toggleSubject } from "@/lib/userSubjects";
import { subjectSnapshot, type SubjectSnapshot } from "@/lib/core/subjectProgress";
import { blocksForSubject, phaseFoundations, type Block, type Foundation } from "@/lib/core/path";

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
  const nextEvent = useMemo(() => nextExamEvent(meta?.events), [meta]);

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

  // Engine-tall (kort, oppgaver, due) og kloss-stien leser localStorage —
  // kun etter mount, så SSR og klient rendrer likt.
  const [snapshot, setSnapshot] = useState<SubjectSnapshot | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [foundations, setFoundations] = useState<Foundation[]>([]);
  useEffect(() => {
    setSnapshot(subjectSnapshot(slug));
    setBlocks(blocksForSubject(slug));
    setFoundations(phaseFoundations(slug));
  }, [slug]);

  // Neste kloss = første som ikke er mestret. Der sjekker finnes teller
  // mestring, ellers faller vi tilbake på «sett».
  const nextBlock = useMemo(() => {
    const idx = blocks.findIndex((b) => (b.hasChecks ? !b.mastered : !b.seen));
    return idx === -1 ? null : { block: blocks[idx], index: idx };
  }, [blocks]);

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
              {nextBlock ? (
                <>
                  <a
                    href={`/stack/${nextBlock.block.slug}`}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground hover:opacity-90 transition-opacity"
                  >
                    <GraduationCap className="h-4 w-4" />
                    {nextBlock.index === 0 ? "Start her" : "Fortsett her"}: {nextBlock.block.title}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                  <Link
                    to="/stack/$slug"
                    params={{ slug }}
                    className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground hover:border-brand/60 transition-colors"
                  >
                    Kursoversikt
                  </Link>
                </>
              ) : (
                <Link
                  to="/stack/$slug"
                  params={{ slug }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground hover:opacity-90 transition-opacity"
                >
                  <GraduationCap className="h-4 w-4" />
                  Åpne kurset
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}

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

            {/* Full eksamensplan der vi har den fra oppmeldingen. Flere deler
                og innleveringer er lette å overse i en enkelt datolinje. */}
            {meta?.events && meta.events.length > 0 && (
              <ul className="mt-3 space-y-1">
                {meta.events.map((ev, i) => {
                  const isNext = nextEvent === ev;
                  return (
                    <li
                      key={`${ev.date}-${i}`}
                      className={`flex flex-wrap items-center gap-2 text-xs ${
                        isNext ? "text-foreground font-medium" : "text-muted-foreground"
                      }`}
                    >
                      <span
                        className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${
                          isNext ? "bg-brand" : "bg-muted-foreground/40"
                        }`}
                      />
                      <span>{ev.label}</span>
                      <span className="tabular-nums">{formatExamEvent(ev)}</span>
                      {ev.campus && (
                        <span className="rounded border border-border bg-card px-1.5 py-0.5 text-[10px]">
                          oppmøte 30 min før
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}

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
                {/* Eksamensplan: hva må tempoet være for å rekke gjennom alt? */}
                {u.days != null && u.days > 0 && progress.seen < progress.total && (
                  <p className="mt-1.5 text-[11px] text-muted-foreground">
                    {(() => {
                      const weeks = Math.max(1, Math.ceil(u.days / 7));
                      const left = progress.total - progress.seen;
                      const pace = Math.ceil(left / weeks);
                      return `${left} sider igjen på ${weeks} uker til eksamen — ca. ${pace} ${pace === 1 ? "side" : "sider"} i uka.`;
                    })()}
                  </p>
                )}
              </div>
            )}

            {/* Byggekloss-stripe: én rute per leksjon, i studierekkefølge.
                Mestret = fylt grønn, sett-men-usjekket = blek grønn,
                stiplet = låst til konseptet foran sitter. */}
            {blocks.length > 0 && (
              <div className="mt-4">
                <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Byggeklossene i faget
                </div>
                <div className="flex flex-wrap gap-1">
                  {blocks.map((b, i) => {
                    const status =
                      b.mastered && b.hasChecks
                        ? "mestret"
                        : b.locked
                          ? "låst"
                          : nextBlock?.block.slug === b.slug
                            ? "her er du"
                            : b.seen
                              ? "sett, ikke sjekket"
                              : "åpen";
                    return (
                      <a
                        key={b.slug}
                        href={`/stack/${b.slug}`}
                        title={`${i + 1}. ${b.title} — ${status}`}
                        className={`h-4 w-4 rounded-sm border transition-colors ${
                          status === "mestret"
                            ? "border-success bg-success hover:bg-success/80"
                            : status === "sett, ikke sjekket"
                              ? "border-success/60 bg-success/40 hover:bg-success/60"
                              : status === "her er du"
                                ? "border-brand bg-brand/20 ring-2 ring-brand/40 hover:bg-brand/40"
                                : status === "låst"
                                  ? "border-dashed border-muted-foreground/50 bg-transparent opacity-50 hover:opacity-90"
                                  : "border-border bg-muted/40 hover:border-brand/60"
                        }`}
                      />
                    );
                  })}
                </div>
                <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
                  <Tegnforklaring cls="border-success bg-success">mestret</Tegnforklaring>
                  <Tegnforklaring cls="border-success/60 bg-success/40">
                    sett, ikke sjekket
                  </Tegnforklaring>
                  <Tegnforklaring cls="border-brand bg-brand/20">her er du</Tegnforklaring>
                  <Tegnforklaring cls="border-dashed border-muted-foreground/50 opacity-60">
                    låst til konseptet foran sitter
                  </Tegnforklaring>
                </div>
              </div>
            )}

            {/* Grunnmuren: fasene dette faget bygger på, med fremdrift */}
            {foundations.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                <span className="text-muted-foreground">Bygger på:</span>
                {foundations.map((f) => (
                  <a
                    key={f.phase.id}
                    href={`/stack#${f.phase.id}`}
                    className={`rounded-full border px-2.5 py-1 transition-colors ${
                      f.total > 0 && f.seen === 0
                        ? "border-warning/50 bg-warning/10 text-foreground hover:border-warning"
                        : "border-border bg-card text-foreground hover:border-brand/60"
                    }`}
                    title={f.phase.why}
                  >
                    {f.phase.title}
                    {f.total > 0 && (
                      <span className="ml-1 tabular-nums text-muted-foreground">
                        {Math.round((f.seen / f.total) * 100)}%
                      </span>
                    )}
                  </a>
                ))}
              </div>
            )}

            {/* Engine-tall: kort, oppgaver, due — samlet status på tvers av modulene */}
            {snapshot &&
              (snapshot.cardsTotal > 0 || snapshot.problemsTotal > 0 || snapshot.dueNow > 0) && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {snapshot.cardsTotal > 0 && (
                    <a
                      href="/cards?mode=study"
                      className="rounded-lg border border-border bg-card px-3 py-2 text-xs hover:border-brand/60 transition-colors"
                    >
                      <span className="font-bold tabular-nums">
                        {snapshot.cardsLearned}/{snapshot.cardsTotal}
                      </span>{" "}
                      <span className="text-muted-foreground">kort i læring</span>
                    </a>
                  )}
                  {snapshot.problemsTotal > 0 && (
                    <a
                      href="/practice"
                      className="rounded-lg border border-border bg-card px-3 py-2 text-xs hover:border-brand/60 transition-colors"
                    >
                      <span className="font-bold tabular-nums">
                        {snapshot.problemsSolved}/{snapshot.problemsTotal}
                      </span>{" "}
                      <span className="text-muted-foreground">oppgaver løst</span>
                    </a>
                  )}
                  <a
                    href="/repetisjon"
                    className={`rounded-lg border px-3 py-2 text-xs transition-colors ${
                      snapshot.dueNow > 0
                        ? "border-brand/50 bg-brand/10 text-brand hover:bg-brand/20"
                        : "border-border bg-card text-muted-foreground hover:border-brand/60"
                    }`}
                  >
                    <span className="font-bold tabular-nums">{snapshot.dueNow}</span> due for
                    repetisjon nå
                  </a>
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

/** Liten fargeprikk + tekst for tegnforklaringen under kloss-stripa. */
function Tegnforklaring({ cls, children }: { cls: string; children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-1">
      <span className={`inline-block h-2.5 w-2.5 rounded-sm border ${cls}`} />
      {children}
    </span>
  );
}
