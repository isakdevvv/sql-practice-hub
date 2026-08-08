import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  Compass,
  Construction,
  Hammer,
  Sparkles,
  Target,
} from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { ModulStatusBadge, ModulProgressBar } from "@/components/stack/HubShared";
import { useModulProgress } from "@/lib/stack/moduleProgress";
import { getTrinnBySlug } from "@/lib/stack/content";
import {
  CANVAS_MODULER,
  alleObliger,
  dagerTil,
  formatFrist,
  stackSlugsFor,
  totalPoeng,
  type CanvasModul,
  type Dekning,
  type ModulLenke,
} from "@/lib/dte2505/canvasModuler";
import { SemesterTidslinje } from "./SemesterTidslinje";

type Filter = "alle" | "frist" | "hull";

export function Dte2505ModulerPage() {
  const [filter, setFilter] = useState<Filter>("alle");
  const naa = useMemo(() => new Date(), []);

  const synlige = CANVAS_MODULER.filter((m) => {
    if (filter === "frist") return m.obliger.length > 0;
    if (filter === "hull") return m.dekning !== "dekket";
    return true;
  });

  const antallHull = CANVAS_MODULER.filter((m) => m.dekning === "hull").length;
  const antallDelvis = CANVAS_MODULER.filter((m) => m.dekning === "delvis").length;
  const antallDekket = CANVAS_MODULER.filter((m) => m.dekning === "dekket").length;

  const nesteFrist = alleObliger().find(({ oblig }) => dagerTil(oblig.frist, naa) >= 0);

  return (
    <StackPageShell title="DTE-2505 — Canvas-moduler" group="eksamen">
      <div className="container mx-auto px-4 py-10 max-w-4xl">
        {/* Tittel */}
        <header className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2505 Operativsystemer · modul for modul
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Canvas-modulene, i rekkefølge</h1>
          <p className="mt-3 text-muted-foreground max-w-2xl">
            Faget undervises som sju moduler i Canvas, UiTs læringsplattform. Denne siden
            følger den rekkefølgen nøyaktig: hver modul viser hva den handler om, hvilket
            innhold i appen som dekker den, hvilken obligatorisk innlevering som hører til,
            og når fristen er. Der appen ikke dekker en modul står det tydelig — hullene
            skjules ikke.
          </p>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Modultabell og frister er verifisert mot Canvas 08.08.2026.
          </p>
        </header>

        {/* Neste frist — det ene tallet som betyr noe akkurat nå */}
        {nesteFrist && (
          <a
            href={`#modul-${nesteFrist.modul.id}`}
            className="mb-6 flex items-start gap-4 rounded-xl border border-amber-500/40 bg-amber-500/10 p-5 transition-colors hover:border-amber-500"
          >
            <div className="rounded-lg bg-amber-500/20 p-2 shrink-0">
              <CalendarClock className="h-5 w-5 text-amber-600 dark:text-amber-300" />
            </div>
            <div className="flex-1">
              <div className="text-[10px] uppercase tracking-wider font-semibold text-amber-700 dark:text-amber-300 mb-1">
                Neste frist
              </div>
              <h2 className="font-semibold text-foreground leading-tight">
                Oblig {nesteFrist.oblig.nummer} — {nesteFrist.oblig.tittel}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Modul {nesteFrist.modul.id} · {formatFrist(nesteFrist.oblig.frist)} kl. 23:59 ·{" "}
                {nesteFrist.oblig.poeng} poeng
              </p>
            </div>
            <div className="text-right shrink-0">
              <div className="text-3xl font-bold tabular-nums text-amber-600 dark:text-amber-300">
                {dagerTil(nesteFrist.oblig.frist, naa)}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                dager igjen
              </div>
            </div>
          </a>
        )}

        <div className="mb-8">
          <SemesterTidslinje naa={naa} />
        </div>

        {/* Dekningsoversikt */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Compass className="h-4 w-4 text-brand" />
            Hvor godt dekker appen faget?
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <DekningTelle
              antall={antallDekket}
              etikett="moduler dekket"
              beskrivelse="Har fullverdig innhold i appen"
              dekning="dekket"
            />
            <DekningTelle
              antall={antallDelvis}
              etikett="delvis dekket"
              beskrivelse="Mangler ett navngitt punkt"
              dekning="delvis"
            />
            <DekningTelle
              antall={antallHull}
              etikett="hull"
              beskrivelse="Ingenting bygget ennå"
              dekning="hull"
            />
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">
            Til sammen {totalPoeng()} poeng fordelt på seks obligatoriske innleveringer.
            Canvas oppgir at oblig 1.3 ikke gis i år — punktet er fortsatt pensum, men uten
            innlevering.
          </p>
        </section>

        {/* Filter */}
        <div className="mb-6 flex flex-wrap gap-2">
          {(
            [
              ["alle", `Alle ${CANVAS_MODULER.length} moduler`],
              ["frist", "Bare de med frist"],
              ["hull", "Bare hull og mangler"],
            ] as [Filter, string][]
          ).map(([v, label]) => (
            <button
              key={v}
              onClick={() => setFilter(v)}
              className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
                filter === v
                  ? "bg-brand text-brand-foreground border-brand"
                  : "border-border bg-card hover:border-brand/40"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Modulene */}
        <div className="space-y-4">
          {synlige.map((m) => (
            <ModulKort key={m.id} modul={m} naa={naa} />
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            to="/stack/$slug"
            params={{ slug: "dte-2505" }}
            className="inline-flex items-center gap-1.5 text-sm text-brand hover:underline"
          >
            Tilbake til DTE-2505-huben
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            to="/stack/$slug"
            params={{ slug: "dte2505-obliger" }}
            className="inline-flex items-center gap-1.5 text-sm text-brand hover:underline"
          >
            Øv på speil-obligene
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </StackPageShell>
  );
}

/* ---------------------------------------------------------------- delkomponenter */

function DekningTelle({
  antall,
  etikett,
  beskrivelse,
  dekning,
}: {
  antall: number;
  etikett: string;
  beskrivelse: string;
  dekning: Dekning;
}) {
  const stil = dekningStil(dekning);
  return (
    <div className={`rounded-xl border p-4 ${stil.boks}`}>
      <div className={`text-2xl font-bold tabular-nums ${stil.tekst}`}>{antall}</div>
      <div className="text-xs font-medium text-foreground mt-0.5">{etikett}</div>
      <div className="text-[11px] text-muted-foreground leading-snug mt-1">{beskrivelse}</div>
    </div>
  );
}

function ModulKort({ modul, naa }: { modul: CanvasModul; naa: Date }) {
  const slugs = useMemo(() => stackSlugsFor(modul), [modul]);
  const { seen, total } = useModulProgress(slugs);
  const [apen, setApen] = useState(modul.dekning !== "dekket" || modul.obliger.length > 0);
  const stil = dekningStil(modul.dekning);

  return (
    <section
      id={`modul-${modul.id}`}
      className={`scroll-mt-24 rounded-xl border bg-card overflow-hidden ${stil.kant}`}
    >
      {/* Topplinje — alltid synlig */}
      <button
        onClick={() => setApen((v) => !v)}
        aria-expanded={apen}
        className="w-full text-left p-5 flex items-start gap-4 hover:bg-muted/30 transition-colors"
      >
        <div
          className={`shrink-0 rounded-lg px-3 py-2 font-bold tabular-nums text-lg ${stil.merke}`}
        >
          {modul.id}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-semibold text-foreground leading-tight">{modul.tittel}</h2>
            <DekningMerke dekning={modul.dekning} />
            {slugs.length > 0 && <ModulStatusBadge trinnSlugs={slugs} />}
          </div>
          <p className="text-sm text-muted-foreground leading-snug mt-1">{modul.kortOm}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {modul.obliger.map((o) => {
              const dager = dagerTil(o.frist, naa);
              const passert = dager < 0;
              return (
                <span
                  key={o.nummer}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] ${
                    passert
                      ? "border-border bg-muted text-muted-foreground"
                      : "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                  }`}
                >
                  <CalendarClock className="h-3 w-3" />
                  Oblig {o.nummer} · {formatFrist(o.frist)} · {o.poeng} poeng
                  {!passert && <span className="font-semibold">· {dager} d igjen</span>}
                </span>
              );
            })}
            {modul.obliger.length === 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-2.5 py-1 text-[11px] text-muted-foreground">
                Ingen obligatorisk innlevering
              </span>
            )}
          </div>
          {slugs.length > 0 && (
            <div className="max-w-xs">
              <ModulProgressBar trinnSlugs={slugs} />
            </div>
          )}
        </div>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground shrink-0 mt-1 transition-transform ${
            apen ? "rotate-180" : ""
          }`}
        />
      </button>

      {apen && (
        <div className="px-5 pb-5 space-y-5 border-t border-border pt-5">
          {/* Mål */}
          <div>
            <h3 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5 text-brand" />
              Dette skal du kunne etterpå
            </h3>
            <ul className="space-y-1.5">
              {modul.maal.map((m) => (
                <li key={m} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5 text-brand shrink-0 mt-0.5" />
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Mangler / hull */}
          {modul.mangler && (
            <div
              className={`rounded-lg border p-4 ${
                modul.dekning === "hull"
                  ? "border-rose-500/40 bg-rose-500/10"
                  : "border-amber-500/40 bg-amber-500/10"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {modul.dekning === "hull" ? (
                  <Construction className="h-4 w-4 text-rose-600 dark:text-rose-300" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-300" />
                )}
                <h3 className="text-sm font-semibold text-foreground">
                  {modul.dekning === "hull" ? "Hull i appen" : "Delvis dekket"}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground leading-snug">{modul.mangler}</p>
            </div>
          )}

          {/* Innhold */}
          <div>
            <h3 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-2">
              Innhold som dekker modulen
            </h3>
            {modul.lenker.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                Ingen innhold ennå. Se boksen over.
              </p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-2.5">
                {modul.lenker.map((l) => (
                  <LenkeKort key={`${l.type}-${l.slug}`} lenke={l} />
                ))}
              </div>
            )}
          </div>

          {/* Oblig-detaljer */}
          {modul.obliger.length > 0 && (
            <div>
              <h3 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-2">
                Obligatorisk innlevering
              </h3>
              <div className="space-y-2">
                {modul.obliger.map((o) => (
                  <div
                    key={o.nummer}
                    className="rounded-lg border border-border bg-background p-3 flex items-center justify-between gap-3 flex-wrap"
                  >
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        Oblig {o.nummer} — {o.tittel}
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        Frist {formatFrist(o.frist)} kl. 23:59 · {o.poeng} poeng
                      </div>
                    </div>
                    <Link
                      to="/stack/$slug"
                      params={{ slug: "dte2505-obliger" }}
                      hash={o.ovingId}
                      className="inline-flex items-center gap-1 text-xs rounded-md border border-brand/40 bg-brand/5 px-2.5 py-1.5 text-brand hover:border-brand transition-colors"
                    >
                      Øv på speil-versjonen
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dypere enn pensum — bevisst adskilt */}
          {modul.dypere.length > 0 && <DypereEnnPensum modul={modul} />}
        </div>
      )}
    </section>
  );
}

function LenkeKort({ lenke }: { lenke: ModulLenke }) {
  // `kommer` betyr «under bygging». Vi sjekker registeret i tillegg, slik at
  // kortet blir en ekte lenke av seg selv den dagen innholdet landes.
  const finnesIRegister = lenke.type !== "stack" || Boolean(getTrinnBySlug(lenke.slug));
  const kommer = Boolean(lenke.kommer) && !finnesIRegister;

  const innhold = (
    <>
      <div className="flex items-center gap-2 mb-1 flex-wrap">
        <h4 className="text-sm font-medium text-foreground leading-tight">{lenke.label}</h4>
        {kommer && (
          <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/40 bg-rose-500/10 px-2 py-0.5 text-[10px] font-semibold text-rose-600 dark:text-rose-300">
            <Hammer className="h-2.5 w-2.5" />
            Kommer
          </span>
        )}
      </div>
      <p className="text-[12px] text-muted-foreground leading-snug">{lenke.dekker}</p>
    </>
  );

  if (kommer) {
    return (
      <div className="rounded-lg border border-dashed border-rose-500/40 bg-rose-500/5 p-3">
        {innhold}
        <p className="mt-1.5 text-[11px] text-muted-foreground italic">
          Ikke publisert ennå — kortet blir en lenke automatisk når modulen landes.
        </p>
      </div>
    );
  }

  const klasser =
    "group rounded-lg border border-border bg-background p-3 hover:border-brand/50 transition-colors block";

  if (lenke.type === "rute") {
    // Fri rute-sti fra datafila — ruteren kan ikke typesjekke en streng som
    // ikke er kjent på kompileringstidspunktet, derfor castet.
    return (
      <Link to={lenke.slug as never} className={klasser}>
        {innhold}
        <AapneLinje />
      </Link>
    );
  }
  if (lenke.type === "forkurs") {
    return (
      <Link to="/forkurs/$slug" params={{ slug: lenke.slug }} className={klasser}>
        {innhold}
        <AapneLinje />
      </Link>
    );
  }
  return (
    <Link to="/stack/$slug" params={{ slug: lenke.slug }} className={klasser}>
      {innhold}
      <AapneLinje />
    </Link>
  );
}

function AapneLinje() {
  return (
    <div className="mt-2 inline-flex items-center text-[11px] text-muted-foreground group-hover:text-foreground transition-colors">
      Åpne
      <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
    </div>
  );
}

/**
 * Panel for stoff som går ut over Canvas-pensum. Holdes lukket som standard og
 * er visuelt tydelig atskilt: skal du bestå obligen er dette *ikke* det du
 * trenger, og da må det ikke konkurrere om oppmerksomheten.
 */
function DypereEnnPensum({ modul }: { modul: CanvasModul }) {
  const [apen, setApen] = useState(false);
  return (
    <div className="rounded-lg border border-violet-500/30 bg-violet-500/5">
      <button
        onClick={() => setApen((v) => !v)}
        aria-expanded={apen}
        className="w-full text-left px-4 py-3 flex items-center gap-2"
      >
        <Sparkles className="h-4 w-4 text-violet-500 dark:text-violet-300 shrink-0" />
        <div className="flex-1">
          <span className="text-sm font-semibold text-foreground">Dypere enn pensum</span>
          <span className="ml-2 text-[11px] text-muted-foreground">
            {modul.dypere.length} {modul.dypere.length === 1 ? "modul" : "moduler"} · ikke krav til
            oblig eller eksamen
          </span>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform ${apen ? "rotate-180" : ""}`}
        />
      </button>
      {apen && (
        <div className="px-4 pb-4 space-y-2.5">
          <p className="text-[11px] text-muted-foreground leading-snug">
            Dette er innhold appen har som går ut over det Canvas krever. Ta det når modulen
            over sitter — ikke før.
          </p>
          {modul.dypere.map((d) => (
            <Link
              key={d.slug}
              to="/stack/$slug"
              params={{ slug: d.slug }}
              className="group block rounded-lg border border-violet-500/25 bg-background p-3 hover:border-violet-500/60 transition-colors"
            >
              <h4 className="text-sm font-medium text-foreground leading-tight">{d.label}</h4>
              <p className="text-[12px] text-muted-foreground leading-snug mt-0.5">{d.hvorfor}</p>
              <div className="mt-2 inline-flex items-center text-[11px] text-violet-600 dark:text-violet-300">
                Åpne
                <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function DekningMerke({ dekning }: { dekning: Dekning }) {
  const tekst =
    dekning === "dekket" ? "Dekket" : dekning === "delvis" ? "Delvis dekket" : "Hull";
  const stil = dekningStil(dekning);
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${stil.merke}`}>
      {tekst}
    </span>
  );
}

function dekningStil(dekning: Dekning): {
  boks: string;
  kant: string;
  merke: string;
  tekst: string;
} {
  switch (dekning) {
    case "dekket":
      return {
        boks: "border-success/30 bg-success/5",
        kant: "border-border",
        merke: "border-success/30 bg-success/15 text-success",
        tekst: "text-success",
      };
    case "delvis":
      return {
        boks: "border-amber-500/30 bg-amber-500/5",
        kant: "border-amber-500/40",
        merke:
          "border-amber-500/40 bg-amber-500/15 text-amber-700 dark:text-amber-300",
        tekst: "text-amber-600 dark:text-amber-300",
      };
    default:
      return {
        boks: "border-rose-500/30 bg-rose-500/5",
        kant: "border-rose-500/40",
        merke: "border-rose-500/40 bg-rose-500/15 text-rose-600 dark:text-rose-300",
        tekst: "text-rose-600 dark:text-rose-300",
      };
  }
}
