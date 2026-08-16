import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  CircleAlert,
  GraduationCap,
  Info,
  Unlock,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import {
  fagkode,
  kommendeHendelser,
  semesterPlan,
  UTEN_UKEPLAN,
  type FagSlug,
  type Hendelse,
  type Slag,
} from "@/lib/semester/plan";
import { naavaerendeUke, ukeSpenn } from "@/lib/semester/uker";
import { dagerTil, formatFrist } from "@/lib/dte2505/canvasModuler";
import { UTELATT } from "@/lib/tek1501/framdriftsplan";
import { VURDERING_DTE2602, slakkIObliger } from "@/lib/dte2602/vurdering";

// ---------------------------------------------------------------------------
// Semesterplan — alle fire fag på én tidsakse, uke 34 til uke 51.
//
// Hensikten er å svare på ett spørsmål: *hva skjer denne uka, i alle fag?*
// Fag-hubene svarer hver for seg, og det er nettopp problemet — obligfristen i
// DTE-2505 og kapittelbyttet i TEK-1501 lander i samme uke uten at noen av
// sidene sier det.
//
// Regelen for hva som vises: kun det vi har en kilde til. DTE-2507 har ingen
// leste Canvas-moduler, og DTE-2602 har ingen ukeplan i det hele tatt (omvendt
// undervisning). Begge står oppført med grunnen, ikke som tomme uker.
// ---------------------------------------------------------------------------

export const Route = createFileRoute("/semesterplan")({
  head: () => ({
    meta: [
      { title: "Semesterplan høst 2026 — alle fire fag, uke for uke" },
      {
        name: "description",
        content:
          "Uke 34 til 51: kapitler, modulåpninger, obligfrister og eksamensdatoer for DTE-2505, DTE-2507, DTE-2602 og TEK-1501 på én tidsakse.",
      },
    ],
  }),
  component: SemesterplanPage,
});

const FAG_STIL: Record<FagSlug, string> = {
  "dte-2505": "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  "dte-2507": "border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  "dte-2602": "border-violet-500/40 bg-violet-500/10 text-violet-700 dark:text-violet-300",
  "tek-1501": "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300",
};

const SLAG_STIL: Record<Slag, { kant: string; merke: string; label: string }> = {
  eksamen: {
    kant: "border-l-4 border-l-rose-500",
    merke: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
    label: "eksamen",
  },
  frist: {
    kant: "border-l-4 border-l-amber-500",
    merke: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    label: "frist",
  },
  apner: {
    kant: "border-l-4 border-l-brand",
    merke: "bg-brand/15 text-brand",
    label: "åpner",
  },
  pensum: {
    kant: "border-l-4 border-l-border",
    merke: "bg-muted text-muted-foreground",
    label: "pensum",
  },
};

