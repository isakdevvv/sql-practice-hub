import { Link } from "@tanstack/react-router";
import { ArrowRight, BarChart3, CalendarClock, Dice5, Sigma, Sparkles, Target } from "lucide-react";
import { ModulStatusBadge, ModulProgressBar } from "@/components/stack/HubShared";
import { ProvisoriskKapittelnote } from "@/components/stack/tek1-oppgaver/Symboltavle";
import {
  kapitlerForModul,
  ukespennForModul,
  type Tek1501Modul,
} from "@/lib/tek1501/framdriftsplan";

// ---------------------------------------------------------------------------
// Modul-for-modul-oversikt for TEK-1501 (PLAN-HOST26-MODULER.md §4.4 og §7, rad C).
//
// Hensikten er å gjøre faget følgbart undervisningsuke for undervisningsuke i
// stedet for som en flat liste av 17 temasider. Hver modul har:
//   • hva den handler om, i én setning uten symboler,
//   • hvilket spørsmål den setter deg i stand til å svare på (sjekkpunktet, §2),
//   • hvilke eksisterende sider som hører til, med framdrift,
//   • status: er den bygget etter oppgave-arkitekturen (§3) eller ikke.
//
// Modulinndelingen følger sporene A–F i plan-tek-1501.md, ikke kapitler i boka:
// læreboka (Kristensen & Wikan) er ikke tilgjengelig som PDF, og vi dikter ikke
// opp kapittelnumre. Se PLAN-HOST26-MODULER.md §5.
// ---------------------------------------------------------------------------

/** Hvor langt modulen er kommet i å bli bygget etter oppgave-arkitekturen i §3. */
type ByggStatus =
  /** Egen modulside med alle fem oppgavetypene. */
  | "modulside"
  /** Stoffet finnes og er interaktivt, men er ikke pakket som modul ennå. */
  | "temasider"
  /** Overbygning utenfor pensum. */
  | "overbygning";

type ModulLenke = {
  slug: string;
  label: string;
  /** Kort om hva siden gir deg som de andre ikke gir. */
  rolle: string;
  /** Inngangen til modulen — får tydeligere styling. */
  primaer?: boolean;
};

type Modul = {
  nr: string;
  navn: string;
  Icon: typeof BarChart3;
  /** Én setning om hva modulen handler om, uten symboler. */
  handlerOm: string;
  /** Sjekkpunktet: hva du skal kunne gjøre uten hjelp når modulen er ferdig. */
  sjekkpunkt: string;
  /** Sporene i plan-tek-1501.md som modulen dekker. */
  spor: string;
  bygg: ByggStatus;
  lenker: ModulLenke[];
};

