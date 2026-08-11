import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Brain, Check, Eye, Layers, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Rating, type RatingPreview, type ReviewRating } from "@/lib/learn/fsrs";
import {
  MODUL_KORT_KILDER,
  byggKortKo,
  fagMedKort,
  kortStatistikk,
  statistikkPerKilde,
  type KoOppfoering,
} from "@/lib/learn/modulKort";

// ---------------------------------------------------------------------------
// Den samlede kortkøen — PLAN-HOST26-MODULER.md §3.4.
//
// Alle modulers recall-kort i ÉN kø, uansett fag. Hvert kort er merket med
// hvor det kommer fra og lenker tilbake til modulen sin, slik at et kort du
// ikke husker kan følges rett til stoffet som forklarer det.
//
// Framdriften deles med modulens egen kortvisning: køen skriver til nøyaktig
// den samme FSRS-storen, så det spiller ingen rolle hvor du repeterer.
//
// All logikk ligger i src/lib/learn/modulKort.ts og kan etterprøves med
//     bun run src/lib/learn/modulKortSelvsjekk.ts
// ---------------------------------------------------------------------------

const KNAPPER: { rating: ReviewRating; tekst: string; forklaring: string; stil: string }[] = [
  {
    rating: Rating.Again,
    tekst: "Igjen",
    forklaring: "Husket ikke",
    stil: "border-red-500/40 hover:bg-red-500/10 text-red-600 dark:text-red-400",
  },
  {
    rating: Rating.Hard,
    tekst: "Tungt",
    forklaring: "Kom fram, men tregt",
    stil: "border-amber-500/40 hover:bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  {
    rating: Rating.Good,
    tekst: "Greit",
    forklaring: "Husket det",
    stil: "border-brand/40 hover:bg-brand/10 text-brand",
  },
  {
    rating: Rating.Easy,
    tekst: "Lett",
    forklaring: "Satt umiddelbart",
    stil: "border-success/40 hover:bg-success/10 text-success",
  },
];

