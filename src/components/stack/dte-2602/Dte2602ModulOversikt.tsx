import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Beaker,
  BookOpen,
  CalendarClock,
  CircleDot,
  FlaskConical,
  Info,
  Lock,
} from "lucide-react";
import { ModulStatusBadge, ModulProgressBar } from "@/components/stack/HubShared";
import { FASER, EKSAMEN_DTE2602, faseSlugs, type Fase, type FaseStatus } from "@/lib/dte2602/faser";

// ---------------------------------------------------------------------------
// Modul-for-modul-oversikt for DTE-2602 (PLAN-HOST26-MODULER.md §4.3 og §7, rad D).
//
// Hensikten er den samme som for de andre faga: gjøre emnet følgbart fase for
// fase i stedet for som en flat liste av 16 mini-kurs og 30 labber. Per fase:
//   • hva den handler om,
//   • sjekkpunktet — hva du skal kunne uten hjelp (§2),
//   • hvilke eksisterende sider som hører til, med framdrift,
//   • ærlig status på hvor langt fasen er bygget.
//
// Sjekkpunktet er formulert bakover fra vurderingen, som her er hjemmeeksamen
// 09.12.2026 og mappeinnlevering 11.12.2026 — ikke fra temaet. Det er derfor
// sjekkpunktene er formulert som «gitt et datasett / gitt en pipeline …» og
// ikke som «forklar hva X er».
//
// Faser som ikke er bygget etter oppgave-arkitekturen skal stå merket som det.
// Å skjule dem ville gjort oversikten ubrukelig som planleggingsverktøy.
// ---------------------------------------------------------------------------

/**
 * Sjekkpunktet per fase. Ligger her og ikke i `faser.ts` fordi det er en
 * pedagogisk formulering knyttet til denne visningen, mens `faser.ts` er
 * datamodellen over hva faget består av.
 */
const SJEKKPUNKT: Record<number, string> = {
  1: "Gitt en problembeskrivelse i klartekst: avgjør om det er et maskinlæringsproblem i det hele tatt, velg læringstype og oppgavetype, pek ut hva som skal være target — og regn ut hva den trivielle baselinen ville fått, før du sier noe om hvor god en modell er.",
  2: "Gitt en rå tabell: pek ut target, luk ut kolonner som er identifikatorer eller som ikke finnes på prediksjonstidspunktet, velg utfylling og koding for hver gjenværende kolonne, og sett stegene i en rekkefølge der ingenting læres av testdataene.",
  3: "Gitt et resultat noen andre har rapportert: avgjør om tallet er til å stole på — riktig oppdeling, riktig metrikk for klassebalansen, og en baseline å måle mot. Og forklar hva forskjellen mellom treningsscore og testscore forteller deg.",
  4: "Gitt et ferdig forbehandlet datasett: velg en algoritme og begrunn valget med hvilken antakelse den gjør om dataene, skill hyperparametre fra parametre, og sett opp et søk som ikke rører testsettet.",
  5: "Gitt et datasett uten fasit: velg klustering eller dimensjonsreduksjon ut fra hva du vil oppnå, begrunn antall grupper, og vurder om gruppene algoritmen fant betyr noe — uten å ha en score å gjemme deg bak.",
  6: "Forklar hva et nevralt nett gjør som en lineær modell ikke klarer, hvilken rolle aktiveringsfunksjonen spiller, og hva de tre stegene forward, backward og oppdatering gjør — på intuisjonsnivå, uten å utlede noe.",
  7: "Lever et prosjekt en sensor kan stole på: baseline oppgitt, klasseubalanse håndtert og begrunnet, seed satt slik at kjøringen kan gjentas, skjevhet og personvern drøftet, og rapporten strukturert slik at hvert valg er sporbart.",
};

const STATUS_STIL: Record<FaseStatus, { label: string; cls: string; Icon: typeof BookOpen }> = {
  komplett: {
    label: "Bygget som modul — alle oppgavetypene",
    cls: "border-success/30 bg-success/10 text-success",
    Icon: Beaker,
  },
  "stoff-finnes": {
    label: "Leksjoner og labber finnes — modul ikke bygget ennå",
    cls: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    Icon: BookOpen,
  },
  "under-arbeid": {
    label: "Bygges i en annen sesjon akkurat nå",
    cls: "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300",
    Icon: FlaskConical,
  },
};

const ART_MERKE: Record<"modul" | "leksjon" | "lab", string> = {
  modul: "modul",
  leksjon: "les",
  lab: "lab",
};

export function Dte2602ModulOversikt() {
  const alleSlugs = [...new Set(FASER.flatMap(faseSlugs))];

  return (
    <section id="moduler" className="mb-12 scroll-mt-28">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <CalendarClock className="h-5 w-5 text-brand" />
        <h2 className="text-xl font-semibold">Fase for fase</h2>
        <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300">
          Hjemmeeksamen {EKSAMEN_DTE2602.hjemmeeksamen} · mappe {EKSAMEN_DTE2602.mappe}
        </span>
      </div>
      <p className="mb-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Sju faser i den rekkefølgen de bygger på hverandre. En fase er ikke ferdig når temaet er
        lest — den er ferdig når du kan gjøre det som står under «du skal kunne, uten hjelp». Fase 1
        og 2 har egne modulsider som tar deg gjennom hele runden: anslå, simulér, sett opp, feilsøk,
        repetér. De øvrige har foreløpig leksjonene og labbene sine direkte, og det står på hver
        enkelt.
      </p>

      <div className="mb-5 rounded-xl border border-brand/25 bg-brand/5 p-4">
        <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-brand">
          <Info className="h-3.5 w-3.5" /> Hvorfor oppgavene ser ut som de gjør
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {EKSAMEN_DTE2602.konsekvens}
        </p>
      </div>

      <div className="mb-6 rounded-xl border border-border bg-card p-4">
        <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Framdrift på tvers av alle sju fasene
        </div>
        <ModulProgressBar trinnSlugs={alleSlugs} />
      </div>

      <div className="space-y-4">
        {FASER.map((f) => (
          <FaseKort key={f.id} fase={f} />
        ))}
      </div>
    </section>
  );
}