const MODULER: Modul[] = [
  {
    nr: "1",
    navn: "Data",
    Icon: BarChart3,
    handlerOm:
      "Å beskrive en haug med målinger med noen få tall — hvor de ligger, hvor mye de spriker, og når hvert av målene lyver.",
    sjekkpunkt:
      "Gitt et datasett: velg riktig sentralmål og spredningsmål, regn dem ut for hånd, og begrunn valget mellom n og n − 1 ut fra om dataene er et utvalg eller en hel populasjon.",
    spor: "Spor A (A1–A6)",
    bygg: "modulside",
    lenker: [
      {
        slug: "tek1-modul1-data",
        label: "Modul 1 — Data",
        rolle: "Selve modulen: anslå → simulér → regn → feilsøk → recall.",
        primaer: true,
      },
      {
        slug: "tek1-deskriptiv",
        label: "Deskriptiv statistikk",
        rolle: "Utdypning: flere plottyper, skjevhet, Simpsons paradoks.",
      },
    ],
  },
  {
    nr: "2",
    navn: "Sannsynlighet",
    Icon: Dice5,
    handlerOm:
      "Å regne på utfall før de har skjedd: telle muligheter, og oppdatere troen sin når ny informasjon kommer inn.",
    sjekkpunkt:
      "Gitt en tekstoppgave: avgjør om rekkefølgen teller og om det trekkes med tilbakelegging, sett opp riktig telleformel, og bruk Bayes når oppgaven gir deg den ene betingingen og spør etter den andre.",
    spor: "Spor B (B1–B9)",
    bygg: "modulside",
    lenker: [
      {
        slug: "tek1-modul2-sannsynlighet",
        label: "Modul 2 — Sannsynlighet",
        rolle: "Selve modulen: anslå → simulér → regn → feilsøk → recall.",
        primaer: true,
      },
      {
        slug: "tek1-sannsynlighet",
        label: "Sannsynlighet og mengdelære",
        rolle: "Utdypning: Venn-diagram, aksiomene, flere Bayes-varianter.",
      },
      {
        slug: "tek1-kombinatorikk",
        label: "Kombinatorikk",
        rolle: "Utdypning: Pascals trekant, trekksimulator, match-quiz.",
      },
    ],
  },
  {
    nr: "3",
    navn: "Stokastiske variabler og fordelinger",
    Icon: Sigma,
    handlerOm:
      "Å bytte ut lista over enkeltutfall med en modell: en funksjon som gir sannsynlighet til hver verdi, og noen få standardformer som dekker det meste.",
    sjekkpunkt:
      "Gitt en beskrevet situasjon: identifiser riktig fordeling og dens parametere, regn ut en sannsynlighet fra den, og forklar hvorfor gjennomsnittet av mange observasjoner blir normalfordelt uansett hvor skjev grunnfordelingen er.",
    spor: "Spor C (C1–C13)",
    bygg: "modulside",
    lenker: [
      {
        slug: "tek1-modul3-fordelinger",
        label: "Modul 3 — Stokastiske variabler og fordelinger",
        rolle: "Selve modulen: anslå → simulér → regn → feilsøk → recall.",
        primaer: true,
      },
      {
        slug: "tek1-fordelinger",
        label: "Fordelings-velgeren",
        rolle: "Utdypning: hvilken fordeling passer på hvilken situasjon?",
      },
      {
        slug: "tek1-diskrete-fordelinger",
        label: "Diskrete fordelinger",
        rolle: "Binomisk, Poisson, hypergeometrisk med live sannsynlighetsplott.",
      },
      {
        slug: "tek1-kontinuerlige-fordelinger",
        label: "Kontinuerlige fordelinger",
        rolle: "Normal, eksponential, t og kji-kvadrat med dragbart areal.",
      },
      {
        slug: "tek1-forventning-clt",
        label: "Forventning, varians og sentralgrenseteoremet",
        rolle: "Simulatoren som viser hvorfor normalfordelingen dukker opp overalt.",
      },
      {
        slug: "tek1-distribusjons-plotter",
        label: "Distribusjons-plotter",
        rolle: "Oppslagsverk: slå opp kritiske verdier og se formen live.",
      },
    ],
  },
  {
    nr: "4",
    navn: "Inferens og regresjon",
    Icon: Target,
    handlerOm:
      "Å trekke konklusjoner om populasjonen fra ett utvalg — og å tallfeste hvor usikre konklusjonene er.",
    sjekkpunkt:
      "Gitt et datasett og et spørsmål: velg riktig test, sett opp hypotesene, regn ut testobservator og p-verdi, og tolk resultatet uten å påstå at p-verdien er sannsynligheten for at hypotesen er sann.",
    spor: "Spor D og E (D1–D14, E1–E5)",
    bygg: "modulside",
    lenker: [
      {
        slug: "tek1-modul4-inferens",
        label: "Modul 4 — Inferens og regresjon",
        rolle: "Selve modulen: anslå → simulér → regn → feilsøk → recall.",
        primaer: true,
      },
      {
        slug: "tek1-inferens-sampling",
        label: "Fra utvalg til populasjon",
        rolle: "Utdypning: standardfeil og hvorfor ett utvalg ikke er fasit.",
      },
      {
        slug: "tek1-estimering-ki",
        label: "Estimering og konfidensintervall",
        rolle: "100-utvalgs-simulatoren som viser hva «95 %» faktisk betyr.",
      },
      {
        slug: "tek1-hypotesetest-regresjon",
        label: "Hypotesetest og regresjon",
        rolle: "Type I/II-feil, styrke, minste kvadraters metode.",
      },
      {
        slug: "tek1-p-verdi-kalkulator",
        label: "p-verdi-kalkulator",
        rolle: "Verktøy: testverdi inn, p-verdi og halearealet ut.",
      },
      {
        slug: "tek1-statistisk-analyse",
        label: "Statistisk analyse — samlet",
        rolle: "Bindeleddet: hele kjeden fra data til konklusjon i ett løp.",
      },
      {
        slug: "tek1-proporsjoner",
        label: "Inferens for andeler",
        rolle: "Når svaret er en prosent og ikke et gjennomsnitt.",
      },
      {
        slug: "tek1-anova",
        label: "Ettveis ANOVA",
        rolle: "Tre eller flere grupper, uten å kjøre mange t-tester.",
      },
      {
        slug: "tek1-regresjon-diagnostikk",
        label: "Regresjons-diagnostikk",
        rolle: "Sjekk om modellen i det hele tatt hadde lov til å brukes.",
      },
    ],
  },
];