export function SamletKortKo() {
  // Alt som leser localStorage må vente til komponenten er montert, ellers
  // spriker serverrendringen fra det nettleseren faktisk har.
  const [nå, setNå] = useState<number | null>(null);
  useEffect(() => setNå(Date.now()), []);

  const [fagFilter, setFagFilter] = useState<string | null>(null);
  const [ko, setKo] = useState<KoOppfoering[]>([]);
  const [posisjon, setPosisjon] = useState(0);
  const [visSvar, setVisSvar] = useState(false);
  const [repetert, setRepetert] = useState(0);
  const [forhandsvisning, setForhandsvisning] = useState<RatingPreview[]>([]);

  const byggPaNytt = useCallback((fag: string | null) => {
    const ny = byggKortKo({ fagSlug: fag ?? undefined, nyePerOkt: 10 });
    setKo(ny);
    setPosisjon(0);
    setVisSvar(false);
  }, []);

  useEffect(() => {
    if (nå == null) return;
    byggPaNytt(fagFilter);
  }, [nå, fagFilter, byggPaNytt]);

  const aktiv = ko[posisjon];

  useEffect(() => {
    if (!aktiv) {
      setForhandsvisning([]);
      return;
    }
    setForhandsvisning(aktiv.kort.kilde.fsrs.previewRatings(aktiv.kort.id));
  }, [aktiv]);

  const statistikk = useMemo(
    () => (nå == null ? null : kortStatistikk(nå, fagFilter ?? undefined)),
    [nå, fagFilter, repetert],
  );
  const perKilde = useMemo(() => (nå == null ? [] : statistikkPerKilde(nå)), [nå, repetert]);

  function vurder(rating: ReviewRating) {
    if (!aktiv) return;
    aktiv.kort.kilde.fsrs.recordReview(aktiv.kort.id, rating);
    setRepetert((n) => n + 1);
    setVisSvar(false);
    setPosisjon((p) => p + 1);
  }

  if (nå == null) {
    return (
      <main className="container mx-auto px-4 py-20 text-center text-muted-foreground">Laster…</main>
    );
  }

  const fag = fagMedKort();

  return (
    <main className="container mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Brain className="h-6 w-6 text-brand" />
          Modulkort — én kø for alle fag
        </h1>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          Recall-kortene fra alle modulene i én felles repetisjonskø, planlagt med FSRS. Poenget er
          at modulene du var ferdig med i august fortsatt dukker opp i desember. Hvert kort viser
          hvilket fag og hvilken modul det kommer fra, og lenker tilbake dit hvis du trenger
          forklaringen. Repeterer du et kort her, teller det også på modulsiden — det er samme
          framdrift begge steder.
        </p>
      </div>

      {/* Fag-filter */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setFagFilter(null)}
          className={cn(
            "rounded-full border px-2.5 py-1 text-xs transition-colors",
            fagFilter == null
              ? "border-brand bg-brand text-brand-foreground"
              : "border-border bg-card hover:bg-accent",
          )}
        >
          Alle fag
        </button>
        {fag.map((f) => (
          <button
            key={f.fagSlug}
            type="button"
            onClick={() => setFagFilter(fagFilter === f.fagSlug ? null : f.fagSlug)}
            className={cn(
              "rounded-full border px-2.5 py-1 text-xs transition-colors",
              fagFilter === f.fagSlug
                ? "border-brand bg-brand text-brand-foreground"
                : "border-border bg-card hover:bg-accent",
            )}
          >
            {f.fagKode} ({f.antall})
          </button>
        ))}
      </div>

      {/* Tellere */}
      {statistikk && (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { navn: "Forfalt", verdi: statistikk.forfalt, farge: "text-brand" },
            { navn: "Nye", verdi: statistikk.nye, farge: "text-info" },
            { navn: "Lært", verdi: statistikk.laert, farge: "text-success" },
            { navn: "Repetert nå", verdi: repetert, farge: "text-muted-foreground" },
          ].map((t) => (
            <div key={t.navn} className="rounded-xl border border-border bg-card p-3">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {t.navn}
              </div>
              <div className={cn("mt-1 text-2xl font-bold tabular-nums", t.farge)}>{t.verdi}</div>
            </div>
          ))}
        </div>
      )}

      {/* Selve kortet */}
      {aktiv ? (
        <div className="rounded-xl border-2 border-brand/30 bg-card p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <Link
              to="/stack/$slug"
              params={{ slug: aktiv.kort.kilde.href.replace("/stack/", "") }}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
            >
              <Layers className="h-3 w-3" />
              {aktiv.kort.kilde.fagKode} · {aktiv.kort.kilde.modul}
            </Link>
            <span className="flex items-center gap-2 text-xs tabular-nums text-muted-foreground">
              {aktiv.erNytt && (
                <span className="inline-flex items-center gap-1 text-info">
                  <Sparkles className="h-3 w-3" /> nytt
                </span>
              )}
              {posisjon + 1} / {ko.length}
            </span>
          </div>

          <div className="flex min-h-[180px] flex-col rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-sm font-medium leading-relaxed text-foreground">
              {aktiv.kort.forside}
            </p>
            <div className="mt-auto">
              {visSvar ? (
                <div className="mt-4 border-t border-border pt-3">
                  <p className="text-sm leading-relaxed text-foreground">{aktiv.kort.bakside}</p>
                  {aktiv.kort.hvorfor && (
                    <p className="mt-2 border-l-2 border-brand/40 pl-3 text-xs leading-relaxed text-muted-foreground">
                      <span className="font-medium text-foreground/80">Hvorfor dette kortet:</span>{" "}
                      {aktiv.kort.hvorfor}
                    </p>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setVisSvar(true)}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-sm hover:bg-accent"
                >
                  <Eye className="h-3.5 w-3.5" /> Vis svar
                </button>
              )}
            </div>
          </div>

          {visSvar && (
            <div className="mt-4">
              <div className="mb-2 text-xs text-muted-foreground">
                Hvor godt satt det? Svaret styrer når kortet kommer tilbake.
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {KNAPPER.map((k) => {
                  const f = forhandsvisning.find((p) => p.rating === k.rating);
                  return (
                    <button
                      key={k.tekst}
                      onClick={() => vurder(k.rating)}
                      className={cn(
                        "rounded-lg border bg-card px-3 py-2 text-left transition-colors",
                        k.stil,
                      )}
                    >
                      <div className="text-sm font-semibold">{k.tekst}</div>
                      <div className="text-[10px] text-muted-foreground">{k.forklaring}</div>
                      {f && (
                        <div className="mt-0.5 font-mono text-[10px] tabular-nums text-muted-foreground">
                          {f.label}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center">
          <Check className="mx-auto h-8 w-8 text-success" />
          <p className="mt-3 text-sm text-muted-foreground">
            {repetert > 0
              ? `Ferdig for nå — du repeterte ${repetert} kort. De kommer tilbake når FSRS mener du er i ferd med å glemme dem.`
              : "Ingen kort er klare akkurat nå. Kom tilbake senere, eller åpne en modul og legg nye kort inn i køen."}
          </p>
          <Button className="mt-4" size="sm" variant="outline" onClick={() => byggPaNytt(fagFilter)}>
            <RotateCcw className="mr-1 h-3.5 w-3.5" /> Bygg køen på nytt
          </Button>
        </div>
      )}

      {/* Hvor kortene kommer fra */}
      <div className="mt-8">
        <h2 className="mb-3 font-semibold">Kortsamlingene i køen</h2>
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          {perKilde.map(({ kilde, statistikk: s }) => (
            <li key={kilde.id}>
              <Link
                to="/stack/$slug"
                params={{ slug: kilde.href.replace("/stack/", "") }}
                className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/40"
              >
                <span className="w-20 shrink-0 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  {kilde.fagKode}
                </span>
                <span className="flex-1 truncate text-sm">{kilde.modul}</span>
                <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                  {s.forfalt} forfalt · {s.nye} nye · {s.totalt} totalt
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Nye moduler kommer inn her ved å melde kortene sine inn i{" "}
          <code className="font-mono">MODUL_KORT_KILDER</code> i{" "}
          <code className="font-mono">src/lib/learn/modulKort.ts</code>. Modulen beholder sin egen
          kortvisning og sin egen FSRS-store — køen leser den samme tilstanden, så framdriften kan
          ikke sprike mellom de to stedene.{" "}
          {MODUL_KORT_KILDER.length > 0 && "TEK-1501 modul 1 og 2 er ikke koblet på ennå: kortlistene der ligger som lokale konstanter inne i modulsidene, og svarene er formatert tekst i stedet for ren tekst."}
        </p>
      </div>
    </main>
  );
}
