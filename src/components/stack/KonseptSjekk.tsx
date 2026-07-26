import { useEffect, useState } from "react";
import { Award, BookOpen, Check, RotateCcw, X } from "lucide-react";
import type { KonseptSjekkDef } from "@/lib/core/checks";
import { isSectionMastered, markSectionMastered } from "@/lib/core/mastery";

/**
 * KonseptSjekk — porten mellom «jeg har lest dette» og «jeg har forstått det».
 *
 * Flyten følger lær-først-så-prøv-selv: konseptet forklares i klartekst, og
 * spørsmålene kommer først når brukeren selv sier fra at hen er klar. Da
 * tester de forståelse framfor lesehukommelse.
 *
 * Feil svar er ikke en blindvei — hvert alternativ har en begrunnelse, og
 * «Prøv igjen» går tilbake til forklaringen. Poenget er at konseptet skal
 * sitte, ikke at forsøket skal telles.
 */

type Fase = "laer" | "prov" | "fasit";

export function KonseptSjekk({
  lessonSlug,
  sjekk,
}: {
  lessonSlug: string;
  sjekk: KonseptSjekkDef;
}) {
  const [fase, setFase] = useState<Fase>("laer");
  const [valgt, setValgt] = useState<(number | null)[]>(() => sjekk.sporsmal.map(() => null));
  const [mestret, setMestret] = useState(false);

  // localStorage leses etter mount, ellers spriker server- og klient-render.
  useEffect(() => {
    setMestret(isSectionMastered(lessonSlug, sjekk.id));
  }, [lessonSlug, sjekk.id]);

  const alleBesvart = valgt.every((v) => v !== null);
  const antallRiktige = valgt.reduce<number>(
    (sum, vi, qi) => sum + (vi !== null && sjekk.sporsmal[qi].valg[vi].riktig ? 1 : 0),
    0,
  );
  const alleRiktige = antallRiktige === sjekk.sporsmal.length;

  useEffect(() => {
    if (fase === "fasit" && alleRiktige && !mestret) {
      markSectionMastered(lessonSlug, sjekk.id);
      setMestret(true);
    }
  }, [fase, alleRiktige, mestret, lessonSlug, sjekk.id]);

  function prøvIgjen() {
    setValgt(sjekk.sporsmal.map(() => null));
    setFase("laer");
  }

  return (
    <section className="not-prose my-6 rounded-2xl border-2 border-brand/30 bg-brand/5 p-4">
      <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-brand">
            Konsept-sjekk
          </div>
          <h4 className="font-semibold leading-tight">{sjekk.tittel}</h4>
        </div>
        {mestret && (
          <span className="inline-flex items-center gap-1 rounded-full border border-success/40 bg-success/10 px-2.5 py-1 text-[11px] font-semibold text-success">
            <Award className="h-3.5 w-3.5" /> Mestret
          </span>
        )}
      </header>

      {/* 1) Lær — konseptet i klartekst før noe testes */}
      {fase === "laer" && (
        <div>
          <div className="rounded-lg border border-border bg-background p-3">
            <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <BookOpen className="h-3.5 w-3.5" />
              Kjernen i konseptet
            </div>
            <p className="text-sm leading-relaxed">{sjekk.laer}</p>
          </div>
          <button
            type="button"
            onClick={() => setFase("prov")}
            className="mt-3 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground transition-opacity hover:opacity-90"
          >
            Jeg er klar — prøv meg
          </button>
        </div>
      )}

      {/* 2) Prøv selv, og 3) fasit med begrunnelser */}
      {fase !== "laer" && (
        <div>
          <ol className="space-y-3">
            {sjekk.sporsmal.map((q, qi) => (
              <li key={qi} className="rounded-lg border border-border bg-background p-3">
                <div className="mb-2 text-sm font-medium">
                  <span className="mr-1.5 font-mono text-xs text-brand">{qi + 1}.</span>
                  {q.sporsmal}
                </div>
                <div className="space-y-1.5">
                  {q.valg.map((v, vi) => {
                    const erValgt = valgt[qi] === vi;
                    const vis = fase === "fasit";
                    return (
                      <button
                        key={vi}
                        type="button"
                        disabled={vis}
                        onClick={() => setValgt((arr) => arr.map((x, i) => (i === qi ? vi : x)))}
                        className={`flex w-full items-start gap-2 rounded-md border px-2.5 py-2 text-left text-sm transition ${
                          vis && v.riktig
                            ? "border-success/60 bg-success/10"
                            : vis && erValgt
                              ? "border-destructive/60 bg-destructive/10"
                              : erValgt
                                ? "border-brand bg-brand/10"
                                : "border-border bg-card hover:border-brand/50"
                        }`}
                      >
                        {vis && (
                          <span className="mt-0.5 shrink-0">
                            {v.riktig ? (
                              <Check className="h-3.5 w-3.5 text-success" />
                            ) : erValgt ? (
                              <X className="h-3.5 w-3.5 text-destructive" />
                            ) : (
                              <span className="inline-block h-3.5 w-3.5" />
                            )}
                          </span>
                        )}
                        <span className="flex-1">
                          {v.tekst}
                          {vis && v.begrunnelse && (erValgt || v.riktig) && (
                            <span className="mt-1 block text-xs text-muted-foreground">
                              {v.begrunnelse}
                            </span>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </li>
            ))}
          </ol>

          {fase === "prov" && (
            <button
              type="button"
              disabled={!alleBesvart}
              onClick={() => setFase("fasit")}
              className="mt-3 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {alleBesvart ? "Sjekk svarene" : "Svar på alle først"}
            </button>
          )}

          {fase === "fasit" && (
            <div className="mt-3 flex flex-wrap items-center gap-3">
              {alleRiktige ? (
                <p className="text-sm font-semibold text-success">
                  Alt riktig — konseptet er mestret.
                </p>
              ) : (
                <>
                  <p className="text-sm">
                    {antallRiktige} av {sjekk.sporsmal.length} riktig. Les begrunnelsene og ta den
                    en gang til.
                  </p>
                  <button
                    type="button"
                    onClick={prøvIgjen}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm hover:bg-muted"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Prøv igjen
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

/** Rendrer alle registrerte konsept-sjekker for en leksjon. */
export function KonseptSjekker({
  lessonSlug,
  sjekker,
}: {
  lessonSlug: string;
  sjekker: KonseptSjekkDef[];
}) {
  if (sjekker.length === 0) return null;
  return (
    <>
      {sjekker.map((s) => (
        <KonseptSjekk key={s.id} lessonSlug={lessonSlug} sjekk={s} />
      ))}
    </>
  );
}
