import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronRight, Check } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { fagBySlug } from "@/lib/kurs/registry";
import { andel, erFullfort } from "@/lib/kurs/fremdrift";
import { minutter, type Undertema } from "@/lib/kurs/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/kurs_/$fag")({
  component: FagOversikt,
});

function FagOversikt() {
  const { fag: fagSlug } = Route.useParams();
  const fag = fagBySlug(fagSlug);
  if (!fag) throw notFound();

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 py-6">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {fag.kode}
        </p>
        <h1 className="mt-1 text-2xl font-bold">{fag.navn}</h1>

        <div className="mt-6 space-y-8">
          {fag.emner.map((emne, i) => (
            <section key={emne.slug}>
              <div className="mb-3">
                <h2 className="text-lg font-semibold">
                  <span className="mr-2 text-muted-foreground tabular-nums">{i + 1}</span>
                  {emne.tittel}
                </h2>
                <p className="mt-0.5 text-sm text-muted-foreground">{emne.sporsmal}</p>
              </div>
              <ul className="space-y-2">
                {emne.undertemaer.map((u) => (
                  <li key={u.slug}>
                    <UndertemaRad fagSlug={fag.slug} undertema={u} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}

/** Én trykkbar rad per undertema. Hele raden er treffflate — på telefon er
 *  en liten "start"-lenke til høyre langt vanskeligere å treffe enn et felt
 *  som dekker bredden. */
function UndertemaRad({ fagSlug, undertema }: { fagSlug: string; undertema: Undertema }) {
  // Fremdrift bor i localStorage og finnes ikke under server-render. Vi leser
  // den derfor i en effekt og viser 0 % til den er lest, i stedet for å
  // risikere ulik markup på server og klient.
  const [frem, setFrem] = useState({ andel: 0, ferdig: false });
  useEffect(() => {
    const les = () =>
      setFrem({
        andel: andel(fagSlug, undertema.slug, undertema.skjermer.length),
        ferdig: erFullfort(fagSlug, undertema.slug),
      });
    les();
    window.addEventListener("kurs-fremdrift", les);
    return () => window.removeEventListener("kurs-fremdrift", les);
  }, [fagSlug, undertema.slug, undertema.skjermer.length]);

  return (
    <Link
      to="/kurs/$fag/$undertema"
      params={{ fag: fagSlug, undertema: undertema.slug }}
      className="flex min-h-14 items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:bg-accent"
    >
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold tabular-nums",
          frem.ferdig
            ? "border-success bg-success text-success-foreground"
            : frem.andel > 0
              ? "border-brand text-brand"
              : "border-border text-muted-foreground",
        )}
      >
        {frem.ferdig ? <Check className="h-4 w-4" /> : `${Math.round(frem.andel * 100)}%`}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">{undertema.tittel}</span>
        <span className="block truncate text-xs text-muted-foreground">
          {undertema.utbytte} · {minutter(undertema)} min
        </span>
      </span>
      <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
    </Link>
  );
}
