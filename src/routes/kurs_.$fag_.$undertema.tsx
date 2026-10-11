import { createFileRoute, notFound } from "@tanstack/react-router";
import { SkjermShell } from "@/components/skjerm";
import { slaOppUndertema } from "@/lib/kurs/registry";

export const Route = createFileRoute("/kurs_/$fag_/$undertema")({
  component: UndertemaSpiller,
});

function UndertemaSpiller() {
  const { fag, undertema } = Route.useParams();
  const treff = slaOppUndertema(fag, undertema);
  if (!treff) throw notFound();

  return (
    <SkjermShell
      fagSlug={treff.fag.slug}
      emneTittel={treff.emne.tittel}
      undertema={treff.undertema}
      avsluttTil={`/kurs/${treff.fag.slug}`}
    />
  );
}
