import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { emnerForFag, type LaerEmne, type LaerSteg } from "@/lib/nav/laer";
import { useVisAlt } from "@/lib/nav/synlighet";
import { erFullfort } from "@/lib/kurs/fremdrift";
import { isTrinnSeen } from "@/lib/stack/moduleProgress";
import { EXAM_META, EXAM_SEASON_SLUGS, SEKTORER, SUBJECT_BY_SLUG } from "@/lib/subjects/catalog";
import { examUrgency, formatDaysUntil } from "@/lib/subjects/examDate";
import { cn } from "@/lib/utils";

type LaerSearch = { fag?: string };

export const Route = createFileRoute("/laer")({
  validateSearch: (search: Record<string, unknown>): LaerSearch =>
    typeof search.fag === "string" && SUBJECT_BY_SLUG[search.fag] ? { fag: search.fag } : {},
  head: () => ({
    meta: [
      { title: "Lær — fag, emne, steg" },
      {
        name: "description",
        content: "Velg fag og emne, og gå gjennom stoffet ett steg om gangen.",
      },
    ],
  }),
  component: LaerPage,
});

const ANDRE_FAG = SEKTORER.flatMap((s) => s.subjects)
  .map((s) => s.slug)
  .filter((slug) => !EXAM_SEASON_SLUGS.includes(slug));

function LaerPage() {
  const search = Route.useSearch();
  const fag = search.fag ?? EXAM_SEASON_SLUGS[0];
  // Fag uten eksamen i høst er skjult til «vis alt» slås på. En direkte lenke
  // til et slikt fag viser dem likevel, så man ikke står på en usynlig side.
  const [alt, settAlt] = useVisAlt();
  const visAndre = alt || ANDRE_FAG.includes(fag);
  const emner = useMemo(() => emnerForFag(fag), [fag]);

  // Sett-status ligger i localStorage og leses etter mount, så server og
  // klient rendrer samme liste først.
  const [ferdig, setFerdig] = useState<Set<string>>(new Set());
  useEffect(() => {
    const ny = new Set<string>();
    for (const e of emner) {
      for (const s of [...e.steg, ...(e.fordypning ?? [])]) {
        const sett = s.kind === "skjerm" ? erFullfort(s.fag, s.undertema) : isTrinnSeen(s.slug);
        if (sett) ny.add(s.id);
      }
    }
    setFerdig(ny);
  }, [emner]);

  // Første emne med noe ugjort står åpent — det er der man fortsetter.
  const apenId = (emner.find((e) => e.steg.some((s) => !ferdig.has(s.id))) ?? emner[0])?.id;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto max-w-3xl px-4 py-8">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Lær</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Velg fag, åpne et emne og ta stegene i rekkefølge.
          </p>
        </header>

        <div className="mb-8 space-y-2">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {EXAM_SEASON_SLUGS.map((slug) => (
              <FagKnapp key={slug} slug={slug} aktiv={slug === fag} />
            ))}
          </div>
          {visAndre ? (
            <>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {ANDRE_FAG.map((slug) => (
                  <FagKnapp key={slug} slug={slug} aktiv={slug === fag} />
                ))}
              </div>
              {alt && (
                <button
                  type="button"
                  onClick={() => settAlt(false)}
                  className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                >
                  Skjul fag uten eksamen denne høsten
                </button>
              )}
            </>
          ) : (
            <button
              type="button"
              onClick={() => settAlt(true)}
              className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
            >
              Vis {ANDRE_FAG.length} fag uten eksamen denne høsten
            </button>
          )}
        </div>

        <h2 className="mb-3 text-lg font-semibold">{SUBJECT_BY_SLUG[fag]?.navn}</h2>
        {emner.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
            Dette faget har ingen steg ennå.
          </p>
        ) : (
          <div className="space-y-2">
            {emner.map((e, i) => (
              <EmneBoks
                key={`${fag}-${e.id}-${e.id === apenId}`}
                emne={e}
                nr={i + 1}
                ferdig={ferdig}
                apen={e.id === apenId}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function FagKnapp({ slug, aktiv }: { slug: string; aktiv: boolean }) {
  const s = SUBJECT_BY_SLUG[slug];
  const { days } = examUrgency(EXAM_META[slug]?.eksamen);
  const erEksamensfag = EXAM_SEASON_SLUGS.includes(slug);
  return (
    <Link
      to="/laer"
      search={{ fag: slug }}
      className={cn(
        "rounded-lg border px-3 py-2 text-left transition-colors",
        aktiv ? "border-brand bg-brand/10" : "border-border bg-card hover:border-brand/40",
      )}
      aria-current={aktiv ? "page" : undefined}
    >
      <div
        className={cn("text-xs font-bold tracking-wide", aktiv ? "text-brand" : "text-foreground")}
      >
        {s.code}
      </div>
      <div className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{s.navn}</div>
      {erEksamensfag && days != null && days >= 0 && (
        <div className="mt-1 text-[11px] tabular-nums text-muted-foreground">
          Eksamen: {formatDaysUntil(days).toLowerCase()}
        </div>
      )}
    </Link>
  );
}

function EmneBoks({
  emne,
  nr,
  ferdig,
  apen,
}: {
  emne: LaerEmne;
  nr: number;
  ferdig: Set<string>;
  apen: boolean;
}) {
  const antallFerdig = emne.steg.filter((s) => ferdig.has(s.id)).length;
  return (
    <details open={apen} className="group rounded-lg border border-border bg-card">
      <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
        <span className="w-5 shrink-0 text-right text-sm tabular-nums text-muted-foreground">
          {nr}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-medium leading-tight">{emne.tittel}</span>
          {emne.undertittel && (
            <span className="mt-0.5 block text-xs text-muted-foreground">{emne.undertittel}</span>
          )}
        </span>
        <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
          {antallFerdig}/{emne.steg.length}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
      </summary>
      <ol className="border-t border-border py-1">
        {emne.steg.map((s) => (
          <li key={s.id}>
            <StegLenke steg={s} ferdig={ferdig.has(s.id)} />
          </li>
        ))}
      </ol>
      {emne.fordypning && emne.fordypning.length > 0 && (
        <details className="border-t border-border">
          <summary className="cursor-pointer px-4 py-2.5 text-xs text-muted-foreground hover:text-foreground">
            Fordypning: {emne.fordypning.length} lengre sider om samme emne
          </summary>
          <ul className="pb-1">
            {emne.fordypning.map((s) => (
              <li key={s.id}>
                <StegLenke steg={s} ferdig={ferdig.has(s.id)} />
              </li>
            ))}
          </ul>
        </details>
      )}
    </details>
  );
}

function StegLenke({ steg, ferdig }: { steg: LaerSteg; ferdig: boolean }) {
  const cls = "flex min-h-11 items-center gap-3 px-4 py-2 text-sm hover:bg-accent";
  const innhold = (
    <>
      <span
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
          ferdig ? "border-success bg-success/15 text-success" : "border-border",
        )}
      >
        {ferdig && <Check className="h-3 w-3" />}
      </span>
      <span className="min-w-0 flex-1">{steg.tittel}</span>
      {steg.kind === "skjerm" && (
        <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
          {steg.minutter} min
        </span>
      )}
    </>
  );
  if (steg.kind === "skjerm") {
    return (
      <Link
        to="/kurs/$fag/$undertema"
        params={{ fag: steg.fag, undertema: steg.undertema }}
        className={cls}
      >
        {innhold}
      </Link>
    );
  }
  return (
    <Link to="/stack/$slug" params={{ slug: steg.slug }} className={cls}>
      {innhold}
    </Link>
  );
}