/** Spor F — overbygning, holdt utenfor modulnummereringen med vilje (§3.3). */
const OVERBYGNING = {
  navn: "Resampling og bootstrap",
  handlerOm:
    "Å lage konfidensintervaller ved å trekke nye utvalg fra dataene du allerede har, i stedet for å slå opp en formel.",
  hvorforVerdtTiden:
    "Det gjør konfidensintervallet konkret: du ser fordelingen bli bygget opp foran deg i stedet for å stole på en formel du ikke kan utlede. Kommer ikke på eksamen, men gjør modul 4 lettere å tro på.",
  lenker: [{ slug: "tek1-estimering-ki", label: "Bootstrap-simulatoren (i estimering og KI)" }],
};

/**
 * «Uke 34–35 · kap. 2» — når faget faktisk underviser modulen, fra
 * framdriftsplanen i Canvas. `null` for moduler planen ikke plasserer.
 *
 * Merk at nummereringen her og undervisningsrekkefølgen ikke er den samme:
 * faget tar kapittel 2 (sannsynlighet, appens modul 2) før kapittel 1
 * (beskrivende statistikk, appens modul 1).
 */
function undervisesI(modulNr: string): string | null {
  const modul = modulNr as Tek1501Modul;
  const spenn = ukespennForModul(modul);
  if (!spenn) return null;
  const kapitler = kapitlerForModul(modul);
  return kapitler.length > 0 ? `${spenn} · kap. ${kapitler.join(", ")}` : spenn;
}

