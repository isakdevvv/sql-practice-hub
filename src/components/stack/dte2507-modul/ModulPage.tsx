import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  Circle,
  Play,
  Terminal,
  TriangleAlert,
} from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { MODULER_2507, OBLIGER_2507 } from "@/lib/dte2507/canvasModuler";
import { dagerTil, formatDato } from "@/lib/dte2507/lagPlan";
import { isTrinnSeen } from "@/lib/stack/moduleProgress";
import { lessonMastery } from "@/lib/core/mastery";

// ---------------------------------------------------------------------------
// Modulsiden til DTE-2507 — én komponent for alle seks modulene.
//
// Hullet den fyller: stoffet fantes, men lå spredt på sider uten noe som bandt
// dem sammen. Hver modul var registrert med ÉN slug (`ovingSlug`), og resten av
// sidene var i praksis uoppdagelige. Nå er rekkefølgen data — `steg` på modulen
// i canvasModuler.ts — og både denne siden og forrige/neste-foten på hver enkelt
// side leser den samme lista.
//
// Siden er en oversikt, ikke en leksjon. Den skal svare på fire ting og så komme
// seg ut av veien: hva modulen krever, hva som er gjort, hva som er neste steg,
// og hva appen IKKE dekker.
//
// Den er generisk med vilje. Modul 1 var pilot, og fristelsen var å kopiere den
// fem ganger; da ville en rettelse måttet gjøres seks steder. Alt som skiller
// modulene er data.
// ---------------------------------------------------------------------------