function FaseKort({ fase }: { fase: Fase }) {
  const slugs = faseSlugs(fase);
  const stil = STATUS_STIL[fase.status];
  const StatusIkon = stil.Icon;
  const mappeAtomer = fase.atomer.filter((a) => a.mappe).length;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand/15 text-sm font-bold text-brand">
          {fase.nummer}
        </span>
        <h3 className="font-semibold text-foreground">{fase.tittel}</h3>
        <ModulStatusBadge trinnSlugs={slugs} />
        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${stil.cls}`}>
          <StatusIkon className="mr-1 inline h-3 w-3" />
          {stil.label}
        </span>
        <span className="ml-auto text-[10px] uppercase tracking-wider text-muted-foreground">
          {fase.atomer.length} konsepter
          {mappeAtomer > 0 && ` · ${mappeAtomer} mappe-relevante`}
        </span>
      </div>

      {fase.byggerPa.length > 0 && (
        <div className="mb-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Lock className="h-3 w-3" />
          Forutsetter fase {fase.byggerPa.join(" og ")} — begrepene derfra brukes uten å bli
          forklart på nytt.
        </div>
      )}

      <p className="text-sm leading-relaxed text-muted-foreground">{fase.handlerOm}</p>

      <div className="mt-2 flex items-start gap-1.5 text-sm text-foreground">
        <CircleDot className="mt-1 h-3.5 w-3.5 shrink-0 text-brand" />
        <span className="italic">{fase.sporsmal}</span>
      </div>

      <div className="mt-3 rounded-lg border border-brand/25 bg-brand/5 p-3 text-sm">
        <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-brand">
          Du skal kunne, uten hjelp
        </div>
        <div className="leading-relaxed text-foreground">{SJEKKPUNKT[fase.nummer]}</div>
      </div>

      {fase.merknad && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-violet-500/30 bg-violet-500/5 p-3 text-xs leading-relaxed text-muted-foreground">
          <FlaskConical className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-600 dark:text-violet-400" />
          <span>{fase.merknad}</span>
        </div>
      )}

      {fase.oppgaver && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Teller navn="anslå-så-sjekk" n={fase.oppgaver.anslag} />
          <Teller navn="guidede simuleringer" n={fase.oppgaver.simulering} />
          <Teller navn="måloppgaver" n={fase.oppgaver.maal} fremhev />
          <Teller navn="feilsøkingsoppgaver" n={fase.oppgaver.feilsoking} fremhev />
          <Teller navn="recall-kort" n={fase.oppgaver.recall} />
        </div>
      )}

      <ul className="mt-3 space-y-1.5">
        {fase.trinn.map((t) => {
          const primaer = t.art === "modul";
          return (
            <li key={t.slug}>
              <Link
                to="/stack/$slug"
                params={{ slug: t.slug }}
                className={`group flex flex-wrap items-baseline gap-x-2 gap-y-0.5 rounded-lg border px-3 py-2 text-sm transition-colors ${
                  primaer
                    ? "border-brand/40 bg-brand/5 hover:border-brand"
                    : "border-border bg-background hover:border-brand/40"
                }`}
              >
                <span className="shrink-0 rounded border border-border px-1 py-px text-[9px] uppercase tracking-wider text-muted-foreground">
                  {ART_MERKE[t.art]}
                </span>
                <span
                  className={primaer ? "font-medium text-brand" : "font-medium text-foreground"}
                >
                  {t.tittel}
                </span>
                <span className="text-xs text-muted-foreground">{t.hva}</span>
                <ArrowRight className="ml-auto h-3.5 w-3.5 shrink-0 self-center text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Konseptene fasen dekker — med ærlig merking av hull. */}
      <details className="mt-3 group">
        <summary className="cursor-pointer text-xs text-muted-foreground transition-colors hover:text-foreground">
          Konseptene i fasen ({fase.atomer.length})
        </summary>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {fase.atomer.map((a) => (
            <span
              key={a.id}
              className={`rounded-md border px-2 py-0.5 text-[11px] ${
                a.dekkesAv
                  ? "border-border bg-muted/40 text-muted-foreground"
                  : "border-red-500/40 bg-red-500/5 text-red-600 dark:text-red-400"
              }`}
              title={a.dekkesAv ? `Dekkes av: ${a.dekkesAv}` : "Ikke dekket ennå"}
            >
              {a.navn}
              {a.mappe && (
                <span className="ml-1 text-brand" title="Mappe-relevant">
                  ◆
                </span>
              )}
            </span>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          ◆ markerer konsepter som er direkte relevante for mappeinnleveringen.
        </p>
      </details>

      <div className="mt-3">
        <ModulProgressBar trinnSlugs={slugs} />
      </div>
    </div>
  );
}

function Teller({ navn, n, fremhev }: { navn: string; n: number; fremhev?: boolean }) {
  if (n === 0) return null;
  return (
    <span
      className={`rounded-md border px-2 py-0.5 text-[11px] ${
        fremhev
          ? "border-brand/40 bg-brand/10 text-brand"
          : "border-border bg-muted/40 text-muted-foreground"
      }`}
    >
      <span className="font-semibold tabular-nums">{n}</span> {navn}
    </span>
  );
}