const BYGG_STIL: Record<ByggStatus, { label: string; cls: string }> = {
  modulside: {
    label: "Bygget som modul",
    cls: "border-success/30 bg-success/10 text-success",
  },
  temasider: {
    label: "Temasider — modul ikke bygget ennå",
    cls: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
  overbygning: {
    label: "Dypere enn pensum",
    cls: "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300",
  },
};

export function Tek1501ModulOversikt() {
  const alleSlugs = MODULER.flatMap((m) => m.lenker.map((l) => l.slug));

  return (
    <section id="moduler" className="mb-12 scroll-mt-28">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <CalendarClock className="h-5 w-5 text-brand" />
        <h2 className="text-xl font-semibold">Modul for modul</h2>
        <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300">
          Eksamen 14.12.2026 · 3 timer skriftlig
        </span>
      </div>
      <p className="mb-4 max-w-2xl text-sm text-muted-foreground">
        Fire moduler i undervisningsrekkefølge. Hver av dem er ferdig først når du kan gjøre det som
        står under «du skal kunne» — ikke når temaet er lest. Alle fire har nå en egen modulside som
        tar deg gjennom hele runden: anslå, simulér, regn, feilsøk, repetér. Temasidene under hver
        modul er utdypning du går til etterpå, når du vil grave dypere i én ting.
      </p>

      {/*
        Den ene tingen som er lett å gå glipp av: modulnummeret her og
        undervisningsrekkefølgen er ikke den samme. Framdriftsplanen tar
        kapittel 2 først. Står dette ikke øverst, begynner man på modul 1 og
        ligger to uker feil i forhold til forelesningene.
      */}
      <div className="mb-4 rounded-xl border border-amber-500/40 bg-amber-500/5 p-4 text-sm">
        <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300">
          Rekkefølgen faget faktisk følger
        </div>
        <p className="leading-relaxed text-foreground">
          Framdriftsplanen underviser <strong>kapittel 2 før kapittel 1</strong>:
          sannsynlighetsregning i uke 34–35, beskrivende statistikk i uke 36–37. Begynn altså på{" "}
          <strong>modul 2 — Sannsynlighet</strong>, ikke modul 1. Modulnummeret under er appens
          egen tema-rekkefølge, og ukemerket til høyre viser når faget tar det.{" "}
          <Link to="/semesterplan" className="text-brand underline">
            Hele semesterplanen
          </Link>
          .
        </p>
      </div>

      <div className="mb-6 rounded-xl border border-border bg-card p-4">
        <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Framdrift på tvers av alle fire moduler
        </div>
        <ModulProgressBar trinnSlugs={alleSlugs} />
      </div>

      <div className="space-y-4">
        {MODULER.map((m) => {
          const Icon = m.Icon;
          const modulSlugs = m.lenker.map((l) => l.slug);
          const stil = BYGG_STIL[m.bygg];
          return (
            <div key={m.nr} className="rounded-xl border border-border bg-card p-5">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand/15 text-sm font-bold text-brand">
                  {m.nr}
                </span>
                <Icon className="h-4 w-4 text-brand" />
                <h3 className="font-semibold text-foreground">{m.navn}</h3>
                <ModulStatusBadge trinnSlugs={modulSlugs} />
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${stil.cls}`}
                >
                  {stil.label}
                </span>
                <span className="ml-auto text-[10px] uppercase tracking-wider text-muted-foreground">
                  {undervisesI(m.nr) ?? m.spor}
                </span>
              </div>

              <p className="text-sm leading-relaxed text-muted-foreground">{m.handlerOm}</p>

              <div className="mt-3 rounded-lg border border-brand/25 bg-brand/5 p-3 text-sm">
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-brand">
                  Du skal kunne, uten hjelp
                </div>
                <div className="leading-relaxed text-foreground">{m.sjekkpunkt}</div>
              </div>

              <ul className="mt-3 space-y-1.5">
                {m.lenker.map((l) => (
                  <li key={l.slug}>
                    <Link
                      to="/stack/$slug"
                      params={{ slug: l.slug }}
                      className={`group flex flex-wrap items-baseline gap-x-2 gap-y-0.5 rounded-lg border px-3 py-2 text-sm transition-colors ${
                        l.primaer
                          ? "border-brand/40 bg-brand/5 hover:border-brand"
                          : "border-border bg-background hover:border-brand/40"
                      }`}
                    >
                      <span
                        className={
                          l.primaer ? "font-medium text-brand" : "font-medium text-foreground"
                        }
                      >
                        {l.label}
                      </span>
                      <span className="text-xs text-muted-foreground">{l.rolle}</span>
                      <ArrowRight className="ml-auto h-3.5 w-3.5 shrink-0 self-center text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="mt-3">
                <ModulProgressBar trinnSlugs={modulSlugs} />
              </div>
            </div>
          );
        })}

        {/* Spor F — overbygning, eksplisitt utenfor pensum (§3.3). */}
        <div className="rounded-xl border-2 border-dashed border-violet-500/40 bg-violet-500/5 p-5">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Sparkles className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            <h3 className="font-semibold text-foreground">{OVERBYGNING.navn}</h3>
            <span
              className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${BYGG_STIL.overbygning.cls}`}
            >
              {BYGG_STIL.overbygning.label}
            </span>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">{OVERBYGNING.handlerOm}</p>
          <p className="mt-2 text-sm leading-relaxed text-foreground">
            <strong>Hvorfor det er verdt tiden:</strong> {OVERBYGNING.hvorforVerdtTiden}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {OVERBYGNING.lenker.map((l) => (
              <Link
                key={l.slug}
                to="/stack/$slug"
                params={{ slug: l.slug }}
                className="inline-flex items-center gap-1.5 rounded-md border border-violet-500/40 bg-background px-3 py-1.5 text-sm text-foreground transition-colors hover:border-violet-500"
              >
                {l.label}
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      <ProvisoriskKapittelnote className="mt-4" />
    </section>
  );
}