function HendelseRad({ h }: { h: Hendelse }) {
  const stil = SLAG_STIL[h.slag];
  const innhold = (
    <>
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span
          className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold tracking-wide ${FAG_STIL[h.fag]}`}
        >
          {fagkode(h.fag)}
        </span>
        <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${stil.merke}`}>
          {stil.label}
        </span>
        <span className="font-medium text-foreground">{h.tittel}</span>
        {h.dato && (
          <span className="text-xs tabular-nums text-muted-foreground">
            {formatFrist(h.dato).slice(0, 5)}
          </span>
        )}
        {h.tilSlug && (
          <ArrowRight className="ml-auto h-3.5 w-3.5 shrink-0 self-center text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        )}
      </div>
      {h.detalj && (
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{h.detalj}</p>
      )}
    </>
  );

  const klasser = `group block rounded-r-lg bg-background px-3 py-2 ${stil.kant} ${
    h.tilSlug ? "transition-colors hover:bg-muted/60" : ""
  }`;

  return h.tilSlug ? (
    <Link to="/stack/$slug" params={{ slug: h.tilSlug }} className={klasser}>
      {innhold}
    </Link>
  ) : (
    <div className={klasser}>{innhold}</div>
  );
}

function SemesterplanPage() {
  const naa = new Date();
  const plan = semesterPlan();
  const naaUke = naavaerendeUke(naa);
  const neste = kommendeHendelser(naa, 6);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <CalendarClock className="h-6 w-6 text-brand" />
          <h1 className="text-2xl font-bold">Semesterplan høst 2026</h1>
          <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
            uke 34–51
          </span>
        </div>
        <p className="mb-6 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Alle fire fag på én tidsakse, så du ser når to frister lander i samme uke. Kildene er
          Canvas-modulene i DTE-2505 og DTE-2507, framdriftsplanen i TEK-1501 og
          eksamensoppmeldingen. Der en kilde mangler står det, i stedet for at uka ser tom ut.
        </p>

        {/* Det neste som skjer — den delen man ser på hver dag. */}
        <section className="mb-8 rounded-xl border border-border bg-card p-4">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <CircleAlert className="h-4 w-4 text-amber-500" />
            Det neste som skjer
          </h2>
          {neste.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Ingen daterte hendelser igjen i semesteret.
            </p>
          ) : (
            <ul className="space-y-2">
              {neste.map((h, i) => {
                const dager = dagerTil(h.dato!, naa);
                return (
                  <li key={`${h.tittel}-${i}`} className="flex flex-wrap items-baseline gap-x-2">
                    <span
                      className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold ${FAG_STIL[h.fag]}`}
                    >
                      {fagkode(h.fag)}
                    </span>
                    <span className="text-sm text-foreground">{h.tittel}</span>
                    <span className="ml-auto text-xs tabular-nums text-muted-foreground">
                      {formatFrist(h.dato!)} ·{" "}
                      <strong
                        className={
                          dager <= 7 ? "text-amber-600 dark:text-amber-400" : "text-foreground"
                        }
                      >
                        {dager === 0 ? "i dag" : dager === 1 ? "i morgen" : `om ${dager} dager`}
                      </strong>
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Ukene. */}
        <section className="mb-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Uke for uke
          </h2>
          <div className="space-y-3">
            {plan.map(({ uke, hendelser }) => {
              const naaVaerende = uke.nr === naaUke;
              return (
                <div
                  key={uke.nr}
                  id={`uke-${uke.nr}`}
                  className={`scroll-mt-24 rounded-xl border p-4 ${
                    naaVaerende ? "border-brand bg-brand/5" : "border-border bg-card"
                  }`}
                >
                  <div className="mb-2 flex flex-wrap items-baseline gap-2">
                    <span className="text-sm font-bold text-foreground">Uke {uke.nr}</span>
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {ukeSpenn(uke)}
                    </span>
                    {naaVaerende && (
                      <span className="rounded-full bg-brand px-2 py-0.5 text-[10px] font-semibold text-white">
                        denne uka
                      </span>
                    )}
                  </div>
                  {hendelser.length === 0 ? (
                    <p className="text-xs italic text-muted-foreground">
                      Ingenting datert denne uka i kildene vi har.
                    </p>
                  ) : (
                    <div className="space-y-1.5">
                      {hendelser.map((h, i) => (
                        <HendelseRad key={`${uke.nr}-${i}`} h={h} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Hva planen ikke dekker. */}
        <section className="mb-8 rounded-xl border-2 border-dashed border-amber-500/40 bg-amber-500/5 p-4">
          <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Fag uten ukeplan
          </h2>
          <ul className="space-y-2">
            {UTEN_UKEPLAN.map((u) => (
              <li key={u.fag} className="text-sm">
                <span
                  className={`mr-2 rounded border px-1.5 py-0.5 text-[10px] font-semibold ${FAG_STIL[u.fag]}`}
                >
                  {fagkode(u.fag)}
                </span>
                <span className="leading-relaxed text-muted-foreground">{u.hvorfor}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* DTE-2602s arbeidskrav — det harde sjekkpunktet før eksamen. */}
        <section className="mb-8 rounded-xl border border-border bg-card p-4">
          <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <GraduationCap className="h-4 w-4 text-violet-500" />
            DTE-2602 — hva som kreves for å bestå
          </h2>
          <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
            {VURDERING_DTE2602.arbeidskrav.antall} programmeringsøvinger, hvorav minst{" "}
            <strong className="text-foreground">
              {VURDERING_DTE2602.arbeidskrav.kravGodkjent} må være godkjent
            </strong>{" "}
            før du kan framstille deg til eksamen. Du har altså {slakkIObliger()} å gå på — ikke
            flere. {VURDERING_DTE2602.arbeidskrav.forsinkelse}
          </p>
          <ul className="mb-3 space-y-1.5 text-sm">
            {VURDERING_DTE2602.deler.map((d) => (
              <li key={d.navn} className="flex flex-wrap items-baseline gap-x-2">
                <span className="font-medium text-foreground">{d.navn}</span>
                <span className="tabular-nums text-muted-foreground">
                  {formatFrist(d.dato)}
                  {d.utlevering ? ` ${d.utlevering}–${d.innlevering}` : ` kl. ${d.innlevering}`}
                </span>
                <span className="text-xs text-muted-foreground">{d.hva}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {VURDERING_DTE2602.vekting} {VURDERING_DTE2602.kontinuasjon}
          </p>
        </section>

        {/* TEK-1501 — det som er tatt ut av pensum. */}
        <section className="mb-8 rounded-xl border border-border bg-card p-4">
          <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <Info className="h-4 w-4 text-rose-500" />
            TEK-1501 — utenfor pensum
          </h2>
          <p className="mb-3 text-sm text-muted-foreground">
            Framdriftsplanen holder disse utenfor. Verdt å vite før du leser boka fra perm til perm.
          </p>
          <ul className="space-y-1 text-sm">
            {UTELATT.map((u) => (
              <li key={u.hva} className="flex flex-wrap items-baseline gap-x-2">
                <span className="font-medium text-foreground">{u.hva}</span>
                <span className="text-xs text-muted-foreground">{u.hvorfor}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 flex items-start gap-2 rounded-lg bg-muted/60 p-3 text-xs leading-relaxed text-muted-foreground">
            <Unlock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              Merk rekkefølgen: faget underviser <strong>kapittel 2 før kapittel 1</strong>.
              Sannsynlighetsregning kommer uke 34–35, beskrivende statistikk uke 36–37. I appen
              betyr det at du begynner på{" "}
              <Link
                to="/stack/$slug"
                params={{ slug: "tek1-modul2-sannsynlighet" }}
                className="text-brand underline"
              >
                modul 2 — Sannsynlighet
              </Link>
              , ikke modul 1.
            </span>
          </p>
        </section>

        <p className="text-xs text-muted-foreground">
          Canvas sier selv at framdriftsplanen i TEK-1501 er omtrentlig og kan endres underveis.
          Datoene i DTE-2505 er lest fra Canvas 16.08.2026, eksamensdatoene fra oppmeldingen.
        </p>
      </main>
    </>
  );
}
