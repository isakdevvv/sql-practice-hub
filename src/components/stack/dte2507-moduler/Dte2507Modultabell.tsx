import { Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowRight, CalendarClock, Info } from "lucide-react";
import {
  MODULER_2507,
  OBLIGER_2507,
  SIKKERHETSDELEN,
  alleQuizer,
  kravAndel,
  kreverAlt,
  type Dte2507Modul,
} from "@/lib/dte2507/canvasModuler";
import { dagerTil, formatDato } from "@/lib/dte2507/lagPlan";
import { naavaerendeUke } from "@/lib/semester/uker";

// ---------------------------------------------------------------------------
// Emnets faktiske modulstruktur, lest fra Canvas 2026-08-16.
//
// Den ene opplysningen som er lettest å overse og dyrest å oppdage sent:
// **de fleste quizene krever full pott.** Ett feil svar på Modulquiz-Modul 2
// er stryk på den quizen. Derfor står kravet på hver rad, og de strengeste er
// samlet i en egen advarsel øverst i stedet for å ligge begravd i tabellen.
// ---------------------------------------------------------------------------

export function Dte2507Modultabell({ naa = new Date() }: { naa?: Date }) {
  const naaUke = naavaerendeUke(naa);
  const neste = alleQuizer().find(({ quiz }) => dagerTil(quiz.frist, naa) >= 0);
  const strenge = kreverAlt();

  return (
    <section className="mb-8">
      <h2 className="mb-3 flex flex-wrap items-center gap-2 text-lg font-semibold">
        <CalendarClock className="h-5 w-5 text-brand" />
        Canvas-modulene, uke 34–40
        <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          lest 16.08.2026
        </span>
      </h2>

      {/* Neste frist — det ene tallet som betyr noe akkurat nå. */}
      {neste && (
        <div className="mb-4 flex flex-wrap items-center gap-4 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4">
          <div className="flex-1 min-w-[14rem] text-sm">
            <div className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300">
              Neste frist · modul {neste.modul.nr}
            </div>
            <span className="font-semibold text-foreground">{neste.quiz.navn}</span>
            <p className="mt-0.5 text-muted-foreground">
              {formatDato(neste.quiz.frist)} kl. {neste.quiz.klokkeslett ?? "23:59"} · krever{" "}
              {neste.quiz.krav} av {neste.quiz.poeng} poeng
              {kravAndel(neste.quiz) >= 1 && (
                <strong className="text-amber-700 dark:text-amber-300"> — full pott</strong>
              )}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-3xl font-bold tabular-nums text-amber-600 dark:text-amber-300">
              {dagerTil(neste.quiz.frist, naa)}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              dager igjen
            </div>
          </div>
        </div>
      )}

      {/* Prosentkravene. Den eneste opplysningen som fortjener en advarsel. */}
      <div className="mb-4 flex items-start gap-3 rounded-xl border border-rose-500/40 bg-rose-500/5 p-4 text-sm leading-relaxed">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
        <div>
          <strong className="text-foreground">
            {strenge.length} av {alleQuizer().length} quizer krever full pott.
          </strong>{" "}
          Ett feil svar er stryk på den quizen. Det gjelder{" "}
          {strenge.map((s) => s.quiz.navn).join(", ")}. Bare Modulquiz-Modul 3 (24 av 29) og
          Modulquiz-Modul 4 (18 av 20) gir rom for feil. Lab 1 har ubegrensede forsøk med hint
          etter innlevering — sjekk om det samme gjelder de andre før du leverer en du er usikker
          på.
        </div>
      </div>

      <div className="space-y-3">
        {MODULER_2507.map((m) => (
          <ModulRad key={m.nr} modul={m} naa={naa} naaUke={naaUke} />
        ))}
      </div>

      {/* Obligene — som altså ikke er innleveringer. */}
      <div className="mt-4 rounded-xl border border-border bg-card p-4">
        <h3 className="mb-2 text-sm font-semibold">De tre obligene</h3>
        <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
          Obligene er ingen egen innlevering. De er én avkrysning på at alle quizene i to moduler
          allerede er godkjent — jobben ligger i quizene over. Selve avkrysningen er verdt ett
          poeng og har likevel en frist du kan glippe på.
        </p>
        <ul className="space-y-2 text-sm">
          {OBLIGER_2507.map((o) => (
            <li key={o.nr} className="flex flex-wrap items-baseline gap-x-2">
              <span className="font-medium text-foreground">Oblig {o.nr}</span>
              <span className="tabular-nums text-muted-foreground">{formatDato(o.frist)}</span>
              <span className="text-xs text-muted-foreground">
                modul {o.moduler.join(" og ")}
              </span>
              {o.konflikt && (
                <span className="mt-1 flex w-full items-start gap-1.5 rounded border border-amber-500/30 bg-amber-500/5 p-2 text-[11px] leading-relaxed text-amber-800 dark:text-amber-300">
                  <Info className="mt-0.5 h-3 w-3 shrink-0" />
                  {o.konflikt}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Halve faget ligger et annet sted. */}
      <p className="mt-4 rounded-xl border border-dashed border-border bg-muted/30 p-4 text-sm leading-relaxed text-muted-foreground">
        <strong className="text-foreground">Dette er halve DTE-2507.</strong> Canvas-emnet over
        dekker datakomm-delen (5 studiepoeng) og hele ELE-2603. Sikkerhetsdelen går uke{" "}
        {SIKKERHETSDELEN.uker[0]}–{SIKKERHETSDELEN.uker[SIKKERHETSDELEN.uker.length - 1]} på en
        egen Canvas-side som ikke er lest ennå, og har egne arbeidskrav i tillegg til de tre
        obligene. På eksamensdagen 30.11 er datakomm kl. 09 og sikkerhet kl. {SIKKERHETSDELEN.eksamenKlokkeslett} — to
        økter, samme dag.
      </p>
    </section>
  );
}

function ModulRad({
  modul,
  naa,
  naaUke,
}: {
  modul: Dte2507Modul;
  naa: Date;
  naaUke: number | null;
}) {
  const aktiv = naaUke !== null && modul.uker.includes(naaUke);
  return (
    <div
      className={`rounded-xl border p-4 ${aktiv ? "border-brand bg-brand/5" : "border-border bg-card"}`}
    >
      <div className="mb-1 flex flex-wrap items-baseline gap-2">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/15 text-xs font-bold text-brand">
          {modul.nr}
        </span>
        <h3 className="font-semibold text-foreground">{modul.tittel}</h3>
        {aktiv && (
          <span className="rounded-full bg-brand px-2 py-0.5 text-[10px] font-semibold text-white">
            denne uka
          </span>
        )}
        <span className="ml-auto text-[10px] uppercase tracking-wider text-muted-foreground">
          uke {modul.uker.join("/")} · Kurose kap. {modul.kapitler.join(" og ")}
        </span>
      </div>

      <p className="text-xs text-muted-foreground">{modul.labber.join(" · ")}</p>

      <ul className="mt-2 space-y-1">
        {modul.quizer.map((q) => {
          const dager = dagerTil(q.frist, naa);
          const full = kravAndel(q) >= 1;
          return (
            <li
              key={q.navn}
              className="flex flex-wrap items-baseline gap-x-2 rounded border border-border bg-background px-2.5 py-1.5 text-xs"
            >
              <span className="font-medium text-foreground">{q.navn}</span>
              <span className="tabular-nums text-muted-foreground">
                {formatDato(q.frist)}
                {q.klokkeslett && ` kl. ${q.klokkeslett}`}
              </span>
              <span className={full ? "font-medium text-rose-600 dark:text-rose-400" : "text-muted-foreground"}>
                {q.krav}/{q.poeng}
                {full && " — full pott"}
              </span>
              {dager >= 0 && (
                <span className="ml-auto tabular-nums text-muted-foreground">om {dager} d</span>
              )}
            </li>
          );
        })}
      </ul>

      {/* Har modulen en løype, er det den man skal inn i — ikke den ene siden
          som lignet mest. Moduler uten løype beholder den gamle lenka. */}
      {modul.steg && modul.steg.length > 0 ? (
        <Link
          to="/stack/$slug"
          params={{ slug: `dte2507-modul${modul.nr}` }}
          className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-brand hover:underline"
        >
          Gå gjennom modulen — {modul.steg.length} steg
          <ArrowRight className="h-3 w-3" />
        </Link>
      ) : (
        modul.ovingSlug && (
          <Link
            to="/stack/$slug"
            params={{ slug: modul.ovingSlug }}
            className="mt-2 inline-flex items-center gap-1.5 text-xs text-brand hover:underline"
          >
            Forbered deg her
            <ArrowRight className="h-3 w-3" />
          </Link>
        )
      )}

      {modul.hull && (
        <p className="mt-2 rounded border border-amber-500/30 bg-amber-500/5 p-2 text-[11px] leading-relaxed text-muted-foreground">
          <strong className="text-foreground">Hull i appen:</strong> {modul.hull}
        </p>
      )}
    </div>
  );
}
