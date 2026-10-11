import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { ArrowRight, Layers } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { OV_RADER, OV_TYPER, type OvRad, type OvType } from "@/lib/nav/ov";
import { erSynligFag, useVisAlt } from "@/lib/nav/synlighet";
import { EXAM_SEASON_SLUGS, SUBJECT_BY_SLUG } from "@/lib/subjects/catalog";
import { cn } from "@/lib/utils";

/** `annet` = rader uten fag (Python-kjerne, verktøy, tverrgående). */
type OvSearch = { fag?: string; type?: OvType };

export const Route = createFileRoute("/ov")({
  validateSearch: (search: Record<string, unknown>): OvSearch => {
    const out: OvSearch = {};
    if (typeof search.fag === "string" && (search.fag === "annet" || SUBJECT_BY_SLUG[search.fag])) {
      out.fag = search.fag;
    }
    if (OV_TYPER.some((t) => t.id === search.type)) out.type = search.type as OvType;
    return out;
  },
  head: () => ({
    meta: [
      { title: "Øv — alle øvinger på ett sted" },
      {
        name: "description",
        content: "Alle oppgaver, drills, puslespill og kort i én liste. Filtrer på fag og type.",
      },
    ],
  }),
  component: OvPage,
});

// Fag-filteret viser bare fag som faktisk har øvinger. Eksamensfagene står
// alltid framme; resten ligger bak «Flere fag», som på Lær-siden.
const FAG_MED_RADER = new Set(OV_RADER.map((r) => r.fag).filter((f): f is string => !!f));
const EKSAMENSFAG = EXAM_SEASON_SLUGS.filter((s) => FAG_MED_RADER.has(s));
const ANDRE_FAG = [...FAG_MED_RADER].filter((s) => !EXAM_SEASON_SLUGS.includes(s)).sort();

function OvPage() {
  const { fag, type } = Route.useSearch();
  // Øvinger utenfor eksamensfagene er skjult til «vis alt» slås på. Et filter
  // i adressen på et skjult fag viser dem likevel.
  const [alt, settAlt] = useVisAlt();
  const visAndre = alt || fag === "annet" || (!!fag && ANDRE_FAG.includes(fag));
  const synlige = useMemo(() => OV_RADER.filter((r) => erSynligFag(r.fag, visAndre)), [visAndre]);

  const etterFag = useMemo(
    () => synlige.filter((r) => !fag || (fag === "annet" ? !r.fag : r.fag === fag)),
    [synlige, fag],
  );
  const rader = useMemo(() => etterFag.filter((r) => !type || r.type === type), [etterFag, type]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto max-w-3xl px-4 py-8">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Øv</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Alle øvinger i én liste. Velg fag og type, og gå rett inn.
          </p>
        </header>

        <Link
          to="/repetisjon"
          className="mb-6 flex items-center gap-3 rounded-lg border border-brand/40 bg-brand/5 px-4 py-3 transition-colors hover:border-brand"
        >
          <Layers className="h-5 w-5 shrink-0 text-brand" />
          <span className="min-w-0 flex-1">
            <span className="block font-medium leading-tight">Dagens repetisjon</span>
            <span className="block text-xs text-muted-foreground">
              Køen med det du er i ferd med å glemme, på tvers av fag.
            </span>
          </span>
          <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        </Link>

        <div className="mb-5 space-y-3">
          <FilterRad label="Fag">
            <Chip aktiv={!fag} search={{ type }}>
              Alle
            </Chip>
            {EKSAMENSFAG.map((slug) => (
              <Chip key={slug} aktiv={fag === slug} search={{ fag: slug, type }}>
                {SUBJECT_BY_SLUG[slug]?.code ?? slug}
              </Chip>
            ))}
            {visAndre && (
              <>
                <Chip aktiv={fag === "annet"} search={{ fag: "annet", type }}>
                  Tverrgående
                </Chip>
                {ANDRE_FAG.map((slug) => (
                  <Chip key={slug} aktiv={fag === slug} search={{ fag: slug, type }}>
                    {SUBJECT_BY_SLUG[slug]?.code ?? slug}
                  </Chip>
                ))}
              </>
            )}
          </FilterRad>
          <FilterRad label="Type">
            <Chip aktiv={!type} search={{ fag }}>
              Alle
            </Chip>
            {OV_TYPER.filter((t) => etterFag.some((r) => r.type === t.id)).map((t) => (
              <Chip key={t.id} aktiv={type === t.id} search={{ fag, type: t.id }}>
                {t.label}
              </Chip>
            ))}
          </FilterRad>
        </div>

        {rader.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
            Ingen øvinger med dette filteret.
          </p>
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border bg-card">
            {rader.map((r) => (
              <li key={r.id}>
                <OvLenke rad={r} visFag={!fag} />
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-xs text-muted-foreground">
          Viser {rader.length} av {synlige.length} øvingssett.{" "}
          <button
            type="button"
            onClick={() => settAlt(!alt)}
            className="underline underline-offset-2 hover:text-foreground"
          >
            {alt
              ? "Skjul øvinger utenfor eksamensfagene"
              : `Vis også ${OV_RADER.length - synlige.length} sett utenfor eksamensfagene`}
          </button>
        </p>
      </main>
    </div>
  );
}

function FilterRad({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="w-9 shrink-0 pt-1.5 text-xs font-medium text-muted-foreground">{label}</span>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function Chip({
  aktiv,
  search,
  children,
}: {
  aktiv: boolean;
  search: OvSearch;
  children: React.ReactNode;
}) {
  return (
    <Link
      to="/ov"
      search={search}
      replace
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
        aktiv
          ? "border-brand bg-brand text-brand-foreground"
          : "border-border bg-card text-foreground hover:bg-accent",
      )}
      aria-pressed={aktiv}
    >
      {children}
    </Link>
  );
}

function OvLenke({ rad, visFag }: { rad: OvRad; visFag: boolean }) {
  const typeLabel = OV_TYPER.find((t) => t.id === rad.type)?.label;
  const fagKode = rad.fag ? SUBJECT_BY_SLUG[rad.fag]?.code : undefined;
  // Vanlig <a>: radene peker på ruter med egne søkeparametre og #anker, og
  // en full navigasjon lar målsiden lese dem som ved en direkte lenke.
  return (
    <a href={rad.href} className="flex min-h-14 items-center gap-3 px-4 py-3 hover:bg-accent">
      <span className="min-w-0 flex-1">
        <span className="block font-medium leading-tight">{rad.tittel}</span>
        <span className="mt-0.5 line-clamp-2 block text-xs text-muted-foreground">
          {rad.beskrivelse}
        </span>
      </span>
      <span className="shrink-0 text-right text-[11px] leading-tight text-muted-foreground">
        <span className="block">
          {visFag && fagKode ? `${fagKode} · ` : ""}
          {typeLabel}
        </span>
        {rad.antall != null && (
          <span className="block tabular-nums">
            {rad.antall} {rad.enhet}
          </span>
        )}
      </span>
    </a>
  );
}