export function Dte2507ModulPage({ nr }: { nr: string }) {
  const modul = MODULER_2507.find((m) => m.nr === nr);
  const steg = modul?.steg ?? [];
  const oblig = OBLIGER_2507.find((o) => o.moduler.includes(nr));

  // Framdrift bor i localStorage og finnes ikke under tjener-rendringen.
  const [montert, setMontert] = useState(false);
  useEffect(() => setMontert(true), []);

  // Steget som er modulens egen lab — merkes i lista, og navngis i
  // verktøy-seksjonen så «verktøyene» ikke henger i løse lufta.
  const labIndeks = steg.findIndex((s) => s.slug === modul?.ovingSlug);
  const labSteg = labIndeks >= 0 ? { nr: labIndeks + 1, tittel: steg[labIndeks].tittel } : null;

  const sett = montert ? steg.filter((s) => isTrinnSeen(s.slug)).length : 0;
  const neste = montert ? (steg.find((s) => !isTrinnSeen(s.slug)) ?? steg[0]) : steg[0];

  if (!modul) return null;

  return (
    <StackPageShell title={`Modul ${modul.nr} — ${modul.tittel}`} group="eksamen">
      <div className="container mx-auto max-w-4xl px-4 py-10">
        <header className="mb-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand">
            DTE-2507 · modul {modul.nr} · uke {modul.uker.join(", ")}
          </p>
          <h1 className="mb-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {modul.tittel}
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Kurose kapittel {modul.kapitler.join(" og ")}
            {modul.ingress ? `: ${modul.ingress}` : "."}{" "}
            {steg.length > 1
              ? `${steg.length} steg, i den rekkefølgen de skal tas.`
              : "Ett steg i appen — se hullet nederst."}
          </p>
        </header>

        {/* Hva modulen faktisk krever — det er quizen, ikke lesingen. */}
        {modul.quizer.map((q) => {
          const dager = dagerTil(q.frist);
          return (
            <div
              key={q.navn}
              className="mb-4 flex items-start gap-3 rounded-xl border border-amber-500/40 bg-amber-500/5 p-4 text-sm"
            >
              <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <div className="leading-relaxed">
                <strong className="text-foreground">{q.navn}</strong> har frist{" "}
                {formatDato(q.frist)}
                {q.klokkeslett ? ` kl. ${q.klokkeslett}` : ""} og krever {q.krav} av {q.poeng} poeng
                {q.krav === q.poeng ? " — altså full pott" : ""}. {q.hva}
              </div>
              {dager >= 0 && (
                <div className="ml-auto shrink-0 text-right">
                  <div className="text-2xl font-bold tabular-nums text-amber-600 dark:text-amber-400">
                    {dager}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    dager igjen
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {oblig && (
          <div className="mb-8 flex items-start gap-3 rounded-xl border border-border bg-card p-4 text-sm">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <p className="leading-relaxed text-muted-foreground">
              Oblig {oblig.nr} ({formatDato(oblig.frist)}) er bare en avkrysning på at quizene i
              modul {oblig.moduler.join(" og ")} allerede er godkjent. Jobben ligger i quizen over —
              selve obligen er ett klikk.
            </p>
          </div>
        )}

        {/* Selve løypa. */}
        <section className="mb-10">
          <h2 className="mb-2 flex flex-wrap items-center gap-2 text-lg font-semibold">
            <BookOpen className="h-5 w-5 text-brand" />
            Løypa
            <span className="ml-auto text-sm font-normal tabular-nums text-muted-foreground">
              {sett} / {steg.length} åpnet
            </span>
          </h2>
          <p className="mb-4 max-w-2xl text-sm text-muted-foreground">
            Hvert steg har en «neste»-knapp i foten, så du kan gå gjennom hele modulen uten å komme
            tilbake hit.{modul.rekkefolgeMerknad ? ` ${modul.rekkefolgeMerknad}` : ""}
          </p>

          <ol className="space-y-3">
            {steg.map((s, i) => {
              const erSett = montert && isTrinnSeen(s.slug);
              const mestring = montert ? lessonMastery(s.slug) : { bestatt: 0, totalt: 0 };
              return (
                <li key={s.slug}>
                  <Link
                    to="/stack/$slug"
                    params={{ slug: s.slug }}
                    className={`group flex items-start gap-4 rounded-xl border p-4 transition-colors ${
                      erSett
                        ? "border-success/40 bg-success/5 hover:border-success/60"
                        : "border-border bg-card hover:border-brand/50"
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        erSett ? "bg-success/20 text-success" : "bg-brand/15 text-brand"
                      }`}
                    >
                      {erSett ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-medium text-foreground">{s.tittel}</h3>
                        {s.slug === modul.ovingSlug && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-brand/40 bg-brand/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-brand">
                            <Terminal className="h-3 w-3" />
                            laben
                          </span>
                        )}
                        {mestring.totalt > 0 && (
                          <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                            sjekk {mestring.bestatt}/{mestring.totalt}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        {s.hvorfor}
                      </p>
                    </div>
                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-brand" />
                  </Link>
                </li>
              );
            })}
          </ol>

          {neste && (
            <Link
              to="/stack/$slug"
              params={{ slug: neste.slug }}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-brand-foreground transition-opacity hover:opacity-90"
            >
              <Play className="h-4 w-4" />
              {sett === 0
                ? "Start modulen"
                : sett === steg.length
                  ? "Gå gjennom på nytt"
                  : "Fortsett her"}
              <span className="opacity-80">· {neste.tittel}</span>
            </Link>
          )}
        </section>

        {/* Verktøyene, som er det laben faktisk måler. */}
        <section className="mb-10">
          <h2 className="mb-2 text-lg font-semibold">Verktøyene modulen krever</h2>
          <p className="mb-3 max-w-2xl text-sm text-muted-foreground">
            {labSteg
              ? `Øves i steg ${labSteg.nr}: ${labSteg.tittel}.`
              : "Verktøyene modulens labber bruker."}
          </p>
          <div className="flex flex-wrap gap-2">
            {modul.verktoy.map((v) => (
              <code
                key={v}
                className="rounded-md border border-border bg-card px-2.5 py-1 font-mono text-xs text-foreground"
              >
                {v}
              </code>
            ))}
          </div>
        </section>

        {/* Ærlig om hullene — det er en av grunnene til at modultabellen finnes. */}
        {modul.hull && (
          <div className="mb-10 flex items-start gap-3 rounded-xl border border-border bg-card p-4 text-sm">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <p className="leading-relaxed text-muted-foreground">
              <strong className="text-foreground">Ikke dekket her:</strong> {modul.hull}
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-3 text-sm">
          {/* Modultabellen med alle fristene rendres inne PÅ lag-siden — det
              finnes ingen egen /stack/dte2507-moduler-rute. */}
          <Link
            to="/stack/$slug"
            params={{ slug: "dte2507-lag" }}
            className="inline-flex items-center gap-1.5 text-brand hover:underline"
          >
            Alle modulene med frister, og faget lag for lag
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            to="/repetisjon/kort"
            className="inline-flex items-center gap-1.5 text-brand hover:underline"
          >
            Repetisjonskøen
            <Circle className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </StackPageShell>
  );
}
